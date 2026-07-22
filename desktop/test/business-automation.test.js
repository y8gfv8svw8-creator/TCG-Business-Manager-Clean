const test = require('node:test');
const assert = require('node:assert/strict');

const automation = require('../app/shared/business-automation');

test('erkennt Bestände, Einkäufe und Cardmarket-Abrechnungen ohne Dateinamen-Tricks', () => {
  assert.equal(automation.detectCsvImportType('bestand.csv', ['ArticleID', 'Price_EUR', 'Amount']), 'inventory');
  assert.equal(automation.detectCsvImportType('einkauf.csv', ['groupCount', 'price', 'idProduct']), 'purchase');
  assert.equal(automation.detectCsvImportType('export.csv', ['Datum', 'Bestellnummer', 'Betrag', 'Beschreibung']), 'settlement');
});

test('gleicht Cardmarket-Buchungen über die Bestellnummer mit erwarteten Nettoauszahlungen ab', () => {
  const result = automation.reconcileSettlementRows([
    { Datum: '2026-07-20', Bestellnummer: '123456789', Betrag: '10,45 €', Beschreibung: 'Auszahlung' },
    { Datum: '2026-07-21', Bestellnummer: '999999999', Betrag: '3,00 €', Beschreibung: 'Unbekannt' }
  ], {
    settings: { feePercent: 5 },
    sales: [{ id: 'sale-1', orderNo: '123456789', revenue: 11, cardValue: 11, status: 'Abgeschlossen' }]
  });

  assert.equal(result.matched, 1);
  assert.equal(result.unmatched, 1);
  assert.equal(result.entries[0].matchedSaleId, 'sale-1');
  assert.ok(Math.abs(result.entries[0].difference) < 0.0001);
});

test('meldet Duplikate, fehlende Produkt-IDs und veraltete Marktpreise', () => {
  const issues = automation.buildDataQualityIssues({
    purchases: [{ orderNo: '42' }, { orderNo: '42' }],
    sales: [],
    inventory: [{ name: 'Karte ohne ID' }],
    sync: { lastPriceUpdate: '2026-07-01T12:00:00.000Z' },
    reconciliations: []
  }, new Date('2026-07-22T12:00:00.000Z'));

  assert.ok(issues.some(issue => issue.category === 'Duplikat'));
  assert.ok(issues.some(issue => issue.category === 'Kartenzuordnung'));
  assert.ok(issues.some(issue => issue.category === 'Marktdaten'));
});

test('verteilt Gewinn aus detaillierten Verkäufen auf Karten und Sets', () => {
  const report = automation.buildPerformanceReport({
    settings: { feePercent: 5, packaging: 0 },
    purchases: [], inventory: [],
    sales: [{
      id: 'sale', status: 'Abgeschlossen', customer: 'Kunde', revenue: 30,
      cardValue: 30, cost: 10, quantity: 3, postage: 2,
      items: [
        { name: 'Karte A', set: 'SET1', quantity: 1, unitPrice: 10 },
        { name: 'Karte B', set: 'SET2', quantity: 2, unitPrice: 10 }
      ]
    }]
  });

  assert.equal(report.cards.length, 2);
  assert.equal(report.sets.length, 2);
  assert.ok(Math.abs(report.cards.reduce((sum, row) => sum + row.profit, 0) - 16.5) < 0.0001);
});

test('warnt vor Inseraten unter Einstand und fallenden Watchlist-Preisen', () => {
  const alerts = automation.buildPriceAlerts({
    settings: { priceAgeDays: 7 },
    inventory: [{ name: 'Verlustkarte', listed: true, listingPrice: 4, cost: 5, status: 'Im Bestand', purchaseDate: '2026-07-20' }],
    watchlist: [{ name: 'Fallende Karte', trend: 8, avg30: 10 }]
  }, new Date('2026-07-22'));

  assert.ok(alerts.some(alert => alert.type === 'Verlustpreis'));
  assert.ok(alerts.some(alert => alert.type === 'Preisrückgang'));
});

test('berechnet automatische Max-EK- und Ziel-VK-Werte mit einheitlicher Rundung', () => {
  const settings = { safetyPercent: 5, feePercent: 5, packaging: 0.20, minProfit: 1, minRoi: 30 };
  const first = automation.calculateAutomaticPriceTargets({ low: 8, trend: 10, avg7: 9, avg30: 8 }, settings);
  const updated = automation.calculateAutomaticPriceTargets({ low: 8, trend: 12, avg7: 10, avg30: 9 }, settings);

  assert.equal(first.recommendedSell, 9.25);
  assert.equal(first.maxBuy, 6.26);
  assert.ok(updated.recommendedSell > first.recommendedSell);
  assert.ok(updated.maxBuy > first.maxBuy);
});

test('plant Materialverbrauch, Entfernen und Bestandsrückbuchung ohne negative Bestände', () => {
  const materials = [
    { id: 'sleeve', name: 'Sleeve', unit: 'Stück', stock: 5 },
    { id: 'letter', name: 'Umschlag', unit: 'Stück', stock: 1 }
  ];
  const removal = automation.planMaterialUsageChanges(materials, [{ materialId: 'sleeve', quantity: 3 }], [{ materialId: 'sleeve', quantity: 1 }]);
  assert.equal(removal.valid, true);
  assert.deepEqual(removal.changes[0], { materialId: 'sleeve', quantity: 2, stockBefore: 5, stockAfter: 7 });

  const shortage = automation.planMaterialUsageChanges(materials, [], [{ materialId: 'letter', quantity: 2 }]);
  assert.equal(shortage.valid, false);
  assert.equal(shortage.shortages[0].missing, 1);
  assert.equal(materials[1].stock, 1);
});

test('Reservierungen verschieben Bestand von verfügbar nach reserviert, ohne den Gesamtbestand zu erhöhen', () => {
  const rows = [
    { id: 'free', status: 'Im Bestand' },
    { id: 'reserved', status: 'Reserviert' },
    { id: 'sold', status: 'Verkauft' }
  ];
  const buckets = automation.calculateInventoryBuckets(rows);
  assert.deepEqual(
    { total: buckets.total, available: buckets.available, reserved: buckets.reserved, sold: buckets.sold },
    { total: 2, available: 1, reserved: 1, sold: 1 }
  );
});

test('manuelle Bestandskorrekturen entfernen niemals reservierte oder bereits verkaufte Exemplare', () => {
  const rows = [
    { id: 'free-1', status: 'Im Bestand' },
    { id: 'free-2', status: 'Im Bestand' },
    { id: 'reserved', status: 'Reserviert' },
    { id: 'sold', status: 'Verkauft' }
  ];
  const plan = automation.planInventoryTotalCorrection(rows, 2);
  assert.equal(plan.valid, true);
  assert.equal(plan.addCount, 0);
  assert.deepEqual(plan.removeIds, ['free-1']);
  assert.equal(automation.planInventoryTotalCorrection(rows, 0).valid, false);
});

test('ein Cardmarket-Bestandssnapshot gleicht nur verfügbare Exemplare ab', () => {
  const rows = [
    { id: 'free-1', status: 'Im Bestand' },
    { id: 'free-2', status: 'Im Bestand' },
    { id: 'reserved', status: 'Reserviert' },
    { id: 'sold', status: 'Verkauft' }
  ];
  const plan = automation.planAvailableInventorySnapshot(rows, 1);
  assert.equal(plan.delta, -1);
  assert.deepEqual(plan.removeIds, ['free-1']);
  assert.equal(plan.buckets.reserved, 1);
  assert.equal(plan.buckets.sold, 1);
});
