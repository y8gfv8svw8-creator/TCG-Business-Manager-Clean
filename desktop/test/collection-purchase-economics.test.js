const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const model = require('../app/shared/collection-photo-model');

const card = (observationId, options = {}) => ({
  observationId,
  quantity: 1,
  privateQuantity: 0,
  referenceValue: 1,
  manualUnitCost: null,
  completed: true,
  confirmed: true,
  ...options
});

test('verteilt den vollständigen Gesamt-EK proportional auf alle physischen Karten', () => {
  const result = model.allocateCollectionPurchaseCosts({
    totalCost: 10,
    cards: [card('a', { referenceValue: 1 }), card('b', { referenceValue: 3 })]
  });
  assert.equal(result.ok, true);
  assert.equal(result.allocatedCents, 1000);
  assert.deepEqual(result.lines.map(line => line.allocatedTotalCents), [250, 750]);
});

test('belässt einen manuell fixierten Karten-EK und verteilt nur den Rest', () => {
  const result = model.allocateCollectionPurchaseCosts({
    totalCost: 10,
    cards: [card('fixed', { manualUnitCost: 2 }), card('rest', { referenceValue: 3 })]
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.lines.map(line => line.allocatedTotalCents), [200, 800]);
});

test('akzeptiert weder negative EKs noch manuelle EKs oberhalb der Ankaufssumme', () => {
  const negative = model.allocateCollectionPurchaseCosts({ totalCost: 5, cards: [card('a', { manualUnitCost: -1 })] });
  const tooHigh = model.allocateCollectionPurchaseCosts({ totalCost: 5, cards: [card('a', { manualUnitCost: 6 })] });
  assert.equal(negative.ok, false);
  assert.ok(negative.errors.some(error => error.code === 'invalid_manual_cost'));
  assert.equal(tooHigh.ok, false);
  assert.ok(tooHigh.errors.some(error => error.code === 'manual_cost_exceeds_total'));
});

test('verteilt Rundungsdifferenzen centgenau und deterministisch', () => {
  const input = { totalCost: .10, cards: [card('a'), card('b'), card('c')] };
  const first = model.allocateCollectionPurchaseCosts(input);
  const second = model.allocateCollectionPurchaseCosts(input);
  assert.equal(first.allocatedCents, 10);
  assert.deepEqual(first.lines.map(line => line.allocatedTotalCents), [4, 3, 3]);
  assert.deepEqual(second, first);
});

test('Privatentnahme behält ihren EK und wird nicht auf Verkaufskarten umverteilt', () => {
  const result = model.allocateCollectionPurchaseCosts({
    totalCost: 12,
    cards: [card('private', { privateQuantity: 1, referenceValue: 1 }), card('business', { referenceValue: 1 })]
  });
  assert.equal(result.ok, true);
  assert.equal(result.lines[0].privateTotalCents, 600);
  assert.equal(result.lines[0].businessTotalCents, 0);
  assert.equal(result.lines[1].businessTotalCents, 600);
  assert.equal(result.lines.reduce((sum, line) => sum + line.allocatedTotalCents, 0), 1200);
});

test('teilt eine Menge sauber in privaten und geschäftlichen Anteil', () => {
  const result = model.allocateCollectionPurchaseCosts({
    totalCost: 9,
    cards: [card('split', { quantity: 3, privateQuantity: 1, referenceValue: 2 })]
  });
  const line = result.lines[0];
  assert.equal(result.ok, true);
  assert.equal(line.privateQuantity, 1);
  assert.equal(line.businessQuantity, 2);
  assert.equal(line.privateTotalCents, 300);
  assert.equal(line.businessTotalCents, 600);
  assert.equal(line.privateTotalCents + line.businessTotalCents, line.allocatedTotalCents);
});

test('gibt den Abschluss nur bei exakt gleicher EK-Summe frei', () => {
  const cards = [card('a', { quantity: 2, privateQuantity: 1, referenceValue: 1 }), card('b', { referenceValue: 2 })];
  const allocation = model.allocateCollectionPurchaseCosts({ totalCost: 7.01, cards });
  const valid = model.validateCollectionEconomicCompletion({ totalCost: 7.01, cards, allocation });
  const wrongTotal = model.validateCollectionEconomicCompletion({ totalCost: 7.02, cards, allocation });
  assert.equal(allocation.allocatedCents, 701);
  assert.equal(valid.valid, true);
  assert.equal(valid.allocatedCents, 701);
  assert.equal(wrongTotal.valid, false);
  assert.ok(wrongTotal.errors.some(error => error.code === 'allocation_sum_mismatch'));
});

test('blockiert den wirtschaftlichen Abschluss bei offenen oder widersprüchlichen Daten', () => {
  const cards = [card('open', { completed: false }), card('bad-quantity', { quantity: 0 }), card('double-counted', { quantity: 1, privateQuantity: 2 })];
  const allocation = model.allocateCollectionPurchaseCosts({ totalCost: 10, cards: [card('open'), card('bad-quantity'), card('double-counted')] });
  const validation = model.validateCollectionEconomicCompletion({ totalCost: 10, cards, allocation });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some(error => error.code === 'card_unconfirmed'));
  assert.ok(validation.errors.some(error => error.code === 'invalid_quantity'));
  assert.ok(validation.errors.some(error => error.code === 'invalid_private_quantity'));
});

test('UI bleibt ein wirtschaftlicher Prüfabschluss ohne Bestandsübernahme', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'app', 'renderer', 'index.html'), 'utf8');
  const renderer = fs.readFileSync(path.join(root, 'app', 'renderer', 'app.js'), 'utf8');
  const section = html.match(/<section id="view-collectionpurchases"[\s\S]*?<section id="view-cardmarket"/)?.[0] || '';
  assert.match(section, /id="collectionEconomicsPanel"/);
  assert.match(section, /id="distributeCollectionCostsBtn"/);
  assert.match(section, /id="completeCollectionEconomicReviewBtn"/);
  assert.match(section, /wirtschaftlich geprüft \/ bereit zur Übernahme/i);
  const start = renderer.indexOf('function completeCollectionEconomicReview(){');
  const end = renderer.indexOf('\n}', start);
  const completion = start >= 0 && end > start ? renderer.slice(start, end + 2) : '';
  assert.ok(completion.length > 0);
  assert.doesNotMatch(completion, /state\.inventory|state\.purchases|confirmCollectionPurchase|linkedPurchaseId|PowerTools/i);
});
