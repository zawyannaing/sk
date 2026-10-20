import React, { useState, useRef, useMemo } from 'react';
import { Language } from '../types';

interface PhotoEditStudioProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

type EditTab = 'clothes-swap' | 'bg-replace' | 'relight' | 'headshot' | 'expression';

interface ModelPreset {
  id: string;
  name: string;
  category: string;
  imgUrl: string;
}

const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'model-1',
    name: 'Bagan Heritage Model',
    category: 'Traditional',
    imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-2',
    name: 'Mandalay Gentleman',
    category: 'Portrait',
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-3',
    name: 'Modern Yangon Editorial',
    category: 'Fashion',
    imgUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-4',
    name: 'Shan Highland Lady',
    category: 'Cultural',
    imgUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  }
];

export const PhotoEditStudio: React.FC<PhotoEditStudioProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  // Active Edit Utility Tab
  const [activeTab, setActiveTab] = useState<EditTab>('clothes-swap');

  // Selected base photo (either uploaded or preset)
  const [selectedModel, setSelectedModel] = useState<ModelPreset>(MODEL_PRESETS[0]);
  const [uploadedBasePhoto, setUploadedBasePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Secondary garment upload (for clothes swap)
  const [customGarmentPhoto, setCustomGarmentPhoto] = useState<string | null>(null);
  const garmentInputRef = useRef<HTMLInputElement>(null);

  // Clothes Swap Selection
  const [garmentStyle, setGarmentStyle] = useState<string>('Royal Velvet Yadanabon Ein Gyi with Pure Gold Thread');
  const [garmentFabric, setGarmentFabric] = useState<string>('Pure Woven Silk with Water Droplets');

  // Background Replacement Selection
  const [bgScene, setBgScene] = useState<string>('ancient_bagan_sunset');
  const [preserveSubject100, setPreserveSubject100] = useState<boolean>(true);

  // Relighting Selection
  const [lightingPreset, setLightingPreset] = useState<string>('golden_hour_rim');
  const [lightIntensity, setLightIntensity] = useState<number>(75);

  // Headshot Enhancer Selection
  const [headshotStyle, setHeadshotStyle] = useState<string>('executive_corporate_suit');
  const [skinSmoothing, setSkinSmoothing] = useState<number>(65);

  // Expression & Pose Selection
  const [expressionStyle, setExpressionStyle] = useState<string>('warm_genuine_smile');
  const [gazeDirection, setGazeDirection] = useState<string>('direct_catchlights');

  // Transformation Strength (Denoising Weight)
  const [transformStrength, setTransformStrength] = useState<number>(0.65);

  // Canvas visual adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(100);

  // Toasts
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Active display image
  const activeImage = uploadedBasePhoto || selectedModel.imgUrl;

  // Synthesize Edit Inpainting Prompt
  const masterEditPrompt = useMemo(() => {
    let taskClause = '';
    const preserveNotice = preserveSubject100
      ? 'CRITICAL IDENTITY LOCK: Maintain 100% exact face, eyes, nose, lips, facial proportions, skin tone, and bone structure from reference image. Zero face alteration, zero facial morphing.'
      : 'Maintain facial resemblance and natural aesthetics.';

    switch (activeTab) {
      case 'clothes-swap':
        taskClause = `INPAINTING CLOTHES SWAP: Replace only the clothing outfit with authentic ${garmentStyle}, fabricated in ${garmentFabric}, perfectly contoured to body curves, realistic fabric folds, natural draping, fine stitching details. Maintain original posture and head direction.`;
        if (customGarmentPhoto) {
          taskClause += ' Match the color, cut, and pattern of the attached secondary garment reference photo exactly.';
        }
        break;
      case 'bg-replace':
        taskClause = `BACKGROUND REPLACEMENT ONLY: Subject remains 100% untouched. Replace entire background environment with ${
          bgScene === 'ancient_bagan_sunset'
            ? 'Ancient Bagan temple pagodas silhouette under vibrant crimson and amber sunset, misty horizon, volumetric god rays'
            : bgScene === 'luxury_penthouse'
            ? 'Ultra-luxury modern minimalist penthouse terrace, floor-to-ceiling glass windows overlooking glowing Yangon city lights at dusk'
            : bgScene === 'studio_cyclorama'
            ? 'High-end commercial photography neutral warm-gray seamless cyclorama studio backdrop with soft gradient falloff'
            : 'Misty Inle Lake calm glass waters at early morning sunrise with floating gardens and distant Shan mountain ridges'
        }. Seamless edge blending, authentic environmental bounce light onto subject.`;
        break;
      case 'relight':
        taskClause = `STUDIO RELIGHTING & ATMOSPHERE: Apply dramatic ${
          lightingPreset === 'golden_hour_rim'
            ? 'warm 2800K golden hour rim lighting, glowing hair halo, soft diffused amber fill light'
            : lightingPreset === 'rembrandt_key'
            ? 'classic Rembrandt key light at 45 degrees, characteristic light triangle on shadow cheek, soft shadow rolloff'
            : lightingPreset === 'noir_chiaroscuro'
            ? 'cinematic high-contrast chiaroscuro, deep shadows, crisp specular highlights on facial features'
            : 'modern dual rim lighting with subtle cyan and warm magenta hair separation'
        } with ${lightIntensity}% luminous intensity. Natural subsurface scattering on skin.`;
        break;
      case 'headshot':
        taskClause = `EXECUTIVE HEADSHOT UPGRADE: Transform photo into premium $500 commercial corporate portrait, subject wearing ${
          headshotStyle === 'executive_corporate_suit'
            ? 'tailored Italian charcoal wool business suit with crisp white collar'
            : 'elegant modern silk blouse with subtle jewelry'
        }, perfectly styled hair, confident posture, subtle flattering eye catchlights, clean 85mm portrait background blur (f/1.4 bokeh), ${skinSmoothing}% natural skin pore realism.`;
        break;
      case 'expression':
        taskClause = `FACIAL EXPRESSION & GAZE ADJUSTMENT: Subtle organic transition to a ${
          expressionStyle === 'warm_genuine_smile'
            ? 'warm genuine gentle smile, smiling eyes (Duchenne smile), relaxed jawline'
            : expressionStyle === 'confident_editorial'
            ? 'confident high-fashion editorial gaze, slight chin lift, commanding presence'
            : 'peaceful meditative serene expression, gentle lips, calm eyes'
        }, with ${gazeDirection === 'direct_catchlights' ? 'direct eye contact engaging viewer with twin softbox catchlights' : 'pensive thoughtful gaze directed slightly off-camera'}.`;
        break;
    }

    const engineFlag = engine === 'midjourney-v6'
      ? `--iw 2.0 --ar 4:5 --style raw --v 6.1`
      : engine === 'flux-1'
      ? `--flux inpaint --strength ${transformStrength}`
      : `--sdxl inpainting`;

    return `Professional photo edit and inpainting: ${preserveNotice} ${taskClause} Shot on Hasselblad H6D-100c with 85mm f/1.2 lens, photorealistic 8k, natural human anatomy ${engineFlag}`;
  }, [
    activeTab,
    preserveSubject100,
    garmentStyle,
    garmentFabric,
    customGarmentPhoto,
    bgScene,
    lightingPreset,
    lightIntensity,
    headshotStyle,
    skinSmoothing,
    expressionStyle,
    gazeDirection,
    transformStrength,
    engine
  ]);

  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedBasePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomGarmentPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterEditPrompt);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2200);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* 🌟 1. HEADER */}
      <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#704112] to-[#8c5828] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[28px]">brush</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#1e1b19] tracking-tight">
                {isMm ? 'ပရော်ဖက်ရှင်နယ် ဓာတ်ပုံ ပြင်ဆင်ရေး Studio' : 'Professional Photo Edit Studio'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#704112]/10 text-[#704112] border border-[#704112]/20">
                AI Inpainting &amp; Retouch Suite
              </span>
            </div>
            <p className="font-sans text-xs text-[#51443a] mt-0.5">
              {isMm
                ? 'ဝတ်စုံလဲလှယ်ခြင်း၊ နောက်ခံအစားထိုးခြင်း၊ မီးထိုးအလင်းအမှောင်ပြင်ဆင်ခြင်းနှင့် Executive Headshot ဖန်တီးခြင်း'
                : 'Clothes Swap, Background Replacement, Cinematic Relighting, and Executive Portrait Retouching with 100% Face Likeness Lock'}
            </p>
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBaseUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 hover:bg-[#faf2ee] text-[#704112] font-sans text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>{isMm ? 'မိမိ ဓာတ်ပုံ တင်မည်' : 'Upload Person Photo'}</span>
          </button>

          {uploadedBasePhoto && (
            <button
              type="button"
              onClick={() => setUploadedBasePhoto(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e9e1dd] hover:bg-[#d6c3b6] text-[#51443a] font-sans text-xs font-medium transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>{isMm ? 'စံပြမော်ဒယ်သို့ ပြန်ထားမည်' : 'Reset to Model'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 2. FIVE UTILITY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'clothes-swap', icon: 'styler', labelEn: 'Clothes & Outfit Swap', labelMm: 'ဝတ်စုံ လဲလှယ်ခြင်း' },
          { id: 'bg-replace', icon: 'wallpaper', labelEn: 'Background Replacement', labelMm: 'နောက်ခံ အစားထိုးခြင်း' },
          { id: 'relight', icon: 'wb_sunny', labelEn: 'Studio Relighting & Golden Hour', labelMm: 'မီးထိုးနှင့် အလင်းအမှောင်' },
          { id: 'headshot', icon: 'badge', labelEn: 'Executive Headshot Enhancer', labelMm: 'Executive Headshot အဆင့်မြှင့်တင်မှု' },
          { id: 'expression', icon: 'sentiment_satisfied', labelEn: 'Expression & Pose Modifier', labelMm: 'အမူအရာနှင့် အကြည့် ပြင်ဆင်မှု' }
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

      {/* 🌟 3. MAIN WORKBENCH GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER: PHOTO CANVAS & PRESETS (7 COLS) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          
          {/* Main Visual Frame */}
          <div className="bg-[#1e1b19] rounded-2xl p-4 shadow-md border border-[#3e3834] flex flex-col gap-3">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between text-white/80 px-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffdcc2]">camera</span>
                <span className="font-sans text-xs font-semibold text-[#ffdcc2]">
                  {uploadedBasePhoto ? 'Custom Uploaded Photo' : selectedModel.name}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-white/60">
                  {preserveSubject100 ? '100% Face Locked' : 'Adaptive Face'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#84e0b8]">
                <span>Inpaint Ready</span>
              </div>
            </div>

            {/* Photo Canvas Frame with Live Sliders Filter */}
            <div className="relative w-full h-[460px] sm:h-[520px] rounded-xl overflow-hidden bg-stone-900 border border-white/10 flex items-center justify-center">
              <img
                src={activeImage}
                alt="Active Photo"
                className="w-full h-full object-cover transition-all"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${(warmth - 100) * 0.5}%)`
                }}
              />

              {/* Utility Feature Badge Overlay */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-sans font-bold border border-white/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffdcc2]">
                  {activeTab === 'clothes-swap' ? 'styler' : activeTab === 'bg-replace' ? 'wallpaper' : 'flare'}
                </span>
                <span>Active Mode: {activeTab.replace('-', ' ').toUpperCase()}</span>
              </div>

              {/* Secondary Garment Badge (if in clothes-swap and uploaded) */}
              {activeTab === 'clothes-swap' && customGarmentPhoto && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 p-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/20">
                  <img
                    src={customGarmentPhoto}
                    alt="Garment Ref"
                    className="w-12 h-12 object-cover rounded-lg border border-white/30"
                  />
                  <div className="flex flex-col text-left text-white pr-2">
                    <span className="text-[10px] text-white/70">Attached Garment Ref</span>
                    <span className="text-xs font-bold text-[#ffdcc2]">Active Outfit</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Filter Sliders Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-3 rounded-xl text-white/80 text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span>Brightness</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  className="w-full accent-[#ffdcc2] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span>Contrast</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={contrast}
                  onChange={e => setContrast(Number(e.target.value))}
                  className="w-full accent-[#ffdcc2] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span>Saturation</span>
                  <span className="font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={saturation}
                  onChange={e => setSaturation(Number(e.target.value))}
                  className="w-full accent-[#ffdcc2] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px]">
                  <span>Warmth / Sepia</span>
                  <span className="font-mono">{warmth}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={warmth}
                  onChange={e => setWarmth(Number(e.target.value))}
                  className="w-full accent-[#ffdcc2] cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Model Presets Selector */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">face</span>
                <span>{isMm ? 'စံပြ မော်ဒယ် ဓာတ်ပုံများ' : 'Studio Reference Models'}</span>
              </span>
              <span className="text-[11px] text-[#847469]">
                High-Resolution Base Portraits
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MODEL_PRESETS.map(model => {
                const isSelected = selectedModel.id === model.id && !uploadedBasePhoto;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model);
                      setUploadedBasePhoto(null);
                    }}
                    className={`relative rounded-xl overflow-hidden text-left border transition-all cursor-pointer group flex flex-col ${
                      isSelected
                        ? 'border-[#704112] ring-2 ring-[#704112]/30 shadow-md'
                        : 'border-[#d6c3b6]/60 hover:border-[#704112]/50 bg-white'
                    }`}
                  >
                    <div className="h-24 w-full relative overflow-hidden bg-stone-200">
                      <img
                        src={model.imgUrl}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] bg-black/60 text-white font-mono">
                        {model.category}
                      </span>
                    </div>
                    <div className="p-2 flex flex-col">
                      <span className="font-sans text-xs font-bold text-[#1e1b19] line-clamp-1">
                        {model.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: TAB-SPECIFIC EDIT PARAMETERS & PROMPT GENERATOR (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Controls Panel */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
              <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>{isMm ? 'ရွေးချယ်ထားသော Utility ဆက်တင်များ' : 'Edit Tool Controls'}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdcc2] text-[#704112]">
                {activeTab.toUpperCase()}
              </span>
            </div>

            {/* TAB 1: CLOTHES SWAP CONTROLS */}
            {activeTab === 'clothes-swap' && (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-[#51443a]">
                    {isMm ? 'လဲလှယ်လိုသော ဝတ်စုံ ဒီဇိုင်း' : 'Target Garment Style'}
                  </label>
                  <select
                    value={garmentStyle}
                    onChange={e => setGarmentStyle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-sans text-[#1e1b19] focus:outline-none"
                  >
                    <option value="Royal Velvet Yadanabon Ein Gyi with Pure Gold Thread">Royal Velvet Yadanabon Ein Gyi (Gold Thread)</option>
                    <option value="Shan Highland Royal Brocade Attire with Silver Torque">Shan Highland Royal Brocade Attire</option>
                    <option value="Bagan Period Diagonal Silk Sash Yinzi">Bagan Period Diagonal Silk Sash Yinzi</option>
                    <option value="Modern Tailored Italian Business Blazer Suit">Modern Tailored Italian Business Blazer Suit</option>
                    <option value="Haute Couture Silk Evening Gown">Haute Couture Silk Evening Gown</option>
                    <option value="Festive Thingyan Water Festival Padauk Yellow Tunic">Festive Thingyan Padauk Yellow Tunic</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-xs font-semibold text-[#51443a]">
                    {isMm ? 'အထည်အလိပ် အမျိုးအစား' : 'Fabric & Textile'}
                  </label>
                  <select
                    value={garmentFabric}
                    onChange={e => setGarmentFabric(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-sans text-[#1e1b19] focus:outline-none"
                  >
                    <option value="Pure Woven Silk with Water Droplets">Pure Woven Silk with Water Droplets</option>
                    <option value="Heavy Royal Velvet with Gold Filigree">Heavy Royal Velvet with Gold Filigree</option>
                    <option value="Fine Organza Silk with Delicate Embroidery">Fine Organza Silk with Delicate Embroidery</option>
                    <option value="Structured Wool and Cashmere Blend">Structured Wool and Cashmere Blend</option>
                  </select>
                </div>

                {/* Upload Custom Garment Photo */}
                <div className="p-3 rounded-xl bg-white border border-[#d6c3b6]/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold text-[#1e1b19]">
                      {isMm ? 'ပြင်ပမှ ဝတ်စုံ ဓာတ်ပုံ တွဲတင်မည်' : 'Attach Secondary Outfit Photo'}
                    </span>
                    <input
                      type="file"
                      ref={garmentInputRef}
                      onChange={handleGarmentUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => garmentInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-[#704112] text-white text-[11px] font-semibold hover:bg-[#8c5828] cursor-pointer"
                    >
                      {customGarmentPhoto ? 'Change Outfit' : 'Upload Outfit'}
                    </button>
                  </div>
                  {customGarmentPhoto && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={customGarmentPhoto}
                        alt="Garment Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-[#d6c3b6]"
                      />
                      <span className="text-xs text-[#275546] font-semibold">
                        ✓ Custom Garment Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BACKGROUND REPLACEMENT CONTROLS */}
            {activeTab === 'bg-replace' && (
              <div className="flex flex-col gap-3">
                <label className="font-sans text-xs font-semibold text-[#51443a]">
                  {isMm ? 'အစားထိုးလိုသော နောက်ခံ အခင်းအကျင်း' : 'Target Background Environment'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'ancient_bagan_sunset', label: 'Bagan Sunset Pagodas', desc: 'Golden hour silhouette' },
                    { id: 'luxury_penthouse', label: 'Luxury Penthouse', desc: 'City lights skyline' },
                    { id: 'studio_cyclorama', label: 'Studio Cyclorama', desc: 'Clean commercial gray' },
                    { id: 'inle_lake_mist', label: 'Inle Lake Dawn Mist', desc: 'Calm water reflections' }
                  ].map(scene => (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setBgScene(scene.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        bgScene === scene.id
                          ? 'bg-[#704112] text-white border-[#704112]'
                          : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                      }`}
                    >
                      <div className="font-sans text-xs font-bold">{scene.label}</div>
                      <div className={`text-[10px] ${bgScene === scene.id ? 'text-white/80' : 'text-[#847469]'}`}>
                        {scene.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: RELIGHTING CONTROLS */}
            {activeTab === 'relight' && (
              <div className="flex flex-col gap-3">
                <label className="font-sans text-xs font-semibold text-[#51443a]">
                  {isMm ? 'မီးထိုးစနစ် ပုံစံ' : 'Lighting Scheme'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'golden_hour_rim', label: 'Golden Hour Rim Glow', desc: 'Warm 2800K backlight' },
                    { id: 'rembrandt_key', label: 'Rembrandt 45° Key', desc: 'Classic studio portrait' },
                    { id: 'noir_chiaroscuro', label: 'Noir Chiaroscuro', desc: 'High dramatic contrast' },
                    { id: 'dual_neon_rim', label: 'Dual Rim Light', desc: 'Cyan & Magenta edge' }
                  ].map(lt => (
                    <button
                      key={lt.id}
                      type="button"
                      onClick={() => setLightingPreset(lt.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        lightingPreset === lt.id
                          ? 'bg-[#704112] text-white border-[#704112]'
                          : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                      }`}
                    >
                      <div className="font-sans text-xs font-bold">{lt.label}</div>
                      <div className={`text-[10px] ${lightingPreset === lt.id ? 'text-white/80' : 'text-[#847469]'}`}>
                        {lt.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#51443a]">Light Beam Intensity</span>
                    <span className="font-mono font-bold text-[#704112]">{lightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={lightIntensity}
                    onChange={e => setLightIntensity(Number(e.target.value))}
                    className="w-full accent-[#704112] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: HEADSHOT ENHANCER CONTROLS */}
            {activeTab === 'headshot' && (
              <div className="flex flex-col gap-3">
                <label className="font-sans text-xs font-semibold text-[#51443a]">
                  {isMm ? 'Portrait ပုံစံ' : 'Headshot Style & Wardrobe'}
                </label>
                <select
                  value={headshotStyle}
                  onChange={e => setHeadshotStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-sans text-[#1e1b19] focus:outline-none"
                >
                  <option value="executive_corporate_suit">Executive Charcoal Corporate Suit (LinkedIn Pro)</option>
                  <option value="modern_silk_blouse">Modern Silk Blouse with Subtle Pearl Jewelry</option>
                  <option value="minimalist_black_turtleneck">Minimalist Black Studio Turtleneck</option>
                </select>

                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#51443a]">Skin Texture &amp; Pore Realism</span>
                    <span className="font-mono font-bold text-[#704112]">{skinSmoothing}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={skinSmoothing}
                    onChange={e => setSkinSmoothing(Number(e.target.value))}
                    className="w-full accent-[#704112] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#847469]">
                    <span>Ultra Crisp Pores</span>
                    <span>Soft Studio Glow</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EXPRESSION & POSE CONTROLS */}
            {activeTab === 'expression' && (
              <div className="flex flex-col gap-3">
                <label className="font-sans text-xs font-semibold text-[#51443a]">
                  {isMm ? 'မျက်နှာ အမူအရာ' : 'Facial Expression'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'warm_genuine_smile', label: 'Warm Genuine Smile' },
                    { id: 'confident_editorial', label: 'Confident Editorial Gaze' },
                    { id: 'serene_meditative', label: 'Serene Meditative Calm' }
                  ].map(exp => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExpressionStyle(exp.id)}
                      className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        expressionStyle === exp.id
                          ? 'bg-[#704112] text-white border-[#704112]'
                          : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="font-sans text-xs font-semibold text-[#51443a]">
                    Eye Gaze &amp; Catchlight
                  </label>
                  <select
                    value={gazeDirection}
                    onChange={e => setGazeDirection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-sans text-[#1e1b19] focus:outline-none"
                  >
                    <option value="direct_catchlights">Direct Camera Eye Contact with Catchlights</option>
                    <option value="off_camera_pensive">Slight 15° Off-Camera Pensive Gaze</option>
                  </select>
                </div>
              </div>
            )}

            {/* 100% Face Likeness Lock */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#d6c3b6]/50">
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-[#1e1b19]">
                  {isMm ? 'မျက်နှာသွင်ပြင် ၁၀၀% တူညီမှု ထိန်းသိမ်းမည်' : 'Preserve 100% Facial Identity'}
                </span>
                <span className="text-[10px] text-[#847469]">
                  {isMm ? 'မျက်လုံး၊ နှာခေါင်း၊ နှုတ်ခမ်း မူလအတိုင်း အတိအကျ ထိန်းထားပါမည်' : 'Lock eyes, nose, lips and facial structure'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreserveSubject100(!preserveSubject100)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  preserveSubject100 ? 'bg-[#275546]' : 'bg-[#d6c3b6]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    preserveSubject100 ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Inpainting Denoising Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#51443a]">Transformation Strength</span>
                <span className="font-mono font-bold text-[#704112]">{transformStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.05"
                value={transformStrength}
                onChange={e => setTransformStrength(Number(e.target.value))}
                className="w-full accent-[#704112] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#847469]">
                <span>Subtle Retouch (0.2)</span>
                <span>Full Reinvention (0.85)</span>
              </div>
            </div>

          </div>

          {/* Master Inpainting Prompt Box */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#704112]">terminal</span>
                <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider">
                  {isMm ? 'ထုတ်လုပ်ပေးထားသော Edit Inpaint Prompt' : 'Master Photo Edit Inpaint Prompt'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#847469]">
                Ready for AI
              </span>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                readOnly
                value={masterEditPrompt}
                rows={5}
                className="w-full p-3.5 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-mono text-[#1e1b19] leading-relaxed resize-none focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#704112] text-white hover:bg-[#8c5828] text-[11px] font-sans font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedToast ? 'check' : 'content_copy'}
                </span>
                <span>{copiedToast ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {onSendToMatrix && (
                <button
                  type="button"
                  onClick={() => onSendToMatrix(masterEditPrompt)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isMm ? 'Prompt Matrix သို့ ပို့မည်' : 'Send to Prompt Matrix'}</span>
                </button>
              )}

              {onSavePrompt && (
                <button
                  type="button"
                  onClick={() => {
                    onSavePrompt(masterEditPrompt, {
                      mode: activeTab,
                      title: `Edit: ${activeTab.toUpperCase()}`
                    });
                    setSavedToast(true);
                    setTimeout(() => setSavedToast(false), 2200);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#141b2a] border border-zinc-800 text-zinc-200 hover:bg-[#1a2234] text-xs font-semibold transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    {savedToast ? 'bookmark_added' : 'bookmark'}
                  </span>
                  <span>{savedToast ? 'Saved!' : 'Save Prompt'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
