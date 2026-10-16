import React, { useState, useMemo } from 'react';
import { AppMode, Language, PresetTemplate } from '../types';
import { PRESET_TEMPLATES } from '../data/presetData';
import { Sparkles, Flame, Search, X, Copy, Check, Eye, Wand2, Layers } from 'lucide-react';
import { buildComprehensiveMasterPrompt } from '../utils/promptBuilder';

interface PresetGalleryProps {
  language: Language;
  onSelectPreset: (preset: PresetTemplate) => void;
  activePresetId?: string;
  onApplyAndClose?: () => void;
}

const getModeBadge = (mode: AppMode) => {
  switch (mode) {
    case 'txt2img':
      return { mm: '၄ ကတ် Prompt', en: '4-Box Prompt', tag: 'PROMPT', color: 'border-cyan-500/60 text-cyan-300' };
    default:
      return { mm: 'ဖန်တီးမှု', en: 'Preset', tag: 'PROMPT', color: 'border-slate-700 text-slate-300' };
  }
};

export const PresetGallery: React.FC<PresetGalleryProps> = ({
  language,
  onSelectPreset,
  activePresetId,
  onApplyAndClose
}) => {
  const isMyanmar = language === 'my';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'traditional' | 'festival' | 'fashion' | 'cinematic'>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Track the currently inspected/picked template for ready-made prompt viewing
  const [inspectedPresetId, setInspectedPresetId] = useState<string | null>(
    activePresetId || PRESET_TEMPLATES[0]?.id || null
  );

  const filteredTemplates = useMemo(() => {
    let list = PRESET_TEMPLATES;

    if (activeCategory === 'traditional') {
      list = list.filter(t => t.id.includes('royal') || t.id.includes('silk') || t.id.includes('weaver') || t.id.includes('shan') || t.id.includes('kachin') || t.id.includes('chin') || t.id.includes('mon') || t.id.includes('rakhine') || t.id.includes('thanaka') || t.id.includes('pao'));
    } else if (activeCategory === 'festival') {
      list = list.filter(t => t.id.includes('thingyan') || t.id.includes('thadingyut') || t.id.includes('balloon') || t.id.includes('wedding') || t.id.includes('dance') || t.id.includes('manao'));
    } else if (activeCategory === 'fashion') {
      list = list.filter(t => t.id.includes('vogue') || t.id.includes('cyber') || t.id.includes('taikpong') || t.id.includes('retro') || t.id.includes('cafe'));
    } else if (activeCategory === 'cinematic') {
      list = list.filter(t => t.id.includes('bagan') || t.id.includes('ngapali') || t.id.includes('kalaw') || t.id.includes('popa') || t.id.includes('mingun') || t.id.includes('mandalay') || t.id.includes('hasselblad') || t.id.includes('sand'));
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(t => 
      t.titleEn.toLowerCase().includes(q) ||
      t.titleMm.toLowerCase().includes(q) ||
      (t.selection.subject && t.selection.subject.toLowerCase().includes(q)) ||
      (t.selection.location && t.selection.location.toLowerCase().includes(q)) ||
      (t.selection.event && t.selection.event.toLowerCase().includes(q))
    );
  }, [searchQuery, activeCategory]);

  const inspectedPreset = useMemo(() => {
    if (!inspectedPresetId) return null;
    return PRESET_TEMPLATES.find(p => p.id === inspectedPresetId) || null;
  }, [inspectedPresetId]);

  const inspectedPrompt = useMemo(() => {
    if (!inspectedPreset) return null;
    try {
      return buildComprehensiveMasterPrompt(inspectedPreset.selection, language);
    } catch {
      return null;
    }
  }, [inspectedPreset, language]);

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleTemplateClick = (preset: PresetTemplate) => {
    if (inspectedPresetId === preset.id && activePresetId === preset.id) {
      // Second click: cancel / deselect choice
      setInspectedPresetId(null);
      return;
    }
    setInspectedPresetId(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className="space-y-3.5">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
            <span>{isMyanmar ? 'လူကြိုက်များသော ရေပန်းစား Preset များ' : 'Featured 30 Studio Prompt Templates'}</span>
            <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
              30 Templates (4 Boxes)
            </span>
          </h3>
        </div>

        {/* Quick Search in Presets */}
        <div className="relative w-full sm:w-56">
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs focus-within:border-cyan-500">
            <Search className="h-3.5 w-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMyanmar ? 'Template ရှာရန် (ဥပမာ- ပုဂံ, သင်္ကြန်)...' : 'Search 30 templates...'}
              className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
        {[
          { id: 'all', labelMm: 'အားလုံး (၃၀)', labelEn: 'All (30)' },
          { id: 'traditional', labelMm: 'ရိုးရာနန်းတွင်း/တိုင်းရင်းသား', labelEn: 'Royal & Ethnic' },
          { id: 'festival', labelMm: 'ပွဲတော်/မင်္ဂလာဆောင်', labelEn: 'Festivals & Wedding' },
          { id: 'fashion', labelMm: 'ခေတ်ပေါ်/ဆိုက်ဘာ/ဖက်ရှင်', labelEn: 'Modern & Cyber' },
          { id: 'cinematic', labelMm: 'ရုပ်ရှင်ဆန်/ရှုခင်း/စတူဒီယို', labelEn: 'Cinematic & Scenery' }
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {isMyanmar ? cat.labelMm : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Grid of Templates (Scrollable max-h for pleasant navigation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar p-1">
        {filteredTemplates.map((preset) => {
          const isSelected = activePresetId === preset.id || inspectedPresetId === preset.id;
          const badge = getModeBadge(preset.mode);

          return (
            <div
              key={preset.id}
              onClick={() => handleTemplateClick(preset)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/60 scale-[1.02] bg-slate-900'
                  : 'border-slate-800 hover:border-cyan-500/60 bg-slate-950/80 hover:scale-[1.02]'
              }`}
            >
              <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                <img
                  src={preset.previewUrl}
                  alt={preset.titleEn}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                <span className="absolute top-2 left-2 text-lg drop-shadow-md">
                  {preset.emoji}
                </span>

                {/* Overlaid Mode Label Badge */}
                <div className={`absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-black tracking-tight border shadow-md backdrop-blur-md ${badge.color}`}>
                  <span>{isMyanmar ? badge.mm : badge.en}</span>
                </div>
              </div>

              <div className="p-2.5 space-y-1 bg-black/60 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {isMyanmar ? preset.titleMm : preset.titleEn}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {isMyanmar ? preset.titleEn : preset.titleMm}
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-cyan-400/90 font-mono">
                    <Eye className="h-2.5 w-2.5 text-cyan-400" />
                    <span>{isMyanmar ? 'Prompt ကြည့်မည်' : 'View Prompt'}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 text-[9px]">
                      <Check className="h-2.5 w-2.5" />
                      <span>{isMyanmar ? 'ရွေးထား' : 'Active'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 READY-MADE PROMPT PREVIEW SECTION (When user picks a template) */}
      {inspectedPreset && inspectedPrompt && (
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/50 p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-3">
              <img
                src={inspectedPreset.previewUrl}
                alt={inspectedPreset.titleEn}
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-xl object-cover border border-cyan-400/60 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{inspectedPreset.emoji}</span>
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    {isMyanmar ? inspectedPreset.titleMm : inspectedPreset.titleEn}
                  </h4>
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                    Ready-Made Prompt
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  {isMyanmar ? 'ဤ Template အတွက် အသင့်ရေးဆွဲပြီး Master Prompt ဖြစ်ပါသည်' : 'Ready-made master prompt fully assembled for this template'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyPrompt(inspectedPrompt.masterPrompt, inspectedPreset.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm"
              >
                {copiedPromptId === inspectedPreset.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{isMyanmar ? 'ကူးယူပြီးပါပြီ' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{isMyanmar ? 'Copy Prompt' : 'Copy Prompt'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectPreset(inspectedPreset);
                  if (onApplyAndClose) onApplyAndClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black font-black text-xs transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isMyanmar ? '၄ ကတ် ဖြည့်ပြီး သုံးမည်' : 'Load into 4 Boxes'}</span>
              </button>
            </div>
          </div>

          {/* Full Ready-Made Prompt Text */}
          <div className="rounded-xl bg-black/90 border border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                READY-MADE STUDIO MASTER PROMPT
              </span>
              <span className="text-slate-400">
                Aspect Ratio: <strong className="text-white">{inspectedPreset.selection.aspectRatio || '9:16'}</strong>
              </span>
            </div>
            <div className="text-xs sm:text-[13px] text-slate-200 font-sans leading-relaxed max-h-28 overflow-y-auto custom-scrollbar select-text pr-1">
              {inspectedPrompt.masterPrompt}
            </div>
          </div>

          {/* 4-Box Configuration Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-0.5">
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800/80">
              <span className="text-cyan-400 font-bold block mb-0.5">Box 1: Subject</span>
              <span className="text-slate-300 line-clamp-1">
                {inspectedPreset.selection.subject} · {inspectedPreset.selection.ethnicity || 'Burmese'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800/80">
              <span className="text-amber-400 font-bold block mb-0.5">Box 2: Wardrobe</span>
              <span className="text-slate-300 line-clamp-1">
                {inspectedPreset.selection.garmentStyle || 'Silk Longyi'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800/80">
              <span className="text-teal-400 font-bold block mb-0.5">Box 3: Scene</span>
              <span className="text-slate-300 line-clamp-1">
                {inspectedPreset.selection.location || 'Yangon'} · {inspectedPreset.selection.event || 'Thingyan'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-slate-800/80">
              <span className="text-indigo-400 font-bold block mb-0.5">Box 4: Camera</span>
              <span className="text-slate-300 line-clamp-1">
                {inspectedPreset.selection.camera || 'Sony A7R V'} · {inspectedPreset.selection.qualityProfile || '8K UHD'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

