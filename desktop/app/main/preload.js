const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', Object.freeze({
  isElectron: true,
  getInfo: () => ipcRenderer.invoke('app:get-info'),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  loadState: () => ipcRenderer.invoke('data:load-state'),
  saveState: state => ipcRenderer.invoke('data:save-state', state),
  getDatabaseStatus: () => ipcRenderer.invoke('data:get-status'),
  upsertProducts: rows => ipcRenderer.invoke('data:upsert-products', rows),
  upsertMarketPrices: payload => ipcRenderer.invoke('data:upsert-market-prices', payload),
  recordImportRun: run => ipcRenderer.invoke('data:record-import-run', run)
}));
