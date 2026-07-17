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
