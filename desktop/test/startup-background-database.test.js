const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TcgDatabase } = require('../app/main/database');
const { DatabaseBackgroundRunner } = require('../app/main/database-background-runner');

function createDatabaseRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-background-db-'));
  const database = new TcgDatabase({
    databasePath: path.join(root, 'Daten', 'manager.sqlite'),
    schemaPath: path.join(__dirname, '..', 'database', 'schema.sql'),
    backupRoot: path.join(root, 'Backups')
  }).open({ busyTimeoutMs: 750 });
  database.saveState({
    settings: { autoBackup: false }, inventory: [], privateCollection: [],
    purchases: [], sales: [], watchlist: []
  });
  database.upsertMarketPrices({
    snapshotDate: '2026-09-27',
    rows: [{ productId: '123456', date: '2026-09-27', low: 1.25, trend: 1.3 }]
  });
  return { root, database };
}

test('Markt-Zusammenfassungen warten im Worker und blockieren den Main-Event-Loop nicht', async t => {
  const { root, database } = createDatabaseRoot();
  const runner = new DatabaseBackgroundRunner({
    databasePath: database.databasePath,
    schemaPath: path.join(__dirname, '..', 'database', 'schema.sql'),
    backupRoot: path.join(root, 'Backups'),
    busyTimeoutMs: 1000
  });
  t.after(async () => {
    await runner.close();
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  database.db.exec('DELETE FROM market_snapshot_summary; DELETE FROM market_observation_summary; BEGIN IMMEDIATE;');
  let ticks = 0;
  const timer = setInterval(() => { ticks += 1; }, 10);
  const pending = runner.run('refreshMarketSummaries');
  await new Promise(resolve => setTimeout(resolve, 180));
  database.db.exec('COMMIT;');
  const result = await pending;
  clearInterval(timer);

  assert.ok(ticks >= 8, `Main-Event-Loop lief waehrend der SQLite-Sperre nur ${ticks}-mal weiter.`);
  assert.equal(result.snapshot.expected, 1);
  assert.equal(result.snapshot.existing, 0);
  assert.equal(result.snapshot.rebuilt, true);
  assert.equal(result.observation.expected, 1);
  assert.equal(result.observation.rebuilt, true);
  assert.equal(result.status.marketPriceCount, 1);
});

test('Startup-Abfragen benutzen die begrenzte Worker-Schnittstelle', async t => {
  const { root, database } = createDatabaseRoot();
  const runner = new DatabaseBackgroundRunner({
    databasePath: database.databasePath,
    schemaPath: path.join(__dirname, '..', 'database', 'schema.sql'),
    backupRoot: path.join(root, 'Backups')
  });
  t.after(async () => {
    await runner.close();
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  const history = await runner.run('getMarketDecisionHistory', { productIds: ['123456'], recentDays: 45 });
  const names = await runner.run('getCardNamesForProducts', { productIds: ['123456'] });
  await assert.rejects(() => runner.run('notAllowed'), /Unbekannte Hintergrundabfrage/);

  assert.equal(history.productCount, 1);
  assert.equal(history.histories['123456'].length, 1);
  assert.deepEqual(names, []);
});

test('Post-UI-Startup-Pfade fuehren schwere SQLite-Abfragen nicht mehr im Electron-Main-Thread aus', () => {
  const mainSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'main', 'main.js'), 'utf8');
  const rendererSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'app.js'), 'utf8');
  const indexSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'index.html'), 'utf8');

  assert.doesNotMatch(mainSource, /database\.ensureSnapshotSummaries\(\)/);
  assert.doesNotMatch(mainSource, /database\.ensureObservationSummaries\(\)/);
  assert.match(mainSource, /runBackgroundDatabaseAction\('refreshMarketSummaries'\)/);
  assert.match(mainSource, /runBackgroundDatabaseAction\('getMarketDecisionHistory', payload\)/);
  assert.match(mainSource, /runBackgroundDatabaseAction\('getOwnSalesExperience', payload\)/);
  assert.match(mainSource, /runBackgroundDatabaseAction\('getCardNamesForProducts', payload\)/);
  assert.match(rendererSource, /tcg-startup-ui-ready/);
  assert.match(indexSource, /window\.__TCG_STARTUP_UI_READY__ = true/);
});

