/**
 * In-memory rate limiter for API key requests.
 * Sufficient for single-instance Next.js deployment.
 * For multi-instance, replace with Redis-based implementation.
 */

// ─── Sliding window RPM limiter ─────────────────────────────

const rpmWindows = new Map<string, number[]>();
let rpmInsertCount = 0;

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const timestamps = rpmWindows.get(key) ?? [];

  // Remove expired timestamps
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    const oldestInWindow = valid[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    rpmWindows.set(key, valid);
    return { allowed: false, retryAfterMs };
  }

  valid.push(now);
  rpmWindows.set(key, valid);

  // Periodic cleanup
  rpmInsertCount++;
  if (rpmInsertCount > 500) {
    rpmInsertCount = 0;
    for (const [k, v] of rpmWindows) {
      const filtered = v.filter((t) => now - t < windowMs * 2);
      if (filtered.length === 0) {
        rpmWindows.delete(k);
      } else {
        rpmWindows.set(k, filtered);
      }
    }
  }

  return { allowed: true };
}

// ─── Daily counter ──────────────────────────────────────────

const dailyCounters = new Map<string, { count: number; resetAt: number }>();

function getNextMidnightUTC(): number {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export function checkDailyLimit(
  key: string,
  maxPerDay: number
): { allowed: boolean; current: number } {
  const now = Date.now();
  let entry = dailyCounters.get(key);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: getNextMidnightUTC() };
  }

  entry.count++;
  dailyCounters.set(key, entry);

  return {
    allowed: entry.count <= maxPerDay,
    current: entry.count,
  };
}

// ─── Plan RPM limits ────────────────────────────────────────

export const PLAN_RPM: Record<string, number> = {
  FREE: 0,
  STARTER: 20,
  PRO: 60,
  ENTERPRISE: 200,
};

export const PLAN_DAILY_REQUESTS: Record<string, number> = {
  FREE: 0,
  STARTER: 500,
  PRO: 2000,
  ENTERPRISE: 10000,
};
