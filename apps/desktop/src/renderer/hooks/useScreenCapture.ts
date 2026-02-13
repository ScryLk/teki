import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { CaptureFrame } from '@teki/shared';

interface CaptureSource {
  id: string;
  name: string;
  thumbnail: string;
}

export function useScreenCapture() {
  const [sources, setSources] = useState<CaptureSource[]>([]);

  const isCapturing = useAppStore((s) => s.isCapturing);
  const captureInterval = useAppStore((s) => s.captureInterval);
  const currentFrame = useAppStore((s) => s.currentFrame);
  const setCaptureState = useAppStore((s) => s.setCaptureState);
  const setCurrentFrame = useAppStore((s) => s.setCurrentFrame);
  const setCatState = useAppStore((s) => s.setCatState);

  const cleanupRef = useRef<(() => void) | null>(null);

  // Load available capture sources
  const loadSources = useCallback(async () => {
    try {
      const availableSources = await window.tekiAPI.getSources();
      setSources(availableSources);
    } catch (err) {
      console.error('Failed to load capture sources:', err);
    }
  }, []);

  // Start capturing
  const startCapture = useCallback(
    (sourceId: string, interval?: number) => {
      const effectiveInterval = interval ?? captureInterval;
      window.tekiAPI.startCapture(sourceId, effectiveInterval);
      setCaptureState(true, effectiveInterval);
      setCatState('watching');
    },
    [captureInterval, setCaptureState, setCatState]
  );

  // Stop capturing
  const stopCapture = useCallback(() => {
    window.tekiAPI.stopCapture();
    setCaptureState(false);
    setCatState('idle');
  }, [setCaptureState, setCatState]);

  // Single capture
  const captureNow = useCallback(async () => {
    try {
      const frame = await window.tekiAPI.captureNow();
      if (frame) {
        setCurrentFrame(frame.image);
        setCatState('watching');
      }
      return frame;
    } catch (err) {
      console.error('Failed to capture frame:', err);
      return null;
    }
  }, [setCurrentFrame, setCatState]);

  // Set up frame listener and load sources on mount
  useEffect(() => {
    loadSources();

    const unsubscribe = window.tekiAPI.onCaptureFrame((frame: CaptureFrame) => {
      setCurrentFrame(frame.image);
      setCatState('watching');
    });

    cleanupRef.current = unsubscribe;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Stop capture on unmount if still running
      if (useAppStore.getState().isCapturing) {
        window.tekiAPI.stopCapture();
        setCaptureState(false);
      }
    };
  }, [loadSources, setCurrentFrame, setCatState, setCaptureState]);

  return {
    sources,
    isCapturing,
    captureInterval,
    currentFrame,
    startCapture,
    stopCapture,
    captureNow,
    loadSources,
  };
}
