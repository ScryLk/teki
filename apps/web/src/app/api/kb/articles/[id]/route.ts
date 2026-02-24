import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const article = await prisma.kbArticle.findFirst({
      where: { id, userId: user.id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSizeBytes: true,
            isSourceFile: true,
            createdAt: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    // Increment view count
    await prisma.kbArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.kbArticle.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    const statusMap: Record<string, 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'> = {
      draft: 'DRAFT', published: 'PUBLISHED', archived: 'ARCHIVED',
    };
    const difficultyMap: Record<string, 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'> = {
      basic: 'BASIC', intermediate: 'INTERMEDIATE', advanced: 'ADVANCED',
    };
    const audienceMap: Record<string, 'END_USER' | 'TECHNICIAN' | 'ADMIN'> = {
      end_user: 'END_USER', technician: 'TECHNICIAN', admin: 'ADMIN',
    };

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.summary !== undefined) data.summary = body.summary?.trim() || null;
    if (body.content !== undefined) data.content = body.content.trim();
    if (body.categoryId !== undefined) data.categoryId = body.categoryId || null;
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.status !== undefined) data.status = statusMap[body.status] ?? existing.status;
    if (body.difficulty !== undefined) data.difficulty = difficultyMap[body.difficulty] ?? existing.difficulty;
    if (body.targetAudience !== undefined) data.targetAudience = audienceMap[body.targetAudience] ?? existing.targetAudience;

    const updated = await prisma.kbArticle.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar artigo' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const existing = await prisma.kbArticle.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
    }

    await prisma.kbArticle.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao excluir artigo' }, { status: 500 });
  }
}
