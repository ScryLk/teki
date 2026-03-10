export type ServiceStatus = 'online' | 'offline' | 'degraded' | 'checking';

export interface ConnectionHealth {
  internet: ServiceStatus;
  backend: ServiceStatus;
  openclaw: ServiceStatus;
}

export interface ConnectionHealthEvent {
  health: ConnectionHealth;
  timestamp: number;
}

export const DEFAULT_CONNECTION_HEALTH: ConnectionHealth = {
  internet: 'checking',
  backend: 'checking',
  openclaw: 'checking',
};
