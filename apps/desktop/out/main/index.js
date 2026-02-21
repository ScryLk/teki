"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Store = require("electron-store");
const zlib = require("zlib");
const IPC_CHANNELS = {
  // Window watching
  WATCH_GET_SOURCES: "watch:getSources",
  WATCH_START: "watch:start",
  WATCH_STOP: "watch:stop",
  WATCH_FRAME: "watch:frame",
  WATCH_WINDOW_CLOSED: "watch:windowClosed",
  // Window detection
  WINDOW_ACTIVE: "window:active",
  // Settings
  SETTINGS_GET: "settings:get",
  SETTINGS_SET: "settings:set",
  SETTINGS_GET_ALL: "settings:getAll",
  // Tray
  TRAY_UPDATE: "tray:update",
  // App
  APP_GET_VERSION: "app:getVersion"
};
const defaults = {
  // Capture
  captureInterval: 5,
  captureSource: "",
  captureQuality: "medium",
  autoCapture: false,
  // Chat
  showSources: true,
  autoAttachScreenshot: true,
  chatHistoryDays: 30,
  // Context
  defaultSistema: "",
  defaultVersao: "",
  defaultAmbiente: "producao",
  nivelTecnico: "intermediario",
  // Appearance
  catSize: "md",
  showCat: true,
  layout: "split",
  compactMode: false,
  // System
  startMinimized: false,
  startOnBoot: false,
  globalShortcut: "CommandOrControl+Shift+T",
  language: "pt-BR",
  // Algolia
  algoliaAppId: "",
  algoliaApiKey: "",
  algoliaAgentId: ""
};
const store = new Store({
  name: "teki-settings",
  defaults
});
function get(key) {
  return store.get(key);
}
function set(key, value) {
  store.set(key, value);
}
function getAll() {
  return store.store;
}
const settingsStore = { get, set, getAll };
let watchInterval = null;
let watchedSourceId = null;
let onClosedCallback = null;
async function getAvailableWindows() {
  try {
    const sources = await electron.desktopCapturer.getSources({
      types: ["window"],
      thumbnailSize: { width: 320, height: 180 },
      fetchWindowIcons: true
    });
    return sources.filter((s) => s.name && s.name !== "" && s.name !== "Desktop").map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL(),
      appIcon: s.appIcon?.toDataURL() ?? void 0
    }));
  } catch {
    return [];
  }
}
function startWatching(sourceId, mainWindow2, onClosed) {
  stopWatching();
  watchedSourceId = sourceId;
  onClosedCallback = onClosed ?? null;
  let lastWindowName = "";
  watchInterval = setInterval(async () => {
    if (!mainWindow2 || mainWindow2.isDestroyed()) return;
    try {
      const sources = await electron.desktopCapturer.getSources({
        types: ["window"],
        thumbnailSize: { width: 1280, height: 720 }
      });
      const target = sources.find((s) => s.id === sourceId);
      if (!target) {
        const name = lastWindowName;
        stopWatching();
        mainWindow2.webContents.send(IPC_CHANNELS.WATCH_WINDOW_CLOSED, { sourceId });
        if (name) onClosedCallback?.(name);
        return;
      }
      lastWindowName = target.name;
      const frame = {
        sourceId,
        windowName: target.name,
        image: target.thumbnail.toDataURL(),
        timestamp: Date.now()
      };
      mainWindow2.webContents.send(IPC_CHANNELS.WATCH_FRAME, frame);
    } catch {
    }
  }, 1e3);
}
function stopWatching() {
  if (watchInterval) {
    clearInterval(watchInterval);
    watchInterval = null;
  }
  watchedSourceId = null;
  onClosedCallback = null;
}
function isWatching() {
  return watchInterval !== null;
}
function getWatchedSourceId() {
  return watchedSourceId;
}
const windowWatcher = { getAvailableWindows, startWatching, stopWatching, isWatching, getWatchedSourceId };
const CAT_BODY_PATH = "M416,128c0-13.3-8.1-25.2-20.5-30.1l-72.3-28.9c-20.3-8.1-43.3-8.1-63.6,0l-72.3,28.9C174.9,102.8,166.8,114.7,166.8,128v25.2c-28.4,17.5-47.8,48.2-50.5,83.9L96,267.1V352c0,35.3,28.7,64,64,64h256c35.3,0,64-28.7,64-64v-84.9l-20.3-29.9c-2.7-35.7-22.1-66.4-50.5-83.9V128zM192,128l64-25.6l64,25.6V144H192V128z";
const CAT_FACE_PATH = "M448,272c0-88.4-71.6-160-160-160S128,183.6,128,272c0,35,11.3,67.3,30.4,93.6c-9.9,14.9-15.8,32.6-16.3,51.7C141.6,436,156.2,448,174,448h164c17.8,0,32.4-12,31.9-30.7c-0.5-19-6.4-36.8-16.3-51.7C436.7,339.3,448,307,448,272zM194.7,152.2c-10.6-21-34.1-30.8-55.9-23.4c-10.9,3.7-17,15.3-13.9,26.3c5.7,20.5,20.6,46.4,45.6,72.7C176.9,198.7,185.5,174.7,194.7,152.2zM387.1,155c-3.1-11-9.2-22.6-20.1-26.3c-21.8-7.4-45.3,2.4-55.9,23.4c9.2,22.6,17.8,46.5,24.1,75.6C366.5,199.6,381.4,173.7,387.1,155z";
const LEFT_EYE_CX = 220;
const RIGHT_EYE_CX = 356;
const EYE_CY = 248;
function buildSVG(eyeRadius) {
  const hasCutouts = eyeRadius > 0;
  const defs = hasCutouts ? `<defs><mask id="m"><rect width="512" height="512" fill="white"/><circle cx="${LEFT_EYE_CX}" cy="${EYE_CY}" r="${eyeRadius}" fill="black"/><circle cx="${RIGHT_EYE_CX}" cy="${EYE_CY}" r="${eyeRadius}" fill="black"/></mask></defs>` : "";
  const maskAttr = hasCutouts ? ' mask="url(#m)"' : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="22" height="22">` + defs + `<path d="${CAT_BODY_PATH}" fill="#FFFFFF"/><path d="${CAT_FACE_PATH}" fill="#FFFFFF"${maskAttr}/></svg>`;
}
function toDataURL(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
function makeCatIdleDataURL() {
  return toDataURL(buildSVG(0));
}
function makeCatWatchingDataURL() {
  return toDataURL(buildSVG(28));
}
function makeCatAlertDataURL() {
  return toDataURL(buildSVG(44));
}
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();
function crc32(buf) {
  let crc = 4294967295;
  for (const byte of buf) {
    crc = CRC_TABLE[(crc ^ byte) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}
function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcValue = Buffer.alloc(4);
  crcValue.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcValue]);
}
function encodePNG(rgba, width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}
let tray = null;
let currentState = "idle";
const iconCache = {};
function createFallbackIcon() {
  const size = 22;
  const rgba = Buffer.alloc(size * size * 4, 0);
  const cx = 11, cy = 11, r = 8;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= r) {
        const i = (y * size + x) * 4;
        rgba[i] = 255;
        rgba[i + 1] = 255;
        rgba[i + 2] = 255;
        rgba[i + 3] = 255;
      }
    }
  }
  const img = electron.nativeImage.createFromBuffer(encodePNG(rgba, size, size));
  if (process.platform === "darwin") img.setTemplateImage(true);
  return img;
}
function getIcon(state) {
  return iconCache[state] ?? createFallbackIcon();
}
async function renderSVGtoPNG(mainWindow2, svgDataURL) {
  try {
    const pngDataURL = await mainWindow2.webContents.executeJavaScript(`
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
    const img = electron.nativeImage.createFromDataURL(pngDataURL);
    if (process.platform === "darwin") img.setTemplateImage(true);
    return img;
  } catch {
    return null;
  }
}
async function initTrayIcons(mainWindow2) {
  const states = [
    ["idle", makeCatIdleDataURL()],
    ["watching", makeCatWatchingDataURL()],
    ["alert", makeCatAlertDataURL()]
  ];
  for (const [state, svgDataURL] of states) {
    const img = await renderSVGtoPNG(mainWindow2, svgDataURL);
    if (img) iconCache[state] = img;
  }
  if (tray) {
    tray.setImage(getIcon(currentState));
  }
}
function buildMenu(mainWindow2, state, windowName) {
  const template = [
    {
      label: "Abrir Teki",
      click: () => {
        if (!mainWindow2.isDestroyed()) {
          mainWindow2.show();
          mainWindow2.focus();
        }
      }
    },
    { type: "separator" }
  ];
  if (state === "watching") {
    template.push(
      { label: `Observando: ${windowName ?? "janela"}`, enabled: false },
      {
        label: "Parar de observar",
        click: () => {
          if (!mainWindow2.isDestroyed()) mainWindow2.webContents.send("tray-stop-watching");
        }
      }
    );
  } else if (state === "alert") {
    template.push(
      { label: `"${windowName ?? ""}" foi fechada`, enabled: false },
      {
        label: "Escolher outra janela",
        click: () => {
          if (!mainWindow2.isDestroyed()) {
            mainWindow2.show();
            mainWindow2.webContents.send("tray-select-window");
          }
        }
      }
    );
  } else {
    template.push({
      label: "Escolher janela para observar",
      click: () => {
        if (!mainWindow2.isDestroyed()) {
          mainWindow2.show();
          mainWindow2.webContents.send("tray-select-window");
        }
      }
    });
  }
  template.push(
    { type: "separator" },
    { label: "Sair", click: () => electron.app.quit() }
  );
  return electron.Menu.buildFromTemplate(template);
}
function createTray(mainWindow2) {
  tray = new electron.Tray(getIcon("idle"));
  tray.setToolTip("Teki — Descansando");
  tray.setContextMenu(buildMenu(mainWindow2, "idle"));
  tray.on("click", () => {
    if (!mainWindow2.isDestroyed()) {
      mainWindow2.isVisible() ? mainWindow2.focus() : mainWindow2.show();
    }
  });
}
function updateTrayState(state, mainWindow2, windowName) {
  if (!tray) return;
  currentState = state;
  tray.setImage(getIcon(state));
  tray.setToolTip(
    state === "watching" ? `Teki — Observando: ${windowName ?? "janela"}` : state === "alert" ? `Teki — "${windowName}" foi fechada` : "Teki — Descansando"
  );
  tray.setContextMenu(buildMenu(mainWindow2, state, windowName));
}
function destroyTray() {
  tray?.destroy();
  tray = null;
}
function registerIPCHandlers(mainWindow2) {
  electron.ipcMain.handle(IPC_CHANNELS.WATCH_GET_SOURCES, async () => {
    return windowWatcher.getAvailableWindows();
  });
  electron.ipcMain.handle(IPC_CHANNELS.WATCH_START, async (_event, sourceId) => {
    const windows = await windowWatcher.getAvailableWindows();
    const windowName = windows.find((w) => w.id === sourceId)?.name ?? "Janela";
    windowWatcher.startWatching(sourceId, mainWindow2, (closedName) => {
      updateTrayState("alert", mainWindow2, closedName);
      setTimeout(() => {
        if (!windowWatcher.isWatching()) {
          updateTrayState("idle", mainWindow2);
        }
      }, 1e4);
    });
    updateTrayState("watching", mainWindow2, windowName);
  });
  electron.ipcMain.handle(IPC_CHANNELS.WATCH_STOP, async () => {
    windowWatcher.stopWatching();
    updateTrayState("idle", mainWindow2);
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (_event, key) => {
    return settingsStore.get(key);
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_event, key, value) => {
    settingsStore.set(key, value);
  });
  electron.ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_ALL, () => {
    return settingsStore.getAll();
  });
  electron.ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
    return electron.app.getVersion();
  });
}
let mainWindow = null;
function createWindow() {
  const window = new electron.BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 12 },
    backgroundColor: "#09090b",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  window.on("ready-to-show", () => {
    window.show();
  });
  window.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    window.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    window.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return window;
}
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
  electron.app.whenReady().then(() => {
    mainWindow = createWindow();
    registerIPCHandlers(mainWindow);
    createTray(mainWindow);
    mainWindow.webContents.once("did-finish-load", () => {
      initTrayIcons(mainWindow);
    });
    electron.app.on("activate", () => {
      if (electron.BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
        registerIPCHandlers(mainWindow);
        createTray(mainWindow);
      } else if (mainWindow) {
        mainWindow.show();
      }
    });
  });
  electron.app.on("window-all-closed", () => {
    destroyTray();
    if (process.platform !== "darwin") {
      electron.app.quit();
    }
  });
}
