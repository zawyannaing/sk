import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface LanternParticle {
  id: number;
  left: number; // percentage 0-100
  size: number; // size in px
  duration: number; // seconds
  delay: number; // seconds
  swayAmount: number; // px horizontal drift
  opacity: number;
  glowIntensity: number;
}

// 🎈 Mini SVG Hot Air Lantern matching the user's golden balloon design
const GoldenHotAirLantern: React.FC<{ size: number; glowIntensity: number }> = ({ size, glowIntensity }) => {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 60 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 0 ${glowIntensity * 14}px rgba(251, 191, 36, 0.85)) drop-shadow(0 0 ${glowIntensity * 6}px rgba(245, 158, 11, 0.95))`,
      }}
      className="pointer-events-none select-none"
    >
      {/* Outer Balloon Envelope */}
      <path
        d="M30 4C14 4 2 16 2 32C2 44 14 54 22 58L24 60H36L38 58C46 54 58 44 58 32C58 16 46 4 30 4Z"
        fill="url(#lanternGradient)"
        stroke="#f59e0b"
        strokeWidth="1.2"
      />

      {/* Inner Balloon Vertical Curved Ribs */}
      <path
        d="M30 4C22 14 18 24 18 36C18 48 22 56 26 59.5"
        stroke="#fde68a"
        strokeWidth="1"
        strokeOpacity="0.8"
      />
      <path
        d="M30 4C38 14 42 24 42 36C42 48 38 56 34 59.5"
        stroke="#fde68a"
        strokeWidth="1"
        strokeOpacity="0.8"
      />
      <path
        d="M30 4V60"
        stroke="#fef08a"
        strokeWidth="1.2"
        strokeOpacity="0.9"
      />

      {/* Internal Glowing Core */}
      <ellipse cx="30" cy="34" rx="10" ry="14" fill="url(#coreGlow)" />

      {/* Burner Flame Node */}
      <circle cx="30" cy="62" r="3.2" fill="#fffbeb" />

      {/* Rigging Ropes */}
      <line x1="22" y1="58" x2="25" y2="72" stroke="#d97706" strokeWidth="1" />
      <line x1="27" y1="60" x2="28" y2="72" stroke="#d97706" strokeWidth="1" />
      <line x1="33" y1="60" x2="32" y2="72" stroke="#d97706" strokeWidth="1" />
      <line x1="38" y1="58" x2="35" y2="72" stroke="#d97706" strokeWidth="1" />

      {/* Wicker Basket */}
      <rect
        x="24"
        y="72"
        width="12"
        height="9"
        rx="2"
        fill="#92400e"
        stroke="#78350f"
        strokeWidth="1"
      />
      {/* Basket Weave lines */}
      <line x1="24" y1="75" x2="36" y2="75" stroke="#b45309" strokeWidth="0.8" />
      <line x1="24" y1="78" x2="36" y2="78" stroke="#b45309" strokeWidth="0.8" />

      {/* Gradients */}
      <defs>
        <radialGradient
          id="lanternGradient"
          cx="0.5"
          cy="0.4"
          r="0.6"
          fx="0.5"
          fy="0.35"
        >
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#fef08a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const FloatingLanternsBackground: React.FC = () => {
  // Generate a balanced set of rising lantern particles
  const lanterns = useMemo<LanternParticle[]>(() => {
    return Array.from({ length: 18 }).map((_, index) => {
      // Deterministic layout with pseudo-random distribution
      const pseudo = (index * 137.5) % 100;
      const sizeVariations = [24, 30, 36, 44, 52, 28, 38, 48];
      const size = sizeVariations[index % sizeVariations.length];
      const duration = 16 + (index % 7) * 3; // 16s to 34s
      const delay = (index * 1.8) % 20; // staggered start
      const sway = 14 + (index % 4) * 8; // 14px to 38px horizontal sway
      const left = 3 + ((index * 5.6 + pseudo * 0.4) % 94); // well distributed horizontally
      const opacity = size < 30 ? 0.75 : size < 45 ? 0.88 : 0.95;
      const glowIntensity = size < 30 ? 0.7 : size < 45 ? 0.9 : 1.2;

      return {
        id: index,
        left,
        size,
        duration,
        delay,
        swayAmount: sway,
        opacity,
        glowIntensity,
      };
    });
  }, []);

  // Tiny stardust shimmering particles
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      top: ((i * 19) % 92) + '%',
      left: ((i * 31) % 96) + '%',
      size: (i % 3) + 1.5,
      delay: (i * 0.4) % 4,
      duration: 2 + (i % 3),
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
      {/* 1. Golden Stardust Sparkles */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-amber-200"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            boxShadow: '0 0 6px rgba(251, 191, 36, 0.9)',
          }}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* 4. Live Rising Golden Hot Air Lanterns (defying gravity, floating upward) */}
      {lanterns.map((l) => (
        <motion.div
          key={l.id}
          className="absolute will-change-transform"
          style={{
            left: `${l.left}%`,
            bottom: '-120px',
            opacity: l.opacity,
          }}
          animate={{
            y: ['0vh', '-125vh'],
            x: [-l.swayAmount, l.swayAmount, -l.swayAmount],
            rotate: [-2, 2.5, -2],
          }}
          transition={{
            y: {
              duration: l.duration,
              delay: l.delay,
              repeat: Infinity,
              ease: 'linear',
            },
            x: {
              duration: 4.5 + (l.id % 3),
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
            rotate: {
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        >
          <GoldenHotAirLantern size={l.size} glowIntensity={l.glowIntensity} />
        </motion.div>
      ))}

      {/* 5. Dreamy Bottom Warm Ambient Glow */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none blur-xl" />
    </div>
  );
};
