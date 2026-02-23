'use client';

import { motion } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import { AnimatedCat } from './AnimatedCat';

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #09090b 0%, #0d1f22 50%, #09090b 100%)',
      }}
    >
      {/* Subtle background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#2A8F9D]"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.08 + Math.random() * 0.12,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #2A8F9D10 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Cat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mb-6"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      >
        <AnimatedCat className="w-32 h-32 sm:w-40 sm:h-40" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#fafafa] tracking-tight text-center"
        style={{ textShadow: '0 0 40px #2A8F9D30' }}
      >
        <span className="block">Seu suporte técnico</span>
        <span className="block bg-gradient-to-r from-[#2A8F9D] to-[#0EA5E9] bg-clip-text text-transparent">
          com IA que vê a tela.
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 mt-6 text-lg sm:text-xl text-[#a1a1aa] text-center max-w-xl"
      >
        Assistente de TI que analisa screenshots, consulta sua
        base de conhecimento e responde no WhatsApp.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-3"
      >
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#2A8F9D] hover:bg-[#238490] text-white font-medium transition-all shadow-lg shadow-[#2A8F9D]/20 hover:shadow-[#2A8F9D]/30 text-sm"
        >
          Começar grátis
        </Link>
        <a
          href="#demo"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] font-medium transition-all text-sm"
        >
          Ver demonstração ↓
        </a>
      </motion.div>

      {/* Trust badges */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 mt-5 text-xs text-[#71717a]"
      >
        ✓ Sem cartão de crédito &nbsp;&middot;&nbsp; ✓ 50 mensagens grátis
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.75 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-xs text-[#71717a]">Scroll para conhecer</span>
        <IconChevronDown
          size={20}
          className="text-[#71717a]"
          style={{ animation: 'scroll-bounce 2s ease-in-out infinite' }}
        />
      </motion.div>
    </section>
  );
}
