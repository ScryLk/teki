import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { isUpgrade, getPlan, PLAN_ORDER } from '@/lib/plans';
import { isSimulationMode } from '@/lib/billing-mode';
import { prisma } from '@/lib/prisma';
import type { PlanTier } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();
    const planId = body.planId as PlanTier;

    if (!planId || !PLAN_ORDER.includes(planId)) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'planId invalido.' } },
        { status: 400 }
      );
    }

    if (planId === user.planId) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Voce ja esta neste plano.' } },
        { status: 400 }
      );
    }

    if (!isUpgrade(user.planId, planId)) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Este plano e inferior ao atual. Use /downgrade.',
          },
        },
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

    const plan = getPlan(planId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update user plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
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
    await prisma.planHistory.create({
      data: {
        userId: user.id,
        fromPlan: user.planId,
        toPlan: planId,
        reason: isSimulationMode() ? 'simulation' : 'upgrade',
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
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing upgrade]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
