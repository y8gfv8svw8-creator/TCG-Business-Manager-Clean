const fs=require('fs'),vm=require('vm');let base=fs.readFileSync(__dirname+'/test.cjs','utf8');base+=`
el('min').value='';el('max').value='';el('priceMode').value='set';el('ownership').value='';el('view').value='list';run('owned=new Set();favorites=new Set()');
const candidate=data.prints.find(p=>data.prints.some(q=>q.card===p.card&&q.set===p.set&&q.id!==p.id));assert(candidate);ctx.chosen=candidate;
run('owned.add(chosen.id)');el('ownership').value='owned';assert.equal(run('prints.filter(matches).length'),1);el('ownership').value='missing';assert(!run('prints.filter(matches).some(p=>p.id===chosen.id)'));assert(run('prints.filter(matches).some(p=>p.card===chosen.card&&p.set===chosen.set)'));assert(run('matches(chosen,true)'));el('ownership').value='';
assert(run('makeRows(prints).every(r=>r.prints.every(p=>p.card===r.card&&p.set===r.representative.set))'));assert(run('compareSetNumber({code:"ABC-EN2",set:"A",rarity:"R"},{code:"ABC-EN10",set:"A",rarity:"R"})<0'));
let saved='';ctx.localStorage.setItem=(k,v)=>saved=v;run('save()');assert(JSON.parse(saved).owned.includes(candidate.id));
run('detailSet=chosen.set');el('detail').showModal=()=>{};run('detail(data.cards[chosen.card].id,false)');assert(el('detailBody').innerHTML.includes('Nur Varianten aus diesem Set'));assert(!el('detailBody').innerHTML.includes('weitere Sets'));
console.log('PASS: Besitz je Variante, fehlende Karten, Setgrenzen, natürliche Setnummernsortierung, setbezogene Details und gespeicherter Besitz.');
`;vm.runInThisContext('(function(require,__dirname){'+base+'\n})')(require,__dirname);
