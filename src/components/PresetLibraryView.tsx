import React, { useState } from 'react';
import { Language } from '../types';
import { ScrollReveal } from './ScrollReveal';
import { Sparkles, Crown, Sun, Feather, Copy, Check, SlidersHorizontal } from 'lucide-react';

interface PresetLibraryViewProps {
  language: Language;
  onSelectPreset: (presetText: string) => void;
}

export const PresetLibraryView: React.FC<PresetLibraryViewProps> = ({
  language,
  onSelectPreset
}) => {
  const isMyanmar = language === 'my';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const PRESETS = [
    {
      id: 'bagan-princess',
      category: 'royal',
      titleEn: 'Bagan Court Silk Princess',
      titleMm: 'ပုဂံခေတ် နန်းတွင်း မင်းသမီး',
      era: 'Bagan Kingdom (11th c.)',
      ratio: '4:5',
      tokens: 154,
      prompt: 'Commercial studio master photography of an authentic Bagan Royal Court Noblewoman, gentle honey-olive skin with circular Thanaka paste patterns on cheekbones with visible powdery bark grain, delicate human skin micro-pores and subsurface scattering, adorned in Bagan Silk Yinzi Htamein with flowing side train and golden sash, embellished with Shwe Chi Hto (ရွှေချည်ထိုး), Royal court Sadon high coiled crown bun ornamented with fresh fragrant Jasmine garlands and Mogok ruby earplugs, direct soulful gaze with sharp octagonal softbox catchlights, illuminated by Profoto 3-foot Octabox at 45 degrees, Hasselblad X2D 100C with 90mm f/2.5 lens, authentic ground contact shadow on studio floor, Kodak Portra 400 color grading --ar 4:5 --style raw --v 6.1'
    },
    {
      id: 'mandalay-bride',
      category: 'royal',
      titleEn: 'Mandalay Royal Wedding Bride',
      titleMm: 'မန္တလေး ရတနာပုံ နန်းတွင်း မင်္ဂလာ သတို့သမီး',
      era: 'Konbaung Dynasty (19th c.)',
      ratio: '4:5',
      tokens: 168,
      prompt: 'High-end Vogue editorial studio portrait of a regal Mandalay Dynasty Bride, warm olive skin with authentic micro-pores and delicate Thanaka motifs, wearing royal gold-embroidered crimson velvet Yadanabon court dress with sweeping train and heavy handwoven Luntaya Acheik silk Longyi, multi-tier gold filigree Salwe necklace, Sadon hair coiffure with white Jasmine cascade, shot on Leica Summilux 50mm f/1.4 lens, warm amber rim lighting separating hair from neutral studio cyclorama, authentic 8K photographic fidelity --ar 4:5 --style raw --v 6.1'
    },
    {
      id: 'thingyan-queen',
      category: 'festival',
      titleEn: 'Thingyan Water Festival Spirit',
      titleMm: 'သင်္ကြန် ရေကစားပွဲတော် မေပျိုဖြူ',
      era: 'Contemporary Heritage',
      ratio: '4:5',
      tokens: 145,
      prompt: 'Authentic documentary studio portrait of a joyful young Burmese maiden during Thingyan Water Festival in Yangon, radiant honey skin with fresh circular Thanaka paste showing natural bark texture and micro-pores, wearing vivid yellow Padauk floral silk Longyi, natural droplets of glistening water on skin, holding an engraved silver brass water bowl, laughing candidly with natural eye crinkle, bright studio key lighting with soft fill, Sony A7R V with 85mm f/1.2 GM lens, true photographic depth of field --ar 4:5 --style raw --v 6.1'
    },
    {
      id: 'inle-fisherman',
      category: 'monastic',
      titleEn: 'Inle Lake Conical Master',
      titleMm: 'အင်းလေးကန် ခြေတစ်ဖက်လှော် တံငါသည်',
      era: 'Shan State Heritage',
      ratio: '4:5',
      tokens: 138,
      prompt: 'National Geographic ethnographic master portrait of an authentic Intha elder from Inle Lake, weather-beaten wise golden skin with authentic micro-wrinkles and natural pores, wearing indigo hand-spun Shan cotton attire and folded headscarf, piercing soulful dark brown eyes with soft natural catchlights, atmospheric soft dawn light, Hasselblad X2D 100C with 100mm f/1.4 lens, authentic documentary realism --ar 4:5 --style raw --v 6.1'
    },
    {
      id: 'shwedagon-monk',
      category: 'monastic',
      titleEn: 'Shwedagon Serene Devotee',
      titleMm: 'ရွှေတိဂုံ ညချမ်း ဘုရားဖူး ငြိမ်းချမ်းမှု',
      era: 'Sacred Architecture',
      ratio: '4:5',
      tokens: 150,
      prompt: 'Atmospheric cinematic portrait of a serene Burmese Buddhist devotee in pure white Taikpon jacket praying in quiet meditation on Shwedagon Pagoda marble terrace, warm candlelight flicker illuminating face, authentic skin subsurface scattering, deep saffron and gold ambient glow, Hasselblad 100mm f/1.4 lens, 8k resolution, authentic optical bokeh --ar 4:5 --style raw --v 6.1'
    },
    {
      id: 'colonial-heritage',
      category: 'vintage',
      titleEn: '1930s Rangoon Retro Gentleman',
      titleMm: '၁၉၃၀ ပြည့်လွန် ရန်ကုန် ကိုလိုနီခေတ် လူကြီးလူကောင်း',
      era: 'Colonial Rangoon (1930s)',
      ratio: '2:3',
      tokens: 160,
      prompt: '1930s vintage studio documentary portrait of an intellectual Burmese gentleman, tailored raw silk Taikpon, folded silk Gaung Baung turban, natural skin micro-pores and authentic facial warmth, holding an antique teakwood cane, soft studio cyclorama background blur, analog Kodak Portra film grain, rich sepia and muted emerald tones --ar 2:3 --style raw --v 6.1'
    }
  ];

  const filteredPresets = activeCategory === 'all'
    ? PRESETS
    : PRESETS.filter(p => p.category === activeCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'royal':
        return <Crown className="w-4 h-4 text-emerald-400" />;
      case 'festival':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'monastic':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'vintage':
      default:
        return <Feather className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 lg:px-10 py-6 gap-6">
      
      {/* Header Bar */}
      <ScrollReveal direction="down" duration={0.5}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl text-white font-bold tracking-tight">
              Curated Burmese Preset Library
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-400 mt-0.5">
              {isMyanmar
                ? 'အဆင့်မြင့် ဓာတ်ပုံ Prompt နမူနာများအား ကလစ်တစ်ချက်ဖြင့် ရွေးချယ် အသုံးပြုနိုင်ပါသည်'
                : 'Verified high-fidelity cultural prompt archetypes ready for direct synthesis.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0f1420] p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'all', label: 'All Presets' },
              { id: 'royal', label: 'Royal Court' },
              { id: 'festival', label: 'Festivals' },
              { id: 'monastic', label: 'Sacred & Folk' },
              { id: 'vintage', label: 'Vintage 1930s' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-black font-extrabold shadow-xs'
                    : 'text-zinc-400 hover:bg-[#141b2a] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Preset Cards Grid (Photo Removed for Clean Pro Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {filteredPresets.map((preset, idx) => (
          <ScrollReveal key={preset.id} delay={idx * 0.08} className="h-full">
            <div className="bg-[#0f1420] rounded-2xl border border-zinc-800 shadow-xs hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20 transition-all flex flex-col justify-between h-full group p-5">
              <div className="flex flex-col gap-3">
                {/* Top Badge Strip (Era, Category Icon & Ratio) */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#141b2a] border border-zinc-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(preset.category)}
                    </div>
                    <span className="font-sans text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      {preset.era}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#141b2a] border border-zinc-700 text-emerald-300 shadow-xs">
                    --ar {preset.ratio}
                  </span>
                </div>

                {/* Title & Tokens */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-sans text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {preset.titleEn}
                    </h3>
                    <span className="font-sans text-xs text-zinc-400 font-medium">
                      {preset.titleMm}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] text-zinc-300 font-mono font-bold bg-[#141b2a] border border-zinc-700 px-2 py-0.5 rounded-md shrink-0">
                    {preset.tokens} tokens
                  </span>
                </div>

                {/* Clean Prompt Preview Box */}
                <div className="p-3 bg-[#111622] rounded-xl border border-zinc-800/80 font-mono text-[11px] text-zinc-300 line-clamp-4 select-all leading-relaxed hover:border-zinc-700 transition-colors">
                  {preset.prompt}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(preset.id, preset.prompt)}
                  className="py-2 px-3 rounded-xl bg-[#141b2a] hover:bg-[#1a2234] text-zinc-200 border border-zinc-800 font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === preset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectPreset(preset.prompt)}
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                  <span>Load Matrix</span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

