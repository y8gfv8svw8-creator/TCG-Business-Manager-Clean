(function initializeCollectionNameEvaluation(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgCollectionNameEvaluation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCollectionNameEvaluation() {
  "use strict";

  function boundedScore(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
  }

  function evaluateCase(row = {}) {
    const expectedMetacardId = String(row.expectedMetacardId || "").trim();
    const candidates = Array.isArray(row.candidates) ? row.candidates : [];
    const candidateIds = candidates.map(candidate => String(candidate?.metacardId || "").trim()).filter(Boolean);
    const topCandidate = candidates[0] || null;
    const topScore = boundedScore(row.confidenceScore ?? topCandidate?.score);
    const nameConfidence = String(row.nameConfidence || topCandidate?.confidence || "unknown").toLowerCase();
    const unknown = !topCandidate || nameConfidence === "unknown";
    const knownExpected = Boolean(expectedMetacardId);
    const top1Correct = knownExpected && candidateIds[0] === expectedMetacardId;
    const top3Correct = knownExpected && candidateIds.slice(0, 3).includes(expectedMetacardId);
    const falseConfident = knownExpected && !top1Correct && nameConfidence === "high";
    return {
      ...row,
      expectedMetacardId,
      knownExpected,
      topCandidate,
      topScore,
      nameConfidence,
      unknown,
      top1Correct,
      top3Correct,
      falseConfident
    };
  }

  function aggregate(cases = []) {
    const rows = cases.map(evaluateCase);
    const known = rows.filter(row => row.knownExpected);
    const correct = known.filter(row => row.top1Correct);
    const wrong = known.filter(row => !row.top1Correct && !row.unknown);
    const sum = values => values.reduce((total, value) => total + value, 0);
    const average = values => values.length ? sum(values) / values.length : null;
    return {
      cases: rows.length,
      knownCases: known.length,
      top1Correct: correct.length,
      top3Correct: known.filter(row => row.top3Correct).length,
      top1Accuracy: known.length ? correct.length / known.length : null,
      top3Accuracy: known.length ? known.filter(row => row.top3Correct).length / known.length : null,
      unknownCount: rows.filter(row => row.unknown).length,
      unknownRate: rows.length ? rows.filter(row => row.unknown).length / rows.length : null,
      falseConfidentCount: rows.filter(row => row.falseConfident).length,
      falseConfidentRate: known.length ? rows.filter(row => row.falseConfident).length / known.length : null,
      averageCorrectConfidence: average(correct.map(row => row.topScore)),
      averageWrongConfidence: average(wrong.map(row => row.topScore)),
      averageDurationMs: average(rows.map(row => Number(row.durationMs || 0)).filter(Number.isFinite))
    };
  }

  function groupedSummary(rows, key) {
    const values = [...new Set(rows.map(row => String(row?.[key] || "unknown")))].sort();
    return Object.fromEntries(values.map(value => [value, aggregate(rows.filter(row => String(row?.[key] || "unknown") === value))]));
  }

  function evaluateNameRecognitionCases(cases = []) {
    const rows = (Array.isArray(cases) ? cases : []).map(evaluateCase);
    const ablationModes = [...new Set(rows.flatMap(row => Object.keys(row.ablations || {})))].sort();
    const byAblation = Object.fromEntries(ablationModes.map(mode => [mode, aggregate(rows.map(row => ({
      ...row,
      ...(row.ablations?.[mode] || {}),
      ablations: undefined
    })))]));
    return {
      summary: aggregate(rows),
      bySplit: groupedSummary(rows, "split"),
      byLanguage: groupedSummary(rows, "language"),
      byScene: groupedSummary(rows, "scene"),
      byAblation,
      cases: rows
    };
  }

  return Object.freeze({ evaluateCase, aggregate, evaluateNameRecognitionCases });
});
