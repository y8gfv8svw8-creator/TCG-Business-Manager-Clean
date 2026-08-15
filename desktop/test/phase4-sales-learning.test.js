const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const automation = require('../app/shared/business-automation');
const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function sale(overrides = {}) {
  return {
    productId: '100', orderId: `sale-${Math.random()}`, soldAt: '2026-08-10', quantity: 1,
    sellPrice: 10, fullCost: 5, costKnown: true, unitProfit: 4,
    daysToSale: 10, name: 'Testkarte', germanName: 'Testkarte', englishName: 'Test Card',
    setName: 'Test Set', rarity: 'Ultra Rare', holdingProfile: 'META / STAPLE', ...overrides
  };
}

function analyze(records, asOf = '2026-08-15T12:00:00.000Z') {
  return automation.analyzeOwnSalesExperience(records, { asOf });
}

test('0 Verkäufe ergeben keine Printstatistik und die Datenstufe KEINE DATEN', () => {
  assert.deepEqual(analyze([]), []);
  assert.equal(automation.ownSalesDataQuality(0).label, 'KEINE DATEN');
});

test('1 Verkauf bleibt eine sehr geringe Datenbasis', () => {
  const row = analyze([sale()])[0];
  assert.equal(row.saleCount, 1);
  assert.equal(row.dataQuality.label, 'SEHR GERINGE DATENBASIS');
  assert.equal(row.dataQuality.sufficient, false);
});

test('2 Verkäufe bleiben eine geringe Datenbasis', () => {
  const row = analyze([sale({ orderId: 'a' }), sale({ orderId: 'b' })])[0];
  assert.equal(row.dataQuality.label, 'GERINGE DATENBASIS');
});

test('3 bis 4 Verkäufe bilden eine eingeschränkte Datenbasis', () => {
  assert.equal(automation.ownSalesDataQuality(3).label, 'EINGESCHRÄNKTE DATENBASIS');
  assert.equal(automation.ownSalesDataQuality(4).label, 'EINGESCHRÄNKTE DATENBASIS');
});

test('ab 5 Verkäufen sind eigene Daten ausreichend', () => {
  const rows = Array.from({ length: 5 }, (_, index) => sale({ orderId: `order-${index}` }));
  assert.equal(analyze(rows)[0].dataQuality.label, 'AUSREICHENDE EIGENE DATEN');
  assert.equal(analyze(rows)[0].dataQuality.sufficient, true);
});

test('Median Liegedauer ist robust gegen einen alten Ausreißer', () => {
  const durations = [4, 7, 9, 12, 90];
  const row = analyze(durations.map((daysToSale, index) => sale({ orderId: `d-${index}`, daysToSale })))[0];
  assert.equal(row.medianDays, 9);
  assert.equal(row.averageDays, 24.4);
  assert.equal(row.minimumDays, 4);
  assert.equal(row.maximumDays, 90);
});

test('gerade Zahl von Liegedauern liefert den mathematischen Median', () => {
  const row = analyze([5, 9, 13, 20].map((daysToSale, index) => sale({ orderId: `e-${index}`, daysToSale })))[0];
  assert.equal(row.medianDays, 11);
});

test('unbekannte Liegedauer bleibt aus Median und Durchschnitt ausgeschlossen', () => {
  const row = analyze([
    sale({ orderId: 'known', daysToSale: 8 }),
    sale({ orderId: 'unknown', daysToSale: null, daysToSaleSamples: [] })
  ])[0];
  assert.equal(row.saleCount, 2);
  assert.equal(row.durationKnownCount, 1);
  assert.equal(row.durationUnknownCount, 1);
  assert.equal(row.medianDays, 8);
});

test('unbekannter EK zählt Verkauf und Dauer aber nicht Gewinn oder ROI', () => {
  const row = analyze([sale({ costKnown: false, fullCost: null, unitProfit: null })])[0];
  assert.equal(row.saleCount, 1);
  assert.equal(row.durationKnownCount, 1);
  assert.equal(row.averageFullCost, null);
  assert.equal(row.averageProfit, null);
  assert.equal(row.averageRoi, null);
  assert.equal(row.totalProfit, null);
});

test('bekannter Vollkosten-EK fließt in Gewinn und ROI ein', () => {
  const row = analyze([sale({ fullCost: 5, unitProfit: 2.5 })])[0];
  assert.equal(row.averageFullCost, 5);
  assert.equal(row.averageProfit, 2.5);
  assert.equal(row.averageRoi, 50);
});

test('bekannte und unbekannte EK werden nicht miteinander gemittelt', () => {
  const row = analyze([
    sale({ orderId: 'known', fullCost: 4, unitProfit: 2, costKnown: true }),
    sale({ orderId: 'unknown', fullCost: null, unitProfit: null, costKnown: false })
  ])[0];
  assert.equal(row.knownCostQuantity, 1);
  assert.equal(row.unknownCostQuantity, 1);
  assert.equal(row.averageFullCost, 4);
  assert.equal(row.averageProfit, 2);
});

test('durchschnittlicher und Median-VK berücksichtigen Stückzahlen', () => {
  const row = analyze([
    sale({ orderId: 'one', quantity: 1, sellPrice: 2 }),
    sale({ orderId: 'two', quantity: 2, sellPrice: 5 })
  ])[0];
  assert.equal(row.soldQuantity, 3);
  assert.equal(row.averageSellPrice, 4);
  assert.equal(row.medianSellPrice, 5);
  assert.equal(row.minimumSellPrice, 2);
  assert.equal(row.maximumSellPrice, 5);
});

test('durchschnittlicher und Median-Gewinn werden aus bekannten Vollkosten-Verkäufen gebildet', () => {
  const row = analyze([
    sale({ orderId: 'one', unitProfit: 1, fullCost: 4 }),
    sale({ orderId: 'two', unitProfit: 3, fullCost: 6 })
  ])[0];
  assert.equal(row.averageProfit, 2);
  assert.equal(row.medianProfit, 2);
});

test('Gesamtgewinn summiert nur Verkäufe mit bekanntem Vollkosten-EK', () => {
  const row = analyze([
    sale({ orderId: 'one', quantity: 2, unitProfit: 1.5 }),
    sale({ orderId: 'unknown', costKnown: false, fullCost: null, unitProfit: null })
  ])[0];
  assert.equal(row.totalProfit, 3);
});

test('Verkaufsfrequenz wird für 30 90 und 180 Tage getrennt gezählt', () => {
  const row = analyze([
    sale({ orderId: 'd10', soldAt: '2026-08-05' }),
    sale({ orderId: 'd50', soldAt: '2026-06-26' }),
    sale({ orderId: 'd120', soldAt: '2026-04-17' }),
    sale({ orderId: 'd250', soldAt: '2025-12-08' })
  ])[0];
  assert.deepEqual([row.sales30, row.sales90, row.sales180, row.saleCount], [1, 2, 3, 4]);
});

test('mehrere Positionen derselben Bestellung zählen als ein Verkaufsvorgang', () => {
  const row = analyze([sale({ orderId: 'same' }), sale({ orderId: 'same' })])[0];
  assert.equal(row.saleCount, 1);
  assert.equal(row.soldQuantity, 2);
});

for (const [days, expected] of [[7, 'SEHR SCHNELL'], [8, 'SCHNELL'], [22, 'NORMAL'], [46, 'LANGSAM'], [91, 'SEHR LANGSAM']]) {
  test(`Umschlagklasse ${expected} gilt bei Median ${days} Tagen`, () => {
    assert.equal(automation.ownTurnoverClass(days, 5).label, expected);
  });
}

test('zu geringe Datenbasis wird nur als Tendenz und nicht als belastbare Klasse gezeigt', () => {
  const turnover = automation.ownTurnoverClass(5, 1);
  assert.equal(turnover.label, 'SEHR SCHNELL');
  assert.equal(turnover.sufficient, false);
  assert.match(turnover.displayLabel, /^Tendenz:/);
});

test('ohne belastbare Liegedauer ist der Umschlag nicht bewertbar', () => {
  assert.equal(automation.ownTurnoverClass(null, 10).label, 'NICHT BEWERTBAR');
});

test('Verkaufsanalyse erzeugt keinen scheinpräzisen 0-bis-100-Liquiditätsscore', () => {
  const row = analyze([sale()])[0];
  assert.equal(Object.hasOwn(row, 'liquidityScore'), false);
  assert.equal(Object.hasOwn(row, 'score'), false);
});

test('gleichnamige Karten mit unterschiedlichen Produkt-IDs bleiben printgenau getrennt', () => {
  const rows = analyze([
    sale({ productId: '100', orderId: 'a', setName: 'Set A', rarity: 'Rare' }),
    sale({ productId: '200', orderId: 'b', setName: 'Set B', rarity: 'Secret Rare' })
  ]);
  assert.equal(rows.length, 2);
  assert.deepEqual(new Set(rows.map(row => row.productId)), new Set(['100', '200']));
});

test('erster bestätigter Ziel-VK setzt aktuellen und historischen Ursprung', () => {
  const result = automation.planTargetSellChange({}, 9.99, '2026-08-15T10:00:00Z');
  assert.equal(result.originalTargetSell, 9.99);
  assert.equal(result.targetSell, 9.99);
  assert.equal(result.historyEntry.oldPrice, null);
  assert.equal(result.historyEntry.newPrice, 9.99);
});

test('spätere Ziel-VK-Änderung erhält den ursprünglichen Ziel-VK', () => {
  const result = automation.planTargetSellChange({ originalTargetSell: 9.99, targetSell: 9.99 }, 8.49, '2026-08-16T10:00:00Z');
  assert.equal(result.originalTargetSell, 9.99);
  assert.equal(result.targetSell, 8.49);
  assert.equal(result.historyEntry.oldPrice, 9.99);
  assert.equal(result.historyEntry.newPrice, 8.49);
});

test('unveränderter Ziel-VK erzeugt keinen künstlichen Historieneintrag', () => {
  assert.equal(automation.planTargetSellChange({ originalTargetSell: 5, targetSell: 5 }, 5).historyEntry, null);
});

test('fehlender Alt-Ziel-VK wird nicht rückwirkend erfunden', () => {
  const result = automation.planTargetSellChange({ originalTargetSell: null, targetSell: null }, null);
  assert.equal(result.originalTargetSell, null);
  assert.equal(result.targetSell, null);
});

test('Kartenpreis und Vollkosten-EK bleiben getrennte Sichten', () => {
  const result = automation.decisionCostBreakdown({ cardPrice: 1.75, fullCost: 1.94 });
  assert.equal(result.cardPrice, 1.75);
  assert.equal(result.fullCost, 1.94);
  assert.equal(result.decisionCost, null);
});

test('Warenkorbfüller ohne Versandanstieg benötigt explizit bestätigte Null-Grenzkosten', () => {
  const unknown = automation.decisionCostBreakdown({ cardPrice: 1.75, fullCost: 1.94, cartFiller: 'yes' });
  const known = automation.decisionCostBreakdown({ cardPrice: 1.75, fullCost: 1.94, cartFiller: 'yes', incrementalShippingCost: 0, incrementalDirectCost: 0 });
  assert.equal(unknown.decisionCost, null);
  assert.equal(known.decisionCost, 1.75);
});

test('Versandstufenanstieg erhöht ausschließlich den Entscheidungs-EK', () => {
  const result = automation.decisionCostBreakdown({ cardPrice: 1.75, fullCost: 1.94, cartFiller: 'yes', incrementalShippingCost: 1, incrementalDirectCost: 0 });
  assert.equal(result.decisionCost, 2.75);
  assert.equal(result.fullCost, 1.94);
});

test('zusätzliche direkte Kosten fließen in den Entscheidungs-EK ein', () => {
  const result = automation.decisionCostBreakdown({ cardPrice: 2, fullCost: 2.5, cartFiller: 'no', incrementalShippingCost: 1.2, incrementalDirectCost: 0.3 });
  assert.equal(result.decisionCost, 3.5);
});

test('unbekannte Grenzkosten bleiben als Entscheidungs-EK unbekannt', () => {
  const result = automation.decisionCostBreakdown({ cardPrice: 2, fullCost: 2.5, cartFiller: 'unknown', incrementalShippingCost: 0, incrementalDirectCost: 0 });
  assert.equal(result.status, 'unknown');
  assert.equal(result.decisionCost, null);
});

test('realisierter Gewinn bleibt vom Entscheidungs-EK unberührt und verwendet Vollkosten', () => {
  const withLowDecisionCost = analyze([sale({ fullCost: 8, unitProfit: 2, decisionCost: 4 })])[0];
  const withHighDecisionCost = analyze([sale({ fullCost: 8, unitProfit: 2, decisionCost: 12 })])[0];
  assert.equal(withLowDecisionCost.averageProfit, 2);
  assert.equal(withHighDecisionCost.averageProfit, 2);
  assert.equal(withLowDecisionCost.averageRoi, 25);
  assert.equal(withHighDecisionCost.averageRoi, 25);
});

test('Aging berücksichtigt einen belastbaren eigenen Median ohne vorschnelle Warnung', () => {
  const experience = analyze(Array.from({ length: 5 }, (_, index) => sale({ orderId: `m-${index}`, daysToSale: 45 })))[0];
  const result = automation.combineAgingWithOwnSales({ inventoryAgeDays: 35, recommendation: 'KAPITALBINDUNG PRÜFEN', factors: [] }, experience, 'STABIL');
  assert.equal(result.recommendation, 'BEOBACHTEN');
  assert.match(result.factors.at(-1), /Median 45 Tage/);
});

test('deutlich über eigenem Median und fallender Markt verschärfen Kapitalbindungshinweis', () => {
  const experience = analyze(Array.from({ length: 5 }, (_, index) => sale({ orderId: `f-${index}`, daysToSale: 14 })))[0];
  const result = automation.combineAgingWithOwnSales({ inventoryAgeDays: 70, recommendation: 'BEOBACHTEN', factors: [] }, experience, 'FALLEND');
  assert.equal(result.recommendation, 'KAPITALBINDUNG PRÜFEN');
});

test('Markttrend und eigene Umschlagklasse bleiben getrennte Aussagen', () => {
  const experience = analyze(Array.from({ length: 5 }, (_, index) => sale({ orderId: `s-${index}`, daysToSale: 10, unitProfit: 2, fullCost: 4 })))[0];
  assert.equal(experience.turnoverClass.label, 'SCHNELL');
  assert.equal(automation.ownSalesPurchaseHint(experience, 'STARK FALLEND'), 'WIEDERANKAUF NUR MIT VORSICHT');
  assert.equal(experience.marketTrend, undefined);
});

test('eigene Verkaufsanalyse führt niemals eine automatische Preisänderung aus', () => {
  const item = { listingPrice: 10 };
  const row = analyze([sale()])[0];
  assert.equal(row.priceAction, 'KEINE AUTOMATISCHE PREISÄNDERUNG');
  assert.equal(item.listingPrice, 10);
});

test('Schema 10 speichert neue Fakten und berechnet Verkaufserfahrung aus normalisierten Tabellen', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase4-db-'));
  const database = new TcgDatabase({ databasePath: path.join(root, 'data.sqlite'), schemaPath, backupRoot: path.join(root, 'backups') }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  database.upsertProducts([{ productId: '100', germanName: 'Testkarte', englishName: 'Test Card', setName: 'Test Set', rarity: 'Ultra Rare' }]);
  const inventory = Array.from({ length: 5 }, (_, index) => ({
    id: `asset-${index}`, purchaseId: 'buy-1', purchaseLineKey: 'buy-1:line-1', saleId: `sale-${index}`,
    productId: '100', name: 'Testkarte', cost: 5, costStatus: 'known', purchaseDate: `2026-07-0${index + 1}`,
    status: 'Verkauft', originalTargetSell: 9, targetSell: 8.5,
    listingHistory: [{ id: `first-${index}`, eventType: 'first_listing', changedAt: `2026-07-0${index + 1}`, oldPrice: null, newPrice: 9, changeMode: 'manual' }]
  }));
  const state = {
    settings: { feePercent: 0, packaging: 0 }, privateCollection: [], reconciliations: [], capitalAccounts: [], capitalEntries: [],
    purchases: [{ id: 'buy-1', orderNo: 'BUY', date: '2026-07-01', status: 'Eingetroffen', cardValue: 25, shipping: 0, extra: 0, pendingItems: [{ receiptLineKey: 'line-1', productId: '100', name: 'Testkarte', quantity: 5, unitPrice: 5, receivedBusiness: 5, materializedBusiness: 5, cartFillerStatus: 'yes', incrementalShippingCost: 0, incrementalDirectCost: 0, decisionCostStatus: 'known', confirmedTargetSellPrice: 9 }] }],
    sales: inventory.map((asset, index) => ({ id: `sale-${index}`, orderNo: `S-${index}`, date: `2026-08-0${index + 1}`, status: 'Abgeschlossen', cardValue: 10, revenue: 10, fee: 0, postage: 0, packaging: 0, itemIds: [asset.id], items: [{ productId: '100', name: 'Testkarte', quantity: 1, unitPrice: 10, matchedItemIds: [asset.id] }] })),
    inventory
  };
  database.saveState(state);
  assert.equal(database.getStatus().schemaVersion, CURRENT_SCHEMA_VERSION);
  const receipt = database.db.prepare('SELECT cart_filler_status, incremental_shipping_cost, decision_cost_status, confirmed_target_sell_price FROM purchase_receipt_lines WHERE archived=0').get();
  assert.deepEqual({ ...receipt }, { cart_filler_status: 'yes', incremental_shipping_cost: 0, decision_cost_status: 'known', confirmed_target_sell_price: 9 });
  const storedAsset = database.db.prepare('SELECT original_target_sell, current_target_sell FROM inventory_assets WHERE inventory_id=?').get('asset-0');
  assert.deepEqual({ ...storedAsset }, { original_target_sell: 9, current_target_sell: 8.5 });
  const result = database.getOwnSalesExperience({ productIds: ['100'], asOf: '2026-08-15' });
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].saleCount, 5);
  assert.equal(result.records[0].dataQuality.sufficient, true);
  assert.equal(result.summary.withKnownCost, 5);
});

test('Schema-10-Migration lässt fehlende Ziel- und Entscheidungsdaten NULL beziehungsweise unbekannt', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase4-migration-'));
  const databasePath = path.join(root, 'data.sqlite');
  const backupRoot = path.join(root, 'backups');
  let database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  t.after(() => { database.close(); fs.rmSync(root, { recursive: true, force: true }); });
  database.saveState({ settings: {}, purchases: [{ id: 'legacy-buy', pendingItems: [{ name: 'Altkarte', quantity: 1 }] }], sales: [], inventory: [{ id: 'legacy-asset', name: 'Altkarte' }], privateCollection: [] });
  database.db.exec('DELETE FROM schema_version;');
  database.db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (9, ?)').run('2026-08-01');
  database.close();
  database = new TcgDatabase({ databasePath, schemaPath, backupRoot }).open();
  const state = database.loadState().state;
  assert.equal(state.inventory[0].targetSell, null);
  assert.equal(state.purchases[0].pendingItems[0].cartFillerStatus, 'unknown');
  assert.equal(state.purchases[0].pendingItems[0].incrementalShippingCost, null);
  assert.equal(state.purchases[0].pendingItems[0].confirmedTargetSellPrice, null);
});
