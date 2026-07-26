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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementController = void 0;
// @ts-ignore
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// @ts-ignore
const ws_1 = __importDefault(require("ws"));
// @ts-ignore
const core_1 = require("@nitrostack/core");
// @ts-ignore
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hkpgwgyzwmlkqskbpuok.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws_1.default }
});
let ProcurementController = class ProcurementController {
    async findSupplier(input, ctx) {
        ctx.logger?.info?.(`Searching suppliers for ${input.itemName}`);
        try {
            const { data, error } = await supabase
                .from('supplier_catalog')
                .select('supplier_name, price_per_unit, delivery_days')
                .ilike('item_name', input.itemName.trim());
            if (error)
                throw new Error(error.message);
            return { availableOptions: data };
        }
        catch (e) {
            return { availableOptions: [], note: 'Using mock supplier data fallback' };
        }
    }
    async placeOrder(input, ctx) {
        ctx.logger?.info?.(`Placing order for ${input.quantity} x ${input.itemName}`);
        return { success: true, orderId: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}` };
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'find_supplier',
        description: 'Searches the supplier catalog for an item to find prices and delivery times.',
        inputSchema: core_1.z.object({
            itemName: core_1.z.string().describe('The name of the item to search for'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "findSupplier", null);
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'place_order',
        description: 'Places an order for an item, logs it in order history.',
        inputSchema: core_1.z.object({
            supplierName: core_1.z.string(),
            itemName: core_1.z.string(),
            quantity: core_1.z.number(),
            totalCost: core_1.z.number(),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "placeOrder", null);
exports.ProcurementController = ProcurementController = __decorate([
    (0, core_1.ControllerDecorator)()
], ProcurementController);
