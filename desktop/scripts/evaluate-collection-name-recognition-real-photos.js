const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const recognition = require('../app/shared/scanner-recognition');
const nameEvaluation = require('../app/shared/collection-name-evaluation');

const root = path.resolve(__dirname, '..');
const electron = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const port = 9560 + (process.pid % 300);
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

function parseArguments(argv) {
  const values = { split: 'all', summaryOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--images') values.images = argv[++index];
    else if (token === '--database') values.database = argv[++index];
    else if (token === '--ground-truth') values.groundTruth = argv[++index];
    else if (token === '--ground-truth-base64') values.groundTruthBase64 = argv[++index];
    else if (token === '--split') values.split = argv[++index];
    else if (token === '--output') values.output = argv[++index];
    else if (token === '--debug-crops') values.debugCrops = argv[++index];
    else if (token === '--summary-only') values.summaryOnly = true;
    else throw new Error(`Unbekannter Parameter: ${token}`);
  }
  if (!values.images) throw new Error('Bitte --images <Ordner> angeben.');
  if (!values.database) throw new Error('Bitte --database <SQLite-Datei> angeben.');
  if (!values.groundTruth && !values.groundTruthBase64) throw new Error('Bitte Ground Truth als Datei oder Base64 angeben.');
  if (!['all', 'development', 'holdout'].includes(values.split)) throw new Error('--split muss all, development oder holdout sein.');
  return values;
}

function parseGroundTruth(args) {
  const source = args.groundTruthBase64
    ? Buffer.from(args.groundTruthBase64, 'base64').toString('utf8')
    : fs.readFileSync(path.resolve(args.groundTruth), 'utf8');
  const parsed = JSON.parse(source);
  if (!Array.isArray(parsed.images)) throw new Error('Ground Truth benötigt ein images-Array.');
  return parsed.images.flatMap(image => {
    if (!['development', 'holdout'].includes(image.split)) throw new Error(`Ungültiger Split für ${image.relativePath || image.fileName}.`);
    const imagePath = path.resolve(args.images, image.relativePath || image.fileName || '');
    if (!fs.existsSync(imagePath)) throw new Error(`Testfoto fehlt: ${imagePath}`);
    return (Array.isArray(image.annotations) ? image.annotations : []).map((annotation, index) => ({
      imagePath,
      imageName: path.basename(imagePath),
      imageSha256: crypto.createHash('sha256').update(fs.readFileSync(imagePath)).digest('hex'),
      split: image.split,
      scene: String(image.scene || 'unknown'),
      category: String(image.category || 'Uncategorized'),
      language: String(annotation.language || image.language || 'unknown').toLowerCase(),
      expectedName: String(annotation.name || '').trim(),
      expectedMetacardId: String(annotation.metacardId || '').trim(),
      expectedPasscode: recognition.normalizePasscode(annotation.passcode || ''),
      annotationIndex: index,
      observation: {
        boundingBox: annotation.boundingBox || annotation.box,
        quadrilateral: annotation.quadrilateral || null,
        rotation: Number(annotation.rotation || 0),
        detectionConfidence: String(annotation.detectionConfidence || 'unknown'),
        detectionScore: Number.isFinite(Number(annotation.detectionScore)) ? Number(annotation.detectionScore) : null,
        sceneComplexity: String(image.sceneComplexity || '')
      }
    }));
  }).filter(row => args.split === 'all' || row.split === args.split);
}

function loadRecognitionIndex(databasePath) {
  const database = new DatabaseSync(path.resolve(databasePath), { readOnly: true });
  try {
    const rows = database.prepare(`
      SELECT m.metacard_id AS metacardId, m.name_de AS germanName, m.name_en AS englishName
      FROM card_name_mappings m
      WHERE EXISTS (SELECT 1 FROM products p WHERE p.metacard_id = m.metacard_id)
      ORDER BY CAST(m.metacard_id AS INTEGER)
    `).all();
    const byId = new Map(rows.map(row => [String(row.metacardId), { ...row, aliases: [], setCodes: [], passcodes: [], artworkFingerprints: [] }]));
    for (const row of database.prepare('SELECT metacard_id AS metacardId, language, alias FROM card_aliases ORDER BY metacard_id, language, alias').iterate()) {
      byId.get(String(row.metacardId))?.aliases.push({ language: row.language, alias: row.alias });
    }
    for (const row of database.prepare(`
      SELECT DISTINCT metacard_id AS metacardId, set_code AS setCode, collector_number AS collectorNumber
      FROM products WHERE NULLIF(metacard_id, '') IS NOT NULL
    `).iterate()) {
      const entry = byId.get(String(row.metacardId));
      if (!entry) continue;
      for (const value of [row.setCode, row.collectorNumber]) {
        const normalized = recognition.normalizeSetCode(value);
        if (normalized && !entry.setCodes.includes(normalized)) entry.setCodes.push(normalized);
      }
    }
    const stateRow = database.prepare('SELECT state_json AS stateJson FROM app_state WHERE id = 1').get();
    let state = {};
    try { state = JSON.parse(stateRow?.stateJson || '{}'); } catch {}
    for (const row of Array.isArray(state.cardNamePasscodes) ? state.cardNamePasscodes : []) {
      const entry = byId.get(String(row?.metacardId || ''));
      const passcode = recognition.normalizePasscode(row?.passcode);
      if (entry && passcode && !entry.passcodes.includes(passcode)) entry.passcodes.push(passcode);
    }
    return [...byId.values()];
  } finally {
    database.close();
  }
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
  throw new Error('Die Namensprüfungs-Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close();reject(new Error('Realfoto-Namensprüfung hat zu lange gedauert.')); }, 240000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer);reject(new Error('Verbindung zur Namensprüfungs-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (!fs.existsSync(electron)) throw new Error(`Electron fehlt: ${electron}`);
  const cases = parseGroundTruth(args);
  if (!cases.length) throw new Error('Keine passenden Ground-Truth-Beobachtungen gefunden.');
  const index = loadRecognitionIndex(args.database);
  const indexById = new Map(index.map(row => [String(row.metacardId), row]));
  for (const row of cases) {
    const entry = indexById.get(row.expectedMetacardId);
    if (entry && row.expectedPasscode && !entry.passcodes.includes(row.expectedPasscode)) entry.passcodes.push(row.expectedPasscode);
  }
  const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-real-name-eval-'));
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
    const results = [];
    for (const row of cases) {
      const bytes = fs.readFileSync(row.imagePath);
      const extension = path.extname(row.imagePath).toLowerCase();
      const mimeType = extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
      const scan = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
        const prepared=await TcgScannerImageProcessing.prepareCollectionObservationRecognitionPayload(${JSON.stringify(dataUrl)},${JSON.stringify(row.observation)});
        const result=await desktopApp.recognizeCollectionCardName(prepared);
        return {ocr:result.ocr,passes:${args.debugCrops ? 'prepared.passes' : '[]'},cropInfo:prepared.cropInfo};
      })()`);
      const ocr = scan.ocr || {};
      if (args.debugCrops) {
        const targetDirectory = path.resolve(args.debugCrops, `${row.split}-${row.imageName}-${row.annotationIndex}`);
        fs.mkdirSync(targetDirectory, { recursive: true });
        for (const [passIndex, pass] of (scan.passes || []).entries()) {
          const match = String(pass.imageDataUrl || '').match(/^data:image\/(?:png|jpeg|webp);base64,(.+)$/i);
          if (match) fs.writeFileSync(path.join(targetDirectory, `${String(passIndex).padStart(2, '0')}-${pass.kind}-${pass.variant}.png`), Buffer.from(match[1], 'base64'));
        }
      }
      const rankOptions = { setCodes: ocr.setCodes || [], limit: 5 };
      const rankedOcr = recognition.rankNameCandidates(index, ocr.titleReadings || [], rankOptions);
      const rankedPasscode = recognition.rankNameCandidates(index, ocr.titleReadings || [], { ...rankOptions, passcodes: ocr.passcodes || [] });
      const rankedArtwork = recognition.rankNameCandidates(index, ocr.titleReadings || [], { ...rankOptions, artworkFingerprints: ocr.artworkFingerprints || [] });
      const ranked = recognition.rankNameCandidates(index, ocr.titleReadings || [], {
        ...rankOptions, passcodes: ocr.passcodes || [], artworkFingerprints: ocr.artworkFingerprints || []
      });
      const compactResult = value => ({ candidates: value.candidates, nameConfidence: value.nameConfidence, confidenceScore: value.confidenceScore, margin: value.margin });
      results.push({
        split: row.split,
        scene: row.scene,
        category: row.category,
        language: row.language,
        imageName: row.imageName,
        imageSha256: row.imageSha256,
        annotationIndex: row.annotationIndex,
        expectedName: row.expectedName,
        expectedMetacardId: row.expectedMetacardId,
        durationMs: Number(ocr.durationMs || 0),
        ocrEngine: String(ocr.engine || ''),
        ocrTitleReadings: ocr.titleReadings || [],
        setCodes: ocr.setCodes || [],
        passcodes: ocr.passcodes || [],
        artworkFingerprintCount: Array.isArray(ocr.artworkFingerprints) ? ocr.artworkFingerprints.length : 0,
        candidates: ranked.candidates,
        nameConfidence: ranked.nameConfidence,
        confidenceScore: ranked.confidenceScore,
        margin: ranked.margin,
        ablations: {
          ocrOnly: compactResult(rankedOcr),
          ocrPasscode: compactResult(rankedPasscode),
          ocrArtwork: compactResult(rankedArtwork),
          combined: compactResult(ranked)
        }
      });
    }
    const report = {
      formatVersion: 1,
      appVersion: require('../package.json').version,
      schemaVersion: 12,
      source: 'explicit-local-real-photo-set-read-only-catalog',
      selectedSplit: args.split,
      catalogMetacards: index.length,
      ...nameEvaluation.evaluateNameRecognitionCases(results)
    };
    const serialized = `${JSON.stringify(report, null, 2)}\n`;
    if (args.output) fs.writeFileSync(path.resolve(args.output), serialized, 'utf8');
    if (args.summaryOnly) {
      process.stdout.write(`${JSON.stringify({
        appVersion: report.appVersion,
        selectedSplit: report.selectedSplit,
        summary: report.summary,
        bySplit: report.bySplit,
        byLanguage: report.byLanguage,
        byScene: report.byScene,
        byAblation: report.byAblation,
        cases: report.cases.map(row => ({
          imageName: row.imageName,
          expectedName: row.expectedName,
          expectedMetacardId: row.expectedMetacardId,
          ocrTitleReadings: row.ocrTitleReadings,
          nameConfidence: row.nameConfidence,
          confidenceScore: row.confidenceScore,
          candidates: row.candidates.slice(0, 3).map(candidate => ({
            metacardId: candidate.metacardId,
            displayName: candidate.displayName,
            score: candidate.score
          })),
          durationMs: row.durationMs
        }))
      }, null, 2)}\n`);
    } else process.stdout.write(serialized);
  } finally {
    child.kill();
    await delay(700);
    fs.rmSync(qaData, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    if (/sqlite.*(?:malformed|corrupt)|uncaught|unhandled|typeerror|referenceerror/i.test(appOutput)) {
      throw new Error(`Fehlerausgabe der Prüf-App: ${appOutput.trim()}`);
    }
  }
}

main().catch(error => { console.error(error);process.exitCode = 1; });
