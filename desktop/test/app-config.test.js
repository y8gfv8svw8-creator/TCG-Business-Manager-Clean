const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_SETTINGS, normalizeSettings, resolveTheme } = require('../app/shared/app-config');

test('ergänzt neue Einstellungen verlustfrei bei alten Programmständen', () => {
  const settings = normalizeSettings({ feePercent: 6, minProfit: 1.25, customFutureValue: 'bleibt' });
  assert.equal(settings.feePercent, 6);
  assert.equal(settings.minProfit, 1.25);
  assert.equal(settings.themeMode, 'system');
  assert.equal(settings.scannerEnabled, true);
  assert.equal(settings.targetRoi, 30);
  assert.equal(settings.expectedCardsPerOrder, 3);
  assert.equal(settings.customFutureValue, 'bleibt');
});

test('begrenzt fehlerhafte Einstellungen auf sichere Werte', () => {
  const settings = normalizeSettings({
    feePercent: -5,
    safetyPercent: 200,
    scannerMinConfidence: 140,
    stockAgeWarningDays: 120,
    stockAgeCriticalDays: 30,
    themeMode: 'schwarz'
  });
  assert.equal(settings.feePercent, 0);
  assert.equal(settings.safetyPercent, 50);
  assert.equal(settings.scannerMinConfidence, 100);
  assert.equal(settings.stockAgeCriticalDays, 120);
  assert.equal(settings.themeMode, DEFAULT_SETTINGS.themeMode);
});

test('löst System-, Hell- und Dunkelmodus eindeutig auf', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});
