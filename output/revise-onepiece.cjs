const fs=require('fs'),vm=require('vm');
const input='C:/Users/stefa/Desktop/one_piece_sammler_browser_fertig.html';
let html=fs.readFileSync(input,'utf8');
const start=html.indexOf('const cards=')+12,end=html.indexOf(';const aliases=',start);
if(start<12||end<0)throw Error('Data boundary missing');
const cards=JSON.parse(html.slice(start,end));
let confirmed=0;
for(const c of cards){
 c.finishStatus='unknown';c.finish='Ungeprüft – bitte selbst prüfen';
 c.finishEvidence=null;c.finishCheckedAt=null;
 c.assignmentStatus='Ungeprüft – bitte selbst prüfen';
 c.priceStatus='Historischer Richtwert – Preis und genaue Ausgabe bitte selbst prüfen';
 if(c.id==='print:OP09-076?v=3'&&c.set==='Welcome Pack Vol.2'&&c.print==='Full Art'){
  c.finishStatus='nonfoil';c.finish='Non-Foil · ohne Holo';
  c.finishEvidence='https://tradingcardplanet.com/products/roronoa-zoro-welcome-pack-vol-2-op09-076-one-piece-promotion-cards';
  c.finishCheckedAt='14.09.2026';
  c.finishEvidenceNote='Händler führt genau diese Welcome-Pack-Ausgabe als Non-Foil; Motiv mit Nutzerfoto abgeglichen. Kein offizieller Bandai-Nachweis zur Oberfläche.';
  confirmed++;
 }
}
if(confirmed!==1)throw Error('Expected one exact Zoro match');
html=html.slice(0,start)+JSON.stringify(cards)+html.slice(end);
function replace(a,b){if(!html.includes(a))throw Error('Missing replacement: '+a.slice(0,100));html=html.replace(a,b);}
replace('Abgleich vom 10.09.2026','Datenstand 10.09.2026 · Prüfkennzeichnung überarbeitet am 14.09.2026');
replace('<label>Preis von (€)', '<label>Oberfläche<select id="finish"><option value="all">Alle Prüfstände</option><option value="foil">Foil · mit Nachweis</option><option value="nonfoil">Non-Foil · mit Nachweis</option><option value="unknown">Ungeprüft · selbst prüfen</option></select></label><label>Preis von (€)');
replace('<main class="wrap">','<main class="wrap"><div class="note audit-banner"><strong>Foil ist keine Vermutung mehr.</strong><p>Full Art, Alternate Art und Seltenheit bestätigen keine Holo-Oberfläche. 1 Ausgabe ist als Non-Foil belegt, 578 Oberflächen sind ungeprüft. Der Foil-Filter zeigt nur Ausgaben mit einem eigenen Nachweis; aktuell gibt es dafür keinen bestätigten Eintrag.</p><p>Gelbe Hinweise stehen direkt an offenen Angaben. Bilder und Variantenbezeichnungen allein sind kein Nachweis für Oberfläche, Nachdruck oder Auflage.</p></div>');
replace('„Ausführung prüfen“ bedeutet: Die Quelle beschreibt den Druck, bestätigt aber keine eindeutige Foil-Oberfläche.', '„Ungeprüft – bitte selbst prüfen“ bedeutet: Für diese konkrete Angabe liegt kein ausreichender Einzelabgleich vor. Die bisherigen pauschalen Foil-Zuordnungen wurden entfernt. Variantenbezeichnungen stammen aus dem vorhandenen Katalog und sind kein Oberflächennachweis. Auch vorhandene Produktlinks wurden nicht vollständig einzeln verifiziert.');
replace('Cardmarket öffnet mit diesen Filtern; Versand kommt hinzu.', 'Vorhandene Cardmarket-Links sind Prüflinks: Kontrolliere dort die genaue Variante, Sprache, Oberfläche, Auflage und den Zustand. Filter in der URL garantieren kein passendes Angebot; Versand kommt hinzu.');
replace("&&(!$('onlyFav').checked", "&&($('finish').value==='all'||c.finishStatus===$('finish').value)&&(!$('onlyFav').checked");
replace("['character','variant','budget','sort','onlyFav']", "['character','variant','finish','budget','sort','onlyFav']");
replace("['character','variant','budget'])", "['character','variant','finish','budget'])");
replace("<div class=\"variant\">${esc(c.print)}</div>","<div class=\"variant\">${esc(c.print)}</div><div class=\"small\">Variantenbezeichnung aus Katalog · kein Foil-Nachweis</div>");
replace("<span class=\"badge ${c.finish.includes('prüfen')?'notice':''}\">${esc(c.finish)}</span>","<span class=\"badge ${c.finishStatus==='unknown'?'notice':'good'}\">Oberfläche: ${esc(c.finish)}</span>");
replace('<div class="price">${c.price==null?', '<div class="verification">${c.finishEvidence?`<a href="${esc(c.finishEvidence)}" target="_blank" rel="noopener">Non-Foil-Nachweis (Händler) ↗</a><div class="small">Prüfdatum: ${esc(c.finishCheckedAt)} · Motiv abgeglichen</div><div class="small">${esc(c.finishEvidenceNote)}</div>`:`<div class="small notice">Kein Oberflächennachweis für diese Ausgabe.</div>`}<div class="small notice">Set / Druck / Produktlink: ${esc(c.assignmentStatus)}</div></div><div class="price">${c.price==null?');
replace("'Richtwert · '+esc(c.priceDate)","'Historischer Richtwert · '+esc(c.priceDate)");
replace('<div class="actions"><button class="fav', '<div class="small notice">${c.price==null?\'\':esc(c.priceStatus)}</div><div class="actions"><button class="fav');
replace('>Cardmarket ↗</a>','>Bei Cardmarket prüfen ↗</a>');
replace('>Druck & Preisquelle ↗</a>','>Katalog & Preisquelle prüfen ↗</a>');
replace('</style>','.verification{margin:10px 0;line-height:1.5}.verification a{font-size:12px}.verification .small{margin-top:6px}.audit-banner p{margin:8px 0}.badge.notice{border-color:#807032;background:#302b1c}.actions{margin-top:12px}.source{display:inline-block;margin-top:8px}</style>');
// A field-by-field audit export keeps uncertainty with the exported data.
replace('<button id="import">','<button id="auditExport">Prüfliste exportieren</button><button id="import">');
replace("$('import').onclick",`$('auditExport').onclick=()=>{const entries=filtered().map(({image,...entry})=>entry);const blob=new Blob([JSON.stringify({format:'one-piece-verification',version:1,reviewDate:'14.09.2026',note:'Nur explizite Oberflächennachweise sind bestätigt. Andere Angaben bleiben ungeprüft; Preise sind historisch.',cards:entries},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='one-piece-pruefliste.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message(entries.length+' Einträge mit Prüfstatus exportiert.');};
$('import').onclick`);
for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
fs.mkdirSync('output/onepiece-revised',{recursive:true});
fs.writeFileSync('output/onepiece-revised/one_piece_sammler_browser_fertig.html',html);
console.log(JSON.stringify({cards:cards.length,nonfoil:confirmed,unknown:cards.filter(c=>c.finishStatus==='unknown').length,images:cards.filter(c=>c.image?.startsWith('data:image')).length,bytes:Buffer.byteLength(html)}));
