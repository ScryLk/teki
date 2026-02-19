import { NextRequest } from 'next/server';
import { chatWithClaude } from '@/lib/anthropic';
import { searchKnowledgeBase } from '@/lib/knowledge-base';
import { prisma } from '@/lib/db';
import { DEFAULT_USER_ID } from '@/types/agent';

export async function POST(req: NextRequest) {
  try {
    const { agentId, conversationId, message } = await req.json();

    if (!agentId || !message) {
      return Response.json(
        { error: 'agentId e message são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Fetch agent config
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return Response.json({ error: 'Agente não encontrado' }, { status: 404 });
    }

    // 2. Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          agentId,
          userId: DEFAULT_USER_ID,
          title: message.substring(0, 80),
          messages: {
            create: { role: 'user', content: message },
          },
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } else {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message,
        },
      });
    }

    // 3. Search KB for relevant context
    const kbContext = await searchKnowledgeBase(agentId, message);

    // 4. Build message history for Claude
    const messages = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add current message if it wasn't in the initial creation
    if (conversationId) {
      messages.push({ role: 'user' as const, content: message });
    }

    // 5. Call Claude with streaming
    const stream = await chatWithClaude({
      systemPrompt: agent.systemPrompt,
      knowledgeContext: kbContext,
      messages,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    });

    // 6. Create ReadableStream for SSE
    const encoder = new TextEncoder();
    const conversationIdToReturn = conversation.id;

    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = '';

        stream.on('text', (text) => {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text', content: text })}\n\n`
            )
          );
        });

        stream.on('end', async () => {
          try {
            await prisma.message.create({
              data: {
                conversationId: conversationIdToReturn,
                role: 'assistant',
                content: fullResponse,
              },
            });
          } catch (e) {
            console.error('Failed to save assistant message:', e);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId: conversationIdToReturn,
              })}\n\n`
            )
          );
          controller.close();
        });

        stream.on('error', (error) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              })}\n\n`
            )
          );
          controller.close();
        });
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    console.error('POST /api/custom-chat error:', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
