import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSubscriptionStatus } from '@/lib/mercadopago';
import type { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Handle subscription_preapproval notifications
    if (type === 'subscription_preapproval' && data?.id) {
      const preapprovalId = data.id;

      // Get subscription details from MP
      const subscription = await getSubscriptionStatus(preapprovalId);
      const status = subscription.status;

      // Find tenant by preapproval ID
      let tenant = await prisma.tenant.findFirst({
        where: { mpPreapprovalId: preapprovalId },
      });

      // If not found by preapprovalId, try to find user by email and their primary tenant
      if (!tenant && subscription.payer_email) {
        const user = await prisma.user.findUnique({
          where: { email: subscription.payer_email },
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
        console.warn(`[MP webhook] Tenant not found for preapproval ${preapprovalId}`);
        return NextResponse.json({ status: 'tenant not found' });
      }

      // Determine plan from subscription reason
      let plan: PlanTier = 'FREE';
      const reason = (subscription.reason ?? '').toLowerCase();
      if (reason.includes('pro')) plan = 'PRO';
      else if (reason.includes('starter')) plan = 'STARTER';

      // Update tenant based on subscription status
      switch (status) {
        case 'authorized':
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              plan,
              mpPreapprovalId: preapprovalId,
              planExpiresAt: subscription.next_payment_date
                ? new Date(subscription.next_payment_date)
                : null,
            },
          });
          break;

        case 'paused':
        case 'cancelled':
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              plan: 'FREE',
              mpPreapprovalId: null,
              planExpiresAt: null,
            },
          });
          break;

        case 'pending':
          // Keep current plan, just save preapproval ID
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { mpPreapprovalId: preapprovalId },
          });
          break;
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[mercadopago webhook]', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
