import { desktopCapturer, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { WindowSource, WindowFrame } from '@teki/shared';

let watchTimer: ReturnType<typeof setTimeout> | null = null;
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

  // Use recursive setTimeout instead of setInterval to prevent callback
  // accumulation. desktopCapturer.getSources() is async and can take longer
  // than 1 second — with setInterval, callbacks would pile up, each allocating
  // large NativeImage buffers and exhausting system memory.
  const captureLoop = async () => {
    if (!watchTimer) return; // stopped while awaiting

    if (!mainWindow || mainWindow.isDestroyed()) {
      watchTimer = setTimeout(captureLoop, 1000);
      return;
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 1280, height: 720 },
      });

      if (!watchTimer) return; // stopped while awaiting

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

    // Schedule next capture only after the current one completes
    if (watchTimer) {
      watchTimer = setTimeout(captureLoop, 1000);
    }
  };

  // Sentinel value to indicate the loop is active; captureLoop checks this
  watchTimer = setTimeout(captureLoop, 0);
}

export function stopWatching(): void {
  if (watchTimer) {
    clearTimeout(watchTimer);
    watchTimer = null;
  }
  watchedSourceId = null;
  onClosedCallback = null;
}

export function isWatching(): boolean {
  return watchTimer !== null;
}

export function getWatchedSourceId(): string | null {
  return watchedSourceId;
}

export default { getAvailableWindows, startWatching, stopWatching, isWatching, getWatchedSourceId };
