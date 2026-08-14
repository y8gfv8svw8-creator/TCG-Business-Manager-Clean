const test = require('node:test');
const assert = require('node:assert/strict');

const automation = require('../app/shared/business-automation');
const { normalizeSettings } = require('../app/shared/app-config');

const settings = normalizeSettings({ feePercent: 5, packaging: 0.12, minProfit: 0.50, minRoi: 25 });
const asOf = new Date('2026-08-14T12:00:00.000Z');

function history(start, end, days = 31) {
  const rows = [];
  const first = Date.UTC(2026, 6, 15);
  for (let index = 0; index < days; index += 1) {
    const value = start + (end - start) * index / Math.max(1, days - 1);
    rows.push({ date: new Date(first + index * 86400000).toISOString().slice(0, 10), low: value, avg1: value, avg7: value, avg30: value, trend: value });
  }
  return rows;
}

function item(overrides = {}) {
  return {
    id: 'asset-1', productId: '123456', name: 'Testkarte', purchaseDate: '2026-07-15',
    listed: true, listingPrice: 10, originalTargetSell: 11, cost: 5, costStatus: 'known',
    holdingProfile: 'UNKLASSIFIZIERT', listingHistory: [{ eventType: 'first_listing', changedAt: '2026-07-20' }], ...overrides
  };
}

function decision(overrides = {}, rows = history(10, 10), market = { low: 10, avg1: 10, avg7: 10, avg30: 10, trend: 10, priceDate: '2026-08-14' }) {
  return automation.analyzeMarketDecision(item(overrides), market, rows, settings, asOf);
}

test('erkennt steigenden, fallenden und stabilen gespeicherten Price-Guide-Trend aus mehreren Zeiträumen', () => {
  assert.match(decision({}, history(8, 10)).trend.status, /STEIGEND/);
  assert.match(decision({}, history(12, 10)).trend.status, /FALLEND/);
  assert.equal(decision({}, history(10, 10)).trend.status, 'STABIL');
});

test('kennzeichnet zu kurze Historie ohne scheinpräzisen Trend als unzureichend', () => {
  const result = decision({}, history(10, 10, 1));
  assert.equal(result.dataQuality, 'UNZUREICHEND');
  assert.equal(result.trend.status, 'UNZUREICHENDE DATEN');
  assert.equal(result.changes.day7.available, false);
});

test('berechnet 7- und 30-Tage-Veränderung absolut und relativ ohne Interpolation', () => {
  const result = decision({}, history(8, 10));
  assert.equal(result.changes.day7.available, true);
  assert.equal(result.changes.day30.available, true);
  assert.ok(result.changes.day30.absolute > 0);
  assert.ok(result.changes.day30.percent > 20);
  assert.equal(result.changes.day30.point.exact, true);
});

test('vergleicht die konkrete Produkt-ID mit der Referenz zum Einkauf und zur Erstinserierung', () => {
  const result = decision({}, history(8, 10));
  assert.equal(result.productId, '123456');
  assert.equal(result.sincePurchase.available, true);
  assert.equal(result.purchaseReference, 8);
  assert.equal(result.sinceListing.available, true);
});

test('lässt Veränderung seit Einkauf bei unbekanntem Kaufdatum bewusst offen', () => {
  const result = decision({ purchaseDate: '', inventoryDateQuality: 'unknown' });
  assert.equal(result.sincePurchase.available, false);
  assert.equal(result.purchaseReference, null);
});

test('ordnet den eigenen VK in zentrale Referenzbereiche ein', () => {
  assert.equal(decision({ listingPrice: 7 }).pricePosition.status, 'DEUTLICH UNTER REFERENZ');
  assert.equal(decision({ listingPrice: 9 }).pricePosition.status, 'UNTER REFERENZ');
  assert.equal(decision({ listingPrice: 10.2 }).pricePosition.status, 'IM REFERENZBEREICH');
  assert.equal(decision({ listingPrice: 11 }).pricePosition.status, 'ÜBER REFERENZ');
  assert.equal(decision({ listingPrice: 13 }).pricePosition.status, 'DEUTLICH ÜBER REFERENZ');
});

test('berechnet Break-even, Mindestgewinn und Mindest-ROI mit derselben Gebühren- und Kostenbasis', () => {
  const result = decision();
  assert.equal(result.thresholds.calculable, true);
  assert.equal(result.thresholds.breakEven, 5.39);
  assert.equal(result.thresholds.minimumProfitPrice, 5.92);
  assert.equal(result.thresholds.minimumRoiPrice, 6.71);
});

test('behandelt unbekannten EK nicht als null Euro und lässt Gewinnszenarien offen', () => {
  const result = decision({ cost: 0, costStatus: 'unknown' });
  assert.equal(result.thresholds.calculable, false);
  assert.equal(result.scenarios.find(row => row.key === 'current').result.calculable, false);
  assert.equal(result.profitTargetStatus, 'NICHT BERECHENBAR');
});

test('bewertet ursprüngliche Ziel-VK als realistisch, gefährdet, nicht realistisch oder übertroffen', () => {
  assert.equal(decision({ originalTargetSell: 10.2 }).profitTargetStatus, 'GEWINNZIEL WEITERHIN REALISTISCH');
  assert.equal(decision({ originalTargetSell: 11 }).profitTargetStatus, 'GEWINNZIEL GEFÄHRDET');
  assert.equal(decision({ originalTargetSell: 14 }).profitTargetStatus, 'GEWINNZIEL AKTUELL NICHT REALISTISCH');
  assert.equal(decision({ originalTargetSell: 9 }).profitTargetStatus, 'GEWINNZIEL ÜBERTROFFEN / MARKT GESTIEGEN');
});

test('frische Karte und 35 Tage alter Bestand bleiben bei stabilem Markt und gesundem Ziel auf HALTEN', () => {
  assert.equal(decision({ purchaseDate: '2026-08-10', originalTargetSell: 10.2 }).recommendation, 'HALTEN');
  assert.equal(decision({ purchaseDate: '2026-07-10', originalTargetSell: 10.2 }).recommendation, 'HALTEN');
});

test('60 und 90 Tage erzwingen für Collector und Vintage bei stabilem Markt keine Preissenkung', () => {
  const collector = decision({ purchaseDate: '2026-06-10', holdingProfile: 'COLLECTOR / ICONIC', originalTargetSell: 10.2 });
  const vintage = decision({ purchaseDate: '2026-04-01', holdingProfile: 'VINTAGE', originalTargetSell: 10.2 });
  assert.equal(collector.recommendation, 'HALTEN');
  assert.equal(vintage.recommendation, 'HALTEN');
  assert.equal(collector.priceAction, 'KEINE AUTOMATISCHE PREISÄNDERUNG');
});

test('langfristig halten bleibt bevorzugte Empfehlung und zeigt den Trend trotzdem', () => {
  const result = decision({ purchaseDate: '2025-01-01', holdingProfile: 'VINTAGE', longTermHold: true }, history(12, 10));
  assert.equal(result.recommendation, 'LANGFRISTIG HALTEN');
  assert.match(result.trend.status, /FALLEND/);
});

test('Meta-Profil mit Alter und fallendem Markt priorisiert Kapitalbindung', () => {
  const result = decision({ purchaseDate: '2026-05-01', holdingProfile: 'META / STAPLE', listingPrice: 11 }, history(12, 10));
  assert.equal(result.recommendation, 'KAPITALBINDUNG PRÜFEN');
});

test('steigender Markt und VK unter Referenz führen nur zu einer Erhöhungsprüfung', () => {
  const result = decision({ listingPrice: 8, originalTargetSell: 9 }, history(8, 10));
  assert.equal(result.recommendation, 'VK ERHÖHUNG PRÜFEN');
  assert.equal(result.priceAction, 'KEINE AUTOMATISCHE PREISÄNDERUNG');
});

test('unterschiedliche EK desselben Prints erzeugen unterschiedliche Gewinnszenarien', () => {
  const lowCost = decision({ id: 'a', cost: 3 });
  const highCost = decision({ id: 'b', cost: 7 });
  const lowProfit = lowCost.scenarios.find(row => row.key === 'current').result.expectedProfit;
  const highProfit = highCost.scenarios.find(row => row.key === 'current').result.expectedProfit;
  assert.ok(lowProfit > highProfit);
  assert.equal(lowCost.productId, highCost.productId);
});

test('Empfehlung erklärt sich regelbasiert und enthält keine Live-Marktbehauptung', () => {
  const source = item();
  const before = structuredClone(source);
  const result = automation.analyzeMarketDecision(source, { low: 10, avg1: 10, avg7: 10, avg30: 10, trend: 10, priceDate: '2026-08-14' }, history(10, 10), settings, asOf);
  assert.deepEqual(source, before);
  assert.ok(result.reasons.length >= 4);
  assert.doesNotMatch(JSON.stringify(result), /LIVE-MARKTPREIS|AKTUELL BILLIGSTES ANGEBOT|VERKAUFSWAHRSCHEINLICHKEIT/i);
  assert.equal(result.priceAction, 'KEINE AUTOMATISCHE PREISÄNDERUNG');
});

test('A: extremer Price-Guide-Low wird gegen mehrere robuste Vergleichswerte ausgeschlossen', () => {
  const result = automation.calculateAutomaticPriceTargets({ low: 0.02, avg1: 2.49, avg7: 2.10, avg30: 2.33, trend: 1.96 }, settings);
  assert.equal(result.lowOutlier, true);
  assert.equal(result.marketReference, 2.33);
  assert.equal(result.quickSell, 2.33);
  assert.match(result.marketReferenceSource, /Robuster Median/);
  assert.match(result.lowOutlierExplanation, /Ausreißer erkannt.*0\.02.*2\.22/);
});

test('B: plausibler Low bleibt Bestandteil der vorsichtigen kurzfristigen Referenz', () => {
  const result = automation.calculateAutomaticPriceTargets({ low: 2, avg1: 2.20, avg7: 2.10, avg30: 2.30, trend: 2.25 }, settings);
  assert.equal(result.lowOutlier, false);
  assert.equal(result.marketReference, 2.02);
  assert.match(result.marketReferenceSource, /Low mit kleinem 1-Tages-Puffer/);
});

test('B2: plausibler Low EX+ darf einen erkannten Low-Ausreißer ersetzen', () => {
  const result = automation.calculateAutomaticPriceTargets({ low: 0.02, lowEx: 2.05, avg1: 2.20, avg7: 2.15, avg30: 2.30, trend: 2.18 }, settings);
  assert.equal(result.lowOutlier, true);
  assert.equal(result.lowExUsed, true);
  assert.equal(result.marketReference, 2.07);
  assert.match(result.marketReferenceSource, /Low EX\+/);
});

test('C: bei nur einem Vergleichswert wird kein Ausreißer scheinpräzise behauptet', () => {
  const result = automation.calculateAutomaticPriceTargets({ low: 0.02, avg1: 2.49 }, settings);
  assert.equal(result.lowOutlier, false);
  assert.equal(result.marketReference, 0.27);
  assert.equal(result.lowOutlierExplanation, '');
});

test('D: bei ausschließlich vorhandenem Low bleibt Low die offen benannte Referenz', () => {
  const result = automation.calculateAutomaticPriceTargets({ low: 1.23 }, settings);
  assert.equal(result.marketReference, 1.23);
  assert.equal(result.marketReferenceSource, 'Cardmarket Low');
  assert.equal(result.lowOutlier, false);
});

test('E: unbekannter EK erzeugt weder Gewinn noch ROI noch Break-even', () => {
  const result = decision({ cost: 0, costStatus: 'unknown' });
  const current = result.scenarios.find(row => row.key === 'current').result;
  assert.equal(result.thresholds.breakEven, null);
  assert.equal(current.expectedProfit, null);
  assert.equal(current.roi, null);
  assert.equal(result.profitTargetStatus, 'NICHT BERECHENBAR');
});

test('F: ohne EK Kaufdatum Inseratsdatum und Ziel-VK entsteht keine sichere Halten-Empfehlung', () => {
  const result = decision({
    cost: 0, costStatus: 'unknown', purchaseDate: '', inventoryDateQuality: 'unknown',
    originalTargetSell: null, targetSell: null, listingHistory: [{ eventType: 'baseline', changedAt: '2026-08-01' }]
  });
  assert.equal(result.tradingDataStatus, 'UNZUREICHENDE HANDELSDATEN');
  assert.equal(result.recommendation, 'UNZUREICHENDE HANDELSDATEN');
  assert.equal(result.originalTarget, null);
});

test('G: Praxis-Kontrollfälle Laquari und Blitzsturm behalten ihre sinnvollen Entscheidungen', () => {
  const laquari = automation.analyzeMarketDecision(
    item({ productId: '251780', purchaseDate: '2026-08-08', listingPrice: 6, originalTargetSell: null, cost: 3.872195 }),
    { low: 1, trend: 6.40, avg1: 6.99, avg7: 8.29, avg30: 5.63, priceDate: '2026-08-14' },
    history(6.99, 6.99), settings, asOf
  );
  const blitz = automation.analyzeMarketDecision(
    item({ productId: '741695', purchaseDate: '2026-07-20', listingPrice: 3.50, originalTargetSell: null, cost: 3.0516479 }),
    { low: 2, trend: 3.85, avg1: 4.98, avg7: 5.10, avg30: 4.62, priceDate: '2026-08-14' },
    history(4.6, 2.3), settings, asOf
  );
  assert.equal(laquari.currentReference, 6.99);
  assert.equal(laquari.recommendation, 'HALTEN');
  assert.equal(blitz.currentReference, 2.30);
  assert.equal(blitz.recommendation, 'PREIS PRÜFEN');
});
