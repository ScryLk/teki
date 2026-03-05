'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { IconCheck } from '@tabler/icons-react';

const showcases = [
  {
    label: 'Fluxo inteligente',
    title: 'Cada conversa vira aprendizado',
    description:
      'O Teki analisa cada interação, extrai padrões e alimenta sua base de conhecimento automaticamente. Quanto mais seu time atende, mais inteligente o sistema fica.',
    items: [
      'Sugestões de resposta em tempo real',
      'Criação automática de artigos KB',
      'Detecção de intenção do cliente',
      'Histórico completo com contexto',
    ],
    image: '/showcase-desktop.png',
    alt: 'Teki Desktop — interface de atendimento inteligente',
    reverse: false,
  },
  {
    label: 'Desktop & Mobile',
    title: 'Presente onde seu time está',
    description:
      'App nativo para desktop com notificações inteligentes, tray popup para respostas rápidas e interface responsiva para qualquer tela.',
    items: [
      'App desktop nativo (Windows, Mac, Linux)',
      'Notificações push inteligentes',
      'Modo offline com sincronização',
      'Atalhos de teclado para power users',
    ],
    image: '/showcase-mobile.png',
    alt: 'Teki Desktop — atendimento em qualquer plataforma',
    reverse: true,
  },
];

export function ShowcaseSection() {
  return (
    <div className="relative z-[1]" id="how-it-works">
      {showcases.map((item, idx) => (
        <section key={idx} className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
              item.reverse ? 'lg:[direction:rtl]' : ''
            }`}
          >
            <div className={item.reverse ? 'lg:[direction:ltr]' : ''}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2A8F9D] mb-4">
                {item.label}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug mb-4">
                {item.title}
              </h2>
              <p className="text-base text-[#8a919c] leading-relaxed mb-6">{item.description}</p>
              <ul className="flex flex-col gap-3">
                {item.items.map((text) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-[#8a919c]">
                    <span className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#2A8F9D]/8 border border-[#2A8F9D]/15 shrink-0">
                      <IconCheck size={12} className="text-[#34D8C0]" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`rounded-[28px] overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${item.reverse ? 'lg:[direction:ltr]' : ''}`}>
              <Image
                src={item.image}
                alt={item.alt}
                width={800}
                height={500}
                className="w-full"
                loading="lazy"
              />
            </div>
          </motion.div>
        </section>
      ))}
    </div>
  );
}
