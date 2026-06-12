import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceSuggestion, VoiceStateEvent } from '@teki/shared';
import { UtteranceSegmenter } from './utterance-segmenter';
import { samplesToBase64Wav } from './wav-encoder';

// ─── useVoiceListening ───────────────────────────────────────────────────────
// Owns the two capture channels:
//   Channel A — technician microphone (getUserMedia). Captured separately so
//               the streams never mix; the trigger NEVER reads this channel.
//   Channel B — system loopback (reporter's voice in the VoIP call), via
//               electron-audio-loopback + getDisplayMedia. VAD segments this
//               channel into utterances which are sent to the API.
// Raw audio stays in renderer memory; utterances are sent as in-memory WAV
// and discarded. Nothing is written to disk.

export type VoiceUiStatus =
  | 'idle'
  | 'consent'
  | 'starting'
  | 'listening'
  | 'error';

interface CaptureHandles {
  micStream: MediaStream | null;
  loopbackStream: MediaStream | null;
  audioContext: AudioContext | null;
  processor: ScriptProcessorNode | null;
  segmenter: UtteranceSegmenter | null;
}

export interface UseVoiceListening {
  status: VoiceUiStatus;
  error: string | null;
  /** Suggestion pushed automatically ([BASE LOCAL] >= threshold). */
  pushedSuggestion: VoiceSuggestion | null;
  /** Discreet badge suggestion ([INFERIDO]) awaiting expansion. */
  badgeSuggestion: VoiceSuggestion | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  grantConsent: () => Promise<void>;
  declineConsent: () => void;
  expandBadge: () => void;
  dismissSuggestion: () => void;
}

export function useVoiceListening(): UseVoiceListening {
  const [status, setStatus] = useState<VoiceUiStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pushedSuggestion, setPushedSuggestion] = useState<VoiceSuggestion | null>(null);
  const [badgeSuggestion, setBadgeSuggestion] = useState<VoiceSuggestion | null>(null);

  const handles = useRef<CaptureHandles>({
    micStream: null,
    loopbackStream: null,
    audioContext: null,
    processor: null,
    segmenter: null,
  });
  const listeningRef = useRef(false);

  const teardownCapture = useCallback(() => {
    const h = handles.current;
    h.segmenter?.flush();
    h.processor?.disconnect();
    h.micStream?.getTracks().forEach((t) => t.stop());
    h.loopbackStream?.getTracks().forEach((t) => t.stop());
    h.audioContext?.close().catch(() => {});
    handles.current = {
      micStream: null,
      loopbackStream: null,
      audioContext: null,
      processor: null,
      segmenter: null,
    };
    listeningRef.current = false;
  }, []);

  const stop = useCallback(async () => {
    teardownCapture();
    setStatus('idle');
    setPushedSuggestion(null);
    setBadgeSuggestion(null);
    await window.floatingApi?.voiceStop();
  }, [teardownCapture]);

  const sendUtterance = useCallback(
    async (samples: Float32Array, sampleRate: number) => {
      if (!listeningRef.current) return;
      const { base64, durationMs } = samplesToBase64Wav(samples, sampleRate);
      const response = await window.floatingApi?.voiceSendUtterance({
        audioBase64: base64,
        mimeType: 'audio/wav',
        durationMs,
      });
      if (response && !response.ok && response.error) {
        // Quota/session errors: main already ended the session
        if (
          response.error.code === 'QUOTA_EXCEEDED' ||
          response.error.code === 'SESSION_ENDED' ||
          response.error.code === 'NO_SESSION'
        ) {
          teardownCapture();
          setError(response.error.message);
          setStatus('error');
        }
      }
    },
    [teardownCapture]
  );

  const startCapture = useCallback(async () => {
    // Channel A — technician mic. Captured as its own stream; intentionally
    // not routed into the trigger pipeline (speaker separation without
    // diarization in the MVP).
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });

    // Channel B — system loopback (the reporter). getDisplayMedia demands
    // video: true; we drop the video track immediately.
    await window.floatingApi?.enableLoopbackAudio();
    let loopbackStream: MediaStream;
    try {
      loopbackStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    } finally {
      await window.floatingApi?.disableLoopbackAudio();
    }
    loopbackStream.getVideoTracks().forEach((track) => {
      track.stop();
      loopbackStream.removeTrack(track);
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(loopbackStream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const segmenter = new UtteranceSegmenter(
      (samples, _durationMs) => {
        void sendUtterance(samples, audioContext.sampleRate);
      },
      { sampleRate: audioContext.sampleRate }
    );

    processor.onaudioprocess = (event) => {
      segmenter.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };

    // Keep the processor pulling without echoing loopback audio back out.
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);

    handles.current = {
      micStream,
      loopbackStream,
      audioContext,
      processor,
      segmenter,
    };
    listeningRef.current = true;
  }, [sendUtterance]);

  const start = useCallback(async () => {
    setError(null);

    // Consent first — capture never starts without it.
    const consent = await window.floatingApi?.voiceConsentGet();
    if (!consent?.granted) {
      setStatus('consent');
      return;
    }

    setStatus('starting');
    const result = await window.floatingApi?.voiceStart();
    if (!result?.ok) {
      setError(result?.error?.message ?? 'Não foi possível ativar a escuta.');
      setStatus('error');
      return;
    }

    try {
      await startCapture();
      setStatus('listening');
    } catch (err) {
      await window.floatingApi?.voiceStop();
      teardownCapture();
      setError(
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Permissão de captura de áudio negada pelo sistema.'
          : 'Falha ao iniciar a captura de áudio.'
      );
      setStatus('error');
    }
  }, [startCapture, teardownCapture]);

  const grantConsent = useCallback(async () => {
    const result = await window.floatingApi?.voiceConsentSet(true);
    if (result?.ok) {
      await start();
    } else {
      setError('Não foi possível registrar o consentimento.');
      setStatus('error');
    }
  }, [start]);

  const declineConsent = useCallback(() => {
    setStatus('idle');
  }, []);

  const expandBadge = useCallback(() => {
    setBadgeSuggestion((badge) => {
      if (badge) setPushedSuggestion(badge);
      return null;
    });
  }, []);

  const dismissSuggestion = useCallback(() => {
    setPushedSuggestion(null);
  }, []);

  // Suggestions pushed from main (single source of truth for display)
  useEffect(() => {
    const unsub = window.floatingApi?.onVoiceSuggestion?.((raw) => {
      const suggestion = raw as VoiceSuggestion;
      if (suggestion.mode === 'push') {
        setPushedSuggestion(suggestion);
      } else {
        setBadgeSuggestion(suggestion);
      }
    });
    return () => unsub?.();
  }, []);

  // Session state changes from main (quota exhausted, errors)
  useEffect(() => {
    const unsub = window.floatingApi?.onVoiceState?.((raw) => {
      const event = raw as VoiceStateEvent;
      if (event.state === 'error' && listeningRef.current) {
        teardownCapture();
        setError(event.error ?? 'Sessão de voz encerrada.');
        setStatus('error');
      }
    });
    return () => unsub?.();
  }, [teardownCapture]);

  // Stop capture when the floating window unmounts
  useEffect(() => teardownCapture, [teardownCapture]);

  return {
    status,
    error,
    pushedSuggestion,
    badgeSuggestion,
    start,
    stop,
    grantConsent,
    declineConsent,
    expandBadge,
    dismissSuggestion,
  };
}
