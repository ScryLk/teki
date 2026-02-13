'use client';

import { useEffect, useState } from 'react';
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

  // Sort to put user's OS first
  const sortedDownloads = [...downloads].sort((a, b) => {
    if (a.os === userOS) return -1;
    if (b.os === userOS) return 1;
    return 0;
  });

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
