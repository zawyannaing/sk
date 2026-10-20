import React, { useState } from 'react';
import { Language } from '../types';

export interface SavedPromptItem {
  id: string;
  title: string;
  prompt: string;
  timestamp: string;
  metadata?: any;
}

interface SavedPromptsViewProps {
  language: Language;
  savedPrompts: SavedPromptItem[];
  onDeletePrompt: (id: string) => void;
  onLoadPrompt: (promptText: string) => void;
  onClearAll: () => void;
}

export const SavedPromptsView: React.FC<SavedPromptsViewProps> = ({
  language,
  savedPrompts,
  onDeletePrompt,
  onLoadPrompt,
  onClearAll
}) => {
  const isMyanmar = language === 'my';
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = savedPrompts.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.prompt.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col w-full px-6 sm:px-10 py-6 gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl text-white font-bold tracking-tight">
            Saved Prompt Archives
          </h1>
          <p className="font-sans text-sm text-zinc-400 mt-0.5">
            {isMyanmar
              ? 'သိမ်းဆည်းထားသော အထူးပြု Prompt များနှင့် ရာဇဝင်မှတ်တမ်းများ'
              : 'Your personalized collection of synthesized Burmese prompts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedPrompts.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs font-sans font-semibold transition-all cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-zinc-500 text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved prompts by keyword, era, or clothing..."
          className="w-full bg-[#0f1420] border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-sans text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Saved Prompts List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0f1420] rounded-xl p-12 text-center border border-zinc-800 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-zinc-600">
            bookmark_border
          </span>
          <h3 className="font-headline text-lg font-bold text-white">
            No Saved Prompts Found
          </h3>
          <p className="font-sans text-xs text-zinc-400 max-w-sm">
            {isMyanmar
              ? 'ပရွမ့် ဖန်တီးပြီးနောက် "Save to Presets" ခလုတ်ကို နှိပ်၍ ဤနေရာတွင် စုဆောင်းထားနိုင်ပါသည်'
              : 'Synthesize custom prompts in the Prompt Builder and click "Save to Presets" to bookmark them here.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#0f1420] rounded-xl p-5 border border-zinc-800 shadow-xs flex flex-col md:flex-row justify-between gap-4 items-start hover:border-emerald-500/40 transition-all"
            >
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-sans text-sm font-bold text-white">
                    {item.title}
                  </h3>
                  <span className="font-sans text-[11px] text-zinc-400">
                    {item.timestamp}
                  </span>
                </div>

                <div className="p-3 bg-[#111622] rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-300 select-all leading-relaxed">
                  {item.prompt}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-[#141b2a] hover:bg-[#1a2234] text-zinc-200 border border-zinc-800 font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">content_copy</span>
                  <span>{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLoadPrompt(item.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-sans text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Load</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePrompt(item.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete prompt"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
