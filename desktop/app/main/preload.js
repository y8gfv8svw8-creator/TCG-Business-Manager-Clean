const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', Object.freeze({
  isElectron: true,
  getInfo: () => ipcRenderer.invoke('app:get-info'),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  startScanner: payload => ipcRenderer.invoke('scanner:start', payload),
  stopScanner: () => ipcRenderer.invoke('scanner:stop'),
  getScannerStatus: () => ipcRenderer.invoke('scanner:status'),
  onScannerSubmission: callback => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, submission) => callback(submission);
    ipcRenderer.on('scanner:submission', listener);
    return () => ipcRenderer.removeListener('scanner:submission', listener);
  },
  loadState: () => ipcRenderer.invoke('data:load-state'),
  saveState: state => ipcRenderer.invoke('data:save-state', state),
  getDatabaseStatus: () => ipcRenderer.invoke('data:get-status'),
  getTradeDatabaseStatus: () => ipcRenderer.invoke('data:get-trade-database-status'),
  getBusinessEvents: payload => ipcRenderer.invoke('data:get-business-events', payload),
  getTradeRecommendations: payload => ipcRenderer.invoke('data:get-trade-recommendations', payload),
  getDataSources: () => ipcRenderer.invoke('data:get-data-sources'),
  upsertProducts: rows => ipcRenderer.invoke('data:upsert-products', rows),
  upsertCardNames: payload => ipcRenderer.invoke('data:upsert-card-names', payload),
  getCardNameStatus: () => ipcRenderer.invoke('data:get-card-name-status'),
  getCardNamesForProducts: payload => ipcRenderer.invoke('data:get-card-names-for-products', payload),
  searchCards: payload => ipcRenderer.invoke('data:search-cards', payload),
  getCardNameBackup: () => ipcRenderer.invoke('data:get-card-name-backup'),
  upsertMarketPrices: payload => ipcRenderer.invoke('data:upsert-market-prices', payload),
  getMarketHistory: payload => ipcRenderer.invoke('data:get-market-history', payload),
  getMarketOverview: payload => ipcRenderer.invoke('data:get-market-overview', payload),
  getSnapshotDates: payload => ipcRenderer.invoke('data:get-snapshot-dates', payload),
  clearMarketData: () => ipcRenderer.invoke('data:clear-market-data'),
  recordImportRun: run => ipcRenderer.invoke('data:record-import-run', run)
}));
