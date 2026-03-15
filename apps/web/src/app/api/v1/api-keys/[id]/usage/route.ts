import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    // Verify key belongs to user
    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Chave não encontrada.' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') ?? new Date().toISOString().slice(0, 7);

    const logs = await prisma.apiKeyUsageLog.findMany({
      where: { apiKeyId: id, period },
      select: {
        tokensIn: true,
        tokensOut: true,
        costUsd: true,
        latencyMs: true,
        modelId: true,
        endpoint: true,
        statusCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // Aggregate by day
    const dailyMap = new Map<string, { requests: number; tokensIn: number; tokensOut: number; costUsd: number }>();
    let totalRequests = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;
    let totalCostUsd = 0;

    for (const log of logs) {
      const date = log.createdAt.toISOString().slice(0, 10);
      const day = dailyMap.get(date) ?? { requests: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 };
      day.requests += 1;
      day.tokensIn += log.tokensIn;
      day.tokensOut += log.tokensOut;
      day.costUsd += Number(log.costUsd);
      dailyMap.set(date, day);

      totalRequests += 1;
      totalTokensIn += log.tokensIn;
      totalTokensOut += log.tokensOut;
      totalCostUsd += Number(log.costUsd);
    }

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      period,
      totalRequests,
      totalTokensIn,
      totalTokensOut,
      totalCostUsd,
      dailyBreakdown,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
