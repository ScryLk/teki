import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { cancelSubscription } from '@/lib/mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    if (!user.mpPreapprovalId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nenhuma assinatura ativa.' } },
        { status: 400 }
      );
    }

    await cancelSubscription(user.mpPreapprovalId);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        planId: 'FREE',
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
