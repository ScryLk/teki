import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiKey } from '@/lib/api-keys';
import bcrypt from 'bcryptjs';
import { logDataAccess } from '@/lib/services/data-access-log.service';
import { withRequestLog } from '@/lib/request-logger';

/**
 * POST /api/auth/desktop-login
 * Direct email+password login for desktop app.
 * Returns an API key instead of a session cookie.
 */
async function _POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Email e senha obrigatorios.' } },
        { status: 400 },
      );
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { credentials: true },
    });

    if (!user || user.status !== 'ACTIVE' || !user.credentials) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos.' } },
        { status: 401 },
      );
    }

    // Check lockout
    if (user.credentials.lockedUntil && user.credentials.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: { code: 'LOCKED', message: 'Conta bloqueada. Tente novamente em alguns minutos.' } },
        { status: 423 },
      );
    }

    const valid = await bcrypt.compare(password, user.credentials.passwordHash);

    if (!valid) {
      const failedAttempts = user.credentials.failedAttempts + 1;
      await prisma.userCredential.update({
        where: { userId: user.id },
        data: {
          failedAttempts,
          ...(failedAttempts >= 5
            ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
            : {}),
        },
      });
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos.' } },
        { status: 401 },
      );
    }

    // Reset failed attempts
    await prisma.userCredential.update({
      where: { userId: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    // Revoke any existing desktop keys before creating a new one (keep only 1 active)
    await prisma.apiKey.updateMany({
      where: { userId: user.id, name: 'Teki Desktop', isRevoked: false },
      data: { isRevoked: true },
    });

    // Create API key for desktop (no plan check — desktop login always allowed)
    const { key } = await createApiKey(user.id, 'Teki Desktop', 'LIVE');

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') ?? undefined;

    // Log desktop login
    logDataAccess({
      accessorId: user.id,
      accessorType: 'user',
      subjectId: user.id,
      action: 'view',
      dataCategories: ['auth_tokens'],
      details: { method: 'desktop-login', device: 'desktop' },
      justification: 'Login via credenciais (desktop)',
      ipAddress,
      userAgent,
    }).catch(() => {});

    return NextResponse.json({
      apiKey: key,
      email: user.email,
      name: user.displayName ?? user.firstName,
      plan: 'desktop',
    });
  } catch (error) {
    console.error('[desktop-login]', error);
    if ((error as Error).message?.includes('Limite de') || (error as Error).message?.includes('não permite criar API Keys')) {
      return NextResponse.json(
        { error: { code: 'LIMIT_REACHED', message: (error as Error).message } },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } },
      { status: 500 },
    );
  }
}

export const POST = withRequestLog(_POST);
