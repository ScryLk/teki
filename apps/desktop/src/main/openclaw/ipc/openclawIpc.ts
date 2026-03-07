import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { OpenClawChannelId, ChannelConfig } from '@teki/shared';
import { channelRegistry } from '../core/ChannelRegistry';

export function registerOpenClawIPC(mainWindow: BrowserWindow): void {
  channelRegistry.setMainWindow(mainWindow);

  ipcMain.handle(IPC_CHANNELS.OPENCLAW_LIST_CHANNELS, async () => {
    return channelRegistry.listChannels();
  });

  ipcMain.handle(
    IPC_CHANNELS.OPENCLAW_CONNECT,
    async (_event, channelId: OpenClawChannelId, config: ChannelConfig) => {
      await channelRegistry.connect(channelId, config);
    },
  );

  ipcMain.handle(IPC_CHANNELS.OPENCLAW_DISCONNECT, async (_event, channelId: OpenClawChannelId) => {
    await channelRegistry.disconnect(channelId);
  });

  ipcMain.handle(IPC_CHANNELS.OPENCLAW_GET_QR, async (_event, channelId: OpenClawChannelId) => {
    return channelRegistry.getQRCode(channelId);
  });

  ipcMain.handle(
    IPC_CHANNELS.OPENCLAW_GET_OAUTH_URL,
    async (_event, channelId: OpenClawChannelId) => {
      return channelRegistry.getOAuthUrl(channelId);
    },
  );

  ipcMain.handle(IPC_CHANNELS.OPENCLAW_STATUS, async (_event, channelId: OpenClawChannelId) => {
    return channelRegistry.getStatus(channelId);
  });

  ipcMain.handle(
    IPC_CHANNELS.OPENCLAW_UPDATE_CONFIG,
    async (_event, channelId: OpenClawChannelId, config: Partial<ChannelConfig>) => {
      // Disconnect and reconnect with updated config
      const current = channelRegistry.getChannel(channelId)?.getConfig();
      if (current) {
        await channelRegistry.disconnect(channelId);
        await channelRegistry.connect(channelId, { ...current, ...config });
      }
    },
  );

  // Auto-reconnect saved channels after a short delay
  setTimeout(() => {
    channelRegistry.reconnectSaved();
  }, 3000);
}
