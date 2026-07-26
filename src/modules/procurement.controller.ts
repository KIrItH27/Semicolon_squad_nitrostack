import 'dotenv/config';
import {
  ControllerDecorator as Controller,
  ToolDecorator as Tool,
  z,
  ExecutionContext,
  emitEvent
} from '@nitrostack/core';
import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
  {
    realtime: {
      transport: WebSocket as any,
    },
  }
);

@Controller()
export class ProcurementController {
  @Tool({
    name: 'find_supplier',
    description: 'Searches the supplier catalog for an item to find prices and delivery times.',
    inputSchema: z.object({
      itemName: z.string().describe('The name of the item to search for'),
    }),
  })
  async findSupplier(input: { itemName: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Searching suppliers for ${input.itemName}`);
    const { data, error } = await supabase
      .from('supplier_catalog')
      .select('supplier_name, price_per_unit, delivery_days')
      .ilike('item_name', input.itemName.trim());

    if (error) throw new Error(error.message);
    return { availableOptions: data };
  }

  @Tool({
    name: 'place_order',
    description: 'Places an order for an item, logs it in order history, and automatically updates the inventory count in Supabase.',
    inputSchema: z.object({
      itemName: z.string().describe('The name of the item to order'),
      supplierName: z.string().describe('The chosen supplier name'),
      quantity: z.number().describe('The amount to order'),
      totalCost: z.number().describe('The total cost of the order'),
    }),
  })
  async placeOrder(
    input: { itemName: string; supplierName: string; quantity: number; totalCost: number },
    ctx: ExecutionContext
  ) {
    ctx.logger.info(`Placing order for ${input.quantity} unit(s) of ${input.itemName} with ${input.supplierName}`);

    // 1. Insert order record into order_history
    const { data: orderData, error: orderError } = await supabase
      .from('order_history')
      .insert([{
        item_name: input.itemName,
        supplier_name: input.supplierName,
        quantity_ordered: input.quantity,
        total_cost: input.totalCost
      }])
      .select();

    if (orderError) {
      ctx.logger.error(`Error inserting order history: ${orderError.message}`);
      throw new Error(`Order failed: ${orderError.message}`);
    }

    // 2. Update inventory table (upsert / increment quantity)
    const { data: existingItem, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .ilike('name', input.itemName.trim())
      .maybeSingle();

    let updatedInventory;
    if (fetchError) {
      ctx.logger.warn(`Could not check inventory during order placement: ${fetchError.message}`);
    } else if (existingItem) {
      // Item exists: add ordered quantity to existing stock
      const newQuantity = existingItem.quantity + input.quantity;
      const { data: updateData, error: updateError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (updateError) {
        ctx.logger.error(`Failed to update inventory quantity: ${updateError.message}`);
      } else {
        updatedInventory = updateData;
      }
    } else {
      // Item does not exist: insert new inventory entry
      const { data: insertData, error: insertError } = await supabase
        .from('inventory')
        .insert([{ name: input.itemName, quantity: input.quantity }])
        .select()
        .single();

      if (insertError) {
        ctx.logger.error(`Failed to insert new item into inventory: ${insertError.message}`);
      } else {
        updatedInventory = insertData;
      }
    }

    // Emit event for event listeners
    emitEvent('order.placed', {
      itemName: input.itemName,
      supplierName: input.supplierName,
      quantity: input.quantity,
      totalCost: input.totalCost,
      newStockLevel: updatedInventory?.quantity
    });

    return {
      status: 'success',
      message: `Order placed with ${input.supplierName}. Inventory updated!`,
      receipt: orderData,
      updatedInventory: updatedInventory || 'Inventory update attempted'
    };
  }
}