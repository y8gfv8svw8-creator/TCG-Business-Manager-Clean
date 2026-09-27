const { parentPort, workerData } = require('node:worker_threads');
const { performance } = require('node:perf_hooks');
const { TcgDatabase } = require('./database');

if (!parentPort) throw new Error('Der Datenbank-Hintergrundworker muss als Worker gestartet werden.');

const database = new TcgDatabase({
  databasePath: workerData.databasePath,
  schemaPath: workerData.schemaPath,
  backupRoot: workerData.backupRoot,
  onTiming: workerData.diagnostics
    ? entry => parentPort.postMessage({ type: 'timing', entry: { ...entry, thread: 'database-worker' } })
    : null
}).open({
  busyTimeoutMs: workerData.busyTimeoutMs,
  initialize: false
});

const actions = Object.freeze({
  refreshMarketSummaries() {
    const snapshot = database.ensureSnapshotSummaries();
    const observation = database.ensureObservationSummaries();
    return {
      snapshot,
      observation,
      status: database.getStatus(),
      snapshotDates: database.getSnapshotDates({ limit: 365 })
    };
  },
  getTradeDatabaseStatus() {
    return database.getTradeDatabaseStatus();
  },
  getOwnSalesExperience(payload) {
    return database.getOwnSalesExperience(payload || {});
  },
  getMarketDecisionHistory(payload) {
    return database.getMarketDecisionHistory(payload || {});
  },
  getCardNamesForProducts(payload) {
    return database.getCardNamesForProducts(payload || {});
  },
  getCardNameBackup() {
    return database.getCardNameBackup();
  }
});

parentPort.on('message', message => {
  const id = Number(message?.id || 0);
  const action = String(message?.action || '');
  const handler = actions[action];
  if (!id || !handler) {
    parentPort.postMessage({ id, ok: false, error: `Unbekannte Hintergrundabfrage: ${action || '(leer)'}` });
    return;
  }
  const startedAt = performance.now();
  try {
    const result = handler(message.payload);
    parentPort.postMessage({ id, ok: true, result });
    if (workerData.diagnostics) {
      parentPort.postMessage({
        type: 'timing',
        entry: {
          thread: 'database-worker',
          name: `background_action:${action}`,
          durationMs: performance.now() - startedAt,
          detail: {}
        }
      });
    }
  } catch (error) {
    parentPort.postMessage({
      id,
      ok: false,
      error: String(error?.message || error),
      stack: String(error?.stack || '')
    });
  }
});

parentPort.postMessage({ type: 'ready' });

