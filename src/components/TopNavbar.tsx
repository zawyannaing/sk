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
  activeMainSection?: 'portal' | 'video-prompt' | 'photo-prompt' | 'detail-burmese';
  onSelectMainSection?: (section: 'portal' | 'video-prompt' | 'photo-prompt' | 'detail-burmese') => void;
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
  onToggleCollapse,
  activeMainSection,
  onSelectMainSection
}) => {
  const isPortalMode = activeMainSection === 'portal';

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e0e2e8] z-40 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 ease-in-out ${
        isPortalMode ? 'left-0' : `left-0 ${isCollapsed ? 'md:left-20' : 'md:left-64'}`
      }`}
    >
      {/* Left: Mobile/Sidebar toggle + Engine Selector */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isPortalMode && onToggleCollapse && (
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

        {/* Portal Home Button */}
        {onSelectMainSection && (
          <button
            type="button"
            onClick={() => onSelectMainSection('portal')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-black font-extrabold text-xs shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            title="Go to 3-Section Hub Portal"
          >
            <span className="material-symbols-outlined text-[16px]">apps</span>
            <span className="hidden sm:inline">3 Sections</span>
          </button>
        )}

        <div className="hidden sm:flex items-center bg-[#f7f8fa] border border-[#e0e2e8] rounded-full px-2.5 py-1 shadow-2xs">
          <span className="material-symbols-outlined text-[14px] text-[#4262ff] mr-1">tune</span>
          <select
            value={engine}
            onChange={(e) => onEngineChange(e.target.value)}
            className="bg-transparent font-sans text-xs text-[#1c1c1e] font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="midjourney-v6">Midjourney v6.1</option>
            <option value="flux-1">Flux.1 Dev</option>
            <option value="sdxl">SDXL 1.0</option>
          </select>
        </div>
      </div>

      {/* Center: 3 Section Navigation Switcher Pills */}
      {onSelectMainSection && (
        <div className="flex items-center gap-1 bg-[#f0f2f5] border border-[#e0e2e8] p-1 rounded-full shadow-inner max-w-[500px] overflow-x-auto scrollbar-none mx-2">
          <button
            type="button"
            onClick={() => onSelectMainSection('video-prompt')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainSection === 'video-prompt'
                ? 'bg-[#121318] text-[#ccff00] font-bold shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">videocam</span>
            <span>Video Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMainSection('photo-prompt')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainSection === 'photo-prompt'
                ? 'bg-[#121318] text-pink-400 font-bold shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            <span>Photo Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectMainSection('detail-burmese')}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeMainSection === 'detail-burmese'
                ? 'bg-[#1c1c1e] text-[#ffd02f] font-bold shadow-[0_0_12px_rgba(255,208,47,0.3)]'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/80'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
            <span>Detail Burmese</span>
          </button>
        </div>
      )}

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
