import { app, BrowserWindow } from 'electron';
import settingsStore from './settings-store';

const isDev = !app.isPackaged;
const TEKI_API_URL = isDev ? 'http://localhost:3000' : 'https://teki.com.br';

let onAuthExpired: (() => void) | null = null;

export function setAuthExpiredCallback(cb: () => void) {
  onAuthExpired = cb;
}
const LOG_QUEUE: LogEntry[] = [];
const FLUSH_INTERVAL_MS = 10_000; // flush every 10s
let flushTimer: ReturnType<typeof setInterval> | null = null;

interface LogEntry {
  event: string;
  action?: string;
  details?: Record<string, unknown>;
  dataCategories?: string[];
  timestamp: number;
}

/**
 * Queue a log entry to be sent to the backend.
 * Logs are batched and flushed periodically to minimize network overhead.
 */
export function logAction(
  event: string,
  details?: Record<string, unknown>,
  action?: string,
  dataCategories?: string[],
) {
  LOG_QUEUE.push({
    event,
    action,
    details,
    dataCategories,
    timestamp: Date.now(),
  });
}

async function sendLog(entry: LogEntry) {
  const apiKey = settingsStore.get('authApiKey');
  if (!apiKey) {
    if (isDev) console.log('[LogService] Sem authApiKey, log descartado:', entry.event);
    return;
  }

  try {
    const res = await fetch(`${TEKI_API_URL}/api/v1/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(entry),
    });
    if (isDev) console.log(`[LogService] ${res.status} - ${entry.event}`);
    if (res.status === 401) {
      // API key revoked or expired — notify renderer
      onAuthExpired?.();
    }
  } catch (err) {
    if (isDev) console.warn('[LogService] Falha ao enviar log:', (err as Error).message);
  }
}

async function flush() {
  if (LOG_QUEUE.length === 0) return;
  const batch = LOG_QUEUE.splice(0, LOG_QUEUE.length);
  for (const entry of batch) {
    await sendLog(entry);
  }
}

export function startLogService() {
  if (flushTimer) return;
  flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
}

export function stopLogService() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  // Flush remaining on stop
  flush();
}

export default { logAction, startLogService, stopLogService };
