import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSimulationMode } from '@/lib/billing-mode';
import { createBilling } from '@/lib/abacatepay';

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Cron job endpoint for billing renewal.
 * Should be called daily (e.g., via Vercel Cron or external scheduler).
 *
 * Two responsibilities:
 * 1. Generate renewal billings for plans expiring within 3 days (non-cancelled)
 * 2. Downgrade expired plans to FREE
 *
 * Authorization: requires CRON_SECRET header or query param.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isSimulationMode()) {
    return NextResponse.json({ status: 'skipped', reason: 'simulation mode' });
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const results = { renewed: 0, expired: 0, errors: [] as string[] };

  try {
    // 1. Find tenants with plans expiring within 3 days that haven't been cancelled
    const expiringTenants = await prisma.tenant.findMany({
      where: {
        plan: { in: ['STARTER', 'PRO'] },
        planExpiresAt: {
          lte: threeDaysFromNow,
          gt: now,
        },
      },
      include: {
        members: {
          where: { role: 'OWNER', status: 'ACTIVE' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                billingName: true,
                billingTaxId: true,
                planCancelledAt: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://teki.com.br';

    for (const tenant of expiringTenants) {
      const owner = tenant.members[0]?.user;
      if (!owner) continue;

      // Skip if user has cancelled
      if (owner.planCancelledAt) continue;

      // Skip if a renewal billing was already generated recently
      // (abacateBillingId would have been updated)
      try {
        const planId = tenant.plan.toLowerCase() as 'starter' | 'pro';

        const result = await createBilling({
          userEmail: owner.email,
          userName: owner.billingName ?? `${owner.firstName} ${owner.lastName ?? ''}`.trim(),
          userTaxId: owner.billingTaxId ?? undefined,
          planId,
          backUrl: `${appUrl}/settings/billing`,
          completionUrl: `${appUrl}/settings/billing/callback?plan=${planId}`,
        });

        // Update tenant with new billing ID for webhook reconciliation
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { abacateBillingId: result.billingId },
        });

        results.renewed++;
        console.log(`[billing-renewal] Renewal billing created for tenant ${tenant.id}: ${result.billingId}`);
      } catch (err) {
        const msg = `Failed to renew tenant ${tenant.id}: ${err instanceof Error ? err.message : String(err)}`;
        results.errors.push(msg);
        console.error(`[billing-renewal] ${msg}`);
      }
    }

    // 2. Downgrade expired plans
    const expiredTenants = await prisma.tenant.findMany({
      where: {
        plan: { in: ['STARTER', 'PRO'] },
        planExpiresAt: { lte: now },
      },
      include: {
        members: {
          where: { role: 'OWNER', status: 'ACTIVE' },
          select: { userId: true, user: { select: { planId: true } } },
          take: 1,
        },
      },
    });

    for (const tenant of expiredTenants) {
      const owner = tenant.members[0];
      if (!owner) continue;

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          plan: 'FREE',
          planExpiresAt: null,
          abacateBillingId: null,
        },
      });

      await prisma.user.update({
        where: { id: owner.userId },
        data: {
          planExpiresAt: null,
          planActivatedAt: null,
          planCancelledAt: null,
        },
      });

      await prisma.planHistory.create({
        data: {
          userId: owner.userId,
          fromPlan: owner.user.planId,
          toPlan: 'FREE',
          reason: 'expired',
        },
      });

      results.expired++;
      console.log(`[billing-renewal] Expired tenant ${tenant.id} downgraded to FREE`);
    }

    return NextResponse.json({ status: 'ok', ...results });
  } catch (error) {
    console.error('[billing-renewal] Cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
