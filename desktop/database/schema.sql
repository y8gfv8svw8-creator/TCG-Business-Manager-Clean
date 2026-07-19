PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- Vollständiger aktueller Programmstand. Diese Tabelle ermöglicht das
-- automatische Laden unabhängig vom Installations- oder Programmordner.
CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Dauerhafte Karten- und Produktstammdaten für spätere Auswertungen.
CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY,
  metacard_id TEXT,
  expansion_id TEXT,
  category_id INTEGER,
  name_de TEXT,
  name_en TEXT,
  official_name TEXT,
  set_name TEXT,
  set_code TEXT,
  rarity TEXT,
  variant TEXT,
  language TEXT,
  card_condition TEXT,
  collector_number TEXT,
  product_url TEXT,
  search_text TEXT NOT NULL DEFAULT '',
  search_compact TEXT NOT NULL DEFAULT '',
  archived INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_metacard
ON products(metacard_id);

CREATE INDEX IF NOT EXISTS idx_products_set_code
ON products(set_code);

CREATE INDEX IF NOT EXISTS idx_products_name_de
ON products(name_de);

CREATE INDEX IF NOT EXISTS idx_products_name_en
ON products(name_en);

-- Kanonische zweisprachige Namen werden je Cardmarket-Metacard gespeichert.
-- Die Produktzeilen bleiben unverändert die einzelnen Cardmarket-Druckvarianten.
CREATE TABLE IF NOT EXISTS card_name_mappings (
  metacard_id TEXT PRIMARY KEY,
  external_card_id TEXT,
  name_de TEXT,
  name_en TEXT,
  name_source TEXT NOT NULL DEFAULT '',
  source_revision TEXT NOT NULL DEFAULT '',
  match_method TEXT NOT NULL DEFAULT '',
  match_status TEXT NOT NULL DEFAULT 'pending',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_card_name_external
ON card_name_mappings(external_card_id);

CREATE INDEX IF NOT EXISTS idx_card_name_de
ON card_name_mappings(name_de);

CREATE INDEX IF NOT EXISTS idx_card_name_en
ON card_name_mappings(name_en);

CREATE TABLE IF NOT EXISTS card_aliases (
  metacard_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK(language IN ('de', 'en')),
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  compact_alias TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  PRIMARY KEY(metacard_id, language, normalized_alias),
  FOREIGN KEY(metacard_id) REFERENCES card_name_mappings(metacard_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_card_alias_normalized
ON card_aliases(normalized_alias);

CREATE INDEX IF NOT EXISTS idx_card_alias_compact
ON card_aliases(compact_alias);

CREATE INDEX IF NOT EXISTS idx_card_alias_metacard
ON card_aliases(metacard_id);

CREATE TABLE IF NOT EXISTS card_search_index (
  metacard_id TEXT PRIMARY KEY,
  search_text TEXT NOT NULL DEFAULT '',
  search_compact TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL,
  FOREIGN KEY(metacard_id) REFERENCES card_name_mappings(metacard_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS card_name_sync_status (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  source TEXT NOT NULL DEFAULT '',
  source_revision TEXT NOT NULL DEFAULT '',
  imported_at TEXT NOT NULL DEFAULT '',
  english_name_count INTEGER NOT NULL DEFAULT 0,
  german_name_count INTEGER NOT NULL DEFAULT 0,
  mapped_metacard_count INTEGER NOT NULL DEFAULT 0,
  german_metacard_count INTEGER NOT NULL DEFAULT 0,
  alias_count INTEGER NOT NULL DEFAULT 0,
  unmatched_metacard_count INTEGER NOT NULL DEFAULT 0,
  ambiguous_metacard_count INTEGER NOT NULL DEFAULT 0
);

-- Ein Datensatz pro Karte und Tag. Dadurch kann die Anwendung später echte
-- 7-/30-/90-/365-Tage-Verläufe und Kaufbewertungen berechnen.
CREATE TABLE IF NOT EXISTS market_prices (
  product_id TEXT NOT NULL,
  captured_date TEXT NOT NULL,
  category_id INTEGER,
  avg_price REAL,
  low_price REAL,
  trend_price REAL,
  avg_1 REAL,
  avg_7 REAL,
  avg_30 REAL,
  avg_foil REAL,
  low_foil REAL,
  trend_foil REAL,
  avg_1_foil REAL,
  avg_7_foil REAL,
  avg_30_foil REAL,
  source_id TEXT NOT NULL,
  source_type TEXT,
  data_quality TEXT,
  collected_at TEXT,
  imported_at TEXT NOT NULL,
  PRIMARY KEY(product_id, captured_date)
);

CREATE INDEX IF NOT EXISTS idx_market_prices_date
ON market_prices(captured_date);

CREATE INDEX IF NOT EXISTS idx_market_prices_product_date
ON market_prices(product_id, captured_date DESC);

CREATE INDEX IF NOT EXISTS idx_market_prices_trend
ON market_prices(captured_date, trend_price);

-- Zusammenfassung je Preisstand. Dient der schnellen Anzeige von Historien-
-- abdeckung und der späteren Qualitätskontrolle von Importen.
CREATE TABLE IF NOT EXISTS market_snapshot_summary (
  captured_date TEXT PRIMARY KEY,
  row_count INTEGER NOT NULL DEFAULT 0,
  source_id TEXT,
  first_imported_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshot_summary_updated
ON market_snapshot_summary(updated_at DESC);

CREATE TABLE IF NOT EXISTS import_runs (
  run_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  snapshot_date TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  rows_read INTEGER NOT NULL DEFAULT 0,
  rows_written INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);

-- Reservierte Tabellen für später verfügbare Angebots- und Analysewerte.
CREATE TABLE IF NOT EXISTS market_liquidity (
  product_id TEXT NOT NULL,
  captured_date TEXT NOT NULL,
  offer_count INTEGER,
  seller_count INTEGER,
  de_offer_count INTEGER,
  eu_offer_count INTEGER,
  source_id TEXT,
  imported_at TEXT NOT NULL,
  PRIMARY KEY(product_id, captured_date)
);

CREATE TABLE IF NOT EXISTS analysis_metrics (
  product_id TEXT NOT NULL,
  calculated_date TEXT NOT NULL,
  price_score REAL,
  liquidity_score REAL,
  history_score REAL,
  risk_score REAL,
  profit_score REAL,
  total_score REAL,
  recommendation TEXT,
  explanation_json TEXT,
  calculated_at TEXT NOT NULL,
  PRIMARY KEY(product_id, calculated_date)
);

-- Datenquellen werden getrennt verwaltet. Zugangsdaten werden bewusst nicht
-- in SQLite gespeichert; die API-Zeile beschreibt nur die spaetere Anbindung.
CREATE TABLE IF NOT EXISTS data_sources (
  source_id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  read_only INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 100,
  base_url TEXT NOT NULL DEFAULT '',
  config_json TEXT NOT NULL DEFAULT '{}',
  last_success_at TEXT NOT NULL DEFAULT '',
  last_error TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_runs (
  sync_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  sync_type TEXT NOT NULL,
  external_cursor TEXT NOT NULL DEFAULT '',
  started_at TEXT NOT NULL,
  finished_at TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  rows_read INTEGER NOT NULL DEFAULT 0,
  rows_written INTEGER NOT NULL DEFAULT 0,
  rows_skipped INTEGER NOT NULL DEFAULT 0,
  error_message TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY(source_id) REFERENCES data_sources(source_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source_started
ON sync_runs(source_id, started_at DESC);

CREATE TABLE IF NOT EXISTS external_entity_links (
  source_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  external_id TEXT NOT NULL,
  local_entity_type TEXT NOT NULL,
  local_entity_id TEXT NOT NULL,
  external_updated_at TEXT NOT NULL DEFAULT '',
  payload_hash TEXT NOT NULL DEFAULT '',
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY(source_id, entity_type, external_id),
  FOREIGN KEY(source_id) REFERENCES data_sources(source_id)
);

-- Append-only Audit-Log aller Einkaufs-, Verkaufs- und Bestandsaenderungen.
CREATE TABLE IF NOT EXISTS business_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source_id TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  changed_fields_json TEXT NOT NULL DEFAULT '[]',
  state_saved_at TEXT NOT NULL,
  FOREIGN KEY(source_id) REFERENCES data_sources(source_id)
);

CREATE INDEX IF NOT EXISTS idx_business_events_entity
ON business_events(entity_type, entity_id, event_id DESC);

CREATE INDEX IF NOT EXISTS idx_business_events_occurred
ON business_events(occurred_at DESC);

-- Abfragbare, normalisierte Sicht auf den aktuellen Handelsstand. Entfernte
-- Datensaetze bleiben archiviert; ihre komplette Geschichte steht im Audit-Log.
CREATE TABLE IF NOT EXISTS trade_orders (
  order_key TEXT PRIMARY KEY,
  trade_type TEXT NOT NULL,
  local_order_id TEXT NOT NULL,
  origin_source_id TEXT NOT NULL,
  materialized_from TEXT NOT NULL DEFAULT 'app_state',
  external_order_id TEXT NOT NULL DEFAULT '',
  order_no TEXT NOT NULL DEFAULT '',
  transaction_date TEXT NOT NULL DEFAULT '',
  partner TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  card_value REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  extra REAL NOT NULL DEFAULT 0,
  fees REAL NOT NULL DEFAULT 0,
  postage REAL NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  revenue REAL NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(origin_source_id) REFERENCES data_sources(source_id)
);

CREATE INDEX IF NOT EXISTS idx_trade_orders_type_date
ON trade_orders(trade_type, transaction_date DESC, archived);

CREATE TABLE IF NOT EXISTS trade_lines (
  line_key TEXT PRIMARY KEY,
  order_key TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  local_order_id TEXT NOT NULL,
  origin_source_id TEXT NOT NULL,
  materialized_from TEXT NOT NULL DEFAULT 'app_state',
  external_article_id TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  metacard_id TEXT NOT NULL DEFAULT '',
  card_name TEXT NOT NULL DEFAULT '',
  set_name TEXT NOT NULL DEFAULT '',
  rarity TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT '',
  card_condition TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  allocated_shipping REAL NOT NULL DEFAULT 0,
  allocated_extra REAL NOT NULL DEFAULT 0,
  unit_cost REAL NOT NULL DEFAULT 0,
  unit_net REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '',
  transaction_date TEXT NOT NULL DEFAULT '',
  archived INTEGER NOT NULL DEFAULT 0,
  raw_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(order_key) REFERENCES trade_orders(order_key),
  FOREIGN KEY(origin_source_id) REFERENCES data_sources(source_id)
);

CREATE INDEX IF NOT EXISTS idx_trade_lines_product_type
ON trade_lines(product_id, trade_type, transaction_date DESC, archived);

CREATE INDEX IF NOT EXISTS idx_trade_lines_order
ON trade_lines(order_key, archived);

-- Quellengetrennte Marktbeobachtungen. Anders als die bisherige
-- Kompatibilitaetstabelle koennen mehrere Quellen am selben Tag nebeneinander
-- bestehen und spaeter gemeinsam fuer Empfehlungen genutzt werden.
CREATE TABLE IF NOT EXISTS market_observations (
  observation_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  observed_date TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_record_key TEXT NOT NULL,
  category_id INTEGER,
  avg_price REAL,
  low_price REAL,
  trend_price REAL,
  avg_1 REAL,
  avg_7 REAL,
  avg_30 REAL,
  avg_foil REAL,
  low_foil REAL,
  trend_foil REAL,
  avg_1_foil REAL,
  avg_7_foil REAL,
  avg_30_foil REAL,
  data_quality TEXT NOT NULL DEFAULT '',
  imported_at TEXT NOT NULL,
  raw_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(source_id, source_record_key),
  FOREIGN KEY(source_id) REFERENCES data_sources(source_id)
);

CREATE INDEX IF NOT EXISTS idx_market_observations_product_date
ON market_observations(product_id, observed_date DESC, source_id);

CREATE INDEX IF NOT EXISTS idx_market_observations_source_date
ON market_observations(source_id, observed_date DESC);

CREATE TABLE IF NOT EXISTS market_observation_summary (
  source_id TEXT NOT NULL,
  observed_date TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  first_imported_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(source_id, observed_date),
  FOREIGN KEY(source_id) REFERENCES data_sources(source_id)
);

CREATE TABLE IF NOT EXISTS pricing_recommendations (
  product_id TEXT PRIMARY KEY,
  calculated_at TEXT NOT NULL,
  recommended_buy REAL,
  recommended_sell REAL,
  own_buy_average REAL,
  own_sell_average REAL,
  market_reference REAL,
  buy_sample_count INTEGER NOT NULL DEFAULT 0,
  sell_sample_count INTEGER NOT NULL DEFAULT 0,
  market_sample_count INTEGER NOT NULL DEFAULT 0,
  confidence_score REAL NOT NULL DEFAULT 0,
  confidence_level TEXT NOT NULL DEFAULT 'low',
  explanation_json TEXT NOT NULL DEFAULT '[]'
);
