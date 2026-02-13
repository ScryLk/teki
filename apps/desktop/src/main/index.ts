import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import { registerIPCHandlers } from './ipc-handlers';
import { createTray, destroyTray } from './tray';
import { startPolling, stopPolling } from './services/window-detector';

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    ...(process.platform === 'darwin'
      ? { titleBarStyle: 'hidden' }
      : { frame: false }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Show window when ready to avoid visual flash
  window.on('ready-to-show', () => {
    window.show();
  });

  // Open external links in the default browser
  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return window;
}

// ── Single instance lock ──────────────────────────────────────────────

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance — focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  // ── App ready ─────────────────────────────────────────────────────

  app.whenReady().then(() => {
    mainWindow = createWindow();

    // Register IPC handlers
    registerIPCHandlers(mainWindow);

    // Create system tray
    createTray(mainWindow);

    // Start active window detection polling
    startPolling(mainWindow);

    // macOS: re-create window when dock icon is clicked and no windows exist
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
        registerIPCHandlers(mainWindow);
        createTray(mainWindow);
        startPolling(mainWindow);
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });

  // ── Window lifecycle ────────────────────────────────────────────────

  app.on('window-all-closed', () => {
    stopPolling();
    destroyTray();

    // On macOS, apps typically stay active until explicitly quit via Cmd+Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
