import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { isDowngrade, getPlan, PLAN_ORDER } from '@/lib/plans';
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

    if (!isDowngrade(user.planId, planId)) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'Este plano e superior ao atual. Use /upgrade.',
          },
        },
        { status: 400 }
      );
    }

    const targetPlan = getPlan(planId);
    const warnings: string[] = [];

    // Check agent overflow
    const agentCount = await prisma.agent.count({ where: { userId: user.id } });
    if (agentCount > targetPlan.limits.agents) {
      warnings.push(
        `Voce tem ${agentCount} agentes, mas o ${targetPlan.name} permite apenas ${targetPlan.limits.agents}. Agentes extras ficarao inativos.`
      );
    }

    // Check storage overflow
    const storageResult = await prisma.document.aggregate({
      where: { userId: user.id },
      _sum: { fileSize: true },
    });
    const storageMB = (storageResult._sum.fileSize ?? 0) / (1024 * 1024);
    if (storageMB > targetPlan.limits.kbSizeMB) {
      warnings.push(
        `Voce usa ${Math.round(storageMB)}MB, mas o ${targetPlan.name} permite ${targetPlan.limits.kbSizeMB}MB.`
      );
    }

    // Check if OpenClaw needs to be disabled
    if (!targetPlan.features.openclaw) {
      const activeChannels = await prisma.channel.count({
        where: { userId: user.id, isActive: true },
      });
      if (activeChannels > 0) {
        await prisma.channel.updateMany({
          where: { userId: user.id, isActive: true },
          data: { isActive: false },
        });
        warnings.push('Canais OpenClaw foram desconectados.');
      }
    }

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
        reason: 'downgrade',
      },
    });

    return NextResponse.json({
      success: true,
      plan: { id: planId, name: targetPlan.name },
      warnings,
      simulation: isSimulationMode(),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    console.error('[billing downgrade]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
