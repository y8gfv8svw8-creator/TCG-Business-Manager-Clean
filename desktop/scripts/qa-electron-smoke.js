const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const executable = path.join(root, 'dist', 'win-unpacked', 'TCG Business Manager.exe');
const qaData = path.join(root, 'dist', 'qa-runtime-data');
const qaChromiumData = path.join(qaData, 'Chromium');
const port = 9227;
let childOutput = '';
fs.mkdirSync(qaChromiumData, { recursive: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPage() {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(row => row.type === 'page' && String(row.url).startsWith('file:'));
      if (page) return page;
    } catch {}
    await delay(250);
  }
  throw new Error('Die Desktop-Oberfläche hat den Testport nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Oberflächenprüfung hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur Desktop-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.text || 'JavaScript-Fehler in der Oberfläche.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, [`--remote-debugging-port=${port}`, `--user-data-dir=${qaChromiumData}`, '--disable-gpu'], {
    cwd: path.dirname(executable), windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.on('data', chunk => { childOutput += chunk.toString(); });
  child.stderr.on('data', chunk => { childOutput += chunk.toString(); });
  try {
    const page = await waitForPage();
    await delay(1200);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      renderAll();
      document.documentElement.dataset.theme='dark';
      const contrast=(foreground,background)=>{
        const rgb=value=>(value.match(/[\\d.]+/g)||[]).slice(0,3).map(Number);
        const luminance=value=>{const [r,g,b]=rgb(value).map(channel=>{channel/=255;return channel<=.03928?channel/12.92:Math.pow((channel+.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;};
        const lighter=Math.max(luminance(foreground),luminance(background)),darker=Math.min(luminance(foreground),luminance(background));
        return (lighter+.05)/(darker+.05);
      };
      const samples=[
        ['Warnung','business-issue warning','button'],
        ['Marktwert','cm-result-metric','div'],
        ['Kartenauswahl','inventory-card-choice','button'],
        ['Status','badge blue','span'],
        ['Kennzahl','stat-card','article']
      ].map(([text,className,tag])=>{const node=document.createElement(tag);node.className=className;node.textContent=text;document.body.appendChild(node);const style=getComputedStyle(node);const ratio=contrast(style.color,style.backgroundColor);node.remove();return {className,ratio};});
      const input=document.createElement('input');input.readOnly=true;const form=document.createElement('div');form.className='form-grid';form.appendChild(input);document.body.appendChild(form);const inputStyle=getComputedStyle(input);samples.push({className:'readonly',ratio:contrast(inputStyle.color,inputStyle.backgroundColor)});form.remove();
      showView('inventory');
      const inventoryActive=document.getElementById('view-inventory').classList.contains('active');

      const repairProbe=migrateState({settings:{},inventory:[
        {id:'qa-purchase',productId:'883536',name:'QA Bestand',language:'DE',condition:'NM',edition:'1',purchaseId:'qa-order',purchaseLineKey:'qa-order:1',purchaseDate:'2026-07-19',status:'Im Bestand',cost:0.34},
        {id:'qa-snapshot',productId:'883536',name:'QA Bestand',language:'DE',condition:'NM',edition:'1',articleId:'2121223194',stockIdentity:'article:2121223194',source:'Cardmarket-Bestandsabgleich',purchaseDate:'2026-08-07',status:'Im Bestand',listingPrice:0.30,listed:true},
        {id:'qa-reserved',productId:'883536',name:'QA Bestand',language:'DE',condition:'NM',edition:'1',articleId:'2121223194',stockIdentity:'article:2121223194',source:'Cardmarket-Bestandsabgleich',purchaseDate:'2026-08-07',status:'Reserviert',saleId:'qa-sale'}
      ],purchases:[],sales:[],movements:[]});
      const repairedPurchase=repairProbe.inventory.find(item=>item.id==='qa-purchase');
      const snapshotRepairSafe=repairProbe.inventory.length===2&&!repairProbe.inventory.some(item=>item.id==='qa-snapshot')&&repairedPurchase?.articleId==='2121223194'&&repairedPurchase?.cost===0.34&&repairProbe.inventory.some(item=>item.id==='qa-reserved'&&item.saleId==='qa-sale');

      const zeroStockItem={id:'qa-zero-'+Date.now(),productId:'990099',name:'QA Bestand Null',set:'TEST',setName:'Test Set',collectorNumber:'TEST-EN099',rarity:'Common',language:'DE',condition:'NM',status:'Verkauft',saleId:'qa-zero-sale',purchaseDate:'2026-08-01',cost:0.10};
      state.inventory.push(zeroStockItem);
      document.getElementById('inventoryStockFilter').value='all';renderInventory();
      const zeroStockVisible=[...document.querySelectorAll('#inventoryTable tr')].some(row=>row.textContent.includes('QA Bestand Null')&&row.textContent.includes('1 verkauft'));
      document.getElementById('inventoryStockFilter').value='current';renderInventory();
      const zeroStockHidden=[...document.querySelectorAll('#inventoryTable tr')].every(row=>!row.textContent.includes('QA Bestand Null'));
      state.inventory=state.inventory.filter(item=>item.id!==zeroStockItem.id);

      const receiptPurchase={id:'qa-receipt-'+Date.now(),orderNo:'QA-DRUCKDATEN',date:'2026-08-11',status:'Unterwegs',cardValue:1,shipping:0,extra:0,refund:0,costAllocationMethod:'value',pendingItems:[{name:'QA Drucktest',quantity:1,unitPrice:1,receivedBusiness:0,receivedPrivate:0,receivedDamaged:0,cancelledQuantity:0}]};
      state.purchases.push(receiptPurchase);openPurchaseReceipt(receiptPurchase.id);
      const receiptRow=document.querySelector('#purchaseReceiptContent [data-receipt-row]');
      receiptRow.querySelector('[data-receipt-value="business"]').value='1';
      receiptRow.querySelector('[data-receipt-list]').checked=true;
      receiptRow.querySelector('[data-receipt-listing-price]').value='1.25';
      document.getElementById('purchaseReceiptNote').value='QA-Eingaben erhalten';
      receiptRow.querySelector('[data-repair-receipt-print]').click();
      await new Promise(resolve=>setTimeout(resolve,40));
      const receiptRepairOpened=document.getElementById('modal').open&&document.getElementById('modalTitle').textContent.includes('QA-DRUCKDATEN');
      const receiptIdentity={productId:'990010',metacardId:'990010',name:'QA Drucktest',germanName:'QA Drucktest',englishName:'QA Print Test',set:'TEST',setName:'Test Set',variant:'V.1 - Ultra Rare',rarity:'Ultra Rare',collectorNumber:'TEST-EN010',productUrl:'https://example.invalid/qa-print',cardPasscode:'12345678'};
      Object.entries(receiptIdentity).forEach(([field,value])=>{const input=document.querySelector('#modalFields [name="'+field+'"]');if(input)input.value=value;});
      document.getElementById('modalForm').requestSubmit();
      await new Promise(resolve=>setTimeout(resolve,80));
      const restoredReceiptRow=document.querySelector('#purchaseReceiptContent [data-receipt-row]');
      const receiptRepairDetails={dialogOpen:document.getElementById('purchaseReceiptDialog').open,green:Boolean(restoredReceiptRow?.querySelector('.receipt-print-repair.green')),business:restoredReceiptRow?.querySelector('[data-receipt-value="business"]')?.value||'',listed:Boolean(restoredReceiptRow?.querySelector('[data-receipt-list]')?.checked),price:restoredReceiptRow?.querySelector('[data-receipt-listing-price]')?.value||'',note:document.getElementById('purchaseReceiptNote').value,productId:receiptPurchase.pendingItems[0].productId||''};
      const receiptRepairFlow=Boolean(receiptRepairDetails.dialogOpen&&receiptRepairDetails.green&&receiptRepairDetails.business==='1'&&receiptRepairDetails.listed&&receiptRepairDetails.price==='1.25'&&receiptRepairDetails.note==='QA-Eingaben erhalten'&&receiptRepairDetails.productId==='990010');
      document.getElementById('purchaseReceiptDialog').close();state.purchases=state.purchases.filter(purchase=>purchase.id!==receiptPurchase.id);

      addInventory({},'business');
      renderInventoryProductChoices([{productId:'990003',name:'Direkte CM-ID Testkarte',set:'TEST',setName:'Test Set',collectorNumber:'TEST-EN001',rarity:''}]);
      document.querySelector('[data-confirm-inventory-product="990003"]')?.click();
      await new Promise(resolve=>setTimeout(resolve,30));
      const directProductIdAssignment=document.querySelector('#modalFields [name="productId"]')?.value==='990003';
      document.getElementById('modalCancel').click();

      const inventoryBefore=state.inventory.length;
      addInventory({},'business');
      const assignInventoryForm=(productId,name,quantity)=>{
        const fields={productId,name,germanName:name,set:'TEST',setName:'Test Set',collectorNumber:'TEST-EN'+productId.slice(-3),rarity:'Ultra Rare'};
        Object.entries(fields).forEach(([field,value])=>{const input=document.querySelector('#modalFields [name="'+field+'"]');if(input)input.value=value;});
        document.querySelector('#modalFields [name="quantity"]').value=String(quantity);
      };
      assignInventoryForm('990001','Sammeltest A',2);
      document.getElementById('modalAddAnother').click();
      const batchQueued=document.querySelectorAll('#inventoryBatchSummary .inventory-batch-row').length===1;
      assignInventoryForm('990002','Sammeltest B',1);
      document.getElementById('modalForm').requestSubmit();
      await new Promise(resolve=>setTimeout(resolve,30));
      const createdTestItems=state.inventory.slice(inventoryBefore);
      const batchInventoryCreated=createdTestItems.length===3&&createdTestItems.filter(item=>item.productId==='990001').length===2&&createdTestItems.filter(item=>item.productId==='990002').length===1;

      const stableAllocationSale={id:'qa-stable-sale-'+Date.now(),orderNo:'QA-STABILE-ZUORDNUNG',status:'Offen',itemIds:[createdTestItems[0].id,createdTestItems[2].id],items:[
        {productId:'990001',name:'Sammeltest A',quantity:1,unitPrice:1,matchedItemIds:[]},
        {productId:'990002',name:'Sammeltest B',quantity:1,unitPrice:1,matchedItemIds:[]}
      ]};
      createdTestItems[0].saleId=stableAllocationSale.id;createdTestItems[0].status='Reserviert';
      createdTestItems[2].saleId=stableAllocationSale.id;createdTestItems[2].status='Reserviert';
      state.sales.push(stableAllocationSale);openSaleAllocation(stableAllocationSale.id);
      const stableToggle=document.getElementById('saleAllocationShowAll');stableToggle.checked=true;stableToggle.dispatchEvent(new Event('change',{bubbles:true}));
      const stableSelects=[...document.querySelectorAll('#saleAllocationContent [data-sale-allocation]')];
      const allocationsStayWithTheirLines=stableSelects.length===2&&stableSelects[0].value===createdTestItems[0].id&&stableSelects[1].value===createdTestItems[2].id;
      stableAllocationSale.itemIds=[];stableAllocationSale.items.forEach(item=>item.matchedItemIds=[]);
      createdTestItems[0].status='Im Bestand';delete createdTestItems[0].saleId;
      createdTestItems[2].status='Im Bestand';delete createdTestItems[2].saleId;
      state.sales=state.sales.filter(sale=>sale.id!==stableAllocationSale.id);
      document.getElementById('saleAllocationDialog').close();

      const allocationSale={id:'qa-sale-'+Date.now(),orderNo:'QA-ALLE-KARTEN',status:'Offen',itemIds:[],items:[{productId:'999999',name:'Falsch zugeordnete Testkarte',quantity:1,unitPrice:1,matchedItemIds:[]}]};
      state.sales.push(allocationSale);openSaleAllocation(allocationSale.id);
      const allInventoryToggle=document.getElementById('saleAllocationShowAll');allInventoryToggle.checked=true;allInventoryToggle.dispatchEvent(new Event('change',{bubbles:true}));
      const allocationSelect=document.querySelector('#saleAllocationContent [data-sale-allocation]');
      const allInventoryAssignable=allocationSelect&&[...allocationSelect.options].some(option=>createdTestItems.some(item=>item.id===option.value));
      allocationSelect.value=createdTestItems[0].id;window.confirm=()=>true;
      const allocationSaved=saveSaleAllocation();
      const mismatchedAllocationRepairsIdentity=allocationSaved&&allocationSale.items[0].productId==='990001'&&createdTestItems[0].saleId===allocationSale.id;
      showView('reports');
      const ocrCanvas=document.createElement('canvas');ocrCanvas.width=620;ocrCanvas.height=160;
      const ocrContext=ocrCanvas.getContext('2d');ocrContext.fillStyle='#fff';ocrContext.fillRect(0,0,620,160);ocrContext.fillStyle='#000';ocrContext.font='bold 58px Arial';ocrContext.fillText('RA01-EN008',45,102);
      const ocrResult=await window.desktopApp.recognizeCardImage({imageDataUrl:ocrCanvas.toDataURL('image/png')});
      const scanCanvas=document.createElement('canvas');scanCanvas.width=900;scanCanvas.height=1300;
      const scanContext=scanCanvas.getContext('2d');scanContext.fillStyle='#c7b18d';scanContext.fillRect(0,0,900,1300);
      scanContext.fillStyle='#171717';scanContext.fillRect(154,214,592,912);scanContext.fillStyle='#b77b55';scanContext.fillRect(162,222,576,896);
      scanContext.fillStyle='#f1e5d1';scanContext.fillRect(178,258,544,95);scanContext.fillStyle='#111';scanContext.font='bold 36px Arial';scanContext.fillText('TELLARKNIGHT CYGNIAN',194,320);
      scanContext.fillStyle='#f5f1e8';scanContext.fillRect(510,800,205,58);scanContext.font='bold 28px Arial';scanContext.fillText('BLGG-EN017',520,840);
      scanContext.fillStyle='#f5f1e8';scanContext.fillRect(175,1045,330,52);scanContext.font='bold 25px Arial';scanContext.fillText('60700283 1st Edition',186,1080);
      const preparedScan=await window.TcgScannerImageProcessing.prepareRecognitionPayload(scanCanvas.toDataURL('image/png'));
      const regionalOcr=await window.desktopApp.recognizeCardImage({...preparedScan,hint:''});
      return {
        ready:document.readyState,
        title:document.title,
        sqliteStatus:document.getElementById('saveStatus')?.textContent||'',
        navigation:document.querySelectorAll('.nav-item').length,
        inventoryActive,
        snapshotRepairSafe,
        zeroStockFilter:Boolean(zeroStockVisible&&zeroStockHidden),
        receiptRepairOpened,
        receiptRepairFlow,
        receiptRepairDetails,
        directProductIdAssignment,
        batchQueued,
        batchInventoryCreated,
        allocationsStayWithTheirLines,
        allInventoryAssignable,
        mismatchedAllocationRepairsIdentity,
        reportsActive:document.getElementById('view-reports').classList.contains('active'),
        filterPanels:document.querySelectorAll('.filter-panel').length,
        hasCashflow:Boolean(document.getElementById('mMonthlyProfit')),
        hasScanner:Boolean(document.getElementById('scanInventoryBtn')&&document.getElementById('scanPrivateBtn')),
        scannerOcrBridge:typeof window.desktopApp?.recognizeCardImage==='function',
        scannerOcrEngine:ocrResult?.engine||'',
        scannerOcrSetCode:(ocrResult?.setCodes||[]).includes('RA01-EN008'),
        scannerOcrText:ocrResult?.text||'',
        scannerRecognitionParser:typeof window.TcgScannerRecognition?.extractSetCodes==='function',
        scannerImageProcessing:typeof window.TcgScannerImageProcessing?.prepareRecognitionPayload==='function',
        scannerRegionalEngine:regionalOcr?.engine||'',
        scannerRegionalSetCode:(regionalOcr?.setCodes||[]).includes('BLGG-EN017'),
        scannerRegionalPasscode:(regionalOcr?.passcodes||[]).includes('60700283'),
        scannerRegionalEdition:regionalOcr?.edition||'',
        scannerRegionalPasses:regionalOcr?.regionResults?.length||0,
        scannerSeriesQueue:typeof queueScannerSubmission==='function'&&typeof finishScannerCardReview==='function',
        darkContrastMinimum:Math.min(...samples.map(row=>row.ratio)),
        darkContrastSamples:samples,
        desktopBridge:typeof window.desktopApp?.saveState==='function'
      };
    })()`);
    if (!result || result.ready !== 'complete' || !result.inventoryActive || !result.snapshotRepairSafe || !result.zeroStockFilter || !result.receiptRepairOpened || !result.receiptRepairFlow || !result.directProductIdAssignment || !result.batchQueued || !result.batchInventoryCreated || !result.allocationsStayWithTheirLines || !result.allInventoryAssignable || !result.mismatchedAllocationRepairsIdentity || !result.reportsActive || !result.hasCashflow || !result.hasScanner || !result.scannerOcrBridge || result.scannerOcrEngine !== 'tesseract-local' || !result.scannerOcrSetCode || !result.scannerRecognitionParser || !result.scannerImageProcessing || result.scannerRegionalEngine !== 'tesseract-local-regions' || result.scannerRegionalPasses < 4 || !result.scannerSeriesQueue || result.darkContrastMinimum < 4.5 || !result.desktopBridge) {
      throw new Error(`Desktop-Prüfung unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    child.kill();
    await delay(500);
  }
}

main().catch(error => { console.error(error);if(childOutput.trim())console.error(childOutput.trim());process.exitCode = 1; });
