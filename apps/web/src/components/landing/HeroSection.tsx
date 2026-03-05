'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconArrowRight, IconPlayerPlay } from '@tabler/icons-react';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE = 1.5;
    video.style.transition = `opacity ${FADE}s ease`;

    const onTime = () => {
      if (video.duration - video.currentTime <= FADE) {
        video.style.opacity = '0';
      }
    };

    const onSeek = () => {
      if (video.currentTime < 1) {
        requestAnimationFrame(() => {
          video.style.opacity = '0.2';
        });
      }
    };

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('seeked', onSeek);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('seeked', onSeek);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-16 overflow-hidden">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        style={{ zIndex: -2 }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: -1,
          background: [
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(42,143,157,0.06) 0%, transparent 60%)',
            'linear-gradient(to bottom, rgba(7,9,11,0.4) 0%, rgba(7,9,11,0.2) 40%, rgba(7,9,11,0.6) 75%, #07090b 100%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative z-[1] inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm text-xs font-medium text-[#8a919c] mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#34D8C0] animate-pulse" />
        Novo: Base de conhecimento com IA
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-[1] font-extrabold tracking-[-0.04em] leading-[1.05] max-w-[1000px] mb-6 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl"
      >
        Atendimento<br />
        <span className="font-serif italic font-medium text-[#34D8C0]">inteligente</span>,<br />
        <span className="text-[#2A8F9D]">humanizado</span> por IA
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="relative z-[1] text-lg sm:text-xl text-[#8a919c] max-w-lg leading-relaxed mb-10"
      >
        Transforme conversas em conhecimento. O Teki conecta IA ao seu time
        para resolver tickets mais rápido e nunca perder contexto.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-[1] flex flex-col sm:flex-row items-center gap-3"
      >
        <Link
          href="/register"
          className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-[#2A8F9D] text-white font-semibold transition-all hover:bg-[#34D8C0] hover:shadow-[0_0_30px_rgba(42,143,157,0.3),0_0_80px_rgba(42,143,157,0.1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          Testar grátis
          <IconArrowRight size={16} />
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 h-14 px-8 rounded-full bg-white/[0.05] border border-white/10 text-[#f0eeeb] font-medium transition-all hover:bg-white/10 hover:border-white/[0.18] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          <IconPlayerPlay size={16} />
          Ver demo
        </a>
      </motion.div>
    </section>
  );
}
