import { ipcMain, app, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { AiProviderId } from '@teki/shared';
import settingsStore from './services/settings-store';
import windowWatcher from './services/window-watcher';
import { updateTrayState } from './tray';
import { validateApiKey } from './services/ai-key-validator';

export function registerIPCHandlers(mainWindow: BrowserWindow): void {
  // ── Window watching ───────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.WATCH_GET_SOURCES, async () => {
    return windowWatcher.getAvailableWindows();
  });

  ipcMain.handle(IPC_CHANNELS.WATCH_START, async (_event, sourceId: string) => {
    // Resolve the window name to show in the tray tooltip
    const windows = await windowWatcher.getAvailableWindows();
    const windowName = windows.find((w) => w.id === sourceId)?.name ?? 'Janela';

    windowWatcher.startWatching(sourceId, mainWindow, (closedName) => {
      // Janela foi fechada externamente → ícone de alerta por 10s
      updateTrayState('alert', mainWindow, closedName);
      setTimeout(() => {
        if (!windowWatcher.isWatching()) {
          updateTrayState('idle', mainWindow);
        }
      }, 30_000);
    });

    updateTrayState('watching', mainWindow, windowName);
  });

  ipcMain.handle(IPC_CHANNELS.WATCH_STOP, async () => {
    windowWatcher.stopWatching();
    updateTrayState('idle', mainWindow);
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

  // ── App ──────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  // ── AI Validation ─────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.AI_VALIDATE_KEY, (_event, provider: AiProviderId, key: string) => {
    return validateApiKey(provider, key);
  });
}
