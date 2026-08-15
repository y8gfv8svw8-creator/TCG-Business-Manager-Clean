(function attachConfig(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgAppConfig = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createConfig() {
  const DEFAULT_SETTINGS = Object.freeze({
    feePercent: 5,
    packaging: 0.12,
    minProfit: 0,
    minRoi: 25,
    targetRoi: 30,
    expectedCardsPerOrder: 3,
    pricingModelVersion: 'market-roi-v2-minprofit',
    priceAgeDays: 7,
    condition: 'NM',
    languages: 'DE/EN',
    targetStock: 3,
    saleAllocationStrategy: 'fifo',
    safetyPercent: 5,
    quickSellDiscount: 8,
    stockAgeWarningDays: 90,
    stockAgeCriticalDays: 180,
    priceGroupAFrom: 5,
    priceGroupBFrom: 1,
    priceGroupCFrom: 0.20,
    agingFreshMaxDays: 14,
    agingObserveMaxDays: 30,
    agingReviewMaxDays: 45,
    agingCapitalMaxDays: 60,
    agingSlowMaxDays: 90,
    marketTrendStablePercent: 3,
    marketTrendDirectionalPercent: 6,
    marketTrendStrongPercent: 15,
    marketPriceNearPercent: 5,
    marketPriceFarPercent: 20,
    marketHistoryMinPoints: 3,
    marketHistoryMaxGapDays: 7,
    collectionClassAFrom: 10,
    collectionClassBFrom: 5,
    collectionClassCFrom: 1,
    collectionClassDFrom: 0.20,
    collectionFactorA: 60,
    collectionFactorB: 47.5,
    collectionFactorC: 32.5,
    collectionFactorD: 15,
    collectionBulkPerCard: 0.01,
    collectionFirstOfferPercent: 75,
    collectionEconomicRelevance: 3,
    collectionMinimumSafetyPercent: 5,
    collectionUnknownConditionRiskPercent: 8,
    collectionLikelyPrintRiskPercent: 7,
    collectionUnknownPrintRiskPercent: 20,
    collectionFallingMarketRiskPercent: 7,
    collectionStrongFallingRiskPercent: 12,
    collectionWeakDataRiskPercent: 5,
    collectionHighQuantityDiscountPercent: 8,
    collectionHighQuantityFrom: 5,
    collectionLowValueEffortPercent: 5,
    collectionConcentrationThresholdPercent: 75,
    collectionCapitalMediumPercent: 25,
    collectionCapitalHighPercent: 50,
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
    'expenses', 'capital', 'slowmovers', 'watchlist', 'buying', 'collectionpurchases', 'salesanalysis', 'cardmarket', 'partners', 'imports', 'reports', 'settings'
  ]);
  const VALID_ALLOCATION_STRATEGIES = new Set(['fifo', 'lowest-cost', 'highest-cost', 'manual']);

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
    normalized.targetRoi = Math.max(normalized.minRoi, number(source.targetRoi, DEFAULT_SETTINGS.targetRoi, 0, 10000));
    normalized.expectedCardsPerOrder = number(source.expectedCardsPerOrder, DEFAULT_SETTINGS.expectedCardsPerOrder, 1, 10000);
    normalized.pricingModelVersion = String(source.pricingModelVersion || DEFAULT_SETTINGS.pricingModelVersion);
    normalized.priceAgeDays = Math.round(number(source.priceAgeDays, DEFAULT_SETTINGS.priceAgeDays, 1, 365));
    normalized.targetStock = Math.round(number(source.targetStock, DEFAULT_SETTINGS.targetStock, 0, 100000));
    normalized.saleAllocationStrategy = VALID_ALLOCATION_STRATEGIES.has(source.saleAllocationStrategy) ? source.saleAllocationStrategy : DEFAULT_SETTINGS.saleAllocationStrategy;
    normalized.safetyPercent = number(source.safetyPercent, DEFAULT_SETTINGS.safetyPercent, 0, 50);
    normalized.quickSellDiscount = number(source.quickSellDiscount, DEFAULT_SETTINGS.quickSellDiscount, 0, 50);
    normalized.stockAgeWarningDays = Math.round(number(source.stockAgeWarningDays, DEFAULT_SETTINGS.stockAgeWarningDays, 1, 3650));
    normalized.stockAgeCriticalDays = Math.round(number(source.stockAgeCriticalDays, DEFAULT_SETTINGS.stockAgeCriticalDays, normalized.stockAgeWarningDays, 3650));
    normalized.priceGroupCFrom = number(source.priceGroupCFrom, DEFAULT_SETTINGS.priceGroupCFrom, 0, 1000000);
    normalized.priceGroupBFrom = Math.max(normalized.priceGroupCFrom + 0.01, number(source.priceGroupBFrom, DEFAULT_SETTINGS.priceGroupBFrom, 0, 1000000));
    normalized.priceGroupAFrom = Math.max(normalized.priceGroupBFrom + 0.01, number(source.priceGroupAFrom, DEFAULT_SETTINGS.priceGroupAFrom, 0, 1000000));
    normalized.agingFreshMaxDays = Math.round(number(source.agingFreshMaxDays, DEFAULT_SETTINGS.agingFreshMaxDays, 0, 3650));
    normalized.agingObserveMaxDays = Math.round(Math.max(normalized.agingFreshMaxDays + 1, number(source.agingObserveMaxDays, DEFAULT_SETTINGS.agingObserveMaxDays, 1, 3650)));
    normalized.agingReviewMaxDays = Math.round(Math.max(normalized.agingObserveMaxDays + 1, number(source.agingReviewMaxDays, DEFAULT_SETTINGS.agingReviewMaxDays, 2, 3650)));
    normalized.agingCapitalMaxDays = Math.round(Math.max(normalized.agingReviewMaxDays + 1, number(source.agingCapitalMaxDays, DEFAULT_SETTINGS.agingCapitalMaxDays, 3, 3650)));
    normalized.agingSlowMaxDays = Math.round(Math.max(normalized.agingCapitalMaxDays + 1, number(source.agingSlowMaxDays, DEFAULT_SETTINGS.agingSlowMaxDays, 4, 3650)));
    normalized.marketTrendStablePercent = number(source.marketTrendStablePercent, DEFAULT_SETTINGS.marketTrendStablePercent, 0, 100);
    normalized.marketTrendDirectionalPercent = Math.max(normalized.marketTrendStablePercent, number(source.marketTrendDirectionalPercent, DEFAULT_SETTINGS.marketTrendDirectionalPercent, 0, 500));
    normalized.marketTrendStrongPercent = Math.max(normalized.marketTrendDirectionalPercent, number(source.marketTrendStrongPercent, DEFAULT_SETTINGS.marketTrendStrongPercent, 0, 1000));
    normalized.marketPriceNearPercent = number(source.marketPriceNearPercent, DEFAULT_SETTINGS.marketPriceNearPercent, 0, 100);
    normalized.marketPriceFarPercent = Math.max(normalized.marketPriceNearPercent, number(source.marketPriceFarPercent, DEFAULT_SETTINGS.marketPriceFarPercent, 0, 1000));
    normalized.marketHistoryMinPoints = Math.round(number(source.marketHistoryMinPoints, DEFAULT_SETTINGS.marketHistoryMinPoints, 2, 3650));
    normalized.marketHistoryMaxGapDays = Math.round(number(source.marketHistoryMaxGapDays, DEFAULT_SETTINGS.marketHistoryMaxGapDays, 0, 365));
    normalized.collectionClassDFrom = number(source.collectionClassDFrom, DEFAULT_SETTINGS.collectionClassDFrom, 0, 1000000);
    normalized.collectionClassCFrom = Math.max(normalized.collectionClassDFrom + 0.01, number(source.collectionClassCFrom, DEFAULT_SETTINGS.collectionClassCFrom, 0, 1000000));
    normalized.collectionClassBFrom = Math.max(normalized.collectionClassCFrom + 0.01, number(source.collectionClassBFrom, DEFAULT_SETTINGS.collectionClassBFrom, 0, 1000000));
    normalized.collectionClassAFrom = Math.max(normalized.collectionClassBFrom + 0.01, number(source.collectionClassAFrom, DEFAULT_SETTINGS.collectionClassAFrom, 0, 1000000));
    normalized.collectionFactorA = number(source.collectionFactorA, DEFAULT_SETTINGS.collectionFactorA, 55, 65);
    normalized.collectionFactorB = number(source.collectionFactorB, DEFAULT_SETTINGS.collectionFactorB, 40, 55);
    normalized.collectionFactorC = number(source.collectionFactorC, DEFAULT_SETTINGS.collectionFactorC, 25, 40);
    normalized.collectionFactorD = number(source.collectionFactorD, DEFAULT_SETTINGS.collectionFactorD, 10, 20);
    normalized.collectionBulkPerCard = number(source.collectionBulkPerCard, DEFAULT_SETTINGS.collectionBulkPerCard, 0, 1);
    normalized.collectionFirstOfferPercent = number(source.collectionFirstOfferPercent, DEFAULT_SETTINGS.collectionFirstOfferPercent, 25, 100);
    normalized.collectionEconomicRelevance = number(source.collectionEconomicRelevance, DEFAULT_SETTINGS.collectionEconomicRelevance, 0, 1000000);
    normalized.collectionMinimumSafetyPercent = number(source.collectionMinimumSafetyPercent, DEFAULT_SETTINGS.collectionMinimumSafetyPercent, 1, 50);
    normalized.collectionUnknownConditionRiskPercent = number(source.collectionUnknownConditionRiskPercent, DEFAULT_SETTINGS.collectionUnknownConditionRiskPercent, 0, 50);
    normalized.collectionLikelyPrintRiskPercent = number(source.collectionLikelyPrintRiskPercent, DEFAULT_SETTINGS.collectionLikelyPrintRiskPercent, 0, 50);
    normalized.collectionUnknownPrintRiskPercent = number(source.collectionUnknownPrintRiskPercent, DEFAULT_SETTINGS.collectionUnknownPrintRiskPercent, 0, 80);
    normalized.collectionFallingMarketRiskPercent = number(source.collectionFallingMarketRiskPercent, DEFAULT_SETTINGS.collectionFallingMarketRiskPercent, 0, 50);
    normalized.collectionStrongFallingRiskPercent = Math.max(normalized.collectionFallingMarketRiskPercent, number(source.collectionStrongFallingRiskPercent, DEFAULT_SETTINGS.collectionStrongFallingRiskPercent, 0, 80));
    normalized.collectionWeakDataRiskPercent = number(source.collectionWeakDataRiskPercent, DEFAULT_SETTINGS.collectionWeakDataRiskPercent, 0, 50);
    normalized.collectionHighQuantityDiscountPercent = number(source.collectionHighQuantityDiscountPercent, DEFAULT_SETTINGS.collectionHighQuantityDiscountPercent, 0, 50);
    normalized.collectionHighQuantityFrom = Math.round(number(source.collectionHighQuantityFrom, DEFAULT_SETTINGS.collectionHighQuantityFrom, 2, 100000));
    normalized.collectionLowValueEffortPercent = number(source.collectionLowValueEffortPercent, DEFAULT_SETTINGS.collectionLowValueEffortPercent, 0, 50);
    normalized.collectionConcentrationThresholdPercent = number(source.collectionConcentrationThresholdPercent, DEFAULT_SETTINGS.collectionConcentrationThresholdPercent, 25, 100);
    normalized.collectionCapitalMediumPercent = number(source.collectionCapitalMediumPercent, DEFAULT_SETTINGS.collectionCapitalMediumPercent, 1, 99);
    normalized.collectionCapitalHighPercent = Math.max(normalized.collectionCapitalMediumPercent, number(source.collectionCapitalHighPercent, DEFAULT_SETTINGS.collectionCapitalHighPercent, 1, 100));
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
