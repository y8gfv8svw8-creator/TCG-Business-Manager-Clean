const test = require('node:test');
const assert = require('node:assert/strict');
const imageProcessing = require('../app/shared/scanner-image-processing');
const photoModel = require('../app/shared/collection-photo-model');

function image(width = 720, height = 520, background = [176, 168, 151]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = background[0];data[index + 1] = background[1];data[index + 2] = background[2];data[index + 3] = 255;
  }
  return { data, width, height, boxes: [], quadrilaterals: [] };
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
  target.quadrilaterals.push(corners.map(point => ({ x: point.x / target.width, y: point.y / target.height })));
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
  assert.equal(evaluation.truePositives, 1, JSON.stringify(result.detections));
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
  assert.ok(evaluation.precision >= .75, JSON.stringify({ evaluation, detections: result.detections }));
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

test('3x3-Binder verwirft vier große Mehrkartenrahmen und behält einzelne Rasterzellen', () => {
  const target = image(900, 900, [52, 55, 60]);
  for (let row = 0; row < 3; row += 1) for (let column = 0; column < 3; column += 1) {
    paintCard(target, { x: 72 + column * 274, y: 38 + row * 282, width: 170, height: 250 }, {
      border: 5,
      borderColor: [92, 94, 98],
      bodyColor: [169, 119, 88]
    });
  }
  // Reflektierende Binderstege beziehungsweise Seitenrahmen können vier
  // kartenförmige Großbereiche vortäuschen, obwohl in jedem davon weitere
  // vollständige horizontale und vertikale Kartengrenzen sichtbar sind.
  const falseGroupFrames = [
    { x: 34, y: 18, width: 354, height: 520 },
    { x: 496, y: 18, width: 354, height: 520 },
    { x: 34, y: 362, width: 354, height: 520 },
    { x: 496, y: 362, width: 354, height: 520 }
  ];
  falseGroupFrames.forEach(box => {
    paintOutline(target, box, [225, 225, 218], 5);
    paintOutline(target, { x: Math.round(box.x + box.width / 2) - 2, y: box.y, width: 4, height: box.height }, [225, 225, 218], 4);
    paintOutline(target, { x: box.x, y: Math.round(box.y + box.height / 2) - 2, width: box.width, height: 4 }, [225, 225, 218], 4);
  });
  const result = detect(target, { maxDimension: 480 });
  const cardCenters = target.boxes.map(box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 }));
  const coveredCenters = detection => cardCenters.filter(center => center.x >= detection.boundingBox.x
    && center.x <= detection.boundingBox.x + detection.boundingBox.width
    && center.y >= detection.boundingBox.y
    && center.y <= detection.boundingBox.y + detection.boundingBox.height).length;
  assert.ok(result.detections.every(row => coveredCenters(row) <= 1), JSON.stringify(result.detections));
  assert.ok(result.detections.every(row => !row.detectionSignals.multiCardBoxLikely));
  assert.ok(result.parameters.rejectedMultiCardRegions.length >= 1, JSON.stringify(result.parameters.rejectedMultiCardRegions));
  assert.ok(result.parameters.rejectedMultiCardRegions.every(row => row.detectionConfidence === 'low'));
  assert.ok(result.parameters.rejectedMultiCardRegions.every(row => row.detectionScore <= .49));
  assert.ok(result.parameters.rejectedMultiCardRegions.every(row => row.multiCardBoxScore >= .59));
});

test('dynamisches Kartenmodell verwirft die gemeldete Mehrkartenbox auch bei 20 Binderkarten', () => {
  const target = image(900, 1200, [52, 55, 60]);
  for (let row = 0; row < 4; row += 1) for (let column = 0; column < 5; column += 1) {
    paintCard(target, { x: 10 + column * 175, y: 100 + row * 260, width: 145, height: 214 }, {
      border: 5,
      borderColor: [92, 94, 98],
      bodyColor: [169, 119, 88]
    });
  }
  const reportedMultiCardBox = {
    x: 0,
    y: Math.round(0.058333 * target.height),
    width: Math.round(0.375342 * target.width),
    height: Math.round(0.460417 * target.height)
  };
  paintOutline(target, reportedMultiCardBox, [225, 225, 218], 5);
  const result = detect(target, { maxDimension: 480 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .38);
  const normalizedReportedBox = {
    x: reportedMultiCardBox.x / target.width,
    y: reportedMultiCardBox.y / target.height,
    width: reportedMultiCardBox.width / target.width,
    height: reportedMultiCardBox.height / target.height
  };
  assert.ok(evaluation.truePositives >= 18, JSON.stringify({ evaluation, detections: result.detections }));
  assert.ok(result.detections.every(row => imageProcessing.boundingBoxIoU(row.boundingBox, normalizedReportedBox) < .40));
  const rejected = result.parameters.rejectedMultiCardRegions.find(row =>
    imageProcessing.boundingBoxIoU(row.boundingBox, normalizedReportedBox) >= .40);
  assert.ok(rejected, JSON.stringify(result.parameters.rejectedMultiCardRegions));
  assert.equal(rejected.detectionConfidence, 'low');
  assert.ok(rejected.detectionScore <= .49);
  assert.ok(rejected.containedCardStructures >= 2);
});

test('dynamische Außenkantenprüfung ergänzt einen realistischen 7-von-9-Binderfall', () => {
  const target = image(765, 1005, [174, 166, 151]);
  const cards = [
    { x: 42, y: 54, width: 196, height: 274, weak: true },
    { x: 258, y: 45, width: 194, height: 278 },
    { x: 474, y: 38, width: 190, height: 276 },
    { x: 40, y: 330, width: 204, height: 292 },
    { x: 264, y: 320, width: 202, height: 292 },
    { x: 486, y: 306, width: 198, height: 298 },
    { x: 30, y: 628, width: 212, height: 330 },
    { x: 272, y: 620, width: 216, height: 334 },
    { x: 508, y: 606, width: 224, height: 338, weak: true }
  ];
  cards.forEach((box, index) => paintCard(target, box, box.weak ? {
    border: 4,
    borderColor: [137, 132, 124],
    bodyColor: index ? [166, 132, 106] : [171, 138, 111]
  } : {
    border: 6,
    borderColor: [62, 61, 59],
    bodyColor: [171, 132, 102]
  }));
  const result = detect(target, { maxDimension: 480 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .36);
  assert.equal(evaluation.truePositives, 9, JSON.stringify({ evaluation, detections: result.detections }));
  assert.ok(evaluation.precision >= .90);
  assert.ok(result.detections.filter(row => row.detectionSignals.dynamicLayoutRecovered).length >= 2,
    JSON.stringify(result.detections));
  assert.ok(result.detections.every(row => !row.detectionSignals.multiCardBoxLikely));
});

test('leicht schräge Karte bleibt ein unsicherer aber brauchbarer Vorschlag', () => {
  const target = image(700, 560);paintCard(target, { x: 250, y: 100, width: 180, height: 265 }, { angle: 7 });
  const result = detect(target, { minimumScore: .55 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .35);
  assert.equal(evaluation.truePositives, 1);
  assert.ok(result.detections[0].detectionConfidence !== 'unknown');
});

for (const angle of [15, 45, 75]) test(`lose Karte mit ${angle} Grad wird rotationsfähig erkannt`, () => {
  const target = image(760, 620);paintCard(target, { x: 275, y: 145, width: 180, height: 265 }, { angle });
  const result = detect(target, { minimumScore: .52 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .30);
  assert.equal(evaluation.truePositives, 1);
  assert.ok(result.detections.some(row => Math.abs(Number(row.detectionSignals.rotationDegrees || 0)) >= 10), JSON.stringify(result.detections));
  assert.equal(result.sceneAnalysis.sceneType, 'loose_cards');
  assert.equal(result.parameters.detectorMode, 'rotation_aware_loose_cards');
});

test('Polygon-Evaluation misst die orientierte Kartenfläche zusätzlich zur Bounding Box', () => {
  const target = image(760, 620);paintCard(target, { x: 275, y: 145, width: 180, height: 265 }, { angle: 45 });
  const result = detect(target, { minimumScore: .52 });
  const evaluation = imageProcessing.evaluateCollectionDetections([{ boundingBox: target.boxes[0], quadrilateral: target.quadrilaterals[0], occluded: false, visibleFraction: 1 }], result.detections, .30);
  assert.equal(evaluation.truePositives, 1);
  assert.equal(evaluation.polygonMatchCount, 1);
  assert.ok(evaluation.meanPolygonIoU >= .55);
  assert.equal(evaluation.occludedExpectedCards, 0);
  assert.equal(evaluation.partiallyVisibleExpectedCards, 0);
});

test('mehrere lose Karten mit unterschiedlichen Winkeln bleiben getrennte Vorschläge', () => {
  const target = image(900, 700, [151, 145, 137]);
  paintCard(target, { x: 85, y: 90, width: 150, height: 221 }, { angle: -28 });
  paintCard(target, { x: 360, y: 80, width: 175, height: 257 }, { angle: 18 });
  paintCard(target, { x: 665, y: 330, width: 130, height: 191 }, { angle: 63 });
  const result = detect(target, { minimumScore: .52 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .28);
  assert.equal(evaluation.truePositives, 3);
  assert.ok(evaluation.precision >= .75, JSON.stringify({ evaluation, detections: result.detections }));
  assert.equal(result.sceneAnalysis.sceneType, 'loose_cards');
  assert.ok(result.sceneAnalysis.sceneComplexity.level !== 'low');
});

test('teilweise überlappende lose Karten werden nicht zu einer Gruppenbox zusammengefasst', () => {
  const target = image(860, 660, [158, 151, 140]);
  paintCard(target, { x: 250, y: 165, width: 190, height: 279 }, { angle: -24 });
  paintCard(target, { x: 405, y: 205, width: 185, height: 272 }, { angle: 31, artworkColor: [82, 64, 142] });
  const result = detect(target, { minimumScore: .50 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .24);
  assert.equal(evaluation.truePositives, 2, JSON.stringify({ evaluation, detections: result.detections }));
  assert.ok(result.detections.length <= 3, JSON.stringify(result.detections));
  assert.equal(result.sceneAnalysis.sceneType, 'loose_cards');
  assert.ok(result.detections.every(row => row.boundingBox.width * row.boundingBox.height < .24));
});

test('Fächer und Kartenstapel bleiben konservative Einzelvorschläge ohne erfundene Gruppenkarte', () => {
  const target = image(920, 700, [154, 147, 138]);
  paintCard(target, { x: 255, y: 180, width: 185, height: 272 }, { angle: -28, artworkColor: [88, 58, 118] });
  paintCard(target, { x: 340, y: 150, width: 185, height: 272 }, { angle: -4, artworkColor: [46, 105, 118] });
  paintCard(target, { x: 425, y: 185, width: 185, height: 272 }, { angle: 25, artworkColor: [115, 78, 44] });
  const result = detect(target, { minimumScore: .50 });
  assert.ok(result.detections.length >= 1 && result.detections.length <= 3, JSON.stringify(result.detections));
  assert.ok(result.detections.every(row => row.boundingBox.width * row.boundingBox.height < .25));
  assert.notEqual(result.sceneAnalysis.sceneType, 'binder_grid');
});

test('drei überlappende Karten erzeugen keine gemeinsame Sammelbox', () => {
  const target = image(980, 720, [157, 149, 139]);
  paintCard(target, { x: 205, y: 190, width: 190, height: 279 }, { angle: -22 });
  paintCard(target, { x: 355, y: 155, width: 190, height: 279 }, { angle: 2, artworkColor: [70, 86, 146] });
  paintCard(target, { x: 505, y: 195, width: 190, height: 279 }, { angle: 24, artworkColor: [122, 75, 55] });
  const result = detect(target, { minimumScore: .50 });
  assert.ok(result.detections.length >= 1 && result.detections.length <= 4, JSON.stringify(result.detections));
  assert.ok(result.detections.every(row => row.boundingBox.width * row.boundingBox.height < .24));
  assert.notEqual(result.sceneAnalysis.sceneType, 'binder_grid');
});

test('freie Karten mit deutlich verschiedenen Größen werden über mehrere Skalen erkannt', () => {
  const target = image(1100, 760, [166, 158, 147]);
  paintCard(target, { x: 90, y: 80, width: 120, height: 176 }, { angle: -12 });
  paintCard(target, { x: 410, y: 125, width: 180, height: 265 }, { angle: 18 });
  paintCard(target, { x: 765, y: 245, width: 230, height: 338 }, { angle: -7 });
  const result = detect(target, { minimumScore: .50 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .28);
  assert.equal(evaluation.truePositives, 3, JSON.stringify({ evaluation, detections: result.detections }));
  assert.ok(evaluation.precision >= .75, JSON.stringify({ evaluation, detections: result.detections }));
});

test('großer Umgebungsrahmen wird gegenüber mehreren einzelnen Unterkarten unterdrückt', () => {
  const target = image(980, 700, [169, 162, 151]);
  paintOutline(target, { x: 55, y: 45, width: 860, height: 610 }, [55, 58, 63], 7);
  paintCard(target, { x: 120, y: 120, width: 170, height: 250 });
  paintCard(target, { x: 405, y: 100, width: 170, height: 250 });
  paintCard(target, { x: 690, y: 155, width: 170, height: 250 });
  const result = detect(target);
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .38);
  assert.equal(evaluation.truePositives, 3, JSON.stringify(result.detections));
  assert.ok(result.detections.every(row => row.boundingBox.width * row.boundingBox.height < .30));
});

test('freie Karten auf unruhigem Linienhintergrund bleiben Einzelkandidaten', () => {
  const target = image(920, 680, [145, 139, 132]);
  for (let y = 20; y < target.height; y += 74) paintOutline(target, { x: 0, y, width: target.width, height: 2 }, [132, 126, 120], 2);
  for (let x = 28; x < target.width; x += 116) paintOutline(target, { x, y: 0, width: 2, height: target.height }, [139, 132, 125], 2);
  paintCard(target, { x: 95, y: 90, width: 170, height: 250 }, { angle: -17 });
  paintCard(target, { x: 380, y: 125, width: 170, height: 250 }, { angle: 8 });
  paintCard(target, { x: 665, y: 235, width: 145, height: 213 }, { angle: 38 });
  const result = detect(target, { minimumScore: .50 });
  const evaluation = imageProcessing.evaluateCollectionDetections(target.boxes, result.detections, .27);
  assert.equal(evaluation.truePositives, 3, JSON.stringify({ evaluation, detections: result.detections }));
  assert.ok(evaluation.falsePositives <= 1);
});

test('Szenentyp und Szenenkomplexität bleiben von technischer Bildqualität getrennt', () => {
  const binderRows = [
    { boundingBox: { x: .05, y: .05, width: .20, height: .30 }, row: '1', column: '1', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .30, y: .05, width: .20, height: .30 }, row: '1', column: '2', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .05, y: .42, width: .20, height: .30 }, row: '2', column: '1', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .30, y: .42, width: .20, height: .30 }, row: '2', column: '2', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } }
  ];
  const clear = imageProcessing.analyzeCollectionScene(binderRows, { warnings: [] });
  const dark = imageProcessing.analyzeCollectionScene(binderRows, { warnings: ['very_dark', 'possibly_blurred'] });
  assert.equal(clear.sceneType, 'binder_grid');
  assert.equal(dark.sceneType, 'binder_grid');
  assert.deepEqual(clear.sceneComplexity, dark.sceneComplexity);
  assert.notEqual(clear.sceneSignals.imageWarnings, dark.sceneSignals.imageWarnings);
});

test('gemischte und chaotische Szenen werden nicht als sichere Binder-Seite ausgegeben', () => {
  const rows = [
    { boundingBox: { x: .02, y: .03, width: .16, height: .24 }, row: '1', column: '1', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .21, y: .03, width: .16, height: .24 }, row: '1', column: '2', detectionConfidence: 'high', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .40, y: .03, width: .16, height: .24 }, row: '1', column: '3', detectionConfidence: 'medium', detectionSignals: { rotationDegrees: 0 } },
    { boundingBox: { x: .50, y: .48, width: .28, height: .35 }, row: '', column: '', detectionConfidence: 'low', detectionSignals: { rotationDegrees: 42 } },
    { boundingBox: { x: .62, y: .51, width: .25, height: .32 }, row: '', column: '', detectionConfidence: 'low', detectionSignals: { rotationDegrees: -31 } }
  ];
  const result = imageProcessing.analyzeCollectionScene(rows, { warnings: [] });
  assert.equal(result.sceneType, 'mixed_or_uncertain');
  assert.ok(result.sceneComplexity.level !== 'low');
  assert.ok(result.sceneSignals.overlapPairs >= 1);
});

test('rotationsreicher Kartenfächer bleibt auch ohne sichere Einzelbox eine komplexe unsichere Szene', () => {
  const result = imageProcessing.analyzeCollectionScene([], { warnings: [] }, { orientationSignals: {
    axialRatio: .31,
    diagonalRatio: .43,
    orientationEntropy: .98
  } });
  assert.equal(result.sceneType, 'mixed_or_uncertain');
  assert.equal(result.sceneComplexity.level, 'high');
  assert.ok(result.sceneComplexity.signals.includes('rotation_rich_image'));
  assert.ok(result.sceneComplexity.signals.includes('orientation_disorder'));
  assert.equal(result.sceneSignals.detectionCount, 0);
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

test('strenge Evaluation wertet eine übergroße Sammelbox nicht als einzelne Karte', () => {
  const expected = [{ boundingBox: { x: .20, y: .20, width: .20, height: .30 } }];
  const detected = [{ boundingBox: { x: .12, y: .12, width: .36, height: .46 } }];
  const result = imageProcessing.evaluateCollectionDetections(expected, detected, {
    iouThreshold: .30,
    minimumCoverage: .72,
    maximumAreaRatio: 1.60,
    strictOuterBoxes: true
  });
  assert.equal(result.truePositives, 0);
  assert.equal(result.falsePositives, 1);
  assert.equal(result.falseNegatives, 1);
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
    boundingBox: { x: .1, y: .1, width: .2, height: .3 },
    quadrilateral: [{ x: .12, y: .1 }, { x: .3, y: .13 }, { x: .28, y: .4 }, { x: .1, y: .37 }],
    detectionConfidence: 'high', detectionScore: .88, detectionSignals: { edgeStrength: .9 }
  }], { analysisId: 'analysis-1', idFactory: () => 'auto-1', now: '2026-08-22T12:00:00.000Z' });
  const observation = result.added[0];
  assert.equal(observation.observationSource, 'automatic');assert.equal(observation.detectionConfidence, 'high');
  assert.equal(observation.quadrilateral.length, 4);
  assert.equal(observation.nameConfidence, 'unknown');assert.equal(observation.printConfidence, 'unknown');
  assert.equal(observation.selectedName, '');assert.equal(observation.selectedProductId, '');assert.equal(observation.physicalCardId, '');
  assert.equal(observation.linkedCollectionItemId, '');assert.equal(observation.economicRelevant, false);
});

test('ungültige oder flächenlose Quadrilaterale werden nicht als Geometrie gespeichert', () => {
  const normalized = photoModel.normalizeObservation({
    photoId: 'p1', boundingBox: { x: .1, y: .1, width: .2, height: .3 }, observationSource: 'automatic',
    quadrilateral: [{ x: .1, y: .1 }, { x: .2, y: .2 }, { x: .3, y: .3 }, { x: .4, y: .4 }]
  }, 'a1');
  assert.equal(normalized.quadrilateral, null);
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

test('Szenenanalyse wird ohne Schemaänderung am Foto normalisiert gespeichert', () => {
  const photo = photoModel.normalizePhoto({ id: 'p1', analysisId: 'a1', relativePath: 'collections/a1/p1.jpg', sceneAnalysis: {
    sceneType: 'loose_cards', sceneConfidence: 'high', sceneConfidenceScore: .91,
    sceneSignals: { detectionCount: 4, rotationRatio: .75 },
    sceneComplexity: { level: 'high', score: .72, signals: ['rotated_cards', 'overlapping_regions'] }
  } }, 'a1', 0);
  assert.equal(photo.sceneAnalysis.sceneType, 'loose_cards');
  assert.equal(photo.sceneAnalysis.sceneComplexity.level, 'high');
  assert.deepEqual(photo.sceneAnalysis.sceneComplexity.signals, ['rotated_cards', 'overlapping_regions']);
  assert.equal(photo.sceneAnalysis.sceneSignals.detectionCount, 4);
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
