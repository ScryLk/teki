import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { CatMascot } from './CatMascot';
import type { CatState } from './cat-states';

const CatAnimationPreviewModal = process.env.NODE_ENV === 'development'
  ? lazy(() => import('@/components/dev/CatAnimationPreviewModal'))
  : () => null;

/** Duration in ms for one-shot animations before reverting. */
const ONE_SHOT_DURATIONS: Partial<Record<CatState, number>> = {
  alert: 5000,
  happy: 3000,
};

interface DevCatWrapperProps {
  state: CatState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * DevCatWrapper wraps CatMascot with dev-only interactive behavior:
 * - Click to open animation preview modal
 * - Override state with selected animation
 * - Loop or one-shot mode
 * - Visual badges for dev feedback
 *
 * In production, renders CatMascot as-is with no extra behavior.
 */
export const DevCatWrapper: React.FC<DevCatWrapperProps> = ({
  state: realState,
  size = 'md',
  className = '',
}) => {
  const isDev = process.env.NODE_ENV === 'development';
  const [showPreview, setShowPreview] = useState(false);
  const [devOverrideState, setDevOverrideState] = useState<CatState | null>(null);
  const [devLoop, setDevLoop] = useState(false);
  const oneShotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear one-shot timer on unmount
  useEffect(() => {
    return () => {
      if (oneShotTimerRef.current) {
        clearTimeout(oneShotTimerRef.current);
      }
    };
  }, []);

  const displayState = devOverrideState ?? realState;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isDev) return;

      if (e.shiftKey) {
        // Shift+Click: always open modal
        setShowPreview(true);
      } else if (devLoop && devOverrideState) {
        // Click with loop active: stop loop, revert to real state
        setDevOverrideState(null);
        setDevLoop(false);
      } else {
        // Normal click: open modal
        setShowPreview(true);
      }
    },
    [isDev, devLoop, devOverrideState]
  );

  const handleApplyAnimation = useCallback(
    (state: CatState, loop: boolean) => {
      // Clear any pending one-shot timer
      if (oneShotTimerRef.current) {
        clearTimeout(oneShotTimerRef.current);
        oneShotTimerRef.current = null;
      }

      setDevOverrideState(state);
      setDevLoop(loop);

      if (!loop) {
        const duration = ONE_SHOT_DURATIONS[state];
        if (duration) {
          // One-shot: revert after animation duration
          oneShotTimerRef.current = setTimeout(() => {
            oneShotTimerRef.current = null;
            setDevOverrideState(null);
            setDevLoop(false);
          }, duration);
        }
        // Looping animation types (idle, watching, thinking, sleeping)
        // without the Loop checkbox: keep playing until next interaction
      }
    },
    []
  );

  // In production, just render CatMascot directly
  if (!isDev) {
    return <CatMascot state={realState} size={size} className={className} />;
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="group relative"
        style={{ cursor: 'pointer' }}
      >
        <CatMascot
          state={displayState}
          size={size}
          className={`${className} !pointer-events-auto`}
        />

        {/* Dev badge: appears on hover */}
        <span
          className="
            absolute -top-2 -right-2
            opacity-0 group-hover:opacity-100
            text-xs bg-zinc-800 border border-zinc-600
            rounded-full px-1.5 py-0.5
            transition-opacity duration-200
            pointer-events-none z-20
          "
        >
          {'\u{1F3AC}'}
        </span>

        {/* Loop indicator */}
        {devLoop && devOverrideState && (
          <span
            className="
              absolute -bottom-2 left-1/2 -translate-x-1/2
              text-[10px] bg-amber-500/90 text-black
              rounded-full px-1.5 py-0.5
              animate-pulse font-mono
              pointer-events-none z-20 whitespace-nowrap
            "
          >
            {'\u{1F504}'} {devOverrideState}
          </span>
        )}

        {/* Override state indicator (when not looping) */}
        {!devLoop && devOverrideState && (
          <span
            className="
              absolute -bottom-2 left-1/2 -translate-x-1/2
              text-[10px] bg-emerald-500/80 text-white
              rounded-full px-1.5 py-0.5
              font-mono pointer-events-none z-20 whitespace-nowrap
            "
          >
            {devOverrideState}
          </span>
        )}
      </div>

      {/* Preview modal */}
      <Suspense fallback={null}>
        <CatAnimationPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          currentState={devOverrideState ?? realState}
          onApplyAnimation={handleApplyAnimation}
        />
      </Suspense>
    </>
  );
};

export default DevCatWrapper;
