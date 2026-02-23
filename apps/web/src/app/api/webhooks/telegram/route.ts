import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProvider } from '@/lib/ai/router';
import { searchKnowledgeBase, formatKBContext } from '@/lib/kb/search';
import { incrementUsage } from '@/lib/plan-limits';
import type { ProviderMessage } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ status: 'ignored' });
    }

    const chatId = String(message.chat.id);
    const text = message.text;
    const senderName =
      [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ') ||
      message.from?.username ||
      'User';

    // Find matching Telegram channel
    const channels = await prisma.channel.findMany({
      where: {
        platform: 'TELEGRAM',
        status: 'ACTIVE',
        isActive: true,
      },
      include: { agent: true, user: true },
    });

    // For Telegram, we match by the bot token being valid
    // In practice, each webhook URL is unique per bot
    const channel = channels[0]; // Simplified: match first active Telegram channel
    if (!channel) {
      return NextResponse.json({ status: 'no channel' });
    }

    // Get or create conversation
    const conversation = await prisma.channelConversation.upsert({
      where: {
        channelId_externalUserId: { channelId: channel.id, externalUserId: chatId },
      },
      update: { lastMessageAt: new Date(), messageCount: { increment: 1 } },
      create: {
        channelId: channel.id,
        externalUserId: chatId,
        externalUserName: senderName,
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

    // RAG context
    let kbContext = '';
    const docCount = await prisma.document.count({
      where: { agentId: channel.agentId, status: 'INDEXED' },
    });
    if (docCount > 0) {
      const results = await searchKnowledgeBase(channel.agentId, text);
      kbContext = formatKBContext(results);
    }

    // Build messages
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

    // Call AI
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

    // Save assistant message
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

    // Increment usage
    await incrementUsage(
      channel.userId,
      result.usage?.inputTokens ?? 0,
      result.usage?.outputTokens ?? 0
    );

    // Send reply via Telegram
    const config = channel.platformConfig as Record<string, string>;
    await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: result.content,
          parse_mode: 'Markdown',
        }),
      }
    );

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[telegram webhook]', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
