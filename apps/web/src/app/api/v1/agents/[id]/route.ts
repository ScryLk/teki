import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { checkModelAccess } from '@/lib/plan-limits';
import { prisma } from '@/lib/prisma';
import { withRequestLog } from '@/lib/request-logger';

async function _GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const agent = await prisma.agent.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: { select: { documents: true, channels: true } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!agent) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Agente não encontrado.' } }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

async function _PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const agent = await prisma.agent.findFirst({
      where: { id, userId: user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Agente não encontrado.' } }, { status: 404 });
    }

    const { name, systemPrompt, model, description, welcomeMessage } =
      await req.json();

    if (model) {
      const modelAccess = await checkModelAccess(user.planId, model);
      if (!modelAccess.allowed) {
        return NextResponse.json(
          { error: { code: 'MODEL_NOT_AVAILABLE', message: `Modelo "${model}" não disponível no seu plano.` } },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(model !== undefined && { model }),
        ...(description !== undefined && { description }),
        ...(welcomeMessage !== undefined && { welcomeMessage }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

async function _DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const agent = await prisma.agent.findFirst({
      where: { id, userId: user.id },
    });

    if (!agent) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Agente não encontrado.' } }, { status: 404 });
    }

    if (agent.isDefault) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Não é possível excluir o agente padrão.' } },
        { status: 400 }
      );
    }

    await prisma.agent.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export const GET = withRequestLog(_GET);
export const PATCH = withRequestLog(_PATCH);
export const DELETE = withRequestLog(_DELETE);
