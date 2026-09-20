const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', Object.freeze({
  isElectron: true,
  getInfo: () => ipcRenderer.invoke('app:get-info'),
  openDataFolder: () => ipcRenderer.invoke('app:open-data-folder'),
  startScanner: payload => ipcRenderer.invoke('scanner:start', payload),
  stopScanner: () => ipcRenderer.invoke('scanner:stop'),
  getScannerStatus: () => ipcRenderer.invoke('scanner:status'),
  recognizeCardImage: payload => ipcRenderer.invoke('scanner:recognize-card', payload),
  recognizeCollectionCardName: payload => ipcRenderer.invoke('scanner:recognize-collection-card-name', payload),
  onScannerSubmission: callback => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, submission) => callback(submission);
    ipcRenderer.on('scanner:submission', listener);
    return () => ipcRenderer.removeListener('scanner:submission', listener);
  },
  loadState: () => ipcRenderer.invoke('data:load-state'),
  validateStartup: () => ipcRenderer.invoke('data:validate-startup'),
  saveState: state => ipcRenderer.invoke('data:save-state', state),
  resetState: state => ipcRenderer.invoke('data:reset-state', state),
  getDatabaseStatus: () => ipcRenderer.invoke('data:get-status'),
  getTradeDatabaseStatus: () => ipcRenderer.invoke('data:get-trade-database-status'),
  getBusinessEvents: payload => ipcRenderer.invoke('data:get-business-events', payload),
  getOwnSalesExperience: payload => ipcRenderer.invoke('data:get-own-sales-experience', payload),
  getTradeRecommendations: payload => ipcRenderer.invoke('data:get-trade-recommendations', payload),
  getDataSources: () => ipcRenderer.invoke('data:get-data-sources'),
  beginCardmarketImport: payload => ipcRenderer.invoke('data:begin-cardmarket-import', payload),
  appendCardmarketImport: payload => ipcRenderer.invoke('data:append-cardmarket-import', payload),
  commitCardmarketImport: payload => ipcRenderer.invoke('data:commit-cardmarket-import', payload),
  rollbackCardmarketImport: payload => ipcRenderer.invoke('data:rollback-cardmarket-import', payload),
  upsertProducts: rows => ipcRenderer.invoke('data:upsert-products', rows),
  upsertCardNames: payload => ipcRenderer.invoke('data:upsert-card-names', payload),
  getCardNameStatus: () => ipcRenderer.invoke('data:get-card-name-status'),
  getCardNamesForProducts: payload => ipcRenderer.invoke('data:get-card-names-for-products', payload),
  searchCards: payload => ipcRenderer.invoke('data:search-cards', payload),
  getCardNameBackup: () => ipcRenderer.invoke('data:get-card-name-backup'),
  upsertMarketPrices: payload => ipcRenderer.invoke('data:upsert-market-prices', payload),
  getMarketHistory: payload => ipcRenderer.invoke('data:get-market-history', payload),
  getMarketDecisionHistory: payload => ipcRenderer.invoke('data:get-market-decision-history', payload),
  getMarketOverview: payload => ipcRenderer.invoke('data:get-market-overview', payload),
  getSnapshotDates: payload => ipcRenderer.invoke('data:get-snapshot-dates', payload),
  getCardmarketCacheSeed: payload => ipcRenderer.invoke('data:get-cardmarket-cache-seed', payload),
  clearMarketData: () => ipcRenderer.invoke('data:clear-market-data'),
  recordImportRun: run => ipcRenderer.invoke('data:record-import-run', run),
  parsePurchasePriceFile: payload => ipcRenderer.invoke('import:parse-purchase-price-file', payload),
  storeCollectionPhoto: payload => ipcRenderer.invoke('collection-photo:store', payload),
  readCollectionPhoto: relativePath => ipcRenderer.invoke('collection-photo:read', { relativePath }),
  deleteCollectionPhoto: payload => ipcRenderer.invoke('collection-photo:delete', payload),
  createBackupBundle: state => ipcRenderer.invoke('backup:create-bundle', state),
  restoreBackupBundle: bundle => ipcRenderer.invoke('backup:restore-bundle', bundle)
}));
