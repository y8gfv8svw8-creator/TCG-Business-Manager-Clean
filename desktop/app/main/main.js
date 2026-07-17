const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { TcgDatabase } = require('./database');

const APP_TITLE = 'TCG Business Manager – Market History 5.1.0';
let database = null;
let dataRoot = '';

function ensureUserFolders() {
  const root = path.join(app.getPath('documents'), 'TCG Business Manager');
  const folders = ['Daten', 'Backups', 'Imports', 'Exports', 'Logs'];
  for (const folder of folders) fs.mkdirSync(path.join(root, folder), { recursive: true });
  return root;
}

function initializeDatabase() {
  dataRoot = ensureUserFolders();
  database = new TcgDatabase({
    databasePath: path.join(dataRoot, 'Daten', 'tcg_business_manager.sqlite'),
    schemaPath: path.join(__dirname, '..', '..', 'database', 'schema.sql'),
    backupRoot: path.join(dataRoot, 'Backups')
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

  ipcMain.handle('data:load-state', () => database.loadState());
  ipcMain.handle('data:save-state', (_event, state) => database.saveState(state));
  ipcMain.handle('data:get-status', () => database.getStatus());
  ipcMain.handle('data:upsert-products', (_event, rows) => database.upsertProducts(rows));
  ipcMain.handle('data:upsert-market-prices', (_event, payload) => database.upsertMarketPrices(payload));
  ipcMain.handle('data:get-market-history', (_event, payload) => database.getMarketHistory(payload));
  ipcMain.handle('data:get-market-overview', (_event, payload) => database.getMarketOverview(payload));
  ipcMain.handle('data:get-snapshot-dates', (_event, payload) => database.getSnapshotDates(payload));
  ipcMain.handle('data:clear-market-data', () => database.clearMarketData());
  ipcMain.handle('data:record-import-run', (_event, run) => database.recordImportRun(run));
}

function createWindow() {
  const mainWindow = new BrowserWindow({
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
