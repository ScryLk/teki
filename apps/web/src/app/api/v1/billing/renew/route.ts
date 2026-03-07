import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createBilling } from '@/lib/abacatepay';
import { isSimulationMode } from '@/lib/billing-mode';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    if (user.planId === 'FREE' || user.planId === 'ENTERPRISE') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nenhum plano ativo para renovar.' } },
        { status: 400 }
      );
    }

    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      include: { tenant: { select: { id: true, planExpiresAt: true } } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Tenant nao encontrado.' } },
        { status: 400 }
      );
    }

    // In simulation mode, just extend the expiry
    if (isSimulationMode()) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.tenant.update({
        where: { id: membership.tenantId },
        data: { planExpiresAt: expiresAt },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { planExpiresAt: expiresAt },
      });

      return NextResponse.json({
        success: true,
        simulation: true,
        expiresAt: expiresAt.toISOString(),
        message: 'Plano renovado (simulacao).',
      });
    }

    // Fetch billing data from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { billingName: true, billingTaxId: true },
    });

    const planId = user.planId.toLowerCase() as 'starter' | 'pro';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://teki.com.br';

    const result = await createBilling({
      userEmail: user.email,
      userName: dbUser?.billingName ?? `${user.firstName} ${user.lastName ?? ''}`.trim(),
      userTaxId: dbUser?.billingTaxId ?? undefined,
      planId,
      backUrl: `${appUrl}/settings/billing`,
      completionUrl: `${appUrl}/settings/billing/callback?billingId=PENDING&plan=${planId}`,
    });

    // Update tenant with new billing ID
    await prisma.tenant.update({
      where: { id: membership.tenantId },
      data: { abacateBillingId: result.billingId },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      billingId: result.billingId,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing renew]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
