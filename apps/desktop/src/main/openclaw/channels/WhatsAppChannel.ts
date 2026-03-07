import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from '@whiskeysockets/baileys';
import { app } from 'electron';
import { join } from 'path';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';

export class WhatsAppChannel extends BaseChannel {
  id = 'whatsapp' as const;
  displayName = 'WhatsApp';
  authType = 'qrcode' as const;

  private sock: WASocket | null = null;
  private qrCode: string | null = null;
  private intentionalDisconnect = false;

  private get authDir(): string {
    return join(app.getPath('userData'), 'whatsapp-auth');
  }

  async connect(config: ChannelConfig): Promise<void> {
    this.config = config;
    this.intentionalDisconnect = false;
    this.emitStatus('waiting', 'Gerando QR code...');

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          this.emitStatus('waiting', 'Escaneie o QR code');
        }

        if (connection === 'open') {
          this.qrCode = null;
          const phone = this.sock?.user?.id?.split(':')[0] ?? '';
          this.emitStatus('connected', phone ? `+${phone}` : 'Conectado');
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })
            ?.output?.statusCode;
          const loggedOut = statusCode === DisconnectReason.loggedOut;

          if (!this.intentionalDisconnect && !loggedOut) {
            this.emitStatus('reconnecting', 'Reconectando...');
            setTimeout(() => this.connect(config), 3000);
          } else {
            this.emitStatus('idle');
          }
        }
      });

      this.sock.ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages) {
          if (msg.key.fromMe) continue;
          const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
          if (!text) continue;

          const incoming: IncomingMessage = {
            channelId: 'whatsapp',
            senderId: msg.key.remoteJid ?? '',
            senderName: msg.pushName ?? 'Usuário',
            text,
            sessionKey: `whatsapp:${msg.key.remoteJid}`,
            timestamp: (msg.messageTimestamp as number) * 1000 || Date.now(),
          };

          this.onMessage?.(incoming);
        }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      this.emitStatus('error', undefined, message);
      throw err;
    }
  }

  async getQRCode(): Promise<string | null> {
    if (!this.qrCode) return null;
    // Convert QR string to data URL using qrcode lib
    try {
      const QRCode = await import('qrcode');
      return await QRCode.toDataURL(this.qrCode, { width: 256 });
    } catch {
      return null;
    }
  }

  async sendReply(jid: string, text: string): Promise<void> {
    await this.sock?.sendMessage(jid, { text });
  }

  async disconnect(): Promise<void> {
    this.intentionalDisconnect = true;
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
    }
    this.qrCode = null;
    this.emitStatus('idle');
  }

  getSocket(): WASocket | null {
    return this.sock;
  }
}
