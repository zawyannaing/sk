import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { CULTURAL_PROP_PRESETS } from '../data/presetData';
import {
  Gem,
  X,
  ChevronDown,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  LayoutGrid,
  GalleryHorizontal,
  Wand2,
  Crown,
  Layers,
} from 'lucide-react';

interface CulturalPropsDropdownProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const CATEGORIES = [
  { id: 'jewelry', labelMm: 'ရတနာနှင့် ရွှေထည် (Jewelry & Gems)', labelEn: 'Royal Jewelry & Gems' },
  { id: 'hair', labelMm: 'ဆံထုံးနှင့် ပန်းအလှ (Hair & Floral)', labelEn: 'Hair & Floral Coiffure' },
  { id: 'all', labelMm: `အကုန်လုံး (${CULTURAL_PROP_PRESETS.length} မျိုး)`, labelEn: `All (${CULTURAL_PROP_PRESETS.length})` },
  { id: 'beauty', labelMm: 'သနပ်ခါးနှင့် အလှအပ', labelEn: 'Thanaka & Beauty' },
  { id: 'accessories', labelMm: 'ထီးနှင့် အသုံးအဆောင်', labelEn: 'Parasols & Accessories' },
  { id: 'attire', labelMm: 'ပိုးပဝါနှင့် လက်ကိုင်အိတ်', labelEn: 'Shawls & Bags' },
  { id: 'music', labelMm: 'တူရိယာနှင့် အနုပညာ', labelEn: 'Harp & Traditional Arts' },
  { id: 'household', labelMm: 'ယွန်းထည်နှင့် ကွမ်းအစ်', labelEn: 'Lacquerware & Tea' },
  { id: 'modern', labelMm: 'ခေတ်ပေါ် ရိုးရာစပ်', labelEn: 'Modern Fusion' },
];

const CATEGORY_BADGES: Record<string, string> = {
  jewelry: 'GEMS & GOLD',
  hair: 'COIFFURE',
  beauty: 'THANAKA',
  accessories: 'HERITAGE PROP',
  attire: 'TEXTILE',
  music: 'CLASSICAL ART',
  household: 'LACQUERWARE',
  modern: 'FUSION',
};

const QUICK_JEWELRY_COMBOS = [
  {
    id: 'royal_konbaung_set',
    labelMm: 'ကုန်းဘောင် နန်းတွင်း ရတနာစုံ (Dalizan + နားတောင်း + ရွှေဆံထိုး)',
    labelEn: 'Royal Konbaung Court Set (Dalizan + Nadoung + Gold Hairpins)',
    presetIds: ['royal_dalizan_necklace', 'gold_nadoung_ear_cylinders', 'sadon_royal_hairpins', 'gold_filigree_bangles'],
  },
  {
    id: 'mogok_ruby_bridal',
    labelMm: 'မိုးကုတ် ပတ္တမြားနှင့် စံပယ်ဆံထုံး (Mogok Ruby + Jasmine Sadon)',
    labelEn: 'Mogok Ruby Parure & Jasmine High Sadon',
    presetIds: ['mogok_ruby_parure', 'sadon_high_chignon_jasmine', 'gem_pendant'],
  },
  {
    id: 'jade_pearl_heritage',
    labelMm: 'ဖားကန့် ကျောက်စိမ်း၊ ပုလဲသွယ်နှင့် ပုသိမ်ထီး (Jadeite + Pearl + Parasol)',
    labelEn: 'Imperial Jadeite, Mergui Pearls & Pathein Parasol',
    presetIds: ['imperial_jadeite_bangle', 'myanmar_pearl_strand', 'pathein_umbrella', 'inle_lotus_scarf'],
  },
  {
    id: 'thingyan_padauk_glow',
    labelMm: 'သင်္ကြန် ပိတောက်ဆံထုံး၊ သနပ်ခါးနှင့် ရွှေလက်ကောက်',
    labelEn: 'Thingyan Padauk Crown, Thanaka & Gold Bangles',
    presetIds: ['padauk_golden_crown', 'thanaka', 'gold_filigree_bangles'],
  },
];

export const CulturalPropsDropdown: React.FC<CulturalPropsDropdownProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('jewelry');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activePropsDetails = selection.culturalPropsDetails || '';

  // Filter props based on category & search query
  const filteredProps = CULTURAL_PROP_PRESETS.filter((prop) => {
    const matchesCat = selectedCategory === 'all' || prop.category === selectedCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      prop.labelMm.toLowerCase().includes(q) ||
      prop.labelEn.toLowerCase().includes(q) ||
      prop.promptText.toLowerCase().includes(q) ||
      prop.id.toLowerCase().includes(q)
    );
  });

  // Scroll left/right helper
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check if a prop is currently selected
  const isPropSelected = (prop: (typeof CULTURAL_PROP_PRESETS)[0]) => {
    if (!activePropsDetails) return false;
    return (
      activePropsDetails.toLowerCase().includes(prop.id.toLowerCase()) ||
      activePropsDetails.includes(prop.labelMm) ||
      activePropsDetails.toLowerCase().includes(prop.promptText.toLowerCase())
    );
  };

  // Add/Remove prop
  const handleSelectProp = (prop: (typeof CULTURAL_PROP_PRESETS)[0]) => {
    let newDetails = activePropsDetails;
    if (isPropSelected(prop)) {
      newDetails = newDetails
        .replace(prop.labelMm, '')
        .replace(prop.promptText, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*|\s*,\s*$/g, '')
        .trim();
    } else {
      newDetails = newDetails ? `${newDetails}, ${prop.labelMm}` : prop.labelMm;
    }
    onUpdateSelection({ culturalPropsDetails: newDetails, includeCulturalProps: true });
  };

  // Apply 1-click Jewelry & Hair Combo
  const handleApplyCombo = (presetIds: string[]) => {
    const labels = presetIds
      .map((id) => CULTURAL_PROP_PRESETS.find((p) => p.id === id)?.labelMm)
      .filter(Boolean) as string[];
    onUpdateSelection({
      culturalPropsDetails: labels.join(', '),
      includeCulturalProps: true,
    });
  };

  // Remove individual custom chip
  const handleRemoveChip = (labelToRemove: string) => {
    const parts = activePropsDetails
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p && p !== labelToRemove && !labelToRemove.includes(p));
    const newDetails = parts.join(', ');
    onUpdateSelection({
      culturalPropsDetails: newDetails,
      includeCulturalProps: newDetails.length > 0,
    });
  };

  // Clear all props
  const handleClearAll = () => {
    onUpdateSelection({ culturalPropsDetails: '', includeCulturalProps: false });
  };

  // Get list of selected chips
  const getSelectedChips = () => {
    if (!activePropsDetails.trim()) return { matchedPresets: [], customChips: [] };

    const matchedPresets = CULTURAL_PROP_PRESETS.filter((p) => isPropSelected(p));

    let customTextRemaining = activePropsDetails;
    matchedPresets.forEach((p) => {
      customTextRemaining = customTextRemaining.replace(p.labelMm, '').replace(p.promptText, '');
    });

    const customChips = customTextRemaining
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== ',');

    return { matchedPresets, customChips };
  };

  const { matchedPresets = [], customChips = [] } = getSelectedChips();
  const totalSelectedCount = matchedPresets.length + customChips.length;

  return (
    <div className="space-y-4 rounded-2xl bg-[#0f1420] border border-zinc-800 p-4 shadow-sm text-white">
      {/* Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Gem className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>
                {isMyanmar
                  ? 'ရတနာ၊ ဆံထုံးနှင့် ယဉ်ကျေးမှု အဆင်တန်ဆာ ဘရောက်ဇာ (Jewelry, Hair & Props Browser)'
                  : 'Royal Jewelry, Coiffure & Cultural Props Browser'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                {CULTURAL_PROP_PRESETS.length} Items
              </span>
              {totalSelectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-mono font-extrabold">
                  {totalSelectedCount} Selected
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isMyanmar
                ? 'နန်းတွင်း ရွှေထည်၊ ပတ္တမြား၊ ကျောက်စိမ်း၊ ဆံထုံး၊ ပန်းအလှနှင့် ရိုးရာအသုံးအဆောင်များကို တစ်ခုထက်မက ပေါင်းစပ်ရွေးချယ်နိုင်ပါသည်'
                : 'Multi-select Burmese royal jewelry, Mogok rubies, jadeite, hair coiffures, flowers, and handheld props'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Grid vs Carousel Toggle */}
          <div className="flex items-center bg-[#141b2a] p-0.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-black font-bold shadow-xs border border-emerald-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-emerald-500 text-black font-bold shadow-xs border border-emerald-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GalleryHorizontal className="h-3.5 w-3.5" />
              <span>Slide</span>
            </button>
          </div>

          {totalSelectedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] bg-[#161c2a] hover:bg-rose-950/40 text-rose-400 font-semibold px-2.5 py-1 rounded-xl border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>{isMyanmar ? 'အားလုံးဖျက်မည်' : 'Clear All'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-[#141b2a] p-0.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => onUpdateSelection({ includeCulturalProps: true })}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selection.includeCulturalProps !== false
                  ? 'bg-emerald-500 text-black font-extrabold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isMyanmar ? 'ထည့်မည်' : 'Enable'}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSelection({ includeCulturalProps: false, culturalPropsDetails: '' })}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                selection.includeCulturalProps === false
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {isMyanmar ? 'မလိုပါ' : 'None'}
            </button>
          </div>
        </div>
      </div>

      {selection.includeCulturalProps !== false && (
        <div className="space-y-4">
          {/* 1-Click Curated Jewelry & Coiffure Combos */}
          <div className="p-3 rounded-xl bg-[#111622] border border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" />
              <span>
                {isMyanmar
                  ? '၁-ချက်နှိပ် ရတနာနှင့် ဆံထုံး တွဲဖက်မှုများ (1-Click Royal Jewelry & Coiffure Sets):'
                  : '1-Click Royal Jewelry & Coiffure Sets:'}
              </span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_JEWELRY_COMBOS.map((combo) => (
                <button
                  key={combo.id}
                  type="button"
                  onClick={() => handleApplyCombo(combo.presetIds)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#161c2a] hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Crown className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>{isMyanmar ? combo.labelMm : combo.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SELECTED ITEMS BADGES / CHIPS DISPLAY */}
          {totalSelectedCount > 0 && (
            <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                {isMyanmar
                  ? `လက်ရှိ ရွေးချယ်ထားသော ရတနာ၊ ဆံထုံးနှင့် အသုံးအဆောင်များ (${totalSelectedCount} ခု):`
                  : `Active Jewelry, Hair & Accessories (${totalSelectedCount}):`}
              </span>

              <div className="flex flex-wrap gap-1.5">
                {matchedPresets.map((prop) => (
                  <span
                    key={prop.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161c2a] border border-emerald-500/40 text-white text-xs font-semibold shadow-2xs"
                  >
                    <Gem className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{isMyanmar ? prop.labelMm : prop.labelEn}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectProp(prop)}
                      className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-0.5 rounded-full cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {customChips.map((chipText, index) => (
                  <span
                    key={`custom-${index}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141b2a] border border-zinc-800 text-zinc-300 text-xs font-medium"
                  >
                    <Layers className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{chipText}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(chipText)}
                      className="ml-1 text-zinc-400 hover:text-rose-400 transition-colors p-0.5 rounded-full cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Tabs + Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? CULTURAL_PROP_PRESETS.length
                    : CULTURAL_PROP_PRESETS.filter((p) => p.category === cat.id).length;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs whitespace-nowrap rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-black font-extrabold border-emerald-500 shadow-xs'
                        : 'bg-[#141b2a] border-zinc-800 text-zinc-400 hover:bg-[#1c2438] hover:text-white'
                    }`}
                  >
                    <span>{isMyanmar ? cat.labelMm : cat.labelEn}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active ? 'bg-black/30 text-white' : 'bg-[#161c2a] text-emerald-400'
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
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMyanmar ? 'ရတနာ၊ ဆံထုံး၊ ပန်း ရှာရန်...' : 'Search ruby, jade, sadon, umbrella...'}
                className="w-full rounded-xl bg-[#161c2a] border border-zinc-800 pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* JEWELRY, HAIR & PROPS BROWSER: GRID VIEW vs CAROUSEL VIEW */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredProps.map((prop, idx) => {
                const selected = isPropSelected(prop);
                const badgeText = CATEGORY_BADGES[prop.category] || 'HERITAGE';
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => handleSelectProp(prop)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 group cursor-pointer ${
                      selected
                        ? 'bg-emerald-500/15 border-2 border-emerald-500 shadow-[0_0_15px_rgba(5,177,135,0.25)]'
                        : 'bg-[#141b2a] border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl border shrink-0 flex flex-col items-center justify-center transition-colors ${
                        selected
                          ? 'bg-emerald-500 text-black font-extrabold border-emerald-500'
                          : 'bg-[#161c2a] text-emerald-400 border-zinc-800 group-hover:border-emerald-500/30'
                      }`}
                    >
                      <Gem className="h-4 w-4" />
                      <span className="text-[8px] font-mono font-bold leading-none mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-bold leading-snug line-clamp-1 ${selected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {isMyanmar ? prop.labelMm : prop.labelEn}
                        </p>
                        <span
                          className={`p-0.5 rounded-full shrink-0 transition-colors ${
                            selected
                              ? 'bg-emerald-500 text-black font-extrabold'
                              : 'border border-zinc-700 text-transparent group-hover:border-emerald-500/30'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#161c2a] text-emerald-400">
                          {badgeText}
                        </span>
                        <p className="text-[10px] font-medium text-emerald-400 truncate">
                          {isMyanmar ? prop.labelEn : prop.labelMm}
                        </p>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {prop.promptText}
                      </p>
                    </div>
                  </button>
                );
              })}
              {filteredProps.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-zinc-400">
                  {isMyanmar ? 'ရှာဖွေထားသော အဆင်တန်ဆာ မတွေ့ပါ။' : 'No matching items found.'}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 bg-[#111622] border border-zinc-800 rounded-xl p-3 relative">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {isMyanmar
                      ? `အဆင်တန်ဆာများ ဘေးတိုက် ဆွဲကြည့်ရန် (${filteredProps.length} မျိုး):`
                      : `Scroll Jewelry & Accessories Horizontally (${filteredProps.length} Items):`}
                  </span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleScroll('left')}
                    className="p-1 rounded-lg bg-[#161c2a] hover:bg-emerald-500 hover:text-black text-emerald-400 border border-zinc-800 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll('right')}
                    className="p-1 rounded-lg bg-[#161c2a] hover:bg-emerald-500 hover:text-black text-emerald-400 border border-zinc-800 transition-all cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div
                ref={scrollContainerRef}
                className="flex gap-2.5 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x snap-mandatory"
              >
                {filteredProps.map((prop, idx) => {
                  const selected = isPropSelected(prop);
                  const badgeText = CATEGORY_BADGES[prop.category] || 'HERITAGE';
                  return (
                    <button
                      key={prop.id}
                      type="button"
                      onClick={() => handleSelectProp(prop)}
                      className={`snap-start shrink-0 w-[210px] p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 group cursor-pointer ${
                        selected
                          ? 'bg-emerald-500/15 border-2 border-emerald-500 shadow-[0_0_15px_rgba(5,177,135,0.25)]'
                          : 'bg-[#141b2a] border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#161c2a] border border-zinc-800 text-emerald-400">
                          #{String(idx + 1).padStart(2, '0')} · {badgeText}
                        </span>
                        <span
                          className={`p-0.5 rounded-full ${
                            selected ? 'bg-emerald-500 text-black font-extrabold' : 'border border-zinc-700 text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      </div>

                      <div>
                        <p className={`text-xs font-bold line-clamp-2 leading-snug ${selected ? 'text-emerald-300' : 'text-zinc-200'}`}>
                          {isMyanmar ? prop.labelMm : prop.labelEn}
                        </p>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1">
                          {prop.promptText}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Jewelry / Hair / Prop Input + Fast Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            <div className="relative">
              <select
                value=""
                onChange={(e) => {
                  const propId = e.target.value;
                  if (!propId) return;
                  const prop = CULTURAL_PROP_PRESETS.find((p) => p.id === propId);
                  if (prop) handleSelectProp(prop);
                  e.target.value = '';
                }}
                className="w-full rounded-xl bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/50 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-9"
              >
                <option value="" disabled className="bg-[#161c2a] text-zinc-400">
                  {isMyanmar
                    ? `Dropdown မနူးမှ အဆင်တန်ဆာ (${CULTURAL_PROP_PRESETS.length}) မျိုး ရွေးရန်...`
                    : `Quick add from ${CULTURAL_PROP_PRESETS.length} jewelry & prop presets...`}
                </option>
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                  const categoryProps = CULTURAL_PROP_PRESETS.filter((p) => p.category === cat.id);
                  if (categoryProps.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={isMyanmar ? cat.labelMm : cat.labelEn} className="bg-[#161c2a] text-emerald-400 font-bold">
                      {categoryProps.map((prop) => {
                        const selected = isPropSelected(prop);
                        return (
                          <option key={prop.id} value={prop.id} className="bg-[#161c2a] text-zinc-200">
                            {selected ? '[Selected] ' : ''}
                            {isMyanmar ? prop.labelMm : prop.labelEn}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>

            <input
              type="text"
              placeholder={
                isMyanmar
                  ? 'အခြား စိတ်ကြိုက် ရတနာ/ဆံထုံး/ပန်း ရေးထည့်ရန် (ဥပမာ- ပတ္တမြားဘယက်၊ စံပယ်ပန်းကုံး)...'
                  : 'Custom jewelry, hair, or props (e.g. ruby choker, jasmine crown)...'
              }
              value={selection.culturalPropsDetails || ''}
              onChange={(e) =>
                onUpdateSelection({
                  culturalPropsDetails: e.target.value,
                  includeCulturalProps: true,
                })
              }
              className="w-full rounded-xl bg-[#161c2a] border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
