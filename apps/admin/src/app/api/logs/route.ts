import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const page = parseInt(params.get('page') || '0');
    const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
    const level = params.get('level'); // INFO, WARN, ERROR
    const search = params.get('search');
    const tenantId = params.get('tenantId');

    // Use DataAccessLog as a general log source
    const where: Record<string, unknown> = {};

    if (level) {
      where.action = level === 'ERROR' ? 'DELETE' : level === 'WARN' ? 'MODIFY' : 'VIEW';
    }
    if (search) {
      where.OR = [
        { justification: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tenantId) {
      where.accessorTenantId = tenantId;
    }

    const [logs, total] = await Promise.all([
      prisma.dataAccessLog.findMany({
        take: limit,
        skip: page * limit,
        orderBy: { createdAt: 'desc' },
        where,
      }),
      prisma.dataAccessLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        accessorType: l.accessorType,
        accessorId: l.accessorId,
        subjectId: l.subjectId,
        dataCategories: l.dataCategories,
        legalBasis: l.legalBasis,
        justification: l.justification,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('[logs API]', error);
    return NextResponse.json({ logs: [], total: 0, page: 0, pageSize: 50 });
  }
}
