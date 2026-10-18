import React, { useState, useRef } from 'react';
import { Language } from '../types';

interface AjaxStudioSuiteViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
  onNavigateView?: (view: any, photoUrl?: string) => void;
  initialRoomId?: StudioRoomId;
}

export type StudioRoomId =
  | 'album-studio'
  | 'persona'
  | 'beauty'
  | 'fashion'
  | 'creative-director'
  | 'finalize'
  | 'skin-retouch'
  | 'event-portrait';

interface StudioRoomMeta {
  id: StudioRoomId;
  num: string;
  title: string;
  subtitleEn: string;
  subtitleMm: string;
  icon: string;
  badge: string;
  previewImage: string;
}

export const STUDIO_ROOMS: StudioRoomMeta[] = [
  {
    id: 'album-studio',
    num: '01',
    title: 'Album Studio',
    subtitleEn: 'One client job from faces to the printed album.',
    subtitleMm: 'မျက်နှာသွင်ပြင်မှ ပရင့်အယ်လ်ဘမ်အထိ ပြီးပြည့်စုံသော ကာစတန်မာ ပရောဂျက်',
    icon: 'auto_stories',
    badge: 'Job to Print',
    previewImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'persona',
    num: '02',
    title: 'Persona',
    subtitleEn: 'Establish the subject: identity, beauty, pose and expression.',
    subtitleMm: 'ကာရိုက်တာ သတ်မှတ်ခြင်း - မူရင်းမျက်နှာ Identity၊ အလှ၊ အမူအရာနှင့် ကိုယ်နေဟန်ထား',
    icon: 'face_retouching_natural',
    badge: 'Likeness Lock',
    previewImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'beauty',
    num: '03',
    title: 'Beauty',
    subtitleEn: 'Try hair styles and makeup looks on a face photo.',
    subtitleMm: 'ဆံထုံးဒီဇိုင်းများ၊ ရိုးရာသနပ်ခါးနှင့် စတူဒီယို မိတ်ကပ်ပုံစံများကို မျက်နှာပေါ်တွင် စမ်းသပ်ခြင်း',
    icon: 'brush',
    badge: 'Hair & Thanaka',
    previewImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'fashion',
    num: '04',
    title: 'Fashion',
    subtitleEn: 'Complete the styling with clothing, jewelry, and accessories.',
    subtitleMm: 'ရိုးရာပိုးချိတ်ထည်၊ ရွှေပန်းထိမ် လက်ဝတ်ရတနာနှင့် ဆက်စပ်ပစ္စည်းများ အပြည့်အစုံ ဆင်ယင်ခြင်း',
    icon: 'checkroom',
    badge: 'Silk & Jewelry',
    previewImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'creative-director',
    num: '05',
    title: 'Creative Director',
    subtitleEn: 'Combine decisions into story, composition, camera, and light.',
    subtitleMm: 'အနုပညာဒါရိုက်တာ - ဇာတ်လမ်း၊ ဖွဲ့စည်းပုံ၊ ကင်မရာမှန်ဘီလူးနှင့် စတူဒီယို အလင်းပေါင်းစပ်မှု',
    icon: 'movie_creation',
    badge: 'Story & Optics',
    previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'finalize',
    num: '06',
    title: 'Finalize',
    subtitleEn: 'Review, polish, upscale, and prepare the finished artwork.',
    subtitleMm: 'အပြီးသတ် စစ်ဆေးခြင်း၊ 8K Upscale မြှင့်တင်ခြင်းနှင့် လက်ရာအဆင်သင့် ပြင်ဆင်ခြင်း',
    icon: 'verified',
    badge: '8K Print Lab',
    previewImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'skin-retouch',
    num: '07',
    title: 'Skin Retouch Room',
    subtitleEn: 'Refine skin texture, tone, and blemish details.',
    subtitleMm: 'အသားအရေ မိုက်ခရိုချွေးပေါက် (Micro-Pores)၊ သနပ်ခါးအသားနှင့် သဘာဝအလင်းအမှောင် ညှိယူခြင်း',
    icon: 'texture',
    badge: 'Texture & SSS',
    previewImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85'
  },
  {
    id: 'event-portrait',
    num: '08',
    title: 'Event Portrait Enhance',
    subtitleEn: 'Weddings, events & family groups: skin and detail on every face.',
    subtitleMm: 'မင်္ဂလာဆောင်၊ ရှင်ပြုနှင့် မိသားစု ဓာတ်ပုံများ - မျက်နှာတိုင်းတွင် အသေးစိတ် သဘာဝကျစေခြင်း',
    icon: 'groups',
    badge: 'Multi-Face Guard',
    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85'
  }
];

export const AjaxStudioSuiteView: React.FC<AjaxStudioSuiteViewProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6',
  onNavigateView,
  initialRoomId = 'album-studio'
}) => {
  const isMm = language === 'my';
  const [activeRoomId, setActiveRoomId] = useState<StudioRoomId>(initialRoomId);
  const [activePhoto, setActivePhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85'
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Room 1: Album Studio State
  const [clientName, setClientName] = useState<string>('Daw Khin Thiri');
  const [albumType, setAlbumType] = useState<string>('royal-wedding');
  const [albumPages, setAlbumPages] = useState<number>(24);
  const [albumPaper, setAlbumPaper] = useState<string>('fuji-crystal-silk');

  // Room 2: Persona State
  const [personaGender, setPersonaGender] = useState<'woman' | 'man'>('woman');
  const [identityStrength, setIdentityStrength] = useState<number>(95);
  const [expression, setExpression] = useState<string>('regal-serene');
  const [gazeAngle, setGazeAngle] = useState<string>('direct-lens');

  // Room 3: Beauty State
  const [hairStyle, setHairStyle] = useState<string>('sadon-jasmine-garland');
  const [thanakaStyle, setThanakaStyle] = useState<string>('circular-cheek-dewy');
  const [lipColor, setLipColor] = useState<string>('ruby-petal-gloss');

  // Room 4: Fashion State
  const [silkPattern, setSilkPattern] = useState<string>('lun-taya-acheik-gold');
  const [garmentEra, setGarmentEra] = useState<string>('konbaung-court-velvet');
  const [jewelrySet, setJewelrySet] = useState<string>('mandalay-ruby-gold-filigree');

  // Room 5: Creative Director State
  const [settingAtmosphere, setSettingAtmosphere] = useState<string>('palace-veranda-sunset');
  const [cameraOptics, setCameraOptics] = useState<string>('hasselblad-85mm-f1.4');
  const [lightingRig, setLightingRig] = useState<string>('rembrandt-golden-rim');

  // Room 6: Finalize State
  const [aspectRatio, setAspectRatio] = useState<string>('4:5');
  const [printDpi, setPrintDpi] = useState<number>(300);
  const [negativeShield, setNegativeShield] = useState<boolean>(true);

  // Room 7: Skin Retouch Room State
  const [poreSharpness, setPoreSharpness] = useState<number>(90);
  const [subsurfaceScattering, setSubsurfaceScattering] = useState<number>(85);
  const [thanakaFlakeRealism, setThanakaFlakeRealism] = useState<number>(95);

  // Room 8: Event Portrait Enhance State
  const [eventType, setEventType] = useState<string>('royal-wedding-couple');
  const [faceCount, setFaceCount] = useState<string>('couple');
  const [groupDepthFocus, setGroupDepthFocus] = useState<string>('f5.6-sharp-all-faces');

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(isMm ? 'ဓာတ်ပုံဖိုင်သာ ရွေးချယ်ပါ' : 'Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setActivePhoto(dataUrl);
        showToast(isMm ? 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ' : 'Photo loaded into Studio Room');
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Master Prompt specific to active room
  const activeRoomPrompt = React.useMemo(() => {
    const baseSubject = personaGender === 'woman'
      ? 'authentic Burmese noblewoman, graceful regal poise, honey-olive skin with real micro-pores'
      : 'authentic Burmese heritage gentleman, noble aristocratic stature, warm olive complexion';

    let promptBody = '';

    switch (activeRoomId) {
      case 'album-studio':
        promptBody = `Commercial studio album fine art photograph for high-end printed portfolio: ${baseSubject}, client heirloom series '${clientName}', styled in luxurious handwoven Acheik silk, Fuji Crystal Archival print grading, Hasselblad X2D 100C medium format 100mm f/1.4 lens, 300 DPI museum fidelity, neutral warm grey studio background --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'persona':
        promptBody = `Master character persona portrait: ${baseSubject}, expression '${expression}', gaze '${gazeAngle}', 100% facial structure preservation with natural bone geometry, authentic subsurface scattering, zero artificial plastic smoothing, shot on 85mm prime portrait lens, softbox catchlights in irises --cref ${activePhoto} --cw ${identityStrength} --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'beauty':
        promptBody = `Macro studio beauty portrait: ${baseSubject}, coiffure styled with ${hairStyle.replace(/-/g, ' ')}, traditional authentic ${thanakaStyle.replace(/-/g, ' ')} with fine bark powder micro-texture, lips with ${lipColor.replace(/-/g, ' ')}, butterfly beauty ring light, extreme pore clarity, 100mm macro f/2.8 lens, Hasselblad 16-bit raw color --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'fashion':
        promptBody = `High-couture Myanmar fashion editorial photograph: ${baseSubject}, wearing authentic ${garmentEra.replace(/-/g, ' ')} with ${silkPattern.replace(/-/g, ' ')}, adorned with ${jewelrySet.replace(/-/g, ' ')}, tactile textile weave micro-fibers, heavy gold metallic thread embroidery, theatrical fashion studio rim lighting, 85mm f/1.4 lens, architectural drapery --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'creative-director':
        promptBody = `Cinematic fine art narrative photograph directed by high-fashion auteur: ${baseSubject}, set in evocative ${settingAtmosphere.replace(/-/g, ' ')}, dramatic ${lightingRig.replace(/-/g, ' ')}, camera optics ${cameraOptics.replace(/-/g, ' ')}, cinematic atmosphere, golden hour mist, authentic architectural depth, Hasselblad X2D RAW, perfect tonal graduation --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'finalize':
        promptBody = `Gallery-grade final master print artwork: ${baseSubject}, flawless balance of cultural authenticity and optical physics, 8k ultra high resolution, 300 DPI commercial press ready, contact ground shadow occlusion, zero haloing, cinematic Rembrandt key lighting, 85mm portrait prime lens, museum archive standard --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'skin-retouch':
        promptBody = `Close-up skin retouch master study: ${baseSubject}, natural epidermal micro-texture with ${poreSharpness}% pore clarity, realistic ${thanakaFlakeRealism}% thanaka bark flake realism, natural subcutaneous vascular warmth (${subsurfaceScattering}% SSS), crisp circular iris catchlights, Hasselblad 100mm portrait macro, zero plastic blur, zero airbrush slop --ar ${aspectRatio} --style raw --v 6.1`;
        break;

      case 'event-portrait':
        promptBody = `Prestigious Myanmar ${eventType.replace(/-/g, ' ')} event photograph: ${faceCount} portrait, ${groupDepthFocus.replace(/-/g, ' ')}, authentic individual facial preservation on every subject, regal ceremonial Acheik silk and gold velvet, ambient temple chandelier and warm candle lighting, 50mm f/1.4 prime lens, tack sharp depth of field across all faces --ar ${aspectRatio} --style raw --v 6.1`;
        break;
    }

    return promptBody;
  }, [
    activeRoomId,
    personaGender,
    clientName,
    aspectRatio,
    expression,
    gazeAngle,
    activePhoto,
    identityStrength,
    hairStyle,
    thanakaStyle,
    lipColor,
    garmentEra,
    silkPattern,
    jewelrySet,
    settingAtmosphere,
    lightingRig,
    cameraOptics,
    poreSharpness,
    thanakaFlakeRealism,
    subsurfaceScattering,
    eventType,
    faceCount,
    groupDepthFocus
  ]);

  const activeNegativeShield =
    'plastic skin, wax figure, oversmoothed cheeks, blurry pores, missing thanaka texture, westernized facial structure, extra fingers, cartoon, distorted jewelry, deformed ears, low resolution, blown highlights, doll face, 3d render';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeRoomPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast(isMm ? 'Prompt ကူးယူပြီးပါပြီ!' : 'Prompt copied to clipboard!');
  };

  const currentRoomMeta = STUDIO_ROOMS.find((r) => r.id === activeRoomId) || STUDIO_ROOMS[0];
  const currentRoomIndex = STUDIO_ROOMS.findIndex((r) => r.id === activeRoomId);
  const prevRoom = currentRoomIndex > 0 ? STUDIO_ROOMS[currentRoomIndex - 1] : null;
  const nextRoom = currentRoomIndex < STUDIO_ROOMS.length - 1 ? STUDIO_ROOMS[currentRoomIndex + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#f0f3f8] px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 select-none">
      
      {/* Toast Alert */}
      {quickToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#ffd02f] text-[#0a0d14] font-sans text-xs font-black px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-[#fcb900]">
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
          if (file) handleProcessFile(file);
        }}
        accept="image/*"
        className="hidden"
      />

      {/* 🌟 Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2333] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] text-[#0a0d14] flex items-center justify-center font-black text-xl shadow-lg border border-[#ffd02f]/40">
            SK
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-[#ffd02f] uppercase tracking-widest font-black">
                SHOW PROMPT AI STUDIO
              </span>
              <span className="bg-[#1c2436] text-[#8e9bb5] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#2b354c]">
                8 COMMERCIAL ROOMS
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-tight">
              {isMm ? 'စတူဒီယို ပရိုဒက်ရှင်း အခန်း ၈ ခန်း စနစ်' : 'Commercial Studio Master Suite'}
            </h1>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('pro-workstation')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#161d2b] hover:bg-[#20293d] border border-[#ffd02f]/40 text-xs font-bold text-[#ffd02f] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">wb_iridescent</span>
              <span>Pro Workstation</span>
            </button>
          )}

          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('prompt-builder')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#161d2b] hover:bg-[#20293d] border border-[#273248] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">auto_fix_high</span>
              <span>{isMm ? 'Prompt Matrix သို့' : 'Prompt Matrix'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#0a0d14] text-xs font-black transition-all cursor-pointer shadow-md hover:scale-102"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>{isMm ? 'ဓာတ်ပုံ အသစ်တင်မည်' : 'Upload Client Photo'}</span>
          </button>
        </div>
      </div>

      {/* 🌟 THE EXACT 8-ROOM GRID FROM THE SCREENSHOT */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#6b7794] uppercase tracking-wider font-bold">
            {isMm ? 'အခန်း ၈ ခန်းမှ နှစ်သက်ရာကို ရွေးချယ်ပြီး အလုပ်လုပ်ပါ' : 'Select any room to open dedicated workflow controls:'}
          </span>
          <span className="text-xs text-[#ffd02f] font-mono font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00b473] animate-ping" />
            Active Room: {currentRoomMeta.num} {currentRoomMeta.title}
          </span>
        </div>

        {/* 2-Column Luxury Dark Editorial Grid (Exact Screenshot Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 bg-[#0d121c] p-6 sm:p-8 rounded-3xl border border-[#1d2538] shadow-2xl">
          {STUDIO_ROOMS.map((room) => {
            const isActive = activeRoomId === room.id;
            return (
              <div
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  showToast(isMm ? `${room.title} သို့ ပြောင်းလဲလိုက်ပါပြီ` : `Opened Room ${room.num}: ${room.title}`);
                }}
                className={`group flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#151c2c] border-[#ffd02f] ring-2 ring-[#ffd02f]/20 shadow-xl'
                    : 'bg-transparent border-transparent hover:bg-[#121824] hover:border-[#273248]'
                }`}
              >
                {/* Number (01, 02, etc.) */}
                <span className={`font-mono text-sm tracking-wider font-semibold shrink-0 pt-1.5 transition-colors ${
                  isActive ? 'text-[#ffd02f]' : 'text-[#505a72] group-hover:text-[#8895b3]'
                }`}>
                  {room.num}
                </span>

                {/* Title & Description */}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className={`font-serif text-2xl font-normal tracking-wide transition-colors ${
                      isActive ? 'text-white font-medium' : 'text-[#dfe4ee] group-hover:text-white'
                    }`}>
                      {room.title}
                    </h3>
                    {isActive && (
                      <span className="bg-[#ffd02f] text-[#0a0d14] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-[#8a95ab] leading-relaxed group-hover:text-[#a6b2cb] transition-colors">
                    {isMm ? room.subtitleMm : room.subtitleEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🌟 ACTIVE ROOM WORKBENCH & INTERACTIVE CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        
        {/* LEFT: Specialized Room Controls (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0d121c] p-6 rounded-3xl border border-[#1d2538] shadow-xl flex flex-col gap-6">
          
          {/* Room Header with Stepper navigation */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#1c2333] pb-4 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold text-[#ffd02f]">{currentRoomMeta.num}</span>
              <div>
                <h2 className="font-serif text-2xl font-normal text-white">{currentRoomMeta.title}</h2>
                <p className="font-sans text-xs text-[#8a95ab]">{isMm ? currentRoomMeta.subtitleMm : currentRoomMeta.subtitleEn}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-[#1c2436] text-[#ffd02f] text-xs font-mono font-bold px-3 py-1 rounded-full border border-[#2b354c] mr-1 hidden sm:inline-block">
                {currentRoomMeta.badge}
              </span>

              {prevRoom && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoomId(prevRoom.id);
                    showToast(isMm ? `${prevRoom.num} သို့ ပြောင်းလဲလိုက်ပါပြီ` : `Moved to ${prevRoom.num} ${prevRoom.title}`);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141b29] hover:bg-[#1e2638] border border-[#252f44] text-xs font-mono text-[#8a95ab] hover:text-white transition-colors cursor-pointer"
                  title={`Previous: ${prevRoom.num} ${prevRoom.title}`}
                >
                  <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                  <span>{prevRoom.num}</span>
                </button>
              )}

              {nextRoom && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoomId(nextRoom.id);
                    showToast(isMm ? `${nextRoom.num} သို့ ပြောင်းလဲလိုက်ပါပြီ` : `Moved to ${nextRoom.num} ${nextRoom.title}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffd02f] hover:bg-[#fcb900] text-[#0a0d14] text-xs font-mono font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  title={`Next: ${nextRoom.num} ${nextRoom.title}`}
                >
                  <span>Next: {nextRoom.num}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* ROOM 1: ALBUM STUDIO CONTROLS */}
          {activeRoomId === 'album-studio' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Client Name / Reference</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3.5 py-2.5 rounded-xl font-sans focus:border-[#ffd02f] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Album Package Type</label>
                  <select
                    value={albumType}
                    onChange={(e) => setAlbumType(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="royal-wedding">Myanmar Royal Wedding (Acheik & Gold)</option>
                    <option value="heritage-family">Heritage Family Legacy (3 Generations)</option>
                    <option value="debutante-couture">Silk Haute Couture Debutante</option>
                    <option value="shinbyu-monastery">Novitiation Shinbyu Ceremony</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#141b29] p-3 rounded-xl border border-[#252f44]">
                  <span className="text-[10px] text-[#6b7794] font-mono block">PRINT SPREADS</span>
                  <span className="text-sm font-bold text-white">{albumPages} Pages Fine Art</span>
                </div>
                <div className="bg-[#141b29] p-3 rounded-xl border border-[#252f44]">
                  <span className="text-[10px] text-[#6b7794] font-mono block">COLOR PROFILE</span>
                  <span className="text-sm font-bold text-white">Adobe RGB 1998</span>
                </div>
                <div className="bg-[#141b29] p-3 rounded-xl border border-[#252f44] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#6b7794] font-mono block">PAPER STOCK</span>
                  <span className="text-sm font-bold text-[#ffd02f]">Fuji Crystal Silk</span>
                </div>
              </div>
            </div>
          )}

          {/* ROOM 2: PERSONA CONTROLS */}
          {activeRoomId === 'persona' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPersonaGender('woman')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    personaGender === 'woman'
                      ? 'bg-[#ffd02f] text-[#0a0d14] font-bold border-[#ffd02f]'
                      : 'bg-[#141b29] text-[#8a95ab] border-[#252f44]'
                  }`}
                >
                  <span className="text-xs block font-bold">Female Subject</span>
                  <span className="text-[10px] opacity-80">Noble Court Lady / Bride</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPersonaGender('man')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    personaGender === 'man'
                      ? 'bg-[#ffd02f] text-[#0a0d14] font-bold border-[#ffd02f]'
                      : 'bg-[#141b29] text-[#8a95ab] border-[#252f44]'
                  }`}
                >
                  <span className="text-xs block font-bold">Male Subject</span>
                  <span className="text-[10px] opacity-80">Heritage Gentleman / Groom</span>
                </button>
              </div>

              {/* Likeness Slider */}
              <div className="bg-[#141b29] p-4 rounded-xl border border-[#252f44] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[#8a95ab]">Identity Likeness Lock (--cw)</span>
                  <span className="font-mono font-bold text-[#ffd02f]">{identityStrength}% Likeness</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={identityStrength}
                  onChange={(e) => setIdentityStrength(Number(e.target.value))}
                  className="w-full accent-[#ffd02f] h-1.5 bg-[#252f44] rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Facial Expression</label>
                  <select
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="regal-serene">Regal Serene Poise</option>
                    <option value="gentle-smile">Gentle Contemplative Smile</option>
                    <option value="editorial-glance">Editorial Direct Look</option>
                    <option value="courtly-dignity">Courtly Majestic Dignity</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Gaze Direction</label>
                  <select
                    value={gazeAngle}
                    onChange={(e) => setGazeAngle(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="direct-lens">Direct Into Lens (Intimate)</option>
                    <option value="three-quarter-gaze">Three-Quarter Regal Look</option>
                    <option value="downward-demure">Demure Downward Glance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ROOM 3: BEAUTY CONTROLS */}
          {activeRoomId === 'beauty' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Traditional Coiffure & Hair Styling</label>
                <select
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="sadon-jasmine-garland">Konbaung Royal Sadon with Fresh Jasmine Cascade</option>
                  <option value="mandalay-court-chignon">Mandalay Court Chignon with Golden Hairpins</option>
                  <option value="innwa-braided-cascade">Innwa Royal Braided Crown with Champaca Flowers</option>
                  <option value="modern-silk-couture-waves">Modern Silk Couture Soft Finger Waves</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Authentic Thanaka Bark Application</label>
                <select
                  value={thanakaStyle}
                  onChange={(e) => setThanakaStyle(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="circular-cheek-dewy">Classic Circular Cheeks (Dewy Thanaka Paste)</option>
                  <option value="delicate-leaf-vein">Artistic Leaf Vein Pattern (Shwebo Bark)</option>
                  <option value="subtle-sun-shield">Subtle Sun Shield Wash (Natural Translucent)</option>
                  <option value="temple-gold-foil-accent">Thanaka with 24K Pure Gold Leaf Accents</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Lip & Cheek Tint</label>
                <select
                  value={lipColor}
                  onChange={(e) => setLipColor(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="ruby-petal-gloss">Burmese Ruby Petal Soft Satin</option>
                  <option value="cinnabar-court-red">Bagan Cinnabar Court Red</option>
                  <option value="natural-honey-nude">Natural Honey Nude with Dewy Finish</option>
                </select>
              </div>
            </div>
          )}

          {/* ROOM 4: FASHION CONTROLS */}
          {activeRoomId === 'fashion' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Garment Silhouette & Historical Era</label>
                <select
                  value={garmentEra}
                  onChange={(e) => setGarmentEra(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="konbaung-court-velvet">Konbaung Royal Court (Heavy Velvet & Golden Ein Gyi)</option>
                  <option value="mandalay-silk-acheik">Mandalay Silk Acheik (Wedding Ceremony)</option>
                  <option value="innwa-heritage-brocade">Innwa Heritage Brocade with Flowing Shawl</option>
                  <option value="modern-couture-acheik">Modern Contemporary Silk Haute Couture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Handwoven Silk Pattern</label>
                <select
                  value={silkPattern}
                  onChange={(e) => setSilkPattern(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="lun-taya-acheik-gold">100-Shuttle Lun Taya Acheik (Gold & Emerald Waves)</option>
                  <option value="peacock-royal-motif">Royal Peacock (Daung) Heritage Brocade</option>
                  <option value="lotus-fiber-raw-silk">Inle Lotus Fiber Raw Textured Silk</option>
                  <option value="silver-cloud-waves">Silver Thread Cloud & Water Rhythms</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Jewelry & Royal Heirlooms</label>
                <select
                  value={jewelrySet}
                  onChange={(e) => setJewelrySet(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="mandalay-ruby-gold-filigree">Mandalay Mogok Pigeon Blood Ruby & 24K Gold Filigree</option>
                  <option value="jadeite-pearl-nadaung">Imperial Jadeite & Freshwater Pearl Ear Plugs (Nadaung)</option>
                  <option value="salwe-order-gold-chains">Royal Court Salwe 24-Strand Golden Sash</option>
                </select>
              </div>
            </div>
          )}

          {/* ROOM 5: CREATIVE DIRECTOR CONTROLS */}
          {activeRoomId === 'creative-director' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Setting &amp; Atmosphere</label>
                  {onNavigateView && (
                    <button
                      type="button"
                      onClick={() => onNavigateView('composite-harmonizer', activePhoto)}
                      className="text-[11px] text-[#ffd02f] hover:underline flex items-center gap-1 font-mono font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">wallpaper</span>
                      <span>{isMm ? 'နောက်ခံလဲလှယ်ခန်း (၂၄ မျိုး) သို့ >' : '24+ Backdrop Presets Changer >'}</span>
                    </button>
                  )}
                </div>
                <select
                  value={settingAtmosphere}
                  onChange={(e) => setSettingAtmosphere(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="palace-veranda-sunset">Mandalay Teak Palace Veranda at Crimson Sunset</option>
                  <option value="bagan-pagoda-mist">Ancient Bagan Brick Temple with Morning Mist</option>
                  <option value="minimalist-cyclorama">Seamless Warm Cream Infinity Cyclorama Studio</option>
                  <option value="colonial-heritage-room">Yangon Heritage Teak Salon with Floor Mirrors</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Camera Optics</label>
                  <select
                    value={cameraOptics}
                    onChange={(e) => setCameraOptics(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="hasselblad-85mm-f1.4">Hasselblad X2D 100C • 85mm f/1.4</option>
                    <option value="sony-a7rv-135mm">Sony A7R V • 135mm f/1.8 GM</option>
                    <option value="leica-sl2-50mm">Leica SL2-S • 50mm Summilux f/1.4</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Lighting Setup</label>
                  <select
                    value={lightingRig}
                    onChange={(e) => setLightingRig(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="rembrandt-golden-rim">Rembrandt Key + Golden 2800K Rim Light</option>
                    <option value="butterfly-beauty-softbox">Butterfly Ring Beauty Softbox</option>
                    <option value="cinematic-lantern-soft">Soft Lantern Top Key with Floor Fill</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ROOM 6: FINALIZE CONTROLS */}
          {activeRoomId === 'finalize' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['4:5', '16:9', '1:1', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? 'bg-[#ffd02f] text-[#0a0d14] border-[#ffd02f]'
                        : 'bg-[#141b29] text-[#8a95ab] border-[#252f44]'
                    }`}
                  >
                    AR {ratio}
                  </button>
                ))}
              </div>

              <div className="bg-[#141b29] p-4 rounded-xl border border-[#252f44] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Anti-AI Plastic Skin Negative Shield</span>
                  <span className="text-[11px] text-[#8a95ab]">Prevents doll-like wax skin, airbrush smoothing, and incorrect hands</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNegativeShield(prev => !prev)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold cursor-pointer transition-colors ${
                    negativeShield ? 'bg-[#00b473] text-black' : 'bg-[#252f44] text-[#8a95ab]'
                  }`}
                >
                  {negativeShield ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#8a95ab] bg-[#141b29] p-3 rounded-xl border border-[#252f44]">
                <span>Print Density: <strong className="text-white">300 DPI Lab Resolution</strong></span>
                <span>Bit Depth: <strong className="text-[#ffd02f]">16-Bit ProPhoto</strong></span>
              </div>
            </div>
          )}

          {/* ROOM 7: SKIN RETOUCH ROOM CONTROLS */}
          {activeRoomId === 'skin-retouch' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#141b29] p-4 rounded-xl border border-[#252f44] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[#8a95ab]">Epidermal Micro-Pores Sharpness</span>
                  <span className="font-mono font-bold text-[#ffd02f]">{poreSharpness}% Texture</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={poreSharpness}
                  onChange={(e) => setPoreSharpness(Number(e.target.value))}
                  className="w-full accent-[#ffd02f] h-1.5 bg-[#252f44] rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-[#141b29] p-4 rounded-xl border border-[#252f44] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[#8a95ab]">Subsurface Scattering (SSS Vascular Warmth)</span>
                  <span className="font-mono font-bold text-[#ffd02f]">{subsurfaceScattering}% Natural SSS</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={subsurfaceScattering}
                  onChange={(e) => setSubsurfaceScattering(Number(e.target.value))}
                  className="w-full accent-[#ffd02f] h-1.5 bg-[#252f44] rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-[#141b29] p-4 rounded-xl border border-[#252f44] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[#8a95ab]">Thanaka Bark Flake Micro-Detail</span>
                  <span className="font-mono font-bold text-[#ffd02f]">{thanakaFlakeRealism}% Fidelity</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={thanakaFlakeRealism}
                  onChange={(e) => setThanakaFlakeRealism(Number(e.target.value))}
                  className="w-full accent-[#ffd02f] h-1.5 bg-[#252f44] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ROOM 8: EVENT PORTRAIT ENHANCE CONTROLS */}
          {activeRoomId === 'event-portrait' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-[#8a95ab]">Event & Gathering Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                >
                  <option value="royal-wedding-couple">Grand Myanmar Traditional Wedding (Couple)</option>
                  <option value="shinbyu-novitiation-parade">Shinbyu Novitiation Ceremony (Family Procession)</option>
                  <option value="thingyan-water-festival">Thingyan Heritage Padauk Floral Gathering</option>
                  <option value="pagoda-offering-group">Full Moon Pagoda Oil Lamp Ceremony</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Subject Setup</label>
                  <select
                    value={faceCount}
                    onChange={(e) => setFaceCount(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="couple">Bride & Groom (2 Faces Protected)</option>
                    <option value="family-group">Family Heirloom Group (4-6 Faces)</option>
                    <option value="solo-novice">Solo Royal Prince / Novice</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-[#8a95ab]">Depth of Field Strategy</label>
                  <select
                    value={groupDepthFocus}
                    onChange={(e) => setGroupDepthFocus(e.target.value)}
                    className="bg-[#141b29] border border-[#252f44] text-white text-xs px-3 py-2.5 rounded-xl font-sans outline-none"
                  >
                    <option value="f5.6-sharp-all-faces">f/5.6 - Tack Sharp Across Every Face</option>
                    <option value="f2.8-shallow-couple">f/2.8 - Dreamy Bokeh Behind Couple</option>
                    <option value="f8-ceremony-hall">f/8 - Maximum Temple Architecture Detail</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Master Prompt Codebox */}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1c2333]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Synthesized Room Master Prompt
              </span>
              <span className="text-[10px] font-mono text-[#6b7794]">Midjourney v6.1 / Flux Format</span>
            </div>

            <div className="bg-[#080b12] p-4 rounded-xl border border-[#1d2538] font-mono text-xs text-[#dce2f0] leading-relaxed break-words max-h-40 overflow-y-auto">
              {activeRoomPrompt}
            </div>

            {negativeShield && (
              <div className="bg-[#181115] p-2.5 rounded-lg border border-[#3b1d28] font-mono text-[11px] text-[#f28b9f]">
                <strong className="text-xs uppercase block text-[#ff6b87] mb-0.5">--no Negative Shield Active:</strong>
                {activeNegativeShield}
              </div>
            )}

            {/* Prompt Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#0a0d14] px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                  <span>{isCopied ? 'Copied!' : 'Copy Room Prompt'}</span>
                </button>

                {onSendToMatrix && (
                  <button
                    type="button"
                    onClick={() => onSendToMatrix(activeRoomPrompt)}
                    className="flex items-center gap-1.5 bg-[#161d2b] hover:bg-[#20293d] border border-[#273248] text-white px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#ffd02f]">send</span>
                    <span>Send to Matrix</span>
                  </button>
                )}

                {onNavigateView && (
                  <button
                    type="button"
                    onClick={() => onNavigateView('photo-to-text', activePhoto)}
                    className="flex items-center gap-1.5 bg-[#161d2b] hover:bg-[#20293d] border border-[#273248] text-[#8a95ab] hover:text-white px-3 py-2 rounded-full font-bold text-xs cursor-pointer transition-colors"
                    title="Reverse engineer this photo into prompts"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#4262ff]">auto_fix_normal</span>
                    <span>Photo to Text</span>
                  </button>
                )}
              </div>

              {onSavePrompt && (
                <button
                  type="button"
                  onClick={() => onSavePrompt(activeRoomPrompt, { title: currentRoomMeta.title, room: activeRoomId })}
                  className="flex items-center gap-1 bg-[#141b29] hover:bg-[#1e2638] border border-[#252f44] text-[#8a95ab] hover:text-white px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">bookmark</span>
                  <span>Save</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: Live Viewfinder Canvas & Reference Photo Slot (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0d121c] p-5 rounded-3xl border border-[#1d2538] shadow-xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-[#1c2333] pb-3">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">center_focus_strong</span>
                Optical Studio Viewfinder
              </span>
              <span className="bg-[#00b473]/10 text-[#00b473] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#00b473]/20">
                100% Realism Rig
              </span>
            </div>

            {/* Viewfinder Frame with Drag & Drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessFile(file);
              }}
              className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-black border transition-all ${
                isDragOver ? 'border-[#ffd02f] ring-4 ring-[#ffd02f]/20' : 'border-[#252f44]'
              }`}
            >
              <img
                src={activePhoto}
                alt="Active Room Reference"
                className={`w-full h-full object-cover transition-transform duration-700 hover:scale-103 ${isDragOver ? 'opacity-30' : 'opacity-100'}`}
              />

              {/* Drag overlay */}
              {isDragOver && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-black/80 text-[#ffd02f] font-mono text-xs font-bold p-4 text-center pointer-events-none">
                  <span className="material-symbols-outlined text-[36px]">upload_file</span>
                  <span>Drop client photo to set room reference</span>
                </div>
              )}

              {/* Camera Optics HUD Overlay */}
              <div className="absolute inset-0 p-3.5 flex flex-col justify-between pointer-events-none font-mono text-[11px] text-white/90">
                <div className="flex items-center justify-between">
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[#ffd02f] font-bold">
                    HASSELBLAD X2D 100C
                  </span>
                  <span className="bg-black/60 px-2 py-0.5 rounded">
                    ISO 64 • 1/250s • f/1.4
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="bg-black/60 px-2 py-0.5 rounded text-[10px]">
                    85mm PRIME • PROPHOTO RGB
                  </span>
                  <span className="bg-[#00b473] text-black font-bold px-2 py-0.5 rounded text-[10px]">
                    300 DPI LAB
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Upload / Presets underneath */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#161d2b] hover:bg-[#20293d] border border-[#273248] text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">add_photo_alternate</span>
                <span>{isMm ? 'ဤအခန်းအတွက် Client ဓာတ်ပုံတင်မည်' : 'Upload Client Photo for This Room'}</span>
              </button>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {STUDIO_ROOMS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setActivePhoto(preset.previewImage);
                      showToast(`Loaded ${preset.title} preset photo`);
                    }}
                    className="relative aspect-square rounded-lg overflow-hidden border border-[#252f44] hover:border-[#ffd02f] cursor-pointer group"
                  >
                    <img
                      src={preset.previewImage}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-0.5 left-0.5 font-mono text-[9px] text-[#ffd02f] font-bold px-1 bg-black/70 rounded">
                      {preset.num}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Realism Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8a95ab] pt-2 border-t border-[#1c2333]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Zero Plastic Smoothing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>98.4% Cultural Fidelity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Micro-Pores Preservation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#00b473]">verified</span>
                <span>Accurate Thanaka Chemistry</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
