const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { TcgDatabase } = require('../app/main/database');
const { parseSpreadsheetFile } = require('../app/main/spreadsheet-import-parser');
const purchaseImport = require('../app/shared/purchase-price-import');

const EXPECTED_SHEET_TOTALS = Object.freeze({
  LON: 69.89,
  TLM: 44.46,
  EEN: 19.21,
  EOJ: 25.21,
  POTD: 19.47,
  STON: 166.78
});
const EXPECTED_SOURCE_TOTAL = 345.02;
const EXPECTED_MATCHED_QUANTITY = 393;
const EXPECTED_PRIVATE_MISSING = 20;
const EXPECTED_BUSINESS_MISSING = 'POTD-DE039';
const EXPECTED_COHORT_DATE = '2026-09-19';
const EXPECTED_ORDER = '1303018590';

function round(value, digits = 8) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readStoredState(databasePath) {
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const row = database.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) throw new Error('Die SQLite-Datenbank enthält keinen gespeicherten App-State.');
    return { state: JSON.parse(row.state_json), stateJson: row.state_json, updatedAt: row.updated_at || '' };
  } finally {
    database.close();
  }
}

function assertSpecificPurchase(preview) {
  if (!preview.canApply) throw new Error('Die Tabellen-Vorschau ist nicht sicher anwendbar.');
  if (preview.errors.length || preview.ambiguous.length || preview.skipped.length) {
    throw new Error(`Unerwartete Tabellenprobleme: Fehler ${preview.errors.length}, mehrdeutig ${preview.ambiguous.length}, übersprungen ${preview.skipped.length}.`);
  }
  if (preview.matchedQuantity !== EXPECTED_MATCHED_QUANTITY || preview.matched.length !== EXPECTED_MATCHED_QUANTITY) {
    throw new Error(`Unerwartete Treffermenge: ${preview.matchedQuantity}/${preview.matched.length} statt ${EXPECTED_MATCHED_QUANTITY}.`);
  }
  if (Math.abs(Number(preview.sourceAllocatedCost) - EXPECTED_SOURCE_TOTAL) > 1e-8) {
    throw new Error(`Unerwartete Quellsumme: ${preview.sourceAllocatedCost} statt ${EXPECTED_SOURCE_TOTAL}.`);
  }
  if (preview.detectedCohort?.date !== EXPECTED_COHORT_DATE) {
    throw new Error(`Das eindeutig erkannte Einkaufslos hat das Datum ${preview.detectedCohort?.date || 'unbekannt'} statt ${EXPECTED_COHORT_DATE}.`);
  }
  for (const [sheet, expected] of Object.entries(EXPECTED_SHEET_TOTALS)) {
    const actual = preview.sheetTotals.find(row => row.sheet === sheet)?.allocatedCost;
    if (Math.abs(Number(actual) - expected) > 1e-8) {
      throw new Error(`Unerwartete EK-Summe in ${sheet}: ${actual} statt ${expected}.`);
    }
  }
  const privateMissing = preview.missing.filter(row => row.ownership === 'private');
  const businessMissing = preview.missing.filter(row => row.ownership !== 'private');
  if (privateMissing.length !== EXPECTED_PRIVATE_MISSING
    || businessMissing.length !== 1
    || String(businessMissing[0]?.collectorNumber || '').toUpperCase() !== EXPECTED_BUSINESS_MISSING) {
    throw new Error('Die fehlenden/privaten Tabellenpositionen entsprechen nicht der geprüften 345-Euro-Sammlung.');
  }
}

function buildRepairPlan(state, odsPath) {
  const parsed = parseSpreadsheetFile({ fileName: path.basename(odsPath), data: fs.readFileSync(odsPath) });
  const preview = purchaseImport.buildPreview([parsed], state.inventory || []);
  assertSpecificPurchase(preview);
  const weighted = purchaseImport.reweightPreviewByExpectedSell(preview);
  if (!weighted.canApply || weighted.valueWeightedErrors.length) {
    throw new Error(`Die wertgewichtete EK-Verteilung ist nicht anwendbar: ${JSON.stringify(weighted.valueWeightedErrors)}`);
  }
  const assetCosts = new Map();
  for (const match of weighted.matched) {
    for (const assetId of match.assetIds) {
      if (assetCosts.has(String(assetId))) throw new Error(`Bestandsexemplar doppelt zugeordnet: ${assetId}`);
      assetCosts.set(String(assetId), Number(match.newCostPerItem));
    }
  }
  if (assetCosts.size !== EXPECTED_MATCHED_QUANTITY) {
    throw new Error(`Unerwartete Anzahl konkreter Bestandsexemplare: ${assetCosts.size}.`);
  }
  return { preview: weighted, assetCosts };
}

function applyCostPlan(state, plan) {
  const changedAssets = [];
  const inventoryById = new Map((state.inventory || []).map(item => [String(item.id), item]));
  for (const [assetId, newCost] of plan.assetCosts) {
    const item = inventoryById.get(assetId);
    if (!item) throw new Error(`Das geprüfte Bestandsexemplar ${assetId} fehlt vor der Übernahme.`);
    const oldCost = Number(item.cost || 0);
    const oldStatus = String(item.costStatus || '');
    item.cost = newCost;
    item.costStatus = newCost === 0 ? 'confirmed_zero' : 'known';
    changedAssets.push({ assetId, collectorNumber: item.collectorNumber || item.setCode || '', oldCost, newCost, oldStatus, newStatus: item.costStatus });
  }

  const changedSales = [];
  const skippedManualSales = [];
  const skippedIncompleteSales = [];
  for (const sale of state.sales || []) {
    const itemIds = Array.isArray(sale.itemIds) ? sale.itemIds.map(String) : [];
    if (!itemIds.some(id => plan.assetCosts.has(id))) continue;
    const linked = String(sale.historicalCostStatus || '').toLowerCase() === 'linked'
      || String(sale.costSource || '').toLowerCase() === 'inventory_lots';
    if (!linked) {
      skippedManualSales.push(String(sale.orderNo || sale.id || 'unbekannt'));
      continue;
    }
    const assets = itemIds.map(id => inventoryById.get(id));
    if (assets.some(item => !item)
      || assets.some(item => !['known', 'confirmed_zero'].includes(String(item?.costStatus || '')))) {
      skippedIncompleteSales.push(String(sale.orderNo || sale.id || 'unbekannt'));
      continue;
    }
    const oldCost = Number(sale.cost || 0);
    const newCost = round(assets.reduce((sum, item) => sum + Number(item.cost || 0), 0));
    sale.cost = newCost;
    sale.historicalCostStatus = 'linked';
    sale.costSource = 'inventory_lots';
    changedSales.push({ orderNo: String(sale.orderNo || sale.id || ''), oldCost, newCost, linkedItems: itemIds.length });
  }
  const targetSale = changedSales.find(row => row.orderNo === EXPECTED_ORDER);
  if (!targetSale || targetSale.linkedItems !== 44 || Math.abs(targetSale.newCost - 1.00173471) > 1e-8) {
    throw new Error(`Bestellung ${EXPECTED_ORDER} wurde nicht wie geprüft korrigiert.`);
  }
  return { changedAssets, changedSales, skippedManualSales, skippedIncompleteSales };
}

function makeReport(state, plan, changes = null) {
  const bySheet = plan.preview.matched.reduce((result, row) => {
    const sheet = row.sourceRows[0]?.sheet || 'UNBEKANNT';
    result[sheet] = round((result[sheet] || 0) + Number(row.allocatedCost || 0));
    return result;
  }, {});
  return {
    mode: changes ? 'applied' : 'dry-run',
    cohortDate: plan.preview.detectedCohort?.date,
    sourceTotal: plan.preview.sourceAllocatedCost,
    sourceQuantity: plan.preview.sourceQuantity,
    matchedAssets: plan.assetCosts.size,
    missingPrivate: plan.preview.missing.filter(row => row.ownership === 'private').length,
    missingBusiness: plan.preview.missing.filter(row => row.ownership !== 'private').map(row => row.collectorNumber),
    weightedBusinessCostBySheet: bySheet,
    weightedBusinessCost: round(Object.values(bySheet).reduce((sum, value) => sum + value, 0)),
    changedSales: changes?.changedSales || [],
    skippedManualSales: changes?.skippedManualSales || [],
    skippedIncompleteSales: changes?.skippedIncompleteSales || [],
    targetOrder: (state.sales || []).find(sale => String(sale.orderNo || '') === EXPECTED_ORDER)
      ? { orderNo: EXPECTED_ORDER, cost: Number((state.sales || []).find(sale => String(sale.orderNo || '') === EXPECTED_ORDER).cost || 0) }
      : null
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const positional = args.filter(value => !value.startsWith('--'));
  const userProfile = process.env.USERPROFILE || '';
  const databasePath = path.resolve(positional[0] || path.join(userProfile, 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite'));
  const odsPath = path.resolve(positional[1] || path.join(userProfile, 'Desktop', 'TCG_Einkauf_Verkauf.ods'));
  const backupRoot = path.join(path.dirname(path.dirname(databasePath)), 'Backups');
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (!fs.existsSync(databasePath)) throw new Error(`Datenbank nicht gefunden: ${databasePath}`);
  if (!fs.existsSync(odsPath)) throw new Error(`ODS-Datei nicht gefunden: ${odsPath}`);

  const stored = readStoredState(databasePath);
  const plan = buildRepairPlan(stored.state, odsPath);
  if (!apply) {
    console.log(JSON.stringify(makeReport(stored.state, plan), null, 2));
    console.log('Nur geprüft; Datenbank unverändert. Für die Übernahme --apply verwenden.');
    return;
  }

  const backupDirectory = path.join(backupRoot, 'Manuelle Korrekturen');
  fs.mkdirSync(backupDirectory, { recursive: true });
  const backupPath = path.join(backupDirectory, `vor-ek-korrektur-345-${timestamp()}.json`);
  fs.writeFileSync(backupPath, stored.stateJson, { encoding: 'utf8', flag: 'wx' });
  const backupHash = sha256(stored.stateJson);

  const changes = applyCostPlan(stored.state, plan);
  let database;
  try {
    database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
    database.saveState(stored.state);
    const validation = database.validateStartup();
    const reloaded = database.loadState().state;
    const verification = buildRepairPlan(reloaded, odsPath);
    for (const [assetId, expectedCost] of verification.assetCosts) {
      const actual = (reloaded.inventory || []).find(item => String(item.id) === assetId);
      if (!actual || Math.abs(Number(actual.cost) - expectedCost) > 1e-10) {
        throw new Error(`Persistenzprüfung fehlgeschlagen: ${assetId}.`);
      }
    }
    const report = {
      ...makeReport(reloaded, verification, changes),
      validation,
      backupPath,
      backupSha256: backupHash
    };
    const reportPath = path.join(backupDirectory, `bericht-ek-korrektur-345-${timestamp()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), { encoding: 'utf8', flag: 'wx' });
    console.log(JSON.stringify({ ...report, reportPath }, null, 2));
  } finally {
    database?.close();
  }
}

if (require.main === module) main();

module.exports = { buildRepairPlan, applyCostPlan, assertSpecificPurchase };
