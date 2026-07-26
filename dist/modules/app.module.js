"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@nitrostack/core");
const app_controller_js_1 = require("./app.controller.js");
const inventory_controller_js_1 = require("./inventory.controller.js");
const procurement_controller_js_1 = require("./procurement.controller.js");
const policy_controller_js_1 = require("./policy.controller.js");
const orchestrator_controller_js_1 = require("./orchestrator.controller.js");
const maintenance_controller_js_1 = require("./maintenance.controller.js");
const safety_controller_js_1 = require("./safety.controller.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, core_1.Module)({
        name: 'AppModule',
        description: 'FactoryMind Root Module combining Inventory, Procurement, Policy, Maintenance, Safety, and System tools',
        controllers: [
            app_controller_js_1.AppController,
            inventory_controller_js_1.InventoryController,
            procurement_controller_js_1.ProcurementController,
            policy_controller_js_1.PolicyController,
            orchestrator_controller_js_1.OrchestratorController,
            maintenance_controller_js_1.MaintenanceController,
            safety_controller_js_1.SafetyController,
        ],
    })
], AppModule);
