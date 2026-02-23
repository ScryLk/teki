import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { DEFAULT_CATEGORIES } from '@/lib/kb/types';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    let categories = await prisma.kbCategory.findMany({
      where: { userId: user.id },
      orderBy: { displayOrder: 'asc' },
    });

    // Seed default categories if none exist
    if (categories.length === 0) {
      await prisma.kbCategory.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          userId: user.id,
          ...cat,
        })),
      });
      categories = await prisma.kbCategory.findMany({
        where: { userId: user.id },
        orderBy: { displayOrder: 'asc' },
      });
    }

    return NextResponse.json(categories);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { name, slug, icon, color, description, displayOrder } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'name e slug sao obrigatorios.' } },
        { status: 400 }
      );
    }

    const existing = await prisma.kbCategory.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (existing) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Categoria com este slug ja existe.' } },
        { status: 409 }
      );
    }

    const category = await prisma.kbCategory.create({
      data: {
        userId: user.id,
        name,
        slug,
        icon: icon || null,
        color: color || null,
        description: description || null,
        displayOrder: displayOrder ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
