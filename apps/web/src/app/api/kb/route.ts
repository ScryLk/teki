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

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const softwareName = searchParams.get('softwareName');
    const search = searchParams.get('q');

    const where: Record<string, unknown> = { userId: user.id };

    if (status) {
      where.status = status;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (softwareName) {
      where.softwareName = softwareName;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problemDescription: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
        { errorCodes: { has: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.knowledgeBaseArticle.count({ where }),
    ]);

    return NextResponse.json({
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('GET /api/kb error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!body.title?.trim()) errors.title = 'Titulo e obrigatorio';
    if (body.title && body.title.length > 500) errors.title = 'Titulo deve ter no maximo 500 caracteres';
    if (!body.categoryId) errors.categoryId = 'Categoria e obrigatoria';
    if (!body.problemDescription?.trim() || body.problemDescription.trim().length < 20) {
      errors.problemDescription = 'Descricao do problema deve ter no minimo 20 caracteres';
    }
    if (!body.solutionSteps?.trim() || body.solutionSteps.trim().length < 30) {
      errors.solutionSteps = 'Passos de solucao devem ter no minimo 30 caracteres';
    }
    if (body.priorityWeight !== undefined && (body.priorityWeight < 1 || body.priorityWeight > 100)) {
      errors.priorityWeight = 'Peso de prioridade deve ser entre 1 e 100';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Erro de validacao', details: errors } },
        { status: 400 }
      );
    }

    // Validate category belongs to user
    const category = await prisma.kbCategory.findFirst({
      where: { id: body.categoryId, userId: user.id },
    });
    if (!category) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Categoria invalida.' } },
        { status: 400 }
      );
    }

    const articleNumber = await generateArticleNumber(user.id);

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        userId: user.id,
        articleNumber,
        title: body.title.trim(),
        categoryId: body.categoryId,
        subcategory: body.subcategory?.trim() || null,
        tags: body.tags || [],
        softwareName: body.softwareName?.trim() || null,
        versionMin: body.versionMin?.trim() || null,
        versionMax: body.versionMax?.trim() || null,
        modules: body.modules || [],
        environments: body.environments || [],
        databases: body.databases || [],
        problemDescription: body.problemDescription.trim(),
        rootCause: body.rootCause?.trim() || null,
        solutionSteps: body.solutionSteps.trim(),
        solutionType: body.solutionType || 'PERMANENT_FIX',
        prevention: body.prevention?.trim() || null,
        notes: body.notes?.trim() || null,
        errorCodes: body.errorCodes || [],
        errorMessages: body.errorMessages || [],
        relatedTables: body.relatedTables || [],
        relatedConfigs: body.relatedConfigs || [],
        sqlQueries: body.sqlQueries?.trim() || null,
        commands: body.commands?.trim() || null,
        relatedArticleIds: body.relatedArticleIds || [],
        supersededById: body.supersededById || null,
        aiContextNote: body.aiContextNote?.trim() || null,
        priorityWeight: body.priorityWeight ?? 50,
        status: body.status || 'DRAFT',
        visibility: body.visibility || 'AI_AND_AGENTS',
        createdById: user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('POST /api/kb error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
