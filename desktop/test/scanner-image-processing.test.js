const test = require('node:test');
const assert = require('node:assert/strict');
const imageProcessing = require('../app/shared/scanner-image-processing');

function syntheticCardImage(width = 600, height = 900) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 185;data[index + 1] = 170;data[index + 2] = 145;data[index + 3] = 255;
  }
  const card = { left: 100, top: 140, width: 400, height: 590 };
  for (let y = card.top; y < card.top + card.height; y += 1) {
    for (let x = card.left; x < card.left + card.width; x += 1) {
      const border = x < card.left + 8 || x >= card.left + card.width - 8 || y < card.top + 8 || y >= card.top + card.height - 8;
      const offset = (y * width + x) * 4;
      data[offset] = border ? 20 : 205;data[offset + 1] = border ? 25 : 145;data[offset + 2] = border ? 30 : 110;
    }
  }
  return { data, width, height, card };
}

test('findet eine hochkant fotografierte Kartenfläche und berechnet wichtige Textbereiche', () => {
  const image = syntheticCardImage();
  const candidates = imageProcessing.candidateBoundsFromRgba(image.data, image.width, image.height);
  assert.ok(candidates.length >= 1);
  const detected = candidates[0];
  assert.ok(detected.left < image.card.left + 90);
  assert.ok(detected.left + detected.width > image.card.left + image.card.width - 90);
  const title = imageProcessing.regionRect(detected, 'title', image.width, image.height);
  const setCode = imageProcessing.regionRect(detected, 'setCode', image.width, image.height);
  const footer = imageProcessing.regionRect(detected, 'footer', image.width, image.height);
  assert.ok(title.top < setCode.top);
  assert.ok(setCode.top < footer.top);
  assert.ok(setCode.left > title.left);
});
