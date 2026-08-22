const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const automation = require('../app/shared/business-automation');
const { normalizeSettings } = require('../app/shared/app-config');
const { TcgDatabase, CURRENT_SCHEMA_VERSION } = require('../app/main/database');

const settings = normalizeSettings({});
const market = value => ({ low: value, avg1: value, avg7: value, avg30: value, trend: value });
const item = (id, value, extra = {}) => ({ id, productId: String(id), name: `Karte ${id}`, quantity: 1, condition: 'NM', language: 'DE', printConfidence: 'confirmed', market: market(value), marketTrend: 'STABIL', ownSales: {}, ...extra });
const analyze = (sellerPrice, items, extra = {}) => automation.analyzeCollectionPurchase({ sellerPrice, shipping: 0, extra: 0, items, ...extra }, { settings, liquidCapital: 100 });

test('leere Sammlung bleibt ZU WENIGE DATEN', () => assert.equal(analyze(10, []).decision, 'ZU WENIGE DATEN'));
test('Verkäuferpreis wird getrennt gespeichert', () => { const result = analyze(12, [item(1, 30)]); assert.equal(result.sellerPrice, 12); assert.equal(result.totalCost, 12); });
test('Versand und Zusatzkosten erhöhen nur die direkten Ankaufskosten', () => { const result = analyze(10, [item(1, 30)], { shipping: 2, extra: 3 }); assert.equal(result.totalCost, 15); assert.equal(result.sellerPrice, 10); });
test('Versand und Zusatzkosten werden beim Gesamt-Max-EK nicht doppelt abgezogen', () => {
  const withoutCosts = analyze(1, [item(1, 30)]);
  const withCosts = analyze(1, [item(1, 30)], { shipping: 2, extra: 3 });
  assert.equal(withCosts.blindMaxEk, withoutCosts.blindMaxEk);
  assert.equal(withCosts.confirmedMaxEk, withoutCosts.confirmedMaxEk);
  assert.equal(withCosts.sellerPriceCeiling, Math.max(0, Math.round((withCosts.blindMaxEk - 5) * 100) / 100));
  assert.equal(withCosts.totalCost, withoutCosts.totalCost + 5);
});
test('nominaler Referenzwert summiert konkrete Price-Guide-Prints', () => assert.equal(analyze(1, [item(1, 10, { quantity: 2 }), item(2, 5)]).nominalValue, 25));
test('konservativer Handelswert liegt nicht über dem nominalen Referenzwert', () => { const result = analyze(1, [item(1, 10)]); assert.ok(result.conservativeValue <= result.nominalValue); });
test('realistischer Handelswert bleibt getrennt vom konservativen Wert', () => { const result = analyze(1, [item(1, 10)]); assert.ok(result.realisticValue >= result.conservativeValue); });
test('Bulk wird pro Karte statt zum theoretischen Einzelwert bewertet', () => { const result = analyze(1, [item(1, .10, { quantity: 100 })]); assert.equal(result.bulkValue, 1); assert.equal(result.nominalValue, 10); });
test('unsicherer Wert ist konservative Spannweite und nicht garantierter Erlös', () => { const result = automation.analyzeCollectionPurchaseItem(item(1, 2, { printConfidence: 'unknown', printCandidates: [{ productId: '2', market: market(15) }] }), settings); assert.ok(result.uncertaintyValue > 10); assert.equal(result.referenceValue, 2); });
test('Ankaufsklassen A bis E verwenden konfigurierbare Grenzen', () => assert.deepEqual([10, 5, 1, .2, .19].map(value => automation.collectionPriceClass(value, settings).key), ['A', 'B', 'C', 'D', 'E']));
test('Grund-Ankauffaktoren bleiben innerhalb ihrer erlaubten Bänder', () => { const factors = ['A', 'B', 'C', 'D'].map(key => automation.collectionBaseFactor({ key, ...automation.COLLECTION_PRICE_CLASSES[key] }, settings)); assert.deepEqual(factors, [.6, .475, .325, .15]); });
test('ausreichende schnelle profitable Eigendaten erhöhen Faktor nur innerhalb des Bands', () => { const ownSales={ saleCount: 8, medianDays: 11, averageProfit: 2, averageRoi: 35, dataQuality: automation.ownSalesDataQuality(8), turnoverClass: automation.ownTurnoverClass(11, 8) }; assert.equal(automation.analyzeCollectionPurchaseItem(item(1, 10, { ownSales }), settings).factor, .65); });
test('ausreichende langsame Eigendaten senken den Ankauffaktor', () => { const ownSales={ saleCount: 5, medianDays: 95, averageProfit: .5, averageRoi: 10, dataQuality: automation.ownSalesDataQuality(5), turnoverClass: automation.ownTurnoverClass(95, 5) }; assert.equal(automation.analyzeCollectionPurchaseItem(item(1, 10, { ownSales }), settings).factor, .55); });
test('ein eigener Verkauf erzeugt keine starke Liquiditätsanpassung', () => { const row = automation.analyzeCollectionPurchaseItem(item(1, 10, { ownSales: { saleCount: 1, medianDays: 2 } }), settings); assert.equal(row.factor, .6); assert.match(row.reasons.join(' '), /Tendenz/); });
test('fallender Markt reduziert über den Risikopuffer den Max-EK', () => { const stable = automation.analyzeCollectionPurchaseItem(item(1, 10), settings); const falling = automation.analyzeCollectionPurchaseItem(item(1, 10, { marketTrend: 'FALLEND' }), settings); assert.ok(falling.maxPurchaseContribution < stable.maxPurchaseContribution); });
test('steigender Markt erzeugt keinen FOMO-Aufschlag', () => { const stable=automation.analyzeCollectionPurchaseItem(item(1,10),settings); const rising=automation.analyzeCollectionPurchaseItem(item(1,10,{marketTrend:'STARK STEIGEND'}),settings); assert.equal(rising.factor,stable.factor); assert.equal(rising.maxPurchaseContribution,stable.maxPurchaseContribution); });
test('unbekannter Print verwendet den niedrigsten plausiblen Kandidaten', () => { const row=automation.analyzeCollectionPurchaseItem({id:'x',name:'X',quantity:1,condition:'NM',printConfidence:'unknown',printCandidates:[{productId:'1',market:market(2)},{productId:'2',market:market(15)}]},settings); assert.equal(row.referenceValue,2); assert.equal(row.possibleReferenceValue,15); });
test('unbekannter Print verwendet auch bei teurem vorausgewähltem Produkt den günstigsten Kandidaten', () => { const row=automation.analyzeCollectionPurchaseItem(item(1,15,{printConfidence:'unknown',printCandidates:[{productId:'2',market:market(2)}]}),settings); assert.equal(row.referenceValue,2); assert.equal(row.possibleReferenceValue,15); assert.doesNotMatch(row.referenceSource,/exakte Produkt-ID/); });
test('unbekannter Zustand wird als Risiko statt als erfundener Zustandswert behandelt', () => { const known=automation.analyzeCollectionPurchaseItem(item(1,10),settings); const unknown=automation.analyzeCollectionPurchaseItem(item(1,10,{condition:'UNBEKANNT'}),settings); assert.ok(unknown.conservativeValue<known.conservativeValue); assert.match(unknown.reasons.join(' '),/Zustand unbekannt/); });
test('Economic Relevance greift ab dem konfigurierten Unsicherheitsbetrag', () => { const row=automation.analyzeCollectionPurchaseItem(item(1,2,{printConfidence:'unknown',printCandidates:[{productId:'2',market:market(8)}]}),settings); assert.equal(row.economicRelevant,true); assert.equal(row.economicThreshold,3); });
test('Economic Relevance bleibt unter der Schwelle aus', () => { const custom=normalizeSettings({collectionEconomicRelevance:20}); const row=automation.analyzeCollectionPurchaseItem(item(1,2,{printConfidence:'unknown',printCandidates:[{productId:'2',market:market(8)}]}),custom); assert.equal(row.economicRelevant,false); });
test('Blind-Max-EK enthält Unsicherheits- und Direktkostenpuffer', () => { const result=analyze(1,[item(1,20)],{shipping:2,extra:1}); assert.ok(result.blindMaxEk<result.conservativeValue); });
test('bestätigter Max-EK ist niemals kleiner als Blind-Max-EK', () => { const result=analyze(1,[item(1,2,{printConfidence:'unknown',printCandidates:[{productId:'2',market:market(15)}]})]); assert.ok(result.confirmedMaxEk>=result.blindMaxEk); });
test('bei bestätigtem Print und Zustand sind beide Max-EK-Sichten gleich', () => { const result=analyze(1,[item(1,20)]); assert.equal(result.confirmedMaxEk,result.blindMaxEk); });
test('Erstangebot liegt nachvollziehbar unter dem Blind-Max-EK', () => { const result=analyze(1,[item(1,20)]); assert.equal(result.firstOffer,Math.round(result.blindMaxEk*.75*100)/100); });
test('Verkäuferpreis deutlich unter Max-EK führt zu KAUFEN', () => assert.equal(analyze(2,[item(1,20)]).decision,'KAUFEN'));
test('Verkäuferpreis oberhalb Erstangebot aber innerhalb Max-EK kann KAUFEN bleiben', () => { const base=analyze(1,[item(1,20)]); assert.equal(analyze((base.firstOffer+base.blindMaxEk)/2,[item(1,20)]).decision,'KAUFEN'); });
test('Verkäuferpreis zwischen Blind- und bestätigtem Max-EK verlangt bei relevanter Unsicherheit Detailprüfung', () => { const cards=[item(1,3,{printConfidence:'unknown',printCandidates:[{productId:'2',market:market(20)}]})]; const base=analyze(1,cards); const price=Math.max(base.blindMaxEk*.9,Math.min(base.confirmedMaxEk,base.blindMaxEk+1)); assert.equal(analyze(price,cards).decision,'DETAILPRÜFUNG NOTWENDIG'); });
test('Verkäuferpreis zwischen Blind-Max-EK und Potenzial kann VERHANDELN ergeben', () => { const cards=[item(1,20,{condition:'UNBEKANNT'})]; const base=analyze(1,cards); const result=analyze((base.blindMaxEk+base.confirmedMaxEk)/2,cards); assert.ok(['VERHANDELN','DETAILPRÜFUNG NOTWENDIG'].includes(result.decision)); });
test('Verkäuferpreis über bestätigtem Max-EK führt zu ABLEHNEN', () => assert.equal(analyze(100,[item(1,20)]).decision,'ABLEHNEN'));
test('reiner Vergleich Nominalwert größer Verkäuferpreis löst keinen Kauf aus', () => { const result=analyze(8,[item(1,.10,{quantity:100})]); assert.equal(result.nominalValue,10); assert.equal(result.decision,'ABLEHNEN'); });
test('Top-Wertträger werden nach konservativem Wert sortiert', () => assert.equal(analyze(1,[item(1,5),item(2,20),item(3,10)]).topValueCarriers[0].productId,'2'));
test('Wertkonzentration über Schwellwert wird als HOCH markiert', () => assert.equal(analyze(1,[item(1,100),item(2,1),item(3,1),item(4,1)]).concentrationRisk,'HOCH'));
test('hohe Stückzahl ohne Eigendaten erhält konservativen Mengenabschlag', () => { const one=automation.analyzeCollectionPurchaseItem(item(1,3),settings); const many=automation.analyzeCollectionPurchaseItem(item(1,3,{quantity:5}),settings); assert.ok(many.conservativeValue<one.conservativeValue*5); });
test('Kapitalbindung bleibt bei unzureichenden Eigendaten ehrlich UNBEKANNT', () => assert.equal(analyze(1,[item(1,20)]).capitalBinding,'UNBEKANNT'));
test('langsame ausreichende Eigendaten erzeugen hohe Kapitalbindung', () => { const ownSales={saleCount:6,medianDays:120,averageProfit:2,averageRoi:30,dataQuality:automation.ownSalesDataQuality(6),turnoverClass:automation.ownTurnoverClass(120,6)}; assert.equal(analyze(1,[item(1,20,{ownSales})]).capitalBinding,'HOCH'); });
test('Ankauf kann Anteil am verfügbaren liquiden Handelskapital zeigen', () => assert.equal(analyze(30,[item(1,100)]).capitalShare,30));
test('Kapitalrisiko warnt über 50 Prozent ohne automatisch abzulehnen', () => { const result=automation.analyzeCollectionPurchase({sellerPrice:60,items:[item(1,200)]},{settings,liquidCapital:100}); assert.equal(result.capitalRisk,'HOCH'); assert.notEqual(result.decision,'ABLEHNEN'); });
test('Entscheidungssnapshot friert Berechnungsgrundlagen ein', () => { const result=analyze(5,[item(1,20)]); const snapshot=automation.buildCollectionDecisionSnapshot({sellerPrice:5,actualPurchasePrice:4},result,'2026-08-15T12:00:00.000Z'); result.blindMaxEk=999; assert.notEqual(snapshot.blindMaxEk,result.blindMaxEk); assert.equal(snapshot.historical,true); });
test('Snapshot speichert tatsächlichen Kaufpreis getrennt', () => { const result=analyze(5,[item(1,20)]); assert.equal(automation.buildCollectionDecisionSnapshot({actualPurchasePrice:4},result).actualPurchasePrice,4); });
test('Analyse erzeugt niemals automatisch Bestand', () => assert.equal(analyze(2,[item(1,20)]).automaticInventoryCreated,false));
test('bestätigter Ankauf wird als normaler Einkauf ohne automatische Bestandsübernahme vorbereitet', () => { const collection={id:'c1',title:'Sammlung',sellerPrice:5,shipping:1,extra:.5,items:[item(1,20,{quantity:2})],lastDecisionSnapshotId:'s1'};const result=automation.analyzeCollectionPurchase(collection,{settings});const draft=automation.buildCollectionPurchaseDraft(collection,result,{actualPurchasePrice:4,purchaseId:'p1',orderNo:'ANKAUF-1',date:'2026-08-15'});assert.equal(draft.id,'p1');assert.equal(draft.cardValue,4);assert.equal(draft.pendingItems.length,1);assert.equal(draft.pendingItems[0].quantity,2);assert.equal(draft.inventoryCreated,false);assert.equal(draft.sourceCollectionAnalysisId,'c1');assert.equal(draft.collectionDecisionSnapshotId,'s1'); });
test('Händlerentscheidung benennt ihre Price-Guide-Datenart ohne Live-Behauptung', () => { const result=analyze(2,[item(1,20)]); assert.match(result.priceDataType,/PRICE GUIDE/); assert.doesNotMatch(JSON.stringify(result),/LIVE-MARKTPREIS|VERKAUFSWAHRSCHEINLICHKEIT/); });
test('deutsche und englische Namen bleiben in Positionsdaten unverändert', () => { const row=item(1,10,{name:'Blitzsturm',germanName:'Blitzsturm',englishName:'Lightning Storm'}); const copy=structuredClone(row); analyze(1,[row]); assert.deepEqual(row,copy); });
test('PHASE-3-Marktdaten werden von der Analyse nicht verändert', () => { const row=item(1,10,{marketTrend:'FALLEND'}),before=structuredClone(row.market); analyze(1,[row]); assert.deepEqual(row.market,before); });
test('PHASE-4-Verkaufsdaten werden von der Analyse nicht verändert', () => { const ownSales={saleCount:6,medianDays:10,averageProfit:2,averageRoi:30},before=structuredClone(ownSales); analyze(1,[item(1,10,{ownSales})]); assert.deepEqual(ownSales,before); });
test('500 Positionen werden ohne vollständigen Historienscan interaktiv ausgewertet', () => { const rows=Array.from({length:500},(_,index)=>item(index+1,index%5===0?10:.5)); const started=performance.now(),result=analyze(100,rows); assert.equal(result.itemCount,500); assert.ok(performance.now()-started<1000); });
test('PHASE 5 enthält keine Fotoanalysefelder oder automatische Bilderkennung', () => { const result=analyze(1,[item(1,10)]); assert.equal('photoId' in result,false); assert.equal('ocr' in result,false); });

test('Praxistest 80 Euro: Nominalwert über Preis führt wegen Händler-Max-EK nicht zum Kauf', () => {
  const cards=[item(1,12),item(2,11),item(3,10),item(4,9),item(5,8),item(6,7),item(7,4),item(8,4),item(9,3),item(10,2),item(11,.8),item(12,.5),item(13,.3),item(14,.1,{quantity:100})];
  const result=analyze(80,cards);assert.equal(result.nominalValue,81.6);assert.ok(result.blindMaxEk<40);assert.equal(result.decision,'ABLEHNEN');
});
test('Praxistest 30 Euro: dieselbe Sammlung benötigt keine unnötige Detailprüfung', () => {
  const cards=[item(1,12),item(2,11),item(3,10),item(4,9),item(5,8),item(6,7),item(7,4),item(8,4),item(9,3),item(10,2),item(11,.8),item(12,.5),item(13,.3),item(14,.1,{quantity:100})];
  const result=analyze(30,cards);assert.equal(result.decision,'KAUFEN');assert.equal(result.relevantItems.length,0);
});
test('Praxistest unsicherer Wertträger: relevante Printspanne erzwingt Detailprüfung', () => {
  const cards=[item(20,3,{printConfidence:'unknown',printCandidates:[{productId:'21',market:market(30)}]}),item(22,8)];
  const result=analyze(6,cards,{shipping:4.99});assert.equal(result.decision,'DETAILPRÜFUNG NOTWENDIG');assert.equal(result.relevantItems.length,1);assert.ok(result.confirmedMaxEk>result.blindMaxEk);
});

test('Schema 11 normalisiert Sammlungsanalysen ohne einen trade_order zu erfinden', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'tcg-phase5-schema-')),databasePath=path.join(root,'test.sqlite');
  const database=new TcgDatabase({databasePath,schemaPath:path.resolve(__dirname,'../database/schema.sql'),backupRoot:path.join(root,'backups')});
  database.open();database.saveState({settings:{},inventory:[],privateCollection:[],purchases:[],sales:[],collectionPurchaseAnalyses:[{id:'c1',title:'Test',sellerPrice:10,items:[{id:'i1',productId:'123',name:'Karte',quantity:2,printConfidence:'confirmed'}],decisionSnapshots:[]}]});database.close();
  const db=new DatabaseSync(databasePath);assert.equal(CURRENT_SCHEMA_VERSION,12);assert.equal(db.prepare('SELECT COUNT(*) count FROM collection_purchase_analyses WHERE archived=0').get().count,1);assert.equal(db.prepare('SELECT COUNT(*) count FROM collection_purchase_items WHERE archived=0').get().count,1);assert.equal(db.prepare('SELECT COUNT(*) count FROM trade_orders WHERE archived=0').get().count,0);db.close();fs.rmSync(root,{recursive:true,force:true});
});

test('Schema-11-Migration erstellt Backup und erfindet keine Sammlungsdaten', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'tcg-phase5-migration-')),databasePath=path.join(root,'test.sqlite'),schemaPath=path.resolve(__dirname,'../database/schema.sql'),backupRoot=path.join(root,'backups');
  const first=new TcgDatabase({databasePath,schemaPath,backupRoot});first.open();first.saveState({settings:{},inventory:[{id:'asset-1',name:'Altkarte'}],privateCollection:[],purchases:[],sales:[]});first.close();
  const raw=new DatabaseSync(databasePath);raw.exec('DELETE FROM schema_version WHERE version>=11; INSERT OR IGNORE INTO schema_version(version,applied_at) VALUES(10,\'2026-08-15\');');raw.close();
  const migrated=new TcgDatabase({databasePath,schemaPath,backupRoot});migrated.open();const loaded=migrated.loadState().state;migrated.close();assert.deepEqual(loaded.collectionPurchaseAnalyses,[]);assert.equal(loaded.inventory.length,1);assert.ok(fs.readdirSync(path.join(backupRoot,'Migrationen')).some(name=>/v10_vor_v12/.test(name)));fs.rmSync(root,{recursive:true,force:true});
});

test('eine fehlgeschlagene Schema-11-Migration rollt Versionsstand und App-Daten zurück', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'tcg-phase5-rollback-')),databasePath=path.join(root,'test.sqlite'),schemaPath=path.resolve(__dirname,'../database/schema.sql'),backupRoot=path.join(root,'backups');
  const initial=new TcgDatabase({databasePath,schemaPath,backupRoot});initial.open();initial.saveState({settings:{},inventory:[{id:'asset-rollback',name:'Unverändert'}],privateCollection:[],purchases:[],sales:[]});initial.close();
  const raw=new DatabaseSync(databasePath);raw.exec('DELETE FROM schema_version WHERE version>=11; INSERT OR IGNORE INTO schema_version(version,applied_at) VALUES(10,\'2026-08-15\');');raw.close();
  class FailingMigrationDatabase extends TcgDatabase { migrateToVersion11(){ super.migrateToVersion11(); throw new Error('absichtlicher Rollback-Test'); } }
  const failing=new FailingMigrationDatabase({databasePath,schemaPath,backupRoot});assert.throws(()=>failing.open(),/Rollback-Test/);failing.close();
  const checked=new DatabaseSync(databasePath);assert.equal(checked.prepare('SELECT MAX(version) version FROM schema_version').get().version,10);const saved=JSON.parse(checked.prepare('SELECT state_json FROM app_state WHERE id=1').get().state_json);assert.equal(saved.inventory.length,1);assert.equal(saved.inventory[0].id,'asset-rollback');checked.close();fs.rmSync(root,{recursive:true,force:true});
});
