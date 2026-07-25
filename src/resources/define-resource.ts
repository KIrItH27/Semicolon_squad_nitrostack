import { createResource, Resource } from '@nitrostack/core';

export interface DefineResourceOptions {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
  load?: () => Promise<{ text: string }> | { text: string };
  handler?: (uri: string, context: any) => Promise<any>;
}

export function defineResource(options: DefineResourceOptions): Resource {
  return createResource({
    uri: options.uri,
    name: options.name,
    description: options.description,
    mimeType: options.mimeType || 'application/json',
    handler: async (uri, context) => {
      if (options.load) {
        const res = await options.load();
        return {
          type: 'text',
          data: res.text,
        };
      }
      if (options.handler) {
        return options.handler(uri, context);
      }
      return { type: 'text', data: '' };
    },
  });
}
