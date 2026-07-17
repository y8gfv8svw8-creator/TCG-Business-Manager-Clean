const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const CURRENT_SCHEMA_VERSION = 2;

function isoNow() {
  return new Date().toISOString();
}

function dateStamp(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

class TcgDatabase {
  constructor({ databasePath, schemaPath, backupRoot }) {
    this.databasePath = databasePath;
    this.schemaPath = schemaPath;
    this.backupRoot = backupRoot;
    this.db = null;
  }

  open() {
    if (this.db) return this;

    ensureDirectory(path.dirname(this.databasePath));
    ensureDirectory(this.backupRoot);

    this.db = new DatabaseSync(this.databasePath);
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
    this.db.exec('PRAGMA busy_timeout = 5000;');

    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    this.db.exec(schema);

    this.db.prepare(`
      INSERT INTO schema_version (version, applied_at)
      VALUES (?, ?)
      ON CONFLICT(version) DO NOTHING
    `).run(CURRENT_SCHEMA_VERSION, isoNow());

    return this;
  }

  close() {
    if (!this.db) return;
    this.db.close();
    this.db = null;
  }

  getStatus() {
    this.open();
    const stateRow = this.db.prepare('SELECT updated_at FROM app_state WHERE id = 1').get();
    const productRow = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
    const priceRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get();
    const snapshotRow = this.db.prepare('SELECT COUNT(DISTINCT captured_date) AS count FROM market_prices').get();
    const lastSnapshot = this.db.prepare('SELECT MAX(captured_date) AS date FROM market_prices').get();

    return {
      ready: true,
      databasePath: this.databasePath,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      stateUpdatedAt: stateRow?.updated_at || '',
      productCount: Number(productRow?.count || 0),
      marketPriceCount: Number(priceRow?.count || 0),
      snapshotCount: Number(snapshotRow?.count || 0),
      latestSnapshotDate: lastSnapshot?.date || ''
    };
  }

  loadState() {
    this.open();
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return { state: null, updatedAt: '' };

    try {
      return {
        state: JSON.parse(row.state_json),
        updatedAt: row.updated_at || ''
      };
    } catch (error) {
      throw new Error(`Gespeicherter Programmstand ist beschädigt: ${error.message}`);
    }
  }

  saveState(state) {
    this.open();
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      throw new TypeError('Der Programmstand ist ungültig.');
    }

    const updatedAt = isoNow();
    const json = JSON.stringify(state);

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.db.prepare(`
        INSERT INTO app_state (id, state_json, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          state_json = excluded.state_json,
          updated_at = excluded.updated_at
      `).run(json, updatedAt);
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    this.createDailyBackup(json, updatedAt);
    return { ok: true, updatedAt, bytes: Buffer.byteLength(json, 'utf8') };
  }

  createDailyBackup(json, updatedAt) {
    const automaticRoot = path.join(this.backupRoot, 'Automatisch');
    ensureDirectory(automaticRoot);

    const targetPath = path.join(automaticRoot, `TCG_Auto_Backup_${dateStamp(new Date(updatedAt))}.json`);
    if (!fs.existsSync(targetPath)) {
      const tempPath = `${targetPath}.tmp`;
      fs.writeFileSync(tempPath, json, 'utf8');
      fs.renameSync(tempPath, targetPath);
    }

    const backups = fs.readdirSync(automaticRoot)
      .filter(name => /^TCG_Auto_Backup_\d{4}-\d{2}-\d{2}\.json$/i.test(name))
      .sort()
      .reverse();

    for (const oldName of backups.slice(30)) {
      fs.rmSync(path.join(automaticRoot, oldName), { force: true });
    }
  }

  upsertProducts(rows = []) {
    this.open();
    if (!Array.isArray(rows) || rows.length === 0) return { written: 0 };
    if (rows.length > 5000) throw new Error('Zu viele Produktzeilen in einem Datenbankblock.');

    const statement = this.db.prepare(`
      INSERT INTO products (
        product_id, metacard_id, expansion_id, category_id,
        name_de, name_en, official_name, set_name, set_code,
        rarity, variant, language, card_condition, collector_number,
        product_url, archived, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        metacard_id = excluded.metacard_id,
        expansion_id = excluded.expansion_id,
        category_id = excluded.category_id,
        name_de = excluded.name_de,
        name_en = excluded.name_en,
        official_name = excluded.official_name,
        set_name = excluded.set_name,
        set_code = excluded.set_code,
        rarity = excluded.rarity,
        variant = excluded.variant,
        language = excluded.language,
        card_condition = excluded.card_condition,
        collector_number = excluded.collector_number,
        product_url = excluded.product_url,
        archived = excluded.archived,
        updated_at = excluded.updated_at
    `);

    let written = 0;
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      for (const row of rows) {
        const productId = String(row?.productId ?? '').trim();
        if (!/^\d+$/.test(productId)) continue;
        statement.run(
          productId,
          String(row?.metacardId ?? '').trim() || null,
          String(row?.expansionId ?? '').trim() || null,
          Number(row?.categoryId || 0) || null,
          String(row?.germanName || row?.name || '').trim(),
          String(row?.officialBaseName || row?.baseName || row?.officialName || row?.name || '').trim(),
          String(row?.officialName || row?.name || '').trim(),
          String(row?.setName || '').trim(),
          String(row?.setCode || row?.set || '').trim(),
          String(row?.rarity || '').trim(),
          String(row?.variant || '').trim(),
          String(row?.language || '').trim(),
          String(row?.condition || '').trim(),
          String(row?.collectorNumber || '').trim(),
          String(row?.productUrl || '').trim(),
          row?.archived ? 1 : 0,
          String(row?.updatedAt || isoNow())
        );
        written += 1;
      }
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    return { written };
  }

  upsertMarketPrices({ rows = [], snapshotDate = '', sourceId = 'cardmarket_price_guide', importedAt = '' } = {}) {
    this.open();
    if (!Array.isArray(rows) || rows.length === 0) return { written: 0 };
    if (rows.length > 5000) throw new Error('Zu viele Preiszeilen in einem Datenbankblock.');

    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(snapshotDate))
      ? String(snapshotDate)
      : dateStamp();
    const importTime = importedAt || isoNow();

    const statement = this.db.prepare(`
      INSERT INTO market_prices (
        product_id, captured_date, category_id,
        avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
        avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
        source_id, source_type, data_quality, collected_at, imported_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, captured_date) DO UPDATE SET
        category_id = excluded.category_id,
        avg_price = excluded.avg_price,
        low_price = excluded.low_price,
        trend_price = excluded.trend_price,
        avg_1 = excluded.avg_1,
        avg_7 = excluded.avg_7,
        avg_30 = excluded.avg_30,
        avg_foil = excluded.avg_foil,
        low_foil = excluded.low_foil,
        trend_foil = excluded.trend_foil,
        avg_1_foil = excluded.avg_1_foil,
        avg_7_foil = excluded.avg_7_foil,
        avg_30_foil = excluded.avg_30_foil,
        source_id = excluded.source_id,
        source_type = excluded.source_type,
        data_quality = excluded.data_quality,
        collected_at = excluded.collected_at,
        imported_at = excluded.imported_at
    `);

    const numberOrNull = value => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    let written = 0;
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      for (const row of rows) {
        const productId = String(row?.productId ?? '').trim();
        if (!/^\d+$/.test(productId)) continue;
        statement.run(
          productId,
          String(row?.date || normalizedDate),
          Number(row?.categoryId || 0) || null,
          numberOrNull(row?.avg),
          numberOrNull(row?.low),
          numberOrNull(row?.trend),
          numberOrNull(row?.avg1),
          numberOrNull(row?.avg7),
          numberOrNull(row?.avg30),
          numberOrNull(row?.avgFoil),
          numberOrNull(row?.lowFoil),
          numberOrNull(row?.trendFoil),
          numberOrNull(row?.avg1Foil),
          numberOrNull(row?.avg7Foil),
          numberOrNull(row?.avg30Foil),
          String(row?.sourceId || sourceId),
          String(row?.sourceType || 'official_download'),
          String(row?.dataQuality || 'official_reference'),
          String(row?.collectedAt || importTime),
          importTime
        );
        written += 1;
      }
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    return { written, snapshotDate: normalizedDate };
  }

  recordImportRun(run = {}) {
    this.open();
    const runId = String(run.runId || `run-${Date.now()}`);
    this.db.prepare(`
      INSERT INTO import_runs (
        run_id, source, snapshot_date, started_at, finished_at,
        status, rows_read, rows_written, skipped_rows, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id) DO UPDATE SET
        snapshot_date = excluded.snapshot_date,
        finished_at = excluded.finished_at,
        status = excluded.status,
        rows_read = excluded.rows_read,
        rows_written = excluded.rows_written,
        skipped_rows = excluded.skipped_rows,
        error_message = excluded.error_message
    `).run(
      runId,
      String(run.source || 'unknown'),
      String(run.snapshotDate || ''),
      String(run.startedAt || isoNow()),
      String(run.finishedAt || ''),
      String(run.status || 'success'),
      Number(run.rowsRead || 0),
      Number(run.rowsWritten || 0),
      Number(run.skippedRows || 0),
      String(run.errorMessage || '')
    );
    return { ok: true, runId };
  }
}

module.exports = { TcgDatabase, CURRENT_SCHEMA_VERSION };
