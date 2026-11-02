import React from 'react';
import { Star, ShieldCheck, Sparkles, Users, Award, Zap } from 'lucide-react';
import { Language } from '../../types';

interface SocialProofTrustBarProps {
  language: Language;
}

export const SocialProofTrustBar: React.FC<SocialProofTrustBarProps> = ({ language }) => {
  const isMm = language === 'my';

  const trustMetrics = [
    {
      icon: Zap,
      label: isMm ? 'ဖန်တီးပြီးသော ဓာတ်ပုံများ' : 'AI Photos Generated',
      value: '120,000+'
    },
    {
      icon: ShieldCheck,
      label: isMm ? 'မျက်နှာသွင်ပြင် တိကျမှု' : 'Face Likeness Lock',
      value: '99.8%'
    },
    {
      icon: Sparkles,
      label: isMm ? 'နေ့စဉ် အခမဲ့ Credits' : 'Daily Free Credits',
      value: '250 Pts'
    },
    {
      icon: Award,
      label: isMm ? 'မြန်မာ့သမိုင်းဝင် Scenes' : 'Archival Scenes',
      value: '768+ Presets'
    }
  ];

  const studios = [
    'Yangon Creative Labs',
    'Mandalay Royal Archives',
    'Bagan VFX Studio',
    'Myanmar Wedding Guild',
    'Shan Highland Cinematics'
  ];

  return (
    <section className="relative z-20 py-4 sm:py-8 bg-[#07090e]/90 border-y border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Trust Banner */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-10">
          
          {/* Left: Star Ratings & Creator Avatars */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-center sm:text-left">
            {/* Overlapping User Avatars */}
            <div className="flex items-center -space-x-2.5 sm:-space-x-3">
              {[
                { name: 'Khin', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
                { name: 'Min', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
                { name: 'Thida', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face' },
                { name: 'Aung', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
              ].map((creator, i) => (
                <div
                  key={i}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#07090e] border border-emerald-400/40 overflow-hidden shadow-md"
                >
                  <img
                    src={creator.img}
                    alt={creator.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] sm:text-xs font-bold flex items-center justify-center shadow-md backdrop-blur-sm">
                +10k
              </div>
            </div>

            {/* Stars & Trust Text */}
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                  />
                ))}
                <span className="text-white text-xs sm:text-sm font-bold ml-1.5">
                  4.9 / 5
                </span>
                <span className="text-zinc-400 text-[11px] sm:text-xs hidden xs:inline">
                  (1,840+ reviews)
                </span>
              </div>
              <p className="text-[11px] sm:text-sm text-zinc-300 font-medium tracking-wide">
                {isMm
                  ? 'မြန်မာနိုင်ငံတစ်ဝန်း Creator နှင့် စတူဒီယိုပေါင်း ၁၀,၀၀၀+ ယုံကြည်စွာ အသုံးပြုလျက်ရှိသည်'
                  : 'Trusted by 10,000+ Burmese Creators & Professional Studios'}
              </p>
            </div>
          </div>

          {/* Right: Key Quantitative Metric Badges (Compact 2x2 Grid on Mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
            {trustMetrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div
                  key={idx}
                  className="px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition duration-300 text-center flex flex-col items-center justify-center group"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs sm:text-base tracking-tight group-hover:scale-105 transition-transform">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{metric.value}</span>
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-zinc-400 mt-0.5 whitespace-nowrap">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Subtle Horizontal Studios Ticker */}
        <div className="mt-3.5 sm:mt-6 pt-3 sm:pt-5 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-1.5 text-[10px] sm:text-xs text-zinc-400 uppercase tracking-widest font-mono">
          <span className="text-emerald-500 font-semibold tracking-normal normal-case font-sans">
            Verified Studio Partners:
          </span>
          {studios.map((studio, i) => (
            <span key={i} className="hover:text-emerald-400 transition-colors">
              {studio}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
};
