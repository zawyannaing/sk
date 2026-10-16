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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#d6c3b6]/30">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl text-[#704112] font-bold tracking-tight">
            Saved Prompt Archives
          </h1>
          <p className="font-sans text-sm text-[#51443a] mt-0.5">
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
              className="px-3 py-1.5 rounded-lg border border-[#ba1a1a]/40 text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-sans font-semibold transition-all cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#847469] text-[20px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved prompts by keyword, era, or clothing..."
          className="w-full bg-white border border-[#d6c3b6]/60 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-sans text-[#1e1b19] placeholder-[#847469] focus:outline-none focus:ring-1 focus:ring-[#704112]"
        />
      </div>

      {/* Saved Prompts List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#d6c3b6]/40 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-[#847469]/50">
            bookmark_border
          </span>
          <h3 className="font-headline text-lg font-bold text-[#704112]">
            No Saved Prompts Found
          </h3>
          <p className="font-sans text-xs text-[#51443a] max-w-sm">
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
              className="bg-white rounded-xl p-5 border border-[#d6c3b6]/40 shadow-xs flex flex-col md:flex-row justify-between gap-4 items-start hover:border-[#704112]/40 transition-all"
            >
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-sans text-sm font-bold text-[#1e1b19]">
                    {item.title}
                  </h3>
                  <span className="font-sans text-[11px] text-[#847469]">
                    {item.timestamp}
                  </span>
                </div>

                <div className="p-3 bg-[#faf2ee] rounded-lg border border-[#d6c3b6]/30 font-mono text-xs text-[#51443a] select-all leading-relaxed">
                  {item.prompt}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-[#f4ece9] hover:bg-[#eee7e3] text-[#1e1b19] font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLoadPrompt(item.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-[#704112] text-white hover:bg-[#8c5828] font-sans text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Load</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePrompt(item.id)}
                  className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
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
