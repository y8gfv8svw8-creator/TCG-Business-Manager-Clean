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
