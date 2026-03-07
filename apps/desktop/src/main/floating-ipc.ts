import { ipcMain } from 'electron';
import { resizeFloating, hideFloating } from './floating-window';
import { AgentRouter } from './openclaw/core/AgentRouter';

const router = new AgentRouter();

export function registerFloatingIPC(): void {
  ipcMain.on('floating:resize', (_event, width: number, height: number) => {
    resizeFloating(width, height);
  });

  ipcMain.on('floating:hide', () => {
    hideFloating();
  });

  ipcMain.handle('floating:send-to-agent', async (_event, text: string) => {
    try {
      const response = await router.route({
        channelId: 'discord', // reuse as generic
        senderId: 'local-user',
        senderName: 'Usuário',
        text,
        sessionKey: 'floating:local',
        timestamp: Date.now(),
      });
      return { reply: response };
    } catch (err) {
      console.error('[Floating] Agent error:', err);
      return { reply: 'Desculpe, ocorreu um erro ao processar sua pergunta.' };
    }
  });
}
