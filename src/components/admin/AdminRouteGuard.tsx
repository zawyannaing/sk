import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Lock, RefreshCw } from 'lucide-react';
import { SupabaseService } from '../../utils/supabaseClient';
import { adminCopy } from './adminCopy';
import { Language } from '../../types';

interface AdminRouteGuardProps {
  language: Language;
  onBackToApp: () => void;
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  language,
  onBackToApp,
  children
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const copy = adminCopy[language].guard;

  const verifyAdminStatus = async () => {
    setIsVerifying(true);
    try {
      const verified = await SupabaseService.checkIsAdmin();
      setIsAdmin(verified);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyAdminStatus();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <p className="text-sm font-mono text-zinc-400 tracking-wider">
          {copy.checking}
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full rounded-3xl bg-[#0c1017] border border-rose-500/20 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {copy.accessDeniedTitle}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {copy.accessDeniedDesc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-500 text-left flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              Database RLS check <code className="text-emerald-400">public.is_admin()</code> returned false. Manual promotion required via SQL Editor.
            </span>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={onBackToApp}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{copy.returnHome}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { mode: 'signin' } }));
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{copy.signInAdmin}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
