import { App as SlackApp } from '@slack/bolt';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';
import { withTimeout } from '@teki/shared';

export class SlackChannel extends BaseChannel {
  id = 'slack' as const;
  displayName = 'Slack';
  authType = 'oauth' as const;

  private app: SlackApp | null = null;

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.botToken || !config.signingSecret) {
      throw new Error('Bot Token e Signing Secret são obrigatórios');
    }

    this.config = config;
    this.emitStatus('waiting', 'Conectando...');

    try {
      this.app = new SlackApp({
        token: config.botToken,
        signingSecret: config.signingSecret,
        socketMode: true,
        appToken: config.oauthToken,
      });

      this.app.message(async ({ message, say }) => {
        if (message.subtype) return; // Skip system messages
        const msg = message as { user?: string; text?: string; ts?: string; channel?: string };
        if (!msg.text || !msg.user) return;

        const incoming: IncomingMessage = {
          channelId: 'slack',
          senderId: msg.user,
          senderName: msg.user,
          text: msg.text,
          sessionKey: `slack:${msg.channel}:${msg.user}`,
          timestamp: parseFloat(msg.ts ?? '0') * 1000 || Date.now(),
        };

        this.onMessage?.(incoming);
      });

      await withTimeout(this.app.start(), 10_000, 'slack:start');
      this.emitStatus('connected', 'Workspace conectado');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      throw err;
    }
  }

  async getOAuthUrl(): Promise<string | null> {
    if (!this.config?.clientId) return null;
    const scopes = 'channels:history,chat:write,app_mentions:read,im:history';
    return `https://slack.com/oauth/v2/authorize?client_id=${this.config.clientId}&scope=${scopes}`;
  }

  async disconnect(): Promise<void> {
    if (this.app) {
      await this.app.stop();
      this.app = null;
    }
    this.emitStatus('idle');
  }
}
