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
const {
  buildPrintReferenceDatabase,
  findSetCodeRarityCollisions
} = require('../scripts/build-print-reference');

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
      },
      {
        id: 45678901,
        name: 'Legacy White Tiger',
        card_sets: [
          { set_name: "Pharaoh's Servant", set_code: 'PSV-093', set_rarity: 'Common' },
          { set_name: "Pharaoh's Servant", set_code: 'PSV-E093', set_rarity: 'Common' },
          { set_name: "Pharaoh's Servant", set_code: 'PSV-EN093', set_rarity: 'Common' }
        ]
      },
      {
        id: 56789012,
        name: 'Legacy Revival Card',
        card_sets: [
          { set_name: 'Labyrinth of Nightmare', set_code: 'LON-006', set_rarity: 'Super Rare' },
          { set_name: 'Labyrinth of Nightmare', set_code: 'LON-G006', set_rarity: 'Super Rare' },
          { set_name: 'Labyrinth of Nightmare', set_code: 'LON-EN006', set_rarity: 'Super Rare' }
        ]
      },
      {
        id: 67890123,
        name: 'Fallback Card',
        card_sets: [{ set_name: 'Fallback Set', set_code: 'FBK-EN007', set_rarity: 'Rare' }]
      },
      {
        id: 78901234,
        name: 'Treatment Card',
        card_sets: [
          { set_name: 'Chaos Origins', set_code: 'CORI-EN029', set_rarity: 'Ultra Rare', set_treatment: 'normal' },
          { set_name: 'Chaos Origins', set_code: 'CORI-EN029', set_rarity: 'Ultra Rare', set_treatment: 'Overframe' },
          { set_name: 'Chaos Origins', set_code: 'CORI-EN029', set_rarity: 'Secret Rare' }
        ]
      },
      {
        id: 89000001,
        name: 'Expansion Matched Card',
        card_sets: [
          { set_name: 'Safe Set', set_code: 'SAFE-EN001', set_rarity: 'Rare' },
          { set_name: 'Other Set', set_code: 'OTHR-EN001', set_rarity: 'Common' }
        ]
      },
      {
        id: 89000002,
        name: 'Safe Set Anchor',
        card_sets: [{ set_name: 'Safe Set', set_code: 'SAFE-EN002', set_rarity: 'Common' }]
      },
      {
        id: 89000003,
        name: 'Other Set Anchor',
        card_sets: [{ set_name: 'Other Set', set_code: 'OTHR-EN002', set_rarity: 'Common' }]
      },
      {
        id: 89000004,
        name: 'Multiple Product Card',
        card_sets: [{ set_name: 'Safe Set', set_code: 'SAFE-EN003', set_rarity: 'Ultra Rare' }]
      }
    ],
    germanCards: [
      { id: 12345678, name: 'Beispieldrache' },
      { id: 23456789, name: 'Karte mit zwei Seltenheiten' },
      { id: 34567890, name: 'Nicht zugeordnete Karte' },
      { id: 45678901, name: 'Historischer weißer Tiger' },
      { id: 56789012, name: 'Historische Wiederbelebungskarte' },
      { id: 67890123, name: 'Fallback-Karte' },
      { id: 78901234, name: 'Treatment-Karte' },
      { id: 89000001, name: 'Expansionstreffer-Karte' },
      { id: 89000002, name: 'Sicherer Set-Anker' },
      { id: 89000003, name: 'Anderer Set-Anker' },
      { id: 89000004, name: 'Mehrprodukt-Karte' }
    ],
    cardmarketCatalog: {
      version: 3,
      createdAt: '2026-09-22',
      products: [
        { idProduct: 900001, idMetacard: 100001, idExpansion: 700001, name: 'Example Dragon' },
        { idProduct: 900002, idMetacard: 100002, idExpansion: 700002, name: 'Double Rarity Card' },
        { idProduct: 900003, idMetacard: 100002, idExpansion: 700002, name: 'Double Rarity Card' },
        { idProduct: 900004, idMetacard: 100004, idExpansion: 700004, name: 'Treatment Card' },
        { idProduct: 900005, idMetacard: 100004, idExpansion: 700004, name: 'Treatment Card' },
        { idProduct: 900010, idMetacard: 100010, idExpansion: 700010, name: 'Expansion Matched Card' },
        { idProduct: 900011, idMetacard: 100010, idExpansion: 700011, name: 'Expansion Matched Card' },
        { idProduct: 900012, idMetacard: 100011, idExpansion: 700010, name: 'Safe Set Anchor' },
        { idProduct: 900013, idMetacard: 100012, idExpansion: 700011, name: 'Other Set Anchor' },
        { idProduct: 900014, idMetacard: 100013, idExpansion: 700010, name: 'Multiple Product Card' },
        { idProduct: 900015, idMetacard: 100013, idExpansion: 700010, name: 'Multiple Product Card' }
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
  assert.equal(english[0].setCodeMatch, 'exact_full_code');
  assert.equal(german[0].setCodeMatch, 'collector_fallback');
});

for (const setCode of ['PSV-093', 'PSV-E093', 'PSV-EN093']) {
  test(`${setCode} bevorzugt ausschließlich den exakten vollständigen Setcode`, t => {
    const database = fixtureDatabase(t);
    const result = database.findPrintCandidates({ setCode });
    assert.equal(result.length, 1);
    assert.equal(result[0].setCode, setCode);
    assert.equal(result[0].setCodeMatch, 'exact_full_code');
    assert.equal(result[0].exactSetCodeMatch, true);
  });
}

test('LON-G006 bleibt als historischer Vollcode erhalten und wird exakt priorisiert', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'LON-G006' });
  assert.equal(result.length, 1);
  assert.equal(result[0].setCode, 'LON-G006');
  assert.equal(result[0].setCodeMatch, 'exact_full_code');
});

test('ohne exakten Vollcode bleibt der Collector-Fallback vorsichtig verfügbar', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'FBK-DE007' });
  assert.equal(result.length, 1);
  assert.equal(result[0].setCode, 'FBK-EN007');
  assert.equal(result[0].setCodeMatch, 'collector_fallback');
  assert.equal(result[0].exactSetCodeMatch, false);
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

test('Setcode plus Rarität kann mehrere belegte Treatments liefern', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'CORI-EN029', rarity: 'Ultra Rare' });
  assert.deepEqual(result.map(row => row.treatment), ['normal', 'overframe']);
  assert.ok(result.every(row => row.rarity === 'Ultra Rare'));
});

test('Setcode plus Rarität plus Treatment liefert genau einen Print', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({
    setCode: 'CORI-DE029',
    rarity: 'Ultra Rare',
    treatment: 'Overframe'
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].treatment, 'overframe');
  assert.equal(result[0].setCodeMatch, 'collector_fallback');
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

test('mehrere Treatments derselben Rarität erhalten keine erfundene Cardmarket-ID', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'CORI-EN029', rarity: 'Ultra Rare' });
  assert.equal(result.length, 2);
  assert.ok(result.every(row => row.cardmarketProductId === null));
  assert.ok(result.every(row => row.matchStatus === 'likely'));
});

test('vollständige eindeutige Set-Mitgliedschaft ordnet genau ein Produkt pro Expansion sicher zu', t => {
  const database = fixtureDatabase(t);
  const safe = database.findPrintCandidates({ setCode: 'SAFE-EN001' });
  const other = database.findPrintCandidates({ setCode: 'OTHR-EN001' });
  assert.equal(safe.length, 1);
  assert.equal(safe[0].cardmarketProductId, '900010');
  assert.equal(safe[0].matchStatus, 'exact');
  assert.match(safe[0].dataSource, /exact expansion membership/);
  assert.equal(other.length, 1);
  assert.equal(other[0].cardmarketProductId, '900011');
  assert.equal(other[0].matchStatus, 'exact');
});

test('mehrere Cardmarket-Produkte innerhalb der eindeutig erkannten Expansion bleiben likely', t => {
  const database = fixtureDatabase(t);
  const result = database.findPrintCandidates({ setCode: 'SAFE-EN003' });
  assert.equal(result.length, 1);
  assert.equal(result[0].cardmarketProductId, null);
  assert.equal(result[0].matchStatus, 'likely');
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
  assert.equal(stats.knownTreatmentCount + stats.unknownTreatmentCount, stats.printCount);
});

test('gebündelte Referenz priorisiert PSV-Vollcodes und behandelt LON-G006 als belegten Legacy-Alias', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());
  for (const setCode of ['PSV-093', 'PSV-E093', 'PSV-EN093']) {
    const result = database.findPrintCandidates({ setCode });
    assert.equal(result.length, 1);
    assert.equal(result[0].setCode, setCode);
    assert.equal(result[0].setCodeMatch, 'exact_full_code');
  }
  const legacy = database.findPrintCandidates({ setCode: 'LON-G006' });
  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].setCode, 'LON-006');
  assert.equal(legacy[0].setCodeMatch, 'legacy_alias');
});

test('gebündelte CORI-DE029-Daten bleiben ohne erfundenes Treatment und ohne erfundene Produkt-ID', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());
  const all = database.findPrintCandidates({ setCode: 'CORI-DE029' });
  assert.deepEqual(all.map(row => row.rarity), ['Secret Rare', 'Starlight Rare', 'Ultra Rare']);
  assert.ok(all.every(row => row.treatment === 'unknown'));
  assert.ok(all.every(row => row.cardmarketProductId === null));
  assert.ok(all.every(row => row.setCodeMatch === 'collector_fallback'));
});

test('gebündelte Referenz dokumentiert die neun bekannten Setcode-Raritäts-Kollisionen', t => {
  const { DatabaseSync } = require('node:sqlite');
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new DatabaseSync(databasePath, { readOnly: true });
  t.after(() => database.close());
  const collisions = findSetCodeRarityCollisions(database);
  assert.equal(collisions.length, 9);
  assert.ok(collisions.some(row => row.setCode === 'BLCR-EN012'));
  assert.ok(collisions.every(row => row.candidateCount === 2));
});
