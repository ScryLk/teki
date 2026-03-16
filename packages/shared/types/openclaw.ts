// ─── OpenClaw Channel Types ──────────────────────────────────────────────────

export type OpenClawChannelId =
  | 'discord'
  | 'whatsapp'
  | 'slack'
  | 'teams'
  | 'gemini'
  | 'telegram'
  | 'instagram';

export type ChannelAuthType = 'qrcode' | 'oauth' | 'apikey' | 'bottoken';

export type ChannelStatus = 'idle' | 'waiting' | 'connected' | 'error' | 'reconnecting';

export interface ChannelConfig {
  channelId: OpenClawChannelId;
  botToken?: string;
  apiKey?: string;
  oauthToken?: string;
  clientId?: string;
  clientSecret?: string;
  signingSecret?: string;
  appId?: string;
  appPassword?: string;
  tenantId?: string;
  username?: string;
  password?: string;
  welcomeMessage?: string;
  autoReconnect?: boolean;
}

export interface ChannelMeta {
  id: OpenClawChannelId;
  displayName: string;
  authType: ChannelAuthType;
  color: string;
  description: string;
}

export interface ChannelInfo {
  id: OpenClawChannelId;
  displayName: string;
  authType: ChannelAuthType;
  status: ChannelStatus;
  detail?: string;
  connectedAt?: string;
  error?: string;
  config?: ChannelConfig;
  qrDataUrl?: string;
}

export interface IncomingMessage {
  channelId: OpenClawChannelId;
  senderId: string;
  senderName: string;
  text: string;
  sessionKey: string;
  timestamp: number;
  /** Extra context injected into system prompt (e.g. watched window name) */
  systemContext?: string;
}

export interface ChannelStatusEvent {
  channelId: OpenClawChannelId;
  status: ChannelStatus;
  detail?: string;
  error?: string;
  qrDataUrl?: string;
}
