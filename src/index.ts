// Add at the top of src/index.ts (Line 1):
declare const process: any;
import { createServer, Tool, z } from '@nitrostack/core';
<<<<<<< HEAD
import {
  checkMachineHealthLogic, checkMachineHealthSchema,
  predictFailureLogic, predictFailureSchema,
  scheduleMaintenanceLogic, scheduleMaintenanceSchema
} from './maintenance.tools.js';
import {
  checkComplianceEventLogic, checkComplianceEventSchema,
  escalateIncidentLogic, escalateIncidentSchema
} from './safety.tools.js';
=======
import { inspectBatchTool, flagDefectTool, rootCauseAnalysisTool } from './quality-tools.js';
>>>>>>> e941ac10e0ff2c32ba40599d1d2e2773e721e575

const server = createServer({
  name: 'Final_Semicolon_Squad',
  version: '1.0.0',
  description: 'Factory Mind',
});

// Hello Tool (Default)
server.tool(
  new Tool({
    name: 'hello',
    description: 'Say hello to someone',
    inputSchema: z.object({
      name: z.string().describe('The name to greet'),
<<<<<<< HEAD
    }) as any,
    handler: async (input: any, context: any) => {
      context?.logger?.info?.(`Greeting ${input.name}`);
=======
    }),
    handler: async (input: { name: string }, context) => {
      context.logger.info(`Greeting ${input.name}`);
>>>>>>> e941ac10e0ff2c32ba40599d1d2e2773e721e575
      return `Hello, ${input.name}! 👋`;
    },
  })
);

<<<<<<< HEAD
// PERSON B: MAINTENANCE TOOLS
server.tool(
  new Tool({
    name: 'checkMachineHealth',
    description: 'Query real-time health telemetry for factory machines.',
    inputSchema: checkMachineHealthSchema as any,
    handler: async (input: any) => {
      return await checkMachineHealthLogic(input);
    },
  })
);

server.tool(
  new Tool({
    name: 'predictFailure',
    description: 'Analyze telemetry to predict machine failure probabilities.',
    inputSchema: predictFailureSchema as any,
    handler: async (input: any) => {
      return await predictFailureLogic(input);
    },
  })
);

server.tool(
  new Tool({
    name: 'scheduleMaintenance',
    description: 'Generate an official work order to schedule maintenance.',
    inputSchema: scheduleMaintenanceSchema as any,
    handler: async (input: any) => {
      return await scheduleMaintenanceLogic(input);
    },
  })
);

// PERSON B: SAFETY TOOLS
server.tool(
  new Tool({
    name: 'checkComplianceEvent',
    description: 'Inspect plant safety compliance events and zone hazard logs.',
    inputSchema: checkComplianceEventSchema as any,
    handler: async (input: any) => {
      return await checkComplianceEventLogic(input);
    },
  })
);

server.tool(
  new Tool({
    name: 'escalateIncident',
    description: 'Escalate emergency safety incidents and command shutdowns.',
    inputSchema: escalateIncidentSchema as any,
    handler: async (input: any) => {
      return await escalateIncidentLogic(input);
    },
  })
);
=======
server.tool(inspectBatchTool);
server.tool(flagDefectTool);
server.tool(rootCauseAnalysisTool);
>>>>>>> e941ac10e0ff2c32ba40599d1d2e2773e721e575

server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});