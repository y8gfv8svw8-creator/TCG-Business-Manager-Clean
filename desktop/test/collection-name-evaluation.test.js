const test = require('node:test');
const assert = require('node:assert/strict');
const evaluation = require('../app/shared/collection-name-evaluation');

test('Realfoto-Auswertung berechnet Top-1, Top-3, Unknown und False-Confident getrennt', () => {
  const report = evaluation.evaluateNameRecognitionCases([
    { split: 'development', language: 'de', scene: 'binder', expectedMetacardId: '1', candidates: [{ metacardId: '1', score: .91 }], nameConfidence: 'high', durationMs: 1000 },
    { split: 'development', language: 'en', scene: 'binder', expectedMetacardId: '2', candidates: [{ metacardId: '9', score: .72 }, { metacardId: '2', score: .68 }], nameConfidence: 'medium', durationMs: 1200 },
    { split: 'holdout', language: 'de', scene: 'loose', expectedMetacardId: '3', candidates: [], nameConfidence: 'unknown', durationMs: 800 },
    { split: 'holdout', language: 'de', scene: 'loose', expectedMetacardId: '4', candidates: [{ metacardId: '8', score: .89 }], nameConfidence: 'high', durationMs: 900 }
  ]);
  assert.equal(report.summary.top1Accuracy, .25);
  assert.equal(report.summary.top3Accuracy, .5);
  assert.equal(report.summary.unknownRate, .25);
  assert.equal(report.summary.falseConfidentRate, .25);
  assert.equal(report.bySplit.development.top3Accuracy, 1);
  assert.equal(report.byLanguage.en.top3Accuracy, 1);
  assert.equal(report.byScene.loose.falseConfidentRate, .5);
});

test('unbekannte Ground Truth wird nicht fälschlich in die Accuracy eingerechnet', () => {
  const report = evaluation.evaluateNameRecognitionCases([
    { split: 'holdout', expectedMetacardId: '', candidates: [], nameConfidence: 'unknown' },
    { split: 'holdout', expectedMetacardId: '5', candidates: [{ metacardId: '5', score: .8 }], nameConfidence: 'medium' }
  ]);
  assert.equal(report.summary.knownCases, 1);
  assert.equal(report.summary.top1Accuracy, 1);
  assert.equal(report.summary.unknownCount, 1);
});

test('Ablation wertet OCR, Passcode, Artwork und Fusion getrennt aus', () => {
  const result = evaluation.evaluateNameRecognitionCases([{
    expectedMetacardId: '100', candidates: [{ metacardId: '100', score: .9 }], nameConfidence: 'high', confidenceScore: .9,
    ablations: {
      ocrOnly: { candidates: [], nameConfidence: 'unknown', confidenceScore: 0 },
      ocrPasscode: { candidates: [{ metacardId: '100', score: .78 }], nameConfidence: 'low', confidenceScore: .78 },
      ocrArtwork: { candidates: [{ metacardId: '200', score: .65 }], nameConfidence: 'low', confidenceScore: .65 },
      combined: { candidates: [{ metacardId: '100', score: .9 }], nameConfidence: 'high', confidenceScore: .9 }
    }
  }]);
  assert.equal(result.byAblation.ocrOnly.top1Accuracy, 0);
  assert.equal(result.byAblation.ocrPasscode.top1Accuracy, 1);
  assert.equal(result.byAblation.ocrArtwork.top1Accuracy, 0);
  assert.equal(result.byAblation.combined.top1Accuracy, 1);
});
