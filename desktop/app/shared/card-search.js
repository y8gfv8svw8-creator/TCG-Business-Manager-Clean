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
    matchesSearch,
    uniqueStrings
  });
});
