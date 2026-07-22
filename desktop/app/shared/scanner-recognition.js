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

  function buildQueries({ hint = "", text = "" } = {}) {
    const values = [cleanLine(hint), ...extractSetCodes(text), ...extractTitleCandidates(text)];
    return values.filter((value, index) => value && values.findIndex(other => compact(other) === compact(value)) === index).slice(0, 10);
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
    buildQueries,
    productCollectorCodes,
    exactCodeMatches
  });
});
