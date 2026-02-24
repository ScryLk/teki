import React, { useState } from 'react';
import type { ConnectorPlatform } from './types';
import { PLATFORM_META } from './types';

interface CredentialsPanelProps {
  platform: ConnectorPlatform;
  baseUrl: string;
}

const CredentialsPanel: React.FC<CredentialsPanelProps> = ({ platform, baseUrl }) => {
  const platformMeta = PLATFORM_META.find((p) => p.id === platform);
  const [editing, setEditing] = useState<string | null>(null);

  // Masked token: show last 6 chars
  const maskedToken = (key: string) => {
    const suffix = key.slice(-6);
    return `${'•'.repeat(20)}${suffix}`;
  };

  return (
    <div className="space-y-4">
      {/* URL */}
      <div>
        <label className="block text-xs text-[#71717a] mb-1">URL da API</label>
        <div className="px-3 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-sm text-[#fafafa]">
          https://{baseUrl}
        </div>
      </div>

      {/* Credential fields */}
      {platformMeta?.fields.filter((f) => f.type === 'password').map((field) => (
        <div key={field.key}>
          <label className="block text-xs text-[#71717a] mb-1">{field.label}</label>
          {editing === field.key ? (
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Novo token..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-[#0f0f12] border border-[#27272a] text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-lg border border-[#27272a] text-xs text-[#71717a] hover:text-[#fafafa] transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-lg bg-[#18181b] border border-[#27272a] text-sm text-[#52525b] font-mono">
                {maskedToken('xxaF3k')}
              </div>
              <button
                onClick={() => {
                  // Eye button shows security message instead of revealing token
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                title="Tokens não podem ser visualizados por segurança"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
              <button
                onClick={() => setEditing(field.key)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                title="Editar"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-[#52525b]">Adicionado em: 24/02/2026</p>
            <p className="text-[11px] text-[#52525b]">
              Última validação: há 2 min{' '}
              <span className="text-[#17c964]">(válido)</span>
            </p>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
          </svg>
          Validar credenciais agora
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Atualizar tokens
        </button>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-[#f5a524]/5 border border-[#f5a524]/20">
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-[#f5a524] flex-shrink-0 mt-0.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
          Os tokens são criptografados com AES-256-GCM.
          Nunca são exibidos em plaintext nem enviados ao frontend.
        </p>
      </div>
    </div>
  );
};

export default CredentialsPanel;
