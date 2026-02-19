import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID } from '@/types/agent';

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        _count: {
          select: {
            documents: true,
            conversations: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return Response.json(agents);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('GET /api/agents error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, systemPrompt, model, temperature, maxTokens } = body;

    if (!name || !systemPrompt) {
      return Response.json(
        { error: 'Nome e system prompt são obrigatórios' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        userId: DEFAULT_USER_ID,
        name,
        description: description || null,
        systemPrompt,
        model: model || 'claude-sonnet-4-20250514',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 2048,
      },
    });

    return Response.json(agent, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('POST /api/agents error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
