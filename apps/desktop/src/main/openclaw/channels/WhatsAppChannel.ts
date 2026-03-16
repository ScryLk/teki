import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  type WASocket,
} from '@whiskeysockets/baileys';
import { app } from 'electron';
import { join } from 'path';
import { rmSync } from 'fs';
import { BaseChannel } from '../core/types';
import type { ChannelConfig, IncomingMessage } from '@teki/shared';

export class WhatsAppChannel extends BaseChannel {
  id = 'whatsapp' as const;
  displayName = 'WhatsApp';
  authType = 'qrcode' as const;

  private sock: WASocket | null = null;
  private qrCode: string | null = null;
  private intentionalDisconnect = false;
  private reconnectAttempts = 0;
  private maxReconnects = 5;

  private get authDir(): string {
    return join(app.getPath('userData'), 'whatsapp-auth');
  }

  async connect(config: ChannelConfig): Promise<void> {
    // If this is a fresh user-initiated connection (not an auto-reconnect),
    // reset the counter and clear stale auth to force a new QR code.
    const isReconnect = this.status === 'reconnecting';
    this.config = config;
    this.intentionalDisconnect = false;
    if (!isReconnect) {
      this.reconnectAttempts = 0;
      // Remove stale auth state so Baileys generates a fresh QR code
      try { rmSync(this.authDir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
    this.emitStatus('waiting', 'Gerando QR code...');

    // Clean up previous socket and listeners before creating a new one
    if (this.sock) {
      try {
        this.sock.ev.removeAllListeners('creds.update');
        this.sock.ev.removeAllListeners('connection.update');
        this.sock.ev.removeAllListeners('messages.upsert');
        this.sock.end(undefined);
      } catch { /* ignore cleanup errors */ }
      this.sock = null;
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);

      // Fetch the latest WhatsApp Web version to avoid "Connection Failure"
      let version: [number, number, number] | undefined;
      try {
        const result = await fetchLatestBaileysVersion();
        version = result.version;
      } catch {
        /* use default version */
      }

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        ...(version && { version }),
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          // Generate QR data URL and send it directly via status event
          let qrDataUrl: string | undefined;
          try {
            const QRCode = await import('qrcode');
            qrDataUrl = await QRCode.toDataURL(qr, { width: 256 });
          } catch { /* ignore */ }
          this.emitStatus('waiting', 'Escaneie o QR code', undefined, qrDataUrl);
        }

        if (connection === 'open') {
          this.qrCode = null;
          this.reconnectAttempts = 0;
          const phone = this.sock?.user?.id?.split(':')[0] ?? '';
          this.emitStatus('connected', phone ? `+${phone}` : 'Conectado');
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })
            ?.output?.statusCode;
          const loggedOut = statusCode === DisconnectReason.loggedOut;

          if (!this.intentionalDisconnect && !loggedOut && this.reconnectAttempts < this.maxReconnects) {
            this.reconnectAttempts++;
            this.emitStatus('reconnecting', `Reconectando (${this.reconnectAttempts}/${this.maxReconnects})...`);
            setTimeout(() => this.connect(config), 3000 * this.reconnectAttempts);
          } else {
            if (this.reconnectAttempts >= this.maxReconnects) {
              this.emitStatus('error', undefined, 'Máximo de tentativas de reconexão atingido.');
            } else {
              this.emitStatus('idle');
            }
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
