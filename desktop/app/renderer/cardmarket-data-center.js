/* TCG Business Manager 5.2.0 – Analysecenter
 * Große Cardmarket-Datenmengen werden bewusst in IndexedDB gespeichert.
 * Dadurch bleibt der normale Warenwirtschafts-Stand in localStorage klein und stabil.
 */
(() => {
  "use strict";

  const CM_DB_NAME = "tcgBusinessManagerCardmarket";
  const CM_DB_VERSION = 2;
  const CM_GERMAN_NAME_REVISION = 2;
  const CM_VERIFIED_GERMAN_NAME_PAIRS = Object.freeze([
    ["Fiendsmith Engraver", "Unterweltlerschmied Graveur"],
    ["Fiendsmith's Agnumday", "Agnumday des Unterweltlerschmieds"],
    ["Fiendsmith's Desirae", "Desirae des Unterweltlerschmieds"],
    ["Fiendsmith's Lacrima", "Lacrima des Unterweltlerschmieds"],
    ["Fiendsmith's Requiem", "Requiem des Unterweltlerschmieds"],
    ["Fiendsmith's Rextremende", "Rextremende des Unterweltlerschmieds"],
    ["Fiendsmith's Sanct", "Sanct des Unterweltlerschmieds"],
    ["Fiendsmith's Sequence", "Sequenz des Unterweltlerschmieds"],
    ["Fiendsmith's Tract", "Tract des Unterweltlerschmieds"],
    ["Fiendsmith in Paradise", "Unterweltlerschmied im Paradies"],
    ["Lacrima the Crimson Tears", "Lacrima, die blutroten Tränen"]
  ]);
  const CM_META_DEFAULTS = {
    catalogImportedAt: "",
    catalogCreatedAt: "",
    catalogVersion: "",
    productCount: 0,
    priceImportedAt: "",
    priceDate: "",
    priceVersion: "",
    priceRowCount: 0,
    historyRowCount: 0,
    snapshotDates: [],
    germanNamesImportedAt: "",
    germanNameCount: 0,
    germanNameSource: "",
    germanNameRevision: 0,
    germanNameVerifiedFallbackCount: 0,
    cardDataImportedAt: "",
    setDetailCount: 0,
    setMappingCount: 0,
    lastError: "",
    lastAutoAttemptDate: "",
    lastAutoSuccessDate: "",
    autoDailyUpdate: true
  };

  let cmDbPromise = null;
  let cmMergedCache = null;
  let cmProductByIdCache = null;
  let cmLatestByIdCache = null;
  let cmSearchTimer = null;
  let cmRenderToken = 0;
  let cmHistoryOverviewToken = 0;
  let cmOpportunityCache = {key:"", rows:[]};
  let cmLastRenderedView = "";
  const YGOPRO_EN_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
  const YGOPRO_DE_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=de";

  // State-Migration für bestehende 4.3.x-Daten und spätere Backup-Importe.
  defaultState.cardmarket = {...CM_META_DEFAULTS};
  state.cardmarket = {...CM_META_DEFAULTS, ...(state.cardmarket || {})};
  const legacyMigrateState = migrateState;
  migrateState = function(data) {
    const migrated = legacyMigrateState(data);
    migrated.cardmarket = {...CM_META_DEFAULTS, ...(data?.cardmarket || {})};
    return migrated;
  };

  views.cardmarket = [
    "Cardmarket-Datencenter",
    "Vollständiger Produktkatalog, tägliche Preishistorie, Einkaufsrechner und Marktchancen."
  ];

  function cmNormalize(value="") {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9äöüß]+/gi, " ")
      .trim();
  }

  function cmVerifiedGermanName(englishName="") {
    const key = cmNormalize(cmExtractIdentity(englishName).baseName);
    if (!key) return "";
    const pair = CM_VERIFIED_GERMAN_NAME_PAIRS.find(([english]) => cmNormalize(english) === key);
    return pair ? pair[1] : "";
  }

  function cmGermanNameCandidate(germanName="", englishName="") {
    const german = String(germanName || "").trim();
    const english = String(englishName || "").trim();
    if (!german) return "";
    if (english && cmNormalize(german) === cmNormalize(english)) return "";
    return german;
  }

  function cmBuildLocalGermanNameMaps(products=[]) {
    const byProductId = new Map();
    const byMetacardCandidates = new Map();
    const byEnglishCandidates = new Map();

    const addCandidate = ({productId="", metacardId="", englishName="", germanName=""}={}) => {
      const german = cmGermanNameCandidate(germanName, englishName);
      if (!german) return;
      const pid = cleanProductId(productId);
      const mid = cleanProductId(metacardId);
      const englishKey = cmNormalize(cmExtractIdentity(englishName).baseName);
      if (pid && !byProductId.has(pid)) byProductId.set(pid,german);
      if (mid) {
        if (!byMetacardCandidates.has(mid)) byMetacardCandidates.set(mid,new Set());
        byMetacardCandidates.get(mid).add(german);
      }
      if (englishKey) {
        if (!byEnglishCandidates.has(englishKey)) byEnglishCandidates.set(englishKey,new Set());
        byEnglishCandidates.get(englishKey).add(german);
      }
    };

    for (const product of products) {
      addCandidate({
        productId:product.productId,
        metacardId:product.metacardId,
        englishName:product.officialBaseName || product.officialName || product.name,
        germanName:product.germanName
      });
    }

    for (const [productId,catalog] of Object.entries(state.productCatalog || {})) {
      addCandidate({
        productId,
        metacardId:catalog?.metacardId,
        englishName:catalog?.officialBaseName || catalog?.officialName || catalog?.englishName || catalog?.name,
        germanName:catalog?.germanName || (catalog?.englishName ? catalog?.name : "")
      });
    }

    const visitRecord = (record, depth=0) => {
      if (!record || depth > 3) return;
      if (Array.isArray(record)) { record.forEach(item => visitRecord(item,depth+1)); return; }
      if (typeof record !== "object") return;
      const productId = cleanProductId(record.productId);
      const catalog = productId ? (state.productCatalog?.[productId] || {}) : {};
      const englishName = record.englishName || catalog.officialBaseName || catalog.officialName || catalog.englishName || "";
      const germanName = record.germanName || (englishName ? record.name : "") || catalog.germanName || "";
      addCandidate({
        productId,
        metacardId:record.metacardId || catalog.metacardId,
        englishName,
        germanName
      });
      if (Array.isArray(record.items)) visitRecord(record.items,depth+1);
      if (Array.isArray(record.pendingItems)) visitRecord(record.pendingItems,depth+1);
    };

    [state.inventory,state.purchases,state.sales,state.watchlist].forEach(rows => visitRecord(rows));

    const uniqueMap = candidates => {
      const result = new Map();
      for (const [key,names] of candidates) if (names.size === 1) result.set(key,[...names][0]);
      return result;
    };

    return {
      byProductId,
      byMetacardId:uniqueMap(byMetacardCandidates),
      byEnglishKey:uniqueMap(byEnglishCandidates)
    };
  }

  function cmSearchTextForProduct(product={}) {
    return cmNormalize([
      product.productId, product.germanName, product.name, product.officialName, product.officialBaseName,
      product.set, product.setName, product.rarity, product.variant,
      product.expansionId ? `expansion ${product.expansionId}` : "",
      product.metacardId ? `metacard ${product.metacardId}` : ""
    ].filter(Boolean).join(" "));
  }

  function cmResolveGermanName(product={}, localMaps=null, apiGermanName="") {
    const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
    const productId = cleanProductId(product.productId);
    const metacardId = cleanProductId(product.metacardId);
    const englishKey = cmNormalize(englishBase);
    return cmVerifiedGermanName(englishBase)
      || cmGermanNameCandidate(apiGermanName,englishBase)
      || cmGermanNameCandidate(product.germanName,englishBase)
      || localMaps?.byProductId?.get(productId)
      || localMaps?.byMetacardId?.get(metacardId)
      || localMaps?.byEnglishKey?.get(englishKey)
      || "";
  }

  function cmGermanName(product={}) {
    const explicit = String(product.germanName || "").trim();
    if (explicit) return explicit;
    const local = String(product.name || "").trim();
    const officialBase = String(product.officialBaseName || product.officialName || "").trim();
    return local && cmNormalize(local) !== cmNormalize(officialBase) ? local : "";
  }

  function cmDisplayName(product={}) {
    return cmGermanName(product) || String(product.officialBaseName || product.officialName || product.name || `CM ${product.productId || ""}`).trim();
  }

  function cmEnglishName(product={}) {
    return String(product.officialBaseName || product.officialName || product.name || "").trim();
  }

  function cmNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function cmClamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value || 0)));
  }

  // Geldgrenzen werden bewusst centgenau und konservativ berechnet.
  // Ein Max-EK darf niemals aufgerundet werden, da sonst Mindestgewinn/ROI unterschritten werden können.
  function cmFloorMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return 0;
    return Math.floor((number + Number.EPSILON) * 100) / 100;
  }

  function cmRoundMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.round((number + Number.EPSILON) * 100) / 100;
  }

  function cmDateFromPayload(payload) {
    const raw = String(payload?.createdAt || "").trim();
    const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : todayISO();
  }

  function cmExtractIdentity(rawName="") {
    const original = String(rawName || "").trim();
    let baseName = original;
    let variant = "";
    let rarity = "";
    const versionMatch = original.match(/\s*\((V\.?\s*\d+)\s*[-–—]\s*([^)]+)\)\s*$/i);
    if (versionMatch) {
      variant = versionMatch[1].replace(/\s+/g, "");
      rarity = versionMatch[2].trim();
      baseName = original.slice(0, versionMatch.index).trim();
    }
    return {original, baseName: baseName || original, variant, rarity};
  }

  function cmOpenDb() {
    if (cmDbPromise) return cmDbPromise;
    cmDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CM_DB_NAME, CM_DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        let products;
        if (!db.objectStoreNames.contains("products")) {
          products = db.createObjectStore("products", {keyPath:"productId"});
        } else {
          products = request.transaction.objectStore("products");
        }
        if (!products.indexNames.contains("metacardId")) products.createIndex("metacardId", "metacardId", {unique:false});
        if (!products.indexNames.contains("expansionId")) products.createIndex("expansionId", "expansionId", {unique:false});
        if (!products.indexNames.contains("baseName")) products.createIndex("baseName", "baseName", {unique:false});

        let latest;
        if (!db.objectStoreNames.contains("latestPrices")) {
          latest = db.createObjectStore("latestPrices", {keyPath:"productId"});
        } else {
          latest = request.transaction.objectStore("latestPrices");
        }
        if (!latest.indexNames.contains("date")) latest.createIndex("date", "date", {unique:false});
        if (!latest.indexNames.contains("dailyChange")) latest.createIndex("dailyChange", "dailyChange", {unique:false});

        let history;
        if (!db.objectStoreNames.contains("priceHistory")) {
          history = db.createObjectStore("priceHistory", {keyPath:"key"});
        } else {
          history = request.transaction.objectStore("priceHistory");
        }
        if (!history.indexNames.contains("productId")) history.createIndex("productId", "productId", {unique:false});
        if (!history.indexNames.contains("date")) history.createIndex("date", "date", {unique:false});


        if (!db.objectStoreNames.contains("collectionRuns")) {
          const runs = db.createObjectStore("collectionRuns", {keyPath:"runId"});
          runs.createIndex("startedAt", "startedAt", {unique:false});
          runs.createIndex("status", "status", {unique:false});
        }
        if (!db.objectStoreNames.contains("dataSources")) {
          db.createObjectStore("dataSources", {keyPath:"sourceId"});
        }
        if (!db.objectStoreNames.contains("analysisMetrics")) {
          const metrics = db.createObjectStore("analysisMetrics", {keyPath:"key"});
          metrics.createIndex("productId", "productId", {unique:false});
          metrics.createIndex("date", "date", {unique:false});
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Cardmarket-Datenbank konnte nicht geöffnet werden."));
      request.onblocked = () => reject(new Error("Cardmarket-Datenbank ist in einem anderen Tab blockiert."));
    });
    return cmDbPromise;
  }

  function cmRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Datenbankabfrage fehlgeschlagen."));
    });
  }

  async function cmGetAll(storeName) {
    const db = await cmOpenDb();
    return cmRequest(db.transaction(storeName, "readonly").objectStore(storeName).getAll());
  }

  async function cmGet(storeName, key) {
    const db = await cmOpenDb();
    return cmRequest(db.transaction(storeName, "readonly").objectStore(storeName).get(key));
  }

  async function cmCount(storeName) {
    const db = await cmOpenDb();
    return cmRequest(db.transaction(storeName, "readonly").objectStore(storeName).count());
  }

  async function cmClearStore(storeName) {
    const db = await cmOpenDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Datenbank konnte nicht geleert werden."));
      tx.onabort = () => reject(tx.error || new Error("Datenbankvorgang wurde abgebrochen."));
    });
  }

  async function cmPutChunk(storeName, rows) {
    if (!rows.length) return;
    const db = await cmOpenDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      rows.forEach(row => store.put(row));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Daten konnten nicht gespeichert werden."));
      tx.onabort = () => reject(tx.error || new Error("Datenbankvorgang wurde abgebrochen."));
    });
  }

  async function cmWriteRows(storeName, rows, onProgress, chunkSize=2000) {
    for (let start=0; start<rows.length; start+=chunkSize) {
      const chunk = rows.slice(start, start+chunkSize);
      await cmPutChunk(storeName, chunk);
      if (onProgress) onProgress(Math.min(rows.length, start+chunk.length), rows.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  async function cmSyncProductsToSqlite(rows, onProgress) {
    if (!window.desktopApp?.upsertProducts || !rows.length) return 0;
    let written = 0;
    const chunkSize = 2000;
    for (let start=0; start<rows.length; start+=chunkSize) {
      const chunk = rows.slice(start, start+chunkSize);
      const result = await window.desktopApp.upsertProducts(chunk);
      written += Number(result?.written || 0);
      if (onProgress) onProgress(Math.min(rows.length, start+chunk.length), rows.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return written;
  }

  async function cmSyncPricesToSqlite(rows, snapshotDate, importedAt, onProgress) {
    if (!window.desktopApp?.upsertMarketPrices || !rows.length) return 0;
    let written = 0;
    const chunkSize = 2000;
    for (let start=0; start<rows.length; start+=chunkSize) {
      const chunk = rows.slice(start, start+chunkSize);
      const result = await window.desktopApp.upsertMarketPrices({
        rows: chunk,
        snapshotDate,
        sourceId: "cardmarket_price_guide",
        importedAt
      });
      written += Number(result?.written || 0);
      if (onProgress) onProgress(Math.min(rows.length, start+chunk.length), rows.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    return written;
  }

  function cmSetProgress(text, percent=null, kind="") {
    const box = document.getElementById("cmImportStatus");
    const bar = document.getElementById("cmImportProgressBar");
    if (box) {
      box.className = `cm-import-status ${kind}`.trim();
      box.innerHTML = text;
    }
    if (bar) {
      bar.style.width = `${percent === null ? 0 : cmClamp(percent,0,100)}%`;
      bar.parentElement.classList.toggle("active", percent !== null && percent < 100);
    }
  }

  function cmInvalidateCache() {
    cmMergedCache = null;
    cmProductByIdCache = null;
    cmLatestByIdCache = null;
    cmOpportunityCache = {key:"", rows:[]};
  }

  function cmProductRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.products)) return payload.products;
    return [];
  }

  function cmPriceRows(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.priceGuides)) return payload.priceGuides;
    if (Array.isArray(payload?.priceGuide)) return payload.priceGuide;
    if (Array.isArray(payload?.products)) return payload.products;
    return [];
  }

  function cmIsProductCatalog(payload) {
    const rows = cmProductRows(payload);
    return rows.length > 0 && rows.some(row => row && (row.idProduct !== undefined || row.productId !== undefined) && (row.name || row.productName));
  }

  function cmIsPriceGuide(payload) {
    const rows = cmPriceRows(payload);
    return rows.length > 0 && rows.some(row => row && (row.idProduct !== undefined || row.productId !== undefined) && (row.trend !== undefined || row.low !== undefined || row.avg7 !== undefined));
  }

  function cmIsBackup(payload) {
    return payload?.format === "tcg-cardmarket-data-v1" && Array.isArray(payload.products) && Array.isArray(payload.priceHistory);
  }

  function cmKnownCatalogEntry(productId) {
    return state.productCatalog?.[productId] || BUILTIN_PRODUCT_CATALOG?.[productId] || {};
  }

  async function importCardmarketProductCatalogPayload(payload, source="products_singles_3.json") {
    const rows = cmProductRows(payload);
    if (!rows.length) throw new Error("Kein Cardmarket-Produktkatalog erkannt.");
    const importedAt = new Date().toISOString();
    const hasLocalEnrichment = Number(state.cardmarket?.germanNameCount || 0) > 0 || Number(state.cardmarket?.setDetailCount || 0) > 0;
    const existingProducts = hasLocalEnrichment ? await cmGetAll("products") : [];
    const existingById = new Map(existingProducts.map(row => [String(row.productId), row]));
    const existingGermanNames = new Map(existingProducts.map(row => [String(row.productId), String(row.germanName || "").trim()]).filter(([,name]) => name));
    const prepared = [];
    let skipped = 0;

    for (const raw of rows) {
      const productId = cleanProductId(raw?.idProduct ?? raw?.productId ?? raw?.id);
      if (!productId) { skipped++; continue; }
      const identity = cmExtractIdentity(raw?.name ?? raw?.productName ?? "");
      const known = cmKnownCatalogEntry(productId);
      const existing = existingById.get(productId) || {};
      const localizedName = String(known.name || "").trim();
      const name = localizedName || identity.baseName || identity.original || existing.name || `CM Produkt ${productId}`;
      const officialName = identity.original || existing.officialName || name;
      const rarity = String(raw?.rarity || known.rarity || identity.rarity || existing.rarity || "").trim();
      const variant = String(raw?.variant || identity.variant || existing.variant || "").trim();
      const set = String(raw?.set || raw?.setCode || known.set || existing.set || existing.setCode || "").trim();
      const setName = String(raw?.setName || raw?.expansionName || known.setName || existing.setName || "").trim();
      const expansionId = cleanProductId(raw?.idExpansion ?? raw?.expansionId);
      const metacardId = cleanProductId(raw?.idMetacard ?? raw?.metacardId);
      const germanName = String(raw?.germanName || known.germanName || existingGermanNames.get(productId) || cmVerifiedGermanName(identity.baseName) || "").trim();
      const productRow = {
        productId,
        name,
        germanName,
        officialName,
        baseName: name,
        officialBaseName: identity.baseName || officialName,
        categoryId: Number(raw?.idCategory ?? raw?.categoryId ?? 0) || 0,
        categoryName: String(raw?.categoryName || ""),
        expansionId,
        metacardId,
        dateAdded: String(raw?.dateAdded || ""),
        set,
        setName,
        setCode: String(raw?.setCode || set || ""),
        rarity,
        variant,
        language: String(raw?.language || known.language || existing.language || ""),
        condition: String(raw?.condition || known.condition || existing.condition || ""),
        collectorNumber: String(raw?.collectorNumber || known.collectorNumber || existing.collectorNumber || ""),
        productUrl: String(raw?.productUrl || known.productUrl || existing.productUrl || ""),
        archived: Boolean(raw?.archived),
        updatedAt: importedAt
      };
      productRow.searchText = cmSearchTextForProduct(productRow);
      prepared.push(productRow);
    }

    cmSetProgress(`<strong>Produktkatalog wird gespeichert …</strong><br>0 von ${prepared.length.toLocaleString("de-DE")} Produkten`, 0);
    await cmWriteRows("products", prepared, (done,total) => {
      const pctValue = total ? done/total*75 : 75;
      cmSetProgress(`<strong>Produktkatalog wird gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`, pctValue);
    });
    let sqliteProducts = 0;
    try {
      sqliteProducts = await cmSyncProductsToSqlite(prepared, (done,total) => {
        const pctValue = total ? 75 + done/total*25 : 100;
        cmSetProgress(`<strong>SQLite-Kartenstammdaten werden aktualisiert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`, pctValue);
      });
    } catch (error) {
      console.error("SQLite-Produktabgleich fehlgeschlagen:", error);
      state.cardmarket.lastError = `SQLite-Produktabgleich: ${error.message}`;
    }

    state.cardmarket = {
      ...CM_META_DEFAULTS,
      ...state.cardmarket,
      catalogImportedAt: importedAt,
      catalogCreatedAt: String(payload?.createdAt || ""),
      catalogVersion: String(payload?.version ?? ""),
      productCount: prepared.length,
      germanNameRevision: 0,
      lastError: ""
    };
    state.imports.push({
      id:uid(), type:"catalog", key:`catalog-${payload?.version || importedAt}`,
      file:source, date:importedAt, rows:rows.length, cards:prepared.length,
      skipped, createdAt:payload?.createdAt || ""
    });
    cmInvalidateCache();
    saveState();
    renderAll();
    cmSetProgress(`<strong>Produktkatalog importiert</strong><br>${prepared.length.toLocaleString("de-DE")} Produkte gespeichert${sqliteProducts ? ` · ${sqliteProducts.toLocaleString("de-DE")} in SQLite` : ""}${skipped ? ` · ${skipped} Zeilen übersprungen` : ""}.`, 100, "success");
    return {type:"catalog", rows:rows.length, cards:prepared.length, sqliteProducts, skipped};
  }

  function cmNormalizePrice(raw, productId, date) {
    const value = (...names) => {
      for (const name of names) {
        if (raw?.[name] !== undefined && raw?.[name] !== null && raw?.[name] !== "") return cmNumber(raw[name]);
      }
      return null;
    };
    return {
      key:`${date}|${productId}`,
      productId,
      date,
      categoryId:Number(raw?.idCategory ?? raw?.categoryId ?? 0) || 0,
      avg:value("avg","AVG"),
      low:value("low","LOW","lowPrice"),
      trend:value("trend","TREND","trendPrice"),
      avg1:value("avg1","AVG1"),
      avg7:value("avg7","AVG7"),
      avg30:value("avg30","AVG30"),
      avgFoil:value("avg-foil","avgFoil"),
      lowFoil:value("low-foil","lowFoil"),
      trendFoil:value("trend-foil","trendFoil"),
      avg1Foil:value("avg1-foil","avg1Foil"),
      avg7Foil:value("avg7-foil","avg7Foil"),
      avg30Foil:value("avg30-foil","avg30Foil"),
      sourceId:"cardmarket_price_guide",
      sourceType:"official_download",
      dataQuality:"official_reference",
      collectedAt:new Date().toISOString()
    };
  }

  function cmUpdateWatchlistFromLatest(latestMap, priceDate) {
    let updated = 0;
    state.watchlist.forEach(w => {
      const id = cleanProductId(w.productId);
      if (!id) return;
      const price = latestMap.get(id);
      if (!price) return;
      w.currentBuy = price.low ?? "";
      w.low = price.low ?? "";
      w.trend = price.trend ?? "";
      w.avg1 = price.avg1 ?? "";
      w.avg7 = price.avg7 ?? "";
      w.avg30 = price.avg30 ?? "";
      w.priceDate = priceDate;
      updated++;
    });
    return updated;
  }

  async function importCardmarketPriceGuidePayload(payload, source="price_guide_3.json") {
    const rows = cmPriceRows(payload);
    if (!rows.length) throw new Error("Kein Cardmarket-Price-Guide erkannt.");
    const snapshotDate = cmDateFromPayload(payload);
    const importedAt = new Date().toISOString();
    const runId = `price-${snapshotDate}-${Date.now()}`;
    await cmPutChunk("dataSources", [{
      sourceId:"cardmarket_price_guide",
      name:"Cardmarket Yu-Gi-Oh! Price Guide",
      type:"official_download",
      priority:90,
      enabled:true,
      updatedAt:importedAt
    }]);
    await cmPutChunk("collectionRuns", [{
      runId,
      sourceId:"cardmarket_price_guide",
      startedAt:importedAt,
      snapshotDate,
      status:"running",
      rowCount:0,
      error:""
    }]);
    const oldLatest = await cmGetAll("latestPrices");
    const oldMap = new Map(oldLatest.map(row => [String(row.productId), row]));
    const historyRows = [];
    const latestRows = [];
    const latestForWatchlist = new Map();
    let skipped = 0;

    for (const raw of rows) {
      const productId = cleanProductId(raw?.idProduct ?? raw?.productId ?? raw?.id);
      if (!productId) { skipped++; continue; }
      const price = cmNormalizePrice(raw, productId, snapshotDate);
      historyRows.push(price);
      const previous = oldMap.get(productId);
      let latestRecord = null;
      if (!previous || String(snapshotDate) >= String(previous.date || "")) {
        let previousTrend = null;
        let previousDate = "";
        if (previous && previous.date === snapshotDate) {
          previousTrend = cmNumber(previous.previousTrend);
          previousDate = String(previous.previousDate || "");
        } else if (previous) {
          previousTrend = cmNumber(previous.trend);
          previousDate = String(previous.date || "");
        }
        const currentTrend = cmNumber(price.trend);
        const dailyChange = currentTrend !== null && previousTrend !== null ? currentTrend - previousTrend : null;
        latestRecord = {
          ...price,
          previousTrend,
          previousDate,
          dailyChange,
          importedAt
        };
        latestRows.push(latestRecord);
        latestForWatchlist.set(productId, latestRecord);
      } else {
        latestForWatchlist.set(productId, previous);
      }
    }

    cmSetProgress(`<strong>Preishistorie wird gespeichert …</strong><br>0 von ${historyRows.length.toLocaleString("de-DE")} Preiszeilen`, 0);
    await cmWriteRows("priceHistory", historyRows, (done,total) => {
      const pctValue = total ? (done/total*70) : 70;
      cmSetProgress(`<strong>Preishistorie wird gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Preiszeilen`, pctValue);
    });
    await cmWriteRows("latestPrices", latestRows, (done,total) => {
      const pctValue = total ? 70 + done/total*15 : 85;
      cmSetProgress(`<strong>Aktuelle Preise werden zusammengeführt …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`, pctValue);
    });
    let sqlitePrices = 0;
    try {
      sqlitePrices = await cmSyncPricesToSqlite(historyRows, snapshotDate, importedAt, (done,total) => {
        const pctValue = total ? 85 + done/total*15 : 100;
        cmSetProgress(`<strong>SQLite-Preishistorie wird gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Preiszeilen`, pctValue);
      });
    } catch (error) {
      console.error("SQLite-Preisabgleich fehlgeschlagen:", error);
      state.cardmarket.lastError = `SQLite-Preisabgleich: ${error.message}`;
    }

    const snapshotDates = [...new Set([...(state.cardmarket?.snapshotDates || []), snapshotDate])].sort().reverse();
    const effectiveLatestDate = snapshotDates[0] || snapshotDate;
    const updatedWatchlist = cmUpdateWatchlistFromLatest(latestForWatchlist, effectiveLatestDate);
    state.cardmarket = {
      ...CM_META_DEFAULTS,
      ...state.cardmarket,
      priceImportedAt: importedAt,
      priceDate: effectiveLatestDate,
      priceVersion: String(payload?.version ?? ""),
      priceRowCount: historyRows.length,
      historyRowCount: await cmCount("priceHistory"),
      snapshotDates,
      lastError: ""
    };
    state.sync.lastPriceUpdate = importedAt;
    state.imports.push({
      id:uid(), type:"prices", key:`prices-${snapshotDate}-${Date.now()}`,
      file:source, date:importedAt, rows:rows.length, cards:historyRows.length,
      snapshotDate, watchlistUpdated:updatedWatchlist, skipped
    });

    // Nur bereits bekannte kleine Kompatibilitäts-Katalogeinträge aktualisieren.
    latestRows.forEach(price => {
      if (!state.productCatalog?.[price.productId]) return;
      state.productCatalog[price.productId] = {
        ...state.productCatalog[price.productId],
        low:price.low ?? "", trend:price.trend ?? "", avg1:price.avg1 ?? "",
        avg7:price.avg7 ?? "", avg30:price.avg30 ?? "", priceDate:snapshotDate
      };
    });

    cmInvalidateCache();
    saveState();
    updateAutomationUi();
    renderAll();
    await cmPutChunk("collectionRuns", [{
      runId,
      sourceId:"cardmarket_price_guide",
      startedAt:importedAt,
      finishedAt:new Date().toISOString(),
      snapshotDate,
      status:"success",
      rowCount:historyRows.length,
      skipped,
      error:""
    }]);
    if (window.desktopApp?.recordImportRun) {
      await window.desktopApp.recordImportRun({
        runId, source:"cardmarket_price_guide", snapshotDate, startedAt:importedAt,
        finishedAt:new Date().toISOString(), status:"success", rowsRead:rows.length,
        rowsWritten:sqlitePrices, skippedRows:skipped, errorMessage:""
      }).catch(error => console.error("SQLite-Importprotokoll fehlgeschlagen:", error));
    }
    cmSetProgress(`<strong>Price Guide importiert</strong><br>${historyRows.length.toLocaleString("de-DE")} Preise für ${snapshotDate} gespeichert${sqlitePrices ? ` · ${sqlitePrices.toLocaleString("de-DE")} in SQLite` : ""} · ${updatedWatchlist} Watchlist-Einträge aktualisiert.`, 100, "success");
    return {type:"prices", rows:rows.length, cards:historyRows.length, sqlitePrices, updated:updatedWatchlist, snapshotDate, skipped};
  }

  async function cmLoadMergedCache() {
    if (cmMergedCache) return cmMergedCache;
    const [products, latest] = await Promise.all([cmGetAll("products"), cmGetAll("latestPrices")]);
    cmLatestByIdCache = new Map(latest.map(row => [String(row.productId), row]));
    cmProductByIdCache = new Map(products.map(row => [String(row.productId), row]));
    cmMergedCache = products.map(product => ({...product, ...(cmLatestByIdCache.get(String(product.productId)) || {})}));
    return cmMergedCache;
  }

  function cmBuildOwnStats() {
    const map = new Map();
    const row = id => {
      const key = cleanProductId(id);
      if (!key) return null;
      if (!map.has(key)) map.set(key, {
        productId:key, inventory:0, reserved:0, available:0,
        buyQty:0, buyTotal:0, bestBuy:null,
        sellQty:0, sellTotal:0, bestSell:null
      });
      return map.get(key);
    };

    state.inventory.forEach(item => {
      const stat = row(item.productId);
      if (!stat) return;
      if (item.status !== "Verkauft") {
        stat.inventory++;
        if (item.status === "Reserviert" || item.reserved || item.reservedFor || item.saleId) stat.reserved++;
      }
    });

    const purchaseProductKeys = new Set();
    state.purchases.filter(p => p.status !== "Storniert").forEach(purchase => {
      (purchase.pendingItems || []).forEach(item => {
        const stat = row(item.productId);
        if (!stat) return;
        const qty = Math.max(0, Number(item.quantity || 1));
        const price = Number(item.unitPrice ?? item.price ?? 0);
        if (qty <= 0 || price <= 0) return;
        stat.buyQty += qty;
        stat.buyTotal += qty * price;
        stat.bestBuy = stat.bestBuy === null ? price : Math.min(stat.bestBuy, price);
        purchaseProductKeys.add(`${purchase.id}|${stat.productId}`);
      });
    });

    state.inventory.forEach(item => {
      const stat = row(item.productId);
      if (!stat || Number(item.cost || 0) <= 0) return;
      if (item.purchaseId && purchaseProductKeys.has(`${item.purchaseId}|${stat.productId}`)) return;
      const price = Number(item.cost || 0);
      stat.buyQty += 1;
      stat.buyTotal += price;
      stat.bestBuy = stat.bestBuy === null ? price : Math.min(stat.bestBuy, price);
    });

    const inventoryById = new Map(state.inventory.map(item => [item.id, item]));
    state.sales.filter(s => s.status !== "Storniert").forEach(sale => {
      const explicit = sale.items || [];
      if (explicit.length) {
        explicit.forEach(item => {
          const stat = row(item.productId);
          if (!stat) return;
          const qty = Math.max(0, Number(item.quantity || 1));
          const price = Number(item.unitPrice ?? item.price ?? 0);
          if (qty <= 0 || price <= 0) return;
          stat.sellQty += qty;
          stat.sellTotal += qty * price;
          stat.bestSell = stat.bestSell === null ? price : Math.max(stat.bestSell, price);
        });
      } else {
        const linked = (sale.itemIds || []).map(id => inventoryById.get(id)).filter(Boolean);
        const totalQty = Math.max(1, Number(sale.quantity || linked.length || 1));
        const unitPrice = Number(sale.revenue || 0) / totalQty;
        linked.forEach(item => {
          const stat = row(item.productId);
          if (!stat || unitPrice <= 0) return;
          stat.sellQty += 1;
          stat.sellTotal += unitPrice;
          stat.bestSell = stat.bestSell === null ? unitPrice : Math.max(stat.bestSell, unitPrice);
        });
      }
    });

    map.forEach(stat => {
      stat.available = Math.max(0, stat.inventory - stat.reserved);
      stat.avgBuy = stat.buyQty ? stat.buyTotal / stat.buyQty : 0;
      stat.avgSell = stat.sellQty ? stat.sellTotal / stat.sellQty : 0;
      stat.bestBuy = stat.bestBuy ?? 0;
      stat.bestSell = stat.bestSell ?? 0;
    });
    return map;
  }

  function cmProductQuality(product={}) {
    const hasGermanName = Boolean(cmGermanName(product));
    const hasSet = Boolean(String(product.set || product.setName || "").trim());
    const hasVariant = Boolean(String(product.variant || product.rarity || "").trim());
    const exactVariant = hasSet && hasVariant;
    return {
      hasGermanName,
      hasSet,
      hasVariant,
      exactVariant,
      label: exactVariant ? "Druckvariante vollständig" : hasSet ? "Seltenheit/Version fehlt" : "Set und Seltenheit fehlen"
    };
  }

  function cmMarketCalculation(product, own={}, trendSignals={}) {
    const low = cmNumber(product.low);
    const trend = cmNumber(product.trend);
    const avg1 = cmNumber(product.avg1);
    const avg7 = cmNumber(product.avg7);
    const avg30 = cmNumber(product.avg30);
    const priceValues = [low,trend,avg1,avg7,avg30];
    const pricePointCount = priceValues.filter(value => value !== null).length;
    const hasPriceData = pricePointCount > 0;

    const buyCandidates = [
      [low,"Cardmarket Low"],
      [trend,"Cardmarket Trend"],
      [avg1,"Cardmarket Ø 1 Tag"],
      [avg7,"Cardmarket Ø 7 Tage"],
      [avg30,"Cardmarket Ø 30 Tage"]
    ].filter(([value]) => value !== null && value >= 0);
    const marketBuy = buyCandidates.length ? buyCandidates[0][0] : 0;
    const marketBuySource = buyCandidates.length ? buyCandidates[0][1] : "Keine EK-Referenz";

    const weighted = [];
    if (trend !== null) weighted.push([trend, 0.45]);
    if (avg7 !== null) weighted.push([avg7, 0.35]);
    if (avg30 !== null) weighted.push([avg30, 0.20]);
    if (!weighted.length && avg1 !== null) weighted.push([avg1,1]);
    if (!weighted.length && low !== null) weighted.push([low,1]);
    const weightTotal = weighted.reduce((sum, [,weight]) => sum+weight, 0);
    const weightedSell = weightTotal ? weighted.reduce((sum,[value,weight]) => sum+value*weight,0)/weightTotal : 0;
    // Der angezeigte Ziel-VK ist zugleich die Rechenbasis. So entstehen keine versteckten Bruchteile von Cent.
    const recommendedSell = hasPriceData ? cmRoundMoney(Math.max(0, weightedSell, low || 0)) : 0;

    const safety = cmClamp(state.settings.safetyPercent,0,50)/100;
    const feeRate = cmClamp(state.settings.feePercent,0,100)/100;
    const packaging = Math.max(0, Number(state.settings.packaging || 0));
    // Sicherheits-VK und Einkaufsgrenzen werden abgerundet, damit die Kalkulation nie zu optimistisch ist.
    const safeSell = cmFloorMoney(recommendedSell * (1-safety));
    const feeAmount = safeSell * feeRate;
    // Wichtig: Negative Erlöse dürfen nicht auf 0 gekappt werden. Sonst werden Verlust, ROI und Marge falsch.
    const netBeforeBuy = safeSell - feeAmount - packaging;
    const isCostCovering = netBeforeBuy > 0;
    const costShortfall = isCostCovering ? 0 : Math.abs(netBeforeBuy);
    const minProfit = Math.max(0, Number(state.settings.minProfit || 0));
    const minRoi = Math.max(0, Number(state.settings.minRoi || 0))/100;
    const maxByProfit = isCostCovering ? cmFloorMoney(netBeforeBuy-minProfit) : 0;
    const maxByRoi = isCostCovering ? cmFloorMoney(minRoi > 0 ? netBeforeBuy/(1+minRoi) : netBeforeBuy) : 0;
    const maxBuy = recommendedSell > 0 ? cmFloorMoney(Math.min(maxByProfit,maxByRoi)) : 0;
    const profitAtMarket = marketBuy > 0 ? netBeforeBuy-marketBuy : 0;
    const roiAtMarket = marketBuy > 0 ? profitAtMarket/marketBuy*100 : 0;
    const marginOnSell = safeSell > 0 ? profitAtMarket/safeSell*100 : 0;

    // Nur echte gespeicherte Tagesstände werden als Preisentwicklung gewertet.
    // Trend minus 7-/30-Tage-Durchschnitt ist ein Preisabstand, aber kein historischer Delta-Wert.
    const dailyChange = cmNumber(trendSignals.delta1 ?? product.dailyChange);
    const change7 = cmNumber(trendSignals.delta7);
    const change30 = cmNumber(trendSignals.delta30);
    const reference7 = trend !== null && avg7 !== null ? trend-avg7 : null;
    const reference30 = trend !== null && avg30 !== null ? trend-avg30 : null;
    const dailyPct = dailyChange !== null && trend ? dailyChange/Math.abs(trend)*100 : null;
    const change7Pct = change7 !== null && trend ? change7/Math.abs(trend)*100 : null;
    const change30Pct = change30 !== null && trend ? change30/Math.abs(trend)*100 : null;

    const quality = cmProductQuality(product);
    const realTrendCount = [dailyChange,change7,change30].filter(value => value !== null).length;
    const stockFull = Number(state.settings.targetStock || 0) > 0 && Number(own.available || 0) >= Number(state.settings.targetStock || 0);
    const meetsProfit = marketBuy > 0 && profitAtMarket >= minProfit;
    const meetsRoi = marketBuy > 0 && roiAtMarket >= minRoi*100;
    const eligible = maxBuy > 0 && marketBuy > 0 && marketBuy <= maxBuy && meetsProfit && meetsRoi;

    let score = null;
    let scoreConfidence = "keine";
    const scoreReasons = [];
    if (hasPriceData) {
      score = 0;
      // Wirtschaftlichkeit: bis 60 Punkte, aber nur wenn ein positiver Max-EK möglich ist.
      if (marketBuy > 0 && maxBuy > 0) {
        const buyFit = cmClamp((maxBuy/marketBuy - 0.70) / 0.55, 0, 1);
        score += buyFit * 38;
        const roiFit = cmClamp((roiAtMarket - minRoi*100) / 80 + 0.35, 0, 1);
        score += roiFit * 12;
        const profitBase = Math.max(minProfit,0.10);
        const profitFit = cmClamp((profitAtMarket-minProfit)/(profitBase*2)+0.35,0,1);
        score += profitFit * 10;
      } else {
        scoreReasons.push("Kein positiver Max-EK mit den aktuellen Regeln");
      }

      // Echte Historie: bis 20 Punkte. Fehlende Historie erzeugt keine erfundenen Trendpunkte.
      const trendParts = [[dailyPct,8],[change7Pct,7],[change30Pct,5]];
      for (const [value,weight] of trendParts) {
        if (value === null) continue;
        score += cmClamp((value+8)/16,0,1)*weight;
      }
      if (!realTrendCount) scoreReasons.push("Noch keine echte Preisverlaufshistorie");

      // Bestandsbedarf und Datenqualität: bis 20 Punkte.
      score += stockFull ? 0 : 8;
      score += pricePointCount/5*6;
      score += quality.exactVariant ? 4 : 0;
      score += quality.hasGermanName ? 2 : 0;

      // Harte Obergrenzen verhindern hohe Scores bei unvollständiger oder wirtschaftlich unbrauchbarer Datenbasis.
      let scoreCap = 100;
      if (!isCostCovering) {
        score = 0;
        scoreCap = 0;
        scoreReasons.push(`Nicht kostendeckend: ${money(costShortfall)} fehlen bereits vor dem Karteneinkauf`);
      } else if (profitAtMarket < 0) {
        scoreCap = Math.min(scoreCap,5);
        scoreReasons.push("Verlust bereits beim aktuellen Cardmarket Low");
      } else if (maxBuy <= 0) {
        scoreCap = Math.min(scoreCap,20);
      }
      if (!realTrendCount) scoreCap = Math.min(scoreCap,55);
      if (!quality.exactVariant) scoreCap = Math.min(scoreCap,75);
      if (pricePointCount < 3) scoreCap = Math.min(scoreCap,45);
      score = Math.round(cmClamp(score,0,scoreCap));

      if (pricePointCount >= 4 && realTrendCount >= 2 && quality.exactVariant) scoreConfidence = "hoch";
      else if (pricePointCount >= 3 && realTrendCount >= 1) scoreConfidence = "mittel";
      else scoreConfidence = "niedrig";
    }

    let recommendation = "KEINE PREISDATEN";
    let recommendationReason = "Für diese Produkt-ID wurden noch keine Preiswerte importiert.";
    if (hasPriceData) {
      const falling = [dailyPct,change7Pct,change30Pct].filter(value=>value!==null).length >= 2
        && [dailyPct,change7Pct,change30Pct].filter(value=>value!==null).every(value=>value < -4);
      if (marketBuy <= 0) {
        recommendation = "KEIN EK-PREIS";
        recommendationReason = "Es gibt Preisreferenzen, aber keinen nutzbaren Einkaufspreis.";
      } else if (!isCostCovering) {
        recommendation = "NICHT KOSTENDECKEND";
        recommendationReason = `Der Sicherheits-VK deckt Gebühren und Verpackung nicht. Bereits vor dem Karteneinkauf fehlen ${money(costShortfall)}.`;
      } else if (stockFull) {
        recommendation = "BESTAND VOLL";
        recommendationReason = "Der eingestellte Zielbestand ist bereits erreicht.";
      } else if (falling) {
        recommendation = "FALLEND";
        recommendationReason = "Mehrere echte Preiszeiträume zeigen eine fallende Entwicklung.";
      } else if (maxBuy <= 0) {
        recommendation = "MINDESTZIEL VERFEHLT";
        recommendationReason = `Der erwartete Nettoerlös reicht nicht für ${money(minProfit)} Mindestgewinn und ${Number(state.settings.minRoi||0)} % Mindest-ROI.`;
      } else if (eligible && marketBuy <= maxBuy*0.85) {
        recommendation = "TOP DEAL";
        recommendationReason = "Markt-Low liegt deutlich unter dem berechneten Max-EK und erfüllt Gewinn sowie ROI.";
      } else if (eligible) {
        recommendation = "KAUFEN";
        recommendationReason = "Markt-Low liegt innerhalb des berechneten Max-EK und erfüllt Gewinn sowie ROI.";
      } else if (marketBuy <= maxBuy*1.08) {
        recommendation = "BEOBACHTEN";
        recommendationReason = "Der Marktpreis liegt knapp über dem berechneten Einkaufslimit.";
      } else {
        recommendation = "NICHT KAUFEN";
        recommendationReason = !meetsProfit
          ? `Der mögliche Gewinn ${money(profitAtMarket)} liegt unter dem Mindestgewinn ${money(minProfit)}.`
          : !meetsRoi
            ? `Der mögliche ROI ${pct(roiAtMarket)} liegt unter dem Mindest-ROI ${Number(state.settings.minRoi||0)} %.`
            : "Der Marktpreis liegt über dem berechneten Einkaufslimit.";
      }
    }

    return {
      hasPriceData, pricePointCount, marketBuy, marketBuySource, recommendedSell, safeSell, feeAmount,
      netBeforeBuy, isCostCovering, costShortfall, maxByProfit, maxByRoi, maxBuy,
      profitAtMarket, roiAtMarket, marginOnSell,
      dailyChange, change7, change30, reference7, reference30,
      dailyPct, change7Pct, change30Pct,
      score, scoreConfidence, scoreReasons, recommendation, recommendationReason,
      quality, eligible, meetsProfit, meetsRoi, minProfit, minRoi,
      low, trend, avg1, avg7, avg30
    };
  }

  function cmRecommendationBadge(value) {
    const good = ["TOP DEAL","KAUFEN"];
    const warn = ["BEOBACHTEN","BESTAND VOLL"];
    const bad = ["NICHT KAUFEN","FALLEND","MINDESTZIEL VERFEHLT","KEIN EK-PREIS","NICHT KOSTENDECKEND"];
    const cls = good.includes(value) ? "green" : warn.includes(value) ? "yellow" : bad.includes(value) ? "red" : "blue";
    return `<span class="badge ${cls}">${escapeHtml(value)}</span>`;
  }

  function cmScoreLabel(calc) {
    if (calc.score === null || calc.score === undefined) return "Score –";
    return `Score ${calc.score}/100 · Datenbasis ${calc.scoreConfidence}`;
  }

  function cmSignedMoney(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "-";
    const number = Number(value);
    const sign = number > 0 ? "+" : "";
    const cls = number > 0 ? "money-positive" : number < 0 ? "money-negative" : "";
    return `<span class="${cls}">${sign}${money(number)}</span>`;
  }

  function cmProductSubtitle(product) {
    const setText = String(product.setName || product.set || "").trim();
    const setPart = setText
      ? setText
      : product.expansionId
        ? `Setname fehlt (Expansion-ID ${product.expansionId})`
        : "Setname fehlt";
    const versionText = [product.variant, product.rarity].filter(Boolean).join(" · ");
    const versionPart = versionText || "Seltenheit/Version fehlt";
    return `${escapeHtml(setPart)} · ${escapeHtml(versionPart)} · CM ${escapeHtml(product.productId)}`;
  }

  function cmDataQualityBadges(product, calc) {
    const badges = [];
    badges.push(calc.hasPriceData
      ? `<span class="cm-quality-badge good">PREISDATEN ${calc.pricePointCount}/5</span>`
      : `<span class="cm-quality-badge bad">KEINE PREISDATEN</span>`);
    badges.push(calc.quality.exactVariant
      ? `<span class="cm-quality-badge good">DRUCKVARIANTE VOLLSTÄNDIG</span>`
      : `<span class="cm-quality-badge warn">${escapeHtml(calc.quality.label.toUpperCase())}</span>`);
    if (!calc.quality.hasGermanName) badges.push(`<span class="cm-quality-badge warn">DEUTSCHER NAME FEHLT</span>`);
    return `<div class="cm-quality-badges">${badges.join("")}</div>`;
  }

  function cmSearchRank(product, query) {
    const german = cmNormalize(cmGermanName(product));
    const base = cmNormalize(product.name || product.baseName || "");
    const official = cmNormalize(product.officialName || "");
    if (german === query || base === query || official === query) return 0;
    if (german.startsWith(query) || base.startsWith(query) || official.startsWith(query)) return 1;
    if (german.includes(query) || base.includes(query) || official.includes(query)) return 2;
    return 3;
  }

  async function cmRenderSearchNow() {
    const output = document.getElementById("cmSearchResults");
    const summary = document.getElementById("cmSearchSummary");
    if (!output) return;
    const queryRaw = String(document.getElementById("cmSearch")?.value || "").trim();
    const query = cmNormalize(queryRaw);
    if (query.length < 2) {
      output.innerHTML = `<tr><td colspan="10" class="empty">Mindestens zwei Zeichen eingeben. Danach werden alle passenden Kartenvarianten aus dem importierten Gesamtkatalog angezeigt.</td></tr>`;
      if (summary) summary.textContent = "";
      return;
    }
    const token = ++cmRenderToken;
    output.innerHTML = `<tr><td colspan="10" class="empty">Gesamtkatalog wird durchsucht …</td></tr>`;
    try {
      const all = await cmLoadMergedCache();
      if (token !== cmRenderToken) return;
      const queryVariants = typeof cmAnalysisQueryVariants === "function" ? cmAnalysisQueryVariants(queryRaw) : [query];
      const rankedMatches = [];
      for (const product of all) {
        const rank = typeof cmAnalysisMatchRank === "function" ? cmAnalysisMatchRank(product,queryVariants) : cmSearchRank(product,query);
        if (rank === 999) continue;
        rankedMatches.push({product,rank});
      }
      rankedMatches.sort((a,b) => a.rank-b.rank || String(cmDisplayName(a.product)).localeCompare(String(cmDisplayName(b.product)),"de") || String(a.product.productId).localeCompare(String(b.product.productId)));
      const matches = rankedMatches.map(entry=>entry.product);
      const visible = typeof cmDiversifiedProducts === "function" ? cmDiversifiedProducts(matches,80) : matches.slice(0,80);
      const ownMap = cmBuildOwnStats();
      if (summary) summary.textContent = `${matches.length.toLocaleString("de-DE")} Varianten gefunden${matches.length>visible.length?` · erste ${visible.length} angezeigt`:""}`;
      output.innerHTML = visible.length ? visible.map(product => {
        const own = ownMap.get(String(product.productId)) || {};
        const calc = cmMarketCalculation(product, own);
        return `<tr>
          <td><strong>${escapeHtml(cmDisplayName(product))}</strong>${cmEnglishName(product) && cmNormalize(cmEnglishName(product)) !== cmNormalize(cmDisplayName(product)) ? `<br><small>Englisch: ${escapeHtml(cmEnglishName(product))}</small>` : ""}<br><small>${cmProductSubtitle(product)}</small></td>
          <td>${calc.marketBuy ? money(calc.marketBuy) : "-"}<br><small>Trend ${calc.trend !== null ? money(calc.trend) : "-"}</small></td>
          <td>${cmSignedMoney(calc.dailyChange)}${product.previousDate ? `<br><small>seit ${fmtDate(product.previousDate)}</small>` : ""}</td>
          <td>${cmSignedMoney(calc.reference7)}<br><small>Trend minus Ø 7</small></td>
          <td>${cmSignedMoney(calc.reference30)}<br><small>Trend minus Ø 30</small></td>
          <td>${calc.recommendedSell ? money(calc.recommendedSell) : "-"}</td>
          <td><strong>${calc.maxBuy ? money(calc.maxBuy) : "-"}</strong></td>
          <td>${calc.marketBuy ? `<span class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${money(calc.profitAtMarket)}</span><br><small>${pct(calc.roiAtMarket)} ROI</small>` : "-"}</td>
          <td>${Number(own.inventory || 0)} / ${Number(own.reserved || 0)}<br><small>${Number(own.available || 0)} verfügbar</small></td>
          <td>${cmRecommendationBadge(calc.recommendation)}<br><small>${escapeHtml(cmScoreLabel(calc))}</small><div class="row-actions cm-row-actions"><button class="icon-button" data-cm-details="${escapeHtml(product.productId)}">Details</button><button class="icon-button" data-cm-add-watch="${escapeHtml(product.productId)}">+ Watchlist</button></div></td>
        </tr>`;
      }).join("") : `<tr><td colspan="10" class="empty">Keine passende Kartenvariante gefunden.</td></tr>`;
    } catch (error) {
      output.innerHTML = `<tr><td colspan="10" class="empty money-negative">${escapeHtml(error.message)}</td></tr>`;
    }
  }

  function cmScheduleSearch() {
    clearTimeout(cmSearchTimer);
    cmSearchTimer = setTimeout(cmRenderSearchNow, 180);
  }

  async function cmGetHistory(productId) {
    if (window.desktopApp?.getMarketHistory) {
      try {
        const rows = await window.desktopApp.getMarketHistory({productId:String(productId),limit:1200});
        if (Array.isArray(rows) && rows.length) return rows;
      } catch (error) {
        console.error("SQLite-Preishistorie konnte nicht gelesen werden:", error);
      }
    }
    const db = await cmOpenDb();
    const tx = db.transaction("priceHistory", "readonly");
    const index = tx.objectStore("priceHistory").index("productId");
    const rows = await cmRequest(index.getAll(String(productId)));
    return rows.sort((a,b) => String(a.date).localeCompare(String(b.date)));
  }

  function cmHistoryChange(history, days, currentTrend, fallbackAverage) {
    if (!history.length || currentTrend === null) return fallbackAverage !== null ? currentTrend-fallbackAverage : null;
    const latestDate = new Date(`${history.at(-1).date}T12:00:00`);
    const target = new Date(latestDate);
    target.setDate(target.getDate()-days);
    let candidate = null;
    for (const row of history) {
      const d = new Date(`${row.date}T12:00:00`);
      if (d <= target && cmNumber(row.trend) !== null) candidate = row;
    }
    if (!candidate) return fallbackAverage !== null ? currentTrend-fallbackAverage : null;
    return currentTrend-cmNumber(candidate.trend);
  }

  function cmHistorySvg(history) {
    const values = history.map(row => ({date:row.date,value:cmNumber(row.trend) ?? cmNumber(row.low)})).filter(row => row.value !== null).slice(-40);
    if (!values.length) return `<div class="empty">Noch keine Verlaufswerte vorhanden.</div>`;
    const width=760, height=210, pad=28;
    const min=Math.min(...values.map(v=>v.value));
    const max=Math.max(...values.map(v=>v.value));
    const span=max-min || Math.max(1,max||1);
    const points=values.map((entry,index)=>{
      const x=pad+(values.length===1?0.5:index/(values.length-1))*(width-pad*2);
      const y=height-pad-(entry.value-min)/span*(height-pad*2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `<div class="cm-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trendpreis-Verlauf"><line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" class="cm-chart-axis"/><line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}" class="cm-chart-axis"/><polyline points="${points}" class="cm-chart-line"/><text x="${pad}" y="18">${escapeHtml(money(max))}</text><text x="${pad}" y="${height-6}">${escapeHtml(money(min))}</text></svg><div class="cm-chart-labels"><span>${fmtDate(values[0].date)}</span><span>${fmtDate(values.at(-1).date)}</span></div></div>`;
  }

  async function cmShowProductDetails(productId) {
    const panel = document.getElementById("cmProductDetails");
    if (!panel) return;
    panel.innerHTML = `<div class="empty">Produktdetails werden geladen …</div>`;
    panel.scrollIntoView({behavior:"smooth",block:"start"});
    try {
      await cmLoadMergedCache();
      const product = cmProductByIdCache?.get(String(productId));
      const latest = cmLatestByIdCache?.get(String(productId)) || {};
      if (!product) throw new Error("Produkt wurde nicht gefunden.");
      const merged = {...product,...latest};
      const history = await cmGetHistory(productId);
      const own = cmBuildOwnStats().get(String(productId)) || {};
      const delta1 = cmHistoryDeltaInfo(history,1,merged.trend,merged.dailyChange,merged.previousDate);
      const delta7 = cmHistoryDeltaInfo(history,7,merged.trend);
      const delta30 = cmHistoryDeltaInfo(history,30,merged.trend);
      const delta90 = cmHistoryDeltaInfo(history,90,merged.trend);
      const calc = cmMarketCalculation(merged, own, {delta1:delta1.value,delta7:delta7.value,delta30:delta30.value});
      const rows = [...history].reverse().slice(0,40).map(row => `<tr><td>${fmtDate(row.date)}</td><td>${row.low !== null ? money(row.low) : "-"}</td><td>${row.trend !== null ? money(row.trend) : "-"}</td><td>${row.avg1 !== null ? money(row.avg1) : "-"}</td><td>${row.avg7 !== null ? money(row.avg7) : "-"}</td><td>${row.avg30 !== null ? money(row.avg30) : "-"}</td></tr>`).join("");
      panel.innerHTML = `<div class="panel-head"><div><h2>${escapeHtml(cmDisplayName(product))}</h2>${cmEnglishName(product) && cmNormalize(cmEnglishName(product)) !== cmNormalize(cmDisplayName(product)) ? `<p class="cm-english-name">Englisch: ${escapeHtml(cmEnglishName(product))}</p>` : ""}<p class="muted">${cmProductSubtitle(product)}</p>${cmDataQualityBadges(product,calc)}</div><div class="row-actions"><a class="secondary button-link" href="${escapeHtml(cardmarketUrl(product))}" target="_blank" rel="noopener noreferrer">Cardmarket öffnen ↗</a><button class="primary" data-cm-add-watch="${escapeHtml(productId)}">Zur Watchlist</button></div></div>
        <div class="cm-detail-metrics">
          <div><span>Cardmarket Low</span><strong>${calc.low !== null ? money(calc.low) : "-"}</strong></div>
          <div><span>Cardmarket Trend</span><strong>${calc.trend !== null ? money(calc.trend) : "-"}</strong></div>
          <div><span>Δ 1 Tag</span><strong>${delta1.value===null?"–":cmSignedMoney(delta1.value)}</strong><small>${delta1.sourceDate?`gegen ${fmtDate(delta1.sourceDate)}`:escapeHtml(delta1.reason||"")}</small></div>
          <div><span>Δ 7 Tage</span><strong>${delta7.value===null?"–":cmSignedMoney(delta7.value)}</strong><small>${delta7.sourceDate?`gegen ${fmtDate(delta7.sourceDate)}`:escapeHtml(delta7.reason||"")}</small></div>
          <div><span>Δ 30 Tage</span><strong>${delta30.value===null?"–":cmSignedMoney(delta30.value)}</strong><small>${delta30.sourceDate?`gegen ${fmtDate(delta30.sourceDate)}`:escapeHtml(delta30.reason||"")}</small></div>
          <div><span>Δ 90 Tage</span><strong>${delta90.value===null?"–":cmSignedMoney(delta90.value)}</strong><small>${delta90.sourceDate?`gegen ${fmtDate(delta90.sourceDate)}`:escapeHtml(delta90.reason||"")}</small></div>
          <div><span>Empfohlener VK</span><strong>${calc.recommendedSell ? money(calc.recommendedSell) : "-"}</strong></div>
          <div><span>Empfohlener Max-EK</span><strong>${cmAnalysisMoney(calc.maxBuy)}</strong></div>
          <div><span>Gewinn bei Cardmarket Low</span><strong class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${calc.marketBuy ? money(calc.profitAtMarket) : "-"}</strong></div>
          <div><span>ROI bei Cardmarket Low</span><strong>${calc.marketBuy ? pct(calc.roiAtMarket) : "-"}</strong></div>
          <div><span>Eigener Ø EK</span><strong>${own.avgBuy ? money(own.avgBuy) : "-"}</strong></div>
          <div><span>Eigener Ø VK</span><strong>${own.avgSell ? money(own.avgSell) : "-"}</strong></div>
          <div><span>Bestand / reserviert</span><strong>${Number(own.inventory||0)} / ${Number(own.reserved||0)}</strong></div>
        </div>
        <div class="cm-decision-box"><div><span class="muted">Einkaufsempfehlung</span><br>${cmRecommendationBadge(calc.recommendation)}</div><div><span class="muted">Analysescore</span><br><strong>${escapeHtml(cmScoreLabel(calc))}</strong></div><p><strong>${escapeHtml(calc.recommendationReason)}</strong><br>Der Score verwendet nur echte gespeicherte Preisverläufe. Bei fehlender Historie oder unvollständiger Druckvariante wird er sichtbar begrenzt.</p></div>
        ${cmHistorySvg(history)}
        <details class="cm-history-table"><summary>Gespeicherte Tagesstände (${history.length})</summary><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Low</th><th>Trend</th><th>Ø 1 Tag</th><th>Ø 7 Tage</th><th>Ø 30 Tage</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="empty">Noch keine Preisstände</td></tr>'}</tbody></table></div></details>`;
    } catch (error) {
      panel.innerHTML = `<div class="empty money-negative">${escapeHtml(error.message)}</div>`;
    }
  }

  async function cmAddToWatchlist(productId) {
    await cmLoadMergedCache();
    const product = cmProductByIdCache?.get(String(productId));
    const price = cmLatestByIdCache?.get(String(productId)) || {};
    if (!product) return alert("Produkt nicht gefunden.");
    if (state.watchlist.some(w => !w.archived && cleanProductId(w.productId) === String(productId))) return alert("Diese Kartenvariante ist bereits auf der Watchlist.");
    const calc = cmMarketCalculation({...product,...price},{});
    state.watchlist.push({
      id:uid(), priority:"B", productId:String(productId),
      name:cmDisplayName(product), englishName:cmEnglishName(product), set:product.set || (product.expansionId ? `Expansion ${product.expansionId}` : ""),
      version:[product.variant,product.rarity].filter(Boolean).join(" – "), stock:0,
      target:Number(state.settings.targetStock || 0), maxBuy:Number(calc.maxBuy || 0),
      targetSell:Number(calc.recommendedSell || 0), currentBuy:price.low ?? "",
      low:price.low ?? "", trend:price.trend ?? "", avg1:price.avg1 ?? "",
      avg7:price.avg7 ?? "", avg30:price.avg30 ?? "", reprint:"", banlist:"",
      priceDate:price.date || "", productUrl:product.productUrl || ""
    });
    saveState();
    renderAll();
    alert("Kartenvariante wurde zur Watchlist hinzugefügt.");
  }

  async function cmRenderOpportunities() {
    const output = document.getElementById("cmOpportunityList");
    if (!output) return;
    if (!state.cardmarket?.priceDate) {
      output.innerHTML = `<div class="empty">Zuerst Produktkatalog und Price Guide importieren.</div>`;
      return;
    }
    const key = [state.cardmarket.priceDate,state.cardmarket.priceImportedAt,state.settings.feePercent,state.settings.packaging,state.settings.minProfit,state.settings.minRoi,state.settings.safetyPercent,state.inventory.length].join("|");
    if (cmOpportunityCache.key !== key) {
      output.innerHTML = `<div class="empty">Marktchancen werden berechnet …</div>`;
      const all = await cmLoadMergedCache();
      const ownMap = cmBuildOwnStats();
      const candidates = [];
      for (const product of all) {
        if (!product.low && !product.trend) continue;
        const own = ownMap.get(String(product.productId)) || {};
        const calc = cmMarketCalculation(product,own);
        if (!["TOP DEAL","KAUFEN","BEOBACHTEN"].includes(calc.recommendation)) continue;
        candidates.push({product,own,calc});
      }
      candidates.sort((a,b) => Number(b.calc.score||0)-Number(a.calc.score||0) || b.calc.profitAtMarket-a.calc.profitAtMarket);
      cmOpportunityCache = {key,rows:candidates.slice(0,12)};
    }
    const rows = cmOpportunityCache.rows;
    output.innerHTML = rows.length ? `<div class="cm-opportunity-grid">${rows.map(({product,own,calc}) => `<article class="cm-opportunity-card"><div><strong>${escapeHtml(cmDisplayName(product))}</strong>${cmEnglishName(product) && cmNormalize(cmEnglishName(product)) !== cmNormalize(cmDisplayName(product)) ? `<br><small>Englisch: ${escapeHtml(cmEnglishName(product))}</small>` : ""}<br><small>${cmProductSubtitle(product)}</small></div><div class="cm-opportunity-values"><span>Low <strong>${money(calc.marketBuy)}</strong></span><span>Max-EK <strong>${money(calc.maxBuy)}</strong></span><span>Gewinn <strong class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${money(calc.profitAtMarket)}</strong></span><span>Δ <strong>${cmSignedMoney(calc.dailyChange)}</strong></span></div><div class="cm-opportunity-footer">${cmRecommendationBadge(calc.recommendation)}<strong>${escapeHtml(cmScoreLabel(calc))}</strong><button class="icon-button" data-cm-details="${escapeHtml(product.productId)}">Prüfen</button></div></article>`).join("")}</div>` : `<div class="empty">Mit den aktuellen Grenzwerten wurden keine positiven Kaufchancen gefunden. Nach dem zweiten Tagesimport wird die Entwicklung aussagekräftiger.</div>`;
  }

  function cmYgoRows(payload) {
    return Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  }

  function cmYgoNameKeys(row={}) {
    const values = [row.name, row.beta_name];
    const miscRows = Array.isArray(row.misc_info) ? row.misc_info : [];
    miscRows.forEach(info => values.push(info?.beta_name, info?.treated_as));
    const keys = [];
    for (const value of values) {
      const key = cmNormalize(cmExtractIdentity(value || "").baseName);
      if (key && !keys.includes(key)) keys.push(key);
    }
    return keys;
  }

  function cmSetCodePrefix(value="") {
    const code = String(value || "").trim().toUpperCase();
    const match = code.match(/^([A-Z0-9]{2,8})-/);
    return match ? match[1] : code;
  }

  function cmBuildExpansionSetMap(products, cardByEnglishKey) {
    const cardsByExpansion = new Map();
    for (const product of products) {
      const expansionId = String(product.expansionId || "").trim();
      if (!expansionId) continue;
      const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
      const ygoCard = cardByEnglishKey.get(cmNormalize(englishBase));
      if (!ygoCard?.id || !Array.isArray(ygoCard.card_sets) || !ygoCard.card_sets.length) continue;
      if (!cardsByExpansion.has(expansionId)) cardsByExpansion.set(expansionId,new Map());
      cardsByExpansion.get(expansionId).set(String(ygoCard.id),ygoCard);
    }

    const result = new Map();
    for (const [expansionId,cardMap] of cardsByExpansion) {
      const cards=[...cardMap.values()];
      const candidates=new Map();
      for (const card of cards) {
        const seen=new Set();
        for (const row of card.card_sets || []) {
          const setName=String(row?.set_name || "").trim();
          const setCode=cmSetCodePrefix(row?.set_code);
          const key=cmNormalize(setName || setCode);
          if (!key || seen.has(key)) continue;
          seen.add(key);
          const current=candidates.get(key) || {setName,setCode,count:0,codeCounts:new Map()};
          current.count++;
          if (setCode) current.codeCounts.set(setCode,(current.codeCounts.get(setCode)||0)+1);
          candidates.set(key,current);
        }
      }
      const ranked=[...candidates.values()].sort((a,b)=>b.count-a.count || String(a.setName).localeCompare(String(b.setName)));
      if (!ranked.length) continue;
      const top=ranked[0];
      const second=ranked[1];
      const total=cards.length;
      const coverage=total ? top.count/total : 0;
      const dominant = total === 1
        ? ranked.length === 1
        : coverage >= 0.55 && (!second || top.count >= second.count + Math.max(1,Math.ceil(total*0.08)));
      if (!dominant) continue;
      const bestCode=[...top.codeCounts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0] || top.setCode || "";
      result.set(expansionId,{setName:top.setName,setCode:bestCode,coverage,matchedCards:top.count,totalCards:total});
    }
    return result;
  }

  async function cmApplyGermanNames(englishPayload, germanPayload, source="YGOPRODeck API") {
    const products = await cmGetAll("products");
    if (!products.length) throw new Error("Bitte zuerst den Cardmarket-Produktkatalog importieren.");
    const englishRows = cmYgoRows(englishPayload);
    const germanRows = cmYgoRows(germanPayload);
    if (!englishRows.length || !germanRows.length) throw new Error("Die englische oder deutsche Kartendatenbank enthält keine Karten.");

    const germanById = new Map(germanRows.map(row => [String(row.id || ""), String(row.name || "").trim()]).filter(([id,name]) => id && name));
    const cardByEnglishKey = new Map();
    for (const row of englishRows) {
      for (const key of cmYgoNameKeys(row)) {
        if (!cardByEnglishKey.has(key)) cardByEnglishKey.set(key,row);
      }
    }

    // Lokale Namen und bereits bekannte Produkt-/Metacard-Zuordnungen werden als zusätzliche,
    // aber nur bei Eindeutigkeit verwendete Quelle einbezogen. So gehen manuell gepflegte Namen
    // nicht verloren und vorhandene Übersetzungen werden auf alle Druckvarianten übertragen.
    const localMaps = cmBuildLocalGermanNameMaps(products);

    // Cardmarket liefert im Produktkatalog nur die Expansion-ID.
    // Über viele Karten einer Expansion wird deshalb ein dominantes YGOPRODeck-Set ermittelt.
    // Nur ausreichend eindeutige Zuordnungen werden übernommen; unsichere Treffer bleiben leer.
    const expansionSetMap = cmBuildExpansionSetMap(products,cardByEnglishKey);

    let matched = 0;
    let unchanged = 0;
    let verifiedFallbackCount = 0;
    let setDetailCount = 0;
    let setMappingCount = 0;
    let updated = products.map(product => {
      const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
      const englishKey = cmNormalize(englishBase);
      const ygoCard = cardByEnglishKey.get(englishKey);
      const apiGermanName = ygoCard ? germanById.get(String(ygoCard.id || "")) || "" : "";
      const verifiedGermanName = cmVerifiedGermanName(englishBase);
      const germanName = cmResolveGermanName(product,localMaps,apiGermanName);
      const patch = {};

      if (germanName) {
        patch.germanName = germanName;
        matched++;
        if (verifiedGermanName && cmNormalize(verifiedGermanName) === cmNormalize(germanName)) verifiedFallbackCount++;
      } else {
        unchanged++;
      }

      // Set und Seltenheit werden anhand der Expansion-ID ergänzt, aber nur bei dominanter Zuordnung.
      const ygoSets = Array.isArray(ygoCard?.card_sets) ? ygoCard.card_sets.filter(Boolean) : [];
      const mappedSet = expansionSetMap.get(String(product.expansionId || ""));
      if (mappedSet && (!product.set || !product.setName || !product.rarity)) {
        if (!product.setName && mappedSet.setName) patch.setName = mappedSet.setName;
        if (!product.set && mappedSet.setCode) { patch.set = mappedSet.setCode; patch.setCode = mappedSet.setCode; }
        const matchingRows=ygoSets.filter(row => {
          const nameMatches=mappedSet.setName && cmNormalize(row?.set_name)===cmNormalize(mappedSet.setName);
          const codeMatches=mappedSet.setCode && cmSetCodePrefix(row?.set_code)===mappedSet.setCode;
          return nameMatches || codeMatches;
        });
        const uniqueRarities=new Set(matchingRows.map(row=>String(row?.set_rarity||"").trim()).filter(Boolean));
        if (!product.rarity && uniqueRarities.size===1) patch.rarity=[...uniqueRarities][0];
        patch.setMatchConfidence=Number(mappedSet.coverage.toFixed(3));
        patch.setDataSource="Expansion-ID-Abgleich";
        if (patch.setName || patch.set || patch.rarity) { setDetailCount++; setMappingCount++; }
      } else if (!product.set && !product.setName && ygoSets.length===1) {
        const only=ygoSets[0];
        patch.setName=String(only.set_name||"").trim();
        patch.set=cmSetCodePrefix(only.set_code);
        patch.setCode=patch.set;
        if (!product.rarity) patch.rarity=String(only.set_rarity||"").trim();
        patch.setMatchConfidence=1;
        patch.setDataSource="Eindeutiger Kartendruck";
        if (patch.setName || patch.set || patch.rarity) setDetailCount++;
      }

      const merged = {...product,...patch};
      return {...merged,searchText:cmSearchTextForProduct(merged)};
    });

    // Alle Druckversionen derselben Metacard erhalten denselben deutschen Kartennamen,
    // aber nur wenn für die Metacard exakt eine eindeutige Übersetzung vorliegt.
    const metacardCandidates = new Map();
    for (const product of updated) {
      const metacardId = cleanProductId(product.metacardId);
      const germanName = cmGermanNameCandidate(product.germanName,product.officialBaseName || product.officialName || product.name);
      if (!metacardId || !germanName) continue;
      if (!metacardCandidates.has(metacardId)) metacardCandidates.set(metacardId,new Set());
      metacardCandidates.get(metacardId).add(germanName);
    }
    const germanByMetacard = new Map([...metacardCandidates].filter(([,names]) => names.size === 1).map(([id,names]) => [id,[...names][0]]));
    updated = updated.map(product => {
      if (cmGermanName(product)) return product;
      const propagated = germanByMetacard.get(cleanProductId(product.metacardId));
      if (!propagated) return product;
      const merged = {...product,germanName:propagated};
      matched++;
      unchanged=Math.max(0,unchanged-1);
      return {...merged,searchText:cmSearchTextForProduct(merged)};
    });

    cmSetProgress(`<strong>Deutsche Kartennamen werden lokal gespeichert …</strong><br>0 von ${updated.length.toLocaleString("de-DE")} Produkten`,0);
    await cmWriteRows("products",updated,(done,total)=>cmSetProgress(`<strong>Deutsche Kartennamen werden lokal gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,done/Math.max(1,total)*85));
    await cmSyncProductsToSqlite(updated,(done,total)=>cmSetProgress(`<strong>Deutsche Kartennamen werden in SQLite aktualisiert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,85+done/Math.max(1,total)*15));

    // Der kleine Kompatibilitätskatalog versorgt Bestand, Einkäufe und Verkäufe.
    // Nur bereits vorhandene Einträge werden aktualisiert, damit localStorage klein bleibt.
    for (const product of updated) {
      const productId = String(product.productId || "");
      if (!state.productCatalog?.[productId]) continue;
      state.productCatalog[productId] = {
        ...state.productCatalog[productId],
        germanName:product.germanName || state.productCatalog[productId].germanName || "",
        officialName:product.officialName || state.productCatalog[productId].officialName || "",
        officialBaseName:product.officialBaseName || state.productCatalog[productId].officialBaseName || "",
        metacardId:product.metacardId || state.productCatalog[productId].metacardId || ""
      };
    }

    const importedAt = new Date().toISOString();
    state.cardmarket = {
      ...CM_META_DEFAULTS,
      ...state.cardmarket,
      germanNamesImportedAt:importedAt,
      germanNameCount:matched,
      germanNameSource:source,
      germanNameRevision:CM_GERMAN_NAME_REVISION,
      germanNameVerifiedFallbackCount:verifiedFallbackCount,
      cardDataImportedAt:importedAt,
      setDetailCount,
      setMappingCount,
      lastError:""
    };
    state.imports.push({id:uid(),type:"names",key:`german-names-${Date.now()}`,file:source,date:importedAt,rows:englishRows.length,cards:matched,unmatched:unchanged,verifiedFallbacks:verifiedFallbackCount,setDetails:setDetailCount,setMappings:setMappingCount});
    cmInvalidateCache();
    saveState();
    renderAll();
    cmSetProgress(`<strong>Deutsche Kartendaten gespeichert</strong><br>${matched.toLocaleString("de-DE")} Namen zugeordnet${verifiedFallbackCount?` · ${verifiedFallbackCount.toLocaleString("de-DE")} verifizierte Ergänzungen`:""}${setDetailCount?` · ${setDetailCount.toLocaleString("de-DE")} Set-/Seltenheitsdetails ergänzt`:""}.`,100,"success");
    return {matched,unmatched:unchanged,verifiedFallbackCount,setDetailCount,setMappingCount};
  }

  async function cmRepairKnownGermanNames() {
    if (Number(state.cardmarket?.productCount || 0) <= 0) return {changed:0};
    if (Number(state.cardmarket?.germanNameRevision || 0) >= CM_GERMAN_NAME_REVISION) return {changed:0};

    const products = await cmGetAll("products");
    if (!products.length) return {changed:0};
    const localMaps = cmBuildLocalGermanNameMaps(products);
    let verifiedFallbackCount = 0;
    let updated = products.map(product => {
      const resolved = cmResolveGermanName(product,localMaps,"");
      const verified = cmVerifiedGermanName(product.officialBaseName || product.officialName || product.name || "");
      if (verified && resolved && cmNormalize(verified) === cmNormalize(resolved)) verifiedFallbackCount++;
      if (!resolved || cmNormalize(resolved) === cmNormalize(product.germanName || "")) return product;
      const merged = {...product,germanName:resolved,updatedAt:new Date().toISOString()};
      return {...merged,searchText:cmSearchTextForProduct(merged)};
    });

    const metacardCandidates = new Map();
    for (const product of updated) {
      const metacardId = cleanProductId(product.metacardId);
      const germanName = cmGermanNameCandidate(product.germanName,product.officialBaseName || product.officialName || product.name);
      if (!metacardId || !germanName) continue;
      if (!metacardCandidates.has(metacardId)) metacardCandidates.set(metacardId,new Set());
      metacardCandidates.get(metacardId).add(germanName);
    }
    const germanByMetacard = new Map([...metacardCandidates].filter(([,names]) => names.size === 1).map(([id,names]) => [id,[...names][0]]));
    updated = updated.map(product => {
      if (cmGermanName(product)) return product;
      const propagated = germanByMetacard.get(cleanProductId(product.metacardId));
      if (!propagated) return product;
      const merged = {...product,germanName:propagated,updatedAt:new Date().toISOString()};
      return {...merged,searchText:cmSearchTextForProduct(merged)};
    });

    const changedRows = updated.filter((product,index) => {
      const original = products[index];
      return cmNormalize(product.germanName || "") !== cmNormalize(original.germanName || "")
        || product.searchText !== original.searchText;
    });

    if (changedRows.length) {
      await cmWriteRows("products",changedRows);
      await cmSyncProductsToSqlite(changedRows);
      for (const product of changedRows) {
        const productId = String(product.productId || "");
        if (!state.productCatalog?.[productId]) continue;
        state.productCatalog[productId] = {
          ...state.productCatalog[productId],
          germanName:product.germanName || state.productCatalog[productId].germanName || "",
          officialName:product.officialName || state.productCatalog[productId].officialName || "",
          officialBaseName:product.officialBaseName || state.productCatalog[productId].officialBaseName || "",
          metacardId:product.metacardId || state.productCatalog[productId].metacardId || ""
        };
      }
      cmInvalidateCache();
    }

    const germanNameCount = updated.reduce((sum,product) => sum + (cmGermanName(product) ? 1 : 0),0);
    state.cardmarket = {
      ...CM_META_DEFAULTS,
      ...state.cardmarket,
      germanNameRevision:CM_GERMAN_NAME_REVISION,
      germanNameCount,
      germanNameVerifiedFallbackCount:verifiedFallbackCount,
      lastError:""
    };
    saveState();
    if (changedRows.length) renderAll();
    return {changed:changedRows.length,germanNameCount,verifiedFallbackCount};
  }

  async function cmLoadGermanNamesOnline() {
    if (Number(state.cardmarket?.productCount || 0) <= 0) throw new Error("Bitte zuerst den Cardmarket-Produktkatalog importieren.");
    cmSetProgress("<strong>Deutsche Kartendaten werden geladen …</strong><br>Namen, Sets und Seltenheiten werden erneut abgeglichen.",8);
    const [englishResponse,germanResponse] = await Promise.all([
      fetch(YGOPRO_EN_URL,{cache:"no-store"}),
      fetch(YGOPRO_DE_URL,{cache:"no-store"})
    ]);
    if (!englishResponse.ok) throw new Error(`Englische Kartendatenbank konnte nicht geladen werden (${englishResponse.status}).`);
    if (!germanResponse.ok) throw new Error(`Deutsche Kartendatenbank konnte nicht geladen werden (${germanResponse.status}).`);
    cmSetProgress("<strong>Kartendaten werden abgeglichen …</strong><br>Namen werden nach Karten-ID verbunden; Sets zusätzlich vorsichtig über die Expansion-ID zugeordnet.",20);
    return cmApplyGermanNames(await englishResponse.json(),await germanResponse.json(),"YGOPRODeck API v7 (DE/EN)");
  }

  function cmSignedPercent(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "–";
    return `${number > 0 ? "+" : ""}${number.toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1})} %`;
  }

  function cmMoverTable(rows, kind="gain") {
    if (!Array.isArray(rows) || !rows.length) return `<div class="empty">Für diesen Zeitraum gibt es noch keine vergleichbaren Tagesstände.</div>`;
    const body = rows.map(row => {
      const productId=String(row.productId||"");
      const subtitle=[row.setCode||row.setName||"Set unbekannt",row.rarity||"Seltenheit unbekannt",`CM ${productId}`].filter(Boolean).join(" · ");
      const className=Number(row.changeValue||0)>=0?"money-positive":"money-negative";
      return `<tr><td><strong>${escapeHtml(row.name||`CM ${productId}`)}</strong><br><small>${escapeHtml(subtitle)}</small></td><td>${money(row.previousTrend)}</td><td>${money(row.currentTrend)}</td><td class="${className}"><strong>${cmSignedMoney(row.changeValue)}</strong><br><small>${cmSignedPercent(row.changePercent)}</small></td><td><button class="icon-button" data-cm-details="${escapeHtml(productId)}">Details</button></td></tr>`;
    }).join("");
    return `<table class="cm-movers-table"><thead><tr><th>Karte</th><th>Vorher</th><th>Aktuell</th><th>Veränderung</th><th></th></tr></thead><tbody>${body}</tbody></table>`;
  }

  async function cmRenderSqliteHistoryOverview() {
    const status=document.getElementById("cmHistoryOverviewStatus");
    const summary=document.getElementById("cmHistoryOverviewSummary");
    const gainers=document.getElementById("cmHistoryGainers");
    const losers=document.getElementById("cmHistoryLosers");
    if(!status||!summary||!gainers||!losers)return;
    const token=++cmHistoryOverviewToken;
    if(!window.desktopApp?.getMarketOverview){
      status.textContent="Historische SQLite-Auswertung ist nur in der Desktop-App verfügbar.";
      return;
    }
    const days=Number(document.getElementById("cmHistoryPeriod")?.value||30);
    status.textContent="Historische Tagesstände werden verglichen …";
    try{
      const result=await window.desktopApp.getMarketOverview({days,limit:12,minTrend:0.05});
      if(token!==cmHistoryOverviewToken)return;
      const firstDate=result.firstDate?fmtDate(result.firstDate):"–";
      const targetDate=result.targetDate?fmtDate(result.targetDate):"–";
      const latestDate=result.latestDate?fmtDate(result.latestDate):"–";
      document.getElementById("cmHistoryFirstDate").textContent=firstDate;
      document.getElementById("cmSqlitePriceRows").textContent=Number(result.totalPriceRows||0).toLocaleString("de-DE");
      document.getElementById("cmHistoryCoverageStatus").textContent=result.snapshotCount?`${Number(result.snapshotCount).toLocaleString("de-DE")} Tagesstände bis ${latestDate}`:"Noch keine Tagesstände";
      summary.innerHTML=`<div><span>Erster Preisstand</span><strong>${firstDate}</strong></div><div><span>Vergleichstag</span><strong>${targetDate}</strong></div><div><span>Aktueller Preisstand</span><strong>${latestDate}</strong></div><div><span>Tatsächlicher Abstand</span><strong>${Number(result.actualDays||0)} Tage</strong></div><div><span>Verglichene Varianten</span><strong>${Number(result.comparedCount||0).toLocaleString("de-DE")}</strong></div><div><span>Varianten im letzten Stand</span><strong>${Number(result.latestProductCount||0).toLocaleString("de-DE")}</strong></div>`;
      if(!result.targetDate){
        status.textContent=`Für einen ${days}-Tage-Vergleich fehlen noch ältere Preisstände. Tägliche Importe sammeln die benötigte Historie automatisch.`;
      }else{
        status.textContent=`Trendpreise vom ${targetDate} werden mit ${latestDate} verglichen. Tatsächlicher Abstand: ${Number(result.actualDays||0)} Tage.`;
      }
      gainers.innerHTML=cmMoverTable(result.gainers,"gain");
      losers.innerHTML=cmMoverTable(result.losers,"loss");
    }catch(error){
      if(token!==cmHistoryOverviewToken)return;
      status.textContent=`SQLite-Auswertung konnte nicht geladen werden: ${error.message}`;
      summary.innerHTML="";
      gainers.innerHTML='<div class="empty money-negative">Auswertung nicht verfügbar.</div>';
      losers.innerHTML='<div class="empty money-negative">Auswertung nicht verfügbar.</div>';
    }
  }

  function renderCardmarketDataCenter() {
    const meta = {...CM_META_DEFAULTS,...(state.cardmarket || {})};
    const setText = (id,value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
    setText("cmProductCount", Number(meta.productCount || 0).toLocaleString("de-DE"));
    setText("cmLatestPriceCount", Number(meta.priceRowCount || 0).toLocaleString("de-DE"));
    setText("cmSnapshotCount", Number(meta.sqliteSnapshotCount || meta.snapshotDates?.length || 0).toLocaleString("de-DE"));
    setText("cmLatestPriceDate", meta.priceDate ? fmtDate(meta.priceDate) : "Noch kein Import");
    setText("cmGermanNameCount", Number(meta.germanNameCount || 0).toLocaleString("de-DE"));
    setText("cmGermanNameStatus", meta.germanNamesImportedAt ? `Lokal gespeichert · ${new Date(meta.germanNamesImportedAt).toLocaleString("de-DE")}${Number(meta.setDetailCount||0)>0?` · ${Number(meta.setDetailCount).toLocaleString("de-DE")} eindeutige Setdetails`:""}` : "Noch nicht geladen");
    setText("cmCatalogStatus", meta.catalogImportedAt ? `Importiert am ${new Date(meta.catalogImportedAt).toLocaleString("de-DE")} · Quelle ${meta.catalogCreatedAt ? fmtDate(meta.catalogCreatedAt) : "ohne Datum"}` : "Noch kein Produktkatalog importiert");
    setText("cmPriceStatus", meta.priceImportedAt ? `Importiert am ${new Date(meta.priceImportedAt).toLocaleString("de-DE")} · Preisstand ${fmtDate(meta.priceDate)}` : "Noch kein Price Guide importiert");
    const snapshots = document.getElementById("cmSnapshotDates");
    if (snapshots) snapshots.innerHTML = meta.snapshotDates?.length ? meta.snapshotDates.slice(0,20).map(date => `<span class="badge blue">${fmtDate(date)}</span>`).join(" ") : `<span class="muted">Noch keine Tagesstände</span>`;
    const view = document.getElementById("view-cardmarket");
    if (view?.classList.contains("active")) {
      cmScheduleSearch();
      cmRenderOpportunities().catch(error => {
        const out=document.getElementById("cmOpportunityList");
        if(out) out.innerHTML=`<div class="empty money-negative">${escapeHtml(error.message)}</div>`;
      });
      cmRenderSqliteHistoryOverview();
    }
  }

  async function cmRefreshMetadataFromDb() {
    try {
      const [products, latest, history, sqliteStatus, snapshotRows] = await Promise.all([
        cmCount("products"),
        cmCount("latestPrices"),
        cmCount("priceHistory"),
        window.desktopApp?.getDatabaseStatus ? window.desktopApp.getDatabaseStatus() : null,
        window.desktopApp?.getSnapshotDates ? window.desktopApp.getSnapshotDates({limit:365}) : []
      ]);
      let changed = false;
      if (products !== Number(state.cardmarket.productCount || 0)) { state.cardmarket.productCount=products; changed=true; }
      if (latest && !state.cardmarket.priceRowCount) { state.cardmarket.priceRowCount=latest; changed=true; }
      if (history !== Number(state.cardmarket.historyRowCount || 0)) { state.cardmarket.historyRowCount=history; changed=true; }
      if (Array.isArray(snapshotRows) && snapshotRows.length) {
        const dates=snapshotRows.map(row=>String(row.date||"")).filter(Boolean);
        if (JSON.stringify(dates)!==JSON.stringify(state.cardmarket.snapshotDates||[])) { state.cardmarket.snapshotDates=dates; changed=true; }
        const latestDate=dates[0]||"";
        if (latestDate && latestDate!==state.cardmarket.priceDate) { state.cardmarket.priceDate=latestDate; changed=true; }
      }
      if (sqliteStatus?.ready) {
        state.cardmarket.sqlitePriceRowCount=Number(sqliteStatus.marketPriceCount||0);
        state.cardmarket.sqliteSnapshotCount=Number(sqliteStatus.snapshotCount||0);
      }
      if (changed) saveState();
      renderCardmarketDataCenter();
    } catch (error) {
      console.error("Cardmarket-Metadaten konnten nicht gelesen werden",error);
    }
  }

  async function cmExportBackup() {
    cmSetProgress("<strong>Cardmarket-Datensicherung wird erstellt …</strong>", 15);
    const [products,latestPrices,priceHistory] = await Promise.all([cmGetAll("products"),cmGetAll("latestPrices"),cmGetAll("priceHistory")]);
    const payload = {format:"tcg-cardmarket-data-v1",createdAt:new Date().toISOString(),metadata:state.cardmarket,products,latestPrices,priceHistory};
    const blob = new Blob([JSON.stringify(payload)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`TCG_Cardmarket_Daten_${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    cmSetProgress(`<strong>Cardmarket-Datensicherung erstellt</strong><br>${products.length.toLocaleString("de-DE")} Produkte und ${priceHistory.length.toLocaleString("de-DE")} Preisstände exportiert.`,100,"success");
  }

  async function cmImportBackupPayload(payload,source="TCG_Cardmarket_Daten.json") {
    if (!cmIsBackup(payload)) throw new Error("Keine gültige Cardmarket-Datensicherung erkannt.");
    cmSetProgress("<strong>Bestehende Cardmarket-Daten werden ersetzt …</strong>",5);
    await Promise.all([cmClearStore("products"),cmClearStore("latestPrices"),cmClearStore("priceHistory")]);
    if(window.desktopApp?.clearMarketData) await window.desktopApp.clearMarketData();
    await cmWriteRows("products",payload.products,(done,total)=>cmSetProgress(`<strong>Produkte werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,5+done/Math.max(1,total)*30));
    await cmWriteRows("latestPrices",payload.latestPrices || [],(done,total)=>cmSetProgress(`<strong>Aktuelle Preise werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,40+done/Math.max(1,total)*20));
    await cmWriteRows("priceHistory",payload.priceHistory,(done,total)=>cmSetProgress(`<strong>Preishistorie wird wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,55+done/Math.max(1,total)*25));
    if(window.desktopApp?.upsertProducts) await cmSyncProductsToSqlite(payload.products,(done,total)=>cmSetProgress(`<strong>SQLite-Kartenstammdaten werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,80+done/Math.max(1,total)*8));
    if(window.desktopApp?.upsertMarketPrices) await cmSyncPricesToSqlite(payload.priceHistory,String(payload.metadata?.priceDate||""),new Date().toISOString(),(done,total)=>cmSetProgress(`<strong>SQLite-Preishistorie wird wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,88+done/Math.max(1,total)*12));
    state.cardmarket={...CM_META_DEFAULTS,...(payload.metadata||{}),productCount:payload.products.length,priceRowCount:(payload.latestPrices||[]).length,historyRowCount:payload.priceHistory.length};
    state.imports.push({id:uid(),type:"cardmarketBackup",key:`cm-backup-${Date.now()}`,file:source,date:new Date().toISOString(),rows:payload.priceHistory.length,cards:payload.products.length});
    cmInvalidateCache();saveState();renderAll();
    cmSetProgress(`<strong>Cardmarket-Datensicherung wiederhergestellt</strong><br>${payload.products.length.toLocaleString("de-DE")} Produkte und ${payload.priceHistory.length.toLocaleString("de-DE")} Preisstände.`,100,"success");
    return {type:"cardmarketBackup",rows:payload.priceHistory.length,cards:payload.products.length};
  }

  async function cmClearAll(ask=true) {
    if (ask && !confirm("Produktkatalog und komplette Cardmarket-Preishistorie wirklich löschen? Warenwirtschaft, Bestand, Käufe und Verkäufe bleiben erhalten.")) return false;
    await Promise.all([cmClearStore("products"),cmClearStore("latestPrices"),cmClearStore("priceHistory")]);
    if(window.desktopApp?.clearMarketData) await window.desktopApp.clearMarketData();
    state.cardmarket={...CM_META_DEFAULTS};
    state.imports=state.imports.filter(record=>!["catalog","prices","cardmarketBackup"].includes(record.type));
    cmInvalidateCache();
    saveState();renderAll();
    cmSetProgress("<strong>Cardmarket-Daten wurden gelöscht.</strong>",100,"success");
    return true;
  }

  // Vollständige Import-Erkennung für Universalimport und überwachten Ordner.
  const legacyUniversalImportFile = universalImportFile;
  universalImportFile = async function(file) {
    if (!file) throw new Error("Keine Datei ausgewählt.");
    if (/\.json$/i.test(file.name)) {
      const payload = JSON.parse(await file.text());
      if (cmIsBackup(payload)) return cmImportBackupPayload(payload,file.name);
      if (cmIsProductCatalog(payload)) return importCardmarketProductCatalogPayload(payload,file.name);
      if (cmIsPriceGuide(payload)) return importCardmarketPriceGuidePayload(payload,file.name);
    }
    return legacyUniversalImportFile(file);
  };

  const legacyAutomaticCandidate = isAutomaticImportCandidate;
  isAutomaticImportCandidate = function(name="") {
    return legacyAutomaticCandidate(name) || /products_singles_3.*\.json$/i.test(String(name));
  };

  // Alte Preisfunktion ersetzen, damit große Price Guides nicht mehr in localStorage geschrieben werden.
  const legacyPriceGuideRows = priceGuideRows;
  priceGuideRows = function(payload) {
    return Array.isArray(payload?.priceGuides) ? payload.priceGuides : legacyPriceGuideRows(payload);
  };

  updateOfficialMarketPrices = async function(manual=true) {
    const out=document.getElementById("autoPricePreview");
    if(out) out.innerHTML='<div class="muted">Offizieller Cardmarket-Price-Guide wird geladen …</div>';
    try {
      const response=await fetch(OFFICIAL_YGO_PRICE_GUIDE,{cache:"no-store"});
      if(!response.ok) throw new Error(`Download fehlgeschlagen (${response.status})`);
      const result=await importCardmarketPriceGuidePayload(await response.json(),"Offizieller Cardmarket Yu-Gi-Oh! Price Guide");
      if(out) out.innerHTML=`<div class="success"><strong>Marktpreise und Tageshistorie aktualisiert</strong><br>${result.cards.toLocaleString("de-DE")} Preiszeilen für ${fmtDate(result.snapshotDate)} gespeichert · ${result.updated} Watchlist-Einträge aktualisiert.</div>`;
      return result;
    } catch(error) {
      if(out) out.innerHTML=`<div class="error"><strong>Automatischer Download nicht möglich</strong><br>${escapeHtml(error.message)}<br><small>Alternativ die Datei price_guide_3.json importieren.</small></div>`;
      if(manual) throw error;
      return null;
    }
  };

  // Importhistorie mit ehrlicher Rückgängig-Logik für große IndexedDB-Importe.
  renderImports = function() {
    const el=document.getElementById("importHistoryTable");
    if(!el)return;
    const labels={inventory:"Bestand",purchase:"Einkauf",sale:"Verkauf",prices:"Price Guide",catalog:"Produktkatalog",watchlist:"Watchlist",seller:"Händler",customer:"Kunden",backup:"Backup",cardmarketBackup:"Cardmarket-Sicherung",names:"Deutsche Kartennamen"};
    const rows=[...state.imports].sort((a,b)=>new Date(b.date)-new Date(a.date));
    el.innerHTML=rows.length?rows.map(record=>{
      const persistent=["prices","catalog","cardmarketBackup"].includes(record.type);
      return `<tr><td>${fmtDate(record.date)}</td><td>${escapeHtml(labels[record.type]||record.type)}</td><td>${escapeHtml(record.file||"")}${record.snapshotDate?`<br><small>Preisstand ${fmtDate(record.snapshotDate)}</small>`:""}</td><td>${Number(record.rows||0).toLocaleString("de-DE")}</td><td>${Number(record.cards||0).toLocaleString("de-DE")}</td><td>${escapeHtml(record.key||"")}</td><td class="actions">${persistent?'<span class="muted">dauerhaft gespeichert</span>':`<button class="icon-button danger-text" data-delete-import="${record.id}">Rückgängig</button>`}<button class="icon-button" data-remove-import-history="${record.id}">Aus Historie entfernen</button></td></tr>`;
    }).join(""):`<tr><td colspan="7" class="empty">Noch keine Importe</td></tr>`;
  };

  const legacyRenderAll = renderAll;
  renderAll = function() {
    const activeView = document.querySelector(".view.active")?.id || "";
    const sameView = activeView && activeView === cmLastRenderedView;
    const previousY = window.scrollY;
    legacyRenderAll();
    renderCardmarketDataCenter();
    requestAnimationFrame(() => window.scrollTo({top:sameView ? previousY : 0,left:0,behavior:"auto"}));
    cmLastRenderedView = activeView;
  };

  // UI-Verknüpfungen.
  const productInput=document.getElementById("cmProductCatalogInput");
  if(productInput) productInput.addEventListener("change",async event=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{await importCardmarketProductCatalogPayload(JSON.parse(await file.text()),file.name);}catch(error){state.cardmarket.lastError=error.message;saveState();cmSetProgress(`<strong>Produktkatalog-Import fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error");}
  });
  const priceInput=document.getElementById("cmPriceGuideInput");
  if(priceInput) priceInput.addEventListener("change",async event=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{await importCardmarketPriceGuidePayload(JSON.parse(await file.text()),file.name);}catch(error){state.cardmarket.lastError=error.message;saveState();cmSetProgress(`<strong>Price-Guide-Import fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error");}
  });
  const backupInput=document.getElementById("cmBackupInput");
  if(backupInput) backupInput.addEventListener("change",async event=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{await cmImportBackupPayload(JSON.parse(await file.text()),file.name);}catch(error){cmSetProgress(`<strong>Wiederherstellung fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error");}
  });
  document.getElementById("cmSearch")?.addEventListener("input",cmScheduleSearch);
  document.getElementById("cmLoadGermanNamesBtn")?.addEventListener("click",()=>cmLoadGermanNamesOnline().catch(error=>cmSetProgress(`<strong>Deutsche Kartennamen konnten nicht geladen werden</strong><br>${escapeHtml(error.message)}<br><small>Internetverbindung prüfen und erneut versuchen.</small>`,100,"error")));
    document.getElementById("cmExportBackupBtn")?.addEventListener("click",()=>cmExportBackup().catch(error=>cmSetProgress(`<strong>Export fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error")));
  document.getElementById("cmClearDataBtn")?.addEventListener("click",()=>cmClearAll(true).catch(error=>alert(error.message)));
  document.getElementById("cmRefreshOpportunitiesBtn")?.addEventListener("click",()=>{cmOpportunityCache={key:"",rows:[]};cmRenderOpportunities();});
  document.getElementById("cmHistoryPeriod")?.addEventListener("change",()=>cmRenderSqliteHistoryOverview());
  document.getElementById("cmRefreshHistoryBtn")?.addEventListener("click",()=>cmRenderSqliteHistoryOverview());

  document.addEventListener("click",event=>{
    const details=event.target.closest("[data-cm-details]");
    if(details){cmShowProductDetails(details.dataset.cmDetails);return;}
    const add=event.target.closest("[data-cm-add-watch]");
    if(add){cmAddToWatchlist(add.dataset.cmAddWatch);}
  });

  // Reset aus 4.3.x um die neue Datenbank ergänzen.
  const resetButton=document.getElementById("resetDemoBtn");
  if(resetButton) resetButton.onclick=async()=>{
    if(!confirm("Alle lokalen Daten einschließlich Cardmarket-Produktkatalog und Preishistorie unwiderruflich löschen?"))return;
    await cmClearAll(false);
    state=structuredClone(defaultState);
    state.cardmarket={...CM_META_DEFAULTS};
    saveState();renderAll();
  };

  // Kaufanalyse 4.4.1: vollständigen IndexedDB-Katalog direkt in der bisherigen Kaufanalyse nutzen.
  // Dadurch sind Suche, Marktpreise, Preisstände und eigene Daten nicht länger auf den kleinen
  // Kompatibilitätskatalog aus localStorage begrenzt.
  const legacyRenderPurchaseAnalysis=renderPurchaseAnalysis;
  let cmPurchaseAnalysisToken=0;

  const CM_GERMAN_SEARCH_ALIASES = [
    ...CM_VERIFIED_GERMAN_NAME_PAIRS.map(([english,german]) => [cmNormalize(german),cmNormalize(english)]),
    ["unterweltlerschmied", "fiendsmith"],
    ["antiker antriebs", "ancient gear"],
    ["antike antriebs", "ancient gear"],
    ["antiker antrieb", "ancient gear"],
    ["antike antrieb", "ancient gear"],
    ["antiker", "ancient gear"],
    ["antriebs", "gear"],
    ["himmelsjager", "sky striker"],
    ["schwarzflugel", "blackwing"],
    ["blauaugig", "blue eyes"],
    ["rotaugig", "red eyes"],
    ["finsterer magier", "dark magician"],
    ["schattenpuppe", "shaddoll"]
  ];

  function cmAnalysisQueryVariants(rawQuery="") {
    const original=cmNormalize(rawQuery);
    const variants=[];
    const add=value=>{const normalized=cmNormalize(value);if(normalized&&!variants.includes(normalized))variants.push(normalized);};
    add(original);
    // Nur den längsten passenden Alias anwenden, damit sich überlappende Begriffe
    // wie „antiker antriebs“ und „antiker antrieb“ nicht gegenseitig verstümmeln.
    const orderedAliases=[...CM_GERMAN_SEARCH_ALIASES].sort((a,b)=>b[0].length-a[0].length);
    for(const [german,english] of orderedAliases){
      if(!original.includes(german))continue;
      add(original.replace(german,english));
      if(original===german)add(english);
      break;
    }
    if(/(^| )antiker( |$)/.test(original))add(original.replace(/(^| )antiker(?= |$)/g,"$1ancient"));
    else if(/(^| )antike( |$)/.test(original))add(original.replace(/(^| )antike(?= |$)/g,"$1ancient"));
    if(!original.includes("antiker antrieb")&&!original.includes("antike antrieb")&&/(^| )antriebs?( |$)/.test(original))add(original.replace(/(^| )antriebs?(?= |$)/g,"$1gear"));
    return variants;
  }

  function cmAnalysisMatchRank(product,variants) {
    const haystack=product.searchText||cmNormalize([product.germanName,product.name,product.officialName,product.set,product.setName,product.rarity,product.productId].join(" "));
    let best=999;
    variants.forEach((variant,index)=>{
      const terms=variant.split(/\s+/).filter(Boolean);
      if(!terms.length||!terms.every(term=>haystack.includes(term)))return;
      const german=cmNormalize(cmGermanName(product));
      const name=cmNormalize(product.name||product.officialName||"");
      const official=cmNormalize(product.officialName||"");
      let localRank=3;
      if(german===variant||name===variant||official===variant)localRank=0;
      else if(german.startsWith(variant)||name.startsWith(variant)||official.startsWith(variant))localRank=1;
      else if(german.includes(variant)||name.includes(variant)||official.includes(variant))localRank=2;
      best=Math.min(best,index*10+localRank);
    });
    return best;
  }

  function cmDiversifiedProducts(products,limit) {
    const selected=[];
    const selectedIds=new Set();
    const identities=new Set();
    for(const product of products){
      const identity=String(product.metacardId||cmNormalize(product.officialBaseName||product.officialName||product.name||product.productId));
      if(identities.has(identity))continue;
      identities.add(identity);selected.push(product);selectedIds.add(String(product.productId));
      if(selected.length>=limit)return selected;
    }
    for(const product of products){
      if(selectedIds.has(String(product.productId)))continue;
      selected.push(product);selectedIds.add(String(product.productId));
      if(selected.length>=limit)break;
    }
    return selected;
  }

  function cmHistoryDeltaInfo(history,days,currentTrend,fallbackChange=null,fallbackDate="") {
    const current=cmNumber(currentTrend);
    if(current===null)return {value:null,sourceDate:"",reason:"Keine Trendpreisdaten"};
    const valid=(history||[])
      .map(row=>({...row,trendValue:cmNumber(row.trend)}))
      .filter(row=>row.date&&row.trendValue!==null)
      .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(valid.length){
      const latest=valid.at(-1);
      const latestDate=new Date(`${latest.date}T12:00:00`);
      const target=new Date(latestDate);
      target.setDate(target.getDate()-days);
      let candidate=null;
      for(const row of valid){
        const rowDate=new Date(`${row.date}T12:00:00`);
        if(rowDate<=target)candidate=row;
      }
      if(candidate)return {value:current-candidate.trendValue,sourceDate:candidate.date,reason:""};
    }
    if(days===1&&fallbackChange!==null&&fallbackChange!==undefined&&Number.isFinite(Number(fallbackChange))){
      return {value:Number(fallbackChange),sourceDate:fallbackDate||"",reason:""};
    }
    return {value:null,sourceDate:"",reason:`Noch keine ${days}-Tage-Historie`};
  }

  function cmAnalysisDeltaMetric(label,info) {
    const source=info.sourceDate?`<small>gegen ${fmtDate(info.sourceDate)}</small>`:`<small>${escapeHtml(info.reason||"Noch kein Vergleichswert")}</small>`;
    return `<div class="analysis-metric analysis-trend-metric"><span>${escapeHtml(label)}</span><strong>${info.value===null?"–":cmSignedMoney(info.value)}</strong>${source}</div>`;
  }

  function cmAnalysisMoney(value,{zero=true}={}) {
    const number=cmNumber(value);
    if(number===null)return "–";
    if(!zero&&number===0)return "–";
    return money(number);
  }

  function cmAnalysisCardTitle(product) {
    return cmDisplayName(product) || `CM ${product.productId}`;
  }

  function cmGermanNamesNotice() {
    if (Number(state.cardmarket?.germanNameCount || 0) > 0) return "";
    return `<div class="cm-analysis-notice"><div><strong>Deutsche Kartennamen sind noch nicht lokal geladen.</strong><span>Bis zum Abgleich werden englische Namen angezeigt. Die Suche mit deutschen Namen ist nur über wenige Übergangs-Aliase möglich.</span></div><button class="secondary" type="button" data-cm-load-german>Deutsche Namen jetzt laden</button></div>`;
  }

  function cmCaptureAnalysisPosition() {
    const cards=[...document.querySelectorAll("#purchaseAnalysis [data-cm-result-id]")];
    const viewportTop=110;
    const visible=cards.find(card=>card.getBoundingClientRect().bottom>viewportTop);
    return {id:visible?.dataset.cmResultId||"",offset:visible?.getBoundingClientRect().top||0,y:window.scrollY};
  }

  function cmRestoreAnalysisPosition(position) {
    if(!position)return;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const target=position.id?document.querySelector(`#purchaseAnalysis [data-cm-result-id="${CSS.escape(position.id)}"]`):null;
      if(target){
        const difference=target.getBoundingClientRect().top-position.offset;
        if(Math.abs(difference)>1)window.scrollBy({top:difference,left:0,behavior:"auto"});
      }else{
        window.scrollTo({top:position.y,left:0,behavior:"auto"});
      }
    }));
  }

  async function cmRenderFullPurchaseAnalysis() {
    const el=document.getElementById("purchaseAnalysis");
    if(!el)return;
    const queryRaw=String(document.getElementById("watchSearch")?.value||"").trim();
    const query=cmNormalize(queryRaw);
    const token=++cmPurchaseAnalysisToken;
    if(query.length<2){
      el.classList.remove("is-refreshing");
      el.style.minHeight="";
      el.innerHTML=cmGermanNamesNotice()+'<div class="purchase-analysis-empty"><strong>Gesamtkatalog durchsuchen</strong><br>Mindestens zwei Zeichen eingeben. Deutsche und englische Kartennamen, Produktvarianten, Marktpreise, Preisverläufe und eigene Daten werden zusammengeführt.</div>';
      return;
    }
    const position=cmCaptureAnalysisPosition();
    const hadResults=Boolean(el.querySelector(".cm-analysis-results-grid"));
    if(hadResults){
      el.style.minHeight=`${Math.max(el.offsetHeight,320)}px`;
      el.classList.add("is-refreshing");
      const summary=el.querySelector(".cm-analysis-summary span");
      if(summary)summary.textContent="Treffer werden aktualisiert …";
    }else{
      el.innerHTML='<div class="purchase-analysis-empty">Vollständiger Cardmarket-Katalog und Preishistorie werden durchsucht …</div>';
    }
    try{
      const all=await cmLoadMergedCache();
      if(token!==cmPurchaseAnalysisToken)return;
      const variants=cmAnalysisQueryVariants(queryRaw);
      const matches=[];
      for(const product of all){
        const rank=cmAnalysisMatchRank(product,variants);
        if(rank===999)continue;
        matches.push({product,rank});
      }
      matches.sort((a,b)=>a.rank-b.rank||String(cmDisplayName(a.product)).localeCompare(String(cmDisplayName(b.product)),"de")||String(a.product.productId).localeCompare(String(b.product.productId)));
      const orderedProducts=matches.map(entry=>entry.product);
      const visible=cmDiversifiedProducts(orderedProducts,48);
      if(!visible.length){
        el.style.minHeight="";
        el.classList.remove("is-refreshing");
        el.innerHTML=cmGermanNamesNotice()+'<div class="purchase-analysis-empty">Keine passende Kartenvariante im vollständigen Cardmarket-Katalog gefunden.</div>';
        cmRestoreAnalysisPosition(position);
        return;
      }
      const ownMap=cmBuildOwnStats();
      const histories=await Promise.all(visible.map(product=>cmGetHistory(product.productId)));
      if(token!==cmPurchaseAnalysisToken)return;
      const cards=visible.map((product,index)=>{
        const own=ownMap.get(String(product.productId))||{};
        const history=histories[index]||[];
        const delta1=cmHistoryDeltaInfo(history,1,product.trend,product.dailyChange,product.previousDate);
        const delta7=cmHistoryDeltaInfo(history,7,product.trend);
        const delta30=cmHistoryDeltaInfo(history,30,product.trend);
        const calc=cmMarketCalculation(product,own,{delta1:delta1.value,delta7:delta7.value,delta30:delta30.value});
        const watch=state.watchlist.find(w=>!w.archived&&cleanProductId(w.productId)===String(product.productId));
        const maxBuyNote=calc.maxBuy>0
          ? `Der strengere Wert aus Mindestgewinn (${money(calc.maxByProfit)}) und Mindest-ROI (${money(calc.maxByRoi)}) wird verwendet.`
          : (calc.recommendedSell>0?calc.recommendationReason:"Keine ausreichenden Verkaufsreferenzen.");
        const deltaMetric=(label,info)=>`<div class="cm-result-metric"><span>${label}</span><strong>${info.value===null?"–":cmSignedMoney(info.value)}</strong><small>${info.sourceDate?`gegen ${fmtDate(info.sourceDate)}`:escapeHtml(info.reason||"Kein Vergleichswert")}</small></div>`;
        const englishName=cmEnglishName(product);
        const displayName=cmAnalysisCardTitle(product);
        const scoreText=cmScoreLabel(calc);
        const scoreDetails=[...calc.scoreReasons,calc.quality.exactVariant?"":"Set/Seltenheit nicht eindeutig"].filter(Boolean).join(" · ") || "Preis-, Verlauf- und Bestandsdaten vollständig berücksichtigt.";
        return `<article class="cm-analysis-result-card" data-cm-result-id="${escapeHtml(product.productId)}">
          <header class="cm-result-head">
            <div class="cm-result-title"><h3><a class="card-link" href="${escapeHtml(cardmarketUrl(product))}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayName)} <span class="external-link">↗</span></a></h3>${englishName&&cmNormalize(englishName)!==cmNormalize(displayName)?`<p>Englisch: ${escapeHtml(englishName)}</p>`:""}<small>${cmProductSubtitle(product)} · ${product.date?`Preisstand ${fmtDate(product.date)}`:"Noch kein Price Guide"}</small>${cmDataQualityBadges(product,calc)}</div>
            <div class="cm-result-score" title="${escapeHtml(scoreDetails)}">${cmRecommendationBadge(calc.recommendation)}<strong>${escapeHtml(scoreText)}</strong></div>
          </header>
          <div class="cm-result-decision"><strong>${escapeHtml(calc.recommendationReason)}</strong><span>${escapeHtml(scoreDetails)}</span></div>
          <div class="cm-result-section"><h4>Cardmarket-Preisreferenzen</h4><div class="cm-result-metrics cm-result-metrics-5">
            <div class="cm-result-metric"><span>Cardmarket Low</span><strong>${cmAnalysisMoney(calc.low)}</strong><small>Niedrigstes Angebot, keine eigene EK-Historie</small></div>
            <div class="cm-result-metric"><span>Cardmarket Trend</span><strong>${cmAnalysisMoney(calc.trend)}</strong><small>Marktreferenz, nicht dein tatsächlicher VK</small></div>
            <div class="cm-result-metric"><span>Ø 1 Tag</span><strong>${cmAnalysisMoney(calc.avg1)}</strong></div>
            <div class="cm-result-metric"><span>Ø 7 Tage</span><strong>${cmAnalysisMoney(calc.avg7)}</strong></div>
            <div class="cm-result-metric"><span>Ø 30 Tage</span><strong>${cmAnalysisMoney(calc.avg30)}</strong></div>
          </div></div>
          <div class="cm-result-section"><h4>Echte Preisentwicklung aus Importhistorie</h4><div class="cm-result-metrics cm-result-metrics-3">${deltaMetric("Δ 1 Tag",delta1)}${deltaMetric("Δ 7 Tage",delta7)}${deltaMetric("Δ 30 Tage",delta30)}</div></div>
          <div class="cm-result-section"><h4>Einkaufs- und Verkaufsrechnung</h4><div class="cm-result-metrics cm-result-metrics-3">
            <div class="cm-result-metric"><span>Berechnungs-EK</span><strong>${calc.marketBuy>0?money(calc.marketBuy):"–"}</strong><small>Quelle: ${escapeHtml(calc.marketBuySource)}</small></div>
            <div class="cm-result-metric"><span>Empfohlener VK</span><strong>${cmAnalysisMoney(calc.recommendedSell)}</strong><small>Gewichtet aus Trend, Ø 7 und Ø 30</small></div>
            <div class="cm-result-metric"><span>Sicherheits-VK</span><strong>${cmAnalysisMoney(calc.safeSell)}</strong><small>${Number(state.settings.safetyPercent||0)} % Sicherheitsabschlag</small></div>
            <div class="cm-result-metric"><span>Gebühren + Verpackung</span><strong>${cmAnalysisMoney(calc.feeAmount+Number(state.settings.packaging||0))}</strong><small>${Number(state.settings.feePercent||0)} % Gebühr · ${money(Number(state.settings.packaging||0))} Verpackung</small></div>
            <div class="cm-result-metric ${calc.isCostCovering?"":"cm-metric-critical"}"><span>Break-even-EK</span><strong class="${calc.isCostCovering?"":"money-negative"}">${calc.isCostCovering?cmAnalysisMoney(cmFloorMoney(calc.netBeforeBuy)):"Nicht kostendeckend"}</strong><small>${calc.isCostCovering?"Maximaler EK ohne Gewinn":"Fehlbetrag vor Karteneinkauf: "+money(calc.costShortfall)}</small></div>
            <div class="cm-result-metric"><span>Max-EK nach Mindestgewinn</span><strong>${cmAnalysisMoney(calc.maxByProfit)}</strong><small>${money(calc.minProfit)} Mindestgewinn</small></div>
            <div class="cm-result-metric"><span>Max-EK nach Mindest-ROI</span><strong>${cmAnalysisMoney(calc.maxByRoi)}</strong><small>${Number(state.settings.minRoi||0)} % Mindest-ROI</small></div>
            <div class="cm-result-metric" title="${escapeHtml(maxBuyNote)}"><span>Empfohlener Max-EK</span><strong>${cmAnalysisMoney(calc.maxBuy)}</strong><small>${watch?.maxBuy?`Eigene Grenze ${money(watch.maxBuy)}`:escapeHtml(maxBuyNote)}</small></div>
            <div class="cm-result-metric"><span>Gewinn bei Cardmarket Low</span><strong class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${calc.marketBuy>0?money(calc.profitAtMarket):"–"}</strong><small>${calc.marketBuy>0?`${pct(calc.roiAtMarket)} ROI · ${pct(calc.marginOnSell)} Marge auf Sicherheits-VK`:"Keine EK-Referenz"}</small></div>
          </div></div>
          <div class="cm-result-section"><h4>Eigene Daten</h4><div class="cm-result-metrics cm-result-metrics-3">
            <div class="cm-result-metric"><span>Eigener EK</span><strong>${own.avgBuy?money(own.avgBuy):"–"}</strong><small>Ø${own.bestBuy?` · Bester ${money(own.bestBuy)}`:" · keine Käufe"}</small></div>
            <div class="cm-result-metric"><span>Eigener VK</span><strong>${own.avgSell?money(own.avgSell):"–"}</strong><small>Ø${own.bestSell?` · Bester ${money(own.bestSell)}`:" · keine Verkäufe"}</small></div>
            <div class="cm-result-metric"><span>Bestand</span><strong>${Number(own.inventory||0)}</strong><small>${Number(own.reserved||0)} reserviert · ${Number(own.available||0)} verfügbar</small></div>
          </div></div>
          <footer class="cm-result-actions"><button class="secondary" data-cm-add-watch="${escapeHtml(product.productId)}">+ Watchlist</button><button class="primary" data-cm-analysis-details="${escapeHtml(product.productId)}" data-cm-analysis-name="${escapeHtml(displayName)}">Preisverlauf öffnen</button></footer>
        </article>`;
      }).join("");
      el.innerHTML=`${cmGermanNamesNotice()}<div class="cm-analysis-summary"><strong>${matches.length.toLocaleString("de-DE")} Varianten im vollständigen Katalog gefunden</strong><span>${matches.length>visible.length?`Erste ${visible.length} angezeigt · unterschiedliche Karten werden priorisiert`:`Alle Treffer angezeigt`}</span></div><div class="cm-analysis-legend"><strong>Lesart:</strong> Ø 1/7/30 sind Cardmarket-Durchschnittspreise. Δ 1/7/30 sind ausschließlich echte Veränderungen aus deinen gespeicherten Tagesimporten. Fehlende Set-/Seltenheitsdaten werden nicht geraten.</div><div class="cm-analysis-results-grid">${cards}</div>`;
      el.classList.remove("is-refreshing");
      cmRestoreAnalysisPosition(position);
      requestAnimationFrame(()=>{el.style.minHeight="";});
    }catch(error){
      if(token!==cmPurchaseAnalysisToken)return;
      el.style.minHeight="";
      el.classList.remove("is-refreshing");
      el.innerHTML=`<div class="purchase-analysis-empty money-negative"><strong>Kaufanalyse konnte nicht geladen werden.</strong><br>${escapeHtml(error.message)}</div>`;
      cmRestoreAnalysisPosition(position);
    }
  }

  renderPurchaseAnalysis=function(){
    if(Number(state.cardmarket?.productCount||0)<=0){legacyRenderPurchaseAnalysis();return;}
    cmRenderFullPurchaseAnalysis();
  };

  document.addEventListener("click",event=>{
    const target=event.target.closest("[data-cm-analysis-details]");
    if(!target)return;
    const productId=target.dataset.cmAnalysisDetails;
    const searchText=target.dataset.cmAnalysisName||String(document.getElementById("watchSearch")?.value||"");
    showView("cardmarket");
    const search=document.getElementById("cmSearch");
    if(search){search.value=searchText;cmScheduleSearch();}
    cmShowProductDetails(productId);
  });

  document.addEventListener("click",event=>{
    const target=event.target.closest("[data-view-jump-dynamic]");
    if(!target)return;
    const q=String(document.getElementById("watchSearch")?.value||"");
    showView(target.dataset.viewJumpDynamic);
    const search=document.getElementById("cmSearch");if(search){search.value=q;cmScheduleSearch();}
  });

  document.addEventListener("click",async event=>{
    const target=event.target.closest("[data-cm-load-german]");
    if(!target)return;
    const oldText=target.textContent;
    target.disabled=true;
    target.textContent="Deutsche Namen werden geladen …";
    try{
      const result=await cmLoadGermanNamesOnline();
      alert(`${Number(result.matched||0).toLocaleString("de-DE")} Produktvarianten wurden mit deutschen Kartennamen verknüpft. ${Number(result.setDetailCount||0).toLocaleString("de-DE")} Set-/Seltenheitsdetails wurden ergänzt.`);
      renderPurchaseAnalysis();
    }catch(error){
      alert(`Deutsche Kartennamen konnten nicht geladen werden: ${error.message}`);
      target.disabled=false;
      target.textContent=oldText;
    }
  });

  async function cmRunDailyAutoUpdate() {
    const today = todayISO();
    if (state.cardmarket?.autoDailyUpdate === false) return;
    if (String(state.cardmarket?.lastAutoAttemptDate || "") === today) return;
    state.cardmarket.lastAutoAttemptDate = today;
    saveState();
    try {
      const result = await updateOfficialMarketPrices(false);
      if (result) {
        state.cardmarket.lastAutoSuccessDate = today;
        state.cardmarket.lastError = "";
      }
    } catch (error) {
      state.cardmarket.lastError = String(error?.message || error || "Automatische Aktualisierung fehlgeschlagen");
    }
    saveState();
  }

  saveState();
  renderAll();
  cmRefreshMetadataFromDb().then(async () => {
    try {
      await cmRepairKnownGermanNames();
    } catch (error) {
      console.error("Lokale Reparatur deutscher Kartennamen fehlgeschlagen:",error);
      state.cardmarket.lastError = `Deutsche Namen: ${String(error?.message || error)}`;
      saveState();
    }
    window.setTimeout(cmRunDailyAutoUpdate, 1200);
  });
})();
