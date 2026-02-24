'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type CatState =
  | 'idle'
  | 'watching'
  | 'thinking'
  | 'happy'
  | 'alert'
  | 'sleeping'
  | 'password';

interface AuthCatMascotProps {
  state?: CatState;
  className?: string;
}

/**
 * Auth-specific cat mascot with contextual states.
 * 'password' state covers the cat's eyes with paws.
 */
export function AuthCatMascot({
  state = 'idle',
  className = '',
}: AuthCatMascotProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 200 200"
        className="h-28 w-28"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Teki mascote"
        animate={
          state === 'sleeping'
            ? { y: [0, -3, 0] }
            : state === 'happy'
              ? { rotate: [0, -2, 2, 0] }
              : state === 'alert'
                ? { scale: [1, 1.03, 1] }
                : {}
        }
        transition={{
          duration: state === 'sleeping' ? 3 : 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          <radialGradient id="authBodyGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#34D8C0" />
            <stop offset="55%" stopColor="#2A8F9D" />
            <stop offset="100%" stopColor="#1E6B75" />
          </radialGradient>
          <radialGradient id="authHeadGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#3EEBD0" />
            <stop offset="55%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#1F7A85" />
          </radialGradient>
          <radialGradient id="authEyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#17c964" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#17c964" stopOpacity="0" />
          </radialGradient>
          <filter id="authGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tail */}
        <motion.g
          style={{ transformOrigin: '145px 155px' }}
          animate={
            state === 'happy'
              ? { rotate: [-8, 8, -8] }
              : { rotate: [-3, 3, -3] }
          }
          transition={{
            duration: state === 'happy' ? 0.4 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M 145 155 Q 175 140 180 110 Q 185 90 175 80"
            fill="none"
            stroke="#2A8F9D"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.85"
          />
        </motion.g>

        {/* Body */}
        <ellipse
          cx="100"
          cy="160"
          rx="42"
          ry="32"
          fill="url(#authBodyGrad)"
        />

        {/* Belly */}
        <ellipse
          cx="100"
          cy="155"
          rx="22"
          ry="16"
          fill="#34D8C0"
          opacity="0.25"
        />

        {/* Front paws (normal position) */}
        <AnimatePresence>
          {state !== 'password' && (
            <>
              <motion.ellipse
                cx="76"
                cy="177"
                rx="10"
                ry="6"
                fill="#2A8F9D"
                initial={false}
                animate={{ cx: 76, cy: 177 }}
              />
              <motion.ellipse
                cx="124"
                cy="177"
                rx="10"
                ry="6"
                fill="#2A8F9D"
                initial={false}
                animate={{ cx: 124, cy: 177 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Head */}
        <circle cx="100" cy="105" r="37" fill="url(#authHeadGrad)" />

        {/* Ears */}
        <polygon points="72,82 60,50 85,72" fill="#2A8F9D" />
        <polygon points="75,78 66,56 83,74" fill="#1E6B75" />
        <polygon points="128,82 140,50 115,72" fill="#2A8F9D" />
        <polygon points="125,78 134,56 117,74" fill="#1E6B75" />

        {/* Eyes — hidden in password and sleeping states */}
        {state !== 'password' && state !== 'sleeping' && (
          <>
            <circle cx="86" cy="100" r="14" fill="url(#authEyeGlow)" />
            <circle cx="114" cy="100" r="14" fill="url(#authEyeGlow)" />

            {/* Eye pupils */}
            <motion.g
              animate={
                state === 'watching'
                  ? { x: [0, 2, 0, -2, 0] }
                  : state === 'thinking'
                    ? { x: [0, 3, 3, 0] }
                    : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ellipse
                cx="86"
                cy="100"
                rx="7"
                ry="7.5"
                fill="#17c964"
                filter="url(#authGlow)"
              />
              <ellipse cx="86" cy="100" rx="2.5" ry="5" fill="#09090b" />
              <circle cx="89" cy="97" r="1.8" fill="#ffffff" opacity="0.7" />

              <ellipse
                cx="114"
                cy="100"
                rx="7"
                ry="7.5"
                fill="#17c964"
                filter="url(#authGlow)"
              />
              <ellipse cx="114" cy="100" rx="2.5" ry="5" fill="#09090b" />
              <circle cx="117" cy="97" r="1.8" fill="#ffffff" opacity="0.7" />
            </motion.g>
          </>
        )}

        {/* Sleeping eyes — horizontal lines */}
        {state === 'sleeping' && (
          <>
            <line
              x1="80"
              y1="100"
              x2="92"
              y2="100"
              stroke="#1E6B75"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="108"
              y1="100"
              x2="120"
              y2="100"
              stroke="#1E6B75"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Zzz */}
            <motion.text
              x="140"
              y="85"
              fill="#2A8F9D"
              fontSize="12"
              fontWeight="bold"
              animate={{ opacity: [0, 1, 0], y: [85, 75, 65] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              z
            </motion.text>
          </>
        )}

        {/* Password state — paws covering eyes */}
        {state === 'password' && (
          <>
            <motion.ellipse
              cx="86"
              cy="100"
              rx="14"
              ry="10"
              fill="#2A8F9D"
              initial={{ cy: 177, cx: 76 }}
              animate={{ cy: 100, cx: 86 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <motion.ellipse
              cx="114"
              cy="100"
              rx="14"
              ry="10"
              fill="#2A8F9D"
              initial={{ cy: 177, cx: 124 }}
              animate={{ cy: 100, cx: 114 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </>
        )}

        {/* Nose */}
        <polygon points="100,112 97,116 103,116" fill="#1E6B75" />

        {/* Mouth — changes per state */}
        {state === 'happy' ? (
          <path
            d="M 90 118 Q 100 126 110 118"
            fill="none"
            stroke="#1E6B75"
            strokeWidth="1.5"
          />
        ) : state === 'alert' ? (
          <ellipse cx="100" cy="120" rx="3" ry="2" fill="#1E6B75" />
        ) : (
          <path
            d="M 93 118 Q 100 123 107 118"
            fill="none"
            stroke="#1E6B75"
            strokeWidth="1.2"
          />
        )}

        {/* Whiskers */}
        <line
          x1="60"
          y1="108"
          x2="80"
          y2="112"
          stroke="#1E6B75"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <line
          x1="58"
          y1="115"
          x2="79"
          y2="115"
          stroke="#1E6B75"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <line
          x1="120"
          y1="112"
          x2="140"
          y2="108"
          stroke="#1E6B75"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <line
          x1="121"
          y1="115"
          x2="142"
          y2="115"
          stroke="#1E6B75"
          strokeWidth="0.8"
          opacity="0.7"
        />
      </motion.svg>
    </div>
  );
}
