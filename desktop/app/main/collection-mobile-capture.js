const crypto = require('crypto');
const collectionPhotoModel = require('../shared/collection-photo-model');

const text = (value, max = 240) => String(value == null ? '' : value).trim().slice(0, max);
const productId = value => /^\d+$/.test(text(value, 40)) ? text(value, 40) : '';
const money = value => Math.round(Number(value) * 100) / 100;

function normalizeMobileCardInput(value = {}) {
  const condition = text(value.condition, 20).toUpperCase();
  const edition = text(value.edition, 20).toLowerCase();
  const quantity = Number(value.quantity);
  const rawTargetSell = value.targetSell;
  const targetSell = rawTargetSell === null || rawTargetSell === undefined || text(rawTargetSell) === '' ? null : Number(rawTargetSell);
  return {
    requestId: text(value.requestId, 100),
    setCode: text(value.setCode, 40).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9-]/g, ''),
    rarity: text(value.rarity, 120),
    candidateId: text(value.candidateId, 240),
    cardmarketProductId: productId(value.cardmarketProductId),
    manualProductId: productId(value.manualProductId),
    condition: ['NM', 'EX', 'GD', 'LP', 'PL', 'POOR', 'UNBEKANNT'].includes(condition) ? condition : '',
    edition: edition === '1st' ? '1st' : edition === 'unlimited' ? 'Unlimited' : edition === '' ? '' : null,
    quantity: Number.isInteger(quantity) ? quantity : NaN,
    targetSell: Number.isFinite(targetSell) ? money(targetSell) : targetSell
  };
}

function referenceCandidates(recognition = {}) {
  const rows = [...(Array.isArray(recognition.variantCandidates) ? recognition.variantCandidates : []), ...(Array.isArray(recognition.referenceCandidates) ? recognition.referenceCandidates : [])];
  const seen = new Set();
  return rows.filter(row => {
    const key = text(row?.id) || `${productId(row?.cardmarketProductId)}:${text(row?.setCode)}:${text(row?.rarity)}:${text(row?.version)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function safeReferenceCandidate(candidate = {}) {
  return Boolean(candidate.verified && productId(candidate.cardmarketProductId) && text(candidate.mappingStatus).toLowerCase() === 'exact');
}

function findManualVariant(searchResult = {}, requestedProductId = '') {
  const requested = productId(requestedProductId);
  if (!requested) return null;
  for (const card of Array.isArray(searchResult.cards) ? searchResult.cards : []) {
    const variant = (Array.isArray(card.variants) ? card.variants : []).find(row => productId(row.productId) === requested);
    if (variant) return { ...variant, metacardId: variant.metacardId || card.metacardId, germanName: variant.germanName || card.germanName, englishName: variant.englishName || card.englishName };
  }
  return null;
}

function invalidateEconomicReview(analysis) {
  if (!analysis.economicReview || typeof analysis.economicReview !== 'object') return;
  analysis.economicReview.status = 'draft';
  analysis.economicReview.allocation = null;
  analysis.economicReview.readyAt = '';
  analysis.economicReview.lastErrors = [];
}

function resolveMobileSetCodeScan({ ocr = {}, printReference } = {}) {
  if (!printReference || typeof printReference.validateOcrSetCodeReadings !== 'function' || typeof printReference.resolveCollectionRecognition !== 'function') {
    throw new Error('Die lokale Print-Referenz ist nicht verfügbar.');
  }
  const readings = Array.isArray(ocr.setCodeReadings) ? ocr.setCodeReadings : [];
  const validation = printReference.validateOcrSetCodeReadings(readings);
  const acceptedSetCode = validation.accepted ? text(validation.setCode, 40).toUpperCase() : '';
  const recognition = acceptedSetCode
    ? printReference.resolveCollectionRecognition({ setCode: acceptedSetCode, setCodeConfidence: validation.confidence })
    : null;
  return {
    ocr: {
      status: text(validation.status, 80) || 'setcode_unreadable',
      accepted: Boolean(validation.accepted),
      setCode: acceptedSetCode,
      confidence: validation.accepted && Number.isFinite(Number(validation.confidence)) ? Math.max(0, Math.min(100, Number(validation.confidence))) : null,
      method: text(validation.method, 120),
      candidates: (Array.isArray(validation.candidates) ? validation.candidates : []).map(value => text(value, 40).toUpperCase()).filter(Boolean),
      readings: readings.slice(0, 60).map(row => ({ text: text(row?.text, 120), confidence: Math.max(0, Math.min(100, Number(row?.confidence || 0))), variant: text(row?.variant, 120) })).filter(row => row.text)
    },
    recognition
  };
}

function addMobileCardToState(state = {}, options = {}) {
  const analysisId = text(options.analysisId, 100);
  const sessionId = text(options.sessionId, 100);
  const input = normalizeMobileCardInput(options.input);
  const now = text(options.now, 60) || new Date().toISOString();
  const analysis = (Array.isArray(state.collectionPurchaseAnalyses) ? state.collectionPurchaseAnalyses : []).find(row => text(row?.id, 100) === analysisId);
  if (!analysis) throw new Error('Der verbundene Sammlungsankauf ist nicht mehr vorhanden.');
  if (text(analysis.captureStatus || 'active').toLowerCase() !== 'active') throw new Error('Dieser Sammlungsankauf ist nicht mehr für die Erfassung geöffnet.');
  if (!input.requestId) throw new Error('Die Anfrage besitzt keine eindeutige Kennung.');
  if (!input.setCode && !input.manualProductId) throw new Error('Bitte einen Setcode eingeben oder eine Karte manuell auswählen.');
  if (!input.condition) throw new Error('Bitte einen gültigen Zustand auswählen.');
  if (input.edition === null) throw new Error('Bitte eine gültige Edition auswählen.');
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 999) throw new Error('Die Menge muss zwischen 1 und 999 liegen.');
  if (input.targetSell !== null && (!Number.isFinite(input.targetSell) || input.targetSell < 0 || input.targetSell > 1000000)) throw new Error('Der Ziel-/Verkaufspreis ist ungültig.');

  analysis.photoObservations = Array.isArray(analysis.photoObservations) ? analysis.photoObservations : [];
  analysis.photos = Array.isArray(analysis.photos) ? analysis.photos : [];
  const duplicate = analysis.photoObservations.find(row => text(row.mobileRequestId, 100) === input.requestId && text(row.sourceMobileSessionId, 100) === sessionId);
  if (duplicate) return { observation: duplicate, duplicate: true, analysisId, analysisTitle: text(analysis.title) };

  const recognition = options.recognition && typeof options.recognition === 'object' ? options.recognition : { mappingStatus: 'unresolved', resolutionStatus: 'no_reference_match', referenceCandidates: [], variantCandidates: [], rarityOptions: [] };
  const metacardIdentity = collectionPhotoModel.uniqueRecognitionMetacard(recognition);
  const candidates = referenceCandidates(recognition);
  const rarityOptions = [...new Set((Array.isArray(recognition.rarityOptions) ? recognition.rarityOptions : []).map(value => text(value?.value ?? value, 120)).filter(Boolean))];
  if (rarityOptions.length > 1 && !input.rarity && !input.manualProductId) throw new Error('Bitte zuerst die Rarität auswählen.');

  let candidate = candidates.find(row => input.candidateId && text(row.id, 240) === input.candidateId) || candidates.find(row => input.cardmarketProductId && productId(row.cardmarketProductId) === input.cardmarketProductId) || null;
  const verifiedCandidates = candidates.filter(safeReferenceCandidate);
  if (!candidate && verifiedCandidates.length === 1) candidate = verifiedCandidates[0];
  if ((recognition.requiresVersionSelection || verifiedCandidates.length > 1) && !candidate && !input.manualProductId) throw new Error('Bitte zuerst die verifizierte Version auswählen.');
  if (candidate && input.cardmarketProductId && productId(candidate.cardmarketProductId) !== input.cardmarketProductId) throw new Error('Die gewählte Print-Version ist nicht gültig.');

  const manualProduct = options.manualProduct || null;
  if (input.manualProductId && (!manualProduct || productId(manualProduct.productId) !== input.manualProductId)) throw new Error('Die manuell gewählte Cardmarket-Karte wurde nicht eindeutig gefunden.');
  const confirmedReference = candidate && safeReferenceCandidate(candidate) ? candidate : null;
  const confirmedProduct = manualProduct || confirmedReference || metacardIdentity || {};
  const selectedProductId = productId(manualProduct?.productId || confirmedReference?.cardmarketProductId);
  const selectedName = text(manualProduct?.germanName || manualProduct?.englishName || confirmedReference?.germanName || confirmedReference?.englishName || candidate?.germanName || candidate?.englishName || metacardIdentity?.name || 'Unbekannte Karte');
  const finalSetCode = text(manualProduct?.setCode || manualProduct?.collectorNumber || input.setCode, 40).toUpperCase();
  const finalRarity = text(manualProduct?.rarity || manualProduct?.variant || confirmedReference?.rarity || candidate?.rarity || input.rarity, 120);
  const selectedVersion = text(confirmedReference?.version || candidate?.version || manualProduct?.inferredVariant || manualProduct?.variant, 80);
  const mappingStatus = selectedProductId ? 'exact' : ['exact', 'likely', 'unresolved'].includes(text(recognition.mappingStatus).toLowerCase()) ? text(recognition.mappingStatus).toLowerCase() : 'unresolved';
  const id = text(options.observationId, 100) || crypto.randomUUID();
  const mobilePhotoId = `mobile-capture:${analysisId}`;
  if (!analysis.photos.some(row => text(row?.id, 140) === mobilePhotoId)) analysis.photos.push({ id: mobilePhotoId, analysisId, sequence: Math.max(1, analysis.photos.length + 1), binderPage: '', relativePath: '', originalFileName: 'Mobile Erfassung', mimeType: '', fileSize: 0, width: 0, height: 0, sha256: '', captureSource: 'mobile', createdAt: now });
  const printCandidate = selectedProductId ? {
    id: manualProduct ? `manual-mobile-${selectedProductId}` : text(confirmedReference.id) || `verified-mobile-${selectedProductId}`,
    productId: selectedProductId,
    cardmarketProductId: selectedProductId,
    metacardId: text(confirmedProduct.metacardId, 100),
    name: selectedName,
    germanName: text(confirmedProduct.germanName || selectedName),
    englishName: text(confirmedProduct.englishName),
    setName: text(confirmedProduct.setName || confirmedProduct.expansion),
    collectorNumber: finalSetCode,
    setCode: finalSetCode,
    rarity: finalRarity,
    version: selectedVersion,
    treatment: text(confirmedProduct.treatment, 80),
    verified: true,
    mappingStatus: 'exact',
    source: manualProduct ? 'mobile_manual_catalog_search' : text(confirmedReference.dataSource || confirmedReference.source || 'local_print_reference')
  } : null;
  const normalizedRecognition = {
    ...recognition,
    setCode: finalSetCode,
    selectedRarity: finalRarity,
    selectedVersion,
    selectedCandidateId: printCandidate?.id || text(candidate?.id),
    mappingStatus,
    resolutionStatus: selectedProductId ? (manualProduct ? 'manual_product_selected' : 'exact_candidate_selected') : text(recognition.resolutionStatus || 'unresolved_candidates'),
    manualSelectionProtected: Boolean(selectedProductId),
    updatedAt: now
  };
  const observation = {
    id, analysisId, photoId: mobilePhotoId, boundingBox: { x: 0, y: 0, width: 1, height: 1 }, observationSource: 'mobile', detectionConfidence: 'unknown', detectionScore: null,
    detectionSignals: {}, detectionReviewState: 'manual', row: '', column: '', selectedName,
    metacardId: text(confirmedProduct.metacardId || confirmedProduct.cardmarketMetacardId || confirmedProduct.internalMetacardId), internalMetacardId: text(confirmedProduct.internalMetacardId), cardmarketMetacardId: text(confirmedProduct.cardmarketMetacardId),
    germanName: text(confirmedProduct.germanName || candidate?.germanName), englishName: text(confirmedProduct.englishName || candidate?.englishName),
    nameCandidates: selectedName === 'Unbekannte Karte' ? [] : [{ id: `${id}:name`, name: selectedName, germanName: text(confirmedProduct.germanName || candidate?.germanName), englishName: text(confirmedProduct.englishName || candidate?.englishName), metacardId: text(confirmedProduct.metacardId || confirmedProduct.cardmarketMetacardId || confirmedProduct.internalMetacardId), internalMetacardId: text(confirmedProduct.internalMetacardId), source: manualProduct ? 'mobile_manual_catalog_search' : 'local_print_reference', confidence: selectedProductId ? 'confirmed' : 'unknown' }],
    nameConfidence: selectedProductId ? 'confirmed' : 'unknown', selectedProductId, printCandidates: printCandidate ? [printCandidate] : [], printConfidence: selectedProductId ? 'confirmed' : 'unknown',
    recognitionSignals: [`Mobile Erfassung · Setcode ${finalSetCode || 'unbekannt'}`, selectedProductId ? `Cardmarket-Produkt ${selectedProductId} ausdrücklich ausgewählt` : 'Ungeprüft - bitte selbst prüfen'],
    printRecognition: normalizedRecognition,
    manualCapture: { setCode: finalSetCode, setCodeConfirmed: Boolean(finalSetCode), condition: input.condition, edition: input.edition, quantity: input.quantity, targetSell: input.targetSell, completedAt: now, updatedAt: now },
    economicRelevant: false, detailPhotoRequired: false, reviewStatus: selectedProductId ? 'reviewed' : 'unreviewed', physicalCardId: '', linkedCollectionItemId: '',
    sourceMobileSessionId: sessionId, mobileRequestId: input.requestId, createdAt: now, updatedAt: now
  };
  collectionPhotoModel.applyRecognitionMetacardIdentity(observation, normalizedRecognition);
  invalidateEconomicReview(analysis);
  analysis.photoObservations.push(observation);
  analysis.updatedAt = now;
  return { observation, duplicate: false, analysisId, analysisTitle: text(analysis.title), count: analysis.photoObservations.filter(row => row.detectionReviewState !== 'rejected').length };
}

module.exports = { normalizeMobileCardInput, referenceCandidates, safeReferenceCandidate, findManualVariant, resolveMobileSetCodeScan, addMobileCardToState };
