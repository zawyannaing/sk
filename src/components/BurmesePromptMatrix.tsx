import React, { useState, useMemo, useRef } from 'react';
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

  // Deep resource drawer expandable states
  const [expandedDrawers, setExpandedDrawers] = useState<Record<string, boolean>>({
    characterFeature: true,
    garmentCatalog: false,
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

  // Master Prompt Assembly from selection
  const liveBuilt = useMemo(() => {
    try {
      return buildComprehensiveMasterPrompt(selection, 'txt2img');
    } catch (e) {
      return null;
    }
  }, [selection]);

  const masterPromptText = useMemo(() => {
    if (!liveBuilt?.masterPrompt) return '';
    let p = liveBuilt.masterPrompt;
    if (selection.referenceImage) {
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
  }, [liveBuilt, quickModifiers, selection.aspectRatio, selection.referenceImage, engineSyntax]);

  // Token counter estimation
  const estimatedTokens = useMemo(() => {
    return Math.round(masterPromptText.split(' ').length * 1.35);
  }, [masterPromptText]);

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
    navigator.clipboard.writeText(masterPromptText);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleCopyNegative = () => {
    const neg = liveBuilt?.negativePrompt || "--no modern western clothing, sunglasses, plastic, wrist watch, distorted hands, extra fingers, inaccurate generic anime face, non-Burmese Chinese or Japanese traditional costumes, synthetic nylon fabrics, low quality render, deformed facial anatomy";
    navigator.clipboard.writeText(neg);
    setNegCopiedToast(true);
    setTimeout(() => setNegCopiedToast(false), 2000);
  };

  const handleSaveToPresets = () => {
    if (onSavePrompt) {
      onSavePrompt(masterPromptText, {
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
                
                {/* SECTION 1: Character & Cultural Archetype */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        1
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Character &amp; Cultural Archetype
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ဇာတ်ကောင်နှင့် လူမျိုးနွယ်
                        </span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => toggleDrawer('characterFeature')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">stars</span>
                      <span>{expandedDrawers.characterFeature ? 'Close Higgsfield Character' : '🌟 Higgsfield Character Studio'}</span>
                    </button>
                  </div>

                  {/* Archetype Quick Selector Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'burmese-royal-lady', nameEn: 'Bagan Royal Lady', nameMm: 'ပုဂံ မင်းသမီး', subject: 'woman', eth: 'burmese', garment: 'traditional_myanmar_royal' },
                      { id: 'burmese-young-woman', nameEn: 'Burmese Young Woman', nameMm: 'အမျိုးသမီးငယ်', subject: 'woman', eth: 'burmese', garment: 'traditional_myanmar' },
                      { id: 'mandalay-model', nameEn: 'Mandalay Model', nameMm: 'မန္တလေး မော်ဒယ်', subject: 'fashion', eth: 'burmese', garment: 'evening_gown' },
                      { id: 'mon-princess', nameEn: 'Mon Princess', nameMm: 'မွန် မင်းသမီး', subject: 'woman', eth: 'mon', garment: 'mon_ethnic_attire' },
                      { id: 'shan-elder', nameEn: 'Shan Elder', nameMm: 'ရှမ်း သက်ကြီး', subject: 'man', eth: 'shan', garment: 'shan_ethnic_attire' },
                      { id: 'burmese-gentleman', nameEn: 'Burmese Gentleman', nameMm: 'အမျိုးသား', subject: 'man', eth: 'burmese', garment: 'formal_business' }
                    ].map((arch) => {
                      const isSelected = selection.customSubjectDetails === arch.nameEn || selection.subject === arch.subject;
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => onUpdateSelection({
                            subject: arch.subject,
                            ethnicity: arch.eth,
                            garmentStyle: arch.garment,
                            customSubjectDetails: arch.nameEn
                          })}
                          className={`p-3 rounded-lg text-left transition-all relative flex flex-col items-start gap-1 cursor-pointer ${
                            isSelected
                              ? 'border-2 border-[#704112] bg-[#704112]/5 text-[#1e1b19] shadow-xs'
                              : 'border border-[#d6c3b6]/40 bg-[#faf2ee] text-[#1e1b19] hover:border-[#847469] hover:bg-[#f4ece9]'
                          }`}
                        >
                          <div className="w-full flex items-center justify-between">
                            <span className={`font-sans text-sm font-semibold leading-snug ${isSelected ? 'text-[#704112]' : 'text-[#1e1b19]'}`}>
                              {arch.nameEn}
                            </span>
                            <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-[#704112]' : 'text-[#847469]/40'}`}>
                              {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                          </div>
                          <span className="font-sans text-xs text-[#51443a]">
                            {arch.nameMm}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 🌟 HIGGSFIELD CHARACTER FEATURE DRAWER (Character Presets, Face Upload & Identity Lock) */}
                  {expandedDrawers.characterFeature && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/30">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#704112] text-[20px]">person_pin</span>
                          <h3 className="font-sans text-sm font-bold text-[#704112]">
                            Dedicated Character Presets &amp; 100% Face Identity Lock
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-[#51443a]">
                          Higgsfield AI Architecture
                        </span>
                      </div>

                      {/* Character Presets Carousel Grid */}
                      <div className="space-y-2">
                        <span className="font-sans text-xs text-[#51443a] uppercase font-bold tracking-wider">
                          Select Character Persona (ကလစ်နှိပ်၍ ဇာတ်ကောင် ရွေးပါ):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {CHARACTER_PRESETS.slice(0, 10).map((char) => {
                            const isSelected = selection.customSubjectDetails === (isMyanmar ? char.nameMm : char.nameEn) || selection.customSubjectDetails === char.nameEn;
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
                                      customSubjectDetails: isMyanmar ? char.nameMm : char.nameEn
                                    });
                                  }
                                }}
                                className={`rounded-xl overflow-hidden border text-left flex flex-col transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-[#704112] ring-2 ring-[#704112] bg-white shadow-sm scale-[1.02]'
                                    : 'border-[#d6c3b6]/40 bg-white hover:border-[#847469]'
                                }`}
                              >
                                <div className="h-24 w-full bg-[#f4ece9] relative overflow-hidden">
                                  <img src={char.previewUrl} alt={char.nameEn} className="w-full h-full object-cover" />
                                  <span className="absolute top-1.5 left-1.5 text-xs p-0.5 rounded bg-black/60 text-white">
                                    {char.emoji}
                                  </span>
                                  {isSelected && (
                                    <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-[16px] text-[#704112] bg-white rounded-full">
                                      check_circle
                                    </span>
                                  )}
                                </div>
                                <div className="p-2">
                                  <span className="font-sans text-xs font-bold text-[#1e1b19] block truncate">
                                    {isMyanmar ? char.nameMm : char.nameEn}
                                  </span>
                                  <span className="font-sans text-[10px] text-[#51443a] block truncate">
                                    {char.taglineEn}
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
                                  <span className="mr-1">{lock.emoji}</span>
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

                  {/* Ethnicity Chips */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <label className="font-sans text-xs text-[#51443a] uppercase tracking-wider font-semibold">
                      Ethnicity Sub-Archetype (တိုင်းရင်းသားမျိုးနွယ်)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ETHNICITY_OPTIONS.map((eth) => {
                        const isSelected = (selection.ethnicity || 'burmese') === eth.id;
                        return (
                          <button
                            key={eth.id}
                            type="button"
                            onClick={() => onUpdateSelection({ ethnicity: isSelected ? 'skip' : eth.id })}
                            className={`px-3.5 py-1 rounded-full font-sans text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#704112] text-white font-semibold border border-[#704112]'
                                : 'bg-[#f4ece9] border border-[#d6c3b6]/40 text-[#51443a] hover:border-[#847469] hover:bg-[#eee7e3]'
                            }`}
                          >
                            <span className="mr-1">{eth.emoji}</span>
                            <span>{isMyanmar ? eth.labelMm : eth.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complexion Prompt Anchor Box */}
                  <div className="bg-[#faf2ee] p-3.5 rounded-lg border border-[#d6c3b6]/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] text-[#704112] uppercase font-bold tracking-wider">
                        Skin Tone &amp; Facial Structure
                      </span>
                      <span className="text-[#275546] font-sans text-[11px] bg-[#bcedda]/40 px-2 py-0.5 rounded-full font-medium">
                        Natural Glow Preset
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#1e1b19] leading-relaxed">
                      "Warm golden honey olive complexion, smooth natural epidermal texture, authentic Southeast Asian Burmese facial bone structure, gentle contemplative amber eyes."
                    </p>
                  </div>
                </section>

                {/* SECTION 2: Traditional Dress & Textile Heritage */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        2
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Traditional Dress &amp; Textile Heritage
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          ရိုးရာဝတ်စုံနှင့် ရက်ကန်းထည်များ
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDrawer('garmentCatalog')}
                      className="px-2.5 py-1 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#ffdf98]"
                    >
                      <span className="material-symbols-outlined text-[16px]">checkroom</span>
                      <span>{expandedDrawers.garmentCatalog ? 'Hide 32 Outfits' : '👗 Browse 32 Outfits & Clothes Swap'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Female Silhouettes */}
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                        Female Silhouettes (အမျိုးသမီး ဝတ်စုံ)
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { id: 'traditional_myanmar_royal', titleEn: 'Bagan Silk Yinzi Htamein', titleMm: 'ပုဂံခေတ် ရင်စည်း ပိုးထဘီ' },
                          { id: 'traditional_myanmar', titleEn: 'Mandalay Yadanabon Royal Ein Gyi', titleMm: 'မန္တလေး ရတနာပုံ နန်းတွင်း ဝတ်စုံကြီး' },
                          { id: 'kachin_ethnic_attire', titleEn: 'Kachin Wool & Silver Attire', titleMm: 'ကချင် ရိုးရာ ငွေမောင်းတန်ဆာဆင် ဝတ်စုံ' },
                          { id: 'shan_ethnic_attire', titleEn: 'Inle Lotus Patterned Longyi', titleMm: 'အင်းလေး ကြာချည် လုံချည်' }
                        ].map((item) => (
                          <label
                            key={item.id}
                            onClick={() => onUpdateSelection({ garmentStyle: item.id })}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                              selection.garmentStyle === item.id
                                ? 'bg-[#faf2ee] border border-[#704112]/50'
                                : 'bg-[#faf2ee] border border-[#d6c3b6]/30 hover:bg-[#f4ece9]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="garment"
                              checked={selection.garmentStyle === item.id}
                              onChange={() => onUpdateSelection({ garmentStyle: item.id })}
                              className="accent-[#704112] w-4 h-4"
                            />
                            <div className="flex flex-col">
                              <span className="font-sans text-sm text-[#1e1b19] font-medium leading-tight">
                                {item.titleEn}
                              </span>
                              <span className="font-sans text-xs text-[#51443a]">
                                {item.titleMm}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Male Attire & Textile Modifiers */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                          Male Archetype Garments (အမျိုးသား ဝတ်စုံ)
                        </span>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'myanmar_taingmathea', titleEn: 'Taikpon & Achik Paso', titleMm: 'တိုက်ပုံ၊ ပိုးပုဆိုး နှင့် ခေါင်းပေါင်း' },
                            { id: 'formal_business', titleEn: 'Konbaung Royal Court Robe', titleMm: 'ကုန်းဘောင်ခေတ် ဝန်ကြီး ဝတ်စုံ' }
                          ].map((item) => (
                            <label
                              key={item.id}
                              onClick={() => onUpdateSelection({ garmentStyle: item.id })}
                              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                                selection.garmentStyle === item.id
                                  ? 'bg-[#faf2ee] border border-[#704112]/50'
                                  : 'bg-[#faf2ee] border border-[#d6c3b6]/30 hover:bg-[#f4ece9]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="garment"
                                checked={selection.garmentStyle === item.id}
                                onChange={() => onUpdateSelection({ garmentStyle: item.id })}
                                className="accent-[#704112] w-4 h-4"
                              />
                              <div className="flex flex-col">
                                <span className="font-sans text-sm text-[#1e1b19] font-medium leading-tight">
                                  {item.titleEn}
                                </span>
                                <span className="font-sans text-xs text-[#51443a]">
                                  {item.titleMm}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Textile Texture Modifiers */}
                      <div className="flex flex-col gap-1.5">
                        <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                          Textile Texture Modifiers (ရက်ကန်းအထည်သား)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Woven Silk with Water Droplets',
                            'Traditional Konbaung Gold Brocade',
                            'Lustrous Royal Velvet',
                            'Crisp Tailored Cotton Linen'
                          ].map((mod) => {
                            const isIncluded = selection.garmentFabric === mod;
                            return (
                              <button
                                key={mod}
                                type="button"
                                onClick={() => onUpdateSelection({ garmentFabric: isIncluded ? '' : mod })}
                                className={`px-2.5 py-1 rounded-md font-sans text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                                  isIncluded
                                    ? 'bg-[#f4ece9] border-[#704112]/60 text-[#704112] font-semibold'
                                    : 'bg-[#faf2ee] border-[#d6c3b6]/40 text-[#51443a] hover:bg-[#eee7e3]'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-[14px] ${isIncluded ? 'text-[#704112]' : 'text-[#847469]'}`}>
                                  {isIncluded ? 'check_circle' : 'add_circle'}
                                </span>
                                <span>{mod}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 FULL 32 GARMENTS & CLOTHES SWAP CAROUSEL DRAWER */}
                  {expandedDrawers.garmentCatalog && (
                    <div className="p-4 rounded-xl bg-[#faf2ee] border border-[#d6c3b6]/50 space-y-4 animate-in fade-in">
                      <GarmentSelectionCarousel
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
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

                {/* SECTION 3: Thanaka & Royal Coiffure */}
                <section className="bg-white rounded-xl p-5 shadow-xs border border-[#d6c3b6]/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1 border-b border-[#d6c3b6]/20">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#704112]/10 text-[#704112] font-sans text-sm flex items-center justify-center font-bold border border-[#704112]/20">
                        3
                      </span>
                      <div>
                        <h2 className="font-sans text-base text-[#1e1b19] font-semibold">
                          Thanaka &amp; Royal Coiffure
                        </h2>
                        <span className="font-sans text-xs text-[#51443a]">
                          သနပ်ခါး လိမ်းခြယ်မှုနှင့် ဆံထုံးအဆင်တန်ဆာ
                        </span>
                      </div>
                    </div>
                    <span className="bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 font-sans text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      Essential Signature
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Thanaka Patterns */}
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                        Thanaka Bark Application (သနပ်ခါး လိမ်းစနစ်)
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { id: 'traditional_myanmar', titleEn: 'Circular Swirl Pattern', titleMm: 'သနပ်ခါး ဘီးကျဲ' },
                          { id: 'minimalist_natural', titleEn: 'Leaf Stencil Motif', titleMm: 'သနပ်ခါး သစ်ရွက်ပုံ' },
                          { id: 'glamour_editorial', titleEn: 'Sheer Sun-Veil Dusted', titleMm: 'ပါးကွက် ပါးပါးကြည်' }
                        ].map((item) => (
                          <label
                            key={item.id}
                            onClick={() => onUpdateSelection({ makeup: item.id })}
                            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                              (selection.makeup || 'traditional_myanmar') === item.id
                                ? 'bg-[#faf2ee] border border-[#704112]/50'
                                : 'bg-[#faf2ee] border border-[#d6c3b6]/30 hover:bg-[#f4ece9]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name="makeup"
                                checked={(selection.makeup || 'traditional_myanmar') === item.id}
                                onChange={() => onUpdateSelection({ makeup: item.id })}
                                className="accent-[#704112] w-4 h-4"
                              />
                              <span className="font-sans text-sm text-[#1e1b19] font-medium">
                                {item.titleEn}
                              </span>
                            </div>
                            <span className="font-sans text-xs text-[#51443a]">
                              {item.titleMm}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Props Dropdown */}
                    <div className="flex flex-col gap-2">
                      <span className="font-sans text-xs text-[#847469] uppercase font-semibold">
                        Cultural Jewelry &amp; Props (ရိုးရာ အဆင်တန်ဆာ)
                      </span>
                      <CulturalPropsDropdown
                        language={language}
                        selection={selection}
                        onUpdateSelection={onUpdateSelection}
                      />
                    </div>
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
                          <span>🖼️ {isMyanmar ? 'နောက်ခံလဲလှယ်ခန်း (Presets)' : 'Background Changer (Presets)'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleDrawer('locationCatalog')}
                        className="px-2.5 py-1 rounded-full bg-[#bcedda]/50 text-[#214f41] border border-[#275546]/20 font-sans text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-[#bcedda]"
                      >
                        <span className="material-symbols-outlined text-[16px]">map</span>
                        <span>{expandedDrawers.locationCatalog ? 'Hide 36 Locations' : '🏛️ Browse 36 Locations'}</span>
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
                        {expandedDrawers.eventCatalog ? 'Close 30 Events' : '🎉 Browse 30 Festivals'}
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
                      <span>{expandedDrawers.lightingCatalog ? 'Hide 30 Lights' : '💡 Browse 30 Lights & Moods'}</span>
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

                  {/* 🌟 30 LIGHTING & 15 MOODS CAROUSEL DRAWER */}
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
                      <span>{expandedDrawers.poseCatalog ? 'Hide 25 Poses' : '🧘 Browse 25 Signature Poses'}</span>
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

                  {/* 🌟 25 POSES CAROUSEL DRAWER */}
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
                      <span>{expandedDrawers.cameraCatalog ? 'Hide 25 Cameras' : '📷 Browse 25 Cameras & Angles'}</span>
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

                  {/* 🌟 25 CAMERAS & ANGLES CAROUSEL DRAWER */}
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
                      <span>{expandedDrawers.filmRetouchCatalog ? 'Hide 20 Film LUTs' : '🎞️ Browse 20 Film LUTs & Retouch'}</span>
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

                  {/* 🌟 20 FILM LUTS, RETOUCH & MAKEUP CAROUSEL DRAWER */}
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
                      <span>{expandedDrawers.qualityCatalog ? 'Hide Quality Engines' : '⚙️ Master Render Quality Engines'}</span>
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
                    className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-[#faf2ee] border border-[#d6c3b6]/40 text-xs"
                  >
                    <span>{chip.emoji || '✨'}</span>
                    <span className="font-semibold text-[#1e1b19]">
                      {isMyanmar ? chip.valueMm : chip.valueEn}
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
                <h3 className="font-sans text-base text-[#1e1b19] font-semibold">
                  Master Synthesized Prompt
                </h3>
                <span className="font-sans text-xs text-[#51443a]">
                  ထုတ်ပေးလိုက်သော AI စာသား
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#f4ece9] border border-[#d6c3b6]/30 px-3 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[16px] text-[#275546]">speed</span>
                <span className="font-sans text-xs text-[#1e1b19]">
                  Tokens: <strong className="text-[#704112] font-bold">{estimatedTokens}</strong>
                </span>
              </div>
            </div>

            {/* Active Parameters Pill Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-[#ffdf98]/50 text-[#5a4300] border border-[#775a00]/20 text-xs font-semibold">
                {engineSyntax.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffdcc2]/50 text-[#2e1500] border border-[#704112]/20 text-xs font-semibold">
                --ar {selection.aspectRatio || '16:9'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f4ece9] border border-[#d6c3b6]/30 text-[#1e1b19] text-xs font-medium">
                --style raw
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#bcedda]/50 text-[#214f41] border border-[#275546]/20 text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>Authenticity 99.4%</span>
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
                  <span>{engine.toUpperCase()} Prompt</span>
                </span>
                <span className={`font-sans text-xs text-[#00b473] font-bold transition-opacity ${copiedToast ? 'opacity-100' : 'opacity-0'}`}>
                  ✓ Copied to Clipboard
                </span>
              </div>

              {/* Synthesized Text */}
              <div className="font-mono text-xs text-[#1c1c1e] leading-relaxed select-all max-h-48 overflow-y-auto">
                {masterPromptText || 'Assembling master prompt from chosen parameters...'}
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
                <span>{copiedToast ? 'Copied!' : 'Copy Prompt'}</span>
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

            {/* Burmese Cultural Translation Breakdown Note in Miro Pastel Card */}
            <details className="group bg-[#fff8e0]/70 border border-[#fcb900]/30 rounded-xl p-3 text-xs cursor-pointer">
              <summary className="font-sans font-bold text-[#746019] flex items-center justify-between select-none list-none">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">translate</span>
                  <span>မြန်မာဘာသာ ယဉ်ကျေးမှုဆိုင်ရာ ရှင်းလင်းချက်</span>
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#746019] group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <p className="font-sans text-[11px] text-[#746019] leading-relaxed pt-2 border-t border-[#fcb900]/25 mt-2">
                {liveBuilt?.descriptionMm || 'ဤပရွမ့်ဖော်ပြချက်တွင် ရွေးချယ်ထားသော မြန်မာ့ရိုးရာ နန်းတွင်း ဝတ်စုံ၊ သနပ်ခါး၊ ဆံထုံး နှင့် နောက်ခံ ရှုခင်းတို့ကို အတိအကျ ပေါင်းစပ်ထားပြီး သဘာဝကျသော ရွှေရောင်အလင်းရောင်ဖြင့် ပုံဖော်ပေးပါသည်။'}
              </p>
            </details>

            {/* Generate Full AI Prompt Button - Miro Signature Black Button */}
            {onGeneratePrompt && (
              <button
                type="button"
                onClick={() => onGeneratePrompt(masterPromptText)}
                disabled={isGeneratingPrompt}
                className="w-full py-3 px-5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-sans text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPrompt ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin text-[#ffd02f]">refresh</span>
                    <span>AI Engine Synthesizing Master Prompt...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">electric_bolt</span>
                    <span>Generate Master AI Prompt</span>
                  </>
                )}
              </button>
            )}

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
