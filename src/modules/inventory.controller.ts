import 'dotenv/config';
import { 
  ControllerDecorator as Controller, 
  ToolDecorator as Tool, 
  InitialTool, 
  z, 
  ExecutionContext 
} from '@nitrostack/core';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_PUBLISHABLE_KEY as string);

@Controller()
export class InventoryController {
  @Tool({
    name: 'check_stock',
    description: 'Checks the current inventory level of an item in Supabase.',
    inputSchema: z.object({
      itemName: z.string().describe('The item name to check'),
    }),
  })
  @InitialTool()
  async checkStock(input: { itemName: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Checking stock for ${input.itemName}`);
    
    // Use ilike for case-insensitive matching in Supabase
    const { data, error } = await supabase
      .from('inventory')
      .select('quantity, name')
      .ilike('name', input.itemName.trim())
      .maybeSingle();
      
    if (error) {
      ctx.logger.error(`Supabase error checking stock for ${input.itemName}: ${error.message}`);
      return { 
        itemName: input.itemName, 
        quantity: 0, 
        notice: `Database error: ${error.message}` 
      };
    }

    if (!data) {
      ctx.logger.info(`No item matching '${input.itemName}' found in inventory table.`);
      return { 
        itemName: input.itemName, 
        quantity: 0, 
        notice: `Item '${input.itemName}' not found in inventory table.` 
      };
    }
    
    return { itemName: data.name, quantity: data.quantity };
  }
}
