const test = require('node:test');
const assert = require('node:assert/strict');

const cardSearch = require('../app/shared/card-search');

test('normalisiert Großschreibung, Umlaute und zusätzliche Leerzeichen', () => {
  assert.equal(cardSearch.normalizeSpaced('  ÜBER   Größen  '), 'uber grossen');
});

test('behandelt Bindestriche und Apostrophe als optionale Schreibzeichen', () => {
  const document = cardSearch.buildSearchDocument([
    'Blue-Eyes White Dragon',
    'Fiendsmith’s Requiem'
  ]);

  assert.equal(cardSearch.matchesSearch(document, 'blue eyes'), true);
  assert.equal(cardSearch.matchesSearch(document, 'BlueEyes'), true);
  assert.equal(cardSearch.matchesSearch(document, 'BlueEyes dragon'), true);
  assert.equal(cardSearch.matchesSearch(document, "fiendsmith's req"), true);
  assert.equal(cardSearch.matchesSearch(document, 'fiendsmiths'), true);
});

test('unterstützt Teilbegriffe unabhängig von Großschreibung und Wortabständen', () => {
  const document = cardSearch.buildSearchDocument([
    'Aschenblüte & Freudiger Frühling',
    'Ash Blossom & Joyous Spring'
  ]);

  assert.equal(cardSearch.matchesSearch(document, 'ASCHENBLUTE fruh'), true);
  assert.equal(cardSearch.matchesSearch(document, 'ash   joy'), true);
  assert.equal(cardSearch.matchesSearch(document, 'blossom spring'), true);
});

test('erkennt lokalisierte und sprachneutrale Setnummern eindeutig', () => {
  assert.deepEqual(cardSearch.parseSetCode(' RA01-DE008 '), { prefix:'RA01', language:'DE', number:'008', neutral:'RA01-008', full:'RA01-DE008' });
  assert.deepEqual(cardSearch.parseSetCode('ra01-008'), { prefix:'RA01', language:'', number:'008', neutral:'RA01-008', full:'RA01-008' });
  assert.equal(cardSearch.parseSetCode('008'), null);
});
