import {
  ControllerDecorator as Controller,
  ToolDecorator as Tool,
  z,
  ExecutionContext,
} from '@nitrostack/core';

// Import individual tools
import { getProductionStatus, adjustLineSpeed } from '../tools/production.tools.js';
import { checkStockLevels, reserveParts } from '../tools/inventory.tools.js';
import { createPurchaseOrder, getVendorQuotes } from '../tools/procurement.tools.js';
import { evaluatePurchaseOrder, getMonthlyBudgetForecast } from '../tools/cost-analysis.tools.js';

@Controller()
export class PersonCController {
  @Tool({
    name: 'getProductionStatus',
    description: 'Returns real-time operational status for plant production lines.',
    inputSchema: z.object({
      lineId: z.string().optional().describe('Optional production line ID'),
    }),
  })
  async getProductionStatus(input: { lineId?: string }, ctx: ExecutionContext) {
    return await getProductionStatus.execute(input, ctx);
  }

  @Tool({
    name: 'adjustLineSpeed',
    description: 'Adjusts operational speed percentage of a specified production line in Supabase.',
    inputSchema: z.object({
      lineId: z.string().describe('ID of production line to adjust'),
      speedPercentage: z.number().min(0).max(150).describe('Target speed percentage'),
    }),
  })
  async adjustLineSpeed(input: { lineId: string; speedPercentage: number }, ctx: ExecutionContext) {
    return await adjustLineSpeed.execute(input, ctx);
  }

  @Tool({
    name: 'checkStockLevels',
    description: 'Checks current stock levels, available vs allocated quantities, reorder thresholds.',
    inputSchema: z.object({
      partId: z.string().optional().describe('Optional part ID'),
    }),
  })
  async checkStockLevels(input: { partId?: string }, ctx: ExecutionContext) {
    return await checkStockLevels.execute(input, ctx);
  }

  @Tool({
    name: 'reserveParts',
    description: 'Reserves inventory parts for an upcoming production run.',
    inputSchema: z.object({
      partId: z.string().describe('ID of part to reserve'),
      quantity: z.number().int().positive().describe('Quantity to allocate'),
    }),
  })
  async reserveParts(input: { partId: string; quantity: number }, ctx: ExecutionContext) {
    return await reserveParts.execute(input, ctx);
  }

  @Tool({
    name: 'getVendorQuotes',
    description: 'Fetches supplier quotes and pricing from Supabase.',
    inputSchema: z.object({
      partId: z.string().describe('ID of part to request quotes for'),
      vendorCode: z.string().optional().describe('Optional vendor code'),
    }),
  })
  async getVendorQuotes(input: { partId: string; vendorCode?: string }, ctx: ExecutionContext) {
    return await getVendorQuotes.execute(input, ctx);
  }

  @Tool({
    name: 'createPurchaseOrder',
    description: 'Generates a draft purchase order in Supabase.',
    inputSchema: z.object({
      partId: z.string().describe('ID of part or PO identifier'),
      totalAmountUSD: z.number().positive().describe('Total monetary value'),
      vendorCode: z.string().optional().describe('Vendor code'),
      costCenter: z.string().optional().describe('Cost center'),
    }),
  })
  async createPurchaseOrder(
    input: { partId: string; totalAmountUSD: number; vendorCode?: string; costCenter?: string },
    ctx: ExecutionContext
  ) {
    return await createPurchaseOrder.execute(input, ctx);
  }

  @Tool({
    name: 'evaluatePurchaseOrder',
    description: 'Evaluates PO budget limits and ROI impact, updating Supabase approval_status.',
    inputSchema: z.object({
      poId: z.string().describe('Purchase Order ID or part_id in Supabase'),
      totalAmount: z.number().positive().describe('Total amount in USD'),
    }),
  })
  async evaluatePurchaseOrder(input: { poId: string; totalAmount: number }, ctx: ExecutionContext) {
    return await evaluatePurchaseOrder.execute(input, ctx);
  }

  @Tool({
    name: 'getMonthlyBudgetForecast',
    description: 'Returns real-time departmental budget forecasts and remaining reserves.',
    inputSchema: z.object({
      department: z.string().optional().describe('Department name'),
    }),
  })
  async getMonthlyBudgetForecast(input: { department?: string }, ctx: ExecutionContext) {
    return await getMonthlyBudgetForecast.execute(input, ctx);
  }
}