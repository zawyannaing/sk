import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone/installed mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 2. Check if dismissed recently (cooldown: 3 days)
    const dismissedTime = localStorage.getItem('show_ai_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice && isSafari) {
      // Delay showing iOS prompt slightly so it doesn't interrupt page load
      const timer = setTimeout(() => setShowPrompt(true), 3500);
      return () => clearTimeout(timer);
    }

    // 4. Capture beforeinstallprompt on Chromium / Android / Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. App installed listener
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledSuccess(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('show_ai_pwa_dismissed', Date.now().toString());
  };

  if (isStandalone) return null;

  return (
    <>
      {/* 1. Main Floating Install Pill / Banner */}
      {showPrompt && !installedSuccess && (
        <div className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#14151f]/95 backdrop-blur-xl border border-pink-500/30 shadow-2xl shadow-pink-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="SHOW AI Logo" className="w-full h-full object-contain rounded-[10px]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Install SHOW AI App
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  ဖုန်းမျက်နှာပြင်တွင် App အဖြစ် ထည့်သွင်းအသုံးပြုပါ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS Safari Step-by-Step Installation Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#14151f] border border-zinc-800 p-5 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-0.5 shadow-md flex items-center justify-center">
                <img src="/logo.png" alt="App Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Install on iPhone / iPad</h4>
                <p className="text-[11px] text-zinc-400">iOS Safari တွင် App အဖြစ် သွင်းနည်း</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  Safari browser အောက်ခြေရှိ <span className="font-bold text-pink-400 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share icon</span> ကို နှိပ်ပါ။
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  အောက်သို့ အနည်းငယ် scroll ဆွဲပြီး <span className="font-bold text-pink-400 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" /> "Add to Home Screen"</span> ကို ရွေးချယ်ပါ။
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed">
                  ညာဘက်အပေါ်ထောင့်ရှိ <span className="font-bold text-white">"Add"</span> ကို နှိပ်လိုက်ပါက သင့်ဖုန်းတွင် App အဖြစ် အပြည့်အဝ အသုံးပြုနိုင်ပါပြီ။
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              နားလည်ပါပြီ (Got it)
            </button>
          </div>
        </div>
      )}

      {/* 3. Installed Success Feedback Pill */}
      {installedSuccess && (
        <div className="fixed top-6 right-6 z-50 max-w-sm p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>SHOW AI App installed successfully on your device!</span>
        </div>
      )}
    </>
  );
};
