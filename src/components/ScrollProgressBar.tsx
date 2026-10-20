import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001
  });

  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScroll, setShowScroll] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsubProgress = scrollYProgress.on('change', (v) => {
      setScrollPercent(Math.round(v * 100));
    });
    const unsubScroll = scrollY.on('change', (latest) => {
      setShowScroll(latest > 50);
    });
    return () => {
      unsubProgress();
      unsubScroll();
    };
  }, [scrollYProgress, scrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Top Scroll Indicator Line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 origin-left z-50 shadow-[0_0_12px_rgba(52,211,153,0.8)] pointer-events-none"
        style={{ scaleX: smoothProgress }}
      />

      {/* 🌟 Circular Glass Scroll Progress Animation Tracker (Bottom-Right) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ 
          opacity: showScroll ? 1 : 0, 
          scale: showScroll ? 1 : 0.7, 
          y: showScroll ? 0 : 20 
        }}
        transition={{ duration: 0.25 }}
        className={`fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-50 ${showScroll ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          onClick={scrollToTop}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center glass-circle cursor-pointer group transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_12px_32px_rgba(0,0,0,0.7)]"
          title="Scroll to top"
          aria-label="Scroll progress and return to top"
        >
          {/* Circular SVG Track & Dynamic Progress Ring */}
          <svg className="w-13 h-13 sm:w-14 sm:h-14 -rotate-90 pointer-events-none" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke="url(#scrollGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                pathLength: smoothProgress
              }}
            />
            <defs>
              <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content: Percent by default, Arrow on hover or scroll > 90% */}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            {isHovered || scrollPercent > 92 ? (
              <ArrowUp className="w-4 h-4 text-emerald-300 transition-transform duration-200 group-hover:-translate-y-0.5" />
            ) : (
              <span className="text-[11px] font-mono font-bold tracking-tight text-emerald-300/90 select-none">
                {scrollPercent}%
              </span>
            )}
          </div>

          {/* Ambient Outer Halo Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md pointer-events-none group-hover:bg-emerald-500/25 transition-colors duration-300" />
        </button>
      </motion.div>
    </>
  );
};

export default ScrollProgressBar;
