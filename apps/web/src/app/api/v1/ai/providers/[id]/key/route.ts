import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { encryptApiKey, maskApiKey } from '@/lib/ai/encryption';
import { providerRegistry } from '@/lib/ai/provider-registry';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireAuth(req);
    const { id: providerId } = await params;
    const body = await req.json();
    const { apiKey, customBaseUrl, monthlyBudgetUsd } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'apiKey é obrigatório.' } },
        { status: 400 }
      );
    }

    const encrypted = encryptApiKey(apiKey);
    const masked = maskApiKey(apiKey);
    // The encrypted format is "iv:authTag:ciphertext" — extract iv
    const [iv] = encrypted.split(':');

    await prisma.providerKey.upsert({
      where: { userId_provider: { userId: user.id, provider: providerId } },
      update: {
        encryptedKey: encrypted,
        iv,
        keyMasked: masked,
        customBaseUrl: customBaseUrl || null,
        monthlyBudgetUsd: monthlyBudgetUsd ?? null,
        status: 'valid',
        isValid: null,
        lastValidatedAt: null,
      },
      create: {
        userId: user.id,
        provider: providerId,
        encryptedKey: encrypted,
        iv,
        keyMasked: masked,
        customBaseUrl: customBaseUrl || null,
        monthlyBudgetUsd: monthlyBudgetUsd ?? null,
        status: 'valid',
      },
    });

    return NextResponse.json({ success: true, keyMasked: masked });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireAuth(req);
    const { id: providerId } = await params;

    await prisma.providerKey.deleteMany({
      where: { userId: user.id, provider: providerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
