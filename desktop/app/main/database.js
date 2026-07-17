const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const CURRENT_SCHEMA_VERSION = 3;

function isoNow() {
  return new Date().toISOString();
}

function dateStamp(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function boundedInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function normalizedProductId(value) {
  const productId = String(value ?? '').trim();
  if (!/^\d+$/.test(productId)) throw new TypeError('Ungültige Cardmarket-Produkt-ID.');
  return productId;
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
    this.ensureSnapshotSummaries();

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

  ensureSnapshotSummaries() {
    const expected = Number(this.db.prepare(`
      SELECT COUNT(DISTINCT captured_date) AS count FROM market_prices
    `).get()?.count || 0);
    const existing = Number(this.db.prepare(`
      SELECT COUNT(*) AS count FROM market_snapshot_summary
    `).get()?.count || 0);
    if (expected === existing) return;

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.db.exec('DELETE FROM market_snapshot_summary;');
      this.db.exec(`
        INSERT INTO market_snapshot_summary (
          captured_date, row_count, source_id, first_imported_at, updated_at
        )
        SELECT
          captured_date,
          COUNT(*),
          MAX(source_id),
          MIN(imported_at),
          MAX(imported_at)
        FROM market_prices
        GROUP BY captured_date
      `);
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }
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

    const snapshotDates = [...new Set(rows
      .map(row => String(row?.date || normalizedDate))
      .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)))];
    this.updateSnapshotSummaries(snapshotDates, sourceId, importTime);

    return { written, snapshotDate: normalizedDate, snapshotDates };
  }

  updateSnapshotSummaries(snapshotDates = [], sourceId = 'cardmarket_price_guide', importedAt = isoNow()) {
    this.open();
    const countStatement = this.db.prepare(`
      SELECT COUNT(*) AS row_count
      FROM market_prices
      WHERE captured_date = ?
    `);
    const upsertStatement = this.db.prepare(`
      INSERT INTO market_snapshot_summary (
        captured_date, row_count, source_id, first_imported_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(captured_date) DO UPDATE SET
        row_count = excluded.row_count,
        source_id = excluded.source_id,
        updated_at = excluded.updated_at
    `);

    for (const snapshotDate of snapshotDates) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(snapshotDate))) continue;
      const count = Number(countStatement.get(snapshotDate)?.row_count || 0);
      upsertStatement.run(snapshotDate, count, String(sourceId || ''), importedAt, importedAt);
    }
  }

  getMarketHistory({ productId, limit = 400 } = {}) {
    this.open();
    const id = normalizedProductId(productId);
    const safeLimit = boundedInteger(limit, 1, 2000, 400);
    const rows = this.db.prepare(`
      SELECT
        captured_date AS date,
        category_id AS categoryId,
        avg_price AS avg,
        low_price AS low,
        trend_price AS trend,
        avg_1 AS avg1,
        avg_7 AS avg7,
        avg_30 AS avg30,
        avg_foil AS avgFoil,
        low_foil AS lowFoil,
        trend_foil AS trendFoil,
        avg_1_foil AS avg1Foil,
        avg_7_foil AS avg7Foil,
        avg_30_foil AS avg30Foil,
        source_id AS sourceId,
        data_quality AS dataQuality,
        collected_at AS collectedAt,
        imported_at AS importedAt
      FROM market_prices
      WHERE product_id = ?
      ORDER BY captured_date DESC
      LIMIT ?
    `).all(id, safeLimit);
    return rows.reverse();
  }

  getSnapshotDates({ limit = 365 } = {}) {
    this.open();
    const safeLimit = boundedInteger(limit, 1, 2000, 365);
    return this.db.prepare(`
      SELECT
        captured_date AS date,
        row_count AS rowCount,
        updated_at AS importedAt
      FROM market_snapshot_summary
      ORDER BY captured_date DESC
      LIMIT ?
    `).all(safeLimit);
  }

  getMarketOverview({ days = 30, limit = 12, minTrend = 0.05 } = {}) {
    this.open();
    const requestedDays = boundedInteger(days, 1, 3650, 30);
    const safeLimit = boundedInteger(limit, 1, 50, 12);
    const safeMinTrend = Number.isFinite(Number(minTrend)) ? Math.max(0, Number(minTrend)) : 0.05;

    const summary = this.db.prepare(`
      SELECT
        COALESCE(SUM(row_count), 0) AS totalPriceRows,
        COUNT(*) AS snapshotCount,
        MIN(captured_date) AS firstSnapshotDate,
        MAX(captured_date) AS latestSnapshotDate
      FROM market_snapshot_summary
    `).get();
    const latestDate = String(summary?.latestSnapshotDate || '');
    const firstDate = String(summary?.firstSnapshotDate || '');
    if (!latestDate) {
      return {
        requestedDays, actualDays: 0, latestDate: '', targetDate: '', firstDate: '',
        totalPriceRows: 0, snapshotCount: 0, latestProductCount: 0, comparedCount: 0,
        gainers: [], losers: []
      };
    }

    const targetModifier = `-${requestedDays} days`;
    const targetRow = this.db.prepare(`
      SELECT MAX(captured_date) AS date
      FROM market_prices
      WHERE captured_date <= date(?, ?)
    `).get(latestDate, targetModifier);
    const targetDate = String(targetRow?.date || '');
    const latestProductCount = Number(this.db.prepare(`
      SELECT row_count AS count FROM market_snapshot_summary WHERE captured_date = ?
    `).get(latestDate)?.count || 0);

    if (!targetDate || targetDate === latestDate) {
      return {
        requestedDays, actualDays: 0, latestDate, targetDate: '', firstDate,
        totalPriceRows: Number(summary?.totalPriceRows || 0),
        snapshotCount: Number(summary?.snapshotCount || 0),
        latestProductCount, comparedCount: 0, gainers: [], losers: []
      };
    }

    const commonSelect = `
      SELECT
        current.product_id AS productId,
        COALESCE(NULLIF(products.name_de, ''), NULLIF(products.name_en, ''), NULLIF(products.official_name, ''), 'CM ' || current.product_id) AS name,
        products.name_en AS englishName,
        products.set_name AS setName,
        products.set_code AS setCode,
        products.rarity AS rarity,
        current.trend_price AS currentTrend,
        previous.trend_price AS previousTrend,
        current.low_price AS currentLow,
        current.avg_7 AS currentAvg7,
        current.avg_30 AS currentAvg30,
        current.trend_price - previous.trend_price AS changeValue,
        ((current.trend_price - previous.trend_price) / previous.trend_price) * 100.0 AS changePercent
      FROM market_prices current
      JOIN market_prices previous
        ON previous.product_id = current.product_id
       AND previous.captured_date = ?
      LEFT JOIN products ON products.product_id = current.product_id
      WHERE current.captured_date = ?
        AND current.trend_price IS NOT NULL
        AND previous.trend_price IS NOT NULL
        AND previous.trend_price >= ?
        AND current.trend_price >= ?
    `;
    const parameters = [targetDate, latestDate, safeMinTrend, safeMinTrend];
    const gainers = this.db.prepare(`${commonSelect}
      AND current.trend_price > previous.trend_price
      ORDER BY changePercent DESC, changeValue DESC
      LIMIT ?
    `).all(...parameters, safeLimit);
    const losers = this.db.prepare(`${commonSelect}
      AND current.trend_price < previous.trend_price
      ORDER BY changePercent ASC, changeValue ASC
      LIMIT ?
    `).all(...parameters, safeLimit);
    const comparedCount = Number(this.db.prepare(`
      SELECT COUNT(*) AS count
      FROM market_prices current
      JOIN market_prices previous
        ON previous.product_id = current.product_id
       AND previous.captured_date = ?
      WHERE current.captured_date = ?
        AND current.trend_price IS NOT NULL
        AND previous.trend_price IS NOT NULL
        AND previous.trend_price >= ?
        AND current.trend_price >= ?
    `).get(...parameters)?.count || 0);

    const actualDays = Math.max(0, Math.round((Date.parse(`${latestDate}T12:00:00Z`) - Date.parse(`${targetDate}T12:00:00Z`)) / 86400000));
    return {
      requestedDays, actualDays, latestDate, targetDate, firstDate,
      totalPriceRows: Number(summary?.totalPriceRows || 0),
      snapshotCount: Number(summary?.snapshotCount || 0),
      latestProductCount, comparedCount, gainers, losers
    };
  }

  clearMarketData() {
    this.open();
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.db.exec('DELETE FROM analysis_metrics;');
      this.db.exec('DELETE FROM market_liquidity;');
      this.db.exec('DELETE FROM market_snapshot_summary;');
      this.db.exec('DELETE FROM market_prices;');
      this.db.exec('DELETE FROM products;');
      this.db.exec('DELETE FROM import_runs;');
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }
    return { ok: true };
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
