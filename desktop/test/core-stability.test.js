const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');
const { isRecoverableIndexedDbError, createIndexedDbRecovery } = require('../app/shared/indexeddb-recovery');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function temporaryDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-core-stability-'));
  const database = new TcgDatabase({
    databasePath: path.join(root, 'data.sqlite'),
    schemaPath,
    backupRoot: path.join(root, 'backups')
  }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return database;
}

function stableState() {
  return {
    settings: {},
    inventory: [{ id: 'asset-1', productId: '100', name: 'Sichere Karte', status: 'Im Bestand' }],
    privateCollection: [{ id: 'private-1', productId: '101', name: 'Private Karte' }],
    purchases: [{ id: 'purchase-1', orderNo: 'BUY-1', pendingItems: [] }],
    sales: [{ id: 'sale-1', orderNo: 'SALE-1', items: [] }]
  };
}

test('SQLite-Startprüfung bestätigt Integrität, Schema und materialisierten App-State', t => {
  const database = temporaryDatabase(t);
  database.saveState(stableState());
  const validation = database.validateStartup();
  assert.equal(validation.valid, true);
  assert.equal(validation.integrity, 'ok');
  assert.equal(validation.foreignKeys, 'ok');
  assert.equal(validation.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(validation.counts, { inventory: 1, privateCollection: 1, purchases: 1, sales: 1 });
  assert.equal(database.loadState().validation.valid, true);
});

test('SQLite-Startprüfung kennzeichnet eine neue leere Datenbank ausdrücklich', t => {
  const database = temporaryDatabase(t);
  const validation = database.validateStartup();
  assert.equal(validation.valid, true);
  assert.equal(validation.isEmpty, true);
  assert.equal(validation.hasStoredState, false);
  assert.equal(validation.coreRecordCount, 0);
});

test('SQLite-Startprüfung stoppt bei beschädigtem App-State statt einen Ersatzstand zu liefern', t => {
  const database = temporaryDatabase(t);
  database.saveState(stableState());
  database.db.prepare("UPDATE app_state SET state_json = '{kaputt' WHERE id = 1").run();
  assert.throws(() => database.validateStartup(), /gespeicherte Programmstand ist beschädigt/i);
  assert.throws(() => database.loadState(), /Gespeicherter Programmstand ist beschädigt/i);
});

test('SQLite-Startprüfung stoppt bei Abweichung zwischen App-State und normalisierten Tabellen', t => {
  const database = temporaryDatabase(t);
  database.saveState(stableState());
  database.db.prepare("UPDATE inventory_assets SET archived = 1 WHERE inventory_id = 'asset-1'").run();
  assert.throws(() => database.validateStartup(), /App-State und Tabellen stimmen nicht überein/i);
});

test('Cardmarket-Oberflächen-Cache kann aus den dauerhaften SQLite-Daten neu aufgebaut werden', t => {
  const database = temporaryDatabase(t);
  database.upsertProducts([{
    productId: '741275', metacardId: '123', germanName: 'Nibiru, das Urwesen',
    englishName: 'Nibiru, the Primal Being', setName: '25th Anniversary Rarity Collection',
    setCode: 'RA01-EN015', rarity: 'Secret Rare'
  }]);
  database.upsertMarketPrices({
    snapshotDate: '2026-09-16',
    rows: [{ productId: '741275', low: 1, trend: 2.59, avg7: 2.9, avg30: 2.53 }]
  });
  const seed = database.getCardmarketCacheSeed({ limit: 100 });
  assert.equal(seed.productsDone, true);
  assert.equal(seed.pricesDone, true);
  assert.equal(seed.products[0].productId, '741275');
  assert.equal(seed.products[0].germanName, 'Nibiru, das Urwesen');
  assert.equal(seed.latestPrices[0].productId, '741275');
  assert.equal(seed.latestPrices[0].date, '2026-09-16');
  assert.equal(seed.latestPrices[0].trend, 2.59);
});

test('Cardmarket-Cache erkennt UnknownError Internal error als reparierbaren Defekt', () => {
  assert.equal(isRecoverableIndexedDbError(Object.assign(new Error('Internal error'), { name: 'UnknownError' })), true);
  assert.equal(isRecoverableIndexedDbError(new Error('UnknownError: Internal error')), true);
  assert.equal(isRecoverableIndexedDbError(Object.assign(new Error('Zugriff verweigert'), { name: 'SecurityError' })), false);
});

test('IndexedDB-Defekt wird automatisch gelöscht, neu initialisiert und einmal wiederholt', async () => {
  let openCalls = 0;
  let deleteCalls = 0;
  let rebuildCalls = 0;
  const healthyDatabase = { close() {}, onversionchange: null };
  const fakeIndexedDb = {
    open() {
      openCalls += 1;
      const request = {};
      setImmediate(() => {
        if (openCalls === 1) {
          request.error = Object.assign(new Error('Internal error'), { name: 'UnknownError' });
          request.onerror();
        } else {
          request.result = healthyDatabase;
          request.onsuccess();
        }
      });
      return request;
    },
    deleteDatabase() {
      deleteCalls += 1;
      const request = {};
      setImmediate(() => request.onsuccess());
      return request;
    }
  };
  const manager = createIndexedDbRecovery({ indexedDB: fakeIndexedDb, name: 'cardmarket-test', version: 1 });
  const result = await manager.withRecovery(async database => {
    assert.equal(database, healthyDatabase);
    return 'bereit';
  }, { rebuild: async database => { assert.equal(database, healthyDatabase); rebuildCalls += 1; } });
  assert.equal(result, 'bereit');
  assert.equal(openCalls, 2);
  assert.equal(deleteCalls, 1);
  assert.equal(rebuildCalls, 1);
  assert.equal(manager.getRepairGeneration(), 1);
});

test('manuelle IndexedDB-Reparatur löscht nur den Cache und führt den Rebuild aus', async () => {
  let deleteCalls = 0;
  let rebuildCalls = 0;
  const fakeIndexedDb = {
    open() {
      const request = {};
      setImmediate(() => { request.result = { close() {}, onversionchange: null }; request.onsuccess(); });
      return request;
    },
    deleteDatabase() {
      deleteCalls += 1;
      const request = {};
      setImmediate(() => request.onsuccess());
      return request;
    }
  };
  const manager = createIndexedDbRecovery({ indexedDB: fakeIndexedDb, name: 'manual-test', version: 1 });
  await manager.repair({ rebuild: async () => { rebuildCalls += 1; } });
  assert.equal(deleteCalls, 1);
  assert.equal(rebuildCalls, 1);
});

test('Startoberfläche enthält Sicherheitsstopp und sichtbare Cache-Reparatur', () => {
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'index.html'), 'utf8');
  const cardmarket = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'cardmarket-data-center.js'), 'utf8');
  assert.match(indexHtml, /Sicherheitsstopp: Datenbank nicht geladen/);
  assert.match(indexHtml, /Leeren, geprüften Stand öffnen/);
  assert.match(indexHtml, /id="cmRepairCacheBtn"[^>]*>Cache reparieren</);
  assert.match(cardmarket, /cmRepairCardmarketCache/);
  assert.match(cardmarket, /getCardmarketCacheSeed/);
});
