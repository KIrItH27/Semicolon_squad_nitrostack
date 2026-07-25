import { defineResource } from './define-resource.js';

export const maintenanceSlaResource = defineResource({
  uri: 'governance://maintenance-and-equipment-sla',
  name: 'maintenanceSlaPolicy',
  description: 'Factory floor maintenance SLAs, telemetry risk matrix, and emergency escalation rules.',
  async load() {
    return {
      text: JSON.stringify(
        {
          policyName: "Plant Equipment Reliability & Failure Response Standard",
          failureRiskMatrix: [
            { probability: "> 0.85", severity: "CRITICAL", requiredAction: "Immediate line pause + Emergency PO dispatch" },
            { probability: "0.50 - 0.85", severity: "HIGH", requiredAction: "Schedule maintenance within 24h + Reserve spare parts" },
            { probability: "< 0.50", severity: "MODERATE", requiredAction: "Log for weekly routine inspection" }
          ],
          targetDowntimeHourlyCostUSD: 5000.0
        },
        null,
        2
      )
    };
  }
});
