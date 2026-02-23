import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      articles,
      topUsed,
      categoryCountsRaw,
    ] = await Promise.all([
      prisma.knowledgeBaseArticle.count({ where: { userId: user.id } }),
      prisma.knowledgeBaseArticle.count({ where: { userId: user.id, status: 'PUBLISHED' } }),
      prisma.knowledgeBaseArticle.count({ where: { userId: user.id, status: 'DRAFT' } }),
      prisma.knowledgeBaseArticle.findMany({
        where: { userId: user.id, usageCount: { gt: 0 } },
        select: { successRate: true },
      }),
      prisma.knowledgeBaseArticle.findMany({
        where: { userId: user.id, usageCount: { gt: 0 } },
        orderBy: { usageCount: 'desc' },
        take: 5,
        select: { id: true, title: true, articleNumber: true, usageCount: true },
      }),
      prisma.knowledgeBaseArticle.groupBy({
        by: ['categoryId'],
        where: { userId: user.id },
        _count: { id: true },
      }),
    ]);

    // Calculate average success rate
    const avgSuccessRate = articles.length > 0
      ? articles.reduce((sum, a) => sum + a.successRate, 0) / articles.length
      : 0;

    // Get category names
    const categoryIds = categoryCountsRaw.map((c) => c.categoryId);
    const categories = await prisma.kbCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryCounts = categoryCountsRaw.map((c) => ({
      categoryId: c.categoryId,
      name: categories.find((cat) => cat.id === c.categoryId)?.name || 'Desconhecida',
      count: c._count.id,
    }));

    return NextResponse.json({
      totalArticles,
      publishedArticles,
      draftArticles,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      topUsedArticles: topUsed,
      categoryCounts,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('GET /api/kb/stats error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
