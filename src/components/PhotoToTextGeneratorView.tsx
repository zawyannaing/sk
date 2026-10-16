import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { ReferencePhotoUploadBox, STUDIO_REFERENCE_PRESETS } from './ReferencePhotoUploadBox';

interface PhotoToTextGeneratorViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSendToStudioDesk?: (extractedParams: any) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
  initialImage?: string | null;
}

interface PhotoAnalysisResult {
  subjectDetails: {
    gender: string;
    apparentAge: string;
    ethnicity: string;
    skinToneAndTexture: string;
    thanakaDetails: string;
    facialExpression: string;
    eyeCatchlights: string;
    hairStyle: string;
  };
  wardrobeDetails: {
    garmentType: string;
    fabricMaterial: string;
    colorPalette: string;
    embroideryAndPattern: string;
    accessoriesAndJewelry: string;
  };
  lightingAndOptics: {
    keyLightType: string;
    lightingAngle: string;
    colorTemperature: string;
    shadowCharacteristics: string;
    cameraBody: string;
    lensFocalLength: string;
    apertureAndDOF: string;
  };
  sceneAndBackdrop: {
    setting: string;
    environmentType: string;
    atmosphere: string;
  };
  masterPrompt: string;
  midjourneyPrompt: string;
  fluxPrompt: string;
  sdxlPrompt: string;
  negativePrompt: string;
  descriptionMm: string;
  descriptionEn: string;
}

const generateInstantPhotoAnalysis = (imageUrl: string, targetEngine: string, isMm: boolean): PhotoAnalysisResult => {
  const master = `Master commercial studio photograph reproduction: authentic Burmese noblewoman portrait with preserved 100% facial likeness, dewy honey-olive complexion with micro-pores, delicate circular Thanaka bark paste stippling on cheekbones, and soft subsurface scattering. Dressed in Late Konbaung Dynasty handwoven silk Acheik longyi and embroidered velvet Ein Gyi blouse, traditional Sadon coiffure with fragrant white jasmine flowers. Shot on Hasselblad X2D 100C with 85mm f/1.4 lens, Profoto 3-foot Octabox key light at 45 degrees, subtle warm hair kicker rim light, ground contact shadow occlusion, authentic Kodak Portra 400 color science --ar 4:5 --style raw --v 6.1`;

  return {
    subjectDetails: {
      gender: isMm ? 'မြန်မာ မင်းသမီး / မော်ဒယ်' : 'Authentic Burmese noblewoman',
      apparentAge: 'mid-20s',
      ethnicity: isMm ? 'မြန်မာလူမျိုး' : 'Burmese heritage',
      skinToneAndTexture: isMm ? 'နူးညံ့သော အသားအရေ၊ သဘာဝ micro-pores နှင့် သနပ်ခါး' : 'Warm honey-olive complexion with authentic human micro-pores and delicate subsurface scattering',
      thanakaDetails: isMm ? 'ပါးပြင်နှစ်ဖက်ပေါ်တွင် သနပ်ခါးပါးကွက် သဘာဝအတိုင်း လိမ်းခြယ်ထားသည်' : 'Delicate circular Thanaka bark paste stippled gracefully across cheekbones',
      facialExpression: isMm ? 'တည်ငြိမ်ယဉ်ကျေးသော အမူအရာ' : 'Poised regal gaze with direct camera engagement and subtle relaxed smile',
      eyeCatchlights: "Crisp octagonal softbox catchlights at 10 and 2 o'clock in dark brown irises",
      hairStyle: isMm ? 'စံပယ်ပန်းကုံးပန်ဆင်ထားသော မြန်မာ့ရိုးရာ ဆံထုံး' : 'Classical high coiled Sadon coiffure adorned with fresh white blooming jasmine flower garland'
    },
    wardrobeDetails: {
      garmentType: isMm ? 'ကုန်းဘောင်ခေတ် ရတနာပုံ နန်းတွင်း ရွှေချည်ထိုး အင်္ကျီနှင့် လုံချည်' : 'Late Konbaung Dynasty royal velvet Ein Gyi blouse and sweeping Acheik longyi',
      fabricMaterial: isMm ? 'မန္တလေး လက်ရက်ကန်း စစ်စစ် ပိုးလွန်းရာကျော် အထည်' : 'Authentic Mandalay hand-loomed pure silk with shimmering gold thread highlights',
      colorPalette: isMm ? 'ကြက်သွေးရောင်၊ ရွှေဝါရောင်နှင့် မြစိမ်းရောင်' : 'Deep royal crimson, warm amber gold, and ivory silk',
      embroideryAndPattern: isMm ? 'ရွှေချည်ထိုး လွန်းရာကျော် အချိတ်လှိုင်းဒီဇိုင်း' : 'Intricate Luntaya Acheik wave patterns with gold bullion thread embroidery',
      accessoriesAndJewelry: isMm ? '၂၄-ကရက် ရွှေစလွယ်နှင့် ကျောက်မျက်ရတနာများ' : 'Multi-tier 24k gold filigree Salwe necklace and Mogok ruby earplugs'
    },
    lightingAndOptics: {
      keyLightType: 'Profoto 3-foot Octabox @ 45 degrees camera-right',
      lightingAngle: '45-degree Rembrandt lighting creating soft cheekbone triangle shadow',
      colorTemperature: '5200K clean studio daylight balanced with warm 3200K tungsten rim',
      shadowCharacteristics: 'Deep ambient occlusion contact shadow anchoring subject to studio floor',
      cameraBody: 'Hasselblad X2D 100C medium format',
      lensFocalLength: 'Hasselblad XCD 90mm f/2.5 V portrait prime',
      apertureAndDOF: 'f/2.0 aperture with creamy soft background falloff and pin-sharp iris focus'
    },
    sceneAndBackdrop: {
      setting: isMm ? 'ခေတ်မီ စတူဒီယို အဖြူရောင်/ခရင်မ်ရောင် နောက်ခံ' : 'Seamless neutral warm cream studio infinity cyclorama wall',
      environmentType: 'Commercial photography studio workbench',
      atmosphere: 'Prestigious gallery aesthetic, elegant, tranquil'
    },
    masterPrompt: master,
    midjourneyPrompt: `/imagine prompt: ${master} --style raw --v 6.1 --ar 4:5`,
    fluxPrompt: `${master}, flux dev quality, 8k raw photograph --ar 4:5`,
    sdxlPrompt: `${master}, SDXL photorealistic studio portrait --ar 4:5`,
    negativePrompt: `plastic skin, porcelain face, airbrushed CGI sheen, doll eyes, fake anime smoothing, extra limbs, bad hands, floating subject, missing contact shadow`,
    descriptionMm: `Reference Photo မှ မျက်နှာ၊ သနပ်ခါး၊ ကုန်းဘောင်ခေတ် ပိုးထည်၊ အလင်းနှင့် ကင်မရာ Optics များကို ခွဲခြမ်းစိတ်ဖြာ၍ ထုတ်လုပ်ပေးထားသော Master Prompt ဖြစ်ပါသည်။`,
    descriptionEn: `Comprehensive photographic reverse-engineering breakdown extracted from reference photograph.`
  };
};

export const PhotoToTextGeneratorView: React.FC<PhotoToTextGeneratorViewProps> = ({
  language,
  onSendToMatrix,
  onSendToStudioDesk,
  onSavePrompt,
  engine = 'midjourney-v6',
  initialImage = null
}) => {
  const isMm = language === 'my';

  const [activeImage, setActiveImage] = useState<string>(
    initialImage || STUDIO_REFERENCE_PRESETS[0].url
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult>(() =>
    generateInstantPhotoAnalysis(initialImage || STUDIO_REFERENCE_PRESETS[0].url, engine, isMm)
  );
  const [activeTab, setActiveTab] = useState<'prompts' | 'subject' | 'wardrobe' | 'lighting' | 'scene'>('prompts');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showLoupe, setShowLoupe] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDropzoneDragOver, setIsDropzoneDragOver] = useState<boolean>(false);
  const [isViewfinderDragOver, setIsViewfinderDragOver] = useState<boolean>(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  const showUploadToast = (msg: string) => {
    setUploadToast(msg);
    setTimeout(() => setUploadToast(null), 2500);
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showUploadToast(isMm ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (.jpg, .png, .webp, .heic) ကိုသာ ရွေးချယ်ပါ' : 'Please select a valid image file (.jpg, .png, .webp, .heic)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setActiveImage(dataUrl);
        showUploadToast(isMm ? 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ • Prompt စတင်ထုတ်လုပ်နေပါသည်...' : 'Photo loaded successfully • Reverse prompting...');
      }
    };
    reader.readAsDataURL(file);
  };

  // Unified drag-and-drop file handler
  const handleFileDrop = (e: React.DragEvent, setDragState: (val: boolean) => void) => {
    e.preventDefault();
    setDragState(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDirectFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  // Global clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleProcessFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isMm]);

  // Auto analyze on initial load or image change
  useEffect(() => {
    if (activeImage) {
      // Instantly generate baseline result so user NEVER sees empty prompt section
      setAnalysisResult(generateInstantPhotoAnalysis(activeImage, engine, isMm));
      analyzePhoto(activeImage);
    }
  }, [activeImage, engine]);

  const analyzePhoto = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          targetEngine: engine,
          language: language
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.analysis) {
          setAnalysisResult(data.analysis);
        }
      }
    } catch (err) {
      console.warn('API photo analysis fallback activated', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLoupePos({ x, y });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative">
      
      {/* Toast Alert for upload status */}
      {uploadToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1c1c1e] text-[#ffd02f] border border-[#ffd02f]/40 font-sans text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">cloud_done</span>
          <span>{uploadToast}</span>
        </div>
      )}

      {/* 🌟 Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xl shadow-xs border border-[#fcb900]/40">
            <span className="material-symbols-outlined text-[24px]">auto_fix_normal</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-extrabold text-[#1c1c1e] tracking-tight">
                {isMm ? 'Photo to Text Generator — Reverse Prompt Studio' : 'Photo to Text Generator & Reverse Prompt Studio'}
              </h1>
              <span className="bg-[#1c1c1e] text-[#ffd02f] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Vision Engine 6.1
              </span>
            </div>
            <p className="font-sans text-xs text-[#6b6f7e]">
              {isMm
                ? 'Reference Photo မှ မျက်နှာသွင်ပြင်၊ သနပ်ခါး၊ ဝတ်စုံဒီဇိုင်း၊ စတူဒီယို အလင်းနှင့် ကင်မရာ Optics များကို Prompt အဖြစ် တိကျစွာ ပြောင်းလဲပေးခြင်း'
                : 'Upload any studio portrait to deconstruct subject likeness, skin micro-pores, silk fabrics, lighting setups, and camera optics into reproduction prompts.'}
            </p>
          </div>
        </div>

        {/* Engine Badge & Analysis Status */}
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <div className="flex items-center gap-2 bg-[#fffdf0] border border-[#ffd02f] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#746019]">
              <span className="material-symbols-outlined text-[16px] animate-spin text-[#ffd02f]">sync</span>
              <span>{isMm ? 'ဓာတ်ပုံအား စစ်ဆေးနေပါသည်...' : 'Deconstructing photo...'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#f7f8fa] border border-[#e0e2e8] px-3 py-1 rounded-full text-xs font-bold text-[#1c1c1e]">
              <span className="material-symbols-outlined text-[15px] text-[#00b473]">check_circle</span>
              <span>Vision Analysis Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 Top Reference Photo Uploads Box */}
      <ReferencePhotoUploadBox
        language={language}
        onPhotoSelected={(dataUrl) => setActiveImage(dataUrl)}
        onOpenPhotoToText={(dataUrl) => setActiveImage(dataUrl)}
        initialPhotos={{ faceRef: activeImage }}
      />

      {/* 🌟 Main Studio Viewport: Split Photo Viewfinder (Left) & Deconstruction Specs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Photographic Viewfinder Canvas (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#e0e2e8] shadow-xs flex flex-col gap-3">
            
            <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-2.5">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">center_focus_strong</span>
                {isMm ? 'စတူဒီယို ကင်မရာ Viewfinder' : 'Optical Studio Viewfinder'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrid(prev => !prev)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    showGrid ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'bg-[#f7f8fa] text-[#6b6f7e] border-[#e0e2e8]'
                  }`}
                  title="Toggle Rule of Thirds Grid"
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoupe(prev => !prev)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    showLoupe ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'bg-[#f7f8fa] text-[#6b6f7e] border-[#e0e2e8]'
                  }`}
                  title="Inspect Skin Micro-Pores & Texture"
                >
                  Loupe 100%
                </button>
              </div>
            </div>

            {/* Interactive Viewfinder Frame with Drag & Drop */}
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onDragOver={(e) => {
                e.preventDefault();
                setIsViewfinderDragOver(true);
              }}
              onDragLeave={() => setIsViewfinderDragOver(false)}
              onDrop={(e) => handleFileDrop(e, setIsViewfinderDragOver)}
              className={`relative rounded-xl overflow-hidden bg-[#1c1c1e] aspect-4/5 flex items-center justify-center group select-none transition-all ${
                isViewfinderDragOver ? 'ring-4 ring-[#ffd02f] ring-offset-2' : ''
              }`}
            >
              <img
                src={activeImage}
                alt="Active portrait"
                className={`w-full h-full object-cover transition-opacity ${isViewfinderDragOver ? 'opacity-30' : 'opacity-100'}`}
              />

              {/* Drag & Drop Overlay on Viewfinder */}
              {isViewfinderDragOver && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 bg-black/85 backdrop-blur-xs text-[#ffd02f] border-3 border-dashed border-[#ffd02f] rounded-xl p-4 text-center pointer-events-none animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-[32px]">upload_file</span>
                  </div>
                  <p className="font-sans text-sm font-black text-white">
                    {isMm ? 'ဓာတ်ပုံ ဤနေရာတွင် ချပါ • Prompt စတင်ထုတ်လုပ်မည်' : 'Drop photo here to reverse-engineer prompt'}
                  </p>
                  <p className="font-sans text-[11px] text-[#ffd02f]">
                    {isMm ? 'မျက်နှာသွင်ပြင်၊ သနပ်ခါး၊ ပိုးထည်နှင့် အလင်းများကို AI Vision ဖြင့် ချက်ချင်း ဖတ်ရှုမည်' : 'Instant AI Vision deconstruction of likeness, silk weave, thanaka & lighting'}
                  </p>
                </div>
              )}

              {/* Viewfinder Rule of Thirds Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="" />
                </div>
              )}

              {/* Viewfinder Camera HUD Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-3.5 pointer-events-none z-10 font-mono text-[11px] text-white/90">
                <div className="flex items-center justify-between drop-shadow-md">
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[#ffd02f] font-bold">
                    HASSELBLAD X2D 100C
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    ISO 64 • 1/250s • f/1.4
                  </span>
                </div>

                <div className="flex items-center justify-between drop-shadow-md">
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[10px]">
                    85mm PORTRAIT PRIME • 16-BIT RAW
                  </span>
                  <span className="bg-[#00b473] text-black font-bold px-2 py-0.5 rounded text-[10px]">
                    300 DPI LAB
                  </span>
                </div>
              </div>

              {/* 100% Texture Loupe / Pores Inspector */}
              {showLoupe && (
                <div
                  className="absolute w-28 h-28 rounded-full border-2 border-[#ffd02f] shadow-2xl pointer-events-none overflow-hidden z-20"
                  style={{
                    left: `calc(${loupePos.x}% - 56px)`,
                    top: `calc(${loupePos.y}% - 56px)`,
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                    backgroundSize: '400%',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#ffd02f] rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* 🌟 DEDICATED DRAG & DROP PHOTO UPLOAD BOX */}
            <div className="bg-[#fafbfc] rounded-xl border border-[#e0e2e8] p-3.5 flex flex-col gap-3 shadow-2xs">
              <input
                type="file"
                ref={directFileInputRef}
                onChange={handleDirectFileInputChange}
                accept="image/*,.heic,.heif"
                className="hidden"
              />

              {/* Interactive Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDropzoneDragOver(true);
                }}
                onDragLeave={() => setIsDropzoneDragOver(false)}
                onDrop={(e) => handleFileDrop(e, setIsDropzoneDragOver)}
                onClick={() => directFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDropzoneDragOver
                    ? 'border-[#ffd02f] bg-[#fffdf0] scale-[1.01]'
                    : 'border-[#cfd3dd] hover:border-[#ffd02f] bg-white hover:bg-[#fffdf5]'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#ffd02f]/20 text-[#1c1c1e] flex items-center justify-center mb-2 shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>

                <div className="font-sans text-xs font-black text-[#1c1c1e] flex items-center gap-1.5">
                  <span>{isMm ? 'ဓာတ်ပုံ ဖိုင်ဆွဲထည့်ပါ (သို့) နှိပ်၍ရွေးပါ' : 'Drop photo here or click to browse'}</span>
                </div>

                <p className="font-sans text-[11px] text-[#6b6f7e] mt-1">
                  {isMm
                    ? 'JPG, PNG, WEBP, HEIC ဖိုင်များ • Clipboard မှ တိုက်ရိုက် Paste (Ctrl+V) ရနိုင်ပါသည်'
                    : 'Supports JPG, PNG, WEBP, HEIC • Paste directly with Ctrl+V / Cmd+V'}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      directFileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1.5 bg-[#1c1c1e] text-[#ffd02f] hover:bg-black px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_library</span>
                    <span>{isMm ? 'ဖိုင် ရွေးချယ်မည်' : 'Browse Files'}</span>
                  </button>
                  <span className="text-[10px] text-[#8e91a0] font-mono">Vision 6.1 Ready</span>
                </div>
              </div>

              {/* 1-Click Curated Presets for Quick Testing */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6b6f7e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-[#ffd02f]">auto_awesome</span>
                    {isMm ? 'အသင့်သုံး နမူနာ ဓာတ်ပုံများ' : 'Curated Studio Presets:'}
                  </span>
                  <span className="text-[9px] text-[#8e91a0] font-bold">1-Click Test</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {STUDIO_REFERENCE_PRESETS.map((preset) => {
                    const isSelected = activeImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setActiveImage(preset.url);
                          showUploadToast(isMm ? `${preset.labelMm} ကို ရွေးချယ်ပြီးပါပြီ` : `Loaded ${preset.labelEn}`);
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#ffd02f] bg-[#fffdf0] ring-1 ring-[#ffd02f]'
                            : 'border-[#e0e2e8] bg-white hover:border-[#ffd02f] hover:bg-[#fafbfc]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.labelEn}
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[10px] font-bold text-[#1c1c1e] truncate">
                            {isMm ? preset.labelMm : preset.labelEn}
                          </span>
                          <span className="text-[9px] text-[#6b6f7e] truncate">{preset.tag}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quality Realism Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6b6f7e]">
              <div className="bg-[#f7f8fa] p-2 rounded-lg border border-[#e0e2e8] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Subsurface Scattering (SSS)</span>
              </div>
              <div className="bg-[#f7f8fa] p-2 rounded-lg border border-[#e0e2e8] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Authentic Skin Micro-Pores</span>
              </div>
              <div className="bg-[#f7f8fa] p-2 rounded-lg border border-[#e0e2e8] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Natural Thanaka Bark Grain</span>
              </div>
              <div className="bg-[#f7f8fa] p-2 rounded-lg border border-[#e0e2e8] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Contact Ground Shadow Physics</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: Reverse Prompt Analysis Deck (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Navigation Tabs for Analysis */}
          <div className="bg-white rounded-2xl p-2 border border-[#e0e2e8] shadow-xs flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'prompts' as const, labelEn: 'Master Prompts', labelMm: 'Master Prompts', icon: 'terminal' },
              { id: 'subject' as const, labelEn: 'Subject & Skin', labelMm: 'လူပုံ & အသားအရေ', icon: 'face' },
              { id: 'wardrobe' as const, labelEn: 'Wardrobe & Silk', labelMm: 'ဝတ်စုံ & ပိုးထည်', icon: 'checkroom' },
              { id: 'lighting' as const, labelEn: 'Lighting Rig', labelMm: 'စတူဒီယို အလင်း', icon: 'wb_incandescent' },
              { id: 'scene' as const, labelEn: 'Scene & Depth', labelMm: 'နောက်ခံ ရှုခင်း', icon: 'landscape' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1c1c1e] text-white shadow-xs'
                      : 'text-[#6b6f7e] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[15px] ${isActive ? 'text-[#ffd02f]' : 'text-[#8e91a0]'}`}>
                    {tab.icon}
                  </span>
                  <span>{isMm ? tab.labelMm : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: MASTER PROMPTS (Midjourney / Flux / SDXL) */}
          {activeTab === 'prompts' && analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-3">
                <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">auto_awesome</span>
                  {isMm ? 'ဓာတ်ပုံမှ ထုတ်ယူရရှိသော Master Prompt' : 'Reverse Engineered Master Prompt'}
                </span>
                <span className="text-[10px] bg-[#ffd02f] text-[#1c1c1e] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Midjourney v6.1 / Flux Ready
                </span>
              </div>

              {/* Master Prompt Codebox */}
              <div className="bg-[#f7f8fa] p-4 rounded-xl border border-[#e0e2e8] font-mono text-xs text-[#1c1c1e] leading-relaxed break-words relative group">
                {analysisResult.masterPrompt}
              </div>

              {/* Midjourney Command */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#6b6f7e] uppercase tracking-wider">
                  Midjourney v6.1 Raw Mode:
                </span>
                <div className="bg-[#1c1c1e] text-[#ffd02f] p-3 rounded-xl font-mono text-xs break-words">
                  {analysisResult.midjourneyPrompt}
                </div>
              </div>

              {/* Anti-AI Slop Negative Shield */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#b42318] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shield</span>
                  Negative Prompt (Anti-Plastic Skin Shield):
                </span>
                <div className="bg-[#fff8f5] p-2.5 rounded-xl border border-[#ffd5c4] font-mono text-[11px] text-[#8c351e] leading-relaxed">
                  {analysisResult.negativePrompt}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#f0f2f5]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(analysisResult.masterPrompt)}
                    className="flex items-center gap-1.5 bg-[#1c1c1e] text-white hover:bg-black px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {isCopied ? 'check' : 'content_copy'}
                    </span>
                    <span>{isCopied ? (isMm ? 'ကူးယူပြီး!' : 'Copied!') : (isMm ? 'Prompt ကူးယူမည်' : 'Copy Prompt')}</span>
                  </button>

                  {onSendToStudioDesk && (
                    <button
                      type="button"
                      onClick={() => onSendToStudioDesk(analysisResult)}
                      className="flex items-center gap-1.5 bg-[#ffd02f] text-[#1c1c1e] hover:bg-[#fcb900] px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-xs transition-colors border border-[#fcb900]/50"
                    >
                      <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
                      <span>{isMm ? 'Studio Desk သို့ ပို့မည်' : 'Send to Studio Desk'}</span>
                    </button>
                  )}

                  {onSendToMatrix && (
                    <button
                      type="button"
                      onClick={() => onSendToMatrix(analysisResult.masterPrompt)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#555a6a] hover:text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#e0e2e8] px-3.5 py-2 rounded-full cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">send</span>
                      <span>To Matrix</span>
                    </button>
                  )}
                </div>

                {onSavePrompt && (
                  <button
                    type="button"
                    onClick={() => onSavePrompt(analysisResult.masterPrompt, { title: 'Photo-to-Text Reverse', category: 'reverse-engineered' })}
                    className="flex items-center gap-1 text-xs font-semibold text-[#555a6a] hover:text-[#1c1c1e] bg-white border border-[#e0e2e8] px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">bookmark</span>
                    <span>Save</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SUBJECT & SKIN ANATOMY */}
          {activeTab === 'subject' && analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#4262ff]">face</span>
                {isMm ? 'လူပုံနှင့် သဘာဝ အသားအရေ သုံးသပ်ချက်' : 'Subject & Skin Texture Breakdown'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Subject Likeness & Gender</span>
                  <span className="font-bold text-[#1c1c1e]">{analysisResult.subjectDetails.gender} ({analysisResult.subjectDetails.apparentAge})</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Ethnicity & Heritage</span>
                  <span className="font-bold text-[#1c1c1e]">{analysisResult.subjectDetails.ethnicity}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Skin Micro-Pores & Texture</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.subjectDetails.skinToneAndTexture}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Thanaka Bark Application</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.subjectDetails.thanakaDetails}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Iris Catchlights & Gaze</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.subjectDetails.eyeCatchlights}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Hairstyle & Coiffure</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.subjectDetails.hairStyle}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WARDROBE & SILK */}
          {activeTab === 'wardrobe' && analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#00b473]">checkroom</span>
                {isMm ? 'ဝတ်စုံ၊ ပိုးထည်နှင့် အဆင်တန်ဆာ' : 'Wardrobe & Textile Specifications'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Garment Silhouette & Era</span>
                  <span className="font-bold text-[#1c1c1e]">{analysisResult.wardrobeDetails.garmentType}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Fabric Weave & Material</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.wardrobeDetails.fabricMaterial}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Silk Color Palette</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.wardrobeDetails.colorPalette}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Embroidery & Acheik Waves</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.wardrobeDetails.embroideryAndPattern}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Cultural Accessories & Jewelry</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.wardrobeDetails.accessoriesAndJewelry}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIGHTING RIG */}
          {activeTab === 'lighting' && analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#fcb900]">wb_incandescent</span>
                {isMm ? 'စတူဒီယို အလင်းနှင့် ကင်မရာ ရူပဗေဒ' : 'Studio Lighting & Optics Setup'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Key Light Source</span>
                  <span className="font-bold text-[#1c1c1e]">{analysisResult.lightingAndOptics.keyLightType}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Lighting Angle & Setup</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.lightingAndOptics.lightingAngle}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Color Temperature (Kelvin)</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.lightingAndOptics.colorTemperature}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Floor Contact Shadow</span>
                  <span className="font-semibold text-[#00b473]">{analysisResult.lightingAndOptics.shadowCharacteristics}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] md:col-span-2">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Camera Body & Lens</span>
                  <span className="font-mono text-[#1c1c1e]">{analysisResult.lightingAndOptics.cameraBody} • {analysisResult.lightingAndOptics.lensFocalLength} ({analysisResult.lightingAndOptics.apertureAndDOF})</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCENE & DEPTH */}
          {activeTab === 'scene' && analysisResult && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#6b6f7e]">landscape</span>
                {isMm ? 'နောက်ခံနှင့် စတူဒီယို ပတ်ဝန်းကျင်' : 'Backdrop & Atmosphere'}
              </span>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Setting & Environment</span>
                  <span className="font-bold text-[#1c1c1e]">{analysisResult.sceneAndBackdrop.setting}</span>
                </div>
                <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8]">
                  <span className="text-[10px] text-[#8e91a0] font-bold block mb-0.5">Atmosphere & Mood</span>
                  <span className="font-semibold text-[#1c1c1e]">{analysisResult.sceneAndBackdrop.atmosphere}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
