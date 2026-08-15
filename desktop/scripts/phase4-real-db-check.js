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

function databaseSignature(file) {
  const db = new DatabaseSync(file, { readOnly: true });
  const state = db.prepare('SELECT state_json, updated_at FROM app_state WHERE id=1').get();
  const integrity = db.prepare('PRAGMA integrity_check').get()?.integrity_check || '';
  const schemaVersion = Number(db.prepare('SELECT MAX(version) version FROM schema_version').get()?.version || 0);
  db.close();
  return { updatedAt: String(state?.updated_at || ''), stateJson: String(state?.state_json || ''), integrity, schemaVersion };
}

function practiceRow(row, label) {
  if (!row) return { label, available: false, reason: 'Die aktuelle Datenbasis enthält keinen passenden dokumentierten Print.' };
  return {
    label, available: true, productId: row.productId,
    name: row.germanName || row.name || row.englishName || `CM ${row.productId}`,
    englishName: row.englishName || '', setName: row.setName || '', rarity: row.rarity || '',
    saleCount: row.saleCount, soldQuantity: row.soldQuantity,
    dataQuality: row.dataQuality.label, durationKnownCount: row.durationKnownCount,
    medianDays: row.medianDays, averageSellPrice: row.averageSellPrice,
    averageProfit: row.averageProfit, averageRoi: row.averageRoi,
    totalProfit: row.totalProfit, turnoverClass: row.turnoverClass.displayLabel,
    purchaseHint: row.purchaseHint
  };
}

if (!fs.existsSync(sourcePath)) throw new Error(`Echte Datenbank nicht gefunden: ${sourcePath}`);
const before = fileSignature(sourcePath);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase4-real-db-'));
const copyPath = path.join(root, 'phase4-copy.sqlite');
let database;
let originalCopy;
try {
  fs.copyFileSync(sourcePath, copyPath);
  originalCopy = databaseSignature(copyPath);
  database = new TcgDatabase({ databasePath: copyPath, schemaPath, backupRoot: path.join(root, 'backups') }).open();
  const state = database.loadState().state || {};
  const startedAt = performance.now();
  const ownSales = database.getOwnSalesExperience({ asOf: new Date().toISOString() });
  const queryMs = performance.now() - startedAt;
  const records = ownSales.records || [];
  const multiple = records.find(row => row.saleCount > 1);
  const single = records.find(row => row.saleCount === 1);
  const unknownCost = records.find(row => row.unknownCostQuantity > 0);
  const knownMargin = records.find(row => row.averageProfit !== null && row.averageRoi !== null);
  const integrity = database.db.prepare('PRAGMA integrity_check').get()?.integrity_check || '';
  const status = database.getStatus();
  console.log(JSON.stringify({
    sourcePath,
    originalSchemaVersion: originalCopy.schemaVersion,
    migratedCopySchemaVersion: status.schemaVersion,
    integrity,
    counts: {
      inventory: (state.inventory || []).length,
      privateCards: (state.privateCollection || []).length,
      purchases: (state.purchases || []).length,
      sales: (state.sales || []).length
    },
    learningBasis: ownSales.summary,
    ownSalesQueryMs: Number(queryMs.toFixed(1)),
    practice: [
      practiceRow(multiple, 'Print mit mehreren Verkäufen'),
      practiceRow(single, 'Print mit genau einem Verkauf'),
      practiceRow(unknownCost, 'Verkauf mit unbekanntem EK'),
      practiceRow(knownMargin, 'Verkauf mit bekannter Marge')
    ]
  }, null, 2));
} finally {
  database?.close();
  fs.rmSync(root, { recursive: true, force: true });
}
const after = fileSignature(sourcePath);
if (originalCopy?.integrity !== 'ok') throw new Error('SQLite-Integrität der unveränderten Datenbankkopie ist nicht OK.');
if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) {
  throw new Error('Die echte Datenbank wurde während der PHASE-4-Prüfung verändert.');
}
console.log('Originaldatenbank unverändert; temporäre PHASE-4-Kopie und Migrationssicherung entfernt.');
