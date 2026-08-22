(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgCollectionPhotoModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONFIDENCE_VALUES = Object.freeze(['unknown', 'low', 'medium', 'high', 'confirmed']);
  const REVIEW_VALUES = Object.freeze(['unreviewed', 'in_review', 'reviewed', 'rejected']);

  const text = value => String(value == null ? '' : value).trim();
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : null;
  const cleanProductId = value => /^\d+$/.test(text(value)) ? text(value) : '';
  const round6 = value => Math.round(value * 1e6) / 1e6;

  function normalizeConfidence(value) {
    const normalized = text(value).toLowerCase();
    return CONFIDENCE_VALUES.includes(normalized) ? normalized : 'unknown';
  }

  function normalizeReviewStatus(value) {
    const normalized = text(value).toLowerCase();
    return REVIEW_VALUES.includes(normalized) ? normalized : 'unreviewed';
  }

  function normalizeBoundingBox(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const x = finite(value.x);
    const y = finite(value.y);
    const width = finite(value.width);
    const height = finite(value.height);
    if ([x, y, width, height].some(number => number === null)) return null;
    if (x < 0 || y < 0 || width <= 0 || height <= 0) return null;
    if (x > 1 || y > 1 || width > 1 || height > 1) return null;
    if (x + width > 1.000001 || y + height > 1.000001) return null;
    return { x: round6(x), y: round6(y), width: round6(width), height: round6(height) };
  }

  function normalizeNameCandidate(candidate, index = 0) {
    if (typeof candidate === 'string') candidate = { name: candidate };
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const name = text(candidate.name || candidate.germanName || candidate.englishName);
    if (!name) return null;
    return {
      id: text(candidate.id) || `name-candidate-${index}`,
      name,
      germanName: text(candidate.germanName),
      englishName: text(candidate.englishName),
      metacardId: text(candidate.metacardId),
      source: text(candidate.source) || 'manual',
      signal: text(candidate.signal),
      confidence: normalizeConfidence(candidate.confidence)
    };
  }

  function normalizePrintCandidate(candidate, index = 0) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const productId = cleanProductId(candidate.productId);
    if (!productId) return null;
    return {
      id: text(candidate.id) || `print-candidate-${productId}-${index}`,
      productId,
      name: text(candidate.name),
      germanName: text(candidate.germanName),
      englishName: text(candidate.englishName),
      setName: text(candidate.setName || candidate.set),
      collectorNumber: text(candidate.collectorNumber || candidate.setCode),
      rarity: text(candidate.rarity || candidate.variant),
      source: text(candidate.source) || 'manual_search',
      signals: Array.isArray(candidate.signals) ? candidate.signals.map(text).filter(Boolean) : []
    };
  }

  function normalizePhoto(photo, analysisId = '', index = 0) {
    const id = text(photo?.id) || `${analysisId || 'analysis'}:photo:${index}`;
    const normalized = {
      ...photo,
      id,
      analysisId: text(analysisId || photo?.analysisId),
      sequence: Math.max(1, Math.round(Number(photo?.sequence || index + 1))),
      binderPage: text(photo?.binderPage),
      relativePath: text(photo?.relativePath).replaceAll('\\', '/'),
      originalFileName: text(photo?.originalFileName || photo?.fileName),
      mimeType: text(photo?.mimeType).toLowerCase(),
      fileSize: Math.max(0, Math.round(Number(photo?.fileSize || 0))),
      width: Math.max(0, Math.round(Number(photo?.width || 0))),
      height: Math.max(0, Math.round(Number(photo?.height || 0))),
      sha256: text(photo?.sha256).toLowerCase(),
      createdAt: text(photo?.createdAt)
    };
    for (const forbidden of ['dataUrl', 'bytesBase64', 'base64', 'imageData', 'imageDataUrl', 'bytes']) delete normalized[forbidden];
    return normalized;
  }

  function normalizeObservation(observation, analysisId = '', index = 0) {
    const nameCandidates = (Array.isArray(observation?.nameCandidates) ? observation.nameCandidates : [])
      .map(normalizeNameCandidate).filter(Boolean);
    const printCandidates = (Array.isArray(observation?.printCandidates) ? observation.printCandidates : [])
      .map(normalizePrintCandidate).filter(Boolean);
    const selectedProductId = cleanProductId(observation?.selectedProductId);
    const requestedPrintConfidence = normalizeConfidence(observation?.printConfidence);
    return {
      ...observation,
      id: text(observation?.id) || `${analysisId || 'analysis'}:observation:${index}`,
      analysisId: text(analysisId || observation?.analysisId),
      photoId: text(observation?.photoId),
      boundingBox: normalizeBoundingBox(observation?.boundingBox),
      row: text(observation?.row),
      column: text(observation?.column),
      selectedName: text(observation?.selectedName),
      nameCandidates,
      nameConfidence: normalizeConfidence(observation?.nameConfidence),
      selectedProductId,
      printCandidates,
      printConfidence: requestedPrintConfidence === 'confirmed' && !selectedProductId ? 'unknown' : requestedPrintConfidence,
      recognitionSignals: Array.isArray(observation?.recognitionSignals)
        ? observation.recognitionSignals.map(text).filter(Boolean)
        : [],
      economicRelevant: Boolean(observation?.economicRelevant),
      detailPhotoRequired: Boolean(observation?.detailPhotoRequired),
      reviewStatus: normalizeReviewStatus(observation?.reviewStatus),
      physicalCardId: text(observation?.physicalCardId),
      linkedCollectionItemId: text(observation?.linkedCollectionItemId),
      createdAt: text(observation?.createdAt),
      updatedAt: text(observation?.updatedAt)
    };
  }

  function normalizePhysicalCard(card, analysisId = '', index = 0) {
    return {
      ...card,
      id: text(card?.id) || `${analysisId || 'analysis'}:physical-card:${index}`,
      analysisId: text(analysisId || card?.analysisId),
      label: text(card?.label) || `Physische Karte ${index + 1}`,
      linkedCollectionItemId: text(card?.linkedCollectionItemId),
      productId: cleanProductId(card?.productId),
      name: text(card?.name),
      reviewStatus: normalizeReviewStatus(card?.reviewStatus),
      createdAt: text(card?.createdAt),
      updatedAt: text(card?.updatedAt)
    };
  }

  function normalizeAnalysisPhotoEvidence(analysis = {}) {
    const analysisId = text(analysis.id);
    const photos = (Array.isArray(analysis.photos) ? analysis.photos : []).map((row, index) => normalizePhoto(row, analysisId, index));
    const photoIds = new Set(photos.map(row => row.id));
    const physicalCards = (Array.isArray(analysis.physicalCards) ? analysis.physicalCards : []).map((row, index) => normalizePhysicalCard(row, analysisId, index));
    const physicalIds = new Set(physicalCards.map(row => row.id));
    const observations = (Array.isArray(analysis.photoObservations) ? analysis.photoObservations : [])
      .map((row, index) => normalizeObservation(row, analysisId, index))
      .filter(row => photoIds.has(row.photoId))
      .map(row => ({ ...row, physicalCardId: physicalIds.has(row.physicalCardId) ? row.physicalCardId : '' }));
    return { photos, photoObservations: observations, physicalCards };
  }

  function summarizePhotoEvidence(analysis = {}) {
    const normalized = normalizeAnalysisPhotoEvidence(analysis);
    const linkedPhysicalIds = new Set(normalized.photoObservations.map(row => row.physicalCardId).filter(Boolean));
    const linkedItemIds = new Set(normalized.physicalCards.map(row => row.linkedCollectionItemId).filter(Boolean));
    return {
      photoCount: normalized.photos.length,
      observationCount: normalized.photoObservations.length,
      physicalCardCount: normalized.physicalCards.length,
      observedPhysicalCardCount: linkedPhysicalIds.size,
      economicallyLinkedPhysicalCardCount: normalized.physicalCards.filter(row => row.linkedCollectionItemId).length,
      economicallyLinkedItemCount: linkedItemIds.size,
      unlinkedObservationCount: normalized.photoObservations.filter(row => !row.physicalCardId).length,
      detailPhotoRequiredCount: normalized.photoObservations.filter(row => row.detailPhotoRequired).length
    };
  }

  function removePhotoEvidence(analysis = {}, photoId = '') {
    const target = text(photoId);
    return {
      ...analysis,
      photos: (Array.isArray(analysis.photos) ? analysis.photos : []).filter(row => text(row?.id) !== target),
      photoObservations: (Array.isArray(analysis.photoObservations) ? analysis.photoObservations : []).filter(row => text(row?.photoId) !== target),
      physicalCards: Array.isArray(analysis.physicalCards) ? analysis.physicalCards : [],
      items: Array.isArray(analysis.items) ? analysis.items : []
    };
  }

  function isPrintExplicitlyConfirmed(observation = {}) {
    return normalizeConfidence(observation.printConfidence) === 'confirmed' && Boolean(cleanProductId(observation.selectedProductId));
  }

  return Object.freeze({
    CONFIDENCE_VALUES,
    REVIEW_VALUES,
    normalizeConfidence,
    normalizeReviewStatus,
    normalizeBoundingBox,
    normalizeNameCandidate,
    normalizePrintCandidate,
    normalizePhoto,
    normalizeObservation,
    normalizePhysicalCard,
    normalizeAnalysisPhotoEvidence,
    summarizePhotoEvidence,
    removePhotoEvidence,
    isPrintExplicitlyConfirmed
  });
});
