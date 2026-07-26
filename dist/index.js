"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// @ts-ignore
const core_1 = require("@nitrostack/core");
// @ts-ignore
const maintenance_tools_1 = require("./maintenance.tools");
// @ts-ignore
const safety_tools_1 = require("./safety.tools");
// @ts-ignore
const inventory_controller_1 = require("./modules/inventory.controller");
// @ts-ignore
const procurement_controller_1 = require("./modules/procurement.controller");
// @ts-ignore
const policy_controller_1 = require("./modules/policy.controller");
// @ts-ignore
const orchestrator_controller_1 = require("./modules/orchestrator.controller");
const server = (0, core_1.createServer)({
    name: 'GearMind',
    version: '1.0.0',
    description: 'FactoryMind Multi-Agent Autonomous Plant Operations Platform',
});
// Controllers Instances
const inventoryCtrl = new inventory_controller_1.InventoryController();
const procurementCtrl = new procurement_controller_1.ProcurementController();
const policyCtrl = new policy_controller_1.PolicyController();
const orchestratorCtrl = new orchestrator_controller_1.OrchestratorController();
// ==========================================
// 1. DEFAULT HELLO TOOL
// ==========================================
server.tool(new core_1.Tool({
    name: 'hello',
    description: 'Say hello to someone',
    inputSchema: core_1.z.object({
        name: core_1.z.string().describe('The name to greet'),
    }),
    handler: async (input, context) => {
        context?.logger?.info?.(`Greeting ${input.name}`);
        return `Hello, ${input.name}! 👋`;
    },
}));
// ==========================================
// 2. MAINTENANCE TOOLS (camelCase & snake_case)
// ==========================================
server.tool(new core_1.Tool({
    name: 'checkMachineHealth',
    description: 'Query real-time health telemetry for factory machines.',
    inputSchema: maintenance_tools_1.checkMachineHealthSchema,
    handler: async (input) => await (0, maintenance_tools_1.checkMachineHealthLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'check_machine_health',
    description: 'Checks health status, temperature, and telemetry of plant machinery.',
    inputSchema: maintenance_tools_1.checkMachineHealthSchema,
    handler: async (input) => await (0, maintenance_tools_1.checkMachineHealthLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'predictFailure',
    description: 'Analyze telemetry to predict machine failure probabilities.',
    inputSchema: maintenance_tools_1.predictFailureSchema,
    handler: async (input) => await (0, maintenance_tools_1.predictFailureLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'predict_failure',
    description: 'Predicts failure probability and component risks for plant equipment.',
    inputSchema: maintenance_tools_1.predictFailureSchema,
    handler: async (input) => await (0, maintenance_tools_1.predictFailureLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'scheduleMaintenance',
    description: 'Generate an official work order to schedule maintenance.',
    inputSchema: maintenance_tools_1.scheduleMaintenanceSchema,
    handler: async (input) => await (0, maintenance_tools_1.scheduleMaintenanceLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'schedule_maintenance',
    description: 'Schedules maintenance work orders and dispatches detailed email notifications.',
    inputSchema: maintenance_tools_1.scheduleMaintenanceSchema,
    handler: async (input) => await (0, maintenance_tools_1.scheduleMaintenanceLogic)(input),
}));
// ==========================================
// 3. SAFETY TOOLS (camelCase & snake_case)
// ==========================================
server.tool(new core_1.Tool({
    name: 'checkComplianceEvent',
    description: 'Inspect plant safety compliance events and zone hazard logs.',
    inputSchema: safety_tools_1.checkComplianceEventSchema,
    handler: async (input) => await (0, safety_tools_1.checkComplianceEventLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'check_compliance_event',
    description: 'Checks plant safety compliance and active hazard status across plant zones.',
    inputSchema: safety_tools_1.checkComplianceEventSchema,
    handler: async (input) => await (0, safety_tools_1.checkComplianceEventLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'escalateIncident',
    description: 'Escalate emergency safety incidents and command shutdowns.',
    inputSchema: safety_tools_1.escalateIncidentSchema,
    handler: async (input) => await (0, safety_tools_1.escalateIncidentLogic)(input),
}));
server.tool(new core_1.Tool({
    name: 'escalate_incident',
    description: 'Escalates safety incidents and triggers automated emergency response protocols.',
    inputSchema: safety_tools_1.escalateIncidentSchema,
    handler: async (input) => await (0, safety_tools_1.escalateIncidentLogic)(input),
}));
// ==========================================
// 4. INVENTORY & PROCUREMENT TOOLS
// ==========================================
server.tool(new core_1.Tool({
    name: 'check_stock',
    description: 'Check available inventory stock for a given part or raw material.',
    inputSchema: core_1.z.object({
        partName: core_1.z.string().describe('Name or ID of the part to check.'),
    }),
    handler: async (input, ctx) => await inventoryCtrl.checkStock(input, ctx),
}));
server.tool(new core_1.Tool({
    name: 'find_supplier',
    description: 'Searches the supplier catalog for an item to find prices and delivery times.',
    inputSchema: core_1.z.object({
        itemName: core_1.z.string().describe('The name of the item to search for'),
    }),
    handler: async (input, ctx) => await procurementCtrl.findSupplier(input, ctx),
}));
server.tool(new core_1.Tool({
    name: 'place_order',
    description: 'Places an order for an item, logs it in order history.',
    inputSchema: core_1.z.object({
        supplierName: core_1.z.string(),
        itemName: core_1.z.string(),
        quantity: core_1.z.number(),
        totalCost: core_1.z.number(),
    }),
    handler: async (input, ctx) => await procurementCtrl.placeOrder(input, ctx),
}));
// ==========================================
// 5. RESOURCES & PROMPTS
// ==========================================
server.resource(new core_1.Resource({
    uri: 'memo://manufacturing/inventory-rules',
    name: 'Manufacturing Inventory & Procurement Rules',
    description: 'Defines minimum stock levels and procurement policies for industrial spare parts.',
    mimeType: 'text/plain',
    handler: (async (_uri, ctx) => await policyCtrl.getInventoryRules(ctx)),
}));
server.prompt(new core_1.Prompt({
    name: 'run_factory_supervisor',
    description: 'Master orchestrator prompt for evaluating inventory, procurement, machinery health, and safety protocols.',
    arguments: [
        { name: 'itemName', description: 'The inventory item to evaluate', required: false },
        { name: 'machineId', description: 'The machine ID to evaluate', required: false },
        { name: 'zoneId', description: 'The safety zone ID to audit', required: false },
    ],
    handler: async (args, ctx) => await orchestratorCtrl.getSupervisorPrompt(args, ctx),
}));
// Start Server
server.start().catch((error) => {
    console.error('Failed to start NitroStack server:', error);
});
