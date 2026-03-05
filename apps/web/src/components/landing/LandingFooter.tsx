'use client';

import Link from 'next/link';

const links = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Preços', href: '#planos' },
  { label: 'Docs', href: '/docs' },
  { label: 'Termos', href: '/termos' },
  { label: 'Privacidade', href: '/privacidade' },
  { label: 'Contato', href: 'mailto:contato@teki.com.br' },
];

export function LandingFooter() {
  return (
    <footer className="relative z-[1] border-t border-white/[0.05] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A8F9D]" />
            teki
          </Link>
          <span className="text-xs text-[#4a5060]">
            &copy; 2026 Teki. Todos os direitos reservados.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#4a5060] hover:text-[#f0eeeb] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
