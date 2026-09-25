(function initializeScannerRecognition(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgScannerRecognition = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScannerRecognition() {
  "use strict";

  const LANGUAGE_MARKERS = new Set(["EN", "DE", "FR", "IT", "ES", "SP", "PT", "PL", "NL"]);
  const LEGACY_LANGUAGE_MARKERS = new Set(["E", "G", "F", "I", "P", "S"]);
  const IGNORED_LINE_PARTS = ["ATK/", "DEF/", "ATK ", "DEF "];

  function compact(value = "") {
    return String(value ?? "")
      .replace(/ß/g, "ss")
      .replace(/ẞ/g, "SS")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  function comparableCompacts(value = "") {
    const base = compact(value);
    if (!base) return [];
    return [...new Set([
      base,
      base.replace(/(?:1V|IV)(?=\d)/g, "LV"),
      base.replace(/SS/g, "B")
    ])];
  }

  function cleanLine(value = "") {
    return String(value ?? "")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[|¦]/g, "I")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeSetCode(value = "") {
    const text = cleanLine(value).toUpperCase().replace(/\s+/g, "");
    const match = text.match(/^([A-Z0-9]{2,12})-?([A-Z]{1,2})?([0-9OIL]{2,4}[A-Z]?)$/);
    if (!match) return "";
    const language = LANGUAGE_MARKERS.has(match[2]) || LEGACY_LANGUAGE_MARKERS.has(match[2]) ? match[2] : "";
    if (match[2] && !language) return "";
    const number = match[3].replace(/O/g, "0").replace(/[IL]/g, "1");
    return `${match[1]}-${language}${number}`;
  }

  function setCodeAliases(value = "") {
    const normalized = normalizeSetCode(value);
    if (!normalized) return [];
    const [prefix, suffix] = normalized.split("-");
    const aliases = [normalized];
    const split = prefix.match(/^([A-Z]+)([0-9]+)$/);
    if (split) {
      const letters = split[1];
      const digits = split[2];
      const lastLetter = letters.slice(-1);
      if ((lastLetter === "O" && digits.startsWith("0")) || (["I", "L"].includes(lastLetter) && digits.startsWith("1"))) {
        aliases.push(`${letters.slice(0, -1)}${digits}-${suffix}`);
      }
    }
    return aliases.filter((alias, index, rows) => rows.indexOf(alias) === index);
  }

  function extractSetCodes(text = "") {
    const upper = String(text ?? "").toUpperCase().replace(/[\u2010-\u2015\u2212]/g, "-");
    const candidates = [];
    const patterns = [
      /\b[A-Z0-9]{2,12}\s*-\s*(?:EN|DE|FR|IT|ES|SP|PT|PL|NL)\s*[0-9OIL]{2,4}[A-Z]?\b/g,
      /\b[A-Z0-9]{2,12}\s*-\s*(?:E|G|F|I|P|S)\s*[0-9OIL]{2,4}[A-Z]?\b/g,
      /\b[A-Z0-9]{2,12}\s*-\s*[0-9OIL]{2,4}[A-Z]?\b/g
    ];
    for (const pattern of patterns) {
      for (const match of upper.matchAll(pattern)) {
        const normalized = normalizeSetCode(match[0]);
        for (const alias of setCodeAliases(normalized)) if (!candidates.includes(alias)) candidates.push(alias);
      }
    }
    return candidates;
  }

  function lineScore(line, index) {
    const upper = line.toUpperCase();
    if (IGNORED_LINE_PARTS.some(part => upper.includes(part))) return -100;
    if (/^(?:1ST|FIRST|LIMITED) EDITION$|^(?:SPELL CARD|TRAP CARD|MONSTER|KONAMI|CARD SCANNER)$/.test(upper)) return -100;
    if (extractSetCodes(line).length) return -100;
    const letters = line.match(/[A-Za-zÀ-ÖØ-öø-ÿÄÖÜäöüß]/g) || [];
    if (letters.length < 4) return -100;
    const digits = line.match(/[0-9]/g) || [];
    if (digits.length > letters.length) return -100;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length > 10 || line.length > 72) return -100;
    const uppercaseLetters = letters.filter(char => char === char.toUpperCase()).length;
    const uppercaseRatio = uppercaseLetters / letters.length;
    return Math.max(0, 14 - index) + Math.min(18, letters.length / 2) + uppercaseRatio * 8 - Math.max(0, words.length - 6) * 2;
  }

  function extractTitleCandidates(text = "") {
    return String(text ?? "")
      .split(/\r?\n/)
      .map(cleanLine)
      .filter(Boolean)
      .map((line, index) => ({ line, score: lineScore(line, index) }))
      .filter(row => row.score > 0)
      .sort((left, right) => right.score - left.score)
      .map(row => row.line)
      .filter((line, index, rows) => rows.findIndex(other => compact(other) === compact(line)) === index)
      .slice(0, 8);
  }

  function titleQueryAliases(value = "") {
    const original = cleanLine(value);
    if (!original) return [];
    const words = original.split(/\s+/).filter(Boolean);
    const aliases = [original];
    for (let remove = 1; remove <= Math.min(2, words.length - 1); remove += 1) {
      if (words.slice(0, remove).every(word => compact(word).length <= 3)) {
        const remaining = words.slice(remove).join(" ");
        if (compact(remaining).length >= 6) aliases.push(remaining);
      }
    }
    for (let remove = 1; remove <= Math.min(2, words.length - 1); remove += 1) {
      if (words.slice(words.length - remove).every(word => compact(word).length <= 2)) {
        const remaining = words.slice(0, words.length - remove).join(" ");
        if (compact(remaining).length >= 6) aliases.push(remaining);
      }
    }
    let first = 0;
    let last = words.length;
    while (first < Math.min(2, words.length - 1) && compact(words[first]).length <= 3) first += 1;
    while (last > Math.max(first + 1, words.length - 2) && compact(words[last - 1]).length <= 2) last -= 1;
    const trimmed = words.slice(first, last).join(" ");
    if ((first > 0 || last < words.length) && compact(trimmed).length >= 6) aliases.push(trimmed);
    const withoutSingleLetters = words.filter(word => compact(word).length > 1).join(" ");
    if (compact(withoutSingleLetters).length >= 6) aliases.push(withoutSingleLetters);
    return aliases.filter((alias, index, rows) => rows.findIndex(other => compact(other) === compact(alias)) === index);
  }

  function extractPasscodes(text = "") {
    const upper = String(text ?? "").toUpperCase();
    const matches = [];
    for (const match of upper.matchAll(/(?:^|[^A-Z0-9])([0-9OIL]{8})(?![A-Z0-9])/g)) {
      const value = match[1].replace(/O/g, "0").replace(/[IL]/g, "1");
      if (/^\d{8}$/.test(value) && !matches.includes(value)) matches.push(value);
    }
    return matches;
  }

  function extractEdition(text = "") {
    const value = cleanLine(text).toUpperCase();
    if (/\b(?:1ST|1|FIRST)\s*EDITION\b/.test(value)) return "1st Edition";
    if (/\bLIMITED\s*EDITION\b/.test(value)) return "Limited Edition";
    if (/\bUNLIMITED(?:\s*EDITION)?\b/.test(value)) return "Unlimited";
    return "";
  }

  function levenshteinDistance(left = "", right = "") {
    const a = compact(left);
    const b = compact(right);
    if (!a) return b.length;
    if (!b) return a.length;
    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let row = 1; row <= a.length; row += 1) {
      const current = [row];
      for (let column = 1; column <= b.length; column += 1) {
        current[column] = Math.min(
          current[column - 1] + 1,
          previous[column] + 1,
          previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1)
        );
      }
      previous.splice(0, previous.length, ...current);
    }
    return previous[b.length];
  }

  function titleSimilarity(left = "", right = "") {
    const leftValues = comparableCompacts(left);
    const rightValues = comparableCompacts(right);
    if (!leftValues.length || !rightValues.length) return 0;
    let characterScore = 0;
    for (const a of leftValues) for (const b of rightValues) {
      if (a === b) return 1;
      const shorter = a.length <= b.length ? a : b;
      const longer = a.length > b.length ? a : b;
      const substringScore = longer.includes(shorter) && shorter.length >= 5
        ? 0.78 + 0.2 * (shorter.length / longer.length)
        : 0;
      const editScore = 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
      characterScore = Math.max(characterScore, substringScore, editScore);
    }
    const wordsA = cleanLine(left).toUpperCase().split(/[^A-Z0-9]+/).filter(word => word.length > 1);
    const wordsB = cleanLine(right).toUpperCase().split(/[^A-Z0-9]+/).filter(word => word.length > 1);
    const ordered = Array.from({ length: wordsA.length + 1 }, () => new Array(wordsB.length + 1).fill(0));
    for (let row = 1; row <= wordsA.length; row += 1) for (let column = 1; column <= wordsB.length; column += 1) {
      const leftWord = wordsA[row - 1];
      const rightWord = wordsB[column - 1];
      const matches = leftWord === rightWord || (Math.min(leftWord.length, rightWord.length) >= 5 && (leftWord.includes(rightWord) || rightWord.includes(leftWord)));
      ordered[row][column] = matches ? ordered[row - 1][column - 1] + 1 : Math.max(ordered[row - 1][column], ordered[row][column - 1]);
    }
    const shared = ordered[wordsA.length]?.[wordsB.length] || 0;
    const wordScore = shared ? shared / Math.max(wordsA.length, wordsB.length) : 0;
    return Math.max(characterScore, wordScore * 0.92);
  }

  function trigrams(value = "") {
    const normalized = `  ${compact(value)}  `;
    if (normalized.trim().length < 3) return new Set(normalized.trim() ? [normalized.trim()] : []);
    const result = new Set();
    for (let index = 0; index <= normalized.length - 3; index += 1) result.add(normalized.slice(index, index + 3));
    return result;
  }

  function trigramSimilarity(left = "", right = "") {
    const a = trigrams(left);
    const b = trigrams(right);
    if (!a.size || !b.size) return 0;
    let shared = 0;
    for (const value of a) if (b.has(value)) shared += 1;
    return (2 * shared) / (a.size + b.size);
  }

  function nameTokens(value = "") {
    return cleanLine(value).split(/[^A-Za-z0-9À-ÖØ-öø-ÿÄÖÜäöüß]+/)
      .map(token => compact(token))
      .filter(token => token.length >= 3);
  }

  function tokenSimilarity(left = "", right = "") {
    const leftValues = comparableCompacts(left);
    const rightValues = comparableCompacts(right);
    let score = 0;
    for (const a of leftValues) for (const b of rightValues) {
      if (a === b) return 1;
      const shorter = a.length <= b.length ? a : b;
      const longer = a.length > b.length ? a : b;
      if (shorter.length >= 5 && longer.includes(shorter)) score = Math.max(score, 0.78 + 0.2 * (shorter.length / longer.length));
      score = Math.max(score, 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length));
    }
    return score;
  }

  function tokenEvidence(readings = [], candidateName = "") {
    const candidateTokens = nameTokens(candidateName);
    const ocrTokens = readings.flatMap(reading => nameTokens(reading.text).map(token => ({
      token,
      reading,
      confidence: reading.confidence
    })));
    if (!candidateTokens.length || !ocrTokens.length) return { score: 0, matchedCount: 0, totalCount: candidateTokens.length };
    const possible = [];
    candidateTokens.forEach((candidateToken, candidateIndex) => {
      ocrTokens.forEach((ocrToken, ocrIndex) => {
        const similarity = tokenSimilarity(candidateToken, ocrToken.token);
        if (similarity >= 0.68) possible.push({ candidateIndex, ocrIndex, candidateToken, ocrToken, similarity });
      });
    });
    possible.sort((left, right) => right.similarity - left.similarity);
    const usedCandidate = new Set();
    const usedOcr = new Set();
    const matches = [];
    for (const match of possible) {
      if (usedCandidate.has(match.candidateIndex) || usedOcr.has(match.ocrIndex)) continue;
      usedCandidate.add(match.candidateIndex);
      usedOcr.add(match.ocrIndex);
      matches.push(match);
    }
    if (!matches.length) return { score: 0, matchedCount: 0, totalCount: candidateTokens.length };
    const average = matches.reduce((sum, match) => sum + match.similarity, 0) / matches.length;
    const coverage = matches.length / candidateTokens.length;
    const strongest = matches[0];
    let score = 0;
    if (matches.length >= 2) {
      const orderedMatches = matches.slice().sort((left, right) => left.candidateIndex - right.candidateIndex);
      const orderConsistent = orderedMatches.every((match, index) => index === 0 || match.ocrIndex > orderedMatches[index - 1].ocrIndex);
      const matchedReadings = new Set(matches.map(match => match.ocrToken.reading));
      const singleHorizontalReading = matchedReadings.size === 1 && matches.every(match => !/[\r\n]/.test(match.ocrToken.reading.text));
      score = average * (0.72 + coverage * 0.28) * (orderConsistent || !singleHorizontalReading ? 1 : 0.62);
    }
    else if (strongest.candidateToken.length >= 10 && strongest.similarity >= 0.78) {
      score = strongest.similarity * (0.79 + Math.min(0.08, strongest.candidateToken.length / 250));
    }
    return {
      score: Math.max(0, Math.min(1, score)),
      matchedCount: matches.length,
      totalCount: candidateTokens.length,
      coverage,
      reading: strongest.ocrToken.reading,
      matchedTokens: matches.map(match => match.ocrToken.token)
    };
  }

  function normalizeOcrReadings(readings = []) {
    const result = [];
    const seen = new Set();
    for (const row of Array.isArray(readings) ? readings : []) {
      const sourceText = typeof row === "string" ? row : row?.text;
      const confidence = Math.max(0, Math.min(100, Number(typeof row === "string" ? 0 : row?.confidence || 0)));
      const variant = cleanLine(typeof row === "string" ? "" : row?.variant || "");
      const extracted = extractTitleCandidates(sourceText);
      const values = extracted.length ? extracted : [cleanLine(sourceText)];
      for (const value of values.flatMap(titleQueryAliases)) {
        const normalized = compact(value);
        if (normalized.length < 4 || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push({ text: value, compact: normalized, confidence, variant });
      }
    }
    return result.slice(0, 24);
  }

  function normalizePasscode(value = "") {
    const digits = String(value ?? "").replace(/\D/g, "");
    return digits.length === 8 ? digits : "";
  }

  function hammingHexSimilarity(left = "", right = "") {
    const a = String(left || "").toLowerCase();
    const b = String(right || "").toLowerCase();
    if (!a || a.length !== b.length || !/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b)) return 0;
    let distance = 0;
    for (let index = 0; index < a.length; index += 1) {
      let value = parseInt(a[index], 16) ^ parseInt(b[index], 16);
      while (value) { distance += value & 1;value >>= 1; }
    }
    return Math.max(0, 1 - distance / (a.length * 4));
  }

  function vectorSimilarity(left = [], right = []) {
    if (!Array.isArray(left) || !Array.isArray(right) || !left.length || left.length !== right.length) return 0;
    let dot = 0;
    let normLeft = 0;
    let normRight = 0;
    for (let index = 0; index < left.length; index += 1) {
      const a = Number(left[index] || 0);
      const b = Number(right[index] || 0);
      dot += a * b;
      normLeft += a * a;
      normRight += b * b;
    }
    if (!normLeft || !normRight) return 0;
    return Math.max(0, Math.min(1, (dot / Math.sqrt(normLeft * normRight) + 1) / 2));
  }

  function histogramSimilarity(left = [], right = []) {
    if (!Array.isArray(left) || !Array.isArray(right) || !left.length || left.length !== right.length) return 0;
    const difference = left.reduce((sum, value, index) => sum + Math.abs(Number(value || 0) - Number(right[index] || 0)), 0);
    return Math.max(0, Math.min(1, 1 - difference / 2));
  }

  function artworkFingerprintSimilarity(left = {}, right = {}) {
    const leftHash = left?.dHash || left?.dhash || left?.fingerprint;
    const rightHash = right?.dHash || right?.dhash || right?.fingerprint;
    const scores = [];
    if (leftHash && rightHash && String(leftHash).length === String(rightHash).length) {
      scores.push({ value: hammingHexSimilarity(leftHash, rightHash), weight: 0.45 });
    }
    if (Array.isArray(left?.histogram) && Array.isArray(right?.histogram) && left.histogram.length === right.histogram.length) {
      scores.push({ value: histogramSimilarity(left.histogram, right.histogram), weight: 0.20 });
    }
    if (Array.isArray(left?.lumaGrid) && Array.isArray(right?.lumaGrid) && left.lumaGrid.length === right.lumaGrid.length) {
      scores.push({ value: vectorSimilarity(left.lumaGrid, right.lumaGrid), weight: 0.35 });
    }
    if (!scores.length) return 0;
    const totalWeight = scores.reduce((sum, row) => sum + row.weight, 0);
    const combined = scores.reduce((sum, row) => sum + row.value * row.weight, 0) / totalWeight;
    return Math.max(0, Math.min(1, combined));
  }

  function bestArtworkSimilarity(targets = [], references = []) {
    let best = 0;
    for (const target of Array.isArray(targets) ? targets : []) for (const reference of Array.isArray(references) ? references : []) {
      best = Math.max(best, artworkFingerprintSimilarity(target, reference));
    }
    return best;
  }

  function candidateNames(entry = {}) {
    const values = [
      { text: entry.germanName, language: "de", source: "canonical" },
      { text: entry.englishName, language: "en", source: "canonical" },
      ...(Array.isArray(entry.aliases) ? entry.aliases.filter(alias => typeof alias === "string" || cleanLine(alias?.language).toLowerCase() !== "passcode").map(alias => typeof alias === "string"
        ? { text: alias, language: "", source: "alias" }
        : { text: alias?.alias, language: cleanLine(alias?.language).toLowerCase(), source: "alias" }) : [])
    ];
    const seen = new Set();
    return values.map(row => ({ ...row, text: cleanLine(row.text) })).filter(row => {
      const key = compact(row.text);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function candidatePasscodes(entry = {}) {
    const values = [
      ...(Array.isArray(entry.passcodes) ? entry.passcodes : []),
      ...(Array.isArray(entry.aliases) ? entry.aliases.filter(alias => typeof alias !== "string" && cleanLine(alias?.language).toLowerCase() === "passcode").map(alias => alias.alias) : [])
    ];
    return [...new Set(values.map(normalizePasscode).filter(Boolean))];
  }

  function nameConfidence(score, margin, bestSimilarity, ocrConfidence, supportCount) {
    if (score >= 0.86 && bestSimilarity >= 0.90 && margin >= 0.08 && ocrConfidence >= 42) return "high";
    if (score >= 0.72 && bestSimilarity >= 0.72 && margin >= 0.035 && ocrConfidence >= 28) return "medium";
    if (score >= 0.55 && bestSimilarity >= 0.56 && margin >= 0.015) return "low";
    if (supportCount >= 2 && score >= 0.67 && bestSimilarity >= 0.68 && margin >= 0.025) return "medium";
    return "unknown";
  }

  function rankNameCandidates(entries = [], readings = [], options = {}) {
    const normalizedReadings = normalizeOcrReadings(readings);
    const limit = Math.max(1, Math.min(20, Number(options.limit || 5)));
    const wantedCodes = new Set((Array.isArray(options.setCodes) ? options.setCodes : [])
      .flatMap(setCodeAliases).map(compact).filter(Boolean));
    const wantedPasscodes = new Set((Array.isArray(options.passcodes) ? options.passcodes : []).map(normalizePasscode).filter(Boolean));
    const targetArtworkFingerprints = Array.isArray(options.artworkFingerprints) ? options.artworkFingerprints.filter(Boolean) : [];
    if (!normalizedReadings.length && !wantedPasscodes.size && !targetArtworkFingerprints.length) {
      return { candidates: [], nameConfidence: "unknown", confidenceScore: 0, margin: 0, readings: [], conflicts: [] };
    }

    const entryRows = (Array.isArray(entries) ? entries : []).map(entry => ({
      entry,
      names: candidateNames(entry),
      passcodes: candidatePasscodes(entry),
      artworkSimilarity: bestArtworkSimilarity(targetArtworkFingerprints, entry.artworkFingerprints)
    })).filter(row => row.names.length);
    const matchedPasscodeMetacards = new Set(entryRows.filter(row => row.passcodes.some(value => wantedPasscodes.has(value))).map(row => String(row.entry.metacardId || "")));

    const coarse = [];
    for (const row of entryRows) {
      let coarseScore = 0;
      for (const reading of normalizedReadings) {
        for (const name of row.names) {
          const candidateCompact = compact(name.text);
          const contained = candidateCompact.includes(reading.compact) || reading.compact.includes(candidateCompact);
          coarseScore = Math.max(coarseScore, contained ? 0.82 : trigramSimilarity(reading.text, name.text));
        }
      }
      const passcodeMatched = row.passcodes.some(value => wantedPasscodes.has(value));
      if (coarseScore >= 0.10 || passcodeMatched || row.artworkSimilarity >= 0.58) coarse.push({ ...row, coarseScore, passcodeMatched });
    }

    let detailed = coarse.sort((left, right) => Math.max(right.coarseScore, right.artworkSimilarity) - Math.max(left.coarseScore, left.artworkSimilarity)).slice(0, 260).map(row => {
      let best = null;
      const supportedVariants = new Set();
      for (const reading of normalizedReadings) {
        let readingBest = 0;
        for (const name of row.names) {
          const similarity = titleSimilarity(reading.text, name.text);
          readingBest = Math.max(readingBest, similarity);
          if (!best || similarity > best.similarity || (similarity === best.similarity && reading.confidence > best.reading.confidence)) {
            best = { similarity, reading, name };
          }
        }
        if (readingBest >= 0.68) supportedVariants.add(reading.variant || reading.compact);
      }
      for (const name of row.names) {
        const evidence = tokenEvidence(normalizedReadings, name.text);
        if (evidence.score > (best?.similarity || 0)) {
          best = { similarity: evidence.score, reading: evidence.reading, name, tokenEvidence: evidence };
        }
      }
      if ((!best || best.similarity < 0.28) && !row.passcodeMatched && row.artworkSimilarity < 0.58) return null;
      best ||= { similarity: 0, reading: { text: "", confidence: 0, variant: "" }, name: row.names[0] };
      const ocrWeight = best.reading.confidence / 100;
      const supportCount = supportedVariants.size;
      const supportBonus = Math.min(0.075, Math.max(0, supportCount - 1) * 0.025);
      const entryCodes = new Set((Array.isArray(row.entry.setCodes) ? row.entry.setCodes : [])
        .flatMap(setCodeAliases).map(compact).filter(Boolean));
      const setCodeMatched = wantedCodes.size > 0 && [...wantedCodes].some(code => entryCodes.has(code));
      const ocrScore = best.similarity > 0 ? Math.max(0, Math.min(1, best.similarity * 0.82 + ocrWeight * 0.10 + supportBonus + (setCodeMatched ? 0.025 : 0))) : 0;
      const passcodeConflict = wantedPasscodes.size > 0 && matchedPasscodeMetacards.size > 0 && !row.passcodeMatched;
      let score = ocrScore;
      if (row.passcodeMatched) score = ocrScore ? ocrScore * 0.72 + 0.28 : 0.78;
      if (row.artworkSimilarity >= 0.58) score = score ? score * 0.78 + row.artworkSimilarity * 0.22 : row.artworkSimilarity * 0.68;
      if (passcodeConflict) score *= 0.70;
      return { ...row, best, score: Math.max(0, Math.min(1, score)), ocrScore, supportCount, setCodeMatched, passcodeConflict };
    }).filter(Boolean);

    const artworkOrder = detailed.slice().sort((left, right) => right.artworkSimilarity - left.artworkSimilarity);
    const artworkLeader = artworkOrder[0];
    const artworkMargin = (artworkLeader?.artworkSimilarity || 0) - (artworkOrder[1]?.artworkSimilarity || 0);
    if ((artworkLeader?.artworkSimilarity || 0) >= 0.84 && artworkMargin >= 0.06) {
      detailed = detailed.map(row => {
        const artworkConflict = row !== artworkLeader && row.artworkSimilarity < 0.58 && row.ocrScore > 0;
        return artworkConflict ? { ...row, artworkConflict, score: row.score * 0.86 } : row;
      });
    }
    detailed.sort((left, right) => right.score - left.score || right.best.similarity - left.best.similarity);

    const topScore = detailed[0]?.score || 0;
    const secondScore = detailed[1]?.score || 0;
    const margin = Math.max(0, topScore - secondScore);
    const confidenceFor = (row, candidateMargin) => {
      if (!row) return "unknown";
      if (row.passcodeConflict || row.artworkConflict) return row.best.similarity >= 0.78 ? "low" : "unknown";
      const base = nameConfidence(row.score, candidateMargin, row.best.similarity, row.best.reading.confidence, row.supportCount);
      if (row.passcodeMatched && row.best.similarity >= 0.80 && row.score >= 0.84 && candidateMargin >= 0.06) return "high";
      if (row.passcodeMatched && (row.best.similarity >= 0.42 || row.artworkSimilarity >= 0.68) && candidateMargin >= 0.025) return "medium";
      if (row.passcodeMatched) return candidateMargin >= 0.025 ? "low" : "unknown";
      if (row.artworkSimilarity >= 0.80 && row.best.similarity >= 0.62 && candidateMargin >= 0.04) return base === "high" ? "high" : "medium";
      if (row.artworkSimilarity >= 0.78 && row.best.similarity < 0.42) return candidateMargin >= 0.04 ? "low" : "unknown";
      return base;
    };
    const aggregateConfidence = confidenceFor(detailed[0], margin);
    const minimumScore = topScore >= 0.55 ? Math.max(0.30, topScore - 0.38) : 0.24;
    const candidates = detailed.filter(row => row.score >= minimumScore).slice(0, limit).map((row, index) => {
      const candidateMargin = Math.max(0, row.score - (detailed[index + 1]?.score || 0));
      const confidence = index === 0 ? aggregateConfidence : confidenceFor(row, candidateMargin);
      const primaryName = cleanLine(row.entry.germanName || row.entry.englishName || row.best.name.text);
      const reasons = [];
      if (row.ocrScore) reasons.push("title_ocr", row.best.name.source === "alias" ? "alias_match" : `${row.best.name.language || "unknown"}_name_match`);
      if (row.supportCount > 1) reasons.push("multiple_ocr_variants");
      if (row.best.tokenEvidence?.matchedCount) reasons.push("multi_line_word_evidence");
      if (row.setCodeMatched) reasons.push("set_code_support_only");
      if (row.passcodeMatched) reasons.push("passcode_match");
      if (row.artworkSimilarity >= 0.58) reasons.push("artwork_similarity");
      if (row.passcodeConflict) reasons.push("passcode_conflict");
      if (row.artworkConflict) reasons.push("artwork_conflict");
      return {
        id: `ocr-name-${String(row.entry.metacardId || index)}`,
        name: primaryName,
        germanName: cleanLine(row.entry.germanName),
        englishName: cleanLine(row.entry.englishName),
        metacardId: cleanLine(row.entry.metacardId),
        source: "automatic_ocr",
        signal: [row.ocrScore && `OCR „${row.best.reading.text}“ → ${row.best.name.text}`, row.passcodeMatched && `Karten-ID ${[...wantedPasscodes].find(value => row.passcodes.includes(value))}`, row.artworkSimilarity >= 0.58 && `Artwork ${Math.round(row.artworkSimilarity * 100)} % ähnlich`].filter(Boolean).join(" · "),
        confidence,
        score: Math.round(row.score * 10000) / 10000,
        matchedAlias: row.best.name.text,
        matchedLanguage: row.best.name.language || "unknown",
        ocrText: row.best.reading.text,
        ocrConfidence: Math.round(row.best.reading.confidence * 10) / 10,
        supportCount: row.supportCount,
        setCodeMatched: row.setCodeMatched,
        passcodeMatched: row.passcodeMatched,
        matchedPasscode: row.passcodeMatched ? [...wantedPasscodes].find(value => row.passcodes.includes(value)) || "" : "",
        artworkSimilarity: Math.round(row.artworkSimilarity * 10000) / 10000,
        signalConflict: Boolean(row.passcodeConflict || row.artworkConflict),
        signalScores: { ocr: Math.round(row.ocrScore * 10000) / 10000, passcode: row.passcodeMatched ? 1 : 0, artwork: Math.round(row.artworkSimilarity * 10000) / 10000 },
        reasonCodes: reasons
      };
    });
    return {
      candidates,
      nameConfidence: aggregateConfidence,
      confidenceScore: Math.round(topScore * 10000) / 10000,
      margin: Math.round(margin * 10000) / 10000,
      readings: normalizedReadings,
      conflicts: candidates[0]?.signalConflict ? candidates[0].reasonCodes.filter(reason => reason.endsWith("_conflict")) : []
    };
  }

  function buildQueries({ hint = "", text = "", titleTexts = [], setCodeTexts = [] } = {}) {
    const combinedCodes = [text, ...setCodeTexts].flatMap(extractSetCodes);
    const targetedTitles = titleTexts.flatMap(value => extractTitleCandidates(value).flatMap(titleQueryAliases));
    const generalTitles = extractTitleCandidates(text).flatMap(titleQueryAliases);
    const values = [cleanLine(hint), ...combinedCodes, ...targetedTitles, ...generalTitles];
    return values.filter((value, index) => value && values.findIndex(other => compact(other) === compact(value)) === index).slice(0, 16);
  }

  function productCollectorCodes(product = {}) {
    return [product.collectorNumber, product.setCode]
      .map(normalizeSetCode)
      .filter(Boolean);
  }

  function exactCodeMatches(products = [], codes = []) {
    const wanted = new Set(codes.map(normalizeSetCode).filter(Boolean).map(compact));
    if (!wanted.size) return [];
    return products.filter(product => productCollectorCodes(product).some(code => wanted.has(compact(code))));
  }

  return Object.freeze({
    compact,
    cleanLine,
    normalizeSetCode,
    setCodeAliases,
    extractSetCodes,
    extractTitleCandidates,
    titleQueryAliases,
    extractPasscodes,
    extractEdition,
    levenshteinDistance,
    titleSimilarity,
    normalizePasscode,
    artworkFingerprintSimilarity,
    bestArtworkSimilarity,
    trigramSimilarity,
    nameTokens,
    tokenSimilarity,
    tokenEvidence,
    normalizeOcrReadings,
    rankNameCandidates,
    buildQueries,
    productCollectorCodes,
    exactCodeMatches
  });
});
