import React, { useState, useRef } from 'react';
import { Language, MatrixSelection } from '../types';
import { POSE_EXPRESSION_OPTIONS } from '../data/presetData';
import { Smile, ChevronLeft, ChevronRight, Check, ChevronDown, Sparkles, X } from 'lucide-react';

interface PoseSelectionCarouselProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
}

const cleanEmoji = (text: string = '') =>
  text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

const POSE_CATEGORIES = [
  { id: 'all', labelMm: 'အကုန်လုံး (၂၅ မျိုး)', labelEn: 'All (25 Poses)' },
  { id: 'facial', labelMm: 'မျက်နှာ အမူအရာများ (၆ မျိုး)', labelEn: 'Facial Expressions' },
  { id: 'standing_action', labelMm: 'မတ်တပ် / လမ်းလျှောက် / ကခုန် (၆ မျိုး)', labelEn: 'Standing & Action' },
  { id: 'seated_relax', labelMm: 'ထိုင် / လဲလျောင်း / အေးဆေး (၄ မျိုး)', labelEn: 'Seated & Relaxed' },
  { id: 'gestures_props', labelMm: 'လက်ဟန် / ပစ္စည်းကိုင် (၉ မျိုး)', labelEn: 'Gestures & Props' },
];

export const PoseSelectionCarousel: React.FC<PoseSelectionCarouselProps> = ({
  language,
  selection,
  onUpdateSelection,
}) => {
  const isMyanmar = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentPoseId = selection.poseExpression || 'soft_smile';
  const currentPoseObj = POSE_EXPRESSION_OPTIONS.find((p) => p.id === currentPoseId) || POSE_EXPRESSION_OPTIONS[1];

  // Helper to get category for each pose
  const getCategory = (id: string) => {
    if (['soft_smile', 'laughing', 'serious_calm', 'looking_at_camera', 'surprised_excited', 'shy_blushing'].includes(id)) {
      return 'facial';
    }
    if (['standing_pose', 'walking', 'dancing', 'arms_crossed', 'waving', 'looking_back'].includes(id)) {
      return 'standing_action';
    }
    if (['sitting_pose', 'lying_down', 'looking_down', 'looking_away_candid'].includes(id)) {
      return 'seated_relax';
    }
    return 'gestures_props';
  };

  const getCategoryLabel = (catId: string) => {
    switch (catId) {
      case 'facial': return isMyanmar ? 'မျက်နှာ အမူအရာ' : 'Facial';
      case 'standing_action': return isMyanmar ? 'လှုပ်ရှားမှု' : 'Action';
      case 'seated_relax': return isMyanmar ? 'အနားယူဟန်' : 'Relaxed';
      default: return isMyanmar ? 'လက်ဟန် / အမူအရာ' : 'Gesture / Prop';
    }
  };

  // Filter options
  const filteredOptions = POSE_EXPRESSION_OPTIONS.filter((p) => {
    if (p.id === 'skip') return false; // Shown in header skip button
    if (selectedCategory === 'all') return true;
    return getCategory(p.id) === selectedCategory;
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
              ? `ဟန်ပန် နှင့် အမူအရာ (၂၅ မျိုး)`
              : `Select Pose & Expression (25 Options):`}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSelection({ poseExpression: 'skip', customPoseDetails: '' })}
            className="text-[11px] bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 font-semibold px-2.5 py-1 rounded-md border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>{isMyanmar ? 'မရွေးပါ' : 'Skip'}</span>
          </button>

          <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30">
            {cleanEmoji(isMyanmar ? currentPoseObj.labelMm : currentPoseObj.labelEn)}
          </span>
        </div>
      </div>

      {/* Quick Filter Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {POSE_CATEGORIES.map((cat) => (
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

      {/* 🌟 100% HORIZONTAL SCROLLABLE CAROUSEL */}
      <div className="space-y-2 bg-[#161c2a] border border-zinc-800 rounded-xl p-3 relative">
        <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {isMyanmar
                ? `ဟန်ပန်အမူအရာများ ဘေးတိုက် ဆွဲကြည့်ပါ (↔):`
                : `Poses & Expressions (Scroll Horizontally ↔):`}
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
          {filteredOptions.map((pose) => {
            const isSelected = currentPoseId === pose.id;
            const categoryTag = getCategoryLabel(getCategory(pose.id));

            return (
              <button
                key={pose.id}
                type="button"
                onClick={() => onUpdateSelection({ poseExpression: isSelected ? 'skip' : pose.id, customPoseDetails: isSelected ? '' : undefined })}
                className={`snap-start shrink-0 min-w-[180px] max-w-[220px] p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer ${
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
                    {cleanEmoji(isMyanmar ? pose.labelMm : pose.labelEn)}
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
            {isMyanmar ? 'သို့မဟုတ် Dropdown မနူးမှ ရွေးချယ်ရန်:' : 'Or Select via Dropdown Menu:'}
          </span>
        </div>
        <div className="relative">
          <select
            value={currentPoseId}
            onChange={(e) => onUpdateSelection({ poseExpression: e.target.value })}
            className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/40 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer pr-10 shadow-2xs"
          >
            {POSE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
              const catPoses = POSE_EXPRESSION_OPTIONS.filter((p) => getCategory(p.id) === cat.id && p.id !== 'skip');
              if (catPoses.length === 0) return null;

              return (
                <optgroup
                  key={cat.id}
                  label={cleanEmoji(isMyanmar ? cat.labelMm : cat.labelEn)}
                  className="bg-[#161c2a] text-emerald-400 font-bold"
                >
                  {catPoses.map((pose) => (
                    <option
                      key={pose.id}
                      value={pose.id}
                      className="bg-[#161c2a] text-white py-1"
                    >
                      {cleanEmoji(isMyanmar ? pose.labelMm : pose.labelEn)}
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

      {/* Custom Pose Details Input */}
      <div>
        <input
          type="text"
          placeholder={
            isMyanmar
              ? 'အခြား ဟန်ပန်/အမူအရာ အသေးစိတ် ရေးပါ (ဥပမာ- စာအုပ်ဖတ်နေဟန်၊ လက်ဝါးချင်းယှက်ထားဟန်)...'
              : 'Custom pose details (e.g. reading a book, hands folded)...'
          }
          value={selection.customPoseDetails || ''}
          onChange={(e) => onUpdateSelection({ customPoseDetails: e.target.value })}
          className="w-full rounded-lg bg-[#161c2a] border border-zinc-800 hover:border-emerald-500/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none transition-all shadow-2xs"
        />
      </div>

    </div>
  );
};
