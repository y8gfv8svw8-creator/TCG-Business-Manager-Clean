const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const sourceDatabase = process.env.TCG_MANAGER_REAL_DB || path.join(process.env.USERPROFILE || '', 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase5-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9250;
fs.mkdirSync(chromiumData, { recursive: true });
fs.mkdirSync(path.join(qaData, 'Daten'), { recursive: true });
if (!fs.existsSync(sourceDatabase)) throw new Error(`Quelldatenbank für Smoke-Test fehlt: ${sourceDatabase}`);
fs.copyFileSync(sourceDatabase, path.join(qaData, 'Daten', 'tcg_business_manager.sqlite'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPage() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(row => row.type === 'page' && String(row.url).startsWith('file:'));
      if (page) return page;
    } catch {}
    await delay(250);
  }
  throw new Error('Die gepackte PHASE-5-Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('PHASE-5-Oberflächentest hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur gepackten PHASE-5-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer); socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Oberfläche.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, [`--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--disable-software-rasterizer', '--disable-gpu-compositing', '--no-sandbox'], {
    cwd: path.dirname(executable), windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();
    await delay(1800);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const rendererErrors=[];
      window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      await refreshMarketDecisionHistory(true);await refreshOwnSalesExperience(true);renderAll();
      const viewChecks={};
      for(const view of ['dashboard','inventory','purchases','sales','salesanalysis','capital','slowmovers']){showView(view);viewChecks[view]=document.getElementById('view-'+view)?.classList.contains('active')===true;}
      showView('collectionpurchases');
      const collectionView=document.getElementById('view-collectionpurchases')?.classList.contains('active')===true;
      const entryFields=['collectionCardSearch','collectionCardQuantity','collectionCardCondition','collectionCardLanguage','collectionCardConfidence','addCollectionCardBtn','collectionCsvInput'].every(id=>Boolean(document.getElementById(id)));
      const searchItem=(state.inventory||[]).find(entry=>{const names=cardDisplayNames(entry);return names.primary&&names.secondary;});
      const searchNames=cardDisplayNames(searchItem||{});
      const sample={sellerPrice:5,shipping:1,extra:0,items:[{id:'smoke-item',productId:'741275',name:'Nibiru, das Urwesen',quantity:1,condition:'NM',language:'DE',printConfidence:'confirmed',market:{low:20,avg1:20,avg7:20,avg30:20,trend:20},marketTrend:'STABIL',ownSales:{}}]};
      const analysis=TcgBusinessAutomation.analyzeCollectionPurchase(sample,{settings:state.settings,liquidCapital:100});
      const snapshot=TcgBusinessAutomation.buildCollectionDecisionSnapshot(sample,analysis,'2026-08-15T12:00:00.000Z');
      const databaseStatus=await window.desktopApp.getDatabaseStatus();
      return {title:document.title,ready:document.readyState,viewChecks,collectionView,entryFields,
        germanSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.primary)),
        englishSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.secondary)),
        priceGuide:Boolean(Object.values(state.productCatalog||{}).some(row=>Number(row.low||row.avg1||row.avg7||row.avg30||row.trend)>0)),
        maxEk:Boolean(analysis.blindMaxEk>0&&analysis.confirmedMaxEk>=analysis.blindMaxEk),decision:analysis.decision,
        snapshot:Boolean(snapshot.historical&&snapshot.blindMaxEk===analysis.blindMaxEk),
        noAutomaticInventory:analysis.automaticInventoryCreated===false,
        phase3Bridge:typeof window.desktopApp?.getMarketDecisionHistory==='function',phase4Bridge:typeof window.desktopApp?.getOwnSalesExperience==='function',
        databaseStatus,rendererErrors};
    })()`);
    const viewsOk=result&&Object.values(result.viewChecks||{}).every(Boolean);
    if(!result||!result.title?.includes('6.10.0')||result.ready!=='complete'||!viewsOk||!result.collectionView||!result.entryFields||!result.germanSearch||!result.englishSearch||!result.priceGuide||!result.maxEk||!result.snapshot||!result.noAutomaticInventory||!result.phase3Bridge||!result.phase4Bridge||result.databaseStatus?.schemaVersion!==12||result.rendererErrors?.length){
      throw new Error(`PHASE-5-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/error|exception|sqlite.*(?:malformed|corrupt)/i.test(output))throw new Error(`Fehlerausgabe der gepackten App: ${output.trim()}`);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
