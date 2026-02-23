import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import type { KbArticleStatus } from '@prisma/client';

const VALID_STATUSES: KbArticleStatus[] = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    const { status } = await req.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: `Status invalido. Use: ${VALID_STATUSES.join(', ')}` } },
        { status: 400 }
      );
    }

    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Artigo nao encontrado.' } },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedById: user.id,
    };

    // Track reviewer when publishing
    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      updateData.reviewedById = user.id;
      updateData.reviewedAt = new Date();
    }

    const article = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
