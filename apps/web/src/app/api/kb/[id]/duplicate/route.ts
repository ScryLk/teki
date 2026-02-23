import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

async function generateArticleNumber(userId: string): Promise<string> {
  const lastArticle = await prisma.knowledgeBaseArticle.findFirst({
    where: { userId },
    orderBy: { articleNumber: 'desc' },
    select: { articleNumber: true },
  });

  let nextNum = 1;
  if (lastArticle) {
    const match = lastArticle.articleNumber.match(/KB-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `KB-${String(nextNum).padStart(4, '0')}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const original = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, userId: user.id },
    });
    if (!original) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Artigo nao encontrado.' } },
        { status: 404 }
      );
    }

    const articleNumber = await generateArticleNumber(user.id);

    const duplicate = await prisma.knowledgeBaseArticle.create({
      data: {
        userId: user.id,
        articleNumber,
        title: `${original.title} (copia)`,
        categoryId: original.categoryId,
        subcategory: original.subcategory,
        tags: original.tags,
        softwareName: original.softwareName,
        versionMin: original.versionMin,
        versionMax: original.versionMax,
        modules: original.modules,
        environments: original.environments,
        databases: original.databases,
        problemDescription: original.problemDescription,
        rootCause: original.rootCause,
        solutionSteps: original.solutionSteps,
        solutionType: original.solutionType,
        prevention: original.prevention,
        notes: original.notes,
        errorCodes: original.errorCodes,
        errorMessages: original.errorMessages,
        relatedTables: original.relatedTables,
        relatedConfigs: original.relatedConfigs,
        sqlQueries: original.sqlQueries,
        commands: original.commands,
        aiContextNote: original.aiContextNote,
        priorityWeight: original.priorityWeight,
        visibility: original.visibility,
        status: 'DRAFT',
        createdById: user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
