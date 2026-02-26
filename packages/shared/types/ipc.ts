import type { WindowSource, WindowFrame } from './context';

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
  AUTH_SET_API_KEY: 'auth:setApiKey',
  AUTH_GET_STATUS: 'auth:getStatus',
  AUTH_LOGOUT: 'auth:logout',
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
  setApiKey: (key: string) => Promise<boolean>;
  getAuthStatus: () => Promise<{ isAuthenticated: boolean; email: string | null; name: string | null }>;
  logout: () => Promise<void>;
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

  // Auth
  authApiKey: string | null;
  authEmail: string | null;
  authName: string | null;
  authAuthenticatedAt: string | null;
}
