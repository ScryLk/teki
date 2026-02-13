import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { join } from 'path';

let tray: Tray | null = null;
let isPaused = false;

export function createTray(mainWindow: BrowserWindow): Tray {
  // Create a 16x16 tray icon using nativeImage
  // Try to load from resources; fall back to an empty icon
  const iconPath = join(__dirname, '../../resources/tray-icon.png');
  let icon: Electron.NativeImage;

  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      // Create a small default icon if the file doesn't exist
      icon = nativeImage.createEmpty();
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  // Resize for tray (16x16 on most platforms, 22x22 on Linux)
  const resized = icon.isEmpty() ? icon : icon.resize({ width: 16, height: 16 });

  tray = new Tray(resized);
  tray.setToolTip('Teki — Assistente de TI');

  const buildContextMenu = (): Menu => {
    return Menu.buildFromTemplate([
      {
        label: 'Teki \u2014 Observando',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Capturar tela',
        click: (): void => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('tray:capture');
          }
        },
      },
      {
        label: isPaused ? 'Retomar' : 'Pausar',
        click: (): void => {
          isPaused = !isPaused;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('tray:toggle-pause', isPaused);
          }
          // Rebuild menu to update label
          if (tray) {
            tray.setContextMenu(buildContextMenu());
          }
        },
      },
      {
        label: 'Abrir chat',
        click: (): void => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Configura\u00e7\u00f5es',
        click: (): void => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('tray:open-settings');
          }
        },
      },
      {
        label: 'Sair',
        click: (): void => {
          app.quit();
        },
      },
    ]);
  };

  tray.setContextMenu(buildContextMenu());

  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });

  return tray;
}

export function updateTrayState(state: {
  isCapturing?: boolean;
  isPaused?: boolean;
}): void {
  if (state.isPaused !== undefined) {
    isPaused = state.isPaused;
  }

  if (tray) {
    const statusLabel = isPaused
      ? 'Teki \u2014 Pausado'
      : state.isCapturing
        ? 'Teki \u2014 Capturando'
        : 'Teki \u2014 Observando';

    tray.setToolTip(statusLabel);
  }
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
