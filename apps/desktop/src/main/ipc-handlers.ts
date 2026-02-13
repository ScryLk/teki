import { ipcMain, app, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import settingsStore from './services/settings-store';
import screenCapture from './services/screen-capture';

export function registerIPCHandlers(mainWindow: BrowserWindow): void {
  // ── Window controls ──────────────────────────────────────────────

  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_IS_MAXIMIZED, () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.isMaximized();
    }
    return false;
  });

  // ── Settings ─────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (_event, key: string) => {
    return settingsStore.get(key as never);
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_event, key: string, value: unknown) => {
    settingsStore.set(key as never, value as never);
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_ALL, () => {
    return settingsStore.getAll();
  });

  // ── Screen capture ───────────────────────────────────────────────

  ipcMain.on(IPC_CHANNELS.CAPTURE_START, (_event, sourceId: string, interval: number) => {
    screenCapture.startCapture(mainWindow, sourceId, interval);
  });

  ipcMain.on(IPC_CHANNELS.CAPTURE_STOP, () => {
    screenCapture.stopCapture();
  });

  ipcMain.handle(IPC_CHANNELS.CAPTURE_SCREENSHOT, async () => {
    return screenCapture.captureNow();
  });

  ipcMain.handle(IPC_CHANNELS.CAPTURE_SOURCES, async () => {
    return screenCapture.getSources();
  });

  // ── App ──────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
    return app.getVersion();
  });
}
