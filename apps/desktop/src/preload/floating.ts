import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('floatingApi', {
  resize: (width: number, height: number): void => {
    ipcRenderer.send('floating:resize', width, height);
  },
  hide: (): void => {
    ipcRenderer.send('floating:hide');
  },
  sendToAgent: (text: string): Promise<{ reply: string }> => {
    return ipcRenderer.invoke('floating:send-to-agent', text);
  },
  isWatching: (): Promise<boolean> => {
    return ipcRenderer.invoke('floating:is-watching');
  },
  onStartRecording: (callback: () => void): (() => void) => {
    const handler = () => callback();
    ipcRenderer.on('floating:start-recording', handler);
    return () => ipcRenderer.removeListener('floating:start-recording', handler);
  },
  expandToMain: (): void => {
    ipcRenderer.send('floating:expand-to-main');
  },
});
