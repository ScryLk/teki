import React from 'react';
import type { AISuggestion } from '@teki/shared';

interface SuggestionCardProps {
  suggestion: AISuggestion;
  onCopy: () => void;
}

const TYPE_CONFIG: Record<AISuggestion['type'], { label: string; color: string; icon: JSX.Element }> = {
  summary: {
    label: 'Resumo',
    color: '#3b82f6',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="17" y1="10" x2="3" y2="10" />
        <line x1="21" y1="6" x2="3" y2="6" />
        <line x1="21" y1="14" x2="3" y2="14" />
        <line x1="17" y1="18" x2="3" y2="18" />
      </svg>
    ),
  },
  action_item: {
    label: 'Ação',
    color: '#f59e0b',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  question: {
    label: 'Pergunta',
    color: '#a855f7',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  insight: {
    label: 'Insight',
    color: '#00d4ff',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onCopy }) => {
  const config = TYPE_CONFIG[suggestion.type];
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion.content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-lg border border-border bg-surface p-3 transition-all hover:border-accent/30"
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      {/* Type badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ color: config.color }}>{config.icon}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="h-1 w-8 rounded-full bg-bg overflow-hidden"
            title={`Confiança: ${Math.round(suggestion.confidence * 100)}%`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${suggestion.confidence * 100}%`,
                background: config.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-xs text-text-secondary leading-relaxed mb-2">
        {suggestion.content}
      </p>

      {/* Actions */}
      <button
        onClick={handleCopy}
        className="text-[10px] text-text-muted hover:text-accent transition-colors"
      >
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
};

export default SuggestionCard;
