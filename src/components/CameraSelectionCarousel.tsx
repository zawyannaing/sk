import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { CAMERA_OPTIONS } from '../data/presetData';
import { Sparkles, ChevronLeft, ChevronRight, Check, ChevronDown, Camera, X } from 'lucide-react';

interface CameraSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const CAMERA_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၂၀ မျိုး)', labelEn: 'All Lenses & Bodies (20)' },
  { id: 'portrait_prime', labelMm: 'ပို့ထရိတ်နှင့် ပရိုလန်းစ် (၆ မျိုး)', labelEn: 'Portrait & Prime Lenses' },
  { id: 'tele_wide_cinema', labelMm: 'မြင်ကွင်းကျယ်နှင့် စီနီမာလန်းစ် (၅ မျိုး)', labelEn: 'Wide, Zoom & Cinema Lenses' },
  { id: 'vintage_special', labelMm: 'ရှေးဟောင်းနှင့် အနုပညာလန်းစ် (၂ မျိုး)', labelEn: 'Vintage & Special Lenses' },
  { id: 'pro_bodies', labelMm: 'ပရော်ဖက်ရှင်နယ် ကင်မရာများ (၇ မျိုး)', labelEn: 'Pro Flagship Bodies' },
];

export const CameraSelectionCarousel: React.FC<CameraSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentCamId = selection.camera || 'default_photo';
  const currentCamObj = CAMERA_OPTIONS.find((c) => c.id === currentCamId) || CAMERA_OPTIONS[1];

  // Helper to categorize options
  const getCategory = (id: string) => {
    if (['lens_85mm_portrait', 'lens_100mm_macro', 'lens_35mm_wide', 'lens_50mm_prime', 'lens_135mm_telephoto', 'lens_50mm_ultrafast'].includes(id)) {
      return 'portrait_prime';
    }
    if (['lens_200mm_super_telephoto', 'lens_24mm_ultrawide', 'lens_40mm_anamorphic', 'lens_70_200mm_zoom', 'lens_tilt_shift_45mm'].includes(id)) {
      return 'tele_wide_cinema';
    }
    if (['lens_vintage_helios_85mm', 'lens_soft_focus_90mm'].includes(id)) {
      return 'vintage_special';
    }
    return 'pro_bodies'; // hasselblad, leica, canon, sony, fujifilm, nikon, iphone
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'portrait_prime': return isMyanmar ? 'Portrait / Prime' : 'Portrait / Prime';
      case 'tele_wide_cinema': return isMyanmar ? 'Wide & Cinema' : 'Wide & Cinema';
      case 'vintage_special': return isMyanmar ? 'Vintage Lens' : 'Vintage Lens';
      default: return isMyanmar ? 'Pro Body' : 'Pro Body';
    }
  };

  // Filter options
  const filteredOptions = CAMERA_OPTIONS.filter((c) => {
    if (c.id === 'skip') return false; // Shown in header skip button
    if (selectedCategory === 'all') return true;
    return getCategory(c.id) === selectedCategory;
  });

  // Scroll handler
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 rounded-xl bg-[#0f1420] border border-zinc-800 p-4 sm:p-5 shadow-xs">
      
      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
        <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Camera className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? `ကင်မရာနှင့် လန်းစ် ဆက်တင် (၂၀ မျိုး)`
              : `Select Camera & Lens Setup (20 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ camera: 'skip' })}
            className="text-[11px] bg-[#161c2a] hover:bg-rose-950/40 text-rose-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ (Auto)' : 'Skip / Auto'}</span>
          </button>

          <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30 max-w-[200px] truncate">
            {cleanEmoji(isMyanmar ? (currentCamObj.labelMm || currentCamObj.label) : (currentCamObj.labelEn || currentCamObj.label))}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CAMERA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-full border transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-black font-extrabold border-emerald-500 shadow-2xs'
                : 'bg-[#141b2a] text-zinc-400 border-zinc-800 hover:bg-[#1c2438] hover:text-white'
            }`}
          >
            {cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
          </button>
        ))}
      </div>

      {/* 🌟 HORIZONTAL SCROLLABLE CAROUSEL */}
      <div className="space-y-2 bg-[#111622] border border-zinc-800 rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isMyanmar
                ? `ကင်မရာနှင့် လန်းစ်များ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Camera & Lens Options (Scroll Horizontally ↔):`}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ({filteredOptions.length} Options)
            </span>
          </span>

          {/* Left / Right Scroll Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1 rounded-md bg-[#161c2a] hover:bg-emerald-500 hover:text-black text-emerald-400 border border-zinc-800 transition-all shadow-2xs cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 rounded-md bg-[#161c2a] hover:bg-emerald-500 hover:text-black text-emerald-400 border border-zinc-800 transition-all shadow-2xs cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Strip */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredOptions.map((cam) => {
            const isSelected = currentCamId === cam.id;
            const categoryTag = getCategoryLabel(getCategory(cam.id));

            return (
              <button
                key={cam.id}
                type="button"
                onClick={() => onUpdateSelection({ camera: isSelected ? 'skip' : cam.id })}
                className={`snap-start shrink-0 min-w-[190px] max-w-[240px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(5,177,135,0.25)]'
                    : 'bg-[#141b2a] border border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {categoryTag}
                  </span>
                  {isSelected ? (
                    <span className="p-0.5 rounded-full bg-emerald-500 text-black font-extrabold shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="p-0.5 rounded-full border border-zinc-700 text-transparent">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div>
                  <p className={`text-xs leading-tight line-clamp-2 ${isSelected ? 'font-bold text-emerald-300' : 'font-medium text-zinc-200'}`}>
                    {cleanEmoji(isMyanmar ? (cam.labelMm || cam.label) : (cam.labelEn || cam.label))}
                  </p>
                  {cam.lens && (
                    <p className="text-[10px] text-zinc-400 font-mono mt-1 line-clamp-1">
                      {cam.lens} ({cam.aperture})
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fast Dropdown Menu Access */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold">
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ တိုက်ရိုက် ရွေးချယ်ရန်:' : 'Or Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentCamId}
            onChange={(e) => onUpdateSelection({ camera: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/50 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {CAMERA_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catOptions = CAMERA_OPTIONS.filter((cam) => getCategory(cam.id) === cat.id && cam.id !== 'skip');
              if (catOptions.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catOptions.map((cam) => (
                    <option
                      key={cam.id}
                      value={cam.id}
                      className="bg-[#161c2a] text-zinc-200 py-1"
                    >
                      {cleanEmoji(isMyanmar ? (cam.labelMm || cam.label) : (cam.labelEn || cam.label))}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Selected Lens & Aperture Info Callout */}
      {currentCamId !== 'skip' && currentCamObj.lens && (
        <div className="p-2.5 rounded-lg bg-[#111622] border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-1 shadow-2xs">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isMyanmar ? 'လန်းစ် (Lens Model):' : 'Lens Model:'}</span>
            <strong className="text-emerald-400 font-semibold">{currentCamObj.lens}</strong>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-[#161c2a] px-2 py-0.5 rounded border border-zinc-800">
            {isMyanmar ? 'အလင်းဝင်ပေါက်:' : 'Aperture:'} {currentCamObj.aperture}
          </span>
        </div>
      )}

    </div>
  );
};
