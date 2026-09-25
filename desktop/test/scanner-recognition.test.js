const test = require('node:test');
const assert = require('node:assert/strict');
const recognition = require('../app/shared/scanner-recognition');

test('liest typische Yu-Gi-Oh!-Setnummern aus OCR-Text', () => {
  const text = 'CLOWN CREW DISTY\nBLCR-EN042\nATK/ 1800 DEF/ 1000';
  assert.deepEqual(recognition.extractSetCodes(text), ['BLCR-EN042']);
  assert.equal(recognition.buildQueries({ text })[0], 'BLCR-EN042');
});

test('liest historische einbuchstabige Sprachcodes ohne sie sprachneutral zu machen', () => {
  assert.equal(recognition.normalizeSetCode('SDK-G038'), 'SDK-G038');
  assert.equal(recognition.normalizeSetCode('LON-E006'), 'LON-E006');
  assert.deepEqual(recognition.extractSetCodes('SDK-G038 und LON-E006'), ['SDK-G038', 'LON-E006']);
});

test('korrigiert häufige OCR-Verwechslungen im Zahlenteil', () => {
  assert.equal(recognition.normalizeSetCode('RA01-ENO08'), 'RA01-EN008');
  assert.equal(recognition.normalizeSetCode('BLGG-ENO17'), 'BLGG-EN017');
  assert.equal(recognition.normalizeSetCode('RA01 - 0I8'), 'RA01-018');
  assert.deepEqual(recognition.setCodeAliases('RAO01-EN008'), ['RAO01-EN008', 'RA01-EN008']);
});

test('liest Kartenpasscode und Edition aus dem unteren Kartenrand', () => {
  assert.deepEqual(recognition.extractPasscodes('60700283 1st Edition'), ['60700283']);
  assert.equal(recognition.extractEdition('60700283 1 Edition'), '1st Edition');
});

test('erzeugt fehlertolerante Suchbegriffe aus teilweise erkanntem Kartennamen', () => {
  const aliases = recognition.titleQueryAliases('dx LARKNIGHT CYGNIAN');
  assert.ok(aliases.includes('LARKNIGHT CYGNIAN'));
  assert.ok(recognition.titleSimilarity('LARKNIGHT CYGNIAN', 'Tellarknight Cygnian') > 0.75);
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
