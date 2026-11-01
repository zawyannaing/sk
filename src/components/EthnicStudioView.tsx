import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { ETHNIC_NATIONALITIES, ETHNIC_CATEGORIES, EthnicNationality } from '../data/ethnicStudioData';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Compass, 
  Crown, 
  Flame, 
  ShieldCheck, 
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface EthnicStudioViewProps {
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

export const EthnicStudioView: React.FC<EthnicStudioViewProps> = ({
  language,
  onSendToMatrix,
  onSendToPhotoStudio
}) => {
  const isMm = language === 'my';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<EthnicNationality | null>(null);

  // Filter nationalities
  const filteredList = useMemo(() => {
    return ETHNIC_NATIONALITIES.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.group === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.nameMm.toLowerCase().includes(q) ||
        item.stateEn.toLowerCase().includes(q) ||
        item.stateMm.toLowerCase().includes(q) ||
        item.attireEn.toLowerCase().includes(q) ||
        item.attireMm.toLowerCase().includes(q) ||
        item.festivalEn.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendToStudio = (item: EthnicNationality) => {
    if (onSendToPhotoStudio) {
      onSendToPhotoStudio(item.promptSnippet, {
        ratio: '4:5',
        chosenOptions: [
          { label: 'Ethnic Heritage', value: item.nameMm },
          { label: 'Region', value: item.stateMm },
          { label: 'Festival Setting', value: item.festivalMm }
        ]
      });
    } else if (onSendToMatrix) {
      onSendToMatrix(item.promptSnippet);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-stone-900/60 to-black p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              {isMm ? 'တိုင်းရင်းသား ၁၃၅ မျိုး ရိုးရာ Studio' : '135 Myanmar Ethnic Nationalities Studio'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMm ? 'တိုင်းရင်းသား လူမျိုးစုများ၏ မူရင်း ရိုးရာဝတ်စုံ & ပွဲတော်များ' : 'Indigenous Heritage Attire & Gala Festivals'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {isMm
                ? 'ကချင်၊ ကယား၊ ကရင်၊ ချင်း၊ မွန်၊ ဗမာ၊ ရခိုင်၊ ရှမ်း အပါအဝင် နာဂ၊ အာခါ၊ ပလောင်၊ ပအိုဝ်း၊ အင်းသား၊ ရဝမ်၊ ကယန်း လူမျိုးစုများ၏ မူရင်းလက်ရာ၊ ငွေမောင်း၊ ရိုးရာခေါင်းပေါင်း၊ ပွဲတော်နောက်ခံများကို 100% တိကျစွာ AI Prompt အဖြစ် ဖန်တီးပေးသည့် Studio ဖြစ်ပါသည်။'
                : 'Authentic 8 major national races and heritage indigenous tribes of Myanmar with accurate textiles, silver regalia, feather headgear, and cultural festivals.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
              <div className="text-xl font-bold text-amber-400">{ETHNIC_NATIONALITIES.length}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{isMm ? 'လူမျိုးစု ပုံစံများ' : 'Ethnic Models'}</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
              <div className="text-xl font-bold text-emerald-400">100%</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-wider">{isMm ? 'ရိုးရာ စစ်မှန်မှု' : 'Authenticity'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
          {ETHNIC_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              {cat === 'All' ? (isMm ? 'အားလုံး (All)' : 'All Nationalities') : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMm ? 'လူမျိုး၊ ပြည်နယ်၊ ဝတ်စုံ ရှာဖွေပါ...' : 'Search tribe, state, attire...'}
            className="w-full pl-10 pr-4 py-2 bg-stone-900/90 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Ethnic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-stone-800/80 bg-stone-900/60 backdrop-blur-md p-5 hover:border-amber-500/40 hover:bg-stone-900/90 transition-all duration-300 shadow-xl"
          >
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-800 border border-stone-700/60 text-[11px] font-medium text-amber-400 mb-1.5">
                    <Compass className="w-3 h-3 text-amber-400" />
                    {item.group} • {isMm ? item.stateMm : item.stateEn}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {isMm ? item.nameMm : item.nameEn}
                  </h3>
                  <p className="text-xs text-stone-400 font-sans">{item.nameEn}</p>
                </div>

                <button
                  onClick={() => setActiveModalItem(item)}
                  className="p-2 rounded-xl bg-stone-800/80 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 transition"
                  title={isMm ? 'အသေးစိတ် ကြည့်ရှုရန်' : 'View Full Details'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Attributes breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/40 border border-stone-800/60">
                  <div className="font-semibold text-stone-300 mb-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {isMm ? 'ရိုးရာဝတ်စုံ (Attire):' : 'Attire:'}
                  </div>
                  <p className="text-stone-400 line-clamp-2 leading-relaxed">
                    {isMm ? item.attireMm : item.attireEn}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-stone-800/60">
                  <div className="font-semibold text-stone-300 mb-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {isMm ? 'ခေါင်းဆောင်း & လက်ဝတ်ရတနာ:' : 'Headdress & Jewelry:'}
                  </div>
                  <p className="text-stone-400 line-clamp-2 leading-relaxed">
                    {isMm ? `${item.headdressMm} | ${item.jewelryMm}` : `${item.headdressEn} | ${item.jewelryEn}`}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-stone-800/60">
                  <div className="font-semibold text-stone-300 mb-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {isMm ? 'ပွဲတော် & သဘာဝနောက်ခံ:' : 'Festival & Backdrop:'}
                  </div>
                  <p className="text-stone-400 line-clamp-1">
                    {isMm ? `${item.festivalMm} — ${item.backdropMm}` : `${item.festivalEn} — ${item.backdropEn}`}
                  </p>
                </div>
              </div>

              {/* Cultural Traits Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.culturalTraits.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-stone-800/80 text-[10px] text-stone-300 border border-stone-700/50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center gap-2">
              <button
                onClick={() => handleCopy(item.id, item.promptSnippet)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  copiedId === item.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/70'
                }`}
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isMm ? 'ကူးယူပြီး' : 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    {isMm ? 'Prompt ကူးယူရန်' : 'Copy Prompt'}
                  </>
                )}
              </button>

              <button
                onClick={() => handleSendToStudio(item)}
                className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
                title={isMm ? 'Photo Studio သို့ ပို့ဆောင်ရန်' : 'Send to Photo Studio'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isMm ? 'Studio သို့ပို့ရန်' : 'To Studio'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-700 bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <Crown className="w-3.5 h-3.5" />
                {activeModalItem.group} Heritage • {activeModalItem.stateEn}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {activeModalItem.nameMm}
              </h2>
              <p className="text-sm text-stone-400">{activeModalItem.nameEn}</p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-black/50 border border-stone-800 space-y-1">
                <div className="font-semibold text-amber-400">{isMm ? 'မူရင်းရိုးရာ ဝတ်စုံ:' : 'Authentic Attire:'}</div>
                <p className="text-stone-300 leading-relaxed">{isMm ? activeModalItem.attireMm : activeModalItem.attireEn}</p>
                <p className="text-stone-500 text-xs italic">{activeModalItem.attireEn}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-stone-800 space-y-1">
                <div className="font-semibold text-amber-400">{isMm ? 'ရိုးရာခေါင်းပေါင်း & ဦးထုပ်:' : 'Headdress & Crown:'}</div>
                <p className="text-stone-300 leading-relaxed">{isMm ? activeModalItem.headdressMm : activeModalItem.headdressEn}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-stone-800 space-y-1">
                <div className="font-semibold text-amber-400">{isMm ? 'ရိုးရာ လက်ဝတ်ရတနာများ:' : 'Traditional Jewelry:'}</div>
                <p className="text-stone-300 leading-relaxed">{isMm ? activeModalItem.jewelryMm : activeModalItem.jewelryEn}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-stone-800 space-y-1">
                <div className="font-semibold text-amber-400">{isMm ? 'ပွဲတော်နှင့် နောက်ခံ ရှုခင်း:' : 'Festival & Scenic Backdrop:'}</div>
                <p className="text-stone-300 leading-relaxed">{isMm ? `${activeModalItem.festivalMm} (${activeModalItem.backdropMm})` : `${activeModalItem.festivalEn} (${activeModalItem.backdropEn})`}</p>
              </div>
            </div>

            {/* Full Prompt Display */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Full Master Prompt
                </span>
                <button
                  onClick={() => handleCopy(activeModalItem.id, activeModalItem.promptSnippet)}
                  className="text-stone-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {isMm ? 'ကူးယူရန်' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-stone-400 font-mono leading-relaxed bg-black/60 p-3 rounded-xl border border-stone-800 select-all">
                {activeModalItem.promptSnippet}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleSendToStudio(activeModalItem);
                  setActiveModalItem(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isMm ? 'Photo Studio တွင် ချက်ချင်း အသုံးပြုမည်' : 'Send to Photo Studio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
