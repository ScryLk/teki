import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { checkKbAction } from '@/lib/kb/kb-limits';
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

// POST - Save final article (after review)
export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const {
      title,
      content,
      summary,
      categoryId,
      tags,
      status,
      difficulty,
      targetAudience,
      insertionMode,
      aiData,
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Check article limit
    const check = await checkKbAction(user.id, user.planId, 'kb:create_article');
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason, upgradeRequired: check.upgradeRequired },
        { status: 403 }
      );
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await prisma.kbArticle.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Map string values to Prisma enums
    const statusMap: Record<string, 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'> = {
      draft: 'DRAFT',
      published: 'PUBLISHED',
      archived: 'ARCHIVED',
    };
    const difficultyMap: Record<string, 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'> = {
      basic: 'BASIC',
      intermediate: 'INTERMEDIATE',
      advanced: 'ADVANCED',
    };
    const audienceMap: Record<string, 'END_USER' | 'TECHNICIAN' | 'ADMIN'> = {
      end_user: 'END_USER',
      technician: 'TECHNICIAN',
      admin: 'ADMIN',
    };
    const modeMap: Record<string, 'QUICK_ADD' | 'FILE_UPLOAD' | 'FULL_FORM' | 'FROM_CHAT'> = {
      quick_add: 'QUICK_ADD',
      file_upload: 'FILE_UPLOAD',
      full_form: 'FULL_FORM',
      from_chat: 'FROM_CHAT',
    };

    // Create article and insertion log in transaction
    const result = await prisma.$transaction(async (tx) => {
      const article = await tx.kbArticle.create({
        data: {
          userId: user.id,
          categoryId: categoryId || null,
          title: title.trim(),
          slug,
          summary: summary?.trim() || null,
          content: content.trim(),
          status: statusMap[status] ?? 'DRAFT',
          difficulty: difficultyMap[difficulty] ?? 'BASIC',
          targetAudience: audienceMap[targetAudience] ?? 'TECHNICIAN',
          tags: tags ?? [],
          insertionMode: insertionMode ? modeMap[insertionMode] : null,
        },
      });

      // Log insertion
      await tx.kbInsertionLog.create({
        data: {
          userId: user.id,
          articleId: article.id,
          insertionMode: modeMap[insertionMode] ?? 'FULL_FORM',
          originalInput: body.originalInput ?? null,
          aiProvider: aiData?.provider ?? null,
          aiModel: aiData?.model ?? null,
          aiSuggestions: aiData?.suggestions ?? null,
          aiTokensUsed: aiData?.tokensUsed ?? null,
          aiLatencyMs: aiData?.latencyMs ?? null,
          fieldsAutoFilled: aiData?.fieldsAutoFilled ?? 0,
          fieldsUserEdited: aiData?.fieldsUserEdited ?? 0,
          userEdits: aiData?.userEdits ?? null,
          status: 'completed',
        },
      });

      return article;
    });

    return NextResponse.json(
      { id: result.id, slug: result.slug, status: result.status },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/kb/articles error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao salvar artigo' },
      { status: 500 }
    );
  }
}

// GET - List articles
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

    const where: Record<string, unknown> = { userId: user.id };
    if (status) {
      const statusMap: Record<string, string> = { draft: 'DRAFT', published: 'PUBLISHED', archived: 'ARCHIVED' };
      where.status = statusMap[status] ?? status;
    }
    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.kbArticle.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.kbArticle.count({ where }),
    ]);

    return NextResponse.json({
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        status: a.status.toLowerCase(),
        difficulty: a.difficulty.toLowerCase(),
        targetAudience: a.targetAudience.toLowerCase(),
        categoryName: a.category?.name ?? null,
        categoryId: a.categoryId,
        tags: a.tags,
        insertionMode: a.insertionMode?.toLowerCase() ?? null,
        viewCount: a.viewCount,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/kb/articles error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao listar artigos' },
      { status: 500 }
    );
  }
}
