import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { CatState } from '@/components/cat/cat-states';

/** How long the "happy" state displays before reverting (ms). */
const HAPPY_DURATION_MS = 3_000;

/** How long the "alert" state displays before reverting (ms). */
const ALERT_DURATION_MS = 5_000;

/** Duration of inactivity before the cat falls asleep (ms). */
const SLEEP_INACTIVITY_MS = 5 * 60 * 1_000;

/**
 * useCatState
 *
 * A state-machine hook that drives the cat mascot's behaviour. It reads and
 * writes to the global Zustand store and automatically transitions between
 * states based on application events (capture status, AI responses, errors,
 * and user inactivity).
 *
 * Usage:
 * ```ts
 * const { catState, setCatState, triggerHappy, triggerAlert } = useCatState();
 * ```
 */
export function useCatState() {
  const catState = useAppStore((s) => s.catState);
  const setCatState = useAppStore((s) => s.setCatState);
  const isCapturing = useAppStore((s) => s.isCapturing);

  // Keeps track of the state to revert to after a transient state expires.
  const previousStateRef = useRef<CatState>('idle');

  // Timer handles so we can cancel pending transitions.
  const happyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- helpers to clear timers ----

  const clearHappyTimer = useCallback(() => {
    if (happyTimerRef.current !== null) {
      clearTimeout(happyTimerRef.current);
      happyTimerRef.current = null;
    }
  }, []);

  const clearAlertTimer = useCallback(() => {
    if (alertTimerRef.current !== null) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
  }, []);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current !== null) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  }, []);

  // ---- reset the inactivity (sleep) timer ----

  const resetSleepTimer = useCallback(() => {
    clearSleepTimer();
    sleepTimerRef.current = setTimeout(() => {
      // Only fall asleep if we are in a restful state.
      const current = useAppStore.getState().catState;
      if (current === 'idle' || current === 'watching') {
        previousStateRef.current = current;
        setCatState('sleeping');
      }
    }, SLEEP_INACTIVITY_MS);
  }, [clearSleepTimer, setCatState]);

  // ---- public triggers ----

  /**
   * Briefly switch to "happy" for HAPPY_DURATION_MS, then revert to the
   * previous state.  Useful when an AI response arrives successfully.
   */
  const triggerHappy = useCallback(() => {
    clearHappyTimer();
    clearAlertTimer();
    resetSleepTimer();

    const current = useAppStore.getState().catState;
    if (current !== 'happy') {
      previousStateRef.current = current === 'alert' || current === 'sleeping'
        ? (isCapturing ? 'watching' : 'idle')
        : current;
    }

    setCatState('happy');

    happyTimerRef.current = setTimeout(() => {
      happyTimerRef.current = null;
      setCatState(previousStateRef.current);
    }, HAPPY_DURATION_MS);
  }, [clearHappyTimer, clearAlertTimer, resetSleepTimer, setCatState, isCapturing]);

  /**
   * Briefly switch to "alert" for ALERT_DURATION_MS, then revert to the
   * previous state.  Useful when an error is detected.
   */
  const triggerAlert = useCallback(() => {
    clearAlertTimer();
    clearHappyTimer();
    resetSleepTimer();

    const current = useAppStore.getState().catState;
    if (current !== 'alert') {
      previousStateRef.current = current === 'happy' || current === 'sleeping'
        ? (isCapturing ? 'watching' : 'idle')
        : current;
    }

    setCatState('alert');

    alertTimerRef.current = setTimeout(() => {
      alertTimerRef.current = null;
      setCatState(previousStateRef.current);
    }, ALERT_DURATION_MS);
  }, [clearAlertTimer, clearHappyTimer, resetSleepTimer, setCatState, isCapturing]);

  // ---- React to capture state changes ----

  useEffect(() => {
    // When capture starts/stops, set the appropriate base state unless the cat
    // is in a transient (happy/alert) state that should run its course.
    const current = useAppStore.getState().catState;

    if (isCapturing) {
      if (current !== 'happy' && current !== 'alert' && current !== 'thinking') {
        setCatState('watching');
        previousStateRef.current = 'watching';
      } else {
        // If we're in a transient state, make sure we revert to 'watching'.
        previousStateRef.current = 'watching';
      }
    } else {
      if (current !== 'happy' && current !== 'alert' && current !== 'thinking') {
        setCatState('idle');
        previousStateRef.current = 'idle';
      } else {
        previousStateRef.current = 'idle';
      }
    }

    resetSleepTimer();
  }, [isCapturing, setCatState, resetSleepTimer]);

  // ---- Track user activity to reset the sleep timer ----

  useEffect(() => {
    const activityEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    const onActivity = () => {
      // Wake the cat if it was sleeping.
      const current = useAppStore.getState().catState;
      if (current === 'sleeping') {
        const base = isCapturing ? 'watching' : 'idle';
        setCatState(base);
        previousStateRef.current = base;
      }
      resetSleepTimer();
    };

    for (const evt of activityEvents) {
      window.addEventListener(evt, onActivity, { passive: true });
    }

    // Start the initial sleep timer.
    resetSleepTimer();

    return () => {
      for (const evt of activityEvents) {
        window.removeEventListener(evt, onActivity);
      }
      clearSleepTimer();
      clearHappyTimer();
      clearAlertTimer();
    };
  }, [isCapturing, setCatState, resetSleepTimer, clearSleepTimer, clearHappyTimer, clearAlertTimer]);

  return {
    catState: catState as CatState,
    setCatState: setCatState as (state: CatState) => void,
    triggerHappy,
    triggerAlert,
  };
}
