import type { WindowSource, WindowFrame } from './context';
import type { ChannelInfo, ChannelConfig, ChannelStatusEvent, OpenClawChannelId } from './openclaw';
import type { ConnectionHealth, ConnectionHealthEvent } from './connection';
import type { KBDocument, KBUploadPayload, KBSearchResult, KBStats, KBDocStatusEvent, KBChunk } from './kb';
// ─── AI Provider types ────────────────────────────────────────────────────────

export type AiProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama';

export type ApiKeyStatus = 'unconfigured' | 'valid' | 'invalid' | 'validating';

export interface ApiKeyValidationResult {
  valid: boolean;
  provider: AiProviderId;
  error?: string;
  models?: string[];
  latencyMs: number;
  checkedAt: string;
}

// ─── IPC Channel names ────────────────────────────────────────────────────────

export const IPC_CHANNELS = {
  // Window watching
  WATCH_GET_SOURCES: 'watch:getSources',
  WATCH_START: 'watch:start',
  WATCH_STOP: 'watch:stop',
  WATCH_FRAME: 'watch:frame',
  WATCH_WINDOW_CLOSED: 'watch:windowClosed',

  // Window detection
  WINDOW_ACTIVE: 'window:active',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll',

  // Tray
  TRAY_UPDATE: 'tray:update',

  // App
  APP_GET_VERSION: 'app:getVersion',

  // AI Validation
  AI_VALIDATE_KEY: 'ai:validateKey',

  // Auth
  AUTH_DEVICE_START: 'auth:device:start',
  AUTH_DEVICE_CANCEL: 'auth:device:cancel',
  AUTH_DEVICE_STATUS: 'auth:device:status',
  AUTH_LOGIN_CREDENTIALS: 'auth:loginCredentials',
  AUTH_SET_API_KEY: 'auth:setApiKey',
  AUTH_GET_STATUS: 'auth:getStatus',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_DELETE_ACCOUNT: 'auth:deleteAccount',
  AUTH_REGISTER: 'auth:register',

  // OpenClaw
  OPENCLAW_LIST_CHANNELS: 'openclaw:listChannels',
  OPENCLAW_CONNECT: 'openclaw:connect',
  OPENCLAW_DISCONNECT: 'openclaw:disconnect',
  OPENCLAW_GET_QR: 'openclaw:getQR',
  OPENCLAW_GET_OAUTH_URL: 'openclaw:getOAuthUrl',
  OPENCLAW_STATUS: 'openclaw:status',
  OPENCLAW_STATUS_CHANGED: 'openclaw:statusChanged',
  OPENCLAW_UPDATE_CONFIG: 'openclaw:updateConfig',

  // Connection Health
  CONNECTION_HEALTH_GET: 'connection:health:get',
  CONNECTION_HEALTH_STATUS: 'connection:health:status',

  // Display
  DISPLAY_SWITCH: 'display:switch',

  // Knowledge Base
  KB_LIST_DOCS: 'kb:docs:list',
  KB_UPLOAD_DOC: 'kb:docs:upload',
  KB_REMOVE_DOC: 'kb:docs:remove',
  KB_GET_DOC: 'kb:docs:get',
  KB_SEARCH: 'kb:search',
  KB_GET_STATS: 'kb:stats',
  KB_DOC_STATUS: 'kb:docs:status',
  KB_DOC_CHUNKS: 'kb:docs:chunks',

  // Teki Platform API Keys
  TEKI_APIKEYS_LIST:   'tekiApiKeys:list',
  TEKI_APIKEYS_CREATE: 'tekiApiKeys:create',
  TEKI_APIKEYS_REVOKE: 'tekiApiKeys:revoke',
  TEKI_APIKEYS_USAGE:  'tekiApiKeys:usage',

} as const;

// ─── Preload API exposed to renderer ─────────────────────────────────────────

export interface TekiAPI {
  // Window watching
  getAvailableWindows: () => Promise<WindowSource[]>;
  startWatching: (sourceId: string) => Promise<void>;
  stopWatching: () => Promise<void>;
  onWindowFrame: (callback: (frame: WindowFrame) => void) => () => void;
  onWindowClosed: (callback: (data: { sourceId: string }) => void) => () => void;

  // Settings
  getSetting: <T>(key: string) => Promise<T>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  getAllSettings: () => Promise<TekiSettings>;

  // Window detection
  onActiveWindow: (callback: (info: { title: string; processName: string }) => void) => () => void;

  // Tray actions
  onTraySelectWindow: (callback: () => void) => () => void;
  onTrayStopWatching: (callback: () => void) => () => void;

  // App info
  getVersion: () => Promise<string>;

  // AI Key Validation
  validateApiKey: (provider: AiProviderId, key: string) => Promise<ApiKeyValidationResult>;

  // Auth
  startDeviceAuth: () => Promise<{ userCode: string; deviceCode: string }>;
  cancelDeviceAuth: () => void;
  onAuthStatus: (callback: (data: { status: string; email?: string; name?: string }) => void) => () => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setApiKey: (key: string) => Promise<boolean>;
  getAuthStatus: () => Promise<{ isAuthenticated: boolean; email: string | null; name: string | null; plan?: string | null }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  registerAccount: (data: { email: string; firstName: string; lastName?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  onAuthExpired: (callback: () => void) => () => void;

  // OpenClaw
  openclawListChannels: () => Promise<ChannelInfo[]>;
  openclawConnect: (channelId: OpenClawChannelId, config: ChannelConfig) => Promise<void>;
  openclawDisconnect: (channelId: OpenClawChannelId) => Promise<void>;
  openclawGetQR: (channelId: OpenClawChannelId) => Promise<string | null>;
  openclawGetOAuthUrl: (channelId: OpenClawChannelId) => Promise<string | null>;
  openclawGetStatus: (channelId: OpenClawChannelId) => Promise<ChannelInfo | null>;
  onOpenclawStatusChanged: (callback: (event: ChannelStatusEvent) => void) => () => void;
  openclawUpdateConfig: (channelId: OpenClawChannelId, config: Partial<ChannelConfig>) => Promise<void>;

  // Display
  switchDisplay: () => Promise<{ success: boolean; error?: string }>;

  // Connection Health
  getConnectionHealth: () => Promise<ConnectionHealth>;
  onConnectionHealthChange: (callback: (event: ConnectionHealthEvent) => void) => () => void;

  // Knowledge Base
  kbListDocs: () => Promise<KBDocument[]>;
  kbUploadDoc: (payload: KBUploadPayload) => Promise<KBDocument>;
  kbRemoveDoc: (docId: string) => Promise<void>;
  kbGetDoc: (docId: string) => Promise<KBDocument | null>;
  kbSearch: (query: string, topK?: number) => Promise<KBSearchResult[]>;
  kbGetStats: () => Promise<KBStats>;
  kbGetDocChunks: (docId: string) => Promise<KBChunk[]>;
  onKbDocStatus: (callback: (event: KBDocStatusEvent) => void) => () => void;

  // Teki Platform API Keys
  tekiApiKeysList: () => Promise<TekiApiKeyListResult>;
  tekiApiKeysCreate: (data: { name: string; type: 'LIVE' | 'TEST'; expiresAt?: string }) => Promise<TekiApiKeyCreateResult>;
  tekiApiKeysRevoke: (id: string) => Promise<{ success: boolean }>;
  tekiApiKeysUsage: (id: string) => Promise<TekiApiKeyUsage>;

  // Floating window
  toggleFloating: () => Promise<void>;

  // Logging
  logAction: (event: string, details?: Record<string, unknown>) => void;
}

// ─── Teki API Key types ──────────────────────────────────────────────────────

export interface TekiApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  type: 'LIVE' | 'TEST';
  lastUsedAt: string | null;
  expiresAt: string | null;
  isRevoked: boolean;
  createdAt: string;
  monthlyUsage: {
    requests: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  };
}

export interface TekiApiKeyListResult {
  keys: TekiApiKey[];
  planLimit: number;
}

export interface TekiApiKeyCreateResult {
  id: string;
  key: string;
  message: string;
}

export interface TekiApiKeyUsage {
  period: string;
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  dailyBreakdown: Array<{ date: string; requests: number; tokensIn: number; tokensOut: number; costUsd: number }>;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface TekiSettings {
  // Capture
  captureInterval: 3 | 5 | 10 | 30;
  captureSource: string;
  captureQuality: 'low' | 'medium' | 'high';
  autoCapture: boolean;

  // Chat
  showSources: boolean;
  autoAttachScreenshot: boolean;
  chatHistoryDays: 30 | 60 | 90;

  // Context
  defaultSistema: string;
  defaultVersao: string;
  defaultAmbiente: 'producao' | 'homologacao' | 'dev';
  nivelTecnico: 'basico' | 'intermediario' | 'avancado';

  // Appearance
  catSize: 'sm' | 'md' | 'lg';
  showCat: boolean;
  layout: 'split' | 'chat-only';
  compactMode: boolean;

  // System
  startMinimized: boolean;
  startOnBoot: boolean;
  globalShortcut: string;
  language: 'pt-BR' | 'en';

  // AI Providers
  selectedModel: string;
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  ollamaBaseUrl: string;

  // Key validation status (set after validation — not user-editable)
  geminiKeyStatus: ApiKeyStatus;
  openaiKeyStatus: ApiKeyStatus;
  anthropicKeyStatus: ApiKeyStatus;
  ollamaKeyStatus: ApiKeyStatus;

  // Knowledge Base
  kbEnabled: boolean;

  // Auth
  authApiKey: string | null;
  authEmail: string | null;
  authName: string | null;
  authAuthenticatedAt: string | null;
}
