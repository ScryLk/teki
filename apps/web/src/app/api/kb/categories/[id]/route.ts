import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    const { name, slug, icon, color, description, displayOrder, active } = await req.json();

    const category = await prisma.kbCategory.findFirst({
      where: { id, userId: user.id },
    });
    if (!category) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Categoria nao encontrada.' } },
        { status: 404 }
      );
    }

    const updated = await prisma.kbCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
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

    const category = await prisma.kbCategory.findFirst({
      where: { id, userId: user.id },
    });
    if (!category) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Categoria nao encontrada.' } },
        { status: 404 }
      );
    }

    // Check if category has articles
    const articleCount = await prisma.knowledgeBaseArticle.count({
      where: { categoryId: id },
    });
    if (articleCount > 0) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: `Categoria possui ${articleCount} artigo(s). Mova-os antes de excluir.` } },
        { status: 409 }
      );
    }

    await prisma.kbCategory.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
