import { supabase } from '../db/supabase.js';
import { Tool, z } from '@nitrostack/core';

export interface DefineToolOptions<TParams extends z.ZodTypeAny = z.ZodTypeAny, TResult = any> {
  name: string;
  description: string;
  parameters?: TParams;
  inputSchema?: TParams;
  execute?: (args: z.infer<TParams>) => Promise<TResult> | TResult;
  handler?: (args: z.infer<TParams>) => Promise<TResult> | TResult;
}

/**
 * NitroStack Tool Definition Helper
 * Wraps tool definitions using Zod schemas and NitroStack's native Tool class.
 */
export function defineTool<TParams extends z.ZodTypeAny = z.ZodTypeAny, TResult = any>(
  options: DefineToolOptions<TParams, TResult>
): Tool {
  const schema = options.parameters || options.inputSchema || z.object({});
  const fn = options.execute || options.handler || (async () => ({}));
  return new Tool({
    name: options.name,
    description: options.description,
    inputSchema: schema,
    handler: async (input: any) => fn(input),
  });
}
