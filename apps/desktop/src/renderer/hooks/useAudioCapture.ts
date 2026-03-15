import { useState, useCallback, useRef } from 'react';

interface UseAudioCaptureReturn {
  isCapturing: boolean;
  isPaused: boolean;
  startCapture: (sourceId: string) => Promise<void>;
  stopCapture: () => void;
  pauseCapture: () => void;
  resumeCapture: () => void;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const startCapture = useCallback(async (_sourceId: string) => {
    // Use getDisplayMedia to capture desktop/system audio.
    // The main process has a setDisplayMediaRequestHandler that provides
    // the screen source with loopback audio — avoids the getUserMedia +
    // chromeMediaSourceId crash (Chromium bad_message reason 263).
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true, // required by getDisplayMedia spec, we discard it
    });

    // Discard the video track — we only need audio
    stream.getVideoTracks().forEach((t) => t.stop());

    streamRef.current = stream;

    // Create audio context at 16kHz for Gemini
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    // Load the PCM processor worklet
    // pcm-processor.js is in src/renderer/public/ and served at root
    await audioContext.audioWorklet.addModule('/pcm-processor.js');

    // Create audio pipeline
    const source = audioContext.createMediaStreamSource(stream);
    const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
    workletNodeRef.current = workletNode;

    // Handle PCM chunks from worklet
    workletNode.port.onmessage = (event) => {
      const { pcmChunk } = event.data as { pcmChunk: ArrayBuffer };
      // Convert ArrayBuffer to base64
      const bytes = new Uint8Array(pcmChunk);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      window.tekiAPI.transcriptionSendChunk(base64);
    };

    source.connect(workletNode);
    workletNode.connect(audioContext.destination);

    setIsCapturing(true);
    setIsPaused(false);
  }, []);

  const stopCapture = useCallback(() => {
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setIsCapturing(false);
    setIsPaused(false);
  }, []);

  const pauseCapture = useCallback(() => {
    audioContextRef.current?.suspend();
    setIsPaused(true);
  }, []);

  const resumeCapture = useCallback(() => {
    audioContextRef.current?.resume();
    setIsPaused(false);
  }, []);

  return { isCapturing, isPaused, startCapture, stopCapture, pauseCapture, resumeCapture };
}
