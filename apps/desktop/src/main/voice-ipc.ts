import { ipcMain } from 'electron';
import { getFloatingWindow } from './floating-window';
import { safeSend } from './utils/safe-ipc';
import settingsStore from './services/settings-store';
import { logAction } from './services/log-service';
import {
  getVoiceConsent,
  setVoiceConsent,
  startVoiceSession,
  endVoiceSession,
  postVoiceUtterance,
} from './services/voice-api';
import {
  IPC_CHANNELS,
  type VoiceStateEvent,
  type VoiceSessionInfo,
} from '@teki/shared';

// ─── Voice listening IPC (main) ──────────────────────────────────────────────
// The floating renderer owns audio capture + VAD; the main process owns the
// session lifecycle and the (authenticated) calls to the web API. Without an
// active session id, utterances are rejected — capture cannot outlive consent.

let activeSession: VoiceSessionInfo | null = null;

function emitState(event: VoiceStateEvent): void {
  safeSend(getFloatingWindow(), IPC_CHANNELS.VOICE_STATE, event);
}

export function registerVoiceIPC(): void {
  ipcMain.handle(IPC_CHANNELS.VOICE_CONSENT_GET, async () => {
    const result = await getVoiceConsent();
    if (result.ok) {
      return { granted: result.data.granted, recordedAt: result.data.recordedAt };
    }
    return { granted: false, recordedAt: null, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.VOICE_CONSENT_SET, async (_event, granted: boolean) => {
    const result = await setVoiceConsent(Boolean(granted));
    if (result.ok && result.data.granted) {
      settingsStore.set(
        'voiceConsentGrantedAt' as never,
        new Date().toISOString() as never
      );
    } else {
      settingsStore.set('voiceConsentGrantedAt' as never, null as never);
    }
    return result.ok
      ? { ok: true, granted: result.data.granted }
      : { ok: false, error: result.error };
  });

  ipcMain.handle(IPC_CHANNELS.VOICE_START, async () => {
    if (activeSession) {
      return { ok: true, session: activeSession };
    }
    const result = await startVoiceSession();
    if (!result.ok) {
      emitState({ state: 'error', sessionId: null, error: result.error.message });
      return { ok: false, error: result.error };
    }
    activeSession = result.data;
    logAction('Escuta de chamada ativada', { sessionId: activeSession.id });
    emitState({ state: 'listening', sessionId: activeSession.id });
    return { ok: true, session: activeSession };
  });

  ipcMain.handle(IPC_CHANNELS.VOICE_STOP, async () => {
    if (!activeSession) return { ok: true };
    const sessionId = activeSession.id;
    activeSession = null;
    const result = await endVoiceSession(sessionId);
    logAction('Escuta de chamada desativada', { sessionId });
    emitState({ state: 'idle', sessionId: null });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  });

  ipcMain.handle(
    IPC_CHANNELS.VOICE_UTTERANCE,
    async (
      _event,
      payload: { audioBase64: string; mimeType: string; durationMs: number }
    ) => {
      if (!activeSession) {
        return { ok: false, error: { code: 'NO_SESSION', message: 'Sessão inativa.' } };
      }
      const result = await postVoiceUtterance(activeSession.id, payload);
      if (!result.ok) {
        // Quota exhausted mid-call → stop listening instead of silently dropping
        if (result.error.code === 'QUOTA_EXCEEDED' || result.error.code === 'SESSION_ENDED') {
          const sessionId = activeSession.id;
          activeSession = null;
          endVoiceSession(sessionId).catch(() => {});
          emitState({ state: 'error', sessionId: null, error: result.error.message });
        }
        return { ok: false, error: result.error };
      }
      if (result.data.suggestion) {
        safeSend(getFloatingWindow(), IPC_CHANNELS.VOICE_SUGGESTION, result.data.suggestion);
      }
      return { ok: true, result: result.data };
    }
  );
}

/** Ends any active session (app quit, logout). */
export async function teardownVoiceSession(): Promise<void> {
  if (!activeSession) return;
  const sessionId = activeSession.id;
  activeSession = null;
  await endVoiceSession(sessionId).catch(() => {});
}
