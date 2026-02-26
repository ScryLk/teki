import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '0');
  const limit = Math.min(parseInt(params.get('limit') || '25'), 100);
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const sortBy = params.get('sortBy') || 'createdAt';
  const sortDir = (params.get('sortDir') || 'desc') as 'asc' | 'desc';

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      take: limit,
      skip: page * limit,
      orderBy: { [sortBy]: sortDir },
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        status: true,
        emailVerified: true,
        phone: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            memberships: true,
            createdConversations: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
      createdAt: u.createdAt.toISOString(),
      tenantCount: u._count.memberships,
      conversationCount: u._count.createdConversations,
    })),
    total,
    page,
    pageSize: limit,
  });
}
