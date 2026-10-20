import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { WEDDING_TEMPLATES, WEDDING_CATEGORIES, WeddingTemplate } from '../data/weddingStudioData';
import { 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  X, 
  RefreshCw 
} from 'lucide-react';

interface BurmeseWeddingStudioViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string }[];
    }
  ) => void;
  engine?: string;
}

export const BurmeseWeddingStudioView: React.FC<BurmeseWeddingStudioViewProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  onSendToPhotoStudio,
  engine = 'Midjourney'
}) => {
  const isMm = language === 'my';

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 100% Face Lock directive toggle
  const [faceLockEnabled, setFaceLockEnabled] = useState<boolean>(true);

  // Expanded prompt preview
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live generation modal state
  const [activeTemplate, setActiveTemplate] = useState<WeddingTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedProvider, setGeneratedProvider] = useState<string | null>(null);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return WEDDING_TEMPLATES.filter(tpl => {
      const matchCat = selectedCategory === 'All' || tpl.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        tpl.titleEn.toLowerCase().includes(q) ||
        tpl.titleMm.includes(q) ||
        tpl.setting.toLowerCase().includes(q) ||
        tpl.attire.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Build generation prompt with strict 100% Face Lock directive
  const buildFinalPrompt = (template: WeddingTemplate) => {
    let finalPrompt = template.promptSnippet;

    if (faceLockEnabled) {
      const faceLockDirective = 
        `CRITICAL 100% ZERO-DISTORTION FACE LOCK DIRECTIVE: ` +
        `Preserve 100% exact facial identity, biological bone structure, irises, eyelids, nose geometry, lip shape, and natural skin micro-texture. ` +
        `Do NOT alter, stylize, blend, or distort the person's real human facial features. ` +
        `The subject must remain 100% recognizable as their true biological self. ` +
        `Setting: ${template.setting}. ` +
        `Attire: ${template.attire}. ` +
        `Lighting: ${template.lighting}. `;

      finalPrompt = `${faceLockDirective} ${finalPrompt}`;
    }

    return finalPrompt;
  };

  // Copy prompt
  const handleCopyPrompt = (template: WeddingTemplate) => {
    const full = buildFinalPrompt(template);
    navigator.clipboard.writeText(full);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Send to Photo Prompt Studio
  const handleTransferToStudio = (template: WeddingTemplate) => {
    const full = buildFinalPrompt(template);

    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(full, {
        ratio: '4:5'
      });
    } else if (onSendToMatrix) {
      onSendToMatrix(full);
    }
  };

  // Direct Live Image Generation
  const handleDirectGenerate = async (template: WeddingTemplate) => {
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
        throw new Error(data?.error || 'Generation failed');
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
      <div className="rounded-3xl bg-gradient-to-r from-pink-950/30 via-zinc-900 to-amber-950/20 border border-pink-500/30 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono text-xs uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5" />
              <span>Burmese Wedding Studio Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMm ? 'မြန်မာ့ မင်္ဂလာဆောင် ဓာတ်ပုံ စတူဒီယို' : 'Burmese Wedding Photography Studio'}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {isMm
                ? 'နန်းတွင်း၊ ခန်းမကြီး၊ ပုဂံဆည်းဆာ၊ အင်းလေးရေပြင်နှင့် မဂ္ဂဇင်းကာဗာ မင်္ဂလာဆောင် Prompt Template ၆၂ ခု။ စိတ်ကြိုက် Template ကို ရွေးချယ်၍ မူရင်းရုပ် ၁၀၀% မပြောင်းလဲစေဘဲ အရည်အသွေးမြင့် မင်္ဂလာအမှတ်တရ ဓာတ်ပုံများကို ထုတ်ယူပါ။'
                : '62+ Master Wedding Templates featuring Royal Palace, Grand Ballroom, Bagan Stupa Sunsets, Inle Lake and Vogue Editorial with 100% Strict Face Lock.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center min-w-[90px]">
              <div className="text-xl font-extrabold text-pink-400">62</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Templates</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center min-w-[90px]">
              <div className="text-xl font-extrabold text-emerald-400">100%</div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Face Lock</div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 100% FACE LOCK SYSTEM STATUS */}
        {/* ========================================================================= */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {isMm ? '၁၀၀% မူရင်းမျက်နှာ ထိန်းသိမ်းခြင်း စနစ်' : '100% Strict Face Lock System'}
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
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY TABS & SEARCH BAR */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {WEDDING_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              const count = cat === 'All' ? WEDDING_TEMPLATES.length : WEDDING_TEMPLATES.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={isMm ? 'Template ရှာဖွေပါ...' : 'Search wedding template...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div className="text-xs text-zinc-400">
          {isMm ? `တွေ့ရှိသော Templates: ${filteredTemplates.length} ခု` : `Showing ${filteredTemplates.length} wedding templates`}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WEDDING TEMPLATES 60+ GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const isExpanded = expandedId === template.id;
          const isCopied = copiedId === template.id;

          return (
            <div
              key={template.id}
              className="rounded-3xl bg-zinc-900/90 border border-zinc-800/80 hover:border-pink-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-200 group"
            >
              {/* Card Header (Photo-Free Studio Prompt Card) */}
              <div className="p-5 pb-3 border-b border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/15 text-[10px] font-mono text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                    {template.category}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    ID: {template.id}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                    {template.titleEn}
                  </h3>
                  <p className="text-xs text-pink-400 font-medium mt-0.5">
                    {template.titleMm}
                  </p>
                </div>
              </div>

              {/* Template Metadata Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-14">Setting:</span>
                    <span className="text-zinc-300 leading-relaxed">{template.setting}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-14">Attire:</span>
                    <span className="text-zinc-300 leading-relaxed">{template.attire}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-zinc-300">
                    <span className="text-zinc-500 shrink-0 font-mono text-[10px] uppercase w-14">Lighting:</span>
                    <span className="text-zinc-400 leading-relaxed">{template.lighting}</span>
                  </div>
                </div>

                {/* Prompt Snippet Box */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : template.id)}
                      className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
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
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed break-words">
                      {buildFinalPrompt(template)}
                    </div>
                  )}

                  {/* Actions: Generate or Send to Studio */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDirectGenerate(template)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-500/20 cursor-pointer"
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
      {/* 5. LIVE DIRECT GENERATION MODAL */}
      {/* ========================================================================= */}
      {activeTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141e] border border-pink-500/30 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setActiveTemplate(null);
                setGeneratedImageUrl(null);
                setGenerationError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-pink-400">
                <Heart className="w-3.5 h-3.5" />
                <span>Wedding Generation Studio (Nano Banana 2 / OpenRouter)</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {activeTemplate.titleEn}
              </h2>
              <p className="text-xs text-zinc-400">{activeTemplate.titleMm}</p>
            </div>

            {/* Status & Display Area */}
            {isGenerating ? (
              <div className="aspect-[4/5] max-h-[460px] w-full rounded-2xl bg-zinc-950 flex flex-col items-center justify-center gap-3 border border-zinc-800">
                <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
                <div className="text-sm font-bold text-white">
                  {isMm ? '၁၀၀% မျက်နှာသွင်ပြင် ထိန်းသိမ်း၍ ဓာတ်ပုံ ထုတ်လုပ်နေပါသည်...' : 'Generating Wedding Photo with 100% Face Lock...'}
                </div>
                <div className="text-xs text-zinc-400 max-w-sm text-center px-4">
                  {isMm
                    ? 'နန်းတွင်းနှင့် ခန်းမကြီး အလင်းအမှောင်များကို သင့်မျက်နှာနှင့် အံဝင်ခွင်ကျ ဖြစ်အောင် Senior Graphic Designer စနစ်ဖြင့် ညှိယူနေပါသည်'
                    : 'Applying Senior Graphic Designer Master Compositing between subject and wedding backdrop'}
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4">
                <div className="aspect-[4/5] max-h-[460px] w-full rounded-2xl overflow-hidden bg-black border border-emerald-500/40 relative shadow-2xl">
                  <img src={generatedImageUrl} alt="Generated Wedding" className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    {generatedProvider || '100% Face Preserved'}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleDirectGenerate(activeTemplate)}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isMm ? 'ထပ်မံ ထုတ်မည်' : 'Regenerate'}</span>
                  </button>

                  <a
                    href={generatedImageUrl}
                    download={`wedding-${activeTemplate.id}-${Date.now()}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isMm ? 'ဒေါင်းလုဒ် ရယူမည်' : 'Download Photo'}</span>
                  </a>
                </div>
              </div>
            ) : generationError ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
                <div className="font-bold">{isMm ? 'ဓာတ်ပုံ ထုတ်လုပ်မှု မအောင်မြင်ပါ' : 'Generation Notice'}</div>
                <div>{generationError}</div>
                <button
                  type="button"
                  onClick={() => handleDirectGenerate(activeTemplate)}
                  className="mt-2 py-1.5 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold cursor-pointer"
                >
                  {isMm ? 'ပြန်လည်ကြိုးစားမည်' : 'Try Again'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
