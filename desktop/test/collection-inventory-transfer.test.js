const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const automation = require('../app/shared/business-automation');
const collectionModel = require('../app/shared/collection-photo-model');
const { TcgDatabase } = require('../app/main/database');
const { PrintReferenceDatabase } = require('../app/main/print-reference-database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function temporaryDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-collection-transfer-'));
  const database = new TcgDatabase({ databasePath: path.join(root, 'data.sqlite'), schemaPath, backupRoot: path.join(root, 'backups') }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  return database;
}

function collectionState() {
  return {
    settings: { feePercent: 5, packaging: 0.2, minProfit: 2, minRoi: 20, safetyPercent: 5 },
    purchases: [], sales: [], movements: [],
    inventory: [{ id: 'existing-item', productId: '999999', name: 'Historischer Bestand', cost: 1, status: 'Im Bestand' }],
    productCatalog: {
      '111111': { productId: '111111', germanName: 'Erste Karte', englishName: 'First Card', set: 'TEST', setName: 'Test Expansion', collectorNumber: 'TEST-DE001', rarity: 'Ultra Rare' },
      '222222': { productId: '222222', germanName: 'Zweite Karte', englishName: 'Second Card', set: 'TEST', setName: 'Test Expansion', collectorNumber: 'TEST-DE002', rarity: 'Super Rare' }
    },
    collectionPurchaseAnalyses: [{
      id: 'collection-1', title: 'Test-Sammlung', date: '2026-09-26', sellerPrice: 8,
      captureStatus: 'economic_ready',
      photos: [{ id: 'photo-1', sequence: 1, originalFileName: 'test.jpg', createdAt: '2026-09-26T09:00:00.000Z' }],
      photoObservations: [
        {
          id: 'position-1', photoId: 'photo-1', boundingBox: { x: 0, y: 0, width: 0.4, height: 0.8 }, selectedProductId: '111111', selectedName: 'Erste Karte', printConfidence: 'confirmed', detectionReviewState: 'confirmed',
          manualCapture: { setCode: 'TEST-DE001', setCodeConfirmed: true, condition: 'NM', edition: '1st', quantity: 2, completedAt: '2026-09-26T10:00:00.000Z' },
          printRecognition: { setCode: 'TEST-DE001', selectedRarity: 'Ultra Rare', selectedVersion: 'V.1', mappingStatus: 'exact' },
          printCandidates: [{ productId: '111111', germanName: 'Erste Karte', englishName: 'First Card', setName: 'Test Expansion', setCode: 'TEST-DE001', rarity: 'Ultra Rare', version: 'V.1', verified: true }]
        },
        {
          id: 'position-2', photoId: 'photo-1', boundingBox: { x: 0.5, y: 0, width: 0.4, height: 0.8 }, selectedProductId: '222222', selectedName: 'Zweite Karte', printConfidence: 'confirmed', detectionReviewState: 'confirmed',
          manualCapture: { setCode: 'TEST-DE002', setCodeConfirmed: true, condition: 'EX', edition: 'Unlimited', quantity: 2, completedAt: '2026-09-26T10:01:00.000Z' },
          printRecognition: { setCode: 'TEST-DE002', selectedRarity: 'Super Rare', mappingStatus: 'exact' },
          printCandidates: [{ productId: '222222', germanName: 'Zweite Karte', englishName: 'Second Card', setName: 'Test Expansion', setCode: 'TEST-DE002', rarity: 'Super Rare', verified: true }]
        }
      ],
      economicReview: {
        status: 'ready_for_transfer', directCosts: 2, readyAt: '2026-09-26T11:00:00.000Z',
        allocation: {
          totalCents: 1000, allocatedCents: 1000,
          lines: [
            { observationId: 'position-1', quantity: 2, privateQuantity: 0, businessQuantity: 2, unitCostsCents: [300, 300], allocatedTotalCents: 600, businessTotalCents: 600, privateTotalCents: 0 },
            { observationId: 'position-2', quantity: 2, privateQuantity: 1, businessQuantity: 1, unitCostsCents: [200, 200], allocatedTotalCents: 400, businessTotalCents: 200, privateTotalCents: 200 }
          ]
        }
      }
    }]
  };
}

function transfer(state = collectionState()) {
  let id = 0;
  return automation.applyCollectionInventoryTransfer(state, 'collection-1', {
    now: '2026-09-26T12:00:00.000Z', transferId: 'transfer-1', makeId: () => `generated-${++id}`
  });
}

test('übernimmt normale und mehrfache Geschäftsexemplare mit exaktem Print und EK', () => {
  const result = transfer();
  const created = result.state.inventory.filter(item => item.sourceCollectionTransferId === 'transfer-1');
  assert.equal(created.length, 3);
  assert.equal(result.state.inventory.some(item => item.id === 'existing-item'), true, 'historischer Bestand bleibt unverändert');
  assert.deepEqual(created.map(item => item.productId), ['111111', '111111', '222222']);
  assert.deepEqual(created.map(item => item.cost), [3, 3, 2]);
  assert.equal(created[0].condition, 'NM');
  assert.equal(created[0].edition, '1st Edition');
  assert.equal(created[2].condition, 'EX');
  assert.equal(created[2].edition, 'Unlimited');
  assert.equal(result.summary.businessQuantity, 3);
});

test('trennt private Teilmengen ohne Kosten auf Geschäftskarten umzuverteilen', () => {
  const result = transfer(), created = result.state.inventory.filter(item => item.sourceCollectionTransferId === 'transfer-1');
  assert.equal(created.filter(item => item.sourceCollectionPositionId === 'position-2').length, 1);
  assert.equal(result.summary.privateQuantity, 1);
  assert.equal(result.summary.privateCostCents, 200);
  assert.equal(result.summary.businessCostCents, 800);
  assert.equal(result.summary.privateCostCents + result.summary.businessCostCents, result.summary.totalCostCents);
  assert.equal(created.reduce((sum, item) => sum + Math.round(item.cost * 100), 0), 800);
  assert.equal(result.state.inventory.some(item => item.ownership === 'private'), false);
});

test('bewahrt Herkunft, Ankaufposition sowie ursprünglichen und vollständigen EK', () => {
  const result = transfer(), item = result.state.inventory.find(row => row.sourceCollectionPositionId === 'position-1');
  assert.equal(item.sourceCollectionPurchaseId, 'collection-1');
  assert.equal(item.sourceCollectionPositionId, 'position-1');
  assert.equal(item.purchaseLineKey, 'COLLECTION:collection-1:position-1');
  assert.equal(item.originalAcquisitionCost, 2.4);
  assert.equal(item.allocatedPurchaseExtra, 0.6);
  assert.equal(item.fullAcquisitionCost, 3);
  assert.deepEqual(item.acquisitionCostOrigin, {
    type: 'collection_purchase_allocation', collectionPurchaseId: 'collection-1', collectionPositionId: 'position-1', transferId: 'transfer-1',
    allocationMethod: 'manual_fixed_plus_reference_remainder', originalCostCents: 240, directCostCents: 60, fullCostCents: 300
  });
});

test('zweiter Abschluss ist idempotent und erzeugt keine Duplikate', () => {
  const first = transfer(), second = automation.applyCollectionInventoryTransfer(first.state, 'collection-1');
  assert.equal(second.idempotent, true);
  assert.equal(second.transferred, false);
  assert.equal(second.state.inventory.length, first.state.inventory.length);
  assert.equal(second.state.collectionPurchaseAnalyses[0].captureStatus, 'transferred');
});

test('Fehler mitten in der Vorbereitung verändert den übergebenen Zustand nicht', () => {
  const original = collectionState(), snapshot = structuredClone(original);
  assert.throws(() => automation.applyCollectionInventoryTransfer(original, 'collection-1', {
    now: '2026-09-26T12:00:00.000Z', transferId: 'transfer-fail', makeId: () => 'generated-fail', failAfterAssets: 1
  }), /Simulierter Fehler/);
  assert.deepEqual(original, snapshot);
});

test('SQLite speichert erfolgreiche Übernahme samt Herkunft genau einmal', t => {
  const database = temporaryDatabase(t);
  database.saveState(collectionState());
  let id = 0;
  const first = database.transferCollectionPurchaseToInventory({ analysisId: 'collection-1' }, {
    now: '2026-09-26T12:00:00.000Z', transferId: 'transfer-db-success', makeId: () => `db-success-${++id}`
  });
  assert.equal(first.transferred, true);
  const persisted = database.loadState().state;
  const created = persisted.inventory.filter(item => item.sourceCollectionTransferId === 'transfer-db-success');
  assert.equal(created.length, 3);
  assert.equal(created[0].sourceCollectionPurchaseId, 'collection-1');
  assert.equal(created[0].acquisitionCostOrigin.fullCostCents, 300);
  assert.equal(persisted.collectionPurchaseAnalyses[0].captureStatus, 'transferred');
  const second = database.transferCollectionPurchaseToInventory({ analysisId: 'collection-1' });
  assert.equal(second.idempotent, true);
  assert.equal(database.loadState().state.inventory.length, persisted.inventory.length);
  assert.equal(database.db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.deepEqual(database.db.prepare('PRAGMA foreign_key_check').all(), []);
});

test('SQLite-Übernahme ist atomar; Fehler rollt Bestand, Status und Ereignisse vollständig zurück', t => {
  const database = temporaryDatabase(t);
  database.saveState(collectionState());
  const beforeFailure = database.loadState().state.collectionPurchaseAnalyses[0];
  assert.equal(beforeFailure.photoObservations.length, 2);
  assert.equal(beforeFailure.economicReview.allocation.lines.length, 2);
  assert.equal(beforeFailure.economicReview.allocation.totalCents, 1000);
  assert.equal(beforeFailure.economicReview.allocation.allocatedCents, 1000);
  assert.equal(beforeFailure.economicReview.directCosts, 2);
  const originalMaterialize = database.materializeState.bind(database);
  database.materializeState = () => { throw new Error('Simulierter Persistenzfehler'); };
  assert.throws(() => database.transferCollectionPurchaseToInventory({ analysisId: 'collection-1' }, {
    now: '2026-09-26T12:00:00.000Z', transferId: 'transfer-db', makeId: (() => { let id = 0; return () => `db-${++id}`; })()
  }), /Simulierter Persistenzfehler/);
  database.materializeState = originalMaterialize;
  const loaded = database.loadState().state;
  assert.equal(loaded.inventory.length, 1);
  assert.equal(loaded.collectionPurchaseAnalyses[0].captureStatus, 'economic_ready');
  assert.equal(database.db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.deepEqual(database.db.prepare('PRAGMA foreign_key_check').all(), []);
});

test('Sammlungsankauf verdrahtet den finalen Übernahmeknopf ausschließlich über den transaktionalen Desktop-Kanal', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'index.html'), 'utf8');
  const renderer = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'app.js'), 'utf8');
  const preload = fs.readFileSync(path.join(__dirname, '..', 'app', 'main', 'preload.js'), 'utf8');
  assert.match(html, /id="transferCollectionInventoryBtn"/);
  assert.match(renderer, /async function transferCollectionInventory\(\)/);
  assert.match(renderer, /transferCollectionPurchaseToInventory\(\{analysisId:analysis\.id\}\)/);
  assert.match(preload, /transferCollectionPurchaseToInventory: payload => ipcRenderer\.invoke\('collection-purchase:transfer-to-inventory'/);
});

test('realistischer Sammlungsankauf läuft mit Print-Auswahl, EK, Privatanteilen und Neustart vollständig durch', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-collection-e2e-'));
  const databasePath = path.join(root, 'isolated-test.sqlite');
  const reference = new PrintReferenceDatabase({ databasePath: path.join(__dirname, '..', 'resources', 'print-reference.sqlite') }).open();
  let database = new TcgDatabase({ databasePath, schemaPath, backupRoot: path.join(root, 'backups') }).open();
  t.after(() => { reference.close(); database?.close(); fs.rmSync(root, { recursive: true, force: true }); });

  const specs = [
    { code: 'RA01-EN019', rarity: 'Super Rare', version: 'V.1', quantity: 1, condition: 'NM', edition: '1st', privateQuantity: 0, referenceValue: 12, manualUnitCost: 10 },
    { code: 'CORI-EN081', rarity: 'Ultra Rare', version: 'V.1', quantity: 2, condition: 'EX', edition: 'Unlimited', privateQuantity: 1, referenceValue: 18 },
    { code: 'MAMO-EN004', rarity: 'Ultra Rare', version: 'V.2', quantity: 1, condition: 'GD', edition: '1st', privateQuantity: 1, referenceValue: 9 },
    { code: 'CORI-EN004', rarity: 'Ultra Rare', version: 'V.1', quantity: 1, condition: 'NM', edition: '1st', privateQuantity: 0, referenceValue: 8 },
    { code: 'MAMO-EN004', rarity: 'Starlight Rare', version: 'V.3', quantity: 1, condition: 'NM', edition: 'Unlimited', privateQuantity: 0, referenceValue: 30 },
    { code: 'CORI-EN081', rarity: 'Starlight Rare', version: 'V.3', quantity: 1, condition: 'EX', edition: '1st', privateQuantity: 0, referenceValue: 24 },
    { code: 'CORI-EN004', rarity: 'Starlight Rare', version: 'V.2', quantity: 1, condition: 'GD', edition: 'Unlimited', privateQuantity: 0, referenceValue: 16 }
  ];
  const observations = [], cards = [], productCatalog = {};
  let requiredRaritySelections = 0, requiredVersionSelections = 0;
  specs.forEach((spec, index) => {
    const withoutRarity = reference.resolveCollectionRecognition({ setCode: spec.code, setCodeConfidence: 98 });
    if (withoutRarity.requiresRaritySelection) requiredRaritySelections += 1;
    const recognition = reference.resolveCollectionRecognition({ setCode: spec.code, setCodeConfidence: 98, rarity: spec.rarity });
    if (recognition.requiresVersionSelection) requiredVersionSelections += 1;
    const candidate = recognition.variantCandidates.find(row => row.version === spec.version);
    assert.ok(candidate?.verified && candidate.cardmarketProductId, `${spec.code} ${spec.rarity} ${spec.version} muss lokal verifiziert sein`);
    const observationId = `e2e-position-${index + 1}`;
    observations.push({
      id: observationId, photoId: 'e2e-photo', boundingBox: { x: (index % 4) * 0.24, y: Math.floor(index / 4) * 0.48, width: 0.22, height: 0.44 },
      selectedProductId: candidate.cardmarketProductId, selectedName: candidate.germanName || candidate.englishName,
      printConfidence: 'confirmed', detectionReviewState: 'confirmed',
      manualCapture: { setCode: spec.code, setCodeConfirmed: true, condition: spec.condition, edition: spec.edition, quantity: spec.quantity, completedAt: '2026-09-26T15:00:00.000Z' },
      printRecognition: { ...recognition, selectedRarity: spec.rarity, selectedVersion: spec.version, selectedCandidateId: candidate.id, mappingStatus: 'exact' },
      printCandidates: []
    });
    cards.push({
      observationId, productId: candidate.cardmarketProductId, name: candidate.germanName || candidate.englishName,
      print: `${spec.code} · ${spec.rarity} · ${spec.version}`, quantity: spec.quantity, privateQuantity: spec.privateQuantity,
      referenceValue: spec.referenceValue, referenceSource: 'isolierter E2E-Testwert', referenceDate: '2026-09-26',
      manualUnitCost: spec.manualUnitCost ?? null, completed: true, confirmed: true
    });
    productCatalog[candidate.cardmarketProductId] = {
      productId: candidate.cardmarketProductId, germanName: candidate.germanName, englishName: candidate.englishName,
      name: candidate.germanName || candidate.englishName, set: candidate.setCode.split('-')[0], setName: candidate.setName,
      collectorNumber: candidate.setCode, rarity: candidate.rarity, productUrl: candidate.productUrl
    };
  });
  assert.equal(specs.reduce((sum, row) => sum + row.quantity, 0), 8);
  assert.ok(requiredRaritySelections >= 1);
  assert.ok(requiredVersionSelections >= 1);

  const totalCost = 80;
  const allocation = collectionModel.allocateCollectionPurchaseCosts({ totalCost, cards });
  assert.equal(allocation.ok, true);
  assert.equal(allocation.allocatedCents, 8000);
  assert.equal(allocation.lines.find(row => row.observationId === 'e2e-position-1').unitCostsCents[0], 1000, 'manuell fixierter EK bleibt exakt');
  const validation = collectionModel.validateCollectionEconomicCompletion({ totalCost, cards, allocation });
  assert.equal(validation.valid, true);

  const privateCostCents = allocation.lines.reduce((sum, row) => sum + row.privateTotalCents, 0);
  const expectedBusinessQuantity = cards.reduce((sum, row) => sum + row.quantity - row.privateQuantity, 0);
  const expectedPrivateQuantity = cards.reduce((sum, row) => sum + row.privateQuantity, 0);
  const state = {
    settings: { feePercent: 5, packaging: 0.2, minProfit: 2, minRoi: 20, safetyPercent: 5, autoBackup: false },
    purchases: [], sales: [], movements: [], privateCollection: [], productCatalog,
    inventory: [{ id: 'e2e-existing', productId: '123456', name: 'Vorhandener Bestand', cost: 1.5, status: 'Im Bestand' }],
    activeCollectionAnalysisId: 'e2e-collection',
    collectionPurchaseAnalyses: [{
      id: 'e2e-collection', title: 'Isolierter realistischer E2E-Ankauf', sellerName: 'Testverkäufer', date: '2026-09-26', sellerPrice: 75,
      captureStatus: 'economic_ready', photos: [{ id: 'e2e-photo', sequence: 1, originalFileName: 'e2e-binder.jpg' }], photoObservations: observations, physicalCards: [],
      economicReview: { status: 'ready_for_transfer', directCosts: 5, manualUnitCosts: { 'e2e-position-1': 10 }, privateQuantities: Object.fromEntries(cards.map(row => [row.observationId, row.privateQuantity])), allocation }
    }]
  };

  database.saveState(state);
  const before = database.loadState().state;
  assert.equal(before.inventory.length, 1);
  const transferred = database.transferCollectionPurchaseToInventory({ analysisId: 'e2e-collection' }, {
    now: '2026-09-26T16:00:00.000Z', transferId: 'e2e-transfer', makeId: (() => { let id = 0; return () => `e2e-generated-${++id}`; })()
  });
  assert.equal(transferred.summary.businessQuantity, expectedBusinessQuantity);
  assert.equal(transferred.summary.privateQuantity, expectedPrivateQuantity);
  assert.equal(transferred.summary.privateCostCents, privateCostCents);
  assert.equal(transferred.summary.businessCostCents + transferred.summary.privateCostCents, 8000);
  assert.equal(transferred.state.inventory.length, 1 + expectedBusinessQuantity);
  assert.equal(transferred.state.inventory.filter(row => row.sourceCollectionPurchaseId === 'e2e-collection').length, expectedBusinessQuantity);
  assert.equal(transferred.state.inventory.some(row => row.ownership === 'private'), false);
  const transferredBusiness = transferred.state.inventory.filter(row => row.sourceCollectionPurchaseId === 'e2e-collection');
  assert.ok(transferredBusiness.every(row => row.acquisitionCostOrigin?.fullCostCents === Math.round(row.cost * 100)));
  assert.ok(transferredBusiness.every(row => Math.round((row.originalAcquisitionCost + row.allocatedPurchaseExtra) * 100) === Math.round(row.fullAcquisitionCost * 100)));
  assert.ok(transferredBusiness.every(row => row.sourceCollectionPositionId && row.purchaseLineKey.startsWith('COLLECTION:e2e-collection:')));
  const persistedAllocation = transferred.state.collectionPurchaseAnalyses[0].economicReview.allocation;
  assert.equal(persistedAllocation.lines.reduce((sum, row) => sum + row.unitOriginalCostCents.reduce((part, value) => part + value, 0), 0), 7500);
  assert.equal(persistedAllocation.lines.reduce((sum, row) => sum + row.unitDirectCostCents.reduce((part, value) => part + value, 0), 0), 500);

  const duplicate = database.transferCollectionPurchaseToInventory({ analysisId: 'e2e-collection' });
  assert.equal(duplicate.idempotent, true);
  assert.equal(database.loadState().state.inventory.length, 1 + expectedBusinessQuantity);

  database.close();database = null;
  database = new TcgDatabase({ databasePath, schemaPath, backupRoot: path.join(root, 'backups') }).open();
  const reloaded = database.loadState().state, completed = reloaded.collectionPurchaseAnalyses.find(row => row.id === 'e2e-collection');
  const reloadedBusiness = reloaded.inventory.filter(row => row.sourceCollectionPurchaseId === 'e2e-collection');
  assert.equal(reloaded.inventory.length, 1 + expectedBusinessQuantity);
  assert.equal(reloadedBusiness.length, expectedBusinessQuantity);
  assert.equal(reloadedBusiness.reduce((sum, row) => sum + Math.round(row.cost * 100), 0), 8000 - privateCostCents);
  assert.equal(completed.captureStatus, 'transferred');
  assert.equal(completed.economicReview.status, 'transferred');
  assert.equal(completed.inventoryTransfer.transferredAt, '2026-09-26T16:00:00.000Z');
  assert.equal(completed.inventoryTransfer.privateCostCents, privateCostCents);
  assert.equal(database.db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
  assert.deepEqual(database.db.prepare('PRAGMA foreign_key_check').all(), []);
});

