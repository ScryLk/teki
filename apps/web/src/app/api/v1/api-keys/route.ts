import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createApiKey } from '@/lib/api-keys';
import { getPlan } from '@/lib/plans';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const period = new Date().toISOString().slice(0, 7);

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        type: true,
        lastUsedAt: true,
        expiresAt: true,
        isRevoked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const plan = getPlan(user.planId);

    const result = keys.map((k) => ({
      ...k,
      monthlyUsage: { requests: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 },
    }));

    return NextResponse.json({ keys: result, planLimit: plan.features.apiKeys });
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
    const { name, type = 'LIVE', expiresAt } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'name obrigatório.' } },
        { status: 400 }
      );
    }

    if (type !== 'LIVE' && type !== 'TEST') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'type deve ser LIVE ou TEST.' } },
        { status: 400 }
      );
    }

    const expiryDate = expiresAt ? new Date(expiresAt) : undefined;

    const result = await createApiKey(user.id, name, type, user.planId, expiryDate);

    return NextResponse.json(
      {
        id: result.id,
        key: result.key,
        message: 'Guarde esta chave — ela não será exibida novamente.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    if (error instanceof Error && (error.message.includes('Limite') || error.message.includes('plano'))) {
      return NextResponse.json(
        { error: { code: 'PLAN_LIMIT_REACHED', message: error.message } },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
