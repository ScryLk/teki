import { desktopCapturer, BrowserWindow } from 'electron';
import type { CaptureConfig, CapturedFrame, CaptureResolution } from '@teki/shared';
import { getActiveWindow } from '../window-detector';

// ── Adaptive Intervals ──────────────────────────────────────────────────────
const INTERVALS = {
  ERROR_DETECTED: 1500,
  ACTIVE: 3000,
  HIGH_CPU: 5000,
  IDLE: 10000,
} as const;

const DEFAULT_CONFIG: CaptureConfig = {
  intervalMs: INTERVALS.ACTIVE,
  source: 'active_window',
  resolution: 'half',
  excludeOwnWindows: true,
  enabled: false, // LGPD: opt-in only
};

function getScaleFactor(resolution: CaptureResolution): number {
  switch (resolution) {
    case 'full':
      return 1;
    case 'half':
      return 0.5;
    case 'quarter':
      return 0.25;
    default:
      return 0.5;
  }
}

export class ScreenCaptureLoop {
  private config: CaptureConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private paused = false;
  private lastSourceId: string | null = null;
  private onFrame: ((frame: CapturedFrame) => void) | null = null;

  constructor(config?: Partial<CaptureConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(onFrame: (frame: CapturedFrame) => void): void {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.onFrame = onFrame;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    this.onFrame = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  pause(): void {
    if (!this.running) return;
    this.paused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.scheduleNext();
  }

  adjustInterval(intervalMs: number): void {
    this.config.intervalMs = intervalMs;
  }

  getConfig(): CaptureConfig {
    return { ...this.config };
  }

  isRunning(): boolean {
    return this.running && !this.paused;
  }

  isPaused(): boolean {
    return this.paused;
  }

  getLastSourceId(): string | null {
    return this.lastSourceId;
  }

  private scheduleNext(): void {
    if (!this.running || this.paused) return;
    this.timer = setTimeout(async () => {
      await this.captureFrame();
      this.scheduleNext();
    }, this.config.intervalMs);
  }

  private async captureFrame(): Promise<void> {
    if (!this.running || this.paused || !this.onFrame) return;

    try {
      // Auto-pause if Teki itself is in focus
      if (this.config.excludeOwnWindows) {
        const activeWin = await getActiveWindow();
        const tekiWindows = BrowserWindow.getAllWindows();
        const tekiTitles = tekiWindows.map((w) => w.getTitle());
        if (tekiTitles.some((t) => activeWin.title.includes(t) || activeWin.title.includes('Teki'))) {
          return; // Skip this frame — Teki is in focus
        }
      }

      const frame = await this.takeScreenshot();
      if (frame) {
        this.onFrame(frame);
      }
    } catch {
      // Silently ignore transient capture errors
    }
  }

  private async takeScreenshot(): Promise<CapturedFrame | null> {
    const scale = getScaleFactor(this.config.resolution);
    const thumbSize = {
      width: Math.round(1920 * scale),
      height: Math.round(1080 * scale),
    };

    const sources = await desktopCapturer.getSources({
      types: this.config.source === 'full_screen' ? ['screen'] : ['window'],
      thumbnailSize: thumbSize,
    });

    if (!sources.length) return null;

    let target = sources[0];

    if (this.config.source === 'active_window') {
      const activeWin = await getActiveWindow();
      const match = sources.find((s) =>
        s.name.toLowerCase().includes(activeWin.title.toLowerCase()) ||
        activeWin.title.toLowerCase().includes(s.name.toLowerCase())
      );
      if (match) target = match;
    } else if (this.config.source === 'specific_window' && this.config.targetWindowTitle) {
      const match = sources.find((s) =>
        s.name.toLowerCase().includes(this.config.targetWindowTitle!.toLowerCase())
      );
      if (match) target = match;
    }

    // Filter out own windows
    if (this.config.excludeOwnWindows) {
      const tekiWindows = BrowserWindow.getAllWindows();
      const tekiIds = tekiWindows.map((w) => String(w.id));
      if (tekiIds.includes(target.id)) {
        // Try next non-Teki source
        const alt = sources.find((s) => !tekiIds.includes(s.id));
        if (!alt) return null;
        target = alt;
      }
    }

    this.lastSourceId = target.id;

    const thumbnail = target.thumbnail;
    const size = thumbnail.getSize();
    const pngBuffer = thumbnail.toPNG();

    return {
      imageBuffer: pngBuffer,
      imageBase64: pngBuffer.toString('base64'),
      width: size.width,
      height: size.height,
      sourceId: target.id,
      sourceName: target.name,
      capturedAt: Date.now(),
    };
  }
}

export { INTERVALS };
export default ScreenCaptureLoop;
