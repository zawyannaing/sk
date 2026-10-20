import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { LOCATION_OPTIONS } from '../data/presetData';
import { MapPin, ChevronLeft, ChevronRight, Check, Sparkles, ChevronDown, X } from 'lucide-react';

interface LocationSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const LOCATION_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၃၆ မျိုး)', labelEn: 'All (36 Locations)' },
  { id: 'myanmar', labelMm: 'မြန်မာ့ ထင်ရှားသော နေရာများ (၁၅ မျိုး)', labelEn: 'Myanmar Iconic Locations (15)' },
  { id: 'world', labelMm: 'ကမ္ဘာ့ ထိပ်တန်း ဓာတ်ပုံ နေရာများ (၁၀ မျိုး)', labelEn: 'World Iconic Locations (10)' },
  { id: 'indoor_studio', labelMm: 'စတူဒီယို / အခန်းတွင်း (၅ မျိုး)', labelEn: 'Studio & Indoor (5)' },
  { id: 'nature_lifestyle', labelMm: 'သဘာဝနှင့် မြို့ပြ အခင်းအကျင်း (၆ မျိုး)', labelEn: 'Nature & Lifestyle (6)' },
];

export const LocationSelectionCarousel: React.FC<LocationSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentLocationId = selection.location || 'skip';
  const currentLocationObj = LOCATION_OPTIONS.find((l) => l.id === currentLocationId) || LOCATION_OPTIONS[0];

  // Filter locations by category
  const filteredLocations = LOCATION_OPTIONS.filter((l) => {
    if (l.id === 'skip') return false; // Show skip button in header
    return selectedCategory === 'all' || l.category === selectedCategory;
  });

  // Horizontal scroll handler
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
          <MapPin className="h-4 w-4 text-emerald-400" />
          <span>
            {isMyanmar
              ? 'တည်နေရာနှင့် နောက်ခံ (၃၆ မျိုး)'
              : 'Select Location & Background (36 Options):'}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ location: 'skip', customLocationDetails: '' })}
            className="text-[11px] bg-[#161c2a] hover:bg-rose-950/40 text-rose-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ' : 'Skip'}</span>
          </button>

          <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
            {cleanEmoji(isMyanmar ? currentLocationObj.labelMm : currentLocationObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {LOCATION_CATEGORIES.map((cat) => (
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

      {/* 🌟 100% HORIZONTAL SCROLLABLE CAROUSEL */}
      <div className="space-y-2 bg-[#111622] border border-zinc-800 rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isMyanmar
                ? `တည်နေရာများ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Locations & Backdrops (Scroll Horizontally ↔):`}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              ({filteredLocations.length} Options)
            </span>
          </span>

          {/* Scroll Navigation Buttons */}
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
          {filteredLocations.map((loc) => {
            const isSelected = currentLocationId === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => onUpdateSelection({ location: isSelected ? 'skip' : loc.id, customLocationDetails: isSelected ? '' : undefined })}
                className={`snap-start shrink-0 min-w-[180px] max-w-[220px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(5,177,135,0.25)]'
                    : 'bg-[#141b2a] border border-zinc-800 text-zinc-300 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {loc.category === 'myanmar'
                      ? (isMyanmar ? 'မြန်မာ့နေရာ' : 'Myanmar')
                      : loc.category === 'world'
                      ? (isMyanmar ? 'ကမ္ဘာ့နေရာ' : 'World Iconic')
                      : loc.category === 'indoor_studio'
                      ? (isMyanmar ? 'စတူဒီယို' : 'Studio / Indoor')
                      : (isMyanmar ? 'သဘာဝ' : 'Nature')}
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
                    {cleanEmoji(isMyanmar ? loc.labelMm : loc.labelEn)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Fast Access Dropdown Menu */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold">
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ ရွေးရန်:' : 'Or Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentLocationId}
            onChange={(e) => onUpdateSelection({ location: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/50 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {LOCATION_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catLocations = LOCATION_OPTIONS.filter((l) => l.category === cat.id && l.id !== 'skip');
              if (catLocations.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catLocations.map((loc) => (
                    <option
                      key={loc.id}
                      value={loc.id}
                      className="bg-[#161c2a] text-zinc-200 py-1"
                    >
                      {cleanEmoji(isMyanmar ? loc.labelMm : loc.labelEn)}
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

      {/* Custom Location Details Text Input */}
      <div>
        <input
          type="text"
          placeholder={
            isMyanmar
              ? 'အခြား တည်နေရာ / နောက်ခံ အသေးစိတ် ရေးပါ (ဥပမာ- ရန်ကုန်မြစ်ကမ်း အနီး)...'
              : 'Specific location details (e.g. Near Yangon riverbank sunset)...'
          }
          value={selection.customLocationDetails || ''}
          onChange={(e) => onUpdateSelection({ customLocationDetails: e.target.value })}
          className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/50 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-all shadow-2xs"
        />
      </div>

    </div>
  );
};
