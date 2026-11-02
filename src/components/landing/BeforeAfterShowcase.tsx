import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, SlidersHorizontal, ArrowLeftRight, Award, Gem, HeartHandshake } from 'lucide-react';
import { Language } from '../../types';
import { landingCopy } from './landingCopy';

interface BeforeAfterShowcaseProps {
  language: Language;
}

interface ShowcasePair {
  id: 'commercial-ad' | 'pre-wedding';
  badgeEn: string;
  badgeMm: string;
  tabLabelEn: string;
  tabLabelMm: string;
  beforeImg: string;
  afterImg: string;
  labelBeforeEn: string;
  labelBeforeMm: string;
  labelAfterEn: string;
  labelAfterMm: string;
  detailsEn: string;
  detailsMm: string;
}

const SHOWCASE_PAIRS: ShowcasePair[] = [
  {
    id: 'commercial-ad',
    badgeEn: '3D COMMERCIAL AD SYNTHESIS',
    badgeMm: '3D စီးပွားရေး ကြော်ငြာ POSTER ဖန်တီးမှု',
    tabLabelEn: '3D Gold Ad Campaign',
    tabLabelMm: '3D ရွှေရောင် ကြော်ငြာ Poster',
    beforeImg: '/landing/ad-before.jpg',
    afterImg: '/landing/ad-after.jpg',
    labelBeforeEn: 'Raw 2D Flat Draft',
    labelBeforeMm: 'မူရင်း 2D စာလုံး ဒီဇိုင်းကြမ်း',
    labelAfterEn: 'SHOW AI 3D Gold Ad Poster',
    labelAfterMm: 'SHOW AI 3D ရွှေရောင် စီးပွားရေး Poster',
    detailsEn: 'Flat 2D text transformed into sculpted 3D gold and platinum typography with realistic floor reflections and volumetric spotlight rays.',
    detailsMm: 'ရိုးရိုး 2D စာလုံးကြမ်းအား ကြမ်းပြင်ရောင်ပြန်၊ နေခြည်အလင်းတန်းနှင့် 3D ရွှေရောင် ဖောင်းကြွစာလုံး အနုပညာ Poster အဖြစ် အဆင့်မြှင့်တင်ထားပါသည်။'
  },
  {
    id: 'pre-wedding',
    badgeEn: 'BURMESE CULTURAL PRE-WEDDING',
    badgeMm: 'မြန်မာ့ရိုးရာ မင်္ဂလာစုံတွဲ အနုပညာ',
    tabLabelEn: 'Royal Pre-Wedding Festival',
    tabLabelMm: 'ရွှေတိဂုံ မီးထွန်းပွဲတော် စုံတွဲ',
    beforeImg: '/landing/wedding-before.jpg',
    afterImg: '/landing/wedding-after.jpg',
    labelBeforeEn: 'Raw Indoor Curtain Shot',
    labelBeforeMm: 'မူရင်း ခန်းဆီးနောက်ခံ ရိုးရိုးပုံ',
    labelAfterEn: 'Shwedagon Lantern Masterpiece',
    labelAfterMm: 'ရွှေတိဂုံ မီးထွန်းပွဲတော် 8K အနုပညာ',
    detailsEn: 'Casual studio couple seamlessly composited into the Shwedagon Pagoda full moon night festival with floating lanterns and lotus water reflections.',
    detailsMm: 'သာမန်အခန်းတွင်း စုံတွဲပုံအား ရွှေတိဂုံစေတီတော်၊ လပြည့်ည ကောင်းကင်မီးပုံးပျံများနှင့် ရေပေါ်ကြာပန်းဆီမီး ပွဲတော်မြင်ကွင်းအဖြစ် ပေါင်းစပ်ဖန်တီးထားပါသည်။'
  }
];

export const BeforeAfterShowcase: React.FC<BeforeAfterShowcaseProps> = ({ language }) => {
  const isMm = language === 'my';
  const copy = landingCopy[language].beforeAfter;
  
  const [activeTab, setActiveTab] = useState<'commercial-ad' | 'pre-wedding'>('commercial-ad');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePair = SHOWCASE_PAIRS.find((p) => p.id === activeTab) || SHOWCASE_PAIRS[0];

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
    <section id="photo-tools" className="relative py-10 sm:py-24 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wide mb-4"
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isMm ? activePair.badgeMm : activePair.badgeEn}</span>
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

        {/* Real Showcase Preset Switcher (Commercial Ad vs Pre-Wedding) */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setActiveTab('commercial-ad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'commercial-ad'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-amber-400" />
            <span>{isMm ? '3D ရွှေရောင် စီးပွားရေး Poster' : '3D Gold Ad Campaign'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pre-wedding')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'pre-wedding'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />
            <span>{isMm ? 'ရွှေတိဂုံ မီးထွန်းပွဲတော် စုံတွဲ' : 'Royal Pre-Wedding'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Slider Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-emerald-500/30 via-slate-800/40 to-teal-500/20 shadow-2xl shadow-emerald-950/40"
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
          className="relative w-full aspect-[16/11] sm:aspect-[4/3] md:aspect-[16/10] max-h-[260px] sm:max-h-[440px] md:max-h-[580px] rounded-2xl overflow-hidden select-none cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-950"
        >
          {/* AFTER Image (Background full width) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              key={activePair.afterImg}
              src={activePair.afterImg}
              alt={isMm ? activePair.labelAfterMm : activePair.labelAfterEn}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />
            {/* Top right label */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isMm ? activePair.labelAfterMm : activePair.labelAfterEn}</span>
            </div>
          </div>

          {/* BEFORE Image (Clipped layer on the left) */}
          <div
            className="absolute inset-0 h-full overflow-hidden will-change-[width]"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}>
              <img
                key={activePair.beforeImg}
                src={activePair.beforeImg}
                alt={isMm ? activePair.labelBeforeMm : activePair.labelBeforeEn}
                className="w-full h-full object-cover select-none pointer-events-none"
                loading="eager"
              />
              {/* Top left label */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-slate-300 text-xs sm:text-sm font-medium tracking-wide flex items-center gap-1.5 shadow-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{isMm ? activePair.labelBeforeMm : activePair.labelBeforeEn}</span>
              </div>
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none transition-transform will-change-[left]"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Vertical glowing line */}
            <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-emerald-300 via-cyan-400 to-emerald-400 shadow-[0_0_14px_#10b981]" />

            {/* Circular Handle Button */}
            <div
              className={`absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all ${
                isDragging ? 'scale-115 ring-4 ring-emerald-500/40' : 'hover:scale-105'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Drag Hint & Transformation Details Footer */}
        <div className="py-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono border-t border-white/5">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isMm ? activePair.detailsMm : activePair.detailsEn}</span>
          </span>
          <span className="text-emerald-400/90 font-bold shrink-0 self-end sm:self-auto">
            {copy.dragHint} ({sliderPosition}%)
          </span>
        </div>
      </motion.div>
    </section>
  );
};
