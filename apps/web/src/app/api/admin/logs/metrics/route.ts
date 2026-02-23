import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';

export async function GET(req: NextRequest) {
  try {
    await requirePlatformOwner(req);

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const dateFilter = { gte: last24h };

    const [
      auditCount,
      aiCount,
      securityCount,
      errorCount,
      totalRequestsToday,
      activeTenants,
      aiLogs,
      avgLatency,
    ] = await Promise.all([
      // Audit logs last 24h
      prisma.platformLog.count({
        where: { category: 'AUDIT', createdAt: dateFilter },
      }),
      // AI logs last 24h
      prisma.platformLog.count({
        where: { category: 'AI', createdAt: dateFilter },
      }),
      // Security events last 24h
      prisma.platformLog.count({
        where: { category: 'SECURITY', createdAt: dateFilter },
      }),
      // Errors last 24h
      prisma.platformLog.count({
        where: {
          severity: { in: ['ERROR', 'CRITICAL'] },
          createdAt: dateFilter,
        },
      }),
      // Total requests today
      prisma.platformLog.count({
        where: {
          eventType: 'api.request',
          createdAt: { gte: todayStart },
        },
      }),
      // Active tenants (distinct) last 24h
      prisma.platformLog.groupBy({
        by: ['tenantId'],
        where: { tenantId: { not: null }, createdAt: dateFilter },
      }),
      // AI logs with cost details
      prisma.platformLog.findMany({
        where: {
          category: 'AI',
          createdAt: { gte: todayStart },
        },
        select: { details: true },
      }),
      // Average latency from AI logs last 24h
      prisma.platformLog.aggregate({
        where: {
          category: 'AI',
          createdAt: dateFilter,
          durationMs: { not: null },
        },
        _avg: { durationMs: true },
      }),
    ]);

    // Calculate total AI cost today
    let aiCostToday = 0;
    for (const log of aiLogs) {
      const details = log.details as Record<string, unknown> | null;
      if (details && typeof details.cost_usd === 'number') {
        aiCostToday += details.cost_usd;
      }
    }

    return NextResponse.json({
      data: {
        audit_count_24h: auditCount,
        ai_count_24h: aiCount,
        security_count_24h: securityCount,
        error_count_24h: errorCount,
        ai_cost_today_usd: Math.round(aiCostToday * 100) / 100,
        avg_latency_ms: Math.round(avgLatency._avg.durationMs ?? 0),
        active_tenants_24h: activeTenants.length,
        total_requests_today: totalRequestsToday,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
