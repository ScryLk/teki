import { Pool } from 'pg';
import { withTimeout } from '@teki/shared';
import type { PingResult } from '@teki/shared';

const pools = new Map<string, Pool>();

function getPool(connectionString: string): Pool {
  let pool = pools.get(connectionString);
  if (!pool) {
    pool = new Pool({ connectionString, max: 1, idleTimeoutMillis: 30_000 });
    pools.set(connectionString, pool);
  }
  return pool;
}

export async function pgProbe(
  serviceId: string,
  connectionString: string,
  timeoutMs = 5000,
): Promise<PingResult> {
  const start = Date.now();

  try {
    const pool = getPool(connectionString);
    await withTimeout(pool.query('SELECT 1'), timeoutMs, 'pg:ping');
    const latency = Date.now() - start;

    return {
      serviceId,
      status: latency < 100 ? 'online' : latency < 300 ? 'degraded' : 'offline',
      latencyMs: latency,
      timestamp: Date.now(),
    };
  } catch (err) {
    return {
      serviceId,
      status: 'offline',
      latencyMs: Date.now() - start,
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export function closePools(): void {
  for (const pool of pools.values()) {
    pool.end().catch(() => {});
  }
  pools.clear();
}
