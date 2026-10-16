import React, { useState } from 'react';
import { Language } from '../types';

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
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
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
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=85',
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
      img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=85',
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
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=85',
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
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=85',
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
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
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

  return (
    <div className="flex flex-col w-full px-6 sm:px-10 py-6 gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#d6c3b6]/30">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl text-[#704112] font-bold tracking-tight">
            Curated Burmese Preset Library
          </h1>
          <p className="font-sans text-sm text-[#51443a] mt-0.5">
            {isMyanmar
              ? 'အဆင့်မြင့် ဓာတ်ပုံ Prompt နမူနာများအား ကလစ်တစ်ချက်ဖြင့် ရွေးချယ် အသုံးပြုနိုင်ပါသည်'
              : 'Verified high-fidelity cultural prompt archetypes ready for direct synthesis.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#faf2ee] p-1 rounded-xl border border-[#d6c3b6]/40">
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
                  ? 'bg-[#704112] text-white shadow-xs'
                  : 'text-[#51443a] hover:bg-[#eee7e3] hover:text-[#1e1b19]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="bg-white rounded-xl overflow-hidden border border-[#d6c3b6]/40 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              {/* Card Image */}
              <div className="relative h-48 w-full overflow-hidden bg-[#faf2ee]">
                <img
                  src={preset.img}
                  alt={preset.titleEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="font-sans text-xs font-bold px-2 py-0.5 rounded bg-black/50 backdrop-blur-md">
                    {preset.era}
                  </span>
                  <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded bg-[#704112]">
                    --ar {preset.ratio}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-sans text-base font-bold text-[#1e1b19]">
                      {preset.titleEn}
                    </h3>
                    <span className="font-sans text-xs text-[#51443a]">
                      {preset.titleMm}
                    </span>
                  </div>
                  <span className="font-sans text-[11px] text-[#704112] font-mono font-bold bg-[#ffdcc2]/50 px-2 py-0.5 rounded">
                    {preset.tokens} tokens
                  </span>
                </div>

                <div className="p-2.5 bg-[#faf2ee] rounded-lg border border-[#d6c3b6]/30 font-mono text-[11px] text-[#51443a] line-clamp-3 select-all leading-relaxed">
                  {preset.prompt}
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopy(preset.id, preset.prompt)}
                className="py-2 px-3 rounded-lg bg-[#f4ece9] hover:bg-[#eee7e3] text-[#1e1b19] font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedId === preset.id ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectPreset(preset.prompt)}
                className="py-2 px-3 rounded-lg bg-[#704112] hover:bg-[#8c5828] text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Load Matrix</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
