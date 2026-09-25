const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { TcgDatabase } = require('../app/main/database');
const {
  PrintReferenceDatabase,
  parsePrintSetCode
} = require('../app/main/print-reference-database');
const {
  buildPrintReferenceDatabase,
  findSetCodeRarityCollisions,
  applyVerifiedCardmarketVariantLayer,
  remapExistingPrintReference
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

function contextualFixturePayload({ competingPrefix = false } = {}) {
  const contextualSets = (code, rarity = 'Common') => [
    { set_name: 'Context Set', set_code: `CTX-EN${code}`, set_rarity: rarity },
    ...(competingPrefix
      ? [{ set_name: 'Competing Context Set', set_code: `CTY-EN${code}`, set_rarity: rarity }]
      : [])
  ];
  return {
    englishCards: [
      {
        id: 91000001,
        name: 'Context Anchor',
        card_sets: [
          ...contextualSets('001'),
          { set_name: 'Anchor Control Set', set_code: 'CTRL-EN001', set_rarity: 'Common' }
        ]
      },
      {
        id: 91000002,
        name: 'Quoted "Card"',
        card_sets: contextualSets('002')
      },
      {
        id: 91000003,
        name: 'Context Multiple Product',
        card_sets: contextualSets('003')
      },
      {
        id: 91000004,
        name: 'Context Multiple Print',
        card_sets: [
          ...contextualSets('004', 'Rare'),
          ...contextualSets('004', 'Ultra Rare')
        ]
      }
    ],
    germanCards: [],
    cardmarketCatalog: {
      version: 3,
      createdAt: '2026-09-24',
      products: [
        { idProduct: 920001, idMetacard: 110001, idExpansion: 810001, name: 'Context Anchor', dateAdded: '2007-01-01' },
        { idProduct: 920002, idMetacard: 110001, idExpansion: 810002, name: 'Context Anchor', dateAdded: '2007-01-01' },
        { idProduct: 920003, idMetacard: 110002, idExpansion: 810001, name: 'Quoted ""Card""', dateAdded: '2099-12-31' },
        { idProduct: 920004, idMetacard: 110003, idExpansion: 810003, name: 'Quoted "Card"', dateAdded: '2001-01-01' },
        { idProduct: 920005, idMetacard: 110004, idExpansion: 810001, name: 'Context Multiple Product' },
        { idProduct: 920006, idMetacard: 110004, idExpansion: 810001, name: 'Context Multiple Product' },
        { idProduct: 920007, idMetacard: 110005, idExpansion: 810001, name: 'Context Multiple Print' }
      ]
    },
    versionInfo: [{ database_version: 'context-test-1', last_update: '2026-09-24' }]
  };
}

function normalizationFixturePayload() {
  return {
    englishCards: [
      {
        id: 93000001,
        name: 'Live☆Twin Ki-sikil',
        card_sets: [{ set_name: 'Symbol Test Set', set_code: 'SYM-EN001', set_rarity: 'Rare' }]
      },
      {
        id: 93000002,
        name: 'Here Goes Something!',
        card_sets: [{ set_name: 'Speed Duel GX: Duel Academy Box', set_code: 'SGX1-ENS01', set_rarity: 'Ultra Rare' }]
      },
      {
        id: 93000003,
        name: 'Ordinary Card',
        card_sets: [{ set_name: 'Ordinary Set', set_code: 'ORD-EN001', set_rarity: 'Common' }]
      },
      {
        id: 93000004,
        name: 'Existing Likely Anchor',
        card_sets: [
          { set_name: 'Symbol Test Set', set_code: 'SYM-EN002', set_rarity: 'Common' },
          { set_name: 'Anchor Control Set', set_code: 'CTL-EN001', set_rarity: 'Common' }
        ]
      }
    ],
    germanCards: [],
    cardmarketCatalog: {
      version: 3,
      createdAt: '2026-09-24',
      products: [
        { idProduct: 940001, idMetacard: 120001, idExpansion: 820001, name: 'LiveTwin Ki-sikil' },
        { idProduct: 940002, idMetacard: 120002, idExpansion: 820002, name: 'Here Goes Something! (Skill)' },
        { idProduct: 940003, idMetacard: 120003, idExpansion: 820003, name: 'Ordinary Card (Skill)' },
        { idProduct: 940004, idMetacard: 120004, idExpansion: 820001, name: 'Existing Likely Anchor' },
        { idProduct: 940005, idMetacard: 120004, idExpansion: 820004, name: 'Existing Likely Anchor' }
      ]
    },
    versionInfo: [{ database_version: 'normalization-test-1', last_update: '2026-09-24' }]
  };
}

function auditedResolutionFixturePayload() {
  return {
    englishCards: [
      {
        id: 98535702,
        name: 'Damage Vaccine Omega MAX',
        card_sets: [{ set_name: 'Generation Force', set_code: 'GENF-EN066', set_rarity: 'Common' }]
      },
      {
        id: 80863132,
        name: 'Muko',
        card_sets: [
          { set_name: 'Dark Revelation Volume 3', set_code: 'DR3-EN057', set_rarity: 'Super Rare' },
          { set_name: 'Soul of the Duelist', set_code: 'SOD-EN057', set_rarity: 'Super Rare' },
          { set_name: 'Soul of the Duelist', set_code: 'SOD-EN057', set_rarity: 'Ultimate Rare' }
        ]
      },
      {
        id: 56741506,
        name: 'Sky Striker Ace - Azalea Temperance',
        card_sets: [{ set_name: 'Battles of Legend: Terminal Revenge', set_code: 'BLTR-EN044', set_rarity: 'Secret Rare' }]
      },
      {
        id: 300101001,
        name: 'Ectoplasmic Fortification!',
        card_sets: [{ set_name: 'Speed Duel: Arena of Lost Souls', set_code: 'SBLS-ENS01', set_rarity: 'Super Rare' }]
      },
      {
        id: 99000001,
        name: 'Ectoplasmic Fortification',
        card_sets: [{ set_name: 'Unrelated Set', set_code: 'UNR-EN001', set_rarity: 'Common' }]
      },
      {
        id: 300302053,
        name: 'Spell of Mask (Skill Card)',
        card_sets: [{ set_name: 'Speed Duel: Battle City Box', set_code: 'SBCB-ENS08', set_rarity: 'Common' }]
      }
    ],
    germanCards: [],
    cardmarketCatalog: {
      version: 3,
      createdAt: '2026-09-25',
      products: [
        { idProduct: 950001, idMetacard: 203852, idExpansion: 830001, name: 'Damage Vaccine Ω MAX' },
        { idProduct: 950002, idMetacard: 203852, idExpansion: 830001, name: 'Damage Vaccine Ω MAX' },
        { idProduct: 950003, idMetacard: 103590, idExpansion: 830002, name: 'Null and Void' },
        { idProduct: 950004, idMetacard: 103590, idExpansion: 830003, name: 'Null and Void' },
        { idProduct: 950005, idMetacard: 436034, idExpansion: 830004, name: 'Sky Striker Ace - Azalea Temperance' },
        { idProduct: 950006, idMetacard: 436034, idExpansion: 830004, name: 'Sky Striker Ace - Azalea Temperance' },
        { idProduct: 950007, idMetacard: 431542, idExpansion: 830005, name: 'Sky Striker Ace - Azalea Temperance' },
        { idProduct: 950008, idMetacard: 269015, idExpansion: 830006, name: 'Ectoplasmic Fortification! (Skill)' },
        { idProduct: 950009, idMetacard: 269015, idExpansion: 830006, name: 'Ectoplasmic Fortification! (Skill)' },
        { idProduct: 950011, idMetacard: 459815, idExpansion: 830008, name: 'Ectoplasmic Fortification' },
        { idProduct: 950010, idMetacard: 324211, idExpansion: 830007, name: 'Spell of Mask' }
      ]
    },
    versionInfo: [{ database_version: 'audited-resolution-test-1', last_update: '2026-09-25' }]
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

test('extern belegte Cardmarket-Varianten liegen separat und veraendern keine Printzeile', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-variants-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  buildPrintReferenceDatabase({ ...fixturePayload(), outputPath: databasePath });

  const coreRows = database => JSON.stringify({
    metacards: database.prepare('SELECT * FROM reference_metacards ORDER BY 1').all(),
    positions: database.prepare('SELECT * FROM reference_set_positions ORDER BY 1').all(),
    prints: database.prepare('SELECT * FROM reference_prints ORDER BY 1').all()
  });
  let raw = new DatabaseSync(databasePath, { readOnly: true });
  const before = crypto.createHash('sha256').update(coreRows(raw)).digest('hex');
  raw.close();

  const verifiedVariant = {
    setCode: 'EOJ-EN033',
    cardmarketProductId: '990001',
    version: 'V.1',
    rarity: 'Rare',
    cardmarketProductName: 'Example Dragon (V.1 - Rare)',
    productUrl: 'https://www.cardmarket.com/en/YuGiOh/Products/Singles/Enemy-of-Justice/Example-Dragon-V1-Rare',
    productSlug: 'Example-Dragon-V1-Rare',
    expansion: 'Enemy of Justice',
    source: 'https://www.cardmarket.com/en/YuGiOh/Products?idProduct=990001',
    verifiedAt: '2026-09-25T19:48:42+02:00',
    verificationStatus: 'verified'
  };
  const report = applyVerifiedCardmarketVariantLayer({
    databasePath,
    variants: [verifiedVariant]
  });
  assert.equal(report.inserted, 1);
  assert.equal(report.integrity, 'ok');
  assert.equal(report.foreignKeyErrors, 0);

  raw = new DatabaseSync(databasePath, { readOnly: true });
  const after = crypto.createHash('sha256').update(coreRows(raw)).digest('hex');
  raw.close();
  assert.equal(after, before);

  const reference = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    reference.close();
    fs.rmSync(root, { recursive: true, force: true });
  });
  const variants = reference.findCardmarketVariants({ setCode: 'EOJ-DE033', rarity: 'Rare' });
  assert.equal(variants.length, 1);
  assert.equal(variants[0].cardmarketProductId, '990001');
  assert.equal(variants[0].version, 'V.1');
  assert.equal(variants[0].verificationStatus, 'verified');
  assert.equal(variants[0].setCodeMatch, 'collector_fallback');
  assert.equal(variants[0].treatment, null);
  assert.equal(variants[0].artwork, null);
  assert.equal(reference.findPrintCandidates({ setCode: 'EOJ-EN033' })[0].cardmarketProductId, '900001');
  assert.equal(reference.getStats().verifiedCardmarketVariantCount, 1);
});

test('unbelegte Variantendaten und erfundene Treatments werden abgewiesen', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-variant-reject-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  buildPrintReferenceDatabase({ ...fixturePayload(), outputPath: databasePath });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const base = {
    setCode: 'EOJ-EN033',
    cardmarketProductId: '990002',
    version: 'V.1',
    rarity: 'Rare',
    cardmarketProductName: 'Example Dragon (V.1 - Rare)',
    productUrl: 'https://www.cardmarket.com/en/YuGiOh/Products/Singles/Enemy-of-Justice/Example-Dragon-V1-Rare',
    productSlug: 'Example-Dragon-V1-Rare',
    expansion: 'Enemy of Justice',
    source: 'https://www.cardmarket.com/en/YuGiOh/Products?idProduct=990002',
    verifiedAt: '2026-09-25T19:48:42+02:00'
  };
  assert.throws(() => applyVerifiedCardmarketVariantLayer({
    databasePath,
    variants: [{ ...base, verificationStatus: 'unverified' }]
  }), /nicht extern als verified belegt/);
  assert.throws(() => applyVerifiedCardmarketVariantLayer({
    databasePath,
    variants: [{ ...base, verificationStatus: 'verified', treatment: 'overframe' }]
  }), /keinen ausdruecklichen Beleg/);
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

test('konservative Kontextregel löst eine unvollständige Expansion über vollständigen 1:1-Namensabgleich', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-context-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  const report = buildPrintReferenceDatabase({ ...contextualFixturePayload(), outputPath: databasePath });
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  const anchor = database.findPrintCandidates({ setCode: 'CTX-EN001' });
  assert.equal(anchor.length, 1);
  assert.equal(anchor[0].cardmarketProductId, '920001');
  assert.equal(anchor[0].matchStatus, 'exact');
  assert.match(anchor[0].dataSource, /exact (?:contextual )?expansion membership/);
  assert.equal(report.unresolvedResolution.resolved.contextual, 1);
  assert.equal(report.unresolvedResolution.metacards.contextual, 1);

  const normalizedQuote = database.findPrintCandidates({ setCode: 'CTX-EN002' });
  assert.equal(normalizedQuote[0].matchStatus, 'exact');
  assert.equal(normalizedQuote[0].cardmarketProductId, '920003');

  const multipleProducts = database.findPrintCandidates({ setCode: 'CTX-EN003' });
  assert.equal(multipleProducts[0].matchStatus, 'likely');
  assert.equal(multipleProducts[0].cardmarketProductId, null);

  const multiplePrints = database.findPrintCandidates({ setCode: 'CTX-EN004' });
  assert.equal(multiplePrints.length, 2);
  assert.ok(multiplePrints.every(row => row.matchStatus === 'likely' && row.cardmarketProductId === null));
});

test('harmlose Zeichenabweichung und eindeutiger Speed-Duel-Skill-Zusatz lösen nur die belegten Metakarten', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-normalization-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  const report = buildPrintReferenceDatabase({ ...normalizationFixturePayload(), outputPath: databasePath });
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  const compact = database.findPrintCandidates({ setCode: 'SYM-EN001' });
  assert.equal(compact.length, 1);
  assert.equal(compact[0].matchStatus, 'exact');
  assert.equal(compact[0].cardmarketProductId, '940001');
  assert.match(compact[0].dataSource, /safe compact name normalization/);

  const skill = database.findPrintCandidates({ setCode: 'SGX1-ENS01' });
  assert.equal(skill.length, 1);
  assert.equal(skill[0].matchStatus, 'exact');
  assert.equal(skill[0].cardmarketProductId, '940002');
  assert.match(skill[0].dataSource, /safe Speed Duel skill suffix normalization/);

  const nonSpeedSkill = database.findPrintCandidates({ setCode: 'ORD-EN001' });
  assert.equal(nonSpeedSkill.length, 1);
  assert.equal(nonSpeedSkill[0].matchStatus, 'unresolved');
  assert.equal(nonSpeedSkill[0].cardmarketProductId, null);

  const existingLikely = database.findPrintCandidates({ setCode: 'SYM-EN002' });
  assert.equal(existingLikely.length, 1);
  assert.equal(existingLikely[0].matchStatus, 'likely');
  assert.equal(existingLikely[0].cardmarketProductId, null);

  assert.deepEqual(report.unresolvedResolution.resolved, {
    contextual: 0,
    compact: 1,
    skill: 1,
    total: 2
  });
});

test('Audit-Zuordnungen lösen ausschließlich bestätigte Restfälle und raten keine Produkt-ID', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-audited-resolution-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  const report = buildPrintReferenceDatabase({
    ...auditedResolutionFixturePayload(),
    outputPath: databasePath
  });
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  assert.deepEqual(report.unresolvedResolution.audited.resolved, {
    name: 1,
    historical: 3,
    expansion: 1,
    skill: 1,
    total: 6
  });
  for (const setCode of [
    'GENF-EN066',
    'DR3-EN057',
    'SOD-EN057',
    'BLTR-EN044',
    'SBLS-ENS01'
  ]) {
    const results = database.findPrintCandidates({ setCode });
    assert.ok(results.length >= 1);
    assert.ok(results.every(row => row.matchStatus === 'likely'));
    assert.ok(results.every(row => row.cardmarketProductId === null));
  }

  const manual = database.findPrintCandidates({ setCode: 'SBCB-ENS08' });
  assert.equal(manual.length, 1);
  assert.equal(manual[0].englishName, 'Spell of Mask (Skill Card)');
  assert.equal(manual[0].matchStatus, 'unresolved');
  assert.equal(manual[0].cardmarketProductId, null);
});

test('erneute Ausführung verändert weder bereits exact noch bereits likely zugeordnete Prints', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-idempotent-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  const payload = normalizationFixturePayload();
  buildPrintReferenceDatabase({ ...payload, outputPath: databasePath });
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const report = remapExistingPrintReference({
    databasePath,
    cardmarketCatalog: payload.cardmarketCatalog
  });
  assert.deepEqual(report.after, report.before);
  assert.equal(report.upgraded, 0);
  assert.equal(report.unresolvedResolution.resolved.total, 2);
});

test('zweites Referenzset für dieselbe Kontext-Expansion verhindert jede Hochstufung', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-print-context-conflict-'));
  const databasePath = path.join(root, 'print-reference.sqlite');
  const report = buildPrintReferenceDatabase({
    ...contextualFixturePayload({ competingPrefix: true }),
    outputPath: databasePath
  });
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  assert.equal(report.cardmarketContextualUpgradedCount, 0);
  assert.equal(report.contextualExpansionCount, 0);
  for (const setCode of ['CTX-EN001', 'CTY-EN001']) {
    const result = database.findPrintCandidates({ setCode });
    assert.equal(result.length, 1);
    assert.equal(result[0].matchStatus, 'likely');
    assert.equal(result[0].cardmarketProductId, null);
  }
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
  assert.equal(stats.exactCardmarketCount, 20453);
  assert.equal(stats.likelyCount, 24043);
  assert.equal(stats.unresolvedCount, 49);
});

test('gebündelte Referenz enthält genau die 48 auditierten Restauflösungen', t => {
  const { DatabaseSync } = require('node:sqlite');
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new DatabaseSync(databasePath, { readOnly: true });
  t.after(() => database.close());

  const metadata = Object.fromEntries(database.prepare(`
    SELECT key, value
    FROM reference_metadata
    WHERE key LIKE 'unresolved_audited_%'
  `).all().map(row => [row.key, Number(row.value)]));
  assert.equal(metadata.unresolved_audited_name_resolved_count, 29);
  assert.equal(metadata.unresolved_audited_historical_resolved_count, 3);
  assert.equal(metadata.unresolved_audited_expansion_resolved_count, 4);
  assert.equal(metadata.unresolved_audited_skill_resolved_count, 12);
  assert.equal(metadata.unresolved_audited_safe_resolved_count, 48);

  const auditedStatus = Object.fromEntries(database.prepare(`
    SELECT mapping_status AS status, COUNT(*) AS count
    FROM reference_prints
    WHERE data_source LIKE '%Cardmarket audited%'
    GROUP BY mapping_status
  `).all().map(row => [row.status, Number(row.count)]));
  assert.deepEqual(auditedStatus, { exact: 7, likely: 41 });

  const manual = database.prepare(`
    SELECT pr.mapping_status AS status, pr.cardmarket_product_id AS productId,
           mc.cardmarket_metacard_id AS metacardId
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    WHERE pr.known_set_code = 'SBCB-ENS08'
      AND mc.name_en = 'Spell of Mask (Skill Card)'
  `).get();
  assert.deepEqual({ ...manual }, { status: 'unresolved', productId: null, metacardId: null });
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

test('gebündelte Referenz enthält nur die extern belegten Pilotvarianten im separaten Layer', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());
  const stats = database.getStats();
  assert.equal(stats.schemaVersion, 3);
  assert.equal(stats.cardmarketVariantCount, 10);
  assert.equal(stats.verifiedCardmarketVariantCount, 10);

  const witness = database.findCardmarketVariants({ setCode: 'CORI-EN081' });
  assert.deepEqual(witness.map(row => [row.version, row.rarity, row.cardmarketProductId]), [
    ['V.1', 'Ultra Rare', '894816'],
    ['V.2', 'Ultra Rare', '894817'],
    ['V.3', 'Starlight Rare', '894818']
  ]);
  const mamo = database.findCardmarketVariants({ setCode: 'MAMO-EN004' });
  assert.deepEqual(mamo.map(row => [row.version, row.rarity, row.cardmarketProductId]), [
    ['V.1', 'Ultra Rare', '904546'],
    ['V.2', 'Ultra Rare', '904547'],
    ['V.3', 'Starlight Rare', '904548'],
    ['V.4', 'Grand Master Rare', '904549']
  ]);
  assert.equal(mamo.some(row => row.rarity === 'New'), false);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'CORI-EN004' })
    .map(row => row.cardmarketProductId), ['894691', '894692']);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'RA01-EN019' })
    .map(row => row.cardmarketProductId), ['741301']);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'RA02-EN001' }), []);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'DLCS-EN006' }), []);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'LDS2-EN001' }), []);
});

test('Sammlungsankauf löst eindeutige, mehrdeutige und historische Setcodes konservativ auf', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());

  const exact = database.resolveCollectionRecognition({ setCode: 'RA01-EN019', setCodeConfidence: 91.28, rarity: 'Super Rare' });
  assert.equal(exact.mappingStatus, 'exact');
  assert.equal(exact.resolutionStatus, 'unique_candidate');
  assert.equal(exact.setCodeConfidence, 91.3);
  assert.equal(exact.variantCandidates[0].cardmarketProductId, '741301');
  assert.equal(exact.suggestedCandidateId, exact.variantCandidates[0].id);

  const multipleRarities = database.resolveCollectionRecognition({ setCode: 'CORI-EN081', setCodeConfidence: 82 });
  assert.equal(multipleRarities.requiresRaritySelection, true);
  assert.deepEqual(multipleRarities.rarityOptions.map(row => row.value), ['Starlight Rare', 'Ultra Rare']);
  assert.deepEqual(multipleRarities.variantCandidates, []);

  const witnessUltra = database.resolveCollectionRecognition({ setCode: 'CORI-EN081', rarity: 'Ultra Rare' });
  assert.equal(witnessUltra.requiresVersionSelection, true);
  assert.deepEqual(witnessUltra.variantCandidates.map(row => [row.version, row.cardmarketProductId]), [['V.1', '894816'], ['V.2', '894817']]);
  const witnessStarlight = database.resolveCollectionRecognition({ setCode: 'CORI-EN081', rarity: 'Starlight Rare' });
  assert.deepEqual(witnessStarlight.variantCandidates.map(row => row.version), ['V.3']);
  assert.equal(witnessStarlight.resolutionStatus, 'unique_candidate');

  const legacy = database.resolveCollectionRecognition({ setCode: 'LON-G006', rarity: 'Super Rare' });
  assert.equal(legacy.referenceCandidates[0].setCodeMatch, 'legacy_alias');
  assert.notEqual(legacy.mappingStatus, 'exact');

  const unreadable = database.resolveCollectionRecognition({ setCode: 'nicht lesbar', setCodeConfidence: 12 });
  assert.equal(unreadable.resolutionStatus, 'unreadable_set_code');
  assert.deepEqual(unreadable.referenceCandidates, []);
});

test('MAMO New wird keiner der vier verifizierten Versionen zugeordnet', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());

  const all = database.resolveCollectionRecognition({ setCode: 'MAMO-EN004' });
  assert.equal(all.requiresRaritySelection, true);
  assert.deepEqual(database.findCardmarketVariants({ setCode: 'MAMO-EN004' }).map(row => row.version), ['V.1', 'V.2', 'V.3', 'V.4']);
  const unknown = database.resolveCollectionRecognition({ setCode: 'MAMO-EN004', rarity: 'New' });
  assert.equal(unknown.resolutionStatus, 'unverified_rarity');
  assert.equal(unknown.mappingStatus, 'unresolved');
  assert.deepEqual(unknown.variantCandidates, []);
  assert.equal(unknown.suggestedCandidateId, '');
});

test('Setcode-OCR akzeptiert nur exakte oder eindeutig referenzkorrigierte Codes', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());

  const exact = database.validateOcrSetCodeReadings([
    { text: 'CORI-EN081', confidence: 87.3, variant: 'standard-original' }
  ]);
  assert.equal(exact.accepted, true);
  assert.equal(exact.status, 'setcode_exact');
  assert.equal(exact.setCode, 'CORI-EN081');
  assert.equal(exact.method, 'exact_known_set_code');

  const physicalGermanAlias = database.validateOcrSetCodeReadings([
    { text: 'CORI-DE081', confidence: 81, variant: 'standard-grayscale' }
  ]);
  assert.equal(physicalGermanAlias.accepted, true);
  assert.equal(physicalGermanAlias.setCode, 'CORI-DE081');
  assert.equal(physicalGermanAlias.method, 'exact_reference_position');

  const corrected = database.validateOcrSetCodeReadings([
    { text: 'CORI-EN08I', confidence: 73, variant: 'standard-sharpened' }
  ]);
  assert.equal(corrected.accepted, true);
  assert.equal(corrected.status, 'setcode_normalized_unique');
  assert.equal(corrected.setCode, 'CORI-EN081');
  assert.match(corrected.method, /^single_confusion_/);

  const unknown = database.validateOcrSetCodeReadings([
    { text: 'ZZZZ-EN999', confidence: 99, variant: 'standard-original' }
  ]);
  assert.equal(unknown.accepted, false);
  assert.equal(unknown.status, 'setcode_unreadable');
  assert.deepEqual(unknown.signals, []);
});

test('widersprüchliche bekannte OCR-Codes bleiben ungelöst', t => {
  const databasePath = path.join(__dirname, '..', 'resources', 'print-reference.sqlite');
  const database = new PrintReferenceDatabase({ databasePath }).open();
  t.after(() => database.close());
  const result = database.validateOcrSetCodeReadings([
    { text: 'CORI-EN081', confidence: 82, variant: 'standard-original' },
    { text: 'CORI-EN004', confidence: 79, variant: 'lower-contrast' }
  ]);
  assert.equal(result.accepted, false);
  assert.equal(result.status, 'setcode_ambiguous');
  assert.deepEqual(result.candidates, ['CORI-EN004', 'CORI-EN081']);
  assert.deepEqual(result.signals, []);
});
