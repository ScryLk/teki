import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlanLimits } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';

const PLAN_NAMES: Record<string, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  STARTER: 29,
  PRO: 79,
  ENTERPRISE: 299,
};

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const limits = getPlanLimits(user.planId);
    const period = new Date().toISOString().slice(0, 7);

    const [usage, agentCount, docCount, channelCount] = await Promise.all([
      prisma.usageCounter.findUnique({
        where: { userId_period: { userId: user.id, period } },
      }),
      prisma.agent.count({ where: { userId: user.id } }),
      prisma.document.count({ where: { userId: user.id } }),
      prisma.channel.count({ where: { userId: user.id, isActive: true } }),
    ]);

    const messages = usage?.messages ?? 0;

    return NextResponse.json({
      plan: {
        id: user.planId,
        name: PLAN_NAMES[user.planId],
        price: PLAN_PRICES[user.planId],
        renewsAt: user.planExpiresAt,
      },
      usage: {
        messages: {
          current: messages,
          limit: limits.messagesPerMonth,
          percentage: limits.messagesPerMonth > 0
            ? Math.round((messages / limits.messagesPerMonth) * 1000) / 10
            : 0,
        },
        agents: {
          current: agentCount,
          limit: limits.agents,
          percentage: limits.agents > 0
            ? Math.round((agentCount / limits.agents) * 1000) / 10
            : 0,
        },
        documents: {
          current: docCount,
          limit: limits.documentsPerAgent,
          percentage: limits.documentsPerAgent > 0
            ? Math.round((docCount / limits.documentsPerAgent) * 1000) / 10
            : 0,
        },
        channels: {
          current: channelCount,
          limit: limits.openclawChannels,
          percentage: limits.openclawChannels > 0
            ? Math.round((channelCount / limits.openclawChannels) * 1000) / 10
            : 0,
          available: limits.openclaw,
        },
      },
      period,
      byokMessages: usage?.byokMessages ?? 0,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
