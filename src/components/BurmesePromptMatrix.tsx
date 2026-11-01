import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Language, MatrixSelection, AppMode } from '../types';
import {
  SUBJECT_OPTIONS,
  ETHNICITY_OPTIONS,
  GARMENT_OPTIONS,
  LOCATION_OPTIONS,
  LIGHTING_OPTIONS,
  EVENT_OPTIONS,
  CAMERA_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  COLOR_GRADE_OPTIONS,
  RETOUCH_OPTIONS,
  MAKEUP_OPTIONS,
  MOOD_OPTIONS,
  ASPECT_RATIOS,
  QUALITY_PROFILES,
  IDENTITY_LOCK_OPTIONS,
  POSE_EXPRESSION_OPTIONS,
  CHARACTER_PRESETS
} from '../data/presetData';

// Sub components & deep resource views
import { SubjectPreserveFeatureBox } from './SubjectPreserveFeatureBox';
import { GarmentSelectionCarousel } from './GarmentSelectionCarousel';
import { LocationSelectionCarousel } from './LocationSelectionCarousel';
import { LightingSelectionCarousel } from './LightingSelectionCarousel';
import { MoodSelectionCarousel } from './MoodSelectionCarousel';
import { CameraSelectionCarousel } from './CameraSelectionCarousel';
import { CameraAngleSelectionCarousel } from './CameraAngleSelectionCarousel';
import { PoseSelectionCarousel } from './PoseSelectionCarousel';
import { EthnicStudioView } from './EthnicStudioView';
import { FestivalsStudioView } from './FestivalsStudioView';
import { FabricJewelrySwatchesView } from './FabricJewelrySwatchesView';
import { BurmeseWeddingStudioView } from './BurmeseWeddingStudioView';
import { BurmeseHairStudioView } from './BurmeseHairStudioView';
import { SelectedOptionsSummaryModal } from './SelectedOptionsSummaryModal';
import { buildComprehensiveMasterPrompt } from '../utils/promptBuilder';
import { inspectCulturalAccuracy, InspectionResult } from '../data/culturalAccuracyInspector';
import { SupabaseService } from '../utils/supabaseClient';
import {
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Wand2,
  Copy,
  RotateCcw,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Bookmark,
  Trash2,
  Share2,
  Download,
  Info,
  Palette,
  Sliders,
  Maximize2,
  Package,
  User,
  Heart,
  Clock,
  Zap,
  Edit3,
  SlidersHorizontal,
  Undo2,
  ChevronDown,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type WizardStepId =
  | 'subject'
  | 'context'
  | 'composition'
  | 'style'
  | 'colorPalette'
  | 'lighting'
  | 'mood'
  | 'technical';

export type ProjectCategory = 'product' | 'character' | 'wedding' | 'custom';
export type HistoricalTimeline = 'royal' | '1940s' | 'modern';

export interface WizardStepMeta {
  id: WizardStepId;
  stepNumber: number;
  titleEn: string;
  titleMm: string;
  tagline: string;
  badge: string;
}

const WIZARD_STEPS: WizardStepMeta[] = [
  { id: 'subject', stepNumber: 1, titleEn: 'Subject', titleMm: 'ဇာတ်ကောင် / ကုန်ပစ္စည်း', tagline: 'Archetypes, 135 ethnic groups, bridal attire & product crafts', badge: 'CORE IDENTITY' },
  { id: 'context', stepNumber: 2, titleEn: 'Context', titleMm: 'နောက်ခံ & အပြင်အဆင်', tagline: 'Historical backdrops, 12 festivals & staging props', badge: 'ENVIRONMENT' },
  { id: 'composition', stepNumber: 3, titleEn: 'Composition', titleMm: 'မြင်ကွင်း & အနေအထား', tagline: 'Macro close-up, commercial framing, camera angles & poses', badge: 'OPTICS' },
  { id: 'style', stepNumber: 4, titleEn: 'Style', titleMm: 'အနုပညာ ဟန်ပန်', tagline: 'Fresco mural, 1940s silver gelatin, vintage kodachrome & studio 8k', badge: 'AESTHETIC' },
  { id: 'colorPalette', stepNumber: 5, titleEn: 'Color Palette', titleMm: 'အရောင်အသွေး', tagline: 'Mandalay Gold, Sepia 1940s, Terracotta & Vibrant harmonies', badge: 'PALETTE' },
  { id: 'lighting', stepNumber: 6, titleEn: 'Lighting', titleMm: 'အလင်းအမှောင်', tagline: 'Oil lamps, 1940s studio flash, softbox & volumetric rays', badge: 'LIGHTING' },
  { id: 'mood', stepNumber: 7, titleEn: 'Mood & Atmosphere', titleMm: 'ခံစားမှု & ပတ်ဝန်းကျင်', tagline: 'Regal, nostalgic monsoon, romance & luxury resonance', badge: 'ATMOSPHERE' },
  { id: 'technical', stepNumber: 8, titleEn: 'Technical Details', titleMm: 'ကင်မရာ & အသေးစိတ်', tagline: 'Vintage bellows, 100mm macro, 85mm f/1.4 & Aspect Ratio', badge: 'CAMERA' }
];

export function generateBurmeseArchivalEnhancement(
  input: string,
  category: ProjectCategory,
  timeline: HistoricalTimeline,
  variation: number = 0
): string {
  const base = input.trim();
  const variationsMap: Record<ProjectCategory, Record<HistoricalTimeline, string[]>> = {
    product: {
      royal: [
        `High-impact commercial graphic design advertisement poster for royal Burmese heritage creation: ${base || 'Untreated Mogok royal pigeon blood ruby torque with Imperial jadeite cabochons'}, set in 24k Konbaung court repousse gold filigree, styled on an antique Kanote carved teakwood plinth draped in deep crimson Amarapura silk velvet, featuring clean graphic negative space layout for advertising typography and 3D gold embossed royal seal badge, dramatic cinematic golden hour directional lighting, extreme macro 100mm optical sharpness, photorealistic microscopic metallic luster and faceted gemstone refractions, award-winning luxury advertising poster campaign.`,
        `Luxury brand commercial advertisement poster: ${base || 'Multi-tiered Bagan vermilion and black lacquerware betel box (Kun-it)'}, accented with 24k gold leaf gilding, standing on an ancient Amarapura court lotus altar with subtle sandalwood incense haze, modern graphic design poster composition with clean negative space for headline copy and promotional ribbon, studio ring-light specular reflections, 8k hyper-detailed commercial render.`,
        `Commercial advertising poster: ${base || 'Authentic Amarapura 100-shuttle Luntaya Acheik wave-pattern silk tapestry'}, woven with pure metallic gold and silver threads, draped elegantly with floating gold flakes, eye-catching promotional graphic design layout, illuminated by soft ceremonial oil-lamp glow, extreme tactile fabric macro texture, 8k UHD detail.`
      ],
      '1940s': [
        `Vintage 1940s colonial Rangoon commercial advertisement poster: ${base || 'Vintage Burmese silver repousse bowl (Pha-la) with intricate Jataka court carvings'}, positioned on an aged Rangoon colonial solid teak writing desk, authentic vintage letterpress advertising typography banner and heritage promotional seal, ambient monsoon window diffused light with gentle rain streaks on glass, warm nostalgic Kodachrome film color grading, authentic archival graphic poster aesthetic.`,
        `Heritage vintage advertising campaign poster: ${base || 'Antique Burmese raw jadeite bangle and Mogok star sapphire'}, resting upon a vintage hand-embroidered French lace linen runner with an antique brass magnifying loupe, retro promotional headline typography and vintage ribbon badge, warm tungsten incandescent desk lamp lighting, timeless commercial poster design.`,
        `Colonial vintage Burmese botanical craft commercial flyer: ${base || 'Pathein floral oiled-paper bamboo parasol and handcrafted fragrant Thanaka stone grinder (Kyauk-pyin)'}, arranged in a vintage 1940s merchant studio in Yangon, classic graphic layout with typography space, vintage medium-format Rolleiflex film aesthetic.`
      ],
      modern: [
        `Ultra-modern commercial product advertising poster: ${base || 'Contemporary architectural jewelry inspired by Bagan stupa silhouettes with Mogok gemstones'}, displayed on a sleek black polished travertine marble podium with serene water ripple reflections and floating gold dust particles, bold minimalist advertising typography headline with clean promotional sale badge, crisp commercial studio diffused softbox illumination, 85mm prime lens clarity, 8k octane commercial render, award-winning social media ad poster.`,
        `High-impact commercial promotional poster: ${base || 'Artisanal organic Thanaka skincare elixir in frosted crystal flacon with gold-embossed Burmese typography'}, styled beside fresh lotus blossoms on a wet volcanic slate surface with crystal water droplets, featuring bold graphic design advertising typography and 3D promotional ribbon, clean high-key commercial lighting, crisp specular highlights, luxury cosmetics commercial campaign.`,
        `Contemporary Burmese avant-garde commercial campaign: ${base || 'Modernized Inle lotus silk garment and minimal jade accessories'}, curated in a bright minimalist Yangon art gallery with natural floor-to-ceiling skylight, minimalist editorial advertising layout with typography spacing, Hasselblad 100MP hyper-fidelity.`
      ]
    },
    character: {
      royal: [
        `Archivally authentic Burmese royal portrait: ${base || 'Konbaung dynasty royal court lady with serene regal expression'}, wearing the opulent Maha Lata ceremonial regalia adorned with real Mogok pearls and emeralds, an authentic Amarapura pure silk Luntaya Acheik htamein, hair styled in a traditional Sadon chignon with cascading fragrant jasmine blossoms, standing in the gilded Mandalay Palace Throne Hall, warm volumetric golden hour sunlight streaming through carved teak lattices, 85mm portrait lens, lifelike skin pore micro-texture.`,
        `Regal Burmese royal courtier: ${base || 'Bagan court noble in authentic 11th-century silk paso and ceremonial gold chest pectoral (Salwe)'}, standing before ancient gilded temple frescoes, dramatic Rembrandt directional lighting, subtle incense mist, photorealistic archival historical realism.`,
        `Royal Amarapura princess: ${base || 'Amarapura royal princess seated gracefully on an ornate carved throne'}, adorned with 24k gold filigree ear-plugs (Nadaung) and authentic Thanaka spiral cheek patterns, luminous soft rim lighting, museum-grade archival fidelity.`
      ],
      '1940s': [
        `Nostalgic 1940s Rangoon vintage portrait: ${base || 'Graceful 1940s Burmese woman holding a traditional Pathein oiled-paper umbrella'}, wearing a delicate sheer French-lace Yinzi blouse and handwoven Mandalay silk longyi, hair in an elegant vintage retro-wave updo with a fresh white orchid, standing along historic rain-slicked colonial Strand Road in Yangon with vintage merchant buildings, soft overcast monsoon light with wet ground reflections, 35mm vintage film tone.`,
        `1940s mid-century Burmese intellectual & artist: ${base || 'Vintage Burmese gentleman in traditional silk Taikpon jacket and Gaung-baung headdress'}, seated in a heritage colonial library reading an ancient parabaik manuscript, warm amber lamp glow, authentic Kodachrome color profile.`,
        `1940s vintage Rangoon riverside portrait: ${base || 'Burmese lady on an Irrawaddy heritage wooden steamboat promenade deck'}, gentle breeze rustling pure silk scarf, soft afternoon river mist, nostalgic sepia-tinted cinematic color grade.`
      ],
      modern: [
        `Editorial contemporary Burmese fashion portrait: ${base || 'Modern Burmese woman combining a tailored contemporary blazer over an authentic Inle lotus silk longyi'}, subtle modern Thanaka contouring, posing against the glowing night skyline of Yangon with the illuminated Shwedagon Pagoda softly bokeh-blurred in the distance, high-end editorial lighting, crisp 8k resolution.`,
        `Modern Burmese creative portrait: ${base || 'Contemporary Burmese youth in modern streetwear infused with traditional Karen woven textiles'}, natural street-style lighting in downtown Yangon art district, Sony A7R V tack-sharp optics, vibrant modern color grading.`,
        `Contemporary Burmese high-fashion studio: ${base || 'High-fashion model in sculptural avant-garde Burmese silk gown'}, clean studio cyclorama backdrop, dual Profoto rim lighting with subtle cyan and warm gold separation, ultra-realistic skin texture.`
      ]
    },
    wedding: {
      royal: [
        `Traditional Royal Burmese Bridal Ceremony: ${base || 'Burmese royal bride and groom in full Konbaung dynasty ceremonial wedding regalia'}, bride wearing the magnificent gilded Maha Lata bodice with heavy Mogok ruby torques and a golden bridal crown, groom in pure gold-embroidered silk Paso and royal Taikpon, seated side-by-side on a gilded silk carpet before an ancient Buddha shrine with silver ceremonial bowls and fresh jasmine garlands, warm golden oil lamp candlelight, soft ceremonial incense haze, 85mm f/1.4 shallow depth of field.`,
        `Amarapura Court Wedding: ${base || 'Burmese royal couple performing the traditional hand-binding (Let-htat) wedding ceremony'}, hands bound with pure gold thread dipped in a scented silver water bowl, intricate gold thread Luntaya silk attire, regal and intimate atmosphere, cinematic warm lighting.`,
        `Sacred Bagan Temple Wedding: ${base || 'Bridal couple standing on an ancient Bagan brick temple terrace during sunset'}, soft pink and golden twilight sky, traditional silk headdresses, gentle golden rim light creating an ethereal romantic aura.`
      ],
      '1940s': [
        `Vintage 1940s Mid-Century Burmese Wedding: ${base || 'Burmese bride and groom in vintage 1940s colonial Rangoon wedding attire'}, bride in a sheer heirloom lace Yinzi blouse, pure white Mandalay silk Htamein with gold embroidery and a delicate veil pinned with white gardenias, groom in a sharp ivory Taikpon and pale pink silk Paso, posing in a classic heritage photo studio with a hand-painted floral backdrop, vintage sepia and soft pastel film tone.`,
        `1940s Rangoon Heritage Garden Wedding: ${base || '1940s Burmese bridal couple standing under a flowering frangipani arbor'}, natural diffused afternoon sunlight, authentic vintage hairstyles and heirloom pearl jewelry, nostalgic cinematic look.`,
        `Vintage Rangoon Church/Hall Reception: ${base || 'Mid-century Burmese couple in romantic wedding portrait'}, warm nostalgic incandescent lighting, antique teak furniture in background, soft film grain and timeless elegance.`
      ],
      modern: [
        `Luxury Contemporary Burmese Wedding: ${base || 'Modern Burmese bridal couple in bespoke high-fashion traditional silk attire'}, bride wearing a champagne gold hand-loomed Acheik gown with delicate Swarovski crystals and modern Mogok ruby drop earrings, groom in a contemporary tailored navy Taikpon and raw silk Paso, set in a lavish grand ballroom adorned with thousands of white orchids and crystal chandeliers, soft multi-point studio lighting, crisp 8k UHD.`,
        `Modern Romantic Outdoor Sunset Wedding: ${base || 'Contemporary Burmese bride and groom on a scenic coastal terrace in Ngapali at golden hour'}, ocean breeze catching the sheer silk veil, warm tropical sunset glow, vibrant romantic color grading.`,
        `Editorial Modern Burmese Pre-Wedding: ${base || 'Chic modern Burmese couple in minimalist editorial attire'}, posing against architectural Burmese teak and stone minimalist backdrop, magazine cover composition, clean natural lighting.`
      ]
    },
    custom: {
      royal: [
        `Archival Burmese royal dynasty concept: ${base || 'Magnificent royal court scene with ancient Burmese architecture'}, detailed with 24k gold leaf gilding, authentic Amarapura silk textiles, traditional silver repousse vessels, warm volumetric temple light, 8k cinematic masterpiece.`,
        `Feudal Burmese historical scene: ${base || 'Ancient Burmese royal cavalcade through mist-shrouded Bagan'}, ornate gilded regalia, carved teak palanquins, atmospheric morning light with Tyndall rays, epic archival composition.`
      ],
      '1940s': [
        `Vintage 1940s Burmese heritage scene: ${base || 'Atmospheric 1940s Yangon street scene with colonial architecture'}, vintage trams, rain-soaked asphalt reflections, traditional Pathein parasols, nostalgic Kodachrome film grading.`,
        `Mid-century Rangoon vintage concept: ${base || 'Vintage 1940s Burmese artisan workshop'}, warm tungsten lighting, antique wooden tools, authentic period costumes, timeless nostalgic mood.`
      ],
      modern: [
        `Contemporary Burmese cinematic concept: ${base || 'Modern Yangon cityscape harmonized with traditional cultural elements'}, glowing neon lights paired with ancient pagoda silhouettes, high-dynamic-range cinematography, modern editorial grade.`,
        `Modern Burmese creative fusion: ${base || 'Futuristic yet culturally grounded Burmese visual art concept'}, vibrant colors, authentic cultural motifs integrated into clean modern design, 8k hyper-realism.`
      ]
    }
  };

  const catOptions = variationsMap[category] || variationsMap.character;
  const timelineOptions = catOptions[timeline] || catOptions.royal;
  const selectedIndex = Math.abs(variation) % timelineOptions.length;
  return timelineOptions[selectedIndex];
}

interface BurmesePromptMatrixProps {
  language: Language;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  onResetAll: () => void;
  onGeneratePrompt?: (promptText: string) => void;
  isGeneratingPrompt?: boolean;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine: string;
  onEngineChange: (engine: string) => void;
  onNavigateView?: (view: any, photoUrl?: string) => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
    }
  ) => void;
  activeTabOverride?: any;
}

export const BurmesePromptMatrix: React.FC<BurmesePromptMatrixProps> = ({
  language,
  selection,
  onUpdateSelection,
  onResetAll,
  onGeneratePrompt,
  isGeneratingPrompt = false,
  onSavePrompt,
  engine,
  onEngineChange,
  onNavigateView,
  onSendToPhotoStudio
}) => {
  const isMyanmar = language === 'my';

  // Wizard active step (1 through 8)
  const [activeStepId, setActiveStepId] = useState<WizardStepId>('subject');

  // Context-Aware Onboarding State
  const [projectCategory, setProjectCategory] = useState<ProjectCategory>('character');
  const [historicalTimeline, setHistoricalTimeline] = useState<HistoricalTimeline>('royal');
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [customConceptInput, setCustomConceptInput] = useState<string>('');

  // Quick Presets dropdown menu state
  const [isPresetsDropdownOpen, setIsPresetsDropdownOpen] = useState<boolean>(false);
  const presetsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetsDropdownRef.current && !presetsDropdownRef.current.contains(e.target as Node)) {
        setIsPresetsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Final Master Studio Synthesizer Full-View state
  const [isSynthesizerViewActive, setIsSynthesizerViewActive] = useState<boolean>(false);

  // Internal Sub-tabs inside Steps
  const [step1SubTab, setStep1SubTab] = useState<string>('archetypes');
  const [step2SubTab, setStep2SubTab] = useState<string>('locations');

  // AI Enhance Section State per Step
  const [enhancedSections, setEnhancedSections] = useState<Record<string, string>>({});
  const [isEnhancingSection, setIsEnhancingSection] = useState<boolean>(false);

  // Model Format Tabs
  const [modelTab, setModelTab] = useState<'master' | 'flux' | 'midjourney' | 'sdxl' | 'negative'>('master');

  // Toasts
  const [copiedToast, setCopiedToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [isSynthesizingAi, setIsSynthesizingAi] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // AI Synthesized Response Container
  const [aiSynthesizedData, setAiSynthesizedData] = useState<{
    masterPrompt?: string;
    negativePrompt?: string;
    midjourneyFormat?: string;
    fluxFormat?: string;
    sdxlFormat?: string;
    descriptionMm?: string;
    descriptionEn?: string;
  } | null>(null);

  // Reference photos
  const refUploadInputRef = useRef<HTMLInputElement>(null);
  const [extraUploadedPhotos, setExtraUploadedPhotos] = useState<Array<{ id: string; url: string; name: string }>>([]);

  // Step 1 Custom Input & Inline AI Enhance state
  const [step1CustomInput, setStep1CustomInput] = useState<string>(selection.customSubjectDetails || '');
  const [step1EnhancedResult, setStep1EnhancedResult] = useState<string>('');
  const [isStep1Enhancing, setIsStep1Enhancing] = useState<boolean>(false);
  const [step1EnhanceVariation, setStep1EnhanceVariation] = useState<number>(0);
  const [step1AddedFeedback, setStep1AddedFeedback] = useState<boolean>(false);

  // Step 2 Custom Input & Inline AI Enhance state
  const [step2CustomInput, setStep2CustomInput] = useState<string>(selection.customLocationDetails || '');
  const [step2EnhancedResult, setStep2EnhancedResult] = useState<string>('');
  const [isStep2Enhancing, setIsStep2Enhancing] = useState<boolean>(false);
  const [step2EnhanceVariation, setStep2EnhanceVariation] = useState<number>(0);
  const [step2AddedFeedback, setStep2AddedFeedback] = useState<boolean>(false);

  // Dedicated Product Advertisement & Poster state
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productAdGoal, setProductAdGoal] = useState<'promotion' | 'launch' | 'luxury' | 'organic' | 'seasonal'>('promotion');
  const [productHeadline, setProductHeadline] = useState<string>('50% OFF SPECIAL PROMOTION');
  const [productBadge, setProductBadge] = useState<string>('🏷️ 3D Gold Ribbon Badge');
  const [productPodium, setProductPodium] = useState<string>('Polished Black Travertine Marble Plinth');
  const [productFloatingElements, setProductFloatingElements] = useState<string>('Floating 24k gold dust & sparkling bokeh particles');
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProductImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Switch sub-tabs and selections automatically when category changes so Product never displays human subjects
  useEffect(() => {
    if (projectCategory === 'product') {
      if (step1SubTab !== 'product-ad' && step1SubTab !== 'product-types' && step1SubTab !== 'podiums') {
        setStep1SubTab('product-ad');
      }
      if (step2SubTab !== 'commercial-backdrops' && step2SubTab !== 'floating-elements') {
        setStep2SubTab('commercial-backdrops');
      }
      if (selection.subject !== 'object') {
        onUpdateSelection({ subject: 'object', garmentStyle: '', makeupStyle: '' });
      }
    } else if (projectCategory === 'wedding') {
      if (step1SubTab !== 'wedding-studio' && step1SubTab !== 'hair-studio' && step1SubTab !== 'swatches') {
        setStep1SubTab('wedding-studio');
      }
      if (selection.subject !== 'couple') {
        onUpdateSelection({ subject: 'couple' });
      }
    } else if (projectCategory === 'character') {
      if (step1SubTab !== 'archetypes' && step1SubTab !== 'ethnic135' && step1SubTab !== 'outfits' && step1SubTab !== 'hair-studio' && step1SubTab !== 'swatches') {
        setStep1SubTab('archetypes');
      }
      if (selection.subject === 'object') {
        onUpdateSelection({ subject: 'woman' });
      }
    }
  }, [projectCategory]);

  // Keep inputs synced when selection updates externally
  useEffect(() => {
    if (selection.customSubjectDetails !== undefined && selection.customSubjectDetails !== step1CustomInput) {
      setStep1CustomInput(selection.customSubjectDetails);
    }
  }, [selection.customSubjectDetails]);

  useEffect(() => {
    if (selection.customLocationDetails !== undefined && selection.customLocationDetails !== step2CustomInput) {
      setStep2CustomInput(selection.customLocationDetails);
    }
  }, [selection.customLocationDetails]);

  // Live Comprehensive Master Prompt calculation
  const masterPromptText = useMemo(() => {
    try {
      if (projectCategory === 'product') {
        const adGoalLabel = productAdGoal === 'promotion' ? 'High-Impact Promotional Big Sale Commercial Poster'
          : productAdGoal === 'launch' ? 'New Product Launch Announcement Poster'
          : productAdGoal === 'luxury' ? 'High-Fashion Luxury Brand Campaign Poster'
          : productAdGoal === 'organic' ? 'Organic Pure Heritage Craft Showcase Poster'
          : 'Seasonal Festival Special Promotional Campaign Poster';

        let prodDetails = selection.customSubjectDetails || 'Authentic handcrafted Burmese creation';
        let adPrompt = `Professional commercial graphic design advertisement poster for ${prodDetails}, ${adGoalLabel}`;
        
        if (productHeadline) {
          adPrompt += `, featuring prominent modern advertising typography text "${productHeadline}" with clean graphic negative space layout`;
        }
        if (productBadge) {
          adPrompt += `, eye-catching promotional graphic design element with ${productBadge}`;
        }
        if (productPodium) {
          adPrompt += `, displayed on ${productPodium}`;
        }
        if (productFloatingElements) {
          adPrompt += `, surrounded by dynamic ${productFloatingElements}`;
        }
        if (selection.location || selection.customLocationDetails) {
          adPrompt += `, commercial staging in ${selection.customLocationDetails || selection.location}`;
        }
        if (selection.timeAndLighting || selection.customLightingDetails) {
          adPrompt += `, commercial studio lighting: ${selection.customLightingDetails || selection.timeAndLighting}`;
        }
        if (selection.colorGrade) {
          adPrompt += `, brand color harmony ${selection.colorGrade}`;
        }
        if (selection.moodEmotion) {
          adPrompt += `, commercial atmosphere: ${selection.moodEmotion}`;
        }
        if (selection.cameraAngle) {
          adPrompt += `, camera framing: ${selection.cameraAngle}`;
        }
        adPrompt += `, 8k octane commercial render, award-winning advertising poster graphic design, hyper-realistic studio product photography`;
        
        return adPrompt;
      }

      const res = buildComprehensiveMasterPrompt(selection, engine);
      let prompt = res?.masterPrompt || '';
      
      if (projectCategory === 'wedding' && !prompt.includes('wedding')) {
        prompt = `Traditional Myanmar royal ceremonial wedding couple portrait, ${prompt}`;
      }

      if (historicalTimeline === '1940s' && !prompt.includes('1940s') && !prompt.includes('Colonial')) {
        prompt = `${prompt}, mid-century 1940s vintage Myanmar colonial Rangoon atmosphere, classic archival film aesthetic`;
      } else if (historicalTimeline === 'modern' && !prompt.includes('contemporary')) {
        prompt = `${prompt}, contemporary modern Myanmar high fashion aesthetics, pristine modern studio`;
      }

      return prompt;
    } catch {
      return '';
    }
  }, [
    selection,
    engine,
    projectCategory,
    historicalTimeline,
    productAdGoal,
    productHeadline,
    productBadge,
    productPodium,
    productFloatingElements
  ]);

  // Displayed prompt based on model tab
  const displayedPromptText = useMemo(() => {
    if (aiSynthesizedData) {
      if (modelTab === 'midjourney' && aiSynthesizedData.midjourneyFormat) return aiSynthesizedData.midjourneyFormat;
      if (modelTab === 'flux' && aiSynthesizedData.fluxFormat) return aiSynthesizedData.fluxFormat;
      if (modelTab === 'sdxl' && aiSynthesizedData.sdxlFormat) return aiSynthesizedData.sdxlFormat;
      if (modelTab === 'negative' && aiSynthesizedData.negativePrompt) return aiSynthesizedData.negativePrompt;
      if (modelTab === 'master' && aiSynthesizedData.masterPrompt) return aiSynthesizedData.masterPrompt;
    }
    if (modelTab === 'midjourney') {
      return `/imagine prompt: ${masterPromptText} --ar ${selection.aspectRatio || '16:9'} --v 6.1 --style raw`;
    }
    if (modelTab === 'flux') {
      return masterPromptText.replace(/--\w+\s+\S+/g, '').trim();
    }
    if (modelTab === 'sdxl') {
      return `${masterPromptText}, high dynamic range, sharp focus`;
    }
    if (modelTab === 'negative') {
      if (projectCategory === 'product') {
        return "--no human faces, people in foreground, low resolution, messy layout, misspelled text, blurry product, bad typography alignment, distracting clutter, deformed reflections, overexposed glare, amateur snapshot, distorted perspective";
      }
      return "--no modern western clothing, sunglasses, plastic, wrist watch, distorted hands, extra fingers, inaccurate generic anime face, non-Burmese Chinese or Japanese traditional costumes, Indian saree, bindi, synthetic nylon fabrics, low quality render, deformed facial anatomy";
    }
    return masterPromptText;
  }, [masterPromptText, modelTab, selection.aspectRatio, aiSynthesizedData, projectCategory]);

  // Real-Time Cultural Accuracy & Era Inspector (Integrated Guard)
  const culturalInspection: InspectionResult = useMemo(() => {
    return inspectCulturalAccuracy(masterPromptText);
  }, [masterPromptText]);

  // Auto-Sanitize Prompt Action
  const handleAutoSanitize = () => {
    if (culturalInspection.sanitizedPrompt) {
      onUpdateSelection({ customInstruction: culturalInspection.sanitizedPrompt });
      if (aiSynthesizedData) {
        setAiSynthesizedData(prev => prev ? ({ ...prev, masterPrompt: culturalInspection.sanitizedPrompt }) : null);
      }
    }
  };

  // Smart Custom Concept Parser (Auto-Distribute to Timeline & 8 Steps)
  const handleParseCustomConcept = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();

    // 1. Detect timeline
    let detectedTimeline: HistoricalTimeline = historicalTimeline;
    if (/1940|colonial|rangoon|vintage|post-wwii|sepia|pre-war|retro|british/i.test(lower)) {
      detectedTimeline = '1940s';
    } else if (/bagan|inwa|konbaung|amarapura|yadanabon|dynasty|royal|palace|king|queen|ancient|feudal|fresco|parabaik|နန်းတွင်း|မင်းသား|မင်းသမီး|ပုဂံ/i.test(lower)) {
      detectedTimeline = 'royal';
    } else if (/modern|contemporary|urban|skyscraper|studio|high fashion|luxury|ယနေ့ခေတ်/i.test(lower)) {
      detectedTimeline = 'modern';
    }

    // 2. Detect category
    let detectedCat: ProjectCategory = projectCategory;
    if (/product|gem|ruby|jade|lacquerware|craft|thanaka|cosmetic|textile|tea|puppet|parasol|box|ယွန်း|ကျောက်မျက်|သနပ်ခါး/i.test(lower)) {
      detectedCat = 'product';
    } else if (/wedding|bridal|bride|groom|couple|pre-wedding|marriage|မင်္ဂလာ|သတို့သား|သတို့သမီး/i.test(lower)) {
      detectedCat = 'wedding';
    } else {
      detectedCat = 'custom';
    }

    // 3. Pre-fill selections
    const updates: Partial<MatrixSelection> = {
      customSubjectDetails: trimmed
    };

    if (/rain|rainy|monsoon|storm|umbrella/i.test(lower)) {
      updates.timeAndLighting = 'monsoon_rainy_atmosphere';
      updates.customLightingDetails = 'Moody rainy wet reflections, soft monsoon overcast diffuse light';
      updates.moodEmotion = 'nostalgic_melancholic';
    } else if (/sunset|golden hour|dawn|morning/i.test(lower)) {
      updates.timeAndLighting = 'golden_hour_sunset';
    } else if (/night|lantern|oil lamp|candle|thadingyut/i.test(lower)) {
      updates.timeAndLighting = 'thadingyut_oil_lamp';
      updates.event = 'thadingyut';
    }

    if (/street|yangon|city|road/i.test(lower)) {
      updates.location = detectedTimeline === '1940s' ? 'colonial_heritage_yangon' : 'modern_yangon_city';
    } else if (/temple|pagoda|brick|stupa/i.test(lower)) {
      updates.location = 'bagan_temples';
    } else if (/palace|court|throne/i.test(lower)) {
      updates.location = 'mandalay_palace_interior';
    }

    setProjectCategory(detectedCat);
    setHistoricalTimeline(detectedTimeline);
    onUpdateSelection(updates);
  };

  // Launch Suite from Setup Modal
  const handleLaunchSuite = () => {
    if (projectCategory === 'custom' && customConceptInput.trim()) {
      handleParseCustomConcept(customConceptInput);
    }
    if (projectCategory === 'product') {
      setStep1SubTab('product-ad');
      setStep2SubTab('commercial-backdrops');
      onUpdateSelection({
        subject: 'object',
        garmentStyle: '',
        makeupStyle: '',
        aspectRatio: selection.aspectRatio || '4:5'
      });
    }
    setShowSetupModal(false);
    setIsSynthesizerViewActive(false);
    setActiveStepId('subject');
  };

  // Navigation helpers
  const currentStepIndex = WIZARD_STEPS.findIndex(s => s.id === activeStepId);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setActiveStepId(WIZARD_STEPS[currentStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextStep = () => {
    if (isLastStep) {
      // Transition to Master Studio Synthesizer View
      setIsSynthesizerViewActive(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveStepId(WIZARD_STEPS[currentStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Trigger Final Synthesizer directly
  const handleGeneratePromptNow = () => {
    setIsSynthesizerViewActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step Completion Checker
  const isStepCompleted = (stepId: WizardStepId): boolean => {
    switch (stepId) {
      case 'subject':
        if (projectCategory === 'product') {
          return !!productImage || !!selection.customSubjectDetails || !!productHeadline;
        }
        return !!(selection.subject && selection.subject !== 'skip') || !!selection.customSubjectDetails || !!selection.garmentStyle;
      case 'context':
        return !!(selection.location && selection.location !== 'skip') || !!selection.customLocationDetails || !!(selection.event && selection.event !== 'skip');
      case 'composition':
        return !!(selection.cameraAngle && selection.cameraAngle !== 'skip') || !!(selection.poseExpression && selection.poseExpression !== 'skip');
      case 'style':
        return !!(selection.qualityProfile && selection.qualityProfile !== 'skip') || !!(selection.retouching && selection.retouching !== 'skip');
      case 'colorPalette':
        return !!(selection.colorGrade && selection.colorGrade !== 'skip');
      case 'lighting':
        return !!(selection.timeAndLighting && selection.timeAndLighting !== 'skip') || !!selection.customLightingDetails;
      case 'mood':
        return !!(selection.moodEmotion && selection.moodEmotion !== 'skip');
      case 'technical':
        return !!selection.aspectRatio || !!(selection.camera && selection.camera !== 'skip');
      default:
        return false;
    }
  };

  const completedStepsCount = useMemo(() => {
    return WIZARD_STEPS.filter(s => isStepCompleted(s.id)).length;
  }, [selection]);

  // Step 1 Custom Input Handlers
  const handleEnhanceStep1 = async (forcedVariation?: number) => {
    setIsStep1Enhancing(true);
    setStep1AddedFeedback(false);
    const variation = forcedVariation !== undefined ? forcedVariation : step1EnhanceVariation;
    const userText = step1CustomInput.trim() || selection.customSubjectDetails || '';
    
    try {
      const response = await fetch('/api/editor/auto-enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance Burmese cultural subject prompt for category "${projectCategory}" and timeline "${historicalTimeline}". User specifications: ${userText || 'Burmese ' + projectCategory}. Add authentic Burmese archival terms (Luntaya Acheik, Maha Lata, Mogok gemstones, Thanaka, etc.):`,
          mode: 'describe'
        })
      });
      const data = await response.json();
      if (data && data.success && data.enhanced_prompt) {
        setStep1EnhancedResult(data.enhanced_prompt);
      } else {
        const fallback = generateBurmeseArchivalEnhancement(userText, projectCategory, historicalTimeline, variation);
        setStep1EnhancedResult(fallback);
      }
    } catch {
      const fallback = generateBurmeseArchivalEnhancement(userText, projectCategory, historicalTimeline, variation);
      setStep1EnhancedResult(fallback);
    } finally {
      setIsStep1Enhancing(false);
    }
  };

  const handleApplyStep1Enhanced = () => {
    if (!step1EnhancedResult) return;
    onUpdateSelection({ customSubjectDetails: step1EnhancedResult });
    setStep1CustomInput(step1EnhancedResult);
    setStep1AddedFeedback(true);
    setTimeout(() => setStep1AddedFeedback(false), 3000);
  };

  const handleRecreateStep1Enhanced = () => {
    const nextVar = step1EnhanceVariation + 1;
    setStep1EnhanceVariation(nextVar);
    handleEnhanceStep1(nextVar);
  };

  // Step 2 Custom Input Handlers
  const handleEnhanceStep2 = async (forcedVariation?: number) => {
    setIsStep2Enhancing(true);
    setStep2AddedFeedback(false);
    const variation = forcedVariation !== undefined ? forcedVariation : step2EnhanceVariation;
    const userText = step2CustomInput.trim() || selection.customLocationDetails || '';
    
    try {
      const response = await fetch('/api/editor/auto-enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance Burmese cultural environment and staging prompt for category "${projectCategory}" and timeline "${historicalTimeline}". User location specifications: ${userText || 'Burmese historical backdrop'}. Add authentic architecture, atmospheric lighting, and staging details:`,
          mode: 'describe'
        })
      });
      const data = await response.json();
      if (data && data.success && data.enhanced_prompt) {
        setStep2EnhancedResult(data.enhanced_prompt);
      } else {
        const fallback = generateBurmeseArchivalEnhancement(userText, 'custom', historicalTimeline, variation);
        setStep2EnhancedResult(fallback);
      }
    } catch {
      const fallback = generateBurmeseArchivalEnhancement(userText, 'custom', historicalTimeline, variation);
      setStep2EnhancedResult(fallback);
    } finally {
      setIsStep2Enhancing(false);
    }
  };

  const handleApplyStep2Enhanced = () => {
    if (!step2EnhancedResult) return;
    onUpdateSelection({ customLocationDetails: step2EnhancedResult });
    setStep2CustomInput(step2EnhancedResult);
    setStep2AddedFeedback(true);
    setTimeout(() => setStep2AddedFeedback(false), 3000);
  };

  const handleRecreateStep2Enhanced = () => {
    const nextVar = step2EnhanceVariation + 1;
    setStep2EnhanceVariation(nextVar);
    handleEnhanceStep2(nextVar);
  };

  // AI Enhance Section per Step
  const handleEnhanceCurrentSection = async () => {
    if (activeStepId === 'subject') {
      await handleEnhanceStep1();
      return;
    }
    if (activeStepId === 'context') {
      await handleEnhanceStep2();
      return;
    }
    setIsEnhancingSection(true);
    const step = activeStepId;
    try {
      const response = await fetch('/api/editor/auto-enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Enhance Burmese cultural step "${step}" for category "${projectCategory}" and timeline "${historicalTimeline}" with authentic archival terminology: ${selection.customSubjectDetails || selection.customLocationDetails || masterPromptText}`,
          mode: 'describe'
        })
      });
      const data = await response.json();
      const enhancedText = data?.enhanced_prompt || data?.prompt || `Authentic Burmese ${projectCategory} specification with archival ${historicalTimeline} regalia and micro-texture depth.`;
      setEnhancedSections(prev => ({ ...prev, [step]: enhancedText }));
    } catch {
      setEnhancedSections(prev => ({
        ...prev,
        [step]: `High-fidelity Burmese cultural styling tuned for ${historicalTimeline.toUpperCase()} era with archival gold-leaf and silk accuracy.`
      }));
    } finally {
      setIsEnhancingSection(false);
    }
  };

  // Full AI Synthesize Action
  const handleAiSynthesizeFullStory = async () => {
    setIsSynthesizingAi(true);
    try {
      const response = await fetch('/api/editor/auto-enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Synthesize a comprehensive master prompt for Burmese ${projectCategory} in ${historicalTimeline} timeline. Details: ${masterPromptText}`,
          mode: 'describe'
        })
      });
      const data = await response.json();
      if (data && (data.enhanced_prompt || data.prompt)) {
        const fullPrompt = data.enhanced_prompt || data.prompt;
        setAiSynthesizedData({
          masterPrompt: fullPrompt,
          fluxFormat: fullPrompt.replace(/--\w+\s+\S+/g, '').trim(),
          midjourneyFormat: `/imagine prompt: ${fullPrompt} --ar ${selection.aspectRatio || '16:9'} --v 6.1 --style raw`,
          sdxlFormat: fullPrompt,
          descriptionEn: data.descriptionEn || 'High-fidelity Burmese archival masterpiece generated via SHOW AI Synthesizer.',
          descriptionMm: data.descriptionMm || 'SHOW AI မှ သမိုင်းဝင် တိကျမှု အပြည့်ဖြင့် ထုတ်လုပ်ပေးထားသော မြန်မာ့ရိုးရာ prompt ဖြစ်ပါသည်။'
        });
      }
    } catch {
      setAiSynthesizedData({
        masterPrompt: masterPromptText,
        fluxFormat: masterPromptText.replace(/--\w+\s+\S+/g, '').trim(),
        midjourneyFormat: `/imagine prompt: ${masterPromptText} --ar ${selection.aspectRatio || '16:9'} --v 6.1 --style raw`,
        sdxlFormat: masterPromptText,
        descriptionEn: 'High-fidelity Burmese visual configuration synthesized.',
        descriptionMm: 'မြန်မာ့ရိုးရာ prompt အသေးစိတ်ကို ပြင်ဆင်ပြီးပါပြီ။'
      });
    } finally {
      setIsSynthesizingAi(false);
    }
  };

  // Copy Prompt
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(displayedPromptText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Save Prompt
  const handleSavePreset = () => {
    if (onSavePrompt) {
      onSavePrompt(displayedPromptText, {
        selection,
        category: projectCategory,
        timeline: historicalTimeline,
        engine
      });
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Quick Starter Preset Applier
  const applyQuickPreset = (presetName: string) => {
    if (presetName === 'konbaung') {
      setProjectCategory('character');
      setHistoricalTimeline('royal');
      onUpdateSelection({
        subject: 'woman',
        customSubjectDetails: 'Konbaung Royal Court Lady with Maha Lata Bodice',
        garmentStyle: 'konbaung_royal',
        garmentFabric: 'Amarapura 100-Shuttle Luntaya Acheik Silk',
        location: 'mandalay_palace_interior',
        customLocationDetails: 'Gilded Golden Palace Throne Hall with Carved Teak Columns',
        timeAndLighting: 'golden_hour_sunset',
        cameraAngle: 'bust_portrait',
        qualityProfile: '8k_uhd',
        colorGrade: 'mandalay_gold',
        moodEmotion: 'regal_majestic',
        aspectRatio: '16:9'
      });
    } else if (presetName === '1940s_rangoon') {
      setProjectCategory('character');
      setHistoricalTimeline('1940s');
      onUpdateSelection({
        subject: 'woman',
        customSubjectDetails: '1940s Rangoon Vintage Heritage Lady with Parasol',
        garmentStyle: 'colonial_rangoon_lace',
        garmentFabric: 'Hand-loomed Pure Silk Longyi with Sheer French Lace Blouse',
        location: 'colonial_heritage_yangon',
        customLocationDetails: 'Vintage 1940s Strand Road Rangoon with Historic Brick Facades',
        timeAndLighting: 'monsoon_rainy_atmosphere',
        cameraAngle: 'cowboy_shot',
        qualityProfile: 'vintage_archive',
        colorGrade: 'monochrome_sepia',
        moodEmotion: 'nostalgic_melancholic',
        aspectRatio: '4:5'
      });
    } else if (presetName === 'thadingyut') {
      setProjectCategory('wedding');
      setHistoricalTimeline('royal');
      onUpdateSelection({
        subject: 'couple',
        customSubjectDetails: 'Royal Burmese Bridal Couple in Full Gold Thread Attire',
        garmentStyle: 'traditional_myanmar_royal',
        garmentFabric: 'Pure Zari Embroidered Silk Htamein and Silk Paso',
        location: 'bagan_temples',
        customLocationDetails: 'Illuminated Ancient Bagan Temple Terrace at Night',
        timeAndLighting: 'thadingyut_oil_lamp',
        event: 'thadingyut',
        cameraAngle: 'medium_portrait',
        colorGrade: 'festival_night',
        moodEmotion: 'festive_joyous',
        aspectRatio: '16:9'
      });
    } else if (presetName === 'product_ruby') {
      setProjectCategory('product');
      setHistoricalTimeline('royal');
      onUpdateSelection({
        subject: 'object',
        customSubjectDetails: 'Mogok Pigeon Blood Ruby Necklace with Burmese Jadeite and 24k Gold Filigree',
        garmentFabric: 'Deep Crimson Royal Velvet and Gold Thread',
        location: 'mandalay_palace_interior',
        customLocationDetails: 'Carved Royal Kanote Teakwood Pedestal Stand',
        timeAndLighting: 'pro_studio_softbox',
        cameraAngle: 'macro_extreme',
        qualityProfile: '8k_uhd',
        colorGrade: 'mandalay_gold',
        moodEmotion: 'regal_majestic',
        aspectRatio: '1:1'
      });
    }
  };

  const activeStepMeta = WIZARD_STEPS.find(s => s.id === activeStepId) || WIZARD_STEPS[0];

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans pb-32">
      
      {/* 🌟 1. UNIFIED CONTEXT & ACTION TOOLBAR (No Duplicate Header) */}
      <div className="w-full border-b border-zinc-800/80 bg-[#0a0d14]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Left: Active Context Badge */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:inline">
              Active Context:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-200 font-medium text-[11px] truncate shadow-xs">
              <span className="text-emerald-400 font-bold">
                {projectCategory === 'product' ? '📦 Product' : projectCategory === 'wedding' ? '💍 Wedding' : projectCategory === 'custom' ? '✨ Custom' : '👤 Character'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-teal-400 font-bold">
                {historicalTimeline === 'royal' ? '👑 Royal Court' : historicalTimeline === '1940s' ? '🕰️ 1940s' : '🏙️ Modern'}
              </span>
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="ml-0.5 text-[10px] text-zinc-400 hover:text-emerald-400 font-bold underline underline-offset-2 cursor-pointer transition"
              >
                Change
              </button>
            </div>
          </div>

          {/* Right: Actions (Presets Dropdown, Start Creating, Reset) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            
            {/* Quick Presets Dropdown */}
            <div className="relative shrink-0" ref={presetsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsPresetsDropdownOpen(!isPresetsDropdownOpen)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden xs:inline">{isMyanmar ? '✨ နမူနာများ' : '✨ Presets'}</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isPresetsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isPresetsDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-[#0e121a] border border-zinc-800 shadow-2xl py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60 pb-1 mb-1">
                    1-Click Archival Presets
                  </div>
                  {[
                    { id: 'konbaung', label: '✨ Konbaung Royal Court', desc: 'Maha Lata velvet & royal gold thread' },
                    { id: '1940s_rangoon', label: '🕰️ 1940s Rangoon Vintage', desc: 'French lace Yinzi, parasol & sepia tone' },
                    { id: 'thadingyut', label: '🏮 Thadingyut Royal Wedding', desc: 'Golden embroidery & night oil lamps' },
                    { id: 'product_ruby', label: '📦 Mogok Ruby Product', desc: 'Imperial jadeite & 24k carved teak stand' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        applyQuickPreset(p.id);
                        setIsPresetsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-emerald-500/10 hover:text-emerald-300 transition flex flex-col gap-0.5 cursor-pointer"
                    >
                      <span className="font-bold text-zinc-200">{p.label}</span>
                      <span className="text-[10px] text-zinc-400">{p.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Creating Setup Button */}
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black hover:brightness-110 active:scale-95 transition shadow-sm shadow-emerald-500/20 cursor-pointer shrink-0"
              title="Open Project Category & Timeline Setup"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black shrink-0" />
              <span>{isMyanmar ? '🚀 စတင်' : '🚀 Start'}</span>
            </button>

            {/* Reset All Button */}
            <button
              type="button"
              onClick={onResetAll}
              className="flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold border border-zinc-800 active:scale-95 transition cursor-pointer shrink-0"
              title="Reset all selections"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden md:inline ml-1">{isMyanmar ? 'အသစ်စ' : 'Reset'}</span>
            </button>

          </div>

        </div>
      </div>

      {/* 🌟 2. CLEAN RESPONSIVE PROGRESS STEPPER */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2 sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/20 p-1.5 shadow-xl shadow-black/40">
          
          {/* DESKTOP VIEW: Full 8-Step Horizontal Pill Row */}
          <div className="hidden lg:flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
            {WIZARD_STEPS.map((step, idx) => {
              const isActive = activeStepId === step.id && !isSynthesizerViewActive;
              const isCompleted = isStepCompleted(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setIsSynthesizerViewActive(false);
                    setActiveStepId(step.id);
                  }}
                  className={`flex-1 min-w-[105px] flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-black'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isActive
                      ? 'bg-black text-emerald-400'
                      : isCompleted
                      ? 'bg-emerald-500 text-black'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {isCompleted ? '✓' : `0${idx + 1}`}
                  </div>
                  <span className="truncate">
                    {isMyanmar ? step.titleMm.split('/')[0].trim() : step.titleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* MOBILE & TABLET VIEW: Sleek Compact Modern Step Card */}
          <div className="lg:hidden flex flex-col gap-1.5 px-1 py-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-md bg-emerald-500 text-black font-black text-[11px] flex items-center justify-center shrink-0">
                  {currentStepIndex + 1}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                    Step {currentStepIndex + 1}/8:
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {isMyanmar ? activeStepMeta.titleMm.split('/')[0].trim() : activeStepMeta.titleEn}
                  </span>
                </div>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={() => {
                    if (currentStepIndex > 0) {
                      setIsSynthesizerViewActive(false);
                      setActiveStepId(WIZARD_STEPS[currentStepIndex - 1].id);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-center transition cursor-pointer active:scale-95"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentStepIndex === WIZARD_STEPS.length - 1}
                  onClick={() => {
                    if (currentStepIndex < WIZARD_STEPS.length - 1) {
                      setIsSynthesizerViewActive(false);
                      setActiveStepId(WIZARD_STEPS[currentStepIndex + 1].id);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-25 disabled:cursor-not-allowed text-zinc-200 flex items-center justify-center transition cursor-pointer active:scale-95"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Progress Bar */}
            <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / 8) * 100}%` }}
              />
            </div>

            {/* Micro Jump Step Dots */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {WIZARD_STEPS.map((step, idx) => {
                const isActive = activeStepId === step.id && !isSynthesizerViewActive;
                const isCompleted = isStepCompleted(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setIsSynthesizerViewActive(false);
                      setActiveStepId(step.id);
                    }}
                    className={`flex-1 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-black font-black ring-1 ring-emerald-400'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300'
                    }`}
                    title={step.titleEn}
                  >
                    {isCompleted ? '✓' : `0${idx + 1}`}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 4. MAIN WORKSPACE */}
      <div className="max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 flex-1">
        
        {/* VIEW A: FINAL MASTER STUDIO SYNTHESIZER (Shown when 'Generate Prompt Now' is clicked) */}
        {isSynthesizerViewActive ? (
          <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Bar with Back Button */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <button
                type="button"
                onClick={() => setIsSynthesizerViewActive(false)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition cursor-pointer border border-zinc-700 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isMyanmar ? '← အဆင့် ၈ ဆင့် ပြင်ဆင်ချက်သို့ ပြန်သွားမည်' : '← Back to Edit Steps'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">
                  {completedStepsCount} of 8 Steps Configured
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Synthesizer Card */}
            <div className="w-full p-5 sm:p-7 rounded-3xl bg-[#0d1017] border border-emerald-500/30 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Master Studio Synthesizer Output</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Synthesized for {projectCategory.toUpperCase()} • {historicalTimeline.toUpperCase()} ERA • Model: {engine.toUpperCase()}
                  </p>
                </div>

                {/* Model Format Switcher */}
                <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
                  {(['master', 'flux', 'midjourney', 'sdxl', 'negative'] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setModelTab(tab)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition capitalize cursor-pointer ${
                        modelTab === tab
                          ? 'bg-emerald-500 text-black font-black shadow-xs'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab === 'master' ? 'Master' : tab === 'flux' ? 'FLUX Prose' : tab === 'midjourney' ? 'Midjourney' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Output Box */}
              <div className="relative">
                <textarea
                  readOnly
                  value={displayedPromptText}
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-emerald-500 select-all"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 shadow-md transition cursor-pointer active:scale-95"
                  >
                    {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToast ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* AI Cultural Era Inspector Warning Banner */}
              {culturalInspection.issues.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Cultural Era Conflict Detected ({culturalInspection.issues.length} issues)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSanitize}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 transition cursor-pointer"
                    >
                      🛠️ 1-Click Auto-Sanitize
                    </button>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {culturalInspection.issues[0]?.descriptionEn || culturalInspection.issues[0]?.titleEn}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSavePreset}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 transition cursor-pointer active:scale-95"
                  >
                    <Bookmark className="w-4 h-4 text-emerald-400" />
                    <span>{savedToast ? 'Saved to Vault!' : 'Save Preset'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAiSynthesizeFullStory}
                    disabled={isSynthesizingAi}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Wand2 className={`w-4 h-4 text-emerald-400 ${isSynthesizingAi ? 'animate-spin' : ''}`} />
                    <span>{isSynthesizingAi ? 'Synthesizing...' : 'AI Story Breakdown'}</span>
                  </button>
                </div>

                {onSendToPhotoStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      onSendToPhotoStudio(displayedPromptText, {
                        ratio: selection.aspectRatio || '16:9'
                      });
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-sm hover:brightness-110 active:scale-95 transition shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 fill-black" />
                    <span>Generate Image in Photo Prompt Studio →</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* VIEW B: FULL-WIDTH 8-STEP WIZARD WORKSPACE (100% Width, Right Panel Hidden) */
          <div className="w-full space-y-6 animate-in fade-in duration-150">
            
            {/* Step Card Container (100% Full Width) */}
            <div className="w-full p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0d1017] border border-zinc-800/80 shadow-2xl space-y-6">
              
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Step {activeStepMeta.stepNumber} of 8 • {activeStepMeta.badge}
                    </span>
                    <span className="text-zinc-500 text-xs">•</span>
                    <span className="text-xs text-zinc-400 font-medium">{activeStepMeta.tagline}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {isMyanmar ? activeStepMeta.titleMm : activeStepMeta.titleEn}
                  </h2>
                </div>

                {/* Step Enhanced Snippet if available */}
                {enhancedSections[activeStepId] && (
                  <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl max-w-sm truncate">
                    ✨ {enhancedSections[activeStepId]}
                  </div>
                )}
              </div>

              {/* STEP 1: SUBJECT (Consolidated Sub-Tabs: Product / Wedding / Character) */}
              {activeStepId === 'subject' && (
                <div className="space-y-6">
                  
                  {/* Category-Driven Internal Sub-Tabs */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2 overflow-x-auto scrollbar-none">
                    {projectCategory === 'product' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('product-ad')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            step1SubTab === 'product-ad' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>📢 Ad Campaign & Upload (ကြော်ငြာ Poster)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('product-types')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            step1SubTab === 'product-types' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>📦 Burmese Luxury Products (ကုန်ပစ္စည်း ၈ မျိုး)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('podiums')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            step1SubTab === 'podiums' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span>🏛️ Display Podiums & Plinths (စင်တင်ပြကွက်)</span>
                        </button>
                      </>
                    ) : projectCategory === 'wedding' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('wedding-studio')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'wedding-studio' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          💍 Wedding Studio (42 Templates)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('hair-studio')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'hair-studio' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          ✂️ Bridal Hairstyle Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('swatches')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'swatches' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          👑 Regalia & Silk Swatches
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('archetypes')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'archetypes' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          👑 Archetypes & Court Roles
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('ethnic135')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'ethnic135' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          👥 135 Ethnic Studio
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('outfits')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'outfits' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          👗 Outfits & Textiles (38 Styles)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('hair-studio')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'hair-studio' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          ✂️ Hairstyle Studio (33 Styles)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep1SubTab('swatches')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step1SubTab === 'swatches' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          💎 Jewelry & Fabric Swatches
                        </button>
                      </>
                    )}
                  </div>

                  {/* Sub-tab: Product Ad Campaign & Image Upload */}
                  {projectCategory === 'product' && step1SubTab === 'product-ad' && (
                    <div className="space-y-6">
                      
                      {/* 1. Image Upload Dropzone */}
                      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>{isMyanmar ? '၁။ ကုန်ပစ္စည်း ဓာတ်ပုံ တင်ရန် (Upload Product Image):' : '1. Upload Product Photo / Asset (Hero Subject):'}</span>
                          </label>
                          {productImage && (
                            <button
                              type="button"
                              onClick={() => setProductImage(null)}
                              className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isMyanmar ? 'ဖျက်မည်' : 'Remove Image'}</span>
                            </button>
                          )}
                        </div>

                        <input
                          ref={productImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />

                        {productImage ? (
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-black/60 border border-emerald-500/40">
                            <img
                              src={productImage}
                              alt="Uploaded Product"
                              className="w-24 h-24 object-contain rounded-xl bg-zinc-950 p-1 border border-zinc-700 shadow-md"
                            />
                            <div className="space-y-1 text-center sm:text-left flex-1">
                              <div className="flex items-center justify-center sm:justify-start gap-2">
                                <span className="text-xs font-bold text-white">Product Photo Loaded</span>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  HERO PRESERVED
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400">
                                {isMyanmar
                                  ? 'AI သည် ဤကုန်ပစ္စည်းကို အဓိကထား၍ ပရော်ဖက်ရှင်နယ် Graphic Design ကြော်ငြာ Poster တစ်ခုအဖြစ် ဖန်တီးပေးမည်ဖြစ်ပါသည်။'
                                  : 'AI will center this product in the poster, harmonizing commercial lighting, typography, and advertising stage around it.'}
                              </p>
                              <button
                                type="button"
                                onClick={() => productImageInputRef.current?.click()}
                                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold mt-1 cursor-pointer"
                              >
                                {isMyanmar ? 'ပုံအသစ် လဲလှယ်ရန်' : 'Replace with another photo'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => productImageInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 rounded-xl bg-black/40 hover:bg-emerald-500/5 transition cursor-pointer group text-center"
                          >
                            <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-emerald-500/20 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition mb-2">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300">
                              {isMyanmar ? 'ဓာတ်ပုံ တင်ရန် နှိပ်ပါ (သို့မဟုတ် ဖိုင်ဆွဲထည့်ပါ)' : 'Click to Upload Product Image (or drag and drop)'}
                            </span>
                            <span className="text-[11px] text-zinc-500 mt-1 max-w-sm">
                              {isMyanmar ? 'အလှကုန်၊ ကျောက်မျက်၊ လက်မှုပစ္စည်း၊ အဝတ်အထည် သို့မဟုတ် အစားအသောက် ဘူး' : 'Supports Cosmetics, Gemstones, Handbags, Thanaka, Tea Packaging, Luxury Crafts'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 2. Ad Goal & Promotion Objective */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isMyanmar ? '၂။ ကြော်ငြာ ရည်ရွယ်ချက် (Advertising Campaign Goal):' : '2. Advertising Campaign Goal:'}</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                          {[
                            { id: 'promotion', labelEn: 'Big Sale (50% OFF)', labelMm: 'အကြီးစား လျှော့ဈေး', icon: '🏷️', desc: 'Promotional discount banner with bold urgency' },
                            { id: 'launch', labelEn: 'New Product Launch', labelMm: 'ပစ္စည်းအသစ် မိတ်ဆက်', icon: '✨', desc: 'Exciting announcement with spotlight focus' },
                            { id: 'luxury', labelEn: 'Luxury Brand Campaign', labelMm: 'အဆင့်မြင့် တံဆိပ်', icon: '👑', desc: 'Opulent prestige editorial poster' },
                            { id: 'organic', labelEn: 'Pure Organic & Craft', labelMm: 'သဘာဝနှင့် ရိုးရာ', icon: '🌿', desc: 'Authentic pure heritage botanical aesthetics' },
                            { id: 'seasonal', labelEn: 'Festive Season Special', labelMm: 'ပွဲတော်ရာသီ အထူး', icon: '🎉', desc: 'Thingyan / Thadingyut celebratory campaign' }
                          ].map(goal => (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() => setProductAdGoal(goal.id as any)}
                              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                                productAdGoal === goal.id
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xl mb-1">{goal.icon}</div>
                              <div className="font-bold text-xs">{goal.labelEn}</div>
                              <div className="text-[10px] text-emerald-400 mt-0.5">{goal.labelMm}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Advertising Headline & Copy Input */}
                      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                        <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isMyanmar ? '၃။ ကြော်ငြာ ခေါင်းစဉ်နှင့် စာသား (Ad Headline & Typography):' : '3. Ad Headline & Graphic Typography:'}</span>
                          </span>
                          <span className="text-[10px] text-zinc-500">Reserved in negative space</span>
                        </label>
                        <input
                          type="text"
                          value={productHeadline}
                          onChange={(e) => setProductHeadline(e.target.value)}
                          placeholder="e.g. 50% OFF TODAY ONLY • LIMITED ROYAL EDITION • စစ်မှန်သော ရွှေဘိုသနပ်ခါး"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-zinc-700/80 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-zinc-500">Preset Ad Headlines:</span>
                          {[
                            '50% OFF TODAY ONLY',
                            'LIMITED ROYAL EDITION',
                            'NEW EXCLUSIVE ARRIVAL',
                            'BUY 1 GET 1 SPECIAL',
                            'NATURAL THANAKA SECRET',
                            'UNHEATED MOGOK RUBY'
                          ].map((hl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setProductHeadline(hl)}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                productHeadline === hl
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                  : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white'
                              }`}
                            >
                              {hl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Promotional Badges & Graphic Ribbons */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-300 block">
                          {isMyanmar ? '၄။ ကြော်ငြာ တံဆိပ်ခေါင်းနှင့် ဖဲကြိုးများ (Graphic Design Badges):' : '4. Graphic Design Badges & Seals:'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                          {[
                            { name: '🏷️ 3D Gold Ribbon Badge', desc: 'Embossed metallic gold promotional ribbon' },
                            { name: '⚡ Neon Cyber Sale Tag', desc: 'Glowing electric cyan sale badge' },
                            { name: '👑 Royal Burmese Heritage Seal', desc: 'Gilded court emblem stamp' },
                            { name: '🌿 Eco-Friendly Organic Stamp', desc: 'Subtle green botanical wax seal' },
                            { name: '✨ Minimalist Luxury Monogram', desc: 'Clean geometric brand badge' }
                          ].map((b, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProductBadge(b.name)}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                productBadge === b.name
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                              }`}
                            >
                              <div className="text-xs">{b.name}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">{b.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Sub-tab: Display Podiums & Plinths */}
                  {projectCategory === 'product' && step1SubTab === 'podiums' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { name: 'Polished Black Travertine Marble Plinth', desc: 'Ultra-luxurious dark marble cylinder with subtle specular reflections' },
                        { name: 'Gilded Burmese Kanote Carved Teakwood Stand', desc: 'Handcrafted royal court antique wooden pedestal draped in crimson velvet' },
                        { name: 'Floating Glass Display Block on Water Ripple', desc: 'Serene crystal-clear water surface with soft concentric ripples' },
                        { name: 'High-Key Matte White Minimalist Cylinder', desc: 'Pristine modern commercial studio podium with clean shadow falloff' },
                        { name: 'Raw Sandstone & Terracotta Pedestal', desc: 'Organic earth-toned ancient Bagan architectural block' },
                        { name: 'Illuminated Acrylic Neon Showcase Box', desc: 'Contemporary high-tech commercial glowing platform' }
                      ].map((pod, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setProductPodium(pod.name)}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                            productPodium === pod.name
                              ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md font-bold'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{pod.name}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{pod.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sub-tab: Product Types */}
                  {projectCategory === 'product' && step1SubTab === 'product-types' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { title: "Mogok Ruby & Jadeite Jewelry", mm: "မိုးကုတ် ပတ္တမြား နှင့် ကျောက်စိမ်း", icon: "💎", prompt: "Rare unheated Mogok Pigeon Blood Ruby and untreated imperial green jadeite jewelry piece with 24k gold filigree" },
                        { title: "Bagan Gold Lacquerware Box", mm: "ပုဂံ ရွှေချည်ထိုး ယွန်းထည်", icon: "🏺", prompt: "Traditional handcrafted Bagan gold-leaf etched lacquerware betel box (Yun-de) with intricate mythological motifs" },
                        { title: "Amarapura Luntaya Acheik Silk", mm: "အမရပူရ လွန်းရာကျော် ပိုးချိတ်", icon: "🧵", prompt: "Masterpiece roll of Amarapura 100-shuttle Luntaya Acheik handwoven silk with shimmering metallic zari threads" },
                        { title: "Inle Sacred Lotus-Fiber Textile", mm: "အင်းလေး ကြာချည်ထည် စစ်စစ်", icon: "🪷", prompt: "Rare handwoven sacred Inle Lake lotus stem fiber textile with organic woven texture" },
                        { title: "Shwebo Thanaka Bark & Kyauk-pyin", mm: "ရွှေဘို သနပ်ခါး နှင့် ကျောက်ပြင်", icon: "🪵", prompt: "Authentic aged Shwebo Thanaka wood bark log paired with traditional circular carved Kyauk-pyin stone grinder slab" },
                        { title: "Royal Shan Roasted Mountain Tea", mm: "ရှမ်းရိုးရာ တောင်ပေါ်လက်ဖက်", icon: "🍵", prompt: "Artisanal organic Shan highland roasted green tea leaves presented in handcrafted bamboo and lacquer caddy" },
                        { title: "Mandalay Teak Marionette Puppet", mm: "မန္တလေး ရိုးရာ ရုပ်သေးရုပ်", icon: "🎭", prompt: "Antique hand-carved Mandalay royal court teak marionette puppet with beaded silk costume" },
                        { title: "Pathein Waterproof Floral Parasol", mm: "ပုသိမ်ထီး ရိုးရာ လက်မှု", icon: "☂️", prompt: "Handcrafted Pathein oiled cotton umbrella with hand-painted traditional Burmese peony and bird motifs" }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateSelection({ customSubjectDetails: item.prompt })}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                            selection.customSubjectDetails === item.prompt
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <div className="font-bold text-xs">{item.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">{item.mm}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sub-tab: Wedding Studio Embedded */}
                  {projectCategory === 'wedding' && step1SubTab === 'wedding-studio' && (
                    <div className="w-full">
                      <BurmeseWeddingStudioView
                        language={language}
                        engine={engine}
                        onSendToMatrix={(p) => onUpdateSelection({ customSubjectDetails: p })}
                        onSavePrompt={onSavePrompt}
                        onSendToPhotoStudio={onSendToPhotoStudio}
                      />
                    </div>
                  )}

                  {/* Sub-tab: Hairstyle Studio Embedded */}
                  {projectCategory !== 'product' && step1SubTab === 'hair-studio' && (
                    <div className="w-full">
                      <BurmeseHairStudioView
                        language={language}
                        engine={engine}
                        onSendToMatrix={(p) => onUpdateSelection({ customPoseDetails: p })}
                        onSavePrompt={onSavePrompt}
                        onSendToPhotoStudio={onSendToPhotoStudio}
                      />
                    </div>
                  )}

                  {/* Sub-tab: Archetypes */}
                  {projectCategory !== 'product' && projectCategory !== 'wedding' && step1SubTab === 'archetypes' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {SUBJECT_OPTIONS.filter(o => o.id !== 'skip').map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onUpdateSelection({ subject: opt.id })}
                            className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                              selection.subject === opt.id
                                ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                                : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <div className="text-xl mb-1">{opt.emoji || '👤'}</div>
                            <div className="font-bold text-xs">{isMyanmar ? opt.labelMm : opt.labelEn}</div>
                          </button>
                        ))}
                      </div>

                      {/* Timeline-filtered archetypes */}
                      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                          {historicalTimeline.toUpperCase()} ERA ARCHETYPES:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(historicalTimeline === '1940s' ? [
                            '1940s Rangoon Literary Scholar with Pinni Coat',
                            'Colonial Heritage High School Teacher with Lace Yinzi',
                            '1940s Vintage Merchant Lady with Parasol & Gold Torque',
                            'Post-WWII Yangon Photo Studio Model with Wave Hairstyle'
                          ] : historicalTimeline === 'modern' ? [
                            'Modern Myanmar High-Fashion Runway Model',
                            'Contemporary Burmese Haute Couture Designer',
                            'Yangon Creative Director in Minimalist Taikpon',
                            'Modern Wedding Bridal Influencer'
                          ] : [
                            'Bagan Royal Queen in Terracotta & Lotus Bodice',
                            'Konbaung Crown Prince in Maha Lata Bullion Attire',
                            'Inwa Court Lady with 100-Shuttle Luntaya Acheik',
                            'Royal Court Classical Dancer with Golden Winged Epaulets'
                          ]).map((arch, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => onUpdateSelection({ customSubjectDetails: arch })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                selection.customSubjectDetails === arch
                                  ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                              }`}
                            >
                              {arch}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-tab: 135 Ethnic Nationalities */}
                  {step1SubTab === 'ethnic135' && (
                    <div className="w-full">
                      <EthnicStudioView
                        language={language}
                        onSendToMatrix={(p) => onUpdateSelection({ customEthnicityDetails: p })}
                        onSendToPhotoStudio={onSendToPhotoStudio}
                      />
                    </div>
                  )}

                  {/* Sub-tab: Outfits Carousel */}
                  {step1SubTab === 'outfits' && (
                    <div className="w-full">
                      <GarmentSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}

                  {/* Sub-tab: Fabric & Jewelry Swatches */}
                  {step1SubTab === 'swatches' && (
                    <div className="w-full">
                      <FabricJewelrySwatchesView
                        language={language}
                        onSendToMatrix={(p) => onUpdateSelection({ culturalPropsDetails: p })}
                        onSendToPhotoStudio={onSendToPhotoStudio}
                      />
                    </div>
                  )}

                  {/* Custom Subject Details Input with Inline AI Enhance & Recreate */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-emerald-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {isMyanmar ? 'စိတ်ကြိုက် ဇာတ်ကောင် / ပစ္စည်း အသေးစိတ် (Custom Details):' : 'Custom Subject / Product Specifications:'}
                        </span>
                      </label>
                      {step1CustomInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setStep1CustomInput('');
                            onUpdateSelection({ customSubjectDetails: '' });
                            setStep1EnhancedResult('');
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={step1CustomInput}
                        onChange={(e) => {
                          setStep1CustomInput(e.target.value);
                          onUpdateSelection({ customSubjectDetails: e.target.value });
                        }}
                        placeholder={
                          projectCategory === 'product'
                            ? 'e.g. Rare Mogok untreated pigeon blood ruby set in 24k antique Burmese gold with emerald accents'
                            : projectCategory === 'wedding'
                            ? 'e.g. Royal Burmese bridal couple in pure gold-embroidered silk attire with traditional jasmine garlands'
                            : 'e.g. 1940s Burmese lady holding oiled-paper umbrella with graceful smile on rainy street'
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-zinc-700/80 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 placeholder:text-zinc-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEnhanceStep1();
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleEnhanceStep1()}
                        disabled={isStep1Enhancing}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isStep1Enhancing ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Enhancing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 fill-black" />
                            <span>✨ Enhance</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* ✨ AI ENHANCED SUGGESTION CARD */}
                    {step1EnhancedResult && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-zinc-950 border border-emerald-500/40 space-y-2.5 mt-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 fill-emerald-400/30 text-emerald-400" />
                            <span>Archival Cultural Enhancement #{step1EnhanceVariation + 1}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep1EnhancedResult('')}
                            className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-xs text-emerald-100/90 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-emerald-500/20 select-all font-mono">
                          {step1EnhancedResult}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* + Add to Prompt Selection Button */}
                          <button
                            type="button"
                            onClick={handleApplyStep1Enhanced}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow cursor-pointer ${
                              step1AddedFeedback || selection.customSubjectDetails === step1EnhancedResult
                                ? 'bg-emerald-500 text-black shadow-emerald-500/25'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {step1AddedFeedback || selection.customSubjectDetails === step1EnhancedResult ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>✓ Added to Prompt Selection</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>+ Add to Prompt Selection</span>
                              </>
                            )}
                          </button>

                          {/* 🔄 Recreate Again Button */}
                          <button
                            type="button"
                            onClick={handleRecreateStep1Enhanced}
                            disabled={isStep1Enhancing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isStep1Enhancing ? 'animate-spin' : ''}`} />
                            <span>🔄 Recreate Again</span>
                          </button>

                          {/* Copy Snippet */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(step1EnhancedResult);
                            }}
                            className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition flex items-center gap-1 ml-auto"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 2: CONTEXT & BURMESE PROPS */}
              {activeStepId === 'context' && (
                <div className="space-y-6">
                  
                  {/* Context Sub-Tabs */}
                  <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2 overflow-x-auto scrollbar-none">
                    {projectCategory === 'product' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep2SubTab('commercial-backdrops')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step2SubTab === 'commercial-backdrops' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          🏛️ Commercial Backdrops & Staging
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep2SubTab('floating-elements')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step2SubTab === 'floating-elements' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          ✨ Dynamic Floating Elements & Ad Effects
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setStep2SubTab('locations')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step2SubTab === 'locations' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          🏛️ Locations & Architecture
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep2SubTab('festivals')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step2SubTab === 'festivals' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          🏮 12 Traditional Festivals
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep2SubTab('props')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            step2SubTab === 'props' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          🏺 Burmese Cultural Props
                        </button>
                      </>
                    )}
                  </div>

                  {/* Product Sub-tab: Commercial Backdrops */}
                  {projectCategory === 'product' && step2SubTab === 'commercial-backdrops' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { name: 'Luxury Studio Dark Slate Cyclorama with Soft Gradient Fog', desc: 'High-end commercial depth with subtle floor reflections' },
                        { name: 'Minimalist Pure White High-Key Studio with Soft Ground Shadow', desc: 'Ultra-clean Apple-style commercial product staging' },
                        { name: 'Mandalay Golden Palace Throne Hall Background with Teak Columns', desc: 'Opulent royal Burmese architectural heritage' },
                        { name: 'Ancient Bagan Brick Temple Terrace at Dawn Mist', desc: 'Mystical golden hour temple backdrop' },
                        { name: 'Tropical Calm Water Surface with Floating Water Lilies', desc: 'Serene botanical luxury reflection pool' },
                        { name: 'Modern High-Rise Penthouse with Yangon Night Skyline View', desc: 'Contemporary luxury lifestyle setting' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateSelection({ customLocationDetails: item.name })}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                            selection.customLocationDetails === item.name
                              ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Sub-tab: Floating Elements */}
                  {projectCategory === 'product' && step2SubTab === 'floating-elements' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { name: 'Floating 24k gold dust & sparkling bokeh particles', desc: 'Shimmering luxury gold flecks dancing in commercial lighting' },
                        { name: 'Dynamic splashing crystal-clear water droplets', desc: 'Fresh, hydrating cosmetic & beverage splash frozen in time' },
                        { name: 'Falling fragrant jasmine petals & fresh lotus blossoms', desc: 'Traditional botanical aroma aesthetics' },
                        { name: 'Floating fresh green tea leaves with morning dew', desc: 'Organic Shan highland tea freshness' },
                        { name: 'Floating faceted ruby & jadeite micro-crystals', desc: 'Sparkling gem particles catching light' },
                        { name: 'Swirling pure silk ribbon & sandalwood incense vapor', desc: 'Fluid movement adding cinematic grace' }
                      ].map((el, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setProductFloatingElements(el.name)}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                            productFloatingElements === el.name
                              ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{el.name}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{el.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {projectCategory !== 'product' && step2SubTab === 'locations' && (
                    <div className="space-y-4">
                      {/* Timeline-filtered Location Suggestions */}
                      <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                          {historicalTimeline.toUpperCase()} ERA BACKDROPS:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(historicalTimeline === '1940s' ? [
                            '1940s Colonial Rangoon Heritage Street with Vintage Trams',
                            'Historic Yangon Colonial Railway Station with Brick Arches',
                            'Irrawaddy Heritage Steamboat Wooden Promenade Deck',
                            'Vintage 1940s Photo Studio with Hand-Painted Canvas Backdrop'
                          ] : historicalTimeline === 'modern' ? [
                            'Modern Yangon Skyline with Glowing Shwedagon Pagoda View',
                            'High-End Luxury Hotel Grand Ballroom with Crystal Chandeliers',
                            'Minimalist Commercial Photo Studio with Matte Plinth',
                            'Boutique Coastal Resort Terrace in Ngapali'
                          ] : [
                            'Mandalay Golden Palace Throne Hall with Carved Teak Columns',
                            'Ancient Bagan Brick Temple Terrace at Dawn Mist',
                            'Historic Carved Teak Monastery with Tyndall Incense Light',
                            'Royal Palace Lotus Pond with Water Lilies & Marble Balustrades'
                          ]).map((loc, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => onUpdateSelection({ customLocationDetails: loc })}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                selection.customLocationDetails === loc
                                  ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                                  : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-600'
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      <LocationSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}

                  {projectCategory !== 'product' && step2SubTab === 'festivals' && (
                    <div className="w-full">
                      <FestivalsStudioView
                        language={language}
                        onSendToMatrix={(p) => onUpdateSelection({ customEventDetails: p })}
                        onSendToPhotoStudio={onSendToPhotoStudio}
                      />
                    </div>
                  )}

                  {projectCategory !== 'product' && step2SubTab === 'props' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(projectCategory === 'product' ? (
                        historicalTimeline === '1940s' ? [
                          { name: 'Aged Colonial Teak Desk', desc: 'Antique solid teak wood desk with heritage patina' },
                          { name: 'Vintage Brass Ceremonial Tray', desc: 'Engraved mid-century Burmese brass display surface' },
                          { name: 'Vintage Embroidered Lace Tablecloth', desc: 'Delicate hand-loomed heritage lace linen' },
                          { name: 'Antique Glass Vitrine Display', desc: 'Classic wooden showcase with velvet base' }
                        ] : historicalTimeline === 'modern' ? [
                          { name: 'Polished Black/White Marble Podium', desc: 'Minimalist luxury geometric pedestal' },
                          { name: 'Floating Lotus Petals on Water Ripple', desc: 'Serene botanical water surface with reflections' },
                          { name: 'Illuminated Acrylic Display Block', desc: 'Contemporary high-fashion jewelry pedestal' },
                          { name: 'Natural Slate & Raw Teak Plinth', desc: 'Organic architectural texture combination' }
                        ] : [
                          { name: 'Gilded Royal Pedestal (Shwe Kalat)', desc: '24k gold leaf royal offering stand' },
                          { name: 'Intricate Kanote Carved Teak Stand', desc: 'Master woodcarving with floral filigree' },
                          { name: 'Vermilion Lacquer Ceremonial Tray', desc: 'Bagan royal red lacquerware plate' },
                          { name: 'Gold Lotus Leaf Shallow Bowl', desc: 'Handcrafted courtly centerpiece' }
                        ]
                      ) : [
                        { name: 'Pathein Handcrafted Parasol', desc: 'Traditional floral oiled parasol' },
                        { name: 'Mogok Ruby Filigree Torque', desc: 'Royal golden neckpiece with ruby stones' },
                        { name: 'Circular Stone Thanaka Grinder', desc: 'Kyauk-pyin with fragrant Thanaka bark' },
                        { name: 'Royal Silver Water Bowl (Pha-la)', desc: 'Hand-embossed repousse silver bowl' },
                        { name: 'Lacquerware Betel Box (Kun-it)', desc: 'Multi-tiered traditional Bagan lacquer' },
                        { name: 'Fresh Jasmine & Lotus Garland', desc: 'Fragrant ceremonial floral offering' }
                      ]).map((prop, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateSelection({ culturalPropsDetails: prop.name })}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                            selection.culturalPropsDetails === prop.name
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{prop.name}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{prop.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Context Details Input with Inline AI Enhance & Recreate */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-emerald-300 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {isMyanmar ? 'စိတ်ကြိုက် နောက်ခံ / ပွဲတော် (Custom Environment Details):' : 'Custom Environment & Staging Details:'}
                        </span>
                      </label>
                      {step2CustomInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setStep2CustomInput('');
                            onUpdateSelection({ customLocationDetails: '' });
                            setStep2EnhancedResult('');
                          }}
                          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={step2CustomInput}
                        onChange={(e) => {
                          setStep2CustomInput(e.target.value);
                          onUpdateSelection({ customLocationDetails: e.target.value });
                        }}
                        placeholder="e.g. Set against misty Shan mountain pagoda terrace at sunrise with floating prayer flags"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-zinc-700/80 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 placeholder:text-zinc-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEnhanceStep2();
                          }
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => handleEnhanceStep2()}
                        disabled={isStep2Enhancing}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isStep2Enhancing ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Enhancing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 fill-black" />
                            <span>✨ Enhance</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* ✨ AI ENHANCED SUGGESTION CARD */}
                    {step2EnhancedResult && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-zinc-950 border border-emerald-500/40 space-y-2.5 mt-2 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 fill-emerald-400/30 text-emerald-400" />
                            <span>Archival Environment Enhancement #{step2EnhanceVariation + 1}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep2EnhancedResult('')}
                            className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-xs text-emerald-100/90 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-emerald-500/20 select-all font-mono">
                          {step2EnhancedResult}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* + Add to Prompt Selection Button */}
                          <button
                            type="button"
                            onClick={handleApplyStep2Enhanced}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow cursor-pointer ${
                              step2AddedFeedback || selection.customLocationDetails === step2EnhancedResult
                                ? 'bg-emerald-500 text-black shadow-emerald-500/25'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {step2AddedFeedback || selection.customLocationDetails === step2EnhancedResult ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>✓ Added to Prompt Selection</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>+ Add to Prompt Selection</span>
                              </>
                            )}
                          </button>

                          {/* 🔄 Recreate Again Button */}
                          <button
                            type="button"
                            onClick={handleRecreateStep2Enhanced}
                            disabled={isStep2Enhancing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isStep2Enhancing ? 'animate-spin' : ''}`} />
                            <span>🔄 Recreate Again</span>
                          </button>

                          {/* Copy Snippet */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(step2EnhancedResult);
                            }}
                            className="text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition flex items-center gap-1 ml-auto"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* STEP 3: COMPOSITION (Prioritized by Category) */}
              {activeStepId === 'composition' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block mb-3">
                      {projectCategory === 'product' ? 'Commercial Product Framing & Camera Angles:' : 'Framing & Camera Perspectives:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(projectCategory === 'product' ? [
                        { id: 'macro_extreme', title: 'Macro 1:1 Detail Close-Up', desc: 'Extreme close focus on gemstone faceting, silk weave, and lacquer glaze' },
                        { id: 'hero_45', title: '45° Commercial Hero Shot', desc: 'Standard studio product angle showing dimension, depth, and shadow' },
                        { id: 'top_down_flatlay', title: 'Top-Down Flat Lay', desc: 'Elegant bird’s-eye arrangement of items and cultural accessories' },
                        { id: 'podium_center', title: 'Podium Center Framing', desc: 'Regal museum pedestal framing with symmetrical balance' },
                        { id: 'floating_exploded', title: 'Dynamic Floating Exploded View', desc: 'Modern gravity-defying floating product composition' },
                        { id: 'shallow_dof_table', title: 'Shallow Depth Tabletop', desc: 'Soft blurred cultural background with razor-sharp product focus' }
                      ] : projectCategory === 'wedding' ? [
                        { id: 'romantic_two_shot', title: 'Romantic Two-Shot', desc: 'Intimate bride & groom medium portrait capturing mutual warmth' },
                        { id: 'wide_prewedding', title: 'Wide Architectural Pre-Wedding', desc: 'Epic environmental shot framed by ancient temple or colonial arch' },
                        { id: 'candid_intimate', title: 'Candid Intimate Framing', desc: 'Heartfelt unposed smile, hand-holding, and veil movement' },
                        { id: 'macro_rings_attire', title: 'Attire & Rings Macro Detail', desc: 'Focused close-up of interlocking Acheik silk and wedding rings' },
                        { id: 'full_ceremonial', title: 'Full-Length Ceremonial Portrait', desc: 'Traditional formal pose showcasing full bridal trains' }
                      ] : [
                        { id: 'extreme_closeup', title: 'Extreme Close-Up (ECU)', desc: 'Focused on eyes, Thanaka cheek patterns, and skin micro-texture' },
                        { id: 'bust_portrait', title: 'Medium Bust Portrait', desc: 'Classic head-and-shoulders highlighting jewelry and neckline' },
                        { id: 'cowboy_shot', title: 'Cowboy Shot (3/4th Length)', desc: 'Torso to mid-thigh capturing posture and longyi patterns' },
                        { id: 'full_body', title: 'Full-Body Ethnographic Shot', desc: 'Complete traditional attire and posture from head to footwear' },
                        { id: 'low_heroic', title: 'Low Heroic Angle', desc: 'Empowering cinematic perspective looking slightly upward' }
                      ]).map(comp => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => onUpdateSelection({ cameraAngle: comp.id as any })}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                            selection.cameraAngle === comp.id
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{comp.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{comp.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <CameraAngleSelectionCarousel
                    language={language}
                    selection={selection}
                    onUpdateSelection={onUpdateSelection}
                  />
                </div>
              )}

              {/* STEP 4: STYLE */}
              {activeStepId === 'style' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-300 block">
                    {projectCategory === 'product'
                      ? 'Graphic Design Poster Style & Commercial Aesthetic (ကြော်ငြာ ဟန်ပန်):'
                      : `Aesthetic Medium & Art Style (Tuned for ${historicalTimeline.toUpperCase()} Era):`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(projectCategory === 'product' ? [
                      { id: 'octane_3d_render', title: '3D Octane / Cinema4D Render', desc: 'Hyper-glossy modern commercial poster with ray-traced reflections' },
                      { id: 'commercial_8k_studio', title: 'Modern Luxury High-Fashion Ad', desc: 'Vogue-style pristine commercial lighting and minimalist layout' },
                      { id: 'bold_pop_art_banner', title: 'Bold Pop-Art Commercial Flyer', desc: 'High-contrast vibrant social media promotional poster' },
                      { id: 'vintage_lithograph_ad', title: 'Vintage Burmese Lithograph Ad', desc: '1940s colonial Rangoon heritage advertisement poster' }
                    ] : historicalTimeline === '1940s' ? [
                      { id: 'vintage_silver_gelatin', title: '1940s Silver Gelatin Photo', desc: 'Authentic mid-century black and white photographic print with smooth tonality' },
                      { id: 'colonial_postcard', title: 'Hand-Tinted Colonial Postcard', desc: 'Early 20th century hand-colored archival postcard print' },
                      { id: 'classic_35mm_grain', title: 'Classic 35mm Film Grain Still', desc: 'Warm cinema still with organic analog film grain and soft roll-off' },
                      { id: 'early_kodachrome', title: 'Early Kodachrome Warm Tone', desc: 'Rich 1940s color film archive with saturated reds and golds' }
                    ] : historicalTimeline === 'modern' ? [
                      { id: 'commercial_8k_studio', title: '8K Commercial Studio Photo', desc: 'Razor-sharp commercial photography with pristine edge clarity' },
                      { id: 'vogue_editorial', title: 'Vogue Editorial Fashion', desc: 'Contemporary high-fashion magazine aesthetic with dynamic poise' },
                      { id: 'unreal_engine_5', title: 'Unreal Engine 5 3D Render', desc: 'Cutting-edge photorealistic CGI with ray-traced lighting' },
                      { id: 'crisp_digital_cinema', title: 'Crisp Digital Cinema (ARRI)', desc: 'Modern anamorphic 4K cinema look with rich dynamic range' }
                    ] : [
                      { id: 'bagan_wall_fresco', title: 'Bagan Wall Mural / Fresco', desc: 'Ancient 11th-century temple wall fresco with aged terracotta plaster' },
                      { id: 'parabaik_manuscript', title: 'Parabaik Royal Manuscript', desc: 'Traditional Burmese folded accordion manuscript watercolor painting' },
                      { id: 'regal_classical_oil', title: 'Regal Classical Oil Painting', desc: 'Opulent European-influenced Burmese court oil masterpiece' },
                      { id: 'epic_historical_cinema', title: 'Epic Historical Cinema Still', desc: 'Grand feudal dynasty period drama film cinematography' }
                    ]).map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => onUpdateSelection({ qualityProfile: style.id as any })}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          selection.qualityProfile === style.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{style.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: COLOR PALETTE */}
              {activeStepId === 'colorPalette' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-300 block">
                    {projectCategory === 'product'
                      ? 'Brand Commercial Color Harmony (တံဆိပ် အရောင်အသွေး):'
                      : `Curated Color Swatches (Tuned for ${historicalTimeline.toUpperCase()} Era):`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {(projectCategory === 'product' ? [
                      { id: 'gold_obsidian', name: 'Royal Gold & Obsidian Black', dots: ['#FFD700', '#1C1917', '#78350F'], desc: 'Supreme luxury jewelry, watches and imperial craft' },
                      { id: 'high_key_white', name: 'High-Key Pure White & Platinum', dots: ['#FFFFFF', '#E2E8F0', '#94A3B8'], desc: 'Clean minimalist cosmetics, skincare & tech products' },
                      { id: 'crimson_festive_sale', name: 'Bold Crimson Red & Gold', dots: ['#DC2626', '#F59E0B', '#1E1B4B'], desc: 'High-energy big promotion and festive seasonal sale' }
                    ] : historicalTimeline === '1940s' ? [
                      { id: 'monochrome_sepia', name: 'Monochrome Sepia & Silver', dots: ['#2C221E', '#8B7D6B', '#E8DFC8'], desc: 'Warm charcoal, sepia wash and aged paper white' },
                      { id: 'faded_ochre_indigo', name: 'Warm Faded Ochre & Indigo', dots: ['#B8860B', '#2E4057', '#E5DCC5'], desc: 'Colonial postal tones and heritage dyed fabrics' },
                      { id: 'vintage_brass_rose', name: 'Vintage Brass & Muted Rose', dots: ['#B5A642', '#A0522D', '#D8A47F'], desc: 'Antique brass filigree, tea-stained lace & rose silk' }
                    ] : historicalTimeline === 'modern' ? [
                      { id: 'commercial_vibrant', name: 'High-Contrast Commercial Vibrant', dots: ['#10B981', '#06B6D4', '#18181B'], desc: 'Bold emerald, radiant cyan and deep studio blacks' },
                      { id: 'luxury_bridal_pastel', name: 'Soft Luxury Bridal Pastels', dots: ['#FBCFE8', '#E0E7FF', '#FEF3C7'], desc: 'Champagne gold, powder pink and ivory silk' },
                      { id: 'studio_monochrome', name: 'Clean Neutral Studio', dots: ['#FFFFFF', '#71717A', '#18181B'], desc: 'Pure studio white, titanium gray and dark charcoal' }
                    ] : [
                      { id: 'mandalay_gold', name: 'Royal Gold Leaf & Vermilion', dots: ['#FFD700', '#C8102E', '#1A3D2F'], desc: 'Konbaung dynasty pure gold leaf, vermilion and emerald velvet' },
                      { id: 'bagan_terracotta', name: 'Ancient Bagan Sandstone & Ochre', dots: ['#C05A3E', '#D2B48C', '#4A2E18'], desc: 'Baked brick terracotta, desert ochre and dark teakwood' },
                      { id: 'lotus_jade', name: 'Lotus Jade & Sacred Teak', dots: ['#0B6623', '#79443B', '#D4AF37'], desc: 'Imperial Mogok jadeite green, antique teak and gold filigree' }
                    ]).map(pal => (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => onUpdateSelection({ colorGrade: pal.id as any })}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          selection.colorGrade === pal.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {pal.dots.map((d, i) => (
                            <span key={i} className="w-5 h-5 rounded-full border border-black/30 shadow-xs" style={{ backgroundColor: d }} />
                          ))}
                        </div>
                        <div className="font-bold text-xs">{pal.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{pal.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: LIGHTING */}
              {activeStepId === 'lighting' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-300 block">
                    {projectCategory === 'product'
                      ? 'Commercial Studio Lighting Rigs (စတူဒီယို ကြော်ငြာ အလင်း):'
                      : `Lighting Mood & Optics (Tuned for ${historicalTimeline.toUpperCase()} Era):`}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(projectCategory === 'product' ? [
                      { id: 'pro_studio_softbox', title: 'Pro Studio Dual Softbox & Rim', desc: 'Pristine wrap-around key light with sharp edge separation rim' },
                      { id: 'specular_gem_light', title: 'Precision Specular Jewelry Optics', desc: 'Pinpoint optical highlights capturing gemstone refraction and metallic sparkle' },
                      { id: 'underlit_acrylic_glow', title: 'Dramatic Underlit Platform Glow', desc: 'Futuristic glowing acrylic pedestal elevating product presence' }
                    ] : historicalTimeline === '1940s' ? [
                      { id: '1940s_flashbulb', title: '1940s Studio Flashbulb', desc: 'High-contrast direct vintage flash with dramatic falloff shadows' },
                      { id: 'colonial_window_light', title: 'Diffused Colonial Window Light', desc: 'Soft afternoon sunlight filtering through wooden louvers' },
                      { id: 'monsoon_rainy_atmosphere', title: 'Warm Nostalgic Monsoon Haze', desc: 'Rain-slicked reflections and misty overcast ambient mood' }
                    ] : historicalTimeline === 'modern' ? [
                      { id: 'pro_studio_softbox', title: 'Pro Studio Dual Softbox & Rim', desc: 'Pristine wrap-around key light with sharp edge separation rim' },
                      { id: 'specular_gem_light', title: 'Precision Specular Jewelry Light', desc: 'Pinpoint optical highlights capturing gemstone refraction' },
                      { id: 'golden_hour_sunset', title: 'Golden Hour Flare & Backlight', desc: 'Warm cinematic sunset glow with subtle natural lens flare' }
                    ] : [
                      { id: 'thadingyut_oil_lamp', title: 'Traditional Oil Lamp (Si-Mi) Glow', desc: 'Warm flickering amber candlelight and terracotta clay lamps' },
                      { id: 'tyndall_incense_rays', title: 'Volumetric Temple Incense Rays', desc: 'Dramatic God-rays streaming through pagoda doorways in incense smoke' },
                      { id: 'golden_hour_sunset', title: 'Palace Courtyard Sunlight', desc: 'Rich golden late afternoon sunlight bathing gilded spires' }
                    ]).map(light => (
                      <button
                        key={light.id}
                        type="button"
                        onClick={() => onUpdateSelection({ timeAndLighting: light.id as any })}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          selection.timeAndLighting === light.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{light.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{light.desc}</div>
                      </button>
                    ))}
                  </div>

                  <LightingSelectionCarousel
                    language={language}
                    selection={selection}
                    onUpdateSelection={onUpdateSelection}
                  />
                </div>
              )}

              {/* STEP 7: MOOD & ATMOSPHERE */}
              {activeStepId === 'mood' && (
                <div className="space-y-4">
                  <span className="text-xs font-bold text-zinc-300 block">
                    {projectCategory === 'product'
                      ? 'Commercial Advertisement Mood & Urgency (ကြော်ငြာ ခံစားချက်):'
                      : `Mood & Emotional Resonance (Category: ${projectCategory.toUpperCase()} • Timeline: ${historicalTimeline.toUpperCase()}):`}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(projectCategory === 'product' ? [
                      { id: 'urgent_promotion_fomo', title: 'Urgent Promotion & FOMO', desc: 'High-energy "Limited Time Exclusive" discount excitement' },
                      { id: 'ultra_luxurious', title: 'Ultra-Luxurious & Prestige', desc: 'Flawless imperial luxury, status, and high-value appeal' },
                      { id: 'artisanal_heritage', title: 'Pure Heritage Craft Pride', desc: 'Deep reverence for traditional master Burmese artisans' },
                      { id: 'festive_joyous', title: 'Festive Season Celebration', desc: 'Warm joyful Thingyan / Thadingyut promotional spirit' }
                    ] : historicalTimeline === '1940s' ? [
                      { id: 'nostalgic_melancholic', title: 'Nostalgic & Melancholic', desc: 'Evocative longing for vintage Yangon eras' },
                      { id: 'poetic_heritage', title: 'Poetic & Literary Grace', desc: 'Intellectual elegance and quiet dignity' },
                      { id: 'vintage_romance', title: 'Vintage Romance', desc: 'Subtle classic romance and refined decorum' },
                      { id: 'monsoon_mood', title: 'Monsoon Rainy Yangon', desc: 'Atmospheric rain mist and poetic mood' }
                    ] : projectCategory === 'wedding' ? [
                      { id: 'joyous_celebratory', title: 'Joyous & Celebratory', desc: 'Radiant wedding bliss and family honor' },
                      { id: 'regal_majestic', title: 'Regal Court Wedding', desc: 'Stately dignity and sacred ritual reverence' },
                      { id: 'intimate_romantic', title: 'Intimate Romance', desc: 'Soft warmth, love and gentle gazes' },
                      { id: 'blessed_spiritual', title: 'Blessed & Auspicious', desc: 'Sanctified by tradition and Buddhist blessings' }
                    ] : [
                      { id: 'regal_majestic', title: 'Regal & Majestic', desc: 'Feudal royal nobility and courtly power' },
                      { id: 'serene_spiritual', title: 'Serene & Spiritual', desc: 'Peaceful Buddhist devotion and tranquil grace' },
                      { id: 'ancient_mysterious', title: 'Ancient & Timeless', desc: 'Echoes of forgotten millennia and stone stupas' },
                      { id: 'festive_joyous', title: 'Festive & Joyous', desc: 'Exuberant national celebration and rhythm' }
                    ]).map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onUpdateSelection({ moodEmotion: m.id as any })}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                          selection.moodEmotion === m.id
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{m.title}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  <MoodSelectionCarousel
                    language={language}
                    selection={selection}
                    onUpdateSelection={onUpdateSelection}
                  />
                </div>
              )}

              {/* STEP 8: TECHNICAL DETAILS */}
              {activeStepId === 'technical' && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block mb-2">
                      Optics & Camera Hardware Specification:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(historicalTimeline === '1940s' ? [
                        { id: 'vintage_large_format', title: 'Vintage Large Format Bellows', desc: 'Wood & brass view camera with authentic analog depth' },
                        { id: 'petzval_bokeh', title: 'Petzval 85mm Swirly Bokeh', desc: 'Historic lens producing circular swirly background bokeh' },
                        { id: 'kodak_trix_35mm', title: 'Kodak Tri-X 400 35mm Film', desc: 'Classic black & white film grain and authentic silver tonality' }
                      ] : projectCategory === 'product' ? [
                        { id: 'macro_100mm_prime', title: '100mm f/2.8 1:1 Macro Prime', desc: 'Zero distortion, maximum sharpness for gems and textiles' },
                        { id: 'focus_stacking', title: 'Focus Stacking Technique', desc: 'Edge-to-edge tack-sharp focal plane across complex crafts' },
                        { id: 'polarized_filter', title: 'Circular Polarizer (CPL)', desc: 'Eliminates glare while deepening rich lacquer & gold saturation' }
                      ] : [
                        { id: 'portrait_85mm_14', title: '85mm f/1.4 Prime Portrait Lens', desc: 'Dreamy background separation with tack-sharp eye focus' },
                        { id: 'hasselblad_h6d', title: 'Hasselblad 100MP Medium Format', desc: 'True-to-life skin micro-pores and handwoven silk threads' },
                        { id: 'anamorphic_35mm', title: '35mm Anamorphic Cinema Lens', desc: 'Oval bokeh, horizontal flares and widescreen epic presence' }
                      ]).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onUpdateSelection({ camera: opt.id as any })}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                            selection.camera === opt.id
                              ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{opt.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <CameraSelectionCarousel
                    language={language}
                    selection={selection}
                    onUpdateSelection={onUpdateSelection}
                  />

                  <div>
                    <span className="text-xs font-bold text-zinc-300 block mb-2">Aspect Ratio:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { ratio: '1:1', label: '1:1 Square (Product / IG)', desc: 'Best for crafts, gemstones & social posts' },
                        { ratio: '4:5', label: '4:5 Portrait (Studio / Mobile)', desc: 'Classic vertical editorial framing' },
                        { ratio: '16:9', label: '16:9 Cinematic (Widescreen)', desc: 'Epic temples & panoramic landscapes' },
                        { ratio: '9:16', label: '9:16 Vertical (Reels / TikTok)', desc: 'Full-screen mobile story orientation' }
                      ].map(r => (
                        <button
                          key={r.ratio}
                          type="button"
                          onClick={() => onUpdateSelection({ aspectRatio: r.ratio })}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                            selection.aspectRatio === r.ratio
                              ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-black text-sm text-emerald-400">{r.label}</div>
                          <div className="text-[11px] text-zinc-400 mt-1">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 🌟 5. STANDARDIZED SECTION BOX FOOTER */}
              <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Left: Previous Button */}
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={isFirstStep}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{isMyanmar ? '← ရှေ့အဆင့်' : '← Previous'}</span>
                </button>

                {/* Center: AI Enhance Section */}
                <button
                  type="button"
                  onClick={handleEnhanceCurrentSection}
                  disabled={isEnhancingSection}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isEnhancingSection ? 'animate-spin' : ''}`} />
                  <span>{isEnhancingSection ? 'Enhancing...' : '✨ AI Enhance Section'}</span>
                </button>

                {/* Right: Skip & Next Step */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isLastStep && (
                    <button
                      type="button"
                      onClick={goToNextStep}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition cursor-pointer"
                    >
                      {isMyanmar ? 'ကျော်မည် →' : 'Skip →'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black hover:brightness-110 active:scale-95 transition shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {isLastStep
                        ? (isMyanmar ? '⚡ Generate Prompt Now' : '⚡ Generate Prompt Now')
                        : (isMyanmar ? 'နောက်အဆင့်သို့ →' : 'Next Step →')}
                    </span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* 🌟 6. PERSISTENT FLOATING MINI SUMMARY BAR (Fixed at bottom during Steps 1 to 8) */}
      {!isSynthesizerViewActive && (
        <div className="fixed bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 z-40 max-w-7xl mx-auto">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#0c0f17]/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
            
            {/* Context & Completion Status */}
            <div className="flex items-center gap-2.5 text-xs shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-2 font-bold">
                <span className="text-emerald-300">
                  {projectCategory === 'product' ? '📦 Product' : projectCategory === 'wedding' ? '💍 Wedding' : projectCategory === 'custom' ? '✨ Custom' : '👤 Character'}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-teal-300">
                  {historicalTimeline === 'royal' ? '👑 Royal Era' : historicalTimeline === '1940s' ? '🕰️ 1940s Era' : '🏙️ Modern'}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  [{completedStepsCount}/8 Configured]
                </span>
              </div>
            </div>

            {/* Quick Active Selection Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-2xl">
              {selection.subject && selection.subject !== 'skip' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700 shrink-0">
                  <span>Subject: {selection.subject}</span>
                  <button type="button" onClick={() => onUpdateSelection({ subject: '' })} className="text-zinc-400 hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selection.customSubjectDetails && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-[11px] text-emerald-300 border border-emerald-500/50 shadow-sm shrink-0 max-w-[220px]">
                  <span className="font-bold text-emerald-400">Subject:</span>
                  <span className="truncate">{selection.customSubjectDetails}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSelection({ customSubjectDetails: '' });
                      setStep1CustomInput('');
                      setStep1EnhancedResult('');
                    }}
                    className="text-emerald-400/70 hover:text-white ml-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selection.location && selection.location !== 'skip' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700 shrink-0">
                  <span>Loc: {selection.location}</span>
                  <button type="button" onClick={() => onUpdateSelection({ location: '' })} className="text-zinc-400 hover:text-white ml-0.5">✕</button>
                </span>
              )}
              {selection.customLocationDetails && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-[11px] text-emerald-300 border border-emerald-500/50 shadow-sm shrink-0 max-w-[220px]">
                  <span className="font-bold text-emerald-400">Context:</span>
                  <span className="truncate">{selection.customLocationDetails}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSelection({ customLocationDetails: '' });
                      setStep2CustomInput('');
                      setStep2EnhancedResult('');
                    }}
                    className="text-emerald-400/70 hover:text-white ml-1"
                    title="Remove"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selection.timeAndLighting && selection.timeAndLighting !== 'skip' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700 shrink-0">
                  <span>Light: {selection.timeAndLighting}</span>
                  <button type="button" onClick={() => onUpdateSelection({ timeAndLighting: '' })} className="text-zinc-400 hover:text-white ml-0.5">✕</button>
                </span>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleGeneratePromptNow}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>{isMyanmar ? '⚡ Generate Prompt Now' : '⚡ Generate Prompt Now'}</span>
            </button>

          </div>
        </div>
      )}

      {/* 🌟 7. "START CREATING" 2-PHASE ONBOARDING MODAL */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSetupModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0e121a] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    2-Phase Project Setup
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">
                    {isMyanmar ? 'ပရောဂျက် အမျိုးအစားနှင့် သမိုင်းခေတ် သတ်မှတ်ချက်' : 'Configure Project Category & Historical Timeline'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Phase A: Project Category (4 Options + Custom Input) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">
                  Phase A: Select Project Category (4 Options)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'product', title: '📦 Product (Commercial & Craft)', desc: 'Burmese crafts, Mogok gems, lacquerware, Thanaka & silk', icon: '📦' },
                    { id: 'character', title: '👤 Character (Portrait & Ethnographic)', desc: '135 ethnic nationalities, royal archetypes & portraits', icon: '👤' },
                    { id: 'wedding', title: '💍 Wedding (Bridal & Couple)', desc: 'Traditional Burmese wedding (42 Templates) & bridal hair', icon: '💍' },
                    { id: 'custom', title: '✨ Custom (Freeform Concept)', desc: 'Freeform prompt with AI semantic auto-distribution', icon: '✨' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setProjectCategory(cat.id as any)}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        projectCategory === cat.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span>{cat.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1">{cat.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Concept Input when 'custom' is active */}
                {projectCategory === 'custom' && (
                  <div className="p-4 rounded-2xl bg-zinc-900/80 border border-emerald-500/30 space-y-2 mt-2">
                    <label className="block text-xs font-bold text-emerald-300">
                      ✨ Enter Your Custom Visual Concept (Instant AI Auto-Distributor):
                    </label>
                    <textarea
                      rows={2}
                      value={customConceptInput}
                      onChange={(e) => setCustomConceptInput(e.target.value)}
                      placeholder="e.g. A 1940s Burmese woman holding an oiled-paper umbrella on a rainy Yangon street"
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-zinc-500">Suggested:</span>
                      {[
                        'Ancient Bagan warrior on horseback in morning mist',
                        'Mogok pigeon blood ruby necklace on royal carved teak stand',
                        '1940s colonial Rangoon lady in French lace Yinzi with umbrella'
                      ].map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCustomConceptInput(s)}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Phase B: Context-Aware based on Category */}
              {projectCategory === 'product' ? (
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <span>{isMyanmar ? 'Phase B: ကြော်ငြာ ရည်ရွယ်ချက်နှင့် ခေါင်းစဉ် (Ad Campaign & Headline):' : 'Phase B: Select Commercial Ad Goal & Typography Headline:'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Product Mode</span>
                  </div>

                  {/* 1. Ad Campaign Goals */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {[
                      { id: 'promotion', label: '🏷️ Big Sale (50% OFF)', desc: 'Promotional discount banner' },
                      { id: 'launch', label: '✨ New Product Launch', desc: 'Product debut spotlight' },
                      { id: 'luxury', label: '👑 Luxury Brand', desc: 'High-end prestige campaign' },
                      { id: 'organic', label: '🌿 Pure Organic', desc: 'Natural & heritage craft' },
                      { id: 'seasonal', label: '🎉 Festive Special', desc: 'Holiday gift campaign' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setProductAdGoal(g.id as any)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                          productAdGoal === g.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{g.label}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{g.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* 2. Ad Headline Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300">
                      {isMyanmar ? 'ကြော်ငြာ Poster တွင် ထည့်သွင်းမည့် စာသား / ခေါင်းစဉ် (Ad Headline Copy):' : 'Promotional Headline Copy (for Ad Poster):'}
                    </label>
                    <input
                      type="text"
                      value={productHeadline}
                      onChange={(e) => setProductHeadline(e.target.value)}
                      placeholder="e.g. 50% OFF TODAY ONLY • LIMITED ROYAL EDITION • စစ်မှန်သော ရွှေဘိုသနပ်ခါး"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* 3. Product Timeline / Era Aesthetic */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-300">
                      {isMyanmar ? 'ကြော်ငြာ Poster ၏ ဒီဇိုင်း ဟန်ပန် (Aesthetic Era):' : 'Commercial Poster Aesthetic Era:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'royal', title: '👑 Royal Burmese Heritage', desc: 'Gilded gold leaf, carved teak & palace luxury' },
                        { id: '1940s', title: '🕰️ Vintage 1940s Lithograph', desc: 'Colonial Rangoon retro commercial ad style' },
                        { id: 'modern', title: '🏙️ Modern 3D Octane Studio', desc: 'Contemporary high-fashion commercial render' }
                      ].map(time => (
                        <button
                          key={time.id}
                          type="button"
                          onClick={() => setHistoricalTimeline(time.id as any)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                            historicalTimeline === time.id
                              ? 'bg-teal-500/20 border-teal-400 text-white font-bold'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div className="text-xs font-bold">{time.title}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{time.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : projectCategory === 'wedding' ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300 block">
                    Phase B: Select Wedding Ceremony Style & Era (မင်္ဂလာပွဲတော် အခမ်းအနား)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'royal', title: '👑 Royal Court Bridal Ceremony', mm: 'နန်းတွင်း မင်္ဂလာ', desc: 'Konbaung Maha Lata gold regalia & sacred shrine' },
                      { id: '1940s', title: '🕰️ Vintage 1940s Heritage Studio', mm: '၁၉၄၀ ခေတ်ဟောင်း မင်္ဂလာ', desc: 'Colonial Rangoon lace Yinzi & heirloom veil' },
                      { id: 'modern', title: '🏙️ Modern Grand Ballroom Luxury', mm: 'ခေတ်မီ ခမ်းနားသော မင်္ဂလာ', desc: 'Contemporary bespoke Acheik & crystal chandeliers' }
                    ].map(time => (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => setHistoricalTimeline(time.id as any)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          historicalTimeline === time.id
                            ? 'bg-teal-500/15 border-teal-400 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{time.title}</div>
                        <div className="text-[10px] text-teal-400 mt-0.5">{time.mm}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{time.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : projectCategory === 'character' ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300 block">
                    Phase B: Select Character Historical Timeline (ဇာတ်ကောင် သမိုင်းခေတ် ၃ မျိုး)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'royal', title: '👑 Royal Dynasty Era', mm: 'နန်းတွင်းခေတ်', desc: 'Bagan, Inwa & Konbaung royal court grandeur' },
                      { id: '1940s', title: '🕰️ Mid-Century 1940s Era', mm: 'အလယ်ခေတ် ၁၉၄၀', desc: 'Colonial Rangoon, vintage lace & silver gelatin' },
                      { id: 'modern', title: '🏙️ Modern / Contemporary', mm: 'မျက်မှောက်ခေတ်', desc: 'Contemporary high fashion, skyline & studio 8k' }
                    ].map(time => (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => setHistoricalTimeline(time.id as any)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          historicalTimeline === time.id
                            ? 'bg-teal-500/15 border-teal-400 text-white shadow-md'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{time.title}</div>
                        <div className="text-[10px] text-teal-400 mt-0.5">{time.mm}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{time.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Action Button */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLaunchSuite}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black hover:brightness-110 active:scale-95 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Launch 8-Step Suite →</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
