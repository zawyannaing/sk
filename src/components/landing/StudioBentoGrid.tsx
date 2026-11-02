import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  Scissors,
  Wand2,
  Palette,
  Wind,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language } from '../../types';

interface StudioBentoGridProps {
  language: Language;
  onLaunchTool?: (toolId: string) => void;
  onOpenScenes?: () => void;
}

export const StudioBentoGrid: React.FC<StudioBentoGridProps> = ({
  language,
  onLaunchTool,
  onOpenScenes
}) => {
  const isMm = language === 'my';
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number>(0);

  const tools = [
    {
      id: 'faceswap',
      title: isMm ? 'မျက်နှာ အစားထိုးခြင်း' : 'Face Swap',
      badge: '99.8% IDENTITY LOCK',
      tagline: isMm ? 'မျက်နှာသွင်ပြင်နှင့် အသားအရေကို ၁၀၀% ထိန်းသိမ်းပေးခြင်း' : 'Preserve facial bone structure, skin micro-pores & head angles',
      desc: isMm
        ? 'သင်၏ မော်ဒယ် သို့မဟုတ် ကိုယ်ပိုင်မျက်နှာကို ကုန်းဘောင်ခေတ်၊ ပုဂံခေတ် နန်းတွင်းဝတ်စုံများနှင့် မင်္ဂလာဝတ်စုံများတွင် သဘာဝကျကျ အစားထိုးနိုင်ပါသည်။'
        : 'Seamlessly transfer your face into royal Konbaung dynasty attire, Bagan court dresses, or luxury wedding sets.',
      icon: UserCheck,
      accent: 'emerald',
      imageBefore: '/landing/faceswap-before.jpg',
      imageAfter: '/landing/faceswap-after.jpg',
      stats: '99.8% Likeness • < 3s',
      cta: isMm ? 'Face Swap စမ်းသပ်မည်' : 'Try Face Swap'
    },
    {
      id: 'bgchange',
      title: isMm ? 'နောက်ခံ ချက်ချင်းပြောင်းလဲခြင်း' : 'Smart BG Change',
      badge: 'RMBG-1.4 NEURAL MATTING',
      tagline: isMm ? 'ဆံပင်စများနှင့် ပိုးထည်အနားသတ်များကို အကြည်လင်ဆုံး ဖြတ်ထုတ်ပေးခြင်း' : 'Sub-pixel boundary feathering with instant scene compositing',
      desc: isMm
        ? 'မော်ဒယ် သို့မဟုတ် ကုန်ပစ္စည်းကို ပုဂံဆည်းဆာ၊ မန္တလေးနန်းတော်၊ အင်းလေးကန် စသည့် မြန်မာ့အထင်ကရ နေရာ ၄၀+ သို့ ချက်ချင်း ပြောင်းလဲပေးပါသည်။'
        : 'Drop subjects into 40+ iconic Burmese locations or commercial podiums with automatic shadow matching.',
      icon: Scissors,
      accent: 'cyan',
      imageBefore: '/landing/bgchange-before.jpg',
      imageAfter: '/landing/bgchange-after.jpg',
      stats: 'Sub-Pixel Precision • 40+ Locs',
      cta: isMm ? 'နောက်ခံ ပြောင်းလဲမည်' : 'Try BG Change'
    },
    {
      id: 'skin-retouch',
      title: isMm ? 'AI Skin Retouch' : 'Skin Retouch',
      badge: 'MICRO-TEXTURE RETOUCH',
      tagline: isMm ? 'အသားအရေ အမဲစက် ဖယ်ရှားပြီး သဘာဝကျကျ ဝင်းပစေခြင်း' : 'Natural pore preservation with dewy studio finish',
      desc: isMm
        ? 'ဝါးတားတား မဖြစ်စေဘဲ အရေပြား၏ သဘာဝအပေါက်ငယ်များ၊ မျက်ဝန်းအလင်းပြန်မှုများကို ထိန်းသိမ်းပြီး စတူဒီယိုအဆင့် အသားအရေ ပြင်ဆင်ပေးပါသည်။'
        : 'Professional studio portrait retouching without plastic blurring. Retains skin micro-texture, corneal reflections, and dewy radiance.',
      icon: Wand2,
      accent: 'amber',
      imageBefore: '/landing/edit-before.jpg',
      imageAfter: '/landing/edit-after.jpg',
      stats: '8K Micro Pores • Zero Blur',
      cta: isMm ? 'Skin Retouch စမ်းမည်' : 'Try Retouch'
    },
    {
      id: 'virtual-makeup',
      title: isMm ? 'Virtual Makeup' : 'Virtual Makeup',
      badge: 'SPECTRAL BLENDING',
      tagline: isMm ? 'သနပ်ခါး၊ နှုတ်ခမ်းနီနှင့် ရိုးရာ မိတ်ကပ် အလှဆင်ခြင်း' : 'Traditional Thanaka & royal high-fashion cosmetics',
      desc: isMm
        ? 'မြန်မာ့ရိုးရာ ဘီးကျဲသနပ်ခါး၊ ပါးကွက်သနပ်ခါးများမှစ၍ ခေတ်ပေါ် နန်းဆန်သော နှုတ်ခမ်းနီ၊ ပါးနီနှင့် မျက်ဝန်းမိတ်ကပ်များကို ရွေးချယ်နိုင်ပါသည်။'
        : 'Apply traditional Thanaka cheek patterns or royal crimson cosmetics, soft glam blush, and cinematic eyeshadow with natural light blending.',
      icon: Palette,
      accent: 'rose',
      imageBefore: '/landing/faceswap-before.jpg',
      imageAfter: '/scenes/mandalay-palace-throne-hall.jpg',
      stats: 'Authentic Thanaka • 24 Palette',
      cta: isMm ? 'Makeup ပြင်ဆင်မည်' : 'Try Virtual Makeup'
    },
    {
      id: 'hair-transform',
      title: isMm ? 'Hair Transformation' : 'Hair Transform',
      badge: 'VOLUMETRIC STRAND SYNTHESIS',
      tagline: isMm ? 'နန်းတွင်းဆံထုံး၊ ပန်းကုံးဆင်ယင်မှုနှင့် ခေတ်မီဆံပင်ဒီဇိုင်း' : 'Royal Sadon hairdos, jasmine garlands & modern styles',
      desc: isMm
        ? 'ကုန်းဘောင်ခေတ် စမ္ပယ်တင် ဆံထုံး၊ စပယ်ပန်းကုံးဆင်ယင်မှုများ သို့မဟုတ် ခေတ်ပေါ် ဆံပင်အရောင်နှင့် ပုံစံများကို အလွယ်တကူ ပြောင်းလဲနိုင်ပါသည်။'
        : 'Synthesize authentic Konbaung high-society hairdos adorned with fresh jasmine or explore modern haircuts with dynamic volume.',
      icon: Wind,
      accent: 'purple',
      imageBefore: '/landing/wedding-before.jpg',
      imageAfter: '/landing/wedding-after.jpg',
      stats: 'Volumetric Strands • Hair Color Lock',
      cta: isMm ? 'Hair Style ပြောင်းမည်' : 'Try Hair Transform'
    },
    {
      id: 'scenes-768',
      title: isMm ? '768+ မြန်မာ့ရိုးရာ Scenes' : '768+ Burmese & Global Scenes',
      badge: 'HERITAGE PRESERVATION MATRIX',
      tagline: isMm ? 'ပုဂံ၊ မန္တလေး၊ အင်းလေးနှင့် ကမ္ဘာ့အဆင့်မီ စတူဒီယို နေရာပေါင်းစုံ' : 'Complete archival cultural & cinematic destination library',
      desc: isMm
        ? 'ပုဂံဆည်းဆာ၊ မန္တလေးရတနာပုံနန်းတော်၊ ဦးပိန်တံတား၊ ကလောထင်းရှူးတောနှင့် ဥရောပမှန်နန်းတော် အစရှိသော 768+ နေရာများကို ၁ ချက်နှိပ် ရွေးချယ်နိုင်ပါသည်။'
        : 'Explore ancient temple terraces, royal throne halls, mist-covered pine chapels, and cyberpunk Yangon rooftops pre-calibrated in 8K.',
      icon: Compass,
      accent: 'emerald',
      imageBefore: '/scenes/amarapura-u-bein-bridge-sunset.jpg',
      imageAfter: '/scenes/bagan-ananda-temple-sunset.jpg',
      stats: '768+ Locations • 8K Calibrated',
      cta: isMm ? '768+ Scenes ကြည့်မည်' : 'Explore 768+ Scenes'
    }
  ];

  const handleCardClick = (toolId: string) => {
    if (toolId === 'scenes-768' && onOpenScenes) {
      onOpenScenes();
    } else if (onLaunchTool) {
      onLaunchTool(toolId);
    }
  };

  const activeMobileTool = tools[mobileActiveIndex];
  const MobileToolIcon = activeMobileTool.icon;

  return (
    <section id="bento-tools" className="relative py-10 sm:py-20 lg:py-28 bg-[#07090e] overflow-hidden">
      
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-14 lg:mb-16 space-y-2.5 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>ALL-IN-ONE AI STUDIO BENTO GRID</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {isMm ? (
              <>
                ခေတ်မီ အဆင့်မြင့် <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">AI Core Tools (၆) မျိုး</span>
              </>
            ) : (
              <>
                Supercharge Your Creativity with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">6 Core AI Engines</span>
              </>
            )}
          </h2>

          <p className="text-zinc-400 text-xs sm:text-base leading-relaxed max-w-xl mx-auto">
            {isMm
              ? 'နန်းတွင်း ဝတ်စုံများ၊ မျက်နှာအစားထိုးခြင်းမှသည် စတူဒီယို အသားအရေ ပြင်ဆင်မှုနှင့် နောက်ခံဖယ်ရှားမှုအထိ AI ဖြင့် အပြည့်အစုံ ဖန်တီးနိုင်ပါသည်။'
              : 'From 99.8% likeness archival face swapping to instant background matting and delicate beauty retouching — all unified in one seamless studio.'}
          </p>
        </div>

        {/* ================================================================= */}
        {/* 📱 MOBILE VIEW: Horizontal Snap Swipe Cards + Quick Tab Switcher */}
        {/* ================================================================= */}
        <div className="block md:hidden space-y-3">
          
          {/* Horizontal Quick-Select Tool Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 px-0.5">
            {tools.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = mobileActiveIndex === idx;

              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setMobileActiveIndex(idx);
                    const el = document.getElementById(`snap-card-${tool.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border flex-shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                      : 'bg-white/5 text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.title}</span>
                </button>
              );
            })}
          </div>

          {/* Horizontal Snap Cards Carousel (Swipe Left/Right effortlessly) */}
          <div 
            className="flex items-stretch gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 px-1"
            onScroll={(e) => {
              const target = e.currentTarget;
              const cardWidth = target.firstElementChild ? (target.firstElementChild as HTMLElement).offsetWidth + 14 : 300;
              const newIdx = Math.round(target.scrollLeft / cardWidth);
              if (newIdx >= 0 && newIdx < tools.length && newIdx !== mobileActiveIndex) {
                setMobileActiveIndex(newIdx);
              }
            }}
          >
            {tools.map((tool, idx) => {
              const ToolIcon = tool.icon;
              const isActive = mobileActiveIndex === idx;

              return (
                <div
                  key={tool.id}
                  id={`snap-card-${tool.id}`}
                  onClick={() => handleCardClick(tool.id)}
                  className={`w-[85vw] max-w-[320px] shrink-0 snap-center rounded-2xl bg-[#0d121c] border p-4 space-y-3 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Bar: Icon + Title + Counter */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <ToolIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {tool.title}
                        </h3>
                        <span className="text-[10px] text-emerald-400/90 font-medium truncate block">
                          {tool.tagline}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                      0{idx + 1} / 06
                    </span>
                  </div>

                  {/* Visual Image Preview */}
                  <div className="relative h-40 w-full rounded-xl overflow-hidden bg-black/50 border border-white/10">
                    <img
                      src={tool.imageAfter}
                      alt={tool.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10">
                      <span>✨ AI Enhanced</span>
                      <span className="text-emerald-400 font-mono">{tool.stats}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {tool.desc}
                  </p>

                  {/* Bottom Action Button */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(tool.id);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>{tool.cta}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Snap Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {tools.map((tool, idx) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setMobileActiveIndex(idx);
                  const el = document.getElementById(`snap-card-${tool.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`transition-all rounded-full ${
                  mobileActiveIndex === idx
                    ? 'w-5 h-1.5 bg-emerald-400'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* ================================================================= */}
        {/* 💻 DESKTOP VIEW: Full 6-Card Symmetrical Bento Grid               */}
        {/* ================================================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isHovered = activeHoverId === tool.id;

            return (
              <div
                key={tool.id}
                onMouseEnter={() => setActiveHoverId(tool.id)}
                onMouseLeave={() => setActiveHoverId(null)}
                onClick={() => handleCardClick(tool.id)}
                className="group relative rounded-2xl bg-[#0d121c]/90 border border-white/10 hover:border-emerald-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-xl"
              >
                {/* Subtle Card Background Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-300 shadow-md">
                      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                    </div>

                    <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Visual Image Preview / Before-After Teaser */}
                  <div className="relative h-44 w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 group-hover:border-emerald-500/30 transition-all duration-300">
                    <img
                      src={isHovered ? tool.imageAfter : tool.imageBefore}
                      alt={tool.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d121c] via-transparent to-transparent opacity-80" />

                    {/* Floating Pill on image */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-medium text-white/90 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                      <span>{isHovered ? '✨ Enhanced Result' : '📷 Original Source'}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">{tool.stats}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                      <span>{tool.title}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs font-semibold text-emerald-400/90 tracking-wide">
                      {tool.tagline}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA Action Button */}
                <div className="relative z-10 pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tool.cta}</span>
                  </span>

                  <span className="text-[11px] text-zinc-500 font-mono group-hover:text-emerald-400 transition-colors">
                    1-Click AI ➔
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
