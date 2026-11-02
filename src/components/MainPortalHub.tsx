import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Camera, 
  Layers, 
  LogIn, 
  Menu,
  ShieldCheck,
  Gift,
  Coins,
  Sparkles,
  Compass
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ScrollReveal } from './ScrollReveal';
import { SupabaseService } from '../utils/supabaseClient';
import { FloatingLanternsBackground } from './FloatingLanternsBackground';

import { UserProfile } from '../types';

export type MainSectionType = 'video-prompt' | 'photo-prompt' | 'detail-burmese' | 'community' | 'scenes-550';

interface MainPortalHubProps {
  onSelectSection: (section: MainSectionType) => void;
  onOpenSlides?: () => void;
  currentUser?: UserProfile;
  onOpenProfile?: () => void;
  onOpenLanding?: () => void;
  onOpenScenes?: () => void;
}

export interface TypewriterPhrase {
  prefix: string;
  highlight: string;
  suffix?: string;
  tag?: string;
}

// 🌟 Advanced Multi-Phrase Typewriter Component with 100% Pre-allocated Dimensions (Zero Layout Shift)
const TypewriterText: React.FC<{
  text?: string;
  highlightPrefix?: string;
  phrases?: TypewriterPhrase[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
  cursorColor?: string;
  loop?: boolean;
  pauseDuration?: number;
  fontPrefixClass?: string;
  fontHighlightClass?: string;
}> = ({
  text,
  highlightPrefix,
  phrases,
  speed = 70,
  deleteSpeed = 32,
  delay = 200,
  className = '',
  cursorColor = '#34d399',
  loop = true,
  pauseDuration = 2800,
  fontPrefixClass = 'font-headline tracking-wide',
  fontHighlightClass = 'font-logo title-gradient tracking-wider'
}) => {
  // Normalize phrases list
  const phrasesList: TypewriterPhrase[] = React.useMemo(() => {
    if (phrases && phrases.length > 0) return phrases;
    if (text) {
      const pLen = highlightPrefix && text.startsWith(highlightPrefix) ? highlightPrefix.length : 0;
      return [{
        prefix: text.slice(0, pLen),
        highlight: text.slice(pLen)
      }];
    }
    return [{ prefix: 'WELCOME TO ', highlight: 'SHOW AI STUDIO' }];
  }, [phrases, text, highlightPrefix]);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrasesList[phraseIndex] || phrasesList[0];
  const targetFullText = (currentPhrase.prefix || '') + (currentPhrase.highlight || '') + (currentPhrase.suffix || '');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    // 1. Finished typing full text -> wait pauseDuration, then start deleting
    if (!isDeleting && charCount === targetFullText.length) {
      if (loop) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
      return () => clearTimeout(timer);
    }

    // 2. Finished deleting -> switch to next phrase, then wait delay and start typing
    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrasesList.length);
      timer = setTimeout(() => {}, delay);
      return () => clearTimeout(timer);
    }

    // 3. In-flight typing or deleting
    const currentSpeed = isDeleting ? deleteSpeed : speed;
    timer = setTimeout(() => {
      setCharCount((prev) => (isDeleting ? Math.max(0, prev - 1) : Math.min(targetFullText.length, prev + 1)));
    }, currentSpeed);

    return () => clearTimeout(timer);
  }, [charCount, isDeleting, targetFullText, loop, pauseDuration, speed, deleteSpeed, delay, phrasesList.length]);

  // Split displayed characters across prefix, highlight, and suffix
  const prefixLength = currentPhrase.prefix ? currentPhrase.prefix.length : 0;
  const highlightLength = currentPhrase.highlight ? currentPhrase.highlight.length : 0;

  const prefixChars = currentPhrase.prefix ? currentPhrase.prefix.slice(0, Math.min(charCount, prefixLength)) : '';
  const highlightChars = charCount > prefixLength
    ? currentPhrase.highlight.slice(0, Math.min(charCount - prefixLength, highlightLength))
    : '';
  const suffixChars = currentPhrase.suffix && charCount > prefixLength + highlightLength
    ? currentPhrase.suffix.slice(0, charCount - (prefixLength + highlightLength))
    : '';

  return (
    <span className={`relative inline-grid grid-cols-1 grid-rows-1 items-center justify-center text-center max-w-full break-words ${className}`}>
      {/* 🔒 Ghost Sizer for 100% Zero Cumulative Layout Shift across all cycling phrases */}
      {phrasesList.map((p, idx) => (
        <span
          key={idx}
          className="col-start-1 row-start-1 invisible select-none pointer-events-none opacity-0 flex items-center justify-center flex-wrap max-w-full break-words"
          aria-hidden="true"
        >
          {p.prefix && <span className={`text-white font-black mr-2 sm:mr-3 ${fontPrefixClass}`}>{p.prefix}</span>}
          {p.highlight && <span className={`${fontHighlightClass}`}>{p.highlight}</span>}
          {p.suffix && <span className={`text-white font-black ml-2 ${fontPrefixClass}`}>{p.suffix}</span>}
          <span className="inline-block w-[3px] h-[0.85em] ml-1.5 opacity-0" />
        </span>
      ))}

      {/* 🌟 Active Visible Animated Typing Layer */}
      <span className="col-start-1 row-start-1 flex items-center justify-center flex-wrap max-w-full break-words z-10">
        {prefixChars && (
          <span className={`text-white font-black mr-2 sm:mr-3 ${fontPrefixClass}`}>{prefixChars}</span>
        )}
        {highlightChars && (
          <span className={`${fontHighlightClass} drop-shadow-[0_0_25px_rgba(5,177,135,0.45)]`}>
            {highlightChars}
          </span>
        )}
        {suffixChars && (
          <span className={`text-white font-black ml-2 ${fontPrefixClass}`}>{suffixChars}</span>
        )}
        <span
          className="inline-block w-[3px] sm:w-[4px] h-[0.85em] ml-1.5 animate-pulse rounded-full shrink-0 shadow-[0_0_12px_#34d399]"
          style={{ backgroundColor: cursorColor }}
        />
      </span>
    </span>
  );
};

export const MainPortalHub: React.FC<MainPortalHubProps> = ({ 
  onSelectSection, 
  onOpenSlides,
  currentUser,
  onOpenProfile,
  onOpenLanding,
  onOpenScenes
}) => {
  const { scrollYProgress } = useScroll();
  const rotateClockwise = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rotateCounterClockwise = useTransform(scrollYProgress, [0, 1], [360, 0]);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!SupabaseService.getSession());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!SupabaseService.getSession());
    };
    window.addEventListener('supabase-cloud-refresh', handleAuthChange);
    return () => window.removeEventListener('supabase-cloud-refresh', handleAuthChange);
  }, []);

  const handleEnterSection = (section: MainSectionType) => {
    const session = SupabaseService.getSession();
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: section } }));
      return;
    }
    onSelectSection(section);
  };

  return (
    <div 
      className="relative min-h-screen w-full text-slate-200 antialiased flex flex-col justify-between overflow-x-hidden selection:bg-teal-500 selection:text-black"
      style={{
        backgroundColor: '#07090d',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16, 185, 129, 0.12), transparent),
          radial-gradient(circle at 10% 25%, rgba(6, 182, 212, 0.05), transparent 40%),
          radial-gradient(circle at 90% 75%, rgba(234, 179, 8, 0.04), transparent 40%),
          radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px'
      }}
    >
      {/* 🌟 Animated Glowing Hot Air Lanterns & Starry Night Background */}
      <FloatingLanternsBackground />

      {/* 🌟 Background Animated Concentric Circle Scroll Rings */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none w-[780px] h-[780px] max-w-[95vw] -z-0 opacity-40 overflow-hidden flex items-center justify-center">
        {/* Outer dashed spinning circle */}
        <motion.div 
          style={{ rotate: rotateClockwise }}
          className="absolute w-[680px] h-[680px] rounded-full border border-dashed border-emerald-500/20"
        />
        {/* Middle dotted reverse spinning circle */}
        <motion.div 
          style={{ rotate: rotateCounterClockwise }}
          className="absolute w-[500px] h-[500px] rounded-full border border-dotted border-cyan-400/20"
        />
        {/* Inner orbit circle with accent nodes */}
        <motion.div 
          style={{ rotate: rotateClockwise }}
          className="absolute w-[340px] h-[340px] rounded-full border border-yellow-500/15"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </motion.div>
        {/* Soft radial blur core */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Top Navbar Header with Clean, Responsive UI/UX (SHOW AI STUDIO) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4" data-purpose="top-navbar">
        {/* BRAND LOGO & TITLE: Protected shrink-0, never squished on mobile */}
        <div 
          onClick={() => {
            if (onOpenLanding) onOpenLanding();
          }}
          className="inline-flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0"
          title="SHOW AI Studio"
        >
          <img
            src="/logo.png"
            alt="SHOW AI Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-contain shadow-md transition duration-200 group-hover:scale-105 shrink-0"
            style={{ filter: 'drop-shadow(rgba(16, 185, 129, 0.35) 0px 4px 14px)' }}
          />
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1 leading-none">
              <span className="font-logo text-white font-black text-sm sm:text-base tracking-wider">
                SHOW AI
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                STUDIO
              </span>
            </div>
            <span className="font-logo text-emerald-400/80 text-[8px] sm:text-[10px] font-semibold tracking-widest uppercase mt-0.5 leading-none hidden xs:inline">
              PROMPT WORKBENCH
            </span>
          </div>
        </div>

        {/* ACTIONS / PILLS RIGHT SIDE: Clean, Balanced Spacing with Zero Overflow */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* 🌟 USER PROFILE PILL (AVATAR, CREDITS) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else window.dispatchEvent(new CustomEvent('open-user-profile'));
            }}
            className="inline-flex items-center gap-1.5 pl-1 pr-2 sm:pr-2.5 py-1 rounded-full text-xs font-semibold text-white bg-stone-900/90 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-500/60 shadow-md transition duration-200 cursor-pointer active:scale-95 group shrink-0"
            title="View User Profile, Plan, Credits & Creations"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-amber-400 group-hover:scale-105 transition-transform shrink-0"
            />
            <span className="font-bold text-stone-100 text-xs hidden md:inline truncate max-w-[90px]">
              {currentUser?.name || 'Profile'}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] sm:text-[10px] font-bold">
              🪙 {(currentUser?.credits ?? 2500).toLocaleString()}
            </span>
            <span className="hidden lg:inline-block px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 text-[9px] font-extrabold uppercase border border-stone-700">
              {currentUser?.plan === 'master' ? 'Master' : currentUser?.plan === 'starter' ? 'Starter' : 'Creator Pro'}
            </span>
          </button>

          {/* 🏛️ SCENES 550+ BUTTON (Full label on sm+, compact badge on mobile) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenScenes) onOpenScenes();
              else handleEnterSection('scenes-550');
            }}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 transition duration-200 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
            title="Explore 550+ Digital Backdrops & Heritage Sets"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Scenes 550+</span>
            <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
              760+
            </span>
          </button>

          {/* COMMUNITY REMIX (hidden on small/medium mobile, shown on lg+) */}
          <button
            type="button"
            onClick={() => handleEnterSection('community')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Explore Global Community Prompt Creations & Remix"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remix</span>
          </button>

          {/* SHOWCASE (hidden on mobile, shown on md+) */}
          {onOpenLanding && (
            <button
              type="button"
              onClick={onOpenLanding}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/50 transition duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="View Showcase & Features Landing Page"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Showcase</span>
            </button>
          )}

          {/* DAILY 250 GIFT BUTTON (Opens Top-Up & Daily Claim) */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-topup-pricing'))}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/35 hover:bg-amber-500/25 transition duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Claim Daily 250 Free Credits or Top-Up Credits"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Free 250 Daily</span>
              <span className="sm:hidden font-mono text-[10px] font-bold">+250</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-supabase-auth'))}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-200 hover:text-white glass-pill transition duration-200 cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Login / Sign In"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 flex-grow flex flex-col items-center">
        
        {/* Hero Section with Multi-Phrase Typing Header */}
        <ScrollReveal direction="up" delay={0.08} duration={0.6} className="text-center max-w-5xl mb-8 sm:mb-10 relative">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Futuristic Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 sm:mb-5 tracking-wide shadow-[0_0_15px_rgba(5,177,135,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-logo uppercase text-[10px] sm:text-xs tracking-wider">
              SHOW AI STUDIO • NEXT-GEN GENERATIVE ENGINE
            </span>
          </div>

          <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-3 min-h-[2.8em] sm:min-h-[1.5em] flex items-center justify-center">
            <TypewriterText
              phrases={[
                {
                  prefix: "WELCOME TO ",
                  highlight: "SHOW AI STUDIO",
                  tag: "NEXT-GEN CREATIVE SUITE"
                },
                {
                  prefix: "START YOUR IMAGINATION WITH ",
                  highlight: "SHOW AI",
                  tag: "UNLEASH YOUR CREATIVITY"
                },
                {
                  prefix: "CRAFT CINEMATIC PROMPTS WITH ",
                  highlight: "SHOW AI STUDIO",
                  tag: "BURMESE CULTURAL MATRIX"
                }
              ]}
              speed={75}
              deleteSpeed={32}
              pauseDuration={2800}
              cursorColor="#22d3ee"
              loop={true}
              fontPrefixClass="font-headline tracking-wide uppercase"
              fontHighlightClass="font-logo title-gradient tracking-wider drop-shadow-[0_0_25px_rgba(5,177,135,0.45)]"
            />
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed mt-4 font-sans">
            Next-generation generative AI prompt engineering suite powered by Show Care Myanmar. Select a specialized studio workstation below.
          </p>
        </ScrollReveal>

        {/* Feature Ticker Bar (borderless glass pill with infinite moving marquee) */}
        <ScrollReveal direction="up" delay={0.14} className="w-full max-w-5xl mb-10 sm:mb-12">
          <div className="rounded-full glass-pill relative overflow-hidden py-3 sm:py-3.5 px-4 shadow-inner flex items-center">
            {/* Edge fade masks */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#0a0d14]/90 via-[#0a0d14]/40 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#0a0d14]/90 via-[#0a0d14]/40 to-transparent z-10" />

            {/* Seamless Infinite Moving Text Track */}
            <div className="animate-marquee flex items-center whitespace-nowrap text-[11px] sm:text-xs font-semibold tracking-widest text-slate-300 uppercase select-none">
              {[0, 1].map((halfIndex) => (
                <div key={halfIndex} className="flex items-center shrink-0">
                  {[0, 1].map((repIndex) => (
                    <div key={repIndex} className="flex items-center gap-x-8 sm:gap-x-10 px-4 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-emerald-400 text-xs sm:text-sm animate-pulse">✦</span>
                        <span>100% Face Likeness Lock</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-amber-400 text-xs sm:text-sm animate-pulse">✦</span>
                        <span>Burmese Cultural Heritage Matrix</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-cyan-400 text-xs sm:text-sm animate-pulse">✦</span>
                        <span className="text-white font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">SHOW CARE MYANMAR</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-fuchsia-400 text-xs sm:text-sm animate-pulse">✦</span>
                        <span className="text-fuchsia-200/95 font-bold drop-shadow-[0_0_8px_rgba(232,121,249,0.35)]">IMAGING WITH BURMESE DETAIL STUDIO</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* 🌟 4 Workstations Grid (borderless glass cards) */}
        <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6" data-purpose="workstation-cards">
          
          {/* Card 1: Video Prompt Studio */}
          <ScrollReveal delay={0.1} className="h-full">
            <article 
              onClick={() => handleEnterSection('video-prompt')}
              className="glass-card rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition duration-300 relative group overflow-hidden cursor-pointer h-full"
              data-purpose="video-studio-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                {/* Header with Icon & Section Badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#05b187]/15 border border-[#05b187]/30 flex items-center justify-center text-[#05b187] group-hover:scale-105 transition-transform duration-200">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-[#05b187] bg-[#05b187]/20 border border-[#05b187]/30 uppercase">
                    <Menu className="w-3 h-3 text-[#05b187]" />
                    SECTION 01
                  </span>
                </div>
                {/* Studio Title & Description */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 tracking-tight">Video Prompt Studio</h2>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-3 sm:mb-6 font-normal">
                  Engineered specifically for next-gen text-to-video AI. Generate director-grade cinematic paragraphs or strictly structured camera JSON.
                </p>
              </div>
              {/* Tag Footer Area */}
              <div className="pt-2 sm:pt-4 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3">Optimized for Video Models:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  {['Veo', 'Sora', 'Kling', 'Hailuo', 'Wan', 'Seedance 2.5'].map((m) => (
                    <span key={m} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900/80 text-slate-300 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 2: Photo Prompt Studio */}
          <ScrollReveal delay={0.2} className="h-full">
            <article 
              onClick={() => handleEnterSection('photo-prompt')}
              className="glass-card rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition duration-300 relative group overflow-hidden cursor-pointer h-full"
              data-purpose="photo-studio-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                {/* Header with Icon & Section Badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-950/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-200">
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-pink-400 bg-pink-950/40 uppercase">
                    <Menu className="w-3 h-3 text-pink-400" />
                    SECTION 02
                  </span>
                </div>
                {/* Studio Title & Description */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 tracking-tight">Photo Prompt Studio</h2>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-3 sm:mb-6 font-normal">
                  High-end photography workbench. Simulates 100MP medium-format optics, studio lighting rigs, and includes multimodal Vision Photo-to-Prompt.
                </p>
              </div>
              {/* Tag Footer Area */}
              <div className="pt-2 sm:pt-4 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3">Optimized for Photo Engines:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  {['Midjourney v6.1', 'FLUX.1 Dev', 'SDXL 1.0', 'Ideogram 2', 'GPT Image'].map((m) => (
                    <span key={m} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900/80 text-slate-300 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 3: Detail Burmese */}
          <ScrollReveal delay={0.3} className="h-full">
            <article 
              onClick={() => handleEnterSection('detail-burmese')}
              className="glass-card rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition duration-300 relative group overflow-hidden cursor-pointer h-full"
              data-purpose="burmese-studio-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                {/* Header with Icon & Section Badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-950/20 flex items-center justify-center text-yellow-400 group-hover:scale-105 transition-transform duration-200">
                    <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-yellow-300 bg-amber-950/40 uppercase">
                    <Menu className="w-3 h-3 text-yellow-400" />
                    SECTION 03
                  </span>
                </div>
                {/* Studio Title, Burmese Subtitle & Description */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight">Detail Burmese</h2>
                <p className="font-myanmar text-yellow-400/90 text-[11px] sm:text-[13px] font-medium leading-relaxed mb-2 sm:mb-3">
                  ၉ ခန်းတွဲ စတူဒီယို၊ မင်္ဂလာဆောင် စတူဒီယို (၆၂ ခု) နှင့် Utilities
                </p>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-3 sm:mb-6 font-normal">
                  Complete 9-Room AI Photography Studio Suite: Burmese Wedding Studio (62+ Templates with 100% Face Lock), Cultural Heritage Matrix, Clothes Swap, Baby Studio, and Pro Utilities.
                </p>
              </div>
              {/* Tag Footer Area */}
              <div className="pt-2 sm:pt-4 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3">Integrated Utilities &amp; Rooms:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  {['Wedding Studio (62+)', 'Prompt Matrix'].map((m) => (
                    <span key={m} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900/80 text-slate-300 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 4: Community Showcase & Remix Hub */}
          <ScrollReveal delay={0.4} className="h-full">
            <article 
              onClick={() => handleEnterSection('community')}
              className="glass-card rounded-2xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between transition duration-300 relative group overflow-hidden cursor-pointer h-full border border-emerald-500/25 hover:border-emerald-500/60"
              data-purpose="community-showcase-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                {/* Header with Icon & Section Badge */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold tracking-widest text-emerald-300 bg-emerald-950/50 uppercase border border-emerald-500/30">
                    <Menu className="w-3 h-3 text-emerald-400" />
                    SECTION 04
                  </span>
                </div>
                {/* Studio Title & Description */}
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2 tracking-tight">Community Remix &amp; 550+ Scenes</h2>
                <p className="font-myanmar text-emerald-400/90 text-[11px] sm:text-[13px] font-medium leading-relaxed mb-2 sm:mb-3">
                  ၅၅၀+ ရှုခင်းစုံ၊ မင်္ဂလာဆောင်၊ နန်းတွင်း နှင့် Master Prompt Remix
                </p>
                <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-3 sm:mb-6 font-normal">
                  Explore 760+ pre-calibrated archival sets and trending community creations. Tap &quot;Remix Prompt&quot; or &quot;Use Scene&quot; with one click.
                </p>
              </div>
              {/* Tag Footer Area */}
              <div className="pt-2 sm:pt-4 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 sm:mb-3">Community Features:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                  {['550+ Scenes', '1-Click Remix', 'Public Showcase', 'Social Crop'].map((m) => (
                    <span key={m} className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900/80 text-emerald-300 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </ScrollReveal>

        </section>

        {/* Bottom Feature Footer */}
        <ScrollReveal delay={0.2} className="w-full">
          <div className="mt-12 sm:mt-16 w-full pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>High-Fidelity Prompt Architecture · Zero Loss Synthesis</span>
            </div>

            <div className="flex items-center gap-4">
              <span>Responsive Mobile & Desktop</span>
              <span>·</span>
              <span>All Generative Engines</span>
            </div>
          </div>
        </ScrollReveal>

      </main>
    </div>
  );
};
