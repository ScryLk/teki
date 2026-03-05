import { prisma } from '../prisma';
import type { DataAccessAction, AccessorType, DataCategory } from '@teki/shared';

// ═══════════════════════════════════════════════════════════════
// DataAccessLogService — LGPD Art. 37 compliance
// Records who accessed whose personal data and when
// Immutable: records are never updated or deleted
// Minimum retention: 5 years (LGPD prescriptive period)
// ═══════════════════════════════════════════════════════════════

export interface LogAccessInput {
  accessorId: string;
  accessorType: AccessorType;
  accessorTenantId?: string;
  subjectId: string;
  action: DataAccessAction;
  dataCategories: DataCategory[];
  details?: Record<string, unknown>;
  legalBasis?: string;
  justification?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a data access event. Should be called whenever personal data is
 * viewed, exported, modified, deleted, anonymized, shared, or processed.
 */
export async function logDataAccess(input: LogAccessInput) {
  return prisma.dataAccessLog.create({
    data: {
      accessorId: input.accessorId,
      accessorType: mapAccessorType(input.accessorType),
      accessorTenantId: input.accessorTenantId,
      subjectId: input.subjectId,
      action: mapAction(input.action),
      dataCategories: input.dataCategories,
      details: (input.details ?? undefined) as import('@prisma/client').Prisma.InputJsonValue | undefined,
      legalBasis: input.legalBasis,
      justification: input.justification,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

/**
 * Get data access history for a specific subject (the person whose data was accessed).
 * Used for LGPD Art. 18 — user's right to know who accessed their data.
 */
export async function getAccessHistoryForSubject(
  subjectId: string,
  options?: { limit?: number; offset?: number }
) {
  return prisma.dataAccessLog.findMany({
    where: { subjectId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
    select: {
      id: true,
      accessorType: true,
      action: true,
      dataCategories: true,
      legalBasis: true,
      justification: true,
      createdAt: true,
    },
  });
}

/**
 * Get access logs by a specific accessor (e.g., admin).
 * Used for auditing admin actions.
 */
export async function getAccessLogsByAccessor(
  accessorId: string,
  options?: { limit?: number; offset?: number }
) {
  return prisma.dataAccessLog.findMany({
    where: { accessorId },
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
}

function mapAccessorType(t: AccessorType): import('@prisma/client').AccessorType {
  const map: Record<AccessorType, import('@prisma/client').AccessorType> = {
    user: 'USER',
    admin: 'ADMIN',
    system: 'SYSTEM',
    api: 'API_ACCESSOR',
    support: 'SUPPORT',
  };
  return map[t];
}

function mapAction(a: DataAccessAction): import('@prisma/client').DataAccessAction {
  const map: Record<DataAccessAction, import('@prisma/client').DataAccessAction> = {
    view: 'VIEW',
    export: 'EXPORT',
    modify: 'MODIFY',
    delete: 'DELETE',
    anonymize: 'ANONYMIZE',
    share: 'SHARE',
    process: 'PROCESS',
  };
  return map[a];
}
