import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { updateKbArticleSchema } from '@/lib/validations/kb';
import { ZodError } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const article = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/kb/[id] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const body = await req.json();
    const data = updateKbArticleSchema.parse(body);

    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    // If publishing, set reviewer
    const extraData: Record<string, unknown> = {};
    if (data.status === 'published' && existing.status !== 'published') {
      extraData.reviewedById = user.id;
    }

    const article = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: { ...data, ...extraData },
    });

    return NextResponse.json(article);
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
    console.error('PUT /api/kb/[id] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const existing = await prisma.knowledgeBaseArticle.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 });
    }

    await prisma.knowledgeBaseArticle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('DELETE /api/kb/[id] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
