import Link from 'next/link';
import { DocsSidebar } from './components/DocsSidebar';

export const metadata = {
  title: 'Documentação — Teki API',
  description: 'Documentação da API do Teki. Integre suporte técnico com IA no seu sistema.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 h-14 bg-[#09090b]/90 backdrop-blur-xl border-b border-[#3f3f46]/40 flex items-center px-6">
        <span className="font-bold text-[#fafafa]">Docs</span>
        <div className="ml-auto">
          <Link href="/" className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </nav>

      <div className="flex pt-14">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-3xl mx-auto px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
