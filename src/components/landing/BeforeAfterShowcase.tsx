import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { Language } from '../../types';
import { LANDING_COPY } from './landingCopy';

interface BeforeAfterShowcaseProps {
  language: Language;
}

export const BeforeAfterShowcase: React.FC<BeforeAfterShowcaseProps> = ({ language }) => {
  const copy = LANDING_COPY[language].beforeAfter;
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      updatePosition(moveEvent.clientX);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - (e.shiftKey ? 10 : 2)));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + (e.shiftKey ? 10 : 2)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  return (
    <section id="before-after" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wide mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copy.badge}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight mb-4"
        >
          {copy.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.15 }}
          className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto"
        >
          {copy.subtitle}
        </motion.p>
      </div>

      {/* Comparison Slider Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-800/40 to-cyan-500/20 shadow-2xl shadow-emerald-950/40"
      >
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="slider"
          aria-label={copy.dragHint}
          aria-valuenow={sliderPosition}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ touchAction: 'none' }}
          className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/10] max-h-[520px] rounded-xl overflow-hidden select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-950"
        >
          {/* AFTER Image (Background full width) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/landing/after.jpg"
              alt="SHOW AI luxury ad poster output with 3D gold typography and marble plinth"
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
            />
            {/* Top right label */}
            <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 shadow-lg max-w-[45vw] sm:max-w-none truncate">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{copy.labelAfter}</span>
            </div>
          </div>

          {/* BEFORE Image (Clipped layer on the left) */}
          <div
            className="absolute inset-0 h-full overflow-hidden will-change-[width]"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
              <img
                src="/landing/before.jpg"
                alt="Raw unedited product photo before AI enhancement"
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
              />
              {/* Top left label */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] sm:text-sm font-medium tracking-wide flex items-center gap-1.5 shadow-lg max-w-[45vw] sm:max-w-none truncate">
                <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{copy.labelBefore}</span>
              </div>
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none transition-transform will-change-[left]"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Vertical glowing line */}
            <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-emerald-300 via-cyan-400 to-emerald-400 shadow-[0_0_12px_#10b981]" />

            {/* Circular Handle Button */}
            <div
              className={`absolute top-1/2 -left-4.5 sm:-left-5 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)] transition-all ${
                isDragging ? 'scale-115 ring-4 ring-emerald-500/30' : 'hover:scale-105'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Drag Hint Footer */}
        <div className="py-3 px-4 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {copy.dragHint}
          </span>
          <span className="text-emerald-400/80 font-bold">
            {sliderPosition}%
          </span>
        </div>
      </motion.div>
    </section>
  );
};
