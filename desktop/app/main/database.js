const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const cardSearch = require('../shared/card-search');

const CURRENT_SCHEMA_VERSION = 4;

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

    const existingVersion = this.existingSchemaVersion();
    let migrationBackupPrepared = false;
    if (existingVersion !== null && existingVersion < CURRENT_SCHEMA_VERSION) {
      this.createMigrationBackup(existingVersion);
      migrationBackupPrepared = true;
    }

    const schema = fs.readFileSync(this.schemaPath, 'utf8');
    this.db.exec(schema);
    this.runMigrations(migrationBackupPrepared);
    this.ensureSnapshotSummaries();

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
    const forms = cardSearch.queryForms(String(query || '').slice(0, 200));
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

    const nameMatches = new Set(nameRows.map(row => String(row.metacardId || '')).filter(Boolean));
    const metacardIds = [...new Set([...nameMatches, ...productRows.map(row => String(row.metacardId || '')).filter(Boolean)])];
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
      for (const variant of variants) variantsByMetacard.get(String(variant.metacardId))?.push(variant);
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
