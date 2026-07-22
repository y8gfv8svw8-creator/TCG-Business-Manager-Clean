const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const executable = path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const qaData = path.join(root, 'dist', 'qa-runtime-data');
const port = 9227;
fs.mkdirSync(qaData, { recursive: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPage() {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(row => row.type === 'page' && String(row.url).startsWith('file:'));
      if (page) return page;
    } catch {}
    await delay(250);
  }
  throw new Error('Die Desktop-Oberfläche hat den Testport nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Oberflächenprüfung hat zu lange gedauert.')); }, 15000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur Desktop-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.text || 'JavaScript-Fehler in der Oberfläche.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, [`--remote-debugging-port=${port}`], {
    cwd: path.dirname(executable), windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: 'ignore'
  });
  try {
    const page = await waitForPage();
    await delay(1200);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      renderAll();
      showView('inventory');
      const inventoryActive=document.getElementById('view-inventory').classList.contains('active');
      showView('reports');
      return {
        ready:document.readyState,
        title:document.title,
        sqliteStatus:document.getElementById('saveStatus')?.textContent||'',
        navigation:document.querySelectorAll('.nav-item').length,
        inventoryActive,
        reportsActive:document.getElementById('view-reports').classList.contains('active'),
        filterPanels:document.querySelectorAll('.filter-panel').length,
        hasCashflow:Boolean(document.getElementById('mMonthlyProfit')),
        hasScanner:Boolean(document.getElementById('scanInventoryBtn')&&document.getElementById('scanPrivateBtn')),
        desktopBridge:typeof window.desktopApp?.saveState==='function'
      };
    })()`);
    if (!result || result.ready !== 'complete' || !result.inventoryActive || !result.reportsActive || !result.hasCashflow || !result.hasScanner || !result.desktopBridge) {
      throw new Error(`Desktop-Prüfung unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    child.kill();
    await delay(500);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
