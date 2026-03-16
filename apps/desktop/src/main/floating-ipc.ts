import { ipcMain, BrowserWindow } from 'electron';
import { resizeFloating, hideFloating, toggleFloating } from './floating-window';
import { AgentRouter } from './openclaw/core/AgentRouter';
import { getWatchedWindowName, isWatching } from './services/window-watcher';

const router = new AgentRouter();

export function registerFloatingIPC(): void {
  ipcMain.on('floating:resize', (_event, width: number, height: number) => {
    resizeFloating(width, height);
  });

  ipcMain.on('floating:hide', () => {
    hideFloating();
  });

  ipcMain.handle('floating:toggle', async () => {
    toggleFloating();
  });

  ipcMain.handle('floating:send-to-agent', async (_event, text: string) => {
    try {
      const watched = getWatchedWindowName();

      const response = await router.route({
        channelId: 'floating',
        senderId: 'local-user',
        senderName: 'Usuário',
        text,
        sessionKey: 'floating:local',
        timestamp: Date.now(),
        systemContext: watched
          ? `O usuário está monitorando a janela: "${watched}". Quando ele perguntar sobre a tela focada ou janela ativa, responda com essa informação.`
          : undefined,
      });
      return { reply: response };
    } catch (err) {
      console.error('[Floating] Agent error:', err);
      return { reply: 'Desculpe, ocorreu um erro ao processar sua pergunta.' };
    }
  });

  ipcMain.handle('floating:is-watching', async () => {
    return isWatching();
  });

  // Expand from floating → restore main window and open window picker
  ipcMain.on('floating:expand-to-main', () => {
    const allWindows = BrowserWindow.getAllWindows();
    const mainWin = allWindows.find((w) => !w.isAlwaysOnTop());
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.restore();
      mainWin.focus();
      mainWin.webContents.send('tray-select-window');
    }
  });
}
