const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { performance } = require('node:perf_hooks');
const { TcgDatabase } = require('./database');
const { ScannerServer } = require('./scanner-server');
const { CardScannerRecognizer } = require('./card-scanner-recognizer');
const { CollectionPhotoStore } = require('./collection-photo-store');
const { parseSpreadsheetFile } = require('./spreadsheet-import-parser');
const { PrintReferenceDatabase, resolveBundledPrintReferencePath } = require('./print-reference-database');
const collectionPhotoModel = require('../shared/collection-photo-model');

const APP_TITLE = 'TCG Business Manager – Analysecenter 6.13.6';
const STARTUP_DIAGNOSTICS_ENABLED = process.env.TCG_STARTUP_DIAGNOSTICS === '1';
const startupProcessStartedAt = performance.now();
const startupTimings = [];
function recordStartupTiming(entry = {}) {
  if (!STARTUP_DIAGNOSTICS_ENABLED) return;
  const normalized = {
    thread: String(entry.thread || 'main'),
    name: String(entry.name || 'unknown'),
    atMs: Number((performance.now() - startupProcessStartedAt).toFixed(2)),
    durationMs: Number(Number(entry.durationMs || 0).toFixed(2)),
    detail: entry.detail && typeof entry.detail === 'object' ? entry.detail : {}
  };
  startupTimings.push(normalized);
  console.info(`[startup-diagnostic] ${JSON.stringify(normalized)}`);
}

let eventLoopExpectedAt = performance.now() + 50;
const startupEventLoopMonitor = STARTUP_DIAGNOSTICS_ENABLED ? setInterval(() => {
  const now = performance.now();
  const lagMs = now - eventLoopExpectedAt;
  eventLoopExpectedAt = now + 50;
  if (lagMs >= 50) recordStartupTiming({ name: 'main_event_loop_blocked', durationMs: lagMs, detail: { thresholdMs: 50 } });
}, 50) : null;
startupEventLoopMonitor?.unref?.();
// Der isolierte Oberflächentest läuft ohne Hardwarebeschleunigung, damit seine
// virtuelle Windows-Sitzung keinen Grafiktreiber benötigt. Normale Starts bleiben unverändert.
if (process.env.TCG_MANAGER_DATA_ROOT) app.disableHardwareAcceleration();
let database = null;
let dataRoot = '';
let mainWindow = null;
let scannerRecognizer = null;
let collectionPhotoStore = null;
let printReferenceDatabase = null;
let startupValidation = null;
let deferredMarketSummaryRefreshStarted = false;
let deferredMarketSummaryPayload = null;
const scannerServer = new ScannerServer({
  onSubmission: submission => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('scanner:submission', submission);
  }
});

function ensurePrintReferenceDatabase() {
  if (printReferenceDatabase) return printReferenceDatabase;
  const referenceStartedAt = performance.now();
  printReferenceDatabase = new PrintReferenceDatabase({
    databasePath: resolveBundledPrintReferencePath({
      packaged: app.isPackaged,
      resourcesPath: process.resourcesPath
    })
  }).open();
  recordStartupTiming({ name: 'print_reference_database_ready', durationMs: performance.now() - referenceStartedAt });
  return printReferenceDatabase;
}

function ensureUserFolders() {
  // Der optionale Pfad ist ausschließlich für isolierte QA-/Entwicklungsstarts.
  // Normale Installationen verwenden weiterhin unverändert den Dokumente-Ordner.
  const root = process.env.TCG_MANAGER_DATA_ROOT
    ? path.resolve(process.env.TCG_MANAGER_DATA_ROOT)
    : path.join(app.getPath('documents'), 'TCG Business Manager');
  const folders = ['Daten', 'Backups', 'Imports', 'Exports', 'Logs'];
  for (const folder of folders) fs.mkdirSync(path.join(root, folder), { recursive: true });
  return root;
}

function initializeDatabase() {
  const initializeStartedAt = performance.now();
  dataRoot = ensureUserFolders();
  scannerRecognizer = new CardScannerRecognizer({
    cacheRoot: path.join(dataRoot, 'Cache', 'OCR'),
    logger: message => {
      if (message?.status === 'recognizing text') console.info(`Scanner-OCR ${Math.round(Number(message.progress || 0) * 100)} %`);
    }
  });
  collectionPhotoStore = new CollectionPhotoStore({
    dataRoot,
    backupRoot: path.join(dataRoot, 'Backups')
  });
  database = new TcgDatabase({
    databasePath: path.join(dataRoot, 'Daten', 'tcg_business_manager.sqlite'),
    schemaPath: path.join(__dirname, '..', '..', 'database', 'schema.sql'),
    backupRoot: path.join(dataRoot, 'Backups'),
    photoStore: collectionPhotoStore,
    onTiming: STARTUP_DIAGNOSTICS_ENABLED
      ? entry => recordStartupTiming({ ...entry, thread: 'main' })
      : null
  }).open();
  startupValidation = database.validateStartup();
  if (!startupValidation?.valid) {
    throw new Error('SQLite wurde beim Start nicht vollständig validiert.');
  }
  recordStartupTiming({ name: 'database_initialized_and_validated', durationMs: performance.now() - initializeStartedAt });
  return startupValidation;
}

function setupIpcHandlers() {
  ipcMain.on('startup:timing', (_event, entry) => recordStartupTiming({ ...entry, thread: 'renderer' }));
  ipcMain.handle('startup:get-diagnostics', () => ({ enabled: STARTUP_DIAGNOSTICS_ENABLED, timings: [...startupTimings] }));
  ipcMain.on('startup:ui-ready', event => {
    const sender = event.sender;
    if (deferredMarketSummaryPayload) {
      sender.send('data:market-summaries-refreshed', deferredMarketSummaryPayload);
      return;
    }
    if (deferredMarketSummaryRefreshStarted) return;
    deferredMarketSummaryRefreshStarted = true;
    // Die UI ist bereits sichtbar und hat zwei Frames gezeichnet. Die beiden
    // großen Konsistenzzählungen laufen getrennt und nachgelagert, damit sie
    // den ersten benutzbaren Start nicht blockieren.
    setTimeout(() => {
      let snapshot;
      try {
        const snapshotStartedAt = performance.now();
        snapshot = database.ensureSnapshotSummaries();
        recordStartupTiming({ name: 'deferred_snapshot_summary_ready', durationMs: performance.now() - snapshotStartedAt, detail: snapshot });
      } catch (error) {
        console.error('Nachgelagerte Markt-Zusammenfassung fehlgeschlagen:', error);
        return;
      }
      setTimeout(() => {
        try {
          const observationStartedAt = performance.now();
          const observation = database.ensureObservationSummaries();
          recordStartupTiming({ name: 'deferred_observation_summary_ready', durationMs: performance.now() - observationStartedAt, detail: observation });
          deferredMarketSummaryPayload = {
            status: database.getStatus(),
            snapshotDates: database.getSnapshotDates({ limit: 365 }),
            snapshot,
            observation
          };
          if (!sender.isDestroyed()) sender.send('data:market-summaries-refreshed', deferredMarketSummaryPayload);
        } catch (error) {
          console.error('Nachgelagerte Beobachtungs-Zusammenfassung fehlgeschlagen:', error);
        }
      }, 0);
    }, 750);
  });
  ipcMain.handle('app:get-info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    dataRoot,
    database: database?.getStatus() || { ready: false }
  }));

  ipcMain.handle('app:open-data-folder', async () => {
    const result = await shell.openPath(dataRoot);
    return { ok: !result, error: result || '' };
  });
  ipcMain.handle('scanner:start', (_event, payload) => scannerServer.start(payload?.mode, payload?.targetId));
  ipcMain.handle('scanner:stop', () => scannerServer.stop());
  ipcMain.handle('scanner:status', () => scannerServer.status());
  ipcMain.handle('scanner:recognize-card', (_event, payload) => scannerRecognizer.recognize(payload));
  ipcMain.handle('scanner:recognize-collection-card-name', async (_event, payload = {}) => {
    const recognition = await scannerRecognizer.recognize(payload);
    const titleReadings = (recognition.regionResults || [])
      .filter(row => row.kind === 'title' && String(row.text || '').trim())
      .map(row => ({ text: row.text, confidence: row.confidence, variant: row.variant }));
    if (!titleReadings.length) {
      for (const text of recognition.titleCandidates || []) {
        titleReadings.push({ text, confidence: recognition.confidence, variant: 'full-text-fallback' });
      }
    }
    let setCodeValidation;
    try {
      setCodeValidation = ensurePrintReferenceDatabase().validateOcrSetCodeReadings(recognition.setCodeReadings || []);
    } catch (error) {
      setCodeValidation = {
        accepted: false,
        status: 'reference_unavailable',
        setCode: '',
        confidence: null,
        method: '',
        candidates: [],
        signals: [],
        error: error.message
      };
    }
    const validatedSetCodes = setCodeValidation.accepted ? [setCodeValidation.setCode] : [];
    const setCodeSignals = Array.isArray(setCodeValidation.signals) ? setCodeValidation.signals : [];
    const ranked = database.recognizeCardNames({
      readings: titleReadings,
      setCodes: validatedSetCodes,
      passcodes: recognition.passcodes || [],
      artworkFingerprints: payload.artworkFingerprints || [],
      limit: payload?.candidateLimit || 5
    });
    const primarySetCodeSignal = setCodeSignals[0] || null;
    let printRecognition;
    try {
      printRecognition = primarySetCodeSignal
        ? ensurePrintReferenceDatabase().resolveCollectionRecognition({
            setCode: primarySetCodeSignal.setCode,
            setCodeConfidence: primarySetCodeSignal.confidence
          })
        : {
            ...ensurePrintReferenceDatabase().resolveCollectionRecognition({}),
            resolutionStatus: setCodeValidation.status === 'setcode_ambiguous' ? 'ambiguous_ocr_set_code' : 'unreadable_set_code',
            detailPhotoStatus: 'detail-photo-needed',
            detailPhotoReason: 'setcode_unreadable'
          };
    } catch (error) {
      printRecognition = {
        setCode: primarySetCodeSignal?.setCode || '',
        setCodeConfidence: primarySetCodeSignal?.confidence ?? null,
        mappingStatus: 'unresolved',
        resolutionStatus: 'reference_unavailable',
        rarityOptions: [],
        referenceCandidates: [],
        variantCandidates: [],
        requiresRaritySelection: false,
        requiresVersionSelection: false,
        suggestedCandidateId: '',
        error: error.message
      };
    }
    return {
      ...ranked,
      printRecognition: {
        ...printRecognition,
        setCodeSignals,
        setCodeValidationStatus: setCodeValidation.status,
        setCodeValidationMethod: setCodeValidation.method,
        setCodeValidationCandidates: setCodeValidation.candidates || [],
        detailPhotoStatus: primarySetCodeSignal ? '' : (printRecognition.detailPhotoStatus || 'detail-photo-needed'),
        detailPhotoReason: primarySetCodeSignal ? '' : (printRecognition.detailPhotoReason || 'setcode_unreadable')
      },
      ocr: {
        engine: recognition.engine,
        durationMs: recognition.durationMs,
        confidence: recognition.confidence,
        titleReadings,
        setCodes: validatedSetCodes,
        setCodeSignals,
        setCodeReadings: recognition.setCodeReadings || [],
        setCodeValidation,
        passcodes: recognition.passcodes || [],
        artworkFingerprints: payload.artworkFingerprints || [],
        regionResults: recognition.regionResults || []
      }
    };
  });

  ipcMain.handle('data:load-state', () => database.loadState());
  ipcMain.handle('data:validate-startup', () => database.validateStartup());
  ipcMain.handle('data:save-state', (_event, state) => database.saveState(state));
  ipcMain.handle('data:reset-state', (_event, state) => database.saveState(state, { allowDestructiveReset: true }));
  ipcMain.handle('data:get-status', () => database.getStatus());
  ipcMain.handle('data:get-trade-database-status', () => database.getTradeDatabaseStatus());
  ipcMain.handle('data:get-business-events', (_event, payload) => database.getBusinessEvents(payload));
  ipcMain.handle('data:get-own-sales-experience', (_event, payload) => database.getOwnSalesExperience(payload));
  ipcMain.handle('data:get-trade-recommendations', (_event, payload) => database.getTradeRecommendations(payload));
  ipcMain.handle('data:get-data-sources', () => database.getDataSources());
  ipcMain.handle('data:begin-cardmarket-import', (_event, payload) => database.beginCardmarketImport(payload));
  ipcMain.handle('data:append-cardmarket-import', (_event, payload) => database.appendCardmarketImport(payload));
  ipcMain.handle('data:commit-cardmarket-import', (_event, payload) => database.commitCardmarketImport(payload));
  ipcMain.handle('data:rollback-cardmarket-import', (_event, payload) => database.rollbackCardmarketImport(payload));
  ipcMain.handle('data:upsert-products', (_event, rows) => database.upsertProducts(rows));
  ipcMain.handle('data:upsert-card-names', (_event, payload) => database.upsertCardNames(payload));
  ipcMain.handle('data:get-card-name-status', () => database.getCardNameStatus());
  ipcMain.handle('data:get-card-names-for-products', (_event, payload) => database.getCardNamesForProducts(payload));
  ipcMain.handle('data:search-cards', (_event, payload) => database.searchCards(payload));
  ipcMain.handle('data:get-card-name-backup', () => database.getCardNameBackup());
  ipcMain.handle('data:upsert-market-prices', (_event, payload) => database.upsertMarketPrices(payload));
  ipcMain.handle('data:get-market-history', (_event, payload) => database.getMarketHistory(payload));
  ipcMain.handle('data:get-market-decision-history', (_event, payload) => database.getMarketDecisionHistory(payload));
  ipcMain.handle('data:get-market-overview', (_event, payload) => database.getMarketOverview(payload));
  ipcMain.handle('data:get-snapshot-dates', (_event, payload) => database.getSnapshotDates(payload));
  ipcMain.handle('data:get-cardmarket-cache-seed', (_event, payload) => database.getCardmarketCacheSeed(payload));
  ipcMain.handle('data:clear-market-data', () => database.clearMarketData());
  ipcMain.handle('data:record-import-run', (_event, run) => database.recordImportRun(run));
  ipcMain.handle('print-reference:find-candidates', (_event, payload = {}) => {
    try {
      ensurePrintReferenceDatabase();
      const setCode = String(payload.setCode || '').trim().slice(0, 40);
      const rarity = String(payload.rarity || '').trim().slice(0, 120);
      const treatment = String(payload.treatment || '').trim().slice(0, 120);
      const candidates = printReferenceDatabase.findPrintCandidates({ setCode, rarity, treatment });
      return {
        ok: true,
        candidates,
        unique: Boolean(setCode && rarity && candidates.length === 1 && candidates[0]?.treatment !== 'unknown'),
        uniqueWithinReference: Boolean(setCode && rarity && candidates.length === 1)
      };
    } catch (error) {
      return { ok: false, candidates: [], unique: false, error: error.message };
    }
  });
  ipcMain.handle('print-reference:resolve-collection-recognition', (_event, payload = {}) => {
    try {
      const setCode = String(payload.setCode || '').trim().slice(0, 40);
      const rarity = String(payload.rarity || '').trim().slice(0, 120);
      const setCodeConfidence = payload.setCodeConfidence == null ? null : Number(payload.setCodeConfidence);
      return {
        ok: true,
        recognition: ensurePrintReferenceDatabase().resolveCollectionRecognition({ setCode, setCodeConfidence, rarity })
      };
    } catch (error) {
      return { ok: false, recognition: null, error: error.message };
    }
  });
  ipcMain.handle('import:parse-purchase-price-file', (_event, payload) => parseSpreadsheetFile(payload));
  ipcMain.handle('collection-photo:store', (_event, payload = {}) => {
    const loaded = database.loadState();
    const state = loaded.state;
    const analysis = state?.collectionPurchaseAnalyses?.find(row => String(row.id) === String(payload.analysisId));
    if (!analysis) throw new Error('Die Sammlungsanalyse wurde nicht gefunden.');
    const stored = collectionPhotoStore.storeImage(payload);
    const photo = {
      id: crypto.randomUUID(),
      analysisId: String(analysis.id),
      sequence: Math.max(1, Math.round(Number(payload.sequence || (analysis.photos?.length || 0) + 1))),
      binderPage: String(payload.binderPage || ''),
      createdAt: new Date().toISOString(),
      ...stored
    };
    analysis.photos = Array.isArray(analysis.photos) ? analysis.photos : [];
    analysis.photos.push(photo);
    analysis.photoObservations = Array.isArray(analysis.photoObservations) ? analysis.photoObservations : [];
    analysis.physicalCards = Array.isArray(analysis.physicalCards) ? analysis.physicalCards : [];
    try {
      database.saveState(state);
      return photo;
    } catch (error) {
      collectionPhotoStore.deleteImage(stored.relativePath);
      throw error;
    }
  });
  ipcMain.handle('collection-photo:read', (_event, payload = {}) => collectionPhotoStore.readImage(payload.relativePath));
  ipcMain.handle('collection-photo:delete', (_event, payload = {}) => {
    const loaded = database.loadState();
    const state = loaded.state;
    const analysis = state?.collectionPurchaseAnalyses?.find(row => String(row.id) === String(payload.analysisId));
    if (!analysis) throw new Error('Die Sammlungsanalyse wurde nicht gefunden.');
    const photo = (analysis.photos || []).find(row => String(row.id) === String(payload.photoId));
    if (!photo) return { ok: true };
    const staged = collectionPhotoStore.stageDelete(photo.relativePath);
    Object.assign(analysis, collectionPhotoModel.removePhotoEvidence(analysis, photo.id));
    try {
      database.saveState(state);
      staged.commit();
      return { ok: true };
    } catch (error) {
      staged.rollback();
      throw error;
    }
  });
  ipcMain.handle('backup:create-bundle', (_event, state) => {
    database.saveState(state);
    return collectionPhotoStore.createBackupBundle(state);
  });
  ipcMain.handle('backup:restore-bundle', (_event, bundle) => collectionPhotoStore.restoreBackupBundle(bundle, state => database.saveState(state)));
}

function createWindow() {
  const windowStartedAt = performance.now();
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    title: APP_TITLE,
    backgroundColor: '#111827',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  recordStartupTiming({ name: 'window_created', durationMs: performance.now() - windowStartedAt });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const target = new URL(url);
      if (target.protocol !== 'file:') {
        event.preventDefault();
        if (/^https?:$/i.test(target.protocol)) shell.openExternal(url);
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.once('dom-ready', () => recordStartupTiming({ name: 'window_dom_ready' }));
  mainWindow.webContents.once('did-finish-load', () => recordStartupTiming({ name: 'window_did_finish_load' }));
  mainWindow.once('ready-to-show', () => {
    recordStartupTiming({ name: 'window_ready_to_show' });
    mainWindow.show();
  });
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.setName('TCG Business Manager');

app.whenReady().then(() => {
  recordStartupTiming({ name: 'app_ready' });
  initializeDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(error => {
  console.error(error);
  dialog.showErrorBox('TCG Business Manager – Startfehler', error.message);
  app.quit();
});

app.on('before-quit', () => {
  scannerServer.stop().catch(error => console.error('Scanner-Server konnte nicht beendet werden:', error));
  scannerRecognizer?.terminate().catch(error => console.error('Scanner-OCR konnte nicht beendet werden:', error));
  try {
    database?.close();
  } catch (error) {
    console.error('Datenbank konnte nicht sauber geschlossen werden:', error);
  }
  try {
    printReferenceDatabase?.close();
  } catch (error) {
    console.error('Print-Referenz konnte nicht sauber geschlossen werden:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', error => {
  console.error(error);
  dialog.showErrorBox('TCG Business Manager – Fehler', error.message);
});
