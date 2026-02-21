import { Tray, nativeImage, BrowserWindow, Menu, app } from 'electron';
import {
  makeCatWatchingDataURL,
  makeCatIdleDataURL,
  makeCatAlertDataURL,
} from './utils/tray-icons';
import { encodePNG } from './utils/png-encoder';

let tray: Tray | null = null;
let currentState: TrayState = 'idle';
let currentWindow: BrowserWindow | null = null;
let currentWindowName: string | undefined;

export type TrayState = 'idle' | 'watching' | 'alert';

// ─── Icon cache ───────────────────────────────────────────────────────────────

const iconCache: Partial<Record<TrayState, Electron.NativeImage>> = {};

/** Simple white circle fallback used before the renderer renders the SVG cat icons. */
function createFallbackIcon(): Electron.NativeImage {
  const size = 22;
  const rgba = Buffer.alloc(size * size * 4, 0);
  const cx = 11, cy = 11, r = 8;
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
    const pngDataURL: string = await mainWindow.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 22; canvas.height = 22;
          canvas.getContext('2d').drawImage(img, 0, 0, 22, 22);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve('');
        img.src = ${JSON.stringify(svgDataURL)};
      })
    `);
    if (!pngDataURL) return null;
    const img = nativeImage.createFromDataURL(pngDataURL);
    if (process.platform === 'darwin') img.setTemplateImage(true);
    return img;
  } catch {
    return null;
  }
}

/**
 * Renders all three SVG states to PNG using the renderer's canvas.
 * Called after the renderer finishes loading so the browser engine is available.
 * Once icons are ready the current tray icon is refreshed.
 */
export async function initTrayIcons(mainWindow: BrowserWindow): Promise<void> {
  const states: Array<[TrayState, string]> = [
    ['idle', makeCatIdleDataURL()],
    ['watching', makeCatWatchingDataURL()],
    ['alert', makeCatAlertDataURL()],
  ];

  for (const [state, svgDataURL] of states) {
    const img = await renderSVGtoPNG(mainWindow, svgDataURL);
    if (img) iconCache[state] = img;
  }

  // Refresh the live tray icon with the newly-rendered PNG
  if (tray) {
    tray.setImage(getIcon(currentState));
  }
}

// ─── Context menu ─────────────────────────────────────────────────────────────

function buildMenu(mainWindow: BrowserWindow, state: TrayState, windowName?: string): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Abrir Teki',
      click: () => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
  ];

  if (state === 'watching') {
    template.push(
      { label: `Observando: ${windowName ?? 'janela'}`, enabled: false },
      {
        label: 'Parar de observar',
        click: () => {
          if (!mainWindow.isDestroyed()) mainWindow.webContents.send('tray-stop-watching');
        },
      }
    );
  } else if (state === 'alert') {
    template.push(
      { label: `"${windowName ?? ''}" foi fechada`, enabled: false },
      {
        label: 'Escolher outra janela',
        click: () => {
          if (!mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.webContents.send('tray-select-window');
          }
        },
      }
    );
  } else {
    template.push({
      label: 'Escolher janela para observar',
      click: () => {
        if (!mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.webContents.send('tray-select-window');
        }
      },
    });
  }

  template.push(
    { type: 'separator' },
    { label: 'Sair', click: () => app.quit() }
  );

  return Menu.buildFromTemplate(template);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function createTray(mainWindow: BrowserWindow): void {
  currentWindow = mainWindow;
  tray = new Tray(getIcon('idle'));
  tray.setToolTip('Teki — Descansando');
  tray.setContextMenu(buildMenu(mainWindow, 'idle'));

  tray.on('click', () => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
    }
  });
}

export function updateTrayState(
  state: TrayState,
  mainWindow: BrowserWindow,
  windowName?: string
): void {
  if (!tray) return;

  currentState = state;
  currentWindowName = windowName;

  tray.setImage(getIcon(state));
  tray.setToolTip(
    state === 'watching' ? `Teki — Observando: ${windowName ?? 'janela'}` :
    state === 'alert'    ? `Teki — "${windowName}" foi fechada`            :
                           'Teki — Descansando'
  );
  tray.setContextMenu(buildMenu(mainWindow, state, windowName));
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
