const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const root = path.resolve(__dirname, '..');
const electron = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const port = 9860 + (process.pid % 100);
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function argumentsFrom(argv) {
  const result = { dataRoot: '', limit: 0, debugDir: '' };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--data-root') result.dataRoot = argv[++index];
    else if (argv[index] === '--limit') result.limit = Math.max(0, Number(argv[++index] || 0));
    else if (argv[index] === '--debug-dir') result.debugDir = path.resolve(argv[++index]);
    else throw new Error(`Unbekannter Parameter: ${argv[index]}`);
  }
  if (!result.dataRoot) throw new Error('Bitte --data-root <TCG-Business-Manager-Ordner> angeben.');
  return result;
}

function loadCases(dataRoot, limit = 0) {
  const resolvedRoot = path.resolve(dataRoot);
  const databasePath = path.join(resolvedRoot, 'Daten', 'tcg_business_manager.sqlite');
  const database = new DatabaseSync(databasePath, { readOnly: true });
  let state;
  try {
    state = JSON.parse(database.prepare('SELECT state_json AS stateJson FROM app_state WHERE id = 1').get()?.stateJson || '{}');
  } finally {
    database.close();
  }
  const cases = [];
  for (const analysis of Array.isArray(state.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : []) {
    const photos = new Map((Array.isArray(analysis.photos) ? analysis.photos : []).map(photo => [String(photo.id), photo]));
    for (const observation of Array.isArray(analysis.photoObservations) ? analysis.photoObservations : []) {
      if (!observation?.boundingBox || observation.detectionReviewState === 'rejected') continue;
      const photo = photos.get(String(observation.photoId));
      if (!photo?.relativePath) continue;
      const imagePath = path.resolve(resolvedRoot, String(photo.relativePath));
      if (!imagePath.startsWith(`${resolvedRoot}${path.sep}`) || !fs.existsSync(imagePath)) continue;
      cases.push({
        analysisId: String(analysis.id || ''),
        observationId: String(observation.id || ''),
        imagePath,
        observation: {
          boundingBox: observation.boundingBox,
          quadrilateral: observation.quadrilateral || null,
          detectionSignals: observation.detectionSignals || {}
        },
        confirmedName: observation.nameConfidence === 'confirmed' ? String(observation.selectedName || '') : ''
      });
    }
  }
  return limit ? cases.slice(0, limit) : cases;
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
  throw new Error('Die Realfoto-Prüfung wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close();reject(new Error('Eine Realfoto-Prüfung hat zu lange gedauert.')); }, 240000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer);reject(new Error('Verbindung zur Realfoto-Prüfung fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text));
      resolve(message.result?.result?.value);
    };
  });
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function main() {
  const args = argumentsFrom(process.argv.slice(2));
  const cases = loadCases(args.dataRoot, args.limit);
  if (!cases.length) throw new Error('Keine gespeicherten Realfoto-Kartenflächen gefunden.');
  const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-real-print-eval-'));
  const chromiumData = path.join(qaData, 'Chromium');
  fs.mkdirSync(chromiumData, { recursive: true });
  const child = spawn(electron, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root,
    windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let appOutput = '';
  child.stdout.on('data', chunk => { appOutput += chunk.toString(); });
  child.stderr.on('data', chunk => { appOutput += chunk.toString(); });
  const results = [];
  if (args.debugDir) fs.mkdirSync(args.debugDir, { recursive: true });
  try {
    const page = await waitForPage();
    await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const deadline=Date.now()+30000;
      while(Date.now()<deadline){
        const blocker=document.getElementById("emptyDatabaseSafetyBlocker");
        if(blocker)blocker.querySelector("button:last-child")?.click();
        if(window.TcgScannerImageProcessing?.prepareCollectionObservationRecognitionPayload&&window.desktopApp?.recognizeCollectionCardName)return true;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      throw new Error("Scanner-Oberfläche wurde nicht initialisiert.");
    })()`);
    for (const item of cases) {
      const dataUrl = `data:${mimeType(item.imagePath)};base64,${fs.readFileSync(item.imagePath).toString('base64')}`;
      const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
        const prepared=await TcgScannerImageProcessing.prepareCollectionObservationRecognitionPayload(${JSON.stringify(dataUrl)},${JSON.stringify(item.observation)});
        if(prepared.skipRecognition)return {skipped:true,skipReason:prepared.skipReason||"geometry"};
        const recognized=await desktopApp.recognizeCollectionCardName(prepared);
        return {skipped:false,cropInfo:prepared.cropInfo||null,debugPasses:${args.debugDir ? 'prepared.passes.filter(pass=>pass.kind==="setCode").map(pass=>({variant:pass.variant,imageDataUrl:pass.imageDataUrl}))' : '[]'},printRecognition:recognized.printRecognition,ocr:recognized.ocr};
      })()`);
      if (args.debugDir) {
        for (const pass of result.debugPasses || []) {
          const encoded = String(pass.imageDataUrl || '').split(',')[1] || '';
          if (encoded) fs.writeFileSync(path.join(args.debugDir, `${results.length}-${String(pass.variant).replace(/[^a-z0-9-]+/gi, '_')}.png`), Buffer.from(encoded, 'base64'));
        }
        delete result.debugPasses;
      }
      results.push({ analysisId: item.analysisId, observationId: item.observationId, confirmedName: item.confirmedName, ...result });
    }
  } finally {
    child.kill();
    await delay(700);
    fs.rmSync(qaData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
  if (/sqlite.*(?:malformed|corrupt)|uncaught|unhandled|typeerror|referenceerror/i.test(appOutput)) throw new Error(appOutput.trim());

  const evaluated = results.filter(row => !row.skipped);
  const withSetCode = evaluated.filter(row => row.printRecognition?.setCode);
  const normalizeName = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const confirmedCases = evaluated.filter(row => row.confirmedName);
  const acceptedWithConfirmedName = withSetCode.filter(row => row.confirmedName);
  const falseAccepted = acceptedWithConfirmedName.filter(row => {
    const expected = normalizeName(row.confirmedName);
    const candidates = [
      ...(row.printRecognition?.referenceCandidates || []),
      ...(row.printRecognition?.variantCandidates || [])
    ];
    return !candidates.some(candidate => [candidate.germanName, candidate.englishName].some(name => normalizeName(name) === expected));
  });
  const category = row => {
    const recognition = row.printRecognition || {};
    if (!recognition.setCode) return 'unresolved';
    if (recognition.requiresRaritySelection) return 'rarity_selection';
    if (recognition.requiresVersionSelection) return 'version_selection';
    if (recognition.resolutionStatus === 'unique_candidate') return 'unique';
    return 'unresolved';
  };
  const counts = Object.fromEntries(['unique', 'rarity_selection', 'version_selection', 'unresolved'].map(key => [key, evaluated.filter(row => category(row) === key).length]));
  process.stdout.write(`${JSON.stringify({
    source: 'stored-real-collection-photos-read-only',
    hasGroundTruth: confirmedCases.length > 0,
    groundTruthCount: confirmedCases.length,
    note: 'Trefferquote bezeichnet den Anteil mit lokal referenzvalidiertem OCR-Setcode. Inhaltliche Richtigkeit wird nur bei manuell bestätigtem Kartennamen bewertet.',
    totalObservations: results.length,
    geometricallySkipped: results.length - evaluated.length,
    evaluated: evaluated.length,
    setCodeOcrHits: withSetCode.length,
    setCodeOcrHitRatePercent: evaluated.length ? Math.round(withSetCode.length / evaluated.length * 1000) / 10 : 0,
    averageSetCodeConfidence: withSetCode.length ? Math.round(withSetCode.reduce((sum, row) => sum + Number(row.printRecognition.setCodeConfidence || 0), 0) / withSetCode.length * 10) / 10 : null,
    uniquelyResolved: counts.unique,
    raritySelectionRequired: counts.rarity_selection,
    versionSelectionRequired: counts.version_selection,
    ambiguousSetCodes: evaluated.filter(row => row.printRecognition?.resolutionStatus === 'ambiguous_ocr_set_code').length,
    detailPhotoNeeded: evaluated.filter(row => row.printRecognition?.detailPhotoStatus === 'detail-photo-needed').length,
    acceptedWithConfirmedName: acceptedWithConfirmedName.length,
    falseAcceptedSetCodes: falseAccepted.length,
    unverifiedAcceptedSetCodes: withSetCode.length - acceptedWithConfirmedName.length,
    unresolved: counts.unresolved,
    cropInfo: evaluated.slice(0, 10).map(row => ({ observationId: row.observationId, cropInfo: row.cropInfo })),
    rawSetCodeReadings: evaluated.flatMap(row => (row.ocr?.regionResults || [])
      .filter(reading => reading.kind === 'setCode' && String(reading.text || '').trim())
      .map(reading => ({ observationId: row.observationId, text: reading.text, confidence: reading.confidence, variant: reading.variant }))).slice(0, 80),
    setCodeSignals: withSetCode.map(row => ({ observationId: row.observationId, setCode: row.printRecognition.setCode, confidence: row.printRecognition.setCodeConfidence, validationStatus: row.printRecognition.setCodeValidationStatus, resolutionStatus: row.printRecognition.resolutionStatus }))
  }, null, 2)}\n`);
}

main().catch(error => { console.error(error);process.exitCode = 1; });
