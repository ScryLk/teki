import { prisma } from '@/lib/prisma';
import { MODEL_REGISTRY } from './model-registry';
import type { SystemOverview, TimeSeriesData } from './types';

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function calcGrowth(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

/**
 * Returns system overview metrics.
 */
export async function getOverview(): Promise<SystemOverview> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersToday,
    usersThisMonth,
    usersLast30d,
    activeUsersWeekly,
    totalTenants,
    activeTenants,
    planDistribution,
    totalConversations,
    conversationsToday,
    totalMessages,
    messagesToday,
    aiMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: last30d } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: last7d } } }),
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.groupBy({ by: ['plan'], _count: true }),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { createdAt: { gte: today } } }),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: today } } }),
    prisma.message.count({ where: { isAiGenerated: true } }),
  ]);

  // AI usage totals
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalCostUsd = 0;

  try {
    const aiAgg = await prisma.messageAiMetadata.aggregate({
      _sum: { tokensInput: true, tokensOutput: true },
    });
    totalTokensIn = aiAgg._sum.tokensInput || 0;
    totalTokensOut = aiAgg._sum.tokensOutput || 0;
  } catch {
    // Table may not have data
  }

  try {
    const costAgg = await prisma.aiUsageDaily.aggregate({
      _sum: { costUsd: true },
    });
    totalCostUsd = Number(costAgg._sum.costUsd || 0);
  } catch {
    // Table may not have data
  }

  return {
    users: {
      total: totalUsers,
      today: usersToday,
      thisMonth: usersThisMonth,
      last30d: usersLast30d,
      activeWeekly: activeUsersWeekly,
    },
    tenants: {
      total: totalTenants,
      active: activeTenants,
      plans: Object.fromEntries(
        planDistribution.map((p) => [p.plan, p._count])
      ),
    },
    conversations: {
      total: totalConversations,
      today: conversationsToday,
    },
    messages: {
      total: totalMessages,
      today: messagesToday,
      aiGenerated: aiMessages,
    },
    ai: {
      totalTokensIn,
      totalTokensOut,
      totalCostUsd,
    },
    generatedAt: now.toISOString(),
  };
}

/**
 * Returns time series data for charts.
 */
export async function getTimeSeries(
  metric: string,
  period: string,
): Promise<TimeSeriesData[]> {
  const days =
    period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  let tableName: string;
  let dateField: string;
  let whereClause: string = '';

  switch (metric) {
    case 'new_users':
      tableName = 'users';
      dateField = 'created_at';
      break;
    case 'new_tenants':
      tableName = 'tenants';
      dateField = 'created_at';
      break;
    case 'conversations':
      tableName = 'conversations';
      dateField = 'created_at';
      break;
    case 'messages':
      tableName = 'messages';
      dateField = 'created_at';
      break;
    case 'ai_messages':
      tableName = 'messages';
      dateField = 'created_at';
      whereClause = 'AND is_ai_generated = true';
      break;
    default:
      throw new Error('INVALID_METRIC');
  }

  const result = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
    `SELECT DATE(${dateField}) as date, COUNT(*) as count
     FROM ${tableName}
     WHERE ${dateField} >= $1 ${whereClause}
     GROUP BY DATE(${dateField})
     ORDER BY date ASC`,
    startDate
  );

  return result.map((r) => ({
    date: String(r.date),
    value: Number(r.count),
  }));
}

/**
 * Returns record counts per registered model.
 */
export async function getTableStats(): Promise<
  Array<{ model: string; displayName: string; count: number }>
> {
  const results = [];

  for (const config of MODEL_REGISTRY) {
    try {
      const delegate = (prisma as Record<string, unknown>)[
        toCamelCase(config.prismaModel)
      ] as Record<string, Function>;
      if (!delegate?.count) continue;

      const count = await delegate.count();
      results.push({
        model: config.prismaModel,
        displayName: config.displayName,
        count: count as number,
      });
    } catch {
      results.push({
        model: config.prismaModel,
        displayName: config.displayName,
        count: 0,
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}
