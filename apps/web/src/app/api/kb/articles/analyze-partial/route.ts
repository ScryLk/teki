import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { KbAiAssistant } from '@/lib/kb/ai-assistant';
import { checkKbAction } from '@/lib/kb/kb-limits';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { title, content, category } = await req.json();

    // Need some content to work with
    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: 'Conteúdo insuficiente para sugestão (mín. 50 caracteres)' },
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

    const assistant = new KbAiAssistant();
    const result = await assistant.suggestFromPartialContent({
      title,
      content,
      category,
      categories: categoryOptions,
      existingTags,
    });

    return NextResponse.json({
      suggestion: result.suggestion,
      ai: {
        model: result.aiModel,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
      },
    });
  } catch (error) {
    console.error('POST /api/kb/articles/analyze-partial error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao analisar conteúdo parcial' },
      { status: 500 }
    );
  }
}
