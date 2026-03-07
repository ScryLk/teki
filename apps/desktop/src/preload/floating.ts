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
  onStartRecording: (callback: () => void): (() => void) => {
    const handler = () => callback();
    ipcRenderer.on('floating:start-recording', handler);
    return () => ipcRenderer.removeListener('floating:start-recording', handler);
  },
});
