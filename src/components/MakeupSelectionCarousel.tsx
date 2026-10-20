import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { MAKEUP_OPTIONS } from '../data/presetData';
import { Sparkles, ChevronLeft, ChevronRight, Check, ChevronDown, X } from 'lucide-react';

interface MakeupSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const MAKEUP_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၁၁ မျိုး)', labelEn: 'All Makeup Styles (11)' },
  { id: 'asian_traditional', labelMm: 'မြန်မာ၊ ကိုရီးယားနှင့် အာရှ (၄ မျိုး)', labelEn: 'Asian & Traditional' },
  { id: 'fashion_glam', labelMm: 'ဖက်ရှင်၊ ညနေခင်းနှင့် ဗင်းတေ့ချ် (၄ မျိုး)', labelEn: 'Fashion & Glam' },
  { id: 'natural_bare', labelMm: 'သဘာဝ မိတ်ကပ်နှင့် မိတ်ကပ်မပါ (၃ မျိုး)', labelEn: 'Natural & Bare' },
];

export const MakeupSelectionCarousel: React.FC<MakeupSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentMakeupId = selection.makeup || 'skip';
  const currentMakeupObj = MAKEUP_OPTIONS.find((m) => m.id === currentMakeupId) || MAKEUP_OPTIONS[0];

  // Helper to categorize options
  const getCategory = (id: string) => {
    if (['traditional_myanmar_makeup', 'thanaka_natural_makeup', 'korean_makeup', 'thai_aesthetic_makeup'].includes(id)) {
      return 'asian_traditional';
    }
    if (['editorial_makeup', 'glam_makeup', 'western_makeup', 'retro_vintage_red_lip'].includes(id)) {
      return 'fashion_glam';
    }
    return 'natural_bare';
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'asian_traditional': return isMyanmar ? 'အာရှ / မြန်မာ' : 'Asian / Traditional';
      case 'fashion_glam': return 'Fashion & Glam';
      default: return isMyanmar ? 'သဘာဝ မိတ်ကပ်' : 'Natural Bare';
    }
  };

  // Filter options
  const filteredOptions = MAKEUP_OPTIONS.filter((m) => {
    if (m.id === 'skip') return false; // Shown in header skip button
    if (selectedCategory === 'all') return true;
    return getCategory(m.id) === selectedCategory;
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
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? `မိတ်ကပ် ရွေးချယ်မှု (၁၁ မျိုး)`
              : `Select Makeup Style (11 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ makeup: 'skip' })}
            className="text-[11px] bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ (မူလအတိုင်း)' : 'Skip / Natural'}</span>
          </button>

          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30 max-w-[200px] truncate">
            {cleanEmoji(isMyanmar ? currentMakeupObj.labelMm : currentMakeupObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {MAKEUP_CATEGORIES.map((cat) => (
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
                ? `မိတ်ကပ်စတိုင်များ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Makeup Options (Scroll Horizontally ↔):`}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ({filteredOptions.length} Options)
            </span>
          </span>

          {/* Left / Right Scroll Buttons */}
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
          {filteredOptions.map((m) => {
            const isSelected = currentMakeupId === m.id;
            const categoryTag = getCategoryLabel(getCategory(m.id));

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateSelection({ makeup: isSelected ? 'skip' : m.id })}
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
                    {cleanEmoji(isMyanmar ? m.labelMm : m.labelEn)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fast Access Dropdown Menu */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold">
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ တိုက်ရိုက် ရွေးချယ်ရန်:' : 'Or Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentMakeupId}
            onChange={(e) => onUpdateSelection({ makeup: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/40 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {MAKEUP_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catOptions = MAKEUP_OPTIONS.filter((m) => getCategory(m.id) === cat.id && m.id !== 'skip');
              if (catOptions.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catOptions.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      className="bg-[#161c2a] text-white py-1"
                    >
                      {cleanEmoji(isMyanmar ? m.labelMm : m.labelEn)}
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
