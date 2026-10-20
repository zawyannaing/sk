import React, { useState, useRef } from 'react';
import { MatrixSelection } from '../types';
import { WEDDING_ETHNIC_CATEGORIES, WeddingPropItem } from '../data/weddingPresetData';
import {
  Crown,
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Layers,
  Sparkles,
  Landmark,
  History,
} from 'lucide-react';

interface WeddingPropsPanelProps {
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  isMyanmar: boolean;
}

interface PropItemCarouselProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  items: WeddingPropItem[];
  currentSelection: string;
  onToggle: (promptText: string) => void;
  onClear: () => void;
  isMyanmar: boolean;
  dropdownPlaceholder: string;
}

const PropItemCarouselAndDropdown: React.FC<PropItemCarouselProps> = ({
  title,
  subtitle,
  icon,
  items,
  currentSelection,
  onToggle,
  onClear,
  isMyanmar,
  dropdownPlaceholder,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isItemSelected = (promptText: string) => currentSelection.includes(promptText);

  const selectedCount = items.filter((item) => isItemSelected(item.promptText)).length;

  return (
    <div className="space-y-2 rounded-xl bg-[#111622] border border-zinc-800 p-3 transition-colors">
      {/* Title & Stats */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {icon}
          <div>
            <label className="text-xs font-bold text-white flex items-center gap-1">
              <span>{title}</span>
            </label>
            {subtitle && <p className="text-[10px] text-zinc-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
              <Check className="h-2.5 w-2.5" />
              <span>
                {selectedCount} {isMyanmar ? 'ခု ရွေးထား' : 'Selected'}
              </span>
            </span>
          )}
          {currentSelection && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-rose-400 hover:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 transition-colors cursor-pointer"
            >
              {isMyanmar ? 'ရှင်းမည်' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* 1. HORIZONTAL CAROUSEL (NO EMOJIS) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium px-0.5">
          <span>{isMyanmar ? 'ဘေးတိုက် ဆွဲကြည့်ပါ:' : 'Scroll Horizontally:'}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1 rounded bg-[#141b2a] border border-zinc-700 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1 rounded bg-[#141b2a] border border-zinc-700 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => {
            const isSelected = isItemSelected(item.promptText);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.promptText)}
                className={`group shrink-0 w-[150px] sm:w-[180px] snap-start rounded-xl p-2.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(5,177,135,0.2)] ring-1 ring-emerald-500/30'
                    : 'bg-[#141b2a] border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234] text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Item</span>
                    {isSelected ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        <Check className="h-2.5 w-2.5" />
                        <span>{isMyanmar ? 'ရွေးထား' : 'Selected'}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-400 group-hover:text-emerald-400">
                        {isMyanmar ? '+ ရွေးမည်' : '+ Pick'}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs font-semibold leading-tight line-clamp-2 ${
                      isSelected ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {isMyanmar ? item.labelMm : item.labelEn}
                  </p>
                </div>

                <div className="mt-2 border-t border-zinc-800/80 pt-1.5">
                  <p className="text-[10px] text-zinc-400 line-clamp-2 italic leading-tight">
                    {item.promptText}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DROPDOWN SELECTOR (NO EMOJIS) */}
      <div className="pt-0.5">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onToggle(e.target.value);
            }
          }}
          className="w-full rounded-lg bg-[#141b2a] border border-zinc-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
        >
          <option value="" className="bg-[#141b2a] text-zinc-400">
            {dropdownPlaceholder}
          </option>
          {items.map((item) => {
            const isSelected = isItemSelected(item.promptText);
            return (
              <option key={item.id} value={item.promptText} className="bg-[#141b2a] text-zinc-200 py-1">
                {isSelected ? '✓ [ရွေးထားပြီး] ' : '+ '} {isMyanmar ? item.labelMm : item.labelEn}
              </option>
            );
          })}
        </select>
      </div>

      {/* Selected Items Tag Chips (NO EMOJIS) */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-800/80">
          {items
            .filter((item) => isItemSelected(item.promptText))
            .map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
              >
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{isMyanmar ? item.labelMm : item.labelEn}</span>
                <button
                  type="button"
                  onClick={() => onToggle(item.promptText)}
                  className="hover:text-rose-400 text-emerald-400/70 transition-colors ml-0.5 cursor-pointer"
                  title="Remove"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export const WeddingPropsPanel: React.FC<WeddingPropsPanelProps> = ({
  selection,
  onUpdateSelection,
  isMyanmar,
}) => {
  const [activeEthnicId, setActiveEthnicId] = useState<string>('bamar');
  const [activeEraId, setActiveEraId] = useState<'ancient' | 'colonial' | 'modern'>('ancient');

  // Find active ethnic group data
  const currentEthnic =
    WEDDING_ETHNIC_CATEGORIES.find((e) => e.id === activeEthnicId) || WEDDING_ETHNIC_CATEGORIES[0];

  // Find active era data
  const currentEra = currentEthnic.eras.find((era) => era.id === activeEraId) || currentEthnic.eras[0];

  // Helper toggle function for accessory props
  const toggleAccessory = (promptText: string) => {
    const current = selection.weddingAccessoryProps || '';
    let updated = '';
    if (current.includes(promptText)) {
      updated = current
        .replace(promptText, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
        .trim();
    } else {
      updated = current ? `${current}, ${promptText}` : promptText;
    }
    onUpdateSelection({ weddingAccessoryProps: updated });
  };

  // Helper toggle function for studio backdrop props
  const toggleStudioProp = (promptText: string) => {
    const current = selection.weddingStudioBackdropProps || '';
    let updated = '';
    if (current.includes(promptText)) {
      updated = current
        .replace(promptText, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
        .trim();
    } else {
      updated = current ? `${current}, ${promptText}` : promptText;
    }
    onUpdateSelection({ weddingStudioBackdropProps: updated });
  };

  const handleClearAccessories = () => {
    onUpdateSelection({ weddingAccessoryProps: '' });
  };

  const handleClearStudioProps = () => {
    onUpdateSelection({ weddingStudioBackdropProps: '' });
  };

  const handleReset = () => {
    onUpdateSelection({
      weddingAccessoryProps: '',
      weddingStudioBackdropProps: '',
    });
  };

  const hasSelections = Boolean(selection.weddingAccessoryProps || selection.weddingStudioBackdropProps);

  return (
    <div className="bg-[#0f1420] rounded-xl p-4 sm:p-5 shadow-xs border border-zinc-800 flex flex-col gap-4">
      {/* Header (SHOW AI Luxury Dark Emerald UI) */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <Crown className="h-4 w-4 text-emerald-400" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              {isMyanmar
                ? 'မင်္ဂလာ အသုံးဆောင်များ၊ ခန်းဝင်ပစ္စည်းများနှင့် တိုင်းရင်းသား ကဏ္ဍ'
                : 'Wedding Accessories, Studio Backdrops & Ethnic Categories'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isMyanmar
                ? 'ခေတ် ၃ ခေတ်နှင့် တိုင်းရင်းသားများ၏ ရိုးရာ မင်္ဂလာအသုံးဆောင်များနှင့် ခန်းဝင်ပစ္စည်းများကို ရွေးချယ်ပါ'
                : 'Browse wedding accessories & studio backdrops across 3 eras via horizontal carousels & dropdown menus'}
            </p>
          </div>
        </div>

        {hasSelections && (
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isMyanmar ? 'အကုန်ရှင်းမည်' : 'Clear Props'}</span>
          </button>
        )}
      </div>

      {/* 1. Ethnic Group Selector (NO EMOJIS) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <Landmark className="h-3.5 w-3.5 text-emerald-400" />
          <span>{isMyanmar ? '၁။ တိုင်းရင်းသား ကဏ္ဍ ရွေးရန် (Ethnic Group):' : '1. Select Ethnic Group:'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {WEDDING_ETHNIC_CATEGORIES.map((ethnic) => {
            const isActive = activeEthnicId === ethnic.id;
            const cleanNameMm = ethnic.nameMm.replace(/^[၀-၉၁-၆\d]+\။\s*/, '');
            return (
              <button
                key={ethnic.id}
                type="button"
                onClick={() => {
                  setActiveEthnicId(ethnic.id);
                  onUpdateSelection({ weddingEthnicGroup: ethnic.id });
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  isActive
                    ? 'border-2 border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(5,177,135,0.2)]'
                    : 'bg-[#141b2a] text-zinc-300 border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                }`}
              >
                <span className="font-bold text-xs truncate max-w-full">
                  {isMyanmar ? cleanNameMm : ethnic.nameEn}
                </span>
                <span className="text-[10px] text-zinc-400 truncate max-w-full">
                  {isMyanmar ? ethnic.nameEn : cleanNameMm}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Era Selector (NO EMOJIS) */}
      <div className="space-y-1.5 pt-1 border-t border-zinc-800">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isMyanmar ? '၂။ ခေတ် ၃ ခေတ် ရွေးရန် (Select Era):' : '2. Select Era:'}</span>
          </label>
          <span className="text-[10px] text-zinc-400">
            {isMyanmar ? 'ခေတ်ပြောင်းလျှင် အောက်ပါ ပစ္စည်းစာရင်းများ အလိုအလျောက် ပြောင်းလဲပါမည်' : 'Switching era updates props list below'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {currentEthnic.eras.map((era) => {
            const isActive = activeEraId === era.id;
            return (
              <button
                key={era.id}
                type="button"
                onClick={() => {
                  setActiveEraId(era.id);
                  onUpdateSelection({ weddingEra: era.id });
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'border-2 border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(5,177,135,0.2)]'
                    : 'bg-[#141b2a] text-zinc-300 border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold block truncate">{isMyanmar ? era.eraMm : era.eraEn}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{isMyanmar ? era.eraEn : era.eraMm}</span>
                </div>
                {isActive && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-Category A: မင်္ဂလာ အသုံးဆောင်များ (Wedding Accessories) */}
      <PropItemCarouselAndDropdown
        title={
          isMyanmar
            ? `A. မင်္ဂလာ အသုံးဆောင်များ (${currentEthnic.nameMm.replace(/^[၀-၉၁-၆\d]+\။\s*/, '')} - ${
                currentEra.id === 'ancient' ? 'ခေတ်ဟောင်း' : currentEra.id === 'colonial' ? 'ခေတ်လယ်' : 'ခေတ်သစ်'
              })`
            : `A. Wedding Accessories (${currentEthnic.nameEn} - ${currentEra.eraEn})`
        }
        subtitle={
          isMyanmar
            ? 'မင်္ဂလာအခမ်းအနားသုံး ရတနာ၊ ပန်းကုံး၊ သပြေခက်၊ လက်ထပ်ကွင်း နှင့် အသုံးအဆောင်များ'
            : 'Traditional wedding jewellery, garlands, blessing bowls, and ceremonial accessories'
        }
        icon={<Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
        items={currentEra.accessories}
        currentSelection={selection.weddingAccessoryProps || ''}
        onToggle={toggleAccessory}
        onClear={handleClearAccessories}
        isMyanmar={isMyanmar}
        dropdownPlaceholder={
          isMyanmar
            ? `▼ Dropdown ဖွင့်၍ မင်္ဂလာအသုံးအဆောင် (${currentEra.accessories.length} မျိုး) မှ ရွေးရန်...`
            : `▼ Pick from Dropdown (${currentEra.accessories.length} Accessories)...`
        }
      />

      {/* 4. Sub-Category B: Studio ခန်းဝင် ပစ္စည်းများနှင့် နောက်ခံ (Studio Backdrop & Props) */}
      <PropItemCarouselAndDropdown
        title={
          isMyanmar
            ? `B. Studio ခန်းဝင် ပစ္စည်းများနှင့် နောက်ခံ (${currentEthnic.nameMm.replace(/^[၀-၉၁-၆\d]+\။\s*/, '')} - ${
                currentEra.id === 'ancient' ? 'ခေတ်ဟောင်း' : currentEra.id === 'colonial' ? 'ခေတ်လယ်' : 'ခေတ်သစ်'
              })`
            : `B. Studio Backdrops & Props (${currentEthnic.nameEn} - ${currentEra.eraEn})`
        }
        subtitle={
          isMyanmar
            ? 'မင်္ဂလာခန်းဆီး၊ ပလ္လင်တော်၊ ကနုတ်ရွှေဇာ၊ ထီးဖြူ နှင့် စတူဒီယို ခန်းဝင်ပစ္စည်းများ'
            : 'Studio backdrops, royal thrones, carved wood panels, and ceremonial room props'
        }
        icon={<Layers className="h-3.5 w-3.5 text-emerald-400" />}
        items={currentEra.studioProps}
        currentSelection={selection.weddingStudioBackdropProps || ''}
        onToggle={toggleStudioProp}
        onClear={handleClearStudioProps}
        isMyanmar={isMyanmar}
        dropdownPlaceholder={
          isMyanmar
            ? `▼ Dropdown ဖွင့်၍ Studio ခန်းဝင်ပစ္စည်း (${currentEra.studioProps.length} မျိုး) မှ ရွေးရန်...`
            : `▼ Pick from Dropdown (${currentEra.studioProps.length} Studio Props)...`
        }
      />

      {/* Active Selections Summary Footer */}
      {hasSelections && (
        <div className="pt-2 border-t border-zinc-800 text-[11px] space-y-1">
          {selection.weddingAccessoryProps && (
            <p className="text-emerald-400 truncate flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="font-bold shrink-0">ရွေးချယ်ထားသော မင်္ဂလာ အသုံးဆောင်များ: </span>
              <span className="truncate">{selection.weddingAccessoryProps}</span>
            </p>
          )}
          {selection.weddingStudioBackdropProps && (
            <p className="text-zinc-300 truncate flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-emerald-400 shrink-0" />
              <span className="font-bold shrink-0">ရွေးချယ်ထားသော Studio ခန်းဝင် ပစ္စည်းများ: </span>
              <span className="truncate">{selection.weddingStudioBackdropProps}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
