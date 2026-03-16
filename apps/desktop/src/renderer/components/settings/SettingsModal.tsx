import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { ALL_MODELS } from '@teki/shared';
import type { AIModel, AiProviderId, ChannelInfo, OpenClawChannelId, ChannelConfig, ChannelAuthType } from '@teki/shared';
import { ApiKeyInput, AllApiKeys } from './ApiKeyInput';
import { ApiKeysTab } from './ApiKeysTab';
import { useOpenClaw } from '@/hooks/useOpenClaw';
import { StatusTab } from './StatusTab';

// ─── Provider metadata (for ModelSelect dots) ─────────────────────────────────

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  gemini:    { label: 'Google',         color: '#4285F4' },
  openai:    { label: 'OpenAI',         color: '#10A37F' },
  anthropic: { label: 'Anthropic',      color: '#D97706' },
  ollama:    { label: 'Local (Ollama)', color: '#7C3AED' },
};

// ─── OpenClaw data ───────────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { name: string; color: string }> = {
  whatsapp:  { name: 'WhatsApp',        color: '#25D366' },
  telegram:  { name: 'Telegram',        color: '#2AABEE' },
  discord:   { name: 'Discord',         color: '#5865F2' },
  slack:     { name: 'Slack',           color: '#E01E5A' },
  teams:     { name: 'Microsoft Teams', color: '#6264A7' },
  instagram: { name: 'Instagram',       color: '#E4405F' },
};

const MAX_CHANNELS = 6;

// Platform SVG icons
const PlatformIcon: React.FC<{ platform: string; size?: number }> = ({ platform, size = 22 }) => {
  const s = size;
  if (platform === 'whatsapp') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  if (platform === 'telegram') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99432,2a10,10,0,1,0,10,10A9.99917,9.99917,0,0,0,11.99432,2Zm3.17951,15.15247a.70547.70547,0,0,1-1.002.3515l-2.71467-2.10938L9.71484,17.002a.29969.29969,0,0,1-.285.03894l.334-2.98846.01069.00848.00683-.059s4.885-4.44751,5.084-4.637c.20147-.189.135-.23.135-.23.01147-.23053-.36152,0-.36152,0L8.16632,13.299l-2.69549-.918s-.414-.1485-.453-.475c-.041-.324.46649-.5.46649-.5l10.717-4.25751s.881-.39252.881.25751Z"/>
    </svg>
  );
  if (platform === 'discord') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
  if (platform === 'slack') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  );
  if (platform === 'teams') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.1376 9.05555C21.2935 9.05555 22.2306 8.11848 22.2306 6.96253C22.2306 5.80659 21.2935 4.86951 20.1376 4.86951C18.9816 4.86951 18.0446 5.80659 18.0446 6.96253C18.0446 8.11848 18.9816 9.05555 20.1376 9.05555Z"/>
      <path d="M19.0215 18.7972C19.1561 18.8142 19.2932 18.8229 19.4325 18.8229H19.4478C21.2416 18.8229 22.6957 17.3688 22.6957 15.575V10.8694C22.6957 10.3814 22.3001 9.98572 21.812 9.98572H19.2939C19.4364 10.2554 19.5149 10.5636 19.5096 10.8896V16.236C19.5291 17.144 19.3536 18.0111 19.0215 18.7972Z"/>
      <path d="M17.2096 17.9435C16.5785 17.3511 16.1842 16.5094 16.1841 15.5755V10.9857H17.5096V16.2588L17.5099 16.2704C17.5237 16.8614 17.416 17.4271 17.2096 17.9435Z"/>
      <path d="M13.9281 9.03159C15.4559 8.87992 16.6491 7.59093 16.6491 6.02326C16.6491 4.35356 15.2955 3 13.6258 3C11.9561 3 10.6025 4.35356 10.6025 6.02326C10.6025 6.08092 10.6042 6.1382 10.6073 6.19507H12.0755C13.0987 6.19507 13.9281 7.0245 13.9281 8.04762V9.03159Z"/>
      <path d="M11.9281 8.5252V8.19507H11.5226C11.6478 8.31634 11.7835 8.42688 11.9281 8.5252Z"/>
      <path d="M8.27593 16.4276C8.2753 16.3677 8.27568 16.3075 8.27708 16.2471V15.1759H8.75V10.6759H10.5V9.98572H11.9281V16.4276H8.27593Z"/>
      <path d="M8.695 18.4276H12.0755C13.0987 18.4276 13.9281 17.5982 13.9281 16.5751V9.98572H17.6571C18.1393 9.99765 18.5208 10.3979 18.5096 10.8801V16.2471C18.577 19.1412 16.2873 21.5428 13.3934 21.6136C11.2731 21.5617 9.47723 20.2588 8.695 18.4276Z"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0757 7.19507H3.54823C3.07739 7.19507 2.69568 7.57677 2.69568 8.04762V16.5751C2.69568 17.0459 3.07738 17.4276 3.54823 17.4276H12.0757C12.5465 17.4276 12.9282 17.0459 12.9282 16.5751V8.04762C12.9282 7.57677 12.5465 7.19507 12.0757 7.19507ZM5.5 10.6759H7.25V15.1759H8.25V10.6759H10V9.6759H5.5V10.6759Z"/>
    </svg>
  );
  // instagram
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
};

// ─── Tier badge ──────────────────────────────────────────────────────────────

const TierBadge: React.FC<{ tier: string }> = ({ tier }) => (
  <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded leading-none ${
    tier === 'free' ? 'bg-emerald-500/15 text-emerald-400'
    : tier === 'starter' ? 'bg-blue-500/15 text-blue-400'
    : 'bg-purple-500/15 text-purple-400'
  }`}>
    {tier === 'free' ? 'Free' : tier === 'starter' ? 'Starter' : 'Pro'}
  </span>
);

// ─── Custom Model Select ─────────────────────────────────────────────────────

const ModelSelect: React.FC<{ value: string; onChange: (id: string) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = ALL_MODELS.find((m) => m.id === value) ?? ALL_MODELS[0];
  const selProvider = PROVIDER_META[selected.providerId] ?? { label: selected.providerId, color: '#888' };

  const groups: { providerId: string; models: AIModel[] }[] = [];
  for (const model of ALL_MODELS) {
    let g = groups.find((x) => x.providerId === model.providerId);
    if (!g) { g = { providerId: model.providerId, models: [] }; groups.push(g); }
    g.models.push(model);
  }

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
          open ? 'border-accent bg-surface ring-1 ring-accent/30' : 'border-border bg-surface hover:border-accent/50'
        }`}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selProvider.color }} />
        <span className="flex-1 text-left text-text-primary font-medium">{selected.name}</span>
        <div className="flex items-center gap-1.5">
          {selected.capabilities.vision && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded leading-none bg-accent/15 text-accent">Visão</span>}
          <TierBadge tier={selected.tier} />
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-text-muted flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-10 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1.5">
            {groups.map(({ providerId, models }, gi) => {
              const p = PROVIDER_META[providerId] ?? { label: providerId, color: '#888' };
              return (
                <div key={providerId}>
                  {gi > 0 && <div className="mx-3 my-1 border-t border-border" />}
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{p.label}</span>
                  </div>
                  {models.map((m) => (
                    <button key={m.id} type="button" onClick={() => { onChange(m.id); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                        m.id === value ? 'bg-accent/10 text-text-primary' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}>
                      <span className="w-3.5 flex-shrink-0 flex justify-center">
                        {m.id === value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polyline points="20 6 9 17 4 12" /></svg>}
                      </span>
                      <span className="flex-1 text-left font-medium">{m.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {m.capabilities.vision && <span className="px-1.5 py-0.5 text-[10px] font-medium rounded leading-none bg-accent/15 text-accent">Visão</span>}
                        <TierBadge tier={m.tier} />
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── OpenClaw: Channel list view ─────────────────────────────────────────────

const ChannelListView: React.FC<{
  onAdd: () => void;
  onSettings: (id: string) => void;
  channels: Array<{ id: string; status: string; detail?: string; error?: string }>;
}> = ({ onAdd, onSettings, channels }) => {
  const connected = channels.filter((ch) => ch.status === 'connected');
  const used = connected.length;
  const empty = Math.max(0, MAX_CHANNELS - used);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Canais conectados</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-xs leading-relaxed">
            Conecte o Teki ao WhatsApp, Telegram, Discord, Slack, Teams ou Instagram.
          </p>
        </div>
        <span className="flex-shrink-0 ml-3 px-2.5 py-1 rounded-full text-xs font-semibold text-accent bg-accent/10">
          {used} / {MAX_CHANNELS}
        </span>
      </div>

      {/* Channel cards */}
      <div className="space-y-2.5">
        {connected.map((ch) => {
          const meta = CHANNEL_META[ch.id] ?? { name: ch.id, color: '#888' };
          return (
            <div key={ch.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18181b] border border-[#3f3f46]/50 hover:border-[#3f3f46] transition-colors"
              style={{ minHeight: 72 }}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: meta.color + '1a', border: `1px solid ${meta.color}4d` }}>
                  <span style={{ color: meta.color }}>
                    <PlatformIcon platform={ch.id} size={20} />
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#18181b]"
                  style={{ boxShadow: '0 0 0 2px #34d39933' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#fafafa]">{meta.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none">
                    Conectado
                  </span>
                </div>
                {ch.detail && <p className="text-xs text-[#71717a] mt-0.5">{ch.detail}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onSettings(ch.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors"
                  title="Configurar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add channel button */}
        {empty > 0 && (
          <button onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-dashed border-[#3f3f46]/40 text-[#71717a] hover:border-accent/40 hover:text-accent transition-colors group"
            style={{ minHeight: 72 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-sm font-medium">Adicionar canal</span>
          </button>
        )}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-xs text-[#71717a] leading-relaxed">
          Mensagens recebidas pelo OpenClaw consomem o limite do seu plano (2.000/mês). Cada canal usa o modelo configurado no agente vinculado.
        </p>
      </div>
    </div>
  );
};

// ─── OpenClaw: Add step 1 ────────────────────────────────────────────────────

const AddStep1View: React.FC<{
  onBack: () => void;
  onSelect: (platform: string) => void;
}> = ({ onBack, onSelect }) => {
  const platforms = ['whatsapp', 'telegram', 'discord', 'slack', 'teams', 'instagram'];
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </button>
      <h3 className="text-sm font-semibold text-[#fafafa] mb-1">Adicionar canal</h3>
      <p className="text-xs text-[#71717a] mb-5">Escolha a plataforma para conectar ao Teki.</p>

      <div className="grid grid-cols-3 gap-2.5">
        {platforms.map((p) => {
          const meta = CHANNEL_META[p];
          return (
            <button key={p} onClick={() => onSelect(p)}
              className="flex flex-col items-center justify-center gap-2 py-3.5 px-3 rounded-xl border transition-all group"
              style={{
                backgroundColor: meta.color + '0d',
                borderColor: meta.color + '33',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = meta.color + '1a';
                (e.currentTarget as HTMLButtonElement).style.borderColor = meta.color + '80';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = meta.color + '0d';
                (e.currentTarget as HTMLButtonElement).style.borderColor = meta.color + '33';
              }}
            >
              <span style={{ color: meta.color }}>
                <PlatformIcon platform={p} size={24} />
              </span>
              <span className="text-xs font-semibold text-[#fafafa]">{meta.name}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#71717a] mt-4 text-center">
        Cada canal precisa de uma conta ativa na plataforma escolhida.
      </p>
    </div>
  );
};

// ─── OpenClaw: Add step 2 (Connect) ──────────────────────────────────────────

const AUTH_TYPE_MAP: Record<string, ChannelAuthType> = {
  whatsapp: 'qrcode',
  telegram: 'bottoken',
  discord: 'bottoken',
  slack: 'oauth',
  teams: 'oauth',
  gemini: 'apikey',
  instagram: 'apikey',
};

const CONNECT_INSTRUCTIONS: Record<string, string[]> = {
  whatsapp: ['Abra o WhatsApp no celular', 'Toque em Configurações → Aparelhos conectados', 'Escaneie o QR code ao lado'],
  telegram: ['Abra @BotFather no Telegram', 'Crie um bot com /newbot', 'Cole o token abaixo'],
  discord: ['Acesse o Discord Developer Portal', 'Crie uma Application → Bot', 'Cole o bot token abaixo'],
  slack: ['Crie um Slack App em api.slack.com', 'Configure Bot Token Scopes e Signing Secret', 'Preencha os campos abaixo'],
  teams: ['Registre um bot no Azure Portal', 'Configure o App ID e senha', 'Preencha os campos abaixo'],
  gemini: ['Acesse Google AI Studio', 'Crie uma API key', 'Cole a chave abaixo'],
  instagram: ['Acesse Meta for Developers', 'Configure Instagram Graph API', 'Cole o token de acesso abaixo'],
};

const AddStep2View: React.FC<{
  platform: string;
  onBack: () => void;
  onConnect: (channelId: OpenClawChannelId, config: ChannelConfig) => void;
  getOAuthUrl: (channelId: OpenClawChannelId) => Promise<string | null>;
  channelStatus?: ChannelInfo;
}> = ({ platform, onBack, onConnect, getOAuthUrl, channelStatus }) => {
  const meta = CHANNEL_META[platform];
  const authType = AUTH_TYPE_MAP[platform] ?? 'bottoken';
  const instructions = CONNECT_INSTRUCTIONS[platform] ?? [];
  const [token, setToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [signingSecret, setSigningSecret] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const status = channelStatus?.status ?? 'idle';
  // QR data URL comes directly from the status event (generated in main process)
  const qrDataUrl = channelStatus?.qrDataUrl ?? null;

  const handleConnect = async () => {
    setConnecting(true);
    const config: ChannelConfig = { channelId: platform as OpenClawChannelId };
    if (authType === 'bottoken') config.botToken = token;
    if (authType === 'apikey') config.apiKey = apiKey;
    if (authType === 'oauth' && platform === 'slack') {
      config.botToken = token;
      config.signingSecret = signingSecret;
      config.appId = clientId;
    }
    if (authType === 'oauth' && platform === 'teams') {
      config.appId = clientId;
      config.appPassword = appPassword;
    }
    try {
      await onConnect(platform as OpenClawChannelId, config);
    } catch (err) {
      console.error('Connect error:', err);
    } finally {
      setConnecting(false);
    }
  };

  // Baileys automatically refreshes the QR code periodically;
  // a manual refresh re-triggers the connection to get a fresh QR.
  const refreshQR = () => handleConnect();

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </button>

      <div className="flex items-center gap-2 mb-5">
        <span style={{ color: meta.color }}><PlatformIcon platform={platform} size={18} /></span>
        <h3 className="text-sm font-semibold text-[#fafafa]">Conectar {meta.name}</h3>
      </div>

      <div className="flex gap-8">
        {/* Left side: QR or form */}
        {authType === 'qrcode' ? (
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-44 h-44 rounded-xl overflow-hidden flex items-center justify-center bg-white p-2">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#71717a] gap-2">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="3" height="3" /><rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
                  </svg>
                  <span className="text-[10px]">Clique conectar</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-[#71717a]">Escaneie com o {meta.name}</p>
              <button onClick={refreshQR} className="text-[#71717a] hover:text-accent transition-colors" title="Gerar novo código">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}

        {/* Right side: instructions + fields */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            {instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#3f3f46] text-[#fafafa] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-[#71717a]">{step}</p>
              </div>
            ))}
          </div>

          {/* Auth fields */}
          {authType === 'bottoken' && (
            <div>
              <label className="block text-[11px] text-[#71717a] mb-1">Bot Token</label>
              <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Cole o token do bot..."
                className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
            </div>
          )}

          {authType === 'apikey' && (
            <div>
              <label className="block text-[11px] text-[#71717a] mb-1">API Key</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Cole a chave de API..."
                className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
            </div>
          )}

          {authType === 'oauth' && platform === 'slack' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">Bot Token (xoxb-...)</label>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="xoxb-..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">Signing Secret</label>
                <input type="password" value={signingSecret} onChange={(e) => setSigningSecret(e.target.value)} placeholder="Signing secret..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">App ID</label>
                <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="App ID..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
          )}

          {authType === 'oauth' && platform === 'teams' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">App ID (Azure)</label>
                <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="App ID..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">App Password</label>
                <input type="password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} placeholder="App password..."
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
          )}

          {/* Connect button */}
          {authType !== 'qrcode' && (
            <button onClick={handleConnect} disabled={connecting}
              className="w-full py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50">
              {connecting ? 'Conectando...' : 'Conectar'}
            </button>
          )}
          {authType === 'qrcode' && !qrDataUrl && (
            <button onClick={handleConnect} disabled={connecting}
              className="w-full py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50">
              {connecting ? 'Gerando QR...' : 'Iniciar conexão'}
            </button>
          )}

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30">
            {status === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400">Conectado</span>
              </>
            ) : status === 'waiting' || status === 'reconnecting' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent animate-spin flex-shrink-0">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span className="text-xs text-[#71717a]">Aguardando conexão...</span>
              </>
            ) : status === 'error' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-red-400">{channelStatus?.error ?? 'Erro na conexão'}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#52525b]" />
                <span className="text-xs text-[#71717a]">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── OpenClaw: Channel settings ──────────────────────────────────────────────

const ChannelSettingsView: React.FC<{
  channelId: string;
  channel?: ChannelInfo;
  onBack: () => void;
  onDisconnect: (channelId: OpenClawChannelId) => void;
}> = ({ channelId, channel, onBack, onDisconnect }) => {
  const meta = CHANNEL_META[channelId] ?? { name: channelId, color: '#888' };
  const [welcome, setWelcome] = useState(channel?.config?.welcomeMessage ?? 'Olá! Sou o Teki, assistente de TI. Me envie uma foto do erro ou descreva o problema.');
  const [allDay, setAllDay] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const isConnected = channel?.status === 'connected';

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(channelId as OpenClawChannelId);
      onBack();
    } catch (err) {
      console.error('Disconnect error:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#fafafa] transition-colors mb-4 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 mb-5 flex-shrink-0">
        <span style={{ color: meta.color }}><PlatformIcon platform={channelId} size={18} /></span>
        <h3 className="text-sm font-semibold text-[#fafafa]">{meta.name}</h3>
        {isConnected && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none">
            Conectado
          </span>
        )}
        {channel?.status === 'error' && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-red-500/30 bg-red-500/10 text-red-400 leading-none">
            Erro
          </span>
        )}
      </div>

      {channel?.error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {channel.error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        <FormField label="Agente vinculado">
          <SimpleSelect value="Suporte Geral" />
        </FormField>

        <FormField label="Modelo de IA" hint="Substitui o modelo do agente quando configurado">
          <SimpleSelect value="Padrão do agente (Gemini Flash)" />
        </FormField>

        <FormField label="Mensagem de boas-vindas" hint="Enviada automaticamente na primeira mensagem de cada conversa">
          <textarea
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#71717a] resize-none focus:outline-none focus:border-accent transition-colors"
          />
        </FormField>

        <FormField label="Horário de atendimento" hint="Fora deste horário, o Teki envia mensagem de ausência">
          <div className="flex items-center gap-2">
            <input type="time" defaultValue="08:00"
              className="px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
            <span className="text-xs text-[#71717a]">até</span>
            <input type="time" defaultValue="18:00"
              className="px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex items-center justify-between mt-2.5 px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50">
            <span className="text-xs text-[#71717a]">Responder 24h (ignorar horário)</span>
            <button type="button" onClick={() => setAllDay((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${allDay ? 'bg-accent' : 'bg-[#3f3f46]'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${allDay ? 'left-4' : 'left-0.5'}`} />
            </button>
          </div>
        </FormField>

        {/* Danger */}
        <div className="pt-3 border-t border-[#3f3f46]/30">
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:underline transition-colors disabled:opacity-50">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            {disconnecting ? 'Desconectando...' : `Desconectar ${meta.name}`}
          </button>
          <p className="text-[11px] text-[#71717a] mt-1 ml-5">O canal será removido e o slot ficará disponível.</p>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-[#3f3f46]/30 flex-shrink-0 mt-3">
        <button className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
          Salvar
        </button>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] text-[#71717a] mb-1">{label}</label>
    {hint && <p className="text-[11px] text-[#71717a]/70 mb-1.5">{hint}</p>}
    {children}
  </div>
);

const SimpleSelect: React.FC<{ value: string }> = ({ value }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] cursor-pointer hover:border-[#3f3f46] transition-colors">
    <span>{value}</span>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a]">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);

// ─── Account Tab ─────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  FREE: { label: 'Free', color: '#71717a' },
  STARTER: { label: 'Starter', color: '#2A8F9D' },
  PRO: { label: 'Pro', color: '#8b5cf6' },
  BUSINESS: { label: 'Business', color: '#f59e0b' },
  ENTERPRISE: { label: 'Enterprise', color: '#ef4444' },
};

const AccountTab: React.FC = () => {
  const [editingProfile, setEditingProfile] = useState(false);
  const storedName = useAppStore((s) => s.userName);
  const storedEmail = useAppStore((s) => s.userEmail);
  const userPlan = useAppStore((s) => s.userPlan);
  const [name, setName] = useState(storedName ?? '');
  const [email, setEmail] = useState(storedEmail ?? '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-0">

      {/* ── Profile ── */}
      <div className="pb-5">
        {!editingProfile ? (
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => setEditingProfile(true)}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white select-none"
                style={{ background: 'linear-gradient(135deg, #2A8F9D, #1E6B75)' }}>
                {initials}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-[#fafafa] leading-tight">{name}</p>
                {userPlan && (() => {
                  const info = PLAN_LABELS[userPlan] ?? { label: userPlan, color: '#71717a' };
                  return (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}
                    >
                      {info.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[13px] text-[#71717a] mt-0.5">{email}</p>
            </div>
            {/* Edit btn */}
            <button onClick={() => setEditingProfile(true)}
              className="flex-shrink-0 px-4 py-1.5 rounded-lg border border-[#3f3f46]/50 text-[13px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
              Editar perfil
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            {/* Avatar editable */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2A8F9D, #1E6B75)' }}>
                {initials}
              </div>
              <button className="text-[10px] text-[#71717a] hover:text-[#2A8F9D] flex items-center gap-1 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                Alterar foto
              </button>
            </div>
            {/* Fields */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">Nome</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#2A8F9D] transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] text-[#71717a] mb-1">Email</label>
                <div className="relative">
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 pr-8 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-[13px] text-[#fafafa] focus:outline-none focus:border-[#2A8F9D] transition-colors" />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={() => setEditingProfile(false)}
                  className="px-4 py-1.5 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
                  Cancelar
                </button>
                <button onClick={() => setEditingProfile(false)}
                  className="px-4 py-1.5 rounded-lg bg-[#2A8F9D] text-[12px] text-white hover:bg-[#238490] transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#3f3f46]/30 my-1" />

      {/* ── Sessão ── */}
      <div className="py-5">
        <p className="text-[14px] font-bold text-[#fafafa] mb-3">Sessão</p>
        <div className="flex items-center gap-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a] flex-shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] text-[#fafafa]">Sair da conta</span>
            <span className="text-[12px] text-[#71717a] mx-2">·</span>
            <span className="text-[12px] text-[#71717a]">Encerrar sessão neste dispositivo</span>
          </div>
          <button
            disabled={loggingOut}
            onClick={async () => {
              setLoggingOut(true);
              try {
                await window.tekiAPI?.logout();
                clearAuth();
                setSettingsOpen(false);
              } finally {
                setLoggingOut(false);
              }
            }}
            className="flex-shrink-0 px-3 py-1 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors disabled:opacity-50"
          >
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </div>

      <div className="border-t border-[#3f3f46]/30 my-1" />

      {/* ── Danger ── */}
      <div className="py-5 space-y-1">
        <p className="text-[14px] font-bold mb-3" style={{ color: 'rgba(239,68,68,0.8)' }}>Zona de perigo</p>
        <div className="flex items-center gap-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a] flex-shrink-0">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] text-[#fafafa]">Exportar dados</span>
            <span className="text-[12px] text-[#71717a] mx-2">·</span>
            <span className="text-[12px] text-[#71717a]">Conversas, agentes e configurações em JSON</span>
          </div>
          <button className="flex-shrink-0 px-3 py-1 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">Exportar</button>
        </div>

        {!showDeleteConfirm ? (
          <div className="flex items-center gap-3 py-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ color: 'rgba(239,68,68,0.6)' }}>
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] text-red-400">Excluir conta</span>
              <span className="text-[12px] mx-2" style={{ color: 'rgba(239,68,68,0.5)' }}>·</span>
              <span className="text-[12px]" style={{ color: 'rgba(239,68,68,0.5)' }}>Todos os dados serão removidos permanentemente</span>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-shrink-0 px-3 py-1 rounded-lg border text-[12px] transition-colors"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}>
              Excluir
            </button>
          </div>
        ) : (
          <div className="mt-3 p-4 rounded-lg border" style={{ borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' }}>
            <p className="text-[13px] text-red-400 font-semibold mb-2">Tem certeza?</p>
            <p className="text-[12px] text-[#a1a1aa] mb-3">
              Esta ação é irreversível. Todos os seus dados, conversas e configurações serão removidos permanentemente.
              Digite <span className="font-mono text-red-400">EXCLUIR</span> para confirmar.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="w-full px-3 py-1.5 rounded-md bg-[#18181b] border border-[#3f3f46]/50 text-[13px] text-[#fafafa] placeholder-[#52525b] mb-3 focus:outline-none focus:border-red-500/50"
            />
            {deleteError && (
              <p className="text-[12px] text-red-400 mb-2">{deleteError}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                disabled={deleteConfirmText !== 'EXCLUIR' || deleting}
                onClick={async () => {
                  setDeleting(true);
                  setDeleteError(null);
                  try {
                    const result = await window.tekiAPI?.deleteAccount();
                    if (result?.success) {
                      clearAuth();
                      setSettingsOpen(false);
                    } else {
                      setDeleteError(result?.error ?? 'Erro ao excluir conta');
                    }
                  } catch {
                    setDeleteError('Erro de conexão');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40"
                style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff' }}
              >
                {deleting ? 'Excluindo...' : 'Excluir minha conta'}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(null); }}
                className="px-3 py-1.5 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

// ─── Knowledge Base Tab ──────────────────────────────────────────────────────

type DocStatus = 'indexed' | 'indexing' | 'error';
type KBDocType = 'pdf' | 'md' | 'txt' | 'docx';

interface KBDoc {
  id: string;
  name: string;
  type: KBDocType;
  size: string;
  status: DocStatus;
  progress?: number;
  indexedAt?: string;
  chunks?: number;
  words?: number;
}

const KB_TOTAL_MB = 25;

function DocTypeIcon({ type }: { type: KBDoc['type'] }) {
  const cfg = {
    pdf:  { color: '#EF4444', label: 'PDF' },
    md:   { color: '#3B82F6', label: 'MD'  },
    txt:  { color: '#F59E0B', label: 'TXT' },
    docx: { color: '#6366F1', label: 'DOC' },
  }[type];
  return (
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
      style={{ backgroundColor: cfg.color + '1a', color: cfg.color, border: `1px solid ${cfg.color}33` }}>
      {cfg.label}
    </div>
  );
}

function DocStatusBadge({ status }: { status: DocStatus }) {
  if (status === 'indexed') return (
    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
      Indexado
    </span>
  );
  if (status === 'indexing') return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-amber-500/30 bg-amber-500/10 text-amber-400">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      Indexando
    </span>
  );
  return (
    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded leading-none border border-red-500/30 bg-red-500/10 text-red-400">
      Erro
    </span>
  );
}

function mapKBDoc(doc: { id: string; name: string; type: string; sizeBytes: number; status: string; chunksCount: number; wordsCount: number; createdAt: string; indexedAt?: string }): KBDoc {
  const sizeStr = doc.sizeBytes >= 1024 * 1024
    ? `${(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(doc.sizeBytes / 1024)} KB`;
  return {
    id: doc.id,
    name: doc.name,
    type: doc.type as KBDocType,
    size: sizeStr,
    status: doc.status === 'processing' ? 'indexing' : doc.status as DocStatus,
    indexedAt: doc.indexedAt,
    chunks: doc.chunksCount,
    words: doc.wordsCount,
  };
}

const KnowledgeBaseTab: React.FC = () => {
  const [docs, setDocs] = useState<KBDoc[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState('');
  const [detailDoc, setDetailDoc] = useState<KBDoc | null>(null);
  const [docChunks, setDocChunks] = useState<Array<{ chunkIndex: number; content: string; wordCount: number }>>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [usedMB, setUsedMB] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedPct = Math.round((usedMB / KB_TOTAL_MB) * 100);

  // Load docs on mount
  useEffect(() => {
    window.tekiAPI.kbListDocs().then((list) => {
      setDocs(list.map(mapKBDoc));
    });
    window.tekiAPI.kbGetStats().then((stats) => {
      setUsedMB(+(stats.totalSizeBytes / (1024 * 1024)).toFixed(1));
    });
  }, []);

  // Listen for doc status updates from main process
  useEffect(() => {
    return window.tekiAPI.onKbDocStatus((event) => {
      setDocs((prev) =>
        prev.map((d) => {
          if (d.id !== event.docId) return d;
          const status: DocStatus = event.status === 'processing' ? 'indexing' : event.status;
          return {
            ...d,
            status,
            chunks: event.chunksCount ?? d.chunks,
            words: event.wordsCount ?? d.words,
          };
        }),
      );
      // Refresh stats
      window.tekiAPI.kbGetStats().then((stats) => {
        setUsedMB(+(stats.totalSizeBytes / (1024 * 1024)).toFixed(1));
      });
    });
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadName(file.name);
    setUploading(true);
    setUploadProgress(30);

    try {
      const buffer = await file.arrayBuffer();
      setUploadProgress(60);
      const doc = await window.tekiAPI.kbUploadDoc({ name: file.name, buffer });
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setDocs((prev) => [mapKBDoc(doc), ...prev]);
      }, 300);
    } catch (err) {
      console.error('[KB] Upload failed:', err);
      setUploading(false);
    }
  };

  const removeDoc = async (id: string) => {
    await window.tekiAPI.kbRemoveDoc(id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setMenuOpen(null);
    if (detailDoc?.id === id) setDetailDoc(null);
    window.tekiAPI.kbGetStats().then((stats) => {
      setUsedMB(+(stats.totalSizeBytes / (1024 * 1024)).toFixed(1));
    });
  };

  // Load chunks when detail doc is selected
  useEffect(() => {
    if (!detailDoc) { setDocChunks([]); return; }
    setChunksLoading(true);
    window.tekiAPI.kbGetDocChunks(detailDoc.id).then((chunks) => {
      setDocChunks(chunks);
      setChunksLoading(false);
    }).catch(() => setChunksLoading(false));
  }, [detailDoc?.id]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const h = () => setMenuOpen(null);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  if (docs.length === 0 && !uploading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-[#fafafa] mb-1">Base de conhecimento vazia</h3>
        <p className="text-xs text-[#71717a] mb-5 max-w-xs leading-relaxed">
          Envie documentos (PDF, MD, TXT, DOCX) para que o Teki possa usá-los como referência nas respostas.
        </p>
        <button onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-[#238490] transition-colors">
          Enviar primeiro documento
        </button>
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.md,.txt,.docx"
          onChange={(e) => handleFiles(e.target.files)} />
      </div>
    );
  }

  return (
    <>
    {/* Header — always full width */}
    <div className="flex items-start justify-between mb-3 flex-shrink-0">
      <div>
        <h3 className="text-sm font-semibold text-[#fafafa]">Base de Conhecimento</h3>
        <p className="text-xs text-[#71717a] mt-0.5">Documentos indexados para uso nas respostas</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18181b] border border-[#3f3f46]/50 text-xs text-[#71717a]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <span>{usedMB} / {KB_TOTAL_MB} MB</span>
          <div className="w-10 h-1 rounded-full bg-[#3f3f46] overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${usedPct}%` }} />
          </div>
        </div>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-[#238490] transition-colors">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Enviar
        </button>
      </div>
    </div>

    <div className="flex flex-1 min-h-0 gap-0">
      {/* Main column */}
      <div className={`flex flex-col min-w-0 transition-all duration-200 ${detailDoc ? 'w-[54%] pr-5' : 'w-full'}`}>

        {/* Upload in progress */}
        {uploading && (
          <div className="mb-2.5 px-4 py-3 rounded-xl bg-[#18181b] border border-accent/30 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent animate-spin flex-shrink-0">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span className="text-xs text-[#fafafa] font-medium truncate">{uploadName}</span>
              </div>
              <span className="text-xs text-accent font-semibold ml-2">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#3f3f46] overflow-hidden">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-[10px] text-[#71717a] mt-1">Processando e indexando documento...</p>
          </div>
        )}

        {/* Drop zone */}
        <div
          className={`mb-2.5 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 py-3 transition-colors cursor-pointer flex-shrink-0 ${
            isDragOver ? 'border-accent bg-accent/5 text-accent' : 'border-[#3f3f46]/40 text-[#71717a] hover:border-accent/40 hover:text-accent'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
          </svg>
          <span className="text-xs font-medium">
            {isDragOver ? 'Solte o arquivo aqui' : 'Arraste ou clique · PDF, MD, TXT, DOCX'}
          </span>
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.md,.txt,.docx"
          onChange={(e) => handleFiles(e.target.files)} />

        {/* Doc list */}
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {docs.map((doc) => (
            <div key={doc.id}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#18181b] border transition-colors cursor-pointer ${
                detailDoc?.id === doc.id ? 'border-accent/40 bg-accent/5' : 'border-[#3f3f46]/50 hover:border-[#3f3f46]'
              }`}
              onClick={() => setDetailDoc(detailDoc?.id === doc.id ? null : doc)}>
              <DocTypeIcon type={doc.type} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-medium text-[#fafafa] truncate block">{doc.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#71717a]">{doc.size}</span>
                  <span className="text-[11px] text-[#52525b]">·</span>
                  <DocStatusBadge status={doc.status} />
                </div>
                {doc.status === 'indexing' && typeof doc.progress === 'number' && (
                  <div className="mt-1.5 w-full h-1 rounded-full bg-[#3f3f46] overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${doc.progress}%` }} />
                  </div>
                )}
              </div>
              <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setMenuOpen(menuOpen === doc.id ? null : doc.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
                {menuOpen === doc.id && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-[#1c1c1e] border border-[#3f3f46]/60 rounded-lg shadow-xl py-1 w-36">
                    <button onClick={() => { setDetailDoc(doc); setMenuOpen(null); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 transition-colors text-left">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      Ver detalhes
                    </button>
                    <button onClick={() => removeDoc(doc.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info bar */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30 mt-2.5 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-[11px] text-[#71717a] leading-relaxed">
            Documentos ficam disponíveis para todos os agentes. Máx. {KB_TOTAL_MB} MB.
          </p>
        </div>
      </div>

      {/* Detail panel */}
      {detailDoc && (
        <div className="w-[46%] border-l border-[#3f3f46]/50 pl-5 flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h4 className="text-[11px] font-semibold text-[#fafafa] uppercase tracking-wider">Detalhes</h4>
            <button onClick={() => setDetailDoc(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3f3f46]/30 flex-shrink-0">
            <DocTypeIcon type={detailDoc.type} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#fafafa] truncate">{detailDoc.name}</p>
              <div className="mt-0.5"><DocStatusBadge status={detailDoc.status} /></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0">
            {[
              { label: 'Tamanho', value: detailDoc.size },
              { label: 'Status', value: detailDoc.status === 'indexed' ? 'Indexado' : detailDoc.status === 'indexing' ? 'Indexando...' : 'Erro' },
              { label: 'Indexado em', value: detailDoc.indexedAt ?? '—' },
              { label: 'Chunks', value: detailDoc.chunks != null ? String(detailDoc.chunks) : '—' },
              { label: 'Palavras', value: detailDoc.words != null ? detailDoc.words.toLocaleString('pt-BR') : '—' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#3f3f46]/20">
                <span className="text-[11px] text-[#71717a]">{row.label}</span>
                <span className="text-[12px] text-[#fafafa] font-medium">{row.value}</span>
              </div>
            ))}

            {/* Chunks / Pontos analisados */}
            <div className="mt-3">
              <h5 className="text-[11px] font-semibold text-[#fafafa] uppercase tracking-wider mb-2">
                Trechos analisados
              </h5>
              {chunksLoading ? (
                <div className="flex items-center gap-2 py-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  <span className="text-[11px] text-[#71717a]">Carregando trechos...</span>
                </div>
              ) : docChunks.length === 0 ? (
                <p className="text-[11px] text-[#52525b] py-2">Nenhum trecho disponível.</p>
              ) : (
                <div className="space-y-2">
                  {docChunks.map((chunk) => (
                    <div key={chunk.chunkIndex} className="rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30 p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-accent">
                          Trecho {chunk.chunkIndex + 1}
                        </span>
                        <span className="text-[10px] text-[#52525b]">
                          {chunk.wordCount} palavras
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a1a1aa] leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 flex-shrink-0">
            <button onClick={() => removeDoc(detailDoc.id)}
              className="w-full py-2 rounded-lg border text-xs font-medium transition-colors"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}>
              Remover documento
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// ─── Hotkey Row ──────────────────────────────────────────────────────────────

const HotkeyRow: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
    <span className="text-sm text-[#e4e4e7]">{description}</span>
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={key}>
          {i > 0 && <span className="text-[10px] text-[#52525b] mx-0.5">+</span>}
          <kbd className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded-md
                          bg-[#27272a] border border-[#3f3f46] text-[11px] font-medium text-[#a1a1aa]
                          shadow-[0_1px_0_1px_#18181b] font-mono">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = 'ia' | 'openclaw' | 'kb' | 'conta' | 'apikeys' | 'status' | 'geral' | 'atalhos';
type OpenClawView =
  | { type: 'list' }
  | { type: 'add-step1' }
  | { type: 'add-step2'; platform: string }
  | { type: 'channel-settings'; channelId: string };

// ─── Main Component ──────────────────────────────────────────────────────────

const SettingsModal: React.FC = () => {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);

  const [activeTab, setActiveTab] = useState<Tab>('ia');
  const [ocView, setOcView] = useState<OpenClawView>({ type: 'list' });
  const [visible, setVisible] = useState(false);

  const { channels, connect, disconnect, getOAuthUrl } = useOpenClaw();

  const currentModel = ALL_MODELS.find((m) => m.id === selectedModel) ?? ALL_MODELS[0];
  const activeProvider = currentModel.providerId as AiProviderId;

  useEffect(() => {
    if (settingsOpen) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [settingsOpen]);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setSettingsOpen(false), 150);
  }, [setSettingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [settingsOpen, close]);

  // Reset OC view when switching away
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'openclaw') setOcView({ type: 'list' });
  };

  if (!settingsOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className={`bg-[#111113] border border-[#3f3f46]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
        }`}
        style={{ width: 780, height: 520 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3f3f46]/50 flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#fafafa]">Configurações</h2>
          <button onClick={close}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-48 flex-shrink-0 border-r border-[#3f3f46]/50 py-3 px-2 space-y-0.5">
            <SidebarTab active={activeTab === 'ia'} onClick={() => handleTabChange('ia')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>}
              label="Modelo" />
            <SidebarTab active={activeTab === 'openclaw'} onClick={() => handleTabChange('openclaw')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c0-3-2.5-5-2.5-8a2.5 2.5 0 0 1 5 0c0 3-2.5 5-2.5 8"/><path d="M6.5 17c1.5-2 1-5 1-7.5a2 2 0 0 1 4 0"/><path d="M17.5 17c-1.5-2-1-5-1-7.5a2 2 0 0 0-4 0"/><path d="M4 14c1-1.5.5-4 .5-6a1.5 1.5 0 0 1 3 0"/><path d="M20 14c-1-1.5-.5-4-.5-6a1.5 1.5 0 0 0-3 0"/></svg>}
              label="OpenClaw" />
            <SidebarTab active={activeTab === 'kb'} onClick={() => handleTabChange('kb')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
              label="Conhecimento" />
            <SidebarTab active={activeTab === 'conta'} onClick={() => handleTabChange('conta')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="Conta" />
            <SidebarTab active={activeTab === 'apikeys'} onClick={() => handleTabChange('apikeys')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>}
              label="API Keys" />
            <SidebarTab active={activeTab === 'status'} onClick={() => handleTabChange('status')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              label="Status" />
            <SidebarTab active={activeTab === 'atalhos'} onClick={() => handleTabChange('atalhos')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/></svg>}
              label="Atalhos" />
          </nav>

          {/* Content */}
          <div className={`flex-1 p-7 ${activeTab === 'kb' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>

            {/* ── IA tab ── */}
            {activeTab === 'ia' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">Modelo de IA</label>
                  <p className="text-xs text-[#71717a] mb-3">Modelo usado em todas as conversas. Modelos com visão analisam screenshots.</p>
                  <ModelSelect value={selectedModel} onChange={setSelectedModel} />
                  <p className="text-xs text-[#71717a] mt-2">{currentModel.description}</p>
                </div>
                <div className="border-t border-[#3f3f46]/30 pt-5">
                  <AllApiKeys />
                </div>
              </div>
            )}

            {/* ── OpenClaw tab ── */}
            {activeTab === 'openclaw' && (
              <>
                {ocView.type === 'list' && (
                  <ChannelListView
                    onAdd={() => setOcView({ type: 'add-step1' })}
                    onSettings={(id) => setOcView({ type: 'channel-settings', channelId: id })}
                    channels={channels}
                  />
                )}
                {ocView.type === 'add-step1' && (
                  <AddStep1View
                    onBack={() => setOcView({ type: 'list' })}
                    onSelect={(p) => setOcView({ type: 'add-step2', platform: p })}
                  />
                )}
                {ocView.type === 'add-step2' && (
                  <AddStep2View
                    platform={ocView.platform}
                    onBack={() => setOcView({ type: 'add-step1' })}
                    onConnect={connect}
                    getOAuthUrl={getOAuthUrl}
                    channelStatus={channels.find((c) => c.id === ocView.platform)}
                  />
                )}
                {ocView.type === 'channel-settings' && (
                  <ChannelSettingsView
                    channelId={ocView.channelId}
                    channel={channels.find((c) => c.id === ocView.channelId)}
                    onBack={() => setOcView({ type: 'list' })}
                    onDisconnect={disconnect}
                  />
                )}
              </>
            )}

            {/* ── KB tab ── */}
            {activeTab === 'kb' && <KnowledgeBaseTab />}

            {/* ── Conta tab ── */}
            {activeTab === 'conta' && (
              <AccountTab />
            )}

            {/* ── API Keys tab ── */}
            {activeTab === 'apikeys' && <ApiKeysTab />}

            {/* ── Status tab ── */}
            {activeTab === 'status' && <StatusTab />}

            {/* ── Atalhos tab ── */}
            {activeTab === 'atalhos' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-1">Atalhos de Teclado</label>
                  <p className="text-xs text-[#71717a] mb-4">Atalhos globais disponíveis em qualquer lugar do sistema.</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">Overlay Flutuante</h3>
                  <HotkeyRow keys={['Ctrl', 'Space']} description="Mostrar / ocultar overlay" />
                  <HotkeyRow keys={['Ctrl', 'D']} description="Push-to-talk (abre e inicia gravação)" />
                  <HotkeyRow keys={['Enter']} description="Enviar mensagem no overlay" />
                  <HotkeyRow keys={['Esc']} description="Fechar overlay" />
                </div>

                <div className="border-t border-[#3f3f46]/30 pt-4 space-y-1">
                  <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">Chat</h3>
                  <HotkeyRow keys={['Enter']} description="Enviar mensagem" />
                  <HotkeyRow keys={['Shift', 'Enter']} description="Nova linha" />
                </div>

                <div className="border-t border-[#3f3f46]/30 pt-4 space-y-1">
                  <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-2">Geral</h3>
                  <HotkeyRow keys={['Esc']} description="Fechar modal / painel" />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar Tab ─────────────────────────────────────────────────────────────

const SidebarTab: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left relative ${
      active
        ? 'bg-accent/5 text-accent font-medium border-l-2 border-accent pl-[10px]'
        : 'text-[#a1a1aa] hover:bg-white/5 hover:text-[#fafafa]'
    }`}>
    <span className="flex-shrink-0">{icon}</span>
    <span>{label}</span>
  </button>
);

export default SettingsModal;
