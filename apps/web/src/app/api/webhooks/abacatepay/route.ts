import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

function verifyWebhookSignature(body: string, signatureHeader: string | null): boolean {
  if (!WEBHOOK_SECRET) {
    // If no secret configured, skip validation (dev mode)
    console.warn('[abacatepay webhook] ABACATEPAY_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  // Support both raw hex and "sha256=hex" formats
  const receivedSignature = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader;

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

export async function POST(req: NextRequest) {
  // Read raw body for signature verification
  const rawBody = await req.text();

  // Verify webhook signature
  const signature = req.headers.get('x-signature') ?? req.headers.get('x-webhook-signature');
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[abacatepay webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: { event?: string; data?: Record<string, unknown> };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { event, data } = body;

  if (!event || !data) {
    return NextResponse.json({ error: 'Missing event or data' }, { status: 400 });
  }

  try {
    if (event === 'billing.paid') {
      const billingId = data.id as string;
      const products = data.products as Array<{ externalId: string }>;
      const customer = data.customer as { id: string; metadata: { email?: string } };

      if (!billingId) {
        return NextResponse.json({ error: 'Missing billing id' }, { status: 400 });
      }

      // Determine plan from product externalId
      let plan: PlanTier = 'FREE';
      const externalId = products?.[0]?.externalId ?? '';
      if (externalId.includes('pro')) plan = 'PRO';
      else if (externalId.includes('starter')) plan = 'STARTER';

      if (plan === 'FREE') {
        console.warn(`[abacatepay webhook] Unknown plan for billing ${billingId}`);
        return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
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
        return NextResponse.json({ error: 'Tenant not found' }, { status: 400 });
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

      console.log(`[abacatepay webhook] Plan ${plan} activated for tenant ${tenant.id}`);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[abacatepay webhook] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
