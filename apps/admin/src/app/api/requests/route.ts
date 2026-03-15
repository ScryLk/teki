import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const period = params.get('period') || '7d';

    const daysMap: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
    };
    const days = daysMap[period] || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalRequests,
      successRequests,
      failedRequests,
      recentLogs,
      topEndpoints,
    ] = await Promise.all([
      prisma.httpRequestLog.count({ where: { createdAt: { gte: since } } }),
      prisma.httpRequestLog.count({
        where: {
          createdAt: { gte: since },
          statusCode: { gte: 200, lt: 300 },
        },
      }),
      prisma.httpRequestLog.count({
        where: {
          createdAt: { gte: since },
          statusCode: { gte: 400 },
        },
      }),
      prisma.httpRequestLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        where: { createdAt: { gte: since } },
        select: {
          id: true,
          method: true,
          path: true,
          statusCode: true,
          latencyMs: true,
          createdAt: true,
        },
      }),
      prisma.httpRequestLog.groupBy({
        by: ['path'],
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
        event: `${l.method} ${l.path}`,
        statusCode: l.statusCode,
        url: l.path,
        createdAt: l.createdAt.toISOString(),
        deliveredAt: null,
        latencyMs: l.latencyMs,
      })),
      topEndpoints: topEndpoints.map((e) => ({
        event: e.path,
        count: e._count.id,
      })),
    });
  } catch (error) {
    console.error('[requests API]', error);
    return NextResponse.json(
      { stats: { total: 0, success: 0, failed: 0, successRate: '0' }, logs: [], topEndpoints: [] },
      { status: 200 },
    );
  }
}
