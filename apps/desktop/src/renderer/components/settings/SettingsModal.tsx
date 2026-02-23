import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { ALL_MODELS } from '@teki/shared';
import type { AIModel, AiProviderId } from '@teki/shared';
import { ApiKeyInput, AllApiKeys } from './ApiKeyInput';

// ─── Provider metadata (for ModelSelect dots) ─────────────────────────────────

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  gemini:    { label: 'Google',         color: '#4285F4' },
  openai:    { label: 'OpenAI',         color: '#10A37F' },
  anthropic: { label: 'Anthropic',      color: '#D97706' },
  ollama:    { label: 'Local (Ollama)', color: '#7C3AED' },
};

// ─── OpenClaw data ───────────────────────────────────────────────────────────

const CHANNEL_META: Record<string, { name: string; color: string }> = {
  whatsapp: { name: 'WhatsApp', color: '#25D366' },
  telegram: { name: 'Telegram', color: '#2AABEE' },
  discord:  { name: 'Discord',  color: '#5865F2' },
  slack:    { name: 'Slack',    color: '#E01E5A' },
};

interface Channel {
  id: string;
  platform: string;
  detail: string;
  agent: string;
}

const DEMO_CHANNELS: Channel[] = [
  { id: '1', platform: 'whatsapp', detail: '+55 51 9999-8888', agent: 'Suporte Geral' },
  { id: '2', platform: 'discord',  detail: 'Servidor: TechCorp IT', agent: 'Suporte Rede' },
];

const MAX_CHANNELS = 3;

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
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
  if (platform === 'discord') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
  // slack
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
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
}> = ({ onAdd, onSettings }) => {
  const used = DEMO_CHANNELS.length;
  const empty = MAX_CHANNELS - used;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Canais conectados</h3>
          <p className="text-xs text-[#71717a] mt-1 max-w-xs leading-relaxed">
            Conecte o Teki ao WhatsApp, Telegram, Discord ou Slack. Seus técnicos podem enviar fotos de erros e receber diagnósticos direto no celular.
          </p>
        </div>
        <span className="flex-shrink-0 ml-3 px-2.5 py-1 rounded-full text-xs font-semibold text-accent bg-accent/10">
          {used} / {MAX_CHANNELS}
        </span>
      </div>

      {/* Channel cards */}
      <div className="space-y-2.5">
        {DEMO_CHANNELS.map((ch) => {
          const meta = CHANNEL_META[ch.platform];
          return (
            <div key={ch.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18181b] border border-[#3f3f46]/50 hover:border-[#3f3f46] transition-colors"
              style={{ minHeight: 72 }}>
              {/* Icon circle */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: meta.color + '1a', border: `1px solid ${meta.color}4d` }}>
                  <span style={{ color: meta.color }}>
                    <PlatformIcon platform={ch.platform} size={20} />
                  </span>
                </div>
                {/* Connected dot with pulse */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#18181b]"
                  style={{ boxShadow: '0 0 0 2px #34d39933' }} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#fafafa]">{meta.name}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-[#71717a] mt-0.5">{ch.detail}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="text-xs text-[#71717a]">Agente: {ch.agent}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => onSettings(ch.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors"
                  title="Configurar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#71717a] hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Desconectar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: empty }).map((_, i) => (
          <button key={i} onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-dashed border-[#3f3f46]/40 text-[#71717a] hover:border-accent/40 hover:text-accent transition-colors group"
            style={{ minHeight: 72 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-sm font-medium">Adicionar canal</span>
          </button>
        ))}
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
  const platforms = ['whatsapp', 'telegram', 'discord', 'slack'];
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

      <div className="grid grid-cols-2 gap-3">
        {platforms.map((p) => {
          const meta = CHANNEL_META[p];
          return (
            <button key={p} onClick={() => onSelect(p)}
              className="flex flex-col items-center justify-center gap-2.5 py-5 px-4 rounded-xl border transition-all group"
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
                <PlatformIcon platform={p} size={28} />
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

// ─── OpenClaw: Add step 2 (QR) ───────────────────────────────────────────────

const QRCodePlaceholder: React.FC = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="160" fill="white" />
    {/* Top-left finder */}
    <rect x="10" y="10" width="40" height="40" fill="#111" rx="4" />
    <rect x="16" y="16" width="28" height="28" fill="white" rx="2" />
    <rect x="20" y="20" width="20" height="20" fill="#111" rx="1" />
    {/* Top-right finder */}
    <rect x="110" y="10" width="40" height="40" fill="#111" rx="4" />
    <rect x="116" y="16" width="28" height="28" fill="white" rx="2" />
    <rect x="120" y="20" width="20" height="20" fill="#111" rx="1" />
    {/* Bottom-left finder */}
    <rect x="10" y="110" width="40" height="40" fill="#111" rx="4" />
    <rect x="16" y="116" width="28" height="28" fill="white" rx="2" />
    <rect x="20" y="120" width="20" height="20" fill="#111" rx="1" />
    {/* Data modules (decorative) */}
    {[60,70,80,90,100].map((x) => [60,70,80,90,100].map((y) =>
      (x + y) % 20 === 0 ? <rect key={`${x}-${y}`} x={x} y={y} width="8" height="8" fill="#111" rx="1" /> : null
    ))}
    {[60,75,90,105].map((x) => [10,25,40].map((y) =>
      <rect key={`d-${x}-${y}`} x={x} y={y} width="8" height="8" fill="#111" rx="1" />
    ))}
    {[10,25,40].map((x) => [60,75,90,105].map((y) =>
      <rect key={`d2-${x}-${y}`} x={x} y={y} width="8" height="8" fill="#111" rx="1" />
    ))}
    {[60,80,100,120,140].map((x) => [130,145].map((y) =>
      y < 160 && x < 160 ? <rect key={`d3-${x}-${y}`} x={x} y={y} width="8" height="8" fill="#111" rx="1" /> : null
    ))}
  </svg>
);

const AddStep2View: React.FC<{
  platform: string;
  onBack: () => void;
}> = ({ platform, onBack }) => {
  const meta = CHANNEL_META[platform];
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
        {/* QR */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-44 h-44 rounded-xl overflow-hidden flex items-center justify-center bg-white p-2">
            <QRCodePlaceholder />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs text-[#71717a]">Escaneie com o {meta.name}</p>
            <button className="text-[#71717a] hover:text-accent transition-colors" title="Gerar novo código">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 space-y-4">
          {/* Instructions */}
          <div className="space-y-1.5">
            {['Abra o WhatsApp no celular', 'Toque em Configurações → Aparelhos conectados', 'Escaneie o QR code ao lado'].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#3f3f46] text-[#fafafa] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-[#71717a]">{step}</p>
              </div>
            ))}
          </div>

          {/* Agent selector */}
          <div>
            <label className="block text-[11px] text-[#71717a] mb-1.5">Agente vinculado</label>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] cursor-pointer hover:border-[#3f3f46] transition-colors">
              <span>Suporte Geral</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a]">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent animate-spin flex-shrink-0">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="text-xs text-[#71717a]">Aguardando conexão...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── OpenClaw: Channel settings ──────────────────────────────────────────────

const ChannelSettingsView: React.FC<{
  channelId: string;
  onBack: () => void;
}> = ({ channelId, onBack }) => {
  const channel = DEMO_CHANNELS.find((c) => c.id === channelId) ?? DEMO_CHANNELS[0];
  const meta = CHANNEL_META[channel.platform];
  const [welcome, setWelcome] = useState('Olá! Sou o Teki, assistente de TI. Me envie uma foto do erro ou descreva o problema.');
  const [allDay, setAllDay] = useState(false);

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
        <span style={{ color: meta.color }}><PlatformIcon platform={channel.platform} size={18} /></span>
        <h3 className="text-sm font-semibold text-[#fafafa]">{meta.name}</h3>
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 leading-none">
          Conectado
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {/* Agente */}
        <FormField label="Agente vinculado">
          <SimpleSelect value="Suporte Geral" />
        </FormField>

        {/* Modelo */}
        <FormField label="Modelo de IA" hint="Substitui o modelo do agente quando configurado">
          <SimpleSelect value="Padrão do agente (Gemini Flash)" />
        </FormField>

        {/* Welcome */}
        <FormField label="Mensagem de boas-vindas" hint="Enviada automaticamente na primeira mensagem de cada conversa">
          <textarea
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#71717a] resize-none focus:outline-none focus:border-accent transition-colors"
          />
        </FormField>

        {/* Horário */}
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
          <button className="flex items-center gap-1.5 text-xs text-red-400 hover:underline transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
            Desconectar {meta.name}
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

function usageColor(pct: number) {
  if (pct >= 85) return '#EF4444';
  if (pct >= 60) return '#F59E0B';
  return '#2A8F9D';
}

const UsageBar: React.FC<{ label: string; current: number; total: number; unit?: string }> = ({ label, current, total, unit = '' }) => {
  const pct = Math.min(100, Math.round((current / total) * 100));
  const color = usageColor(pct);
  const fmt = (v: number) => unit ? `${v} ${unit}` : String(v);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-[#71717a]">{label}</span>
        <span className="text-[11px] text-[#71717a]">{fmt(current)} / {fmt(total)}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#27272a] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const DEMO_API_KEYS = [
  { id: '1', name: 'Produção',  key: 'tk_live_7k2m', dot: '#34D399' },
  { id: '2', name: 'Teste',     key: 'tk_test_9m4x', dot: '#FCD34D' },
];

const AccountTab: React.FC<{ onOpenPlan: () => void }> = ({ onOpenPlan }) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState('Lucas Klein');
  const [email, setEmail] = useState('lucas@merito.dev');

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
              <p className="text-base font-bold text-[#fafafa] leading-tight">{name}</p>
              <p className="text-[13px] text-[#71717a] mt-0.5">{email}</p>
              <p className="text-[11px] text-[#52525b] font-mono mt-0.5">ID: usr_7k2m9x</p>
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

      {/* ── Plan ── */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-bold text-[#fafafa]">Plano atual</span>
          <button onClick={onOpenPlan} className="text-[13px] text-[#2A8F9D] hover:underline transition-colors">
            Alterar plano →
          </button>
        </div>
        <div className="rounded-xl bg-[#18181b] border border-[#3f3f46]/50 p-4 space-y-4">
          <div className="flex items-start justify-between">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/30">
              Starter
            </span>
            <div className="text-right">
              <p className="text-[14px] font-bold text-[#fafafa]">R$ 29/mês</p>
              <p className="text-[11px] text-[#71717a]">Renova em 15 mar</p>
            </div>
          </div>
          <UsageBar label="Mensagens este mês" current={347} total={500} />
          <UsageBar label="Armazenamento KB" current={8.2} total={25} unit="MB" />
          <div>
            <UsageBar label="Agentes ativos" current={1} total={1} />
            <div className="flex items-center gap-1.5 mt-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="text-[11px] text-amber-400">Limite de agentes atingido.</span>
              <button onClick={onOpenPlan} className="text-[11px] text-[#2A8F9D] hover:underline">Upgrade para Pro →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3f3f46]/30 my-1" />

      {/* ── API Keys ── */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[14px] font-bold text-[#fafafa]">Chaves de API</span>
          <button className="px-4 py-1.5 rounded-lg bg-[#2A8F9D] text-[13px] text-white hover:bg-[#238490] transition-colors">
            + Nova chave
          </button>
        </div>
        <p className="text-[12px] text-[#71717a] mb-3">Use chaves de API para integrar o Teki nos seus sistemas.</p>
        <div className="space-y-2">
          {DEMO_API_KEYS.map((k) => (
            <div key={k.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 hover:border-[#3f3f46] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#71717a] flex-shrink-0">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#fafafa]">{k.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: k.dot }} />
                </div>
                <p className="text-[12px] text-[#71717a] font-mono">{k.key}••••••••••••</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#fafafa] hover:bg-white/5 transition-colors" title="Copiar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-red-400 hover:bg-red-500/5 transition-colors" title="Revogar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#52525b] mt-2">Chaves de teste não consomem mensagens do plano. Limite: 5 chaves ativas.</p>
      </div>

      <div className="border-t border-[#3f3f46]/30 my-1" />

      {/* ── Segurança ── */}
      <div className="py-5 space-y-1">
        <p className="text-[14px] font-bold text-[#fafafa] mb-3">Segurança</p>
        {[
          {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
            label: 'Alterar senha', detail: 'Última alteração: 12 jan 2026', btn: 'Alterar',
          },
          {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
            label: 'Sessões ativas', detail: '3 dispositivos', btn: 'Gerenciar',
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 py-2">
            <span className="text-[#71717a] flex-shrink-0">{row.icon}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] text-[#fafafa]">{row.label}</span>
              <span className="text-[12px] text-[#71717a] mx-2">·</span>
              <span className="text-[12px] text-[#71717a]">{row.detail}</span>
            </div>
            <button className="flex-shrink-0 px-3 py-1 rounded-lg border border-[#3f3f46]/50 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">{row.btn}</button>
          </div>
        ))}
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
        <div className="flex items-center gap-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ color: 'rgba(239,68,68,0.6)' }}>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] text-red-400">Excluir conta</span>
            <span className="text-[12px] mx-2" style={{ color: 'rgba(239,68,68,0.5)' }}>·</span>
            <span className="text-[12px]" style={{ color: 'rgba(239,68,68,0.5)' }}>Todos os dados serão removidos permanentemente</span>
          </div>
          <button className="flex-shrink-0 px-3 py-1 rounded-lg border text-[12px] transition-colors"
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.7)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#EF4444'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(239,68,68,0.7)'; }}>
            Excluir
          </button>
        </div>
      </div>

    </div>
  );
};

// ─── Plan Modal ───────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free', label: 'FREE', price: 'R$ 0', period: '/mês',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    borderClass: 'border-[#3f3f46]/50',
    features: [
      { star: false, text: '1 agente' },
      { star: false, text: '50 mensagens/mês' },
      { star: false, text: '2 docs na KB (5 MB)' },
      { star: false, text: '1 modelo (Gemini Flash)' },
      { star: false, text: 'Web + Desktop' },
      { star: false, text: 'Visão de tela' },
      { star: false, text: '7 dias de histórico' },
    ],
    btn: { label: 'Downgrade', disabled: false, className: 'border border-[#3f3f46]/50 text-[#71717a] hover:text-[#fafafa] hover:border-[#3f3f46]' },
    current: false, recommended: false,
  },
  {
    id: 'starter', label: 'STARTER', price: 'R$ 29', period: '/mês',
    badgeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    borderClass: 'border-blue-500/40',
    features: [
      { star: false, text: '1 agente' },
      { star: false, text: '500 mensagens/mês' },
      { star: false, text: '5 docs na KB (25 MB)' },
      { star: false, text: '3 modelos de IA' },
      { star: false, text: 'Web + Desktop' },
      { star: false, text: 'Visão de tela' },
      { star: false, text: '30 dias de histórico' },
      { star: false, text: 'Suporte por email' },
    ],
    btn: { label: 'Plano atual', disabled: true, className: 'bg-[#27272a] text-[#52525b] cursor-not-allowed' },
    current: true, recommended: false,
  },
  {
    id: 'pro', label: 'PRO', price: 'R$ 79', period: '/mês',
    badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    borderClass: 'border-[#2A8F9D]/50',
    features: [
      { star: false, text: '5 agentes' },
      { star: false, text: '2.000 mensagens/mês' },
      { star: false, text: '50 docs na KB (100 MB)' },
      { star: false, text: '7 modelos de IA + Ollama' },
      { star: false, text: 'Web + Desktop' },
      { star: false, text: 'Visão de tela' },
      { star: false, text: 'Histórico ilimitado' },
      { star: true,  text: 'WhatsApp, Telegram, Discord, Slack' },
      { star: true,  text: 'BYOK (use sua própria API key)' },
      { star: false, text: 'Onboarding 1:1' },
      { star: false, text: 'Suporte prioritário' },
    ],
    btn: { label: 'Assinar Pro', disabled: false, className: 'bg-[#2A8F9D] text-white hover:bg-[#238490]' },
    current: false, recommended: true,
  },
];

const PlanModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-[#111113] border border-[#3f3f46]/50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: 780, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-center relative px-6 py-5 border-b border-[#3f3f46]/50">
          <h2 className="text-lg font-bold text-[#fafafa]">Escolha seu plano</h2>
          <button onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Cards */}
        <div className="flex gap-4 p-6">
          {PLANS.map((plan) => (
            <div key={plan.id}
              className={`flex-1 flex flex-col rounded-xl bg-[#18181b] border ${plan.borderClass} p-5 transition-all`}
              style={plan.recommended ? { boxShadow: '0 0 20px rgba(42,143,157,0.12)' } : plan.current ? { boxShadow: '0 0 20px rgba(59,130,246,0.08)' } : {}}>
              {/* Top */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${plan.badgeClass}`}>
                  {plan.label}
                </span>
                {plan.current && <span className="text-[10px] text-[#71717a]">ATUAL</span>}
                {plan.recommended && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#2A8F9D]/10 text-[#2A8F9D] border border-[#2A8F9D]/30">
                    POPULAR
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-[#fafafa]">{plan.price}</span>
                <span className="text-[13px] text-[#71717a]">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {f.star ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#2A8F9D] flex-shrink-0 mt-0.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="text-[12px] text-[#2A8F9D]">{f.text}</span>
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#2A8F9D] flex-shrink-0 mt-0.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span className="text-[12px] text-[#71717a]">{f.text}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button disabled={plan.btn.disabled}
                className={`w-full py-2 rounded-lg text-[13px] font-medium transition-colors ${plan.btn.className}`}>
                {plan.btn.label}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center pb-5 text-[11px] text-[#52525b]">
          🏢 Enterprise?{' '}
          <button className="text-[#2A8F9D] hover:underline">Fale conosco →</button>
          {' · '}Pagamento via Mercado Pago. Cancele quando quiser.
        </div>
      </div>
    </div>
  );
};

// ─── Knowledge Base Tab ──────────────────────────────────────────────────────

type DocStatus = 'indexed' | 'indexing' | 'error';

interface KBDoc {
  id: string;
  name: string;
  type: 'pdf' | 'md' | 'txt' | 'docx';
  size: string;
  status: DocStatus;
  progress?: number;
  indexedAt?: string;
  chunks?: number;
  words?: number;
}

const DEMO_DOCS: KBDoc[] = [
  { id: '1', name: 'Guia de Suporte Nivel 1.pdf', type: 'pdf', size: '2.4 MB', status: 'indexed', indexedAt: '15 jan 2026', chunks: 42, words: 8300 },
  { id: '2', name: 'Procedimentos de Rede.md',    type: 'md',  size: '48 KB',  status: 'indexed', indexedAt: '18 jan 2026', chunks: 11, words: 2100 },
  { id: '3', name: 'FAQ Impressoras.txt',          type: 'txt', size: '120 KB', status: 'indexing', progress: 65 },
];

const MAX_DOCS = 5;
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

const KnowledgeBaseTab: React.FC = () => {
  const [docs, setDocs] = useState<KBDoc[]>(DEMO_DOCS);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState('');
  const [detailDoc, setDetailDoc] = useState<KBDoc | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedMB = 8.2;
  const usedPct = Math.round((usedMB / KB_TOTAL_MB) * 100);
  const slots = MAX_DOCS - docs.length;

  const simulateUpload = (name: string) => {
    setUploadName(name);
    setUploading(true);
    setUploadProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        clearInterval(iv);
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          const ext = name.split('.').pop()?.toLowerCase() as KBDoc['type'] ?? 'txt';
          setDocs((prev) => [...prev, { id: String(Date.now()), name, type: ext, size: '~', status: 'indexing', progress: 0 }]);
        }, 400);
      } else {
        setUploadProgress(p);
      }
    }, 200);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    simulateUpload(files[0].name);
  };

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setMenuOpen(null);
    if (detailDoc?.id === id) setDetailDoc(null);
  };

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
    <div className="flex flex-1 min-h-0 gap-0">
      {/* Main column */}
      <div className={`flex flex-col min-w-0 transition-all duration-200 ${detailDoc ? 'w-[54%] pr-5' : 'w-full'}`}>
        {/* Header */}
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
          {slots > 0 && (
            <p className="text-[11px] text-[#52525b] text-center py-1">
              {slots} slot{slots !== 1 ? 's' : ''} restante{slots !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Info bar */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/30 mt-2.5 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-[11px] text-[#71717a] leading-relaxed">
            Documentos ficam disponíveis para todos os agentes. Máx. {MAX_DOCS} docs / {KB_TOTAL_MB} MB no plano Starter.
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
  );
};

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = 'ia' | 'openclaw' | 'kb' | 'conta' | 'geral';
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
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [visible, setVisible] = useState(false);

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
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !planModalOpen) close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [settingsOpen, close, planModalOpen]);

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
      {planModalOpen && <PlanModal onClose={() => setPlanModalOpen(false)} />}
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
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
              label="OpenClaw" />
            <SidebarTab active={activeTab === 'kb'} onClick={() => handleTabChange('kb')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
              label="Conhecimento" />
            <SidebarTab active={activeTab === 'conta'} onClick={() => handleTabChange('conta')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="Conta" />
            <SidebarTab active={activeTab === 'geral'} onClick={() => handleTabChange('geral')}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
              label="Geral" />
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
                  <label className="block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider mb-3">Chave de API</label>
                  <ApiKeyInput provider={activeProvider} />
                </div>
                <p className="text-[11px] text-[#3f3f46] border-t border-[#3f3f46]/20 pt-4">
                  Suas chaves são armazenadas localmente e nunca enviadas ao servidor do Teki.
                </p>
              </div>
            )}

            {/* ── OpenClaw tab ── */}
            {activeTab === 'openclaw' && (
              <>
                {ocView.type === 'list' && (
                  <ChannelListView
                    onAdd={() => setOcView({ type: 'add-step1' })}
                    onSettings={(id) => setOcView({ type: 'channel-settings', channelId: id })}
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
                  />
                )}
                {ocView.type === 'channel-settings' && (
                  <ChannelSettingsView
                    channelId={ocView.channelId}
                    onBack={() => setOcView({ type: 'list' })}
                  />
                )}
              </>
            )}

            {/* ── KB tab ── */}
            {activeTab === 'kb' && <KnowledgeBaseTab />}

            {/* ── Conta tab ── */}
            {activeTab === 'conta' && (
              <AccountTab onOpenPlan={() => setPlanModalOpen(true)} />
            )}

            {/* ── Geral tab ── */}
            {activeTab === 'geral' && <AllApiKeys />}

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
