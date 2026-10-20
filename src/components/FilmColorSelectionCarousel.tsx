import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { COLOR_GRADE_OPTIONS } from '../data/presetData';
import { Sparkles, ChevronLeft, ChevronRight, Check, ChevronDown, Palette, X } from 'lucide-react';

interface FilmColorSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const FILM_COLOR_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၁၉ မျိုး)', labelEn: 'All (19 Options)' },
  { id: 'kodak', labelMm: 'ကိုဒက် ဖလင်တိုနင် (Kodak Film)', labelEn: 'Kodak Film Tones' },
  { id: 'fuji', labelMm: 'ဖူဂျီ ဖလင်တိုနင် (Fujifilm Tones)', labelEn: 'Fuji Film Tones' },
  { id: 'cinema_bw', labelMm: 'စီနီမာနှင့် အနက်ဖြူ (Cinema & B&W)', labelEn: 'Cinema & B&W' },
  { id: 'vintage_creative', labelMm: 'ဗင်းတေ့ချ်နှင့် အနုပညာ (Vintage & Creative)', labelEn: 'Vintage & Creative' },
];

export const FilmColorSelectionCarousel: React.FC<FilmColorSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentColorGradeId = selection.colorGrade || 'skip';
  const currentColorGradeObj = COLOR_GRADE_OPTIONS.find((cg) => cg.id === currentColorGradeId) || COLOR_GRADE_OPTIONS[0];

  // Helper to categorize options
  const getCategory = (id: string) => {
    if (['kodak_portra_400', 'kodak_gold_200', 'kodak_ultramax_400'].includes(id)) {
      return 'kodak';
    }
    if (['fuji_pro_400h', 'fuji_eterna_cool', 'fuji_velvia_50', 'fuji_superia_400'].includes(id)) {
      return 'fuji';
    }
    if (['cinestill_800t', 'ilford_hp5_plus', 'kodak_tri_x_400', 'teal_orange', 'cinematic_bleach_bypass'].includes(id)) {
      return 'cinema_bw';
    }
    return 'vintage_creative';
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'kodak': return 'Kodak Film';
      case 'fuji': return 'Fujifilm';
      case 'cinema_bw': return isMyanmar ? 'Cinema & B&W' : 'Cinema & B&W';
      default: return isMyanmar ? 'Vintage & Art' : 'Vintage & Art';
    }
  };

  // Filter options
  const filteredOptions = COLOR_GRADE_OPTIONS.filter((cg) => {
    if (cg.id === 'skip') return false; // Shown in header skip button
    if (selectedCategory === 'all') return true;
    return getCategory(cg.id) === selectedCategory;
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
          <Palette className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? `ဖလင် အရောင် တိုနင် (၁၉ မျိုး)`
              : `Select Film Color Grading (19 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ colorGrade: 'skip' })}
            className="text-[11px] bg-[#161c2a] hover:bg-rose-950/40 text-rose-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ (မူလအတိုင်း)' : 'Skip / Default'}</span>
          </button>

          <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
            {cleanEmoji(isMyanmar ? currentColorGradeObj.labelMm : currentColorGradeObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {FILM_COLOR_CATEGORIES.map((cat) => (
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
                ? `ဖလင်အရောင်များ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Film Color Profiles (Scroll Horizontally ↔):`}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ({filteredOptions.length} Options)
            </span>
          </span>

          {/* Scroll Buttons */}
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

        {/* Horizontal Scroll Strip */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {filteredOptions.map((cg) => {
            const isSelected = currentColorGradeId === cg.id;
            const categoryTag = getCategoryLabel(getCategory(cg.id));

            return (
              <button
                key={cg.id}
                type="button"
                onClick={() => onUpdateSelection({ colorGrade: isSelected ? 'skip' : cg.id })}
                className={`snap-start shrink-0 min-w-[185px] max-w-[230px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
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
                    {cleanEmoji(isMyanmar ? cg.labelMm : cg.labelEn)}
                  </p>
                  {cg.filmStock && (
                    <p className="text-[10px] text-zinc-400 font-mono mt-1 line-clamp-1">
                      {cg.filmStock}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fast Dropdown Menu */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold">
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ တိုက်ရိုက် ရွေးချယ်ရန်:' : 'Or Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentColorGradeId}
            onChange={(e) => onUpdateSelection({ colorGrade: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/50 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {FILM_COLOR_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catOptions = COLOR_GRADE_OPTIONS.filter((cg) => getCategory(cg.id) === cat.id && cg.id !== 'skip');
              if (catOptions.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catOptions.map((cg) => (
                    <option
                      key={cg.id}
                      value={cg.id}
                      className="bg-[#161c2a] text-zinc-200 py-1"
                    >
                      {cleanEmoji(isMyanmar ? cg.labelMm : cg.labelEn)}
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

      {/* Selected Film Stock Detail Callout */}
      {currentColorGradeId !== 'skip' && (
        <div className="p-2.5 rounded-lg bg-[#111622] border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-1 shadow-2xs">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isMyanmar ? 'ဖလင်တိုနင် စတိုင် (Film Stock Profile):' : 'Film Stock Profile:'}</span>
          </span>
          <span className="font-semibold text-emerald-400 font-mono text-[11px] bg-[#161c2a] px-2 py-0.5 rounded border border-zinc-800">
            {currentColorGradeObj.filmStock}
          </span>
        </div>
      )}

    </div>
  );
};
