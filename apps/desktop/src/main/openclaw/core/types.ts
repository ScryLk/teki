import type { ChannelConfig, ChannelStatus, IncomingMessage, OpenClawChannelId, ChannelAuthType } from '@teki/shared';

export abstract class BaseChannel {
  abstract id: OpenClawChannelId;
  abstract displayName: string;
  abstract authType: ChannelAuthType;

  protected status: ChannelStatus = 'idle';
  protected config: ChannelConfig | null = null;
  protected errorMessage?: string;
  protected detail?: string;
  protected connectedAt?: string;

  abstract connect(config: ChannelConfig): Promise<void>;
  abstract disconnect(): Promise<void>;

  getStatus(): ChannelStatus {
    return this.status;
  }

  getDetail(): string | undefined {
    return this.detail;
  }

  getError(): string | undefined {
    return this.errorMessage;
  }

  getConnectedAt(): string | undefined {
    return this.connectedAt;
  }

  getConfig(): ChannelConfig | null {
    return this.config;
  }

  async getQRCode(): Promise<string | null> {
    return null;
  }

  async getOAuthUrl(): Promise<string | null> {
    return null;
  }

  // Injected by ChannelRegistry
  onMessage?: (msg: IncomingMessage) => void;
  onStatusChange?: (status: ChannelStatus, detail?: string, error?: string, qrDataUrl?: string) => void;

  protected emitStatus(status: ChannelStatus, detail?: string, error?: string, qrDataUrl?: string): void {
    this.status = status;
    this.detail = detail;
    this.errorMessage = error;
    if (status === 'connected') this.connectedAt = new Date().toISOString();
    this.onStatusChange?.(status, detail, error, qrDataUrl);
  }
}
