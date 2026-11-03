import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Share2,
  Wand2,
  Check,
  ShieldCheck,
  Tag,
  Coins,
  Send,
  Lock,
  Globe
} from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { CommunityCreation } from '../../data/communityData';
import { StorageService } from '../../utils/storageService';

interface ShareToCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  defaultPrompt?: string;
  defaultTitle?: string;
  currentUser?: UserProfile;
  language?: Language;
  onPublished?: (creation: CommunityCreation) => void;
}

const CATEGORIES: CommunityCreation['category'][] = [
  'Royal Heritage',
  'Wedding Studio',
  'Hairstyle',
  'Modern Editorial',
  'Cinematic Studio',
  'General'
];

export const ShareToCommunityModal: React.FC<ShareToCommunityModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  defaultPrompt = '',
  defaultTitle = '',
  currentUser,
  language = 'en',
  onPublished
}) => {
  const isMm = language === 'my';
  const [title, setTitle] = useState(defaultTitle || 'Burmese AI Masterpiece');
  const [titleMm, setTitleMm] = useState('');
  const [category, setCategory] = useState<CommunityCreation['category']>('Royal Heritage');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [allowRemix, setAllowRemix] = useState(true);
  const [tags, setTags] = useState('#ShowAI, #BurmeseHeritage, #AIStudio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    setIsSubmitting(true);
    try {
      const authorName = currentUser?.name || 'Creator';
      const authorHandle = currentUser?.username ? `@${currentUser.username.replace('@', '')}` : '@creator';
      const authorAvatar = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => (t.startsWith('#') ? t : `#${t}`));

      const newCreation: CommunityCreation = {
        id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: title.trim(),
        titleMm: titleMm.trim() || undefined,
        author: authorName,
        authorHandle,
        authorAvatar,
        imageUrl,
        masterPrompt: allowRemix ? prompt.trim() : 'Prompt hidden by creator',
        model: 'Nano Banana 2 (OpenRouter Pro)',
        aspectRatio: '4:5',
        category,
        tags: tagArray.length > 0 ? tagArray : ['#ShowAI', '#Art'],
        likesCount: 1,
        viewsCount: 1,
        remixesCount: 0,
        createdAt: 'Just now',
        isVerifiedCreator: true,
        allowRemix
      };

      // 1. Save to local Community Creations cache
      try {
        const raw = localStorage.getItem('show_ai_community_creations_v1') || '[]';
        const list: CommunityCreation[] = JSON.parse(raw);
        list.unshift(newCreation);
        localStorage.setItem('show_ai_community_creations_v1', JSON.stringify(list));
      } catch {}

      // 2. Award +25 Bonus Credits for sharing!
      try {
        const user = StorageService.getCurrentUser();
        if (user) {
          user.credits = (user.credits || 0) + 25;
          user.totalCreationsCount = (user.totalCreationsCount || 0) + 1;
          StorageService.setCurrentUser(user);
          window.dispatchEvent(new CustomEvent('showai-credits-updated', { detail: { credits: user.credits } }));
          window.dispatchEvent(new CustomEvent('user-profile-updated'));
        }
      } catch {}

      setIsSuccess(true);
      if (onPublished) {
        onPublished(newCreation);
      }

      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#0e121a] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>{isMm ? 'Community ပေါ်သို့ မျှဝေမည်' : 'Share to Community Feed'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/30">
                  <Coins className="w-3 h-3" />
                  +25 Credits
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {isMm ? 'သင့်လက်ရာကို အခြားဖန်တီးသူများ မြင်တွေ့ Remix ပြုလုပ်နိုင်ပါသည်' : 'Inspire fellow creators and earn bonus credits'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Image Thumbnail Preview Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-950/60 border border-white/5">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10">
              <img src={imageUrl} alt="Creation Preview" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 tracking-wider font-bold">Preview Asset</span>
              <p className="text-xs font-semibold text-white truncate">{title || 'Untitled Creation'}</p>
              <p className="text-[11px] text-zinc-400 line-clamp-2 font-mono">
                {allowRemix ? (prompt ? prompt.slice(0, 100) + '...' : 'Prompt included') : 'Prompt will be hidden (Art only)'}
              </p>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {isMm ? 'ခေါင်းစဉ် (အင်္ဂလိပ် / မြန်မာ)' : 'Artwork Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Bagan Sunlit Princess in Crimson Acheik"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              {isMm ? 'ကဏ္ဍ (Category)' : 'Category'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all truncate text-left ${
                    category === cat
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Remix Toggle */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMm ? '1-Click Prompt Remix ခွင့်ပြုမည်' : 'Allow 1-Click Prompt Remix'}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isMm ? 'အခြားသူများက သင့် Prompt ဖြင့် Studio တွင် ချက်ချင်း ဆက်လက်ဖန်တီးနိုင်မည်' : 'Other creators can remix your prompt in Photo Studio'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={allowRemix}
                onChange={e => setAllowRemix(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Tags Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>{isMm ? 'Tags များ (ကော်မာခြား၍ ထည့်ပါ)' : 'Hashtags (comma separated)'}</span>
              <span className="text-[10px] text-zinc-500 font-mono">e.g. #Bagan, #Acheik</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full py-3 rounded-2xl font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSuccess
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 shadow-emerald-500/25'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>{isMm ? 'အောင်မြင်စွာ မျှဝေပြီးပါပြီ (+25 Credits)' : 'Published to Community! (+25 Credits Earned)'}</span>
                </>
              ) : isSubmitting ? (
                <span>{isMm ? 'တင်သွင်းနေပါသည်...' : 'Publishing...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-black" />
                  <span>{isMm ? 'Community ပေါ်သို့ တင်မည် (+25 Credits ရယူမည်)' : 'Publish & Earn +25 Bonus Credits'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
