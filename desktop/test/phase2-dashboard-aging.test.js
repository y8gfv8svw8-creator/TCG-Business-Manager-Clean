const test = require('node:test');
const assert = require('node:assert/strict');

const automation = require('../app/shared/business-automation');
const { normalizeSettings } = require('../app/shared/app-config');

const settings = normalizeSettings({});

test('ordnet alle Altersgrenzen und unbekannte Daten eindeutig zu', () => {
  assert.equal(automation.agingBucket(14, settings).status, 'FRISCH');
  assert.equal(automation.agingBucket(15, settings).status, 'BEOBACHTEN');
  assert.equal(automation.agingBucket(31, settings).status, 'PRÜFEN');
  assert.equal(automation.agingBucket(46, settings).status, 'KAPITALBINDUNG');
  assert.equal(automation.agingBucket(61, settings).status, 'LANGSAMDREHER');
  assert.equal(automation.agingBucket(91, settings).status, 'ENTSCHEIDUNG ERFORDERLICH');
  assert.equal(automation.agingBucket(null, settings).status, 'ALTER UNBEKANNT');
});

test('zählt historische Baselines nicht als belegte Erstinserierung', () => {
  const baselineOnly = { listingHistory: [{ eventType: 'baseline', changedAt: '2026-01-01' }] };
  assert.equal(automation.listingStartDate(baselineOnly), null);
  const confirmed = { listingHistory: [
    { eventType: 'baseline', changedAt: '2025-01-01' },
    { eventType: 'first_listing', changedAt: '2026-02-03' }
  ] };
  assert.match(automation.listingStartDate(confirmed), /^2026-02-03/);
});

test('berechnet Bestandsalter und Inseratsalter aus getrennten Ereignissen', () => {
  const result = automation.analyzeInventoryItem({
    purchaseDate: '2026-01-01', listed: true, listingPrice: 1,
    listingHistory: [{ eventType: 'first_listing', changedAt: '2026-08-01T10:00:00.000Z' }]
  }, { avg7: 1 }, settings, new Date('2026-08-14T12:00:00.000Z'));
  assert.equal(result.inventoryAgeDays, 225);
  assert.equal(result.listingAgeDays, 13);
});

test('behandelt den Importtag eines historischen Cardmarket-Snapshots nicht als Einkaufstag', () => {
  const result = automation.analyzeInventoryItem({
    purchaseDate: '2026-08-14', source: 'Cardmarket-Bestandsabgleich',
    importKey: 'STOCK-cardmarket-stock-2026-08-14.csv', listed: true, listingPrice: 1,
    listingHistory: [{ eventType: 'baseline', changedAt: '2026-08-14' }]
  }, { avg7: 1 }, settings, new Date('2026-08-14'));
  assert.equal(result.inventoryAgeDays, null);
  assert.equal(result.listingAgeDays, null);
  assert.equal(result.inventoryBucket.status, 'ALTER UNBEKANNT');
});

test('erzwingt logisch aufsteigende Preisgruppen-Grenzen und klassifiziert sie', () => {
  const custom = normalizeSettings({ priceGroupAFrom: 1, priceGroupBFrom: 2, priceGroupCFrom: 3 });
  assert.ok(custom.priceGroupAFrom > custom.priceGroupBFrom);
  assert.ok(custom.priceGroupBFrom > custom.priceGroupCFrom);
  const customAges = normalizeSettings({ agingFreshMaxDays: 60, agingObserveMaxDays: 20, agingReviewMaxDays: 10, agingCapitalMaxDays: 5, agingSlowMaxDays: 1 });
  assert.ok(customAges.agingFreshMaxDays < customAges.agingObserveMaxDays);
  assert.ok(customAges.agingObserveMaxDays < customAges.agingReviewMaxDays);
  assert.ok(customAges.agingReviewMaxDays < customAges.agingCapitalMaxDays);
  assert.ok(customAges.agingCapitalMaxDays < customAges.agingSlowMaxDays);
  assert.equal(automation.priceGroup(7, settings).key, 'A');
  assert.equal(automation.priceGroup(2, settings).key, 'B');
  assert.equal(automation.priceGroup(0.5, settings).key, 'C');
  assert.equal(automation.priceGroup(0.1, settings).key, 'D');
});

test('Langfrist-Profil unterdrückt reine Alters-Langsamdreher-Warnung', () => {
  const item = {
    purchaseDate: '2025-01-01', listed: true, listingPrice: 3,
    cost: 1, costStatus: 'known', holdingProfile: 'VINTAGE', longTermHold: true
  };
  const result = automation.analyzeInventoryItem(item, { avg7: 3 }, settings, new Date('2026-08-14'));
  assert.equal(result.recommendation, 'LANGFRISTIG HALTEN');
  assert.equal(result.profile, 'VINTAGE');
});

test('berechnet Liquidität und Handelsvermögen ohne unbekannte EK doppelt zu zählen', () => {
  const result = automation.buildCapitalOverview({
    capitalAccounts: [
      { id: 'cm', type: 'cardmarket' }, { id: 'bank', type: 'bank' }
    ],
    capitalEntries: [
      { id: 'open', accountId: 'cm', type: 'opening', amount: 40 },
      { id: 'sale', accountId: 'bank', type: 'sale', amount: 10 },
      { id: 'fee', accountId: 'cm', type: 'fee', amount: -5 },
      { id: 'from', transferId: 't1', accountId: 'cm', type: 'transfer', amount: -3 },
      { id: 'to', transferId: 't1', accountId: 'bank', type: 'transfer', amount: 3 }
    ],
    inventory: [
      { id: '1', productId: 'p1', status: 'Inseriert', listed: true, listingPrice: 5, cost: 2, costStatus: 'known' },
      { id: '2', productId: 'p2', status: 'Im Bestand', listed: false, cost: 99, costStatus: 'unknown' },
      { id: '3', productId: 'p3', status: 'Verkauft', cost: 8, costStatus: 'known' }
    ]
  }, { p1: { avg7: 4 }, p2: { low: 1 } });
  assert.equal(result.liquid, 45);
  assert.equal(result.byType.cardmarket, 32);
  assert.equal(result.byType.bank, 13);
  assert.equal(result.entryTotals.opening, 40);
  assert.equal(result.entryTotals.sale, 10);
  assert.equal(result.entryTotals.fee, -5);
  assert.equal(result.entryTotals.transfer, 3);
  assert.equal(result.knownStockCost, 2);
  assert.equal(result.tradingWealthAtCost, 47);
  assert.equal(result.listingValue, 5);
  assert.equal(result.unknownListingValue, 0);
  assert.equal(result.referenceValue, 5);
  assert.equal(result.physicalCards, 2);
  assert.equal(result.knownCostCount, 1);
  assert.equal(result.unknownCostCount, 1);
});

test('Empfehlungen verändern niemals Karte oder Inseratspreis', () => {
  const item = { purchaseDate: '2025-01-01', listed: true, listingPrice: 2, cost: 1, costStatus: 'known', holdingProfile: 'BULK' };
  const before = JSON.stringify(item);
  const result = automation.analyzeInventoryItem(item, { avg7: 1 }, settings, new Date('2026-08-14'));
  assert.equal(JSON.stringify(item), before);
  assert.equal(result.recommendation, 'PREIS PRÜFEN');
  assert.ok(result.factors.some(value => value.includes('Price-Guide-Referenz')));
});

test('Langsamdreher-Filter kombinieren Alter, Preisgruppe, Profil, EK und Kartendaten', () => {
  const item = { language: 'DE', condition: 'NM', holdingProfile: 'META / STAPLE' };
  const analysis = {
    inventoryBucket: { key: '61-90' }, priceGroup: { key: 'B' },
    profile: 'META / STAPLE', costKnown: true, longTerm: false, currentPrice: 2.50
  };
  assert.equal(automation.matchesSlowMoverFilters(analysis, item, {
    ageKey: '61-90', priceGroup: 'B', profile: 'META / STAPLE', cost: 'known',
    longTerm: 'no', language: 'DE', condition: 'NM', minPrice: 2, maxPrice: 3
  }), true);
  assert.equal(automation.matchesSlowMoverFilters(analysis, item, { priceGroup: 'A' }), false);
  assert.equal(automation.matchesSlowMoverFilters(analysis, item, { cost: 'unknown' }), false);
  assert.equal(automation.matchesSlowMoverFilters(analysis, item, { minPrice: 3 }), false);
});
