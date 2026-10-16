import React from 'react';
import { Language } from '../types';

interface TopNavbarProps {
  engine: string;
  onEngineChange: (engine: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  onExport: () => void;
  onOpenUserDashboard?: () => void;
  onOpenSlides?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  engine,
  onEngineChange,
  language,
  onLanguageChange,
  onGenerate,
  isGenerating = false,
  onExport,
  onOpenUserDashboard,
  onOpenSlides,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e0e2e8] z-40 flex items-center justify-between px-4 sm:px-8 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Mobile/Sidebar toggle + Engine Selector */}
      <div className="flex items-center gap-3">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-full text-[#1c1c1e] hover:bg-[#f7f8fa] border border-[#e0e2e8] cursor-pointer transition-colors"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        )}

        <div className="flex items-center bg-[#f7f8fa] border border-[#e0e2e8] rounded-full px-3 py-1 shadow-2xs">
          <span className="material-symbols-outlined text-[15px] text-[#4262ff] mr-1.5">tune</span>
          <span className="font-sans text-[11px] text-[#8e91a0] mr-1.5 font-medium">Model:</span>
          <select
            value={engine}
            onChange={(e) => onEngineChange(e.target.value)}
            className="bg-transparent font-sans text-xs text-[#1c1c1e] font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="midjourney-v6">Midjourney v6.1</option>
            <option value="flux-1">Flux.1 Dev / Pro</option>
            <option value="sdxl">Stable Diffusion XL</option>
            <option value="dalle-3">DALL-E 3 Precision</option>
          </select>
        </div>

        <div className="hidden md:flex items-center bg-[#fff8e0] text-[#746019] border border-[#fcb900]/30 px-3 py-1 rounded-full font-sans text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00b473] mr-1.5"></span>
          <span>Archival Verified</span>
        </div>
      </div>

      {/* Right: Actions, Language Switch & User Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          {/* Tutorial / Presentation Slides Button */}
          {onOpenSlides && (
            <button
              type="button"
              onClick={onOpenSlides}
              className="h-9 px-3 sm:px-3.5 rounded-full bg-[#fff8e0] hover:bg-[#fff0c0] border border-[#fcb900]/60 text-[#746019] flex items-center gap-1.5 font-sans text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="မြန်မာဘာသာ သင်ခန်းစာ & အသုံးပြုပုံ Slides"
            >
              <span className="material-symbols-outlined text-[17px] text-[#b27b00]">slideshow</span>
              <span className="hidden sm:inline">သင်ခန်းစာ Slides</span>
              <span className="sm:hidden">Slides</span>
            </button>
          )}

          {/* Export Pill Button (Secondary border pill in Miro spec) */}
          <button
            type="button"
            onClick={onExport}
            className="h-9 px-4 rounded-full bg-white hover:bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e] flex items-center gap-1.5 font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Export prompt syntax or copy to file"
          >
            <span className="material-symbols-outlined text-[16px] text-[#6b6f7e]">ios_share</span>
            <span>Export</span>
          </button>

          {/* Miro Primary Black Pill Button with Canary Yellow accent icon */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-9 px-5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] active:bg-[#050038] flex items-center gap-1.5 font-sans text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin text-[#ffd02f]">refresh</span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px] text-[#ffd02f]">electric_bolt</span>
                <span>Generate Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Miro Two-State Pill Toggle (Language) */}
        <div className="flex items-center bg-[#f7f8fa] border border-[#e0e2e8] rounded-full p-0.5">
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-[#1c1c1e] text-white shadow-xs'
                : 'text-[#6b6f7e] hover:text-[#1c1c1e]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('my')}
            className={`px-3 py-1 rounded-full font-sans text-xs font-semibold transition-all cursor-pointer ${
              language === 'my'
                ? 'bg-[#1c1c1e] text-white shadow-xs'
                : 'text-[#6b6f7e] hover:text-[#1c1c1e]'
            }`}
          >
            MY
          </button>
        </div>

        {/* User Avatar Circular Badge */}
        <button
          type="button"
          onClick={onOpenUserDashboard}
          className="w-9 h-9 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-black text-xs cursor-pointer shadow-xs border border-[#fcb900]/50 hover:ring-2 hover:ring-[#ffd02f] transition-all"
          title="Account Profile"
        >
          SK
        </button>
      </div>

    </header>
  );
};
