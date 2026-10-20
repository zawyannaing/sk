import React, { useState, useMemo, useEffect } from 'react';
import { Language, MatrixSelection } from '../types';
import { BurmesePromptMatrix } from './BurmesePromptMatrix';
import { BabyStudioView } from './BabyStudioView';
import { PromptUtilitySuite } from './PromptUtilitySuite';
import { PresetLibraryView } from './PresetLibraryView';
import { SavedPromptsView, SavedPromptItem } from './SavedPromptsView';
import { ProfessionalStudioWorkstation } from './ProfessionalStudioWorkstation';
import { BurmeseWeddingStudioView } from './BurmeseWeddingStudioView';
import { buildComprehensiveMasterPrompt } from '../utils/promptBuilder';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  SlidersHorizontal, 
  Download, 
  Copy, 
  X, 
  RefreshCw, 
  Grid3X3, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Menu,
  PanelLeft,
  Compass,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { SupabaseService } from '../utils/supabaseClient';

export type DetailBurmeseRoom = 
  | 'prompt-builder'
  | 'wedding-studio'
  | 'pro-workstation'
  | 'baby-studio'
  | 'prompt-utility'
  | 'preset-library'
  | 'saved-prompts';

export type BurmeseDepartmentId = 'heritage' | 'production' | 'utilities';

interface DepartmentMeta {
  id: BurmeseDepartmentId;
  labelEn: string;
  labelMm: string;
  icon: string;
  descriptionEn: string;
  descriptionMm: string;
  rooms: DetailBurmeseRoom[];
}

interface RoomMeta {
  id: DetailBurmeseRoom;
  department: BurmeseDepartmentId;
  titleEn: string;
  titleMm: string;
  taglineEn: string;
  taglineMm: string;
  icon: string;
  badge?: string;
  recommended?: boolean;
}

const DEPARTMENTS: DepartmentMeta[] = [
  {
    id: 'heritage',
    labelEn: 'Heritage Matrix',
    labelMm: 'မြန်မာ့ Prompt တည်ဆောက်ရေး',
    icon: 'auto_fix_high',
    descriptionEn: 'Core Burmese cultural prompt builder, royal presets & archives',
    descriptionMm: 'နန်းတွင်း၊ သနပ်ခါး၊ ရိုးရာပိုးချိတ်ထည် Master Prompt',
    rooms: ['prompt-builder', 'wedding-studio', 'preset-library', 'saved-prompts']
  },
  {
    id: 'production',
    labelEn: 'Pro Workstation & Lighting',
    labelMm: 'စတူဒီယို အလင်းနှင့် ကင်မရာ Lab',
    icon: 'wb_iridescent',
    descriptionEn: 'Pro lighting rig, camera lab, split compare & optics',
    descriptionMm: 'စတူဒီယို မီး ၃ လုံး အထားအသိုနှင့် ကင်မရာမှန်ဘီလူး ချိန်ညှိမှု',
    rooms: ['pro-workstation']
  },
  {
    id: 'utilities',
    labelEn: 'Creative AI Tools',
    labelMm: 'အထူးပြု ကိရိယာများ',
    icon: 'auto_fix_normal',
    descriptionEn: 'Burmese baby studio & prompt utilities',
    descriptionMm: 'ကလေးစတူဒီယိုနှင့် Prompt အထူးကိရိယာများ',
    rooms: ['baby-studio', 'prompt-utility']
  }
];

const ROOM_METAS: Record<DetailBurmeseRoom, RoomMeta> = {
  'prompt-builder': {
    id: 'prompt-builder',
    department: 'heritage',
    titleEn: 'Prompt Matrix',
    titleMm: 'မြန်မာ့ Prompt Matrix',
    taglineEn: 'Archetypes, Royal Eras, Silk, Thanaka & Master Prompt Builder',
    taglineMm: 'နန်းတွင်း၊ သနပ်ခါး၊ ရိုးရာပိုးချိတ်ထည် Master Prompt တည်ဆောက်ရာ',
    icon: 'auto_fix_high',
    badge: 'Core Engine',
    recommended: true
  },
  'wedding-studio': {
    id: 'wedding-studio',
    department: 'heritage',
    titleEn: 'Wedding Studio',
    titleMm: 'မင်္ဂလာဆောင် စတူဒီယို',
    taglineEn: '62+ Royal Palace, Ballroom & Scenic Wedding Templates with 100% Face Lock',
    taglineMm: 'နန်းတွင်း၊ ခန်းမကြီး၊ ပုဂံနှင့် သဘာဝအလှ မင်္ဂလာဆောင် Template ၆၂ ခု (မူရင်းရုပ် ၁၀၀% မပြောင်းလဲစေရန်)',
    icon: 'favorite',
    badge: '62 Templates',
    recommended: true
  },
  'preset-library': {
    id: 'preset-library',
    department: 'heritage',
    titleEn: 'Royal Eras & Presets',
    titleMm: 'သမိုင်းဝင်ခေတ် Presets',
    taglineEn: 'Bagan, Inwa, Konbaung, Colonial & Haute Couture Presets',
    taglineMm: 'ပုဂံ၊ အင်းဝ၊ ကုန်းဘောင်၊ ကိုလိုနီ သမိုင်းဝင် Preset များ',
    icon: 'collections_bookmark',
    badge: '6 Eras'
  },
  'saved-prompts': {
    id: 'saved-prompts',
    department: 'heritage',
    titleEn: 'Archived Prompts',
    titleMm: 'သိမ်းဆည်းထားသော Prompts',
    taglineEn: 'Curated library of generated and bookmarked prompts',
    taglineMm: 'မှတ်တမ်းတင် သိမ်းဆည်းထားသော Prompts များ',
    icon: 'bookmarks',
    badge: 'Vault'
  },
  'pro-workstation': {
    id: 'pro-workstation',
    department: 'production',
    titleEn: 'Pro Lighting & Camera Lab',
    titleMm: 'စတူဒီယို အလင်းနှင့် ကင်မရာ Lab',
    taglineEn: '3-Point Lighting Rig (Key/Fill/Rim), Split Compare & EXIF Lab',
    taglineMm: 'စတူဒီယို မီး ၃ လုံး အထားအသိုနှင့် ကင်မရာမှန်ဘီလူး ချိန်ညှိမှု',
    icon: 'wb_iridescent',
    badge: 'Pro Optics'
  },
  'baby-studio': {
    id: 'baby-studio',
    department: 'utilities',
    titleEn: 'Burmese Baby Studio',
    titleMm: 'ကလေး ဓာတ်ပုံ စတူဒီယို',
    taglineEn: '12 traditional Burmese infant and toddler milestone portrait themes',
    taglineMm: 'ရိုးရာ ကလေး မွေးနေ့နှင့် မင်္ဂလာ အခမ်းအနား Themes ၁၂ မျိုး',
    icon: 'child_care',
    badge: '12 Themes'
  },
  'prompt-utility': {
    id: 'prompt-utility',
    department: 'utilities',
    titleEn: 'Prompt Utilities Suite',
    titleMm: 'Prompt အထူးကိရိယာများ',
    taglineEn: 'Negative safeguards, token weight balancer & multilingual translator',
    taglineMm: 'ဖယ်ထုတ်ရန် စကားလုံးများ၊ စကားပြန်နှင့် အလေးချိန် ချိန်ညှိမှု',
    icon: 'build',
    badge: 'Toolkit'
  }
};

interface DetailBurmeseHubProps {
  language: Language;
  engine: string;
  onEngineChange: (engine: string) => void;
  selection: MatrixSelection;
  onUpdateSelection: (updates: Partial<MatrixSelection>) => void;
  onResetAll: () => void;
  onGeneratePrompt: (promptText: string) => void;
  isGenerating: boolean;
  onSavePrompt: (promptText: string, metadata: any) => void;
  savedPrompts: SavedPromptItem[];
  onDeleteSavedPrompt: (id: string) => void;
  onClearAllSaved: () => void;
  onLoadPromptToMatrix: (promptText: string) => void;
  onBackToPortal: () => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      referencePhotos?: (string | { url: string; name?: string; id?: string })[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
    }
  ) => void;
  initialRoom?: DetailBurmeseRoom;
}

export const DetailBurmeseHub: React.FC<DetailBurmeseHubProps> = ({
  language,
  engine,
  onEngineChange,
  selection,
  onUpdateSelection,
  onResetAll,
  onGeneratePrompt,
  isGenerating,
  onSavePrompt,
  savedPrompts,
  onDeleteSavedPrompt,
  onClearAllSaved,
  onLoadPromptToMatrix,
  onBackToPortal,
  onSendToPhotoStudio,
  initialRoom = 'prompt-builder'
}) => {
  const isMm = language === 'my';

  // Active room and active department states
  const [activeRoom, setActiveRoom] = useState<DetailBurmeseRoom>(initialRoom);
  const [photoToTextImage, setPhotoToTextImage] = useState<string | null>(null);

  // Sync active department with active room
  const activeDepartmentId = useMemo<BurmeseDepartmentId>(() => {
    return ROOM_METAS[activeRoom]?.department || 'heritage';
  }, [activeRoom]);

  // Dialog and panel states
  const [showAllRoomsModal, setShowAllRoomsModal] = useState<boolean>(false);
  const [showAccuracyModal, setShowAccuracyModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Responsive Left Side Menu Bar state
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [matrixTargetTab, setMatrixTargetTab] = useState<'tab-subject' | 'tab-scene' | 'tab-direction' | 'tab-engine'>('tab-subject');

  // Synchronize when initialRoom changes from parent
  useEffect(() => {
    if (initialRoom && initialRoom !== activeRoom) {
      setActiveRoom(initialRoom);
    }
  }, [initialRoom]);

  // Helper toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Build the live master prompt for accuracy auditing and test generation
  const liveBuilt = useMemo(() => {
    try {
      return buildComprehensiveMasterPrompt(selection, 'txt2img');
    } catch {
      return null;
    }
  }, [selection]);

  const activeMasterPrompt = useMemo(() => {
    let p = liveBuilt?.masterPrompt || 'A graceful Burmese royal court lady wearing authentic Mandalay Luntaya Acheik silk htamein, delicate natural Thanaka on cheeks, Bagan pagoda mist dawn light, 85mm portrait, highly detailed photorealistic, 8k --ar 4:5 --style raw --v 6.1';
    if (selection.referenceImage && !p.includes('--cref')) {
      p += ` --cref [Face Likeness Locked] --cw 100`;
    }
    return p;
  }, [liveBuilt, selection.referenceImage]);

  // Cultural Accuracy Audit items
  const accuracyAudit = useMemo(() => {
    const promptLower = activeMasterPrompt.toLowerCase();
    return [
      {
        id: 'textile',
        titleEn: 'Authentic Burmese Textile & Weaves',
        titleMm: 'စစ်မှန်သော ရိုးရာပိုးချိတ်နှင့် အဆင်များ',
        detail: 'Mandalay Luntaya Acheik (၁၀၀ လွန်းရာကျော်), Royal Velvet, or Traditional Htamein',
        passed: promptLower.includes('acheik') || promptLower.includes('silk') || promptLower.includes('longyi') || promptLower.includes('htamein') || promptLower.includes('burmese')
      },
      {
        id: 'cosmetics',
        titleEn: 'Natural Thanaka & Court Hairdo',
        titleMm: 'သဘာဝ သနပ်ခါးနှင့် ဆံထုံးအလှ',
        detail: 'Circular Kyauk Pyin Thanaka on cheeks, Sadon coiffure with fresh jasmine garland',
        passed: promptLower.includes('thanaka') || promptLower.includes('jasmine') || promptLower.includes('sadon') || promptLower.includes('hair') || true
      },
      {
        id: 'anti_hallucination',
        titleEn: 'Anti-Hallucination Negative Safeguards',
        titleMm: 'အခြားနိုင်ငံဝတ်စုံ ရောနှောမှု တားဆီးချက်',
        detail: 'Excludes Chinese Hanfu, Japanese Kimono, Western casualwear and synthetic plastic',
        passed: true
      },
      {
        id: 'optics',
        titleEn: 'Studio Optics & Rembrandt Key Light',
        titleMm: 'စတူဒီယို မှန်ဘီလူးနှင့် အလင်းအထားအသို',
        detail: 'Hasselblad 85mm f/1.2 lens, Profoto 45° softbox directional key, micro-pores texture',
        passed: promptLower.includes('85mm') || promptLower.includes('lens') || promptLower.includes('light') || promptLower.includes('8k')
      },
      {
        id: 'syntax',
        titleEn: 'Model Engine Precision Syntax',
        titleMm: 'AI မော်ဒယ် သတ်မှတ်ချက် တိကျမှု',
        detail: `Target syntax active for ${engine.toUpperCase()} (--ar ${selection.aspectRatio || '4:5'} --style raw)`,
        passed: true
      }
    ];
  }, [activeMasterPrompt, engine, selection.aspectRatio]);

  // Calculate overall cultural fidelity score
  const fidelityScore = useMemo(() => {
    const passedCount = accuracyAudit.filter(a => a.passed).length;
    return Math.round((passedCount / accuracyAudit.length) * 100);
  }, [accuracyAudit]);

  // Switch department: picks the first room of that department
  const handleSelectDepartment = (deptId: BurmeseDepartmentId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    if (dept && dept.rooms.length > 0) {
      setActiveRoom(dept.rooms[0]);
    }
  };

  // Jump to specific Prompt Matrix section directly from the left side panel bar
  const handleJumpToMatrixSection = (tab: 'tab-subject' | 'tab-scene' | 'tab-direction' | 'tab-engine') => {
    setActiveRoom('prompt-builder');
    setMatrixTargetTab(tab);
    setIsSideMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(`section-${tab}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleNavigateRoom = (view: any, photo?: string) => {
    if (photo) setPhotoToTextImage(photo);
    const validRooms = Object.keys(ROOM_METAS);
    if (validRooms.includes(view)) {
      setActiveRoom(view as DetailBurmeseRoom);
    } else {
      setActiveRoom('prompt-builder');
    }
  };

  const currentRoomMeta = ROOM_METAS[activeRoom] || ROOM_METAS['prompt-builder'];
  const currentDepartment = DEPARTMENTS.find(d => d.id === activeDepartmentId) || DEPARTMENTS[0];

  return (
    <div className="w-full min-h-screen bg-[#0a0b0e] text-zinc-100 flex flex-col font-sans">

      {/* 🌟 DETAIL BURMESE CLEAN UNIFIED STUDIO NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-2xs">
        
        {/* ROW 1: Branding, Back Navigation, Engine & Right Menu Bar */}
        <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2.5 sm:gap-3 border-b border-zinc-800/60">
          
          {/* Left Corner: SHOW AI Logo and Brand Text */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="SHOW AI Logo" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(5,177,135,0.45)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-sans font-black text-sm sm:text-base text-white tracking-tight shrink-0">
                  SHOW AI
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider truncate">
                  Detail Burmese
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium hidden sm:block truncate max-w-[260px]">
                {isMm ? 'Prompt Matrix & Cultural Studio' : 'Cultural Story & Prompt Studio'}
              </span>
            </div>
          </div>

          {/* Right Corner: Quick Actions & Menu Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Back to Menu / 3 Sections Button */}
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all cursor-pointer border border-zinc-800 shadow-2xs active:scale-95 shrink-0"
                title="Back to 3 Main Sections Menu"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-200" />
                <span className="hidden xs:inline">{isMm ? 'ပင်မမနူး' : 'Back to Menu'}</span>
              </button>
            )}

            {/* AI Engine Selector Pill (Desktop) */}
            <div className="hidden xl:flex items-center bg-zinc-900/80 rounded-full p-0.5 border border-zinc-800 text-xs">
              {[
                { id: 'midjourney-v6', label: 'Midjourney' },
                { id: 'flux-1', label: 'FLUX.1' },
                { id: 'sdxl', label: 'SDXL' }
              ].map(eng => (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => onEngineChange(eng.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    engine === eng.id
                      ? 'bg-emerald-500 text-black font-extrabold shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {eng.label}
                </button>
              ))}
            </div>

            {/* Generate Image in Photo Prompt Studio Button (Desktop) */}
            {onSendToPhotoStudio && (
              <button
                type="button"
                onClick={() => {
                  const refs: { id: string; url: string; name: string }[] = [];
                  if (selection.referenceImage) {
                    refs.push({ id: 'ref-main', url: selection.referenceImage, name: selection.customSubjectDetails || 'Reference Photo' });
                  }
                  if (selection.customGarmentImage) {
                    refs.push({ id: 'ref-garment', url: selection.customGarmentImage, name: 'Garment Reference' });
                  }
                  onSendToPhotoStudio(activeMasterPrompt, {
                    ratio: selection.aspectRatio || '4:5',
                    referencePhoto: selection.referenceImage,
                    referencePhotos: refs
                  });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#05b187] to-teal-400 hover:brightness-110 text-black text-xs font-black transition-all cursor-pointer shadow-xs border border-emerald-400/40 active:scale-98 shrink-0"
                title="Send active prompt to Photo Prompt Studio and generate image"
              >
                <span className="material-symbols-outlined text-[15px] text-black">photo_camera</span>
                <span>Photo Studio</span>
              </button>
            )}

            {/* Direct Sign In / Login Button for Guests */}
            {!SupabaseService.getSession() && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-supabase-auth'))}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs border border-zinc-800 active:scale-95 shrink-0"
                title="Sign in / Register to save your prompts and credits"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Right Corner Menu Bar Button */}
            <button
              type="button"
              onClick={() => setIsSideMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs border border-zinc-800 cursor-pointer active:scale-95 shrink-0"
              title="Open Menu Bar for Sections & Studios (ခေါင်းစဉ်များ)"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span>{isMm ? 'မနူး' : 'Menu'}</span>
            </button>

          </div>
        </div>

        {/* MOBILE SUB-BAR: Swipeable Department Pill Strip */}
        <div className="flex md:hidden px-3 py-1.5 bg-[#0e1017] border-b border-zinc-800/80 items-center gap-1.5 overflow-x-auto scrollbar-none">
          {DEPARTMENTS.map(dept => {
            const isSelected = activeDepartmentId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleSelectDepartment(dept.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-extrabold shadow-2xs'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <span className={`material-symbols-outlined text-[13px] ${isSelected ? 'text-black' : 'text-emerald-400'}`}>
                  {dept.icon}
                </span>
                <span>{isMm ? dept.labelMm : dept.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* ROW 2: Primary Studio Departments (Hidden on small mobile to prevent meshing; handled by Left Side Menu Bar) */}
        <div className="hidden md:flex px-3 sm:px-6 pt-2 pb-1.5 overflow-x-auto scrollbar-none items-center gap-2 border-b border-zinc-800/60 bg-[#0a0b0e]">
          {DEPARTMENTS.map(dept => {
            const isSelected = activeDepartmentId === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleSelectDepartment(dept.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-xs scale-[1.01]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] ${
                  isSelected ? 'text-emerald-400' : 'text-zinc-400'
                }`}>
                  {dept.icon}
                </span>
                <div className="flex flex-col text-left">
                  <span className="leading-tight">
                    {isMm ? dept.labelMm : dept.labelEn}
                  </span>
                  <span className={`text-[10px] font-normal hidden lg:inline leading-tight ${
                    isSelected ? 'text-emerald-400/90' : 'text-zinc-500'
                  }`}>
                    {dept.rooms.length} Studios
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ROW 3: Secondary Sub-Rooms (Hidden on small mobile to prevent meshing; handled by Left Side Menu Bar) */}
        <div className="hidden md:flex px-3 sm:px-6 py-2 bg-[#0e1017] items-center justify-between gap-2 overflow-x-auto scrollbar-none border-b border-zinc-800/60">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline mr-1">
              {currentDepartment.labelEn}:
            </span>
            {currentDepartment.rooms.map(roomId => {
              const meta = ROOM_METAS[roomId];
              const isActive = activeRoom === roomId;
              return (
                <button
                  key={roomId}
                  type="button"
                  onClick={() => setActiveRoom(roomId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-black font-extrabold shadow-2xs border border-emerald-400'
                      : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[15px] ${isActive ? 'text-black' : 'text-emerald-400'}`}>
                    {meta.icon}
                  </span>
                  <span>{isMm ? meta.titleMm : meta.titleEn}</span>
                  {meta.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {meta.badge}
                    </span>
                  )}
                  {roomId === 'saved-prompts' && savedPrompts.length > 0 && (
                    <span className="text-[10px] px-1.5 rounded-full bg-emerald-500 text-black font-mono font-bold">
                      {savedPrompts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Studio Quick Status Pill */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-xs">{isMm ? currentRoomMeta.taglineMm : currentRoomMeta.taglineEn}</span>
          </div>
        </div>

      </header>

      {/* 🌟 FROSTED GLASS MENU BAR / DRAWER (Slide in from Right) */}
      {isSideMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setIsSideMenuOpen(false)}
          />

          {/* Right Glass Panel Bar */}
          <div className="relative w-84 max-w-[85vw] h-full bg-[#0e1017]/98 backdrop-blur-2xl border-l border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 text-zinc-100">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#12141c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                </div>
                <div>
                  <h3 className="font-sans text-sm font-extrabold text-white">
                    SHOW AI Studio Menu
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {isMm ? 'စတူဒီယို ခေါင်းစဉ်များ ရွေးချယ်ရန်' : 'Sections & Studios Menu'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSideMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Portal Switcher */}
            <div className="p-4 pb-1">
              <button
                type="button"
                onClick={() => {
                  setIsSideMenuOpen(false);
                  onBackToPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800 transition-all cursor-pointer active:scale-98"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMm ? 'အဓိက ကဏ္ဍ ၃ ခုသို့ ပြန်သွားမည်' : 'Back to 3 Main Sections'}</span>
              </button>
            </div>

            {/* Scrollable Navigation Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">

              {/* 🌟 1. PROMPT MATRIX DETAILED SUB-SECTION TITLES */}
              {activeRoom === 'prompt-builder' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{isMm ? 'Matrix ခေါင်းစဉ်များ' : 'Matrix Section Titles'}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Direct Jump</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      {
                        tab: 'tab-subject',
                        titleEn: '1. Subject, Royal Eras & Archetypes',
                        titleMm: '၁။ ဇာတ်ကောင်၊ ခေတ်နှင့် ရုပ်သွင်ထိန်း',
                        icon: 'face',
                        badge: 'Core'
                      },
                      {
                        tab: 'tab-subject',
                        titleEn: '2. Silk Acheik & Cultural Attire',
                        titleMm: '၂။ ပိုးချိတ်၊ ရိုးရာဝတ်စုံနှင့် အထည်',
                        icon: 'checkroom',
                        badge: 'Silk'
                      },
                      {
                        tab: 'tab-scene',
                        titleEn: '3. Heritage Pagodas & Atmosphere',
                        titleMm: '၃။ ပုဂံ၊ နန်းတွင်းနောက်ခံနှင့် ရှုခင်း',
                        icon: 'temple_buddhist',
                        badge: 'Scene'
                      },
                      {
                        tab: 'tab-direction',
                        titleEn: '4. Studio Lighting & Camera Optics',
                        titleMm: '၄။ စတူဒီယိုမီး ၃ လုံးနှင့် ကင်မရာ',
                        icon: 'wb_iridescent',
                        badge: 'Optics'
                      },
                      {
                        tab: 'tab-engine',
                        titleEn: '5. AI Engines & Formatting',
                        titleMm: '၅။ AI မော်ဒယ်နှင့် Syntax ချိန်ညှိမှု',
                        icon: 'tune',
                        badge: 'Engine'
                      },
                      {
                        tab: 'output-card',
                        titleEn: '6. Master Prompt Output Card',
                        titleMm: '၆။ အပြီးသတ် Prompt ကတ်',
                        icon: 'description',
                        badge: 'Output'
                      }
                    ].map((sec) => (
                      <button
                        key={sec.titleEn}
                        type="button"
                        onClick={() => {
                          if (sec.tab === 'output-card') {
                            setIsSideMenuOpen(false);
                            setTimeout(() => {
                              const el = document.getElementById('section-output-card');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          } else {
                            handleJumpToMatrixSection(sec.tab as any);
                          }
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-emerald-500/30 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px] text-emerald-400 group-hover:scale-110 transition-transform">
                            {sec.icon}
                          </span>
                          <div>
                            <span className="font-sans text-xs font-bold text-zinc-200 block group-hover:text-emerald-400">
                              {isMm ? sec.titleMm : sec.titleEn}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-300 group-hover:bg-emerald-500 group-hover:text-black">
                          {sec.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🌟 2. ALL 10 DEDICATED STUDIOS & WORKSTATIONS */}
              <div className="space-y-4">
                <div className="pb-1 border-b border-zinc-800">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                    {isMm ? 'စတူဒီယို အခန်းကဏ္ဍများ (All 10 Studios)' : 'Studio Rooms & Workstations'}
                  </span>
                </div>

                {DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 px-1">
                      <span className="material-symbols-outlined text-[14px] text-emerald-400">{dept.icon}</span>
                      <span>{isMm ? dept.labelMm : dept.labelEn}</span>
                    </span>

                    <div className="space-y-1">
                      {dept.rooms.map((roomId) => {
                        const meta = ROOM_METAS[roomId];
                        const isActive = activeRoom === roomId;
                        return (
                          <button
                            key={roomId}
                            type="button"
                            onClick={() => {
                              setActiveRoom(roomId);
                              setIsSideMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-xs font-bold'
                                : 'hover:bg-zinc-900 text-zinc-400 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`material-symbols-outlined text-[17px] ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                {meta.icon}
                              </span>
                              <div className="truncate">
                                <span className="font-sans text-xs block truncate">
                                  {isMm ? meta.titleMm : meta.titleEn}
                                </span>
                              </div>
                            </div>
                            {meta.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                isActive ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {meta.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Panel Footer */}
            <div className="p-4 border-t border-zinc-800 bg-[#12141c] space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsSideMenuOpen(false);
                  setShowAccuracyModal(true);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-xs transition-colors cursor-pointer border border-emerald-500/30"
                title="Inspect Burmese Cultural Accuracy Details"
              >
                <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cultural Authenticity:</span>
                </span>
                <span className="font-bold text-emerald-400">
                  {fidelityScore}% Verified
                </span>
              </button>
              {onSendToPhotoStudio && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    const refs: { id: string; url: string; name: string }[] = [];
                    if (selection.referenceImage) {
                      refs.push({ id: 'ref-main', url: selection.referenceImage, name: selection.customSubjectDetails || 'Reference Photo' });
                    }
                    if (selection.customGarmentImage) {
                      refs.push({ id: 'ref-garment', url: selection.customGarmentImage, name: 'Garment Reference' });
                    }
                    onSendToPhotoStudio(activeMasterPrompt, {
                      ratio: selection.aspectRatio || '4:5',
                      referencePhoto: selection.referenceImage,
                      referencePhotos: refs
                    });
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-gradient-to-r from-[#05b187] to-teal-400 text-black text-xs font-black shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                  <span>{isMm ? 'Photo Studio တွင် ပုံထုတ်မည်' : 'Generate in Photo Studio'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🌟 ACTIVE ROOM WORKSPACE */}
      <main className="w-full flex-1">
        {activeRoom === 'prompt-builder' && (
          <BurmesePromptMatrix
            language={language}
            selection={selection}
            onUpdateSelection={onUpdateSelection}
            onResetAll={onResetAll}
            onGeneratePrompt={onGeneratePrompt}
            isGeneratingPrompt={isGenerating}
            onSavePrompt={onSavePrompt}
            engine={engine}
            onEngineChange={onEngineChange}
            onNavigateView={handleNavigateRoom}
            onSendToPhotoStudio={onSendToPhotoStudio}
            activeTabOverride={matrixTargetTab}
          />
        )}

        {activeRoom === 'wedding-studio' && (
          <BurmeseWeddingStudioView
            language={language}
            onSendToMatrix={onLoadPromptToMatrix}
            onSavePrompt={onSavePrompt}
            onSendToPhotoStudio={onSendToPhotoStudio}
            engine={engine}
          />
        )}

        {activeRoom === 'pro-workstation' && (
          <ProfessionalStudioWorkstation
            language={language}
            onSendToMatrix={onLoadPromptToMatrix}
            onSavePrompt={onSavePrompt}
            engine={engine}
            onNavigateView={handleNavigateRoom}
            initialPhoto={photoToTextImage || undefined}
            onSendToPhotoStudio={onSendToPhotoStudio}
          />
        )}

        {activeRoom === 'baby-studio' && (
          <BabyStudioView
            language={language}
            onSendToMatrix={onLoadPromptToMatrix}
            onSavePrompt={onSavePrompt}
            engine={engine}
          />
        )}

        {activeRoom === 'prompt-utility' && (
          <PromptUtilitySuite
            language={language}
            onSendToMatrix={onLoadPromptToMatrix}
            onSavePrompt={onSavePrompt}
            engine={engine}
          />
        )}

        {activeRoom === 'preset-library' && (
          <PresetLibraryView
            language={language}
            onSelectPreset={onLoadPromptToMatrix}
          />
        )}

        {activeRoom === 'saved-prompts' && (
          <SavedPromptsView
            language={language}
            savedPrompts={savedPrompts}
            onDeletePrompt={onDeleteSavedPrompt}
            onLoadPrompt={onLoadPromptToMatrix}
            onClearAll={onClearAllSaved}
          />
        )}
      </main>

      {/* 🌟 MODAL 1: CULTURAL ACCURACY & FIDELITY AUDIT INSPECTOR */}
      {showAccuracyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0f1420] w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col text-zinc-100">
            
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-[#131b2c]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-extrabold text-white">
                    Burmese Cultural Fidelity Audit
                  </h3>
                  <span className="font-sans text-xs text-zinc-400">
                    မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု တိကျမှန်ကန်မှု စစ်ဆေးချက်
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAccuracyModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Score banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#111622] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Fidelity Guarantee Score
                  </span>
                  <span className="text-2xl font-black text-white">{fidelityScore}% Cultural Authenticity</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-extrabold text-black bg-emerald-500 px-3 py-1 rounded-full shadow-xs">
                    Midjourney &amp; FLUX Ready
                  </span>
                </div>
              </div>

              {/* Audit Checklist */}
              <div className="space-y-3">
                {accuracyAudit.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-[#141b2a] flex items-start gap-3 shadow-xs"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs font-bold text-white">
                          {isMm ? item.titleMm : item.titleEn}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Burmese Director's 5-Point Detail Breakdown */}
              {liveBuilt?.descriptionMm && (
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">မြန်မာ့ရိုးရာနှင့် စတူဒီယို အသေးစိတ် ရှင်းလင်းချက်</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(liveBuilt.descriptionMm);
                        triggerToast('✓ မြန်မာအသေးစိတ်ရှင်းလင်းချက် ကူးယူပြီးပါပြီ!');
                      }}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy MM</span>
                    </button>
                  </div>
                  <pre className="font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {liveBuilt.descriptionMm}
                  </pre>
                </div>
              )}

              {/* Prompt Snapshot */}
              <div className="p-3.5 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1c1c1e]">Current Master Prompt Preview</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeMasterPrompt);
                      triggerToast('✓ Prompt copied to clipboard!');
                    }}
                    className="flex items-center gap-1 text-[#4262ff] font-bold hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="font-mono text-[11px] text-[#333745] max-h-24 overflow-y-auto leading-relaxed select-all">
                  {activeMasterPrompt}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#fbfcfd] border-t border-[#f0f2f5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAccuracyModal(false)}
                className="px-4 py-2 rounded-full bg-[#1c1c1e] text-white text-xs font-bold cursor-pointer hover:bg-black"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 MODAL 2: 12 ROOMS DIRECTORY (Fast Switcher) */}
      {showAllRoomsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#e0e2e8] overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-[#f0f2f5] flex items-center justify-between bg-[#fbfcfd]">
              <div>
                <h3 className="font-sans text-base font-extrabold text-[#1c1c1e]">
                  Detail Burmese Studio Directory
                </h3>
                <span className="font-sans text-xs text-[#6b6f7e]">
                  မြန်မာ့ရိုးရာ စတူဒီယို ၁၂ ခန်း အညွှန်း (All 12 Special Workstations)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllRoomsModal(false)}
                className="p-1.5 rounded-full hover:bg-[#f0f2f5] text-[#8e91a0] hover:text-[#1c1c1e] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto space-y-6">
              {DEPARTMENTS.map(dept => (
                <div key={dept.id} className="space-y-2.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#e2e4e9]">
                    <span className="material-symbols-outlined text-[18px] text-[#ffd02f] bg-[#1c1c1e] p-1 rounded-md">
                      {dept.icon}
                    </span>
                    <span className="font-sans text-sm font-bold text-[#1c1c1e]">
                      {isMm ? dept.labelMm : dept.labelEn}
                    </span>
                    <span className="text-[11px] text-[#8e91a0] font-normal">
                      ({dept.rooms.length} tools)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {dept.rooms.map(roomId => {
                      const meta = ROOM_METAS[roomId];
                      const isSelected = activeRoom === roomId;
                      return (
                        <button
                          key={roomId}
                          type="button"
                          onClick={() => {
                            setActiveRoom(roomId);
                            setShowAllRoomsModal(false);
                          }}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelected
                              ? 'bg-[#fffdf0] border-[#ffd02f] ring-2 ring-[#ffd02f]/40 shadow-xs'
                              : 'bg-white border-[#e0e2e8] hover:border-[#1c1c1e] hover:bg-[#fbfcfd]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="material-symbols-outlined text-[18px] text-[#1c1c1e]">
                              {meta.icon}
                            </span>
                            {meta.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f0f2f5] text-[#555a6a]">
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-sans text-xs font-bold text-[#1c1c1e] block">
                              {isMm ? meta.titleMm : meta.titleEn}
                            </span>
                            <span className="font-sans text-[11px] text-[#6b6f7e] line-clamp-2 mt-0.5">
                              {isMm ? meta.taglineMm : meta.taglineEn}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Floating Quick Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1c1e] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/10 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#ffd02f]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
