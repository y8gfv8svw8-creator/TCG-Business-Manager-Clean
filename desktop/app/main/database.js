const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const cardSearch = require('../shared/card-search');
const businessAutomation = require('../shared/business-automation');

const CURRENT_SCHEMA_VERSION = 8;

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

    const existingVersion = this.existingSchemaVersion();
    let migrationBackupPrepared = false;
    if (existingVersion !== null && existingVersion < CURRENT_SCHEMA_VERSION) {
      this.createMigrationBackup(existingVersion);
      migrationBackupPrepared = true;
    }

    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    this.db.exec(schema);
    this.runMigrations(migrationBackupPrepared);
    this.ensureDataSources();
    this.ensureSnapshotSummaries();
    this.ensureObservationSummaries();

    this.db.prepare(`
      INSERT INTO schema_version (version, applied_at)
      VALUES (?, ?)
      ON CONFLICT(version) DO NOTHING
    `).run(CURRENT_SCHEMA_VERSION, isoNow());

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
    const expected = Number(this.db.prepare(`
      SELECT COUNT(*) AS count FROM (
        SELECT source_id, observed_date FROM market_observations GROUP BY source_id, observed_date
      )
    `).get()?.count || 0);
    const existing = Number(this.db.prepare('SELECT COUNT(*) AS count FROM market_observation_summary').get()?.count || 0);
    if (expected !== existing) this.refreshObservationSummaries();
  }

  getStatus() {
    this.open();
    const stateRow = this.db.prepare('SELECT updated_at FROM app_state WHERE id = 1').get();
    const productRow = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
    const priceRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_prices').get();
    const snapshotRow = this.db.prepare('SELECT COUNT(DISTINCT captured_date) AS count FROM market_prices').get();
    const lastSnapshot = this.db.prepare('SELECT MAX(captured_date) AS date FROM market_prices').get();
    const eventRow = this.db.prepare('SELECT COUNT(*) AS count FROM business_events').get();
    const tradeLineRow = this.db.prepare('SELECT COUNT(*) AS count FROM trade_lines WHERE archived = 0').get();
    const observationRow = this.db.prepare('SELECT COUNT(*) AS count FROM market_observations').get();

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
    const previousRow = this.db.prepare('SELECT state_json FROM app_state WHERE id = 1').get();
    let previousState = null;
    if (previousRow?.state_json) {
      try {
        previousState = JSON.parse(previousRow.state_json);
      } catch {
        previousState = null;
      }
    }

    this.db.exec('BEGIN IMMEDIATE;');
    try {
      this.recordStateEvents(previousState, state, updatedAt, !previousState);
      this.materializeState(state, updatedAt);
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

    if (state?.settings?.autoBackup !== false) {
      this.createDailyBackup(json, updatedAt, state?.settings?.backupRetentionDays);
    }
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
      ['settlement', 'reconciliations']
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
    const settings = state?.settings || {};
    const inventoryById = new Map(inventory.map((row, index) => [recordId(row, index), row]));

    this.db.exec(`
      UPDATE trade_lines SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}'
      WHERE materialized_from = 'app_state' AND archived = 0;
      UPDATE trade_orders SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}'
      WHERE materialized_from = 'app_state' AND archived = 0;
      UPDATE purchase_receipt_lines SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
      UPDATE inventory_assets SET archived = 1, updated_at = '${updatedAt.replace(/'/g, "''")}' WHERE archived = 0;
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
        allocated_extra, unit_cost, allocation_method, archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(receipt_line_key) DO UPDATE SET
        purchase_id=excluded.purchase_id, order_no=excluded.order_no,
        source_row=excluded.source_row, product_id=excluded.product_id,
        ordered_quantity=excluded.ordered_quantity, business_quantity=excluded.business_quantity,
        private_quantity=excluded.private_quantity, damaged_quantity=excluded.damaged_quantity,
        cancelled_quantity=excluded.cancelled_quantity, open_quantity=excluded.open_quantity,
        unit_price=excluded.unit_price, allocated_shipping=excluded.allocated_shipping,
        allocated_extra=excluded.allocated_extra, unit_cost=excluded.unit_cost,
        allocation_method=excluded.allocation_method, archived=0,
        raw_json=excluded.raw_json, updated_at=excluded.updated_at
    `);
    const upsertAsset = this.db.prepare(`
      INSERT INTO inventory_assets (
        inventory_id, ownership, purchase_id, purchase_line_key, sale_id,
        product_id, card_name, set_name, collector_number, rarity, language,
        card_condition, acquisition_cost, acquisition_date, status, location,
        archived, raw_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      ON CONFLICT(inventory_id) DO UPDATE SET
        ownership=excluded.ownership, purchase_id=excluded.purchase_id,
        purchase_line_key=excluded.purchase_line_key, sale_id=excluded.sale_id,
        product_id=excluded.product_id, card_name=excluded.card_name,
        set_name=excluded.set_name, collector_number=excluded.collector_number,
        rarity=excluded.rarity, language=excluded.language,
        card_condition=excluded.card_condition, acquisition_cost=excluded.acquisition_cost,
        acquisition_date=excluded.acquisition_date, status=excluded.status,
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
      String(item.purchaseDate || ''), String(item.status || ''), String(item.location || ''),
      JSON.stringify(item), updatedAt
    );
    inventory.forEach((item, index) => writeAsset(item, index, 'business'));
    privateCollection.forEach((item, index) => writeAsset(item, index, 'private'));

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
            row.allocatedExtra, row.unitCost, allocationMethod, JSON.stringify(item), updatedAt
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
    if (!fs.existsSync(targetPath)) {
      const tempPath = `${targetPath}.tmp`;
      fs.writeFileSync(tempPath, json, 'utf8');
      fs.renameSync(tempPath, targetPath);
    }

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
        (SELECT COUNT(*) FROM market_observations) AS observation_count,
        (SELECT COUNT(*) FROM pricing_recommendations) AS recommendation_count,
        (SELECT COUNT(*) FROM settlement_imports) AS settlement_count,
        (SELECT COUNT(*) FROM settlement_entries WHERE match_status = 'unmatched') AS unmatched_settlement_count,
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
      marketObservationCount: Number(counts?.observation_count || 0),
      recommendationCount: Number(counts?.recommendation_count || 0),
      settlementCount: Number(counts?.settlement_count || 0),
      unmatchedSettlementCount: Number(counts?.unmatched_settlement_count || 0),
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
        }, {...settings, packaging, minProfit:0}).recommendedSell;
      };
      const latestTargets = businessAutomation.calculateAutomaticPriceTargets({
        liveOffer: latestMarket.source_id === 'cardmarket_api' ? latestMarket.low_price : null,
        low: latestMarket.low_price,
        trend: latestMarket.trend_price,
        avg1: latestMarket.avg_1,
        avg7: latestMarket.avg_7,
        avg30: latestMarket.avg_30
      }, {...settings, packaging, minProfit:0});
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
      const recommendedBuy = recommendedSell > 0 ? Math.max(0, byRoi) : 0;
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

    return { mappingsWritten, aliasesWritten, metacardsTouched: touchedMetacards.length };
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
      this.db.exec('COMMIT;');
    } catch (error) {
      this.db.exec('ROLLBACK;');
      throw error;
    }

    const snapshotDates = [...new Set(rows
      .map(row => String(row?.date || normalizedDate))
      .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)))];
    this.updateSnapshotSummaries(snapshotDates, sourceId, importTime);
    this.updateObservationSummaries(snapshotDates, sourceIds, importTime);

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
