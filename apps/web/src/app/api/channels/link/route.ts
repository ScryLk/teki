import { NextRequest, NextResponse } from 'next/server';
import { createVerification } from '@/lib/channel-store';

export const runtime = 'nodejs';

const CHANNEL_NAMES: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  discord: 'Discord',
  slack: 'Slack',
  signal: 'Signal',
  imessage: 'iMessage',
};

const SUPPORTED_CHANNELS = Object.keys(CHANNEL_NAMES);

export async function POST(req: NextRequest) {
  let body: { channel?: string; senderName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { channel, senderName = 'Usuário' } = body;

  if (!channel || !SUPPORTED_CHANNELS.includes(channel)) {
    return NextResponse.json(
      {
        error: `Canal inválido. Use: ${SUPPORTED_CHANNELS.join(', ')}`,
      },
      { status: 400 }
    );
  }

  try {
    const code = await createVerification('pending', senderName, channel);
    const channelName = CHANNEL_NAMES[channel];

    return NextResponse.json({
      code,
      channel,
      expiresInMinutes: 10,
      instruction: `Envie a mensagem "TEKI ${code}" no ${channelName} para vincular sua conta. O código expira em 10 minutos.`,
    });
  } catch (error) {
    console.error('Channel link error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar código de vinculação' },
      { status: 500 }
    );
  }
}
