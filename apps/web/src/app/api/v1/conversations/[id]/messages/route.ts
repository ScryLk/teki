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

    // Verify conversation belongs to user (via participants)
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: { some: { userId: user.id, status: 'ACTIVE' } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversa não encontrada.' } },
        { status: 404 }
      );
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '100', 10);
    const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0', 10);

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: Math.min(limit, 200),
    });

    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
