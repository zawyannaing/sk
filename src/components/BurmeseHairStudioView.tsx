import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { HAIR_TEMPLATES, HAIR_CATEGORIES, HairTemplate } from '../data/hairStudioData';
import { 
  Scissors, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  X, 
  RefreshCw, 
  Palette,
  Lock
} from 'lucide-react';

interface BurmeseHairStudioViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
    }
  ) => void;
  engine?: string;
}

const COLOR_TINT_OPTIONS = [
  { id: 'original', nameEn: 'Natural / Match Original', nameMm: 'မူရင်းသဘာဝအတိုင်း', color: '#1c1917', prompt: 'natural authentic hair sheen matching reference' },
  { id: 'obsidian-black', nameEn: 'Glossy Obsidian Black', nameMm: 'နက်မှောင်ပြောင်လက်သော ကတ္တီပါနက်', color: '#09090b', prompt: 'lustrous deep obsidian jet-black hair with healthy silk highlights' },
  { id: 'espresso-brown', nameEn: 'Dark Espresso Brown', nameMm: 'နက်မှောင်သော ကော်ဖီညို', color: '#271b12', prompt: 'rich multi-dimensional dark espresso chocolate brown tone' },
  { id: 'mocha-ash', nameEn: 'Soft Mocha Ash Brown', nameMm: 'ခေတ်မီ မိုခါပြာညိုရောင်', color: '#4a3f35', prompt: 'refined muted soft mocha ash brown tint with cool undertones' },
  { id: 'honey-caramel', nameEn: 'Warm Honey Caramel', nameMm: 'ပျားရည် ကာရာမယ်ညိုရွှေရောင်', color: '#854d0e', prompt: 'warm sunlit honey caramel amber highlights woven through hair' },
  { id: 'burgundy-wine', nameEn: 'Deep Burgundy Wine', nameMm: 'ရင့်မှည့်သော ဝိုင်နီရောင်', color: '#4c0519', prompt: 'sophisticated subtle deep wine burgundy plum undertones' }
];

export const BurmeseHairStudioView: React.FC<BurmeseHairStudioViewProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  onSendToPhotoStudio,
  engine = 'Midjourney'
}) => {
  const isMm = language === 'my';

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<'all' | 'female' | 'male'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 100% Face Lock directive toggle (Defaults to TRUE)
  const [faceLockEnabled, setFaceLockEnabled] = useState<boolean>(true);

  // Hair color tint
  const [selectedTint, setSelectedTint] = useState<string>('original');

  // Expanded prompt preview
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live generation modal state
  const [activeTemplate, setActiveTemplate] = useState<HairTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedProvider, setGeneratedProvider] = useState<string | null>(null);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return HAIR_TEMPLATES.filter(tpl => {
      const matchCat = selectedCategory === 'All' || tpl.category === selectedCategory;
      const matchGender = selectedGender === 'all' || tpl.gender === selectedGender || tpl.gender === 'unisex';
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        tpl.titleEn.toLowerCase().includes(q) ||
        tpl.titleMm.includes(q) ||
        tpl.hairDescriptionEn.toLowerCase().includes(q) ||
        tpl.hairDescriptionMm.includes(q);
      return matchCat && matchGender && matchSearch;
    });
  }, [selectedCategory, selectedGender, searchQuery]);

  // Build the strict face-preservation prompt
  const buildFinalPrompt = (template: HairTemplate) => {
    const tintObj = COLOR_TINT_OPTIONS.find(t => t.id === selectedTint);
    const tintDirective = tintObj && tintObj.id !== 'original' 
      ? `Hair color & tint: ${tintObj.prompt}. ` 
      : '';

    let prompt = template.hairPromptSnippet;

    if (faceLockEnabled) {
      const faceLockDirective = 
        `CRITICAL 100% BIOLOGICAL FACIAL IDENTITY LOCK (ZERO FACE MODIFICATION): ` +
        `Preserve 100% exact facial likeness, exact same person, identical eyes, identical eyelids, biological iris color, identical nose bridge and nostril geometry, identical lip fullness and cupid's bow, identical jawline, cheekbones, and real human skin micro-pores from the uploaded reference portrait. ` +
        `DO NOT ALTER, BLEND, DISTORT, OR STYLIZE THE FACE. The person must remain 100% recognizably their real biological self. ` +
        `HAIR-ONLY TRANSFORMATION: RESTYLE ONLY THE HAIRSTYLE TO: ${template.hairPromptSnippet}. ` +
        tintDirective +
        `Seamless hairline integration with natural vellus baby hairs, authentic strand physics, natural hair density and volume, photorealistic 8k detail. ` +
        `NEGATIVE PROMPT: different face, altered facial features, synthetic face swap, plastic doll skin, modified eyes, distorted mouth, changed bone structure.`;

      prompt = faceLockDirective;
    } else {
      prompt = `${template.hairPromptSnippet}. ${tintDirective}`.trim();
    }

    return prompt;
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = (template: HairTemplate) => {
    const full = buildFinalPrompt(template);
    navigator.clipboard.writeText(full);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Transfer to Photo Prompt Studio
  const handleTransferToStudio = (template: HairTemplate) => {
    const full = buildFinalPrompt(template);

    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(full, {
        ratio: '4:5',
        chosenOptions: [
          { label: 'Hairstyle', value: template.titleEn, emoji: '💇' },
          { label: 'Category', value: template.category, emoji: '✨' },
          ...(selectedTint !== 'original' ? [{ label: 'Hair Color', value: COLOR_TINT_OPTIONS.find(t => t.id === selectedTint)?.nameEn || selectedTint, emoji: '🎨' }] : [])
        ]
      });
    } else if (onSendToMatrix) {
      onSendToMatrix(full);
    }
  };

  // Direct generation modal
  const handleDirectGenerate = async (template: HairTemplate) => {
    setActiveTemplate(template);
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImageUrl(null);

    const fullPrompt = buildFinalPrompt(template);

    try {
      const res = await fetch('/api/photo-studio/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'nano-banana-2',
          aspectRatio: '4:5',
          count: 1
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Hairstyle generation failed');
      }

      const img = data.imageUrl || data.images?.[0];
      if (img) {
        setGeneratedImageUrl(img);
        setGeneratedProvider(data.provider || 'Nano Banana 2 (OpenRouter Pro)');
      } else {
        throw new Error('No image was returned from the server.');
      }
    } catch (err: any) {
      setGenerationError(err?.message || 'Generation failed. Check your API key and connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0d14] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ========================================================================= */}
      {/* 1. STUDIO HEADER */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-amber-950/25 border border-purple-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              <span>Burmese & Modern Hairstyle Transformation Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              {isMm ? 'ဆံပင်ပုံစံ ပြောင်းလဲခြင်း စတူဒီယို' : 'Hairstyle Transformation Studio'}
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                100% Face Preserved
              </span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {isMm
                ? 'မန္တလေးနန်းတွင်း စံပယ်တင်ဆံထုံး၊ ကုန်းဘောင်တော်ဝင်ဆံထုံး၊ ကိုရီးယားလှိုင်းတွန့်၊ ဖြောင့်စင်းသော ပိုးသားဆံကေသာ၊ စတိုင်လ်ကျ ဆံတိုဘော့နှင့် အမျိုးသားဆံပင်ပုံစံ ၃၃ မျိုး။ Photo Prompt Studio တွင် မိမိဓာတ်ပုံတင်၍ မူရင်းမျက်နှာ ၁၀၀% မပြောင်းလဲစေဘဲ ဆံပင်ပုံစံသာ အသစ်ပြောင်းလဲနိုင်ပါသည်။'
                : '33+ Engineered Hairstyle Templates (Royal Burmese Sadon, Korean S-Waves, Sleek Glass Straight, French Bobs, Elegant Updos, and Mens Cuts). Restyle only the hair while locking the original face 100%.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center min-w-[95px]">
              <div className="text-xl font-extrabold text-purple-400">33</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Hairstyles</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 text-center min-w-[95px] bg-emerald-950/20">
              <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" /> 100%
              </div>
              <div className="text-[10px] font-mono text-emerald-300 uppercase">Face Lock</div>
            </div>
          </div>
        </div>

        {/* 100% Face Lock System Status & Toggle */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {isMm ? '၁၀၀% မူရင်းမျက်နှာ ထိန်းသိမ်းခြင်း စနစ် (Face Unchanged)' : '100% Strict Face Lock System'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={faceLockEnabled}
              onChange={e => setFaceLockEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500"
            />
            <span>{isMm ? 'မျက်နှာသွင်ပြင် ၁၀၀% မပြောင်းစေရန် ကာကွယ်မှု ဖွင့်ထားသည်' : 'Enforce 100% Zero-Distortion Face Lock'}</span>
          </label>
        </div>

        {/* Color Tint Selector */}
        <div className="pt-3 border-t border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>{isMm ? 'ဆံပင်အရောင် ရွေးချယ်မှု (Hair Color Tint):' : 'Hair Color Tint:'}</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {COLOR_TINT_OPTIONS.map(tint => {
              const isSelected = selectedTint === tint.id;
              return (
                <button
                  key={tint.id}
                  type="button"
                  onClick={() => setSelectedTint(tint.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: tint.color }}
                  />
                  <span>{isMm ? tint.nameMm : tint.nameEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY TABS & SEARCH / GENDER FILTERS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {HAIR_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              const count = cat === 'All' 
                ? HAIR_TEMPLATES.length 
                : HAIR_TEMPLATES.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Gender Filter & Search */}
          <div className="flex items-center gap-3 self-end lg:self-center w-full lg:w-auto">
            {/* Gender Toggle */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setSelectedGender('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedGender === 'all' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender('female')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedGender === 'female' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Women
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender('male')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedGender === 'male' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Men
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder={isMm ? 'ဆံပင်ပုံစံ ရှာဖွေပါ...' : 'Search hairstyle...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-zinc-400 flex items-center justify-between px-1">
          <span>
            {isMm
              ? `တွေ့ရှိသော Template များ: ${filteredTemplates.length} ခု`
              : `Showing ${filteredTemplates.length} hairstyle templates`}
          </span>
          <span className="text-[11px] text-zinc-500">
            {faceLockEnabled ? '🔒 100% Face Lock Protection Active' : '🔓 Face Lock Off'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PHOTO-FREE STUDIO TEMPLATES GRID (33 CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const isCopied = copiedId === template.id;
          const isExpanded = expandedId === template.id;

          return (
            <div
              key={template.id}
              className="rounded-3xl bg-zinc-900/90 border border-zinc-800/80 hover:border-purple-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-200 group"
            >
              {/* Card Header (Clean Photo-Free Studio Card) */}
              <div className="p-5 pb-3 border-b border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-[10px] font-mono text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                      {template.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60 uppercase">
                      {template.gender}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ID: {template.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                    {template.titleEn}
                  </h3>
                  <p className="text-xs text-purple-400 font-medium mt-0.5">
                    {template.titleMm}
                  </p>
                </div>
              </div>

              {/* Template Attributes & Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-16">Length:</span>
                    <span className="text-zinc-300 leading-relaxed font-medium">{template.length}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-16">Texture:</span>
                    <span className="text-zinc-300 leading-relaxed font-medium">{template.texture}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-16">Details:</span>
                    <span className="text-zinc-400 leading-relaxed">
                      {isMm ? template.hairDescriptionMm : template.hairDescriptionEn}
                    </span>
                  </div>

                  {/* Available Color Tints */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-16">Tints:</span>
                    <div className="flex flex-wrap gap-1">
                      {template.colorTints.map((c, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prompt Snippet Box */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      {isExpanded ? (isMm ? 'Prompt ဝှက်မည်' : 'Hide Prompt') : (isMm ? 'Prompt အပြည့်ကြည့်မည်' : 'View Master Prompt')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(template)}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed break-words space-y-1.5">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        🔒 100% Face Preserved Directive Active
                      </div>
                      <p className="max-h-40 overflow-y-auto scrollbar-thin">
                        {buildFinalPrompt(template)}
                      </p>
                    </div>
                  )}

                  {/* Actions: Generate or Send to Photo Studio */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDirectGenerate(template)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isMm ? 'ချက်ချင်း ထုတ်မည်' : 'Generate Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTransferToStudio(template)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isMm ? 'Photo Studio သို့' : 'To Studio'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. INSTANT PREVIEW GENERATION MODAL */}
      {/* ========================================================================= */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setActiveTemplate(null);
                setGeneratedImageUrl(null);
                setGenerationError(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] uppercase">
                <Scissors className="w-3 h-3" />
                <span>AI Hairstyle Studio (100% Face Lock)</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeTemplate.titleMm}
              </h3>
              <p className="text-xs text-zinc-400">{activeTemplate.titleEn}</p>
            </div>

            {/* Generated Image Result Box */}
            <div className="aspect-[4/5] max-h-[380px] w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center relative">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-sm font-semibold text-zinc-200">
                    {isMm ? 'AI ဆံပင်ပုံစံ သစ် ဖန်တီးနေပါသည်...' : 'Synthesizing Hairstyle with 100% Face Lock...'}
                  </p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    {isMm ? 'မျက်နှာသွင်ပြင်ကို ထိန်းသိမ်းပြီး ဆံပင်ပုံစံသစ်ကို တွက်ချက်နေပါသည်' : 'Preserving facial bone structure while restyling hair follicles'}
                  </p>
                </div>
              ) : generatedImageUrl ? (
                <div className="relative w-full h-full group">
                  <img
                    src={generatedImageUrl}
                    alt="Hairstyle Preview"
                    className="w-full h-full object-cover"
                  />
                  <a
                    href={generatedImageUrl}
                    download="hairstyle-render.png"
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ) : generationError ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-red-400 font-medium">{generationError}</p>
                  <button
                    type="button"
                    onClick={() => handleDirectGenerate(activeTemplate)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-white"
                  >
                    Retry Render
                  </button>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-zinc-400">
                {generatedProvider && (
                  <span>Engine: <strong className="text-purple-300">{generatedProvider}</strong></span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleTransferToStudio(activeTemplate);
                    setActiveTemplate(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20"
                >
                  {isMm ? 'Photo Studio တွင် အပြီးသတ် ပြင်ဆင်ရန်' : 'Open in Photo Studio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
