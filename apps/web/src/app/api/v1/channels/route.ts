import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { checkChannelLimit } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { conversations: true } },
        agent: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(channels);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const limit = await checkChannelLimit(user.id, user.planId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_LIMIT_REACHED',
            message: 'reason' in limit ? limit.reason : `Limite de ${limit.limit} canal(is) atingido.`,
          },
        },
        { status: 403 }
      );
    }

    const { agentId, platform, displayName, platformConfig, welcomeMessage, modelOverride } =
      await req.json();

    if (!agentId || !platform || !displayName || !platformConfig) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'agentId, platform, displayName e platformConfig obrigatórios.' } },
        { status: 400 }
      );
    }

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId: user.id },
    });
    if (!agent) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Agente não encontrado.' } },
        { status: 404 }
      );
    }

    const channel = await prisma.channel.create({
      data: {
        userId: user.id,
        agentId,
        platform,
        displayName,
        platformConfig,
        welcomeMessage,
        modelOverride,
        status: 'PENDING',
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
