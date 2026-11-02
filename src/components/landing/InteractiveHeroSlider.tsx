import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal, Check, RefreshCw } from 'lucide-react';
import { Language } from '../../types';

interface ShowcasePreset {
  id: string;
  nameEn: string;
  nameMm: string;
  beforeImg: string;
  afterImg: string;
  beforeLabelEn: string;
  beforeLabelMm: string;
  afterLabelEn: string;
  afterLabelMm: string;
  promptText: string;
  tag: string;
}

export const SHOWCASE_PRESETS: ShowcasePreset[] = [
  {
    id: 'royal-konbaung',
    nameEn: 'Royal Konbaung Attire',
    nameMm: 'ကုန်းဘောင် နန်းတွင်း ဝတ်စုံ',
    beforeImg: '/landing/faceswap-before.jpg',
    afterImg: '/landing/faceswap-after.jpg',
    beforeLabelEn: 'Original Portrait',
    beforeLabelMm: 'မူရင်း ဓာတ်ပုံ',
    afterLabelEn: '8K Royal Konbaung Attire',
    afterLabelMm: '၈K ကုန်းဘောင်မင်းသား ဝတ်စုံ (99.8% Likeness)',
    promptText: '8K Royal Konbaung Attire, ultra-realistic, gold embroidered silk, Mandalay Palace throne hall, Hasselblad 85mm f/1.4',
    tag: '99.8% Face Likeness'
  },
  {
    id: 'bagan-sunset',
    nameEn: 'Bagan Sunset Compositing',
    nameMm: 'ပုဂံ အာနန္ဒာ ဆည်းဆာ',
    beforeImg: '/landing/bgchange-before.jpg',
    afterImg: '/landing/bgchange-after.jpg',
    beforeLabelEn: 'Studio Cutout',
    beforeLabelMm: 'မူရင်း စတူဒီယို ဖြတ်တောက်မှု',
    afterLabelEn: 'Bagan Sunset Terraces',
    afterLabelMm: 'ပုဂံ ရှေးဟောင်းဘုရား ရင်ပြင်တော် ဆည်းဆာ',
    promptText: 'Pagan ancient terracotta temple terrace at golden hour, low warm 2400K sunlight, sub-pixel edge matting',
    tag: 'RMBG Neural Matting'
  },
  {
    id: 'skin-retouch',
    nameEn: 'Studio Skin Retouch',
    nameMm: 'စတူဒီယို အသားအရေ ပြင်ဆင်မှု',
    beforeImg: '/landing/edit-before.jpg',
    afterImg: '/landing/edit-after.jpg',
    beforeLabelEn: 'Raw Camera Shot',
    beforeLabelMm: 'မူရင်း ကင်မရာပုံရိပ်',
    afterLabelEn: 'Studio Retouched & Glow',
    afterLabelMm: 'စတူဒီယို အသားအရေ ပြင်ဆင်မှု (Micro-Pores)',
    promptText: 'Studio portrait micro-pore skin retouching, natural dewy glow, zero plastic blur, cinematic iris reflections',
    tag: 'Micro-Pore Engine'
  },
  {
    id: 'luxury-wedding',
    nameEn: 'Luxury Pine Forest Wedding',
    nameMm: 'ထင်းရှူးတော မင်္ဂလာစင်မြင့်',
    beforeImg: '/landing/wedding-before.jpg',
    afterImg: '/landing/wedding-after.jpg',
    beforeLabelEn: 'Casual Selfie',
    beforeLabelMm: 'မူရင်း Selfie ပုံ',
    afterLabelEn: '8K Luxury Glass Chapel Wedding',
    afterLabelMm: '၈K ထင်းရှူးတော မှန်နန်းတော် မင်္ဂလာစင်မြင့်',
    promptText: 'Modern glass greenhouse chapel inside misty pine forest, white flower pathway, authentic Burmese ivory silk regalia',
    tag: 'Dual Subject Lock'
  }
];

interface InteractiveHeroSliderProps {
  language: Language;
  activePresetId?: string;
  onSelectPreset?: (preset: ShowcasePreset) => void;
}

export const InteractiveHeroSlider: React.FC<InteractiveHeroSliderProps> = ({
  language,
  activePresetId = 'royal-konbaung',
  onSelectPreset
}) => {
  const isMm = language === 'my';
  const [selectedId, setSelectedId] = useState<string>(activePresetId);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPreset = SHOWCASE_PRESETS.find((p) => p.id === selectedId) || SHOWCASE_PRESETS[0];

  const handlePresetChange = (preset: ShowcasePreset) => {
    setSelectedId(preset.id);
    if (onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Interactive Draggable Split Canvas */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[210px] sm:max-h-[340px] md:max-h-[440px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 select-none cursor-ew-resize group"
      >
        {/* Layer 1: AFTER IMAGE (Full width background) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={currentPreset.afterImg}
            alt={currentPreset.afterLabelEn}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Label Right: 8K Royal Konbaung Attire */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-emerald-500/90 text-black text-[9px] sm:text-xs font-bold tracking-wide shadow-lg backdrop-blur-md border border-emerald-300/40 flex items-center gap-1 sm:gap-1.5 pointer-events-none">
            <Sparkles className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />
            <span>{isMm ? currentPreset.afterLabelMm : currentPreset.afterLabelEn}</span>
          </div>
        </div>

        {/* Layer 2: BEFORE IMAGE (Clipped to sliderPosition) */}
        <div
          className="absolute inset-0 h-full overflow-hidden will-change-[width]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%'
            }}
          >
            <img
              src={currentPreset.beforeImg}
              alt={currentPreset.beforeLabelEn}
              className="w-full h-full object-cover max-w-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%'
              }}
              draggable={false}
            />
          </div>

          {/* Label Left: Original Portrait */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full bg-black/75 text-zinc-200 text-[9px] sm:text-xs font-medium tracking-wide shadow-lg backdrop-blur-md border border-white/10 pointer-events-none">
            <span>{isMm ? currentPreset.beforeLabelMm : currentPreset.beforeLabelEn}</span>
          </div>
        </div>

        {/* Vertical Divider Line with Glow */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-20 pointer-events-none shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Circle Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-400 text-black shadow-xl shadow-emerald-500/50 flex items-center justify-center border-2 border-[#07090e] transition-transform group-hover:scale-110">
            <MoveHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Bottom Helper Hint */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-10 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] text-zinc-300 border border-white/10 pointer-events-none flex items-center gap-1.5">
          <MoveHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
          <span>{isMm ? 'ဆွဲပြီး မူရင်းနှင့် ရလဒ်ကို နှိုင်းယှဉ်ပါ' : 'Drag to compare Original vs AI Result'}</span>
        </div>

      </div>

      {/* Preset Switcher Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 w-full">
        {SHOWCASE_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetChange(preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{isMm ? preset.nameMm : preset.nameEn}</span>
              {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          );
        })}
      </div>

    </div>
  );
};
