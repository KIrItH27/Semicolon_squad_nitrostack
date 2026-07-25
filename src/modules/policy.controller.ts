import { 
  ControllerDecorator as Controller, 
  ResourceDecorator as Resource, 
  ExecutionContext 
} from '@nitrostack/core';

@Controller()
export class PolicyController {
  @Resource({
    uri: 'memo://household/inventory-rules',
    name: 'Household Storage & Inventory Rules',
    description: 'Defines minimum stock levels and acceptable places for items.',
    mimeType: 'text/plain',
  })
  async getInventoryRules(ctx: ExecutionContext) {
    return {
      contents: [
        {
          uri: 'memo://household/inventory-rules',
          mimeType: 'text/plain',
          text: 'Rules: Minimum 2 units of Milk in the Kitchen. Minimum 1 bag of Rice in the Kitchen. All hardware and electronics must go in the Garage.',
        },
      ],
    };
  }
}
