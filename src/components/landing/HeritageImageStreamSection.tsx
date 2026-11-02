import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { ImageStreamHero, StreamImage } from '../ui/image-stream-hero';
import { Language } from '../../types';

interface HeritageImageStreamSectionProps {
  language: Language;
  onOpenScenes?: () => void;
  onLaunch?: () => void;
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

export const HeritageImageStreamSection: React.FC<HeritageImageStreamSectionProps> = ({
  language,
  onOpenScenes,
  onLaunch
}) => {
  const isMm = language === 'my';

  return (
    <section 
      id="heritage-corridor"
      className="relative w-full bg-[#07090e] border-y border-white/5 py-12 sm:py-20 overflow-hidden"
    >
      {/* Background radial gradient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8 sm:mb-12 text-center">
        {/* Micro Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-4 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>
            {isMm ? '၇၆၈+ သမိုင်းဝင် ဗိသုကာနှင့် ရုပ်ရှင်အဆင့် ဒစ်ဂျစ်တယ် ရှုခင်းစုံ' : '768+ Archival Heritage & 8K Cinema Stream'}
          </span>
        </motion.div>

        {/* Main Headline (Inspired by reference) */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4"
        >
          {isMm ? (
            <>
              မြန်မာ့အမွေအနှစ် ရှုခင်းများ၊{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                အလယ်ဗဟိုမှ စီးဆင်းမှု
              </span>
            </>
          ) : (
            <>
              Your Heritage,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Front and Centre.
              </span>
            </>
          )}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          {isMm
            ? 'ဖော်ပြချက်များ ဖတ်ရှုနေစရာမလိုဘဲ တကယ့် ပုံရိပ်စစ်များဖြင့် ဦးဆောင်ပြသထားသည်။ ပုဂံ၊ မန္တလေးရွှေနန်းတော်၊ အင်းလေးမှစ၍ 768+ ရှုခင်းစုံ အနောက်ဘက် ဗဟိုမှ အဆုံးမရှိ ခွဲထွက်စီးဆင်းနေပါသည်။'
            : 'A corridor that leads with the images instead of describing them. Over 768+ authentic Burmese archival sets and cinema backdrops ride out from the vanishing point in endless perspective.'}
        </motion.p>
      </div>

      {/* 🌟 3D Perspective Image Stream Corridor */}
      <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[540px] max-w-7xl mx-auto">
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
          }}
        >
          {/* Subtle Center Dimmer / Overlay Gradient to keep text readable */}
          <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#07090e]/20 to-[#07090e]/80" />
        </ImageStreamHero>
      </div>

      {/* Bottom Interactive Controls & Trust Strips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-zinc-400 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Anti-Hallucination Guardrails
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-400 font-semibold">
            338+ Heritage Sets
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-teal-300">
            130+ Wedding
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenScenes}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{isMm ? '၇၆၈+ ရှုခင်းအားလုံး ကြည့်မည်' : 'Explore All 768+ Scenes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onLaunch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <span>{isMm ? 'ဖန်တီးမှု စတင်မည်' : 'Launch Studio'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeritageImageStreamSection;
