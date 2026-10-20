import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { MOOD_OPTIONS } from '../data/presetData';
import { ChevronLeft, ChevronRight, Check, ChevronDown, Smile, Sparkles, X } from 'lucide-react';

interface MoodSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const MOOD_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၁၅ မျိုး)', labelEn: 'All Moods (15)' },
  { id: 'calm_peaceful', labelMm: 'အေးချမ်းနှင့် တည်ငြိမ် (၄ မျိုး)', labelEn: 'Calm & Peaceful' },
  { id: 'joyful_romantic', labelMm: 'ပျော်ရွှင်နှင့် ရင်ခုန်ဖွယ် (၄ မျိုး)', labelEn: 'Joyful & Romantic' },
  { id: 'powerful_cool', labelMm: 'စွမ်းအားနှင့် စတိုင်ကျ (၃ မျိုး)', labelEn: 'Powerful & Cool' },
  { id: 'deep_mysterious', labelMm: 'နက်နဲနှင့် ဆန်းကြယ် (၄ မျိုး)', labelEn: 'Deep & Mysterious' },
];

export const MoodSelectionCarousel: React.FC<MoodSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentMoodId = selection.moodEmotion || 'calm_serene';
  const currentMoodObj = MOOD_OPTIONS.find((m) => m.id === currentMoodId) || MOOD_OPTIONS[1];

  // Helper to categorize options
  const getCategory = (id: string) => {
    if (['calm_serene', 'warm_welcoming', 'peaceful_zen', 'elegant_graceful'].includes(id)) {
      return 'calm_peaceful';
    }
    if (['joyful_cheerful', 'romantic_tender', 'playful_mischievous', 'nostalgic_vintage'].includes(id)) {
      return 'joyful_romantic';
    }
    if (['powerful_confident', 'cool_rebellious', 'passionate_intense'].includes(id)) {
      return 'powerful_cool';
    }
    return 'deep_mysterious';
  };

  // Filter options
  const filteredOptions = MOOD_OPTIONS.filter((m) => {
    if (m.id === 'select_mood' || m.id === 'skip') return false;
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
          <Smile className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? `ခံစားချက်နှင့် Mood (Emotion & Mood - ၁၅ မျိုး)`
              : `Select Mood & Emotion (15 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ moodEmotion: 'skip' })}
            className="text-[11px] bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ (မူလအတိုင်း)' : 'Skip / Default'}</span>
          </button>

          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30">
            {cleanEmoji(isMyanmar ? currentMoodObj.labelMm : currentMoodObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {MOOD_CATEGORIES.map((cat) => (
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
                ? `Mood ခံစားချက်များ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Emotion & Mood Options (Scroll Horizontally ↔):`}
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
            const isSelected = currentMoodId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateSelection({ moodEmotion: isSelected ? 'skip' : m.id })}
                className={`snap-start shrink-0 min-w-[190px] max-w-[240px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(5,177,135,0.2)]'
                    : 'bg-[#141b2a] border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:bg-[#1b2336]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    Mood
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
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ တိုက်ရိုက် ရွေးချယ်ရန်:' : 'Or Fast Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentMoodId}
            onChange={(e) => onUpdateSelection({ moodEmotion: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/40 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {MOOD_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catOptions = MOOD_OPTIONS.filter((m) => getCategory(m.id) === cat.id && m.id !== 'select_mood' && m.id !== 'skip');
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
