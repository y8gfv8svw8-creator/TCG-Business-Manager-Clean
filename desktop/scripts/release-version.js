const fs = require('node:fs');
const path = require('node:path');

const DESKTOP_ROOT = path.resolve(__dirname, '..');

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value || '').trim());
  if (!match) throw new Error(`Ungültige Programmversion: ${value || '(leer)'}`);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function nextPatchVersion(value) {
  const parsed = parseVersion(value);
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function replaceRequired(contents, pattern, replacement, label) {
  if (!pattern.test(contents)) throw new Error(`Versionsangabe fehlt: ${label}`);
  return contents.replace(pattern, replacement);
}

function versionFiles(root = DESKTOP_ROOT) {
  return {
    packageJson: path.join(root, 'package.json'),
    packageLock: path.join(root, 'package-lock.json'),
    main: path.join(root, 'app', 'main', 'main.js'),
    renderer: path.join(root, 'app', 'renderer', 'index.html'),
    readme: path.join(root, 'README.md'),
    installerHelper: path.join(root, 'INSTALLIEREN.bat')
  };
}

function bumpPatch(root = DESKTOP_ROOT) {
  const files = versionFiles(root);
  const packageJson = readJson(files.packageJson);
  const nextVersion = nextPatchVersion(packageJson.version);
  packageJson.version = nextVersion;
  writeJson(files.packageJson, packageJson);

  const packageLock = readJson(files.packageLock);
  packageLock.version = nextVersion;
  if (!packageLock.packages?.['']) throw new Error('Root-Paket fehlt in package-lock.json.');
  packageLock.packages[''].version = nextVersion;
  writeJson(files.packageLock, packageLock);

  const replacements = [
    [files.main, /const APP_TITLE = 'TCG Business Manager – Analysecenter \d+\.\d+\.\d+';/, `const APP_TITLE = 'TCG Business Manager – Analysecenter ${nextVersion}';`, 'Anwendungstitel'],
    [files.renderer, /<title>TCG Business Manager \d+\.\d+\.\d+<\/title>/, `<title>TCG Business Manager ${nextVersion}</title>`, 'Fenstertitel'],
    [files.renderer, /<div class="brand-subtitle">Analysecenter \d+\.\d+\.\d+ · SQLite<\/div>/, `<div class="brand-subtitle">Analysecenter ${nextVersion} · SQLite</div>`, 'About-/Untertitel'],
    [files.readme, /^# TCG Business Manager – Analysecenter \d+\.\d+\.\d+/m, `# TCG Business Manager – Analysecenter ${nextVersion}`, 'README-Titel'],
    [files.installerHelper, /^echo TCG Business Manager Analysecenter \d+\.\d+\.\d+(?=\r?$)/m, `echo TCG Business Manager Analysecenter ${nextVersion}`, 'Installationsanzeige']
  ];
  for (const [filePath, pattern, replacement, label] of replacements) {
    const contents = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(filePath, replaceRequired(contents, pattern, replacement, label), 'utf8');
  }
  return verifyVersionConsistency(root);
}

function verifyVersionConsistency(root = DESKTOP_ROOT) {
  const files = versionFiles(root);
  const packageJson = readJson(files.packageJson);
  const version = String(packageJson.version || '');
  parseVersion(version);
  const packageLock = readJson(files.packageLock);
  const errors = [];
  const expect = (condition, message) => { if (!condition) errors.push(message); };

  expect(packageLock.version === version, `package-lock.json: ${packageLock.version} statt ${version}`);
  expect(packageLock.packages?.['']?.version === version, `package-lock Root-Paket: ${packageLock.packages?.['']?.version} statt ${version}`);
  expect(fs.readFileSync(files.main, 'utf8').includes(`TCG Business Manager – Analysecenter ${version}`), 'Anwendungstitel ist nicht synchron.');
  const renderer = fs.readFileSync(files.renderer, 'utf8');
  expect(renderer.includes(`<title>TCG Business Manager ${version}</title>`), 'Fenstertitel ist nicht synchron.');
  expect(renderer.includes(`Analysecenter ${version} · SQLite`), 'About-/Untertitel ist nicht synchron.');
  expect(fs.readFileSync(files.readme, 'utf8').startsWith(`# TCG Business Manager – Analysecenter ${version}`), 'README-Version ist nicht synchron.');
  expect(fs.readFileSync(files.installerHelper, 'utf8').includes(`TCG Business Manager Analysecenter ${version}`), 'Installationsanzeige ist nicht synchron.');
  expect(packageJson.build?.win?.artifactName === '${productName}-Setup-${version}.${ext}', 'Installer-Dateiname muss die Paketversion verwenden.');
  expect(Boolean(packageJson.build?.appId), 'Windows-App-ID fehlt.');
  expect(packageJson.build?.productName === packageJson.productName, 'Windows-Produktname und Paket-Produktname unterscheiden sich.');

  if (errors.length) throw new Error(`Release-Version ${version} ist nicht konsistent:\n- ${errors.join('\n- ')}`);
  return { version, installerName: `${packageJson.productName}-Setup-${version}.exe` };
}

if (require.main === module) {
  try {
    const result = process.argv.includes('--bump-patch') ? bumpPatch() : verifyVersionConsistency();
    console.log(`Windows-Release ${result.version} geprüft: ${result.installerName}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { bumpPatch, nextPatchVersion, parseVersion, verifyVersionConsistency };
