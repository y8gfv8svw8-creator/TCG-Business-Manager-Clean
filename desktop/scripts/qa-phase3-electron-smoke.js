const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const sourceDatabase = process.env.TCG_MANAGER_REAL_DB || path.join(process.env.USERPROFILE || '', 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase3-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9237;
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
  throw new Error('Die gepackte Phase-3-Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('Phase-3-Oberflächentest hat zu lange gedauert.'));
    }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => {
      clearTimeout(timer);
      reject(new Error('Verbindung zur gepackten Phase-3-Oberfläche fehlgeschlagen.'));
    };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);
      socket.close();
      if (message.result?.exceptionDetails) {
        reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Oberfläche.'));
        return;
      }
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, [`--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--disable-software-rasterizer', '--disable-gpu-compositing', '--no-sandbox'], {
    cwd: path.dirname(executable),
    windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();
    await delay(1500);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const rendererErrors=[];
      const originalConsoleError=console.error;
      console.error=(...args)=>{rendererErrors.push(args.map(String).join(' '));originalConsoleError(...args);};
      window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      await refreshMarketDecisionHistory(true);
      renderAll();
      const settings={feePercent:5,packaging:0.12,minProfit:0.25,minRoi:25,marketTrendStablePercent:3,marketTrendDirectionalPercent:6,marketTrendStrongPercent:15,marketPriceNearPercent:5,marketPriceFarPercent:20};
      const item={productId:'741275',cost:1.64,costStatus:'known',purchaseDate:'2026-07-15',listed:true,listingPrice:2.20,originalTargetSell:2.50,holdingProfile:'META / STAPLE'};
      const history=[
        {date:'2026-07-15',low:1.50,trend:1.55,avg1:1.52,avg7:1.50,avg30:1.48},
        {date:'2026-08-07',low:1.70,trend:1.76,avg1:1.74,avg7:1.70,avg30:1.60},
        {date:'2026-08-13',low:1.90,trend:1.96,avg1:1.94,avg7:1.88,avg30:1.70},
        {date:'2026-08-14',low:2.10,trend:2.18,avg1:2.15,avg7:1.96,avg30:1.78}
      ];
      const decision=TcgBusinessAutomation.analyzeMarketDecision(item,history.at(-1),history,settings,new Date('2026-08-14T12:00:00Z'));
      showView('dashboard');
      const dashboard=Boolean(document.getElementById('dashboardMarketDecisionSummary')?.children.length===5);
      showView('inventory');
      const inventory=document.getElementById('view-inventory').classList.contains('active')&&document.querySelectorAll('#inventoryTable tr').length>0;
      showView('capital');
      const capital=document.getElementById('view-capital').classList.contains('active')&&document.getElementById('capitalPageSummary')?.children.length>=8;
      showView('slowmovers');
      const slowmovers=document.getElementById('view-slowmovers').classList.contains('active');
      const filters=['slowMoverTrend','slowMoverRecommendation','slowMoverProfitTarget'].every(id=>Boolean(document.getElementById(id)));
      const columns=document.querySelectorAll('#slowMoverTable').item(0)?.closest('table')?.querySelectorAll('thead th').length||0;
      showView('settings');
      const thresholdSettings=['settingMarketTrendStable','settingMarketTrendDirectional','settingMarketTrendStrong','settingMarketPriceNear','settingMarketPriceFar'].every(id=>Boolean(document.getElementById(id)));
      const forbidden=[...document.querySelectorAll('body *')].some(node=>node.children.length===0&&/LIVE-MARKTPREIS|AKTUELL BILLIGSTES ANGEBOT|VERKAUFSWAHRSCHEINLICHKEIT/i.test(node.textContent||''));
      const exactItem=productId=>(state.inventory||[]).find(item=>String(item.productId||'').replace(/\\D/g,'')===productId&&!['Verkauft','Privat','Abgegeben','Storniert'].includes(item.status));
      const analyze=productId=>phase2InventoryAnalysis(exactItem(productId)).marketDecision;
      const arkane=analyze('260727');
      const blitz=analyze('741695');
      const laquari=analyze('251780');
      const arkaneGroup=getInventoryGroups(true).find(group=>String(group.first?.productId||'').replace(/\\D/g,'')==='260727');
      openInventoryDetails(arkaneGroup.key);
      const detailText=document.getElementById('orderDetailContent')?.textContent||'';
      const searchItem=(state.inventory||[]).find(entry=>{
        const names=cardDisplayNames(entry);return names.primary&&names.secondary;
      });
      const searchNames=cardDisplayNames(searchItem||{});
      const databaseStatus=await window.desktopApp.getDatabaseStatus();
      return {
        title:document.title,
        ready:document.readyState,
        dashboard,
        inventory,
        capital,
        slowmovers,
        filters,
        columns,
        thresholdSettings,
        trend:decision.trend.status,
        dataQuality:decision.dataQuality,
        exactProductId:decision.productId,
        change7Available:decision.changes.day7.available,
        change30Available:decision.changes.day30.available,
        sincePurchaseAvailable:decision.sincePurchase.available,
        scenarios:decision.scenarios.length,
        priceAction:decision.priceAction,
        noForbiddenLiveClaim:!forbidden,
        desktopBridge:typeof window.desktopApp?.getMarketDecisionHistory==='function',
        databaseStatus,
        inventoryCount:(state.inventory||[]).length,
        privateCount:(state.privateCollection||[]).length,
        purchaseCount:(state.purchases||[]).length,
        saleCount:(state.sales||[]).length,
        germanSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.primary)),
        englishSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.secondary)),
        inventoryDetailsOpen:Boolean(document.getElementById('orderDetailDialog')?.open),
        detailShowsOutlier:/Price Guide Low als Ausreißer erkannt/.test(detailText),
        detailShowsReference:/2,33\\s*€/.test(detailText),
        arkane:{reference:arkane.currentReference,low:arkane.priceGuide.low,listingPrice:arkane.currentPrice,lowOutlier:arkane.lowOutlier,pricePercent:arkane.pricePosition.percent,recommendation:arkane.recommendation,thresholdsCalculable:arkane.thresholds.calculable,currentScenarioCalculable:arkane.scenarios.find(row=>row.key==='current')?.result?.calculable},
        blitz:{reference:blitz.currentReference,trend:blitz.trend.status,recommendation:blitz.recommendation},
        laquari:{reference:laquari.currentReference,trend:laquari.trend.status,recommendation:laquari.recommendation},
        rendererErrors
      };
    })()`);
    if (!result || !result.title?.includes('6.7.1') || result.ready !== 'complete' || !result.dashboard || !result.inventory || !result.capital || !result.slowmovers || !result.filters || result.columns < 18 || !result.thresholdSettings || !['STEIGEND', 'STARK STEIGEND'].includes(result.trend) || result.dataQuality === 'UNZUREICHEND' || result.exactProductId !== '741275' || !result.change7Available || !result.change30Available || !result.sincePurchaseAvailable || result.scenarios !== 4 || result.priceAction !== 'KEINE AUTOMATISCHE PREISÄNDERUNG' || !result.noForbiddenLiveClaim || !result.desktopBridge || result.databaseStatus?.schemaVersion !== 9 || result.inventoryCount !== 890 || result.privateCount !== 14 || result.purchaseCount !== 9 || result.saleCount !== 49 || !result.germanSearch || !result.englishSearch || !result.inventoryDetailsOpen || !result.detailShowsOutlier || !result.detailShowsReference || result.arkane?.reference !== 2.33 || result.arkane?.low !== 0.02 || result.arkane?.listingPrice !== 3 || !result.arkane?.lowOutlier || Math.abs(Number(result.arkane?.pricePercent)) > 100 || result.arkane?.recommendation !== 'UNZUREICHENDE HANDELSDATEN' || result.arkane?.thresholdsCalculable !== false || result.arkane?.currentScenarioCalculable !== false || result.blitz?.recommendation !== 'PREIS PRÜFEN' || result.laquari?.recommendation !== 'VK ERHÖHUNG PRÜFEN' || result.rendererErrors?.length) {
      throw new Error(`Phase-3-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    child.kill();
    await delay(700);
    fs.rmSync(qaData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    if (output.trim() && /error|exception|sqlite.*(?:malformed|corrupt)/i.test(output)) {
      throw new Error(`Fehlerausgabe der gepackten App: ${output.trim()}`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
