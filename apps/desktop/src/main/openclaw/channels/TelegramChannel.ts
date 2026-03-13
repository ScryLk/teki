import TelegramBot from 'node-telegram-bot-api';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';
import { withTimeout } from '@teki/shared';

export class TelegramChannel extends BaseChannel {
  id = 'telegram' as const;
  displayName = 'Telegram';
  authType = 'bottoken' as const;

  private bot: TelegramBot | null = null;

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.botToken) throw new Error('Bot token é obrigatório');

    // Stop any existing polling before starting a new one
    if (this.bot) {
      try { await this.bot.stopPolling(); } catch { /* ignore */ }
      this.bot = null;
    }

    this.config = config;
    this.emitStatus('waiting', 'Conectando...');

    try {
      this.bot = new TelegramBot(config.botToken, { polling: true });

      // Validate by getting bot info
      const me = await withTimeout(this.bot.getMe(), 10_000, 'telegram:getMe');
      this.emitStatus('connected', `@${me.username}`);

      this.bot.on('message', (msg) => {
        if (!msg.text || msg.from?.is_bot) return;

        const incoming: IncomingMessage = {
          channelId: 'telegram',
          senderId: String(msg.from?.id ?? msg.chat.id),
          senderName: msg.from?.first_name ?? 'Usuário',
          text: msg.text,
          sessionKey: `telegram:${msg.chat.id}`,
          timestamp: msg.date * 1000,
        };

        // Set up reply function by storing chatId
        const chatId = msg.chat.id;
        const originalOnMessage = this.onMessage;
        if (originalOnMessage) {
          // Route and reply
          this.handleMessage(incoming, chatId);
        }
      });

      this.bot.on('polling_error', (err) => {
        console.error('[Telegram] Polling error:', err.message);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      throw err;
    }
  }

  private async handleMessage(msg: IncomingMessage, chatId: number): Promise<void> {
    if (!this.onMessage) return;
    // onMessage triggers AgentRouter which returns response
    // We need to handle it via the registry's handleIncoming
    this.onMessage(msg);
  }

  async sendReply(chatId: number, text: string): Promise<void> {
    await this.bot?.sendMessage(chatId, text);
  }

  async disconnect(): Promise<void> {
    if (this.bot) {
      await this.bot.stopPolling();
      this.bot = null;
    }
    this.emitStatus('idle');
  }

  getBot(): TelegramBot | null {
    return this.bot;
  }
}
