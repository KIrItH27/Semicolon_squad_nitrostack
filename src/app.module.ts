import { MaintenanceTools } from './maintenance.tools';
import { SafetyTools } from './safety.tools';

export class AppModule {
  static providers = [
    MaintenanceTools,
    SafetyTools,
  ];
}