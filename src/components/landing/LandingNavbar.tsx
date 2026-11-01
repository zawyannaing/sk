import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Globe, LogIn, ArrowRight } from 'lucide-react';
import { Language } from '../../types';
import { LandingNavSectionId } from './types';
import { landingCopy } from './landingCopy';

interface LandingNavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSignIn: () => void;
  onLaunch: () => void;
  isLoggedIn?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  language,
  onLanguageChange,
  onSignIn,
  onLaunch,
  isLoggedIn = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<LandingNavSectionId>('hero');
  const [isScrolled, setIsScrolled] = useState(false);

  const t = landingCopy[language].navbar;

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds: LandingNavSectionId[] = [
        'hero',
        'features',
        'suite-8step',
        'photo-studio',
        'photo-tools',
        'video-studio',
        'before-after',
        'pricing'
      ];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'my' : 'en';
    try {
      localStorage.setItem('showai_landing_lang', nextLang);
    } catch {
      // Ignore private mode storage errors
    }
    onLanguageChange(nextLang);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07090e]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80 py-3'
          : 'bg-transparent py-4 sm:py-5 border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero');
          }}
          className="flex items-center gap-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-wider text-white font-logo flex items-center gap-1.5">
              <span>{t.brandTitle}</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                v2.0
              </span>
            </span>
            <span className="text-[11px] text-zinc-400 -mt-1 hidden sm:inline">
              {t.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 bg-white/[0.03] backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {t.links.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'မြန်မာ' : 'EN'}</span>
          </button>

          {/* Sign In Button */}
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 transition cursor-pointer flex items-center gap-1.5 hover:text-white"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.signIn}</span>
            </button>
          ) : (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-bold">
              ✓ Logged In
            </span>
          )}

          {/* Primary Launch App CTA */}
          <button
            type="button"
            onClick={onLaunch}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-xs font-black hover:brightness-110 active:scale-95 transition shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center gap-1.5"
          >
            <span>{t.launchApp}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label="Toggle language"
            className="p-2 rounded-xl bg-zinc-900 text-xs font-bold text-zinc-300 border border-zinc-800 cursor-pointer"
          >
            {language === 'en' ? 'MY' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#07090e]/95 backdrop-blur-2xl border-b border-zinc-800 px-4 py-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {t.links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignIn();
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-sm font-bold text-zinc-200 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>{t.signIn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLaunch();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <span>{t.launchApp}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
