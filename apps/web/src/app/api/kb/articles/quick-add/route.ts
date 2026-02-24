import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { KbAiAssistant } from '@/lib/kb/ai-assistant';
import { checkKbAction } from '@/lib/kb/kb-limits';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Texto deve ter no mínimo 50 caracteres' },
        { status: 400 }
      );
    }

    // Check limits
    const articleCheck = await checkKbAction(user.id, user.planId, 'kb:create_article');
    if (!articleCheck.allowed) {
      return NextResponse.json(
        { error: articleCheck.reason, upgradeRequired: articleCheck.upgradeRequired },
        { status: 403 }
      );
    }

    const aiCheck = await checkKbAction(user.id, user.planId, 'kb:ai_suggestion');
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: aiCheck.reason, upgradeRequired: aiCheck.upgradeRequired },
        { status: 403 }
      );
    }

    // Get categories and existing tags
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
    const categoryOptions = categories.map((c) => ({
      ...c,
      articleCount: 0,
    }));

    // AI analysis
    const assistant = new KbAiAssistant();
    const result = await assistant.analyzeQuickAdd({
      text: text.trim(),
      categories: categoryOptions,
      existingTags,
    });

    // Check for duplicates
    const duplicateCheck = await assistant.checkDuplicate({
      title: result.suggestion.title,
      content: text.trim(),
      userId: user.id,
    });

    return NextResponse.json({
      suggestion: {
        ...result.suggestion,
        duplicateWarning: duplicateCheck.isDuplicate
          ? {
              articleId: duplicateCheck.existingArticle?.id,
              articleTitle: duplicateCheck.existingArticle?.title,
              similarity: duplicateCheck.similarity,
            }
          : undefined,
      },
      ai: {
        model: result.aiModel,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
      },
      categories: categoryOptions,
    });
  } catch (error) {
    console.error('POST /api/kb/articles/quick-add error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao analisar texto' },
      { status: 500 }
    );
  }
}
