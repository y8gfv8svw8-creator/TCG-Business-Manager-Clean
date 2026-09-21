(function (root, factory) {
  const automation = typeof module === 'object' && module.exports
    ? require('./business-automation')
    : root?.TcgBusinessAutomation;
  const api = factory(automation);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TcgPurchasePriceImport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (automation) {
  'use strict';

  if (!automation?.normalizeCollectorNumber || !automation?.normalizeCardLanguage
    || !automation?.collectorNumberLanguage || !automation?.planTargetSellChange) {
    throw new Error('Die bestehende Karten- und Ziel-VK-Logik konnte nicht geladen werden.');
  }

  const REQUIRED_SHEETS = Object.freeze(['LON', 'TLM', 'EEN', 'EOJ', 'POTD', 'STON']);
  const CONTROL_TOTAL = 345;
  const CONTROL_TOLERANCE = 0.05;

  const normalizeHeader = value => automation.normalizeField(value);
  const normalizeCollectorNumber = value => automation.normalizeCollectorNumber(value);
  const normalizeLanguage = value => automation.normalizeCardLanguage(value);
  const collectorNumberLanguage = value => automation.collectorNumberLanguage(value);
  const normalizeName = value => automation.normalizeField(String(value || '')
    .replace(/\s*\(\s*Ge(?:ä|ae)ndert\s+von\s*:[^)]*\)\s*$/i, '')
    .replace(/\(\s*V\.?\s*\d+[^)]*\)\s*$/i, ''));
  const round = (value, digits = 2) => {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  };

  function optionalNumber(value) {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    let normalized = String(value).trim().replace(/\s|€/g, '');
    if (normalized.includes(',') && normalized.includes('.')) {
      normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
        ? normalized.replace(/\./g, '').replace(',', '.')
        : normalized.replace(/,/g, '');
    } else if (normalized.includes(',')) {
      normalized = normalized.replace(',', '.');
    }
    if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function headerIndex(row, aliases) {
    const normalized = (row?.cells || []).map(normalizeHeader);
    for (const alias of aliases) {
      const index = normalized.indexOf(alias);
      if (index >= 0) return index;
    }
    return -1;
  }

  function extractSourceRows(parsedFiles = [], options = {}) {
    const requiredSheets = options.requiredSheets || REQUIRED_SHEETS;
    const allSheets = parsedFiles.flatMap(file => Array.isArray(file?.sheets) ? file.sheets : []);
    const selectedSheets = new Map();
    for (const sheet of allSheets) {
      const key = String(sheet?.name || '').trim().toUpperCase();
      if (!requiredSheets.includes(key)) continue;
      if (selectedSheets.has(key)) {
        selectedSheets.set(key, null);
      } else {
        selectedSheets.set(key, sheet);
      }
    }

    const errors = [];
    const skipped = [];
    const rows = [];
    const sheetTotals = [];
    for (const sheetName of requiredSheets) {
      const sheet = selectedSheets.get(sheetName);
      if (!sheet) {
        errors.push({ sheet: sheetName, rowNumber: null, collectorNumber: '', name: '', reason: selectedSheets.has(sheetName) ? 'Tabellenblatt mehrfach ausgewählt' : 'Tabellenblatt fehlt' });
        continue;
      }
      const headerPosition = (sheet.rows || []).findIndex(row => {
        const values = (row.cells || []).map(normalizeHeader);
        return values.includes('kartennummer') && values.includes('menge');
      });
      if (headerPosition < 0) {
        errors.push({ sheet: sheetName, rowNumber: null, collectorNumber: '', name: '', reason: 'Kopfzeile mit Kartennummer und Menge fehlt' });
        continue;
      }
      const header = sheet.rows[headerPosition];
      const columns = {
        collectorNumber: headerIndex(header, ['kartennummer', 'setnummer']),
        name: headerIndex(header, ['deutscherkartenname', 'kartenname']),
        quantity: headerIndex(header, ['menge', 'anzahl']),
        status: headerIndex(header, ['status']),
        allocatedCost: headerIndex(header, ['anteiligerekgesamt', 'anteiligerek', 'gesamtek']),
        expectedSell: headerIndex(header, ['erwartetervkjekarte'])
      };
      const missingColumns = [];
      if (columns.collectorNumber < 0) missingColumns.push('Kartennummer');
      if (columns.name < 0) missingColumns.push('Kartenname');
      if (columns.quantity < 0) missingColumns.push('Menge');
      if (columns.allocatedCost < 0) missingColumns.push('Anteiliger EK gesamt');
      if (columns.expectedSell < 0) missingColumns.push('Erwarteter VK je Karte');
      if (missingColumns.length) {
        errors.push({ sheet: sheetName, rowNumber: header.rowNumber, collectorNumber: '', name: '', reason: `Spalte fehlt: ${missingColumns.join(', ')}` });
        continue;
      }

      let sheetTotal = 0;
      let sheetCount = 0;
      for (const source of sheet.rows.slice(headerPosition + 1)) {
        const cells = source.cells || [];
        const collectorNumber = String(cells[columns.collectorNumber] ?? '').trim();
        const name = String(cells[columns.name] ?? '').trim();
        const rawQuantity = cells[columns.quantity];
        if (!collectorNumber && !name && String(rawQuantity ?? '').trim() === '') continue;
        const quantityNumber = optionalNumber(rawQuantity);
        if (quantityNumber === 0 || String(rawQuantity ?? '').trim() === '') {
          skipped.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Menge ist leer oder 0' });
          continue;
        }
        const quantity = quantityNumber === null ? null : Math.round(quantityNumber);
        const allocatedCost = optionalNumber(cells[columns.allocatedCost]);
        const expectedSell = optionalNumber(cells[columns.expectedSell]);
        if (!collectorNumber) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Kartennummer fehlt' });
          continue;
        }
        if (!name) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Kartenname fehlt' });
          continue;
        }
        if (quantity === null || quantity < 1 || quantity !== quantityNumber) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Menge ist ungültig' });
          continue;
        }
        if (allocatedCost !== null && allocatedCost < 0) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Anteiliger EK ist ungültig' });
          continue;
        }
        if (expectedSell !== null && expectedSell < 0) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'Erwarteter VK ist ungültig' });
          continue;
        }
        if (allocatedCost === null && expectedSell === null) {
          errors.push({ sheet: sheetName, rowNumber: source.rowNumber, collectorNumber, name, reason: 'EK und erwarteter VK sind beide leer' });
          continue;
        }
        if (allocatedCost !== null) sheetTotal += allocatedCost;
        sheetCount += quantity;
        rows.push({
          sheet: sheetName,
          rowNumber: source.rowNumber,
          collectorNumber,
          normalizedCollectorNumber: normalizeCollectorNumber(collectorNumber),
          name,
          normalizedName: normalizeName(name),
          quantity,
          status: String(cells[columns.status] ?? '').trim(),
          allocatedCost,
          expectedSell: expectedSell === null ? null : round(expectedSell, 2)
        });
      }
      sheetTotals.push({ sheet: sheetName, quantity: sheetCount, allocatedCost: round(sheetTotal, 8) });
    }
    return { rows, errors, skipped, sheetTotals, foundSheets: [...selectedSheets.keys()] };
  }

  function groupSourceRows(rows = []) {
    const groups = new Map();
    for (const row of rows) {
      if (!row.normalizedCollectorNumber) continue;
      if (!groups.has(row.normalizedCollectorNumber)) groups.set(row.normalizedCollectorNumber, []);
      groups.get(row.normalizedCollectorNumber).push(row);
    }
    return [...groups.entries()].map(([key, sourceRows]) => {
      const quantity = sourceRows.reduce((sum, row) => sum + row.quantity, 0);
      const names = [...new Set(sourceRows.map(row => row.normalizedName).filter(Boolean))];
      const costPresence = sourceRows.map(row => row.allocatedCost !== null);
      const expectedValues = [...new Set(sourceRows.map(row => row.expectedSell).filter(value => value !== null))];
      const statuses = [...new Set(sourceRows.map(row => normalizeHeader(row.status)).filter(Boolean))];
      const languages = [...new Set(sourceRows.map(row => collectorNumberLanguage(row.collectorNumber)).filter(Boolean))];
      const mixedCostPresence = costPresence.some(Boolean) && !costPresence.every(Boolean);
      const conflict = names.length !== 1 || mixedCostPresence || expectedValues.length > 1
        || statuses.length > 1 || languages.length > 1;
      const allocatedCost = costPresence.every(Boolean)
        ? sourceRows.reduce((sum, row) => sum + row.allocatedCost, 0)
        : null;
      return {
        key,
        collectorNumber: sourceRows[0].collectorNumber,
        name: sourceRows[0].name,
        normalizedName: sourceRows[0].normalizedName,
        status: sourceRows[0].status,
        normalizedStatus: statuses[0] || '',
        ownership: statuses.some(status => status.includes('privat')) ? 'private' : 'business',
        language: languages[0] || '',
        quantity,
        allocatedCost: allocatedCost === null ? null : round(allocatedCost, 8),
        newCostPerItem: allocatedCost === null ? null : round(allocatedCost / quantity, 8),
        expectedSell: expectedValues.length ? expectedValues[0] : null,
        sourceRows,
        conflict,
        conflictReason: names.length !== 1 ? 'Mehrere Kartennamen zur gleichen Nummer'
          : mixedCostPresence ? 'EK ist nur in einem Teil der gleichen Kartennummer befüllt'
            : expectedValues.length > 1 ? 'Mehrere erwartete VKs zur gleichen Kartennummer'
              : statuses.length > 1 ? 'Mehrere unterschiedliche Status zur gleichen Kartennummer'
                : languages.length > 1 ? 'Mehrere Kartensprachen zur gleichen Kartennummer' : ''
      };
    });
  }

  function candidateNames(item = {}) {
    return [...new Set([item.name, item.germanName, item.englishName, item.officialName]
      .map(normalizeName).filter(Boolean))];
  }

  function summarizeExisting(items = [], property) {
    const values = items.map(item => {
      const value = property === 'cost'
        ? (['known', 'confirmed_zero'].includes(item.costStatus) ? Number(item.cost || 0) : null)
        : optionalNumber(item.targetSell ?? item.originalTargetSell);
      return value === null || !Number.isFinite(value) ? null : round(value, property === 'cost' ? 8 : 2);
    });
    return { values, distinct: [...new Set(values.map(value => value === null ? 'unknown' : String(value)))] };
  }

  function cohortKey(item = {}) {
    const lotId = String(item.lotId || '').trim();
    if (lotId) return `lot:${lotId}`;
    const importKey = String(item.importKey || '').trim();
    return importKey ? `import:${importKey}` : '';
  }

  function belongsToSheet(item = {}, sheetName = '') {
    const wanted = String(sheetName || '').trim().toUpperCase();
    if (!wanted) return false;
    return [item.setCode, item.set, item.collectorNumber].some(value => {
      const clean = String(value || '').trim().toUpperCase();
      return clean === wanted || clean.startsWith(`${wanted}-`);
    });
  }

  function matchingNames(item = {}, group = {}) {
    return candidateNames(item).includes(group.normalizedName);
  }

  function candidateLanguage(item = {}) {
    return normalizeLanguage(item.language)
      || collectorNumberLanguage(item.collectorNumber || item.setCode);
  }

  function matchingLanguage(item = {}, group = {}) {
    return !group.language || candidateLanguage(item) === group.language;
  }

  function candidatesInsideCohort(group, items = []) {
    const numbered = items.filter(item => {
      const number = normalizeCollectorNumber(item.collectorNumber || item.setCode);
      return number && number === group.key;
    });
    const numberedAndNamed = numbered.filter(item => matchingNames(item, group));
    const numberedAndNamedInLanguage = numberedAndNamed.filter(item => matchingLanguage(item, group));
    if (numberedAndNamedInLanguage.length === group.quantity) {
      return { candidates: numberedAndNamedInLanguage, matchBasis: group.language
        ? 'Kartennummer + Sprache + Kartenname'
        : 'Kartennummer + Kartenname' };
    }
    const named = items.filter(item => belongsToSheet(item, group.sourceRows[0]?.sheet) && matchingNames(item, group));
    const namedInLanguage = named.filter(item => matchingLanguage(item, group));
    if (namedInLanguage.length === group.quantity) {
      return { candidates: namedInLanguage, matchBasis: group.language
        ? 'Einkaufslos + Set + Sprache + exakter Kartenname'
        : 'Einkaufslos + Set + exakter Kartenname' };
    }
    const candidates = namedInLanguage.length ? namedInLanguage : numberedAndNamedInLanguage;
    return {
      candidates,
      matchBasis: '',
      languageRejectedCount: Math.max(named.length - namedInLanguage.length, numberedAndNamed.length - numberedAndNamedInLanguage.length),
      namedCount: namedInLanguage.length,
      numberedCount: numberedAndNamedInLanguage.length
    };
  }

  function detectDominantCohort(sourceGroups = [], inventory = []) {
    const businessGroups = sourceGroups.filter(group => !group.conflict && group.ownership === 'business');
    if (businessGroups.length < 3) return null;
    const cohorts = new Map();
    for (const item of inventory) {
      const key = cohortKey(item);
      if (!key) continue;
      if (!cohorts.has(key)) cohorts.set(key, []);
      cohorts.get(key).push(item);
    }
    const ranked = [...cohorts.entries()].map(([key, items]) => {
      const score = businessGroups.reduce((count, group) => {
        const result = candidatesInsideCohort(group, items);
        return count + (result.candidates.length === group.quantity && Boolean(result.matchBasis) ? 1 : 0);
      }, 0);
      const dates = [...new Set(items.map(item => String(item.purchaseDate || '').trim()).filter(Boolean))];
      return { key, items, score, total: businessGroups.length, date: dates.length === 1 ? dates[0] : '' };
    }).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const secondScore = ranked[1]?.score || 0;
    const requiredScore = Math.max(3, Math.ceil(businessGroups.length * 0.8));
    const requiredLead = Math.max(2, Math.ceil(businessGroups.length * 0.1));
    if (!best || best.score < requiredScore || best.score - secondScore < requiredLead) return null;
    return best;
  }

  function buildPreview(parsedFiles = [], inventory = [], options = {}) {
    const extracted = extractSourceRows(parsedFiles, options);
    const sourceGroups = groupSourceRows(extracted.rows);
    const byCollectorNumber = new Map();
    for (const item of inventory || []) {
      if (item?.archived || String(item?.status || '') === 'Storniert') continue;
      const key = normalizeCollectorNumber(item.collectorNumber || item.setCode);
      if (!key) continue;
      if (!byCollectorNumber.has(key)) byCollectorNumber.set(key, []);
      byCollectorNumber.get(key).push(item);
    }
    const dominantCohort = detectDominantCohort(sourceGroups, inventory || []);

    const matched = [];
    const missing = [];
    const ambiguous = [];
    for (const group of sourceGroups) {
      if (group.conflict) {
        const candidates = byCollectorNumber.get(group.key) || [];
        ambiguous.push({ ...group, foundQuantity: candidates.length, reason: group.conflictReason });
        continue;
      }
      if (group.ownership === 'private') {
        missing.push({ ...group, foundQuantity: 0, reason: 'Als Privatentnahme markiert; der Geschäftsbestand wird dafür nicht verändert' });
        continue;
      }
      let candidates;
      let matchBasis = '';
      if (dominantCohort) {
        const cohortMatch = candidatesInsideCohort(group, dominantCohort.items);
        candidates = cohortMatch.candidates;
        matchBasis = cohortMatch.matchBasis;
      } else {
        const numbered = byCollectorNumber.get(group.key) || [];
        candidates = numbered.filter(item => matchingLanguage(item, group));
        matchBasis = candidates.length ? (group.language
          ? 'Kartennummer + Sprache + Kartenname'
          : 'Kartennummer + Kartenname') : '';
        if (!candidates.length && numbered.length && group.language) {
          ambiguous.push({
            ...group,
            foundQuantity: numbered.length,
            reason: `Kartennummer gefunden, aber nicht eindeutig in der Sprache ${group.language}`
          });
          continue;
        }
      }
      if (!candidates.length) {
        missing.push({ ...group, foundQuantity: 0, reason: dominantCohort
          ? 'Nicht eindeutig im erkannten Einkaufslos gefunden'
          : 'Kartennummer nicht im Geschäftsbestand gefunden' });
        continue;
      }
      const nameMatches = candidates.filter(item => candidateNames(item).includes(group.normalizedName));
      if (nameMatches.length !== candidates.length) {
        ambiguous.push({ ...group, foundQuantity: candidates.length, reason: 'Kartenname stimmt nicht bei allen Treffern überein' });
        continue;
      }
      if (candidates.length !== group.quantity) {
        ambiguous.push({ ...group, foundQuantity: candidates.length, reason: `${group.quantity} Tabellenexemplar${group.quantity === 1 ? '' : 'e'}, aber ${candidates.length} Manager-Exemplar${candidates.length === 1 ? '' : 'e'} gefunden` });
        continue;
      }
      const oldCost = summarizeExisting(candidates, 'cost');
      const oldExpectedSell = summarizeExisting(candidates, 'targetSell');
      matched.push({
        ...group,
        matchBasis,
        foundQuantity: candidates.length,
        assetIds: candidates.map(item => item.id),
        assetSnapshot: candidates.map(item => ({ id: item.id, cost: item.cost, costStatus: item.costStatus, targetSell: item.targetSell, originalTargetSell: item.originalTargetSell })),
        oldCost,
        oldExpectedSell
      });
    }

    const controlTotal = Number(options.controlTotal ?? CONTROL_TOTAL);
    const sourceAllocatedCost = round(extracted.rows.reduce((sum, row) => sum + (row.allocatedCost ?? 0), 0), 2);
    const controlDifference = round(sourceAllocatedCost - controlTotal, 2);
    const controlWithinTolerance = Math.abs(controlDifference) <= Number(options.controlTolerance ?? CONTROL_TOLERANCE) + 1e-9;
    const missingRequiredSheets = (options.requiredSheets || REQUIRED_SHEETS).filter(name => !extracted.foundSheets.includes(name));
    const duplicateRequiredSheets = extracted.errors.some(row => row.reason === 'Tabellenblatt mehrfach ausgewählt');
    const sumImportedEk = round(matched.reduce((sum, row) => sum + (row.allocatedCost ?? 0), 0), 2);
    return {
      matched,
      missing,
      ambiguous,
      errors: extracted.errors,
      skipped: extracted.skipped,
      sheetTotals: extracted.sheetTotals,
      sourceRows: extracted.rows,
      sourceAllocatedCost,
      controlTotal,
      controlDifference,
      controlWithinTolerance,
      sumImportedEk,
      sourceQuantity: extracted.rows.reduce((sum, row) => sum + row.quantity, 0),
      matchedQuantity: matched.reduce((sum, row) => sum + row.foundQuantity, 0),
      detectedCohort: dominantCohort ? {
        date: dominantCohort.date,
        matchedGroups: dominantCohort.score,
        businessGroups: dominantCohort.total
      } : null,
      missingRequiredSheets,
      canApply: matched.length > 0 && !missingRequiredSheets.length && !duplicateRequiredSheets && controlWithinTolerance
    };
  }

  function snapshotsStillMatch(match, itemsById) {
    return match.assetSnapshot.every(snapshot => {
      const item = itemsById.get(snapshot.id);
      return item
        && item.cost === snapshot.cost
        && item.costStatus === snapshot.costStatus
        && item.targetSell === snapshot.targetSell
        && item.originalTargetSell === snapshot.originalTargetSell;
    });
  }

  function applyPreview(preview, inventory = [], options = {}) {
    if (!preview?.canApply) throw new Error('Diese Vorschau ist nicht zur Übernahme freigegeben.');
    const changedAt = options.changedAt || new Date().toISOString();
    const makeId = options.makeId || (() => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `import-${Date.now()}-${Math.random().toString(16).slice(2)}`));
    const items = inventory.map(item => ({ ...item, listingHistory: Array.isArray(item.listingHistory) ? item.listingHistory.map(entry => ({ ...entry })) : [] }));
    const itemsById = new Map(items.map(item => [item.id, item]));
    for (const match of preview.matched) {
      if (!snapshotsStillMatch(match, itemsById)) throw new Error(`Die Bestandsdaten zu ${match.collectorNumber} haben sich seit der Vorschau geändert.`);
    }

    let costUpdates = 0;
    let targetSellUpdates = 0;
    let importedCost = 0;
    for (const match of preview.matched) {
      if (match.newCostPerItem !== null) importedCost += match.allocatedCost;
      for (const assetId of match.assetIds) {
        const item = itemsById.get(assetId);
        if (match.newCostPerItem !== null) {
          item.cost = match.newCostPerItem;
          item.costStatus = match.newCostPerItem === 0 ? 'confirmed_zero' : 'known';
          costUpdates += 1;
        }
        if (match.expectedSell !== null) {
          const change = automation.planTargetSellChange(item, match.expectedSell, changedAt, 'spreadsheet_import');
          if (change.changed) {
            item.originalTargetSell = change.originalTargetSell;
            item.targetSell = change.targetSell;
            item.listingHistory.push({ ...change.historyEntry, id: makeId(), reason: 'Erwarteter VK aus geprüfter Ankaufstabelle' });
            targetSellUpdates += 1;
          }
        }
      }
    }
    return {
      inventory: items,
      summary: {
        matched: preview.matched.length,
        matchedQuantity: preview.matchedQuantity,
        skipped: preview.missing.length + preview.ambiguous.length + preview.skipped.length,
        errors: preview.errors.length,
        costUpdates,
        targetSellUpdates,
        importedCost: round(importedCost, 2)
      }
    };
  }

  return {
    REQUIRED_SHEETS,
    CONTROL_TOTAL,
    CONTROL_TOLERANCE,
    optionalNumber,
    extractSourceRows,
    groupSourceRows,
    buildPreview,
    applyPreview
  };
});
