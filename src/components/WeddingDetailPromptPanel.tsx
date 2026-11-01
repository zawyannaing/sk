import React, { useMemo, useState } from 'react';
import { X, Copy, Check, Sparkles, ExternalLink, Wand2, RotateCcw } from 'lucide-react';
import { WeddingTemplate } from '../data/weddingStudioData';
import {
  WeddingDetailOptions,
  WeddingFormat,
  DEFAULT_WEDDING_DETAIL_OPTIONS,
  SUBJECT_OPTIONS,
  FRAMING_OPTIONS,
  MOOD_OPTIONS,
  TIME_OPTIONS,
  CAMERA_OPTIONS,
  COLOR_GRADE_OPTIONS,
  ASPECT_OPTIONS,
  buildWeddingDetailPrompt
} from '../data/weddingDetailPromptBuilder';

interface Props {
  template: WeddingTemplate;
  isMm: boolean;
  initialOptions: WeddingDetailOptions;
  onClose: () => void;
  onOptionsChange?: (opts: WeddingDetailOptions) => void;
  onGenerate: (prompt: string, opts: WeddingDetailOptions) => void;
  onSendToStudio: (prompt: string, opts: WeddingDetailOptions) => void;
}

const FORMAT_TABS: { id: WeddingFormat; label: string }[] = [
  { id: 'master', label: 'Master (Detail)' },
  { id: 'flux', label: 'FLUX / Prose' },
  { id: 'midjourney', label: 'Midjourney v6.1' },
  { id: 'sdxl', label: 'SDXL' },
  { id: 'negative', label: 'Negative' }
];

function ChipGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  isMm
}: {
  title: string;
  options: Record<T, { labelEn: string; labelMm: string }>;
  value: T;
  onChange: (v: T) => void;
  isMm: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(options) as T[]).map(key => {
          const active = key === value;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-zinc-950/70 border border-zinc-800 text-zinc-400 hover:text-white hover:border-pink-500/40'
              }`}
            >
              {isMm ? options[key].labelMm : options[key].labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const WeddingDetailPromptPanel: React.FC<Props> = ({
  template,
  isMm,
  initialOptions,
  onClose,
  onOptionsChange,
  onGenerate,
  onSendToStudio
}) => {
  const [opts, setOpts] = useState<WeddingDetailOptions>(initialOptions);
  const [format, setFormat] = useState<WeddingFormat>('master');
  const [copied, setCopied] = useState(false);

  const update = (patch: Partial<WeddingDetailOptions>) => {
    const next = { ...opts, ...patch };
    setOpts(next);
    onOptionsChange?.(next);
  };

  const result = useMemo(() => buildWeddingDetailPrompt(template, opts), [template, opts]);
  const displayed = result[format];

  // Prose is the most reliable format for direct image generation
  const generationPrompt = result.flux;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#10121b] border border-pink-500/30 rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-pink-400">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Wedding Detail Prompt Studio · {template.category}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 leading-snug">{template.titleEn}</h2>
            <p className="text-xs text-pink-300/80">{template.titleMm}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* LEFT: Controls */}
          <div className="lg:col-span-5 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-zinc-800/80">
            <ChipGroup title={isMm ? 'ဓာတ်ပုံထဲပါမည့်သူ' : 'Subject'} options={SUBJECT_OPTIONS} value={opts.subject} onChange={v => update({ subject: v })} isMm={isMm} />
            <ChipGroup title={isMm ? 'ခံစားချက်' : 'Mood'} options={MOOD_OPTIONS} value={opts.mood} onChange={v => update({ mood: v })} isMm={isMm} />
            <ChipGroup title={isMm ? 'ရိုက်ကွက်' : 'Framing'} options={FRAMING_OPTIONS} value={opts.framing} onChange={v => update({ framing: v })} isMm={isMm} />
            <ChipGroup title={isMm ? 'အချိန်နှင့် အလင်း' : 'Time & Light'} options={TIME_OPTIONS} value={opts.timeOfDay} onChange={v => update({ timeOfDay: v })} isMm={isMm} />
            <ChipGroup title={isMm ? 'ကင်မရာနှင့် မှန်ဘီလူး' : 'Camera & Lens'} options={CAMERA_OPTIONS} value={opts.camera} onChange={v => update({ camera: v })} isMm={isMm} />
            <ChipGroup title={isMm ? 'အရောင် Grade' : 'Color Grade'} options={COLOR_GRADE_OPTIONS} value={opts.colorGrade} onChange={v => update({ colorGrade: v })} isMm={isMm} />

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{isMm ? 'ပုံအချိုး' : 'Aspect Ratio'}</div>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_OPTIONS.map(ar => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => update({ aspectRatio: ar })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold cursor-pointer ${
                      opts.aspectRatio === ar
                        ? 'bg-pink-500 text-white'
                        : 'bg-zinc-950/70 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={opts.faceLock} onChange={e => update({ faceLock: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                <span>{isMm ? 'မျက်နှာ ၁၀၀% Lock (Reference Photo)' : '100% Face Lock (reference photo)'}</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={opts.thanaka} onChange={e => update({ thanaka: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <span>{isMm ? 'သနပ်ခါး ပါးကွက် ထည့်မည်' : 'Add traditional thanaka on cheeks'}</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{isMm ? 'အပိုအသေးစိတ် (စိတ်ကြိုက်)' : 'Custom Details'}</div>
              <textarea
                value={opts.extraDetails}
                onChange={e => update({ extraDetails: e.target.value })}
                rows={3}
                placeholder={isMm ? 'ဥပမာ - bride holding a bouquet of white padauk flowers' : 'e.g. bride holding a bouquet of white padauk flowers'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => update({ ...DEFAULT_WEDDING_DETAIL_OPTIONS })}
              className="text-[11px] text-zinc-500 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isMm ? 'မူလအတိုင်း ပြန်ထားမည်' : 'Reset to defaults'}</span>
            </button>
          </div>

          {/* RIGHT: Output */}
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              {FORMAT_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormat(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    format === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500">
                <span>{FORMAT_TABS.find(t => t.id === format)?.label}</span>
                <span>{displayed.split(/\s+/).length} words</span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-zinc-200 max-h-[340px] overflow-y-auto select-all">
                {displayed}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : isMm ? 'Copy ကူးမည်' : 'Copy Prompt'}</span>
              </button>
              <button
                type="button"
                onClick={() => onSendToStudio(format === 'negative' ? generationPrompt : displayed, opts)}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isMm ? 'Photo Studio သို့' : 'Send to Studio'}</span>
              </button>
              <button
                type="button"
                onClick={() => onGenerate(generationPrompt, opts)}
                className="py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isMm ? 'ချက်ချင်း ထုတ်မည်' : 'Generate Now'}</span>
              </button>
            </div>

            <div className="rounded-2xl bg-pink-950/20 border border-pink-500/25 p-4">
              <div className="text-xs font-bold text-pink-300 mb-2">
                {isMm ? 'ဒါရိုက်တာ ရှင်းလင်းချက် (၅ ချက်)' : "Director's Breakdown (Burmese)"}
              </div>
              <div className="text-[11.5px] text-zinc-300 whitespace-pre-line leading-relaxed">{result.breakdownMm}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
