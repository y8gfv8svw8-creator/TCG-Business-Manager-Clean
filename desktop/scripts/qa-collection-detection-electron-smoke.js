const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const expectedVersion = require('../package.json').version;
const executable = process.env.TCG_MANAGER_SMOKE_EXE || path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const qaData = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-collection-detection-ui-'));
const chromiumData = path.join(qaData, 'Chromium');
const port = 9262;
fs.mkdirSync(chromiumData, { recursive: true });
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

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
  throw new Error('Die Kartenflächen-Prüfoberfläche wurde nicht rechtzeitig geöffnet.');
}

function evaluate(webSocketUrl, expression) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const timer = setTimeout(() => { socket.close();reject(new Error('Kartenflächen-Oberflächentest hat zu lange gedauert.')); }, 90000);
    socket.onopen = () => socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    socket.onerror = () => { clearTimeout(timer);reject(new Error('Verbindung zur Kartenflächen-Prüfoberfläche fehlgeschlagen.')); };
    socket.onmessage = event => {
      const message = JSON.parse(event.data);if (message.id !== 1) return;
      clearTimeout(timer);socket.close();
      if (message.result?.exceptionDetails) return reject(new Error(message.result.exceptionDetails.exception?.description || message.result.exceptionDetails.text || 'JavaScript-Fehler in der Kartenflächen-Oberfläche.'));
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
    const page = await waitForPage();await delay(1800);
    const result = await evaluate(page.webSocketDebuggerUrl, `(async()=>{
      const rendererErrors=[];window.addEventListener('error',event=>rendererErrors.push(String(event.error?.stack||event.message||event.error||'Renderer-Fehler')));
      const notices=[];window.alert=message=>notices.push(String(message));window.confirm=()=>true;
      const canvas=(width,height,background='#aaa294')=>{const node=document.createElement('canvas');node.width=width;node.height=height;const context=node.getContext('2d');context.fillStyle=background;context.fillRect(0,0,width,height);return {node,context,expected:[]};};
      const paintCard=(target,box,angle=0)=>{const context=target.context,cx=box.x+box.width/2,cy=box.y+box.height/2;context.save();context.translate(cx,cy);context.rotate(angle*Math.PI/180);context.fillStyle='#171a1e';context.fillRect(-box.width/2,-box.height/2,box.width,box.height);context.fillStyle='#c78e67';context.fillRect(-box.width/2+7,-box.height/2+7,box.width-14,box.height-14);context.fillStyle='#dcba78';context.fillRect(-box.width*.42,-box.height*.42,box.width*.84,box.height*.07);context.fillStyle='#345c80';context.fillRect(-box.width*.40,-box.height*.28,box.width*.8,box.height*.4);context.restore();const radians=angle*Math.PI/180,corners=[[-box.width/2,-box.height/2],[box.width/2,-box.height/2],[box.width/2,box.height/2],[-box.width/2,box.height/2]].map(([x,y])=>({x:cx+x*Math.cos(radians)-y*Math.sin(radians),y:cy+x*Math.sin(radians)+y*Math.cos(radians)}));const minX=Math.max(0,Math.min(...corners.map(row=>row.x))),minY=Math.max(0,Math.min(...corners.map(row=>row.y))),maxX=Math.min(target.node.width,Math.max(...corners.map(row=>row.x))),maxY=Math.min(target.node.height,Math.max(...corners.map(row=>row.y)));target.expected.push({x:minX/target.node.width,y:minY/target.node.height,width:(maxX-minX)/target.node.width,height:(maxY-minY)/target.node.height});};
      const evaluateImage=async(target,threshold=.4)=>{const detection=await TcgScannerImageProcessing.detectCollectionCardsFromDataUrl(target.node.toDataURL('image/png'));return {...TcgScannerImageProcessing.evaluateCollectionDetections(target.expected,detection.detections,threshold),detections:detection.detections,quality:detection.photoQuality,scene:detection.sceneAnalysis,detectorMode:detection.parameters.detectorMode};};
      const blank=canvas(640,420),single=canvas(720,520),four=canvas(760,560),grid=canvas(780,780,'#303338'),slanted=canvas(700,560),rotated=canvas(760,620),overlap=canvas(860,660),fan=canvas(920,700),stack=canvas(980,720),chaotic=canvas(900,700),mixed=canvas(920,760,'#3b3e43');
      paintCard(single,{x:250,y:55,width:220,height:325});
      [[60,55],[245,55],[430,55],[245,310]].forEach(([x,y])=>paintCard(four,{x,y,width:145,height:215}));
      for(let row=0;row<3;row+=1)for(let column=0;column<3;column+=1)paintCard(grid,{x:72+column*235,y:45+row*245,width:145,height:214});
      paintCard(slanted,{x:250,y:100,width:180,height:265},7);
      paintCard(rotated,{x:275,y:145,width:180,height:265},45);
      paintCard(overlap,{x:250,y:165,width:190,height:279},-24);paintCard(overlap,{x:405,y:205,width:185,height:272},31);
      paintCard(fan,{x:255,y:180,width:185,height:272},-28);paintCard(fan,{x:340,y:150,width:185,height:272},-4);paintCard(fan,{x:425,y:185,width:185,height:272},25);
      paintCard(stack,{x:205,y:190,width:190,height:279},-22);paintCard(stack,{x:355,y:155,width:190,height:279},2);paintCard(stack,{x:505,y:195,width:190,height:279},24);
      paintCard(chaotic,{x:85,y:90,width:150,height:221},-28);paintCard(chaotic,{x:360,y:80,width:175,height:257},18);paintCard(chaotic,{x:665,y:330,width:130,height:191},63);
      [[55,45],[260,45],[55,335],[260,335]].forEach(([x,y])=>paintCard(mixed,{x,y,width:145,height:214}));paintCard(mixed,{x:620,y:300,width:155,height:228},-39);
      const metrics={blank:await evaluateImage(blank),single:await evaluateImage(single),four:await evaluateImage(four),grid:await evaluateImage(grid),slanted:await evaluateImage(slanted),rotated:await evaluateImage(rotated,.3),overlap:await evaluateImage(overlap,.24),fan:await evaluateImage(fan,.24),stack:await evaluateImage(stack,.24),chaotic:await evaluateImage(chaotic,.28),mixed:await evaluateImage(mixed,.28)};
      const id=()=>crypto.randomUUID(),analysis={id:id(),title:'Automatische Kartenflächen',sourceType:'Privat',sellerName:'',url:'',date:'2026-08-22',sellerPrice:0,shipping:0,extra:0,notes:'',items:[],decisionSnapshots:[],photos:[],photoObservations:[],physicalCards:[]};
      state.collectionPurchaseAnalyses=[analysis];state.activeCollectionAnalysisId=analysis.id;await window.desktopApp.saveState(state);
      const dataUrl=four.node.toDataURL('image/png'),binary=atob(dataUrl.split(',')[1]),bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
      const photo=await window.desktopApp.storeCollectionPhoto({analysisId:analysis.id,originalFileName:'vier-karten.png',mimeType:'image/png',bytes,sequence:1});analysis.photos=[photo];
      await window.desktopApp.saveState(state);showView('collectionpurchases');activeCollectionPhotoId=photo.id;activeCollectionObservationId='';renderCollectionPurchases();await new Promise(resolve=>setTimeout(resolve,250));
      await detectActiveCollectionPhoto();await new Promise(resolve=>setTimeout(resolve,250));
      const initialAutomatic=analysis.photoObservations.filter(row=>row.observationSource==='automatic'&&row.detectionReviewState==='suggested');
      const first=initialAutomatic[0],second=initialAutomatic[1];activeCollectionObservationId=first.id;renderCollectionPhotoEvidence(analysis);const originalX=first.boundingBox.x;document.getElementById('collectionBBoxX').value=Math.min(.7,originalX+.01);document.getElementById('collectionBBoxX').dispatchEvent(new Event('change',{bubbles:true}));
      activeCollectionObservationId=first.id;renderCollectionPhotoEvidence(analysis);document.getElementById('confirmCollectionDetectionBtn').click();
      const manual=createCollectionObservation({x:.02,y:.68,width:.16,height:.25});
      if(second){activeCollectionObservationId=second.id;renderCollectionPhotoEvidence(analysis);document.getElementById('deleteCollectionObservationBtn').click();}
      const visibleBeforeRescan=analysis.photoObservations.filter(row=>row.detectionReviewState!=='rejected').length,rejectedBeforeRescan=analysis.photoObservations.filter(row=>row.detectionReviewState==='rejected').length;
      await detectActiveCollectionPhoto();await new Promise(resolve=>setTimeout(resolve,250));
      const visibleAfterRescan=analysis.photoObservations.filter(row=>row.detectionReviewState!=='rejected').length;
      await window.desktopApp.saveState(state);const loaded=(await window.desktopApp.loadState()).state,loadedAnalysis=loaded.collectionPurchaseAnalyses.find(row=>row.id===analysis.id),databaseStatus=await window.desktopApp.getDatabaseStatus();
      return {title:document.title,metrics,initialAutomatic:initialAutomatic.length,moved:Boolean(first&&first.boundingBox.x!==originalX),confirmed:loadedAnalysis.photoObservations.some(row=>row.id===first?.id&&row.detectionReviewState==='confirmed'),manual:loadedAnalysis.photoObservations.some(row=>row.id===manual?.id&&row.observationSource==='manual'),rejected:loadedAnalysis.photoObservations.filter(row=>row.detectionReviewState==='rejected').length,visibleBeforeRescan,visibleAfterRescan,rejectedBeforeRescan,automaticBoxes:document.querySelectorAll('.collection-photo-box.source-automatic').length,manualBoxes:document.querySelectorAll('.collection-photo-box.source-manual').length,qualityVisible:!document.getElementById('collectionPhotoQuality').hidden,sceneStored:loadedAnalysis.photos[0].sceneAnalysis,sceneText:document.getElementById('collectionPhotoQuality').textContent,inventoryCount:(loaded.inventory||[]).length,purchaseCount:(loaded.purchases||[]).length,physicalCardCount:loadedAnalysis.physicalCards.length,databaseStatus,notices,rendererErrors};
    })()`);
    const metrics=result?.metrics||{},smallRegions=rows=>Array.isArray(rows)&&rows.every(row=>Number(row.boundingBox?.width||0)*Number(row.boundingBox?.height||0)<.25),validMetrics=metrics.blank?.detectedCards===0&&metrics.single?.truePositives===1&&metrics.four?.truePositives===4&&metrics.four?.precision>=.75&&metrics.grid?.truePositives===9&&metrics.grid?.recall>=.85&&metrics.grid?.scene?.sceneType==='binder_grid'&&metrics.slanted?.truePositives===1&&metrics.rotated?.truePositives===1&&metrics.rotated?.scene?.sceneType==='loose_cards'&&metrics.overlap?.truePositives===2&&metrics.fan?.detectedCards>=1&&metrics.fan?.detectedCards<=3&&smallRegions(metrics.fan?.detections)&&metrics.fan?.scene?.sceneType!=='binder_grid'&&metrics.stack?.detectedCards>=1&&metrics.stack?.detectedCards<=4&&smallRegions(metrics.stack?.detections)&&metrics.stack?.scene?.sceneType!=='binder_grid'&&metrics.chaotic?.truePositives===3&&metrics.chaotic?.scene?.sceneType!=='binder_grid'&&metrics.chaotic?.scene?.sceneComplexity?.level!=='low'&&metrics.mixed?.truePositives>=4;
    if(!result||!result.title?.includes(expectedVersion)||!validMetrics||result.initialAutomatic<4||!result.moved||!result.confirmed||!result.manual||result.rejected<1||result.rejectedBeforeRescan<1||result.visibleAfterRescan!==result.visibleBeforeRescan||result.automaticBoxes<2||result.manualBoxes!==1||!result.qualityVisible||!result.sceneStored?.sceneType||!result.sceneText?.includes('Szene:')||result.inventoryCount!==0||result.purchaseCount!==0||result.physicalCardCount!==0||result.databaseStatus?.schemaVersion!==12||result.rendererErrors?.length){
      throw new Error(`Kartenflächen-Oberflächentest unvollständig: ${JSON.stringify(result)}`);
    }
    process.stdout.write(`${JSON.stringify(result,null,2)}\n`);
  } finally {
    child.kill();await delay(700);fs.rmSync(qaData,{recursive:true,force:true,maxRetries:5,retryDelay:200});
    if(output.trim()&&/error|exception|sqlite.*(?:malformed|corrupt)/i.test(output))throw new Error(`Fehlerausgabe der Kartenflächen-Test-App: ${output.trim()}`);
  }
}

main().catch(error=>{console.error(error);process.exitCode=1;});
