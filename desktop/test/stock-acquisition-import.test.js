const test = require('node:test');
const assert = require('node:assert/strict');

const automation = require('../app/shared/business-automation');

function row(overrides = {}) {
  return {
    productId: '100', name: 'Testkarte', collectorNumber: 'TEST-DE001', rarity: 'Ultra Rare',
    language: 'DE', condition: 'NM', edition: '1st Edition', quantity: 1,
    listingPrice: 10, ...overrides
  };
}

function asset(id, overrides = {}) {
  return {
    id, productId: '100', name: 'Testkarte', language: 'DE', condition: 'NM',
    edition: '1st Edition', status: 'Im Bestand', cost: 4, costStatus: 'known', ...overrides
  };
}

test('eine komplett neue Karte wird vollständig als Neuzugang erkannt', () => {
  const preview = automation.buildStockAcquisitionPreview([row()], [], 8);
  assert.equal(preview.changedRows.length, 1);
  assert.equal(preview.changedRows[0].oldQuantity, 0);
  assert.equal(preview.changedRows[0].newQuantity, 1);
  assert.equal(preview.canApply, true);
});

test('bei erhöhter Menge gehören nur die zusätzlichen Exemplare zum Ankauf', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ quantity: 5 })], [asset('old-1'), asset('old-2')], 15);
  assert.equal(preview.changedRows[0].oldQuantity, 2);
  assert.equal(preview.changedRows[0].csvQuantity, 5);
  assert.equal(preview.changedRows[0].newQuantity, 3);
  assert.equal(preview.deltaQuantity, 3);
});

test('eine unveränderte Menge erzeugt keine Ankauf-Zuordnung', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ quantity: 2 })], [asset('old-1'), asset('old-2')], 10);
  assert.equal(preview.deltaQuantity, 0);
  assert.equal(preview.canApply, false);
  assert.match(preview.errors[0], /keine neuen Exemplare/i);
});

test('mehrere neue Exemplare werden einzeln mit dem neuen Ankauf verknüpft', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ quantity: 4 })], [asset('old')], 9);
  const inventory = [asset('old'), asset('new-1'), asset('new-2'), asset('new-3')];
  const applied = automation.applyStockAcquisitionPreview(preview, inventory, null, {
    createdIds: ['new-1', 'new-2', 'new-3'], purchaseId: 'purchase-1', orderNo: 'ANKAUF-1',
    title: 'Testankauf', date: '2026-09-21', importKey: 'stock-1'
  });
  assert.equal(applied.assignedIds.length, 3);
  assert.equal(applied.inventory.find(item => item.id === 'old').purchaseId, undefined);
  assert.ok(applied.inventory.filter(item => item.purchaseId === 'purchase-1').every(item => item.costStatus === 'known'));
});

test('unterschiedliche Prints derselben Karte bleiben getrennte Delta-Positionen', () => {
  const preview = automation.buildStockAcquisitionPreview([
    row({ productId: '100', quantity: 2 }),
    row({ productId: '200', collectorNumber: 'OTHER-DE001', quantity: 1 })
  ], [asset('old', { productId: '100' })], 12);
  assert.equal(preview.changedRows.length, 2);
  assert.deepEqual(preview.changedRows.map(item => [item.productId, item.newQuantity]), [['100', 1], ['200', 1]]);
});

test('vorhandener EK wird beim Anwenden niemals überschrieben', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ quantity: 2 })], [asset('old', { cost: 7.35 })], 5);
  const applied = automation.applyStockAcquisitionPreview(preview, [asset('old', { cost: 7.35 }), asset('new', { cost: 0, costStatus: 'unknown' })], null, {
    createdIds: ['new'], purchaseId: 'purchase-1', orderNo: 'ANKAUF-1', title: 'Test', date: '2026-09-21', importKey: 'stock-1'
  });
  assert.equal(applied.inventory.find(item => item.id === 'old').cost, 7.35);
  assert.equal(applied.inventory.find(item => item.id === 'old').purchaseId, undefined);
  assert.equal(applied.inventory.find(item => item.id === 'new').cost, 5);
});

test('EK wird nach erwartetem VK und ersatzweise CSV-Inseratspreis wertgewichtet', () => {
  const preview = automation.buildStockAcquisitionPreview([
    row({ productId: '100', name: 'A', expectedSell: 20, listingPrice: 99 }),
    row({ productId: '200', name: 'B', expectedSell: 0, listingPrice: 30 })
  ], [], 100);
  const byProduct = new Map(preview.changedRows.map(item => [item.productId, item]));
  assert.equal(byProduct.get('100').weightSource, 'Erwarteter VK');
  assert.equal(byProduct.get('100').allocatedCost, 40);
  assert.equal(byProduct.get('200').weightSource, 'CSV-Inseratspreis');
  assert.equal(byProduct.get('200').allocatedCost, 60);
});

test('Cent-Rundung verteilt den Rest auf Exemplare und erhält exakt die Kontrollsumme', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ quantity: 3, listingPrice: 1 })], [], 10);
  assert.deepEqual(preview.changedRows[0].unitCosts.slice().sort((a, b) => a - b), [3.33, 3.33, 3.34]);
  assert.equal(preview.allocatedNewCost, 10);
  assert.equal(preview.assignedTotal, 10);
  assert.equal(preview.canApply, true);
});

test('mehrere Positionen ergeben nach Rundung exakt den eingegebenen Gesamt-EK', () => {
  const preview = automation.buildStockAcquisitionPreview([
    row({ productId: '100', quantity: 2, listingPrice: 0.17 }),
    row({ productId: '200', quantity: 3, listingPrice: 0.29 }),
    row({ productId: '300', quantity: 1, listingPrice: 1.03 })
  ], [], 45);
  const cents = preview.changedRows.flatMap(item => item.unitCosts).reduce((sum, value) => sum + Math.round(value * 100), 0);
  assert.equal(cents, 4500);
  assert.equal(preview.assignedTotal, 45);
});

test('fehlende eindeutige Printdaten werden markiert und nicht automatisch verteilt', () => {
  const preview = automation.buildStockAcquisitionPreview([row({ productId: '' })], [], 5);
  assert.equal(preview.ambiguous.length, 1);
  assert.equal(preview.canApply, false);
  assert.match(preview.ambiguous[0].reason, /keine sichere Print-Zuordnung/);
});

test('Sprache Zustand und Edition gehören zur exakten Delta-Identität', () => {
  const preview = automation.buildStockAcquisitionPreview([
    row({ language: 'DE', condition: 'NM', edition: '1st Edition' }),
    row({ language: 'EN', condition: 'NM', edition: '1st Edition' }),
    row({ language: 'DE', condition: 'EX', edition: '1st Edition' }),
    row({ language: 'DE', condition: 'NM', edition: 'Unlimited' })
  ], [asset('old', { language: 'DE', condition: 'NM', edition: '1st Edition' })], 12);
  assert.equal(preview.deltaQuantity, 3);
  assert.equal(preview.rows.length, 4);
});

test('ein bestehender Ankauf erhält nur den verbleibenden EK ohne alte Karten zu verändern', () => {
  const preview = automation.buildStockAcquisitionPreview([row()], [], 45, { previousPurchaseCost: 30 });
  const purchase = { id: 'purchase-1', orderNo: 'ALT', cardValue: 30, pendingItems: [{ receiptLineKey: 'old-line', quantity: 1, unitPrice: 30, receivedBusiness: 1, materializedBusiness: 1 }], status: 'Eingetroffen' };
  const applied = automation.applyStockAcquisitionPreview(preview, [asset('new', { cost: 0, costStatus: 'unknown' })], purchase, {
    createdIds: ['new'], date: '2026-09-21', importKey: 'stock-2'
  });
  assert.equal(preview.allocatedNewCost, 15);
  assert.equal(applied.purchase.cardValue, 45);
  assert.equal(applied.purchase.pendingItems[0].unitPrice, 30);
  assert.equal(applied.inventory[0].cost, 15);
});

test('fehlende Bestellkarten werden gemeinsam mit dem CSV-Delta wertgewichtet', () => {
  const preview = automation.buildStockAcquisitionPreview(
    [row({ productId: '100', name: 'Verfügbar', listingPrice: 30 })],
    [],
    100,
    { reservedRows: [{
      productId: '200', name: 'Bereits bestellt', language: 'DE', condition: 'NM', edition: '1st Edition',
      quantity: 1, unitPrice: 20, saleId: 'sale-1', saleOrderNo: '123456', saleLineIndex: 0
    }] }
  );
  assert.equal(preview.stockDeltaQuantity, 1);
  assert.equal(preview.reservedQuantity, 1);
  assert.equal(preview.deltaQuantity, 2);
  const byName = new Map(preview.changedRows.map(item => [item.name, item]));
  assert.equal(byName.get('Verfügbar').allocatedCost, 60);
  assert.equal(byName.get('Bereits bestellt').allocatedCost, 40);
  assert.equal(preview.assignedTotal, 100);
  assert.equal(preview.canApply, true);
});

test('Anwenden legt eine fehlende Bestellkarte mit EK und Verkaufsverknüpfung an', () => {
  const preview = automation.buildStockAcquisitionPreview([], [], 7.35, { reservedRows: [{
    productId: '200', name: 'Bereits bestellt', set: 'TEST', collectorNumber: 'TEST-DE002', rarity: 'Rare',
    language: 'DE', condition: 'NM', edition: '1st Edition', quantity: 1, unitPrice: 10,
    saleId: 'sale-1', saleOrderNo: '123456', saleLineIndex: 0
  }] });
  let sequence = 0;
  const applied = automation.applyStockAcquisitionPreview(preview, [], null, {
    purchaseId: 'purchase-1', orderNo: 'ANKAUF-1', title: 'Neuer Ankauf', date: '2026-09-21',
    importKey: 'stock-1', makeId: () => `reserved-${++sequence}`
  });
  assert.equal(applied.inventory.length, 1);
  assert.equal(applied.inventory[0].id, 'reserved-1');
  assert.equal(applied.inventory[0].cost, 7.35);
  assert.equal(applied.inventory[0].purchaseId, 'purchase-1');
  assert.equal(applied.inventory[0].source, 'Cardmarket-Verkaufsimport');
  assert.equal(applied.inventory[0].status, 'Im Bestand');
  assert.deepEqual(applied.saleAssignments, [{ saleId: 'sale-1', saleOrderNo: '123456', saleLineIndex: 0, assetIds: ['reserved-1'] }]);
  assert.deepEqual(applied.saleCreatedIds, ['reserved-1']);
});

test('Bestellkarte ohne sichere Printdaten blockiert die automatische Übernahme', () => {
  const preview = automation.buildStockAcquisitionPreview([], [], 5, { reservedRows: [{
    productId: '', name: 'Unklar', language: 'DE', condition: 'NM', quantity: 1, unitPrice: 5,
    saleId: 'sale-1', saleOrderNo: '123456', saleLineIndex: 0
  }] });
  assert.equal(preview.ambiguous.length, 1);
  assert.equal(preview.canApply, false);
  assert.match(preview.ambiguous[0].reason, /nicht sicher angelegt/);
});

test('Positionen können vor dem Import aus dem Ankauf entfernt und wiedererkannt werden', () => {
  const reserved = {
    productId: '200', name: 'Nicht dieser Ankauf', language: 'DE', condition: 'NM', edition: '1st Edition',
    quantity: 1, unitPrice: 20, saleId: 'sale-1', saleOrderNo: '123456', saleLineIndex: 0,
    sourceKey: 'sale:sale-1:0'
  };
  const preview = automation.buildStockAcquisitionPreview([row({ listingPrice: 10 })], [], 10, {
    reservedRows: [reserved], excludedSourceKeys: ['sale:sale-1:0']
  });
  assert.equal(preview.stockDeltaQuantity, 1);
  assert.equal(preview.reservedQuantity, 0);
  assert.equal(preview.excludedQuantity, 1);
  assert.equal(preview.rows.find(item => item.sourceKey === 'sale:sale-1:0').excluded, true);
  assert.equal(preview.canApply, true);
  assert.equal(preview.assignedTotal, 10);
});
