'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Tab = 'web' | 'desktop' | 'whatsapp';

const tabs: { id: Tab; label: string }[] = [
  { id: 'web', label: 'Web' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'whatsapp', label: 'WhatsApp' },
];

function WebMockup() {
  return (
    <div className="rounded-xl border border-[#3f3f46] bg-[#18181b] shadow-2xl shadow-black/40 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#18181b] border-b border-[#3f3f46]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f31260]" />
          <div className="w-3 h-3 rounded-full bg-[#f5a524]" />
          <div className="w-3 h-3 rounded-full bg-[#17c964]" />
        </div>
        <span className="ml-2 text-xs text-[#71717a]">Teki — Assistente IA</span>
      </div>

      <div className="flex min-h-[360px] sm:min-h-[420px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-64 border-r border-[#3f3f46] flex-col p-4 gap-3">
          <div className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide mb-1">
            Contexto
          </div>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] text-[#71717a] mb-1">Sistema</div>
              <div className="h-8 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 flex items-center text-xs text-[#a1a1aa]">
                Active Directory
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#71717a] mb-1">Versão</div>
              <div className="h-8 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 flex items-center text-xs text-[#a1a1aa]">
                Windows Server 2022
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[#71717a] mb-1">Mensagem de Erro</div>
              <div className="h-16 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 py-1.5 text-xs text-[#f31260]/80">
                The trust relationship failed
              </div>
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2 pt-3 border-t border-[#3f3f46]">
            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
              <circle cx="12" cy="14" r="7" fill="#27272a" />
              <polygon points="6,10 4,3 9,8" fill="#27272a" />
              <polygon points="18,10 20,3 15,8" fill="#27272a" />
              <circle cx="10" cy="12" r="1.5" fill="#17c964" />
              <circle cx="14" cy="12" r="1.5" fill="#17c964" />
            </svg>
            <span className="text-[10px] text-[#71717a]">Observando...</span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-4 overflow-hidden">
            <div className="flex justify-end">
              <div className="bg-[#2A8F9D]/15 border border-[#2A8F9D]/25 rounded-lg px-3 py-2 max-w-[80%]">
                <p className="text-xs text-[#fafafa]">
                  Como resetar a senha do AD sem afetar o trust?
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2A8F9D]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <circle cx="12" cy="14" r="6" fill="#2A8F9D" />
                  <polygon points="7,10 5,4 10,8" fill="#2A8F9D" />
                  <polygon points="17,10 19,4 14,8" fill="#2A8F9D" />
                </svg>
              </div>
              <div className="bg-[#27272a] rounded-lg px-3 py-2 max-w-[85%]">
                <p className="text-xs text-[#fafafa] font-medium mb-1.5">Erro de Trust no AD</p>
                <div className="text-[11px] text-[#a1a1aa] space-y-1">
                  <p>1. Execute <span className="font-mono text-[#2A8F9D]">Test-ComputerSecureChannel -Repair</span></p>
                  <p>2. Reinicie o serviço Netlogon</p>
                  <p>3. Force sync com <span className="font-mono text-[#2A8F9D]">nltest /sc_reset</span></p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-[#3f3f46]">
                  <p className="text-[10px] text-[#71717a]">Fonte: runbook-ad.pdf · Confiança: 96%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-[#3f3f46]">
            <div className="flex gap-2">
              <div className="flex-1 h-9 rounded-md bg-[#27272a] border border-[#3f3f46] px-3 flex items-center text-xs text-[#71717a]">
                Descreva o problema...
              </div>
              <div className="h-9 w-9 rounded-md bg-[#2A8F9D] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopMockup() {
  return (
    <div className="rounded-xl border border-[#3f3f46] bg-[#18181b] shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#18181b] border-b border-[#3f3f46]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f31260]" />
          <div className="w-3 h-3 rounded-full bg-[#f5a524]" />
          <div className="w-3 h-3 rounded-full bg-[#17c964]" />
        </div>
        <span className="ml-2 text-xs text-[#71717a]">Terminal — bash</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-6 h-4 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
              <circle cx="12" cy="14" r="6" fill="#2A8F9D" />
              <polygon points="7,10 5,4 10,8" fill="#2A8F9D" />
              <polygon points="17,10 19,4 14,8" fill="#2A8F9D" />
            </svg>
          </div>
          <span className="text-[9px] text-[#2A8F9D]">Teki ativo</span>
        </div>
      </div>

      <div className="flex min-h-[360px] sm:min-h-[420px]">
        {/* Terminal */}
        <div className="flex-1 p-4 font-mono text-xs text-[#a1a1aa] bg-[#0f0f12] overflow-hidden">
          <p className="text-[#2A8F9D] mb-1">$ systemctl status nginx</p>
          <p className="text-[#f31260]">● nginx.service - A high performance web server</p>
          <p className="text-[#71717a]">   Loaded: loaded (/lib/systemd/...)</p>
          <p className="text-[#f31260]">   Active: failed (Result: exit-code)</p>
          <p className="text-[#71717a] mt-2">Process: ExecStart=/usr/sbin/nginx</p>
          <p className="text-[#f31260]">nginx: [emerg] bind() to 0.0.0.0:80 failed</p>
          <p className="text-[#71717a]">(98: Address already in use)</p>
          <div className="mt-3 flex items-center gap-1">
            <span className="text-[#2A8F9D]">$</span>
            <span className="w-2 h-4 bg-[#2A8F9D] animate-pulse" />
          </div>
        </div>

        {/* Teki panel */}
        <div className="w-56 border-l border-[#3f3f46] flex flex-col p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#3f3f46]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <circle cx="12" cy="14" r="6" fill="#2A8F9D" />
              <polygon points="7,10 5,4 10,8" fill="#2A8F9D" />
              <polygon points="17,10 19,4 14,8" fill="#2A8F9D" />
            </svg>
            <span className="text-[10px] font-semibold text-[#fafafa]">Teki detectou erro</span>
          </div>
          <p className="text-[10px] text-[#fafafa] font-medium mb-1.5">Porta 80 em uso</p>
          <div className="text-[9px] text-[#a1a1aa] space-y-1 flex-1">
            <p>1. Identifique o processo:</p>
            <p className="font-mono text-[#2A8F9D] bg-[#0f0f12] px-1.5 py-0.5 rounded">
              lsof -i :80
            </p>
            <p className="mt-1">2. Finalize ou mude a porta no nginx.conf</p>
          </div>
          <div className="pt-2 border-t border-[#3f3f46] text-[9px] text-[#71717a]">
            runbook-nginx.md
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppMockup() {
  return (
    <div className="mx-auto max-w-xs rounded-3xl border border-[#3f3f46] bg-[#18181b] overflow-hidden shadow-2xl shadow-black/50">
      <div className="bg-[#25D366]/10 border-b border-[#3f3f46] px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#25D366" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M11.998 0C5.373 0 0 5.373 0 12c0 2.1.544 4.074 1.498 5.786L0 24l6.345-1.666A11.946 11.946 0 0011.998 24C18.623 24 24 18.627 24 12S18.623 0 11.998 0zm0 22c-1.9 0-3.68-.51-5.21-1.4l-.37-.22-3.85 1.01 1.03-3.74-.24-.38A9.963 9.963 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
          </svg>
        </div>
        <div>
          <div className="text-xs font-semibold text-[#fafafa]">Teki Bot</div>
          <div className="text-[10px] text-[#25D366]">online</div>
        </div>
      </div>

      <div className="p-4 space-y-3 min-h-[300px] bg-[#0f0f12]">
        <div className="flex justify-end">
          <div className="bg-[#25D366]/15 border border-[#25D366]/20 rounded-xl rounded-tr-sm px-3 py-2 max-w-[78%]">
            <div className="w-full h-16 rounded-lg bg-[#27272a] border border-[#3f3f46] mb-1.5 flex items-center justify-center">
              <span className="text-[9px] text-[#71717a]">📷 erro-tela.jpg</span>
            </div>
            <p className="text-xs text-[#fafafa]">O que esse erro significa?</p>
            <p className="text-[9px] text-[#71717a] text-right mt-0.5">14:32</p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl rounded-tl-sm px-3 py-2 max-w-[82%]">
            <p className="text-[10px] text-[#fafafa] font-medium mb-1">BSOD: DRIVER_IRQL 🔍</p>
            <div className="text-[9px] text-[#a1a1aa] space-y-0.5">
              <p>Causado por driver corrompido.</p>
              <p>1. Inicie no Modo Seguro</p>
              <p>2. Execute sfc /scannow</p>
              <p>3. Atualize drivers de rede</p>
            </div>
            <p className="text-[9px] text-[#2A8F9D] mt-1">Fonte: kb-windows.pdf</p>
            <p className="text-[9px] text-[#71717a] text-right mt-0.5">14:32 ✓✓</p>
          </div>
        </div>
      </div>

      <div className="bg-[#18181b] border-t border-[#3f3f46] px-3 py-2 flex gap-2 items-center">
        <div className="flex-1 h-8 rounded-full bg-[#27272a] border border-[#3f3f46] px-3 flex items-center">
          <span className="text-[9px] text-[#71717a]">Mensagem</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>('web');

  return (
    <section id="demo" className="py-20 sm:py-28 px-4 bg-[#0f0f12]">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-8"
        >
          Veja o Teki em ação
        </motion.h2>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-1 bg-[#18181b] border border-[#3f3f46] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2A8F9D]/15 text-[#2A8F9D] border-b-2 border-[#2A8F9D]'
                    : 'text-[#71717a] hover:text-[#a1a1aa]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto max-w-4xl"
        >
          {activeTab === 'web' && <WebMockup />}
          {activeTab === 'desktop' && <DesktopMockup />}
          {activeTab === 'whatsapp' && <WhatsAppMockup />}
        </motion.div>
      </div>
    </section>
  );
}
