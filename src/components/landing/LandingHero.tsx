import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Compass
} from 'lucide-react';
import { Language } from '../../types';
import { ImageStreamHero, StreamImage } from '../ui/image-stream-hero';

interface LandingHeroProps {
  language: Language;
  onLaunch: () => void;
  onOpenDemo?: () => void;
  onOpenScenes?: () => void;
}

const HERITAGE_TOP_16_SCENES: StreamImage[] = [
  {
    src: '/scenes/bagan-ananda-temple-sunset.jpg',
    title: 'Bagan Ananda Stupa Terraces',
    badge: 'BAGAN HERITAGE'
  },
  {
    src: '/scenes/mandalay-palace-throne-hall.jpg',
    title: 'Mandalay Royal Palace Throne Hall',
    badge: 'ROYAL COURT'
  },
  {
    src: '/scenes/amarapura-u-bein-bridge-sunset.jpg',
    title: 'Amarapura U Bein Bridge Sunset',
    badge: 'ANCIENT TEAKWOOD'
  },
  {
    src: '/scenes/royal-burmese-peacock-wedding-arch.jpg',
    title: 'Royal Peacock Wedding Arch',
    badge: 'BRIDAL LUXURY'
  },
  {
    src: '/scenes/sagaing-hills-u-min-thonze.jpg',
    title: 'Sagaing Hills U Min Thonze',
    badge: 'PAGODA CORRIDOR'
  },
  {
    src: '/scenes/pindaya-limestone-golden-cave.jpg',
    title: 'Pindaya Limestone Golden Cave',
    badge: 'SACRED ARCHIVE'
  },
  {
    src: '/scenes/royal-crystal-chandelier-ballroom.jpg',
    title: 'Royal Crystal Grand Ballroom',
    badge: 'CINEMATIC STUDIO'
  },
  {
    src: '/scenes/floating-candle-lantern-festival.jpg',
    title: 'Floating Candle Lantern Festival',
    badge: 'INLE LIGHTS'
  },
  {
    src: '/scenes/monsoon-rain-steamy-window.jpg',
    title: 'Monsoon Rain Velvet Ambience',
    badge: 'ATMOSPHERE'
  },
  {
    src: '/scenes/cyberpunk-neon-rooftop-yangon.jpg',
    title: 'Yangon Cyberpunk Neon Rooftop',
    badge: 'NEO-BURMESE'
  },
  {
    src: '/scenes/heritage-set-100.jpg',
    title: 'Bagan Terracotta Horizon',
    badge: '8K RELIGHTED'
  },
  {
    src: '/scenes/heritage-set-102.jpg',
    title: 'Konbaung Teakwood Pillars',
    badge: 'PALACE ARCHIVE'
  },
  {
    src: '/scenes/heritage-set-104.jpg',
    title: 'Mrauk-U Ancient Stone Chambers',
    badge: 'RAKHINE HERITAGE'
  },
  {
    src: '/scenes/heritage-set-106.jpg',
    title: 'Shwedagon Gilded Bell Spire',
    badge: 'GOLDEN DOME'
  },
  {
    src: '/scenes/wedding-set-100.jpg',
    title: 'Burmese Royal Silk Wedding Suite',
    badge: 'TRADITIONAL SILK'
  },
  {
    src: '/scenes/wedding-set-105.jpg',
    title: 'Golden Lotus Floral Altar',
    badge: 'MODERN WEDDING'
  }
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  language,
  onLaunch,
  onOpenDemo,
  onOpenScenes
}) => {
  const isMm = language === 'my';

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center pt-20 pb-10 sm:pt-32 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07090e]"
    >
      {/* 🌟 Ambient Lighting & Cyber Nebulae */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Tech Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '48px 48px, 96px 96px, 96px 96px'
          }}
        />

        {/* Top Center Emerald & Teal Radial Bloom */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-b from-emerald-500/20 via-teal-500/12 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-[450px] h-[350px] bg-teal-500/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[350px] bg-emerald-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6 sm:space-y-10">
        
        {/* ============================================================= */}
        {/* TOP: Tagline Badge, Cinematic Headline, Subtitle & Action Bar */}
        {/* ============================================================= */}
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          
          {/* Badge/Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-emerald-500/10 backdrop-blur-xl ${
              isMm ? 'font-myanmar' : 'font-google-sans'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              {isMm
                ? '✨ မြန်မာ့ပထမဆုံး AI ဓာတ်ပုံနှင့် ဗီဒီယို စတူဒီယို'
                : '✨ The Next-Generation Burmese AI Creative Studio'}
            </span>
          </motion.div>

          {/* Main Headline (Anton / Noto Sans Myanmar Display Typography) */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`tracking-tight text-white leading-[1.18] sm:leading-[1.16] ${
              isMm
                ? 'font-black font-myanmar text-3xl sm:text-5xl lg:text-6xl'
                : 'font-anton tracking-wide uppercase text-4xl sm:text-6xl lg:text-7xl'
            }`}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
              {isMm ? 'မင်းသမီး၊ မင်းသား ဝတ်စုံများမှစ၍ ' : 'From Royal Heritage Attire '}
            </span>
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {isMm ? 'Pro Photo Studio အထိ' : 'to 8K Pro Photo Studio'}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200">
              {isMm ? ' — စက္ကန့်ပိုင်းအတွင်း ဖန်တီးပါ' : ' — Create in Seconds with AI'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className={`text-zinc-300 text-xs sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-2 font-normal ${
              isMm ? 'font-myanmar leading-relaxed' : 'font-google-sans'
            }`}
          >
            {isMm
              ? 'မြန်မာ့သမိုင်းဝင် နန်းတွင်း၊ ပုဂံ၊ မြောက်ဦး ၇၆၈+ ရှုခင်းစုံ၊ ၉၉.၈% မျက်နှာသွင်ပြင် ထိန်းသိမ်းမှုနှင့် 8K စတူဒီယို ဓာတ်ပုံများကို စက္ကန့်ပိုင်းအတွင်း ဖန်တီးလိုက်ပါ။'
              : 'Archivally accurate Burmese portraits, 99.8% likeness identity locks, instant background synthesis, and ultra-high-definition 8K photography.'}
          </motion.p>

          {/* Action Button: Primary Launch */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="pt-2 flex items-center justify-center max-w-md mx-auto"
          >
            {/* Primary: Start Creating for Free - 250 Daily Credits */}
            <button
              type="button"
              onClick={onLaunch}
              className={`w-full sm:w-auto px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-black text-sm sm:text-base hover:brightness-110 active:scale-95 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer flex items-center justify-center gap-2.5 group shrink-0 ${
                isMm ? 'font-myanmar font-bold' : 'font-google-sans font-extrabold'
              }`}
            >
              <span>{isMm ? '🚀 စတင်ဖန်တီးမည် — 250 Free Credits' : '🚀 Start Creating for Free — 250 Daily Credits'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </motion.div>

          {/* Social Proof / Trust Micro Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs text-zinc-400 font-tektur"
          >
            <div className="flex items-center gap-1.5 text-zinc-300">
              <div className="flex -space-x-1.5">
                {['#10b981', '#06b6d4', '#8b5cf6'].map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] font-bold text-black"
                    style={{ backgroundColor: color }}
                  >
                    ★
                  </div>
                ))}
              </div>
              <span className="font-semibold text-white">16,400+</span>
              <span>Creators</span>
            </div>

            <span className="text-zinc-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>99.8% Likeness Lock</span>
            </div>

            <span className="text-zinc-600 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5 text-teal-300">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>8K Studio Master</span>
            </div>
          </motion.div>

        </div>

        {/* ============================================================= */}
        {/* 🌟 3D INFINITE STREAM CORRIDOR (The Centerpiece Visual Stage) */}
        {/* ============================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative w-full h-[360px] sm:h-[480px] lg:h-[560px] max-w-7xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-[#0d121c]/60 shadow-2xl backdrop-blur-sm group"
        >
          {/* 3D Perspective Image Stream Corridor */}
          <ImageStreamHero
            images={HERITAGE_TOP_16_SCENES}
            cards={11}
            speed={22}
            axis={50}
            path={{
              perspective: 28,
              cardWidth: 19,
              cardHeight: 27,
              cardRadius: 0.6,
              birthHeight: 2.8,
              exitHeight: 48,
              railBirth: -12,
              railExit: 45,
              fan: 3.2,
              turnBirth: 7,
              turnExit: 30
            }}
            className="w-full h-full"
            onCardClick={() => {
              if (onOpenScenes) onOpenScenes();
              else onLaunch();
            }}
          >
            {/* Ambient Radial Vignette */}
            <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#07090e]/20 to-[#07090e]/80" />
          </ImageStreamHero>

          {/* Top Edge Gradient Shadow */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#07090e] via-[#07090e]/40 to-transparent pointer-events-none" />

          {/* Bottom Interactive Bar Floating over Corridor */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-2 sm:p-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-white">
                {isMm ? '၇၆၈+ သမိုင်းဝင် ဗိသုကာနှင့် ရုပ်ရှင်အဆင့် ရှုခင်းစုံ' : '768+ Archival Heritage & 8K Cinema Sets'}
              </span>
              <span className="text-zinc-500 hidden sm:inline">—</span>
              <span className="text-zinc-400 text-[11px] hidden sm:inline">
                {isMm ? 'ပုံပေါ်သို့ နှိပ်၍ အပြည့်အစုံ ကြည့်ရှုနိုင်ပါသည်' : 'Click any card to inspect scene'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenScenes}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-black text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isMm ? '၇၆၈+ ရှုခင်းအားလုံး ကြည့်မည်' : 'Explore All 768+ Scenes'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default LandingHero;
