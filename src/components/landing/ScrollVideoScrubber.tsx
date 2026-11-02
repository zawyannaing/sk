import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowDown,
  Layers,
  Camera,
  CheckCircle2,
  Film
} from 'lucide-react';
import { Language } from '../../types';

interface ScrollVideoScrubberProps {
  language: Language;
  onLaunch?: () => void;
}

interface Chapter {
  start: number;
  end: number;
  badgeMm: string;
  badgeEn: string;
  titleMm: string;
  titleEn: string;
  descMm: string;
  descEn: string;
  metric: string;
}

const CHAPTERS: Chapter[] = [
  {
    start: 0.0,
    end: 0.33,
    badgeMm: '၀၁ / ရိုးရာဗိသုကာ မူရင်းပုံစံ',
    badgeEn: '01 / ARCHIVAL FORM',
    titleMm: 'မြန်မာ့သမိုင်းဝင် နန်းတွင်းနှင့် ပုဂံအမွေအနှစ်',
    titleEn: 'Archival Heritage & Royal Silk Weave',
    descMm: 'ရိုးရာ ပုဂံ၊ မန္တလေးရွှေနန်းတော် ဗိသုကာနှင့် တကယ့် အထည်အလိပ် ပိုးထည်ဒီဇိုင်းများကို AI သို့ ဦးစွာ ပို့ဆောင်ပေးပါသည်။',
    descEn: 'Authentic Pagan terracotta, Mandalay court silks, and ceremonial tapestries ingested as pure ground truth.',
    metric: '100% Ground Truth'
  },
  {
    start: 0.33,
    end: 0.66,
    badgeMm: '၀၂ / ၉၉.၈% မျက်နှာထိန်းသိမ်းမှု',
    badgeEn: '02 / NEURAL FACE LOCK',
    titleMm: 'မျက်နှာသွင်ပြင် အတိအကျ ပေါင်းစပ်မှု',
    titleEn: '99.8% Likeness & Volumetric Lighting',
    descMm: 'သင့်ဓာတ်ပုံ၏ မျက်နှာအစိတ်အပိုင်း၊ အသားအရေနှင့် သနပ်ခါးအရိပ်များကို မပြောင်းလဲစေဘဲ နန်းတွင်းအလင်းရောင်နှင့် ပေါင်းစပ်ပေးသည်။',
    descEn: 'Micro-pore skin shielding, facial bone preservation, and volumetric sunset relighting dynamically applied.',
    metric: '99.8% Likeness'
  },
  {
    start: 0.66,
    end: 1.0,
    badgeMm: '၀၃ / 8K ရုပ်ရှင်အဆင့် ပြီးမြောက်မှု',
    badgeEn: '03 / 8K MASTER RESOLUTION',
    titleMm: '8K Ultra HD စတူဒီယို လက်ရာမွန်',
    titleEn: '8K Ultra HD Studio Masterpiece',
    descMm: 'စက္ကန့်ပိုင်းအတွင်း 100MP ကင်မရာမှ ရိုက်ကူးထားသကဲ့သို့ ရုပ်ရှင်အဆင့် ဓာတ်ပုံနှင့် 5s ဗီဒီယို လက်ရာကို ရရှိစေပါသည်။',
    descEn: 'Ultra-sharp textile weave, natural bokeh, and cinema-grade color grading ready for high-resolution studio print.',
    metric: '8K Studio Spec'
  }
];

export const ScrollVideoScrubber: React.FC<ScrollVideoScrubberProps> = ({
  language,
  onLaunch
}) => {
  const isMm = language === 'my';
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(5.0);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);

  // Framer Motion Scroll Hook pinned to the scrub track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Track video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setVideoDuration(video.duration);
      }
      setIsVideoReady(true);
      // Nudge 0.01s to guarantee first video frame renders without black screen
      try {
        video.currentTime = 0.01;
      } catch {}
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleLoadedMetadata);
    };
  }, []);

  // Sync scroll position to video frame seeking (Butter-smooth requestAnimationFrame throttle)
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setCurrentProgress(progress);

    if (isAutoPlaying) return; // Allow manual autoplay override if active

    const video = videoRef.current;
    if (!video || !videoDuration) return;

    // Calculate scrubbed timestamp with safe clamping to prevent hitting EOF black frame
    const maxSafeTime = Math.max(videoDuration - 0.06, 0.1);
    const targetTime = Math.min(Math.max(progress * maxSafeTime, 0.01), maxSafeTime);
    setCurrentTimeDisplay(targetTime);

    // Fast seek tolerance to prevent decoding stutter
    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      video.currentTime = targetTime;
    }
  });

  // Handle Autoplay / Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isAutoPlaying) {
      video.pause();
      setIsAutoPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsAutoPlaying(true);
    }
  };

  // Keep track of currentTime during autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (isAutoPlaying) {
        setCurrentTimeDisplay(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [isAutoPlaying]);

  // Determine active chapter based on scroll progress
  const activeChapter =
    CHAPTERS.find((ch) => currentProgress >= ch.start && currentProgress <= ch.end) ||
    CHAPTERS[CHAPTERS.length - 1];

  return (
    <section
      ref={containerRef}
      id="scroll-video-experience"
      className="relative w-full h-[180vh] bg-[#07090e]"
    >
      {/* 🌟 Sticky Fullscreen Viewport Screen (Pins in place while scrubbing) */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* 🖼️ High-res poster fallback so screen is NEVER black */}
        <img
          src="/landing/hero-poster.jpg"
          alt="Burmese Cinema Heritage"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 🎬 5-Second Video (Frame-by-Frame Scrubbed by Scroll) */}
        <video
          ref={videoRef}
          src="/landing/hero-bg.mp4"
          poster="/landing/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/landing/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* 🌑 Cinematic Vignettes & Seamless Top/Bottom Blend Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/60 via-transparent to-[#07090e] pointer-events-none" />

        {/* ============================================================= */}
        {/* TOP BAR: Header Label & Frame Timecode Badge                  */}
        {/* ============================================================= */}
        <div className="absolute top-6 inset-x-4 sm:inset-x-8 z-20 flex items-center justify-between max-w-7xl mx-auto pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl text-white text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isMm ? 'Scroll ဖြင့် စက္ကန့်အလိုက် ဗီဒီယိုထိန်းချုပ်မှု' : 'Scroll-Driven 5s Cinema Scrubber'}</span>
          </div>

          {/* Timecode badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-emerald-500/30 backdrop-blur-xl text-emerald-400 font-tektur text-xs font-bold shadow-lg">
            <Film className="w-3.5 h-3.5" />
            <span>
              {currentTimeDisplay.toFixed(2)}s / {videoDuration.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* ============================================================= */}
        {/* FLOATING CENTER/BOTTOM: Dynamic Chapter Card on Scrub         */}
        {/* ============================================================= */}
        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center space-y-4">
          
          {/* Chapter Badge */}
          <motion.div
            key={activeChapter.badgeEn}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-tektur font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isMm ? activeChapter.badgeMm : activeChapter.badgeEn}</span>
          </motion.div>

          {/* Chapter Title */}
          <motion.h2
            key={activeChapter.titleEn}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-2xl ${
              isMm ? 'font-myanmar' : 'font-oswald uppercase tracking-wide'
            }`}
          >
            {isMm ? activeChapter.titleMm : activeChapter.titleEn}
          </motion.h2>

          {/* Chapter Description */}
          <motion.p
            key={activeChapter.descEn}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-xs sm:text-base text-zinc-200 max-w-xl mx-auto leading-relaxed drop-shadow-md font-medium"
          >
            {isMm ? activeChapter.descMm : activeChapter.descEn}
          </motion.p>

          {/* Metric Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeChapter.metric}</span>
          </div>

        </div>

        {/* ============================================================= */}
        {/* BOTTOM DOCK: Timeline Scrub Bar & Controls                    */}
        {/* ============================================================= */}
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-8 z-30 max-w-3xl mx-auto w-full">
          <div className="p-3 sm:p-4 rounded-2xl bg-black/80 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-2.5">
            
            {/* Top row: Status info + Play button */}
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition shadow-md cursor-pointer"
                  title={isAutoPlaying ? "Pause video" : "Auto play video"}
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                </button>
                <span className="text-xs font-medium text-white/90">
                  {isMm ? 'Scroll ဆွဲ၍ frame အလိုက် ကြည့်ရှုပါ' : 'Scroll down to scrub frames'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>{Math.round(currentProgress * 100)}% Scrubbed</span>
              </div>
            </div>

            {/* Progress Scrub Bar */}
            <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-75"
                style={{ width: `${Math.min(Math.max(currentProgress * 100, 0), 100)}%` }}
              />
            </div>

            {/* Quick 3 Markers */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
              <span className={currentProgress < 0.33 ? 'text-emerald-400 font-bold' : ''}>00s Archival Form</span>
              <span className={currentProgress >= 0.33 && currentProgress < 0.66 ? 'text-emerald-400 font-bold' : ''}>02.5s Neural Face Lock</span>
              <span className={currentProgress >= 0.66 ? 'text-emerald-400 font-bold' : ''}>05s 8K Masterpiece</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ScrollVideoScrubber;
