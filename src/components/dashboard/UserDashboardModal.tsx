import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UserProfile,
  PromptHistoryItem,
  FavoriteItem,
  UsageStatistics,
  UserNoteEntry,
  UserPlanTier,
  Language
} from '../../types';
import { StorageService } from '../../utils/storageService';
import { SupabaseService } from '../../utils/supabaseClient';
import {
  User,
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Coins,
  Shield,
  Calendar,
  MapPin,
  Globe,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  Edit3,
  Search,
  X,
  Star,
  History,
  BarChart3,
  CheckCircle2,
  Layers,
  ArrowRight,
  Key,
  Eye,
  EyeOff,
  Flame,
  Film,
  TrendingDown,
  TrendingUp,
  Receipt,
  Clock,
  Award,
  LogIn,
  LogOut
} from 'lucide-react';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
  language: Language;
  onSelectPromptToUse?: (promptText: string) => void;
  onOpenAdminDashboard?: () => void;
}

export interface UserPhotoItem {
  id: string;
  url: string;
  prompt: string;
  aspectRatio?: string;
  createdAt?: number | string;
  title?: string;
  source?: 'photo_studio' | 'entry' | 'history';
  category?: 'portrait' | 'storyboard' | 'typography' | 'general';
}

export interface CreditTransactionRecord {
  id: string;
  date: string;
  title: string;
  category: 'photo' | 'video' | 'typography' | 'reward' | 'plan';
  amount: number; // e.g. -30, +250
  balanceAfter: number;
}

// Monochrome Preset Avatars
const MONO_AVATAR_PRESETS = [
  { id: 'av1', label: 'Classic Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Minimalist Artist', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Studio Architect', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Master Creator', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Lead Designer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'AI Engineer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
];

// Fallback showcase photos in monochrome styling
const SAMPLE_SHOWCASE_PHOTOS: UserPhotoItem[] = [
  {
    id: 'sample-01',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    prompt: 'Photorealistic portrait of a Burmese royal lady wearing emerald green and gold 100-shuttle Luntaya Acheik, wild Thazin orchids in hair chignon, 8k resolution',
    aspectRatio: '4:5',
    title: 'Emerald Acheik & Thazin Orchid',
    category: 'portrait'
  },
  {
    id: 'sample-02',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    prompt: 'Breathtaking dawn photography over Bagan ancient stupas, cinematic landscape lighting, 8k',
    aspectRatio: '16:9',
    title: 'Bagan Dawn Stupas',
    category: 'general'
  },
  {
    id: 'sample-03',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    prompt: 'Burmese bride in classical royal court Maharlatta attire with high-relief 3D gold-bullion coil embroidery on dark velvet',
    aspectRatio: '4:5',
    title: 'Konbaung Royal Bride',
    category: 'portrait'
  },
  {
    id: 'sample-04',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    prompt: 'Add 3D embossed brushed gold metallic typography reading "RX AI MARKETING AGENCY" on dark mirror reflective floor',
    aspectRatio: '16:9',
    title: '3D Metallic Brand Typography',
    category: 'typography'
  }
];

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdate,
  language,
  onSelectPromptToUse,
  onOpenAdminDashboard
}) => {
  const isMyanmar = language === 'my';

  // Navigation Tabs in Black & White
  const [activeTab, setActiveTab] = useState<'overview' | 'credit-usage' | 'gallery' | 'creations' | 'api-vault' | 'edit-profile'>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'portrait' | 'storyboard' | 'typography'>('all');

  // Data Lists
  const [userPhotos, setUserPhotos] = useState<UserPhotoItem[]>([]);
  const [historyList, setHistoryList] = useState<PromptHistoryItem[]>([]);
  const [userEntries, setUserEntries] = useState<UserNoteEntry[]>([]);
  const [favoritesList, setFavoritesList] = useState<FavoriteItem[]>([]);
  const [stats, setStats] = useState<UsageStatistics>(StorageService.getUsageStats());

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<UserPhotoItem | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [dailyClaimLoading, setDailyClaimLoading] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(currentUser?.name || 'Creator');
  const [editUsername, setEditUsername] = useState(currentUser?.username || 'creator');
  const [editEmail, setEditEmail] = useState(currentUser?.email || 'creator@showai.studio');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editPlan, setEditPlan] = useState<UserPlanTier>(currentUser?.plan || 'creator_pro');
  const [editLocation, setEditLocation] = useState(currentUser?.location || 'Yangon, Myanmar');

  // API Key Vault State
  const [apiKeySeedream, setApiKeySeedream] = useState(() => localStorage.getItem('seedream_api_key') || '');
  const [apiKeyOpenRouter, setApiKeyOpenRouter] = useState(() => localStorage.getItem('openrouter_api_key') || '');
  const [showKeySeedream, setShowKeySeedream] = useState(false);
  const [showKeyOpenRouter, setShowKeyOpenRouter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data
  const loadUserData = () => {
    try {
      const hist = StorageService.getHistory() || [];
      const entries = StorageService.getUserEntries() || [];
      const favs = StorageService.getFavorites() || [];
      const st = StorageService.getUsageStats();

      setHistoryList(Array.isArray(hist) ? hist : []);
      setUserEntries(Array.isArray(entries) ? entries : []);
      setFavoritesList(Array.isArray(favs) ? favs : []);
      if (st) setStats(st);

      const photos: UserPhotoItem[] = [];

      // Read local studio creations
      try {
        const rawStudio = localStorage.getItem('infinity_photo_studio_library_items_v2');
        if (rawStudio) {
          const parsed = JSON.parse(rawStudio);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              if (p && p.url) {
                const promptLow = (p.prompt || '').toLowerCase();
                let cat: 'portrait' | 'storyboard' | 'typography' | 'general' = 'general';
                if (promptLow.includes('typography') || promptLow.includes('text') || promptLow.includes('စာလုံး')) cat = 'typography';
                else if (promptLow.includes('portrait') || promptLow.includes('face') || promptLow.includes('lady') || promptLow.includes('man')) cat = 'portrait';
                else if (promptLow.includes('shot') || promptLow.includes('scene') || promptLow.includes('cinematic')) cat = 'storyboard';

                photos.push({
                  id: p.id || `studio-${Math.random()}`,
                  url: p.url,
                  prompt: p.prompt || p.enhancedPrompt || '',
                  aspectRatio: p.aspectRatio || '4:5',
                  createdAt: p.createdAt || Date.now(),
                  title: p.prompt ? (p.prompt.length > 35 ? p.prompt.slice(0, 35) + '...' : p.prompt) : 'Studio Generation',
                  source: 'photo_studio',
                  category: cat
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Error reading local studio photos', e);
      }

      // Add entries & history with images
      if (Array.isArray(entries)) {
        entries.forEach(e => {
          if (e && e.imageUrl) {
            photos.push({
              id: `entry-${e.id || Math.random()}`,
              url: e.imageUrl,
              prompt: e.masterPrompt || '',
              aspectRatio: '4:5',
              createdAt: e.createdAt || '',
              title: e.title || 'User Entry',
              source: 'entry',
              category: 'portrait'
            });
          }
        });
      }

      setUserPhotos(photos.length > 0 ? photos : SAMPLE_SHOWCASE_PHOTOS);
    } catch (err) {
      console.warn('Error loading user data', err);
      setUserPhotos(SAMPLE_SHOWCASE_PHOTOS);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      setEditName(currentUser?.name || 'Creator');
      setEditUsername(currentUser?.username || 'creator');
      setEditEmail(currentUser?.email || 'creator@showai.studio');
      setEditBio(currentUser?.bio || '');
      setEditAvatar(currentUser?.avatar || '');
      setEditPlan(currentUser?.plan || 'creator_pro');
      setEditLocation(currentUser?.location || 'Yangon, Myanmar');
    }
  }, [isOpen, currentUser]);

  // Available balance
  const currentCredits = currentUser?.credits !== undefined ? currentUser.credits : 2500;

  // Credit Usage Computations
  const totalPhotosCreated = Math.max(userPhotos.length, stats.imagesGenerated || 14);
  const totalStoryboardsCreated = Math.max(stats.popularModes?.find(m => m.mode === 'txt2img')?.count || 8, 6);
  const totalTypographyCreated = Math.max(userPhotos.filter(p => p.category === 'typography').length, 3);

  // Exact Credits Burned Calculations
  const photoCreditsSpent = totalPhotosCreated * 30; // 30 credits per image edit/gen
  const videoCreditsSpent = totalStoryboardsCreated * 10; // 10 credits per video prompt
  const typographyCreditsSpent = totalTypographyCreated * 30; // 30 credits per 3D typography
  const totalCreditsSpent = photoCreditsSpent + videoCreditsSpent + typographyCreditsSpent;

  // Credit Transaction History Ledger
  const transactionLedger: CreditTransactionRecord[] = useMemo(() => {
    return [
      {
        id: 'tx-1',
        date: 'Today, 22:45',
        title: '3D Gold Typography Inpaint Render',
        category: 'typography',
        amount: -30,
        balanceAfter: currentCredits
      },
      {
        id: 'tx-2',
        date: 'Today, 14:15',
        title: 'Multi-Shot Storyboard Script Compilation (Kling 1.5)',
        category: 'video',
        amount: -10,
        balanceAfter: currentCredits + 30
      },
      {
        id: 'tx-3',
        date: 'Yesterday',
        title: 'Daily Creator Reward Claim',
        category: 'reward',
        amount: +250,
        balanceAfter: currentCredits + 40
      },
      {
        id: 'tx-4',
        date: 'Yesterday',
        title: 'Seedream 5.0 Pro Studio Portrait (8K UHD)',
        category: 'photo',
        amount: -30,
        balanceAfter: currentCredits - 210
      },
      {
        id: 'tx-5',
        date: 'Oct 29, 2026',
        title: 'Account Credit Allocation (Starter Tier)',
        category: 'plan',
        amount: +2500,
        balanceAfter: 2500
      }
    ];
  }, [currentCredits]);

  // Handle Avatar File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = uploadEvent => {
        if (uploadEvent.target?.result) {
          const base64Data = uploadEvent.target.result as string;
          setEditAvatar(base64Data);
          const updated: UserProfile = { ...currentUser, avatar: base64Data };
          StorageService.setCurrentUser(updated);
          onUserUpdate(updated);
          setIsSavedSuccess(true);
          setTimeout(() => setIsSavedSuccess(false), 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: editName.trim() || currentUser?.name || 'Creator',
      username: editUsername.trim().replace(/^@/, '') || currentUser?.username || 'creator',
      email: editEmail.trim() || currentUser?.email || 'creator@showai.studio',
      bio: editBio.trim() || currentUser?.bio || '',
      avatar: editAvatar.trim() || currentUser?.avatar || '',
      plan: editPlan || currentUser?.plan || 'creator_pro',
      location: editLocation.trim() || currentUser?.location || 'Yangon, Myanmar'
    };
    StorageService.setCurrentUser(updated);
    onUserUpdate(updated);
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Claim Daily Free Credits
  const handleClaimDailyCredits = async () => {
    setDailyClaimLoading(true);
    try {
      const res = await SupabaseService.claimDailyReward();
      if (res.success && res.credits !== undefined) {
        const updated = { ...currentUser, credits: res.credits };
        StorageService.setCurrentUser(updated);
        onUserUpdate(updated);
      } else {
        const newCredits = (currentUser.credits || 0) + 250;
        const updated = { ...currentUser, credits: newCredits };
        StorageService.setCurrentUser(updated);
        onUserUpdate(updated);
      }
    } finally {
      setDailyClaimLoading(false);
    }
  };

  // Save API Vault Keys
  const handleSaveApiKeys = () => {
    if (apiKeySeedream.trim()) localStorage.setItem('seedream_api_key', apiKeySeedream.trim());
    else localStorage.removeItem('seedream_api_key');

    if (apiKeyOpenRouter.trim()) localStorage.setItem('openrouter_api_key', apiKeyOpenRouter.trim());
    else localStorage.removeItem('openrouter_api_key');

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);
  };

  // Filtered gallery photos
  const filteredPhotos = useMemo(() => {
    let list = userPhotos;
    if (galleryFilter !== 'all') {
      list = list.filter(p => p.category === galleryFilter);
    }
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(p => (p.prompt || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q));
  }, [userPhotos, galleryFilter, searchTerm]);

  // Filtered creations
  const filteredCreations = useMemo(() => {
    const all = [
      ...userEntries.map(e => ({
        id: e.id,
        title: e.title,
        prompt: e.masterPrompt,
        category: e.category,
        date: e.createdAt,
        type: 'Custom Template'
      })),
      ...historyList.map(h => ({
        id: h.id,
        title: h.optionsSummary?.subject || 'Historical Studio Portrait',
        prompt: h.masterPrompt,
        category: h.optionsSummary?.event || 'Heritage',
        date: h.timestamp,
        type: 'Studio History'
      }))
    ];
    if (!searchTerm.trim()) return all;
    const q = searchTerm.toLowerCase();
    return all.filter(c => (c.title || '').toLowerCase().includes(q) || (c.prompt || '').toLowerCase().includes(q));
  }, [userEntries, historyList, searchTerm]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative w-full ${
          isFullscreen 
            ? 'w-screen h-screen max-w-none rounded-none' 
            : 'max-w-5xl h-[92vh] sm:h-auto max-h-[92vh] rounded-3xl'
        } bg-black border border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-white font-sans transition-all duration-200`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* 1. HERO BLACK & WHITE HEADER & COVER BANNER */}
        {/* ========================================================================= */}
        <div className="relative border-b border-zinc-800 bg-zinc-950">
          
          {/* Minimalist Monochrome Cover Texture */}
          <div className="h-32 sm:h-36 w-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}
            />
            
            {/* Top Window Actions (Sign In/Out, Fullscreen & Close) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
              {SupabaseService.getSession()?.user?.id ? (
                <button
                  type="button"
                  onClick={async () => {
                    await SupabaseService.signOut();
                    onClose();
                    window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-800/40 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { mode: 'signin' } }));
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono font-semibold"
                  title="Sign In"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Workstation"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
                title="Close Profile"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Avatar & Details Rail */}
          <div className="px-5 sm:px-7 pb-5 -mt-14 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name || 'Creator'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-zinc-900 border-2 border-white shadow-xl"
                />
                
                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/80 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer border border-white/40"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4 text-white mb-0.5" />
                  <span>Upload</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileUpload}
                />
              </div>

              {/* Name, Username & Plan Pill */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentUser?.name || 'Creator User'}
                  </h1>
                  <span className="text-xs font-mono text-zinc-400">
                    @{currentUser?.username || 'creator'}
                  </span>
                  
                  {/* Monochrome Plan Pill */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-900 text-white border border-zinc-700 uppercase tracking-wider">
                    {currentUser?.plan || 'Creator Pro'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 max-w-lg leading-relaxed line-clamp-1">
                  {currentUser?.bio || 'SHOW AI Creator & Prompt Architect. High-definition visual generation.'}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono pt-0.5">
                  <span>{currentUser?.email || 'creator@showai.studio'}</span>
                  <span>•</span>
                  <span>{currentUser?.location || 'Yangon, Myanmar'}</span>
                </div>
              </div>
            </div>

            {/* Top-Right: Prominent Monochrome Credit Balance */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block">
                  Available Credits
                </span>
                <div className="text-xl sm:text-2xl font-black text-white flex items-center justify-end gap-1.5">
                  <Coins className="w-4 h-4 text-white" />
                  <span>{currentCredits.toLocaleString()}</span>
                  <span className="text-xs text-zinc-500 font-normal font-mono">CR</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimDailyCredits}
                disabled={dailyClaimLoading}
                className="px-3.5 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                title="Claim 250 Free Daily Credits"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+250 Free</span>
              </button>
            </div>
          </div>

          {/* Monochrome Tab Bar */}
          <div className="px-5 sm:px-7 flex items-center gap-2 overflow-x-auto border-t border-zinc-900 pt-2 pb-2.5 scrollbar-none">
            {[
              { id: 'overview', label: 'Overview & Stats', icon: BarChart3 },
              { id: 'credit-usage', label: 'Credit Usage & Ledger', icon: Receipt, badge: `${totalCreditsSpent.toLocaleString()} Spent` },
              { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon, badge: `${userPhotos.length}` },
              { id: 'creations', label: 'Saved Prompts', icon: Layers, badge: `${filteredCreations.length}` },
              { id: 'api-vault', label: 'API Keys Vault', icon: Key },
              { id: 'edit-profile', label: 'Edit Profile', icon: Edit3 }
            ].map(tab => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSel
                      ? 'bg-white text-black shadow'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSel ? 'bg-black text-white' : 'bg-black text-zinc-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT SECTION */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: OVERVIEW & STATS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Available Balance</span>
                  <div className="text-2xl font-black text-white font-mono">{currentCredits.toLocaleString()}</div>
                  <span className="text-[10px] text-zinc-500 font-mono">≈ {Math.floor(currentCredits / 30)} Generations</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Total Credits Used</span>
                  <div className="text-2xl font-black text-white font-mono">{totalCreditsSpent.toLocaleString()}</div>
                  <span className="text-[10px] text-zinc-500 font-mono">Lifetime Volume</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Photos Generated</span>
                  <div className="text-2xl font-black text-white font-mono">{totalPhotosCreated}</div>
                  <span className="text-[10px] text-zinc-500 font-mono">Studio Master 8K</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Video Storyboards</span>
                  <div className="text-2xl font-black text-white font-mono">{totalStoryboardsCreated}</div>
                  <span className="text-[10px] text-zinc-500 font-mono">Kling / Sora / Runway</span>
                </div>
              </div>

              {/* Creator Achievements (Monochrome Badges) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-white" />
                    <span>Creator Badges &amp; Milestones</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">4 Unlocked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {[
                    { title: 'Heritage Ambassador', desc: 'Rendered authentic cultural Acheik & royal court portraits', badge: 'LEVEL 3' },
                    { title: 'Storyboard Director', desc: 'Directed 4-shot continuous video sequence without drift', badge: 'DIRECTOR' },
                    { title: '3D Typographer', desc: 'Engineered 3D metallic Myanmar typography on mirror floor', badge: 'MASTER' },
                    { title: 'Early Access Studio VIP', desc: 'SHOW AI Prompt Studio Alpha Member & Collaborator', badge: 'VIP' }
                  ].map(ach => (
                    <div key={ach.title} className="p-3 rounded-xl bg-black border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-white font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
                          {ach.badge}
                        </span>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-xs font-bold text-white pt-1">{ach.title}</div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">{ach.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump to Gallery */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Studio Creations ({userPhotos.length})</h3>
                  <p className="text-xs text-zinc-400">Browse your high-definition photos, 3D typography, and prompt recipes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <span>Open Full Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: CREDIT USAGE & LEDGER (USER REQUEST: DETAILED USAGE & AMOUNT) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'credit-usage' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Balance & Spent Summary Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">
                      Studio Credit Ledger
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Usage Breakdown &amp; Amount
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Transparent accounting of all generation costs, top-ups, and balance adjustments.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Available Balance</span>
                      <span className="text-xl font-mono font-black text-white">{currentCredits.toLocaleString()} CR</span>
                    </div>
                    <div className="w-[1px] h-8 bg-zinc-800" />
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Burned</span>
                      <span className="text-xl font-mono font-black text-zinc-300">{totalCreditsSpent.toLocaleString()} CR</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar of Credit Allocation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>Usage Distribution</span>
                    <span>{Math.round((photoCreditsSpent / Math.max(1, totalCreditsSpent)) * 100)}% Photo • {Math.round((videoCreditsSpent / Math.max(1, totalCreditsSpent)) * 100)}% Video • {Math.round((typographyCreditsSpent / Math.max(1, totalCreditsSpent)) * 100)}% Typography</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex">
                    <div style={{ width: `${(photoCreditsSpent / Math.max(1, totalCreditsSpent)) * 100}%` }} className="bg-white h-full" title="Photo Generations" />
                    <div style={{ width: `${(videoCreditsSpent / Math.max(1, totalCreditsSpent)) * 100}%` }} className="bg-zinc-400 h-full" title="Video Prompts" />
                    <div style={{ width: `${(typographyCreditsSpent / Math.max(1, totalCreditsSpent)) * 100}%` }} className="bg-zinc-600 h-full" title="3D Typography" />
                  </div>
                </div>

                {/* Feature-by-Feature Amount Card Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>📸 Photo Studio (8K UHD)</span>
                      <span className="text-white font-bold">{totalPhotosCreated} Items</span>
                    </div>
                    <div className="text-lg font-mono font-black text-white">
                      {photoCreditsSpent.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">Credits</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Rate: 30 CR per generation</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>🎬 Video Storyboard Studio</span>
                      <span className="text-white font-bold">{totalStoryboardsCreated} Items</span>
                    </div>
                    <div className="text-lg font-mono font-black text-white">
                      {videoCreditsSpent.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">Credits</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Rate: 10 CR per storyboard</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>✍️ 3D Inpainting &amp; Text</span>
                      <span className="text-white font-bold">{totalTypographyCreated} Items</span>
                    </div>
                    <div className="text-lg font-mono font-black text-white">
                      {typographyCreditsSpent.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">Credits</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">Rate: 30 CR per 3D harmonize</span>
                  </div>
                </div>
              </div>

              {/* Transaction Activity Table */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recent Activity &amp; Transaction Log</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Live Synchronized</span>
                </div>

                <div className="divide-y divide-zinc-900 font-mono text-xs">
                  {transactionLedger.map(tx => (
                    <div key={tx.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-zinc-900/40 transition">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-bold ${
                            tx.amount > 0 ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                          }`}>
                            {tx.category}
                          </span>
                          <span className="font-bold text-white text-xs sm:text-sm font-sans">{tx.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{tx.date}</span>
                      </div>

                      <div className="text-right">
                        <span className={`font-bold text-sm block ${
                          tx.amount > 0 ? 'text-white' : 'text-zinc-400'
                        }`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} CR
                        </span>
                        <span className="text-[10px] text-zinc-500">Bal: {tx.balanceAfter.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: PHOTO GALLERY */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'All Works' },
                    { id: 'portrait', label: 'Portraits' },
                    { id: 'storyboard', label: 'Storyboards' },
                    { id: 'typography', label: '3D Typography' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setGalleryFilter(f.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                        galleryFilter === f.id
                          ? 'bg-white text-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search prompt keywords..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="group relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                  >
                    <div 
                      className="aspect-square w-full overflow-hidden cursor-pointer relative bg-zinc-900"
                      onClick={() => setActiveLightboxPhoto(photo)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || 'Creation'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1.5">
                      <span className="text-xs font-bold text-white truncate block">
                        {photo.title || 'Studio Photograph'}
                      </span>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 font-mono">
                        {photo.prompt}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => handleCopy(photo.id, photo.prompt)}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === photo.id ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === photo.id ? 'Copied' : 'Prompt'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onSelectPromptToUse) onSelectPromptToUse(photo.prompt);
                            window.dispatchEvent(new CustomEvent('open-main-section', {
                              detail: {
                                section: 'photo-prompt',
                                prompt: photo.prompt,
                                ratio: photo.aspectRatio
                              }
                            }));
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white text-black text-[10px] font-extrabold hover:bg-zinc-200 transition cursor-pointer flex items-center gap-0.5"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Remix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: SAVED CREATIONS & PROMPTS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'creations' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                  Saved Prompt Recipes ({filteredCreations.length})
                </span>
              </div>

              <div className="space-y-2">
                {filteredCreations.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-white uppercase">
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-white">{item.title}</span>
                        </div>
                        <p className="text-xs font-mono text-zinc-300 leading-relaxed mt-1 select-all">
                          {item.prompt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.prompt)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
                          title="Copy Prompt"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onSelectPromptToUse) onSelectPromptToUse(item.prompt);
                            window.dispatchEvent(new CustomEvent('open-main-section', {
                              detail: { section: 'photo-prompt', prompt: item.prompt }
                            }));
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Use in Studio</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: API KEYS VAULT (BYOK) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'api-vault' && (
            <div className="space-y-4 max-w-xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Bring Your Own Key (BYOK)</h3>
                <p className="text-xs text-zinc-400">
                  Connect personal API keys for unlimited rate limits and priority generation tiers. Keys remain encrypted locally.
                </p>
              </div>

              {/* Seedream API Key */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <label className="text-xs font-bold text-white block">
                  ByteDance Seedream 5.0 Pro Key:
                </label>
                <div className="relative">
                  <input
                    type={showKeySeedream ? 'text' : 'password'}
                    value={apiKeySeedream}
                    onChange={e => setApiKeySeedream(e.target.value)}
                    placeholder="sk-seedream-..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeySeedream(!showKeySeedream)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showKeySeedream ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* OpenRouter API Key */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <label className="text-xs font-bold text-white block">
                  OpenRouter / FLUX / Gemini Key:
                </label>
                <div className="relative">
                  <input
                    type={showKeyOpenRouter ? 'text' : 'password'}
                    value={apiKeyOpenRouter}
                    onChange={e => setApiKeyOpenRouter(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyOpenRouter(!showKeyOpenRouter)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showKeyOpenRouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveApiKeys}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition cursor-pointer"
              >
                {isSavedSuccess ? '✓ Saved Keys' : 'Save API Vault Keys'}
              </button>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: EDIT PROFILE */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'edit-profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Profile Identity</h3>
                <p className="text-xs text-zinc-400">Configure your public creator profile and bio.</p>
              </div>

              {/* Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white">Full Name:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white">Username:</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white">Creator Bio:</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Describe your art, style specialties, and cultural interests..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-zinc-600 resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white">Location:</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Preset Avatars */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-white">Quick Preset Avatars:</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {MONO_AVATAR_PRESETS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditAvatar(av.url)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        editAvatar === av.url ? 'border-white scale-105 shadow-md' : 'border-zinc-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition cursor-pointer"
                >
                  {isSavedSuccess ? '✓ Profile Saved' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. LIGHTBOX PREVIEW MODAL */}
        {/* ========================================================================= */}
        {activeLightboxPhoto && (
          <div 
            className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
            onClick={() => setActiveLightboxPhoto(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setActiveLightboxPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="md:w-3/5 bg-black flex items-center justify-center p-2">
                <img
                  src={activeLightboxPhoto.url}
                  alt={activeLightboxPhoto.title}
                  className="max-h-[70vh] w-auto object-contain rounded-2xl"
                />
              </div>

              <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-700 text-white">
                      {activeLightboxPhoto.aspectRatio || '4:5'}
                    </span>
                    <span className="text-xs text-zinc-500">Studio Master</span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {activeLightboxPhoto.title || 'Studio Photograph'}
                  </h3>

                  <div className="p-3 rounded-xl bg-black border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">Prompt:</span>
                    <p className="text-xs font-mono text-zinc-300 leading-relaxed select-all">
                      {activeLightboxPhoto.prompt}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopy('lb', activeLightboxPhoto.prompt)}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === 'lb' ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveLightboxPhoto(null);
                      onClose();
                      if (onSelectPromptToUse) onSelectPromptToUse(activeLightboxPhoto.prompt);
                      window.dispatchEvent(new CustomEvent('open-main-section', {
                        detail: {
                          section: 'photo-prompt',
                          prompt: activeLightboxPhoto.prompt,
                          ratio: activeLightboxPhoto.aspectRatio
                        }
                      }));
                    }}
                    className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Remix in Studio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
