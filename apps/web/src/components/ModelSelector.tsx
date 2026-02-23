'use client';

import { useState, useRef, useEffect } from 'react';
import { ALL_MODELS, getModelsByTier } from '@teki/shared';
import type { AIModel } from '@teki/shared';

const providerColors: Record<string, string> = {
  gemini: '#4285F4',
  openai: '#10A37F',
  anthropic: '#D97757',
  ollama: '#a1a1aa',
};

const providerDot = (providerId: string) => (
  <span
    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
    style={{ backgroundColor: providerColors[providerId] ?? '#71717a' }}
  />
);

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  tier?: 'free' | 'starter' | 'pro';
}

export function ModelSelector({ value, onChange, tier = 'free' }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const available = getModelsByTier(tier);
  const current = ALL_MODELS.find((m) => m.id === value) ?? available[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const groups = [
    { label: 'Google', providerId: 'gemini' },
    { label: 'OpenAI', providerId: 'openai' },
    { label: 'Anthropic', providerId: 'anthropic' },
    { label: 'Local', providerId: 'ollama' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#18181b] border border-[#3f3f46] hover:border-[#2A8F9D]/50 transition-colors text-sm text-[#a1a1aa] hover:text-[#fafafa]"
      >
        {providerDot(current?.providerId ?? '')}
        <span className="max-w-[120px] truncate">{current?.name ?? 'Modelo'}</span>
        <svg viewBox="0 0 16 16" className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-72 rounded-xl bg-[#18181b] border border-[#3f3f46] shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="p-2 space-y-1">
            {groups.map((group) => {
              const models = available.filter((m) => m.providerId === group.providerId);
              if (models.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="px-2 py-1 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
                    {group.label}
                  </div>
                  {models.map((model) => (
                    <ModelOption
                      key={model.id}
                      model={model}
                      active={model.id === value}
                      onClick={() => { onChange(model.id); setOpen(false); }}
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {tier !== 'pro' && (
            <div className="border-t border-[#3f3f46] px-3 py-2 bg-[#0f0f12]">
              <p className="text-xs text-[#71717a]">
                Quer GPT-4o e Claude Sonnet?{' '}
                <a href="/register?plan=pro" className="text-[#2A8F9D] hover:underline">
                  Upgrade para Pro →
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModelOption({ model, active, onClick }: { model: AIModel; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 px-2 py-2 rounded-lg text-left transition-all ${
        active
          ? 'bg-[#2A8F9D]/10 border-l-2 border-[#2A8F9D] pl-[6px]'
          : 'hover:bg-[#27272a]'
      }`}
    >
      <span
        className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: providerColors[model.providerId] ?? '#71717a' }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-medium truncate ${active ? 'text-[#2A8F9D]' : 'text-[#fafafa]'}`}>
            {model.name}
          </span>
          {model.costTier === 'high' && (
            <span className="text-[9px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-1 py-0.5 rounded">
              PREMIUM
            </span>
          )}
          {model.capabilities.vision && (
            <span className="text-[9px] font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 px-1 py-0.5 rounded">
              VISÃO
            </span>
          )}
        </div>
        <p className="text-xs text-[#71717a] truncate">{model.description}</p>
      </div>
    </button>
  );
}
