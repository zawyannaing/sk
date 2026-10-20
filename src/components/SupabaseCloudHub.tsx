import React, { useEffect, useRef, useState } from 'react';
import {
  Database, KeyRound, LogIn, UserPlus, LogOut, Coins, History, Image as ImageIcon,
  ShieldCheck, Upload, Plus, Trash2, Check, Copy, X, RefreshCw, Sparkles,
  ExternalLink, AlertCircle, Layers, Users, ArrowUpRight, ArrowDownRight, Settings,
  Gift, CreditCard, Wallet, CheckCircle, Zap, Lock, Crown, Clock, CheckCircle2,
  XCircle, Search, Sliders, ArrowRight, AlertTriangle, FileText
} from 'lucide-react';
import {
  SupabaseService,
  CreditTransaction,
  WebsiteAssetRecord,
  CloudHistoryRecord,
  TopupRequest
} from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface SupabaseCloudHubProps {
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  children: React.ReactNode;
  isPortal?: boolean;
  onNavigateToSection?: (section: any) => void;
  onSignOut?: () => void;
}

export const SupabaseCloudHub: React.FC<SupabaseCloudHubProps> = ({
  currentUser,
  onUserChange,
  children,
  isPortal = false,
  onNavigateToSection,
  onSignOut
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
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Cloud Control Center Modal State
  const [cloudModalOpen, setCloudModalOpen] = useState<boolean>(false);
  const [activeCloudTab, setActiveCloudTab] = useState<'balance' | 'topup' | 'history' | 'website_photos' | 'admin_users'>('topup');
  const [dailyClaimLoading, setDailyClaimLoading] = useState<boolean>(false);
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(SupabaseService.checkDailyRewardStatus());
  const [topupLoading, setTopupLoading] = useState<boolean>(false);
  const [selectedTopupPkg, setSelectedTopupPkg] = useState<'starter' | 'creator' | 'master'>('creator');
  const [paymentMethod, setPaymentMethod] = useState<'kpay' | 'wave' | 'card'>('kpay');
  const [transferRef, setTransferRef] = useState<string>('');
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'requests' | 'users'>('requests');
  const [adminUserSearch, setAdminUserSearch] = useState<string>('');
  const [adminReviewNote, setAdminReviewNote] = useState<string>('');
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState<TopupRequest | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const isLoggedIn = !!session?.user?.id;
  const isAdmin = currentUser.role === 'admin' || session?.user?.user_metadata?.role === 'admin';

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(acc);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  // Top-up packages definition
  const TOPUP_PACKAGES = [
    {
      id: 'starter' as const,
      name: 'Starter Creator',
      credits: 1000,
      costUsd: 10,
      mmkApprox: '40,000 Ks',
      bonus: null,
      popular: false,
      photos: '200 Standard Photos / 1,000 Prompts',
      desc: 'Ideal for prompt creation and fast standard photo generation'
    },
    {
      id: 'creator' as const,
      name: 'Creator Pro',
      credits: 5500,
      costUsd: 50,
      mmkApprox: '200,000 Ks',
      bonus: '+10% Bonus (500 Free Credits)',
      popular: true,
      photos: '1,100 Standard / ~680 2K HD Photos',
      desc: 'Most popular for active digital artists, studios, and creators'
    },
    {
      id: 'master' as const,
      name: 'Studio Master',
      credits: 12000,
      costUsd: 100,
      mmkApprox: '400,000 Ks',
      bonus: '+20% Extra Bonus (2,000 Free Credits)',
      popular: false,
      photos: '2,400 Photos / ~1,000 4K UHD Masterworks',
      desc: 'Maximum value with commercial license & priority GPU generation'
    }
  ];

  // Daily 250 Free Credits Claimer (Logged-in only)
  const handleClaimDaily = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setDailyClaimLoading(true);
    try {
      const res = await SupabaseService.claimDailyReward();
      if (res.success && res.credits !== undefined) {
        onUserChange({ ...currentUser, credits: res.credits });
        setCanClaimDaily(false);
        await refreshCloudProfileAndData();
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        alert('🎉 Congratulations! You have received your Daily 250 Free Credits! / ယနေ့အတွက် ၂၅၀ Credit အောင်မြင်စွာ ရယူပြီးပါပြီ။');
      } else {
        alert(res.error || 'Could not claim daily reward');
        if (res.alreadyClaimed) setCanClaimDaily(false);
      }
    } finally {
      setDailyClaimLoading(false);
    }
  };

  // User Submit Top-up Order (Pending Admin Verification)
  const handleSubmitTopupOrder = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    const pkg = TOPUP_PACKAGES.find(p => p.id === selectedTopupPkg);
    if (!pkg) return;
    if (!transferRef.trim()) {
      alert('ကျေးဇူးပြု၍ ငွေလွှဲပြေစာ အမှတ် (Transaction ID / Reference) ထည့်သွင်းပေးပါရန်။\nPlease enter your payment transaction slip ID or reference number.');
      return;
    }

    setTopupLoading(true);
    try {
      const methodLabel = paymentMethod === 'kpay' ? 'KBZPay' : paymentMethod === 'wave' ? 'WavePay' : 'Visa / Mastercard';
      const res = await SupabaseService.submitTopupRequest(
        pkg.id,
        pkg.name,
        pkg.credits,
        pkg.costUsd,
        methodLabel,
        transferRef.trim()
      );
      if (res.success && res.request) {
        setOrderSubmittedSuccess(res.request);
        setTransferRef('');
        const reqs = await SupabaseService.fetchTopupRequests(session?.user?.id);
        setTopupRequests(reqs);
      } else {
        alert(res.error || 'Failed to submit top-up request');
      }
    } finally {
      setTopupLoading(false);
    }
  };

  // Admin Top-up Approval Handlers
  const handleAdminApproveRequest = async (reqId: string) => {
    setAdjustingUserId(reqId);
    try {
      const res = await SupabaseService.approveTopupRequest(reqId, adminReviewNote.trim() || undefined);
      if (res.success) {
        setAdminReviewNote('');
        await refreshCloudProfileAndData();
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        alert('✅ Top-Up Request Approved & Credits Successfully Added to User Account!');
      } else {
        alert(res.error || 'Failed to approve request');
      }
    } finally {
      setAdjustingUserId(null);
    }
  };

  const handleAdminRejectRequest = async (reqId: string) => {
    setAdjustingUserId(reqId);
    try {
      const res = await SupabaseService.rejectTopupRequest(reqId, adminReviewNote.trim() || 'Payment slip verification failed');
      if (res.success) {
        setAdminReviewNote('');
        await refreshCloudProfileAndData();
        alert('❌ Request marked as Rejected.');
      } else {
        alert(res.error || 'Failed to reject request');
      }
    } finally {
      setAdjustingUserId(null);
    }
  };

  const handleAdminSetCredits = async (userId: string, exactAmount: number) => {
    setAdjustingUserId(userId);
    try {
      const note = topupNoteMap[userId] || 'Admin balance adjustment';
      const res = await SupabaseService.adminSetUserCredits(userId, exactAmount, note);
      if (res.success && res.credits !== undefined) {
        await refreshCloudProfileAndData();
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        alert(`✅ User credits updated to ${res.credits.toLocaleString()} Credits`);
      } else {
        alert(res.error || 'Failed to update credits');
      }
    } finally {
      setAdjustingUserId(null);
    }
  };

  const handleAdminToggleUserRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to "${nextRole}"?`)) return;
    setAdjustingUserId(userId);
    try {
      const res = await SupabaseService.adminChangeUserRole(userId, nextRole);
      if (res.success) {
        await refreshCloudProfileAndData();
        alert(`✅ User role updated to ${nextRole}`);
      } else {
        alert(res.error || 'Failed to change user role');
      }
    } finally {
      setAdjustingUserId(null);
    }
  };

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
        const [users, allReqs] = await Promise.all([
          SupabaseService.fetchAllProfiles(),
          SupabaseService.fetchTopupRequests()
        ]);
        setAllUsers(users);
        setTopupRequests(allReqs);
      } else if (session?.user?.id) {
        const myReqs = await SupabaseService.fetchTopupRequests(session.user.id);
        setTopupRequests(myReqs);
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

  // Listen for open login/auth modal event from any section or header button
  useEffect(() => {
    const openAuthHandler = (e: any) => {
      if (e?.detail?.targetSection) {
        setPendingSection(e.detail.targetSection);
      }
      setShowAuthModal(true);
    };
    const openCloudHandler = (e: any) => {
      if (e?.detail?.tab) setActiveCloudTab(e.detail.tab);
      setCloudModalOpen(true);
      refreshCloudProfileAndData();
    };
    window.addEventListener('open-supabase-auth', openAuthHandler);
    window.addEventListener('open-supabase-cloud', openCloudHandler);
    return () => {
      window.removeEventListener('open-supabase-auth', openAuthHandler);
      window.removeEventListener('open-supabase-cloud', openCloudHandler);
    };
  }, []);

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
          setShowAuthModal(false);
          await refreshCloudProfileAndData();
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
          if (pendingSection && onNavigateToSection) {
            onNavigateToSection(pendingSection);
            setPendingSection(null);
          }
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
          setShowAuthModal(false);
          await refreshCloudProfileAndData();
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
          if (pendingSection && onNavigateToSection) {
            onNavigateToSection(pendingSection);
            setPendingSection(null);
          }
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
    window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
    if (onSignOut) {
      onSignOut();
    }
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
  // UNIFIED RESPONSIVE VIEW: TOP BAR + FULL APP + ON-DEMAND MODALS (NO HARD GATE)
  // ============================================================================
  return (
    <div className="min-h-screen w-full bg-[#090a0f]">
      {/* Main Application Content */}
      {children}

      {/* ========== SUPABASE CONNECTION SETUP MODAL (ON-DEMAND) ========== */}
      {showConfigModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl bg-[#12141d] border border-emerald-500/30 shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={e => e.stopPropagation()}
          >
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
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Save & Connect Supabase Cloud</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== SUPABASE AUTH LOGIN / REGISTER MODAL (APPEARS ON CLICK) ========== */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            setShowAuthModal(false);
            setPendingSection(null);
            setAuthError(null);
            setAuthNotice(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#12141d] border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SHOW AI Cloud Studio</h1>
                  <p className="text-xs text-zinc-400">Sign in to sync your Credits, History & Studios</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  setPendingSection(null);
                  setAuthError(null);
                  setAuthNotice(null);
                }}
                className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === 'signup' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow' : 'text-zinc-400 hover:text-white'
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
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
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
                  placeholder="you@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
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
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-98 transition-all"
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
      )}

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
                {(isAdmin || !isConfigured) && (
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 border border-zinc-700/80 cursor-pointer transition-colors"
                    title={isAdmin ? "Database Connection Config (Admin Only)" : "Configure Supabase Database"}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">DB Config</span>
                  </button>
                )}
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
                { id: 'topup', label: 'Credit Store & Packages (250 Free Daily)', icon: Sparkles },
                { id: 'balance', label: 'Credit Balance & Ledger', icon: Coins },
                { id: 'history', label: `Cloud History (${cloudHistory.length})`, icon: History },
                { id: 'website_photos', label: `Website Base Photos (${websiteAssets.length})`, icon: ImageIcon },
                ...(isAdmin
                  ? [{
                      id: 'admin_users',
                      label: `👑 Admin Console (${topupRequests.filter(r => r.status === 'pending').length > 0 ? `${topupRequests.filter(r => r.status === 'pending').length} Pending` : `${allUsers.length} Users`})`,
                      icon: Crown
                    }]
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
                  {/* Daily Free 250 Credits Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                        <Gift className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white">Daily Free 250 Credits</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                            Free Daily Refill
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          Free users receive 250 credits renewed every 24 hours for photo & prompt generation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {canClaimDaily ? (
                        <button
                          type="button"
                          onClick={handleClaimDaily}
                          disabled={dailyClaimLoading}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {dailyClaimLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                          <span>Claim 250 Credits</span>
                        </button>
                      ) : (
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Claimed for Today (✓)</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveCloudTab('topup')}
                        className="px-3.5 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>+ Buy More</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/30">
                      <span className="text-[11px] font-mono uppercase text-amber-300">Available Balance</span>
                      <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-amber-400" />
                        <span>{currentUser.credits ?? 0} Credits</span>
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        5 Credits / Photo • 1 Credit / Prompt
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

              {/* TAB 1.5: BUY & TOP-UP CREDITS SESSION */}
              {activeCloudTab === 'topup' && (
                <div className="space-y-6">
                  {/* AUTHENTICATION REQUIRED GUARD IF NOT LOGGED IN */}
                  {!isLoggedIn ? (
                    <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-[#131522] to-zinc-950 border border-amber-500/30 text-center space-y-4 shadow-2xl">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/10">
                        <Lock className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                          Authentication Required
                        </span>
                        <h3 className="text-lg font-bold text-white tracking-wide pt-1">
                          Sign In Required to Access Credit Store & Daily Gift
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Only authenticated creators can claim the Daily 250 Free Credits refill and submit Credit Store top-up requests. Sign in to your SHOW AI Studio account or register for free in seconds.
                        </p>
                      </div>
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 stroke-[2.5]" />
                          <span>Sign In to Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowAuthModal(true); setAuthMode('signup'); }}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-all active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Create Free Account (+250 Credits)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Daily Free 250 Credits Box */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/10 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
                            <Gift className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white">Free Creator Daily 250 Credits</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                Free Daily Refill
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 mt-0.5">
                              Free tier creators receive 250 free credits refreshed every single day!
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {canClaimDaily ? (
                            <button
                              type="button"
                              onClick={handleClaimDaily}
                              disabled={dailyClaimLoading}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {dailyClaimLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                              <span>Claim 250 Free Credits</span>
                            </button>
                          ) : (
                            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Claimed for Today (✓)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Header / Intro */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
                        <div>
                          <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Coins className="w-5 h-5 text-amber-400" />
                            <span>SHOW AI Credit Store & Packages • Credit ဖြည့်သွင်းခြင်း</span>
                          </h2>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Select a package, complete transfer to official SHOW CARE account, and submit your reference for admin verification.
                          </p>
                        </div>

                        <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-zinc-400">Current Balance:</span>
                          <span className="text-sm font-bold text-amber-400 font-mono">🪙 {(currentUser.credits ?? 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Top-up Package Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TOPUP_PACKAGES.map(pkg => {
                          const isSel = selectedTopupPkg === pkg.id;
                          return (
                            <div
                              key={pkg.id}
                              onClick={() => setSelectedTopupPkg(pkg.id)}
                              className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                                isSel
                                  ? 'bg-gradient-to-b from-pink-500/15 via-purple-500/10 to-zinc-900 border-pink-500 shadow-xl shadow-pink-500/10 ring-1 ring-pink-500'
                                  : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                              }`}
                            >
                              {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[10px] tracking-wide uppercase shadow">
                                  🔥 Most Popular
                                </div>
                              )}
                              {pkg.bonus && !pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] tracking-wide uppercase shadow">
                                  👑 Best Value
                                </div>
                              )}

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-white">{pkg.name}</span>
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    isSel ? 'border-pink-400 bg-pink-500 text-black' : 'border-zinc-700 bg-zinc-800'
                                  }`}>
                                    {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-extrabold text-white">${pkg.costUsd}</span>
                                  <span className="text-xs text-zinc-400 font-mono">USD</span>
                                  <span className="text-xs text-emerald-400 font-mono">({pkg.mmkApprox})</span>
                                </div>

                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                  <div className="text-lg font-bold text-amber-400 font-mono flex items-center gap-1.5">
                                    <Coins className="w-5 h-5 text-amber-400" />
                                    <span>{pkg.credits.toLocaleString()} Credits</span>
                                  </div>
                                  {pkg.bonus && (
                                    <div className="text-[11px] font-bold text-emerald-300 font-mono">
                                      {pkg.bonus}
                                    </div>
                                  )}
                                  <div className="text-[11px] text-zinc-400">
                                    {pkg.photos}
                                  </div>
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed">
                                  {pkg.desc}
                                </p>
                              </div>

                              <div className="pt-4 mt-2 border-t border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => setSelectedTopupPkg(pkg.id)}
                                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                                    isSel
                                      ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-md'
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  }`}
                                >
                                  {isSel ? 'Selected Package' : 'Select Package'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Payment Method Selector & Top-Up Request Submission (Users CANNOT self-credit) */}
                      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-5">
                        <div>
                          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                            Select Payment Method • ငွေပေးချေမှု နည်းလမ်းရွေးပါ
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('kpay')}
                              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                                paymentMethod === 'kpay'
                                  ? 'bg-blue-500/15 border-blue-500 text-white ring-1 ring-blue-500'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <Wallet className="w-5 h-5 text-blue-400 shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-white">KBZPay</div>
                                <div className="text-[10px] text-zinc-400">မြန်မာကျပ်ငွေဖြင့် တိုက်ရိုက်လွှဲမည်</div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('wave')}
                              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                                paymentMethod === 'wave'
                                  ? 'bg-yellow-500/15 border-yellow-500 text-white ring-1 ring-yellow-500'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <Wallet className="w-5 h-5 text-yellow-400 shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-white">WavePay</div>
                                <div className="text-[10px] text-zinc-400">Wave Money ဖြင့် လွှဲမည်</div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('card')}
                              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                                paymentMethod === 'card'
                                  ? 'bg-purple-500/15 border-purple-500 text-white ring-1 ring-purple-500'
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              <CreditCard className="w-5 h-5 text-purple-400 shrink-0" />
                              <div>
                                <div className="text-xs font-bold text-white">Card / Bank Transfer</div>
                                <div className="text-[10px] text-zinc-400">Visa / Mastercard / CB / AYA</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Official Receiver Information Box */}
                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4" />
                              <span>SHOW CARE Official Verified Account</span>
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              Amount to Transfer: <strong className="text-amber-400 text-xs">{TOPUP_PACKAGES.find(p => p.id === selectedTopupPkg)?.mmkApprox}</strong> (${TOPUP_PACKAGES.find(p => p.id === selectedTopupPkg)?.costUsd} USD)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">KBZPay / WavePay Account</span>
                                {copiedAccount === '09798889991' ? (
                                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Copied!
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyAccount('09798889991')}
                                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" /> Copy
                                  </button>
                                )}
                              </div>
                              <div className="text-base font-mono font-bold text-white">
                                09798889991
                              </div>
                              <span className="text-[11px] text-zinc-300 block">Name: <strong>U AUNG MYO (SHOW CARE)</strong></span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-[11px] text-zinc-400 flex flex-col justify-center">
                              <div className="font-semibold text-zinc-200">📌 Top-up Instructions / လမ်းညွှန်ချက်များ:</div>
                              <div>၁။ အထက်ပါ Account သို့ ရွေးချယ်ထားသော ပမာဏအတိုင်း ငွေလွှဲပေးပါ။</div>
                              <div>၂။ ငွေလွှဲပြေစာ အမှတ် (Transaction ID) ကို အောက်တွင် ထည့်သွင်းပါ။</div>
                              <div>၃။ Submit ခလုတ်နှိပ်၍ Admin သို့ ပေးပို့ပါ။ Admin စစ်ဆေးပြီး မိနစ်ပိုင်းအတွင်း Credit ဖြည့်ပေးမည်ဖြစ်ပါသည်။</div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono uppercase text-zinc-300 mb-1.5">
                              Transfer Transaction Slip ID / Reference (ငွေလွှဲပြေစာ အမှတ် သို့မဟုတ် နောက်ဆုံးဂဏန်းများ) *
                            </label>
                            <input
                              type="text"
                              value={transferRef}
                              onChange={e => setTransferRef(e.target.value)}
                              placeholder="e.g. KPAY-10928374 or Wave-83742 or Bank Slip Ref"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                            />
                          </div>
                        </div>

                        {/* Order Submitted Success Banner */}
                        {orderSubmittedSuccess && (
                          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-200">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Top-Up Request Submitted Successfully!</span>
                            </div>
                            <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                              Order ID: <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-white">{orderSubmittedSuccess.id}</code> • Package: <strong>{orderSubmittedSuccess.package_name}</strong> (+{orderSubmittedSuccess.credits.toLocaleString()} Credits). Admin has received your request and will verify your payment slip shortly.
                            </p>
                          </div>
                        )}

                        {/* Submit Order Request Button (Users cannot self-credit!) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                          <div className="text-xs text-zinc-400">
                            Package: <span className="font-bold text-white">{TOPUP_PACKAGES.find(p => p.id === selectedTopupPkg)?.name}</span> (
                            <span className="text-amber-400 font-bold font-mono">+{TOPUP_PACKAGES.find(p => p.id === selectedTopupPkg)?.credits.toLocaleString()} Credits</span>
                            ) • <span className="text-zinc-500">Admin Approval Required</span>
                          </div>

                          <button
                            type="button"
                            disabled={topupLoading || !transferRef.trim()}
                            onClick={handleSubmitTopupOrder}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                          >
                            {topupLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Submitting Request...</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4 text-pink-200" />
                                <span>Submit Top-Up Request for Verification</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* User's Recent Top-Up Requests */}
                      {topupRequests.length > 0 && (
                        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold flex items-center justify-between">
                            <span>My Top-Up Requests & Status • ပေးပို့ထားသော စာရင်းများ</span>
                            <span className="text-[10px] text-zinc-500 font-normal">Auto-synced with Admin</span>
                          </h4>
                          <div className="divide-y divide-zinc-800/80 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                            {topupRequests.map(req => (
                              <div key={req.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{req.package_name}</span>
                                    <span className="font-mono text-amber-400 font-bold">+{req.credits.toLocaleString()} Cr</span>
                                    <span className="text-[10px] text-zinc-400 font-mono">(${req.cost_usd} via {req.payment_method})</span>
                                  </div>
                                  <div className="text-[11px] text-zinc-400 font-mono">
                                    Ref: <span className="text-zinc-200">{req.payment_ref}</span> • {new Date(req.created_at).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {req.status === 'pending' && (
                                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-[10px] flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                                      <span>Pending Admin Verification</span>
                                    </span>
                                  )}
                                  {req.status === 'approved' && (
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>Approved & Credited</span>
                                    </span>
                                  )}
                                  {req.status === 'rejected' && (
                                    <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 font-semibold text-[10px] flex items-center gap-1">
                                      <XCircle className="w-3 h-3 text-red-400" />
                                      <span>Rejected {req.admin_note ? `(${req.admin_note})` : ''}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Pricing Rate Reference Guide */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                      SHOW AI Resolution Pricing Guide • Credit အသုံးပြုမှု နှုန်းထားများ
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="font-mono text-zinc-400 text-[11px]">1K Standard</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">5 Credits</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">$0.05 / photo</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="font-mono text-zinc-400 text-[11px]">2K High-Res</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">8 Credits</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">$0.08 / photo</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="font-mono text-zinc-400 text-[11px]">4K Ultra HD</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">12 Credits</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">$0.12 / photo</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                        <div className="font-mono text-zinc-400 text-[11px]">8K Master</div>
                        <div className="text-sm font-bold text-amber-400 mt-1">20 Credits</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">$0.20 / photo</div>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 col-span-2 sm:col-span-1">
                        <div className="font-mono text-zinc-400 text-[11px]">Video / Prompt</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1">1 Credit</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">$0.01 / prompt</div>
                      </div>
                    </div>
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

              {/* TAB 4: ADMIN USER CREDITS & TOP-UP APPROVAL MANAGER */}
              {activeCloudTab === 'admin_users' && isAdmin && (
                <div className="space-y-4">
                  {/* Admin Console Header & Sub-Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-zinc-900 to-amber-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>Master Admin Control Center</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase">
                            Admin Only
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Verify user top-up requests and manage all registered user accounts and credit balances.
                        </p>
                      </div>
                    </div>

                    {/* Sub-Tab Navigation */}
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setActiveAdminSubTab('requests')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeAdminSubTab === 'requests'
                            ? 'bg-purple-500 text-white shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Top-Up Requests</span>
                        {topupRequests.filter(r => r.status === 'pending').length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black">
                            {topupRequests.filter(r => r.status === 'pending').length}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAdminSubTab('users')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeAdminSubTab === 'users'
                            ? 'bg-purple-500 text-white shadow'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Manage Users ({allUsers.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowConfigModal(true)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Edit Supabase Database Connection Credentials"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">DB Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: TOP-UP REQUESTS QUEUE */}
                  {activeAdminSubTab === 'requests' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Submitted top-up orders requiring verification:</span>
                        <span className="font-mono text-amber-400">
                          {topupRequests.filter(r => r.status === 'pending').length} Pending
                        </span>
                      </div>

                      {topupRequests.length > 0 ? (
                        <div className="space-y-3">
                          {topupRequests.map(req => {
                            const isPending = req.status === 'pending';
                            return (
                              <div
                                key={req.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isPending
                                    ? 'bg-zinc-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                                    : 'bg-zinc-900/40 border-zinc-800 opacity-80'
                                }`}
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-white text-sm">{req.user_name}</span>
                                      <span className="text-zinc-400 font-mono text-xs">({req.user_email})</span>
                                      {isPending ? (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                          ⏳ Pending Verification
                                        </span>
                                      ) : req.status === 'approved' ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                                          ✓ Approved
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                                          ✗ Rejected
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
                                      <div className="px-2.5 py-1 rounded-lg bg-black/50 border border-white/5 flex items-center gap-1.5">
                                        <span className="text-zinc-400">Package:</span>
                                        <span className="font-bold text-white">{req.package_name}</span>
                                      </div>
                                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 font-mono font-bold text-amber-300">
                                        +{req.credits.toLocaleString()} Credits
                                      </div>
                                      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono font-bold text-emerald-300">
                                        ${req.cost_usd} USD
                                      </div>
                                      <div className="text-zinc-400">
                                        Method: <strong className="text-zinc-200">{req.payment_method}</strong>
                                      </div>
                                    </div>

                                    <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                                      <span>Payment Slip Ref: <strong className="text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">{req.payment_ref}</strong></span>
                                      <span>• Submitted: {new Date(req.created_at).toLocaleString()}</span>
                                    </div>
                                  </div>

                                  {/* Admin Actions */}
                                  {isPending && (
                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        disabled={adjustingUserId === req.id}
                                        onClick={() => handleAdminApproveRequest(req.id)}
                                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                      >
                                        {adjustingUserId === req.id ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        )}
                                        <span>Approve & Add Credits</span>
                                      </button>

                                      <button
                                        type="button"
                                        disabled={adjustingUserId === req.id}
                                        onClick={() => handleAdminRejectRequest(req.id)}
                                        className="px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                          No top-up requests submitted yet.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 2: REGISTERED USERS & BALANCE ALLOCATION */}
                  {activeAdminSubTab === 'users' && (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={adminUserSearch}
                          onChange={e => setAdminUserSearch(e.target.value)}
                          placeholder="Search users by name or email address..."
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                        />
                      </div>

                      <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
                        {allUsers
                          .filter(u => {
                            if (!adminUserSearch.trim()) return true;
                            const q = adminUserSearch.toLowerCase();
                            return (
                              (u.name && u.name.toLowerCase().includes(q)) ||
                              (u.email && u.email.toLowerCase().includes(q))
                            );
                          })
                          .map(u => {
                            const customAmt = topupAmountMap[u.id] ?? 500;
                            return (
                              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-white">{u.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAdminToggleUserRole(u.id, u.role)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-all cursor-pointer ${
                                        u.role === 'admin'
                                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                                          : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                                      }`}
                                      title="Click to toggle role"
                                    >
                                      {u.role === 'admin' ? '👑 Admin' : 'Creator'}
                                    </button>
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                                      🪙 {(u.credits ?? 0).toLocaleString()} Credits
                                    </span>
                                  </div>
                                  <div className="text-xs text-zinc-500 font-mono mt-0.5">{u.email}</div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Quick Presets */}
                                  <div className="hidden lg:flex items-center gap-1">
                                    {[100, 500, 1000].map(preset => (
                                      <button
                                        key={preset}
                                        type="button"
                                        disabled={adjustingUserId === u.id}
                                        onClick={() => handleAdminCreditAdjust(u.id, preset)}
                                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-zinc-300 cursor-pointer"
                                      >
                                        +{preset}
                                      </button>
                                    ))}
                                  </div>

                                  <input
                                    type="number"
                                    value={customAmt}
                                    onChange={e => setTopupAmountMap(prev => ({ ...prev, [u.id]: Number(e.target.value) }))}
                                    className="w-20 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                                  />
                                  <input
                                    type="text"
                                    value={topupNoteMap[u.id] || ''}
                                    onChange={e => setTopupNoteMap(prev => ({ ...prev, [u.id]: e.target.value }))}
                                    placeholder="Reason / Note"
                                    className="w-32 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600"
                                  />
                                  <button
                                    type="button"
                                    disabled={adjustingUserId === u.id}
                                    onClick={() => handleAdminCreditAdjust(u.id, Math.abs(customAmt))}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer disabled:opacity-50"
                                  >
                                    + Add
                                  </button>
                                  <button
                                    type="button"
                                    disabled={adjustingUserId === u.id}
                                    onClick={() => handleAdminCreditAdjust(u.id, -Math.abs(customAmt))}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs cursor-pointer disabled:opacity-50"
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
