import React from 'react';
import { useAppStore } from '@/stores/app-store';
import CaptureControls from './CaptureControls';
import { CatMascot } from '@/components/cat/CatMascot';

const ScreenViewer: React.FC = () => {
  const currentFrame = useAppStore((s) => s.currentFrame);
  const catState = useAppStore((s) => s.catState);
  const showCat = useAppStore((s) => s.catState) !== 'sleeping';

  return (
    <div className="relative w-full h-full bg-bg overflow-hidden">
      {/* Frame display */}
      {currentFrame ? (
        <img
          src={currentFrame}
          alt="Captura de tela"
          className="w-full h-full object-contain"
          draggable={false}
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
          {/* Placeholder icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="text-text-muted"
            >
              <rect
                x="4"
                y="8"
                width="32"
                height="22"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M14 34h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 30v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="20" cy="19" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M16 15l8 8M24 15l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-sm font-medium text-text-secondary">
              Nenhuma captura ativa
            </p>
            <p className="text-xs text-text-muted max-w-[240px]">
              Clique no botao de play ou em &quot;Capturar agora&quot; para comecar a
              visualizar a tela
            </p>
          </div>
        </div>
      )}

      {/* Cat mascot - bottom right */}
      <CatMascot state={catState} size="md" />

      {/* Capture controls - bottom center */}
      <CaptureControls />
    </div>
  );
};

export default ScreenViewer;
