import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { cancelSubscription } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Find the user's primary tenant
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: {
        tenant: {
          select: { id: true, mpPreapprovalId: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership?.tenant.mpPreapprovalId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nenhuma assinatura ativa.' } },
        { status: 400 }
      );
    }

    await cancelSubscription(membership.tenant.mpPreapprovalId);

    // Update tenant (not user) — plan is on tenant
    await prisma.tenant.update({
      where: { id: membership.tenant.id },
      data: {
        plan: 'FREE',
        mpPreapprovalId: null,
        planExpiresAt: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Assinatura cancelada.' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[billing cancel]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
