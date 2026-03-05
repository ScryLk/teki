'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

export function CTASection() {
  return (
    <section className="relative z-[1] py-20 sm:py-28 px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-[28px] bg-white/[0.03] border border-[#2A8F9D]/20 py-16 sm:py-24 px-6 sm:px-10 text-center"
      >
        {/* Radial glow */}
        <div
          className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(42,143,157,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <h2 className="relative z-[1] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
          Pronto para transformar<br />seu atendimento?
        </h2>
        <p className="relative z-[1] text-lg text-[#8a919c] max-w-md mx-auto leading-relaxed mb-8">
          Comece grátis, sem cartão de crédito. Configure em minutos,
          veja resultados em horas.
        </p>
        <div className="relative z-[1] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-[#2A8F9D] text-white font-semibold transition-all hover:bg-[#34D8C0] hover:shadow-[0_0_30px_rgba(42,143,157,0.3),0_0_80px_rgba(42,143,157,0.1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Começar agora — grátis
            <IconArrowRight size={16} />
          </Link>
          <a
            href="mailto:contato@teki.com.br"
            className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-white/[0.05] border border-white/10 text-[#f0eeeb] font-medium transition-all hover:bg-white/10 hover:border-white/[0.18] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Falar com vendas
          </a>
        </div>
      </motion.div>
    </section>
  );
}
