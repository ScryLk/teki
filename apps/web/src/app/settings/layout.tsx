'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Users,
  Brain,
  Plug,
  Bell,
  Shield,
  CreditCard,
  Lock,
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  { label: 'Geral', href: '/settings', icon: Settings, enabled: false },
  { label: 'Equipe', href: '/settings/equipe', icon: Users, enabled: false },
  { label: 'IA & Modelos', href: '/settings/ia-modelos', icon: Brain, enabled: true },
  { label: 'Integrações', href: '/settings/integracoes', icon: Plug, enabled: false },
  { label: 'Notificações', href: '/settings/notificacoes', icon: Bell, enabled: false },
  { label: 'Segurança', href: '/settings/seguranca', icon: Shield, enabled: false },
  { label: 'Plano', href: '/settings/plano', icon: CreditCard, enabled: false },
  { label: 'Privacidade', href: '/settings/privacidade', icon: Lock, enabled: false },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-border bg-card">
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Configurações</h2>
        </div>

        <nav className="p-2 space-y-0.5">
          {SETTINGS_SECTIONS.map((section) => {
            const isActive =
              pathname === section.href ||
              pathname.startsWith(section.href + '/');

            return (
              <Link
                key={section.href}
                href={section.enabled ? section.href : '#'}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : section.enabled
                      ? 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      : 'text-muted-foreground/50 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!section.enabled) e.preventDefault();
                }}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span>{section.label}</span>
                {!section.enabled && (
                  <span className="ml-auto text-[10px] text-muted-foreground/50">
                    Em breve
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
