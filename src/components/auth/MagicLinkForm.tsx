import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, ArrowLeft, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { SupabaseService } from '../../utils/supabaseClient';
import { authCopy } from './authCopy';
import { AuthMode } from './types';

interface MagicLinkFormProps {
  language: 'en' | 'my';
  onModeChange: (mode: AuthMode) => void;
}

export const MagicLinkForm: React.FC<MagicLinkFormProps> = ({
  language,
  onModeChange
}) => {
  const copy = authCopy[language].magic;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg(authCopy[language].errors.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await SupabaseService.signInWithOtp(cleanEmail, window.location.origin);
      if (error) {
        setErrorMsg(error);
      } else if (success) {
        setIsSent(true);
        setCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || authCopy[language].errors.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {copy.sentTitle}
          </h3>
          <p className="text-xs text-zinc-300">
            {copy.sentDesc} <span className="font-semibold text-cyan-400">{email}</span>
          </p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
            {copy.sentInstruction}
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            disabled={cooldown > 0 || isLoading}
            onClick={handleSubmit}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <span>{copy.resendBtn}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onModeChange('signin')}
            className="inline-flex items-center justify-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{copy.backToPassword}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>{copy.title}</span>
        </h3>
        <p className="text-xs text-zinc-400">
          {copy.subtitle}
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            {copy.emailLabel}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="email"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span>{copy.submittingBtn}</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{copy.submitBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Back to Password Login */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => onModeChange('signin')}
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{copy.backToPassword}</span>
        </button>
      </div>
    </div>
  );
};
