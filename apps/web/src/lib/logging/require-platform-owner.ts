import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { logger } from './logger';

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL;

export async function requirePlatformOwner(req: NextRequest) {
  const authResult = await requireAuth(req);

  // Check if user is the platform owner
  // Platform owner is identified by PLATFORM_OWNER_EMAIL env var or ENTERPRISE plan
  const isOwner =
    (PLATFORM_OWNER_EMAIL && authResult.user.email === PLATFORM_OWNER_EMAIL) ||
    authResult.user.planId === 'ENTERPRISE';

  if (!isOwner) {
    logger.security({
      userId: authResult.user.id,
      userEmail: authResult.user.email,
      eventType: 'unauthorized_access.admin_logs',
      severity: 'WARN',
      summary: `Acesso negado ao painel de logs para ${authResult.user.email}`,
      details: { attempted_route: req.nextUrl.pathname },
      request: {
        ip: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
    });

    throw new PlatformOwnerError('Acesso restrito ao owner da plataforma');
  }

  return authResult;
}

export class PlatformOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlatformOwnerError';
  }
}

export function handleAdminError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: error.message } },
      { status: 401 }
    );
  }
  if (error instanceof PlatformOwnerError) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: error.message } },
      { status: 403 }
    );
  }
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error('[admin route]', message);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  );
}
