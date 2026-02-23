"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("trayApi", {
  onMenuState: (callback) => {
    electron.ipcRenderer.on("menu-state", (_event, state) => callback(state));
  },
  sendAction: (action) => {
    electron.ipcRenderer.send("popup-action", action);
  },
  setHeight: (height) => {
    electron.ipcRenderer.send("popup-resize", height);
  }
});
