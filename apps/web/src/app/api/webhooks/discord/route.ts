import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProvider } from '@/lib/ai/router';
import { searchKnowledgeBase, formatKBContext } from '@/lib/kb/search';
import { incrementUsage } from '@/lib/plan-limits';
import type { ProviderMessage } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Discord interaction verification (ping)
    if (body.type === 1) {
      return NextResponse.json({ type: 1 });
    }

    // Only handle message interactions (type 2 = application command)
    if (body.type !== 2) {
      return NextResponse.json({ status: 'ignored' });
    }

    const userId = body.member?.user?.id ?? body.user?.id;
    const username =
      body.member?.user?.username ?? body.user?.username ?? 'User';
    const text = body.data?.options?.[0]?.value ?? '';

    if (!userId || !text) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Find active Discord channel
    const channels = await prisma.channel.findMany({
      where: {
        platform: 'DISCORD',
        status: 'ACTIVE',
        isActive: true,
      },
      include: { agent: true, user: true },
    });

    const channel = channels[0];
    if (!channel) {
      return NextResponse.json({
        type: 4,
        data: { content: 'Nenhum canal Discord configurado.' },
      });
    }

    // Get or create conversation
    const conversation = await prisma.channelConversation.upsert({
      where: {
        channelId_externalUserId: { channelId: channel.id, externalUserId: userId },
      },
      update: { lastMessageAt: new Date(), messageCount: { increment: 1 } },
      create: {
        channelId: channel.id,
        externalUserId: userId,
        externalUserName: username,
      },
    });

    // Save user message
    await prisma.channelMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: text,
      },
    });

    // RAG
    let kbContext = '';
    const docCount = await prisma.document.count({
      where: { agentId: channel.agentId, status: 'INDEXED' },
    });
    if (docCount > 0) {
      const results = await searchKnowledgeBase(channel.agentId, text);
      kbContext = formatKBContext(results);
    }

    const recentMessages = await prisma.channelMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const providerMessages: ProviderMessage[] = recentMessages
      .reverse()
      .map((m) => ({
        role: m.role.toLowerCase() as ProviderMessage['role'],
        content: m.content,
      }));

    let systemPrompt = channel.agent.systemPrompt;
    if (kbContext) systemPrompt += '\n\n' + kbContext;

    const modelId = channel.modelOverride ?? channel.agent.model;
    const { provider, apiModelId } = getProvider(modelId);
    const startTime = Date.now();

    const result = await provider.chat({
      model: apiModelId,
      messages: providerMessages,
      systemPrompt,
      stream: false,
    });

    const latencyMs = Date.now() - startTime;

    await prisma.channelMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: result.content,
        modelUsed: modelId,
        tokensIn: result.usage?.inputTokens,
        tokensOut: result.usage?.outputTokens,
        latencyMs,
      },
    });

    await incrementUsage(
      channel.userId,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0
    );

    // Respond to Discord interaction
    return NextResponse.json({
      type: 4,
      data: {
        content: result.content.slice(0, 2000), // Discord 2000 char limit
      },
    });
  } catch (error) {
    console.error('[discord webhook]', error);
    return NextResponse.json(
      { type: 4, data: { content: 'Erro interno ao processar mensagem.' } },
      { status: 200 }
    );
  }
}
