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
    const shippingPaid = asNumber(sale.shippingPaid);
    const cardValue = asNumber(sale.cardValue) || Math.max(0, gross - shippingPaid);
    const fee = sale.fee !== undefined && sale.fee !== ''
      ? asNumber(sale.fee)
      : cardValue * asNumber(settings.feePercent) / 100;
    const packaging = asNumber(sale.material) || asNumber(sale.packaging) ||
      Math.max(0, asNumber(sale.quantity)) * asNumber(settings.packaging);
    const postage = asNumber(sale.postage);
    const cost = asNumber(sale.cost);
    return { gross, cardValue, fee, packaging, postage, cost, profit: gross - fee - packaging - postage - cost };
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

  function calculateAutomaticPriceTargets(prices = {}, settings = {}) {
    const low = optionalNumber(prices.low ?? prices.currentBuy);
    const trend = optionalNumber(prices.trend);
    const avg1 = optionalNumber(prices.avg1);
    const avg7 = optionalNumber(prices.avg7);
    const avg30 = optionalNumber(prices.avg30);
    const pricePointCount = [low, trend, avg1, avg7, avg30].filter(value => value !== null).length;
    const weighted = [];
    if (trend !== null) weighted.push([trend, 0.45]);
    if (avg7 !== null) weighted.push([avg7, 0.35]);
    if (avg30 !== null) weighted.push([avg30, 0.20]);
    if (!weighted.length && avg1 !== null) weighted.push([avg1, 1]);
    if (!weighted.length && low !== null) weighted.push([low, 1]);
    const weightTotal = weighted.reduce((sum, row) => sum + row[1], 0);
    const weightedSell = weightTotal
      ? weighted.reduce((sum, row) => sum + row[0] * row[1], 0) / weightTotal
      : 0;
    const recommendedSell = pricePointCount
      ? roundMoney(Math.max(0, weightedSell, low || 0))
      : 0;
    const safety = clamp(settings.safetyPercent, 0, 50) / 100;
    const feeRate = clamp(settings.feePercent, 0, 100) / 100;
    const packaging = Math.max(0, asNumber(settings.packaging));
    const safeSell = floorMoney(recommendedSell * (1 - safety));
    const feeAmount = safeSell * feeRate;
    const netBeforeBuy = safeSell - feeAmount - packaging;
    const minProfit = Math.max(0, asNumber(settings.minProfit));
    const minRoi = Math.max(0, asNumber(settings.minRoi)) / 100;
    const maxByProfit = netBeforeBuy > 0 ? floorMoney(netBeforeBuy - minProfit) : 0;
    const maxByRoi = netBeforeBuy > 0 ? floorMoney(minRoi > 0 ? netBeforeBuy / (1 + minRoi) : netBeforeBuy) : 0;
    const maxBuy = recommendedSell > 0 ? floorMoney(Math.min(maxByProfit, maxByRoi)) : 0;
    return {
      low, trend, avg1, avg7, avg30, pricePointCount,
      recommendedSell, safeSell, feeRate, packaging, feeAmount, netBeforeBuy,
      minProfit, minRoi, maxByProfit, maxByRoi, maxBuy
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
      String(item?.status || '') === 'Beschädigt'
    );
    const availableItems = currentItems.filter(item =>
      !['Reserviert', 'Beschädigt'].includes(String(item?.status || ''))
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

  const realizedSale = sale => ['Bezahlt', 'Versendet', 'Abgeschlossen'].includes(String(sale?.status || ''));

  function buildPerformanceReport(state = {}, now = new Date()) {
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

    (state.sales || []).filter(realizedSale).forEach(sale => {
      const result = calculateSaleProfit(sale, settings);
      add(customerMap, sale.customer, { orders: 1, cards: sale.quantity, revenue: result.gross, cost: result.cost, profit: result.profit });
      const items = Array.isArray(sale.items) && sale.items.length ? sale.items : [{
        name: sale.cardNames || 'Sammelverkauf', set: 'Ohne Set', quantity: Math.max(1, asNumber(sale.quantity)),
        unitPrice: result.cardValue / Math.max(1, asNumber(sale.quantity))
      }];
      const lineTotal = items.reduce((sum, item) => sum + Math.max(0, asNumber(item.quantity) || 1) * Math.max(0, asNumber(item.unitPrice)), 0);
      items.forEach(item => {
        const quantity = Math.max(1, asNumber(item.quantity));
        const lineRevenue = quantity * asNumber(item.unitPrice);
        const share = lineTotal > 0 ? lineRevenue / lineTotal : quantity / Math.max(1, items.reduce((sum, row) => sum + Math.max(1, asNumber(row.quantity)), 0));
        const values = { orders: 1, cards: quantity, revenue: result.gross * share, cost: result.cost * share, profit: result.profit * share };
        add(cardMap, item.name, values);
        add(setMap, item.set || item.setName || 'Ohne Set', values);
      });
    });

    (state.purchases || []).filter(purchase => purchase.status !== 'Storniert').forEach(purchase => {
      const total = asNumber(purchase.cardValue) + asNumber(purchase.shipping) + asNumber(purchase.extra);
      add(sellerMap, purchase.seller, { orders: 1, cards: purchase.items, cost: total });
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
    const push = (severity, category, title, details, target = '') => issues.push({ severity, category, title, details, target });
    const duplicateOrders = (rows, label) => {
      const counts = new Map();
      rows.forEach(row => { const key = String(row.orderNo || '').trim(); if (key) counts.set(key, (counts.get(key) || 0) + 1); });
      [...counts].filter(([, count]) => count > 1).forEach(([orderNo, count]) => push('error', 'Duplikat', `${label} ${orderNo} ist ${count}× vorhanden`, 'Bestellnummern sollten eindeutig sein.', label === 'Einkauf' ? 'purchases' : 'sales'));
    };
    duplicateOrders(state.purchases || [], 'Einkauf');
    duplicateOrders(state.sales || [], 'Verkauf');

    const missingInventoryIds = (state.inventory || []).filter(item => !String(item.productId || '').match(/\d/)).length;
    if (missingInventoryIds) push('warning', 'Kartenzuordnung', `${missingInventoryIds} Bestandskarte(n) ohne Cardmarket-ID`, 'Marktpreise und Druckvarianten können dafür nicht sicher zugeordnet werden.', 'inventory');
    const missingPurchaseIds = (state.purchases || []).flatMap(row => row.pendingItems || []).filter(item => !String(item.productId || '').match(/\d/)).length;
    if (missingPurchaseIds) push('warning', 'Kartenzuordnung', `${missingPurchaseIds} Einkaufsposition(en) ohne Cardmarket-ID`, 'Bitte die Quelldatei oder Zuordnung prüfen.', 'purchases');

    (state.sales || []).forEach(sale => {
      if (realizedSale(sale) && asNumber(sale.quantity) > 0 && asNumber(sale.cost) <= 0) push('warning', 'Kalkulation', `Verkauf ${sale.orderNo || 'ohne Nummer'} ohne Wareneinsatz`, 'Der ausgewiesene Gewinn kann zu hoch sein.', 'sales');
      if (['Versendet', 'Abgeschlossen'].includes(sale.status) && asNumber(sale.postage) <= 0) push('info', 'Versand', `Verkauf ${sale.orderNo || 'ohne Nummer'} ohne tatsächliches Porto`, 'Falls Porto angefallen ist, bitte den wirklich bezahlten Betrag ergänzen.', 'sales');
      if (asNumber(sale.shippingPaid) > asNumber(sale.revenue)) push('error', 'Kalkulation', `Versandbetrag bei ${sale.orderNo || 'Verkauf'} ist höher als die Einnahme`, 'Einnahme und Käufer-Versand prüfen.', 'sales');
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
    (state.inventory || []).filter(item => !['Verkauft', 'Storniert'].includes(item.status)).forEach(item => {
      if (item.listed && asNumber(item.listingPrice) > 0 && asNumber(item.listingPrice) < asNumber(item.cost)) {
        alerts.push({ severity: 'error', type: 'Verlustpreis', title: item.name || 'Unbekannte Karte', details: `Inserat ${asNumber(item.listingPrice).toFixed(2)} € liegt unter EK ${asNumber(item.cost).toFixed(2)} €.`, target: 'inventory' });
      }
      const purchaseTime = new Date(item.purchaseDate || now).getTime();
      const days = Number.isFinite(purchaseTime) ? Math.floor((nowTime - purchaseTime) / 86400000) : 0;
      if (days > threshold * 4 && item.listed === false) alerts.push({ severity: 'warning', type: 'Lageralter', title: item.name || 'Unbekannte Karte', details: `${days} Tage im Bestand und nicht inseriert.`, target: 'inventory' });
    });
    (state.watchlist || []).filter(item => !item.archived).forEach(item => {
      const trend = asNumber(item.trend);
      const avg30 = asNumber(item.avg30);
      if (trend > 0 && avg30 > 0 && trend < avg30 * 0.88) alerts.push({ severity: 'warning', type: 'Preisrückgang', title: item.name || 'Watchlist-Karte', details: `Trend liegt ${Math.round((1 - trend / avg30) * 100)} % unter dem 30-Tage-Schnitt.`, target: 'watchlist' });
      if (trend > 0 && avg30 > 0 && trend > avg30 * 1.15) alerts.push({ severity: 'info', type: 'Preisanstieg', title: item.name || 'Watchlist-Karte', details: `Trend liegt ${Math.round((trend / avg30 - 1) * 100)} % über dem 30-Tage-Schnitt.`, target: 'watchlist' });
    });
    return alerts;
  }

  function buildWorkflowStatus(state = {}) {
    const purchases = state.purchases || [];
    const sales = state.sales || [];
    return {
      purchasesInTransit: purchases.filter(row => row.status === 'Unterwegs').length,
      purchasesReady: purchases.filter(row => row.status === 'Eingetroffen' && !row.inventoryCreated).length,
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

  return {
    asNumber,
    normalizeField,
    detectCsvImportType,
    calculateSaleProfit,
    calculateAutomaticPriceTargets,
    planMaterialUsageChanges,
    calculateInventoryBuckets,
    planInventoryTotalCorrection,
    planAvailableInventorySnapshot,
    buildPerformanceReport,
    buildDataQualityIssues,
    buildPriceAlerts,
    buildWorkflowStatus,
    reconcileSettlementRows
  };
});
