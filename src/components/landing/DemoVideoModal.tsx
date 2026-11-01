import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Film, AlertCircle } from 'lucide-react';
import { Language } from '../../types';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose, language }) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="SHOW AI Demo Walkthrough"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-slate-200">
                  {language === 'my' ? 'SHOW AI စတူဒီယို သရုပ်ပြချက်' : 'SHOW AI Studio Walkthrough'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HD
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close demo video"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src="/landing/demo.mp4"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                {/* Fallback if browser video tag not supported */}
                <div className="p-8 text-center text-slate-400 max-w-md">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm">
                    {language === 'my'
                      ? 'သင့်ဘရောင်ဇာသည် ဗီဒီယိုကို တိုက်ရိုက်မဖွင့်နိုင်ပါ။'
                      : 'Your browser cannot play this video directly.'}
                  </p>
                </div>
              </video>
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{language === 'my' ? 'ပိတ်ရန် Esc ကို နှိပ်ပါ' : 'Press ESC or tap anywhere outside to close'}</span>
              <span className="text-emerald-400 font-mono">SHOW AI Creative Suite</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
