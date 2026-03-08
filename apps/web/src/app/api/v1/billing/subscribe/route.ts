import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createBilling } from '@/lib/abacatepay';
import { PLAN_ORDER } from '@/lib/plans';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();
    const rawPlanId = (body.planId as string)?.toUpperCase() as PlanTier;

    if (!rawPlanId || !PLAN_ORDER.includes(rawPlanId) || rawPlanId === 'FREE' || rawPlanId === 'ENTERPRISE') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'planId deve ser "STARTER" ou "PRO".' } },
        { status: 400 }
      );
    }

    // Fetch billing data from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { billingName: true, billingTaxId: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://teki.com.br';

    // Note: AbacatePay completionUrl receives the user after payment.
    // We use the callback URL which polls for payment confirmation via webhook.
    const result = await createBilling({
      userEmail: user.email,
      userName: dbUser?.billingName ?? `${user.firstName} ${user.lastName ?? ''}`.trim(),
      userTaxId: dbUser?.billingTaxId ?? undefined,
      planId: rawPlanId,
      backUrl: `${appUrl}/settings/billing`,
      completionUrl: `${appUrl}/settings/billing/callback?plan=${rawPlanId}`,
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
