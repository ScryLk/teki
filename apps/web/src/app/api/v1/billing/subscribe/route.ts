import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createBilling } from '@/lib/abacatepay';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { planId } = await req.json();

    if (planId !== 'starter' && planId !== 'pro') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'planId deve ser "starter" ou "pro".' } },
        { status: 400 }
      );
    }

    // Fetch billing data from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { billingName: true, billingTaxId: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://teki.com.br';

    const result = await createBilling({
      userEmail: user.email,
      userName: dbUser?.billingName ?? `${user.firstName} ${user.lastName ?? ''}`.trim(),
      userTaxId: dbUser?.billingTaxId ?? undefined,
      planId,
      backUrl: `${appUrl}/settings/billing`,
      completionUrl: `${appUrl}/settings/billing/success?plan=${planId}`,
    });

    // Save billing ID to tenant for webhook reconciliation
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (membership) {
      await prisma.tenant.update({
        where: { id: membership.tenantId },
        data: { abacateBillingId: result.billingId },
      });
    }

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      billingId: result.billingId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    console.error('[billing subscribe]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
