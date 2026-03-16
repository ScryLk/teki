import { desktopCapturer, BrowserWindow } from 'electron';
import { execSync } from 'child_process';
import { join } from 'path';
import { IPC_CHANNELS } from '@teki/shared';
import type { WindowSource, WindowFrame } from '@teki/shared';
import { logAction } from './log-service';
import { safeSend } from '../utils/safe-ipc';

let watchTimer: ReturnType<typeof setTimeout> | null = null;
let watchedSourceId: string | null = null;
let watchedWindowName: string | null = null;
let onClosedCallback: ((windowName: string) => void) | null = null;

const resolverPath = join(__dirname, '../../resources/wid-resolver');

/** Resolve window IDs to app paths and icons using the native helper binary */
function resolveWindowInfo(): { windows: Record<string, string>; icons: Record<string, string> } {
  if (process.platform !== 'darwin') return { windows: {}, icons: {} };
  try {
    const output = execSync(resolverPath, { encoding: 'utf-8', timeout: 5000 }).trim();
    return JSON.parse(output);
  } catch { return { windows: {}, icons: {} }; }
}

/** Extract CGWindowID from desktopCapturer source id (format: "window:WID:0") */
function extractWindowId(sourceId: string): string | null {
  const parts = sourceId.split(':');
  return parts.length >= 2 ? parts[1] : null;
}

export async function getAvailableWindows(): Promise<WindowSource[]> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['window'],
      thumbnailSize: { width: 320, height: 180 },
    });

    const { windows: widToApp, icons } = resolveWindowInfo();

    return sources
      .filter((s) => s.name && s.name !== '' && s.name !== 'Desktop')
      .map((s) => {
        const wid = extractWindowId(s.id);
        const appPath = wid ? widToApp[wid] : undefined;
        const iconB64 = appPath ? icons[appPath] : undefined;
        return {
          id: s.id,
          name: s.name,
          thumbnail: s.thumbnail.toDataURL(),
          appIcon: iconB64 ? `data:image/png;base64,${iconB64}` : undefined,
        };
      });
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

  logAction('Monitoramento de janela iniciado', { sourceId }, 'view', ['activity']);

  // Use recursive setTimeout instead of setInterval to prevent callback
  // accumulation. desktopCapturer.getSources() is async and can take longer
  // than 1 second — with setInterval, callbacks would pile up, each allocating
  // large NativeImage buffers and exhausting system memory.
  const captureLoop = async () => {
    if (!watchTimer) return; // stopped while awaiting

    if (!mainWindow || mainWindow.isDestroyed()) {
      watchTimer = setTimeout(captureLoop, 3000);
      return;
    }

    try {
      const sources = await desktopCapturer.getSources({
        types: ['window'],
        thumbnailSize: { width: 800, height: 450 },
      });

      if (!watchTimer) return; // stopped while awaiting

      const target = sources.find((s) => s.id === sourceId);

      if (!target) {
        const name = lastWindowName;
        stopWatching();
        safeSend(mainWindow, IPC_CHANNELS.WATCH_WINDOW_CLOSED, { sourceId });
        if (name) onClosedCallback?.(name);
        return;
      }

      lastWindowName = target.name;
      watchedWindowName = target.name;

      const frame: WindowFrame = {
        sourceId,
        windowName: target.name,
        image: `data:image/jpeg;base64,${target.thumbnail.toJPEG(70).toString('base64')}`,
        timestamp: Date.now(),
      };

      safeSend(mainWindow, IPC_CHANNELS.WATCH_FRAME, frame);
    } catch {
      // Silently ignore transient capture errors
    }

    // Schedule next capture only after the current one completes
    if (watchTimer) {
      watchTimer = setTimeout(captureLoop, 3000);
    }
  };

  // Sentinel value to indicate the loop is active; captureLoop checks this
  watchTimer = setTimeout(captureLoop, 0);
}

export function stopWatching(): void {
  if (watchTimer) {
    clearTimeout(watchTimer);
    watchTimer = null;
    logAction('Monitoramento de janela encerrado', { sourceId: watchedSourceId }, 'view', ['activity']);
  }
  watchedSourceId = null;
  watchedWindowName = null;
  onClosedCallback = null;
}

export function isWatching(): boolean {
  return watchTimer !== null;
}

export function getWatchedSourceId(): string | null {
  return watchedSourceId;
}

export function getWatchedWindowName(): string | null {
  return watchedWindowName;
}

export default { getAvailableWindows, startWatching, stopWatching, isWatching, getWatchedSourceId, getWatchedWindowName };
