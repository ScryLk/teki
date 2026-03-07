import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    if (event === 'billing.paid' && data) {
      const billingId = data.id as string;
      const products = data.products as Array<{ externalId: string }>;
      const customer = data.customer as { id: string; metadata: { email?: string } };

      // Determine plan from product externalId
      let plan: PlanTier = 'FREE';
      const externalId = products?.[0]?.externalId ?? '';
      if (externalId.includes('pro')) plan = 'PRO';
      else if (externalId.includes('starter')) plan = 'STARTER';

      if (plan === 'FREE') {
        console.warn(`[abacatepay webhook] Unknown plan for billing ${billingId}`);
        return NextResponse.json({ status: 'unknown plan' });
      }

      // Find tenant by abacateBillingId
      let tenant = await prisma.tenant.findFirst({
        where: { abacateBillingId: billingId },
      });

      // Fallback: find by customer email
      if (!tenant && customer?.metadata?.email) {
        const user = await prisma.user.findUnique({
          where: { email: customer.metadata.email },
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
        console.warn(`[abacatepay webhook] Tenant not found for billing ${billingId}`);
        return NextResponse.json({ status: 'tenant not found' });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

      // Activate plan
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          plan,
          planStartedAt: now,
          planExpiresAt: expiresAt,
          abacateBillingId: billingId,
          abacateCustomerId: customer?.id ?? tenant.abacateCustomerId,
        },
      });

      // Find user (owner) to update user-level plan and record history
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

        // Record plan history
        await prisma.planHistory.create({
          data: {
            userId: ownerMember.userId,
            fromPlan: ownerMember.user.planId,
            toPlan: plan,
            reason: 'upgrade',
            amount: data.amount ? (data.amount as number) / 100 : null,
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[abacatepay webhook]', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
