import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  COMMUNITY_CREATIONS, 
  CommunityCreation 
} from '../data/communityData';
import { 
  Sparkles, 
  Heart, 
  Copy, 
  Check, 
  Search, 
  ExternalLink, 
  Share2, 
  Filter, 
  Eye, 
  Plus, 
  Flame, 
  Layers, 
  Sliders, 
  ArrowLeft,
  X,
  Send,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Loader2,
  ImagePlus,
  Compass
} from 'lucide-react';
import { BeforeAfterSliderModal } from './BeforeAfterSliderModal';
import { SocialExportModal } from './SocialExportModal';
import { SupabaseService } from '../utils/supabaseClient';
import { Scenes550Explorer } from './scenes/Scenes550Explorer';
import { mapSceneToStudioContext } from '../utils/promptBuilder';
import { SceneItem } from '../data/scenes550Data';

interface CommunityShowcaseHubProps {
  onBackToPortal: () => void;
  onRemixToPhotoStudio: (
    prompt: string,
    ratio?: string,
    bgImage?: string,
    extraOptions?: {
      scene?: SceneItem;
      referencePhotos?: { url: string; name: string; id?: string; role: 'background' | 'character' | 'garment' | 'style' }[];
      chosenOptions?: { label: string; value: string; emoji?: string }[];
      location?: string;
      timeOfDay?: string;
      mood?: string;
    }
  ) => void;
  onRemixToMatrix: (prompt: string) => void;
  language?: any;
  initialTab?: 'scenes-550' | 'creations';
}

const CATEGORIES = [
  'All',
  'Royal Heritage',
  'Wedding Studio',
  'Hairstyle',
  'Modern Editorial',
  'Cinematic Studio'
] as const;

export const CommunityShowcaseHub: React.FC<CommunityShowcaseHubProps> = ({
  onBackToPortal,
  onRemixToPhotoStudio,
  onRemixToMatrix,
  language,
  initialTab = 'scenes-550'
}) => {
  const isMm = language === 'my';
  const [hubTab, setHubTab] = useState<'scenes-550' | 'creations'>(initialTab);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // User likes tracking in localStorage
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('show_ai_community_user_likes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Local user creations submitted to community
  const [creations, setCreations] = useState<CommunityCreation[]>(() => {
    try {
      const stored = localStorage.getItem('show_ai_user_shared_creations');
      const userList: CommunityCreation[] = stored ? JSON.parse(stored) : [];
      return [...userList, ...COMMUNITY_CREATIONS];
    } catch {
      return COMMUNITY_CREATIONS;
    }
  });

  // Interactive Modals State
  const [sliderModalData, setSliderModalData] = useState<{
    isOpen: boolean;
    beforeImage: string;
    afterImage: string;
    title: string;
  }>({
    isOpen: false,
    beforeImage: '',
    afterImage: '',
    title: ''
  });

  const [socialExportData, setSocialExportData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt: string;
  }>({
    isOpen: false,
    imageUrl: '',
    prompt: ''
  });

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPrompt, setNewPrompt] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [uploadSource, setUploadSource] = useState<'device' | 'url'>('device');
  const [isUploadingToCloud, setIsUploadingToCloud] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const shareFileInputRef = useRef<HTMLInputElement>(null);
  const [newCategory, setNewCategory] = useState<CommunityCreation['category']>('Royal Heritage');
  const [newTags, setNewTags] = useState<string>('#ShowAI, #PromptRemix');

  const handleSelectLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setNewImageUrl(dataUrl);

      if (SupabaseService.isConfigured()) {
        try {
          setIsUploadingToCloud(true);
          const uploadedUrl = await SupabaseService.uploadPhotoToBucket('user-generations', file, 'community');
          if (uploadedUrl) {
            setNewImageUrl(uploadedUrl);
          }
        } catch {
          // fallback to dataUrl
        } finally {
          setIsUploadingToCloud(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered List
  const filteredCreations = useMemo(() => {
    return creations.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.titleMm && item.titleMm.includes(q)) ||
        item.masterPrompt.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [creations, selectedCategory, searchQuery]);

  // Toggle Like
  const handleToggleLike = (id: string) => {
    const isLiked = !!userLikes[id];
    const newLikesState = { ...userLikes, [id]: !isLiked };
    setUserLikes(newLikesState);
    try {
      localStorage.setItem('show_ai_community_user_likes', JSON.stringify(newLikesState));
    } catch {}

    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            likesCount: isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1
          };
        }
        return c;
      })
    );
  };

  // Copy Prompt
  const handleCopyPrompt = (item: CommunityCreation) => {
    navigator.clipboard.writeText(item.masterPrompt);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Submit User Creation
  const handlePublishCreation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newImageUrl.trim()) {
      alert('Please provide prompt and image URL.');
      return;
    }

    const newCreation: CommunityCreation = {
      id: `user-comm-${Date.now()}`,
      title: newTitle.trim() || 'Community AI Creation',
      author: 'You (Creator)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      imageUrl: newImageUrl.trim(),
      masterPrompt: newPrompt.trim(),
      model: 'Nano Banana 2 (OpenRouter Pro)',
      aspectRatio: '4:5',
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      likesCount: 1,
      viewsCount: 1,
      createdAt: 'Just now',
      isVerifiedCreator: true
    };

    const updated = [newCreation, ...creations];
    setCreations(updated);

    try {
      const stored = localStorage.getItem('show_ai_user_shared_creations');
      const userList: CommunityCreation[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('show_ai_user_shared_creations', JSON.stringify([newCreation, ...userList]));
    } catch {}

    setIsShareModalOpen(false);
    setNewTitle('');
    setNewPrompt('');
    setNewImageUrl('');
    setImagePreview('');
  };

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortal}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Main Portal</span>
            </button>
            <div className="h-5 w-px bg-zinc-800 hidden sm:block" />
            
            {/* Dual Segment Switcher: 550+ Scenes vs Community Creations */}
            <div className="flex items-center p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setHubTab('scenes-550')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  hubTab === 'scenes-550'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>768+ Cinema Scenes</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    hubTab === 'scenes-550' ? 'bg-slate-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  768
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHubTab('creations')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  hubTab === 'creations'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Community</span>
                <span>Creations</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hubTab === 'creations' && (
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isMm ? 'Prompt မျှဝေမည်' : 'Share Creation'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Switch between 550+ Scenes & Community Creations */}
      {hubTab === 'scenes-550' ? (
        <div className="flex-1 w-full">
          <Scenes550Explorer
            language={language}
            onUseSceneAsBackground={(scene) => {
              const mapped = mapSceneToStudioContext(scene);
              onRemixToPhotoStudio(mapped.prompt, mapped.ratio, mapped.referencePhoto, {
                scene: mapped.scene,
                referencePhotos: mapped.referencePhotos,
                chosenOptions: mapped.chosenOptions,
                location: mapped.locationKey,
                timeOfDay: mapped.timeOfDay,
                mood: mapped.mood
              });
            }}
            onSendPromptToStudio={(prompt) => {
              onRemixToPhotoStudio(prompt, '16:9');
            }}
          />
        </div>
      ) : (
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Banner Section */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-teal-950/30 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>Trending Global AI Prompt Creations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isMm ? 'စိတ်ကူးစိတ်သန်းများကို ကလစ်တစ်ချက်ဖြင့် Remix ပြုလုပ်ပါ' : 'Remix Inspiring Master Prompts with 1-Click'}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isMm
                  ? 'ကမ္ဘာအရပ်ရပ်မှ ထိပ်တန်း Creator များ ဖန်တီးထားသော မြန်မာ့ရိုးရာ၊ မင်္ဂလာဆောင်၊ ဆံပင်ပုံစံနှင့် စတူဒီယို Master Prompt များကို ကြည့်ရှုပြီး "Remix" ခလုတ်ဖြင့် မိမိ၏ Studio ထဲသို့ တိုက်ရိုက် ထည့်သွင်း အသုံးပြုနိုင်ပါသည်။'
                  : 'Browse award-winning cultural, wedding, and hairstyle prompts. Hit "Remix Prompt" to instantly load the full prompt and settings into your Studio.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center min-w-[100px]">
                <div className="text-2xl font-extrabold text-emerald-400">{filteredCreations.length}</div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Creations</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-emerald-500/40 text-center min-w-[100px] bg-emerald-950/20">
                <div className="text-2xl font-extrabold text-teal-300">1-Click</div>
                <div className="text-[10px] font-mono text-emerald-300 uppercase">Remix Hub</div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = cat === 'All' 
                  ? creations.length 
                  : creations.filter((c) => c.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={isMm ? 'Prompt သို့မဟုတ် Tag ရှာပါ...' : 'Search prompts, tags, or styles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((item) => {
            const isLiked = !!userLikes[item.id];
            const isCopied = copiedId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="group rounded-3xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20"
              >
                {/* Image Banner */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/80 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
                      {item.aspectRatio}
                    </span>
                  </div>

                  {/* Like Button on Image */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500/90 text-white border-rose-400 shadow-md shadow-rose-500/30'
                          : 'bg-black/60 text-zinc-300 border-white/20 hover:text-white hover:bg-black/80'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : 'text-rose-400'}`} />
                      <span>{item.likesCount}</span>
                    </button>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 inset-x-4">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    {item.titleMm && (
                      <p className="text-xs text-emerald-400 font-medium mt-0.5 line-clamp-1">
                        {item.titleMm}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Author Header */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.authorAvatar}
                        alt={item.author}
                        className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                      />
                      <span className="font-semibold text-zinc-300">{item.author}</span>
                      {item.isVerifiedCreator && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{item.createdAt}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Prompt Preview Snippet */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        {isExpanded ? 'Hide Prompt' : 'Inspect Master Prompt'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item)}
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 leading-relaxed break-words space-y-2">
                        <p>{item.masterPrompt}</p>
                        {item.negativePrompt && (
                          <p className="text-zinc-500 text-[10px]">
                            <strong className="text-zinc-400">Negative:</strong> {item.negativePrompt}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: REMIX PROMPT (Main Action) & Tools */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => onRemixToPhotoStudio(item.masterPrompt, item.aspectRatio)}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>{isMm ? 'ဤ Prompt ဖြင့် Remix ထုတ်မည်' : 'Remix Prompt in Photo Studio'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSocialExportData({
                          isOpen: true,
                          imageUrl: item.imageUrl,
                          prompt: item.masterPrompt
                        })}
                        className="py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/60"
                        title="Export for Story, Reels & Feed"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Social Export</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemixToMatrix(item.masterPrompt)}
                        className="py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700/60"
                        title="Load into Burmese Prompt Matrix"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>To Matrix</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      )}

      {/* Social Media 1-Click Multi-Ratio Export Modal */}
      <SocialExportModal
        isOpen={socialExportData.isOpen}
        onClose={() => setSocialExportData({ isOpen: false, imageUrl: '', prompt: '' })}
        imageUrl={socialExportData.imageUrl}
        prompt={socialExportData.prompt}
      />

      {/* Share Creation Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase">
                <Send className="w-3 h-3" />
                <span>Publish to Global Community</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {isMm ? 'သင့် Master Creation ကို ကွန်မြူနတီသို့ မျှဝေမည်' : 'Share Your Master Creation'}
              </h3>
              <p className="text-xs text-zinc-400">
                Allow worldwide creators to discover and remix your prompt.
              </p>
            </div>

            <form onSubmit={handlePublishCreation} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Creation Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bagan Sunset Lady"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Creation Image / ဓာတ်ပုံ:</label>
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadSource('device')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        uploadSource === 'device'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Device Storage (ဖုန်း/PC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadSource('url')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                        uploadSource === 'url'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Image URL (Link)
                    </button>
                  </div>
                </div>

                {uploadSource === 'device' ? (
                  <div>
                    <input
                      ref={shareFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelectLocalFile}
                    />

                    {imagePreview || newImageUrl ? (
                      <div className="relative rounded-2xl border border-emerald-500/30 bg-zinc-950 p-2.5 flex items-center gap-3">
                        <img
                          src={imagePreview || newImageUrl}
                          alt="Upload preview"
                          className="w-16 h-16 rounded-xl object-cover bg-black border border-zinc-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Photo Selected from Device</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                            {isUploadingToCloud ? 'Uploading to Supabase Cloud Storage...' : 'Ready to share with community'}
                          </p>
                          {isUploadingToCloud && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving to Cloud Bucket...</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setNewImageUrl('');
                            shareFileInputRef.current?.click();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => shareFileInputRef.current?.click()}
                        className="rounded-2xl border-2 border-dashed border-zinc-750 hover:border-emerald-500/60 bg-zinc-950/60 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-zinc-200">
                            မိမိဖုန်း (သို့) ကွန်ပျူတာ Storage ထဲမှ ပုံရွေးချယ်ပါ
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            Tap or click to browse JPG, PNG, WEBP from your device
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      required={uploadSource === 'url'}
                      placeholder="https://images.unsplash.com/... or public image URL"
                      value={newImageUrl}
                      onChange={(e) => {
                        setNewImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Royal Heritage">Royal Heritage</option>
                  <option value="Wedding Studio">Wedding Studio</option>
                  <option value="Hairstyle">Hairstyle</option>
                  <option value="Modern Editorial">Modern Editorial</option>
                  <option value="Cinematic Studio">Cinematic Studio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Master Prompt:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste the full synthesized prompt here..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Tags (Comma-separated):</label>
                <input
                  type="text"
                  placeholder="#Bagan, #Acheik, #FaceLock"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Publish Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
