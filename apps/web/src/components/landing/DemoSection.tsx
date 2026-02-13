'use client';

import { motion } from 'framer-motion';

export function DemoSection() {
  return (
    <section id="demo" className="py-20 sm:py-28 px-4 bg-[#0f0f12]">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-12"
        >
          Veja o Teki em ação
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Window frame */}
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

            {/* App mockup content */}
            <div className="flex min-h-[360px] sm:min-h-[420px]">
              {/* Sidebar - Context Panel */}
              <div className="hidden sm:flex w-64 border-r border-[#3f3f46] flex-col p-4 gap-3">
                <div className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide mb-1">
                  Contexto
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="text-[10px] text-[#71717a] mb-1">Sistema</div>
                    <div className="h-8 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 flex items-center text-xs text-[#a1a1aa]">
                      SAP ERP
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71717a] mb-1">Versão</div>
                    <div className="h-8 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 flex items-center text-xs text-[#a1a1aa]">
                      7.0 EHP8
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71717a] mb-1">Mensagem de Erro</div>
                    <div className="h-16 rounded-md bg-[#27272a] border border-[#3f3f46] px-2 py-1.5 text-xs text-[#f31260]/80">
                      Timeout na conexão RFC
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#71717a] mb-1">Ambiente</div>
                    <div className="h-8 rounded-md bg-[#2A8F9D]/10 border border-[#2A8F9D]/30 px-2 flex items-center text-xs text-[#2A8F9D]">
                      Produção
                    </div>
                  </div>
                </div>

                {/* Mini cat */}
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

              {/* Chat area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-[#2A8F9D]/15 border border-[#2A8F9D]/25 rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-xs text-[#fafafa]">
                        Usuário relata erro de timeout no SAP ao tentar gerar relatório FI.
                      </p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2A8F9D]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <circle cx="12" cy="14" r="6" fill="#2A8F9D" />
                        <polygon points="7,10 5,4 10,8" fill="#2A8F9D" />
                        <polygon points="17,10 19,4 14,8" fill="#2A8F9D" />
                      </svg>
                    </div>
                    <div className="bg-[#27272a] rounded-lg px-3 py-2 max-w-[85%]">
                      <p className="text-xs text-[#fafafa] font-medium mb-1.5">Diagnóstico - Timeout RFC no SAP</p>
                      <div className="text-[11px] text-[#a1a1aa] space-y-1">
                        <p>1. Verifique a transação <span className="font-jetbrains text-[#2A8F9D]">SM21</span> para logs do sistema</p>
                        <p>2. Cheque conexões RFC em <span className="font-jetbrains text-[#2A8F9D]">SM59</span></p>
                        <p>3. Analise o work process via <span className="font-jetbrains text-[#2A8F9D]">SM50</span></p>
                      </div>
                      <div className="mt-2 pt-1.5 border-t border-[#3f3f46]">
                        <p className="text-[10px] text-[#71717a]">Fonte: KB-2847 &middot; Confiança: 94%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[#3f3f46]">
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 rounded-md bg-[#27272a] border border-[#3f3f46] px-3 flex items-center text-xs text-[#71717a]">
                      Descreva o problema do usuário...
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
        </motion.div>
      </div>
    </section>
  );
}
