import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type {
  TekiAPI, TekiSettings, WindowSource, WindowFrame, AiProviderId, ApiKeyValidationResult,
  ChannelInfo, ChannelConfig, ChannelStatusEvent, OpenClawChannelId,
  ConnectionHealth, ConnectionHealthEvent,
  MonitoredService, PingResult, PingHistoryQuery, HourlyAggregate, ServiceStats,
  AlertEvent, DetectedPattern,
  KBDocument, KBUploadPayload, KBSearchResult, KBStats, KBDocStatusEvent, KBChunk,
  TekiApiKeyListResult, TekiApiKeyCreateResult, TekiApiKeyUsage,
  AudioSource, TranscriptionSegment, AISuggestion, TranscriptionConfig,
} from '@teki/shared';

const tekiAPI: TekiAPI = {
  // Window watching
  getAvailableWindows: (): Promise<WindowSource[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.WATCH_GET_SOURCES);
  },

  startWatching: (sourceId: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.WATCH_START, sourceId);
  },

  stopWatching: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.WATCH_STOP);
  },

  onWindowFrame: (callback: (frame: WindowFrame) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, frame: WindowFrame) => {
      callback(frame);
    };
    ipcRenderer.on(IPC_CHANNELS.WATCH_FRAME, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WATCH_FRAME, listener);
    };
  },

  onWindowClosed: (callback: (data: { sourceId: string }) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { sourceId: string }) => {
      callback(data);
    };
    ipcRenderer.on(IPC_CHANNELS.WATCH_WINDOW_CLOSED, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WATCH_WINDOW_CLOSED, listener);
    };
  },

  // Settings
  getSetting: <T>(key: string): Promise<T> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key);
  },

  setSetting: (key: string, value: unknown): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, key, value);
  },

  getAllSettings: (): Promise<TekiSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_ALL);
  },

  // Window detection
  onActiveWindow: (
    callback: (info: { title: string; processName: string }) => void
  ): (() => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      info: { title: string; processName: string }
    ) => {
      callback(info);
    };
    ipcRenderer.on(IPC_CHANNELS.WINDOW_ACTIVE, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_ACTIVE, listener);
    };
  },

  // Tray actions
  onTraySelectWindow: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('tray-select-window', listener);
    return () => ipcRenderer.removeListener('tray-select-window', listener);
  },

  onTrayStopWatching: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('tray-stop-watching', listener);
    return () => ipcRenderer.removeListener('tray-stop-watching', listener);
  },

  // App info
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  },

  // AI Key Validation
  validateApiKey: (provider: AiProviderId, key: string): Promise<ApiKeyValidationResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AI_VALIDATE_KEY, provider, key);
  },

  // Auth
  startDeviceAuth: (): Promise<{ userCode: string; deviceCode: string }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_DEVICE_START);
  },

  cancelDeviceAuth: (): void => {
    ipcRenderer.invoke(IPC_CHANNELS.AUTH_DEVICE_CANCEL);
  },

  onAuthStatus: (callback: (data: { status: string; email?: string; name?: string }) => void): (() => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: { status: string; email?: string; name?: string },
    ) => {
      callback(data);
    };
    ipcRenderer.on(IPC_CHANNELS.AUTH_DEVICE_STATUS, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.AUTH_DEVICE_STATUS, listener);
    };
  },

  loginWithCredentials: (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN_CREDENTIALS, email, password);
  },

  setApiKey: (key: string): Promise<boolean> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_SET_API_KEY, key);
  },

  getAuthStatus: (): Promise<{ isAuthenticated: boolean; email: string | null; name: string | null }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_STATUS);
  },

  logout: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT);
  },

  deleteAccount: (): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_DELETE_ACCOUNT);
  },

  registerAccount: (data: { email: string; firstName: string; lastName?: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.AUTH_REGISTER, data);
  },

  onAuthExpired: (callback: () => void): (() => void) => {
    const listener = () => callback();
    ipcRenderer.on('auth:expired', listener);
    return () => ipcRenderer.removeListener('auth:expired', listener);
  },

  // OpenClaw
  openclawListChannels: (): Promise<ChannelInfo[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_LIST_CHANNELS);
  },

  openclawConnect: (channelId: OpenClawChannelId, config: ChannelConfig): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_CONNECT, channelId, config);
  },

  openclawDisconnect: (channelId: OpenClawChannelId): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_DISCONNECT, channelId);
  },

  openclawGetQR: (channelId: OpenClawChannelId): Promise<string | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_GET_QR, channelId);
  },

  openclawGetOAuthUrl: (channelId: OpenClawChannelId): Promise<string | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_GET_OAUTH_URL, channelId);
  },

  openclawGetStatus: (channelId: OpenClawChannelId): Promise<ChannelInfo | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_STATUS, channelId);
  },

  onOpenclawStatusChanged: (callback: (event: ChannelStatusEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: ChannelStatusEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.OPENCLAW_STATUS_CHANGED, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.OPENCLAW_STATUS_CHANGED, listener);
  },

  openclawUpdateConfig: (channelId: OpenClawChannelId, config: Partial<ChannelConfig>): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.OPENCLAW_UPDATE_CONFIG, channelId, config);
  },

  // Display
  switchDisplay: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DISPLAY_SWITCH);
  },

  // Connection Health
  getConnectionHealth: (): Promise<ConnectionHealth> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CONNECTION_HEALTH_GET);
  },

  onConnectionHealthChange: (callback: (event: ConnectionHealthEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: ConnectionHealthEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.CONNECTION_HEALTH_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.CONNECTION_HEALTH_STATUS, listener);
  },

  // Monitor
  monitorListServices: (): Promise<MonitoredService[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_LIST_SERVICES);
  },

  monitorAddService: (service: Omit<MonitoredService, 'id'>): Promise<MonitoredService> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_ADD_SERVICE, service);
  },

  monitorUpdateService: (service: MonitoredService): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_UPDATE_SERVICE, service);
  },

  monitorRemoveService: (serviceId: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_REMOVE_SERVICE, serviceId);
  },

  monitorProbeNow: (serviceId: string): Promise<PingResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_PROBE_NOW, serviceId);
  },

  onMonitorProbeResult: (callback: (result: PingResult) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: PingResult) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.MONITOR_PROBE_RESULT, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.MONITOR_PROBE_RESULT, listener);
  },

  monitorQueryHistory: (query: PingHistoryQuery): Promise<PingResult[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_QUERY_HISTORY, query);
  },

  monitorQueryHourly: (query: PingHistoryQuery): Promise<HourlyAggregate[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_QUERY_HOURLY, query);
  },

  monitorGetStats: (serviceId: string, period: string): Promise<ServiceStats> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_GET_STATS, serviceId, period);
  },

  onMonitorAlert: (callback: (alert: AlertEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: AlertEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.MONITOR_ALERT, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.MONITOR_ALERT, listener);
  },

  monitorGetPatterns: (): Promise<DetectedPattern[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.MONITOR_GET_PATTERNS);
  },

  // Knowledge Base
  kbListDocs: (): Promise<KBDocument[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_LIST_DOCS);
  },
  kbUploadDoc: (payload: KBUploadPayload): Promise<KBDocument> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_UPLOAD_DOC, payload);
  },
  kbRemoveDoc: (docId: string): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_REMOVE_DOC, docId);
  },
  kbGetDoc: (docId: string): Promise<KBDocument | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_GET_DOC, docId);
  },
  kbSearch: (query: string, topK?: number): Promise<KBSearchResult[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_SEARCH, query, topK);
  },
  kbGetStats: (): Promise<KBStats> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_GET_STATS);
  },
  kbGetDocChunks: (docId: string): Promise<KBChunk[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.KB_DOC_CHUNKS, docId);
  },
  onKbDocStatus: (callback: (event: KBDocStatusEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: KBDocStatusEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.KB_DOC_STATUS, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.KB_DOC_STATUS, listener);
  },

  // Teki Platform API Keys
  tekiApiKeysList: (): Promise<TekiApiKeyListResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TEKI_APIKEYS_LIST);
  },
  tekiApiKeysCreate: (data: { name: string; type: 'LIVE' | 'TEST'; expiresAt?: string }): Promise<TekiApiKeyCreateResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TEKI_APIKEYS_CREATE, data);
  },
  tekiApiKeysRevoke: (id: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TEKI_APIKEYS_REVOKE, id);
  },
  tekiApiKeysUsage: (id: string): Promise<TekiApiKeyUsage> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TEKI_APIKEYS_USAGE, id);
  },

  // Transcription
  transcriptionGetSources: (): Promise<AudioSource[]> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TRANSCRIPTION_GET_SOURCES);
  },
  transcriptionStart: (sourceId: string, config?: Partial<TranscriptionConfig>): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TRANSCRIPTION_START, sourceId, config);
  },
  transcriptionStop: (): Promise<{ segments: TranscriptionSegment[] }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TRANSCRIPTION_STOP);
  },
  transcriptionPause: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TRANSCRIPTION_PAUSE);
  },
  transcriptionResume: (): Promise<void> => {
    return ipcRenderer.invoke(IPC_CHANNELS.TRANSCRIPTION_RESUME);
  },
  transcriptionSendChunk: (base64: string): void => {
    ipcRenderer.send(IPC_CHANNELS.TRANSCRIPTION_SEND_CHUNK, base64);
  },
  onTranscriptionSegment: (callback: (segment: TranscriptionSegment) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, segment: TranscriptionSegment) => callback(segment);
    ipcRenderer.on(IPC_CHANNELS.TRANSCRIPTION_SEGMENT, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSCRIPTION_SEGMENT, listener);
  },
  onTranscriptionSuggestion: (callback: (suggestion: AISuggestion) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, suggestion: AISuggestion) => callback(suggestion);
    ipcRenderer.on(IPC_CHANNELS.TRANSCRIPTION_SUGGESTION, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSCRIPTION_SUGGESTION, listener);
  },
  onTranscriptionError: (callback: (error: { message: string }) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, error: { message: string }) => callback(error);
    ipcRenderer.on(IPC_CHANNELS.TRANSCRIPTION_ERROR, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.TRANSCRIPTION_ERROR, listener);
  },

  // Logging
  logAction: (event: string, details?: Record<string, unknown>): void => {
    ipcRenderer.invoke('log:action', event, details);
  },
};

contextBridge.exposeInMainWorld('tekiAPI', tekiAPI);
