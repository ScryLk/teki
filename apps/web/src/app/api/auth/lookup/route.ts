import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/lookup
 * Email-first flow: determines which auth step the user should see next.
 *
 * Returns:
 *   { action: 'login' }    — existing user with password/OAuth credentials
 *   { action: 'register' } — email not found, go to signup
 *   { action: 'invite' }   — user has a pending tenant invitation
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Email e obrigatorio' } },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        status: true,
        credentials: { select: { id: true } },
        authProviders: {
          select: { provider: true },
          take: 5,
        },
        memberships: {
          where: { status: 'INVITED' },
          select: {
            id: true,
            tenant: { select: { name: true } },
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ action: 'register' });
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: { code: 'ACCOUNT_SUSPENDED', message: 'Conta suspensa. Entre em contato com o suporte.' } },
        { status: 403 }
      );
    }

    if (user.status === 'ANONYMIZED') {
      return NextResponse.json({ action: 'register' });
    }

    // 2. Check for pending invites
    if (user.memberships.length > 0) {
      return NextResponse.json({
        action: 'invite',
        tenantName: user.memberships[0].tenant.name,
      });
    }

    // 3. Existing active user — return login with available providers
    const providers = user.authProviders.map((p) => p.provider.toLowerCase());

    return NextResponse.json({
      action: 'login',
      hasPassword: !!user.credentials,
      providers,
    });
  } catch (error) {
    console.error('[auth/lookup]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
      { status: 500 }
    );
  }
}
