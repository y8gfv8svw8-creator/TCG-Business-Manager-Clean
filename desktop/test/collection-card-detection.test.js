const test = require('node:test');
const assert = require('node:assert/strict');
const imageProcessing = require('../app/shared/scanner-image-processing');
const photoModel = require('../app/shared/collection-photo-model');

function image(width = 720, height = 520, background = [176, 168, 151]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = background[0];data[index + 1] = background[1];data[index + 2] = background[2];data[index + 3] = 255;
  }
  return { data, width, height, boxes: [] };
}

function paintCard(target, box, options = {}) {
  const border = options.border || 7;
  const angle = Number(options.angle || 0) * Math.PI / 180;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const radius = Math.ceil(Math.hypot(box.width, box.height) / 2) + 2;
  const left = Math.max(0, Math.floor(centerX - radius));
  const right = Math.min(target.width - 1, Math.ceil(centerX + radius));
  const top = Math.max(0, Math.floor(centerY - radius));
  const bottom = Math.min(target.height - 1, Math.ceil(centerY + radius));
  const cosine = Math.cos(-angle);
  const sine = Math.sin(-angle);
  for (let y = top; y <= bottom; y += 1) for (let x = left; x <= right; x += 1) {
    const dx = x - centerX;
    const dy = y - centerY;
    const localX = dx * cosine - dy * sine + box.width / 2;
    const localY = dx * sine + dy * cosine + box.height / 2;
    if (localX < 0 || localY < 0 || localX >= box.width || localY >= box.height) continue;
    const edge = localX < border || localX >= box.width - border || localY < border || localY >= box.height - border;
    const title = localY >= box.height * .08 && localY < box.height * .15;
    const artwork = localX > box.width * .10 && localX < box.width * .90 && localY > box.height * .20 && localY < box.height * .60;
    const offset = (y * target.width + x) * 4;
    const reflection = options.reflection && localX > box.width * .12 && localX < box.width * .88
      && Math.abs(localX - box.width * .18 - localY * .34) < box.width * .09;
    const color = reflection ? [247, 247, 242]
      : edge ? (options.borderColor || [24, 27, 31])
        : title ? (options.titleColor || [220, 188, 122])
          : artwork ? (options.artworkColor || [52 + (x % 28), 92 + (y % 35), 128])
            : (options.bodyColor || [199, 142, 103]);
    target.data[offset] = color[0];target.data[offset + 1] = color[1];target.data[offset + 2] = color[2];target.data[offset + 3] = 255;
  }
  const corners = [
    [-box.width / 2, -box.height / 2], [box.width / 2, -box.height / 2],
    [box.width / 2, box.height / 2], [-box.width / 2, box.height / 2]
  ].map(([x, y]) => ({ x: centerX + x * Math.cos(angle) - y * Math.sin(angle), y: centerY + x * Math.sin(angle) + y * Math.cos(angle) }));
  const minX = Math.max(0, Math.min(...corners.map(row => row.x)));
  const minY = Math.max(0, Math.min(...corners.map(row => row.y)));
  const maxX = Math.min(target.width, Math.max(...corners.map(row => row.x)));
  const maxY = Math.min(target.height, Math.max(...corners.map(row => row.y)));
  target.boxes.push({ x: minX / target.width, y: minY / target.height, width: (maxX - minX) / target.width, height: (maxY - minY) / target.height });
}

function paintOutline(target, box, color = [44, 47, 52], thickness = 5) {
  for (let y = Math.max(0, box.y); y < Math.min(target.height, box.y + box.height); y += 1) {
    for (let x = Math.max(0, box.x); x < Math.min(target.width, box.x + box.width); x += 1) {
      if (x >= box.x + thickness && x < box.x + box.width - thickness
        && y >= box.y + thickness && y < box.y + box.height - thickness) continue;
      const offset = (y * target.width + x) * 4;
      target.data[offset] = color[0];target.data[offset + 1] = color[1];target.data[offset + 2] = color[2];
    }
  }
}

let difficultPortraitResult = null;
function difficultPortraitFixture() {
  if (difficultPortraitResult) return difficultPortraitResult;
  const target = image(760, 940, [164, 158, 147]);
  for (let y = 0; y < target.height; y += 80) paintOutline(target, { x: 0, y, width: target.width, height: 2 }, [160, 154, 145], 2);
  paintOutline(target, { x: 18, y: 22, width: 724, height: 890 }, [117, 113, 108], 3);
  paintCard(target, { x: 62, y: 58, width: 270, height: 382 }, {
    border: 5, borderColor: [145, 139, 132], artworkColor: [12, 38, 92]
  });
  paintOutline(target, { x: 407, y: 43, width: 287, height: 410 }, [215, 207, 184], 5);
  paintCard(target, { x: 416, y: 55, width: 270, height: 390 }, { reflection: true });
  paintCard(target, { x: 55, y: 505, width: 282, height: 405 }, { reflection: true, angle: -2 });
  paintCard(target, { x: 408, y: 500, width: 278, height: 398 }, { angle: 2 });
  const result = detect(target, { maxDimension: 420 });
  difficultPortraitResult = {
    target,
    result,
    evaluation: imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, {
      iouThreshold: .38,
      minimumCoverage: .72,
      strictOuterBoxes: true
    })
  };
  return difficultPortraitResult;
}

function detect(target, options = {}) {
  return imageProcessing.detectCollectionCardsFromRgba(target.data, target.width, target.height, options);
}

test('Bild ohne Karte erzeugt keine zufälligen Kartenflächen', () => {
  const result = detect(image(640, 420));
  assert.equal(result.detections.length, 0);
  assert.ok(result.photoQuality.warnings.includes('low_contrast'));
});

test('erkennt eine klar sichtbare Karte mit normalisierter Bounding Box', () => {
  const target = image();paintCard(target, { x: 250, y: 55, width: 220, height: 325 });
  const result = detect(target);
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .45);
  assert.equal(evaluation.truePositives, 1);
  assert.ok(evaluation.meanIoU >= .55);
  assert.ok(result.detections.every(row => photoModel.normalizeBoundingBox(row.boundingBox)));
  assert.ok(result.detections.every(row => row.observationSource === 'automatic'));
});

test('erkennt mehrere getrennte Karten und unterdrückt Doppelboxen', () => {
  const target = image(760, 560);
  paintCard(target, { x: 60, y: 55, width: 145, height: 215 });
  paintCard(target, { x: 245, y: 55, width: 145, height: 215 });
  paintCard(target, { x: 430, y: 55, width: 145, height: 215 });
  paintCard(target, { x: 245, y: 310, width: 145, height: 215 });
  const result = detect(target);
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .40);
  assert.equal(evaluation.truePositives, 4);
  assert.ok(evaluation.precision >= .75);
  for (let left = 0; left < result.detections.length; left += 1) for (let right = left + 1; right < result.detections.length; right += 1) {
    assert.ok(imageProcessing.boundingBoxIoU(result.detections[left], result.detections[right]) < .45);
  }
});

test('nutzt eine regelmäßige 3x3-Anordnung nur als Zusatzsignal', () => {
  const target = image(780, 780, [48, 51, 56]);
  for (let row = 0; row < 3; row += 1) for (let column = 0; column < 3; column += 1) {
    paintCard(target, { x: 72 + column * 235, y: 45 + row * 245, width: 145, height: 214 });
  }
  const result = detect(target);
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .40);
  assert.equal(evaluation.truePositives, 9);
  assert.ok(result.detections.filter(row => row.row && row.column).length >= 7);
});

test('leicht schräge Karte bleibt ein unsicherer aber brauchbarer Vorschlag', () => {
  const target = image(700, 560);paintCard(target, { x: 250, y: 100, width: 180, height: 265 }, { angle: 7 });
  const result = detect(target, { minimumScore: .55 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .35);
  assert.equal(evaluation.truePositives, 1);
  assert.ok(result.detections[0].detectionConfidence !== 'unknown');
});

test('schwache Außenkanten verlieren nicht gegen starke Artwork-Kanten', () => {
  const fixture = difficultPortraitFixture();
  assert.equal(fixture.evaluation.truePositives, 4);
  assert.equal(fixture.evaluation.innerCropDetections, 0);
  // A rotated card is compared against its axis-aligned outer envelope; a
  // mean coverage near 80 % still means all four full-card regions pass the
  // stricter per-card 72 % outer-box requirement.
  assert.ok(fixture.evaluation.meanCoverage >= .79);
});

test('Binderfolie, Reflexion, Größenunterschiede und leichte Rotation erzeugen keine Doppelboxen', () => {
  const fixture = difficultPortraitFixture();
  assert.equal(fixture.result.detections.length, 4);
  assert.ok(fixture.evaluation.precision >= .95);
  assert.ok(fixture.result.detections.every(row => row.detectionSignals.outerBoundaryScore >= .38));
});

test('große Hintergrundrahmen und Muster werden nicht als zusätzliche Karten gewertet', () => {
  const fixture = difficultPortraitFixture();
  assert.equal(fixture.evaluation.falsePositives, 0);
  assert.ok(fixture.result.detections.every(row => row.boundingBox.width < .50 && row.boundingBox.height < .58));
});

test('IoU-Evaluation meldet Treffer, Fehlvorschläge und fehlende Karten reproduzierbar', () => {
  const expected = [{ x: .1, y: .1, width: .2, height: .3 }, { x: .6, y: .1, width: .2, height: .3 }];
  const detected = [{ boundingBox: { x: .11, y: .11, width: .2, height: .3 } }, { boundingBox: { x: .1, y: .6, width: .2, height: .3 } }];
  const result = imageProcessing.evaluateCollectionDetections(expected, detected, .5);
  assert.deepEqual({ tp: result.truePositives, fp: result.falsePositives, fn: result.falseNegatives }, { tp: 1, fp: 1, fn: 1 });
  assert.equal(result.precision, .5);assert.equal(result.recall, .5);assert.equal(result.f1, .5);
});

test('strenge Evaluation wertet ein inneres Artwork-Rechteck nicht als ganze Karte', () => {
  const expected = [{ x: .10, y: .10, width: .30, height: .44 }];
  const innerArtwork = [{ boundingBox: { x: .14, y: .19, width: .22, height: .22 } }];
  const result = imageProcessing.evaluateCollectionDetections(expected, innerArtwork, {
    iouThreshold: .20,
    minimumCoverage: .72,
    strictOuterBoxes: true
  });
  assert.equal(result.truePositives, 0);
  assert.equal(result.falsePositives, 1);
  assert.equal(result.falseNegatives, 1);
  assert.equal(result.innerCropDetections, 1);
  assert.ok(result.innerCropPairs[0].coverage < .5);
  assert.ok(result.innerCropPairs[0].areaRatio < .5);
});

test('strenge Evaluation protokolliert Abdeckung und Flächenverhältnis einer Vollkarte', () => {
  const expected = [{ x: .10, y: .10, width: .30, height: .44 }];
  const detected = [{ boundingBox: { x: .105, y: .105, width: .29, height: .43 } }];
  const result = imageProcessing.evaluateCollectionDetections(expected, detected, {
    iouThreshold: .50,
    minimumCoverage: .72,
    strictOuterBoxes: true
  });
  assert.equal(result.truePositives, 1);
  assert.ok(result.meanCoverage > .90);
  assert.ok(result.meanAreaRatio > .90 && result.meanAreaRatio < 1.05);
  assert.equal(result.innerCropDetections, 0);
});

test('IoU ist für identische, getrennte und teilweise überlappende Boxen korrekt', () => {
  const box = { x: .1, y: .1, width: .2, height: .3 };
  assert.equal(imageProcessing.boundingBoxIoU(box, box), 1);
  assert.equal(imageProcessing.boundingBoxIoU(box, { x: .7, y: .7, width: .2, height: .2 }), 0);
  const partial = imageProcessing.boundingBoxIoU({ x: 0, y: 0, width: .5, height: .5 }, { x: .25, y: .25, width: .5, height: .5 });
  assert.ok(Math.abs(partial - 1 / 7) < 1e-9);
});

test('automatische Vorschläge setzen weder Namen noch Print noch physische Karte', () => {
  const result = photoModel.mergeDetectionSuggestions([], 'photo-1', [{
    boundingBox: { x: .1, y: .1, width: .2, height: .3 }, detectionConfidence: 'high', detectionScore: .88, detectionSignals: { edgeStrength: .9 }
  }], { analysisId: 'analysis-1', idFactory: () => 'auto-1', now: '2026-08-22T12:00:00.000Z' });
  const observation = result.added[0];
  assert.equal(observation.observationSource, 'automatic');assert.equal(observation.detectionConfidence, 'high');
  assert.equal(observation.nameConfidence, 'unknown');assert.equal(observation.printConfidence, 'unknown');
  assert.equal(observation.selectedName, '');assert.equal(observation.selectedProductId, '');assert.equal(observation.physicalCardId, '');
  assert.equal(observation.linkedCollectionItemId, '');assert.equal(observation.economicRelevant, false);
});

test('Detection-Confidence bleibt unabhängig von Name- und Print-Confidence', () => {
  const observation = photoModel.normalizeObservation({
    photoId: 'p1', boundingBox: { x: .1, y: .1, width: .2, height: .3 }, observationSource: 'automatic',
    detectionConfidence: 'high', nameConfidence: 'low', printConfidence: 'medium'
  }, 'a1');
  assert.equal(observation.detectionConfidence, 'high');assert.equal(observation.nameConfidence, 'low');assert.equal(observation.printConfidence, 'medium');
  const manual = photoModel.normalizeObservation({ photoId: 'p1', boundingBox: { x: .1, y: .1, width: .2, height: .3 }, observationSource: 'manual', detectionConfidence: 'high' }, 'a1');
  assert.equal(manual.detectionConfidence, 'unknown');
});

test('erneuter Scan schützt manuelle, bestätigte und verworfene Beobachtungen', () => {
  const existing = [
    { id: 'manual', photoId: 'p1', boundingBox: { x: .1, y: .1, width: .2, height: .3 }, observationSource: 'manual', physicalCardId: 'physical-1', nameConfidence: 'confirmed', printConfidence: 'confirmed', selectedProductId: '123' },
    { id: 'confirmed', photoId: 'p1', boundingBox: { x: .4, y: .1, width: .2, height: .3 }, observationSource: 'automatic', detectionReviewState: 'confirmed' },
    { id: 'rejected', photoId: 'p1', boundingBox: { x: .7, y: .1, width: .2, height: .3 }, observationSource: 'automatic', detectionReviewState: 'rejected' }
  ];
  const before = structuredClone(existing);
  const detections = existing.map(row => ({ boundingBox: row.boundingBox, detectionConfidence: 'high', detectionScore: .9 }));
  const merged = photoModel.mergeDetectionSuggestions(existing, 'p1', detections, { analysisId: 'a1' });
  assert.equal(merged.added.length, 0);assert.equal(merged.skipped, 3);assert.deepEqual(existing, before);assert.deepEqual(merged.observations, before);
});

test('nicht abgedeckte neue Fläche wird ergänzt, bestehende Verknüpfungen bleiben unangetastet', () => {
  const existing = [{ id: 'manual', photoId: 'p1', boundingBox: { x: .05, y: .05, width: .2, height: .3 }, observationSource: 'manual', physicalCardId: 'physical-1', selectedName: 'Bestehend', selectedProductId: '123', nameConfidence: 'confirmed', printConfidence: 'confirmed' }];
  const result = photoModel.mergeDetectionSuggestions(existing, 'p1', [{ boundingBox: { x: .65, y: .55, width: .2, height: .3 }, detectionConfidence: 'medium', detectionScore: .7 }], { analysisId: 'a1', idFactory: () => 'automatic-new' });
  assert.equal(result.added.length, 1);assert.equal(result.observations.length, 2);
  assert.deepEqual(result.observations[0], existing[0]);assert.equal(result.added[0].id, 'automatic-new');
});
