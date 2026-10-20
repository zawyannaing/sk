import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface ProfessionalStudioWorkstationProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
  onNavigateView?: (view: any, photoUrl?: string) => void;
  initialPhoto?: string;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
    }
  ) => void;
}

type WorkstationTab = 'lighting' | 'split-compare' | 'color-grading' | 'exif-lab';

interface LightSource {
  id: 'key' | 'fill' | 'rim' | 'background';
  label: string;
  angle: number; // 0 to 360 degrees
  distance: number; // 50 to 120 px
  power: number; // 1 to 10
  colorTemp: number; // 2800K to 6500K
  modifier:
    | 'octabox-120'
    | 'beauty-dish'
    | 'parabolic-umbrella'
    | 'honeycomb-grid'
    | 'bare-bulb'
    | 'stripbox-grid'
    | 'fresnel-spot'
    | 'ring-light'
    | 'snoot-grid';
  active: boolean;
  color: string;
}

export const ProfessionalStudioWorkstation: React.FC<ProfessionalStudioWorkstationProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6',
  onNavigateView,
  initialPhoto,
  onSendToPhotoStudio
}) => {
  const isMm = language === 'my';
  const [activeTab, setActiveTab] = useState<WorkstationTab>('lighting');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);
  const [showSimulatedFaceOverlay, setShowSimulatedFaceOverlay] = useState<boolean>(true);
  const [showCatchlights, setShowCatchlights] = useState<boolean>(true);

  // Active portrait photo (no default photo - relies on user drop & upload)
  const [activePhoto, setActivePhoto] = useState<string>(initialPhoto || '');
  const [retouchedPhoto, setRetouchedPhoto] = useState<string>(initialPhoto || '');
  const [isDragOverLighting, setIsDragOverLighting] = useState<boolean>(false);
  const [isDragOverSplit, setIsDragOverSplit] = useState<boolean>(false);
  const [isDragOverGrading, setIsDragOverGrading] = useState<boolean>(false);

  // FEATURE 1: 3-POINT STUDIO LIGHTING RIG
  const [lights, setLights] = useState<LightSource[]>([
    {
      id: 'key',
      label: 'Key Light (Primary)',
      angle: 45, // 45 deg Rembrandt
      distance: 85,
      power: 8.5,
      colorTemp: 5200,
      modifier: 'octabox-120',
      active: true,
      color: '#ffd02f'
    },
    {
      id: 'fill',
      label: 'Fill Light (Shadow Softener)',
      angle: 315, // opposite
      distance: 95,
      power: 4.2,
      colorTemp: 5400,
      modifier: 'parabolic-umbrella',
      active: true,
      color: '#5cd2e6'
    },
    {
      id: 'rim',
      label: 'Kicker / Rim Light (Edge Separation)',
      angle: 135, // backlight
      distance: 105,
      power: 6.8,
      colorTemp: 2800, // warm golden edge
      modifier: 'honeycomb-grid',
      active: true,
      color: '#ff9233'
    },
    {
      id: 'background',
      label: 'Background Spot',
      angle: 180,
      distance: 110,
      power: 3.5,
      colorTemp: 4500,
      modifier: 'honeycomb-grid',
      active: false,
      color: '#a78bfa'
    }
  ]);
  const [selectedLightId, setSelectedLightId] = useState<'key' | 'fill' | 'rim' | 'background'>('key');
  const [isDraggingLight, setIsDraggingLight] = useState<boolean>(false);
  const diagramRef = useRef<SVGSVGElement>(null);

  // FEATURE 2: BEFORE / AFTER SPLIT SLIDER
  const [splitPos, setSplitPos] = useState<number>(50); // 0% to 100%
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [showLoupe, setShowLoupe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // FEATURE 3: 3-WAY COLOR GRADING & FILM EMULSION
  const [shadowsHue, setShadowsHue] = useState<number>(220); // cool shadows
  const [shadowsSat, setShadowsSat] = useState<number>(15);
  const [midtonesHue, setMidtonesHue] = useState<number>(45); // warm golden skin
  const [midtonesSat, setMidtonesSat] = useState<number>(25);
  const [highlightsHue, setHighlightsHue] = useState<number>(35); // subtle ivory highlights
  const [highlightsSat, setHighlightsSat] = useState<number>(12);
  const [colorTempKelvin, setColorTempKelvin] = useState<number>(5200);
  const [filmEmulsion, setFilmEmulsion] = useState<string>('hasselblad-hncs'); // kodak-portra-400, fuji-pro-400h, hasselblad-hncs, leica-monochrom



  // FEATURE 5: EXIF & LAB PRINT SPECS
  const [printBleed, setPrintBleed] = useState<number>(3); // 3mm bleed
  const [printDpi, setPrintDpi] = useState<number>(300);
  const [paperStock, setPaperStock] = useState<string>('fuji-crystal-archive-silk');

  // 🌟 WORKSTATION PRO SUITE CONTROLS
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('4:5');
  const [selectedFocalLength, setSelectedFocalLength] = useState<string>('85mm');
  const [selectedCameraBody, setSelectedCameraBody] = useState<string>('hasselblad-x2d');

  // Split Viewport Retouch Mode & Orientation
  const [splitOrientation, setSplitOrientation] = useState<'vertical' | 'horizontal' | 'side-by-side'>('vertical');
  const [retouchPresetMode, setRetouchPresetMode] = useState<'balanced' | 'freq-sep' | 'dodge-burn' | 'gold-lustre' | 'thanaka-enhanced'>('balanced');

  // Color Grading Enhancements
  const [colorGradeContrast, setColorGradeContrast] = useState<number>(105);
  const [colorGradeSaturation, setColorGradeSaturation] = useState<number>(102);
  const [filmGrainAmount, setFilmGrainAmount] = useState<number>(16);
  const [activeColorLook, setActiveColorLook] = useState<string>('mandalay-gold');



  // EXIF Lab Target & ICC Profile
  const [printSizeTarget, setPrintSizeTarget] = useState<'a2-museum' | 'canvas-24x36' | 'album-12x18'>('a2-museum');
  const [colorProfileIcc, setColorProfileIcc] = useState<string>('prophoto-rgb');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPhoto && initialPhoto.trim()) {
      setActivePhoto(initialPhoto);
      setRetouchedPhoto(initialPhoto);
    }
  }, [initialPhoto]);

  const handlePhotoUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(isMm ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (JPG, PNG, WEBP) ရွေးချယ်ပါ' : 'Please select an image file (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setActivePhoto(url);
      setRetouchedPhoto(url);
      showToast(isMm ? 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ' : 'Photo loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  // Dragging split slider
  const handleSplitMouseMove = (e: React.MouseEvent) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    if (isDraggingSplit) {
      setSplitPos(splitOrientation === 'horizontal' ? percentY : percentX);
    }
    setLoupePos({
      x: Math.max(0, Math.min(100, (x / rect.width) * 100)),
      y: Math.max(0, Math.min(100, (y / rect.height) * 100))
    });
  };

  // Lighting diagram interaction
  const handleDiagramClickOrDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!diagramRef.current) return;
    const rect = diagramRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - cx;
    const dy = mouseY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    const dist = Math.min(125, Math.max(45, Math.hypot(dx, dy)));

    setLights((prev) =>
      prev.map((l) =>
        l.id === selectedLightId ? { ...l, angle: Math.round(deg), distance: Math.round(dist) } : l
      )
    );
  };

  // Synthesized Professional Studio Prompt based on all 5 Studio Modules
  const synthesizedProStudioPrompt = React.useMemo(() => {
    const activeKey = lights.find((l) => l.id === 'key');
    const activeFill = lights.find((l) => l.id === 'fill');
    const activeRim = lights.find((l) => l.id === 'rim');

    const cameraName =
      selectedCameraBody === 'hasselblad-x2d'
        ? 'Hasselblad X2D 100C medium format (100MP BSI CMOS)'
        : selectedCameraBody === 'fuji-gfx100'
        ? 'Fujifilm GFX 100 II large format (102MP High Speed CMOS)'
        : 'Sony A7R V full-frame (61MP Exmor R)';

    const lightingSpecs = `Studio lighting setup: ${activeKey?.modifier.replace(/-/g, ' ')} key light at ${activeKey?.angle}° (power ${activeKey?.power}/10, ${activeKey?.colorTemp}K), fill ${activeFill?.modifier.replace(/-/g, ' ')} at ${activeFill?.angle}° (power ${activeFill?.power}/10), razor-sharp ${activeRim?.colorTemp}K golden rim kicker at ${activeRim?.angle}°, true physical contact floor shadows`;

    const colorGradingSpecs = `Color profile: ${filmEmulsion.replace(/-/g, ' ')}, ${colorTempKelvin}K white balance, golden olive Burmese skin tones with natural subsurface scattering, zero oversaturation`;

    const cameraSpecs = `Camera: ${cameraName}, ${selectedFocalLength} f/1.4 portrait prime lens, ISO 64, 1/250s leaf shutter, 16-bit ${colorProfileIcc.replace(/-/g, ' ').toUpperCase()}, 300 DPI museum lab resolution`;

    const subjectSpecs = `Master studio editorial fine art portrait: authentic Burmese noble subject in handwoven Acheik silk Lun Taya, genuine Thanaka bark micro-texture with natural epidermal pores, iris catchlights reflecting studio octabox, prestigious royal court dignity`;

    return `${subjectSpecs}. ${lightingSpecs}. ${colorGradingSpecs}. ${cameraSpecs} --ar ${selectedAspectRatio} --style raw --v 6.1`;
  }, [lights, filmEmulsion, colorTempKelvin, selectedAspectRatio, selectedFocalLength, selectedCameraBody, colorProfileIcc]);

  // 8 One-Click Studio Presets
  const studioLightingPresets = [
    {
      id: 'rembrandt',
      nameEn: 'Rembrandt 45° (Classic Triangle)',
      nameMm: 'ရမ်းဘရန့် ၄၅° (အနုပညာ အလင်းအမှောင်)',
      keyAngle: 45,
      keyPower: 8.5,
      keyModifier: 'octabox-120' as const,
      fillAngle: 315,
      fillPower: 3.8,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 135,
      rimPower: 6.5,
      rimModifier: 'honeycomb-grid' as const,
      descriptionEn: 'Painterly triangle highlight under shadow eye with dramatic depth',
      descriptionMm: 'အရိပ်ကျသော ပါးပြင်ပေါ်တွင် တြိဂံပုံ အလင်းကွက် ထင်စေသော စတိုင်'
    },
    {
      id: 'butterfly',
      nameEn: 'Butterfly / Glamour (Paramount)',
      nameMm: 'လိပ်ပြာစတိုင် (ဂလင်းမား အလှဓာတ်ပုံ)',
      keyAngle: 180,
      keyPower: 9.0,
      keyModifier: 'beauty-dish' as const,
      fillAngle: 180,
      fillPower: 3.0,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 0,
      rimPower: 5.5,
      rimModifier: 'stripbox-grid' as const,
      descriptionEn: 'High frontal angle creating symmetrical butterfly shadow under nose',
      descriptionMm: 'နှာခေါင်းအောက်တွင် လိပ်ပြာပုံစံ ညီညာသော အရိပ်ကျစေသော စတိုင်'
    },
    {
      id: 'clamshell',
      nameEn: 'Clamshell Beauty (Dual Strobe)',
      nameMm: 'ကလမ်ရှဲလ် ဘြူတီ (မိတ်ကပ် & အလှသီးသန့်)',
      keyAngle: 180,
      keyPower: 8.8,
      keyModifier: 'beauty-dish' as const,
      fillAngle: 180,
      fillPower: 6.5,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 140,
      rimPower: 4.5,
      rimModifier: 'stripbox-grid' as const,
      descriptionEn: 'Dual top & bottom lighting eliminating chin shadows for flawless cosmetic perfection',
      descriptionMm: 'အထက်အောက် အလင်းစုံဖြင့် မေးစေ့အောက် အရိပ်လုံးဝမကျစေဘဲ မျက်နှာပြင် အပြစ်ကင်းစင်စေသည်'
    },
    {
      id: 'split',
      nameEn: 'Split Dramatic 90° (Film Noir)',
      nameMm: '၉၀° နှစ်ခြမ်းခွဲ အလင်း (ဒရမ်မာ ဖလင်နွား)',
      keyAngle: 90,
      keyPower: 9.2,
      keyModifier: 'stripbox-grid' as const,
      fillAngle: 270,
      fillPower: 1.2,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 160,
      rimPower: 7.5,
      rimModifier: 'honeycomb-grid' as const,
      descriptionEn: 'Divides face exactly in half, creating deep mystery and cinematic gravity',
      descriptionMm: 'မျက်နှာကို တစ်ခြမ်းလင်း တစ်ခြမ်းမှောင် အတိအကျ ခွဲထုတ်ကာ ရုပ်ရှင်ဆန်သော ဆွဲဆောင်မှု ဖန်တီးသည်'
    },
    {
      id: 'loop',
      nameEn: 'Loop Flattering (Commercial)',
      nameMm: 'လု(ပ်) စတိုင် (မျက်နှာသွယ် ပုံတူအလင်း)',
      keyAngle: 30,
      keyPower: 8.0,
      keyModifier: 'octabox-120' as const,
      fillAngle: 330,
      fillPower: 4.5,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 120,
      rimPower: 6.0,
      rimModifier: 'stripbox-grid' as const,
      descriptionEn: 'Universal flattering setup; small loop shadow pointing toward corner of mouth',
      descriptionMm: 'မျက်နှာသွင်ပြင်အားလုံးနှင့် လိုက်ဖက်ပြီး နှုတ်ခမ်းထောင့်သို့ ညွှန်ပြသော အရိပ်ငယ် ဖန်တီးသည်'
    },
    {
      id: 'bagan-sun',
      nameEn: 'Golden Hour Rim (Bagan Sun)',
      nameMm: 'ပုဂံနေဝင်ရီ ရွှေရောင်အနားသတ် (Golden Rim)',
      keyAngle: 50,
      keyPower: 7.2,
      keyModifier: 'octabox-120' as const,
      fillAngle: 310,
      fillPower: 4.0,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 180,
      rimPower: 9.8,
      rimModifier: 'fresnel-spot' as const,
      descriptionEn: 'Intense 2800K warm rim kicker separating hair & shoulders like authentic Myanmar golden sunset',
      descriptionMm: 'ဆံနွယ်နှင့် ပခုံးအစွန်းများကို ၂၈၀၀ ကယ်လ်ဗင် ရွှေရောင်အနားသတ် ထင်ရှားစွာ ထွင်းဖောက်ပေးသည်'
    },
    {
      id: 'high-key',
      nameEn: 'High-Key Commercial (Clean Bright)',
      nameMm: 'ဟိုက်ကီး အလင်းပြည့် (အဖြူစင် စီးပွားရေး)',
      keyAngle: 45,
      keyPower: 9.0,
      keyModifier: 'octabox-120' as const,
      fillAngle: 315,
      fillPower: 8.0,
      fillModifier: 'parabolic-umbrella' as const,
      rimAngle: 135,
      rimPower: 5.0,
      rimModifier: 'stripbox-grid' as const,
      descriptionEn: 'Virtually shadowless bright setup for fashion catalogs, cheerful moods, pristine clarity',
      descriptionMm: 'အရိပ်နည်းပါးပြီး တောက်ပရှင်းလင်းသော ဖက်ရှင်နှင့် စီးပွားရေး စတူဒီယို အလင်း'
    },
    {
      id: 'low-key',
      nameEn: 'Low-Key Moody (Chiaroscuro Master)',
      nameMm: 'လိုကီး အမှောင်နက် (ပြတိုက်လက်ရာ အနုပညာ)',
      keyAngle: 105,
      keyPower: 9.5,
      keyModifier: 'fresnel-spot' as const,
      fillAngle: 270,
      fillPower: 1.0,
      fillModifier: 'snoot-grid' as const,
      rimAngle: 160,
      rimPower: 8.8,
      rimModifier: 'honeycomb-grid' as const,
      descriptionEn: 'Predominantly dark background with razor-sharp sculpted highlights carving facial features',
      descriptionMm: 'နက်မှောင်သော နောက်ခံတွင် မျက်နှာသွင်ပြင်ကို ထွင်းဖောက်ထုဆစ်ထားသော အနုပညာလက်ရာ'
    }
  ];

  const handleApplyPreset = (preset: typeof studioLightingPresets[0]) => {
    setLights((prev) =>
      prev.map((l) => {
        if (l.id === 'key') {
          return { ...l, angle: preset.keyAngle, power: preset.keyPower, modifier: preset.keyModifier, active: true };
        }
        if (l.id === 'fill') {
          return { ...l, angle: preset.fillAngle, power: preset.fillPower, modifier: preset.fillModifier, active: true };
        }
        if (l.id === 'rim') {
          return { ...l, angle: preset.rimAngle, power: preset.rimPower, modifier: preset.rimModifier, active: true };
        }
        return l;
      })
    );
    showToast(isMm ? `${preset.nameMm} အလင်းပုံစံ သတ်မှတ်လိုက်ပါပြီ` : `Applied: ${preset.nameEn}`);
  };

  // Active Light references
  const activeKeyLight = lights.find((l) => l.id === 'key') || lights[0];
  const activeFillLight = lights.find((l) => l.id === 'fill') || lights[1];
  const activeRimLight = lights.find((l) => l.id === 'rim') || lights[2];

  // Mathematical Key-to-Fill Contrast Ratio calculation
  const contrastRatioValue =
    activeKeyLight && activeFillLight && activeFillLight.active && activeFillLight.power > 0
      ? activeKeyLight.power / activeFillLight.power
      : 8.0;
  const contrastRatioFormatted = `${contrastRatioValue.toFixed(1)}:1`;

  const getRatioEvaluation = (ratio: number) => {
    if (ratio < 1.6) {
      return {
        titleEn: '1:1 to 1.5:1 High-Key Commercial (Flat)',
        titleMm: '၁:၁ မှ ၁.၅:၁ အလင်းပြန့် စီးပွားရေး (အရိပ်နည်း)',
        color: '#00b473',
        badge: 'FLAT / HIGH-KEY'
      };
    }
    if (ratio < 3.2) {
      return {
        titleEn: '2:1 to 3:1 Soft Flattering Portrait',
        titleMm: '၂:၁ မှ ၃:၁ နူးညံ့လှပသော ပုံတူအလင်း',
        color: '#5cd2e6',
        badge: 'SOFT BEAUTY'
      };
    }
    if (ratio < 5.8) {
      return {
        titleEn: '4:1 Classic Rembrandt / Fine Art',
        titleMm: '၄:၁ ရမ်းဘရန့် အနုပညာ အလင်းအမှောင်',
        color: '#ffd02f',
        badge: 'EDITORIAL REMBRANDT'
      };
    }
    return {
      titleEn: '8:1+ Dramatic Film Noir / Chiaroscuro',
      titleMm: '၈:၁+ ဒရမ်မာဆန်သော အရိပ်နက် ဖလင်နွား',
      color: '#ff5c5c',
      badge: 'DRAMATIC NOIR'
    };
  };

  const ratioEval = getRatioEvaluation(contrastRatioValue);

  // Live Shading Simulator Coordinates on Model Face
  const keyRad = (((activeKeyLight.angle) - 90) * Math.PI) / 180;
  const keyHighlightX = Math.max(15, Math.min(85, Math.round(50 + Math.cos(keyRad) * 36)));
  const keyHighlightY = Math.max(15, Math.min(85, Math.round(50 + Math.sin(keyRad) * 32)));
  const keyPower = activeKeyLight.power;
  const keyTemp = activeKeyLight.colorTemp;
  const keyRgba = keyTemp < 3800 ? '255, 190, 110' : keyTemp > 5600 ? '195, 225, 255' : '255, 250, 240';

  const fillRad = (((activeFillLight.angle) - 90) * Math.PI) / 180;
  const fillX = Math.max(15, Math.min(85, Math.round(50 + Math.cos(fillRad) * 32)));
  const fillY = Math.max(15, Math.min(85, Math.round(50 + Math.sin(fillRad) * 28)));
  const fillPower = activeFillLight.active ? activeFillLight.power : 0;

  const rimRad = (((activeRimLight.angle) - 90) * Math.PI) / 180;
  const rimGlowX = Math.round(Math.cos(rimRad) * 14);
  const rimGlowY = Math.round(Math.sin(rimRad) * 14);
  const rimTemp = activeRimLight.colorTemp;
  const rimColor = rimTemp < 3500 ? 'rgba(255, 170, 50, 0.75)' : 'rgba(175, 220, 255, 0.7)';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(synthesizedProStudioPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast(isMm ? 'Professional Studio Prompt ကူးယူပြီးပါပြီ!' : 'Pro Studio Master Prompt copied!');
  };



  return (
    <div className="min-h-screen bg-[#090c13] text-[#f0f3f8] px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 select-none font-sans">
      
      {/* Toast Alert */}
      {quickToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#ffd02f] text-[#090c13] font-sans text-xs font-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-[#fcb900]">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{quickToast}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handlePhotoUpload(file);
          }
          e.target.value = '';
        }}
        accept="image/*"
        className="hidden"
      />

      {/* 🌟 1. PROFESSIONAL WORKSTATION TOP BAR */}
      <div className="bg-[#0f1420] border border-[#1e273a] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#ffd02f] text-[#090c13] flex items-center justify-center font-bold text-xl shadow-md border border-[#fcb900]/40 shrink-0">
            <span className="material-symbols-outlined text-[24px]">wb_iridescent</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#ffd02f] font-black uppercase tracking-wider">
                COMMERCIAL PHOTOGRAPHY WORKSTATION
              </span>
              <span className="bg-[#1b2334] text-[#8e9cb5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2b3750]">
                Capture One & Lightroom Spec
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-tight">
              {isMm ? 'ပရော်ဖက်ရှင်နယ် စတူဒီယို အလုပ်ခွင် (Pro Studio Suite)' : 'Professional Studio Master Workstation'}
            </h1>
          </div>
        </div>

        {/* Studio Specs Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Camera Body Switcher */}
          <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-xl border border-[#1e273a] text-xs font-mono">
            <span className="text-[10px] text-[#6b7794] px-1.5 uppercase font-bold">BODY:</span>
            {[
              { id: 'hasselblad-x2d', label: 'Hasselblad 100C' },
              { id: 'fuji-gfx100', label: 'GFX 100 II' },
              { id: 'sony-a7rv', label: 'Sony A7R V' }
            ].map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => {
                  setSelectedCameraBody(cam.id);
                  showToast(`Active body: ${cam.label}`);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedCameraBody === cam.id
                    ? 'bg-[#1b2334] text-[#ffd02f] border border-[#ffd02f]/40 shadow-xs'
                    : 'text-[#8e9cb5] hover:text-white'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>

          {/* Focal Length Switcher */}
          <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-xl border border-[#1e273a] text-xs font-mono">
            <span className="text-[10px] text-[#6b7794] px-1.5 uppercase font-bold">LENS:</span>
            {['50mm', '85mm', '105mm', '135mm'].map((focal) => (
              <button
                key={focal}
                type="button"
                onClick={() => {
                  setSelectedFocalLength(focal);
                  showToast(`Selected lens: ${focal} f/1.4`);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedFocalLength === focal
                    ? 'bg-[#1b2334] text-white border border-[#ffd02f]/40'
                    : 'text-[#8e9cb5] hover:text-white'
                }`}
              >
                {focal}
              </button>
            ))}
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#090c13] p-1 rounded-xl border border-[#1e273a] text-xs font-mono">
            <span className="text-[10px] text-[#6b7794] px-1.5 uppercase font-bold">RATIO:</span>
            {['4:5', '1:1', '16:9', '3:2'].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => {
                  setSelectedAspectRatio(ratio);
                  showToast(`Aspect ratio: ${ratio}`);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  selectedAspectRatio === ratio
                    ? 'bg-[#ffd02f] text-black font-black'
                    : 'text-[#8e9cb5] hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] text-xs font-black transition-all cursor-pointer shadow-md hover:scale-102"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Load Shot</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. PRECISION WORKSTATION TABS (4 MODULE SUITE) */}
      <div className="bg-[#0f1420] border border-[#1e273a] p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto shadow-md">
        {[
          { id: 'lighting' as WorkstationTab, icon: 'wb_incandescent', labelEn: '1. Studio Lighting Rig Diagram', labelMm: '၁။ အလင်းဇယား (Lighting Diagram)' },
          { id: 'split-compare' as WorkstationTab, icon: 'compare', labelEn: '2. Before/After Split Viewport', labelMm: '၂။ ပုံယှဉ်ကြည့်စနစ် (Split Compare)' },
          { id: 'color-grading' as WorkstationTab, icon: 'palette', labelEn: '3. 3-Way Color Grading Wheels', labelMm: '၃။ အရောင်ဘီးများ (Color Wheels)' },
          { id: 'exif-lab' as WorkstationTab, icon: 'print', labelEn: '4. EXIF Metadata & 300 DPI Lab', labelMm: '၄။ EXIF & 300 DPI Lab Print' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1b2334] text-white border border-[#ffd02f]/40 shadow-xs'
                  : 'text-[#8e9cb5] hover:text-white hover:bg-[#141b2a]'
              }`}
            >
              <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-[#ffd02f]' : 'text-[#6b7794]'}`}>
                {tab.icon}
              </span>
              <span>{isMm ? tab.labelMm : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 🌟 3. MAIN WORKBENCH VIEWPORT ACCORDING TO SELECTED TAB */}
      
      {/* ======================================================== */}
      {/* TAB 1: 3-POINT STUDIO LIGHTING RIG DIAGRAM               */}
      {/* ======================================================== */}
      {activeTab === 'lighting' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* 1. Overhead Lighting Simulator Canvas & Presets (4 Cols) */}
          <div className="xl:col-span-4 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">radar</span>
                <h3 className="font-serif text-base sm:text-lg font-normal text-white">
                  {isMm ? 'စတူဒီယို အပေါ်စီး အလင်းဇယား' : 'Studio Overhead Floor Plan'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8e9cb5] bg-[#141b2a] px-2 py-0.5 rounded border border-[#232f47]">
                Drag to Move
              </span>
            </div>

            {/* Interactive SVG Studio Map */}
            <div className="relative bg-[#080b12] rounded-2xl border border-[#1b2334] aspect-square flex items-center justify-center overflow-hidden">
              <svg
                ref={diagramRef}
                viewBox="0 0 300 300"
                className="w-full h-full cursor-crosshair select-none"
                onMouseDown={() => setIsDraggingLight(true)}
                onMouseUp={() => setIsDraggingLight(false)}
                onMouseMove={(e) => {
                  if (isDraggingLight) handleDiagramClickOrDrag(e);
                }}
                onClick={handleDiagramClickOrDrag}
              >
                {/* Concentric distance rings */}
                <circle cx="150" cy="150" r="120" fill="none" stroke="#161e2e" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="150" cy="150" r="85" fill="none" stroke="#1c263a" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx="150" cy="150" r="50" fill="none" stroke="#25324d" strokeWidth="1" />

                {/* 8-Axis Angle Grid */}
                <line x1="150" y1="20" x2="150" y2="280" stroke="#161e2e" strokeWidth="1" />
                <line x1="20" y1="150" x2="280" y2="150" stroke="#161e2e" strokeWidth="1" />
                <line x1="58" y1="58" x2="242" y2="242" stroke="#161e2e" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="58" y1="242" x2="242" y2="58" stroke="#161e2e" strokeWidth="1" strokeDasharray="2 2" />

                {/* Studio Infinity Cyclorama Backdrop */}
                <path d="M 40 40 Q 150 15 260 40" fill="none" stroke="#3b4866" strokeWidth="4" />
                <text x="150" y="32" fill="#6b7794" fontSize="8" textAnchor="middle" fontFamily="monospace">
                  CYCLORAMA WALL
                </text>

                {/* Center Subject (Model) */}
                <g transform="translate(150, 150)">
                  <circle r="18" fill="#ffd02f" fillOpacity="0.2" stroke="#ffd02f" strokeWidth="2" />
                  <circle r="6" fill="#ffd02f" />
                  {/* Nose / Facing Indicator (Facing South / 180° towards camera) */}
                  <polygon points="0,18 -4,12 4,12" fill="#ffd02f" />
                  <text y="-22" fill="#ffd02f" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                    SUBJECT
                  </text>
                </g>

                {/* Camera Rig at Bottom */}
                <g transform="translate(150, 275)">
                  <rect x="-16" y="-8" width="32" height="16" rx="4" fill="#1b2334" stroke="#4262ff" strokeWidth="1.5" />
                  <polygon points="0,-8 -6,0 6,0" fill="#4262ff" />
                  <text y="16" fill="#8e9cb5" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    HASSELBLAD
                  </text>
                </g>

                {/* Render Light Sources */}
                {lights.map((l) => {
                  if (!l.active) return null;
                  const rad = ((l.angle - 90) * Math.PI) / 180;
                  const lx = 150 + Math.cos(rad) * l.distance;
                  const ly = 150 + Math.sin(rad) * l.distance;
                  const isSelected = selectedLightId === l.id;

                  return (
                    <g key={l.id} className="cursor-pointer">
                      {/* Ray line casting towards subject */}
                      <line
                        x1={lx}
                        y1={ly}
                        x2="150"
                        y2="150"
                        stroke={l.color}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={isSelected ? undefined : '3 3'}
                        strokeOpacity="0.7"
                      />

                      {/* Light cone beam */}
                      <polygon
                        points={`${lx},${ly} ${150 + Math.cos(rad + 0.3) * 30},${150 + Math.sin(rad + 0.3) * 30} ${150 + Math.cos(rad - 0.3) * 30},${150 + Math.sin(rad - 0.3) * 30}`}
                        fill={l.color}
                        fillOpacity="0.12"
                      />

                      {/* Light Head Body */}
                      <circle
                        cx={lx}
                        cy={ly}
                        r={isSelected ? 14 : 11}
                        fill="#090c13"
                        stroke={l.color}
                        strokeWidth={isSelected ? 3 : 2}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLightId(l.id);
                        }}
                      />
                      <circle cx={lx} cy={ly} r="4" fill={l.color} />

                      {/* Angle & Label */}
                      <text
                        x={lx}
                        y={ly > 150 ? ly + 20 : ly - 14}
                        fill={l.color}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {l.id.toUpperCase()} ({l.angle}°)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Contrast Ratio HUD Meter */}
            <div className="bg-[#090c13] rounded-2xl p-3.5 border border-[#1e273a] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8e9cb5] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">exposure</span>
                  {isMm ? 'အလင်း/အရိပ် တွက်ချက်မှု (Contrast Ratio)' : 'Lighting Contrast Ratio'}
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${ratioEval.color}22`, color: ratioEval.color, border: `1px solid ${ratioEval.color}44` }}
                >
                  {ratioEval.badge}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-white">{contrastRatioFormatted}</span>
                  <span className="text-xs font-mono text-[#8e9cb5]">Key : Fill</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: ratioEval.color }}>
                  {isMm ? ratioEval.titleMm : ratioEval.titleEn}
                </span>
              </div>

              {/* Balance bar */}
              <div className="w-full h-2 bg-[#1b2334] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#ffd02f] transition-all duration-300"
                  style={{ width: `${Math.min(90, Math.max(10, (activeKeyLight.power / (activeKeyLight.power + (activeFillLight.active ? activeFillLight.power : 0.5))) * 100))}%` }}
                />
                <div
                  className="h-full bg-[#5cd2e6] transition-all duration-300"
                  style={{ width: `${Math.min(90, Math.max(10, ((activeFillLight.active ? activeFillLight.power : 0.5) / (activeKeyLight.power + (activeFillLight.active ? activeFillLight.power : 0.5))) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
                <span>Key Light {activeKeyLight.power} EV</span>
                <span>Fill Light {activeFillLight.active ? `${activeFillLight.power} EV` : 'OFF'}</span>
              </div>
            </div>

            {/* 8 Studio Presets Grid */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-[#8e9cb5] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">auto_awesome</span>
                  {isMm ? 'စတူဒီယို အလင်းပုံစံများ (8 Studio Presets)' : 'Studio Lighting Presets (8 Styles)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {studioLightingPresets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="bg-[#141b2a] hover:bg-[#1e273a] border border-[#232f47] hover:border-[#ffd02f]/40 text-left p-2 rounded-xl cursor-pointer transition-all flex flex-col gap-0.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-white group-hover:text-[#ffd02f] transition-colors truncate">
                        {isMm ? p.nameMm.split('(')[0] : p.nameEn.split('(')[0]}
                      </span>
                      <span className="text-[9px] font-mono text-[#8e9cb5] bg-[#090c13] px-1 rounded">
                        {p.keyAngle}°
                      </span>
                    </div>
                    <span className="text-[9px] font-sans text-[#8e9cb5] line-clamp-1">
                      {isMm ? p.descriptionMm : p.descriptionEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Live Dynamic Model Portrait Lighting & Shadow Simulator (4 Cols) */}
          <div className="xl:col-span-4 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#00b473]">face</span>
                <h3 className="font-serif text-base sm:text-lg font-normal text-white">
                  {isMm ? 'မျက်နှာ အလင်း/အရိပ် တိုက်ရိုက် သရုပ်ဖော်မှု' : 'Live Face Lighting & Shadow Simulator'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#00b473] bg-[#00b473]/10 px-2 py-0.5 rounded-full border border-[#00b473]/30">
                PHYSICS SIM
              </span>
            </div>

            {/* Portrait Canvas Viewport with Dynamic Gradient Shading & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOverLighting(true); }}
              onDragLeave={() => setIsDragOverLighting(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverLighting(false);
                if (e.dataTransfer.files?.[0]) handlePhotoUpload(e.dataTransfer.files[0]);
              }}
              className={`relative bg-[#080b12] rounded-2xl border aspect-4/5 flex items-center justify-center overflow-hidden group shadow-inner transition-all ${
                isDragOverLighting ? 'border-[#ffd02f] bg-[#ffd02f]/10' : 'border-[#1b2334]'
              }`}
            >
              {activePhoto ? (
                <>
                  <img
                    src={activePhoto}
                    alt="Client Studio Portrait"
                    className="w-full h-full object-cover select-none transition-all duration-300"
                  />

                  {/* Dynamic Live Lighting Shading Layer */}
                  {showSimulatedFaceOverlay && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-all duration-200"
                      style={{
                        backgroundImage: `
                          radial-gradient(circle at ${keyHighlightX}% ${keyHighlightY}%, rgba(${keyRgba}, ${(keyPower / 10) * 0.42}) 0%, transparent 60%),
                          radial-gradient(circle at ${fillX}% ${fillY}%, rgba(200, 225, 255, ${(fillPower / 10) * 0.28}) 0%, transparent 70%),
                          radial-gradient(circle at ${100 - keyHighlightX}% ${100 - keyHighlightY}%, rgba(5, 7, 12, ${Math.min(0.68, (1 - (fillPower / 10)) * 0.65)}) 0%, transparent 75%)
                        `,
                        boxShadow: activeRimLight.active
                          ? `inset ${rimGlowX}px ${rimGlowY}px ${Math.round((activeRimLight.power / 10) * 35)}px ${rimColor}`
                          : 'none',
                        filter: `brightness(${0.88 + (keyPower / 45) + (fillPower / 55)}) contrast(${1.0 + (keyPower / 35) - (fillPower / 45)})`
                      }}
                    />
                  )}

                  {/* Eye Catchlights Simulation based on Active Modifier */}
                  {showCatchlights && showSimulatedFaceOverlay && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Left Eye Pupil Catchlight (approx 42% X, 44% Y) */}
                      <div
                        className="absolute transition-all duration-150"
                        style={{
                          left: `calc(42% + ${(Math.sin(keyRad) * 4).toFixed(1)}px)`,
                          top: `calc(44% - ${(Math.cos(keyRad) * 4).toFixed(1)}px)`
                        }}
                      >
                        {activeKeyLight.modifier === 'ring-light' ? (
                          <div className="w-3 h-3 rounded-full border border-white/90 shadow-[0_0_6px_#fff]" />
                        ) : activeKeyLight.modifier === 'beauty-dish' ? (
                          <div className="w-2.5 h-2.5 rounded-full border border-white/90 flex items-center justify-center shadow-[0_0_5px_#fff]">
                            <div className="w-0.5 h-0.5 bg-black rounded-full" />
                          </div>
                        ) : activeKeyLight.modifier === 'stripbox-grid' ? (
                          <div className="w-1 h-3.5 bg-white/90 rounded-sm shadow-[0_0_5px_#fff]" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-white/95 rounded-sm rotate-45 shadow-[0_0_6px_#fff]" />
                        )}
                      </div>

                      {/* Right Eye Pupil Catchlight (approx 58% X, 44% Y) */}
                      <div
                        className="absolute transition-all duration-150"
                        style={{
                          left: `calc(58% + ${(Math.sin(keyRad) * 4).toFixed(1)}px)`,
                          top: `calc(44% - ${(Math.cos(keyRad) * 4).toFixed(1)}px)`
                        }}
                      >
                        {activeKeyLight.modifier === 'ring-light' ? (
                          <div className="w-3 h-3 rounded-full border border-white/90 shadow-[0_0_6px_#fff]" />
                        ) : activeKeyLight.modifier === 'beauty-dish' ? (
                          <div className="w-2.5 h-2.5 rounded-full border border-white/90 flex items-center justify-center shadow-[0_0_5px_#fff]">
                            <div className="w-0.5 h-0.5 bg-black rounded-full" />
                          </div>
                        ) : activeKeyLight.modifier === 'stripbox-grid' ? (
                          <div className="w-1 h-3.5 bg-white/90 rounded-sm shadow-[0_0_5px_#fff]" />
                        ) : (
                          <div className="w-2.5 h-2.5 bg-white/95 rounded-sm rotate-45 shadow-[0_0_6px_#fff]" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shading Simulation Controls HUD Overlay */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setShowSimulatedFaceOverlay((p) => !p)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer backdrop-blur-md flex items-center gap-1 ${
                        showSimulatedFaceOverlay
                          ? 'bg-[#00b473]/90 text-black font-black border-[#00b473]'
                          : 'bg-black/70 text-[#8e9cb5] border-[#2b3750]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">light_mode</span>
                      <span>{showSimulatedFaceOverlay ? 'Shading ON' : 'Raw View'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCatchlights((p) => !p)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer backdrop-blur-md flex items-center gap-1 ${
                        showCatchlights
                          ? 'bg-[#ffd02f]/90 text-[#090c13] font-bold border-[#ffd02f]'
                          : 'bg-black/70 text-[#8e9cb5] border-[#2b3750]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">visibility</span>
                      <span>Catchlights</span>
                    </button>
                  </div>

                  {/* Bottom Optics Readout Bar */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2 flex items-center justify-between text-[10px] font-mono text-[#dce3f1]">
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-[#ffd02f] font-bold">KEY:</span>
                      <span>{activeKeyLight.angle}° ({activeKeyLight.modifier.split('-')[0]})</span>
                      <span className="text-[#8e9cb5]">•</span>
                      <span className="text-[#5cd2e6] font-bold">FILL:</span>
                      <span>{activeFillLight.angle}°</span>
                    </div>
                    <span className="text-[#ff9233] font-bold shrink-0">{activeRimLight.colorTemp}K RIM</span>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#ffd02f]/10 border border-[#ffd02f]/30 flex items-center justify-center text-[#ffd02f] mb-3 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                  </div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-white mb-1">
                    {isMm ? 'ဓာတ်ပုံ ဤနေရာသို့ ဆွဲထည့်ပါ' : 'Drop Portrait Photo Here'}
                  </h4>
                  <p className="text-xs text-[#8e9cb5] max-w-xs mb-4 leading-relaxed">
                    {isMm
                      ? 'မိမိစက်ထဲမှ ဓာတ်ပုံ (JPG, PNG, WEBP) ကို တင်၍ 3-Point Studio Lighting နှင့် Catchlights တိုက်ရိုက်စမ်းသပ်ပါ'
                      : 'or click to browse from device. Real-time 3-Point lighting physics and catchlights will adapt to your uploaded face.'}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ffd02f]/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span>{isMm ? 'ဖုန်း/ကွန်ပျူတာမှ ပုံရွေးချယ်ရန်' : 'Upload Photo'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Custom Photo Management (Replaced old "Select Model Portrait" chips) */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090c13] border border-[#1e273a]">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f] shrink-0">
                  {activePhoto ? 'check_circle' : 'add_photo_alternate'}
                </span>
                <span className="text-[11px] font-mono text-[#8e9cb5] truncate">
                  {activePhoto
                    ? (isMm ? 'စိတ်ကြိုက် ဓာတ်ပုံ တင်ထားပါသည်' : 'Active Custom Photo')
                    : (isMm ? 'ပုံမတင်ရသေးပါ (Drop or Upload)' : 'No photo uploaded yet')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#141b2a] hover:bg-[#1e273a] border border-[#232f47] hover:border-[#ffd02f]/50 text-white flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px] text-[#ffd02f]">upload</span>
                  <span>{activePhoto ? (isMm ? 'ပုံပြောင်းမည်' : 'Replace') : (isMm ? 'ပုံတင်မည်' : 'Upload')}</span>
                </button>

                {activePhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhoto('');
                      setRetouchedPhoto('');
                      showToast(isMm ? 'ဓာတ်ပုံ ရှင်းလင်းပြီးပါပြီ' : 'Photo removed');
                    }}
                    title="Remove Photo"
                    className="p-1.5 rounded-lg bg-[#141b2a] hover:bg-red-500/20 border border-[#232f47] hover:border-red-500/40 text-[#8e9cb5] hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Selected Light Source Inspector & Modifiers (4 Cols) */}
          <div className="xl:col-span-4 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Light Inspector & Modifiers
              </span>
              <span className="font-mono text-xs text-white uppercase font-bold">
                {selectedLightId.toUpperCase()} LIGHT
              </span>
            </div>

            {/* Select active light tab */}
            <div className="grid grid-cols-4 gap-1 bg-[#090c13] p-1.5 rounded-xl border border-[#1e273a]">
              {lights.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLightId(l.id)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedLightId === l.id
                      ? 'bg-[#1e273a] text-white shadow-xs'
                      : 'text-[#6b7794] hover:text-white'
                  }`}
                  style={{ borderBottom: selectedLightId === l.id ? `2px solid ${l.color}` : 'none' }}
                >
                  {l.id.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Active Light Parameters */}
            {(() => {
              const cur = lights.find((l) => l.id === selectedLightId) || lights[0];
              return (
                <div className="flex flex-col gap-3.5">
                  {/* Light Status Toggle */}
                  <div className="flex items-center justify-between bg-[#141b2a] px-3.5 py-2.5 rounded-xl border border-[#232f47]">
                    <span className="text-xs font-mono text-white font-bold">{cur.label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, active: !l.active } : l))
                        )
                      }
                      className={`text-xs font-mono px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                        cur.active
                          ? 'bg-[#00b473] text-black'
                          : 'bg-[#232f47] text-[#8e9cb5]'
                      }`}
                    >
                      {cur.active ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </div>

                  {/* Angle Dial Slider */}
                  <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8e9cb5]">Angle Azimuth</span>
                      <strong className="text-[#ffd02f]">{cur.angle}° Degree</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={cur.angle}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, angle: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
                      <span>0° (Back)</span>
                      <span>90° (Right)</span>
                      <span>180° (Front)</span>
                      <span>270° (Left)</span>
                    </div>
                  </div>

                  {/* Power Strobe Ratio */}
                  <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8e9cb5]">Strobe Power Ratio</span>
                      <strong className="text-white">{cur.power} / 10 EV</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={cur.power}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, power: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Advanced Light Modifier Box (9 Types) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold text-[#8e9cb5]">Light Modifier (Shape & Texture)</label>
                    <select
                      value={cur.modifier}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, modifier: e.target.value as any } : l))
                        )
                      }
                      className="bg-[#141b2a] border border-[#232f47] text-white text-xs px-3 py-2.5 rounded-xl font-mono outline-none focus:border-[#ffd02f]"
                    >
                      <option value="octabox-120">120cm Octabox with Grid (Soft Wrap & Octagonal Catchlight)</option>
                      <option value="beauty-dish">22" White Beauty Dish (Crisp Sculpting & Donut Catchlight)</option>
                      <option value="parabolic-umbrella">Deep Silver Parabolic Umbrella (Wide Radiant Diffusion)</option>
                      <option value="stripbox-grid">30x120cm Stripbox with Grid (Linear Rim & Edge Contour)</option>
                      <option value="fresnel-spot">Fresnel Spot with Barn Doors (Cinematic Razor Hard Shadows)</option>
                      <option value="ring-light">18" Macro Ring Light (Direct Frontal & Circular Iris Ring)</option>
                      <option value="honeycomb-grid">Narrow Honeycomb Grid Snoot (Targeted Hair Separation)</option>
                      <option value="snoot-grid">Conical Snoot with Grid (Pinpoint Precise Highlight)</option>
                      <option value="bare-bulb">Bare Bulb Strobe (Hard Vintage Direct Raw Flash)</option>
                    </select>
                  </div>

                  {/* Color Temperature Kelvin */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#8e9cb5]">Color Temperature</span>
                      <span className="text-[#ffd02f] font-bold">{cur.colorTemp} Kelvin</span>
                    </div>
                    <input
                      type="range"
                      min="2800"
                      max="6500"
                      step="100"
                      value={cur.colorTemp}
                      onChange={(e) =>
                        setLights((prev) =>
                          prev.map((l) => (l.id === cur.id ? { ...l, colorTemp: Number(e.target.value) } : l))
                        )
                      }
                      className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
                      <span>2800K (Warm Sun)</span>
                      <span>5200K (Daylight)</span>
                      <span>6500K (Cool Sky)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Active Optics Summary */}
            <div className="bg-[#080b12] p-3 rounded-xl border border-[#1b2334] font-mono text-[11px] text-[#ffd02f] leading-relaxed">
              Active Rig: Key at {activeKeyLight.angle}° ({activeKeyLight.modifier.split('-')[0]}), Fill at {activeFillLight.angle}°, Rim at {activeRimLight.angle}°
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BEFORE / AFTER SPLIT-SCREEN VIEWPORT               */}
      {/* ======================================================== */}
      {activeTab === 'split-compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Interactive Split Viewport (8 Cols) */}
          <div className="lg:col-span-8 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">compare</span>
                <h3 className="font-serif text-lg font-normal text-white">
                  {isMm ? 'မူရင်း vs အပြီးသတ် စတူဒီယို ပုံယှဉ်ကြည့်စနစ် (Split Compare Viewport)' : 'Interactive Before / After Retouch Split Viewport'}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex items-center bg-[#141b2a] p-0.5 rounded-lg border border-[#232f47]">
                  <button
                    type="button"
                    onClick={() => setSplitOrientation('vertical')}
                    title="Vertical Split"
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      splitOrientation === 'vertical' ? 'bg-[#ffd02f] text-[#090c13] font-bold' : 'text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    Vert
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitOrientation('horizontal')}
                    title="Horizontal Split"
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      splitOrientation === 'horizontal' ? 'bg-[#ffd02f] text-[#090c13] font-bold' : 'text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    Horiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitOrientation('side-by-side')}
                    title="2-Up Side by Side"
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      splitOrientation === 'side-by-side' ? 'bg-[#ffd02f] text-[#090c13] font-bold' : 'text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    2-Up
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGrid((p) => !p)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    showGrid ? 'bg-[#ffd02f] text-[#090c13] font-bold border-[#ffd02f]' : 'bg-[#141b2a] text-[#8e9cb5] border-[#232f47]'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoupe((p) => !p)}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    showLoupe ? 'bg-[#ffd02f] text-[#090c13] font-bold border-[#ffd02f]' : 'bg-[#141b2a] text-[#8e9cb5] border-[#232f47]'
                  }`}
                >
                  Loupe 100%
                </button>
              </div>
            </div>

            {/* Split Screen Container / Dropzone */}
            {!activePhoto ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOverSplit(true); }}
                onDragLeave={() => setIsDragOverSplit(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverSplit(false);
                  if (e.dataTransfer.files?.[0]) handlePhotoUpload(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-4/5 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragOverSplit
                    ? 'border-[#ffd02f] bg-[#ffd02f]/10'
                    : 'border-[#232f47] hover:border-[#ffd02f]/60 bg-[#080b12]'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#ffd02f]/10 border border-[#ffd02f]/30 flex items-center justify-center text-[#ffd02f] mb-3 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">compare</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white mb-1">
                  {isMm ? 'Before / After စမ်းသပ်ရန် ဓာတ်ပုံ ဆွဲထည့်ပါ' : 'Drop Photo to Compare Before / After'}
                </h4>
                <p className="text-xs text-[#8e9cb5] max-w-sm mb-4 leading-relaxed">
                  {isMm
                    ? 'RAW အရင်းအမြစ်နှင့် 8K Retouch အလွှာများကို အသေးစိတ် နှိုင်းယှဉ်စစ်ဆေးရန် ဓာတ်ပုံတင်ပါ (JPG, PNG, WEBP)'
                    : 'Upload or drop any portrait to inspect RAW unedited capture vs 8K Micro-texture and Thanaka skin retention layers.'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#ffd02f]/20 cursor-pointer active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>{isMm ? 'မိမိစက်မှ ပုံရွေးချယ်ရန်' : 'Upload or Drop Photo'}</span>
                </button>
              </div>
            ) : splitOrientation === 'side-by-side' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOverSplit(true); }}
                onDragLeave={() => setIsDragOverSplit(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverSplit(false);
                  if (e.dataTransfer.files?.[0]) handlePhotoUpload(e.dataTransfer.files[0]);
                }}
                className="grid grid-cols-2 gap-3 aspect-4/5 rounded-2xl overflow-hidden bg-black p-2 border border-[#232f47]"
              >
                <div className="relative rounded-xl overflow-hidden bg-[#141b2a] border border-[#232f47]">
                  <img src={activePhoto} alt="Raw Reference" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white/90 border border-white/20">
                    RAW SOURCE
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-[#141b2a] border border-[#ffd02f]/40">
                  <img
                    src={retouchedPhoto}
                    alt="Retouched Output"
                    className="w-full h-full object-cover"
                    style={{
                      filter: retouchPresetMode === 'freq-sep'
                        ? 'contrast(1.12) brightness(1.02) saturate(1.04)'
                        : retouchPresetMode === 'dodge-burn'
                        ? 'contrast(1.22) brightness(1.04) saturate(1.08)'
                        : retouchPresetMode === 'gold-lustre'
                        ? 'contrast(1.14) brightness(1.08) sepia(0.12) saturate(1.22)'
                        : retouchPresetMode === 'thanaka-enhanced'
                        ? 'contrast(1.16) brightness(1.02) hue-rotate(4deg) saturate(1.05)'
                        : 'contrast(1.05) brightness(1.02)'
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-[#ffd02f] text-[#090c13] px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-md">
                    RETOUCH ({retouchPresetMode.toUpperCase()})
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={splitContainerRef}
                onMouseMove={handleSplitMouseMove}
                onMouseDown={() => setIsDraggingSplit(true)}
                onMouseUp={() => setIsDraggingSplit(false)}
                className={`relative aspect-4/5 rounded-2xl overflow-hidden bg-black border border-[#232f47] select-none ${
                  splitOrientation === 'horizontal' ? 'cursor-ns-resize' : 'cursor-ew-resize'
                }`}
              >
                {/* Right / Bottom: Final Retouched Artwork */}
                <img
                  src={retouchedPhoto}
                  alt="Retouched Final"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    filter: retouchPresetMode === 'freq-sep'
                      ? 'contrast(1.12) brightness(1.02) saturate(1.04)'
                      : retouchPresetMode === 'dodge-burn'
                      ? 'contrast(1.22) brightness(1.04) saturate(1.08)'
                      : retouchPresetMode === 'gold-lustre'
                      ? 'contrast(1.14) brightness(1.08) sepia(0.12) saturate(1.22)'
                      : retouchPresetMode === 'thanaka-enhanced'
                      ? 'contrast(1.16) brightness(1.02) hue-rotate(4deg) saturate(1.05)'
                      : 'contrast(1.05) brightness(1.02)'
                  }}
                />

                {/* Left / Top: Raw Source Reference (Clipped by splitPos) */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={splitOrientation === 'horizontal' ? { height: `${splitPos}%` } : { width: `${splitPos}%` }}
                >
                  <img
                    src={activePhoto}
                    alt="Raw Reference"
                    className="w-full h-full object-cover pointer-events-none"
                    style={{
                      width: splitContainerRef.current ? `${splitContainerRef.current.clientWidth}px` : '100%',
                      height: splitContainerRef.current ? `${splitContainerRef.current.clientHeight}px` : '100%',
                      maxWidth: 'none'
                    }}
                  />
                </div>

                {/* Draggable Divider Bar */}
                {splitOrientation === 'horizontal' ? (
                  <div
                    className="absolute left-0 right-0 z-20 h-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ top: `${splitPos}%` }}
                  >
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#ffd02f] text-[#090c13] flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                      <span className="material-symbols-outlined text-[16px]">unfold_more</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#ffd02f] text-[#090c13] flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
                      <span className="material-symbols-outlined text-[16px]">code</span>
                    </div>
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 z-10 bg-black/70 px-2.5 py-1 rounded-md text-[10px] font-mono text-white/90 border border-white/20">
                  RAW SOURCE (INPUT)
                </div>
                <div className="absolute top-3 right-3 z-10 bg-[#ffd02f] text-[#090c13] px-2.5 py-1 rounded-md text-[10px] font-mono font-bold shadow-md">
                  8K RETOUCH ({retouchPresetMode.toUpperCase()})
                </div>

              {/* Rule of Thirds Grid */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="" />
                </div>
              )}

              {/* 100% Texture Loupe */}
              {showLoupe && (
                <div
                  className="absolute w-32 h-32 rounded-full border-2 border-[#ffd02f] shadow-2xl pointer-events-none overflow-hidden z-30"
                  style={{
                    left: `calc(${loupePos.x}% - 64px)`,
                    top: `calc(${loupePos.y}% - 64px)`,
                    backgroundImage: `url(${splitPos > loupePos.x ? activePhoto : retouchedPhoto})`,
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
            )}

            <div className="flex items-center justify-between text-xs font-mono text-[#8e9cb5] pt-1">
              <span>Drag slider left/right to compare micro-pores & Thanaka retention</span>
              <span className="text-[#ffd02f]">Split Divider: {Math.round(splitPos)}%</span>
            </div>
          </div>

          {/* Realism Fidelity Checkcard (4 Cols) */}
          <div className="lg:col-span-4 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Commercial Realism Audit
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Thanaka Bark Grain</span>
                <span className="text-[#00b473] font-bold">100% Intact</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Epidermal Micro-Pores</span>
                <span className="text-[#00b473] font-bold">Verified Sharp</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Plastic Smoothing</span>
                <span className="text-[#00b473] font-bold">0% (Shield Active)</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Lun Taya Silk Weave</span>
                <span className="text-[#ffd02f] font-bold">100-Shuttle Micro</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47] flex items-center justify-between">
                <span>Ground Shadow Physics</span>
                <span className="text-[#00b473] font-bold">Contact Occlusion</span>
              </div>
            </div>

            {/* Retouch Layer Simulation Presets */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#1c2333]">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#ffd02f]">auto_fix_high</span>
                Retouch Layer Preset (Live Engine):
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'balanced', labelEn: 'Default Balanced 8K', labelMm: 'မူလ စံချိန်မီ 8K ပြင်ဆင်မှု', icon: 'sparkles' },
                  { id: 'freq-sep', labelEn: 'Freq Separation (Skin Pores)', labelMm: 'ချွေးပေါက် အသေးစိတ် မပျက်သော အသားအရေ', icon: 'texture' },
                  { id: 'dodge-burn', labelEn: 'Dodge & Burn (Sculpt 3D)', labelMm: 'အလင်းအမှောင် 3D ရုပ်ကြွ ပြုပြင်မှု', icon: 'contrast' },
                  { id: 'gold-lustre', labelEn: '24K Gold & Jewelry Sheen', labelMm: 'ရွှေထည် & ကျောက်မျက် အရောင်တင်', icon: 'diamond' },
                  { id: 'thanaka-enhanced', labelEn: 'Thanaka Bark Micro-Texture', labelMm: 'သနပ်ခါး အသွေးအမျှင် ထင်ရှားစေမှု', icon: 'spa' }
                ].map((preset) => {
                  const isSelected = retouchPresetMode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setRetouchPresetMode(preset.id as any);
                        showToast(`Retouch layer: ${preset.labelEn}`);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#ffd02f]/10 border-[#ffd02f] text-white shadow-sm'
                          : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:border-[#38486b] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${isSelected ? 'text-[#ffd02f]' : 'text-[#6b7794]'}`}>
                          {preset.icon}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-tight">{isMm ? preset.labelMm : preset.labelEn}</span>
                          <span className="text-[9px] font-mono text-[#6b7794]">{preset.id}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Comparison Photo Management */}
            <div className="flex flex-col gap-2 pt-3 border-t border-[#1c2333]">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold flex items-center justify-between">
                <span>{isMm ? 'နှိုင်းယှဉ်စစ်ဆေးမည့် ဓာတ်ပုံ' : 'Comparison Photo'}</span>
                <span className="text-[9px] text-[#ffd02f] font-mono">
                  {activePhoto ? (isMm ? 'တင်ပြီး' : 'Active') : (isMm ? 'မရှိသေး' : 'Empty')}
                </span>
              </span>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#141b2a] border border-[#232f47]">
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[16px] text-[#ffd02f] shrink-0">
                    {activePhoto ? 'image' : 'add_photo_alternate'}
                  </span>
                  <span className="text-xs font-mono text-[#dce3f1] truncate">
                    {activePhoto ? (isMm ? 'စိတ်ကြိုက် ဓာတ်ပုံ' : 'Custom Uploaded Photo') : (isMm ? 'ပုံတင်ရန် လိုအပ်သည်' : 'No photo uploaded')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#090c13] hover:bg-[#1e273a] border border-[#232f47] hover:border-[#ffd02f]/60 text-[#ffd02f] text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    {activePhoto ? (isMm ? 'ပုံပြောင်းမည်' : 'Replace') : (isMm ? 'ပုံတင်မည်' : 'Upload')}
                  </button>

                  {activePhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePhoto('');
                        setRetouchedPhoto('');
                        showToast(isMm ? 'ဓာတ်ပုံ ရှင်းလင်းပြီးပါပြီ' : 'Photo removed');
                      }}
                      title="Remove Photo"
                      className="p-1.5 rounded-lg bg-[#090c13] hover:bg-red-500/20 border border-[#232f47] text-[#8e9cb5] hover:text-red-400 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 3-WAY COLOR GRADING WHEELS & FILM EMULSION         */}
      {/* ======================================================== */}
      {activeTab === 'color-grading' && (
        <div className="bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-[#1c2333] pb-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">palette</span>
              <div>
                <h3 className="font-serif text-lg font-normal text-white">
                  {isMm ? '၃-ဆင့် အရောင်ညှိ & ဖလင်အမျိုးအစား စနစ် (Cinema Color Timing & Film Emulsion)' : '3-Way Cinema Color Timing & 16-Bit Film Emulsion Curves'}
                </h3>
                <span className="font-mono text-xs text-[#8e9cb5]">DaVinci Resolve / Capture One Pro Style Color Engine</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setShadowsHue(220); setShadowsSat(20);
                setMidtonesHue(38); setMidtonesSat(45);
                setHighlightsHue(45); setHighlightsSat(15);
                setColorGradeContrast(105);
                setColorGradeSaturation(102);
                setFilmGrainAmount(16);
                setActiveColorLook('mandalay-gold');
                setFilmEmulsion('hasselblad-hncs');
                showToast('Color grading reset to Studio Default');
              }}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#232f47] text-[#8e9cb5] hover:text-white hover:border-[#ffd02f] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reset Grading
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Cinema Timing Viewport (5 Cols) */}
            <div className="lg:col-span-5 bg-[#141b2a] border border-[#232f47] rounded-2xl p-4 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#ffd02f] flex items-center gap-1.5 uppercase">
                  <span className="material-symbols-outlined text-[16px]">movie_filter</span>
                  Live Timing Viewport
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-[#8e9cb5] border border-[#232f47]">
                  {colorTempKelvin}K WB
                </span>
              </div>

              {/* Viewport Image with Computed Tone Grading & Grain */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOverGrading(true); }}
                onDragLeave={() => setIsDragOverGrading(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverGrading(false);
                  if (e.dataTransfer.files?.[0]) handlePhotoUpload(e.dataTransfer.files[0]);
                }}
                className={`relative aspect-4/5 rounded-xl overflow-hidden bg-black border shadow-inner transition-colors ${
                  isDragOverGrading ? 'border-[#ffd02f] bg-[#ffd02f]/10' : 'border-[#232f47]'
                }`}
              >
                {activePhoto ? (
                  <>
                    <img
                      src={activePhoto}
                      alt="Cinema Grade Preview"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{
                        filter: (() => {
                          const c = colorGradeContrast / 100;
                          const s = colorGradeSaturation / 100;
                          if (activeColorLook === 'hpa-an-monochrome' || filmEmulsion === 'leica-monochrom') {
                            return `grayscale(1) contrast(${c * 1.3}) brightness(0.96)`;
                          }
                          if (activeColorLook === 'mandalay-gold') {
                            return `contrast(${c * 1.08}) saturate(${s * 1.15}) sepia(0.2) hue-rotate(-8deg)`;
                          }
                          if (activeColorLook === 'inle-mist') {
                            return `contrast(${c * 0.96}) saturate(${s * 0.95}) brightness(1.04) hue-rotate(15deg)`;
                          }
                          if (activeColorLook === 'bagan-terracotta') {
                            return `contrast(${c * 1.14}) saturate(${s * 1.2}) sepia(0.3) hue-rotate(-16deg)`;
                          }
                          if (activeColorLook === 'yangon-royal-emerald') {
                            return `contrast(${c * 1.06}) saturate(${s * 1.12}) hue-rotate(32deg) sepia(0.08)`;
                          }
                          if (filmEmulsion === 'kodachrome-64') {
                            return `contrast(${c * 1.18}) saturate(${s * 1.25}) hue-rotate(-4deg)`;
                          }
                          if (filmEmulsion === 'cinestill-800t') {
                            return `contrast(${c * 1.08}) saturate(${s * 1.12}) hue-rotate(10deg) brightness(1.04)`;
                          }
                          return `contrast(${c}) saturate(${s})`;
                        })()
                      }}
                    />

                    {/* Subtle Grain Texture Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none mix-blend-overlay"
                      style={{
                        opacity: filmGrainAmount / 100,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                        backgroundSize: '3px 3px'
                      }}
                    />

                    {/* Viewport Live Badges */}
                    <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white/90 border border-white/20">
                      {filmEmulsion.toUpperCase().replace(/-/g, ' ')}
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/80 backdrop-blur-md p-2 rounded-lg text-[10px] font-mono text-[#8e9cb5] flex items-center justify-between border border-[#232f47]">
                      <span className="text-white font-medium">{activeColorLook.replace(/-/g, ' ').toUpperCase()}</span>
                      <span className="text-[#ffd02f]">C: {colorGradeContrast}% | S: {colorGradeSaturation}% | G: {filmGrainAmount}%</span>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="material-symbols-outlined text-[32px] text-[#ffd02f] mb-2">add_photo_alternate</span>
                    <h5 className="font-serif text-sm font-bold text-white mb-1">
                      {isMm ? 'ဓာတ်ပုံ တင်ရန်' : 'Upload or Drop Photo'}
                    </h5>
                    <p className="text-[11px] text-[#8e9cb5] max-w-xs mb-3">
                      {isMm ? 'ရုပ်ရှင်ကာလာ အရောင်သွေး စမ်းသပ်ရန် ဓာတ်ပုံတင်ပါ' : 'Drop photo to preview film emulsion & Burmese cinema grading in real time.'}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#ffd02f] text-[#090c13] text-xs font-bold font-mono cursor-pointer"
                    >
                      Browse
                    </button>
                  </div>
                )}
              </div>

              {/* Master Burmese Cinema Color Looks */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">Burmese Cinema Tone Presets:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'mandalay-gold', label: 'Mandalay Royal Gold', desc: 'Warm acheik & honey' },
                    { id: 'bagan-terracotta', label: 'Bagan Terracotta', desc: 'Ancient temple warmth' },
                    { id: 'inle-mist', label: 'Inle Lake Morning Mist', desc: 'Airy cyan specular' },
                    { id: 'yangon-royal-emerald', label: 'Imperial Emerald', desc: 'Lush teakwood & silk' },
                    { id: 'hpa-an-monochrome', label: 'Hpa-An Karst B&W', desc: 'Deep silver contrast' }
                  ].map((look) => (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() => {
                        setActiveColorLook(look.id);
                        showToast(`Look: ${look.label}`);
                      }}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        activeColorLook === look.id
                          ? 'bg-[#ffd02f]/10 border-[#ffd02f] text-white shadow-sm'
                          : 'bg-[#0f1420] border-[#232f47] text-[#8e9cb5] hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-medium block leading-tight">{look.label}</span>
                      <span className="text-[9px] font-mono text-[#6b7794]">{look.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Tone Sliders (Contrast, Saturation, Film Grain) */}
              <div className="flex flex-col gap-3 pt-2 border-t border-[#1c2333]">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8e9cb5]">Micro-Contrast Curve</span>
                    <span className="text-white font-bold">{colorGradeContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    value={colorGradeContrast}
                    onChange={(e) => setColorGradeContrast(Number(e.target.value))}
                    className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8e9cb5]">Skin Saturation Gamut</span>
                    <span className="text-white font-bold">{colorGradeSaturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    value={colorGradeSaturation}
                    onChange={(e) => setColorGradeSaturation(Number(e.target.value))}
                    className="w-full accent-[#00b473] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#8e9cb5]">Halation & 35mm Grain</span>
                    <span className="text-white font-bold">{filmGrainAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={filmGrainAmount}
                    onChange={(e) => setFilmGrainAmount(Number(e.target.value))}
                    className="w-full accent-[#5cd2e6] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: 3 Color Wheels & Master Film Emulsions (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* 3 Color Wheels (Shadows, Midtones, Highlights) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Wheel 1: SHADOWS (Lift) */}
                <div className="bg-[#141b2a] p-3.5 rounded-2xl border border-[#232f47] flex flex-col items-center gap-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono font-bold text-white uppercase">1. SHADOWS (LIFT)</span>
                    <span className="text-[10px] font-mono text-[#5cd2e6]">{shadowsHue}° / {shadowsSat}%</span>
                  </div>
                  <div className="relative w-32 h-32 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#101b2b] via-[#141b2a] to-[#25324d] shadow-inner cursor-pointer">
                    <div
                      className="w-4 h-4 rounded-full bg-[#5cd2e6] shadow-md border-2 border-white cursor-pointer"
                      style={{
                        transform: `translate(${Math.cos((shadowsHue * Math.PI) / 180) * (shadowsSat * 1.1)}px, ${
                          Math.sin((shadowsHue * Math.PI) / 180) * (shadowsSat * 1.1)
                        }px)`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={shadowsHue}
                    onChange={(e) => setShadowsHue(Number(e.target.value))}
                    className="w-full accent-[#5cd2e6] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-[#6b7794]">Cool Blue Velvet Shadows</span>
                </div>

                {/* Wheel 2: MIDTONES (Gamma - Skin Tones) */}
                <div className="bg-[#141b2a] p-3.5 rounded-2xl border border-[#232f47] flex flex-col items-center gap-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono font-bold text-white uppercase">2. MIDTONES (SKIN)</span>
                    <span className="text-[10px] font-mono text-[#ffd02f]">{midtonesHue}° / {midtonesSat}%</span>
                  </div>
                  <div className="relative w-32 h-32 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#2b2410] via-[#141b2a] to-[#453610] shadow-inner cursor-pointer">
                    <div
                      className="w-4 h-4 rounded-full bg-[#ffd02f] shadow-md border-2 border-white cursor-pointer"
                      style={{
                        transform: `translate(${Math.cos((midtonesHue * Math.PI) / 180) * (midtonesSat * 1.1)}px, ${
                          Math.sin((midtonesHue * Math.PI) / 180) * (midtonesSat * 1.1)
                        }px)`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={midtonesHue}
                    onChange={(e) => setMidtonesHue(Number(e.target.value))}
                    className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-[#6b7794]">Golden Burmese Honey Skin</span>
                </div>

                {/* Wheel 3: HIGHLIGHTS (Gain) */}
                <div className="bg-[#141b2a] p-3.5 rounded-2xl border border-[#232f47] flex flex-col items-center gap-2.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono font-bold text-white uppercase">3. HIGHLIGHTS (GAIN)</span>
                    <span className="text-[10px] font-mono text-[#ffb86c]">{highlightsHue}° / {highlightsSat}%</span>
                  </div>
                  <div className="relative w-32 h-32 rounded-full border border-[#2b3952] flex items-center justify-center bg-gradient-to-tr from-[#241c10] via-[#141b2a] to-[#36271a] shadow-inner cursor-pointer">
                    <div
                      className="w-4 h-4 rounded-full bg-[#ffb86c] shadow-md border-2 border-white cursor-pointer"
                      style={{
                        transform: `translate(${Math.cos((highlightsHue * Math.PI) / 180) * (highlightsSat * 1.1)}px, ${
                          Math.sin((highlightsHue * Math.PI) / 180) * (highlightsSat * 1.1)
                        }px)`
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={highlightsHue}
                    onChange={(e) => setHighlightsHue(Number(e.target.value))}
                    className="w-full accent-[#ffb86c] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-[#6b7794]">Warm Specular Roll-off</span>
                </div>

              </div>

              {/* Master 16-Bit Film Emulsion Curves (6 Presets) */}
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs font-bold text-[#ffd02f] flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">filter_vintage</span>
                  Master 16-Bit Film Emulsion Curves:
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'hasselblad-hncs', label: 'Hasselblad HNCS', desc: '16-Bit Natural Color Profile', tag: 'Studio Standard' },
                    { id: 'kodak-portra-400', label: 'Kodak Portra 400', desc: 'Pastel Warm Editorial Skin', tag: 'Fashion Icon' },
                    { id: 'fuji-pro-400h', label: 'Fuji Pro 400H', desc: 'Airy Pastel Emerald Greens', tag: 'Fine Art' },
                    { id: 'kodachrome-64', label: 'Kodachrome 64', desc: 'Rich Primary Dye Densities', tag: 'National Geo' },
                    { id: 'cinestill-800t', label: 'Cinestill 800T', desc: 'Tungsten Halation & Night Glow', tag: 'Cinema Mood' },
                    { id: 'leica-monochrom', label: 'Leica Monochrom', desc: 'Architectural Dynamic B&W', tag: 'Pure Gelatin' }
                  ].map((film) => (
                    <button
                      key={film.id}
                      type="button"
                      onClick={() => {
                        setFilmEmulsion(film.id);
                        showToast(`Emulsion loaded: ${film.label}`);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        filmEmulsion === film.id
                          ? 'bg-[#ffd02f]/10 border-[#ffd02f] text-white shadow-md'
                          : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-mono font-bold">{film.label}</span>
                        <span className="text-[8px] font-mono uppercase bg-[#232f47] px-1.5 py-0.5 rounded text-[#ffd02f]">
                          {film.tag}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8e9cb5] block leading-tight">{film.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}



      {/* ======================================================== */}
      {/* TAB 5: TECHNICAL EXIF & 300 DPI LAB PRINT                */}
      {/* ======================================================== */}
      {activeTab === 'exif-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* EXIF Inspector Card (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">settings_photo_camera</span>
                Camera EXIF & Optical Sensor Inspector
              </span>
              <span className="text-[10px] font-mono text-[#00b473] bg-[#00b473]/10 px-2.5 py-0.5 rounded-full border border-[#00b473]/30">
                16-Bit Uncompressed RAW
              </span>
            </div>

            {/* Quick Camera Body Switcher in Tab 5 */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">Select Active Camera Body:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hasselblad-x2d', name: 'Hasselblad X2D', res: '100MP MF' },
                  { id: 'fujifilm-gfx100ii', name: 'Fujifilm GFX 100 II', res: '102MP Large' },
                  { id: 'sony-a7rv', name: 'Sony A7R V', res: '61MP Full-Frame' }
                ].map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => {
                      setSelectedCameraBody(cam.id);
                      showToast(`Selected camera: ${cam.name}`);
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedCameraBody === cam.id
                        ? 'bg-[#ffd02f]/10 border-[#ffd02f] text-white shadow-sm'
                        : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{cam.name}</span>
                    <span className="text-[10px] font-mono text-[#ffd02f]">{cam.res}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">CAMERA BODY</span>
                <span className="text-sm font-bold text-white uppercase">
                  {selectedCameraBody === 'hasselblad-x2d'
                    ? 'Hasselblad X2D 100C'
                    : selectedCameraBody === 'fujifilm-gfx100ii'
                    ? 'Fujifilm GFX 100 II'
                    : 'Sony Alpha A7R V'}
                </span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">OPTICAL SENSOR</span>
                <span className="text-sm font-bold text-white">
                  {selectedCameraBody === 'sony-a7rv'
                    ? '61MP Exmor R BSI (35.7×23.8mm)'
                    : '100MP BSI CMOS (43.8×32.9mm)'}
                </span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">LENS PRIME</span>
                <span className="text-sm font-bold text-[#ffd02f]">
                  {selectedFocalLength} f/1.4 Editorial Prime
                </span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">DYNAMIC RANGE</span>
                <span className="text-sm font-bold text-white">15 STOPS LATITUDE</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">ICC COLOR SPACE</span>
                <span className="text-sm font-bold text-[#00b473] uppercase">{colorProfileIcc.replace(/-/g, ' ')}</span>
              </div>
              <div className="bg-[#141b2a] p-3 rounded-xl border border-[#232f47]">
                <span className="text-[10px] text-[#6b7794] block">SHUTTER & ISO</span>
                <span className="text-sm font-bold text-white">1/250s Leaf Shutter • ISO 64</span>
              </div>
            </div>

            {/* Print Bleed & Margin Setup */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#1c2333]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8e9cb5]">Print Bleed Allowance</span>
                <span className="text-[#ffd02f] font-bold">{printBleed} mm Safe Margin</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={printBleed}
                onChange={(e) => setPrintBleed(Number(e.target.value))}
                className="w-full accent-[#ffd02f] h-1.5 bg-[#232f47] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Target Print Size & ICC Lab Setup (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0f1420] border border-[#1e273a] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
            <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">print</span>
              Target Print Size & 300 DPI Lab Setup
            </span>

            {/* Print Size Calculator */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">Print Size Target:</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'a2-museum', title: 'A2 Museum Fine Art (420×594 mm)', px: '4960 × 7016 px (34.8 MP)', tiff: '~200 MB Uncompressed TIFF' },
                  { id: 'canvas-24x36', title: '24" × 36" Royal Gallery Canvas', px: '7200 × 10800 px (77.8 MP)', tiff: '~450 MB Uncompressed TIFF' },
                  { id: 'album-12x18', title: '12" × 18" Silk Archival Album', px: '3600 × 5400 px (19.4 MP)', tiff: '~110 MB Uncompressed TIFF' }
                ].map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      setPrintSizeTarget(size.id as any);
                      showToast(`Target print size: ${size.title}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      printSizeTarget === size.id
                        ? 'bg-[#ffd02f]/10 border-[#ffd02f] text-white shadow-sm'
                        : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block">{size.title}</span>
                    <div className="flex justify-between text-[10px] font-mono pt-0.5">
                      <span className="text-[#ffd02f]">{size.px}</span>
                      <span className="text-[#6b7794]">{size.tiff}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ICC Color Profile */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1c2333]">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">ICC Color Space Profile:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'prophoto-rgb', label: 'ProPhoto RGB', desc: 'Widest Medium Format Gamut' },
                  { id: 'adobe-rgb', label: 'Adobe RGB 1998', desc: 'Standard Giclée Fine Art' },
                  { id: 'srgb', label: 'sRGB IEC61966', desc: 'Web & Digital Displays' },
                  { id: 'cmyk-fogra39', label: 'CMYK FOGRA39', desc: 'Commercial Press Offset' }
                ].map((icc) => (
                  <button
                    key={icc.id}
                    type="button"
                    onClick={() => {
                      setColorProfileIcc(icc.id);
                      showToast(`ICC Profile: ${icc.label}`);
                    }}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      colorProfileIcc === icc.id
                        ? 'bg-[#00b473]/15 border-[#00b473] text-white shadow-sm'
                        : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold block leading-tight">{icc.label}</span>
                    <span className="text-[9px] font-mono text-[#6b7794]">{icc.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fine Art Paper Stock */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1c2333]">
              <span className="text-[10px] font-mono text-[#6b7794] uppercase font-bold">Paper Stock Specification:</span>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'fuji-crystal-archive-silk', title: 'Fuji Crystal Archive Silk', gsm: '250 GSM', finish: 'Subtle Luster (Wedding Standard)' },
                  { id: 'hahnemuhle-photo-rag', title: 'Hahnemühle Photo Rag 308', gsm: '308 GSM', finish: '100% Cotton Museum Grade' },
                  { id: 'canson-infinity-baryta', title: 'Canson Infinity Baryta Prestige', gsm: '340 GSM', finish: 'Darkroom Gloss Traditional' }
                ].map((paper) => (
                  <button
                    key={paper.id}
                    type="button"
                    onClick={() => {
                      setPaperStock(paper.id);
                      showToast(`Selected paper: ${paper.title}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      paperStock === paper.id
                        ? 'bg-[#1e273a] border-[#ffd02f] text-white shadow-md'
                        : 'bg-[#141b2a] border-[#232f47] text-[#8e9cb5] hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between text-xs font-bold">
                      <span>{paper.title}</span>
                      <span className="text-[#ffd02f] font-mono">{paper.gsm}</span>
                    </div>
                    <span className="text-[10px] opacity-75">{paper.finish}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('Print Lab Job Card generated with 300 DPI specifications')}
              className="w-full mt-1 py-3 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#090c13] font-bold text-xs font-mono uppercase cursor-pointer shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Export 300 DPI Lab Print Recipe</span>
            </button>
          </div>

        </div>
      )}

      {/* 🌟 4. SYNTHESIZED PROFESSIONAL STUDIO MASTER PROMPT BAR */}
      <div className="bg-[#0f1420] border border-[#1e273a] rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ffd02f]">terminal</span>
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Commercial Studio Master Synthesized Prompt (Midjourney v6.1 & Flux)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00b473] bg-[#00b473]/10 px-2.5 py-0.5 rounded-full border border-[#00b473]/30">
            Real Optical Physics Synchronized
          </span>
        </div>

        <div className="bg-[#080b12] p-4 rounded-xl border border-[#1b2334] font-mono text-xs text-[#dce3f1] leading-relaxed break-words">
          {synthesizedProStudioPrompt}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {onSendToPhotoStudio && (
              <button
                type="button"
                onClick={() => {
                  const camLabel = selectedCameraBody === 'hasselblad-x2d'
                    ? 'Hasselblad X2D 100C'
                    : selectedCameraBody === 'fujifilm-gfx100ii'
                    ? 'Fujifilm GFX 100 II'
                    : 'Sony A7R V';

                  onSendToPhotoStudio(synthesizedProStudioPrompt, {
                    ratio: selectedAspectRatio,
                    referencePhoto: activePhoto,
                    referencePhotos: activePhoto ? [{ url: activePhoto, name: 'Studio Reference Portrait' }] : [],
                    chosenOptions: [
                      { label: 'Camera Medium Format', value: `${camLabel} (${selectedFocalLength} f/1.4)`, emoji: '📸' },
                      { label: 'Studio Lighting Rig', value: `${activeKeyLight.modifier.split('-')[0]} @ ${activeKeyLight.angle}° (${contrastRatioFormatted})`, emoji: '💡' },
                      { label: 'Color Emulsion', value: filmEmulsion, emoji: '🎞️' },
                      { label: 'ICC Profile', value: colorProfileIcc.toUpperCase(), emoji: '🎨' },
                      { label: 'Aspect Ratio', value: selectedAspectRatio, emoji: '📐' }
                    ]
                  });
                  showToast(isMm ? 'Photo Prompt Studio သို့ ပုံနှင့် Prompt ပို့ဆောင်ပြီးပါပြီ!' : 'Master Prompt & Reference Photo sent to Photo Studio!');
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#ffd02f] to-[#ffaa00] hover:from-[#fcb900] hover:to-[#e69500] text-[#090c13] font-black px-4 py-2 rounded-full text-xs cursor-pointer shadow-lg transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[17px]">camera_enhance</span>
                <span>{isMm ? 'Photo Studio တွင် ပုံထုတ်မည်' : 'Generate in Photo Studio'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 bg-[#1b2334] hover:bg-[#253047] border border-[#2b3750] text-white px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>

            {onSendToMatrix && (
              <button
                type="button"
                onClick={() => onSendToMatrix(synthesizedProStudioPrompt)}
                className="flex items-center gap-1.5 bg-[#1b2334] hover:bg-[#253047] border border-[#2b3750] text-white px-4 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">send</span>
                <span>Send to Prompt Matrix</span>
              </button>
            )}
          </div>

          {onSavePrompt && (
            <button
              type="button"
              onClick={() => onSavePrompt(synthesizedProStudioPrompt, { title: 'Commercial Studio Master', mode: 'pro-workstation' })}
              className="flex items-center gap-1.5 bg-[#141b2a] hover:bg-[#1e273a] border border-[#232f47] text-[#8e9cb5] hover:text-white px-3.5 py-2 rounded-full text-xs font-mono cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">bookmark</span>
              <span>Save to Collections</span>
            </button>
          )}
        </div>
      </div>



    </div>
  );
};
