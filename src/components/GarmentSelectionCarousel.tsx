import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { GARMENT_OPTIONS } from '../data/presetData';
import {
  Shirt,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ChevronDown,
  Search,
  LayoutGrid,
  GalleryHorizontal,
  Palette,
  X,
  Ban,
  Layers,
} from 'lucide-react';

interface GarmentSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const GARMENT_CATEGORIES = [
  { id: 'myanmar', labelMm: 'မြန်မာနှင့် တိုင်းရင်းသား (Myanmar & Royal)', labelEn: 'Myanmar & Ethnic Heritage' },
  { id: 'all', labelMm: 'အကုန်လုံး (All 38 Outfits)', labelEn: 'All Outfits (38)' },
  { id: 'formal', labelMm: 'ပွဲတက်နှင့် မင်္ဂလာဝတ်စုံ', labelEn: 'Formal, Gown & Bridal' },
  { id: 'fashion', labelMm: 'ဖက်ရှင်နှင့် ခေတ်ပေါ်စပ်ဟန်', labelEn: 'Fashion & Acheik Fusion' },
  { id: 'traditional_world', labelMm: 'နိုင်ငံတကာ ရိုးရာဝတ်စုံ', labelEn: 'World Traditional' },
  { id: 'casual', labelMm: 'နေ့စဉ်နှင့် အပန်းဖြေဝတ်', labelEn: 'Casual & Resort' },
  { id: 'uniform', labelMm: 'ယူနီဖောင်းနှင့် သက်မွေးဝတ်စုံ', labelEn: 'Uniforms & Robes' },
];

const OUTFIT_COLOR_SWATCHES = [
  { id: 'ruby_crimson', hex: '#9b111e', labelMm: 'ပတ္တမြားနီ (Ruby Red)', valueEn: 'Mogok Ruby Crimson Red color palette' },
  { id: 'imperial_gold', hex: '#d4af37', labelMm: 'နန်းတွင်းရွှေဝါ (Royal Gold)', valueEn: 'Imperial Champagne Gold & Shimmering Bullion palette' },
  { id: 'emerald_jade', hex: '#00755e', labelMm: 'ကျောက်စိမ်းစိမ်း (Emerald Jade)', valueEn: 'Imperial Hpakant Emerald Jade Green color palette' },
  { id: 'lotus_pink', hex: '#e88ca5', labelMm: 'ကြာပန်းရောင် (Lotus Pink)', valueEn: 'Soft Sacred Lotus Blossom Rose Pink color palette' },
  { id: 'ivory_pearl', hex: '#f5efe0', labelMm: 'ဆင်စွယ်ဖြူ (Ivory Pearl)', valueEn: 'Pristine Ivory White & South Sea Pearl color palette' },
  { id: 'peacock_blue', hex: '#0f52ba', labelMm: 'ဒေါင်းပြာရောင် (Peacock Sapphire)', valueEn: 'Iridescent Royal Peacock Sapphire Blue color palette' },
  { id: 'royal_amethyst', hex: '#5d3fd3', labelMm: 'ခရမ်းရင့် (Royal Purple)', valueEn: 'Deep Yadanabon Royal Amethyst Purple color palette' },
  { id: 'bagan_terracotta', hex: '#c85a32', labelMm: 'ပုဂံအုတ်နီ/လိမ္မော် (Terracotta Amber)', valueEn: 'Warm Bagan Sunset Terracotta & Burnt Amber color palette' },
  { id: 'celadon_mint', hex: '#6eb5a0', labelMm: 'မင့်တ်အေး (Celadon Mint)', valueEn: 'Pastel Celadon Mint & Soft Sage Silk color palette' },
  { id: 'obsidian_velvet', hex: '#232026', labelMm: 'အနက်ရောင် ကတ္တီပါ (Obsidian Black)', valueEn: 'Rich Obsidian Black Velvet & Gold Thread contrast palette' },
];

const TEXTILE_WEAVE_MODIFIERS = [
  {
    id: 'luntaya_acheik',
    code: 'ACHEIK',
    labelMm: 'လွန်းရာကျော် ပိုးချိတ်လှိုင်း (100-Shuttle Acheik)',
    valueEn: '100-Shuttle Luntaya Acheik interlocking wave silk weave',
  },
  {
    id: 'gold_zardosi',
    code: 'ZARDOSI',
    labelMm: 'ရွှေချည်ထိုး မှန်စီရွှေချ (24K Gold Zardosi)',
    valueEn: '24K Gold Zardosi bullion thread and glass-mosaic Shwe-Chi-Doe embroidery',
  },
  {
    id: 'inle_lotus',
    code: 'LOTUS',
    labelMm: 'အင်းလေး ကြာချည်ပိုးသား (Inle Lotus Silk)',
    valueEn: 'Hand-spun Inle Lake sacred lotus fiber silk texture',
  },
  {
    id: 'royal_velvet',
    code: 'VELVET',
    labelMm: 'နန်းတွင်း ကတ္တီပါနှင့် ဖဲပြောင် (Royal Velvet)',
    valueEn: 'Lustrous Konbaung royal velvet with heavy metallic brocade trim',
  },
  {
    id: 'french_lace',
    code: 'ORGANZA',
    labelMm: 'ပိုးဇာပါးနှင့် ပုလဲကြယ်သီး (Organza & Pearl Lace)',
    valueEn: 'Sheer gossamer silk organza and French floral lace with pearl buttons',
  },
  {
    id: 'water_droplets',
    code: 'DEW SILK',
    labelMm: 'သင်္ကြန် ရေစက်တင် ပိုးသား (Thingyan Wet Silk)',
    valueEn: 'Woven silk glistening with crystal Thingyan festival water droplets',
  },
  {
    id: 'handloom_ikat',
    code: 'IKAT',
    labelMm: 'ရိုးရာ ဂျပ်ခုတ် လက်ရက်ထည် (Handloom Ikat)',
    valueEn: 'Crisp hand-loomed geometric ethnic cotton and raw silk weave',
  },
  {
    id: 'ruby_sequin',
    code: 'COUTURE',
    labelMm: 'ပတ္တမြားနှင့် ကျောက်စီ ပွဲတက်ထည် (Ruby & Sequin)',
    valueEn: 'Haute-couture silk encrusted with shimmering Mogok ruby beads and sequins',
  },
];

const CATEGORY_BADGE_LABELS: Record<string, string> = {
  myanmar: 'HERITAGE',
  formal: 'FORMAL',
  fashion: 'COUTURE',
  traditional_world: 'GLOBAL',
  casual: 'CASUAL',
  uniform: 'UNIFORM',
};

export const GarmentSelectionCarousel: React.FC<GarmentSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('myanmar');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentGarmentId = selection.garmentStyle || 'traditional_myanmar';
  const currentGarmentObj =
    GARMENT_OPTIONS.find((g) => g.id === currentGarmentId) ||
    GARMENT_OPTIONS.find((g) => g.id === 'traditional_myanmar') ||
    GARMENT_OPTIONS[1];

  const activeFabricText = selection.garmentFabric || '';

  // Filter garments by category & search query
  const filteredGarments = GARMENT_OPTIONS.filter((g) => {
    if (g.id === 'skip') return false;
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.labelMm.toLowerCase().includes(q) ||
      g.labelEn.toLowerCase().includes(q) ||
      g.fabric.toLowerCase().includes(q) ||
      g.id.toLowerCase().includes(q)
    );
  });

  // Scroll left/right handler for carousel view
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Toggle color or fabric modifier inside selection.garmentFabric
  const isModifierActive = (valueEn: string) => {
    return activeFabricText.toLowerCase().includes(valueEn.toLowerCase());
  };

  const handleToggleModifier = (valueEn: string) => {
    let current = activeFabricText;
    if (isModifierActive(valueEn)) {
      current = current
        .replace(new RegExp(valueEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|\s*,\s*$/g, '')
        .trim();
    } else {
      current = current ? `${current}, ${valueEn}` : valueEn;
    }
    onUpdateSelection({ garmentFabric: current });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-[#fdf9f6] border border-[#d6c3b6] p-4 shadow-sm text-[#1e1b19]">
      {/* Top Bar: Active Selection & View Mode Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#d6c3b6]/60">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#704112]/10 text-[#704112] border border-[#704112]/20">
            <Shirt className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-[#1e1b19] uppercase tracking-wider flex items-center gap-1.5">
              <span>
                {isMyanmar
                  ? 'ဝတ်စုံနှင့် အထည်သား စတိုင်လ် ဘရောက်ဇာ (Clothes & Silk Browser)'
                  : 'Clothes & Textile Heritage Style Browser'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdf98]/70 text-[#5a4300] border border-[#775a00]/20 text-[10px] font-bold">
                {GARMENT_OPTIONS.length - 1} Styles
              </span>
            </h3>
            <p className="text-[11px] text-[#51443a]">
              {isMyanmar
                ? 'ရိုးရာဝတ်စုံ၊ တိုင်းရင်းသားဝတ်စုံ၊ ပွဲတက်ဝတ်စုံ၊ အရောင်နှင့် ပိုးချိတ်အသားများကို စိတ်ကြိုက် ရွေးချယ်ပါ'
                : 'Browse traditional Burmese, ethnic, bridal, and modern outfits with color & fabric controls'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Garment Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#704112] text-white text-xs font-semibold shadow-xs">
            <Shirt className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[200px] truncate">
              {isMyanmar ? currentGarmentObj.labelMm : currentGarmentObj.labelEn}
            </span>
          </div>

          {/* Grid vs Carousel View Toggle */}
          <div className="flex items-center bg-[#f4ece9] p-0.5 rounded-xl border border-[#d6c3b6]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#704112] shadow-xs border border-[#d6c3b6]/60'
                  : 'text-[#51443a] hover:text-[#1e1b19]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{isMyanmar ? 'Grid' : 'Grid'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-white text-[#704112] shadow-xs border border-[#d6c3b6]/60'
                  : 'text-[#51443a] hover:text-[#1e1b19]'
              }`}
              title="Carousel Strip"
            >
              <GalleryHorizontal className="h-3.5 w-3.5" />
              <span>{isMyanmar ? 'Slide' : 'Slide'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSelection({ garmentStyle: 'skip', garmentFabric: '' })}
            className="text-[11px] bg-white hover:bg-[#f4ece9] text-[#847469] hover:text-rose-700 font-semibold px-2.5 py-1 rounded-xl border border-[#d6c3b6] transition-all flex items-center gap-1 cursor-pointer"
          >
            <Ban className="h-3 w-3" />
            <span>{isMyanmar ? 'မရွေးပါ' : 'Skip'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs + Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {GARMENT_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? GARMENT_OPTIONS.length - 1
                : GARMENT_OPTIONS.filter((g) => g.category === cat.id && g.id !== 'skip').length;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-[#704112] border-[#704112] text-white font-bold shadow-xs'
                    : 'bg-white border-[#d6c3b6]/80 text-[#51443a] hover:bg-[#f4ece9] hover:text-[#1e1b19]'
                }`}
              >
                <span>{isMyanmar ? cat.labelMm : cat.labelEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-[#f4ece9] text-[#704112]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-[#847469] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMyanmar ? 'ဝတ်စုံ ရှာရန် (ဥပမာ- ချိတ်၊ ပုဂံ၊ ကချင်)...' : 'Search outfits (Acheik, Bagan, Shan)...'}
            className="w-full rounded-xl bg-white border border-[#d6c3b6] pl-8 pr-7 py-1.5 text-xs text-[#1e1b19] placeholder-[#847469] focus:border-[#704112] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#847469] hover:text-[#1e1b19]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* OUTFIT BROWSER: GRID VIEW vs CAROUSEL VIEW */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredGarments.map((garm, idx) => {
            const isSelected = currentGarmentId === garm.id;
            const badgeText = CATEGORY_BADGE_LABELS[garm.category] || 'ATTIRE';
            return (
              <button
                key={garm.id}
                type="button"
                onClick={() => onUpdateSelection({ garmentStyle: garm.id })}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 group cursor-pointer ${
                  isSelected
                    ? 'bg-[#fff8ec] border-[#704112] ring-2 ring-[#704112]/20 shadow-xs'
                    : 'bg-white border-[#d6c3b6]/60 hover:border-[#704112]/50 hover:bg-[#faf2ee]/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border shrink-0 flex flex-col items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#704112] text-white border-[#704112]'
                      : 'bg-[#faf2ee] text-[#704112] border-[#d6c3b6]/60 group-hover:border-[#704112]/40'
                  }`}
                >
                  <Shirt className="h-4 w-4" />
                  <span className="text-[8px] font-mono font-bold leading-none mt-0.5">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-bold text-[#1e1b19] leading-snug line-clamp-1">
                      {isMyanmar ? garm.labelMm : garm.labelEn}
                    </p>
                    <span
                      className={`p-0.5 rounded-full shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#704112] text-white'
                          : 'border border-[#d6c3b6] text-transparent group-hover:border-[#704112]/50'
                      }`}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#f4ece9] text-[#704112]">
                      {badgeText}
                    </span>
                    <p className="text-[10px] font-medium text-[#704112] truncate">
                      {isMyanmar ? garm.labelEn : garm.labelMm}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#51443a] line-clamp-2 mt-1 leading-relaxed">
                    {garm.fabric}
                  </p>
                </div>
              </button>
            );
          })}
          {filteredGarments.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-[#847469]">
              {isMyanmar ? 'ရှာဖွေထားသော ဝတ်စုံ မတွေ့ပါ။' : 'No matching outfits found.'}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 bg-white border border-[#d6c3b6]/70 rounded-xl p-3 relative">
          <div className="flex items-center justify-between text-xs text-[#704112] font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {isMyanmar
                  ? `ဝတ်စုံများ ဘေးတိုက် ဆွဲကြည့်ရန် (${filteredGarments.length} မျိုး):`
                  : `Scroll Outfits Horizontally (${filteredGarments.length} Styles):`}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-1 rounded-lg bg-[#faf2ee] hover:bg-[#704112] hover:text-white text-[#704112] border border-[#d6c3b6] transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-1 rounded-lg bg-[#faf2ee] hover:bg-[#704112] hover:text-white text-[#704112] border border-[#d6c3b6] transition-all"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x snap-mandatory"
          >
            {filteredGarments.map((garm, idx) => {
              const isSelected = currentGarmentId === garm.id;
              const badgeText = CATEGORY_BADGE_LABELS[garm.category] || 'ATTIRE';
              return (
                <button
                  key={garm.id}
                  type="button"
                  onClick={() => onUpdateSelection({ garmentStyle: garm.id })}
                  className={`snap-start shrink-0 w-[210px] p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer ${
                    isSelected
                      ? 'bg-[#fff8ec] border-[#704112] ring-2 ring-[#704112]/20 shadow-xs'
                      : 'bg-[#faf2ee]/60 border-[#d6c3b6]/60 hover:border-[#704112]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-[#d6c3b6]/60 text-[#704112]">
                      #{String(idx + 1).padStart(2, '0')} · {badgeText}
                    </span>
                    <span
                      className={`p-0.5 rounded-full ${
                        isSelected ? 'bg-[#704112] text-white' : 'border border-[#d6c3b6] text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1e1b19] line-clamp-2 leading-snug">
                      {isMyanmar ? garm.labelMm : garm.labelEn}
                    </p>
                    <p className="text-[10px] text-[#51443a] line-clamp-2 mt-1">
                      {garm.fabric}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COLOR PALETTE & TEXTILE WEAVE STUDIO */}
      <div className="p-3.5 rounded-xl bg-white border border-[#d6c3b6]/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#704112] flex items-center gap-1.5">
            <Palette className="h-4 w-4" />
            <span>
              {isMyanmar
                ? 'ဝတ်စုံ အရောင်နှင့် ပိုးချိတ်အသား ရွေးချယ်ရန် (Color Palette & Silk Weave)'
                : 'Outfit Color Palette & Silk Embroidery Weave'}
            </span>
          </span>
          {activeFabricText && (
            <button
              type="button"
              onClick={() => onUpdateSelection({ garmentFabric: '' })}
              className="text-[10px] text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>{isMyanmar ? 'အရောင်/အထည်သား ပြန်ရှင်းမည်' : 'Clear Color/Fabric'}</span>
            </button>
          )}
        </div>

        {/* Color Swatches */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#51443a] block">
            {isMyanmar ? '၁။ ဝတ်စုံ အရောင် (Color Swatches):' : '1. Outfit Color Palette:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {OUTFIT_COLOR_SWATCHES.map((swatch) => {
              const active = isModifierActive(swatch.valueEn);
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => handleToggleModifier(swatch.valueEn)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#704112] text-white border-[#704112] font-bold shadow-xs'
                      : 'bg-[#faf2ee] text-[#1e1b19] border-[#d6c3b6]/70 hover:bg-[#f4ece9]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span>{swatch.labelMm}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Silk & Embroidery Weave Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#51443a] block">
            {isMyanmar ? '၂။ ပိုးထည်နှင့် ချည်ထိုးလက်ရာ (Textile & Embroidery Weave):' : '2. Silk & Embroidery Texture:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TEXTILE_WEAVE_MODIFIERS.map((mod) => {
              const active = isModifierActive(mod.valueEn);
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleToggleModifier(mod.valueEn)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#ffdf98] text-[#5a4300] border-[#704112]/50 font-bold shadow-xs'
                      : 'bg-[#faf2ee] text-[#51443a] border-[#d6c3b6]/70 hover:bg-[#f4ece9] hover:text-[#1e1b19]'
                  }`}
                >
                  <Layers className="h-3 w-3 text-[#704112] shrink-0" />
                  <span>{mod.labelMm}</span>
                  {active && <Check className="h-3 w-3 stroke-[2.5] text-[#704112]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Fabric & Color Input */}
        <div className="pt-1">
          <input
            type="text"
            placeholder={
              isMyanmar
                ? 'စိတ်ကြိုက် အရောင်နှင့် အဝတ်အစား အသေးစိတ် ထပ်ဖြည့်ရန် (ဥပမာ- ပတ္တမြားနီ လွန်းရာကျော် ချိတ်ထဘီနှင့် ရွှေချည်ထိုး ပိုးဇာအင်္ကျီ)...'
                : 'Custom color, silk weave, or tailoring notes (e.g. Ruby crimson 100-shuttle Acheik with gold Zari blouse)...'
            }
            value={selection.garmentFabric || ''}
            onChange={(e) => onUpdateSelection({ garmentFabric: e.target.value })}
            className="w-full rounded-xl bg-[#faf2ee] border border-[#d6c3b6] px-3 py-2 text-xs text-[#1e1b19] placeholder-[#847469] focus:border-[#704112] focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Secondary Fast Access Dropdown Menu */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] font-semibold text-[#51443a] shrink-0">
          {isMyanmar ? 'အမြန်ရွေးရန် (Quick Select):' : 'Quick Dropdown:'}
        </span>
        <div className="relative flex-1">
          <select
            value={currentGarmentId}
            onChange={(e) => onUpdateSelection({ garmentStyle: e.target.value })}
            className="w-full rounded-xl bg-white border border-[#d6c3b6] hover:border-[#704112] px-3 py-1.5 text-xs font-semibold text-[#1e1b19] focus:outline-none appearance-none cursor-pointer pr-9"
          >
            <option value="skip">
              {isMyanmar ? 'ကျော်သွားပါ (မူလ အဝတ်အစား)' : 'Skip / Default Outfit'}
            </option>
            {GARMENT_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catGarments = GARMENT_OPTIONS.filter((g) => g.category === cat.id && g.id !== 'skip');
              if (catGarments.length === 0) return null;
              return (
                <optgroup key={cat.id} label={isMyanmar ? cat.labelMm : cat.labelEn}>
                  {catGarments.map((garm) => (
                    <option key={garm.id} value={garm.id}>
                      {isMyanmar ? garm.labelMm : garm.labelEn}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#704112]">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
