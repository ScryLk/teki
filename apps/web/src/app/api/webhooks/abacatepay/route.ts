import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';

/**
 * AbacatePay webhook handler.
 * Receives payment notifications and activates user plans.
 */
export async function POST(req: NextRequest) {
  // Verify webhook secret if configured
  const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const authHeader = req.headers.get('authorization');
    const tokenHeader = req.headers.get('x-webhook-secret');
    const providedSecret = tokenHeader ?? authHeader?.replace('Bearer ', '');

    if (providedSecret !== webhookSecret) {
      console.warn('[abacatepay webhook] Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const { event, data } = body;

  if (!event || !data) {
    return NextResponse.json(
      { error: 'Missing event or data' },
      { status: 400 }
    );
  }

  // Only handle billing.paid events
  if (event !== 'billing.paid') {
    return NextResponse.json({ status: 'ignored', event });
  }

  const billingData = data as {
    id: string;
    products?: Array<{ externalId: string }>;
    customer?: { id: string; metadata?: { email?: string } };
    amount?: number;
  };

  const billingId = billingData.id;
  if (!billingId) {
    return NextResponse.json(
      { error: 'Missing billing ID' },
      { status: 400 }
    );
  }

  // Determine plan from product externalId
  const externalId = billingData.products?.[0]?.externalId ?? '';
  let plan: PlanTier;
  if (externalId.includes('pro')) {
    plan = 'PRO';
  } else if (externalId.includes('starter')) {
    plan = 'STARTER';
  } else {
    console.warn(`[abacatepay webhook] Unknown plan in externalId "${externalId}" for billing ${billingId}`);
    return NextResponse.json(
      { error: 'Unknown plan from product externalId' },
      { status: 400 }
    );
  }

  try {
    // Find tenant by abacateBillingId
    let tenant = await prisma.tenant.findFirst({
      where: { abacateBillingId: billingId },
    });

    // Fallback: find by customer email
    if (!tenant && billingData.customer?.metadata?.email) {
      const user = await prisma.user.findUnique({
        where: { email: billingData.customer.metadata.email },
        include: {
          memberships: {
            where: { status: 'ACTIVE', role: 'OWNER' },
            include: { tenant: true },
            take: 1,
          },
        },
      });
      tenant = user?.memberships[0]?.tenant ?? null;
    }

    if (!tenant) {
      console.error(`[abacatepay webhook] Tenant not found for billing ${billingId}`);
      // Return 500 so AbacatePay retries — tenant may not exist yet
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 500 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Activate plan on tenant
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan,
        planStartedAt: now,
        planExpiresAt: expiresAt,
        abacateBillingId: billingId,
        abacateCustomerId: billingData.customer?.id ?? tenant.abacateCustomerId,
      },
    });

    // Find owner user to update user-level plan and record history
    const ownerMember = await prisma.tenantMember.findFirst({
      where: { tenantId: tenant.id, role: 'OWNER', status: 'ACTIVE' },
      include: { user: true },
    });

    if (ownerMember) {
      await prisma.user.update({
        where: { id: ownerMember.userId },
        data: {
          planActivatedAt: now,
          planExpiresAt: expiresAt,
          planCancelledAt: null,
        },
      });

      await prisma.planHistory.create({
        data: {
          userId: ownerMember.userId,
          fromPlan: tenant.plan,
          toPlan: plan,
          reason: 'upgrade',
          amount: billingData.amount ? billingData.amount / 100 : null,
        },
      });
    }

    console.log(`[abacatepay webhook] Plan ${plan} activated for tenant ${tenant.id} (billing ${billingId})`);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[abacatepay webhook] Internal error:', error);
    // Return 500 so AbacatePay retries
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
