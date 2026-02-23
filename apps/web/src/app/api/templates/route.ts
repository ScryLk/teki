import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { createTemplateFieldSchema } from '@/lib/validations/templates';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const templates = await prisma.categoryTemplate.findMany({
      where: { tenantId: tenant.id, active: true },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    // Group by category and return unique categories with field counts
    const categoryMap = new Map<string, { category: string; fieldCount: number; subcategories: string[] }>();

    for (const t of templates) {
      const existing = categoryMap.get(t.category);
      if (existing) {
        existing.fieldCount++;
        if (t.subcategory && !existing.subcategories.includes(t.subcategory)) {
          existing.subcategories.push(t.subcategory);
        }
      } else {
        categoryMap.set(t.category, {
          category: t.category,
          fieldCount: 1,
          subcategories: t.subcategory ? [t.subcategory] : [],
        });
      }
    }

    return NextResponse.json(Array.from(categoryMap.values()));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/templates error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const body = await req.json();
    const data = createTemplateFieldSchema.parse(body);

    // Check max 20 fields per category
    const fieldCount = await prisma.categoryTemplate.count({
      where: { tenantId: tenant.id, category: data.category, active: true },
    });
    if (fieldCount >= 20) {
      return NextResponse.json(
        { error: 'Máximo de 20 campos por categoria atingido.' },
        { status: 400 }
      );
    }

    const template = await prisma.categoryTemplate.create({
      data: {
        tenantId: tenant.id,
        category: data.category,
        subcategory: data.subcategory,
        fieldKey: data.fieldKey,
        fieldLabel: data.fieldLabel,
        fieldType: data.fieldType,
        fieldOptions: data.fieldOptions ?? undefined,
        placeholder: data.placeholder,
        required: data.required,
        aiWeight: data.aiWeight,
        displayOrder: data.displayOrder,
        active: data.active,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 });
    }
    // Unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Já existe um campo com essa chave nesta categoria.' },
        { status: 409 }
      );
    }
    console.error('POST /api/templates error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do template é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.categoryTemplate.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Template não encontrado.' }, { status: 404 });
    }

    const template = await prisma.categoryTemplate.update({
      where: { id },
      data: {
        fieldLabel: updateData.fieldLabel,
        fieldType: updateData.fieldType,
        fieldOptions: updateData.fieldOptions,
        placeholder: updateData.placeholder,
        required: updateData.required,
        aiWeight: updateData.aiWeight,
        displayOrder: updateData.displayOrder,
        active: updateData.active,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('PUT /api/templates error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do template é obrigatório.' }, { status: 400 });
    }

    const existing = await prisma.categoryTemplate.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Template não encontrado.' }, { status: 404 });
    }

    await prisma.categoryTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('DELETE /api/templates error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
