import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const endpoint = await prisma.webhookEndpoint.findFirst({
      where: { id, userId: user.id },
    });

    if (!endpoint) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Webhook não encontrado.' } }, { status: 404 });
    }

    const { url, events, isActive } = await req.json();

    const updated = await prisma.webhookEndpoint.update({
      where: { id },
      data: {
        ...(url !== undefined && { url }),
        ...(events !== undefined && { events }),
        ...(isActive !== undefined && { isActive }),
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const endpoint = await prisma.webhookEndpoint.findFirst({
      where: { id, userId: user.id },
    });

    if (!endpoint) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Webhook não encontrado.' } }, { status: 404 });
    }

    await prisma.webhookEndpoint.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
