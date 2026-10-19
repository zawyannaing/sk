import React, { useEffect, useRef, useState } from 'react';
import {
  Database, KeyRound, LogIn, UserPlus, LogOut, Coins, History, Image as ImageIcon,
  ShieldCheck, Upload, Plus, Trash2, Check, Copy, X, RefreshCw, Sparkles,
  ExternalLink, AlertCircle, Layers, Users, ArrowUpRight, ArrowDownRight, Settings
} from 'lucide-react';
import {
  SupabaseService,
  CreditTransaction,
  WebsiteAssetRecord,
  CloudHistoryRecord
} from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface SupabaseCloudHubProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  children: React.ReactNode;
}

export const SupabaseCloudHub: React.FC<SupabaseCloudHubProps> = ({
  currentUser,
  onUserChange,
  children
}) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(SupabaseService.isConfigured());
  const [session, setSession] = useState(SupabaseService.getSession());
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);

  // Setup Form State
  const [supabaseUrl, setSupabaseUrl] = useState(SupabaseService.getConfig()?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(SupabaseService.getConfig()?.anonKey || '');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Auth Gate Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Cloud Control Center Modal State
  const [cloudModalOpen, setCloudModalOpen] = useState<boolean>(false);
  const [activeCloudTab, setActiveCloudTab] = useState<'balance' | 'history' | 'website_photos' | 'admin_users'>('balance');

  // Data States
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [cloudHistory, setCloudHistory] = useState<CloudHistoryRecord[]>([]);
  const [websiteAssets, setWebsiteAssets] = useState<WebsiteAssetRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Website Base Photo Upload State
  const [assetSection, setAssetSection] = useState<WebsiteAssetRecord['section']>('garment');
  const [assetKey, setAssetKey] = useState('');
  const [assetTitleMm, setAssetTitleMm] = useState('');
  const [assetTitleEn, setAssetTitleEn] = useState('');
  const [assetCategory, setAssetCategory] = useState('Royal & Historical');
  const [assetPrompt, setAssetPrompt] = useState('');
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const assetFileRef = useRef<HTMLInputElement | null>(null);

  // Admin Credit Top-up State
  const [topupAmountMap, setTopupAmountMap] = useState<Record<string, number>>({});
  const [topupNoteMap, setTopupNoteMap] = useState<Record<string, string>>({});
  const [adjustingUserId, setAdjustingUserId] = useState<string | null>(null);

  // Refresh profile and cloud data when session is active
  const refreshCloudProfileAndData = async () => {
    if (!SupabaseService.isConfigured() || !SupabaseService.getSession()) return;
    setIsSyncing(true);
    try {
      const profile = await SupabaseService.getUserProfile();
      if (profile) {
        onUserChange(profile);
      }
      const [txList, histList, assetsList] = await Promise.all([
        SupabaseService.fetchCreditTransactions(),
        SupabaseService.fetchUserHistory(),
        SupabaseService.fetchWebsiteAssets()
      ]);
      setTransactions(txList);
      setCloudHistory(histList);
      setWebsiteAssets(assetsList);

      if (profile?.role === 'admin' || currentUser.role === 'admin') {
        const users = await SupabaseService.fetchAllProfiles();
        setAllUsers(users);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isConfigured && session) {
      refreshCloudProfileAndData();
    }
  }, [isConfigured, session?.access_token]);

  // Listen for custom credit/history refresh events dispatched by PhotoPromptStudio
  useEffect(() => {
    const handler = () => {
      refreshCloudProfileAndData();
    };
    window.addEventListener('supabase-cloud-refresh', handler);
    return () => window.removeEventListener('supabase-cloud-refresh', handler);
  }, [isConfigured, session]);

  // ---- Save Supabase URL & Key ----
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    if (!supabaseUrl.trim().startsWith('https://')) {
      setSetupError('Please enter a valid Supabase Project URL starting with https://');
      return;
    }
    if (supabaseAnonKey.trim().length < 20) {
      setSetupError('Please enter a valid Supabase Anon Public Key.');
      return;
    }
    SupabaseService.saveConfig(supabaseUrl, supabaseAnonKey);
    setIsConfigured(true);
    setShowConfigModal(false);
  };

  // ---- Handle Login / Sign Up ----
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthNotice(null);
    setLoadingAuth(true);

    try {
      if (authMode === 'signup') {
        const { session: newSession, error } = await SupabaseService.signUp(
          email,
          password,
          fullName || email.split('@')[0]
        );
        if (error) {
          setAuthError(error);
        } else if (newSession) {
          setSession(newSession);
          await refreshCloudProfileAndData();
        } else {
          setAuthNotice('Account created! If Email Confirmation is enabled in Supabase Auth, please verify your email or disable "Confirm email" in Supabase -> Authentication -> Providers -> Email.');
          setAuthMode('login');
        }
      } else {
        const { session: newSession, error } = await SupabaseService.signIn(email, password);
        if (error) {
          setAuthError(error);
        } else if (newSession) {
          setSession(newSession);
          await refreshCloudProfileAndData();
        }
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    setSession(null);
    setCloudModalOpen(false);
  };

  // ---- Upload Website Base Photo(s) (Supports Multi-Photo Batch Upload) ----
  const handleUploadWebsiteAssets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (assetFiles.length === 0 && !assetTitleEn.trim()) return;
    setUploadingAsset(true);
    try {
      if (assetFiles.length > 0) {
        for (let i = 0; i < assetFiles.length; i++) {
          const file = assetFiles[i];
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const key = assetFiles.length === 1 && assetKey.trim()
            ? assetKey.trim()
            : `${assetSection}_${Date.now()}_${i}`;
          await SupabaseService.saveWebsiteAsset(
            {
              section: assetSection,
              asset_key: key,
              title_mm: assetTitleMm.trim() || baseName,
              title_en: assetTitleEn.trim() ? (assetFiles.length > 1 ? `${assetTitleEn.trim()} #${i + 1}` : assetTitleEn.trim()) : baseName,
              category: assetCategory,
              image_url: '',
              prompt_fragment: assetPrompt.trim(),
              is_active: true,
              sort_order: websiteAssets.length + i
            },
            file
          );
        }
      }
      setAssetKey('');
      setAssetTitleMm('');
      setAssetTitleEn('');
      setAssetPrompt('');
      setAssetFiles([]);
      await refreshCloudProfileAndData();
    } finally {
      setUploadingAsset(false);
    }
  };

  // ---- Admin Credit Adjustment ----
  const handleAdminCreditAdjust = async (targetUserId: string, delta: number) => {
    setAdjustingUserId(targetUserId);
    try {
      const note = topupNoteMap[targetUserId] || (delta >= 0 ? `Admin Top-up (+${delta} Credits)` : `Admin Deduction (${delta} Credits)`);
      const res = await SupabaseService.adminAdjustUserCredits(targetUserId, delta, note);
      if (res.success) {
        await refreshCloudProfileAndData();
      } else {
        alert(res.error || 'Failed to adjust credits');
      }
    } finally {
      setAdjustingUserId(null);
    }
  };

  // ============================================================================
  // GATE 1: SUPABASE CONNECTION SETUP (When URL / ANON_KEY not yet entered)
  // ============================================================================
  if (!isConfigured || showConfigModal) {
    return (
      <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl bg-[#12141d] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono text-[10px] uppercase tracking-wider">
                  100% Supabase Cloud Mode
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Connect Your Supabase Project
                </h1>
                <p className="text-xs text-zinc-400">
                  User History, Credit Balance, Studio Library & Website Base Photos
                </p>
              </div>
            </div>
            {isConfigured && (
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                1. Supabase Project URL (SUPABASE_URL)
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                2. Supabase Anon / Public Key (SUPABASE_ANON_KEY)
              </label>
              <textarea
                required
                rows={3}
                value={supabaseAnonKey}
                onChange={e => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            {setupError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SQL Schema Ready (`supabase_schema.sql`)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Run the generated <code className="text-emerald-300">supabase_schema.sql</code> file in your Supabase SQL Editor to create all tables (<code className="text-zinc-200">profiles</code>, <code className="text-zinc-200">credit_transactions</code>, <code className="text-zinc-200">user_history</code>, <code className="text-zinc-200">website_assets</code>) and Storage buckets (<code className="text-zinc-200">website-photos</code>, <code className="text-zinc-200">user-generations</code>).
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Save & Connect Supabase Cloud</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GATE 2: SUPABASE AUTH LOGIN / REGISTER GATE (100% Cloud Authenticated Mode)
  // ============================================================================
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#12141d] border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center text-pink-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">AI Studio Master Cloud</h1>
                <p className="text-xs text-zinc-400">Sign in to access your Credits, History & Studio</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              title="Change Supabase URL & Key"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'login' ? 'bg-pink-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setAuthError(null); }}
              className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                authMode === 'signup' ? 'bg-pink-500 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name (အမည်)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Aung Kyaw"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com (use admin@... for Admin role)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authNotice && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                {authNotice}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingAuth}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              {loadingAuth ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : authMode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>{authMode === 'login' ? 'Sign In to Studio' : 'Register & Claim 250 Free Credits'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // AUTHENTICATED VIEW: TOP SUPABASE CLOUD BAR + FULL APP + CLOUD MANAGER MODAL
  // ============================================================================
  return (
    <div className="min-h-screen w-full bg-[#090a0f]">
      {/* Top Cloud Status & Balance Bar */}
      <div className="sticky top-0 z-40 bg-[#0d0f17]/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Supabase Cloud</span>
          </span>
          <span className="text-zinc-300 font-semibold truncate">{currentUser.name}</span>
          {currentUser.role === 'admin' && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
              ADMIN
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Credit Balance Pill */}
          <button
            type="button"
            onClick={() => {
              setActiveCloudTab('balance');
              setCloudModalOpen(true);
              refreshCloudProfileAndData();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-semibold transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentUser.credits ?? 0} Credits</span>
          </button>

          {/* Cloud Database & Website Photos Manager Button */}
          <button
            type="button"
            onClick={() => {
              setActiveCloudTab(currentUser.role === 'admin' ? 'website_photos' : 'history');
              setCloudModalOpen(true);
              refreshCloudProfileAndData();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-200 font-semibold transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Cloud & Photos DB</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Application Content */}
      {children}

      {/* ========== SUPABASE CLOUD & WEBSITE PHOTOS MANAGER MODAL ========== */}
      {cloudModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setCloudModalOpen(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#11131c] border border-zinc-800 shadow-2xl text-zinc-100 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-[#11131c]/95 backdrop-blur border-b border-zinc-800 px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base">Supabase Cloud Database & Photo Storage</h2>
                  <p className="text-[11px] text-zinc-400">
                    Real-time Credit Balance, User History, and Website Base Photo Storage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refreshCloudProfileAndData()}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  title="Sync with Supabase"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">API Keys</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCloudModalOpen(false)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-zinc-800/80 overflow-x-auto">
              {[
                { id: 'balance', label: 'Credit Balance & Ledger', icon: Coins },
                { id: 'history', label: `Cloud History (${cloudHistory.length})`, icon: History },
                { id: 'website_photos', label: `Website Base Photos (${websiteAssets.length})`, icon: ImageIcon },
                ...(currentUser.role === 'admin'
                  ? [{ id: 'admin_users', label: `Admin User Credits (${allUsers.length})`, icon: Users }]
                  : [])
              ].map(t => {
                const Icon = t.icon;
                const act = activeCloudTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveCloudTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      act
                        ? 'border-pink-500 text-pink-300 bg-pink-500/10 rounded-t-xl'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-5 space-y-5">
              {/* TAB 1: CREDIT BALANCE & LEDGER */}
              {activeCloudTab === 'balance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30">
                      <span className="text-[11px] font-mono uppercase text-amber-300">Available Balance</span>
                      <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-amber-400" />
                        <span>{currentUser.credits ?? 0} Credits</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        5 Credits / Photo Generation • 1 Credit / Prompt
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">Cloud Generations</span>
                      <div className="text-2xl font-bold text-white mt-1">{cloudHistory.length}</div>
                      <span className="text-[11px] text-zinc-500 mt-1 block">Saved in Supabase `user_history`</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">Account Role</span>
                      <div className="text-lg font-bold text-emerald-300 mt-1 uppercase">{currentUser.role}</div>
                      <span className="text-[11px] text-zinc-500 mt-1 block truncate">{currentUser.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Recent Credit Transactions (`public.credit_transactions`)
                    </h3>
                    {transactions.length > 0 ? (
                      <div className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                        {transactions.map(tx => (
                          <div key={tx.id} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                tx.amount >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-pink-500/15 text-pink-400'
                              }`}>
                                {tx.amount >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-200 truncate">{tx.description}</div>
                                <div className="text-[10px] text-zinc-500 font-mono">
                                  {tx.type} • {new Date(tx.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 font-mono">
                              <div className={`font-bold ${tx.amount >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                                {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} Credits
                              </div>
                              <div className="text-[10px] text-zinc-500">Bal: {tx.balance_after}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                        No credit transactions recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: USER CLOUD HISTORY */}
              {activeCloudTab === 'history' && (
                <div className="space-y-3">
                  {cloudHistory.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {cloudHistory.map(item => (
                        <div key={item.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
                          {item.generated_image_url && (
                            <img
                              src={item.generated_image_url}
                              alt={item.master_prompt}
                              className="w-full h-44 object-cover bg-black"
                            />
                          )}
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-zinc-200 line-clamp-3 leading-relaxed">
                              {item.master_prompt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                              <span>📁 {item.folder} • {item.aspect_ratio}</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  await SupabaseService.deleteHistoryRecord(item.id);
                                  refreshCloudProfileAndData();
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                      Your generated photos and prompts will automatically sync here in Supabase Cloud.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WEBSITE BASE PHOTOS (Garments, Jewelry, Archetypes, Presets) */}
              {activeCloudTab === 'website_photos' && (
                <div className="space-y-5">
                  <form onSubmit={handleUploadWebsiteAssets} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Website Base Photos to Supabase Storage (`website-photos` bucket)</span>
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-400">Supports Unlimited Multi-Photo Selection</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Website Section</label>
                        <select
                          value={assetSection}
                          onChange={e => setAssetSection(e.target.value as any)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="garment">Clothes & Garments (ဝတ်စုံများ)</option>
                          <option value="jewelry_prop">Jewelry & Cultural Props (ရတနာနှင့် အသုံးအဆောင်)</option>
                          <option value="archetype">Myanmar Character Archetypes</option>
                          <option value="preset_template">Studio Preset Templates</option>
                          <option value="banner">Website Hero & Banners</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Title (English)</label>
                        <input
                          type="text"
                          required
                          value={assetTitleEn}
                          onChange={e => setAssetTitleEn(e.target.value)}
                          placeholder="e.g. Royal Mandalay Silk Acheik"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Title (မြန်မာအမည်)</label>
                        <input
                          type="text"
                          value={assetTitleMm}
                          onChange={e => setAssetTitleMm(e.target.value)}
                          placeholder="ဥပမာ - မန္တလေး နန်းတွင်းပိုးအချိတ်"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={assetPrompt}
                        onChange={e => setAssetPrompt(e.target.value)}
                        placeholder="Prompt fragment (optional, e.g. wearing handwoven Mandalay silk Acheik...)"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                      />

                      <div className="flex items-center gap-2">
                        <input
                          ref={assetFileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={e => {
                            if (e.target.files) {
                              setAssetFiles(Array.from(e.target.files));
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => assetFileRef.current?.click()}
                          className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5 text-pink-400" />
                          <span>
                            {assetFiles.length > 0 ? `${assetFiles.length} photo(s) selected` : 'Select Photo(s)'}
                          </span>
                        </button>

                        <button
                          type="submit"
                          disabled={uploadingAsset}
                          className="py-2 px-4 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          {uploadingAsset ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>Upload to Cloud</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Website Assets Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {websiteAssets.map(asset => (
                      <div key={asset.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col">
                        {asset.image_url ? (
                          <img src={asset.image_url} alt={asset.title_en} className="w-full h-36 object-cover bg-black" />
                        ) : (
                          <div className="w-full h-36 bg-zinc-950 flex items-center justify-center text-zinc-600 text-xs">
                            No Image
                          </div>
                        )}
                        <div className="p-2.5 space-y-1 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300">
                              {asset.section}
                            </span>
                            <div className="text-xs font-bold text-white mt-1 truncate">{asset.title_en}</div>
                            <div className="text-[11px] text-zinc-400 truncate">{asset.title_mm}</div>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800 text-[10px]">
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(asset.image_url)}
                              className="text-cyan-400 hover:underline"
                            >
                              Copy URL
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await SupabaseService.deleteWebsiteAsset(asset.id);
                                refreshCloudProfileAndData();
                              }}
                              className="text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ADMIN USER CREDITS & BALANCE TOP-UP MANAGER */}
              {activeCloudTab === 'admin_users' && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-400">
                    Manage all registered users in <code className="text-emerald-300">public.profiles</code> and top-up or deduct their Credit Balance in real time:
                  </div>
                  <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                    {allUsers.map(u => {
                      const customAmt = topupAmountMap[u.id] ?? 100;
                      return (
                        <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{u.name}</span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono uppercase text-zinc-300">
                                {u.role}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                                🪙 {u.credits ?? 0} Credits
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500 font-mono">{u.email}</div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <input
                              type="number"
                              value={customAmt}
                              onChange={e => setTopupAmountMap(prev => ({ ...prev, [u.id]: Number(e.target.value) }))}
                              className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                            />
                            <input
                              type="text"
                              value={topupNoteMap[u.id] || ''}
                              onChange={e => setTopupNoteMap(prev => ({ ...prev, [u.id]: e.target.value }))}
                              placeholder="Reason / Note"
                              className="w-36 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                            <button
                              type="button"
                              disabled={adjustingUserId === u.id}
                              onClick={() => handleAdminCreditAdjust(u.id, Math.abs(customAmt))}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                            >
                              + Add Credits
                            </button>
                            <button
                              type="button"
                              disabled={adjustingUserId === u.id}
                              onClick={() => handleAdminCreditAdjust(u.id, -Math.abs(customAmt))}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs"
                            >
                              - Deduct
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
