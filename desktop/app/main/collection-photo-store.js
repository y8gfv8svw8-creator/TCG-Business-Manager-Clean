const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MIME_EXTENSIONS = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
});

const ensureDirectory = target => fs.mkdirSync(target, { recursive: true });
const forwardSlashes = value => String(value || '').replaceAll('\\', '/');

function detectedMime(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return '';
}

function jpegDimensions(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 5), height: buffer.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
  return { width: 0, height: 0 };
}

function imageDimensions(buffer, mimeType) {
  if (mimeType === 'image/png' && buffer.length >= 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (mimeType === 'image/jpeg') return jpegDimensions(buffer);
  if (mimeType === 'image/webp' && buffer.length >= 30) {
    const chunk = buffer.toString('ascii', 12, 16);
    if (chunk === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
    if (chunk === 'VP8 ' && buffer.length >= 30) {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L' && buffer.length >= 25) {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  return { width: 0, height: 0 };
}

function imageReferences(state) {
  const references = [];
  for (const analysis of Array.isArray(state?.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : []) {
    for (const photo of Array.isArray(analysis?.photos) ? analysis.photos : []) {
      if (photo?.relativePath) references.push({ analysisId: String(analysis.id || ''), ...photo });
    }
  }
  return references;
}

class CollectionPhotoStore {
  constructor({ dataRoot, backupRoot, maxImageBytes = MAX_IMAGE_BYTES }) {
    this.dataRoot = path.resolve(dataRoot);
    this.backupRoot = path.resolve(backupRoot);
    this.photoRoot = path.join(this.dataRoot, 'Daten', 'Sammlungsfotos');
    this.maxImageBytes = Math.max(1024, Number(maxImageBytes) || MAX_IMAGE_BYTES);
    ensureDirectory(this.photoRoot);
  }

  resolveManagedPath(relativePath) {
    const raw = String(relativePath || '').trim();
    if (!raw || path.isAbsolute(raw) || raw.includes('\0')) throw new Error('Ungültiger Bildpfad.');
    const resolved = path.resolve(this.dataRoot, raw);
    const relativeToPhotoRoot = path.relative(this.photoRoot, resolved);
    if (!relativeToPhotoRoot || relativeToPhotoRoot.startsWith('..') || path.isAbsolute(relativeToPhotoRoot)) {
      throw new Error('Der Bildpfad liegt außerhalb des verwalteten Sammlungsfoto-Ordners.');
    }
    return resolved;
  }

  validateBytes(bytes, declaredMimeType = '') {
    const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || []);
    if (!buffer.length) throw new Error('Die Bilddatei ist leer.');
    if (buffer.length > this.maxImageBytes) throw new Error(`Das Bild ist größer als ${Math.round(this.maxImageBytes / 1024 / 1024)} MB.`);
    const mimeType = detectedMime(buffer);
    if (!MIME_EXTENSIONS[mimeType]) throw new Error('Nur JPEG-, PNG- und WebP-Bilder sind erlaubt.');
    if (declaredMimeType && declaredMimeType !== 'application/octet-stream' && String(declaredMimeType).toLowerCase() !== mimeType) {
      throw new Error('Dateiinhalt und angegebener Bildtyp passen nicht zusammen.');
    }
    const dimensions = imageDimensions(buffer, mimeType);
    if (!dimensions.width || !dimensions.height) throw new Error('Die Bildabmessungen konnten nicht sicher gelesen werden.');
    if (dimensions.width > 30000 || dimensions.height > 30000 || dimensions.width * dimensions.height > 160000000) {
      throw new Error('Die Bildabmessungen sind zu groß.');
    }
    return { buffer, mimeType, ...dimensions };
  }

  storeImage({ analysisId, originalFileName, mimeType, bytes }) {
    const safeAnalysisId = crypto.createHash('sha256').update(String(analysisId || 'analysis')).digest('hex').slice(0, 20);
    const validated = this.validateBytes(bytes, mimeType);
    const directory = path.join(this.photoRoot, safeAnalysisId);
    ensureDirectory(directory);
    const fileName = `${crypto.randomUUID()}${MIME_EXTENSIONS[validated.mimeType]}`;
    const targetPath = path.join(directory, fileName);
    const tempPath = `${targetPath}.tmp-${process.pid}`;
    fs.writeFileSync(tempPath, validated.buffer, { flag: 'wx' });
    fs.renameSync(tempPath, targetPath);
    return {
      relativePath: forwardSlashes(path.relative(this.dataRoot, targetPath)),
      originalFileName: path.basename(String(originalFileName || 'Sammlungsfoto')),
      mimeType: validated.mimeType,
      fileSize: validated.buffer.length,
      width: validated.width,
      height: validated.height,
      sha256: crypto.createHash('sha256').update(validated.buffer).digest('hex')
    };
  }

  readImage(relativePath) {
    const targetPath = this.resolveManagedPath(relativePath);
    const buffer = fs.readFileSync(targetPath);
    const validated = this.validateBytes(buffer);
    return { dataUrl: `data:${validated.mimeType};base64,${buffer.toString('base64')}`, mimeType: validated.mimeType, bytes: buffer.length };
  }

  deleteImage(relativePath) {
    const targetPath = this.resolveManagedPath(relativePath);
    fs.rmSync(targetPath, { force: true });
    const directory = path.dirname(targetPath);
    if (directory !== this.photoRoot && fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
    return { ok: true };
  }

  stageDelete(relativePath) {
    const targetPath = this.resolveManagedPath(relativePath);
    if (!fs.existsSync(targetPath)) return { commit() {}, rollback() {} };
    const stagedPath = `${targetPath}.deleting-${crypto.randomUUID()}`;
    fs.renameSync(targetPath, stagedPath);
    return {
      commit() {
        fs.rmSync(stagedPath, { force: true });
        const directory = path.dirname(targetPath);
        if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
      },
      rollback() {
        if (fs.existsSync(stagedPath)) fs.renameSync(stagedPath, targetPath);
      }
    };
  }

  createBackupBundle(state) {
    const attachments = imageReferences(state).map(photo => {
      const targetPath = this.resolveManagedPath(photo.relativePath);
      const buffer = fs.readFileSync(targetPath);
      const validated = this.validateBytes(buffer, photo.mimeType);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      if (photo.sha256 && photo.sha256 !== sha256) throw new Error(`Sammlungsfoto ${photo.originalFileName || photo.id} stimmt nicht mit seinem gespeicherten Hash überein.`);
      return {
        relativePath: forwardSlashes(photo.relativePath),
        mimeType: validated.mimeType,
        sha256,
        bytesBase64: buffer.toString('base64')
      };
    });
    return { format: 'tcg-business-manager-backup-v2', createdAt: new Date().toISOString(), state, attachments };
  }

  restoreBackupBundle(bundle, saveState) {
    if (!bundle || bundle.format !== 'tcg-business-manager-backup-v2' || !bundle.state || !Array.isArray(bundle.attachments)) {
      throw new Error('Die Sicherungsdatei enthält kein gültiges Sammlungsfoto-Paket.');
    }
    const expectedPaths = new Set(imageReferences(bundle.state).map(photo => forwardSlashes(photo.relativePath)));
    const suppliedPaths = bundle.attachments.map(attachment => forwardSlashes(attachment?.relativePath));
    if (new Set(suppliedPaths).size !== suppliedPaths.length) {
      throw new Error('Die Sicherung enthält einen Bildanhang mehrfach.');
    }
    if (suppliedPaths.length !== expectedPaths.size || suppliedPaths.some(relativePath => !expectedPaths.has(relativePath))) {
      throw new Error('Die Sicherung enthält nicht alle im Programmstand referenzierten Sammlungsfotos.');
    }
    const createdPaths = [];
    try {
      for (const attachment of bundle.attachments) {
        const relativePath = forwardSlashes(attachment.relativePath);
        if (!expectedPaths.has(relativePath)) throw new Error('Die Sicherung enthält ein Bild ohne gültige Zustandsreferenz.');
        const targetPath = this.resolveManagedPath(relativePath);
        const buffer = Buffer.from(String(attachment.bytesBase64 || ''), 'base64');
        const validated = this.validateBytes(buffer, attachment.mimeType);
        const sha256 = crypto.createHash('sha256').update(validated.buffer).digest('hex');
        if (sha256 !== String(attachment.sha256 || '')) throw new Error('Ein Bild in der Sicherung ist beschädigt.');
        ensureDirectory(path.dirname(targetPath));
        if (fs.existsSync(targetPath)) {
          const existingHash = crypto.createHash('sha256').update(fs.readFileSync(targetPath)).digest('hex');
          if (existingHash !== sha256) throw new Error('Am Ziel existiert bereits ein anderes Bild mit demselben Pfad.');
          continue;
        }
        const tempPath = `${targetPath}.restore-${process.pid}`;
        fs.writeFileSync(tempPath, validated.buffer, { flag: 'wx' });
        fs.renameSync(tempPath, targetPath);
        createdPaths.push(targetPath);
      }
      const result = saveState(bundle.state);
      return { state: bundle.state, result, restoredAttachments: bundle.attachments.length };
    } catch (error) {
      for (const targetPath of createdPaths.reverse()) fs.rmSync(targetPath, { force: true });
      throw error;
    }
  }

  createAutomaticAttachmentBackup(state, date, retentionDays = 30) {
    const automaticRoot = path.join(this.backupRoot, 'Automatisch');
    const dateText = String(date || new Date().toISOString().slice(0, 10));
    const targetRoot = path.join(automaticRoot, `TCG_Auto_Anlagen_${dateText}`);
    ensureDirectory(targetRoot);
    const manifest = [];
    for (const photo of imageReferences(state)) {
      const sourcePath = this.resolveManagedPath(photo.relativePath);
      if (!fs.existsSync(sourcePath)) throw new Error(`Sammlungsfoto fehlt: ${photo.originalFileName || photo.id}`);
      const targetPath = path.join(targetRoot, forwardSlashes(photo.relativePath));
      ensureDirectory(path.dirname(targetPath));
      fs.copyFileSync(sourcePath, targetPath);
      manifest.push({ relativePath: forwardSlashes(photo.relativePath), sha256: photo.sha256 || '' });
    }
    const manifestPath = path.join(targetRoot, 'manifest.json');
    fs.writeFileSync(`${manifestPath}.tmp`, JSON.stringify({ date: dateText, attachments: manifest }, null, 2), 'utf8');
    fs.renameSync(`${manifestPath}.tmp`, manifestPath);

    const retention = Math.max(1, Math.min(3650, Math.round(Number(retentionDays) || 30)));
    const folders = fs.readdirSync(automaticRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^TCG_Auto_Anlagen_\d{4}-\d{2}-\d{2}$/.test(entry.name))
      .map(entry => entry.name).sort().reverse();
    for (const name of folders.slice(retention)) fs.rmSync(path.join(automaticRoot, name), { recursive: true, force: true });
    return targetRoot;
  }
}

module.exports = {
  CollectionPhotoStore,
  MAX_IMAGE_BYTES,
  MIME_EXTENSIONS,
  detectedMime,
  imageDimensions,
  imageReferences
};
