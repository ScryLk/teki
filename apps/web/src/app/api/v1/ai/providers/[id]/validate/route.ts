import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { decryptApiKey } from '@/lib/ai/encryption';
import { providerRegistry } from '@/lib/ai/provider-registry';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { user } = await requireAuth(req);
    const { id: providerId } = await params;
    const body = await req.json().catch(() => ({}));
    let apiKey = body.apiKey as string | undefined;

    // If no key provided in body, use the stored one
    if (!apiKey) {
      const stored = await prisma.providerKey.findUnique({
        where: { userId_provider: { userId: user.id, provider: providerId } },
      });
      if (!stored) {
        return NextResponse.json(
          { error: { code: 'NO_KEY', message: 'Nenhuma key cadastrada para este provider.' } },
          { status: 400 }
        );
      }
      // New format: encryptedKey = "iv:authTag:ciphertext" (full string)
      apiKey = decryptApiKey(stored.encryptedKey);
    }

    const provider = providerRegistry.get(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: { code: 'UNKNOWN_PROVIDER', message: `Provider "${providerId}" não suportado.` } },
        { status: 400 }
      );
    }

    const result = await provider.validateKey(apiKey);

    // Update stored key status
    await prisma.providerKey.updateMany({
      where: { userId: user.id, provider: providerId },
      data: {
        isValid: result.valid,
        status: result.valid ? 'valid' : 'invalid',
        lastValidatedAt: new Date(),
      },
    });

    return NextResponse.json({
      valid: result.valid,
      error: result.error,
      models: result.models,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
