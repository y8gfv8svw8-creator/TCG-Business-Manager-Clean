const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const expectedVersion = require('../package.json').version;
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-collection-name-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9320 + (process.pid % 200);
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
fs.mkdirSync(chromiumData, { recursive: true });

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
  throw new Error('Die Namensprüfungs-Oberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close();reject(new Error('Namensprüfungs-Smoke-Test hat zu lange gedauert.')); }, 180000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer);reject(new Error('Verbindung zur Namensprüfungs-Oberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Namensprüfung.'));
      resolve(message.result?.result?.value);
    };
  });
}

async function main() {
  if (!fs.existsSync(executable)) throw new Error(`Electron-Testprogramm fehlt: ${executable}`);
  const child = spawn(executable, ['.', `--remote-debugging-port=${port}`, `--user-data-dir=${chromiumData}`, '--disable-gpu', '--no-sandbox'], {
    cwd: root, windowsHide: true, env: { ...process.env, TCG_MANAGER_DATA_ROOT: qaData }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk.toString(); });child.stderr.on('data', chunk => { output += chunk.toString(); });
  try {
    const page = await waitForPage();await delay(1600);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const rendererErrors=[];window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      window.alert=()=>{};window.confirm=()=>true;
      await desktopApp.upsertProducts([
        {productId:'700001',metacardId:'100',officialName:'Nibiru, the Primal Being',officialBaseName:'Nibiru, the Primal Being',setName:'Rarity Collection',setCode:'RA01-EN015',rarity:'Secret Rare'},
        {productId:'700002',metacardId:'200',officialName:'Lightning Storm',officialBaseName:'Lightning Storm',setName:"King's Court",setCode:'KICO-EN057',rarity:'Ultra Rare'}
      ]);
      await desktopApp.upsertCardNames({mappings:[{metacardId:'100',nameDe:'Nibiru, das Urwesen',nameEn:'Nibiru, the Primal Being'},{metacardId:'200',nameDe:'Blitzsturm',nameEn:'Lightning Storm'}],aliases:[{metacardId:'100',language:'de',alias:'Nibiru das Urwesen'}],replaceAliases:true});
      const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1100;const context=canvas.getContext('2d');context.fillStyle='#77736d';context.fillRect(0,0,canvas.width,canvas.height);
      const cards=[{x:90,y:90,width:560,height:824,title:'NIBIRU, THE PRIMAL BEING'},{x:830,y:90,width:560,height:824,title:'LIGHTNING STORM'}];
      for(const card of cards){context.fillStyle='#b98a56';context.fillRect(card.x,card.y,card.width,card.height);context.strokeStyle='#161616';context.lineWidth=12;context.strokeRect(card.x,card.y,card.width,card.height);context.fillStyle='#e5c493';context.fillRect(card.x+18,card.y+28,card.width-36,100);context.fillStyle='#080808';context.font='bold 34px Arial';context.textBaseline='middle';context.fillText(card.title,card.x+28,card.y+78,card.width-56);context.fillStyle='#315b83';context.fillRect(card.x+55,card.y+180,card.width-110,390);}
      const dataUrl=canvas.toDataURL('image/png'),binary=atob(dataUrl.split(',')[1]),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      const analysis={id:crypto.randomUUID(),title:'OCR-Smoke',sourceType:'Test',sellerName:'',url:'',date:'2026-08-28',sellerPrice:0,shipping:0,extra:0,notes:'',items:[],decisionSnapshots:[],photos:[],photoObservations:[],physicalCards:[]};state.collectionPurchaseAnalyses=[analysis];state.activeCollectionAnalysisId=analysis.id;await desktopApp.saveState(state);
      const photo=await desktopApp.storeCollectionPhoto({analysisId:analysis.id,originalFileName:'ocr-smoke.png',mimeType:'image/png',bytes,sequence:1});analysis.photos=[photo];
      analysis.photoObservations=cards.map((card,index)=>({id:crypto.randomUUID(),analysisId:analysis.id,photoId:photo.id,boundingBox:{x:card.x/canvas.width,y:card.y/canvas.height,width:card.width/canvas.width,height:card.height/canvas.height},observationSource:'manual',detectionConfidence:'unknown',detectionScore:null,detectionSignals:{},detectionReviewState:'manual',row:'1',column:String(index+1),selectedName:'',nameCandidates:[],nameConfidence:'unknown',selectedProductId:'',printCandidates:[],printConfidence:'unknown',recognitionSignals:[],economicRelevant:false,detailPhotoRequired:false,reviewStatus:'unreviewed',physicalCardId:'',linkedCollectionItemId:'',createdAt:new Date().toISOString()}));
      activeCollectionPhotoId=photo.id;activeCollectionObservationId=analysis.photoObservations[0].id;await desktopApp.saveState(state);showView('collectionpurchases');renderCollectionPurchases();await new Promise(resolve=>setTimeout(resolve,300));
      await recognizeActiveCollectionPhotoNames();
      const batchState={label:document.getElementById('collectionNameBatchProgressLabel').textContent,value:document.getElementById('collectionNameBatchProgressValue').textContent,completed:Number(document.getElementById('collectionNameBatchProgressBar').value)};
      const firstBefore={selectedName:analysis.photoObservations[0].selectedName,nameConfidence:analysis.photoObservations[0].nameConfidence,candidates:analysis.photoObservations[0].nameCandidates.map(row=>({name:row.name,metacardId:row.metacardId,score:row.score}))};
      activeCollectionObservationId=analysis.photoObservations[0].id;renderCollectionPhotoEvidence(analysis);await new Promise(resolve=>setTimeout(resolve,50));
      const confirmButton=document.querySelector('[data-select-observation-name]');confirmButton?.click();await new Promise(resolve=>setTimeout(resolve,250));
      const confirmedName=analysis.photoObservations[0].selectedName,confirmedConfidence=analysis.photoObservations[0].nameConfidence;
      await recognizeCollectionObservationName(analysis,photo,analysis.photoObservations[0],{dataUrl,render:false});
      const protectedAfterRescan={selectedName:analysis.photoObservations[0].selectedName,nameConfidence:analysis.photoObservations[0].nameConfidence};
      activeCollectionObservationId=analysis.photoObservations[1].id;renderCollectionPhotoEvidence(analysis);await new Promise(resolve=>setTimeout(resolve,250));
      await desktopApp.saveState(state);const loaded=(await desktopApp.loadState()).state.collectionPurchaseAnalyses[0],databaseStatus=await desktopApp.getDatabaseStatus();
      return {title:document.title,batchState,firstBefore,confirmedName,confirmedConfidence,protectedAfterRescan,secondCandidates:analysis.photoObservations[1].nameCandidates.map(row=>({name:row.name,metacardId:row.metacardId,score:row.score})),loadedObservations:loaded.photoObservations.map(row=>({selectedName:row.selectedName,nameConfidence:row.nameConfidence,candidateCount:row.nameCandidates.length,nameRecognition:row.nameRecognition})),batchButton:Boolean(document.getElementById('recognizeCollectionPhotoNamesBtn')),cancelButton:Boolean(document.getElementById('cancelCollectionNameBatchBtn')),databaseStatus,rendererErrors};
    })()`);
    const topOne=result?.firstBefore?.candidates?.[0],topTwo=result?.secondCandidates?.[0];
    if(!result||!result.title?.includes(expectedVersion)||result.batchState?.completed!==2||result.batchState?.value!=='2 / 2'||!/abgeschlossen/i.test(result.batchState?.label||'')||result.firstBefore.selectedName!==''||result.firstBefore.nameConfidence==='confirmed'||topOne?.metacardId!=='100'||result.confirmedName!=='Nibiru, das Urwesen'||result.confirmedConfidence!=='confirmed'||result.protectedAfterRescan.selectedName!=='Nibiru, das Urwesen'||result.protectedAfterRescan.nameConfidence!=='confirmed'||topTwo?.metacardId!=='200'||result.loadedObservations?.length!==2||!result.loadedObservations.every(row=>row.candidateCount>0&&row.nameRecognition?.lastRunAt)||!result.batchButton||!result.cancelButton||result.databaseStatus?.schemaVersion!==12||result.rendererErrors?.length){
      throw new Error(`Namensprüfungs-Smoke-Test unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/sqlite.*(?:malformed|corrupt)|uncaught|unhandled|typeerror|referenceerror/i.test(output))throw new Error(`Fehlerausgabe der Namensprüfungs-Test-App: ${output.trim()}`);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
