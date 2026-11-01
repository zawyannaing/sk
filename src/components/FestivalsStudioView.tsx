import React, { useState } from 'react';
import { Language } from '../types';
import { FESTIVALS_DATA, FestivalMonth } from '../data/festivalsStudioData';
import { 
  Sparkles, 
  Calendar, 
  Flower2, 
  Sun, 
  CloudRain, 
  Moon, 
  Copy, 
  Check, 
  ChevronRight, 
  Compass, 
  Layers, 
  Wand2 
} from 'lucide-react';

interface FestivalsStudioViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSendToPhotoStudio?: (
    promptText: string,
    options?: {
      ratio?: string;
      referencePhoto?: string | null;
      chosenOptions?: { label: string; value: string }[];
    }
  ) => void;
}

export const FestivalsStudioView: React.FC<FestivalsStudioViewProps> = ({
  language,
  onSendToMatrix,
  onSendToPhotoStudio
}) => {
  const isMm = language === 'my';
  const [selectedMonthId, setSelectedMonthId] = useState<string>('tagu-thingyan');
  const [copied, setCopied] = useState(false);

  const selectedFestival = FESTIVALS_DATA.find(f => f.id === selectedMonthId) || FESTIVALS_DATA[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToStudio = (f: FestivalMonth) => {
    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(f.promptSnippet, {
        ratio: '4:5',
        chosenOptions: [
          { label: 'Festival Month', value: f.monthMm },
          { label: 'Event', value: f.festivalNameMm },
          { label: 'Sacred Flower', value: f.flowerMm }
        ]
      });
    } else if (onSendToMatrix) {
      onSendToMatrix(f.promptSnippet);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {isMm ? '၁၂ လရာသီ မြန်မာ့ပွဲတော် Studio' : '12-Season Myanmar Traditional Festivals Studio'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMm ? 'ဆယ့်နှစ်လရာသီ ပွဲတော်များ & ရာသီပန်းများ' : '12 Lunar Months, Sacred Flowers & Cultural Pageantry'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {isMm
                ? 'တန်ခူး သင်္ကြန် ရေသဘင်ပွဲတော်မှသည် သီတင်းကျွတ် မီးထွန်းပွဲ၊ တန်ဆောင်တိုင်၊ ဝါဆိုရှင်ပြုမင်္ဂလာနှင့် တပေါင်းသဲပုံစေတီပွဲ အထိ မြန်မာ့ ၁၂ လရာသီ ရိုးရာဝတ်စုံနှင့် ပွဲတော်အငွေ့အသက်များကို ဖန်တီးပါ။'
                : 'From Tagu Thingyan Water Festival and Waso Shinbyu Robes to Thadingyut Lights and Tabaung Sand Pagodas, generate culturally accurate seasonal festival prompts.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
              <div className="text-xl font-bold text-amber-400">12</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{isMm ? 'လရာသီစုံလင်' : 'Lunar Cycles'}</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
              <div className="text-xl font-bold text-emerald-400">100%</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{isMm ? 'ရာသီပန်းတိကျမှု' : 'Floral Fidelity'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Month Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {FESTIVALS_DATA.map((item, idx) => {
          const isSelected = item.id === selectedMonthId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedMonthId(item.id)}
              className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 group ${
                isSelected
                  ? 'bg-stone-800 border-amber-500/80 shadow-lg shadow-amber-500/10'
                  : 'bg-stone-900/70 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                }`}>
                  {idx + 1}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.accentColor }} />
              </div>
              <div className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-white group-hover:text-amber-200'}`}>
                {item.monthMm} ({item.monthEn.split(' ')[0]})
              </div>
              <div className="text-[10px] text-stone-400 truncate w-full mt-0.5">
                {item.festivalNameMm}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Month Spotlight Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-5">
            {/* Spotlight Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                  <Flower2 className="w-3.5 h-3.5" />
                  {isMm ? 'ရာသီပန်း:' : 'Sacred Flower:'} {isMm ? selectedFestival.flowerMm : selectedFestival.flowerEn}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {selectedFestival.monthMm} — {selectedFestival.festivalNameMm}
                </h2>
                <p className="text-xs text-stone-400">{selectedFestival.festivalNameEn}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                  {isMm ? selectedFestival.seasonMm : selectedFestival.seasonEn}
                </span>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                <div className="text-stone-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {isMm ? 'ပွဲတော် ရိုးရာဝတ်စုံ:' : 'Festive Attire:'}
                </div>
                <p className="text-stone-400 leading-relaxed">
                  {isMm ? selectedFestival.attireDescriptionMm : selectedFestival.attireDescriptionEn}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1">
                <div className="text-stone-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {isMm ? 'ကုသိုလ်တော် & အခမ်းအနား:' : 'Sacred Ceremony:'}
                </div>
                <p className="text-stone-400 leading-relaxed">
                  {isMm ? selectedFestival.sacredActivityMm : selectedFestival.sacredActivityEn}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-stone-800 space-y-1 sm:col-span-2">
                <div className="text-stone-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {isMm ? 'ပွဲတော် ပတ်ဝန်းကျင် အငွေ့အသက်:' : 'Atmosphere & Light:'}
                </div>
                <p className="text-stone-400 leading-relaxed">
                  {isMm ? selectedFestival.atmosphereMm : selectedFestival.atmosphereEn}
                </p>
              </div>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedFestival.visualKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium"
                >
                  ✦ {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Prompt Generator & Action */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-full space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Wand2 className="w-4 h-4" />
                  {isMm ? 'ရာသီပွဲတော် AI Prompt' : 'Festival Visual Prompt'}
                </div>
                <span className="text-[11px] text-stone-500 font-mono">v6.0 / Photorealistic</span>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-stone-800/80 font-mono text-xs text-stone-300 leading-relaxed max-h-[220px] overflow-y-auto select-all">
                {selectedFestival.promptSnippet}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleCopy(selectedFestival.promptSnippet)}
                className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition duration-200 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isMm ? 'Prompt ကူးယူပြီးပါပြီ' : 'Prompt Copied!'}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-400" />
                    {isMm ? 'Festival Prompt အပြည့်အစုံ ကူးယူရန်' : 'Copy Full Festival Prompt'}
                  </>
                )}
              </button>

              <button
                onClick={() => handleSendToStudio(selectedFestival)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isMm ? 'Photo Studio တွင် ချက်ချင်း ရိုက်ကူးမည်' : 'Send to Photo Studio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
