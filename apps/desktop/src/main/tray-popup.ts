import { BrowserWindow, Tray, ipcMain, screen, app } from 'electron';
import { join } from 'path';
const is = { get dev() { return !app.isPackaged; } };
import { getElapsed } from './services/watch-timer';

let popupWindow: BrowserWindow | null = null;
let isLoaded = false;

export interface TrayMenuState {
  status: 'idle' | 'watching' | 'alert';
  windowName: string;
  elapsed: string;
  lastDuration: string;
  version: string;
}

let state: TrayMenuState = {
  status: 'idle',
  windowName: '',
  elapsed: '0s',
  lastDuration: '',
  version: '0.1.0',
};

// ─── Popup window ─────────────────────────────────────────────────────────────

export function createPopupWindow(): void {
  if (popupWindow && !popupWindow.isDestroyed()) return;

  isLoaded = false;

  popupWindow = new BrowserWindow({
    width: 280,
    height: 360,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    webPreferences: {
      preload: join(__dirname, '../preload/tray-popup.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popupWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/tray-popup.html`);
  } else {
    popupWindow.loadFile(join(__dirname, '../renderer/tray-popup.html'));
  }

  popupWindow.webContents.once('did-finish-load', () => {
    isLoaded = true;
  });

  // Use blur for dismissal but with a small guard so it doesn't fire during show()
  popupWindow.on('blur', () => {
    // Tiny delay so a click on a menu item fires before we hide
    setTimeout(() => hidePopup(), 150);
  });

  popupWindow.on('closed', () => {
    popupWindow = null;
    isLoaded = false;
  });
}

export function showPopup(trayInstance: Tray): void {
  if (!popupWindow || popupWindow.isDestroyed()) {
    createPopupWindow();
  }

  // Toggle: second click hides
  if (popupWindow!.isVisible()) {
    hidePopup();
    return;
  }

  const doShow = () => {
    if (!popupWindow || popupWindow.isDestroyed()) return;

    if (state.status === 'watching') {
      state = { ...state, elapsed: getElapsed() };
    }

    // Position below the tray icon
    const trayBounds = trayInstance.getBounds();
    const winBounds = popupWindow.getBounds();
    const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });

    let x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
    let y = Math.round(trayBounds.y + trayBounds.height + 4);

    const maxX = display.bounds.x + display.bounds.width - winBounds.width;
    const maxY = display.bounds.y + display.bounds.height - winBounds.height;
    x = Math.max(display.bounds.x, Math.min(x, maxX));
    y = Math.max(display.bounds.y, Math.min(y, maxY));

    popupWindow.setPosition(x, y);

    // On macOS, activate the app first so the popup can receive focus
    if (process.platform === 'darwin') {
      app.focus({ steal: true });
    }

    popupWindow.show();
    popupWindow.focus();

    // Send state AFTER show() so the renderer is visible and ready
    popupWindow.webContents.send('menu-state', state);
  };

  if (isLoaded) {
    doShow();
  } else {
    // Window is still loading — wait for it
    popupWindow!.webContents.once('did-finish-load', () => doShow());
  }
}

export function hidePopup(): void {
  if (popupWindow && !popupWindow.isDestroyed() && popupWindow.isVisible()) {
    popupWindow.hide();
  }
}

// ─── State management ─────────────────────────────────────────────────────────

export function updateMenuState(partial: Partial<TrayMenuState>): void {
  state = { ...state, ...partial };
  // Push live update if popup is open
  if (popupWindow && !popupWindow.isDestroyed() && popupWindow.isVisible()) {
    popupWindow.webContents.send('menu-state', state);
  }
}

export function initMenuVersion(): void {
  state = { ...state, version: app.getVersion() || '0.1.0' };
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

export function registerPopupIPC(mainWindow: BrowserWindow): void {
  ipcMain.on('popup-resize', (_event, height: number) => {
    if (popupWindow && !popupWindow.isDestroyed()) {
      const clamped = Math.max(100, Math.min(600, Math.ceil(height)));
      popupWindow.setContentSize(280, clamped);
    }
  });

  ipcMain.on('popup-action', (_event, action: string) => {
    hidePopup();

    if (mainWindow.isDestroyed()) return;

    switch (action) {
      case 'select-window':
        mainWindow.show();
        mainWindow.webContents.send('tray-select-window');
        break;
      case 'stop-watching':
        mainWindow.webContents.send('tray-stop-watching');
        break;
      case 'new-conversation':
        mainWindow.show();
        mainWindow.webContents.send('tray-new-conversation');
        break;
      case 'continue-conversation':
        mainWindow.show();
        mainWindow.webContents.send('tray-continue-conversation');
        break;
      case 'open-settings':
        mainWindow.show();
        mainWindow.webContents.send('tray-open-settings');
        break;
      case 'open-app':
        mainWindow.show();
        mainWindow.focus();
        break;
      case 'quit':
        app.quit();
        break;
    }
  });
}

export function destroyPopup(): void {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.destroy();
    popupWindow = null;
  }
}
