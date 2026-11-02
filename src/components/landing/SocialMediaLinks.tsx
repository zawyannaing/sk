import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, MessageCircle, Heart, Share2 } from 'lucide-react';
import { SupabaseService } from '../../utils/supabaseClient';
import { Language } from '../../types';
import { SocialLinksSettings } from '../admin/types';

interface SocialMediaLinksProps {
  language: Language;
  variant?: 'footer-cards' | 'compact-icons' | 'floating-badge';
  className?: string;
}

const DEFAULT_LINKS: SocialLinksSettings = {
  facebook: 'https://facebook.com/showai',
  telegram: 'https://t.me/showai_community',
  tiktok: 'https://tiktok.com/@showai',
  youtube: 'https://youtube.com/@showai',
  viber: 'https://invite.viber.com/?g2=showai',
  support_email: 'support@showai.art'
};

const STORAGE_CACHE_KEY = 'showai_public_social_links_v1';

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  language,
  variant = 'footer-cards',
  className = ''
}) => {
  const [links, setLinks] = useState<SocialLinksSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_CACHE_KEY);
      return cached ? JSON.parse(cached) : DEFAULT_LINKS;
    } catch {
      return DEFAULT_LINKS;
    }
  });

  const loadLinks = async () => {
    try {
      const data = await SupabaseService.fetchAppSettings('social_links');
      if (data && typeof data === 'object') {
        const merged: SocialLinksSettings = {
          facebook: data.facebook || DEFAULT_LINKS.facebook,
          telegram: data.telegram || DEFAULT_LINKS.telegram,
          tiktok: data.tiktok || DEFAULT_LINKS.tiktok,
          youtube: data.youtube || DEFAULT_LINKS.youtube,
          viber: data.viber || DEFAULT_LINKS.viber,
          support_email: data.support_email || DEFAULT_LINKS.support_email
        };
        setLinks(merged);
        try {
          localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch {}
  };

  useEffect(() => {
    loadLinks();

    // Listen for real-time admin setting updates
    const handleRefresh = () => loadLinks();
    window.addEventListener('supabase-settings-refresh', handleRefresh);
    window.addEventListener('supabase-cloud-refresh', handleRefresh);

    return () => {
      window.removeEventListener('supabase-settings-refresh', handleRefresh);
      window.removeEventListener('supabase-cloud-refresh', handleRefresh);
    };
  }, []);

  // Format Viber URL: if raw phone number, prefix with viber protocol
  const formatViberUrl = (val: string) => {
    if (!val) return '';
    if (val.startsWith('http') || val.startsWith('viber:')) return val;
    const cleanNum = val.replace(/[^0-9+]/g, '');
    return `viber://chat?number=${encodeURIComponent(cleanNum)}`;
  };

  // Channels to display (Facebook, Viber, Telegram, TikTok)
  const channels = [
    {
      id: 'facebook',
      name: 'Facebook',
      name_my: 'ဖေ့စ်ဘွတ်ခ်',
      handle: '@showai.myanmar',
      url: links.facebook,
      color: '#1877F2',
      bgGlow: 'hover:border-[#1877F2]/60 hover:shadow-[0_0_25px_rgba(24,119,242,0.25)]',
      iconBg: 'bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      name_my: 'တယ်လီဂရမ်',
      handle: 't.me/showai_community',
      url: links.telegram,
      color: '#229ED9',
      bgGlow: 'hover:border-[#229ED9]/60 hover:shadow-[0_0_25px_rgba(34,158,217,0.25)]',
      iconBg: 'bg-[#229ED9]/15 text-[#229ED9] border-[#229ED9]/30',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.942z" />
        </svg>
      )
    },
    {
      id: 'viber',
      name: 'Viber Channel',
      name_my: 'ဗိုင်ဘာ ချန်နယ်',
      handle: 'Viber Community',
      url: formatViberUrl(links.viber),
      color: '#7360F2',
      bgGlow: 'hover:border-[#7360F2]/60 hover:shadow-[0_0_25px_rgba(115,96,242,0.25)]',
      iconBg: 'bg-[#7360F2]/15 text-[#7360F2] border-[#7360F2]/30',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.22 3.78C18.04 1.6 15.15.4 12.06.4 5.4.4 0 5.8 0 12.46c0 2.12.55 4.18 1.6 6L.2 23.6l5.3-1.39c1.76.96 3.74 1.46 5.76 1.46h.01c6.66 0 12.06-5.4 12.06-12.06 0-3.09-1.2-5.98-3.38-8.16l.27-.27zM12.07 21.8c-1.8 0-3.56-.48-5.11-1.4l-.37-.22-3.8 1 1.01-3.7-.24-.38a9.97 9.97 0 0 1-1.53-5.34c0-5.54 4.51-10.05 10.05-10.05 2.68 0 5.2 1.05 7.1 2.95 1.9 1.9 2.95 4.42 2.95 7.1 0 5.54-4.51 10.04-10.06 10.04zm5.51-7.51c-.3-.15-1.79-.88-2.07-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52l-.58-.01c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.91 1.23 3.11.15.2 2.13 3.25 5.16 4.56.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.79-.73 2.04-1.44.25-.71.25-1.32.18-1.44-.08-.12-.28-.2-.58-.35z" />
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      name_my: 'တစ်တော့ခ်',
      handle: '@showai.studio',
      url: links.tiktok,
      color: '#FE2C55',
      bgGlow: 'hover:border-[#FE2C55]/60 hover:shadow-[0_0_25px_rgba(254,44,85,0.25)]',
      iconBg: 'bg-[#FE2C55]/15 text-[#FE2C55] border-[#FE2C55]/30',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    }
  ];

  // VARIANT 1: COMPACT ICONS (for Navbar or floating headers)
  if (variant === 'compact-icons') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {channels.map((ch) => (
          <a
            key={ch.id}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${ch.name} (${ch.handle})`}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/10 ${ch.bgGlow}`}
          >
            {React.cloneElement(ch.icon, { className: 'w-4 h-4' })}
          </a>
        ))}
      </div>
    );
  }

  // VARIANT 2: FOOTER CARDS (Grid display in the Footer)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            {language === 'my' ? 'တရားဝင် လူမှုကွန်ရက်နှင့် ချန်နယ်များ' : 'Official Community Channels'}
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">Live Connected</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {channels.map((ch) => (
          <a
            key={ch.id}
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-all group flex flex-col justify-between space-y-3 ${ch.bgGlow}`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${ch.iconBg} group-hover:scale-105 transition-transform`}>
                {ch.icon}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </div>

            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                <span>{language === 'my' ? ch.name_my : ch.name}</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
                {ch.handle}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
