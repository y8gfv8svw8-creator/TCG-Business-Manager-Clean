(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgCollectionPhotoModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONFIDENCE_VALUES = Object.freeze(['unknown', 'low', 'medium', 'high', 'confirmed']);
  const REVIEW_VALUES = Object.freeze(['unreviewed', 'in_review', 'reviewed', 'rejected']);
  const OBSERVATION_SOURCE_VALUES = Object.freeze(['manual', 'automatic']);
  const DETECTION_REVIEW_VALUES = Object.freeze(['manual', 'suggested', 'confirmed', 'rejected']);
  const SCENE_TYPE_VALUES = Object.freeze(['binder_grid', 'loose_cards', 'mixed_or_uncertain']);
  const COMPLEXITY_VALUES = Object.freeze(['low', 'medium', 'high']);

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

  function normalizeObservationSource(value) {
    const normalized = text(value).toLowerCase();
    return OBSERVATION_SOURCE_VALUES.includes(normalized) ? normalized : 'manual';
  }

  function normalizeDetectionReviewState(value, source = 'manual') {
    const normalized = text(value).toLowerCase();
    if (DETECTION_REVIEW_VALUES.includes(normalized)) return normalized;
    return normalizeObservationSource(source) === 'automatic' ? 'suggested' : 'manual';
  }

  function normalizeDetectionSignals(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([key, item]) => text(key) && (item == null || ['string', 'number', 'boolean'].includes(typeof item) || (Array.isArray(item) && item.every(entry => ['string', 'number', 'boolean'].includes(typeof entry))))));
  }

  function normalizeSceneAnalysis(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const sceneType = text(value.sceneType).toLowerCase();
    const sceneConfidence = normalizeConfidence(value.sceneConfidence);
    const confidenceScore = finite(value.sceneConfidenceScore);
    const complexity = value.sceneComplexity && typeof value.sceneComplexity === 'object' && !Array.isArray(value.sceneComplexity)
      ? value.sceneComplexity : {};
    const complexityLevel = text(complexity.level).toLowerCase();
    const complexityScore = finite(complexity.score);
    return {
      sceneType: SCENE_TYPE_VALUES.includes(sceneType) ? sceneType : 'mixed_or_uncertain',
      sceneConfidence: ['low', 'medium', 'high'].includes(sceneConfidence) ? sceneConfidence : 'low',
      sceneConfidenceScore: confidenceScore === null ? 0 : Math.max(0, Math.min(1, round6(confidenceScore))),
      sceneSignals: normalizeDetectionSignals(value.sceneSignals),
      sceneComplexity: {
        level: COMPLEXITY_VALUES.includes(complexityLevel) ? complexityLevel : 'low',
        score: complexityScore === null ? 0 : Math.max(0, Math.min(1, round6(complexityScore))),
        signals: Array.isArray(complexity.signals) ? complexity.signals.map(text).filter(Boolean) : []
      }
    };
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

  function normalizeQuadrilateral(value) {
    if (!Array.isArray(value) || value.length !== 4) return null;
    const points = value.map(point => ({ x: finite(point?.x), y: finite(point?.y) }));
    if (points.some(point => point.x === null || point.y === null || point.x < 0 || point.y < 0 || point.x > 1 || point.y > 1)) return null;
    let signedArea = 0;
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      signedArea += current.x * next.y - next.x * current.y;
    }
    if (Math.abs(signedArea / 2) <= 0.000001) return null;
    return points.map(point => ({ x: round6(point.x), y: round6(point.y) }));
  }

  function normalizeNameCandidate(candidate, index = 0) {
    if (typeof candidate === 'string') candidate = { name: candidate };
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const name = text(candidate.name || candidate.germanName || candidate.englishName);
    if (!name) return null;
    const score = finite(candidate.score);
    const ocrConfidence = finite(candidate.ocrConfidence);
    return {
      id: text(candidate.id) || `name-candidate-${index}`,
      name,
      germanName: text(candidate.germanName),
      englishName: text(candidate.englishName),
      metacardId: text(candidate.metacardId),
      source: text(candidate.source) || 'manual',
      signal: text(candidate.signal),
      confidence: normalizeConfidence(candidate.confidence),
      score: score === null ? null : Math.max(0, Math.min(1, round6(score))),
      matchedAlias: text(candidate.matchedAlias),
      matchedLanguage: text(candidate.matchedLanguage).toLowerCase(),
      ocrText: text(candidate.ocrText),
      ocrConfidence: ocrConfidence === null ? null : Math.max(0, Math.min(100, Math.round(ocrConfidence * 10) / 10)),
      supportCount: Math.max(0, Math.round(Number(candidate.supportCount || 0))),
      setCodeMatched: Boolean(candidate.setCodeMatched),
      passcodeMatched: Boolean(candidate.passcodeMatched),
      matchedPasscode: text(candidate.matchedPasscode),
      artworkSimilarity: Math.max(0, Math.min(1, Number(candidate.artworkSimilarity || 0))),
      signalConflict: Boolean(candidate.signalConflict),
      signalScores: candidate.signalScores && typeof candidate.signalScores === 'object'
        ? {
            ocr: Math.max(0, Math.min(1, Number(candidate.signalScores.ocr || 0))),
            passcode: Math.max(0, Math.min(1, Number(candidate.signalScores.passcode || 0))),
            artwork: Math.max(0, Math.min(1, Number(candidate.signalScores.artwork || 0)))
          }
        : {},
      reasonCodes: Array.isArray(candidate.reasonCodes) ? candidate.reasonCodes.map(text).filter(Boolean) : []
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
      version: text(candidate.version),
      treatment: text(candidate.treatment),
      artwork: text(candidate.artwork),
      mappingStatus: ['exact', 'likely', 'unresolved'].includes(text(candidate.mappingStatus).toLowerCase())
        ? text(candidate.mappingStatus).toLowerCase() : 'unresolved',
      verified: Boolean(candidate.verified),
      source: text(candidate.source) || 'manual_search',
      signals: Array.isArray(candidate.signals) ? candidate.signals.map(text).filter(Boolean) : []
    };
  }

  function normalizeSetCodeSignal(signal, index = 0) {
    if (!signal || typeof signal !== 'object' || Array.isArray(signal)) return null;
    const setCode = text(signal.setCode).toUpperCase();
    const confidence = finite(signal.confidence);
    if (!setCode) return null;
    return {
      id: text(signal.id) || `set-code-signal-${index}`,
      setCode,
      confidence: confidence === null ? null : Math.max(0, Math.min(100, Math.round(confidence * 10) / 10)),
      rawText: text(signal.rawText),
      variant: text(signal.variant),
      source: text(signal.source) || 'set_code_region',
      validationMethod: text(signal.validationMethod)
    };
  }

  function normalizeReferenceCandidate(candidate, index = 0) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const mappingStatus = text(candidate.mappingStatus).toLowerCase();
    return {
      id: text(candidate.id) || `reference-candidate-${index}`,
      kind: text(candidate.kind) || 'reference_print',
      printId: text(candidate.printId),
      variantId: text(candidate.variantId),
      internalMetacardId: text(candidate.internalMetacardId),
      germanName: text(candidate.germanName),
      englishName: text(candidate.englishName),
      setName: text(candidate.setName),
      setCode: text(candidate.setCode).toUpperCase(),
      collectorNumber: text(candidate.collectorNumber),
      rarity: text(candidate.rarity),
      version: text(candidate.version),
      treatment: text(candidate.treatment),
      artwork: text(candidate.artwork),
      cardmarketProductId: cleanProductId(candidate.cardmarketProductId),
      cardmarketProductName: text(candidate.cardmarketProductName),
      productUrl: text(candidate.productUrl),
      mappingStatus: ['exact', 'likely', 'unresolved'].includes(mappingStatus) ? mappingStatus : 'unresolved',
      dataSource: text(candidate.dataSource),
      verifiedAt: text(candidate.verifiedAt),
      setCodeMatch: text(candidate.setCodeMatch),
      exactSetCodeMatch: Boolean(candidate.exactSetCodeMatch),
      verified: Boolean(candidate.verified && cleanProductId(candidate.cardmarketProductId))
    };
  }

  function normalizePrintRecognition(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const status = text(value.mappingStatus).toLowerCase();
    const rarityOptions = (Array.isArray(value.rarityOptions) ? value.rarityOptions : [])
      .map(option => typeof option === 'string' ? { value: text(option), count: 0 } : { value: text(option?.value), count: Math.max(0, Math.round(Number(option?.count || 0))) })
      .filter(option => option.value);
    return {
      setCode: text(value.setCode).toUpperCase(),
      setCodeConfidence: finite(value.setCodeConfidence) === null ? null : Math.max(0, Math.min(100, Math.round(Number(value.setCodeConfidence) * 10) / 10)),
      setCodeSignals: (Array.isArray(value.setCodeSignals) ? value.setCodeSignals : []).map(normalizeSetCodeSignal).filter(Boolean),
      setCodeValidationStatus: text(value.setCodeValidationStatus),
      setCodeValidationMethod: text(value.setCodeValidationMethod),
      setCodeValidationCandidates: (Array.isArray(value.setCodeValidationCandidates) ? value.setCodeValidationCandidates : []).map(text).filter(Boolean),
      mappingStatus: ['exact', 'likely', 'unresolved'].includes(status) ? status : 'unresolved',
      resolutionStatus: text(value.resolutionStatus) || 'unreadable_set_code',
      rarityOptions,
      selectedRarity: text(value.selectedRarity),
      suggestedRarity: text(value.suggestedRarity),
      unknownRarityValue: text(value.unknownRarityValue),
      selectedCandidateId: text(value.selectedCandidateId),
      selectedVersion: text(value.selectedVersion),
      suggestedCandidateId: text(value.suggestedCandidateId),
      referenceCandidates: (Array.isArray(value.referenceCandidates) ? value.referenceCandidates : []).map(normalizeReferenceCandidate).filter(Boolean),
      variantCandidates: (Array.isArray(value.variantCandidates) ? value.variantCandidates : []).map(normalizeReferenceCandidate).filter(Boolean),
      requiresRaritySelection: Boolean(value.requiresRaritySelection),
      requiresVersionSelection: Boolean(value.requiresVersionSelection),
      detailPhotoStatus: text(value.detailPhotoStatus),
      detailPhotoReason: text(value.detailPhotoReason),
      manualSelectionProtected: Boolean(value.manualSelectionProtected),
      updatedAt: text(value.updatedAt)
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
      sceneAnalysis: normalizeSceneAnalysis(photo?.sceneAnalysis),
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
    const observationSource = normalizeObservationSource(observation?.observationSource);
    const detectionScore = finite(observation?.detectionScore);
    return {
      ...observation,
      id: text(observation?.id) || `${analysisId || 'analysis'}:observation:${index}`,
      analysisId: text(analysisId || observation?.analysisId),
      photoId: text(observation?.photoId),
      boundingBox: normalizeBoundingBox(observation?.boundingBox),
      quadrilateral: observationSource === 'automatic' ? normalizeQuadrilateral(observation?.quadrilateral) : null,
      observationSource,
      detectionConfidence: observationSource === 'automatic' ? normalizeConfidence(observation?.detectionConfidence) : 'unknown',
      detectionScore: observationSource === 'automatic' && detectionScore !== null ? Math.max(0, Math.min(1, round6(detectionScore))) : null,
      detectionSignals: observationSource === 'automatic' ? normalizeDetectionSignals(observation?.detectionSignals) : {},
      detectionReviewState: normalizeDetectionReviewState(observation?.detectionReviewState, observationSource),
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
      nameRecognition: observation?.nameRecognition && typeof observation.nameRecognition === 'object'
        ? {
            ...observation.nameRecognition,
            passcodes: Array.isArray(observation.nameRecognition.passcodes) ? observation.nameRecognition.passcodes.map(text).filter(Boolean) : [],
            artworkFingerprints: Array.isArray(observation.nameRecognition.artworkFingerprints)
              ? observation.nameRecognition.artworkFingerprints.filter(row => row && typeof row === 'object').map(row => ({ ...row }))
              : [],
            conflicts: Array.isArray(observation.nameRecognition.conflicts) ? observation.nameRecognition.conflicts.map(text).filter(Boolean) : []
          }
        : undefined,
      printRecognition: normalizePrintRecognition(observation?.printRecognition),
      economicRelevant: Boolean(observation?.economicRelevant),
      detailPhotoRequired: Boolean(observation?.detailPhotoRequired),
      detailPhotoStatus: text(observation?.detailPhotoStatus),
      detailPhotoReason: text(observation?.detailPhotoReason),
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

  function boundingBoxIoU(left, right) {
    const a = normalizeBoundingBox(left?.boundingBox || left);
    const b = normalizeBoundingBox(right?.boundingBox || right);
    if (!a || !b) return 0;
    const x0 = Math.max(a.x, b.x);
    const y0 = Math.max(a.y, b.y);
    const x1 = Math.min(a.x + a.width, b.x + b.width);
    const y1 = Math.min(a.y + a.height, b.y + b.height);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const union = a.width * a.height + b.width * b.height - intersection;
    return union > 0 ? Math.max(0, Math.min(1, intersection / union)) : 0;
  }

  function mergeDetectionSuggestions(existingObservations = [], photoId = '', detections = [], options = {}) {
    const targetPhotoId = text(photoId);
    const coverageThreshold = Math.max(0.1, Math.min(0.95, Number(options.coverageThreshold || 0.50)));
    const now = text(options.now) || new Date().toISOString();
    const idFactory = typeof options.idFactory === 'function' ? options.idFactory : index => `${targetPhotoId}:automatic:${Date.now()}:${index}`;
    const existing = (Array.isArray(existingObservations) ? existingObservations : []).map(row => ({ ...row }));
    const added = [];
    let skipped = 0;
    (Array.isArray(detections) ? detections : []).forEach((detection, index) => {
      const boundingBox = normalizeBoundingBox(detection?.boundingBox);
      if (!boundingBox) { skipped += 1;return; }
      const covered = [...existing, ...added].some(row => text(row.photoId) === targetPhotoId && boundingBoxIoU(row.boundingBox, boundingBox) >= coverageThreshold);
      if (covered) { skipped += 1;return; }
      const score = finite(detection?.detectionScore);
      added.push(normalizeObservation({
        id: text(idFactory(index)),
        analysisId: text(options.analysisId),
        photoId: targetPhotoId,
        boundingBox,
        quadrilateral: normalizeQuadrilateral(detection?.quadrilateral),
        row: text(detection?.row),
        column: text(detection?.column),
        observationSource: 'automatic',
        detectionConfidence: normalizeConfidence(detection?.detectionConfidence),
        detectionScore: score === null ? null : score,
        detectionSignals: normalizeDetectionSignals(detection?.detectionSignals),
        detectionReviewState: 'suggested',
        selectedName: '',
        nameCandidates: [],
        nameConfidence: 'unknown',
        selectedProductId: '',
        printCandidates: [],
        printConfidence: 'unknown',
        recognitionSignals: [],
        economicRelevant: false,
        detailPhotoRequired: false,
        reviewStatus: 'unreviewed',
        physicalCardId: '',
        linkedCollectionItemId: '',
        createdAt: now,
        updatedAt: now
      }, text(options.analysisId), existing.length + index));
    });
    return { observations: [...existing, ...added], added, skipped, coverageThreshold };
  }

  function summarizePhotoEvidence(analysis = {}) {
    const normalized = normalizeAnalysisPhotoEvidence(analysis);
    const visibleObservations = normalized.photoObservations.filter(row => row.detectionReviewState !== 'rejected');
    const linkedPhysicalIds = new Set(visibleObservations.map(row => row.physicalCardId).filter(Boolean));
    const linkedItemIds = new Set(normalized.physicalCards.map(row => row.linkedCollectionItemId).filter(Boolean));
    return {
      photoCount: normalized.photos.length,
      observationCount: visibleObservations.length,
      automaticSuggestedCount: visibleObservations.filter(row => row.observationSource === 'automatic' && row.detectionReviewState === 'suggested').length,
      automaticConfirmedCount: visibleObservations.filter(row => row.observationSource === 'automatic' && row.detectionReviewState === 'confirmed').length,
      rejectedDetectionCount: normalized.photoObservations.filter(row => row.observationSource === 'automatic' && row.detectionReviewState === 'rejected').length,
      physicalCardCount: normalized.physicalCards.length,
      observedPhysicalCardCount: linkedPhysicalIds.size,
      economicallyLinkedPhysicalCardCount: normalized.physicalCards.filter(row => row.linkedCollectionItemId).length,
      economicallyLinkedItemCount: linkedItemIds.size,
      unlinkedObservationCount: visibleObservations.filter(row => !row.physicalCardId).length,
      detailPhotoRequiredCount: visibleObservations.filter(row => row.detailPhotoRequired).length
    };
  }

  function choosePreferredRecognitionSource(analysis = {}, targetObservation = {}) {
    const photos = Array.isArray(analysis?.photos) ? analysis.photos : [];
    const observations = Array.isArray(analysis?.photoObservations) ? analysis.photoObservations : [];
    const targetId = text(targetObservation?.id);
    const physicalCardId = text(targetObservation?.physicalCardId);
    const candidates = observations.filter(row => {
      if (row?.detectionReviewState === 'rejected') return false;
      if (text(row?.id) === targetId) return true;
      return Boolean(physicalCardId && text(row?.physicalCardId) === physicalCardId);
    }).map(observation => {
      const photo = photos.find(row => text(row?.id) === text(observation?.photoId));
      const box = normalizeBoundingBox(observation?.boundingBox);
      if (!photo || !box) return null;
      const pixelWidth = Math.max(0, Number(photo.width || 0) * box.width);
      const pixelHeight = Math.max(0, Number(photo.height || 0) * box.height);
      const explicitDetail = Boolean(photo.isDetailPhoto || ['detail', 'detail_photo'].includes(text(photo.photoType || photo.kind).toLowerCase()));
      const coverage = box.width * box.height;
      const score = Math.min(pixelWidth / 420, pixelHeight / 615) + Math.min(1, coverage * 2) + (explicitDetail ? 4 : 0);
      return { photo, observation, pixelWidth, pixelHeight, explicitDetail, score };
    }).filter(Boolean).sort((left, right) => right.score - left.score || Number(right.explicitDetail) - Number(left.explicitDetail));
    return candidates[0] || null;
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

  function mergeAutomaticPrintRecognition(observation = {}, incoming = {}) {
    if (!observation || typeof observation !== 'object') return observation;
    const previous = normalizePrintRecognition(observation.printRecognition) || {};
    const next = normalizePrintRecognition(incoming) || normalizePrintRecognition({});
    const protectedPrint = isPrintExplicitlyConfirmed(observation);
    const selectedRarity = protectedPrint ? previous.selectedRarity : (next.selectedRarity || previous.selectedRarity || '');
    const selectedCandidateId = protectedPrint ? previous.selectedCandidateId : (next.selectedCandidateId || previous.selectedCandidateId || '');
    const selectedVersion = protectedPrint ? previous.selectedVersion : (next.selectedVersion || previous.selectedVersion || '');
    observation.printRecognition = {
      ...next,
      selectedRarity,
      selectedCandidateId,
      selectedVersion,
      manualSelectionProtected: protectedPrint,
      updatedAt: text(incoming.updatedAt) || new Date().toISOString()
    };
    return observation;
  }

  return Object.freeze({
    CONFIDENCE_VALUES,
    REVIEW_VALUES,
    OBSERVATION_SOURCE_VALUES,
    DETECTION_REVIEW_VALUES,
    normalizeConfidence,
    normalizeReviewStatus,
    normalizeObservationSource,
    normalizeDetectionReviewState,
    normalizeDetectionSignals,
    normalizeBoundingBox,
    normalizeQuadrilateral,
    normalizeSceneAnalysis,
    normalizeNameCandidate,
    normalizePrintCandidate,
    normalizeSetCodeSignal,
    normalizeReferenceCandidate,
    normalizePrintRecognition,
    normalizePhoto,
    normalizeObservation,
    normalizePhysicalCard,
    normalizeAnalysisPhotoEvidence,
    boundingBoxIoU,
    mergeDetectionSuggestions,
    summarizePhotoEvidence,
    choosePreferredRecognitionSource,
    removePhotoEvidence,
    isPrintExplicitlyConfirmed,
    mergeAutomaticPrintRecognition
  });
});
