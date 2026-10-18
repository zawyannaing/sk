import React from 'react';
import { 
  Video, 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Film, 
  Sliders, 
  Image as ImageIcon, 
  Cpu, 
  Flame,
  ShieldCheck,
  CheckCircle2,
  Workflow
} from 'lucide-react';

export type MainSectionType = 'video-prompt' | 'photo-prompt' | 'detail-burmese';

interface MainPortalHubProps {
  onSelectSection: (section: MainSectionType) => void;
  onOpenSlides?: () => void;
}

export const MainPortalHub: React.FC<MainPortalHubProps> = ({ 
  onSelectSection, 
  onOpenSlides 
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#090a0f] text-white flex flex-col justify-center overflow-x-hidden selection:bg-[#ccff00] selection:text-black">
      
      {/* Background Ambient Glow Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00ffcc]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#ec4899]/10 rounded-full blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#ffd02f]/10 rounded-full blur-[140px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center">
        
        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800/80 text-xs text-zinc-300 mb-6 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-[11px] tracking-wider uppercase text-zinc-400">
            Show AI Studio Suite · 3 Specialized Sections
          </span>
          <span className="text-[10px] bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded-full font-bold">
            v2.5
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-4">
            Generative AI Studio
            <br />
            <span className="bg-gradient-to-r from-[#ccff00] via-[#ffd02f] to-[#ff5ca8] bg-clip-text text-transparent">
              Creative Workstation
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Select a specialized studio section below. Each workspace is equipped with dedicated prompt engines, optical simulation, camera rigs, and production utilities.
          </p>
        </div>

        {/* 🌟 3 ANIMATED INTERACTIVE SECTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          
          {/* ================= SECTION 1: VIDEO PROMPT STUDIO ================= */}
          <div
            onClick={() => onSelectSection('video-prompt')}
            className="group relative rounded-3xl bg-gradient-to-b from-[#12141c] to-[#0c0d12] border border-zinc-800/80 hover:border-[#ccff00]/60 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(204,255,0,0.18)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Neon Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#ccff00]/5 rounded-bl-full blur-2xl group-hover:bg-[#ccff00]/15 transition-all duration-500" />
            
            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-[#ccff00] shadow-inner group-hover:scale-110 group-hover:bg-[#ccff00]/10 transition-all duration-300">
                  <Video className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-[#ccff00] uppercase font-bold tracking-wider">
                  <Film className="w-3.5 h-3.5" />
                  Section 01
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-[#ccff00] transition-colors flex items-center gap-2">
                Video Prompt Studio
                <span className="inline-block w-2 h-2 rounded-full bg-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Engineered specifically for next-gen text-to-video AI. Generate director-grade cinematic paragraphs or strictly structured camera JSON.
              </p>

              {/* Model Support Badges */}
              <div className="mb-6">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  Optimized For Video Models:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Veo', 'Sora', 'Kling', 'Hailuo', 'Wan', 'Seedance 2.5'].map((m) => (
                    <span 
                      key={m}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-900/80 text-zinc-300 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Features List */}
              <div className="space-y-2.5 mb-8 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>Dual Output: <b>JSON</b> & <b>NORMAL</b> Director Text</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>Optics & Kinetic Camera Motion (Dolly, Drone, Roll)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>20+ Character Reference Styles & Quick Idea Chips</span>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 group-hover:bg-[#ccff00] text-zinc-200 group-hover:text-black font-semibold text-xs sm:text-sm flex items-center justify-between transition-all duration-300 border border-zinc-800 group-hover:border-[#ccff00] shadow-md">
              <span className="font-mono tracking-wide uppercase">Open Video Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>


          {/* ================= SECTION 2: PHOTO PROMPT STUDIO ================= */}
          <div
            onClick={() => onSelectSection('photo-prompt')}
            className="group relative rounded-3xl bg-gradient-to-b from-[#151218] to-[#0d0a0f] border border-zinc-800/80 hover:border-pink-500/60 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(236,72,153,0.18)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Pink Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/5 rounded-bl-full blur-2xl group-hover:bg-pink-500/15 transition-all duration-500" />

            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-pink-400 shadow-inner group-hover:scale-110 group-hover:bg-pink-500/10 transition-all duration-300">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-pink-400 uppercase font-bold tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Section 02
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors flex items-center gap-2">
                Photo Prompt Studio
                <span className="inline-block w-2 h-2 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                High-end photography workbench. Simulates 100MP medium-format optics, studio lighting rigs, and includes multimodal Vision Photo-to-Prompt.
              </p>

              {/* Model Support Badges */}
              <div className="mb-6">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  Optimized For Photo Engines:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Midjourney v6.1', 'FLUX.1 Dev', 'SDXL 1.0', 'Ideogram 2', 'GPT Image'].map((m) => (
                    <span 
                      key={m}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-900/80 text-zinc-300 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Features List */}
              <div className="space-y-2.5 mb-8 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span><b>Photo to Prompt</b> Vision Mode (Reverse-Engineer)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Hasselblad X2D 100C Optics & Rembrandt Lighting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>Auto-Polish Magic Wand & 16-Image Canvas Reference</span>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 group-hover:bg-pink-500 text-zinc-200 group-hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-between transition-all duration-300 border border-zinc-800 group-hover:border-pink-500 shadow-md">
              <span className="font-mono tracking-wide uppercase">Open Photo Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>


          {/* ================= SECTION 3: DETAIL BURMESE (8-ROOM & UTILITIES) ================= */}
          <div
            onClick={() => onSelectSection('detail-burmese')}
            className="group relative rounded-3xl bg-gradient-to-b from-[#181611] to-[#0d0c08] border border-zinc-800/80 hover:border-[#ffd02f]/70 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,208,47,0.2)] cursor-pointer overflow-hidden"
          >
            {/* Ambient Corner Gold Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#ffd02f]/5 rounded-bl-full blur-2xl group-hover:bg-[#ffd02f]/15 transition-all duration-500" />

            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-[#ffd02f] shadow-inner group-hover:scale-110 group-hover:bg-[#ffd02f]/10 transition-all duration-300">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-[#ffd02f] uppercase font-bold tracking-wider">
                  <Workflow className="w-3.5 h-3.5" />
                  Section 03
                </div>
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-[#ffd02f] transition-colors flex items-center gap-2">
                Detail Burmese
                <span className="inline-block w-2 h-2 rounded-full bg-[#ffd02f] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h2>
              <div className="text-[11px] font-mono text-[#ffd02f]/90 mb-2">
                ၈ ခန်းတွဲ စတူဒီယို နှင့် အထူးပြု Utilities စနစ်
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                Complete 8-Room AI Photography Studio Suite, Burmese Cultural Heritage Matrix, Inpaint Clothes Swap, Baby Studio, Restoration, and Pro Utilities.
              </p>

              {/* Suite Utilities Tags */}
              <div className="mb-6">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
                  Integrated Utilities & Rooms:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['8-Room Suite', 'Prompt Matrix', 'Clothes Swap', 'Background Harmonizer', 'Baby Studio', 'Old to New Restore', 'Pro Utilities'].map((m) => (
                    <span 
                      key={m}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-900/80 text-zinc-300 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Features List */}
              <div className="space-y-2.5 mb-8 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd02f] shrink-0" />
                  <span><b>8-Room Dedicated Studio</b> (Headshot, Fashion, Heritage, Cinema)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd02f] shrink-0" />
                  <span><b>Burmese Prompt Matrix</b> (Bagan, Inle, Silk, Thanaka, Mogok)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ffd02f] shrink-0" />
                  <span><b>Full Pro Utilities</b> (Secret keywords, negative matrix, presets)</span>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 group-hover:bg-[#ffd02f] text-zinc-200 group-hover:text-black font-semibold text-xs sm:text-sm flex items-center justify-between transition-all duration-300 border border-zinc-800 group-hover:border-[#ffd02f] shadow-md">
              <span className="font-mono tracking-wide uppercase">Open Detail Burmese</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </div>

        </div>

        {/* Bottom Quick Feature Highlights */}
        <div className="mt-12 sm:mt-16 w-full pt-8 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>High-Fidelity Prompt Architecture · Zero Loss Synthesis</span>
          </div>

          {onOpenSlides && (
            <button
              type="button"
              onClick={onOpenSlides}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">slideshow</span>
              <span>မြန်မာဘာသာ သင်ခန်းစာ Slides ကြည့်ရန်</span>
            </button>
          )}

          <div className="flex items-center gap-4">
            <span>Responsive Mobile & Desktop</span>
            <span>·</span>
            <span>All Generative Engines</span>
          </div>
        </div>

      </div>

    </div>
  );
};
