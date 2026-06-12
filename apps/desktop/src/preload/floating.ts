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

  // ── Voice listening (call assistance) ──────────────────────────────
  voiceConsentGet: (): Promise<{ granted: boolean; recordedAt: string | null }> => {
    return ipcRenderer.invoke('voice:consent:get');
  },
  voiceConsentSet: (granted: boolean): Promise<{ ok: boolean; granted?: boolean }> => {
    return ipcRenderer.invoke('voice:consent:set', granted);
  },
  voiceStart: (): Promise<{
    ok: boolean;
    session?: unknown;
    error?: { code: string; message: string };
  }> => {
    return ipcRenderer.invoke('voice:start');
  },
  voiceStop: (): Promise<{ ok: boolean }> => {
    return ipcRenderer.invoke('voice:stop');
  },
  voiceSendUtterance: (payload: {
    audioBase64: string;
    mimeType: string;
    durationMs: number;
  }): Promise<{ ok: boolean; result?: unknown; error?: { code: string; message: string } }> => {
    return ipcRenderer.invoke('voice:utterance', payload);
  },
  onVoiceState: (callback: (event: unknown) => void): (() => void) => {
    const handler = (_e: unknown, data: unknown) => callback(data);
    ipcRenderer.on('voice:state', handler);
    return () => ipcRenderer.removeListener('voice:state', handler);
  },
  onVoiceSuggestion: (callback: (suggestion: unknown) => void): (() => void) => {
    const handler = (_e: unknown, data: unknown) => callback(data);
    ipcRenderer.on('voice:suggestion', handler);
    return () => ipcRenderer.removeListener('voice:suggestion', handler);
  },

  // System audio loopback toggle (electron-audio-loopback manual mode).
  // getDisplayMedia requires video: true — the renderer drops the video
  // track immediately and keeps only the system audio (channel B).
  enableLoopbackAudio: (): Promise<void> => {
    return ipcRenderer.invoke('enable-loopback-audio');
  },
  disableLoopbackAudio: (): Promise<void> => {
    return ipcRenderer.invoke('disable-loopback-audio');
  },
});
