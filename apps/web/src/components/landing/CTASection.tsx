'use client';

import { motion } from 'framer-motion';
import { IconDownload, IconBrandGithub } from '@tabler/icons-react';
import { AnimatedCat } from './AnimatedCat';

export function CTASection() {
  return (
    <section className="relative py-20 sm:py-28 px-4 bg-[#09090b] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, #2A8F9D08 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <AnimatedCat className="w-20 h-20" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4"
        >
          Pronto para ter o melhor assistente de TI?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <a
            href="https://github.com/ScryLk/teki/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#2A8F9D] hover:bg-[#238490] text-white font-medium transition-all shadow-lg shadow-[#2A8F9D]/20 hover:shadow-[#2A8F9D]/30"
          >
            <IconDownload size={20} />
            Baixar Teki Grátis
          </a>
          <a
            href="https://github.com/ScryLk/teki"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] font-medium border border-[#3f3f46] transition-all"
          >
            <IconBrandGithub size={20} />
            GitHub
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-sm text-[#71717a]"
        >
          Open source &middot; MIT License &middot; Made in Brasil
        </motion.p>
      </div>
    </section>
  );
}
