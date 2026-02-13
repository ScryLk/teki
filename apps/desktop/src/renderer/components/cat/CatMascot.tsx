import React, { useMemo } from 'react';
import type { CatState } from './cat-states';
import { CAT_STATES } from './cat-states';

interface CatMascotProps {
  state: CatState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 80,
  md: 120,
  lg: 160,
} as const;

const styles = `
  /* ---- Eye blink animation ---- */
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.05); }
  }

  /* ---- Tail gentle sway ---- */
  @keyframes tailSlow {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(8deg); }
    75% { transform: rotate(-8deg); }
  }

  /* ---- Tail happy wag ---- */
  @keyframes tailFast {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(18deg); }
    35% { transform: rotate(-18deg); }
    55% { transform: rotate(14deg); }
    75% { transform: rotate(-14deg); }
  }

  /* ---- Sleeping float ---- */
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* ---- Speech bubble float ---- */
  @keyframes bubbleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-4px) scale(1.05); opacity: 0.85; }
  }

  /* ---- Alert ears perk up ---- */
  @keyframes earsUp {
    0% { transform: translateY(0) scaleY(1); }
    40% { transform: translateY(-3px) scaleY(1.15); }
    100% { transform: translateY(-2px) scaleY(1.1); }
  }

  /* ---- Thinking dots ---- */
  @keyframes thinkingDots {
    0%, 20% { opacity: 0.3; }
    50% { opacity: 1; }
    80%, 100% { opacity: 0.3; }
  }

  .cat-mascot-root {
    position: absolute;
    bottom: 8px;
    right: 8px;
    pointer-events: none;
    z-index: 10;
  }

  .cat-svg {
    transition: transform 0.5s ease, filter 0.5s ease;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .cat-svg:hover {
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  /* ---- Body animations ---- */
  .cat-body-sitting { }
  .cat-body-attentive { transform-origin: center bottom; }
  .cat-body-paw-chin { }
  .cat-body-smiling { }
  .cat-body-ears-up { }
  .cat-body-lying {
    animation: float 3s ease-in-out infinite;
  }

  /* ---- Eye styles ---- */
  .cat-eye {
    transition: all 0.3s ease;
  }

  .cat-eye-semiclosed .cat-eye {
    animation: blink 4s ease-in-out infinite;
  }

  .cat-eye-open .cat-eye { }

  .cat-eye-blinking .cat-eye {
    animation: blink 2s ease-in-out infinite;
  }

  .cat-eye-wide .cat-eye {
    transform: scale(1.2);
  }

  /* ---- Tail styles ---- */
  .cat-tail {
    transform-origin: 15% 85%;
    transition: all 0.3s ease;
  }
  .cat-tail-slow {
    animation: tailSlow 3s ease-in-out infinite;
  }
  .cat-tail-fast {
    animation: tailFast 0.6s ease-in-out infinite;
  }

  /* ---- Ears ---- */
  .cat-ears {
    transition: transform 0.3s ease;
    transform-origin: center bottom;
  }
  .cat-ears-alert {
    animation: earsUp 0.4s ease-out forwards;
  }

  /* ---- Speech bubble ---- */
  .cat-bubble {
    animation: bubbleFloat 2s ease-in-out infinite;
    pointer-events: none;
  }

  /* ---- Paw ---- */
  .cat-paw {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  /* ---- Whiskers ---- */
  .cat-whiskers {
    transition: transform 0.3s ease;
  }
  .cat-whiskers-alert {
    transform: scaleX(1.1);
  }
`;

/**
 * CatMascot - The Teki cat mascot rendered as an inline SVG with CSS animations.
 *
 * Appears in the bottom-right corner of the Screen Viewer and reacts to
 * application events through animated state changes.
 */
export const CatMascot: React.FC<CatMascotProps> = ({
  state,
  size = 'md',
  className = '',
}) => {
  const config = CAT_STATES[state];
  const px = SIZE_MAP[size];

  // Viewbox is designed at 120x120, scale via width/height
  const viewBox = '0 0 120 120';

  const eyeClasses = `cat-eye-${config.eyeStyle}`;
  const tailClasses = `cat-tail${config.tailAnimation !== 'none' ? ` cat-tail-${config.tailAnimation}` : ''}`;
  const earClasses = `cat-ears${config.bodyAnimation === 'ears-up' ? ' cat-ears-alert' : ''}`;
  const bodyClasses = `cat-body-${config.bodyAnimation}`;
  const whiskerClasses = `cat-whiskers${config.bodyAnimation === 'ears-up' ? ' cat-whiskers-alert' : ''}`;

  const showPaw = config.bodyAnimation === 'paw-chin';

  // Eye rendering depends on the style
  const renderEyes = useMemo(() => {
    const leftEyeX = 42;
    const rightEyeX = 68;
    const eyeY = 52;

    switch (config.eyeStyle) {
      case 'closed-happy':
        // ^_^ happy closed eyes
        return (
          <g className="cat-eye">
            {/* Left eye - happy arc */}
            <path
              d={`M${leftEyeX - 5},${eyeY} Q${leftEyeX},${eyeY - 6} ${leftEyeX + 5},${eyeY}`}
              fill="none"
              stroke={config.eyeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Right eye - happy arc */}
            <path
              d={`M${rightEyeX - 5},${eyeY} Q${rightEyeX},${eyeY - 6} ${rightEyeX + 5},${eyeY}`}
              fill="none"
              stroke={config.eyeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        );

      case 'closed':
        // Sleeping closed eyes - horizontal lines
        return (
          <g className="cat-eye">
            <line
              x1={leftEyeX - 5} y1={eyeY}
              x2={leftEyeX + 5} y2={eyeY}
              stroke={config.eyeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1={rightEyeX - 5} y1={eyeY}
              x2={rightEyeX + 5} y2={eyeY}
              stroke={config.eyeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        );

      case 'semiclosed': {
        // Relaxed half-open eyes with slow blink
        const eyeHeight = 5;
        return (
          <g className="cat-eye" style={{ transformOrigin: `${leftEyeX}px ${eyeY}px` }}>
            {/* Left eye */}
            <ellipse
              cx={leftEyeX} cy={eyeY}
              rx="5.5" ry={eyeHeight}
              fill={config.eyeColor}
              opacity="0.9"
            />
            <circle cx={leftEyeX + 1} cy={eyeY} r="2.5" fill="#0a0a0b" />
            <circle cx={leftEyeX + 2} cy={eyeY - 1.5} r="1" fill="#ffffff" opacity="0.7" />
            {/* Right eye */}
            <ellipse
              cx={rightEyeX} cy={eyeY}
              rx="5.5" ry={eyeHeight}
              fill={config.eyeColor}
              opacity="0.9"
            />
            <circle cx={rightEyeX + 1} cy={eyeY} r="2.5" fill="#0a0a0b" />
            <circle cx={rightEyeX + 2} cy={eyeY - 1.5} r="1" fill="#ffffff" opacity="0.7" />
            {/* Upper eyelid overlay to create semiclosed effect */}
            <ellipse
              cx={leftEyeX} cy={eyeY - 3}
              rx="6.5" ry="4"
              fill="#2A8F9D"
            />
            <ellipse
              cx={rightEyeX} cy={eyeY - 3}
              rx="6.5" ry="4"
              fill="#2A8F9D"
            />
          </g>
        );
      }

      case 'wide': {
        // Alert wide eyes
        const wideR = 7;
        return (
          <g className="cat-eye">
            <circle cx={leftEyeX} cy={eyeY} r={wideR} fill={config.eyeColor} />
            <circle cx={leftEyeX + 1} cy={eyeY - 1} r="3.5" fill="#0a0a0b" />
            <circle cx={leftEyeX + 2} cy={eyeY - 2.5} r="1.5" fill="#ffffff" opacity="0.8" />
            <circle cx={rightEyeX} cy={eyeY} r={wideR} fill={config.eyeColor} />
            <circle cx={rightEyeX + 1} cy={eyeY - 1} r="3.5" fill="#0a0a0b" />
            <circle cx={rightEyeX + 2} cy={eyeY - 2.5} r="1.5" fill="#ffffff" opacity="0.8" />
          </g>
        );
      }

      case 'open':
      case 'blinking':
      default: {
        // Normal open eyes
        const normalR = 6;
        return (
          <g className="cat-eye">
            <circle cx={leftEyeX} cy={eyeY} r={normalR} fill={config.eyeColor} />
            <circle cx={leftEyeX + 1} cy={eyeY} r="3" fill="#0a0a0b" />
            <circle cx={leftEyeX + 2} cy={eyeY - 1.5} r="1.2" fill="#ffffff" opacity="0.7" />
            <circle cx={rightEyeX} cy={eyeY} r={normalR} fill={config.eyeColor} />
            <circle cx={rightEyeX + 1} cy={eyeY} r="3" fill="#0a0a0b" />
            <circle cx={rightEyeX + 2} cy={eyeY - 1.5} r="1.2" fill="#ffffff" opacity="0.7" />
          </g>
        );
      }
    }
  }, [config.eyeStyle, config.eyeColor]);

  // Mouth shape differs for happy state
  const renderMouth = useMemo(() => {
    const mouthY = 62;

    if (config.bodyAnimation === 'smiling') {
      // Wide smile
      return (
        <path
          d="M48,62 Q55,70 62,62"
          fill="none"
          stroke="#1a6b75"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    }

    // Default subtle mouth
    return (
      <path
        d={`M50,${mouthY} Q55,${mouthY + 4} 60,${mouthY}`}
        fill="none"
        stroke="#1a6b75"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    );
  }, [config.bodyAnimation]);

  // Speech bubble
  const renderBubble = useMemo(() => {
    if (!config.bubble) return null;

    const bubbleX = 18;
    const bubbleY = 16;

    return (
      <g className="cat-bubble">
        {/* Bubble background */}
        <rect
          x={bubbleX - 2}
          y={bubbleY - 10}
          width={config.bubble.length > 2 ? 30 : 22}
          height="18"
          rx="9"
          ry="9"
          fill="#27272a"
          stroke="#3f3f46"
          strokeWidth="1"
        />
        {/* Bubble pointer */}
        <polygon
          points={`${bubbleX + 8},${bubbleY + 8} ${bubbleX + 14},${bubbleY + 14} ${bubbleX + 16},${bubbleY + 8}`}
          fill="#27272a"
        />
        {/* Bubble text */}
        <text
          x={config.bubble.length > 2 ? bubbleX + 13 : bubbleX + 9}
          y={bubbleY + 2}
          textAnchor="middle"
          fontSize={config.bubble === '!' ? '14' : '11'}
          fontWeight="bold"
          fill={config.bubble === '!' ? '#f5a524' : '#a1a1aa'}
          fontFamily="monospace"
        >
          {config.bubble}
        </text>
      </g>
    );
  }, [config.bubble]);

  return (
    <div
      className={`cat-mascot-root ${className}`}
      role="img"
      aria-label={`Teki cat - ${config.label}`}
      title={config.label}
    >
      <style>{styles}</style>
      <svg
        className={`cat-svg ${bodyClasses}`}
        width={px}
        height={px}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ---- Speech bubble ---- */}
        {renderBubble}

        {/* ---- Tail ---- */}
        <g className={tailClasses}>
          <path
            d="M85,88 Q100,70 95,55 Q92,45 98,38"
            fill="none"
            stroke="#2A8F9D"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Tail tip */}
          <circle cx="98" cy="37" r="3.5" fill="#237a86" />
        </g>

        {/* ---- Body ---- */}
        {/* Main body ellipse */}
        <ellipse
          cx="55"
          cy="80"
          rx="30"
          ry="24"
          fill="#2A8F9D"
        />
        {/* Chest/belly lighter area */}
        <ellipse
          cx="55"
          cy="83"
          rx="18"
          ry="16"
          fill="#34a3b2"
          opacity="0.6"
        />

        {/* ---- Head ---- */}
        <circle cx="55" cy="48" r="22" fill="#2A8F9D" />
        {/* Lighter face area */}
        <circle cx="55" cy="50" r="15" fill="#34a3b2" opacity="0.35" />

        {/* ---- Ears ---- */}
        <g className={earClasses}>
          {/* Left ear */}
          <polygon
            points="35,35 28,14 45,28"
            fill="#2A8F9D"
          />
          {/* Left ear inner */}
          <polygon
            points="36,32 31,18 43,29"
            fill="#237a86"
            opacity="0.6"
          />
          {/* Right ear */}
          <polygon
            points="75,35 82,14 65,28"
            fill="#2A8F9D"
          />
          {/* Right ear inner */}
          <polygon
            points="74,32 79,18 67,29"
            fill="#237a86"
            opacity="0.6"
          />
        </g>

        {/* ---- Eyes ---- */}
        <g className={eyeClasses}>
          {renderEyes}
        </g>

        {/* ---- Nose ---- */}
        <polygon
          points="53,57 57,57 55,60"
          fill="#1a6b75"
        />

        {/* ---- Mouth ---- */}
        {renderMouth}

        {/* ---- Whiskers ---- */}
        <g className={whiskerClasses}>
          {/* Left whiskers */}
          <line x1="44" y1="58" x2="20" y2="54" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
          <line x1="44" y1="60" x2="18" y2="60" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
          <line x1="44" y1="62" x2="20" y2="66" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
          {/* Right whiskers */}
          <line x1="66" y1="58" x2="90" y2="54" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
          <line x1="66" y1="60" x2="92" y2="60" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
          <line x1="66" y1="62" x2="90" y2="66" stroke="#237a86" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* ---- Front paws (base, always visible) ---- */}
        {/* Left paw */}
        <ellipse cx="38" cy="98" rx="8" ry="5" fill="#2A8F9D" />
        <ellipse cx="38" cy="98" rx="5" ry="3" fill="#34a3b2" opacity="0.4" />
        {/* Right paw */}
        <ellipse cx="72" cy="98" rx="8" ry="5" fill="#2A8F9D" />
        <ellipse cx="72" cy="98" rx="5" ry="3" fill="#34a3b2" opacity="0.4" />

        {/* ---- Thinking paw (raised to chin) ---- */}
        {showPaw && (
          <g className="cat-paw">
            {/* Arm */}
            <path
              d="M38,95 Q30,80 38,65"
              fill="none"
              stroke="#2A8F9D"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Paw at chin */}
            <ellipse cx="38" cy="63" rx="6" ry="5" fill="#2A8F9D" />
            <ellipse cx="38" cy="63" rx="4" ry="3" fill="#34a3b2" opacity="0.4" />
          </g>
        )}

        {/* ---- Ground shadow ---- */}
        <ellipse
          cx="55"
          cy="104"
          rx="32"
          ry="4"
          fill="#000000"
          opacity="0.15"
        />
      </svg>
    </div>
  );
};

export default CatMascot;
