import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { FABRIC_SWATCHES, JEWELRY_SWATCHES, VisualSwatch } from '../data/fabricJewelryData';
import { 
  Sparkles, 
  Gem, 
  Layers, 
  Check, 
  Copy, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Compass, 
  Wand2, 
  Eye 
} from 'lucide-react';

interface FabricJewelrySwatchesViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      chosenOptions?: { label: string; value: string }[];
    }
  ) => void;
}

export const FabricJewelrySwatchesView: React.FC<FabricJewelrySwatchesViewProps> = ({
  language,
  onSendToMatrix,
  onSendToPhotoStudio
}) => {
  const isMm = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fabric' | 'gemstone' | 'precious-metal'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'luntaya-acheik-emerald',
    'mogok-pigeon-blood-ruby',
    'burmese-24k-repousse-gold'
  ]);
  const [copied, setCopied] = useState(false);

  const allSwatches = useMemo(() => [...FABRIC_SWATCHES, ...JEWELRY_SWATCHES], []);

  const filteredSwatches = useMemo(() => {
    if (selectedCategory === 'all') return allSwatches;
    return allSwatches.filter(s => s.category === selectedCategory);
  }, [allSwatches, selectedCategory]);

  const toggleSwatch = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Compile composite prompt from selected swatches
  const compositePrompt = useMemo(() => {
    const selected = allSwatches.filter(s => selectedIds.includes(s.id));
    if (selected.length === 0) {
      return 'Burmese traditional attire with authentic handwoven silk and heritage jewelry, cinematic studio lighting';
    }

    const tokens = selected.map(s => s.promptToken).join(', ');
    return `masterpiece royal portrait of an elegant Burmese subject, ${tokens}, natural Myanmar facial beauty with gentle expression, warm ambient lighting, 8k resolution, photorealistic Hasselblad texture`;
  }, [allSwatches, selectedIds]);

  const handleCopy = () => {
    navigator.clipboard.writeText(compositePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToStudio = () => {
    const selected = allSwatches.filter(s => selectedIds.includes(s.id));
    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(compositePrompt, {
        ratio: '4:5',
        chosenOptions: selected.map(s => ({
          label: s.category.toUpperCase(),
          value: s.nameMm
        }))
      });
    } else if (onSendToMatrix) {
      onSendToMatrix(compositePrompt);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Gem className="w-3.5 h-3.5 text-amber-400" />
              {isMm ? 'ရိုးရာ ပိုးချိတ် & မိုးကုတ်ကျောက်မျက် Swatches' : 'Interactive Fabric & Jewelry Visual Swatches'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMm ? 'အမရပူရ လွန်းရာကျော် & မိုးကုတ် ပတ္တမြားကျောက်မျက်များ' : 'Imperial Luntaya Silks, Lotus Thread & Mogok Gems'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {isMm
                ? 'အမရပူရ လွန်းတစ်ရာ ချိတ်ထည်၊ မန္တလေး ရွှေချည်ထိုး၊ အင်းလေး ကြာသင်္ကန်းပိုး၊ မိုးကုတ် ခိုသွေးပတ္တမြား၊ ဖားကန့် ကျောက်စိမ်း နှင့် မြန်မာ့ ၂၄ ပဲရည် ရွှေပန်းထိမ် လက်ရာများကို ရွေးချယ်ပြီး Visual Texture စစ်စစ်များအဖြစ် ပေါင်းစပ်ဖန်တီးပါ။'
                : 'Mix and match authentic Myanmar weaves and Mogok gemstones. Instantly injects photorealistic micro-textures into your AI generation pipeline.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
              <div className="text-xl font-bold text-amber-400">{selectedIds.length}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{isMm ? 'ရွေးချယ်ထားသော အသွင်အပြင်' : 'Selected Layers'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', labelMm: 'အားလုံး (All Swatches)', labelEn: 'All Swatches' },
          { id: 'fabric', labelMm: 'ပိုးချိတ် & ရက်ကန်း (Silks & Weaves)', labelEn: 'Silks & Weaves' },
          { id: 'gemstone', labelMm: 'မိုးကုတ် ကျောက်မျက် (Mogok Gemstones)', labelEn: 'Gemstones' },
          { id: 'precious-metal', labelMm: 'မြန်မာ့ ရွှေပန်းထိမ် (24K Gold & Metals)', labelEn: 'Precious Metals' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === tab.id
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            {isMm ? tab.labelMm : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Grid of Visual Swatches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSwatches.map((swatch) => {
          const isSelected = selectedIds.includes(swatch.id);
          return (
            <div
              key={swatch.id}
              onClick={() => toggleSwatch(swatch.id)}
              className={`group relative flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-xl ${
                isSelected
                  ? 'bg-stone-900/90 border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
              }`}
            >
              <div className="space-y-4">
                {/* Visual Texture Simulation Tile */}
                <div
                  className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner flex items-end p-3"
                  style={{ background: swatch.gradientPreview }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                  
                  {/* Select Checkmark Pill */}
                  <div className={`relative z-10 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md ${
                    isSelected ? 'bg-amber-400 text-stone-950' : 'bg-black/60 text-white backdrop-blur-md'
                  }`}>
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {isMm ? 'ရွေးချယ်ပြီး' : 'Selected'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        {isMm ? 'ထည့်သွင်းရန် နှိပ်ပါ' : 'Select'}
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="font-medium text-amber-400">{isMm ? swatch.originMm : swatch.originEn}</span>
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] text-stone-300 font-mono">
                      {isMm ? swatch.rarityMm : swatch.rarityEn}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {isMm ? swatch.nameMm : swatch.nameEn}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">{swatch.nameEn}</p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-stone-800/60 text-xs text-stone-300 leading-relaxed">
                  {isMm ? swatch.tactileDescriptionMm : swatch.tactileDescriptionEn}
                </div>
              </div>

              {/* Prompt Token Preview */}
              <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] font-mono text-stone-400 line-clamp-2">
                &ldquo;{swatch.promptToken}&rdquo;
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Composite Prompt Dock */}
      <div className="sticky bottom-4 z-40 rounded-3xl border border-amber-500/40 bg-stone-950/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Wand2 className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {isMm ? 'ပေါင်းစပ်ထားသော Visual Texture Prompt' : 'Live Composite Swatch Prompt'}
              </h4>
              <p className="text-[11px] text-stone-400">
                {selectedIds.length} {isMm ? 'ခု ပေါင်းစပ်ထားပါသည်' : 'swatches active in composite prompt'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl text-xs text-stone-400 hover:text-rose-400 hover:bg-stone-900 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isMm ? 'အားလုံးရှင်းရန်' : 'Reset'}
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (isMm ? 'ကူးယူပြီး' : 'Copied') : (isMm ? 'Prompt ကူးယူရန်' : 'Copy')}
            </button>

            <button
              onClick={handleSendToStudio}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isMm ? 'Photo Studio သို့ ပို့မည်' : 'Send to Studio'}
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-black/60 border border-stone-800 font-mono text-xs text-stone-300 max-h-[85px] overflow-y-auto select-all leading-relaxed">
          {compositePrompt}
        </div>
      </div>
    </div>
  );
};
