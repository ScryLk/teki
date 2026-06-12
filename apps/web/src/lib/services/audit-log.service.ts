import { prisma } from '../prisma';

// ═══════════════════════════════════════════════════════════════
// AuditLogService — immutable audit trail for administrative and
// privacy-sensitive feature events (voice listening, STT fallback)
// Actions use the 'domain.event' format, e.g. 'voice.activated'.
// ═══════════════════════════════════════════════════════════════

export interface LogAuditInput {
  action: string;
  tenantId?: string | null;
  userId?: string | null;
  /** Affected resource, e.g. 'voice_session:<id>'. */
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(input: LogAuditInput) {
  return prisma.auditLog.create({
    data: {
      action: input.action,
      tenantId: input.tenantId ?? null,
      userId: input.userId ?? null,
      resource: input.resource,
      details: input.details as object | undefined,
      ipAddress: input.ipAddress,
    },
  });
}

/** Fire-and-forget variant for hot paths (mirrors logDataAccess usage style). */
export function logAuditSafe(input: LogAuditInput): void {
  logAudit(input).catch(() => {});
}
