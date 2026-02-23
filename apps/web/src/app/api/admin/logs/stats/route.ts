import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';

export async function GET(req: NextRequest) {
  try {
    await requirePlatformOwner(req);

    const url = req.nextUrl;
    const period = url.searchParams.get('period') ?? 'today';
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');

    // Calculate date range
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'custom':
        startDate = dateFrom ? new Date(dateFrom) : new Date();
        if (dateTo) endDate = new Date(dateTo);
        break;
      default: // today
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    const dateFilter = { gte: startDate, lte: endDate };

    const [
      totalByCategory,
      totalBySeverity,
      topEventTypes,
      topTenants,
    ] = await Promise.all([
      // Count by category
      prisma.platformLog.groupBy({
        by: ['category'],
        where: { createdAt: dateFilter },
        _count: true,
      }),
      // Count by severity
      prisma.platformLog.groupBy({
        by: ['severity'],
        where: { createdAt: dateFilter },
        _count: true,
      }),
      // Top event types
      prisma.platformLog.groupBy({
        by: ['eventType'],
        where: { createdAt: dateFilter },
        _count: true,
        orderBy: { _count: { eventType: 'desc' } },
        take: 10,
      }),
      // Top tenants by activity
      prisma.platformLog.groupBy({
        by: ['tenantId'],
        where: { createdAt: dateFilter, tenantId: { not: null } },
        _count: true,
        orderBy: { _count: { tenantId: 'desc' } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      data: {
        period,
        date_range: { from: startDate.toISOString(), to: endDate.toISOString() },
        by_category: totalByCategory.map((r) => ({
          category: r.category,
          count: r._count,
        })),
        by_severity: totalBySeverity.map((r) => ({
          severity: r.severity,
          count: r._count,
        })),
        top_event_types: topEventTypes.map((r) => ({
          event_type: r.eventType,
          count: r._count,
        })),
        top_tenants: topTenants.map((r) => ({
          tenant_id: r.tenantId,
          count: r._count,
        })),
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
