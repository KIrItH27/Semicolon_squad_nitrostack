import { createPrompt, Prompt, z } from '@nitrostack/core';

export interface DefinePromptOptions {
  name: string;
  description: string;
  arguments?: z.ZodObject<any>;
  load?: (args: any) => Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>;
  handler?: (args: any, context: any) => Promise<any>;
}

export function definePrompt(options: DefinePromptOptions): Prompt {
  let argsArray: Array<{ name: string; description: string; required?: boolean }> = [];

  if (options.arguments && (options.arguments as any).shape) {
    const shape = (options.arguments as any).shape;
    for (const [key, val] of Object.entries<any>(shape)) {
      argsArray.push({
        name: key,
        description: val?.description || key,
        required: !(val?.isOptional && val.isOptional()),
      });
    }
  }

  return createPrompt({
    name: options.name,
    description: options.description,
    arguments: argsArray,
    handler: async (args, context) => {
      if (options.load) {
        return options.load(args);
      }
      if (options.handler) {
        return options.handler(args, context);
      }
      return [];
    },
  });
}
