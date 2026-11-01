import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { SupabaseService } from '../../utils/supabaseClient';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { authCopy } from './authCopy';
import { AuthMode } from './types';

interface SignUpFormProps {
  language: 'en' | 'my';
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (session: any) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  language,
  onModeChange,
  onSuccess
}) => {
  const copy = authCopy[language].signup;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email confirmation state
  const [awaitingEmailConfirm, setAwaitingEmailConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Clear sensitive fields on unmount
  useEffect(() => {
    return () => {
      setPassword('');
      setConfirmPassword('');
    };
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const isGoogleAuthEnabled = (import.meta as any).env?.VITE_ENABLE_GOOGLE_AUTH !== 'false';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg(authCopy[language].errors.invalidEmail);
      return;
    }

    if (password.length < 8) {
      setErrorMsg(authCopy[language].errors.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(authCopy[language].errors.passwordMismatch);
      return;
    }

    setIsLoading(true);
    try {
      const { session, user, error } = await SupabaseService.signUp(
        cleanEmail,
        password,
        fullName.trim() || cleanEmail.split('@')[0]
      );

      if (error) {
        setErrorMsg(error);
        setPassword('');
        setConfirmPassword('');
      } else if (session) {
        onSuccess(session);
      } else if (user) {
        // Confirmation email required by Supabase project
        setAwaitingEmailConfirm(true);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || authCopy[language].errors.networkError);
      setPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess(false);

    try {
      // Re-trigger OTP / signup email confirmation
      await SupabaseService.signInWithOtp(email.trim());
      setResendSuccess(true);
      setResendCooldown(60);
    } catch {
      setErrorMsg('Failed to resend confirmation email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = () => {
    const oauthUrl = SupabaseService.getOAuthUrl('google', window.location.origin);
    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  // If email confirmation is required
  if (awaitingEmailConfirm) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <Mail className="w-7 h-7 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {copy.checkInboxTitle}
          </h3>
          <p className="text-xs text-zinc-300">
            {copy.checkInboxDesc} <span className="font-semibold text-emerald-400">{email}</span>
          </p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
            {copy.checkInboxTip}
          </p>
        </div>

        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Verification link sent successfully!</span>
          </div>
        )}

        <div className="pt-2 space-y-3">
          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            onClick={handleResendVerification}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {resendCooldown > 0 ? (
              <span>
                {copy.resendCooldown} {resendCooldown}s
              </span>
            ) : (
              <span>{copy.resendBtn}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onModeChange('signin')}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-colors block w-full py-1"
          >
            {copy.alreadyHaveAccount} {copy.signInLink}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            {copy.fullNameLabel}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={copy.fullNamePlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1">
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
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            {copy.passwordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.passwordPlaceholder}
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
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

        {/* Password Strength Meter */}
        <PasswordStrengthMeter password={password} language={language} />

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300">
            {copy.confirmPasswordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={copy.confirmPasswordPlaceholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 leading-tight">
          {copy.termsNotice}
        </p>

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
              <UserPlus className="w-4 h-4" />
              <span>{copy.submitBtn}</span>
            </>
          )}
        </button>
      </form>

      {/* Google OAuth (if enabled) */}
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
          <span>Continue with Google</span>
        </button>
      )}

      {/* Switch to Sign In */}
      <div className="pt-1 text-center text-xs text-zinc-400">
        <span>{copy.alreadyHaveAccount} </span>
        <button
          type="button"
          onClick={() => onModeChange('signin')}
          className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
        >
          {copy.signInLink}
        </button>
      </div>
    </div>
  );
};
