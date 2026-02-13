'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IconDownload, IconBrandWindows, IconBrandApple, IconBrandUbuntu, IconChevronDown } from '@tabler/icons-react';
import { AnimatedCat } from './AnimatedCat';

type OS = 'windows' | 'macos' | 'linux' | 'unknown';

function getOS(): OS {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'windows';
  if (ua.includes('mac')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  return 'unknown';
}

// Pre-computed particle positions to avoid hydration mismatch
const particles = [
  { w: 3.1, top: 12, left: 8, op: 0.1, dur: 7.2, delay: 1.3 },
  { w: 2.4, top: 28, left: 92, op: 0.15, dur: 6.1, delay: 0.5 },
  { w: 4.2, top: 45, left: 23, op: 0.09, dur: 8.5, delay: 2.7 },
  { w: 2.8, top: 67, left: 78, op: 0.12, dur: 5.8, delay: 4.1 },
  { w: 3.5, top: 82, left: 45, op: 0.08, dur: 9.3, delay: 0.8 },
  { w: 2.1, top: 15, left: 55, op: 0.14, dur: 6.7, delay: 3.2 },
  { w: 4.0, top: 38, left: 71, op: 0.11, dur: 7.9, delay: 1.9 },
  { w: 2.6, top: 53, left: 12, op: 0.13, dur: 5.4, delay: 4.6 },
  { w: 3.3, top: 91, left: 34, op: 0.09, dur: 8.1, delay: 2.1 },
  { w: 2.9, top: 7, left: 67, op: 0.16, dur: 6.3, delay: 3.8 },
  { w: 3.7, top: 74, left: 89, op: 0.10, dur: 7.5, delay: 0.2 },
  { w: 2.3, top: 41, left: 4, op: 0.12, dur: 9.0, delay: 2.4 },
  { w: 4.1, top: 59, left: 51, op: 0.08, dur: 6.9, delay: 4.3 },
  { w: 2.7, top: 23, left: 38, op: 0.15, dur: 5.6, delay: 1.7 },
  { w: 3.4, top: 86, left: 62, op: 0.11, dur: 8.3, delay: 3.5 },
  { w: 2.2, top: 33, left: 85, op: 0.13, dur: 7.1, delay: 0.9 },
  { w: 3.8, top: 71, left: 19, op: 0.09, dur: 5.2, delay: 4.8 },
  { w: 2.5, top: 49, left: 96, op: 0.14, dur: 8.7, delay: 2.0 },
  { w: 3.0, top: 5, left: 42, op: 0.10, dur: 6.5, delay: 3.0 },
  { w: 4.3, top: 62, left: 27, op: 0.12, dur: 7.7, delay: 1.1 },
];

const downloads = [
  {
    os: 'windows' as OS,
    label: 'Download para Windows',
    icon: IconBrandWindows,
    ext: '.exe',
  },
  {
    os: 'macos' as OS,
    label: 'Download para macOS',
    icon: IconBrandApple,
    ext: '.dmg',
  },
  {
    os: 'linux' as OS,
    label: 'Linux (.deb)',
    icon: IconBrandUbuntu,
    ext: '.deb',
  },
];

export function HeroSection() {
  const [userOS, setUserOS] = useState<OS>('unknown');

  useEffect(() => {
    setUserOS(getOS());
  }, []);

  const sortedDownloads = useMemo(
    () =>
      [...downloads].sort((a, b) => {
        if (a.os === userOS) return -1;
        if (b.os === userOS) return 1;
        return 0;
      }),
    [userOS],
  );

  return (
    <section
      id="download"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #09090b 0%, #0d1f22 50%, #09090b 100%)',
      }}
    >
      {/* Subtle background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#2A8F9D]"
            style={{
              width: `${p.w}px`,
              height: `${p.w}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.op,
              animation: `float ${p.dur}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
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
        className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#fafafa] tracking-tight"
        style={{ textShadow: '0 0 40px #2A8F9D30' }}
      >
        Teki
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 mt-4 text-xl sm:text-2xl font-semibold text-[#a1a1aa] text-center"
      >
        Seu assistente IA para suporte técnico
      </motion.p>

      {/* Description lines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="relative z-10 mt-6 flex flex-col items-center gap-1.5 text-center"
      >
        <p className="text-[#71717a] text-base sm:text-lg">
          Diagnósticos inteligentes em tempo real.
        </p>
        <p className="text-[#71717a] text-base sm:text-lg">
          Busca em base de conhecimento em menos de{' '}
          <span className="font-jetbrains text-[#2A8F9D] font-medium">50ms</span>.
        </p>
        <p className="text-[#71717a] text-base sm:text-lg">
          Um gato que observa sua tela e te ajuda.
        </p>
      </motion.div>

      {/* Download Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative z-10 mt-10 flex flex-col sm:flex-row items-center gap-3"
      >
        {sortedDownloads.map((dl, idx) => {
          const isPrimary = dl.os === userOS || (userOS === 'unknown' && idx === 0);
          return (
            <a
              key={dl.os}
              href="https://github.com/ScryLk/teki/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                isPrimary
                  ? 'bg-[#2A8F9D] hover:bg-[#238490] text-white shadow-lg shadow-[#2A8F9D]/20'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] border border-[#3f3f46]'
              }`}
            >
              <dl.icon size={18} />
              <IconDownload size={14} />
              {dl.label}
            </a>
          );
        })}
      </motion.div>

      {/* Version badge */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.75 }}
        className="relative z-10 mt-5 text-xs text-[#71717a] font-jetbrains"
      >
        v1.0.0 &middot; ~85MB &middot; Windows 10+, macOS 12+, Linux
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
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
