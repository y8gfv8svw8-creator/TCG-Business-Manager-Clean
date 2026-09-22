const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const cardSearch = require('../shared/card-search');

const LANGUAGE_PREFIXES = Object.freeze(new Map([
  ['EN', 'en'], ['DE', 'de'], ['FR', 'fr'], ['IT', 'it'], ['PT', 'pt'],
  ['SP', 'es'], ['ES', 'es'], ['NL', 'nl'], ['PL', 'pl'], ['RU', 'ru'],
  ['AE', 'ae'], ['JP', 'ja'], ['KR', 'ko'], ['TC', 'zh-tw'], ['SC', 'zh-cn']
]));
const LEGACY_LANGUAGE_PREFIXES = Object.freeze({
  E: 'en', G: 'de', F: 'fr', I: 'it', P: 'pt', S: 'es'
});

function parsePrintSetCode(value = '') {
  const full = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  let match = full.match(/^([A-Z0-9/]{2,16})-([A-Z0-9?]{1,12})$/);
  let setPrefix = '';
  let tail = '';
  if (match) {
    setPrefix = match[1];
    tail = match[2];
  } else {
    match = full.match(/^([A-Z]{2,8})([0-9?]{1,8})$/);
    if (!match) return null;
    setPrefix = match[1];
    tail = match[2];
  }

  let language = '';
  const modernPrefix = [...LANGUAGE_PREFIXES.keys()]
    .find(prefix => tail.startsWith(prefix) && tail.length > prefix.length);
  if (modernPrefix) {
    language = LANGUAGE_PREFIXES.get(modernPrefix);
    tail = tail.slice(modernPrefix.length);
  } else if (tail.length > 1 && LEGACY_LANGUAGE_PREFIXES[tail[0]]) {
    language = LEGACY_LANGUAGE_PREFIXES[tail[0]];
    tail = tail.slice(1);
  }
  if (!tail) return null;
  return {
    full,
    setPrefix,
    collectorNumber: tail,
    language,
    positionKey: `${setPrefix}-${tail}`
  };
}

function resolveBundledPrintReferencePath({ packaged = false, resourcesPath = '' } = {}) {
  if (packaged && resourcesPath) return path.join(resourcesPath, 'print-reference.sqlite');
  return path.join(__dirname, '..', '..', 'resources', 'print-reference.sqlite');
}

class PrintReferenceDatabase {
  constructor({ databasePath } = {}) {
    this.databasePath = path.resolve(databasePath || resolveBundledPrintReferencePath());
    this.db = null;
  }

  open() {
    if (this.db) return this;
    if (!fs.existsSync(this.databasePath)) {
      throw new Error(`Lokale Print-Referenz fehlt: ${this.databasePath}`);
    }
    this.db = new DatabaseSync(this.databasePath, { readOnly: true });
    const schemaVersion = Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0);
    if (schemaVersion !== 1) {
      this.close();
      throw new Error(`Unbekannte Print-Referenzversion: ${schemaVersion}.`);
    }
    return this;
  }

  close() {
    this.db?.close();
    this.db = null;
  }

  getStats() {
    this.open();
    const metadata = Object.fromEntries(this.db.prepare('SELECT key, value FROM reference_metadata').all()
      .map(row => [String(row.key), String(row.value)]));
    return {
      schemaVersion: Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0),
      metacardCount: Number(metadata.metacard_count || 0),
      printCount: Number(metadata.print_count || 0),
      setPositionCount: Number(metadata.set_position_count || 0),
      exactCardmarketCount: Number(metadata.exact_cardmarket_count || 0),
      likelyCount: Number(metadata.likely_count || 0),
      unresolvedCount: Number(metadata.unresolved_count || 0),
      source: metadata.source || '',
      sourceRevision: metadata.source_revision || ''
    };
  }

  findPrintCandidates({ setCode = '', rarity = '' } = {}) {
    this.open();
    const parsed = parsePrintSetCode(setCode);
    if (!parsed) return [];
    const rarityKey = cardSearch.normalizeCompact(rarity);
    const rows = this.db.prepare(`
      SELECT
        pr.print_id AS printId,
        mc.internal_metacard_id AS internalMetacardId,
        mc.cardmarket_metacard_id AS cardmarketMetacardId,
        mc.ygoprodeck_id AS ygoprodeckId,
        mc.name_de AS germanName,
        mc.name_en AS englishName,
        mc.passcode,
        sp.set_name AS setName,
        sp.set_prefix AS setPrefix,
        sp.collector_number AS collectorNumber,
        sp.position_key AS positionKey,
        pr.known_set_code AS setCode,
        pr.set_code_language AS setCodeLanguage,
        pr.rarity,
        pr.cardmarket_product_id AS cardmarketProductId,
        pr.mapping_status AS matchStatus,
        pr.data_source AS dataSource
      FROM reference_prints pr
      JOIN reference_set_positions sp ON sp.position_id = pr.position_id
      JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
      WHERE sp.position_key = ?
        AND (? = '' OR pr.rarity_key = ?)
      ORDER BY
        CASE pr.mapping_status WHEN 'exact' THEN 0 WHEN 'likely' THEN 1 ELSE 2 END,
        pr.rarity, mc.name_en, pr.known_set_code, pr.print_id
    `).all(parsed.positionKey, rarityKey, rarityKey);
    return rows.map(row => ({
      ...row,
      metacardId: row.cardmarketMetacardId || row.internalMetacardId,
      cardmarketProductId: row.cardmarketProductId || null,
      inputSetCode: parsed.full,
      inputSetCodeLanguage: parsed.language
    }));
  }
}

module.exports = {
  PrintReferenceDatabase,
  parsePrintSetCode,
  resolveBundledPrintReferencePath
};
