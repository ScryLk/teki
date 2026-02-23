import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getProvider } from '@/lib/ai/router';
import { searchKnowledgeBase, formatKBContext } from '@/lib/kb/search';
import { incrementUsage } from '@/lib/plan-limits';
import type { ProviderMessage } from '@/lib/ai/types';

const META_APP_SECRET = process.env.META_APP_SECRET ?? '';

// GET: Meta webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST: Incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify signature
    if (META_APP_SECRET) {
      const signature = req.headers.get('x-hub-signature-256');
      const expectedSignature =
        'sha256=' +
        crypto.createHmac('sha256', META_APP_SECRET).update(rawBody).digest('hex');

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      return NextResponse.json({ status: 'no message' });
    }

    const message = value.messages[0];
    const from = message.from;
    const text = message.text?.body ?? '';
    const phoneNumberId = value.metadata?.phone_number_id;

    if (!text || !from || !phoneNumberId) {
      return NextResponse.json({ status: 'ignored' });
    }

    // Find channel by phone number ID
    const channels = await prisma.channel.findMany({
      where: {
        platform: 'WHATSAPP',
        status: 'ACTIVE',
        isActive: true,
      },
      include: { agent: true, user: true },
    });

    const channel = channels.find((c) => {
      const config = c.platformConfig as Record<string, string>;
      return config.phoneNumberId === phoneNumberId;
    });

    if (!channel) {
      return NextResponse.json({ status: 'no channel' });
    }

    // Get or create conversation
    const conversation = await prisma.channelConversation.upsert({
      where: {
        channelId_externalUserId: { channelId: channel.id, externalUserId: from },
      },
      update: { lastMessageAt: new Date(), messageCount: { increment: 1 } },
      create: {
        channelId: channel.id,
        externalUserId: from,
        externalUserName: value.contacts?.[0]?.profile?.name,
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

    // Build messages (last N from conversation)
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

    // Send reply via WhatsApp API
    const config = channel.platformConfig as Record<string, string>;
    await fetch(
      `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: result.content },
        }),
      }
    );

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[whatsapp webhook]', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
