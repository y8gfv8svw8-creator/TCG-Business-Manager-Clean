const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('Print-Referenzdiagnose ist vollständig über einen eigenen Nur-Lese-Kanal verdrahtet', () => {
  const main = read('app/main/main.js');
  const preload = read('app/main/preload.js');
  const html = read('app/renderer/index.html');
  const renderer = read('app/renderer/app.js');

  assert.match(main, /ipcMain\.handle\('print-reference:find-candidates'/);
  assert.match(main, /new PrintReferenceDatabase/);
  assert.match(preload, /findPrintCandidates: payload => ipcRenderer\.invoke\('print-reference:find-candidates', payload\)/);
  assert.match(html, /id="printReferenceSetCode"/);
  assert.match(html, /id="printReferenceRarity"/);
  assert.match(html, /id="printReferenceSearchBtn"/);
  assert.match(html, /id="printReferenceResults"/);
  assert.match(renderer, /window\.desktopApp\.findPrintCandidates\(\{setCode,rarity\}\)/);
  assert.match(renderer, /Setcode und Rarität ergeben genau einen Print/);
  assert.match(renderer, /Cardmarket-Produkt-ID/);
  assert.match(renderer, /Mapping-Status/);
  assert.match(renderer, /Datenquelle/);
});

test('Diagnosesuche speichert keine Bestands- oder Geschäftsdaten', () => {
  const renderer = read('app/renderer/app.js');
  const searchFunction = renderer.match(/async function searchPrintReference\(\)\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.ok(searchFunction, 'Die Diagnosesuche muss vorhanden sein.');
  assert.doesNotMatch(searchFunction, /saveState|inventory|purchases|sales|scanner|PowerTools/i);

  const main = read('app/main/main.js');
  const handler = main.match(/ipcMain\.handle\('print-reference:find-candidates',[\s\S]*?\n  \}\);/)?.[0] || '';
  assert.ok(handler, 'Der Diagnosekanal muss vorhanden sein.');
  assert.match(handler, /findPrintCandidates/);
  assert.doesNotMatch(handler, /saveState|upsert|INSERT|UPDATE|DELETE/i);
});
