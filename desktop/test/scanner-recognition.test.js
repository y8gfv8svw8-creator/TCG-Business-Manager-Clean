const test = require('node:test');
const assert = require('node:assert/strict');
const recognition = require('../app/shared/scanner-recognition');

test('liest typische Yu-Gi-Oh!-Setnummern aus OCR-Text', () => {
  const text = 'CLOWN CREW DISTY\nBLCR-EN042\nATK/ 1800 DEF/ 1000';
  assert.deepEqual(recognition.extractSetCodes(text), ['BLCR-EN042']);
  assert.equal(recognition.buildQueries({ text })[0], 'BLCR-EN042');
});

test('korrigiert häufige OCR-Verwechslungen im Zahlenteil', () => {
  assert.equal(recognition.normalizeSetCode('RA01-ENO08'), 'RA01-EN008');
  assert.equal(recognition.normalizeSetCode('RA01 - 0I8'), 'RA01-018');
  assert.deepEqual(recognition.setCodeAliases('RAO01-EN008'), ['RAO01-EN008', 'RA01-EN008']);
});

test('bevorzugt Kartenname und verwirft Regeltext sowie Werte', () => {
  const titles = recognition.extractTitleCandidates('CLOWN CREW DISTY\nSPELL CARD\nATK/ 1200 DEF/ 500\nOnce per turn: You can target one card.');
  assert.equal(titles[0], 'CLOWN CREW DISTY');
  assert.ok(!titles.some(row => row.includes('ATK/')));
});

test('ordnet eine eindeutige Druckvariante anhand der Setnummer zu', () => {
  const products = [
    { productId: '1', collectorNumber: 'RA01-EN008' },
    { productId: '2', collectorNumber: 'RA01-EN009' }
  ];
  assert.deepEqual(recognition.exactCodeMatches(products, ['RA01-EN008']).map(row => row.productId), ['1']);
});
