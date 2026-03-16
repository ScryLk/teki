import { BrowserWindow, screen, app } from 'electron';
import { join } from 'path';
import { markRendererAlive, markRendererDead } from './utils/safe-ipc';
const is = { get dev() { return !app.isPackaged; } };

let floatingWin: BrowserWindow | null = null;
let isLoaded = false;

export function createFloatingWindow(): void {
  if (floatingWin && !floatingWin.isDestroyed()) return;

  isLoaded = false;
  const { workAreaSize } = screen.getPrimaryDisplay();

  floatingWin = new BrowserWindow({
    width: 280,
    height: 52,
    x: workAreaSize.width - 300,
    y: workAreaSize.height - 80,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    roundedCorners: true,
    webPreferences: {
      preload: join(__dirname, '../preload/floating.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Stay above fullscreen windows
  floatingWin.setAlwaysOnTop(true, 'floating', 1);

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    floatingWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/floating.html`);
  } else {
    floatingWin.loadFile(join(__dirname, '../renderer/floating.html'));
  }

  floatingWin.webContents.once('did-finish-load', () => {
    isLoaded = true;
    markRendererAlive(floatingWin!.webContents);
  });

  floatingWin.webContents.on('render-process-gone', () => {
    if (floatingWin && !floatingWin.isDestroyed()) {
      markRendererDead(floatingWin.webContents);
    }
  });

  floatingWin.on('closed', () => {
    floatingWin = null;
    isLoaded = false;
  });
}

export function showFloating(): void {
  if (!floatingWin || floatingWin.isDestroyed()) {
    createFloatingWindow();
  }

  if (floatingWin!.isVisible()) return;

  const doShow = () => {
    if (!floatingWin || floatingWin.isDestroyed()) return;
    floatingWin.showInactive(); // Don't steal focus
  };

  if (isLoaded) {
    doShow();
  } else {
    floatingWin!.webContents.once('did-finish-load', () => doShow());
  }
}

export function hideFloating(): void {
  if (floatingWin && !floatingWin.isDestroyed() && floatingWin.isVisible()) {
    floatingWin.hide();
  }
}

export function toggleFloating(): void {
  if (floatingWin && !floatingWin.isDestroyed() && floatingWin.isVisible()) {
    hideFloating();
  } else {
    showFloating();
  }
}

export function resizeFloating(width: number, height: number): void {
  if (!floatingWin || floatingWin.isDestroyed()) return;

  const bounds = floatingWin.getBounds();
  // Anchor to bottom-right during expansion
  floatingWin.setBounds({
    x: bounds.x - (width - bounds.width),
    y: bounds.y - (height - bounds.height),
    width,
    height,
  }, true);
}

export function startRecording(): void {
  if (!floatingWin || floatingWin.isDestroyed()) return;
  showFloating();
  // Wait a tick for window to be ready, then focus so input receives keystrokes
  setTimeout(() => {
    if (!floatingWin || floatingWin.isDestroyed()) return;
    floatingWin.focus();
    floatingWin.webContents.send('floating:start-recording');
  }, 100);
}

export function getFloatingWindow(): BrowserWindow | null {
  return floatingWin;
}

export function destroyFloating(): void {
  if (floatingWin && !floatingWin.isDestroyed()) {
    floatingWin.destroy();
    floatingWin = null;
  }
}
