import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { KbAiAssistant } from '@/lib/kb/ai-assistant';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    const assistant = new KbAiAssistant();
    const result = await assistant.checkDuplicate({
      title,
      content,
      userId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/kb/articles/check-duplicate error:', error);
    if ((error as Error).name === 'AuthError') {
      return NextResponse.json({ error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao verificar duplicata' },
      { status: 500 }
    );
  }
}
