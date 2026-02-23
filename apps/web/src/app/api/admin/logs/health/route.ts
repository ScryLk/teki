import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';

export async function GET(req: NextRequest) {
  try {
    await requirePlatformOwner(req);

    const [
      totalCount,
      categoryBreakdown,
      oldestEntry,
      newestEntry,
    ] = await Promise.all([
      prisma.platformLog.count(),
      prisma.platformLog.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.platformLog.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      }),
      prisma.platformLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    // Check DB connectivity
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    return NextResponse.json({
      data: {
        status: dbStatus,
        total_logs: totalCount,
        by_category: categoryBreakdown.map((r) => ({
          category: r.category,
          count: r._count,
        })),
        oldest_entry: oldestEntry?.createdAt ?? null,
        newest_entry: newestEntry?.createdAt ?? null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
