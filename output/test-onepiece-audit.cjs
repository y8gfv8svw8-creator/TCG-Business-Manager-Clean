const fs=require('fs'),vm=require('vm'),assert=require('assert');
const file='output/onepiece-revised/one_piece_sammler_browser_fertig.html';
const before=fs.readFileSync('C:/Users/stefa/Desktop/one_piece_sammler_browser_fertig.html','utf8');
const html=fs.readFileSync(file,'utf8');
function data(s){return JSON.parse(s.slice(s.indexOf('const cards=')+12,s.indexOf(';const aliases=')));}
const previous=data(before),current=data(html);
assert.equal(current.length,previous.length);
for(let i=0;i<current.length;i++)for(const key of ['id','image','price','priceDate','url','source'])assert.deepEqual(current[i][key],previous[i][key],key);
assert(!current.some(c=>c.finish==='Foil / Parallel'));
const elements=new Map();
const el=id=>{if(!elements.has(id))elements.set(id,{value:['character','variant','finish','budget'].includes(id)?'all':id==='sort'?'code':'',checked:false,style:{},options:[],dataset:{},addEventListener(){},click(){},showModal(){},close(){}});return elements.get(id);};
let blob,stored;const ctx={document:{getElementById:el,createElement:()=>({click(){}})},localStorage:{getItem:()=>JSON.stringify(['print:OP09-076?v=3']),setItem:(k,v)=>stored=v},Blob:class{constructor(parts){blob=JSON.parse(parts[0]);}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},setTimeout:fn=>fn(),window:{scrollTo(){}}};
vm.createContext(ctx);for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(script[1],ctx);
const count=()=>vm.runInContext('filtered().length',ctx);
assert.equal(count(),579);el('finish').value='foil';assert.equal(count(),459);
el('finish').value='nonfoil';assert.equal(count(),67);el('search').value='OP09-076';assert.equal(count(),1);vm.runInContext('render()',ctx);
assert(el('grid').innerHTML.includes('Non-Foil · laut TCGplayer'));assert(el('grid').innerHTML.includes('★ Favorit'));
el('auditExport').onclick();assert.equal(blob.cards[0].finishStatus,'nonfoil');assert(blob.cards[0].finishEvidence);assert(!blob.cards[0].image);
el('search').value='';el('finish').value='unknown';assert.equal(count(),53);vm.runInContext('render()',ctx);assert(el('grid').innerHTML.includes('Ungeprüft – bitte selbst prüfen'));
el('finish').value='all';el('search').value='OP09-076';assert(count()>1);
el('onlyFav').checked=true;assert.equal(count(),1);el('export').onclick();assert.deepEqual(blob.favorites,['print:OP09-076?v=3']);
el('reset').onclick();assert.equal(count(),579);assert.equal(el('finish').value,'all');
el('priceMin').value='5';el('priceMax').value='10';assert(vm.runInContext('filtered().every(c=>c.price>=5&&c.price<=10)',ctx));
console.log('PASS: 579 images and IDs preserved, original prices/links preserved, exact Zoro correction, unknown/foil/nonfoil filters, search, favorite persistence/export, verification export, reset and price range.');

for(const c of current){if(c.finishStatus!=='unknown'){assert(c.finishAudit.identityMatched);assert.equal(c.finishAudit.subtypes.length,1);assert.equal(c.finishAudit.subtypes[0],c.finishStatus==='foil'?'Foil':'Normal');} }
assert.equal(current.find(c=>c.id==='print:P-006?v=1').finishStatus,'unknown');
console.log('PASS: Every classified finish has an exact identity match and a single explicit source subtype. Known conflict remains unknown.');
