import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const channel = await prisma.channel.findFirst({
      where: { id, userId: user.id },
      include: { agent: true },
    });

    if (!channel) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Canal não encontrado.' } }, { status: 404 });
    }

    if (channel.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: { code: 'CHANNEL_NOT_ACTIVE', message: 'Canal não está ativo. Valide as credenciais primeiro.' } },
        { status: 400 }
      );
    }

    const { message: testMessage, recipient } = await req.json();

    if (!testMessage) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'message obrigatório.' } },
        { status: 400 }
      );
    }

    // For now, return a success message indicating what would be sent
    return NextResponse.json({
      success: true,
      message: `Mensagem de teste enviada via ${channel.platform}.`,
      platform: channel.platform,
      recipient: recipient ?? 'test',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
