import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

export interface ReferencePhotoSlots {
  faceRef: string | null;
  outfitRef: string | null;
  lightingRef: string | null;
}

interface ReferencePhotoUploadBoxProps {
  language: Language;
  onPhotoSelected?: (photoDataUrl: string, slotType: 'face' | 'outfit' | 'lighting') => void;
  onClearPhoto?: (slotType: 'face' | 'outfit' | 'lighting') => void;
  onOpenPhotoToText?: (photoDataUrl: string) => void;
  onSendToStudioDesk?: (extractedParams: any) => void;
  activeSlot?: 'face' | 'outfit' | 'lighting';
  initialPhotos?: Partial<ReferencePhotoSlots>;
  className?: string;
  compact?: boolean;
}

export const STUDIO_REFERENCE_PRESETS = [
  {
    id: 'konbaung-queen',
    labelEn: 'Burmese Royal Queen (Konbaung)',
    labelMm: 'ကုန်းဘောင်ခေတ် မိဖုရားကြီး',
    tag: 'Royal Velvet & Thanaka',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    category: 'face',
    specs: {
      gender: 'woman',
      era: 'konbaung-court',
      lighting: 'rembrandt-golden-45',
      scene: 'studio-cyclorama',
      skin: 'thanaka-dewy'
    }
  },
  {
    id: 'mandalay-bride',
    labelEn: 'Mandalay Silk Bride (Acheik)',
    labelMm: 'မန္တလေး မင်္ဂလာ သတို့သမီး',
    tag: 'Handwoven Gold Silk',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=85',
    category: 'outfit',
    specs: {
      gender: 'woman',
      era: 'modern-silk-couture',
      lighting: 'butterfly-beauty',
      scene: 'mandalay-teak',
      skin: 'natural-pores'
    }
  },
  {
    id: 'heritage-gentleman',
    labelEn: 'Heritage Gentleman (Taikpon)',
    labelMm: 'ရိုးရာ တိုက်ပုံ လူကြီးလူကောင်း',
    tag: 'Classic Gaung Baung',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
    category: 'face',
    specs: {
      gender: 'man',
      era: 'innwa-era',
      lighting: 'cinematic-rim',
      scene: 'studio-cyclorama',
      skin: 'natural-pores'
    }
  },
  {
    id: 'studio-beauty-model',
    labelEn: 'Studio Beauty (Rembrandt Key)',
    labelMm: 'စတူဒီယို ပရော်ဖက်ရှင်နယ် မော်ဒယ်',
    tag: '85mm f/1.4 Softbox',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
    category: 'lighting',
    specs: {
      gender: 'woman',
      era: 'modern-silk-couture',
      lighting: 'rembrandt-golden-45',
      scene: 'studio-cyclorama',
      skin: 'natural-pores'
    }
  }
];

export const ReferencePhotoUploadBox: React.FC<ReferencePhotoUploadBoxProps> = ({
  language,
  onPhotoSelected,
  onClearPhoto,
  onOpenPhotoToText,
  onSendToStudioDesk,
  activeSlot = 'face',
  initialPhotos,
  className = '',
  compact = false
}) => {
  const isMm = language === 'my';
  const [selectedSlot, setSelectedSlot] = useState<'face' | 'outfit' | 'lighting'>(activeSlot);
  const [photos, setPhotos] = useState<ReferencePhotoSlots>({
    faceRef: initialPhotos?.faceRef || null,
    outfitRef: initialPhotos?.outfitRef || null,
    lightingRef: initialPhotos?.lightingRef || null
  });

  const [identityLock, setIdentityLock] = useState<boolean>(true);
  const [likenessStrength, setLikenessStrength] = useState<number>(90); // 0-100%
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync active slot if prop changes
  useEffect(() => {
    setSelectedSlot(activeSlot);
  }, [activeSlot]);

  // Sync initialPhotos when prop changes from parent
  useEffect(() => {
    if (initialPhotos) {
      setPhotos(prev => ({
        faceRef: initialPhotos.faceRef !== undefined ? initialPhotos.faceRef : prev.faceRef,
        outfitRef: initialPhotos.outfitRef !== undefined ? initialPhotos.outfitRef : prev.outfitRef,
        lightingRef: initialPhotos.lightingRef !== undefined ? initialPhotos.lightingRef : prev.lightingRef
      }));
    }
  }, [initialPhotos?.faceRef, initialPhotos?.outfitRef, initialPhotos?.lightingRef]);

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileProcess(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedSlot]);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(isMm ? 'ကျေးဇူးပြု၍ ဓာတ်ပုံဖိုင် (.jpg, .png, .webp) ကိုသာ ရွေးချယ်ပါ' : 'Please select an image file (.jpg, .png, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setPhotos(prev => ({
          ...prev,
          [`${selectedSlot}Ref`]: dataUrl
        }));
        onPhotoSelected?.(dataUrl, selectedSlot);
        showToast(isMm ? 'ဓာတ်ပုံ အောင်မြင်စွာ တင်ပြီးပါပြီ' : 'Reference photo uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handlePresetSelect = (preset: typeof STUDIO_REFERENCE_PRESETS[0]) => {
    setPhotos(prev => ({
      ...prev,
      [`${selectedSlot}Ref`]: preset.url
    }));
    onPhotoSelected?.(preset.url, selectedSlot);
    showToast(isMm ? `${preset.labelMm} ကို သတ်မှတ်ပြီးပါပြီ` : `Loaded ${preset.labelEn}`);
  };

  const handleRemovePhoto = (slot: 'face' | 'outfit' | 'lighting') => {
    setPhotos(prev => ({
      ...prev,
      [`${slot}Ref`]: null
    }));
    onClearPhoto?.(slot);
    showToast(isMm ? 'ဖယ်ရှားပြီးပါပြီ' : 'Photo removed');
  };

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => setQuickToast(null), 2500);
  };

  const currentPhotoUrl = photos[`${selectedSlot}Ref`];

  // Quick Analyze / Photo-to-Text trigger
  const handleTriggerPhotoToText = () => {
    if (!currentPhotoUrl) {
      showToast(isMm ? 'ကျေးဇူးပြု၍ စစ်ဆေးရန် Reference Photo အရင်တင်ပါ' : 'Please upload a reference photo first');
      return;
    }
    if (onOpenPhotoToText) {
      onOpenPhotoToText(currentPhotoUrl);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#e0e2e8] p-5 shadow-xs flex flex-col gap-4 relative ${className}`}>
      
      {/* Toast Alert */}
      {quickToast && (
        <div className="absolute top-3 right-4 z-20 bg-[#1c1c1e] text-[#ffd02f] font-sans text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-fade-in flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>{quickToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f2f5] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-sm font-extrabold text-[#1c1c1e] tracking-tight">
                {isMm ? 'Reference Photo တင်ရန် နေရာ' : 'Studio Reference Photo Uploads'}
              </h3>
              <span className="bg-[#ffd02f] text-[#1c1c1e] text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                Photo → Prompt Ready
              </span>
            </div>
            <p className="font-sans text-[11px] text-[#6b6f7e]">
              {isMm
                ? 'မျက်နှာသွင်ပြင်၊ ဝတ်စုံဒီဇိုင်းနှင့် စတူဒီယိုအလင်းတို့ကို ဓာတ်ပုံမှ တိုက်ရိုက် ရယူအသုံးပြုခြင်း'
                : 'Upload real studio portraits to preserve likeness, transfer outfits, or reverse-engineer prompts.'}
            </p>
          </div>
        </div>

        {/* ⚡ Quick Photo to Text Action */}
        {currentPhotoUrl && (
          <button
            type="button"
            onClick={handleTriggerPhotoToText}
            className="flex items-center gap-1.5 bg-[#1c1c1e] text-[#ffd02f] hover:bg-black px-3.5 py-1.5 rounded-full font-sans text-xs font-bold cursor-pointer shadow-xs transition-transform active:scale-95"
            title="Deconstruct photo into full AI prompt"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">auto_awesome</span>
            <span>{isMm ? 'Photo မှ Prompt ထုတ်မည်' : 'Deconstruct Photo to Text'}</span>
          </button>
        )}
      </div>

      {/* 3 Reference Target Slots (Miro Style Segmented Pills) */}
      <div className="grid grid-cols-3 gap-2 bg-[#f7f8fa] p-1.5 rounded-xl border border-[#e0e2e8]">
        {[
          { id: 'face' as const, labelEn: '1. Face & Identity', labelMm: '၁။ မျက်နှာ Identity', icon: 'face', count: photos.faceRef ? '✓' : '' },
          { id: 'outfit' as const, labelEn: '2. Outfit & Fabric', labelMm: '၂။ ဝတ်စုံ & အထည်', icon: 'checkroom', count: photos.outfitRef ? '✓' : '' },
          { id: 'lighting' as const, labelEn: '3. Scene & Lighting', labelMm: '၃။ အလင်း & နောက်ခံ', icon: 'wb_sunny', count: photos.lightingRef ? '✓' : '' }
        ].map((slot) => {
          const isActive = selectedSlot === slot.id;
          const hasImage = !!photos[`${slot.id}Ref`];
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#1c1c1e] shadow-xs border border-[#e0e2e8]'
                  : 'text-[#6b6f7e] hover:text-[#1c1c1e] hover:bg-white/60'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isActive ? 'text-[#ffd02f]' : 'text-[#8e91a0]'}`}>
                {slot.icon}
              </span>
              <span className="truncate">{isMm ? slot.labelMm : slot.labelEn}</span>
              {hasImage && (
                <span className="w-2 h-2 rounded-full bg-[#00b473] shrink-0" title="Photo Attached" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Slot Uploader Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Dropzone & Preview Box (7 Cols) */}
        <div className="md:col-span-7 flex flex-col gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileProcess(file);
            }}
            accept="image/*,.heic,.heif"
            className="hidden"
          />

          {currentPhotoUrl ? (
            /* Active Photo Preview Card with live drag-over replacement */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative rounded-xl overflow-hidden border border-[#e0e2e8] bg-[#1c1c1e] group aspect-4/3 max-h-[260px] flex items-center justify-center transition-all ${
                isDragOver ? 'ring-4 ring-[#ffd02f] border-[#ffd02f]' : ''
              }`}
            >
              <img
                src={currentPhotoUrl}
                alt="Reference preview"
                className={`w-full h-full object-cover transition-transform group-hover:scale-102 ${isDragOver ? 'opacity-30' : 'opacity-100'}`}
              />

              {/* Drag over overlay */}
              {isDragOver && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#ffd02f]/90 text-[#1c1c1e] font-bold text-xs pointer-events-none">
                  <span className="material-symbols-outlined text-[32px]">file_upload</span>
                  <span>{isMm ? 'အသစ်လဲလှယ်ရန် ဤနေရာတွင် ချပါ' : 'Drop to replace reference photo'}</span>
                </div>
              )}
              
              {/* Overlay HUD */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3 pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                  <span className="bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Slot: {selectedSlot.toUpperCase()} REFERENCE
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleTriggerPhotoToText}
                      className="bg-white/90 hover:bg-white text-[#1c1c1e] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#4262ff]">psychology</span>
                      <span>{isMm ? 'ခွဲခြမ်းစိတ်ဖြာမည်' : 'Analyze'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(selectedSlot)}
                      className="bg-black/60 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer transition-colors"
                      title="Remove image"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                <div className="pointer-events-auto flex items-center justify-between text-white/90 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">verified</span>
                    <span className="font-semibold text-[11px]">
                      {identityLock ? '100% Likeness Lock Active' : 'Flexible Styling Match'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-[#ffd02f] hover:underline cursor-pointer"
                  >
                    {isMm ? 'ပုံပြောင်းမည်' : 'Replace Image'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-4/3 max-h-[240px] ${
                isDragOver
                  ? 'border-[#ffd02f] bg-[#fffdf0]'
                  : 'border-[#d2d5df] hover:border-[#ffd02f] bg-[#fafbfc] hover:bg-[#fffdf5]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#ffd02f]/20 text-[#1c1c1e] flex items-center justify-center mb-2.5">
                <span className="material-symbols-outlined text-[26px] text-[#1c1c1e]">cloud_upload</span>
              </div>
              <p className="font-sans text-xs font-bold text-[#1c1c1e]">
                {isMm ? 'ဓာတ်ပုံ ဤနေရာသို့ ဆွဲထည့်ပါ သို့မဟုတ် ဖိုင်ရွေးပါ' : 'Drop your photo here, or browse'}
              </p>
              <p className="font-sans text-[11px] text-[#6b6f7e] mt-1">
                Supports JPG, PNG, WEBP, HEIC • Ctrl+V to paste
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#8e91a0] bg-white px-2.5 py-1 rounded-full border border-[#e0e2e8]">
                <span className="material-symbols-outlined text-[13px] text-[#00b473]">shield</span>
                <span>100% Identity Guard Available</span>
              </div>
            </div>
          )}
        </div>

        {/* Studio Presets & Likeness Controls (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-3">
          
          {/* Identity Likeness Slider */}
          <div className="bg-[#f7f8fa] p-3 rounded-xl border border-[#e0e2e8] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1c1c1e] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#4262ff]">lock</span>
                {isMm ? 'မျက်နှာသွင်ပြင် Identity Lock' : 'Likeness Fidelity Lock'}
              </span>
              <button
                type="button"
                onClick={() => setIdentityLock(prev => !prev)}
                className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  identityLock ? 'bg-[#c3faf5] text-[#187574]' : 'bg-[#e0e2e8] text-[#6b6f7e]'
                }`}
              >
                {identityLock ? '100% LOCKED' : 'FLEXIBLE'}
              </button>
            </div>

            {identityLock && (
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex justify-between text-[11px] text-[#6b6f7e]">
                  <span>Preservation Strength</span>
                  <span className="font-bold text-[#1c1c1e]">{likenessStrength}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={likenessStrength}
                  onChange={(e) => setLikenessStrength(Number(e.target.value))}
                  className="w-full accent-[#1c1c1e] h-1.5 bg-[#e0e2e8] rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Quick Studio Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-[#8e91a0] uppercase tracking-wider">
              {isMm ? 'စတူဒီယို အသင့်သုံး ပုံစံများ (Quick Presets)' : 'Studio Curated Presets:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {STUDIO_REFERENCE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-[#e0e2e8] hover:border-[#ffd02f] bg-white hover:bg-[#fffdf5] text-left transition-all cursor-pointer group"
                >
                  <img
                    src={preset.url}
                    alt={preset.labelEn}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[11px] font-bold text-[#1c1c1e] truncate group-hover:text-black">
                      {isMm ? preset.labelMm : preset.labelEn}
                    </span>
                    <span className="text-[9px] text-[#8e91a0] truncate">{preset.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
