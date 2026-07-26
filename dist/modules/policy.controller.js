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
exports.PolicyController = void 0;
const core_1 = require("@nitrostack/core");
let PolicyController = class PolicyController {
    async getInventoryRules(ctx) {
        return {
            contents: [
                {
                    uri: 'memo://manufacturing/inventory-rules',
                    mimeType: 'text/plain',
                    text: `
Rules:
- Maintain a minimum stock of 5 units for all critical spare parts.
- Ball Bearings must always have at least 10 units available.
- Servo Motors must always have at least 5 units available.
- PLC Modules must always have at least 3 units available.
- Hydraulic Oil must maintain at least 50 liters in inventory.
- If stock falls below the minimum threshold, procurement must be initiated immediately.
- Prefer suppliers with the lowest delivery time. If delivery times are equal, choose the supplier with the lower unit price.
- All industrial components must be stored in the Central Spare Parts Warehouse.
          `.trim(),
                },
            ],
        };
    }
};
exports.PolicyController = PolicyController;
__decorate([
    (0, core_1.ResourceDecorator)({
        uri: 'memo://manufacturing/inventory-rules',
        name: 'Manufacturing Inventory & Procurement Rules',
        description: 'Defines minimum stock levels and procurement policies for industrial spare parts.',
        mimeType: 'text/plain',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "getInventoryRules", null);
exports.PolicyController = PolicyController = __decorate([
    (0, core_1.ControllerDecorator)()
], PolicyController);
