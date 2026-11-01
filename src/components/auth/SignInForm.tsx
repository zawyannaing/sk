import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { SupabaseService } from '../../utils/supabaseClient';
import { authCopy } from './authCopy';
import { AuthMode } from './types';

interface SignInFormProps {
  language: 'en' | 'my';
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (session: any) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  language,
  onModeChange,
  onSuccess
}) => {
  const copy = authCopy[language].signin;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear sensitive fields on unmount
  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  const isGoogleAuthEnabled = (import.meta as any).env?.VITE_ENABLE_GOOGLE_AUTH !== 'false';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg(authCopy[language].errors.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      const { session, error } = await SupabaseService.signIn(cleanEmail, password);
      if (error) {
        setErrorMsg(error);
        // Clear password field on auth failure as per security instructions
        setPassword('');
      } else if (session) {
        if (!rememberMe) {
          // If not remembering, we still keep in session storage / current memory
        }
        onSuccess(session);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || authCopy[language].errors.networkError);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const oauthUrl = SupabaseService.getOAuthUrl('google', window.location.origin);
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-white tracking-tight">
          {copy.title}
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
        {/* Email Field */}
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
              {copy.passwordLabel}
            </label>
            <button
              type="button"
              onClick={() => onModeChange('forgot')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
            >
              {copy.forgotPassword}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.passwordPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/30"
          />
          <label htmlFor="remember-me" className="text-xs text-zinc-400 cursor-pointer select-none">
            {copy.rememberMe}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <span>{copy.submittingBtn}</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>{copy.submitBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#0f131d] px-3 text-[11px] font-mono uppercase text-zinc-500 absolute">
          {copy.orDivider}
        </span>
      </div>

      {/* Secondary Options: Google + Magic Link */}
      <div className="space-y-2.5">
        {isGoogleAuthEnabled && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2.5 transition-all hover:border-white/20 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{copy.googleBtn}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onModeChange('magic')}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-zinc-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{copy.magicLinkBtn}</span>
        </button>
      </div>

      {/* Switch to Sign Up */}
      <div className="pt-2 text-center text-xs text-zinc-400">
        <span>{copy.noAccount} </span>
        <button
          type="button"
          onClick={() => onModeChange('signup')}
          className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
        >
          {copy.createOne}
        </button>
      </div>
    </div>
  );
};
