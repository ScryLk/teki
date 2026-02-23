import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@teki/shared';
import { getProvider } from '@/lib/ai/router';
import type { ProviderMessage } from '@/lib/ai/types';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Você é o Teki, um assistente especializado em suporte técnico de TI.
Responda sempre em português do Brasil. Seja direto, técnico e prático.
Quando receber uma imagem, analise-a e descreva o problema detectado.
Baseie suas respostas em boas práticas de TI e forneça passos claros para resolução.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    messages,
    model: requestedModel,
    screenshot,
    screenshotMimeType,
    context,
    stream = false,
  } = body;

  const modelId = requestedModel ?? 'gemini-flash';
  const modelInfo = getModelById(modelId);

  if (!modelInfo) {
    return NextResponse.json(
      { error: { code: 'MODEL_NOT_AVAILABLE', message: `Modelo "${modelId}" não encontrado.` } },
      { status: 400 }
    );
  }

  const providerMessages: ProviderMessage[] = (messages ?? []).map(
    (m: { role: string; content: string }) => ({
      role: m.role as ProviderMessage['role'],
      content: m.content,
    })
  );

  if (screenshot && providerMessages.length > 0) {
    const lastUser = [...providerMessages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      lastUser.image = {
        base64: screenshot,
        mimeType: (screenshotMimeType ?? 'image/png') as 'image/jpeg' | 'image/png',
      };
    }
  }

  let systemPrompt = SYSTEM_PROMPT;
  if (context) {
    const lines = ['\n[CONTEXTO DO ATENDIMENTO]'];
    if (context.sistema) lines.push(`Sistema: ${context.sistema}`);
    if (context.versao) lines.push(`Versão: ${context.versao}`);
    if (context.ambiente) lines.push(`Ambiente: ${context.ambiente}`);
    if (context.sistemaOperacional) lines.push(`S.O.: ${context.sistemaOperacional}`);
    if (context.mensagemErro) lines.push(`Erro reportado: ${context.mensagemErro}`);
    if (context.nivelTecnico) lines.push(`Nível técnico: ${context.nivelTecnico}`);
    lines.push('[FIM DO CONTEXTO]');
    systemPrompt += lines.join('\n');
  }

  try {
    const { provider, apiModelId } = getProvider(modelId);

    if (stream) {
      const streamResult = await provider.chatStream({
        model: apiModelId,
        messages: providerMessages,
        systemPrompt,
        stream: true,
      });

      return new Response(streamResult, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Teki-Model': modelId,
        },
      });
    }

    const result = await provider.chat({
      model: apiModelId,
      messages: providerMessages,
      systemPrompt,
      stream: false,
    });

    return NextResponse.json(
      { content: result.content, model: modelId, usage: result.usage },
      { headers: { 'X-Teki-Model': modelId } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[chat route]', message);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message } },
      { status: 500 }
    );
  }
}
