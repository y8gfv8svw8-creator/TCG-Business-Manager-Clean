const { execFileSync, spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const electron = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const port = 9400 + (process.pid % 300);
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function parseArguments(argv) {
  const values = { split: 'all', detectionsOnly: false, debugCandidates: false, maxDimension: 480 };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--images') values.images = argv[++index];
    else if (token === '--ground-truth') values.groundTruth = argv[++index];
    else if (token === '--split') values.split = argv[++index];
    else if (token === '--output') values.output = argv[++index];
    else if (token === '--baseline') values.baseline = argv[++index];
    else if (token === '--detector-git-ref') values.detectorGitRef = String(argv[++index] || '').trim();
    else if (token === '--sha256-prefix') values.sha256Prefix = String(argv[++index] || '').toLowerCase();
    else if (token === '--max-dimension') values.maxDimension = Math.max(320, Math.min(1200, Number(argv[++index] || 480)));
    else if (token === '--debug-candidates') values.debugCandidates = true;
    else if (token === '--detections-only') values.detectionsOnly = true;
    else throw new Error(`Unbekannter Parameter: ${token}`);
  }
  if (!values.images) throw new Error('Bitte --images <Ordner> angeben.');
  if (!values.detectionsOnly && !values.groundTruth) throw new Error('Bitte --ground-truth <JSON> angeben oder --detections-only verwenden.');
  if (!['all', 'development', 'holdout'].includes(values.split)) throw new Error('--split muss all, development oder holdout sein.');
  return values;
}

function findUniqueImages(directory) {
  const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  const pending = [path.resolve(directory)];
  const byHash = new Map();
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(fullPath);
      else if (entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase())) {
        const bytes = fs.readFileSync(fullPath);
        const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
        if (!byHash.has(sha256)) byHash.set(sha256, { sha256, fullPath, bytes, fileName: entry.name });
      }
    }
  }
  return [...byHash.values()].sort((left, right) => left.sha256.localeCompare(right.sha256));
}

function readGroundTruth(filePath) {
  const parsed = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  if (!Array.isArray(parsed.images)) throw new Error('Ground-Truth-Datei muss ein images-Array enthalten.');
  const rows = new Map();
  parsed.images.forEach(row => {
    const sha256 = String(row.sha256 || '').toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(sha256)) throw new Error('Jeder Ground-Truth-Eintrag braucht einen vollständigen SHA-256.');
    if (!['development', 'holdout'].includes(row.split)) throw new Error(`Ungültiger Split für ${sha256.slice(0, 12)}.`);
    const annotations = Array.isArray(row.annotations) ? row.annotations : Array.isArray(row.boxes) ? row.boxes : null;
    if (!annotations) throw new Error(`Karten-Annotationen fehlen für ${sha256.slice(0, 12)}.`);
    rows.set(sha256, { ...row, sha256, annotations, category: String(row.category || 'Uncategorized') });
  });
  return rows;
}

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
  throw new Error('Prüfoberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close();reject(new Error('Auswertung hat zu lange gedauert.')); }, 90000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer);reject(new Error('Verbindung zur Prüfoberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text));
      resolve(message.result?.result?.value);
    };
  });
}

function aggregate(rows) {
  const totals = rows.reduce((result, row) => {
    const metrics = row.metrics;
    result.images += 1;result.expectedCards += metrics.expectedCards;result.detectedCards += metrics.detectedCards;
    result.truePositives += metrics.truePositives;result.falsePositives += metrics.falsePositives;result.falseNegatives += metrics.falseNegatives;
    result.innerCropDetections += metrics.innerCropDetections;
    result.iouSum += metrics.meanIoU * metrics.matches.length;
    result.coverageSum += metrics.meanCoverage * metrics.matches.length;
    result.areaRatioSum += metrics.meanAreaRatio * metrics.matches.length;
    if (metrics.meanPolygonIoU !== null) { result.polygonIouSum += metrics.meanPolygonIoU * metrics.polygonMatchCount;result.polygonMatches += metrics.polygonMatchCount; }
    result.matches += metrics.matches.length;
    return result;
  }, { images: 0, expectedCards: 0, detectedCards: 0, truePositives: 0, falsePositives: 0, falseNegatives: 0, innerCropDetections: 0, iouSum: 0, coverageSum: 0, areaRatioSum: 0, polygonIouSum: 0, polygonMatches: 0, matches: 0 });
  const precision = totals.detectedCards ? totals.truePositives / totals.detectedCards : totals.expectedCards ? 0 : 1;
  const recall = totals.expectedCards ? totals.truePositives / totals.expectedCards : totals.detectedCards ? 0 : 1;
  return {
    images: totals.images,
    expectedCards: totals.expectedCards,
    detectedCards: totals.detectedCards,
    truePositives: totals.truePositives,
    falsePositives: totals.falsePositives,
    falseNegatives: totals.falseNegatives,
    innerCropDetections: totals.innerCropDetections,
    precision,
    recall,
    f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
    meanIoU: totals.matches ? totals.iouSum / totals.matches : 0,
    meanCoverage: totals.matches ? totals.coverageSum / totals.matches : 0,
    meanAreaRatio: totals.matches ? totals.areaRatioSum / totals.matches : 0,
    meanPolygonIoU: totals.polygonMatches ? totals.polygonIouSum / totals.polygonMatches : null,
    polygonMatchCount: totals.polygonMatches
  };
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (!fs.existsSync(electron)) throw new Error(`Electron fehlt: ${electron}`);
  const images = findUniqueImages(args.images);
  const groundTruth = args.detectionsOnly ? new Map() : readGroundTruth(args.groundTruth);
  const selected = images.filter(image => {
    const truth = groundTruth.get(image.sha256);
    return (!args.sha256Prefix || image.sha256.startsWith(args.sha256Prefix))
      && (args.detectionsOnly || (truth && (args.split === 'all' || truth.split === args.split)));
  });
  if (!selected.length) throw new Error('Keine passenden eindeutigen Prüfbilder gefunden.');
  const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-real-collection-eval-'));
  const chromiumData = path.join(qaData, 'Chromium');
  fs.mkdirSync(chromiumData, { recursive: true });
  const child = spawn(electron, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root, windowsHide: true, env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let appOutput = '';
  child.stdout.on('data', chunk => { appOutput += chunk.toString(); });
  child.stderr.on('data', chunk => { appOutput += chunk.toString(); });
  try {
    const page = await waitForPage();
    await delay(1500);
    if (args.detectorGitRef) {
      const detectorSource = execFileSync('git', ['show', `${args.detectorGitRef}:desktop/app/shared/scanner-image-processing.js`], {
        cwd: path.resolve(root, '..'), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024
      });
      const replaced = await evaluate(page.webSocketDebuggerUrl, `(async()=>{const currentEvaluation=window.TcgScannerImageProcessing?.evaluateCollectionDetections;(0,eval)(${JSON.stringify(detectorSource)});window.__tcgCurrentCollectionEvaluation=currentEvaluation;return Boolean(window.TcgScannerImageProcessing?.detectCollectionCardsFromDataUrl&&window.__tcgCurrentCollectionEvaluation);})()`);
      if (!replaced) throw new Error(`Detection-Code aus Git-Stand ${args.detectorGitRef} konnte nicht geladen werden.`);
    }
    const rows = [];
    for (const image of selected) {
      const mimeType = path.extname(image.fileName).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${image.bytes.toString('base64')}`;
      const truth = groundTruth.get(image.sha256);
      const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
        const detection=await TcgScannerImageProcessing.detectCollectionCardsFromDataUrl(${JSON.stringify(dataUrl)},{debugCandidates:${args.detectionsOnly || args.debugCandidates ? 'true' : 'false'},maxDimension:${args.maxDimension}});
        const expected=${JSON.stringify(truth?.annotations || [])};
        const metrics=(window.__tcgCurrentCollectionEvaluation||TcgScannerImageProcessing.evaluateCollectionDetections)(expected,detection.detections,{iouThreshold:.45,minimumCoverage:.72,maximumAreaRatio:1.60,strictOuterBoxes:true});
        return {detections:detection.detections,photoQuality:detection.photoQuality,sceneAnalysis:detection.sceneAnalysis,parameters:detection.parameters,imageWidth:detection.imageWidth,imageHeight:detection.imageHeight,metrics};
      })()`);
      rows.push({ sha256: image.sha256, split: truth?.split || '', category: truth?.category || 'Uncategorized', expectedAnnotations: truth?.annotations || [], ...result });
    }
    const report = {
      formatVersion: 1,
      appVersion: require('../package.json').version,
      source: 'explicit-local-real-photo-set',
      uniqueSourceImages: images.length,
      selectedSplit: args.split,
      detectionsOnly: args.detectionsOnly,
      detectorGitRef: args.detectorGitRef || '',
      summary: args.detectionsOnly ? null : aggregate(rows),
      summaryByCategory: args.detectionsOnly ? null : Object.fromEntries([...new Set(rows.map(row => row.category))].sort().map(category => [category, aggregate(rows.filter(row => row.category === category))])),
      images: rows
    };
    if (args.baseline && report.summary) {
      const baseline = JSON.parse(fs.readFileSync(path.resolve(args.baseline), 'utf8'));
      report.comparisonToBaseline = Object.fromEntries(['precision', 'recall', 'f1', 'meanIoU', 'meanCoverage', 'meanAreaRatio', 'meanPolygonIoU'].map(key => [key, report.summary[key] == null ? null : report.summary[key] - Number(baseline.summary?.[key] || 0)]));
    }
    const serialized = `${JSON.stringify(report, null, 2)}\n`;
    if (args.output) fs.writeFileSync(path.resolve(args.output), serialized, 'utf8');
    process.stdout.write(serialized);
  } finally {
    child.kill();await delay(600);fs.rmSync(qaData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    if (/sqlite.*(?:malformed|corrupt)|uncaught|unhandled/i.test(appOutput)) throw new Error(`Fehlerausgabe der Prüf-App: ${appOutput.trim()}`);
  }
}

main().catch(error => { console.error(error);process.exitCode = 1; });
