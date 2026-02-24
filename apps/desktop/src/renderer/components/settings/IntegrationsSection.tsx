import React, { useState } from 'react';
import type { ConnectorConfig } from './types';
import { DEMO_CONNECTOR, PLATFORM_META } from './types';
import { PlatformLogo } from './SettingsIcons';
import ConnectorCard from './ConnectorCard';
import ConnectorWizard from './ConnectorWizard';

const IntegrationsSection: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleWizardComplete = (connector: ConnectorConfig) => {
    setConnectors((prev) => [...prev, connector]);
    setWizardOpen(false);
  };

  const handleDisconnect = (id: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== id));
  };

  // Empty state
  if (connectors.length === 0 && !wizardOpen) {
    return (
      <div>
        <h1 className="text-lg font-semibold text-[#fafafa] mb-1">Integrações</h1>
        <p className="text-sm text-[#71717a] mb-8">
          Conecte o Teki ao sistema de chamados que sua equipe já usa.{' '}
          O Teki adiciona IA, base de conhecimento e analytics sem mudar seu fluxo de trabalho.
        </p>

        {/* Empty state card */}
        <div className="border-2 border-dashed border-[#27272a] rounded-xl px-8 py-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M12 2v6M8 2v6M16 2v6M4 10h16M6 10v4a6 6 0 0 0 12 0v-4M12 20v2"/>
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#fafafa] mb-1">Nenhuma integração configurada</h3>
          <p className="text-xs text-[#71717a] mb-5 max-w-xs leading-relaxed">
            Conecte seu sistema de chamados para começar a usar o Teki.
          </p>
          <button
            onClick={() => setWizardOpen(true)}
            className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            + Conectar sistema
          </button>
        </div>

        {/* Supported systems */}
        <div className="mt-8">
          <p className="text-xs text-[#71717a] mb-3">Sistemas suportados:</p>
          <div className="flex gap-3">
            {PLATFORM_META.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a]"
              >
                <PlatformLogo platform={p.id} size={24} />
                <div>
                  <p className="text-xs font-semibold text-[#fafafa]">{p.name}</p>
                  <p className="text-[10px] text-[#52525b]">{p.versions}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#71717a] mt-4">
            Não encontrou seu sistema?{' '}
            <button className="text-accent hover:underline">Fale conosco</button>
          </p>
        </div>

        {/* Wizard modal */}
        {wizardOpen && (
          <ConnectorWizard
            onClose={() => setWizardOpen(false)}
            onComplete={handleWizardComplete}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-[#fafafa] mb-6">Integrações</h1>

      {/* Connector cards */}
      <div className="space-y-4">
        {connectors.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            onDisconnect={() => handleDisconnect(connector.id)}
            onTest={() => {/* re-test */}}
          />
        ))}
      </div>

      {/* Add another */}
      <button
        onClick={() => setWizardOpen(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#27272a] text-[#71717a] hover:border-accent/40 hover:text-accent transition-colors"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span className="text-sm font-medium">Conectar outro sistema</span>
      </button>

      {/* Wizard */}
      {wizardOpen && (
        <ConnectorWizard
          onClose={() => setWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </div>
  );
};

export default IntegrationsSection;
