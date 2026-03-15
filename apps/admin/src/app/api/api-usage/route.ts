import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totals, activeKeyCount, topUsers, dailyRaw] = await Promise.all([
      // Aggregated totals for current month
      prisma.apiKeyUsageLog.aggregate({
        where: { period: currentPeriod },
        _sum: { tokensIn: true, tokensOut: true, costUsd: true },
        _count: { id: true },
      }),

      // Active API keys count
      prisma.apiKey.count({ where: { isRevoked: false } }),

      // Top users by token consumption
      prisma.apiKeyUsageLog.groupBy({
        by: ['userId'],
        where: { period: currentPeriod },
        _sum: { tokensIn: true, tokensOut: true, costUsd: true },
        _count: { id: true },
        orderBy: { _sum: { tokensOut: 'desc' } },
        take: 20,
      }),

      // Daily trend (last 30 days) via raw query
      prisma.$queryRaw<Array<{ day: string; requests: bigint; tokens_in: bigint; tokens_out: bigint; cost: number }>>`
        SELECT
          DATE(created_at) as day,
          COUNT(*)::bigint as requests,
          COALESCE(SUM(tokens_in), 0)::bigint as tokens_in,
          COALESCE(SUM(tokens_out), 0)::bigint as tokens_out,
          COALESCE(SUM(cost_usd::numeric), 0)::float as cost
        FROM api_key_usage_logs
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `,
    ]);

    // Enrich top users with email
    const userIds = topUsers.map((u) => u.userId);
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, firstName: true, lastName: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const topUsersEnriched = topUsers.map((u) => {
      const user = userMap.get(u.userId);
      return {
        userId: u.userId,
        email: user?.email ?? 'Desconhecido',
        name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null,
        requests: u._count.id,
        tokensIn: u._sum.tokensIn ?? 0,
        tokensOut: u._sum.tokensOut ?? 0,
        costUsd: Number(u._sum.costUsd ?? 0),
      };
    });

    const dailyTrend = dailyRaw.map((d) => ({
      date: String(d.day).slice(0, 10),
      requests: Number(d.requests),
      tokensIn: Number(d.tokens_in),
      tokensOut: Number(d.tokens_out),
      costUsd: d.cost,
    }));

    return NextResponse.json({
      period: currentPeriod,
      kpis: {
        totalRequests: totals._count.id,
        totalTokensIn: totals._sum.tokensIn ?? 0,
        totalTokensOut: totals._sum.tokensOut ?? 0,
        totalCostUsd: Number(totals._sum.costUsd ?? 0),
        activeKeys: activeKeyCount,
      },
      topUsers: topUsersEnriched,
      dailyTrend,
    });
  } catch (error) {
    console.error('[admin/api-usage]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
