import { app, BrowserWindow, session, shell, globalShortcut, nativeImage } from 'electron';
import { join } from 'path';
const is = { get dev() { return !app.isPackaged; } };

const iconPath = join(__dirname, '../../resources/icon.png');

// Prevent EPIPE crash when parent process (electron-vite dev) closes the stdio pipe
process.stdout?.on('error', () => {});
process.stderr?.on('error', () => {});
import { registerIPCHandlers } from './ipc-handlers';
import { registerOpenClawIPC } from './openclaw/ipc/openclawIpc';
import { createTray, destroyTray, initTrayIcons } from './tray';
import { createFloatingWindow, showFloating, toggleFloating, startRecording, destroyFloating } from './floating-window';
import { registerFloatingIPC } from './floating-ipc';
import { setupKnowledgeBase } from './services/kb-ipc';
import { safeSend, markRendererAlive, markRendererDead } from './utils/safe-ipc';
import { startLogService, stopLogService, logAction, setAuthExpiredCallback } from './services/log-service';
// import { startPolling, stopPolling } from './services/window-detector';

let mainWindow: BrowserWindow | null = null;

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 12 },
    backgroundColor: '#09090b',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Track renderer lifecycle for safe IPC
  window.webContents.on('did-finish-load', () => markRendererAlive(window.webContents));
  window.webContents.on('render-process-gone', () => markRendererDead(window.webContents));
  window.webContents.on('destroyed', () => markRendererDead(window.webContents));

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
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  // ── App ready ─────────────────────────────────────────────────────

  app.whenReady().then(() => {
    // Set dock icon on macOS (essential for dev mode where there's no bundled .icns)
    if (process.platform === 'darwin') {
      const dockIcon = nativeImage.createFromPath(iconPath);
      if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon);
    }

    mainWindow = createWindow();

    // Register IPC handlers
    registerIPCHandlers(mainWindow);
    registerOpenClawIPC(mainWindow);

    // Knowledge Base depends on better-sqlite3 which may fail in dev — wrap to avoid blocking other handlers
    try { setupKnowledgeBase(mainWindow); } catch (err) {
      console.warn('[KnowledgeBase] Failed to setup:', (err as Error).message);
    }

    // Create system tray (with fallback icon; cat PNG icons load after renderer)
    createTray(mainWindow);
    mainWindow.webContents.once('did-finish-load', () => {
      initTrayIcons(mainWindow!);
    });

    // Start log service
    startLogService();
    logAction('Aplicacao desktop iniciada', { version: app.getVersion() });

    // Handle auth expiration — notify renderer to redirect to login
    setAuthExpiredCallback(() => {
      safeSend(mainWindow, 'auth:expired', null);
    });

    // Create floating voice overlay and show it automatically
    createFloatingWindow();
    registerFloatingIPC();
    showFloating();

    // Register global hotkeys
    const floatingShortcut = globalShortcut.register('CommandOrControl+Option+Space', () => {
      toggleFloating();
    });
    if (!floatingShortcut) {
      console.warn('[Hotkey] Failed to register Cmd+Option+Space for floating window');
    }
    const recordShortcut = globalShortcut.register('CommandOrControl+D', () => {
      startRecording();
    });
    if (!recordShortcut) {
      console.warn('[Hotkey] Failed to register Cmd+D for recording');
    }

    // Start active window detection polling
    // startPolling(mainWindow);

    // macOS: re-create window when dock icon is clicked and no windows exist
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
        registerIPCHandlers(mainWindow);
        createTray(mainWindow);
        // startPolling(mainWindow);
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });

  // ── Window lifecycle ────────────────────────────────────────────────

  app.on('window-all-closed', () => {
    // stopPolling();
    logAction('Aplicacao desktop encerrada');
    stopLogService();
    globalShortcut.unregisterAll();
    destroyFloating();
    destroyTray();

    // On macOS, apps typically stay active until explicitly quit via Cmd+Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
