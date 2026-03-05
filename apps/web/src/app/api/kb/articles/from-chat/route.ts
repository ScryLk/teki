import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { KbAiAssistant } from '@/lib/kb/ai-assistant';
import { checkKbAction } from '@/lib/kb/kb-limits';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { chatSessionId, ticketId, ticketCategory } = await req.json();

    // Check insertion mode
    const modeCheck = await checkKbAction(user.id, user.planId, 'kb:insertion_mode', {
      mode: 'from_chat',
    });
    if (!modeCheck.allowed) {
      return NextResponse.json(
        { error: modeCheck.reason, upgradeRequired: modeCheck.upgradeRequired },
        { status: 403 }
      );
    }

    if (!chatSessionId) {
      return NextResponse.json(
        { error: 'chatSessionId é obrigatório' },
        { status: 400 }
      );
    }

    const aiCheck = await checkKbAction(user.id, user.planId, 'kb:ai_suggestion');
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: aiCheck.reason, upgradeRequired: aiCheck.upgradeRequired },
        { status: 403 }
      );
    }

    // Fetch chat messages
    const conversation = await prisma.conversation.findFirst({
      where: { id: chatSessionId, createdBy: user.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    const senderTypeToRole: Record<string, string> = {
      USER_SENDER: 'user',
      AI_SENDER: 'assistant',
      SYSTEM_SENDER: 'system',
      BOT_SENDER: 'assistant',
    };

    const chatMessages = conversation.messages.map((m) => ({
      role: senderTypeToRole[m.senderType] ?? 'user',
      content: m.content ?? '',
    }));

    if (chatMessages.length < 2) {
      return NextResponse.json(
        { error: 'Conversa muito curta para extrair artigo' },
        { status: 400 }
      );
    }

    // Get categories and tags
    const [categories, tagsResult] = await Promise.all([
      prisma.kbCategory.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, slug: true, parentId: true },
      }),
      prisma.kbArticle.findMany({
        where: { userId: user.id },
        select: { tags: true },
        distinct: ['tags'],
      }),
    ]);

    const existingTags = [...new Set(tagsResult.flatMap((a) => a.tags))];
    const categoryOptions = categories.map((c) => ({ ...c, articleCount: 0 }));

    // AI analysis
    const assistant = new KbAiAssistant();
    const result = await assistant.analyzeChatSession({
      messages: chatMessages,
      ticketId,
      ticketCategory,
      categories: categoryOptions,
      existingTags,
    });

    return NextResponse.json({
      suggestion: result.suggestion,
      chat: {
        sessionId: chatSessionId,
        messageCount: chatMessages.length,
        ticketId,
      },
      ai: {
        model: result.aiModel,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
      },
      categories: categoryOptions,
    });
  } catch (error) {
    console.error('POST /api/kb/articles/from-chat error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao analisar conversa' },
      { status: 500 }
    );
  }
}
