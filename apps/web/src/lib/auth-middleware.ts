import { NextRequest } from 'next/server';
import type { PlanTier } from '@prisma/client';
import { auth } from './auth';
import { authenticateApiKey } from './api-keys';
import { prisma } from './prisma';
import { resolvePermissions, hasPermission } from '@teki/shared';
import type { Permissions, MemberRole } from '@teki/shared';
import { logDataAccess } from './services/data-access-log.service';

// ─── Request logging (debounced per user+path) ─────────────────
const recentLogs = new Map<string, number>();
const LOG_DEBOUNCE_MS = 30_000; // same user+path within 30s = skip

function shouldLogRequest(userId: string, pathname: string): boolean {
  const key = `${userId}:${pathname}`;
  const now = Date.now();
  const last = recentLogs.get(key);
  if (last && now - last < LOG_DEBOUNCE_MS) return false;
  recentLogs.set(key, now);
  // Cleanup old entries every 100 inserts
  if (recentLogs.size > 500) {
    for (const [k, v] of recentLogs) {
      if (now - v > LOG_DEBOUNCE_MS * 2) recentLogs.delete(k);
    }
  }
  return true;
}

function logApiAccess(req: NextRequest, userId: string, authMethod: string) {
  const pathname = new URL(req.url).pathname;
  // Skip high-frequency/polling endpoints
  if (pathname.includes('/poll') || pathname.includes('/health')) return;
  if (!shouldLogRequest(userId, pathname)) return;

  const method = req.method;
  const action = method === 'GET' ? 'view' as const
    : method === 'DELETE' ? 'delete' as const
    : 'process' as const;

  logDataAccess({
    accessorId: userId,
    accessorType: authMethod === 'apikey' ? 'api' : 'user',
    subjectId: userId,
    action,
    dataCategories: ['activity'],
    details: { method, pathname },
    legalBasis: 'LEGITIMATE_INTEREST',
    justification: `${method} ${pathname}`,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: req.headers.get('user-agent') ?? undefined,
  }).catch(() => {});
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  status: string;
  avatarUrl: string | null;
  /** @deprecated Use tenant context instead. Resolved from primary tenant membership for backward compatibility. */
  planId: PlanTier;
}

export interface TenantContext {
  tenantId: string;
  role: MemberRole;
  permissions: Permissions;
  tenantPlan: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
  isTest: boolean;
  authMethod: 'session' | 'apikey';
  tenant?: TenantContext;
}

/**
 * Resolve planId from the user's first active tenant membership.
 * Falls back to FREE if user has no active memberships.
 */
async function resolvePlanId(userId: string): Promise<PlanTier> {
  const membership = await prisma.tenantMember.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { tenant: { select: { plan: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return membership?.tenant.plan ?? 'FREE';
}

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedRequest | null> {
  // 1. Try API key (Authorization: Bearer tk_live_...)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer tk_')) {
    const key = authHeader.slice(7);
    const result = await authenticateApiKey(key);
    if (result) {
      const user = await prisma.user.findUnique({
        where: { id: result.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          status: true,
          avatarUrl: true,
        },
      });

      if (!user || user.status === 'ANONYMIZED' || user.status === 'SUSPENDED') {
        return null;
      }

      const planId = await resolvePlanId(user.id);

      return {
        user: { ...user, planId },
        isTest: result.isTest,
        authMethod: 'apikey',
      };
    }
    return null;
  }

  // 2. Try session cookie (NextAuth)
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!user || user.status === 'ANONYMIZED' || user.status === 'SUSPENDED') {
      return null;
    }

    const planId = await resolvePlanId(user.id);

    return { user: { ...user, planId }, isTest: false, authMethod: 'session' };
  }

  return null;
}

/**
 * Get authenticated user with tenant context.
 * Resolves the user's role and permissions in the specified tenant.
 */
export async function getAuthenticatedUserWithTenant(
  req: NextRequest,
  tenantId: string
): Promise<AuthenticatedRequest | null> {
  const result = await getAuthenticatedUser(req);
  if (!result) return null;

  const membership = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId: result.user.id,
      },
    },
    include: { tenant: { select: { plan: true } } },
  });

  if (!membership || membership.status !== 'ACTIVE') return null;

  const role = membership.role.toLowerCase() as MemberRole;
  const permissions = resolvePermissions(
    role,
    membership.permissions as Permissions | null
  );

  result.tenant = {
    tenantId,
    role,
    permissions,
    tenantPlan: membership.tenant.plan,
  };

  return result;
}

/**
 * Require authentication — throws AuthError if not authenticated.
 */
export async function requireAuth(
  req: NextRequest
): Promise<AuthenticatedRequest> {
  const result = await getAuthenticatedUser(req);
  if (!result) {
    throw new AuthError(
      'Nao autenticado. Envie um header Authorization: Bearer tk_live_...'
    );
  }

  // Log authenticated API access (fire-and-forget, debounced)
  logApiAccess(req, result.user.id, result.authMethod);

  return result;
}

/**
 * Require authentication with tenant context and permission check.
 */
export async function requireTenantAuth(
  req: NextRequest,
  tenantId: string,
  resource?: keyof Permissions,
  action?: string
): Promise<AuthenticatedRequest> {
  const result = await getAuthenticatedUserWithTenant(req, tenantId);
  if (!result) {
    throw new AuthError('Nao autenticado ou sem acesso a este tenant');
  }

  if (resource && action && result.tenant) {
    if (!hasPermission(result.tenant.permissions, resource, action)) {
      throw new AuthError(`Sem permissao: ${resource}.${action}`);
    }
  }

  return result;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
