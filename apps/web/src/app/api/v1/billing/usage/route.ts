import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { getPlan } from '@/lib/plans';
import {
  checkMessageLimit,
  checkAgentLimit,
  checkStorageLimit,
  checkChannelLimit,
} from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';

function getStatus(percentage: number): string {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'normal';
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const plan = getPlan(user.planId);
    const period = new Date().toISOString().slice(0, 7);

    const [messages, agents, storage, channels] = await Promise.all([
      checkMessageLimit(user.id, user.planId),
      checkAgentLimit(user.id, user.planId),
      checkStorageLimit(user.id, user.planId),
      checkChannelLimit(user.id, user.planId),
    ]);

    const usage = await prisma.usageCounter.findUnique({
      where: { userId_period: { userId: user.id, period } },
    });

    return NextResponse.json({
      period,
      plan: { id: plan.id, name: plan.name },
      usage: {
        messages: {
          current: messages.current,
          limit: messages.limit,
          percentage: Math.round(messages.percentage * 10) / 10,
          remaining: messages.remaining,
          status: getStatus(messages.percentage),
        },
        agents: {
          current: agents.current,
          limit: agents.limit,
          percentage: Math.round(agents.percentage * 10) / 10,
          remaining: agents.remaining,
          status: getStatus(agents.percentage),
        },
        storage: {
          current: storage.current,
          limit: storage.limit,
          percentage: Math.round(storage.percentage * 10) / 10,
          remaining: storage.remaining,
          unit: 'MB',
          status: getStatus(storage.percentage),
        },
        channels: {
          current: channels.current,
          limit: channels.limit,
          available: channels.featureAvailable,
          upgradeRequired: channels.upgradeRequired ?? null,
        },
      },
      byokMessages: usage?.byokMessages ?? 0,
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
