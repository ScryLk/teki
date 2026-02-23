import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const url = new URL(req.url);
    const period = url.searchParams.get('period') ?? 'month';
    const now = new Date();
    let startDate: Date;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const logs = await prisma.aiUsageLog.groupBy({
      by: ['providerId'],
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      _sum: {
        tokensIn: true,
        tokensOut: true,
        costUsd: true,
      },
      _count: {
        id: true,
      },
    });

    const usage = logs.map((l) => ({
      providerId: l.providerId,
      requests: l._count.id,
      tokensIn: l._sum.tokensIn ?? 0,
      tokensOut: l._sum.tokensOut ?? 0,
      costUsd: Math.round((l._sum.costUsd ?? 0) * 10000) / 10000,
    }));

    const total = {
      requests: usage.reduce((sum, u) => sum + u.requests, 0),
      tokensIn: usage.reduce((sum, u) => sum + u.tokensIn, 0),
      tokensOut: usage.reduce((sum, u) => sum + u.tokensOut, 0),
      costUsd: Math.round(usage.reduce((sum, u) => sum + u.costUsd, 0) * 10000) / 10000,
    };

    return NextResponse.json({ usage, total, period, startDate: startDate.toISOString() });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
