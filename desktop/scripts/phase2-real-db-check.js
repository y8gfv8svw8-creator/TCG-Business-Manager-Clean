const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { TcgDatabase } = require('../app/main/database');
const automation = require('../app/shared/business-automation');
const { normalizeSettings } = require('../app/shared/app-config');

const sourcePath = path.resolve(process.argv[2] || '');
const outputRoot = path.resolve(process.argv[3] || path.join(os.tmpdir(), `tcg-phase2-real-check-${Date.now()}`));
if (!fs.existsSync(sourcePath)) throw new Error(`Quelldatenbank fehlt: ${sourcePath}`);
if (!outputRoot.toLowerCase().startsWith(path.resolve(os.tmpdir()).toLowerCase())) {
  throw new Error('Der Testordner muss innerhalb des Windows-Temp-Ordners liegen.');
}
fs.mkdirSync(outputRoot, { recursive: true });

const sqlLiteral = value => String(value).replaceAll("'", "''");
const copyPath = path.join(outputRoot, 'tcg_business_manager_phase2_test.sqlite');
const beforeStat = fs.statSync(sourcePath);
const source = new DatabaseSync(sourcePath, { readOnly: true });
const sourceIntegrity = String(source.prepare('PRAGMA integrity_check').get()?.integrity_check || '');
const beforeVersion = Number(source.prepare('SELECT MAX(version) version FROM schema_version').get()?.version || 0);
const beforeState = JSON.parse(String(source.prepare('SELECT state_json FROM app_state WHERE id=1').get()?.state_json || '{}'));
source.exec(`VACUUM INTO '${sqlLiteral(copyPath)}'`);
source.close();

const database = new TcgDatabase({
  databasePath: copyPath,
  schemaPath: path.join(__dirname, '..', 'database', 'schema.sql'),
  backupRoot: path.join(outputRoot, 'backups')
}).open();
const afterState = database.loadState().state;
const copyIntegrity = String(database.db.prepare('PRAGMA integrity_check').get()?.integrity_check || '');
const currentInventory = (afterState.inventory || []).filter(item => item.ownership !== 'private' && !['Verkauft', 'Privat', 'Abgegeben', 'Storniert'].includes(item.status));
const stateBeforeAnalysis = JSON.stringify(afterState);
const capital = automation.buildCapitalOverview(afterState, afterState.productCatalog || {});
const aging = automation.buildAgingSummary(currentInventory, afterState.productCatalog || {}, normalizeSettings(afterState.settings || {}));
const analysisDidNotMutateState = stateBeforeAnalysis === JSON.stringify(afterState);
const afterVersion = database.getStatus().schemaVersion;
const counts = state => ({
  inventory: state.inventory?.length || 0,
  privateCollection: state.privateCollection?.length || 0,
  purchases: state.purchases?.length || 0,
  sales: state.sales?.length || 0
});
const beforeCounts = counts(beforeState);
const afterCounts = counts(afterState);
database.close();

const afterStat = fs.statSync(sourcePath);
const result = {
  sourcePath,
  copyPath,
  beforeVersion,
  afterVersion,
  sourceIntegrity,
  copyIntegrity,
  originalUnchanged: beforeStat.size === afterStat.size && beforeStat.mtimeMs === afterStat.mtimeMs,
  counts: { before: beforeCounts, after: afterCounts },
  countsPreserved: JSON.stringify(beforeCounts) === JSON.stringify(afterCounts),
  analysisDidNotMutateState,
  capital: {
    liquid: capital.liquid,
    knownStockCost: capital.knownStockCost,
    listingValue: capital.listingValue,
    referenceValue: capital.referenceValue,
    physicalCards: capital.physicalCards,
    positions: capital.positions,
    knownCostCount: capital.knownCostCount,
    unknownCostCount: capital.unknownCostCount
  },
  aging: aging.map(row => ({ key: row.key, count: row.count, knownCost: row.knownCost, listingValue: row.listingValue, referenceValue: row.referenceValue }))
};

if (sourceIntegrity !== 'ok' || copyIntegrity !== 'ok' || !result.originalUnchanged || !result.countsPreserved || !analysisDidNotMutateState) {
  throw new Error(`Prüfung fehlgeschlagen: ${JSON.stringify(result)}`);
}
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
