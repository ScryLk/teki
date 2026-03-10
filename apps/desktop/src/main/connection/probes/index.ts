import type { MonitoredService, PingResult } from '@teki/shared';
import { httpProbe } from './httpProbe';
import { tcpProbe } from './tcpProbe';
import { pgProbe } from './pgProbe';

export async function runProbe(service: MonitoredService): Promise<PingResult> {
  switch (service.type) {
    case 'http':
      return httpProbe(service.id, service.target);

    case 'tcp': {
      const [host, portStr] = service.target.split(':');
      const port = parseInt(portStr, 10) || 80;
      return tcpProbe(service.id, host, port);
    }

    case 'pg':
      return pgProbe(service.id, service.target);

    default:
      return {
        serviceId: service.id,
        status: 'offline',
        latencyMs: 0,
        timestamp: Date.now(),
        error: `Unknown probe type: ${(service as MonitoredService).type}`,
      };
  }
}

export { httpProbe } from './httpProbe';
export { tcpProbe } from './tcpProbe';
export { pgProbe, closePools } from './pgProbe';
