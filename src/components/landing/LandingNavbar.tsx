import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Sparkles,
  Wand2,
  Compass,
  CreditCard,
  Camera,
  Globe,
  LogIn,
  Menu,
  X,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';
import { Language } from '../../types';
import { cn } from '@/lib/utils';

export interface TopNavItem {
  id: string;
  labelEn: string;
  labelMm: string;
  icon: LucideIcon;
  targetId?: string;
  action?: 'launch' | 'scenes';
}

interface LandingNavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSignIn: () => void;
  onLaunch: () => void;
  isLoggedIn?: boolean;
  onOpenScenes?: () => void;
}

const TOP_NAV_ITEMS: TopNavItem[] = [
  {
    id: 'hero',
    labelEn: 'Home',
    labelMm: 'မူလ',
    icon: Home,
    targetId: 'hero'
  },
  {
    id: 'features',
    labelEn: 'Features',
    labelMm: 'စွမ်းဆောင်ချက်',
    icon: Sparkles,
    targetId: 'features'
  },
  {
    id: 'tools',
    labelEn: 'Tools',
    labelMm: 'Tools',
    icon: Wand2,
    targetId: 'bento-tools'
  },
  {
    id: 'pricing',
    labelEn: 'Pricing',
    labelMm: 'နှုန်းထား',
    icon: CreditCard,
    targetId: 'pricing'
  }
];

const MOBILE_LABEL_WIDTH = 76;

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  language,
  onLanguageChange,
  onSignIn,
  onLaunch,
  isLoggedIn = false,
  onOpenScenes
}) => {
  const isMm = language === 'my';
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      const sectionIds = ['hero', 'features', 'bento-tools', 'pricing'];
      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            const foundIdx = TOP_NAV_ITEMS.findIndex((item) => item.targetId === id);
            if (foundIdx !== -1) {
              setActiveIndex(foundIdx);
            }
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleItemClick = (idx: number, item: TopNavItem) => {
    setActiveIndex(idx);
    setIsMobileMenuOpen(false);

    if (item.action === 'launch') {
      onLaunch();
      return;
    }

    if (item.action === 'scenes') {
      if (onOpenScenes) {
        onOpenScenes();
      } else {
        const el = document.getElementById('scenes');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    if (item.targetId) {
      const el = document.getElementById(item.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'my' : 'en';
    try {
      localStorage.setItem('showai_landing_lang', nextLang);
    } catch {
      // Ignore storage errors
    }
    onLanguageChange(nextLang);
  };

  return (
    <header
      style={{ top: 'var(--top-banner-height, 0px)' }}
      className={`fixed left-0 right-0 z-50 transition-[top,background-color,padding,border-color] duration-300 ease-out ${
        isScrolled
          ? 'bg-[#07090e]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/80 py-2.5 sm:py-3'
          : 'bg-[#07090e]/75 backdrop-blur-md border-b border-white/5 py-3 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ================================================================= */}
        {/* LEFT SIDE: Brand Logo */}
        {/* ================================================================= */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            setActiveIndex(0);
            const el = document.getElementById('hero');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="flex items-center gap-2.5 group cursor-pointer rounded-xl flex-shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/45 transition flex-shrink-0">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              SHOW AI
            </span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden xs:inline">
              v2.0
            </span>
          </div>
        </a>

        {/* ================================================================= */}
        {/* RIGHT SIDE (DESKTOP): Animated Spring Toolbar + Language + Sign In */}
        {/* ================================================================= */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Animated Spring-Physics Toolbar Capsule */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            role="navigation"
            aria-label="Desktop Toolbar"
            className="bg-[#0c1017]/90 border border-white/10 rounded-full flex items-center p-1 shadow-xl backdrop-blur-xl space-x-1"
          >
            {TOP_NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeIndex === idx;
              const labelText = isMm ? item.labelMm : item.labelEn;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex items-center gap-0 px-2.5 lg:px-3 py-1.5 rounded-full transition-colors duration-200 relative h-9 min-w-[38px] cursor-pointer flex-shrink-0',
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 gap-1.5 shadow-sm shadow-emerald-500/20'
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent',
                    'focus:outline-none'
                  )}
                  onClick={() => handleItemClick(idx, item)}
                  aria-label={labelText}
                  type="button"
                >
                  <Icon
                    size={17}
                    strokeWidth={2.2}
                    aria-hidden
                    className="transition-colors duration-200 flex-shrink-0"
                  />

                  <motion.div
                    initial={false}
                    animate={{
                      width: isActive ? `${MOBILE_LABEL_WIDTH}px` : '0px',
                      opacity: isActive ? 1 : 0,
                      marginLeft: isActive ? '6px' : '0px'
                    }}
                    transition={{
                      width: { type: 'spring', stiffness: 350, damping: 32 },
                      opacity: { duration: 0.19 },
                      marginLeft: { duration: 0.19 }
                    }}
                    className="overflow-hidden flex items-center max-w-[76px]"
                  >
                    <span
                      className={cn(
                        'font-semibold text-xs whitespace-nowrap select-none overflow-hidden text-ellipsis leading-none',
                        isActive ? 'text-emerald-400' : 'opacity-0'
                      )}
                      title={labelText}
                    >
                      {labelText}
                    </span>
                  </motion.div>
                </motion.button>
              );
            })}
          </motion.nav>

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 hover:text-white border border-white/10 hover:border-emerald-500/30 transition cursor-pointer flex-shrink-0 shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">{language === 'en' ? 'မြန်မာ' : 'English'}</span>
          </button>

          {/* Sign In / Studio Button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLaunch}
              aria-label="Open Studio"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer flex-shrink-0 shadow-sm shadow-emerald-500/15"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMm ? 'စတူဒီယို' : 'Studio'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              aria-label="Sign In"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 hover:from-emerald-500/25 hover:to-teal-500/25 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 hover:border-emerald-400/60 text-xs font-semibold transition cursor-pointer flex-shrink-0 shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMm ? 'အကောင့်ဝင်ရန်' : 'Sign In'}</span>
            </button>
          )}

        </div>

        {/* ================================================================= */}
        {/* RIGHT SIDE (MOBILE): Language Button + Sign In Button + Menu */}
        {/* ================================================================= */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          
          {/* Mobile Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 border border-white/10 active:scale-95 transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold">{language === 'en' ? 'MY' : 'EN'}</span>
          </button>

          {/* Mobile Header Sign In Button */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLaunch}
              aria-label="Studio"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold active:scale-95 transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isMm ? 'App' : 'App'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              aria-label="Sign In"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold active:scale-95 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold">{isMm ? 'ဝင်ရန်' : 'Sign In'}</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-200 hover:text-white active:scale-95 transition cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-emerald-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

        </div>

      </div>

      {/* =================================================================== */}
      {/* MOBILE DRAWER MENU: Slide Down with Clean Action Rows */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#07090e]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-5 space-y-3 overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-2 gap-2">
              {TOP_NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeIndex === idx;
                const labelText = isMm ? item.labelMm : item.labelEn;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(idx, item)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer border',
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/5 border-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{labelText}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Bottom Actions (Launch Studio & Sign In) */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLaunch();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <span>{isMm ? 'စတူဒီယို ဖွင့်မည်' : 'Open Creative Studio'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {!isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSignIn();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 border border-white/10 flex-shrink-0"
                >
                  {isMm ? 'ဝင်ရန်' : 'Sign In'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingNavbar;
