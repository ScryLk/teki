'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  {
    title: 'Início',
    items: [
      { label: 'Introdução', href: '/docs' },
      { label: 'Quickstart', href: '/docs/quickstart' },
    ],
  },
  {
    title: 'API',
    items: [
      { label: 'Autenticação', href: '/docs/authentication' },
      { label: 'Chat', href: '/docs/chat' },
      { label: 'Modelos', href: '/docs/models' },
      { label: 'Agentes', href: '/docs/agents' },
      { label: 'Base de Conhecimento', href: '/docs/knowledge-base' },
    ],
  },
  {
    title: 'Integrações',
    items: [
      { label: 'OpenClaw', href: '/docs/openclaw' },
      { label: 'Webhooks', href: '/docs/webhooks' },
    ],
  },
  {
    title: 'Referência',
    items: [
      { label: 'Limites', href: '/docs/rate-limits' },
      { label: 'Erros', href: '/docs/errors' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-[#3f3f46]/40 bg-[#0f0f12] min-h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <nav className="p-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider mb-2">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-1.5 rounded-md text-sm transition-all ${
                        active
                          ? 'text-[#2A8F9D] bg-[#2A8F9D]/10 border-l-2 border-[#2A8F9D] pl-[10px]'
                          : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
