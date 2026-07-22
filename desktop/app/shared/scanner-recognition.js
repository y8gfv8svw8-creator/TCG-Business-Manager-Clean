(function initializeScannerRecognition(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgScannerRecognition = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScannerRecognition() {
  "use strict";

  const LANGUAGE_MARKERS = new Set(["EN", "DE", "FR", "IT", "ES", "SP", "PT", "PL", "NL"]);
  const IGNORED_LINE_PARTS = [
    "ATK/", "DEF/", "ATK ", "DEF ", "1ST EDITION", "LIMITED EDITION",
    "SPELL CARD", "TRAP CARD", "MONSTER", "KONAMI", "©", "CARD SCANNER"
  ];

  function compact(value = "") {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
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
    const match = text.match(/^([A-Z0-9]{2,12})-?([A-Z]{2})?([0-9OIL]{2,4}[A-Z]?)$/);
    if (!match) return "";
    const language = LANGUAGE_MARKERS.has(match[2]) ? match[2] : "";
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
    const a = compact(left);
    const b = compact(right);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const shorter = a.length <= b.length ? a : b;
    const longer = a.length > b.length ? a : b;
    const substringScore = longer.includes(shorter) && shorter.length >= 5
      ? 0.78 + 0.2 * (shorter.length / longer.length)
      : 0;
    const editScore = 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
    const wordsA = cleanLine(left).toUpperCase().split(/[^A-Z0-9]+/).filter(word => word.length > 1);
    const wordsB = cleanLine(right).toUpperCase().split(/[^A-Z0-9]+/).filter(word => word.length > 1);
    const shared = wordsA.filter(word => wordsB.some(other => other === word || (word.length >= 5 && (word.includes(other) || other.includes(word))))).length;
    const wordScore = shared ? shared / Math.max(wordsA.length, wordsB.length) : 0;
    return Math.max(substringScore, editScore, wordScore * 0.92);
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
    buildQueries,
    productCollectorCodes,
    exactCodeMatches
  });
});
