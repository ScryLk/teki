import React, { useCallback, useEffect, useState } from 'react';
import type { ConnectorConfig, ConnectorPlatform, PlatformField, WizardStep } from './types';
import { DEMO_CONNECTOR, PLATFORM_META } from './types';
import { PlatformLogo } from './SettingsIcons';
import ConnectionTester from './ConnectionTester';

interface ConnectorWizardProps {
  onClose: () => void;
  onComplete: (connector: ConnectorConfig) => void;
}

const ConnectorWizard: React.FC<ConnectorWizardProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [platform, setPlatform] = useState<ConnectorPlatform | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [displayName, setDisplayName] = useState('');
  const [testComplete, setTestComplete] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 150);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  const platformMeta = platform ? PLATFORM_META.find((p) => p.id === platform) : null;

  const handlePlatformSelect = (p: ConnectorPlatform) => {
    setPlatform(p);
    setStep(2);
  };

  const handleCredentialsSubmit = () => {
    setStep(3);
  };

  const handleTestSuccess = () => {
    setTestComplete(true);
  };

  const handleComplete = () => {
    onComplete({
      ...DEMO_CONNECTOR,
      id: `conn-${Date.now()}`,
      platform: platform!,
      displayName: displayName || `${platformMeta?.name} Produção`,
      baseUrl: credentials.baseUrl || DEMO_CONNECTOR.baseUrl,
    });
  };

  const allFieldsFilled = platformMeta?.fields.every((f) => credentials[f.key]?.trim()) ?? false;

  // Step indicator labels
  const stepLabels = [
    { num: 1, label: platform ? platformMeta?.name ?? 'Sistema' : 'Escolher sistema' },
    { num: 2, label: 'Configurar' },
    { num: 3, label: 'Testar' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className={`bg-[#111113] border border-[#3f3f46]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ width: 640, maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#fafafa]">Conectar sistema de chamados</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#52525b]">Passo {step} de 3</span>
            <button onClick={close} className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b border-[#27272a] flex-shrink-0">
          <div className="flex items-center gap-0">
            {stepLabels.map(({ num, label }, i) => {
              const isComplete = num < step;
              const isCurrent = num === step;
              return (
                <React.Fragment key={num}>
                  {i > 0 && (
                    <div className={`flex-1 h-px mx-2 ${isComplete ? 'bg-accent' : 'bg-[#3f3f46]'}`} />
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isComplete ? 'bg-accent text-white'
                        : isCurrent ? 'bg-accent/20 text-accent border border-accent'
                          : 'bg-[#27272a] text-[#52525b]'
                    }`}>
                      {isComplete ? (
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : num}
                    </span>
                    <span className={`text-xs ${isCurrent ? 'text-[#fafafa] font-medium' : isComplete ? 'text-accent' : 'text-[#52525b]'}`}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <Step1PlatformSelect onSelect={handlePlatformSelect} />
          )}
          {step === 2 && platformMeta && (
            <Step2Credentials
              platform={platformMeta}
              credentials={credentials}
              displayName={displayName}
              onChange={setCredentials}
              onDisplayNameChange={setDisplayName}
            />
          )}
          {step === 3 && platform && (
            <ConnectionTester
              platform={platform}
              onSuccess={handleTestSuccess}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#27272a] flex-shrink-0">
          {step === 1 && (
            <button onClick={close} className="px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] transition-colors">
              Cancelar
            </button>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] transition-colors">
                Voltar
              </button>
              <button
                onClick={handleCredentialsSubmit}
                disabled={!allFieldsFilled}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  allFieldsFilled ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-[#27272a] text-[#52525b] cursor-not-allowed'
                }`}
              >
                Testar conexão
              </button>
            </>
          )}
          {step === 3 && !testComplete && (
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] transition-colors">
              Voltar
            </button>
          )}
          {step === 3 && testComplete && (
            <button
              onClick={handleComplete}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Step 1: Platform Selection ─────────────────────────────────────────────

const Step1PlatformSelect: React.FC<{
  onSelect: (p: ConnectorPlatform) => void;
}> = ({ onSelect }) => (
  <div>
    <h3 className="text-sm font-medium text-[#fafafa] mb-4">Qual sistema sua equipe usa?</h3>
    <div className="grid grid-cols-2 gap-3">
      {PLATFORM_META.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className="flex flex-col items-center gap-3 py-6 px-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-accent hover:bg-accent/5 transition-all group"
        >
          <PlatformLogo platform={p.id} size={36} color="#a1a1aa" />
          <div className="text-center">
            <p className="text-sm font-semibold text-[#fafafa] group-hover:text-accent transition-colors">{p.name}</p>
            <p className="text-[11px] text-[#52525b] mt-0.5">{p.subtitle}</p>
            <p className="text-[10px] text-[#3f3f46] mt-0.5">{p.versions}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

// ─── Step 2: Credentials ────────────────────────────────────────────────────

const Step2Credentials: React.FC<{
  platform: { id: ConnectorPlatform; name: string; fields: PlatformField[] };
  credentials: Record<string, string>;
  displayName: string;
  onChange: (creds: Record<string, string>) => void;
  onDisplayNameChange: (name: string) => void;
}> = ({ platform, credentials, displayName, onChange, onDisplayNameChange }) => {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const updateField = (key: string, value: string) => {
    onChange({ ...credentials, [key]: value });
  };

  const toggleVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-5">
      {/* Connection fields */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4 space-y-4">
        <h4 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Conexão</h4>
        {platform.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs text-[#a1a1aa] mb-1.5">{field.label}</label>
            <div className="relative">
              <input
                type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                value={credentials[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-accent transition-colors pr-10"
              />
              {field.type === 'password' && (
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.key)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa] transition-colors"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {showPasswords[field.key] ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#52525b] mt-1">{field.hint}</p>
          </div>
        ))}

        {platform.id === 'glpi' && (
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-accent/5 border border-accent/20">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
              O usuário precisa ter perfil com permissão de leitura em Tickets, Usuários e Categorias.
            </p>
          </div>
        )}
      </div>

      {/* Display name */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-4">
        <label className="block text-xs text-[#a1a1aa] mb-1.5">Nome da integração (opcional)</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder={`${platform.name} Produção`}
          className="w-full px-3 py-2.5 rounded-lg bg-[#0f0f12] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#3f3f46] focus:outline-none focus:border-accent transition-colors"
        />
        <p className="text-[11px] text-[#52525b] mt-1">Para diferenciar se tiver mais de uma instância</p>
      </div>
    </div>
  );
};

export default ConnectorWizard;
