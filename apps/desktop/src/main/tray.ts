import { Tray, nativeImage, BrowserWindow } from 'electron';
import {
  makeCatWatchingDataURL,
  makeCatIdleDataURL,
  makeCatAlertDataURL,
} from './utils/tray-icons';
import { encodePNG } from './utils/png-encoder';
import {
  startWatchTimer,
  stopWatchTimer,
  getElapsed,
  isTimerRunning,
} from './services/watch-timer';
import {
  createPopupWindow,
  showPopup,
  updateMenuState,
  initMenuVersion,
  registerPopupIPC,
  destroyPopup,
} from './tray-popup';

let tray: Tray | null = null;
let currentState: TrayState = 'idle';
let currentWindowName: string = '';
let lastSessionDuration: string = '';
let timerInterval: NodeJS.Timeout | null = null;

export type TrayState = 'idle' | 'watching' | 'alert';

// ─── Icon cache ───────────────────────────────────────────────────────────────

const iconCache: Partial<Record<TrayState, Electron.NativeImage>> = {};

/** Small white circle fallback shown before SVG icons load. */
function createFallbackIcon(): Electron.NativeImage {
  const size = 22;
  const rgba = Buffer.alloc(size * size * 4, 0);
  const cx = 11, cy = 11, r = 9;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) {
        const i = (y * size + x) * 4;
        rgba[i] = 255; rgba[i + 1] = 255; rgba[i + 2] = 255; rgba[i + 3] = 255;
      }
    }
  }
  const img = nativeImage.createFromBuffer(encodePNG(rgba, size, size));
  if (process.platform === 'darwin') img.setTemplateImage(true);
  return img;
}

function getIcon(state: TrayState): Electron.NativeImage {
  return iconCache[state] ?? createFallbackIcon();
}

// ─── SVG → PNG via renderer canvas ────────────────────────────────────────────

async function renderSVGtoPNG(
  mainWindow: BrowserWindow,
  svgDataURL: string
): Promise<Electron.NativeImage | null> {
  try {
    if (mainWindow.isDestroyed()) return null;
    const pngDataURL: string = await mainWindow.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const IW = 22, IH = 15;
          const W  = 44, H  = 44;
          const dw = IW * 2, dh = IH * 2;
          const dx = 0;
          const dy = Math.round((H - dh) / 2);
          const canvas = document.createElement('canvas');
          canvas.width = W; canvas.height = H;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, IW, IH, dx, dy, dw, dh);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = ${JSON.stringify(svgDataURL)};
      })
    `);
    if (!pngDataURL) return null;
    const buffer = Buffer.from(pngDataURL.split(',')[1], 'base64');
    return nativeImage.createFromBuffer(buffer, { scaleFactor: 2 });
  } catch {
    return null;
  }
}

export async function initTrayIcons(mainWindow: BrowserWindow): Promise<void> {
  const states: Array<[TrayState, string]> = [
    ['idle', makeCatIdleDataURL()],
    ['watching', makeCatWatchingDataURL()],
    ['alert', makeCatAlertDataURL()],
  ];

  for (const [state, svgDataURL] of states) {
    const img = await renderSVGtoPNG(mainWindow, svgDataURL);
    if (img) {
      if (process.platform === 'darwin') img.setTemplateImage(true);
      iconCache[state] = img;
    }
  }

  if (tray) tray.setImage(getIcon(currentState));
}

// ─── Timer live-update ────────────────────────────────────────────────────────

function startTimerUpdate(): void {
  stopTimerUpdate();
  timerInterval = setInterval(() => {
    const elapsed = getElapsed();
    tray?.setToolTip(`Teki — ${currentWindowName} (${elapsed})`);
    updateMenuState({ elapsed });
  }, 1000);
}

function stopTimerUpdate(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createTray(mainWindow: BrowserWindow): void {
  tray = new Tray(getIcon('idle'));
  tray.setToolTip('Teki — Descansando');

  initMenuVersion();
  createPopupWindow();
  registerPopupIPC(mainWindow);

  tray.on('click', () => { if (tray) showPopup(tray); });
  tray.on('right-click', () => { if (tray) showPopup(tray); });
}

export function updateTrayState(
  state: TrayState,
  mainWindow: BrowserWindow,
  windowName?: string
): void {
  if (!tray) return;

  const previousState = currentState;
  currentState = state;
  tray.setImage(getIcon(state));

  if (state === 'watching') {
    currentWindowName = windowName ?? 'Janela';
    if (previousState !== 'watching') startWatchTimer();
    startTimerUpdate();
    tray.setToolTip(`Teki — ${currentWindowName} (${getElapsed()})`);
    updateMenuState({ status: 'watching', windowName: currentWindowName, elapsed: getElapsed() });
  } else if (state === 'alert') {
    lastSessionDuration = isTimerRunning() ? stopWatchTimer() : lastSessionDuration;
    stopTimerUpdate();
    tray.setToolTip(`Teki — "${currentWindowName}" foi fechada`);
    updateMenuState({ status: 'alert', windowName: currentWindowName, lastDuration: lastSessionDuration });
  } else {
    if (isTimerRunning()) lastSessionDuration = stopWatchTimer();
    currentWindowName = '';
    stopTimerUpdate();
    tray.setToolTip('Teki — Descansando');
    updateMenuState({ status: 'idle', windowName: '', elapsed: '0s' });
  }
}

export function destroyTray(): void {
  stopTimerUpdate();
  destroyPopup();
  tray?.destroy();
  tray = null;
}
