const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const model = require('../app/shared/collection-photo-model');
const cardSearch = require('../app/shared/card-search');
const automation = require('../app/shared/business-automation');
const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');
const { CollectionPhotoStore, MAX_IMAGE_BYTES } = require('../app/main/collection-photo-store');

const schemaPath = path.resolve(__dirname, '../database/schema.sql');
const png = () => Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64');
const sandbox = (t, prefix = 'tcg-photo-') => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, dataRoot: path.join(root, 'data'), backupRoot: path.join(root, 'backups'), databasePath: path.join(root, 'tcg.sqlite') };
};

test('Bounding Boxes werden normalisiert und ungültige Ausschnitte abgelehnt', () => {
  assert.deepEqual(model.normalizeBoundingBox({ x: .1, y: .2, width: .3, height: .4 }), { x: .1, y: .2, width: .3, height: .4 });
  assert.equal(model.normalizeBoundingBox({ x: -.1, y: 0, width: .2, height: .2 }), null);
  assert.equal(model.normalizeBoundingBox({ x: .9, y: .1, width: .2, height: .2 }), null);
  assert.equal(model.normalizeBoundingBox({ x: 0, y: 0, width: 0, height: .2 }), null);
});

test('Namens- und Print-Kandidaten sowie ihre Sicherheiten bleiben getrennt', () => {
  const observation = model.normalizeObservation({
    id: 'o1', photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 },
    nameCandidates: [{ name: 'Blitzsturm', englishName: 'Lightning Storm' }],
    nameConfidence: 'high', printCandidates: [{ productId: '123', setName: 'Test', collectorNumber: 'ABC-DE001' }],
    printConfidence: 'low'
  }, 'a1');
  assert.equal(observation.nameCandidates[0].name, 'Blitzsturm');
  assert.equal(observation.printCandidates[0].productId, '123');
  assert.equal(observation.nameConfidence, 'high');
  assert.equal(observation.printConfidence, 'low');
});

test('unbekannte Name- und Print-Sicherheit bleiben ausdrücklich unknown', () => {
  const observation = model.normalizeObservation({ photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 } }, 'a1');
  assert.equal(observation.nameConfidence, 'unknown');
  assert.equal(observation.printConfidence, 'unknown');
});

test('Setcode-Signal allein bestätigt niemals einen Print', () => {
  const observation = model.normalizeObservation({
    photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 },
    recognitionSignals: ['Setcode ABC-DE001 gelesen'], printConfidence: 'confirmed'
  }, 'a1');
  assert.equal(observation.printConfidence, 'unknown');
  assert.equal(model.isPrintExplicitlyConfirmed(observation), false);
});

test('Setcode-OCR und lokale Referenzkandidaten bleiben als unbestätigte Signale gespeichert', () => {
  const observation = model.normalizeObservation({
    photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 },
    printRecognition: {
      setCode: 'CORI-EN081', setCodeConfidence: 87.66,
      setCodeSignals: [{ setCode: 'CORI-EN081', confidence: 87.66, rawText: 'CORI-EN081', variant: 'red' }],
      mappingStatus: 'unresolved', resolutionStatus: 'rarity_selection_required',
      rarityOptions: [{ value: 'Ultra Rare', count: 1 }, { value: 'Starlight Rare', count: 1 }],
      referenceCandidates: [{ id: 'reference:1', englishName: 'Witness of the Ancient', setCode: 'CORI-EN081', rarity: 'Ultra Rare', mappingStatus: 'likely' }]
    }
  }, 'a1');
  assert.equal(observation.printRecognition.setCode, 'CORI-EN081');
  assert.equal(observation.printRecognition.setCodeConfidence, 87.7);
  assert.equal(observation.printRecognition.setCodeSignals[0].confidence, 87.7);
  assert.equal(observation.printRecognition.referenceCandidates[0].mappingStatus, 'likely');
  assert.equal(observation.selectedProductId, '');
  assert.equal(observation.printConfidence, 'unknown');
});

test('erneute automatische Printprüfung schützt einen manuell bestätigten Namen und Print', () => {
  const observation = model.normalizeObservation({
    photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 },
    selectedName: 'Manuell bestätigt', nameConfidence: 'confirmed', selectedProductId: '894816', printConfidence: 'confirmed',
    printRecognition: { setCode: 'CORI-EN081', selectedRarity: 'Ultra Rare', selectedVersion: 'V.1', selectedCandidateId: 'variant:v1' }
  }, 'a1');
  model.mergeAutomaticPrintRecognition(observation, {
    setCode: 'MAMO-EN004', selectedRarity: 'Starlight Rare', selectedVersion: 'V.3', selectedCandidateId: 'variant:v3',
    mappingStatus: 'exact', resolutionStatus: 'unique_candidate'
  });
  assert.equal(observation.selectedName, 'Manuell bestätigt');
  assert.equal(observation.selectedProductId, '894816');
  assert.equal(observation.printConfidence, 'confirmed');
  assert.equal(observation.printRecognition.selectedRarity, 'Ultra Rare');
  assert.equal(observation.printRecognition.selectedVersion, 'V.1');
  assert.equal(observation.printRecognition.selectedCandidateId, 'variant:v1');
  assert.equal(observation.printRecognition.manualSelectionProtected, true);
});

test('unlesbarer Setcode speichert den Detailfoto-Status ohne einen Print zu bestätigen', () => {
  const observation = model.normalizeObservation({
    photoId: 'p1', boundingBox: { x: .1, y: .1, width: .3, height: .4 },
    detailPhotoRequired: true, detailPhotoStatus: 'detail-photo-needed', detailPhotoReason: 'setcode_unreadable',
    printRecognition: {
      mappingStatus: 'unresolved', resolutionStatus: 'unreadable_set_code',
      detailPhotoStatus: 'detail-photo-needed', detailPhotoReason: 'setcode_unreadable',
      setCodeValidationStatus: 'setcode_unreadable', setCodeValidationCandidates: []
    }
  }, 'a1');
  assert.equal(observation.detailPhotoRequired, true);
  assert.equal(observation.detailPhotoStatus, 'detail-photo-needed');
  assert.equal(observation.detailPhotoReason, 'setcode_unreadable');
  assert.equal(observation.printRecognition.detailPhotoStatus, 'detail-photo-needed');
  assert.equal(observation.printRecognition.setCodeValidationStatus, 'setcode_unreadable');
  assert.equal(observation.selectedProductId, '');
});

test('verknüpftes Detailfoto wird für die erneute OCR bevorzugt', () => {
  const analysis = {
    photos: [
      { id: 'overview', width: 2400, height: 1800 },
      { id: 'detail', width: 1600, height: 2400, photoType: 'detail' }
    ],
    photoObservations: [
      { id: 'overview-card', photoId: 'overview', physicalCardId: 'physical-1', boundingBox: { x: .1, y: .1, width: .12, height: .25 } },
      { id: 'detail-card', photoId: 'detail', physicalCardId: 'physical-1', boundingBox: { x: .05, y: .04, width: .9, height: .92 } }
    ]
  };
  const source = model.choosePreferredRecognitionSource(analysis, analysis.photoObservations[0]);
  assert.equal(source.photo.id, 'detail');
  assert.equal(source.observation.id, 'detail-card');
  assert.equal(source.explicitDetail, true);
});

test('eine physische Karte auf zwei Fotos wird in der Evidenz nur einmal gezählt', () => {
  const analysis = {
    id: 'a1', photos: [{ id: 'p1' }, { id: 'p2' }],
    physicalCards: [{ id: 'physical-1', linkedCollectionItemId: 'item-1' }],
    photoObservations: [
      { id: 'o1', photoId: 'p1', physicalCardId: 'physical-1', boundingBox: { x: 0, y: 0, width: .4, height: .4 } },
      { id: 'o2', photoId: 'p2', physicalCardId: 'physical-1', boundingBox: { x: .5, y: .5, width: .4, height: .4 } }
    ]
  };
  const summary = model.summarizePhotoEvidence(analysis);
  assert.equal(summary.observationCount, 2);
  assert.equal(summary.observedPhysicalCardCount, 1);
  assert.equal(summary.economicallyLinkedPhysicalCardCount, 1);
});

test('zwei identische Prints dürfen zwei verschiedene physische Karten bleiben', () => {
  const analysis = {
    id: 'a1', photos: [{ id: 'p1' }],
    physicalCards: [{ id: 'physical-1', productId: '123' }, { id: 'physical-2', productId: '123' }],
    photoObservations: [
      { id: 'o1', photoId: 'p1', physicalCardId: 'physical-1', boundingBox: { x: 0, y: 0, width: .4, height: .4 } },
      { id: 'o2', photoId: 'p1', physicalCardId: 'physical-2', boundingBox: { x: .5, y: .5, width: .4, height: .4 } }
    ]
  };
  assert.equal(model.summarizePhotoEvidence(analysis).physicalCardCount, 2);
});

test('unbestätigte Foto-Beobachtungen erzeugen weder Einkauf noch Bestand noch Wert', () => {
  const collection = { sellerPrice: 10, items: [], photos: [{ id: 'p1' }], photoObservations: [{ id: 'o1', photoId: 'p1', boundingBox: { x: 0, y: 0, width: .5, height: .5 }, selectedName: 'Blitzsturm' }], physicalCards: [] };
  const result = automation.analyzeCollectionPurchase(collection, { settings: {} });
  assert.equal(result.cardCount, 0);
  assert.equal(result.automaticInventoryCreated, false);
  assert.equal('purchases' in collection, false);
  assert.equal('inventory' in collection, false);
});

test('deutsche und englische Suche bleiben für Foto-Kandidaten nutzbar', () => {
  const rows = [{ productId: '123', germanName: 'Blitzsturm', englishName: 'Lightning Storm', setName: 'Test Set' }];
  const document = cardSearch.buildSearchDocument([rows[0].germanName, rows[0].englishName, rows[0].setName]);
  assert.equal(cardSearch.matchesSearch(document, 'blitz'), true);
  assert.equal(cardSearch.matchesSearch(document, 'lightning'), true);
});

test('Bildspeicher akzeptiert nur geprüfte Bilder in seinem verwalteten Ordner', t => {
  const { dataRoot, backupRoot } = sandbox(t);
  const store = new CollectionPhotoStore({ dataRoot, backupRoot });
  const saved = store.storeImage({ analysisId: 'a1', originalFileName: 'seite.png', mimeType: 'image/png', bytes: png() });
  assert.match(saved.relativePath, /^Daten\/Sammlungsfotos\//);
  assert.equal(saved.width, 1);assert.equal(saved.height, 1);assert.equal(saved.mimeType, 'image/png');
  assert.match(store.readImage(saved.relativePath).dataUrl, /^data:image\/png;base64,/);
  assert.throws(() => store.resolveManagedPath('../fremd.png'), /außerhalb/);
  assert.throws(() => store.storeImage({ analysisId: 'a1', originalFileName: 'falsch.jpg', mimeType: 'image/jpeg', bytes: png() }), /passen nicht/);
  assert.throws(() => store.storeImage({ analysisId: 'a1', originalFileName: 'text.txt', mimeType: 'text/plain', bytes: Buffer.from('kein bild') }), /Nur JPEG/);
});

test('Bildgrößenlimit wird vor dem Schreiben durchgesetzt', t => {
  const { dataRoot, backupRoot } = sandbox(t);
  const store = new CollectionPhotoStore({ dataRoot, backupRoot, maxImageBytes: 1024 });
  const huge = Buffer.concat([png(), Buffer.alloc(2048)]);
  assert.throws(() => store.storeImage({ analysisId: 'a1', mimeType: 'image/png', bytes: huge }), /größer/);
  assert.equal(MAX_IMAGE_BYTES, 15 * 1024 * 1024);
});

test('gestuftes Löschen ist rückrollbar und entfernt nur die verwaltete Datei', t => {
  const { dataRoot, backupRoot } = sandbox(t);
  const store = new CollectionPhotoStore({ dataRoot, backupRoot });
  const first = store.storeImage({ analysisId: 'a1', mimeType: 'image/png', bytes: png() });
  const firstPath = store.resolveManagedPath(first.relativePath);const rollback = store.stageDelete(first.relativePath);assert.equal(fs.existsSync(firstPath), false);rollback.rollback();assert.equal(fs.existsSync(firstPath), true);
  const commit = store.stageDelete(first.relativePath);commit.commit();assert.equal(fs.existsSync(firstPath), false);
});

test('Foto-Löschung entfernt nur zugehörige Beobachtungen und erhält Analyse, Positionen und physische Karten', () => {
  const analysis = { id: 'a1', title: 'Bleibt', items: [{ id: 'i1' }], photos: [{ id: 'p1' }, { id: 'p2' }], physicalCards: [{ id: 'physical-1' }], photoObservations: [{ id: 'o1', photoId: 'p1' }, { id: 'o2', photoId: 'p2' }] };
  const result = model.removePhotoEvidence(analysis, 'p1');
  assert.equal(result.title, 'Bleibt');assert.deepEqual(result.items, [{ id: 'i1' }]);assert.deepEqual(result.physicalCards, [{ id: 'physical-1' }]);assert.deepEqual(result.photos.map(row => row.id), ['p2']);assert.deepEqual(result.photoObservations.map(row => row.id), ['o2']);
});

test('Vollsicherung und Wiederherstellung enthalten Sammlungsfoto-Anlagen', t => {
  const { root } = sandbox(t);
  const source = new CollectionPhotoStore({ dataRoot: path.join(root, 'source'), backupRoot: path.join(root, 'source-backups') });
  const photo = { id: 'p1', analysisId: 'a1', ...source.storeImage({ analysisId: 'a1', originalFileName: 'seite.png', mimeType: 'image/png', bytes: png() }) };
  const state = { collectionPurchaseAnalyses: [{ id: 'a1', photos: [photo], photoObservations: [], physicalCards: [] }] };
  const bundle = source.createBackupBundle(state);assert.equal(bundle.attachments.length, 1);assert.doesNotMatch(JSON.stringify(state), /bytesBase64|data:image/);
  const target = new CollectionPhotoStore({ dataRoot: path.join(root, 'target'), backupRoot: path.join(root, 'target-backups') });
  let saved = null;const restored = target.restoreBackupBundle(bundle, restoredState => { saved = restoredState; return { ok: true }; });
  assert.equal(restored.restoredAttachments, 1);assert.equal(saved.collectionPurchaseAnalyses[0].photos[0].id, 'p1');assert.ok(fs.existsSync(target.resolveManagedPath(photo.relativePath)));
});

test('Wiederherstellung lehnt unvollständige oder doppelte Bildanhänge ab', t => {
  const { root } = sandbox(t, 'tcg-photo-restore-validation-');
  const source = new CollectionPhotoStore({ dataRoot: path.join(root, 'source'), backupRoot: path.join(root, 'source-backups') });
  const photo = { id: 'p1', analysisId: 'a1', ...source.storeImage({ analysisId: 'a1', mimeType: 'image/png', bytes: png() }) };
  const state = { collectionPurchaseAnalyses: [{ id: 'a1', photos: [photo] }] };
  const bundle = source.createBackupBundle(state);
  const target = new CollectionPhotoStore({ dataRoot: path.join(root, 'target'), backupRoot: path.join(root, 'target-backups') });
  assert.throws(() => target.restoreBackupBundle({ ...bundle, attachments: [] }, () => ({ ok: true })), /nicht alle/);
  assert.throws(() => target.restoreBackupBundle({ ...bundle, attachments: [bundle.attachments[0], bundle.attachments[0]] }, () => ({ ok: true })), /mehrfach/);
});

test('tägliche Sicherung führt Bildanhänge mit Manifest', t => {
  const { dataRoot, backupRoot } = sandbox(t, 'tcg-photo-auto-backup-');
  const store = new CollectionPhotoStore({ dataRoot, backupRoot });
  const photo = { id: 'p1', ...store.storeImage({ analysisId: 'a1', originalFileName: 'seite.png', mimeType: 'image/png', bytes: png() }) };
  const state = { collectionPurchaseAnalyses: [{ id: 'a1', photos: [photo] }] };
  const target = store.createAutomaticAttachmentBackup(state, '2026-08-22', 30);
  assert.ok(fs.existsSync(path.join(target, 'manifest.json')));assert.ok(fs.existsSync(path.join(target, photo.relativePath)));
});

test('Schema 11 wird mit Backup auf Schema 12 migriert und bestehende Analysen bleiben erhalten', t => {
  const { databasePath, backupRoot } = sandbox(t, 'tcg-photo-migration-');
  let database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  database.saveState({ settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], collectionPurchaseAnalyses: [{ id: 'a1', title: 'Bestehend', items: [], decisionSnapshots: [] }] });database.close();
  const raw = new DatabaseSync(databasePath);raw.exec("DELETE FROM schema_version WHERE version=12; INSERT OR IGNORE INTO schema_version(version,applied_at) VALUES(11,'2026-08-20');");raw.close();
  database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();const loaded = database.loadState().state;database.close();
  assert.equal(CURRENT_SCHEMA_VERSION, 12);assert.equal(loaded.collectionPurchaseAnalyses.length, 1);assert.deepEqual(loaded.collectionPurchaseAnalyses[0].photos, []);
  assert.ok(fs.readdirSync(path.join(backupRoot, 'Migrationen')).some(name => /v11_vor_v12/.test(name)));
});

test('fehlgeschlagene Schema-12-Migration rollt Version und app_state zurück', t => {
  const { databasePath, backupRoot } = sandbox(t, 'tcg-photo-rollback-');
  let database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();database.saveState({ settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], collectionPurchaseAnalyses: [{ id: 'a1', title: 'Unverändert', items: [] }] });database.close();
  const raw = new DatabaseSync(databasePath);raw.exec("DELETE FROM schema_version WHERE version=12; INSERT OR IGNORE INTO schema_version(version,applied_at) VALUES(11,'2026-08-20');");raw.close();
  class FailingDatabase extends TcgDatabase { migrateToVersion12() { super.migrateToVersion12(); throw new Error('Foto-Rollback-Test'); } }
  const failing = new FailingDatabase({ databasePath, schemaPath, backupRoot });assert.throws(() => failing.open(), /Foto-Rollback-Test/);failing.close();
  const checked = new DatabaseSync(databasePath);assert.equal(checked.prepare('SELECT MAX(version) version FROM schema_version').get().version, 11);assert.equal(JSON.parse(checked.prepare('SELECT state_json FROM app_state WHERE id=1').get().state_json).collectionPurchaseAnalyses[0].title, 'Unverändert');checked.close();
});

test('Foto-Metadaten, Kandidaten und physische Verknüpfung werden normalisiert gespeichert', t => {
  const { databasePath, backupRoot } = sandbox(t, 'tcg-photo-db-');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  database.saveState({ settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], collectionPurchaseAnalyses: [{
    id: 'a1', title: 'Fotos', items: [{ id: 'i1', productId: '123', name: 'Blitzsturm' }], decisionSnapshots: [],
    photos: [{ id: 'p1', sequence: 1, binderPage: '4', relativePath: 'Daten/Sammlungsfotos/test/bild.png', originalFileName: 'bild.png', mimeType: 'image/png', fileSize: 50, width: 100, height: 200, sha256: 'abc', createdAt: '2026-08-20', lastDetectionAt: '2026-08-22T12:00:00.000Z', detectionQuality: { brightness: 120, contrast: 35, sharpness: 14, warnings: [] } }],
    physicalCards: [{ id: 'physical-1', label: 'Blitzsturm Exemplar', linkedCollectionItemId: 'i1', productId: '123', name: 'Blitzsturm', createdAt: '2026-08-20' }],
    photoObservations: [
      { id: 'o1', photoId: 'p1', boundingBox: { x: .1, y: .2, width: .3, height: .4 }, observationSource: 'manual', detectionReviewState: 'manual', row: '2', column: '3', selectedName: 'Blitzsturm', nameCandidates: [{ name: 'Blitzsturm' }], nameConfidence: 'high', selectedProductId: '123', printCandidates: [{ productId: '123' }], printConfidence: 'confirmed', printRecognition: { setCode: 'KICO-EN057', setCodeConfidence: 84.26, setCodeSignals: [{ setCode: 'KICO-EN057', confidence: 84.26 }], mappingStatus: 'exact', resolutionStatus: 'exact_candidate_selected', selectedRarity: 'Ultra Rare', selectedVersion: 'V.1' }, physicalCardId: 'physical-1', linkedCollectionItemId: 'i1', createdAt: '2026-08-20' },
      { id: 'auto-suggested', photoId: 'p1', boundingBox: { x: .45, y: .05, width: .2, height: .3 }, observationSource: 'automatic', detectionConfidence: 'medium', detectionScore: .72, detectionSignals: { edgeStrength: .84, gridSupport: true }, detectionReviewState: 'suggested', nameConfidence: 'unknown', printConfidence: 'unknown', createdAt: '2026-08-22' },
      { id: 'auto-confirmed', photoId: 'p1', boundingBox: { x: .7, y: .05, width: .2, height: .3 }, observationSource: 'automatic', detectionConfidence: 'high', detectionScore: .88, detectionSignals: { edgeStrength: .91 }, detectionReviewState: 'confirmed', nameConfidence: 'unknown', printConfidence: 'unknown', createdAt: '2026-08-22' },
      { id: 'auto-rejected', photoId: 'p1', boundingBox: { x: .45, y: .55, width: .2, height: .3 }, observationSource: 'automatic', detectionConfidence: 'low', detectionScore: .61, detectionSignals: { possiblePerspective: true }, detectionReviewState: 'rejected', nameConfidence: 'unknown', printConfidence: 'unknown', createdAt: '2026-08-22' }
    ]
  }] });
  const photoCount = database.db.prepare('SELECT COUNT(*) count FROM collection_purchase_photos WHERE archived=0').get().count;
  const observation = database.db.prepare("SELECT * FROM collection_card_observations WHERE observation_id='o1' AND archived=0").get();
  const physicalCount = database.db.prepare('SELECT COUNT(*) count FROM collection_physical_cards WHERE archived=0').get().count;
  const loaded=database.loadState().state.collectionPurchaseAnalyses[0];
  assert.equal(photoCount, 1);assert.equal(physicalCount, 1);assert.equal(observation.selected_product_id, '123');assert.equal(observation.name_confidence, 'high');assert.equal(observation.print_confidence, 'confirmed');assert.equal(loaded.photos[0].binderPage,'4');assert.equal(loaded.photos[0].detectionQuality.contrast,35);assert.deepEqual(loaded.photoObservations[0].boundingBox,{x:.1,y:.2,width:.3,height:.4});assert.equal(loaded.photoObservations[0].printRecognition.setCode,'KICO-EN057');assert.equal(loaded.photoObservations[0].printRecognition.setCodeConfidence,84.3);assert.equal(loaded.photoObservations[0].printRecognition.selectedRarity,'Ultra Rare');
  const suggested=loaded.photoObservations.find(row=>row.id==='auto-suggested'),confirmed=loaded.photoObservations.find(row=>row.id==='auto-confirmed'),rejected=loaded.photoObservations.find(row=>row.id==='auto-rejected');
  assert.equal(suggested.observationSource,'automatic');assert.equal(suggested.detectionConfidence,'medium');assert.equal(suggested.detectionScore,.72);assert.equal(suggested.nameConfidence,'unknown');assert.equal(suggested.printConfidence,'unknown');assert.equal(confirmed.detectionReviewState,'confirmed');assert.equal(rejected.detectionReviewState,'rejected');
  const rescan=model.mergeDetectionSuggestions(loaded.photoObservations,'p1',[{boundingBox:rejected.boundingBox,detectionConfidence:'high',detectionScore:.9}],{analysisId:'a1'});assert.equal(rescan.added.length,0);database.close();
});

test('ungültige Bounding Box verhindert die gesamte SQLite-Speicherung', t => {
  const { databasePath, backupRoot } = sandbox(t, 'tcg-photo-invalid-db-');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  assert.throws(() => database.saveState({ settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], collectionPurchaseAnalyses: [{ id: 'a1', items: [], photos: [{ id: 'p1', relativePath: 'Daten/Sammlungsfotos/x/y.png' }], physicalCards: [], photoObservations: [{ id: 'o1', photoId: 'p1', boundingBox: { x: .9, y: .9, width: .5, height: .5 } }] }] }), /Ungültiger Bildausschnitt/);
  assert.equal(database.db.prepare('SELECT COUNT(*) count FROM app_state').get().count, 0);database.close();
});
