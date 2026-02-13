import type { CaptureFrame } from './context';

// IPC Channel names
export const IPC_CHANNELS = {
  // Screen capture
  CAPTURE_START: 'capture:start',
  CAPTURE_STOP: 'capture:stop',
  CAPTURE_FRAME: 'capture:frame',
  CAPTURE_SCREENSHOT: 'capture:screenshot',
  CAPTURE_SOURCES: 'capture:sources',

  // Window detection
  WINDOW_ACTIVE: 'window:active',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:getAll',

  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_IS_MAXIMIZED: 'window:isMaximized',

  // Tray
  TRAY_UPDATE: 'tray:update',

  // App
  APP_GET_VERSION: 'app:getVersion',
} as const;

// Preload API exposed to renderer
export interface TekiAPI {
  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;

  // Screen capture
  startCapture: (sourceId: string, interval: number) => void;
  stopCapture: () => void;
  captureNow: () => Promise<CaptureFrame | null>;
  getSources: () => Promise<Array<{ id: string; name: string; thumbnail: string }>>;
  onCaptureFrame: (callback: (frame: CaptureFrame) => void) => () => void;

  // Settings
  getSetting: <T>(key: string) => Promise<T>;
  setSetting: (key: string, value: unknown) => Promise<void>;
  getAllSettings: () => Promise<TekiSettings>;

  // Window detection
  onActiveWindow: (callback: (info: { title: string; processName: string }) => void) => () => void;

  // App info
  getVersion: () => Promise<string>;
}

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

  // Algolia
  algoliaAppId: string;
  algoliaApiKey: string;
  algoliaAgentId: string;
}
