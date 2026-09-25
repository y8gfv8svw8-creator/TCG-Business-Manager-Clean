const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { renderPreservingFields } = require('../app/shared/renderer-field-state');

class FakeField {
  constructor(document, { id = '', value = '', type = 'text', name = '', dataset = {}, checked = false } = {}) {
    this.ownerDocument = document;
    this.tagName = type === 'textarea' ? 'TEXTAREA' : 'INPUT';
    this.type = type === 'textarea' ? '' : type;
    this.id = id;
    this.value = value;
    this.name = name;
    this.dataset = dataset;
    this.checked = checked;
    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.selectionDirection = 'none';
  }

  getAttribute(name) {
    return name === 'name' ? this.name : null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  setSelectionRange(start, end, direction) {
    this.selectionStart = start;
    this.selectionEnd = end;
    this.selectionDirection = direction;
  }
}

function fakeDocument(fieldDefinitions) {
  const document = {
    nodeType: 9,
    activeElement: null,
    fields: [],
    querySelectorAll() { return this.fields; }
  };
  document.fields = fieldDefinitions.map(definition => new FakeField(document, definition));
  return document;
}

test('Hintergrund-Refresh erhält fokussierte und weitere ungespeicherte Eingaben generisch', () => {
  const document = fakeDocument([
    { id: 'settingFee', value: '5' },
    { value: '1.00', type: 'number', dataset: { draftPrice: 'line-1' } },
    { value: '2.00', type: 'number', dataset: { draftPrice: 'line-2' } }
  ]);
  document.fields[0].value = '987.65';
  document.fields[0].selectionStart = 2;
  document.fields[0].selectionEnd = 6;
  document.fields[0].selectionDirection = 'forward';
  document.fields[0].focus();
  document.fields[1].value = '12.34';
  document.fields[2].value = '56.78';

  renderPreservingFields(() => {
    document.fields = [
      new FakeField(document, { id: 'settingFee', value: '5' }),
      new FakeField(document, { value: '1.00', type: 'number', dataset: { draftPrice: 'line-1' } }),
      new FakeField(document, { value: '2.00', type: 'number', dataset: { draftPrice: 'line-2' } })
    ];
  }, { root: document });

  assert.equal(document.fields[0].value, '987.65');
  assert.equal(document.fields[1].value, '12.34');
  assert.equal(document.fields[2].value, '56.78');
  assert.equal(document.activeElement, document.fields[0]);
  assert.equal(document.fields[0].selectionStart, 2);
  assert.equal(document.fields[0].selectionEnd, 6);
});

test('Cardmarket-Start speichert und rendert den vollständigen App-State nicht mehr bedingungslos', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'cardmarket-data-center.js'), 'utf8');
  assert.doesNotMatch(source, /cardmarket_startup_save_requested/);
  assert.doesNotMatch(source, /saveState\(\);\s*renderAll\(\);\s*cmRefreshMetadataFromDb/);
  assert.match(source, /cmRefreshMetadataFromDb\(\{includeSqlite:false\}\)/);
});

test('Nachlaufende Startabfragen lösen höchstens einen geschützten Vollrefresh aus', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'renderer', 'app.js'), 'utf8');
  const start = source.slice(source.indexOf('scheduleStartupBackgroundWork(()=>{'), source.indexOf('// Eine alte Browserinstallation', source.indexOf('scheduleStartupBackgroundWork(()=>{')));
  assert.match(start, /refreshMarketDecisionHistory\(true,\{render:false\}\)/);
  assert.match(start, /refreshOwnSalesExperience\(true,\{render:false\}\)/);
  assert.equal((start.match(/renderAllPreservingUserInput\(\)/g) || []).length, 1);
  assert.doesNotMatch(start, /renderAll\(\)/);
});

test('Große Markt-Zusammenfassungen laufen erst nach der UI-Freigabe', () => {
  const databaseSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'main', 'database.js'), 'utf8');
  const open = databaseSource.slice(databaseSource.indexOf('  open() {'), databaseSource.indexOf('  tableColumns(', databaseSource.indexOf('  open() {')));
  assert.doesNotMatch(open, /ensureSnapshotSummaries\(\)/);
  assert.doesNotMatch(open, /ensureObservationSummaries\(\)/);

  const mainSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'main', 'main.js'), 'utf8');
  assert.match(mainSource, /ipcMain\.on\('startup:ui-ready'/);
  assert.match(mainSource, /database\.ensureSnapshotSummaries\(\)/);
  assert.match(mainSource, /database\.ensureObservationSummaries\(\)/);
});
