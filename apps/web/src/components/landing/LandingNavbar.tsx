'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Docs', href: '/docs' },
  { label: 'FAQ', href: '#faq' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#09090b]/90 backdrop-blur-xl border-[#3f3f46]/40 shadow-lg shadow-black/20'
          : 'bg-[#09090b]/80 backdrop-blur-md border-[#3f3f46]/25'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors rounded-md"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              className="ml-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2A8F9D] hover:bg-[#238490] text-white text-sm font-medium transition-all"
            >
              Entrar
            </Link>
          </nav>

          {/* Mobile: Entrar + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#2A8F9D] hover:bg-[#238490] text-white text-sm font-medium transition-all"
            >
              Entrar
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {menuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-[#3f3f46]/40 pt-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] rounded-md transition-colors"
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
