/* TCG Business Manager 6.0.0 – Analysecenter
 * Große Cardmarket-Datenmengen werden bewusst in IndexedDB gespeichert.
 * Dadurch bleibt der normale Warenwirtschafts-Stand in localStorage klein und stabil.
 */
(() => {
  "use strict";

  const CM_DB_NAME = "tcgBusinessManagerCardmarket";
  const CM_DB_VERSION = 3;
  const CM_GERMAN_NAME_REVISION = 6;
  const CM_GERMAN_NAME_REFRESH_DAYS = 7;
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
    localGermanRepairRevision: 0,
    germanNameVerifiedFallbackCount: 0,
    germanNameCoveragePercent: 0,
    germanApiEnglishCount: 0,
    germanApiGermanCount: 0,
    ygoResourcesEnglishNameCount: 0,
    ygoResourcesGermanNameCount: 0,
    ygoResourcesRevision: "",
    germanAliasCount: 0,
    germanUniqueCardCount: 0,
    germanNameUnmatchedMetacardCount: 0,
    germanNameAmbiguousMetacardCount: 0,
    germanNamesAutoUpdate: true,
    germanNamesLastAutoAttemptDate: "",
    germanNamesLastAutoSuccessDate: "",
    germanNamesLastError: "",
    cardDataImportedAt: "",
    setDetailCount: 0,
    setMappingCount: 0,
    setCodeCount: 0,
    rarityCount: 0,
    exactPrintCount: 0,
    ambiguousPrintCount: 0,
    lastError: "",
    lastAutoAttemptDate: "",
    lastAutoSuccessDate: "",
    lastSuccessfulImport: null,
    recentImportRuns: [],
    autoDailyUpdate: true
  };

  let cmCacheManager = null;
  let cmMergedCache = null;
  let cmProductByIdCache = null;
  let cmLatestByIdCache = null;
  let cmGermanAliasCache = null;
  let cmSearchTimer = null;
  let cmRenderToken = 0;
  let cmHistoryOverviewToken = 0;
  let cmOpportunityCache = {key:"", rows:[]};
  let cmLastRenderedView = "";
  let cmGermanNamesUpdatePromise = null;
  let cmPriceUpdatePromise = null;
  const YGOPRO_EN_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes";
  const YGOPRO_DE_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=de&misc=yes";
  const YGORESOURCES_EN_NAMES_URL = "https://db.ygoresources.com/data/idx/card/name/en";
  const YGORESOURCES_DE_NAMES_URL = "https://db.ygoresources.com/data/idx/card/name/de";

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
    return window.TcgCardSearch?.normalizeSpaced(value) || String(value).toLocaleLowerCase("de-DE").trim();
  }

  function cmCompact(value="") {
    return window.TcgCardSearch?.normalizeCompact(value) || cmNormalize(value).replace(/[^a-z0-9]+/g,"");
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
      product.set, product.setName, product.setCode, product.collectorNumber, product.rarity, product.variant,
      product.expansionId ? `expansion ${product.expansionId}` : "",
      product.metacardId ? `metacard ${product.metacardId}` : ""
    ].filter(Boolean).join(" "));
  }

  function cmResolveGermanName(product={}, localMaps=null, apiGermanName="") {
    const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
    const productId = cleanProductId(product.productId);
    const metacardId = cleanProductId(product.metacardId);
    const englishKey = cmNormalize(englishBase);
    return cmGermanNameCandidate(apiGermanName,englishBase)
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
  // Ein Max-EK darf niemals aufgerundet werden, da sonst der Mindest-ROI unterschritten werden kann.
  function cmFloorMoney(value) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return 0;
    return Math.floor((number + Number.EPSILON) * 100) / 100;
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

  function cmUpgradeDb(db, transaction) {
    let products;
    if (!db.objectStoreNames.contains("products")) products = db.createObjectStore("products", {keyPath:"productId"});
    else products = transaction.objectStore("products");
    if (!products.indexNames.contains("metacardId")) products.createIndex("metacardId", "metacardId", {unique:false});
    if (!products.indexNames.contains("expansionId")) products.createIndex("expansionId", "expansionId", {unique:false});
    if (!products.indexNames.contains("baseName")) products.createIndex("baseName", "baseName", {unique:false});

    let latest;
    if (!db.objectStoreNames.contains("latestPrices")) latest = db.createObjectStore("latestPrices", {keyPath:"productId"});
    else latest = transaction.objectStore("latestPrices");
    if (!latest.indexNames.contains("date")) latest.createIndex("date", "date", {unique:false});
    if (!latest.indexNames.contains("dailyChange")) latest.createIndex("dailyChange", "dailyChange", {unique:false});

    let history;
    if (!db.objectStoreNames.contains("priceHistory")) history = db.createObjectStore("priceHistory", {keyPath:"key"});
    else history = transaction.objectStore("priceHistory");
    if (!history.indexNames.contains("productId")) history.createIndex("productId", "productId", {unique:false});
    if (!history.indexNames.contains("date")) history.createIndex("date", "date", {unique:false});

    if (!db.objectStoreNames.contains("collectionRuns")) {
      const runs = db.createObjectStore("collectionRuns", {keyPath:"runId"});
      runs.createIndex("startedAt", "startedAt", {unique:false});
      runs.createIndex("status", "status", {unique:false});
    }
    if (!db.objectStoreNames.contains("dataSources")) db.createObjectStore("dataSources", {keyPath:"sourceId"});
    if (!db.objectStoreNames.contains("analysisMetrics")) {
      const metrics = db.createObjectStore("analysisMetrics", {keyPath:"key"});
      metrics.createIndex("productId", "productId", {unique:false});
      metrics.createIndex("date", "date", {unique:false});
    }
    if (!db.objectStoreNames.contains("germanAliases")) {
      const aliases = db.createObjectStore("germanAliases", {keyPath:"key"});
      aliases.createIndex("germanName", "germanName", {unique:false});
      aliases.createIndex("cardId", "cardId", {unique:false});
    }
  }

  function cmCache() {
    if (cmCacheManager) return cmCacheManager;
    cmCacheManager = window.TcgIndexedDbRecovery.createIndexedDbRecovery({
      indexedDB,
      name:CM_DB_NAME,
      version:CM_DB_VERSION,
      onUpgrade:(db,transaction)=>cmUpgradeDb(db,transaction),
      onStatus:event=>{
        if(event.status==="defect-detected") cmSetProgress("<strong>Defekter Cardmarket-Cache erkannt</strong><br>Der Oberflächen-Cache wird im Hintergrund sicher aus SQLite neu aufgebaut.",15,"warning");
        if(event.status==="repair-complete") {cmInvalidateCache();cmSetProgress("<strong>Cardmarket-Cache repariert</strong><br>Die dauerhaften SQLite-Daten blieben unverändert.",100,"success");}
        if(event.status==="repair-error") cmSetProgress(`<strong>Cache-Reparatur fehlgeschlagen</strong><br>${escapeHtml(event.error?.message||event.error||"Unbekannter Fehler")}`,100,"error");
      }
    });
    return cmCacheManager;
  }

  function cmOpenDb() { return cmCache().open(); }

  function cmRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Datenbankabfrage fehlgeschlagen."));
    });
  }

  async function cmRebuildCacheFromSqlite(db) {
    if (!window.desktopApp?.getCardmarketCacheSeed) return {products:0,latestPrices:0};
    let productOffset=0,priceOffset=0,productsDone=false,pricesDone=false,productCount=0,latestPriceCount=0;
    while(!productsDone||!pricesDone){
      const seed=await window.desktopApp.getCardmarketCacheSeed({productOffset,priceOffset,limit:2000});
      if(seed.products?.length) await cmPutRowsIntoDb(db,"products",seed.products);
      if(seed.latestPrices?.length) await cmPutRowsIntoDb(db,"latestPrices",seed.latestPrices);
      productOffset+=seed.products?.length||0;
      priceOffset+=seed.latestPrices?.length||0;
      productsDone=Boolean(seed.productsDone);
      pricesDone=Boolean(seed.pricesDone);
      productCount=Number(seed.productCount||0);
      latestPriceCount=Number(seed.latestPriceCount||0);
      if((!seed.products?.length&&!productsDone)||(!seed.latestPrices?.length&&!pricesDone)) throw new Error("SQLite-Cacheaufbau hat keinen Fortschritt erzielt.");
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    return {products:productCount,latestPrices:latestPriceCount};
  }

  function cmPutRowsIntoDb(db,storeName,rows) {
    if(!rows.length)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      let tx;
      try{tx=db.transaction(storeName,"readwrite");const store=tx.objectStore(storeName);rows.forEach(row=>store.put(row));}
      catch(error){reject(error);return;}
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(tx.error||new Error("Daten konnten nicht gespeichert werden."));
      tx.onabort=()=>reject(tx.error||new Error("Datenbankvorgang wurde abgebrochen."));
    });
  }

  function cmWithCacheRecovery(operation) {
    return cmCache().withRecovery(operation,{rebuild:cmRebuildCacheFromSqlite});
  }

  async function cmGetAll(storeName) {
    return cmWithCacheRecovery(db=>cmRequest(db.transaction(storeName,"readonly").objectStore(storeName).getAll()));
  }

  async function cmGet(storeName, key) {
    return cmWithCacheRecovery(db=>cmRequest(db.transaction(storeName,"readonly").objectStore(storeName).get(key)));
  }

  async function cmCount(storeName) {
    return cmWithCacheRecovery(db=>cmRequest(db.transaction(storeName,"readonly").objectStore(storeName).count()));
  }

  async function cmClearStore(storeName) {
    return cmWithCacheRecovery(db=>new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("Datenbank konnte nicht geleert werden."));
      tx.onabort = () => reject(tx.error || new Error("Datenbankvorgang wurde abgebrochen."));
    }));
  }

  async function cmPutChunk(storeName, rows) {
    if (!rows.length) return;
    await cmWithCacheRecovery(db=>cmPutRowsIntoDb(db,storeName,rows));
  }

  async function cmWriteRows(storeName, rows, onProgress, chunkSize=2000) {
    for (let start=0; start<rows.length; start+=chunkSize) {
      const chunk = rows.slice(start, start+chunkSize);
      await cmPutChunk(storeName, chunk);
      if (onProgress) onProgress(Math.min(rows.length, start+chunk.length), rows.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  async function cmSyncProductsToSqlite(rows, onProgress, options={}) {
    if (!rows.length) return 0;
    if (!window.desktopApp?.beginCardmarketImport) throw new Error("Die atomare SQLite-Importschnittstelle ist nicht verfügbar. Bitte den Manager neu starten.");
    const runId=String(options.runId||`catalog-${Date.now()}`);
    await window.desktopApp.beginCardmarketImport({
      runId,type:"products",source:"cardmarket_product_catalog",sourceId:"cardmarket_product_catalog",
      importedAt:String(options.importedAt||new Date().toISOString()),startedAt:String(options.startedAt||options.importedAt||new Date().toISOString()),
      fileName:String(options.source||"")
    });
    try{
      const chunkSize=2000;
      for(let start=0;start<rows.length;start+=chunkSize){
        const chunk=rows.slice(start,start+chunkSize);
        await window.desktopApp.appendCardmarketImport({runId,rows:chunk});
        if(onProgress)onProgress(Math.min(rows.length,start+chunk.length),rows.length);
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      const result=await window.desktopApp.commitCardmarketImport({
        runId,rowsRead:Number(options.rowsRead??rows.length),skippedRows:Number(options.skippedRows||0)
      });
      return Number(result?.written||0);
    }catch(error){
      await window.desktopApp.rollbackCardmarketImport?.({runId,errorMessage:String(error?.message||error)}).catch(()=>{});
      throw error;
    }
  }

  async function cmSyncPricesToSqlite(rows, snapshotDate, importedAt, onProgress, options={}) {
    if (!rows.length) return 0;
    if (!window.desktopApp?.beginCardmarketImport) throw new Error("Die atomare SQLite-Importschnittstelle ist nicht verfügbar. Bitte den Manager neu starten.");
    const runId=String(options.runId||`price-${snapshotDate}-${Date.now()}`);
    await window.desktopApp.beginCardmarketImport({
      runId,type:"prices",source:"cardmarket_price_guide",sourceId:"cardmarket_price_guide",
      snapshotDate,importedAt,startedAt:String(options.startedAt||importedAt),fileName:String(options.source||"")
    });
    try{
      const chunkSize=2000;
      for(let start=0;start<rows.length;start+=chunkSize){
        const chunk=rows.slice(start,start+chunkSize);
        await window.desktopApp.appendCardmarketImport({runId,rows:chunk});
        if(onProgress)onProgress(Math.min(rows.length,start+chunk.length),rows.length);
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      const result=await window.desktopApp.commitCardmarketImport({
        runId,rowsRead:Number(options.rowsRead??rows.length),skippedRows:Number(options.skippedRows||0)
      });
      return Number(result?.written||0);
    }catch(error){
      await window.desktopApp.rollbackCardmarketImport?.({runId,errorMessage:String(error?.message||error)}).catch(()=>{});
      throw error;
    }
  }

  function cmFriendlyImportError(error,label="Cardmarket-Import"){
    const raw=String(error?.message||error||"Unbekannter Fehler");
    const text=`${error?.name||""} ${error?.code||""} ${raw}`.toLowerCase();
    let reason="Der Import konnte nicht abgeschlossen werden.";
    const invalidFile=/json|unexpected token|unexpected end|syntaxerror/.test(text);
    if(invalidFile) reason="Die Datei ist unvollständig oder kein gültiges Cardmarket-JSON.";
    else if(/busy|locked/.test(text)) reason="Die Datenbank ist gerade beschäftigt. Bitte den Vorgang nach wenigen Sekunden erneut starten.";
    else if(/disk.*full|sqlite_full|enospc|quota/.test(text)) reason="Auf dem Datenträger ist nicht genügend freier Speicherplatz vorhanden.";
    else if(/constraint|malformed|corrupt/.test(text)) reason="Die Importdatei oder die Datenbank enthält widersprüchliche Daten. Vorhandene Daten wurden nicht verändert.";
    else if(/out of memory|allocation|too large/.test(text)) reason="Die Datei ist für den verfügbaren Arbeitsspeicher zu groß. Bitte andere Programme schließen und erneut versuchen.";
    else if(/unknownerror|internal error|indexeddb/.test(text)) reason="Der Oberflächen-Cache war beschädigt und wird automatisch aus SQLite neu aufgebaut.";
    const safety=invalidFile
      ? "Es wurden keine Daten verändert."
      : "Der atomare Import wurde vollständig zurückgerollt; der vorherige Datenstand bleibt erhalten.";
    const friendly=new Error(`${label} fehlgeschlagen. ${reason} ${safety}`);
    friendly.cause=error;
    friendly.originalMessage=raw;
    return friendly;
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
    cmGermanAliasCache = null;
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
    return ["tcg-cardmarket-data-v1","tcg-cardmarket-data-v2"].includes(payload?.format) && Array.isArray(payload.products) && Array.isArray(payload.priceHistory);
  }

  function cmKnownCatalogEntry(productId) {
    return state.productCatalog?.[productId] || BUILTIN_PRODUCT_CATALOG?.[productId] || {};
  }

  async function importCardmarketProductCatalogPayload(payload, source="products_singles_3.json") {
    const rows = cmProductRows(payload);
    if (!rows.length) throw new Error("Kein Cardmarket-Produktkatalog erkannt.");
    const importedAt = new Date().toISOString();
    const runId = `catalog-${Date.now()}`;
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
      const name = identity.baseName || identity.original || existing.name || String(known.name || "").trim() || `CM Produkt ${productId}`;
      const officialName = identity.original || existing.officialName || name;
      const rarity = String(raw?.rarity || known.rarity || identity.rarity || existing.rarity || "").trim();
      const variant = String(raw?.variant || identity.variant || existing.variant || "").trim();
      const set = String(raw?.set || raw?.setCode || known.set || existing.set || existing.setCode || "").trim();
      const setName = String(raw?.setName || raw?.expansionName || known.setName || existing.setName || "").trim();
      const expansionId = cleanProductId(raw?.idExpansion ?? raw?.expansionId);
      const metacardId = cleanProductId(raw?.idMetacard ?? raw?.metacardId);
      const germanName = String(raw?.germanName || known.germanName || existingGermanNames.get(productId) || "").trim();
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

    cmSetProgress(`<strong>Produktkatalog wird atomar in SQLite gespeichert …</strong><br>0 von ${prepared.length.toLocaleString("de-DE")} Produkten`, 0);
    let sqliteProducts=0;
    try{
      sqliteProducts=await cmSyncProductsToSqlite(prepared,(done,total)=>{
        const pctValue=total?done/total*85:85;
        cmSetProgress(`<strong>Produktkatalog wird atomar in SQLite gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,pctValue);
      },{runId,importedAt,startedAt:importedAt,source,rowsRead:rows.length,skippedRows:skipped});
    }catch(error){
      throw cmFriendlyImportError(error,"Produktkatalog-Import");
    }
    let cacheNote="";
    try{
      await cmWriteRows("products",prepared,(done,total)=>{
        const pctValue=total?85+done/total*15:100;
        cmSetProgress(`<strong>Oberflächen-Cache wird aktualisiert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,pctValue);
      });
    }catch(error){
      console.error("Produktcache wird nach erfolgreichem SQLite-Import neu aufgebaut:",error);
      await cmCache().repair({rebuild:cmRebuildCacheFromSqlite,automatic:true});
      cacheNote=" · Cache automatisch neu aufgebaut";
    }
    if (typeof refreshCardNameLookup === "function") await refreshCardNameLookup(true);
    window.tcgApplyBusinessProductMetadata?.(prepared);

    state.cardmarket = {
      ...CM_META_DEFAULTS,
      ...state.cardmarket,
      catalogImportedAt: importedAt,
      catalogCreatedAt: String(payload?.createdAt || ""),
      catalogVersion: String(payload?.version ?? ""),
      productCount: prepared.length,
      germanNameRevision: 0,
      germanNamesLastAutoAttemptDate: "",
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
    await cmRefreshMetadataFromDb();
    cmSetProgress(`<strong>Produktkatalog atomar importiert</strong><br>${prepared.length.toLocaleString("de-DE")} Produkte gespeichert${sqliteProducts ? ` · ${sqliteProducts.toLocaleString("de-DE")} in SQLite` : ""}${skipped ? ` · ${skipped} Zeilen übersprungen` : ""}${cacheNote}. Deutsche Namen werden anschließend automatisch ergänzt.`, 100, "success");
    if (state.cardmarket?.germanNamesAutoUpdate !== false) window.setTimeout(()=>cmRunGermanNamesAutoUpdate({force:true}),500);
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
      const calculation=cmMarketCalculation({...w,...price},{});
      if(w.pricingMode!=="manual"){
        w.maxBuy=Number(calculation.maxBuy||0);
        w.targetSell=Number(calculation.recommendedSell||0);
      }
      w.pricingUpdatedAt=new Date().toISOString();
      w.pricingMode=w.pricingMode||"automatic";
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
        let previousLow = null;
        let previousDate = "";
        if (previous && previous.date === snapshotDate) {
          previousTrend = cmNumber(previous.previousTrend);
          previousLow = cmNumber(previous.previousLow);
          previousDate = String(previous.previousDate || "");
        } else if (previous) {
          previousTrend = cmNumber(previous.trend);
          previousLow = cmNumber(previous.low);
          previousDate = String(previous.date || "");
        }
        const currentTrend = cmNumber(price.trend);
        const dailyChange = currentTrend !== null && previousTrend !== null ? currentTrend - previousTrend : null;
        latestRecord = {
          ...price,
          previousLow,
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

    cmSetProgress(`<strong>Preishistorie wird atomar in SQLite gespeichert …</strong><br>0 von ${historyRows.length.toLocaleString("de-DE")} Preiszeilen`,0);
    let sqlitePrices=0;
    try{
      sqlitePrices=await cmSyncPricesToSqlite(historyRows,snapshotDate,importedAt,(done,total)=>{
        const pctValue=total?done/total*85:85;
        cmSetProgress(`<strong>Preishistorie wird atomar in SQLite gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Preiszeilen`,pctValue);
      },{runId,startedAt:importedAt,source,rowsRead:rows.length,skippedRows:skipped});
    }catch(error){
      throw cmFriendlyImportError(error,"Price-Guide-Import");
    }
    let cacheNote="";
    try{
      await cmWriteRows("priceHistory",historyRows,(done,total)=>{
        const pctValue=total?85+done/total*10:95;
        cmSetProgress(`<strong>Oberflächen-Cache wird aktualisiert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Preiszeilen`,pctValue);
      });
      await cmWriteRows("latestPrices",latestRows,(done,total)=>{
        const pctValue=total?95+done/total*5:100;
        cmSetProgress(`<strong>Aktuelle Preisansicht wird zusammengeführt …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,pctValue);
      });
    }catch(error){
      console.error("Preiscache wird nach erfolgreichem SQLite-Import neu aufgebaut:",error);
      await cmCache().repair({rebuild:cmRebuildCacheFromSqlite,automatic:true});
      cacheNote=" · Cache automatisch neu aufgebaut";
    }
    await cmPutChunk("dataSources",[{
      sourceId:"cardmarket_price_guide",name:"Cardmarket Yu-Gi-Oh! Price Guide",
      type:"official_download",priority:90,enabled:true,updatedAt:importedAt
    }]);

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
        avg7:price.avg7 ?? "", avg30:price.avg30 ?? "", priceDate:snapshotDate,
        previousLow:price.previousLow ?? null, previousTrend:price.previousTrend ?? null,
        previousDate:price.previousDate || "", dailyChange:price.dailyChange ?? null,
        priceSource:"cardmarket_price_guide", priceScope:"official_unfiltered_reference"
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
    await cmRefreshMetadataFromDb();
    cmSetProgress(`<strong>Price Guide atomar importiert</strong><br>${historyRows.length.toLocaleString("de-DE")} Preise für ${snapshotDate} gespeichert${sqlitePrices ? ` · ${sqlitePrices.toLocaleString("de-DE")} in SQLite` : ""} · ${updatedWatchlist} Watchlist-Einträge aktualisiert${cacheNote}.`, 100, "success");
    return {type:"prices", rows:rows.length, cards:historyRows.length, sqlitePrices, updated:updatedWatchlist, snapshotDate, skipped};
  }

  async function cmLoadMergedCache() {
    if (cmMergedCache) return cmMergedCache;
    const [products, latest] = await Promise.all([cmGetAll("products"), cmGetAll("latestPrices")]);
    cmLatestByIdCache = new Map(latest.map(row => [String(row.productId), row]));
    cmProductByIdCache = new Map(products.map(row => [String(row.productId), row]));
    cmMergedCache = products.map(product => ({...product, ...(cmLatestByIdCache.get(String(product.productId)) || {})}));
    const businessChanges=window.tcgApplyBusinessProductMetadata?.(products)||0;
    if(businessChanges){saveState();window.setTimeout(()=>renderAll(),0);}
    return cmMergedCache;
  }

  window.tcgBackfillBusinessPrintMetadata=async function(productIds=[]) {
    await cmLoadMergedCache();
    const ids=new Set((Array.isArray(productIds)?productIds:[]).map(cleanProductId).filter(Boolean));
    const products=ids.size?[...ids].map(id=>cmProductByIdCache?.get(String(id))).filter(Boolean):[...(cmProductByIdCache?.values()||[])];
    return window.tcgApplyBusinessProductMetadata?.(products)||0;
  };

  function cmBuildOwnStats() {
    const map = new Map();
    const row = id => {
      const key = cleanProductId(id);
      if (!key) return null;
      if (!map.has(key)) map.set(key, {
        productId:key, inventory:0, reserved:0, unavailable:0, available:0,
        buyQty:0, buyTotal:0, bestBuy:null,
        sellQty:0, sellTotal:0, bestSell:null
      });
      return map.get(key);
    };

    state.inventory.forEach(item => {
      const stat = row(item.productId);
      if (!stat) return;
      if (!['Verkauft','Storniert'].includes(item.status)) {
        stat.inventory++;
        if (item.status === "Reserviert") stat.reserved++;
        else if (['Beschädigt','Rückgabe unterwegs'].includes(item.status)) stat.unavailable++;
        else stat.available++;
      }
    });

    const purchaseProductKeys = new Set();
    state.purchases.filter(p => p.status !== "Storniert").forEach(purchase => {
      const costs=window.TcgBusinessAutomation.allocatePurchaseCosts(purchase,purchase.costAllocationMethod||'value');
      costs.forEach((costRow,index) => {
        const item=costRow.item;
        const stat = row(item.productId);
        if (!stat) return;
        const receipt=costRow.receipt;
        const linked=state.inventory.filter(asset=>asset.status!=="Beschädigt"&&String(asset.purchaseId||'')===String(purchase.id||'')&&(String(asset.purchaseLineKey||'')===`${purchase.id}:${receipt.key}`||(!asset.purchaseLineKey&&cleanProductId(asset.productId)===cleanProductId(item.productId)))).length;
        const qty = Math.max(receipt.business,linked);
        const price = Number(costRow.unitCost||0);
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
    state.sales.filter(s => ["Abgeschlossen","Abgerechnet"].includes(s.status)).forEach(sale => {
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
    const hasPrintCode = Boolean(String(product.collectorNumber || product.setCode || "").trim().includes("-"));
    const hasVariant = Boolean(String(product.variant || product.rarity || "").trim());
    const exactVariant = hasSet && hasPrintCode && hasVariant && !product.printMetadataAmbiguous;
    let label = "Set, Nummer und Seltenheit fehlen";
    if (exactVariant) label = "Druckvariante vollständig";
    else if (hasSet && hasPrintCode && !hasVariant) label = product.printMetadataAmbiguous ? "Seltenheit nicht eindeutig" : "Seltenheit/Version fehlt";
    else if (hasSet && !hasPrintCode) label = "Setnummer fehlt";
    else if (hasSet) label = "Druckdaten unvollständig";
    return {hasGermanName,hasSet,hasPrintCode,hasVariant,exactVariant,label};
  }

  function cmPricingSettings(){
    const allocation=window.TcgBusinessAutomation.estimatePackagingPerCard(state,state.settings);
    return {...state.settings,minProfit:0,packaging:Number(allocation.perCard||0)};
  }

  function cmMarketCalculation(product, own={}, trendSignals={}) {
    // Datencenter, Watchlist und Bestandserfassung verwenden exakt dieselbe
    // Preisformel. So werden automatisch gesetzte Grenzen nicht anschließend
    // von einer zweiten Berechnung mit leicht anderen Rundungen überschrieben.
    const automaticTargets=window.TcgBusinessAutomation.calculateAutomaticPriceTargets(product,cmPricingSettings());
    const {recommendedSell,safeSell,feeRate,packaging,feeAmount,netBeforeBuy,minProfit,minRoi,targetRoi,maxByProfit,maxByRoi,maxBuy,marketReferenceSource,historicalReference}=automaticTargets;
    const {low,trend,avg1,avg7,avg30,pricePointCount}=automaticTargets;
    const hasPriceData=pricePointCount>0;
    const marketBuy=Number(automaticTargets.effectiveLow??automaticTargets.marketReference??0);
    const marketBuySource=automaticTargets.lowOutlier
      ? (automaticTargets.lowExUsed?"Cardmarket Low EX+ (Low-Ausreißer ausgeschlossen)":automaticTargets.marketReferenceSource)
      : automaticTargets.low!==null?"Cardmarket Low":automaticTargets.marketReferenceSource||"Keine EK-Referenz";
    const isCostCovering = netBeforeBuy > 0;
    const costShortfall = isCostCovering ? 0 : Math.abs(netBeforeBuy);
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
    const meetsProfit = marketBuy > 0 && profitAtMarket >= 0;
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
        score += roiFit * 22;
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
        recommendationReason = `Der erwartete Nettoerlös reicht nicht für ${Number(state.settings.minRoi||25)} % Mindest-ROI.`;
      } else if (eligible && marketBuy <= maxBuy*0.85) {
        recommendation = "TOP DEAL";
        recommendationReason = "Price-Guide Low liegt deutlich unter dem berechneten Max-EK. Vor dem Kauf muss das konkrete Angebot geprüft werden.";
      } else if (eligible) {
        recommendation = "KAUFEN";
        recommendationReason = "Price-Guide Low liegt innerhalb des berechneten Max-EK. Vor dem Kauf muss das konkrete Angebot geprüft werden.";
      } else if (marketBuy <= maxBuy*1.08) {
        recommendation = "BEOBACHTEN";
        recommendationReason = "Der Marktpreis liegt knapp über dem berechneten Einkaufslimit.";
      } else {
        recommendation = "NICHT KAUFEN";
        recommendationReason = !meetsProfit
          ? `Der mögliche Verkauf wäre mit ${money(profitAtMarket)} nicht kostendeckend.`
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
      quality, eligible, meetsProfit, meetsRoi, minProfit, minRoi, targetRoi, packaging,
      low, trend, avg1, avg7, avg30, marketReferenceSource, historicalReference,
      priceSources:automaticTargets.priceSources,priceExplanation:automaticTargets.priceExplanation
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
    const printCode = String(product.collectorNumber || product.setCode || product.set || "").trim();
    const printPart = printCode && printCode !== setText ? printCode : "Setnummer fehlt";
    const versionText = [product.variant, product.rarity].filter(Boolean).join(" · ");
    const versionPart = versionText || (product.printMetadataAmbiguous ? `Seltenheit nicht eindeutig (${Number(product.printMetadataCandidates||2)} mögliche Drucke)` : "Seltenheit/Version fehlt");
    return `${escapeHtml(setPart)} · ${escapeHtml(printPart)} · ${escapeHtml(versionPart)} · CM ${escapeHtml(product.productId)}`;
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

  async function cmAttachTradeRecommendations(groups) {
    if (!window.desktopApp?.getTradeRecommendations) return groups;
    const ids=[...new Set(groups.flatMap(group=>group.variants||[]).map(row=>String(row.productId||"")).filter(id=>/^\d+$/.test(id)))];
    const learnedById=new Map();
    for(let start=0;start<ids.length;start+=400){
      const result=await window.desktopApp.getTradeRecommendations({productIds:ids.slice(start,start+400),limit:100});
      (result?.recommendations||[]).forEach(row=>learnedById.set(String(row.productId),row));
    }
    groups.forEach(group=>(group.variants||[]).forEach(product=>{product.learnedPricing=learnedById.get(String(product.productId))||null;}));
    return groups;
  }

  async function cmSearchCatalogCards(queryRaw, limit=25) {
    if (window.desktopApp?.searchCards) {
      const result = await window.desktopApp.searchCards({query:queryRaw,limit,offset:0});
      if (!cmLatestByIdCache) {
        const latest = await cmGetAll("latestPrices");
        cmLatestByIdCache = new Map(latest.map(row => [String(row.productId),row]));
      }
      const groups = (result?.cards || []).map(card => ({
        ...card,
        variants:(card.variants || []).map(variant => ({
          ...variant,
          ...(cmLatestByIdCache.get(String(variant.productId)) || {}),
          germanName:card.germanName || variant.germanName || "",
          englishName:card.englishName || variant.englishName || variant.officialName || "",
          officialBaseName:card.englishName || variant.englishName || variant.officialName || "",
          name:card.germanName || variant.germanName || card.englishName || variant.englishName || variant.officialName || `CM Produkt ${variant.productId}`
        }))
      }));
      await cmAttachTradeRecommendations(groups);
      return {
        groups,
        products:groups.flatMap(group => group.variants),
        totalCards:Number(result?.totalCards || groups.length),
        sqlite:true
      };
    }

    const all = await cmLoadMergedCache();
    const query = cmNormalize(queryRaw);
    const rankedMatches = [];
    for (const product of all) {
      const values = [product.germanName,product.name,product.officialName,product.officialBaseName,product.searchText];
      const matches = window.TcgCardSearch?.matchesSearch
        ? window.TcgCardSearch.matchesSearch(values,queryRaw)
        : cmSearchRank(product,query) < 3;
      if (!matches) continue;
      rankedMatches.push({product,rank:cmSearchRank(product,query)});
    }
    rankedMatches.sort((a,b) => a.rank-b.rank || String(cmDisplayName(a.product)).localeCompare(String(cmDisplayName(b.product)),"de") || String(a.product.productId).localeCompare(String(b.product.productId)));
    const grouped = new Map();
    for (const {product,rank} of rankedMatches) {
      const key=String(product.metacardId || cmNormalize(product.officialBaseName || product.officialName || product.name || product.productId));
      if (!grouped.has(key)) grouped.set(key,{metacardId:key,germanName:cmGermanName(product),englishName:cmEnglishName(product),rank,variants:[]});
      grouped.get(key).variants.push(product);
    }
    const allGroups=[...grouped.values()];
    const groups=allGroups.slice(0,limit);
    await cmAttachTradeRecommendations(groups);
    return {groups,products:groups.flatMap(group => group.variants),totalCards:allGroups.length,sqlite:false};
  }

  // Die geführte Bestandserfassung nutzt denselben vollständigen Katalog und
  // dieselbe Preiskalkulation wie das Cardmarket-Datencenter.
  window.tcgSearchCatalogCards=cmSearchCatalogCards;
  window.tcgProductPricing=function(product={}){
    const own=cmBuildOwnStats().get(String(product.productId||""))||{};
    const calculated=cmMarketCalculation(product,own);
    const learned=product.learnedPricing||{};
    const ownedTargets=window.TcgBusinessAutomation.calculateOwnedCardPriceTargets(product,cmPricingSettings());
    const learnedSell=Number(learned.recommendedSell||0);
    const recommendedSell=learnedSell||Number(ownedTargets.suggestedSell||0);
    return {
      recommendedSell,
      recommendedBuy:Number(learned.recommendedBuy||calculated.maxBuy||0),
      marketSell:Number(ownedTargets.marketSell||calculated.recommendedSell||0),
      priceFloor:Number(ownedTargets.priceFloor||learned.priceFloor||0),
      quickSell:Number(ownedTargets.quickSell||learned.quickSell||0),
      marketLow:Number(calculated.marketBuy||0),
      expectedProfit:Number(ownedTargets.expectedProfit||0),
      profitableAtMarket:learned.profitableAtMarket!==false&&ownedTargets.profitableAtMarket!==false,
      priceDate:String(product.priceDate||product.date||state.cardmarket?.priceDate||""),
      priceSource:"Cardmarket Price Guide",
      confidence:learned.confidenceLevel||calculated.scoreConfidence||"low"
    };
  };

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
      const searchResult = await cmSearchCatalogCards(queryRaw,25);
      if (token !== cmRenderToken) return;
      const visible = searchResult.products;
      const ownMap = cmBuildOwnStats();
      if (summary) summary.textContent = `${searchResult.totalCards.toLocaleString("de-DE")} Karten gefunden · ${visible.length.toLocaleString("de-DE")} Druckvarianten der angezeigten Karten`;
      output.innerHTML = visible.length ? searchResult.groups.map(card => {
        const cardTitle=card.germanName || card.englishName || `Metacard ${card.metacardId}`;
        const secondary=card.germanName && card.englishName && cmNormalize(card.germanName)!==cmNormalize(card.englishName) ? ` · Englisch: ${card.englishName}` : "";
        const variants=card.variants.map(product => {
          const own = ownMap.get(String(product.productId)) || {};
          const calc = cmMarketCalculation(product, own);
          const learned=product.learnedPricing||{};
          const learnedLevel={high:"hoch",medium:"mittel",low:"niedrig"}[learned.confidenceLevel]||"";
          return `<tr>
          <td><strong>${escapeHtml(cmDisplayName(product))}</strong>${cmEnglishName(product) && cmNormalize(cmEnglishName(product)) !== cmNormalize(cmDisplayName(product)) ? `<br><small>Englisch: ${escapeHtml(cmEnglishName(product))}</small>` : ""}<br><small>${cmProductSubtitle(product)}</small></td>
          <td>${calc.marketBuy ? money(calc.marketBuy) : "-"}<br><small>Trend ${calc.trend !== null ? money(calc.trend) : "-"}</small></td>
          <td>${cmSignedMoney(calc.dailyChange)}${product.previousDate ? `<br><small>seit ${fmtDate(product.previousDate)}</small>` : ""}</td>
          <td>${cmSignedMoney(calc.reference7)}<br><small>Trend minus Ø 7</small></td>
          <td>${cmSignedMoney(calc.reference30)}<br><small>Trend minus Ø 30</small></td>
          <td>${calc.recommendedSell ? money(calc.recommendedSell) : "-"}${learned.recommendedSell?`<br><small>Handels-DB ${money(learned.recommendedSell)}</small>`:""}</td>
          <td><strong>${calc.maxBuy ? money(calc.maxBuy) : "-"}</strong>${learned.recommendedBuy?`<br><small>Handels-DB ${money(learned.recommendedBuy)}${learnedLevel?` · ${learnedLevel}`:""}</small>`:""}</td>
          <td>${calc.marketBuy ? `<span class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${money(calc.profitAtMarket)}</span><br><small>${pct(calc.roiAtMarket)} ROI</small>` : "-"}</td>
          <td>${Number(own.inventory || 0)} / ${Number(own.reserved || 0)}<br><small>${Number(own.available || 0)} verfügbar</small></td>
          <td>${cmRecommendationBadge(calc.recommendation)}<br><small>${escapeHtml(cmScoreLabel(calc))}</small><div class="row-actions cm-row-actions"><button class="icon-button" data-cm-details="${escapeHtml(product.productId)}">Details</button><button class="icon-button" data-cm-add-watch="${escapeHtml(product.productId)}">+ Watchlist</button></div></td>
        </tr>`;
        }).join("");
        return `<tr class="cm-search-card-group"><td colspan="10"><strong>${escapeHtml(cardTitle)}</strong>${escapeHtml(secondary)} · ${card.variants.length.toLocaleString("de-DE")} Druckvarianten</td></tr>${variants}`;
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
    const rows = await cmWithCacheRecovery(db=>{
      const tx = db.transaction("priceHistory", "readonly");
      const index = tx.objectStore("priceHistory").index("productId");
      return cmRequest(index.getAll(String(productId)));
    });
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
        <div class="cm-price-source-note"><strong>Offizieller Cardmarket Price Guide vom ${fmtDate(merged.date||state.cardmarket?.priceDate)||"unbekannten Datum"}</strong><span>Dies sind tägliche, ungefilterte Referenzwerte. Der live auf Cardmarket angezeigte Angebotspreis „ab“ kann durch Sprache, Zustand, Standort und aktuelle Angebote abweichen.</span></div>
        <div class="cm-detail-metrics">
          <div><span>Price Guide Low</span><strong>${calc.low !== null ? money(calc.low) : "-"}</strong></div>
          <div><span>Price Guide Trend</span><strong>${calc.trend !== null ? money(calc.trend) : "-"}</strong></div>
          <div><span>Δ 1 Tag</span><strong>${delta1.value===null?"–":cmSignedMoney(delta1.value)}</strong><small>${delta1.sourceDate?`gegen ${fmtDate(delta1.sourceDate)}`:escapeHtml(delta1.reason||"")}</small></div>
          <div><span>Δ 7 Tage</span><strong>${delta7.value===null?"–":cmSignedMoney(delta7.value)}</strong><small>${delta7.sourceDate?`gegen ${fmtDate(delta7.sourceDate)}`:escapeHtml(delta7.reason||"")}</small></div>
          <div><span>Δ 30 Tage</span><strong>${delta30.value===null?"–":cmSignedMoney(delta30.value)}</strong><small>${delta30.sourceDate?`gegen ${fmtDate(delta30.sourceDate)}`:escapeHtml(delta30.reason||"")}</small></div>
          <div><span>Δ 90 Tage</span><strong>${delta90.value===null?"–":cmSignedMoney(delta90.value)}</strong><small>${delta90.sourceDate?`gegen ${fmtDate(delta90.sourceDate)}`:escapeHtml(delta90.reason||"")}</small></div>
          <div><span>Empfohlener VK</span><strong>${calc.recommendedSell ? money(calc.recommendedSell) : "-"}</strong></div>
          <div><span>Empfohlener Max-EK</span><strong>${cmAnalysisMoney(calc.maxBuy)}</strong></div>
          <div><span>Gewinn bei Price Guide Low</span><strong class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${calc.marketBuy ? money(calc.profitAtMarket) : "-"}</strong></div>
          <div><span>ROI bei Price Guide Low</span><strong>${calc.marketBuy ? pct(calc.roiAtMarket) : "-"}</strong></div>
          <div><span>Eigener Ø EK</span><strong>${own.avgBuy ? money(own.avgBuy) : "-"}</strong></div>
          <div><span>Eigener Ø VK</span><strong>${own.avgSell ? money(own.avgSell) : "-"}</strong></div>
          <div><span>Bestand / reserviert</span><strong>${Number(own.inventory||0)} / ${Number(own.reserved||0)}</strong></div>
        </div>
        <div class="cm-decision-box"><div><span class="muted">Einkaufsempfehlung</span><br>${cmRecommendationBadge(calc.recommendation)}</div><div><span class="muted">Analysescore</span><br><strong>${escapeHtml(cmScoreLabel(calc))}</strong></div><p><strong>${escapeHtml(calc.recommendationReason)}</strong><br>Der Score verwendet nur echte gespeicherte Preisverläufe. Bei fehlender Historie oder unvollständiger Druckvariante wird er sichtbar begrenzt.<br><small>${escapeHtml(calc.priceExplanation||"")}</small></p></div>
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
    const key = [state.cardmarket.priceDate,state.cardmarket.priceImportedAt,state.settings.feePercent,state.settings.packaging,state.settings.expectedCardsPerOrder,state.settings.minRoi,state.settings.targetRoi,state.settings.safetyPercent,state.inventory.length,state.sales.length].join("|");
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
      const baseName=cmExtractIdentity(value || "").baseName;
      const spaced=cmNormalize(baseName);
      const compact=cmCompact(baseName);
      if (spaced && !keys.includes(`s:${spaced}`)) keys.push(`s:${spaced}`);
      if (compact && !keys.includes(`c:${compact}`)) keys.push(`c:${compact}`);
    }
    return keys;
  }

  function cmYgoKonamiId(row={}) {
    const direct = String(row?.konami_id || row?.konamiId || "").trim();
    if (direct) return direct;
    const miscRows = Array.isArray(row?.misc_info) ? row.misc_info : [];
    for (const info of miscRows) {
      const value = String(info?.konami_id || info?.konamiId || "").trim();
      if (value) return value;
    }
    return "";
  }

  function cmBuildLocalizedNameIndex(payload={}) {
    const idsByNameKey = new Map();
    const idsByCompactNameKey = new Map();
    const namesById = new Map();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {idsByNameKey,idsByCompactNameKey,namesById,count:0};
    let count = 0;
    for (const [name,rawIds] of Object.entries(payload)) {
      const cleanName = String(name || "").trim();
      const ids = (Array.isArray(rawIds) ? rawIds : [rawIds]).map(value => String(value || "").trim()).filter(Boolean);
      const nameKey = cmNormalize(cleanName);
      const compactNameKey = cmCompact(cleanName);
      if (!cleanName || !nameKey || !ids.length) continue;
      if (!idsByNameKey.has(nameKey)) idsByNameKey.set(nameKey,new Set());
      if (!idsByCompactNameKey.has(compactNameKey)) idsByCompactNameKey.set(compactNameKey,new Set());
      for (const id of ids) {
        idsByNameKey.get(nameKey).add(id);
        idsByCompactNameKey.get(compactNameKey).add(id);
        if (!namesById.has(id)) namesById.set(id,new Set());
        namesById.get(id).add(cleanName);
      }
      count++;
    }
    return {idsByNameKey,idsByCompactNameKey,namesById,count};
  }

  function cmUniqueNameIndexId(index,key="") {
    const ids = index?.idsByNameKey?.get(cmNormalize(key));
    return ids?.size === 1 ? [...ids][0] : "";
  }

  function cmLocalizedNameIds(index,spacedKey="",compactKey="") {
    const exact=index?.idsByNameKey?.get(spacedKey);
    if (exact?.size) return new Set(exact);
    return new Set(index?.idsByCompactNameKey?.get(compactKey) || []);
  }

  function cmBuildSqliteNameCatalog(products=[],englishRows=[],germanRows=[],resourceEnglishPayload={},resourceGermanPayload={}) {
    const germanByPasscode = new Map(germanRows
      .map(row => [String(row?.id || ""),String(row?.name || "").trim()])
      .filter(([id,name]) => id && name));
    const ygoByEnglishKey = new Map();
    for (const row of englishRows) for (const key of cmYgoNameKeys(row)) {
      if (!ygoByEnglishKey.has(key)) ygoByEnglishKey.set(key,[]);
      ygoByEnglishKey.get(key).push(row);
    }
    const resourceEnglish = cmBuildLocalizedNameIndex(resourceEnglishPayload);
    const resourceGerman = cmBuildLocalizedNameIndex(resourceGermanPayload);
    const byMetacard = new Map();

    for (const product of products) {
      const metacardId = cleanProductId(product?.metacardId);
      if (!metacardId) continue;
      if (!byMetacard.has(metacardId)) byMetacard.set(metacardId,{
        metacardId,externalIds:new Set(),englishNames:new Set(),germanNames:new Set(),
        englishAliases:new Set(),germanAliases:new Set(),passcodes:new Set(),ambiguous:false
      });
      const target = byMetacard.get(metacardId);
      const englishName = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
      const englishKey = cmNormalize(englishName);
      const englishCompactKey = cmCompact(englishName);
      if (englishName) {
        target.englishNames.add(englishName);
        target.englishAliases.add(englishName);
      }
      const exactYgoCandidates=ygoByEnglishKey.get(`s:${englishKey}`) || [];
      const ygoCandidates = [...new Set(exactYgoCandidates.length ? exactYgoCandidates : (ygoByEnglishKey.get(`c:${englishCompactKey}`) || []))];
      const uniqueYgoIds = new Set(ygoCandidates.map(row => String(row?.id || "")).filter(Boolean));
      const ygoCard = uniqueYgoIds.size === 1 ? ygoCandidates[0] : null;
      const passcode=String(ygoCard?.id||"").trim();
      if(/^\d{8}$/.test(passcode))target.passcodes.add(passcode);
      const resourceIds = cmLocalizedNameIds(resourceEnglish,englishKey,englishCompactKey);
      let externalId = cmYgoKonamiId(ygoCard || {});
      if (!externalId && resourceIds.size === 1) externalId = [...resourceIds][0];
      if (externalId) target.externalIds.add(externalId);
      if (!externalId && (uniqueYgoIds.size > 1 || resourceIds.size > 1)) target.ambiguous = true;

      const germanName = String(product.germanName || germanByPasscode.get(String(ygoCard?.id || "")) || "").trim();
      if (germanName) {
        target.germanNames.add(germanName);
        target.germanAliases.add(germanName);
      }
      if (ygoCard) {
        [ygoCard.name,ygoCard.beta_name].forEach(value => { if (value) target.englishAliases.add(String(value).trim()); });
      }
      if (externalId) {
        (resourceEnglish.namesById.get(externalId) || []).forEach(value => target.englishAliases.add(value));
        (resourceGerman.namesById.get(externalId) || []).forEach(value => target.germanAliases.add(value));
      }
    }

    const mappings = [];
    const aliases = [];
    const passcodes = [];
    let unmatchedMetacardCount = 0;
    let ambiguousMetacardCount = 0;
    for (const target of byMetacard.values()) {
      const externalIds = [...target.externalIds];
      const germanNames = [...target.germanNames];
      const englishNames = [...target.englishNames];
      const externalCardId = externalIds.length === 1 ? externalIds[0] : "";
      const nameEn = englishNames[0] || "";
      const ambiguous = target.ambiguous || externalIds.length > 1 || germanNames.length > 1;
      const nameDe = germanNames.length === 1
        ? germanNames[0]
        : (germanNames.length === 0 ? [...target.germanAliases][0] || "" : "");
      const matchStatus = ambiguous ? "ambiguous" : (nameDe ? "mapped" : (nameEn ? "english_only" : "unmatched"));
      if (matchStatus === "unmatched" || matchStatus === "english_only") unmatchedMetacardCount++;
      if (ambiguous) ambiguousMetacardCount++;
      mappings.push({
        metacardId:target.metacardId,externalCardId,nameDe,nameEn,
        matchMethod:externalCardId ? "konami_id_and_normalized_english_name" : "normalized_english_name",
        matchStatus
      });
      for (const alias of target.englishAliases) if (alias) aliases.push({metacardId:target.metacardId,language:"en",alias});
      for (const alias of target.germanAliases) if (alias) aliases.push({metacardId:target.metacardId,language:"de",alias});
      for (const passcode of target.passcodes) passcodes.push({metacardId:target.metacardId,passcode});
    }
    return {
      mappings,aliases,passcodes,
      status:{
        englishNameCount:resourceEnglish.count,
        germanNameCount:resourceGerman.count,
        mappedMetacardCount:mappings.length,
        germanMetacardCount:mappings.filter(row => row.nameDe).length,
        aliasCount:aliases.length,
        unmatchedMetacardCount,
        ambiguousMetacardCount
      },
      resourceEnglish,
      resourceGerman
    };
  }

  function cmBuildGermanAliasRows(englishRows=[], germanRows=[]) {
    const germanById = new Map(germanRows.map(row => [String(row?.id || ""), String(row?.name || "").trim()]).filter(([id,name]) => id && name));
    const rows = [];
    const seen = new Set();
    for (const englishRow of englishRows) {
      const cardId = String(englishRow?.id || "").trim();
      const germanName = cmGermanNameCandidate(germanById.get(cardId) || "", englishRow?.name || "");
      if (!cardId || !germanName) continue;
      const germanKey = cmNormalize(germanName);
      const englishKeys = cmYgoNameKeys(englishRow).map(key => key.slice(2));
      const englishNames = [englishRow?.name, englishRow?.beta_name, ...(Array.isArray(englishRow?.misc_info) ? englishRow.misc_info.flatMap(info => [info?.beta_name, info?.treated_as]) : [])]
        .map(value => String(value || "").trim())
        .filter(Boolean);
      if (!germanKey || !englishKeys.length) continue;
      const key = `${germanKey}|${cardId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        key,
        cardId,
        germanName,
        germanKey,
        englishNames:[...new Set(englishNames)],
        englishKeys:[...new Set(englishKeys)],
        updatedAt:new Date().toISOString()
      });
    }
    return rows;
  }

  async function cmLoadGermanAliasCache() {
    if (cmGermanAliasCache) return cmGermanAliasCache;
    const rows = await cmGetAll("germanAliases");
    cmGermanAliasCache = rows.map(row => ({
      ...row,
      germanKey:cmNormalize(row.germanKey || row.germanName || ""),
      englishKeys:[...new Set((row.englishKeys || row.englishNames || []).map(cmNormalize).filter(Boolean))]
    }));
    return cmGermanAliasCache;
  }

  function cmGermanAliasQueryVariants(rawQuery="", aliasRows=[]) {
    const query = cmNormalize(rawQuery);
    if (!query) return [];
    const variants = [];
    const add = value => { const normalized=cmNormalize(value); if (normalized && !variants.includes(normalized)) variants.push(normalized); };
    for (const row of aliasRows) {
      const germanKey = row.germanKey || cmNormalize(row.germanName || "");
      if (!germanKey) continue;
      const terms = query.split(/\s+/).filter(Boolean);
      const exact = germanKey === query;
      const phrase = germanKey.includes(query) || query.includes(germanKey);
      const allTerms = terms.length >= 2 && terms.every(term => germanKey.includes(term));
      if (!exact && !phrase && !allTerms) continue;
      (row.englishKeys || []).forEach(add);
      if (exact) break;
    }
    return variants;
  }

  function cmSetCodeDetails(value="") {
    const fullCode = String(value || "").trim().toUpperCase();
    if (!fullCode) return {fullCode:"",prefix:"",language:"",number:"",neutralCode:""};
    const localized = fullCode.match(/^([A-Z0-9/]{2,12})-([A-Z]{2})([0-9]{1,4}[A-Z]?)$/);
    if (localized) {
      return {
        fullCode,
        prefix:localized[1],
        language:localized[2],
        number:localized[3],
        neutralCode:`${localized[1]}-${localized[3]}`
      };
    }
    const neutral = fullCode.match(/^([A-Z0-9/]{2,12})-([0-9]{1,4}[A-Z]?)$/);
    if (neutral) {
      return {fullCode,prefix:neutral[1],language:"",number:neutral[2],neutralCode:fullCode};
    }
    const prefix = fullCode.match(/^([A-Z0-9/]{2,12})-/)?.[1] || fullCode;
    return {fullCode,prefix,language:"",number:"",neutralCode:fullCode};
  }

  function cmSetCodePrefix(value="") {
    return cmSetCodeDetails(value).prefix;
  }

  function cmRarityKey(value="") {
    return cmNormalize(String(value || "")
      .replace(/quarter century secret rare/gi,"qcsr")
      .replace(/prismatic secret rare/gi,"prismatic secret")
      .replace(/platinum secret rare/gi,"platinum secret"));
  }

  function cmRowsForMappedSet(ygoSets=[], mappedSet=null) {
    if (!mappedSet) return [];
    return (Array.isArray(ygoSets) ? ygoSets : []).filter(row => {
      const nameMatches = mappedSet.setName && cmNormalize(row?.set_name) === cmNormalize(mappedSet.setName);
      const codeMatches = mappedSet.setCode && cmSetCodePrefix(row?.set_code) === cmSetCodePrefix(mappedSet.setCode);
      return nameMatches || codeMatches;
    });
  }

  function cmResolvePrintMetadata(product={}, matchingRows=[]) {
    const rows = (Array.isArray(matchingRows) ? matchingRows : []).filter(Boolean);
    if (!rows.length) return {ambiguous:false,exact:false};
    const known = cmKnownCatalogEntry(product.productId);
    const collectorHint = String(product.collectorNumber || known.collectorNumber || "").trim().toUpperCase();
    const rarityHint = String(product.rarity || known.rarity || cmExtractIdentity(product.officialName || product.name || "").rarity || "").trim();
    let candidates = rows.slice();

    if (collectorHint) {
      const hintDetails = cmSetCodeDetails(collectorHint);
      const byCode = candidates.filter(row => {
        const details = cmSetCodeDetails(row?.set_code);
        return details.fullCode === hintDetails.fullCode || (hintDetails.neutralCode && details.neutralCode === hintDetails.neutralCode);
      });
      if (byCode.length) candidates = byCode;
    }
    if (rarityHint) {
      const key = cmRarityKey(rarityHint);
      const byRarity = candidates.filter(row => cmRarityKey(row?.set_rarity) === key);
      if (byRarity.length) candidates = byRarity;
    }

    const uniqueCodes = new Map();
    const uniqueRarities = new Map();
    for (const row of candidates) {
      const code = String(row?.set_code || "").trim().toUpperCase();
      const rarity = String(row?.set_rarity || "").trim();
      if (code) uniqueCodes.set(code,row);
      if (rarity) uniqueRarities.set(cmRarityKey(rarity),rarity);
    }
    const codeRow = uniqueCodes.size === 1 ? [...uniqueCodes.values()][0] : null;
    const fullCode = codeRow ? String(codeRow.set_code || "").trim().toUpperCase() : "";
    const codeDetails = cmSetCodeDetails(fullCode);
    const rarity = uniqueRarities.size === 1 ? [...uniqueRarities.values()][0] : "";
    const exact = candidates.length === 1 || Boolean(fullCode && rarity && (collectorHint || rarityHint));
    return {
      setName:String((candidates[0] || rows[0])?.set_name || "").trim(),
      setPrefix:codeDetails.prefix || cmSetCodePrefix((candidates[0] || rows[0])?.set_code),
      fullCode,
      neutralCode:codeDetails.neutralCode,
      collectorNumber:fullCode,
      rarity,
      exact,
      ambiguous:candidates.length > 1 && !(fullCode && rarity),
      candidateCount:candidates.length
    };
  }

  function cmBuildExpansionSetMap(products, cardByEnglishKey) {
    const cardsByExpansion = new Map();
    for (const product of products) {
      const expansionId = String(product.expansionId || "").trim();
      if (!expansionId) continue;
      const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
      const ygoCard = cardByEnglishKey.get(`s:${cmNormalize(englishBase)}`) || cardByEnglishKey.get(`c:${cmCompact(englishBase)}`);
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

  async function cmApplyGermanNames(englishPayload, germanPayload, source="YGOPRODeck + YGOResources", resources={}) {
    const products = await cmGetAll("products");
    if (!products.length) throw new Error("Bitte zuerst den Cardmarket-Produktkatalog importieren.");
    const englishRows = cmYgoRows(englishPayload);
    const germanRows = cmYgoRows(germanPayload);
    if (!englishRows.length || !germanRows.length) throw new Error("Die englische oder deutsche Kartendatenbank enthält keine Karten.");

    const germanById = new Map(germanRows.map(row => [String(row.id || ""), String(row.name || "").trim()]).filter(([id,name]) => id && name));
    const germanAliasRows = cmBuildGermanAliasRows(englishRows,germanRows);
    const resourceEnglish = cmBuildLocalizedNameIndex(resources?.english);
    const resourceGerman = cmBuildLocalizedNameIndex(resources?.german);
    const cardCandidatesByEnglishKey = new Map();
    for (const row of englishRows) {
      for (const key of cmYgoNameKeys(row)) {
        if (!cardCandidatesByEnglishKey.has(key)) cardCandidatesByEnglishKey.set(key,[]);
        cardCandidatesByEnglishKey.get(key).push(row);
      }
    }
    const cardByEnglishKey = new Map([...cardCandidatesByEnglishKey].flatMap(([key,rows]) => {
      const uniqueIds = new Set(rows.map(row => String(row?.id || "")).filter(Boolean));
      return uniqueIds.size === 1 ? [[key,rows[0]]] : [];
    }));

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
    let setCodeCount = 0;
    let rarityCount = 0;
    let exactPrintCount = 0;
    let ambiguousPrintCount = 0;
    let updated = products.map(product => {
      const englishBase = cmExtractIdentity(product.officialBaseName || product.officialName || product.name || "").baseName;
      const englishKey = cmNormalize(englishBase);
      const englishCompactKey = cmCompact(englishBase);
      const ygoCard = cardByEnglishKey.get(`s:${englishKey}`) || cardByEnglishKey.get(`c:${englishCompactKey}`);
      const resourceIds = cmLocalizedNameIds(resourceEnglish,englishKey,englishCompactKey);
      const externalCardId = cmYgoKonamiId(ygoCard || {}) || (resourceIds.size === 1 ? [...resourceIds][0] : "");
      const resourceGermanName = externalCardId ? [...(resourceGerman.namesById.get(externalCardId) || [])][0] || "" : "";
      const apiGermanName = (ygoCard ? germanById.get(String(ygoCard.id || "")) || "" : "") || resourceGermanName;
      const germanName = cmResolveGermanName(product,localMaps,apiGermanName);
      const patch = {};

      if (germanName) {
        patch.germanName = germanName;
        matched++;
      } else {
        unchanged++;
      }

      // Set, Kartennummer und Seltenheit werden aus den Druckdaten ergänzt.
      // Cardmarket veröffentlicht im Produktkatalog nur die Expansion-ID. Deshalb werden
      // nur eindeutige oder bereits lokal bestätigte Zuordnungen als exakte Druckvariante markiert.
      const ygoSets = Array.isArray(ygoCard?.card_sets) ? ygoCard.card_sets.filter(Boolean) : [];
      const mappedSet = expansionSetMap.get(String(product.expansionId || ""));
      let matchingRows = cmRowsForMappedSet(ygoSets,mappedSet);
      if (!matchingRows.length && ygoSets.length === 1) matchingRows = ygoSets.slice();
      const printMeta = cmResolvePrintMetadata(product,matchingRows);
      if (mappedSet || printMeta.setName) {
        const setName = printMeta.setName || mappedSet?.setName || "";
        const setPrefix = printMeta.setPrefix || mappedSet?.setCode || "";
        if (!product.setName && setName) patch.setName = setName;
        if (!product.set && setPrefix) patch.set = setPrefix;
        if (!String(product.setCode || "").includes("-") && printMeta.fullCode) patch.setCode = printMeta.fullCode;
        else if (!product.setCode && setPrefix) patch.setCode = setPrefix;
        if (!product.collectorNumber && printMeta.collectorNumber) patch.collectorNumber = printMeta.collectorNumber;
        if (!product.rarity && printMeta.rarity) patch.rarity = printMeta.rarity;
        patch.setMatchConfidence = Number((mappedSet?.coverage ?? (printMeta.exact ? 1 : 0)).toFixed(3));
        patch.setDataSource = printMeta.exact ? "Eindeutiger Druckdaten-Abgleich" : "Expansion-ID-Abgleich";
        patch.printMetadataExact = Boolean(printMeta.exact);
        patch.printMetadataAmbiguous = Boolean(printMeta.ambiguous);
        patch.printMetadataCandidates = Number(printMeta.candidateCount || 0);
        if (patch.setName || patch.set || patch.setCode || patch.collectorNumber || patch.rarity) {
          setDetailCount++;
          setMappingCount++;
        }
      }

      const merged = {...product,...patch};
      return {...merged,searchText:cmSearchTextForProduct(merged)};
    });

    setCodeCount = updated.reduce((sum,product) => sum + (String(product.collectorNumber || product.setCode || "").includes("-") ? 1 : 0),0);
    rarityCount = updated.reduce((sum,product) => sum + (String(product.rarity || "").trim() ? 1 : 0),0);
    exactPrintCount = updated.reduce((sum,product) => sum + (product.printMetadataExact ? 1 : 0),0);
    ambiguousPrintCount = updated.reduce((sum,product) => sum + (product.printMetadataAmbiguous ? 1 : 0),0);

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
    await cmWriteRows("products",updated,(done,total)=>cmSetProgress(`<strong>Deutsche Kartennamen werden lokal gespeichert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,done/Math.max(1,total)*75));
    await cmClearStore("germanAliases");
    await cmWriteRows("germanAliases",germanAliasRows,(done,total)=>cmSetProgress(`<strong>Zweisprachiger Suchindex wird aufgebaut …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Kartenaliasen`,75+done/Math.max(1,total)*10));
    await cmSyncProductsToSqlite(updated,(done,total)=>cmSetProgress(`<strong>Deutsche Kartennamen werden in SQLite aktualisiert …</strong><br>${done.toLocaleString("de-DE")} von ${total.toLocaleString("de-DE")} Produkten`,85+done/Math.max(1,total)*15));
    const sqliteCatalog = cmBuildSqliteNameCatalog(updated,englishRows,germanRows,resources?.english,resources?.german);
    state.cardNamePasscodes=sqliteCatalog.passcodes.map(row=>({...row}));
    const germanMetacards = new Set(sqliteCatalog.mappings.filter(row => row.nameDe).map(row => String(row.metacardId)));
    matched = updated.reduce((count,product) => count + (germanMetacards.has(String(product.metacardId || "")) ? 1 : 0),0);
    unchanged = Math.max(0,updated.length-matched);
    let sqliteResult = {mappingsWritten:0,aliasesWritten:0};
    if (window.desktopApp?.upsertCardNames) {
      cmSetProgress(`<strong>Zweisprachiger SQLite-Suchindex wird gespeichert …</strong><br>${sqliteCatalog.mappings.length.toLocaleString("de-DE")} Karten mit allen Druckvarianten`,96);
      sqliteResult = await window.desktopApp.upsertCardNames({
        mappings:sqliteCatalog.mappings,
        aliases:sqliteCatalog.aliases,
        status:sqliteCatalog.status,
        source,
        sourceRevision:String(resources?.revision || `index-schema-${CM_GERMAN_NAME_REVISION}`),
        updatedAt:new Date().toISOString(),
        replaceAliases:true
      });
      if (typeof refreshCardNameLookup === "function") await refreshCardNameLookup(true);
    }

    window.tcgApplyBusinessProductMetadata?.(updated);

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
        metacardId:product.metacardId || state.productCatalog[productId].metacardId || "",
        set:product.set || state.productCatalog[productId].set || "",
        setName:product.setName || state.productCatalog[productId].setName || "",
        setCode:product.setCode || state.productCatalog[productId].setCode || "",
        collectorNumber:product.collectorNumber || state.productCatalog[productId].collectorNumber || "",
        rarity:product.rarity || state.productCatalog[productId].rarity || "",
        variant:product.variant || state.productCatalog[productId].variant || ""
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
      germanNameCoveragePercent:Number((matched/Math.max(1,updated.length)*100).toFixed(1)),
      germanAliasCount:sqliteCatalog.status.aliasCount || germanAliasRows.length,
      germanUniqueCardCount:sqliteCatalog.status.germanMetacardCount,
      germanNameUnmatchedMetacardCount:sqliteCatalog.status.unmatchedMetacardCount,
      germanNameAmbiguousMetacardCount:sqliteCatalog.status.ambiguousMetacardCount,
      cardDataImportedAt:importedAt,
      setDetailCount,
      setMappingCount,
      setCodeCount,
      rarityCount,
      exactPrintCount,
      ambiguousPrintCount,
      lastError:""
    };
    state.imports.push({id:uid(),type:"names",key:`german-names-${Date.now()}`,file:source,date:importedAt,rows:englishRows.length,cards:matched,unmatched:unchanged,verifiedFallbacks:verifiedFallbackCount,setDetails:setDetailCount,setMappings:setMappingCount,setCodes:setCodeCount,rarities:rarityCount,exactPrints:exactPrintCount,ambiguousPrints:ambiguousPrintCount,germanAliases:sqliteCatalog.status.aliasCount});
    cmInvalidateCache();
    saveState();
    renderAll();
    cmSetProgress(`<strong>Deutsche Karten- und Druckdaten gespeichert</strong><br>${matched.toLocaleString("de-DE")} Namen · ${setCodeCount.toLocaleString("de-DE")} Setnummern · ${rarityCount.toLocaleString("de-DE")} Seltenheiten${ambiguousPrintCount?` · ${ambiguousPrintCount.toLocaleString("de-DE")} Varianten bewusst als mehrdeutig markiert`:""}.`,100,"success");
    return {matched,unmatched:unchanged,verifiedFallbackCount,setDetailCount,setMappingCount,setCodeCount,rarityCount,exactPrintCount,ambiguousPrintCount,sqliteCatalog:sqliteCatalog.status,sqliteResult};
  }

  async function cmRepairKnownGermanNames() {
    if (Number(state.cardmarket?.productCount || 0) <= 0) return {changed:0};
    if (Number(state.cardmarket?.localGermanRepairRevision || 0) >= 1) return {changed:0};

    const products = await cmGetAll("products");
    if (!products.length) return {changed:0};
    const localMaps = cmBuildLocalGermanNameMaps(products);
    let verifiedFallbackCount = 0;
    let updated = products.map(product => {
      const resolved = cmResolveGermanName(product,localMaps,"");
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
      localGermanRepairRevision:1,
      germanNameCount,
      germanNameVerifiedFallbackCount:verifiedFallbackCount,
      lastError:""
    };
    saveState();
    if (changedRows.length) renderAll();
    return {changed:changedRows.length,germanNameCount,verifiedFallbackCount};
  }

  function cmDaysSinceIso(value="") {
    const time = Date.parse(String(value || ""));
    if (!Number.isFinite(time)) return Infinity;
    return Math.max(0,(Date.now()-time)/86400000);
  }

  function cmShouldRefreshGermanNames(force=false) {
    if (force) return true;
    if (state.cardmarket?.germanNamesAutoUpdate === false) return false;
    if (Number(state.cardmarket?.productCount || 0) <= 0) return false;
    if (Number(state.cardmarket?.germanNameRevision || 0) < CM_GERMAN_NAME_REVISION) return true;
    const importedAt=String(state.cardmarket?.germanNamesImportedAt || "");
    const catalogAt=String(state.cardmarket?.catalogImportedAt || "");
    if (!importedAt || Number(state.cardmarket?.germanNameCount || 0) <= 0) return true;
    if (catalogAt && Date.parse(catalogAt) > Date.parse(importedAt)) return true;
    return cmDaysSinceIso(importedAt) >= CM_GERMAN_NAME_REFRESH_DAYS;
  }

  async function cmLoadGermanNamesOnline(options={}) {
    const {automatic=false,force=false}=options || {};
    if (!cmShouldRefreshGermanNames(force) && automatic) return {skipped:true,reason:"aktuell"};
    if (Number(state.cardmarket?.productCount || 0) <= 0) throw new Error("Bitte zuerst den Cardmarket-Produktkatalog importieren.");
    if (cmGermanNamesUpdatePromise) return cmGermanNamesUpdatePromise;
    cmGermanNamesUpdatePromise=(async()=>{
      cmSetProgress(`<strong>Vollständiger zweisprachiger Namenskatalog wird geladen …</strong><br>YGOPRODeck-Metadaten und die deutschen/englischen YGOResources-Namensindizes werden über offizielle Karten-IDs verbunden.`,8);
      const [englishResponse,germanResponse,resourceEnglishResponse,resourceGermanResponse] = await Promise.all([
        fetch(YGOPRO_EN_URL,{cache:"no-store"}),
        fetch(YGOPRO_DE_URL,{cache:"no-store"}),
        fetch(YGORESOURCES_EN_NAMES_URL,{cache:"no-store"}),
        fetch(YGORESOURCES_DE_NAMES_URL,{cache:"no-store"})
      ]);
      if (!englishResponse.ok) throw new Error(`Englische Kartendatenbank konnte nicht geladen werden (${englishResponse.status}).`);
      if (!germanResponse.ok) throw new Error(`Deutsche Kartendatenbank konnte nicht geladen werden (${germanResponse.status}).`);
      if (!resourceEnglishResponse.ok) throw new Error(`Englischer YGOResources-Namensindex konnte nicht geladen werden (${resourceEnglishResponse.status}).`);
      if (!resourceGermanResponse.ok) throw new Error(`Deutscher YGOResources-Namensindex konnte nicht geladen werden (${resourceGermanResponse.status}).`);
      const englishPayload=await englishResponse.json();
      const germanPayload=await germanResponse.json();
      const resourceEnglishPayload=await resourceEnglishResponse.json();
      const resourceGermanPayload=await resourceGermanResponse.json();
      const resourceRevision=resourceGermanResponse.headers.get("x-cache-revision") || resourceEnglishResponse.headers.get("x-cache-revision") || "";
      const englishCount=cmYgoRows(englishPayload).length;
      const germanCount=cmYgoRows(germanPayload).length;
      const resourceEnglishCount=cmBuildLocalizedNameIndex(resourceEnglishPayload).count;
      const resourceGermanCount=cmBuildLocalizedNameIndex(resourceGermanPayload).count;
      cmSetProgress(`<strong>Alle verfügbaren deutschen und englischen Kartennamen werden abgeglichen …</strong><br>${resourceGermanCount.toLocaleString("de-DE")} deutsche · ${resourceEnglishCount.toLocaleString("de-DE")} englische Namenseinträge`,20);
      const source=automatic?"YGOResources + YGOPRODeck (DE/EN, automatisch)":"YGOResources + YGOPRODeck (DE/EN, manuell)";
      const result=await cmApplyGermanNames(englishPayload,germanPayload,source,{
        english:resourceEnglishPayload,
        german:resourceGermanPayload,
        revision:resourceRevision
      });
      const productCount=Math.max(1,Number(state.cardmarket?.productCount || 0));
      const coverage=Math.min(100,Number(result.matched || 0)/productCount*100);
      state.cardmarket={
        ...CM_META_DEFAULTS,
        ...state.cardmarket,
        germanNameCoveragePercent:Number(coverage.toFixed(1)),
        germanApiEnglishCount:englishCount,
        germanApiGermanCount:germanCount,
        ygoResourcesEnglishNameCount:resourceEnglishCount,
        ygoResourcesGermanNameCount:resourceGermanCount,
        ygoResourcesRevision:resourceRevision,
        germanNamesLastAutoSuccessDate:automatic?todayISO():String(state.cardmarket?.germanNamesLastAutoSuccessDate || ""),
        germanNamesLastError:""
      };
      saveState();
      renderAll();
      return {...result,englishCount,germanCount,resourceEnglishCount,resourceGermanCount,resourceRevision,coverage};
    })();
    try { return await cmGermanNamesUpdatePromise; }
    finally { cmGermanNamesUpdatePromise=null; }
  }

  window.tcgRefreshBusinessPrintMetadata=async function() {
    const result=await cmLoadGermanNamesOnline({automatic:false,force:true});
    const products=await cmGetAll("products");
    const changed=window.tcgApplyBusinessProductMetadata?.(products)||0;
    if(changed){saveState();renderAll();}
    return {...result,businessFieldsChanged:changed};
  };

  async function cmRunGermanNamesAutoUpdate(options={}) {
    const force=Boolean(options?.force);
    const today=todayISO();
    if (!cmShouldRefreshGermanNames(force)) return {skipped:true,reason:"aktuell"};
    if (!force && String(state.cardmarket?.germanNamesLastAutoAttemptDate || "")===today) return {skipped:true,reason:"heute bereits versucht"};
    state.cardmarket.germanNamesLastAutoAttemptDate=today;
    saveState();
    try {
      return await cmLoadGermanNamesOnline({automatic:true,force});
    } catch(error) {
      state.cardmarket.germanNamesLastError=String(error?.message || error || "Deutsche Kartennamen konnten nicht aktualisiert werden");
      saveState();
      console.error("Automatische Aktualisierung deutscher Kartennamen fehlgeschlagen:",error);
      return {skipped:false,error:state.cardmarket.germanNamesLastError};
    }
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
    const germanAuto=document.getElementById("cmGermanNamesAutoUpdate");
    if (germanAuto) germanAuto.checked=meta.germanNamesAutoUpdate !== false;
    setText("cmProductCount", Number(meta.productCount || 0).toLocaleString("de-DE"));
    setText("cmLatestPriceCount", Number(meta.priceRowCount || 0).toLocaleString("de-DE"));
    setText("cmSnapshotCount", Number(meta.sqliteSnapshotCount || meta.snapshotDates?.length || 0).toLocaleString("de-DE"));
    setText("cmLatestPriceDate", meta.priceDate ? fmtDate(meta.priceDate) : "Noch kein Import");
    setText("cmGermanNameCount", Number(meta.germanNameCount || 0).toLocaleString("de-DE"));
    setText("cmGermanNameStatus", meta.germanNamesImportedAt ? `Lokal gespeichert · ${new Date(meta.germanNamesImportedAt).toLocaleString("de-DE")} · ${Number(meta.germanUniqueCardCount||0).toLocaleString("de-DE")} eindeutige deutsche Karten · ${Number(meta.germanNameCount||0).toLocaleString("de-DE")} zugeordnete Druckvarianten · ${Number(meta.setCodeCount||0).toLocaleString("de-DE")} Setnummern · ${Number(meta.rarityCount||0).toLocaleString("de-DE")} Seltenheiten${Number(meta.germanNameUnmatchedMetacardCount||0)>0?` · ${Number(meta.germanNameUnmatchedMetacardCount).toLocaleString("de-DE")} Einträge ohne verfügbaren eindeutigen offiziellen DE-Namen`:""}${Number(meta.germanNameAmbiguousMetacardCount||0)>0?` · ${Number(meta.germanNameAmbiguousMetacardCount).toLocaleString("de-DE")} mehrdeutige Namenszuordnungen`:""}${Number(meta.ambiguousPrintCount||0)>0?` · ${Number(meta.ambiguousPrintCount).toLocaleString("de-DE")} mehrdeutige Druckvarianten`:""}` : "Noch nicht geladen · wird automatisch ergänzt");
    setText("cmCatalogStatus", meta.catalogImportedAt ? `Importiert am ${new Date(meta.catalogImportedAt).toLocaleString("de-DE")} · Quelle ${meta.catalogCreatedAt ? fmtDate(meta.catalogCreatedAt) : "ohne Datum"}` : "Noch kein Produktkatalog importiert");
    setText("cmPriceStatus", meta.priceImportedAt ? `Importiert am ${new Date(meta.priceImportedAt).toLocaleString("de-DE")} · Preisstand ${fmtDate(meta.priceDate)}` : "Noch kein Price Guide importiert");
    const lastImport=meta.lastSuccessfulImport;
    setText("cmLastSuccessfulImport",lastImport?.finishedAt
      ? `Letzter erfolgreicher Import am: ${new Date(lastImport.finishedAt).toLocaleString("de-DE")}`
      : "Letzter erfolgreicher Import am: noch keiner");
    const protocol=document.getElementById("cmImportProtocol");
    if(protocol){
      const labels={cardmarket_price_guide:"Price Guide",cardmarket_product_catalog:"Produktkatalog"};
      const runs=Array.isArray(meta.recentImportRuns)?meta.recentImportRuns:[];
      protocol.innerHTML=runs.length?runs.map(run=>{
        const when=run.finishedAt||run.startedAt;
        const status=run.status==="success"?"Erfolgreich":"Fehlgeschlagen";
        return `<div><strong>${escapeHtml(labels[run.source]||run.source||"Cardmarket-Import")}</strong> · ${escapeHtml(status)} · ${Number(run.rowsWritten||0).toLocaleString("de-DE")} Produkte/Preise geladen${when?` · ${escapeHtml(new Date(when).toLocaleString("de-DE"))}`:""}${run.errorMessage?`<br><small class="money-negative">${escapeHtml(run.errorMessage)}</small>`:""}</div>`;
      }).join(""):'<span class="muted">Noch kein Importprotokoll vorhanden.</span>';
    }
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
      const [products, latest, history, sqliteStatus, snapshotRows, cardNameStatus] = await Promise.all([
        cmCount("products"),
        cmCount("latestPrices"),
        cmCount("priceHistory"),
        window.desktopApp?.getDatabaseStatus ? window.desktopApp.getDatabaseStatus() : null,
        window.desktopApp?.getSnapshotDates ? window.desktopApp.getSnapshotDates({limit:365}) : [],
        window.desktopApp?.getCardNameStatus ? window.desktopApp.getCardNameStatus() : null
      ]);
      let changed = false;
      if (products !== Number(state.cardmarket.productCount || 0)) { state.cardmarket.productCount=products; changed=true; }
      if (latest && !state.cardmarket.priceRowCount) { state.cardmarket.priceRowCount=latest; changed=true; }
      const durableHistoryCount=sqliteStatus?.ready ? Number(sqliteStatus.marketPriceCount||0) : history;
      if (durableHistoryCount !== Number(state.cardmarket.historyRowCount || 0)) { state.cardmarket.historyRowCount=durableHistoryCount; changed=true; }
      if (Array.isArray(snapshotRows) && snapshotRows.length) {
        const dates=snapshotRows.map(row=>String(row.date||"")).filter(Boolean);
        if (JSON.stringify(dates)!==JSON.stringify(state.cardmarket.snapshotDates||[])) { state.cardmarket.snapshotDates=dates; changed=true; }
        const latestDate=dates[0]||"";
        if (latestDate && latestDate!==state.cardmarket.priceDate) { state.cardmarket.priceDate=latestDate; changed=true; }
      }
      if (sqliteStatus?.ready) {
        state.cardmarket.sqlitePriceRowCount=Number(sqliteStatus.marketPriceCount||0);
        state.cardmarket.sqliteSnapshotCount=Number(sqliteStatus.snapshotCount||0);
        const lastSuccessfulImport=sqliteStatus.lastSuccessfulImport||null;
        const recentImportRuns=Array.isArray(sqliteStatus.recentCardmarketImports)?sqliteStatus.recentCardmarketImports:[];
        if(JSON.stringify(lastSuccessfulImport)!==JSON.stringify(state.cardmarket.lastSuccessfulImport||null)){state.cardmarket.lastSuccessfulImport=lastSuccessfulImport;changed=true;}
        if(JSON.stringify(recentImportRuns)!==JSON.stringify(state.cardmarket.recentImportRuns||[])){state.cardmarket.recentImportRuns=recentImportRuns;changed=true;}
      }
      if (cardNameStatus?.importedAt) {
        const nameFields={
          germanNamesImportedAt:cardNameStatus.importedAt,
          germanNameSource:cardNameStatus.source,
          germanAliasCount:Number(cardNameStatus.aliasCount || 0),
          germanUniqueCardCount:Number(cardNameStatus.germanMetacardCount || 0),
          germanNameUnmatchedMetacardCount:Number(cardNameStatus.unmatchedMetacardCount || 0),
          germanNameAmbiguousMetacardCount:Number(cardNameStatus.ambiguousMetacardCount || 0)
        };
        for (const [key,value] of Object.entries(nameFields)) if (state.cardmarket[key] !== value) { state.cardmarket[key]=value; changed=true; }
      }
      if (changed) saveState();
      renderCardmarketDataCenter();
    } catch (error) {
      console.error("Cardmarket-Metadaten konnten nicht gelesen werden",error);
    }
  }

  async function cmExportBackup() {
    cmSetProgress("<strong>Cardmarket-Datensicherung wird erstellt …</strong>", 15);
    const [products,latestPrices,priceHistory,germanAliases,cardNames] = await Promise.all([
      cmGetAll("products"),
      cmGetAll("latestPrices"),
      cmGetAll("priceHistory"),
      cmGetAll("germanAliases"),
      window.desktopApp?.getCardNameBackup ? window.desktopApp.getCardNameBackup() : null
    ]);
    const payload = {format:"tcg-cardmarket-data-v2",createdAt:new Date().toISOString(),metadata:state.cardmarket,products,latestPrices,priceHistory,germanAliases,cardNames:{...(cardNames||{}),passcodes:(state.cardNamePasscodes||[]).map(row=>({...row}))}};
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
    await Promise.all([cmClearStore("products"),cmClearStore("latestPrices"),cmClearStore("priceHistory"),cmClearStore("germanAliases")]);
    if(window.desktopApp?.clearMarketData) await window.desktopApp.clearMarketData();
    await cmWriteRows("products",payload.products,(done,total)=>cmSetProgress(`<strong>Produkte werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,5+done/Math.max(1,total)*30));
    await cmWriteRows("germanAliases",payload.germanAliases || []);
    await cmWriteRows("latestPrices",payload.latestPrices || [],(done,total)=>cmSetProgress(`<strong>Aktuelle Preise werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,40+done/Math.max(1,total)*20));
    await cmWriteRows("priceHistory",payload.priceHistory,(done,total)=>cmSetProgress(`<strong>Preishistorie wird wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,55+done/Math.max(1,total)*25));
    if(window.desktopApp?.upsertProducts) await cmSyncProductsToSqlite(payload.products,(done,total)=>cmSetProgress(`<strong>SQLite-Kartenstammdaten werden wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,80+done/Math.max(1,total)*8));
    if(window.desktopApp?.upsertCardNames && Array.isArray(payload.cardNames?.mappings) && payload.cardNames.mappings.length) {
      await window.desktopApp.upsertCardNames({
        mappings:payload.cardNames.mappings,
        aliases:payload.cardNames.aliases || [],
        status:payload.cardNames.status || {},
        source:String(payload.cardNames.status?.source || "Cardmarket-Datensicherung"),
        sourceRevision:String(payload.cardNames.status?.sourceRevision || ""),
        updatedAt:new Date().toISOString(),
        replaceAliases:true
      });
    }
    state.cardNamePasscodes=Array.isArray(payload.cardNames?.passcodes)?payload.cardNames.passcodes.map(row=>({metacardId:String(row?.metacardId||""),passcode:String(row?.passcode||"")})).filter(row=>/^\d+$/.test(row.metacardId)&&/^\d{8}$/.test(row.passcode)):[];
    if(window.desktopApp?.upsertMarketPrices) await cmSyncPricesToSqlite(payload.priceHistory,String(payload.metadata?.priceDate||""),new Date().toISOString(),(done,total)=>cmSetProgress(`<strong>SQLite-Preishistorie wird wiederhergestellt …</strong><br>${done.toLocaleString("de-DE")} / ${total.toLocaleString("de-DE")}`,88+done/Math.max(1,total)*12));
    state.cardmarket={...CM_META_DEFAULTS,...(payload.metadata||{}),productCount:payload.products.length,priceRowCount:(payload.latestPrices||[]).length,historyRowCount:payload.priceHistory.length};
    state.imports.push({id:uid(),type:"cardmarketBackup",key:`cm-backup-${Date.now()}`,file:source,date:new Date().toISOString(),rows:payload.priceHistory.length,cards:payload.products.length});
    cmInvalidateCache();saveState();
    if (typeof refreshCardNameLookup === "function") await refreshCardNameLookup(true);
    renderAll();
    cmSetProgress(`<strong>Cardmarket-Datensicherung wiederhergestellt</strong><br>${payload.products.length.toLocaleString("de-DE")} Produkte und ${payload.priceHistory.length.toLocaleString("de-DE")} Preisstände.`,100,"success");
    return {type:"cardmarketBackup",rows:payload.priceHistory.length,cards:payload.products.length};
  }

  async function cmClearAll(ask=true) {
    if (ask && !confirm("Produktkatalog und komplette Cardmarket-Preishistorie wirklich löschen? Warenwirtschaft, Bestand, Käufe und Verkäufe bleiben erhalten.")) return false;
    await Promise.all([cmClearStore("products"),cmClearStore("latestPrices"),cmClearStore("priceHistory"),cmClearStore("germanAliases")]);
    if(window.desktopApp?.clearMarketData) await window.desktopApp.clearMarketData();
    state.cardmarket={...CM_META_DEFAULTS};
    state.cardNamePasscodes=[];
    state.imports=state.imports.filter(record=>!["catalog","prices","cardmarketBackup"].includes(record.type));
    cmInvalidateCache();
    saveState();renderAll();
    cmSetProgress("<strong>Cardmarket-Daten wurden gelöscht.</strong>",100,"success");
    return true;
  }

  async function cmRepairCardmarketCache() {
    const button=document.getElementById("cmRepairCacheBtn");
    if(button){button.disabled=true;button.textContent="Cache wird repariert …";}
    cmSetProgress("<strong>Cardmarket-Cache wird sicher neu aufgebaut …</strong><br>Bestand, Käufe, Verkäufe und die dauerhafte SQLite-Preishistorie werden nicht verändert.",10,"warning");
    try{
      const result=await cmCache().repair({rebuild:cmRebuildCacheFromSqlite,automatic:false});
      await window.tcgRepairSyncHandleCache?.();
      cmInvalidateCache();
      await cmLoadMergedCache();
      await cmRefreshMetadataFromDb();
      renderAll();
      const rebuilt=result?.rebuildResult||{};
      cmSetProgress(`<strong>Cardmarket-Cache repariert</strong><br>${Number(rebuilt.products||0).toLocaleString("de-DE")} Produkte und ${Number(rebuilt.latestPrices||0).toLocaleString("de-DE")} aktuelle Preiszeilen wurden aus SQLite neu aufgebaut.`,100,"success");
      return result;
    }catch(error){
      cmSetProgress(`<strong>Cache-Reparatur fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error");
      throw error;
    }finally{
      if(button){button.disabled=false;button.textContent="Cache reparieren";}
    }
  }
  window.tcgRepairCardmarketCache=cmRepairCardmarketCache;

  // Vollständige Import-Erkennung für Universalimport und überwachten Ordner.
  const legacyUniversalImportFile = universalImportFile;
  universalImportFile = async function(file,options={}) {
    if (!file) throw new Error("Keine Datei ausgewählt.");
    if (/\.json$/i.test(file.name)) {
      const payload = JSON.parse(await file.text());
      if (cmIsBackup(payload)) return cmImportBackupPayload(payload,file.name);
      if (cmIsProductCatalog(payload)) return importCardmarketProductCatalogPayload(payload,file.name);
      if (cmIsPriceGuide(payload)) return importCardmarketPriceGuidePayload(payload,file.name);
    }
    return legacyUniversalImportFile(file,options);
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
    if (cmPriceUpdatePromise) return cmPriceUpdatePromise;
    cmPriceUpdatePromise = (async () => {
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
      if(window.desktopApp?.recordImportRun) window.desktopApp.recordImportRun({
        runId:`price-download-failed-${Date.now()}`,source:"cardmarket_price_guide",
        syncType:"official_download",startedAt:new Date().toISOString(),finishedAt:new Date().toISOString(),
        status:"failed",rowsRead:0,rowsWritten:0,skippedRows:0,errorMessage:String(error?.message||error)
      }).catch(()=>{});
      if(manual) throw error;
      return null;
    }
    })();
    try {
      return await cmPriceUpdatePromise;
    } finally {
      cmPriceUpdatePromise = null;
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
    try{await importCardmarketProductCatalogPayload(JSON.parse(await file.text()),file.name);}catch(error){const friendly=error?.originalMessage?error:cmFriendlyImportError(error,"Produktkatalog-Import");state.cardmarket.lastError=friendly.message;saveState();cmSetProgress(`<strong>Produktkatalog-Import fehlgeschlagen</strong><br>${escapeHtml(friendly.message)}`,100,"error");}
  });
  const priceInput=document.getElementById("cmPriceGuideInput");
  if(priceInput) priceInput.addEventListener("change",async event=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{await importCardmarketPriceGuidePayload(JSON.parse(await file.text()),file.name);}catch(error){const friendly=error?.originalMessage?error:cmFriendlyImportError(error,"Price-Guide-Import");state.cardmarket.lastError=friendly.message;saveState();cmSetProgress(`<strong>Price-Guide-Import fehlgeschlagen</strong><br>${escapeHtml(friendly.message)}`,100,"error");}
  });
  const backupInput=document.getElementById("cmBackupInput");
  if(backupInput) backupInput.addEventListener("change",async event=>{
    const file=event.target.files?.[0];event.target.value="";if(!file)return;
    try{await cmImportBackupPayload(JSON.parse(await file.text()),file.name);}catch(error){cmSetProgress(`<strong>Wiederherstellung fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error");}
  });
  document.getElementById("cmSearch")?.addEventListener("input",cmScheduleSearch);
  document.getElementById("cmLoadGermanNamesBtn")?.addEventListener("click",()=>cmLoadGermanNamesOnline({automatic:false,force:true}).catch(error=>cmSetProgress(`<strong>Deutsche Kartennamen konnten nicht geladen werden</strong><br>${escapeHtml(error.message)}<br><small>Internetverbindung prüfen und erneut versuchen.</small>`,100,"error")));
    document.getElementById("cmExportBackupBtn")?.addEventListener("click",()=>cmExportBackup().catch(error=>cmSetProgress(`<strong>Export fehlgeschlagen</strong><br>${escapeHtml(error.message)}`,100,"error")));
  document.getElementById("cmClearDataBtn")?.addEventListener("click",()=>cmClearAll(true).catch(error=>alert(error.message)));
  document.getElementById("cmRepairCacheBtn")?.addEventListener("click",()=>cmRepairCardmarketCache().catch(error=>alert(`Cache konnte nicht repariert werden: ${error.message}`)));
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

  function cmAnalysisQueryVariants(rawQuery="") {
    const original=cmNormalize(rawQuery);
    return original ? [original] : [];
  }

  function cmAnalysisMatchRank(product,variants) {
    const haystack=product.searchText||cmNormalize([product.germanName,product.name,product.officialName,product.set,product.setName,product.setCode,product.collectorNumber,product.rarity,product.productId].join(" "));
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
    return `<div class="cm-analysis-notice"><div><strong>Deutsche Kartennamen sind noch nicht lokal geladen.</strong><span>Bis zum vollständigen Online-Abgleich werden englische Namen angezeigt; danach liegen beide Sprachen dauerhaft im SQLite-Suchindex.</span></div><button class="secondary" type="button" data-cm-load-german>Deutsche Namen jetzt laden</button></div>`;
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

  async function cmLoadHistoriesLimited(products=[], concurrency=8) {
    const results = new Array(products.length);
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < products.length) {
        const index = nextIndex++;
        results[index] = await cmGetHistory(products[index].productId);
      }
    };
    await Promise.all(Array.from({length:Math.min(concurrency,products.length)},worker));
    return results;
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
      const searchResult=await cmSearchCatalogCards(queryRaw,12);
      if(token!==cmPurchaseAnalysisToken)return;
      const visible=searchResult.products;
      if(!visible.length){
        el.style.minHeight="";
        el.classList.remove("is-refreshing");
        el.innerHTML=cmGermanNamesNotice()+'<div class="purchase-analysis-empty">Keine passende Kartenvariante im vollständigen Cardmarket-Katalog gefunden.</div>';
        cmRestoreAnalysisPosition(position);
        return;
      }
      const ownMap=cmBuildOwnStats();
      const histories=await cmLoadHistoriesLimited(visible,8);
      if(token!==cmPurchaseAnalysisToken)return;
      const cards=visible.map((product,index)=>{
        const own=ownMap.get(String(product.productId))||{};
        const history=histories[index]||[];
        const delta1=cmHistoryDeltaInfo(history,1,product.trend,product.dailyChange,product.previousDate);
        const delta7=cmHistoryDeltaInfo(history,7,product.trend);
        const delta30=cmHistoryDeltaInfo(history,30,product.trend);
        const calc=cmMarketCalculation(product,own,{delta1:delta1.value,delta7:delta7.value,delta30:delta30.value});
        const watch=state.watchlist.find(w=>!w.archived&&cleanProductId(w.productId)===String(product.productId));
        const learned=product.learnedPricing||{};
        const learnedConfidence={high:"hoch",medium:"mittel",low:"niedrig"}[learned.confidenceLevel]||"niedrig";
        const maxBuyNote=calc.maxBuy>0
          ? `${money(calc.maxByRoi)} ist die maximale Einkaufsgrenze für ${Number(state.settings.minRoi||25)} % Mindest-ROI.`
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
            <div class="cm-result-metric"><span>Gespeicherte Preisreferenz</span><strong>${cmAnalysisMoney(calc.recommendedSell)}</strong><small>${escapeHtml(calc.marketReferenceSource||"vorsichtige Price-Guide-Referenz")}</small><small>${escapeHtml(calc.priceExplanation||"")}</small></div>
            <div class="cm-result-metric"><span>Sicherheits-VK</span><strong>${cmAnalysisMoney(calc.safeSell)}</strong><small>${Number(state.settings.safetyPercent||0)} % Sicherheitsabschlag</small></div>
            <div class="cm-result-metric"><span>Gebühren + Verpackung</span><strong>${cmAnalysisMoney(calc.feeAmount+calc.packaging)}</strong><small>${Number(state.settings.feePercent||0)} % Gebühr · ${money(calc.packaging)} anteilige Verpackung</small></div>
            <div class="cm-result-metric ${calc.isCostCovering?"":"cm-metric-critical"}"><span>Break-even-EK</span><strong class="${calc.isCostCovering?"":"money-negative"}">${calc.isCostCovering?cmAnalysisMoney(cmFloorMoney(calc.netBeforeBuy)):"Nicht kostendeckend"}</strong><small>${calc.isCostCovering?"Maximaler EK ohne Gewinn":"Fehlbetrag vor Karteneinkauf: "+money(calc.costShortfall)}</small></div>
            <div class="cm-result-metric"><span>Max-EK ohne Gewinn</span><strong>${cmAnalysisMoney(calc.maxByProfit)}</strong><small>Reine Kostendeckung</small></div>
            <div class="cm-result-metric"><span>Max-EK nach Mindest-ROI</span><strong>${cmAnalysisMoney(calc.maxByRoi)}</strong><small>${Number(state.settings.minRoi||0)} % Mindest-ROI</small></div>
            <div class="cm-result-metric" title="${escapeHtml(maxBuyNote)}"><span>Empfohlener Max-EK</span><strong>${cmAnalysisMoney(calc.maxBuy)}</strong><small>${watch?.maxBuy?`Eigene Grenze ${money(watch.maxBuy)}`:escapeHtml(maxBuyNote)}</small></div>
            <div class="cm-result-metric"><span>Gewinn bei Cardmarket Low</span><strong class="${calc.profitAtMarket>=0?"money-positive":"money-negative"}">${calc.marketBuy>0?money(calc.profitAtMarket):"–"}</strong><small>${calc.marketBuy>0?`${pct(calc.roiAtMarket)} ROI · ${pct(calc.marginOnSell)} Marge auf Sicherheits-VK`:"Keine EK-Referenz"}</small></div>
          </div></div>
          <div class="cm-result-section"><h4>Eigene Daten</h4><div class="cm-result-metrics cm-result-metrics-3">
            <div class="cm-result-metric"><span>Eigener EK</span><strong>${own.avgBuy?money(own.avgBuy):"–"}</strong><small>Ø${own.bestBuy?` · Bester ${money(own.bestBuy)}`:" · keine Käufe"}</small></div>
            <div class="cm-result-metric"><span>Eigener VK</span><strong>${own.avgSell?money(own.avgSell):"–"}</strong><small>Ø${own.bestSell?` · Bester ${money(own.bestSell)}`:" · keine Verkäufe"}</small></div>
            <div class="cm-result-metric"><span>Bestand</span><strong>${Number(own.inventory||0)}</strong><small>${Number(own.reserved||0)} reserviert · ${Number(own.available||0)} verfügbar</small></div>
            <div class="cm-result-metric"><span>Handelsdatenbank Max-EK</span><strong>${learned.recommendedBuy?money(learned.recommendedBuy):"–"}</strong><small>${Number(learned.buySampleCount||0)} EK · ${Number(learned.sellSampleCount||0)} VK · Sicherheit ${learnedConfidence}</small></div>
            <div class="cm-result-metric"><span>Handelsdatenbank VK</span><strong>${learned.recommendedSell?money(learned.recommendedSell):"–"}</strong><small>${Number(learned.marketSampleCount||0)} gespeicherte Marktstände berücksichtigt</small></div>
          </div></div>
          <footer class="cm-result-actions"><button class="secondary" data-cm-add-watch="${escapeHtml(product.productId)}">+ Watchlist</button><button class="primary" data-cm-analysis-details="${escapeHtml(product.productId)}" data-cm-analysis-name="${escapeHtml(displayName)}">Preisverlauf öffnen</button></footer>
        </article>`;
      }).join("");
      el.innerHTML=`${cmGermanNamesNotice()}<div class="cm-analysis-summary"><strong>${searchResult.totalCards.toLocaleString("de-DE")} Karten im vollständigen Katalog gefunden</strong><span>${visible.length.toLocaleString("de-DE")} Druckvarianten der ${searchResult.groups.length.toLocaleString("de-DE")} angezeigten Karten · jede Karte vollständig</span></div><div class="cm-analysis-legend"><strong>Lesart:</strong> Ø 1/7/30 sind Cardmarket-Durchschnittspreise. Δ 1/7/30 sind ausschließlich echte Veränderungen aus deinen gespeicherten Tagesimporten. Fehlende Set-/Seltenheitsdaten werden nicht geraten.</div><div class="cm-analysis-results-grid">${cards}</div>`;
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
      const result=await cmLoadGermanNamesOnline({automatic:false,force:true});
      alert(`${Number(result.matched||0).toLocaleString("de-DE")} Produktvarianten wurden mit deutschen Kartennamen verknüpft. ${Number(result.setDetailCount||0).toLocaleString("de-DE")} Set-/Seltenheitsdetails wurden ergänzt.`);
      renderPurchaseAnalysis();
    }catch(error){
      alert(`Deutsche Kartennamen konnten nicht geladen werden: ${error.message}`);
      target.disabled=false;
      target.textContent=oldText;
    }
  });

  document.getElementById("cmGermanNamesAutoUpdate")?.addEventListener("change",event=>{
    state.cardmarket.germanNamesAutoUpdate=Boolean(event.target.checked);
    saveState();
    if (event.target.checked) window.setTimeout(()=>cmRunGermanNamesAutoUpdate({force:false}),250);
  });

  async function cmRunDailyAutoUpdate() {
    const today = todayISO();
    if (state.sync?.autoPrices === false) return;
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
      await cmLoadMergedCache();
      await cmRepairKnownGermanNames();
      await cmRunGermanNamesAutoUpdate({force:false});
    } catch (error) {
      console.error("Lokale Reparatur deutscher Kartennamen fehlgeschlagen:",error);
      state.cardmarket.germanNamesLastError = String(error?.message || error);
      saveState();
    }
    window.setTimeout(cmRunDailyAutoUpdate, 1200);
  });
})();
