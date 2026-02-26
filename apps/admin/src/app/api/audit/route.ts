import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '0');
  const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
  const action = params.get('action') || '';

  const where: Record<string, unknown> = {};
  if (action) where.action = action;

  // Use DataAccessLog as the audit trail (tracks all data access)
  const [logs, total] = await Promise.all([
    prisma.dataAccessLog.findMany({
      take: limit,
      skip: page * limit,
      orderBy: { createdAt: 'desc' },
      where,
      select: {
        id: true,
        accessorId: true,
        accessorType: true,
        accessorTenantId: true,
        subjectId: true,
        action: true,
        dataCategories: true,
        details: true,
        legalBasis: true,
        justification: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    }),
    prisma.dataAccessLog.count({ where }),
  ]);

  return NextResponse.json({
    logs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize: limit,
  });
}
