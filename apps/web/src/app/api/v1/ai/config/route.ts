import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    let config = await prisma.tenantAiConfig.findUnique({
      where: { userId: user.id },
    });

    if (!config) {
      config = await prisma.tenantAiConfig.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();

    const allowedFields = [
      'defaultProviderId', 'defaultModelId',
      'fallbackProviderId', 'fallbackModelId',
      'temperature', 'maxTokens',
      'systemPromptOverride', 'responseLanguage',
      'requireJsonResponse', 'enableStreaming',
      'enableKbContext', 'maxKbArticles',
      'enableTicketHistory', 'maxSimilarTickets',
      'enableCostTracking',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    const config = await prisma.tenantAiConfig.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
    });

    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message } }, { status: 500 });
  }
}
