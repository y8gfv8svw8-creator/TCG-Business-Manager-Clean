const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-usability-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9261;
fs.mkdirSync(chromiumData, { recursive: true });
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
  throw new Error('Die Bedienbarkeits-Prüfoberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Bedienbarkeits-Oberflächentest hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur Bedienbarkeits-Prüfoberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Bedienbarkeits-Oberfläche.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Electron-Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root, windowsHide: true, env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();await delay(1600);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const emptySafetyBlockerShown=Boolean(document.getElementById('emptyDatabaseSafetyBlocker'));
      document.querySelector('#emptyDatabaseSafetyBlocker button:last-child')?.click();
      for(let attempt=0;attempt<100&&typeof state==='undefined';attempt+=1)await new Promise(resolve=>setTimeout(resolve,50));
      const rendererErrors=[];window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      state.purchases=[{id:'purchase-task',orderNo:'100',status:'Eingetroffen',pendingItems:[{name:'Testkarte',quantity:1}]}];
      state.sales=[{id:'sale-task',orderNo:'200',customer:'Testkunde',date:'2026-08-22',status:'Bezahlt',workflowStage:'Kommissioniert',quantity:2,revenue:2,items:[{name:'Karte A',quantity:1,set:'SET1',rarity:'Rare'},{name:'Karte B',quantity:1,set:'SET2',rarity:'Common'}]}];
      showView('dashboard');renderDashboard();
      const dashboard={tasks:document.querySelectorAll('.workflow-task').length,taskPanel:Boolean(document.getElementById('workflowTasksOverview')),warningPanel:Boolean(document.getElementById('automationWarnings')),automationPanel:Boolean(document.getElementById('automationStatus')),financeExplanation:document.querySelector('.metric-explainer')?.textContent||''};
      openOrderDetails('sale','sale-task');
      document.getElementById('salePickAllBtn').click();
      const commissioning={checked:[...document.querySelectorAll('[data-pick-item]')].every(box=>box.checked),collapsed:document.getElementById('salePickListDetails').open===false,progress:document.getElementById('salePickProgress').textContent};
      document.getElementById('orderDetailDialog').close();
      state.sales[0].status='Kommissioniert';state.sales[0].workflowStage='Verpackt';openOrderDetails('sale','sale-task');
      const postCommission={cardList:Boolean(document.querySelector('.order-card-list')),collapsed:document.querySelector('.order-card-list')?.open===false};
      document.getElementById('orderDetailDialog').close();
      addInventory({});
      renderInventoryProductChoices([
        {productId:'101831',germanName:'Angehäufte Reichtümer',englishName:'Accumulated Fortune',setName:'Cyberdark Impact',collectorNumber:'CDIP-EN057',variant:'V.1',rarity:'Common'},
        {productId:'709793',germanName:'Angehäufte Reichtümer',englishName:'Accumulated Fortune',setName:'Cyberdark Impact',collectorNumber:'CDIP-EN057',variant:'V.1',rarity:'Common'}
      ]);
      const variants={languageNotice:document.querySelector('.variant-language-note')?.textContent||'',differenceNotes:[...document.querySelectorAll('.inventory-card-choice-row .inventory-card-choice small')].map(node=>node.textContent),cardmarketLinks:document.querySelectorAll('.variant-cardmarket-check').length,languageLabel:[...document.querySelectorAll('#modalFields label')].some(label=>label.textContent.includes('Kartensprache des Exemplars'))};
      document.getElementById('modal').close();
      state.inventory=[{id:'cost-edit-asset',productId:'741275',name:'Nibiru, das Urwesen',setName:'25th Anniversary Rarity Collection',collectorNumber:'RA01-EN015',rarity:'Secret Rare',language:'DE',condition:'NM',status:'Im Bestand',quantity:1,cardPrice:1.25,cost:0,costStatus:'unknown',listed:true,listingPrice:10}];
      const costGroup=getInventoryGroups()[0];editInventoryGroup(costGroup.key);
      const costField=document.querySelector('#modalFields [name="cost"]');const costStatusField=document.querySelector('#modalFields [name="costStatus"]');
      costField.value='7.35';document.getElementById('modalForm').requestSubmit();await new Promise(resolve=>setTimeout(resolve,500));
      const persisted=await window.desktopApp.loadState();const persistedItem=persisted.state.inventory.find(item=>item.id==='cost-edit-asset');
      const scenario=TcgBusinessAutomation.calculateSaleScenario(10,state.inventory[0],{feePercent:0,packaging:0});
      const costEdit={selectedStatus:costStatusField.value,memoryCost:state.inventory[0].cost,memoryStatus:state.inventory[0].costStatus,persistedCost:persistedItem?.cost,persistedStatus:persistedItem?.costStatus,cardPrice:persistedItem?.cardPrice,quantity:persistedItem?.quantity,inventoryCount:persisted.state.inventory.length,profit:scenario.expectedProfit,roi:scenario.roi};
      const importTotals={LON:69.89,TLM:44.46,EEN:19.21,EOJ:25.21,POTD:19.47,STON:166.78};
      state.inventory=Object.keys(importTotals).map((set,index)=>({id:'qa-price-'+set,collectorNumber:set+'-EN'+String(index+1).padStart(3,'0'),set,name:'Importkarte '+set,germanName:'Importkarte '+set,language:'Deutsch',status:'Im Bestand',cost:1,costStatus:'known',targetSell:2,originalTargetSell:2,cardPrice:.5,quantity:1,lotId:'qa-ankauf',purchaseDate:'2026-09-19',listingHistory:[]}));
      const importFiles=Object.entries(importTotals).map(([set,cost],index)=>new File(['Kartennummer;Deutscher Kartenname;Menge;Status;Anteiliger EK gesamt;Inserat je Karte;VK-Faktor optional;Erwarteter VK je Karte\\n'+set+'-DE'+String(index+1).padStart(3,'0')+';Importkarte '+set+';1;Offen;'+String(cost).replace('.',',')+';99;0,9;8,50\\n'],set+'.csv',{type:'text/csv'}));
      await openPurchasePriceImport(importFiles);
      const importPreview={dialogOpen:document.getElementById('purchasePriceImportDialog').open,enabled:!document.getElementById('purchasePriceImportConfirm').disabled,text:document.getElementById('purchasePriceImportContent').textContent};
      await confirmPurchasePriceImport();
      const importedState=await window.desktopApp.loadState();
      const purchasePriceImport={buttonVisible:Boolean(document.getElementById('purchasePriceImportBtn')),preview:importPreview.dialogOpen&&importPreview.enabled&&/345,02/.test(importPreview.text)&&/0,02/.test(importPreview.text)&&/Zusammengehörigen Ankauf erkannt/.test(importPreview.text),cost:importedState.state.inventory.find(item=>item.id==='qa-price-EOJ')?.cost,targetSell:importedState.state.inventory.find(item=>item.id==='qa-price-EOJ')?.targetSell,count:importedState.state.inventory.length,result:document.getElementById('purchasePriceImportContent').textContent};
      document.getElementById('purchasePriceImportDialog').close();
      const input=document.getElementById('globalSearch');document.getElementById('themeToggleBtn').focus();input.value='Vorhandener Text';input.focus();await new Promise(resolve=>setTimeout(resolve,80));
      const selection={start:input.selectionStart,end:input.selectionEnd,clearVisible:!document.querySelector('.active-field-clear').hidden};document.querySelector('.active-field-clear').click();selection.cleared=input.value==='';
      showView('cardmarket');
      const cacheButton=document.getElementById('cmRepairCacheBtn');
      const cacheRepairResult=await window.tcgRepairCardmarketCache();
      const cacheRepair={buttonVisible:Boolean(cacheButton&&!cacheButton.hidden),callable:typeof window.tcgRepairCardmarketCache==='function',ok:Boolean(cacheRepairResult?.database),status:document.getElementById('cmImportStatus')?.textContent||''};
      return {title:document.title,emptySafetyBlockerShown,dashboard,commissioning,postCommission,variants,costEdit,purchasePriceImport,selection,cacheRepair,rendererErrors};
    })()`);
    const valid = result && result.emptySafetyBlockerShown && result.dashboard?.tasks===2 && result.dashboard.taskPanel && result.dashboard.warningPanel && result.dashboard.automationPanel && /Cashflow/.test(result.dashboard.financeExplanation) && result.commissioning?.checked && result.commissioning?.collapsed && result.commissioning?.progress==='2/2 ausgewählt' && result.postCommission?.cardList && result.postCommission?.collapsed && /nicht automatisch/.test(result.variants?.languageNotice||'') && result.variants?.cardmarketLinks===2 && result.variants?.languageLabel && result.variants?.differenceNotes?.some(note=>/identisch/.test(note)) && result.costEdit?.selectedStatus==='Unverändert' && result.costEdit.memoryCost===7.35 && result.costEdit.memoryStatus==='known' && result.costEdit.persistedCost===7.35 && result.costEdit.persistedStatus==='known' && result.costEdit.cardPrice===1.25 && result.costEdit.quantity===1 && result.costEdit.inventoryCount===1 && result.costEdit.profit===2.65 && result.costEdit.roi===36.05 && result.purchasePriceImport?.buttonVisible && result.purchasePriceImport?.preview && result.purchasePriceImport.cost===25.21 && result.purchasePriceImport.targetSell===8.5 && result.purchasePriceImport.count===6 && /Import abgeschlossen/.test(result.purchasePriceImport.result) && result.selection?.start===0 && result.selection?.end===16 && result.selection?.clearVisible && result.selection?.cleared && result.cacheRepair?.buttonVisible && result.cacheRepair?.callable && result.cacheRepair?.ok && /Cache repariert/.test(result.cacheRepair.status) && !result.rendererErrors?.length;
    if(!valid)throw new Error(`Bedienbarkeits-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/uncaught|unhandled|sqlite.*(?:malformed|corrupt)/i.test(output))throw new Error(`Fehlerausgabe der Bedienbarkeits-Test-App: ${output.trim()}`);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
