import React, { useState } from 'react';
import {
  Users,
  BarChart3,
  Coins,
  KeyRound,
  Settings,
  Megaphone,
  Package,
  Ticket,
  Sliders,
  ShieldCheck,
  ArrowLeft,
  Globe,
  Menu,
  X,
  LogOut,
  Shield
} from 'lucide-react';
import { AdminModuleId } from './types';
import { adminCopy } from './adminCopy';
import { Language, UserProfile } from '../../types';
import { SupabaseService } from '../../utils/supabaseClient';

interface AdminLayoutProps {
  currentModule: AdminModuleId;
  onSelectModule: (mod: AdminModuleId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onBackToApp: () => void;
  currentUser: UserProfile;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentModule,
  onSelectModule,
  language,
  onLanguageChange,
  onBackToApp,
  currentUser,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const copy = adminCopy[language].nav;

  const navItems: { id: AdminModuleId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: copy.dashboard, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: copy.users, icon: <Users className="w-4 h-4" />, badge: 'Active' },
    { id: 'credits', label: copy.credits, icon: <Coins className="w-4 h-4" /> },
    { id: 'providers', label: copy.providers, icon: <KeyRound className="w-4 h-4" /> },
    { id: 'settings', label: copy.settings, icon: <Settings className="w-4 h-4" /> },
    { id: 'announcements', label: copy.announcements, icon: <Megaphone className="w-4 h-4" /> },
    { id: 'bundles', label: copy.bundles, icon: <Package className="w-4 h-4" /> },
    { id: 'promo_topup', label: copy.promo_topup, icon: <Ticket className="w-4 h-4" /> },
    { id: 'flags', label: copy.flags, icon: <Sliders className="w-4 h-4" /> },
    { id: 'audit', label: copy.audit, icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
    onBackToApp();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0a0d14] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">{copy.brand}</h1>
            <p className="text-[10px] font-mono text-emerald-400">{copy.badge}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-72 bg-[#090c13] border-r border-white/5 flex flex-col justify-between p-5 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Console Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-emerald-500/20">
                S
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight font-serif">{copy.brand}</h1>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  <Shield className="w-2.5 h-2.5" />
                  <span>{copy.badge}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Return to Studio Button */}
          <button
            type="button"
            onClick={onBackToApp}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-zinc-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copy.backToApp}</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectModule(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info & Sign Out */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          {/* Language Switcher */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-black/40 border border-white/5 text-xs">
            <span className="text-zinc-500 flex items-center gap-1.5 font-mono text-[11px] ml-1">
              <Globe className="w-3 h-3 text-zinc-400" />
              Lang:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('my')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  language === 'my'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                မြန်မာ
              </button>
            </div>
          </div>

          {/* Current Admin Pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Admin'}</p>
                <p className="text-[10px] font-mono text-zinc-500 truncate">{currentUser?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title={copy.signOut}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workstation */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
};
