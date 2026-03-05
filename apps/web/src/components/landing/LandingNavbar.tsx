'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#how-it-works' },
  { label: 'Docs', href: '/docs' },
  { label: 'Preços', href: '#planos' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? 'bg-[#07090b]/75 backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-[#2A8F9D] shadow-[0_0_12px_rgba(42,143,157,0.25)]" />
            teki
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm text-[#4a5060] hover:text-[#f0eeeb] transition-colors font-medium tracking-wide"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/register"
              className="ml-4 inline-flex items-center h-10 px-5 rounded-full bg-white/[0.08] border border-white/10 text-sm font-semibold text-[#f0eeeb] transition-all hover:bg-white/[0.14] hover:border-white/[0.18] active:scale-[0.97]"
            >
              Começar agora
            </Link>
          </nav>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-sm font-semibold text-[#f0eeeb] transition-all"
            >
              Começar
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#8a919c] hover:text-[#f0eeeb] transition-colors"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-white/[0.05] pt-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-[#8a919c] hover:text-[#f0eeeb] hover:bg-white/[0.04] rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
