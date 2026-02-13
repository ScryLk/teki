import { desktopCapturer, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { CaptureFrame } from '@teki/shared';
import { getActiveWindow } from './window-detector';

let captureTimer: ReturnType<typeof setInterval> | null = null;
let currentSourceId: string = '';

const QUALITY_MAP: Record<string, { width: number; height: number }> = {
  low: { width: 640, height: 480 },
  medium: { width: 1280, height: 720 },
  high: { width: 1920, height: 1080 },
};

async function captureScreen(sourceId: string): Promise<string | null> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: QUALITY_MAP['medium'],
    });

    const source = sources.find((s) => s.id === sourceId) || sources[0];
    if (!source) return null;

    return source.thumbnail.toDataURL();
  } catch {
    return null;
  }
}

export async function captureNow(): Promise<CaptureFrame | null> {
  const sourceId = currentSourceId || '';

  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: QUALITY_MAP['medium'],
    });

    const source = sourceId
      ? sources.find((s) => s.id === sourceId) || sources[0]
      : sources[0];

    if (!source) return null;

    const image = source.thumbnail.toDataURL();
    const activeWindow = await getActiveWindow();

    return {
      image,
      timestamp: Date.now(),
      source: source.name,
      activeWindow,
    };
  } catch {
    return null;
  }
}

export function startCapture(
  mainWindow: BrowserWindow,
  sourceId: string,
  intervalSeconds: number
): void {
  stopCapture();

  currentSourceId = sourceId;
  const intervalMs = intervalSeconds * 1000;

  captureTimer = setInterval(async () => {
    try {
      const image = await captureScreen(sourceId);
      if (!image) return;

      const activeWindow = await getActiveWindow();

      const frame: CaptureFrame = {
        image,
        timestamp: Date.now(),
        source: sourceId,
        activeWindow,
      };

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(IPC_CHANNELS.CAPTURE_FRAME, frame);
      }
    } catch {
      // Silently ignore capture errors during interval
    }
  }, intervalMs);
}

export function stopCapture(): void {
  if (captureTimer) {
    clearInterval(captureTimer);
    captureTimer = null;
  }
}

export async function getSources(): Promise<
  Array<{ id: string; name: string; thumbnail: string }>
> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 },
    });

    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
    }));
  } catch {
    return [];
  }
}

export default { captureNow, startCapture, stopCapture, getSources };
