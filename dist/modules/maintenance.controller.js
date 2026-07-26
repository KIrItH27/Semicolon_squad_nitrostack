"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceController = exports.scheduleMaintenanceSchema = exports.predictFailureSchema = exports.checkMachineHealthSchema = void 0;
require("dotenv/config");
const core_1 = require("@nitrostack/core");
const maintenance_tools_js_1 = require("../maintenance.tools.js");
exports.checkMachineHealthSchema = core_1.z.object({
    machineId: core_1.z.string().optional().describe('Machine ID (e.g. "CNC-01", "PRESS-04", "MCH-212"). Omit for all.'),
});
exports.predictFailureSchema = core_1.z.object({
    machineId: core_1.z.string().describe('Target machine ID (e.g. "MCH-212").'),
    timeframeHours: core_1.z.number().optional().default(72),
});
exports.scheduleMaintenanceSchema = core_1.z.object({
    machineId: core_1.z.string().describe('Exact Machine ID to schedule (e.g. MCH-212).'),
    maintenanceType: core_1.z.enum(['PREVENTATIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION']).optional().default('EMERGENCY'),
    scheduledDate: core_1.z.string().optional().describe('Scheduled date/time for maintenance.'),
    priority: core_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('CRITICAL'),
    assignedTechnician: core_1.z.string().optional().default('Alex Vance'),
    recipientEmail: core_1.z.string().optional().default('cb.ai.u4aid25043@cb.students.amrita.edu'),
    technicianNotes: core_1.z.string().optional().describe('Reason for maintenance or diagnostic notes.'),
});
let MaintenanceController = class MaintenanceController {
    async checkMachineHealth(input, ctx) {
        ctx.logger.info(`Checking health status for machine: ${input?.machineId || 'All'}`);
        return (0, maintenance_tools_js_1.checkMachineHealthLogic)(input);
    }
    async predictFailure(input, ctx) {
        ctx.logger.info(`Predicting failure risks for machine: ${input?.machineId}`);
        return (0, maintenance_tools_js_1.predictFailureLogic)(input);
    }
    async scheduleMaintenance(input, ctx) {
        ctx.logger.info(`Scheduling maintenance work order for machine: ${input?.machineId}`);
        return (0, maintenance_tools_js_1.scheduleMaintenanceLogic)(input);
    }
};
exports.MaintenanceController = MaintenanceController;
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'check_machine_health',
        description: 'Checks health status, temperature, and telemetry of plant machinery.',
        inputSchema: exports.checkMachineHealthSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaintenanceController.prototype, "checkMachineHealth", null);
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'predict_failure',
        description: 'Predicts failure probability and component risks for plant equipment.',
        inputSchema: exports.predictFailureSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaintenanceController.prototype, "predictFailure", null);
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'schedule_maintenance',
        description: 'Schedules maintenance work orders and dispatches detailed email notifications to technicians.',
        inputSchema: exports.scheduleMaintenanceSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaintenanceController.prototype, "scheduleMaintenance", null);
exports.MaintenanceController = MaintenanceController = __decorate([
    (0, core_1.ControllerDecorator)()
], MaintenanceController);
