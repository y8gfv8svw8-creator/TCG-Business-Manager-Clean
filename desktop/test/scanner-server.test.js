const test = require('node:test');
const assert = require('node:assert/strict');
const { ScannerServer } = require('../app/main/scanner-server');

test('stellt eine zeitlich begrenzte iPhone-Verbindung bereit und übernimmt nur gültige Kartenfotos', async t => {
  const submissions = [];
  const server = new ScannerServer({ onSubmission: row => submissions.push(row) });
  t.after(() => server.stop());
  const info = await server.start('private');
  assert.equal(info.running, true);
  assert.equal(info.mode, 'private');
  assert.match(info.qrDataUrl, /^data:image\/png;base64,/);

  const page = await fetch(info.localUrl);
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /Yu-Gi-Oh!-Karte erfassen/);
  assert.match(pageHtml, /direkt weitere Karten fotografieren/i);
  assert.match(pageHtml, /Setnummer rechts unter dem Bild/i);
  assert.match(pageHtml, /const max=2600/);

  const invalidUrl = new URL(info.localUrl);
  invalidUrl.searchParams.set('token', 'ungueltig');
  assert.equal((await fetch(invalidUrl)).status, 403);

  const submitUrl = new URL('/submit', info.localUrl);
  submitUrl.search = new URL(info.localUrl).search;
  const response = await fetch(submitUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ imageDataUrl: 'data:image/jpeg;base64,AAAA', hint: 'RA01-EN008' })
  });
  assert.equal(response.status, 200);
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].mode, 'private');
  assert.equal(submissions[0].hint, 'RA01-EN008');

  const secondResponse = await fetch(submitUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ imageDataUrl: 'data:image/jpeg;base64,BBBB', hint: 'BLCR-EN042' })
  });
  assert.equal(secondResponse.status, 200);
  assert.equal(submissions.length, 2);
  assert.equal(submissions[1].hint, 'BLCR-EN042');
  assert.equal(server.status().running, true);

  await server.stop();
  assert.equal(server.status().running, false);
});
