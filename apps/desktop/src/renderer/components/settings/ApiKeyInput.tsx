import React, { useState, useEffect } from 'react';
import { useApiKeyValidation } from '@/hooks/useApiKeyValidation';
import type { AiProviderId, ApiKeyStatus } from '@teki/shared';

// ─── Provider config ──────────────────────────────────────────────────────────

interface ProviderConfig {
  name: string;
  color: string;
  placeholder: string;
  helpText: string;
  keyPrefix: string;
  settingsKey: string;
  statusKey: string;
}

const PROVIDER_CONFIG: Record<AiProviderId, ProviderConfig> = {
  gemini: {
    name: 'Google Gemini',
    color: '#4285F4',
    placeholder: 'AIza...',
    helpText: 'Obtenha em aistudio.google.com → API Keys',
    keyPrefix: 'AIza',
    settingsKey: 'geminiApiKey',
    statusKey: 'geminiKeyStatus',
  },
  openai: {
    name: 'OpenAI',
    color: '#10A37F',
    placeholder: 'sk-...',
    helpText: 'Obtenha em platform.openai.com → API Keys',
    keyPrefix: 'sk-',
    settingsKey: 'openaiApiKey',
    statusKey: 'openaiKeyStatus',
  },
  anthropic: {
    name: 'Anthropic Claude',
    color: '#D4A574',
    placeholder: 'sk-ant-...',
    helpText: 'Obtenha em console.anthropic.com → API Keys',
    keyPrefix: 'sk-ant-',
    settingsKey: 'anthropicApiKey',
    statusKey: 'anthropicKeyStatus',
  },
  ollama: {
    name: 'Ollama (Local)',
    color: '#e5e5e5',
    placeholder: 'http://localhost:11434',
    helpText: 'URL do servidor Ollama rodando na sua máquina',
    keyPrefix: 'http',
    settingsKey: 'ollamaBaseUrl',
    statusKey: 'ollamaKeyStatus',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: ApiKeyStatus }> = ({ status }) => {
  if (status === 'valid') return (
    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Válida
    </span>
  );
  if (status === 'invalid') return (
    <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Inválida
    </span>
  );
  if (status === 'validating') return (
    <span className="inline-flex items-center gap-1 text-[11px] text-accent bg-accent/10 border border-accent/30 rounded-full px-2 py-0.5">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Validando...
    </span>
  );
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface ApiKeyInputProps {
  provider: AiProviderId;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ provider }) => {
  const cfg = PROVIDER_CONFIG[provider];
  const [initialStatus, setInitialStatus] = useState<ApiKeyStatus>('unconfigured');
  const { status, result, isValidating, validate, clear } = useApiKeyValidation(provider, initialStatus);

  const [inputValue, setInputValue] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Load persisted key and status on mount
  useEffect(() => {
    window.tekiAPI.getSetting<string>(cfg.settingsKey).then((key) => {
      if (key) {
        setSavedKey(key);
        setInputValue(key);
      }
    });
    window.tekiAPI.getSetting<ApiKeyStatus>(cfg.statusKey).then((s) => {
      if (s && s !== 'validating') setInitialStatus(s);
    });
  }, [cfg.settingsKey, cfg.statusKey]);

  const hasChanges = inputValue !== savedKey;
  const isConfigured = status === 'valid' && savedKey;

  // Masked display: prefix + bullets
  const maskedKey = savedKey
    ? `${savedKey.slice(0, cfg.keyPrefix.length)}${'•'.repeat(20)}`
    : '';

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const res = await validate(trimmed);
    if (res.valid) setSavedKey(trimmed);
  };

  const handleClear = async () => {
    await clear();
    setInputValue('');
    setSavedKey('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

  const displayValue = isConfigured && !hasChanges && !showKey ? maskedKey : inputValue;

  return (
    <div className="space-y-1.5">
      {/* Provider header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
        <span className="text-[13px] font-semibold text-[#fafafa]">{cfg.name}</span>
        <StatusBadge status={status} />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={displayValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              // Reveal the real key when the user starts editing
              if (isConfigured && !hasChanges) setInputValue(savedKey);
            }}
            onKeyDown={handleKeyDown}
            placeholder={cfg.placeholder}
            disabled={isValidating}
            className={`w-full h-10 px-3 pr-10 text-[13px] font-mono rounded-lg bg-[#18181b] border transition-colors outline-none
              placeholder:text-[#52525b] disabled:opacity-50 disabled:cursor-not-allowed
              focus:border-accent
              ${status === 'valid'    ? 'border-emerald-500/30' : ''}
              ${status === 'invalid'  ? 'border-red-500/30'     : ''}
              ${status === 'unconfigured' || status === 'validating' ? 'border-[#3f3f46]/50' : ''}
            `}
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
            title={showKey ? 'Ocultar' : 'Mostrar'}
          >
            {showKey ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        {/* Action button */}
        {hasChanges || !isConfigured ? (
          <button
            onClick={handleSave}
            disabled={isValidating || !inputValue.trim()}
            className="h-10 px-4 text-[13px] font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-accent text-white hover:bg-[#238490]"
          >
            {isValidating ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : 'Salvar'}
          </button>
        ) : (
          <button
            onClick={handleClear}
            className="h-10 px-3 text-[#52525b] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Remover chave"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Footer: error / success info / help text */}
      <div className="min-h-[16px]">
        {status === 'invalid' && result?.error && (
          <p className="text-[11px] text-red-400/80">{result.error}</p>
        )}
        {status === 'valid' && result && (
          <p className="text-[11px] text-[#52525b]">
            Verificada em {result.latencyMs}ms
            {result.models && result.models.length > 0 && (
              <> · {result.models.length} modelo{result.models.length !== 1 ? 's' : ''} disponíve{result.models.length !== 1 ? 'is' : 'l'}</>
            )}
          </p>
        )}
        {(status === 'unconfigured' || (!result && status !== 'validating')) && (
          <p className="text-[11px] text-[#52525b]">{cfg.helpText}</p>
        )}
      </div>
    </div>
  );
};

// ─── All providers panel ──────────────────────────────────────────────────────

const ALL_PROVIDERS: AiProviderId[] = ['gemini', 'openai', 'anthropic', 'ollama'];

export const AllApiKeys: React.FC = () => (
  <div className="space-y-7">
    <div>
      <h3 className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider mb-1">
        Chaves de API dos Provedores
      </h3>
      <p className="text-[12px] text-[#52525b]">
        Configure suas chaves para usar modelos de diferentes provedores. Armazenadas localmente no dispositivo.
      </p>
    </div>
    {ALL_PROVIDERS.map((p) => (
      <ApiKeyInput key={p} provider={p} />
    ))}
    <p className="text-[11px] text-[#3f3f46] border-t border-[#3f3f46]/30 pt-4">
      Suas chaves nunca são enviadas ao servidor do Teki — ficam apenas neste dispositivo.
    </p>
  </div>
);
