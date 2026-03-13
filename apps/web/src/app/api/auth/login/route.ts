import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/services/session.service';
import { logDataAccess } from '@/lib/services/data-access-log.service';

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/auth/login
 * Credential-based login. Returns a session token.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Email e senha sao obrigatorios' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { credentials: true },
    });

    if (!user || user.status !== 'ACTIVE' || !user.credentials) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos' } },
        { status: 401 }
      );
    }

    // Account lockout check
    if (
      user.credentials.lockedUntil &&
      user.credentials.lockedUntil > new Date()
    ) {
      const remainingMs = user.credentials.lockedUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return NextResponse.json(
        {
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Conta bloqueada. Tente novamente em ${remainingMin} minuto${remainingMin > 1 ? 's' : ''}.`,
          },
        },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(password, user.credentials.passwordHash);

    if (!valid) {
      const failedAttempts = user.credentials.failedAttempts + 1;
      await prisma.userCredential.update({
        where: { userId: user.id },
        data: {
          failedAttempts,
          ...(failedAttempts >= LOCKOUT_THRESHOLD
            ? { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) }
            : {}),
        },
      });

      // Log failed login attempt
      logDataAccess({
        accessorId: user.id,
        accessorType: 'system',
        subjectId: user.id,
        action: 'view',
        dataCategories: ['auth_tokens'],
        details: { failedAttempts, locked: failedAttempts >= LOCKOUT_THRESHOLD },
        justification: 'Tentativa de login falha (senha incorreta)',
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: req.headers.get('user-agent') ?? undefined,
      }).catch(() => {});

      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Email ou senha incorretos' } },
        { status: 401 }
      );
    }

    // Reset failed attempts
    await prisma.userCredential.update({
      where: { userId: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const userAgent = req.headers.get('user-agent') ?? undefined;

    const session = await createSession({
      userId: user.id,
      ipAddress,
      userAgent,
    });

    // Log successful login
    logDataAccess({
      accessorId: user.id,
      accessorType: 'user',
      subjectId: user.id,
      action: 'view',
      dataCategories: ['auth_tokens'],
      justification: 'Login via credenciais (web)',
      ipAddress,
      userAgent,
    }).catch(() => {}); // fire-and-forget

    return NextResponse.json({
      sessionToken: session.sessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('[auth/login]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
