import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { checkAgentLimit, checkModelAccess } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const agents = await prisma.agent.findMany({
      where: { userId: user.id },
      include: { _count: { select: { documents: true, channels: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(agents);
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

    const limit = await checkAgentLimit(user.id, user.planId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_LIMIT_REACHED',
            message: `Limite de ${limit.limit} agente(s) atingido.`,
            current: limit.current,
            limit: limit.limit,
          },
        },
        { status: 403 }
      );
    }

    const { name, systemPrompt, model, description, welcomeMessage } =
      await req.json();

    if (!name || !systemPrompt) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'name e systemPrompt obrigatórios.' } },
        { status: 400 }
      );
    }

    if (model) {
      const modelAccess = await checkModelAccess(user.planId, model);
      if (!modelAccess.allowed) {
        return NextResponse.json(
          {
            error: {
              code: 'MODEL_NOT_AVAILABLE',
              message: `Modelo "${model}" não disponível no seu plano.`,
            },
          },
          { status: 403 }
        );
      }
    }

    const agent = await prisma.agent.create({
      data: {
        userId: user.id,
        name,
        systemPrompt,
        model: model || 'gemini-flash',
        description,
        welcomeMessage,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
