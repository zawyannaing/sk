import React, { useState, useMemo, useRef } from 'react';
import {
  AppMode,
  Language,
  MatrixSelection,
  PresetTemplate,
  PromptResult
} from '../types';
import {
  SUBJECT_OPTIONS,
  PET_OPTIONS,
  PRODUCT_OPTIONS,
  FASHION_OPTIONS,
  WEDDING_COUPLE_OPTIONS,
  LOVERS_COUPLE_OPTIONS,
  EVENT_OPTIONS,
  LOCATION_OPTIONS,
  LIGHTING_OPTIONS,
  MOOD_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  RETOUCH_OPTIONS,
  COLOR_GRADE_OPTIONS,
  ASPECT_RATIOS,
  QUALITY_PROFILES,
  GARMENT_OPTIONS,
  IDENTITY_LOCK_OPTIONS,
  ETHNICITY_OPTIONS,
  POSE_EXPRESSION_OPTIONS,
  AGE_RANGE_OPTIONS,
  CHILD_AGE_OPTIONS,
  HEIGHT_OPTIONS,
  WEIGHT_OPTIONS
} from '../data/presetData';

// Sub components
import { CoupleDetailsCustomizer } from './CoupleDetailsCustomizer';
import { WeddingPropsPanel } from './WeddingPropsPanel';
import { SubjectPreserveFeatureBox } from './SubjectPreserveFeatureBox';
import { CulturalPropsDropdown } from './CulturalPropsDropdown';
import { GarmentSelectionCarousel } from './GarmentSelectionCarousel';
import { CustomGarmentUploader } from './CustomGarmentUploader';
import { ClothesSwapPanel } from './ClothesSwapPanel';
import { EventSelectionCarousel } from './EventSelectionCarousel';
import { LocationSelectionCarousel } from './LocationSelectionCarousel';
import { LightingSelectionCarousel } from './LightingSelectionCarousel';
import { SkinRetouchSelectionCarousel } from './SkinRetouchSelectionCarousel';
import { PoseSelectionCarousel } from './PoseSelectionCarousel';
import { FilmColorSelectionCarousel } from './FilmColorSelectionCarousel';
import { MakeupSelectionCarousel } from './MakeupSelectionCarousel';
import { MoodSelectionCarousel } from './MoodSelectionCarousel';
import { CameraSelectionCarousel } from './CameraSelectionCarousel';
import { PhotoStyleSelectionCarousel } from './PhotoStyleSelectionCarousel';
import { CameraAngleSelectionCarousel } from './CameraAngleSelectionCarousel';
import { QualityEngineSelectionCarousel } from './QualityEngineSelectionCarousel';
import { Img2ImgUploader } from './Img2ImgUploader';
import { PresetGallery } from './PresetGallery';
import { SelectedOptionsSummaryModal } from './SelectedOptionsSummaryModal';

// Icons
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  User,
  Shirt,
  MapPin,
  Camera,
  Sparkles,
  Globe,
  Clock,
  Ruler,
  Scale,
  Heart,
  Film,
  Mountain,
  Sun,
  Palette,
  Check,
  Layers,
  Maximize2,
  Smile,
  ShieldCheck,
  Settings2,
  SlidersHorizontal,
  Sliders,
  Edit2,
  Trash2,
  Menu,
  Wand2,
  RefreshCcw,
  CheckCircle2
} from 'lucide-react';

export type PillarId = 'box1' | 'box2' | 'box3' | 'box4';

interface SubMenuDefinition {
  id: string;
  countBadge?: string | number;
  labelMm: string;
  labelEn: string;
  descMm: string;
  descEn: string;
  icon: React.ElementType;
  keywords: string[];
  getCurrentSummary: (selection: MatrixSelection, language: Language) => string;
}

interface PillarDefinition {
  id: PillarId;
  boxNumber: string;
  boxLabel: string;
  titleMm: string;
  titleEn: string;
  taglineMm: string;
  taglineEn: string;
  icon: React.ElementType;
  subMenus: SubMenuDefinition[];
  getCurrentSummary: (selection: MatrixSelection, language: Language) => string;
}

interface ExecutiveMasterDetailStudioProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  onGeneratePrompt: () => void;
  isGeneratingPrompt: boolean;
  onResetAll: () => void;
  onOpenOutput?: () => void;
  promptResult?: PromptResult | null;
  onSelectPreset?: (preset: PresetTemplate) => void;
  activePresetId?: string;
}

export const ExecutiveMasterDetailStudio: React.FC<ExecutiveMasterDetailStudioProps> = ({
  currentMode,
  onModeChange,
  language,
  selection,
  onUpdateSelection,
  onGeneratePrompt,
  isGeneratingPrompt,
  onResetAll,
  onOpenOutput,
  promptResult,
  onSelectPreset,
  activePresetId
}) => {
  const isMyanmar = language === 'my';

  // Master State: null means First Interface (Welcome view with 4 boxes)
  const [activePillarId, setActivePillarId] = useState<PillarId | null>(null);

  // Active sub-menu inside the side panel
  const [activeSubMenuId, setActiveSubMenuId] = useState<string>('subject_type');

  // Prominent enclosed search query inside the opened side panel
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Template gallery toggle (accordion under Welcome title in reference design)
  const [isTemplateOpen, setIsTemplateOpen] = useState<boolean>(false);

  // Selected options summary modal state
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  // Internal helper states
  const [userAgeMode, setUserAgeMode] = useState<'child' | 'adult' | null>(null);
  const [showPersonBoxesInBackgroundMode, setShowPersonBoxesInBackgroundMode] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'pet' | 'product' | 'fashion' | 'couple_wedding' | 'couple_lovers'>(
    selection.subject === 'product' ? 'product' : selection.subject === 'fashion' ? 'fashion' : selection.subject === 'couple' ? 'couple_wedding' : 'pet'
  );

  const shouldHidePersonBoxes = currentMode === 'background-only' && !showPersonBoxesInBackgroundMode;

  const heightScrollRef = useRef<HTMLDivElement>(null);
  const weightScrollRef = useRef<HTMLDivElement>(null);

  const handleHeightScroll = (direction: 'left' | 'right') => {
    if (heightScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      heightScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleWeightScroll = (direction: 'left' | 'right') => {
    if (weightScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      weightScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // -------------------------------------------------------------
  // PILLARS DEFINITION MAPPING TO BOX 1, BOX 2, BOX 3, BOX 4
  // -------------------------------------------------------------
  const PILLARS: PillarDefinition[] = useMemo(() => [
    {
      id: 'box1',
      boxNumber: '1',
      boxLabel: 'Box1',
      titleMm: 'အဓိက ဇာတ်ကောင်နှင့် ကိုယ်ပိုင်ဟန်',
      titleEn: 'Subject & Identity Architecture',
      taglineMm: 'ဇာတ်ကောင်၊ အသက်၊ လူမျိုး၊ ဟန်ပန် နှင့် မျက်နှာမူရင်းရုပ် ထိန်းသိမ်းခြင်း',
      taglineEn: 'Character, ethnicity, stature, signature pose, and 100% facial preservation',
      icon: User,
      getCurrentSummary: (sel, lang) => {
        const sub = SUBJECT_OPTIONS.find(s => s.id === sel.subject);
        const eth = ETHNICITY_OPTIONS.find(e => e.id === sel.ethnicity);
        const lock = IDENTITY_LOCK_OPTIONS.find(l => l.id === sel.identityLock);
        const subName = lang === 'my' ? (sub?.labelMm || 'အမျိုးသမီး') : (sub?.labelEn || 'Woman');
        const ethName = lang === 'my' ? (eth?.labelMm || 'မြန်မာ') : (eth?.labelEn || 'Burmese');
        const lockName = lock ? (lang === 'my' ? lock.labelMm : lock.labelEn) : '100% Face Lock';
        return `${subName} · ${ethName} · ${lockName}`;
      },
      subMenus: [
        {
          id: 'subject_type',
          countBadge: '7',
          labelMm: 'ဇာတ်ကောင် အမျိုးအစား',
          labelEn: 'Subject Category',
          descMm: 'အမျိုးသမီး၊ အမျိုးသား၊ စုံတွဲ၊ ကလေး၊ တိရစ္ဆာန်၊ ကုန်ပစ္စည်း၊ ဖက်ရှင်',
          descEn: 'Woman, Man, Couple, Child, Pet, Commercial Product, Fashion',
          icon: User,
          keywords: ['subject', 'woman', 'man', 'couple', 'child', 'pet', 'product', 'fashion', 'ဇာတ်ကောင်', 'အမျိုးသမီး'],
          getCurrentSummary: (sel, lang) => {
            const opt = SUBJECT_OPTIONS.find(s => s.id === sel.subject);
            return opt ? `${opt.emoji} ${lang === 'my' ? opt.labelMm : opt.labelEn}` : 'Woman';
          }
        },
        {
          id: 'identity_lock',
          countBadge: '4',
          labelMm: 'ရည်ညွှန်းပုံနှင့် မျက်နှာထိန်းချုပ်မှု',
          labelEn: 'Identity Lock & Face Ref',
          descMm: 'မူရင်းရုပ် ၁၀၀% မပြောင်းစေရန် Face Lock နှင့် Reference ပုံတင်ရန်',
          descEn: '100% Facial Identity Lock, Body Structure Lock & Photo Reference',
          icon: ShieldCheck,
          keywords: ['identity', 'lock', 'face', 'preserve', 'reference', 'img2img', 'မျက်နှာ', 'မူရင်းရုပ်'],
          getCurrentSummary: (sel, lang) => {
            const lock = IDENTITY_LOCK_OPTIONS.find(l => l.id === sel.identityLock);
            return lock ? `${lock.emoji} ${lang === 'my' ? lock.labelMm : lock.labelEn}` : '100% Face Lock';
          }
        },
        {
          id: 'ethnicity_culture',
          countBadge: '9',
          labelMm: 'လူမျိုးနှင့် ယဉ်ကျေးမှု ရိုးရာ',
          labelEn: 'Ethnicity & Cultural Heritage',
          descMm: 'မြန်မာ၊ ရှမ်း၊ ကရင်၊ ထိုင်း၊ ကိုရီးယား၊ အနောက်တိုင်း၊ ယဉ်ကျေးမှု အသုံးအဆောင်',
          descEn: 'Burmese, Shan, Karen, Thai, Korean, Western & Cultural Props',
          icon: Globe,
          keywords: ['ethnicity', 'culture', 'burmese', 'shan', 'karen', 'thanaka', 'umbrella', 'လူမျိုး', 'ယဉ်ကျေးမှု'],
          getCurrentSummary: (sel, lang) => {
            const eth = ETHNICITY_OPTIONS.find(e => e.id === (sel.ethnicity || 'burmese'));
            return eth ? `${eth.emoji} ${lang === 'my' ? eth.labelMm : eth.labelEn}` : 'Burmese';
          }
        },
        {
          id: 'physical_profile',
          countBadge: '3',
          labelMm: 'အရပ်၊ အလေးချိန်နှင့် အသက်',
          labelEn: 'Physical Stature & Age Profile',
          descMm: 'ကလေးအသက် (၃–၁၂)၊ လူကြီးအသက်၊ အရပ်အမြင့် (Height)၊ ခန္ဓာကိုယ် တည်ဆောက်ပုံ',
          descEn: 'Child/Adult Age, Stature / Height, and Body Build Profile',
          icon: Ruler,
          keywords: ['age', 'height', 'weight', 'stature', 'body', 'build', 'အသက်', 'အရပ်', 'အလေးချိန်'],
          getCurrentSummary: (sel, lang) => {
            const age = [...CHILD_AGE_OPTIONS, ...AGE_RANGE_OPTIONS].find(a => a.id === sel.ageRange);
            const h = HEIGHT_OPTIONS.find(ht => ht.id === sel.heightRange);
            return `${age ? (lang === 'my' ? age.labelMm : age.labelEn) : '26-35 yrs'} ${h ? `· ${h.labelEn}` : ''}`;
          }
        },
        {
          id: 'pose_expression',
          countBadge: '25',
          labelMm: 'ဟန်ပန်နှင့် မျက်နှာအမူအရာ',
          labelEn: 'Pose & Facial Expression',
          descMm: 'စတူဒီယို ပရော်ဖက်ရှင်နယ် ဓာတ်ပုံဟန်ပန် ၂၅ မျိုး',
          descEn: '25 signature editorial, portrait, and action pose selections',
          icon: Smile,
          keywords: ['pose', 'expression', 'stance', 'emotion', 'smile', 'look', 'ဟန်ပန်', 'အမူအရာ'],
          getCurrentSummary: (sel, lang) => {
            const p = POSE_EXPRESSION_OPTIONS.find(po => po.id === sel.poseExpression);
            return p ? `${p.emoji} ${lang === 'my' ? p.labelMm : p.labelEn}` : 'Looking at Camera';
          }
        },
        {
          id: 'couple_customizer',
          countBadge: '20',
          labelMm: 'စုံတွဲနှင့် မင်္ဂလာဆောင် စတူဒီယို',
          labelEn: 'Couple & Wedding Studio',
          descMm: 'မင်္ဂလာဆောင်နှင့် ချစ်သူရည်စား စုံတွဲ၊ သတို့သား/သတို့သမီး ဝတ်စုံနှင့် ခေတ် ၃ ခေတ်',
          descEn: 'Romantic Lovers & Wedding Ceremony customization with 3 Historic Eras',
          icon: Heart,
          keywords: ['couple', 'wedding', 'bride', 'groom', 'lovers', 'စုံတွဲ', 'မင်္ဂလာဆောင်'],
          getCurrentSummary: (sel, lang) => {
            return sel.coupleOutfitType === 'wedding'
              ? (lang === 'my' ? '💍 မင်္ဂလာဆောင် စုံတွဲ' : '💍 Wedding Couple')
              : (lang === 'my' ? '👩‍❤️‍👨 ချစ်သူရည်စား စုံတွဲ' : '👩‍❤️‍👨 Lovers Couple');
          }
        }
      ]
    },
    {
      id: 'box2',
      boxNumber: '2',
      boxLabel: 'Box2',
      titleMm: 'ဖက်ရှင်၊ အဝတ်အစားနှင့် ဝတ်စုံလဲ',
      titleEn: 'Wardrobe & Clothes Swap Studio',
      taglineMm: 'မဂ္ဂဇင်း ဖက်ရှင် ဝတ်စုံလဲ၊ ရိုးရာ ပိုးလုံချည် နှင့် ခေတ်မီ ဒီဇိုင်းများ',
      taglineEn: 'AI fashion clothes swapping, silk longyi, evening gowns, and fabrics',
      icon: Shirt,
      getCurrentSummary: (sel, lang) => {
        const g = GARMENT_OPTIONS.find(ga => ga.id === sel.garmentStyle);
        const gName = g ? (lang === 'my' ? g.labelMm : g.labelEn) : 'Silk Longyi';
        const fab = sel.garmentFabric || 'Woven Silk';
        return `${gName} · ${fab}`;
      },
      subMenus: [
        {
          id: 'clothes_swap_studio',
          countBadge: '2',
          labelMm: 'မဂ္ဂဇင်း ဝတ်စုံလဲ စတူဒီယို',
          labelEn: 'AI Clothes Swap Studio',
          descMm: 'ပုံထဲရှိ မူရင်းလူကို မပြောင်းဘဲ ဝတ်စုံလဲလှယ်ပေးသော စနစ် (Presets / Custom Upload)',
          descEn: 'High-fashion garment replacement using presets or custom uploaded garments',
          icon: Shirt,
          keywords: ['clothes', 'swap', 'fashion', 'outfit', 'magazine', 'upload', 'ဝတ်စုံလဲ', 'ဖက်ရှင်'],
          getCurrentSummary: (sel, lang) => {
            return sel.clothesSwapOption === 'custom_garment_upload'
              ? (lang === 'my' ? '📁 ကိုယ်ပိုင်ဝတ်စုံ တင်ထားသည်' : '📁 Custom Garment')
              : (lang === 'my' ? '✨ အသင့်ပါ ဝတ်စုံရွေးထားသည်' : '✨ In-App Presets');
          }
        },
        {
          id: 'garment_catalog',
          countBadge: '32',
          labelMm: 'ဝတ်စုံ စတိုင်လ် ရွေးချယ်မှု',
          labelEn: 'Garment & Outfit Catalog',
          descMm: 'မြန်မာ့ရိုးရာ ချိတ်ထည်၊ ပိုးလုံချည်၊ ညနေခင်းဝတ်စုံ၊ စမတ်ကျသော ဖက်ရှင် ၃၂ မျိုး',
          descEn: '32 traditional longyi, modern suits, evening dresses, and street styles',
          icon: Palette,
          keywords: ['garment', 'longyi', 'silk', 'gown', 'suit', 'dress', 'acheik', 'လုံချည်', 'ပိုး', 'ဝတ်စုံ'],
          getCurrentSummary: (sel, lang) => {
            const g = GARMENT_OPTIONS.find(ga => ga.id === sel.garmentStyle);
            return g ? (lang === 'my' ? g.labelMm : g.labelEn) : 'Silk Longyi';
          }
        },
        {
          id: 'fabric_texture',
          countBadge: '6',
          labelMm: 'ပိတ်စ နှင့် အသွင်အပြင် (Fabric)',
          labelEn: 'Fabric Texture & Material',
          descMm: 'ပိုးရက်ကန်း၊ ရေစက်ကလေးများ၊ ကတ္တီပါ၊ ဇာ၊ ရွှေချည်ထိုး ပိတ်စများ',
          descEn: 'Woven Silk with Water Droplets, Velvet, Satin, Gold Brocade, Handwoven Cotton',
          icon: Layers,
          keywords: ['fabric', 'material', 'silk', 'texture', 'velvet', 'cotton', 'ပိတ်စ', 'အထည်'],
          getCurrentSummary: (sel) => {
            return sel.garmentFabric || 'Woven Silk with Water Droplets';
          }
        },
        {
          id: 'cultural_accessories',
          countBadge: '33',
          labelMm: 'ရိုးရာ အသုံးအဆောင်နှင့် ရတနာ',
          labelEn: 'Cultural Props & Ornaments',
          descMm: 'ပုသိမ်ထီး၊ စပယ်ပန်းကုံး၊ သနပ်ခါး၊ ရှမ်းလွယ်အိတ်၊ ရွှေဆွဲကြိုးနှင့် ကျောက်မျက်များ',
          descEn: 'Pathein oil-paper umbrella, Jasmine garland, Thanaka paste, Shan bag, Royal jewelry',
          icon: Sparkles,
          keywords: ['props', 'ornaments', 'umbrella', 'jewelry', 'garland', 'ပုသိမ်ထီး', 'ပန်းကုံး', 'ရတနာ'],
          getCurrentSummary: (sel, lang) => {
            return sel.includeCulturalProps
              ? (lang === 'my' ? '🌸 ရိုးရာပစ္စည်းများ ထည့်သွင်းထားသည်' : '🌸 Props Enabled')
              : (lang === 'my' ? 'မပါဝင်ပါ' : 'None');
          }
        }
      ]
    },
    {
      id: 'box3',
      boxNumber: '3',
      boxLabel: 'Box3',
      titleMm: 'နောက်ခံ၊ ပွဲတော်နှင့် အလင်းအမှောင်',
      titleEn: 'Scene, Environment & Lighting',
      taglineMm: 'သင်္ကြန်၊ သီတင်းကျွတ်၊ ဆိုက်ဘာရန်ကုန်၊ ပုဂံ နှင့် စတူဒီယို အလင်းအမှောင်',
      taglineEn: 'Festivals, cyber environments, ancient temples, and master studio lighting',
      icon: MapPin,
      getCurrentSummary: (sel, lang) => {
        const ev = EVENT_OPTIONS.find(e => e.id === sel.event);
        const loc = LOCATION_OPTIONS.find(l => l.id === sel.location);
        const lit = LIGHTING_OPTIONS.find(li => li.id === sel.timeAndLighting);
        const evName = ev ? (lang === 'my' ? ev.labelMm : ev.labelEn) : 'Thingyan';
        const locName = loc ? (lang === 'my' ? loc.labelMm : loc.labelEn) : 'Cyber Yangon';
        const litName = lit ? (lang === 'my' ? lit.labelMm : lit.labelEn) : 'Neon Midnight';
        return `${evName} · ${locName} · ${litName}`;
      },
      subMenus: [
        {
          id: 'events_festivals',
          countBadge: '30',
          labelMm: 'ပွဲတော်များနှင့် အခမ်းအနားများ',
          labelEn: 'Festivals & Events',
          descMm: 'သင်္ကြန် ရေကစားပွဲတော်၊ သီတင်းကျွတ် မီးထွန်းပွဲ၊ တန်ဆောင်တိုင်၊ မင်္ဂလာပွဲ ၃၀ မျိုး',
          descEn: 'Thingyan Water Festival, Thadingyut Lanterns, Tazaungdaing, Wedding Reception',
          icon: Sun,
          keywords: ['event', 'festival', 'thingyan', 'thadingyut', 'wedding', 'beach', 'ပွဲတော်', 'သင်္ကြန်'],
          getCurrentSummary: (sel, lang) => {
            const ev = EVENT_OPTIONS.find(e => e.id === sel.event);
            return ev ? `${ev.emoji} ${lang === 'my' ? ev.labelMm : ev.labelEn}` : 'Thingyan Festival';
          }
        },
        {
          id: 'locations_environments',
          countBadge: '36',
          labelMm: 'နောက်ခံ ရှုခင်းနှင့် တည်နေရာ',
          labelEn: 'Locations & Backdrops',
          descMm: 'ဆိုက်ဘာ ရန်ကုန်၊ ပုဂံ ရှေးဟောင်းဘုရားများ၊ အင်းလေးကန်၊ ခေတ်မီ စတူဒီယို ၃၆ မျိုး',
          descEn: 'Cyber Yangon, Bagan Temples, Inle Lake, Modern Minimalist Studio, Luxury Hotel',
          icon: Mountain,
          keywords: ['location', 'place', 'city', 'yangon', 'bagan', 'studio', 'temple', 'နောက်ခံ', 'နေရာ'],
          getCurrentSummary: (sel, lang) => {
            const loc = LOCATION_OPTIONS.find(l => l.id === sel.location);
            return loc ? `${loc.emoji} ${lang === 'my' ? loc.labelMm : loc.labelEn}` : 'Cyber Yangon';
          }
        },
        {
          id: 'lighting_ambiance',
          countBadge: '30',
          labelMm: 'စတူဒီယို အလင်းအမှောင် (Lighting)',
          labelEn: 'Studio & Natural Lighting',
          descMm: 'ရမ်ဘရန့် စတူဒီယိုမီး၊ နီယွန်မီးရောင်၊ ညနေခင်း ရွှေရောင်ဆည်းဆာ၊ သဘာဝအလင်း ၃၀ မျိုး',
          descEn: 'Studio Rembrandt, Neon Practical, Volumetric Rim Light, Golden Hour, Soft Natural',
          icon: Sun,
          keywords: ['lighting', 'light', 'rembrandt', 'neon', 'golden hour', 'rim light', 'studio', 'အလင်း'],
          getCurrentSummary: (sel, lang) => {
            const lit = LIGHTING_OPTIONS.find(l => l.id === sel.timeAndLighting);
            return lit ? `${lit.emoji} ${lang === 'my' ? lit.labelMm : lit.labelEn}` : 'Neon Midnight';
          }
        },
        {
          id: 'mood_emotion',
          countBadge: '15',
          labelMm: 'ခံစားချက် နှင့် ရသ (Mood)',
          labelEn: 'Mood & Emotional Tone',
          descMm: 'ကြည်နူးဖွယ်၊ ရုပ်ရှင်ဆန်သော အခိုက်အတန့်၊ လွမ်းမောဖွယ်၊ တက်ကြွရွှင်လန်း ၁၅ မျိုး',
          descEn: 'Dreamy Romantic, Cinematic Dramatic, Joyful Celebration, Serene Peace',
          icon: Heart,
          keywords: ['mood', 'emotion', 'romantic', 'dramatic', 'joy', 'vibe', 'atmosphere', 'ခံစားချက်'],
          getCurrentSummary: (sel, lang) => {
            const m = MOOD_OPTIONS.find(mo => mo.id === sel.moodEmotion);
            return m ? `${m.emoji} ${lang === 'my' ? m.labelMm : m.labelEn}` : 'Cinematic Dramatic';
          }
        },
        {
          id: 'background_only_settings',
          countBadge: '1',
          labelMm: 'နောက်ခံ သီးသန့် မုဒ် (Scenery Isolation)',
          labelEn: 'Background Scenery Isolation',
          descMm: 'လူပုဂ္ဂိုလ်ပုံ မပါဘဲ သဘာဝရှုခင်းနှင့် စတူဒီယို နောက်ခံ သီးသန့် ထုတ်လုပ်ရန် ဆက်တင်',
          descEn: 'Isolate pure scenery without models, with option to toggle character parameters',
          icon: Mountain,
          keywords: ['background', 'scenery', 'landscape', 'backdrop', 'isolation', 'နောက်ခံ'],
          getCurrentSummary: () => {
            return currentMode === 'background-only'
              ? (isMyanmar ? '🏞️ Background Mode Active' : '🏞️ Active')
              : (isMyanmar ? 'ပုံမှန် မုဒ်' : 'Standard');
          }
        }
      ]
    },
    {
      id: 'box4',
      boxNumber: '4',
      boxLabel: 'Box4',
      titleMm: 'ကင်မရာ၊ ဖလင်နှင့် စတူဒီယို မက်ထရစ်',
      titleEn: 'Optics, Camera & Studio Matrix',
      taglineMm: 'Sony A7R V၊ Hasselblad၊ Kodak Portra 400၊ 8K UHD နှင့် 9:16 အချိုးအစား',
      taglineEn: 'Professional lenses, film stocks, skin retouches, aspect ratios, and AI engines',
      icon: Camera,
      getCurrentSummary: (sel) => {
        const cam = CAMERA_OPTIONS.find(c => c.id === sel.camera);
        const col = COLOR_GRADE_OPTIONS.find(c => c.id === sel.colorGrade);
        const ar = sel.aspectRatio || '9:16';
        const camName = cam?.label || 'Sony A7R V';
        const colName = col?.labelEn || 'Cyber Neon';
        return `${camName} · ${colName} · ${ar}`;
      },
      subMenus: [
        {
          id: 'camera_lens',
          countBadge: '20',
          labelMm: 'ကင်မရာနှင့် မှန်ဘီလူး (Camera & Lens)',
          labelEn: 'Camera Body & Optics',
          descMm: 'Sony A7R V 85mm f/1.2၊ Hasselblad H6D-100c၊ Leica M11၊ Canon EOS R5 ၂၀ မျိုး',
          descEn: 'Sony A7R V, Hasselblad medium format, Leica M11, Canon EOS R5 optics',
          icon: Camera,
          keywords: ['camera', 'lens', 'sony', 'hasselblad', 'leica', 'canon', 'aperture', 'ကင်မရာ'],
          getCurrentSummary: (sel) => {
            const cam = CAMERA_OPTIONS.find(c => c.id === sel.camera);
            return cam ? cam.label : 'Sony A7R V (85mm f/1.2)';
          }
        },
        {
          id: 'camera_angles',
          countBadge: '15',
          labelMm: 'ကင်မရာ အလှည့်အကွေး (Angles & Framing)',
          labelEn: 'Camera Angles & Framing',
          descMm: 'မျက်လုံးအဆင့် မျက်နှာပုံ၊ အောက်မှပင့်ရိုက်ချက်၊ ဒတ်ချ်ထောင့်၊ အနီးကပ် မက်ခရို ၁၅ မျိုး',
          descEn: 'Eye-level portrait, Low-angle majestic, Dutch angle, Close-up macro, Drone view',
          icon: SlidersHorizontal,
          keywords: ['angle', 'framing', 'close-up', 'low angle', 'drone', 'macro', 'ရှုထောင့်'],
          getCurrentSummary: (sel, lang) => {
            const a = CAMERA_ANGLE_OPTIONS.find(ang => ang.id === sel.cameraAngle);
            return a ? `${a.emoji} ${lang === 'my' ? a.labelMm : a.labelEn}` : 'Eye-level Portrait';
          }
        },
        {
          id: 'color_film',
          countBadge: '19',
          labelMm: 'ဖလင် အရောင်တိုနင် (Film Stocks & LUTs)',
          labelEn: 'Film Stocks & Color LUTs',
          descMm: 'Kodak Portra 400၊ Fujifilm Pro 400H၊ Cyber Neon၊ CineModern Teal & Orange ၁၉ မျိုး',
          descEn: 'Kodak Portra 400, Fujifilm Pro 400H, Cyber Neon, CineModern Teal & Orange',
          icon: Film,
          keywords: ['film', 'color', 'portra', 'fuji', 'neon', 'teal orange', 'grade', 'lut', 'ဖလင်'],
          getCurrentSummary: (sel, lang) => {
            const col = COLOR_GRADE_OPTIONS.find(c => c.id === sel.colorGrade);
            return col ? (lang === 'my' ? col.labelMm : col.labelEn) : 'Cyber Neon';
          }
        },
        {
          id: 'retouch_makeup',
          countBadge: '15',
          labelMm: 'အသားအရေ နှင့် မိတ်ကပ် (Skin & Makeup)',
          labelEn: 'Skin Retouching & Makeup',
          descMm: 'ချွေးပေါက်ပါမြင်ရသော သဘာဝအသားအရေ၊ မြန်မာ့ရိုးရာ သနပ်ခါး၊ Glamour မိတ်ကပ်',
          descEn: 'Sub-surface skin pores, natural editorial finish, traditional Thanaka, and glam makeup',
          icon: Sparkles,
          keywords: ['skin', 'retouch', 'makeup', 'pores', 'beauty', 'thanaka', 'အသားအရေ', 'မိတ်ကပ်'],
          getCurrentSummary: (sel, lang) => {
            const ret = RETOUCH_OPTIONS.find(r => r.id === sel.retouching);
            return ret ? (lang === 'my' ? ret.labelMm : ret.labelEn) : 'Ultra-Realism';
          }
        },
        {
          id: 'photo_styles',
          countBadge: '20',
          labelMm: 'ဓာတ်ပုံ အနုပညာ စတိုင်လ် (Photo Styles)',
          labelEn: 'Photography Aesthetics',
          descMm: 'ဖက်ရှင် မဂ္ဂဇင်း စတိုင်လ်၊ မှတ်တမ်းရုပ်ရှင်၊ ရုပ်ရှင်ကားကြီး စတိုင်လ် ၂၀ မျိုး',
          descEn: 'High Fashion Editorial, Documentary Photojournalism, Cinematic Still, 90s Film',
          icon: Palette,
          keywords: ['style', 'photo style', 'aesthetic', 'vogue', 'editorial', 'vintage', 'စတိုင်လ်'],
          getCurrentSummary: (sel, lang) => {
            const ps = PHOTO_STYLE_OPTIONS.find(p => p.id === sel.photoStyle);
            return ps ? `${ps.emoji} ${lang === 'my' ? ps.labelMm : ps.labelEn}` : 'Editorial Vogue';
          }
        },
        {
          id: 'aspect_ratio_settings',
          countBadge: '6',
          labelMm: 'ဓာတ်ပုံ အချိုးအစား (Aspect Ratio)',
          labelEn: 'Aspect Ratio & Resolution',
          descMm: '9:16 (TikTok/Reels), 4:5 (Instagram), 16:9 (Widescreen), 1:1 (Square), 3:4',
          descEn: '9:16 TikTok/Reels, 4:5 Instagram Portrait, 16:9 Cinematic, 1:1 Square, 3:4',
          icon: Maximize2,
          keywords: ['aspect', 'ratio', 'resolution', '9:16', '4:5', '16:9', '1:1', 'pixels', 'အချိုးအစား'],
          getCurrentSummary: (sel) => {
            const ar = ASPECT_RATIOS.find(r => r.ratio === (sel.aspectRatio || '9:16') || r.id === sel.aspectRatio);
            return ar ? `${ar.ratio} (${ar.width}×${ar.height})` : '9:16 (1080×1920)';
          }
        },
        {
          id: 'quality_engine_settings',
          countBadge: '15',
          labelMm: 'အရည်အသွေး အင်ဂျင် နှင့် Sliders',
          labelEn: 'Quality Profile & Weights',
          descMm: '8K UHD Ultra Detail, Midjourney Raw, Unreal Engine 5, Style Strength & Weight',
          descEn: '8K UHD Ultra Detail, Midjourney Photoreal, Unreal Engine 5, Style & Prompt Weights',
          icon: Settings2,
          keywords: ['quality', 'engine', '8k', 'uhd', 'unreal', 'weight', 'strength', 'sliders', 'အင်ဂျင်'],
          getCurrentSummary: (sel) => {
            const q = QUALITY_PROFILES.find(qp => qp.id === sel.qualityProfile);
            return q ? q.label : '8K UHD Masterpiece';
          }
        }
      ]
    }
  ], [currentMode, isMyanmar]);

  const currentPillar = useMemo(() => {
    if (!activePillarId) return null;
    return PILLARS.find(p => p.id === activePillarId) || PILLARS[0];
  }, [activePillarId, PILLARS]);

  const handleSelectPillar = (pillarId: PillarId, subMenuId?: string) => {
    setActivePillarId(pillarId);
    setSearchQuery('');
    const pillar = PILLARS.find(p => p.id === pillarId);
    if (subMenuId) {
      setActiveSubMenuId(subMenuId);
    } else if (pillar && pillar.subMenus.length > 0) {
      setActiveSubMenuId(pillar.subMenus[0].id);
    }
  };

  const handleDeleteOption = (id: string) => {
    switch (id) {
      case 'subject':
        onUpdateSelection({ subject: 'woman', customSubjectDetails: '' });
        break;
      case 'identityLock':
        onUpdateSelection({ identityLock: 'face_100', referenceImage: null });
        break;
      case 'referenceImage':
        onUpdateSelection({ referenceImage: null });
        break;
      case 'ethnicity':
        onUpdateSelection({ ethnicity: 'burmese', customEthnicityDetails: '' });
        break;
      case 'pose':
        onUpdateSelection({ poseExpression: 'looking_at_camera', customPoseDetails: '' });
        break;
      case 'stature':
        onUpdateSelection({ ageRange: undefined, heightRange: undefined, weightRange: undefined });
        break;
      case 'garment':
        onUpdateSelection({ garmentStyle: 'silk_longyi' });
        break;
      case 'fabric':
        onUpdateSelection({ garmentFabric: 'Woven Silk with Water Droplets' });
        break;
      case 'culturalProps':
        onUpdateSelection({ includeCulturalProps: false, culturalPropsDetails: '' });
        break;
      case 'customGarment':
        onUpdateSelection({ customGarmentImage: null, customGarmentDescription: '', clothesSwapOption: 'in_app_preset' });
        break;
      case 'event':
        onUpdateSelection({ event: 'thingyan', customEventDetails: '' });
        break;
      case 'location':
        onUpdateSelection({ location: 'cyber_yangon', customLocationDetails: '' });
        break;
      case 'lighting':
        onUpdateSelection({ timeAndLighting: 'neon_midnight', customLightingDetails: '' });
        break;
      case 'mood':
        onUpdateSelection({ moodEmotion: 'cinematic_dramatic' });
        break;
      case 'camera':
        onUpdateSelection({ camera: 'sony_a7rv' });
        break;
      case 'cameraAngle':
        onUpdateSelection({ cameraAngle: 'eye_level' });
        break;
      case 'colorGrade':
        onUpdateSelection({ colorGrade: 'cyber_neon' });
        break;
      case 'retouching':
        onUpdateSelection({ retouching: 'ultra_realism' });
        break;
      case 'makeup':
        onUpdateSelection({ makeup: 'traditional_myanmar' });
        break;
      case 'aspectRatio':
        onUpdateSelection({ aspectRatio: '9:16' });
        break;
      case 'qualityProfile':
        onUpdateSelection({ qualityProfile: '8k_uhd' });
        break;
      default:
        break;
    }
  };

  const activeOptionChips = useMemo(() => {
    const chips: Array<{
      id: string;
      pillarId: PillarId;
      subMenuId: string;
      categoryLabelMm: string;
      categoryLabelEn: string;
      valueLabelMm: string;
      valueLabelEn: string;
      emoji?: string;
      canDelete: boolean;
    }> = [];

    // 1. Subject
    const sub = SUBJECT_OPTIONS.find(s => s.id === selection.subject);
    chips.push({
      id: 'subject',
      pillarId: 'box1',
      subMenuId: 'subject_type',
      categoryLabelMm: 'ဇာတ်ကောင်',
      categoryLabelEn: 'Subject',
      valueLabelMm: sub?.labelMm || selection.subject,
      valueLabelEn: sub?.labelEn || selection.subject,
      emoji: sub?.emoji || '👤',
      canDelete: selection.subject !== 'woman' || Boolean(selection.customSubjectDetails)
    });

    // 2. Garment
    if (selection.garmentStyle) {
      const g = GARMENT_OPTIONS.find(ga => ga.id === selection.garmentStyle);
      chips.push({
        id: 'garment',
        pillarId: 'box2',
        subMenuId: 'garment_catalog',
        categoryLabelMm: 'ဝတ်စုံ',
        categoryLabelEn: 'Garment',
        valueLabelMm: g?.labelMm || selection.garmentStyle,
        valueLabelEn: g?.labelEn || selection.garmentStyle,
        emoji: g?.emoji || '👗',
        canDelete: selection.garmentStyle !== 'silk_longyi'
      });
    }

    // 3. Location
    if (selection.location) {
      const loc = LOCATION_OPTIONS.find(l => l.id === selection.location);
      chips.push({
        id: 'location',
        pillarId: 'box3',
        subMenuId: 'locations_environments',
        categoryLabelMm: 'နောက်ခံ',
        categoryLabelEn: 'Location',
        valueLabelMm: loc?.labelMm || selection.location,
        valueLabelEn: loc?.labelEn || selection.location,
        emoji: loc?.emoji || '📍',
        canDelete: selection.location !== 'cyber_yangon' || Boolean(selection.customLocationDetails)
      });
    }

    // 4. Lighting
    if (selection.timeAndLighting) {
      const lit = LIGHTING_OPTIONS.find(li => li.id === selection.timeAndLighting);
      chips.push({
        id: 'lighting',
        pillarId: 'box3',
        subMenuId: 'lighting_ambiance',
        categoryLabelMm: 'အလင်း',
        categoryLabelEn: 'Lighting',
        valueLabelMm: lit?.labelMm || selection.timeAndLighting,
        valueLabelEn: lit?.labelEn || selection.timeAndLighting,
        emoji: lit?.emoji || '💡',
        canDelete: selection.timeAndLighting !== 'neon_midnight'
      });
    }

    // 5. Event
    if (selection.event) {
      const ev = EVENT_OPTIONS.find(e => e.id === selection.event);
      chips.push({
        id: 'event',
        pillarId: 'box3',
        subMenuId: 'events_festivals',
        categoryLabelMm: 'ပွဲတော်',
        categoryLabelEn: 'Event',
        valueLabelMm: ev?.labelMm || selection.event,
        valueLabelEn: ev?.labelEn || selection.event,
        emoji: ev?.emoji || '🎉',
        canDelete: selection.event !== 'thingyan' || Boolean(selection.customEventDetails)
      });
    }

    // 6. Camera
    if (selection.camera) {
      const cam = CAMERA_OPTIONS.find(c => c.id === selection.camera);
      chips.push({
        id: 'camera',
        pillarId: 'box4',
        subMenuId: 'camera_lens',
        categoryLabelMm: 'ကင်မရာ',
        categoryLabelEn: 'Camera',
        valueLabelMm: cam?.label || selection.camera,
        valueLabelEn: cam?.label || selection.camera,
        emoji: '📷',
        canDelete: selection.camera !== 'sony_a7rv'
      });
    }

    // 7. Color / Film
    if (selection.colorGrade) {
      const col = COLOR_GRADE_OPTIONS.find(c => c.id === selection.colorGrade);
      chips.push({
        id: 'colorGrade',
        pillarId: 'box4',
        subMenuId: 'color_film',
        categoryLabelMm: 'ဖလင်',
        categoryLabelEn: 'Film LUT',
        valueLabelMm: col?.labelMm || selection.colorGrade,
        valueLabelEn: col?.labelEn || selection.colorGrade,
        emoji: '🎞️',
        canDelete: selection.colorGrade !== 'cyber_neon'
      });
    }

    // 8. Aspect Ratio
    if (selection.aspectRatio) {
      chips.push({
        id: 'aspectRatio',
        pillarId: 'box4',
        subMenuId: 'camera_lens',
        categoryLabelMm: 'အချိုး',
        categoryLabelEn: 'Ratio',
        valueLabelMm: selection.aspectRatio,
        valueLabelEn: selection.aspectRatio,
        emoji: '📐',
        canDelete: selection.aspectRatio !== '9:16'
      });
    }

    // 9. Cultural Props
    if (selection.includeCulturalProps || selection.culturalPropsDetails) {
      chips.push({
        id: 'culturalProps',
        pillarId: 'box2',
        subMenuId: 'cultural_accessories',
        categoryLabelMm: 'ရိုးရာ',
        categoryLabelEn: 'Props',
        valueLabelMm: 'သနပ်ခါး/ပုသိမ်ထီး',
        valueLabelEn: 'Cultural Props',
        emoji: '🌸',
        canDelete: true
      });
    }

    // 10. Photo Reference
    if (selection.referenceImage) {
      chips.push({
        id: 'referenceImage',
        pillarId: 'box1',
        subMenuId: 'identity_lock',
        categoryLabelMm: 'ရည်ညွှန်းပုံ',
        categoryLabelEn: 'Photo Ref',
        valueLabelMm: 'ပုံတင်ထားသည်',
        valueLabelEn: 'Attached',
        emoji: '🖼️',
        canDelete: true
      });
    }

    return chips;
  }, [selection]);

  const filteredSubMenus = useMemo(() => {
    if (!currentPillar) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentPillar.subMenus;

    return currentPillar.subMenus.filter(sub => {
      const matchLabel = sub.labelEn.toLowerCase().includes(q) || sub.labelMm.toLowerCase().includes(q);
      const matchDesc = sub.descEn.toLowerCase().includes(q) || sub.descMm.toLowerCase().includes(q);
      const matchKeywords = sub.keywords.some(k => k.toLowerCase().includes(q));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [currentPillar, searchQuery]);

  React.useEffect(() => {
    if (filteredSubMenus.length > 0 && !filteredSubMenus.some(s => s.id === activeSubMenuId)) {
      setActiveSubMenuId(filteredSubMenus[0].id);
    }
  }, [filteredSubMenus, activeSubMenuId]);

  // -------------------------------------------------------------
  // RENDER CONTENT VIEW CONTAINER FOR ACTIVE SUB MENU
  // -------------------------------------------------------------
  const renderContentView = () => {
    switch (activeSubMenuId) {
      case 'subject_type':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'အဓိက ဇာတ်ကောင် အမျိုးအစား ရွေးချယ်ပါ' : 'Select Primary Subject Category'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isMyanmar
                  ? 'သင်ဖန်တီးလိုသော ဓာတ်ပုံထဲမှ အဓိက ဇာတ်ကောင် (သို့မဟုတ်) အရာဝတ္ထုကို ရွေးချယ်ပါ'
                  : 'Choose the hero subject, model, or commercial object for your photograph.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SUBJECT_OPTIONS.map((sub, idx) => {
                const isSelected = selection.subject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (sub.id === 'pet') {
                        setActiveSubTab('pet');
                        onUpdateSelection({
                          subject: 'pet',
                          customSubjectDetails: selection.customSubjectDetails || PET_OPTIONS[0].promptText
                        });
                      } else if (sub.id === 'product') {
                        setActiveSubTab('product');
                        onUpdateSelection({
                          subject: 'product',
                          customSubjectDetails: selection.customSubjectDetails || PRODUCT_OPTIONS[0].promptText
                        });
                      } else if (sub.id === 'fashion') {
                        setActiveSubTab('fashion');
                        onUpdateSelection({
                          subject: 'fashion',
                          customSubjectDetails: selection.customSubjectDetails || FASHION_OPTIONS[0].promptText,
                          garmentStyle: FASHION_OPTIONS[0].promptText
                        });
                      } else if (sub.id === 'couple') {
                        setActiveSubTab('couple_wedding');
                        onUpdateSelection({
                          subject: 'couple',
                          customSubjectDetails: selection.customSubjectDetails || WEDDING_COUPLE_OPTIONS[0].promptText
                        });
                      } else if (sub.id === 'child') {
                        setUserAgeMode('child');
                        onUpdateSelection({
                          subject: 'child',
                          ageRange: selection.ageRange?.includes('years') ? selection.ageRange : '7_years'
                        });
                      } else {
                        setUserAgeMode('adult');
                        onUpdateSelection({
                          subject: sub.id,
                          ageRange: selection.ageRange?.includes('years') ? '18_25' : selection.ageRange
                        });
                      }
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-400 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'bg-black/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold bg-slate-800 text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="text-xl shrink-0">{sub.emoji}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">
                          {isMyanmar ? sub.labelMm : sub.labelEn}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {sub.labelEn}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {(selection.subject === 'pet' || selection.subject === 'product' || selection.subject === 'fashion') && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>
                      {selection.subject === 'pet'
                        ? (isMyanmar ? 'အိမ်မွေးတိရစ္ဆာန် Option ၂၀ မျိုး' : 'Select Pet Option (20 Variations)')
                        : selection.subject === 'product'
                        ? (isMyanmar ? 'ကုန်ပစ္စည်း Option ၂၀ မျိုး' : 'Select Commercial Product Option (20 Variations)')
                        : (isMyanmar ? 'ဖက်ရှင် Option ၂၅ မျိုး' : 'Select Fashion Option (25 Variations)')}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {(selection.subject === 'pet' ? PET_OPTIONS : selection.subject === 'product' ? PRODUCT_OPTIONS : FASHION_OPTIONS).map((opt) => {
                    const isSelected = selection.customSubjectDetails === opt.promptText || selection.garmentStyle === opt.promptText;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (selection.subject === 'pet') {
                            onUpdateSelection({ subject: 'pet', customSubjectDetails: opt.promptText });
                          } else if (selection.subject === 'product') {
                            onUpdateSelection({ subject: 'product', customSubjectDetails: opt.promptText });
                          } else if (selection.subject === 'fashion') {
                            onUpdateSelection({ subject: 'fashion', customSubjectDetails: opt.promptText, garmentStyle: opt.promptText });
                          }
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 text-cyan-100 shadow-sm'
                            : 'bg-black/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="truncate font-medium">{isMyanmar ? opt.labelMm : opt.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isMyanmar ? 'ဇာတ်ကောင် အသေးစိတ် ဖြည့်စွက်ရန် (Optional):' : 'Fine-Grained Subject Specification (Optional):'}
              </label>
              <input
                type="text"
                value={selection.customSubjectDetails || ''}
                onChange={(e) => onUpdateSelection({ customSubjectDetails: e.target.value })}
                placeholder={isMyanmar ? "ဥပမာ- အသက် ၂၄ နှစ်အရွယ်၊ မျက်မှန်အဝိုင်းနှင့် ချစ်စဖွယ် အပြုံး..." : "e.g. 24yo model with rimless round glasses, warm genuine smile..."}
                className="w-full rounded-xl bg-black/90 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>
        );

      case 'identity_lock':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ဓာတ်ပုံ အထောက်အထား နှင့် မူရင်းရုပ် ထိန်းသိမ်းခြင်း' : 'Identity Preservation & Reference Engine'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isMyanmar
                  ? 'မျက်နှာသွင်ပြင် မပြောင်းလဲဘဲ မူရင်းလူအတိုင်း ၁၀၀% ထိန်းသိမ်းပြီး စတိုင်လ်အသစ် ဖန်တီးပါ'
                  : 'Maintain 100% facial fidelity and bone structure while reimagining environment, lighting, and wardrobe.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {IDENTITY_LOCK_OPTIONS.map((lock) => {
                const currentLock = selection.identityLock || (currentMode === 'txt2img' ? 'no_lock' : 'face_100');
                const isSelected = currentLock === lock.id;
                return (
                  <button
                    key={lock.id}
                    onClick={() => onUpdateSelection({ identityLock: lock.id })}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-400 text-white shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : 'bg-black/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="text-base">{lock.emoji}</span>
                        <span>{isMyanmar ? lock.labelMm : lock.labelEn}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      {isMyanmar
                        ? lock.descMm
                        : lock.id === 'face_100'
                        ? 'Preserve 100% facial features, eyes, nose, and lips unchanged.'
                        : lock.id === 'face_body_lock'
                        ? 'Preserve facial identity and anatomical body proportions.'
                        : lock.id === 'soft_ref'
                        ? 'Soft organic resemblance adapted to lighting and styling.'
                        : 'Unrestricted creative generation without facial locking.'}
                    </p>
                  </button>
                );
              })}
            </div>

            <SubjectPreserveFeatureBox
              selection={selection}
              onUpdateSelection={onUpdateSelection}
              isMyanmar={isMyanmar}
            />

            <div className="pt-2">
              <Img2ImgUploader
                language={language}
                selection={selection}
                onUpdateSelection={onUpdateSelection}
                currentMode={currentMode}
              />
            </div>
          </div>
        );

      case 'ethnicity_culture':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'လူမျိုး နှင့် ရိုးရာ ယဉ်ကျေးမှု ရွေးချယ်ပါ' : 'Select Ethnicity & Cultural Heritage'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isMyanmar
                  ? 'မြန်မာ့တိုင်းရင်းသားများနှင့် ကမ္ဘာ့လူမျိုးစုံ မျက်နှာသွင်ပြင်ကို သတ်မှတ်ပါ'
                  : 'Define facial structure, heritage, and regional cultural hallmarks.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ETHNICITY_OPTIONS.map((eth) => {
                const currentEth = selection.ethnicity || 'burmese';
                const isSelected = currentEth === eth.id;
                return (
                  <button
                    key={eth.id}
                    onClick={() => onUpdateSelection({ ethnicity: eth.id })}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400'
                        : 'bg-black/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base">{eth.emoji}</span>
                      <span className="font-semibold truncate">{isMyanmar ? eth.labelMm : eth.labelEn}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <CulturalPropsDropdown
                language={language}
                selection={selection}
                onUpdateSelection={onUpdateSelection}
              />
            </div>
          </div>
        );

      case 'physical_profile':
        const ageOptions = userAgeMode === 'child' ? CHILD_AGE_OPTIONS : AGE_RANGE_OPTIONS;
        return (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'အရပ်အမြင့်၊ အလေးချိန်နှင့် အသက်အရွယ်' : 'Physical Stature, Build & Age Profile'}</span>
              </h3>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isMyanmar ? 'အသက်အရွယ် အပိုင်းအခြား (Age Range)' : 'Age Range Profile'}</span>
                </span>
                <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setUserAgeMode('child')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${userAgeMode === 'child' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    {isMyanmar ? 'ကလေး (၃–၁၂)' : 'Child (3-12)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserAgeMode('adult')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${userAgeMode !== 'child' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
                  >
                    {isMyanmar ? 'လူကြီး (Adult)' : 'Adult'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {ageOptions.map((age) => {
                  const currentAge = selection.ageRange || (userAgeMode === 'child' ? '7_years' : '18_25');
                  const isSelected = currentAge === age.id;
                  return (
                    <button
                      key={age.id}
                      type="button"
                      onClick={() => onUpdateSelection({ ageRange: age.id })}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 text-white font-bold shadow-sm'
                          : 'bg-black/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-base">{age.emoji}</div>
                      <div className="truncate mt-1">{isMyanmar ? age.labelMm : age.labelEn}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-sky-400" />
                  <span>{isMyanmar ? 'အရပ်အမြင့် (Height / Stature)' : 'Height / Stature'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSelection({ heightRange: 'skip' })}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {isMyanmar ? 'မူလအတိုင်း ထားပါ' : 'Reset Height'}
                </button>
              </div>

              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400 justify-end">
                  <button onClick={() => handleHeightScroll('left')} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleHeightScroll('right')} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div ref={heightScrollRef} className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                  {HEIGHT_OPTIONS.map((opt) => {
                    const isSelected = selection.heightRange === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateSelection({ heightRange: isSelected ? '' : opt.id })}
                        className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-black/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="mr-1.5">{opt.emoji}</span>
                        <span>{isMyanmar ? opt.labelMm : opt.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-teal-400" />
                  <span>{isMyanmar ? 'ခန္ဓာကိုယ် တည်ဆောက်ပုံ (Weight / Build)' : 'Body Build & Weight'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSelection({ weightRange: 'skip' })}
                  className="text-[10px] text-amber-400 hover:underline"
                >
                  {isMyanmar ? 'မူလအတိုင်း ထားပါ' : 'Reset Build'}
                </button>
              </div>

              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400 justify-end">
                  <button onClick={() => handleWeightScroll('left')} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleWeightScroll('right')} className="p-1 rounded bg-slate-800 hover:bg-slate-700">
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div ref={weightScrollRef} className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                  {WEIGHT_OPTIONS.map((opt) => {
                    const isSelected = selection.weightRange === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateSelection({ weightRange: isSelected ? '' : opt.id })}
                        className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-black/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="mr-1.5">{opt.emoji}</span>
                        <span>{isMyanmar ? opt.labelMm : opt.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 'pose_expression':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Smile className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ဟန်ပန်နှင့် မျက်နှာအမူအရာ (၂၅ မျိုး)' : 'Signature Poses & Emotional Expressions (25 Poses)'}</span>
              </h3>
            </div>
            <PoseSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'couple_customizer':
        return (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" />
                <span>{isMyanmar ? 'စုံတွဲနှင့် မင်္ဂလာဆောင် စတူဒီယို ဆက်တင်' : 'Couple & Wedding Studio Atelier'}</span>
              </h3>
            </div>

            {selection.subject !== 'couple' && (
              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 flex items-center justify-between">
                <span className="text-xs text-rose-200">
                  {isMyanmar ? 'စုံတွဲမုဒ်ကို ဖွင့်ရန် ဤခလုတ်ကို နှိပ်ပါ' : 'Activate Couple Mode for this section'}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSelection({ subject: 'couple' })}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500"
                >
                  {isMyanmar ? 'စုံတွဲမုဒ် ပြောင်းမည်' : 'Switch to Couple'}
                </button>
              </div>
            )}

            <CoupleDetailsCustomizer
              selection={selection}
              onUpdateSelection={onUpdateSelection}
              isMyanmar={isMyanmar}
            />

            <WeddingPropsPanel
              selection={selection}
              onUpdateSelection={onUpdateSelection}
              isMyanmar={isMyanmar}
            />
          </div>
        );

      // ---------------------------------------------------------
      // BOX 2: WARDROBE & CLOTHES SWAP
      // ---------------------------------------------------------
      case 'clothes_swap_studio':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shirt className="h-4 w-4 text-amber-400" />
                <span>{isMyanmar ? 'မဂ္ဂဇင်း ဖက်ရှင် ဝတ်စုံလဲ စတူဒီယို' : 'AI Fashion Clothes Swap Studio'}</span>
              </h3>
            </div>

            <ClothesSwapPanel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
              currentMode={currentMode}
            />

            <div className="pt-2">
              <CustomGarmentUploader
                language={language}
                selection={selection}
                onUpdateSelection={onUpdateSelection}
              />
            </div>
          </div>
        );

      case 'garment_catalog':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Palette className="h-4 w-4 text-amber-400" />
                <span>{isMyanmar ? 'ဝတ်စုံ စတိုင်လ် ရွေးချယ်မှု (၃၂ မျိုး)' : 'Garment & Outfit Catalog (32 Options)'}</span>
              </h3>
            </div>

            <GarmentSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'fabric_texture':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <span>{isMyanmar ? 'ပိတ်စ အမျိုးအစား နှင့် အသွင်အပြင် (Fabric Texture)' : 'Fabric Weave & Material Texture'}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: 'Woven Silk with Water Droplets', labelMm: 'ရေစက်စိုစွတ်နေသော ပိုးရက်ကန်း', desc: 'Photorealistic Thingyan water droplets on crisp woven silk' },
                { label: 'Traditional Konbaung Gold Brocade', labelMm: 'ကုန်းဘောင်ခေတ် ရွှေချည်ထိုး ပိုးထည်', desc: 'Intricate metallic gold embroidery with royal motifs' },
                { label: 'Lustrous Royal Velvet', labelMm: 'တောက်ပ နူးညံ့သော မင်းခမ်းတော် ကတ္တီပါ', desc: 'Deep light-absorbing velvet with opulent rim sheen' },
                { label: 'Crisp Tailored Cotton Linen', labelMm: 'သပ်ရပ် သဘာဝကျသော ချည်သား ပိတ်ချော', desc: 'Breathable, tactile organic weave texture' },
                { label: 'High-Shine Liquid Silk Satin', labelMm: 'အရည်ပျော်နေသကဲ့သို့ တောက်ပသော ပိုးဖဲ', desc: 'Fluid liquid draping with specular studio reflections' },
                { label: 'Heavy Wool Suiting Texture', labelMm: 'ဂုဏ်သရေရှိ သိုးမွေး ကုတ်အင်္ကျီ ပိတ်သား', desc: 'Fine herringbone or matte worsted wool weave' }
              ].map((fab, idx) => {
                const isSelected = selection.garmentFabric === fab.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onUpdateSelection({ garmentFabric: fab.label })}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                        : 'bg-black/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{isMyanmar ? fab.labelMm : fab.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-amber-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1">{fab.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={selection.garmentFabric || ''}
                onChange={(e) => onUpdateSelection({ garmentFabric: e.target.value })}
                placeholder="e.g. Handwoven raw silk with subtle gold threads..."
                className="w-full rounded-xl bg-black/90 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'cultural_accessories':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{isMyanmar ? 'ရိုးရာ အသုံးအဆောင်နှင့် ရတနာများ' : 'Cultural Accessories, Props & Jewelry'}</span>
              </h3>
            </div>

            <CulturalPropsDropdown
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      // ---------------------------------------------------------
      // BOX 3: SCENE & LIGHTING
      // ---------------------------------------------------------
      case 'events_festivals':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sun className="h-4 w-4 text-teal-400" />
                <span>{isMyanmar ? 'ပွဲတော်များနှင့် အခမ်းအနားများ (၃၀ မျိုး)' : 'Festivals & Ceremonies (30 Options)'}</span>
              </h3>
            </div>
            <EventSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'locations_environments':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Mountain className="h-4 w-4 text-teal-400" />
                <span>{isMyanmar ? 'နောက်ခံ ရှုခင်းနှင့် တည်နေရာ (၃၆ မျိုး)' : 'Locations & Scenery (36 Options)'}</span>
              </h3>
            </div>
            <LocationSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'lighting_ambiance':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sun className="h-4 w-4 text-teal-400" />
                <span>{isMyanmar ? 'စတူဒီယို နှင့် သဘာဝ အလင်းအမှောင် (၃၀ မျိုး)' : 'Master Studio & Ambient Lighting (30 Options)'}</span>
              </h3>
            </div>
            <LightingSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
            <div className="pt-2">
              <input
                type="text"
                value={selection.customLightingDetails || ''}
                onChange={(e) => onUpdateSelection({ customLightingDetails: e.target.value })}
                placeholder="e.g. Soft diffused side lighting, atmospheric rain reflection..."
                className="w-full rounded-xl bg-black/90 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'mood_emotion':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Heart className="h-4 w-4 text-teal-400" />
                <span>{isMyanmar ? 'ခံစားချက် နှင့် ရသ အသွင်အပြင် (၁၅ မျိုး)' : 'Emotional Mood & Atmospheric Vibe (15 Options)'}</span>
              </h3>
            </div>
            <MoodSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'background_only_settings':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Mountain className="h-4 w-4 text-teal-400" />
                <span>{isMyanmar ? 'နောက်ခံ သီးသန့် မုဒ် (Scenery Isolation System)' : 'Scenery & Backdrop Isolation System'}</span>
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-teal-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-200">
                  {isMyanmar ? 'နောက်ခံ သီးသန့် မုဒ် အခြေအနေ' : 'Background Only Mode Status'}
                </span>
                <button
                  type="button"
                  onClick={() => onModeChange(currentMode === 'background-only' ? 'img2img' : 'background-only')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentMode === 'background-only'
                      ? 'bg-teal-500 text-black font-bold shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {currentMode === 'background-only'
                    ? (isMyanmar ? '✅ ဖွင့်ထားသည်' : '✅ Active')
                    : (isMyanmar ? '⚪ ဖွင့်မည်' : '⚪ Inactive')}
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {isMyanmar ? 'လူပုဂ္ဂိုလ် ဆက်တင်များ ပြသရန် Option Key:' : 'Character Settings Option Key:'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPersonBoxesInBackgroundMode(!showPersonBoxesInBackgroundMode)}
                  className="px-2.5 py-1 rounded bg-black border border-slate-700 text-xs text-teal-300 hover:bg-slate-900"
                >
                  {showPersonBoxesInBackgroundMode ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
          </div>
        );

      // ---------------------------------------------------------
      // BOX 4: OPTICS & CAMERA MATRIX
      // ---------------------------------------------------------
      case 'camera_lens':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ကင်မရာနှင့် မှန်ဘီလူး ဆက်တင် (၂၀ မျိုး)' : 'Camera Body & Master Optics (20 Options)'}</span>
              </h3>
            </div>
            <CameraSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'camera_angles':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ကင်မရာ အလှည့်အကွေး နှင့် ရှုထောင့် (၁၅ မျိုး)' : 'Camera Angles & Framing (15 Options)'}</span>
              </h3>
            </div>
            <CameraAngleSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'color_film':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Film className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ဖလင် အရောင်တိုနင် နှင့် LUTs (၁၉ မျိုး)' : 'Film Stocks & Color Grading LUTs (19 Options)'}</span>
              </h3>
            </div>
            <FilmColorSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'retouch_makeup':
        return (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'အသားအရေ ချောမွေ့မှု နှင့် မိတ်ကပ် ပြင်ဆင်ခြင်း' : 'Skin Retouching & Makeup Artistry'}</span>
              </h3>
            </div>

            <SkinRetouchSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />

            <MakeupSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'photo_styles':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Palette className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ဓာတ်ပုံ အနုပညာ စတိုင်လ် (၂၀ မျိုး)' : 'Photography Aesthetic Styles (20 Options)'}</span>
              </h3>
            </div>
            <PhotoStyleSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />
          </div>
        );

      case 'aspect_ratio_settings':
        return (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ဓာတ်ပုံ အချိုးအစား နှင့် Target Resolution' : 'Aspect Ratio & Target Pixel Specs'}</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {ASPECT_RATIOS.map((ar) => {
                const currentRatio = selection.aspectRatio || '9:16';
                const isSelected = currentRatio === ar.ratio || currentRatio === ar.id;
                return (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => onUpdateSelection({ aspectRatio: ar.ratio })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                        : 'bg-black/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="font-bold text-sm">{ar.ratio}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{ar.width}×{ar.height}</span>
                    <span className="text-[9px] text-cyan-400 mt-1 font-semibold truncate max-w-full">
                      {ar.ratio === '9:16' ? 'TikTok/Reels' : ar.ratio === '4:5' ? 'Instagram' : ar.ratio === '3:4' ? 'Portrait' : ar.ratio === '16:9' ? 'Cinematic' : ar.ratio === '1:1' ? 'Square' : 'Photo'}
                    </span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const currentAr = ASPECT_RATIOS.find(ar => ar.ratio === (selection.aspectRatio || '9:16') || ar.id === selection.aspectRatio);
              if (!currentAr) return null;
              return (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📐</span>
                    <div>
                      <span className="text-slate-400 mr-2">{isMyanmar ? 'အသုံးပြုမည့် ရုပ်ထွက် Pixel:' : 'Target Dimension:'}</span>
                      <strong className="text-cyan-300 font-mono text-sm">{currentAr.width} × {currentAr.height} px</strong>
                    </div>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-medium">
                    {currentAr.label}
                  </span>
                </div>
              );
            })()}
          </div>
        );

      case 'quality_engine_settings':
        return (
          <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-cyan-400" />
                <span>{isMyanmar ? 'ရုပ်ထွက် အင်ဂျင် နှင့် Sliders ကန့်သတ်ချက်များ' : 'AI Quality Engines & Weight Sliders'}</span>
              </h3>
            </div>

            <QualityEngineSelectionCarousel
              language={language}
              selection={selection}
              onUpdateSelection={onUpdateSelection}
            />

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{isMyanmar ? 'စတိုင်လ် ပြင်းအား (Style Strength)' : 'Style Strength'}</span>
                  <span className="text-cyan-400 font-mono tabular-nums">{Math.round((selection.styleStrength ?? 0.75) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selection.styleStrength ?? 0.75}
                  onChange={(e) => onUpdateSelection({ styleStrength: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{isMyanmar ? 'Prompt အလေးချိန် (Prompt Weight)' : 'Prompt Weight'}</span>
                  <span className="text-cyan-400 font-mono tabular-nums">{Math.round((selection.promptWeight ?? 0.8) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selection.promptWeight ?? 0.8}
                  onChange={(e) => onUpdateSelection({ promptWeight: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                {isMyanmar ? 'အပိုဆောင်း စိတ်ကြိုက် ညွှန်ကြားချက် စာသား (Custom Directive):' : 'Additional Master Prompt Directives:'}
              </label>
              <textarea
                rows={2}
                value={selection.customInstruction || ''}
                onChange={(e) => onUpdateSelection({ customInstruction: e.target.value })}
                placeholder={isMyanmar ? "ဥပမာ- ရေပက်နေသော မြင်ကွင်း၊ ရွှေရောင်ဆည်းဆာနှင့် နူးညံ့သောအပြုံး..." : "e.g. Cinematic water splashes caught mid-air with warm sunset lighting..."}
                className="w-full rounded-xl bg-black border border-slate-800 p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-slate-400">
            {isMyanmar ? 'ရွေးချယ်စရာ မရှိပါ' : 'Select an item from the side menu'}
          </div>
        );
    }
  };

  // -------------------------------------------------------------
  // FIRST INTERFACE (WELCOME TO SHOW AI STUDIO)
  // Matching user's exact reference wireframe layout:
  // - Large bold "Welcome To Show AI Studio"
  // - Top 3 pills: [Prompt] [Image] [Video]
  // - "Template" with expanding chevron ∨
  // - Action bar with [Prompt Generator] on left and [ ☰ ] on right
  // - 4 Core Boxes in a 2x2 grid: [ Box1 ] [ Box2 ] [ Box3 ] [ Box4 ]
  // -------------------------------------------------------------
  if (activePillarId === null) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-7.5rem)] flex flex-col justify-between py-1 sm:py-2 space-y-3 sm:space-y-4">
        
        {/* Hero Section: Welcome To Show AI Studio */}
        <div className="text-center space-y-3 pt-1">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans leading-tight">
            Welcome To<br />
            <span className="text-white">Show AI Studio</span>
          </h1>

          {/* Prompt pill with floating animation */}
          <div className="flex items-center justify-center pt-2 pb-2">
            <button
              type="button"
              onClick={() => onModeChange('txt2img')}
              className="floating-btn-1 relative px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-white bg-black text-white shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-1 ring-white/70 scale-105 transition-all cursor-pointer select-none"
            >
              Prompt
            </button>
          </div>

          {/* "Template" with down arrow chevron ∨ matching wireframe */}
          <div className="pt-1 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsTemplateOpen(!isTemplateOpen)}
              className="group flex flex-col items-center text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none"
            >
              <span className="text-sm sm:text-base font-bold tracking-tight">Template</span>
              <div className="transition-transform group-hover:translate-y-0.5">
                {isTemplateOpen ? (
                  <ChevronUp className="h-5 w-5 text-white" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white" />
                )}
              </div>
            </button>

            {/* Template Gallery Accordion */}
            {isTemplateOpen && onSelectPreset && (
              <div className="w-full mt-3 p-4 rounded-2xl bg-black/90 border border-slate-800 shadow-2xl text-left transition-all">
                <PresetGallery
                  language={language}
                  onSelectPreset={(preset) => {
                    onSelectPreset(preset);
                    setIsTemplateOpen(false);
                  }}
                  activePresetId={activePresetId}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Row matching wireframe: [Prompt Generator] on left, [Selected Options button] in center, [ ☰ ] on right */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Prompt Generator Pill */}
          <button
            type="button"
            onClick={onGeneratePrompt}
            disabled={isGeneratingPrompt}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-black border border-slate-700 text-xs sm:text-sm font-bold text-white shadow-lg hover:border-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPrompt ? (
              <RefreshCcw className="h-4 w-4 animate-spin text-cyan-400" />
            ) : (
              <Wand2 className="h-4 w-4 text-cyan-400" />
            )}
            <span>{isMyanmar ? 'Prompt Generator' : 'Prompt Generator'}</span>
          </button>

          {/* Selected Options Summary Button */}
          <button
            type="button"
            onClick={() => setIsSummaryModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-black border border-slate-800 hover:border-cyan-500/80 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all shadow-md cursor-pointer group"
            title={isMyanmar ? 'ရွေးချယ်ထားသော အချက်အလက်များ အကျဉ်းချုပ် ကြည့်ရှု ပြင်ဆင်ရန်' : 'View, edit, or delete active options'}
          >
            <Sliders className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
            <span>{isMyanmar ? 'ရွေးချယ်မှု အကျဉ်းချုပ်' : 'Selected Options'}</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-[10px] sm:text-xs text-cyan-300 font-mono font-bold">
              {activeOptionChips.length}
            </span>
          </button>

          {/* Hamburger / Menu icon on the right */}
          <button
            type="button"
            onClick={() => {
              if (onOpenOutput) onOpenOutput();
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-black border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-all shadow-md cursor-pointer"
            title="View Prompt & Results / Output Studio"
          >
            <div className="flex flex-col gap-1 w-6 h-5 justify-center items-center">
              <span className="w-5 h-0.5 bg-white rounded-full"></span>
              <span className="w-5 h-0.5 bg-white rounded-full"></span>
              <span className="w-5 h-0.5 bg-white rounded-full"></span>
            </div>
          </button>
        </div>

        {/* Live Active Options Strip with Quick Edit & Quick Delete */}
        <div className="rounded-2xl bg-black/90 border border-slate-800/90 p-3 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              <span>{isMyanmar ? 'ရွေးချယ်ထားသော အချက်အလက်များ (Live)' : 'Live Active Selections'}</span>
              <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.2 rounded-full">
                {activeOptionChips.length}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setIsSummaryModalOpen(true)}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isMyanmar ? 'အသေးစိတ် စာရင်း အားလုံး →' : 'View & Edit All →'}</span>
            </button>
          </div>

          {/* Scrollable chip container with Quick Edit & Delete */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {activeOptionChips.map((chip) => (
              <div
                key={chip.id}
                className="group shrink-0 flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs transition-all shadow-sm"
              >
                <span className="text-sm">{chip.emoji || '✨'}</span>
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  {isMyanmar ? chip.categoryLabelMm : chip.categoryLabelEn}:
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPillar(chip.pillarId, chip.subMenuId)}
                  className="font-bold text-white hover:text-cyan-300 transition-colors text-xs truncate max-w-[130px] cursor-pointer"
                  title={isMyanmar ? 'ပြင်ဆင်ရန် နှိပ်ပါ (Edit)' : 'Click to edit option'}
                >
                  {isMyanmar ? chip.valueLabelMm : chip.valueLabelEn}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPillar(chip.pillarId, chip.subMenuId)}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer"
                  title={isMyanmar ? 'ပြင်မည်' : 'Edit'}
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                {chip.canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(chip.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-all cursor-pointer"
                    title={isMyanmar ? 'ဖျက်မည် / Reset' : 'Delete / Reset'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The 4 Core Primary Boxes in a 2x2 Grid (matching wireframe [Box1] [Box2] / [Box3] [Box4]) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 pb-1">
          {PILLARS.map((pillar) => {
            const PIcon = pillar.icon;
            const currentSummary = pillar.getCurrentSummary(selection, language);

            return (
              <div
                key={pillar.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectPillar(pillar.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPillar(pillar.id);
                  }
                }}
                className="group relative flex flex-col justify-between min-h-[140px] sm:min-h-[155px] p-5 rounded-2xl bg-black border border-slate-800/90 shadow-xl hover:border-white hover:scale-[1.015] active:scale-[0.99] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {/* Header: Box Label [Box1] & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans group-hover:text-cyan-300 transition-colors">
                      {pillar.boxLabel}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                      ({isMyanmar ? pillar.titleMm.split(' ')[0] : pillar.titleEn.split(' ')[0]})
                    </span>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-all">
                    <PIcon className="h-4 w-4 text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                {/* Body: Title & Micro-copy */}
                <div className="space-y-1 my-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                    {isMyanmar ? pillar.titleMm : pillar.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {isMyanmar ? pillar.taglineMm : pillar.taglineEn}
                  </p>
                </div>

                {/* Footer: Configured Summary */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] truncate max-w-[200px] sm:max-w-[260px]">
                    {currentSummary}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Options Summary Modal */}
        <SelectedOptionsSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          selection={selection}
          language={language}
          onEditOption={handleSelectPillar}
          onDeleteOption={handleDeleteOption}
          onResetAll={onResetAll}
          onGeneratePrompt={onGeneratePrompt}
          isGeneratingPrompt={isGeneratingPrompt}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECOND INTERFACE (MASTER-DETAIL SIDE PANEL WORKBENCH)
  // Matching user's exact second sketch in we.png:
  // - Left: Dedicated Black vertical panel:
  //   - Header: FIRST BOX (or BOX 1, BOX 2, etc.)
  //   - Stacked items with counts like '2'
  // - Center/Right:
  //   - Top: Search bar with magnifying glass 🔍 [________________________]
  //   - Top right: [ ☰ ]
  //   - Center: Neatly aligned cards in 2 columns
  //   - Bottom: [ Finished ] button
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 py-2">
      
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-black border border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActivePillarId(null)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 text-cyan-400" />
          <span>{isMyanmar ? 'ပင်မ ၄ ကတ်သို့ ပြန်သွားမည်' : 'Back to 4 Boxes'}</span>
        </button>

        {/* Selected Options Summary Button */}
        <button
          type="button"
          onClick={() => setIsSummaryModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/80 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer group"
          title={isMyanmar ? 'ရွေးချယ်ထားသော အချက်အလက်များ အကျဉ်းချုပ်' : 'View active options summary'}
        >
          <Sliders className="h-3.5 w-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-300" />
          <span>{isMyanmar ? 'ရွေးချယ်မှုများ' : 'Selected Options'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300 font-mono font-bold">
            {activeOptionChips.length}
          </span>
        </button>

        {/* Menu icon on the right as drawn */}
        <button
          type="button"
          onClick={() => {
            if (onOpenOutput) onOpenOutput();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Open Output & Results"
        >
          <div className="flex flex-col gap-1 w-5 h-4 justify-center items-center">
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
            <span className="w-4 h-0.5 bg-white rounded-full"></span>
          </div>
        </button>
      </div>

      {/* Main 2-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* LEFT DEDICATED SIDE PANEL (MD: 4 COLS) matching FIRST BOX in sketch */}
        <div className="md:col-span-4 rounded-2xl bg-black border border-slate-800 p-4 space-y-3.5 shadow-2xl flex flex-col">
          
          {/* Header: FIRST BOX (or BOX 1, BOX 2, etc.) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                {currentPillar?.boxLabel}
              </span>
              <h2 className="text-sm font-black text-white tracking-tight uppercase">
                {currentPillar ? (isMyanmar ? currentPillar.titleMm : currentPillar.titleEn) : 'FIRST BOX'}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {currentPillar?.subMenus.length}
            </span>
          </div>

          {/* Stacked sub-menu items with numbers on the right as in wireframe */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredSubMenus.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {isMyanmar ? 'ရှာမတွေ့ပါ' : 'No matching items'}
              </div>
            ) : (
              filteredSubMenus.map((sub) => {
                const isSelected = sub.id === activeSubMenuId;
                const SubIcon = sub.icon;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubMenuId(sub.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-white text-white shadow-md ring-1 ring-white/60'
                        : 'bg-black border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <SubIcon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">
                          {isMyanmar ? sub.labelMm : sub.labelEn}
                        </div>
                      </div>
                    </div>

                    {/* Count / index badge on the right as shown in reference drawing */}
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                      isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {sub.countBadge || '2'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT / CENTER CONTENT AREA (MD: 8 COLS) */}
        <div className="md:col-span-8 rounded-2xl bg-black border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-6 min-h-[550px]">
          
          <div className="space-y-4">
            {/* PROMINENT ENCLOSED SEARCH BAR with magnifying glass icon matching sketch */}
            <div className="relative">
              <div className="flex items-center rounded-2xl bg-slate-950 border-2 border-slate-700/80 px-4 py-2.5 shadow-inner focus-within:border-white focus-within:ring-2 focus-within:ring-white/30 transition-all">
                <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isMyanmar ? "ရွေးချယ်စရာများ ရှာဖွေပါ (ဥပမာ- face, silk, portra)..." : "Search options, presets, or styles..."}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Render Active Content View */}
            <div className="pt-2">
              {renderContentView()}
            </div>
          </div>

          {/* Bottom Action Row: Back to Boxes & Generate Prompt button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActivePillarId(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="h-4 w-4 text-cyan-400" />
              <span>{isMyanmar ? 'ပင်မ ၄ ကတ်သို့ ပြန်သွားမည်' : 'Back to Boxes'}</span>
            </button>

            <button
              type="button"
              onClick={onGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="px-7 py-3 rounded-xl bg-white text-black font-black text-sm shadow-xl hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPrompt ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin text-black" />
                  <span>{isMyanmar ? 'Prompt ရေးဆွဲနေပါသည်...' : 'Generating Prompt...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 text-black" />
                  <span>Generate Prompt</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Selected Options Summary Modal */}
      <SelectedOptionsSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        selection={selection}
        language={language}
        onEditOption={handleSelectPillar}
        onDeleteOption={handleDeleteOption}
        onResetAll={onResetAll}
        onGeneratePrompt={onGeneratePrompt}
        isGeneratingPrompt={isGeneratingPrompt}
      />
    </div>
  );
};
