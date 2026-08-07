const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const [databasePath, csvPath] = process.argv.slice(2);
if (!databasePath || !csvPath) throw new Error('SQLite- und CSV-Pfad werden benötigt.');

function parseCsv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index], next = text[index + 1];
    if (char === '"' && quoted && next === '"') { value += '"'; index++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === ';' && !quoted) { row.push(value); value = ''; continue; }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index++;
      row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ''; continue;
    }
    value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift();
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

const cleanId = value => String(value || '').replace(/\D/g, '');
const db = new DatabaseSync(databasePath, { readOnly: true });
const productQuery = db.prepare('SELECT product_id AS productId, metacard_id AS metacardId, expansion_id AS expansionId, set_name AS setName FROM products WHERE product_id = ?');
const groupQuery = db.prepare('SELECT product_id AS productId FROM products WHERE metacard_id = ? AND expansion_id = ? ORDER BY CAST(product_id AS INTEGER)');
const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const checked = [];

for (const row of rows) {
  const productId = cleanId(row.idProduct);
  const version = String(row.Name || '').match(/\(V\.?\s*(\d+)\s*[-–—]/i);
  if (!productId || !version) continue;
  const product = productQuery.get(productId);
  if (!product?.metacardId || !product?.expansionId) continue;
  const candidates = groupQuery.all(product.metacardId, product.expansionId).map(item => item.productId);
  checked.push({ productId, expected: Number(version[1]), actual: candidates.indexOf(productId) + 1, count: candidates.length, expansionId:product.expansionId, setName:product.setName });
}

const exact = checked.filter(row => row.expected === row.actual);
const mismatches = checked.filter(row => row.expected !== row.actual);
const summarize=key=>Object.values(checked.reduce((summary,row)=>{
  const value=String(row[key]||'unbekannt');
  summary[value] ||= {[key]:row[key],checked:0,exact:0};
  summary[value].checked++;
  if(row.expected===row.actual)summary[value].exact++;
  return summary;
},{})).map(row=>({...row,accuracy:row.checked?row.exact/row.checked:0}));
console.log(JSON.stringify({
  checked: checked.length,
  exact: exact.length,
  accuracy: checked.length ? exact.length / checked.length : 0,
  mismatches: mismatches.slice(0, 30),
  byCandidateCount:summarize('count'),
  bySet:summarize('setName')
}, null, 2));
db.close();
