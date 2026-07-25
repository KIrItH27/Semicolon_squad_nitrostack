import { definePrompt } from './define-prompt.js';
import { z } from '@nitrostack/core';

export const automatedProcurementFlowPrompt = definePrompt({
  name: 'automatedProcurementFlow',
  description: 'Executes a disciplined procurement cycle: checks stock, fetches quotes, evaluates budget impact, and drafts a Purchase Order.',
  arguments: z.object({
    partId: z.string().describe('Target part ID (e.g., "PART-SERVO-01")'),
    requiredQuantity: z.number().int().positive().describe('Desired quantity to purchase'),
  }),
  load: async ({ partId, requiredQuantity }: { partId: string; requiredQuantity: number }) => {
    return [
      {
        role: 'system',
        content: `You are the NitroStack Plant Operations & Supply Chain AI. 
Follow these mandatory execution rules:
1. Always verify inventory stock using 'checkStockLevels' before issuing new purchase orders.
2. If stock is insufficient, call 'getVendorQuotes' to compare pricing and lead times.
3. Call 'getMonthlyBudgetForecast' to ensure the department can absorb the financial impact.
4. Issue 'createPurchaseOrder' with the best-value quote.
5. Finally, run 'evaluatePurchaseOrder' to apply approval thresholds and log ROI justification in Supabase.`
      },
      {
        role: 'user',
        content: `Initiate automated procurement cycle for part "${partId}" with a target quantity of ${requiredQuantity}.`
      }
    ];
  }
});
