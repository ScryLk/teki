import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { CaptureFrame, TekiAPI, TekiSettings } from '@teki/shared';

const tekiAPI: TekiAPI = {
  // Window controls
  minimize: () => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE);
  },

  maximize: () => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE);
  },

  close: () => {
    ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE);
  },

  isMaximized: () => {
    return ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED);
  },

  // Screen capture
  startCapture: (sourceId: string, interval: number) => {
    ipcRenderer.send(IPC_CHANNELS.CAPTURE_START, sourceId, interval);
  },

  stopCapture: () => {
    ipcRenderer.send(IPC_CHANNELS.CAPTURE_STOP);
  },

  captureNow: (): Promise<CaptureFrame | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_SCREENSHOT);
  },

  getSources: (): Promise<Array<{ id: string; name: string; thumbnail: string }>> => {
    return ipcRenderer.invoke(IPC_CHANNELS.CAPTURE_SOURCES);
  },

  onCaptureFrame: (callback: (frame: CaptureFrame) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, frame: CaptureFrame) => {
      callback(frame);
    };
    ipcRenderer.on(IPC_CHANNELS.CAPTURE_FRAME, listener);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.CAPTURE_FRAME, listener);
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

  // App info
  getVersion: (): Promise<string> => {
    return ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  },
};

contextBridge.exposeInMainWorld('tekiAPI', tekiAPI);
