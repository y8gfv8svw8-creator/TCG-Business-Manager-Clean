(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgBusinessAutomation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const asNumber = value => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeField = value => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toLowerCase();

  const normalizeCollectorNumber = value => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    // Die Sprachkennung einer Setnummer ist keine eigene Druckvariante.
    // RA01-DE008 und RA01-EN008 beschreiben deshalb dieselbe Kartennummer.
    .replace(/(DE|EN|FR|IT|ES|PT)(?=\d{2,4}$)/, '');

  const comparableNames = record => {
    const names = [record?.name, record?.germanName, record?.englishName,
      record?.officialName, record?.officialBaseName]
      .map(value => normalizeField(String(value || '').replace(/\(\s*V\.?\s*\d+[^)]*\)\s*$/i, '')))
      .filter(Boolean);
    return [...new Set(names)];
  };

  function inspectCardAssignment(record = {}, catalogEntry = null, options = {}) {
    const issues = [];
    const productId = String(record.productId ?? '').match(/\d+/)?.[0] || '';
    const add = (code, severity, label) => {
      if (!issues.some(issue => issue.code === code)) issues.push({ code, severity, label });
    };
    if (!productId) add('missing-id', 'warning', 'Cardmarket-ID fehlt');

    const set = String(record.set || record.setName || '').trim();
    const collectorNumber = String(record.collectorNumber || record.setCode || '').trim();
    const rarity = String(record.rarity || record.version || record.variant || '').trim();
    if (!set) add('missing-set', 'warning', 'Set fehlt');
    if (!collectorNumber) add('missing-number', 'warning', 'Setnummer fehlt');
    if (!rarity) add('missing-rarity', 'warning', 'Seltenheit fehlt');

    if (productId && !catalogEntry) {
      if (options.catalogReady !== false) add('unknown-id', 'info', 'ID ist im aktuellen Katalog nicht prüfbar');
      return { productId, issues, needsReview: issues.length > 0 };
    }
    if (!catalogEntry) return { productId, issues, needsReview: issues.length > 0 };

    const recordNumbers = [record.collectorNumber, record.setCode].map(normalizeCollectorNumber).filter(Boolean);
    const catalogNumbers = [catalogEntry.collectorNumber, catalogEntry.setCode].map(normalizeCollectorNumber).filter(Boolean);
    if (recordNumbers.length && catalogNumbers.length && !recordNumbers.some(value => catalogNumbers.includes(value))) {
      add('number-conflict', 'danger', 'Setnummer passt nicht zur Cardmarket-ID');
    }

    const recordSets = [record.set, record.setName].map(normalizeField).filter(Boolean);
    const catalogSets = [catalogEntry.set, catalogEntry.setName].map(normalizeField).filter(Boolean);
    if (recordSets.length && catalogSets.length && !recordSets.some(value => catalogSets.includes(value))) {
      add('set-conflict', 'danger', 'Set passt nicht zur Cardmarket-ID');
    }

    const recordRarities = [record.rarity, record.version, record.variant].map(normalizeField).filter(Boolean);
    const catalogRarities = [catalogEntry.rarity, catalogEntry.version, catalogEntry.variant].map(normalizeField).filter(Boolean);
    const rarityMatches = recordRarities.some(left => catalogRarities.some(right => left === right || left.includes(right) || right.includes(left)));
    if (recordRarities.length && catalogRarities.length && !rarityMatches) {
      add('rarity-conflict', 'danger', 'Seltenheit passt nicht zur Cardmarket-ID');
    }

    const recordNames = comparableNames(record);
    const catalogNames = comparableNames(catalogEntry);
    const nameMatches = recordNames.some(left => catalogNames.some(right => left === right));
    // Namen sind wegen deutscher/englischer Übersetzungen nur dann ein starkes
    // Konfliktsignal, wenn der Katalog beide Sprachen kennt oder keine weiteren
    // Druckdaten für einen sicheren Vergleich vorhanden sind.
    const catalogHasBilingualNames = Boolean(catalogEntry.germanName && catalogEntry.englishName);
    const hasStrongPrintComparison = recordNumbers.length && catalogNumbers.length;
    if (recordNames.length && catalogNames.length && !nameMatches && (catalogHasBilingualNames || !hasStrongPrintComparison)) {
      add('name-conflict', 'danger', 'Kartenname passt nicht zur Cardmarket-ID');
    }
    return { productId, issues, needsReview: issues.length > 0 };
  }

  const normalizedRow = row => Object.fromEntries(
    Object.entries(row || {}).map(([key, value]) => [normalizeField(key), value])
  );

  const pick = (row, names) => {
    const normalized = normalizedRow(row);
    for (const name of names) {
      const value = normalized[normalizeField(name)];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return '';
  };

  function detectCsvImportType(fileName, headers = []) {
    const name = String(fileName || '').toLowerCase();
    const keys = new Set(headers.map(normalizeField));
    const has = (...names) => names.some(key => keys.has(normalizeField(key)));
    if (has('articleId') && has('price_eur') && has('amount')) return 'inventory';
    if (has('groupCount') && has('price') && has('idProduct')) return 'purchase';
    if (has('trendPrice', 'avg30', 'avg7', 'avg1') && has('idProduct', 'productId')) return 'prices';
    if ((has('orderNo', 'orderId', 'bestellnummer', 'idOrder') && has('amount', 'betrag', 'credit', 'gutschrift', 'payout', 'auszahlung', 'balance')) ||
        /settlement|statement|account|transactions|abrechnung|konto|gutschrift/.test(name)) return 'settlement';
    if (has('orderNo') && has('customer') && has('revenue')) return 'saleGeneric';
    if (has('orderNo') && has('seller') && has('cardValue')) return 'purchaseGeneric';
    if (has('priority') && has('targetSell')) return 'watchlistGeneric';
    if (has('listingPrice') && has('name')) return 'inventoryGeneric';
    if (has('packagingQuality', 'shippingSpeed', 'conditionAccuracy')) return 'sellerGeneric';
    if (has('preferredShipping', 'trackingRequired')) return 'customerGeneric';
    if (/seller|haendler|händler/.test(name)) return 'sellerGeneric';
    if (/customer|kunde/.test(name)) return 'customerGeneric';
    if (name.includes('watch')) return 'watchlistGeneric';
    if (/sale|verkauf/.test(name)) return 'sale';
    return 'unknown';
  }

  function calculateSaleProfit(sale = {}, settings = {}) {
    const gross = asNumber(sale.revenue);
    const refund = Math.max(0, asNumber(sale.refund));
    const shippingPaid = asNumber(sale.shippingPaid);
    const cardValue = asNumber(sale.cardValue) || Math.max(0, gross - shippingPaid);
    const fee = sale.fee !== undefined && sale.fee !== ''
      ? asNumber(sale.fee)
      : cardValue * asNumber(settings.feePercent) / 100;
    const materialUsageCost = Array.isArray(sale.materialUsage) && sale.materialUsage.length
      ? sale.materialUsage.reduce((sum, row) => sum + Math.max(0, asNumber(row.quantity)) * Math.max(0, asNumber(row.unitCost)), 0)
      : null;
    const hasManualPackaging = (sale.material !== undefined && sale.material !== '') ||
      (sale.packaging !== undefined && sale.packaging !== '');
    const packaging = materialUsageCost !== null
      ? materialUsageCost
      : hasManualPackaging
        ? asNumber(sale.material !== undefined && sale.material !== '' ? sale.material : sale.packaging)
        : Math.max(0, asNumber(settings.packaging));
    const postage = asNumber(sale.postage);
    const returnedToInventory = String(sale.status || '') === 'Rückgabe eingetroffen';
    const historicalCostStatus = String(sale.historicalCostStatus || '').trim().toLowerCase();
    const cost = returnedToInventory ? 0 : asNumber(sale.cost);
    const costKnown = returnedToInventory || ['confirmed', 'linked'].includes(historicalCostStatus) || cost > 0;
    const netRevenue = gross - refund;
    const sourceQuality = {
      fee: sale.fee !== undefined && sale.fee !== '' ? 'exact' : 'estimated',
      packaging: materialUsageCost !== null ? 'exact' : hasManualPackaging ? 'manual' : 'estimated',
      postage: sale.postage !== undefined && sale.postage !== '' ? 'exact' : 'missing',
      cost: returnedToInventory ? 'exact'
        : historicalCostStatus === 'unknown' ? 'unknown'
        : historicalCostStatus === 'confirmed' ? 'manual'
          : costKnown ? 'exact' : 'missing'
    };
    const quality = Object.values(sourceQuality).includes('unknown')
      ? 'unknown'
      : Object.values(sourceQuality).includes('missing')
      ? 'incomplete'
      : Object.values(sourceQuality).includes('estimated') ? 'estimated' : 'exact';
    return {
      gross, refund, netRevenue, cardValue, fee, packaging, postage, cost,
      profit: netRevenue - fee - packaging - postage - cost,
      costKnown, profitKnown: returnedToInventory || (costKnown && historicalCostStatus !== 'unknown'),
      historicalCostStatus, sourceQuality, quality
    };
  }

  const optionalNumber = value => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const normalized = String(value)
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const roundMoney = value => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const floorMoney = value => Math.max(0, Math.floor((Number(value) + Number.EPSILON) * 100) / 100);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, asNumber(value)));
  const median = values => {
    const sorted = (values || []).filter(value => value !== null && Number.isFinite(Number(value)) && Number(value) > 0).map(Number).sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  const SALES_DATA_QUALITY_THRESHOLDS = Object.freeze({ sufficient: 5 });
  const OWN_TURNOVER_THRESHOLDS = Object.freeze({ veryFast: 7, fast: 21, normal: 45, slow: 90 });

  const finiteValues = values => (values || [])
    .map(value => optionalNumber(value))
    .filter(value => value !== null);

  const averageValue = values => {
    const rows = finiteValues(values);
    return rows.length ? rows.reduce((sum, value) => sum + value, 0) / rows.length : null;
  };

  const medianValue = values => {
    const rows = finiteValues(values).sort((left, right) => left - right);
    if (!rows.length) return null;
    const middle = Math.floor(rows.length / 2);
    return rows.length % 2 ? rows[middle] : (rows[middle - 1] + rows[middle]) / 2;
  };

  function ownSalesDataQuality(saleCount = 0) {
    const count = Math.max(0, Math.round(asNumber(saleCount)));
    if (count === 0) return { key: 'none', label: 'KEINE DATEN', sufficient: false };
    if (count === 1) return { key: 'very-low', label: 'SEHR GERINGE DATENBASIS', sufficient: false };
    if (count === 2) return { key: 'low', label: 'GERINGE DATENBASIS', sufficient: false };
    if (count < SALES_DATA_QUALITY_THRESHOLDS.sufficient) return { key: 'restricted', label: 'EINGESCHRÄNKTE DATENBASIS', sufficient: false };
    return { key: 'sufficient', label: 'AUSREICHENDE EIGENE DATEN', sufficient: true };
  }

  function ownTurnoverClass(medianDays, saleCount = 0) {
    const days = optionalNumber(medianDays);
    const quality = ownSalesDataQuality(saleCount);
    if (days === null) return { key: 'unknown', label: 'NICHT BEWERTBAR', displayLabel: 'NICHT BEWERTBAR', sufficient: quality.sufficient };
    const key = days <= OWN_TURNOVER_THRESHOLDS.veryFast ? 'very-fast'
      : days <= OWN_TURNOVER_THRESHOLDS.fast ? 'fast'
        : days <= OWN_TURNOVER_THRESHOLDS.normal ? 'normal'
          : days <= OWN_TURNOVER_THRESHOLDS.slow ? 'slow' : 'very-slow';
    const labels = { 'very-fast': 'SEHR SCHNELL', fast: 'SCHNELL', normal: 'NORMAL', slow: 'LANGSAM', 'very-slow': 'SEHR LANGSAM' };
    return {
      key,
      label: labels[key],
      displayLabel: quality.sufficient ? labels[key] : `Tendenz: ${labels[key].toLocaleLowerCase('de-DE')} – ${quality.label.toLocaleLowerCase('de-DE')}`,
      sufficient: quality.sufficient
    };
  }

  function decisionCostBreakdown(input = {}) {
    const cardPrice = optionalNumber(input.cardPrice);
    const fullCost = optionalNumber(input.fullCost);
    const cartFiller = input.cartFiller === true || input.cartFiller === 'yes' ? true
      : input.cartFiller === false || input.cartFiller === 'no' ? false : null;
    const status = String(input.decisionCostStatus || '').toLowerCase();
    const shippingInput = optionalNumber(input.incrementalShippingCost);
    const directInput = optionalNumber(input.incrementalDirectCost);
    const confirmed = status === 'known' || (cartFiller !== null && shippingInput !== null && directInput !== null);
    const incrementalShipping = confirmed ? Math.max(0, shippingInput ?? 0) : null;
    const incrementalDirect = confirmed ? Math.max(0, directInput ?? 0) : null;
    const decisionCost = confirmed && cardPrice !== null
      ? roundMoney(Math.max(0, cardPrice) + incrementalShipping + incrementalDirect)
      : null;
    return {
      cardPrice: cardPrice === null ? null : roundMoney(Math.max(0, cardPrice)),
      fullCost: fullCost === null ? null : roundMoney(Math.max(0, fullCost)),
      cartFiller,
      incrementalShipping: incrementalShipping === null ? null : roundMoney(incrementalShipping),
      incrementalDirect: incrementalDirect === null ? null : roundMoney(incrementalDirect),
      decisionCost,
      status: decisionCost === null ? 'unknown' : 'known'
    };
  }

  function planTargetSellChange(item = {}, nextValue, changedAt = new Date().toISOString(), mode = 'manual') {
    const next = optionalNumber(nextValue);
    const current = optionalNumber(item.targetSell ?? item.originalTargetSell);
    const original = optionalNumber(item.originalTargetSell);
    if (current === next) return { changed: false, originalTargetSell: original, targetSell: current, historyEntry: null };
    const firstConfirmation = original === null && next !== null;
    return {
      changed: true,
      originalTargetSell: firstConfirmation ? roundMoney(Math.max(0, next)) : original,
      targetSell: next === null ? null : roundMoney(Math.max(0, next)),
      historyEntry: {
        eventType: 'original_target',
        changedAt: String(changedAt),
        oldPrice: current,
        newPrice: next,
        changeMode: mode,
        reason: firstConfirmation ? 'Erster bestätigter Ziel-VK' : 'Ziel-VK geändert'
      }
    };
  }

  function ownSalesPurchaseHint(experience = {}, marketTrend = '') {
    const quality = experience.dataQuality || ownSalesDataQuality(experience.saleCount);
    if (!quality.sufficient) return 'ZU WENIG EIGENE DATEN';
    const turnover = experience.turnoverClass?.key || 'unknown';
    const roi = optionalNumber(experience.averageRoi);
    const profit = optionalNumber(experience.averageProfit);
    const falling = /FALLEND/i.test(String(marketTrend || ''));
    const fast = ['very-fast', 'fast'].includes(turnover);
    const slow = ['slow', 'very-slow'].includes(turnover);
    const profitable = profit !== null && profit > 0 && roi !== null && roi >= 25;
    if (fast && profitable && falling) return 'WIEDERANKAUF NUR MIT VORSICHT';
    if (fast && profitable) return 'WIEDERANKAUF PRÜFEN';
    if (fast && (profit === null || roi === null)) return 'GUTER DREHER · MARGE UNBEKANNT';
    if (fast && (profit <= 0 || roi < 15)) return 'SCHNELL, ABER NIEDRIGE MARGE';
    if (slow && profitable) return 'PROFITABEL, ABER LANGSAM';
    if (slow) return 'VORSICHT BEIM WIEDERANKAUF';
    if (experience.totalProfit !== null && experience.totalProfit < 0) return 'BISHER SCHWACHE HANDELSERFAHRUNG';
    return profitable ? 'GUTER DREHER' : 'HANDELSERFAHRUNG BEOBACHTEN';
  }

  function analyzeOwnSalesExperience(records = [], options = {}) {
    const asOf = new Date(options.asOf || new Date());
    const asOfStamp = Number.isNaN(asOf.getTime()) ? Date.now() : asOf.getTime();
    const grouped = new Map();
    for (const record of Array.isArray(records) ? records : []) {
      const productId = String(record.productId || '').trim();
      if (!/^\d+$/.test(productId)) continue;
      if (!grouped.has(productId)) grouped.set(productId, []);
      grouped.get(productId).push(record);
    }
    const results = [];
    for (const [productId, rows] of grouped) {
      const orderIds = new Set(rows.map((row, index) => String(row.orderId || row.saleId || `sale-${index}`)));
      const saleCount = orderIds.size;
      const soldQuantity = rows.reduce((sum, row) => sum + Math.max(1, Math.round(asNumber(row.quantity) || 1)), 0);
      const expanded = (selector, predicate = () => true) => rows.flatMap(row => {
        const quantity = Math.max(1, Math.round(asNumber(row.quantity) || 1));
        const value = selector(row);
        return predicate(row, value) ? Array(quantity).fill(value) : [];
      });
      const dates = rows.map(row => String(row.soldAt || row.saleDate || '').slice(0, 10)).filter(Boolean).sort();
      const orderDateMap = new Map();
      rows.forEach((row, index) => {
        const key = String(row.orderId || row.saleId || `sale-${index}`);
        const stamp = new Date(row.soldAt || row.saleDate || '').getTime();
        if (Number.isFinite(stamp)) orderDateMap.set(key, stamp);
      });
      const windowCount = days => [...orderDateMap.values()].filter(stamp => stamp <= asOfStamp && stamp >= asOfStamp - days * 86400000).length;
      const durationSamples = rows.flatMap(row => (Array.isArray(row.daysToSaleSamples) ? row.daysToSaleSamples : [row.daysToSale]))
        .map(value => optionalNumber(value)).filter(value => value !== null && value >= 0);
      const sellPrices = expanded(row => optionalNumber(row.sellPrice), (_row, value) => value !== null && value >= 0);
      const knownCostRows = rows.filter(row => Boolean(row.costKnown) && optionalNumber(row.fullCost) !== null);
      const fullCosts = knownCostRows.flatMap(row => Array(Math.max(1, Math.round(asNumber(row.quantity) || 1))).fill(optionalNumber(row.fullCost)));
      const profitRows = knownCostRows.filter(row => optionalNumber(row.unitProfit) !== null);
      const profits = profitRows.flatMap(row => Array(Math.max(1, Math.round(asNumber(row.quantity) || 1))).fill(optionalNumber(row.unitProfit)));
      const rois = profitRows.flatMap(row => {
        const cost = optionalNumber(row.fullCost);
        const profit = optionalNumber(row.unitProfit);
        return cost !== null && cost > 0 && profit !== null
          ? Array(Math.max(1, Math.round(asNumber(row.quantity) || 1))).fill(profit / cost * 100) : [];
      });
      const averageDays = averageValue(durationSamples);
      const medianDays = medianValue(durationSamples);
      const dataQuality = ownSalesDataQuality(saleCount);
      const turnoverClass = ownTurnoverClass(medianDays, saleCount);
      const totalProfit = profits.length ? roundMoney(profits.reduce((sum, value) => sum + value, 0)) : null;
      const result = {
        productId,
        name: String(rows.find(row => row.name)?.name || ''),
        germanName: String(rows.find(row => row.germanName)?.germanName || ''),
        englishName: String(rows.find(row => row.englishName)?.englishName || ''),
        setName: String(rows.find(row => row.setName)?.setName || ''),
        rarity: String(rows.find(row => row.rarity)?.rarity || ''),
        holdingProfile: String(rows.find(row => row.holdingProfile)?.holdingProfile || ''),
        saleCount, soldQuantity, lastSale: dates.at(-1) || '', firstSale: dates[0] || '',
        sales30: windowCount(30), sales90: windowCount(90), sales180: windowCount(180),
        durationKnownCount: durationSamples.length,
        durationUnknownCount: Math.max(0, soldQuantity - durationSamples.length),
        averageDays: averageDays === null ? null : Math.round(averageDays * 10) / 10,
        medianDays: medianDays === null ? null : Math.round(medianDays * 10) / 10,
        minimumDays: durationSamples.length ? Math.min(...durationSamples) : null,
        maximumDays: durationSamples.length ? Math.max(...durationSamples) : null,
        averageCardPrice: averageValue(sellPrices) === null ? null : roundMoney(averageValue(sellPrices)),
        averageSellPrice: averageValue(sellPrices) === null ? null : roundMoney(averageValue(sellPrices)),
        medianSellPrice: medianValue(sellPrices) === null ? null : roundMoney(medianValue(sellPrices)),
        minimumSellPrice: sellPrices.length ? roundMoney(Math.min(...sellPrices)) : null,
        maximumSellPrice: sellPrices.length ? roundMoney(Math.max(...sellPrices)) : null,
        knownCostQuantity: fullCosts.length,
        unknownCostQuantity: Math.max(0, soldQuantity - fullCosts.length),
        averageFullCost: averageValue(fullCosts) === null ? null : roundMoney(averageValue(fullCosts)),
        averageProfit: averageValue(profits) === null ? null : roundMoney(averageValue(profits)),
        medianProfit: medianValue(profits) === null ? null : roundMoney(medianValue(profits)),
        averageRoi: averageValue(rois) === null ? null : Math.round(averageValue(rois) * 10) / 10,
        totalProfit, dataQuality, turnoverClass,
        observationDays: dates.length ? Math.max(1, Math.floor((asOfStamp - new Date(dates[0]).getTime()) / 86400000) + 1) : 0,
        priceAction: 'KEINE AUTOMATISCHE PREISÄNDERUNG'
      };
      result.purchaseHint = ownSalesPurchaseHint(result, options.marketTrendByProduct?.[productId] || '');
      results.push(result);
    }
    return results.sort((left, right) => right.saleCount - left.saleCount || right.soldQuantity - left.soldQuantity || left.name.localeCompare(right.name, 'de'));
  }

  function combineAgingWithOwnSales(analysis = {}, experience = {}, marketTrend = '') {
    if (!experience?.dataQuality?.sufficient || experience.medianDays == null) return { ...analysis, ownSalesExperience: experience || null };
    const age = optionalNumber(analysis.inventoryAgeDays);
    const medianDays = Number(experience.medianDays);
    const falling = /FALLEND/i.test(String(marketTrend || analysis.marketDecision?.trend?.status || ''));
    let recommendation = analysis.recommendation;
    const factors = [...(analysis.factors || [])];
    factors.push(`Eigene Historie: Median ${medianDays} Tage aus ${experience.saleCount} Verkäufen`);
    if (age !== null && age <= medianDays * 1.25 && !falling && ['PREIS PRÜFEN', 'KAPITALBINDUNG PRÜFEN', 'LANGSAMDREHER'].includes(recommendation)) recommendation = 'BEOBACHTEN';
    if (age !== null && age > Math.max(medianDays * 2, medianDays + 21) && falling) recommendation = 'KAPITALBINDUNG PRÜFEN';
    return { ...analysis, recommendation, factors, ownSalesExperience: experience };
  }

  function estimatePackagingPerCard(state = {}, settings = state.settings || {}) {
    const sales = Array.isArray(state.sales) ? state.sales : [];
    let totalCost = 0;
    let totalCards = 0;
    let sampleCount = 0;
    sales.forEach(sale => {
      if (String(sale.status || '').toLowerCase().includes('storniert')) return;
      const quantity = Math.max(0, asNumber(sale.quantity) || (Array.isArray(sale.items)
        ? sale.items.reduce((sum, item) => sum + Math.max(0, asNumber(item.quantity || 1)), 0)
        : 0));
      if (!quantity) return;
      const materialUsageCost = Array.isArray(sale.materialUsage) && sale.materialUsage.length
        ? sale.materialUsage.reduce((sum, row) => sum + Math.max(0, asNumber(row.quantity)) * Math.max(0, asNumber(row.unitCost)), 0)
        : null;
      const manualCost = sale.material !== undefined && sale.material !== ''
        ? Math.max(0, asNumber(sale.material))
        : sale.packaging !== undefined && sale.packaging !== ''
          ? Math.max(0, asNumber(sale.packaging))
          : null;
      const orderCost = materialUsageCost !== null ? materialUsageCost : manualCost;
      if (orderCost === null) return;
      totalCost += orderCost;
      totalCards += quantity;
      sampleCount += 1;
    });
    if (totalCards > 0) {
      return {
        perCard: roundMoney(totalCost / totalCards),
        perOrder: Math.max(0, asNumber(settings.packaging)),
        averageCardsPerOrder: roundMoney(totalCards / sampleCount),
        sampleCount,
        source: 'actual'
      };
    }
    const expectedCardsPerOrder = Math.max(1, asNumber(settings.expectedCardsPerOrder) || 3);
    return {
      perCard: roundMoney(Math.max(0, asNumber(settings.packaging)) / expectedCardsPerOrder),
      perOrder: Math.max(0, asNumber(settings.packaging)),
      averageCardsPerOrder: expectedCardsPerOrder,
      sampleCount: 0,
      source: 'fallback'
    };
  }

  const MARKET_REFERENCE_THRESHOLDS = Object.freeze({
    lowOutlierMinimumRatio: 0.25,
    lowOutlierMaximumRatio: 4,
    minimumComparisonValues: 2
  });

  function calculateAutomaticPriceTargets(prices = {}, settings = {}) {
    const liveOffer = optionalNumber(prices.liveOffer ?? prices.offerLow ?? prices.currentOffer);
    const low = optionalNumber(prices.low ?? prices.currentBuy);
    const lowEx = optionalNumber(prices.lowEx ?? prices.lowExPlus ?? prices.lowExPrice ?? prices['LOWEX+']);
    const trend = optionalNumber(prices.trend);
    const avg1 = optionalNumber(prices.avg1);
    const avg7 = optionalNumber(prices.avg7);
    const avg30 = optionalNumber(prices.avg30);
    const pricePointCount = [liveOffer, low, lowEx, trend, avg1, avg7, avg30].filter(value => value !== null).length;
    // Trend sowie 7-/30-Tage-Werte beschreiben die Vergangenheit und sind
    // kein heute sicher erreichbarer Verkaufspreis. Ein echtes Angebotsniveau
    // hat Vorrang; ohne API wird Low vorsichtig mit dem 1-Tages-Wert geglättet.
    let marketReference = 0;
    let marketReferenceSource = 'Keine kurzfristige Preisreferenz';
    let lowOutlier = false;
    let lowExUsed = false;
    let lowOutlierExplanation = '';
    const comparisonValues = [avg1, avg7, avg30, trend].filter(value => value !== null);
    const robustComparison = median(comparisonValues);
    const lowRatio = low !== null && robustComparison > 0 ? low / robustComparison : null;
    if (low !== null && comparisonValues.length >= MARKET_REFERENCE_THRESHOLDS.minimumComparisonValues) {
      lowOutlier = lowRatio < MARKET_REFERENCE_THRESHOLDS.lowOutlierMinimumRatio
        || lowRatio > MARKET_REFERENCE_THRESHOLDS.lowOutlierMaximumRatio;
    }
    const lowExRatio = lowEx !== null && robustComparison > 0 ? lowEx / robustComparison : null;
    const lowExPlausible = lowEx !== null && (
      comparisonValues.length < MARKET_REFERENCE_THRESHOLDS.minimumComparisonValues
      || (lowExRatio >= MARKET_REFERENCE_THRESHOLDS.lowOutlierMinimumRatio
        && lowExRatio <= MARKET_REFERENCE_THRESHOLDS.lowOutlierMaximumRatio)
    );
    const effectiveLow = lowOutlier ? (lowExPlausible ? lowEx : null) : low;
    if (liveOffer !== null) {
      marketReference = liveOffer;
      marketReferenceSource = 'Gespeicherte Angebotsbeobachtung';
    } else if (lowOutlier) {
      const recentMedian = median([avg1, avg7, avg30]) || robustComparison;
      if (lowExPlausible) {
        marketReference = avg1 !== null ? lowEx * 0.90 + avg1 * 0.10 : lowEx;
        marketReferenceSource = 'Price Guide Low EX+ mit kleinem 1-Tages-Puffer (Low-Ausreißer ausgeschlossen)';
        lowExUsed = true;
      } else {
        marketReference = recentMedian;
        marketReferenceSource = 'Robuster Median der kurzfristigen Price-Guide-Werte (Low-Ausreißer ausgeschlossen)';
      }
      lowOutlierExplanation = `Price Guide Low als Ausreißer erkannt: ${roundMoney(low).toFixed(2)} € liegt deutlich außerhalb des robusten Vergleichsniveaus ${roundMoney(robustComparison).toFixed(2)} € und wurde nicht als Preisreferenz verwendet.`;
    } else if (low !== null && avg1 !== null) {
      marketReference = low * 0.90 + avg1 * 0.10;
      marketReferenceSource = 'Price Guide Low mit kleinem 1-Tages-Puffer';
    } else if (avg1 !== null) {
      marketReference = avg1;
      marketReferenceSource = 'Cardmarket 1-Tages-Wert';
    } else if (low !== null) {
      marketReference = low;
      marketReferenceSource = 'Cardmarket Low';
    } else {
      const historical = [avg7, avg30, trend].filter(value => value !== null).sort((a, b) => a - b);
      if (historical.length) {
        marketReference = historical[0];
        marketReferenceSource = 'Vorsichtige historische Untergrenze';
      }
    }
    const historicalValues = [trend, avg7, avg30].filter(value => value !== null).sort((a, b) => a - b);
    const historicalReference = historicalValues.length
      ? historicalValues[Math.floor((historicalValues.length - 1) / 2)]
      : 0;
    const recommendedSell = roundMoney(Math.max(0, marketReference));
    // Ohne API kann der Price Guide keinen exakten, nach Sprache, Zustand und
    // Standort gefilterten Angebotspreis liefern. Die vorsichtige Untergrenze
    // bleibt deshalb erhalten. Daneben zeigt das typische Niveau aus den
    // echten 1-/7-/30-Tageswerten, wann eine manuelle Marktpruefung sinnvoll ist.
    const recentMedian = median([avg1, avg7, avg30]);
    const typicalSell = roundMoney(liveOffer !== null
      ? recommendedSell
      : Math.max(recommendedSell, recentMedian || recommendedSell));
    const safety = clamp(settings.safetyPercent, 0, 50) / 100;
    const feeRate = clamp(settings.feePercent, 0, 100) / 100;
    const packaging = Math.max(0, asNumber(settings.packaging));
    const safeSell = floorMoney(recommendedSell * (1 - safety));
    const feeAmount = safeSell * feeRate;
    const netBeforeBuy = safeSell - feeAmount - packaging;
    const minProfit = Math.max(0, asNumber(settings.minProfit));
    const minRoi = Math.max(0, asNumber(settings.minRoi ?? 25)) / 100;
    const targetRoi = Math.max(minRoi, asNumber(settings.targetRoi ?? 30) / 100);
    const maxByProfit = netBeforeBuy > minProfit ? floorMoney(netBeforeBuy - minProfit) : 0;
    const maxByRoi = netBeforeBuy > 0 ? floorMoney(minRoi > 0 ? netBeforeBuy / (1 + minRoi) : netBeforeBuy) : 0;
    const maxBuy = recommendedSell > 0 ? Math.min(maxByProfit, maxByRoi) : 0;
    const typicalSafeSell = floorMoney(typicalSell * (1 - safety));
    const typicalFeeAmount = typicalSafeSell * feeRate;
    const typicalNetBeforeBuy = typicalSafeSell - typicalFeeAmount - packaging;
    const typicalMaxByProfit = typicalNetBeforeBuy > minProfit
      ? floorMoney(typicalNetBeforeBuy - minProfit) : 0;
    const typicalMaxByRoi = typicalNetBeforeBuy > 0
      ? floorMoney(minRoi > 0 ? typicalNetBeforeBuy / (1 + minRoi) : typicalNetBeforeBuy) : 0;
    const typicalMaxBuy = typicalSell > 0 ? Math.min(typicalMaxByProfit, typicalMaxByRoi) : 0;
    const ownedCost = Math.max(0, asNumber(prices.cost ?? prices.ownBuyAverage));
    const breakEvenPrice = feeRate < 1
      ? (ownedCost + packaging) / Math.max(0.01, 1 - feeRate)
      : 0;
    const targetRoiPrice = feeRate < 1
      ? (ownedCost * (1 + targetRoi) + packaging) / Math.max(0.01, 1 - feeRate)
      : 0;
    const priceFloor = ownedCost > 0 ? Math.ceil(targetRoiPrice * 100) / 100 : 0;
    const quickSell = recommendedSell > 0
      ? Math.ceil(Math.max(0, Math.min(effectiveLow ?? recommendedSell, recommendedSell)) * 100) / 100
      : 0;
    const confidenceScore = Math.min(100,
      pricePointCount * 10 +
      Math.min(25, Math.max(0, asNumber(prices.marketSampleCount)) * 3) +
      Math.min(25, Math.max(0, asNumber(prices.sellSampleCount)) * 5)
    );
    const confidenceLevel = confidenceScore >= 75 ? 'high' : confidenceScore >= 45 ? 'medium' : 'low';
    return {
      liveOffer, low, lowEx, effectiveLow, trend, avg1, avg7, avg30, pricePointCount,
      lowOutlier, lowExUsed, robustComparison: roundMoney(robustComparison), lowRatio, lowOutlierExplanation,
      marketReference: recommendedSell, marketReferenceSource, historicalReference,
      recommendedSell, typicalSell, safeSell, typicalSafeSell, feeRate, packaging, feeAmount, typicalFeeAmount, netBeforeBuy, typicalNetBeforeBuy,
      minProfit, minRoi, targetRoi, maxByProfit, maxByRoi, maxBuy,
      typicalMaxBuy,
      ownedCost, breakEvenPrice: roundMoney(breakEvenPrice), targetRoiPrice: priceFloor,
      priceFloor, quickSell, confidenceScore, confidenceLevel
    };
  }

  function calculateOwnedCardPriceTargets(prices = {}, settings = {}) {
    const base = calculateAutomaticPriceTargets(prices, settings);
    const suggestedSell = base.recommendedSell > 0 ? base.recommendedSell : base.priceFloor;
    const feeAmountAtSuggestion = suggestedSell * base.feeRate;
    const expectedProfit = suggestedSell > 0
      ? roundMoney(suggestedSell - feeAmountAtSuggestion - base.packaging - base.ownedCost)
      : 0;
    const expectedRoi = base.ownedCost > 0 ? expectedProfit / base.ownedCost * 100 : 0;
    return {
      ...base,
      marketSell: base.recommendedSell,
      suggestedSell,
      feeAmountAtSuggestion: roundMoney(feeAmountAtSuggestion),
      expectedProfit,
      expectedRoi,
      profitableAtMarket: base.ownedCost > 0 ? suggestedSell > 0 && expectedProfit >= 0 && expectedRoi >= base.minRoi * 100 : null,
      meetsTargetRoi: base.ownedCost > 0 ? suggestedSell > 0 && expectedProfit >= 0 && expectedRoi >= base.targetRoi * 100 : null,
      costFloorAboveMarket: base.priceFloor > 0 && base.recommendedSell > 0 && base.priceFloor > base.recommendedSell
    };
  }

  function deduplicatePurchaseDraftRows(rows = []) {
    const seenArticleIds = new Set();
    const sourceRows = rows || [];
    const filtered = sourceRows.filter(row => {
      const articleId = String(row.sourceArticleId || row.articleId || '').replace(/\D/g, '');
      if (!articleId) return true;
      if (seenArticleIds.has(articleId)) return false;
      seenArticleIds.add(articleId);
      return true;
    });
    if (filtered.length !== sourceRows.length || filtered.length % 2) return filtered;
    const fingerprint = row => [
      row.productId, row.name, row.quantity, row.unitPrice,
      row.language, row.condition, row.set, row.collectorNumber, row.rarity
    ].map(value => String(value ?? '').trim().toLowerCase()).join('|');
    const half = filtered.length / 2;
    const isRepeatedBlock = half > 0 && filtered.slice(0, half).every((row, index) =>
      fingerprint(row) === fingerprint(filtered[index + half]));
    return isRepeatedBlock ? filtered.slice(0, half) : filtered;
  }

  function stockSnapshotIdentity(item = {}) {
    const articleId = String(item.articleId || item.idArticle || '').replace(/\D/g, '');
    if (articleId) return `article:${articleId}`;
    const productId = String(item.productId || '').replace(/\D/g, '');
    const language = String(item.language || '').trim().toUpperCase();
    const condition = String(item.condition || '').trim().toUpperCase();
    const edition = String(item.edition || '').trim().toUpperCase();
    return `variant-v2:${productId}|${language}|${condition}|${edition}`;
  }

  const wholeQuantity = value => Math.max(0, Math.round(asNumber(value)));

  function purchaseLineKey(item = {}, index = 0) {
    return String(item.receiptLineKey || item.articleId || item.sourceRow || item.id ||
      `${item.productId || 'unknown'}:${item.language || ''}:${item.condition || ''}:${index}`);
  }

  function normalizePurchaseReceiptLine(item = {}, index = 0) {
    const quantity = wholeQuantity(item.quantity || 1);
    const business = wholeQuantity(item.receivedBusiness);
    const privateQuantity = wholeQuantity(item.receivedPrivate);
    const damaged = wholeQuantity(item.receivedDamaged);
    const cancelled = wholeQuantity(item.cancelledQuantity);
    const assigned = business + privateQuantity + damaged + cancelled;
    return {
      key: purchaseLineKey(item, index),
      quantity,
      business,
      private: privateQuantity,
      damaged,
      cancelled,
      assigned,
      open: Math.max(0, quantity - assigned),
      valid: assigned <= quantity,
      materializedBusiness: wholeQuantity(item.materializedBusiness),
      materializedPrivate: wholeQuantity(item.materializedPrivate),
      materializedDamaged: wholeQuantity(item.materializedDamaged)
    };
  }

  function allocatePurchaseCosts(purchase = {}, method = 'value') {
    const items = Array.isArray(purchase.pendingItems) ? purchase.pendingItems : [];
    const normalized = items.map((item, index) => {
      const receipt = normalizePurchaseReceiptLine(item, index);
      const activeQuantity = Math.max(0, receipt.quantity - receipt.cancelled);
      const unitPrice = Math.max(0, asNumber(item.unitPrice ?? item.price));
      return { item, index, receipt, activeQuantity, unitPrice, lineValue: activeQuantity * unitPrice };
    });
    const activeUnits = normalized.reduce((sum, row) => sum + row.activeQuantity, 0);
    const activeValue = normalized.reduce((sum, row) => sum + row.lineValue, 0);
    const shipping = Math.max(0, asNumber(purchase.shipping));
    const extra = Math.max(0, asNumber(purchase.extra));
    const refund = Math.max(0, asNumber(purchase.refund));
    const declaredCardValue = Math.max(0, asNumber(purchase.cardValue));
    const paidTotal = Math.max(0, declaredCardValue + shipping + extra - refund);
    // Active line values omit cancelled units. The difference to the amount
    // actually paid contains shipping, trustee costs, discounts and refunds.
    const distributableAdjustment = paidTotal - activeValue;
    return normalized.map(row => {
      let share = 0;
      if (method === 'quantity' || activeValue <= 0) share = activeUnits ? row.activeQuantity / activeUnits : 0;
      else share = row.lineValue / activeValue;
      const allocatedShippingTotal = shipping * share;
      const allocatedExtraTotal = (distributableAdjustment - shipping) * share;
      const allocatedShipping = row.activeQuantity ? allocatedShippingTotal / row.activeQuantity : 0;
      const allocatedExtra = row.activeQuantity ? allocatedExtraTotal / row.activeQuantity : 0;
      return {
        ...row,
        method: method === 'quantity' ? 'quantity' : 'value',
        allocatedShipping,
        allocatedExtra,
        unitCost: Math.max(0, row.unitPrice + allocatedShipping + allocatedExtra),
        totalCost: Math.max(0, row.lineValue + allocatedShippingTotal + allocatedExtraTotal)
      };
    });
  }

  function planPurchaseReceipt(purchase = {}, requestedLines = [], method = 'value') {
    const costRows = allocatePurchaseCosts(purchase, method);
    const requestedByKey = new Map((requestedLines || []).map((row, index) => [
      String(row.key || purchaseLineKey(row, index)), row
    ]));
    const lines = [];
    const errors = [];
    for (const costRow of costRows) {
      const current = costRow.receipt;
      const request = requestedByKey.get(current.key) || {};
      const next = {
        business: wholeQuantity(request.business ?? current.business),
        private: wholeQuantity(request.private ?? current.private),
        damaged: wholeQuantity(request.damaged ?? current.damaged),
        cancelled: wholeQuantity(request.cancelled ?? current.cancelled),
        listBusiness: Boolean(request.listBusiness ?? costRow.item.listBusiness),
        listingPrice: Math.max(0, asNumber(request.listingPrice ?? costRow.item.receiptListingPrice)),
        suggestedSell: Math.max(0, asNumber(request.suggestedSell ?? costRow.item.suggestedSell)),
        confirmedTargetSellPrice: optionalNumber(request.confirmedTargetSellPrice ?? costRow.item.confirmedTargetSellPrice),
        cartFillerStatus: ['yes', 'no'].includes(String((request.cartFillerStatus ?? costRow.item.cartFillerStatus) || ''))
          ? String(request.cartFillerStatus ?? costRow.item.cartFillerStatus) : 'unknown',
        incrementalShippingCost: optionalNumber(request.incrementalShippingCost ?? costRow.item.incrementalShippingCost),
        incrementalDirectCost: optionalNumber(request.incrementalDirectCost ?? costRow.item.incrementalDirectCost)
      };
      next.decisionCost = decisionCostBreakdown({
        cardPrice: costRow.unitPrice,
        fullCost: costRow.unitCost,
        cartFiller: next.cartFillerStatus,
        incrementalShippingCost: next.incrementalShippingCost,
        incrementalDirectCost: next.incrementalDirectCost
      });
      const assigned = next.business + next.private + next.damaged + next.cancelled;
      if (assigned > current.quantity) errors.push(`${costRow.item.name || 'Karte'}: Aufteilung ${assigned} ist groesser als Bestellmenge ${current.quantity}.`);
      if (next.business < current.materializedBusiness || next.private < current.materializedPrivate || next.damaged < current.materializedDamaged) {
        errors.push(`${costRow.item.name || 'Karte'}: Bereits uebernommene Exemplare koennen nur ueber eine Bestandskorrektur reduziert werden.`);
      }
      if (next.listBusiness && next.business > 0 && next.listingPrice <= 0) {
        errors.push(`${costRow.item.name || 'Karte'}: Fuer die direkte Inserierung fehlt ein positiver Inseratspreis.`);
      }
      lines.push({
        ...costRow,
        ...next,
        assigned,
        open: Math.max(0, current.quantity - assigned),
        addBusiness: Math.max(0, next.business - current.materializedBusiness),
        addPrivate: Math.max(0, next.private - current.materializedPrivate),
        addDamaged: Math.max(0, next.damaged - current.materializedDamaged)
      });
    }
    const totals = lines.reduce((sum, row) => {
      for (const key of ['business', 'private', 'damaged', 'cancelled', 'open', 'addBusiness', 'addPrivate', 'addDamaged']) sum[key] += row[key];
      return sum;
    }, { business: 0, private: 0, damaged: 0, cancelled: 0, open: 0, addBusiness: 0, addPrivate: 0, addDamaged: 0 });
    const received = totals.business + totals.private + totals.damaged;
    const status = totals.open > 0
      ? (received + totals.cancelled > 0 ? 'Teilweise eingetroffen' : String(purchase.status || 'Unterwegs'))
      : (received > 0 ? 'Eingetroffen' : 'Storniert');
    return { valid: errors.length === 0, errors, lines, totals, status, method: method === 'quantity' ? 'quantity' : 'value' };
  }

  function purchaseOwnershipTotals(purchase = {}, method = purchase.costAllocationMethod || 'value') {
    const rows = allocatePurchaseCosts(purchase, method);
    const totals = { business: 0, private: 0, damaged: 0, cancelled: 0, open: 0, total: 0 };
    for (const row of rows) {
      const receipt = row.receipt;
      totals.business += receipt.business * row.unitCost;
      totals.private += receipt.private * row.unitCost;
      totals.damaged += receipt.damaged * row.unitCost;
      totals.cancelled += receipt.cancelled * row.unitPrice;
      totals.open += receipt.open * row.unitCost;
      totals.total += row.totalCost;
    }
    return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, roundMoney(value)]));
  }

  function selectInventoryForSale(inventory = [], request = {}, quantity = request.quantity || 1) {
    const wanted = wholeQuantity(quantity);
    const productId = String(request.productId || '').trim();
    const language = String(request.language || '').trim().toUpperCase();
    const condition = String(request.condition || '').trim().toUpperCase();
    const available = (inventory || []).filter(item =>
      !['Verkauft', 'Reserviert', 'Storniert', 'Beschädigt', 'Rückgabe unterwegs'].includes(String(item.status || '')) &&
      (!productId || String(item.productId || '').trim() === productId)
    );
    const rank = item => {
      let value = 0;
      if (language && String(item.language || '').toUpperCase() !== language) value += 2;
      if (condition && String(item.condition || '').toUpperCase() !== condition) value += 1;
      return value;
    };
    const strategy = String(request.strategy || 'fifo');
    available.sort((a, b) => {
      const exactRank = rank(a) - rank(b);
      if (exactRank) return exactRank;
      if (strategy === 'lowest-cost') {
        const difference = asNumber(a.cost) - asNumber(b.cost);
        if (difference) return difference;
      }
      if (strategy === 'highest-cost') {
        const difference = asNumber(b.cost) - asNumber(a.cost);
        if (difference) return difference;
      }
      return String(a.purchaseDate || '').localeCompare(String(b.purchaseDate || '')) ||
        String(a.id || '').localeCompare(String(b.id || ''));
    });
    return { selected: available.slice(0, wanted), missing: Math.max(0, wanted - available.length), candidates: available };
  }

  function selectSaleAllocationDefault({ line = {}, draftId = '', explicitId = '', linkedItems = [], automaticItems = [], candidates = [], claimedIds = [] } = {}) {
    const productId = String(line.productId || '').trim();
    const candidateIds = new Set((candidates || []).map(item => String(item?.id || '')).filter(Boolean));
    const claimed = claimedIds instanceof Set ? claimedIds : new Set(claimedIds || []);
    const matchingIds = items => (items || [])
      .filter(item => productId && String(item?.productId || '').trim() === productId)
      .map(item => String(item.id || ''));
    // draftId und explicitId stammen aus einer bewussten Auswahl. Alle weiteren
    // Kandidaten dürfen nur automatisch gewählt werden, wenn die Produkt-ID passt.
    return [draftId, explicitId, ...matchingIds(linkedItems), ...matchingIds(automaticItems), ...matchingIds(candidates)]
      .map(value => String(value || ''))
      .find(id => id && candidateIds.has(id) && !claimed.has(id)) || '';
  }

  function analyzePurchaseDraft(rows = [], costs = {}, settings = {}) {
    const normalized = (rows || []).map((row, index) => {
      const quantity = wholeQuantity(row.quantity || 1);
      const privateQuantity = Math.min(quantity, wholeQuantity(row.privateQuantity));
      const businessQuantity = row.enabled === false ? 0 : Math.max(0, quantity - privateQuantity);
      const unitPrice = Math.max(0, asNumber(row.unitPrice));
      const positiveMarketValue = value => asNumber(value) > 0 ? asNumber(value) : null;
      const market = {
        liveOffer: positiveMarketValue(row.liveOffer ?? row.offerLow ?? row.currentOffer),
        low: positiveMarketValue(row.low ?? row.marketLow),
        trend: positiveMarketValue(row.trend ?? row.marketTrend),
        avg1: positiveMarketValue(row.avg1),
        avg7: positiveMarketValue(row.avg7),
        avg30: positiveMarketValue(row.avg30)
      };
      return { ...row, index, quantity, privateQuantity, businessQuantity, unitPrice, lineValue: quantity * unitPrice, businessValue: businessQuantity * unitPrice, market };
    });
    const totalValue = normalized.reduce((sum, row) => sum + row.lineValue, 0);
    const shipping = Math.max(0, asNumber(costs.shipping));
    const extra = Math.max(0, asNumber(costs.extra));
    const refund = Math.max(0, asNumber(costs.refund));
    const adjustment = shipping + extra - refund;
    const lines = normalized.map(row => {
      const share = totalValue > 0 ? row.lineValue / totalValue : (normalized.length ? 1 / normalized.length : 0);
      const allocatedTotal = adjustment * share;
      const landedUnitCost = row.quantity ? Math.max(0, row.unitPrice + allocatedTotal / row.quantity) : 0;
      const hasMarket = Object.values(row.market).some(value => asNumber(value) > 0);
      const calculatedPricing = calculateOwnedCardPriceTargets({ ...row.market, cost: landedUnitCost }, settings);
      const pricing = hasMarket ? calculatedPricing : { ...calculatedPricing, suggestedSell: 0, marketSell: 0, expectedProfit: 0, expectedRoi: 0, profitableAtMarket: null, meetsTargetRoi: null };
      const expectedProfit = pricing.suggestedSell > 0 ? pricing.expectedProfit : 0;
      const expectedRoi = landedUnitCost > 0 ? expectedProfit / landedUnitCost * 100 : 0;
      const typicalSell = Math.max(asNumber(pricing.suggestedSell), asNumber(pricing.typicalSell));
      const typicalProfit = typicalSell > 0
        ? roundMoney(typicalSell - typicalSell * pricing.feeRate - pricing.packaging - landedUnitCost)
        : 0;
      const typicalRoi = landedUnitCost > 0 ? typicalProfit / landedUnitCost * 100 : 0;
      let recommendation = 'Preisdaten fehlen';
      let decisionReason = 'Für diese Druckvariante ist noch kein kurzfristiger Marktwert gespeichert.';
      if (row.enabled === false || !row.businessQuantity) {
        recommendation = 'Nicht geschäftlich';
        decisionReason = 'Diese Position ist nicht für den Geschäftsbestand vorgesehen.';
      } else if (!pricing.suggestedSell) {
        recommendation = 'Preisdaten fehlen';
      } else if (landedUnitCost <= pricing.maxBuy * 0.85) {
        recommendation = 'Sehr guter EK';
        decisionReason = `Der vollständige EK liegt deutlich unter der vorsichtigen Kaufgrenze von ${pricing.maxBuy.toFixed(2)} €.`;
      } else if (landedUnitCost <= pricing.maxBuy) {
        recommendation = 'Lohnt sich';
        decisionReason = `Der vollständige EK liegt innerhalb der vorsichtigen Kaufgrenze von ${pricing.maxBuy.toFixed(2)} €.`;
      } else if (!pricing.liveOffer && pricing.typicalMaxBuy > pricing.maxBuy && landedUnitCost <= pricing.typicalMaxBuy) {
        recommendation = 'Marktpreis prüfen';
        decisionReason = `Der EK passt nur zum typischen 1-/7-/30-Tage-Niveau. Aktuelle NM-Angebote auf Cardmarket prüfen; die Spanne reicht von ${pricing.maxBuy.toFixed(2)} € bis ${pricing.typicalMaxBuy.toFixed(2)} €.`;
      } else if (landedUnitCost > pricing.typicalMaxBuy) {
        recommendation = 'Nicht kaufen';
        decisionReason = `Der vollständige EK liegt sogar über der oberen Price-Guide-Orientierung von ${pricing.typicalMaxBuy.toFixed(2)} €.`;
      } else {
        recommendation = 'Marktpreis prüfen';
        decisionReason = 'Preis, Sprache, Zustand und Versand sollten vor dem Kauf noch einmal geprüft werden.';
      }
      return { ...row, share, allocatedTotal: roundMoney(allocatedTotal), landedUnitCost: roundMoney(landedUnitCost), pricing, expectedProfit: roundMoney(expectedProfit), expectedRoi, typicalProfit, typicalRoi, recommendation, decisionReason };
    });
    const businessLines = lines.filter(row => row.businessQuantity > 0 && row.enabled !== false);
    const businessCost = businessLines.reduce((sum, row) => sum + row.businessQuantity * row.landedUnitCost, 0);
    const projectedRevenue = businessLines.reduce((sum, row) => sum + row.businessQuantity * asNumber(row.pricing.suggestedSell), 0);
    const projectedProfit = businessLines.reduce((sum, row) => sum + row.businessQuantity * row.expectedProfit, 0);
    const typicalProjectedRevenue = businessLines.reduce((sum, row) => sum + row.businessQuantity * asNumber(row.pricing.typicalSell), 0);
    const typicalProjectedProfit = businessLines.reduce((sum, row) => sum + row.businessQuantity * row.typicalProfit, 0);
    return {
      lines,
      totals: {
        cards: normalized.reduce((sum, row) => sum + row.quantity, 0),
        businessCards: businessLines.reduce((sum, row) => sum + row.businessQuantity, 0),
        privateCards: normalized.reduce((sum, row) => sum + row.privateQuantity, 0),
        cardValue: roundMoney(totalValue),
        shipping: roundMoney(shipping),
        extra: roundMoney(extra),
        refund: roundMoney(refund),
        paid: roundMoney(Math.max(0, totalValue + adjustment)),
        businessCost: roundMoney(businessCost),
        projectedRevenue: roundMoney(projectedRevenue),
        projectedProfit: roundMoney(projectedProfit),
        projectedRoi: businessCost > 0 ? projectedProfit / businessCost * 100 : 0,
        typicalProjectedRevenue: roundMoney(typicalProjectedRevenue),
        typicalProjectedProfit: roundMoney(typicalProjectedProfit),
        typicalProjectedRoi: businessCost > 0 ? typicalProjectedProfit / businessCost * 100 : 0
      }
    };
  }

  function summarizePurchasePerformance(purchase = {}, inventory = [], sales = []) {
    const assets = (inventory || []).filter(item => String(item.purchaseId || '') === String(purchase.id || ''));
    const current = assets.filter(item => !['Verkauft', 'Storniert'].includes(String(item.status || '')));
    const sold = assets.filter(item => String(item.status || '') === 'Verkauft' || item.saleId);
    const saleById = new Map((sales || []).map(sale => [String(sale.id || ''), sale]));
    const realizedRevenue = sold.reduce((sum, item) => {
      const sale = saleById.get(String(item.saleId || ''));
      if (!sale) return sum;
      const line = (sale.items || []).find(row => (row.matchedItemIds || []).includes(item.id));
      return sum + asNumber(line?.unitPrice || (sale.quantity ? asNumber(sale.cardValue || sale.revenue) / asNumber(sale.quantity) : 0));
    }, 0);
    const realizedCost = sold.reduce((sum, item) => sum + asNumber(item.cost), 0);
    const remainingCost = current.reduce((sum, item) => sum + asNumber(item.cost), 0);
    const currentMarketValue = current.reduce((sum, item) => {
      const market = asNumber(item.marketValue || item.suggestedSell || item.listingPrice);
      return sum + market;
    }, 0);
    return {
      cards: assets.length,
      available: current.filter(item => String(item.status || '') !== 'Reserviert').length,
      reserved: current.filter(item => String(item.status || '') === 'Reserviert').length,
      sold: sold.length,
      realizedRevenue: roundMoney(realizedRevenue),
      realizedCost: roundMoney(realizedCost),
      realizedProfit: roundMoney(realizedRevenue - realizedCost),
      tiedCapital: roundMoney(remainingCost),
      currentMarketValue: roundMoney(currentMarketValue),
      projectedTotalProfit: roundMoney(realizedRevenue + currentMarketValue - realizedCost - remainingCost)
    };
  }

  function scoreDemandRadar(records = [], context = {}, settings = {}) {
    const stockByProduct = context.stockByProduct || {};
    const salesByProduct = context.salesByProduct || {};
    return (records || []).map(record => {
      const productId = String(record.productId || '');
      const appearances = Math.max(0, asNumber(record.appearances ?? record.deckCount ?? record.frequency));
      const tournaments = Math.max(1, asNumber(record.tournaments || record.sampleSize || 1));
      const metaRate = Math.min(1, appearances / tournaments);
      const copies = Math.max(1, asNumber(record.copies || record.averageCopies || 1));
      const ownSales = Math.max(0, asNumber(salesByProduct[productId]));
      const stock = Math.max(0, asNumber(stockByProduct[productId]));
      const risk = String(record.risk || '').toLowerCase();
      const riskPenalty = /hoch|high|ban|reprint/.test(risk) ? 25 : /mittel|medium/.test(risk) ? 10 : 0;
      const shortageSignal = stock <= 0 ? 10 : Math.max(0, 10 - stock * 2);
      const score = Math.max(0, Math.min(100, Math.round(metaRate * 60 + Math.min(15, copies * 5) + Math.min(15, ownSales * 3) + shortageSignal - riskPenalty)));
      const offerPrice = Math.max(0, asNumber(record.offerPrice ?? record.maxPrice));
      const maxBuy = Math.max(0, asNumber(record.maxBuy));
      let recommendation;
      let reason;
      if (riskPenalty >= 25) {
        recommendation = 'Hohes Risiko';
        reason = 'Banlist- oder Reprint-Risiko ist als hoch markiert.';
      } else if (offerPrice > 0 && maxBuy > 0) {
        recommendation = offerPrice <= maxBuy * 0.85 ? 'Sehr guter EK' : offerPrice <= maxBuy ? 'Lohnt sich' : 'Nicht kaufen';
        reason = offerPrice <= maxBuy
          ? `Das konkrete Angebot liegt innerhalb der sicheren Kaufgrenze von ${maxBuy.toFixed(2)} €.`
          : `Das konkrete Angebot liegt über der sicheren Kaufgrenze von ${maxBuy.toFixed(2)} €.`;
      } else if (score >= 65) {
        recommendation = 'Hohe Nachfrage';
        reason = 'Starkes Nachfrage-Signal; vor dem Kauf muss noch ein konkreter Angebotspreis geprüft werden.';
      } else if (score >= 50) {
        recommendation = 'Testbestand';
        reason = 'Die Nachfrage rechtfertigt höchstens eine kleine Testmenge zum passenden Einkaufspreis.';
      } else if (score >= 30) {
        recommendation = 'Beobachten';
        reason = 'Das Nachfrage-Signal ist noch nicht stark genug für eine Kaufentscheidung.';
      } else {
        recommendation = 'Niedrige Nachfrage';
        reason = 'Die vorhandenen Nachfrage- und Verkaufsdaten rechtfertigen aktuell keinen Zukauf.';
      }
      return { ...record, sourceReason:record.reason || '', score, recommendation, reason, metaRate, stock, ownSales, offerPrice };
    }).sort((a, b) => b.score - a.score || String(a.name || '').localeCompare(String(b.name || '')));
  }

  function normalizeWantlistEntry(raw = {}, index = 0) {
    const productId = String(pick(raw, ['idProduct', 'productId', 'Produkt-ID', 'CM Produkt-ID']) || '').replace(/\D/g, '');
    const name = String(pick(raw, ['ProductName', 'name', 'cardName', 'Kartenname', 'Karte']) || '').trim();
    const setName = String(pick(raw, ['Expansion', 'setName', 'Setname', 'Set']) || '').trim();
    const set = String(pick(raw, ['ExpansionCode', 'setCode', 'Setkürzel', 'Setcode']) || '').trim();
    const version = String(pick(raw, ['Version', 'rarity', 'Seltenheit']) || '').trim();
    const collectorNumber = String(pick(raw, ['CollectorNumber', 'Setnummer', 'cardNumber']) || '').trim();
    const sourceEntryId = String(pick(raw, ['idWant', 'wantId', 'entryId']) || '').replace(/\D/g, '');
    const productUrl = String(pick(raw, ['ProductUrl', 'productUrl', 'URL', 'Link']) || '').trim();
    const quantity = Math.max(1, Math.round(asNumber(pick(raw, ['Quantity', 'Amount', 'Menge', 'Anzahl'])) || 1));
    const maxPrice = Math.max(0, asNumber(pick(raw, ['MaxPrice_EUR', 'MaxPrice', 'Buy Price', 'Kaufpreis', 'Preisgrenze', 'Max EK'])));
    const language = String(pick(raw, ['Language', 'Sprache']) || '').trim();
    const condition = String(pick(raw, ['MinCondition', 'Condition', 'Mindestzustand', 'Zustand']) || '').trim();
    const foilValue = String(pick(raw, ['IsFoil', 'Foil']) || '').trim().toLowerCase();
    const priorityValue = String(pick(raw, ['Priority', 'Priorität', 'Prio']) || 'B').trim().toUpperCase();
    const priority = ['A', 'B', 'C'].includes(priorityValue) ? priorityValue : 'B';
    const normalizedIdentity = [productId, normalizeField(name), normalizeField(set || setName), normalizeField(version), normalizeField(collectorNumber)].join('|');
    return {
      id: String(raw.id || ''),
      sourceEntryId,
      sourceKey: sourceEntryId ? `want:${sourceEntryId}` : `row:${normalizedIdentity || index + 1}`,
      productId, productUrl, name, germanName: String(raw.germanName || raw.nameDe || ''), englishName: String(raw.englishName || raw.nameEn || ''),
      set, setName, version, rarity: version, collectorNumber,
      quantity, maxPrice, language, condition, foil: ['y', 'yes', 'ja', 'true', '1'].includes(foilValue), priority,
      note: String(pick(raw, ['Note', 'Notiz', 'Kommentar']) || '').trim(),
      sourceRow: index + 1
    };
  }

  function mergeWantlistSnapshot(existing = {}, incomingRows = [], metadata = {}, nowValue = new Date().toISOString()) {
    const current = Array.isArray(existing.entries) ? existing.entries : [];
    const incoming = (incomingRows || []).map(normalizeWantlistEntry).filter(row => row.productId || row.name || row.productUrl);
    const result = current.map(row => ({ ...row }));
    const touched = new Set();
    const normalizedIdentity = row => [String(row.productId || ''), normalizeField(row.name), normalizeField(row.set || row.setName), normalizeField(row.version || row.rarity), normalizeField(row.collectorNumber)].join('|');
    let created = 0;
    let updated = 0;
    let restored = 0;

    incoming.forEach((row, index) => {
      let target = result.find(item => row.sourceEntryId && String(item.sourceEntryId || '') === row.sourceEntryId);
      if (!target && row.productId) target = result.find(item => String(item.productId || '') === row.productId);
      if (!target) target = result.find(item => normalizedIdentity(item) === normalizedIdentity(row));
      if (!target) {
        target = { ...row, id: row.id || `want-entry-${Date.now()}-${index}`, firstSeenAt: nowValue, history: [], archived: false };
        result.push(target);
        created += 1;
      } else {
        const before = { quantity: target.quantity, maxPrice: target.maxPrice, language: target.language, condition: target.condition, productId: target.productId };
        const preservedNote = String(target.note || '');
        const preservedManualIdentity = target.manuallyAssignedAt && !row.productId ? {
          productId: target.productId, productUrl: target.productUrl, name: target.name,
          germanName: target.germanName, englishName: target.englishName,
          set: target.set, setName: target.setName, version: target.version,
          rarity: target.rarity, collectorNumber: target.collectorNumber,
          metacardId: target.metacardId, manuallyAssignedAt: target.manuallyAssignedAt
        } : null;
        const changed = Object.keys(before).some(key => String(before[key] ?? '') !== String(row[key] ?? ''));
        if (changed) {
          target.history = Array.isArray(target.history) ? target.history : [];
          target.history.push({ at: nowValue, ...before });
          target.history = target.history.slice(-100);
          updated += 1;
        }
        if (target.archived) restored += 1;
        Object.assign(target, row, { id: target.id, note: row.note || preservedNote, firstSeenAt: target.firstSeenAt || nowValue, archived: false, archivedAt: '' });
        if (preservedManualIdentity) Object.assign(target, preservedManualIdentity);
      }
      target.lastSeenAt = nowValue;
      touched.add(target.id);
    });

    let archived = 0;
    if (metadata.completeSnapshot !== false) {
      result.forEach(entry => {
        if (touched.has(entry.id) || entry.archived) return;
        entry.archived = true;
        entry.archivedAt = nowValue;
        archived += 1;
      });
    }
    return {
      list: {
        ...existing,
        ...metadata,
        id: existing.id || metadata.id || `wantlist-${Date.now()}`,
        entries: result,
        importedAt: nowValue,
        updatedAt: nowValue,
        createdAt: existing.createdAt || nowValue
      },
      stats: { rows: incoming.length, created, updated, restored, archived, active: result.filter(row => !row.archived).length }
    };
  }

  function evaluateMarketCandidate(candidate = {}, settings = {}, nowValue = new Date()) {
    const pricing = calculateAutomaticPriceTargets(candidate, settings);
    const productId = String(candidate.productId || '').replace(/\D/g, '');
    const exactVariant = Boolean(productId && (candidate.set || candidate.setName) && (candidate.version || candidate.rarity || candidate.collectorNumber));
    const target = Math.max(0, Math.round(asNumber(candidate.target ?? candidate.quantity ?? settings.targetStock ?? 0)));
    const stock = Math.max(0, Math.round(asNumber(candidate.stock)));
    const missing = Math.max(0, target - stock);
    const maxPrice = Math.max(0, asNumber(candidate.maxPrice ?? candidate.userMaxPrice));
    const ownSales = Math.max(0, asNumber(candidate.ownSales));
    const demandScore = clamp(candidate.demandScore, 0, 100);
    const risk = String(candidate.risk || candidate.reprint || candidate.banlist || '').toLowerCase();
    const highRisk = /hoch|high|ban|reprint/.test(risk);
    const priceDate = candidate.priceDate || candidate.date || '';
    const parsedDate = priceDate ? new Date(priceDate) : null;
    const ageDays = parsedDate && !Number.isNaN(parsedDate.getTime()) ? Math.max(0, Math.floor((new Date(nowValue) - parsedDate) / 86400000)) : null;
    const stale = ageDays === null || ageDays > Math.max(1, asNumber(settings.priceAgeDays) || 7);
    const hasMarket = pricing.recommendedSell > 0 && pricing.pricePointCount > 0;
    const limitProfit = maxPrice > 0 && hasMarket ? roundMoney(pricing.safeSell - pricing.safeSell * pricing.feeRate - pricing.packaging - maxPrice) : 0;
    const limitRoi = maxPrice > 0 ? limitProfit / maxPrice * 100 : 0;
    let recommendation = 'Preis prüfen';
    let reason = 'Eine konkrete Angebotsposition inklusive Versand muss noch geprüft werden.';
    if (!productId || !exactVariant) {
      recommendation = 'Druckvariante prüfen';
      reason = 'Ohne eindeutige Cardmarket-Produkt-ID und Druckvariante wird keine Kaufgrenze berechnet.';
    } else if (!hasMarket) {
      recommendation = 'Keine Preisdaten';
      reason = 'Für diese Druckvariante fehlen belastbare Price-Guide-Werte.';
    } else if (stale) {
      recommendation = 'Preisstand erneuern';
      reason = `Der Preisstand ist ${ageDays === null ? 'nicht datiert' : `${ageDays} Tage alt`}.`;
    } else if (!missing) {
      recommendation = 'Sollbestand erreicht';
      reason = 'Der gewünschte Bestand ist bereits vorhanden.';
    } else if (highRisk) {
      recommendation = 'Nicht kaufen';
      reason = 'Banlist- oder Reprint-Risiko ist als hoch markiert.';
    } else if (maxPrice > 0 && maxPrice <= pricing.maxBuy) {
      recommendation = maxPrice <= pricing.maxBuy * 0.82 ? 'Stark kaufen' : 'Kaufgrenze passend';
      reason = `Deine Preisgrenze liegt innerhalb des maximalen vollständigen EK von ${pricing.maxBuy.toFixed(2)} €.`;
    } else if (maxPrice > pricing.maxBuy && pricing.maxBuy > 0) {
      recommendation = 'Preisgrenze senken';
      reason = `Deine Wantlist-Grenze liegt über dem maximalen vollständigen EK von ${pricing.maxBuy.toFixed(2)} €.`;
    }
    const confidence = Math.max(0, Math.min(100, pricing.confidenceScore + (exactVariant ? 20 : 0) + (!stale ? 15 : 0)));
    const needScore = target > 0 ? Math.min(25, missing / Math.max(1, target) * 25) : 0;
    const salesScore = Math.min(20, ownSales * 4);
    const priceScore = hasMarket && !stale ? 20 : hasMarket ? 8 : 0;
    const dealScore = maxPrice > 0 && pricing.maxBuy > 0 ? Math.max(-15, Math.min(20, (pricing.maxBuy - maxPrice) / pricing.maxBuy * 40)) : 0;
    const score = Math.max(0, Math.min(100, Math.round(needScore + salesScore + demandScore * 0.2 + priceScore + dealScore + confidence * 0.15 - (highRisk ? 30 : 0))));
    return {
      ...pricing, exactVariant, target, stock, missing, maxPrice, ownSales, demandScore,
      priceDate, ageDays, stale, hasMarket, highRisk, limitProfit, limitRoi,
      recommendation, reason, confidence, score
    };
  }

  function planMaterialUsageChanges(materials = [], oldUsage = [], newUsage = []) {
    const materialById = new Map(materials.map(material => [String(material.id), material]));
    const deltaById = new Map();
    const addDelta = (usage, direction) => (usage || []).forEach(row => {
      const materialId = String(row.materialId || '');
      const quantity = Math.max(0, asNumber(row.quantity));
      if (!materialId || !quantity) return;
      deltaById.set(materialId, (deltaById.get(materialId) || 0) + quantity * direction);
    });
    addDelta(oldUsage, 1);
    addDelta(newUsage, -1);
    const changes = [];
    const shortages = [];
    for (const [materialId, quantity] of deltaById) {
      const material = materialById.get(materialId);
      if (!material || !quantity) continue;
      const stockBefore = Math.max(0, asNumber(material.stock));
      const stockAfter = stockBefore + quantity;
      if (stockAfter < 0) {
        shortages.push({
          materialId,
          name: material.name || 'Material',
          missing: Math.abs(stockAfter),
          unit: material.unit || 'Stück'
        });
        continue;
      }
      changes.push({ materialId, quantity, stockBefore, stockAfter });
    }
    return { valid: shortages.length === 0, changes, shortages };
  }

  function calculateInventoryBuckets(items = []) {
    const soldItems = items.filter(item => ['Verkauft', 'Storniert'].includes(String(item?.status || '')));
    const currentItems = items.filter(item => !['Verkauft', 'Storniert'].includes(String(item?.status || '')));
    const reservedItems = currentItems.filter(item => String(item?.status || '') === 'Reserviert');
    const unavailableItems = currentItems.filter(item =>
      ['Beschädigt', 'Rückgabe unterwegs'].includes(String(item?.status || ''))
    );
    const availableItems = currentItems.filter(item =>
      !['Reserviert', 'Beschädigt', 'Rückgabe unterwegs'].includes(String(item?.status || ''))
    );
    return {
      total: currentItems.length,
      reserved: reservedItems.length,
      available: availableItems.length,
      unavailable: unavailableItems.length,
      sold: soldItems.length,
      currentItems,
      reservedItems,
      availableItems,
      unavailableItems,
      soldItems
    };
  }

  function planInventoryTotalCorrection(items = [], desiredTotal = 0) {
    const buckets = calculateInventoryBuckets(items);
    const target = Math.max(0, Math.round(asNumber(desiredTotal)));
    if (target < buckets.reserved) {
      return {
        valid: false,
        reason: `Mindestens ${buckets.reserved} reservierte Exemplare müssen im Gesamtbestand bleiben.`,
        target,
        addCount: 0,
        removeIds: [],
        buckets
      };
    }
    const delta = target - buckets.total;
    const removable = buckets.currentItems.filter(item => String(item?.status || '') !== 'Reserviert');
    return {
      valid: delta >= 0 || removable.length >= Math.abs(delta),
      reason: delta < 0 && removable.length < Math.abs(delta) ? 'Es sind nicht genügend freie Exemplare für diese Korrektur vorhanden.' : '',
      target,
      addCount: Math.max(0, delta),
      removeIds: delta < 0 ? removable.slice(0, Math.abs(delta)).map(item => item.id) : [],
      buckets
    };
  }

  function planAvailableInventorySnapshot(items = [], desiredAvailable = 0) {
    const buckets = calculateInventoryBuckets(items);
    const target = Math.max(0, Math.round(asNumber(desiredAvailable)));
    const delta = target - buckets.available;
    return {
      target,
      delta,
      addCount: Math.max(0, delta),
      removeIds: delta < 0 ? buckets.availableItems.slice(0, Math.abs(delta)).map(item => item.id) : [],
      buckets
    };
  }

  function legacyStockSnapshotKey(item = {}) {
    const value = String(item.importKey || item.lotId || '').trim();
    return /^STOCK-/i.test(value) ? value : '';
  }

  function legacyStockVariantKey(item = {}) {
    const productId = String(item.productId || '').replace(/\D/g, '');
    if (!productId) return '';
    return [
      productId,
      String(item.language || '').trim().toUpperCase(),
      String(item.condition || '').trim().toUpperCase()
    ].join('|');
  }

  function legacySnapshotTime(item = {}, sourceKey = '') {
    const keyDate = String(sourceKey).match(/(20\d{2})-(\d{2})-(\d{2})/);
    if (keyDate) return Date.parse(`${keyDate[1]}-${keyDate[2]}-${keyDate[3]}T00:00:00Z`) || 0;
    return Date.parse(item.purchaseDate || item.importedAt || 0) || 0;
  }

  // Aeltere Programmstaende haben komplette Cardmarket-Bestandsexporte addiert.
  // Diese Planung fasst nur eindeutig erkennbare STOCK-Snapshots zusammen. Manuelle,
  // gekaufte, reservierte oder verkaufte Exemplare werden niemals als Altduplikat entfernt.
  function planLegacyStockSnapshotCleanup(items = []) {
    const current = (items || []).filter(item => !['Verkauft', 'Storniert'].includes(String(item?.status || '')));
    const byVariant = new Map();
    const currentByVariant = new Map();
    current.forEach(item => {
      const variantKey = legacyStockVariantKey(item);
      if (variantKey) {
        if (!currentByVariant.has(variantKey)) currentByVariant.set(variantKey, []);
        currentByVariant.get(variantKey).push(item);
      }
      const sourceKey = legacyStockSnapshotKey(item);
      if (!sourceKey || !item?.id) return;
      if (!variantKey) return;
      if (!byVariant.has(variantKey)) byVariant.set(variantKey, []);
      byVariant.get(variantKey).push({ item, sourceKey, time: legacySnapshotTime(item, sourceKey) });
    });

    const groups = [];
    for (const [variantKey, snapshotItems] of byVariant) {
      const sourceKeys = [...new Set(snapshotItems.map(row => row.sourceKey))];
      if (sourceKeys.length < 2) continue;
      const newestKey = sourceKeys.slice().sort((left, right) => {
        const leftRows = snapshotItems.filter(row => row.sourceKey === left);
        const rightRows = snapshotItems.filter(row => row.sourceKey === right);
        const leftTime = Math.max(0, ...leftRows.map(row => row.time));
        const rightTime = Math.max(0, ...rightRows.map(row => row.time));
        return rightTime - leftTime || String(right).localeCompare(String(left));
      })[0];
      const newestQuantity = snapshotItems.filter(row => row.sourceKey === newestKey).length;
      const matchingCurrent = currentByVariant.get(variantKey) || [];
      const protectedCount = matchingCurrent.filter(item =>
        ['Reserviert', 'Rückgabe unterwegs'].includes(String(item.status || '')) || item.saleId
      ).length;
      const nonSnapshotCount = matchingCurrent.filter(item => !legacyStockSnapshotKey(item)).length;
      const target = Math.max(newestQuantity, protectedCount, nonSnapshotCount);
      const removeCount = Math.max(0, matchingCurrent.length - target);
      if (!removeCount) continue;
      const removable = snapshotItems
        .filter(row => !['Reserviert', 'Rückgabe unterwegs'].includes(String(row.item.status || '')) && !row.item.saleId)
        .sort((left, right) => {
          const leftNewest = left.sourceKey === newestKey ? 1 : 0;
          const rightNewest = right.sourceKey === newestKey ? 1 : 0;
          return leftNewest - rightNewest || left.time - right.time || String(left.item.id).localeCompare(String(right.item.id));
        });
      const removeIds = removable.slice(0, removeCount).map(row => row.item.id);
      if (!removeIds.length) continue;
      groups.push({ variantKey, newestKey, newestQuantity, target, sourceKeys, removeIds });
    }
    return {
      groups,
      removeIds: groups.flatMap(group => group.removeIds),
      removedCount: groups.reduce((sum, group) => sum + group.removeIds.length, 0)
    };
  }

  // Ein Cardmarket-Bestandssnapshot beschreibt Inserate, nicht neue physische
  // Karten. Existieren bereits freie Einkaufsexemplare derselben exakten
  // Variante, werden Snapshot-Kopien deshalb auf diese Exemplare zurueckgefuehrt.
  // Reservierte, verkaufte und stornierte Karten werden niemals angefasst.
  function planStockPurchaseDuplicateReconciliation(items = []) {
    const current = Array.isArray(items) ? items : [];
    const isProtected = item => {
      const status = String(item?.status || '');
      return ['Reserviert', 'Verkauft', 'Storniert'].includes(status)
        || /^Besch/i.test(status)
        || /ckgabe unterwegs$/i.test(status)
        || Boolean(item?.saleId);
    };
    const isSnapshot = item => !item?.purchaseId && !item?.purchaseLineKey && (
      Boolean(item?.stockIdentity) || /^STOCK-/i.test(String(item?.importKey || item?.lotId || '')) || item?.source === 'Cardmarket-Bestandsabgleich'
    );
    const keyFor = item => {
      const productId = String(item?.productId || '').replace(/\D/g, '');
      if (!productId) return '';
      const editionText = String(item?.edition || '').trim().toUpperCase();
      const edition = ['', '-', 'N/A', 'UNKNOWN', 'UNBEKANNT'].includes(editionText) ? '' : editionText;
      return [
        productId,
        String(item?.language || '').trim().toUpperCase(),
        String(item?.condition || '').trim().toUpperCase(),
        edition
      ].join('|');
    };
    const snapshotsByVariant = new Map();
    const purchasesByVariant = new Map();
    const itemTime = item => Date.parse(item?.lastStockSnapshot || '') || Date.parse(item?.purchaseDate || '') || 0;
    current.forEach(item => {
      if (!item?.id || isProtected(item)) return;
      const key = keyFor(item);
      if (!key) return;
      if (isSnapshot(item)) {
        if (!snapshotsByVariant.has(key)) snapshotsByVariant.set(key, []);
        snapshotsByVariant.get(key).push(item);
      } else if (item.purchaseId || item.purchaseLineKey) {
        if (!purchasesByVariant.has(key)) purchasesByVariant.set(key, []);
        purchasesByVariant.get(key).push(item);
      }
    });
    const pairs = [];
    snapshotsByVariant.forEach((snapshotItems, variantKey) => {
      const purchaseItems = purchasesByVariant.get(variantKey) || [];
      snapshotItems.sort((a, b) =>
        itemTime(b) - itemTime(a)
        || String(a.id).localeCompare(String(b.id))
      );
      purchaseItems.sort((a, b) =>
        itemTime(a) - itemTime(b)
        || String(a.id).localeCompare(String(b.id))
      );
      snapshotItems.forEach(snapshotItem => {
        const snapshotTime = itemTime(snapshotItem);
        const purchaseIndex = purchaseItems.findIndex(purchaseItem => {
          const purchaseTime = itemTime(purchaseItem);
          return !snapshotTime || !purchaseTime || purchaseTime <= snapshotTime;
        });
        if (purchaseIndex < 0) return;
        const [purchaseItem] = purchaseItems.splice(purchaseIndex, 1);
        pairs.push({ variantKey, targetId: purchaseItem.id, duplicateId: snapshotItem.id });
      });
    });
    return { pairs, removeIds: pairs.map(pair => pair.duplicateId), mergedCount: pairs.length };
  }

  function planInventoryMovementReversal(items = [], movement = {}) {
    const quantity = Math.trunc(asNumber(movement?.quantity));
    if (!movement?.id || !quantity) return { valid: false, reason: 'Diese Bewegung verändert keinen Bestand.' };
    if (movement.cancelledAt || movement.reversalOf) return { valid: false, reason: 'Diese Bewegung ist bereits storniert oder selbst eine Gegenbuchung.' };
    if (!['Bestandskorrektur', 'Manueller Bestand'].includes(String(movement.type || ''))) {
      return { valid: false, reason: 'Automatische Buchungen müssen über den zugehörigen Import oder Auftrag korrigiert werden.' };
    }
    if (quantity < 0) return { valid: true, addCount: Math.abs(quantity), removeIds: [], quantity };
    const buckets = calculateInventoryBuckets(items);
    const preferredIds = new Set(Array.isArray(movement.addedIds) ? movement.addedIds : []);
    const removable = buckets.availableItems.slice().sort((left, right) =>
      Number(preferredIds.has(right.id)) - Number(preferredIds.has(left.id)) ||
      String(right.purchaseDate || '').localeCompare(String(left.purchaseDate || ''))
    );
    if (removable.length < quantity) {
      return { valid: false, reason: `Es sind nur ${removable.length} freie Exemplare vorhanden. Reservierte oder verkaufte Karten werden nicht entfernt.` };
    }
    return { valid: true, addCount: 0, removeIds: removable.slice(0, quantity).map(item => item.id), quantity };
  }

  const realizedSale = sale => ['Abgeschlossen', 'Abgerechnet', 'Erstattet', 'Rückgabe eingetroffen'].includes(String(sale?.status || ''));

  const cashSale = sale => ['Bezahlt', 'Kommissioniert', 'Verpackt', 'Versendet', 'Abgeschlossen', 'Abgerechnet', 'Erstattet', 'Rückgabe eingetroffen'].includes(String(sale?.status || ''));

  function purchaseBusinessCost(purchase = {}) {
    if (String(purchase.status || '') === 'Storniert') return 0;
    if (!Array.isArray(purchase.pendingItems) || !purchase.pendingItems.length) {
      return roundMoney(Math.max(0, asNumber(purchase.cardValue) + asNumber(purchase.shipping) + asNumber(purchase.extra) - asNumber(purchase.refund)));
    }
    const ownership = purchaseOwnershipTotals(purchase, purchase.costAllocationMethod || 'value');
    return roundMoney(asNumber(ownership.business) + asNumber(ownership.damaged));
  }

  const entryDate = (...values) => {
    for (const value of values) {
      const text = String(value || '').trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
      const parsed = Date.parse(text);
      if (Number.isFinite(parsed)) return new Date(parsed).toISOString().slice(0, 10);
    }
    return '';
  };

  function buildFinancialLedger(state = {}) {
    const settings = state.settings || {};
    const entries = [];
    const push = row => entries.push({
      cashIn: 0, cashOut: 0, realizedRevenue: 0, directCost: 0,
      realizedProfit: 0, overhead: 0, ...row
    });

    (state.sales || []).forEach(sale => {
      if (!cashSale(sale) || String(sale.status || '') === 'Storniert') return;
      const result = calculateSaleProfit(sale, settings);
      const cashDate = entryDate(sale.paidDate, sale.date, sale.completedDate);
      push({
        id: `sale:${sale.id || sale.orderNo}:receipt`, sourceType: 'sale', sourceId: sale.id || '',
        category: 'sale_receipt', date: cashDate, label: `Verkauf ${sale.orderNo || ''}`.trim(),
        cashIn: result.gross, quality: result.quality
      });
      if (result.refund) push({
        id: `sale:${sale.id || sale.orderNo}:refund`, sourceType: 'sale', sourceId: sale.id || '',
        category: 'customer_refund', date: entryDate(sale.refundDate, cashDate), label: `Erstattung ${sale.orderNo || ''}`.trim(),
        cashOut: result.refund, quality: result.quality
      });
      if (result.fee) push({
        id: `sale:${sale.id || sale.orderNo}:fee`, sourceType: 'sale', sourceId: sale.id || '',
        category: 'sale_fee', date: entryDate(sale.settledDate, cashDate), label: `Gebühr ${sale.orderNo || ''}`.trim(),
        cashOut: result.fee, quality: result.sourceQuality.fee
      });
      if (result.postage) push({
        id: `sale:${sale.id || sale.orderNo}:postage`, sourceType: 'sale', sourceId: sale.id || '',
        category: 'sale_postage', date: entryDate(sale.shippedDate, cashDate), label: `Porto ${sale.orderNo || ''}`.trim(),
        cashOut: result.postage, quality: result.sourceQuality.postage
      });
      if (realizedSale(sale)) push({
        id: `sale:${sale.id || sale.orderNo}:result`, sourceType: 'sale', sourceId: sale.id || '',
        category: 'realized_sale', date: entryDate(sale.completedDate, sale.settledDate, sale.date),
        label: `Realisierter Verkauf ${sale.orderNo || ''}`.trim(),
        realizedRevenue: result.profitKnown ? result.netRevenue : 0,
        directCost: result.profitKnown ? result.fee + result.postage + result.packaging + result.cost : 0,
        realizedProfit: result.profitKnown ? result.profit : 0, quality: result.quality,
        excludedFromProfit: !result.profitKnown
      });
    });

    (state.purchases || []).forEach(purchase => {
      const amount = purchaseBusinessCost(purchase);
      if (!amount) return;
      push({
        id: `purchase:${purchase.id || purchase.orderNo}`, sourceType: 'purchase', sourceId: purchase.id || '',
        category: 'card_purchase', date: entryDate(purchase.paidDate, purchase.date),
        label: `Einkauf ${purchase.orderNo || ''}`.trim(), cashOut: amount,
        quality: Array.isArray(purchase.pendingItems) && purchase.pendingItems.length ? 'allocated' : 'estimated'
      });
    });

    (state.expenses || []).forEach(expense => {
      if (String(expense.status || '') === 'Storniert') return;
      const amount = Math.max(0, asNumber(expense.amount));
      if (!amount) return;
      const materialPurchase = String(expense.category || '').toLocaleLowerCase('de-DE') === 'versandmaterial';
      const direct = Boolean(expense.saleId) || String(expense.costType || '') === 'direct';
      const linkedSale = direct && expense.saleId ? (state.sales || []).find(sale => String(sale.id || '') === String(expense.saleId)) : null;
      const realizedDirectCost = linkedSale && realizedSale(linkedSale) ? amount : 0;
      push({
        id: `expense:${expense.id || expense.description}`, sourceType: 'expense', sourceId: expense.id || '',
        category: materialPurchase ? 'material_purchase' : direct ? 'direct_expense' : 'overhead',
        date: entryDate(expense.paidDate, expense.date), label: expense.description || expense.category || 'Ausgabe',
        cashOut: amount, overhead: materialPurchase || direct ? 0 : amount,
        directCost: realizedDirectCost, realizedProfit: -realizedDirectCost,
        quality: expense.sourceType === 'automatic' ? 'exact' : 'manual'
      });
    });
    return entries;
  }

  function buildFinancialSummary(state = {}, { from = '', to = '' } = {}) {
    const allEntries = buildFinancialLedger(state);
    const entries = allEntries.filter(row => (!from || row.date >= from) && (!to || row.date <= to));
    const sum = field => roundMoney(entries.reduce((total, row) => total + asNumber(row[field]), 0));
    const cashIn = sum('cashIn');
    const cashOut = sum('cashOut');
    const realizedRevenue = sum('realizedRevenue');
    const directCost = sum('directCost');
    const realizedProfit = sum('realizedProfit');
    const overhead = sum('overhead');
    const byCategory = {};
    entries.forEach(row => {
      const current = byCategory[row.category] || { cashIn: 0, cashOut: 0, realizedProfit: 0, overhead: 0 };
      for (const field of Object.keys(current)) current[field] = roundMoney(current[field] + asNumber(row[field]));
      byCategory[row.category] = current;
    });
    return {
      entries, cashIn, cashOut, cashflow: roundMoney(cashIn - cashOut),
      realizedRevenue, directCost, realizedProfit, overhead,
      operatingResult: roundMoney(realizedProfit - overhead), byCategory
    };
  }

  function buildPerformanceReport(state = {}, optionsOrNow = {}) {
    const options = optionsOrNow instanceof Date ? { now: optionsOrNow } : (optionsOrNow || {});
    const now = options.now instanceof Date ? options.now : new Date(options.now || Date.now());
    const inPeriod = value => {
      const date = entryDate(value);
      return (!options.from || date >= options.from) && (!options.to || date <= options.to);
    };
    const settings = state.settings || {};
    const cardMap = new Map();
    const setMap = new Map();
    const customerMap = new Map();
    const sellerMap = new Map();
    const add = (map, key, patch) => {
      const safeKey = String(key || 'Unbekannt').trim() || 'Unbekannt';
      const current = map.get(safeKey) || { name: safeKey, orders: 0, cards: 0, revenue: 0, cost: 0, profit: 0 };
      for (const [field, value] of Object.entries(patch)) current[field] = asNumber(current[field]) + asNumber(value);
      map.set(safeKey, current);
    };

    (state.sales || []).filter(sale => realizedSale(sale) && inPeriod(sale.completedDate || sale.settledDate || sale.date)).forEach(sale => {
      const result = calculateSaleProfit(sale, settings);
      if (!result.profitKnown) return;
      add(customerMap, sale.customer, { orders: 1, cards: sale.quantity, revenue: result.netRevenue, cost: result.cost, profit: result.profit });
      const items = Array.isArray(sale.items) && sale.items.length ? sale.items : [{
        name: sale.cardNames || 'Sammelverkauf', set: 'Ohne Set', quantity: Math.max(1, asNumber(sale.quantity)),
        unitPrice: result.cardValue / Math.max(1, asNumber(sale.quantity))
      }];
      const lineTotal = items.reduce((sum, item) => sum + Math.max(0, asNumber(item.quantity) || 1) * Math.max(0, asNumber(item.unitPrice)), 0);
      items.forEach(item => {
        const quantity = Math.max(1, asNumber(item.quantity));
        const lineRevenue = quantity * asNumber(item.unitPrice);
        const share = lineTotal > 0 ? lineRevenue / lineTotal : quantity / Math.max(1, items.reduce((sum, row) => sum + Math.max(1, asNumber(row.quantity)), 0));
        const values = { orders: 1, cards: quantity, revenue: result.netRevenue * share, cost: result.cost * share, profit: result.profit * share };
        add(cardMap, item.name, values);
        add(setMap, item.set || item.setName || 'Ohne Set', values);
      });
    });

    (state.purchases || []).filter(purchase => purchase.status !== 'Storniert' && inPeriod(purchase.paidDate || purchase.date)).forEach(purchase => {
      const hasLines = Array.isArray(purchase.pendingItems) && purchase.pendingItems.length;
      const ownership = hasLines ? purchaseOwnershipTotals(purchase) : null;
      const total = hasLines
        ? asNumber(ownership.business) + asNumber(ownership.damaged)
        : Math.max(0, asNumber(purchase.cardValue) + asNumber(purchase.shipping) + asNumber(purchase.extra) - asNumber(purchase.refund));
      const cards = hasLines
        ? purchase.pendingItems.reduce((sum, item, index) => { const receipt = normalizePurchaseReceiptLine(item, index); return sum + receipt.business + receipt.damaged; }, 0)
        : asNumber(purchase.items);
      if (total > 0 || cards > 0) add(sellerMap, purchase.seller, { orders: 1, cards, cost: total });
    });

    const nowTime = new Date(now).getTime();
    const stockMap = new Map();
    (state.inventory || []).filter(item => !['Verkauft', 'Storniert'].includes(item.status)).forEach(item => {
      const key = `${item.name || 'Unbekannt'}|${item.set || ''}|${item.rarity || ''}`;
      const row = stockMap.get(key) || { name: item.name || 'Unbekannt', set: item.set || '', rarity: item.rarity || '', quantity: 0, value: 0, ageTotal: 0, oldestDays: 0 };
      const purchaseTime = new Date(item.purchaseDate || now).getTime();
      const age = Number.isFinite(purchaseTime) ? Math.max(0, Math.floor((nowTime - purchaseTime) / 86400000)) : 0;
      row.quantity += 1;
      row.value += asNumber(item.cost);
      row.ageTotal += age;
      row.oldestDays = Math.max(row.oldestDays, age);
      stockMap.set(key, row);
    });

    const sortProfit = map => [...map.values()].map(row => ({ ...row, roi: row.cost > 0 ? row.profit / row.cost * 100 : 0 })).sort((a, b) => b.profit - a.profit);
    return {
      cards: sortProfit(cardMap),
      sets: sortProfit(setMap),
      customers: sortProfit(customerMap),
      sellers: [...sellerMap.values()].map(row => ({ ...row, averageOrder: row.orders ? row.cost / row.orders : 0 })).sort((a, b) => b.cost - a.cost),
      stockAge: [...stockMap.values()].map(row => ({ ...row, averageDays: row.quantity ? Math.round(row.ageTotal / row.quantity) : 0 })).sort((a, b) => b.oldestDays - a.oldestDays)
    };
  }

  function buildDataQualityIssues(state = {}, now = new Date()) {
    const issues = [];
    const push = (severity, category, title, details, target = '', action = '', recordId = '', searchTerm = '') => issues.push({ severity, category, title, details, target, action, recordId, searchTerm });
    const duplicateOrders = (rows, label) => {
      const counts = new Map();
      rows.forEach(row => { const key = String(row.orderNo || '').trim(); if (key) counts.set(key, (counts.get(key) || 0) + 1); });
      [...counts].filter(([, count]) => count > 1).forEach(([orderNo, count]) => push('error', 'Duplikat', `${label} ${orderNo} ist ${count}× vorhanden`, 'Bestellnummern sollten eindeutig sein.', label === 'Einkauf' ? 'purchases' : 'sales', '', '', orderNo));
    };
    duplicateOrders(state.purchases || [], 'Einkauf');
    duplicateOrders(state.sales || [], 'Verkauf');

    const missingInventoryIds = (state.inventory || []).filter(item => !String(item.productId || '').match(/\d/)).length;
    if (missingInventoryIds) push('warning', 'Kartenzuordnung', `${missingInventoryIds} Bestandskarte(n) ohne Cardmarket-ID`, 'Marktpreise und Druckvarianten können dafür nicht sicher zugeordnet werden.', 'inventory', 'repairInventory');
    const missingPurchaseIds = (state.purchases || []).flatMap(row => row.pendingItems || []).filter(item => !String(item.productId || '').match(/\d/)).length;
    if (missingPurchaseIds) push('warning', 'Kartenzuordnung', `${missingPurchaseIds} Einkaufsposition(en) ohne Cardmarket-ID`, 'Bitte die Quelldatei oder Zuordnung prüfen.', 'purchases', 'repairPurchases');

    const incompletePurchasePrints = (state.purchases || []).flatMap(row => row.pendingItems || []).filter(item =>
      String(item.productId || '').match(/\d/) && (!String(item.set || item.setName || '').trim() || !String(item.collectorNumber || '').trim() || !String(item.rarity || '').trim())
    ).length;
    if (incompletePurchasePrints) push('warning', 'Druckvariante', `${incompletePurchasePrints} Einkaufsposition(en) mit unvollständigen Druckdaten`, 'Set, Setnummer und Seltenheit vor dem Wareneingang prüfen.', 'purchases', 'repairPurchases');
    const unassignedPurchaseUnits = (state.purchases || []).flatMap(row => row.pendingItems || []).reduce((sum, item, index) =>
      sum + normalizePurchaseReceiptLine(item, index).open, 0
    );
    if (unassignedPurchaseUnits) push('info', 'Wareneingang', `${unassignedPurchaseUnits} gekaufte Karte(n) noch nicht aufgeteilt`, 'Beim Eintreffen zwischen Geschäftsbestand, Privatsammlung, beschädigt und storniert aufteilen.', 'purchases');
    const privateWithoutCost = (state.privateCollection || []).filter(item => asNumber(item.cost) <= 0).length;
    if (privateWithoutCost) push('info', 'Privatsammlung', `${privateWithoutCost} private Karte(n) ohne Einstand`, 'Der private Einstand beeinflusst keine Geschäftsauswertung.', 'private');

    (state.sales || []).forEach(sale => {
      const historicalResolution = ['confirmed', 'unknown', 'linked'].includes(String(sale.historicalCostStatus || '').toLowerCase());
      if (realizedSale(sale) && String(sale.status || '') !== 'Rückgabe eingetroffen' && asNumber(sale.quantity) > 0 && asNumber(sale.cost) <= 0 && !historicalResolution) push('warning', 'Kalkulation', `Verkauf ${sale.orderNo || 'ohne Nummer'} ohne Wareneinsatz`, 'Wareneinsatz nachtragen oder ausdrücklich als unbekannt bestätigen.', 'sales', 'repairSaleCost', String(sale.id || ''));
      if (['Versendet', 'Abgeschlossen'].includes(sale.status) && asNumber(sale.postage) <= 0) push('info', 'Versand', `Verkauf ${sale.orderNo || 'ohne Nummer'} ohne tatsächliches Porto`, 'Falls Porto angefallen ist, bitte den wirklich bezahlten Betrag ergänzen.', 'sales', '', '', sale.orderNo || sale.customer || '');
      if (asNumber(sale.shippingPaid) > asNumber(sale.revenue)) push('error', 'Kalkulation', `Versandbetrag bei ${sale.orderNo || 'Verkauf'} ist höher als die Einnahme`, 'Einnahme und Käufer-Versand prüfen.', 'sales', '', '', sale.orderNo || sale.customer || '');
      const detailedItems = sale.items || [];
      const requested = detailedItems.length ? detailedItems.reduce((sum, item) => sum + wholeQuantity(item.quantity), 0) : wholeQuantity(sale.quantity);
      const linked = new Set(sale.itemIds || []).size;
      if (realizedSale(sale) && requested > 0 && !detailedItems.length) push('warning', 'Verkaufspositionen', `Verkauf ${sale.orderNo || 'ohne Nummer'} enthält nur einen Sammeltext`, 'Karten einzeln ergänzen, damit Druckvariante, VK und Wareneinsatz lernfähig werden.', 'sales', '', '', sale.orderNo || sale.customer || '');
      if (requested > linked && String(sale.status || '') !== 'Rückgabe eingetroffen' && !historicalResolution) push('warning', 'Bestandszuordnung', `Verkauf ${sale.orderNo || 'ohne Nummer'}: ${requested - linked} Karte(n) ohne Einkaufslos`, 'Einkaufsexemplare zuordnen oder den historischen Wareneinsatz bestätigen.', 'sales', 'repairSaleCost', String(sale.id || ''));
    });

    const lastPrice = state.sync?.lastPriceUpdate || '';
    const age = lastPrice ? Math.floor((new Date(now).getTime() - new Date(lastPrice).getTime()) / 86400000) : Infinity;
    if (!Number.isFinite(age) || age > 2) push('warning', 'Marktdaten', lastPrice ? `Price Guide ist ${age} Tage alt` : 'Noch kein Price Guide gespeichert', 'Aktuelle Marktdaten verbessern Warnungen und Preisvorschläge.', 'imports');
    (state.reconciliations || []).filter(row => asNumber(row.unmatched) > 0).forEach(row => push('warning', 'Abgleich', `${row.unmatched} nicht zugeordnete Buchung(en) in ${row.file || 'Abrechnung'}`, 'Bestellnummern im Abgleich prüfen.', 'reports'));
    return issues;
  }

  function buildPriceAlerts(state = {}, now = new Date()) {
    const alerts = [];
    const threshold = Math.max(1, asNumber(state.settings?.priceAgeDays) || 7);
    const nowTime = new Date(now).getTime();
    const inventoryGroups = new Map();
    (state.inventory || []).filter(item => !['Verkauft', 'Storniert'].includes(item.status)).forEach(item => {
      const key = String(item.productId || `${item.name || ''}|${item.set || item.setName || ''}|${item.rarity || ''}`);
      if (!inventoryGroups.has(key)) inventoryGroups.set(key, []);
      inventoryGroups.get(key).push(item);
    });
    inventoryGroups.forEach(items => {
      const first = items[0] || {};
      const belowCost = items.filter(item => item.listed && asNumber(item.listingPrice) > 0 && asNumber(item.listingPrice) < asNumber(item.cost));
      if (belowCost.length) {
        const lowestListing = Math.min(...belowCost.map(item => asNumber(item.listingPrice)));
        const highestCost = Math.max(...belowCost.map(item => asNumber(item.cost)));
        alerts.push({ severity: 'error', type: 'Verlustpreis', title: first.name || 'Unbekannte Karte', details: `${belowCost.length} Exemplar(e): Inserat ab ${lowestListing.toFixed(2)} € liegt unter EK bis ${highestCost.toFixed(2)} €.`, target: 'inventory', searchTerm: first.productId || first.name || '' });
      }
      const oldUnlisted = items.map(item => {
        const purchaseTime = new Date(item.purchaseDate || now).getTime();
        return { item, days: Number.isFinite(purchaseTime) ? Math.floor((nowTime - purchaseTime) / 86400000) : 0 };
      }).filter(row => row.days > threshold * 4 && row.item.listed === false);
      if (oldUnlisted.length) alerts.push({ severity: 'warning', type: 'Lageralter', title: first.name || 'Unbekannte Karte', details: `${oldUnlisted.length} Exemplar(e) bis zu ${Math.max(...oldUnlisted.map(row => row.days))} Tage im Bestand und nicht inseriert.`, target: 'inventory', searchTerm: first.productId || first.name || '' });
    });
    (state.watchlist || []).filter(item => !item.archived).forEach(item => {
      const trend = asNumber(item.trend);
      const avg30 = asNumber(item.avg30);
      if (trend > 0 && avg30 > 0 && trend < avg30 * 0.88) alerts.push({ severity: 'warning', type: 'Preisrückgang', title: item.name || 'Watchlist-Karte', details: `Trend liegt ${Math.round((1 - trend / avg30) * 100)} % unter dem 30-Tage-Schnitt.`, target: 'watchlist', searchTerm: item.productId || item.name || '' });
      if (trend > 0 && avg30 > 0 && trend > avg30 * 1.15) alerts.push({ severity: 'info', type: 'Preisanstieg', title: item.name || 'Watchlist-Karte', details: `Trend liegt ${Math.round((trend / avg30 - 1) * 100)} % über dem 30-Tage-Schnitt.`, target: 'watchlist', searchTerm: item.productId || item.name || '' });
    });
    return alerts;
  }

  function buildWorkflowStatus(state = {}) {
    const purchases = state.purchases || [];
    const sales = state.sales || [];
    return {
      purchasesInTransit: purchases.filter(row => row.status === 'Unterwegs').length,
      purchasesReady: purchases.filter(row => ['Eingetroffen', 'Teilweise eingetroffen'].includes(row.status) &&
        (row.pendingItems || []).some((item, index) => normalizePurchaseReceiptLine(item, index).open > 0)).length,
      salesOpen: sales.filter(row => ['Offen', 'Bezahlt'].includes(row.status)).length,
      salesToPack: sales.filter(row => ['Kommissioniert', 'Verpackt'].includes(row.status) || ['Kommissioniert', 'Verpackt'].includes(row.workflowStage)).length,
      salesShipped: sales.filter(row => row.status === 'Versendet').length
    };
  }

  function settlementValue(row) {
    const direct = pick(row, ['amount', 'betrag', 'value', 'total', 'payout', 'auszahlung', 'credit', 'gutschrift', 'balance change', 'kontobewegung']);
    if (direct !== '') return asNumber(direct);
    const credit = asNumber(pick(row, ['haben', 'eingang', 'income']));
    const debit = asNumber(pick(row, ['soll', 'ausgang', 'expense']));
    return credit - debit;
  }

  function reconcileSettlementRows(rows = [], state = {}) {
    const salesByOrder = new Map((state.sales || []).map(sale => [String(sale.orderNo || '').replace(/\D/g, ''), sale]));
    const sourceEntries = rows.map((source, index) => {
      const orderNo = String(pick(source, ['orderNo', 'orderId', 'bestellnummer', 'bestellung', 'idOrder', 'reference', 'referenz', 'description', 'beschreibung']) || '').match(/\d{6,}/)?.[0] || '';
      const amount = settlementValue(source);
      return {
        row: index + 2,
        orderNo,
        date: String(pick(source, ['date', 'datum', 'createdAt', 'buchungsdatum']) || ''),
        description: String(pick(source, ['description', 'beschreibung', 'type', 'typ']) || ''),
        amount
      };
    });
    const groups = new Map();
    sourceEntries.forEach(entry => {
      // Mehrere Cardmarket-Kontobewegungen können zu derselben Bestellung
      // gehören (z. B. Verkaufsgutschrift und separate Gebühr).
      const key = entry.orderNo || `row:${entry.row}`;
      const group = groups.get(key) || { ...entry, sourceRows: [], amount: 0, descriptions: [] };
      group.sourceRows.push(entry.row);
      group.amount += entry.amount;
      if (entry.description && !group.descriptions.includes(entry.description)) group.descriptions.push(entry.description);
      if (!group.date && entry.date) group.date = entry.date;
      groups.set(key, group);
    });
    const entries = [...groups.values()].map(group => {
      const sale = salesByOrder.get(group.orderNo);
      const expectedGross = sale ? asNumber(sale.revenue) : 0;
      const expectedFee = sale ? calculateSaleProfit(sale, state.settings || {}).fee : 0;
      const expectedPayout = expectedGross - expectedFee;
      return {
        row: group.row,
        sourceRows: group.sourceRows,
        orderNo: group.orderNo,
        date: group.date,
        description: group.descriptions.join(' · '),
        amount: group.amount,
        matchedSaleId: sale?.id || '',
        expectedPayout,
        difference: sale ? group.amount - expectedPayout : group.amount
      };
    });
    const matched = entries.filter(row => row.matchedSaleId).length;
    const unmatched = entries.length - matched;
    const difference = entries.filter(row => row.matchedSaleId).reduce((sum, row) => sum + row.difference, 0);
    return { entries, rows: rows.length, matched, unmatched, difference };
  }

  function mergeInventorySnapshot(existing = {}, snapshot = {}) {
    const merged = { ...existing, ...snapshot };
    // Bestandsimporte duerfen Markt-/Druckdaten aktualisieren, aber niemals
    // betriebliche Herkunft, EK oder die manuell gepflegte Preisstrategie.
    [
      'id', 'purchaseId', 'purchaseLineKey', 'purchaseDate', 'saleId', 'saleOrderNo', 'saleDate',
      'cost', 'costStatus', 'originalTargetSell', 'holdingProfile', 'longTermHold',
      'listingHistory', 'ownership', 'movementRecorded'
    ].forEach(field => {
      if (Object.prototype.hasOwnProperty.call(existing, field)) merged[field] = existing[field];
    });
    return merged;
  }

  const HOLDING_PROFILES = Object.freeze([
    'META / STAPLE', 'DECK / ENGINE', 'RETRO', 'COLLECTOR / ICONIC',
    'HIGH RARITY', 'VINTAGE', 'NICHE', 'BULK', 'UNKLASSIFIZIERT'
  ]);

  function normalizeHoldingProfile(value) {
    const input = String(value || '').trim().toLocaleUpperCase('de-DE');
    const aliases = {
      META: 'META / STAPLE', STAPLE: 'META / STAPLE', QUICK: 'META / STAPLE',
      DECK: 'DECK / ENGINE', ENGINE: 'DECK / ENGINE',
      COLLECTOR: 'COLLECTOR / ICONIC', ICONIC: 'COLLECTOR / ICONIC',
      LONG_TERM: 'UNKLASSIFIZIERT', STANDARD: 'UNKLASSIFIZIERT'
    };
    const candidate = aliases[input] || input;
    return HOLDING_PROFILES.includes(candidate) ? candidate : 'UNKLASSIFIZIERT';
  }

  function ageInDays(value, asOf = new Date()) {
    if (!value) return null;
    const calendarStamp = input => {
      if (typeof input === 'string') {
        const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      }
      const date = new Date(input);
      if (Number.isNaN(date.getTime())) return null;
      return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    };
    const startStamp = calendarStamp(value);
    const endStamp = calendarStamp(asOf);
    if (startStamp == null || endStamp == null) return null;
    // Kalenderalter statt Stundenalter: Sommer-/Winterzeit darf keinen Tag abziehen.
    return Math.max(0, Math.floor((endStamp - startStamp) / 86400000));
  }

  function listingStartDate(item = {}) {
    // Baselines und Importzeitpunkte sind keine belegte Erstinserierung.
    const dates = (item.listingHistory || [])
      .filter(row => row && row.eventType === 'first_listing' && row.changedAt)
      .map(row => new Date(row.changedAt))
      .filter(date => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);
    return dates[0] ? dates[0].toISOString() : null;
  }

  function inventoryStartDate(item = {}) {
    if (item.receivedAt) return item.receivedAt;
    if (!item.purchaseDate || item.inventoryDateQuality === 'unknown') return null;
    const source = `${item.source || ''} ${item.importKey || ''} ${item.lotId || ''}`;
    const snapshotOnly = !item.purchaseId && /bestandsabgleich|cardmarket[-_ ]?stock|bestandssnapshot|stock-snapshot|\bSTOCK-/i.test(source);
    return snapshotOnly ? null : item.purchaseDate;
  }

  function agingBucket(days, settings = {}) {
    if (days == null || !Number.isFinite(Number(days))) return { key: 'unknown', label: 'Alter unbekannt', status: 'ALTER UNBEKANNT' };
    const fresh = Number(settings.agingFreshMaxDays ?? 14);
    const observe = Number(settings.agingObserveMaxDays ?? 30);
    const review = Number(settings.agingReviewMaxDays ?? 45);
    const capital = Number(settings.agingCapitalMaxDays ?? 60);
    const slow = Number(settings.agingSlowMaxDays ?? 90);
    if (days <= fresh) return { key: '0-14', label: `0–${fresh} Tage`, status: 'FRISCH' };
    if (days <= observe) return { key: '15-30', label: `${fresh + 1}–${observe} Tage`, status: 'BEOBACHTEN' };
    if (days <= review) return { key: '31-45', label: `${observe + 1}–${review} Tage`, status: 'PRÜFEN' };
    if (days <= capital) return { key: '46-60', label: `${review + 1}–${capital} Tage`, status: 'KAPITALBINDUNG' };
    if (days <= slow) return { key: '61-90', label: `${capital + 1}–${slow} Tage`, status: 'LANGSAMDREHER' };
    return { key: '90+', label: `Über ${slow} Tage`, status: 'ENTSCHEIDUNG ERFORDERLICH' };
  }

  function priceGroup(value, settings = {}) {
    const price = Math.max(0, asNumber(value));
    const a = Number(settings.priceGroupAFrom ?? 5);
    const b = Number(settings.priceGroupBFrom ?? 1);
    const c = Number(settings.priceGroupCFrom ?? 0.20);
    if (price >= a) return { key: 'A', label: `A · ab ${a.toFixed(2)} €` };
    if (price >= b) return { key: 'B', label: `B · ${b.toFixed(2)}–${(a - 0.01).toFixed(2)} €` };
    if (price >= c) return { key: 'C', label: `C · ${c.toFixed(2)}–${(b - 0.01).toFixed(2)} €` };
    return { key: 'D', label: `D · unter ${c.toFixed(2)} €` };
  }

  function marketReferenceValue(market = {}) {
    return calculateAutomaticPriceTargets(market, {}).marketReference || 0;
  }

  const MARKET_DECISION_THRESHOLDS = Object.freeze({
    trendStablePercent: 3,
    trendDirectionalPercent: 6,
    trendStrongPercent: 15,
    priceNearPercent: 5,
    priceFarPercent: 20,
    historyMinPoints: 3,
    historyMaxGapDays: 7,
    outlierPercent: 250
  });

  function marketDecisionThresholds(settings = {}) {
    const stable = Math.max(0, asNumber(settings.marketTrendStablePercent ?? MARKET_DECISION_THRESHOLDS.trendStablePercent));
    const directional = Math.max(stable, asNumber(settings.marketTrendDirectionalPercent ?? MARKET_DECISION_THRESHOLDS.trendDirectionalPercent));
    const strong = Math.max(directional, asNumber(settings.marketTrendStrongPercent ?? MARKET_DECISION_THRESHOLDS.trendStrongPercent));
    const near = Math.max(0, asNumber(settings.marketPriceNearPercent ?? MARKET_DECISION_THRESHOLDS.priceNearPercent));
    return {
      trendStablePercent: stable,
      trendDirectionalPercent: directional,
      trendStrongPercent: strong,
      priceNearPercent: near,
      priceFarPercent: Math.max(near, asNumber(settings.marketPriceFarPercent ?? MARKET_DECISION_THRESHOLDS.priceFarPercent)),
      historyMinPoints: Math.max(2, Math.round(asNumber(settings.marketHistoryMinPoints ?? MARKET_DECISION_THRESHOLDS.historyMinPoints))),
      historyMaxGapDays: Math.max(0, Math.round(asNumber(settings.marketHistoryMaxGapDays ?? MARKET_DECISION_THRESHOLDS.historyMaxGapDays))),
      outlierPercent: MARKET_DECISION_THRESHOLDS.outlierPercent
    };
  }

  function marketCalendarStamp(value) {
    if (!value) return null;
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function historyReference(row = {}, settings = {}) {
    const calculated = calculateAutomaticPriceTargets(row, settings);
    return { value: calculated.marketReference || 0, source: calculated.marketReferenceSource };
  }

  function normalizeMarketHistory(history = [], settings = {}) {
    const byDate = new Map();
    (history || []).forEach(row => {
      const date = String(row?.date || row?.capturedDate || row?.captured_date || '').slice(0, 10);
      const stamp = marketCalendarStamp(date);
      if (stamp == null) return;
      const reference = historyReference(row, settings);
      if (!(reference.value > 0)) return;
      byDate.set(date, { ...row, date, stamp, reference: reference.value, referenceSource: reference.source });
    });
    return [...byDate.values()].sort((a, b) => a.stamp - b.stamp);
  }

  function nearestHistoricalPoint(points = [], targetDate, options = {}) {
    const targetStamp = marketCalendarStamp(targetDate);
    if (targetStamp == null || !points.length) return null;
    const latestStamp = options.latestStamp == null ? Number.POSITIVE_INFINITY : options.latestStamp;
    const candidates = points.filter(point => point.stamp <= latestStamp);
    if (!candidates.length) return null;
    let nearest = candidates[0];
    let distance = Math.abs(nearest.stamp - targetStamp);
    candidates.slice(1).forEach(point => {
      const nextDistance = Math.abs(point.stamp - targetStamp);
      if (nextDistance < distance || (nextDistance === distance && point.stamp < nearest.stamp)) {
        nearest = point;
        distance = nextDistance;
      }
    });
    const gapDays = Math.round(distance / 86400000);
    if (options.maxGapDays != null && gapDays > options.maxGapDays) return null;
    return { ...nearest, targetDate: new Date(targetStamp).toISOString().slice(0, 10), gapDays, exact: gapDays === 0 };
  }

  function marketChange(currentValue, historicalPoint) {
    const current = optionalNumber(currentValue);
    const previous = optionalNumber(historicalPoint?.reference);
    if (!(current > 0) || !(previous > 0)) return { available: false, absolute: null, percent: null, point: historicalPoint || null };
    const absolute = roundMoney(current - previous);
    return { available: true, absolute, percent: roundMoney(absolute / previous * 100), point: historicalPoint };
  }

  function classifyMarketTrend(changes = {}, dataQuality = 'UNZUREICHEND', settings = {}) {
    const thresholds = marketDecisionThresholds(settings);
    const periods = [
      { key: 'day1', weight: 0.15 },
      { key: 'day7', weight: 0.35 },
      { key: 'day30', weight: 0.50 }
    ].map(period => ({ ...period, value: changes[period.key]?.percent }))
      .filter(period => Number.isFinite(period.value));
    const usable = periods.filter(period => Math.abs(period.value) <= thresholds.outlierPercent);
    const outlierCount = periods.length - usable.length;
    if (dataQuality === 'UNZUREICHEND' || usable.length < 2) {
      return { status: 'UNZUREICHENDE DATEN', weightedPercent: null, periods: usable.length, outlierCount };
    }
    const totalWeight = usable.reduce((sum, period) => sum + period.weight, 0);
    const weightedPercent = usable.reduce((sum, period) => sum + period.value * period.weight, 0) / totalWeight;
    const rising = usable.filter(period => period.value > thresholds.trendStablePercent).length;
    const falling = usable.filter(period => period.value < -thresholds.trendStablePercent).length;
    let status = 'STABIL';
    if (weightedPercent >= thresholds.trendStrongPercent && rising >= 2) status = 'STARK STEIGEND';
    else if (weightedPercent <= -thresholds.trendStrongPercent && falling >= 2) status = 'STARK FALLEND';
    else if (weightedPercent >= thresholds.trendDirectionalPercent || rising >= 2) status = 'STEIGEND';
    else if (weightedPercent <= -thresholds.trendDirectionalPercent || falling >= 2) status = 'FALLEND';
    return { status, weightedPercent: roundMoney(weightedPercent), periods: usable.length, outlierCount };
  }

  function classifyPricePosition(currentPrice, referencePrice, settings = {}) {
    const current = optionalNumber(currentPrice);
    const reference = optionalNumber(referencePrice);
    if (!(current > 0) || !(reference > 0)) return { status: 'NICHT BERECHENBAR', difference: null, percent: null };
    const thresholds = marketDecisionThresholds(settings);
    const difference = roundMoney(current - reference);
    const percent = roundMoney(difference / reference * 100);
    let status = 'IM REFERENZBEREICH';
    if (percent < -thresholds.priceFarPercent) status = 'DEUTLICH UNTER REFERENZ';
    else if (percent < -thresholds.priceNearPercent) status = 'UNTER REFERENZ';
    else if (percent > thresholds.priceFarPercent) status = 'DEUTLICH ÜBER REFERENZ';
    else if (percent > thresholds.priceNearPercent) status = 'ÜBER REFERENZ';
    return { status, difference, percent };
  }

  function calculateSaleScenario(price, item = {}, settings = {}) {
    const salePrice = optionalNumber(price);
    const costKnown = ['known', 'confirmed_zero'].includes(item.costStatus) || (item.costStatus == null && optionalNumber(item.cost) > 0);
    const cost = costKnown ? Math.max(0, asNumber(item.cost)) : null;
    if (!(salePrice > 0) || !costKnown) return { price: salePrice, calculable: false, grossMargin: null, expectedProfit: null, roi: null };
    const feeRate = clamp(settings.feePercent, 0, 100) / 100;
    const packaging = Math.max(0, asNumber(settings.packaging));
    const directCosts = salePrice * feeRate + packaging;
    const grossMargin = roundMoney(salePrice - cost);
    const expectedProfit = roundMoney(salePrice - directCosts - cost);
    return {
      price: roundMoney(salePrice), calculable: true, cost, fee: roundMoney(salePrice * feeRate),
      packaging: roundMoney(packaging), directCosts: roundMoney(directCosts), grossMargin, expectedProfit,
      roi: cost > 0 ? roundMoney(expectedProfit / cost * 100) : null
    };
  }

  function profitThresholds(item = {}, settings = {}) {
    const costKnown = ['known', 'confirmed_zero'].includes(item.costStatus) || (item.costStatus == null && optionalNumber(item.cost) > 0);
    if (!costKnown) return { calculable: false, cost: null, breakEven: null, minimumProfitPrice: null, minimumRoiPrice: null, sustainablePrice: null };
    const cost = Math.max(0, asNumber(item.cost));
    const packaging = Math.max(0, asNumber(settings.packaging));
    const feeRate = clamp(settings.feePercent, 0, 100) / 100;
    if (feeRate >= 1) return { calculable: false, cost, breakEven: null, minimumProfitPrice: null, minimumRoiPrice: null, sustainablePrice: null };
    const denominator = 1 - feeRate;
    const breakEven = roundMoney((cost + packaging) / denominator);
    const minimumProfitPrice = roundMoney((cost + packaging + Math.max(0, asNumber(settings.minProfit))) / denominator);
    const minimumRoiPrice = roundMoney((cost * (1 + Math.max(0, asNumber(settings.minRoi)) / 100) + packaging) / denominator);
    return { calculable: true, cost, breakEven, minimumProfitPrice, minimumRoiPrice, sustainablePrice: Math.max(breakEven, minimumProfitPrice, minimumRoiPrice) };
  }

  function analyzeMarketDecision(item = {}, market = {}, history = [], settings = {}, asOf = new Date()) {
    const rawProductId = String(item.productId || '').trim();
    const productId = /^\d+$/.test(rawProductId) ? rawProductId : '';
    const thresholdConfig = marketDecisionThresholds(settings);
    const points = normalizeMarketHistory(history, settings);
    const currentCalculated = calculateAutomaticPriceTargets(market, settings);
    const latestPoint = points.at(-1) || null;
    const currentReference = currentCalculated.marketReference || latestPoint?.reference || 0;
    const currentDate = String(market.priceDate || latestPoint?.date || new Date(asOf).toISOString().slice(0, 10)).slice(0, 10);
    const currentStamp = marketCalendarStamp(currentDate);
    const datedPoint = days => nearestHistoricalPoint(points, new Date(currentStamp - days * 86400000), { latestStamp: currentStamp, maxGapDays: thresholdConfig.historyMaxGapDays });
    const changes = {
      day1: marketChange(currentReference, currentStamp == null ? null : datedPoint(1)),
      day7: marketChange(currentReference, currentStamp == null ? null : datedPoint(7)),
      day30: marketChange(currentReference, currentStamp == null ? null : datedPoint(30))
    };
    const recentCutoff = points.length ? points.at(-1).stamp - 44 * 86400000 : 0;
    const recentPoints = points.filter(point => point.stamp >= recentCutoff);
    const expectedSnapshots = recentPoints.length > 1 ? Math.max(1, Math.round((recentPoints.at(-1).stamp - recentPoints[0].stamp) / 86400000) + 1) : 1;
    const coverage = Math.min(1, recentPoints.length / expectedSnapshots);
    const availablePeriods = Object.values(changes).filter(change => change.available).length;
    let dataQuality = !productId || !(currentReference > 0) || recentPoints.length < 2 ? 'UNZUREICHEND'
      : recentPoints.length < thresholdConfig.historyMinPoints || availablePeriods < 2 || coverage < 0.35 ? 'EINGESCHRÄNKT' : 'AUSREICHEND';
    const trend = classifyMarketTrend(changes, dataQuality, settings);
    if (trend.outlierCount && dataQuality === 'AUSREICHEND') dataQuality = 'EINGESCHRÄNKT';
    const purchaseDate = inventoryStartDate(item);
    const firstListingAt = listingStartDate(item);
    const listingAgeDays = ageInDays(firstListingAt, asOf);
    const datedChange = date => marketChange(currentReference, nearestHistoricalPoint(points, date, { latestStamp: currentStamp, maxGapDays: thresholdConfig.historyMaxGapDays }));
    const sincePurchase = purchaseDate ? datedChange(purchaseDate) : { available: false, absolute: null, percent: null, point: null };
    const sinceListing = firstListingAt ? datedChange(firstListingAt) : { available: false, absolute: null, percent: null, point: null };
    const currentPrice = item.listed ? optionalNumber(item.listingPrice) : optionalNumber(item.desiredSalePrice || item.listingPrice);
    const pricePosition = classifyPricePosition(currentPrice, currentReference, settings);
    const costThresholds = profitThresholds(item, settings);
    const originalTarget = optionalNumber(item.targetSell ?? item.originalTargetSell);
    const targetScenario = calculateSaleScenario(originalTarget, item, settings);
    const currentScenario = calculateSaleScenario(currentPrice, item, settings);
    const referenceScenario = calculateSaleScenario(currentReference, item, settings);
    let profitTargetStatus = 'NICHT BERECHENBAR';
    if (costThresholds.calculable && originalTarget > 0 && currentReference > 0) {
      const marketGap = (originalTarget - currentReference) / currentReference * 100;
      if (currentReference > originalTarget * (1 + thresholdConfig.priceNearPercent / 100)) profitTargetStatus = 'GEWINNZIEL ÜBERTROFFEN / MARKT GESTIEGEN';
      else if (!targetScenario.calculable || targetScenario.expectedProfit < Math.max(0, asNumber(settings.minProfit)) || (targetScenario.roi != null && targetScenario.roi < Math.max(0, asNumber(settings.minRoi)))) profitTargetStatus = 'GEWINNZIEL AKTUELL NICHT REALISTISCH';
      else if (marketGap <= thresholdConfig.priceNearPercent) profitTargetStatus = 'GEWINNZIEL WEITERHIN REALISTISCH';
      else if (marketGap <= thresholdConfig.priceFarPercent) profitTargetStatus = 'GEWINNZIEL GEFÄHRDET';
      else profitTargetStatus = 'GEWINNZIEL AKTUELL NICHT REALISTISCH';
    }
    const inventoryAgeDays = ageInDays(purchaseDate, asOf);
    const profile = normalizeHoldingProfile(item.holdingProfile);
    const longTerm = Boolean(item.longTermHold);
    const reasons = [
      `Konkrete Druckvariante: ${productId ? `CM ${productId}` : 'Produkt-ID fehlt'}`,
      `Bestandsalter: ${inventoryAgeDays == null ? 'unbekannt' : `${inventoryAgeDays} Tage`}`,
      `Gespeicherter Price-Guide-Trend: ${trend.status.toLocaleLowerCase('de-DE')}`
    ];
    if (pricePosition.percent != null) reasons.push(`Eigener VK ${pricePosition.percent >= 0 ? '+' : ''}${pricePosition.percent.toFixed(1)} % zur gespeicherten Referenz`);
    if (currentCalculated.lowOutlierExplanation) reasons.push(currentCalculated.lowOutlierExplanation);
    if (!costThresholds.calculable) reasons.push('Vollständiger EK: unbekannt');
    if (!(originalTarget > 0)) reasons.push('Ursprüngliches Gewinnziel: nicht hinterlegt');
    reasons.push(`Gewinnziel: ${profitTargetStatus.toLocaleLowerCase('de-DE')}`);
    if (sincePurchase.available) reasons.push(`Markt seit Einkauf ${sincePurchase.percent >= 0 ? '+' : ''}${sincePurchase.percent.toFixed(1)} %`);
    if (dataQuality !== 'AUSREICHEND') reasons.push(`Datenqualität: ${dataQuality.toLocaleLowerCase('de-DE')}`);
    let recommendation = 'HALTEN';
    const falling = ['FALLEND', 'STARK FALLEND'].includes(trend.status);
    const rising = ['STEIGEND', 'STARK STEIGEND'].includes(trend.status);
    const strongMarketSignal = ['STARK FALLEND', 'STARK STEIGEND'].includes(trend.status);
    const essentialTradingDataMissing = !costThresholds.calculable
      && !(originalTarget > 0)
      && inventoryAgeDays == null
      && listingAgeDays == null;
    const tradingDataStatus = essentialTradingDataMissing ? 'UNZUREICHENDE HANDELSDATEN' : 'AUSREICHEND';
    const fastProfile = ['META / STAPLE', 'DECK / ENGINE'].includes(profile);
    if (longTerm) recommendation = 'LANGFRISTIG HALTEN';
    else if (dataQuality === 'UNZUREICHEND') recommendation = 'UNZUREICHENDE DATEN';
    else if (essentialTradingDataMissing && !strongMarketSignal) recommendation = 'UNZUREICHENDE HANDELSDATEN';
    else if (costThresholds.calculable && currentPrice > 0 && currentPrice < costThresholds.breakEven) recommendation = 'BREAK-EVEN PRÜFEN';
    else if (inventoryAgeDays != null && inventoryAgeDays > Number(settings.agingCapitalMaxDays ?? 60) && fastProfile && falling) recommendation = 'KAPITALBINDUNG PRÜFEN';
    else if (inventoryAgeDays != null && inventoryAgeDays > Number(settings.agingSlowMaxDays ?? 90) && falling) recommendation = 'KAPITALBINDUNG PRÜFEN';
    else if (falling && ['DEUTLICH ÜBER REFERENZ', 'ÜBER REFERENZ'].includes(pricePosition.status)) recommendation = 'PREIS PRÜFEN';
    else if (trend.status === 'STARK FALLEND') recommendation = 'MARKT GEFALLEN';
    else if (profitTargetStatus === 'GEWINNZIEL AKTUELL NICHT REALISTISCH' || profitTargetStatus === 'GEWINNZIEL GEFÄHRDET') recommendation = 'GEWINNZIEL GEFÄHRDET';
    else if (rising && ['DEUTLICH UNTER REFERENZ', 'UNTER REFERENZ'].includes(pricePosition.status)) recommendation = 'VK ERHÖHUNG PRÜFEN';
    else if (rising) recommendation = 'MARKT GESTIEGEN';
    else if (inventoryAgeDays != null && inventoryAgeDays >= 15 && inventoryAgeDays <= 30) recommendation = 'BEOBACHTEN';
    const scenarios = [
      { key: 'current', label: 'Aktueller VK', result: currentScenario },
      { key: 'reference', label: 'Price-Guide-Referenz', result: referenceScenario },
      { key: 'breakEven', label: 'Break-even', result: calculateSaleScenario(costThresholds.breakEven, item, settings) },
      { key: 'target', label: 'Ziel-VK', result: targetScenario }
    ];
    return {
      productId, printExact: Boolean(productId), currentDate, currentReference: roundMoney(currentReference),
      referenceSource: currentCalculated.marketReferenceSource || latestPoint?.referenceSource || 'Keine Price-Guide-Referenz',
      priceGuide: { low: optionalNumber(market.low), lowEx: optionalNumber(market.lowEx), trend: optionalNumber(market.trend), avg1: optionalNumber(market.avg1), avg7: optionalNumber(market.avg7), avg30: optionalNumber(market.avg30) },
      historyPointCount: points.length, historyCoverage: roundMoney(coverage * 100), dataQuality, tradingDataStatus, changes, trend,
      purchaseReference: sincePurchase.point?.reference || null, listingReference: sinceListing.point?.reference || null,
      sincePurchase, sinceListing, currentPrice, pricePosition, thresholds: costThresholds,
      originalTarget, profitTargetStatus, scenarios, recommendation, reasons,
      lowOutlier: currentCalculated.lowOutlier,
      lowOutlierExplanation: currentCalculated.lowOutlierExplanation,
      priceAction: 'KEINE AUTOMATISCHE PREISÄNDERUNG', profile, longTerm
    };
  }

  function analyzeInventoryItem(item = {}, market = {}, settings = {}, asOf = new Date(), history = []) {
    const inventoryDate = inventoryStartDate(item);
    const inventoryAgeDays = ageInDays(inventoryDate, asOf);
    const firstListingAt = listingStartDate(item);
    const listingAgeDays = firstListingAt ? ageInDays(firstListingAt, asOf) : null;
    const profile = normalizeHoldingProfile(item.holdingProfile);
    const longTerm = Boolean(item.longTermHold);
    const costKnown = ['known', 'confirmed_zero'].includes(item.costStatus) || (item.costStatus == null && asNumber(item.cost) > 0);
    const cost = costKnown ? asNumber(item.cost) : null;
    const currentPrice = item.listed ? asNumber(item.listingPrice) : asNumber(item.desiredSalePrice || item.listingPrice);
    const referencePrice = marketReferenceValue(market);
    const margin = costKnown ? currentPrice - cost : null;
    const roi = costKnown && cost > 0 ? margin / cost * 100 : null;
    const bucket = agingBucket(inventoryAgeDays, settings);
    const listingBucket = agingBucket(listingAgeDays, settings);
    const pg = priceGroup(currentPrice || referencePrice, settings);
    const factors = [];
    factors.push(`Bestandsalter: ${inventoryAgeDays == null ? 'unbekannt' : `${inventoryAgeDays} Tage`}`);
    factors.push(`Inseratsalter: ${listingAgeDays == null ? 'unbekannt' : `${listingAgeDays} Tage`}`);
    factors.push(`Profil: ${profile}${longTerm ? ' · langfristig' : ''}`);
    factors.push(costKnown ? `EK: ${cost.toFixed(2)} €` : 'EK: unbekannt');
    factors.push(`Mindestgewinn: ${asNumber(settings.minProfit).toFixed(2)} € · Mindest-ROI: ${asNumber(settings.minRoi).toFixed(1)} %`);
    if (referencePrice > 0 && currentPrice > 0) {
      const relation = currentPrice > referencePrice ? 'über' : currentPrice < referencePrice ? 'unter' : 'auf';
      factors.push(`Inserat ${currentPrice.toFixed(2)} € liegt ${relation} der Price-Guide-Referenz ${referencePrice.toFixed(2)} €`);
    }

    const marketDecision = analyzeMarketDecision(item, market, history, settings, asOf);
    let recommendation = marketDecision.recommendation || 'HALTEN';
    if (!history.length && longTerm) recommendation = 'LANGFRISTIG HALTEN';
    else if (!history.length) {
      const fast = ['META / STAPLE', 'DECK / ENGINE'].includes(profile);
      const patient = ['COLLECTOR / ICONIC', 'HIGH RARITY', 'VINTAGE'].includes(profile);
      if (inventoryAgeDays == null) recommendation = 'BEOBACHTEN';
      else if (fast && inventoryAgeDays > Number(settings.agingCapitalMaxDays ?? 60)) recommendation = 'ENTSCHEIDUNG ERFORDERLICH';
      else if (fast && inventoryAgeDays > Number(settings.agingReviewMaxDays ?? 45)) recommendation = 'LANGSAMDREHER';
      else if (patient && inventoryAgeDays > Math.max(120, Number(settings.agingSlowMaxDays ?? 90))) recommendation = 'KAPITALBINDUNG PRÜFEN';
      else if (bucket.status === 'PRÜFEN') recommendation = 'PREIS PRÜFEN';
      else if (bucket.status === 'KAPITALBINDUNG') recommendation = 'KAPITALBINDUNG PRÜFEN';
      else if (bucket.status === 'LANGSAMDREHER') recommendation = 'LANGSAMDREHER';
      else if (bucket.status === 'ENTSCHEIDUNG ERFORDERLICH') recommendation = 'ENTSCHEIDUNG ERFORDERLICH';
      else if (bucket.status === 'BEOBACHTEN' || bucket.status === 'ALTER UNBEKANNT') recommendation = 'BEOBACHTEN';
    }
    if (!history.length && !longTerm && referencePrice > 0 && currentPrice > 0 && Math.abs(currentPrice - referencePrice) >= Math.max(0.05, referencePrice * 0.20)) recommendation = 'PREIS PRÜFEN';
    const change = asNumber(market.dailyChange || market.priceChange);
    const marketSignal = change > 0 ? 'MARKT GESTIEGEN' : change < 0 ? 'MARKT GEFALLEN' : '';
    if (marketSignal) factors.push(`${marketSignal}: ${change > 0 ? '+' : ''}${change.toFixed(2)} € laut gespeicherter Price-Guide-Historie`);
    return { inventoryDate, inventoryAgeDays, listingAgeDays, firstListingAt, inventoryBucket: bucket, listingBucket, priceGroup: pg, profile, longTerm, costKnown, cost, currentPrice, referencePrice, margin, roi, recommendation, marketSignal, factors, marketDecision };
  }

  function buildCapitalOverview(state = {}, marketByProduct = {}) {
    const accounts = (state.capitalAccounts || []).filter(row => !row.archived);
    const balances = new Map(accounts.map(row => [row.id, 0]));
    (state.capitalEntries || []).filter(row => !row.archived && balances.has(row.accountId)).forEach(row => balances.set(row.accountId, balances.get(row.accountId) + asNumber(row.amount)));
    const byType = { cardmarket: 0, bank: 0, cash: 0, other: 0 };
    accounts.forEach(account => { const type = Object.prototype.hasOwnProperty.call(byType, account.type) ? account.type : 'other'; byType[type] += balances.get(account.id) || 0; });
    const entries = (state.capitalEntries || []).filter(row => !row.archived);
    const entryTotals = { opening: 0, deposit: 0, withdrawal: 0, purchase: 0, sale: 0, fee: 0, refund: 0, correction: 0, transfer: 0 };
    const seenTransfers = new Set();
    entries.forEach(row => {
      const type = Object.prototype.hasOwnProperty.call(entryTotals, row.type) ? row.type : 'correction';
      if (type === 'transfer') {
        const key = row.transferId || row.id;
        if (!seenTransfers.has(key) && asNumber(row.amount) > 0) {
          entryTotals.transfer += Math.abs(asNumber(row.amount));
          seenTransfers.add(key);
        }
      } else {
        entryTotals[type] += asNumber(row.amount);
      }
    });
    const current = (state.inventory || []).filter(item => item.ownership !== 'private' && !['Verkauft', 'Privat', 'Abgegeben'].includes(item.status));
    const known = current.filter(item => ['known', 'confirmed_zero'].includes(item.costStatus) || (item.costStatus == null && asNumber(item.cost) > 0));
    const knownStockCost = known.reduce((sum, item) => sum + asNumber(item.cost), 0);
    const listingValue = current.filter(item => item.listed).reduce((sum, item) => sum + asNumber(item.listingPrice), 0);
    const unknownListingValue = current.filter(item => item.listed && !known.includes(item)).reduce((sum, item) => sum + asNumber(item.listingPrice), 0);
    const referenceValue = current.reduce((sum, item) => sum + marketReferenceValue(marketByProduct[String(item.productId || '')] || {}), 0);
    const liquid = Object.values(byType).reduce((sum, value) => sum + value, 0);
    const positions = new Set(current.map(item => stockSnapshotIdentity(item))).size;
    return { accounts: accounts.map(account => ({ ...account, balance: balances.get(account.id) || 0 })), byType, entryTotals, liquid, knownStockCost, listingValue, unknownListingValue, referenceValue, tradingWealthAtCost: liquid + knownStockCost, physicalCards: current.length, positions, knownCostCount: known.length, unknownCostCount: current.length - known.length };
  }

  function buildAgingSummary(items = [], marketByProduct = {}, settings = {}, asOf = new Date()) {
    const order = ['0-14', '15-30', '31-45', '46-60', '61-90', '90+', 'unknown'];
    const rows = Object.fromEntries(order.map(key => [key, { key, label: '', status: '', count: 0, knownCost: 0, listingValue: 0, referenceValue: 0 }]));
    items.forEach(item => {
      const analysis = analyzeInventoryItem(item, marketByProduct[String(item.productId || '')] || {}, settings, asOf);
      const row = rows[analysis.inventoryBucket.key] || rows.unknown;
      row.label = analysis.inventoryBucket.label;
      row.status = analysis.inventoryBucket.status;
      row.count += 1;
      if (analysis.costKnown) row.knownCost += asNumber(item.cost);
      if (item.listed) row.listingValue += asNumber(item.listingPrice);
      row.referenceValue += analysis.referencePrice;
    });
    return order.map(key => rows[key]).filter(row => row.count > 0);
  }

  function matchesSlowMoverFilters(analysis = {}, item = {}, filters = {}) {
    const value = asNumber(filters.value ?? analysis.currentPrice ?? analysis.referencePrice);
    if (filters.ageKey && analysis.inventoryBucket?.key !== filters.ageKey) return false;
    if (filters.priceGroup && analysis.priceGroup?.key !== filters.priceGroup) return false;
    if (filters.profile && normalizeHoldingProfile(analysis.profile || item.holdingProfile) !== filters.profile) return false;
    if (filters.cost === 'known' && !analysis.costKnown) return false;
    if (filters.cost === 'unknown' && analysis.costKnown) return false;
    if (filters.longTerm === 'yes' && !analysis.longTerm) return false;
    if (filters.longTerm === 'no' && analysis.longTerm) return false;
    if (filters.language && String(item.language || '') !== filters.language) return false;
    if (filters.condition && String(item.condition || '') !== filters.condition) return false;
    if (filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice !== '' && value < asNumber(filters.minPrice)) return false;
    if (filters.maxPrice !== null && filters.maxPrice !== undefined && filters.maxPrice !== '' && value > asNumber(filters.maxPrice)) return false;
    return true;
  }

  return {
    asNumber,
    normalizeField,
    normalizeCollectorNumber,
    inspectCardAssignment,
    detectCsvImportType,
    calculateSaleProfit,
    purchaseBusinessCost,
    buildFinancialLedger,
    buildFinancialSummary,
    calculateAutomaticPriceTargets,
    calculateOwnedCardPriceTargets,
    deduplicatePurchaseDraftRows,
    estimatePackagingPerCard,
    stockSnapshotIdentity,
    purchaseLineKey,
    normalizePurchaseReceiptLine,
    allocatePurchaseCosts,
    planPurchaseReceipt,
    purchaseOwnershipTotals,
    selectInventoryForSale,
    selectSaleAllocationDefault,
    analyzePurchaseDraft,
    summarizePurchasePerformance,
    scoreDemandRadar,
    normalizeWantlistEntry,
    mergeWantlistSnapshot,
    evaluateMarketCandidate,
    planMaterialUsageChanges,
    calculateInventoryBuckets,
    planInventoryTotalCorrection,
    planAvailableInventorySnapshot,
    planLegacyStockSnapshotCleanup,
    planStockPurchaseDuplicateReconciliation,
    mergeInventorySnapshot,
    HOLDING_PROFILES,
    normalizeHoldingProfile,
    ageInDays,
    listingStartDate,
    inventoryStartDate,
    agingBucket,
    priceGroup,
    marketReferenceValue,
    MARKET_REFERENCE_THRESHOLDS,
    MARKET_DECISION_THRESHOLDS,
    marketDecisionThresholds,
    normalizeMarketHistory,
    nearestHistoricalPoint,
    marketChange,
    classifyMarketTrend,
    classifyPricePosition,
    calculateSaleScenario,
    profitThresholds,
    analyzeMarketDecision,
    analyzeInventoryItem,
    buildCapitalOverview,
    buildAgingSummary,
    matchesSlowMoverFilters,
    SALES_DATA_QUALITY_THRESHOLDS,
    OWN_TURNOVER_THRESHOLDS,
    ownSalesDataQuality,
    ownTurnoverClass,
    decisionCostBreakdown,
    planTargetSellChange,
    ownSalesPurchaseHint,
    analyzeOwnSalesExperience,
    combineAgingWithOwnSales,
    planInventoryMovementReversal,
    buildPerformanceReport,
    buildDataQualityIssues,
    buildPriceAlerts,
    buildWorkflowStatus,
    reconcileSettlementRows
  };
});
