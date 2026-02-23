import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: user.id },
    });

    if (!apiKey) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Chave não encontrada.' } }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id },
      data: { isRevoked: true },
    });

    return NextResponse.json({ success: true, message: 'Chave revogada.' });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
