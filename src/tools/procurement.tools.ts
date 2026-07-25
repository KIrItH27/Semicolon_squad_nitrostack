import { z } from '@nitrostack/core';
import { defineTool } from './define-tool.js';

export interface VendorQuote {
  vendorId: string;
  vendorName: string;
  partId: string;
  unitPriceUSD: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  vendorRating: number; // 1-5 scale
  expeditedShippingAvailable: boolean;
  notes: string;
}

export interface PurchaseOrder {
  poId: string;
  partId: string;
  partName: string;
  quantity: number;
  vendorId: string;
  vendorName: string;
  unitPriceUSD: number;
  totalAmountUSD: number;
  estimatedLeadTimeDays: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REQUIRES_SUPERVISOR_APPROVAL' | 'REJECTED' | 'DISPATCHED';
  createdAt: string;
  notes?: string;
  moqMet: boolean;
  moqNotice?: string;
}

/**
 * Mock Vendor Quotes Catalog
 */
const mockVendorCatalog: Record<string, VendorQuote[]> = {
  'PART-SERVO-01': [
    {
      vendorId: 'VEND-APEX',
      vendorName: 'Apex Motion Systems & Automation',
      partId: 'PART-SERVO-01',
      unitPriceUSD: 285.0,
      leadTimeDays: 5,
      minimumOrderQuantity: 5,
      vendorRating: 4.8,
      expeditedShippingAvailable: true,
      notes: 'Standard OEM distributor warranty included (24 months).',
    },
    {
      vendorId: 'VEND-PRECISION',
      vendorName: 'Precision Robotics Direct',
      partId: 'PART-SERVO-01',
      unitPriceUSD: 270.0,
      leadTimeDays: 12,
      minimumOrderQuantity: 10,
      vendorRating: 4.3,
      expeditedShippingAvailable: false,
      notes: 'Bulk discount available for orders over 50 units.',
    },
    {
      vendorId: 'VEND-GLOBAL',
      vendorName: 'Global Industrial Components Co.',
      partId: 'PART-SERVO-01',
      unitPriceUSD: 310.0,
      leadTimeDays: 2,
      minimumOrderQuantity: 1,
      vendorRating: 4.9,
      expeditedShippingAvailable: true,
      notes: 'Same-day rush dispatch available from regional hub.',
    },
  ],
  'PART-BEARING-99': [
    {
      vendorId: 'VEND-BEARINGHUB',
      vendorName: 'BearingHub Distribution Inc.',
      partId: 'PART-BEARING-99',
      unitPriceUSD: 14.5,
      leadTimeDays: 3,
      minimumOrderQuantity: 50,
      vendorRating: 4.7,
      expeditedShippingAvailable: true,
      notes: 'Grade 5 precision ceramic bearings available on request.',
    },
    {
      vendorId: 'VEND-APEX',
      vendorName: 'Apex Motion Systems & Automation',
      partId: 'PART-BEARING-99',
      unitPriceUSD: 16.0,
      leadTimeDays: 2,
      minimumOrderQuantity: 20,
      vendorRating: 4.8,
      expeditedShippingAvailable: true,
      notes: 'Pre-lubricated high speed synthetic grease spec.',
    },
  ],
  'PART-SENSOR-V3': [
    {
      vendorId: 'VEND-SENSOTECH',
      vendorName: 'SensoTech Optics & Automation',
      partId: 'PART-SENSOR-V3',
      unitPriceUSD: 120.0,
      leadTimeDays: 4,
      minimumOrderQuantity: 2,
      vendorRating: 4.6,
      expeditedShippingAvailable: true,
      notes: 'Calibrated factory sensor certificate attached.',
    },
    {
      vendorId: 'VEND-GLOBAL',
      vendorName: 'Global Industrial Components Co.',
      partId: 'PART-SENSOR-V3',
      unitPriceUSD: 135.0,
      leadTimeDays: 1,
      minimumOrderQuantity: 1,
      vendorRating: 4.9,
      expeditedShippingAvailable: true,
      notes: 'Emergency 24hr plant delivery line.',
    },
  ],
  'PART-PLC-CTRL': [
    {
      vendorId: 'VEND-SIEMEX',
      vendorName: 'Siemex Automation Direct',
      partId: 'PART-PLC-CTRL',
      unitPriceUSD: 1450.0,
      leadTimeDays: 14,
      minimumOrderQuantity: 1,
      vendorRating: 4.9,
      expeditedShippingAvailable: false,
      notes: 'Firmware v4.2 pre-flashed.',
    },
    {
      vendorId: 'VEND-APEX',
      vendorName: 'Apex Motion Systems & Automation',
      partId: 'PART-PLC-CTRL',
      unitPriceUSD: 1550.0,
      leadTimeDays: 6,
      minimumOrderQuantity: 1,
      vendorRating: 4.8,
      expeditedShippingAvailable: true,
      notes: 'Includes DIN-rail mount bracket kit.',
    },
  ],
};

/**
 * In-memory Purchase Order Store
 */
const purchaseOrdersStore: Record<string, PurchaseOrder> = {};
let poCounter = 1001;

/**
 * getVendorQuotes
 * Inputs: partId: string. Returns pricing and lead times from 2-3 mock vendors.
 */
export const getVendorQuotes = defineTool({
  name: 'getVendorQuotes',
  description: 'Fetches competitive pricing, lead times, minimum order quantities, and ratings from certified component vendors for a specified part.',
  parameters: z.object({
    partId: z.string().describe('ID of the part to request supplier quotes for (e.g., "PART-SERVO-01", "PART-BEARING-99")'),
  }),
  execute: async ({ partId }: { partId: string }) => {
    const normalizedId = partId.toUpperCase();
    const quotes = mockVendorCatalog[normalizedId];

    if (!quotes || quotes.length === 0) {
      // Generate default fallback quotes for unlisted parts
      const defaultQuotes: VendorQuote[] = [
        {
          vendorId: 'VEND-GENERIC-1',
          vendorName: 'Standard Industrial Components',
          partId: normalizedId,
          unitPriceUSD: 100.0,
          leadTimeDays: 7,
          minimumOrderQuantity: 5,
          vendorRating: 4.2,
          expeditedShippingAvailable: true,
          notes: 'Standard market catalog item quote.',
        },
        {
          vendorId: 'VEND-GENERIC-2',
          vendorName: 'FastTrack Supply Chain Ltd',
          partId: normalizedId,
          unitPriceUSD: 115.0,
          leadTimeDays: 3,
          minimumOrderQuantity: 1,
          vendorRating: 4.5,
          expeditedShippingAvailable: true,
          notes: 'Express courier shipment included.',
        },
      ];

      return {
        success: true,
        partId: normalizedId,
        quoteCount: defaultQuotes.length,
        recommendedQuote: defaultQuotes[0],
        quotes: defaultQuotes,
      };
    }

    // Sort by best value (combination of price and lead time)
    const sortedQuotes = [...quotes].sort((a, b) => a.unitPriceUSD - b.unitPriceUSD);

    return {
      success: true,
      partId: normalizedId,
      quoteCount: quotes.length,
      recommendedBestPrice: sortedQuotes[0],
      recommendedFastest: [...quotes].sort((a, b) => a.leadTimeDays - b.leadTimeDays)[0],
      quotes,
    };
  },
});

/**
 * createPurchaseOrder
 * Inputs: partId: string, quantity: number, vendorId?: string. Creates a draft PO with supplier quotes and status "PENDING_APPROVAL".
 */
export const createPurchaseOrder = defineTool({
  name: 'createPurchaseOrder',
  description: 'Generates a formal draft Purchase Order (PO) with selected vendor pricing, total cost calculation, MOQ validation, and sets status to PENDING_APPROVAL.',
  parameters: z.object({
    partId: z.string().describe('ID of the part to purchase (e.g., "PART-SERVO-01")'),
    quantity: z.number().int().positive().describe('Number of units to purchase'),
    vendorId: z
      .string()
      .optional()
      .describe('Optional preferred vendor ID (e.g., "VEND-APEX"). If omitted, the best-priced available vendor will be automatically selected.'),
  }),
  execute: async ({ partId, quantity, vendorId }: { partId: string; quantity: number; vendorId?: string }) => {
    const normalizedPartId = partId.toUpperCase();
    const availableQuotes = mockVendorCatalog[normalizedPartId] || [
      {
        vendorId: 'VEND-APEX',
        vendorName: 'Apex Motion Systems & Automation',
        partId: normalizedPartId,
        unitPriceUSD: 150.0,
        leadTimeDays: 5,
        minimumOrderQuantity: 1,
        vendorRating: 4.7,
        expeditedShippingAvailable: true,
        notes: 'Fallback default quote.',
      },
    ];

    let selectedQuote: VendorQuote | undefined;

    if (vendorId) {
      selectedQuote = availableQuotes.find((q) => q.vendorId.toUpperCase() === vendorId.toUpperCase());
      if (!selectedQuote) {
        // Fallback to first available if specific vendor not found
        selectedQuote = availableQuotes[0];
      }
    } else {
      // Pick best price quote
      selectedQuote = [...availableQuotes].sort((a, b) => a.unitPriceUSD - b.unitPriceUSD)[0];
    }

    // --- MOQ (Minimum Order Quantity) Validation ---
    const moqMet = quantity >= selectedQuote.minimumOrderQuantity;
    const effectiveQuantity = moqMet ? quantity : selectedQuote.minimumOrderQuantity;
    const moqNotice = !moqMet
      ? `Requested quantity (${quantity}) is below vendor's Minimum Order Quantity (${selectedQuote.minimumOrderQuantity}). Order quantity automatically adjusted to ${selectedQuote.minimumOrderQuantity}.`
      : undefined;

    const poId = `PO-2026-${poCounter++}`;
    const totalAmountUSD = Number((selectedQuote.unitPriceUSD * effectiveQuantity).toFixed(2));

    const po: PurchaseOrder = {
      poId,
      partId: normalizedPartId,
      partName: `Component ${normalizedPartId}`,
      quantity: effectiveQuantity,
      vendorId: selectedQuote.vendorId,
      vendorName: selectedQuote.vendorName,
      unitPriceUSD: selectedQuote.unitPriceUSD,
      totalAmountUSD,
      estimatedLeadTimeDays: selectedQuote.leadTimeDays,
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      notes: selectedQuote.notes,
      moqMet,
      moqNotice,
    };

    // Save to store
    purchaseOrdersStore[poId] = po;

    return {
      success: true,
      timestamp: po.createdAt,
      message: `Draft Purchase Order ${po.poId} created successfully. Status: PENDING_APPROVAL. Submit to Cost Analysis tool for financial evaluation.`,
      moqNotice,
      purchaseOrder: po,
      supplierQuoteSummary: {
        vendorId: selectedQuote.vendorId,
        vendorName: selectedQuote.vendorName,
        unitPriceUSD: selectedQuote.unitPriceUSD,
        leadTimeDays: selectedQuote.leadTimeDays,
        minimumOrderQuantity: selectedQuote.minimumOrderQuantity,
      },
    };
  },
});