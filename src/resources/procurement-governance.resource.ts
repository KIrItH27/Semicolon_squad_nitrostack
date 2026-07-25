import { defineResource } from './define-resource.js';

export const procurementGovernanceResource = defineResource({
  uri: 'governance://procurement-and-budget-policy',
  name: 'procurementGovernancePolicy',
  description: 'Official plant governance rules for purchase order limits, authorization tiers, and preferred vendor priorities.',
  async load() {
    return {
      text: JSON.stringify(
        {
          policyName: "NitroStack Plant Operations Procurement & Governance Standard",
          version: "2026.2",
          effectiveDate: "2026-01-01",
          approvalTiersUSD: [
            { tier: "AUTOMATED", min: 0, max: 10000, requiredRole: "Autonomous Agent" },
            { tier: "SUPERVISOR", min: 10000.01, max: 50000, requiredRole: "Plant Operations Supervisor" },
            { tier: "EXECUTIVE", min: 50000.01, max: Infinity, requiredRole: "Executive Director" }
          ],
          vendorRules: {
            preferredVendors: ["VEND-APEX", "VEND-ROBO-01", "VEND-SENSOTECH"],
            leadTimeThresholdDaysForEmergency: 5,
            moqPolicy: "Enforce strict MOQ adjustment; notify user if order volume is auto-increased."
          },
          budgetProtection: {
            hardStopOnOverrun: true,
            bufferReservationUSD: 12000.0
          }
        },
        null,
        2
      )
    };
  }
});
