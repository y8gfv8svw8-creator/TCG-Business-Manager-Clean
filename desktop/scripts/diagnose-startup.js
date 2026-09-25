const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { DatabaseSync } = require('node:sqlite');
const { TcgDatabase } = require('../app/main/database');

const root = path.resolve(__dirname, '..');
const sourceDatabase = process.argv[2] || path.join(os.homedir(), 'Documents', 'TCG Business Manager', 'Daten', 'tcg_business_manager.sqlite');
const electron = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-startup-diagnostic-'));
const chromiumRoot = path.join(tempRoot, 'Chromium');
const port = 9300 + Math.floor(Math.random() * 300);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function timed(results, name, operation, detail = {}) {
  const startedAt = performance.now();
  const value = operation();
  results.push({ name, durationMs: Number((performance.now() - startedAt).toFixed(2)), detail });
  return value;
}

async function waitForPage() {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(row => row.type === 'page' && String(row.url).startsWith('file:'));
      if (page) return page;
    } catch { /* Electron startet noch. */ }
    await delay(250);
  }
  throw new Error('Das Diagnosefenster wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Renderer-Diagnose hat zu lange gedauert.')); }, 120000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zum Diagnosefenster fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);
      socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text));
      resolve(message.result?.result?.value);
    };
  });
}

function inspectRealDatabase() {
  const results = [];
  const openStartedAt = performance.now();
  const db = new DatabaseSync(sourceDatabase, { readOnly: true, timeout: 5000 });
  results.push({ name: 'readonly_connection_opened', durationMs: Number((performance.now() - openStartedAt).toFixed(2)), detail: {} });
  try {
    const pageSize = Number(db.prepare('PRAGMA page_size').get()?.page_size || 0);
    const pageCount = Number(db.prepare('PRAGMA page_count').get()?.page_count || 0);
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => String(row.name)));
    const stateRow = timed(results, 'app_state_loaded', () => db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get());
    const state = timed(results, 'state_json_parsed', () => JSON.parse(stateRow?.state_json || '{}'), {
      bytes: Buffer.byteLength(stateRow?.state_json || '', 'utf8')
    });
    const snapshotCount = timed(results, 'snapshot_summary_expected_count', () => Number(db.prepare('SELECT COUNT(DISTINCT captured_date) AS count FROM market_prices').get()?.count || 0));
    const observationCount = timed(results, 'observation_summary_expected_count', () => Number(db.prepare(`
      SELECT COUNT(*) AS count FROM (
        SELECT source_id, observed_date FROM market_observations GROUP BY source_id, observed_date
      )
    `).get()?.count || 0));

    const businessCriticalTables = [
      'app_state', 'trade_orders', 'trade_lines', 'inventory_assets',
      'purchase_receipt_lines', 'inventory_listing_history',
      'capital_accounts', 'capital_ledger_entries',
      'collection_purchase_analyses', 'collection_purchase_items',
      'collection_purchase_decision_snapshots', 'collection_purchase_photos',
      'collection_physical_cards', 'collection_card_observations'
    ];
    for (const tableName of businessCriticalTables) {
      if (!tables.has(tableName)) continue;
      timed(results, `quick_check:${tableName}`, () => db.prepare(`PRAGMA quick_check(${tableName})`).all());
      timed(results, `foreign_key_check:${tableName}`, () => db.prepare(`PRAGMA foreign_key_check(${tableName})`).all());
    }
    return {
      results,
      state,
      databaseBytes: Number(fs.statSync(sourceDatabase).size || 0),
      walBytes: fs.existsSync(`${sourceDatabase}-wal`) ? Number(fs.statSync(`${sourceDatabase}-wal`).size || 0) : 0,
      pageSize,
      pageCount,
      snapshotCount,
      observationCount
    };
  } finally {
    db.close();
  }
}

function prepareIsolatedDatabase(state) {
  fs.mkdirSync(chromiumRoot, { recursive: true });
  const diagnosticState = structuredClone(state);
  diagnosticState.settings = { ...(diagnosticState.settings || {}), autoBackup: false };
  diagnosticState.sync = { ...(diagnosticState.sync || {}), autoFolder: false, autoPrices: false };
  diagnosticState.cardmarket = { ...(diagnosticState.cardmarket || {}), germanNamesAutoUpdate: false };
  const database = new TcgDatabase({
    databasePath: path.join(tempRoot, 'Daten', 'tcg_business_manager.sqlite'),
    schemaPath: path.join(root, 'database', 'schema.sql'),
    backupRoot: path.join(tempRoot, 'Backups')
  }).open();
  try {
    database.saveState(diagnosticState, { allowDestructiveReset: true });
  } finally {
    database.close();
  }
}

async function inspectRenderer() {
  const childEnv = { ...process.env, TCG_MANAGER_DATA_ROOT: tempRoot, TCG_STARTUP_DIAGNOSTICS: '1' };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  const child = spawn(electron, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumRoot}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root,
    windowsHide: true,
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();
    let rendererReady = false;
    for (let attempt = 0; attempt < 120 && !rendererReady; attempt += 1) {
      await delay(100);
      try {
        rendererReady = Boolean(await evaluate(page.webSocketDebuggerUrl, 'Boolean(window.desktopApp && window.__TCG_STARTUP_DIAGNOSTICS__)'));
      } catch { /* Der Ausführungskontext kann während der Navigation kurz wechseln. */ }
    }
    if (!rendererReady) throw new Error('Die instrumentierte Renderer-Oberfläche wurde nicht bereit.');
    const renderer = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      for(let attempt=0;attempt<240&&(typeof showView!=='function'||!document.getElementById('settingFee'));attempt+=1)await new Promise(resolve=>setTimeout(resolve,10));
      showView('settings');
      const earlyInput=document.getElementById('settingFee');
      earlyInput.value='987.65';
      earlyInput.focus();
      earlyInput.dispatchEvent(new Event('input',{bubbles:true}));
      const earlyInputStartedAt=performance.now();
      for(let attempt=0;attempt<240&&!window.__TCG_STARTUP_DIAGNOSTICS__?.complete;attempt+=1)await new Promise(resolve=>setTimeout(resolve,50));
      await new Promise(resolve=>setTimeout(resolve,4500));
      const earlyInputCheck={connected:earlyInput.isConnected,focused:document.activeElement===earlyInput,value:earlyInput.value,expectedSentinel:'987.65',elapsedMs:Number((performance.now()-earlyInputStartedAt).toFixed(2))};
      const input=document.getElementById('globalSearch');
      input.value='Diagnose-Eingabe';
      input.focus();
      input.dispatchEvent(new Event('input',{bubbles:true}));
      const originalInput=input;
      let largestHeartbeatGap=0,lastHeartbeat=performance.now();
      const heartbeat=setInterval(()=>{const now=performance.now();largestHeartbeatGap=Math.max(largestHeartbeatGap,now-lastHeartbeat);lastHeartbeat=now;},25);
      await new Promise(resolve=>setTimeout(resolve,2500));
      clearInterval(heartbeat);
      const styles=getComputedStyle(input);
      const dialogs=[...document.querySelectorAll('dialog[open]')].map(node=>node.id||node.className||'dialog');
      const fields=[...document.querySelectorAll('input,textarea,select')];
      const main=await window.desktopApp.getStartupDiagnostics();
      return {
        renderer:window.__TCG_STARTUP_DIAGNOSTICS__,main,
        earlyInputCheck,inputCheck:{connected:originalInput.isConnected,focused:document.activeElement===originalInput,value:originalInput.value,pointerEvents:styles.pointerEvents,disabled:originalInput.disabled,readOnly:originalInput.readOnly,largestHeartbeatGap:Number(largestHeartbeatGap.toFixed(2))},
        openDialogs:dialogs,
        disabledFields:fields.filter(node=>node.disabled).map(node=>node.id||node.name||node.tagName),
        readOnlyFields:fields.filter(node=>node.readOnly).map(node=>node.id||node.name||node.tagName)
      };
    })()`);
    if (!renderer) throw new Error(`Die Renderer-Diagnose lieferte kein Ergebnis. Prozessausgabe: ${output}`);
    return { renderer, output };
  } finally {
    child.kill();
    await delay(700);
  }
}

async function main() {
  if (!fs.existsSync(sourceDatabase)) throw new Error(`Echte SQLite-Datenbank nicht gefunden: ${sourceDatabase}`);
  if (!fs.existsSync(electron)) throw new Error(`Electron fehlt: ${electron}`);
  const realDatabase = inspectRealDatabase();
  prepareIsolatedDatabase(realDatabase.state);
  const ui = await inspectRenderer();
  const rendererTimings = ui.renderer.renderer?.timings || [];
  const mainTimings = ui.renderer.main?.timings || [];
  const pick = (rows, name) => rows.filter(row => row.name === name);
  const processErrors = ui.output.split(/\r?\n/).filter(line => line && !/startup-diagnostic|DevTools listening|ExperimentalWarning|trace-warnings/.test(line));
  const compact = {
    realDatabase: {
      databaseBytes: realDatabase.databaseBytes,
      walBytes: realDatabase.walBytes,
      stateBytes: realDatabase.results.find(row => row.name === 'state_json_parsed')?.detail?.bytes || 0,
      measurements: realDatabase.results,
      snapshotCount: realDatabase.snapshotCount,
      observationCount: realDatabase.observationCount
    },
    milestones: {
      appReady: pick(mainTimings, 'app_ready'),
      windowCreated: pick(mainTimings, 'window_created'),
      windowReadyToShow: pick(mainTimings, 'window_ready_to_show'),
      sqliteOpen: pick(mainTimings, 'sqlite_open_total'),
      appStateLoaded: pick(mainTimings, 'app_state_loaded'),
      stateJsonParsed: pick(mainTimings, 'state_json_parsed'),
      referenceDatabaseReady: pick(mainTimings, 'print_reference_database_ready'),
      uiInitialized: pick(rendererTimings, 'ui_initialized'),
      firstPageFullyRendered: pick(rendererTimings, 'first_page_fully_rendered')
    },
    blockers: {
      mainEventLoop: pick(mainTimings, 'main_event_loop_blocked'),
      saveTotals: pick(mainTimings, 'save_state_total'),
      saveMaterialization: pick(mainTimings, 'save_state_materialized'),
      rendererLongTasks: ui.renderer.renderer?.longTasks || [],
      viewRenders: pick(rendererTimings, 'active_view_rendered')
    },
    cache: {
      folderIndexedDb: [...pick(rendererTimings, 'indexeddb_sync_handle_ready'), ...pick(rendererTimings, 'indexeddb_sync_handle_failed')],
      cardmarketIndexedDb: [...pick(rendererTimings, 'indexeddb_cardmarket_cache_ready'), ...pick(rendererTimings, 'indexeddb_cardmarket_cache_failed')]
    },
    usability: {
      earlyInputCheck: ui.renderer.earlyInputCheck,
      inputCheck: ui.renderer.inputCheck,
      openDialogs: ui.renderer.openDialogs,
      disabledFields: ui.renderer.disabledFields,
      readOnlyFields: ui.renderer.readOnlyFields,
      settledSnapshot: pick(rendererTimings, 'startup_settled_snapshot')
    },
    processErrors
  };
  process.stdout.write(`${JSON.stringify(compact, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => {
  const safePrefix = `${path.resolve(os.tmpdir())}${path.sep}`.toLowerCase();
  const resolvedTemp = path.resolve(tempRoot).toLowerCase();
  if (resolvedTemp.startsWith(safePrefix) && path.basename(resolvedTemp).startsWith('tcg-startup-diagnostic-')) {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
});
