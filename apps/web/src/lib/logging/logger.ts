import { prisma } from '@/lib/prisma';
import type { LogCategory, LogSeverity, Prisma } from '@prisma/client';

// ── Types ──

export interface LogEntry {
  category: LogCategory;
  eventType: string;
  severity?: LogSeverity;
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  summary: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  geoCountry?: string;
  geoCity?: string;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  sessionId?: string;
  durationMs?: number;
  statusCode?: number;
  expiresAt?: Date;
}

interface RequestInfo {
  ip?: string;
  userAgent?: string;
  method?: string;
  path?: string;
  id?: string;
  statusCode?: number;
}

// ── Retention periods by category ──

const RETENTION_DAYS: Record<string, number> = {
  AUDIT: 365,
  AI: 180,
  SECURITY: 730,
  SYSTEM: 90,
};

function getExpiresAt(category: LogCategory): Date {
  const days = RETENTION_DAYS[category] ?? 365;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ── PlatformLogger ──

class PlatformLogger {
  private buffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL_MS = 5000;
  private flushing = false;

  constructor() {
    if (typeof setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  async log(entry: LogEntry): Promise<void> {
    const enriched: LogEntry = {
      ...entry,
      severity: entry.severity ?? 'INFO',
      expiresAt: entry.expiresAt ?? getExpiresAt(entry.category),
    };

    this.buffer.push(enriched);

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || this.flushing) return;

    this.flushing = true;
    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await this.insertBatch(batch);
    } catch (error) {
      console.error('[PlatformLogger] Flush failed:', error);
      console.error('[PlatformLogger] Lost entries:', batch.length);
    } finally {
      this.flushing = false;
    }
  }

  private async insertBatch(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    await prisma.platformLog.createMany({
      data: entries.map((e) => ({
        category: e.category,
        eventType: e.eventType,
        severity: e.severity ?? 'INFO',
        tenantId: e.tenantId,
        userId: e.userId,
        userEmail: e.userEmail,
        userName: e.userName,
        entityType: e.entityType,
        entityId: e.entityId,
        action: e.action,
        summary: e.summary.slice(0, 500),
        details: (e.details ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
        device: e.device,
        geoCountry: e.geoCountry,
        geoCity: e.geoCity,
        requestMethod: e.requestMethod,
        requestPath: e.requestPath,
        requestId: e.requestId,
        sessionId: e.sessionId,
        durationMs: e.durationMs,
        statusCode: e.statusCode,
        expiresAt: e.expiresAt,
      })),
    });
  }

  // ── HELPERS POR CATEGORIA ──

  audit(params: {
    tenantId: string;
    userId: string;
    userEmail: string;
    userName: string;
    entityType: string;
    entityId: string;
    action: string;
    summary: string;
    details?: Record<string, unknown>;
    request?: RequestInfo;
  }) {
    return this.log({
      category: 'AUDIT',
      eventType: `${params.entityType}.${params.action}`,
      severity: 'INFO',
      tenantId: params.tenantId,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      summary: params.summary,
      details: params.details,
      ipAddress: params.request?.ip,
      userAgent: params.request?.userAgent,
      requestMethod: params.request?.method,
      requestPath: params.request?.path,
      requestId: params.request?.id,
    });
  }

  ai(params: {
    tenantId: string;
    userId: string;
    ticketId?: string;
    summary: string;
    details: Record<string, unknown>;
    durationMs: number;
    success: boolean;
  }) {
    return this.log({
      category: 'AI',
      eventType: params.success ? 'ai.chat.success' : 'ai.chat.error',
      severity: params.success ? 'INFO' : 'ERROR',
      tenantId: params.tenantId,
      userId: params.userId,
      entityType: 'ticket',
      entityId: params.ticketId,
      action: 'ai_chat',
      summary: params.summary,
      details: params.details,
      durationMs: params.durationMs,
    });
  }

  security(params: {
    tenantId?: string;
    userId?: string;
    userEmail?: string;
    eventType: string;
    severity: LogSeverity;
    summary: string;
    details: Record<string, unknown>;
    request?: RequestInfo;
  }) {
    return this.log({
      category: 'SECURITY',
      eventType: params.eventType,
      severity: params.severity,
      tenantId: params.tenantId,
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.eventType,
      summary: params.summary,
      details: params.details,
      ipAddress: params.request?.ip,
      userAgent: params.request?.userAgent,
    });
  }

  system(params: {
    eventType: string;
    severity: LogSeverity;
    summary: string;
    details?: Record<string, unknown>;
    durationMs?: number;
    tenantId?: string;
    request?: RequestInfo;
  }) {
    return this.log({
      category: 'SYSTEM',
      eventType: params.eventType,
      severity: params.severity,
      summary: params.summary,
      details: params.details,
      durationMs: params.durationMs,
      tenantId: params.tenantId,
      requestMethod: params.request?.method,
      requestPath: params.request?.path,
      statusCode: params.request?.statusCode,
      requestId: params.request?.id,
    });
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// ── Singleton ──

const globalForLogger = globalThis as unknown as { platformLogger: PlatformLogger };

export const logger =
  globalForLogger.platformLogger ?? new PlatformLogger();

if (process.env.NODE_ENV !== 'production') {
  globalForLogger.platformLogger = logger;
}
