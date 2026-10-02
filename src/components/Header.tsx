import React from 'react';
import { AppMode, Language, UserProfile } from '../types';
import { Globe, User } from 'lucide-react';

interface HeaderProps {
  currentMode?: AppMode;
  onModeChange?: (mode: AppMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser?: UserProfile;
  onOpenUserDashboard?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  currentUser,
  onOpenUserDashboard,
  onOpenAdminDashboard
}) => {
  const isMyanmar = language === 'my';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-3 py-2.5 sm:px-6">
      <div className="mx-auto flex flex-wrap max-w-7xl items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-[2px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <span className="font-black text-sm sm:text-base tracking-tighter bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent select-none">
                SK
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-base sm:text-xl font-black tracking-tight text-transparent whitespace-nowrap">
                Show Ai Studio.
              </h1>
            </div>
          </div>
        </div>

        {/* Right Action Controls: Sign In & Language Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Dashboard / Sign In Button */}
          {onOpenUserDashboard && (
            <button
              type="button"
              onClick={onOpenUserDashboard}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 text-xs text-slate-200 hover:text-white transition-all shadow-sm"
              title="Sign In / User Profile"
            >
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-bold text-xs tracking-tight">
                {currentUser?.name && currentUser.name !== 'Guest User' && currentUser.name !== 'Kyaw Win'
                  ? currentUser.name
                  : 'Sign In'}
              </span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(isMyanmar ? 'en' : 'my')}
            className="flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            title="Toggle Language / ဘာသာစကား ပြောင်းရန်"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-medium text-[11px] sm:text-xs">{isMyanmar ? '🇲🇲' : '🇬🇧'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};

