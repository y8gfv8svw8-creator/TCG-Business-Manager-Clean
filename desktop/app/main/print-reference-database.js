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
const OCR_CONFUSIONS = Object.freeze(new Map([
  ['O', ['0']], ['0', ['O']],
  ['I', ['1']], ['L', ['1']], ['1', ['I', 'L']],
  ['S', ['5']], ['5', ['S']],
  ['B', ['8']], ['8', ['B']],
  ['Z', ['2']], ['2', ['Z']]
]));

function extractOcrSetCodeFragments(value = '') {
  const text = String(value || '').toUpperCase().replace(/[\u2010-\u2015\u2212]/g, '-');
  const fragments = [];
  const add = (raw, formatted = '') => {
    const compact = String(raw || '').replace(/[^A-Z0-9]/g, '');
    if (compact.length < 5 || compact.length > 22 || !/[A-Z]/.test(compact) || !/[0-9]/.test(compact)) return;
    const canonical = String(formatted || '').replace(/\s+/g, '').replace(/-+/g, '-');
    const key = `${canonical}|${compact}`;
    if (!fragments.some(row => row.key === key)) fragments.push({ key, raw: String(raw || '').trim(), canonical, compact });
  };
  for (const match of text.matchAll(/\b([A-Z0-9]{2,12})\s*(?:-|\s)\s*([A-Z0-9]{2,10})\b/g)) {
    add(match[0], `${match[1]}-${match[2]}`);
  }
  for (const match of text.matchAll(/\b[A-Z0-9]{5,22}\b/g)) add(match[0]);
  return fragments;
}

function oneConfusionVariants(value = '') {
  const variants = [];
  const text = String(value || '').toUpperCase();
  for (let index = 0; index < text.length; index += 1) {
    for (const replacement of OCR_CONFUSIONS.get(text[index]) || []) {
      variants.push(`${text.slice(0, index)}${replacement}${text.slice(index + 1)}`);
    }
  }
  return variants;
}

function normalizeTreatment(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return 'unknown';
  const key = cardSearch.normalizeSpaced(raw);
  if (['normal', 'standard', 'regular'].includes(key)) return 'normal';
  if (key.includes('overframe')) return 'overframe';
  if (['alternate art', 'alternative art', 'alt art'].includes(key)) return 'alternate_art';
  return key.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'unknown';
}

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
  let languageMarker = '';
  let languageStyle = 'none';
  const modernPrefix = [...LANGUAGE_PREFIXES.keys()]
    .find(prefix => tail.startsWith(prefix) && tail.length > prefix.length);
  if (modernPrefix) {
    language = LANGUAGE_PREFIXES.get(modernPrefix);
    languageMarker = modernPrefix;
    languageStyle = 'modern';
    tail = tail.slice(modernPrefix.length);
  } else if (tail.length > 1 && LEGACY_LANGUAGE_PREFIXES[tail[0]]) {
    language = LEGACY_LANGUAGE_PREFIXES[tail[0]];
    languageMarker = tail[0];
    languageStyle = 'legacy';
    tail = tail.slice(1);
  }
  if (!tail) return null;
  return {
    full,
    setPrefix,
    collectorNumber: tail,
    language,
    languageMarker,
    languageStyle,
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
    this.ocrSetCodeIndex = null;
  }

  open() {
    if (this.db) return this;
    if (!fs.existsSync(this.databasePath)) {
      throw new Error(`Lokale Print-Referenz fehlt: ${this.databasePath}`);
    }
    this.db = new DatabaseSync(this.databasePath, { readOnly: true });
    const schemaVersion = Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0);
    if (![2, 3].includes(schemaVersion)) {
      this.close();
      throw new Error(`Unbekannte Print-Referenzversion: ${schemaVersion}.`);
    }
    return this;
  }

  close() {
    this.db?.close();
    this.db = null;
    this.ocrSetCodeIndex = null;
  }

  getOcrSetCodeIndex() {
    this.open();
    if (this.ocrSetCodeIndex) return this.ocrSetCodeIndex;
    const rows = this.db.prepare(`
      SELECT DISTINCT pr.known_set_code AS setCode, sp.position_key AS positionKey
      FROM reference_prints pr
      JOIN reference_set_positions sp ON sp.position_id = pr.position_id
      WHERE TRIM(COALESCE(pr.known_set_code, '')) <> ''
      ORDER BY pr.known_set_code
    `).all();
    const byFull = new Map();
    const byCompact = new Map();
    const positions = new Set();
    for (const row of rows) {
      const setCode = String(row.setCode || '').trim().toUpperCase();
      const compact = setCode.replace(/[^A-Z0-9]/g, '');
      if (!setCode || !compact) continue;
      const entry = { setCode, compact, positionKey: String(row.positionKey || '') };
      byFull.set(setCode, entry);
      if (!byCompact.has(compact)) byCompact.set(compact, []);
      if (!byCompact.get(compact).some(candidate => candidate.setCode === setCode)) byCompact.get(compact).push(entry);
      if (entry.positionKey) positions.add(entry.positionKey);
    }
    this.ocrSetCodeIndex = { byFull, byCompact, positions };
    return this.ocrSetCodeIndex;
  }

  validateOcrSetCodeReadings(readings = []) {
    const index = this.getOcrSetCodeIndex();
    const normalizedReadings = (Array.isArray(readings) ? readings : [])
      .map(row => ({
        text: String(row?.text || '').trim(),
        confidence: Math.max(0, Math.min(100, Number(row?.confidence || 0))),
        variant: String(row?.variant || '')
      }))
      .filter(row => row.text);
    const fragments = normalizedReadings.flatMap(reading => extractOcrSetCodeFragments(reading.text)
      .map(fragment => ({ ...fragment, reading })));
    const result = (status, candidates = [], accepted = null) => ({
      accepted: Boolean(accepted),
      status,
      setCode: accepted?.setCode || '',
      confidence: accepted ? accepted.confidence : null,
      method: accepted?.method || '',
      candidates: [...new Set(candidates.map(candidate => candidate.setCode || candidate).filter(Boolean))].sort(),
      signals: accepted ? [{
        setCode: accepted.setCode,
        confidence: accepted.confidence,
        rawText: accepted.rawText,
        variant: accepted.variant,
        source: 'set_code_region_reference_validated',
        validationMethod: accepted.method
      }] : []
    });
    if (!fragments.length) return result('setcode_unreadable');

    const exactMatches = [];
    for (const fragment of fragments) {
      const matches = [];
      if (fragment.canonical && index.byFull.has(fragment.canonical)) matches.push(index.byFull.get(fragment.canonical));
      for (const candidate of index.byCompact.get(fragment.compact) || []) matches.push(candidate);
      for (const match of matches) {
        if (!exactMatches.some(row => row.setCode === match.setCode && row.reading.variant === fragment.reading.variant)) {
          exactMatches.push({ ...match, reading: fragment.reading, method: 'exact_known_set_code' });
        }
      }
    }
    const exactCodes = [...new Set(exactMatches.map(row => row.setCode))];
    if (exactCodes.length > 1) return result('setcode_ambiguous', exactMatches);
    if (exactCodes.length === 1) {
      const matches = exactMatches.filter(row => row.setCode === exactCodes[0]);
      const best = matches.sort((left, right) => right.reading.confidence - left.reading.confidence)[0];
      return result('setcode_exact', matches, {
        setCode: best.setCode,
        confidence: best.reading.confidence,
        rawText: best.reading.text,
        variant: best.reading.variant,
        method: best.method
      });
    }

    const conservativeMatches = [];
    const addConservative = (setCode, fragment, method) => {
      if (!setCode || conservativeMatches.some(row => row.setCode === setCode && row.reading.variant === fragment.reading.variant)) return;
      conservativeMatches.push({ setCode, reading: fragment.reading, method });
    };
    for (const fragment of fragments) {
      if (fragment.canonical) {
        const parsed = parsePrintSetCode(fragment.canonical);
        if (parsed?.positionKey && index.positions.has(parsed.positionKey)) {
          addConservative(parsed.full, fragment, 'exact_reference_position');
        }
        for (const variant of oneConfusionVariants(fragment.canonical)) {
          const parsedVariant = parsePrintSetCode(variant);
          if (parsedVariant?.positionKey && index.positions.has(parsedVariant.positionKey)) {
            addConservative(parsedVariant.full, fragment, 'single_confusion_reference_position');
          }
        }
      }
      for (const variant of oneConfusionVariants(fragment.compact)) {
        for (const candidate of index.byCompact.get(variant) || []) {
          addConservative(candidate.setCode, fragment, 'single_confusion_known_set_code');
        }
      }
    }
    const conservativeCodes = [...new Set(conservativeMatches.map(row => row.setCode))];
    if (conservativeCodes.length > 1) return result('setcode_ambiguous', conservativeMatches);
    if (conservativeCodes.length === 1) {
      const matches = conservativeMatches.filter(row => row.setCode === conservativeCodes[0]);
      const best = matches.sort((left, right) => right.reading.confidence - left.reading.confidence)[0];
      return result('setcode_normalized_unique', matches, {
        setCode: best.setCode,
        confidence: best.reading.confidence,
        rawText: best.reading.text,
        variant: best.reading.variant,
        method: best.method
      });
    }
    return result('setcode_unreadable');
  }

  getStats() {
    this.open();
    const metadata = Object.fromEntries(this.db.prepare('SELECT key, value FROM reference_metadata').all()
      .map(row => [String(row.key), String(row.value)]));
    const hasVariantLayer = Boolean(this.db.prepare(`
      SELECT 1 AS found FROM sqlite_master
      WHERE type = 'table' AND name = 'reference_cardmarket_variants'
    `).get());
    const variantCounts = hasVariantLayer
      ? this.db.prepare(`
          SELECT COUNT(*) AS total,
                 SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) AS verified
          FROM reference_cardmarket_variants
        `).get()
      : { total: 0, verified: 0 };
    return {
      schemaVersion: Number(this.db.prepare('PRAGMA user_version').get()?.user_version || 0),
      metacardCount: Number(metadata.metacard_count || 0),
      printCount: Number(metadata.print_count || 0),
      setPositionCount: Number(metadata.set_position_count || 0),
      exactCardmarketCount: Number(metadata.exact_cardmarket_count || 0),
      likelyCount: Number(metadata.likely_count || 0),
      unresolvedCount: Number(metadata.unresolved_count || 0),
      knownTreatmentCount: Number(metadata.known_treatment_count || 0),
      unknownTreatmentCount: Number(metadata.unknown_treatment_count || 0),
      cardmarketVariantCount: Number(variantCounts.total || 0),
      verifiedCardmarketVariantCount: Number(variantCounts.verified || 0),
      source: metadata.source || '',
      sourceRevision: metadata.source_revision || ''
    };
  }

  findPrintCandidates({ setCode = '', rarity = '', treatment = '' } = {}) {
    this.open();
    const parsed = parsePrintSetCode(setCode);
    if (!parsed) return [];
    const rarityKey = cardSearch.normalizeCompact(rarity);
    const treatmentKey = String(treatment || '').trim() ? normalizeTreatment(treatment) : '';
    const select = `
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
        pr.rarity_key AS rarityKey,
        pr.treatment,
        pr.treatment_key AS treatmentKey,
        pr.cardmarket_product_id AS cardmarketProductId,
        pr.mapping_status AS matchStatus,
        pr.data_source AS dataSource
      FROM reference_prints pr
      JOIN reference_set_positions sp ON sp.position_id = pr.position_id
      JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    `;
    const order = `
      ORDER BY
        CASE pr.mapping_status WHEN 'exact' THEN 0 WHEN 'likely' THEN 1 ELSE 2 END,
        pr.rarity, pr.treatment, mc.name_en, pr.known_set_code, pr.print_id
    `;
    const filters = `
      AND (? = '' OR pr.rarity_key = ?)
      AND (? = '' OR pr.treatment_key = ?)
    `;
    const exactFullCodeExists = Boolean(this.db.prepare(`
      SELECT 1 AS found FROM reference_prints WHERE known_set_code = ? LIMIT 1
    `).get(parsed.full));

    let rows;
    let setCodeMatch;
    if (exactFullCodeExists) {
      rows = this.db.prepare(`${select}
        WHERE pr.known_set_code = ?
        ${filters}
        ${order}
      `).all(parsed.full, rarityKey, rarityKey, treatmentKey, treatmentKey);
      setCodeMatch = 'exact_full_code';
    } else {
      const fallbackRows = this.db.prepare(`${select}
        WHERE sp.position_key = ?
        ${filters}
        ${order}
      `).all(parsed.positionKey, rarityKey, rarityKey, treatmentKey, treatmentKey);
      const aliasRows = fallbackRows.filter(row => {
        const candidate = parsePrintSetCode(row.setCode);
        if (!candidate) return false;
        if (parsed.language && candidate.language === parsed.language) return true;
        return parsed.languageStyle === 'legacy' && candidate.languageStyle === 'none';
      });
      rows = aliasRows.length ? aliasRows : fallbackRows;
      setCodeMatch = aliasRows.length ? 'legacy_alias' : 'collector_fallback';
    }
    return rows.map(row => ({
      ...row,
      metacardId: row.cardmarketMetacardId || row.internalMetacardId,
      cardmarketProductId: row.cardmarketProductId || null,
      inputSetCode: parsed.full,
      inputSetCodeLanguage: parsed.language,
      setCodeMatch,
      exactSetCodeMatch: setCodeMatch === 'exact_full_code',
      treatment: row.treatment || 'unknown'
    }));
  }

  findCardmarketVariants({ setCode = '', rarity = '', version = '' } = {}) {
    this.open();
    const hasVariantLayer = Boolean(this.db.prepare(`
      SELECT 1 AS found FROM sqlite_master
      WHERE type = 'table' AND name = 'reference_cardmarket_variants'
    `).get());
    if (!hasVariantLayer) return [];
    const parsed = parsePrintSetCode(setCode);
    if (!parsed) return [];
    const rarityKey = cardSearch.normalizeCompact(rarity);
    const versionKey = String(version || '').trim().toUpperCase();
    const exactFullCodeExists = Boolean(this.db.prepare(`
      SELECT 1 AS found
      FROM reference_cardmarket_variants
      WHERE set_code = ? AND verification_status = 'verified'
      LIMIT 1
    `).get(parsed.full));
    const rows = this.db.prepare(`
      SELECT
        cv.variant_id AS variantId,
        cv.cardmarket_product_id AS cardmarketProductId,
        cv.set_code AS setCode,
        cv.version,
        cv.rarity,
        cv.cardmarket_product_name AS cardmarketProductName,
        cv.product_url AS productUrl,
        cv.product_slug AS productSlug,
        cv.expansion,
        cv.source,
        cv.verified_at AS verifiedAt,
        cv.verification_status AS verificationStatus,
        cv.treatment,
        cv.artwork,
        mc.name_de AS germanName,
        mc.name_en AS englishName,
        sp.set_prefix AS setPrefix,
        sp.collector_number AS collectorNumber,
        sp.position_key AS positionKey
      FROM reference_cardmarket_variants cv
      JOIN reference_set_positions sp ON sp.position_id = cv.position_id
      JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
      WHERE cv.verification_status = 'verified'
        AND (${exactFullCodeExists ? 'cv.set_code = ?' : 'sp.position_key = ?'})
        AND (? = '' OR cv.rarity_key = ?)
        AND (? = '' OR UPPER(cv.version) = ?)
      ORDER BY CAST(REPLACE(UPPER(cv.version), 'V.', '') AS INTEGER), cv.rarity, cv.cardmarket_product_id
    `).all(
      exactFullCodeExists ? parsed.full : parsed.positionKey,
      rarityKey, rarityKey,
      versionKey, versionKey
    );
    return rows.map(row => ({
      ...row,
      treatment: row.treatment || null,
      artwork: row.artwork || null,
      inputSetCode: parsed.full,
      setCodeMatch: exactFullCodeExists ? 'exact_full_code' : 'collector_fallback',
      exactSetCodeMatch: exactFullCodeExists
    }));
  }

  resolveCollectionRecognition({ setCode = '', setCodeConfidence = null, rarity = '' } = {}) {
    const inputSetCode = String(setCode || '').trim().toUpperCase();
    const confidenceNumber = setCodeConfidence == null || String(setCodeConfidence).trim() === '' ? Number.NaN : Number(setCodeConfidence);
    const confidence = Number.isFinite(confidenceNumber)
      ? Math.max(0, Math.min(100, Math.round(confidenceNumber * 10) / 10))
      : null;
    const parsed = parsePrintSetCode(inputSetCode);
    if (!parsed) {
      return {
        setCode: inputSetCode,
        setCodeConfidence: confidence,
        mappingStatus: 'unresolved',
        resolutionStatus: 'unreadable_set_code',
        rarityOptions: [],
        selectedRarity: '',
        referenceCandidates: [],
        variantCandidates: [],
        requiresRaritySelection: false,
        requiresVersionSelection: false,
        suggestedCandidateId: ''
      };
    }

    const allReferenceCandidates = this.findPrintCandidates({ setCode: parsed.full });
    const rarityMap = new Map();
    for (const candidate of allReferenceCandidates) {
      const key = cardSearch.normalizeCompact(candidate.rarity);
      if (!key) continue;
      if (!rarityMap.has(key)) rarityMap.set(key, { value: candidate.rarity, count: 0 });
      rarityMap.get(key).count += 1;
    }
    const rarityOptions = [...rarityMap.values()].sort((left, right) => left.value.localeCompare(right.value, 'en'));
    const requestedRarity = String(rarity || '').trim();
    const requestedRarityKey = cardSearch.normalizeCompact(requestedRarity);
    const matchedRarity = rarityMap.get(requestedRarityKey)?.value || '';
    const unknownRarityValue = Boolean(requestedRarity && !matchedRarity);
    const selectedRarity = matchedRarity || (!requestedRarity && rarityOptions.length === 1 ? rarityOptions[0].value : '');
    const requiresRaritySelection = rarityOptions.length > 1 && !matchedRarity;
    const scopedReferenceCandidates = selectedRarity
      ? this.findPrintCandidates({ setCode: parsed.full, rarity: selectedRarity })
      : allReferenceCandidates;
    const unknownRarityKeys = new Set(['new', 'unknown', 'unbekannt', 'na', 'none']);
    const rarityIsUnverified = unknownRarityValue || unknownRarityKeys.has(cardSearch.normalizeCompact(selectedRarity));
    const verifiedVariants = !requiresRaritySelection && selectedRarity && !rarityIsUnverified
      ? this.findCardmarketVariants({ setCode: parsed.full, rarity: selectedRarity })
      : [];

    const referenceCandidates = scopedReferenceCandidates.map(candidate => ({
      id: `reference:${candidate.printId}`,
      kind: 'reference_print',
      printId: candidate.printId,
      internalMetacardId: candidate.internalMetacardId,
      germanName: candidate.germanName,
      englishName: candidate.englishName,
      setName: candidate.setName,
      setCode: candidate.setCode,
      collectorNumber: candidate.collectorNumber,
      rarity: candidate.rarity,
      version: '',
      treatment: candidate.treatment && candidate.treatment !== 'unknown' ? candidate.treatment : null,
      artwork: null,
      cardmarketProductId: candidate.matchStatus === 'exact' ? candidate.cardmarketProductId : null,
      mappingStatus: candidate.matchStatus,
      dataSource: candidate.dataSource,
      setCodeMatch: candidate.setCodeMatch,
      exactSetCodeMatch: candidate.exactSetCodeMatch,
      verified: candidate.matchStatus === 'exact' && Boolean(candidate.cardmarketProductId)
    }));
    const variantCandidates = verifiedVariants.map(candidate => ({
      id: `variant:${candidate.variantId}`,
      kind: 'cardmarket_variant',
      variantId: candidate.variantId,
      germanName: candidate.germanName,
      englishName: candidate.englishName,
      setName: candidate.expansion,
      setCode: candidate.setCode,
      collectorNumber: candidate.collectorNumber,
      rarity: candidate.rarity,
      version: candidate.version,
      treatment: candidate.treatment || null,
      artwork: candidate.artwork || null,
      cardmarketProductId: candidate.cardmarketProductId,
      cardmarketProductName: candidate.cardmarketProductName,
      productUrl: candidate.productUrl,
      mappingStatus: 'exact',
      dataSource: candidate.source,
      verifiedAt: candidate.verifiedAt,
      setCodeMatch: candidate.setCodeMatch,
      exactSetCodeMatch: candidate.exactSetCodeMatch,
      verified: candidate.verificationStatus === 'verified'
    }));
    const requiresVersionSelection = variantCandidates.length > 1;
    let suggestedCandidateId = '';
    if (!requiresRaritySelection && !requiresVersionSelection && variantCandidates.length === 1) {
      suggestedCandidateId = variantCandidates[0].id;
    } else if (!requiresRaritySelection && !requiresVersionSelection && referenceCandidates.length === 1 && referenceCandidates[0].verified) {
      suggestedCandidateId = referenceCandidates[0].id;
    }

    let mappingStatus = 'unresolved';
    let resolutionStatus = 'no_reference_match';
    if (allReferenceCandidates.length) {
      if (requiresRaritySelection) resolutionStatus = 'rarity_selection_required';
      else if (rarityIsUnverified) resolutionStatus = 'unverified_rarity';
      else if (requiresVersionSelection) resolutionStatus = 'version_selection_required';
      else if (suggestedCandidateId) {
        mappingStatus = 'exact';
        resolutionStatus = 'unique_candidate';
      } else {
        const statuses = new Set(referenceCandidates.map(candidate => candidate.mappingStatus));
        mappingStatus = statuses.size === 1 && statuses.has('likely') ? 'likely' : statuses.size === 1 && statuses.has('exact') ? 'exact' : 'unresolved';
        resolutionStatus = mappingStatus === 'likely' ? 'likely_candidate' : mappingStatus === 'exact' ? 'exact_reference_without_verified_variant' : 'unresolved_candidates';
      }
    }
    return {
      setCode: parsed.full,
      setCodeConfidence: confidence,
      mappingStatus,
      resolutionStatus,
      rarityOptions,
      selectedRarity: matchedRarity,
      suggestedRarity: !matchedRarity && rarityOptions.length === 1 ? rarityOptions[0].value : '',
      unknownRarityValue: unknownRarityValue ? requestedRarity : '',
      referenceCandidates,
      variantCandidates,
      requiresRaritySelection,
      requiresVersionSelection,
      suggestedCandidateId
    };
  }
}

module.exports = {
  PrintReferenceDatabase,
  normalizeTreatment,
  parsePrintSetCode,
  resolveBundledPrintReferencePath
};
