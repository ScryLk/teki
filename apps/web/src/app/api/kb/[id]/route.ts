import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, userId: user.id },
      include: { category: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Artigo nao encontrado.' } },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Artigo nao encontrado.' } },
        { status: 404 }
      );
    }

    // Validate required fields if provided
    const errors: Record<string, string> = {};
    if (body.title !== undefined && !body.title.trim()) errors.title = 'Titulo e obrigatorio';
    if (body.title && body.title.length > 500) errors.title = 'Titulo deve ter no maximo 500 caracteres';
    if (body.problemDescription !== undefined && body.problemDescription.trim().length < 20) {
      errors.problemDescription = 'Descricao do problema deve ter no minimo 20 caracteres';
    }
    if (body.solutionSteps !== undefined && body.solutionSteps.trim().length < 30) {
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

    // Validate category if being changed
    if (body.categoryId) {
      const category = await prisma.kbCategory.findFirst({
        where: { id: body.categoryId, userId: user.id },
      });
      if (!category) {
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: 'Categoria invalida.' } },
          { status: 400 }
        );
      }
    }

    const article = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.subcategory !== undefined && { subcategory: body.subcategory?.trim() || null }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.softwareName !== undefined && { softwareName: body.softwareName?.trim() || null }),
        ...(body.versionMin !== undefined && { versionMin: body.versionMin?.trim() || null }),
        ...(body.versionMax !== undefined && { versionMax: body.versionMax?.trim() || null }),
        ...(body.modules !== undefined && { modules: body.modules }),
        ...(body.environments !== undefined && { environments: body.environments }),
        ...(body.databases !== undefined && { databases: body.databases }),
        ...(body.problemDescription !== undefined && { problemDescription: body.problemDescription.trim() }),
        ...(body.rootCause !== undefined && { rootCause: body.rootCause?.trim() || null }),
        ...(body.solutionSteps !== undefined && { solutionSteps: body.solutionSteps.trim() }),
        ...(body.solutionType !== undefined && { solutionType: body.solutionType }),
        ...(body.prevention !== undefined && { prevention: body.prevention?.trim() || null }),
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
        ...(body.errorCodes !== undefined && { errorCodes: body.errorCodes }),
        ...(body.errorMessages !== undefined && { errorMessages: body.errorMessages }),
        ...(body.relatedTables !== undefined && { relatedTables: body.relatedTables }),
        ...(body.relatedConfigs !== undefined && { relatedConfigs: body.relatedConfigs }),
        ...(body.sqlQueries !== undefined && { sqlQueries: body.sqlQueries?.trim() || null }),
        ...(body.commands !== undefined && { commands: body.commands?.trim() || null }),
        ...(body.relatedArticleIds !== undefined && { relatedArticleIds: body.relatedArticleIds }),
        ...(body.supersededById !== undefined && { supersededById: body.supersededById || null }),
        ...(body.aiContextNote !== undefined && { aiContextNote: body.aiContextNote?.trim() || null }),
        ...(body.priorityWeight !== undefined && { priorityWeight: body.priorityWeight }),
        ...(body.visibility !== undefined && { visibility: body.visibility }),
        updatedById: user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('PUT /api/kb/[id] error:', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Artigo nao encontrado.' } },
        { status: 404 }
      );
    }

    // Soft delete - set status to ARCHIVED
    await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedById: user.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
