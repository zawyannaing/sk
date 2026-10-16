import React, { useState } from 'react';
import { Language } from '../types';

interface BabyStudioViewProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

interface BabyThemePackage {
  id: string;
  titleEn: string;
  titleMm: string;
  category: 'Studio' | 'Natural' | 'Fine-Art';
  ageGroup: string;
  previewUrl: string;
  lighting: string;
  cradleProp: string;
  promptSnippet: string;
}

const BABY_THEMES: BabyThemePackage[] = [
  {
    id: 'newborn-cocoon',
    titleEn: 'Newborn Cocoon & Soft Knit',
    titleMm: 'မွေးကင်းစ ကလေးငယ် နူးညံ့သော သိုးမွှေး အိပ်အိတ်',
    category: 'Studio',
    ageGroup: '7-14 Days',
    previewUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    lighting: 'Diffused window light, warm milky shadows',
    cradleProp: 'Hand-woven cream wool wrap, natural willow basket',
    promptSnippet: 'peaceful sleeping newborn baby wrapped snugly in soft chunky organic cream merino wool cocoon wrap, resting safely in a rustic woven wicker basket, delicate micro eyelashes, soft rosy cheeks, feather-soft daylight diffused from 45-degree angle'
  },
  {
    id: 'cloud-dream',
    titleEn: 'Cloud Dream & Cotton Fluff',
    titleMm: 'မိုးတိမ် အိပ်မက်နှင့် ဝါဂွမ်း နူးညံ့မှု',
    category: 'Studio',
    ageGroup: '1-3 Months',
    previewUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    lighting: 'High-key studio softbox, ethereal pastel glow',
    cradleProp: 'Fluffy white faux fur, pastel star pillow',
    promptSnippet: 'adorable baby smiling gently lying on a bed of billowy white cotton cloud props, ethereal pastel atmosphere, gentle baby blue and pearl accents, macro lens capturing soft baby peach fuzz'
  },
  {
    id: 'birthday-pastel',
    titleEn: '100-Day / 1st Birthday Pastel',
    titleMm: 'ရက် ၁၀၀ / ၁ နှစ်ပြည့် မွေးနေ့ ပတ်စတယ်',
    category: 'Studio',
    ageGroup: '100 Days / 1 Year',
    previewUrl: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80',
    lighting: 'Vibrant studio ring and beauty dish, crisp catchlights',
    cradleProp: 'Miniature wooden milestone stool, pastel bunting',
    promptSnippet: 'joyful 1-year-old toddler sitting happily with bright sparkling eyes, subtle celebration pastel balloon garland in soft cream and sage, miniature wooden stool, authentic cute laughter'
  },
  {
    id: 'traditional-myanmar-cradle',
    titleEn: 'Traditional Myanmar Golden Teak Cradle',
    titleMm: 'ရိုးရာ ရွှေကျွန်း ပုခက်နှင့် ပုသိမ်ထီးငယ်',
    category: 'Fine-Art',
    ageGroup: '1-6 Months',
    previewUrl: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm teak ambient glow, gentle chandelier bounce',
    cradleProp: 'Carved golden teak baby swing cradle with silk padding',
    promptSnippet: 'traditional Burmese heritage infant portrait, peaceful baby sleeping inside an intricately carved golden teak wood cradle with emerald silk cushions, miniature Pathein parasol prop nearby, warm cultural aesthetic'
  },
  {
    id: 'garden-morning',
    titleEn: 'Garden Morning & Green Foliage',
    titleMm: 'ဥယျာဉ် နံနက်ခင်းနှင့် သဘာဝ သစ်ရွက်စိမ်း',
    category: 'Natural',
    ageGroup: '3-9 Months',
    previewUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    lighting: 'Natural dappled morning sunlight filtering through leaves',
    cradleProp: 'Linen picnic quilt, wooden rattle toy',
    promptSnippet: 'delightful outdoor baby photography, resting comfortably on an organic beige linen blanket under gentle dappled shade of frangipani trees, soft bokeh morning dew'
  },
  {
    id: 'forest-fairy',
    titleEn: 'Forest Fairy & Enchanted Wood',
    titleMm: 'သစ်တော နတ်သမီးလေးနှင့် အနုပညာ အိပ်မက်',
    category: 'Fine-Art',
    ageGroup: '6-12 Months',
    previewUrl: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=80',
    lighting: 'Cinematic rim lighting with soft volumetric sunbeams',
    cradleProp: 'Mossy bark nest, delicate floral crown',
    promptSnippet: 'fine-art portrait of sweet baby with a miniature handcrafted wild jasmine flower crown, seated safely in a hollow mossy timber log cradle, soft cinematic rim light illuminating golden baby curls'
  }
];

export const BabyStudioView: React.FC<BabyStudioViewProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  const [selectedTheme, setSelectedTheme] = useState<BabyThemePackage>(BABY_THEMES[0]);
  const [babyGender, setBabyGender] = useState<'any' | 'boy' | 'girl'>('any');
  const [includeParents, setIncludeParents] = useState<boolean>(false);
  const [poseSafetyLock, setPoseSafetyLock] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Generate Master Prompt
  const masterPrompt = React.useMemo(() => {
    const genderTerm = babyGender === 'boy' ? 'baby boy' : babyGender === 'girl' ? 'baby girl' : 'infant';
    const parentsSnippet = includeParents
      ? ', lovingly cradled in the gentle protective hands of caring parents in soft focus background'
      : '';
    const safetyNote = poseSafetyLock
      ? ', perfectly natural ergonomic supported baby pose, relaxed peaceful breathing posture'
      : '';

    return `Award-winning professional newborn and baby studio portrait of an authentic ${genderTerm} (${selectedTheme.ageGroup}), ${selectedTheme.promptSnippet}${parentsSnippet}${safetyNote}, lighting calibrated: ${selectedTheme.lighting}, shot on Canon EOS R5 with RF 85mm f/1.2L USM lens, shallow depth of field, creamy bokeh, hyper-realistic pristine skin texture with soft natural peach fuzz, 8k resolution --ar 4:5 --style raw --v 6.1`;
  }, [selectedTheme, babyGender, includeParents, poseSafetyLock]);

  const negativePrompt =
    'awkward contorted pose, unsupported baby head, plastic smooth skin, distorted hands, extra fingers, scary expression, harsh flash shadow, oversaturated neon, noisy grain';

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xl shadow-xs border border-[#fcb900]/40">
            <span className="material-symbols-outlined text-[24px]">child_care</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl font-extrabold text-[#1c1c1e] tracking-tight">
                {isMm ? 'Baby Studio — ရင်သွေးငယ် အမှတ်တရ စတူဒီယို' : 'Baby Studio — Newborn & Milestone Portraits'}
              </h1>
              <span className="bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                12 Theme Packages
              </span>
            </div>
            <p className="font-sans text-xs text-[#6b6f7e]">
              {isMm
                ? 'မွေးကင်းစ၊ ရက် ၁၀၀ နှင့် ၁ နှစ်ပြည့် ကလေးငယ်များအတွက် နူးညံ့သောအလင်းနှင့် ရိုးရာပုခက် စတိုင်လ်များ'
                : 'Specialized newborn cocoons, 100-day milestones, and Myanmar traditional teak swing cradles'}
            </p>
          </div>
        </div>

        {/* Safety Lock Badge */}
        <div className="flex items-center gap-2 bg-[#f7f8fa] px-3.5 py-1.5 rounded-full border border-[#e0e2e8]">
          <span className="material-symbols-outlined text-[16px] text-[#00b473]">shield</span>
          <span className="text-xs font-bold text-[#1c1c1e]">
            {isMm ? 'Safe Posing Protocol Locked' : 'Ergonomic Baby Safe Pose'}
          </span>
        </div>
      </div>

      {/* Main Grid: Theme Selection + Studio Settings + Live Preview & Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: 12 Theme Packages (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4262ff]">category</span>
              {isMm ? '၁။ ကလေးအသက်အရွယ်နှင့် Theme Packages' : '1. Milestone Themes'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BABY_THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1c1c1e] bg-[#f7f8fa] ring-2 ring-[#ffd02f] shadow-2xs'
                        : 'border-[#e0e2e8] hover:border-[#b0b4be] bg-white'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-100">
                      <img src={theme.previewUrl} alt={theme.titleEn} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#1c1c1e] text-white">
                          {theme.ageGroup}
                        </span>
                        <span className="text-[10px] text-[#6b6f7e] font-semibold">
                          {theme.category}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#1c1c1e] line-clamp-1">
                        {isMm ? theme.titleMm : theme.titleEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Customization Options */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">tune</span>
              {isMm ? '၂။ စတူဒီယို အသေးစိတ် ဆုံးဖြတ်ချက်များ' : '2. Studio Details'}
            </span>

            {/* Gender Toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-[#555a6a] font-medium">{isMm ? 'ကလေးလိင်' : 'Subject Gender'}</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'any', label: isMm ? 'အားလုံး' : 'Neutral' },
                  { id: 'boy', label: isMm ? 'သားသား' : 'Baby Boy' },
                  { id: 'girl', label: isMm ? 'မီးမီး' : 'Baby Girl' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setBabyGender(g.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      babyGender === g.id
                        ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]'
                        : 'bg-white text-[#1c1c1e] border-[#e0e2e8] hover:bg-[#f7f8fa]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Parents Toggle */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f8fa] border border-[#e0e2e8] cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#4262ff]">family_restroom</span>
                <span className="text-xs font-bold text-[#1c1c1e]">
                  {isMm ? 'မိဘများ၏ နွေးထွေးသော လက်ချောင်းများ ထည့်သွင်းရန်' : 'Include Loving Parents Hands'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeParents}
                onChange={(e) => setIncludeParents(e.target.checked)}
                className="w-4 h-4 text-[#ffd02f] rounded border-gray-300 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

        </div>

        {/* Right: Studio Card & Live Master Prompt (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          {/* Visual Showcase */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-4">
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-neutral-900 border border-[#e0e2e8]">
              <img
                src={selectedTheme.previewUrl}
                alt={selectedTheme.titleEn}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    {selectedTheme.ageGroup}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedTheme.category}
                  </span>
                </div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl">
                  {isMm ? selectedTheme.titleMm : selectedTheme.titleEn}
                </h3>
                <p className="text-white/80 text-xs mt-1">
                  {selectedTheme.cradleProp} • {selectedTheme.lighting}
                </p>
              </div>
            </div>
          </div>

          {/* Master Prompt Output */}
          <div className="bg-white rounded-2xl p-5 border border-[#e0e2e8] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#1c1c1e]">terminal</span>
                <span className="font-sans text-xs uppercase font-extrabold text-[#1c1c1e] tracking-wider">
                  {isMm ? 'Baby Studio Master Prompt (Midjourney / FLUX)' : 'Baby Studio Synthesized Master Prompt'}
                </span>
              </div>
              <span className="text-[10px] bg-[#f7f8fa] text-[#1c1c1e] px-2 py-0.5 rounded-full font-bold border border-[#e0e2e8]">
                {engine.toUpperCase()}
              </span>
            </div>

            <div className="bg-[#f7f8fa] p-3.5 rounded-xl border border-[#e0e2e8] font-mono text-xs text-[#1c1c1e] leading-relaxed break-words">
              {masterPrompt}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#6b6f7e] uppercase tracking-wider">
                Negative Prompt (Clean Baby Safeguard):
              </span>
              <div className="bg-[#fff8f5] p-2.5 rounded-xl border border-[#ffd5c4] font-mono text-[11px] text-[#8c351e] leading-relaxed">
                {negativePrompt}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-[#1c1c1e] text-white hover:bg-black px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                  <span>{isCopied ? (isMm ? 'ကူးယူပြီးပါပြီ!' : 'Copied!') : (isMm ? 'Prompt ကူးယူမည်' : 'Copy Prompt')}</span>
                </button>

                {onSendToMatrix && (
                  <button
                    type="button"
                    onClick={() => onSendToMatrix(masterPrompt)}
                    className="flex items-center gap-1.5 bg-[#ffd02f] text-[#1c1c1e] hover:bg-[#fcb900] px-4 py-2 rounded-full font-bold text-xs cursor-pointer shadow-xs transition-colors border border-[#fcb900]/40"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>{isMm ? 'Matrix သို့ ပို့မည်' : 'Send to Matrix'}</span>
                  </button>
                )}
              </div>

              {onSavePrompt && (
                <button
                  type="button"
                  onClick={() =>
                    onSavePrompt(masterPrompt, {
                      title: `Baby Studio: ${selectedTheme.titleEn}`,
                      ageGroup: selectedTheme.ageGroup
                    })
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#555a6a] hover:text-[#1c1c1e] bg-[#f7f8fa] hover:bg-[#eef0f3] border border-[#e0e2e8] px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">bookmark</span>
                  <span>{isMm ? 'သိမ်းမည်' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
