const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');
const automation = require('../app/shared/business-automation');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function sandbox(_t, prefix = 'tcg-phase1-') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const databasePath = path.join(root, 'data.sqlite');
  const backupRoot = path.join(root, 'backups');
  return { root, databasePath, backupRoot };
}

function stateWithPhase1Fields() {
  return {
    settings: { feePercent: 5, packaging: 0.1, minProfit: 0.5, minRoi: 25 },
    purchases: [], sales: [], reconciliations: [],
    inventory: [{
      id: 'asset-1', productId: '100', name: 'Testkarte', status: 'Im Bestand',
      cost: 2, costStatus: 'known', listed: true, listingPrice: 4,
      purchaseId: 'purchase-1', purchaseLineKey: 'purchase-1:line-1', purchaseDate: '2026-07-15',
      originalTargetSell: 5, holdingProfile: 'long_term', longTermHold: true,
      listingHistory: [{ id: 'listing-1', eventType: 'first_listing', changedAt: '2026-08-01', oldPrice: null, newPrice: 4, changeMode: 'manual', reason: 'Erstpreis' }]
    }],
    privateCollection: [],
    capitalAccounts: [
      { id: 'cm', name: 'Cardmarket', type: 'cardmarket', currency: 'EUR', active: true },
      { id: 'bank', name: 'Bank', type: 'bank', currency: 'EUR', active: true }
    ],
    capitalEntries: [
      { id: 'opening', accountId: 'cm', type: 'opening', date: '2026-08-01', amount: 100, description: 'Start' },
      { id: 'transfer-out', accountId: 'cm', transferId: 'transfer-1', type: 'transfer', date: '2026-08-02', amount: -20 },
      { id: 'transfer-in', accountId: 'bank', transferId: 'transfer-1', type: 'transfer', date: '2026-08-02', amount: 20 },
      { id: 'deposit', accountId: 'cm', type: 'deposit', date: '2026-08-03', amount: 10 },
      { id: 'withdrawal', accountId: 'cm', type: 'withdrawal', date: '2026-08-04', amount: -5 },
      { id: 'purchase-entry', accountId: 'cm', type: 'purchase', date: '2026-08-05', amount: -30, referenceType: 'purchase', referenceId: 'buy' },
      { id: 'sale-entry', accountId: 'cm', type: 'sale', date: '2026-08-06', amount: 40, referenceType: 'sale', referenceId: 'sale' },
      { id: 'fee', accountId: 'cm', type: 'fee', date: '2026-08-06', amount: -2 },
      { id: 'refund', accountId: 'cm', type: 'refund', date: '2026-08-07', amount: 3 },
      { id: 'correction', accountId: 'cm', type: 'correction', date: '2026-08-08', amount: 1 }
    ]
  };
}

test('Schema 8 wird verlustfrei auf Schema 9 migriert und unbekannter EK bleibt unbekannt', t => {
  const { root, databasePath, backupRoot } = sandbox(t);
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(fs.readFileSync(schemaPath, 'utf8'));
  legacy.exec('DELETE FROM schema_version;');
  legacy.prepare('INSERT INTO schema_version (version, applied_at) VALUES (8, ?)').run('2026-08-01');
  const legacyState = {
    settings: {}, purchases: [], sales: [],
    inventory: [
      { id: 'unknown', name: 'Ohne EK', cost: 0, listingPrice: 1, listed: true },
      { id: 'free', name: 'Bestätigt kostenlos', cost: 0, purchaseId: 'p1', purchaseLineKey: 'p1:l1' },
      { id: 'known', name: 'Mit EK', cost: 2.5 }
    ], privateCollection: []
  };
  legacy.prepare('INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, ?)').run(JSON.stringify(legacyState), '2026-08-01');
  legacy.close();

  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  assert.equal(database.getStatus().schemaVersion, CURRENT_SCHEMA_VERSION);
  const migrated = database.loadState().state;
  assert.deepEqual(migrated.inventory.map(row => row.costStatus), ['unknown', 'confirmed_zero', 'known']);
  assert.equal(migrated.inventory[0].listingHistory[0].eventType, 'baseline');
  assert.equal(migrated.inventory[0].holdingProfile, 'standard');
  assert.equal(fs.readdirSync(path.join(backupRoot, 'Migrationen')).filter(name => name.endsWith('.sqlite')).length, 1);
});

test('eine fehlgeschlagene Schema-9-Migration rollt App-Daten und Versionsstand zurück', t => {
  const { root, databasePath, backupRoot } = sandbox(t, 'tcg-phase1-rollback-');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const seed = new DatabaseSync(databasePath);
  seed.exec(fs.readFileSync(schemaPath, 'utf8'));
  seed.exec('DELETE FROM schema_version;');
  seed.prepare('INSERT INTO schema_version (version, applied_at) VALUES (8, ?)').run('2026-08-01');
  const original = JSON.stringify({ settings: {}, inventory: [{ id: 'keep', name: 'Bleibt' }] });
  seed.prepare('INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, ?)').run(original, '2026-08-01');
  seed.close();

  class BrokenMigrationDatabase extends TcgDatabase {
    migrateToVersion9() {
      super.migrateToVersion9();
      throw new Error('absichtlicher Testfehler');
    }
  }
  const database = new BrokenMigrationDatabase({ databasePath, schemaPath, backupRoot });
  assert.throws(() => database.open(), /absichtlicher Testfehler/);
  database.close();
  const check = new DatabaseSync(databasePath);
  assert.equal(check.prepare('SELECT MAX(version) version FROM schema_version').get().version, 8);
  assert.equal(check.prepare('SELECT state_json FROM app_state WHERE id=1').get().state_json, original);
  check.close();
});

test('Kapitaljournal berechnet Konten und Umbuchungen ohne Käufe oder Verkäufe doppelt zu zählen', t => {
  const { root, databasePath, backupRoot } = sandbox(t, 'tcg-phase1-capital-');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const state = stateWithPhase1Fields();
  state.purchases = [{ id: 'buy', status: 'Eingetroffen', cardValue: 30 }];
  state.sales = [{ id: 'sale', status: 'Abgeschlossen', revenue: 40, cardValue: 40 }];
  database.saveState(state);
  const balances = database.db.prepare('SELECT account_id, SUM(amount) balance FROM capital_ledger_entries WHERE archived=0 GROUP BY account_id ORDER BY account_id').all().map(row => ({ ...row }));
  assert.deepEqual(balances, [{ account_id: 'bank', balance: 20 }, { account_id: 'cm', balance: 97 }]);
  assert.equal(balances.reduce((sum, row) => sum + row.balance, 0), 117);
  assert.equal(database.db.prepare('SELECT COUNT(*) count FROM capital_ledger_entries WHERE archived=0').get().count, 10, 'Kauf und Verkauf erzeugen neben den bewussten Buchungen keine zweite Kapitalbewegung');
});

test('ein leerer Startzustand darf einen gefüllten SQLite-Stand nicht überschreiben', t => {
  const { root, databasePath, backupRoot } = sandbox(t, 'tcg-startup-safety-');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });

  database.saveState({
    settings: {},
    inventory: [{ id: 'asset-safe', name: 'Bleibt erhalten', productId: '100' }],
    privateCollection: [], purchases: [], sales: []
  });

  assert.throws(() => database.saveState({
    settings: {}, inventory: [], privateCollection: [], purchases: [], sales: []
  }), /Sicherheitsabbruch/);
  assert.equal(database.loadState().state.inventory[0].id, 'asset-safe');

  database.saveState({
    settings: {}, inventory: [], privateCollection: [], purchases: [], sales: []
  }, { allowDestructiveReset: true });
  assert.equal(database.loadState().state.inventory.length, 0, 'bewusst bestätigtes Zurücksetzen bleibt möglich');
});

test('Inseratsverlauf, ursprüngliches VK-Ziel und Halteprofil überstehen Speichern und erneutes Materialisieren', t => {
  const { root, databasePath, backupRoot } = sandbox(t, 'tcg-phase1-listing-');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const state = stateWithPhase1Fields();
  state.inventory.push({ ...state.inventory[0], id: 'asset-2', cost: 3, listingPrice: 4.5, listingHistory: [] });
  database.saveState(state);
  const asset = { ...database.db.prepare('SELECT acquisition_cost_status, original_target_sell, current_listing_price, is_listed, holding_profile, long_term_hold FROM inventory_assets WHERE inventory_id=?').get('asset-1') };
  assert.deepEqual(asset, { acquisition_cost_status: 'known', original_target_sell: 5, current_listing_price: 4, is_listed: 1, holding_profile: 'long_term', long_term_hold: 1 });
  assert.equal(database.db.prepare('SELECT COUNT(*) count FROM inventory_listing_history WHERE inventory_id=? AND archived=0').get('asset-1').count, 1);
  const loaded = database.loadState().state.inventory[0];
  assert.equal(loaded.originalTargetSell, 5);
  assert.equal(loaded.listingHistory[0].newPrice, 4);
  const samePrintCosts = database.db.prepare('SELECT acquisition_cost FROM inventory_assets WHERE product_id=? AND archived=0 ORDER BY inventory_id').all('100').map(row => row.acquisition_cost);
  assert.deepEqual(samePrintCosts, [2, 3], 'physische Exemplare desselben Prints behalten unterschiedliche EKs');
});

test('Bestandsimporte dürfen neue Handelsfelder eines vorhandenen Exemplars nicht überschreiben', () => {
  const existing = stateWithPhase1Fields().inventory[0];
  const merged = automation.mergeInventorySnapshot(existing, {
    name: 'Aktualisierter Name', listingPrice: 4.5, listed: true,
    cost: 0, costStatus: 'unknown', originalTargetSell: 1,
    purchaseId: 'overwrite', purchaseDate: '2026-08-14',
    holdingProfile: 'quick', longTermHold: false, listingHistory: []
  });
  assert.equal(merged.name, 'Aktualisierter Name');
  assert.equal(merged.listingPrice, 4.5);
  assert.equal(merged.cost, 2);
  assert.equal(merged.costStatus, 'known');
  assert.equal(merged.purchaseId, 'purchase-1');
  assert.equal(merged.purchaseDate, '2026-07-15');
  assert.equal(merged.originalTargetSell, 5);
  assert.equal(merged.holdingProfile, 'long_term');
  assert.equal(merged.longTermHold, true);
  assert.equal(merged.listingHistory.length, 1);
});

test('Mindestgewinn in Euro begrenzt den Max-EK zusätzlich zum Mindest-ROI', () => {
  const withoutMinimum = automation.calculateAutomaticPriceTargets({ liveOffer: 10 }, { feePercent: 5, packaging: 0.2, safetyPercent: 0, minRoi: 10, minProfit: 0 });
  const withMinimum = automation.calculateAutomaticPriceTargets({ liveOffer: 10 }, { feePercent: 5, packaging: 0.2, safetyPercent: 0, minRoi: 10, minProfit: 3 });
  assert.equal(withoutMinimum.maxBuy, 8.45);
  assert.equal(withMinimum.maxBuy, 6.3);
  assert.equal(withMinimum.minProfit, 3);
  const owned = automation.calculateOwnedCardPriceTargets({ liveOffer: 10, cost: 5 }, { feePercent: 5, packaging: 0.2, minRoi: 25, minProfit: 0.5 });
  assert.equal(owned.expectedProfit, 4.3);
  assert.equal(owned.expectedRoi, 86);
});
