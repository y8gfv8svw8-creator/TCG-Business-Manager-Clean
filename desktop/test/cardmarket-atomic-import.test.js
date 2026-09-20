const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TcgDatabase } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function temporaryDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-cardmarket-atomic-'));
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

test('atomarer Produktimport übernimmt alle Blöcke gemeinsam und protokolliert den Erfolg', t => {
  const database = temporaryDatabase(t);
  database.beginCardmarketImport({ runId: 'catalog-success', type: 'products', importedAt: '2026-09-20T10:00:00.000Z' });
  database.appendCardmarketImport({ runId: 'catalog-success', rows: [{
    productId: '741275', metacardId: '100', germanName: 'Nibiru, das Urwesen',
    officialBaseName: 'Nibiru, the Primal Being', setName: 'Rarity Collection', setCode: 'RA01-EN015', rarity: 'Secret Rare'
  }] });
  database.appendCardmarketImport({ runId: 'catalog-success', rows: [{
    productId: '260727', metacardId: '101', germanName: 'Arkane Macht EX',
    officialBaseName: 'Arcane Force EX', setName: 'Light of Destruction', setCode: 'LODT-EN001', rarity: 'Secret Rare'
  }] });
  const result = database.commitCardmarketImport({ runId: 'catalog-success', rowsRead: 2 });
  assert.equal(result.written, 2);
  assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM products').get().count, 2);
  assert.equal(database.getStatus().lastSuccessfulImport.runId, 'catalog-success');
  assert.equal(database.getStatus().lastSuccessfulImport.rowsWritten, 2);
});

test('Fehler in einem späteren Preisblock rollt den gesamten Import zurück', t => {
  const database = temporaryDatabase(t);
  database.upsertMarketPrices({ snapshotDate: '2026-09-19', rows: [{ productId: '1', low: 1, trend: 1.2 }] });
  const before = database.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get().count;
  database.beginCardmarketImport({
    runId: 'price-failure', type: 'prices', source: 'cardmarket_price_guide',
    sourceId: 'cardmarket_price_guide', snapshotDate: '2026-09-20', importedAt: '2026-09-20T10:00:00.000Z'
  });
  assert.throws(() => database.appendCardmarketImport({
    runId: 'price-failure',
    rows: [
      { productId: '2', date: '2026-09-20', low: 2, trend: 2.2 },
      { productId: '3', date: '2026-09-20', low: 3, trend: 3.2, invalid: 1n }
    ]
  }), /BigInt|serializ/i);
  assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get().count, before);
  assert.equal(database.db.prepare("SELECT COUNT(*) AS count FROM market_prices WHERE product_id IN ('2','3')").get().count, 0);
  const failed = database.getStatus().recentCardmarketImports.find(row => row.runId === 'price-failure');
  assert.equal(failed.status, 'failed');
  assert.equal(failed.rowsWritten, 0);
});

test('atomarer Preisimport aktualisiert Preis-, Beobachtungs- und Zusammenfassungstabellen gemeinsam', t => {
  const database = temporaryDatabase(t);
  database.beginCardmarketImport({
    runId: 'price-success', type: 'prices', source: 'cardmarket_price_guide',
    sourceId: 'cardmarket_price_guide', snapshotDate: '2026-09-20', importedAt: '2026-09-20T10:00:00.000Z'
  });
  database.appendCardmarketImport({ runId: 'price-success', rows: [
    { productId: '741275', date: '2026-09-20', low: 1, trend: 2.59, avg1: 3.95, avg7: 2.90, avg30: 2.53 },
    { productId: '260727', date: '2026-09-20', low: 0.02, trend: 2.50, avg1: 2.60, avg7: 2.40, avg30: 2.50 }
  ] });
  const result = database.commitCardmarketImport({ runId: 'price-success', rowsRead: 2 });
  assert.equal(result.written, 2);
  assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get().count, 2);
  assert.equal(database.db.prepare('SELECT COUNT(*) AS count FROM market_observations').get().count, 2);
  assert.equal(database.db.prepare("SELECT row_count AS count FROM market_snapshot_summary WHERE captured_date = '2026-09-20'").get().count, 2);
  assert.equal(database.db.prepare("SELECT row_count AS count FROM market_observation_summary WHERE observed_date = '2026-09-20' AND source_id = 'cardmarket_price_guide'").get().count, 2);
  assert.equal(database.getStatus().lastSuccessfulImport.runId, 'price-success');
});
