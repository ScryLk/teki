import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { id } = await params;

    const channel = await prisma.channel.findFirst({
      where: { id, userId: user.id },
    });

    if (!channel) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Canal não encontrado.' } }, { status: 404 });
    }

    // Validate platform credentials based on platform type
    const config = channel.platformConfig as Record<string, string>;
    let valid = false;
    let message = '';

    switch (channel.platform) {
      case 'WHATSAPP': {
        valid = !!(config.phoneNumberId && config.accessToken);
        message = valid ? 'Credenciais WhatsApp válidas.' : 'phoneNumberId e accessToken necessários.';
        break;
      }
      case 'TELEGRAM': {
        if (config.botToken) {
          const res = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
          valid = res.ok;
          message = valid ? 'Bot Telegram conectado.' : 'Token do bot inválido.';
        } else {
          message = 'botToken necessário.';
        }
        break;
      }
      case 'DISCORD': {
        valid = !!(config.botToken && config.applicationId);
        message = valid ? 'Credenciais Discord configuradas.' : 'botToken e applicationId necessários.';
        break;
      }
      case 'SLACK': {
        valid = !!(config.botToken && config.signingSecret);
        message = valid ? 'Credenciais Slack configuradas.' : 'botToken e signingSecret necessários.';
        break;
      }
    }

    if (valid) {
      await prisma.channel.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
    }

    return NextResponse.json({ valid, message, platform: channel.platform });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
