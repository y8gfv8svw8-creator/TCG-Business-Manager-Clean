const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TcgDatabase } = require('../app/main/database');
const {
  PrintReferenceDatabase,
  parsePrintSetCode
} = require('../app/main/print-reference-database');
const { buildPrintReferenceDatabase } = require('../scripts/build-print-reference');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function fixturePayload() {
  return {
    englishCards: [
      {
        id: 12345678,
        name: 'Example Dragon',
        card_sets: [{ set_name: 'Enemy of Justice', set_code: 'EOJ-EN033', set_rarity: 'Rare' }]
      },
      {
        id: 23456789,
        name: 'Double Rarity Card',
        card_sets: [
          { set_name: 'Test Set', set_code: 'TST-EN001', set_rarity: 'Rare' },
          { set_name: 'Test Set', set_code: 'TST-EN001', set_rarity: 'Ultra Rare' }
        ]
      },
      {
        id: 34567890,
        name: 'Unmapped Card',
        card_sets: [{ set_name: 'Missing Set', set_code: 'MISS-EN007', set_rarity: 'Common' }]
      }
    ],
    germanCards: [
      { id: 12345678, name: 'Beispieldrache' },
      { id: 23456789, name: 'Karte mit zwei Seltenheiten' },
      { id: 34567890, name: 'Nicht zugeordnete Karte' }
    ],
    cardmarketCatalog: {
      version: 3,
      createdAt: '2026-09-22',
      products: [
        { idProduct: 900001, idMetacard: 100001, idExpansion: 700001, name: 'Example Dragon' },
        { idProduct: 900002, idMetacard: 100002, idExpansion: 700002, name: 'Double Rarity Card' },
        { idProduct: 900003, idMetacard: 100002, idExpansion: 700002, name: 'Double Rarity Card' }
      ]
    },
    versionInfo: [{ database_version: 'test-1', last_update: '2026-09-22' }]
  };
}

function fixtureDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-reference-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  buildPrintReferenceDatabase({ ...fixturePayload(), outputPath: databasePath });
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  return database;
}

test('eindeutiger Setcode liefert genau den zugehörigen Print', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'EOJ-EN033' });
  assert.equal(result.length, 1);
  assert.equal(result[0].englishName, 'Example Dragon');
  assert.equal(result[0].cardmarketProductId, '900001');
  assert.equal(result[0].matchStatus, 'exact');
});

test('deutscher und englischer Setcode derselben Position liefern denselben Print', t => {
  const database = fixtureDatabase(t);
  const english = database.findPrintCandidates({ setCode: 'EOJ-EN033' });
  const german = database.findPrintCandidates({ setCode: 'EOJ-DE033' });
  assert.equal(parsePrintSetCode('EOJ-EN033').positionKey, 'EOJ-033');
  assert.equal(parsePrintSetCode('EOJ-DE033').positionKey, 'EOJ-033');
  assert.deepEqual(german.map(row => row.printId), english.map(row => row.printId));
  assert.equal(german[0].inputSetCodeLanguage, 'de');
});

test('gleicher Setcode mit mehreren Raritäten bleibt mehrdeutig', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'TST-DE001' });
  assert.deepEqual(result.map(row => row.rarity), ['Rare', 'Ultra Rare']);
  assert.ok(result.every(row => row.matchStatus === 'likely'));
});

test('Setcode plus Rarität liefert genau einen Print-Kandidaten', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'TST-EN001', rarity: 'Ultra Rare' });
  assert.equal(result.length, 1);
  assert.equal(result[0].rarity, 'Ultra Rare');
});

test('unbekannter Setcode liefert keine Kandidaten', t => {
  const database = fixtureDatabase(t);
  assert.deepEqual(database.findPrintCandidates({ setCode: 'ZZZZ-DE999' }), []);
});

test('fehlende Cardmarket-ID bleibt sichtbar unresolved', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'MISS-DE007' });
  assert.equal(result.length, 1);
  assert.equal(result[0].cardmarketProductId, null);
  assert.equal(result[0].matchStatus, 'unresolved');
});

test('mehrdeutige Cardmarket-Produkte erzeugen niemals eine erfundene Produkt-ID', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'TST-EN001' });
  assert.ok(result.every(row => row.cardmarketProductId === null));
  assert.ok(result.every(row => row.matchStatus === 'likely'));
});

test('Aufbau der separaten Print-Referenz verändert bestehende Manager-Daten nicht', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-preserve-'));
  const mainPath = path.join(root, 'manager.sqlite');
  const referencePath = path.join(root, 'print-reference.sqlite');
  const manager = new TcgDatabase({ databasePath: mainPath, schemaPath, backupRoot: path.join(root, 'backups') }).open();
  manager.upsertProducts([{ productId: '777777', metacardId: '888888', officialName: 'Bestehende Karte' }]);
  manager.saveState({ settings: { autoBackup: false }, inventory: [{ id: 'asset-1', name: 'Bestehend' }], privateCollection: [], purchases: [], sales: [] });
  manager.close();
  const before = crypto.createHash('sha256').update(fs.readFileSync(mainPath)).digest('hex');
  buildPrintReferenceDatabase({ ...fixturePayload(), outputPath: referencePath });
  const after = crypto.createHash('sha256').update(fs.readFileSync(mainPath)).digest('hex');
  assert.equal(after, before);
  const reopened = new TcgDatabase({ databasePath: mainPath, schemaPath, backupRoot: path.join(root, 'backups') }).open();
  assert.equal(reopened.loadState().state.inventory[0].name, 'Bestehend');
  assert.equal(reopened.db.prepare("SELECT official_name FROM products WHERE product_id = '777777'").get().official_name, 'Bestehende Karte');
  reopened.close();
  fs.rmSync(root, { recursive: true, force: true });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
});

test('gebündelte lokale Referenz enthält den vollständigen geprüften Snapshot', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  assert.ok(fs.existsSync(databasePath), 'Die gebündelte Print-Referenz muss vorhanden sein.');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());
  const stats = database.getStats();
  assert.ok(stats.metacardCount > 14000);
  assert.ok(stats.printCount > 44000);
  assert.ok(stats.setPositionCount > 36000);
  assert.equal(stats.exactCardmarketCount + stats.likelyCount + stats.unresolvedCount, stats.printCount);
});
