import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Sparkles, Globe, Heart, Shield, Lock, ArrowUp } from 'lucide-react';
import { Language } from '../../types';
import { LANDING_COPY } from './landingCopy';

interface FinalCtaFooterProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLaunch: () => void;
  onSignIn: () => void;
  isLoggedIn?: boolean;
}

export const FinalCtaFooter: React.FC<FinalCtaFooterProps> = ({
  language,
  onLanguageChange,
  onLaunch,
  onSignIn,
  isLoggedIn = false
}) => {
  const copy = LANDING_COPY[language];
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const ctaElement = document.getElementById('final-cta-section');
      const ctaRect = ctaElement ? ctaElement.getBoundingClientRect() : null;

      // Show after scrolling past hero (600px), but hide when bottom CTA is in view
      const isPastHero = scrollY > 600;
      const isCtaInView = ctaRect ? ctaRect.top < window.innerHeight && ctaRect.bottom > 0 : false;

      setShowStickyBar(isPastHero && !isCtaInView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ================= FINAL CTA SECTION ================= */}
      <section id="final-cta-section" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Deep ambient background glows */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 lg:p-20 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black/95 border border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.15)] text-center overflow-hidden"
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
            aria-hidden="true"
          />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>250 FREE CREDITS DAILY • NO CARD REQUIRED</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            {copy.finalCta.headline}
          </h2>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {copy.finalCta.subheadline}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={onLaunch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Rocket className="w-5 h-5" />
              <span>{copy.finalCta.ctaButton}</span>
            </button>

            {!isLoggedIn && (
              <button
                type="button"
                onClick={onSignIn}
                className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-base bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'my' ? 'အကောင့်ဝင်ရန် (Sign In)' : 'Sign In with Email'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Brand + Cultural Statement (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-wider text-slate-100 font-mono">
                  SHOW <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  BURMESE SUITE
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                {copy.footer.culturalCredit}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  Archival Heritage Preserved
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  Encrypted & Safe
                </span>
              </div>
            </div>

            {/* Quick Links & Language (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-6">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
                {copy.navbar.links.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Language Switcher & Scroll to Top */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-900">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => onLanguageChange('en')}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      language === 'en'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EN
                  </button>
                  <span className="text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => onLanguageChange('my')}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      language === 'my'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    MY (မြန်မာ)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  <span>Top</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright and Legal */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>{copy.footer.copyright}</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">{copy.footer.privacy}</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">{copy.footer.terms}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Myanmar Creators
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= FLOATING STICKY BOTTOM BAR ================= */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-40 max-w-lg"
          >
            <div className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-950/80 flex items-center justify-between gap-4">
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-100 line-clamp-1">
                  {copy.finalCta.stickyBarText}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Daily 250 Free Credits Active
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onLaunch}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-cyan-400 text-slate-950 hover:from-emerald-400 hover:to-cyan-300 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>{copy.navbar.launchApp}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
