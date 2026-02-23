import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { TekiAPI, TekiSettings, WindowSource, WindowFrame, AiProviderId, ApiKeyValidationResult } from '@teki/shared';

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
};

contextBridge.exposeInMainWorld('tekiAPI', tekiAPI);
