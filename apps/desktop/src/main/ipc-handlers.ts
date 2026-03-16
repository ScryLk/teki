import { ipcMain, app, screen, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { AiProviderId } from '@teki/shared';
import settingsStore from './services/settings-store';
import windowWatcher from './services/window-watcher';
import { updateTrayState } from './tray';
import { validateApiKey } from './services/ai-key-validator';
import { logAction } from './services/log-service';
import { showFloating, hideFloating } from './floating-window';
import { channelRegistry } from './openclaw/core/ChannelRegistry';
import {
  startDeviceFlow,
  cancelDeviceFlow,
  loginWithCredentials,
  setApiKeyManually,
  getAuthStatus,
  logout,
  deleteAccount,
  registerAccount,
  listApiKeys,
  createPlatformApiKey,
  revokePlatformApiKey,
  getApiKeyUsage,
} from './services/auth-service';

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
    showFloating();
  });

  ipcMain.handle(IPC_CHANNELS.WATCH_STOP, async () => {
    windowWatcher.stopWatching();
    updateTrayState('idle', mainWindow);
    hideFloating();
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

  // ── Auth ─────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.AUTH_DEVICE_START, async () => {
    return startDeviceFlow(mainWindow);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_DEVICE_CANCEL, () => {
    cancelDeviceFlow();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN_CREDENTIALS, async (_event, email: string, password: string) => {
    return loginWithCredentials(email, password);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_SET_API_KEY, async (_event, key: string) => {
    return setApiKeyManually(key);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_GET_STATUS, async () => {
    return getAuthStatus();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, () => {
    logout();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_DELETE_ACCOUNT, async () => {
    return deleteAccount();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_REGISTER, async (_event, data: { email: string; firstName: string; lastName?: string; password: string }) => {
    return registerAccount(data);
  });

  // ── Logging ────────────────────────────────────────────────────

  ipcMain.handle('log:action', (_event, event: string, details?: Record<string, unknown>) => {
    logAction(event, details, 'process', ['activity']);
  });

  // ── Teki Platform API Keys ──────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.TEKI_APIKEYS_LIST, async () => {
    return listApiKeys();
  });

  ipcMain.handle(IPC_CHANNELS.TEKI_APIKEYS_CREATE, async (_event, data: { name: string; type: 'LIVE' | 'TEST'; expiresAt?: string }) => {
    return createPlatformApiKey(data);
  });

  ipcMain.handle(IPC_CHANNELS.TEKI_APIKEYS_REVOKE, async (_event, id: string) => {
    return revokePlatformApiKey(id);
  });

  ipcMain.handle(IPC_CHANNELS.TEKI_APIKEYS_USAGE, async (_event, id: string) => {
    return getApiKeyUsage(id);
  });

  // ── Connection Health ──────────────────────────────────────────

  type ServiceStatus = 'online' | 'offline' | 'degraded' | 'checking';
  let lastHealth: { internet: ServiceStatus; backend: ServiceStatus; openclaw: ServiceStatus } =
    { internet: 'checking', backend: 'checking', openclaw: 'checking' };

  const checkHealth = async () => {
    const { internet: prevI, backend: prevB, openclaw: prevO } = lastHealth;

    // Internet check
    let internet: ServiceStatus = 'offline';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      await fetch('https://www.google.com/generate_204', { method: 'HEAD', signal: ctrl.signal });
      clearTimeout(timer);
      internet = 'online';
    } catch { /* offline */ }

    // Backend check
    let backend: ServiceStatus = 'offline';
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://teki.app';
      await fetch(`${baseUrl}/api/health`, { method: 'HEAD', signal: ctrl.signal });
      clearTimeout(timer);
      backend = 'online';
    } catch { /* offline */ }

    // OpenClaw check — derive from channel list
    let openclaw: ServiceStatus = 'offline';
    try {
      const channels = channelRegistry.listChannels();
      const connected = channels.filter((c: { status: string }) => c.status === 'connected').length;
      if (connected === channels.length && channels.length > 0) openclaw = 'online';
      else if (connected > 0) openclaw = 'degraded';
      else if (channels.length === 0) openclaw = 'checking';
    } catch { /* offline */ }

    lastHealth = { internet, backend, openclaw };

    // Emit only on change
    if (internet !== prevI || backend !== prevB || openclaw !== prevO) {
      mainWindow.webContents.send(IPC_CHANNELS.CONNECTION_HEALTH_STATUS, { health: lastHealth, timestamp: Date.now() });
    }

    return lastHealth;
  };

  ipcMain.handle(IPC_CHANNELS.CONNECTION_HEALTH_GET, async () => {
    return checkHealth();
  });

  // Poll every 30s
  const healthInterval = setInterval(checkHealth, 30_000);
  checkHealth();
  mainWindow.on('closed', () => clearInterval(healthInterval));

  // ── Display ────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.DISPLAY_SWITCH, () => {
    try {
      const displays = screen.getAllDisplays();
      if (displays.length <= 1) {
        return { success: false, error: 'Apenas 1 monitor detectado' };
      }

      const currentBounds = mainWindow.getBounds();
      const currentDisplay = screen.getDisplayNearestPoint({
        x: currentBounds.x + currentBounds.width / 2,
        y: currentBounds.y + currentBounds.height / 2,
      });

      // Find the next display in the list
      const currentIndex = displays.findIndex((d) => d.id === currentDisplay.id);
      const nextDisplay = displays[(currentIndex + 1) % displays.length];

      // Center the window on the next display
      const { x, y, width, height } = nextDisplay.workArea;
      const newX = x + Math.round((width - currentBounds.width) / 2);
      const newY = y + Math.round((height - currentBounds.height) / 2);

      mainWindow.setPosition(newX, newY);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha ao trocar monitor' };
    }
  });
}
