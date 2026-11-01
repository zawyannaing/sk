import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, ArrowRight, ShieldCheck, Zap, Users, Heart, Layers, Sparkle } from 'lucide-react';
import { Language } from '../../types';
import { landingCopy } from './landingCopy';
import { useReducedMotion } from 'motion/react';

interface LandingHeroProps {
  language: Language;
  onLaunch: () => void;
  onOpenDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onLaunch,
  onOpenDemo
}) => {
  const t = landingCopy[language].hero;
  const isMyanmar = language === 'my';
  const shouldReduceMotion = useReducedMotion();

  // Mouse reactive glow coordinates
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Stats count-up animation
  const [hasCounted, setHasCounted] = useState(false);
  const [counts, setCounts] = useState({
    ethnic: 0,
    wedding: 0,
    wizard: 0,
    credits: 0
  });

  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasCounted) {
          setHasCounted(true);
          if (shouldReduceMotion) {
            setCounts({ ethnic: 135, wedding: 42, wizard: 8, credits: 250 });
            return;
          }

          // Animate count-up
          const duration = 1600;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const ease = 1 - Math.pow(1 - progress, 3);

            setCounts({
              ethnic: Math.floor(ease * 135),
              wedding: Math.floor(ease * 42),
              wizard: Math.floor(ease * 8),
              credits: Math.floor(ease * 250)
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts({ ethnic: 135, wedding: 42, wizard: 8, credits: 250 });
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasCounted, shouldReduceMotion]);

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[92vh] flex flex-col justify-center items-center pt-24 pb-12 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07090e]"
    >
      {/* 🌟 Background Grid & Interactive Hologram Glow */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle dark technical grid lines */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 80px 80px, 80px 80px'
          }}
        />

        {/* Mouse Reactive Radial Hologram Glow (Lightweight SVG radial, smooth) */}
        {!shouldReduceMotion && (
          <div
            className="absolute inset-0 transition-opacity duration-700 hidden sm:block opacity-60"
            style={{
              background: `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(16, 185, 129, 0.18), rgba(34, 211, 238, 0.08), transparent 70%)`
            }}
          />
        )}

        {/* Ambient Top Center Emerald Nebula */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-7">
        
        {/* 1. Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs sm:text-xs font-bold tracking-wide shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20 animate-pulse" />
          <span>{t.badge}</span>
        </div>

        {/* 2. Main H1 Headline */}
        <h1
          className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] max-w-4xl mx-auto ${
            isMyanmar ? 'leading-[1.75] font-myanmar' : 'font-display'
          }`}
        >
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            {t.h1}
          </span>
        </h1>

        {/* 3. Subheadline */}
        <p
          className={`text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto ${
            isMyanmar ? 'leading-[1.8] font-myanmar' : 'leading-relaxed'
          }`}
        >
          {t.subheadline}
        </p>

        {/* 4. CTA Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onLaunch}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black font-black text-sm hover:brightness-110 active:scale-95 transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{t.ctaPrimary}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Watch Demo CTA */}
          <button
            type="button"
            onClick={onOpenDemo}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-bold text-sm border border-white/10 hover:border-emerald-500/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 backdrop-blur-md"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>{t.ctaSecondary}</span>
          </button>
        </div>

        {/* 5. Animated Count-Up Stats Strip */}
        <div
          ref={statsRef}
          className="pt-8 sm:pt-14 w-full max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl">
            
            {/* Stat 1: Ethnic Tribes */}
            <div className="flex flex-col items-center p-2.5 sm:p-3 text-center">
              <span className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">
                {counts.ethnic}+
              </span>
              <span className={`text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                {t.stats[0].label}
              </span>
            </div>

            {/* Stat 2: Wedding Archetypes */}
            <div className="flex flex-col items-center p-2.5 sm:p-3 text-center border-l sm:border-l border-white/5">
              <span className="text-xl sm:text-3xl font-black text-cyan-400 font-mono">
                {counts.wedding}
              </span>
              <span className={`text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                {t.stats[1].label}
              </span>
            </div>

            {/* Stat 3: Step Guided Wizard */}
            <div className="flex flex-col items-center p-2.5 sm:p-3 text-center border-l border-white/5">
              <span className="text-xl sm:text-3xl font-black text-teal-400 font-mono">
                {counts.wizard}-Step
              </span>
              <span className={`text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                {t.stats[2].label}
              </span>
            </div>

            {/* Stat 4: Optical Resolution */}
            <div className="flex flex-col items-center p-2.5 sm:p-3 text-center border-l sm:border-l border-white/5">
              <span className="text-xl sm:text-3xl font-black text-amber-400 font-mono">
                8K UHD
              </span>
              <span className={`text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                {t.stats[3].label}
              </span>
            </div>

            {/* Stat 5: Daily Free Credits */}
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center p-2.5 sm:p-3 text-center border-t sm:border-t-0 sm:border-l border-white/5">
              <span className="text-xl sm:text-3xl font-black text-emerald-400 font-mono">
                {counts.credits}
              </span>
              <span className={`text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                {t.stats[4].label}
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
