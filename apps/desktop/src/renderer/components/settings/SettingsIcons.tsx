import React from 'react';

const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const icons: Record<string, React.ReactNode> = {
  settings: <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  users: <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  brain: <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  plug: <svg {...s}><path d="M12 2v6M8 2v6M16 2v6M4 10h16M6 10v4a6 6 0 0 0 12 0v-4M12 20v2"/></svg>,
  bell: <svg {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  shield: <svg {...s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  'credit-card': <svg {...s}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  lock: <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  'arrow-left': <svg {...s}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  'chevron-down': <svg {...s} width={14} height={14}><polyline points="6 9 12 15 18 9"/></svg>,
  'chevron-right': <svg {...s} width={14} height={14}><polyline points="9 18 15 12 9 6"/></svg>,
  check: <svg {...s} width={14} height={14} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg {...s} width={14} height={14}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  refresh: <svg {...s} width={14} height={14}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  pause: <svg {...s} width={14} height={14}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  play: <svg {...s} width={14} height={14}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  trash: <svg {...s} width={14} height={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  edit: <svg {...s} width={14} height={14}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye: <svg {...s} width={14} height={14}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  'eye-off': <svg {...s} width={14} height={14}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  test: <svg {...s} width={14} height={14}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  sync: <svg {...s} width={14} height={14}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  info: <svg {...s} width={14} height={14}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  'external-link': <svg {...s} width={12} height={12}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  plus: <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

// Platform logos (simplified monochrome SVGs)
export const PlatformLogo: React.FC<{ platform: string; size?: number; color?: string }> = ({ platform, size = 32, color }) => {
  const c = color ?? '#a1a1aa';
  if (platform === 'glpi') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="6" stroke={c} strokeWidth="2"/>
      <text x="20" y="26" textAnchor="middle" fill={c} fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">GLPI</text>
    </svg>
  );
  if (platform === 'zendesk') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M20 8L32 20H8L20 8Z" fill={c} opacity="0.3"/>
      <path d="M20 32L8 20H32L20 32Z" fill={c} opacity="0.6"/>
      <circle cx="20" cy="20" r="4" fill={c}/>
    </svg>
  );
  if (platform === 'freshdesk') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="8" y="8" width="24" height="24" rx="12" stroke={c} strokeWidth="2"/>
      <text x="20" y="25" textAnchor="middle" fill={c} fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">FD</text>
    </svg>
  );
  // otrs
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke={c} strokeWidth="2"/>
      <text x="20" y="25" textAnchor="middle" fill={c} fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">OTRS</text>
    </svg>
  );
};
