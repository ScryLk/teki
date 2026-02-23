import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { createApiKey } from '@/lib/api-keys';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        type: true,
        lastUsedAt: true,
        expiresAt: true,
        isRevoked: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(keys);
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
    const { name, type = 'LIVE' } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'name obrigatório.' } },
        { status: 400 }
      );
    }

    if (type !== 'LIVE' && type !== 'TEST') {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'type deve ser LIVE ou TEST.' } },
        { status: 400 }
      );
    }

    const result = await createApiKey(user.id, name, type);

    return NextResponse.json(
      {
        id: result.id,
        key: result.key, // Only shown once
        message: 'Guarde esta chave — ela não será exibida novamente.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Limite')) {
      return NextResponse.json(
        { error: { code: 'PLAN_LIMIT_REACHED', message: error.message } },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
