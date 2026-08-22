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
      const input=document.getElementById('globalSearch');document.getElementById('themeToggleBtn').focus();input.value='Vorhandener Text';input.focus();await new Promise(resolve=>setTimeout(resolve,80));
      const selection={start:input.selectionStart,end:input.selectionEnd,clearVisible:!document.querySelector('.active-field-clear').hidden};document.querySelector('.active-field-clear').click();selection.cleared=input.value==='';
      return {title:document.title,dashboard,commissioning,postCommission,variants,selection,rendererErrors};
    })()`);
    const valid = result && result.dashboard?.tasks===2 && result.dashboard.taskPanel && result.dashboard.warningPanel && result.dashboard.automationPanel && /Cashflow/.test(result.dashboard.financeExplanation) && result.commissioning?.checked && result.commissioning?.collapsed && result.commissioning?.progress==='2/2 ausgewählt' && result.postCommission?.cardList && result.postCommission?.collapsed && /nicht automatisch/.test(result.variants?.languageNotice||'') && result.variants?.cardmarketLinks===2 && result.variants?.languageLabel && result.variants?.differenceNotes?.some(note=>/identisch/.test(note)) && result.selection?.start===0 && result.selection?.end===16 && result.selection?.clearVisible && result.selection?.cleared && !result.rendererErrors?.length;
    if(!valid)throw new Error(`Bedienbarkeits-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/uncaught|unhandled|sqlite.*(?:malformed|corrupt)/i.test(output))throw new Error(`Fehlerausgabe der Bedienbarkeits-Test-App: ${output.trim()}`);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
