const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const { TcgDatabase } = require('../app/main/database');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

function temporaryDatabase(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-card-search-'));
  const database = new TcgDatabase({
    databasePath:path.join(root, 'data.sqlite'),
    schemaPath,
    backupRoot:path.join(root, 'backups')
  });
  t.after(() => {
    database.close();
    fs.rmSync(root, {recursive:true,force:true});
  });
  return database.open();
}

test('findet deutsche und englische Teilnamen und liefert alle Cardmarket-Druckvarianten', t => {
  const database = temporaryDatabase(t);
  const variants = ['700001','700002','700003'].map((productId,index) => ({
    productId,
    metacardId:'100',
    expansionId:String(400 + index),
    officialName:'Blue-Eyes White Dragon',
    officialBaseName:'Blue-Eyes White Dragon',
    setName:`Test Set ${index + 1}`,
    setCode:`TST${index + 1}-EN001`,
    rarity:index ? 'Ultra Rare' : 'Secret Rare'
  }));
  database.upsertProducts([
    ...variants,
    {
      productId:'800001',metacardId:'200',expansionId:'500',
      officialName:"Fiendsmith's Requiem",officialBaseName:"Fiendsmith's Requiem",
      setName:'Infinite Forbidden',setCode:'INFO-EN017',rarity:'Ultra Rare'
    }
  ]);
  database.upsertCardNames({
    source:'test-catalog',
    sourceRevision:'revision-1',
    replaceAliases:true,
    mappings:[
      {metacardId:'100',externalCardId:'89631139',nameDe:'Blauäugiger w. Drache',nameEn:'Blue-Eyes White Dragon',matchStatus:'mapped'},
      {metacardId:'200',externalCardId:'60764609',nameDe:'Requiem des Unterweltlerschmieds',nameEn:"Fiendsmith's Requiem",matchStatus:'mapped'}
    ],
    aliases:[
      {metacardId:'100',language:'de',alias:'Blauäugiger weißer Drache'},
      {metacardId:'100',language:'en',alias:'Blue Eyes White Dragon'},
      {metacardId:'200',language:'en',alias:'Fiendsmith’s Requiem'}
    ],
    status:{englishNameCount:2,germanNameCount:2,mappedMetacardCount:2,germanMetacardCount:2,aliasCount:3}
  });

  for (const query of ['blue eyes whi','BLUEEYES', 'blueeyes dragon', 'blauaugiger dra', 'weißer drache']) {
    const result = database.searchCards({query});
    assert.equal(result.cards[0].metacardId, '100', query);
    assert.deepEqual(result.cards[0].variants.map(row => row.productId), ['700001','700002','700003'], query);
  }

  const apostropheResult = database.searchCards({query:'fiendsmiths req'});
  assert.equal(apostropheResult.cards[0].metacardId, '200');
  assert.deepEqual(apostropheResult.cards[0].variants.map(row => row.productId), ['800001']);
  assert.equal(database.searchCards({query:'Blauäugiger weißer Drache'}).cards[0].rank, 0);
  const exactSetResult = database.searchCards({query:'TST1-EN001'});
  assert.deepEqual(exactSetResult.cards.flatMap(card => card.variants).map(row => row.productId), ['700001']);

  database.upsertProducts(variants.map(row => ({...row,germanName:''})));
  const storedNames = database.getCardNamesForProducts({productIds:['700001']});
  assert.equal(storedNames[0].germanName, 'Blauäugiger w. Drache');
  assert.equal(storedNames[0].englishName, 'Blue-Eyes White Dragon');

  const backup = database.getCardNameBackup();
  assert.equal(backup.mappings.length, 2);
  assert.equal(backup.aliases.length, 3);
  assert.equal(backup.status.sourceRevision, 'revision-1');

  database.clearMarketData();
  database.upsertProducts(variants);
  database.upsertCardNames({
    mappings:backup.mappings,
    aliases:backup.aliases,
    status:backup.status,
    source:backup.status.source,
    sourceRevision:backup.status.sourceRevision,
    replaceAliases:true
  });
  assert.equal(database.searchCards({query:'blauaugiger'}).cards[0].variants.length, 3);
});

test('liefert auch bei einer realen Karte mit mehr als 80 Drucken jede Cardmarket-Produkt-ID', t => {
  const database = temporaryDatabase(t);
  const catalogPath = path.join(__dirname, '..', 'resources', 'Cardmarket_Testdaten', 'products_singles_3.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const rawVariants = (catalog.products || catalog).filter(row => String(row.idMetacard) === '102062');
  assert.ok(rawVariants.length > 80, 'Die Testkarte muss die früheren UI-Grenzen überschreiten.');

  database.upsertProducts(rawVariants.map(row => ({
    productId:String(row.idProduct),
    metacardId:String(row.idMetacard),
    expansionId:String(row.idExpansion || ''),
    categoryId:Number(row.idCategory || 0),
    officialName:String(row.name || ''),
    officialBaseName:'Blue-Eyes White Dragon'
  })));
  database.upsertCardNames({
    source:'real-catalog-test',
    mappings:[{metacardId:'102062',nameDe:'Blauäugiger w. Drache',nameEn:'Blue-Eyes White Dragon'}],
    aliases:[{metacardId:'102062',language:'de',alias:'Blauäugiger weißer Drache'}]
  });

  const englishResult = database.searchCards({query:'blueeyes white'});
  const germanResult = database.searchCards({query:'blauaugiger dra'});
  assert.equal(englishResult.cards[0].variants.length, rawVariants.length);
  assert.equal(germanResult.cards[0].variants.length, rawVariants.length);
  assert.deepEqual(
    new Set(englishResult.cards[0].variants.map(row => row.productId)),
    new Set(rawVariants.map(row => String(row.idProduct)))
  );
});

test('migriert eine bestehende v3-Datenbank verlustfrei und legt vorher eine SQLite-Sicherung an', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tcg-card-migration-'));
  const databasePath = path.join(root, 'legacy.sqlite');
  const backupRoot = path.join(root, 'backups');
  const currentSchema = fs.readFileSync(schemaPath, 'utf8');
  const legacySchema = currentSchema
    .replace("  search_text TEXT NOT NULL DEFAULT '',\n", '')
    .replace("  search_compact TEXT NOT NULL DEFAULT '',\n", '');
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(legacySchema);
  legacy.prepare('INSERT INTO schema_version (version, applied_at) VALUES (3, ?)').run(new Date().toISOString());
  legacy.prepare(`
    INSERT INTO products (
      product_id, metacard_id, name_de, name_en, official_name,
      archived, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run('900001','300','Dunkler Magier','Dark Magician','Dark Magician',new Date().toISOString());
  legacy.close();

  const database = new TcgDatabase({databasePath,schemaPath,backupRoot});
  t.after(() => {
    database.close();
    fs.rmSync(root, {recursive:true,force:true});
  });
  database.open();

  assert.equal(database.getStatus().schemaVersion, 8);
  assert.equal(database.searchCards({query:'dark mag'}).cards[0].variants[0].productId, '900001');
  assert.equal(database.searchCards({query:'dunkler'}).cards[0].variants[0].productId, '900001');
  const migrationRoot = path.join(backupRoot, 'Migrationen');
  const migrationBackups = fs.readdirSync(migrationRoot).filter(name => name.endsWith('.sqlite'));
  assert.equal(migrationBackups.length, 1);
  const preMigrationCopy = new DatabaseSync(path.join(migrationRoot,migrationBackups[0]));
  const backedUpColumns = new Set(preMigrationCopy.prepare('PRAGMA table_info(products)').all().map(row => row.name));
  preMigrationCopy.close();
  assert.equal(backedUpColumns.has('search_text'), false);
  assert.equal(backedUpColumns.has('search_compact'), false);
});
