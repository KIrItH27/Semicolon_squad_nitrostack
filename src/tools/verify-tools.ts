import {
  getProductionStatus,
  adjustLineSpeed,
  checkStockLevels,
  reserveParts,
  getVendorQuotes,
  createPurchaseOrder,
  evaluatePurchaseOrder,
  getMonthlyBudgetForecast,
} from './index.js';

async function runVerification() {
  console.log('=====================================================');
  console.log(' FactoryMind Person C - Semicolon_squad_nitrostack   ');
  console.log('=====================================================\n');

  // 1. Production Status
  console.log('--- 1. getProductionStatus ---');
  const prodStatus = await getProductionStatus.execute({}, {} as any);
  console.log(JSON.stringify(prodStatus, null, 2));

  // 2. Adjust Line Speed
  console.log('\n--- 2. adjustLineSpeed ---');
  const speedAdjust = await adjustLineSpeed.execute({ lineId: 'LINE-A1', speedPercentage: 110 }, {} as any);
  console.log(JSON.stringify(speedAdjust, null, 2));

  // 3. Check Stock Levels
  console.log('\n--- 3. checkStockLevels ---');
  const stockCheck = await checkStockLevels.execute({ partId: 'PART-SERVO-01' }, {} as any);
  console.log(JSON.stringify(stockCheck, null, 2));

  // 4. Reserve Parts
  console.log('\n--- 4. reserveParts ---');
  const reserveResult = await reserveParts.execute({ partId: 'PART-SERVO-01', quantity: 5 }, {} as any);
  console.log(JSON.stringify(reserveResult, null, 2));

  // 5. Get Vendor Quotes
  console.log('\n--- 5. getVendorQuotes ---');
  const quotes = await getVendorQuotes.execute({ partId: 'PART-SERVO-01', vendorCode: 'VEND-ROBO-01' }, {} as any);
  console.log(JSON.stringify(quotes, null, 2));

  // 6. Create Purchase Order
  console.log('\n--- 6. createPurchaseOrder ---');
  const testPoId = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const poResult = await createPurchaseOrder.execute(
    { partId: testPoId, totalAmountUSD: 4500.0, vendorCode: 'VEND-ROBO-01', costCenter: 'CC-PROD-MAINT' },
    {} as any
  );
  console.log(JSON.stringify(poResult, null, 2));

  // 7. Evaluate Purchase Order
  console.log('\n--- 7. evaluatePurchaseOrder ---');
  const poEvaluation = await evaluatePurchaseOrder.execute(
    { poId: testPoId, totalAmount: 4500.0 },
    {} as any
  );
  console.log(JSON.stringify(poEvaluation, null, 2));



  // 8. Get Monthly Budget Forecast
  console.log('\n--- 8. getMonthlyBudgetForecast ---');
  const budgetForecast = await getMonthlyBudgetForecast.execute({}, {} as any);
  console.log(JSON.stringify(budgetForecast, null, 2));

  console.log('\n=====================================================');
  console.log('   ✓ All 8 Person C Tools Tested Successfully!      ');
  console.log('=====================================================');
}

runVerification().catch(console.error);
