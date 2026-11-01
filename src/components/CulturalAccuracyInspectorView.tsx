import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { inspectCulturalAccuracy, InspectionResult } from '../data/culturalAccuracyInspector';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  RotateCcw, 
  History, 
  Eye, 
  Search,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface CulturalAccuracyInspectorViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSendToPhotoStudio?: (promptText: string) => void;
}

const PRESET_TEST_PROMPTS = [
  {
    labelMm: '⚠️ လွဲချော်မှု စမ်းသပ်ချက် (Bagan + Sunglasses + Kimono)',
    labelEn: '⚠️ Error Test (Bagan + Sunglasses + Kimono)',
    prompt: 'photorealistic portrait of a Bagan dynasty Burmese princess wearing black sunglasses, modern plastic sneakers, and Japanese kimono holding a smartphone at ancient temple'
  },
  {
    labelMm: '👑 တော်ဝင် စံပြနမူနာ (Konbaung Emerald Acheik & Thazin)',
    labelEn: '👑 Royal Masterpiece (Konbaung Emerald Acheik)',
    prompt: 'magnificent portrait of a Konbaung dynasty royal court lady at the Mandalay Golden Palace, wearing an emerald green and gold Amarapura 100-shuttle Luntaya Acheik htamein, hair bun adorned with royal wild Thazin orchids, authentic Burmese facial bone structure, warm honey-golden skin tone, Mogok ruby necklace, 8k cinematic lighting'
  },
  {
    labelMm: '🌸 သင်္ကြန် ရိုးရာ (Thingyan Padauk & Silver Bowl)',
    labelEn: '🌸 Thingyan Water Festival (Padauk & Silver)',
    prompt: 'portrait of a young Burmese woman celebrating Thingyan water festival, wearing yellow silk htamein, fragrant Padauk blossoms in hair, holding a traditional repoussé silver water bowl with Thabyay leaves, smiling warmly with authentic Burmese facial features'
  }
];

export const CulturalAccuracyInspectorView: React.FC<CulturalAccuracyInspectorViewProps> = ({
  language,
  onSendToMatrix,
  onSendToPhotoStudio
}) => {
  const isMm = language === 'my';
  const [inputPrompt, setInputPrompt] = useState(PRESET_TEST_PROMPTS[0].prompt);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);

  // Compute inspection in real-time or when prompt changes
  const inspection: InspectionResult = useMemo(() => {
    return inspectCulturalAccuracy(inputPrompt);
  }, [inputPrompt]);

  const handleApplyFixed = () => {
    setInputPrompt(inspection.sanitizedPrompt);
  };

  const handleCopyFixed = () => {
    navigator.clipboard.writeText(inspection.sanitizedPrompt);
    setCopiedFixed(true);
    setTimeout(() => setCopiedFixed(false), 2500);
  };

  const handleSendToStudio = () => {
    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(inspection.sanitizedPrompt);
    } else if (onSendToMatrix) {
      onSendToMatrix(inspection.sanitizedPrompt);
    }
  };

  // Grade color helper
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-amber-400 bg-amber-500/10 border-amber-500/40';
      case 'A': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40';
      case 'B': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40';
      case 'C': return 'text-orange-400 bg-orange-500/10 border-orange-500/40';
      default: return 'text-rose-400 bg-rose-500/10 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isMm ? 'AI သမိုင်းခေတ် & ရိုးရာ ညီညွတ်မှု စစ်ဆေးရေး' : 'AI Cultural Accuracy & Era Inspector'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMm ? 'မြန်မာ့သမိုင်းခေတ် & ရိုးရာဝတ်စုံ မှန်ကန်မှု စစ်ဆေးခြင်း' : 'Historical Era Verification & Anachronism Sanitizer'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {isMm
                ? 'သင်၏ AI Prompt တွင် ခေတ်လွန်ပစ္စည်းများ (မျက်မှန်၊ လက်ပတ်နာရီ၊ စနီကာ)၊ အခြားနိုင်ငံဝတ်စုံများ ရောထွေးမှု သို့မဟုတ် ခေတ်ကာလ မကိုက်ညီမှုများကို စစ်ဆေးပေးပြီး တစ်ချက်နှိပ်ရုံဖြင့် 100% တိကျသော မူရင်းမြန်မာ့ရိုးရာအဖြစ် အလိုအလျောက် ပြုပြင်ပေးပါသည်။'
                : 'Scans your prompts for modern anachronisms, foreign attire collisions, or era mismatches. Auto-replaces them with authentic Myanmar heritage elements.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-5 py-3 rounded-2xl border text-center ${getGradeColor(inspection.grade)}`}>
              <div className="text-2xl font-black">{inspection.score}%</div>
              <div className="text-[11px] font-bold uppercase tracking-wider">{inspection.grade} Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Test Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-stone-400 font-semibold shrink-0">
          {isMm ? 'နမူနာ စမ်းသပ်ချက်များ:' : 'Quick Presets:'}
        </span>
        {PRESET_TEST_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setInputPrompt(p.prompt)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 text-stone-300 hover:text-white text-xs whitespace-nowrap transition"
          >
            {isMm ? p.labelMm : p.labelEn}
          </button>
        ))}
      </div>

      {/* Main Grid: Prompt Input & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {isMm ? 'စစ်ဆေးမည့် AI Prompt ထည့်သွင်းပါ' : 'Input Prompt to Inspect'}
              </span>
              <button
                onClick={() => setInputPrompt('')}
                className="text-[11px] text-stone-500 hover:text-stone-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {isMm ? 'ရှင်းထုတ်ရန်' : 'Clear'}
              </button>
            </div>

            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              rows={7}
              placeholder={isMm ? 'စစ်ဆေးလိုသော Prompt ကို ဤနေရာတွင် ရိုက်ထည့်ပါ သို့မဟုတ် ကူးထည့်ပါ...' : 'Paste your AI prompt here to inspect cultural compliance...'}
              className="w-full p-4 rounded-2xl bg-black/60 border border-stone-800 text-xs sm:text-sm font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 leading-relaxed resize-none transition"
            />

            <div className="flex items-center justify-between pt-1 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-amber-400" />
                {isMm ? 'စစ်ဆေးတွေ့ရှိသော ခေတ်ကာလ:' : 'Detected Era:'}{' '}
                <strong className="text-white ml-1">{isMm ? inspection.detectedEraMm : inspection.detectedEra}</strong>
              </span>
              <span>{inputPrompt.length} chars</span>
            </div>
          </div>

          {/* Auto-Fixed Prompt Preview */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isMm ? 'ပြုပြင်ပြီးသော မူရင်းစစ်စစ် Prompt (Sanitized)' : '100% Culturally Verified Prompt'}
              </span>
              <button
                onClick={handleCopyFixed}
                className="text-[11px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
              >
                {copiedFixed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedFixed ? (isMm ? 'ကူးယူပြီး' : 'Copied') : (isMm ? 'ကူးယူရန်' : 'Copy')}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/70 border border-emerald-900/40 text-xs font-mono text-emerald-100 leading-relaxed select-all max-h-[160px] overflow-y-auto">
              {inspection.sanitizedPrompt}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleApplyFixed}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                {isMm ? 'အထက်ပါ Prompt တွင် အစားထိုးမည်' : 'Apply to Input'}
              </button>

              <button
                onClick={handleSendToStudio}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isMm ? 'Photo Studio သို့ ပို့မည်' : 'Send to Photo Studio'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Inspection Breakdown */}
        <div className="lg:col-span-6 space-y-4">
          {/* Score & Summary Card */}
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {isMm ? 'ရိုးရာ စစ်မှန်မှု အကဲဖြတ်ရလဒ်' : 'Cultural Compliance Score'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isMm ? inspection.gradeTitleMm : inspection.gradeTitleEn}
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-amber-400">{inspection.score}</span>
                <span className="text-xs text-stone-400"> / 100</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-emerald-400"
                  style={{ width: `${inspection.score}%` }}
                />
              </div>
            </div>

            {/* Issues Breakdown */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center justify-between">
                <span>{isMm ? 'တွေ့ရှိရသော လွဲချော်မှုများ' : 'Detected Inconsistencies'} ({inspection.issues.length})</span>
                {inspection.issues.length === 0 && (
                  <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isMm ? 'အပြစ်ဆိုဖွယ်မရှိပါ' : 'Zero Flaws Found'}
                  </span>
                )}
              </div>

              {inspection.issues.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold text-emerald-300">
                    {isMm ? '၁၀၀% သမိုင်းခေတ်နှင့် ရိုးရာ ညီညွတ်ပါသည်' : '100% Cultural Authenticity Confirmed'}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {isMm ? 'ခေတ်လွန်ပစ္စည်းများနှင့် နိုင်ငံခြားဝတ်စုံ ရောထွေးမှု မရှိပါ။' : 'No anachronisms or foreign attire collisions detected.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {inspection.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 rounded-2xl bg-black/40 border border-stone-800 hover:border-stone-700 space-y-1.5 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          {isMm ? issue.titleMm : issue.titleEn}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isMm ? issue.descriptionMm : issue.descriptionEn}
                      </p>
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-amber-300 font-medium">
                        💡 {isMm ? issue.suggestionMm : issue.suggestionEn}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Strengths */}
            {inspection.strengths.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  {isMm ? 'ကိုက်ညီသော ရိုးရာအမှတ်အသားများ' : 'Cultural Anchors Confirmed'} ({inspection.strengths.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {inspection.strengths.map((str, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      {isMm ? str.titleMm : str.titleEn}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
