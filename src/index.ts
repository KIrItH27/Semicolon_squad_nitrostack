import { createServer, Tool, z } from '@nitrostack/core';
import { personCTools } from './tools/index.js';
const process = (globalThis as any).process;

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

// Register Person C Supply Chain Tools
for (const tool of personCTools) {
  server.tool(tool);
}

server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
