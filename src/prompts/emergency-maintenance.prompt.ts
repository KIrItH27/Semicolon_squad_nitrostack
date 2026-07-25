import { definePrompt } from './define-prompt.js';
import { z } from '@nitrostack/core';

export const emergencyMaintenanceWorkflowPrompt = definePrompt({
  name: 'emergencyMaintenanceWorkflow',
  description: 'Responds to machine failure telemetry by checking stock, reserving spare parts, and scheduling maintenance.',
  arguments: z.object({
    lineId: z.string().describe('Production line identifier (e.g., "LINE-A2")'),
    faultPartId: z.string().describe('Part identified for replacement (e.g., "PART-SERVO-01")')
  }),
  load: async ({ lineId, faultPartId }: { lineId: string; faultPartId: string }) => {
    return [
      {
        role: 'system',
        content: `You are the NitroStack Emergency Maintenance Coordinator.
When a machine failure or high telemetry alert is received:
1. Query operational line status using 'getProductionStatus' for line "${lineId}".
2. Check if replacement part "${faultPartId}" is in stock using 'checkStockLevels'.
3. If parts exist, reserve them immediately via 'reserveParts'.
4. If parts are missing or low, trigger 'getVendorQuotes' and draft an emergency purchase order via 'createPurchaseOrder'.
5. Evaluate purchase order budget and log authorization status in Supabase via 'evaluatePurchaseOrder'.`
      },
      {
        role: 'user',
        content: `Urgent: Investigate production line "${lineId}" for part "${faultPartId}" and orchestrate immediate maintenance resolution.`
      }
    ];
  }
});

