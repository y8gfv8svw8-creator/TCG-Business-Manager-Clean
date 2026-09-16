const fs=require('fs'),vm=require('vm');const src='C:/Users/stefa/Desktop/YuGiOh-Sammler/',dest=__dirname+'/YuGiOh-Sammler/';
let app=fs.readFileSync(src+'app.js','utf8'),html=fs.readFileSync(src+'index.html','utf8');
function edit(a,b){if(!app.includes(a))throw Error(a);app=app.replace(a,b);}
html=html.replace('<label>Seltenheit<select','<label>Katalog<select id="catalogScope"><option value="official">Offizielles Setverzeichnis</option><option value="legacy">Altbestand · ungeprüft</option><option value="all">Alle Einträge</option></select></label><label>Seltenheit<select');
html=html.replace('Katalog · 10.09.2026','Setabgleich · 15.09.2026');
html=html.replace('<section class="filters"','<p id="catalogNotice" class="collection-help" role="status"></p><section class="filters"');
edit("return(ignoreOwnership===true", "return($('catalogScope').value==='all'||($('catalogScope').value==='legacy'?p.auditState==='legacy':p.auditState!=='legacy'))&&(ignoreOwnership===true");
edit("function render(){if(!data)return;",`function render(){if(!data)return;const selectedSet=data.sets.find(s=>normalize(s.name)===normalize($('set').value.trim()));const legacyOwned=prints.filter(p=>p.auditState==='legacy'&&owned.has(p.id)).length;$('catalogNotice').innerHTML=selectedSet?.officialPid?esc(selectedSet.cards+' Karten laut Konami · '+selectedSet.prints+' erfasste Druckvarianten · ')+(selectedSet.auditState==='verified'?'Setnummern und Seltenheiten abgeglichen.':'Einzelne Druckdetails noch ungeprüft.')+' <a href="'+esc(selectedSet.source)+'" target="_blank" rel="noopener">Offizielle Setliste ↗</a>':esc(data.meta.officialSetCount+' offizielle TCG-Produktlisten · '+data.meta.unresolvedCount+' Einträge mit offenen Druckdetails. '+legacyOwned+' Besitz-Einträge liegen im ungeprüften Altbestand. Diese findest du über den Katalogfilter. Preise sind weiterhin Richtwerte vom 10.09.2026.');`);
edit("['rarity','type','view'", "['catalogScope','rarity','type','view'");
edit("$('sort').value='name';$('priceMode')", "$('catalogScope').value='official';$('sort').value='name';$('priceMode')");
edit("data.sets.filter(s=>normalize(s.name+' '+s.code).includes(q))", "data.sets.filter(s=>($('catalogScope').value==='all'||($('catalogScope').value==='legacy'?s.auditState==='legacy':s.officialPid))&&normalize(s.name+' '+s.code).includes(q))");
edit("${s.prints?s.prints+' Druckvarianten':'noch ohne Kartendaten'}", "${s.cards} Karten · ${s.prints?s.prints+' Druckvarianten':'noch ohne Kartendaten'} · ${s.officialPid?'Konami-Liste':'Altbestand · ungeprüft'}");
edit("${matches(p)?'<br><span", "${p.source?'<br><a href=\"'+esc(p.source)+'\" target=\"_blank\" rel=\"noopener\">Setquelle prüfen ↗</a>':''}${matches(p)?'<br><span");
edit("<br>'+esc(cardName(c))+'</td>", "<br>'+esc(cardName(c))+(p.auditState==='legacy'?'<br><span class=\"detail-info\">Ungeprüft – bitte selbst prüfen</span>':'')+'</td>");
edit("<span>Bild wird geladen …</span>'", "<span>'+(c.images[0]?'Bild wird geladen …':'Kein Bild hinterlegt · Details öffnen')+'</span>'");
edit('<span>Bild wird lokal gespeichert …</span>', '<span>${c.images[0]?\'Bild wird lokal gespeichert …\':\'Kein Bild hinterlegt · Details öffnen\'}</span>');
// Never discard saved IDs just because a previously unassigned card gains its first set.
edit("if(!indexes.has(i))prints.push", "if(!indexes.has(i))prints.push");
edit("price:null,product:null});for(const p of prints)", "price:null,product:null,auditState:'legacy'});for(const p of prints)");
edit("$('setlist').innerHTML=data.sets.map", "$('setlist').innerHTML=data.sets.filter(s=>s.officialPid).map");
edit("${esc(s.code)} · ${s.prints} Varianten", "${esc(s.code)} · ${s.cards} Karten · ${s.prints} Varianten");
edit("[data.meta.cardCount,'Karten'],[data.meta.setCount,'Sets'],[data.meta.printCount,'Druckvarianten']", "[data.meta.officialCardCount,'Karten (Konami)'],[data.meta.officialSetCount,'Offizielle Sets'],[data.meta.officialPrintCount,'Druckvarianten']");
app+=`\n$('catalogScope').addEventListener('change',()=>{$('setlist').innerHTML=data.sets.filter(s=>$('catalogScope').value==='all'||($('catalogScope').value==='legacy'?s.auditState==='legacy':s.officialPid)).map(s=>'<option value="'+esc(s.name)+'">'+esc(s.code)+' · '+s.cards+' Karten</option>').join('');});\n`;
new vm.Script(app);fs.writeFileSync(dest+'app.js',app);fs.writeFileSync(dest+'index.html',html);fs.copyFileSync(src+'style.css',dest+'style.css');
