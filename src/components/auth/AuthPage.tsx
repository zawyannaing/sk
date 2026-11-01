import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { SupabaseService, SupabaseSession } from '../../utils/supabaseClient';
import { AuthBrandPanel } from './AuthBrandPanel';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { MagicLinkForm } from './MagicLinkForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { authCopy } from './authCopy';
import { AuthMode, AuthPageProps } from './types';

export const AuthPage: React.FC<AuthPageProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  targetSection,
  language,
  onLanguageChange,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [recoveryToken, setRecoveryToken] = useState<string | undefined>(undefined);

  // Sync mode when initialMode changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Check URL hash for OAuth redirect, Magic Link, or Password Recovery token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { session, type } = SupabaseService.parseAuthHash();

    if (type === 'recovery' && session?.access_token) {
      setRecoveryToken(session.access_token);
      setMode('recovery');
    } else if (session?.access_token) {
      // Direct session returned via Magic Link or OAuth callback
      SupabaseService.saveSession(session);
      window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
      // Clean URL hash without reload
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      if (onAuthSuccess) {
        onAuthSuccess(session, targetSection);
      }
    }
  }, [onAuthSuccess, targetSection]);

  if (!isOpen) return null;

  const handleSuccessfulAuth = (session: SupabaseSession) => {
    SupabaseService.saveSession(session);
    window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
    if (onAuthSuccess) {
      onAuthSuccess(session, targetSection);
    }
    if (onClose) {
      onClose();
    }
  };

  const handlePasswordResetComplete = () => {
    setMode('signin');
  };

  const copy = authCopy[language];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#0a0d14]/95 border border-white/10 rounded-3xl shadow-2xl shadow-emerald-950/40 overflow-hidden my-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* Left Desktop Brand Column */}
            <div className="hidden lg:block lg:col-span-5">
              <AuthBrandPanel language={language} />
            </div>

            {/* Right Interactive Form Column */}
            <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 bg-[#0d1017]">
              {/* Top Controls: Language Switcher + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                {/* Language Switcher */}
                {onLanguageChange && (
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs">
                    <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
                    <button
                      type="button"
                      onClick={() => onLanguageChange('en')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => onLanguageChange('my')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        language === 'my'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      မြန်မာ
                    </button>
                  </div>
                )}

                {/* Close Button */}
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer ml-auto"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Main Auth Content Area */}
              <div className="py-6 flex-1 flex flex-col justify-center">
                {/* Tabs (Only visible in signin, signup, magic modes) */}
                {(mode === 'signin' || mode === 'signup' || mode === 'magic') && (
                  <div className="grid grid-cols-3 gap-1.5 p-1 mb-6 rounded-2xl bg-black/50 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'signin'
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{copy.tabs.signin}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{copy.tabs.signup}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('magic')}
                      className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mode === 'magic'
                          ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{copy.tabs.magic}</span>
                    </button>
                  </div>
                )}

                {/* Form Switcher with Transition */}
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {mode === 'signin' && (
                    <SignInForm
                      language={language}
                      onModeChange={setMode}
                      onSuccess={handleSuccessfulAuth}
                    />
                  )}

                  {mode === 'signup' && (
                    <SignUpForm
                      language={language}
                      onModeChange={setMode}
                      onSuccess={handleSuccessfulAuth}
                    />
                  )}

                  {mode === 'magic' && (
                    <MagicLinkForm
                      language={language}
                      onModeChange={setMode}
                    />
                  )}

                  {mode === 'forgot' && (
                    <ForgotPasswordForm
                      language={language}
                      onModeChange={setMode}
                    />
                  )}

                  {mode === 'recovery' && (
                    <ResetPasswordForm
                      language={language}
                      recoveryToken={recoveryToken}
                      onSuccess={handlePasswordResetComplete}
                    />
                  )}
                </motion.div>
              </div>

              {/* Bottom Security / Trust Footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>SECURED WITH SUPABASE GOTRUE</span>
                <span className="text-emerald-500/70">END-TO-END ENCRYPTED</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
