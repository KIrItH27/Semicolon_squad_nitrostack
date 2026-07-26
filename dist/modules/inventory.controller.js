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
exports.InventoryController = void 0;
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
let InventoryController = class InventoryController {
    async checkStock(input, ctx) {
        ctx.logger?.info?.(`Checking stock for ${input.partName}`);
        return {
            partName: input.partName,
            inStock: 150,
            reserved: 20,
            status: 'AVAILABLE',
        };
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, core_1.ToolDecorator)({
        name: 'check_stock',
        description: 'Check available inventory stock for a given part or raw material.',
        inputSchema: core_1.z.object({
            partName: core_1.z.string().describe('Name or ID of the part to check.'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "checkStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, core_1.ControllerDecorator)()
], InventoryController);
