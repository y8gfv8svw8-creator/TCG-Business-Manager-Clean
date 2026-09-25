const { DatabaseSync } = require('node:sqlite');
const { performance } = require('node:perf_hooks');
const fs = require('fs');
const path = require('path');
const cardSearch = require('../shared/card-search');
const scannerRecognition = require('../shared/scanner-recognition');
const businessAutomation = require('../shared/business-automation');
const collectionPhotoModel = require('../shared/collection-photo-model');

const CURRENT_SCHEMA_VERSION = 12;

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

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function positiveQuantity(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function recordId(record, index) {
  return String(record?.id || record?.orderNo || `row-${index}`);
}

function recordSource(record) {
  const source = String(record?.source || record?.importSource || '').toLowerCase();
  return source.includes('cardmarket') || record?.importKey ? 'csv_import' : 'manual';
}

function comparableJson(value) {
  if (Array.isArray(value)) return `[${value.map(comparableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${comparableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function changedFields(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...keys].filter(key => comparableJson(before?.[key]) !== comparableJson(after?.[key])).sort();
}

function roundedMoney(value) {
  return Math.max(0, Math.round(numberValue(value) * 100) / 100);
}

function weightedAverage(rows, valueKey = 'unit_price') {
  let total = 0;
  let weight = 0;
  for (const row of rows) {
    const quantity = positiveQuantity(row.quantity);
    const value = numberValue(row[valueKey]);
    if (value <= 0) continue;
    total += value * quantity;
    weight += quantity;
  }
  return weight ? total / weight : 0;
}

function isCancelledStatus(status) {
  return /storniert|cancel|abgebrochen|refunded|erstattet/i.test(String(status || ''));
}

function isRealizedSaleStatus(status) {
  const value = String(status || '').trim();
  if (!value || isCancelledStatus(value)) return false;
  return /abgeschlossen|completed|received|angekommen|abgerechnet|settled/i.test(value);
}

function nullableMoney(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed * 100) / 100) : null;
}

function legacyCostStatus(item = {}) {
  if (['known', 'confirmed_zero', 'unknown'].includes(item.costStatus)) return item.costStatus;
  const cost = nullableMoney(item.cost);
  if (cost !== null && cost > 0) return 'known';
  if (item.purchaseId && (item.purchaseLineKey || item.costConfirmed === true)) return 'confirmed_zero';
  return 'unknown';
}

function upgradeInventoryItemToVersion9(item = {}, index = 0, now = isoNow()) {
  const result = { ...item };
  result.costStatus = legacyCostStatus(item);
  result.holdingProfile = String(item.holdingProfile || 'standard');
  result.longTermHold = Boolean(item.longTermHold);
  result.originalTargetSell = nullableMoney(item.originalTargetSell);
  result.listingHistory = Array.isArray(item.listingHistory)
    ? item.listingHistory.map(entry => ({ ...entry }))
    : [];
  const inventoryId = recordId(result, index);
  const listingPrice = nullableMoney(item.listingPrice);
  if (listingPrice !== null && listingPrice > 0 && result.listingHistory.length === 0) {
    result.listingHistory.push({
      id: `legacy-listing:${inventoryId}`,
      eventType: 'baseline',
      changedAt: String(item.listedAt || item.purchaseDate || now),
      oldPrice: null,
      newPrice: listingPrice,
      changeMode: 'legacy',
      reason: 'Beim Schema-9-Umstieg uebernommener Inseratspreis'
    });
  }
  return result;
}

function upgradeStateToVersion9(state = {}, now = isoNow()) {
  const result = { ...state };
  result.capitalAccounts = Array.isArray(state.capitalAccounts) ? state.capitalAccounts : [];
  result.capitalEntries = Array.isArray(state.capitalEntries) ? state.capitalEntries : [];
  result.inventory = (Array.isArray(state.inventory) ? state.inventory : [])
    .map((item, index) => upgradeInventoryItemToVersion9(item, index, now));
  result.privateCollection = (Array.isArray(state.privateCollection) ? state.privateCollection : [])
    .map((item, index) => upgradeInventoryItemToVersion9(item, index, now));
  return result;
}

function upgradeStateToVersion10(state = {}) {
  const result = { ...state };
  const upgradeAsset = item => ({
    ...item,
    targetSell: nullableMoney(item?.targetSell)
  });
  const upgradePurchase = purchase => ({
    ...purchase,
    pendingItems: (Array.isArray(purchase?.pendingItems) ? purchase.pendingItems : []).map(item => ({
      ...item,
      cartFillerStatus: ['yes', 'no'].includes(String(item?.cartFillerStatus || '')) ? String(item.cartFillerStatus) : 'unknown',
      incrementalShippingCost: nullableMoney(item?.incrementalShippingCost),
      incrementalDirectCost: nullableMoney(item?.incrementalDirectCost),
      decisionCostStatus: ['known', 'unknown'].includes(String(item?.decisionCostStatus || '')) ? String(item.decisionCostStatus) : 'unknown',
      confirmedTargetSellPrice: nullableMoney(item?.confirmedTargetSellPrice)
    }))
  });
  result.inventory = (Array.isArray(state.inventory) ? state.inventory : []).map(upgradeAsset);
  result.privateCollection = (Array.isArray(state.privateCollection) ? state.privateCollection : []).map(upgradeAsset);
  result.purchases = (Array.isArray(state.purchases) ? state.purchases : []).map(upgradePurchase);
  return result;
}

function upgradeStateToVersion11(state = {}) {
  const result = upgradeStateToVersion10(upgradeStateToVersion9(state));
  result.collectionPurchaseAnalyses = (Array.isArray(state.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : []).map((analysis, analysisIndex) => ({
    ...analysis,
    id: String(analysis?.id || `collection-analysis-${analysisIndex}`),
    sellerPrice: roundedMoney(analysis?.sellerPrice),
    shipping: roundedMoney(analysis?.shipping),
    extra: roundedMoney(analysis?.extra),
    actualPurchasePrice: nullableMoney(analysis?.actualPurchasePrice),
    items: (Array.isArray(analysis?.items) ? analysis.items : []).map((item, itemIndex) => ({
      ...item,
      id: String(item?.id || `${analysis?.id || `collection-analysis-${analysisIndex}`}:item:${itemIndex}`),
      productId: /^\d+$/.test(String(item?.productId || '').trim()) ? String(item.productId).trim() : '',
      quantity: positiveQuantity(item?.quantity),
      printConfidence: ['confirmed', 'likely', 'unknown'].includes(String(item?.printConfidence || '')) ? String(item.printConfidence) : 'unknown',
      condition: String(item?.condition || 'UNBEKANNT')
    })),
    decisionSnapshots: (Array.isArray(analysis?.decisionSnapshots) ? analysis.decisionSnapshots : []).map(snapshot => ({ ...snapshot }))
  }));
  return result;
}

function upgradeStateToVersion12(state = {}) {
  const result = upgradeStateToVersion11(state);
  result.collectionPurchaseAnalyses = result.collectionPurchaseAnalyses.map(analysis => ({
    ...analysis,
    ...collectionPhotoModel.normalizeAnalysisPhotoEvidence(analysis)
  }));
  return result;
}

function coreBusinessRecordCount(state = {}) {
  return [
    'inventory', 'privateCollection', 'purchases', 'sales',
    'collectionPurchaseAnalyses', 'purchaseDrafts',
    'expenses', 'materials', 'movements', 'reconciliations',
    'capitalAccounts', 'capitalEntries', 'sellers', 'customers'
  ].reduce((total, key) => total + (Array.isArray(state?.[key]) ? state[key].length : 0), 0);
}

class TcgDatabase {
  constructor({ databasePath, schemaPath, backupRoot, photoStore = null, onTiming = null }) {
    this.databasePath = databasePath;
    this.schemaPath = schemaPath;
    this.backupRoot = backupRoot;
    this.photoStore = photoStore;
    this.db = null;
    this.cardNameRecognitionIndex = null;
    this.databaseExistedBeforeOpen = false;
    this.databaseExistenceChecked = false;
    this.startupValidation = null;
    this.cardmarketImportSession = null;
    this.onTiming = typeof onTiming === 'function' ? onTiming : null;
  }

  recordTiming(name, startedAt, detail = {}) {
    if (!this.onTiming) return;
    this.onTiming({ name, durationMs: performance.now() - startedAt, detail });
  }

  open() {
    if (this.db) return this;

    const openStartedAt = performance.now();

    ensureDirectory(path.dirname(this.databasePath));
    ensureDirectory(this.backupRoot);

    if (!this.databaseExistenceChecked) {
      this.databaseExistedBeforeOpen = fs.existsSync(this.databasePath)
        && Number(fs.statSync(this.databasePath).size || 0) > 0;
      this.databaseExistenceChecked = true;
    }

    let stepStartedAt = performance.now();
    this.db = new DatabaseSync(this.databasePath);
    this.recordTiming('sqlite_connection_opened', stepStartedAt, { databasePath: this.databasePath });
    stepStartedAt = performance.now();
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
    this.db.exec('PRAGMA busy_timeout = 5000;');
    this.recordTiming('sqlite_pragmas_applied', stepStartedAt);

    const existingVersion = this.existingSchemaVersion();
    let migrationBackupPrepared = false;
    if (existingVersion !== null && existingVersion < CURRENT_SCHEMA_VERSION) {
      this.createMigrationBackup(existingVersion);
      migrationBackupPrepared = true;
    }

    stepStartedAt = performance.now();
    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    this.db.exec(schema);
    this.recordTiming('sqlite_schema_ensured', stepStartedAt);
    stepStartedAt = performance.now();
    this.runMigrations(migrationBackupPrepared);
    this.recordTiming('sqlite_migrations_checked', stepStartedAt, { existingVersion });
    stepStartedAt = performance.now();
    this.ensureDataSources();
    this.recordTiming('sqlite_data_sources_ensured', stepStartedAt);

    this.db.prepare(`
      INSERT INTO schema_version (version, applied_at)
      VALUES (?, ?)
      ON CONFLICT(version) DO NOTHING
    `).run(CURRENT_SCHEMA_VERSION, isoNow());

    this.recordTiming('sqlite_open_total', openStartedAt, { databasePath: this.databasePath });

    return this;
  }

  tableColumns(tableName) {
    return new Set(this.db.prepare(`PRAGMA table_info(${tableName})`).all().map(row => String(row.name)));
  }

  existingSchemaVersion() {
    const table = this.db.prepare(`
      SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'schema_version'
    `).get();
    if (!table) return null;
    return Number(this.db.prepare('SELECT MAX(version) AS version FROM schema_version').get()?.version || 0);
  }

  addColumnIfMissing(tableName, columnName, definition) {
    if (this.tableColumns(tableName).has(columnName)) return false;
    this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
    return true;
  }

  createMigrationBackup(fromVersion) {
    const dataCount = Number(this.db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM app_state) +
        (SELECT COUNT(*) FROM products) +
        (SELECT COUNT(*) FROM market_prices) AS count
    `).get()?.count || 0);
    if (dataCount <= 0) return '';

    const migrationRoot = path.join(this.backupRoot, 'Migrationen');
    ensureDirectory(migrationRoot);
    const stamp = isoNow().replace(/[:.]/g, '-');
    const targetPath = path.join(migrationRoot, `tcg_business_manager_v${fromVersion}_vor_v${CURRENT_SCHEMA_VERSION}_${stamp}.sqlite`);
    const sqlPath = targetPath.replace(/'/g, "''");
    this.db.exec(`VACUUM INTO '${sqlPath}';`);
    return targetPath;
  }

  runMigrations(migrationBackupPrepared = false) {
    const currentVersion = Number(this.db.prepare('SELECT MAX(version) AS version FROM schema_version').get()?.version || 0);
    if (currentVersion >= CURRENT_SCHEMA_VERSION) return;

    if (!migrationBackupPrepared) this.createMigrationBackup(currentVersion);
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      if (currentVersion < 4) this.migrateToVersion4();
      if (currentVersion < 5) this.migrateToVersion5();
      if (currentVersion < 6) this.migrateToVersion6();
      if (currentVersion < 7) this.migrateToVersion7();
      if (currentVersion < 9) this.migrateToVersion9();
      if (currentVersion < 10) this.migrateToVersion10();
      if (currentVersion < 11) this.migrateToVersion11();
      if (currentVersion < 12) this.migrateToVersion12();
      this.db.prepare(`
        INSERT INTO schema_version (version, applied_at)
        VALUES (?, ?)
        ON CONFLICT(version) DO NOTHING
      `).run(CURRENT_SCHEMA_VERSION, isoNow());
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw new Error(`SQLite-Migration auf Version ${CURRENT_SCHEMA_VERSION} fehlgeschlagen: ${error.message}`);
    }
  }

  migrateToVersion4() {
    this.addColumnIfMissing('products', 'search_text', "TEXT NOT NULL DEFAULT ''");
    this.addColumnIfMissing('products', 'search_compact', "TEXT NOT NULL DEFAULT ''");

    const mappingStatement = this.db.prepare(`
      INSERT INTO card_name_mappings (
        metacard_id, name_de, name_en, name_source, source_revision,
        match_method, match_status, updated_at
      )
      SELECT
        metacard_id,
        MAX(NULLIF(name_de, '')),
        MAX(COALESCE(NULLIF(name_en, ''), NULLIF(official_name, ''))),
        'legacy_sqlite', '', 'legacy_product_rows',
        CASE WHEN MAX(NULLIF(name_de, '')) IS NOT NULL THEN 'mapped' ELSE 'english_only' END,
        MAX(updated_at)
      FROM products
      WHERE NULLIF(metacard_id, '') IS NOT NULL
      GROUP BY metacard_id
      ON CONFLICT(metacard_id) DO UPDATE SET
        name_de = COALESCE(NULLIF(card_name_mappings.name_de, ''), excluded.name_de),
        name_en = COALESCE(NULLIF(card_name_mappings.name_en, ''), excluded.name_en),
        updated_at = MAX(card_name_mappings.updated_at, excluded.updated_at)
    `);
    mappingStatement.run();

    const selectProducts = this.db.prepare(`
      SELECT product_id, metacard_id, name_de, name_en, official_name,
             set_name, set_code, rarity, variant, collector_number,
             expansion_id, category_id
      FROM products
    `);
    const updateProduct = this.db.prepare(`
      UPDATE products SET search_text = ?, search_compact = ? WHERE product_id = ?
    `);
    for (const row of selectProducts.iterate()) {
      const document = cardSearch.buildSearchDocument([
        row.product_id, row.metacard_id, row.name_de, row.name_en, row.official_name,
        row.set_name, row.set_code, row.rarity, row.variant, row.collector_number,
        row.expansion_id ? `expansion ${row.expansion_id}` : '',
        row.category_id ? `category ${row.category_id}` : ''
      ]);
      updateProduct.run(document.spaced, document.compact, row.product_id);
    }
    this.rebuildCardSearchIndexes(null, false);
  }

  ensureDataSources() {
    const now = isoNow();
    const sources = [
      ['manual', 'manual', 'Manuelle Eingaben', 1, 0, 10, ''],
      ['csv_import', 'file_import', 'Cardmarket CSV-/HTML-Import', 1, 1, 20, ''],
      ['cardmarket_price_guide', 'official_download', 'Cardmarket Price Guide', 1, 1, 30, 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_3.json'],
      ['cardmarket_api', 'api', 'Cardmarket API (vorbereitet)', 0, 1, 40, 'https://apiv2.cardmarket.com/ws/v2.0'],
      ['cardmarket_settlement', 'file_import', 'Cardmarket Abrechnungen', 1, 1, 50, ''],
      ['legacy_state', 'migration', 'Bestehender Programmstand', 1, 1, 90, '']
    ];
    const statement = this.db.prepare(`
      INSERT INTO data_sources (
        source_id, source_type, display_name, enabled, read_only, priority,
        base_url, config_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)
      ON CONFLICT(source_id) DO UPDATE SET
        source_type = excluded.source_type,
        display_name = excluded.display_name,
        read_only = excluded.read_only,
        priority = excluded.priority,
        base_url = excluded.base_url,
        updated_at = excluded.updated_at
    `);
    for (const source of sources) statement.run(...source, now, now);
  }

  migrateToVersion5() {
    this.ensureDataSources();
    const now = isoNow();

    const unknownSources = this.db.prepare(`
      SELECT DISTINCT source_id FROM market_prices
      WHERE source_id NOT IN (SELECT source_id FROM data_sources)
    `).all();
    const addLegacySource = this.db.prepare(`
      INSERT OR IGNORE INTO data_sources (
        source_id, source_type, display_name, enabled, read_only, priority,
        base_url, config_json, created_at, updated_at
      ) VALUES (?, 'legacy_import', ?, 1, 1, 80, '', '{}', ?, ?)
    `);
    for (const row of unknownSources) {
      const id = String(row.source_id || 'legacy_state');
      addLegacySource.run(id, `Frühere Quelle: ${id}`, now, now);
    }

    this.db.exec(`
      INSERT OR IGNORE INTO market_observations (
        product_id, observed_at, observed_date, source_id, source_record_key,
        category_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
        avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
        data_quality, imported_at, raw_json
      )
      SELECT
        product_id,
        COALESCE(NULLIF(collected_at, ''), captured_date || 'T12:00:00.000Z'),
        captured_date,
        COALESCE(NULLIF(source_id, ''), 'legacy_state'),
        captured_date || '|' || product_id,
        category_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
        avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
        COALESCE(data_quality, 'legacy'), imported_at, '{}'
      FROM market_prices
    `);

    const stateRow = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (stateRow?.state_json) {
      try {
        const state = JSON.parse(stateRow.state_json);
        this.recordStateEvents(null, state, stateRow.updated_at || now, true);
        this.materializeState(state, stateRow.updated_at || now);
      } catch (error) {
        throw new Error(`Bestehender Programmstand konnte nicht normalisiert werden: ${error.message}`);
      }
    }
    this.refreshObservationSummaries();
  }

  migrateToVersion6() {
    this.ensureDataSources();
  }

  migrateToVersion7() {
    this.ensureDataSources();
    this.addColumnIfMissing('trade_orders', 'refunds', 'REAL NOT NULL DEFAULT 0');
    this.addColumnIfMissing('trade_lines', 'allocated_refund', 'REAL NOT NULL DEFAULT 0');
    this.addColumnIfMissing('pricing_recommendations', 'price_floor', 'REAL');
    this.addColumnIfMissing('pricing_recommendations', 'quick_sell', 'REAL');
    this.addColumnIfMissing('pricing_recommendations', 'model_version', "TEXT NOT NULL DEFAULT 'v1'");
    this.addColumnIfMissing('pricing_recommendations', 'volatility', 'REAL NOT NULL DEFAULT 0');
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return;
    const state = JSON.parse(row.state_json);
    this.materializeState(state, row.updated_at || isoNow());
  }

  migrateToVersion9() {
    this.ensureDataSources();
    this.addColumnIfMissing('inventory_assets', 'acquisition_cost_status', "TEXT NOT NULL DEFAULT 'unknown'");
    this.addColumnIfMissing('inventory_assets', 'original_target_sell', 'REAL');
    this.addColumnIfMissing('inventory_assets', 'current_listing_price', 'REAL');
    this.addColumnIfMissing('inventory_assets', 'is_listed', 'INTEGER NOT NULL DEFAULT 0');
    this.addColumnIfMissing('inventory_assets', 'holding_profile', "TEXT NOT NULL DEFAULT ''");
    this.addColumnIfMissing('inventory_assets', 'long_term_hold', 'INTEGER NOT NULL DEFAULT 0');
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return;
    const updatedAt = row.updated_at || isoNow();
    const state = upgradeStateToVersion9(JSON.parse(row.state_json), updatedAt);
    this.materializeState(state, updatedAt);
    this.db.prepare('UPDATE app_state SET state_json = ?, updated_at = ? WHERE id = 1')
      .run(JSON.stringify(state), updatedAt);
  }

  migrateToVersion10() {
    this.ensureDataSources();
    this.addColumnIfMissing('purchase_receipt_lines', 'cart_filler_status', "TEXT NOT NULL DEFAULT 'unknown'");
    this.addColumnIfMissing('purchase_receipt_lines', 'incremental_shipping_cost', 'REAL');
    this.addColumnIfMissing('purchase_receipt_lines', 'incremental_direct_cost', 'REAL');
    this.addColumnIfMissing('purchase_receipt_lines', 'decision_cost_status', "TEXT NOT NULL DEFAULT 'unknown'");
    this.addColumnIfMissing('purchase_receipt_lines', 'confirmed_target_sell_price', 'REAL');
    this.addColumnIfMissing('inventory_assets', 'current_target_sell', 'REAL');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_inventory_assets_sale_product ON inventory_assets(sale_id, product_id, ownership, archived);');
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return;
    const updatedAt = row.updated_at || isoNow();
    const state = upgradeStateToVersion10(JSON.parse(row.state_json));
    this.materializeState(state, updatedAt);
    this.db.prepare('UPDATE app_state SET state_json = ?, updated_at = ? WHERE id = 1')
      .run(JSON.stringify(state), updatedAt);
  }

  migrateToVersion11() {
    this.ensureDataSources();
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return;
    const updatedAt = row.updated_at || isoNow();
    const state = upgradeStateToVersion11(JSON.parse(row.state_json));
    this.materializeState(state, updatedAt);
    this.db.prepare('UPDATE app_state SET state_json = ?, updated_at = ? WHERE id = 1')
      .run(JSON.stringify(state), updatedAt);
  }

  migrateToVersion12() {
    this.ensureDataSources();
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    if (!row?.state_json) return;
    const updatedAt = row.updated_at || isoNow();
    const state = upgradeStateToVersion12(JSON.parse(row.state_json));
    this.materializeState(state, updatedAt);
    this.db.prepare('UPDATE app_state SET state_json = ?, updated_at = ? WHERE id = 1')
      .run(JSON.stringify(state), updatedAt);
  }

  close() {
    if (!this.db) return;
    if (this.cardmarketImportSession) {
      try { this.db.exec('ROLLBACK;'); } catch (_error) { /* Verbindung wird unmittelbar geschlossen. */ }
      this.cardmarketImportSession = null;
    }
    this.db.close();
    this.db = null;
    this.cardNameRecognitionIndex = null;
  }

  ensureSnapshotSummaries() {
    const totalStartedAt = performance.now();
    let stepStartedAt = performance.now();
    const expected = Number(this.db.prepare(`
      SELECT COUNT(DISTINCT captured_date) AS count FROM market_prices
    `).get()?.count || 0);
    this.recordTiming('snapshot_summary_expected_count', stepStartedAt, { expected });
    stepStartedAt = performance.now();
    const existing = Number(this.db.prepare(`
      SELECT COUNT(*) AS count FROM market_snapshot_summary
    `).get()?.count || 0);
    this.recordTiming('snapshot_summary_existing_count', stepStartedAt, { existing });
    if (expected === existing) {
      this.recordTiming('snapshot_summary_check_total', totalStartedAt, { expected, existing, rebuilt: false });
      return { expected, existing, rebuilt: false };
    }

    stepStartedAt = performance.now();
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
      this.recordTiming('snapshot_summary_rebuilt', stepStartedAt, { expected, existing });
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }
    this.recordTiming('snapshot_summary_check_total', totalStartedAt, { expected, existing, rebuilt: true });
    return { expected, existing, rebuilt: true };
  }

  refreshObservationSummaries() {
    this.db.exec('DELETE FROM market_observation_summary;');
    this.db.exec(`
      INSERT INTO market_observation_summary (
        source_id, observed_date, row_count, first_imported_at, updated_at
      )
      SELECT source_id, observed_date, COUNT(*), MIN(imported_at), MAX(imported_at)
      FROM market_observations
      GROUP BY source_id, observed_date
    `);
  }

  ensureObservationSummaries() {
    const totalStartedAt = performance.now();
    let stepStartedAt = performance.now();
    const expected = Number(this.db.prepare(`
      SELECT COUNT(*) AS count FROM (
        SELECT source_id, observed_date FROM market_observations GROUP BY source_id, observed_date
      )
    `).get()?.count || 0);
    this.recordTiming('observation_summary_expected_count', stepStartedAt, { expected });
    stepStartedAt = performance.now();
    const existing = Number(this.db.prepare('SELECT COUNT(*) AS count FROM market_observation_summary').get()?.count || 0);
    this.recordTiming('observation_summary_existing_count', stepStartedAt, { existing });
    if (expected !== existing) {
      stepStartedAt = performance.now();
      this.refreshObservationSummaries();
      this.recordTiming('observation_summary_rebuilt', stepStartedAt, { expected, existing });
    }
    this.recordTiming('observation_summary_check_total', totalStartedAt, { expected, existing, rebuilt: expected !== existing });
    return { expected, existing, rebuilt: expected !== existing };
  }

  getStatus() {
    this.open();
    const stateRow = this.db.prepare('SELECT updated_at FROM app_state WHERE id = 1').get();
    const productRow = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
    const priceRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get();
    const snapshotRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_snapshot_summary').get();
    const lastSnapshot = this.db.prepare('SELECT MAX(captured_date) AS date FROM market_prices').get();
    const eventRow = this.db.prepare('SELECT COUNT(*) AS count FROM business_events').get();
    const tradeLineRow = this.db.prepare('SELECT COUNT(*) AS count FROM trade_lines WHERE archived = 0').get();
    const observationRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_observations').get();
    const recentCardmarketImports = this.db.prepare(`
      SELECT run_id AS runId, source, snapshot_date AS snapshotDate,
             started_at AS startedAt, finished_at AS finishedAt, status,
             rows_read AS rowsRead, rows_written AS rowsWritten,
             skipped_rows AS skippedRows, error_message AS errorMessage
      FROM import_runs
      WHERE source IN ('cardmarket_price_guide', 'cardmarket_product_catalog')
         OR source LIKE 'cardmarket_%'
      ORDER BY COALESCE(NULLIF(finished_at, ''), started_at) DESC
      LIMIT 5
    `).all();
    const lastSuccessfulImport = this.db.prepare(`
      SELECT run_id AS runId, source, snapshot_date AS snapshotDate,
             started_at AS startedAt, finished_at AS finishedAt, status,
             rows_read AS rowsRead, rows_written AS rowsWritten,
             skipped_rows AS skippedRows, error_message AS errorMessage
      FROM import_runs
      WHERE status = 'success'
        AND (source IN ('cardmarket_price_guide', 'cardmarket_product_catalog') OR source LIKE 'cardmarket_%')
      ORDER BY COALESCE(NULLIF(finished_at, ''), started_at) DESC
      LIMIT 1
    `).get() || null;

    return {
      ready: true,
      databasePath: this.databasePath,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      stateUpdatedAt: stateRow?.updated_at || '',
      productCount: Number(productRow?.count || 0),
      marketPriceCount: Number(priceRow?.count || 0),
      marketObservationCount: Number(observationRow?.count || 0),
      businessEventCount: Number(eventRow?.count || 0),
      activeTradeLineCount: Number(tradeLineRow?.count || 0),
      snapshotCount: Number(snapshotRow?.count || 0),
      latestSnapshotDate: lastSnapshot?.date || '',
      lastSuccessfulImport,
      recentCardmarketImports,
      startupValidation: this.startupValidation
    };
  }

  validateStartup() {
    const validationStartedAt = performance.now();
    this.open();
    const requiredTables = [
      'schema_version', 'app_state', 'products', 'market_prices',
      'trade_orders', 'trade_lines', 'inventory_assets'
    ];
    const presentTables = new Set(this.db.prepare(`
      SELECT name FROM sqlite_master WHERE type = 'table'
    `).all().map(row => String(row.name)));
    const missingTables = requiredTables.filter(tableName => !presentTables.has(tableName));
    if (missingTables.length) {
      throw new Error(`SQLite-Startprüfung fehlgeschlagen: Tabellen fehlen (${missingTables.join(', ')}).`);
    }

    const schemaVersion = Number(this.db.prepare('SELECT MAX(version) AS version FROM schema_version').get()?.version || 0);
    if (schemaVersion !== CURRENT_SCHEMA_VERSION) {
      throw new Error(`SQLite-Startprüfung fehlgeschlagen: Schema ${schemaVersion} statt ${CURRENT_SCHEMA_VERSION}.`);
    }

    // Die Marktpreistabellen koennen mehrere Gigabyte gross werden. Ein globales
    // quick_check und foreign_key_check blockierte deshalb jeden Programmstart,
    // obwohl diese wiederaufbaubaren Daten bereits atomar importiert werden.
    // Vor der Startfreigabe werden weiterhin alle dauerhaften Geschaeftstabellen
    // inklusive App-State, Bestand, Kaeufen und Verkaeufen vollstaendig geprueft.
    const businessCriticalTables = [
      'app_state', 'trade_orders', 'trade_lines', 'inventory_assets',
      'purchase_receipt_lines', 'inventory_listing_history',
      'capital_accounts', 'capital_ledger_entries',
      'collection_purchase_analyses', 'collection_purchase_items',
      'collection_purchase_decision_snapshots', 'collection_purchase_photos',
      'collection_physical_cards', 'collection_card_observations'
    ];
    for (const tableName of businessCriticalTables) {
      if (!presentTables.has(tableName)) continue;
      let stepStartedAt = performance.now();
      const quickCheckRows = this.db.prepare(`PRAGMA quick_check(${tableName});`).all();
      this.recordTiming('startup_table_quick_check', stepStartedAt, { tableName });
      const quickCheckMessages = quickCheckRows
        .map(row => String(row.quick_check ?? Object.values(row)[0] ?? ''))
        .filter(Boolean);
      if (quickCheckMessages.length !== 1 || quickCheckMessages[0].toLowerCase() !== 'ok') {
        throw new Error(`SQLite-Integritätsprüfung fehlgeschlagen (${tableName}): ${quickCheckMessages.join('; ') || 'kein Ergebnis'}.`);
      }
      stepStartedAt = performance.now();
      const foreignKeyErrors = this.db.prepare(`PRAGMA foreign_key_check(${tableName});`).all();
      this.recordTiming('startup_table_foreign_key_check', stepStartedAt, { tableName });
      if (foreignKeyErrors.length) {
        throw new Error(`SQLite-Konsistenzprüfung fehlgeschlagen (${tableName}): ${foreignKeyErrors.length} ungültige Fremdschlüssel.`);
      }
    }

    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    let state = null;
    if (row?.state_json) {
      try {
        const parseStartedAt = performance.now();
        state = JSON.parse(row.state_json);
        this.recordTiming('startup_validation_state_json_parsed', parseStartedAt, { bytes: this.onTiming ? Buffer.byteLength(row.state_json, 'utf8') : 0 });
      } catch (error) {
        throw new Error(`SQLite-Startprüfung fehlgeschlagen: Der gespeicherte Programmstand ist beschädigt (${error.message}).`);
      }
      if (!state || typeof state !== 'object' || Array.isArray(state)) {
        throw new Error('SQLite-Startprüfung fehlgeschlagen: Der gespeicherte Programmstand ist kein gültiges Objekt.');
      }
      for (const key of ['inventory', 'privateCollection', 'purchases', 'sales']) {
        if (state[key] !== undefined && !Array.isArray(state[key])) {
          throw new Error(`SQLite-Startprüfung fehlgeschlagen: ${key} ist keine gültige Liste.`);
        }
      }
    }

    const expectedCounts = {
      inventory: Array.isArray(state?.inventory) ? state.inventory.length : 0,
      privateCollection: Array.isArray(state?.privateCollection) ? state.privateCollection.length : 0,
      purchases: Array.isArray(state?.purchases) ? state.purchases.length : 0,
      sales: Array.isArray(state?.sales) ? state.sales.length : 0
    };
    const materializedCounts = {
      inventory: Number(this.db.prepare("SELECT COUNT(*) AS count FROM inventory_assets WHERE archived = 0 AND ownership = 'business'").get()?.count || 0),
      privateCollection: Number(this.db.prepare("SELECT COUNT(*) AS count FROM inventory_assets WHERE archived = 0 AND ownership = 'private'").get()?.count || 0),
      purchases: Number(this.db.prepare("SELECT COUNT(*) AS count FROM trade_orders WHERE archived = 0 AND trade_type = 'purchase'").get()?.count || 0),
      sales: Number(this.db.prepare("SELECT COUNT(*) AS count FROM trade_orders WHERE archived = 0 AND trade_type = 'sale'").get()?.count || 0)
    };
    const countMismatches = Object.keys(expectedCounts)
      .filter(key => expectedCounts[key] !== materializedCounts[key])
      .map(key => `${key}: App-State ${expectedCounts[key]}, SQLite ${materializedCounts[key]}`);
    if (countMismatches.length) {
      throw new Error(`SQLite-Startprüfung fehlgeschlagen: App-State und Tabellen stimmen nicht überein (${countMismatches.join('; ')}).`);
    }

    const coreRecordCount = coreBusinessRecordCount(state);
    this.startupValidation = Object.freeze({
      valid: true,
      checkedAt: isoNow(),
      integrity: 'ok',
      integrityScope: 'business-critical',
      foreignKeys: 'ok',
      schemaVersion,
      hasStoredState: Boolean(row?.state_json),
      isEmpty: coreRecordCount === 0,
      coreRecordCount,
      databaseExistedBeforeOpen: this.databaseExistedBeforeOpen,
      counts: { ...expectedCounts }
    });
    this.recordTiming('startup_validation_total', validationStartedAt, { coreRecordCount });
    return this.startupValidation;
  }

  loadState() {
    this.open();
    let stepStartedAt = performance.now();
    const row = this.db.prepare('SELECT state_json, updated_at FROM app_state WHERE id = 1').get();
    this.recordTiming('app_state_loaded', stepStartedAt, { hasState: Boolean(row?.state_json), bytes: this.onTiming && row?.state_json ? Buffer.byteLength(row.state_json, 'utf8') : 0 });
    if (!row?.state_json) return { state: null, updatedAt: '', validation: this.startupValidation };

    try {
      stepStartedAt = performance.now();
      const state = JSON.parse(row.state_json);
      this.recordTiming('state_json_parsed', stepStartedAt, { bytes: this.onTiming ? Buffer.byteLength(row.state_json, 'utf8') : 0 });
      return {
        state,
        updatedAt: row.updated_at || '',
        validation: this.startupValidation
      };
    } catch (error) {
      throw new Error(`Gespeicherter Programmstand ist beschädigt: ${error.message}`);
    }
  }

  saveState(state, { allowDestructiveReset = false } = {}) {
    const saveStartedAt = performance.now();
    this.open();
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      throw new TypeError('Der Programmstand ist ungültig.');
    }

    state = upgradeStateToVersion12(state);
    const updatedAt = isoNow();
    let stepStartedAt = performance.now();
    const json = JSON.stringify(state);
    this.recordTiming('save_state_json_stringified', stepStartedAt, { bytes: this.onTiming ? Buffer.byteLength(json, 'utf8') : 0 });
    stepStartedAt = performance.now();
    const previousRow = this.db.prepare('SELECT state_json FROM app_state WHERE id = 1').get();
    this.recordTiming('save_previous_state_loaded', stepStartedAt, { bytes: this.onTiming && previousRow?.state_json ? Buffer.byteLength(previousRow.state_json, 'utf8') : 0 });
    let previousState = null;
    if (previousRow?.state_json) {
      try {
        stepStartedAt = performance.now();
        previousState = JSON.parse(previousRow.state_json);
        this.recordTiming('save_previous_state_parsed', stepStartedAt);
      } catch {
        previousState = null;
      }
    }

    const previousBusinessRecords = coreBusinessRecordCount(previousState);
    const nextBusinessRecords = coreBusinessRecordCount(state);
    if (!allowDestructiveReset && previousBusinessRecords > 0 && nextBusinessRecords === 0) {
      throw new Error(
        'Sicherheitsabbruch: Ein gefüllter Programmstand darf nicht durch einen vollständig leeren Startzustand ersetzt werden.'
      );
    }

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      stepStartedAt = performance.now();
      this.recordStateEvents(previousState, state, updatedAt, !previousState);
      this.recordTiming('save_state_events_recorded', stepStartedAt);
      stepStartedAt = performance.now();
      this.materializeState(state, updatedAt);
      this.recordTiming('save_state_materialized', stepStartedAt);
      stepStartedAt = performance.now();
      this.db.prepare(`
        INSERT INTO app_state (id, state_json, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          state_json = excluded.state_json,
          updated_at = excluded.updated_at
      `).run(json, updatedAt);
      this.db.exec('COMMIT;');
      this.recordTiming('save_state_committed', stepStartedAt);
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    if (state?.settings?.autoBackup !== false) {
      this.createDailyBackup(json, updatedAt, state?.settings?.backupRetentionDays);
      this.photoStore?.createAutomaticAttachmentBackup(
        state,
        dateStamp(new Date(updatedAt)),
        state?.settings?.backupRetentionDays
      );
    }
    this.cardNameRecognitionIndex = null;
    this.recordTiming('save_state_total', saveStartedAt, { bytes: this.onTiming ? Buffer.byteLength(json, 'utf8') : 0 });
    return {
      ok: true,
      updatedAt,
      bytes: Buffer.byteLength(json, 'utf8'),
      tradeDatabase: this.getTradeDatabaseStatus()
    };
  }

  recordStateEvents(previousState, nextState, savedAt, baseline = false) {
    const collections = [
      ['purchase', 'purchases'],
      ['sale', 'sales'],
      ['inventory', 'inventory'],
      ['private_inventory', 'privateCollection'],
      ['settlement', 'reconciliations'],
      ['capital_account', 'capitalAccounts'],
      ['capital_entry', 'capitalEntries'],
      ['collection_purchase_analysis', 'collectionPurchaseAnalyses']
    ];
    const insert = this.db.prepare(`
      INSERT INTO business_events (
        entity_type, entity_id, event_type, occurred_at, source_id,
        before_json, after_json, changed_fields_json, state_saved_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const [entityType, collectionName] of collections) {
      const beforeRows = Array.isArray(previousState?.[collectionName]) ? previousState[collectionName] : [];
      const afterRows = Array.isArray(nextState?.[collectionName]) ? nextState[collectionName] : [];
      const beforeMap = new Map(beforeRows.map((row, index) => [recordId(row, index), row]));
      const afterMap = new Map(afterRows.map((row, index) => [recordId(row, index), row]));

      for (const [entityId, after] of afterMap) {
        const before = beforeMap.get(entityId);
        const fields = before ? changedFields(before, after) : Object.keys(after || {}).sort();
        if (before && fields.length === 0) continue;
        const eventType = before ? 'update' : (baseline ? 'baseline' : 'create');
        insert.run(
          entityType, entityId, eventType, savedAt,
          baseline ? 'legacy_state' : recordSource(after),
          before ? JSON.stringify(before) : null,
          JSON.stringify(after), JSON.stringify(fields), savedAt
        );
      }

      for (const [entityId, before] of beforeMap) {
        if (afterMap.has(entityId)) continue;
        insert.run(
          entityType, entityId, 'delete', savedAt, recordSource(before),
          JSON.stringify(before), null, JSON.stringify(Object.keys(before || {}).sort()), savedAt
        );
      }
    }

    const beforeSettings = previousState?.settings && typeof previousState.settings === 'object'
      ? previousState.settings
      : null;
    const afterSettings = nextState?.settings && typeof nextState.settings === 'object'
      ? nextState.settings
      : {};
    if (beforeSettings) {
      const fields = changedFields(beforeSettings, afterSettings);
      if (fields.length) {
        insert.run(
          'settings', 'global', 'update', savedAt, 'manual',
          JSON.stringify(beforeSettings), JSON.stringify(afterSettings), JSON.stringify(fields), savedAt
        );
      }
    }
  }

  materializeState(state, updatedAt) {
    const purchases = Array.isArray(state?.purchases) ? state.purchases : [];
    const sales = Array.isArray(state?.sales) ? state.sales : [];
    const inventory = Array.isArray(state?.inventory) ? state.inventory : [];
    const privateCollection = Array.isArray(state?.privateCollection) ? state.privateCollection : [];
    const capitalAccounts = Array.isArray(state?.capitalAccounts) ? state.capitalAccounts : [];
    const capitalEntries = Array.isArray(state?.capitalEntries) ? state.capitalEntries : [];
    const collectionAnalyses = Array.isArray(state?.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : [];
    const settings = state?.settings || {};
    const inventoryById = new Map(inventory.map((row, index) => [recordId(row, index), row]));

    this.db.exec(`
      UPDATE trade_lines SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}'
      WHERE materialized_from = 'app_state' AND archived = 0;
      UPDATE trade_orders SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}'
      WHERE materialized_from = 'app_state' AND archived = 0;
      UPDATE purchase_receipt_lines SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE inventory_assets SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE inventory_listing_history SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE capital_ledger_entries SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE capital_accounts SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_card_observations SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_physical_cards SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_purchase_photos SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_purchase_decision_snapshots SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_purchase_items SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE collection_purchase_analyses SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
    `);

    const upsertOrder = this.db.prepare(`
      INSERT INTO trade_orders (
        order_key, trade_type, local_order_id, origin_source_id, materialized_from,
        external_order_id, order_no, transaction_date, partner, country, status,
        card_value, shipping, extra, fees, postage, refunds, cost, revenue,
        archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, 'app_state', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(order_key) DO UPDATE SET
        origin_source_id = excluded.origin_source_id,
        external_order_id = excluded.external_order_id,
        order_no = excluded.order_no,
        transaction_date = excluded.transaction_date,
        partner = excluded.partner,
        country = excluded.country,
        status = excluded.status,
        card_value = excluded.card_value,
        shipping = excluded.shipping,
        extra = excluded.extra,
        fees = excluded.fees,
        postage = excluded.postage,
        refunds = excluded.refunds,
        cost = excluded.cost,
        revenue = excluded.revenue,
        archived = 0,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at
    `);
    const upsertLine = this.db.prepare(`
      INSERT INTO trade_lines (
        line_key, order_key, trade_type, local_order_id, origin_source_id, materialized_from,
        external_article_id, product_id, metacard_id, card_name, set_name, rarity,
        language, card_condition, quantity, unit_price, allocated_shipping,
        allocated_extra, unit_cost, unit_net, allocated_refund, status, transaction_date,
        archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'app_state', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(line_key) DO UPDATE SET
        order_key = excluded.order_key,
        origin_source_id = excluded.origin_source_id,
        external_article_id = excluded.external_article_id,
        product_id = excluded.product_id,
        metacard_id = excluded.metacard_id,
        card_name = excluded.card_name,
        set_name = excluded.set_name,
        rarity = excluded.rarity,
        language = excluded.language,
        card_condition = excluded.card_condition,
        quantity = excluded.quantity,
        unit_price = excluded.unit_price,
        allocated_shipping = excluded.allocated_shipping,
        allocated_extra = excluded.allocated_extra,
        unit_cost = excluded.unit_cost,
        unit_net = excluded.unit_net,
        allocated_refund = excluded.allocated_refund,
        status = excluded.status,
        transaction_date = excluded.transaction_date,
        archived = 0,
        raw_json = excluded.raw_json,
        updated_at = excluded.updated_at
    `);

    const upsertReceiptLine = this.db.prepare(`
      INSERT INTO purchase_receipt_lines (
        receipt_line_key, purchase_id, order_no, source_row, product_id,
        ordered_quantity, business_quantity, private_quantity, damaged_quantity,
        cancelled_quantity, open_quantity, unit_price, allocated_shipping,
        allocated_extra, unit_cost, cart_filler_status, incremental_shipping_cost,
        incremental_direct_cost, decision_cost_status, confirmed_target_sell_price,
        allocation_method, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(receipt_line_key) DO UPDATE SET
        purchase_id=excluded.purchase_id, order_no=excluded.order_no,
        source_row=excluded.source_row, product_id=excluded.product_id,
        ordered_quantity=excluded.ordered_quantity, business_quantity=excluded.business_quantity,
        private_quantity=excluded.private_quantity, damaged_quantity=excluded.damaged_quantity,
        cancelled_quantity=excluded.cancelled_quantity, open_quantity=excluded.open_quantity,
        unit_price=excluded.unit_price, allocated_shipping=excluded.allocated_shipping,
        allocated_extra=excluded.allocated_extra, unit_cost=excluded.unit_cost,
        cart_filler_status=excluded.cart_filler_status,
        incremental_shipping_cost=excluded.incremental_shipping_cost,
        incremental_direct_cost=excluded.incremental_direct_cost,
        decision_cost_status=excluded.decision_cost_status,
        confirmed_target_sell_price=excluded.confirmed_target_sell_price,
        allocation_method=excluded.allocation_method, archived=0,
        raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertAsset = this.db.prepare(`
      INSERT INTO inventory_assets (
        inventory_id, ownership, purchase_id, purchase_line_key, sale_id,
        product_id, card_name, set_name, collector_number, rarity, language,
        card_condition, acquisition_cost, acquisition_cost_status, acquisition_date,
        original_target_sell, current_target_sell, current_listing_price, is_listed, holding_profile,
        long_term_hold, status, location, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(inventory_id) DO UPDATE SET
        ownership=excluded.ownership, purchase_id=excluded.purchase_id,
        purchase_line_key=excluded.purchase_line_key, sale_id=excluded.sale_id,
        product_id=excluded.product_id, card_name=excluded.card_name,
        set_name=excluded.set_name, collector_number=excluded.collector_number,
        rarity=excluded.rarity, language=excluded.language,
        card_condition=excluded.card_condition, acquisition_cost=excluded.acquisition_cost,
        acquisition_cost_status=excluded.acquisition_cost_status,
        acquisition_date=excluded.acquisition_date,
        original_target_sell=excluded.original_target_sell,
        current_target_sell=excluded.current_target_sell,
        current_listing_price=excluded.current_listing_price,
        is_listed=excluded.is_listed, holding_profile=excluded.holding_profile,
        long_term_hold=excluded.long_term_hold, status=excluded.status,
        location=excluded.location, archived=0, raw_json=excluded.raw_json,
        updated_at=excluded.updated_at
    `);

    const writeAsset = (item, index, ownership) => upsertAsset.run(
      recordId(item, index), ownership, String(item.purchaseId || ''),
      String(item.purchaseLineKey || ''), String(item.saleId || ''),
      /^\d+$/.test(String(item.productId || '').trim()) ? String(item.productId).trim() : '',
      String(item.name || ''), String(item.setName || item.set || ''),
      String(item.collectorNumber || ''), String(item.rarity || item.version || ''),
      String(item.language || ''), String(item.condition || ''), numberValue(item.cost),
      legacyCostStatus(item), String(item.purchaseDate || ''), nullableMoney(item.originalTargetSell),
      nullableMoney(item.targetSell), nullableMoney(item.listingPrice), item.listed ? 1 : 0,
      String(item.holdingProfile || 'standard'), item.longTermHold ? 1 : 0,
      String(item.status || ''), String(item.location || ''),
      JSON.stringify(item), updatedAt
    );
    inventory.forEach((item, index) => writeAsset(item, index, 'business'));
    privateCollection.forEach((item, index) => writeAsset(item, index, 'private'));

    const upsertListingHistory = this.db.prepare(`
      INSERT INTO inventory_listing_history (
        history_id, inventory_id, event_type, changed_at, old_price, new_price,
        change_mode, reason, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(history_id) DO UPDATE SET
        inventory_id=excluded.inventory_id, event_type=excluded.event_type,
        changed_at=excluded.changed_at, old_price=excluded.old_price,
        new_price=excluded.new_price, change_mode=excluded.change_mode,
        reason=excluded.reason, archived=0, raw_json=excluded.raw_json,
        updated_at=excluded.updated_at
    `);
    const writeListingHistory = (item, index) => {
      const inventoryId = recordId(item, index);
      (Array.isArray(item.listingHistory) ? item.listingHistory : []).forEach((entry, historyIndex) => {
        const eventType = ['original_target', 'first_listing', 'price_change', 'unlisted', 'baseline'].includes(entry.eventType)
          ? entry.eventType : 'price_change';
        const changeMode = ['manual', 'suggested', 'import', 'legacy'].includes(entry.changeMode)
          ? entry.changeMode : 'manual';
        upsertListingHistory.run(
          String(entry.id || `${inventoryId}:listing:${historyIndex}`), inventoryId, eventType,
          String(entry.changedAt || updatedAt), nullableMoney(entry.oldPrice), nullableMoney(entry.newPrice),
          changeMode, String(entry.reason || ''), JSON.stringify(entry), updatedAt
        );
      });
    };
    inventory.forEach(writeListingHistory);
    privateCollection.forEach(writeListingHistory);

    const upsertCapitalAccount = this.db.prepare(`
      INSERT INTO capital_accounts (
        account_id, name, account_type, currency, active, notes, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(account_id) DO UPDATE SET
        name=excluded.name, account_type=excluded.account_type,
        currency=excluded.currency, active=excluded.active, notes=excluded.notes,
        archived=0, raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    capitalAccounts.forEach((account, index) => upsertCapitalAccount.run(
      recordId(account, index), String(account.name || 'Handelskonto'),
      ['cardmarket', 'bank', 'cash', 'other'].includes(account.type) ? account.type : 'other',
      String(account.currency || 'EUR'), account.active === false ? 0 : 1,
      String(account.notes || ''), JSON.stringify(account), updatedAt
    ));
    const accountIds = new Set(capitalAccounts.map((account, index) => recordId(account, index)));
    const upsertCapitalEntry = this.db.prepare(`
      INSERT INTO capital_ledger_entries (
        entry_id, account_id, transfer_id, entry_type, occurred_at, amount,
        description, reference_type, reference_id, source_id, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(entry_id) DO UPDATE SET
        account_id=excluded.account_id, transfer_id=excluded.transfer_id,
        entry_type=excluded.entry_type, occurred_at=excluded.occurred_at,
        amount=excluded.amount, description=excluded.description,
        reference_type=excluded.reference_type, reference_id=excluded.reference_id,
        source_id=excluded.source_id, archived=0, raw_json=excluded.raw_json,
        updated_at=excluded.updated_at
    `);
    capitalEntries.forEach((entry, index) => {
      const accountId = String(entry.accountId || '');
      if (!accountIds.has(accountId)) return;
      const entryType = ['opening', 'deposit', 'withdrawal', 'purchase', 'sale', 'fee', 'refund', 'correction', 'transfer'].includes(entry.type)
        ? entry.type : 'correction';
      upsertCapitalEntry.run(
        recordId(entry, index), accountId, String(entry.transferId || ''), entryType,
        String(entry.date || entry.occurredAt || updatedAt), numberValue(entry.amount),
        String(entry.description || ''), String(entry.referenceType || ''),
        String(entry.referenceId || ''), recordSource(entry), JSON.stringify(entry), updatedAt
      );
    });

    const upsertCollection = this.db.prepare(`
      INSERT INTO collection_purchase_analyses (
        analysis_id, title, source_type, seller_name, source_url, analysis_date,
        seller_price, shipping, extra_cost, actual_purchase_price, decision,
        blind_max_ek, confirmed_max_ek, first_offer, conservative_value,
        potential_value, linked_purchase_id, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(analysis_id) DO UPDATE SET
        title=excluded.title, source_type=excluded.source_type, seller_name=excluded.seller_name,
        source_url=excluded.source_url, analysis_date=excluded.analysis_date,
        seller_price=excluded.seller_price, shipping=excluded.shipping, extra_cost=excluded.extra_cost,
        actual_purchase_price=excluded.actual_purchase_price, decision=excluded.decision,
        blind_max_ek=excluded.blind_max_ek, confirmed_max_ek=excluded.confirmed_max_ek,
        first_offer=excluded.first_offer, conservative_value=excluded.conservative_value,
        potential_value=excluded.potential_value, linked_purchase_id=excluded.linked_purchase_id,
        archived=0, raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertCollectionItem = this.db.prepare(`
      INSERT INTO collection_purchase_items (
        item_id, analysis_id, product_id, card_name, set_name, collector_number,
        rarity, quantity, card_condition, language, print_confidence,
        reference_value, conservative_value, potential_value, max_ek_contribution,
        economic_relevant, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(item_id) DO UPDATE SET
        analysis_id=excluded.analysis_id, product_id=excluded.product_id,
        card_name=excluded.card_name, set_name=excluded.set_name,
        collector_number=excluded.collector_number, rarity=excluded.rarity,
        quantity=excluded.quantity, card_condition=excluded.card_condition,
        language=excluded.language, print_confidence=excluded.print_confidence,
        reference_value=excluded.reference_value, conservative_value=excluded.conservative_value,
        potential_value=excluded.potential_value, max_ek_contribution=excluded.max_ek_contribution,
        economic_relevant=excluded.economic_relevant, archived=0,
        raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertCollectionSnapshot = this.db.prepare(`
      INSERT INTO collection_purchase_decision_snapshots (
        snapshot_id, analysis_id, decided_at, decision, seller_price, total_cost,
        nominal_value, realistic_value, conservative_value, potential_value,
        uncertainty_value, bulk_value, blind_max_ek, confirmed_max_ek,
        first_offer, actual_purchase_price, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(snapshot_id) DO UPDATE SET
        analysis_id=excluded.analysis_id, decided_at=excluded.decided_at,
        decision=excluded.decision, seller_price=excluded.seller_price,
        total_cost=excluded.total_cost, nominal_value=excluded.nominal_value,
        realistic_value=excluded.realistic_value, conservative_value=excluded.conservative_value,
        potential_value=excluded.potential_value, uncertainty_value=excluded.uncertainty_value,
        bulk_value=excluded.bulk_value, blind_max_ek=excluded.blind_max_ek,
        confirmed_max_ek=excluded.confirmed_max_ek, first_offer=excluded.first_offer,
        actual_purchase_price=excluded.actual_purchase_price, archived=0,
        raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertCollectionPhoto = this.db.prepare(`
      INSERT INTO collection_purchase_photos (
        photo_id, analysis_id, sequence_no, binder_page, relative_path,
        original_file_name, mime_type, file_size, pixel_width, pixel_height,
        sha256, created_at, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(photo_id) DO UPDATE SET
        analysis_id=excluded.analysis_id, sequence_no=excluded.sequence_no,
        binder_page=excluded.binder_page, relative_path=excluded.relative_path,
        original_file_name=excluded.original_file_name, mime_type=excluded.mime_type,
        file_size=excluded.file_size, pixel_width=excluded.pixel_width,
        pixel_height=excluded.pixel_height, sha256=excluded.sha256,
        archived=0, raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertPhysicalCard = this.db.prepare(`
      INSERT INTO collection_physical_cards (
        physical_card_id, analysis_id, label, linked_collection_item_id,
        product_id, card_name, review_status, created_at, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(physical_card_id) DO UPDATE SET
        analysis_id=excluded.analysis_id, label=excluded.label,
        linked_collection_item_id=excluded.linked_collection_item_id,
        product_id=excluded.product_id, card_name=excluded.card_name,
        review_status=excluded.review_status, archived=0,
        raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertPhotoObservation = this.db.prepare(`
      INSERT INTO collection_card_observations (
        observation_id, analysis_id, photo_id, bbox_x, bbox_y, bbox_width,
        bbox_height, binder_row, binder_column, selected_name,
        name_candidates_json, name_confidence, selected_product_id,
        print_candidates_json, print_confidence, recognition_signals_json,
        economic_relevant, detail_photo_required, review_status,
        physical_card_id, linked_collection_item_id, created_at,
        archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(observation_id) DO UPDATE SET
        analysis_id=excluded.analysis_id, photo_id=excluded.photo_id,
        bbox_x=excluded.bbox_x, bbox_y=excluded.bbox_y,
        bbox_width=excluded.bbox_width, bbox_height=excluded.bbox_height,
        binder_row=excluded.binder_row, binder_column=excluded.binder_column,
        selected_name=excluded.selected_name, name_candidates_json=excluded.name_candidates_json,
        name_confidence=excluded.name_confidence, selected_product_id=excluded.selected_product_id,
        print_candidates_json=excluded.print_candidates_json,
        print_confidence=excluded.print_confidence,
        recognition_signals_json=excluded.recognition_signals_json,
        economic_relevant=excluded.economic_relevant,
        detail_photo_required=excluded.detail_photo_required,
        review_status=excluded.review_status, physical_card_id=excluded.physical_card_id,
        linked_collection_item_id=excluded.linked_collection_item_id,
        archived=0, raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    collectionAnalyses.forEach((analysis, analysisIndex) => {
      const analysisId = recordId(analysis, analysisIndex);
      const calculated = analysis.calculation || {};
      upsertCollection.run(
        analysisId, String(analysis.title || ''), String(analysis.sourceType || ''),
        String(analysis.sellerName || ''), String(analysis.url || ''), String(analysis.date || ''),
        numberValue(analysis.sellerPrice), numberValue(analysis.shipping), numberValue(analysis.extra),
        nullableMoney(analysis.actualPurchasePrice), String(calculated.decision || analysis.decision || 'ZU WENIGE DATEN'),
        nullableMoney(calculated.blindMaxEk), nullableMoney(calculated.confirmedMaxEk),
        nullableMoney(calculated.firstOffer), nullableMoney(calculated.conservativeValue),
        nullableMoney(calculated.potentialValue), String(analysis.linkedPurchaseId || ''),
        JSON.stringify(analysis), updatedAt
      );
      (Array.isArray(analysis.items) ? analysis.items : []).forEach((item, itemIndex) => {
        const itemId = recordId(item, itemIndex);
        const row = calculated.items?.find(calculatedItem => String(calculatedItem.id || '') === itemId) || {};
        upsertCollectionItem.run(
          itemId, analysisId, /^\d+$/.test(String(item.productId || '').trim()) ? String(item.productId).trim() : '',
          String(item.name || ''), String(item.setName || item.set || ''), String(item.collectorNumber || ''),
          String(item.rarity || ''), positiveQuantity(item.quantity), String(item.condition || 'UNBEKANNT'),
          String(item.language || ''), ['confirmed', 'likely', 'unknown'].includes(item.printConfidence) ? item.printConfidence : 'unknown',
          nullableMoney(row.referenceValue), nullableMoney(row.conservativeValue), nullableMoney(row.potentialValue),
          nullableMoney(row.maxPurchaseContribution), row.economicRelevant ? 1 : 0,
          JSON.stringify(item), updatedAt
        );
      });
      (Array.isArray(analysis.decisionSnapshots) ? analysis.decisionSnapshots : []).forEach((snapshot, snapshotIndex) => {
        upsertCollectionSnapshot.run(
          String(snapshot.id || `${analysisId}:snapshot:${snapshotIndex}`), analysisId,
          String(snapshot.decidedAt || updatedAt), String(snapshot.decision || 'ZU WENIGE DATEN'),
          numberValue(snapshot.sellerPrice), numberValue(snapshot.totalCost), nullableMoney(snapshot.nominalValue),
          nullableMoney(snapshot.realisticValue), nullableMoney(snapshot.conservativeValue), nullableMoney(snapshot.potentialValue),
          nullableMoney(snapshot.uncertaintyValue), nullableMoney(snapshot.bulkValue), nullableMoney(snapshot.blindMaxEk),
          nullableMoney(snapshot.confirmedMaxEk), nullableMoney(snapshot.firstOffer), nullableMoney(snapshot.actualPurchasePrice),
          JSON.stringify(snapshot), updatedAt
        );
      });
      (Array.isArray(analysis.photos) ? analysis.photos : []).forEach((photo, photoIndex) => {
        upsertCollectionPhoto.run(
          recordId(photo, photoIndex), analysisId, Math.max(1, Math.round(Number(photo.sequence || photoIndex + 1))),
          String(photo.binderPage || ''), String(photo.relativePath || ''), String(photo.originalFileName || ''),
          String(photo.mimeType || ''), Math.max(0, Math.round(Number(photo.fileSize || 0))),
          Math.max(0, Math.round(Number(photo.width || 0))), Math.max(0, Math.round(Number(photo.height || 0))),
          String(photo.sha256 || ''), String(photo.createdAt || updatedAt), JSON.stringify(photo), updatedAt
        );
      });
      (Array.isArray(analysis.physicalCards) ? analysis.physicalCards : []).forEach((card, cardIndex) => {
        upsertPhysicalCard.run(
          recordId(card, cardIndex), analysisId, String(card.label || ''), String(card.linkedCollectionItemId || ''),
          /^\d+$/.test(String(card.productId || '').trim()) ? String(card.productId).trim() : '',
          String(card.name || ''), String(card.reviewStatus || 'unreviewed'), String(card.createdAt || updatedAt),
          JSON.stringify(card), updatedAt
        );
      });
      (Array.isArray(analysis.photoObservations) ? analysis.photoObservations : []).forEach((observation, observationIndex) => {
        const boundingBox = collectionPhotoModel.normalizeBoundingBox(observation.boundingBox);
        if (!boundingBox) throw new Error(`Ungültiger Bildausschnitt in Beobachtung ${recordId(observation, observationIndex)}.`);
        upsertPhotoObservation.run(
          recordId(observation, observationIndex), analysisId, String(observation.photoId || ''),
          boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height,
          String(observation.row || ''), String(observation.column || ''), String(observation.selectedName || ''),
          JSON.stringify(observation.nameCandidates || []), String(observation.nameConfidence || 'unknown'),
          /^\d+$/.test(String(observation.selectedProductId || '').trim()) ? String(observation.selectedProductId).trim() : '',
          JSON.stringify(observation.printCandidates || []), String(observation.printConfidence || 'unknown'),
          JSON.stringify(observation.recognitionSignals || []), observation.economicRelevant ? 1 : 0,
          observation.detailPhotoRequired ? 1 : 0, String(observation.reviewStatus || 'unreviewed'),
          observation.physicalCardId ? String(observation.physicalCardId) : null,
          String(observation.linkedCollectionItemId || ''), String(observation.createdAt || updatedAt),
          JSON.stringify(observation), updatedAt
        );
      });
    });

    const insertLine = (order, item, index, values = {}) => {
      const rawProductId = String(values.productId ?? item?.productId ?? '').trim();
      const productId = /^\d+$/.test(rawProductId) ? rawProductId : '';
      const suffix = String(item?.articleId || item?.sourceRow || item?.id || `row-${index}`);
      const lineKey = `${order.orderKey}:line:${suffix}:${index}`;
      upsertLine.run(
        lineKey, order.orderKey, order.tradeType, order.localId, order.sourceId,
        String(item?.articleId || ''), productId,
        String(values.metacardId ?? item?.metacardId ?? ''),
        String(values.name ?? item?.name ?? ''),
        String(values.setName ?? item?.setName ?? item?.set ?? ''),
        String(values.rarity ?? item?.rarity ?? item?.version ?? ''),
        String(values.language ?? item?.language ?? ''),
        String(values.condition ?? item?.condition ?? ''),
        positiveQuantity(values.quantity ?? item?.quantity),
        numberValue(values.unitPrice ?? item?.unitPrice),
        numberValue(values.allocatedShipping), numberValue(values.allocatedExtra),
        numberValue(values.unitCost), numberValue(values.unitNet), numberValue(values.allocatedRefund),
        String(order.status || ''), String(order.date || ''), JSON.stringify(values.rawJson ?? item ?? {}), updatedAt
      );
    };

    purchases.forEach((purchase, purchaseIndex) => {
      const localId = recordId(purchase, purchaseIndex);
      const orderKey = `purchase:${localId}`;
      const sourceId = recordSource(purchase);
      const cardValue = numberValue(purchase.cardValue);
      const shipping = numberValue(purchase.shipping);
      const extra = numberValue(purchase.extra);
      upsertOrder.run(
        orderKey, 'purchase', localId, sourceId,
        String(purchase.externalOrderId || purchase.orderNo || ''), String(purchase.orderNo || ''),
        String(purchase.date || ''), String(purchase.seller || ''), String(purchase.country || ''),
        String(purchase.status || ''), cardValue, shipping, extra, 0, 0, numberValue(purchase.refund),
        Math.max(0, cardValue + shipping + extra - numberValue(purchase.refund)), 0, JSON.stringify(purchase), updatedAt
      );
      const order = { orderKey, tradeType: 'purchase', localId, sourceId, status: purchase.status, date: purchase.date };
      const pending = Array.isArray(purchase.pendingItems) ? purchase.pendingItems : [];
      const linkedInventory = inventory.filter(item => String(item.purchaseId || '') === localId);
      if (pending.length) {
        const allocationMethod = purchase.costAllocationMethod === 'quantity' ? 'quantity' : 'value';
        const costRows = businessAutomation.allocatePurchaseCosts(purchase, allocationMethod);
        const claimedLegacyAssets = new Set();
        costRows.forEach((row, index) => {
          const item = row.item;
          const receipt = row.receipt;
          const receiptLineKey = `${localId}:${receipt.key}`;
          const exactLinkedCount = linkedInventory.filter(asset =>
            String(asset.status || '') !== 'Beschädigt' && String(asset.purchaseLineKey || '') === receiptLineKey
          ).length;
          const legacyMatches = linkedInventory.filter(asset =>
            String(asset.status || '') !== 'Beschädigt' && !asset.purchaseLineKey &&
            !claimedLegacyAssets.has(recordId(asset)) && String(asset.productId || '') === String(item.productId || '')
          ).slice(0, Math.max(0, receipt.quantity - exactLinkedCount));
          legacyMatches.forEach(asset => claimedLegacyAssets.add(recordId(asset)));
          const linkedCount = exactLinkedCount + legacyMatches.length;
          const businessQuantity = Math.max(receipt.business, linkedCount);
          const privateQuantity = receipt.private;
          const damagedQuantity = receipt.damaged;
          const cancelledQuantity = receipt.cancelled;
          const openQuantity = Math.max(0, receipt.quantity - businessQuantity - privateQuantity - damagedQuantity - cancelledQuantity);
          upsertReceiptLine.run(
            receiptLineKey, localId, String(purchase.orderNo || ''), String(item.sourceRow || ''),
            /^\d+$/.test(String(item.productId || '').trim()) ? String(item.productId).trim() : '',
            receipt.quantity, businessQuantity, privateQuantity, damagedQuantity,
            cancelledQuantity, openQuantity, row.unitPrice, row.allocatedShipping,
            row.allocatedExtra, row.unitCost,
            ['yes', 'no'].includes(String(item.cartFillerStatus || '')) ? String(item.cartFillerStatus) : 'unknown',
            nullableMoney(item.incrementalShippingCost), nullableMoney(item.incrementalDirectCost),
            String(item.decisionCostStatus || 'unknown') === 'known' ? 'known' : 'unknown',
            nullableMoney(item.confirmedTargetSellPrice), allocationMethod, JSON.stringify(item), updatedAt
          );
          if (businessQuantity > 0) insertLine(order, item, index, {
            unitPrice: row.unitPrice, allocatedShipping: row.allocatedShipping,
            allocatedExtra: row.allocatedExtra, unitCost: row.unitCost,
            quantity: businessQuantity
          });
        });
      } else if (linkedInventory.length) {
        linkedInventory.forEach((item, index) => insertLine(order, item, index, {
          unitPrice: numberValue(item.cost), unitCost: numberValue(item.cost), quantity: 1
        }));
      } else if (/eingetroffen|received/i.test(String(purchase.status || ''))) {
        const quantity = positiveQuantity(purchase.items);
        insertLine(order, { name: purchase.cardNames || 'Sammelbestellung' }, 0, {
          quantity, unitPrice: quantity ? cardValue / quantity : 0,
          allocatedShipping: quantity ? shipping / quantity : 0,
          allocatedExtra: quantity ? extra / quantity : 0,
          unitCost: quantity ? (cardValue + shipping + extra) / quantity : 0
        });
      }
    });

    sales.forEach((sale, saleIndex) => {
      const localId = recordId(sale, saleIndex);
      const orderKey = `sale:${localId}`;
      const sourceId = recordSource(sale);
      const revenue = numberValue(sale.revenue);
      const cardValue = numberValue(sale.cardValue || Math.max(0, revenue - numberValue(sale.shippingPaid)));
      const fee = sale.fee !== undefined && sale.fee !== ''
        ? numberValue(sale.fee)
        : cardValue * numberValue(settings.feePercent) / 100;
      const packaging = Array.isArray(sale.materialUsage) && sale.materialUsage.length
        ? sale.materialUsage.reduce((sum, usage) => sum + numberValue(usage.quantity) * numberValue(usage.unitCost), 0)
        : numberValue(sale.packaging);
      const postage = numberValue(sale.postage);
      const refund = numberValue(sale.refund);
      const linkedIds = Array.isArray(sale.itemIds) ? sale.itemIds.map(String) : [];
      const linkedItems = linkedIds.map(id => inventoryById.get(id)).filter(Boolean);
      const linkedCost = linkedItems.reduce((sum, item) => sum + numberValue(item.cost), 0);
      const returnedToInventory = String(sale.status || '') === 'Rückgabe eingetroffen';
      const cost = returnedToInventory ? 0 : (linkedItems.length ? linkedCost : numberValue(sale.cost));
      upsertOrder.run(
        orderKey, 'sale', localId, sourceId,
        String(sale.externalOrderId || sale.orderNo || ''), String(sale.orderNo || ''),
        String(sale.date || ''), String(sale.customer || ''), String(sale.country || ''),
        String(sale.status || ''), cardValue, numberValue(sale.shippingPaid), packaging,
        fee, postage, refund, cost, revenue, JSON.stringify(sale), updatedAt
      );
      const order = { orderKey, tradeType: 'sale', localId, sourceId, status: sale.status, date: sale.date };
      const detailedItems = Array.isArray(sale.items) ? sale.items : [];
      const items = detailedItems.length ? detailedItems : linkedItems;
      const totalQuantity = items.length
        ? items.reduce((sum, item) => sum + positiveQuantity(item.quantity), 0)
        : positiveQuantity(sale.quantity);
      const feeUnit = totalQuantity ? fee / totalQuantity : 0;
      const shippingPaidUnit = totalQuantity ? numberValue(sale.shippingPaid) / totalQuantity : 0;
      const postageUnit = totalQuantity ? postage / totalQuantity : 0;
      const packagingUnit = totalQuantity ? packaging / totalQuantity : 0;
      const refundUnit = totalQuantity ? refund / totalQuantity : 0;
      if (items.length) {
        items.forEach((item, index) => {
          const matchedIds = Array.isArray(item.matchedItemIds) ? item.matchedItemIds.map(String) : [];
          const matched = matchedIds.map(id => inventoryById.get(id)).filter(Boolean);
          const quantity = positiveQuantity(item.quantity);
          const unitPrice = detailedItems.length
            ? numberValue(item.unitPrice)
            : (cardValue > 0 ? cardValue / totalQuantity : revenue / totalQuantity);
          const unitCost = returnedToInventory ? 0 : matched.length
            ? matched.reduce((sum, row) => sum + numberValue(row.cost), 0) / matched.length
            : (item.cost !== undefined ? numberValue(item.cost) : (totalQuantity ? cost / totalQuantity : 0));
          insertLine(order, item, index, {
            quantity, unitPrice, unitCost,
            unitNet: unitPrice + shippingPaidUnit - feeUnit - postageUnit - packagingUnit - refundUnit,
            allocatedRefund: refundUnit,
            rawJson: { ...item, historicalCostStatus: String(sale.historicalCostStatus || '') }
          });
        });
      } else {
        const quantity = positiveQuantity(sale.quantity);
        const unitPrice = quantity ? cardValue / quantity : 0;
        insertLine(order, { name: sale.cardNames || 'Sammelverkauf' }, 0, {
          quantity, unitPrice, unitCost: quantity ? cost / quantity : 0,
          unitNet: unitPrice + shippingPaidUnit - feeUnit - postageUnit - packagingUnit - refundUnit,
          allocatedRefund: refundUnit,
          rawJson: { name: sale.cardNames || 'Sammelverkauf', historicalCostStatus: String(sale.historicalCostStatus || '') }
        });
      }
    });

    const reconciliations = Array.isArray(state?.reconciliations) ? state.reconciliations : [];
    this.db.exec('DELETE FROM settlement_entries; DELETE FROM settlement_imports;');
    const insertSettlement = this.db.prepare(`
      INSERT INTO settlement_imports (
        settlement_id, import_key, source_id, file_name, imported_at,
        row_count, matched_count, unmatched_count, total_difference, raw_json, updated_at
      ) VALUES (?, ?, 'cardmarket_settlement', ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSettlementEntry = this.db.prepare(`
      INSERT INTO settlement_entries (
        entry_key, settlement_id, row_number, transaction_date, external_order_id,
        matched_sale_id, description, amount, expected_payout, difference,
        match_status, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    reconciliations.forEach((settlement, settlementIndex) => {
      const settlementId = recordId(settlement, settlementIndex);
      insertSettlement.run(
        settlementId, String(settlement.importKey || settlementId), String(settlement.file || ''),
        String(settlement.date || updatedAt), Number(settlement.rows || 0),
        Number(settlement.matched || 0), Number(settlement.unmatched || 0),
        numberValue(settlement.difference), JSON.stringify(settlement), updatedAt
      );
      (Array.isArray(settlement.entries) ? settlement.entries : []).forEach((entry, entryIndex) => {
        const matched = Boolean(entry.matchedSaleId);
        const exact = matched && Math.abs(numberValue(entry.difference)) < 0.02;
        insertSettlementEntry.run(
          `${settlementId}:row:${entry.row || entryIndex + 2}`, settlementId,
          Number(entry.row || entryIndex + 2), String(entry.date || ''), String(entry.orderNo || ''),
          String(entry.matchedSaleId || ''), String(entry.description || ''), numberValue(entry.amount),
          numberValue(entry.expectedPayout), numberValue(entry.difference),
          matched ? (exact ? 'matched' : 'difference') : 'unmatched', JSON.stringify(entry), updatedAt
        );
      });
    });
  }

  createDailyBackup(json, updatedAt, retentionDays = 30) {
    const automaticRoot = path.join(this.backupRoot, 'Automatisch');
    ensureDirectory(automaticRoot);

    const targetPath = path.join(automaticRoot, `TCG_Auto_Backup_${dateStamp(new Date(updatedAt))}.json`);
    const tempPath = `${targetPath}.tmp`;
    fs.writeFileSync(tempPath, json, 'utf8');
    fs.renameSync(tempPath, targetPath);

    const backups = fs.readdirSync(automaticRoot)
      .filter(name => /^TCG_Auto_Backup_\d{4}-\d{2}-\d{2}\.json$/i.test(name))
      .sort()
      .reverse();

    const retention = Math.max(1, Math.min(3650, Math.round(Number(retentionDays) || 30)));
    for (const oldName of backups.slice(retention)) {
      fs.rmSync(path.join(automaticRoot, oldName), { force: true });
    }
  }

  getTradeDatabaseStatus() {
    this.open();
    const counts = this.db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM business_events) AS event_count,
        (SELECT COUNT(*) FROM trade_orders WHERE archived = 0) AS order_count,
        (SELECT COUNT(*) FROM trade_lines WHERE archived = 0) AS line_count,
        (SELECT COUNT(*) FROM purchase_receipt_lines WHERE archived = 0) AS receipt_line_count,
        (SELECT COUNT(*) FROM inventory_assets WHERE archived = 0 AND ownership = 'business') AS business_asset_count,
        (SELECT COUNT(*) FROM inventory_assets WHERE archived = 0 AND ownership = 'private') AS private_asset_count,
        (SELECT COUNT(*) FROM inventory_listing_history WHERE archived = 0) AS listing_history_count,
        (SELECT COUNT(*) FROM capital_accounts WHERE archived = 0) AS capital_account_count,
        (SELECT COUNT(*) FROM capital_ledger_entries WHERE archived = 0) AS capital_entry_count,
        (SELECT COALESCE(SUM(amount), 0) FROM capital_ledger_entries WHERE archived = 0) AS liquid_capital,
        (SELECT COUNT(*) FROM market_observations) AS observation_count,
        (SELECT COUNT(*) FROM pricing_recommendations) AS recommendation_count,
        (SELECT COUNT(*) FROM settlement_imports) AS settlement_count,
        (SELECT COUNT(*) FROM settlement_entries WHERE match_status = 'unmatched') AS unmatched_settlement_count,
        (SELECT COUNT(*) FROM collection_purchase_photos WHERE archived = 0) AS collection_photo_count,
        (SELECT COUNT(*) FROM collection_card_observations WHERE archived = 0) AS collection_observation_count,
        (SELECT COUNT(*) FROM collection_physical_cards WHERE archived = 0) AS collection_physical_card_count,
        (SELECT MAX(occurred_at) FROM business_events) AS latest_event_at,
        (SELECT MAX(observed_date) FROM market_observations) AS latest_market_date
    `).get();
    const automaticRoot = path.join(this.backupRoot, 'Automatisch');
    let backupCount = 0;
    let latestBackupAt = '';
    let latestBackupFile = '';
    try {
      const backups = fs.readdirSync(automaticRoot)
        .filter(name => /^TCG_Auto_Backup_\d{4}-\d{2}-\d{2}\.json$/i.test(name))
        .map(name => ({ name, stats: fs.statSync(path.join(automaticRoot, name)) }))
        .sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
      backupCount = backups.length;
      latestBackupAt = backups[0]?.stats?.mtime?.toISOString() || '';
      latestBackupFile = backups[0]?.name || '';
    } catch (_error) {
      // Vor dem ersten Speichern existiert der automatische Sicherungsordner noch nicht.
    }
    return {
      ready: true,
      eventCount: Number(counts?.event_count || 0),
      orderCount: Number(counts?.order_count || 0),
      tradeLineCount: Number(counts?.line_count || 0),
      purchaseReceiptLineCount: Number(counts?.receipt_line_count || 0),
      businessAssetCount: Number(counts?.business_asset_count || 0),
      privateAssetCount: Number(counts?.private_asset_count || 0),
      listingHistoryCount: Number(counts?.listing_history_count || 0),
      capitalAccountCount: Number(counts?.capital_account_count || 0),
      capitalEntryCount: Number(counts?.capital_entry_count || 0),
      liquidCapital: Number(counts?.liquid_capital || 0),
      marketObservationCount: Number(counts?.observation_count || 0),
      recommendationCount: Number(counts?.recommendation_count || 0),
      settlementCount: Number(counts?.settlement_count || 0),
      unmatchedSettlementCount: Number(counts?.unmatched_settlement_count || 0),
      collectionPhotoCount: Number(counts?.collection_photo_count || 0),
      collectionObservationCount: Number(counts?.collection_observation_count || 0),
      collectionPhysicalCardCount: Number(counts?.collection_physical_card_count || 0),
      latestEventAt: String(counts?.latest_event_at || ''),
      latestMarketDate: String(counts?.latest_market_date || ''),
      backupCount,
      latestBackupAt,
      latestBackupFile,
      dataSources: this.getDataSources()
    };
  }

  getDataSources() {
    this.open();
    return this.db.prepare(`
      SELECT
        source_id AS sourceId, source_type AS sourceType, display_name AS displayName,
        enabled, read_only AS readOnly, priority, base_url AS baseUrl,
        last_success_at AS lastSuccessAt, last_error AS lastError, updated_at AS updatedAt
      FROM data_sources
      ORDER BY priority, display_name
    `).all().map(row => ({
      ...row,
      enabled: Boolean(row.enabled),
      readOnly: Boolean(row.readOnly)
    }));
  }

  getBusinessEvents({ limit = 100, entityType = '', entityId = '' } = {}) {
    this.open();
    const safeLimit = boundedInteger(limit, 1, 1000, 100);
    const clauses = [];
    const parameters = [];
    if (entityType) {
      clauses.push('entity_type = ?');
      parameters.push(String(entityType));
    }
    if (entityId) {
      clauses.push('entity_id = ?');
      parameters.push(String(entityId));
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return this.db.prepare(`
      SELECT
        event_id AS eventId, entity_type AS entityType, entity_id AS entityId,
        event_type AS eventType, occurred_at AS occurredAt, source_id AS sourceId,
        changed_fields_json AS changedFieldsJson, state_saved_at AS stateSavedAt
      FROM business_events
      ${where}
      ORDER BY event_id DESC
      LIMIT ?
    `).all(...parameters, safeLimit).map(row => ({
      ...row,
      changedFields: JSON.parse(row.changedFieldsJson || '[]')
    }));
  }

  getOwnSalesExperience({ productIds = [], asOf = '' } = {}) {
    this.open();
    const ids = Array.isArray(productIds)
      ? [...new Set(productIds.map(value => String(value || '').trim()).filter(value => /^\d+$/.test(value)))].slice(0, 1000)
      : [];
    const clauses = ["tl.trade_type = 'sale'", 'tl.archived = 0', 'orders.archived = 0'];
    const parameters = [];
    if (ids.length) {
      clauses.push(`tl.product_id IN (${ids.map(() => '?').join(',')})`);
      parameters.push(...ids);
    }
    const saleRows = this.db.prepare(`
      SELECT
        tl.local_order_id AS sale_id, tl.product_id, tl.card_name, tl.set_name,
        tl.rarity, tl.quantity, tl.unit_price, tl.unit_cost, tl.unit_net,
        tl.raw_json, orders.order_no, orders.transaction_date, orders.status,
        products.name_de, products.name_en, products.set_name AS product_set_name,
        products.rarity AS product_rarity
      FROM trade_lines tl
      JOIN trade_orders orders ON orders.order_key = tl.order_key
      LEFT JOIN products ON products.product_id = tl.product_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY orders.transaction_date, tl.line_key
    `).all(...parameters).filter(row => isRealizedSaleStatus(row.status));

    const assetClauses = ["assets.ownership = 'business'", 'assets.archived = 0', "assets.sale_id <> ''"];
    const assetParameters = [];
    if (ids.length) {
      assetClauses.push(`assets.product_id IN (${ids.map(() => '?').join(',')})`);
      assetParameters.push(...ids);
    }
    const assetRows = this.db.prepare(`
      SELECT
        assets.inventory_id, assets.sale_id, assets.product_id,
        assets.acquisition_cost, assets.acquisition_cost_status,
        assets.acquisition_date, assets.holding_profile, assets.raw_json,
        MIN(CASE WHEN history.event_type = 'first_listing' AND history.archived = 0
          THEN history.changed_at ELSE NULL END) AS first_listing_at
      FROM inventory_assets assets
      LEFT JOIN inventory_listing_history history ON history.inventory_id = assets.inventory_id
      WHERE ${assetClauses.join(' AND ')}
      GROUP BY assets.inventory_id
    `).all(...assetParameters);
    const assetsBySalePrint = new Map();
    assetRows.forEach(row => {
      const key = `${row.sale_id}|${row.product_id}`;
      if (!assetsBySalePrint.has(key)) assetsBySalePrint.set(key, []);
      assetsBySalePrint.get(key).push(row);
    });
    const assetCursors = new Map();
    const records = saleRows.map((row, lineIndex) => {
      const quantity = positiveQuantity(row.quantity);
      const key = `${row.sale_id}|${row.product_id}`;
      const candidates = assetsBySalePrint.get(key) || [];
      const cursor = assetCursors.get(key) || 0;
      const matchedAssets = candidates.slice(cursor, cursor + quantity);
      assetCursors.set(key, cursor + matchedAssets.length);
      let lineRaw = {};
      try { lineRaw = JSON.parse(row.raw_json || '{}'); } catch { lineRaw = {}; }
      const historicalStatus = String(lineRaw.historicalCostStatus || '').toLowerCase();
      const assetsHaveKnownCost = matchedAssets.length >= quantity && matchedAssets.every(asset => asset.acquisition_cost_status !== 'unknown');
      const costKnown = historicalStatus !== 'unknown' && (
        numberValue(row.unit_cost) > 0 || ['confirmed', 'linked'].includes(historicalStatus) || assetsHaveKnownCost
      );
      const daysToSaleSamples = matchedAssets.map(asset => {
        let rawAsset = {};
        try { rawAsset = JSON.parse(asset.raw_json || '{}'); } catch { rawAsset = {}; }
        const start = asset.first_listing_at || businessAutomation.inventoryStartDate({
          ...rawAsset,
          purchaseDate: asset.acquisition_date || rawAsset.purchaseDate,
          holdingProfile: asset.holding_profile || rawAsset.holdingProfile
        });
        return start ? businessAutomation.ageInDays(start, row.transaction_date) : null;
      }).filter(value => value !== null);
      return {
        productId: String(row.product_id || ''),
        orderId: String(row.sale_id || row.order_no || `sale-${lineIndex}`),
        soldAt: String(row.transaction_date || ''),
        quantity,
        sellPrice: numberValue(row.unit_price),
        fullCost: costKnown ? numberValue(row.unit_cost) : null,
        costKnown,
        unitProfit: costKnown ? numberValue(row.unit_net) - numberValue(row.unit_cost) : null,
        daysToSaleSamples,
        name: String(row.name_de || row.card_name || row.name_en || ''),
        germanName: String(row.name_de || ''),
        englishName: String(row.name_en || ''),
        setName: String(row.product_set_name || row.set_name || ''),
        rarity: String(row.product_rarity || row.rarity || ''),
        holdingProfile: String(matchedAssets[0]?.holding_profile || '')
      };
    });
    const analysis = businessAutomation.analyzeOwnSalesExperience(records, { asOf: asOf || isoNow() });
    const summary = {
      realizedSaleLines: records.length,
      soldQuantity: records.reduce((sum, row) => sum + row.quantity, 0),
      withPrintId: records.filter(row => /^\d+$/.test(row.productId)).reduce((sum, row) => sum + row.quantity, 0),
      withReliableDuration: records.reduce((sum, row) => sum + row.daysToSaleSamples.length, 0),
      withKnownCost: records.filter(row => row.costKnown).reduce((sum, row) => sum + row.quantity, 0),
      withCalculableProfit: records.filter(row => row.unitProfit !== null).reduce((sum, row) => sum + row.quantity, 0),
      withCalculableRoi: records.filter(row => row.unitProfit !== null && Number(row.fullCost) > 0).reduce((sum, row) => sum + row.quantity, 0),
      printCount: analysis.length,
      sufficientPrintCount: analysis.filter(row => row.dataQuality.sufficient).length
    };
    return { calculatedAt: isoNow(), summary, records: analysis };
  }

  getTradeRecommendations({ productIds = [], limit = 12 } = {}) {
    this.open();
    const safeLimit = boundedInteger(limit, 1, 100, 12);
    let ids = Array.isArray(productIds)
      ? [...new Set(productIds.map(value => String(value || '').trim()).filter(value => /^\d+$/.test(value)))].slice(0, 500)
      : [];
    if (!ids.length) {
      ids = this.db.prepare(`
        SELECT product_id
        FROM trade_lines
        WHERE archived = 0 AND product_id <> ''
        GROUP BY product_id
        ORDER BY SUM(quantity) DESC, MAX(transaction_date) DESC
        LIMIT ?
      `).all(safeLimit).map(row => String(row.product_id));
    }
    if (!ids.length) return { calculatedAt: isoNow(), recommendations: [] };

    let appState = {};
    let settings = {};
    try {
      appState = JSON.parse(this.db.prepare('SELECT state_json FROM app_state WHERE id = 1').get()?.state_json || '{}');
      settings = appState.settings || {};
    } catch {
      appState = {};
      settings = {};
    }
    const feeRate = Math.max(0, numberValue(settings.feePercent)) / 100;
    const packagingAllocation = businessAutomation.estimatePackagingPerCard(appState, settings);
    const packaging = Math.max(0, numberValue(packagingAllocation.perCard));
    const minProfit = Math.max(0, numberValue(settings.minProfit));
    const minRoi = Math.max(0, numberValue(settings.minRoi ?? 25)) / 100;
    const targetRoi = Math.max(minRoi, numberValue(settings.targetRoi ?? 30) / 100);
    const safetyRate = Math.max(0, numberValue(settings.safetyPercent ?? 5)) / 100;
    const calculatedAt = isoNow();
    const lineQuery = this.db.prepare(`
      SELECT quantity, unit_price, unit_cost, unit_net, status, transaction_date,
             card_name, set_name, rarity, raw_json
      FROM trade_lines
      WHERE product_id = ? AND trade_type = ? AND archived = 0
      ORDER BY transaction_date DESC
    `);
    const marketQuery = this.db.prepare(`
      SELECT
        observed_date, source_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30
      FROM market_observations
      WHERE product_id = ?
      ORDER BY observed_date DESC,
        CASE source_id WHEN 'cardmarket_api' THEN 1 WHEN 'cardmarket_price_guide' THEN 2 ELSE 9 END,
        observation_id DESC
      LIMIT 90
    `);
    const productQuery = this.db.prepare(`
      SELECT
        COALESCE(NULLIF(name_de, ''), NULLIF(name_en, ''), NULLIF(official_name, ''), 'CM ' || product_id) AS name,
        name_en AS english_name, set_name, set_code, collector_number, rarity, variant
      FROM products WHERE product_id = ?
    `);
    const cache = this.db.prepare(`
      INSERT INTO pricing_recommendations (
        product_id, calculated_at, recommended_buy, price_floor, quick_sell, recommended_sell,
        own_buy_average, own_sell_average, market_reference,
        buy_sample_count, sell_sample_count, market_sample_count,
        confidence_score, confidence_level, model_version, volatility, explanation_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        calculated_at = excluded.calculated_at,
        recommended_buy = excluded.recommended_buy,
        price_floor = excluded.price_floor,
        quick_sell = excluded.quick_sell,
        recommended_sell = excluded.recommended_sell,
        own_buy_average = excluded.own_buy_average,
        own_sell_average = excluded.own_sell_average,
        market_reference = excluded.market_reference,
        buy_sample_count = excluded.buy_sample_count,
        sell_sample_count = excluded.sell_sample_count,
        market_sample_count = excluded.market_sample_count,
        confidence_score = excluded.confidence_score,
        confidence_level = excluded.confidence_level,
        model_version = excluded.model_version,
        volatility = excluded.volatility,
        explanation_json = excluded.explanation_json
    `);
    const historyCache = this.db.prepare(`
      INSERT INTO pricing_recommendation_history (
        product_id, calculated_date, model_version, calculated_at,
        max_buy, price_floor, quick_sell, recommended_sell,
        confidence_score, inputs_json, explanation_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, calculated_date, model_version) DO UPDATE SET
        calculated_at=excluded.calculated_at, max_buy=excluded.max_buy,
        price_floor=excluded.price_floor, quick_sell=excluded.quick_sell,
        recommended_sell=excluded.recommended_sell,
        confidence_score=excluded.confidence_score,
        inputs_json=excluded.inputs_json, explanation_json=excluded.explanation_json
    `);

    const recommendations = [];
    for (const productId of ids) {
      const purchases = lineQuery.all(productId, 'purchase').filter(row => !isCancelledStatus(row.status));
      const sales = lineQuery.all(productId, 'sale').filter(row => {
        if (!isRealizedSaleStatus(row.status)) return false;
        let historicalCostStatus = '';
        try { historicalCostStatus = String(JSON.parse(row.raw_json || '{}').historicalCostStatus || '').toLowerCase(); } catch { historicalCostStatus = ''; }
        return historicalCostStatus !== 'unknown' && (numberValue(row.unit_cost) > 0 || ['confirmed', 'linked'].includes(historicalCostStatus));
      });
      const marketRows = marketQuery.all(productId);
      const ownBuyAverage = weightedAverage(purchases, 'unit_cost');
      const ownSellAverage = weightedAverage(sales, 'unit_price');
      const buySampleCount = purchases.reduce((sum, row) => sum + positiveQuantity(row.quantity), 0);
      const sellSampleCount = sales.reduce((sum, row) => sum + positiveQuantity(row.quantity), 0);
      const marketSampleCount = new Set(marketRows.map(row => row.observed_date)).size;
      const latestMarket = marketRows[0] || {};
      const referenceFor = row => {
        return businessAutomation.calculateAutomaticPriceTargets({
          liveOffer: row.source_id === 'cardmarket_api' ? row.low_price : null,
          low: row.low_price,
          trend: row.trend_price,
          avg1: row.avg_1,
          avg7: row.avg_7,
          avg30: row.avg_30
        }, {...settings, packaging, minProfit}).recommendedSell;
      };
      const latestTargets = businessAutomation.calculateAutomaticPriceTargets({
        liveOffer: latestMarket.source_id === 'cardmarket_api' ? latestMarket.low_price : null,
        low: latestMarket.low_price,
        trend: latestMarket.trend_price,
        avg1: latestMarket.avg_1,
        avg7: latestMarket.avg_7,
        avg30: latestMarket.avg_30
      }, {...settings, packaging, minProfit});
      const marketReference = latestTargets.recommendedSell;
      const dailyReferences = [];
      const seenDates = new Set();
      for (const row of marketRows) {
        if (seenDates.has(row.observed_date)) continue;
        seenDates.add(row.observed_date);
        const reference = referenceFor(row);
        if (reference > 0) dailyReferences.push(reference);
      }
      const referenceAverage = dailyReferences.length ? dailyReferences.reduce((sum, value) => sum + value, 0) / dailyReferences.length : 0;
      const volatility = dailyReferences.length > 1 && referenceAverage > 0
        ? Math.sqrt(dailyReferences.reduce((sum, value) => sum + (value - referenceAverage) ** 2, 0) / dailyReferences.length) / referenceAverage * 100
        : 0;

      let recommendedSell = marketReference;
      if (recommendedSell <= 0 && ownSellAverage > 0) {
        recommendedSell = ownSellAverage;
      }
      if (recommendedSell <= 0 && ownBuyAverage > 0 && feeRate < 1) {
        recommendedSell = (ownBuyAverage * (1 + targetRoi) + packaging) / Math.max(0.01, 1 - feeRate);
      }
      const dynamicSafetyRate = Math.min(0.30, safetyRate + Math.min(0.12, volatility / 200));
      const safeSell = recommendedSell * Math.max(0, 1 - dynamicSafetyRate);
      const availableBeforeBuy = safeSell * Math.max(0, 1 - feeRate) - packaging;
      const byRoi = availableBeforeBuy / Math.max(1, 1 + minRoi);
      const byProfit = availableBeforeBuy - minProfit;
      const recommendedBuy = recommendedSell > 0 ? Math.max(0, Math.min(byRoi, byProfit)) : 0;
      const priceFloor = ownBuyAverage > 0 && feeRate < 1
        ? (ownBuyAverage * (1 + targetRoi) + packaging) / Math.max(0.01, 1 - feeRate)
        : 0;
      const quickSell = recommendedSell > 0
        ? Math.max(numberValue(latestMarket.low_price), recommendedSell * (1 - Math.min(0.15, dynamicSafetyRate)))
        : 0;
      const expectedProfit = ownBuyAverage > 0 && recommendedSell > 0
        ? recommendedSell * Math.max(0, 1 - feeRate) - packaging - ownBuyAverage
        : 0;
      const expectedRoi = ownBuyAverage > 0 ? expectedProfit / ownBuyAverage : 0;
      const profitableAtMarket = ownBuyAverage <= 0 || (expectedProfit >= 0 && expectedRoi >= minRoi);
      const productInfo = productQuery.get(productId) || {};
      const exactVariant = Boolean(String(productInfo.set_name || '').trim() &&
        String(productInfo.collector_number || productInfo.set_code || '').includes('-') &&
        String(productInfo.rarity || productInfo.variant || '').trim());
      const confidenceScore = Math.min(100,
        Math.min(20, buySampleCount * 5) +
        Math.min(35, sellSampleCount * 7) +
        Math.min(30, marketSampleCount * 4) +
        (exactVariant ? 15 : 0)
      );
      const confidenceLevel = confidenceScore >= 75 ? 'high' : confidenceScore >= 45 ? 'medium' : 'low';
      const explanation = [];
      if (!exactVariant) explanation.push('Druckvariante ist noch nicht vollstaendig belegt');
      if (volatility > 0) explanation.push(`Marktschwankung ${volatility.toFixed(1)} % wurde als Risikopuffer beruecksichtigt`);
      if (marketReference > 0) explanation.push(`${latestTargets.marketReferenceSource} als kurzfristiger Markt-VK; ${marketSampleCount} Quellen-/Tagesstände vorhanden`);
      if (numberValue(latestMarket.trend_price) > 0) explanation.push('Trend sowie 7-/30-Tage-Werte dienen nur als Verlaufshinweis');
      explanation.push(`Verpackung ${packaging.toFixed(2)} € je Karte (${packagingAllocation.source === 'actual' ? 'aus echten Bestellungen' : `auf ${packagingAllocation.averageCardsPerOrder} Karten verteilt`})`);
      if (buySampleCount) explanation.push(`${buySampleCount} eigene Einkaufseinheit(en) berücksichtigt`);
      if (sellSampleCount) explanation.push(`${sellSampleCount} realisierte Verkaufseinheit(en) berücksichtigt`);
      if (!sellSampleCount) explanation.push('Noch keine eigenen abgeschlossenen Verkäufe für diese Druckvariante');
      if (!profitableAtMarket) explanation.unshift(`Aktueller Marktwert erreicht ${Math.round(minRoi * 100)} % Mindest-ROI nicht; VK wurde nicht künstlich erhöht`);
      const product = productQuery.get(productId) || {};
      const tradeIdentity = sales[0] || purchases[0] || {};
      const result = {
        productId,
        name: String(product.name || tradeIdentity.card_name || `CM ${productId}`),
        englishName: String(product.english_name || ''),
        setName: String(product.set_name || tradeIdentity.set_name || ''),
        rarity: String(product.rarity || tradeIdentity.rarity || ''),
        priceDate: String(latestMarket.observed_date || ''),
        priceSource: String(latestMarket.source_id || ''),
        liveOffer: latestMarket.source_id === 'cardmarket_api' ? roundedMoney(latestMarket.low_price) : 0,
        low: roundedMoney(latestMarket.low_price),
        trend: roundedMoney(latestMarket.trend_price),
        avg1: roundedMoney(latestMarket.avg_1),
        avg7: roundedMoney(latestMarket.avg_7),
        avg30: roundedMoney(latestMarket.avg_30),
        marketReferenceSource: latestTargets.marketReferenceSource,
        historicalReference: roundedMoney(latestTargets.historicalReference),
        recommendedBuy: roundedMoney(recommendedBuy),
        priceFloor: roundedMoney(priceFloor),
        quickSell: roundedMoney(quickSell),
        recommendedSell: roundedMoney(recommendedSell),
        ownBuyAverage: roundedMoney(ownBuyAverage),
        ownSellAverage: roundedMoney(ownSellAverage),
        marketReference: roundedMoney(marketReference),
        buySampleCount, sellSampleCount, marketSampleCount,
        expectedProfit: roundedMoney(expectedProfit), expectedRoi: Math.round(expectedRoi * 1000) / 10,
        profitableAtMarket,
        confidenceScore, confidenceLevel, volatility: roundedMoney(volatility), modelVersion: 'v4-short-term-market', explanation,
        calculatedAt
      };
      cache.run(
        productId, calculatedAt, result.recommendedBuy, result.priceFloor, result.quickSell, result.recommendedSell,
        result.ownBuyAverage, result.ownSellAverage, result.marketReference,
        buySampleCount, sellSampleCount, marketSampleCount,
        confidenceScore, confidenceLevel, result.modelVersion, result.volatility, JSON.stringify(explanation)
      );
      historyCache.run(
        productId, calculatedAt.slice(0, 10), result.modelVersion, calculatedAt,
        result.recommendedBuy, result.priceFloor, result.quickSell, result.recommendedSell,
        confidenceScore, JSON.stringify({
          ownBuyAverage: result.ownBuyAverage, ownSellAverage: result.ownSellAverage,
          marketReference: result.marketReference, buySampleCount, sellSampleCount,
          marketSampleCount, volatility: result.volatility
        }), JSON.stringify(explanation)
      );
      recommendations.push(result);
    }
    return { calculatedAt, recommendations };
  }

  rebuildCardSearchIndexes(metacardIds = null, manageTransaction = true) {
    const ids = Array.isArray(metacardIds)
      ? [...new Set(metacardIds.map(value => String(value || '').trim()).filter(Boolean))]
      : this.db.prepare('SELECT metacard_id FROM card_name_mappings').all().map(row => String(row.metacard_id));
    if (!ids.length) return 0;

    const getMapping = this.db.prepare(`
      SELECT metacard_id, name_de, name_en FROM card_name_mappings WHERE metacard_id = ?
    `);
    const getAliases = this.db.prepare(`
      SELECT alias FROM card_aliases WHERE metacard_id = ? ORDER BY language, alias
    `);
    const upsertIndex = this.db.prepare(`
      INSERT INTO card_search_index (metacard_id, search_text, search_compact, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(metacard_id) DO UPDATE SET
        search_text = excluded.search_text,
        search_compact = excluded.search_compact,
        updated_at = excluded.updated_at
    `);
    if (manageTransaction) this.db.exec('BEGIN IMMEDIATE;');
    try {
      const updatedAt = isoNow();
      let written = 0;
      for (const metacardId of ids) {
        const mapping = getMapping.get(metacardId);
        if (!mapping) continue;
        const aliases = getAliases.all(metacardId).map(row => row.alias);
        const document = cardSearch.buildSearchDocument([
          mapping.name_de, mapping.name_en, ...aliases
        ]);
        upsertIndex.run(metacardId, document.spaced, document.compact, updatedAt);
        written += 1;
      }
      if (manageTransaction) this.db.exec('COMMIT;');
      return written;
    } catch (error) {
      if (manageTransaction) this.db.exec('ROLLBACK;');
      throw error;
    }
  }

  beginCardmarketImport(options = {}) {
    this.open();
    if (this.cardmarketImportSession) throw new Error('Ein Cardmarket-Import läuft bereits.');
    const type = String(options.type || '').trim();
    if (!['products', 'prices'].includes(type)) throw new TypeError('Unbekannter Cardmarket-Importtyp.');
    const runId = String(options.runId || `cardmarket-${type}-${Date.now()}`);
    const source = String(options.source || (type === 'prices' ? 'cardmarket_price_guide' : 'cardmarket_product_catalog'));
    const sourceId = String(options.sourceId || source);
    const snapshotDate = String(options.snapshotDate || '');
    const importedAt = String(options.importedAt || isoNow());
    const table = type === 'prices' ? 'cm_price_import_stage' : 'cm_product_import_stage';

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.db.exec(`DROP TABLE IF EXISTS temp.${table};`);
      if (type === 'products') {
        this.db.exec(`
          CREATE TEMP TABLE ${table} (
            product_id TEXT PRIMARY KEY, metacard_id TEXT, expansion_id TEXT, category_id INTEGER,
            name_de TEXT, name_en TEXT, official_name TEXT, set_name TEXT, set_code TEXT,
            rarity TEXT, variant TEXT, language TEXT, card_condition TEXT, collector_number TEXT,
            product_url TEXT, search_text TEXT, search_compact TEXT, archived INTEGER, updated_at TEXT
          ) WITHOUT ROWID;
        `);
      } else {
        this.db.exec(`
          CREATE TEMP TABLE ${table} (
            product_id TEXT NOT NULL, captured_date TEXT NOT NULL, category_id INTEGER,
            avg_price REAL, low_price REAL, trend_price REAL, avg_1 REAL, avg_7 REAL, avg_30 REAL,
            avg_foil REAL, low_foil REAL, trend_foil REAL, avg_1_foil REAL, avg_7_foil REAL, avg_30_foil REAL,
            source_id TEXT NOT NULL, source_type TEXT, data_quality TEXT,
            collected_at TEXT, imported_at TEXT, source_record_key TEXT, raw_json TEXT,
            PRIMARY KEY (product_id, captured_date, source_id)
          ) WITHOUT ROWID;
        `);
      }
      this.cardmarketImportSession = {
        runId, type, source, sourceId, snapshotDate, importedAt, table,
        startedAt: String(options.startedAt || importedAt), rowsRead: 0, rowsWritten: 0, skippedRows: 0
      };
      return { ok: true, runId, type };
    } catch (error) {
      try { this.db.exec('ROLLBACK;'); } catch (_rollbackError) { /* Ursprungsfehler bleibt maßgeblich. */ }
      this.cardmarketImportSession = null;
      throw error;
    }
  }

  appendCardmarketImport({ runId = '', rows = [] } = {}) {
    this.open();
    const session = this.cardmarketImportSession;
    if (!session || String(runId) !== session.runId) throw new Error('Der atomare Cardmarket-Import ist nicht aktiv.');
    if (!Array.isArray(rows) || rows.length === 0) return { written: 0, totalWritten: session.rowsWritten };
    if (rows.length > 5000) throw new Error('Zu viele Zeilen in einem Cardmarket-Importblock.');

    try {
      let written = 0;
      if (session.type === 'products') {
        const statement = this.db.prepare(`
          INSERT INTO ${session.table} (
            product_id, metacard_id, expansion_id, category_id,
            name_de, name_en, official_name, set_name, set_code,
            rarity, variant, language, card_condition, collector_number,
            product_url, search_text, search_compact, archived, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(product_id) DO UPDATE SET
            metacard_id = excluded.metacard_id, expansion_id = excluded.expansion_id,
            category_id = excluded.category_id, name_de = excluded.name_de, name_en = excluded.name_en,
            official_name = excluded.official_name, set_name = excluded.set_name, set_code = excluded.set_code,
            rarity = excluded.rarity, variant = excluded.variant, language = excluded.language,
            card_condition = excluded.card_condition, collector_number = excluded.collector_number,
            product_url = excluded.product_url, search_text = excluded.search_text,
            search_compact = excluded.search_compact, archived = excluded.archived, updated_at = excluded.updated_at
        `);
        for (const row of rows) {
          const productId = String(row?.productId ?? '').trim();
          if (!/^\d+$/.test(productId)) { session.skippedRows += 1; continue; }
          const metacardId = String(row?.metacardId ?? '').trim();
          const nameDe = String(row?.germanName || '').trim();
          const nameEn = String(row?.officialBaseName || row?.officialName || row?.baseName || row?.name || '').trim();
          const officialName = String(row?.officialName || row?.baseName || row?.name || '').trim();
          const searchDocument = cardSearch.buildSearchDocument([
            productId, metacardId, nameDe, nameEn, officialName,
            row?.setName, row?.setCode || row?.set, row?.rarity, row?.variant,
            row?.collectorNumber, row?.expansionId ? `expansion ${row.expansionId}` : ''
          ]);
          statement.run(
            productId, metacardId || null, String(row?.expansionId ?? '').trim() || null,
            Number(row?.categoryId || 0) || null, nameDe, nameEn, officialName,
            String(row?.setName || '').trim(), String(row?.setCode || row?.set || '').trim(),
            String(row?.rarity || '').trim(), String(row?.variant || '').trim(),
            String(row?.language || '').trim(), String(row?.condition || '').trim(),
            String(row?.collectorNumber || '').trim(), String(row?.productUrl || '').trim(),
            searchDocument.spaced, searchDocument.compact, row?.archived ? 1 : 0,
            String(row?.updatedAt || session.importedAt)
          );
          written += 1;
        }
      } else {
        const numberOrNull = value => {
          if (value === null || value === undefined || value === '') return null;
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        };
        const statement = this.db.prepare(`
          INSERT INTO ${session.table} (
            product_id, captured_date, category_id,
            avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
            avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
            source_id, source_type, data_quality, collected_at, imported_at,
            source_record_key, raw_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(product_id, captured_date, source_id) DO UPDATE SET
            category_id = excluded.category_id, avg_price = excluded.avg_price,
            low_price = excluded.low_price, trend_price = excluded.trend_price,
            avg_1 = excluded.avg_1, avg_7 = excluded.avg_7, avg_30 = excluded.avg_30,
            avg_foil = excluded.avg_foil, low_foil = excluded.low_foil,
            trend_foil = excluded.trend_foil, avg_1_foil = excluded.avg_1_foil,
            avg_7_foil = excluded.avg_7_foil, avg_30_foil = excluded.avg_30_foil,
            source_type = excluded.source_type, data_quality = excluded.data_quality,
            collected_at = excluded.collected_at, imported_at = excluded.imported_at,
            source_record_key = excluded.source_record_key, raw_json = excluded.raw_json
        `);
        for (const row of rows) {
          const productId = String(row?.productId ?? '').trim();
          if (!/^\d+$/.test(productId)) { session.skippedRows += 1; continue; }
          const rowDate = /^\d{4}-\d{2}-\d{2}$/.test(String(row?.date || ''))
            ? String(row.date) : (session.snapshotDate || dateStamp());
          const rowSourceId = String(row?.sourceId || session.sourceId || 'cardmarket_price_guide');
          const collectedAt = String(row?.collectedAt || `${rowDate}T12:00:00.000Z`);
          statement.run(
            productId, rowDate, Number(row?.categoryId || 0) || null,
            numberOrNull(row?.avg), numberOrNull(row?.low), numberOrNull(row?.trend),
            numberOrNull(row?.avg1), numberOrNull(row?.avg7), numberOrNull(row?.avg30),
            numberOrNull(row?.avgFoil), numberOrNull(row?.lowFoil), numberOrNull(row?.trendFoil),
            numberOrNull(row?.avg1Foil), numberOrNull(row?.avg7Foil), numberOrNull(row?.avg30Foil),
            rowSourceId, String(row?.sourceType || 'official_download'),
            String(row?.dataQuality || 'official_reference'), collectedAt, session.importedAt,
            String(row?.sourceRecordKey || `${rowDate}|${productId}`), JSON.stringify(row || {})
          );
          written += 1;
        }
      }
      session.rowsRead += rows.length;
      session.rowsWritten += written;
      return { written, totalWritten: session.rowsWritten, skippedRows: session.skippedRows };
    } catch (error) {
      this.rollbackCardmarketImport({ runId: session.runId, errorMessage: error.message });
      throw error;
    }
  }

  commitCardmarketImport({ runId = '', rowsRead = null, skippedRows = null } = {}) {
    this.open();
    const session = this.cardmarketImportSession;
    if (!session || String(runId) !== session.runId) throw new Error('Der atomare Cardmarket-Import ist nicht aktiv.');
    const finishedAt = isoNow();
    try {
      if (session.type === 'products') {
        this.db.exec(`
          INSERT INTO products (
            product_id, metacard_id, expansion_id, category_id,
            name_de, name_en, official_name, set_name, set_code,
            rarity, variant, language, card_condition, collector_number,
            product_url, search_text, search_compact, archived, updated_at
          )
          SELECT product_id, metacard_id, expansion_id, category_id,
                 name_de, name_en, official_name, set_name, set_code,
                 rarity, variant, language, card_condition, collector_number,
                 product_url, search_text, search_compact, archived, updated_at
          FROM ${session.table} WHERE 1
          ON CONFLICT(product_id) DO UPDATE SET
            metacard_id = COALESCE(NULLIF(excluded.metacard_id, ''), products.metacard_id),
            expansion_id = COALESCE(NULLIF(excluded.expansion_id, ''), products.expansion_id),
            category_id = COALESCE(excluded.category_id, products.category_id),
            name_de = COALESCE(NULLIF(excluded.name_de, ''), products.name_de),
            name_en = COALESCE(NULLIF(excluded.name_en, ''), products.name_en),
            official_name = COALESCE(NULLIF(excluded.official_name, ''), products.official_name),
            set_name = COALESCE(NULLIF(excluded.set_name, ''), products.set_name),
            set_code = COALESCE(NULLIF(excluded.set_code, ''), products.set_code),
            rarity = COALESCE(NULLIF(excluded.rarity, ''), products.rarity),
            variant = COALESCE(NULLIF(excluded.variant, ''), products.variant),
            language = COALESCE(NULLIF(excluded.language, ''), products.language),
            card_condition = COALESCE(NULLIF(excluded.card_condition, ''), products.card_condition),
            collector_number = COALESCE(NULLIF(excluded.collector_number, ''), products.collector_number),
            product_url = COALESCE(NULLIF(excluded.product_url, ''), products.product_url),
            search_text = COALESCE(NULLIF(excluded.search_text, ''), products.search_text),
            search_compact = COALESCE(NULLIF(excluded.search_compact, ''), products.search_compact),
            archived = excluded.archived, updated_at = excluded.updated_at;

          INSERT INTO card_name_mappings (
            metacard_id, external_card_id, name_de, name_en, name_source,
            source_revision, match_method, match_status, updated_at
          )
          SELECT metacard_id, NULL, MAX(name_de), MAX(name_en), 'product_catalog_cache', '',
                 'cardmarket_metacard', CASE WHEN MAX(NULLIF(name_de, '')) IS NOT NULL THEN 'mapped' ELSE 'english_only' END,
                 MAX(updated_at)
          FROM ${session.table}
          WHERE NULLIF(metacard_id, '') IS NOT NULL
          GROUP BY metacard_id
          ON CONFLICT(metacard_id) DO UPDATE SET
            name_de = COALESCE(NULLIF(excluded.name_de, ''), card_name_mappings.name_de),
            name_en = COALESCE(NULLIF(excluded.name_en, ''), card_name_mappings.name_en),
            name_source = CASE WHEN NULLIF(card_name_mappings.name_source, '') IS NULL THEN excluded.name_source ELSE card_name_mappings.name_source END,
            match_method = CASE WHEN NULLIF(card_name_mappings.match_method, '') IS NULL THEN excluded.match_method ELSE card_name_mappings.match_method END,
            match_status = CASE WHEN NULLIF(excluded.name_de, '') IS NOT NULL THEN 'mapped' ELSE card_name_mappings.match_status END,
            updated_at = excluded.updated_at;
        `);
        const metacardIds = this.db.prepare(`SELECT DISTINCT metacard_id FROM ${session.table} WHERE NULLIF(metacard_id, '') IS NOT NULL`).all().map(row => row.metacard_id);
        this.rebuildCardSearchIndexes(metacardIds, false);
        this.cardNameRecognitionIndex = null;
      } else {
        this.db.exec(`
          INSERT OR IGNORE INTO data_sources (
            source_id, source_type, display_name, enabled, read_only, priority,
            base_url, config_json, created_at, updated_at
          )
          SELECT DISTINCT source_id, 'market_import', source_id, 1, 1, 70, '', '{}', imported_at, imported_at
          FROM ${session.table};

          INSERT INTO market_prices (
            product_id, captured_date, category_id,
            avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
            avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
            source_id, source_type, data_quality, collected_at, imported_at
          )
          SELECT product_id, captured_date, category_id,
                 avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
                 avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
                 source_id, source_type, data_quality, collected_at, imported_at
          FROM ${session.table} WHERE 1
          ON CONFLICT(product_id, captured_date) DO UPDATE SET
            category_id = excluded.category_id, avg_price = excluded.avg_price,
            low_price = excluded.low_price, trend_price = excluded.trend_price,
            avg_1 = excluded.avg_1, avg_7 = excluded.avg_7, avg_30 = excluded.avg_30,
            avg_foil = excluded.avg_foil, low_foil = excluded.low_foil,
            trend_foil = excluded.trend_foil, avg_1_foil = excluded.avg_1_foil,
            avg_7_foil = excluded.avg_7_foil, avg_30_foil = excluded.avg_30_foil,
            source_id = excluded.source_id, source_type = excluded.source_type,
            data_quality = excluded.data_quality, collected_at = excluded.collected_at,
            imported_at = excluded.imported_at;

          INSERT INTO market_observations (
            product_id, observed_at, observed_date, source_id, source_record_key,
            category_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
            avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
            data_quality, imported_at, raw_json
          )
          SELECT product_id, collected_at, captured_date, source_id, source_record_key,
                 category_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
                 avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
                 data_quality, imported_at, raw_json
          FROM ${session.table} WHERE 1
          ON CONFLICT(source_id, source_record_key) DO UPDATE SET
            observed_at = excluded.observed_at, category_id = excluded.category_id,
            avg_price = excluded.avg_price, low_price = excluded.low_price,
            trend_price = excluded.trend_price, avg_1 = excluded.avg_1,
            avg_7 = excluded.avg_7, avg_30 = excluded.avg_30,
            avg_foil = excluded.avg_foil, low_foil = excluded.low_foil,
            trend_foil = excluded.trend_foil, avg_1_foil = excluded.avg_1_foil,
            avg_7_foil = excluded.avg_7_foil, avg_30_foil = excluded.avg_30_foil,
            data_quality = excluded.data_quality, imported_at = excluded.imported_at,
            raw_json = excluded.raw_json;
        `);
        const snapshotDates = this.db.prepare(`SELECT DISTINCT captured_date AS date FROM ${session.table}`).all().map(row => row.date);
        const sourceIds = this.db.prepare(`SELECT DISTINCT source_id AS id FROM ${session.table}`).all().map(row => row.id);
        this.updateSnapshotSummaries(snapshotDates, session.sourceId, session.importedAt);
        this.updateObservationSummaries(snapshotDates, sourceIds, session.importedAt);
      }

      session.rowsRead = rowsRead === null ? session.rowsRead : Number(rowsRead || 0);
      session.skippedRows = skippedRows === null ? session.skippedRows : Number(skippedRows || 0);
      this.recordImportRun({
        runId: session.runId, source: session.source, sourceId: session.sourceId,
        snapshotDate: session.snapshotDate, startedAt: session.startedAt, finishedAt,
        status: 'success', rowsRead: session.rowsRead, rowsWritten: session.rowsWritten,
        skippedRows: session.skippedRows, metadata: { atomic: true, type: session.type }
      });
      this.db.exec('COMMIT;');
      const result = {
        ok: true, runId: session.runId, type: session.type, written: session.rowsWritten,
        rowsRead: session.rowsRead, skippedRows: session.skippedRows, finishedAt
      };
      this.cardmarketImportSession = null;
      try { this.db.exec(`DROP TABLE IF EXISTS temp.${session.table};`); } catch (_dropError) { /* TEMP-Rest ist folgenlos. */ }
      return result;
    } catch (error) {
      try { this.db.exec('ROLLBACK;'); } catch (_rollbackError) { /* Ursprungsfehler bleibt maßgeblich. */ }
      this.cardmarketImportSession = null;
      try { this.db.exec(`DROP TABLE IF EXISTS temp.${session.table};`); } catch (_dropError) { /* TEMP-Rest ist folgenlos. */ }
      try {
        this.recordImportRun({
          runId: session.runId, source: session.source, sourceId: session.sourceId,
          snapshotDate: session.snapshotDate, startedAt: session.startedAt, finishedAt,
          status: 'failed', rowsRead: session.rowsRead, rowsWritten: 0,
          skippedRows: session.skippedRows, errorMessage: error.message,
          metadata: { atomic: true, type: session.type, rolledBack: true }
        });
      } catch (_logError) { /* Das Scheitern des Fehlerprotokolls verdeckt nicht den Importfehler. */ }
      throw error;
    }
  }

  rollbackCardmarketImport({ runId = '', errorMessage = 'Import wurde abgebrochen.' } = {}) {
    this.open();
    const session = this.cardmarketImportSession;
    if (!session || (runId && String(runId) !== session.runId)) return { ok: true, rolledBack: false };
    try { this.db.exec('ROLLBACK;'); } catch (_rollbackError) { /* Verbindung bleibt benutzbar. */ }
    this.cardmarketImportSession = null;
    try { this.db.exec(`DROP TABLE IF EXISTS temp.${session.table};`); } catch (_dropError) { /* TEMP-Rest ist folgenlos. */ }
    const finishedAt = isoNow();
    try {
      this.recordImportRun({
        runId: session.runId, source: session.source, sourceId: session.sourceId,
        snapshotDate: session.snapshotDate, startedAt: session.startedAt, finishedAt,
        status: 'failed', rowsRead: session.rowsRead, rowsWritten: 0,
        skippedRows: session.skippedRows, errorMessage,
        metadata: { atomic: true, type: session.type, rolledBack: true }
      });
    } catch (_logError) { /* Der Rollback selbst war erfolgreich. */ }
    return { ok: true, rolledBack: true, runId: session.runId };
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
        product_url, search_text, search_compact, archived, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        metacard_id = COALESCE(NULLIF(excluded.metacard_id, ''), products.metacard_id),
        expansion_id = COALESCE(NULLIF(excluded.expansion_id, ''), products.expansion_id),
        category_id = COALESCE(excluded.category_id, products.category_id),
        name_de = COALESCE(NULLIF(excluded.name_de, ''), products.name_de),
        name_en = COALESCE(NULLIF(excluded.name_en, ''), products.name_en),
        official_name = COALESCE(NULLIF(excluded.official_name, ''), products.official_name),
        set_name = COALESCE(NULLIF(excluded.set_name, ''), products.set_name),
        set_code = COALESCE(NULLIF(excluded.set_code, ''), products.set_code),
        rarity = COALESCE(NULLIF(excluded.rarity, ''), products.rarity),
        variant = COALESCE(NULLIF(excluded.variant, ''), products.variant),
        language = COALESCE(NULLIF(excluded.language, ''), products.language),
        card_condition = COALESCE(NULLIF(excluded.card_condition, ''), products.card_condition),
        collector_number = COALESCE(NULLIF(excluded.collector_number, ''), products.collector_number),
        product_url = COALESCE(NULLIF(excluded.product_url, ''), products.product_url),
        search_text = COALESCE(NULLIF(excluded.search_text, ''), products.search_text),
        search_compact = COALESCE(NULLIF(excluded.search_compact, ''), products.search_compact),
        archived = excluded.archived,
        updated_at = excluded.updated_at
    `);
    const mappingStatement = this.db.prepare(`
      INSERT INTO card_name_mappings (
        metacard_id, external_card_id, name_de, name_en, name_source,
        source_revision, match_method, match_status, updated_at
      ) VALUES (?, NULL, ?, ?, 'product_catalog_cache', '', 'cardmarket_metacard', ?, ?)
      ON CONFLICT(metacard_id) DO UPDATE SET
        name_de = COALESCE(NULLIF(excluded.name_de, ''), card_name_mappings.name_de),
        name_en = COALESCE(NULLIF(excluded.name_en, ''), card_name_mappings.name_en),
        name_source = CASE
          WHEN NULLIF(card_name_mappings.name_source, '') IS NULL THEN excluded.name_source
          ELSE card_name_mappings.name_source
        END,
        match_method = CASE
          WHEN NULLIF(card_name_mappings.match_method, '') IS NULL THEN excluded.match_method
          ELSE card_name_mappings.match_method
        END,
        match_status = CASE
          WHEN NULLIF(excluded.name_de, '') IS NOT NULL THEN 'mapped'
          ELSE card_name_mappings.match_status
        END,
        updated_at = excluded.updated_at
    `);
    const getStoredProduct = this.db.prepare(`
      SELECT product_id, metacard_id, expansion_id, category_id,
             name_de, name_en, official_name, set_name, set_code,
             rarity, variant, collector_number
      FROM products WHERE product_id = ?
    `);
    const updateStoredSearch = this.db.prepare(`
      UPDATE products SET search_text = ?, search_compact = ? WHERE product_id = ?
    `);

    let written = 0;
    const touchedMetacards = new Set();
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      for (const row of rows) {
        const productId = String(row?.productId ?? '').trim();
        if (!/^\d+$/.test(productId)) continue;
        const metacardId = String(row?.metacardId ?? '').trim();
        const nameDe = String(row?.germanName || '').trim();
        const nameEn = String(row?.officialBaseName || row?.officialName || row?.baseName || row?.name || '').trim();
        const officialName = String(row?.officialName || row?.baseName || row?.name || '').trim();
        const searchDocument = cardSearch.buildSearchDocument([
          productId, metacardId, nameDe, nameEn, officialName,
          row?.setName, row?.setCode || row?.set, row?.rarity, row?.variant,
          row?.collectorNumber,
          row?.expansionId ? `expansion ${row.expansionId}` : ''
        ]);
        statement.run(
          productId,
          metacardId || null,
          String(row?.expansionId ?? '').trim() || null,
          Number(row?.categoryId || 0) || null,
          nameDe,
          nameEn,
          officialName,
          String(row?.setName || '').trim(),
          String(row?.setCode || row?.set || '').trim(),
          String(row?.rarity || '').trim(),
          String(row?.variant || '').trim(),
          String(row?.language || '').trim(),
          String(row?.condition || '').trim(),
          String(row?.collectorNumber || '').trim(),
          String(row?.productUrl || '').trim(),
          searchDocument.spaced,
          searchDocument.compact,
          row?.archived ? 1 : 0,
          String(row?.updatedAt || isoNow())
        );
        const stored = getStoredProduct.get(productId);
        const storedSearch = cardSearch.buildSearchDocument([
          stored?.product_id, stored?.metacard_id, stored?.name_de, stored?.name_en,
          stored?.official_name, stored?.set_name, stored?.set_code, stored?.rarity,
          stored?.variant, stored?.collector_number,
          stored?.expansion_id ? `expansion ${stored.expansion_id}` : '',
          stored?.category_id ? `category ${stored.category_id}` : ''
        ]);
        updateStoredSearch.run(storedSearch.spaced, storedSearch.compact, productId);
        if (metacardId) {
          mappingStatement.run(
            metacardId,
            nameDe,
            nameEn,
            nameDe ? 'mapped' : 'english_only',
            String(row?.updatedAt || isoNow())
          );
          touchedMetacards.add(metacardId);
        }
        written += 1;
      }
      this.rebuildCardSearchIndexes([...touchedMetacards], false);
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    this.cardNameRecognitionIndex = null;
    return { written };
  }

  upsertCardNames(payload = {}) {
    this.open();
    const mappings = Array.isArray(payload?.mappings) ? payload.mappings : [];
    const aliases = Array.isArray(payload?.aliases) ? payload.aliases : [];
    if (!mappings.length) return { mappingsWritten: 0, aliasesWritten: 0 };

    const source = String(payload?.source || 'bilingual_card_catalog').trim();
    const sourceRevision = String(payload?.sourceRevision || '').trim();
    const updatedAt = String(payload?.updatedAt || isoNow());
    const touchedMetacards = [...new Set(mappings
      .map(row => String(row?.metacardId || '').trim())
      .filter(value => /^\d+$/.test(value)))];
    if (!touchedMetacards.length) return { mappingsWritten: 0, aliasesWritten: 0 };
    const touchedMetacardSet = new Set(touchedMetacards);

    const upsertMapping = this.db.prepare(`
      INSERT INTO card_name_mappings (
        metacard_id, external_card_id, name_de, name_en, name_source,
        source_revision, match_method, match_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(metacard_id) DO UPDATE SET
        external_card_id = COALESCE(NULLIF(excluded.external_card_id, ''), card_name_mappings.external_card_id),
        name_de = COALESCE(NULLIF(excluded.name_de, ''), card_name_mappings.name_de),
        name_en = COALESCE(NULLIF(excluded.name_en, ''), card_name_mappings.name_en),
        name_source = excluded.name_source,
        source_revision = excluded.source_revision,
        match_method = excluded.match_method,
        match_status = CASE
          WHEN excluded.match_status IN ('unmatched', 'english_only')
            AND COALESCE(NULLIF(excluded.name_de, ''), NULLIF(card_name_mappings.name_de, '')) IS NOT NULL
          THEN 'mapped'
          ELSE excluded.match_status
        END,
        updated_at = excluded.updated_at
    `);
    const updateProducts = this.db.prepare(`
      UPDATE products SET
        name_de = COALESCE(NULLIF(?, ''), name_de),
        name_en = COALESCE(NULLIF(?, ''), name_en),
        updated_at = ?
      WHERE metacard_id = ?
    `);
    const deleteAliases = this.db.prepare('DELETE FROM card_aliases WHERE metacard_id = ?');
    const insertAlias = this.db.prepare(`
      INSERT INTO card_aliases (
        metacard_id, language, alias, normalized_alias, compact_alias, source, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(metacard_id, language, normalized_alias) DO UPDATE SET
        alias = excluded.alias,
        compact_alias = excluded.compact_alias,
        source = excluded.source,
        updated_at = excluded.updated_at
    `);
    const getProducts = this.db.prepare(`
      SELECT product_id, metacard_id, expansion_id, category_id,
             name_de, name_en, official_name, set_name, set_code,
             rarity, variant, collector_number
      FROM products WHERE metacard_id = ?
    `);
    const updateProductSearch = this.db.prepare(`
      UPDATE products SET search_text = ?, search_compact = ? WHERE product_id = ?
    `);

    let mappingsWritten = 0;
    let aliasesWritten = 0;
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      for (const row of mappings) {
        const metacardId = String(row?.metacardId || '').trim();
        if (!/^\d+$/.test(metacardId)) continue;
        const nameDe = String(row?.nameDe || '').trim();
        const nameEn = String(row?.nameEn || '').trim();
        upsertMapping.run(
          metacardId,
          String(row?.externalCardId || '').trim(),
          nameDe,
          nameEn,
          String(row?.source || source),
          String(row?.sourceRevision || sourceRevision),
          String(row?.matchMethod || 'normalized_english_name'),
          String(row?.matchStatus || (nameDe ? 'mapped' : (nameEn ? 'english_only' : 'unmatched'))),
          String(row?.updatedAt || updatedAt)
        );
        updateProducts.run(nameDe, nameEn, String(row?.updatedAt || updatedAt), metacardId);
        mappingsWritten += 1;
      }

      if (payload?.replaceAliases !== false) {
        for (const metacardId of touchedMetacards) deleteAliases.run(metacardId);
      }
      for (const row of aliases) {
        const metacardId = String(row?.metacardId || '').trim();
        const language = String(row?.language || '').trim().toLowerCase();
        const alias = String(row?.alias || '').trim();
        if (!touchedMetacardSet.has(metacardId) || !['de', 'en'].includes(language) || !alias) continue;
        const normalized = cardSearch.normalizeSpaced(alias);
        const compact = cardSearch.normalizeCompact(alias);
        if (!normalized || !compact) continue;
        insertAlias.run(
          metacardId, language, alias, normalized, compact,
          String(row?.source || source), String(row?.updatedAt || updatedAt)
        );
        aliasesWritten += 1;
      }

      for (const metacardId of touchedMetacards) {
        for (const product of getProducts.iterate(metacardId)) {
          const document = cardSearch.buildSearchDocument([
            product.product_id, product.metacard_id, product.name_de, product.name_en,
            product.official_name, product.set_name, product.set_code, product.rarity,
            product.variant, product.collector_number,
            product.expansion_id ? `expansion ${product.expansion_id}` : '',
            product.category_id ? `category ${product.category_id}` : ''
          ]);
          updateProductSearch.run(document.spaced, document.compact, product.product_id);
        }
      }

      this.rebuildCardSearchIndexes(touchedMetacards, false);

      const status = payload?.status || {};
      this.db.prepare(`
        INSERT INTO card_name_sync_status (
          id, source, source_revision, imported_at, english_name_count,
          german_name_count, mapped_metacard_count, german_metacard_count,
          alias_count, unmatched_metacard_count, ambiguous_metacard_count
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          source = excluded.source,
          source_revision = excluded.source_revision,
          imported_at = excluded.imported_at,
          english_name_count = excluded.english_name_count,
          german_name_count = excluded.german_name_count,
          mapped_metacard_count = excluded.mapped_metacard_count,
          german_metacard_count = excluded.german_metacard_count,
          alias_count = excluded.alias_count,
          unmatched_metacard_count = excluded.unmatched_metacard_count,
          ambiguous_metacard_count = excluded.ambiguous_metacard_count
      `).run(
        source, sourceRevision, updatedAt,
        Number(status.englishNameCount || 0),
        Number(status.germanNameCount || 0),
        Number(status.mappedMetacardCount || mappingsWritten),
        Number(status.germanMetacardCount || mappings.filter(row => row?.nameDe).length),
        Number(status.aliasCount || aliasesWritten),
        Number(status.unmatchedMetacardCount || 0),
        Number(status.ambiguousMetacardCount || 0)
      );
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    this.cardNameRecognitionIndex = null;
    return { mappingsWritten, aliasesWritten, metacardsTouched: touchedMetacards.length };
  }

  getCardNameRecognitionIndex() {
    this.open();
    if (this.cardNameRecognitionIndex) return this.cardNameRecognitionIndex;
    const rows = this.db.prepare(`
      SELECT m.metacard_id AS metacardId, m.name_de AS germanName, m.name_en AS englishName
      FROM card_name_mappings m
      WHERE EXISTS (SELECT 1 FROM products p WHERE p.metacard_id = m.metacard_id)
      ORDER BY CAST(m.metacard_id AS INTEGER)
    `).all();
    const byId = new Map(rows.map(row => [String(row.metacardId), { ...row, aliases: [], setCodes: [], passcodes: [], artworkFingerprints: [] }]));
    for (const row of this.db.prepare(`
      SELECT metacard_id AS metacardId, language, alias FROM card_aliases
      ORDER BY metacard_id, language, alias
    `).iterate()) {
      const entry = byId.get(String(row.metacardId));
      if (!entry) continue;
      entry.aliases.push({ language: row.language, alias: row.alias });
      if (String(row.language || '').toLowerCase() === 'passcode') {
        const passcode = scannerRecognition.normalizePasscode(row.alias);
        if (passcode && !entry.passcodes.includes(passcode)) entry.passcodes.push(passcode);
      }
    }
    for (const row of this.db.prepare(`
      SELECT DISTINCT metacard_id AS metacardId, set_code AS setCode, collector_number AS collectorNumber
      FROM products WHERE NULLIF(metacard_id, '') IS NOT NULL
    `).iterate()) {
      const entry = byId.get(String(row.metacardId));
      if (!entry) continue;
      for (const value of [row.setCode, row.collectorNumber]) {
        const normalized = scannerRecognition.normalizeSetCode(value);
        if (normalized && !entry.setCodes.includes(normalized)) entry.setCodes.push(normalized);
      }
    }
    const state = this.loadState().state || {};
    const productToMetacard = new Map(this.db.prepare(`
      SELECT product_id AS productId, metacard_id AS metacardId
      FROM products WHERE NULLIF(metacard_id, '') IS NOT NULL
    `).all().map(row => [String(row.productId), String(row.metacardId)]));
    const addReference = (metacardId, passcode, fingerprints = []) => {
      const entry = byId.get(String(metacardId || ''));
      if (!entry) return;
      const normalizedPasscode = scannerRecognition.normalizePasscode(passcode);
      if (normalizedPasscode && !entry.passcodes.includes(normalizedPasscode)) entry.passcodes.push(normalizedPasscode);
      for (const fingerprint of Array.isArray(fingerprints) ? fingerprints : []) {
        if (!fingerprint || typeof fingerprint !== 'object') continue;
        const key = JSON.stringify(fingerprint);
        if (!entry.artworkFingerprints.some(value => JSON.stringify(value) === key)) entry.artworkFingerprints.push(fingerprint);
      }
    };
    for (const row of Array.isArray(state.cardNamePasscodes) ? state.cardNamePasscodes : []) {
      addReference(row.metacardId, row.passcode);
    }
    for (const mapping of Array.isArray(state.scannerMappings) ? state.scannerMappings : []) {
      const metacardId = mapping.metacardId || productToMetacard.get(String(mapping.productId || ''));
      const legacyFingerprint = mapping.fingerprint ? [{ version: 'legacy-dhash', dHash: String(mapping.fingerprint) }] : [];
      addReference(metacardId, mapping.passcode || mapping.cardPasscode, [
        ...legacyFingerprint,
        ...(Array.isArray(mapping.artworkFingerprints) ? mapping.artworkFingerprints : [])
      ]);
    }
    for (const analysis of Array.isArray(state.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : []) {
      for (const observation of Array.isArray(analysis.photoObservations) ? analysis.photoObservations : []) {
        if (String(observation.nameConfidence || '') !== 'confirmed') continue;
        const selectedName = scannerRecognition.compact(observation.selectedName || '');
        const candidate = (Array.isArray(observation.nameCandidates) ? observation.nameCandidates : []).find(row =>
          scannerRecognition.compact(row?.name || row?.germanName || row?.englishName || '') === selectedName
        );
        const metacardId = candidate?.metacardId || productToMetacard.get(String(observation.selectedProductId || ''));
        addReference(metacardId, observation.nameRecognition?.passcodes?.[0], observation.nameRecognition?.artworkFingerprints);
      }
    }
    this.cardNameRecognitionIndex = [...byId.values()];
    return this.cardNameRecognitionIndex;
  }

  recognizeCardNames({ readings = [], setCodes = [], passcodes = [], artworkFingerprints = [], limit = 5 } = {}) {
    return scannerRecognition.rankNameCandidates(this.getCardNameRecognitionIndex(), readings, {
      setCodes, passcodes, artworkFingerprints, limit
    });
  }

  getCardNameStatus() {
    this.open();
    const counts = this.db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM products) AS productCount,
        (SELECT COUNT(DISTINCT metacard_id) FROM products WHERE NULLIF(metacard_id, '') IS NOT NULL) AS metacardCount,
        (SELECT COUNT(*) FROM card_name_mappings) AS mappingCount,
        (SELECT COUNT(*) FROM card_name_mappings WHERE NULLIF(name_de, '') IS NOT NULL) AS germanMetacardCount,
        (SELECT COUNT(*) FROM card_aliases) AS aliasCount
    `).get();
    const sync = this.db.prepare('SELECT * FROM card_name_sync_status WHERE id = 1').get() || {};
    return {
      productCount: Number(counts?.productCount || 0),
      metacardCount: Number(counts?.metacardCount || 0),
      mappingCount: Number(counts?.mappingCount || 0),
      germanMetacardCount: Number(counts?.germanMetacardCount || 0),
      aliasCount: Number(counts?.aliasCount || 0),
      source: String(sync.source || ''),
      sourceRevision: String(sync.source_revision || ''),
      importedAt: String(sync.imported_at || ''),
      englishNameCount: Number(sync.english_name_count || 0),
      germanNameCount: Number(sync.german_name_count || 0),
      mappedMetacardCount: Number(sync.mapped_metacard_count || counts?.mappingCount || 0),
      syncedGermanMetacardCount: Number(sync.german_metacard_count || counts?.germanMetacardCount || 0),
      syncedAliasCount: Number(sync.alias_count || counts?.aliasCount || 0),
      unmatchedMetacardCount: Number(sync.unmatched_metacard_count || 0),
      ambiguousMetacardCount: Number(sync.ambiguous_metacard_count || 0)
    };
  }

  getCardNamesForProducts({ productIds = [] } = {}) {
    this.open();
    const ids = [...new Set((Array.isArray(productIds) ? productIds : [])
      .map(value => String(value || '').trim())
      .filter(value => /^\d+$/.test(value)))];
    if (!ids.length) return [];

    const rows = [];
    for (let start = 0; start < ids.length; start += 400) {
      const chunk = ids.slice(start, start + 400);
      const placeholders = chunk.map(() => '?').join(',');
      rows.push(...this.db.prepare(`
        SELECT
          p.product_id AS productId,
          p.metacard_id AS metacardId,
          COALESCE(NULLIF(m.name_de, ''), NULLIF(p.name_de, '')) AS germanName,
          COALESCE(NULLIF(m.name_en, ''), NULLIF(p.name_en, ''), NULLIF(p.official_name, '')) AS englishName
        FROM products p
        LEFT JOIN card_name_mappings m ON m.metacard_id = p.metacard_id
        WHERE p.product_id IN (${placeholders})
      `).all(...chunk));
    }

    const metacardIds = [...new Set(rows.map(row => String(row.metacardId || '')).filter(Boolean))];
    const aliasesByMetacard = new Map();
    for (let start = 0; start < metacardIds.length; start += 400) {
      const chunk = metacardIds.slice(start, start + 400);
      const placeholders = chunk.map(() => '?').join(',');
      for (const alias of this.db.prepare(`
        SELECT metacard_id AS metacardId, language, alias
        FROM card_aliases WHERE metacard_id IN (${placeholders})
        ORDER BY language, alias
      `).all(...chunk)) {
        const key = String(alias.metacardId);
        if (!aliasesByMetacard.has(key)) aliasesByMetacard.set(key, []);
        aliasesByMetacard.get(key).push({ language: alias.language, alias: alias.alias });
      }
    }
    return rows.map(row => ({
      ...row,
      aliases: aliasesByMetacard.get(String(row.metacardId || '')) || []
    }));
  }

  searchCards({ query = '', limit = 25, offset = 0 } = {}) {
    this.open();
    const rawQuery = String(query || '').slice(0, 200);
    const variantQuery = cardSearch.parseVariantLabel(rawQuery);
    const searchableQuery = variantQuery.variantNumber ? variantQuery.baseName : rawQuery;
    const forms = cardSearch.queryForms(searchableQuery);
    const setCodeQuery = cardSearch.parseSetCode(rawQuery);
    const exactProductId = /^\d+$/.test(rawQuery.trim()) ? rawQuery.trim() : '';
    if (forms.compact.length < 2) return { totalCards: 0, offset: 0, limit: 25, cards: [] };
    const safeLimit = boundedInteger(limit, 1, 100, 25);
    const safeOffset = boundedInteger(offset, 0, 1000000, 0);

    const clause = (spacedColumn, compactColumn) => {
      const spaced = forms.terms.length
        ? `(${forms.terms.map(() => `(instr(${spacedColumn}, ?) > 0 OR instr(${compactColumn}, ?) > 0)`).join(' AND ')})`
        : '0';
      return `((${spaced}) OR instr(${compactColumn}, ?) > 0)`;
    };
    const parameters = [...forms.terms.flatMap(term => [term, cardSearch.normalizeCompact(term)]), forms.compact];
    const nameRows = this.db.prepare(`
      SELECT c.metacard_id AS metacardId
      FROM card_search_index c
      WHERE ${clause('c.search_text', 'c.search_compact')}
        AND EXISTS (SELECT 1 FROM products p WHERE p.metacard_id = c.metacard_id)
    `).all(...parameters);
    const productRows = this.db.prepare(`
      SELECT DISTINCT metacard_id AS metacardId
      FROM products
      WHERE NULLIF(metacard_id, '') IS NOT NULL
        AND ${clause('search_text', 'search_compact')}
    `).all(...parameters);

    let exactRows = [];
    if (exactProductId) {
      exactRows = this.db.prepare(`
        SELECT DISTINCT metacard_id AS metacardId FROM products
        WHERE product_id = ? AND NULLIF(metacard_id, '') IS NOT NULL
      `).all(exactProductId);
    } else if (setCodeQuery) {
      const full = setCodeQuery.full.toUpperCase();
      const neutral = setCodeQuery.neutral.toUpperCase();
      const localizedPattern = `${setCodeQuery.prefix.toUpperCase()}-??${setCodeQuery.number.toUpperCase()}`;
      exactRows = this.db.prepare(`
        SELECT DISTINCT metacard_id AS metacardId FROM products
        WHERE NULLIF(metacard_id, '') IS NOT NULL AND (
          UPPER(set_code) IN (?, ?) OR UPPER(collector_number) IN (?, ?) OR
          UPPER(set_code) GLOB ? OR UPPER(collector_number) GLOB ?
        )
      `).all(full, neutral, full, neutral, localizedPattern, localizedPattern);
    }

    const nameMatches = new Set(nameRows.map(row => String(row.metacardId || '')).filter(Boolean));
    const exactIds = exactRows.map(row => String(row.metacardId || '')).filter(Boolean);
    const metacardIds = exactIds.length
      ? [...new Set(exactIds)]
      : [...new Set([...nameMatches, ...productRows.map(row => String(row.metacardId || '')).filter(Boolean)])];
    if (!metacardIds.length) return { totalCards: 0, offset: safeOffset, limit: safeLimit, cards: [] };

    const mappings = [];
    const aliasesByMetacard = new Map();
    for (let start = 0; start < metacardIds.length; start += 400) {
      const chunk = metacardIds.slice(start, start + 400);
      const placeholders = chunk.map(() => '?').join(',');
      mappings.push(...this.db.prepare(`
        SELECT metacard_id AS metacardId, external_card_id AS externalCardId,
               name_de AS germanName, name_en AS englishName,
               match_status AS matchStatus
        FROM card_name_mappings
        WHERE metacard_id IN (${placeholders})
      `).all(...chunk));
      for (const alias of this.db.prepare(`
        SELECT metacard_id AS metacardId, alias
        FROM card_aliases
        WHERE metacard_id IN (${placeholders})
      `).all(...chunk)) {
        const key = String(alias.metacardId);
        if (!aliasesByMetacard.has(key)) aliasesByMetacard.set(key, []);
        aliasesByMetacard.get(key).push(String(alias.alias));
      }
    }
    const mappingById = new Map(mappings.map(row => [String(row.metacardId), row]));
    const rank = row => {
      const sourceValues = [row?.germanName, row?.englishName,...(aliasesByMetacard.get(String(row?.metacardId || '')) || [])];
      const values = sourceValues.map(cardSearch.normalizeSpaced).filter(Boolean);
      const compactValues = sourceValues.map(cardSearch.normalizeCompact).filter(Boolean);
      if (values.includes(forms.spaced) || compactValues.includes(forms.compact)) return 0;
      if (values.some(value => value.startsWith(forms.spaced)) || compactValues.some(value => value.startsWith(forms.compact))) return 1;
      if (nameMatches.has(String(row?.metacardId))) return 2;
      return 3;
    };
    const ordered = metacardIds.map(metacardId => mappingById.get(metacardId) || {
      metacardId, germanName: '', englishName: '', matchStatus: 'unmatched'
    }).sort((a, b) =>
      rank(a) - rank(b) ||
      String(a.germanName || a.englishName || a.metacardId).localeCompare(
        String(b.germanName || b.englishName || b.metacardId), 'de'
      )
    );
    const page = ordered.slice(safeOffset, safeOffset + safeLimit);
    const pageIds = page.map(row => String(row.metacardId));
    const variantsByMetacard = new Map(pageIds.map(id => [id, []]));
    for (let start = 0; start < pageIds.length; start += 100) {
      const chunk = pageIds.slice(start, start + 100);
      const placeholders = chunk.map(() => '?').join(',');
      const variants = this.db.prepare(`
        SELECT
          product_id AS productId, metacard_id AS metacardId,
          expansion_id AS expansionId, category_id AS categoryId,
          name_de AS germanName, name_en AS englishName,
          official_name AS officialName, set_name AS setName,
          set_code AS setCode, rarity, variant, language,
          card_condition AS condition, collector_number AS collectorNumber,
          product_url AS productUrl, archived
        FROM products
        WHERE metacard_id IN (${placeholders})
        ORDER BY archived, set_name, set_code, rarity, variant, CAST(product_id AS INTEGER)
      `).all(...chunk);
      const variantMatchesSetCode = variant => {
        if (!setCodeQuery) return true;
        const values = [variant.setCode, variant.collectorNumber].map(value => String(value || '').toUpperCase());
        return values.some(value => {
          if (!value) return false;
          if (value === setCodeQuery.full || value === setCodeQuery.neutral) return true;
          const parsed = cardSearch.parseSetCode(value);
          return parsed && parsed.prefix === setCodeQuery.prefix && parsed.number === setCodeQuery.number;
        });
      };
      const inferredVariants = cardSearch.inferVariantOrdinals(variants);
      inferredVariants.forEach(variant => {
        const variantLabel = variant.variant || variant.inferredVariant || '';
        variant.queryVariantMatch = Boolean(variantQuery.variantNumber
          && cardSearch.normalizeCompact(variantLabel) === cardSearch.normalizeCompact(variantQuery.variant));
      });
      inferredVariants.sort((left, right) =>
        Number(right.queryVariantMatch) - Number(left.queryVariantMatch)
        || Number(left.archived) - Number(right.archived)
        || String(left.setName || '').localeCompare(String(right.setName || ''), 'de')
        || Number(left.productId || 0) - Number(right.productId || 0));
      for (const variant of inferredVariants.filter(variant =>
        (!exactProductId || variant.productId === exactProductId) && variantMatchesSetCode(variant)
      )) variantsByMetacard.get(String(variant.metacardId))?.push(variant);
    }

    return {
      totalCards: ordered.length,
      offset: safeOffset,
      limit: safeLimit,
      cards: page.map(row => ({
        ...row,
        rank: rank(row),
        variants: variantsByMetacard.get(String(row.metacardId)) || []
      }))
    };
  }

  getCardNameBackup() {
    this.open();
    return {
      mappings: this.db.prepare(`
        SELECT metacard_id AS metacardId, external_card_id AS externalCardId,
               name_de AS nameDe, name_en AS nameEn, name_source AS source,
               source_revision AS sourceRevision, match_method AS matchMethod,
               match_status AS matchStatus, updated_at AS updatedAt
        FROM card_name_mappings
      `).all(),
      aliases: this.db.prepare(`
        SELECT metacard_id AS metacardId, language, alias, source, updated_at AS updatedAt
        FROM card_aliases
      `).all(),
      status: this.getCardNameStatus()
    };
  }

  upsertMarketPrices({ rows = [], snapshotDate = '', sourceId = 'cardmarket_price_guide', importedAt = '' } = {}) {
    this.open();
    if (!Array.isArray(rows) || rows.length === 0) return { written: 0 };
    if (rows.length > 5000) throw new Error('Zu viele Preiszeilen in einem Datenbankblock.');

    const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(snapshotDate))
      ? String(snapshotDate)
      : dateStamp();
    const importTime = importedAt || isoNow();
    const sourceIds = [...new Set(rows.map(row => String(row?.sourceId || sourceId || 'cardmarket_price_guide')))];
    const ensureSource = this.db.prepare(`
      INSERT OR IGNORE INTO data_sources (
        source_id, source_type, display_name, enabled, read_only, priority,
        base_url, config_json, created_at, updated_at
      ) VALUES (?, ?, ?, 1, 1, 70, '', '{}', ?, ?)
    `);
    for (const id of sourceIds) ensureSource.run(id, 'market_import', id, importTime, importTime);

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
    const observationStatement = this.db.prepare(`
      INSERT INTO market_observations (
        product_id, observed_at, observed_date, source_id, source_record_key,
        category_id, avg_price, low_price, trend_price, avg_1, avg_7, avg_30,
        avg_foil, low_foil, trend_foil, avg_1_foil, avg_7_foil, avg_30_foil,
        data_quality, imported_at, raw_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id, source_record_key) DO UPDATE SET
        observed_at = excluded.observed_at,
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
        data_quality = excluded.data_quality,
        imported_at = excluded.imported_at,
        raw_json = excluded.raw_json
    `);

    const numberOrNull = value => {
      if (value === null || value === undefined || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    let written = 0;
    const snapshotDates = [...new Set(rows
      .map(row => String(row?.date || normalizedDate))
      .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)))];
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      for (const row of rows) {
        const productId = String(row?.productId ?? '').trim();
        if (!/^\d+$/.test(productId)) continue;
        const rowDate = String(row?.date || normalizedDate);
        const rowSourceId = String(row?.sourceId || sourceId);
        const collectedAt = String(row?.collectedAt || `${rowDate}T12:00:00.000Z` || importTime);
        statement.run(
          productId,
          rowDate,
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
          rowSourceId,
          String(row?.sourceType || 'official_download'),
          String(row?.dataQuality || 'official_reference'),
          collectedAt,
          importTime
        );
        observationStatement.run(
          productId, collectedAt, rowDate, rowSourceId,
          String(row?.sourceRecordKey || `${rowDate}|${productId}`),
          Number(row?.categoryId || 0) || null,
          numberOrNull(row?.avg), numberOrNull(row?.low), numberOrNull(row?.trend),
          numberOrNull(row?.avg1), numberOrNull(row?.avg7), numberOrNull(row?.avg30),
          numberOrNull(row?.avgFoil), numberOrNull(row?.lowFoil), numberOrNull(row?.trendFoil),
          numberOrNull(row?.avg1Foil), numberOrNull(row?.avg7Foil), numberOrNull(row?.avg30Foil),
          String(row?.dataQuality || 'official_reference'), importTime, JSON.stringify(row || {})
        );
        written += 1;
      }
      this.updateSnapshotSummaries(snapshotDates, sourceId, importTime);
      this.updateObservationSummaries(snapshotDates, sourceIds, importTime);
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    return { written, snapshotDate: normalizedDate, snapshotDates };
  }

  updateObservationSummaries(snapshotDates = [], sourceIds = [], importedAt = isoNow()) {
    const countStatement = this.db.prepare(`
      SELECT COUNT(*) AS row_count FROM market_observations
      WHERE observed_date = ? AND source_id = ?
    `);
    const upsertStatement = this.db.prepare(`
      INSERT INTO market_observation_summary (
        source_id, observed_date, row_count, first_imported_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(source_id, observed_date) DO UPDATE SET
        row_count = excluded.row_count,
        updated_at = excluded.updated_at
    `);
    for (const date of snapshotDates) {
      for (const sourceId of sourceIds) {
        const count = Number(countStatement.get(date, sourceId)?.row_count || 0);
        if (count) upsertStatement.run(sourceId, date, count, importedAt, importedAt);
      }
    }
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

  getMarketDecisionHistory({ productIds = [], targetDates = {}, recentDays = 45 } = {}) {
    this.open();
    const ids = [...new Set((productIds || []).map(normalizedProductId).filter(Boolean))].slice(0, 5000);
    const safeRecentDays = boundedInteger(recentDays, 31, 180, 45);
    const selectColumns = `
      captured_date AS date,
      avg_price AS avg,
      low_price AS low,
      trend_price AS trend,
      avg_1 AS avg1,
      avg_7 AS avg7,
      avg_30 AS avg30,
      source_id AS sourceId,
      data_quality AS dataQuality
    `;
    const recentStatement = this.db.prepare(`
      SELECT ${selectColumns}
      FROM market_prices
      WHERE product_id = ?
      ORDER BY captured_date DESC
      LIMIT ?
    `);
    const nearestStatement = this.db.prepare(`
      SELECT ${selectColumns}
      FROM market_prices
      WHERE product_id = ?
      ORDER BY ABS(julianday(captured_date) - julianday(?)), captured_date ASC
      LIMIT 1
    `);
    const histories = {};
    for (const productId of ids) {
      const rows = recentStatement.all(productId, safeRecentDays);
      const requestedDates = Array.isArray(targetDates?.[productId]) ? targetDates[productId] : [];
      for (const requestedDate of requestedDates) {
        if (!/^\d{4}-\d{2}-\d{2}/.test(String(requestedDate || ''))) continue;
        const nearest = nearestStatement.get(productId, String(requestedDate).slice(0, 10));
        if (nearest) rows.push(nearest);
      }
      const byDate = new Map(rows.map(row => [row.date, row]));
      histories[productId] = [...byDate.values()].sort((left, right) => String(left.date).localeCompare(String(right.date)));
    }
    return { histories, productCount: ids.length, recentDays: safeRecentDays };
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

  getCardmarketCacheSeed({ productOffset = 0, priceOffset = 0, limit = 2000 } = {}) {
    this.open();
    const safeLimit = boundedInteger(limit, 100, 5000, 2000);
    const safeProductOffset = boundedInteger(productOffset, 0, 10000000, 0);
    const safePriceOffset = boundedInteger(priceOffset, 0, 10000000, 0);
    const latestDate = String(this.db.prepare('SELECT MAX(captured_date) AS date FROM market_prices').get()?.date || '');
    const productCount = Number(this.db.prepare('SELECT COUNT(*) AS count FROM products WHERE archived = 0').get()?.count || 0);
    const latestPriceCount = latestDate
      ? Number(this.db.prepare('SELECT COUNT(*) AS count FROM market_prices WHERE captured_date = ?').get(latestDate)?.count || 0)
      : 0;
    const products = this.db.prepare(`
      SELECT
        product_id AS productId,
        COALESCE(NULLIF(name_en, ''), NULLIF(official_name, ''), NULLIF(name_de, ''), 'CM Produkt ' || product_id) AS name,
        COALESCE(NULLIF(name_de, ''), '') AS germanName,
        COALESCE(NULLIF(official_name, ''), NULLIF(name_en, ''), NULLIF(name_de, '')) AS officialName,
        COALESCE(NULLIF(name_en, ''), NULLIF(official_name, ''), NULLIF(name_de, '')) AS baseName,
        COALESCE(NULLIF(name_en, ''), NULLIF(official_name, ''), NULLIF(name_de, '')) AS officialBaseName,
        metacard_id AS metacardId, expansion_id AS expansionId, category_id AS categoryId,
        set_name AS setName, set_code AS setCode, set_code AS "set",
        rarity, variant, language, card_condition AS condition,
        collector_number AS collectorNumber, product_url AS productUrl,
        search_text AS searchText, updated_at AS updatedAt
      FROM products
      WHERE archived = 0
      ORDER BY product_id
      LIMIT ? OFFSET ?
    `).all(safeLimit, safeProductOffset);
    const latestPrices = latestDate ? this.db.prepare(`
      SELECT
        product_id AS productId, captured_date AS date, category_id AS categoryId,
        avg_price AS avg, low_price AS low, trend_price AS trend,
        avg_1 AS avg1, avg_7 AS avg7, avg_30 AS avg30,
        avg_foil AS avgFoil, low_foil AS lowFoil, trend_foil AS trendFoil,
        avg_1_foil AS avg1Foil, avg_7_foil AS avg7Foil, avg_30_foil AS avg30Foil,
        source_id AS sourceId, source_type AS sourceType, data_quality AS dataQuality,
        collected_at AS collectedAt, imported_at AS importedAt
      FROM market_prices
      WHERE captured_date = ?
      ORDER BY product_id
      LIMIT ? OFFSET ?
    `).all(latestDate, safeLimit, safePriceOffset) : [];
    return {
      products: products.map(row => ({ ...row, archived: false })),
      latestPrices,
      productCount,
      latestPriceCount,
      latestDate,
      productsDone: safeProductOffset + products.length >= productCount,
      pricesDone: safePriceOffset + latestPrices.length >= latestPriceCount
    };
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
      this.db.exec('DELETE FROM market_observation_summary;');
      this.db.exec('DELETE FROM market_observations;');
      this.db.exec('DELETE FROM pricing_recommendation_history;');
      this.db.exec('DELETE FROM pricing_recommendations;');
      this.db.exec('DELETE FROM market_prices;');
      this.db.exec('DELETE FROM products;');
      this.db.exec('DELETE FROM card_search_index;');
      this.db.exec('DELETE FROM card_aliases;');
      this.db.exec('DELETE FROM card_name_mappings;');
      this.db.exec('DELETE FROM card_name_sync_status;');
      this.db.exec('DELETE FROM import_runs;');
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }
    this.cardNameRecognitionIndex = null;
    return { ok: true };
  }

  recordImportRun(run = {}) {
    this.open();
    const runId = String(run.runId || `run-${Date.now()}`);
    const requestedSource = String(run.sourceId || run.source || 'unknown');
    const knownSource = requestedSource === 'price_guide' ? 'cardmarket_price_guide' : requestedSource;
    const sourceTime = isoNow();
    this.db.prepare(`
      INSERT OR IGNORE INTO data_sources (
        source_id, source_type, display_name, enabled, read_only, priority,
        base_url, config_json, created_at, updated_at
      ) VALUES (?, 'import', ?, 1, 1, 70, '', '{}', ?, ?)
    `).run(knownSource, knownSource, sourceTime, sourceTime);
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
    this.db.prepare(`
      INSERT INTO sync_runs (
        sync_id, source_id, sync_type, external_cursor, started_at, finished_at,
        status, rows_read, rows_written, rows_skipped, error_message, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(sync_id) DO UPDATE SET
        finished_at = excluded.finished_at,
        status = excluded.status,
        rows_read = excluded.rows_read,
        rows_written = excluded.rows_written,
        rows_skipped = excluded.rows_skipped,
        error_message = excluded.error_message,
        metadata_json = excluded.metadata_json
    `).run(
      runId, knownSource, String(run.syncType || 'import'), String(run.externalCursor || ''),
      String(run.startedAt || sourceTime), String(run.finishedAt || ''),
      String(run.status || 'success'), Number(run.rowsRead || 0), Number(run.rowsWritten || 0),
      Number(run.skippedRows || 0), String(run.errorMessage || ''), JSON.stringify(run.metadata || {})
    );
    if (String(run.status || 'success') === 'success') {
      this.db.prepare(`
        UPDATE data_sources SET last_success_at = ?, last_error = '', updated_at = ? WHERE source_id = ?
      `).run(String(run.finishedAt || sourceTime), sourceTime, knownSource);
    } else {
      this.db.prepare(`
        UPDATE data_sources SET last_error = ?, updated_at = ? WHERE source_id = ?
      `).run(String(run.errorMessage || 'Import fehlgeschlagen'), sourceTime, knownSource);
    }
    return { ok: true, runId };
  }
}

module.exports = { TcgDatabase, CURRENT_SCHEMA_VERSION };
