const fs=require('fs'),vm=require('vm'),path=require('path');
const input='C:/Users/stefa/Desktop/one_piece_sammler_browser_fertig.html';let html=fs.readFileSync(input,'utf8');
const start=html.indexOf('const cards=')+12,end=html.indexOf(';const aliases=',start),cards=JSON.parse(html.slice(start,end));
const matches=JSON.parse(fs.readFileSync(__dirname+'/verification/matches.json'));
const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const conflicts={'print:P-006?v=1':'Widerspruch: TCGplayer führt Normal; rarecards.nl bezeichnet dieselbe Winner-Ausgabe als Foil. Oberfläche selbst prüfen.'};
const counts={foil:0,nonfoil:0,unknown:0};
for(const c of cards){
 const m=matches.find(x=>x.id===c.id);let reason='Kein eindeutiger Produktverweis für diese Druckvariante verfügbar.';
 c.finishStatus='unknown';c.finish='Ungeprüft – bitte selbst prüfen';c.finishEvidence=null;c.finishCheckedAt='14.09.2026';
 if(m){
  const identity=m.p&&m.p.extendedData.some(e=>e.name==='Number'&&e.value.split(/\s*[,;\/]\s*/).includes(c.code))&&normalize(m.p.name).startsWith(normalize(c.name))&&matches.filter(x=>x.tcg===m.tcg).length===1;
  c.finishAudit={productId:m.tcg,productName:m.p?.name,productUrl:m.p?.url,subtypes:m.types,identityMatched:identity,source:'https://tcgcsv.com/tcgplayer/68/'+m.p.groupId+'/prices',productSource:'https://tcgcsv.com/tcgplayer/68/'+m.p.groupId+'/products',mappingSource:c.source,mappingDate:'10.09.2026',checkedAt:'14.09.2026'};
  reason=!identity?'Produktzuordnung nicht eindeutig.':m.types.length>1?'Dieses Produkt führt Foil und Normal; konkrete Oberfläche selbst prüfen.':!m.types.length?'Produkt zugeordnet, aber keine Oberflächenangabe in den Marktdaten vorhanden.':'Oberflächenbezeichnung der Quelle nicht eindeutig.';
  if(identity&&m.types.length===1&&['Foil','Normal'].includes(m.types[0])&&!conflicts[c.id]){
   c.finishStatus=m.types[0]==='Foil'?'foil':'nonfoil';c.finish=(c.finishStatus==='foil'?'Foil':'Non-Foil')+' · laut TCGplayer';c.finishEvidence=m.p.url;
   c.finishEvidenceNote='Konkreter Produktverweis, Kartenname und Kartennummer abgeglichen. Marktkatalog führt '+m.types[0]+'. Keine pauschale Ableitung aus Seltenheit oder Artwork.';
  }
 }
 if(c.finishStatus==='unknown'){c.finishEvidenceNote=conflicts[c.id]||reason;c.finishOpenReason=c.finishEvidenceNote;}
 if(conflicts[c.id])c.finishConflictSource='https://rarecards.nl/products/monkey-d-luffy-winner-pack-vol-1-p-006-promotion-cards-foil';
 counts[c.finishStatus]++;
}
html=html.slice(0,start)+JSON.stringify(cards)+html.slice(end);
function replace(a,b){if(!html.includes(a))throw Error('Missing: '+a.slice(0,80));html=html.replace(a,b);}
replace('1 Ausgabe ist als Non-Foil belegt, 578 Oberflächen sind ungeprüft. Der Foil-Filter zeigt nur Ausgaben mit einem eigenen Nachweis; aktuell gibt es dafür keinen bestätigten Eintrag.',`${counts.foil} Ausgaben führen Foil und ${counts.nonfoil} Non-Foil im zugeordneten Marktkatalog. ${counts.unknown} bleiben ungeprüft oder mehrdeutig. Abgleich am 14.09.2026 über konkrete TCGplayer-Produktnummern, Kartennummern und Namen; Oberflächenangaben aus TCGCSV/TCGplayer. Das ist ein Quellenabgleich, keine physische Prüfung oder Bandai-Zertifizierung.`);
replace('Foil · mit Nachweis','Foil · laut Quelle');replace('Non-Foil · mit Nachweis','Non-Foil · laut Quelle');
replace('Non-Foil-Nachweis (Händler) ↗','Oberfläche bei TCGplayer ↗');
replace(' · Motiv abgeglichen',' · Produktnummer abgeglichen');
replace('<div class="small notice">Kein Oberflächennachweis für diese Ausgabe.</div>','<div class="small notice">${esc(c.finishOpenReason||\'Kein Oberflächennachweis für diese Ausgabe.\')}</div>${c.finishAudit?`<a href="${esc(c.finishAudit.productUrl)}" target="_blank" rel="noopener">Offenes Produkt prüfen ↗</a>`:\'\'}${c.finishConflictSource?`<br><a href="${esc(c.finishConflictSource)}" target="_blank" rel="noopener">Widersprechende Quelle ↗</a>`:\'\'}');
replace('<div class="small">${esc(c.finishEvidenceNote)}</div>', '<details class="small"><summary>Prüfweg und Nachweis</summary><p>${esc(c.finishEvidenceNote)}</p><p>${esc(c.finishAudit?.productName)} · Produkt ${esc(c.finishAudit?.productId)}</p><a href="${esc(c.finishAudit?.source)}" target="_blank" rel="noopener">Datensatz: ${esc(c.finishAudit?.subtypes.join(\', \'))} ↗</a><p>Die Aussage gilt für das verlinkte Produkt. Ein Nachdruck mit gleichem Motiv kann eine andere Oberfläche haben.</p></details>');
replace('Nur explizite Oberflächennachweise sind bestätigt. Andere Angaben bleiben ungeprüft; Preise sind historisch.','Oberflächen laut zugeordnetem TCGplayer-Marktkatalog; Prüfweg und offene Fälle je Eintrag enthalten. Preise sind historisch.');
replace('<p>„Ungeprüft – bitte selbst prüfen“ bedeutet:', '<p>Oberflächenprüfung: Der direkte Produktverweis der konkreten Limitless-Druckseite wurde mit den über <a href="https://tcgcsv.com/" target="_blank" rel="noopener">TCGCSV</a> bereitgestellten TCGplayer-Produkt- und Oberflächendaten verbunden. Kartennummer, Name und eindeutige Produktzuordnung müssen übereinstimmen. Nur ein eindeutig geführter Typ Foil oder Normal wird übernommen. Mehrere Typen, fehlende Daten und bekannte Widersprüche bleiben offen.</p><p>„Ungeprüft – bitte selbst prüfen“ bedeutet:');
for(const s of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(s[1]);
fs.writeFileSync('output/onepiece-revised/one_piece_sammler_browser_fertig.html',html);
fs.writeFileSync(__dirname+'/verification/audit.json',JSON.stringify({date:'14.09.2026',counts,cards:cards.map(({image,...c})=>c)},null,2));
console.log(counts);
