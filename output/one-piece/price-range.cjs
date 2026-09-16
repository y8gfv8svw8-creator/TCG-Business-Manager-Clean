const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='C:/Users/stefa/Desktop/one_piece_sammler_browser_fertig.html';let html=fs.readFileSync(file,'utf8');
function replaceOnce(a,b){assert.equal(html.split(a).length,2,'Eindeutige Fundstelle fehlt');html=html.replace(a,b);}
replaceOnce('<label>Budget je Karte<select id="budget">','<label>Preis von (€)<input id="priceMin" type="number" min="0" step="5" inputmode="decimal" placeholder="0" style="width:120px"></label><label>Preis bis (€)<input id="priceMax" type="number" min="0" step="5" inputmode="decimal" placeholder="Unbegrenzt" style="width:140px"></label><label>Budget-Schnellwahl<select id="budget">');
replaceOnce("&&($('budget').value==='all'||", "&&inPriceRange(c)&&($('budget').value==='all'||");
replaceOnce('function filtered(){',`function inPriceRange(c){const low=$('priceMin').value,high=$('priceMax').value;if(low===''&&high==='')return true;if(c.price==null)return false;return (low===''||c.price>=Number(low))&&(high===''||c.price<=Number(high));}
function updatePriceRange(){page=0;const low=$('priceMin').value,high=$('priceMax').value;message(low!==''&&high!==''&&Number(low)>Number(high)?'Der Von-Preis darf nicht höher als der Bis-Preis sein.':'');render();}
function filtered(){`);
replaceOnce("$('search').addEventListener('input',",`$('budget').addEventListener('change',()=>{const value=$('budget').value;$('priceMin').value='';$('priceMax').value=['all','unknown'].includes(value)?'':value;updatePriceRange();});
for(const id of ['priceMin','priceMax'])$(id).addEventListener('input',()=>{$('budget').value='all';updatePriceRange();});
$('search').addEventListener('input',`);
replaceOnce("$('sort').value='code';$('search').value='';", "$('priceMin').value='';$('priceMax').value='';message('');$('sort').value='code';$('search').value='';");
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);for(const script of scripts)new vm.Script(script);
const fields={priceMin:{value:''},priceMax:{value:''}};const ctx={$:id=>fields[id]};vm.createContext(ctx);vm.runInContext(scripts[1].match(/function inPriceRange\(c\)\{.*?\}\n/)[0],ctx);
const check=(price,want)=>assert.equal(vm.runInContext('inPriceRange({price:'+JSON.stringify(price)+'})',ctx),want);
check(null,true);fields.priceMin.value='10';fields.priceMax.value='25';check(9.99,false);check(10,true);check(25,true);check(25.01,false);check(null,false);fields.priceMax.value='';check(1000,true);fields.priceMin.value='';fields.priceMax.value='5';check(5,true);check(5.01,false);fields.priceMin.value='10';check(7,false);
fs.writeFileSync(file,html,'utf8');assert(fs.readFileSync(file,'utf8').includes('id="priceMin"'));console.log('Preisbereich gespeichert; Grenzen, offene Bereiche, fehlende Preise und Syntax geprüft.');
