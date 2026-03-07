import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlan } from '@/lib/plans';
import { isSimulationMode } from '@/lib/billing-mode';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    if (!body.confirm) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Confirmacao obrigatoria.' } },
        { status: 400 }
      );
    }

    if (user.planId === 'FREE') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Voce ja esta no plano Free.' } },
        { status: 400 }
      );
    }

    const plan = getPlan(user.planId);

    // Sanitize reason
    const reason = typeof body.reason === 'string'
      ? body.reason.replace(/<[^>]*>/g, '').slice(0, 500)
      : null;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { planExpiresAt: true },
    });

    const now = new Date();
    const activeUntil = dbUser?.planExpiresAt ?? now;

    // Mark cancellation
    await prisma.user.update({
      where: { id: user.id },
      data: { planCancelledAt: now },
    });

    // Record history
    await prisma.planHistory.create({
      data: {
        userId: user.id,
        fromPlan: user.planId,
        toPlan: 'FREE',
        reason: 'cancel',
      },
    });

    // Clear AbacatePay billing on the tenant (no pending billing to track)
    if (!isSimulationMode()) {
      const membership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
        include: { tenant: { select: { id: true, abacateBillingId: true } } },
      });

      if (membership) {
        // AbacatePay ONE_TIME billings don't need explicit cancellation via API
        // (they're already paid or expired). Clear the billing reference so
        // no renewal is generated for this billing.
        await prisma.tenant.update({
          where: { id: membership.tenantId },
          data: { abacateBillingId: null },
        });
      }
    }

    // In simulation mode, also downgrade to FREE immediately on the tenant
    if (isSimulationMode()) {
      const membership = await prisma.tenantMember.findFirst({
        where: { userId: user.id, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
      });

      if (membership) {
        await prisma.tenant.update({
          where: { id: membership.tenantId },
          data: { plan: 'FREE', planExpiresAt: null, mpPreapprovalId: null },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          planExpiresAt: null,
          planActivatedAt: null,
          planCancelledAt: null,
        },
      });
    }

    const formatter = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return NextResponse.json({
      success: true,
      activeUntil: isSimulationMode() ? null : activeUntil.toISOString(),
      message: isSimulationMode()
        ? `Plano ${plan.name} cancelado. Voce agora esta no plano Free.`
        : `Seu plano ${plan.name} ficara ativo ate ${formatter.format(activeUntil)}. Apos isso, voltara para o plano Free.`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing cancel]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
