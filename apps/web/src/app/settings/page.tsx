'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  ArrowLeft,
  User,
  CreditCard,
  Bot,
  Palette,
  Monitor,
  Bell,
  Shield,
  LogOut,
} from 'lucide-react';
import type { SettingsSection } from '@/lib/settings-types';
import { DEFAULT_SETTINGS, type UserSettings } from '@/lib/settings-types';
import { ContaSection } from '@/components/settings/ContaSection';
import { PlanoSection } from '@/components/settings/PlanoSection';
import { MinhaIASection } from '@/components/settings/MinhaIASection';
import { AparenciaSection } from '@/components/settings/AparenciaSection';
import { DesktopSection } from '@/components/settings/DesktopSection';
import { NotificacoesSection } from '@/components/settings/NotificacoesSection';
import { PrivacidadeSection } from '@/components/settings/PrivacidadeSection';

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  desktopOnly?: boolean;
}[] = [
  { id: 'conta', label: 'Conta', icon: User },
  { id: 'plano', label: 'Plano', icon: CreditCard },
  { id: 'minha-ia', label: 'Minha IA', icon: Bot },
  { id: 'aparencia', label: 'Aparencia', icon: Palette },
  { id: 'desktop', label: 'Desktop', icon: Monitor, desktopOnly: true },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell },
  { id: 'privacidade', label: 'Privacidade', icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('conta');
  const [mobileShowContent, setMobileShowContent] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // For now we don't detect Electron from the web side, so hide desktop section in web
  const isElectron = false;

  const updateSettings = useCallback(
    (partial: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const handleSelectSection = (section: SettingsSection) => {
    setActiveSection(section);
    if (!isDesktop) {
      setMobileShowContent(true);
    }
  };

  const handleMobileBack = () => {
    setMobileShowContent(false);
  };

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.desktopOnly || isElectron
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'conta':
        return <ContaSection />;
      case 'plano':
        return <PlanoSection />;
      case 'minha-ia':
        return (
          <MinhaIASection settings={settings} onUpdate={updateSettings} />
        );
      case 'aparencia':
        return (
          <AparenciaSection settings={settings} onUpdate={updateSettings} />
        );
      case 'desktop':
        return (
          <DesktopSection settings={settings} onUpdate={updateSettings} />
        );
      case 'notificacoes':
        return (
          <NotificacoesSection settings={settings} onUpdate={updateSettings} />
        );
      case 'privacidade':
        return (
          <PrivacidadeSection settings={settings} onUpdate={updateSettings} />
        );
      default:
        return <ContaSection />;
    }
  };

  // Mobile: show list or content
  if (!isDesktop) {
    if (mobileShowContent) {
      return (
        <div className="flex flex-col h-dvh bg-background text-foreground">
          {/* Mobile content header */}
          <header className="flex items-center gap-3 px-4 h-14 border-b bg-card flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleMobileBack}
            >
              <ArrowLeft size={16} />
            </Button>
            <span className="text-sm font-semibold">
              {filteredNavItems.find((i) => i.id === activeSection)?.label}
            </span>
          </header>

          <main className="flex-1 overflow-y-auto p-4">{renderSection()}</main>

          <footer className="px-4 py-3 border-t bg-card text-xs text-muted-foreground text-center">
            Teki v0.1.0
          </footer>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-dvh bg-background text-foreground">
        {/* Mobile list header */}
        <header className="flex items-center justify-between px-4 h-14 border-b bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowLeft size={14} />
                Voltar ao Chat
              </Button>
            </Link>
          </div>
          <span className="text-sm font-semibold">Configuracoes</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <nav className="flex flex-col py-2">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSection(item.id)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors text-left"
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}

            <Separator className="my-2" />

            <button className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
              <LogOut size={18} />
              Sair
            </button>
          </nav>
        </main>

        <footer className="px-4 py-3 border-t bg-card text-xs text-muted-foreground text-center">
          Teki v0.1.0
        </footer>
      </div>
    );
  }

  // Desktop: sidebar + content
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
              <ArrowLeft size={14} />
              Voltar ao Chat
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/teki.png" alt="Teki" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold">Configuracoes</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r bg-card flex flex-col flex-shrink-0">
          <nav className="flex-1 flex flex-col py-4">
            {filteredNavItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                    isActive
                      ? 'bg-accent text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              );
            })}

            <Separator className="my-3 mx-4" />

            <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
              <LogOut size={16} />
              Sair
            </button>
          </nav>

          <div className="px-4 py-3 border-t text-xs text-muted-foreground">
            Teki v0.1.0
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-2xl">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}
