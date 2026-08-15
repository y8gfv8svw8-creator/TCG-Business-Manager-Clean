const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const sourceDatabase = process.env.TCG_MANAGER_REAL_DB || path.join(process.env.USERPROFILE || '', 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase4-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9240;
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
  throw new Error('Die gepackte PHASE-4-Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('PHASE-4-Oberflächentest hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur gepackten PHASE-4-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);
      socket.close();
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
      const originalConsoleError=console.error;
      console.error=(...args)=>{rendererErrors.push(args.map(String).join(' '));originalConsoleError(...args);};
      window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      await refreshMarketDecisionHistory(true);
      await refreshOwnSalesExperience(true);
      renderAll();
      showView('dashboard');
      const dashboard=Boolean(document.getElementById('dashboardOwnSalesSummary')?.children.length>=6);
      showView('inventory');
      const inventory=document.getElementById('view-inventory').classList.contains('active')&&document.querySelectorAll('#inventoryTable tr').length>0;
      const searchItem=(state.inventory||[]).find(entry=>{const names=cardDisplayNames(entry);return names.primary&&names.secondary;});
      const searchNames=cardDisplayNames(searchItem||{});
      const experiencePrint=(ownSalesExperienceCache.records||[]).find(row=>(state.inventory||[]).some(item=>cleanProductId(item.productId)===cleanProductId(row.productId)));
      const detailGroup=experiencePrint?getInventoryGroups(true).find(group=>cleanProductId(group.first?.productId)===cleanProductId(experiencePrint.productId)):getInventoryGroups(true)[0];
      let detailHasExperience=false;
      if(detailGroup){openInventoryDetails(detailGroup.key);detailHasExperience=/MEINE VERKAUFSERFAHRUNG/.test(document.getElementById('orderDetailContent')?.textContent||'');document.getElementById('orderDetailDialog')?.close();}
      showView('slowmovers');
      const slowmovers=document.getElementById('view-slowmovers').classList.contains('active')&&Boolean(document.getElementById('slowMoverTable'));
      showView('capital');
      const capital=document.getElementById('view-capital').classList.contains('active')&&document.getElementById('capitalPageSummary')?.children.length>=8;
      showView('salesanalysis');
      const salesanalysis=document.getElementById('view-salesanalysis').classList.contains('active')&&document.querySelectorAll('#salesAnalysisTable tr').length>0;
      const salesFilters=['salesAnalysisMinSales','salesAnalysisQuality','salesAnalysisTurnover','salesAnalysisProfile','salesAnalysisSet','salesAnalysisRarity','salesAnalysisMinRoi','salesAnalysisMinAverageProfit','salesAnalysisMinTotalProfit','salesAnalysisLastSaleFrom','salesAnalysisPriceMin','salesAnalysisPriceMax'].every(id=>Boolean(document.getElementById(id)));
      showView('purchases');
      let purchase=(state.purchases||[]).find(row=>(row.pendingItems||[]).length);
      let temporaryPurchase=false;
      if(!purchase){purchase={id:'phase4-smoke-purchase',orderNo:'PHASE4-SMOKE',date:'2026-08-15',status:'Unterwegs',cardValue:1.75,shipping:0,extra:0,pendingItems:[{receiptLineKey:'line-1',productId:'741275',name:'Nibiru, das Urwesen',quantity:1,unitPrice:1.75}]};state.purchases.push(purchase);temporaryPurchase=true;}
      let purchaseDecisionFields=false;
      if(purchase){openPurchaseReceipt(purchase.id);purchaseDecisionFields=['[data-receipt-target]','[data-receipt-cart-filler]','[data-receipt-incremental-shipping]','[data-receipt-incremental-direct]','[data-receipt-decision-cost]'].every(selector=>Boolean(document.querySelector('#purchaseReceiptContent '+selector)));document.getElementById('purchaseReceiptDialog')?.close();}
      if(temporaryPurchase)state.purchases=state.purchases.filter(row=>row.id!==purchase.id);
      const target=TcgBusinessAutomation.planTargetSellChange({},5.99,'2026-08-15T12:00:00Z','manual');
      const decisionCost=TcgBusinessAutomation.decisionCostBreakdown({cardPrice:1.75,fullCost:1.94,cartFiller:'yes',incrementalShippingCost:0,incrementalDirectCost:0});
      const databaseStatus=await window.desktopApp.getDatabaseStatus();
      const forbidden=[...document.querySelectorAll('body *')].some(node=>node.children.length===0&&/VERKAUFSWAHRSCHEINLICHKEIT|LIQUIDITÄT\\s*\\d+\\s*\\/\\s*100/i.test(node.textContent||''));
      return {
        title:document.title, ready:document.readyState, dashboard, inventory, detailHasExperience,
        slowmovers, capital, salesanalysis, salesFilters, purchaseDecisionFields,
        germanSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.primary)),
        englishSearch:Boolean(searchItem&&cardRecordMatchesSearch(searchItem,searchNames.secondary)),
        priceGuide:Boolean(Object.values(state.productCatalog||{}).some(row=>Number(row.low||row.avg1||row.avg7||row.avg30||row.trend)>0)),
        marketTrendBridge:typeof window.desktopApp?.getMarketDecisionHistory==='function',
        ownSalesBridge:typeof window.desktopApp?.getOwnSalesExperience==='function',
        ownSalesPrints:(ownSalesExperienceCache.records||[]).length,
        targetCaptured:target.originalTargetSell===5.99&&target.targetSell===5.99&&Boolean(target.historyEntry),
        decisionCostCorrect:decisionCost.decisionCost===1.75&&decisionCost.fullCost===1.94,
        noAutomaticPriceChange:(ownSalesExperienceCache.records||[]).every(row=>row.priceAction==='KEINE AUTOMATISCHE PREISÄNDERUNG'),
        noForbiddenClaim:!forbidden, databaseStatus,
        counts:{inventory:(state.inventory||[]).length,privateCards:(state.privateCollection||[]).length,purchases:(state.purchases||[]).length,sales:(state.sales||[]).length},
        rendererErrors
      };
    })()`);
    if (!result || !result.title?.includes('6.8.0') || result.ready !== 'complete' || !result.dashboard || !result.inventory || !result.detailHasExperience || !result.slowmovers || !result.capital || !result.salesanalysis || !result.salesFilters || !result.purchaseDecisionFields || !result.germanSearch || !result.englishSearch || !result.priceGuide || !result.marketTrendBridge || !result.ownSalesBridge || !result.targetCaptured || !result.decisionCostCorrect || !result.noAutomaticPriceChange || !result.noForbiddenClaim || result.databaseStatus?.schemaVersion !== 10 || result.rendererErrors?.length) {
      throw new Error(`PHASE-4-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    child.kill();
    await delay(700);
    fs.rmSync(qaData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    if (output.trim() && /error|exception|sqlite.*(?:malformed|corrupt)/i.test(output)) throw new Error(`Fehlerausgabe der gepackten App: ${output.trim()}`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
