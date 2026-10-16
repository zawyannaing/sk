import React, { useState, useMemo } from 'react';
import { Language } from '../types';

interface PromptUtilitySuiteProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

interface SecretKeywordCategory {
  title: string;
  icon: string;
  keywords: { label: string; snippet: string; desc: string }[];
}

const SECRET_KEYWORD_CATEGORIES: SecretKeywordCategory[] = [
  {
    title: 'Optics & Bokeh Separation',
    icon: 'camera_enhance',
    keywords: [
      { label: 'Catchlights in Irises', snippet: 'twin circular softbox catchlights reflecting in sharp pupils', desc: 'Adds lively depth to eyes' },
      { label: '85mm Planar Separation', snippet: '85mm f/1.2 optical planar separation with buttery smooth bokeh', desc: 'Isolates subject from background' },
      { label: 'Specular Bokeh Balls', snippet: 'creamy circular specular highlights in blurred background', desc: 'Rich cinematic background circles' },
      { label: 'Anamorphic Flare', snippet: 'subtle horizontal anamorphic cyan streak lens flare', desc: 'Cinematic widescreen look' },
      { label: 'Micro-Contrast Clarity', snippet: 'high optical micro-contrast across eyelashes and fabric weave', desc: 'Razor-sharp textures' }
    ]
  },
  {
    title: 'Skin Realism & Subsurface Scattering',
    icon: 'face_retouching_natural',
    keywords: [
      { label: 'Subsurface Scattering', snippet: 'subsurface scattering of epidermal skin with natural warm blood undertone', desc: 'Prevents plastic skin look' },
      { label: 'Authentic Micro-Pores', snippet: 'visible authentic skin micro-pores without plastic airbrushing', desc: 'True photorealism' },
      { label: 'Fine Peach Fuzz Glow', snippet: 'delicate peach fuzz on cheeks illuminated by rim light', desc: 'Authentic human lighting' },
      { label: 'Dewy Skin Radiance', snippet: 'dewy hydrated skin glow with natural highlight roll-off', desc: 'High-fashion editorial complexion' },
      { label: 'Authentic Thanaka Texture', snippet: 'natural yellowish-white Thanaka bark paste texture brushed on cheeks', desc: 'Burmese heritage authenticity' }
    ]
  },
  {
    title: 'Atmospheric Lighting & Volumetrics',
    icon: 'light_mode',
    keywords: [
      { label: 'Volumetric God Rays', snippet: 'volumetric sunbeams breaking through temple morning mist', desc: 'Atmospheric depth' },
      { label: 'Golden Dust Motes', snippet: 'suspended golden dust particles glowing in sunbeams', desc: 'Ethereal heritage atmosphere' },
      { label: '2800K Rim Light Halo', snippet: 'warm 2800K golden hour rim lighting framing hair contours', desc: 'Magical edge separation' },
      { label: 'Rembrandt 45° Triangle', snippet: 'classic Rembrandt lighting creating subtle illumination triangle on shadow cheek', desc: 'Timeless portrait mastery' },
      { label: 'CineStill 800T Halation', snippet: 'subtle organic red halation along high-contrast specular borders', desc: 'Vintage cinematic film warmth' }
    ]
  },
  {
    title: 'Camera Body & Medium Format Flagships',
    icon: 'photo_camera',
    keywords: [
      { label: 'Hasselblad X2D 100C', snippet: 'shot on medium format Hasselblad X2D 100C with 16-bit color depth', desc: 'Flagship studio detail' },
      { label: 'Leica Noctilux 50mm f/0.95', snippet: 'photographed with Leica M11 and legendary Noctilux-M 50mm f/0.95 ASPH', desc: 'Dreamlike falloff' },
      { label: 'Sony A7R V GM Master', snippet: 'Sony Alpha 7R V with Sony FE 85mm f/1.4 GM II lens, ISO 100', desc: 'Modern commercial clarity' },
      { label: 'Phase One IQ4 150MP', snippet: 'Phase One IQ4 150MP medium format back, breathtaking resolving power', desc: 'Maximum architectural detail' },
      { label: 'Kodak Portra 400 Natural', snippet: 'Kodak Portra 400 35mm film stock, organic grain, soft pastel shadows', desc: 'Timeless film aesthetic' }
    ]
  }
];

export const PromptUtilitySuite: React.FC<PromptUtilitySuiteProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  // Active Utility Tab
  const [activeTab, setActiveTab] = useState<'secret-booster' | 'negative-matrix' | 'batch-generator' | 'lens-calculator'>('secret-booster');

  // Selected secret keywords to inject
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([
    'twin circular softbox catchlights reflecting in sharp pupils',
    'subsurface scattering of epidermal skin with natural warm blood undertone',
    'shot on medium format Hasselblad X2D 100C with 16-bit color depth'
  ]);

  // Base prompt to boost
  const [basePrompt, setBasePrompt] = useState<string>(
    'Master portrait of a graceful Burmese lady in Bagan ancient temple arches, wearing traditional emerald silk longyi, soft smile'
  );

  // Negative Prompt Toggles
  const [negativePills, setNegativePills] = useState<Record<string, boolean>>({
    deformed_limbs: true,
    extra_fingers: true,
    plastic_skin: true,
    face_morph: true,
    scratches_dust: false,
    cartoon_cgi: true,
    blurry_eyes: true,
    washed_out: true
  });

  const toggleNegativePill = (key: string) => {
    setNegativePills(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Lens Calculator Selected Focal Length
  const [selectedLensFocal, setSelectedLensFocal] = useState<number>(85);

  // Toasts
  const [copiedBoostToast, setCopiedBoostToast] = useState<boolean>(false);
  const [copiedNegToast, setCopiedNegToast] = useState<boolean>(false);
  const [copiedBatchToast, setCopiedBatchToast] = useState<boolean>(false);

  // Toggle secret keyword
  const toggleKeyword = (snippet: string) => {
    if (selectedKeywords.includes(snippet)) {
      setSelectedKeywords(prev => prev.filter(k => k !== snippet));
    } else {
      setSelectedKeywords(prev => [...prev, snippet]);
    }
  };

  // Synthesized boosted prompt
  const boostedPrompt = useMemo(() => {
    const injected = selectedKeywords.join(', ');
    const arClause = engine === 'midjourney-v6' ? '--ar 4:5 --style raw --v 6.1' : '--ar 4:5';
    return `${basePrompt}, ${injected}, 8k resolution, photorealistic ${arClause}`.replace(/\s+/g, ' ');
  }, [basePrompt, selectedKeywords, engine]);

  // Synthesized negative prompt from pills
  const synthesizedNegativePrompt = useMemo(() => {
    const clauses: string[] = [];
    if (negativePills.deformed_limbs) clauses.push('deformed limbs, broken hands, missing arms, bad anatomy');
    if (negativePills.extra_fingers) clauses.push('extra fingers, mutated hands, poorly drawn fingers, fused fingers');
    if (negativePills.plastic_skin) clauses.push('plastic skin, mannequin face, excessive airbrushing, fake smoothness');
    if (negativePills.face_morph) clauses.push('altered face, morphed identity, changed facial features, asymmetric eyes');
    if (negativePills.scratches_dust) clauses.push('scratches, dust spots, paper tears, creases, water marks, mold, sepia stain');
    if (negativePills.cartoon_cgi) clauses.push('cartoon, 3D render, anime, painting, CGI sheen, videogame asset');
    if (negativePills.blurry_eyes) clauses.push('blurry eyes, lazy eye, cross-eyed, low resolution pupils, motion blur');
    if (negativePills.washed_out) clauses.push('washed out colors, overexposed blown highlights, underexposed crushed blacks');
    return clauses.join(', ');
  }, [negativePills]);

  // Batch Generation Variations
  const batchVariations = useMemo(() => {
    const variations = [
      {
        title: 'Shot 01: Golden Hour Eye-Level Master',
        prompt: `${basePrompt}, eye-level medium portrait, warm golden hour rim lighting, Hasselblad X2D 100mm f/1.4 lens --ar 16:9 --style raw`
      },
      {
        title: 'Shot 02: Cinematic Low-Angle Monumental Hero',
        prompt: `${basePrompt}, low-angle heroic composition, majestic ancient pagoda spires towering in background, volumetric morning sunbeams, Leica M11 35mm f/1.4 lens --ar 4:5 --style raw`
      },
      {
        title: 'Shot 03: Intimate 85mm Macro Pupil Close-Up',
        prompt: `${basePrompt}, intimate extreme close-up portrait, twin softbox catchlights in pupils, delicate Thanaka texture on cheeks, 85mm macro f/1.2 lens --ar 1:1 --style raw`
      },
      {
        title: 'Shot 04: Twilight Blue Hour Atmospheric Noir',
        prompt: `${basePrompt}, serene blue hour twilight, gentle warm oil lamp glow illuminating face, cool ambient indigo shadows, CineStill 800T halation --ar 2:3 --style raw`
      },
      {
        title: 'Shot 05: Wide Environmental Documentary Canvas',
        prompt: `${basePrompt}, wide environmental portrait, vast Bagan landscape with morning hot air balloons in distant haze, 24mm f/2.8 lens --ar 21:9 --style raw`
      }
    ];
    return variations;
  }, [basePrompt]);

  const handleCopyBoosted = () => {
    navigator.clipboard.writeText(boostedPrompt);
    setCopiedBoostToast(true);
    setTimeout(() => setCopiedBoostToast(false), 2200);
  };

  const handleCopyNegative = () => {
    navigator.clipboard.writeText(synthesizedNegativePrompt);
    setCopiedNegToast(true);
    setTimeout(() => setCopiedNegToast(false), 2200);
  };

  const handleCopyBatch = () => {
    const text = batchVariations.map((v, i) => `[VARIATION 0${i + 1}: ${v.title}]\n${v.prompt}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatchToast(true);
    setTimeout(() => setCopiedBatchToast(false), 2200);
  };

  const handleDownloadBatch = () => {
    const text = batchVariations.map((v, i) => `[VARIATION 0${i + 1}: ${v.title}]\n${v.prompt}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mingalar-batch-prompts-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* 🌟 1. HEADER */}
      <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#704112] to-[#8c5828] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[28px]">build</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#1e1b19] tracking-tight">
                {isMm ? 'Prompt အသုံးချ ကိရိယာများနှင့် Pro Tools များ' : 'Prompt Utilities & Pro Photography Tools'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#275546]/10 text-[#275546] border border-[#275546]/20">
                Studio Grade Toolkit
              </span>
            </div>
            <p className="font-sans text-xs text-[#51443a] mt-0.5">
              {isMm
                ? 'လျှို့ဝှက် Keyword ထည့်သွင်းကိရိယာ၊ Negative Prompt Matrix၊ Batch ကွဲပြားမှုများ ထုတ်လုပ်ခြင်းနှင့် မှန်ဘီလူး တွက်ချက်စနစ်'
                : 'Secret Photographer Keyword Injector, Negative Prompt Matrix, 5-Shot Batch Generator, and Optical Lens FOV Guide'}
            </p>
          </div>
        </div>

        {/* Engine Badge */}
        <div className="flex items-center gap-2 bg-[#eee7e3] px-3 py-1.5 rounded-xl border border-[#d6c3b6]/40">
          <span className="material-symbols-outlined text-[16px] text-[#704112]">bolt</span>
          <span className="font-sans text-xs font-bold text-[#704112]">
            Target: {engine.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 🌟 2. SUB-UTILITY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'secret-booster', icon: 'auto_fix_high', labelEn: 'Secret Keyword Booster', labelMm: 'လျှို့ဝှက် Keyword ထည့်သွင်းကိရိယာ' },
          { id: 'negative-matrix', icon: 'block', labelEn: 'Negative Prompt Matrix', labelMm: 'Negative Prompt မာထရစ်' },
          { id: 'batch-generator', icon: 'dynamic_feed', labelEn: '5-Shot Batch Generator', labelMm: '၅ မျိုးစုံ Batch ထုတ်လုပ်ခြင်း' },
          { id: 'lens-calculator', icon: 'lens', labelEn: 'Lens FOV & Bokeh Guide', labelMm: 'မှန်ဘီလူး အလင်းဝင်ပေါက် လမ်းညွှန်' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#704112] text-white shadow-sm'
                : 'bg-[#faf2ee] text-[#51443a] hover:bg-[#eee7e3] border border-[#d6c3b6]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{isMm ? tab.labelMm : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* 🌟 3. MAIN WORKBENCH BODY */}
      {/* VIEW A: SECRET KEYWORD BOOSTER */}
      {activeTab === 'secret-booster' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left: Category Keywords Selector (7 Cols) */}
          <div className="xl:col-span-7 flex flex-col gap-4">
            
            {/* Input Base Prompt */}
            <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-2">
              <label className="font-sans text-xs font-bold text-[#704112] flex items-center justify-between">
                <span>{isMm ? 'အခြေခံ မူရင်း Prompt' : 'Base Photo Prompt'}</span>
                <span className="text-[10px] text-[#847469] font-normal">Edit text or click secret pills below</span>
              </label>
              <textarea
                value={basePrompt}
                onChange={e => setBasePrompt(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-mono text-[#1e1b19] focus:outline-none"
              />
            </div>

            {/* Keyword Category Grids */}
            <div className="space-y-4">
              {SECRET_KEYWORD_CATEGORIES.map(cat => (
                <div key={cat.title} className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#704112] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                    <span>{cat.title}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.keywords.map(kw => {
                      const isSelected = selectedKeywords.includes(kw.snippet);
                      return (
                        <button
                          key={kw.label}
                          type="button"
                          onClick={() => toggleKeyword(kw.snippet)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? 'bg-[#704112] text-white border-[#704112] shadow-xs'
                              : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-xs font-bold leading-tight">{kw.label}</span>
                            <span className="material-symbols-outlined text-[16px]">
                              {isSelected ? 'check_circle' : 'add_circle'}
                            </span>
                          </div>
                          <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-white/80' : 'text-[#847469]'}`}>
                            {kw.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right: Synthesized Boosted Prompt (5 Cols) */}
          <div className="xl:col-span-5 flex flex-col gap-4">
            
            <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#704112]">auto_awesome</span>
                  <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider">
                    {isMm ? 'အဆင့်မြှင့်တင်ပြီး Master Prompt' : 'Boosted Master Prompt'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#275546]/10 text-[#275546]">
                  {selectedKeywords.length} Secret Keywords Active
                </span>
              </div>

              {/* Active Pills Chip Strip */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {selectedKeywords.map((k, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium bg-white text-[#704112] border border-[#d6c3b6]/60 shadow-xs"
                  >
                    <span>{k.slice(0, 32)}...</span>
                    <button
                      type="button"
                      onClick={() => toggleKeyword(k)}
                      className="hover:text-red-600 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  readOnly
                  value={boostedPrompt}
                  rows={8}
                  className="w-full p-3.5 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-mono text-[#1e1b19] leading-relaxed resize-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyBoosted}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#704112] text-white hover:bg-[#8c5828] text-[11px] font-sans font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {copiedBoostToast ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedBoostToast ? 'Copied!' : 'Copy Boosted'}</span>
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {onSendToMatrix && (
                  <button
                    type="button"
                    onClick={() => onSendToMatrix(boostedPrompt)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>{isMm ? 'Prompt Matrix သို့ ပို့မည်' : 'Send to Prompt Matrix'}</span>
                  </button>
                )}

                {onSavePrompt && (
                  <button
                    type="button"
                    onClick={() => onSavePrompt(boostedPrompt, { title: 'Boosted Master Prompt' })}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white border border-[#d6c3b6]/60 text-[#704112] hover:bg-[#faf2ee] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark</span>
                    <span>Save</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW B: NEGATIVE PROMPT MATRIX */}
      {activeTab === 'negative-matrix' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7 flex flex-col gap-4">
            <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
                <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Negative Prompt Category Filter Pills</span>
                </span>
                <span className="text-xs text-[#847469]">Click to Toggle Safety Layer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'deformed_limbs', title: 'Anatomy Flaws & Extra Limbs', desc: 'Blocks mutilated hands, missing legs, deformed body' },
                  { key: 'extra_fingers', title: 'Extra & Fused Fingers', desc: 'Blocks 6 fingers, conjoined hands, messy digits' },
                  { key: 'plastic_skin', title: 'Plastic & Fake Mannequin Skin', desc: 'Blocks artificial airbrushing, rubber shine' },
                  { key: 'face_morph', title: 'Face Swap Morphing', desc: 'Blocks identity shifts, asymmetrical eyes' },
                  { key: 'scratches_dust', title: 'Vintage Scratches & Creases', desc: 'Blocks old paper tears, water damage, sepia mold' },
                  { key: 'cartoon_cgi', title: 'Cartoon / CGI 3D Game Look', desc: 'Blocks video game shaders, anime style' },
                  { key: 'blurry_eyes', title: 'Blurry & Lazy Eyes', desc: 'Blocks out-of-focus pupils, motion blur' },
                  { key: 'washed_out', title: 'Washed Out & Blown Exposure', desc: 'Blocks flat contrast, crushed shadow artifacts' }
                ].map(pill => {
                  const isActive = negativePills[pill.key];
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => toggleNegativePill(pill.key)}
                      className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                        isActive
                          ? 'bg-[#275546] text-white border-[#275546] shadow-xs'
                          : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                        {isActive ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-sans text-xs font-bold leading-tight">{pill.title}</span>
                        <span className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#847469]'}`}>
                          {pill.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 flex flex-col gap-4">
            <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
                <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider">
                  Active Negative Prompt String
                </span>
                <span className="text-xs text-[#847469]">Ready to Paste</span>
              </div>

              <textarea
                readOnly
                value={synthesizedNegativePrompt}
                rows={8}
                className="w-full p-3.5 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-mono text-[#1e1b19] leading-relaxed resize-none focus:outline-none"
              />

              <button
                type="button"
                onClick={handleCopyNegative}
                className="w-full py-2.5 px-4 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedNegToast ? 'check' : 'content_copy'}
                </span>
                <span>{copiedNegToast ? 'Copied Negative Prompt!' : 'Copy Negative Prompt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: 5-SHOT BATCH GENERATOR */}
      {activeTab === 'batch-generator' && (
        <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1e1b19]">
                5-Shot Cinematic Photography Series
              </h2>
              <p className="text-xs text-[#51443a]">
                Auto-generates a cohesive editorial suite covering all standard cinematography angles and lighting setups.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyBatch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-[#704112] text-xs font-semibold hover:bg-[#faf2ee] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedBatchToast ? 'check' : 'content_copy'}
                </span>
                <span>{copiedBatchToast ? 'All Copied!' : 'Copy All 5'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadBatch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#704112] text-white text-xs font-semibold hover:bg-[#8c5828] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export (.txt)</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {batchVariations.map((shot, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-[#d6c3b6]/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold text-[#704112]">
                    {shot.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shot.prompt);
                    }}
                    className="text-[11px] text-[#51443a] hover:text-[#704112] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    <span>Copy Shot</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-[#1e1b19] leading-relaxed bg-[#eee7e3]/40 p-2.5 rounded-lg">
                  {shot.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW D: LENS FOV & BOKEH GUIDE */}
      {activeTab === 'lens-calculator' && (
        <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1e1b19]">
                Camera Lens Focal Length &amp; Optical Separation Guide
              </h2>
              <p className="text-xs text-[#51443a]">
                Understand how focal lengths affect perspective compression, background blur (bokeh), and facial geometry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {[
              { focal: 24, name: '24mm Ultra-Wide', desc: 'Environmental Context' },
              { focal: 35, name: '35mm Documentary', desc: 'Storytelling Street' },
              { focal: 50, name: '50mm Standard', desc: 'Human Eye Natural' },
              { focal: 85, name: '85mm Classic Portrait', desc: 'Flattering Beauty' },
              { focal: 105, name: '105mm Macro', desc: 'Intimate Detail' },
              { focal: 135, name: '135mm Telephoto', desc: 'Creamy Compression' }
            ].map(lens => (
              <button
                key={lens.focal}
                type="button"
                onClick={() => setSelectedLensFocal(lens.focal)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col ${
                  selectedLensFocal === lens.focal
                    ? 'bg-[#704112] text-white border-[#704112] shadow-sm'
                    : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                }`}
              >
                <span className="font-mono text-lg font-bold">{lens.focal}mm</span>
                <span className="font-sans text-xs font-semibold leading-tight mt-1">{lens.name}</span>
                <span className={`text-[10px] mt-0.5 ${selectedLensFocal === lens.focal ? 'text-white/80' : 'text-[#847469]'}`}>
                  {lens.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Focal Details Card */}
          <div className="p-4 rounded-xl bg-white border border-[#d6c3b6]/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#704112]">camera</span>
              <span className="font-sans text-sm font-bold text-[#1e1b19]">
                Selected: {selectedLensFocal}mm Optical Characteristics
              </span>
            </div>
            <p className="font-sans text-xs text-[#51443a] leading-relaxed">
              {selectedLensFocal === 24 && 'Captures wide expansive backgrounds such as the full horizon of Bagan pagodas. Gives grand scale, but keep human subjects centered to prevent edge distortion.'}
              {selectedLensFocal === 35 && 'The legendary photojournalist focal length. Places the subject in immediate relationship with their cultural setting with natural three-dimensional depth.'}
              {selectedLensFocal === 50 && 'Matches the natural field of view of the human eye. Zero perspective distortion, neutral perspective, perfect for authentic documentary portraits.'}
              {selectedLensFocal === 85 && 'The gold standard for portrait photography. Slenderizes facial features, produces creamy circular bokeh balls, and separates the subject cleanly from background distraction.'}
              {selectedLensFocal === 105 && 'Excels at close-up beauty and macro jewelry shots. Captures intricate gold filigree, Mogok rubies, and detailed Thanaka brushstrokes.'}
              {selectedLensFocal === 135 && 'Heavy background compression. Brings distant pagoda towers seemingly right behind the subject while turning distracting clutter into an ethereal blur.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
