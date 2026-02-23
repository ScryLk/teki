import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getProvider } from '@/lib/ai/router';
import { searchKnowledgeBase, formatKBContext } from '@/lib/kb/search';
import { incrementUsage } from '@/lib/plan-limits';
import type { ProviderMessage } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    // Slack URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Verify Slack signature
    const channels = await prisma.channel.findMany({
      where: { platform: 'SLACK', status: 'ACTIVE', isActive: true },
      include: { agent: true, user: true },
    });

    const channel = channels.find((c) => {
      const config = c.platformConfig as Record<string, string>;
      if (!config.signingSecret) return false;

      const timestamp = req.headers.get('x-slack-request-timestamp') ?? '';
      const slackSignature = req.headers.get('x-slack-signature') ?? '';
      const baseString = `v0:${timestamp}:${rawBody}`;
      const expectedSignature =
        'v0=' +
        crypto
          .createHmac('sha256', config.signingSecret)
          .update(baseString)
          .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(slackSignature),
        Buffer.from(expectedSignature)
      );
    });

    if (!channel) {
      return NextResponse.json({ status: 'no channel' }, { status: 200 });
    }

    // Handle event callbacks
    if (body.type !== 'event_callback') {
      return NextResponse.json({ status: 'ignored' });
    }

    const event = body.event;

    // Only respond to messages (not bot messages, not edits)
    if (
      event?.type !== 'message' ||
      event.subtype ||
      event.bot_id
    ) {
      return NextResponse.json({ status: 'ignored' });
    }

    const userId = event.user;
    const text = event.text ?? '';
    const slackChannel = event.channel;

    if (!userId || !text) {
      return NextResponse.json({ status: 'ignored' });
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

    // Send reply via Slack
    const config = channel.platformConfig as Record<string, string>;
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackChannel,
        text: result.content,
        thread_ts: event.thread_ts ?? event.ts,
      }),
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[slack webhook]', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
