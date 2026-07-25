import { supabase } from '../db/supabase.js';
import { z } from '@nitrostack/core';
import { defineTool } from './define-tool.js';

export interface BudgetState {
  department: string;
  monthlyBudgetUSD: number;
  spentToDateUSD: number;
  committedSpendUSD: number;
  remainingBudgetUSD: number;
  fiscalMonth: string;
  approvalThresholds: {
    autoApprovalLimitUSD: number;
    supervisorApprovalLimitUSD: number;
  };
}

/**
 * Mock Financial State Store for Plant Operations
 */
const plantBudget: BudgetState = {
  department: 'Plant Operations & Supply Chain',
  monthlyBudgetUSD: 150000.0,
  spentToDateUSD: 68400.0,
  committedSpendUSD: 24500.0,
  remainingBudgetUSD: 57100.0, // 150000 - 68400 - 24500
  fiscalMonth: 'July 2026',
  approvalThresholds: {
    autoApprovalLimitUSD: 10000.0,
    supervisorApprovalLimitUSD: 50000.0,
  },
};

/**
 * evaluatePurchaseOrder
 * Inputs: poId: string, totalAmount: number. Checks budget limits, ROI impact, updates Supabase purchase_orders approval_status, and returns justification.
 */
export const evaluatePurchaseOrder = defineTool({
  name: 'evaluatePurchaseOrder',
  description: 'Evaluates a Purchase Order against departmental budget limits, financial authorization thresholds, and ROI impact, updating Supabase approval_status and returning justification.',
  parameters: z.object({
    poId: z.string().describe('Purchase Order ID or part_id in Supabase to evaluate (e.g., "PO-2026-9002")'),
    totalAmount: z.number().positive().describe('Total monetary amount of the purchase order in USD'),
  }),
  execute: async ({ poId, totalAmount }: { poId: string; totalAmount: number }) => {
    const remaining = plantBudget.remainingBudgetUSD;
    let status: 'APPROVED' | 'REQUIRES_SUPERVISOR_APPROVAL' | 'REJECTED';
    let justification: string;

    // Estimate downtime prevention ROI ($5,000 / hr downtime saved by timely parts)
    const estimatedDowntimeHoursSaved = Number((totalAmount / 800).toFixed(1));
    const estimatedSavingsUSD = Math.round(estimatedDowntimeHoursSaved * 5000);
    const estimatedNetROIUSD = estimatedSavingsUSD - totalAmount;

    if (totalAmount > remaining) {
      status = 'REJECTED';
      justification = `Purchase Order ${poId} for $${totalAmount.toLocaleString()} exceeds the remaining departmental budget ($${remaining.toLocaleString()}). Request rejected to prevent budget overrun.`;
    } else if (totalAmount <= plantBudget.approvalThresholds.autoApprovalLimitUSD) {
      status = 'APPROVED';
      justification = `Purchase Order ${poId} for $${totalAmount.toLocaleString()} is within automated approval threshold ($${plantBudget.approvalThresholds.autoApprovalLimitUSD.toLocaleString()}) and within remaining budget ($${remaining.toLocaleString()}). Approved for immediate dispatch.`;

      // Update remaining budget state for mock
      plantBudget.committedSpendUSD += totalAmount;
      plantBudget.remainingBudgetUSD -= totalAmount;
    } else if (totalAmount <= plantBudget.approvalThresholds.supervisorApprovalLimitUSD) {
      status = 'REQUIRES_SUPERVISOR_APPROVAL';
      justification = `Purchase Order ${poId} for $${totalAmount.toLocaleString()} exceeds auto-approval limit ($${plantBudget.approvalThresholds.autoApprovalLimitUSD.toLocaleString()}) but is within supervisor delegation authority ($${plantBudget.approvalThresholds.supervisorApprovalLimitUSD.toLocaleString()}). Escalate to Plant Supervisor.`;
    } else {
      status = 'REJECTED';
      justification = `Purchase Order ${poId} for $${totalAmount.toLocaleString()} exceeds maximum single-transaction authorization limit ($${plantBudget.approvalThresholds.supervisorApprovalLimitUSD.toLocaleString()}). Executive Director review required.`;
    }

    // Attempt to update Supabase purchase_orders table using exact DB column names (approval_status, approved_at)
    const approvedAt = status === 'APPROVED' ? new Date().toISOString() : null;
    const { error: dbUpdateError } = await supabase
      .from('purchase_orders')
      .update({
        approval_status: status,
        approved_at: approvedAt,
      })
      .eq('part_id', poId.toUpperCase());

    if (dbUpdateError) {
      console.warn(`Note: Could not update Supabase PO status for ${poId}: ${dbUpdateError.message}`);
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      evaluation: {
        poId,
        totalAmountUSD: totalAmount,
        status,
        financialJustification: justification,
        budgetImpact: {
          remainingBudgetBeforeUSD: remaining,
          remainingBudgetAfterUSD: status === 'APPROVED' ? plantBudget.remainingBudgetUSD : remaining,
          monthlyBudgetTotalUSD: plantBudget.monthlyBudgetUSD,
          percentOfBudgetConsumed: Number((((plantBudget.spentToDateUSD + plantBudget.committedSpendUSD) / plantBudget.monthlyBudgetUSD) * 100).toFixed(1)),
        },
        roiAnalysis: {
          estimatedDowntimeHoursPrevented: estimatedDowntimeHoursSaved,
          projectedDowntimeLossesAvoidedUSD: estimatedSavingsUSD,
          netROIImpactUSD: estimatedNetROIUSD,
          paybackRatio: Number((estimatedSavingsUSD / Math.max(1, totalAmount)).toFixed(2)),
        },
      },
    };
  },
});


/**
 * getMonthlyBudgetForecast
 * Returns remaining departmental budget and spend metrics.
 */
export const getMonthlyBudgetForecast = defineTool({
  name: 'getMonthlyBudgetForecast',
  description: 'Returns real-time departmental budget forecasts, remaining budget reserves, committed purchase orders, and breakdown of operational spend metrics.',
  parameters: z.object({
    department: z
      .string()
      .optional()
      .default('Plant Operations & Supply Chain')
      .describe('Department name to fetch financial budget metrics for.'),
  }),
  execute: async ({ department }: { department?: string }) => {
    const projectedEndOfMonthSpend = plantBudget.spentToDateUSD + plantBudget.committedSpendUSD + 12000.0;
    const varianceUSD = plantBudget.monthlyBudgetUSD - projectedEndOfMonthSpend;
    const variancePercentage = Number(((varianceUSD / plantBudget.monthlyBudgetUSD) * 100).toFixed(1));

    return {
      success: true,
      timestamp: new Date().toISOString(),
      fiscalPeriod: plantBudget.fiscalMonth,
      department: department || plantBudget.department,
      financialOverview: {
        monthlyBudgetUSD: plantBudget.monthlyBudgetUSD,
        spentToDateUSD: plantBudget.spentToDateUSD,
        committedSpendUSD: plantBudget.committedSpendUSD,
        remainingBudgetUSD: plantBudget.remainingBudgetUSD,
        projectedEndOfMonthSpendUSD: projectedEndOfMonthSpend,
        forecastVarianceUSD: varianceUSD,
        forecastVariancePercentage: variancePercentage,
        budgetHealthStatus: varianceUSD >= 0 ? 'HEALTHY' : 'OVER_BUDGET_WARNING',
      },
      spendBreakdownByCategory: [
        { category: 'Critical Spare Parts', spentUSD: 34500.0, percentageOfTotal: 50.4 },
        { category: 'Preventative Maintenance Servicing', spentUSD: 18200.0, percentageOfTotal: 26.6 },
        { category: 'Emergency Freight & Expedited Shipping', spentUSD: 8700.0, percentageOfTotal: 12.7 },
        { category: 'Consumables & Lubricants', spentUSD: 7000.0, percentageOfTotal: 10.3 },
      ],
      spendMetrics: {
        averagePurchaseOrderValueUSD: 4250.0,
        activePendingPurchaseOrdersCount: 3,
        autoApprovalSuccessRatePercentage: 88.5,
      },
    };
  },
});
