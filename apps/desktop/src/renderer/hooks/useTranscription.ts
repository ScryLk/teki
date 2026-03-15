import { useCallback, useEffect } from 'react';
import { useTranscriptionStore } from '@/stores/transcription-store';
import { useAudioCapture } from './useAudioCapture';
import type { TranscriptionConfig } from '@teki/shared';

export function useTranscription() {
  const store = useTranscriptionStore();
  const { isCapturing, isPaused, startCapture, stopCapture, pauseCapture, resumeCapture } = useAudioCapture();

  // Listen for IPC events
  useEffect(() => {
    const unsubSegment = window.tekiAPI.onTranscriptionSegment((segment) => {
      const existing = store.segments.find((s) => s.id === segment.id);
      if (existing) {
        useTranscriptionStore.getState().updateSegment(segment.id, segment.text, segment.isFinal);
      } else {
        useTranscriptionStore.getState().addSegment(segment);
      }
    });

    const unsubSuggestion = window.tekiAPI.onTranscriptionSuggestion((suggestion) => {
      useTranscriptionStore.getState().addSuggestion(suggestion);
    });

    const unsubError = window.tekiAPI.onTranscriptionError((error) => {
      useTranscriptionStore.getState().setError(error.message);
    });

    return () => {
      unsubSegment();
      unsubSuggestion();
      unsubError();
    };
  }, []);

  const start = useCallback(async (sourceId: string, config?: Partial<TranscriptionConfig>) => {
    try {
      store.setStatus('recording');
      await window.tekiAPI.transcriptionStart(sourceId, config);
      await startCapture(sourceId);
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Erro ao iniciar transcrição');
    }
  }, [startCapture, store]);

  const stop = useCallback(async () => {
    stopCapture();
    const result = await window.tekiAPI.transcriptionStop();
    store.setStatus('idle');
    return result;
  }, [stopCapture, store]);

  const pause = useCallback(async () => {
    pauseCapture();
    await window.tekiAPI.transcriptionPause();
    store.setStatus('paused');
  }, [pauseCapture, store]);

  const resume = useCallback(async () => {
    resumeCapture();
    await window.tekiAPI.transcriptionResume();
    store.setStatus('recording');
  }, [resumeCapture, store]);

  return {
    status: store.status,
    segments: store.segments,
    suggestions: store.suggestions,
    selectedSource: store.selectedSource,
    error: store.error,
    startTime: store.startTime,
    isCapturing,
    isPaused,
    start,
    stop,
    pause,
    resume,
    setSelectedSource: store.setSelectedSource,
    reset: store.reset,
  };
}
