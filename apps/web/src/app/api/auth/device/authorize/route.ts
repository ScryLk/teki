import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createApiKey } from '@/lib/api-keys';

export async function POST(req: NextRequest) {
  try {
    // Require authenticated session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Voce precisa estar logado.' } },
        { status: 401 },
      );
    }

    const { userCode, approve } = await req.json();

    if (!userCode) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'userCode obrigatorio' } },
        { status: 400 },
      );
    }

    // Normalize code: remove hyphen, uppercase
    const normalizedCode =
      userCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const formattedCode =
      normalizedCode.slice(0, 3) + '-' + normalizedCode.slice(3, 6);

    // Find device code
    const record = await prisma.deviceCode.findUnique({
      where: { userCode: formattedCode },
    });

    if (!record) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Codigo nao encontrado ou expirado.' } },
        { status: 404 },
      );
    }

    if (record.expiresAt < new Date()) {
      await prisma.deviceCode.update({
        where: { id: record.id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: { code: 'EXPIRED', message: 'Codigo expirado.' } },
        { status: 410 },
      );
    }

    if (record.status !== 'PENDING') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Codigo ja foi utilizado.' } },
        { status: 409 },
      );
    }

    if (!approve) {
      await prisma.deviceCode.update({
        where: { id: record.id },
        data: { status: 'DENIED' },
      });
      return NextResponse.json({ success: true });
    }

    // Approve: generate API key for the user
    const { key, id: apiKeyId } = await createApiKey(
      session.user.id,
      'Teki Desktop',
      'LIVE',
    );

    // Update device code
    await prisma.deviceCode.update({
      where: { id: record.id },
      data: {
        status: 'AUTHORIZED',
        userId: session.user.id,
        apiKeyId,
      },
    });

    return NextResponse.json({ success: true, apiKey: key });
  } catch (error) {
    console.error('[Device] Authorize error:', error);
    if ((error as Error).message?.includes('Limite de 5')) {
      return NextResponse.json(
        { error: { code: 'LIMIT_REACHED', message: 'Limite de chaves ativas atingido. Revogue uma chave em Configuracoes.' } },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
