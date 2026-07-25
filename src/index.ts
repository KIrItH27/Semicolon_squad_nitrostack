import { createServer, Tool, z } from '@nitrostack/core';
import { inspectBatchTool, flagDefectTool, rootCauseAnalysisTool } from './quality-tools.js';

const server = createServer({
  name: 'Final_Semicolon_Squad',
  version: '1.0.0',
  description: 'Factory Mind',
});

server.tool(
  new Tool({
    name: 'hello',
    description: 'Say hello to someone',
    inputSchema: z.object({
      name: z.string().describe('The name to greet'),
    }),
    handler: async (input: { name: string }, context) => {
      context.logger.info(`Greeting ${input.name}`);
      return `Hello, ${input.name}! 👋`;
    },
  })
);

server.tool(inspectBatchTool);
server.tool(flagDefectTool);
server.tool(rootCauseAnalysisTool);

server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});