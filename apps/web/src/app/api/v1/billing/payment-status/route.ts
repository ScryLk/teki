import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getBillingStatus } from '@/lib/abacatepay';
import { isSimulationMode } from '@/lib/billing-mode';
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

    // In simulation mode, check if tenant plan is already active
    if (isSimulationMode()) {
      const membership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
        include: { tenant: { select: { plan: true } } },
      });

      return NextResponse.json({
        billingId,
        status: membership?.tenant.plan !== 'FREE' ? 'PAID' : 'PENDING',
        confirmed: membership?.tenant.plan !== 'FREE',
      });
    }

    // Verify the billing belongs to the user's tenant
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: { tenant: { select: { abacateBillingId: true, plan: true } } },
    });

    if (membership?.tenant.abacateBillingId !== billingId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Billing nao pertence ao seu tenant.' } },
        { status: 403 }
      );
    }

    // Check if webhook already confirmed (tenant plan updated)
    if (membership.tenant.plan !== 'FREE') {
      return NextResponse.json({
        billingId,
        status: 'PAID',
        confirmed: true,
      });
    }

    // Query AbacatePay for current status
    const billing = await getBillingStatus(billingId);

    if (!billing) {
      return NextResponse.json({
        billingId,
        status: 'NOT_FOUND',
        confirmed: false,
      });
    }

    return NextResponse.json({
      billingId,
      status: billing.status,
      confirmed: billing.status === 'PAID' || billing.status === 'paid',
    });
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
