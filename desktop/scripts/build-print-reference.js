const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const cardSearch = require('../app/shared/card-search');
const { normalizeTreatment, parsePrintSetCode } = require('../app/main/print-reference-database');

const DATA_SOURCE = 'YGOPRODeck cardinfo v7 + Cardmarket products_singles_3';

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function cardPasscode(card = {}) {
  const value = String(card.id ?? '').trim();
  return /^\d{1,8}$/.test(value) && Number(value) > 0 ? value.padStart(8, '0') : '';
}

function sourceTreatment(source = {}) {
  const fields = ['treatment', 'set_treatment', 'print_variant', 'set_variant', 'variant'];
  for (const field of fields) {
    if (String(source?.[field] || '').trim()) return normalizeTreatment(source[field]);
  }
  return 'unknown';
}

function uniquePrintRows(...cards) {
  const rows = [];
  const seen = new Set();
  for (const card of cards) {
    for (const source of Array.isArray(card?.card_sets) ? card.card_sets : []) {
      const parsed = parsePrintSetCode(source?.set_code);
      if (!parsed) continue;
      const rarity = String(source?.set_rarity || '').trim();
      const treatment = sourceTreatment(source);
      const key = [parsed.full, rarity, treatment, String(source?.set_name || '').trim()].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        setName: String(source?.set_name || '').trim(),
        setPrefix: parsed.setPrefix,
        collectorNumber: parsed.collectorNumber,
        positionKey: parsed.positionKey,
        knownSetCode: parsed.full,
        setCodeLanguage: parsed.language,
        rarity,
        rarityKey: cardSearch.normalizeCompact(rarity),
        treatment,
        treatmentKey: treatment
      });
    }
  }
  return rows;
}

function cardmarketIndex(catalog = {}) {
  const byName = new Map();
  for (const row of Array.isArray(catalog) ? catalog : (catalog.products || [])) {
    const productId = String(row?.idProduct ?? row?.productId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    const nameKey = cardSearch.normalizeSpaced(row?.name || '');
    if (!/^\d+$/.test(productId) || !/^\d+$/.test(metacardId) || !nameKey) continue;
    if (!byName.has(nameKey)) byName.set(nameKey, new Map());
    const byMetacard = byName.get(nameKey);
    if (!byMetacard.has(metacardId)) byMetacard.set(metacardId, new Map());
    byMetacard.get(metacardId).set(productId, {
      productId,
      expansionId: String(row?.idExpansion ?? row?.expansionId ?? '').trim()
    });
  }
  return byName;
}

function createSchema(database) {
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = DELETE;
    PRAGMA synchronous = FULL;
    PRAGMA user_version = 2;

    CREATE TABLE reference_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE reference_metacards (
      internal_metacard_id TEXT PRIMARY KEY,
      cardmarket_metacard_id TEXT,
      ygoprodeck_id TEXT NOT NULL UNIQUE,
      name_de TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      passcode TEXT NOT NULL DEFAULT '',
      mapping_status TEXT NOT NULL CHECK(mapping_status IN ('exact', 'likely', 'unresolved')),
      data_source TEXT NOT NULL
    );

    CREATE INDEX idx_reference_metacards_passcode
      ON reference_metacards(passcode);
    CREATE INDEX idx_reference_metacards_cardmarket
      ON reference_metacards(cardmarket_metacard_id);

    CREATE TABLE reference_set_positions (
      position_id INTEGER PRIMARY KEY,
      internal_metacard_id TEXT NOT NULL,
      set_name TEXT NOT NULL DEFAULT '',
      set_prefix TEXT NOT NULL,
      collector_number TEXT NOT NULL,
      position_key TEXT NOT NULL,
      data_source TEXT NOT NULL,
      UNIQUE(internal_metacard_id, position_key, set_name),
      FOREIGN KEY(internal_metacard_id) REFERENCES reference_metacards(internal_metacard_id) ON DELETE CASCADE
    );

    CREATE INDEX idx_reference_positions_key
      ON reference_set_positions(position_key);
    CREATE INDEX idx_reference_positions_prefix_number
      ON reference_set_positions(set_prefix, collector_number);

    CREATE TABLE reference_prints (
      print_id INTEGER PRIMARY KEY,
      position_id INTEGER NOT NULL,
      known_set_code TEXT NOT NULL,
      set_code_language TEXT NOT NULL DEFAULT '',
      rarity TEXT NOT NULL DEFAULT '',
      rarity_key TEXT NOT NULL DEFAULT '',
      treatment TEXT NOT NULL DEFAULT 'unknown',
      treatment_key TEXT NOT NULL DEFAULT 'unknown',
      cardmarket_product_id TEXT,
      mapping_status TEXT NOT NULL CHECK(mapping_status IN ('exact', 'likely', 'unresolved')),
      data_source TEXT NOT NULL,
      UNIQUE(position_id, known_set_code, rarity, treatment),
      FOREIGN KEY(position_id) REFERENCES reference_set_positions(position_id) ON DELETE CASCADE
    );

    CREATE INDEX idx_reference_prints_position_rarity
      ON reference_prints(position_id, rarity_key);
    CREATE INDEX idx_reference_prints_position_rarity_treatment
      ON reference_prints(position_id, rarity_key, treatment_key);
    CREATE INDEX idx_reference_prints_full_code
      ON reference_prints(known_set_code);
    CREATE INDEX idx_reference_prints_cardmarket
      ON reference_prints(cardmarket_product_id);
  `);
}

function buildPrintReferenceDatabase({
  englishCards = [],
  germanCards = [],
  cardmarketCatalog = {},
  versionInfo = {},
  outputPath,
  sourceMetadata = {}
} = {}) {
  if (!Array.isArray(englishCards) || !englishCards.length) throw new Error('Englische YGOPRODeck-Karten fehlen.');
  if (!outputPath) throw new Error('Ausgabepfad für die Print-Referenz fehlt.');
  const targetPath = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.new`;
  fs.rmSync(temporaryPath, { force: true });

  const germanById = new Map((Array.isArray(germanCards) ? germanCards : [])
    .map(card => [String(card?.id ?? ''), card]));
  const cmByName = cardmarketIndex(cardmarketCatalog);
  const sortedCards = [...englishCards].sort((left, right) =>
    String(left?.id ?? '').localeCompare(String(right?.id ?? ''), 'en', { numeric: true })
  );
  const ygoNameCounts = new Map();
  for (const card of sortedCards) {
    const key = cardSearch.normalizeSpaced(card?.name || '');
    if (key) ygoNameCounts.set(key, (ygoNameCounts.get(key) || 0) + 1);
  }

  const database = new DatabaseSync(temporaryPath);
  let report;
  try {
    createSchema(database);
    const insertMetacard = database.prepare(`
      INSERT INTO reference_metacards (
        internal_metacard_id, cardmarket_metacard_id, ygoprodeck_id,
        name_de, name_en, passcode, mapping_status, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPosition = database.prepare(`
      INSERT INTO reference_set_positions (
        internal_metacard_id, set_name, set_prefix, collector_number,
        position_key, data_source
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertPrint = database.prepare(`
      INSERT INTO reference_prints (
        position_id, known_set_code, set_code_language, rarity, rarity_key,
        treatment, treatment_key, cardmarket_product_id, mapping_status, data_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMetadata = database.prepare('INSERT INTO reference_metadata (key, value) VALUES (?, ?)');

    let metacardCount = 0;
    let setPositionCount = 0;
    let printCount = 0;
    let exactCardmarketCount = 0;
    let likelyCount = 0;
    let unresolvedCount = 0;
    let knownTreatmentCount = 0;

    database.exec('BEGIN IMMEDIATE;');
    try {
      for (const card of sortedCards) {
        const ygoprodeckId = String(card?.id ?? '').trim();
        if (!ygoprodeckId) continue;
        const nameEn = String(card?.name || '').trim();
        const german = germanById.get(ygoprodeckId);
        const nameDe = String(german?.name || '').trim();
        const nameKey = cardSearch.normalizeSpaced(nameEn);
        const cmMatches = cmByName.get(nameKey);
        const exactMetacard = cmMatches?.size === 1 && ygoNameCounts.get(nameKey) === 1
          ? [...cmMatches.keys()][0] : '';
        const cmProducts = exactMetacard ? [...cmMatches.get(exactMetacard).values()] : [];
        const internalMetacardId = `ygoprodeck:${ygoprodeckId}`;
        const metaStatus = exactMetacard ? 'exact' : 'unresolved';
        const prints = uniquePrintRows(card, german);
        insertMetacard.run(
          internalMetacardId, exactMetacard || null, ygoprodeckId,
          nameDe, nameEn, cardPasscode(card), metaStatus, DATA_SOURCE
        );
        metacardCount += 1;

        const positionIds = new Map();
        for (const print of prints) {
          const positionMapKey = `${print.positionKey}|${print.setName}`;
          let positionId = positionIds.get(positionMapKey);
          if (!positionId) {
            const inserted = insertPosition.run(
              internalMetacardId, print.setName, print.setPrefix,
              print.collectorNumber, print.positionKey, DATA_SOURCE
            );
            positionId = Number(inserted.lastInsertRowid);
            positionIds.set(positionMapKey, positionId);
            setPositionCount += 1;
          }
          const exactProduct = exactMetacard && prints.length === 1 && cmProducts.length === 1
            ? cmProducts[0].productId : '';
          const status = exactProduct ? 'exact' : exactMetacard ? 'likely' : 'unresolved';
          insertPrint.run(
            positionId, print.knownSetCode, print.setCodeLanguage,
            print.rarity, print.rarityKey, print.treatment, print.treatmentKey,
            exactProduct || null, status, DATA_SOURCE
          );
          printCount += 1;
          if (print.treatment !== 'unknown') knownTreatmentCount += 1;
          if (status === 'exact') exactCardmarketCount += 1;
          else if (status === 'likely') likelyCount += 1;
          else unresolvedCount += 1;
        }
      }

      const revisionRow = Array.isArray(versionInfo) ? versionInfo[0] : versionInfo;
      const revision = String(revisionRow?.database_version || revisionRow?.version || 'unbekannt');
      const metadata = {
        source: DATA_SOURCE,
        source_revision: revision,
        source_last_update: String(revisionRow?.last_update || ''),
        built_at: new Date().toISOString(),
        metacard_count: metacardCount,
        print_count: printCount,
        set_position_count: setPositionCount,
        exact_cardmarket_count: exactCardmarketCount,
        likely_count: likelyCount,
        unresolved_count: unresolvedCount,
        known_treatment_count: knownTreatmentCount,
        unknown_treatment_count: printCount - knownTreatmentCount,
        without_cardmarket_id_count: printCount - exactCardmarketCount,
        ...sourceMetadata
      };
      for (const [key, value] of Object.entries(metadata)) insertMetadata.run(key, String(value ?? ''));
      database.exec('COMMIT;');
      database.exec('PRAGMA optimize;');
      report = {
        outputPath: targetPath,
        schemaVersion: 2,
        metacardCount,
        printCount,
        setPositionCount,
        exactCardmarketCount,
        likelyCount,
        unresolvedCount,
        knownTreatmentCount,
        withoutCardmarketIdCount: printCount - exactCardmarketCount,
        source: DATA_SOURCE,
        sourceRevision: revision
      };
    } catch (error) {
      database.exec('ROLLBACK;');
      throw error;
    }
  } finally {
    database.close();
  }

  if (fs.existsSync(targetPath)) fs.rmSync(targetPath, { force: true });
  fs.renameSync(temporaryPath, targetPath);
  return report;
}

function parseJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const [englishPath, germanPath, cardmarketPath, versionPath, outputPath] = process.argv.slice(2);
  if (![englishPath, germanPath, cardmarketPath, versionPath, outputPath].every(Boolean)) {
    throw new Error('Aufruf: build-print-reference.js <ygoprodeck-en.json> <ygoprodeck-de.json> <products_singles_3.json> <ygoprodeck-version.json> <output.sqlite>');
  }
  const englishPayload = parseJson(englishPath);
  const germanPayload = parseJson(germanPath);
  const cardmarketCatalog = parseJson(cardmarketPath);
  const versionInfo = parseJson(versionPath);
  const report = buildPrintReferenceDatabase({
    englishCards: englishPayload.data || englishPayload,
    germanCards: germanPayload.data || germanPayload,
    cardmarketCatalog,
    versionInfo,
    outputPath,
    sourceMetadata: {
      ygoprodeck_en_sha256: sha256File(englishPath),
      ygoprodeck_de_sha256: sha256File(germanPath),
      cardmarket_catalog_sha256: sha256File(cardmarketPath),
      cardmarket_catalog_version: String(cardmarketCatalog?.version || ''),
      cardmarket_catalog_created_at: String(cardmarketCatalog?.createdAt || ''),
      ygoprodeck_url: 'https://db.ygoprodeck.com/api/v7/cardinfo.php',
      ygoprodeck_de_url: 'https://db.ygoprodeck.com/api/v7/cardinfo.php?language=de'
    }
  });
  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) main();

module.exports = {
  DATA_SOURCE,
  buildPrintReferenceDatabase,
  cardPasscode,
  cardmarketIndex,
  sourceTreatment,
  uniquePrintRows
};
