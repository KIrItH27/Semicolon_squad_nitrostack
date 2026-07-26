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
exports.SafetyController = exports.escalateIncidentSchema = exports.checkComplianceEventSchema = void 0;
require("dotenv/config");
const core_1 = require("@nitrostack/core");
const safety_tools_js_1 = require("../safety.tools.js");
exports.checkComplianceEventSchema = core_1.z.object({
    zoneId: core_1.z.string().optional(),
    severityFilter: core_1.z.enum(['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('ALL'),
    unresolvedOnly: core_1.z.boolean().optional().default(false),
});
exports.escalateIncidentSchema = core_1.z.object({
    zoneId: core_1.z.string(),
    severity: core_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    description: core_1.z.string(),
    actionRequired: core_1.z.enum(['EVACUATION', 'SHUTDOWN', 'FIRST_AID', 'INSPECTION', 'CONTAINMENT']),
    reportedBy: core_1.z.string().optional().default('Safety Sentinel AI'),
});
let SafetyController = class SafetyController {
    async checkComplianceEvent(input, ctx) {
        ctx.logger.info(`Checking compliance events for zone: ${input?.zoneId || 'All'}`);
        return (0, safety_tools_js_1.checkComplianceEventLogic)(input);
    }
    async escalateIncident(input, ctx) {
        ctx.logger.info(`Escalating safety incident in zone: ${input?.zoneId}`);
        return (0, safety_tools_js_1.escalateIncidentLogic)(input);
    }
};
exports.SafetyController = SafetyController;
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'check_compliance_event',
        description: 'Checks plant safety compliance and active hazard status across plant zones.',
        inputSchema: exports.checkComplianceEventSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "checkComplianceEvent", null);
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'escalate_incident',
        description: 'Escalates safety incidents and triggers automated emergency response protocols.',
        inputSchema: exports.escalateIncidentSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SafetyController.prototype, "escalateIncident", null);
exports.SafetyController = SafetyController = __decorate([
    (0, core_1.ControllerDecorator)()
], SafetyController);
