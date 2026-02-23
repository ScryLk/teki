import { contextBridge, ipcRenderer } from 'electron';

export interface TrayMenuState {
  status: 'idle' | 'watching' | 'alert';
  windowName: string;
  elapsed: string;
  lastDuration: string;
  version: string;
}

contextBridge.exposeInMainWorld('trayApi', {
  onMenuState: (callback: (state: TrayMenuState) => void): void => {
    ipcRenderer.on('menu-state', (_event, state: TrayMenuState) => callback(state));
  },
  sendAction: (action: string): void => {
    ipcRenderer.send('popup-action', action);
  },
  setHeight: (height: number): void => {
    ipcRenderer.send('popup-resize', height);
  },
});
