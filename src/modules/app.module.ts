import { Module } from '@nitrostack/core';
import { InventoryController } from './inventory.controller.js';
import { ProcurementController } from './procurement.controller.js';
import { PolicyController } from './policy.controller.js';
import { OrchestratorController } from './orchestrator.controller.js';

@Module({
  name: 'AppModule',
  description: 'Root application module',
  controllers: [
    InventoryController,
    ProcurementController,
    PolicyController,
    OrchestratorController,
  ],
})
export class AppModule {}
