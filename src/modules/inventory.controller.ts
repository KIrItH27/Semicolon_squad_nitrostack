import 'dotenv/config';
import { 
  ControllerDecorator as Controller, 
  ToolDecorator as Tool, 
  InitialTool, 
  z, 
  ExecutionContext 
} from '@nitrostack/core';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

const GENERIC_TERMS = new Set([
  'supplies',
  'supply',
  'inventory',
  'stock',
  'all',
  'items',
  'spare parts',
  'all supplies',
  'all items',
  'all stock',
  'all inventory',
]);

@Controller()
export class InventoryController {
  @Tool({
    name: 'check_stock',
    description: 'Checks the current inventory level of an item or all items in Supabase. If itemName is omitted or generic (e.g., "supplies", "all", "inventory"), returns stock levels for all items in inventory.',
    inputSchema: z.object({
      itemName: z.string().optional().describe('The item name to check. Omit, leave empty, or pass "all"/"supplies" to check all items.'),
    }),
  })
  @InitialTool()
  async checkStock(input: { itemName?: string }, ctx: ExecutionContext) {
    const rawName = input?.itemName?.trim();
    ctx.logger.info(`Checking stock for ${rawName || 'all items'}`);
    
    // If specific item name provided and not generic, attempt specific lookup first
    if (rawName && !GENERIC_TERMS.has(rawName.toLowerCase())) {
      const { data, error } = await supabase
        .from('inventory')
        .select('quantity, name')
        .ilike('name', rawName)
        .maybeSingle();
        
      if (error) {
        ctx.logger.error(`Supabase error checking stock for ${rawName}: ${error.message}`);
        return { 
          itemName: rawName, 
          quantity: 0, 
          notice: `Database error: ${error.message}` 
        };
      }

      if (data) {
        return { itemName: data.name, quantity: data.quantity };
      }
      ctx.logger.info(`No specific item matching '${rawName}' found, falling back to fetching all inventory items.`);
    }

    // Fetch all items from inventory table
    const { data: allData, error: allError } = await supabase
      .from('inventory')
      .select('name, quantity');

    if (allError) {
      ctx.logger.error(`Supabase error checking stock for all items: ${allError.message}`);
      return { 
        itemName: rawName || 'all', 
        quantity: 0, 
        notice: `Database error: ${allError.message}` 
      };
    }

    return {
      itemName: rawName || 'all',
      items: allData || [],
      quantity: allData ? allData.reduce((acc, cur) => acc + (cur.quantity || 0), 0) : 0,
      summary: allData ? allData.map(i => `${i.name}: ${i.quantity}`).join(', ') : 'No items in inventory'
    };
  }
}
