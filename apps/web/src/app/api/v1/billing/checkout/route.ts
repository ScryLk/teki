import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlan, isUpgrade, PLAN_ORDER } from '@/lib/plans';
import { isSimulationMode } from '@/lib/billing-mode';
import { validateTaxId, cleanTaxId } from '@/lib/tax-id';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const planId = body.planId as PlanTier;
    const billingName = (body.billingName ?? '').trim();
    const billingCompany = (body.billingCompany ?? '').trim();
    const billingTaxIdRaw = (body.billingTaxId ?? '').trim();

    // Validate planId
    if (!planId || !PLAN_ORDER.includes(planId) || planId === 'FREE') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'planId invalido.' } },
        { status: 400 }
      );
    }

    if (planId === 'ENTERPRISE') {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Plano Enterprise disponivel apenas sob consulta.',
          },
        },
        { status: 400 }
      );
    }

    // Validate billing name
    if (!billingName) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Nome completo obrigatorio.' } },
        { status: 400 }
      );
    }

    // Validate tax ID
    if (!billingTaxIdRaw) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'CPF ou CNPJ obrigatorio.' } },
        { status: 400 }
      );
    }

    const taxIdResult = validateTaxId(billingTaxIdRaw);
    if (!taxIdResult) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'CPF ou CNPJ invalido.' } },
        { status: 400 }
      );
    }

    const plan = getPlan(planId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Save billing data + activate plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
        billingName,
        billingCompany: billingCompany || null,
        billingTaxId: taxIdResult.clean,
        planActivatedAt: now,
        planExpiresAt: expiresAt,
        planCancelledAt: null,
      },
    });

    // Update tenant plan
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (membership) {
      await prisma.tenant.update({
        where: { id: membership.tenantId },
        data: {
          plan: planId,
          planStartedAt: now,
          planExpiresAt: expiresAt,
        },
      });
    }

    // Record history
    const upgrading = isUpgrade(user.planId, planId);
    await prisma.planHistory.create({
      data: {
        userId: user.id,
        fromPlan: user.planId,
        toPlan: planId,
        reason: isSimulationMode() ? 'simulation' : upgrading ? 'upgrade' : 'downgrade',
        amount: isSimulationMode() ? null : plan.price,
      },
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: planId,
        name: plan.name,
        activatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
      simulation: isSimulationMode(),
      message: 'Plano ativado com sucesso!',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing checkout]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
