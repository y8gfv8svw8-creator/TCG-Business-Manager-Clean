const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { TcgDatabase } = require('../app/main/database');

const sourcePath = process.env.TCG_MANAGER_REAL_DB || path.join(
  process.env.USERPROFILE || '', 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite'
);
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function fileSignature(file) {
  const stats = fs.statSync(file);
  return { size: stats.size, mtimeMs: stats.mtimeMs };
}

if (!fs.existsSync(sourcePath)) throw new Error(`Echte Datenbank nicht gefunden: ${sourcePath}`);
const before = fileSignature(sourcePath);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase5-real-db-'));
const copyPath = path.join(root, 'phase5-copy.sqlite');
let database;
try {
  fs.copyFileSync(sourcePath, copyPath);
  const original = new DatabaseSync(copyPath, { readOnly: true });
  const originalIntegrity = original.prepare('PRAGMA integrity_check').get()?.integrity_check || '';
  const originalSchema = Number(original.prepare('SELECT MAX(version) version FROM schema_version').get()?.version || 0);
  original.close();
  if (originalIntegrity !== 'ok') throw new Error('SQLite-Integrität der unveränderten Datenbankkopie ist nicht OK.');

  const backupRoot = path.join(root, 'backups');
  database = new TcgDatabase({ databasePath: copyPath, schemaPath, backupRoot }).open();
  const state = database.loadState().state || {};
  const status = database.getStatus();
  const integrity = database.db.prepare('PRAGMA integrity_check').get()?.integrity_check || '';
  const marketPriceRows = Number(database.db.prepare('SELECT COUNT(*) count FROM market_prices').get()?.count || 0);
  const normalized = {
    analyses: Number(database.db.prepare('SELECT COUNT(*) count FROM collection_purchase_analyses WHERE archived=0').get()?.count || 0),
    items: Number(database.db.prepare('SELECT COUNT(*) count FROM collection_purchase_items WHERE archived=0').get()?.count || 0),
    snapshots: Number(database.db.prepare('SELECT COUNT(*) count FROM collection_purchase_decision_snapshots WHERE archived=0').get()?.count || 0)
  };
  const migrationRoot = path.join(backupRoot, 'Migrationen');
  const migrationBackups = fs.existsSync(migrationRoot) ? fs.readdirSync(migrationRoot).filter(name => name.includes(`v${originalSchema}_vor_v11`)) : [];
  const report = {
    sourcePath, originalSchema, migratedCopySchema: status.schemaVersion, integrity,
    counts: {
      inventory: (state.inventory || []).length,
      privateCards: (state.privateCollection || []).length,
      purchases: (state.purchases || []).length,
      sales: (state.sales || []).length,
      priceGuideHistoryRows: marketPriceRows,
      collectionAnalyses: (state.collectionPurchaseAnalyses || []).length
    },
    normalizedCollectionRows: normalized,
    migrationBackupCreated: originalSchema < 11 ? migrationBackups.length > 0 : 'nicht erforderlich'
  };
  if (integrity !== 'ok' || status.schemaVersion !== 11) throw new Error(`PHASE-5-Datenbankprüfung fehlgeschlagen: ${JSON.stringify(report)}`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  database?.close();
  fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
const after = fileSignature(sourcePath);
if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) throw new Error('Die echte Datenbank wurde während der PHASE-5-Prüfung verändert.');
console.log('Originaldatenbank unverändert; temporäre PHASE-5-Kopie und Migrationssicherung entfernt.');
