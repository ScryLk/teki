import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { user: _user } = await requireAuth(req);
    const { provider } = await params;
    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'key obrigatória.' } },
        { status: 400 }
      );
    }

    let valid = false;
    let message = '';

    switch (provider) {
      case 'gemini': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        valid = res.ok;
        message = valid ? 'Chave Gemini válida.' : 'Chave Gemini inválida.';
        break;
      }
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        valid = res.ok;
        message = valid ? 'Chave OpenAI válida.' : 'Chave OpenAI inválida.';
        break;
      }
      case 'anthropic': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'hi' }],
          }),
        });
        // 200 or 429 (rate limited but key is valid)
        valid = res.ok || res.status === 429;
        message = valid ? 'Chave Anthropic válida.' : 'Chave Anthropic inválida.';
        break;
      }
      case 'ollama': {
        try {
          const res = await fetch(`${key}/api/tags`, {
            signal: AbortSignal.timeout(5000),
          });
          valid = res.ok;
          message = valid ? 'Ollama conectado.' : 'Não foi possível conectar ao Ollama.';
        } catch {
          message = 'Não foi possível conectar ao Ollama.';
        }
        break;
      }
      default:
        return NextResponse.json(
          { error: { code: 'BAD_REQUEST', message: `Provider "${provider}" não suportado.` } },
          { status: 400 }
        );
    }

    return NextResponse.json({ valid, message, provider });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
