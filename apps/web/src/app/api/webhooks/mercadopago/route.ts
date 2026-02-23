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

      // Find user by preapproval ID
      let user = await prisma.user.findFirst({
        where: { mpPreapprovalId: preapprovalId },
      });

      // If not found by preapprovalId, try by email (first-time subscription)
      if (!user && subscription.payer_email) {
        user = await prisma.user.findUnique({
          where: { email: subscription.payer_email },
        });
      }

      if (!user) {
        console.warn(`[MP webhook] User not found for preapproval ${preapprovalId}`);
        return NextResponse.json({ status: 'user not found' });
      }

      // Determine plan from subscription reason
      let planId: PlanTier = 'FREE';
      const reason = (subscription.reason ?? '').toLowerCase();
      if (reason.includes('pro')) planId = 'PRO';
      else if (reason.includes('starter')) planId = 'STARTER';

      // Update user based on subscription status
      switch (status) {
        case 'authorized':
          await prisma.user.update({
            where: { id: user.id },
            data: {
              planId,
              mpPreapprovalId: preapprovalId,
              planExpiresAt: subscription.next_payment_date
                ? new Date(subscription.next_payment_date)
                : null,
            },
          });
          break;

        case 'paused':
        case 'cancelled':
          await prisma.user.update({
            where: { id: user.id },
            data: {
              planId: 'FREE',
              mpPreapprovalId: null,
              planExpiresAt: null,
            },
          });
          break;

        case 'pending':
          // Keep current plan, just save preapproval ID
          await prisma.user.update({
            where: { id: user.id },
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
