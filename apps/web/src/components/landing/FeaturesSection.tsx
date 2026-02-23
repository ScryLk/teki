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
    <section id="recursos" className="py-20 sm:py-28 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-14"
        >
          Recursos
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-xl bg-[#18181b] border border-[#3f3f46] p-6 transition-all duration-300 hover:border-[#2A8F9D]/40 hover:shadow-lg hover:shadow-[#2A8F9D]/5 hover:scale-[1.02] flex flex-col"
            >
              {feature.badge && (
                <span className="absolute top-4 right-4 text-[10px] font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 border border-[#2A8F9D]/30 px-2 py-0.5 rounded-full">
                  {feature.badge}
                </span>
              )}
              <feature.icon size={40} className="text-[#2A8F9D] mb-4" stroke={1.5} />
              <h3 className="text-lg font-bold text-[#fafafa] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed flex-1">{feature.description}</p>
              {feature.link && (
                <Link
                  href={feature.link}
                  className="mt-4 text-xs text-[#2A8F9D] hover:underline"
                >
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
