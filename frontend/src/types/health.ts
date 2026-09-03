export interface SystemModuleStatus {
  status: 'operational' | 'standby' | 'degraded' | string;
  description: string;
  ready: boolean;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'offline' | string;
  project: string;
  version: string;
  environment: string;
  database_status: string;
  timestamp: string;
  modules: Record<string, SystemModuleStatus>;
  details?: string;
}

export interface ThreatVectorMeta {
  id: string;
  name: string;
  description: string;
  detectionMetric: string;
  status: 'Planned (Part 3)' | 'Active' | 'Simulated';
}
