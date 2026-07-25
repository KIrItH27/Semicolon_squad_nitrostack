import { supabase } from '../db/supabase.js';
import { getProductionStatus, adjustLineSpeed } from './production.tools.js';
import { checkStockLevels, reserveParts } from './inventory.tools.js';
import { createPurchaseOrder, getVendorQuotes } from './procurement.tools.js';
import { evaluatePurchaseOrder, getMonthlyBudgetForecast } from './cost-analysis.tools.js';

// Re-export individual tool modules
export * from './production.tools.js';
export * from './inventory.tools.js';
export * from './procurement.tools.js';
export * from './cost-analysis.tools.js';

/**
 * personCTools
 * Exported array containing all 8 NitroStack tools built for Person C (Supply Chain & Operations Chain)
 * Ready to be imported directly by Person A into server initialization:
 *
 * import { personCTools } from './tools/index.js';
 */
export const personCTools = [
  // Production Tools
  getProductionStatus,
  adjustLineSpeed,

  // Inventory Tools
  checkStockLevels,
  reserveParts,

  // Procurement Tools
  createPurchaseOrder,
  getVendorQuotes,

  // Cost Analysis Tools
  evaluatePurchaseOrder,
  getMonthlyBudgetForecast,
];

export default personCTools;
