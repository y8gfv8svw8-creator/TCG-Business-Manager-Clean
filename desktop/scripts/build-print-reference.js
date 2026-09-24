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
  for (const row of cardmarketProducts(catalog)) {
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

function cardmarketProducts(catalog = {}) {
  return Array.isArray(catalog) ? catalog : (catalog.products || []);
}

function addSetValue(map, key, value) {
  if (!key || !value) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(value);
}

function setSignature(values = new Set()) {
  return [...values].sort((left, right) => left.localeCompare(right, 'en', { numeric: true })).join(',');
}

function uniqueSignatureOwners(groups = new Map()) {
  const owners = new Map();
  for (const [key, values] of groups) {
    const signature = setSignature(values);
    if (!signature) continue;
    if (!owners.has(signature)) owners.set(signature, []);
    owners.get(signature).push(key);
  }
  return owners;
}

function buildExactExpansionPrefixMap(database, cardmarketCatalog = {}) {
  const referenceRows = database.prepare(`
    SELECT DISTINCT
      sp.set_prefix AS setPrefix,
      sp.internal_metacard_id AS internalMetacardId,
      mc.cardmarket_metacard_id AS cardmarketMetacardId
    FROM reference_set_positions sp
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
  `).all();
  const allReferenceCards = new Map();
  const mappedReferenceCards = new Map();
  const knownCardmarketMetacards = new Set();
  for (const row of referenceRows) {
    const prefix = String(row.setPrefix || '').trim();
    const internalId = String(row.internalMetacardId || '').trim();
    const metacardId = String(row.cardmarketMetacardId || '').trim();
    addSetValue(allReferenceCards, prefix, internalId);
    if (metacardId) {
      addSetValue(mappedReferenceCards, prefix, metacardId);
      knownCardmarketMetacards.add(metacardId);
    }
  }

  const allExpansionCards = new Map();
  const mappedExpansionCards = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    if (!/^\d+$/.test(expansionId) || !/^\d+$/.test(metacardId)) continue;
    addSetValue(allExpansionCards, expansionId, metacardId);
    if (knownCardmarketMetacards.has(metacardId)) {
      addSetValue(mappedExpansionCards, expansionId, metacardId);
    }
  }

  // Eine Signatur ist nur beweiskräftig, wenn auf keiner Seite Karten wegen
  // fehlender Metakarten-Zuordnung ausgeblendet wurden.
  const completeReferenceGroups = new Map([...mappedReferenceCards].filter(([prefix, values]) =>
    values.size === (allReferenceCards.get(prefix)?.size || 0)
  ));
  const completeExpansionGroups = new Map([...mappedExpansionCards].filter(([expansionId, values]) =>
    values.size === (allExpansionCards.get(expansionId)?.size || 0)
  ));
  const referenceOwners = uniqueSignatureOwners(completeReferenceGroups);
  const expansionOwners = uniqueSignatureOwners(completeExpansionGroups);
  const exact = new Map();
  for (const [signature, prefixes] of referenceOwners) {
    const expansionIds = expansionOwners.get(signature) || [];
    if (prefixes.length !== 1 || expansionIds.length !== 1) continue;
    exact.set(prefixes[0], {
      expansionId: expansionIds[0],
      metacardCount: completeReferenceGroups.get(prefixes[0]).size
    });
  }
  return exact;
}

function normalizedContextualName(value = '') {
  return cardSearch.normalizeSpaced(decodeCardNameEntities(String(value || '').replace(/"{2,}/g, '"')));
}

function decodeCardNameEntities(value = '') {
  return String(value || '')
    .replace(/&apos;|&#0*39;|&#x0*27;/gi, "'")
    .replace(/&quot;|&#0*34;|&#x0*22;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalizedCompactReferenceName(value = '') {
  return cardSearch.normalizeCompact(decodeCardNameEntities(String(value || '').replace(/"{2,}/g, '"')));
}

function normalizedSkillName(value = '') {
  return normalizedContextualName(value).replace(/\s+skill(?:\s+card)?$/i, '').trim();
}

function isExplicitCardmarketSkillName(value = '') {
  return /\(\s*skill(?:\s+card)?\s*\)|\bskill(?:\s+card)?\s*$/i.test(String(value || ''));
}

function isSpeedDuelSetName(value = '') {
  return /speed\s*duel/i.test(String(value || ''));
}

function buildContextualExpansionPrefixMap(database, cardmarketCatalog = {}, exactExpansionMap = new Map()) {
  const referenceRows = database.prepare(`
    SELECT DISTINCT
      sp.set_prefix AS setPrefix,
      sp.internal_metacard_id AS internalMetacardId,
      mc.name_en AS nameEn,
      mc.cardmarket_metacard_id AS cardmarketMetacardId
    FROM reference_set_positions sp
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
  `).all();
  const referencesByPrefix = new Map();
  const knownCardmarketMetacards = new Set();
  for (const row of referenceRows) {
    const prefix = String(row.setPrefix || '').trim();
    if (!prefix) continue;
    if (!referencesByPrefix.has(prefix)) referencesByPrefix.set(prefix, new Map());
    referencesByPrefix.get(prefix).set(String(row.internalMetacardId || ''), {
      internalMetacardId: String(row.internalMetacardId || ''),
      nameEn: String(row.nameEn || '').trim(),
      cardmarketMetacardId: String(row.cardmarketMetacardId || '').trim()
    });
    if (row.cardmarketMetacardId) knownCardmarketMetacards.add(String(row.cardmarketMetacardId));
  }

  const allExpansionMetacards = new Map();
  const mappedExpansionMetacards = new Map();
  const namesByExpansionMetacard = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    if (!/^\d+$/.test(expansionId) || !/^\d+$/.test(metacardId)) continue;
    addSetValue(allExpansionMetacards, expansionId, metacardId);
    if (knownCardmarketMetacards.has(metacardId)) {
      addSetValue(mappedExpansionMetacards, expansionId, metacardId);
    }
    const nameKey = normalizedContextualName(row?.name || '');
    if (nameKey) addSetValue(namesByExpansionMetacard, `${expansionId}|${metacardId}`, nameKey);
  }

  const expansionOwners = uniqueSignatureOwners(mappedExpansionMetacards);
  const exactExpansionOwners = new Map();
  for (const [prefix, value] of exactExpansionMap) {
    addSetValue(exactExpansionOwners, String(value?.expansionId || ''), prefix);
  }
  const candidates = [];
  for (const [prefix, references] of referencesByPrefix) {
    const mapped = [...references.values()].filter(row => row.cardmarketMetacardId);
    const missing = [...references.values()].filter(row => !row.cardmarketMetacardId);
    if (!mapped.length || !missing.length) continue;
    const signature = setSignature(new Set(mapped.map(row => row.cardmarketMetacardId)));
    const expansionIds = [...(expansionOwners.get(signature) || [])];
    if (expansionIds.length !== 1) continue;
    const expansionId = expansionIds[0];
    const remainingMetacards = [...(allExpansionMetacards.get(expansionId) || [])]
      .filter(metacardId => !knownCardmarketMetacards.has(metacardId));
    if (missing.length !== remainingMetacards.length) continue;

    const referencesByName = new Map();
    for (const row of missing) {
      const nameKey = normalizedContextualName(row.nameEn);
      if (!nameKey) continue;
      addSetValue(referencesByName, nameKey, row.internalMetacardId);
    }
    const metacardsByName = new Map();
    let inconsistentProductName = false;
    for (const metacardId of remainingMetacards) {
      const names = namesByExpansionMetacard.get(`${expansionId}|${metacardId}`) || new Set();
      if (names.size !== 1) {
        inconsistentProductName = true;
        break;
      }
      addSetValue(metacardsByName, [...names][0], metacardId);
    }
    if (inconsistentProductName) continue;
    const referenceNames = [...referencesByName.keys()].sort();
    const metacardNames = [...metacardsByName.keys()].sort();
    if (referenceNames.length !== missing.length || metacardNames.length !== remainingMetacards.length) continue;
    if (referenceNames.join('|') !== metacardNames.join('|')) continue;
    if (referenceNames.some(name => referencesByName.get(name).size !== 1 || metacardsByName.get(name).size !== 1)) continue;
    candidates.push({ prefix, expansionId });
  }

  const contextualOwners = new Map();
  for (const row of candidates) addSetValue(contextualOwners, row.expansionId, row.prefix);
  const exact = new Map();
  for (const row of candidates) {
    if (contextualOwners.get(row.expansionId)?.size !== 1) continue;
    const otherExactOwners = [...(exactExpansionOwners.get(row.expansionId) || [])]
      .filter(prefix => prefix !== row.prefix);
    if (otherExactOwners.length) continue;
    exact.set(row.prefix, { expansionId: row.expansionId });
  }
  return exact;
}

function mappingStatusCounts(database) {
  const result = { exact: 0, likely: 0, unresolved: 0 };
  for (const row of database.prepare(`
    SELECT mapping_status AS status, COUNT(*) AS count
    FROM reference_prints
    GROUP BY mapping_status
  `).all()) {
    result[row.status] = Number(row.count || 0);
  }
  return result;
}

function findSetCodeRarityCollisions(database) {
  return database.prepare(`
    SELECT
      pr.known_set_code AS setCode,
      pr.rarity,
      COUNT(*) AS candidateCount,
      GROUP_CONCAT(DISTINCT mc.name_en) AS englishNames
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    GROUP BY pr.known_set_code, pr.rarity_key
    HAVING COUNT(*) > 1
    ORDER BY pr.known_set_code, pr.rarity_key
  `).all().map(row => ({
    setCode: row.setCode,
    rarity: row.rarity,
    candidateCount: Number(row.candidateCount || 0),
    englishNames: String(row.englishNames || '').split(',').filter(Boolean)
  }));
}

function buildSafeUnresolvedMetacardMappings(
  database,
  cardmarketCatalog = {},
  exactExpansionMap = new Map()
) {
  const referenceRows = database.prepare(`
    SELECT DISTINCT
      mc.internal_metacard_id AS internalMetacardId,
      mc.cardmarket_metacard_id AS cardmarketMetacardId,
      mc.name_en AS nameEn,
      sp.set_prefix AS setPrefix,
      sp.set_name AS setName
    FROM reference_metacards mc
    JOIN reference_set_positions sp ON sp.internal_metacard_id = mc.internal_metacard_id
  `).all();
  const allMetacards = database.prepare(`
    SELECT
      internal_metacard_id AS internalMetacardId,
      cardmarket_metacard_id AS cardmarketMetacardId,
      name_en AS nameEn
    FROM reference_metacards
  `).all();
  const knownCardmarketMetacards = new Set(allMetacards
    .map(row => String(row.cardmarketMetacardId || '').trim())
    .filter(Boolean));
  const referencesByPrefix = new Map();
  const referencesByMetacard = new Map();
  for (const row of referenceRows) {
    const internalMetacardId = String(row.internalMetacardId || '').trim();
    const setPrefix = String(row.setPrefix || '').trim();
    if (!internalMetacardId || !setPrefix) continue;
    if (!referencesByPrefix.has(setPrefix)) referencesByPrefix.set(setPrefix, new Map());
    referencesByPrefix.get(setPrefix).set(internalMetacardId, {
      internalMetacardId,
      cardmarketMetacardId: String(row.cardmarketMetacardId || '').trim(),
      nameEn: String(row.nameEn || '').trim()
    });
    if (!referencesByMetacard.has(internalMetacardId)) {
      referencesByMetacard.set(internalMetacardId, {
        internalMetacardId,
        cardmarketMetacardId: String(row.cardmarketMetacardId || '').trim(),
        nameEn: String(row.nameEn || '').trim(),
        setNames: new Set()
      });
    }
    referencesByMetacard.get(internalMetacardId).setNames.add(String(row.setName || '').trim());
  }

  const cardmarketByName = new Map();
  const cardmarketByCompactName = new Map();
  const cardmarketBySkillName = new Map();
  const explicitSkillMetacards = new Set();
  const namesByExpansionMetacard = new Map();
  const allExpansionMetacards = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    if (!/^\d+$/.test(metacardId)) continue;
    addSetValue(cardmarketByName, normalizedContextualName(row?.name || ''), metacardId);
    addSetValue(cardmarketByCompactName, normalizedCompactReferenceName(row?.name || ''), metacardId);
    addSetValue(cardmarketBySkillName, normalizedSkillName(row?.name || ''), metacardId);
    if (isExplicitCardmarketSkillName(row?.name || '')) explicitSkillMetacards.add(metacardId);
    if (/^\d+$/.test(expansionId)) {
      addSetValue(allExpansionMetacards, expansionId, metacardId);
      addSetValue(
        namesByExpansionMetacard,
        `${expansionId}|${metacardId}`,
        normalizedContextualName(row?.name || '')
      );
    }
  }

  const referenceByCompactName = new Map();
  for (const row of allMetacards) {
    addSetValue(
      referenceByCompactName,
      normalizedCompactReferenceName(row.nameEn),
      String(row.internalMetacardId || '').trim()
    );
  }

  // Regel 1: Ein unvollständiges Referenzset darf nur über die bereits
  // eindeutig bestimmte Expansion und einen vollständigen 1:1-Namensabgleich
  // der auf beiden Seiten verbleibenden Metakarten ergänzt werden.
  const contextualExpansionMap = buildContextualExpansionPrefixMap(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const contextualCandidates = new Map();
  for (const [setPrefix, contextual] of contextualExpansionMap) {
    const references = referencesByPrefix.get(setPrefix) || new Map();
    const missing = [...references.values()].filter(row => !row.cardmarketMetacardId);
    const remaining = [...(allExpansionMetacards.get(contextual.expansionId) || [])]
      .filter(metacardId => !knownCardmarketMetacards.has(metacardId));
    const referencesByName = new Map();
    const metacardsByName = new Map();
    for (const row of missing) {
      addSetValue(referencesByName, normalizedContextualName(row.nameEn), row.internalMetacardId);
    }
    for (const metacardId of remaining) {
      const names = namesByExpansionMetacard.get(`${contextual.expansionId}|${metacardId}`) || new Set();
      if (names.size !== 1) continue;
      addSetValue(metacardsByName, [...names][0], metacardId);
    }
    for (const [nameKey, internalIds] of referencesByName) {
      const metacardIds = metacardsByName.get(nameKey) || new Set();
      if (internalIds.size !== 1 || metacardIds.size !== 1) continue;
      addSetValue(contextualCandidates, [...internalIds][0], [...metacardIds][0]);
    }
  }
  const contextual = new Map([...contextualCandidates]
    .filter(([, metacardIds]) => metacardIds.size === 1)
    .map(([internalMetacardId, metacardIds]) => [internalMetacardId, [...metacardIds][0]]));

  // Regel 2: Nur ein beidseitig eindeutiger kompakter Name ohne bereits
  // vorhandenen exakten Namensmatch darf harmlose Zeichen/Abstände ausgleichen.
  const compact = new Map();
  for (const row of referencesByMetacard.values()) {
    if (row.cardmarketMetacardId || contextual.has(row.internalMetacardId)) continue;
    const exactMatches = cardmarketByName.get(normalizedContextualName(row.nameEn)) || new Set();
    const compactKey = normalizedCompactReferenceName(row.nameEn);
    const compactMatches = cardmarketByCompactName.get(compactKey) || new Set();
    const referenceMatches = referenceByCompactName.get(compactKey) || new Set();
    if (exactMatches.size || compactMatches.size !== 1 || referenceMatches.size !== 1) continue;
    compact.set(row.internalMetacardId, [...compactMatches][0]);
  }

  // Regel 3: Der entfernte Zusatz "(Skill)" ist nur für Karten zulässig, die
  // ausschließlich in eindeutig bezeichneten Speed-Duel-Sets vorkommen.
  const skill = new Map();
  for (const row of referencesByMetacard.values()) {
    if (row.cardmarketMetacardId || contextual.has(row.internalMetacardId) || compact.has(row.internalMetacardId)) continue;
    if (!row.setNames.size || [...row.setNames].some(setName => !isSpeedDuelSetName(setName))) continue;
    const exactMatches = cardmarketByName.get(normalizedContextualName(row.nameEn)) || new Set();
    const compactMatches = cardmarketByCompactName.get(normalizedCompactReferenceName(row.nameEn)) || new Set();
    if (exactMatches.size || compactMatches.size) continue;
    const candidates = [...(cardmarketBySkillName.get(normalizedSkillName(row.nameEn)) || [])]
      .filter(metacardId => explicitSkillMetacards.has(metacardId));
    if (candidates.length === 1) skill.set(row.internalMetacardId, candidates[0]);
  }

  return { contextual, compact, skill };
}

function applySafeUnresolvedMetacardMappings(
  database,
  cardmarketCatalog = {},
  exactExpansionMap = new Map()
) {
  const mappings = buildSafeUnresolvedMetacardMappings(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const updateMetacard = database.prepare(`
    UPDATE reference_metacards
    SET
      cardmarket_metacard_id = ?,
      mapping_status = 'exact',
      data_source = CASE
        WHEN INSTR(data_source, ?) > 0 THEN data_source
        ELSE data_source || ' + ' || ?
      END
    WHERE internal_metacard_id = ?
      AND cardmarket_metacard_id IS NULL
      AND mapping_status = 'unresolved'
  `);
  const updatePrints = database.prepare(`
    UPDATE reference_prints
    SET
      mapping_status = 'likely',
      data_source = CASE
        WHEN INSTR(data_source, ?) > 0 THEN data_source
        ELSE data_source || ' + ' || ?
      END
    WHERE mapping_status = 'unresolved'
      AND cardmarket_product_id IS NULL
      AND position_id IN (
        SELECT position_id
        FROM reference_set_positions
        WHERE internal_metacard_id = ?
      )
  `);
  const unresolvedPrintIds = database.prepare(`
    SELECT pr.print_id AS printId
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    WHERE sp.internal_metacard_id = ?
      AND pr.mapping_status = 'unresolved'
      AND pr.cardmarket_product_id IS NULL
    ORDER BY pr.print_id
  `);
  const rules = [
    ['contextual', 'Cardmarket safe contextual metacard 1:1'],
    ['compact', 'Cardmarket safe compact name normalization'],
    ['skill', 'Cardmarket safe Speed Duel skill suffix normalization']
  ];
  const resolved = { contextual: 0, compact: 0, skill: 0, total: 0 };
  const metacards = { contextual: 0, compact: 0, skill: 0, total: 0 };
  const printIds = [];
  for (const [rule, marker] of rules) {
    for (const [internalMetacardId, cardmarketMetacardId] of mappings[rule]) {
      const metaResult = updateMetacard.run(
        cardmarketMetacardId,
        marker,
        marker,
        internalMetacardId
      );
      if (Number(metaResult.changes || 0) !== 1) continue;
      metacards[rule] += 1;
      metacards.total += 1;
      const changedPrintIds = unresolvedPrintIds.all(internalMetacardId)
        .map(row => Number(row.printId));
      const printResult = updatePrints.run(marker, marker, internalMetacardId);
      const printCount = Number(printResult.changes || 0);
      if (printCount !== changedPrintIds.length) {
        throw new Error(`Inkonsistente unresolved-Auflösung für ${internalMetacardId}.`);
      }
      printIds.push(...changedPrintIds);
      resolved[rule] += printCount;
      resolved.total += printCount;
    }
  }
  return { resolved, metacards, printIds };
}

function applySafeProductMappingsForPrintIds(database, cardmarketCatalog = {}, printIds = []) {
  const targets = new Set((Array.isArray(printIds) ? printIds : []).map(Number).filter(Number.isFinite));
  if (!targets.size) return { upgraded: 0 };
  const exactExpansionMap = buildExactExpansionPrefixMap(database, cardmarketCatalog);
  const contextualExpansionMap = buildContextualExpansionPrefixMap(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const productsByMetacardExpansion = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const productId = String(row?.idProduct ?? row?.productId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    if (!/^\d+$/.test(productId) || !/^\d+$/.test(metacardId) || !/^\d+$/.test(expansionId)) continue;
    addSetValue(productsByMetacardExpansion, `${metacardId}|${expansionId}`, productId);
  }
  const rows = database.prepare(`
    SELECT
      pr.print_id AS printId,
      pr.mapping_status AS mappingStatus,
      pr.cardmarket_product_id AS cardmarketProductId,
      sp.set_prefix AS setPrefix,
      mc.cardmarket_metacard_id AS cardmarketMetacardId
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    ORDER BY pr.print_id
  `).all();
  const printsByMetacardPrefix = new Map();
  const usedProductIds = new Set();
  for (const row of rows) {
    if (row.mappingStatus === 'exact' && row.cardmarketProductId) {
      usedProductIds.add(String(row.cardmarketProductId));
    }
    const metacardId = String(row.cardmarketMetacardId || '').trim();
    const prefix = String(row.setPrefix || '').trim();
    if (!metacardId || !prefix) continue;
    const key = `${metacardId}|${prefix}`;
    if (!printsByMetacardPrefix.has(key)) printsByMetacardPrefix.set(key, []);
    printsByMetacardPrefix.get(key).push(row);
  }
  const update = database.prepare(`
    UPDATE reference_prints
    SET
      cardmarket_product_id = ?,
      mapping_status = 'exact',
      data_source = CASE
        WHEN INSTR(data_source, 'Cardmarket exact safe unresolved mapping') > 0 THEN data_source
        ELSE data_source || ' + Cardmarket exact safe unresolved mapping'
      END
    WHERE print_id = ?
      AND mapping_status = 'likely'
      AND cardmarket_product_id IS NULL
  `);
  let upgraded = 0;
  for (const row of rows) {
    if (!targets.has(Number(row.printId))) continue;
    if (row.mappingStatus !== 'likely' || row.cardmarketProductId || !row.cardmarketMetacardId) continue;
    const prefix = String(row.setPrefix || '').trim();
    const expansionIds = new Set([
      exactExpansionMap.get(prefix)?.expansionId,
      contextualExpansionMap.get(prefix)?.expansionId
    ].filter(Boolean));
    if (expansionIds.size !== 1) continue;
    const metacardId = String(row.cardmarketMetacardId).trim();
    const printGroup = printsByMetacardPrefix.get(`${metacardId}|${prefix}`) || [];
    if (printGroup.length !== 1) continue;
    const expansionId = [...expansionIds][0];
    const productIds = [...(productsByMetacardExpansion.get(`${metacardId}|${expansionId}`) || [])];
    if (productIds.length !== 1 || usedProductIds.has(productIds[0])) continue;
    const result = update.run(productIds[0], row.printId);
    if (Number(result.changes || 0) !== 1) continue;
    usedProductIds.add(productIds[0]);
    upgraded += 1;
  }
  return { upgraded };
}

function applySafeContextualCardmarketProductMappings(
  database,
  cardmarketCatalog = {},
  exactExpansionMap = new Map()
) {
  const contextualExpansionMap = buildContextualExpansionPrefixMap(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const productsByMetacardExpansion = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const productId = String(row?.idProduct ?? row?.productId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    if (!/^\d+$/.test(productId) || !/^\d+$/.test(metacardId) || !/^\d+$/.test(expansionId)) continue;
    addSetValue(productsByMetacardExpansion, `${metacardId}|${expansionId}`, productId);
  }
  const rows = database.prepare(`
    SELECT
      pr.print_id AS printId,
      pr.mapping_status AS mappingStatus,
      pr.cardmarket_product_id AS cardmarketProductId,
      sp.set_prefix AS setPrefix,
      mc.cardmarket_metacard_id AS cardmarketMetacardId
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    ORDER BY pr.print_id
  `).all();
  const printsByMetacardPrefix = new Map();
  const usedProductIds = new Set();
  for (const row of rows) {
    const metacardId = String(row.cardmarketMetacardId || '').trim();
    const prefix = String(row.setPrefix || '').trim();
    if (row.mappingStatus === 'exact' && row.cardmarketProductId) {
      usedProductIds.add(String(row.cardmarketProductId));
    }
    if (!metacardId || !prefix) continue;
    const key = `${metacardId}|${prefix}`;
    if (!printsByMetacardPrefix.has(key)) printsByMetacardPrefix.set(key, []);
    printsByMetacardPrefix.get(key).push(row);
  }

  const update = database.prepare(`
    UPDATE reference_prints
    SET
      cardmarket_product_id = ?,
      mapping_status = 'exact',
      data_source = CASE
        WHEN INSTR(data_source, 'Cardmarket exact contextual expansion membership') > 0 THEN data_source
        ELSE data_source || ' + Cardmarket exact contextual expansion membership'
      END
    WHERE print_id = ?
      AND mapping_status = 'likely'
      AND cardmarket_product_id IS NULL
  `);
  let upgraded = 0;
  const blocked = {
    noContextualExpansion: 0,
    multipleReferencePrints: 0,
    missingProduct: 0,
    multipleProducts: 0,
    productAlreadyAssigned: 0
  };
  for (const row of rows) {
    if (row.mappingStatus !== 'likely' || row.cardmarketProductId || !row.cardmarketMetacardId) continue;
    const prefix = String(row.setPrefix || '').trim();
    const contextual = contextualExpansionMap.get(prefix);
    if (!contextual) {
      blocked.noContextualExpansion += 1;
      continue;
    }
    const metacardId = String(row.cardmarketMetacardId).trim();
    const printGroup = printsByMetacardPrefix.get(`${metacardId}|${prefix}`) || [];
    if (printGroup.length !== 1) {
      blocked.multipleReferencePrints += 1;
      continue;
    }
    const productIds = [...(productsByMetacardExpansion.get(
      `${metacardId}|${contextual.expansionId}`
    ) || [])];
    if (!productIds.length) {
      blocked.missingProduct += 1;
      continue;
    }
    if (productIds.length !== 1) {
      blocked.multipleProducts += 1;
      continue;
    }
    const productId = productIds[0];
    if (usedProductIds.has(productId)) {
      blocked.productAlreadyAssigned += 1;
      continue;
    }
    const result = update.run(productId, row.printId);
    if (Number(result.changes || 0) === 1) {
      usedProductIds.add(productId);
      upgraded += 1;
    }
  }
  return {
    upgraded,
    exactExpansionCount: contextualExpansionMap.size,
    blocked
  };
}

function applySafeCardmarketProductMappings(database, cardmarketCatalog = {}) {
  const before = mappingStatusCounts(database);
  const exactExpansionMap = buildExactExpansionPrefixMap(database, cardmarketCatalog);
  const productsByMetacardExpansion = new Map();
  for (const row of cardmarketProducts(cardmarketCatalog)) {
    const productId = String(row?.idProduct ?? row?.productId ?? '').trim();
    const metacardId = String(row?.idMetacard ?? row?.metacardId ?? '').trim();
    const expansionId = String(row?.idExpansion ?? row?.expansionId ?? '').trim();
    if (!/^\d+$/.test(productId) || !/^\d+$/.test(metacardId) || !/^\d+$/.test(expansionId)) continue;
    addSetValue(productsByMetacardExpansion, `${metacardId}|${expansionId}`, productId);
  }

  const rows = database.prepare(`
    SELECT
      pr.print_id AS printId,
      pr.mapping_status AS mappingStatus,
      pr.cardmarket_product_id AS cardmarketProductId,
      sp.set_prefix AS setPrefix,
      mc.cardmarket_metacard_id AS cardmarketMetacardId
    FROM reference_prints pr
    JOIN reference_set_positions sp ON sp.position_id = pr.position_id
    JOIN reference_metacards mc ON mc.internal_metacard_id = sp.internal_metacard_id
    ORDER BY pr.print_id
  `).all();
  const printsByMetacardPrefix = new Map();
  for (const row of rows) {
    const metacardId = String(row.cardmarketMetacardId || '').trim();
    const prefix = String(row.setPrefix || '').trim();
    if (!metacardId || !prefix) continue;
    const key = `${metacardId}|${prefix}`;
    if (!printsByMetacardPrefix.has(key)) printsByMetacardPrefix.set(key, []);
    printsByMetacardPrefix.get(key).push(row);
  }

  const update = database.prepare(`
    UPDATE reference_prints
    SET
      cardmarket_product_id = ?,
      mapping_status = 'exact',
      data_source = CASE
        WHEN INSTR(data_source, 'Cardmarket exact expansion membership') > 0 THEN data_source
        ELSE data_source || ' + Cardmarket exact expansion membership'
      END
    WHERE print_id = ?
      AND mapping_status = 'likely'
      AND cardmarket_product_id IS NULL
  `);
  const productAssignments = new Map();
  let upgraded = 0;
  const blocked = {
    noExactExpansion: 0,
    multipleReferencePrints: 0,
    missingProduct: 0,
    multipleProducts: 0,
    existingExact: 0
  };
  for (const row of rows) {
    if (row.mappingStatus === 'exact') {
      blocked.existingExact += 1;
      continue;
    }
    if (row.mappingStatus !== 'likely' || !row.cardmarketMetacardId) continue;
    const expansion = exactExpansionMap.get(String(row.setPrefix || '').trim());
    if (!expansion) {
      blocked.noExactExpansion += 1;
      continue;
    }
    const printGroup = printsByMetacardPrefix.get(`${row.cardmarketMetacardId}|${row.setPrefix}`) || [];
    if (printGroup.length !== 1) {
      blocked.multipleReferencePrints += 1;
      continue;
    }
    const productIds = [...(productsByMetacardExpansion.get(
      `${row.cardmarketMetacardId}|${expansion.expansionId}`
    ) || [])];
    if (!productIds.length) {
      blocked.missingProduct += 1;
      continue;
    }
    if (productIds.length !== 1) {
      blocked.multipleProducts += 1;
      continue;
    }
    const productId = productIds[0];
    const previousPrintId = productAssignments.get(productId);
    if (previousPrintId && previousPrintId !== row.printId) continue;
    const result = update.run(productId, row.printId);
    if (Number(result.changes || 0) === 1) {
      productAssignments.set(productId, row.printId);
      upgraded += 1;
    }
  }
  const contextual = applySafeContextualCardmarketProductMappings(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const unresolvedResolutionInternal = applySafeUnresolvedMetacardMappings(
    database,
    cardmarketCatalog,
    exactExpansionMap
  );
  const newlyResolvedProducts = applySafeProductMappingsForPrintIds(
    database,
    cardmarketCatalog,
    unresolvedResolutionInternal.printIds
  );
  const unresolvedResolution = {
    resolved: unresolvedResolutionInternal.resolved,
    metacards: unresolvedResolutionInternal.metacards,
    exactProducts: newlyResolvedProducts.upgraded
  };
  const after = mappingStatusCounts(database);
  if (after.exact < before.exact) throw new Error('Bestehende exakte Cardmarket-Zuordnungen wurden verschlechtert.');
  return {
    before,
    after,
    upgraded: upgraded + contextual.upgraded + newlyResolvedProducts.upgraded,
    exactExpansionUpgraded: upgraded,
    contextualUpgraded: contextual.upgraded,
    newlyResolvedExactUpgraded: newlyResolvedProducts.upgraded,
    exactExpansionCount: exactExpansionMap.size,
    contextualExpansionCount: contextual.exactExpansionCount,
    unresolvedResolution,
    blocked,
    contextualBlocked: contextual.blocked,
    collisions: findSetCodeRarityCollisions(database)
  };
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

      const mappingReport = applySafeCardmarketProductMappings(database, cardmarketCatalog);
      exactCardmarketCount = mappingReport.after.exact;
      likelyCount = mappingReport.after.likely;
      unresolvedCount = mappingReport.after.unresolved;

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
        cardmarket_exact_expansion_count: mappingReport.exactExpansionCount,
        cardmarket_contextual_expansion_count: mappingReport.contextualExpansionCount,
        cardmarket_exact_expansion_upgraded_count: mappingReport.exactExpansionUpgraded,
        cardmarket_contextual_exact_upgraded_count: mappingReport.contextualUpgraded,
        cardmarket_exact_upgraded_count: mappingReport.upgraded,
        unresolved_contextual_resolved_count: mappingReport.unresolvedResolution.resolved.contextual,
        unresolved_compact_name_resolved_count: mappingReport.unresolvedResolution.resolved.compact,
        unresolved_speed_duel_skill_resolved_count: mappingReport.unresolvedResolution.resolved.skill,
        unresolved_safe_resolved_count: mappingReport.unresolvedResolution.resolved.total,
        unresolved_safe_exact_count: mappingReport.unresolvedResolution.exactProducts,
        set_code_rarity_collision_count: mappingReport.collisions.length,
        cardmarket_exact_matching_rule: 'unique complete signature, conservative contextual 1:1 reconciliation, safe compact name normalization or explicit Speed Duel skill suffix; product exact only with one print + one product',
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
        cardmarketUpgradedCount: mappingReport.upgraded,
        cardmarketExactExpansionUpgradedCount: mappingReport.exactExpansionUpgraded,
        cardmarketContextualUpgradedCount: mappingReport.contextualUpgraded,
        exactExpansionCount: mappingReport.exactExpansionCount,
        contextualExpansionCount: mappingReport.contextualExpansionCount,
        unresolvedResolution: mappingReport.unresolvedResolution,
        setCodeRarityCollisionCount: mappingReport.collisions.length,
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

function upsertMetadata(database, key, value) {
  database.prepare(`
    INSERT INTO reference_metadata (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value ?? ''));
}

function metadataNumber(database, key, fallback = 0) {
  const row = database.prepare('SELECT value FROM reference_metadata WHERE key = ?').get(key);
  const value = Number(row?.value);
  return Number.isFinite(value) ? value : fallback;
}

function existingSafeResolutionReport(database) {
  const counts = mappingStatusCounts(database);
  return {
    before: counts,
    after: counts,
    upgraded: 0,
    exactExpansionUpgraded: 0,
    contextualUpgraded: 0,
    newlyResolvedExactUpgraded: 0,
    exactExpansionCount: metadataNumber(database, 'cardmarket_exact_expansion_count'),
    contextualExpansionCount: metadataNumber(database, 'cardmarket_contextual_expansion_count'),
    unresolvedResolution: {
      resolved: {
        contextual: metadataNumber(database, 'unresolved_contextual_resolved_count'),
        compact: metadataNumber(database, 'unresolved_compact_name_resolved_count'),
        skill: metadataNumber(database, 'unresolved_speed_duel_skill_resolved_count'),
        total: metadataNumber(database, 'unresolved_safe_resolved_count')
      },
      metacards: { contextual: 0, compact: 0, skill: 0, total: 0 },
      exactProducts: metadataNumber(database, 'unresolved_safe_exact_count')
    },
    blocked: {},
    contextualBlocked: {},
    collisions: findSetCodeRarityCollisions(database)
  };
}

function remapExistingPrintReference({ databasePath, cardmarketCatalog = {}, catalogPath = '' } = {}) {
  if (!databasePath) throw new Error('Pfad zur Print-Referenz fehlt.');
  const targetPath = path.resolve(databasePath);
  if (!fs.existsSync(targetPath)) throw new Error(`Print-Referenz fehlt: ${targetPath}`);
  const temporaryPath = `${targetPath}.mapping.new`;
  fs.rmSync(temporaryPath, { force: true });
  fs.copyFileSync(targetPath, temporaryPath);
  const database = new DatabaseSync(temporaryPath);
  let report;
  try {
    const schemaVersion = Number(database.prepare('PRAGMA user_version').get()?.user_version || 0);
    if (schemaVersion !== 2) throw new Error(`Unbekannte Print-Referenzversion: ${schemaVersion}.`);
    database.exec('BEGIN IMMEDIATE;');
    try {
      report = metadataNumber(database, 'unresolved_safe_resolved_count') > 0
        ? existingSafeResolutionReport(database)
        : applySafeCardmarketProductMappings(database, cardmarketCatalog);
      upsertMetadata(database, 'exact_cardmarket_count', report.after.exact);
      upsertMetadata(database, 'likely_count', report.after.likely);
      upsertMetadata(database, 'unresolved_count', report.after.unresolved);
      upsertMetadata(database, 'without_cardmarket_id_count', report.after.likely + report.after.unresolved);
      upsertMetadata(database, 'cardmarket_exact_expansion_count', report.exactExpansionCount);
      upsertMetadata(database, 'cardmarket_contextual_expansion_count', report.contextualExpansionCount);
      upsertMetadata(database, 'cardmarket_exact_expansion_upgraded_count', report.exactExpansionUpgraded);
      upsertMetadata(database, 'cardmarket_contextual_exact_upgraded_count', report.contextualUpgraded);
      upsertMetadata(database, 'cardmarket_exact_upgraded_count', report.upgraded);
      upsertMetadata(database, 'unresolved_contextual_resolved_count', report.unresolvedResolution.resolved.contextual);
      upsertMetadata(database, 'unresolved_compact_name_resolved_count', report.unresolvedResolution.resolved.compact);
      upsertMetadata(database, 'unresolved_speed_duel_skill_resolved_count', report.unresolvedResolution.resolved.skill);
      upsertMetadata(database, 'unresolved_safe_resolved_count', report.unresolvedResolution.resolved.total);
      upsertMetadata(database, 'unresolved_safe_exact_count', report.unresolvedResolution.exactProducts);
      upsertMetadata(database, 'set_code_rarity_collision_count', report.collisions.length);
      upsertMetadata(database, 'cardmarket_exact_matching_rule', 'unique complete signature, conservative contextual 1:1 reconciliation, safe compact name normalization or explicit Speed Duel skill suffix; product exact only with one print + one product');
      upsertMetadata(database, 'cardmarket_remapped_at', new Date().toISOString());
      if (catalogPath) upsertMetadata(database, 'cardmarket_catalog_sha256', sha256File(catalogPath));
      database.exec('COMMIT;');
      database.exec('PRAGMA optimize;');
    } catch (error) {
      database.exec('ROLLBACK;');
      throw error;
    }
    const integrity = String(database.prepare('PRAGMA integrity_check').get()?.integrity_check || '');
    const foreignKeyErrors = database.prepare('PRAGMA foreign_key_check').all();
    if (integrity !== 'ok' || foreignKeyErrors.length) {
      throw new Error(`Print-Referenzprüfung fehlgeschlagen: ${integrity || 'unbekannt'}, FK ${foreignKeyErrors.length}.`);
    }
  } finally {
    database.close();
  }
  fs.rmSync(targetPath, { force: true });
  fs.renameSync(temporaryPath, targetPath);
  return { databasePath: targetPath, ...report };
}

function parseJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--remap-existing') {
    const [, databasePath, cardmarketPath] = args;
    if (!databasePath || !cardmarketPath) {
      throw new Error('Aufruf: build-print-reference.js --remap-existing <print-reference.sqlite> <products_singles_3.json>');
    }
    const report = remapExistingPrintReference({
      databasePath,
      cardmarketCatalog: parseJson(cardmarketPath),
      catalogPath: cardmarketPath
    });
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  const [englishPath, germanPath, cardmarketPath, versionPath, outputPath] = args;
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
  applySafeUnresolvedMetacardMappings,
  applySafeContextualCardmarketProductMappings,
  applySafeCardmarketProductMappings,
  buildSafeUnresolvedMetacardMappings,
  buildContextualExpansionPrefixMap,
  buildPrintReferenceDatabase,
  buildExactExpansionPrefixMap,
  cardPasscode,
  cardmarketIndex,
  findSetCodeRarityCollisions,
  mappingStatusCounts,
  remapExistingPrintReference,
  sourceTreatment,
  uniquePrintRows
};
