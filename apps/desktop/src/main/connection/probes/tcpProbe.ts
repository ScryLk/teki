import { Socket } from 'net';
import type { PingResult } from '@teki/shared';

export function tcpProbe(
  serviceId: string,
  host: string,
  port: number,
  timeoutMs = 5000,
): Promise<PingResult> {
  const start = Date.now();

  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      const latency = Date.now() - start;
      socket.destroy();
      resolve({
        serviceId,
        status: latency < 100 ? 'online' : latency < 300 ? 'degraded' : 'offline',
        latencyMs: latency,
        timestamp: Date.now(),
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        serviceId,
        status: 'offline',
        latencyMs: timeoutMs,
        timestamp: Date.now(),
        error: 'Connection timed out',
      });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({
        serviceId,
        status: 'offline',
        latencyMs: Date.now() - start,
        timestamp: Date.now(),
        error: err.message,
      });
    });

    socket.connect(port, host);
  });
}
