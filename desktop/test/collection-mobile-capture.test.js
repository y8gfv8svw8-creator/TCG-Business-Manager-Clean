const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { CollectionCaptureServer } = require('../app/main/collection-capture-server');
const { addMobileCardToState } = require('../app/main/collection-mobile-capture');
const collectionModel = require('../app/shared/collection-photo-model');
const { TcgDatabase } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const candidate = (version, id) => ({ id: `variant-${version}`, germanName: 'Testkarte', englishName: 'Test Card', setName: 'Test Set', setCode: 'TEST-DE001', rarity: 'Ultra Rare', version, cardmarketProductId: id, mappingStatus: 'exact', verified: true, dataSource: `verified-${version}` });
const recognition = rarity => rarity ? {
  setCode: 'TEST-DE001', selectedRarity: rarity, rarityOptions: [{ value: 'Ultra Rare', count: 2 }, { value: 'Starlight Rare', count: 1 }],
  requiresRaritySelection: false, requiresVersionSelection: true, mappingStatus: 'unresolved', resolutionStatus: 'version_selection_required',
  referenceCandidates: [], variantCandidates: [candidate('V.1', '111111'), candidate('V.2', '222222')]
} : {
  setCode: 'TEST-DE001', rarityOptions: [{ value: 'Ultra Rare', count: 2 }, { value: 'Starlight Rare', count: 1 }],
  requiresRaritySelection: true, requiresVersionSelection: false, mappingStatus: 'unresolved', resolutionStatus: 'rarity_selection_required', referenceCandidates: [], variantCandidates: []
};

function stateFixture() {
  return {
    activeCollectionAnalysisId: 'collection-mobile',
    inventory: [{ id: 'existing', productId: '999999', name: 'Vorhandener Bestand' }],
    collectionPurchaseAnalyses: [{ id: 'collection-mobile', title: 'Mobiler Testankauf', captureStatus: 'active', photos: [], photoObservations: [], physicalCards: [], economicReview: { status: 'allocated', allocation: { totalCents: 100 } } }]
  };
}

function post(url, pathName, body) {
  const target = new URL(pathName, url);target.search = new URL(url).search;
  return fetch(target, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}

test('mobile LAN-Sitzung prüft Token, bildet den Workflow ab und speichert Requests idempotent', async t => {
  const created = [];
  const server = new CollectionCaptureServer({
    onResolve: ({ setCode, rarity }) => ({ ...recognition(rarity), setCode }),
    onSearch: () => [{ productId: '333333', germanName: 'Manuelle Karte', setCode: 'MAN-DE001', rarity: 'Rare' }],
    onCreateCard: ({ session, input }) => { const row = { observation: { id: `mobile-${created.length + 1}`, analysisId: session.analysisId, manualCapture: { ...input } }, analysisId: session.analysisId };created.push(row);return row; }
  });
  t.after(() => server.stop());
  const info = await server.start({ analysisId: 'collection-mobile', analysisTitle: 'Mobiler Testankauf' });
  assert.equal(info.running, true);
  assert.match(info.qrDataUrl, /^data:image\/png;base64,/);
  assert.match(info.url, /^http:\/\//);

  const page = await fetch(info.localUrl);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Setcode/);
  assert.match(html, /Rarität/);
  assert.match(html, /Version \/ Print/);
  assert.match(html, /Ziel-\/Verkaufspreis/);
  assert.match(html, /Speichern &amp; nächste Karte/);

  const sessionUrl = new URL('/api/session', info.localUrl);sessionUrl.search = new URL(info.localUrl).search;
  const sessionResponse = await fetch(sessionUrl);
  assert.equal(sessionResponse.status, 200);
  assert.equal((await sessionResponse.json()).analysisId, 'collection-mobile');
  const invalid = new URL(sessionUrl);invalid.searchParams.set('token', 'ungueltig');
  assert.equal((await fetch(invalid)).status, 403);

  const rarityResponse = await post(info.localUrl, '/api/resolve', { setCode: 'TEST-DE001' });
  assert.equal(rarityResponse.status, 200);
  assert.equal((await rarityResponse.json()).recognition.requiresRaritySelection, true);
  const versionResponse = await post(info.localUrl, '/api/resolve', { setCode: 'TEST-DE001', rarity: 'Ultra Rare' });
  assert.equal((await versionResponse.json()).recognition.requiresVersionSelection, true);
  const searchResponse = await post(info.localUrl, '/api/search', { query: 'Manuelle Karte' });
  assert.equal((await searchResponse.json()).products[0].productId, '333333');

  const submission = { requestId: 'request-1', setCode: 'TEST-DE001', rarity: 'Ultra Rare', candidateId: 'variant-V.2', cardmarketProductId: '222222', condition: 'EX', edition: 'Unlimited', quantity: 2, targetSell: '8.50' };
  const first = await post(info.localUrl, '/api/cards', submission);
  assert.equal(first.status, 200);
  assert.equal((await first.json()).duplicate, false);
  const duplicate = await post(info.localUrl, '/api/cards', submission);
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);
  assert.equal(created.length, 1);
  assert.equal(created[0].analysisId, 'collection-mobile');
  assert.equal(created[0].observation.manualCapture.targetSell, '8.50');

  server.expireSession();
  assert.equal((await fetch(sessionUrl)).status, 403);
  assert.equal(server.status().running, false);
});

test('ohne aktiven Sammlungsankauf kann keine mobile Sitzung erstellt werden', async () => {
  const server = new CollectionCaptureServer();
  await assert.rejects(server.start({}), /Kein aktiver Sammlungsankauf/);
  assert.equal(server.status().running, false);
});

test('Manager-Neustart beendet die flüchtige mobile Sitzung', async () => {
  const first = new CollectionCaptureServer();
  const info = await first.start({ analysisId: 'collection-mobile', analysisTitle: 'Mobiler Testankauf' });
  assert.equal(first.status().running, true);
  await first.stop();
  assert.equal(first.status().running, false);
  await assert.rejects(fetch(info.localUrl));
  const restarted = new CollectionCaptureServer();
  assert.equal(restarted.status().running, false, 'eine neue Manager-Instanz kennt das alte Token nicht');
});

test('mobile Karte wird nur dem gebundenen Ankauf hinzugefügt und verändert keinen Bestand', () => {
  const state = stateFixture(), inventoryBefore = structuredClone(state.inventory);
  const result = addMobileCardToState(state, {
    analysisId: 'collection-mobile', sessionId: 'session-1', observationId: 'observation-mobile-1', now: '2026-09-27T10:00:00.000Z',
    recognition: recognition('Ultra Rare'),
    input: { requestId: 'request-1', setCode: 'TEST-DE001', rarity: 'Ultra Rare', candidateId: 'variant-V.2', cardmarketProductId: '222222', condition: 'EX', edition: 'Unlimited', quantity: 2, targetSell: '8.50' }
  });
  assert.equal(result.duplicate, false);
  assert.equal(result.analysisId, 'collection-mobile');
  assert.equal(result.observation.selectedProductId, '222222');
  assert.equal(result.observation.printConfidence, 'confirmed');
  assert.equal(result.observation.printRecognition.selectedVersion, 'V.2');
  assert.equal(result.observation.manualCapture.condition, 'EX');
  assert.equal(result.observation.manualCapture.edition, 'Unlimited');
  assert.equal(result.observation.manualCapture.quantity, 2);
  assert.equal(result.observation.manualCapture.targetSell, 8.5);
  assert.deepEqual(state.inventory, inventoryBefore);
  assert.equal(state.collectionPurchaseAnalyses[0].economicReview.status, 'draft');
  assert.equal(state.collectionPurchaseAnalyses[0].economicReview.allocation, null);
  const duplicate = addMobileCardToState(state, { analysisId: 'collection-mobile', sessionId: 'session-1', recognition: recognition('Ultra Rare'), input: { requestId: 'request-1', setCode: 'TEST-DE001', rarity: 'Ultra Rare', condition: 'EX', edition: 'Unlimited', quantity: 2, targetSell: 8.5 } });
  assert.equal(duplicate.duplicate, true);
  assert.equal(state.collectionPurchaseAnalyses[0].photoObservations.length, 1);
  assert.throws(() => addMobileCardToState(state, { analysisId: 'anderer-ankauf', sessionId: 'session-1', input: { requestId: 'request-2', setCode: 'TEST-DE001', condition: 'NM', edition: '', quantity: 1 } }), /nicht mehr vorhanden/);
});

test('likely oder unresolved bleibt sichtbar ungeprüft und erhält keine erfundene Cardmarket-ID', () => {
  const state = stateFixture();
  const result = addMobileCardToState(state, {
    analysisId: 'collection-mobile', sessionId: 'session-2', observationId: 'observation-mobile-2',
    recognition: { setCode: 'EEN-DE037', mappingStatus: 'likely', resolutionStatus: 'likely_candidate', rarityOptions: [{ value: 'Super Rare', count: 1 }], referenceCandidates: [{ id: 'likely-1', germanName: 'Topf der Trägheit', setCode: 'EEN-EN037', rarity: 'Super Rare', mappingStatus: 'likely', verified: false }], variantCandidates: [] },
    input: { requestId: 'request-2', setCode: 'EEN-DE037', rarity: 'Super Rare', candidateId: 'likely-1', condition: 'NM', edition: '1st', quantity: 1, targetSell: '' }
  });
  assert.equal(result.observation.printRecognition.mappingStatus, 'likely');
  assert.equal(result.observation.printConfidence, 'unknown');
  assert.equal(result.observation.selectedProductId, '');
  assert.match(result.observation.recognitionSignals.join(' '), /Ungeprüft - bitte selbst prüfen/);
});

test('mobile Beobachtungen ohne Foto bleiben lokal in SQLite erhalten', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-mobile-collection-'));
  const database = new TcgDatabase({ databasePath: path.join(root, 'data.sqlite'), schemaPath, backupRoot: path.join(root, 'backups') }).open();
  t.after(() => { database.close();fs.rmSync(root, { recursive: true, force: true }); });
  const state = stateFixture();
  addMobileCardToState(state, { analysisId: 'collection-mobile', sessionId: 'session-3', observationId: 'observation-mobile-3', recognition: recognition('Ultra Rare'), input: { requestId: 'request-3', setCode: 'TEST-DE001', rarity: 'Ultra Rare', candidateId: 'variant-V.1', cardmarketProductId: '111111', condition: 'NM', edition: '1st', quantity: 1, targetSell: 5 } });
  database.saveState(state);
  const loaded = database.loadState().state;
  assert.equal(loaded.collectionPurchaseAnalyses[0].photoObservations.length, 1);
  assert.equal(loaded.collectionPurchaseAnalyses[0].photoObservations[0].observationSource, 'mobile');
  assert.equal(loaded.collectionPurchaseAnalyses[0].photoObservations[0].manualCapture.targetSell, 5);
  assert.equal(loaded.inventory.length, 1);
  assert.equal(loaded.inventory[0].id, 'existing');
  assert.equal(loaded.inventory.some(row => row.sourceCollectionPurchaseId === 'collection-mobile'), false);
  assert.equal(collectionModel.summarizeCaptureProgress(loaded.collectionPurchaseAnalyses[0]).completedCount, 1);
});

test('PC-Seite verbindet QR-Sitzung und aktualisiert mobile Karten ohne Seitenreload', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'app', 'renderer', 'index.html'), 'utf8');
  const renderer = fs.readFileSync(path.join(root, 'app', 'renderer', 'app.js'), 'utf8');
  const preload = fs.readFileSync(path.join(root, 'app', 'main', 'preload.js'), 'utf8');
  const main = fs.readFileSync(path.join(root, 'app', 'main', 'main.js'), 'utf8');
  assert.match(html, /id="startCollectionMobileCaptureBtn"[^>]*>Handy verbinden/);
  assert.match(html, /id="collectionMobileCaptureQr"/);
  assert.match(html, /id="stopCollectionMobileCaptureBtn"/);
  assert.match(preload, /startCollectionMobileCapture: payload => ipcRenderer\.invoke\('collection-mobile:start'/);
  assert.match(preload, /onCollectionMobileCardAdded/);
  assert.match(main, /state\.activeCollectionAnalysisId[\s\S]*collectionCaptureServer\.start/);
  assert.match(renderer, /onCollectionMobileCardAdded\?\.\(payload=>receiveCollectionMobileCard\(payload\)\)/);
  assert.match(renderer, /function receiveCollectionMobileCard\(payload=\{\}\)[\s\S]*renderCollectionPurchases\(\)/);
  const receiver = renderer.match(/function receiveCollectionMobileCard\(payload=\{\}\)\{[\s\S]*?\n\}/)?.[0] || '';
  assert.doesNotMatch(receiver, /inventory\.push|transferCollectionPurchaseToInventory|applyCollectionInventoryTransfer/);
});
