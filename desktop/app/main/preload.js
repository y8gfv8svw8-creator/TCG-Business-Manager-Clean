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
  getMarketHistory: payload => ipcRenderer.invoke('data:get-market-history', payload),
  getMarketOverview: payload => ipcRenderer.invoke('data:get-market-overview', payload),
  getSnapshotDates: payload => ipcRenderer.invoke('data:get-snapshot-dates', payload),
  clearMarketData: () => ipcRenderer.invoke('data:clear-market-data'),
  recordImportRun: run => ipcRenderer.invoke('data:record-import-run', run)
}));
