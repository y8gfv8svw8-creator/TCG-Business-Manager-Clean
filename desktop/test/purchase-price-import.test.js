const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const purchaseImport = require('../app/shared/purchase-price-import');
const { parseOdsContentXml, parseCsv } = require('../app/main/spreadsheet-import-parser');
const { TcgDatabase } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const headers = ['Kartennummer', 'Deutscher Kartenname', 'Menge', 'Status', 'Anteiliger EK gesamt', 'Inserat je Karte', 'VK-Faktor optional', 'Erwarteter VK je Karte'];

function parsedSheet(rows, name = 'EOJ') {
  return [{ fileName: `${name}.csv`, format: 'csv', sheets: [{
    name,
    rows: [
      { rowNumber: 1, cells: headers },
      ...rows.map((cells, index) => ({ rowNumber: index + 2, cells }))
    ]
  }] }];
}

function preview(rows, inventory, options = {}) {
  const total = rows.reduce((sum, row) => sum + (typeof row[4] === 'number' ? row[4] : Number(String(row[4] || '').replace(',', '.')) || 0), 0);
  return purchaseImport.buildPreview(parsedSheet(rows), inventory, {
    requiredSheets: ['EOJ'],
    controlTotal: total,
    ...options
  });
}

function asset(id, overrides = {}) {
  return {
    id,
    collectorNumber: 'EOJ-EN033',
    name: 'Testkarte',
    germanName: 'Testkarte',
    quantity: 1,
    status: 'Im Bestand',
    cost: 1,
    costStatus: 'known',
    targetSell: 2,
    originalTargetSell: 2,
    cardPrice: 0.5,
    listingPrice: 3,
    listed: true,
    listingHistory: [],
    ...overrides
  };
}

test('eindeutiger Treffer nutzt Kartennummer primär und Kartenname als Plausibilitätsprüfung', () => {
  const result = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', 7.35, 99, 0.9, 8.5]], [asset('a1')]);
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].assetIds[0], 'a1');
  assert.equal(result.matched[0].newCostPerItem, 7.35);
  assert.equal(result.matched[0].expectedSell, 8.5);
  assert.equal(result.canApply, true);
});

test('unbekannte Kartennummer wird separat gelistet und nicht verändert', () => {
  const result = preview([['EOJ-DE099', 'Unbekannte Karte', 1, 'Offen', 2, 20, 0.9, 4]], [asset('a1')]);
  assert.equal(result.matched.length, 0);
  assert.equal(result.missing.length, 1);
  assert.match(result.missing[0].reason, /nicht.*gefunden/i);
});

test('doppelter Manager-Treffer bei Tabellenmenge eins bleibt mehrdeutig', () => {
  const result = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', 2, 20, 0.9, 4]], [asset('a1'), asset('a2')]);
  assert.equal(result.matched.length, 0);
  assert.equal(result.ambiguous.length, 1);
  assert.equal(result.ambiguous[0].foundQuantity, 2);
});

test('Menge größer eins teilt den Gesamt-EK genau einmal und ändert keine Menge', () => {
  const inventory = [asset('a1', { quantity: 4 }), asset('a2', { quantity: 7 })];
  const result = preview([['EOJ-DE033', 'Testkarte', 2, 'Offen', 10, 20, 0.9, 6]], inventory);
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].newCostPerItem, 5);
  const applied = purchaseImport.applyPreview(result, inventory, { changedAt: '2026-09-20T10:00:00.000Z', makeId: () => 'history' });
  assert.deepEqual(applied.inventory.map(row => row.cost), [5, 5]);
  assert.deepEqual(applied.inventory.map(row => row.quantity), [4, 7]);
  assert.equal(applied.summary.importedCost, 10);
});

test('vorhandene manuelle Werte stehen in der Vorschau und werden erst beim Bestätigen ersetzt', () => {
  const inventory = [asset('a1', { cost: 4.25, targetSell: 7.1, originalTargetSell: 6.5 })];
  const result = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', 5.75, 99, 0.9, 8.25]], inventory);
  assert.deepEqual(result.matched[0].oldCost.values, [4.25]);
  assert.deepEqual(result.matched[0].oldExpectedSell.values, [7.1]);
  assert.equal(inventory[0].cost, 4.25);
  assert.equal(inventory[0].targetSell, 7.1);
  const applied = purchaseImport.applyPreview(result, inventory, { changedAt: '2026-09-20T10:00:00.000Z', makeId: () => 'history' });
  assert.equal(applied.inventory[0].cost, 5.75);
  assert.equal(applied.inventory[0].targetSell, 8.25);
  assert.equal(applied.inventory[0].originalTargetSell, 6.5);
  assert.equal(applied.inventory[0].listingPrice, 3);
});

test('leere Preisfelder werden unterschieden und nicht als 0 übernommen', () => {
  const costOnly = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', 4, 99, 0.9, '']], [asset('a1')]);
  const targetOnly = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', '', 99, 0.9, 6.5]], [asset('a1')], { controlTotal: 0 });
  const bothBlank = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', '', 99, 0.9, '']], [asset('a1')], { controlTotal: 0 });
  assert.equal(costOnly.matched[0].expectedSell, null);
  assert.equal(targetOnly.matched[0].newCostPerItem, null);
  assert.equal(targetOnly.matched[0].expectedSell, 6.5);
  assert.equal(bothBlank.matched.length, 0);
  assert.equal(bothBlank.errors.length, 1);
});

test('Rundung bei Gesamt-EK und Menge drei erhält die Gesamtsumme centgenau', () => {
  const inventory = [asset('a1'), asset('a2'), asset('a3')];
  const result = preview([['EOJ-DE033', 'Testkarte', 3, 'Offen', 10, 99, 0.9, 5]], inventory);
  assert.equal(result.matched[0].newCostPerItem, 3.33333333);
  const applied = purchaseImport.applyPreview(result, inventory, { makeId: () => 'history' });
  assert.ok(Math.abs(applied.summary.importedCost - 10) < 0.000001);
  assert.equal(applied.inventory.length, 3);
});

test('Kontrollsumme 345 Euro wird geprüft und kleine Abweichung nur ausgewiesen', () => {
  const setTotals = { LON: 69.89, TLM: 44.46, EEN: 19.21, EOJ: 25.21, POTD: 19.47, STON: 166.78 };
  const files = Object.entries(setTotals).map(([name, value], index) => parsedSheet([[`${name}-DE${String(index + 1).padStart(3, '0')}`, `Karte ${name}`, 1, 'Offen', value, 1, 0.9, 1]], name)[0]);
  const inventory = Object.keys(setTotals).map((name, index) => asset(`a${index}`, {
    collectorNumber: `${name}-EN${String(index + 1).padStart(3, '0')}`,
    name: `Karte ${name}`,
    germanName: `Karte ${name}`
  }));
  const result = purchaseImport.buildPreview(files, inventory);
  assert.equal(result.sourceAllocatedCost, 345.02);
  assert.equal(result.controlDifference, 0.02);
  assert.equal(result.controlWithinTolerance, true);
  assert.equal(result.canApply, true);
});

test('ODS- und CSV-Leser erkennen Kopfzeilen, Zahlen und Tabellenblattnamen', () => {
  const xml = `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:spreadsheet><table:table table:name="EOJ"><table:table-row><table:table-cell office:value-type="string"><text:p>Kartennummer</text:p></table:table-cell><table:table-cell office:value-type="string"><text:p>Menge</text:p></table:table-cell></table:table-row><table:table-row><table:table-cell office:value-type="string"><text:p>EOJ-DE033</text:p></table:table-cell><table:table-cell office:value-type="float" office:value="2"><text:p>2</text:p></table:table-cell></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
  const ods = parseOdsContentXml(xml);
  assert.equal(ods[0].name, 'EOJ');
  assert.equal(ods[0].rows[1].cells[1], 2);
  const csv = parseCsv('Kartennummer;Name;Menge\r\n"EOJ-DE033";"Test; Karte";2\r\n');
  assert.equal(csv[1].cells[1], 'Test; Karte');
  assert.equal(csv[1].cells[2], '2');
});

test('Save/Load erhält EK und Ziel-VK, ohne Bestand oder Einkaufsmengen zu verändern', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-purchase-price-import-'));
  const databasePath = path.join(root, 'data.sqlite');
  const backupRoot = path.join(root, 'backups');
  const database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  let reopened = null;
  t.after(() => {
    reopened?.close();
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const inventory = [asset('a1', { cost: 1.5, targetSell: 2.5 })];
  const result = preview([['EOJ-DE033', 'Testkarte', 1, 'Offen', 7.35, 99, 0.9, 8.5]], inventory);
  const applied = purchaseImport.applyPreview(result, inventory, { changedAt: '2026-09-20T10:00:00.000Z', makeId: () => 'history' });
  const state = {
    settings: { autoBackup: false },
    inventory: applied.inventory,
    privateCollection: [],
    purchases: [{ id: 'p1', orderNo: 'P-1', quantity: 4, pendingItems: [{ quantity: 4 }] }],
    sales: []
  };
  database.saveState(state);
  database.close();
  reopened = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  const loaded = reopened.loadState().state;
  assert.equal(loaded.inventory.length, 1);
  assert.equal(loaded.inventory[0].cost, 7.35);
  assert.equal(loaded.inventory[0].targetSell, 8.5);
  assert.equal(loaded.inventory[0].cardPrice, 0.5);
  assert.equal(loaded.inventory[0].listingPrice, 3);
  assert.equal(loaded.purchases.length, 1);
  assert.equal(loaded.purchases[0].quantity, 4);
  assert.equal(loaded.purchases[0].pendingItems[0].quantity, 4);
});
