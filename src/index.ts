import 'dotenv/config';
import { McpApp, McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './modules/app.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'smart-inventory-supervisor',
    version: '1.0.0',
  },
  transport: {
    type: 'http',
    http: {
      port: 3000,
      host: '0.0.0.0',
      basePath: '/mcp',
    },
  },
})
export class AppRoot {}

async function bootstrap() {
  const app = await McpApplicationFactory.create(AppRoot);
  await app.start();
  console.error('Smart Inventory Server started successfully on port 3000!');
}

bootstrap().catch(console.error);
