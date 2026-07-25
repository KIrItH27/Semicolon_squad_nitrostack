import {
  ControllerDecorator as Controller,
  PromptDecorator as Prompt,
  ExecutionContext
} from '@nitrostack/core';

@Controller()
export class OrchestratorController {
  @Prompt({
    name: 'run_factory_supervisor',
    description: 'Master orchestrator for inventory checks, procurement, and ordering.',
    arguments: [
      { name: 'itemName', description: 'The item to evaluate', required: true }
    ],
  })
  async getSupervisorPrompt(args: Record<string, any>, ctx: ExecutionContext) {
    const itemName = args.itemName;
    return [
      {
        role: 'user' as const,
        content: `You are the Master Orchestrator Agent. Evaluate our inventory for: ${itemName}.

STEP 1: INVENTORY CHECK
- Call 'check_stock' to find current quantity of ${itemName}.
- If quantity is 5 or greater: Output "Stock levels are optimal." and stop.
- If quantity is less than 5: Proceed to Step 2.

STEP 2: PROCUREMENT ANALYSIS
- Call 'find_supplier' to search the catalog for ${itemName}.
- Select the most cost-effective supplier.

STEP 3: EXECUTE ORDER
- Calculate the amount needed to bring stock up to 10.
- Call 'place_order' using the supplier, item name, quantity, and total cost.

STEP 4: FINAL REPORT
- Output an invoice summarizing starting stock, supplier, quantity ordered, and cost.`
      }
    ];
  }
}