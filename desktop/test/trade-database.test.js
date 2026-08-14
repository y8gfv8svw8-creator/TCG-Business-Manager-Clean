const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { TcgDatabase } = require('../app/main/database');
const { CARDMARKET_API_BASE_URL, CardmarketApiAdapter, normalizeOrder } = require('../app/main/cardmarket-api-adapter');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function temporaryDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-trade-database-'));
  const databasePath = path.join(root, 'data.sqlite');
  const database = new TcgDatabase({databasePath, schemaPath, backupRoot:path.join(root, 'backups')}).open();
  t.after(() => {
    database.close();
    fs.rmSync(root, {recursive:true, force:true});
  });
  return {database, databasePath};
}

function sampleState() {
  return {
    settings:{feePercent:5, packaging:0.2, minProfit:2, minRoi:20, safetyPercent:5},
    purchases:[{
      id:'purchase-1', orderNo:'CM-BUY-1', date:'2026-07-01', seller:'Seller', status:'Eingetroffen',
      cardValue:16, shipping:2, extra:0, source:'Cardmarket CSV',
      pendingItems:[{articleId:'buy-article-1', productId:'123456', name:'Testkarte', quantity:2, unitPrice:8}]
    }],
    sales:[{
      id:'sale-1', orderNo:'CM-SALE-1', date:'2026-07-10', customer:'Buyer', status:'Abgeschlossen',
      cardValue:15, revenue:15, fee:0.75, postage:0, packaging:0.2, cost:9,
      items:[{articleId:'sale-article-1', productId:'123456', name:'Testkarte', quantity:1, unitPrice:15}]
    }],
    inventory:[{
      id:'inventory-1', purchaseId:'purchase-1', saleId:'sale-1', productId:'123456',
      name:'Testkarte', cost:9, status:'Verkauft', purchaseDate:'2026-07-01', saleDate:'2026-07-10'
    }]
  };
}

test('protokolliert Handelsänderungen append-only und normalisiert Käufe und Verkäufe', t => {
  const {database} = temporaryDatabase(t);
  database.upsertProducts([{
    productId:'123456', metacardId:'99', germanName:'Testkarte', englishName:'Test Card',
    setName:'Test Set', rarity:'Ultra Rare'
  }]);
  const state = sampleState();
  const first = database.saveState(state);
  assert.equal(first.tradeDatabase.orderCount, 2);
  assert.equal(first.tradeDatabase.tradeLineCount, 2);
  assert.equal(first.tradeDatabase.eventCount, 3);

  database.saveState(structuredClone(state));
  assert.equal(database.getTradeDatabaseStatus().eventCount, 3, 'Unverändertes Speichern erzeugt kein Ereignis');

  database.upsertMarketPrices({
    snapshotDate:'2026-07-18',
    rows:[{productId:'123456', date:'2026-07-18', low:2, trend:2.2, avg7:2.1, avg30:2}]
  });
  database.upsertMarketPrices({
    snapshotDate:'2026-07-19',
    rows:[{productId:'123456', date:'2026-07-19', low:2.1, trend:2.3, avg7:2.2, avg30:2.1}]
  });
  database.upsertMarketPrices({
    snapshotDate:'2026-07-19', sourceId:'cardmarket_api',
    rows:[{productId:'123456', date:'2026-07-19', sourceId:'cardmarket_api', sourceRecordKey:'offer-summary|123456|2026-07-19', low:2, trend:2.2}]
  });
  assert.equal(database.getTradeDatabaseStatus().marketObservationCount, 3, 'Quellen am selben Tag bleiben getrennt');

  const recommendation = database.getTradeRecommendations({productIds:['123456']}).recommendations[0];
  assert.equal(recommendation.ownBuyAverage, 9);
  assert.equal(recommendation.ownSellAverage, 15);
  assert.equal(recommendation.buySampleCount, 1, 'Nur tatsächlich in den Geschäftsbestand übernommene Exemplare zählen als eigener EK');
  assert.equal(recommendation.sellSampleCount, 1);
  assert.equal(recommendation.recommendedBuy, 0, 'Der konfigurierte Mindestgewinn begrenzt den Max-EK');
  assert.equal(recommendation.recommendedSell, 2, 'SQLite nutzt dieselbe kurzfristige Marktreferenz wie Bestand und Datencenter');
  assert.ok(recommendation.recommendedSell < recommendation.priceFloor, 'Der Markt-VK wird nicht auf den ROI-Zielpreis angehoben');
  assert.equal(recommendation.profitableAtMarket, false);
  assert.equal(recommendation.modelVersion, 'v4-short-term-market');

  const changed = structuredClone(state);
  changed.purchases[0].shipping = 4;
  database.saveState(changed);
  const update = database.getBusinessEvents({entityType:'purchase', entityId:'purchase-1', limit:1})[0];
  assert.equal(update.eventType, 'update');
  assert.deepEqual(update.changedFields, ['shipping']);
  assert.equal(database.getTradeRecommendations({productIds:['123456']}).recommendations[0].ownBuyAverage, 10);

  changed.settings.minProfit = 3;
  database.saveState(changed);
  const settingUpdate = database.getBusinessEvents({entityType:'settings', entityId:'global', limit:1})[0];
  assert.equal(settingUpdate.eventType, 'update');
  assert.deepEqual(settingUpdate.changedFields, ['minProfit']);

  changed.sales = [];
  database.saveState(changed);
  const deletion = database.getBusinessEvents({entityType:'sale', entityId:'sale-1', limit:1})[0];
  assert.equal(deletion.eventType, 'delete');
  assert.equal(database.getTradeDatabaseStatus().orderCount, 1);
});

test('nimmt Verkäufe mit unbekanntem historischem Einstand nicht in SQLite-Preislernwerte auf', t => {
  const {database}=temporaryDatabase(t);
  database.upsertProducts([{productId:'123456',germanName:'Testkarte',setName:'Test Set',rarity:'Ultra Rare'}]);
  const state=sampleState();
  state.inventory=[];
  state.sales=[{
    id:'sale-unknown',orderNo:'OLD-UNKNOWN',date:'2026-07-10',customer:'Buyer',status:'Abgeschlossen',
    revenue:30,cardValue:30,cost:0,historicalCostStatus:'unknown',excludeCostFromLearning:true,
    items:[{productId:'123456',name:'Testkarte',quantity:1,unitPrice:30}]
  }];
  database.saveState(state);
  const unknownOnly=database.getTradeRecommendations({productIds:['123456']}).recommendations[0];
  assert.equal(unknownOnly.sellSampleCount,0);
  assert.equal(unknownOnly.ownSellAverage,0);

  state.sales.push({
    id:'sale-confirmed',orderNo:'OLD-CONFIRMED',date:'2026-07-11',customer:'Buyer',status:'Abgeschlossen',
    revenue:15,cardValue:15,cost:9,historicalCostStatus:'confirmed',
    items:[{productId:'123456',name:'Testkarte',quantity:1,unitPrice:15,cost:9}]
  });
  database.saveState(state);
  const withConfirmed=database.getTradeRecommendations({productIds:['123456']}).recommendations[0];
  assert.equal(withConfirmed.sellSampleCount,1);
  assert.equal(withConfirmed.ownSellAverage,15);
});

test('migriert vorhandenen Programmstand und Marktpreise mit Sicherung in das aktuelle Schema', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-trade-migration-'));
  const databasePath = path.join(root, 'legacy.sqlite');
  const backupRoot = path.join(root, 'backups');
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(fs.readFileSync(schemaPath, 'utf8'));
  legacy.prepare('INSERT INTO schema_version (version, applied_at) VALUES (4, ?)').run(new Date().toISOString());
  legacy.prepare('INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?, ?)')
    .run(JSON.stringify(sampleState()), '2026-07-18T12:00:00.000Z');
  legacy.prepare(`
    INSERT INTO market_prices (
      product_id, captured_date, trend_price, source_id, imported_at
    ) VALUES ('123456', '2026-07-18', 15, 'cardmarket_price_guide', '2026-07-18T12:00:00.000Z')
  `).run();
  // Simuliert eine echte v4-Datei: Die neuen Tabellen gab es vor dem Öffnen nicht.
  for (const table of [
    'pricing_recommendation_history','inventory_assets','purchase_receipt_lines',
    'pricing_recommendations','market_observation_summary','market_observations','trade_lines',
    'trade_orders','business_events','external_entity_links','sync_runs','data_sources'
  ]) legacy.exec(`DROP TABLE IF EXISTS ${table};`);
  legacy.close();

  const database = new TcgDatabase({databasePath, schemaPath, backupRoot});
  t.after(() => {
    database.close();
    fs.rmSync(root, {recursive:true, force:true});
  });
  database.open();
  const status = database.getTradeDatabaseStatus();
  assert.equal(database.getStatus().schemaVersion, 9);
  assert.equal(status.orderCount, 2);
  assert.equal(status.marketObservationCount, 1);
  assert.equal(status.eventCount, 3);
  assert.equal(fs.readdirSync(path.join(backupRoot, 'Migrationen')).filter(name => name.endsWith('.sqlite')).length, 1);
});

test('speichert Wareneingangsaufteilung und private Karten getrennt in SQLite', t => {
  const {database} = temporaryDatabase(t);
  const state = sampleState();
  state.purchases[0].pendingItems[0] = {
    ...state.purchases[0].pendingItems[0], receiptLineKey:'line-1',
    receivedBusiness:1, materializedBusiness:1,
    receivedPrivate:1, materializedPrivate:1
  };
  state.inventory[0].purchaseLineKey='purchase-1:line-1';
  state.privateCollection=[{
    id:'private-1', purchaseId:'purchase-1', purchaseLineKey:'purchase-1:line-1',
    productId:'123456', name:'Testkarte', cost:9, status:'Privatsammlung', purchaseDate:'2026-07-01'
  }];

  database.saveState(state);
  const receipt={...database.db.prepare('SELECT business_quantity, private_quantity, open_quantity, unit_cost FROM purchase_receipt_lines WHERE archived=0').get()};
  assert.deepEqual(receipt,{business_quantity:1,private_quantity:1,open_quantity:0,unit_cost:9});
  const assets=database.db.prepare('SELECT ownership, inventory_id FROM inventory_assets WHERE archived=0 ORDER BY ownership').all().map(row=>({...row}));
  assert.deepEqual(assets,[{ownership:'business',inventory_id:'inventory-1'},{ownership:'private',inventory_id:'private-1'}]);
  assert.equal(database.getTradeRecommendations({productIds:['123456']}).recommendations[0].buySampleCount,1);
});

test('speichert Cardmarket-Abrechnungen normalisiert und API-kompatibel in SQLite', t => {
  const {database} = temporaryDatabase(t);
  const state = sampleState();
  state.reconciliations = [{
    id:'settlement-1', importKey:'SETTLEMENT-test', file:'Abrechnung.csv', date:'2026-07-22T10:00:00.000Z',
    rows:2, matched:1, unmatched:1, difference:0,
    entries:[
      {row:2,date:'2026-07-20',orderNo:'CM-SALE-1',matchedSaleId:'sale-1',amount:14.25,expectedPayout:14.25,difference:0},
      {row:3,date:'2026-07-21',orderNo:'999999',matchedSaleId:'',amount:3,expectedPayout:0,difference:3}
    ]
  }];

  database.saveState(state);
  const status = database.getTradeDatabaseStatus();
  assert.equal(status.settlementCount, 1);
  assert.equal(status.unmatchedSettlementCount, 1);
  const rows = database.db.prepare('SELECT external_order_id, match_status FROM settlement_entries ORDER BY row_number').all().map(row=>({...row}));
  assert.deepEqual(rows, [
    {external_order_id:'CM-SALE-1', match_status:'matched'},
    {external_order_id:'999999', match_status:'unmatched'}
  ]);
});

test('Cardmarket-API-Adapter ist standardmäßig sicher deaktiviert und erhält externe IDs', async () => {
  const adapter = new CardmarketApiAdapter();
  assert.equal(adapter.getStatus().enabled, false);
  assert.equal(adapter.getStatus().baseUrl, CARDMARKET_API_BASE_URL);
  await assert.rejects(() => adapter.assertReady(), /noch nicht aktiviert/);
  const order = normalizeOrder({
    idOrder:987, dateOfPurchase:'2026-07-19T10:30:00Z', state:'paid',
    buyer:{username:'kunde', country:'DE'},
    article:[{idArticle:654, idProduct:123456, productName:'Test Card', count:2, price:7.5, condition:'NM'}]
  }, 'sale');
  assert.equal(order.externalOrderId, '987');
  assert.equal(order.articles[0].externalArticleId, '654');
  assert.equal(order.articles[0].productId, '123456');
});
