import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { tenantId: tenant.id, active: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50,
    });

    return NextResponse.json(clients);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/clients error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
