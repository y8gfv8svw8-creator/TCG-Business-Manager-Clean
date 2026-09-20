const test = require('node:test');
const assert = require('node:assert/strict');

const { PriceEngine } = require('../app/shared/price-engine');
const businessAutomation = require('../app/shared/business-automation');

test('PriceEngine berechnet Nibiru mit plausiblem Low reproduzierbar', () => {
  const result = PriceEngine.calculate({ low: 1, trend: 2.59, avg1: 3.95, avg7: 2.90, avg30: 2.53 });
  assert.equal(result.lowOutlier, false);
  assert.equal(result.marketReference, 1.3);
  assert.equal(result.recommendedSell, 1.3);
  assert.equal(result.maxBuy, 1.04);
  assert.match(result.priceExplanation, /Cardmarket Price Guide Low: 1,00 €/);
  assert.match(result.priceExplanation, /Price Guide Low mit kleinem 1-Tages-Puffer/);
});

test('PriceEngine schließt den Arkane-Macht-Low-Ausreißer aus und verwendet plausibles Low EX+', () => {
  const result = PriceEngine.calculate({ low: 0.02, lowEx: 2.30, trend: 2.50, avg1: 2.60, avg7: 2.40, avg30: 2.50 });
  assert.equal(result.lowOutlier, true);
  assert.equal(result.lowExUsed, true);
  assert.equal(result.robustComparison, 2.5);
  assert.equal(result.marketReference, 2.33);
  assert.equal(result.quickSell, 2.3);
  assert.match(result.priceExplanation, /Low als Ausreißer erkannt/);
  assert.match(result.priceExplanation, /Low EX\+/);
});

test('PriceEngine fällt ohne plausibles Low EX+ stabil auf den kurzfristigen Median zurück', () => {
  const result = PriceEngine.calculate({ low: 0.01, trend: 0.80, avg1: 0.70, avg7: 0.80, avg30: 0.90 });
  assert.equal(result.lowOutlier, true);
  assert.equal(result.lowExUsed, false);
  assert.equal(result.marketReference, 0.8);
  assert.equal(result.marketReferenceSource, 'Robuster Median der kurzfristigen Price-Guide-Werte (Low-Ausreißer ausgeschlossen)');
  assert.equal(result.recommendedSell, 0.8);
});

test('PriceEngine priorisiert eine gespeicherte Angebotsbeobachtung und berechnet Ziel-VK, Max-EK, Gewinn und ROI exakt', () => {
  const prices = { liveOffer: 5, low: 1, trend: 4.5, avg1: 4.8, avg7: 4.6, avg30: 4.4, cost: 3 };
  const settings = { safetyPercent: 0, feePercent: 10, packaging: 0.2, minProfit: 1, minRoi: 25, targetRoi: 30 };
  const result = PriceEngine.calculateOwned(prices, settings);
  assert.equal(result.marketReference, 5);
  assert.equal(result.marketReferenceSource, 'Gespeicherte Angebotsbeobachtung');
  assert.equal(result.maxBuy, 3.3);
  assert.equal(result.priceFloor, 4.56);
  assert.equal(result.expectedProfit, 1.3);
  assert.equal(result.expectedRoi, 43.333333333333336);
  assert.deepEqual(
    businessAutomation.calculateOwnedCardPriceTargets(prices, settings),
    result,
    'Alle bisherigen Berechnungswege delegieren an dieselbe zentrale Engine'
  );
});
