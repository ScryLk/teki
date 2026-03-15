import { BrowserWindow } from 'electron';
import { IPC_CHANNELS, withTimeout } from '@teki/shared';
import type { ChannelInfo, ChannelConfig, ChannelStatusEvent, OpenClawChannelId } from '@teki/shared';
import { BaseChannel } from './types';
import { AgentRouter } from './AgentRouter';
import * as sessionStore from './SessionStore';
import { safeSend } from '../../utils/safe-ipc';

import { DiscordChannel } from '../channels/DiscordChannel';
import { WhatsAppChannel } from '../channels/WhatsAppChannel';
import { SlackChannel } from '../channels/SlackChannel';
import { TeamsChannel } from '../channels/TeamsChannel';
import { GeminiChannel } from '../channels/GeminiChannel';
import { TelegramChannel } from '../channels/TelegramChannel';
import { InstagramChannel } from '../channels/InstagramChannel';

export class ChannelRegistry {
  private channels = new Map<OpenClawChannelId, BaseChannel>();
  private router = new AgentRouter();
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    const allChannels: BaseChannel[] = [
      new TelegramChannel(),
      new DiscordChannel(),
      new WhatsAppChannel(),
      new SlackChannel(),
      new TeamsChannel(),
      new GeminiChannel(),
      new InstagramChannel(),
    ];

    for (const ch of allChannels) {
      ch.onMessage = (msg) => this.handleIncoming(ch, msg);
      ch.onStatusChange = (status, detail, error) => {
        this.emitStatus({ channelId: ch.id, status, detail, error });
      };
      this.channels.set(ch.id, ch);
    }
  }

  setMainWindow(win: BrowserWindow): void {
    this.mainWindow = win;
  }

  listChannels(): ChannelInfo[] {
    const result: ChannelInfo[] = [];
    for (const ch of this.channels.values()) {
      result.push({
        id: ch.id,
        displayName: ch.displayName,
        authType: ch.authType,
        status: ch.getStatus(),
        detail: ch.getDetail(),
        connectedAt: ch.getConnectedAt(),
        error: ch.getError(),
        config: ch.getConfig() ?? undefined,
      });
    }
    return result;
  }

  async connect(channelId: OpenClawChannelId, config: ChannelConfig): Promise<void> {
    const ch = this.channels.get(channelId);
    if (!ch) throw new Error(`Canal "${channelId}" não encontrado`);

    await ch.connect(config);
    sessionStore.saveSession(channelId, config);
  }

  async disconnect(channelId: OpenClawChannelId): Promise<void> {
    const ch = this.channels.get(channelId);
    if (!ch) throw new Error(`Canal "${channelId}" não encontrado`);

    await ch.disconnect();
    sessionStore.removeSession(channelId);
  }

  async getQRCode(channelId: OpenClawChannelId): Promise<string | null> {
    const ch = this.channels.get(channelId);
    return ch?.getQRCode() ?? null;
  }

  async getOAuthUrl(channelId: OpenClawChannelId): Promise<string | null> {
    const ch = this.channels.get(channelId);
    return ch?.getOAuthUrl() ?? null;
  }

  getStatus(channelId: OpenClawChannelId): ChannelInfo | null {
    const ch = this.channels.get(channelId);
    if (!ch) return null;
    return {
      id: ch.id,
      displayName: ch.displayName,
      authType: ch.authType,
      status: ch.getStatus(),
      detail: ch.getDetail(),
      connectedAt: ch.getConnectedAt(),
      error: ch.getError(),
    };
  }

  getChannel(channelId: OpenClawChannelId): BaseChannel | undefined {
    return this.channels.get(channelId);
  }

  async reconnectSaved(): Promise<void> {
    const saved = sessionStore.getAllSessions();
    const entries = Object.entries(saved).filter(([, data]) => data.autoReconnect);

    if (entries.length === 0) return;

    console.log(`[OpenClaw] Reconectando ${entries.length} canal(is) em paralelo...`);

    const results = await Promise.allSettled(
      entries.map(([id, data]) => {
        console.log(`[OpenClaw] Reconectando ${id}...`);
        return withTimeout(
          this.connect(id as OpenClawChannelId, data.config),
          15_000,
          `reconnect:${id}`,
        );
      }),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const id = entries[i][0];
      if (result.status === 'rejected') {
        console.error(`[OpenClaw] Falha ao reconectar ${id}:`, result.reason);
      }
    }
  }

  private async handleIncoming(channel: BaseChannel, msg: import('@teki/shared').IncomingMessage): Promise<void> {
    try {
      console.log(`[OpenClaw] Incoming from ${channel.id}: "${msg.text}" by ${msg.senderName}`);
      const response = await this.router.route(msg);
      console.log(`[OpenClaw] Response: "${response.slice(0, 100)}..."`);

      // Send reply back through the channel
      await this.sendReply(channel, msg, response);

      sessionStore.appendLog({
        channelId: msg.channelId,
        sender: msg.senderName,
        text: msg.text,
        response,
        timestamp: msg.timestamp,
      });
    } catch (err) {
      console.error('[OpenClaw] Route error:', err);
      // Try to send error message back
      try {
        await this.sendReply(channel, msg, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
      } catch { /* ignore */ }
    }
  }

  private async sendReply(channel: BaseChannel, msg: import('@teki/shared').IncomingMessage, response: string): Promise<void> {
    try {
      switch (channel.id) {
        case 'telegram': {
          const tg = channel as TelegramChannel;
          const chatId = parseInt(msg.senderId) || parseInt(msg.sessionKey.split(':')[1]);
          await tg.sendReply(chatId, response);
          break;
        }
        case 'discord': {
          const dc = channel as DiscordChannel;
          const channelId = msg.sessionKey.split(':')[1];
          await dc.sendReply(channelId, response);
          break;
        }
        case 'whatsapp': {
          const wa = channel as WhatsAppChannel;
          await wa.sendReply(msg.senderId, response);
          break;
        }
        default:
          console.log(`[OpenClaw] Reply for ${channel.id}: ${response}`);
      }
    } catch (err) {
      console.error(`[OpenClaw] Failed to send reply on ${channel.id}:`, err);
    }
  }

  private emitStatus(event: ChannelStatusEvent): void {
    safeSend(this.mainWindow, IPC_CHANNELS.OPENCLAW_STATUS_CHANGED, {
      channelId: event.channelId,
      status: event.status,
      detail: event.detail ?? undefined,
      error: event.error ? String(event.error) : undefined,
    });
  }
}

export const channelRegistry = new ChannelRegistry();
