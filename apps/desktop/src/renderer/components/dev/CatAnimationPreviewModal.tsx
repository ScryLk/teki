import React, { useState, useEffect } from 'react';
import { CatMascot } from '@/components/cat/CatMascot';
import type { CatState } from '@/components/cat/cat-states';

interface CatAnimation {
  state: CatState;
  icon: string;
  label: string;
  description: string;
  type: 'looping' | 'one-shot';
}

const CAT_ANIMATIONS: CatAnimation[] = [
  {
    state: 'idle',
    icon: '\u{1F63A}',
    label: 'Idle',
    description: 'Sentado, piscando lento. Rabo parado.',
    type: 'looping',
  },
  {
    state: 'watching',
    icon: '\u{1F440}',
    label: 'Watching',
    description: 'Atento, pupilas grandes. Orelhas para frente, rabo balançando.',
    type: 'looping',
  },
  {
    state: 'thinking',
    icon: '\u{1F914}',
    label: 'Thinking',
    description: 'Patinha no queixo, "..." flutuando. Olhando para cima.',
    type: 'looping',
  },
  {
    state: 'alert',
    icon: '\u{1F6A8}',
    label: 'Alert',
    description: 'Pelo eriçado, "!" no balão. Olhos amber, rabo reto.',
    type: 'one-shot',
  },
  {
    state: 'sleeping',
    icon: '\u{1F634}',
    label: 'Sleeping',
    description: 'Deitado em bolinha, "zzZ" flutuando. Respiração suave.',
    type: 'looping',
  },
  {
    state: 'happy',
    icon: '\u{1F638}',
    label: 'Happy',
    description: 'Sorrindo ^_^, corações flutuando. Ronronando, rabo rápido.',
    type: 'one-shot',
  },
];

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const;
const SIZE_OPTIONS = [1, 2, 3] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentState: CatState;
  onApplyAnimation: (state: CatState, loop: boolean) => void;
}

const CatAnimationPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentState,
  onApplyAnimation,
}) => {
  const [previewState, setPreviewState] = useState<CatState>(currentState);
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [previewSize, setPreviewSize] = useState<number>(2);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreviewState(currentState);
      setFadeOut(false);
    }
  }, [isOpen, currentState]);

  if (!isOpen && !fadeOut) return null;

  const handlePlay = (state: CatState) => {
    setPreviewState(state);
  };

  const handleApply = () => {
    setFadeOut(true);
    onApplyAnimation(previewState, loop);
    setTimeout(onClose, 200);
  };

  const handleReset = () => {
    setPreviewState('idle');
    setLoop(false);
    setSpeed(1);
  };

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(onClose, 200);
  };

  const sizeMap: Record<number, 'sm' | 'md' | 'lg'> = { 1: 'sm', 2: 'md', 3: 'lg' };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 transition-opacity duration-200 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-[460px] max-h-[85vh] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl flex flex-col overflow-hidden"
        style={{
          animationDuration: speed !== 1 ? `${1 / speed}` : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2.5">
          <span className="text-sm font-semibold text-zinc-200">
            {'\u{1F431}'} Cat Animation Previewer
          </span>
          <button
            onClick={handleClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* State info bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 text-xs text-zinc-400">
          <span>
            Estado atual: <span className="text-emerald-400 font-medium">{currentState}</span>
          </span>
          <span>
            Preview: <span className="text-amber-400 font-medium">{previewState}</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Live Preview Area */}
          <div className="px-4 pt-3 pb-2">
            <div
              className={`relative flex items-center justify-center rounded-lg border bg-zinc-950 ${
                showGrid
                  ? 'border-zinc-600 bg-[image:repeating-linear-gradient(0deg,transparent,transparent_19px,#333_19px,#333_20px),repeating-linear-gradient(90deg,transparent,transparent_19px,#333_19px,#333_20px)]'
                  : 'border-zinc-800'
              }`}
              style={{
                minHeight: 140,
                ['--cat-speed' as string]: speed,
              }}
            >
              <div
                style={{
                  transform: `scale(${previewSize})`,
                  transformOrigin: 'center center',
                  position: 'relative',
                }}
              >
                <CatMascot
                  state={previewState}
                  size="sm"
                  className="!static !pointer-events-none"
                />
              </div>
              {/* Speed indicator */}
              {speed !== 1 && (
                <span className="absolute top-2 right-2 text-[10px] text-zinc-600 font-mono">
                  {speed}x
                </span>
              )}
            </div>
          </div>

          {/* Animation List */}
          <div className="px-4 pb-2">
            <h4 className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1.5 font-medium">
              Animations
            </h4>
            <div className="space-y-1">
              {CAT_ANIMATIONS.map((anim) => (
                <div
                  key={anim.state}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                    previewState === anim.state
                      ? 'border-emerald-600/50 bg-emerald-900/15'
                      : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{anim.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-200">
                          {anim.label}
                        </span>
                        <span className="text-[9px] rounded bg-zinc-800 px-1 py-0.5 text-zinc-500 font-mono">
                          {anim.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {anim.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlay(anim.state)}
                    className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      previewState === anim.state
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {previewState === anim.state ? '\u25B6 Playing' : '\u25B6 Play'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 pb-3">
            <h4 className="text-[11px] text-zinc-500 uppercase tracking-wide mb-2 font-medium">
              Controls
            </h4>
            <div className="rounded-lg border border-zinc-800 p-3 space-y-3">
              {/* Speed */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1 block">
                  Speed
                </label>
                <div className="flex gap-1">
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                        speed === s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview size */}
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1 block">
                  Preview Size
                </label>
                <div className="flex gap-1">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPreviewSize(s)}
                      className={`rounded px-2.5 py-1 text-[11px] font-mono transition-colors ${
                        previewSize === s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  Loop (keep animation running)
                </label>
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  Overlay grid (see hitbox and positioning)
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={handleReset}
                  className="rounded px-3 py-1.5 text-[11px] text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  {'\u23F9'} Reset to idle
                </button>
                <button
                  onClick={handleApply}
                  className="rounded px-3 py-1.5 text-[11px] text-white bg-emerald-600 hover:bg-emerald-500 transition-colors font-medium"
                >
                  Close & apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatAnimationPreviewModal;
