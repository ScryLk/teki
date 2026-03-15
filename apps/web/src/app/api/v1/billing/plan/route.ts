import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlan } from '@/lib/plans';
import { prisma } from '@/lib/prisma';
import { withRequestLog } from '@/lib/request-logger';

async function _GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const plan = getPlan(user.planId);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        planActivatedAt: true,
        planExpiresAt: true,
        planCancelledAt: true,
      },
    });

    const now = new Date();
    const expiresAt = dbUser?.planExpiresAt;
    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        activatedAt: dbUser?.planActivatedAt ?? null,
        expiresAt: dbUser?.planExpiresAt ?? null,
        cancelledAt: dbUser?.planCancelledAt ?? null,
        isActive: !dbUser?.planCancelledAt || (expiresAt && expiresAt > now),
        daysRemaining,
      },
      limits: {
        messagesPerMonth: plan.limits.messagesPerMonth,
        agents: plan.limits.agents,
        documentsPerAgent: plan.limits.documentsPerAgent,
        kbSizeMB: plan.limits.kbSizeMB,
        models: plan.features.models,
        openclaw: plan.features.openclaw,
        byok: plan.features.byok,
        apiKeys: plan.features.apiKeys,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

export const GET = withRequestLog(_GET);
