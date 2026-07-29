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
  assert.equal(issues.find(issue => issue.category === 'Duplikat').searchTerm, '42');
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
    inventory: [
      { productId:'123', name: 'Verlustkarte', listed: true, listingPrice: 4, cost: 5, status: 'Im Bestand', purchaseDate: '2026-07-20' },
      { productId:'123', name: 'Verlustkarte', listed: true, listingPrice: 4, cost: 5, status: 'Im Bestand', purchaseDate: '2026-07-20' }
    ],
    watchlist: [{ productId:'456', name: 'Fallende Karte', trend: 8, avg30: 10 }]
  }, new Date('2026-07-22'));

  assert.ok(alerts.some(alert => alert.type === 'Verlustpreis'));
  assert.ok(alerts.some(alert => alert.type === 'Preisrückgang'));
  assert.equal(alerts.find(alert=>alert.type==='Verlustpreis').searchTerm,'123');
  assert.equal(alerts.filter(alert=>alert.type==='Verlustpreis').length,1);
  assert.equal(alerts.find(alert=>alert.type==='Preisrückgang').searchTerm,'456');
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

test('teilt einen Wareneingang dauerhaft in Geschäftsbestand und Privatsammlung mit echten Stückkosten auf', () => {
  const purchase = {
    cardValue: 30, shipping: 3, extra: 0, refund: 0,
    pendingItems: [{ receiptLineKey: 'line-1', productId: '123', name: 'Testkarte', quantity: 3, unitPrice: 10 }]
  };
  const plan = automation.planPurchaseReceipt(purchase, [{ key: 'line-1', business: 2, private: 1 }], 'value');
  assert.equal(plan.valid, true);
  assert.equal(plan.status, 'Eingetroffen');
  assert.equal(plan.lines[0].unitCost, 11);
  assert.deepEqual(plan.totals, { business: 2, private: 1, damaged: 0, cancelled: 0, open: 0, addBusiness: 2, addPrivate: 1, addDamaged: 0 });

  purchase.pendingItems[0].receivedBusiness = 2;
  purchase.pendingItems[0].receivedPrivate = 1;
  purchase.pendingItems[0].materializedBusiness = 2;
  purchase.pendingItems[0].materializedPrivate = 1;
  assert.deepEqual(automation.purchaseOwnershipTotals(purchase), { business: 22, private: 11, damaged: 0, cancelled: 0, open: 0, total: 33 });
  assert.equal(automation.planPurchaseReceipt(purchase, [{ key: 'line-1', business: 1, private: 1 }]).valid, false);
});

test('ordnet Verkäufen standardmäßig das älteste exakt passende Einkaufsexemplar zu', () => {
  const inventory = [
    { id: 'new', productId: '42', purchaseDate: '2026-07-20', language: 'DE', condition: 'NM', status: 'Im Bestand' },
    { id: 'old-en', productId: '42', purchaseDate: '2026-07-01', language: 'EN', condition: 'NM', status: 'Im Bestand' },
    { id: 'old-de', productId: '42', purchaseDate: '2026-07-02', language: 'DE', condition: 'NM', status: 'Im Bestand' },
    { id: 'reserved', productId: '42', purchaseDate: '2026-06-01', language: 'DE', condition: 'NM', status: 'Reserviert' }
  ];
  const result = automation.selectInventoryForSale(inventory, { productId: '42', language: 'DE', condition: 'NM' }, 2);
  assert.deepEqual(result.selected.map(row => row.id), ['old-de', 'new']);
  assert.equal(result.missing, 0);
});

test('zieht Erstattungen vom realisierten Verkaufsgewinn ab und sperrt laufende Rückgaben', () => {
  const result = automation.calculateSaleProfit({ revenue: 20, refund: 5, fee: 1, postage: 1, cost: 7, packaging: 1 });
  assert.equal(result.netRevenue, 15);
  assert.equal(result.profit, 5);
  const buckets = automation.calculateInventoryBuckets([{ id: 'return', status: 'Rückgabe unterwegs' }]);
  assert.deepEqual({ total: buckets.total, available: buckets.available, unavailable: buckets.unavailable }, { total: 1, available: 0, unavailable: 1 });
  const returned = automation.calculateSaleProfit({ status:'Rückgabe eingetroffen', revenue:20, refund:20, fee:1, postage:1, cost:7 });
  assert.equal(returned.cost, 0, 'Nach physischem Rücklauf bleibt der Karten-EK im Bestand und wird nicht als Verkaufskosten verbraucht');
  assert.equal(returned.profit, -2);
});

test('trennt Cashflow, realisierten Verkaufsgewinn und allgemeine Betriebsausgaben', () => {
  const state = {
    settings:{feePercent:5,packaging:0.1},
    purchases:[{
      id:'buy-1',orderNo:'BUY-1',date:'2026-07-02',status:'Eingetroffen',cardValue:10,shipping:2,extra:0,refund:0,
      pendingItems:[{quantity:2,unitPrice:5,receivedBusiness:1,receivedPrivate:1}]
    }],
    sales:[{
      id:'sale-1',orderNo:'SALE-1',date:'2026-07-10',completedDate:'2026-07-12',status:'Abgeschlossen',
      revenue:12,cardValue:10,shippingPaid:2,fee:0.5,postage:1,refund:0,cost:6,quantity:1,
      materialUsage:[{quantity:1,unitCost:0.2}]
    }],
    expenses:[
      {id:'material-1',date:'2026-07-03',category:'Versandmaterial',amount:20,description:'100 Umschläge'},
      {id:'shelf-1',date:'2026-07-04',category:'Bürobedarf',amount:50,description:'Lagerregal'},
      {id:'direct-1',date:'2026-07-12',category:'Sonstiges',costType:'direct',saleId:'sale-1',amount:1,description:'Direkte Verkaufskosten'}
    ]
  };
  const summary = automation.buildFinancialSummary(state,{from:'2026-07-01',to:'2026-07-31'});
  assert.equal(summary.byCategory.card_purchase.cashOut,6,'nur der geschäftliche Anteil des gemischten Einkaufs zählt');
  assert.equal(summary.cashIn,12);
  assert.equal(summary.cashOut,78.5);
  assert.equal(summary.cashflow,-66.5);
  assert.equal(summary.realizedProfit,3.3);
  assert.equal(summary.overhead,50,'Materialeinkauf ist Geldabfluss, aber kein zusätzlicher Kartenaufwand');
  assert.equal(summary.operatingResult,-46.7);
});

test('behandelt historisch unbekannten Wareneinsatz ehrlich und schließt ihn aus Lern- und Gewinnwerten aus', () => {
  const unknownSale = {
    id:'sale-unknown',orderNo:'OLD-1',date:'2026-07-01',completedDate:'2026-07-02',status:'Abgeschlossen',
    revenue:10,cardValue:10,quantity:1,cost:0,fee:0.5,postage:1,packaging:0.1,
    historicalCostStatus:'unknown',historicalCostNote:'Alter Beleg nicht mehr vorhanden',
    items:[{productId:'42',name:'Testkarte',set:'SET',quantity:1,unitPrice:10}]
  };
  const calculation=automation.calculateSaleProfit(unknownSale,{});
  assert.equal(calculation.costKnown,false);
  assert.equal(calculation.profitKnown,false);
  assert.equal(calculation.quality,'unknown');

  const state={settings:{},purchases:[],inventory:[],expenses:[],sales:[unknownSale],sync:{lastPriceUpdate:'2026-07-02'},reconciliations:[]};
  const summary=automation.buildFinancialSummary(state);
  assert.equal(summary.cashIn,10,'der tatsächliche Geldeingang bleibt erhalten');
  assert.equal(summary.realizedProfit,0,'ein unbekannter EK erzeugt keinen erfundenen Gewinn');
  assert.equal(summary.entries.find(row=>row.category==='realized_sale').excludedFromProfit,true);
  assert.equal(automation.buildPerformanceReport(state).cards.length,0,'unbekannte Kosten trainieren keine Kartenempfehlung');
  assert.ok(!automation.buildDataQualityIssues(state,new Date('2026-07-02')).some(issue=>issue.recordId==='sale-unknown'),'bewusst bestätigte Unbekannt-Angabe gilt als bearbeitet');
});

test('akzeptiert manuell bestätigten historischen Wareneinsatz und liefert eine direkte Reparaturaktion', () => {
  const unresolved={id:'sale-open',orderNo:'OLD-2',status:'Abgeschlossen',revenue:8,quantity:1,cost:0,items:[{productId:'77',name:'Karte',quantity:1,unitPrice:8}]};
  const issues=automation.buildDataQualityIssues({sales:[unresolved],purchases:[],inventory:[],sync:{lastPriceUpdate:'2026-07-22'},reconciliations:[]},new Date('2026-07-22'));
  assert.ok(issues.some(issue=>issue.action==='repairSaleCost'&&issue.recordId==='sale-open'));

  const confirmed={...unresolved,cost:3,historicalCostStatus:'confirmed'};
  const calculation=automation.calculateSaleProfit(confirmed,{feePercent:5,packaging:0});
  assert.equal(calculation.costKnown,true);
  assert.equal(calculation.profitKnown,true);
  assert.equal(calculation.sourceQuality.cost,'manual');
  assert.ok(!automation.buildDataQualityIssues({sales:[confirmed],purchases:[],inventory:[],sync:{lastPriceUpdate:'2026-07-22'},reconciliations:[]},new Date('2026-07-22')).some(issue=>issue.recordId==='sale-open'));
});

test('bereinigt addierte alte Cardmarket-Vollsnapshots, ohne geschützte oder manuelle Exemplare zu löschen', () => {
  const rows = [
    { id:'old', productId:'42', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-16.csv' },
    { id:'new', productId:'42', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-20.csv' },
    { id:'manual', productId:'77', language:'DE', condition:'NM', status:'Im Bestand', purchaseId:'purchase-1' },
    { id:'old-with-purchase', productId:'77', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-16.csv' },
    { id:'new-with-purchase', productId:'77', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-20.csv' },
    { id:'reserved-old', productId:'99', language:'DE', condition:'NM', status:'Reserviert', saleId:'sale-1', lotId:'STOCK-cardmarket-stock-2026-07-16.csv' },
    { id:'free-new', productId:'99', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-20.csv' },
    { id:'single-source', productId:'100', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-16.csv' },
    { id:'unknown-old', productId:'', name:'Unbekannt A', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-16.csv' },
    { id:'unknown-new', productId:'', name:'Unbekannt B', language:'DE', condition:'NM', status:'Im Bestand', lotId:'STOCK-cardmarket-stock-2026-07-20.csv' }
  ];
  const plan = automation.planLegacyStockSnapshotCleanup(rows);
  assert.deepEqual(new Set(plan.removeIds), new Set(['old','old-with-purchase','new-with-purchase','free-new']));
  assert.equal(plan.removedCount, 4);
  assert.ok(!plan.removeIds.includes('manual'));
  assert.ok(!plan.removeIds.includes('reserved-old'));
  assert.ok(!plan.removeIds.includes('single-source'));
  assert.ok(!plan.removeIds.includes('unknown-old'));
  assert.ok(!plan.removeIds.includes('unknown-new'));
});

test('storniert manuelle Bestandsbewegungen nur mit freien Karten und immer als Gegenbuchung', () => {
  const items = [
    { id:'added', status:'Im Bestand', purchaseDate:'2026-07-22' },
    { id:'reserved', status:'Reserviert' }
  ];
  const positive = automation.planInventoryMovementReversal(items,{id:'move-1',type:'Bestandskorrektur',quantity:1,addedIds:['added']});
  assert.equal(positive.valid,true);
  assert.deepEqual(positive.removeIds,['added']);
  const negative = automation.planInventoryMovementReversal(items,{id:'move-2',type:'Bestandskorrektur',quantity:-2});
  assert.deepEqual({valid:negative.valid,addCount:negative.addCount},{valid:true,addCount:2});
  const blocked = automation.planInventoryMovementReversal([{id:'reserved',status:'Reserviert'}],{id:'move-3',type:'Bestandskorrektur',quantity:1});
  assert.equal(blocked.valid,false);
  assert.match(blocked.reason,/Reservierte oder verkaufte Karten/);
  assert.equal(automation.planInventoryMovementReversal(items,{id:'move-4',type:'Cardmarket-Bestandsabgleich',quantity:1}).valid,false);
});

test('VK-Vorschläge bleiben am Markt und warnen, wenn der Ziel-ROI dort nicht erreichbar ist', () => {
  const settings={feePercent:5,packaging:0.20,minRoi:25,targetRoi:30,safetyPercent:5};
  const result=automation.calculateOwnedCardPriceTargets({low:2,trend:2.2,avg7:2.1,avg30:2,cost:5},settings);
  assert.ok(result.priceFloor>result.marketSell);
  assert.equal(result.suggestedSell,result.marketSell);
  assert.equal(result.suggestedSell,2.13);
  assert.equal(result.profitableAtMarket,false);
  assert.ok(result.expectedProfit<0);
});

test('günstige Karten erhalten keinen künstlichen VK durch einen festen Mindestgewinn', () => {
  const result=automation.calculateOwnedCardPriceTargets(
    {low:0.02,trend:0.44,avg1:0.38,avg7:0.40,avg30:0.41,cost:0.337649},
    {feePercent:5,packaging:0.04,minRoi:25,targetRoi:30,safetyPercent:5,minProfit:0.75}
  );
  assert.equal(result.suggestedSell,0.42);
  assert.equal(result.targetRoiPrice,0.51);
  assert.equal(result.profitableAtMarket,false);
});

test('verteilt Verpackung aus echten Bestellungen auf die tatsächlich verkauften Karten', () => {
  const allocation=automation.estimatePackagingPerCard({sales:[
    {status:'Abgeschlossen',quantity:4,materialUsage:[{quantity:1,unitCost:0.12}]},
    {status:'Versendet',quantity:2,packaging:0.18}
  ]},{packaging:0.12,expectedCardsPerOrder:3});
  assert.equal(allocation.perCard,0.05);
  assert.equal(allocation.averageCardsPerOrder,3);
  assert.equal(allocation.source,'actual');
});

test('schätzt fehlendes Versandmaterial bei einem Verkauf einmal pro Bestellung', () => {
  const result=automation.calculateSaleProfit({revenue:10,quantity:4,cost:2,historicalCostStatus:'confirmed'},{feePercent:5,packaging:0.12});
  assert.equal(result.packaging,0.12);
});

test('Wareneingang übernimmt Inseratwunsch und verlangt dafür einen positiven Preis', () => {
  const purchase={cardValue:4,shipping:1,pendingItems:[{receiptLineKey:'line',name:'Testkarte',quantity:2,unitPrice:2}]};
  const valid=automation.planPurchaseReceipt(purchase,[{key:'line',business:2,listBusiness:true,listingPrice:4.5,suggestedSell:4.5}]);
  assert.equal(valid.valid,true);
  assert.equal(valid.lines[0].listBusiness,true);
  assert.equal(valid.lines[0].listingPrice,4.5);
  const invalid=automation.planPurchaseReceipt(purchase,[{key:'line',business:2,listBusiness:true,listingPrice:0}]);
  assert.equal(invalid.valid,false);
  assert.match(invalid.errors.join(' '),/Inseratspreis/);
});

test('Cardmarket-Snapshot-Identität bleibt bei einer Preisänderung stabil', () => {
  const first=automation.stockSnapshotIdentity({articleId:'12345',productId:'999',language:'DE',condition:'NM',listingPrice:1});
  const changed=automation.stockSnapshotIdentity({articleId:'12345',productId:'999',language:'DE',condition:'NM',listingPrice:9});
  assert.equal(first,'article:12345');
  assert.equal(changed,first);
  assert.equal(
    automation.stockSnapshotIdentity({productId:'999',language:'DE',condition:'NM',edition:'1st'}),
    'variant-v2:999|DE|NM|1ST'
  );
});

test('Verkaufszuordnung unterstützt FIFO sowie niedrigsten und höchsten EK', () => {
  const inventory=[
    {id:'old',productId:'1',status:'Im Bestand',purchaseDate:'2026-01-01',cost:2},
    {id:'cheap',productId:'1',status:'Im Bestand',purchaseDate:'2026-02-01',cost:1},
    {id:'expensive',productId:'1',status:'Im Bestand',purchaseDate:'2026-03-01',cost:4}
  ];
  assert.equal(automation.selectInventoryForSale(inventory,{productId:'1',strategy:'fifo'},1).selected[0].id,'old');
  assert.equal(automation.selectInventoryForSale(inventory,{productId:'1',strategy:'lowest-cost'},1).selected[0].id,'cheap');
  assert.equal(automation.selectInventoryForSale(inventory,{productId:'1',strategy:'highest-cost'},1).selected[0].id,'expensive');
});

test('Warenkorbanalyse trennt private Karten und verteilt Nebenkosten', () => {
  const result=automation.analyzePurchaseDraft([
    {id:'a',quantity:2,privateQuantity:1,unitPrice:1,low:3,trend:3,avg7:3,avg30:3},
    {id:'b',quantity:1,unitPrice:2,low:4,trend:4,avg7:4,avg30:4}
  ],{shipping:2,extra:0},{feePercent:5,packaging:0.04,minRoi:25,targetRoi:30,safetyPercent:5});
  assert.equal(result.totals.cards,3);
  assert.equal(result.totals.businessCards,2);
  assert.equal(result.totals.privateCards,1);
  assert.equal(result.totals.paid,6);
  assert.equal(result.lines[0].landedUnitCost,1.5);
  assert.equal(result.lines[1].landedUnitCost,3);
  const withoutMarket=automation.analyzePurchaseDraft([{quantity:1,unitPrice:1}],{}, {feePercent:5,packaging:0.04,minRoi:25,targetRoi:30});
  assert.equal(withoutMarket.lines[0].pricing.suggestedSell,0);
  assert.equal(withoutMarket.lines[0].recommendation,'Beobachten');
});

test('Einkaufsleistung trennt realisierten Gewinn und gebundenes Kapital', () => {
  const result=automation.summarizePurchasePerformance({id:'p'},[
    {id:'sold',purchaseId:'p',status:'Verkauft',saleId:'s',cost:1},
    {id:'rest',purchaseId:'p',status:'Im Bestand',cost:2,marketValue:3}
  ],[{id:'s',quantity:1,items:[{unitPrice:2.5,matchedItemIds:['sold']}]}]);
  assert.equal(result.sold,1);
  assert.equal(result.realizedProfit,1.5);
  assert.equal(result.tiedCapital,2);
  assert.equal(result.currentMarketValue,3);
  assert.equal(result.projectedTotalProfit,2.5);
});

test('Nachfrage-Radar bewertet Häufigkeit, Eigenverkäufe, Bestand und Risiko', () => {
  const rows=automation.scoreDemandRadar([
    {productId:'1',name:'Staple',appearances:8,tournaments:10,copies:3},
    {productId:'2',name:'Riskant',appearances:10,tournaments:10,copies:3,risk:'high reprint'}
  ],{stockByProduct:{1:0,2:0},salesByProduct:{1:2,2:0}});
  assert.equal(rows[0].name,'Staple');
  assert.equal(rows[0].recommendation,'Stark kaufen');
  assert.equal(rows.find(row=>row.name==='Riskant').recommendation,'Hohes Risiko');
});
