const path = require('path');
const zlib = require('zlib');

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_XML_BYTES = 100 * 1024 * 1024;
const MAX_ROWS_PER_SHEET = 20000;
const MAX_COLUMNS = 64;

function decodeXml(value = '') {
  return String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_match, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, number) => String.fromCodePoint(parseInt(number, 16)));
}

function attribute(source = '', name = '') {
  const match = String(source).match(new RegExp(`(?:^|\\s)${name.replace(':', '\\:')}="([^"]*)"`));
  return match ? decodeXml(match[1]) : '';
}

function extractZipEntry(buffer, targetName) {
  const minimum = Math.max(0, buffer.length - 65557);
  let endOffset = -1;
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endOffset = offset;
      break;
    }
  }
  if (endOffset < 0) throw new Error('Die ODS-Datei enthält kein gültiges ZIP-Verzeichnis.');
  const entryCount = buffer.readUInt16LE(endOffset + 10);
  let offset = buffer.readUInt32LE(endOffset + 16);
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error('Das ZIP-Verzeichnis der ODS-Datei ist beschädigt.');
    }
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');
    if (name === targetName) {
      if (uncompressedSize > MAX_XML_BYTES) throw new Error('Die ODS-Tabelle ist für diesen kleinen Import zu groß.');
      if (localOffset + 30 > buffer.length || buffer.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new Error('Der Inhalt der ODS-Datei ist beschädigt.');
      }
      const localNameLength = buffer.readUInt16LE(localOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const end = start + compressedSize;
      if (end > buffer.length) throw new Error('Der Inhalt der ODS-Datei ist unvollständig.');
      const compressed = buffer.subarray(start, end);
      if (compression === 0) return Buffer.from(compressed);
      if (compression === 8) return zlib.inflateRawSync(compressed, { maxOutputLength: MAX_XML_BYTES });
      throw new Error(`Die ODS-Komprimierung ${compression} wird nicht unterstützt.`);
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  throw new Error('Die ODS-Datei enthält keine content.xml.');
}

function cellValue(attributes = '', inner = '') {
  const rawValue = attribute(attributes, 'office:value');
  if (rawValue !== '') {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : rawValue;
  }
  const dateValue = attribute(attributes, 'office:date-value');
  if (dateValue) return dateValue;
  const booleanValue = attribute(attributes, 'office:boolean-value');
  if (booleanValue) return booleanValue === 'true';
  const paragraphs = [];
  const paragraphPattern = /<text:p\b[^>]*>([\s\S]*?)<\/text:p>/g;
  let paragraph;
  while ((paragraph = paragraphPattern.exec(inner))) {
    const text = paragraph[1]
      .replace(/<text:line-break\s*\/>/g, '\n')
      .replace(/<text:tab\s*\/>/g, '\t')
      .replace(/<text:s\b[^>]*\/>/g, ' ')
      .replace(/<[^>]+>/g, '');
    paragraphs.push(decodeXml(text));
  }
  if (paragraphs.length) return paragraphs.join('\n').trim();
  return decodeXml(String(inner).replace(/<[^>]+>/g, '')).trim();
}

function parseOdsContentXml(xmlSource) {
  const xml = String(xmlSource || '');
  const sheets = [];
  const tablePattern = /<table:table\b([^>]*)>([\s\S]*?)<\/table:table>/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(xml))) {
    const name = attribute(tableMatch[1], 'table:name');
    if (!name) continue;
    const rows = [];
    let sourceRow = 0;
    const rowPattern = /<table:table-row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/table:table-row>)/g;
    let rowMatch;
    while ((rowMatch = rowPattern.exec(tableMatch[2]))) {
      const rowRepeat = Math.max(1, Math.min(100000, Number(attribute(rowMatch[1], 'table:number-rows-repeated')) || 1));
      const cells = [];
      const cellPattern = /<table:(table-cell|covered-table-cell)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/table:\1>)/g;
      let cellMatch;
      while ((cellMatch = cellPattern.exec(rowMatch[2] || '')) && cells.length < MAX_COLUMNS) {
        const value = cellMatch[1] === 'covered-table-cell' ? '' : cellValue(cellMatch[2], cellMatch[3] || '');
        const repeat = Math.max(1, Math.min(MAX_COLUMNS - cells.length, Number(attribute(cellMatch[2], 'table:number-columns-repeated')) || 1));
        for (let index = 0; index < repeat; index += 1) cells.push(value);
      }
      const meaningful = cells.some(value => String(value ?? '').trim() !== '');
      if (meaningful) {
        const copies = Math.min(rowRepeat, MAX_ROWS_PER_SHEET - rows.length);
        for (let index = 0; index < copies; index += 1) rows.push({ rowNumber: sourceRow + index + 1, cells: [...cells] });
      }
      sourceRow += rowRepeat;
      if (rows.length >= MAX_ROWS_PER_SHEET) throw new Error(`Das Blatt „${name}“ enthält zu viele Datenzeilen.`);
    }
    sheets.push({ name, rows });
  }
  if (!sheets.length) throw new Error('In der ODS-Datei wurden keine Tabellenblätter gefunden.');
  return sheets;
}

function detectDelimiter(text) {
  const firstLines = String(text).split(/\r?\n/).filter(Boolean).slice(0, 5);
  const candidates = [';', '\t', ','];
  return candidates.map(delimiter => ({
    delimiter,
    score: firstLines.reduce((sum, line) => sum + (line.split(delimiter).length - 1), 0)
  })).sort((left, right) => right.score - left.score)[0]?.delimiter || ';';
}

function parseCsv(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index <= text.length; index += 1) {
    const character = text[index] ?? '\n';
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(value); value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value); value = '';
      if (row.some(cell => String(cell).trim())) rows.push({ rowNumber: rows.length + 1, cells: row });
      row = [];
    } else {
      value += character;
    }
  }
  return rows;
}

function asBuffer(data) {
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (Array.isArray(data)) return Buffer.from(data);
  throw new Error('Die ausgewählte Datei konnte nicht gelesen werden.');
}

function parseSpreadsheetFile({ fileName = '', data } = {}) {
  const buffer = asBuffer(data);
  if (!buffer.length) throw new Error('Die ausgewählte Datei ist leer.');
  if (buffer.length > MAX_FILE_BYTES) throw new Error('Die ausgewählte Datei ist für diesen kleinen Import zu groß.');
  const extension = path.extname(String(fileName)).toLowerCase();
  if (extension === '.ods') {
    const content = extractZipEntry(buffer, 'content.xml').toString('utf8');
    return { fileName, format: 'ods', sheets: parseOdsContentXml(content), warnings: [] };
  }
  if (extension === '.csv' || extension === '.txt') {
    const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const name = path.basename(String(fileName), extension).trim();
    return { fileName, format: 'csv', sheets: [{ name, rows: parseCsv(text) }], warnings: [] };
  }
  throw new Error('Bitte eine ODS-Datei oder die sechs als CSV exportierten Tabellenblätter auswählen.');
}

module.exports = {
  MAX_FILE_BYTES,
  parseCsv,
  parseOdsContentXml,
  parseSpreadsheetFile
};
