import React from 'react';

interface SourceBadgeProps {
  index: string;
  title: string;
}

const INDEX_STYLES: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
  documentacoes: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  tickets: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5v2" />
        <path d="M15 11v2" />
        <path d="M15 17v2" />
        <path d="M5 5a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1 1 1 0 0 1 0 2 1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a1 1 0 0 0-1-1 1 1 0 0 1 0-2 1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H5z" />
      </svg>
    ),
  },
  sistemas: {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  solucoes: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8l2-2" />
        <path d="M6 18l2-2" />
        <path d="M8 8L6 6" />
        <path d="M18 18l-2-2" />
      </svg>
    ),
  },
};

const DEFAULT_STYLE = {
  bg: 'bg-zinc-500/15',
  text: 'text-zinc-400',
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const SourceBadge: React.FC<SourceBadgeProps> = ({ index, title }) => {
  const style = INDEX_STYLES[index] || DEFAULT_STYLE;
  const displayLabel = index.charAt(0).toUpperCase() + index.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium
        ${style.bg} ${style.text} cursor-default transition-opacity hover:opacity-80`}
      title={title}
    >
      {style.icon}
      <span className="max-w-[120px] truncate">{displayLabel}</span>
    </span>
  );
};

export default SourceBadge;
