const http = require('http');
const os = require('os');
const crypto = require('crypto');
const QRCode = require('qrcode');

const MAX_BODY_BYTES = 12 * 1024 * 1024;
const SESSION_LIFETIME_MS = 15 * 60 * 1000;

const safeText = (value, max = 240) => String(value || '').trim().slice(0, max);

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat().filter(row =>
    row && row.family === 'IPv4' && !row.internal && !String(row.address).startsWith('169.254.')
  ).map(row => row.address);
}

function scannerPage(token) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>TCG Karten-Scanner</title><style>
  :root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#242424;color:#f5f5f5}body{margin:0;padding:22px;min-height:100vh;box-sizing:border-box}.card{max-width:520px;margin:auto;background:#303030;border:1px solid #4b4b4b;border-radius:18px;padding:20px;box-shadow:0 18px 45px #0005}h1{font-size:25px;margin:0 0 8px}p{color:#c8c8c8;line-height:1.45}.steps{background:#393939;border-radius:12px;padding:12px 14px;font-size:14px}label{display:block;margin-top:16px;font-weight:700}input,button{box-sizing:border-box;width:100%;margin-top:7px;border-radius:11px;border:1px solid #5b5b5b;padding:13px;font:inherit}input{background:#262626;color:#fff}button{border:0;background:#3276a5;color:#fff;font-weight:800;font-size:16px}button:disabled{opacity:.5}img{display:none;width:100%;max-height:55vh;object-fit:contain;margin-top:14px;border-radius:12px;background:#171717}.status{min-height:24px;margin-top:12px;font-weight:700}.ok{color:#8ce3ac}.bad{color:#ff9da3}small{display:block;color:#aaa;margin-top:8px}</style></head>
  <body><main class="card"><h1>Yu-Gi-Oh!-Karte erfassen</h1><p>Das Foto wird nur an Ihren TCG Business Manager im selben Netzwerk übertragen.</p>
  <div class="steps">1. Karte gerade, vollständig und möglichst bildfüllend fotografieren.<br>2. Kartenname oben, Setnummer rechts unter dem Bild und den unteren Kartenrand sichtbar lassen.<br>3. Spiegelungen vermeiden und für gleichmäßiges Licht sorgen.<br>4. Sie können direkt weitere Karten fotografieren; am PC werden alle nacheinander bestätigt.</div>
  <label>Kartenfoto<input id="photo" type="file" accept="image/*" capture="environment"></label><img id="preview" alt="Vorschau">
  <label>Erkennungshilfe (optional)<input id="hint" autocomplete="off" placeholder="z. B. RA01-EN008 oder Kartenname"></label>
  <button id="send" disabled>Foto an Manager senden</button><div id="status" class="status"></div><small>Die Verbindung läuft nach 15 Minuten automatisch ab.</small></main>
  <script>const token=${JSON.stringify(token)},photo=document.getElementById('photo'),preview=document.getElementById('preview'),send=document.getElementById('send'),status=document.getElementById('status');let imageDataUrl='';
  photo.onchange=()=>{const file=photo.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const max=2600,scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,canvas.width,canvas.height);imageDataUrl=canvas.toDataURL('image/jpeg',.92);preview.src=imageDataUrl;preview.style.display='block';send.disabled=false;status.textContent='Foto bereit. Prüfen Sie, ob Name, Setnummer und unterer Rand lesbar sind.';status.className='status';};image.src=reader.result;};reader.readAsDataURL(file);};
  send.onclick=async()=>{send.disabled=true;status.textContent='Wird übertragen …';status.className='status';try{const response=await fetch('/submit?token='+encodeURIComponent(token),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({imageDataUrl,hint:document.getElementById('hint').value})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Übertragung fehlgeschlagen');status.textContent='Übertragen. Sie können sofort die nächste Karte fotografieren.';status.className='status ok';photo.value='';document.getElementById('hint').value='';imageDataUrl='';preview.removeAttribute('src');preview.style.display='none';}catch(error){status.textContent=error.message;status.className='status bad';}finally{send.disabled=!imageDataUrl;}};</script></body></html>`;
}

class ScannerServer {
  constructor({ onSubmission = () => {} } = {}) {
    this.onSubmission = onSubmission;
    this.server = null;
    this.session = null;
    this.expiryTimer = null;
  }

  touchExpiry() {
    clearTimeout(this.expiryTimer);
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS).toISOString();
    if (this.session) this.session.expiresAt = expiresAt;
    this.expiryTimer = setTimeout(() => this.stop(), SESSION_LIFETIME_MS);
    this.expiryTimer.unref?.();
    return expiresAt;
  }

  async start(mode = 'business', targetId = '') {
    await this.stop();
    const token = crypto.randomBytes(24).toString('hex');
    const sessionId = crypto.randomUUID();
    const safeMode = ['business', 'private', 'purchase', 'sale'].includes(mode) ? mode : 'business';
    this.session = { token, sessionId, mode: safeMode, targetId: safeText(targetId, 100), startedAt: new Date().toISOString() };
    this.server = http.createServer((request, response) => this.handleRequest(request, response));
    await new Promise((resolve, reject) => {
      this.server.once('error', reject);
      this.server.listen(0, '0.0.0.0', resolve);
    });
    const port = this.server.address().port;
    const addresses = lanAddresses();
    const address = addresses[0] || '127.0.0.1';
    const url = `http://${address}:${port}/?token=${token}`;
    const qrDataUrl = await QRCode.toDataURL(url, { width: 260, margin: 1, errorCorrectionLevel: 'M' });
    const expiresAt = this.touchExpiry();
    return { running: true, sessionId, mode: this.session.mode, targetId: this.session.targetId, url, localUrl: `http://127.0.0.1:${port}/?token=${token}`, addresses, port, qrDataUrl, expiresAt };
  }

  status() {
    if (!this.server || !this.session) return { running: false };
    return { running: true, sessionId: this.session.sessionId, mode: this.session.mode, startedAt: this.session.startedAt, expiresAt: this.session.expiresAt };
  }

  async stop() {
    clearTimeout(this.expiryTimer);
    this.expiryTimer = null;
    const current = this.server;
    this.server = null;
    this.session = null;
    if (current) await new Promise(resolve => current.close(() => resolve()));
    return { running: false };
  }

  reply(response, statusCode, body, contentType = 'application/json; charset=utf-8') {
    response.writeHead(statusCode, {
      'content-type': contentType,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer'
    });
    response.end(typeof body === 'string' ? body : JSON.stringify(body));
  }

  validToken(requestUrl) {
    return this.session && requestUrl.searchParams.get('token') === this.session.token;
  }

  handleRequest(request, response) {
    const requestUrl = new URL(request.url, 'http://localhost');
    if (!this.validToken(requestUrl)) return this.reply(response, 403, { error: 'Diese Scanner-Verbindung ist ungültig oder abgelaufen.' });
    if (request.method === 'GET' && requestUrl.pathname === '/') return this.reply(response, 200, scannerPage(this.session.token), 'text/html; charset=utf-8');
    if (request.method === 'GET' && requestUrl.pathname === '/health') return this.reply(response, 200, { ok: true, sessionId: this.session.sessionId });
    if (request.method !== 'POST' || requestUrl.pathname !== '/submit') return this.reply(response, 404, { error: 'Nicht gefunden.' });
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) request.destroy();
      else chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const imageDataUrl = String(payload.imageDataUrl || '');
        if (!/^data:image\/(?:jpeg|png|webp);base64,/i.test(imageDataUrl) || imageDataUrl.length > MAX_BODY_BYTES) {
          return this.reply(response, 400, { error: 'Bitte ein gültiges Kartenfoto auswählen.' });
        }
        const submission = { id: crypto.randomUUID(), sessionId: this.session.sessionId, mode: this.session.mode, targetId: this.session.targetId, receivedAt: new Date().toISOString(), hint: safeText(payload.hint), imageDataUrl };
        this.onSubmission(submission);
        return this.reply(response, 200, { ok: true, submissionId: submission.id, expiresAt: this.touchExpiry() });
      } catch {
        return this.reply(response, 400, { error: 'Die Scanner-Daten konnten nicht gelesen werden.' });
      }
    });
    request.on('error', () => {
      if (!response.headersSent) this.reply(response, 400, { error: 'Die Übertragung wurde abgebrochen.' });
    });
  }
}

module.exports = { ScannerServer, lanAddresses, MAX_BODY_BYTES };
