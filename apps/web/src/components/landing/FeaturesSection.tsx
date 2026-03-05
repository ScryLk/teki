'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  IconEye,
  IconDatabase,
  IconUsers,
  IconDeviceDesktop,
  IconBrandWhatsapp,
  IconApi,
} from '@tabler/icons-react';

const features = [
  {
    icon: IconEye,
    title: 'Visão de Tela',
    description:
      'O Teki vê a janela que você está inspecionando. Analisa logs, erros e interfaces visuais com Gemini Vision em tempo real.',
  },
  {
    icon: IconDatabase,
    title: 'Base de Conhecimento',
    description:
      'Suba PDFs, manuais e documentações. O Teki consulta SUA base antes de responder — procedimentos internos, runbooks, tickets resolvidos.',
  },
  {
    icon: IconUsers,
    title: 'Agentes Personalizados',
    description:
      'Crie agentes com instruções e base de dados própria. Um pra rede, outro pro ERP, outro pro atendimento.',
  },
  {
    icon: IconDeviceDesktop,
    title: 'Desktop Nativo',
    description:
      'App pra macOS e Windows na barra de tarefas. Inspeciona qualquer janela aberta e dá suporte contextual.',
  },
  {
    icon: IconBrandWhatsapp,
    title: 'WhatsApp, Telegram & mais',
    description:
      'Receba suporte direto no celular. Tire foto do erro e mande pro Teki — ele analisa e responde na hora.',
    badge: 'PRO',
  },
  {
    icon: IconApi,
    title: 'API para Desenvolvedores',
    description:
      'Integre o Teki no seu sistema interno, ERP ou chatbot. API REST com autenticação, streaming e webhooks.',
    link: '/docs',
  },
];

export function FeaturesSection() {
  return (
    <section id="recursos" className="relative z-[1] py-20 sm:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2A8F9D] mb-3">
            Recursos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tudo que seu time precisa,<br />em um só lugar
          </h2>
          <p className="text-lg text-[#8a919c] max-w-xl mx-auto leading-relaxed">
            Do primeiro contato à resolução final — IA que aprende com cada conversa
            e potencializa seu atendimento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="group relative rounded-[28px] bg-white/[0.03] border border-white/[0.05] p-7 transition-all duration-500 hover:border-[#2A8F9D]/20 hover:-translate-y-1 hover:bg-white/[0.06] overflow-hidden flex flex-col"
            >
              {/* Glow line on top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A8F9D]/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {feature.badge && (
                <span className="absolute top-5 right-5 text-[10px] font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 border border-[#2A8F9D]/20 px-2 py-0.5 rounded-full">
                  {feature.badge}
                </span>
              )}

              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#2A8F9D]/[0.06] border border-[#2A8F9D]/[0.12] mb-5">
                <feature.icon size={24} className="text-[#34D8C0]" stroke={1.5} />
              </div>

              <h3 className="text-lg font-semibold mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-[#8a919c] leading-relaxed flex-1">{feature.description}</p>

              {feature.link && (
                <Link href={feature.link} className="mt-4 text-xs text-[#2A8F9D] hover:underline">
                  Ver documentação →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
