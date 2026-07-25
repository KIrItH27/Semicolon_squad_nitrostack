import { z } from '@nitrostack/core';
import { defineTool } from './define-tool.js';

export interface PartInventory {
  partId: string;
  name: string;
  category: string;
  currentStock: number;
  allocatedStock: number;
  availableStock: number;
  safetyStock: number;
  reorderThreshold: number;
  unitCost: number;
  locationBin: string;
}

/**
 * Mock data store for inventory parts
 */
const mockInventory: Record<string, PartInventory> = {
  'PART-SERVO-01': {
    partId: 'PART-SERVO-01',
    name: 'Industrial High-Torque Servo Motor 400W',
    category: 'Actuators',
    currentStock: 45,
    allocatedStock: 30,
    availableStock: 15,
    safetyStock: 50,
    reorderThreshold: 75,
    unitCost: 285.0,
    locationBin: 'BIN-A12-04',
  },
  'PART-BEARING-99': {
    partId: 'PART-BEARING-99',
    name: 'Precision Sealed Ball Bearing 25mm',
    category: 'Mechanical',
    currentStock: 450,
    allocatedStock: 120,
    availableStock: 330,
    safetyStock: 200,
    reorderThreshold: 300,
    unitCost: 14.5,
    locationBin: 'BIN-C08-11',
  },
  'PART-SENSOR-V3': {
    partId: 'PART-SENSOR-V3',
    name: 'Optical Laser Distance Sensor IP67',
    category: 'Sensors',
    currentStock: 18,
    allocatedStock: 10,
    availableStock: 8,
    safetyStock: 25,
    reorderThreshold: 40,
    unitCost: 120.0,
    locationBin: 'BIN-B03-02',
  },
  'PART-PLC-CTRL': {
    partId: 'PART-PLC-CTRL',
    name: 'Programmable Logic Controller CPU Module',
    category: 'Electronics',
    currentStock: 12,
    allocatedStock: 2,
    availableStock: 10,
    safetyStock: 5,
    reorderThreshold: 8,
    unitCost: 1450.0,
    locationBin: 'BIN-E01-01',
  },
};

/**
 * checkStockLevels
 * Inputs: partId?: string. Returns stock levels, threshold limits, and flags items below safety stock.
 */
export const checkStockLevels = defineTool({
  name: 'checkStockLevels',
  description: 'Checks current stock levels, available vs allocated quantities, reorder thresholds, and flags items falling below safety stock limits.',
  parameters: z.object({
    partId: z
      .string()
      .optional()
      .describe('Optional part ID to inspect (e.g., "PART-SERVO-01", "PART-BEARING-99"). If omitted, returns all inventory items.'),
  }),
  execute: async ({ partId }: { partId?: string }) => {
    if (partId) {
      const normalizedId = partId.toUpperCase();
      const item = mockInventory[normalizedId];

      if (!item) {
        return {
          success: false,
          error: `Part ID "${partId}" not found in inventory registry. Available parts: ${Object.keys(mockInventory).join(', ')}`,
        };
      }

      const isBelowSafetyStock = item.currentStock < item.safetyStock;
      const isBelowReorderThreshold = item.currentStock <= item.reorderThreshold;

      return {
        success: true,
        timestamp: new Date().toISOString(),
        part: {
          ...item,
          isBelowSafetyStock,
          isBelowReorderThreshold,
          safetyStockDeficit: isBelowSafetyStock ? item.safetyStock - item.currentStock : 0,
        },
      };
    }

    const items = Object.values(mockInventory).map((item) => {
      const isBelowSafetyStock = item.currentStock < item.safetyStock;
      const isBelowReorderThreshold = item.currentStock <= item.reorderThreshold;
      return {
        ...item,
        isBelowSafetyStock,
        isBelowReorderThreshold,
        safetyStockDeficit: isBelowSafetyStock ? item.safetyStock - item.currentStock : 0,
      };
    });

    const itemsBelowSafety = items.filter((i) => i.isBelowSafetyStock);
    const itemsNeedingReorder = items.filter((i) => i.isBelowReorderThreshold);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPartTypes: items.length,
        itemsBelowSafetyStockCount: itemsBelowSafety.length,
        itemsNeedingReorderCount: itemsNeedingReorder.length,
        criticalAlert: itemsBelowSafety.length > 0,
      },
      itemsBelowSafetyStock: itemsBelowSafety.map((i) => ({
        partId: i.partId,
        name: i.name,
        currentStock: i.currentStock,
        safetyStock: i.safetyStock,
        deficit: i.safetyStockDeficit,
      })),
      allStockLevels: items,
    };
  },
});

/**
 * reserveParts
 * Inputs: partId: string, quantity: number. Reserves parts for a production run.
 */
export const reserveParts = defineTool({
  name: 'reserveParts',
  description: 'Reserves a specific quantity of inventory parts for an upcoming production run, shifting units from available to allocated stock.',
  parameters: z.object({
    partId: z.string().describe('ID of the part to reserve (e.g., "PART-SERVO-01")'),
    quantity: z.number().int().positive().describe('Quantity of parts to allocate/reserve'),
  }),
  execute: async ({ partId, quantity }: { partId: string; quantity: number }) => {
    const normalizedId = partId.toUpperCase();
    const item = mockInventory[normalizedId];

    if (!item) {
      return {
        success: false,
        error: `Part ID "${partId}" not found in inventory registry. Available parts: ${Object.keys(mockInventory).join(', ')}`,
      };
    }

    if (item.availableStock < quantity) {
      return {
        success: false,
        status: 'INSUFFICIENT_STOCK',
        error: `Cannot reserve ${quantity} units of ${item.name} (${item.partId}). Only ${item.availableStock} available (${item.allocatedStock} already allocated).`,
        partId: item.partId,
        requestedQuantity: quantity,
        availableStock: item.availableStock,
        shortfall: quantity - item.availableStock,
        recommendation: 'Trigger purchase order via Procurement tool or adjust batch size.',
      };
    }

    // Mutate state to reflect reservation
    item.allocatedStock += quantity;
    item.availableStock -= quantity;

    const reservationId = `RES-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newIsBelowSafety = item.currentStock < item.safetyStock;

    return {
      success: true,
      status: 'RESERVED',
      timestamp: new Date().toISOString(),
      reservationDetails: {
        reservationId,
        partId: item.partId,
        partName: item.name,
        quantityReserved: quantity,
        previousAvailableStock: item.availableStock + quantity,
        newAvailableStock: item.availableStock,
        totalAllocatedStock: item.allocatedStock,
        totalCurrentStock: item.currentStock,
        locationBin: item.locationBin,
        isBelowSafetyStockNotice: newIsBelowSafety,
      },
    };
  },
});
