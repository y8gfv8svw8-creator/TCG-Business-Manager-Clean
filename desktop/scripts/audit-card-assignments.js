const { DatabaseSync } = require('node:sqlite');
const cardSearch = require('../app/shared/card-search');

const databasePath = process.argv[2];
if (!databasePath) throw new Error('SQLite-Pfad fehlt.');

const db = new DatabaseSync(databasePath, { readOnly: true });
const queryOne = sql => db.prepare(sql).get();
const state = JSON.parse(queryOne('SELECT state_json FROM app_state WHERE id = 1').state_json);
const records = [];

(state.inventory || []).forEach(record => records.push(['inventory', record]));
(state.privateCollection || []).forEach(record => records.push(['private', record]));
(state.purchases || []).forEach(order => (order.pendingItems || []).forEach(record => records.push(['purchase', record])));
(state.sales || []).forEach(order => (order.items || []).forEach(record => records.push(['sale', record])));
(state.watchlist || []).forEach(record => records.push(['watch', record]));
(state.wantlists || []).forEach(list => (list.entries || []).forEach(record => records.push(['want', record])));

const areas = {};
for (const [area, record] of records) {
  areas[area] ||= { total: 0, missingId: 0, missingPrint: 0 };
  areas[area].total++;
  if (!/^\d+$/.test(String(record.productId || ''))) areas[area].missingId++;
  if (!String(record.setName || record.set || '').trim()
      || !String(record.collectorNumber || '').trim()
      || !String(record.rarity || record.version || '').trim()) areas[area].missingPrint++;
}

const products = queryOne(`
  SELECT COUNT(*) AS total,
    SUM(CASE WHEN rarity = '' THEN 1 ELSE 0 END) AS missingRarity,
    SUM(CASE WHEN collector_number = '' THEN 1 ELSE 0 END) AS missingNumber,
    SUM(CASE WHEN set_name = '' THEN 1 ELSE 0 END) AS missingSet
  FROM products
`);

function parsedIdentity(record) {
  const rawName = String(record.name || record.germanName || record.englishName || '').trim();
  const match = rawName.match(/\s*\((V\.?\s*\d+)\s*[-–—]\s*([^)]+)\)\s*$/i);
  return {
    baseName: match ? rawName.slice(0, match.index).trim() : rawName,
    variant: match ? match[1].replace(/\s+/g, '') : '',
    rarity: String(record.rarity || record.version || (match ? match[2] : '') || '').trim()
  };
}

let candidateSummary;
if (process.argv.includes('--details')) {
  const catalogRows = db.prepare(`
    SELECT p.product_id AS productId, p.official_name AS officialName,
      p.metacard_id AS metacardId, p.expansion_id AS expansionId,
      p.set_name AS setName, p.set_code AS setCode, p.rarity, p.variant,
      p.collector_number AS collectorNumber, m.name_de AS germanName,
      m.name_en AS englishName
    FROM products p
    LEFT JOIN card_name_mappings m ON m.metacard_id = p.metacard_id
  `).all();
  const inferredCatalogRows=cardSearch.inferVariantOrdinals(catalogRows);
  const index = new Map();
  for (const row of inferredCatalogRows) {
    for (const value of [row.germanName, row.englishName, String(row.officialName || '').replace(/\s*\([^)]*\)\s*$/, '')]) {
      const key = cardSearch.normalizeCompact(value);
      if (!key) continue;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(row);
    }
  }
  candidateSummary = records
    .filter(([, record]) => !/^\d+$/.test(String(record.productId || '')))
    .map(([area, record]) => {
      const identity = parsedIdentity(record);
      let candidates = index.get(cardSearch.normalizeCompact(identity.baseName)) || [];
      const wantedSet = cardSearch.normalizeCompact(record.setName || record.set || '');
      const setMatches = wantedSet ? candidates.filter(row =>
        cardSearch.normalizeCompact(row.setName) === wantedSet
        || cardSearch.normalizeCompact(row.setCode) === wantedSet) : [];
      if (setMatches.length) candidates = setMatches;
      const wantedRarity = cardSearch.normalizeCompact(identity.rarity);
      const wantedVariant = cardSearch.normalizeCompact(identity.variant);
      const printMatches = candidates.filter(row =>
        (!wantedRarity || cardSearch.normalizeCompact(row.rarity) === wantedRarity)
        && (!wantedVariant || cardSearch.normalizeCompact(row.variant) === wantedVariant));
      if (printMatches.length) candidates = printMatches;
      const safeCandidate=cardSearch.selectSafeVariant(record,index.get(cardSearch.normalizeCompact(identity.baseName))||[]);
      return {
        area,
        name: record.name || '',
        candidateCount: candidates.length,
        safeProductId:safeCandidate?.productId||'',
        candidates: candidates.slice(0, 12)
      };
    });
}

console.log(JSON.stringify({
  updated: queryOne('SELECT updated_at FROM app_state WHERE id = 1').updated_at,
  areas,
  products,
  ...(candidateSummary ? { safeProposalCount:candidateSummary.filter(row=>row.safeProductId).length,candidateSummary } : {}),
  ...(process.argv.includes('--details') ? {
    unresolved: records
      .filter(([, record]) => !/^\d+$/.test(String(record.productId || '')))
      .map(([area, record]) => ({
        area,
        id: record.id || '',
        name: record.name || '',
        germanName: record.germanName || '',
        englishName: record.englishName || '',
        set: record.setName || record.set || '',
        collectorNumber: record.collectorNumber || '',
        rarity: record.rarity || record.version || ''
      }))
  } : {})
}, null, 2));
db.close();
