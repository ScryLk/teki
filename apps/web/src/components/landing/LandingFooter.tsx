'use client';

const footerLinks = {
  Links: [
    { label: 'Recursos', href: '#recursos' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Changelog', href: 'https://github.com/ScryLk/teki/releases', external: true },
  ],
  Comunidade: [
    { label: 'GitHub', href: 'https://github.com/ScryLk/teki', external: true },
    { label: 'Contribuir', href: 'https://github.com/ScryLk/teki/blob/main/README.md', external: true },
    { label: 'Discussions', href: 'https://github.com/ScryLk/teki/discussions', external: true },
  ],
  Contato: [
    { label: 'GitHub Issues', href: 'https://github.com/ScryLk/teki/issues', external: true },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-[#09090b] border-t border-[#3f3f46] pt-12 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden="true">
                <circle cx="16" cy="18" r="10" fill="#27272a" />
                <polygon points="8,12 4,2 13,9" fill="#27272a" />
                <polygon points="24,12 28,2 19,9" fill="#27272a" />
                <circle cx="12" cy="16" r="2" fill="#17c964" />
                <circle cx="20" cy="16" r="2" fill="#17c964" />
              </svg>
              <span className="text-lg font-bold text-[#fafafa]">Teki</span>
            </div>
            <p className="text-sm text-[#71717a] max-w-[240px]">
              Assistente IA para Suporte Técnico
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-[#fafafa] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-[#a1a1aa] hover:text-[#2A8F9D] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#3f3f46] pt-6">
          <p className="text-xs text-[#71717a] text-center">
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/ScryLk/teki"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2A8F9D] transition-colors"
            >
              Teki by ScryLk
            </a>
            . MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
