const path = require('node:path');
const { Worker } = require('node:worker_threads');

class DatabaseBackgroundRunner {
  constructor({
    databasePath,
    schemaPath,
    backupRoot,
    busyTimeoutMs = 5000,
    diagnostics = false,
    onTiming = null,
    workerPath = path.join(__dirname, 'database-background-worker.js')
  }) {
    this.workerData = {
      databasePath,
      schemaPath,
      backupRoot,
      busyTimeoutMs,
      diagnostics: Boolean(diagnostics)
    };
    this.workerPath = workerPath;
    this.onTiming = typeof onTiming === 'function' ? onTiming : null;
    this.worker = null;
    this.pending = new Map();
    this.sequence = 0;
    this.closing = false;
  }

  ensureWorker() {
    if (this.worker) return this.worker;
    this.closing = false;
    const worker = new Worker(this.workerPath, { workerData: this.workerData });
    this.worker = worker;
    worker.on('message', message => this.handleMessage(message));
    worker.on('error', error => this.failWorker(error));
    worker.on('exit', code => {
      if (!this.closing) this.failWorker(new Error(`Datenbank-Hintergrundworker wurde unerwartet mit Code ${code} beendet.`));
      if (this.worker === worker) this.worker = null;
    });
    return worker;
  }

  handleMessage(message) {
    if (message?.type === 'timing') {
      this.onTiming?.(message.entry || {});
      return;
    }
    if (message?.type === 'ready') return;
    const id = Number(message?.id || 0);
    const pending = this.pending.get(id);
    if (!pending) return;
    this.pending.delete(id);
    if (message.ok) pending.resolve(message.result);
    else {
      const error = new Error(String(message.error || 'Hintergrundabfrage fehlgeschlagen.'));
      if (message.stack) error.stack = message.stack;
      pending.reject(error);
    }
  }

  failWorker(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    this.worker = null;
  }

  run(action, payload = {}) {
    const worker = this.ensureWorker();
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ id, action, payload });
    });
  }

  async close() {
    this.closing = true;
    const worker = this.worker;
    this.worker = null;
    const error = new Error('Datenbank-Hintergrundworker wurde beendet.');
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    if (worker) await worker.terminate();
  }
}

module.exports = { DatabaseBackgroundRunner };

