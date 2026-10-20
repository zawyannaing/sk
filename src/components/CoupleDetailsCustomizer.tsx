import React, { useRef } from 'react';
import { MatrixSelection } from '../types';
import {
  COUPLE_POSES_OPTIONS,
  GROOM_OUTFIT_OPTIONS,
  GROOM_TOP_OPTIONS,
  GROOM_BOTTOM_OPTIONS,
  GROOM_EXPRESSION_OPTIONS,
  GROOM_HAIR_OPTIONS,
  GROOM_ACCESSORY_PRESETS,
  BRIDE_OUTFIT_OPTIONS,
  BRIDE_TOP_OPTIONS,
  BRIDE_BOTTOM_OPTIONS,
  BRIDE_EXPRESSION_OPTIONS,
  BRIDE_HAIR_OPTIONS,
  BRIDE_ACCESSORY_PRESETS,
} from '../data/presetData';
import {
  Heart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Shirt,
  Scissors,
  Smile,
  Crown,
  Sparkles,
} from 'lucide-react';

interface CoupleOptionItem {
  id?: string;
  emoji?: string;
  labelMm: string;
  labelEn?: string;
  promptText: string;
}

interface DualControlFieldProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  options: CoupleOptionItem[];
  selectedValue: string;
  onSelect: (val: string) => void;
  isMyanmar: boolean;
  placeholder?: string;
}

const scrollCarousel = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  direction: 'left' | 'right',
  amount = 220
) => {
  if (containerRef.current) {
    const scrollAmount = direction === 'left' ? -amount : amount;
    containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

/**
 * Dual Control Component: Provides BOTH a Horizontal Carousel & a Dropdown Menu
 * in 100% native Burmese Prompt Studio warm light UI (No Emojis).
 */
const DualControlField: React.FC<DualControlFieldProps> = ({
  title,
  subtitle,
  icon,
  options,
  selectedValue,
  onSelect,
  isMyanmar,
  placeholder,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = (direction: 'left' | 'right') => scrollCarousel(scrollRef, direction, 220);

  const selectedItem = options.find((opt) => opt.promptText === selectedValue);

  return (
    <div className="space-y-2 rounded-xl bg-[#111622] border border-zinc-800 p-3 transition-colors">
      {/* Title & Info Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
          {subtitle && <span className="text-[10px] text-zinc-400 font-normal">({subtitle})</span>}
        </label>

        {/* Selected preview badge or reset */}
        <div className="flex items-center gap-1.5">
          {selectedValue ? (
            <>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 truncate max-w-[160px] sm:max-w-[220px]">
                {isMyanmar ? selectedItem?.labelMm : selectedItem?.labelEn || selectedItem?.labelMm}
              </span>
              <button
                type="button"
                onClick={() => onSelect('')}
                className="text-[10px] text-rose-400 hover:bg-rose-950/40 px-1.5 py-0.5 rounded border border-zinc-800 transition-colors cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            </>
          ) : (
            <span className="text-[10px] text-zinc-400 font-sans">
              ({options.length} {isMyanmar ? 'မျိုး ရွေးနိုင်' : 'Options'})
            </span>
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
              onClick={() => handleScroll('left')}
              className="p-1 rounded bg-[#161c2a] border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-2xs"
              title="Scroll Left"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 rounded bg-[#161c2a] border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-2xs"
              title="Scroll Right"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {options.map((opt, idx) => {
            const isSelected = selectedValue === opt.promptText;
            return (
              <button
                key={opt.id || idx}
                type="button"
                onClick={() => onSelect(isSelected ? '' : opt.promptText)}
                className={`group shrink-0 w-[135px] sm:w-[155px] snap-start rounded-xl p-2.5 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-2 border-emerald-500 bg-emerald-500/15 text-white shadow-[0_0_15px_rgba(5,177,135,0.25)]'
                    : 'bg-[#141b2a] border border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234] text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Option</span>
                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        <Check className="h-2.5 w-2.5" />
                        <span>{isMyanmar ? 'ရွေးထား' : 'Selected'}</span>
                      </span>
                    )}
                  </div>
                  <div className={`text-xs font-semibold line-clamp-2 leading-tight ${isSelected ? 'text-emerald-300 font-bold' : 'text-zinc-200'}`}>
                    {isMyanmar ? opt.labelMm : opt.labelEn || opt.labelMm}
                  </div>
                </div>

                {opt.labelEn && isMyanmar && (
                  <div className="text-[10px] text-zinc-400 truncate mt-1.5 border-t border-zinc-800 pt-1">
                    {opt.labelEn}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DROPDOWN SELECTOR (NO EMOJIS) */}
      <div className="pt-0.5">
        <select
          value={selectedValue || ''}
          onChange={(e) => onSelect(e.target.value)}
          className={`w-full rounded-lg bg-[#161c2a] border ${selectedValue ? 'border-emerald-500 text-white' : 'border-zinc-800 text-zinc-300'} px-2.5 py-1.5 text-xs font-medium focus:border-emerald-500 focus:outline-none transition-all shadow-2xs`}
        >
          <option value="" className="bg-[#161c2a] text-zinc-400">
            {placeholder || (isMyanmar ? '-- Dropdown ဖွင့်၍ ရွေးချယ်ပါ --' : '-- Open Dropdown to Select --')}
          </option>
          {options.map((opt, idx) => (
            <option key={opt.id || idx} value={opt.promptText} className="bg-[#161c2a] text-zinc-200 py-1">
              {isMyanmar ? opt.labelMm : opt.labelEn || opt.labelMm}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

/**
 * Dual Control Component for Multi-Select Accessories & Pose Presets (NO EMOJIS)
 */
interface DualControlMultiSelectProps {
  title: string;
  icon?: React.ReactNode;
  presets: { labelMm: string; promptText: string }[];
  currentValue: string;
  onUpdate: (val: string) => void;
  isMyanmar: boolean;
}

const DualControlMultiSelect: React.FC<DualControlMultiSelectProps> = ({
  title,
  icon,
  presets,
  currentValue,
  onUpdate,
  isMyanmar,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = (direction: 'left' | 'right') => scrollCarousel(scrollRef, direction, 200);

  const isSelected = (text: string) => currentValue.includes(text);

  const toggleItem = (text: string) => {
    let updated = currentValue || '';
    if (isSelected(text)) {
      updated = updated
        .replace(text, '')
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .replace(/,\s*$/, '')
        .trim();
    } else {
      updated = updated ? `${updated}, ${text}` : text;
    }
    onUpdate(updated);
  };

  const selectedCount = presets.filter((p) => isSelected(p.promptText)).length;

  return (
    <div className="space-y-2 rounded-xl bg-[#111622] border border-zinc-800 p-3 transition-colors">
      {/* Title */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </label>
        <div className="flex items-center gap-1.5">
          {selectedCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              {selectedCount} {isMyanmar ? 'ခု ရွေးထား' : 'Selected'}
            </span>
          )}
          {currentValue && (
            <button
              type="button"
              onClick={() => onUpdate('')}
              className="text-[10px] text-rose-400 hover:bg-rose-950/40 px-1.5 py-0.5 rounded border border-zinc-800 transition-colors cursor-pointer"
            >
              {isMyanmar ? 'ရှင်းမည်' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Chips */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium px-0.5">
          <span>{isMyanmar ? 'ဘေးတိုက် ဆွဲ၍ နှိပ်ရွေးပါ:' : 'Scroll & Click to Pick:'}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1 rounded bg-[#161c2a] border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1 rounded bg-[#161c2a] border border-zinc-800 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin snap-x"
          style={{ scrollBehavior: 'smooth' }}
        >
          {presets.map((preset, idx) => {
            const active = isSelected(preset.promptText);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleItem(preset.promptText)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all border flex items-center gap-1 cursor-pointer snap-start ${
                  active
                    ? 'bg-emerald-500 text-black font-extrabold border-emerald-500 shadow-2xs'
                    : 'bg-[#141b2a] text-zinc-300 border-zinc-800 hover:border-emerald-500/40 hover:bg-[#1a2234]'
                }`}
              >
                {active && <Check className="h-2.5 w-2.5 text-black stroke-[3]" />}
                <span>{preset.labelMm}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropdown Selector for Multi-pick */}
      <div className="pt-0.5">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              toggleItem(e.target.value);
            }
          }}
          className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none transition-all shadow-2xs"
        >
          <option value="" className="bg-[#161c2a] text-zinc-400">
            {isMyanmar ? '▼ Dropdown မှ အသုံးအဆောင် ထပ်မံ ရွေးထည့်ရန် / ဖယ်ထုတ်ရန်...' : '▼ Pick / Toggle items from Dropdown menu...'}
          </option>
          {presets.map((preset, idx) => {
            const active = isSelected(preset.promptText);
            return (
              <option key={idx} value={preset.promptText} className="bg-[#161c2a] text-zinc-200">
                {active ? '✓ [ရွေးထား] ' : '+ '} {preset.labelMm}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

interface CoupleDetailsCustomizerProps {
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  isMyanmar: boolean;
}

export const CoupleDetailsCustomizer: React.FC<CoupleDetailsCustomizerProps> = ({
  selection,
  onUpdateSelection,
  isMyanmar,
}) => {
  const handleResetAll = () => {
    onUpdateSelection({
      couplePose: '',
      groomOutfit: '',
      groomTop: '',
      groomBottom: '',
      groomExpression: '',
      groomHair: '',
      groomPoseAccessory: '',
      brideOutfit: '',
      brideTop: '',
      brideBottom: '',
      brideExpression: '',
      brideHair: '',
      bridePoseAccessory: '',
    });
  };

  const hasAnySelection = Boolean(
    selection.couplePose ||
      selection.groomOutfit ||
      selection.groomTop ||
      selection.groomBottom ||
      selection.groomExpression ||
      selection.groomHair ||
      selection.groomPoseAccessory ||
      selection.brideOutfit ||
      selection.brideTop ||
      selection.brideBottom ||
      selection.brideExpression ||
      selection.brideHair ||
      selection.bridePoseAccessory
  );

  return (
    <div className="bg-[#0f1420] rounded-xl p-4 sm:p-5 shadow-xs border border-zinc-800 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
            <Heart className="h-4 w-4 text-emerald-400" />
          </span>
          <div>
            <h4 className="text-sm sm:text-base font-semibold text-white">
              {isMyanmar ? 'သတို့သားသတို့သမီး အချက်အလက်များ (Couple Customizer)' : 'Groom & Bride Detailed Customization'}
            </h4>
            <p className="text-xs text-zinc-400">
              {isMyanmar
                ? 'ရွေးချယ်စရာများ အားလုံးကို ဘေးတိုက်ဆွဲကြည့်၍လည်းကောင်း၊ Dropdown မှလည်းကောင်း စိတ်ကြိုက် ရွေးချယ်နိုင်ပါသည်'
                : 'Browse all options via horizontal scrollable carousels & dropdown menus'}
            </p>
          </div>
        </div>

        {hasAnySelection && (
          <button
            type="button"
            onClick={handleResetAll}
            className="px-2.5 py-1 bg-[#161c2a] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-emerald-400" />
            <span>{isMyanmar ? 'အကုန်ရှင်းမည်' : 'Reset All'}</span>
          </button>
        )}
      </div>

      {/* 1. COUPLE POSE & INTERACTION (စုံတွဲ ကိုယ်ဟန်အမူယာ ပို့စ်များ) */}
      <div className="space-y-2">
        <DualControlField
          title={isMyanmar ? 'စုံတွဲ ကိုယ်ဟန်အမူယာ / ပို့စ်များ (Couple Pose & Interaction):' : 'Couple Pose & Interaction:'}
          icon={<Heart className="h-3.5 w-3.5 text-emerald-400" />}
          options={COUPLE_POSES_OPTIONS}
          selectedValue={selection.couplePose || ''}
          onSelect={(val) => onUpdateSelection({ couplePose: val })}
          isMyanmar={isMyanmar}
          placeholder={isMyanmar ? '-- စုံတွဲ ကိုယ်ဟန်အမူယာ ရွေးရန် --' : '-- Select Couple Pose --'}
        />
      </div>

      {/* 2. GROOM & BRIDE TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        
        {/* 2A. GROOM SECTION (သတို့သား အချက်အလက်များ) */}
        <div className="space-y-3 rounded-xl bg-[#0a0d14] border border-zinc-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isMyanmar ? 'သတို့သား အချက်အလက်များ (Groom Details)' : 'Groom Details'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#161c2a] border border-zinc-800 text-emerald-400 font-semibold">
              Groom
            </span>
          </div>

          {/* Groom Full Outfit */}
          <DualControlField
            title={isMyanmar ? 'သတို့သား ဝတ်စုံအပြည့် (Full Set)' : 'Groom Full Outfit'}
            subtitle={isMyanmar ? 'မင်္ဂလာ/ရိုးရာ/တက်ဆီးဒို့' : 'Wedding/Formal/Tuxedo'}
            icon={<Crown className="h-3.5 w-3.5 text-emerald-400" />}
            options={GROOM_OUTFIT_OPTIONS}
            selectedValue={selection.groomOutfit || ''}
            onSelect={(val) => onUpdateSelection({ groomOutfit: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- သတို့သား ဝတ်စုံအပြည့် ရွေးရန် --' : '-- Select Full Outfit --'}
          />

          {/* Groom Top */}
          <DualControlField
            title={isMyanmar ? 'အထက်အင်္ကျီ (Top Shirt / Jacket)' : 'Groom Top:'}
            icon={<Shirt className="h-3.5 w-3.5 text-emerald-400" />}
            options={GROOM_TOP_OPTIONS}
            selectedValue={selection.groomTop || ''}
            onSelect={(val) => onUpdateSelection({ groomTop: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- သတို့သား အင်္ကျီ ရွေးရန် --' : '-- Select Top --'}
          />

          {/* Groom Bottom */}
          <DualControlField
            title={isMyanmar ? 'အောက်အထည် (Bottom / Trousers / Longyi)' : 'Groom Bottom:'}
            icon={<Shirt className="h-3.5 w-3.5 text-emerald-400" />}
            options={GROOM_BOTTOM_OPTIONS}
            selectedValue={selection.groomBottom || ''}
            onSelect={(val) => onUpdateSelection({ groomBottom: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- ဘောင်းဘီ / ပုဆိုး ရွေးရန် --' : '-- Select Bottom --'}
          />

          {/* Groom Expression */}
          <DualControlField
            title={isMyanmar ? 'မျက်နှာအမူအရာ / အကြည့် (Expression)' : 'Groom Expression:'}
            icon={<Smile className="h-3.5 w-3.5 text-emerald-400" />}
            options={GROOM_EXPRESSION_OPTIONS}
            selectedValue={selection.groomExpression || ''}
            onSelect={(val) => onUpdateSelection({ groomExpression: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- မျက်နှာအမူအရာ ရွေးရန် --' : '-- Select Expression --'}
          />

          {/* Groom Hair */}
          <DualControlField
            title={isMyanmar ? 'ဆံပင်စတိုင် (Hair Style)' : 'Groom Hair Style:'}
            icon={<Scissors className="h-3.5 w-3.5 text-emerald-400" />}
            options={GROOM_HAIR_OPTIONS}
            selectedValue={selection.groomHair || ''}
            onSelect={(val) => onUpdateSelection({ groomHair: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- ဆံပင်စတိုင် ရွေးရန် --' : '-- Select Hair Style --'}
          />

          {/* Groom Accessories / Pose Presets */}
          <DualControlMultiSelect
            title={isMyanmar ? 'အသုံးအဆောင် / ဟန်ပန် ပရိုဆက်များ (Accessories)' : 'Groom Accessories & Poses:'}
            icon={<Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
            presets={GROOM_ACCESSORY_PRESETS}
            currentValue={selection.groomPoseAccessory || ''}
            onUpdate={(val) => onUpdateSelection({ groomPoseAccessory: val })}
            isMyanmar={isMyanmar}
          />
        </div>

        {/* 2B. BRIDE SECTION (သတို့သမီး အချက်အလက်များ) */}
        <div className="space-y-3 rounded-xl bg-[#0a0d14] border border-zinc-800 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isMyanmar ? 'သတို့သမီး အချက်အလက်များ (Bride Details)' : 'Bride Details'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#161c2a] border border-zinc-800 text-emerald-400 font-semibold">
              Bride
            </span>
          </div>

          {/* Bride Full Outfit */}
          <DualControlField
            title={isMyanmar ? 'သတို့သမီး ဝတ်စုံအပြည့် (Full Set)' : 'Bride Full Outfit'}
            subtitle={isMyanmar ? 'ထိုင်မသိမ်း/ဂါဝန်/တော်ဝင်' : 'Bridal Gown/Traditional'}
            icon={<Crown className="h-3.5 w-3.5 text-emerald-400" />}
            options={BRIDE_OUTFIT_OPTIONS}
            selectedValue={selection.brideOutfit || ''}
            onSelect={(val) => onUpdateSelection({ brideOutfit: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- သတို့သမီး ဝတ်စုံအပြည့် ရွေးရန် --' : '-- Select Full Outfit --'}
          />

          {/* Bride Top */}
          <DualControlField
            title={isMyanmar ? 'အထက်အင်္ကျီ (Top Blouse)' : 'Bride Top Blouse:'}
            icon={<Shirt className="h-3.5 w-3.5 text-emerald-400" />}
            options={BRIDE_TOP_OPTIONS}
            selectedValue={selection.brideTop || ''}
            onSelect={(val) => onUpdateSelection({ brideTop: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- သတို့သမီး အင်္ကျီ ရွေးရန် --' : '-- Select Top Blouse --'}
          />

          {/* Bride Bottom */}
          <DualControlField
            title={isMyanmar ? 'အောက်အထည် (Bottom / Skirt / Longyi)' : 'Bride Bottom:'}
            icon={<Shirt className="h-3.5 w-3.5 text-emerald-400" />}
            options={BRIDE_BOTTOM_OPTIONS}
            selectedValue={selection.brideBottom || ''}
            onSelect={(val) => onUpdateSelection({ brideBottom: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- ထမီ / စကတ် ရွေးရန် --' : '-- Select Bottom --'}
          />

          {/* Bride Expression */}
          <DualControlField
            title={isMyanmar ? 'မျက်နှာအမူအရာ / အကြည့် (Expression)' : 'Bride Expression:'}
            icon={<Smile className="h-3.5 w-3.5 text-emerald-400" />}
            options={BRIDE_EXPRESSION_OPTIONS}
            selectedValue={selection.brideExpression || ''}
            onSelect={(val) => onUpdateSelection({ brideExpression: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- မျက်နှာအမူအရာ ရွေးရန် --' : '-- Select Expression --'}
          />

          {/* Bride Hair */}
          <DualControlField
            title={isMyanmar ? 'ဆံပင်စတိုင် (Hair Style)' : 'Bride Hair Style:'}
            icon={<Scissors className="h-3.5 w-3.5 text-emerald-400" />}
            options={BRIDE_HAIR_OPTIONS}
            selectedValue={selection.brideHair || ''}
            onSelect={(val) => onUpdateSelection({ brideHair: val })}
            isMyanmar={isMyanmar}
            placeholder={isMyanmar ? '-- ဆံပင်စတိုင် ရွေးရန် --' : '-- Select Hair Style --'}
          />

          {/* Bride Accessories / Pose Presets */}
          <DualControlMultiSelect
            title={isMyanmar ? 'အသုံးအဆောင် / ဟန်ပန် ပရိုဆက်များ (Accessories)' : 'Bride Accessories & Poses:'}
            icon={<Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
            presets={BRIDE_ACCESSORY_PRESETS}
            currentValue={selection.bridePoseAccessory || ''}
            onUpdate={(val) => onUpdateSelection({ bridePoseAccessory: val })}
            isMyanmar={isMyanmar}
          />
        </div>

      </div>
    </div>
  );
};
