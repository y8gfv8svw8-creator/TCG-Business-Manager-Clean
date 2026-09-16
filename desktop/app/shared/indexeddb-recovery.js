(function(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.TcgIndexedDbRecovery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
  "use strict";

  function isRecoverableIndexedDbError(error) {
    const name = String(error?.name || "").trim();
    const message = String(error?.message || error || "").trim();
    return name === "UnknownError" || /unknownerror|internal error/i.test(`${name} ${message}`);
  }

  function createIndexedDbRecovery({ indexedDB, name, version, onUpgrade, onStatus } = {}) {
    if (!indexedDB || typeof indexedDB.open !== "function" || typeof indexedDB.deleteDatabase !== "function") {
      throw new TypeError("Eine gültige IndexedDB-Schnittstelle ist erforderlich.");
    }
    if (!String(name || "").trim()) throw new TypeError("Ein IndexedDB-Name ist erforderlich.");

    let databasePromise = null;
    let activeDatabase = null;
    let repairPromise = null;
    let repairGeneration = 0;

    const emit = (status, detail = {}) => {
      try { onStatus?.({ status, name, repairGeneration, ...detail }); } catch { /* Status darf den Cache nie blockieren. */ }
    };

    function open() {
      if (databasePromise) return databasePromise;
      databasePromise = new Promise((resolve, reject) => {
        let request;
        try {
          request = indexedDB.open(name, version);
        } catch (error) {
          reject(error);
          return;
        }
        request.onupgradeneeded = event => onUpgrade?.(request.result, request.transaction, event);
        request.onsuccess = () => {
          activeDatabase = request.result;
          activeDatabase.onversionchange = () => {
            try { activeDatabase.close(); } catch { /* bereits geschlossen */ }
            activeDatabase = null;
            databasePromise = null;
          };
          resolve(activeDatabase);
        };
        request.onerror = () => reject(request.error || new Error(`${name} konnte nicht geöffnet werden.`));
        request.onblocked = () => reject(Object.assign(new Error(`${name} ist durch eine andere Verbindung blockiert.`), { name: "BlockedError" }));
      }).catch(error => {
        databasePromise = null;
        activeDatabase = null;
        throw error;
      });
      return databasePromise;
    }

    function close() {
      try { activeDatabase?.close(); } catch { /* bereits geschlossen */ }
      activeDatabase = null;
      databasePromise = null;
    }

    function removeDatabase() {
      close();
      return new Promise((resolve, reject) => {
        let request;
        try {
          request = indexedDB.deleteDatabase(name);
        } catch (error) {
          reject(error);
          return;
        }
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error || new Error(`${name} konnte nicht zurückgesetzt werden.`));
        request.onblocked = () => reject(Object.assign(new Error(`${name} ist durch eine andere Verbindung blockiert.`), { name: "BlockedError" }));
      });
    }

    async function repair({ rebuild, reason = null, automatic = false } = {}) {
      if (repairPromise) return repairPromise;
      repairPromise = (async () => {
        emit("repair-start", { automatic, reason });
        await removeDatabase();
        const database = await open();
        const rebuildResult = typeof rebuild === "function" ? await rebuild(database) : null;
        repairGeneration += 1;
        emit("repair-complete", { automatic, reason, rebuildResult });
        return { database, rebuildResult, repairGeneration };
      })().catch(error => {
        emit("repair-error", { automatic, reason, error });
        throw error;
      }).finally(() => {
        repairPromise = null;
      });
      return repairPromise;
    }

    async function withRecovery(operation, { rebuild } = {}) {
      try {
        return await operation(await open());
      } catch (error) {
        if (!isRecoverableIndexedDbError(error)) throw error;
        emit("defect-detected", { automatic: true, reason: error });
        await repair({ rebuild, reason: error, automatic: true });
        return operation(await open());
      }
    }

    return Object.freeze({
      open,
      close,
      repair,
      withRecovery,
      getRepairGeneration: () => repairGeneration
    });
  }

  return Object.freeze({ isRecoverableIndexedDbError, createIndexedDbRecovery });
});
