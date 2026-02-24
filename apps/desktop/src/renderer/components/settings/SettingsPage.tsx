import React, { useState } from 'react';
import type { SettingsSection } from './types';
import { SETTINGS_SECTIONS } from './types';
import { icons } from './SettingsIcons';
import IntegrationsSection from './IntegrationsSection';
import AiModelsSection from './AiModelsSection';

const SettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('integrations');

  return (
    <div className="flex h-full bg-bg">
      {/* Settings sidebar */}
      <nav className="w-[200px] flex-shrink-0 bg-[#18181b] border-r border-[#27272a] flex flex-col">
        <div className="px-4 py-4 border-b border-[#27272a]">
          <h2 className="text-sm font-semibold text-[#fafafa]">Configurações</h2>
        </div>
        <div className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                activeSection === section.id
                  ? 'bg-[rgba(42,143,157,0.1)] text-accent font-medium border-l-2 border-accent pl-[10px]'
                  : 'text-[#a1a1aa] hover:bg-white/5 hover:text-[#fafafa]'
              }`}
            >
              <span className="flex-shrink-0">{icons[section.icon]}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
        <div className="px-2 py-3 border-t border-[#27272a]">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#71717a] hover:bg-white/5 hover:text-[#fafafa] transition-colors"
          >
            {icons['arrow-left']}
            <span>Voltar</span>
          </button>
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-8 py-6">
          {activeSection === 'integrations' && <IntegrationsSection />}
          {activeSection === 'ai-models' && <AiModelsSection />}
          {activeSection === 'general' && <PlaceholderSection title="Geral" desc="Nome da empresa, logo, slug, timezone, idioma padrão" />}
          {activeSection === 'team' && <PlaceholderSection title="Equipe" desc="Membros, convites, roles, permissões" />}
          {activeSection === 'notifications' && <PlaceholderSection title="Notificações" desc="Canais, digest, preferências por tipo de evento" />}
          {activeSection === 'security' && <PlaceholderSection title="Segurança" desc="MFA obrigatório, sessões, políticas de senha, logs de acesso" />}
          {activeSection === 'plan' && <PlaceholderSection title="Plano" desc="Plano atual, uso, limites, billing, upgrade" />}
          {activeSection === 'privacy' && <PlaceholderSection title="Privacidade" desc="LGPD, consentimentos, DPO, retenção de dados, anonimização" />}
        </div>
      </div>
    </div>
  );
};

const PlaceholderSection: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div>
    <h1 className="text-lg font-semibold text-[#fafafa] mb-2">{title}</h1>
    <p className="text-sm text-[#71717a]">{desc}</p>
    <div className="mt-8 flex items-center justify-center py-16 border-2 border-dashed border-[#27272a] rounded-xl">
      <p className="text-sm text-[#52525b]">Em breve</p>
    </div>
  </div>
);

export default SettingsPage;
