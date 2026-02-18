import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';

// ─── Icon Components ───────────────────────────────────────────────────────────

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AlgoliaCredentials {
  algoliaAppId: string;
  algoliaApiKey: string;
  algoliaAgentId: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Component ─────────────────────────────────────────────────────────────────

const SettingsPanel: React.FC = () => {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  const [credentials, setCredentials] = useState<AlgoliaCredentials>({
    algoliaAppId: '',
    algoliaApiKey: '',
    algoliaAgentId: '',
  });
  const [initialCredentials, setInitialCredentials] = useState<AlgoliaCredentials>({
    algoliaAppId: '',
    algoliaApiKey: '',
    algoliaAgentId: '',
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.tekiAPI.getAllSettings();
        const loaded = {
          algoliaAppId: settings.algoliaAppId || '',
          algoliaApiKey: settings.algoliaApiKey || '',
          algoliaAgentId: settings.algoliaAgentId || '',
        };
        setCredentials(loaded);
        setInitialCredentials(loaded);
      } catch {
        // Settings not available yet
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const hasChanges =
    credentials.algoliaAppId !== initialCredentials.algoliaAppId ||
    credentials.algoliaApiKey !== initialCredentials.algoliaApiKey ||
    credentials.algoliaAgentId !== initialCredentials.algoliaAgentId;

  const isConfigured =
    credentials.algoliaAppId.trim() !== '' &&
    credentials.algoliaApiKey.trim() !== '' &&
    credentials.algoliaAgentId.trim() !== '';

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await window.tekiAPI.setSetting('algoliaAppId', credentials.algoliaAppId.trim());
      await window.tekiAPI.setSetting('algoliaApiKey', credentials.algoliaApiKey.trim());
      await window.tekiAPI.setSetting('algoliaAgentId', credentials.algoliaAgentId.trim());
      setInitialCredentials({ ...credentials });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [credentials]);

  const close = useCallback(() => {
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  const handleChange = (field: keyof AlgoliaCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    if (saveStatus === 'saved' || saveStatus === 'error') {
      setSaveStatus('idle');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">
            Configurações
          </h2>
          <button
            onClick={close}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Status banner */}
          {!isLoading && !isConfigured && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertIcon className="text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="font-medium text-warning">Credenciais não configuradas</p>
                <p className="mt-1">
                  O Teki precisa das credenciais do Algolia para funcionar.
                  Obtenha em{' '}
                  <span className="text-accent font-mono text-xs">
                    dashboard.algolia.com
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Algolia section */}
          <div>
            <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Algolia API
            </h3>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="algolia-app-id"
                  className="block text-sm text-text-secondary mb-1.5"
                >
                  App ID
                </label>
                <input
                  id="algolia-app-id"
                  type="text"
                  value={credentials.algoliaAppId}
                  onChange={handleChange('algoliaAppId')}
                  placeholder="Seu Algolia App ID"
                  className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="algolia-api-key"
                  className="block text-sm text-text-secondary mb-1.5"
                >
                  API Key (Search)
                </label>
                <input
                  id="algolia-api-key"
                  type="password"
                  value={credentials.algoliaApiKey}
                  onChange={handleChange('algoliaApiKey')}
                  placeholder="Sua Search API Key"
                  className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="algolia-agent-id"
                  className="block text-sm text-text-secondary mb-1.5"
                >
                  Agent ID
                </label>
                <input
                  id="algolia-agent-id"
                  type="text"
                  value={credentials.algoliaAgentId}
                  onChange={handleChange('algoliaAgentId')}
                  placeholder="Seu Algolia Agent ID"
                  className="w-full px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-bg/50">
          <div className="text-xs text-text-muted">
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckIcon className="text-success" />
                Salvo
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-error">Erro ao salvar</span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-text-muted">Salvando...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={close}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
              className="px-4 py-1.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
