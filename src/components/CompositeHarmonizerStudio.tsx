import React, { useState, useRef, useMemo } from 'react';
import { Language } from '../types';

interface CompositeHarmonizerStudioProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

type HarmonizeMode =
  | 'cinematic-relight'
  | 'studio-cleanup'
  | 'soft-studio'
  | 'dreamy-pastel'
  | 'golden-rim'
  | 'moody-fine-art';

type BackdropCategory = 'all' | 'heritage' | 'royal' | 'studio' | 'modern' | 'festivals' | 'nature';

export interface BackdropPreset {
  id: string;
  nameEn: string;
  nameMm: string;
  category: 'heritage' | 'royal' | 'studio' | 'modern' | 'festivals' | 'nature';
  categoryLabelEn: string;
  categoryLabelMm: string;
  bgUrl: string;
  defaultLightAngle: number; // degrees
  colorTemp: string; // 3200K, 5600K
  promptSnippet: string;
}

export const BACKDROP_PRESETS: BackdropPreset[] = [
  // 1. Heritage & Landmarks
  {
    id: 'bagan-sunset-mist',
    nameEn: 'Bagan Pagoda Sunset Mist',
    nameMm: 'ပုဂံနေဝင်ဆည်းဆာနှင့် စေတီမြူခိုး',
    category: 'heritage',
    categoryLabelEn: 'Heritage Landmark',
    categoryLabelMm: 'ရှေးဟောင်းအမွေအနှစ်',
    bgUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '2800K Golden Warm',
    promptSnippet: 'ancient Bagan terracotta pagoda silhouettes at golden hour sunset, volumetric golden sun rays piercing through warm atmospheric dust, realistic ground perspective'
  },
  {
    id: 'shwedagon-marble-twilight',
    nameEn: 'Shwedagon Pagoda Marble Terrace',
    nameMm: 'ရွှေတိဂုံ ညချမ်း စကျင်ကျောက်ရင်ပြင်',
    category: 'heritage',
    categoryLabelEn: 'Heritage Landmark',
    categoryLabelMm: 'ရှေးဟောင်းအမွေအနှစ်',
    bgUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 30,
    colorTemp: '3200K Saffron Ambient',
    promptSnippet: 'majestic Shwedagon Pagoda golden stupa reflecting off polished white marble terrace at deep blue twilight, soft flickering oil lamps, sacred golden atmospheric glow'
  },
  {
    id: 'inle-lake-dusk',
    nameEn: 'Inle Lake Calm Waters Dusk',
    nameMm: 'အင်းလေးကန် ဆည်းဆာ ရေပြင်ညီ',
    category: 'heritage',
    categoryLabelEn: 'Heritage Landmark',
    categoryLabelMm: 'ရှေးဟောင်းအမွေအနှစ်',
    bgUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 60,
    colorTemp: '4200K Twilight Blue/Gold',
    promptSnippet: 'serene glass Inle lake at blue hour dusk, distant Shan mountain ridge silhouettes, soft water reflections, ambient cool mist, calm tranquil horizon'
  },
  {
    id: 'mandalay-palace-moat',
    nameEn: 'Mandalay Palace Moat Sunset',
    nameMm: 'မန္တလေးနန်းမြို့ရိုးနှင့် ကျုံးဆည်းဆာ',
    category: 'heritage',
    categoryLabelEn: 'Heritage Landmark',
    categoryLabelMm: 'ရှေးဟောင်းအမွေအနှစ်',
    bgUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '2900K Crimson Sunset',
    promptSnippet: 'Mandalay Palace red fortress brick walls and iconic wooden Pyatthat spires reflected over calm lotus moat at crimson sunset, soft dusk sky'
  },
  {
    id: 'mrauk-u-ancient-ridge',
    nameEn: 'Mrauk-U Ancient Temple Mist',
    nameMm: 'မြောက်ဦး ရှေးဟောင်း ကျောက်စေတီမြူ',
    category: 'heritage',
    categoryLabelEn: 'Heritage Landmark',
    categoryLabelMm: 'ရှေးဟောင်းအမွေအနှစ်',
    bgUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 40,
    colorTemp: '4800K Dawn Fog',
    promptSnippet: 'ancient stone fortress temples of Mrauk-U rising through thick morning river valley mist, dramatic cinematic ridges, ethereal sacred tranquility'
  },

  // 2. Royal Architecture & Palaces
  {
    id: 'mandalay-teak-parlor',
    nameEn: 'Mandalay Royal Teak Parlor',
    nameMm: 'မန္တလေး ရွှေကျွန်း နန်းတွင်းခန်းမ',
    category: 'royal',
    categoryLabelEn: 'Royal Architecture',
    categoryLabelMm: 'နန်းတွင်းလက်ရာ',
    bgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 40,
    colorTemp: '3000K Warm Tungsten',
    promptSnippet: 'ornate carved Burmese golden teak wood palace hall, gentle chandelier warm illumination, rich depth and classical royal architectural symmetry'
  },
  {
    id: 'amarapura-silk-courtyard',
    nameEn: 'Amarapura Silk Heritage Courtyard',
    nameMm: 'အမရပူရ ပိုးရက်ကန်း ရိုးရာဝင်း',
    category: 'royal',
    categoryLabelEn: 'Royal Architecture',
    categoryLabelMm: 'နန်းတွင်းလက်ရာ',
    bgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 50,
    colorTemp: '5200K Natural Sunbeam',
    promptSnippet: 'heritage open-air courtyard in Amarapura, sunlight filtering through teakwood latticework onto polished red terracotta floor tiles, hanging raw silk yarns'
  },
  {
    id: 'bagan-lacquerware-gallery',
    nameEn: 'Bagan Lacquerware Artisan Studio',
    nameMm: 'ပုဂံ ယွန်းထည် ရိုးရာအနုပညာခန်း',
    category: 'royal',
    categoryLabelEn: 'Royal Architecture',
    categoryLabelMm: 'နန်းတွင်းလက်ရာ',
    bgUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 35,
    colorTemp: '3100K Amber Directional',
    promptSnippet: 'atmospheric artisanal studio interior with shelves of exquisite gold-leaf lacquerware urns and ceremonial bowls, soft directional side window lighting'
  },

  // 3. Commercial Studio Cycloramas
  {
    id: 'studio-cyclorama-cream',
    nameEn: 'Studio Cyclorama Warm Cream',
    nameMm: 'စတူဒီယို ခရင်မ်ရောင် အနားသတ်မဲ့ ကင်းဗတ်',
    category: 'studio',
    categoryLabelEn: 'Studio Cyclorama',
    categoryLabelMm: 'စတူဒီယို ကင်းဗတ်',
    bgUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 30,
    colorTemp: '5500K Studio Daylight',
    promptSnippet: 'professional seamless studio infinity cyclorama wall, soft gradient warm cream backdrop, large 150cm parabolic softbox lighting'
  },
  {
    id: 'studio-high-key-white',
    nameEn: 'Pure High-Key Commercial White',
    nameMm: 'စတူဒီယို သန့်ရှင်းသော အဖြူရောင်စစ်စစ်',
    category: 'studio',
    categoryLabelEn: 'Studio Cyclorama',
    categoryLabelMm: 'စတူဒီယို ကင်းဗတ်',
    bgUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '5600K Clean White',
    promptSnippet: 'ultra-clean commercial high-key infinity white cyc wall, even edge-to-edge illumination, crisp softbox highlights, magazine lookbook aesthetic'
  },
  {
    id: 'studio-charcoal-fineart',
    nameEn: 'Textured Charcoal Fine-Art Canvas',
    nameMm: 'အနုပညာ မီးခိုးရောင် သဘာဝကျောက်နံရံ',
    category: 'studio',
    categoryLabelEn: 'Studio Cyclorama',
    categoryLabelMm: 'စတူဒီယို ကင်းဗတ်',
    bgUrl: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 35,
    colorTemp: '4800K Neutral Chiaroscuro',
    promptSnippet: 'mottled hand-painted charcoal and slate-grey artist canvas backdrop, painterly chiaroscuro rim lighting, dramatic tactile depth'
  },
  {
    id: 'studio-crimson-velvet',
    nameEn: 'Royal Crimson Velvet Drapery',
    nameMm: 'နန်းတွင်း အနီရင့် ကတ္တီပါ နောက်ခံ',
    category: 'studio',
    categoryLabelEn: 'Studio Cyclorama',
    categoryLabelMm: 'စတူဒီယို ကင်းဗတ်',
    bgUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 40,
    colorTemp: '3200K Theater Glow',
    promptSnippet: 'opulent deep crimson velvet theater curtain drapery backdrop, rich folded fabric textures, warm golden rim highlights, luxurious editorial studio stage'
  },

  // 4. Modern Luxury & Urban
  {
    id: 'modern-glass-penthouse',
    nameEn: 'Minimalist High-Rise Glass Penthouse',
    nameMm: 'ခေတ်မီ မှန်ပြတင်းပေါက် မိုးမျှော်တိုက်',
    category: 'modern',
    categoryLabelEn: 'Modern Luxury',
    categoryLabelMm: 'ခေတ်မီ ဇိမ်ခံ',
    bgUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 50,
    colorTemp: '5400K Daylight Window',
    promptSnippet: 'luxury contemporary penthouse interior with floor-to-ceiling glass panoramic windows overlooking hazy city skyline, minimalist travertine stone floor'
  },
  {
    id: 'colonial-french-balcony',
    nameEn: 'Heritage Colonial Arched Balcony',
    nameMm: 'ကိုလိုနီခေတ်ဟောင်း မုခ်ခုံးဝရန်တာ',
    category: 'modern',
    categoryLabelEn: 'Modern Luxury',
    categoryLabelMm: 'ခေတ်မီ ဇိမ်ခံ',
    bgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '5000K Soft Daylight',
    promptSnippet: 'historic 1920s Yangon colonial heritage building balcony, grand arched columns, vintage checkerboard tile flooring, lush tropical palm greenery outside'
  },

  // 5. Festivals & Cyberpunk Atmosphere
  {
    id: 'cyberpunk-thingyan-neon',
    nameEn: 'Cyberpunk Thingyan Water Splashes',
    nameMm: 'ဆိုက်ဘာပန့်ခ် သင်္ကြန် နီယွန်ရေစင်',
    category: 'festivals',
    categoryLabelEn: 'Festivals & Neon',
    categoryLabelMm: 'ပွဲတော်နှင့် နီယွန်',
    bgUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 60,
    colorTemp: '6500K Neon Cyan & Magenta',
    promptSnippet: 'futuristic cyberpunk Thingyan water festival night celebration, glowing neon water droplets frozen in mid-air, vibrant cyan and magenta backlighting, holographic Padauk flowers'
  },
  {
    id: 'taunggyi-fire-balloon-night',
    nameEn: 'Taunggyi Tazaungdaing Fire Balloons',
    nameMm: 'တောင်ကြီး မီးပုံးပျံပွဲတော် ညကောင်းကင်',
    category: 'festivals',
    categoryLabelEn: 'Festivals & Neon',
    categoryLabelMm: 'ပွဲတော်နှင့် နီယွန်',
    bgUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '2600K Sparkler Amber',
    promptSnippet: 'spectacular night sky filled with illuminated traditional hot air fire balloons and trailing candle fireworks at Taunggyi Tazaungdaing, ambient warm crowd glow'
  },
  {
    id: 'candlelight-festival-glow',
    nameEn: 'Bagan 1,000 Candlelight Sanctuary',
    nameMm: 'ပုဂံ ဆီမီးတစ်ထောင် ပွဲတော်အလင်း',
    category: 'festivals',
    categoryLabelEn: 'Festivals & Neon',
    categoryLabelMm: 'ပွဲတော်နှင့် နီယွန်',
    bgUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 30,
    colorTemp: '2200K Intimate Candle Warmth',
    promptSnippet: 'sacred temple corridor adorned with hundreds of glowing terracotta oil lamps and beeswax candles, golden bokeh reflections, serene spiritual atmosphere'
  },

  // 6. Nature & Highlands
  {
    id: 'shan-pine-highlands',
    nameEn: 'Misty Shan Pine Highland Forest',
    nameMm: 'ရှမ်းပြည်နယ် ထင်းရှူးတော မြူခိုး',
    category: 'nature',
    categoryLabelEn: 'Nature & Highlands',
    categoryLabelMm: 'သဘာဝရှုခင်း',
    bgUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 55,
    colorTemp: '5300K Morning Mountain Sun',
    promptSnippet: 'scenic Shan state mountain pine forest bathed in soft morning sunbeams piercing morning mist, dew-kissed emerald moss and wildflowers'
  },
  {
    id: 'mergui-turquoise-arch',
    nameEn: 'Mergui Tropical Turquoise Beach',
    nameMm: 'မြိတ်ကျွန်းစု ကြည်လင်သော ပင်လယ်ကမ်းခြေ',
    category: 'nature',
    categoryLabelEn: 'Nature & Highlands',
    categoryLabelMm: 'သဘာဝရှုခင်း',
    bgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    defaultLightAngle: 45,
    colorTemp: '5800K Tropical Sun',
    promptSnippet: 'pristine white sand beach in the Mergui Archipelago, crystal clear turquoise water, limestone sea karst arch in soft background haze, gentle tropical breeze'
  }
];

const SUBJECT_PRESETS = [
  {
    id: 'sub-bagan-lady',
    title: 'Bagan Royal Lady',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub-mandalay-gentleman',
    title: 'Mandalay Gentleman',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub-yangon-editorial',
    title: 'Modern Yangon Model',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sub-shan-maiden',
    title: 'Shan Highland Maiden',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  }
];

export const CompositeHarmonizerStudio: React.FC<CompositeHarmonizerStudioProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  // Category Filter State
  const [activeCategory, setActiveCategory] = useState<BackdropCategory>('all');
  const [selectedBackdrop, setSelectedBackdrop] = useState<BackdropPreset>(BACKDROP_PRESETS[0]);
  const [customBackdropPhoto, setCustomBackdropPhoto] = useState<string | null>(null);

  // Subject State
  const [subjectImage, setSubjectImage] = useState<string>(SUBJECT_PRESETS[0].url);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(SUBJECT_PRESETS[0].id);

  // Settings State
  const [harmonizeMode, setHarmonizeMode] = useState<HarmonizeMode>('cinematic-relight');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedPreviewResult, setGeneratedPreviewResult] = useState<string | null>(null);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Harmonizer Physics Controls
  const [contactShadowIntensity, setContactShadowIntensity] = useState<number>(85); // 0-100%
  const [shadowBlurRadius, setShadowBlurRadius] = useState<number>(14); // px
  const [shadowAngle, setShadowAngle] = useState<number>(45); // degrees
  const [ambientLightWrap, setAmbientLightWrap] = useState<number>(70); // %
  const [edgeFringeCleanup, setEdgeFringeCleanup] = useState<number>(80); // %
  const [identityGuard, setIdentityGuard] = useState<boolean>(true);

  // Refs for File Uploads
  const subjectFileInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    if (activeCategory === 'all') return BACKDROP_PRESETS;
    return BACKDROP_PRESETS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  // Current Active Backdrop Image URL
  const activeBackdropUrl = customBackdropPhoto || selectedBackdrop.bgUrl;

  const handleSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSubjectImage(event.target.result as string);
          setSelectedSubjectId('custom');
          showToast(isMm ? 'လူပုံတင်ပြီးပါပြီ' : 'Subject photo updated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setCustomBackdropPhoto(url);
          showToast(isMm ? 'နောက်ခံပုံအသစ် တင်ပြီးပါပြီ' : 'Custom background loaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Harmonized Prompt
  const generatedCompositePrompt = useMemo(() => {
    const modeDescriptions: Record<HarmonizeMode, string> = {
      'cinematic-relight': 'cinematic relighting recalculating key and fill ratios, volumetric atmosphere matching background luminance, dramatic directional rim lighting',
      'studio-cleanup': 'clean studio composite, refined high-frequency edge matting, spotless neutral backdrop integration, balanced soft beauty light',
      'soft-studio': 'soft diffused studio lighting, gentle wrap-around key light matching environment Kelvin temperature, natural skin translucency',
      'dreamy-pastel': 'dreamy ethereal pastel atmosphere, gentle glow light leak, high-key warm ambient fill, soft contrast',
      'golden-rim': 'intense golden hour rim light tracing hair and shoulders, warm ambient bounce light from ground plane, twilight mood',
      'moody-fine-art': 'fine-art painterly chiaroscuro, deep rich shadows with preserved details, single directional window light'
    };

    const shadowNote = `photorealistic contact ground occlusion shadow (intensity ${contactShadowIntensity}%, blur ${shadowBlurRadius}px, angle ${shadowAngle}°), eliminating floating artifact with grounded footprint`;
    const edgeNote = `sub-pixel alpha edge blend, anti-fringe green/white spill decontamination (${edgeFringeCleanup}% threshold), hair strand light wrap (${ambientLightWrap}%)`;
    const identityNote = identityGuard ? 'strict 100% facial identity preservation, identical facial bone structure and gaze locked' : 'harmonized facial tone';
    const bgName = customBackdropPhoto ? 'custom user environment plate' : selectedBackdrop.nameEn;
    const bgDetails = customBackdropPhoto ? 'photorealistic environment integration' : selectedBackdrop.promptSnippet;
    const colorTemp = customBackdropPhoto ? 'calibrated daylight' : selectedBackdrop.colorTemp;

    return `Professional composite photograph harmonizer, seamless subject-to-background replacement in ${bgName}, ${modeDescriptions[harmonizeMode]}, ${bgDetails}, ${shadowNote}, ${edgeNote}, ${identityNote}, color temperature calibrated to ${colorTemp}, shot on Hasselblad X2D 100C with 85mm f/1.4 lens, optical depth of field with realistic background bokeh --ar 4:5 --style raw --v 6.1`;
  }, [
    selectedBackdrop,
    customBackdropPhoto,
    harmonizeMode,
    contactShadowIntensity,
    shadowBlurRadius,
    shadowAngle,
    ambientLightWrap,
    edgeFringeCleanup,
    identityGuard
  ]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedCompositePrompt);
    setIsCopied(true);
    showToast(isMm ? 'Prompt ကို ကော်ပီကူးယူပြီးပါပြီ!' : 'Master Prompt copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Direct AI Image Generation
  const handleGenerateAIComposite = async () => {
    setIsGeneratingImage(true);
    showToast(isMm ? 'AI ဖြင့် နောက်ခံလဲလှယ်ခြင်း စတင်နေပါသည်...' : 'Generating composite with AI...');
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatedCompositePrompt,
          aspectRatio: '4:5',
          referenceImage: subjectImage
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.imageUrl) {
          setGeneratedPreviewResult(data.imageUrl);
          showToast(isMm ? 'နောက်ခံ အောင်မြင်စွာ လဲလှယ်ပြီးပါပြီ!' : 'Background change rendered successfully!');
        }
      }
    } catch (err) {
      console.warn('AI Composite generation fallback', err);
      showToast(isMm ? 'Prompt ကို အသုံးပြုနိုင်ပါသည်' : 'Ready! Use Prompt in Midjourney or Flux');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 relative">
      
      {/* Toast Alert */}
      {quickToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1c1c1e] text-[#ffd02f] border border-[#ffd02f]/40 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{quickToast}</span>
        </div>
      )}

      {/* 🌟 1. Header Bar with Miro Badges */}
      <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xl shadow-xs border border-[#fcb900]/40">
            <span className="material-symbols-outlined text-[24px]">wallpaper</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-extrabold text-[#1c1c1e] tracking-tight">
                {isMm ? 'Background Changer & Scene Replacement' : 'Background Changer & Scene Replacement'}
              </h1>
              <span className="bg-[#1c1c1e] text-[#ffd02f] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {BACKDROP_PRESETS.length} Curated Presets
              </span>
            </div>
            <p className="font-sans text-xs text-[#6b6f7e]">
              {isMm
                ? 'နောက်ခံရှုခင်း အစားထိုးခြင်း၊ ရိုးရာရှုခင်းနှင့် စတူဒီယို Preset များ၊ မြေပြင်အရိပ် (Contact Shadows) နှင့် အလင်းအဖွဲ့အစည်း ပေါင်းစပ်မှု'
                : 'Seamless Background Replacement with Curated Presets, Ground Contact Shadows & Ambient Relighting'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateAIComposite}
            disabled={isGeneratingImage}
            className="flex items-center gap-2 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] px-4 py-2 rounded-full font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer border border-[#fcb900]/50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isGeneratingImage ? 'animate-spin' : ''}`}>
              {isGeneratingImage ? 'sync' : 'auto_fix_high'}
            </span>
            <span>
              {isGeneratingImage
                ? (isMm ? 'ထုတ်လုပ်နေသည်...' : 'Generating...')
                : (isMm ? 'AI ဖြင့် နောက်ခံလဲမည်' : 'Render Background Swap')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 bg-[#1c1c1e] hover:bg-black text-white px-3.5 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isCopied ? 'check' : 'content_copy'}
            </span>
            <span>{isCopied ? (isMm ? 'ကူးပြီးပြီ' : 'Copied') : (isMm ? 'Prompt ကူးယူမည်' : 'Copy Prompt')}</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', labelEn: 'All Presets', labelMm: 'အားလုံး' },
          { id: 'heritage', labelEn: 'Bagan & Landmarks', labelMm: 'ပုဂံနှင့် သမိုင်းဝင်အမွေအနှစ်' },
          { id: 'royal', labelEn: 'Royal Architecture', labelMm: 'နန်းတွင်းနှင့် ရိုးရာခန်းမ' },
          { id: 'studio', labelEn: 'Studio Cyclorama', labelMm: 'စတူဒီယို ကင်းဗတ်' },
          { id: 'modern', labelEn: 'Modern Luxury', labelMm: 'ခေတ်မီ မိုးမျှော်တိုက်' },
          { id: 'festivals', labelEn: 'Festivals & Neon', labelMm: 'ပွဲတော်နှင့် နီယွန်' },
          { id: 'nature', labelEn: 'Highlands & Ocean', labelMm: 'သဘာဝ တောင်တန်း/ပင်လယ်' }
        ].map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as BackdropCategory)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#1c1c1e] text-white shadow-xs'
                  : 'bg-white text-[#555a6a] border border-[#e0e2e8] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'
              }`}
            >
              {isMm ? cat.labelMm : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* 🌟 3. Main Studio Grid: Left Controls (5 Cols) + Right Interactive Canvas (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Controls & Presets (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Card 1: Subject Source & Identity Lock */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#4262ff]">person</span>
                {isMm ? '၁။ Subject ရွေးချယ်ခြင်း' : '1. Subject Source & Likeness'}
              </span>
              <span className="text-[10px] bg-[#c3faf5] text-[#187574] px-2 py-0.5 rounded-full font-bold">
                Identity Guard 100%
              </span>
            </div>

            {/* Subject Presets Row */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUBJECT_PRESETS.map((sub) => {
                const isSelected = selectedSubjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setSubjectImage(sub.url);
                    }}
                    className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-[#1c1c1e] bg-[#f7f8fa] ring-2 ring-[#ffd02f]'
                        : 'border-[#e0e2e8] bg-white hover:bg-[#fafbfc]'
                    }`}
                  >
                    <img src={sub.url} alt={sub.title} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-[11px] font-bold text-[#1c1c1e]">{sub.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Upload Option */}
            <div className="flex items-center justify-between pt-1 border-t border-[#f0f2f5]">
              <span className="text-xs text-[#555a6a] font-medium">
                {isMm ? 'ကိုယ်ပိုင်ပုံ တင်လိုပါက:' : 'Or use your own portrait:'}
              </span>
              <input
                type="file"
                ref={subjectFileInputRef}
                onChange={handleSubjectUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => subjectFileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#e0e2e8] px-3 py-1 rounded-full cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">upload</span>
                <span>{isMm ? 'ပုံတင်မည်' : 'Upload Image'}</span>
              </button>
            </div>

            {/* Identity Guard Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#00b473]">verified_user</span>
                <span className="text-xs font-bold text-[#1c1c1e]">
                  {isMm ? 'Identity Guard (မျက်နှာပုံစံ မူရင်းအတိုင်း ၁၀၀% ထိန်းရန်)' : 'Lock Facial Likeness 100%'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={identityGuard}
                onChange={(e) => setIdentityGuard(e.target.checked)}
                className="w-4 h-4 text-[#ffd02f] rounded border-gray-300 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Card 2: Environment / Backdrop Presets Gallery */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">wallpaper</span>
                {isMm ? '၂။ နောက်ခံ Presets ရွေးချယ်ရန်' : '2. Target Background Presets'}
              </span>
              <span className="text-[10px] text-[#6b6f7e] font-semibold">
                {filteredPresets.length} {isMm ? 'ခု ရှိသည်' : 'Available'}
              </span>
            </div>

            {/* Upload Custom Background Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fffdf0] border border-[#ffd02f]/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#fcb900]">add_photo_alternate</span>
                <span className="text-xs font-bold text-[#1c1c1e]">
                  {customBackdropPhoto
                    ? (isMm ? 'ကိုယ်ပိုင်နောက်ခံ အသုံးပြုနေပါသည်' : 'Using Custom Background')
                    : (isMm ? 'ကိုယ်ပိုင် နောက်ခံဓာတ်ပုံ တင်မလား?' : 'Upload Custom Scenery?')}
                </span>
              </div>
              <input
                type="file"
                ref={customBgInputRef}
                onChange={handleCustomBgUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-1.5">
                {customBackdropPhoto && (
                  <button
                    type="button"
                    onClick={() => setCustomBackdropPhoto(null)}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    {isMm ? 'Preset သို့ ပြန်ပြောင်း' : 'Reset'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => customBgInputRef.current?.click()}
                  className="text-xs font-bold text-[#1c1c1e] bg-white hover:bg-neutral-100 border border-[#e0e2e8] px-3 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
                >
                  {isMm ? 'တင်မည်' : 'Upload'}
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredPresets.map((bp) => {
                const isSelected = !customBackdropPhoto && selectedBackdrop.id === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => {
                      setCustomBackdropPhoto(null);
                      setSelectedBackdrop(bp);
                    }}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-[#1c1c1e] bg-[#f7f8fa] shadow-2xs ring-2 ring-[#ffd02f]'
                        : 'border-[#e0e2e8] hover:border-[#b0b4be] bg-white'
                    }`}
                  >
                    <div className="relative w-full h-20 rounded-lg overflow-hidden bg-neutral-200">
                      <img
                        src={bp.bgUrl}
                        alt={bp.nameEn}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                        {isMm ? bp.categoryLabelMm : bp.categoryLabelEn}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1c1c1e] line-clamp-1">
                        {isMm ? bp.nameMm : bp.nameEn}
                      </p>
                      <span className="text-[10px] text-[#6b6f7e] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fcb900]"></span>
                        {bp.colorTemp}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Relighting & Harmonizer Modes */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00b473]">wb_sunny</span>
              {isMm ? '၃။ Relighting & Lighting Mode' : '3. Harmonize & Relighting Mode'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'cinematic-relight', labelEn: 'Cinematic Relight', labelMm: 'ရုပ်ရှင်အလင်း', icon: 'movie' },
                { id: 'studio-cleanup', labelEn: 'Studio Cleanup', labelMm: 'စတူဒီယို သန့်စင်', icon: 'cleaning_services' },
                { id: 'soft-studio', labelEn: 'Soft Studio', labelMm: 'နူးညံ့သော အလင်း', icon: 'flare' },
                { id: 'dreamy-pastel', labelEn: 'Dreamy Pastel', labelMm: 'ပတ်စတယ် ပျော့ပြောင်း', icon: 'filter_drama' },
                { id: 'golden-rim', labelEn: 'Golden Rim', labelMm: 'ရွှေရောင် အနားသတ်', icon: 'wb_twilight' },
                { id: 'moody-fine-art', labelEn: 'Moody Fine-Art', labelMm: 'အနုပညာ အမှောင်ဆန်', icon: 'palette' }
              ].map((m) => {
                const isSelected = harmonizeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setHarmonizeMode(m.id as HarmonizeMode)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1c1e] text-white border-[#1c1c1e] font-semibold shadow-xs'
                        : 'bg-white text-[#1c1c1e] border-[#e0e2e8] hover:bg-[#f7f8fa]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#ffd02f]' : 'text-[#6b6f7e]'}`}>
                      {m.icon}
                    </span>
                    <span className="text-[11px] leading-tight font-medium">
                      {isMm ? m.labelMm : m.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Physics & Contact Shadows Sliders */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#fcb900]">blur_on</span>
                {isMm ? '၄။ Ground Contact Shadows (မြေပြင်အရိပ် အနုစိတ်)' : '4. Ground Contact Shadows Physics'}
              </span>
              <span className="text-[10px] bg-[#fff8e0] text-[#746019] px-2 py-0.5 rounded-full font-bold">
                Anti-Floating
              </span>
            </div>

            {/* Slider 1: Shadow Intensity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#555a6a] font-medium">
                  {isMm ? 'ခြေထောက်/မြေပြင် ထိတွေ့အရိပ် (Occlusion)' : 'Contact Occlusion Footprint'}
                </span>
                <span className="font-bold text-[#1c1c1e]">{contactShadowIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={contactShadowIntensity}
                onChange={(e) => setContactShadowIntensity(Number(e.target.value))}
                className="w-full accent-[#1c1c1e] cursor-pointer"
              />
            </div>

            {/* Slider 2: Soft Falloff Blur */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#555a6a] font-medium">
                  {isMm ? 'အရိပ်ပျံ့နှံ့မှု အနားသတ် (Blur Radius)' : 'Soft Ambient Blur Radius'}
                </span>
                <span className="font-bold text-[#1c1c1e]">{shadowBlurRadius} px</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={shadowBlurRadius}
                onChange={(e) => setShadowBlurRadius(Number(e.target.value))}
                className="w-full accent-[#1c1c1e] cursor-pointer"
              />
            </div>

            {/* Slider 3: Light Wrap & Fringe */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#555a6a] font-medium">
                  {isMm ? 'ဆံပင်နှင့် အနားသတ် Light Wrap' : 'Edge Light Wrap & De-fringe'}
                </span>
                <span className="font-bold text-[#1c1c1e]">{ambientLightWrap}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientLightWrap}
                onChange={(e) => setAmbientLightWrap(Number(e.target.value))}
                className="w-full accent-[#1c1c1e] cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Before/After Split Canvas & Prompt Output (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Visual Canvas with Split Slider */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00b473]"></span>
                <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider">
                  {isMm ? 'Live Background Harmonizer Split Screen' : 'Live Background Harmonizer Preview'}
                </span>
              </div>
              <span className="text-[11px] text-[#6b6f7e] font-medium">
                {isMm ? 'ဆွဲပြီး မူရင်းနှင့် နောက်ခံသစ် နှိုင်းယှဉ်ပါ' : 'Drag slider to compare raw vs new background'}
              </span>
            </div>

            {/* Interactive Split Viewer Container */}
            <div className="relative w-full h-96 sm:h-[480px] rounded-xl overflow-hidden bg-neutral-900 select-none group border border-[#e0e2e8]">
              
              {/* Layer 1: BEFORE (Subject cutout on plain background) */}
              <div className="absolute inset-0">
                <img
                  src={subjectImage}
                  alt="Original Subject"
                  className="w-full h-full object-cover filter contrast-90"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Before: Raw Cutout
                </div>
              </div>

              {/* Layer 2: AFTER (Full Harmonized Composite with Background, Contact Shadow, and Relighting) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                <div className="relative w-full h-full">
                  {/* Backdrop Background */}
                  <img
                    src={activeBackdropUrl}
                    alt="Backdrop"
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  {/* Subject layered on top with simulated ambient relight and ground shadow */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-4/5 h-4/5 flex items-end justify-center">
                      {/* Simulated Ground Contact Shadow */}
                      <div
                        className="absolute bottom-2 w-48 h-6 bg-black rounded-full pointer-events-none transition-all"
                        style={{
                          opacity: contactShadowIntensity / 100,
                          filter: `blur(${shadowBlurRadius}px)`,
                          transform: `scaleX(1.4) skewX(${shadowAngle - 45}deg)`
                        }}
                      />
                      {/* Subject with light wrap filter */}
                      <img
                        src={subjectImage}
                        alt="Harmonized Subject"
                        className="w-full h-full object-contain filter drop-shadow-md"
                        style={{
                          filter:
                            harmonizeMode === 'golden-rim'
                              ? 'sepia(0.2) saturate(1.2) drop-shadow(0 0 8px rgba(255,180,50,0.4))'
                              : harmonizeMode === 'dreamy-pastel'
                              ? 'brightness(1.05) contrast(0.95)'
                              : 'contrast(1.05)'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  After: Harmonized
                </div>
              </div>

              {/* Split Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-md"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-[#1c1c1e]">
                  <span className="material-symbols-outlined text-[16px]">code</span>
                </div>
              </div>

              {/* Slider Touch Overlay */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                title="Drag to compare"
              />
            </div>

            {/* Quick status bar */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#6b6f7e] pt-1">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#00b473]">check_circle</span>
                Footprint Occlusion: Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#4262ff]">wb_twilight</span>
                Color Balance: {selectedBackdrop.colorTemp}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#fcb900]">camera</span>
                Hasselblad 85mm f/1.4
              </span>
            </div>
          </div>

          {/* AI Rendered Result Preview Card (if generated) */}
          {generatedPreviewResult && (
            <div className="bg-[#1c1c1e] text-white rounded-2xl p-5 border border-[#ffd02f]/40 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">auto_awesome</span>
                  <span className="font-sans text-xs uppercase font-extrabold text-[#ffd02f] tracking-wider">
                    {isMm ? 'AI နောက်ခံ အသစ်ဖြင့် ထုတ်လုပ်ထားသော ပုံရိပ်' : 'AI Rendered Background Result'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedPreviewResult(null)}
                  className="text-white/60 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="w-full h-80 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={generatedPreviewResult}
                  alt="Rendered Composite"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Master Prompt Output Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#ffd02f]/20 text-[#1c1c1e] flex items-center justify-center font-bold text-xs">
                  MJ
                </div>
                <div>
                  <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider">
                    {isMm ? 'နောက်ခံပြောင်းလဲခြင်း Master Prompt' : 'Master Background Swap Prompt'}
                  </span>
                  <span className="text-[10px] text-[#6b6f7e] ml-2 font-mono">
                    Midjourney v6.1 / Flux.1
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSendToMatrix && onSendToMatrix(generatedCompositePrompt)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#4262ff] bg-[#4262ff]/10 hover:bg-[#4262ff]/20 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>{isMm ? 'Matrix သို့ ပို့မည်' : 'Send to Matrix'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#1c1c1e] bg-[#ffd02f] hover:bg-[#fcb900] px-3.5 py-1.5 rounded-full cursor-pointer transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                  <span>{isCopied ? (isMm ? 'ကူးပြီး' : 'Copied') : (isMm ? 'Copy' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Prompt Text Box */}
            <div className="bg-[#f7f8fa] p-4 rounded-xl border border-[#e0e2e8] font-mono text-xs text-[#1c1c1e] leading-relaxed select-all">
              {generatedCompositePrompt}
            </div>

            {/* Negative Prompt */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f0f2f5]">
              <span className="font-sans text-[11px] font-extrabold text-[#e02e2e] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">block</span>
                {isMm ? 'Negative Exclusion Guard (မလိုလားအပ်သော အရာများ ဖယ်ရှားရန်)' : 'Negative Exclusion Guard'}
              </span>
              <p className="font-mono text-[11px] text-[#6b6f7e] bg-red-50/50 p-2.5 rounded-lg border border-red-100 select-all">
                --no floating subject, disconnected ground shadow, harsh green fringe, halo around hair, mismatched lighting angles, flat cutout look, cartoonish, plastic skin, distorted anatomy, blurry edges
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
