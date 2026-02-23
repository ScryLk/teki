import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { createKbArticleSchema } from '@/lib/validations/kb';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: tenant.id };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problemDescription: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.knowledgeBaseArticle.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          articleNumber: true,
          title: true,
          category: true,
          subcategory: true,
          softwareName: true,
          solutionType: true,
          tags: true,
          usageCount: true,
          successRate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.knowledgeBaseArticle.count({ where }),
    ]);

    return NextResponse.json({
      data: articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/kb error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const body = await req.json();
    const data = createKbArticleSchema.parse(body);

    // Generate article number
    const lastArticle = await prisma.knowledgeBaseArticle.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { articleNumber: 'desc' },
      select: { articleNumber: true },
    });

    let seq = 1;
    if (lastArticle) {
      const num = parseInt(lastArticle.articleNumber.replace('KB-', ''), 10);
      if (!isNaN(num)) seq = num + 1;
    }
    const articleNumber = `KB-${seq.toString().padStart(4, '0')}`;

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        tenantId: tenant.id,
        articleNumber,
        title: data.title,
        category: data.category,
        subcategory: data.subcategory,
        softwareName: data.softwareName,
        versionMin: data.versionMin,
        versionMax: data.versionMax,
        problemDescription: data.problemDescription,
        solutionSteps: data.solutionSteps,
        solutionType: data.solutionType,
        notes: data.notes,
        tags: data.tags,
        status: data.status,
        createdById: user.id,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('POST /api/kb error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
