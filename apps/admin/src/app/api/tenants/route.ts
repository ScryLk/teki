import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '0');
  const limit = Math.min(parseInt(params.get('limit') || '25'), 100);
  const search = params.get('search') || '';
  const plan = params.get('plan') || '';
  const status = params.get('status') || '';

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (plan) where.plan = plan;
  if (status) where.status = status;

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      take: limit,
      skip: page * limit,
      orderBy: { createdAt: 'desc' },
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        plan: true,
        status: true,
        country: true,
        createdAt: true,
        planExpiresAt: true,
        _count: {
          select: {
            members: true,
            conversations: true,
          },
        },
      },
    }),
    prisma.tenant.count({ where }),
  ]);

  return NextResponse.json({
    tenants: tenants.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      planExpiresAt: t.planExpiresAt?.toISOString() ?? null,
      memberCount: t._count.members,
      conversationCount: t._count.conversations,
    })),
    total,
    page,
    pageSize: limit,
  });
}
