import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlan } from '@/lib/plans';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const period = new Date().toISOString().slice(0, 7);

    const agg = await prisma.apiKeyUsageLog.aggregate({
      where: { userId: user.id, period },
      _sum: { tokensIn: true, tokensOut: true, costUsd: true },
      _count: { id: true },
    });

    const plan = getPlan(user.planId);
    const activeKeys = await prisma.apiKey.count({
      where: { userId: user.id, isRevoked: false },
    });

    return NextResponse.json({
      period,
      totalRequests: agg._count.id,
      totalTokensIn: agg._sum.tokensIn ?? 0,
      totalTokensOut: agg._sum.tokensOut ?? 0,
      totalCostUsd: Number(agg._sum.costUsd ?? 0),
      activeKeys,
      keyLimit: plan.features.apiKeys,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
