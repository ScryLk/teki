import { IgApiClient } from 'instagram-private-api';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';

export class InstagramChannel extends BaseChannel {
  id = 'instagram' as const;
  displayName = 'Instagram';
  authType = 'oauth' as const;

  private ig: IgApiClient | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastChecked = Date.now();

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.username || !config.password) {
      throw new Error('Usuário e senha são obrigatórios');
    }

    this.config = config;
    this.emitStatus('waiting', 'Autenticando...');

    try {
      this.ig = new IgApiClient();
      this.ig.state.generateDevice(config.username);

      await this.ig.account.login(config.username, config.password);
      this.emitStatus('connected', `@${config.username}`);

      // Poll for new DMs every 10 seconds
      this.lastChecked = Date.now();
      this.pollTimer = setInterval(() => this.pollMessages(), 10000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      this.ig = null;
      throw err;
    }
  }

  private async pollMessages(): Promise<void> {
    if (!this.ig) return;

    try {
      const inbox = this.ig.feed.directInbox();
      const threads = await inbox.items();

      for (const thread of threads) {
        const items = thread.items ?? [];
        for (const item of items) {
          if (!item.text || !item.timestamp) continue;
          const ts = parseInt(String(item.timestamp).slice(0, 13));
          if (ts <= this.lastChecked) continue;
          if (item.user_id === thread.viewer_id) continue; // Skip own messages

          const incoming: IncomingMessage = {
            channelId: 'instagram',
            senderId: String(item.user_id),
            senderName: thread.thread_title ?? 'Usuário',
            text: item.text,
            sessionKey: `instagram:${thread.thread_id}`,
            timestamp: ts,
          };

          this.onMessage?.(incoming);
        }
      }

      this.lastChecked = Date.now();
    } catch (err) {
      console.error('[Instagram] Poll error:', err);
    }
  }

  async getOAuthUrl(): Promise<string | null> {
    // Meta Graph API OAuth URL
    if (!this.config?.clientId) return null;
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.config.clientId}&redirect_uri=http://localhost:47832/callback&scope=instagram_basic,instagram_manage_messages`;
  }

  async disconnect(): Promise<void> {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.ig = null;
    this.emitStatus('idle');
  }
}
