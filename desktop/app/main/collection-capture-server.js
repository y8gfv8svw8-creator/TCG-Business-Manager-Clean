const http = require('http');
const os = require('os');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const MAX_BODY_BYTES = 64 * 1024;
const MAX_SCAN_BODY_BYTES = 24 * 1024 * 1024;
const SESSION_LIFETIME_MS = 20 * 60 * 1000;
const safeText = (value, max = 240) => String(value == null ? '' : value).trim().slice(0, max);

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat().filter(row =>
    row && row.family === 'IPv4' && !row.internal && (/^10\./.test(row.address) || /^192\.168\./.test(row.address) || /^172\.(?:1[6-9]|2\d|3[01])\./.test(row.address))
  ).map(row => row.address);
}

function mobileCapturePage(token) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="dark">
  <title>Sammlungsankauf erfassen</title><style>
  :root{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#181a1f;color:#f4f5f7}*{box-sizing:border-box}body{margin:0;padding:14px;min-height:100vh}.card{max-width:620px;margin:auto;background:#25282e;border:1px solid #414650;border-radius:18px;padding:18px;box-shadow:0 18px 45px #0006}h1{font-size:23px;margin:0 0 5px}h2{font-size:17px;margin:18px 0 7px}.muted,small{color:#afb5bf}.purchase{padding:11px 13px;background:#30343c;border-radius:11px;margin:12px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}label{display:grid;gap:5px;font-weight:700;margin-top:11px}input,select,button{width:100%;border-radius:10px;border:1px solid #555d69;padding:12px;font:inherit;background:#191c21;color:#fff}button{border:0;background:#347eae;font-weight:800;margin-top:14px}button.secondary{background:#3c424b}button.choice{text-align:left;background:#303640;border:1px solid #59616e;margin-top:7px;font-weight:600}.choice small{display:block;margin-top:3px}.status{padding:10px 12px;border-radius:10px;margin-top:11px;background:#30343c;white-space:pre-line}.ok{color:#8ce3ac}.bad{color:#ff9da3}.warning{color:#ffd479}.hidden{display:none!important}.scan-guide{position:relative;width:min(58vw,230px);aspect-ratio:.68;margin:12px auto 4px;border:2px solid #65bff3;border-radius:14px;background:#15171b;overflow:hidden}.scan-guide:after{content:"Karte vollständig im Rahmen · Setcode lesbar";position:absolute;inset:10px;border:2px dashed #fff9;border-radius:9px;display:flex;align-items:flex-end;justify-content:center;padding:10px;color:#fff;font-size:12px;text-align:center;text-shadow:0 1px 4px #000}.scan-guide img{width:100%;height:100%;object-fit:contain;display:block}.scan-candidates{display:grid;gap:6px}.scan-candidates button{margin-top:6px}.scan-help{display:block;text-align:center;margin-top:7px}@media(max-width:520px){.grid{grid-template-columns:1fr}}</style></head>
  <body><main class="card"><h1>Sammlungsankauf</h1><div id="purchase" class="purchase">Verbindung wird geprüft …</div>
  <button id="scanButton" type="button">Karte scannen</button><input id="scanInput" class="hidden" type="file" accept="image/*" capture="environment"><small class="scan-help">Eine einzelne Karte aufrecht und möglichst groß fotografieren.</small>
  <div id="scanPreviewWrap" class="hidden"><div class="scan-guide"><img id="scanPreview" alt="Aufgenommenes Kartenfoto"></div></div><div id="scanStatus" class="status muted hidden"></div><div id="scanCandidates" class="scan-candidates"></div>
  <label>Setcode<input id="setCode" maxlength="40" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="z. B. EEN-DE037"></label>
  <div id="lookupStatus" class="status muted">Setcode eingeben.</div>
  <label id="rarityWrap" class="hidden">Rarität<select id="rarity"><option value="">Bitte auswählen</option></select></label>
  <label id="versionWrap" class="hidden">Version / Print<select id="version"><option value="">Bitte auswählen</option></select></label>
  <section id="manualSearch" class="hidden"><h2>Manuelle Kartensuche</h2><div class="grid"><input id="searchQuery" autocomplete="off" placeholder="Kartenname oder Cardmarket-ID"><button id="searchButton" class="secondary" type="button">Suchen</button></div><div id="searchResults"></div></section>
  <div class="grid"><label>Zustand<select id="condition"><option value="NM">NM</option><option value="EX">EX</option><option value="GD">GD</option><option value="LP">LP</option><option value="PL">PL</option><option value="POOR">POOR</option><option value="UNBEKANNT">Unbekannt</option></select></label>
  <label>Edition<select id="edition"><option value="">Nicht relevant / unbekannt</option><option value="1st">1st Edition</option><option value="Unlimited">Unlimited</option></select></label>
  <label>Menge<input id="quantity" type="number" min="1" max="999" step="1" value="1"></label><label>Ziel-/Verkaufspreis (VK €)<input id="targetSell" type="number" min="0" max="1000000" step="0.01" placeholder="optional"></label></div>
  <button id="save" type="button">Speichern &amp; nächste Karte</button><div id="saveStatus" class="status muted">Noch keine Karte gespeichert.</div><small>EK und Bestand werden hier nicht verändert. Die wirtschaftliche Verteilung und Bestandsübernahme erfolgen später am PC.</small></main>
  <script src="/scanner-image-processing.js?token=${encodeURIComponent(token)}"></script><script>
  const token=${JSON.stringify(token)},byId=id=>document.getElementById(id);let recognition=null,manualProduct=null,pendingRequestId='',timer=null;
  async function api(path,body){const response=await fetch(path+'?token='+encodeURIComponent(token),body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});let result={};try{result=await response.json()}catch{}if(!response.ok)throw new Error(result.error||'Verbindung fehlgeschlagen');return result}
  function readFileDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(new Error('Das Foto konnte nicht gelesen werden.'));reader.readAsDataURL(file)})}
  function loadMobileImage(dataUrl){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Das Kartenfoto ist ungültig.'));image.src=dataUrl})}
  async function resizeScanImage(dataUrl){const image=await loadMobileImage(dataUrl),maximum=1800,scale=Math.min(1,maximum/Math.max(image.naturalWidth,image.naturalHeight));if(scale===1)return dataUrl;const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.88)}
  function resetScanResult({keepPreview=false}={}){byId('scanCandidates').innerHTML='';byId('scanStatus').className='status muted hidden';byId('scanStatus').textContent='';byId('scanInput').value='';if(!keepPreview){byId('scanPreview').removeAttribute('src');byId('scanPreviewWrap').classList.add('hidden')}}
  function renderScanCandidates(candidates){const target=byId('scanCandidates');target.innerHTML=candidates.length?'<div class="status warning">Mehrere bekannte Setcodes sind möglich. Bitte selbst auswählen oder unten eintippen.</div>'+candidates.map(code=>'<button type="button" class="choice" data-scan-code="'+escapeHtml(code)+'">'+escapeHtml(code)+'</button>').join(''):'';target.querySelectorAll('[data-scan-code]').forEach(button=>button.onclick=()=>{byId('setCode').value=button.dataset.scanCode;target.innerHTML='';resolve()})}
  async function scanCardFile(file){if(!file)return;const scanStatus=byId('scanStatus'),scanButton=byId('scanButton');scanButton.disabled=true;scanStatus.className='status muted';scanStatus.textContent='Foto wird lokal vorbereitet und vom Manager geprüft …';try{const original=await readFileDataUrl(file),imageDataUrl=await resizeScanImage(original);byId('scanPreview').src=imageDataUrl;byId('scanPreviewWrap').classList.remove('hidden');const prepared=await window.TcgScannerImageProcessing.prepareMobileSetCodeRecognitionPayload(imageDataUrl);const result=await api('/api/scan',prepared),ocr=result.ocr||{};recognition=null;manualProduct=null;renderScanCandidates(ocr.accepted?[]:(ocr.candidates||[]));if(ocr.accepted&&ocr.setCode){byId('setCode').value=ocr.setCode;recognition=result.recognition||null;renderRecognition();scanStatus.className='status warning';scanStatus.textContent='OCR-Vorschlag: '+ocr.setCode+(ocr.confidence==null?'':' · Confidence '+Number(ocr.confidence).toFixed(1)+' %')+'\nBitte Setcode und Printangaben prüfen. Nichts wurde automatisch bestätigt.';byId('setCode').focus();byId('setCode').select()}else{byId('setCode').value='';renderRecognition();scanStatus.className='status warning';scanStatus.textContent=(ocr.status==='setcode_ambiguous'?'Setcode nicht eindeutig erkannt. Bitte einen Kandidaten wählen oder manuell eingeben.':'Setcode nicht sicher erkannt. Bitte direkt manuell eingeben.');byId('setCode').focus()}}catch(error){recognition=null;byId('setCode').value='';renderRecognition();scanStatus.className='status bad';scanStatus.textContent='Scan fehlgeschlagen: '+error.message+'\nDie manuelle Eingabe bleibt verfügbar.';byId('setCode').focus()}finally{scanButton.disabled=false}}
  byId('scanButton').onclick=()=>byId('scanInput').click();byId('scanInput').onchange=event=>scanCardFile(event.target.files?.[0]);
  const labelCandidate=row=>[row.germanName||row.englishName||'Print',row.setCode||row.collectorNumber,row.rarity,row.version,row.cardmarketProductId?'CM '+row.cardmarketProductId:'keine verifizierte CM-ID'].filter(Boolean).join(' · ');
  function allCandidates(){const rows=[...(recognition?.variantCandidates||[]),...(recognition?.referenceCandidates||[])],seen=new Set();return rows.filter(row=>{const key=row.id||[row.cardmarketProductId,row.setCode,row.rarity,row.version].join(':');if(seen.has(key))return false;seen.add(key);return true})}
  function renderRecognition(){const status=byId('lookupStatus'),rarities=[...new Set((recognition?.rarityOptions||[]).map(row=>row?.value||row).filter(Boolean))],candidates=allCandidates(),names=[...new Set(candidates.map(row=>row.germanName||row.englishName).filter(Boolean))],rarity=byId('rarity'),version=byId('version');
    byId('rarityWrap').classList.toggle('hidden',rarities.length<=1);rarity.innerHTML='<option value="">Bitte auswählen</option>'+rarities.map(value=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(value)+'</option>').join('');if(recognition?.selectedRarity)rarity.value=recognition.selectedRarity;
    const exact=candidates.filter(row=>row.verified&&row.cardmarketProductId&&row.mappingStatus==='exact');byId('versionWrap').classList.toggle('hidden',exact.length<=1);version.innerHTML='<option value="">Bitte auswählen</option>'+exact.map(row=>'<option value="'+escapeHtml(row.id||'')+'">'+escapeHtml(labelCandidate(row))+'</option>').join('');if(exact.length===1)version.value=exact[0].id||'';
    const mapping=recognition?.mappingStatus||'unresolved',nameLine=names.length===1?'Karte: '+names[0]+'\n':names.length>1?'Mehrere Metakarten möglich – bitte selbst prüfen.\n':'';status.className='status '+(mapping==='exact'?'ok':'warning');status.textContent=nameLine+(candidates.length?(mapping==='exact'?(exact.length>1?'Mehrere verifizierte Versionen – bitte auswählen.':'Print-Kandidat gefunden. Angaben prüfen und speichern.'):'Ungeprüft – bitte selbst prüfen'):'Setcode unbekannt. Bitte manuell suchen.');byId('manualSearch').classList.toggle('hidden',candidates.length>0&&mapping==='exact');
  }
  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  async function resolve(){const setCode=byId('setCode').value.trim().toUpperCase().replace(/\s+/g,'');byId('setCode').value=setCode;manualProduct=null;if(!setCode){recognition=null;renderRecognition();return}byId('lookupStatus').className='status muted';byId('lookupStatus').textContent='Lokale Print-Referenz wird geprüft …';try{const result=await api('/api/resolve',{setCode,rarity:byId('rarity').value});recognition=result.recognition;renderRecognition()}catch(error){byId('lookupStatus').className='status bad';byId('lookupStatus').textContent=error.message}}
  byId('setCode').addEventListener('input',()=>{clearTimeout(timer);byId('rarity').value='';timer=setTimeout(resolve,180)});byId('setCode').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();clearTimeout(timer);resolve()}});byId('rarity').onchange=resolve;
  byId('searchButton').onclick=async()=>{const query=byId('searchQuery').value.trim(),target=byId('searchResults');if(query.length<2)return;target.innerHTML='<div class="status muted">Suche …</div>';try{const result=await api('/api/search',{query});target.innerHTML=result.products.length?result.products.map(row=>'<button type="button" class="choice" data-product="'+escapeHtml(row.productId)+'"><strong>'+escapeHtml(row.germanName||row.englishName||row.officialName||'Karte')+'</strong><small>'+escapeHtml([row.setName,row.setCode||row.collectorNumber,row.rarity,row.variant,'CM '+row.productId].filter(Boolean).join(' · '))+'</small></button>').join(''):'<div class="status warning">Keine passende Karte gefunden.</div>';target.querySelectorAll('[data-product]').forEach(button=>button.onclick=()=>{manualProduct=result.products.find(row=>String(row.productId)===button.dataset.product);target.innerHTML='<div class="status ok">Manuell gewählt: '+escapeHtml([manualProduct.germanName||manualProduct.englishName,manualProduct.setCode||manualProduct.collectorNumber,manualProduct.rarity,'CM '+manualProduct.productId].filter(Boolean).join(' · '))+'</div>'})}catch(error){target.innerHTML='<div class="status bad">'+escapeHtml(error.message)+'</div>'}};
  byId('searchQuery').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();byId('searchButton').click()}});
  function requestId(){if(!pendingRequestId)pendingRequestId=crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(16).slice(2);return pendingRequestId}
  byId('save').onclick=async()=>{const button=byId('save'),status=byId('saveStatus'),verified=allCandidates().filter(row=>row.verified&&row.cardmarketProductId&&row.mappingStatus==='exact'),candidate=allCandidates().find(row=>row.id===byId('version').value)||(verified.length===1?verified[0]:null);button.disabled=true;status.className='status muted';status.textContent='Wird sicher gespeichert …';try{const result=await api('/api/cards',{requestId:requestId(),setCode:byId('setCode').value,rarity:byId('rarity').value,candidateId:candidate?.id||'',cardmarketProductId:candidate?.cardmarketProductId||'',manualProductId:manualProduct?.productId||'',condition:byId('condition').value,edition:byId('edition').value,quantity:Number(byId('quantity').value),targetSell:byId('targetSell').value});status.className='status ok';status.textContent=result.duplicate?'Bereits gespeichert – es wurde keine doppelte Position erzeugt.':'Gespeichert. Die Karte ist jetzt am PC sichtbar. „Karte scannen“ ist direkt für die nächste Karte bereit.';pendingRequestId='';recognition=null;manualProduct=null;resetScanResult();byId('setCode').value='';byId('rarityWrap').classList.add('hidden');byId('versionWrap').classList.add('hidden');byId('manualSearch').classList.add('hidden');byId('searchResults').innerHTML='';byId('searchQuery').value='';byId('quantity').value='1';byId('targetSell').value='';byId('lookupStatus').className='status muted';byId('lookupStatus').textContent='Setcode eingeben.';byId('setCode').focus()}catch(error){status.className='status bad';status.textContent=error.message}finally{button.disabled=false}};
  api('/api/session').then(result=>{byId('purchase').innerHTML='<strong>'+escapeHtml(result.analysisTitle)+'</strong><br><small>Lokale Sitzung verbunden · endet automatisch um '+escapeHtml(new Date(result.expiresAt).toLocaleTimeString('de-DE'))+'</small>';byId('setCode').focus()}).catch(error=>{byId('purchase').className='purchase bad';byId('purchase').textContent=error.message;byId('save').disabled=true});
  </script></body></html>`;
}

class CollectionCaptureServer {
  constructor({ onResolve = () => ({}), onSearch = () => [], onScan = () => ({}), onCreateCard = () => ({}), sessionLifetimeMs = SESSION_LIFETIME_MS } = {}) {
    this.onResolve = onResolve;
    this.onSearch = onSearch;
    this.onScan = onScan;
    this.onCreateCard = onCreateCard;
    this.sessionLifetimeMs = sessionLifetimeMs;
    this.server = null;
    this.session = null;
    this.expiryTimer = null;
    this.publicInfo = null;
    this.requests = new Map();
  }

  touchExpiry() {
    clearTimeout(this.expiryTimer);
    const expiresAt = new Date(Date.now() + this.sessionLifetimeMs).toISOString();
    if (this.session) this.session.expiresAt = expiresAt;
    this.expiryTimer = setTimeout(() => this.expireSession(), this.sessionLifetimeMs);
    this.expiryTimer.unref?.();
    return expiresAt;
  }

  expireSession() {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = null;
    this.session = null;
    this.publicInfo = null;
    this.requests.clear();
  }

  async start({ analysisId = '', analysisTitle = '' } = {}) {
    await this.stop();
    const safeAnalysisId = safeText(analysisId, 100);
    if (!safeAnalysisId) throw new Error('Kein aktiver Sammlungsankauf ausgewählt.');
    const token = crypto.randomBytes(32).toString('hex');
    this.session = { token, sessionId: crypto.randomUUID(), analysisId: safeAnalysisId, analysisTitle: safeText(analysisTitle) || 'Aktiver Sammlungsankauf', startedAt: new Date().toISOString(), lastSeenAt: '' };
    const addresses = lanAddresses(), address = addresses[0] || '127.0.0.1';
    this.server = http.createServer((request, response) => this.handleRequest(request, response));
    await new Promise((resolve, reject) => { this.server.once('error', reject);this.server.listen(0, address, resolve); });
    const port = this.server.address().port;
    const url = `http://${address}:${port}/?token=${token}`, localUrl = url;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 260, margin: 1, errorCorrectionLevel: 'M' });
    const expiresAt = this.touchExpiry();
    this.publicInfo = { running: true, sessionId: this.session.sessionId, analysisId: safeAnalysisId, analysisTitle: this.session.analysisTitle, url, localUrl, addresses, port, qrDataUrl, expiresAt, connected: false, lastSeenAt: '' };
    return { ...this.publicInfo };
  }

  status() {
    if (!this.server || !this.session || !this.publicInfo) return { running: false };
    return { ...this.publicInfo, expiresAt: this.session.expiresAt, connected: Boolean(this.session.lastSeenAt), lastSeenAt: this.session.lastSeenAt };
  }

  async stop() {
    this.expireSession();
    const current = this.server;
    this.server = null;
    if (current) await new Promise(resolve => current.close(() => resolve()));
    return { running: false };
  }

  reply(response, statusCode, body, contentType = 'application/json; charset=utf-8') {
    response.writeHead(statusCode, { 'content-type': contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'; base-uri 'none'; form-action 'none'" });
    response.end(typeof body === 'string' ? body : JSON.stringify(body));
  }

  validToken(requestUrl) {
    if (!this.session || Date.parse(this.session.expiresAt || '') <= Date.now()) return false;
    const provided = Buffer.from(requestUrl.searchParams.get('token') || '');
    const expected = Buffer.from(this.session.token);
    return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  }

  readJson(request, maxBytes = MAX_BODY_BYTES) {
    return new Promise((resolve, reject) => {
      let size = 0;const chunks = [];
      request.on('data', chunk => { size += chunk.length;if (size > maxBytes) reject(new Error('Die Anfrage ist zu groß.'));else chunks.push(chunk); });
      request.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new Error('Die Anfrage konnte nicht gelesen werden.')); } });
      request.on('error', () => reject(new Error('Die Übertragung wurde abgebrochen.')));
    });
  }

  async handleRequest(request, response) {
    const requestUrl = new URL(request.url, 'http://localhost');
    if (!this.validToken(requestUrl)) return this.reply(response, 403, { error: 'Diese mobile Verbindung ist ungültig oder abgelaufen.' });
    this.session.lastSeenAt = new Date().toISOString();if (this.publicInfo) this.publicInfo.lastSeenAt = this.session.lastSeenAt;
    const session = { sessionId: this.session.sessionId, analysisId: this.session.analysisId, analysisTitle: this.session.analysisTitle, expiresAt: this.touchExpiry() };
    try {
      if (request.method === 'GET' && requestUrl.pathname === '/') return this.reply(response, 200, mobileCapturePage(this.session.token), 'text/html; charset=utf-8');
      if (request.method === 'GET' && requestUrl.pathname === '/scanner-image-processing.js') return this.reply(response, 200, fs.readFileSync(path.join(__dirname, '..', 'shared', 'scanner-image-processing.js'), 'utf8'), 'text/javascript; charset=utf-8');
      if (request.method === 'GET' && requestUrl.pathname === '/api/session') return this.reply(response, 200, session);
      if (request.method !== 'POST') return this.reply(response, 404, { error: 'Nicht gefunden.' });
      const payload = await this.readJson(request, requestUrl.pathname === '/api/scan' ? MAX_SCAN_BODY_BYTES : MAX_BODY_BYTES);
      if (requestUrl.pathname === '/api/resolve') return this.reply(response, 200, { recognition: await this.onResolve({ session, setCode: safeText(payload.setCode, 40), rarity: safeText(payload.rarity, 120) }) });
      if (requestUrl.pathname === '/api/search') return this.reply(response, 200, { products: await this.onSearch({ session, query: safeText(payload.query, 200) }) });
      if (requestUrl.pathname === '/api/scan') return this.reply(response, 200, await this.onScan({ session, payload }));
      if (requestUrl.pathname === '/api/cards') {
        const requestId = safeText(payload.requestId, 100);
        if (!requestId) return this.reply(response, 400, { error: 'Die Anfrage besitzt keine eindeutige Kennung.' });
        const key = `${session.sessionId}:${requestId}`;
        if (this.requests.has(key)) return this.reply(response, 200, { ...this.requests.get(key), duplicate: true });
        const result = await this.onCreateCard({ session, input: { ...payload, requestId } });
        const responseBody = { ok: true, ...result, duplicate: Boolean(result?.duplicate) };
        this.requests.set(key, responseBody);
        return this.reply(response, 200, responseBody);
      }
      return this.reply(response, 404, { error: 'Nicht gefunden.' });
    } catch (error) {
      return this.reply(response, 400, { error: error.message || 'Die mobile Anfrage ist fehlgeschlagen.' });
    }
  }
}

module.exports = { CollectionCaptureServer, lanAddresses, MAX_BODY_BYTES, MAX_SCAN_BODY_BYTES, SESSION_LIFETIME_MS, mobileCapturePage };
