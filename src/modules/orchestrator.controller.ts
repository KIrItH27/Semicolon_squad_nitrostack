import {
  ControllerDecorator as Controller,
  PromptDecorator as Prompt,
  ExecutionContext
} from '@nitrostack/core';

@Controller()
export class OrchestratorController {
  @Prompt({
    name: 'run_factory_supervisor',
    description: 'Master orchestrator prompt for evaluating inventory, procurement, machinery health, and safety protocols.',
    arguments: [
      { name: 'itemName', description: 'The inventory item to evaluate', required: false },
      { name: 'machineId', description: 'The machine ID to evaluate', required: false },
      { name: 'zoneId', description: 'The safety zone ID to audit', required: false },
    ],
  })
  async getSupervisorPrompt(args: Record<string, any>, ctx: ExecutionContext) {
    const itemName = args.itemName || 'Milk';
    const machineId = args.machineId || 'MCH-212';
    const zoneId = args.zoneId || 'ZONE-C-WELDING';

    return [
      {
        role: 'user' as const,
        content: `You are the FactoryMind Master Orchestrator Agent supervising Inventory, Procurement, Plant Maintenance, and Safety Compliance.

=== PHASE 1: INVENTORY & PROCUREMENT ORCHESTRATION ===
- Target Item: ${itemName}
1. Call 'check_stock' to evaluate current stock level of ${itemName}.
2. If stock is below 5 units, call 'find_supplier' to search available options.
3. Select the best supplier and call 'place_order' to restock up to 10 units.

=== PHASE 2: MACHINERY HEALTH & DISPATCH ORCHESTRATION ===
- Target Machine: ${machineId}
1. Call 'check_machine_health' or 'checkMachineHealth' for ${machineId}.
2. Call 'predict_failure' or 'predictFailure' for ${machineId}.
3. If health score is low (< 50) or failure risk is high, call 'schedule_maintenance' or 'scheduleMaintenance' to dispatch an emergency work order email.

=== PHASE 3: SAFETY & COMPLIANCE ORCHESTRATION ===
- Target Zone: ${zoneId}
1. Call 'check_compliance_event' or 'checkComplianceEvent' for ${zoneId}.
2. If critical hazards are detected, call 'escalate_incident' or 'escalateIncident' to activate emergency response protocols.

=== FINAL EXECUTIVE REPORT ===
Output a consolidated operational report summarizing Inventory Status, Maintenance Actions Dispatched, and Safety Audit Results.`
      }
    ];
  }
}