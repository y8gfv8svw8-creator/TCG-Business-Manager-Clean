const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Datumshelfer fuer vorhandene Sammlungsankauefe ist beim ersten SQLite-Laden bereits verfuegbar', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'app.js'), 'utf8');
  const initialLoad = source.indexOf('let state = loadState();');
  assert.ok(initialLoad > 0, 'initialer Zustandsabruf fehlt');
  assert.match(source, /function todayISO\s*\(\)\s*\{/);
  assert.doesNotMatch(source, /const todayISO\s*=/);
  assert.match(source.slice(source.indexOf('function migrateState'), source.indexOf('function loadState')), /date:todayISO\(\)/);
});

test('Desktop-Start verwendet den bereits validierten SQLite-State ohne erneutes Vollspeichern', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'app.js'), 'utf8');
  const index = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'index.html'), 'utf8');
  assert.match(index, /window\.__TCG_DESKTOP_STATE__\s*=\s*databaseState\.state/);
  assert.match(source, /window\.__TCG_DESKTOP_STATE__/);
  assert.doesNotMatch(source, /Erster SQLite-Abgleich/);
  assert.doesNotMatch(source, /window\.desktopApp\.saveState\(state\)\.then/);
  assert.match(source, /if \(!window\.desktopApp\?\.saveState\) localStorage\.setItem\(DB_KEY/);
});
