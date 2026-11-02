import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Camera,
  Video,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ChevronRight,
  Maximize2,
  Wand2,
  Tag,
  ArrowRight,
  Package,
  Heart,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { Language } from '../../types';
import { landingCopy } from './landingCopy';
import { useReducedMotion } from 'motion/react';

interface StickyStorytellingProps {
  language: Language;
  onLaunchChapter: (chapterId: string) => void;
}

export const StickyStorytelling: React.FC<StickyStorytellingProps> = ({
  language,
  onLaunchChapter
}) => {
  const t = landingCopy[language].storytelling;
  const isMyanmar = language === 'my';
  const shouldReduceMotion = useReducedMotion();

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Desktop active chapter detection via IntersectionObserver
  useEffect(() => {
    if (shouldReduceMotion) return;

    const observers: IntersectionObserver[] = [];

    chapterRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapterIndex(index);
            }
          });
        },
        {
          rootMargin: '-30% 0px -40% 0px',
          threshold: 0.1
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [shouldReduceMotion]);

  const currentChapter = t.chapters[activeChapterIndex] || t.chapters[0];

  return (
    <section id="features" className="relative py-10 sm:py-24 bg-[#07090e] border-t border-white/5">
      
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-3/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.sectionBadge}</span>
          </div>
          <h2
            className={`text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight ${
              isMyanmar ? 'font-myanmar leading-[1.6]' : 'font-display'
            }`}
          >
            {t.sectionTitle}
          </h2>
          <p
            className={`text-sm sm:text-base text-zinc-400 ${
              isMyanmar ? 'font-myanmar leading-[1.8]' : ''
            }`}
          >
            {t.sectionSubtitle}
          </p>
        </div>

        {/* 💻 DESKTOP LAYOUT (Left Narrative Scroll + Right Sticky Mock Pinned Card) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-start relative">
          
          {/* Left Narrative Column (Steps through 4 chapters on scroll) */}
          <div className="lg:col-span-6 space-y-36 pb-32">
            {t.chapters.map((chap, idx) => {
              const isActive = activeChapterIndex === idx;
              return (
                <div
                  key={chap.id}
                  id={chap.navAnchorId}
                  ref={(el) => { chapterRefs.current[idx] = el; }}
                  className={`transition-all duration-500 p-8 rounded-3xl border ${
                    isActive
                      ? 'bg-white/[0.04] border-emerald-500/40 shadow-2xl shadow-emerald-500/5'
                      : 'bg-transparent border-white/5 opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* Chapter Number & Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono font-black text-sm text-emerald-400 flex items-center justify-center">
                      {chap.number}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                      {chap.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3
                    className={`text-2xl sm:text-3xl font-black text-white tracking-tight ${
                      isMyanmar ? 'font-myanmar leading-normal' : ''
                    }`}
                  >
                    {chap.title}
                  </h3>
                  <p className="text-xs font-semibold text-teal-400 mt-1 mb-4 font-mono">
                    {chap.tagline}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-sm text-zinc-300 leading-relaxed mb-6 ${
                      isMyanmar ? 'font-myanmar leading-[1.8]' : ''
                    }`}
                  >
                    {chap.description}
                  </p>

                  {/* Bulleted Feature Highlights */}
                  <ul className="space-y-2.5 mb-8">
                    {chap.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className={isMyanmar ? 'font-myanmar leading-relaxed' : ''}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-white/5 mb-6">
                    {chap.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="text-center">
                        <div className="text-xs sm:text-sm font-black text-white font-mono">
                          {m.value}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Launch Studio Button */}
                  <button
                    type="button"
                    onClick={() => onLaunchChapter(chap.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-black border border-white/10 hover:border-emerald-400 text-xs font-bold text-zinc-200 transition cursor-pointer group"
                  >
                    <span>Launch {chap.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Sticky Column (Pinned mock UI cross-fades per active chapter) */}
          <div className="lg:col-span-6 sticky top-28 h-[580px] w-full flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-[#0d121c] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Card Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-zinc-400 ml-2">
                    SHOW AI // {currentChapter.id.toUpperCase()}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  LIVE INTERFACE MOCK
                </div>
              </div>

              {/* Dynamic Interactive Mock Views per Chapter */}
              <div className="flex-1 py-4 overflow-hidden flex items-center justify-center">
                
                {/* 01: Prompt Creator Suite Mock View */}
                {activeChapterIndex === 0 && (
                  <div className="w-full space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                          <span>📦 Product Ad Poster</span>
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          3D Gold Ribbon, Marble Plinth & Typography Negative Space
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>💍 42 Wedding Styles</span>
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Konbaung Dynasty Maha Lata Regalia & Gold Thread Silk
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>👥 135 Ethnic Tribes</span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Shan, Kachin, Karen & Chin Silver Torques & Headgear
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span>✨ Swatches & Jewels</span>
                          <Package className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Mogok Pigeon Blood Rubies & Shwebo Thanaka Bark
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/20 font-mono text-xs text-emerald-200/90 leading-relaxed">
                      <span className="text-zinc-500">// Generated Master Prompt Fragment:</span>
                      <br />
                      "Commercial advertisement poster for Mogok royal ruby necklace, 3D embossed gold typography '50% OFF TODAY', polished black travertine plinth, 8k octane commercial render --ar 4:5"
                    </div>
                  </div>
                )}

                {/* 02: Photo Prompt Studio Mock View */}
                {activeChapterIndex === 1 && (
                  <div className="w-full space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <span className="font-bold text-white">Active Core Model:</span>
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Seedream 5.0 Pro (Photoreal 8K)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: 'Multi-View 4-Angle', tag: 'Zero123Plus 360°' },
                        { title: 'Identity Face Swap', tag: 'InsightFace ReActor' },
                        { title: 'AI Inpainting Brush', tag: 'Selective Retouch' },
                        { title: 'Background Swap', tag: 'RMBG-1.4 Edge' }
                      ].map((tool, i) => (
                        <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="text-xs font-bold text-zinc-200">{tool.title}</div>
                          <div className="text-[10px] text-cyan-400 font-mono">{tool.tag}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                      <span className="text-emerald-300 font-semibold">Tiled Optical Upscale:</span>
                      <span className="font-mono text-white bg-emerald-500 px-2.5 py-0.5 rounded-lg text-black font-bold">
                        8K Masterpiece (20 Credits)
                      </span>
                    </div>
                  </div>
                )}

                {/* 03: Video Prompt Studio Mock View */}
                {activeChapterIndex === 2 && (
                  <div className="w-full space-y-4 animate-in fade-in duration-300">
                    <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-300">Camera Trajectory Physics:</span>
                        <span className="text-cyan-400 font-mono text-[11px]">Orbit & Push-In</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                        <span className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PAN LEFT</span>
                        <span className="p-1.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">DRONE ZOOM</span>
                        <span className="p-1.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">FPV DIVE</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-zinc-300 block">Optimized Generators:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['OpenAI Sora', 'Runway Gen-3', 'Luma Dream', 'Kling 1.5', 'Hailuo MiniMax'].map((v, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 font-mono text-xs text-emerald-200">
                      "Cinematic 4K 60fps drone shot circling ancient Bagan stupas at golden hour, volumetric sunbeams, temporal stability 0.85"
                    </div>
                  </div>
                )}

                {/* 04: Cultural Accuracy Inspector Mock View */}
                {activeChapterIndex === 3 && (
                  <div className="w-full space-y-3.5 animate-in fade-in duration-300">
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Anachronism Warning Flagged:</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        "Modern wristwatch detected on Konbaung dynasty royal court dress. Auto-correcting to pure 24k repousse gold torque."
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Cultural Verification Passed:</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Amarapura 100-shuttle Luntaya Acheik weave geometry verified against national archives.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 font-mono text-[11px] text-zinc-400 space-y-1">
                      <div className="text-zinc-500">// Instant Format Converter:</div>
                      <div className="text-emerald-400">/imagine prompt: [Master Burmese Prompt] --v 6.1 --style raw --ar 16:9</div>
                    </div>
                  </div>
                )}

              </div>

              {/* Card Footer Bar */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Module Status: Operational</span>
                </span>
                <span className="font-mono text-zinc-500">
                  0{activeChapterIndex + 1} / 04
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* 📱 MOBILE LAYOUT (Interactive Compact Chapter Stepper) */}
        <div className="block lg:hidden space-y-4">
          {/* Chapter Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-0.5">
            {t.chapters.map((chap, idx) => (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveChapterIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border flex-shrink-0 ${
                  activeChapterIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                    : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
                }`}
              >
                <span className="font-mono text-[10px] text-emerald-400 font-bold">{chap.number}</span>
                <span>{chap.title}</span>
              </button>
            ))}
          </div>

          {/* Active Mobile Chapter Card */}
          {(() => {
            const chap = t.chapters[activeChapterIndex] || t.chapters[0];
            return (
              <div
                id={chap.navAnchorId}
                className="p-5 rounded-2xl bg-[#0d121c] border border-emerald-500/30 space-y-3.5 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold text-xs text-emerald-400 flex items-center justify-center">
                    {chap.number}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-emerald-300 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {chap.badge}
                  </span>
                </div>

                <h3 className={`text-lg font-bold text-white ${isMyanmar ? 'font-myanmar leading-normal' : ''}`}>
                  {chap.title}
                </h3>
                <p className="text-xs text-teal-400 font-mono">{chap.tagline}</p>
                <p className={`text-xs text-zinc-300 leading-relaxed line-clamp-3 ${isMyanmar ? 'font-myanmar leading-[1.7]' : ''}`}>
                  {chap.description}
                </p>

                {/* 2x2 Compact Feature Badges Grid on Mobile */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {chap.features.slice(0, 4).map((feat, fIdx) => (
                    <div 
                      key={fIdx} 
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-1.5 text-[11px] text-zinc-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={`line-clamp-2 ${isMyanmar ? 'font-myanmar leading-tight' : 'leading-tight'}`}>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchChapter(chap.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition"
                >
                  <span>Launch {chap.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}
        </div>

      </div>
    </section>
  );
};
