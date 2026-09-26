const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../app/shared/collection-photo-model');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'app', 'renderer', 'index.html'), 'utf8');
const renderer = fs.readFileSync(path.join(root, 'app', 'renderer', 'app.js'), 'utf8');
const collectionPage = html.match(/<section id="view-collectionpurchases"[\s\S]*?<section id="view-cardmarket"/)?.[0] || '';

test('Sammlungsankauf zeigt nur den neuen produktiven Erfassungsaufbau', () => {
  assert.match(collectionPage, /Neuen Sammlungsankauf starten/);
  assert.match(collectionPage, /Offenen Ankauf fortsetzen/);
  assert.match(collectionPage, /<h2>Aktiver Ankauf<\/h2>/);
  assert.match(collectionPage, /<h2>Karten erfassen<\/h2>/);
  assert.match(collectionPage, /<h2>Fortschritt<\/h2>/);
  assert.match(collectionPage, /<h2>Erfasste Karten<\/h2>/);
  assert.doesNotMatch(collectionPage, /<h2>Schnelle Kartenerfassung<\/h2>/);
  assert.doesNotMatch(collectionPage, /<h2>Händlerentscheidung<\/h2>/);
  assert.doesNotMatch(collectionPage, /<h2>Kartenpositionen<\/h2>/);
  assert.match(collectionPage, /class="collection-legacy-compatibility" hidden/);
});

test('Aktiver Ankauf enthält Stammdaten Schnellworkflow Fortschritt und bearbeitbare Kartenliste', () => {
  for (const id of ['collectionTitle', 'collectionSellerName', 'collectionDate', 'collectionSellerPrice', 'collectionCaptureStatus']) {
    assert.match(collectionPage, new RegExp(`id="${id}"`));
  }
  for (const id of ['collectionObservationSetCode', 'collectionObservationReferenceRarity', 'collectionObservationReferenceVersion', 'collectionObservationManualCondition', 'collectionObservationManualEdition', 'collectionObservationManualQuantity']) {
    assert.match(collectionPage, new RegExp(`id="${id}"`));
  }
  assert.match(collectionPage, /id="collectionCaptureProgress"/);
  assert.match(collectionPage, /id="collectionCapturedCardsTable"/);
  assert.match(renderer, /data-edit-captured-observation/);
});

test('Fortschrittszählung verändert historische Sammlungsankauf-Daten nicht', () => {
  const analysis = {
    id: 'historical-purchase',
    title: 'Historischer Ankauf',
    items: [{ id: 'legacy-item', productId: '123', quantity: 2 }],
    decisionSnapshots: [{ id: 'snapshot-1', decision: 'PRÜFEN' }],
    photos: [{ id: 'photo-1', analysisId: 'historical-purchase', sequence: 1 }],
    physicalCards: [],
    photoObservations: [
      { id: 'done', photoId: 'photo-1', boundingBox: { x: .1, y: .1, width: .2, height: .3 }, detectionReviewState: 'manual', manualCapture: { completedAt: '2026-09-26T10:00:00.000Z' }, printRecognition: { mappingStatus: 'exact' } },
      { id: 'detail', photoId: 'photo-1', boundingBox: { x: .4, y: .1, width: .2, height: .3 }, detectionReviewState: 'manual', detailPhotoRequired: true, printRecognition: { mappingStatus: 'unresolved' } }
    ]
  };
  const before = JSON.parse(JSON.stringify(analysis));
  assert.deepEqual(model.summarizeCaptureProgress(analysis), {
    observationCount: 2,
    completedCount: 1,
    pendingCount: 1,
    detailPhotoRequiredCount: 1,
    unresolvedCount: 1
  });
  assert.deepEqual(analysis, before);
});

test('Neue Seitenrendering löst weder Bestandsübernahme noch EK-Berechnung aus', () => {
  const start = renderer.indexOf('function renderCollectionPurchases(){');
  const end = renderer.indexOf('function renderLegacyCollectionPurchases(){', start);
  const rendering = start >= 0 && end > start ? renderer.slice(start, end) : '';
  assert.ok(rendering.length > 0);
  assert.doesNotMatch(rendering, /confirmCollectionPurchase|linkedPurchaseId|analysis\.items\.push|calculateCollectionAnalysis/);
  assert.match(rendering, /renderCollectionCaptureProgress/);
  assert.match(rendering, /renderCollectionCapturedCards/);
});
