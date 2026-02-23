import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { saveProviderKey } from '@/lib/provider-keys';
import { prisma } from '@/lib/prisma';
import { getPlanLimits } from '@/lib/plan-limits';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const keys = await prisma.providerKey.findMany({
      where: { userId: user.id },
      select: {
        provider: true,
        status: true,
        lastValidatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(keys);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const limits = getPlanLimits(user.planId);
    if (!limits.allowBYOK) {
      return NextResponse.json(
        { error: { code: 'PLAN_LIMIT_REACHED', message: 'BYOK requer plano Pro ou superior.' } },
        { status: 403 }
      );
    }

    const { provider, key } = await req.json();

    if (!provider || !key) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'provider e key obrigatórios.' } },
        { status: 400 }
      );
    }

    const validProviders = ['gemini', 'openai', 'anthropic', 'ollama'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: `Provider inválido. Use: ${validProviders.join(', ')}` } },
        { status: 400 }
      );
    }

    await saveProviderKey(user.id, provider, key);

    return NextResponse.json(
      { success: true, provider, status: 'valid' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
