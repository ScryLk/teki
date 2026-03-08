import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const billingId = req.nextUrl.searchParams.get('billingId');

    if (!billingId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'billingId obrigatorio.' } },
        { status: 400 }
      );
    }

    // Check if the webhook already processed the payment
    const tenant = await prisma.tenant.findFirst({
      where: {
        abacateBillingId: billingId,
        members: { some: { userId: user.id, status: 'ACTIVE' } },
      },
      select: {
        plan: true,
        planStartedAt: true,
        planExpiresAt: true,
      },
    });

    if (tenant && tenant.plan !== 'FREE' && tenant.planStartedAt) {
      return NextResponse.json({
        status: 'paid',
        plan: tenant.plan,
        activatedAt: tenant.planStartedAt.toISOString(),
        expiresAt: tenant.planExpiresAt?.toISOString() ?? null,
      });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing payment-status]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
