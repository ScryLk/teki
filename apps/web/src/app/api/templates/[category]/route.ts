import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { category } = await params;

    const fields = await prisma.categoryTemplate.findMany({
      where: {
        tenantId: tenant.id,
        category: decodeURIComponent(category),
        active: true,
      },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        fieldKey: true,
        fieldLabel: true,
        fieldType: true,
        fieldOptions: true,
        placeholder: true,
        required: true,
        aiWeight: true,
        displayOrder: true,
        subcategory: true,
      },
    });

    return NextResponse.json(fields);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/templates/[category] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
