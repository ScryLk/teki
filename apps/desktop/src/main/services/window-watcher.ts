import { desktopCapturer, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { WindowSource, WindowFrame } from '@teki/shared';

let watchInterval: ReturnType<typeof setInterval> | null = null;
let watchedSourceId: string | null = null;
let onClosedCallback: ((windowName: string) => void) | null = null;

export async function getAvailableWindows(): Promise<WindowSource[]> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true,
    });

    return sources
      .filter((s) => s.name && s.name !== '' && s.name !== 'Desktop')
      .map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail.toDataURL(),
        appIcon: s.appIcon?.toDataURL() ?? undefined,
      }));
  } catch {
    return [];
  }
}

export function startWatching(
  sourceId: string,
  mainWindow: BrowserWindow,
  onClosed?: (windowName: string) => void
): void {
  stopWatching();
  watchedSourceId = sourceId;
  onClosedCallback = onClosed ?? null;
  let lastWindowName = '';

  watchInterval = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1280, height: 720 },
      });

      const target = sources.find((s) => s.id === sourceId);

      if (!target) {
        const name = lastWindowName;
        stopWatching();
        mainWindow.webContents.send(IPC_CHANNELS.WATCH_WINDOW_CLOSED, { sourceId });
        if (name) onClosedCallback?.(name);
        return;
      }

      lastWindowName = target.name;

      const frame: WindowFrame = {
        sourceId,
        windowName: target.name,
        image: target.thumbnail.toDataURL(),
        timestamp: Date.now(),
      };

      mainWindow.webContents.send(IPC_CHANNELS.WATCH_FRAME, frame);
    } catch {
      // Silently ignore transient capture errors
    }
  }, 1000);
}

export function stopWatching(): void {
  if (watchInterval) {
    clearInterval(watchInterval);
    watchInterval = null;
  }
  watchedSourceId = null;
  onClosedCallback = null;
}

export function isWatching(): boolean {
  return watchInterval !== null;
}

export function getWatchedSourceId(): string | null {
  return watchedSourceId;
}

export default { getAvailableWindows, startWatching, stopWatching, isWatching, getWatchedSourceId };
