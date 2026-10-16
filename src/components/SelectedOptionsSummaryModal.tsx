import React, { useState, useMemo } from 'react';
import { MatrixSelection, Language } from '../types';

export type PillarId = 'box1' | 'box2' | 'box3' | 'box4';
import {
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ExternalLink,
  Wand2
} from 'lucide-react';
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
  POSE_EXPRESSION_OPTIONS
} from '../data/presetData';

export interface PickedOptionItem {
  id: string; // key matching selection
  pillarId: PillarId;
  subMenuId: string;
  boxNumber: string;
  boxLabel: string;
  categoryLabelMm: string;
  categoryLabelEn: string;
  valueLabelMm: string;
  valueLabelEn: string;
  emoji?: string;
  canDelete: boolean;
  canEdit: boolean;
  description?: string;
}

interface SelectedOptionsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: MatrixSelection;
  language: Language;
  onEditOption: (pillarId: PillarId, subMenuId: string) => void;
  onDeleteOption: (optionId: string) => void;
  onResetAll: () => void;
  onGeneratePrompt: () => void;
  isGeneratingPrompt?: boolean;
}

export const SelectedOptionsSummaryModal: React.FC<SelectedOptionsSummaryModalProps> = ({
  isOpen,
  onClose,
  selection,
  language,
  onEditOption,
  onDeleteOption,
  onResetAll,
  onGeneratePrompt,
  isGeneratingPrompt
}) => {
  const isMyanmar = language === 'my';
  const [filterBox, setFilterBox] = useState<'all' | 'box1' | 'box2' | 'box3' | 'box4'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Assemble all active picked options
  const pickedOptions = useMemo<PickedOptionItem[]>(() => {
    const list: PickedOptionItem[] = [];

    // --- Box 1: Subject & Identity ---
    // 1. Subject Type
    const subOpt = SUBJECT_OPTIONS.find(s => s.id === selection.subject);
    if (selection.subject && selection.subject !== 'skip') {
      list.push({
        id: 'subject',
        pillarId: 'box1',
        subMenuId: 'subject_type',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'ဇာတ်ကောင် အမျိုးအစား',
        categoryLabelEn: 'Subject Category',
        valueLabelMm: subOpt?.labelMm || selection.subject,
        valueLabelEn: subOpt?.labelEn || selection.subject,
        emoji: subOpt?.emoji || '👤',
        canDelete: true,
        canEdit: true,
        description: selection.customSubjectDetails ? `Custom: ${selection.customSubjectDetails}` : undefined
      });
    }

    // 2. Identity Lock
    if (selection.identityLock && selection.identityLock !== 'skip' && selection.identityLock !== 'no_lock') {
      const lockOpt = IDENTITY_LOCK_OPTIONS.find(l => l.id === selection.identityLock);
      list.push({
        id: 'identityLock',
        pillarId: 'box1',
        subMenuId: 'identity_lock',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'မျက်နှာထိန်းချုပ်မှု',
        categoryLabelEn: 'Identity Lock',
        valueLabelMm: lockOpt?.labelMm || '100% Face Lock',
        valueLabelEn: lockOpt?.labelEn || '100% Face Lock',
        emoji: lockOpt?.emoji || '🔒',
        canDelete: true,
        canEdit: true
      });
    }

    // 3. Reference Image
    if (selection.referenceImage) {
      list.push({
        id: 'referenceImage',
        pillarId: 'box1',
        subMenuId: 'identity_lock',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'ရည်ညွှန်း ဓာတ်ပုံ',
        categoryLabelEn: 'Reference Photo',
        valueLabelMm: 'ဓာတ်ပုံ တင်ထားသည်',
        valueLabelEn: 'User Reference Photo Attached',
        emoji: '🖼️',
        canDelete: true,
        canEdit: true
      });
    }

    // 4. Ethnicity
    if (selection.ethnicity && selection.ethnicity !== 'skip') {
      const ethOpt = ETHNICITY_OPTIONS.find(e => e.id === selection.ethnicity);
      list.push({
        id: 'ethnicity',
        pillarId: 'box1',
        subMenuId: 'ethnicity_culture',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'လူမျိုးနှင့် ယဉ်ကျေးမှု',
        categoryLabelEn: 'Ethnicity & Culture',
        valueLabelMm: ethOpt?.labelMm || selection.ethnicity,
        valueLabelEn: ethOpt?.labelEn || selection.ethnicity,
        emoji: ethOpt?.emoji || '🇲🇲',
        canDelete: true,
        canEdit: true
      });
    }

    // 5. Pose & Expression
    if (selection.poseExpression && selection.poseExpression !== 'skip') {
      const poseOpt = POSE_EXPRESSION_OPTIONS.find(p => p.id === selection.poseExpression);
      list.push({
        id: 'pose',
        pillarId: 'box1',
        subMenuId: 'pose_expression',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'ဟန်ပန်နှင့် အမူအရာ',
        categoryLabelEn: 'Pose & Expression',
        valueLabelMm: poseOpt?.labelMm || selection.poseExpression,
        valueLabelEn: poseOpt?.labelEn || selection.poseExpression,
        emoji: poseOpt?.emoji || '🧘',
        canDelete: true,
        canEdit: true
      });
    }

    // 6. Stature / Age
    if (selection.ageRange || selection.heightRange) {
      list.push({
        id: 'stature',
        pillarId: 'box1',
        subMenuId: 'physical_profile',
        boxNumber: '1',
        boxLabel: 'Box1',
        categoryLabelMm: 'အသက်နှင့် အရပ်အမောင်း',
        categoryLabelEn: 'Age & Physical Stature',
        valueLabelMm: `${selection.ageRange || 'Adult'} · ${selection.heightRange || 'Standard'}`,
        valueLabelEn: `${selection.ageRange || 'Adult'} · ${selection.heightRange || 'Standard'}`,
        emoji: '📏',
        canDelete: true,
        canEdit: true
      });
    }

    // --- Box 2: Wardrobe & Clothes ---
    // 7. Garment Style
    if (selection.garmentStyle && selection.garmentStyle !== 'skip') {
      const gOpt = GARMENT_OPTIONS.find(g => g.id === selection.garmentStyle);
      list.push({
        id: 'garment',
        pillarId: 'box2',
        subMenuId: 'garment_catalog',
        boxNumber: '2',
        boxLabel: 'Box2',
        categoryLabelMm: 'ဝတ်စုံ စတိုင်လ်',
        categoryLabelEn: 'Garment & Outfit',
        valueLabelMm: gOpt?.labelMm || selection.garmentStyle,
        valueLabelEn: gOpt?.labelEn || selection.garmentStyle,
        emoji: gOpt?.emoji || '👗',
        canDelete: true,
        canEdit: true
      });
    }

    // 8. Fabric Material
    if (selection.garmentFabric && selection.garmentFabric !== 'skip') {
      list.push({
        id: 'fabric',
        pillarId: 'box2',
        subMenuId: 'fabric_texture',
        boxNumber: '2',
        boxLabel: 'Box2',
        categoryLabelMm: 'ပိတ်စ အမျိုးအစား',
        categoryLabelEn: 'Fabric & Material',
        valueLabelMm: selection.garmentFabric,
        valueLabelEn: selection.garmentFabric,
        emoji: '🧵',
        canDelete: true,
        canEdit: true
      });
    }

    // 9. Cultural Props
    if (selection.includeCulturalProps || selection.culturalPropsDetails) {
      list.push({
        id: 'culturalProps',
        pillarId: 'box2',
        subMenuId: 'cultural_accessories',
        boxNumber: '2',
        boxLabel: 'Box2',
        categoryLabelMm: 'ရိုးရာ အသုံးအဆောင်',
        categoryLabelEn: 'Cultural Props & Ornaments',
        valueLabelMm: selection.culturalPropsDetails || 'သနပ်ခါး၊ စပယ်ပန်းကုံးနှင့် ရိုးရာရတနာ',
        valueLabelEn: selection.culturalPropsDetails || 'Thanaka, Jasmine Garland & Traditional Jewelry',
        emoji: '🌸',
        canDelete: true,
        canEdit: true
      });
    }

    // 10. Custom Garment Upload
    if (selection.customGarmentImage) {
      list.push({
        id: 'customGarment',
        pillarId: 'box2',
        subMenuId: 'clothes_swap_studio',
        boxNumber: '2',
        boxLabel: 'Box2',
        categoryLabelMm: 'ကိုယ်ပိုင်ဝတ်စုံ ဓာတ်ပုံ',
        categoryLabelEn: 'Custom Garment Photo',
        valueLabelMm: selection.customGarmentDescription || 'ဝတ်စုံ ပုံတင်ထားသည်',
        valueLabelEn: selection.customGarmentDescription || 'Custom Reference Attire Attached',
        emoji: '👚',
        canDelete: true,
        canEdit: true
      });
    }

    // --- Box 3: Scene, Environment & Lighting ---
    // 11. Event / Festival
    if (selection.event && selection.event !== 'skip') {
      const evOpt = EVENT_OPTIONS.find(e => e.id === selection.event);
      list.push({
        id: 'event',
        pillarId: 'box3',
        subMenuId: 'events_festivals',
        boxNumber: '3',
        boxLabel: 'Box3',
        categoryLabelMm: 'ပွဲတော်နှင့် အခမ်းအနား',
        categoryLabelEn: 'Festival & Event',
        valueLabelMm: evOpt?.labelMm || selection.event,
        valueLabelEn: evOpt?.labelEn || selection.event,
        emoji: evOpt?.emoji || '🎉',
        canDelete: true,
        canEdit: true,
        description: selection.customEventDetails ? `Custom: ${selection.customEventDetails}` : undefined
      });
    }

    // 12. Location Backdrop
    if (selection.location && selection.location !== 'skip') {
      const locOpt = LOCATION_OPTIONS.find(l => l.id === selection.location);
      list.push({
        id: 'location',
        pillarId: 'box3',
        subMenuId: 'locations_environments',
        boxNumber: '3',
        boxLabel: 'Box3',
        categoryLabelMm: 'နောက်ခံ ရှုခင်း',
        categoryLabelEn: 'Location Backdrop',
        valueLabelMm: locOpt?.labelMm || selection.location,
        valueLabelEn: locOpt?.labelEn || selection.location,
        emoji: locOpt?.emoji || '📍',
        canDelete: true,
        canEdit: true,
        description: selection.customLocationDetails ? `Custom: ${selection.customLocationDetails}` : undefined
      });
    }

    // 13. Studio Lighting
    if (selection.timeAndLighting && selection.timeAndLighting !== 'skip') {
      const litOpt = LIGHTING_OPTIONS.find(li => li.id === selection.timeAndLighting);
      list.push({
        id: 'lighting',
        pillarId: 'box3',
        subMenuId: 'lighting_ambiance',
        boxNumber: '3',
        boxLabel: 'Box3',
        categoryLabelMm: 'စတူဒီယို အလင်းအမှောင်',
        categoryLabelEn: 'Lighting Ambiance',
        valueLabelMm: litOpt?.labelMm || selection.timeAndLighting,
        valueLabelEn: litOpt?.labelEn || selection.timeAndLighting,
        emoji: litOpt?.emoji || '💡',
        canDelete: true,
        canEdit: true
      });
    }

    // 14. Mood & Emotion
    if (selection.moodEmotion && selection.moodEmotion !== 'skip') {
      const moodOpt = MOOD_OPTIONS.find(m => m.id === selection.moodEmotion);
      list.push({
        id: 'mood',
        pillarId: 'box3',
        subMenuId: 'mood_emotion',
        boxNumber: '3',
        boxLabel: 'Box3',
        categoryLabelMm: 'ခံစားချက် ရသ',
        categoryLabelEn: 'Mood & Emotion',
        valueLabelMm: moodOpt?.labelMm || selection.moodEmotion,
        valueLabelEn: moodOpt?.labelEn || selection.moodEmotion,
        emoji: moodOpt?.emoji || '✨',
        canDelete: true,
        canEdit: true
      });
    }

    // --- Box 4: Camera & Optics Matrix ---
    // 15. Camera Body & Lens
    if (selection.camera && selection.camera !== 'skip') {
      const camOpt = CAMERA_OPTIONS.find(c => c.id === selection.camera);
      list.push({
        id: 'camera',
        pillarId: 'box4',
        subMenuId: 'camera_lens',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'ကင်မရာနှင့် မှန်ဘီလူး',
        categoryLabelEn: 'Camera & Lens',
        valueLabelMm: camOpt?.label || selection.camera,
        valueLabelEn: camOpt?.label || selection.camera,
        emoji: '📷',
        canDelete: true,
        canEdit: true
      });
    }

    // 16. Camera Angle
    if (selection.cameraAngle && selection.cameraAngle !== 'skip') {
      const angOpt = CAMERA_ANGLE_OPTIONS.find(a => a.id === selection.cameraAngle);
      list.push({
        id: 'cameraAngle',
        pillarId: 'box4',
        subMenuId: 'camera_angles',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'ကင်မရာ ရှုထောင့်',
        categoryLabelEn: 'Camera Angle',
        valueLabelMm: angOpt?.labelMm || selection.cameraAngle,
        valueLabelEn: angOpt?.labelEn || selection.cameraAngle,
        emoji: angOpt?.emoji || '📐',
        canDelete: true,
        canEdit: true
      });
    }

    // 17. Color Film / LUT
    if (selection.colorGrade && selection.colorGrade !== 'skip') {
      const colOpt = COLOR_GRADE_OPTIONS.find(c => c.id === selection.colorGrade);
      list.push({
        id: 'colorGrade',
        pillarId: 'box4',
        subMenuId: 'color_film',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'ဖလင် အရောင် LUT',
        categoryLabelEn: 'Color Film Stock',
        valueLabelMm: colOpt?.labelMm || selection.colorGrade,
        valueLabelEn: colOpt?.labelEn || selection.colorGrade,
        emoji: '🎞️',
        canDelete: true,
        canEdit: true
      });
    }

    // 18. Skin Retouching
    if (selection.retouching && selection.retouching !== 'skip') {
      const retOpt = RETOUCH_OPTIONS.find(r => r.id === selection.retouching);
      list.push({
        id: 'retouching',
        pillarId: 'box4',
        subMenuId: 'retouch_makeup',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'အသားအရေ ပြင်ဆင်မှု',
        categoryLabelEn: 'Skin Retouching',
        valueLabelMm: retOpt?.labelMm || selection.retouching,
        valueLabelEn: retOpt?.labelEn || selection.retouching,
        emoji: '✨',
        canDelete: true,
        canEdit: true
      });
    }

    // 19. Makeup
    if (selection.makeup && selection.makeup !== 'skip') {
      const makOpt = MAKEUP_OPTIONS.find(m => m.id === selection.makeup);
      list.push({
        id: 'makeup',
        pillarId: 'box4',
        subMenuId: 'retouch_makeup',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'မိတ်ကပ် စတိုင်လ်',
        categoryLabelEn: 'Makeup Styling',
        valueLabelMm: makOpt?.labelMm || selection.makeup,
        valueLabelEn: makOpt?.labelEn || selection.makeup,
        emoji: '💄',
        canDelete: true,
        canEdit: true
      });
    }

    // 20. Aspect Ratio
    if (selection.aspectRatio) {
      const arOpt = ASPECT_RATIOS.find(a => a.ratio === selection.aspectRatio);
      list.push({
        id: 'aspectRatio',
        pillarId: 'box4',
        subMenuId: 'camera_lens',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'ဓာတ်ပုံ အချိုးအစား',
        categoryLabelEn: 'Aspect Ratio',
        valueLabelMm: `${selection.aspectRatio} (${arOpt?.label || 'Portrait'})`,
        valueLabelEn: `${selection.aspectRatio} (${arOpt?.label || 'Portrait'})`,
        emoji: '📐',
        canDelete: true,
        canEdit: true
      });
    }

    // 21. Quality Profile
    if (selection.qualityProfile && selection.qualityProfile !== 'skip') {
      const qOpt = QUALITY_PROFILES.find(q => q.id === selection.qualityProfile);
      list.push({
        id: 'qualityProfile',
        pillarId: 'box4',
        subMenuId: 'quality_engine_settings',
        boxNumber: '4',
        boxLabel: 'Box4',
        categoryLabelMm: 'အရည်အသွေး အင်ဂျင်',
        categoryLabelEn: 'Quality Profile',
        valueLabelMm: qOpt?.label || selection.qualityProfile,
        valueLabelEn: qOpt?.label || selection.qualityProfile,
        emoji: '⚡',
        canDelete: true,
        canEdit: true
      });
    }

    return list;
  }, [selection]);

  // Filter items by box and search
  const filteredOptions = useMemo(() => {
    return pickedOptions.filter(item => {
      const matchBox = filterBox === 'all' || item.pillarId === filterBox;
      if (!matchBox) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.categoryLabelEn.toLowerCase().includes(q) ||
        item.categoryLabelMm.toLowerCase().includes(q) ||
        item.valueLabelEn.toLowerCase().includes(q) ||
        item.valueLabelMm.toLowerCase().includes(q)
      );
    });
  }, [pickedOptions, filterBox, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090D16] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-800/50">
              <Sliders className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {isMyanmar ? 'ရွေးချယ်ထားသော အချက်အလက်များ အကျဉ်းချုပ်' : 'Active Selections Summary'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  {pickedOptions.length} Options
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isMyanmar
                  ? 'ရွေးချယ်ထားသော အချက်အလက်များကို ကြည့်ရှု၊ ပြင်ဆင် (Edit) သို့မဟုတ် ဖြုတ်ပယ် (Delete) နိုင်ပါသည်'
                  : 'View, edit, or delete any selected attribute before generating your prompt'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Box Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
            {[
              { id: 'all', label: isMyanmar ? 'အားလုံး' : 'All', count: pickedOptions.length },
              { id: 'box1', label: 'Box 1: Subject', count: pickedOptions.filter(o => o.pillarId === 'box1').length },
              { id: 'box2', label: 'Box 2: Wardrobe', count: pickedOptions.filter(o => o.pillarId === 'box2').length },
              { id: 'box3', label: 'Box 3: Scene', count: pickedOptions.filter(o => o.pillarId === 'box3').length },
              { id: 'box4', label: 'Box 4: Camera', count: pickedOptions.filter(o => o.pillarId === 'box4').length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterBox(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  filterBox === tab.id
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-black/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterBox === tab.id ? 'bg-black text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMyanmar ? 'အချက်အလက် ရှာဖွေရန်...' : 'Search options...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Options List Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredOptions.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Sliders className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">
                {isMyanmar ? 'ရှာဖွေတွေ့ရှိသော အချက်အလက် မရှိပါ' : 'No matching options found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredOptions.map((item) => (
                <div
                  key={item.id}
                  className="group relative p-3.5 rounded-2xl bg-black/70 border border-slate-800 hover:border-slate-700 hover:bg-black/90 transition-all flex items-start justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Emoji / Icon Badge */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-base shadow-inner">
                      {item.emoji || '✨'}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Box badge + Category name */}
                      <div className="flex items-center gap-1.5 pb-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800/80 text-cyan-300 border border-slate-700/50">
                          {item.boxLabel}
                        </span>
                        <span className="text-xs font-bold text-slate-300 truncate">
                          {isMyanmar ? item.categoryLabelMm : item.categoryLabelEn}
                        </span>
                      </div>

                      {/* Picked Value */}
                      <p className="text-xs sm:text-sm font-extrabold text-white truncate group-hover:text-cyan-200 transition-colors">
                        {isMyanmar ? item.valueLabelMm : item.valueLabelEn}
                      </p>

                      {item.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete buttons */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    {item.canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          onEditOption(item.pillarId, item.subMenuId);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-700/60 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
                        title={isMyanmar ? 'ဤအချက်ကို ပြင်ဆင်မည်' : 'Edit this option'}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{isMyanmar ? 'ပြင်မည်' : 'Edit'}</span>
                      </button>
                    )}

                    {item.canDelete && (
                      <button
                        type="button"
                        onClick={() => onDeleteOption(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition-all shadow-sm"
                        title={isMyanmar ? 'ဤအချက်ကို ဖြုတ်မည် (Default ပြန်ထားမည်)' : 'Delete or reset this option'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onResetAll();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-600/60 text-xs font-bold text-slate-400 hover:text-rose-300 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
            <span>{isMyanmar ? 'အားလုံးကို မူလအတိုင်း ပြန်ထားမည် (Reset All)' : 'Reset All to Defaults'}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:border-slate-700 transition-all"
            >
              {isMyanmar ? 'ပြီးပါပြီ (Done)' : 'Close'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onGeneratePrompt();
              }}
              disabled={isGeneratingPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:opacity-95 text-xs font-black text-white shadow-lg transition-all disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
              <span>{isMyanmar ? 'Prompt ထုတ်ယူမည် (Generate)' : 'Generate Master Prompt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
