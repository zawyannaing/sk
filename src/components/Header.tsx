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
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ease-in-out ${
      isScrolled
        ? 'border-emerald-500/30 bg-slate-950/95 backdrop-blur-2xl py-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
        : 'border-slate-800/80 bg-slate-950/90 backdrop-blur-xl py-2.5 sm:px-6'
    } px-3`}>
      <div className="mx-auto flex flex-wrap max-w-7xl items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Title with Scroll Animation */}
        <div className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer">
          <div className={`relative flex items-center justify-center rounded-xl overflow-hidden bg-emerald-950/40 border border-emerald-400/40 shadow-[0_0_15px_rgba(0,180,115,0.35)] transition-all duration-300 ${
            isScrolled ? 'h-7 w-7 sm:h-8 sm:w-8 scale-95' : 'h-8 w-8 sm:h-10 sm:w-10'
          }`}>
            <img
              src="/logo.png"
              alt="SHOW AI PROMPT STUDIO"
              className="w-full h-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-logo bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-xs sm:text-base md:text-lg font-black tracking-wider text-transparent whitespace-nowrap truncate max-w-[200px] sm:max-w-none">
                SHOW AI PROMPT STUDIO
              </h1>
              <span className="font-logo bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider hidden sm:inline">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls: Sign In & Language Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Dashboard / Sign In Button */}
          {onOpenUserDashboard && (
            <button
              type="button"
              onClick={() => {
                if (!currentUser?.name || currentUser.name === 'Guest User' || currentUser.name === 'Kyaw Win') {
                  window.dispatchEvent(new CustomEvent('open-supabase-auth'));
                } else {
                  onOpenUserDashboard();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 px-3 py-1.5 text-xs text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
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

