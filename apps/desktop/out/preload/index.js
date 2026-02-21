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
  APP_GET_VERSION: "app:getVersion"
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
  // App info
  getVersion: () => {
    return electron.ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION);
  }
};
electron.contextBridge.exposeInMainWorld("tekiAPI", tekiAPI);
