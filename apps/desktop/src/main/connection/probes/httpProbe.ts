import type { PingResult } from '@teki/shared';

export async function httpProbe(
  serviceId: string,
  url: string,
  timeoutMs = 5000,
): Promise<PingResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latency = Date.now() - start;

    if (!res.ok && res.status >= 500) {
      return { serviceId, status: 'offline', latencyMs: latency, timestamp: Date.now(), error: `HTTP ${res.status}` };
    }

    return {
      serviceId,
      status: latency < 100 ? 'online' : latency < 300 ? 'degraded' : 'offline',
      latencyMs: latency,
      timestamp: Date.now(),
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      serviceId,
      status: 'offline',
      latencyMs: Date.now() - start,
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
