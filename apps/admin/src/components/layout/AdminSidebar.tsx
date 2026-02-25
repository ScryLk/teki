'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Activity,
  FileText,
  Globe,
  Users,
  Building2,
  BarChart3,
  MessageSquareWarning,
  Sparkles,
  CreditCard,
  Flag,
  Megaphone,
  ClipboardList,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    title: 'Visao Geral',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Monitoramento', href: '/monitoring', icon: Activity },
    ],
  },
  {
    title: 'Operacional',
    items: [
      { label: 'Logs', href: '/logs', icon: FileText },
      { label: 'Requisicoes HTTP', href: '/requests', icon: Globe },
    ],
  },
  {
    title: 'Gestao',
    items: [
      { label: 'Usuarios', href: '/users', icon: Users },
      { label: 'Tenants', href: '/tenants', icon: Building2 },
    ],
  },
  {
    title: 'Inteligencia',
    items: [
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Query Expansion', href: '/query-expansion', icon: Sparkles },
      { label: 'Feedback Negativo', href: '/feedback', icon: MessageSquareWarning },
    ],
  },
  {
    title: 'Configuracao',
    items: [
      { label: 'Planos', href: '/plans', icon: CreditCard },
      { label: 'Feature Flags', href: '/flags', icon: Flag },
      { label: 'Broadcast', href: '/broadcast', icon: Megaphone },
      { label: 'Audit Log', href: '/audit', icon: ClipboardList },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border flex-shrink-0">
        <Shield className="w-6 h-6 text-primary flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
            Teki Admin
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
