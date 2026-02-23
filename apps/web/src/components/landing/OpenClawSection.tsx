'use client';

import { motion } from 'framer-motion';
import {
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconBrandDiscord,
  IconBrandSlack,
  IconCamera,
  IconUsers,
  IconMoon,
} from '@tabler/icons-react';

const channels = [
  { icon: IconBrandWhatsapp, name: 'WhatsApp', color: '#25D366' },
  { icon: IconBrandTelegram, name: 'Telegram', color: '#2AABEE' },
  { icon: IconBrandDiscord, name: 'Discord', color: '#5865F2' },
  { icon: IconBrandSlack, name: 'Slack', color: '#E01E5A' },
];

const scenarios = [
  {
    icon: IconCamera,
    title: 'Técnico em campo',
    description: 'Tire foto do erro, mande no WhatsApp. Solução em 10 segundos.',
  },
  {
    icon: IconUsers,
    title: 'Equipe de TI',
    description: 'Adicione @teki no grupo. Qualquer técnico pergunta direto ali.',
  },
  {
    icon: IconMoon,
    title: 'Plantão noturno',
    description: '3h da manhã, alerta de servidor. Teki responde no Telegram.',
  },
];

export function OpenClawSection() {
  return (
    <section className="py-20 sm:py-28 px-4 bg-[#09090b] relative overflow-hidden">
      {/* Badge PRO */}
      <div className="absolute top-8 right-8 hidden sm:block">
        <span className="text-xs font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 border border-[#2A8F9D]/30 px-3 py-1 rounded-full">
          PLANO PRO
        </span>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
            Seu suporte técnico no bolso.
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-xl mx-auto">
            Receba respostas do Teki direto no seu app de mensagens favorito.
          </p>
        </motion.div>

        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center gap-6 sm:gap-10 mb-16"
        >
          {channels.map((ch) => (
            <div key={ch.name} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${ch.color}18`, border: `1px solid ${ch.color}30` }}
              >
                <ch.icon size={28} style={{ color: ch.color }} />
              </div>
              <span className="text-xs text-[#71717a]">{ch.name}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
          {/* WhatsApp mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-sm"
          >
            <div className="rounded-3xl bg-[#18181b] border border-[#3f3f46] overflow-hidden shadow-2xl shadow-black/50">
              {/* Phone top bar */}
              <div className="bg-[#25D366]/10 border-b border-[#3f3f46] px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                  <IconBrandWhatsapp size={18} className="text-[#25D366]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#fafafa]">Teki Bot</div>
                  <div className="text-[10px] text-[#25D366]">online</div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[260px] bg-[#0f0f12]">
                {/* User message with image */}
                <div className="flex justify-end">
                  <div className="bg-[#25D366]/15 border border-[#25D366]/20 rounded-xl rounded-tr-sm px-3 py-2 max-w-[75%]">
                    <div className="w-full h-20 rounded-lg bg-[#27272a] border border-[#3f3f46] mb-1.5 flex items-center justify-center">
                      <span className="text-[10px] text-[#71717a]">📷 screenshot.jpg</span>
                    </div>
                    <p className="text-xs text-[#fafafa]">O que esse erro significa?</p>
                    <p className="text-[9px] text-[#71717a] text-right mt-0.5">14:32</p>
                  </div>
                </div>

                {/* Teki response */}
                <div className="flex justify-start">
                  <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                    <p className="text-[11px] text-[#fafafa] font-medium mb-1">
                      Erro de timeout na conexão RFC 🔍
                    </p>
                    <div className="text-[10px] text-[#a1a1aa] space-y-0.5">
                      <p>1. Acesse a transação SM59</p>
                      <p>2. Teste a conexão RFC listada</p>
                      <p>3. Verifique as credenciais</p>
                    </div>
                    <p className="text-[9px] text-[#2A8F9D] mt-1.5">
                      Fonte: runbook-rfc.pdf
                    </p>
                    <p className="text-[9px] text-[#71717a] text-right mt-0.5">14:32 ✓✓</p>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="bg-[#18181b] border-t border-[#3f3f46] px-3 py-2 flex gap-2 items-center">
                <div className="flex-1 h-8 rounded-full bg-[#27272a] border border-[#3f3f46] px-3 flex items-center">
                  <span className="text-[10px] text-[#71717a]">Mensagem</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scenarios */}
          <div className="space-y-4">
            {scenarios.map((sc, i) => (
              <motion.div
                key={sc.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-[#18181b] border border-[#3f3f46] hover:border-[#2A8F9D]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#2A8F9D]/10 border border-[#2A8F9D]/20 flex items-center justify-center flex-shrink-0">
                  <sc.icon size={20} className="text-[#2A8F9D]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#fafafa] mb-0.5">{sc.title}</h3>
                  <p className="text-xs text-[#71717a]">{sc.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="pt-2"
            >
              <a
                href="/docs/openclaw"
                className="text-sm text-[#2A8F9D] hover:underline"
              >
                Ver documentação do OpenClaw →
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
