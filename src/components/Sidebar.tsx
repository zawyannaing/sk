import React from 'react';

export type NavView =
  | 'portal'
  | 'presentation-slides'
  | 'video-prompt-studio'
  | 'photo-prompt-studio'
  | 'studio-suite'
  | 'pro-workstation'
  | 'photo-to-text'
  | 'prompt-builder'
  | 'preset-library'
  | 'composite-harmonizer'
  | 'photo-manipulation'
  | 'baby-studio'
  | 'old-to-new'
  | 'photo-edit'
  | 'prompt-utility'
  | 'saved-prompts';

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  savedPromptsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  savedPromptsCount = 0,
  isCollapsed = false,
  onToggleCollapse
}) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#ffffff] border-r border-[#e0e2e8] z-50 flex flex-col justify-between py-4 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col gap-5 px-3">
        {/* Brand Logo & Miro Canary Yellow badge & Collapse Toggle */}
        <div className="flex items-center justify-between px-1 pb-3 border-b border-[#eef0f3]">
          <div
            onClick={() => onViewChange('prompt-builder')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Signature Miro Canary Yellow Brand Icon */}
            <div className="h-9 w-9 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-black text-sm tracking-tight shadow-xs shrink-0 group-hover:scale-105 transition-transform border border-[#fcb900]/40">
              SK
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-sm text-[#1c1c1e] font-extrabold leading-tight tracking-tight">
                    Show Prompt
                  </span>
                  <span className="bg-[#ffd02f] text-[#1c1c1e] text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full">
                    PRO
                  </span>
                </div>
                <span className="font-sans text-[11px] text-[#6b6f7e] truncate font-medium">
                  Studio Workspace
                </span>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-full text-[#6b6f7e] hover:text-[#1c1c1e] hover:bg-[#f7f8fa] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          )}
        </div>

        {/* 0. Portal & Presentation Highlight Buttons */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onViewChange('portal')}
            title={isCollapsed ? '3 Sections Portal' : undefined}
            className={`flex items-center justify-between px-3 py-2 rounded-full transition-all text-left font-sans text-xs cursor-pointer ${
              activeView === 'portal'
                ? 'bg-[#1c1c1e] text-[#ffd02f] font-bold shadow-xs ring-2 ring-[#ffd02f]/50'
                : 'bg-zinc-100 hover:bg-zinc-200 text-[#1c1c1e] font-bold border border-zinc-200'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'portal' ? 'text-[#ffd02f]' : 'text-zinc-700'}`}>
                apps
              </span>
              {!isCollapsed && <span>3 Sections Hub</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase bg-[#ffd02f] text-black">
                PORTAL
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewChange('presentation-slides')}
            title={isCollapsed ? 'သင်ခန်းစာ Presentation Slides' : undefined}
            className={`flex items-center justify-between px-3 py-2 rounded-full transition-all text-left font-sans text-xs cursor-pointer ${
              activeView === 'presentation-slides'
                ? 'bg-[#1c1c1e] text-white font-bold shadow-xs ring-2 ring-[#ffd02f]/50'
                : 'bg-gradient-to-r from-[#ffd02f]/20 via-[#ffd02f]/10 to-transparent hover:from-[#ffd02f]/30 border border-[#fcb900]/40 text-[#1c1c1e] font-bold'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[19px] ${activeView === 'presentation-slides' ? 'text-[#ffd02f]' : 'text-[#b27b00]'}`}>
                slideshow
              </span>
              {!isCollapsed && <span>သင်ခန်းစာ Slides</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
                မြန်မာဘာသာ
              </span>
            )}
          </button>
        </div>

        {/* 1. Generative Workspace Navigation */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-3 font-sans text-[10px] text-[#8e91a0] uppercase tracking-wider font-bold">
              Main Workflows
            </span>
          )}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'video-prompt-studio' as NavView, icon: 'videocam', label: 'Video Prompt Studio', tag: 'VIDEO', tagColor: 'bg-[#ccff00] text-black font-extrabold' },
              { id: 'photo-prompt-studio' as NavView, icon: 'photo_camera', label: 'Photo Prompt Studio', tag: 'PHOTO', tagColor: 'bg-[#ffd02f] text-black font-extrabold' },
              { id: 'studio-suite' as NavView, icon: 'grid_view', label: '8-Room Studio Suite', tag: 'Ajax Spec', tagColor: 'bg-[#1c1c1e] text-[#ffd02f]' },
              { id: 'pro-workstation' as NavView, icon: 'wb_iridescent', label: 'Pro Workstation', tag: 'Capture One', tagColor: 'bg-[#ffd02f] text-[#1c1c1e]' },
              { id: 'photo-to-text' as NavView, icon: 'auto_fix_normal', label: 'Photo to Text', tag: 'AI Reverse', tagColor: 'bg-[#ffd02f] text-[#1c1c1e]' },
              { id: 'prompt-builder' as NavView, icon: 'auto_fix_high', label: 'Prompt Matrix', tag: null, tagColor: '' },
              { id: 'preset-library' as NavView, icon: 'collections_bookmark', label: 'Preset & Eras Library', tag: null, tagColor: '' }
            ].map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-full transition-all text-left font-sans text-xs cursor-pointer ${
                    active
                      ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                      : 'text-[#555a6a] hover:bg-[#f7f8fa] hover:text-[#1c1c1e]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${active ? 'text-[#ffd02f]' : 'text-[#6b6f7e]'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      active ? 'bg-white/20 text-white' : item.tagColor
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 2. Photo Utility & Editing Suite */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-3 font-sans text-[10px] text-[#8e91a0] uppercase tracking-wider font-bold">
              Dedicated Studio Rooms
            </span>
          )}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'composite-harmonizer' as NavView, icon: 'wallpaper', label: 'Background Changer', tag: 'Presets', tagColor: 'bg-[#fff8e0] text-[#746019]' },
              { id: 'photo-manipulation' as NavView, icon: 'auto_fix_high', label: 'Photo Manipulation', tag: 'FX Styles', tagColor: 'bg-[#ede9fe] text-[#5b21b6]' },
              { id: 'old-to-new' as NavView, icon: 'photo_camera_back', label: 'Old to New Photo', tag: 'Restore', tagColor: 'bg-[#c3faf5] text-[#187574]' },
              { id: 'baby-studio' as NavView, icon: 'child_care', label: 'Baby Studio', tag: '12 Themes', tagColor: 'bg-[#ffebee] text-[#c62828]' },
              { id: 'photo-edit' as NavView, icon: 'brush', label: 'Photo Edit Studio', tag: 'Inpaint', tagColor: 'bg-[#f5f3ff] text-[#4262ff]' },
              { id: 'prompt-utility' as NavView, icon: 'build', label: 'Prompt Utilities', tag: 'Pro Tools', tagColor: 'bg-[#e8f5e9] text-[#2e7d32]' }
            ].map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center justify-between px-3 py-2 rounded-full transition-all text-left font-sans text-xs cursor-pointer ${
                    active
                      ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                      : 'text-[#555a6a] hover:bg-[#f7f8fa] hover:text-[#1c1c1e]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[18px] ${active ? 'text-[#ffd02f]' : 'text-[#6b6f7e]'}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.tag && (
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      active ? 'bg-white/20 text-white' : item.tagColor
                    }`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. Archives & Collections */}
        <div className="flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-3 font-sans text-[10px] text-[#8e91a0] uppercase tracking-wider font-bold">
              Collections
            </span>
          )}
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onViewChange('saved-prompts')}
              title={isCollapsed ? 'Saved Prompts' : undefined}
              className={`flex items-center justify-between px-3 py-2 rounded-full transition-all text-left font-sans text-xs cursor-pointer ${
                activeView === 'saved-prompts'
                  ? 'bg-[#1c1c1e] text-white font-semibold shadow-xs'
                  : 'text-[#555a6a] hover:bg-[#f7f8fa] hover:text-[#1c1c1e]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] ${activeView === 'saved-prompts' ? 'text-[#ffd02f]' : 'text-[#6b6f7e]'}`}>
                  bookmarks
                </span>
                {!isCollapsed && <span>Saved Prompts</span>}
              </div>
              {!isCollapsed && savedPromptsCount > 0 && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                  activeView === 'saved-prompts'
                    ? 'bg-[#ffd02f] text-[#1c1c1e]'
                    : 'bg-[#f7f8fa] text-[#1c1c1e] border border-[#e0e2e8]'
                }`}>
                  {savedPromptsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom Miro-Style Pastel Information Chip */}
      {!isCollapsed ? (
        <div className="px-3 flex flex-col gap-2 mt-2">
          <div className="bg-[#fff8e0] p-3 rounded-2xl border border-[#fcb900]/30 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00b473]"></span>
              <span className="font-sans text-[10px] text-[#746019] uppercase font-bold tracking-wider">
                Miro-Style Canvas Active
              </span>
            </div>
            <p className="font-sans text-[11px] text-[#746019] leading-tight font-medium">
              8K restoration &amp; inpaint studio live.
            </p>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="font-sans text-[11px] text-[#8e91a0]">v2.5 Pro</span>
            <span className="font-sans text-[11px] text-[#00b473] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b473] animate-pulse"></span>
              Ready
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center pb-2">
          <span className="w-2 h-2 rounded-full bg-[#00b473] animate-pulse" title="Ready"></span>
        </div>
      )}
    </aside>
  );
};
