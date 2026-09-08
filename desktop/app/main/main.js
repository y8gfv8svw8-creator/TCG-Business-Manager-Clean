const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { TcgDatabase } = require('./database');
const { ScannerServer } = require('./scanner-server');
const { CardScannerRecognizer } = require('./card-scanner-recognizer');
const { CollectionPhotoStore } = require('./collection-photo-store');
const collectionPhotoModel = require('../shared/collection-photo-model');

const APP_TITLE = 'TCG Business Manager – Analysecenter 6.13.0';
// Der isolierte Oberflächentest läuft ohne Hardwarebeschleunigung, damit seine
// virtuelle Windows-Sitzung keinen Grafiktreiber benötigt. Normale Starts bleiben unverändert.
if (process.env.TCG_MANAGER_DATA_ROOT) app.disableHardwareAcceleration();
let database = null;
let dataRoot = '';
let mainWindow = null;
let scannerRecognizer = null;
let collectionPhotoStore = null;
const scannerServer = new ScannerServer({
  onSubmission: submission => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('scanner:submission', submission);
  }
});

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
    photoStore: collectionPhotoStore
  }).open();
}

function setupIpcHandlers() {
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
    const ranked = database.recognizeCardNames({
      readings: titleReadings,
      setCodes: recognition.setCodes || [],
      passcodes: recognition.passcodes || [],
      artworkFingerprints: payload.artworkFingerprints || [],
      limit: payload?.candidateLimit || 5
    });
    return {
      ...ranked,
      ocr: {
        engine: recognition.engine,
        durationMs: recognition.durationMs,
        confidence: recognition.confidence,
        titleReadings,
        setCodes: recognition.setCodes || [],
        passcodes: recognition.passcodes || [],
        artworkFingerprints: payload.artworkFingerprints || [],
        regionResults: recognition.regionResults || []
      }
    };
  });

  ipcMain.handle('data:load-state', () => database.loadState());
  ipcMain.handle('data:save-state', (_event, state) => database.saveState(state));
  ipcMain.handle('data:reset-state', (_event, state) => database.saveState(state, { allowDestructiveReset: true }));
  ipcMain.handle('data:get-status', () => database.getStatus());
  ipcMain.handle('data:get-trade-database-status', () => database.getTradeDatabaseStatus());
  ipcMain.handle('data:get-business-events', (_event, payload) => database.getBusinessEvents(payload));
  ipcMain.handle('data:get-own-sales-experience', (_event, payload) => database.getOwnSalesExperience(payload));
  ipcMain.handle('data:get-trade-recommendations', (_event, payload) => database.getTradeRecommendations(payload));
  ipcMain.handle('data:get-data-sources', () => database.getDataSources());
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
  ipcMain.handle('data:clear-market-data', () => database.clearMarketData());
  ipcMain.handle('data:record-import-run', (_event, run) => database.recordImportRun(run));
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

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.setName('TCG Business Manager');

app.whenReady().then(() => {
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', error => {
  console.error(error);
  dialog.showErrorBox('TCG Business Manager – Fehler', error.message);
});
