const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { TcgDatabase } = require('../app/main/database');
const automation = require('../app/shared/business-automation');
const { normalizeSettings } = require('../app/shared/app-config');

const sourcePath = process.env.TCG_MANAGER_REAL_DB || path.join(
  process.env.USERPROFILE || '', 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite'
);
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function sourceSignature(file) {
  const stats = fs.statSync(file);
  const db = new DatabaseSync(file, { readOnly:true });
  const state = db.prepare('SELECT state_json, updated_at FROM app_state WHERE id=1').get();
  const integrity = db.prepare('PRAGMA integrity_check').get()?.integrity_check || '';
  db.close();
  return { size:stats.size, mtimeMs:stats.mtimeMs, updatedAt:String(state?.updated_at||''), stateJson:String(state?.state_json||''), integrity };
}

function legacyReference(market = {}) {
  const value = key => Number(market[key]) > 0 ? Number(market[key]) : null;
  const liveOffer = value('liveOffer');
  const low = value('low');
  const avg1 = value('avg1');
  const avg7 = value('avg7');
  const avg30 = value('avg30');
  if (liveOffer !== null) return liveOffer;
  if (low !== null && avg1 !== null) {
    const ratio = low / avg1;
    if (ratio < 0.35 || ratio > 2.85) {
      const recent = [avg1, avg7, avg30].filter(entry => entry !== null).sort((a, b) => a - b);
      const recentMedian = recent[Math.floor((recent.length - 1) / 2)] || avg1;
      return low < 0.25 ? Math.min(recentMedian, low + Math.min(0.20, recentMedian * 0.35)) : recentMedian;
    }
    return low * 0.90 + avg1 * 0.10;
  }
  if (avg1 !== null) return avg1;
  if (low !== null) return low;
  return [value('avg7'), value('avg30'), value('trend')].filter(entry => entry !== null).sort((a, b) => a - b)[0] || 0;
}

if (!fs.existsSync(sourcePath)) throw new Error(`Echte Datenbank nicht gefunden: ${sourcePath}`);
const before = sourceSignature(sourcePath);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase3-real-db-'));
const copyPath = path.join(root, 'phase3-copy.sqlite');
let database;
try {
  fs.copyFileSync(sourcePath, copyPath);
  database = new TcgDatabase({ databasePath:copyPath, schemaPath, backupRoot:path.join(root, 'backups') }).open();
  const loaded = database.loadState();
  const state = loaded.state || {};
  const current = (state.inventory || []).filter(item=>item.ownership!=='private'&&!['Verkauft','Privat','Abgegeben','Storniert'].includes(item.status));
  const productIds = [...new Set(current.map(item=>String(item.productId||'').match(/\d+/)?.[0]).filter(Boolean))];
  const targetDates = {};
  current.forEach(item=>{
    const productId=String(item.productId||'').match(/\d+/)?.[0];if(!productId)return;
    targetDates[productId]||=[];
    [automation.inventoryStartDate(item),automation.listingStartDate(item)].filter(Boolean).forEach(date=>targetDates[productId].push(String(date).slice(0,10)));
  });
  const started = performance.now();
  const batch = database.getMarketDecisionHistory({ productIds, targetDates, recentDays:45 });
  const queryMs = performance.now() - started;
  const settings = normalizeSettings(state.settings || {});
  const analyzedStarted = performance.now();
  let analyzed = 0, insufficient = 0;
  current.forEach(item=>{
    const productId=String(item.productId||'').match(/\d+/)?.[0]||'';
    if(!productId)return;
    const result=automation.analyzeMarketDecision(item,state.productCatalog?.[productId]||{},batch.histories[productId]||[],settings,new Date());
    analyzed += 1;
    if(result.dataQuality==='UNZUREICHEND')insufficient += 1;
  });
  const analysisMs = performance.now() - analyzedStarted;
  const practiceIds = ['260727', '251780', '741695'];
  const practice = practiceIds.map(productId => {
    const card = current.find(item => String(item.productId || '').replace(/\D/g, '') === productId);
    const market = state.productCatalog?.[productId] || {};
    if (!card) throw new Error(`Praxis-Prüfkarte CM ${productId} fehlt im Bestand der Datenbankkopie.`);
    const beforeReference = legacyReference(market);
    const beforeDecision = automation.analyzeMarketDecision(card, { ...market, liveOffer:beforeReference }, batch.histories[productId] || [], settings, new Date('2026-08-14T12:00:00.000Z'));
    const afterDecision = automation.analyzeMarketDecision(card, market, batch.histories[productId] || [], settings, new Date('2026-08-14T12:00:00.000Z'));
    return {
      productId,
      name:card.name,
      referenceBefore:Number(beforeReference.toFixed(2)),
      referenceAfter:afterDecision.currentReference,
      trend:afterDecision.trend.status,
      pricePositionBefore:beforeDecision.pricePosition.status,
      pricePositionAfter:afterDecision.pricePosition.status,
      recommendationBefore:beforeDecision.recommendation,
      recommendationAfter:afterDecision.recommendation,
      reasonsAfter:afterDecision.reasons
    };
  });
  const arkane = practice.find(row => row.productId === '260727');
  const laquari = practice.find(row => row.productId === '251780');
  const blitz = practice.find(row => row.productId === '741695');
  if (arkane.referenceBefore !== 0.22 || arkane.referenceAfter !== 2.33 || arkane.recommendationAfter !== 'UNZUREICHENDE HANDELSDATEN') throw new Error(`Arkane-Macht-Praxisfall liefert nicht den erwarteten robusten Referenzfix: ${JSON.stringify(arkane)}`);
  if (laquari.referenceAfter !== 6.99 || laquari.recommendationAfter !== laquari.recommendationBefore) throw new Error(`Laquari-Kontrollfall hat sich unerwartet verändert: ${JSON.stringify(laquari)}`);
  if (blitz.referenceAfter !== 2.30 || blitz.recommendationAfter !== blitz.recommendationBefore) throw new Error(`Blitzsturm-Kontrollfall hat sich unerwartet verändert: ${JSON.stringify(blitz)}`);
  const status=database.getStatus();
  const integrity=database.db.prepare('PRAGMA integrity_check').get()?.integrity_check||'';
  const output={
    sourcePath,copyPath,schemaVersion:status.schemaVersion,integrity,
    counts:{inventory:(state.inventory||[]).length,privateCards:(state.privateCollection||[]).length,purchases:(state.purchases||[]).length,sales:(state.sales||[]).length},
    marketPriceRows:status.marketPriceCount,snapshots:status.snapshotCount,exactProductIds:productIds.length,
    analyzed,insufficient,historyQueryMs:Number(queryMs.toFixed(1)),decisionAnalysisMs:Number(analysisMs.toFixed(1)),practice
  };
  console.log(JSON.stringify(output,null,2));
} finally {
  database?.close();
  fs.rmSync(root,{recursive:true,force:true});
}
const after = sourceSignature(sourcePath);
if (before.integrity !== 'ok' || after.integrity !== 'ok') throw new Error('SQLite-Integrität der echten Datenbank ist nicht OK.');
if (before.size!==after.size || before.mtimeMs!==after.mtimeMs || before.updatedAt!==after.updatedAt || before.stateJson!==after.stateJson) {
  throw new Error('Die echte Datenbank wurde während der PHASE-3-Prüfung verändert.');
}
console.log('Originaldatenbank unverändert; temporäre Kopie entfernt.');
