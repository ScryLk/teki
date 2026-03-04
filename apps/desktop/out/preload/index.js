"use strict";
const electron = require("electron");
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
  // App
  APP_GET_VERSION: "app:getVersion",
  // AI Validation
  AI_VALIDATE_KEY: "ai:validateKey",
  // Auth
  AUTH_DEVICE_START: "auth:device:start",
  AUTH_DEVICE_CANCEL: "auth:device:cancel",
  AUTH_DEVICE_STATUS: "auth:device:status",
  AUTH_LOGIN_CREDENTIALS: "auth:loginCredentials",
  AUTH_SET_API_KEY: "auth:setApiKey",
  AUTH_GET_STATUS: "auth:getStatus",
  AUTH_LOGOUT: "auth:logout"
};
const tekiAPI = {
  // Window watching
  getAvailableWindows: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.WATCH_GET_SOURCES);
  },
  startWatching: (sourceId) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.WATCH_START, sourceId);
  },
  stopWatching: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.WATCH_STOP);
  },
  onWindowFrame: (callback) => {
    const listener = (_event, frame) => {
      callback(frame);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.WATCH_FRAME, listener);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.WATCH_FRAME, listener);
    };
  },
  onWindowClosed: (callback) => {
    const listener = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.WATCH_WINDOW_CLOSED, listener);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.WATCH_WINDOW_CLOSED, listener);
    };
  },
  // Settings
  getSetting: (key) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key);
  },
  setSetting: (key, value) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, key, value);
  },
  getAllSettings: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_ALL);
  },
  // Window detection
  onActiveWindow: (callback) => {
    const listener = (_event, info) => {
      callback(info);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.WINDOW_ACTIVE, listener);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.WINDOW_ACTIVE, listener);
    };
  },
  // Tray actions
  onTraySelectWindow: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("tray-select-window", listener);
    return () => electron.ipcRenderer.removeListener("tray-select-window", listener);
  },
  onTrayStopWatching: (callback) => {
    const listener = () => callback();
    electron.ipcRenderer.on("tray-stop-watching", listener);
    return () => electron.ipcRenderer.removeListener("tray-stop-watching", listener);
  },
  // App info
  getVersion: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  },
  // AI Key Validation
  validateApiKey: (provider, key) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AI_VALIDATE_KEY, provider, key);
  },
  // Auth
  startDeviceAuth: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_DEVICE_START);
  },
  cancelDeviceAuth: () => {
    electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_DEVICE_CANCEL);
  },
  onAuthStatus: (callback) => {
    const listener = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on(IPC_CHANNELS.AUTH_DEVICE_STATUS, listener);
    return () => {
      electron.ipcRenderer.removeListener(IPC_CHANNELS.AUTH_DEVICE_STATUS, listener);
    };
  },
  loginWithCredentials: (email, password) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN_CREDENTIALS, email, password);
  },
  setApiKey: (key) => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_SET_API_KEY, key);
  },
  getAuthStatus: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_STATUS);
  },
  logout: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT);
  }
};
electron.contextBridge.exposeInMainWorld("tekiAPI", tekiAPI);
