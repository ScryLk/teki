'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconMenu2, IconX } from '@tabler/icons-react';

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Screenshots', href: '#demo' },
  { label: 'FAQ', href: '#faq' },
  { label: 'GitHub', href: 'https://github.com/ScryLk/teki', external: true },
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 32 32" className="w-8 h-8" aria-hidden="true">
                <circle cx="16" cy="18" r="10" fill="#27272a" />
                <polygon points="8,12 4,2 13,9" fill="#27272a" />
                <polygon points="24,12 28,2 19,9" fill="#27272a" />
                <circle cx="12" cy="16" r="2" fill="#17c964" />
                <circle cx="20" cy="16" r="2" fill="#17c964" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#fafafa]">Teki</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors rounded-md"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#download"
              className="ml-3 px-5 py-2 text-sm font-medium text-white bg-[#2A8F9D] hover:bg-[#238490] rounded-full transition-colors"
            >
              Baixar
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-[#3f3f46]/40 pt-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#download"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-5 py-2.5 text-sm font-medium text-white bg-[#2A8F9D] hover:bg-[#238490] rounded-full transition-colors text-center"
            >
              Baixar
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
