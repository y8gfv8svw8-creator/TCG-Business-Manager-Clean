const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const recognition = require('../app/shared/scanner-recognition');
const photoModel = require('../app/shared/collection-photo-model');
const { CardScannerRecognizer } = require('../app/main/card-scanner-recognizer');
const { TcgDatabase } = require('../app/main/database');

const schemaPath = path.resolve(__dirname, '../database/schema.sql');
const sampleEntries = [
  { metacardId: '100', germanName: 'Nibiru, das Urwesen', englishName: 'Nibiru, the Primal Being', aliases: [{ language: 'de', alias: 'Nibiru das Urwesen' }], setCodes: ['RA01-EN015'] },
  { metacardId: '200', germanName: 'Blitzsturm', englishName: 'Lightning Storm', aliases: [], setCodes: ['KICO-EN057'] },
  { metacardId: '300', germanName: 'Blitzdrache', englishName: 'Lightning Dragon', aliases: [], setCodes: ['TEST-EN001'] },
  { metacardId: '400', germanName: 'Dunkler Magier', englishName: 'Dark Magician', aliases: [{ language: 'de', alias: 'Schwarzer Magier' }], setCodes: ['LOB-EN005'] }
];

function artwork(dHash, value = 0.2) {
  return { version: 'art-v1', dHash, histogram: Array(64).fill(1 / 64), lumaGrid: Array(64).fill(value) };
}

const signalEntries = [
  { metacardId: '700', germanName: 'Dunkler Magier', englishName: 'Dark Magician', aliases: [], passcodes: ['46986414'], artworkFingerprints: [artwork('0000000000000000', -0.8)] },
  { metacardId: '701', germanName: 'Blauäugiger w. Drache', englishName: 'Blue-Eyes White Dragon', aliases: [], passcodes: ['89631139'], artworkFingerprints: [artwork('ffffffffffffffff', 0.8)] },
  { metacardId: '702', germanName: 'Dunkles Magier-Mädchen', englishName: 'Dark Magician Girl', aliases: [], passcodes: ['38033121'], artworkFingerprints: [artwork('0f0f0f0f0f0f0f0f', -0.2)] }
];

function sandboxDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-name-recognition-'));
  const database = new TcgDatabase({ databasePath: path.join(root, 'data.sqlite'), schemaPath, backupRoot: path.join(root, 'backups') }).open();
  t.after(() => { database.close();fs.rmSync(root, { recursive: true, force: true }); });
  return database;
}

test('englischer OCR-Name liefert den kanonischen zweisprachigen Top-1-Kandidaten', () => {
  const result = recognition.rankNameCandidates(sampleEntries, [
    { text: 'NIBIRU THE PRIMAL BEING', confidence: 82, variant: 'luma' },
    { text: 'NIBIRU THE PRIMAL BE1NG', confidence: 67, variant: 'red' }
  ], { setCodes: ['RA01-EN015'], limit: 3 });
  assert.equal(result.candidates[0].metacardId, '100');
  assert.equal(result.candidates[0].matchedLanguage, 'en');
  assert.equal(result.nameConfidence, 'high');
  assert.equal(result.candidates[0].setCodeMatched, true);
});

test('deutscher Alias und typische OCR-Abweichung bleiben fuzzy auffindbar', () => {
  const result = recognition.rankNameCandidates(sampleEntries, [
    { text: 'SCHWARZER MAG1ER', confidence: 61, variant: 'blue' }
  ], { limit: 3 });
  assert.equal(result.candidates[0].metacardId, '400');
  assert.equal(result.candidates[0].matchedAlias, 'Schwarzer Magier');
  assert.ok(['low', 'medium', 'high'].includes(result.nameConfidence));
});

test('ähnliche Namen werden als mehrere Kandidaten gezeigt und nicht falsch sicher gemacht', () => {
  const result = recognition.rankNameCandidates(sampleEntries, [
    { text: 'LIGHTNING', confidence: 70, variant: 'luma' }
  ], { limit: 5 });
  assert.ok(result.candidates.some(row => row.metacardId === '200'));
  assert.ok(result.candidates.some(row => row.metacardId === '300'));
  assert.notEqual(result.nameConfidence, 'high');
});

test('auf mehrere OCR-Zeilen verteilte Namenswörter werden gemeinsam, aber nicht automatisch bestätigt', () => {
  const entries = [
    { metacardId: '410', germanName: 'Wächter-Sphinx', englishName: 'Guardian Sphinx', aliases: [] },
    { metacardId: '411', germanName: 'Androsphinx', englishName: 'Andro Sphinx', aliases: [] },
    { metacardId: '412', germanName: 'Torwächter', englishName: 'Gate Guardian', aliases: [] }
  ];
  const result = recognition.rankNameCandidates(entries, [
    { text: 'SPHINX\nWACHTEL', confidence: 48, variant: 'lower-luma' }
  ], { limit: 3 });
  assert.equal(result.candidates[0].metacardId, '410');
  assert.ok(result.candidates[0].reasonCodes.includes('multi_line_word_evidence'));
  assert.notEqual(result.candidates[0].confidence, 'confirmed');
});

test('Copyright-Zeichen am OCR-Zeilenende verwirft einen korrekt gelesenen Namen nicht', () => {
  const entries = [{ metacardId: '420', germanName: 'Menschlicher Drachenwurm', englishName: 'Human Dragonworm', aliases: [] }];
  const result = recognition.rankNameCandidates(entries, [
    { text: 'MENSCHLICHER DRACHENWURM ©', confidence: 55, variant: 'wide-luma' }
  ]);
  assert.equal(result.candidates[0].metacardId, '420');
  assert.ok(['medium', 'high'].includes(result.nameConfidence));
});

test('Setcode ohne lesbaren Namen erzeugt keine automatische Namensbehauptung', () => {
  const result = recognition.rankNameCandidates(sampleEntries, [
    { text: 'RA01-EN015', confidence: 95, variant: 'set-code' }
  ], { setCodes: ['RA01-EN015'], limit: 5 });
  assert.deepEqual(result.candidates, []);
  assert.equal(result.nameConfidence, 'unknown');
});

test('Normalisierung behandelt Umlaute, Apostrophe und Bindestriche ohne aggressive Gleichsetzung', () => {
  const entries = [
    { metacardId: '500', germanName: 'Rotäugiger schwarzer Drache', englishName: 'Red-Eyes B. Dragon', aliases: [] },
    { metacardId: '501', germanName: 'Rotäugiger schwarzer Meteor-Drache', englishName: 'Red-Eyes Black Meteor Dragon', aliases: [] },
    { metacardId: '502', germanName: 'Künstlerkumpel Schädelkrobatjoker', englishName: 'Performapal Skullcrobat Joker', aliases: [] },
    { metacardId: '503', germanName: 'Des Teufels Porträt', englishName: "The Portrait's Secret", aliases: [] }
  ];
  const umlaut = recognition.rankNameCandidates(entries, [{ text: 'KUNSTLERKUMPEL SCHADELKROBATJOKER', confidence: 70 }]);
  const hyphen = recognition.rankNameCandidates(entries, [{ text: 'RED EYES B DRAGON', confidence: 72 }]);
  const apostrophe = recognition.rankNameCandidates(entries, [{ text: 'THE PORTRAITS SECRET', confidence: 72 }]);
  assert.equal(umlaut.candidates[0].metacardId, '502');
  assert.equal(hyphen.candidates[0].metacardId, '500');
  assert.equal(apostrophe.candidates[0].metacardId, '503');
  assert.notEqual(hyphen.candidates[0].metacardId, '501');
});

test('typische OCR-Lesefehler bei scharfem S und LV-Stufen bleiben allgemein auffindbar', () => {
  const entries = [
    { metacardId: '510', germanName: 'Großer Koala', englishName: 'Big Koala', aliases: [] },
    { metacardId: '511', germanName: 'Bewaffneter Drache LV5', englishName: 'Armed Dragon LV5', aliases: [] },
    { metacardId: '512', germanName: 'Bewaffneter Drache LV7', englishName: 'Armed Dragon LV7', aliases: [] }
  ];
  const sharpS = recognition.rankNameCandidates(entries, [{ text: 'GROBER KOALA', confidence: 58 }]);
  const level = recognition.rankNameCandidates(entries, [{ text: 'BEWAFFNETER DRACHE 1V5', confidence: 54 }]);
  assert.equal(sharpS.candidates[0].metacardId, '510');
  assert.equal(level.candidates[0].metacardId, '511');
  assert.notEqual(level.candidates[0].metacardId, '512');
});

test('kurzer OCR-Randmüll wird entfernt und der echte Name bleibt in Top-3', () => {
  const entries = [
    { metacardId: '520', germanName: 'Tausenddrache', englishName: 'Thousand Dragon', aliases: [] },
    { metacardId: '521', germanName: 'Dreihörniger Drache', englishName: 'Tri-Horned Dragon', aliases: [] },
    { metacardId: '522', germanName: 'Feuerflügeldrache', englishName: 'Winged Dragon, Guardian of the Fortress #1', aliases: [] }
  ];
  const result = recognition.rankNameCandidates(entries, [{ text: '—— EY Trousawo DRAGON Al]', confidence: 34 }], { limit: 3 });
  assert.ok(result.candidates.slice(0, 3).some(row => row.metacardId === '520'));
  assert.notEqual(result.nameConfidence, 'high');
});

test('vertauschte Namenswörter erzeugen keinen falsch starken Treffer', () => {
  const entries = [
    { metacardId: '530', germanName: 'Umkehrglas', englishName: 'Reverse Jar', aliases: [] },
    { metacardId: '531', germanName: 'Faszinierender Kreis', englishName: 'Spellbinding Circle', aliases: [] }
  ];
  const result = recognition.rankNameCandidates(entries, [{ text: 'JAR EVERS', confidence: 79 }]);
  const reverseJar = result.candidates.find(row => row.metacardId === '530');
  assert.ok(!reverseJar || reverseJar.score < .8);
  assert.notEqual(result.nameConfidence, 'high');
});

test('mehrere OCR-Fehler können einen langen Namen finden, ein zu kurzer Text bleibt unsicher', () => {
  const entries = [
    ...sampleEntries,
    { metacardId: '600', germanName: 'Topf der Extravaganz', englishName: 'Pot of Extravagance', aliases: [] },
    { metacardId: '601', germanName: 'Topf der Begierden', englishName: 'Pot of Desires', aliases: [] }
  ];
  const damaged = recognition.rankNameCandidates(entries, [
    { text: 'T0PF DER EXTRAVAGAN2', confidence: 51, variant: 'threshold' },
    { text: 'TOPF DER EXTRAVAGANZ', confidence: 65, variant: 'luma' }
  ]);
  const short = recognition.rankNameCandidates(entries, [{ text: 'TOPF', confidence: 90 }]);
  assert.equal(damaged.candidates[0].metacardId, '600');
  assert.ok(damaged.candidates[0].supportCount >= 1);
  assert.notEqual(short.nameConfidence, 'high');
});

test('unlesbarer oder leerer Namensbereich liefert ehrlich unknown', () => {
  for (const text of ['', '12', 'ATK/ 2500 DEF/ 2100', 'KONAMI']) {
    const result = recognition.rankNameCandidates(sampleEntries, [{ text, confidence: 99 }]);
    assert.equal(result.nameConfidence, 'unknown');
    assert.deepEqual(result.candidates, []);
  }
});

test('eindeutiger Passcode schlägt nur eine Metakarte vor und bestätigt keinen Print', () => {
  const result = recognition.rankNameCandidates(signalEntries, [], { passcodes: ['46986414'], limit: 3 });
  assert.equal(result.candidates[0].metacardId, '700');
  assert.equal(result.candidates[0].passcodeMatched, true);
  assert.equal(result.candidates[0].matchedPasscode, '46986414');
  assert.equal(result.nameConfidence, 'low');
  assert.equal('productId' in result.candidates[0], false);
});

test('unbekannter oder unlesbarer Passcode erzeugt keinen negativen oder erfundenen Treffer', () => {
  const unknown = recognition.rankNameCandidates(signalEntries, [], { passcodes: ['11111111'] });
  const unreadable = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAGICIAN', confidence: 82 }], { passcodes: ['unlesbar'] });
  assert.deepEqual(unknown.candidates, []);
  assert.equal(unknown.nameConfidence, 'unknown');
  assert.equal(unreadable.candidates[0].metacardId, '700');
  assert.equal(unreadable.candidates[0].passcodeMatched, false);
});

test('OCR und Passcode verstärken sich bei Übereinstimmung', () => {
  const result = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAG1CIAN', confidence: 77, variant: 'local-contrast' }], { passcodes: ['46986414'] });
  assert.equal(result.candidates[0].metacardId, '700');
  assert.equal(result.candidates[0].passcodeMatched, true);
  assert.ok(['medium', 'high'].includes(result.nameConfidence));
  assert.equal(result.candidates[0].signalConflict, false);
});

test('widersprechender starker OCR-Name und Passcode bleiben sichtbar aber niemals hoch sicher', () => {
  const result = recognition.rankNameCandidates(signalEntries, [{ text: 'BLUE EYES WHITE DRAGON', confidence: 91 }], { passcodes: ['46986414'], limit: 3 });
  assert.ok(result.candidates.some(row => row.metacardId === '700' && row.passcodeMatched));
  assert.ok(result.candidates.some(row => row.metacardId === '701' && row.signalConflict));
  assert.notEqual(result.nameConfidence, 'high');
  assert.ok(result.conflicts.includes('passcode_conflict'));
});

test('Artwork kann einen vorsichtigen Metakarten-Kandidaten liefern, aber allein nie hohe Sicherheit', () => {
  const strong = recognition.rankNameCandidates(signalEntries, [], { artworkFingerprints: [artwork('0000000000000000', -0.8)] });
  const weak = recognition.rankNameCandidates(signalEntries, [], { artworkFingerprints: [{ dHash: 'aaaaaaaaaaaaaaaa' }] });
  assert.equal(strong.candidates[0].metacardId, '700');
  assert.equal(strong.candidates[0].artworkSimilarity, 1);
  assert.notEqual(strong.nameConfidence, 'high');
  assert.deepEqual(weak.candidates, []);
});

test('OCR und Artwork erhöhen nur bei konsistentem Signal die Sicherheit', () => {
  const agreeing = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAGICIAN', confidence: 86 }], { artworkFingerprints: [artwork('0000000000000000', -0.8)] });
  const conflicting = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAGICIAN', confidence: 90 }], { artworkFingerprints: [artwork('ffffffffffffffff', 0.8)] });
  assert.equal(agreeing.candidates[0].metacardId, '700');
  assert.ok(['medium', 'high'].includes(agreeing.nameConfidence));
  assert.notEqual(conflicting.nameConfidence, 'high');
  assert.ok(conflicting.candidates.some(row => row.signalConflict));
});

test('Passcode und Artwork zusammen bleiben ohne lesbaren Namen ein prüfbarer Vorschlag', () => {
  const result = recognition.rankNameCandidates(signalEntries, [], {
    passcodes: ['46986414'], artworkFingerprints: [artwork('0000000000000000', -0.8)]
  });
  assert.equal(result.candidates[0].metacardId, '700');
  assert.equal(result.candidates[0].passcodeMatched, true);
  assert.equal(result.candidates[0].artworkSimilarity, 1);
  assert.notEqual(result.candidates[0].confidence, 'confirmed');
});

test('alle drei konsistenten Signale liefern hohe Namenssicherheit ohne Printbestätigung', () => {
  const result = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAGICIAN', confidence: 91 }], {
    passcodes: ['46986414'], artworkFingerprints: [artwork('0000000000000000', -0.8)]
  });
  assert.equal(result.candidates[0].metacardId, '700');
  assert.equal(result.nameConfidence, 'high');
  assert.ok(Math.abs(result.candidates[0].signalScores.ocr - .911) < .0001);
  assert.equal(result.candidates[0].signalScores.passcode, 1);
  assert.equal(result.candidates[0].signalScores.artwork, 1);
  assert.equal(result.candidates[0].productId, undefined);
});

test('Top-3 erhält den richtigen ähnlichen Kandidaten auch bei falschem Top-1', () => {
  const result = recognition.rankNameCandidates(signalEntries, [{ text: 'DARK MAGIC GIRL', confidence: 55 }], { limit: 3 });
  assert.equal(result.candidates[0].metacardId, '702');
  assert.ok(result.candidates.slice(0, 3).some(row => row.metacardId === '700'));
});

test('OCR-Kandidat behält Score, Alias-Kontext und technische Signale in der Fotostruktur', () => {
  const observation = photoModel.normalizeObservation({
    photoId: 'p1', boundingBox: { x: .1, y: .1, width: .3, height: .4 },
    selectedName: '', nameConfidence: 'medium',
    nameCandidates: [{ id: 'ocr-name-100', name: 'Nibiru, das Urwesen', englishName: 'Nibiru, the Primal Being', metacardId: '100', source: 'automatic_ocr', confidence: 'medium', score: .81234, matchedAlias: 'Nibiru, the Primal Being', matchedLanguage: 'en', ocrText: 'NIBIRU THE PRIMAL BEING', ocrConfidence: 66.66, supportCount: 2, setCodeMatched: true, reasonCodes: ['title_ocr', 'set_code_support_only'] }]
  }, 'a1');
  assert.equal(observation.selectedName, '');
  assert.equal(observation.nameCandidates[0].score, .81234);
  assert.equal(observation.nameCandidates[0].ocrConfidence, 66.7);
  assert.equal(observation.nameCandidates[0].matchedLanguage, 'en');
  assert.deepEqual(observation.nameCandidates[0].reasonCodes, ['title_ocr', 'set_code_support_only']);
});

test('Namensvorschlag verändert weder bestätigten Namen noch Print-, Preis- oder Bestandsfelder', () => {
  const source = {
    photoId: 'p1', boundingBox: { x: .1, y: .1, width: .3, height: .4 },
    selectedName: 'Dunkler Magier', nameConfidence: 'confirmed',
    selectedProductId: '46919', printConfidence: 'confirmed', linkedCollectionItemId: 'line-1',
    estimatedValue: 12.5, nameCandidates: [{ name: 'Dark Magician', metacardId: '400', source: 'automatic_ocr', score: .9 }]
  };
  const observation = photoModel.normalizeObservation(source, 'a1');
  assert.equal(observation.selectedName, 'Dunkler Magier');
  assert.equal(observation.nameConfidence, 'confirmed');
  assert.equal(observation.selectedProductId, '46919');
  assert.equal(observation.printConfidence, 'confirmed');
  assert.equal(observation.linkedCollectionItemId, 'line-1');
  assert.equal(observation.estimatedValue, 12.5);
});

test('lokaler OCR-Worker wird für mehrere Region-Pässe wiederverwendet', async t => {
  const calls = [];
  const worker = {
    setParameters: async parameters => calls.push(['parameters', parameters]),
    recognize: async () => ({ data: { text: calls.filter(row => row[0] === 'recognize').length ? 'NIBIRU THE PRIMAL BEING' : 'NIBIRU THE PRIMAL BEING', confidence: 77 } }),
    terminate: async () => calls.push(['terminate'])
  };
  worker.recognize = async () => { calls.push(['recognize']);return { data: { text: 'NIBIRU THE PRIMAL BEING', confidence: 77 } }; };
  let factoryCalls = 0;
  const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-ocr-worker-'));
  const recognizer = new CardScannerRecognizer({ cacheRoot, workerFactory: async () => { factoryCalls += 1;return worker; } });
  t.after(async () => { await recognizer.terminate();fs.rmSync(cacheRoot, { recursive: true, force: true }); });
  const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=';
  await recognizer.recognize({ imageDataUrl, passes: [{ kind: 'title', variant: 'luma', imageDataUrl }] });
  await recognizer.recognize({ imageDataUrl, passes: [{ kind: 'title', variant: 'red', imageDataUrl }] });
  assert.equal(factoryCalls, 1);
  assert.equal(calls.filter(row => row[0] === 'recognize').length, 2);
});

test('SQLite-Katalog liefert OCR-Namenskandidaten aus deutschen, englischen und Alias-Namen', t => {
  const database = sandboxDatabase(t);
  database.upsertProducts([
    { productId: '700001', metacardId: '100', officialName: 'Nibiru, the Primal Being', setName: 'Rarity Collection', setCode: 'RA01-EN015', rarity: 'Secret Rare' },
    { productId: '700002', metacardId: '200', officialName: 'Lightning Storm', setName: "King's Court", setCode: 'KICO-EN057', rarity: 'Ultra Rare' }
  ]);
  database.upsertCardNames({
    mappings: [
      { metacardId: '100', nameDe: 'Nibiru, das Urwesen', nameEn: 'Nibiru, the Primal Being' },
      { metacardId: '200', nameDe: 'Blitzsturm', nameEn: 'Lightning Storm' }
    ],
    aliases: [{ metacardId: '100', language: 'de', alias: 'Nibiru das Urwesen' }],
    replaceAliases: true
  });
  const english = database.recognizeCardNames({ readings: [{ text: 'NIBIRU THE PRIMAL BEING', confidence: 80 }], setCodes: ['RA01-EN015'] });
  const german = database.recognizeCardNames({ readings: [{ text: 'BLITZSTURM', confidence: 80 }] });
  assert.equal(english.candidates[0].metacardId, '100');
  assert.equal(german.candidates[0].metacardId, '200');
  assert.equal(database.getCardNameRecognitionIndex(), database.getCardNameRecognitionIndex(), 'Index wird wiederverwendet');
  database.clearMarketData();
  assert.deepEqual(database.getCardNameRecognitionIndex(), [], 'Ein gelöschter Kartenkatalog bleibt nicht im Speicher-Cache');
});

test('SQLite-Katalog trennt Passcode-Mapping von Namensalias und nutzt ihn nur für die Metakarte', t => {
  const database = sandboxDatabase(t);
  database.upsertProducts([{ productId: '700001', metacardId: '100', officialName: 'Dark Magician', setName: 'Legend of Blue Eyes', setCode: 'LOB-EN005' }]);
  database.upsertCardNames({ mappings: [{ metacardId: '100', nameDe: 'Dunkler Magier', nameEn: 'Dark Magician' }], aliases: [], replaceAliases: true });
  database.saveState({ settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], cardNamePasscodes: [{ metacardId: '100', passcode: '46986414' }] });
  const index = database.getCardNameRecognitionIndex();
  const result = database.recognizeCardNames({ passcodes: ['46986414'] });
  assert.deepEqual(index[0].passcodes, ['46986414']);
  assert.equal(index[0].aliases.some(row => row.language === 'passcode'), false);
  assert.equal(result.candidates[0].metacardId, '100');
  assert.notEqual(result.candidates[0].matchedAlias, '46986414');
});

test('automatische Namenskandidaten bleiben nach SQLite-Save/Load unbestätigt', t => {
  const database = sandboxDatabase(t);
  const state = { settings: { autoBackup: false }, inventory: [], privateCollection: [], purchases: [], sales: [], collectionPurchaseAnalyses: [{
    id: 'a1', title: 'OCR', items: [], decisionSnapshots: [], photos: [{ id: 'p1', relativePath: 'Daten/Sammlungsfotos/a1/test.png' }], physicalCards: [],
    photoObservations: [{ id: 'o1', photoId: 'p1', boundingBox: { x: .1, y: .1, width: .3, height: .4 }, selectedName: '', nameConfidence: 'high', nameCandidates: [{ id: 'ocr-name-100', name: 'Nibiru, das Urwesen', metacardId: '100', source: 'automatic_ocr', confidence: 'high', score: .91 }], nameRecognition: { lastRunAt: '2026-08-28T10:00:00.000Z', confidenceScore: .91 } }]
  }] };
  database.saveState(state);
  const loaded = database.loadState().state.collectionPurchaseAnalyses[0].photoObservations[0];
  assert.equal(loaded.selectedName, '');
  assert.equal(loaded.nameConfidence, 'high');
  assert.equal(loaded.nameCandidates[0].source, 'automatic_ocr');
  assert.equal(loaded.nameCandidates[0].score, .91);
  assert.equal(loaded.nameRecognition.confidenceScore, .91);
});
