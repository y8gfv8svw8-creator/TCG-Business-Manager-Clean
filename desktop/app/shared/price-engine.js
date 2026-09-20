(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgPriceEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MARKET_REFERENCE_THRESHOLDS = Object.freeze({
    lowOutlierMinimumRatio: 0.25,
    lowOutlierMaximumRatio: 4,
    minimumComparisonValues: 2
  });

  const asNumber = value => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const normalized = String(value ?? '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

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
  const money = value => `${roundMoney(value).toFixed(2).replace('.', ',')} €`;

  const median = values => {
    const sorted = (values || [])
      .filter(value => value !== null && Number.isFinite(Number(value)) && Number(value) > 0)
      .map(Number)
      .sort((left, right) => left - right);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  };

  function sourceEntries(values = {}) {
    return [
      ['Gespeicherte Angebotsbeobachtung', values.liveOffer],
      ['Cardmarket Price Guide Low', values.low],
      ['Cardmarket Price Guide Low EX+', values.lowEx],
      ['Cardmarket Price Guide Trend', values.trend],
      ['Cardmarket Price Guide Ø 1 Tag', values.avg1],
      ['Cardmarket Price Guide Ø 7 Tage', values.avg7],
      ['Cardmarket Price Guide Ø 30 Tage', values.avg30]
    ].filter(([, value]) => value !== null).map(([label, value]) => `${label}: ${money(value)}`);
  }

  class PriceEngine {
    constructor(settings = {}) {
      this.settings = { ...settings };
    }

    calculate(prices = {}, settings = this.settings) {
      return PriceEngine.calculate(prices, settings);
    }

    calculateOwned(prices = {}, settings = this.settings) {
      return PriceEngine.calculateOwned(prices, settings);
    }

    explain(prices = {}, settings = this.settings) {
      return PriceEngine.calculate(prices, settings).priceExplanation;
    }

    static calculate(prices = {}, settings = {}) {
      const liveOffer = optionalNumber(prices.liveOffer ?? prices.offerLow ?? prices.currentOffer);
      const low = optionalNumber(prices.low ?? prices.currentBuy);
      const lowEx = optionalNumber(prices.lowEx ?? prices.lowExPlus ?? prices.lowExPrice ?? prices['LOWEX+']);
      const trend = optionalNumber(prices.trend);
      const avg1 = optionalNumber(prices.avg1);
      const avg7 = optionalNumber(prices.avg7);
      const avg30 = optionalNumber(prices.avg30);
      const pricePointCount = [liveOffer, low, lowEx, trend, avg1, avg7, avg30].filter(value => value !== null).length;
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
        pricePointCount * 10
        + Math.min(25, Math.max(0, asNumber(prices.marketSampleCount)) * 3)
        + Math.min(25, Math.max(0, asNumber(prices.sellSampleCount)) * 5)
      );
      const confidenceLevel = confidenceScore >= 75 ? 'high' : confidenceScore >= 45 ? 'medium' : 'low';
      const priceSources = sourceEntries({ liveOffer, low, lowEx, trend, avg1, avg7, avg30 });
      const calculationLog = [
        priceSources.length ? `Verwendbare Eingangsdaten: ${priceSources.join('; ')}.` : 'Keine verwendbare Preisquelle vorhanden.',
        lowOutlierExplanation || (low !== null ? 'Price Guide Low wurde als plausibel eingestuft.' : 'Kein Price Guide Low vorhanden.'),
        recommendedSell > 0
          ? `Preisreferenz ${money(recommendedSell)} aus „${marketReferenceSource}“; Sicherheitswert ${money(safeSell)}; Max-EK ${money(maxBuy)}.`
          : 'Es konnte keine belastbare kurzfristige Preisreferenz berechnet werden.'
      ];
      const priceExplanation = `Aus diesen Daten entstand dieser Preis: ${calculationLog.join(' ')}`;

      return {
        liveOffer, low, lowEx, effectiveLow, trend, avg1, avg7, avg30, pricePointCount,
        lowOutlier, lowExUsed, robustComparison: roundMoney(robustComparison), lowRatio, lowOutlierExplanation,
        marketReference: recommendedSell, marketReferenceSource, historicalReference,
        recommendedSell, typicalSell, safeSell, typicalSafeSell, feeRate, packaging, feeAmount, typicalFeeAmount, netBeforeBuy, typicalNetBeforeBuy,
        minProfit, minRoi, targetRoi, maxByProfit, maxByRoi, maxBuy,
        typicalMaxBuy,
        ownedCost, breakEvenPrice: roundMoney(breakEvenPrice), targetRoiPrice: priceFloor,
        priceFloor, quickSell, confidenceScore, confidenceLevel,
        priceSources, calculationLog, priceExplanation
      };
    }

    static calculateOwned(prices = {}, settings = {}) {
      const base = PriceEngine.calculate(prices, settings);
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
        costFloorAboveMarket: base.priceFloor > 0 && base.recommendedSell > 0 && base.priceFloor > base.recommendedSell,
        priceExplanation: `${base.priceExplanation} Eigener Vollkosten-EK: ${money(base.ownedCost)}; erwarteter Gewinn beim Vorschlag: ${money(expectedProfit)}${base.ownedCost > 0 ? `; ROI ${roundMoney(expectedRoi).toFixed(1).replace('.', ',')} %` : ''}.`
      };
    }

    static explain(calculation = {}) {
      return String(calculation.priceExplanation || 'Aus diesen Daten entstand kein Preis: Es fehlen verwendbare Preisquellen.');
    }
  }

  return { PriceEngine, MARKET_REFERENCE_THRESHOLDS };
});
