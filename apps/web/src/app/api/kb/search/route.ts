import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('category');
    const softwareName = searchParams.get('software');
    const errorCode = searchParams.get('error_code');
    const status = searchParams.get('status');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const where: Record<string, unknown> = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (softwareName) {
      where.softwareName = softwareName;
    }
    if (errorCode) {
      where.errorCodes = { has: errorCode };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { problemDescription: { contains: q, mode: 'insensitive' } },
        { solutionSteps: { contains: q, mode: 'insensitive' } },
        { rootCause: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
        { errorCodes: { has: q } },
        { errorMessages: { has: q } },
        { articleNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      include: { category: true },
      orderBy: [
        { priorityWeight: 'desc' },
        { usageCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json(articles);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('GET /api/kb/search error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
