(function attachConfig(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgAppConfig = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createConfig() {
  const DEFAULT_SETTINGS = Object.freeze({
    feePercent: 5,
    packaging: 0.12,
    minProfit: 0.75,
    minRoi: 20,
    priceAgeDays: 7,
    condition: 'NM',
    languages: 'DE/EN',
    targetStock: 3,
    safetyPercent: 5,
    quickSellDiscount: 8,
    stockAgeWarningDays: 90,
    stockAgeCriticalDays: 180,
    themeMode: 'system',
    density: 'comfortable',
    startView: 'dashboard',
    hideFinancials: false,
    scannerEnabled: true,
    scannerMinConfidence: 80,
    scannerRememberMappings: true,
    scannerKeepImages: false,
    importReviewRequired: true,
    archiveOriginalImports: false,
    autoBackup: true,
    backupRetentionDays: 30,
    currency: 'EUR',
    locale: 'de-DE'
  });

  const VALID_THEMES = new Set(['system', 'light', 'dark']);
  const VALID_DENSITIES = new Set(['comfortable', 'compact']);
  const VALID_VIEWS = new Set([
    'dashboard', 'inventory', 'private', 'purchases', 'sales', 'materials',
    'expenses', 'watchlist', 'cardmarket', 'partners', 'imports', 'reports', 'settings'
  ]);

  const number = (value, fallback, minimum = 0, maximum = Number.POSITIVE_INFINITY) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(maximum, Math.max(minimum, parsed));
  };

  const boolean = (value, fallback) => {
    if (value === true || value === false) return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return fallback;
  };

  function normalizeSettings(input = {}) {
    const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const normalized = { ...DEFAULT_SETTINGS, ...source };
    normalized.feePercent = number(source.feePercent, DEFAULT_SETTINGS.feePercent, 0, 100);
    normalized.packaging = number(source.packaging, DEFAULT_SETTINGS.packaging);
    normalized.minProfit = number(source.minProfit, DEFAULT_SETTINGS.minProfit);
    normalized.minRoi = number(source.minRoi, DEFAULT_SETTINGS.minRoi);
    normalized.priceAgeDays = Math.round(number(source.priceAgeDays, DEFAULT_SETTINGS.priceAgeDays, 1, 365));
    normalized.targetStock = Math.round(number(source.targetStock, DEFAULT_SETTINGS.targetStock, 0, 100000));
    normalized.safetyPercent = number(source.safetyPercent, DEFAULT_SETTINGS.safetyPercent, 0, 50);
    normalized.quickSellDiscount = number(source.quickSellDiscount, DEFAULT_SETTINGS.quickSellDiscount, 0, 50);
    normalized.stockAgeWarningDays = Math.round(number(source.stockAgeWarningDays, DEFAULT_SETTINGS.stockAgeWarningDays, 1, 3650));
    normalized.stockAgeCriticalDays = Math.round(number(source.stockAgeCriticalDays, DEFAULT_SETTINGS.stockAgeCriticalDays, normalized.stockAgeWarningDays, 3650));
    normalized.scannerMinConfidence = Math.round(number(source.scannerMinConfidence, DEFAULT_SETTINGS.scannerMinConfidence, 0, 100));
    normalized.backupRetentionDays = Math.round(number(source.backupRetentionDays, DEFAULT_SETTINGS.backupRetentionDays, 1, 3650));
    normalized.condition = String(source.condition || DEFAULT_SETTINGS.condition).trim() || DEFAULT_SETTINGS.condition;
    normalized.languages = String(source.languages || DEFAULT_SETTINGS.languages).trim() || DEFAULT_SETTINGS.languages;
    normalized.themeMode = VALID_THEMES.has(source.themeMode) ? source.themeMode : DEFAULT_SETTINGS.themeMode;
    normalized.density = VALID_DENSITIES.has(source.density) ? source.density : DEFAULT_SETTINGS.density;
    normalized.startView = VALID_VIEWS.has(source.startView) ? source.startView : DEFAULT_SETTINGS.startView;
    normalized.hideFinancials = boolean(source.hideFinancials, DEFAULT_SETTINGS.hideFinancials);
    normalized.scannerEnabled = boolean(source.scannerEnabled, DEFAULT_SETTINGS.scannerEnabled);
    normalized.scannerRememberMappings = boolean(source.scannerRememberMappings, DEFAULT_SETTINGS.scannerRememberMappings);
    normalized.scannerKeepImages = boolean(source.scannerKeepImages, DEFAULT_SETTINGS.scannerKeepImages);
    normalized.importReviewRequired = boolean(source.importReviewRequired, DEFAULT_SETTINGS.importReviewRequired);
    normalized.archiveOriginalImports = boolean(source.archiveOriginalImports, DEFAULT_SETTINGS.archiveOriginalImports);
    normalized.autoBackup = boolean(source.autoBackup, DEFAULT_SETTINGS.autoBackup);
    normalized.currency = 'EUR';
    normalized.locale = 'de-DE';
    return normalized;
  }

  function resolveTheme(mode, systemPrefersDark = false) {
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    return systemPrefersDark ? 'dark' : 'light';
  }

  return { DEFAULT_SETTINGS, normalizeSettings, resolveTheme };
});
