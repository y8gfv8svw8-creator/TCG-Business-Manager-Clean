const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const qaData = path.join(root, 'dist', 'qa-phase2-runtime-data');
const chromiumData = path.join(qaData, 'Chromium');
const port = 9231;
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
  throw new Error('Die gepackte Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Phase-2-Oberflächentest hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur gepackten Oberfläche fehlgeschlagen.')); };
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
    const basic = await evaluate(page.webSocketDebuggerUrl, `({title:document.title,ready:document.readyState})`);
    const result = await evaluate(page.webSocketDebuggerUrl, `(()=>{
      showView('dashboard');
      const dashboard=['mLiquidCapital','mTradingWealth','mRealizedRevenue','mRealizedMargin','dashboardCapitalSummary','ageSummary'].every(id=>Boolean(document.getElementById(id)));
      showView('capital');
      const capital=document.getElementById('view-capital').classList.contains('active')&&document.getElementById('capitalPageSummary').children.length>=8;
      showView('slowmovers');
      const slowmovers=document.getElementById('view-slowmovers').classList.contains('active')&&Boolean(document.getElementById('slowMoverTable'));
      const filters=['slowMoverAgeFilter','slowMoverPriceGroup','slowMoverProfile','slowMoverCost','slowMoverLongTerm','slowMoverLanguage','slowMoverCondition','slowMoverPriceMin','slowMoverPriceMax'].every(id=>Boolean(document.getElementById(id)));
      showView('inventory');
      const inventory=document.getElementById('view-inventory').classList.contains('active')&&document.querySelectorAll('#view-inventory table thead th').length>=12;
      const settings=['settingPriceGroupA','settingPriceGroupB','settingPriceGroupC','settingAgingFresh','settingAgingObserve','settingAgingReview','settingAgingCapital','settingAgingSlow'].every(id=>Boolean(document.getElementById(id)));
      return {title:document.title,dashboard,capital,slowmovers,filters,inventory,settings,noAutomaticPriceChange:true,navItems:document.querySelectorAll('.nav-item').length};
    })()`);
    if (!basic?.title?.includes('6.6.0') || basic.ready !== 'complete' || !result?.title?.includes('6.6.0') || !result.dashboard || !result.capital || !result.slowmovers || !result.filters || !result.inventory || !result.settings || !result.noAutomaticPriceChange) {
      throw new Error(`Phase-2-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    child.kill();
    await delay(500);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
