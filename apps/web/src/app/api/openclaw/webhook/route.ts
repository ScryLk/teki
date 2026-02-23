import { NextRequest, NextResponse } from 'next/server';
import {
  findOrCreateChannelUser,
  getHistory,
  appendMessages,
  findValidVerification,
  deleteVerification,
  linkChannelUser,
} from '@/lib/channel-store';
import { chatWithAnthropic } from '@/lib/anthropic-webhook';

export const runtime = 'nodejs';

// ── Rate limiting (in-memory) ─────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(sender: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sender);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(sender, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(channel: string, kbContext: string): string {
  const channelName =
    ({ whatsapp: 'WhatsApp', telegram: 'Telegram', discord: 'Discord', slack: 'Slack', signal: 'Signal' } as Record<string, string>)[channel] ?? channel;

  let prompt = `Você é o Teki, um assistente de suporte técnico com IA.

O usuário está conversando pelo ${channelName}. Adapte suas respostas para mensagens de chat:
- Seja direto e prático
- Use quebras de linha para facilitar leitura no celular
- Numere passos de forma simples (1, 2, 3...)
- Limite respostas a ~500 palavras
- Se a solução for longa, ofereça continuar em partes
- Responda em português do Brasil`;

  if (kbContext) {
    prompt += `

---
BASE DE CONHECIMENTO:
Os seguintes trechos foram encontrados e podem ser relevantes:

${kbContext}

Use essas informações quando aplicável. Combine com seu conhecimento técnico.`;
  }

  prompt += `

---
REGRAS:
1. Se tem screenshot/imagem, analise visualmente
2. Se a KB tem informações relevantes, use-as
3. Se a KB não tem nada, use seu próprio conhecimento — nunca diga "não encontrei na base de conhecimento" e pare
4. Seja direto com soluções práticas`;

  return prompt;
}

// ── Channel name helper ───────────────────────────────────────────────────────

function getChannelDisplayName(channel: string): string {
  const names: Record<string, string> = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    discord: 'Discord',
    slack: 'Slack',
    signal: 'Signal',
    imessage: 'iMessage',
  };
  return names[channel] ?? channel;
}

// ── Link code handler ─────────────────────────────────────────────────────────

const LINK_CODE_REGEX = /^TEKI\s+(\d{6})$/i;

async function handleLinkCode(
  code: string,
  sender: string,
  senderName: string,
  channel: string
): Promise<NextResponse> {
  const verification = await findValidVerification(code, channel);

  if (!verification) {
    return NextResponse.json({
      response:
        'Código inválido ou expirado. Gere um novo código em teki.com.br/configuracoes.',
    });
  }

  await linkChannelUser(sender, channel, verification.id);
  await deleteVerification(verification.id);

  return NextResponse.json({
    response: `Conta vinculada com sucesso! Agora você pode usar o Teki pelo ${getChannelDisplayName(channel)}. Envie sua primeira pergunta de suporte técnico.`,
  });
}

// ── Validation ────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
const MAX_BASE64_CHARS = 5 * 1024 * 1024 * 1.37; // ~5MB in base64

interface WebhookBody {
  message: string;
  sender: string;
  senderName?: string;
  channel: string;
  sessionKey: string;
  media?: {
    type: string;
    base64: string;
    mimeType: string;
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  const token =
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    req.headers.get('x-teki-token');

  if (!token || token !== process.env.OPENCLAW_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: WebhookBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    message: rawMessage,
    sender,
    senderName = 'Usuário',
    channel,
    sessionKey,
    media,
  } = body;

  // 2. Validate required fields
  if (!rawMessage || !sender || !channel || !sessionKey) {
    return NextResponse.json(
      { error: 'Campos obrigatórios: message, sender, channel, sessionKey' },
      { status: 400 }
    );
  }

  // 3. Sanitize
  const message = String(rawMessage).trim().slice(0, 5000);
  if (!message) {
    return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
  }

  // 4. Validate media if present
  let screenshot: string | null = null;
  let mimeType: AllowedMimeType = 'image/jpeg';
  if (media?.type === 'image' && media.base64) {
    if (!ALLOWED_MIME_TYPES.includes(media.mimeType as AllowedMimeType)) {
      return NextResponse.json(
        { error: 'Tipo de mídia não suportado. Use image/jpeg ou image/png.' },
        { status: 400 }
      );
    }
    if (media.base64.length > MAX_BASE64_CHARS) {
      return NextResponse.json(
        { error: 'Imagem excede o limite de 5MB.' },
        { status: 400 }
      );
    }
    screenshot = media.base64;
    mimeType = media.mimeType as AllowedMimeType;
  }

  // 5. Rate limiting
  if (!checkRateLimit(sender)) {
    return NextResponse.json(
      {
        response:
          'Você enviou muitas mensagens. Aguarde um minuto e tente novamente.',
      },
      { status: 429 }
    );
  }

  // 6. Handle link code
  const linkMatch = message.match(LINK_CODE_REGEX);
  if (linkMatch) {
    return handleLinkCode(linkMatch[1], sender, senderName, channel);
  }

  try {
    // 7. Find or create channel user
    await findOrCreateChannelUser(sender, senderName, channel);

    // 8. Load conversation history
    const history = await getHistory(sessionKey, 10);

    // 9. Build system prompt
    const kbContext = '';
    const sources: string[] = [];

    // 10. Build system prompt
    const systemPrompt = buildSystemPrompt(channel, kbContext);

    // 11. Call Anthropic
    const response = await chatWithAnthropic({
      systemPrompt,
      history,
      message,
      screenshot,
      mimeType,
    });

    // 12. Persist messages
    await appendMessages(sessionKey, [
      { role: 'user', content: message, timestamp: Date.now() },
      { role: 'assistant', content: response, timestamp: Date.now() },
    ]);

    // 13. Return response
    return NextResponse.json({
      response,
      sources,
      confidence: kbContext ? 'high' : 'medium',
    });
  } catch (error) {
    console.error('OpenClaw webhook error:', error);
    return NextResponse.json(
      {
        response:
          'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.',
        error: true,
      },
      { status: 500 }
    );
  }
}
