const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { bumpPatch, nextPatchVersion, parseVersion, verifyVersionConsistency } = require('../scripts/release-version');

test('Patch-Version wird genau um eins erhöht', () => {
  assert.deepEqual(parseVersion('6.13.6'), { major: 6, minor: 13, patch: 6 });
  assert.equal(nextPatchVersion('6.13.6'), '6.13.7');
  assert.equal(nextPatchVersion('6.13.7'), '6.13.8');
});

test('Release-Metadaten und sichtbare Versionsangaben sind konsistent', () => {
  const result = verifyVersionConsistency(path.resolve(__dirname, '..'));
  assert.deepEqual(result, {
    version: '6.13.8',
    installerName: 'TCG Business Manager-Setup-6.13.8.exe'
  });
});

test('Release-Vorbereitung erhöht und synchronisiert alle Versionsstellen gemeinsam', () => {
  const sourceRoot = path.resolve(__dirname, '..');
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-release-version-'));
  const relativeFiles = [
    'package.json',
    'package-lock.json',
    path.join('app', 'main', 'main.js'),
    path.join('app', 'renderer', 'index.html'),
    'README.md',
    'INSTALLIEREN.bat'
  ];
  try {
    for (const relativeFile of relativeFiles) {
      const target = path.join(tempRoot, relativeFile);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(sourceRoot, relativeFile), target);
    }
    const result = bumpPatch(tempRoot);
    assert.deepEqual(result, {
      version: '6.13.9',
      installerName: 'TCG Business Manager-Setup-6.13.9.exe'
    });
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
