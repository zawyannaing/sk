import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Share2,
  Check,
  Copy,
  Heart,
  Wand2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Award,
  Flame,
  Layers,
  Send,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { UserProfile, Language } from '../../types';
import { CommunityCreation } from '../../data/communityData';

interface PublicCreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
    title?: string;
    coverImage?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      facebook?: string;
      telegram?: string;
      tiktok?: string;
      instagram?: string;
      website?: string;
    };
    badges?: string[];
    isVerified?: boolean;
    totalLikes?: number;
    totalRemixes?: number;
  };
  creations?: CommunityCreation[];
  onRemixCreation?: (prompt: string, ratio?: string, imageUrl?: string) => void;
  language?: Language;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80';

export const PublicCreatorProfileModal: React.FC<PublicCreatorProfileModalProps> = ({
  isOpen,
  onClose,
  creator,
  creations = [],
  onRemixCreation,
  language = 'en'
}) => {
  const isMm = language === 'my';
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedCreation, setSelectedCreation] = useState<CommunityCreation | null>(null);

  if (!isOpen) return null;

  const handleCopyProfileLink = () => {
    const handle = creator.username ? `@${creator.username.replace('@', '')}` : creator.name.toLowerCase().replace(/\s+/g, '');
    const url = `${window.location.origin}/creator/${handle}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareProfile = async () => {
    const handle = creator.username ? `@${creator.username.replace('@', '')}` : creator.name;
    const shareData = {
      title: `${creator.name} • ShowAI Creator Portfolio`,
      text: `Check out AI artworks & prompts created by ${creator.name} on ShowAI Studio!`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      handleCopyProfileLink();
    }
  };

  const creatorCreations = creations.filter(
    c => c.author.toLowerCase() === creator.name.toLowerCase() ||
         (creator.username && c.authorHandle === creator.username)
  );
  const displayCreations = creatorCreations.length > 0 ? creatorCreations : creations.slice(0, 6);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl my-auto rounded-3xl bg-[#0b0e14] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Banner */}
        <div className="relative h-36 sm:h-48 w-full bg-zinc-900 overflow-hidden shrink-0">
          <img
            src={creator.coverImage || DEFAULT_COVER}
            alt="Creator Cover Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/40 to-black/30" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Share Profile Link */}
          <button
            type="button"
            onClick={handleShareProfile}
            className="absolute top-3 right-14 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copiedLink ? (isMm ? 'လင့်ခ် ကူးပြီးပြီ' : 'Link Copied!') : (isMm ? 'Profile မျှဝေမည်' : 'Share Profile')}</span>
          </button>
        </div>

        {/* Profile Info Header Bar */}
        <div className="px-5 sm:px-7 pb-4 pt-0 relative shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            {/* Avatar & Identifiers */}
            <div className="flex items-end gap-3.5">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-[#0b0e14] border-2 border-emerald-500/50 shadow-2xl shrink-0 overflow-hidden">
                <img
                  src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={creator.name}
                  className="w-full h-full object-cover rounded-xl"
                />
                <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0b0e14]" />
              </div>

              <div className="space-y-0.5 pb-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                    {creator.name}
                  </h2>
                  {(creator.isVerified ?? true) && (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" title="Verified AI Creator" />
                  )}
                </div>
                <div className="text-xs text-emerald-400 font-mono">
                  @{creator.username ? creator.username.replace('@', '') : 'creator'}
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {creator.title || (isMm ? 'မြန်မာ့ယဉ်ကျေးမှုနှင့် အနုပညာ AI ဖန်တီးရှင်' : 'Burmese Royal Heritage & Cinematic AI Artist')}
                </p>
              </div>
            </div>

            {/* Follow / Bookmark Action */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                  isFollowing
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isMm ? 'Follow လုပ်ထားသည်' : 'Following'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isMm ? 'Follow ပြုလုပ်မည်' : 'Follow Creator'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <p className="text-xs text-zinc-300 leading-relaxed font-sans max-w-2xl mb-4 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {creator.bio}
            </p>
          )}

          {/* Stats Bar & Social Links */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="font-bold text-white">{displayCreations.length}</span>{' '}
                <span className="text-zinc-500 text-[11px]">Creations</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400">{(creator.totalLikes || 420).toLocaleString()}</span>{' '}
                <span className="text-zinc-500 text-[11px]">Likes</span>
              </div>
              <div>
                <span className="font-bold text-cyan-400">{(creator.totalRemixes || 185).toLocaleString()}</span>{' '}
                <span className="text-zinc-500 text-[11px]">Remixes</span>
              </div>
            </div>

            {/* Social Pills */}
            <div className="flex items-center gap-1.5 text-zinc-400">
              {creator.socialLinks?.facebook && (
                <a
                  href={creator.socialLinks.facebook.startsWith('http') ? creator.socialLinks.facebook : `https://facebook.com/${creator.socialLinks.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-blue-600/20 hover:text-blue-400 border border-white/5 text-[11px] transition-colors"
                >
                  Facebook
                </a>
              )}
              {creator.socialLinks?.telegram && (
                <a
                  href={creator.socialLinks.telegram.startsWith('http') ? creator.socialLinks.telegram : `https://t.me/${creator.socialLinks.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-cyan-600/20 hover:text-cyan-400 border border-white/5 text-[11px] transition-colors"
                >
                  Telegram
                </a>
              )}
              {creator.socialLinks?.tiktok && (
                <a
                  href={creator.socialLinks.tiktok.startsWith('http') ? creator.socialLinks.tiktok : `https://tiktok.com/@${creator.socialLinks.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-pink-600/20 hover:text-pink-400 border border-white/5 text-[11px] transition-colors"
                >
                  TikTok
                </a>
              )}
              {creator.website && (
                <a
                  href={creator.website.startsWith('http') ? creator.website : `https://${creator.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg bg-zinc-900 hover:bg-white/10 hover:text-white border border-white/5 text-[11px] transition-colors"
                  title="Website Portfolio"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Gallery Section */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMm ? 'ဖန်တီးသူ၏ လက်ရာများ' : 'Public Creations & Prompts'}</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              {displayCreations.length} shared
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayCreations.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black/60">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 space-y-2">
                    <p className="text-[11px] text-white font-medium line-clamp-2">
                      {item.title}
                    </p>

                    {onRemixCreation && (
                      <button
                        type="button"
                        onClick={() => {
                          onRemixCreation(item.masterPrompt, item.aspectRatio, item.imageUrl);
                          onClose();
                        }}
                        className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-lg cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>1-Click Remix</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-white/5">
                  <span className="truncate max-w-[100px] text-zinc-300">{item.title}</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Heart className="w-3 h-3 fill-emerald-400/20" />
                    <span>{item.likesCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
