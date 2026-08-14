const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { TcgDatabase } = require('../app/main/database');

const sourcePath = path.resolve(process.argv[2] || '');
const outputRoot = path.resolve(process.argv[3] || path.join(os.tmpdir(), `tcg-phase1-real-check-${Date.now()}`));
if (!fs.existsSync(sourcePath)) throw new Error(`Quelldatenbank fehlt: ${sourcePath}`);
if (!outputRoot.toLowerCase().startsWith(path.resolve(os.tmpdir()).toLowerCase())) {
  throw new Error('Der Testordner muss innerhalb des Windows-Temp-Ordners liegen.');
}
fs.mkdirSync(outputRoot, { recursive: true });

const copyPath = path.join(outputRoot, 'tcg_business_manager_schema9_test.sqlite');
const backupRoot = path.join(outputRoot, 'backups');
const sqlLiteral = value => String(value).replaceAll("'", "''");
const source = new DatabaseSync(sourcePath, { readOnly: true });
const beforeVersion = Number(source.prepare('SELECT MAX(version) version FROM schema_version').get()?.version || 0);
const beforeStateText = String(source.prepare('SELECT state_json FROM app_state WHERE id=1').get()?.state_json || '{}');
const beforeState = JSON.parse(beforeStateText);
source.exec(`VACUUM INTO '${sqlLiteral(copyPath)}'`);
source.close();

const database = new TcgDatabase({
  databasePath: copyPath,
  schemaPath: path.join(__dirname, '..', 'database', 'schema.sql'),
  backupRoot
}).open();
const afterState = database.loadState().state;
const stripPhase1 = value => {
  if (Array.isArray(value)) return value.map(stripPhase1);
  if (!value || typeof value !== 'object') return value;
  const omitted = new Set(['capitalAccounts', 'capitalEntries', 'costStatus', 'originalTargetSell', 'holdingProfile', 'longTermHold', 'listingHistory']);
  return Object.fromEntries(Object.entries(value).filter(([key]) => !omitted.has(key)).map(([key, child]) => [key, stripPhase1(child)]));
};
const appStatePreserved = JSON.stringify(stripPhase1(beforeState)) === JSON.stringify(stripPhase1(afterState));
const check = database.db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM inventory_assets WHERE archived=0) assets,
    (SELECT COUNT(*) FROM inventory_assets WHERE archived=0 AND acquisition_cost_status='unknown') unknown_costs,
    (SELECT COUNT(*) FROM inventory_listing_history WHERE archived=0) listing_events,
    (SELECT COUNT(*) FROM capital_accounts WHERE archived=0) capital_accounts,
    (SELECT COUNT(*) FROM capital_ledger_entries WHERE archived=0) capital_entries,
    (SELECT COUNT(*) FROM inventory_listing_history h LEFT JOIN inventory_assets i ON i.inventory_id=h.inventory_id WHERE i.inventory_id IS NULL) orphan_listing_events,
    (SELECT COUNT(*) FROM capital_ledger_entries e LEFT JOIN capital_accounts a ON a.account_id=e.account_id WHERE a.account_id IS NULL) orphan_capital_entries
`).get();
const integrity = String(database.db.prepare('PRAGMA integrity_check').get()?.integrity_check || '');
const result = {
  sourcePath,
  copyPath,
  beforeVersion,
  afterVersion: database.getStatus().schemaVersion,
  integrity,
  appStatePreserved,
  arrays: {
    inventory: [beforeState.inventory?.length || 0, afterState.inventory?.length || 0],
    privateCollection: [beforeState.privateCollection?.length || 0, afterState.privateCollection?.length || 0],
    purchases: [beforeState.purchases?.length || 0, afterState.purchases?.length || 0],
    sales: [beforeState.sales?.length || 0, afterState.sales?.length || 0]
  },
  normalized: { ...check },
  migrationBackups: fs.existsSync(path.join(backupRoot, 'Migrationen'))
    ? fs.readdirSync(path.join(backupRoot, 'Migrationen')).filter(name => name.endsWith('.sqlite')).length : 0
};
database.close();
if (result.afterVersion !== 9 || result.integrity !== 'ok' || !result.appStatePreserved || result.normalized.orphan_listing_events || result.normalized.orphan_capital_entries) {
  throw new Error(`Prüfung fehlgeschlagen: ${JSON.stringify(result)}`);
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
