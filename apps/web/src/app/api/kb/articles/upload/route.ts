import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { KbAiAssistant } from '@/lib/kb/ai-assistant';
import { checkKbAction } from '@/lib/kb/kb-limits';
import { extractText } from '@/lib/text-extraction';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    // Check insertion mode
    const modeCheck = await checkKbAction(user.id, user.planId, 'kb:insertion_mode', {
      mode: 'file_upload',
    });
    if (!modeCheck.allowed) {
      return NextResponse.json(
        { error: modeCheck.reason, upgradeRequired: modeCheck.upgradeRequired },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
    }

    // Check file size
    const fileCheck = await checkKbAction(user.id, user.planId, 'kb:upload_file', {
      fileSize: file.size,
    });
    if (!fileCheck.allowed) {
      return NextResponse.json(
        { error: fileCheck.reason, upgradeRequired: fileCheck.upgradeRequired },
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

    // Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = getFileType(file.type);
    let extractedText: string;
    let pageCount: number | undefined;

    if (fileType === 'txt' || fileType === 'md') {
      extractedText = buffer.toString('utf-8');
    } else {
      extractedText = await extractText(buffer, fileType);
    }

    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

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
    const result = await assistant.analyzeFileContent({
      extractedText,
      fileName: file.name,
      fileType: file.type,
      categories: categoryOptions,
      existingTags,
    });

    return NextResponse.json({
      suggestion: result.suggestion,
      extraction: {
        text: extractedText.slice(0, 2000),
        wordCount,
        pageCount,
        method: fileType === 'txt' || fileType === 'md' ? 'plain_read' : `${fileType}_parse`,
      },
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      ai: {
        model: result.aiModel,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
      },
      categories: categoryOptions,
    });
  } catch (error) {
    console.error('POST /api/kb/articles/upload error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}

function getFileType(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'docx';
    case 'text/plain':
      return 'txt';
    case 'text/markdown':
      return 'md';
    default:
      return 'unknown';
  }
}
