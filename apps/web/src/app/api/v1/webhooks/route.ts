import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { withRequestLog } from '@/lib/request-logger';

async function _GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { userId: user.id },
      include: { _count: { select: { logs: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(endpoints);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

async function _POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { url, events } = await req.json();

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'url e events obrigatórios.' } },
        { status: 400 }
      );
    }

    const validEvents = [
      'message.created',
      'conversation.created',
      'document.processed',
      'agent.updated',
      'plan.limit.reached',
      'channel.status_changed',
    ];

    const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: `Eventos inválidos: ${invalidEvents.join(', ')}` } },
        { status: 400 }
      );
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        userId: user.id,
        url,
        secret,
        events,
      },
    });

    return NextResponse.json(
      {
        ...endpoint,
        secret, // Only shown on creation
        message: 'Guarde o secret — ele não será exibido novamente.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export const GET = withRequestLog(_GET);
export const POST = withRequestLog(_POST);
