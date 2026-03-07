import { Client, GatewayIntentBits, Events } from 'discord.js';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';

export class DiscordChannel extends BaseChannel {
  id = 'discord' as const;
  displayName = 'Discord';
  authType = 'bottoken' as const;

  private client: Client | null = null;

  async connect(config: ChannelConfig): Promise<void> {
    if (!config.botToken) throw new Error('Bot token é obrigatório');

    this.config = config;
    this.emitStatus('waiting', 'Conectando...');

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.DirectMessages,
        ],
      });

      this.client.once(Events.ClientReady, (c) => {
        this.emitStatus('connected', c.user.tag);
      });

      this.client.on(Events.MessageCreate, (message) => {
        // Ignore bot messages
        if (message.author.bot) return;

        const incoming: IncomingMessage = {
          channelId: 'discord',
          senderId: message.author.id,
          senderName: message.author.displayName ?? message.author.username,
          text: message.content,
          sessionKey: `discord:${message.channelId}:${message.author.id}`,
          timestamp: message.createdTimestamp,
        };

        this.onMessage?.(incoming);
      });

      this.client.on(Events.Error, (err) => {
        console.error('[Discord] Error:', err.message);
        this.emitStatus('error', undefined, err.message);
      });

      await this.client.login(config.botToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      throw err;
    }
  }

  async sendReply(channelId: string, text: string): Promise<void> {
    const channel = this.client?.channels.cache.get(channelId);
    if (channel?.isTextBased() && 'send' in channel) {
      await (channel as { send: (t: string) => Promise<unknown> }).send(text);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
    }
    this.emitStatus('idle');
  }

  getClient(): Client | null {
    return this.client;
  }
}
