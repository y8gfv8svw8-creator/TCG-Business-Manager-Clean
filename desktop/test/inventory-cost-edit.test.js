const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const automation = require('../app/shared/business-automation');
const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

test('manueller vollständiger EK wechselt von 0 auf einen positiven bekannten Wert', () => {
  const item = { cost: 0, costStatus: 'unknown', cardPrice: 1.25 };
  const result = automation.applyInventoryCostEdit(
    item,
    { cost: '7.35', costStatus: 'Unverändert' },
    { initialCost: 0 }
  );
  assert.equal(result.ok, true);
  assert.equal(result.changed, true);
  assert.equal(item.cost, 7.35);
  assert.equal(item.costStatus, 'known');
  assert.equal(item.cardPrice, 1.25);
});

test('manueller vollständiger EK kann von positiv auf einen anderen positiven Wert geändert werden', () => {
  const item = { cost: 5.1, costStatus: 'known' };
  automation.applyInventoryCostEdit(item, { cost: '6.25', costStatus: 'Unverändert' }, { initialCost: 5.1 });
  assert.equal(item.cost, 6.25);
  assert.equal(item.costStatus, 'known');
});

test('vollständiger EK übernimmt Dezimalwerte mit zwei Nachkommastellen', () => {
  const item = { cost: 1, costStatus: 'known' };
  automation.applyInventoryCostEdit(item, { cost: '7,35', costStatus: 'Unverändert' }, { initialCost: 1 });
  assert.equal(item.cost, 7.35);
  assert.equal(item.costStatus, 'known');
});

test('ein bewusst gespeicherter Nullwert erhält den Status 0 Euro bestätigt', () => {
  const item = { cost: 4.2, costStatus: 'known' };
  automation.applyInventoryCostEdit(item, { cost: '0', costStatus: 'confirmed_zero' }, { initialCost: 4.2 });
  assert.equal(item.cost, 0);
  assert.equal(item.costStatus, 'confirmed_zero');
});

test('ein leeres Feld mit unverändertem Status überschreibt den vorhandenen EK nicht', () => {
  const item = { cost: 4.2, costStatus: 'known' };
  const result = automation.applyInventoryCostEdit(item, { cost: '', costStatus: 'Unverändert' }, { initialCost: 4.2 });
  assert.equal(result.changed, false);
  assert.equal(item.cost, 4.2);
  assert.equal(item.costStatus, 'known');
});

test('vollständiger EK bleibt in app_state und SQLite nach Neustart erhalten und steuert Gewinn und ROI', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-cost-edit-'));
  const databasePath = path.join(root, 'data.sqlite');
  const backupRoot = path.join(root, 'backups');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  let reopened = null;
  t.after(() => {
    reopened?.close();
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  const purchase = {
    id: 'purchase-1', orderNo: 'P-1', status: 'Unterwegs', quantity: 1,
    pendingItems: [{ receiptLineKey: 'line-1', quantity: 1, unitPrice: 1.25 }]
  };
  const item = {
    id: 'asset-1', productId: '741275', name: 'Nibiru, das Urwesen',
    purchaseId: purchase.id, purchaseLineKey: 'purchase-1:line-1', purchaseDate: '2026-08-01',
    status: 'Im Bestand', quantity: 1, cardPrice: 1.25, cost: 0, costStatus: 'unknown',
    listed: true, listingPrice: 10
  };
  const result = automation.applyInventoryCostEdit(
    item,
    { cost: '7.35', costStatus: 'Unverändert' },
    { initialCost: 0 }
  );
  assert.equal(result.ok, true);

  const state = {
    settings: { autoBackup: false }, inventory: [item], privateCollection: [], purchases: [purchase],
    sales: [], collectionPurchaseAnalyses: [], capitalAccounts: [], capitalEntries: []
  };
  database.saveState(state);

  const appState = JSON.parse(database.db.prepare('SELECT state_json FROM app_state WHERE id = 1').get().state_json);
  const sqliteAsset = database.db.prepare(`
    SELECT acquisition_cost, acquisition_cost_status, raw_json
    FROM inventory_assets WHERE inventory_id = 'asset-1' AND archived = 0
  `).get();
  assert.equal(appState.inventory[0].cost, 7.35);
  assert.equal(appState.inventory[0].costStatus, 'known');
  assert.equal(sqliteAsset.acquisition_cost, 7.35);
  assert.equal(sqliteAsset.acquisition_cost_status, 'known');
  assert.equal(JSON.parse(sqliteAsset.raw_json).cost, 7.35);

  database.close();
  reopened = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  const loaded = reopened.loadState().state;
  const loadedItem = loaded.inventory[0];
  assert.equal(CURRENT_SCHEMA_VERSION, 12);
  assert.equal(loadedItem.cost, 7.35);
  assert.equal(loadedItem.costStatus, 'known');
  assert.equal(loadedItem.cardPrice, 1.25);
  assert.equal(loaded.purchases[0].id, purchase.id);
  assert.equal(loaded.purchases[0].quantity, 1);
  assert.equal(loaded.purchases[0].pendingItems.length, 1);
  assert.equal(loaded.purchases[0].pendingItems[0].quantity, 1);
  assert.equal(loaded.purchases[0].pendingItems[0].unitPrice, 1.25);
  assert.equal(loaded.inventory.length, 1);

  const scenario = automation.calculateSaleScenario(10, loadedItem, { feePercent: 0, packaging: 0 });
  assert.equal(scenario.calculable, true);
  assert.equal(scenario.cost, 7.35);
  assert.equal(scenario.expectedProfit, 2.65);
  assert.equal(scenario.roi, 36.05);
});
