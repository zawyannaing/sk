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
  CHARACTER_PRESETS,
  CharacterPreset
} from '../data/presetData';

// Sub components & deep resource carousels
import { SubjectPreserveFeatureBox } from './SubjectPreserveFeatureBox';
import { GarmentSelectionCarousel } from './GarmentSelectionCarousel';
import { EventSelectionCarousel } from './EventSelectionCarousel';
import { LocationSelectionCarousel } from './LocationSelectionCarousel';
import { LightingSelectionCarousel } from './LightingSelectionCarousel';
import { MoodSelectionCarousel } from './MoodSelectionCarousel';
import { CameraSelectionCarousel } from './CameraSelectionCarousel';
import { CameraAngleSelectionCarousel } from './CameraAngleSelectionCarousel';
import { FilmColorSelectionCarousel } from './FilmColorSelectionCarousel';
import { SkinRetouchSelectionCarousel } from './SkinRetouchSelectionCarousel';
import { MakeupSelectionCarousel } from './MakeupSelectionCarousel';
import { PhotoStyleSelectionCarousel } from './PhotoStyleSelectionCarousel';
import { QualityEngineSelectionCarousel } from './QualityEngineSelectionCarousel';
import { PoseSelectionCarousel } from './PoseSelectionCarousel';
import { CulturalPropsDropdown } from './CulturalPropsDropdown';
import { ClothesSwapPanel } from './ClothesSwapPanel';
import { CustomGarmentUploader } from './CustomGarmentUploader';
import { CoupleDetailsCustomizer } from './CoupleDetailsCustomizer';
import { WeddingPropsPanel } from './WeddingPropsPanel';
import { SelectedOptionsSummaryModal } from './SelectedOptionsSummaryModal';
import { buildComprehensiveMasterPrompt } from '../utils/promptBuilder';

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
  onNavigateView
}) => {
  const isMyanmar = language === 'my';

  // Workflow tab navigation
  const [activeTab, setActiveTab] = useState<'tab-subject' | 'tab-scene' | 'tab-direction' | 'tab-engine'>('tab-subject');
  const [isViewAll, setIsViewAll] = useState<boolean>(false);
  const [archetypeCategory, setArchetypeCategory] = useState<'all' | 'royal' | 'ethnic' | 'folk' | 'modern'>('all');

  // Deep resource drawer expandable states
  const [expandedDrawers, setExpandedDrawers] = useState<Record<string, boolean>>({
    characterFeature: true,
    garmentCatalog: true,
    clothesSwapTools: false,
    locationCatalog: false,
    eventCatalog: false,
    lightingCatalog: false,
    poseCatalog: false,
    cameraCatalog: false,
    filmRetouchCatalog: false,
    qualityCatalog: false
  });

  const toggleDrawer = (drawerKey: string) => {
    setExpandedDrawers(prev => ({
      ...prev,
      [drawerKey]: !prev[drawerKey]
    }));
  };

  // Summary modal state
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  // Toasts
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [negCopiedToast, setNegCopiedToast] = useState<boolean>(false);
  const [resetToast, setResetToast] = useState<boolean>(false);

  // Quick additive modifiers
  const [quickModifiers, setQuickModifiers] = useState<string[]>([]);

  // File ref for reference image upload in Tab 1
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File ref & drag-over for Prompt Section photo upload
  const promptPhotoInputRef = useRef<HTMLInputElement>(null);
  const [isPromptDragOver, setIsPromptDragOver] = useState<boolean>(false);

  const handlePromptDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsPromptDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSelection({
          referenceImage: reader.result as string,
          identityLock: selection.identityLock === 'no_lock' ? 'face_100' : selection.identityLock
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSelection({
          referenceImage: reader.result as string,
          identityLock: selection.identityLock === 'no_lock' ? 'face_100' : selection.identityLock
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Engine syntax mapping
  const engineSyntax = useMemo(() => {
    switch (engine) {
      case 'midjourney-v6':
        return '--style raw --v 6.1';
      case 'flux-1':
        return '--flux high-definition --guidance 3.5';
      case 'sdxl':
        return '--sdxl-turbo --steps 30';
      case 'dalle-3':
        return '--dalle-precision hd';
      default:
        return '--style raw --v 6.1';
    }
  }, [engine]);

  // Live AI synthesis state & multi-engine format selector
  const [aiSynthesizedData, setAiSynthesizedData] = useState<any | null>(null);
  const [isSynthesizingAi, setIsSynthesizingAi] = useState<boolean>(false);
  const [activeFormatTab, setActiveFormatTab] = useState<'master' | 'flux' | 'midjourney' | 'sdxl' | 'negative'>('master');

  // Reset AI override when user modifies matrix selection so live matrix stays 100% reactive
  useEffect(() => {
    setAiSynthesizedData(null);
  }, [selection]);

  // Master Prompt Assembly from selection
  const liveBuilt = useMemo(() => {
    try {
      return buildComprehensiveMasterPrompt(selection, 'txt2img');
    } catch (e) {
      return null;
    }
  }, [selection]);

  const effectivePromptData = aiSynthesizedData || liveBuilt;

  const masterPromptText = useMemo(() => {
    if (!effectivePromptData?.masterPrompt) return '';
    let p = effectivePromptData.masterPrompt;
    if (selection.referenceImage && !p.includes('--cref')) {
      p += `, --cref [Locked Face Reference: 100% exact facial likeness, bone structure, and micro-pores preserved] --cw 100`;
    }
    if (quickModifiers.length > 0) {
      p += `, ${quickModifiers.join(', ')}`;
    }
    // ensure ratio and engine are synced
    if (!p.includes('--ar')) {
      p += ` --ar ${selection.aspectRatio || '16:9'}`;
    }
    if (!p.includes('--v') && !p.includes('--flux') && !p.includes('--sdxl')) {
      p += ` ${engineSyntax}`;
    }
    return p;
  }, [effectivePromptData, quickModifiers, selection.aspectRatio, selection.referenceImage, engineSyntax]);

  const displayedPromptText = useMemo(() => {
    if (!effectivePromptData) return masterPromptText;
    const modSuffix = quickModifiers.length > 0 ? `, ${quickModifiers.join(', ')}` : '';
    switch (activeFormatTab) {
      case 'flux':
        return `${effectivePromptData.fluxFormat || masterPromptText.replace(/--\w+\s+\S+/g, '').trim()}${modSuffix}`;
      case 'midjourney':
        return `${effectivePromptData.midjourneyFormat || `/imagine prompt: ${masterPromptText}`}`;
      case 'sdxl':
        return `${effectivePromptData.sdxlFormat || masterPromptText}${modSuffix}`;
      case 'negative':
        return effectivePromptData.negativePrompt || '';
      case 'master':
      default:
        return masterPromptText;
    }
  }, [activeFormatTab, effectivePromptData, masterPromptText, quickModifiers]);

  const handleSynthesizeAiPrompt = async () => {
    setIsSynthesizingAi(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selection,
          customInstruction: selection.customInstruction || '',
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.promptData) {
          setAiSynthesizedData(data.promptData);
          if (onSavePrompt && data.promptData.masterPrompt) {
            onSavePrompt(data.promptData.masterPrompt, {
              archetype: selection.customSubjectDetails || selection.subject || 'Burmese Portrait',
              setting: selection.location || 'Heritage Setting',
              ratio: selection.aspectRatio || '16:9'
            });
          }
        }
      }
    } catch (err) {
      console.warn('AI prompt synthesis fallback to local builder:', err);
    } finally {
      setIsSynthesizingAi(false);
    }
  };

  // Token counter estimation
  const estimatedTokens = useMemo(() => {
    return Math.round(displayedPromptText.split(' ').length * 1.35);
  }, [displayedPromptText]);

  // Active Picked Option Chips (ရွေးချယ်ထားချက်များ)
  const activeOptionChips = useMemo(() => {
    const chips: Array<{
      id: string;
      labelMm: string;
      labelEn: string;
      valueEn: string;
      valueMm: string;
      emoji?: string;
    }> = [];

    // Character Persona or Subject
    const matchedChar = CHARACTER_PRESETS.find(c =>
      selection.customSubjectDetails === (isMyanmar ? c.nameMm : c.nameEn) ||
      selection.customSubjectDetails === c.nameEn ||
      selection.customSubjectDetails === c.nameMm
    );
    if (matchedChar) {
      chips.push({
        id: 'character',
        labelMm: 'ဇာတ်ကောင်',
        labelEn: 'Character',
        valueEn: matchedChar.nameEn,
        valueMm: matchedChar.nameMm,
        emoji: matchedChar.emoji
      });
    } else if (selection.subject && selection.subject !== 'skip') {
      const sub = SUBJECT_OPTIONS.find(s => s.id === selection.subject);
      chips.push({
        id: 'subject',
        labelMm: 'အမျိုးအစား',
        labelEn: 'Subject',
        valueEn: sub?.labelEn || selection.subject,
        valueMm: sub?.labelMm || selection.subject,
        emoji: sub?.emoji || '👤'
      });
    }

    // Ethnicity
    if (selection.ethnicity && selection.ethnicity !== 'skip') {
      const eth = ETHNICITY_OPTIONS.find(e => e.id === selection.ethnicity);
      chips.push({
        id: 'ethnicity',
        labelMm: 'လူမျိုး',
        labelEn: 'Ethnicity',
        valueEn: eth?.labelEn || selection.ethnicity,
        valueMm: eth?.labelMm || selection.ethnicity,
        emoji: eth?.emoji || '🇲🇲'
      });
    }

    // Garment
    if (selection.garmentStyle && selection.garmentStyle !== 'skip') {
      const g = GARMENT_OPTIONS.find(ga => ga.id === selection.garmentStyle);
      chips.push({
        id: 'garment',
        labelMm: 'ဝတ်စုံ',
        labelEn: 'Garment',
        valueEn: g?.labelEn || selection.garmentStyle,
        valueMm: g?.labelMm || selection.garmentStyle,
        emoji: g?.emoji || '👗'
      });
    }

    // Location
    if (selection.location && selection.location !== 'skip') {
      const loc = LOCATION_OPTIONS.find(l => l.id === selection.location);
      chips.push({
        id: 'location',
        labelMm: 'နောက်ခံ',
        labelEn: 'Location',
        valueEn: loc?.labelEn || selection.location,
        valueMm: loc?.labelMm || selection.location,
        emoji: loc?.emoji || '📍'
      });
    }

    // Event
    if (selection.event && selection.event !== 'skip') {
      const ev = EVENT_OPTIONS.find(e => e.id === selection.event);
      chips.push({
        id: 'event',
        labelMm: 'ပွဲတော်',
        labelEn: 'Event',
        valueEn: ev?.labelEn || selection.event,
        valueMm: ev?.labelMm || selection.event,
        emoji: ev?.emoji || '🎉'
      });
    }

    // Lighting
    if (selection.timeAndLighting && selection.timeAndLighting !== 'skip') {
      const lit = LIGHTING_OPTIONS.find(li => li.id === selection.timeAndLighting);
      chips.push({
        id: 'lighting',
        labelMm: 'အလင်း',
        labelEn: 'Lighting',
        valueEn: lit?.labelEn || selection.timeAndLighting,
        valueMm: lit?.labelMm || selection.timeAndLighting,
        emoji: lit?.emoji || '💡'
      });
    }

    // Camera
    if (selection.camera && selection.camera !== 'skip') {
      const cam = CAMERA_OPTIONS.find(c => c.id === selection.camera);
      chips.push({
        id: 'camera',
        labelMm: 'ကင်မရာ',
        labelEn: 'Camera',
        valueEn: cam?.labelEn || selection.camera,
        valueMm: cam?.labelMm || selection.camera,
        emoji: cam?.emoji || '📷'
      });
    }

    // Aspect ratio
    if (selection.aspectRatio) {
      chips.push({
        id: 'aspectRatio',
        labelMm: 'အချိုး',
        labelEn: 'Ratio',
        valueEn: selection.aspectRatio,
        valueMm: selection.aspectRatio,
        emoji: '📐'
      });
    }

    return chips;
  }, [selection, isMyanmar]);

  // Remove individual option
  const handleDeleteOption = (id: string) => {
    switch (id) {
      case 'character':
        onUpdateSelection({ customSubjectDetails: '' });
        break;
      case 'subject':
        onUpdateSelection({ subject: 'woman', customSubjectDetails: '' });
        break;
      case 'ethnicity':
        onUpdateSelection({ ethnicity: 'skip', customEthnicityDetails: '' });
        break;
      case 'garment':
        onUpdateSelection({ garmentStyle: 'skip', garmentFabric: '' });
        break;
      case 'location':
        onUpdateSelection({ location: 'skip', customLocationDetails: '' });
        break;
      case 'event':
        onUpdateSelection({ event: 'skip', customEventDetails: '' });
        break;
      case 'lighting':
        onUpdateSelection({ timeAndLighting: 'skip', customLightingDetails: '' });
        break;
      case 'camera':
        onUpdateSelection({ camera: 'skip' });
        break;
      case 'aspectRatio':
        onUpdateSelection({ aspectRatio: '16:9' });
        break;
      default:
        break;
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(displayedPromptText || masterPromptText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleCopyNegative = () => {
    const neg = effectivePromptData?.negativePrompt || "--no modern western clothing, sunglasses, plastic, wrist watch, distorted hands, extra fingers, inaccurate generic anime face, non-Burmese Chinese or Japanese traditional costumes, Indian saree, bindi, synthetic nylon fabrics, low quality render, deformed facial anatomy";
    navigator.clipboard.writeText(neg);
    setNegCopiedToast(true);
    setTimeout(() => setNegCopiedToast(false), 2000);
  };

  const handleSaveToPresets = () => {
    if (onSavePrompt) {
      onSavePrompt(displayedPromptText || masterPromptText, {
        archetype: selection.customSubjectDetails || selection.subject,
        setting: selection.location,
        ratio: selection.aspectRatio || '16:9'
      });
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleResetMatrix = () => {
    onResetAll();
    setQuickModifiers([]);
    setAiSynthesizedData(null);
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2500);
  };

  const toggleQuickModifier = (modText: string) => {
    setQuickModifiers((prev) => {
      if (prev.includes(modText)) {
        return prev.filter((m) => m !== modText);
      }
      return [...prev, modText];
    });
  };

  // Upload reference image handler
  const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSelection({
          referenceImage: reader.result as string,
          identityLock: selection.identityLock === 'no_lock' ? 'face_100' : selection.identityLock
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset location settings data
  const LOCATION_CARDS = [
    {
      id: 'cyber_yangon',
      titleEn: 'Bagan Temple Mist',
      titleMm: 'ပုဂံ သာသနာ့မြေ အရုဏ်ဦး',
      locationVal: 'bagan_temples',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'shwedagon_pagoda',
      titleEn: 'Shwedagon Blue Hour',
      titleMm: 'ရွှေတိဂုံ ညနေဆည်းဆာ',
      locationVal: 'shwedagon_pagoda',
      img: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'inle_lake',
      titleEn: 'Inle Floating Gardens',
      titleMm: 'အင်းလေးကန် ရေပေါ်ကျွန်း',
      locationVal: 'inle_lake',
      img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'ubein_bridge',
      titleEn: 'U Bein Bridge Sunset',
      titleMm: 'ဦးပိန်တံတား နေဝင်ချိန်',
      locationVal: 'mandalay_palace',
      img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'teak_monastery',
      titleEn: 'Teakwood Monastery',
      titleMm: 'ရွှေကျောင်းတော် အတွင်းခန်း',
      locationVal: 'luxury_studio',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'colonial_street',
      titleEn: 'Colonial Rangoon Street',
      titleMm: 'ရန်ကုန် ကိုလိုနီခေတ်ဟောင်း',
      locationVal: 'heritage_hotel',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex flex-col w-full">
      
      {/* 🌟 Miro-Style Unified Clean Header Bar */}
      <div className="px-5 sm:px-8 py-3.5 bg-white border-b border-[#e0e2e8] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left: Miro Canary Yellow Tag & Clean Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#1c1c1e] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffd02f] border border-[#fcb900]"></span>
            <span>Burmese Prompt Studio</span>
          </span>
          <span className="text-[#c7cad5]">/</span>
          <span className="text-[#6b6f7e] hidden sm:inline font-medium">Archival v2.5</span>
          <span className="bg-[#fff8e0] border border-[#fcb900]/30 text-[#746019] px-2.5 py-0.5 rounded-full font-bold text-[10px] hidden md:inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            <span>Bagan • Konbaung Authenticated</span>
          </span>
        </div>

        {/* Right: Miro Pill Quick Action Switchers */}
        {onNavigateView && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8e91a0] hidden lg:inline uppercase tracking-wider">
              Photo Tools:
            </span>
            <button
              type="button"
              onClick={() => onNavigateView('old-to-new')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e0e2e8] hover:border-[#1c1c1e] text-[#1c1c1e] text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:bg-[#f7f8fa]"
            >
              <span className="material-symbols-outlined text-[15px] text-[#0fbcb0]">photo_camera_back</span>
              <span>{isMyanmar ? '8K Restore' : 'Old Photo Restore'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateView('photo-edit')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e0e2e8] hover:border-[#1c1c1e] text-[#1c1c1e] text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:bg-[#f7f8fa]"
            >
              <span className="material-symbols-outlined text-[15px] text-[#4262ff]">brush</span>
              <span>{isMyanmar ? 'Inpaint' : 'Photo Edit'}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateView('prompt-utility')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e0e2e8] hover:border-[#1c1c1e] text-[#1c1c1e] text-xs font-semibold shadow-2xs transition-all cursor-pointer hover:bg-[#f7f8fa]"
            >
              <span className="material-symbols-outlined text-[15px] text-[#fcb900]">build</span>
              <span>{isMyanmar ? 'Keywords' : 'Utilities'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 🌟 Primary 2-Column Miro Canvas Studio Layout */}
      <div className="px-5 sm:px-8 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ===================================================================== */}
        {/* LEFT COLUMN: Streamlined Workbench with Miro Multi-Tab Workflow (xl:col-span-7) */}
        {/* ===================================================================== */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Miro-Style Workbench Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Visual Workspace
                </span>
                <span className="text-[#8e91a0] text-xs font-medium">Prompt Matrix</span>
              </div>
              <h1 className="font-sans text-2xl sm:text-3xl text-[#1c1c1e] font-extrabold tracking-tight">
                Burmese Prompt Matrix
              </h1>
              <p className="font-sans text-sm text-[#555a6a] mt-0.5 font-normal">
                {isMyanmar
                  ? 'ပုဂံ၊ ကုန်းဘောင်၊ နန်းတွင်းနှင့် ခေတ်ပေါ် ရုပ်ရှင်ဆန်သော မြန်မာ့ဓာတ်ပုံ Prompt အထူးပြု စနစ်'
                  : 'Archivally accurate generative parameters for royal court, ethnographic, and cinematic Myanmar portraiture.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetMatrix}
                className="px-4 py-2 bg-white border border-[#e0e2e8] hover:border-[#1c1c1e] text-[#1c1c1e] hover:bg-[#f7f8fa] rounded-full text-xs font-semibold font-sans flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Reset matrix to clean baseline"
              >
                <span className="material-symbols-outlined text-[16px] text-[#6b6f7e]">restart_alt</span>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Reset Toast Feedback */}
          {resetToast && (
            <div className="p-3 rounded-full bg-[#c3faf5] border border-[#0fbcb0]/30 text-[#187574] font-sans text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Matrix and Live Prompt successfully reset to baseline!</span>
            </div>
          )}

          {/* MIRO WORKFLOW PILL TABS BAR */}
          <div className="bg-white p-1.5 rounded-full border border-[#e0e2e8] flex flex-wrap gap-1 shadow-2xs">
            {/* Tab 1 */}
            <button
              type="button"
              onClick={() => { setActiveTab('tab-subject'); setIsViewAll(false); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-full text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tab-subject' && !isViewAll
                  ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                  : 'text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                activeTab === 'tab-subject' && !isViewAll
                  ? 'bg-[#ffd02f] text-[#1c1c1e]'
                  : 'bg-[#eef0f3] text-[#555a6a]'
              }`}>
                1
              </span>
              <div className="flex flex-col truncate">
                <span className="font-sans text-xs font-semibold leading-tight truncate">Subject</span>
                <span className={`font-sans text-[10px] truncate ${activeTab === 'tab-subject' && !isViewAll ? 'text-white/70' : 'text-[#8e91a0]'}`}>ဝတ်စုံနှင့် လူမျိုး</span>
              </div>
            </button>

            {/* Tab 2 */}
            <button
              type="button"
              onClick={() => { setActiveTab('tab-scene'); setIsViewAll(false); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-full text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tab-scene' && !isViewAll
                  ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                  : 'text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                activeTab === 'tab-scene' && !isViewAll
                  ? 'bg-[#ffd02f] text-[#1c1c1e]'
                  : 'bg-[#eef0f3] text-[#555a6a]'
              }`}>
                2
              </span>
              <div className="flex flex-col truncate">
                <span className="font-sans text-xs font-semibold leading-tight truncate">Scene</span>
                <span className={`font-sans text-[10px] truncate ${activeTab === 'tab-scene' && !isViewAll ? 'text-white/70' : 'text-[#8e91a0]'}`}>နောက်ခံနှင့် အလင်း</span>
              </div>
            </button>

            {/* Tab 3 */}
            <button
              type="button"
              onClick={() => { setActiveTab('tab-direction'); setIsViewAll(false); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-full text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tab-direction' && !isViewAll
                  ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                  : 'text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                activeTab === 'tab-direction' && !isViewAll
                  ? 'bg-[#ffd02f] text-[#1c1c1e]'
                  : 'bg-[#eef0f3] text-[#555a6a]'
              }`}>
                3
              </span>
              <div className="flex flex-col truncate">
                <span className="font-sans text-xs font-semibold leading-tight truncate">Direction</span>
                <span className={`font-sans text-[10px] truncate ${activeTab === 'tab-direction' && !isViewAll ? 'text-white/70' : 'text-[#8e91a0]'}`}>ဟန်ပန်နှင့် ကင်မရာ</span>
              </div>
            </button>

            {/* Tab 4 */}
            <button
              type="button"
              onClick={() => { setActiveTab('tab-engine'); setIsViewAll(false); }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-full text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tab-engine' && !isViewAll
                  ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                  : 'text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                activeTab === 'tab-engine' && !isViewAll
                  ? 'bg-[#ffd02f] text-[#1c1c1e]'
                  : 'bg-[#eef0f3] text-[#555a6a]'
              }`}>
                4
              </span>
              <div className="flex flex-col truncate">
                <span className="font-sans text-xs font-semibold leading-tight truncate">Engine</span>
                <span className={`font-sans text-[10px] truncate ${activeTab === 'tab-engine' && !isViewAll ? 'text-white/70' : 'text-[#8e91a0]'}`}>AI ချိန်ညှိချက်</span>
              </div>
            </button>

            {/* All Controls Button */}
            <button
              type="button"
              onClick={() => setIsViewAll(!isViewAll)}
              className={`px-3 py-2 rounded-full text-xs font-semibold font-sans flex items-center gap-1 transition-all cursor-pointer ${
                isViewAll
                  ? 'bg-[#1c1c1e] text-white shadow-xs'
                  : 'text-[#555a6a] hover:text-[#1c1c1e] hover:bg-[#f7f8fa]'
              }`}
              title="View all sections on one page"
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              <span className="hidden md:inline">All</span>
            </button>
          </div>

          {/* TAB PANES CONTAINER */}
          <div className="flex flex-col gap-6">
            
            {/* ============================================================== */}
            {/* TAB 1: SUBJECT & HERITAGE */}
            {/* ============================================================== */}
            {(activeTab === 'tab-subject' || isViewAll) && (
              <div className="flex flex-col gap-6">
                
                {/* SECTION 1: Character & Cultural Archetype (100% Myanmar Archetype Studio) */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        1
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                            Myanmar Character &amp; Cultural Archetype
                          </h2>
                          <span className="px-2 py-0.5 rounded bg-[#704112]/10 text-[#704112] font-mono text-[10px] font-bold uppercase">
                            Only Myanmar • 24 Archetypes
                          </span>
                        </div>
                        <span className="font-sans text-xs text-[#51443a]">
                          မြန်မာ့သမိုင်းဝင် နန်းတွင်း၊ တိုင်းရင်းသား ရိုးရာ၊ ဓလေ့စရိုက်နှင့် ခေတ်သစ် ဇာတ်ကောင်များ (၂၄ မျိုး)
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => toggleDrawer('characterFeature')}
                      className="px-3 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_pin</span>
                      <span>{expandedDrawers.characterFeature ? 'Hide Face Lock & Persona Cards' : 'Open Face Lock & Persona Cards (15)'}</span>
                    </button>
                  </div>

                  {/* Category Filter Tabs for 24 Myanmar Archetypes */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-sans text-[11px] text-[#847469] uppercase font-bold tracking-wider">
                        Step 1A — Select Myanmar Character Archetype (မြန်မာ့ဇာတ်ကောင် စရိုက်လက္ခဏာ ရွေးချယ်ရန်):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { id: 'all', labelEn: 'All (24)', labelMm: 'အားလုံး (၂၄)' },
                          { id: 'royal', labelEn: 'Royal & Historical (6)', labelMm: 'နန်းတွင်း/သမိုင်း (၆)' },
                          { id: 'ethnic', labelEn: 'Ethnic Heritage (8)', labelMm: 'တိုင်းရင်းသား (၈)' },
                          { id: 'folk', labelEn: 'Sacred & Folk Art (5)', labelMm: 'ရိုးရာဓလေ့/အနုပညာ (၅)' },
                          { id: 'modern', labelEn: 'Modern & Family (5)', labelMm: 'ခေတ်သစ်/မိသားစု (၅)' },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setArchetypeCategory(cat.id as any)}
                            className={`px-2.5 py-1 rounded-full font-sans text-[11px] font-semibold transition-all cursor-pointer ${
                              archetypeCategory === cat.id
                                ? 'bg-[#704112] text-white shadow-2xs'
                                : 'bg-[#f4ece9] text-[#51443a] hover:bg-[#e9e1dd]'
                            }`}
                          >
                            {isMyanmar ? cat.labelMm : cat.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 24 Myanmar-Only Archetype Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                      {[
                        // 1. ROYAL & HISTORICAL MYANMAR (6)
                        {
                          id: 'konbaung-princess',
                          code: '01',
                          cat: 'royal',
                          badge: 'KONBAUNG',
                          nameEn: 'Konbaung Royal Princess',
                          nameMm: 'ကုန်းဘောင် နန်းတွင်း မင်းသမီး',
                          descMm: 'မဟာလတ္တ နန်းဝတ်တန်ဆာနှင့် ရတနာပုံ မင်းသမီး',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'traditional_myanmar_royal',
                          promptTag: 'Konbaung Dynasty Royal Burmese Princess (Thamee-daw) with regal palace poise'
                        },
                        {
                          id: 'konbaung-prince',
                          code: '02',
                          cat: 'royal',
                          badge: 'KONBAUNG',
                          nameEn: 'Konbaung Royal Prince / General',
                          nameMm: 'ကုန်းဘောင် မင်းသား / စစ်သူကြီး',
                          descMm: 'ရွှေချည်ထိုး မင်းဝတ်တန်ဆာနှင့် ခေါင်းပေါင်းတော်',
                          subject: 'man',
                          eth: 'burmese',
                          garment: 'traditional_myanmar_royal',
                          promptTag: 'Konbaung Dynasty Royal Burmese Prince and noble commander in gilded court regalia'
                        },
                        {
                          id: 'bagan-queen',
                          code: '03',
                          cat: 'royal',
                          badge: 'BAGAN ERA',
                          nameEn: 'Bagan Dynasty Royal Lady',
                          nameMm: 'ပုဂံခေတ် တော်ဝင်မိဖုရား / မင်းသမီး',
                          descMm: 'ပုဂံခေတ် ရင်စည်းပိုးထည်နှင့် ရှေးဟောင်း ရွှေပန်းထိမ်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'bagan_royal_yinzi',
                          promptTag: '11th-century Ancient Bagan Dynasty Royal Queen with classical lotus poise'
                        },
                        {
                          id: 'yadanabon-court-maiden',
                          code: '04',
                          cat: 'royal',
                          badge: 'YADANABON',
                          nameEn: 'Yadanabon Palace Lady-in-Waiting',
                          nameMm: 'ရတနာပုံ နန်းတွင်း အပျိုတော်',
                          descMm: 'ဆံမြိတ်ချ ဆံထုံး၊ ရင်ဖုံးပိုးအင်္ကျီနှင့် လွန်းရာကျော်ချိတ်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'amarapura_luntaya_acheik',
                          promptTag: 'Mandalay Yadanabon Royal Palace court maiden with classic trailing hair tress and Luntaya Acheik silk'
                        },
                        {
                          id: 'colonial-rangoon-lady',
                          code: '05',
                          cat: 'royal',
                          badge: 'HERITAGE 1930s',
                          nameEn: 'Colonial Era Rangoon Aristocrat',
                          nameMm: 'ကိုလိုနီခေတ် ရန်ကုန် ဂုဏ်သရေရှိ အမျိုးသမီး',
                          descMm: 'ပုလဲကြယ်သီး ဇာအင်္ကျီ၊ ပိုးထဘီနှင့် စိန်နားကပ်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'colonial_rangoon_lace',
                          promptTag: '1930s Heritage Yangon aristocratic Burmese lady in sheer French lace Yin-Phone blouse and pearl buttons'
                        },
                        {
                          id: 'classical-zat-dancer',
                          code: '06',
                          cat: 'royal',
                          badge: 'CLASSICAL ART',
                          nameEn: 'Classical Myanmar Zat / Anyint Dancer',
                          nameMm: 'မြန်မာ့ရိုးရာ အငြိမ့် / ဇာတ်မင်းသမီး',
                          descMm: 'ရိုးရာ ကဗျာလွတ် အကဟန်နှင့် ရွှေချည်ထိုး ဝတ်စုံ',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'traditional_myanmar',
                          promptTag: 'Classical Burmese royal court dancer performing graceful traditional Yodaya/Anyint hand mudra'
                        },

                        // 2. MYANMAR ETHNIC HERITAGE (8)
                        {
                          id: 'kachin-manaw-maiden',
                          code: '07',
                          cat: 'ethnic',
                          badge: 'KACHIN',
                          nameEn: 'Kachin Manaw Festival Maiden',
                          nameMm: 'ကချင် မနော ရိုးရာ လှပျိုဖြူ',
                          descMm: 'ငွေမောင်း ရင်လွှမ်း ကတ္တီပါအင်္ကျီနှင့် ဂျပ်ခုတ်ထဘီ',
                          subject: 'woman',
                          eth: 'kachin',
                          garment: 'kachin_ethnic_attire',
                          promptTag: 'Kachin Jinghpaw maiden in ceremonial black velvet jacket adorned with embossed silver coin medallions'
                        },
                        {
                          id: 'kayah-kayan-lady',
                          code: '08',
                          cat: 'ethnic',
                          badge: 'KAYAH / KAYAN',
                          nameEn: 'Kayah / Kayan Brass-Coil Maiden',
                          nameMm: 'ကယား / ကယန်း (ပဒေါင်) ရိုးရာ အမျိုးသမီး',
                          descMm: 'ရွှေရောင် ကြေးကွင်းလည်ပတ်နှင့် ရိုးရာ လက်ရက်ဝတ်စုံ',
                          subject: 'woman',
                          eth: 'kayah',
                          garment: 'kayah_ethnic_attire',
                          promptTag: 'Kayan (Padaung) highland woman wearing gleaming golden brass neck coils and handwoven tribal tunic'
                        },
                        {
                          id: 'kayin-done-youth',
                          code: '09',
                          cat: 'ethnic',
                          badge: 'KAYIN',
                          nameEn: 'Kayin Done-Dance Traditional Maiden',
                          nameMm: 'ကရင် ရိုးရာ သင်တိုင်း လှပျိုဖြူ',
                          descMm: 'ကရင် လက်ရက် သင်တိုင်းဝတ်စုံနှင့် ရိုးရာ ခေါင်းပေါင်းစည်း',
                          subject: 'woman',
                          eth: 'karen',
                          garment: 'karen_ethnic_attire',
                          promptTag: 'Kayin (Karen) maiden in vibrant red-and-white handwoven Hsin-thone tunic and traditional woven sarong'
                        },
                        {
                          id: 'chin-highland-noble',
                          code: '10',
                          cat: 'ethnic',
                          badge: 'CHIN HILLS',
                          nameEn: 'Chin Highland Heritage Noble',
                          nameMm: 'ချင်း တောင်တန်း ရိုးရာ ဇာတ်ကောင်',
                          descMm: 'ချင်းရိုးရာ စိန်ကွက် ဂျပ်ခုတ်စောင်နှင့် ရိုးရာပုတီး',
                          subject: 'woman',
                          eth: 'chin',
                          garment: 'chin_ethnic_attire',
                          promptTag: 'Chin highland noblewoman draped in intricate diamond-weave handloom Chin textile shawl'
                        },
                        {
                          id: 'mon-hongsa-princess',
                          code: '11',
                          cat: 'ethnic',
                          badge: 'MON RAMANYA',
                          nameEn: 'Mon Hongsa Royal Lady',
                          nameMm: 'မွန် ဟင်္သာ တော်ဝင် အမျိုးသမီး',
                          descMm: 'မွန်ရိုးရာ အနီရောင် အကွက်စိပ်ထဘီနှင့် အဖြူရောင် ဇာအင်္ကျီ',
                          subject: 'woman',
                          eth: 'mon',
                          garment: 'mon_ethnic_attire',
                          promptTag: 'Mon (Ramanya) noblewoman in traditional crimson checkered silk longyi, white lace bodice, and golden Hongsa brooch'
                        },
                        {
                          id: 'rakhine-mrauk-u-noble',
                          code: '12',
                          cat: 'ethnic',
                          badge: 'RAKHINE',
                          nameEn: 'Rakhine Mrauk-U Royal Noble',
                          nameMm: 'ရခိုင် မြောက်ဦး တော်ဝင် ဇာတ်ကောင်',
                          descMm: 'မြောက်ဦးခေတ် ရွှေချည်ထိုး ပိုးထည်နှင့် ဒလီဇန် လည်ဆွဲ',
                          subject: 'woman',
                          eth: 'rakhine',
                          garment: 'rakhine_ethnic_attire',
                          promptTag: 'Rakhine (Arakanese) Mrauk-U royal lady wearing gold-threaded silk longyi and antique Arakanese filigree necklace'
                        },
                        {
                          id: 'shan-sawbwa-princess',
                          code: '13',
                          cat: 'ethnic',
                          badge: 'SHAN STATE',
                          nameEn: 'Shan Royal Sawbwa Princess',
                          nameMm: 'ရှမ်း စော်ဘွား တော်ဝင်မင်းသမီး',
                          descMm: 'ရှမ်းရိုးရာ ပိုးဖဲကော်ဇောအဆင် ဝတ်စုံနှင့် ငွေခါးပတ်',
                          subject: 'woman',
                          eth: 'shan',
                          garment: 'shan_ethnic_attire',
                          promptTag: 'Shan royal Sawbwa princess wearing pastel silk brocade cross-collar jacket and silver waist ornament'
                        },
                        {
                          id: 'pao-turban-maiden',
                          code: '14',
                          cat: 'ethnic',
                          badge: 'PA-O HIGHLAND',
                          nameEn: 'Pa-O Dragon-Turban Maiden',
                          nameMm: 'ပအိုဝ်း ရိုးရာ ပဝါအနီ လှပျိုဖြူ',
                          descMm: 'ပအိုဝ်း အနက်ရောင် ရိုးရာဝတ်စုံ၊ လိမ္မော်/အနီ ခေါင်းပေါင်းနှင့် ရွှေဆံထိုး',
                          subject: 'woman',
                          eth: 'pao',
                          garment: 'shan_ethnic_attire',
                          promptTag: 'Pa-O highland maiden wearing traditional indigo-black jacket, vibrant orange-red dragon turban headband, and gold hairpins'
                        },

                        // 3. SACRED, FOLK & ARTISAN MYANMAR (5)
                        {
                          id: 'shwedagon-pilgrim',
                          code: '15',
                          cat: 'folk',
                          badge: 'DEVOTEE',
                          nameEn: 'Shwedagon Pagoda Pilgrim Devotee',
                          nameMm: 'ဘုရားဖူး ကုသိုလ်ရှင် (ရွှေတိဂုံ/ပုဂံ)',
                          descMm: 'ယဉ်ကျေးသိမ်မွေ့သော မြန်မာ့ပိုးဝတ်စုံနှင့် ကြာပန်းကပ်လှူဟန်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'amarapura_silk',
                          promptTag: 'Serene Burmese Buddhist devotee in modest pure silk attire holding fresh lotus blossoms in prayer'
                        },
                        {
                          id: 'inle-lotus-artisan',
                          code: '16',
                          cat: 'folk',
                          badge: 'INLE INTHA',
                          nameEn: 'Inle Lake Intha Lotus Silk Artisan',
                          nameMm: 'အင်းလေး အင်းသား ကြာချည်ပိုး ပညာရှင်',
                          descMm: 'အင်းလေး ရိုးရာ ကြာချည်ပိုးဝတ်စုံနှင့် ကန်ရေပြင် ဓလေ့',
                          subject: 'woman',
                          eth: 'intha',
                          garment: 'inle_lotus_silk_attire',
                          promptTag: 'Intha artisan from Inle Lake wearing rare hand-spun sacred lotus fiber tunic and raw silk longyi'
                        },
                        {
                          id: 'shinbyu-royal-novice',
                          code: '17',
                          cat: 'folk',
                          badge: 'SHINBYU',
                          nameEn: 'Shinbyu Royal Novice / Ear-Boring',
                          nameMm: 'ရှင်ပြု မောင်ရှင်လောင်း / နားသမင်္ဂလာ',
                          descMm: 'မင်းသား/မင်းသမီး ဝတ်စုံတော်၊ ရွှေထီးနှင့် သနပ်ခါး',
                          subject: 'child',
                          eth: 'burmese',
                          garment: 'traditional_myanmar_royal',
                          promptTag: 'Burmese child dressed as a royal prince/princess for sacred Shinbyu novitiation ceremony with golden crown and Thanaka'
                        },
                        {
                          id: 'amarapura-silk-weaver',
                          code: '18',
                          cat: 'folk',
                          badge: 'CRAFTSMAN',
                          nameEn: 'Amarapura Master Silk Weaver',
                          nameMm: 'အမရပူရ လွန်းရာကျော် ပိုးချိတ် ပညာရှင်',
                          descMm: 'ရိုးရာ ရက်ကန်းစင်နှင့် လွန်းရာကျော် ပိုးချိတ် အနုပညာရှင်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'amarapura_luntaya_acheik',
                          promptTag: 'Master Burmese silk weaver in Amarapura wearing traditional handwoven Acheik longyi and natural Thanaka'
                        },
                        {
                          id: 'upper-myanmar-villager',
                          code: '19',
                          cat: 'folk',
                          badge: 'ANYAR FOLK',
                          nameEn: 'Upper Myanmar Anyar Heritage Belle',
                          nameMm: 'အညာဒေသ ရိုးရာ သနပ်ခါး လှပျိုဖြူ',
                          descMm: 'သနပ်ခါး ပါးကွက်ထူထူ၊ ချည်ထည် လက်ရက်နှင့် ပုသိမ်ထီး',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'traditional_myanmar',
                          promptTag: 'Authentic Upper Myanmar (Anyar) young woman with circular Kyauk Pyin Thanaka cheek swirls and handwoven cotton longyi'
                        },

                        // 4. MODERN, EDITORIAL & FAMILY MYANMAR (5)
                        {
                          id: 'mandalay-couture-model',
                          code: '20',
                          cat: 'modern',
                          badge: 'COUTURE',
                          nameEn: 'Mandalay Silk Couture Model',
                          nameMm: 'မန္တလေး အဆင့်မြင့် ပိုးထည် ဖက်ရှင်မော်ဒယ်',
                          descMm: 'ခေတ်မီ ပိုးရင်ဖုံးဒီဇိုင်းနှင့် မဂ္ဂဇင်း အဆင့်မြင့် ဖက်ရှင်',
                          subject: 'woman',
                          eth: 'burmese',
                          garment: 'modern_silk_yin_phone',
                          promptTag: 'High-fashion Burmese editorial model wearing sculpted contemporary silk Yin-Phone and Luntaya Acheik couture'
                        },
                        {
                          id: 'burmese-gentleman',
                          code: '21',
                          cat: 'modern',
                          badge: 'GENTLEMAN',
                          nameEn: 'Distinguished Burmese Gentleman',
                          nameMm: 'မြန်မာ့ ဂုဏ်သရေရှိ အမျိုးသား (တိုက်ပုံနှင့် ပုဆိုး)',
                          descMm: 'ပိုးတိုက်ပုံ၊ အမရပူရ ပိုးပုဆိုးနှင့် ခန့်ညားသော ဟန်ပန်',
                          subject: 'man',
                          eth: 'burmese',
                          garment: 'myanmar_taingmathea',
                          promptTag: 'Distinguished Burmese gentleman in tailored cream silk Taikpon jacket and handwoven Acheik silk Paso'
                        },
                        {
                          id: 'myanmar-bridal-couple',
                          code: '22',
                          cat: 'modern',
                          badge: 'ROYAL WEDDING',
                          nameEn: 'Royal Myanmar Bridal Couple',
                          nameMm: 'မြန်မာ့ရိုးရာ မင်္ဂလာ မောင်နှံ စုံတွဲ',
                          descMm: 'ရွှေချည်ထိုး ထိုင်မသိမ်း သတို့သမီးနှင့် ခေါင်းပေါင်း သတို့သား',
                          subject: 'couple',
                          eth: 'burmese',
                          garment: 'myanmar_bridal_gold',
                          promptTag: 'Royal Myanmar wedding couple (Burmese groom in silk Taikpon and Gaung Baung with Burmese bride in gold-embroidered Htaingmathein and Acheik train)'
                        },
                        {
                          id: 'venerable-myanmar-elder',
                          code: '23',
                          cat: 'modern',
                          badge: 'ELDER DIGNITY',
                          nameEn: 'Venerable Burmese Elder',
                          nameMm: 'ကျက်သရေရှိသော မြန်မာ့ သက်ကြီး ဘိုးဘွား',
                          descMm: 'တည်ကြည်အေးချမ်းသော အပြုံး၊ ပိုးပုဝါနှင့် ပုတီးစိပ်ဟန်',
                          subject: 'elderly',
                          eth: 'burmese',
                          garment: 'myanmar_taingmathea',
                          promptTag: 'Venerable dignified Burmese elder with silver hair, serene wise smile, wearing traditional silk attire and teakwood prayer beads'
                        },
                        {
                          id: 'burmese-thanaka-child',
                          code: '24',
                          cat: 'modern',
                          badge: 'YOUTH / CHILD',
                          nameEn: 'Burmese Thanaka Child Portrait',
                          nameMm: 'မြန်မာ့ သနပ်ခါး ပါးကွက်ကြား ကလေးငယ်',
                          descMm: 'သနပ်ခါး ပါးကွက်ဝိုင်းဝိုင်းနှင့် ချစ်စဖွယ် မြန်မာကလေးငယ်',
                          subject: 'child',
                          eth: 'burmese',
                          garment: 'traditional_myanmar',
                          promptTag: 'Adorable Burmese child with traditional circular Thanaka paste on cheeks and festive Burmese silk outfit'
                        }
                      ]
                        .filter((arch) => archetypeCategory === 'all' || arch.cat === archetypeCategory)
                        .map((arch) => {
                          const isSelected =
                            selection.customSubjectDetails === arch.promptTag ||
                            selection.customSubjectDetails === arch.nameEn;
                          return (
                            <button
                              key={arch.id}
                              type="button"
                              onClick={() =>
                                onUpdateSelection({
                                  subject: arch.subject,
                                  ethnicity: arch.eth,
                                  garmentStyle: arch.garment,
                                  customSubjectDetails: arch.promptTag
                                })
                              }
                              className={`p-3 rounded-xl text-left transition-all relative flex flex-col items-start gap-1 cursor-pointer ${
                                isSelected
                                  ? 'border-2 border-[#704112] bg-[#fff8ec] text-[#1e1b19] shadow-xs'
                                  : 'border border-[#d6c3b6]/40 bg-[#faf2ee] text-[#1e1b19] hover:border-[#847469] hover:bg-[#f4ece9]'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                                      isSelected
                                        ? 'bg-[#704112] text-white'
                                        : 'bg-white border border-[#d6c3b6]/60 text-[#704112]'
                                    }`}
                                  >
                                    {arch.code}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded bg-[#e9e1dd]/70 text-[#51443a] font-mono text-[9px] font-bold uppercase tracking-wider truncate">
                                    {arch.badge}
                                  </span>
                                </div>
                                <span
                                  className={`material-symbols-outlined text-[17px] shrink-0 ${
                                    isSelected ? 'text-[#704112]' : 'text-[#847469]/40'
                                  }`}
                                >
                                  {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                              </div>
                              <span
                                className={`font-sans text-xs font-bold leading-snug mt-0.5 ${
                                  isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'
                                }`}
                              >
                                {arch.nameMm}
                              </span>
                              <span className="font-sans text-[11px] font-medium text-[#51443a] leading-tight">
                                {arch.nameEn}
                              </span>
                              <span className="font-sans text-[10px] text-[#847469] line-clamp-1">
                                {arch.descMm}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* HIGGSFIELD CHARACTER FEATURE DRAWER (15 Myanmar Character Presets, Face Upload & Identity Lock) */}
                  {expandedDrawers.characterFeature && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/30">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#704112] text-[20px]">person_pin</span>
                          <h3 className="font-sans text-sm font-bold text-[#704112]">
                            Visual Myanmar Persona Gallery (15 Cards) &amp; 100% Face Identity Lock
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-[#51443a]">
                          Myanmar Portrait Studio
                        </span>
                      </div>

                      {/* Character Presets Carousel Grid (All 15 Myanmar Personas) */}
                      <div className="space-y-2">
                        <span className="font-sans text-xs text-[#51443a] uppercase font-bold tracking-wider">
                          Visual Myanmar Persona Cards (ပုံပါ မြန်မာ့ဇာတ်ကောင် ၁၅ မျိုးမှ တိုက်ရိုက်ရွေးပါ):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto pr-1">
                          {CHARACTER_PRESETS.map((char, idx) => {
                            const isSelected =
                              selection.customSubjectDetails === (isMyanmar ? char.nameMm : char.nameEn) ||
                              selection.customSubjectDetails === char.nameEn ||
                              selection.customSubjectDetails === char.description;
                            return (
                              <button
                                key={char.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    onUpdateSelection({ customSubjectDetails: '', garmentStyle: 'skip' });
                                  } else {
                                    onUpdateSelection({
                                      subject: char.subject,
                                      ethnicity: char.ethnicity,
                                      poseExpression: char.poseExpression,
                                      garmentStyle: char.garmentStyle,
                                      customSubjectDetails: char.description
                                    });
                                  }
                                }}
                                className={`rounded-xl overflow-hidden border text-left flex flex-col transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#704112] ring-2 ring-[#704112] bg-white shadow-sm'
                                    : 'border-[#d6c3b6]/40 bg-white hover:border-[#847469]'
                                }`}
                              >
                                <div className="h-20 w-full bg-[#f4ece9] relative overflow-hidden">
                                  <img src={char.previewUrl} alt={char.nameEn} className="w-full h-full object-cover" />
                                  <span className="absolute top-1.5 left-1.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/65 text-white">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  {isSelected && (
                                    <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[16px] text-[#704112] bg-white rounded-full">
                                      check_circle
                                    </span>
                                  )}
                                </div>
                                <div className="p-2">
                                  <span className="font-sans text-xs font-bold text-[#1e1b19] block truncate">
                                    {char.nameMm}
                                  </span>
                                  <span className="font-sans text-[10px] text-[#704112] font-medium block truncate">
                                    {char.nameEn}
                                  </span>
                                  <span className="font-sans text-[10px] text-[#51443a] block truncate">
                                    {char.taglineMm}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Face Reference Uploader & Identity Lock Mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleReferenceImageUpload}
                            className="hidden"
                          />
                          {selection.referenceImage ? (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#704112]/50">
                              <img src={selection.referenceImage} alt="Ref" className="w-14 h-14 object-cover rounded-md border" />
                              <div className="flex flex-col gap-1">
                                <span className="font-sans text-xs font-bold text-[#704112]">
                                  ✓ Face Reference Loaded
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateSelection({ referenceImage: null, identityLock: 'no_lock' })}
                                  className="text-[11px] text-[#ba1a1a] font-semibold text-left"
                                >
                                  Remove Photo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full p-3.5 rounded-lg border-2 border-dashed border-[#d6c3b6] hover:border-[#704112] bg-white flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <span className="material-symbols-outlined text-[24px] text-[#847469]">add_a_photo</span>
                              <span className="font-sans text-xs font-semibold text-[#1e1b19]">
                                Upload Character Face Reference Image
                              </span>
                              <span className="font-sans text-[11px] text-[#51443a]">
                                Preserves 100% exact facial structure &amp; identity
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Identity Lock Mode */}
                        <div className="flex flex-col gap-1.5">
                          <span className="font-sans text-xs text-[#51443a] font-bold">
                            Identity Lock Engine:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5">
                            {IDENTITY_LOCK_OPTIONS.map((lock) => {
                              const isSelected = (selection.identityLock || 'face_100') === lock.id;
                              return (
                                <button
                                  key={lock.id}
                                  type="button"
                                  onClick={() => onUpdateSelection({ identityLock: lock.id })}
                                  className={`p-2 rounded-lg text-left text-xs font-sans transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#704112] text-white font-semibold'
                                      : 'bg-white border border-[#d6c3b6]/40 text-[#51443a] hover:bg-[#eee7e3]'
                                  }`}
                                >
                                  <span>{isMyanmar ? lock.labelMm : lock.labelEn}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Subject Preserve Feature Box */}
                      <SubjectPreserveFeatureBox
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                        isMyanmar={isMyanmar}
                      />

                      {/* Couple & Wedding Customizer if subject === 'couple' */}
                      {selection.subject === 'couple' && (
                        <div className="space-y-3 pt-2">
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
                      )}
                    </div>
                  )}

                  {/* Step 1B: Myanmar-Only Ethnic Groups Selector (တိုင်းရင်းသားမျိုးနွယ်စု ၁၄ မျိုး) */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-[11px] text-[#847469] uppercase tracking-wider font-bold">
                        Step 1B — Myanmar Ethnic Heritage (မြန်မာ့ တိုင်းရင်းသားမျိုးနွယ်စု ၁၄ မျိုး):
                      </label>
                      <span className="font-mono text-[10px] text-[#704112] font-semibold">
                        100% Myanmar Ethnicities Only
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ETHNICITY_OPTIONS.filter((e) => e.id !== 'skip').map((eth) => {
                        const isSelected = (selection.ethnicity || 'burmese') === eth.id;
                        return (
                          <button
                            key={eth.id}
                            type="button"
                            onClick={() => onUpdateSelection({ ethnicity: isSelected ? 'burmese' : eth.id })}
                            className={`px-3 py-1.5 rounded-lg font-sans text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#704112] text-white font-semibold border border-[#704112] shadow-2xs'
                                : 'bg-[#f4ece9] border border-[#d6c3b6]/40 text-[#51443a] hover:border-[#847469] hover:bg-[#eee7e3]'
                            }`}
                          >
                            <span>{isMyanmar ? eth.labelMm : eth.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 1C: Age Group & Myanmar Complexion / Facial Structure Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Age Group Pills */}
                    <div className="bg-[#faf2ee] p-3.5 rounded-xl border border-[#d6c3b6]/40 flex flex-col gap-2">
                      <span className="font-sans text-[11px] text-[#704112] uppercase font-bold tracking-wider">
                        Step 1C — Age Group (အသက်အရွယ် အပိုင်းအခြား):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: '8-12', labelMm: 'ကလေး (၈-၁၂ နှစ်)', labelEn: 'Child (8-12 yrs)' },
                          { id: '18_25', labelMm: 'လူငယ် (၁၈-၂၅ နှစ်)', labelEn: 'Youth (18-25 yrs)' },
                          { id: '26_35', labelMm: 'လူလတ် (၂၆-၃၅ နှစ်)', labelEn: 'Prime Adult (26-35)' },
                          { id: '36_45', labelMm: 'ဂုဏ်သရေရှိ (၃၆-၄၅ နှစ်)', labelEn: 'Mature (36-45 yrs)' },
                          { id: 'over_65', labelMm: 'သက်ကြီးဘိုးဘွား (၆၀+)', labelEn: 'Elder (60+ yrs)' },
                        ].map((age) => {
                          const active = (selection.ageRange || '18_25') === age.id;
                          return (
                            <button
                              key={age.id}
                              type="button"
                              onClick={() => onUpdateSelection({ ageRange: age.id })}
                              className={`px-2.5 py-1 rounded-md font-sans text-xs transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#704112] text-white font-semibold'
                                  : 'bg-white border border-[#d6c3b6]/50 text-[#51443a] hover:bg-[#eee7e3]'
                              }`}
                            >
                              {isMyanmar ? age.labelMm : age.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Myanmar Skin Tone & Facial Bone Structure Presets */}
                    <div className="bg-[#faf2ee] p-3.5 rounded-xl border border-[#d6c3b6]/40 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-[11px] text-[#704112] uppercase font-bold tracking-wider">
                          Step 1D — Myanmar Skin &amp; Facial Tone (မြန်မာ့အသားအရောင်):
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          {
                            id: 'shwe_o_honey',
                            labelMm: 'ရွှေအိုရောင် အသားညိုချော',
                            labelEn: 'Golden Honey Olive',
                            promptVal: 'warm golden honey-olive Burmese complexion, natural epidermal micro-pores, gentle dark amber eyes'
                          },
                          {
                            id: 'ivory_thanaka',
                            labelMm: 'ဝင်းဝါစိုပြည် အသားဖြူဝင်း',
                            labelEn: 'Luminous Ivory Glow',
                            promptVal: 'luminous warm ivory Burmese complexion with dewy Thanaka radiance and delicate facial bone structure'
                          },
                          {
                            id: 'highland_rosy',
                            labelMm: 'တောင်ပေါ် အသားဖြူသွေးရောင်',
                            labelEn: 'Highland Rosy Fair',
                            promptVal: 'fair rosy-ivory Myanmar highland complexion with refined cheekbones and clear radiant skin'
                          },
                          {
                            id: 'anyar_bronze',
                            labelMm: 'အညာ သဘာဝ အသားညိုဝင်း',
                            labelEn: 'Sunlit Bronze Tan',
                            promptVal: 'rich sunlit bronze-golden Upper Myanmar complexion with authentic natural skin texture and expressive eyes'
                          }
                        ].map((skin) => {
                          const active =
                            selection.customEthnicityDetails === skin.promptVal ||
                            (!selection.customEthnicityDetails && skin.id === 'shwe_o_honey');
                          return (
                            <button
                              key={skin.id}
                              type="button"
                              onClick={() => onUpdateSelection({ customEthnicityDetails: skin.promptVal })}
                              className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#704112] text-white font-semibold'
                                  : 'bg-white border border-[#d6c3b6]/50 text-[#1e1b19] hover:bg-[#eee7e3]'
                              }`}
                            >
                              <span className="font-sans text-[11px] block leading-tight font-bold">
                                {skin.labelMm}
                              </span>
                              <span className={`font-sans text-[10px] block ${active ? 'text-white/80' : 'text-[#51443a]'}`}>
                                {skin.labelEn}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: Traditional Dress & Textile Heritage (Clothes & Silk Browser) */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        2
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Traditional Dress &amp; Textile Heritage (Clothes Style Browser)
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ရိုးရာဝတ်စုံ၊ တိုင်းရင်းသားဝတ်စုံ၊ အရောင်နှင့် ပိုးချိတ်အသား ရွေးချယ်မှု (၃၈ မျိုး)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => toggleDrawer('garmentCatalog')}
                        className="px-3 py-1 rounded-full bg-[#704112] text-white font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#5a330d] transition-colors shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">checkroom</span>
                        <span>
                          {expandedDrawers.garmentCatalog
                            ? 'Hide Clothes Browser'
                            : 'Open Clothes & Silk Browser (38 Styles)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDrawer('clothesSwapTools')}
                        className="px-3 py-1 rounded-full bg-[#ffdf98]/60 text-[#5a4300] border border-[#775a00]/25 font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#ffdf98] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                        <span>
                          {expandedDrawers.clothesSwapTools
                            ? 'Hide Clothes Swap Upload'
                            : 'Custom Outfit Upload & Swap'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Heritage Archetype Picks (1-Click Featured Burmese Silhouettes) */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[11px] text-[#847469] uppercase font-bold tracking-wider">
                      Quick Royal &amp; Ethnic Archetypes (အမြန်ရွေးရန် အဓိက မြန်မာ့ရိုးရာ ဝတ်စုံများ):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        { id: 'traditional_myanmar', code: '01', titleEn: 'Mandalay Acheik Silk', titleMm: 'မန္တလေး လွန်းရာကျော် ပိုးချိတ်' },
                        { id: 'traditional_myanmar_royal', code: '02', titleEn: 'Konbaung Royal Court', titleMm: 'ကုန်းဘောင် နန်းတွင်းဝတ်စုံ' },
                        { id: 'bagan_royal_yinzi', code: '03', titleEn: 'Bagan Silk Yinzi', titleMm: 'ပုဂံခေတ် ရင်စည်း ပိုးထဘီ' },
                        { id: 'myanmar_bridal_gold', code: '04', titleEn: 'Royal Bridal Gold', titleMm: 'မြန်မာ့ သတို့သမီး ရွှေချည်ထိုး' },
                        { id: 'inle_lotus_silk_attire', code: '05', titleEn: 'Inle Lotus Silk', titleMm: 'အင်းလေး ကြာချည် ပိုးဝတ်စုံ' },
                        { id: 'kachin_ethnic_attire', code: '06', titleEn: 'Kachin Silver & Wool', titleMm: 'ကချင် ငွေမောင်း ရိုးရာဝတ်စုံ' },
                        { id: 'shan_ethnic_attire', code: '07', titleEn: 'Shan Royal Brocade', titleMm: 'ရှမ်းရိုးရာ ပိုးဖဲဝတ်စုံ' },
                        { id: 'myanmar_taingmathea', code: '08', titleEn: 'Taikpon & Acheik Paso', titleMm: 'တိုက်ပုံ၊ ပိုးပုဆိုးနှင့် ခေါင်းပေါင်း' },
                      ].map((item) => {
                        const active = selection.garmentStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onUpdateSelection({ garmentStyle: item.id })}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#fff8ec] border-[#704112] ring-1 ring-[#704112]/40 shadow-2xs'
                                : 'bg-[#faf2ee] border-[#d6c3b6]/40 hover:bg-[#f4ece9]'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                              active
                                ? 'bg-[#704112] text-white'
                                : 'bg-white border border-[#d6c3b6]/60 text-[#704112]'
                            }`}>
                              {item.code}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-xs text-[#1e1b19] font-bold truncate">
                                {item.titleMm}
                              </p>
                              <p className="font-sans text-[10px] text-[#51443a] truncate">
                                {item.titleEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FULL CLOTHES, COLOR PALETTE & SILK WEAVE STYLE BROWSER (OPEN BY DEFAULT) */}
                  {expandedDrawers.garmentCatalog && (
                    <div className="animate-in fade-in">
                      <GarmentSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}

                  {/* OPTIONAL CLOTHES SWAP & CUSTOM GARMENT IMAGE UPLOADER */}
                  {expandedDrawers.clothesSwapTools && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/60 space-y-4 animate-in fade-in">
                      <ClothesSwapPanel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                      <CustomGarmentUploader
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

                {/* SECTION 3: Thanaka, Royal Coiffure & Cultural Jewelry Browser */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        3
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Thanaka, Royal Coiffure &amp; Cultural Jewelry Browser
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          သနပ်ခါး လိမ်းခြယ်မှု၊ ဆံထုံးပန်းအလှ နှင့် နန်းတွင်း လက်ဝတ်ရတနာ ဘရောက်ဇာ (၄၆ မျိုး)
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      Jewelry, Hair &amp; Thanaka Studio
                    </span>
                  </div>

                  {/* Step 3A: Thanaka & Burmese Beauty Application Bar */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[11px] text-[#847469] uppercase font-bold tracking-wider">
                      Step 3A — Thanaka &amp; Burmese Cosmetics Application (သနပ်ခါး နှင့် မိတ်ကပ် စတိုင်):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {[
                        {
                          id: 'traditional_myanmar',
                          icon: 'spa',
                          titleEn: 'Circular Kyauk Pyin Swirl',
                          titleMm: 'သနပ်ခါး ပါးကွက် ဘီးကျဲ',
                          desc: 'Organic pale-gold Thanaka swirl on cheeks',
                        },
                        {
                          id: 'minimalist_natural',
                          icon: 'eco',
                          titleEn: 'Leaf Stencil Motif',
                          titleMm: 'သနပ်ခါး သစ်ရွက်ပုံ ဒီဇိုင်း',
                          desc: 'Delicate botanical leaf Thanaka artwork',
                        },
                        {
                          id: 'glamour_editorial',
                          icon: 'flare',
                          titleEn: 'Sheer Sun-Veil Dusted',
                          titleMm: 'သနပ်ခါး ပါးပါးကြည် မိတ်ကပ်',
                          desc: 'Translucent golden Thanaka powder glow',
                        },
                        {
                          id: 'traditional_myanmar_makeup',
                          icon: 'face_retouching_natural',
                          titleEn: 'Royal Myanmar Bridal Glam',
                          titleMm: 'ရိုးရာ မင်္ဂလာ မိတ်ကပ်အလှ',
                          desc: 'Classic Burmese bridal glow & ruby lips',
                        },
                      ].map((item) => {
                        const active = (selection.makeup || 'traditional_myanmar') === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onUpdateSelection({ makeup: item.id })}
                            className={`flex items-start gap-2.5 p-3 rounded-xl text-left border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#fff8ec] border-[#704112] ring-1 ring-[#704112]/40 shadow-2xs'
                                : 'bg-[#faf2ee] border-[#d6c3b6]/40 hover:bg-[#f4ece9]'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              active
                                ? 'bg-[#704112] text-white'
                                : 'bg-white border border-[#d6c3b6]/50 text-[#704112]'
                            }`}>
                              <span className="material-symbols-outlined text-[18px]">
                                {item.icon}
                              </span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-sans text-xs text-[#1e1b19] font-bold leading-snug">
                                {item.titleMm}
                              </p>
                              <p className="font-sans text-[10px] text-[#704112] font-medium">
                                {item.titleEn}
                              </p>
                              <p className="font-sans text-[10px] text-[#51443a] mt-0.5 line-clamp-1">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3B: Full-Width Royal Jewelry, Hair Coiffure & Cultural Props Style Browser */}
                  <div className="flex flex-col gap-2">
                    <span className="font-sans text-[11px] text-[#847469] uppercase font-bold tracking-wider">
                      Step 3B — Browse Royal Jewelry, Hair Coiffure &amp; Cultural Accessories (ရတနာ၊ ဆံထုံးနှင့် ရိုးရာအသုံးအဆောင် ဘရောက်ဇာ):
                    </span>
                    <CulturalPropsDropdown
                      language={language}
                      selection={selection}
                      onUpdateSelection={onUpdateSelection}
                    />
                  </div>
                </section>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: SCENE & AMBIANCE */}
            {/* ============================================================== */}
            {(activeTab === 'tab-scene' || isViewAll) && (
              <div className="flex flex-col gap-6">
                
                {/* SECTION 4: Background Setting & Environment */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        4
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Background Setting &amp; Environment
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          နောက်ခံ သဘာဝနှင့် သမိုင်းဝင်နေရာများ
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onNavigateView && (
                        <button
                          type="button"
                          onClick={() => onNavigateView('composite-harmonizer')}
                          className="px-2.5 py-1 rounded-full bg-[#fff8e0] text-[#746019] border border-[#fcb900]/40 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffe082] transition-colors"
                          title="Open Background Changer Studio with 24+ Presets & Contact Shadows"
                        >
                          <span className="material-symbols-outlined text-[16px]">wallpaper</span>
                          <span>{isMyanmar ? 'နောက်ခံလဲလှယ်ခန်း (Presets)' : 'Background Changer (Presets)'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDrawer('locationCatalog')}
                        className="px-2.5 py-1 rounded-full bg-[#bcedda]/50 text-[#214f41] border border-[#275546]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#bcedda]"
                      >
                        <span className="material-symbols-outlined text-[16px]">map</span>
                        <span>{expandedDrawers.locationCatalog ? 'Hide 36 Locations' : 'Browse 36 Locations'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Landmark Visual Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LOCATION_CARDS.map((loc) => {
                      const isSelected = selection.location === loc.locationVal;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => onUpdateSelection({ location: loc.locationVal })}
                          className={`p-2.5 rounded-lg text-left transition-all flex flex-col gap-2 relative cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#704112] bg-[#704112]/5 shadow-xs'
                              : 'border border-[#d6c3b6]/40 bg-[#faf2ee] hover:border-[#847469] hover:bg-[#f4ece9]'
                          }`}
                        >
                          <div
                            className="h-24 w-full rounded bg-cover bg-center overflow-hidden shadow-inner"
                            style={{ backgroundImage: `url(${loc.img})` }}
                          />
                          <div className="flex items-start justify-between w-full">
                            <div>
                              <span className={`font-sans text-sm font-semibold block leading-tight ${isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'}`}>
                                {loc.titleEn}
                              </span>
                              <span className="font-sans text-xs text-[#51443a]">
                                {loc.titleMm}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[#704112] text-[18px]">
                                check_circle
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 🌟 36 LOCATIONS CAROUSEL DRAWER */}
                  {expandedDrawers.locationCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <LocationSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}

                  {/* Festivals & Events Section */}
                  <div className="pt-2 border-t border-[#d6c3b6]/30">
                    <div className="flex items-center justify-between pb-2">
                      <span className="font-sans text-xs text-[#847469] uppercase font-bold">
                        Festivals &amp; Cultural Events (ပွဲတော်များနှင့် အခမ်းအနားများ)
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleDrawer('eventCatalog')}
                        className="text-xs text-[#704112] font-semibold hover:underline"
                      >
                        {expandedDrawers.eventCatalog ? 'Close 30 Events' : 'Browse 30 Festivals'}
                      </button>
                    </div>
                    {expandedDrawers.eventCatalog && (
                      <EventSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    )}
                  </div>
                </section>

                {/* SECTION 5: Era & Historical Period */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        5
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Era &amp; Historical Period
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ခေတ်ကာလ အချိန်စနစ်
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#f4ece9] text-[#51443a] font-sans text-xs px-2.5 py-0.5 rounded-full">
                      Temporal Tuning
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'bagan', titleEn: 'Bagan Kingdom', time: '11th-13th Century', titleMm: 'ပုဂံခေတ် ရာစုနှစ်များ' },
                      { id: 'inwa', titleEn: 'Inwa & Taungoo', time: '15th-17th Century', titleMm: 'အင်းဝနှင့် တောင်ငူခေတ်' },
                      { id: 'konbaung', titleEn: 'Konbaung Dynasty', time: 'Late 18th-19th Century', titleMm: 'ကုန်းဘောင်ခေတ် ရတနာပုံ' },
                      { id: 'colonial', titleEn: 'Colonial Rangoon', time: '1920s-1940s', titleMm: 'ကိုလိုနီ ခေတ်လယ်' },
                      { id: 'retro', titleEn: 'Retro Yangon', time: '1970s Vintage', titleMm: '၁၉၇၀ ခုနှစ်များ' },
                      { id: 'haute-couture', titleEn: 'Haute Couture', time: 'Contemporary High Fashion', titleMm: 'ခေတ်သစ် အဆင့်မြင့်ဖက်ရှင်' }
                    ].map((item) => {
                      const isSelected = (selection.weddingEra || 'bagan') === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onUpdateSelection({ weddingEra: item.id })}
                          className={`p-3 rounded-lg text-left transition-all flex flex-col gap-0.5 cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#704112] bg-[#704112]/5 shadow-xs'
                              : 'border border-[#d6c3b6]/40 bg-[#faf2ee] hover:border-[#847469] hover:bg-[#f4ece9]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-sans text-sm font-semibold ${isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'}`}>
                              {item.titleEn}
                            </span>
                            <span className={`material-symbols-outlined text-[16px] ${isSelected ? 'text-[#704112]' : 'text-[#847469]/30'}`}>
                              {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </div>
                          <span className="font-sans text-xs text-[#51443a]">{item.time}</span>
                          <span className="font-sans text-[11px] text-[#847469]">{item.titleMm}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* SECTION 6: Atmospheric Lighting & Chiaroscuro */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        6
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Atmospheric Lighting &amp; Chiaroscuro
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          အလင်းရောင် အထားအသို
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('lightingCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                      <span>{expandedDrawers.lightingCatalog ? 'Hide 30 Lights' : 'Browse 30 Lights & Moods'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'golden_hour_sunset', titleEn: 'Pagoda Dawn Mist', titleMm: 'မနက်ခင်းမြူနှင်း အလင်း' },
                      { id: '1000_oil_lamps', titleEn: '1,000 Oil Lamps Glow', titleMm: 'ဆီမီး တစ်ထောင် အလင်း' },
                      { id: 'golden_hour', titleEn: 'Golden Hour Rim Light', titleMm: 'ရွှေရောင်ဆည်းဆာ အနားကွပ်' },
                      { id: 'monsoon_overcast', titleEn: 'Monsoon Overcast Soft', titleMm: 'မိုးရာသီ သမမျှတ အလင်းပျော့' },
                      { id: 'dramatic_chiaroscuro', titleEn: 'Monastery Lattice Rays', titleMm: 'သစ်သားပြတင်းပေါက် ထိုးဖောက်အလင်း' },
                      { id: 'fashion_studio_strobe', titleEn: 'Editorial Studio Strobe', titleMm: 'စတူဒီယို အလင်းကြည်' }
                    ].map((item) => {
                      const isSelected = selection.timeAndLighting === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onUpdateSelection({ timeAndLighting: item.id })}
                          className={`p-3 rounded-lg text-left transition-all flex flex-col gap-1 cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#704112] bg-[#704112]/5 shadow-xs'
                              : 'border border-[#d6c3b6]/40 bg-[#faf2ee] hover:border-[#847469] hover:bg-[#f4ece9]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`font-sans text-sm font-semibold leading-snug ${isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'}`}>
                              {item.titleEn}
                            </span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[#704112] text-[18px]">
                                check_circle
                              </span>
                            )}
                          </div>
                          <span className="font-sans text-xs text-[#51443a]">
                            {item.titleMm}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 30 LIGHTING & 15 MOODS CAROUSEL DRAWER */}
                  {expandedDrawers.lightingCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <LightingSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                      <MoodSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: ART & DIRECTION */}
            {/* ============================================================== */}
            {(activeTab === 'tab-direction' || isViewAll) && (
              <div className="flex flex-col gap-6">
                
                {/* SECTION 7: Pose, Expression & Poise */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        7
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Pose, Expression &amp; Poise
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ဟန်ပန်၊ အမူအရာ နှင့် သရုပ်ဖော်မှု
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('poseCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">accessibility_new</span>
                      <span>{expandedDrawers.poseCatalog ? 'Hide 25 Poses' : 'Browse 25 Signature Poses'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                        Burmese Royal Gesture (အကနှင့် ဟန်ပန်)
                      </span>
                      <select
                        value={selection.poseExpression || 'looking_at_camera'}
                        onChange={(e) => onUpdateSelection({ poseExpression: e.target.value })}
                        className="w-full bg-[#faf2ee] border border-[#d6c3b6]/40 px-3.5 py-2.5 rounded-lg font-sans text-sm text-[#1e1b19] focus:outline-none focus:ring-1 focus:ring-[#704112]"
                      >
                        <option value="looking_at_camera">Looking at Camera with Dignity (တည့်တည့်ရှုကြည့်ဟန်)</option>
                        <option value="graceful_dance">Graceful Classical Court Dance Gesture (ကဗျာလွတ်အကဟန်)</option>
                        <option value="lotus_offering">Holding Lotus Offering Bowl (ကြာဖလား ကပ်လှူဟန်)</option>
                        <option value="mingalar_greeting">Mingalar Welcome Anjali (မင်္ဂလာ နှုတ်ခွန်းဆက်)</option>
                        <option value="temple_contemplation">Standing in Regal Contemplation (ဘုရားဖူး ငေးမောဟန်)</option>
                        <option value="candid_stroll">Monastery Colonnade Stroll (ကျောင်းတော်တွင်း လျှောက်လှမ်းဟန်)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                        Facial Emotion (မျက်နှာ အမူအရာ)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: 'looking_at_camera', title: 'Serene Calm (အေးချမ်း)' },
                          { val: 'noble_poise', title: 'Noble Poise (ဂုဏ်သရေ)' },
                          { val: 'gentle_smile', title: 'Warm Gaze (နွေးထွေး)' },
                          { val: 'cinematic_moody', title: 'Cinematic Moody (ရုပ်ရှင်ဟန်)' }
                        ].map((item) => (
                          <label
                            key={item.title}
                            onClick={() => onUpdateSelection({ poseExpression: item.val })}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              (selection.poseExpression || 'looking_at_camera') === item.val
                                ? 'bg-[#faf2ee] border border-[#704112]/60 font-semibold text-[#704112]'
                                : 'bg-[#faf2ee] border border-[#d6c3b6]/30 text-[#1e1b19] hover:bg-[#f4ece9]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="emotion"
                              checked={(selection.poseExpression || 'looking_at_camera') === item.val}
                              onChange={() => onUpdateSelection({ poseExpression: item.val })}
                              className="accent-[#704112]"
                            />
                            <span>{item.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 25 POSES CAROUSEL DRAWER */}
                  {expandedDrawers.poseCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <PoseSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

                {/* SECTION 8: Camera Optics & Composition */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        8
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Camera Optics &amp; Composition
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ကင်မရာ မှန်ဘီလူးနှင့် ရိုက်ကွက်
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('cameraCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      <span>{expandedDrawers.cameraCatalog ? 'Hide 25 Cameras' : 'Browse 25 Cameras & Angles'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 p-2.5 bg-[#faf2ee] border border-[#d6c3b6]/30 rounded-lg">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">Shot Framing</span>
                      <select
                        value={selection.cameraAngle || 'eye_level'}
                        onChange={(e) => onUpdateSelection({ cameraAngle: e.target.value })}
                        className="bg-transparent font-sans text-sm text-[#1e1b19] font-medium focus:outline-none"
                      >
                        <option value="eye_level">Eye-Level Medium Close-Up</option>
                        <option value="full_body">Full-Length Royal Stance</option>
                        <option value="wide_angle">Environmental Wide Angle View</option>
                        <option value="low_angle">Low-Angle Imposing Majesty</option>
                        <option value="close_up">Extreme Macro Close-Up</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 p-2.5 bg-[#faf2ee] border border-[#d6c3b6]/30 rounded-lg">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">Lens &amp; Aperture</span>
                      <select
                        value={selection.camera || 'sony_a7rv'}
                        onChange={(e) => onUpdateSelection({ camera: e.target.value })}
                        className="bg-transparent font-sans text-sm text-[#1e1b19] font-medium focus:outline-none"
                      >
                        <option value="sony_a7rv">Sony A7R V (85mm f/1.2 Lens)</option>
                        <option value="canon_r5">Canon EOS R5 (50mm f/1.2)</option>
                        <option value="nikon_z9">Nikon Z9 (105mm Macro)</option>
                        <option value="hasselblad_x2d">Hasselblad X2D 100C (100mm f/1.4)</option>
                        <option value="leica_m11">Leica M11 (Summilux 50mm)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 p-2.5 bg-[#faf2ee] border border-[#d6c3b6]/30 rounded-lg">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">Aspect Ratio</span>
                      <div className="flex items-center gap-1 pt-1">
                        {['16:9', '9:16', '4:5', '1:1', '2:3'].map((ar) => (
                          <button
                            key={ar}
                            type="button"
                            onClick={() => onUpdateSelection({ aspectRatio: ar })}
                            className={`px-2.5 py-1 text-xs rounded-md font-sans transition-all cursor-pointer ${
                              (selection.aspectRatio || '16:9') === ar
                                ? 'bg-[#704112] text-white font-semibold shadow-xs'
                                : 'bg-[#f4ece9] border border-[#d6c3b6]/30 text-[#51443a] hover:bg-[#eee7e3]'
                            }`}
                          >
                            {ar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 25 CAMERAS & ANGLES CAROUSEL DRAWER */}
                  {expandedDrawers.cameraCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <CameraSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                      <CameraAngleSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

                {/* SECTION 9: Aesthetic & Photographic Medium */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        9
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Aesthetic &amp; Photographic Medium
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ဓာတ်ပုံအနုပညာ အသွင်အပြင်
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('filmRetouchCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">palette</span>
                      <span>{expandedDrawers.filmRetouchCatalog ? 'Hide 20 Film LUTs' : 'Browse 20 Film LUTs & Retouch'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'kodak_portra', title: 'National Geographic', desc: 'Authentic raw cultural journalism, rich earthy grading' },
                      { id: 'fujifilm_velvia', title: 'Vogue Southeast Asia', desc: 'Editorial high-fashion couture lighting and styling' },
                      { id: 'vintage_sepia', title: '1930s Hand-Tinted', desc: 'Vintage silver-gelatin sepia wash with hand-painted gold' },
                      { id: 'kodachrome_64', title: 'Kodak Portra 400', desc: 'Gentle analog film grain, warm skin tones, soft highlights' },
                      { id: 'ultra_8k', title: 'Hyper-Real 8K Raw', desc: 'Flawless micro-texture fidelity on Thanaka and silk weave' },
                      { id: 'monochrome_fine_art', title: 'Monochrome Archival', desc: 'Deep contrast black and white documentary masterpiece' }
                    ].map((item) => {
                      const isSelected = (selection.colorGrade || 'kodak_portra') === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => onUpdateSelection({ colorGrade: item.id })}
                          className={`p-3 rounded-lg flex flex-col gap-1 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-[#704112] bg-[#faf2ee] shadow-xs'
                              : 'border border-[#d6c3b6]/30 bg-[#faf2ee] hover:border-[#847469] hover:bg-[#f4ece9]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-sans text-sm font-semibold ${isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'}`}>
                              {item.title}
                            </span>
                            <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#704112]' : 'text-[#847469]/30'}`}>
                              {isSelected ? 'verified' : 'radio_button_unchecked'}
                            </span>
                          </div>
                          <span className="font-sans text-xs text-[#51443a] leading-snug">
                            {item.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 20 FILM LUTS, RETOUCH & MAKEUP CAROUSEL DRAWER */}
                  {expandedDrawers.filmRetouchCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <FilmColorSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
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
                      <PhotoStyleSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: ENGINE & OUTPUT */}
            {/* ============================================================== */}
            {(activeTab === 'tab-engine' || isViewAll) && (
              <div className="flex flex-col gap-6">
                
                {/* SECTION 10: Target AI Engine & Constraints */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        10
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Target AI Engine &amp; Constraints
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          AI မော်ဒယ် သတ်မှတ်ချက်နှင့် ဖယ်ထုတ်ရန် စာသားများ
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('qualityCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>{expandedDrawers.qualityCatalog ? 'Hide Quality Engines' : 'Master Render Quality Engines'}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-xs text-[#51443a] mr-2 font-medium">Target Syntax:</span>
                      {[
                        { id: 'midjourney-v6', label: 'Midjourney v6.1' },
                        { id: 'flux-1', label: 'Flux.1 Dev / Pro' },
                        { id: 'sdxl', label: 'SDXL 1.0 Turbo' },
                        { id: 'dalle-3', label: 'DALL-E 3' }
                      ].map((eng) => (
                        <button
                          key={eng.id}
                          type="button"
                          onClick={() => onEngineChange(eng.id)}
                          className={`px-3 py-1.5 rounded-md font-sans text-xs font-semibold transition-all cursor-pointer ${
                            engine === eng.id
                              ? 'bg-[#704112] text-white shadow-xs'
                              : 'bg-[#f4ece9] border border-[#d6c3b6]/30 text-[#51443a] hover:bg-[#eee7e3]'
                          }`}
                        >
                          {eng.label}
                        </button>
                      ))}
                    </div>

                    {/* Negative Prompt Safeguards Box */}
                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-xs text-[#847469] uppercase font-semibold">
                          Burmese Authenticity Negative Safeguards (ဖယ်ထုတ်ချက်)
                        </label>
                        <button
                          type="button"
                          onClick={handleCopyNegative}
                          className="px-2.5 py-1 bg-[#f4ece9] border border-[#d6c3b6]/30 rounded text-xs font-sans text-[#1e1b19] hover:bg-[#eee7e3] transition-colors cursor-pointer"
                        >
                          {negCopiedToast ? 'Copied!' : 'Copy Negative'}
                        </button>
                      </div>
                      <div className="p-3 bg-[#faf2ee] border border-[#d6c3b6]/30 rounded-lg font-mono text-xs text-[#51443a] leading-relaxed select-all">
                        {liveBuilt?.negativePrompt || '--no modern western clothing, sunglasses, plastic, wrist watch, distorted hands, extra fingers, inaccurate generic anime face, non-Burmese Chinese or Japanese traditional costumes, synthetic nylon fabrics, low quality render, deformed facial anatomy'}
                      </div>
                    </div>
                  </div>

                  {/* 🌟 QUALITY ENGINE PROFILES DRAWER */}
                  {expandedDrawers.qualityCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <QualityEngineSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
                  )}
                </section>

              </div>
            )}

          </div>

        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: Elevated Master Synthesizer Copilot Sidebar (xl:col-span-5) */}
        {/* ===================================================================== */}
        <div className="xl:col-span-5 flex flex-col gap-6 sticky top-24">
          
          {/* Visual Showcase & Photo Reference Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e0e2e8] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd02f] border border-[#fcb900] animate-ping"></span>
                <span className="font-sans text-sm text-[#1c1c1e] font-bold">
                  {selection.referenceImage ? (isMyanmar ? 'ထည့်သွင်းထားသော Reference Photo' : 'Attached Reference Photo') : (isMyanmar ? 'စတူဒီယို ဓာတ်ပုံ နမူနာ' : 'Curated Visual Showcase')}
                </span>
              </div>
              {selection.referenceImage ? (
                <span className="font-sans text-xs bg-[#eefaf6] text-[#00875a] border border-[#00b473]/30 px-3 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">lock</span>
                  <span>100% Identity Locked</span>
                </span>
              ) : (
                <span className="font-sans text-xs bg-[#c3faf5] text-[#187574] border border-[#0fbcb0]/30 px-3 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>98.4% Cultural Fidelity</span>
                </span>
              )}
            </div>

            {/* Hidden file input for prompt section upload */}
            <input
              ref={promptPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePromptFileChange}
              className="hidden"
            />

            {/* Interactive Image Dropzone & Preview Container */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsPromptDragOver(true); }}
              onDragLeave={() => setIsPromptDragOver(false)}
              onDrop={handlePromptDrop}
              className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden group shadow-2xs border transition-all ${
                isPromptDragOver
                  ? 'border-2 border-[#ffd02f] ring-4 ring-[#ffd02f]/20 bg-[#fffdf0]'
                  : 'border-[#e0e2e8] bg-[#1c1c1e]'
              }`}
            >
              <img
                src={selection.referenceImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85"}
                alt="Showcase"
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  isPromptDragOver ? 'opacity-40' : 'opacity-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

              {/* Drag overlay feedback */}
              {isPromptDragOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#ffd02f]/90 text-[#1c1c1e] z-30 font-bold text-sm">
                  <span className="material-symbols-outlined text-[36px]">file_upload</span>
                  <span>{isMyanmar ? 'ဓာတ်ပုံအား ဤနေရာတွင် ချပါ' : 'Drop photo to attach to prompt'}</span>
                </div>
              )}

              {/* Top controls: Reverse Prompt & Remove buttons */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                {selection.referenceImage ? (
                  <>
                    <span className="bg-black/70 backdrop-blur-md text-[#ffd02f] font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00b473]"></span>
                      <span>{isMyanmar ? 'လူအစစ် ပုံတူ ထည့်သွင်းပြီး' : 'Face Reference Loaded'}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onNavigateView && (
                        <button
                          type="button"
                          onClick={() => onNavigateView('photo-to-text', selection.referenceImage || undefined)}
                          className="px-2.5 py-1 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-sans text-[11px] font-bold flex items-center gap-1 shadow-sm hover:bg-[#fcb900] cursor-pointer"
                          title="Extract prompts from this photo"
                        >
                          <span className="material-symbols-outlined text-[13px]">auto_fix_normal</span>
                          <span>Photo to Text</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onUpdateSelection({ referenceImage: null, identityLock: 'no_lock' })}
                        className="p-1 rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-[#ba1a1a] transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => promptPhotoInputRef.current?.click()}
                    className="ml-auto px-3 py-1 rounded-full bg-white/95 hover:bg-white text-[#1c1c1e] font-sans text-xs font-bold flex items-center gap-1.5 shadow-md border border-[#e0e2e8] cursor-pointer transition-all hover:scale-102"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#4262ff]">add_a_photo</span>
                    <span>{isMyanmar ? 'ဓာတ်ပုံတင်ရန်' : 'Upload Photo'}</span>
                  </button>
                )}
              </div>

              {/* Glassmorphic Metadata Overlay HUD inside image */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-[#e0e2e8] p-2.5 rounded-xl shadow-xs flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f7f8fa] text-[#1c1c1e] font-sans text-xs font-semibold">
                    {selection.customSubjectDetails || selection.subject || 'Bagan Court'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f7f8fa] text-[#1c1c1e] font-sans text-xs font-semibold">
                    {selection.timeAndLighting || 'Dawn Mist'}
                  </span>
                </div>
                <span className="font-sans text-xs text-[#1c1c1e] font-extrabold px-2.5 py-0.5 rounded-full bg-[#ffd02f]">
                  {selection.aspectRatio || '16:9'} RAW
                </span>
              </div>
            </div>

            {/* Quick Upload Action Strip */}
            <div className="p-3 bg-[#f7f8fa] rounded-xl border border-[#e0e2e8] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#4262ff]">upload_file</span>
                <div className="flex flex-col">
                  <span className="font-sans text-xs font-bold text-[#1c1c1e]">
                    {isMyanmar ? 'Reference Photo ထည့်သွင်းရန်' : 'Upload Reference Photo'}
                  </span>
                  <span className="font-sans text-[10px] text-[#6b6f7e]">
                    {isMyanmar ? 'မျက်နှာသွင်ပြင်နှင့် ဝတ်စုံကို ၁၀၀% အတိအကျ ထိန်းသိမ်းမည်' : 'Drag photo here or click upload to lock likeness in prompt'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => promptPhotoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-full bg-[#1c1c1e] hover:bg-black text-white font-sans text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">add_photo_alternate</span>
                  <span>{isMyanmar ? 'ဖိုင်ရွေးမည်' : 'Browse File'}</span>
                </button>
              </div>
            </div>

            {/* Real-Time Prompt Modifiers Quick Chips (Miro Pills) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[11px] text-[#8e91a0] uppercase font-bold tracking-wider">
                  Instant Cultural Modifiers
                </span>
                <span className="font-sans text-[11px] text-[#8e91a0]">Click to append</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '+ Golden Hour',
                  '+ More Thanaka Pattern',
                  '+ Heavy Monsoon Rain',
                  '+ Gilded 24k Gold Accents',
                  '+ Kodak Portra Grain'
                ].map((mod) => {
                  const isApplied = quickModifiers.includes(mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleQuickModifier(mod)}
                      className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                        isApplied
                          ? 'bg-[#1c1c1e] text-[#ffd02f] font-bold shadow-2xs'
                          : 'bg-[#f7f8fa] hover:bg-[#eef0f3] text-[#555a6a] border border-[#e0e2e8]'
                      }`}
                    >
                      {mod}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 🌟 ရွေးချယ်ထားချက်များ (PICKED OPTIONS CHIP TRAY) */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1e1b19] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#704112]">tune</span>
                <span>{isMyanmar ? 'ရွေးချယ်ထားချက်များ' : 'Active Picked Options'}</span>
                <span className="text-[10px] text-[#704112] font-mono font-bold bg-[#ffdcc2]/50 px-2 py-0.5 rounded-full">
                  {activeOptionChips.length}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetMatrix}
                  className="px-2 py-0.5 rounded bg-[#f4ece9] text-[#ba1a1a] hover:bg-[#ffdad6]/40 font-semibold text-[11px] cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="text-[11px] text-[#704112] font-bold hover:underline cursor-pointer"
                >
                  {isMyanmar ? 'အကျဉ်းချုပ်' : 'Summary'}
                </button>
              </div>
            </div>

            {activeOptionChips.length === 0 ? (
              <span className="text-xs text-[#847469] italic">
                {isMyanmar ? 'အချက်အလက်များ မရွေးချယ်ရသေးပါ' : 'No custom options selected. Pick options on the left.'}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeOptionChips.map((chip) => (
                  <div
                    key={chip.id}
                    className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md bg-[#faf2ee] border border-[#d6c3b6]/40 text-xs"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#704112]">
                      {chip.labelEn}:
                    </span>
                    <span className="font-semibold text-[#1e1b19]">
                      {(isMyanmar ? chip.valueMm : chip.valueEn).replace(/^🚫\s*/, '')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(chip.id)}
                      className="p-0.5 text-[#847469] hover:text-[#ba1a1a] cursor-pointer"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Generated Master Prompt Output Card */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-base text-[#1e1b19] font-semibold">
                    Master Synthesized Prompt
                  </h3>
                  {aiSynthesizedData && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold">
                      AI Pro Synthesized
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs text-[#51443a]">
                  ထုတ်ပေးလိုက်သော အဆင့်မြင့် မြန်မာ့ရိုးရာ AI စာသား
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#f4ece9] border border-[#d6c3b6]/30 px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-[#275546]">speed</span>
                <span className="font-sans text-xs text-[#1e1b19]">
                  Tokens: <strong className="text-[#704112] font-bold">{estimatedTokens}</strong>
                </span>
              </div>
            </div>

            {/* Multi-Engine Format Selector Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f4ece9] rounded-xl border border-[#d6c3b6]/30">
              {[
                { id: 'master', label: 'Master' },
                { id: 'flux', label: 'FLUX / GPT Prose' },
                { id: 'midjourney', label: 'Midjourney v6.1' },
                { id: 'sdxl', label: 'SDXL' },
                { id: 'negative', label: 'Negative' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormatTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-sans text-[11px] font-bold transition-all cursor-pointer ${
                    activeFormatTab === tab.id
                      ? 'bg-[#1c1c1e] text-[#ffd02f] shadow-2xs'
                      : 'text-[#51443a] hover:bg-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Parameters Pill Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 text-xs font-semibold">
                {activeFormatTab === 'flux' ? 'Natural Prose (No Flags)' : engineSyntax.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdcc2]/50 text-[#2e1500] border border-[#704112]/20 text-xs font-semibold">
                --ar {selection.aspectRatio || '16:9'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#bcedda]/50 text-[#214f41] border border-[#275546]/20 text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>100% Burmese Cultural Taxonomy</span>
              </span>
            </div>

            {/* Attached Reference Photo Indicator in Prompt Card */}
            {selection.referenceImage && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#eefaf6] border border-[#00b473]/30">
                <img
                  src={selection.referenceImage}
                  alt="Reference"
                  className="w-10 h-10 rounded-lg object-cover border border-[#00b473]/40 shrink-0"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00b473] animate-pulse"></span>
                    <span className="font-sans text-xs font-bold text-[#065f46] truncate">
                      {isMyanmar ? 'ဓာတ်ပုံတွဲဆက်ထားပြီး (၁၀၀% Likeness Lock)' : 'Reference Photo Locked in Prompt'}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] text-[#047857] truncate">
                    {isMyanmar ? '--cref tag ဖြင့် မျက်နှာနှင့် အသားအရောင်ကို ထိန်းသိမ်းထားသည်' : 'Preserving exact bone structure & micro-pores with --cref'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSelection({ referenceImage: null, identityLock: 'no_lock' })}
                  className="text-xs font-bold text-[#ba1a1a] hover:underline px-2 py-1 rounded cursor-pointer"
                >
                  {isMyanmar ? 'ဖယ်ရှားမည်' : 'Remove'}
                </button>
              </div>
            )}

            {/* Master English Prompt Display with Miro Flat Style */}
            <div className="relative bg-[#f7f8fa] border border-[#e0e2e8] p-4 rounded-xl flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#eef0f3]">
                <span className="font-sans text-[11px] text-[#1c1c1e] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#4262ff]">terminal</span>
                  <span>
                    {activeFormatTab === 'flux'
                      ? 'FLUX.1 / GPT Image 2 Prose'
                      : activeFormatTab === 'midjourney'
                      ? 'Midjourney v6.1 Command'
                      : activeFormatTab === 'sdxl'
                      ? 'SDXL Tag-Weighted Prompt'
                      : activeFormatTab === 'negative'
                      ? 'Anti-Hallucination Negative Prompt'
                      : `${engine.toUpperCase()} Master Prompt`}
                  </span>
                </span>
                <span className={`font-sans text-xs text-[#00b473] font-bold transition-opacity ${copiedToast ? 'opacity-100' : 'opacity-0'}`}>
                  ✓ Copied to Clipboard
                </span>
              </div>

              {/* Synthesized Text */}
              <div className="font-mono text-xs text-[#1c1c1e] leading-relaxed select-all max-h-48 overflow-y-auto">
                {displayedPromptText || 'Assembling master prompt from chosen parameters...'}
              </div>
            </div>

            {/* Miro Pill Action Control Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="h-10 px-4 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[17px] text-[#ffd02f]">content_copy</span>
                <span>{copiedToast ? 'Copied!' : `Copy ${activeFormatTab.toUpperCase()}`}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToPresets}
                className="h-10 px-4 rounded-full bg-white border border-[#c7cad5] hover:bg-[#f7f8fa] text-[#1c1c1e] font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[17px] text-[#6b6f7e]">bookmark_add</span>
                <span>{savedToast ? 'Saved!' : 'Save Preset'}</span>
              </button>
            </div>

            {/* Burmese 5-Point Cultural & Studio Director's Breakdown (Open by default) */}
            <details open className="group bg-[#fff8e0]/80 border border-[#fcb900]/40 rounded-xl p-3.5 text-xs cursor-pointer">
              <summary className="font-sans font-bold text-[#746019] flex items-center justify-between select-none list-none">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">translate</span>
                  <span>မြန်မာဘာသာ အသေးစိတ် ဒါရိုက်တာ ရှင်းလင်းချက် (၅ ချက်)</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#746019] group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="font-sans text-[11px] text-[#5c480a] whitespace-pre-line leading-relaxed pt-2.5 border-t border-[#fcb900]/30 mt-2">
                {effectivePromptData?.descriptionMm || 'ဤပရွမ့်ဖော်ပြချက်တွင် ရွေးချယ်ထားသော မြန်မာ့ရိုးရာ နန်းတွင်း ဝတ်စုံ၊ သနပ်ခါး၊ ဆံထုံး နှင့် နောက်ခံ ရှုခင်းတို့ကို အတိအကျ ပေါင်းစပ်ထားပြီး သဘာဝကျသော ရွှေရောင်အလင်းရောင်ဖြင့် ပုံဖော်ပေးပါသည်။'}
              </div>
              {effectivePromptData?.cameraNotes && (
                <div className="mt-2 pt-2 border-t border-[#fcb900]/20 font-mono text-[10px] text-[#704112] font-semibold">
                  OPTICS: {effectivePromptData.cameraNotes}
                </div>
              )}
            </details>

            {/* Generate Full AI Prompt Button - Miro Signature Black Button */}
            <button
              type="button"
              onClick={handleSynthesizeAiPrompt}
              disabled={isSynthesizingAi || isGeneratingPrompt}
              className="w-full py-3 px-5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-sans text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSynthesizingAi || isGeneratingPrompt ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin text-[#ffd02f]">refresh</span>
                  <span>AI Engine Synthesizing Master Prompt...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">electric_bolt</span>
                  <span>AI Synthesize Master Prompt &amp; Burmese Story</span>
                </>
              )}
            </button>

          </div>

          {/* Recent Generation Mini Strip */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1">
              <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                Recent Studio Outputs
              </span>
              <span className="font-sans text-xs text-[#704112] font-semibold cursor-pointer hover:underline">
                View All
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div
                onClick={() => onUpdateSelection({ location: 'mandalay_palace', aspectRatio: '16:9' })}
                className="flex items-center justify-between p-2 rounded-lg bg-[#faf2ee] border border-[#d6c3b6]/30 hover:bg-[#f4ece9] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-[#e9e1dd] flex items-center justify-center font-bold text-xs text-[#704112]">
                    01
                  </span>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-[#1e1b19] font-semibold leading-none">
                      Mandalay Palace Moat Sunset
                    </span>
                    <span className="font-sans text-[11px] text-[#51443a]">
                      Konbaung • 85mm • 16:9
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#847469] text-[18px]">
                  arrow_forward
                </span>
              </div>

              <div
                onClick={() => onUpdateSelection({ location: 'inle_lake', aspectRatio: '4:5' })}
                className="flex items-center justify-between p-2 rounded-lg bg-[#faf2ee] border border-[#d6c3b6]/30 hover:bg-[#f4ece9] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded bg-[#e9e1dd] flex items-center justify-center font-bold text-xs text-[#704112]">
                    02
                  </span>
                  <div className="flex flex-col">
                    <span className="font-sans text-xs text-[#1e1b19] font-semibold leading-none">
                      Intha Leg Rower Dawn Mist
                    </span>
                    <span className="font-sans text-[11px] text-[#51443a]">
                      Shan State • Hasselblad • 4:5
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#847469] text-[18px]">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Selected Options Summary Modal */}
      <SelectedOptionsSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        selection={selection}
        language={language}
        onEditOption={() => {}}
        onDeleteOption={handleDeleteOption}
        onResetAll={handleResetMatrix}
        onGeneratePrompt={() => {
          if (onGeneratePrompt) onGeneratePrompt(masterPromptText);
        }}
        isGeneratingPrompt={isGeneratingPrompt}
      />

    </div>
  );
};
