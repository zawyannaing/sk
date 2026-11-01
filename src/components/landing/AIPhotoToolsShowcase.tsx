import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Image as ImageIcon, Wand2, Sparkles, CheckCircle2, ArrowRight, Eye, RefreshCw, Zap, Shield } from 'lucide-react';
import { Language } from '../../types';

interface AIPhotoToolsShowcaseProps {
  language: Language;
  onLaunch: () => void;
}

type ToolTabKey = 'faceswap' | 'bgchange' | 'editimage';

interface ToolDetail {
  id: ToolTabKey;
  labelEn: string;
  labelMm: string;
  badgeEn: string;
  badgeMm: string;
  titleEn: string;
  titleMm: string;
  descriptionEn: string;
  descriptionMm: string;
  bulletsEn: string[];
  bulletsMm: string[];
  specs: { label: string; value: string }[];
  beforeImage: string;
  afterImage: string;
  beforeLabelEn: string;
  beforeLabelMm: string;
  afterLabelEn: string;
  afterLabelMm: string;
}

const TOOLS_DATA: ToolDetail[] = [
  {
    id: 'faceswap',
    labelEn: 'Face Swap',
    labelMm: 'မျက်နှာ အစားထိုးခြင်း',
    badgeEn: 'INSIGHTFACE-REACTOR 1-CLICK IDENTITY LOCK',
    badgeMm: 'INSIGHTFACE-REACTOR တစ်ချက်နှိပ် မျက်နှာအစားထိုးစနစ်',
    titleEn: 'Archivally Accurate Burmese Face Swap & Identity Locking',
    titleMm: 'မြန်မာ့သမိုင်းဝင် မင်းညီမင်းသား၊ မင်းသမီး ဝတ်စုံများတွင် မျက်နှာ အစားထိုးခြင်း',
    descriptionEn:
      'Seamlessly transfer your face or model portraits into royal Konbaung dynasty attire, Bagan court dresses, or contemporary Burmese wedding sets while preserving facial bone structure, skin micro-pores, and head angles.',
    descriptionMm:
      'သင်၏ ကိုယ်ပိုင်မျက်နှာ သို့မဟုတ် မော်ဒယ်ပုံရိပ်များကို ကုန်းဘောင်ခေတ်၊ ပုဂံခေတ် နန်းတွင်းဝတ်စုံများနှင့် မင်္ဂလာဝတ်စုံများတွင် သဘာဝကျစွာ အစားထိုးနိုင်ပါသည်။ မျက်နှာသွင်ပြင်နှင့် အသားအရေကို ၁၀၀% နီးပါး တိကျစွာ ထိန်းသိမ်းပေးပါသည်။',
    bulletsEn: [
      '99.8% Identity & facial symmetry preservation',
      'Harmonious ambient lighting & skin tone matching',
      'Flawless blending with traditional Yin-zee headwear and floral combs',
      'Zero synthetic blur; ultra-crisp eye and corneal reflections'
    ],
    bulletsMm: [
      'မျက်နှာသွင်ပြင်နှင့် အချိုးအစားကို ၉၉.၈% တိကျစွာ ထိန်းသိမ်းပေးခြင်း',
      'ပတ်ဝန်းကျင် အလင်းအမှောင်နှင့် အသားအရေအရောင်ကို သဘာဝကျစွာ ညှိယူပေးခြင်း',
      'ရိုးရာဆံထုံး၊ ပန်းကုံးနှင့် ခေါင်းပေါင်း အဆင်တန်ဆာများနှင့် အပြစ်အနာအဆာကင်းစွာ ပေါင်းစပ်ခြင်း',
      'ဝေဝါးမှုမရှိဘဲ မျက်ဝန်းနှင့် မျက်နှာသွင်ပြင်ကို အကြည်လင်ဆုံး ဖော်ပြပေးခြင်း'
    ],
    specs: [
      { label: 'Identity Lock', value: '99.8%' },
      { label: 'Processing Speed', value: '< 3.2s' },
      { label: 'Max Fidelity', value: '8K UHD' }
    ],
    beforeImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=700&auto=format&fit=crop&q=80',
    beforeLabelEn: 'Source Portrait Photo',
    beforeLabelMm: 'မူရင်း လူမျက်နှာ ဓာတ်ပုံ',
    afterLabelEn: 'Royal Dynasty Swapped Masterpiece',
    afterLabelMm: 'နန်းတွင်းဝတ်စုံဖြင့် မျက်နှာအစားထိုးထားသော ပုံရိပ်'
  },
  {
    id: 'bgchange',
    labelEn: 'BG Change',
    labelMm: 'နောက်ခံ အလွယ်တကူ ပြောင်းလဲခြင်း',
    badgeEn: 'RMBG-1.4 NEURAL MATTING & SCENE HARMONIZATION',
    badgeMm: 'RMBG-1.4 အဆင့်မြင့် နောက်ခံဖယ်ရှားပြီး ပေါင်းစပ်မှုစနစ်',
    titleEn: 'Instant Subject Cutout & Iconic Myanmar Environment Compositing',
    titleMm: 'နောက်ခံ ချက်ချင်းဖယ်ရှားပြီး ပုဂံ၊ အင်းလေး၊ နန်းတွင်း နောက်ခံများသို့ ပြောင်းလဲခြင်း',
    descriptionEn:
      'Isolate people or commercial products with sub-pixel boundary feathering that keeps flyaway hair strands and sheer silk untouched. Drop them instantly into 40+ Burmese cultural locations or commercial podiums with automatic cast shadows.',
    descriptionMm:
      'လူ သို့မဟုတ် ကုန်ပစ္စည်းများကို ဆံပင်အမျှင်ကလေးများမှအစ ပါးလွှာသော ပိုးထည်အထိ အတိအကျ ဖြတ်ထုတ်ပေးပါသည်။ ပုဂံနေဝင်ဆည်းဆာ၊ ရွှေတိဂုံ၊ အင်းလေးကန် နှင့် ခေတ်မီ 3D စင်တင် ကြော်ငြာနောက်ခံ ၄၀ ကျော်သို့ ချက်ချင်း ပြောင်းလဲနိုင်ပါသည်။',
    bulletsEn: [
      'Sub-pixel matting preserves delicate silk veils & flying hair strands',
      '40+ Built-in Myanmar locations: Ancient Bagan, Inle Lake, Royal Mandalay Palace',
      'Automatic ambient light bleed and ground contact cast shadows',
      'Instant transparent PNG export or 8K commercial backdrop generation'
    ],
    bulletsMm: [
      'ဆံပင်အမျှင်များနှင့် ပါးလွှာသော ပိုးထည်အစွန်းများကို တိကျစွာ ဖြတ်ထုတ်ပေးခြင်း',
      'ပုဂံ၊ အင်းလေး၊ မန္တလေးနန်းတွင်း စသည့် မြန်မာ့အထင်ကရ နေရာပေါင်း ၄၀ ကျော် ပါဝင်ခြင်း',
      'ပတ်ဝန်းကျင်အရောင် သဘာဝကျကျ ရောယှက်မှုနှင့် ကြမ်းပြင်အရိပ်များကို အလိုအလျောက် တွက်ချက်ပေးခြင်း',
      'Transparent PNG အဖြစ် တိုက်ရိုက်သိမ်းဆည်းနိုင်ခြင်း သို့မဟုတ် 8K နောက်ခံအသစ် ဖန်တီးနိုင်ခြင်း'
    ],
    specs: [
      { label: 'Edge Precision', value: '0.1px' },
      { label: 'Cultural Presets', value: '40+ Scenes' },
      { label: 'Light Bleed Sync', value: 'Automatic' }
    ],
    beforeImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&auto=format&fit=crop&q=80',
    beforeLabelEn: 'Studio Plain Background',
    beforeLabelMm: 'ရိုးရိုးစတူဒီယို နောက်ခံ',
    afterLabelEn: 'Golden Hour Bagan Pagoda Composite',
    afterLabelMm: 'ပုဂံနေဝင်ချိန် နောက်ခံအသစ်ဖြင့် ပေါင်းစပ်ထားသောပုံ'
  },
  {
    id: 'editimage',
    labelEn: 'Edit Image',
    labelMm: 'ပုံရိပ် အဆင့်မြင့် ပြုပြင်ခြင်း',
    badgeEn: 'MULTI-DIFFUSION INPAINTING & TILED 8K DETAIL ENHANCER',
    badgeMm: 'MULTI-DIFFUSION ဖြည့်စွက်ပြင်ဆင်ခြင်းနှင့် TILED 8K အထူးကြည်လင်မှု စနစ်',
    titleEn: 'Generative Retouching, Clothes Swap & 8K Super-Resolution',
    titleMm: 'အဝတ်အစား texture ပြောင်းလဲခြင်း၊ ရတနာဖြည့်စွက်ခြင်းနှင့် 8K စူပါကြည်လင်မှု',
    descriptionEn:
      'Paint over any area to re-texture casual clothes into handwoven Amarapura Luntaya Acheik silk, add traditional Pathein parasols or Mogok ruby jewelry, and upscale standard images into crystal-clear 8K print resolution.',
    descriptionMm:
      'ပုံရိပ်၏ မည်သည့်နေရာကိုမဆို ရိုးရိုးဝတ်စုံမှ အမရပူရ လွန်းရာကျော် ချိတ်ထည်များသို့ ပြောင်းလဲခြင်း၊ ပုသိမ်ထီး၊ မိုးကုတ်ပတ္တမြား စသည့် ရိုးရာအဆင်တန်ဆာများ ဖြည့်စွက်ခြင်းနှင့် 8K Ultra-HD အဆင့်ထိ ကြည်လင်အောင် ပြုပြင်နိုင်ပါသည်။',
    bulletsEn: [
      'Smart Generative Inpainting: Add heirloom jewelry, umbrellas & cultural props',
      'Garment Texture Swap: Modern clothes to traditional royal Luntaya Acheik wave silk',
      'Tiled 8K Super-Resolution with crisp textile threads and gem facets',
      'Commercial poster retouching: 3D typography, lighting highlights & tone grading'
    ],
    bulletsMm: [
      'Smart Generative Inpainting: ပုသိမ်ထီး၊ ပတ္တမြားလည်ဆွဲ၊ ရိုးရာပစ္စည်းများ အလွယ်တကူ ထည့်သွင်းခြင်း',
      'အဝတ်အစားပြောင်းလဲခြင်း: ခေတ်ပေါ်အင်္ကျီမှ နန်းတွင်းရိုးရာ ချိတ်ထည် ပိုးထည်များသို့ ပြောင်းလဲခြင်း',
      'Tiled 8K စူပါကြည်လင်မှု: အဝတ်အထည် ချည်မျှင်များနှင့် ကျောက်မျက်ရတနာများအထိ ထင်းရှားကြည်လင်ခြင်း',
      'စီးပွားရေး ကြော်ငြာဒီဇိုင်း ပြုပြင်ခြင်း: 3D စာလုံး၊ အလင်းရောင်နှင့် အရောင်အသွေး အထူးမွမ်းမံခြင်း'
    ],
    specs: [
      { label: 'Super-Resolution', value: 'Up to 8K' },
      { label: 'Fabric Inpaint', value: '100% Weave Accuracy' },
      { label: 'Prop Library', value: '150+ Cultural Items' }
    ],
    beforeImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&auto=format&fit=crop&q=80',
    afterImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&auto=format&fit=crop&q=80',
    beforeLabelEn: 'Standard Resolution Photo',
    beforeLabelMm: 'သာမန် အရည်အသွေးရှိ ဓာတ်ပုံ',
    afterLabelEn: '8K Ultra-Sharp Retouched Commercial Poster',
    afterLabelMm: '8K အဆင့်မြင့် ပြုပြင်မွမ်းမံထားသော ကြော်ငြာပိုစတာ'
  }
];

export const AIPhotoToolsShowcase: React.FC<AIPhotoToolsShowcaseProps> = ({
  language,
  onLaunch
}) => {
  const [activeTab, setActiveTab] = useState<ToolTabKey>('faceswap');
  const [showAfterView, setShowAfterView] = useState<boolean>(true);

  const activeTool = TOOLS_DATA.find((t) => t.id === activeTab) || TOOLS_DATA[0];

  const tabIcons: Record<ToolTabKey, React.ReactNode> = {
    faceswap: <UserCheck className="w-4 h-4 text-emerald-400" />,
    bgchange: <ImageIcon className="w-4 h-4 text-cyan-400" />,
    editimage: <Wand2 className="w-4 h-4 text-teal-400" />
  };

  return (
    <section id="photo-tools" className="relative py-24 sm:py-32 bg-[#06080d] border-t border-white/5 overflow-hidden">
      {/* Background Cyberpunk Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono tracking-wider">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {language === 'my'
                ? '⚡ မျက်နှာအစားထိုးခြင်း၊ နောက်ခံပြောင်းလဲခြင်း & အဆင့်မြင့် ပုံရိပ်ပြုပြင်ခြင်း'
                : '⚡ COMPUTER VISION & AI PHOTO WORKSTATION'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-serif">
            {language === 'my'
              ? 'Face Swap, BG Change နှင့် Pro Image Editing စနစ်များ'
              : 'Face Swap, Background Replace & Pro Image Editing'}
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            {language === 'my'
              ? 'မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု ဝတ်စုံများနှင့် စီးပွားရေး ကြော်ငြာပိုစတာများအတွက် အထူးပြုလုပ်ထားသော ကမ္ဘာ့အဆင့်မီ Computer Vision နှင့် AI ဓာတ်ပုံပြုပြင်ရေး စနစ်များ။'
              : 'State-of-the-art computer vision models engineered specifically for Burmese cultural fidelity, commercial advertising posters, and studio portraiture.'}
          </p>
        </div>

        {/* Interactive Tab Controls */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-md max-w-xl w-full">
            {TOOLS_DATA.map((tool) => {
              const isSelected = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tool.id);
                    setShowAfterView(true);
                  }}
                  className={`flex-1 py-3 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tabIcons[tool.id]}
                  <span>{language === 'my' ? tool.labelMm : tool.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tool Showcase Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Feature Narrative & Specifications */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block px-3 py-1 rounded-md bg-white/[0.04] border border-white/10 text-emerald-400 text-[11px] font-mono tracking-widest uppercase">
                {language === 'my' ? activeTool.badgeMm : activeTool.badgeEn}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {language === 'my' ? activeTool.titleMm : activeTool.titleEn}
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {language === 'my' ? activeTool.descriptionMm : activeTool.descriptionEn}
              </p>

              {/* Bullet Features */}
              <div className="space-y-3 pt-2">
                {(language === 'my' ? activeTool.bulletsMm : activeTool.bulletsEn).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metrics / Specifications Strip */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-white/10">
                {activeTool.specs.map((spec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <p className="text-sm sm:text-lg font-black text-white font-mono tracking-tight text-emerald-300">
                      {spec.value}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">
                      {spec.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onLaunch}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>
                    {language === 'my'
                      ? '🚀 Photo Studio တွင် လက်တွေ့ စတင်အသုံးပြုမည် (250 Free Credits)'
                      : '🚀 Try in Photo Studio Now (Free 250 Daily Credits)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Visual Demonstration Card */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#121622] via-[#0b0e14] to-[#080a0f] border border-white/10 p-4 sm:p-6 shadow-2xl shadow-emerald-950/40">
                {/* Visual Header Controls */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
                      {showAfterView
                        ? (language === 'my' ? activeTool.afterLabelMm : activeTool.afterLabelEn)
                        : (language === 'my' ? activeTool.beforeLabelMm : activeTool.beforeLabelEn)}
                    </span>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowAfterView(!showAfterView)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{showAfterView ? 'Show Before' : 'Show After'}</span>
                  </button>
                </div>

                {/* Display Image with Cyberpunk Frame */}
                <div className="relative mt-4 rounded-2xl overflow-hidden aspect-[4/3] bg-black/60 border border-white/10 group">
                  <img
                    src={showAfterView ? activeTool.afterImage : activeTool.beforeImage}
                    alt={showAfterView ? activeTool.afterLabelEn : activeTool.beforeLabelEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Floating Result Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-lg">
                    {showAfterView ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">
                          {language === 'my' ? 'AI ဖြင့် ပြုပြင်ပြီး' : 'AI GENERATED RESULT'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-zinc-300">
                          {language === 'my' ? 'မူရင်းပုံ' : 'ORIGINAL INPUT'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Bottom Information Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-mono text-[11px]">8K UHD ULTRA-REALISM</span>
                    <span className="text-emerald-400 font-mono text-[11px]">100% ARTIFACT-FREE</span>
                  </div>
                </div>

                {/* Micro Thumbnail Dual-Comparison Bar */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setShowAfterView(false)}
                    className={`p-2 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      !showAfterView
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={activeTool.beforeImage}
                      alt="Before thumbnail"
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">Input</p>
                      <p className="text-xs font-semibold text-white truncate">
                        {language === 'my' ? activeTool.beforeLabelMm : activeTool.beforeLabelEn}
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setShowAfterView(true)}
                    className={`p-2 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      showAfterView
                        ? 'bg-emerald-500/10 border-emerald-500/50'
                        : 'bg-black/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={activeTool.afterImage}
                      alt="After thumbnail"
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-mono text-emerald-400 uppercase">Result</p>
                      <p className="text-xs font-semibold text-white truncate">
                        {language === 'my' ? activeTool.afterLabelMm : activeTool.afterLabelEn}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
