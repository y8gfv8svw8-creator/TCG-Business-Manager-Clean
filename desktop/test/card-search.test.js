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

test('liest Cardmarket-Versionsnummer und Seltenheit aus dem Kartennamen', () => {
  assert.deepEqual(cardSearch.parseVariantLabel('Kashtira Fenrir (V.2 - Ultra Rare)'), {
    original:'Kashtira Fenrir (V.2 - Ultra Rare)',
    baseName:'Kashtira Fenrir',
    variant:'V.2',
    variantNumber:2,
    rarity:'Ultra Rare'
  });
});

test('liest Set und englischen Produktnamen aus einem direkten Cardmarket-Link', () => {
  assert.deepEqual(cardSearch.parseCardmarketProductUrl('https://www.cardmarket.com/de/YuGiOh/Products/Singles/Rarity-Collection-5/Kashtira-Fenrir-V2-Ultra-Rare?language=1'),{
    setSlug:'Rarity-Collection-5',
    productSlug:'Kashtira-Fenrir-V2-Ultra-Rare',
    productBase:'Kashtira-Fenrir'
  });
});

test('ordnet Varianten nur in ausreichend großen, eindeutig sortierbaren Druckgruppen zu', () => {
  const inferred=cardSearch.inferVariantOrdinals([
    {productId:'400',metacardId:'10',expansionId:'20'},
    {productId:'300',metacardId:'10',expansionId:'20'},
    {productId:'100',metacardId:'10',expansionId:'20'},
    {productId:'200',metacardId:'10',expansionId:'20'},
    {productId:'500',metacardId:'11',expansionId:'21'},
    {productId:'600',metacardId:'11',expansionId:'21'},
    {productId:'700',metacardId:'11',expansionId:'21'},
    {productId:'800',metacardId:'12',expansionId:'22'},
    {productId:'900',metacardId:'12',expansionId:'22'}
  ]);
  const reliable=inferred.filter(row=>row.metacardId==='10').sort((a,b)=>Number(a.productId)-Number(b.productId));
  assert.deepEqual(reliable.map(row=>row.inferredVariant),['V.1','V.2','V.3','V.4']);
  assert.equal(inferred.find(row=>row.metacardId==='11').inferredVariant,undefined);
  assert.deepEqual(inferred.filter(row=>row.metacardId==='12').map(row=>row.inferredVariant),['V.1','V.2']);
});

test('liefert nur eine sichere CM-ID bei exaktem Namen, Set, Version und passender Seltenheit', () => {
  const candidates=cardSearch.inferVariantOrdinals([
    {productId:'100',metacardId:'10',expansionId:'20',germanName:'Kashtira Fenrir',setName:'Darkwing Blast',rarity:'Secret Rare'},
    {productId:'200',metacardId:'10',expansionId:'20',germanName:'Kashtira Fenrir',setName:'Darkwing Blast',rarity:'Ultra Rare'},
    {productId:'300',metacardId:'10',expansionId:'20',germanName:'Kashtira Fenrir',setName:'Darkwing Blast',rarity:'Collector Rare'},
    {productId:'400',metacardId:'10',expansionId:'20',germanName:'Kashtira Fenrir',setName:'Darkwing Blast',rarity:'Ultimate Rare'}
  ]);
  const match=cardSearch.selectSafeVariant({name:'Kashtira Fenrir (V.2 - Ultra Rare)',setName:'Darkwing Blast',rarity:'Ultra Rare'},candidates);
  assert.equal(match.productId,'200');
  const linkMatch=cardSearch.selectSafeVariant({
    name:'Kashtira Fenrir (V.2 - Ultra Rare)',
    productUrl:'https://www.cardmarket.com/de/YuGiOh/Products/Singles/Darkwing-Blast/Kashtira-Fenrir-V2-Ultra-Rare'
  },candidates);
  assert.equal(linkMatch.productId,'200');
  assert.equal(cardSearch.selectSafeVariant({name:'Kashtira Fenrir',setName:'Darkwing Blast'},candidates),null);
  assert.equal(cardSearch.selectSafeVariant({name:'Kashtira Fenrir (V.2 - Secret Rare)',setName:'Darkwing Blast',rarity:'Secret Rare'},candidates),null);
});
