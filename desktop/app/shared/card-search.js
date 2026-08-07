(function initializeCardSearch(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.TcgCardSearch = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCardSearch() {
  "use strict";

  function foldUnicode(value = "") {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("de-DE")
      .replace(/ß/g, "ss")
      .replace(/[‘’‚‛`´ʼʹ]/g, "'")
      .replace(/[‐‑‒–—―−]/g, "-");
  }

  function normalizeSpaced(value = "") {
    return foldUnicode(value)
      .replace(/'/g, "")
      .replace(/-/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function normalizeCompact(value = "") {
    return foldUnicode(value).replace(/[^a-z0-9]+/g, "");
  }

  function uniqueStrings(values = []) {
    const result = [];
    const seen = new Set();
    for (const value of values) {
      const text = String(value ?? "").trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      result.push(text);
    }
    return result;
  }

  function buildSearchDocument(values = []) {
    const strings = uniqueStrings(Array.isArray(values) ? values : [values]);
    return {
      spaced: strings.map(normalizeSpaced).filter(Boolean).join(" "),
      compact: strings.map(normalizeCompact).filter(Boolean).join(" ")
    };
  }

  function queryForms(value = "") {
    const spaced = normalizeSpaced(value);
    return {
      spaced,
      compact: normalizeCompact(value),
      terms: spaced.split(/\s+/).filter(Boolean)
    };
  }

  function parseSetCode(value = "") {
    const compact = String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
    const match = compact.match(/^([A-Z0-9/]{2,12})-(?:([A-Z]{2}))?([0-9]{1,4}[A-Z]?)$/);
    if (!match) return null;
    return {
      prefix: match[1],
      language: match[2] || "",
      number: match[3],
      neutral: `${match[1]}-${match[3]}`,
      full: compact
    };
  }

  function parseVariantLabel(value = "") {
    const original = String(value ?? "").trim();
    const match = original.match(/\s*\(?\s*(V\.?\s*(\d+))\s*[-–—]\s*([^\r\n)]+)\s*\)?\s*$/i);
    if (!match) return { original, baseName: original, variant: "", variantNumber: 0, rarity: "" };
    return {
      original,
      baseName: original.slice(0, match.index).trim() || original,
      variant: `V.${Number(match[2])}`,
      variantNumber: Number(match[2]),
      rarity: String(match[3] || "").trim()
    };
  }

  function parseCardmarketProductUrl(value = "") {
    try {
      const url = new URL(String(value || ""));
      const parts = url.pathname.split("/").filter(Boolean);
      const singlesIndex = parts.findIndex(part => part.toLocaleLowerCase("de-DE") === "singles");
      if (singlesIndex < 0 || !parts[singlesIndex + 1]) return { setSlug:"", productSlug:"", productBase:"" };
      const setSlug=decodeURIComponent(parts[singlesIndex + 1] || "");
      const productSlug=decodeURIComponent(parts[singlesIndex + 2] || "");
      return {
        setSlug,
        productSlug,
        productBase:productSlug.replace(/-V\.?(\d+)-.*$/i,"")
      };
    } catch {
      return { setSlug:"", productSlug:"", productBase:"" };
    }
  }

  function inferVariantOrdinals(rows = []) {
    const result = (Array.isArray(rows) ? rows : []).map(row => ({ ...row }));
    const groups = new Map();
    for (const row of result) {
      const key = `${String(row.metacardId || "")}|${String(row.expansionId || "")}`;
      if (!row.metacardId || !row.expansionId) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }
    for (const group of groups.values()) {
      group.sort((left, right) => Number(left.productId || 0) - Number(right.productId || 0));
      // Cardmarket's three-product legacy groups are not consistently ordered.
      // All other observed group sizes match the exported V-number; the importer
      // additionally requires exact name, set and rarity/link evidence.
      if (group.length === 3) continue;
      group.forEach((row, index) => {
        if (!String(row.variant || "").trim()) {
          row.inferredVariant = `V.${index + 1}`;
          row.variantOrderReliable = true;
        }
      });
    }
    return result;
  }

  function selectSafeVariant(record = {}, candidates = []) {
    const identity = parseVariantLabel(record.name || record.germanName || record.englishName || "");
    if (!identity.variantNumber) return null;
    const urlIdentity=parseCardmarketProductUrl(record.productUrl||"");
    const setHint = normalizeCompact(record.setName || record.set || record.expansion || urlIdentity.setSlug || "");
    if (!setHint) return null;
    const baseName = normalizeCompact(identity.baseName);
    const urlBaseName=normalizeCompact(urlIdentity.productBase);
    const rarity = normalizeCompact(record.rarity || record.version || identity.rarity);
    const matches = (Array.isArray(candidates) ? candidates : []).filter(candidate => {
      const candidateNames = [candidate.name, candidate.germanName, candidate.englishName, candidate.officialName]
        .map(value => normalizeCompact(parseVariantLabel(value).baseName))
        .filter(Boolean);
      const candidateSet = [candidate.setName, candidate.set, candidate.setCode]
        .map(normalizeCompact).filter(Boolean);
      const candidateVariant = candidate.variant || candidate.inferredVariant;
      const candidateRarity = normalizeCompact(candidate.rarity);
      return candidate.variantOrderReliable
        && candidateNames.includes(baseName)
        && (!urlBaseName || candidateNames.includes(urlBaseName))
        && candidateSet.includes(setHint)
        && normalizeCompact(candidateVariant) === normalizeCompact(identity.variant)
        && (!candidateRarity || !rarity || candidateRarity === rarity);
    });
    const uniqueMatches=[...new Map(matches.map(candidate=>[String(candidate.productId||''),candidate])).values()];
    return uniqueMatches.length === 1 ? uniqueMatches[0] : null;
  }

  function matchesSearch(documentOrValues, query = "") {
    const document = documentOrValues && typeof documentOrValues === "object" && !Array.isArray(documentOrValues)
      ? documentOrValues
      : buildSearchDocument(documentOrValues);
    const forms = queryForms(query);
    if (!forms.spaced && !forms.compact) return true;
    const spaced = String(document?.spaced || "");
    const compact = String(document?.compact || "");
    const termMatch = forms.terms.length > 0 && forms.terms.every(term =>
      spaced.includes(term) || compact.includes(normalizeCompact(term))
    );
    const compactMatch = forms.compact.length > 0 && compact.includes(forms.compact);
    return termMatch || compactMatch;
  }

  return Object.freeze({
    foldUnicode,
    normalizeSpaced,
    normalizeCompact,
    buildSearchDocument,
    queryForms,
    parseSetCode,
    parseVariantLabel,
    parseCardmarketProductUrl,
    inferVariantOrdinals,
    selectSafeVariant,
    matchesSearch,
    uniqueStrings
  });
});
