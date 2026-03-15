import { ipcMain, desktopCapturer, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '@teki/shared';
import type { AudioSource, TranscriptionConfig } from '@teki/shared';
import { DEFAULT_TRANSCRIPTION_CONFIG } from '@teki/shared';
import { GeminiLiveService } from './services/gemini-live-service';
import { TranscriptionAnalyzer } from './services/transcription-analyzer';
import settingsStore from './services/settings-store';
import { safeSend } from './utils/safe-ipc';

let geminiLive: GeminiLiveService | null = null;
let analyzer: TranscriptionAnalyzer | null = null;

export function setupTranscriptionIPC(mainWindow: BrowserWindow): void {
  // ── Get available audio sources ─────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.TRANSCRIPTION_GET_SOURCES, async (): Promise<AudioSource[]> => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 160, height: 120 },
      });

      return sources.map((s) => ({
        id: s.id,
        name: s.name,
        thumbnail: s.thumbnail.toDataURL(),
        type: s.id.startsWith('screen') ? 'screen' as const : 'window' as const,
      }));
    } catch (err) {
      console.error('[Transcription] Error getting sources:', err);
      return [];
    }
  });

  // ── Start transcription ─────────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.TRANSCRIPTION_START,
    async (_event, sourceId: string, config?: Partial<TranscriptionConfig>) => {
      const mergedConfig = { ...DEFAULT_TRANSCRIPTION_CONFIG, ...config };

      const apiKey = settingsStore.get('geminiApiKey' as never) as string;
      if (!apiKey) {
        throw new Error('Gemini API key não configurada. Configure em Configurações > Provedores de IA.');
      }

      // Clean up previous session safely
      try {
        if (geminiLive) {
          geminiLive.disconnect();
          geminiLive = null;
        }
      } catch {
        geminiLive = null;
      }

      // Create services
      geminiLive = new GeminiLiveService(apiKey, mergedConfig.modelId);
      analyzer = new TranscriptionAnalyzer();

      // Wire up callbacks with safe send
      geminiLive.onTranscript((segment) => {
        try {
          analyzer?.addSegment(segment);
        } catch { /* ignore */ }
        safeSend(mainWindow, IPC_CHANNELS.TRANSCRIPTION_SEGMENT, segment);
      });

      geminiLive.onError((error) => {
        safeSend(mainWindow, IPC_CHANNELS.TRANSCRIPTION_ERROR, error);
      });

      analyzer.onSuggestion((suggestion) => {
        safeSend(mainWindow, IPC_CHANNELS.TRANSCRIPTION_SUGGESTION, suggestion);
      });

      // Connect to Gemini Live — propagate error to renderer
      try {
        await geminiLive.connect();
      } catch (err) {
        // Clean up on connection failure
        geminiLive?.disconnect();
        geminiLive = null;
        analyzer?.reset();
        analyzer = null;
        throw err;
      }
    },
  );

  // ── Send audio chunk ────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.TRANSCRIPTION_SEND_CHUNK, (_event, base64: string) => {
    try {
      geminiLive?.sendAudioChunk(base64);
    } catch {
      // Ignore — non-critical
    }
  });

  // ── Stop transcription ──────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.TRANSCRIPTION_STOP, async () => {
    const segments = analyzer?.getSegments() ?? [];

    try {
      geminiLive?.disconnect();
    } catch { /* ignore */ }
    geminiLive = null;

    try {
      analyzer?.reset();
    } catch { /* ignore */ }
    analyzer = null;

    return { segments };
  });

  // ── Pause ───────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.TRANSCRIPTION_PAUSE, async () => {
    geminiLive?.pause();
  });

  // ── Resume ──────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.TRANSCRIPTION_RESUME, async () => {
    geminiLive?.resume();
  });
}
