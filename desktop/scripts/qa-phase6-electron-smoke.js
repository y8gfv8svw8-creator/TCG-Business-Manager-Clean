const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-phase6-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9260;
fs.mkdirSync(chromiumData, { recursive: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForPage() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(row => row.type === 'page' && String(row.url).startsWith('file:'));
      if (page) return page;
    } catch {}
    await delay(250);
  }
  throw new Error('Die Foto-Prüfoberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close(); reject(new Error('Foto-Oberflächentest hat zu lange gedauert.')); }, 60000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer); reject(new Error('Verbindung zur Foto-Prüfoberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Foto-Oberfläche.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Electron-Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root,
    windowsHide: true,
    env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });
  child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();await delay(1600);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const rendererErrors=[];window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      const id=()=>crypto.randomUUID();
      const analysis={id:id(),title:'Foto-Smoke-Test',sourceType:'Privat',sellerName:'',url:'',date:'2026-08-22',sellerPrice:0,shipping:0,extra:0,notes:'',items:[{id:'item-1',productId:'741275',name:'Nibiru, das Urwesen',germanName:'Nibiru, das Urwesen',englishName:'Nibiru, the Primal Being',set:'25th Anniversary Rarity Collection',collectorNumber:'RA01-DE015',rarity:'Secret Rare',quantity:2,condition:'NM',language:'DE',printConfidence:'confirmed'}],decisionSnapshots:[],photos:[],photoObservations:[],physicalCards:[]};
      state.collectionPurchaseAnalyses=[analysis];state.activeCollectionAnalysisId=analysis.id;await window.desktopApp.saveState(state);
      const binary=atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=');const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      const photo1=await window.desktopApp.storeCollectionPhoto({analysisId:analysis.id,originalFileName:'binder-1.png',mimeType:'image/png',bytes,sequence:1,binderPage:'1'});
      const photo2=await window.desktopApp.storeCollectionPhoto({analysisId:analysis.id,originalFileName:'binder-2.png',mimeType:'image/png',bytes,sequence:2,binderPage:'2'});
      analysis.photos=[photo1,photo2];
      analysis.physicalCards=[
        {id:'physical-1',analysisId:analysis.id,label:'Nibiru Exemplar 1',linkedCollectionItemId:'item-1',productId:'741275',name:'Nibiru, das Urwesen',createdAt:new Date().toISOString()},
        {id:'physical-2',analysisId:analysis.id,label:'Nibiru Exemplar 2',linkedCollectionItemId:'item-1',productId:'741275',name:'Nibiru, das Urwesen',createdAt:new Date().toISOString()}
      ];
      const common={analysisId:analysis.id,selectedName:'Nibiru, das Urwesen',nameCandidates:[{id:'name-1',name:'Nibiru, das Urwesen',englishName:'Nibiru, the Primal Being'}],nameConfidence:'high',printCandidates:[{id:'print-1',productId:'741275',name:'Nibiru, das Urwesen',setName:'25th Anniversary Rarity Collection',collectorNumber:'RA01-DE015',rarity:'Secret Rare'}],economicRelevant:true,detailPhotoRequired:true,reviewStatus:'in_review',createdAt:new Date().toISOString()};
      analysis.photoObservations=[
        {id:'observation-1',photoId:photo1.id,boundingBox:{x:.05,y:.05,width:.35,height:.4},selectedProductId:'741275',printConfidence:'confirmed',physicalCardId:'physical-1',linkedCollectionItemId:'item-1',...common},
        {id:'observation-2',photoId:photo2.id,boundingBox:{x:.1,y:.1,width:.35,height:.4},selectedProductId:'741275',printConfidence:'confirmed',physicalCardId:'physical-1',linkedCollectionItemId:'item-1',...common},
        {id:'observation-3',photoId:photo1.id,boundingBox:{x:.55,y:.5,width:.35,height:.4},selectedProductId:'',printConfidence:'unknown',recognitionSignals:['Setcode RA01-DE015 gelesen'],physicalCardId:'physical-2',linkedCollectionItemId:'item-1',...common}
      ];
      await window.desktopApp.saveState(state);showView('collectionpurchases');activeCollectionPhotoId=photo1.id;activeCollectionObservationId='observation-1';renderCollectionPurchases();await new Promise(resolve=>setTimeout(resolve,300));
      const evidence=TcgCollectionPhotoModel.summarizePhotoEvidence(analysis);const loaded=(await window.desktopApp.loadState()).state;const reloaded=loaded.collectionPurchaseAnalyses.find(row=>row.id===analysis.id);const databaseStatus=await window.desktopApp.getDatabaseStatus();
      return {title:document.title,photoPanel:Boolean(document.getElementById('collectionPhotoWorkspace')),workspaceVisible:document.getElementById('collectionPhotoWorkspace').hidden===false,photoChoices:document.querySelectorAll('[data-select-collection-photo]').length,boxes:document.querySelectorAll('[data-observation-box]').length,nameConfidence:reloaded.photoObservations[0].nameConfidence,printConfidence:reloaded.photoObservations[0].printConfidence,setCodeOnlyConfidence:reloaded.photoObservations[2].printConfidence,photoCount:reloaded.photos.length,observationCount:reloaded.photoObservations.length,physicalCardCount:evidence.physicalCardCount,observedPhysicalCardCount:evidence.observedPhysicalCardCount,economicCardCount:evidence.economicallyLinkedPhysicalCardCount,inventoryCount:(loaded.inventory||[]).length,purchaseCount:(loaded.purchases||[]).length,databaseStatus,rendererErrors};
    })()`);
    if(!result||!result.title?.includes('6.10.0')||!result.photoPanel||!result.workspaceVisible||result.photoChoices!==2||result.boxes!==2||result.nameConfidence!=='high'||result.printConfidence!=='confirmed'||result.setCodeOnlyConfidence!=='unknown'||result.photoCount!==2||result.observationCount!==3||result.physicalCardCount!==2||result.observedPhysicalCardCount!==2||result.economicCardCount!==2||result.inventoryCount!==0||result.purchaseCount!==0||result.databaseStatus?.schemaVersion!==12||result.rendererErrors?.length){
      throw new Error(`Foto-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/error|exception|sqlite.*(?:malformed|corrupt)/i.test(output))throw new Error(`Fehlerausgabe der Foto-Test-App: ${output.trim()}`);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
