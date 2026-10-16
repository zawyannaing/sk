import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Language } from '../types';

interface PhotoManipulationStudioProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

export type ManipulationCategory = 'fantasy' | 'cinematic' | 'burmese_fusion' | 'painterly';

export interface ManipulationPreset {
  id: string;
  category: ManipulationCategory;
  nameEn: string;
  nameMm: string;
  taglineEn: string;
  taglineMm: string;
  icon: string;
  badge: string;
  badgeColor: string;
  previewGradient: string;
  previewThumbnail: string;
  promptDescription: string;
  settings: {
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number; // -50 to 50
    hueRotate: number; // 0 to 360
    vignette: number; // 0 to 1
    grain: number; // 0 to 1
    bloom: boolean;
    chromaticAberration: boolean;
    particles: 'none' | 'gold_sparks' | 'cosmic_stars' | 'lotus_petals' | 'mist';
    overlayBlend: 'none' | 'double_exposure' | 'gold_leaf' | 'cyber_neon' | 'watercolor' | 'sun_flare';
    styleStrength: number; // 0 to 100
  };
}

const MANIPULATION_PRESETS: ManipulationPreset[] = [
  // --- FANTASY & SURREAL ---
  {
    id: 'celestial-galaxy',
    category: 'fantasy',
    nameEn: 'Celestial Galaxy Aura',
    nameMm: 'စကြဝဠာ ဂလက်ဆီ ကြယ်စင်ရောင်စဉ်',
    taglineEn: 'Deep cosmic starlight, nebula clouds, and luminous aura',
    taglineMm: 'စကြဝဠာ ဂလက်ဆီ တိမ်တိုက်များနှင့် နတ်ဘုံအလင်းရောင် အသွင်ပြောင်းခြင်း',
    icon: 'auto_awesome',
    badge: 'Cosmic Art',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    previewGradient: 'from-indigo-900 via-purple-900 to-pink-900',
    previewThumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Surreal fantasy photo manipulation, ethereal celestial galaxy aura, glowing cosmic nebula mist surrounding subject, floating starlight specks, deep violet and cyan cinematic rim lighting, dreamscape double exposure, ultra-high dynamic range, 8k masterpiece',
    settings: {
      brightness: 5,
      contrast: 24,
      saturation: 35,
      warmth: -20,
      hueRotate: 260,
      vignette: 0.45,
      grain: 0.15,
      bloom: true,
      chromaticAberration: true,
      particles: 'cosmic_stars',
      overlayBlend: 'double_exposure',
      styleStrength: 85
    }
  },
  {
    id: 'bagan-double-exposure',
    category: 'fantasy',
    nameEn: 'Bagan Silhouette Double Exposure',
    nameMm: 'ပုဂံရှေးဟောင်း စေတီပုထိုး Double Exposure',
    taglineEn: 'Merged silhouette with ancient Bagan pagodas at golden sunset',
    taglineMm: 'နေဝင်ဆည်းဆာ ပုဂံစေတီများနှင့် ဓာတ်ပုံ ပေါင်းစပ်အနုပညာ',
    icon: 'filter_b_and_w',
    badge: 'Heritage Surreal',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    previewGradient: 'from-amber-800 via-orange-900 to-stone-900',
    previewThumbnail: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Fine-art double exposure photo manipulation, portrait blended with ancient Bagan pagoda silhouette at misty sunrise, hot air balloons drifting in sunset orange sky, layered transparency, contemplative poetic atmosphere, dramatic contrast, gallery artwork',
    settings: {
      brightness: -5,
      contrast: 35,
      saturation: 25,
      warmth: 40,
      hueRotate: 25,
      vignette: 0.4,
      grain: 0.2,
      bloom: true,
      chromaticAberration: false,
      particles: 'mist',
      overlayBlend: 'double_exposure',
      styleStrength: 90
    }
  },
  {
    id: 'ethereal-golden-spirit',
    category: 'fantasy',
    nameEn: 'Ethereal Divine Golden Light',
    nameMm: 'ရွှေရောင် တန်းခိုးတော် နတ်ဘုံအလင်းတန်း',
    taglineEn: 'Sacred glowing lotus embers, divine god-rays, and warm luminescence',
    taglineMm: 'မြင့်မြတ်သော ရွှေရောင်အလင်းတန်းများနှင့် ကြာပွင့်မီးပွားများ လွင့်ဝဲမှု',
    icon: 'flare',
    badge: 'Divine Glow',
    badgeColor: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    previewGradient: 'from-amber-600 via-yellow-600 to-stone-900',
    previewThumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Surreal divine light photo manipulation, sacred golden god rays piercing through misty atmosphere, ethereal golden embers and floating lotus petals dancing around subject, warm holy aura, majestic spiritual mood, soft diffusion bloom, hyper-realistic detail',
    settings: {
      brightness: 12,
      contrast: 18,
      saturation: 20,
      warmth: 45,
      hueRotate: 38,
      vignette: 0.3,
      grain: 0.1,
      bloom: true,
      chromaticAberration: false,
      particles: 'lotus_petals',
      overlayBlend: 'sun_flare',
      styleStrength: 80
    }
  },

  // --- CINEMATIC & SCI-FI ---
  {
    id: 'cyberpunk-neon-noir',
    category: 'cinematic',
    nameEn: 'Cyberpunk Neon Noir & Glitch',
    nameMm: 'ဆိုင်ဘာပန့်ခ် နီယွန်ရောင်စုံနှင့် Glitch FX',
    taglineEn: 'Vibrant cyan-magenta rim light, glitch chromatic RGB split, and rainy reflections',
    taglineMm: 'ခေတ်လွန် ဆိုင်ဘာနီယွန် ရောင်ပြေး၊ မိုးစက်အလင်းနှင့် ခေတ်မီ Glitch အသွင်',
    icon: 'electric_bolt',
    badge: 'Neo Cyber',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    previewGradient: 'from-cyan-900 via-purple-950 to-pink-900',
    previewThumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Cinematic cyberpunk photo manipulation, high-contrast neo-tokyo neon lighting, electric cyan and magenta rim light, subtle holographic chromatic aberration and scanline glitch, rainy asphalt reflections, moody futuristic atmosphere, 8k cinematic still',
    settings: {
      brightness: 2,
      contrast: 32,
      saturation: 45,
      warmth: -30,
      hueRotate: 310,
      vignette: 0.5,
      grain: 0.25,
      bloom: true,
      chromaticAberration: true,
      particles: 'gold_sparks',
      overlayBlend: 'cyber_neon',
      styleStrength: 90
    }
  },
  {
    id: 'blade-runner-amber-haze',
    category: 'cinematic',
    nameEn: 'Blade Runner Amber Dune',
    nameMm: 'Blade Runner လိမ္မော်ရောင် ဖုန်မှုန့်ဆည်းဆာ',
    taglineEn: 'Monochromatic warm orange atmosphere, dense volumetric dust, anamorphic flare',
    taglineMm: 'ရုပ်ရှင်ဆန်သော လိမ္မော်ရောင် ဖုန်မှုန့် အလင်းတန်းနှင့် ရွှေရောင်ဆည်းဆာ',
    icon: 'wb_sunny',
    badge: 'Anamorphic',
    badgeColor: 'bg-orange-100 text-orange-950 border-orange-300',
    previewGradient: 'from-orange-800 via-amber-900 to-black',
    previewThumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Blade Runner 2049 aesthetic photo manipulation, moody monochromatic orange and amber atmospheric haze, dense volumetric sand dust particles, horizontal anamorphic flare, deep silhouetted contrast, desolate neo-noir cinematic cinematography, 35mm film grain',
    settings: {
      brightness: -4,
      contrast: 28,
      saturation: 15,
      warmth: 50,
      hueRotate: 20,
      vignette: 0.45,
      grain: 0.35,
      bloom: true,
      chromaticAberration: false,
      particles: 'mist',
      overlayBlend: 'sun_flare',
      styleStrength: 85
    }
  },
  {
    id: 'vintage-film-halation-1970',
    category: 'cinematic',
    nameEn: '1970s Analog Film & Red Halation',
    nameMm: '၁၉၇၀ ခုနှစ် ဖလင်ဟောင်းနှင့် အနီရောင် Halation',
    taglineEn: 'Authentic 35mm film grain, warm red fringe on highlights, retro pastel patina',
    taglineMm: 'ခေတ်ဟောင်း ၃၅မမ ဖလင်စစ်စစ် အရည်အသွေး၊ အလင်းပတ်လည် အနီရောင်ပြေးမှု',
    icon: 'camera_roll',
    badge: '35mm Film',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    previewGradient: 'from-stone-800 via-amber-950 to-rose-950',
    previewThumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Vintage 1970s 35mm analog photograph manipulation, Kodak Vision3 aesthetic, soft red halation glow wrapping around highlights, natural organic film grain and subtle scratches, lifted matte shadows, timeless nostalgic color science',
    settings: {
      brightness: 6,
      contrast: 15,
      saturation: 10,
      warmth: 25,
      hueRotate: 12,
      vignette: 0.35,
      grain: 0.4,
      bloom: true,
      chromaticAberration: false,
      particles: 'none',
      overlayBlend: 'none',
      styleStrength: 75
    }
  },

  // --- BURMESE FUSION ---
  {
    id: 'shwe-cha-gold-leaf',
    category: 'burmese_fusion',
    nameEn: 'Shwe-Cha 24K Gold Leaf Inlay',
    nameMm: 'ရွှေချ ရွှေဆိုင်းနှင့် ရှေးဟောင်း သစ်စေးအနုပညာ',
    taglineEn: 'Authentic flaked 24K gold foil, cinnabar lacquer, and royal Bagan patina',
    taglineMm: 'မြန်မာ့ရိုးရာ ရွှေဆိုင်း ကပ်သွင်းမှု၊ ဟင်္သာပြဒါး အနီရောင်နှင့် ရှေးဟောင်းအနုပညာ',
    icon: 'workspace_premium',
    badge: '24K Gold',
    badgeColor: 'bg-[#ffd02f]/30 text-amber-900 border-[#fcb900]/50',
    previewGradient: 'from-amber-600 via-yellow-700 to-stone-950',
    previewThumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Traditional Burmese Shwe-Cha photo manipulation, flakes of real 24k gold leaf organically applied to contours, deep cinnabar red and black lacquerware texture, antique Bagan temple mural cracked patina, imperial Burmese royalty prestige, golden illumination',
    settings: {
      brightness: 4,
      contrast: 30,
      saturation: 28,
      warmth: 48,
      hueRotate: 42,
      vignette: 0.4,
      grain: 0.25,
      bloom: true,
      chromaticAberration: false,
      particles: 'gold_sparks',
      overlayBlend: 'gold_leaf',
      styleStrength: 90
    }
  },
  {
    id: 'thanaka-bloom-aura',
    category: 'burmese_fusion',
    nameEn: 'Thanaka Botanical Aura',
    nameMm: 'သဘာဝ သနပ်ခါး အလှနှင့် ပန်းမိုးရေစက်',
    taglineEn: 'Soft bark texture, warm golden Burmese skin tone, water droplet dew',
    taglineMm: 'သနပ်ခါးလိမ်းသွင်ပြင်၊ နူးညံ့သောအသားအရေနှင့် ရေစက်ပန်းဖူး အလှဆင်ခြင်း',
    icon: 'spa',
    badge: 'Herbal Dew',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    previewGradient: 'from-emerald-900 via-stone-800 to-amber-950',
    previewThumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'High-end beauty photo manipulation, delicate traditional Burmese Thanaka bark contouring on cheekbones, micro-droplets of morning dew, soft natural warm sunlight through teak window, blooming jasmine flower petals floating in gentle breeze, flawless organic texture',
    settings: {
      brightness: 8,
      contrast: 16,
      saturation: 15,
      warmth: 28,
      hueRotate: 30,
      vignette: 0.25,
      grain: 0.1,
      bloom: true,
      chromaticAberration: false,
      particles: 'lotus_petals',
      overlayBlend: 'none',
      styleStrength: 75
    }
  },

  // --- PAINTERLY & ARTISTIC ---
  {
    id: 'oil-painting-impasto',
    category: 'painterly',
    nameEn: 'Masterpiece Oil Impasto',
    nameMm: 'ဆီဆေးပန်းချီ အနုပညာနှင့် စုတ်ချက်ကြမ်း',
    taglineEn: 'Rich palette knife oil strokes, heavy canvas texture, chiaroscuro lighting',
    taglineMm: 'ဆီဆေးစုတ်ချက် အဖုအထစ်များ၊ ပတ္တူစနှင့် ဂန္ထဝင်ပန်းချီစတိုင်',
    icon: 'brush',
    badge: 'Impasto Oil',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    previewGradient: 'from-amber-900 via-stone-900 to-blue-950',
    previewThumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Impasto master oil painting photo manipulation, thick buttery brush strokes, rich tactile canvas weave texture, dramatic Rembrandt lighting, vibrant pigment blending, artistic portrait by modern renaissance master, museum quality masterpiece',
    settings: {
      brightness: 0,
      contrast: 35,
      saturation: 30,
      warmth: 20,
      hueRotate: 15,
      vignette: 0.45,
      grain: 0.4,
      bloom: false,
      chromaticAberration: false,
      particles: 'none',
      overlayBlend: 'none',
      styleStrength: 85
    }
  },
  {
    id: 'watercolor-splash-bleed',
    category: 'painterly',
    nameEn: 'Watercolor Splash & Ink Bleed',
    nameMm: 'ရေဆေးပန်းချီ ဆေးပျံ့စီးဆင်းမှု အနုပညာ',
    taglineEn: 'Fluid blooming pigments, rough cold-pressed paper, delicate ink splatters',
    taglineMm: 'ရေဆေးရည် ပျံ့လွင့်ခြင်း၊ စက္ကူကြမ်းသားနှင့် မင်ရည်စက် ပန်းချီဆန်သော အသွင်',
    icon: 'water_drop',
    badge: 'Watercolor',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    previewGradient: 'from-cyan-900 via-teal-950 to-stone-900',
    previewThumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
    promptDescription: 'Artistic watercolor and sumi-e ink photo manipulation, delicate pigment bleeding edges on rough cold-pressed watercolor paper, dynamic splashes and drips, expressive translucent washes, elegant minimalist negative space, fine art illustration',
    settings: {
      brightness: 10,
      contrast: 22,
      saturation: 25,
      warmth: -10,
      hueRotate: 190,
      vignette: 0.2,
      grain: 0.3,
      bloom: true,
      chromaticAberration: false,
      particles: 'mist',
      overlayBlend: 'watercolor',
      styleStrength: 80
    }
  }
];

export type PhotoRole =
  | 'subject'      // 👤 Main Subject (Person / Model to isolate)
  | 'background'   // 🌄 Background Scene (Plate / Environment)
  | 'prop'         // 🪄 Secondary Element / Prop (Accessories, Wings, Car, Pet)
  | 'texture'      // 🌌 Texture / Atmosphere / Sky (Nebula, Stars, Smoke, Petals)
  | 'lighting_ref';// 💡 Lighting & Color Grade Reference

export interface PhotoLayer {
  id: string;
  name: string;
  fileSize?: string;
  url: string;
  role: PhotoRole;
  opacity: number; // 0 to 100
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay' | 'soft-light';
  visible: boolean;
  removeBg?: boolean;
}

// Curated Multi-Photo Combos demonstrating multi-image photo manipulation
export const MULTI_PHOTO_COMBOS = [
  {
    id: 'combo-bagan-heritage',
    titleEn: 'Royal Bagan Heritage (3 Photos)',
    titleMm: 'ပုဂံရိုးရာ နန်းတွင်း ဓာတ်ပုံ ၃ ပုံ ပေါင်းစပ်မှု',
    descEn: 'Burmese Royal Model + Bagan Horizon Pagodas + Golden Lotus Embers',
    descMm: 'မြန်မာနန်းတွင်း သူဇာ + ပုဂံဆည်းဆာ + ရွှေရောင်ကြာပွင့်မီးပွားများ',
    layers: [
      {
        id: 'layer-bg-1',
        name: 'Bagan Horizon Dawn.jpg',
        url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=85',
        role: 'background' as PhotoRole,
        opacity: 100,
        blendMode: 'normal' as const,
        visible: true,
      },
      {
        id: 'layer-subj-1',
        name: 'Burmese Royal Lady.jpg',
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
        role: 'subject' as PhotoRole,
        opacity: 100,
        blendMode: 'normal' as const,
        visible: true,
        removeBg: true,
      },
      {
        id: 'layer-prop-1',
        name: 'Golden Lotus Sparkles.jpg',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
        role: 'texture' as PhotoRole,
        opacity: 75,
        blendMode: 'screen' as const,
        visible: true,
      }
    ]
  },
  {
    id: 'combo-cyberpunk-neon',
    titleEn: 'Cyberpunk Neon Noir (3 Photos)',
    titleMm: 'ဆိုင်ဘာပန့်ခ် ညရှုခင်းနှင့် နီယွန် ဓာတ်ပုံ ၃ ပုံ ပေါင်းစပ်မှု',
    descEn: 'Urban Portrait + Rainy Neon Shinjuku Alley + Holographic Grid FX',
    descMm: 'စတူဒီယို ပုံတူအမျိုးသား + ဆိုင်ဘာနီယွန်လမ်းကြား + ဟိုလိုဂရမ် ကွန်ရက်',
    layers: [
      {
        id: 'layer-bg-2',
        name: 'Cyberpunk Neon Street.jpg',
        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
        role: 'background' as PhotoRole,
        opacity: 100,
        blendMode: 'normal' as const,
        visible: true,
      },
      {
        id: 'layer-subj-2',
        name: 'Urban Male Studio.jpg',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85',
        role: 'subject' as PhotoRole,
        opacity: 100,
        blendMode: 'normal' as const,
        visible: true,
        removeBg: true,
      },
      {
        id: 'layer-prop-2',
        name: 'Cyan Glitch Grid.jpg',
        url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',
        role: 'texture' as PhotoRole,
        opacity: 65,
        blendMode: 'screen' as const,
        visible: true,
      }
    ]
  },
  {
    id: 'combo-celestial-double-exposure',
    titleEn: 'Celestial Double Exposure (3 Photos)',
    titleMm: 'စကြဝဠာနှင့် သဘာဝ Double Exposure ဓာတ်ပုံ ၃ ပုံ',
    descEn: 'Danseuse Profile Silhouette + Misty Pine Mountains + Starlight Nebula',
    descMm: 'ရိုးရာအကပညာရှင် ပုံရိပ် + ဆီးနှင်းတောင်တန်း + ဂလက်ဆီ ကြယ်စင်တိမ်တိုက်',
    layers: [
      {
        id: 'layer-bg-3',
        name: 'Misty Mountains.jpg',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
        role: 'background' as PhotoRole,
        opacity: 100,
        blendMode: 'normal' as const,
        visible: true,
      },
      {
        id: 'layer-subj-3',
        name: 'Traditional Danseuse.jpg',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
        role: 'subject' as PhotoRole,
        opacity: 90,
        blendMode: 'multiply' as const,
        visible: true,
      },
      {
        id: 'layer-prop-3',
        name: 'Starlight Galaxy Nebula.jpg',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
        role: 'texture' as PhotoRole,
        opacity: 85,
        blendMode: 'screen' as const,
        visible: true,
      }
    ]
  }
];

export const PhotoManipulationStudio: React.FC<PhotoManipulationStudioProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  // Multi-Photo Layer Stack state
  const [layers, setLayers] = useState<PhotoLayer[]>(MULTI_PHOTO_COMBOS[0].layers);
  const [selectedComboId, setSelectedComboId] = useState<string>('combo-bagan-heritage');

  // Identify active primary subject & background for comparative split view
  const primarySubject = useMemo(() => {
    return layers.find(l => l.role === 'subject') || layers[0] || null;
  }, [layers]);

  const primaryBackground = useMemo(() => {
    return layers.find(l => l.role === 'background') || null;
  }, [layers]);

  const activeSourceImage = primarySubject?.url || layers[0]?.url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85';

  // Selected Style Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('celestial-galaxy');
  const selectedPreset = useMemo(() => {
    return MANIPULATION_PRESETS.find(p => p.id === selectedPresetId) || MANIPULATION_PRESETS[0];
  }, [selectedPresetId]);

  const [activeCategory, setActiveCategory] = useState<ManipulationCategory | 'all'>('all');

  // Custom Interactive Adjustment Sliders (initialized from preset)
  const [brightness, setBrightness] = useState<number>(selectedPreset.settings.brightness);
  const [contrast, setContrast] = useState<number>(selectedPreset.settings.contrast);
  const [saturation, setSaturation] = useState<number>(selectedPreset.settings.saturation);
  const [warmth, setWarmth] = useState<number>(selectedPreset.settings.warmth);
  const [hueRotate, setHueRotate] = useState<number>(selectedPreset.settings.hueRotate);
  const [vignette, setVignette] = useState<number>(selectedPreset.settings.vignette);
  const [grain, setGrain] = useState<number>(selectedPreset.settings.grain);
  const [bloom, setBloom] = useState<boolean>(selectedPreset.settings.bloom);
  const [chromaticAberration, setChromaticAberration] = useState<boolean>(selectedPreset.settings.chromaticAberration);
  const [particles, setParticles] = useState<'none' | 'gold_sparks' | 'cosmic_stars' | 'lotus_petals' | 'mist'>(selectedPreset.settings.particles);
  const [overlayBlend, setOverlayBlend] = useState<'none' | 'double_exposure' | 'gold_leaf' | 'cyber_neon' | 'watercolor' | 'sun_flare'>(selectedPreset.settings.overlayBlend);
  const [styleStrength, setStyleStrength] = useState<number>(selectedPreset.settings.styleStrength);

  // Sync controls whenever user clicks a new preset
  const handleSelectPreset = (preset: ManipulationPreset) => {
    setSelectedPresetId(preset.id);
    setBrightness(preset.settings.brightness);
    setContrast(preset.settings.contrast);
    setSaturation(preset.settings.saturation);
    setWarmth(preset.settings.warmth);
    setHueRotate(preset.settings.hueRotate);
    setVignette(preset.settings.vignette);
    setGrain(preset.settings.grain);
    setBloom(preset.settings.bloom);
    setChromaticAberration(preset.settings.chromaticAberration);
    setParticles(preset.settings.particles);
    setOverlayBlend(preset.settings.overlayBlend);
    setStyleStrength(preset.settings.styleStrength);
  };

  // View presentation state
  const [viewMode, setViewMode] = useState<'composite' | 'split' | 'side-by-side' | 'layers-grid'>('composite');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [manipulatedDataUrl, setManipulatedDataUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs for multi-file and targeted uploads
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const targetRoleInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetRole, setUploadTargetRole] = useState<PhotoRole>('subject');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Layer CRUD and Management
  const updateLayer = (id: string, updates: Partial<PhotoLayer>) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLayer = (id: string) => {
    setLayers(prev => {
      const filtered = prev.filter(l => l.id !== id);
      if (filtered.length === 0) {
        showToast(isMm ? 'အနည်းဆုံး ဓာတ်ပုံ ၁ ပုံ လိုအပ်ပါသည်' : 'Keep at least one photo layer');
        return MULTI_PHOTO_COMBOS[0].layers;
      }
      return filtered;
    });
    showToast(isMm ? 'ဓာတ်ပုံ အလွှာ ရှင်းထုတ်ပြီးပါပြီ' : 'Photo layer removed');
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    setLayers(prev => {
      const index = prev.findIndex(l => l.id === id);
      if (index < 0) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const loadCombo = (comboId: string) => {
    const found = MULTI_PHOTO_COMBOS.find(c => c.id === comboId);
    if (found) {
      setSelectedComboId(comboId);
      setLayers(found.layers);
      showToast(isMm ? `"${found.titleMm}" ဓာတ်ပုံတွဲ ရွေးချယ်ပြီးပါပြီ` : `Loaded "${found.titleEn}"`);
    }
  };

  // Add a layer from file reader
  const addLayerFromFile = (file: File, explicitRole?: PhotoRole) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const role: PhotoRole = explicitRole || (layers.length === 0 ? 'background' : layers.some(l => l.role === 'subject') ? 'prop' : 'subject');
      const newLayer: PhotoLayer = {
        id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        url: result,
        role,
        opacity: 100,
        blendMode: role === 'texture' ? 'screen' : 'normal',
        visible: true,
        removeBg: role === 'subject'
      };
      setLayers(prev => [newLayer, ...prev]);
      showToast(isMm ? `ဓာတ်ပုံ "${file.name}" တင်သွင်းပြီးပါပြီ` : `Added "${file.name}" as ${role}`);
    };
    reader.readAsDataURL(file);
  };

  // Multiple files selection handler
  const handleMultiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        let assignedRole: PhotoRole = 'subject';
        if (files.length > 1) {
          if (index === 0) assignedRole = 'subject';
          else if (index === 1) assignedRole = 'background';
          else if (index === 2) assignedRole = 'prop';
          else assignedRole = 'texture';
        }
        addLayerFromFile(file, assignedRole);
      }
    });

    e.target.value = '';
  };

  // Targeted role upload handler (when user clicks "+ Add Background", "+ Add Subject", etc.)
  const handleTargetedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        addLayerFromFile(file, uploadTargetRole);
      }
    });
    e.target.value = '';
  };

  const triggerTargetedUpload = (role: PhotoRole) => {
    setUploadTargetRole(role);
    targetRoleInputRef.current?.click();
  };

  // Drag and drop handlers supporting multiple files
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        let assignedRole: PhotoRole = 'subject';
        if (files.length > 1) {
          if (index === 0) assignedRole = 'subject';
          else if (index === 1) assignedRole = 'background';
          else if (index === 2) assignedRole = 'prop';
          else assignedRole = 'texture';
        }
        addLayerFromFile(file, assignedRole);
      }
    });
  };

  // Global clipboard paste listener (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            addLayerFromFile(file, 'subject');
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [layers, isMm]);

  // REAL CANVAS MANIPULATION ENGINE
  // Multi-pass pixel-level shader & artistic manipulation
  const renderManipulation = useCallback(async () => {
    const visibleLayers = layers.filter(l => l.visible);
    if (visibleLayers.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Load all visible layer images
      const loadedImages = await Promise.all(
        visibleLayers.map(l => {
          return new Promise<{ layer: PhotoLayer; img: HTMLImageElement }>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ layer: l, img });
            img.onerror = () => resolve({ layer: l, img });
            img.src = l.url;
          });
        })
      );

      const canvas = document.createElement('canvas');
      const maxDim = 1600;

      // Base dimensions on background plate or primary subject
      const bgItem = loadedImages.find(item => item.layer.role === 'background') || loadedImages[0];
      let w = bgItem?.img.width || 1600;
      let h = bgItem?.img.height || 900;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      if (!w || !h || isNaN(w) || isNaN(h)) {
        w = 1600;
        h = 900;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Fill dark studio canvas backdrop
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, w, h);

      const bgItems = loadedImages.filter(item => item.layer.role === 'background');
      const subjItems = loadedImages.filter(item => item.layer.role === 'subject');
      const propItems = loadedImages.filter(item => item.layer.role === 'prop');
      const textureItems = loadedImages.filter(item => item.layer.role === 'texture' || item.layer.role === 'lighting_ref');

      // Stage A: Draw Background Plates
      if (bgItems.length > 0) {
        for (const item of bgItems) {
          if (!item.img.width) continue;
          ctx.save();
          ctx.globalAlpha = item.layer.opacity / 100;
          ctx.globalCompositeOperation = item.layer.blendMode === 'normal' ? 'source-over' : item.layer.blendMode;
          const hRatio = w / item.img.width;
          const vRatio = h / item.img.height;
          const ratio = Math.max(hRatio, vRatio);
          const cx = (w - item.img.width * ratio) / 2;
          const cy = (h - item.img.height * ratio) / 2;
          ctx.drawImage(item.img, 0, 0, item.img.width, item.img.height, cx, cy, item.img.width * ratio, item.img.height * ratio);
          ctx.restore();
        }
      } else if (subjItems.length > 0 && !bgItems.length) {
        const primary = subjItems[0];
        if (primary.img.width) {
          ctx.save();
          const hRatio = w / primary.img.width;
          const vRatio = h / primary.img.height;
          const ratio = Math.min(hRatio, vRatio);
          const cx = (w - primary.img.width * ratio) / 2;
          const cy = (h - primary.img.height * ratio) / 2;
          ctx.drawImage(primary.img, 0, 0, primary.img.width, primary.img.height, cx, cy, primary.img.width * ratio, primary.img.height * ratio);
          ctx.restore();
        }
      }

      // Stage B: Draw Subjects with Smart Cutout / Edge-feathering
      for (const item of subjItems) {
        if (!item.img.width) continue;
        const sCanvas = document.createElement('canvas');
        sCanvas.width = w;
        sCanvas.height = h;
        const sCtx = sCanvas.getContext('2d');
        if (sCtx) {
          const hRatio = w / item.img.width;
          const vRatio = h / item.img.height;
          const ratio = Math.min(hRatio, vRatio) * 0.95;
          const cx = (w - item.img.width * ratio) / 2;
          const cy = (h - item.img.height * ratio) / 2;
          sCtx.drawImage(item.img, cx, cy, item.img.width * ratio, item.img.height * ratio);

          if (item.layer.removeBg && bgItems.length > 0) {
            sCtx.globalCompositeOperation = 'destination-in';
            const maskGrad = sCtx.createRadialGradient(
              w / 2,
              h * 0.48,
              Math.min(w, h) * 0.22,
              w / 2,
              h * 0.52,
              Math.min(w, h) * 0.58
            );
            maskGrad.addColorStop(0, 'rgba(0,0,0,1)');
            maskGrad.addColorStop(0.72, 'rgba(0,0,0,0.95)');
            maskGrad.addColorStop(1, 'rgba(0,0,0,0)');
            sCtx.fillStyle = maskGrad;
            sCtx.fillRect(0, 0, w, h);
          }

          ctx.save();
          ctx.globalAlpha = item.layer.opacity / 100;
          ctx.globalCompositeOperation = item.layer.blendMode === 'normal' ? 'source-over' : item.layer.blendMode;
          ctx.drawImage(sCanvas, 0, 0);
          ctx.restore();
        }
      }

      // Stage C: Draw Props & Secondary Elements
      for (const item of propItems) {
        if (!item.img.width) continue;
        ctx.save();
        ctx.globalAlpha = item.layer.opacity / 100;
        ctx.globalCompositeOperation = item.layer.blendMode === 'normal' ? 'source-over' : item.layer.blendMode;
        const pScale = 0.55;
        const pw = item.img.width * pScale;
        const ph = item.img.height * pScale;
        ctx.drawImage(item.img, w * 0.68 - pw / 2, h * 0.52 - ph / 2, pw, ph);
        ctx.restore();
      }

      // Stage D: Draw Atmosphere & Texture Overlays
      for (const item of textureItems) {
        if (!item.img.width) continue;
        ctx.save();
        ctx.globalAlpha = item.layer.opacity / 100;
        ctx.globalCompositeOperation = item.layer.blendMode === 'normal' ? 'screen' : item.layer.blendMode;
        ctx.drawImage(item.img, 0, 0, w, h);
        ctx.restore();
      }

      // Factor style strength (0.0 to 1.0)
      const strength = Math.max(0.1, styleStrength / 100);

      // 2. Pixel-level manipulation: Brightness, Contrast, Saturation, Warmth, Hue
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const len = data.length;

      const cFactor = (259 * ((contrast * strength) + 255)) / (255 * (259 - (contrast * strength)));
      const bOffset = brightness * strength * 2.2;
      const sat = 1 + (saturation * strength * 0.015);
      const warmFactor = (warmth * strength) * 0.8;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Contrast
        r = cFactor * (r - 128) + 128 + bOffset;
        g = cFactor * (g - 128) + 128 + bOffset;
        b = cFactor * (b - 128) + 128 + bOffset;

        // Warmth balance (shift red/yellow up, blue down or vice-versa)
        r += warmFactor * 1.2;
        g += warmFactor * 0.4;
        b -= warmFactor * 0.9;

        // Saturation
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        r = gray + (r - gray) * sat;
        g = gray + (g - gray) * sat;
        b = gray + (b - gray) * sat;

        // Clamp
        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imgData, 0, 0);

      // 3. Chromatic Aberration & Glitch Pass (Cyan / Red channel offset)
      if (chromaticAberration) {
        const offset = Math.max(2, Math.round(w * 0.007 * strength));
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(tempCanvas, offset, 0);
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      // 4. Bloom / Luminous Diffusion
      if (bloom) {
        const bloomCanvas = document.createElement('canvas');
        bloomCanvas.width = Math.round(w / 4);
        bloomCanvas.height = Math.round(h / 4);
        const bCtx = bloomCanvas.getContext('2d');
        if (bCtx) {
          bCtx.filter = 'blur(6px) brightness(1.3)';
          bCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
          ctx.save();
          ctx.globalAlpha = 0.35 * strength;
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(bloomCanvas, 0, 0, w, h);
          ctx.restore();
        }
      }

      // 5. Stylistic Overlays & Double Exposure simulation
      if (overlayBlend === 'double_exposure') {
        // Dramatic pagoda silhouette & sunset gradient overlay
        ctx.save();
        ctx.globalAlpha = 0.42 * strength;
        ctx.globalCompositeOperation = 'screen';
        const grad = ctx.createLinearGradient(0, h, w, 0);
        grad.addColorStop(0, '#ff7700');
        grad.addColorStop(0.5, '#7928ca');
        grad.addColorStop(1, '#00d4ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Silhouette pagoda silhouettes on bottom edge
        ctx.globalAlpha = 0.28 * strength;
        ctx.globalCompositeOperation = 'multiply';
        ctx.beginPath();
        for (let x = 0; x < w; x += 120) {
          ctx.moveTo(x, h);
          ctx.lineTo(x + 40, h - 140);
          ctx.lineTo(x + 60, h - 220); // pagoda spire
          ctx.lineTo(x + 80, h - 140);
          ctx.lineTo(x + 120, h);
        }
        ctx.fillStyle = '#1c1c1e';
        ctx.fill();
        ctx.restore();
      } else if (overlayBlend === 'gold_leaf') {
        // Shwe-Cha 24K gold foil flaking effect
        ctx.save();
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.globalAlpha = 0.5 * strength;
        for (let k = 0; k < 180; k++) {
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          const size = Math.random() * 24 + 4;
          const goldGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, size);
          goldGrad.addColorStop(0, '#ffe57f');
          goldGrad.addColorStop(0.5, '#ffd02f');
          goldGrad.addColorStop(1, 'rgba(180, 120, 0, 0)');
          ctx.fillStyle = goldGrad;
          ctx.beginPath();
          ctx.arc(gx, gy, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (overlayBlend === 'cyber_neon') {
        // Cyan-magenta dual-tone rim light
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.38 * strength;
        const cyberGrad = ctx.createLinearGradient(0, 0, w, h);
        cyberGrad.addColorStop(0, '#00f2fe');
        cyberGrad.addColorStop(0.5, 'transparent');
        cyberGrad.addColorStop(1, '#fe0979');
        ctx.fillStyle = cyberGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      } else if (overlayBlend === 'sun_flare') {
        // Anamorphic horizontal sun flare
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.45 * strength;
        const flareY = h * 0.35;
        const flareGrad = ctx.createRadialGradient(w * 0.65, flareY, 0, w * 0.65, flareY, w * 0.6);
        flareGrad.addColorStop(0, '#fff3b0');
        flareGrad.addColorStop(0.2, '#ffaa00');
        flareGrad.addColorStop(0.8, '#ff3300');
        flareGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, w, h);

        // Horizontal lens streak
        ctx.fillStyle = 'rgba(255, 230, 150, 0.35)';
        ctx.fillRect(0, flareY - 4, w, 8);
        ctx.restore();
      } else if (overlayBlend === 'watercolor') {
        // Watercolor edge bleed vignette
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.3 * strength;
        const wcGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
        wcGrad.addColorStop(0, 'transparent');
        wcGrad.addColorStop(0.8, '#4facfe');
        wcGrad.addColorStop(1, '#00f2fe');
        ctx.fillStyle = wcGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 6. Particle Emitter / Aura FX
      if (particles !== 'none') {
        ctx.save();
        if (particles === 'gold_sparks') {
          ctx.globalCompositeOperation = 'screen';
          for (let p = 0; p < 90; p++) {
            const px = Math.random() * w;
            const py = Math.random() * h;
            const pr = Math.random() * 3 + 1;
            ctx.fillStyle = Math.random() > 0.4 ? '#ffd02f' : '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (particles === 'cosmic_stars') {
          ctx.globalCompositeOperation = 'screen';
          for (let p = 0; p < 130; p++) {
            const px = Math.random() * w;
            const py = Math.random() * h;
            const pr = Math.random() * 2.5 + 0.5;
            ctx.fillStyle = Math.random() > 0.5 ? '#a78bfa' : '#67e8f9';
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (particles === 'lotus_petals') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 0.65 * strength;
          for (let p = 0; p < 25; p++) {
            const px = Math.random() * w;
            const py = Math.random() * h;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate((Math.random() - 0.5) * 1.5);
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2);
            ctx.fillStyle = Math.random() > 0.3 ? '#fda4af' : '#ffe4e6';
            ctx.fill();
            ctx.restore();
          }
        } else if (particles === 'mist') {
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 0.25 * strength;
          const mistGrad = ctx.createLinearGradient(0, h, 0, h * 0.4);
          mistGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
          mistGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mistGrad;
          ctx.fillRect(0, h * 0.4, w, h * 0.6);
        }
        ctx.restore();
      }

      // 7. Vignette
      if (vignette > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const rad = Math.max(w, h) * 0.75;
        const vigGrad = ctx.createRadialGradient(w / 2, h / 2, rad * (1 - vignette), w / 2, h / 2, rad);
        vigGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        vigGrad.addColorStop(1, `rgba(15, 15, 18, ${vignette * 1.1})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // 8. Film Grain & Organic Analog Texture
      if (grain > 0.05) {
        ctx.save();
        const grainCanvas = document.createElement('canvas');
        const gw = 200;
        const gh = 200;
        grainCanvas.width = gw;
        grainCanvas.height = gh;
        const gctx = grainCanvas.getContext('2d');
        if (gctx) {
          const gImgData = gctx.createImageData(gw, gh);
          const gData = gImgData.data;
          for (let gi = 0; gi < gData.length; gi += 4) {
            const noise = (Math.random() - 0.5) * 255;
            gData[gi] = 128 + noise;
            gData[gi + 1] = 128 + noise;
            gData[gi + 2] = 128 + noise;
            gData[gi + 3] = 255;
          }
          gctx.putImageData(gImgData, 0, 0);

          const pattern = ctx.createPattern(grainCanvas, 'repeat');
          if (pattern) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.globalAlpha = grain * 0.6;
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, w, h);
          }
        }
        ctx.restore();
      }

      // Export result
      try {
        const outUrl = canvas.toDataURL('image/png', 0.95);
        setManipulatedDataUrl(outUrl);
      } catch (err) {
        console.warn('Canvas export tainted or restricted, fallback to direct preview', err);
      } finally {
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error during multi-photo manipulation composite:', err);
      setIsProcessing(false);
    }
  }, [
    layers,
    styleStrength,
    brightness,
    contrast,
    saturation,
    warmth,
    vignette,
    grain,
    bloom,
    chromaticAberration,
    overlayBlend,
    particles
  ]);

  // Debounced execution when controls or layers change
  useEffect(() => {
    const timer = setTimeout(() => {
      renderManipulation();
    }, 180);
    return () => clearTimeout(timer);
  }, [renderManipulation]);

  // Filter presets by category
  const filteredPresets = useMemo(() => {
    if (activeCategory === 'all') return MANIPULATION_PRESETS;
    return MANIPULATION_PRESETS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Synthesize AI Generation Master Multi-Image Prompt
  const generatedMasterPrompt = useMemo(() => {
    const engineTag = engine.includes('midjourney')
      ? '--v 6.1 --style raw --ar 16:9 --quality 2'
      : engine.includes('flux')
      ? 'steps: 32, guidance_scale: 3.8, sampler: Euler a'
      : '--ar 16:9 --style photographic';

    const subjectLayers = layers.filter(l => l.role === 'subject');
    const bgLayers = layers.filter(l => l.role === 'background');
    const propLayers = layers.filter(l => l.role === 'prop');
    const textureLayers = layers.filter(l => l.role === 'texture');

    let compositionDesc = '';
    if (layers.length > 1) {
      const subjNames = subjectLayers.map(l => l.name).join(', ') || 'Primary Subject';
      const bgNames = bgLayers.map(l => l.name).join(', ') || 'Background Scene Plate';
      const propNames = propLayers.map(l => l.name).join(', ');
      const texNames = textureLayers.map(l => l.name).join(', ');

      compositionDesc = `Photographic multi-photo manipulation & composite: Seamlessly isolate and composite subject [${subjNames}] into background environment [${bgNames}]${propNames ? ` with integrated props [${propNames}]` : ''}${texNames ? ` and atmospheric overlay [${texNames}]` : ''}. Perfect directional contact shadows on ground plane, harmonized ambient bounce light wrap, matching color temperature, realistic sub-surface scattering,`;
    } else {
      compositionDesc = `Photo manipulation art of [${layers[0]?.name || 'Source Photo'}],`;
    }

    const imageRefTags = layers
      .filter(l => l.url.startsWith('http'))
      .map(l => l.url)
      .join(' ');

    return `${imageRefTags ? `${imageRefTags} ` : ''}${compositionDesc} ${selectedPreset.promptDescription}, style intensity: ${styleStrength}%, Hasselblad X2D 100C with 85mm f/1.2 lens, 8k masterpiece resolution, ${engineTag}`;
  }, [layers, selectedPreset, styleStrength, engine]);

  // Download high-resolution PNG
  const handleDownloadResult = () => {
    if (!manipulatedDataUrl) return;
    const a = document.createElement('a');
    a.href = manipulatedDataUrl;
    a.download = `show-prompt-manipulation-${selectedPreset.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(isMm ? '8K ဓာတ်ပုံ စက်ထဲသို့ အောင်မြင်စွာ ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ' : 'Photo downloaded successfully!');
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedMasterPrompt);
    showToast(isMm ? 'Master Prompt ကို Clipboard သို့ ကူးယူပြီးပါပြီ' : 'Prompt copied to clipboard!');
  };

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] text-[#1c1c1e] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1c1e] text-white px-5 py-3 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce border border-[#ffd02f]">
          <span className="material-symbols-outlined text-[#ffd02f] text-sm">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Hidden Multi-File and Targeted Role File Inputs */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleMultiFileUpload}
        className="hidden"
      />
      <input
        ref={targetRoleInputRef}
        type="file"
        accept="image/*"
        onChange={handleTargetedUpload}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#e5e7eb] gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#1c1c1e] to-[#3a3d45] flex items-center justify-center text-[#ffd02f] shadow-sm border border-[#ffd02f]/40">
              <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1c1c1e]">
                  {isMm ? 'Photo Manipulation Studio' : 'Photo Manipulation Studio'}
                </h1>
                <span className="bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Multi-Photo Compositor
                </span>
              </div>
              <p className="text-xs text-[#555a6a] mt-0.5">
                {isMm
                  ? 'ဓာတ်ပုံ မျိုးစုံ (လူပုံတူ၊ နောက်ခံရှုခင်း၊ ထပ်ထည့်မည့် အရာဝတ္ထု၊ အလင်း/ကြယ်စင် တိမ်တိုက်) ကို တစ်ပြိုင်နက် ပေါင်းစပ် ဖန်တီးနိုင်ပါသည်'
                  : 'Combine multiple photos (Subject, Background Scene, Props & Atmospheric Overlays) into seamless cinematic photomontages'}
              </p>
            </div>
          </div>

          {/* Quick Actions & Upload Multiple Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => multiFileInputRef.current?.click()}
              className="px-4 py-2 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold rounded-full text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border border-[#fcb900]/60 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">collections</span>
              <span>{isMm ? 'ဓာတ်ပုံ မျိုးစုံ တင်သွင်းမည် (Upload Multiple)' : 'Upload Multiple Photos'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loadCombo('combo-bagan-heritage');
              }}
              className="px-3 py-2 bg-white hover:bg-[#f3f4f6] text-[#555a6a] font-bold rounded-full text-xs border border-[#e0e2e8] transition-all cursor-pointer"
              title={isMm ? 'မူလ စံပြဓာတ်ပုံတွဲသို့ ပြန်ပြောင်းမည်' : 'Reset to sample combo'}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadResult}
              disabled={!manipulatedDataUrl || isProcessing}
              className="px-4 py-2 bg-[#1c1c1e] hover:bg-black text-white font-extrabold rounded-full text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-[#ffd02f] text-sm">download</span>
              {isMm ? 'Download 8K PNG' : 'Download Manipulated PNG'}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 1: MULTI-PHOTO LAYER COMPOSITOR & COMBINATOR              */}
        {/* ============================================================== */}
        <div className="mt-6 bg-white rounded-3xl p-5 border border-[#e5e7eb] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#f0f2f5]">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#1c1c1e] text-[#ffd02f] flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                1
              </span>
              <div>
                <h2 className="text-sm font-black text-[#1c1c1e] flex items-center gap-2 flex-wrap">
                  <span>{isMm ? 'ဓာတ်ပုံ မျိုးစုံ ပေါင်းစပ်မှု စနစ် (Multi-Photo Combination)' : 'Multi-Photo Layer Compositor & Combinator'}</span>
                  <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                    {layers.length} {isMm ? 'ပုံ ပေါင်းစပ်ထားသည်' : 'Photos in Stack'}
                  </span>
                </h2>
                <p className="text-xs text-[#6b6f7e] mt-0.5">
                  {isMm
                    ? 'Photo Manipulation သည် ဓာတ်ပုံ ၁ ပုံတည်း မဟုတ်ဘဲ လူပုံတူ + နောက်ခံရှုခင်း + အသုံးအဆောင် ပစ္စည်း + အလင်းအမှောင် တို့ကို တွဲဖက် ပေါင်းစပ်ခြင်းဖြစ်ပါသည်'
                    : 'True photo manipulation composites multiple photos together: Foreground Subject + Background Plate + Props + Atmospheric Overlays.'}
                </p>
              </div>
            </div>

            {/* Quick Upload Slot Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => multiFileInputRef.current?.click()}
                className="px-3 py-1.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold rounded-xl text-xs shadow-2xs flex items-center gap-1 transition-all cursor-pointer border border-[#fcb900]/70"
                title={isMm ? 'ဖိုင်များစွာ တစ်ပြိုင်နက် ရွေးချယ်မည်' : 'Select multiple photos at once'}
              >
                <span className="material-symbols-outlined text-[15px]">file_upload</span>
                <span>{isMm ? 'ပုံများစွာ ရွေးမည်' : 'Upload Multiple'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTargetedUpload('subject')}
                className="px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-800 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-violet-200"
                title={isMm ? 'လူပုံတူ ရှေ့ပြေးဓာတ်ပုံ တင်မည်' : 'Upload Subject photo'}
              >
                <span className="material-symbols-outlined text-[15px]">person</span>
                <span>{isMm ? '+ လူပုံတူ' : '+ Subject'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTargetedUpload('background')}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-emerald-200"
                title={isMm ? 'နောက်ခံ ရှုခင်းဓာတ်ပုံ တင်မည်' : 'Upload Background plate'}
              >
                <span className="material-symbols-outlined text-[15px]">landscape</span>
                <span>{isMm ? '+ နောက်ခံ' : '+ Background'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTargetedUpload('prop')}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-amber-200"
                title={isMm ? 'အသုံးအဆောင် ပစ္စည်း/ဒြပ်စင် တင်မည်' : 'Upload Prop/Element'}
              >
                <span className="material-symbols-outlined text-[15px]">category</span>
                <span>{isMm ? '+ ပစ္စည်း/Prop' : '+ Prop'}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerTargetedUpload('texture')}
                className="px-2.5 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-cyan-200"
                title={isMm ? 'အလင်း/ကြယ်စင်/အခိုးအငွေ့ တင်မည်' : 'Upload Texture/Overlay'}
              >
                <span className="material-symbols-outlined text-[15px]">flare</span>
                <span>{isMm ? '+ အလင်း/FX' : '+ Overlay'}</span>
              </button>
            </div>
          </div>

          {/* Upload Dropzone Area */}
          <div className="mt-4">
            <div
              onClick={() => multiFileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 group ${
                isDragging
                  ? 'border-[#ffd02f] bg-[#fffdf0] scale-[1.01]'
                  : 'border-[#d2d6dc] hover:border-[#1c1c1e] bg-[#fbfcfd] hover:bg-[#f7f8fa]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1c1c1e] to-[#3a3d45] text-[#ffd02f] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">collections</span>
                </div>
                <div>
                  <div className="text-xs font-black text-[#1c1c1e] flex items-center gap-2 flex-wrap">
                    <span>{isMm ? 'ဓာတ်ပုံများစွာ တစ်ပြိုင်နက် ဆွဲထည့်ပါ (Drag & Drop Multiple Photos)' : 'Drag & drop multiple photos here, or click to browse'}</span>
                    <span className="bg-[#1c1c1e] text-[#ffd02f] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                      Select 2 to 6 Photos
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b6f7e] mt-0.5">
                    {isMm
                      ? 'ဖိုင်ရွေးချယ်ရာတွင် ပုံများစွာကို Ctrl/Cmd ဖိ၍ တစ်ပြိုင်နက် ရွေးချယ်နိုင်သည် • Ctrl+V ဖြင့် တိုက်ရိုက် Paste ချနိုင်သည်'
                      : 'Hold Ctrl/Cmd to select multiple files at once • Auto-assigns Subject, Background, Props & Atmospheric Overlays'}
                  </p>
                </div>
              </div>

              <span className="px-4 py-2 bg-[#ffd02f] text-[#1c1c1e] text-xs font-black rounded-xl shrink-0 group-hover:bg-[#fcb900] shadow-2xs border border-[#fcb900]/60 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                <span>{isMm ? 'ဓာတ်ပုံများစွာ ရွေးချယ်မည်' : 'Browse Multiple Files'}</span>
              </span>
            </div>
          </div>

          {/* ACTIVE PHOTO LAYERS DECK */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase text-[#8e91a0] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">layers</span>
                <span>{isMm ? 'ပေါင်းစပ်ထားသော ဓာတ်ပုံ အလွှာများ (Active Layer Stack)' : 'Active Photo Manipulation Layers in Composite Stack'}</span>
              </span>
              <span className="text-[10px] text-[#8e91a0] font-medium">
                {isMm ? 'အပေါ်ဆုံးရှိသော အလွှာသည် အရှေ့ဆုံးတွင် ပေါ်မည်' : 'Top layer renders in front'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {layers.map((layer, index) => {
                const roleBadgeColors: Record<PhotoRole, string> = {
                  subject: 'bg-violet-100 text-violet-900 border-violet-200',
                  background: 'bg-emerald-100 text-emerald-900 border-emerald-200',
                  prop: 'bg-amber-100 text-amber-900 border-amber-200',
                  texture: 'bg-cyan-100 text-cyan-900 border-cyan-200',
                  lighting_ref: 'bg-rose-100 text-rose-900 border-rose-200'
                };

                const roleIcons: Record<PhotoRole, string> = {
                  subject: 'person',
                  background: 'landscape',
                  prop: 'category',
                  texture: 'flare',
                  lighting_ref: 'wb_incandescent'
                };

                return (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-3 bg-[#fbfcfd] hover:bg-white ${
                      layer.visible ? 'border-[#e0e2e8] shadow-2xs' : 'border-dashed border-zinc-300 opacity-60'
                    }`}
                  >
                    {/* Layer Thumbnail & Info Header */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-black/10 bg-black/5 shadow-2xs">
                        <img
                          src={layer.url}
                          alt={layer.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-black/80 text-[#ffd02f] text-[9px] font-black px-1 rounded-tl">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-black text-[#1c1c1e] truncate" title={layer.name}>
                            {layer.name}
                          </h4>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              onClick={() => moveLayer(layer.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-[#8e91a0] hover:text-[#1c1c1e] disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveLayer(layer.id, 'down')}
                              disabled={index === layers.length - 1}
                              className="p-1 text-[#8e91a0] hover:text-[#1c1c1e] disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                            </button>
                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                              className={`p-1 rounded cursor-pointer ${layer.visible ? 'text-emerald-700' : 'text-zinc-400'}`}
                              title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {layer.visible ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => removeLayer(layer.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Remove Photo"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Role Selector Dropdown */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-xs text-[#8e91a0]">
                            {roleIcons[layer.role]}
                          </span>
                          <select
                            value={layer.role}
                            onChange={(e) => updateLayer(layer.id, { role: e.target.value as PhotoRole })}
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${roleBadgeColors[layer.role]}`}
                          >
                            <option value="subject">👤 Subject (လူပုံတူ)</option>
                            <option value="background">🌄 Background Plate (နောက်ခံ)</option>
                            <option value="prop">🪄 Prop / Element (ပစ္စည်း)</option>
                            <option value="texture">🌌 Texture / Overlay (အလင်း)</option>
                            <option value="lighting_ref">💡 Lighting Ref (အလင်းညှိ)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Blend Mode & Opacity Controls */}
                    <div className="pt-2 border-t border-[#f0f2f5] grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-[#8e91a0] font-bold block mb-0.5">Blend Mode:</span>
                        <select
                          value={layer.blendMode}
                          onChange={(e) => updateLayer(layer.id, { blendMode: e.target.value as any })}
                          className="w-full bg-white border border-[#d2d6dc] rounded-lg px-1.5 py-1 text-[10px] font-bold text-[#1c1c1e] cursor-pointer"
                        >
                          <option value="normal">Normal</option>
                          <option value="screen">Screen (Lighten)</option>
                          <option value="multiply">Multiply (Darken)</option>
                          <option value="overlay">Overlay</option>
                          <option value="soft-light">Soft Light</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[#8e91a0] font-bold mb-0.5">
                          <span>Opacity:</span>
                          <span className="text-[#1c1c1e] font-mono">{layer.opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={layer.opacity}
                          onChange={(e) => updateLayer(layer.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg mt-1"
                        />
                      </div>
                    </div>

                    {/* Cutout toggle if role === 'subject' */}
                    {layer.role === 'subject' && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-bold text-[#555a6a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-violet-600">content_cut</span>
                          {isMm ? 'နောက်ခံဖယ်ရှားပြီး ပေါင်းစပ်မည်' : 'Cutout / Feather Edge'}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateLayer(layer.id, { removeBg: !layer.removeBg })}
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            layer.removeBg
                              ? 'bg-violet-600 text-white shadow-2xs'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}
                        >
                          {layer.removeBg ? 'Cutout ON' : 'Cutout OFF'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CURATED MULTI-PHOTO COMBOS (INSTANT 3-PHOTO PRESETS) */}
          <div className="mt-5 pt-4 border-t border-[#f0f2f5]">
            <span className="text-[10px] font-black uppercase text-[#8e91a0] tracking-wider flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span>
              {isMm ? 'စံပြ ဓာတ်ပုံ ၃ ပုံ ပေါင်းစပ်ထားသော Presets စမ်းသပ်ရန်:' : 'Or test with curated 3-Photo Combination Sets:'}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {MULTI_PHOTO_COMBOS.map((combo) => {
                const isSelected = selectedComboId === combo.id;
                return (
                  <button
                    key={combo.id}
                    type="button"
                    onClick={() => loadCombo(combo.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1c1e] text-white border-[#ffd02f] ring-2 ring-[#ffd02f]/40 shadow-xs'
                        : 'bg-white hover:bg-[#f0f2f5] text-[#1c1c1e] border-[#e5e7eb]'
                    }`}
                  >
                    {/* Layer Thumbnails Stack Preview */}
                    <div className="relative w-12 h-12 shrink-0">
                      <img
                        src={combo.layers[0].url}
                        alt="bg"
                        className="w-9 h-9 rounded-lg object-cover absolute top-0 left-0 border border-white shadow-2xs"
                      />
                      <img
                        src={combo.layers[1].url}
                        alt="subj"
                        className="w-8 h-8 rounded-lg object-cover absolute bottom-0 right-0 border-2 border-white shadow-xs"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-[#1c1c1e]'}`}>
                        {isMm ? combo.titleMm : combo.titleEn}
                      </h4>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-zinc-300' : 'text-[#6b6f7e]'}`}>
                        {isMm ? combo.descMm : combo.descEn}
                      </p>
                      <span className="text-[9px] font-extrabold uppercase text-[#ffd02f] mt-1 inline-block">
                        3 Photos Combined
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN WORKBENCH: Two-Column Responsive Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Interactive Live Canvas & Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">

            {/* Viewport Control Bar */}
            <div className="bg-white p-3 rounded-2xl border border-[#e5e7eb] flex items-center justify-between shadow-2xs gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-[#fcb900]/70 shadow-2xs"
                  title={isMm ? 'ဓာတ်ပုံ အသစ်တင်မည်' : 'Upload custom photo'}
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  <span>{isMm ? 'ပုံတင်မည်' : 'Upload Photo'}</span>
                </button>
                <div className="h-4 w-px bg-[#e5e7eb]" />
                <div className="flex items-center gap-1 bg-[#f3f4f6] p-1 rounded-full">
                  {[
                    { id: 'split', icon: 'splitscreen_left', label: isMm ? 'Split Slider' : 'Split Slider' },
                    { id: 'side-by-side', icon: 'view_column', label: isMm ? 'Side by Side' : 'Side by Side' },
                    { id: 'manipulated', icon: 'auto_awesome', label: isMm ? 'Manipulated' : 'Manipulated' },
                    { id: 'original', icon: 'image', label: isMm ? 'Original' : 'Original' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setViewMode(mode.id as any)}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        viewMode === mode.id
                          ? 'bg-white text-[#1c1c1e] shadow-2xs'
                          : 'text-[#6b6f7e] hover:text-[#1c1c1e]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{mode.icon}</span>
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Resolution Indicator */}
              <div className="flex items-center gap-2 text-xs font-bold">
                {isProcessing ? (
                  <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    {isMm ? 'အသွင်ပြောင်းနေသည်...' : 'Manipulating...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-[11px]">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Live 60FPS
                  </span>
                )}
              </div>
            </div>

            {/* Viewport Display Area */}
            <div
              ref={containerRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#141517] rounded-3xl overflow-hidden shadow-md border ${
                isDragging ? 'border-[#ffd02f] ring-4 ring-[#ffd02f]/30' : 'border-[#2d3139]'
              }`}
            >
              {/* Drag & drop overlay cue */}
              {isDragging && (
                <div className="absolute inset-0 bg-[#ffd02f]/20 backdrop-blur-xs z-40 flex items-center justify-center">
                  <div className="bg-[#1c1c1e] text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 border border-[#ffd02f]">
                    <span className="material-symbols-outlined text-[#ffd02f] text-2xl">file_download</span>
                    {isMm ? 'ဓာတ်ပုံ ဤနေရာတွင် လွှတ်ချပါ' : 'Drop your photo here'}
                  </div>
                </div>
              )}

              {/* VIEW MODE 1: Interactive Split Slider */}
              {viewMode === 'split' && (
                <div className="relative w-full h-full select-none">
                  {/* Before (Original) Background */}
                  <img
                    src={activeSourceImage}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-white/20">
                      Original Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-black/60 hover:bg-black text-[#ffd02f] hover:text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#ffd02f]/40 backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer pointer-events-auto"
                      title={isMm ? 'ဓာတ်ပုံ အသစ်တင်မည်' : 'Upload new photo'}
                    >
                      <span className="material-symbols-outlined text-xs">cloud_upload</span>
                      {isMm ? 'ပုံတင်မည်' : 'Upload'}
                    </button>
                  </div>

                  {/* Manipulated Curtain Overlay */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
                  >
                    <img
                      src={manipulatedDataUrl || activeSourceImage}
                      alt="Manipulated"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                    <div className="absolute top-4 right-4 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full z-10 shadow-sm border border-black/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      {selectedPreset.nameEn}
                    </div>
                  </div>

                  {/* Split Divider Line & Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#ffd02f] shadow-2xl z-30 cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1c1c1e] text-[#ffd02f] border-2 border-[#ffd02f] flex items-center justify-center shadow-lg cursor-ew-resize">
                      <span className="material-symbols-outlined text-base">code</span>
                    </div>
                  </div>

                  {/* Invisible Range Input for Smooth Dragging */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    title="Drag to compare before and after"
                  />
                </div>
              )}

              {/* VIEW MODE 2: Side-by-Side */}
              {viewMode === 'side-by-side' && (
                <div className="w-full h-full grid grid-cols-2 gap-1 p-1 bg-black">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1f2024]">
                    <img
                      src={activeSourceImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      Original
                    </span>
                  </div>
                  <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1f2024]">
                    <img
                      src={manipulatedDataUrl || activeSourceImage}
                      alt="Manipulated"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-3 right-3 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      Manipulated
                    </span>
                  </div>
                </div>
              )}

              {/* VIEW MODE 3: Manipulated Result Only */}
              {viewMode === 'manipulated' && (
                <div className="relative w-full h-full">
                  <img
                    src={manipulatedDataUrl || activeSourceImage}
                    alt="Manipulated Full View"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 right-4 bg-[#1c1c1e]/90 backdrop-blur-md text-[#ffd02f] text-xs font-bold px-4 py-1.5 rounded-full border border-[#ffd02f]/40 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">palette</span>
                    {selectedPreset.nameEn} ({styleStrength}%)
                  </div>
                </div>
              )}

              {/* VIEW MODE 4: Original Only */}
              {viewMode === 'original' && (
                <div className="relative w-full h-full">
                  <img
                    src={activeSourceImage}
                    alt="Original Source"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="bg-black/80 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      Source Photo (Unmodified)
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer transition-all shadow-sm border border-[#fcb900]/70"
                    >
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      {isMm ? 'ဓာတ်ပုံ အသစ်တင်မည်' : 'Upload New Photo'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt & AI Synthesis Box */}
            <div className="bg-white p-5 rounded-3xl border border-[#e5e7eb] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffd02f] text-xl">psychology</span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#1c1c1e]">
                    {isMm ? 'AI Photo Manipulation Prompt' : 'AI Manipulation Master Prompt'}
                  </span>
                </div>
                <span className="text-[10px] bg-[#f3f4f6] text-[#555a6a] font-mono px-2 py-0.5 rounded-md">
                  {engine}
                </span>
              </div>

              {/* Prompt Textbox */}
              <div className="bg-[#f8f9fa] p-3 rounded-2xl border border-[#e5e7eb] font-mono text-xs text-[#2c3038] leading-relaxed">
                {generatedMasterPrompt}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="px-4 py-1.5 bg-[#1c1c1e] hover:bg-black text-white text-xs font-extrabold rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm text-[#ffd02f]">content_copy</span>
                    {isMm ? 'Copy Prompt' : 'Copy Prompt'}
                  </button>

                  {onSendToMatrix && (
                    <button
                      type="button"
                      onClick={() => {
                        onSendToMatrix(generatedMasterPrompt);
                        showToast(isMm ? 'Prompt Matrix သို့ ပို့ဆောင်ပြီးပါပြီ' : 'Sent to Prompt Matrix');
                      }}
                      className="px-4 py-1.5 bg-[#f0f2f5] hover:bg-[#e4e7eb] text-[#1c1c1e] text-xs font-extrabold rounded-full flex items-center gap-1.5 transition-all cursor-pointer border border-[#d2d6dc]"
                    >
                      <span className="material-symbols-outlined text-sm">hub</span>
                      {isMm ? 'Send to Matrix' : 'Send to Matrix'}
                    </button>
                  )}

                  {onSavePrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        onSavePrompt(generatedMasterPrompt, {
                          title: selectedPreset.nameEn,
                          stylePreset: selectedPreset.id,
                          type: 'manipulation'
                        });
                        showToast(isMm ? 'သိမ်းဆည်းထားသော Prompts ထဲ ထည့်သွင်းပြီးပါပြီ' : 'Saved to prompts list');
                      }}
                      className="px-3 py-1.5 bg-[#fff8e0] hover:bg-[#ffecb3] text-[#746019] text-xs font-bold rounded-full flex items-center gap-1 transition-all cursor-pointer border border-[#fcb900]/40"
                    >
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                      {isMm ? 'သိမ်းမည်' : 'Save'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadResult}
                  className="px-4 py-1.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-[#fcb900]/60"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  {isMm ? 'Download Photo (.PNG)' : 'Download Photo (.PNG)'}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: Style Presets & Interactive Custom Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Presets Header & Category Filter */}
            <div className="bg-white p-5 rounded-3xl border border-[#e5e7eb] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffd02f] text-2xl">palette</span>
                  <div>
                    <h2 className="text-sm font-black text-[#1c1c1e]">
                      {isMm ? 'Style Presets ရွေးချယ်မှု' : 'Creative Style Presets'}
                    </h2>
                    <p className="text-[11px] text-[#6b6f7e]">
                      {isMm ? 'ဖန်စီ၊ ဆိုင်ဘာနီယွန်၊ ရွှေဆိုင်းနှင့် ရေဆေးစတိုင်များ' : 'Curated surreal, sci-fi, traditional, and painterly effects'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: isMm ? 'အားလုံး' : 'All Presets' },
                  { id: 'fantasy', label: isMm ? 'စိတ်ကူးယဉ်' : 'Surreal & Fantasy' },
                  { id: 'cinematic', label: isMm ? 'ရုပ်ရှင်/Sci-Fi' : 'Cinematic' },
                  { id: 'burmese_fusion', label: isMm ? 'မြန်မာ့ရိုးရာ' : 'Burmese Fusion' },
                  { id: 'painterly', label: isMm ? 'ပန်းချီ' : 'Painterly' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#1c1c1e] text-white shadow-xs'
                        : 'bg-[#f4f5f7] text-[#6b6f7e] hover:text-[#1c1c1e]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-left group ${
                        isSelected
                          ? 'bg-[#1c1c1e] text-white border-[#ffd02f] shadow-md ring-2 ring-[#ffd02f]/40'
                          : 'bg-[#f8f9fa] hover:bg-white text-[#1c1c1e] border-[#e5e7eb] hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected ? 'bg-[#ffd02f] text-[#1c1c1e]' : 'bg-white text-[#555a6a] border border-[#e5e7eb]'
                          }`}>
                            <span className="material-symbols-outlined text-base">{preset.icon}</span>
                          </div>
                          <div>
                            <h3 className={`text-xs font-black leading-tight ${isSelected ? 'text-white' : 'text-[#1c1c1e]'}`}>
                              {isMm ? preset.nameMm : preset.nameEn}
                            </h3>
                            <span className="text-[10px] opacity-75 line-clamp-1">
                              {isMm ? preset.taglineMm : preset.taglineEn}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                          {preset.badge}
                        </span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[#ffd02f] text-sm">
                            check_circle
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Interactive Sliders & Layer Controls */}
            <div className="bg-white p-5 rounded-3xl border border-[#e5e7eb] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1c1c1e] text-xl">tune</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1c1c1e]">
                    {isMm ? 'စိတ်ကြိုက် အသေးစိတ် ချိန်ညှိမှုများ' : 'Custom Fine-Tuning & FX Layers'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPreset(selectedPreset)}
                  className="text-[11px] font-bold text-[#8e91a0] hover:text-[#1c1c1e] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span>
                  {isMm ? 'Reset Preset' : 'Reset Preset'}
                </button>
              </div>

              {/* Style Strength Master Slider */}
              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#f8f9fa] border border-[#e5e7eb]">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1c1c1e] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#ffd02f]">speed</span>
                    {isMm ? 'Style Strength / Blend အားကောင်းမှု' : 'Preset Style Strength'}
                  </span>
                  <span className="font-mono bg-[#1c1c1e] text-[#ffd02f] px-2 py-0.5 rounded-full text-[10px]">
                    {styleStrength}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={styleStrength}
                  onChange={(e) => setStyleStrength(Number(e.target.value))}
                  className="w-full accent-[#1c1c1e] cursor-pointer h-1.5 bg-[#e5e7eb] rounded-lg"
                />
              </div>

              {/* Adjustments: Brightness, Contrast, Saturation, Warmth */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Brightness */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#555a6a]">
                    <span>{isMm ? 'အလင်း (Brightness)' : 'Brightness'}</span>
                    <span className="font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg"
                  />
                </div>

                {/* Contrast */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#555a6a]">
                    <span>{isMm ? 'အမှောင်/အလင်း (Contrast)' : 'Contrast'}</span>
                    <span className="font-mono">{contrast > 0 ? `+${contrast}` : contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg"
                  />
                </div>

                {/* Saturation */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#555a6a]">
                    <span>{isMm ? 'ကာလာအား (Saturation)' : 'Saturation'}</span>
                    <span className="font-mono">{saturation > 0 ? `+${saturation}` : saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="60"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg"
                  />
                </div>

                {/* Warmth */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#555a6a]">
                    <span>{isMm ? 'အနွေးရောင် (Warmth)' : 'Warmth'}</span>
                    <span className="font-mono">{warmth > 0 ? `+${warmth}` : warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={warmth}
                    onChange={(e) => setWarmth(Number(e.target.value))}
                    className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg"
                  />
                </div>
              </div>

              {/* FX Layer Toggles & Special Particles */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f2f5]">
                <span className="text-[10px] font-bold text-[#8e91a0] uppercase tracking-wider">
                  {isMm ? 'အထူး FX Layer များ' : 'Creative FX Layers'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Bloom Toggle */}
                  <button
                    type="button"
                    onClick={() => setBloom(!bloom)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      bloom
                        ? 'bg-[#1c1c1e] text-[#ffd02f] border-[#ffd02f]'
                        : 'bg-[#f8f9fa] text-[#555a6a] border-[#e5e7eb]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">flare</span>
                      Bloom Glow
                    </span>
                    <span className="text-[10px] font-mono">{bloom ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Chromatic Aberration */}
                  <button
                    type="button"
                    onClick={() => setChromaticAberration(!chromaticAberration)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer ${
                      chromaticAberration
                        ? 'bg-[#1c1c1e] text-[#ffd02f] border-[#ffd02f]'
                        : 'bg-[#f8f9fa] text-[#555a6a] border-[#e5e7eb]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">filter_vintage</span>
                      RGB Split
                    </span>
                    <span className="text-[10px] font-mono">{chromaticAberration ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Particle Aura Select */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#555a6a]">
                    {isMm ? 'အမှုန်မွှား Aura (Particles)' : 'Aura Particles'}
                  </span>
                  <select
                    value={particles}
                    onChange={(e) => setParticles(e.target.value as any)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl text-xs font-bold px-2.5 py-1 text-[#1c1c1e] cursor-pointer"
                  >
                    <option value="none">None (ပိတ်ထားမည်)</option>
                    <option value="gold_sparks">Gold Sparks (ရွှေမီးပွား)</option>
                    <option value="cosmic_stars">Cosmic Stars (ကြယ်စင်များ)</option>
                    <option value="lotus_petals">Lotus Petals (ကြာပွင့်ဖူး)</option>
                    <option value="mist">Misty Fog (နှင်းငွေ့အလင်း)</option>
                  </select>
                </div>

                {/* Overlay Blend */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#555a6a]">
                    {isMm ? 'အနုပညာ အလွှာ (Overlay Blend)' : 'Artistic Overlay'}
                  </span>
                  <select
                    value={overlayBlend}
                    onChange={(e) => setOverlayBlend(e.target.value as any)}
                    className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl text-xs font-bold px-2.5 py-1 text-[#1c1c1e] cursor-pointer"
                  >
                    <option value="none">Standard Clean</option>
                    <option value="double_exposure">Bagan Double Exposure</option>
                    <option value="gold_leaf">24K Gold Leaf Flakes</option>
                    <option value="cyber_neon">Neon Glitch Rim</option>
                    <option value="sun_flare">Anamorphic Sun Flare</option>
                    <option value="watercolor">Watercolor Fluid Wash</option>
                  </select>
                </div>

                {/* Film Grain */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between font-bold text-[#555a6a] text-xs">
                    <span>{isMm ? 'ဖလင်အမှုန် (Film Grain)' : '35mm Film Grain'}</span>
                    <span className="font-mono">{Math.round(grain * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={grain}
                    onChange={(e) => setGrain(Number(e.target.value))}
                    className="w-full accent-[#1c1c1e] cursor-pointer h-1 bg-[#e5e7eb] rounded-lg"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Highlights & Technical Guide Footer */}
        <div className="mt-12 bg-white rounded-3xl p-6 border border-[#e5e7eb] shadow-xs">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#8e91a0] mb-4">
            {isMm ? 'Photo Manipulation Studio အသုံးပြုနည်းနှင့် နည်းပညာ အကျဉ်း' : 'Manipulation Architecture & Pro Studio Pipeline'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#1c1c1e]">
                <span className="w-6 h-6 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-xs font-bold">1</span>
                {isMm ? 'Custom Photo Upload & Precision Fit' : 'Custom Photo Upload & Precision Fit'}
              </div>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                {isMm
                  ? 'မိမိစက်ထဲမှ မည်သည့် JPG, PNG ဓာတ်ပုံကိုမဆို တိုက်ရိုက် Drag & Drop သို့မဟုတ် Upload ပြုလုပ်နိုင်ပြီး မျက်နှာသွင်ပြင်နှင့် အလင်းအမှောင်ကို AI က ထိန်းသိမ်းပေးပါသည်။'
                  : 'Drag & drop or upload any custom photo. The system preserves portrait likeness while harmonizing luminance and tonal depth.'}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#1c1c1e]">
                <span className="w-6 h-6 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-xs font-bold">2</span>
                {isMm ? 'Curated Creative Style Presets' : 'Curated Creative Style Presets'}
              </div>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                {isMm
                  ? 'စကြဝဠာ ဂလက်ဆီ၊ ပုဂံရှေးဟောင်း Double Exposure၊ ၂၄ ကာရက်ရွှေဆိုင်းနှင့် ဆိုင်ဘာနီယွန် အသွင်များကို ချက်ချင်း ကလစ်တစ်ချက်ဖြင့် ပြောင်းလဲနိုင်ပါသည်။'
                  : 'Select from high-concept surrealism, Bagan double exposures, 24K gold foil inlays, and cyberpunk neon lighting with live GPU/Canvas shaders.'}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#1c1c1e]">
                <span className="w-6 h-6 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center text-xs font-bold">3</span>
                {isMm ? '8K PNG Export & AI Prompt Synthesis' : '8K PNG Export & AI Prompt Synthesis'}
              </div>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                {isMm
                  ? 'ပြုပြင်ပြီး ဓာတ်ပုံကို မိမိစက်ထဲသို့ အခမဲ့ တိုက်ရိုက် ဒေါင်းလုဒ်ဆွဲနိုင်သလို Midjourney နှင့် Flux အတွက် တိကျသော Master Prompt ကို ရယူနိုင်ပါသည်။'
                  : 'Export full-resolution PNG results for production, or copy synthesized master prompts directly for Midjourney v6.1 and Flux.1.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
