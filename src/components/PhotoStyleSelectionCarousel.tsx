import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { PHOTO_STYLE_OPTIONS } from '../data/presetData';
import { Sparkles, ChevronLeft, ChevronRight, Check, ChevronDown, Camera, X } from 'lucide-react';

interface PhotoStyleSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const PHOTO_STYLE_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၂၀ မျိုး)', labelEn: 'All Photo Styles (20)' },
  { id: 'studio_fashion', labelMm: 'စတူဒီယိုနှင့် ဖက်ရှင် (၅ မျိုး)', labelEn: 'Studio & Fashion' },
  { id: 'cinematic_documentary', labelMm: 'စီနီမာနှင့် မှတ်တမ်းတင် (၄ မျိုး)', labelEn: 'Cinematic & Documentary' },
  { id: 'vintage_analog', labelMm: 'ဖလင်နှင့် ဗင်းတေ့ချ် (၄ မျိုး)', labelEn: 'Analog Film & Retro' },
  { id: 'ethereal_vibrant', labelMm: 'အိပ်မက်ဆန်နှင့် အနုပညာ (၇ မျိုး)', labelEn: 'Dreamy & Artistic' },
];

export const PhotoStyleSelectionCarousel: React.FC<PhotoStyleSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentStyleId = selection.photoStyle || 'default_style';
  const currentStyleObj = PHOTO_STYLE_OPTIONS.find((s) => s.id === currentStyleId) || PHOTO_STYLE_OPTIONS[1];

  // Helper to categorize options
  const getCategory = (id: string) => {
    if (['photorealistic_studio', 'fashion_editorial', 'fine_art_portrait', 'high_fashion_glamour', 'commercial_advertising'].includes(id)) {
      return 'studio_fashion';
    }
    if (['cinematic', 'documentary_style', 'street_photography', 'low_key_dramatic_noir'].includes(id)) {
      return 'cinematic_documentary';
    }
    if (['film_photography_look', 'monochrome_black_white', 'vintage_retro_70s', 'polaroid_instant'].includes(id)) {
      return 'vintage_analog';
    }
    return 'ethereal_vibrant'; // soft_dreamy, cyberpunk_neon, golden_hour_sunset, high_key_minimalist, surreal_artistic, hdr_vibrant_detail, soft_pastel_aesthetic
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'studio_fashion': return 'Studio & Fashion';
      case 'cinematic_documentary': return 'Cinematic / Doc';
      case 'vintage_analog': return 'Analog Film';
      default: return isMyanmar ? 'အနုပညာ စတိုင်' : 'Artistic Style';
    }
  };

  // Filter options
  const filteredOptions = PHOTO_STYLE_OPTIONS.filter((s) => {
    if (s.id === 'skip') return false; // Shown in header skip button
    if (selectedCategory === 'all') return true;
    return getCategory(s.id) === selectedCategory;
  });

  // Scroll handler
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 rounded-xl bg-[#0f1420] border border-zinc-800 p-4 sm:p-5 shadow-xs text-zinc-100">
      
      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
        <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Camera className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? `ဓာတ်ပုံ စတိုင် (၂၀ မျိုး)`
              : `Select Photo Style (20 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ photoStyle: 'skip' })}
            className="text-[11px] bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ (Auto)' : 'Skip / Auto'}</span>
          </button>

          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 max-w-[200px] truncate">
            {cleanEmoji(isMyanmar ? currentStyleObj.labelMm : currentStyleObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {PHOTO_STYLE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs whitespace-nowrap rounded-full border transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-black font-extrabold border-emerald-400 shadow-xs'
                : 'bg-[#161c2a] text-zinc-400 border-zinc-800 hover:bg-[#1e2438] hover:text-white'
            }`}
          >
            {cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
          </button>
        ))}
      </div>

      {/* 🌟 HORIZONTAL SCROLLABLE CAROUSEL */}
      <div className="space-y-2 bg-[#161c2a] border border-zinc-800 rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isMyanmar
                ? `ဓာတ်ပုံ စတိုင်များ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Photo Style Options (Scroll Horizontally ↔):`}
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
              className="p-1 rounded-md bg-zinc-800 hover:bg-emerald-500 text-zinc-300 hover:text-black border border-zinc-700 transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 rounded-md bg-zinc-800 hover:bg-emerald-500 text-zinc-300 hover:text-black border border-zinc-700 transition-all cursor-pointer"
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
          {filteredOptions.map((sty) => {
            const isSelected = currentStyleId === sty.id;
            const categoryTag = getCategoryLabel(getCategory(sty.id));

            return (
              <button
                key={sty.id}
                type="button"
                onClick={() => onUpdateSelection({ photoStyle: isSelected ? 'skip' : sty.id })}
                className={`snap-start shrink-0 min-w-[190px] max-w-[240px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(5,177,135,0.2)]'
                    : 'bg-[#141b2a] border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:bg-[#1b2336]'
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
                  <p className={`text-xs leading-tight line-clamp-2 ${isSelected ? 'font-bold text-emerald-300' : 'font-medium text-white'}`}>
                    {cleanEmoji(isMyanmar ? sty.labelMm : sty.labelEn)}
                  </p>
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
            value={currentStyleId}
            onChange={(e) => onUpdateSelection({ photoStyle: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/40 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {PHOTO_STYLE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catOptions = PHOTO_STYLE_OPTIONS.filter((sty) => getCategory(sty.id) === cat.id && sty.id !== 'skip');
              if (catOptions.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catOptions.map((sty) => (
                    <option
                      key={sty.id}
                      value={sty.id}
                      className="bg-[#161c2a] text-white py-1"
                    >
                      {cleanEmoji(isMyanmar ? sty.labelMm : sty.labelEn)}
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

    </div>
  );
};
