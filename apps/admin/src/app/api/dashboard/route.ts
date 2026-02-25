import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    newUsersToday,
    newUsersLast7d,
    totalTenants,
    activeTenants,
    totalConversations,
    conversationsToday,
    totalMessages,
    messagesToday,
    planDistribution,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.conversation.count(),
    prisma.conversation.count({ where: { createdAt: { gte: today } } }),
    prisma.message.count(),
    prisma.message.count({ where: { createdAt: { gte: today } } }),
    prisma.tenant.groupBy({
      by: ['plan'],
      _count: { id: true },
      where: { status: 'ACTIVE' },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  // Message trend (last 30 days)
  const messageTrend = await prisma.$queryRaw<
    { date: string; count: bigint }[]
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM messages
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  // User signups trend (last 30 days)
  const signupTrend = await prisma.$queryRaw<
    { date: string; count: bigint }[]
  >`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at >= ${thirtyDaysAgo}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  return NextResponse.json({
    kpis: {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersLast7d,
      totalTenants,
      activeTenants,
      totalConversations,
      conversationsToday,
      totalMessages,
      messagesToday,
    },
    planDistribution: planDistribution.map((p) => ({
      plan: p.plan,
      count: p._count.id,
    })),
    recentActivity: recentActivity.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    messageTrend: messageTrend.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
    signupTrend: signupTrend.map((r) => ({
      date: String(r.date),
      count: Number(r.count),
    })),
  });
}
