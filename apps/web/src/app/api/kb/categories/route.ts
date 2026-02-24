import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const categories = await prisma.kbCategory.findMany({
      where: { userId: user.id },
      include: { _count: { select: { articles: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        parentId: c.parentId,
        sortOrder: c.sortOrder,
        articleCount: c._count.articles,
      }))
    );
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { name, description, parentId } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.kbCategory.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const category = await prisma.kbCategory.create({
      data: {
        userId: user.id,
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 });
  }
}
