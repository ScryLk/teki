import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const tenantId = tenant.id;

    // Total tickets
    const totalTickets = await prisma.ticket.count({ where: { tenantId } });

    // Tickets by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: true,
    });

    // Tickets resolved with AI (have aiResponseJson)
    const resolvedWithAi = await prisma.ticket.count({
      where: { tenantId, aiConfidence: { not: null }, status: { in: ['resolved', 'closed'] } },
    });
    const totalResolved = await prisma.ticket.count({
      where: { tenantId, status: { in: ['resolved', 'closed'] } },
    });

    // AI confidence distribution
    const confidenceDistribution = await prisma.aiUsageLog.groupBy({
      by: ['confidence'],
      where: { tenantId },
      _count: true,
    });

    // AI source distribution
    const sourceDistribution = await prisma.aiUsageLog.groupBy({
      by: ['source'],
      where: { tenantId },
      _count: true,
    });

    // Top 5 KB articles by usage
    const topArticles = await prisma.knowledgeBaseArticle.findMany({
      where: { tenantId, status: 'published' },
      orderBy: { usageCount: 'desc' },
      take: 5,
      select: {
        articleNumber: true,
        title: true,
        category: true,
        usageCount: true,
        successRate: true,
      },
    });

    // Tickets by category
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      where: { tenantId },
      _count: true,
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    });

    // KB articles by category
    const kbByCategory = await prisma.knowledgeBaseArticle.groupBy({
      by: ['category'],
      where: { tenantId, status: 'published' },
      _count: true,
    });

    // Average resolution time (for resolved tickets with both created and resolved timestamps)
    const resolvedTickets = await prisma.ticket.findMany({
      where: { tenantId, status: { in: ['resolved', 'closed'] }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true, aiResponseJson: true },
    });

    let avgResolutionWithAi = 0;
    let avgResolutionWithoutAi = 0;
    let countWithAi = 0;
    let countWithoutAi = 0;

    for (const t of resolvedTickets) {
      if (!t.resolvedAt) continue;
      const hours = (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      if (t.aiResponseJson) {
        avgResolutionWithAi += hours;
        countWithAi++;
      } else {
        avgResolutionWithoutAi += hours;
        countWithoutAi++;
      }
    }

    if (countWithAi > 0) avgResolutionWithAi /= countWithAi;
    if (countWithoutAi > 0) avgResolutionWithoutAi /= countWithoutAi;

    // AI feedback stats
    const feedbackStats = await prisma.aiUsageLog.groupBy({
      by: ['feedback'],
      where: { tenantId, feedback: { not: null } },
      _count: true,
    });

    // Gaps: categories with many tickets but few KB articles
    const ticketCategoryCounts = new Map<string, number>();
    for (const tc of ticketsByCategory) {
      ticketCategoryCounts.set(tc.category, tc._count);
    }
    const kbCategoryCounts = new Map<string, number>();
    for (const kc of kbByCategory) {
      kbCategoryCounts.set(kc.category, kc._count);
    }

    const gaps = Array.from(ticketCategoryCounts.entries())
      .map(([category, ticketCount]) => ({
        category,
        ticketCount,
        articleCount: kbCategoryCounts.get(category) ?? 0,
        ratio: ticketCount / Math.max(kbCategoryCounts.get(category) ?? 0, 1),
      }))
      .filter((g) => g.ratio > 3 || g.articleCount === 0)
      .sort((a, b) => b.ratio - a.ratio);

    return NextResponse.json({
      overview: {
        totalTickets,
        totalResolved,
        resolvedWithAi,
        aiResolutionRate: totalResolved > 0 ? ((resolvedWithAi / totalResolved) * 100).toFixed(1) : 0,
      },
      ticketsByStatus: ticketsByStatus.map((s) => ({
        status: s.status,
        count: s._count,
      })),
      confidenceDistribution: confidenceDistribution.map((c) => ({
        confidence: c.confidence,
        count: c._count,
      })),
      sourceDistribution: sourceDistribution.map((s) => ({
        source: s.source,
        count: s._count,
      })),
      topArticles,
      ticketsByCategory: ticketsByCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      resolutionTime: {
        withAi: Math.round(avgResolutionWithAi * 10) / 10,
        withoutAi: Math.round(avgResolutionWithoutAi * 10) / 10,
      },
      feedbackStats: feedbackStats.map((f) => ({
        feedback: f.feedback,
        count: f._count,
      })),
      gaps,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
