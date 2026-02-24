import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
            status: 'ACTIVE',
          },
        },
        status: { in: ['ACTIVE', 'CLOSED'] },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        participants: {
          where: { userId: user.id },
          select: { isPinned: true, isMuted: true },
        },
      },
      take: 50,
    });

    return NextResponse.json(conversations);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
