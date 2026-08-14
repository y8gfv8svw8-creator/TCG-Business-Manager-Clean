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
  const status=database.getStatus();
  const integrity=database.db.prepare('PRAGMA integrity_check').get()?.integrity_check||'';
  const output={
    sourcePath,copyPath,schemaVersion:status.schemaVersion,integrity,
    counts:{inventory:(state.inventory||[]).length,privateCards:(state.privateCollection||[]).length,purchases:(state.purchases||[]).length,sales:(state.sales||[]).length},
    marketPriceRows:status.marketPriceCount,snapshots:status.snapshotCount,exactProductIds:productIds.length,
    analyzed,insufficient,historyQueryMs:Number(queryMs.toFixed(1)),decisionAnalysisMs:Number(analysisMs.toFixed(1))
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
