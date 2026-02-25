import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = params.get('period') || '7d';

  const daysMap: Record<string, number> = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
  };
  const days = daysMap[period] || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Use webhook logs as a proxy for HTTP request tracking
  const [
    totalRequests,
    successRequests,
    failedRequests,
    recentLogs,
    topEndpoints,
  ] = await Promise.all([
    prisma.webhookLog.count({ where: { createdAt: { gte: since } } }),
    prisma.webhookLog.count({
      where: {
        createdAt: { gte: since },
        statusCode: { gte: 200, lt: 300 },
      },
    }),
    prisma.webhookLog.count({
      where: {
        createdAt: { gte: since },
        OR: [{ statusCode: { gte: 400 } }, { statusCode: null }],
      },
    }),
    prisma.webhookLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        event: true,
        statusCode: true,
        createdAt: true,
        deliveredAt: true,
        endpoint: {
          select: { url: true, userId: true },
        },
      },
    }),
    prisma.webhookLog.groupBy({
      by: ['event'],
      _count: { id: true },
      where: { createdAt: { gte: since } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    stats: {
      total: totalRequests,
      success: successRequests,
      failed: failedRequests,
      successRate:
        totalRequests > 0
          ? ((successRequests / totalRequests) * 100).toFixed(1)
          : '0',
    },
    logs: recentLogs.map((l) => ({
      id: l.id,
      event: l.event,
      statusCode: l.statusCode,
      url: l.endpoint.url,
      createdAt: l.createdAt.toISOString(),
      deliveredAt: l.deliveredAt?.toISOString() ?? null,
      latencyMs: l.deliveredAt
        ? l.deliveredAt.getTime() - l.createdAt.getTime()
        : null,
    })),
    topEndpoints: topEndpoints.map((e) => ({
      event: e.event,
      count: e._count.id,
    })),
  });
}
