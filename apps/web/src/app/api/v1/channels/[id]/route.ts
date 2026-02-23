import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const channel = await prisma.channel.findFirst({
      where: { id, userId: user.id },
      include: {
        agent: { select: { id: true, name: true } },
        _count: { select: { conversations: true } },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Canal não encontrado.' } }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const channel = await prisma.channel.findFirst({
      where: { id, userId: user.id },
    });

    if (!channel) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Canal não encontrado.' } }, { status: 404 });
    }

    const body = await req.json();
    const allowedFields = [
      'displayName', 'platformConfig', 'welcomeMessage', 'modelOverride',
      'businessHoursStart', 'businessHoursEnd', 'businessHoursTimezone',
      'respondOutsideHours', 'outsideHoursMessage', 'isActive', 'agentId',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const updated = await prisma.channel.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const channel = await prisma.channel.findFirst({
      where: { id, userId: user.id },
    });

    if (!channel) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Canal não encontrado.' } }, { status: 404 });
    }

    await prisma.channel.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
