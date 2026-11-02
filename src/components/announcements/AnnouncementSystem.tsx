import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AnnouncementItem } from '../admin/types';
import { SupabaseService } from '../../utils/supabaseClient';
import { Language } from '../../types';

interface AnnouncementSystemProps {
  language: Language;
  isLoggedIn: boolean;
}

const DISMISSED_STORAGE_KEY = 'showai_dismissed_announcements_v1';

export const AnnouncementSystem: React.FC<AnnouncementSystemProps> = ({
  language,
  isLoggedIn
}) => {
  const isMm = language === 'my';
  const bannerRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState<number>(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loadActiveAnnouncements = async () => {
    try {
      const data = await SupabaseService.fetchActiveAnnouncements();
      setAnnouncements(data);
    } catch {}
  };

  useEffect(() => {
    loadActiveAnnouncements();
    const interval = setInterval(loadActiveAnnouncements, 30000);
    const handleRefresh = () => loadActiveAnnouncements();
    window.addEventListener('supabase-announcements-refresh', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('supabase-announcements-refresh', handleRefresh);
    };
  }, []);

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  // Filter announcements for current context
  const filtered = announcements.filter((item) => {
    if (!item.is_active) return false;
    if (dismissedIds.includes(item.id)) return false;

    // Audience filtering
    if (item.audience === 'logged_in' && !isLoggedIn) return false;
    if (item.audience === 'logged_out' && isLoggedIn) return false;

    // Language filtering
    if (item.language !== 'both' && item.language !== language) return false;

    return true;
  });

  const banners = filtered.filter((a) => a.placement === 'banner');
  const modals = filtered.filter((a) => a.placement === 'modal');
  const toasts = filtered.filter((a) => a.placement === 'toast');

  // Rotate multiple banners every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) {
      setActiveBannerIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Adjust active index if count changes
  useEffect(() => {
    if (activeBannerIdx >= banners.length && banners.length > 0) {
      setActiveBannerIdx(banners.length - 1);
    }
  }, [banners.length, activeBannerIdx]);

  // Manage dynamic CSS variable --top-banner-height on documentElement
  // This smoothly shifts down LandingNavbar, TopNavbar and page content without covering them!
  useEffect(() => {
    if (banners.length > 0) {
      const applyHeight = () => {
        const height = bannerRef.current ? bannerRef.current.offsetHeight : 44;
        document.documentElement.style.setProperty('--top-banner-height', `${height}px`);
      };
      applyHeight();
      const timer = setTimeout(applyHeight, 60);
      window.addEventListener('resize', applyHeight);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', applyHeight);
      };
    } else {
      document.documentElement.style.setProperty('--top-banner-height', '0px');
    }
  }, [banners.length, activeBannerIdx]);

  useEffect(() => {
    return () => {
      document.documentElement.style.setProperty('--top-banner-height', '0px');
    };
  }, []);

  const getStyleTokens = (type: AnnouncementItem['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-[#150608]/95 border-rose-500/40 text-rose-100 shadow-[0_4px_24px_rgba(244,63,94,0.18)]',
          liveBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          pingColor: 'bg-rose-400',
          dotColor: 'bg-rose-500',
          beamColor: 'bg-gradient-to-r from-transparent via-rose-500 to-transparent',
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          role: 'alert' as const
        };
      case 'warning':
        return {
          bg: 'bg-[#180e04]/95 border-amber-500/40 text-amber-100 shadow-[0_4px_24px_rgba(245,158,11,0.18)]',
          liveBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          pingColor: 'bg-amber-400',
          dotColor: 'bg-amber-500',
          beamColor: 'bg-gradient-to-r from-transparent via-amber-400 to-transparent',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          role: 'alert' as const
        };
      case 'success':
        return {
          bg: 'bg-[#04150c]/95 border-emerald-500/40 text-emerald-100 shadow-[0_4px_24px_rgba(16,185,129,0.18)]',
          liveBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          pingColor: 'bg-emerald-400',
          dotColor: 'bg-emerald-500',
          beamColor: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          role: 'status' as const
        };
      default:
        return {
          bg: 'bg-[#05111c]/95 border-cyan-500/40 text-cyan-100 shadow-[0_4px_24px_rgba(6,182,212,0.18)]',
          liveBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          pingColor: 'bg-cyan-400',
          dotColor: 'bg-cyan-500',
          beamColor: 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          icon: <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          role: 'status' as const
        };
    }
  };

  const currentBanner = banners[activeBannerIdx] || banners[0];
  const bannerStyle = currentBanner ? getStyleTokens(currentBanner.type) : null;

  return (
    <>
      {/* 1. TOP DEDICATED ANIMATED LIVE ANNOUNCEMENT STRIP (NEVER OVERLAPS NAVBAR) */}
      <AnimatePresence>
        {currentBanner && bannerStyle && (
          <motion.aside
            ref={bannerRef}
            key="live-announcement-top-bar"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role={bannerStyle.role}
            className={`fixed top-0 left-0 right-0 z-[60] h-10 sm:h-11 border-b backdrop-blur-2xl transition-colors duration-300 ${bannerStyle.bg} overflow-hidden`}
          >
            {/* Animated Radiant Laser Beam across bottom border */}
            <div className="absolute bottom-0 inset-x-0 h-[2px] overflow-hidden pointer-events-none">
              <div className={`w-full h-full ${bannerStyle.beamColor} animate-beam-scan opacity-90`} />
            </div>

            <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs">
              {/* Left Side: Live Ping Beacon + Type Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wider ${bannerStyle.liveBadge}`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${bannerStyle.pingColor}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${bannerStyle.dotColor}`} />
                  </span>
                  <span className="uppercase tracking-widest hidden xs:inline">{isMm ? 'သတင်းစဥ်' : 'LIVE'}</span>
                </div>

                <div className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${bannerStyle.badge}`}>
                  {bannerStyle.icon}
                  <span>{currentBanner.type}</span>
                </div>
              </div>

              {/* Center Ticker / Message */}
              <div className="flex-1 min-w-0 flex items-center justify-center text-center px-1 sm:px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center justify-center gap-2 truncate"
                  >
                    <span className="font-bold text-white shrink-0 text-xs sm:text-[13px] tracking-wide">
                      {currentBanner.title}:
                    </span>
                    <span className="truncate text-xs sm:text-[13px] text-zinc-200/95 font-medium">
                      {currentBanner.body}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side: Navigation if multi-banner, CTA, Dismiss */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {banners.length > 1 && (
                  <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)}
                      className="hover:text-white transition cursor-pointer"
                      title="Previous announcement"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span>{activeBannerIdx + 1}/{banners.length}</span>
                    <button
                      type="button"
                      onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
                      className="hover:text-white transition cursor-pointer"
                      title="Next announcement"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {currentBanner.cta_url && currentBanner.cta_label && (
                  <a
                    href={currentBanner.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] inline-flex items-center gap-1 transition-all shadow-sm hover:scale-105"
                  >
                    <span>{currentBanner.cta_label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {currentBanner.dismissible && (
                  <button
                    type="button"
                    onClick={() => handleDismiss(currentBanner.id)}
                    className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. CENTERED MODALS (Only the first un-dismissed modal is displayed) */}
      {modals.length > 0 && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          {(() => {
            const item = modals[0];
            const style = getStyleTokens(item.type);
            return (
              <div
                role={style.role}
                className="max-w-md w-full rounded-3xl bg-[#0c1017] border border-white/10 p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                      {style.icon}
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${style.badge}`}>
                        {item.type}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{item.title}</h3>
                    </div>
                  </div>

                  {item.dismissible && (
                    <button
                      type="button"
                      onClick={() => handleDismiss(item.id)}
                      className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{item.body}</p>

                <div className="pt-2 flex items-center justify-end gap-2">
                  {item.dismissible && (
                    <button
                      type="button"
                      onClick={() => handleDismiss(item.id)}
                      className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}

                  {item.cta_url && item.cta_label && (
                    <a
                      href={item.cta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <span>{item.cta_label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. FLOATING TOASTS */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[110] space-y-2 max-w-sm w-full">
          {toasts.slice(0, 3).map((item) => {
            const style = getStyleTokens(item.type);
            return (
              <div
                key={item.id}
                role={style.role}
                className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start justify-between gap-3 text-xs ${style.bg} animate-in slide-in-from-bottom-2`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">{style.icon}</div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-xs">{item.title}</p>
                    <p className="text-[11px] opacity-90 leading-normal line-clamp-2">{item.body}</p>
                    {item.cta_url && item.cta_label && (
                      <a
                        href={item.cta_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline pt-1"
                      >
                        <span>{item.cta_label}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {item.dismissible && (
                  <button
                    type="button"
                    onClick={() => handleDismiss(item.id)}
                    className="p-1 rounded-md text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
