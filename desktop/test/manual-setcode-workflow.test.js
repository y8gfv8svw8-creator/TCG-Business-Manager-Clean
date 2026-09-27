const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../app/shared/collection-photo-model');
const { PrintReferenceDatabase } = require('../app/main/print-reference-database');

test('manuelle Setcode-Erfassung bewahrt Zustand Edition Menge und Ziel-VK ohne Bestandsposition', () => {
  const observation = model.normalizeObservation({
    id: 'observation-1',
    photoId: 'photo-1',
    boundingBox: { x: .1, y: .1, width: .3, height: .5 },
    manualCapture: {
      setCode: ' een-de037 ',
      setCodeConfirmed: true,
      condition: 'nm',
      edition: '1ST',
      quantity: 2,
      targetSell: 4.759,
      completedAt: '2026-09-26T10:00:00.000Z'
    }
  }, 'analysis-1');
  assert.deepEqual(observation.manualCapture, {
    setCode: 'EEN-DE037',
    setCodeConfirmed: true,
    condition: 'NM',
    edition: '1st',
    quantity: 2,
    targetSell: 4.76,
    completedAt: '2026-09-26T10:00:00.000Z',
    updatedAt: ''
  });
  assert.equal(observation.linkedCollectionItemId, '');
  assert.equal(observation.selectedProductId, '');
});

test('Beispiel-Setcodes werden lokal gefunden und Mehrdeutigkeiten bleiben sichtbar', t => {
  const database = new PrintReferenceDatabase({ databasePath: path.join(__dirname, '..', 'resources', 'print-reference.sqlite') }).open();
  t.after(() => database.close());
  const cases = ['EEN-DE037', 'STON-DE024', 'PSV-093', 'LON-G006'];
  for (const setCode of cases) assert.ok(database.findPrintCandidates({ setCode }).length >= 1, `${setCode} fehlt`);
  assert.equal(database.resolveCollectionRecognition({ setCode: 'EEN-DE037' }).requiresRaritySelection, true);
  assert.equal(database.resolveCollectionRecognition({ setCode: 'STON-DE024' }).requiresRaritySelection, true);
  assert.equal(database.resolveCollectionRecognition({ setCode: 'NICHT-DA' }).resolutionStatus, 'no_reference_match');
});

test('MAMO-DE001 behält über den Collector-Fallback die bekannte Metakarte und den englischen Namen', t => {
  const database = new PrintReferenceDatabase({ databasePath: path.join(__dirname, '..', 'resources', 'print-reference.sqlite') }).open();
  t.after(() => database.close());
  const recognition = database.resolveCollectionRecognition({ setCode: 'MAMO-DE001', rarity: 'Ultra Rare' });
  const identity = model.uniqueRecognitionMetacard(recognition);
  assert.equal(recognition.mappingStatus, 'likely');
  assert.equal(recognition.referenceCandidates[0].setCodeMatch, 'collector_fallback');
  assert.equal(identity?.internalMetacardId, 'ygoprodeck:88570003');
  assert.equal(identity?.germanName, '');
  assert.equal(identity?.englishName, "Dark Magician, the Pharaoh's Servant");
});

test('bekannte Metakarte zeigt DE vor EN und bleibt auch bei mehreren Prints benannt', () => {
  const base = { internalMetacardId: 'meta-1', metacardId: 'meta-1', englishName: 'Known Card', setCode: 'TEST-EN001', mappingStatus: 'likely', verified: false };
  const observation = model.normalizeObservation({ id: 'known', photoId: 'photo', selectedName: '', nameCandidates: [], printRecognition: { mappingStatus: 'likely', referenceCandidates: [{ ...base, id: 'a', germanName: 'Bekannte Karte', rarity: 'Rare' }, { ...base, id: 'b', germanName: 'Bekannte Karte', rarity: 'Ultra Rare' }] } }, 'analysis');
  model.applyRecognitionMetacardIdentity(observation, observation.printRecognition);
  assert.equal(observation.selectedName, 'Bekannte Karte');
  assert.equal(observation.metacardId, 'meta-1');
  const englishOnly = { selectedName: '', nameCandidates: [], nameConfidence: 'unknown' };
  model.applyRecognitionMetacardIdentity(englishOnly, { mappingStatus: 'unresolved', referenceCandidates: [{ ...base, id: 'c', germanName: '' }] });
  assert.equal(englishOnly.selectedName, 'Known Card');
  const unknown = { selectedName: '', nameCandidates: [], nameConfidence: 'unknown' };
  assert.equal(model.applyRecognitionMetacardIdentity(unknown, { mappingStatus: 'unresolved', referenceCandidates: [] }), null);
  assert.equal(unknown.selectedName, '');
});

test('UI bietet Live-Setcode Eingabe Tastaturfolge und manuelle Suche ohne automatische Übernahme', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'app', 'renderer', 'index.html'), 'utf8');
  const renderer = fs.readFileSync(path.join(root, 'app', 'renderer', 'app.js'), 'utf8');
  assert.match(html, /id="collectionObservationSetCode"(?![^>]*readonly)/);
  assert.match(html, /id="startCollectionManualCardBtn"[^>]*>Karte manuell erfassen/);
  assert.match(html, /id="collectionObservationManualCondition"/);
  assert.match(html, /id="collectionObservationManualEdition"/);
  assert.match(html, /id="collectionObservationManualQuantity"/);
  assert.match(html, /id="collectionObservationManualTargetSell"/);
  assert.match(html, /id="collectionObservationManualSearchBtn"/);
  assert.match(html, /id="completeCollectionManualCardBtn"/);
  assert.match(renderer, /lookupManualCollectionSetCode\(observation,value\)/);
  assert.match(renderer, /startCollectionManualCardCapture/);
  assert.match(renderer, /applyRecognitionMetacardIdentity/);
  assert.match(renderer, /focusNextCollectionManualStep\(observation\)/);
  assert.match(renderer, /collectionObservationManualQuantity[\s\S]*collectionObservationManualTargetSell[\s\S]*completeCollectionManualCard/);
  const completion = renderer.match(/function completeCollectionManualCard\(\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(completion, /analysis\.items\.push|addSelectedCollectionCard|confirmCollectionPurchase|linkedPurchaseId/);
});
