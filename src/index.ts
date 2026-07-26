import 'dotenv/config';
import { McpApp, McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './modules/app.module.js';

const port = Number(process.env.PORT) || 3000;

@McpApp({
  module: AppModule,
  server: {
    name: 'Final_Semicolon_Squad',
    version: '1.0.0',
  },
  transport: {
    type: 'http',
    http: {
      port,
      host: '0.0.0.0',
      basePath: '/mcp'
    },
  },
})
export class AppRoot { }

async function bootstrap() {
  const app = await McpApplicationFactory.create(AppRoot);
  await app.start();
  console.error(`FactoryMind Server started successfully on port ${port}!`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});