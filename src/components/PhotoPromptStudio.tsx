import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Sparkles, Wand2, Image as ImageIcon, Download, Copy, Check, X,
  Loader2, Upload, RefreshCw, ChevronDown, ExternalLink, AlertTriangle, Camera,
  Zap, Star, Flame, ShieldCheck, Folder, FolderPlus, FolderOpen, Heart, Trash2,
  Search, Tag, Eye, Edit3, SlidersHorizontal, Clock, Bookmark, Cloud, Plus, Minus,
  LogIn, Menu, Home, Video, Layers, ChevronRight, Coins
} from 'lucide-react';
import type { NavView } from './Sidebar';
import { SupabaseService } from '../utils/supabaseClient';

interface PhotoPromptStudioProps {
  onNavigateView?: (view: NavView, photoUrl?: string) => void;
  onBackToMatrix?: () => void;
  onSendToMatrix?: (promptText: string) => void;
  onBackToPortal?: () => void;
  language?: any;
  initialPrompt?: string;
  initialRatio?: string;
  initialRefPhoto?: string | null;
  initialRefPhotos?: (string | { url: string; name?: string; id?: string })[];
  initialChosenOptions?: { label: string; value: string; emoji?: string }[];
}

interface ModelInfo {
  id: string;
  name: string;
  badge: string;
  category?: string;
  desc?: string;
  envKey: string | null;
  available: boolean;
}

export type PhotoRole = 'character' | 'background' | 'style' | 'outfit' | 'general';

export interface UploadedRefPhoto {
  id: string;
  url: string;
  name: string;
  role?: PhotoRole;
}

const PHOTO_ROLES: { id: PhotoRole; label: string; short: string; desc: string }[] = [
  { id: 'character', label: 'Character / Subject', short: 'Character', desc: 'Preserves face, identity and bodily features' },
  { id: 'background', label: 'Background / Scene', short: 'Background', desc: 'Environment, location and atmosphere' },
  { id: 'style', label: 'Style / Lighting', short: 'Style', desc: 'Cinematic color grading and lighting' },
  { id: 'outfit', label: 'Outfit / Wardrobe', short: 'Outfit', desc: 'Clothing style and fabric texture' },
  { id: 'general', label: 'General Reference', short: 'General', desc: 'Standard visual guidance' },
];

interface ResultImage {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  ratio: string;
  folder?: string;
  createdAt?: number;
  favorite?: boolean;
}

export interface LibraryPhotoItem {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  ratio: string;
  folder: string;
  createdAt: number;
  favorite?: boolean;
}

const LIBRARY_STORAGE_KEY = 'infinity_photo_studio_library_items_v2';
const FOLDERS_STORAGE_KEY = 'infinity_photo_studio_library_folders_v2';
const DEFAULT_FOLDERS = ['General', 'Cinematic', 'Portraits', 'Characters', 'Cyberpunk', 'Concept Art'];

const getUserLibraryKey = () => {
  try {
    const session = SupabaseService.getSession();
    if (session?.user?.id) {
      return `infinity_photo_studio_library_items_${session.user.id}`;
    }
  } catch {}
  return LIBRARY_STORAGE_KEY;
};

const safeLoadLibrary = (): LibraryPhotoItem[] => {
  try {
    const userKey = getUserLibraryKey();
    const raw = localStorage.getItem(userKey) || localStorage.getItem(LIBRARY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const safeLoadFolders = (): string[] => {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FOLDERS;
  } catch {
    return DEFAULT_FOLDERS;
  }
};

const safeSaveLibrary = (items: LibraryPhotoItem[]) => {
  const userKey = getUserLibraryKey();
  try {
    localStorage.setItem(userKey, JSON.stringify(items));
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items.slice(0, 40)));
  } catch {
    // If quota exceeded, retain all favorites and newest 20 items
    console.warn('Storage quota warning in Photo Library, optimizing storage...');
    const favs = items.filter(x => x.favorite);
    const nonFavs = items.filter(x => !x.favorite).slice(0, 16);
    try {
      localStorage.setItem(userKey, JSON.stringify([...favs, ...nonFavs]));
    } catch (err) {
      console.error('Critical quota error saving library', err);
    }
  }
};

const safeSaveFolders = (folders: string[]) => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch {}
};

// Offline default list (replaced by /api/photo-studio/models once loaded)
const DEFAULT_MODELS: ModelInfo[] = [
  // Flagships & Nano Banana
  { id: 'nano-banana-2', name: 'Nano Banana 2 (OpenRouter Pro)', category: 'Nano Banana', badge: 'TOP', desc: 'Google Gemini 2.5 Flash Image engine via OpenRouter, ultra-fast & photorealistic', envKey: 'OPENROUTER_API_KEY', available: true },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro (OpenRouter Ultra)', category: 'Nano Banana', badge: 'PRO', desc: 'Google Gemini 3 Pro / Imagen via OpenRouter with rich micro-textures', envKey: 'OPENROUTER_API_KEY', available: true },
  
  // OpenAI Suite
  { id: 'gpt-image-2', name: 'GPT Image 2 (OpenAI Flagship)', category: 'OpenAI', badge: 'TOP', desc: 'OpenAI generation engine with HD composition & prompt precision', envKey: 'OPENROUTER_API_KEY', available: true },
  { id: 'gpt-image-1', name: 'GPT Image 1 (OpenAI Standard)', category: 'OpenAI', badge: 'KEY', desc: 'OpenAI standard image generation model', envKey: 'OPENAI_API_KEY', available: false },

  // Top Open-Source & Photoreal
  { id: 'flux-realism', name: 'FLUX Photoreal 8K (Free)', category: 'Top Open Tier', badge: 'TOP', desc: 'Tuned for natural skin textures, depth of field and cinema lighting', envKey: null, available: true },
  { id: 'pollinations-flux', name: 'FLUX.1 Schnell (Free)', category: 'Top Open Tier', badge: 'FREE', desc: 'Next-gen open diffusion model, excellent lighting and prompt fidelity', envKey: null, available: true },
  { id: 'sd-3-5', name: 'Stable Diffusion 3.5 Large (Free)', category: 'Top Open Tier', badge: 'FREE', desc: 'Stability AI flagship diffusion model with balanced color palettes', envKey: null, available: true },
  { id: 'pollinations-turbo', name: 'Turbo Fast (Free, 2s)', category: 'Top Open Tier', badge: 'FREE', desc: 'Ultra-fast preview generation in 1-2 seconds', envKey: null, available: true },

  // Google Direct & Cloud
  { id: 'gemini-flash-image', name: 'Gemini 2.5 Flash Image', category: 'Cloud Pro', badge: 'KEY', desc: 'Direct Google Gemini 2.5 image generation endpoint', envKey: 'GEMINI_API_KEY', available: true },
  { id: 'imagen-3', name: 'Google Imagen 3', category: 'Cloud Pro', badge: 'KEY', desc: 'Google DeepMind Imagen 3 prediction endpoint', envKey: 'GEMINI_API_KEY', available: true },
  { id: 'flux-fal', name: 'FLUX.1 dev (fal.ai)', category: 'Cloud Pro', badge: 'KEY', desc: 'Hosted FLUX.1 Dev endpoint via Fal.ai API', envKey: 'FAL_KEY', available: false },
  { id: 'openrouter-gemini-image', name: 'Gemini Image (OpenRouter)', category: 'Cloud Pro', badge: 'KEY', desc: 'OpenRouter multi-provider gateway for Gemini image', envKey: 'OPENROUTER_API_KEY', available: true },
];

interface RatioOption {
  id: string;
  label: string;
  box: string;
  res: string;
  desc: string;
}

const RATIOS: RatioOption[] = [
  { id: '1:1', label: '1:1 Square', box: 'w-4 h-4', res: '1024 × 1024', desc: 'Instagram Post / Square Avatar' },
  { id: '4:5', label: '4:5 Portrait', box: 'w-3.5 h-4', res: '1080 × 1350', desc: 'Instagram Portrait / Editorial Feed' },
  { id: '9:16', label: '9:16 Story / Reel', box: 'w-2.5 h-4', res: '1080 × 1920', desc: 'TikTok / Stories / Phone Vertical' },
  { id: '16:9', label: '16:9 Landscape', box: 'w-5 h-3', res: '1920 × 1080', desc: 'YouTube / Cinema Landscape' },
  { id: '21:9', label: '21:9 Cinema Scope', box: 'w-6 h-2.5', res: '2560 × 1080', desc: 'Ultrawide Panoramic Screen' },
  { id: '3:4', label: '3:4 Vertical', box: 'w-3 h-4', res: '1536 × 2048', desc: 'Print Portrait / Studio Editorial' },
  { id: '2:3', label: '2:3 Standard', box: 'w-3 h-4.5', res: '1200 × 1800', desc: '35mm Photography Standard' },
];

type ResolutionTier = '1k' | '2k' | '4k' | '8k';

interface ResolutionTierOption {
  id: ResolutionTier;
  label: string;
  badge: string;
  multiplier: number;
  desc: string;
}

const RESOLUTION_TIERS: ResolutionTierOption[] = [
  { id: '1k', label: '1K Standard', badge: '1024p', multiplier: 1, desc: 'Fast generation, web & preview' },
  { id: '2k', label: '2K High-Res', badge: '1440p', multiplier: 1.5, desc: 'Retina clarity, skin micro-pores' },
  { id: '4k', label: '4K Ultra HD', badge: '2160p', multiplier: 2, desc: 'Ultra-clear commercial photography' },
  { id: '8k', label: '8K Master', badge: '4320p', multiplier: 3, desc: 'Museum gallery print quality' },
];

const TIER_CREDIT_RATES: Record<ResolutionTier, number> = {
  '1k': 5,
  '2k': 8,
  '4k': 12,
  '8k': 20
};

const RESOLUTION_MAP: Record<string, Record<ResolutionTier, string>> = {
  '1:1': {
    '1k': '1024 × 1024',
    '2k': '1536 × 1536',
    '4k': '2160 × 2160',
    '8k': '4320 × 4320',
  },
  '4:5': {
    '1k': '1080 × 1350',
    '2k': '1440 × 1800',
    '4k': '2160 × 2700',
    '8k': '4320 × 5400',
  },
  '9:16': {
    '1k': '1080 × 1920',
    '2k': '1440 × 2560',
    '4k': '2160 × 3840',
    '8k': '4320 × 7680',
  },
  '16:9': {
    '1k': '1920 × 1080',
    '2k': '2560 × 1440',
    '4k': '3840 × 2160',
    '8k': '7680 × 4320',
  },
  '21:9': {
    '1k': '2560 × 1080',
    '2k': '3440 × 1440',
    '4k': '5120 × 2160',
    '8k': '10240 × 4320',
  },
  '3:4': {
    '1k': '1536 × 2048',
    '2k': '2048 × 2730',
    '4k': '3072 × 4096',
    '8k': '6144 × 8192',
  },
  '2:3': {
    '1k': '1200 × 1800',
    '2k': '1600 × 2400',
    '4k': '2400 × 3600',
    '8k': '4800 × 7200',
  },
};

// Sanitize prompt into clean natural photography prose:
// 1. Remove Midjourney flags (--ar, --v, etc.) and /imagine
// 2. Remove OpenArt bracket headers ([Subject]:, [Action]:, [Environment]:, [Cinematography]:, [Lighting/Style]:, [Technical]:, etc.)
// 3. Fix corrupted bracket nesting/fragments ([Subjec[Subject]:, t]:, etc.)
// 4. Eliminate sentence-level duplicates caused by multiple enhance presses
const cleanForImage = (p: string | null | undefined): string => {
  if (!p || typeof p !== 'string') return '';
  let s = p.trim();

  // 1. Remove Midjourney imagine prefixes and non-ar parameter flags (preserve --ar)
  s = s.replace(/\/imagine\s+prompt:\s*/gi, '');
  s = s.replace(/--(?:v\s+[\d.]+|style\s+\w+|s\s+\d+|c\s+\d+|q\s+\d+|repeat\s+\d+|weird\s+\d+|no\s+[^\n-]+)/gi, '');

  // 2. Fix broken bracket nesting / corrupted fragments like [Subjec[Subject]: or [Subjec...t]:
  s = s.replace(/\[Subjec(?:t)?\s*(?:\[Subject\]\s*:?)?/gi, ' ');
  s = s.replace(/(?:^|\n)\s*t\]\s*:?\s*/gi, ' ');

  // 3. Remove all bracket section headers (OpenArt, Midjourney, SD syntax)
  s = s.replace(/\[\s*(Subject|Action|Environment|Cinematography|Lighting(?:\/Style)?|Style|Technical|Camera|Composition|Setting|Scene|Atmosphere|Details|Wardrobe|Attire|Pose|Expression|Character(?:\/Subject)?)\s*\]\s*:?\s*/gi, ' ');

  // 4. Clean any other bracket tags and stray brackets
  s = s.replace(/\[[a-zA-Z0-9_\s\/-]{1,25}\]\s*:?\s*/g, ' ');
  s = s.replace(/[\[\]]/g, ' ');

  // 5. Clean up leading colons, hyphens, semicolons
  s = s.replace(/^\s*[:;,-]+\s*/g, '');

  // 6. Clean up extra spaces
  s = s.replace(/\s{2,}/g, ' ').trim();

  // 7. Sentence-level deduplication to eliminate repeated phrases/sections
  const sentences = s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  const seenSentences = new Set<string>();
  const deduped: string[] = [];

  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized.length > 10) {
      if (!seenSentences.has(normalized)) {
        seenSentences.add(normalized);
        deduped.push(sentence);
      }
    } else {
      deduped.push(sentence);
    }
  }

  s = deduped.join(' ');

  // 8. Clean punctuation spacing, colons, and double punctuation
  s = s.replace(/^\s*[:;,-]+\s*/g, '');
  s = s.replace(/\s+([.,;:!?])/g, '$1').replace(/([.,;:!?]){2,}/g, '$1 ').replace(/\s{2,}/g, ' ').trim();

  return s;
};

export const PhotoPromptStudio: React.FC<PhotoPromptStudioProps> = ({
  onNavigateView,
  onBackToPortal,
  onBackToMatrix,
  onSendToMatrix,
  initialPrompt,
  initialRatio,
  initialRefPhoto,
  initialRefPhotos,
  initialChosenOptions
}) => {
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [modelId, setModelId] = useState('nano-banana-2');
  const [modelOpen, setModelOpen] = useState(false);
  const [prompt, setPrompt] = useState(() => (initialPrompt ? cleanForImage(initialPrompt) : ''));
  const [chosenBurmeseOptions, setChosenBurmeseOptions] = useState<{ label: string; value: string; emoji?: string }[]>(
    () => initialChosenOptions || []
  );
  const [ratio, setRatio] = useState(() =>
    initialRatio && RATIOS.some(r => r.id === initialRatio) ? initialRatio : '1:1'
  );
  const activeRatioObj = RATIOS.find(r => r.id === ratio) || RATIOS[0];
  const [resolutionTier, setResolutionTier] = useState<ResolutionTier>('2k');
  const currentResString = (RESOLUTION_MAP[ratio] && RESOLUTION_MAP[ratio][resolutionTier]) || '1440 × 1800';
  const currentTierObj = RESOLUTION_TIERS.find(t => t.id === resolutionTier) || RESOLUTION_TIERS[1];
  const [count, setCount] = useState(2);
  const [polish, setPolish] = useState(true);

  // User credit balance state synced with Supabase
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (SupabaseService.getSession()) {
        const p = await SupabaseService.getUserProfile();
        if (p?.credits !== undefined) setUserCredits(p.credits);
      }
    };
    fetchBalance();
    window.addEventListener('supabase-cloud-refresh', fetchBalance);
    return () => window.removeEventListener('supabase-cloud-refresh', fetchBalance);
  }, []);

  const currentCreditRate = TIER_CREDIT_RATES[resolutionTier] || 5;
  const currentCreditCost = currentCreditRate * count;

  // Folder & Library System
  const [folders, setFolders] = useState<string[]>(safeLoadFolders);
  const [targetFolder, setTargetFolder] = useState<string>('General');
  const [libraryItems, setLibraryItems] = useState<LibraryPhotoItem[]>(safeLoadLibrary);
  const [activeMainTab, setActiveMainTab] = useState<'current' | 'library'>('current');
  const [mobileTab, setMobileTab] = useState<'studio' | 'outputs' | 'library'>('studio');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');

  // Modals & Inspection
  const [lightboxItem, setLightboxItem] = useState<LibraryPhotoItem | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveFolderModal, setMoveFolderModal] = useState<LibraryPhotoItem | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [results, setResults] = useState<ResultImage[]>(() => {
    const lib = safeLoadLibrary();
    return lib.slice(0, 12).map(item => ({
      id: item.id,
      url: item.url,
      prompt: item.prompt,
      provider: item.provider,
      ratio: item.ratio,
      folder: item.folder,
      createdAt: item.createdAt,
      favorite: item.favorite
    }));
  });
  const [notice, setNotice] = useState<{ type: 'info' | 'warn' | 'error'; text: string } | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  // Prompt box inline reference images upload (Unlimited photos supported)
  const [uploadedRefImages, setUploadedRefImages] = useState<UploadedRefPhoto[]>([]);
  const [activeRefId, setActiveRefId] = useState<string | null>(null);
  const [useAllRefImages, setUseAllRefImages] = useState<boolean>(true);
  const [isExtractingRef, setIsExtractingRef] = useState(false);
  const promptImageInputRef = useRef<HTMLInputElement | null>(null);

  // Photo → Prompt modal (Unlimited photos supported)
  const [p2pOpen, setP2pOpen] = useState(false);
  const [p2pImages, setP2pImages] = useState<UploadedRefPhoto[]>([]);
  const [p2pActiveId, setP2pActiveId] = useState<string | null>(null);
  const [p2pBusy, setP2pBusy] = useState(false);
  const [p2pPrompt, setP2pPrompt] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selected = models.find(m => m.id === modelId) || models[0];
  const activeRefPhoto = uploadedRefImages.find(img => img.id === activeRefId) || uploadedRefImages[0] || null;
  const activeP2pPhoto = p2pImages.find(img => img.id === p2pActiveId) || p2pImages[0] || null;

  // Sync incoming prompt / aspect ratio / reference image from Detail Burmese Studio
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      let cleaned = cleanForImage(initialPrompt);
      const targetRatio = initialRatio && RATIOS.some(r => r.id === initialRatio) ? initialRatio : ratio;
      if (/--ar\s+[0-9:]+/i.test(cleaned)) {
        cleaned = cleaned.replace(/--ar\s+[0-9:]+/gi, `--ar ${targetRatio}`);
      } else {
        cleaned = `${cleaned.trim()} --ar ${targetRatio}`;
      }
      setPrompt(cleaned);
      setActiveMainTab('current');
      setNotice({
        type: 'info',
        text: '✓ Prompt loaded from Detail Burmese Studio — Ready to Generate Image!'
      });
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (initialRatio && RATIOS.some(r => r.id === initialRatio)) {
      setRatio(initialRatio);
      setPrompt(prev => {
        const trimmed = prev.trim();
        if (!trimmed) return trimmed;
        if (/--ar\s+[0-9:]+/i.test(trimmed)) {
          return trimmed.replace(/--ar\s+[0-9:]+/gi, `--ar ${initialRatio}`);
        }
        return `${trimmed} --ar ${initialRatio}`;
      });
    }
  }, [initialRatio]);

  const changeRatio = (newRatio: string) => {
    setRatio(newRatio);
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return trimmed;
      if (/--ar\s+[0-9:]+/i.test(trimmed)) {
        return trimmed.replace(/--ar\s+[0-9:]+/gi, `--ar ${newRatio}`);
      }
      return `${trimmed} --ar ${newRatio}`;
    });
  };

  const changeResolutionTier = (newTier: ResolutionTier) => {
    setResolutionTier(newTier);
    setPrompt(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return trimmed;
      let p = trimmed.replace(/(?:,\s*)?(?:1k\s+standard|2k\s+high-res(?:olution)?|4k\s+ultra\s+hd|8k\s+master(?:work)?|8k\s+ultra-detailed(?:\s+resolution)?|8k\s+resolution|4k\s+uhd\s+resolution|2k\s+resolution|1024p\s+resolution)[^,\n]*/gi, '');
      const resWord = newTier === '8k' ? '8k ultra-detailed resolution, museum-grade fine art sharpness' : newTier === '4k' ? '4k UHD resolution, tack-sharp optical clarity' : newTier === '2k' ? '2k high-resolution, sharp focus, natural skin micro-textures' : '1024p resolution';
      if (/--ar\s+[0-9:]+/i.test(p)) {
        return p.replace(/--ar\s+([0-9:]+)/i, `, ${resWord} --ar $1`);
      }
      return `${p.trim()}, ${resWord}`;
    });
  };

  useEffect(() => {
    if (initialRefPhoto && initialRefPhoto.trim()) {
      setUploadedRefImages(prev => {
        if (prev.some(p => p.url === initialRefPhoto)) return prev;
        const newRef: UploadedRefPhoto = {
          id: `burmese-ref-${Date.now()}`,
          url: initialRefPhoto,
          name: 'Detail Burmese Reference'
        };
        setActiveRefId(newRef.id);
        return [newRef, ...prev];
      });
      setUseAllRefImages(true);
    }
  }, [initialRefPhoto]);

  useEffect(() => {
    if (initialRefPhotos && initialRefPhotos.length > 0) {
      setUploadedRefImages(prev => {
        const next = [...prev];
        let hasNew = false;
        initialRefPhotos.forEach((item, idx) => {
          const url = typeof item === 'string' ? item : item.url;
          const name = typeof item === 'string' ? `Burmese Reference #${idx + 1}` : (item.name || `Burmese Reference #${idx + 1}`);
          const id = typeof item === 'object' && item.id ? item.id : `burmese-ref-${Date.now()}-${idx}`;
          if (url && url.trim() && !next.some(p => p.url === url)) {
            next.unshift({ id, url, name });
            hasNew = true;
          }
        });
        if (hasNew && next.length > 0) {
          setActiveRefId(next[0].id);
        }
        return next;
      });
      setUseAllRefImages(true);
    }
  }, [initialRefPhotos]);

  useEffect(() => {
    if (initialChosenOptions && initialChosenOptions.length > 0) {
      setChosenBurmeseOptions(initialChosenOptions);
    }
  }, [initialChosenOptions]);

  // Sync with Supabase Cloud user_history
  const syncWithSupabaseCloud = async (showToast = false) => {
    if (!SupabaseService.isConfigured() || !SupabaseService.getSession()?.user?.id) {
      if (showToast) flash('warn', 'Cloud sync requires logging in to your account.');
      return;
    }
    setIsCloudSyncing(true);
    try {
      const rows = await SupabaseService.fetchUserHistory();
      if (rows && rows.length > 0) {
        const cloudItems: LibraryPhotoItem[] = rows
          .filter(r => r.generated_image_url)
          .map(r => ({
            id: r.id,
            url: r.generated_image_url || '',
            prompt: r.master_prompt,
            provider: r.provider || 'Nano Banana 2',
            ratio: r.aspect_ratio || '1:1',
            folder: r.folder || 'General',
            createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
            favorite: !!r.is_favorite
          }));

        setLibraryItems(prev => {
          const map = new Map<string, LibraryPhotoItem>();
          // Cloud items take precedence
          cloudItems.forEach(item => map.set(item.id, item));
          // Preserve local items not in cloud
          prev.forEach(item => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
          safeSaveLibrary(merged);
          return merged;
        });

        setResults(prev => {
          if (prev.length === 0) {
            return cloudItems.slice(0, 12).map(item => ({
              id: item.id,
              url: item.url,
              prompt: item.prompt,
              provider: item.provider,
              ratio: item.ratio,
              folder: item.folder,
              createdAt: item.createdAt,
              favorite: item.favorite
            }));
          }
          return prev;
        });

        if (showToast) {
          flash('info', `Cloud Synced: Restored ${cloudItems.length} photo(s) from your account! `);
        }
      } else if (showToast) {
        flash('info', 'Cloud is connected. No previous cloud photos found for this account.');
      }
    } catch (e: any) {
      console.warn('Failed to sync cloud history:', e);
      if (showToast) flash('error', 'Cloud sync failed. Check your connection.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Refresh available models from server & load user cloud library from Supabase
  useEffect(() => {
    fetch('/api/photo-studio/models')
      .then(r => r.json())
      .then(d => { if (d?.models?.length) setModels(d.models); })
      .catch(() => { /* keep defaults */ });

    // Initial sync
    syncWithSupabaseCloud();

    const handleCloudRefresh = () => {
      const reloadedLib = safeLoadLibrary();
      setLibraryItems(reloadedLib);
      if (reloadedLib.length > 0) {
        setResults(prev => (prev.length === 0 ? reloadedLib.slice(0, 12) : prev));
      }
      syncWithSupabaseCloud();
    };

    window.addEventListener('supabase-cloud-refresh', handleCloudRefresh);
    window.addEventListener('storage', handleCloudRefresh);

    return () => {
      window.removeEventListener('supabase-cloud-refresh', handleCloudRefresh);
      window.removeEventListener('storage', handleCloudRefresh);
    };
  }, []);

  const handleRestoreRecentPhotos = () => {
    const lib = safeLoadLibrary();
    if (lib.length > 0) {
      setResults(lib.slice(0, 12).map(item => ({
        id: item.id,
        url: item.url,
        prompt: item.prompt,
        provider: item.provider,
        ratio: item.ratio,
        folder: item.folder,
        createdAt: item.createdAt,
        favorite: item.favorite
      })));
      flash('info', `Restored ${Math.min(lib.length, 12)} recent photo(s)!`);
    } else {
      syncWithSupabaseCloud(true);
    }
  };

  const flash = (type: 'info' | 'warn' | 'error', text: string, ms = 5000) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), ms);
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t).catch(() => {});
    flash('info', 'Prompt copied to clipboard!', 2000);
  };

  const downloadImage = async (url: string, id: string) => {
    try {
      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo-studio-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const a = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
      a.download = `photo-studio-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleDownloadAllToDevice = async (itemsToDownload: { url: string; id: string }[]) => {
    if (!itemsToDownload.length || isDownloadingAll) return;
    setIsDownloadingAll(true);
    flash('info', `ဓာတ်ပုံ (${itemsToDownload.length}) ပုံကို စက်ထဲသို့ တစ်ပုံချင်း ဒေါင်းလုဒ်စတင်ဆွဲယူနေပါသည်...`, 3000);
    
    let downloadedCount = 0;
    for (let i = 0; i < itemsToDownload.length; i++) {
      const item = itemsToDownload[i];
      try {
        await downloadImage(item.url, item.id || `batch-${i + 1}`);
        downloadedCount++;
        // Small delay between downloads so the browser doesn't block multiple popups
        await new Promise(r => setTimeout(r, 350));
      } catch (err) {
        console.error('Download error for item', i, err);
      }
    }
    setIsDownloadingAll(false);
    flash('info', `ဓာတ်ပုံ (${downloadedCount}) ပုံကို မိမိစက်ထဲသို့ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!`, 4000);
  };

  // ---- Upload Unlimited Reference Images directly inside Prompt Box ----
  const handlePromptImageUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      flash('error', 'Please select valid image file(s).');
      return;
    }

    const readPromises = files.map((file, idx) =>
      new Promise<UploadedRefPhoto | null>(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            resolve({
              id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
              url: dataUrl,
              name: file.name || `Photo ${idx + 1}`
            });
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      })
    );

    const loaded = (await Promise.all(readPromises)).filter(Boolean) as UploadedRefPhoto[];
    if (loaded.length > 0) {
      setUploadedRefImages(prev => {
        const next = [...prev];
        loaded.forEach((item, idx) => {
          const totalIdx = prev.length + idx;
          const defaultRole: PhotoRole =
            totalIdx === 0 ? 'character' :
            totalIdx === 1 ? 'background' :
            totalIdx === 2 ? 'style' :
            totalIdx === 3 ? 'outfit' : 'general';
          next.push({ ...item, role: item.role || defaultRole });
        });
        return next;
      });
      setActiveRefId(loaded[loaded.length - 1].id);
      flash(
        'info',
        `Added ${loaded.length} photo${loaded.length > 1 ? 's' : ''}. Total attached: ${uploadedRefImages.length + loaded.length}. Roles assigned for master compositing.`,
        4000
      );
    }
  };

  const handleUpdateRefPhotoRole = (id: string, newRole: PhotoRole) => {
    setUploadedRefImages(prev =>
      prev.map(item => item.id === id ? { ...item, role: newRole } : item)
    );
  };

  const handleRemoveRefPhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadedRefImages(prev => {
      const next = prev.filter(item => item.id !== id);
      if (activeRefId === id) {
        setActiveRefId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleClearAllRefPhotos = () => {
    setUploadedRefImages([]);
    setActiveRefId(null);
    flash('info', 'Cleared all attached reference photos.', 2500);
  };

  // ---- Extract Prompt from attached Reference Image(s) ----
  const handleExtractFromRefImage = async (specificPhotoUrl?: string) => {
    const targetImages = specificPhotoUrl
      ? [specificPhotoUrl]
      : useAllRefImages
      ? uploadedRefImages.map(x => x.url)
      : activeRefPhoto
      ? [activeRefPhoto.url]
      : [];

    if (targetImages.length === 0 || isExtractingRef) return;
    setIsExtractingRef(true);
    try {
      const res = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetImages[0],
          images: targetImages,
          targetEngine: 'flux',
          language: 'en'
        })
      });
      const data = await res.json();
      const a = data?.analysis;
      const extracted = cleanForImage(a?.masterPrompt || a?.fluxPrompt || a?.midjourneyPrompt || '');
      if (extracted) {
        setPrompt(extracted);
        flash(
          'info',
          `Extracted detailed master prompt from ${targetImages.length > 1 ? `${targetImages.length} reference photos` : 'uploaded photo'}!`,
          3500
        );
      } else {
        flash('warn', 'Could not extract prompt from image.');
      }
    } catch {
      flash('error', 'Failed to analyze attached image(s).');
    } finally {
      setIsExtractingRef(false);
    }
  };

  // ---- Enhance prompt with AI ----
  const handleEnhance = async () => {
    if ((!prompt.trim() && uploadedRefImages.length === 0) || isEnhancing) return;
    if (!prompt.trim() && uploadedRefImages.length > 0) {
      await handleExtractFromRefImage();
      return;
    }
    setIsEnhancing(true);
    try {
      const sanitizedCurrentPrompt = cleanForImage(prompt.trim());
      const res = await fetch('/api/generate-photo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sanitizedCurrentPrompt, model: 'Flux', format: 'normal', aspectRatio: ratio })
      });
      const data = await res.json();
      if (data?.resultText) {
        let enhanced = cleanForImage(data.resultText);
        enhanced = `${enhanced.replace(/--ar\s+[0-9:]+/gi, '').trim()} --ar ${ratio}`;
        setPrompt(enhanced);
        flash('info', data.isFallback ? 'Enhanced with built-in photography rules.' : 'Prompt enhanced with AI.', 3000);
      }
    } catch {
      flash('error', 'Could not enhance prompt. Check your connection.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // ---- Generate photos with Auto-Save into Supabase Cloud & Section Library ----
  const handleGenerate = async () => {
    if ((!prompt.trim() && uploadedRefImages.length === 0) || isGenerating) return;

    const session = SupabaseService.getSession();
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: 'photo-prompt' } }));
      setNotice({
        type: 'error',
        text: 'Please sign in to generate photos and use your credits / ဓာတ်ပုံထုတ်ယူရန်နှင့် ကရက်ဒစ်အသုံးပြုရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ'
      });
      return;
    }

    setIsGenerating(true);
    setMobileTab('outputs');
    setActiveMainTab('current');
    setNotice(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('photo-studio-outputs')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    try {
      const creditCost = (TIER_CREDIT_RATES[resolutionTier] || 5) * count;
      if (SupabaseService.isConfigured()) {
        const creditRes = await SupabaseService.deductCredits(
          creditCost,
          'photo_generation',
          `Generated ${count} ${resolutionTier.toUpperCase()} photo(s) via ${selected.name}`
        );
        if (!creditRes.success) {
          throw new Error(creditRes.error || `Insufficient credits (Requires ${creditCost} Credits)`);
        }
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
      }

      let finalPrompt = cleanForImage(prompt.trim() || 'Ultra-detailed photorealistic studio portrait preserving exact subject identity, lighting, and aesthetics from the reference image');
      if (polish && finalPrompt.length < 160) {
        finalPrompt += ', professional photography, highly detailed, sharp focus, natural lighting, 8k';
      }
      finalPrompt = `${finalPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()} --ar ${ratio}`;
      const activeRefObjects = useAllRefImages
        ? uploadedRefImages
        : activeRefPhoto
        ? [activeRefPhoto]
        : [];
      const refUrls = activeRefObjects.map(x => x.url);

      const res = await fetch('/api/photo-studio/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: modelId,
          aspectRatio: ratio,
          resolution: resolutionTier,
          resolutionDimensions: currentResString,
          count,
          referenceImage: activeRefPhoto?.url || refUrls[0] || null,
          referenceImages: refUrls,
          referenceImagesWithRoles: activeRefObjects.map((x, idx) => ({
            url: x.url,
            name: x.name,
            role: x.role || (idx === 0 ? 'character' : idx === 1 ? 'background' : 'general')
          }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Generation failed');

      const batchTime = Date.now();
      const assignedFolder = targetFolder || 'General';
      const providerName = data.provider || selected.name;

      // Save each generated photo to Supabase Storage + user_history if authenticated
      const batch: ResultImage[] = [];
      for (let i = 0; i < (data.images as string[]).length; i++) {
        const rawUrl = data.images[i];
        let finalId = `${batchTime}-${i}`;
        let finalUrl = rawUrl;

        if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
          const savedRow = await SupabaseService.saveHistoryRecord({
            mode: 'photo-studio',
            masterPrompt: finalPrompt,
            imageUrl: rawUrl,
            provider: providerName,
            aspectRatio: ratio,
            folder: assignedFolder,
            creditsUsed: 5
          });
          if (savedRow) {
            finalId = savedRow.id;
            finalUrl = savedRow.generated_image_url || rawUrl;
          }
        }

        batch.push({
          id: finalId,
          url: finalUrl,
          prompt: finalPrompt,
          provider: providerName,
          ratio,
          folder: assignedFolder,
          createdAt: batchTime,
          favorite: false
        });
      }

      // 1. Update Live Session
      setResults(prev => [...batch, ...prev].slice(0, 24));

      // 2. Update Studio Library
      const newLibItems: LibraryPhotoItem[] = batch.map(b => ({
        id: b.id,
        url: b.url,
        prompt: b.prompt,
        provider: b.provider,
        ratio: b.ratio,
        folder: assignedFolder,
        createdAt: batchTime,
        favorite: false
      }));

      setLibraryItems(prev => {
        const updated = [...newLibItems, ...prev];
        safeSaveLibrary(updated);
        return updated;
      });

      window.dispatchEvent(new Event('supabase-cloud-refresh'));
      flash('info', `Generated & saved ${count} photo(s) to Supabase Cloud folder "${assignedFolder}" (-${creditCost} Credits)!`, 4000);
    } catch (e: any) {
      flash('error', e?.message || 'Generation failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Folder Management ----
  const handleCreateFolder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    if (folders.includes(name)) {
      flash('warn', `Folder "${name}" already exists.`);
      return;
    }
    const updated = [...folders, name];
    setFolders(updated);
    safeSaveFolders(updated);
    setTargetFolder(name);
    setNewFolderName('');
    setNewFolderModal(false);
    flash('info', `Folder "${name}" created successfully!`);
  };

  const handleDeleteFolder = (folderNameToDelete: string) => {
    if (['General', 'Cinematic'].includes(folderNameToDelete)) {
      flash('warn', 'Standard default folders cannot be deleted.');
      return;
    }
    if (!confirm(`Delete folder "${folderNameToDelete}"? (Photos inside will be moved to "General")`)) return;

    // Move photos to General
    const updatedItems = libraryItems.map(item =>
      item.folder === folderNameToDelete ? { ...item, folder: 'General' } : item
    );
    const updatedFolders = folders.filter(f => f !== folderNameToDelete);

    setLibraryItems(updatedItems);
    safeSaveLibrary(updatedItems);

    setFolders(updatedFolders);
    safeSaveFolders(updatedFolders);

    if (activeFolderFilter === folderNameToDelete) setActiveFolderFilter('all');
    if (targetFolder === folderNameToDelete) setTargetFolder('General');

    flash('info', `Folder "${folderNameToDelete}" deleted. Items moved to "General".`);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let nextFav = false;
    setLibraryItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          nextFav = !item.favorite;
          return { ...item, favorite: nextFav };
        }
        return item;
      });
      safeSaveLibrary(updated);
      return updated;
    });
    if (lightboxItem && lightboxItem.id === id) {
      setLightboxItem(prev => (prev ? { ...prev, favorite: !prev.favorite } : null));
    }
    if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
      SupabaseService.updateHistoryRecord(id, { is_favorite: nextFav });
    }
  };

  const handleMoveFolder = (id: string, newFolder: string) => {
    setLibraryItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, folder: newFolder } : item
      );
      safeSaveLibrary(updated);
      return updated;
    });
    if (lightboxItem && lightboxItem.id === id) {
      setLightboxItem(prev => (prev ? { ...prev, folder: newFolder } : null));
    }
    if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
      SupabaseService.updateHistoryRecord(id, { folder: newFolder });
    }
    setMoveFolderModal(null);
    flash('info', `Moved photo to "${newFolder}".`);
  };

  const handleRemoveResultPhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = results.find(item => item.id === id) || libraryItems.find(item => item.id === id);
    const targetUrl = target?.url;

    setResults(prev => prev.filter(item => item.id !== id && (!targetUrl || item.url !== targetUrl)));
    setLibraryItems(prev => {
      const updated = prev.filter(item => item.id !== id && (!targetUrl || item.url !== targetUrl));
      safeSaveLibrary(updated);
      return updated;
    });

    if (lightboxItem && (lightboxItem.id === id || (targetUrl && lightboxItem.url === targetUrl))) {
      setLightboxItem(null);
    }

    if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
      SupabaseService.deleteHistoryRecord(id, targetUrl);
    }
    flash('info', 'Photo removed.');
  };

  const handleClearAllResults = () => {
    if (results.length === 0) return;
    setResults([]);
    flash('info', 'All photo results cleared.');
  };

  const handleDeleteLibraryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = libraryItems.find(item => item.id === id) || results.find(item => item.id === id);
    const targetUrl = target?.url;

    setLibraryItems(prev => {
      const updated = prev.filter(item => item.id !== id && (!targetUrl || item.url !== targetUrl));
      safeSaveLibrary(updated);
      return updated;
    });
    setResults(prev => prev.filter(item => item.id !== id && (!targetUrl || item.url !== targetUrl)));

    if (lightboxItem && (lightboxItem.id === id || (targetUrl && lightboxItem.url === targetUrl))) {
      setLightboxItem(null);
    }

    if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
      SupabaseService.deleteHistoryRecord(id, targetUrl);
    }
    flash('info', 'Photo removed from Library.');
  };

  const handleUsePrompt = (promptText: string, ratioStr?: string, modelStr?: string) => {
    setPrompt(cleanForImage(promptText));
    if (ratioStr && RATIOS.some(r => r.id === ratioStr)) setRatio(ratioStr);
    if (modelStr && models.some(m => m.name === modelStr || m.id === modelStr)) {
      const match = models.find(m => m.name === modelStr || m.id === modelStr);
      if (match) setModelId(match.id);
    }
    setLightboxItem(null);
    flash('info', 'Loaded prompt and settings into generator! ', 2500);
  };

  // ---- Photo → Prompt (vision) Unlimited Upload & Analysis ----
  const runP2pAnalysis = async (urls: string[]) => {
    if (urls.length === 0) return;
    setP2pPrompt('');
    setP2pBusy(true);
    try {
      const res = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: urls[0], images: urls, targetEngine: 'flux', language: 'en' })
      });
      const data = await res.json();
      const a = data?.analysis;
      setP2pPrompt(cleanForImage(a?.masterPrompt || a?.fluxPrompt || a?.midjourneyPrompt || ''));
      if (data?.warning) flash('warn', 'Vision AI key not set — showing a generic result. Add GEMINI_API_KEY for real analysis.', 7000);
    } catch {
      flash('error', 'Could not analyze the image(s).');
    } finally {
      setP2pBusy(false);
    }
  };

  const analyzeFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      flash('error', 'Please upload valid image file(s).');
      return;
    }
    const loaded = (await Promise.all(
      files.map((file, idx) =>
        new Promise<UploadedRefPhoto | null>(resolve => {
          const reader = new FileReader();
          reader.onload = e => {
            const dataUrl = e.target?.result as string;
            resolve(
              dataUrl
                ? {
                    id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
                    url: dataUrl,
                    name: file.name || `Photo ${idx + 1}`
                  }
                : null
            );
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        })
      )
    )).filter(Boolean) as UploadedRefPhoto[];

    if (loaded.length > 0) {
      const combined = [...p2pImages, ...loaded];
      setP2pImages(combined);
      setP2pActiveId(loaded[loaded.length - 1].id);
      await runP2pAnalysis(loaded.map(x => x.url));
    }
  };

  const noticeStyles = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
    warn: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    error: 'bg-red-500/10 border-red-500/30 text-red-200'
  } as const;

  const canGenerate = (prompt.trim().length > 0 || uploadedRefImages.length > 0) && !isGenerating;

  // Filtered Library Items
  const filteredLibrary = libraryItems.filter(item => {
    if (activeFolderFilter === 'favorites') {
      if (!item.favorite) return false;
    } else if (activeFolderFilter !== 'all') {
      if (item.folder !== activeFolderFilter) return false;
    }
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      return (
        item.prompt.toLowerCase().includes(q) ||
        item.provider.toLowerCase().includes(q) ||
        item.folder.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#0a0b0e] text-zinc-100 font-sans overflow-x-hidden selection:bg-pink-500/30">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-30 bg-[#0a0b0e]/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2.5">
          {/* Left Corner: Clean Logo (No white border) & Brand Text */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="SHOW AI Logo"
                className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(5,177,135,0.45)]"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                  SHOW AI
                </span>
                <span className="text-pink-400 text-xs font-semibold shrink-0">·</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-300 truncate">
                  Photo Studio
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5 leading-none hidden xs:inline">
                PROMPT SUITE v2.5
              </span>
            </div>
          </div>

          {/* Right Corner: Quick Action Buttons & Navigation Menu Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Back to Menu Button */}
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Back to Main Menu"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Menu</span>
              </button>
            )}

            {/* Direct Sign In / Login Button for Guests */}
            {!SupabaseService.getSession() ? (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-supabase-auth'))}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-black text-xs cursor-pointer shadow-sm hover:brightness-105 transition-all"
                title="Sign in / Register"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-supabase-cloud', { detail: { tab: 'topup' } }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-bold text-xs cursor-pointer transition-all shadow-xs active:scale-95"
                title="Credit Store: Buy Credits & Claim Daily 250 Free Credits"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{userCredits.toLocaleString()} Credits</span>
                <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-extrabold px-1.5 py-0.5 rounded-full shadow leading-none">
                  +Top-Up
                </span>
              </button>
            )}

            {/* 📱 Mobile Menu Bar Button (Go to any session and output) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🧭 FULL NAVIGATION DRAWER (Go to any session, outputs, library, and back to menu) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-w-sm h-full bg-[#11131a] border-l border-zinc-800 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/logo.png" alt="SHOW AI Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">SHOW AI Studio</h3>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">Navigation Menu</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SECTION 1: ALL STUDIO SESSIONS */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  Studio Sessions
                </p>

                {/* Back to Main Menu / 3 Sections Hub */}
                {onBackToPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onBackToPortal();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Back to Menu (3 Sections)
                        </p>
                        <p className="text-[10px] text-zinc-500">Return to Portal Hub</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </button>
                )}

                {/* Video Prompt Studio */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateView?.('video-prompt-studio');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                        Video Prompt Studio
                      </p>
                      <p className="text-[10px] text-zinc-500">Kling, Runway Gen-3, Luma & Sora</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </button>

                {/* Detail Burmese Studio */}
                {onBackToMatrix && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onBackToMatrix();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Detail Burmese Studio
                        </p>
                        <p className="text-[10px] text-zinc-500">Cultural Prompt Matrix</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </button>
                )}

                {/* Current Active Studio indicator */}
                <div className="w-full flex items-center justify-between p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pink-200">
                        Photo Prompt Studio (Active)
                      </p>
                      <p className="text-[10px] text-pink-400/80">Photorealistic Image Generator</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-[9px] font-mono font-bold text-pink-300">
                    HERE
                  </span>
                </div>
              </div>

              {/* SECTION 2: OUTPUTS & PHOTO TOOLS */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                  Outputs & Tools
                </p>

                {/* Go to Live Outputs */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveMainTab('current');
                    setMobileTab('outputs');
                    setTimeout(() => {
                      document.getElementById('photo-studio-outputs')?.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold text-zinc-200">Go to Live Outputs</span>
                  </div>
                  {results.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-[10px] text-pink-300 font-mono">
                      {results.length} photos
                    </span>
                  )}
                </button>

                {/* Go to Studio Library */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveMainTab('library');
                    setMobileTab('library');
                    setTimeout(() => {
                      document.getElementById('photo-studio-outputs')?.scrollIntoView({ behavior: 'smooth' });
                    }, 120);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-zinc-200">Go to Studio Library</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                    {libraryItems.length} items
                  </span>
                </button>

                {/* Photo to Prompt Vision Tool */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setP2pOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold text-zinc-200">Photo to Prompt (Vision AI)</span>
                  </div>
                  <span className="text-[10px] text-pink-400 font-mono font-semibold">Open</span>
                </button>
              </div>

              {/* Cloud & Device Storage Info */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2.5 text-xs text-zinc-400">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-tight">All photos save directly to your device and Supabase Cloud.</span>
              </div>
            </div>

            {/* Drawer Bottom Footer: Account / Sign In */}
            <div className="pt-4 border-t border-zinc-800/80">
              {!SupabaseService.getSession() ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('open-supabase-auth'));
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Sign In / Create Account</span>
                </button>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300 truncate">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{SupabaseService.getSession()?.user?.email || 'Logged in'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] text-emerald-300 font-mono">
                    ONLINE
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== BODY ========== */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-8 grid grid-cols-1 lg:grid-cols-[410px_minmax(0,1fr)] xl:grid-cols-[450px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">

        {/* ---------- LEFT: CONTROLS ---------- */}
        <section className={`space-y-4 lg:sticky lg:top-20 ${mobileTab !== 'studio' ? 'hidden lg:block' : ''}`}>

          {/* AI Model Engine Selector above Prompt Box */}
          <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl border border-zinc-800 bg-[#14161d]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 leading-tight">AI Model Engine</span>
                <span className="text-xs font-bold text-zinc-200 truncate">{selected.name}</span>
              </div>
            </div>

            <div className="relative shrink-0">
              <select
                value={modelId}
                onChange={e => setModelId(e.target.value)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 focus:outline-none focus:border-pink-500 transition-colors cursor-pointer appearance-none pr-8"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#12141c] text-zinc-200 py-1">
                    {m.name} {m.badge ? `[${m.badge}]` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Prompt input (Supports Unlimited Multi-Photo Upload & Drag-and-Drop) */}
          <div
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handlePromptImageUpload(e.dataTransfer.files);
              }
            }}
            className="rounded-2xl border border-zinc-800 bg-[#14161d] focus-within:border-pink-500/50 transition-colors overflow-hidden"
          >
            {/* Hidden file input for prompt box Unlimited Upload Image button */}
            <input
              ref={promptImageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  handlePromptImageUpload(e.target.files);
                }
                e.target.value = '';
              }}
            />

            {/* Attached Reference Photos Gallery Tray inside Prompt Box */}
            {uploadedRefImages.length > 0 && (
              <div className="mx-3 mt-3 p-3 rounded-xl bg-zinc-900/95 border border-pink-500/30 space-y-2.5">
                {/* Tray Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs font-semibold text-pink-200 truncate">
                      Reference Photos ({uploadedRefImages.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {uploadedRefImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setUseAllRefImages(v => !v)}
                        title="Toggle between using all uploaded photos or only the active selected photo"
                        className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                          useAllRefImages
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {useAllRefImages ? `Use All (${uploadedRefImages.length})` : 'Selected Only (1)'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleClearAllRefPhotos}
                      title="Remove all attached photos"
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Photo Scrollable Thumbnail Strip with Role Selectors */}
                <div className="flex items-start gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-thin">
                  {uploadedRefImages.map((img, idx) => {
                    const isSelected = activeRefPhoto?.id === img.id;
                    const role = img.role || (idx === 0 ? 'character' : idx === 1 ? 'background' : 'general');
                    const roleMeta = PHOTO_ROLES.find(r => r.id === role) || PHOTO_ROLES[0];
                    return (
                      <div
                        key={img.id}
                        className={`flex flex-col gap-1.5 shrink-0 p-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-zinc-800/80 border-pink-500/60 shadow-lg'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          onClick={() => setActiveRefId(img.id)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer border transition-all ${
                            isSelected
                              ? 'border-pink-400 ring-2 ring-pink-500/30 scale-[1.01]'
                              : 'border-zinc-700/80 hover:border-pink-500/50'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/80 text-[9px] font-mono text-zinc-200">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={e => handleRemoveRefPhoto(img.id, e)}
                            title="Remove this photo"
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-red-500 text-zinc-200 hover:text-white flex items-center justify-center transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Role Selector Dropdown */}
                        <div className="w-20">
                          <select
                            value={role}
                            onChange={e => handleUpdateRefPhotoRole(img.id, e.target.value as PhotoRole)}
                            className="w-full text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-700 hover:border-pink-500/60 text-pink-300 rounded px-1 py-1 focus:outline-none cursor-pointer truncate"
                            title={roleMeta.desc}
                          >
                            {PHOTO_ROLES.map(r => (
                              <option key={r.id} value={r.id} className="bg-zinc-900 text-zinc-200 text-xs">
                                {r.short}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {/* + Add More Unlimited Photos Tile */}
                  <button
                    type="button"
                    onClick={() => promptImageInputRef.current?.click()}
                    title="Upload more photos (Unlimited)"
                    className="w-20 h-28 rounded-xl border-2 border-dashed border-zinc-700 hover:border-pink-400/70 bg-zinc-950/60 hover:bg-pink-500/10 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-pink-300 shrink-0 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-pink-400" />
                    <span className="text-[10px] font-semibold leading-tight text-center">+ Add Photo</span>
                  </button>
                </div>



                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="truncate">
                    {useAllRefImages && uploadedRefImages.length > 1
                      ? `All ${uploadedRefImages.length} photos active for Multi-Image Role Compositing`
                      : `Active focus: ${activeRefPhoto?.name || 'Photo #1'} (Click any thumbnail to switch)`}
                  </span>
                </div>
              </div>
            )}

            {/* Detail Burmese Studio Options Tray */}
            {chosenBurmeseOptions.length > 0 && (
              <div className="mx-3 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-amber-400">tune</span>
                    <span className="text-xs font-bold text-amber-200">
                      Burmese Studio Chosen Options ({chosenBurmeseOptions.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChosenBurmeseOptions([])}
                    className="text-[10px] text-zinc-400 hover:text-red-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                    title="Dismiss options banner"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {chosenBurmeseOptions.map((opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-amber-500/25 text-[11px] text-zinc-200 shadow-2xs"
                    >
                      {opt.emoji && <span className="text-xs">{opt.emoji}</span>}
                      <strong className="text-amber-300 font-semibold">{opt.label}:</strong>
                      <span>{opt.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onPaste={e => {
                const pasted = e.clipboardData.getData('text');
                if (pasted && (/\[(Subject|Action|Environment|Cinematography|Lighting|Style|Technical|Subjec)/i.test(pasted) || pasted.includes('t]:') || pasted.includes('[Subject]'))) {
                  e.preventDefault();
                  const sanitized = cleanForImage(pasted);
                  const target = e.currentTarget;
                  const start = target.selectionStart || 0;
                  const end = target.selectionEnd || 0;
                  const nextVal = prompt.slice(0, start) + sanitized + prompt.slice(end);
                  setPrompt(cleanForImage(nextVal));
                  flash('info', 'Sanitized OpenArt tags into clean prompt.', 2500);
                }
              }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder={
                uploadedRefImages.length > 0
                  ? `Add custom prompt instructions for your attached reference photo(s), or click Enhance / Generate…`
                  : "Describe the photo you want to create, or attach reference images…"
              }
              rows={4}
              maxLength={1500}
              className="w-full bg-transparent px-4 pt-3.5 text-sm placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between gap-2 px-3 pb-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={(!prompt.trim() && uploadedRefImages.length === 0) || isEnhancing || isExtractingRef}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-pink-500/20 hover:text-pink-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-inherit text-xs font-medium transition-colors"
                >
                  {isEnhancing || isExtractingRef ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Enhance
                </button>

                {/* OpenArt Bracket Cleaner Button */}
                {Boolean(prompt && (/\[(Subject|Action|Environment|Cinematography|Lighting|Style|Technical|Subjec)/i.test(prompt) || prompt.includes('[') || prompt.includes('t]:'))) && (
                  <button
                    type="button"
                    title="Clean OpenArt bracket tags and duplicate sentences"
                    onClick={() => {
                      const cleaned = cleanForImage(prompt);
                      setPrompt(cleaned);
                      flash('info', 'Cleaned prompt into natural photography prose.', 2500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Clean Tags
                  </button>
                )}

                {/* Unlimited Upload Image Button right beside Enhance button */}
                <button
                  type="button"
                  onClick={() => promptImageInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    uploadedRefImages.length > 0
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-200 hover:bg-pink-500/30'
                      : 'bg-zinc-800 border-zinc-700/80 hover:bg-pink-500/20 hover:border-pink-500/40 hover:text-pink-300 text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-pink-400" />
                  <span>
                    {uploadedRefImages.length > 0
                      ? `+ Upload More (${uploadedRefImages.length})`
                      : 'Upload Image'}
                  </span>
                </button>

                {prompt && (
                  <>
                    <button
                      type="button"
                      title="Copy prompt"
                      onClick={() => { copyText(prompt); setPromptCopied(true); setTimeout(() => setPromptCopied(false), 1500); }}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      {promptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      title="Clear"
                      onClick={() => setPrompt('')}
                      className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              <span className="text-[11px] font-mono text-zinc-600">{prompt.length}/1500</span>
            </div>
          </div>


          {/* Aspect ratio with Option Box (Hidden on mobile, visible on desktop web app) */}
          <div className="hidden lg:block rounded-xl border border-zinc-800/80 bg-[#12141c] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Aspect Ratio
              </label>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-300">
                {activeRatioObj.res}
              </span>
            </div>

            {/* Option Box (Select Dropdown) */}
            <div className="relative">
              <select
                value={ratio}
                onChange={e => changeRatio(e.target.value)}
                className="w-full bg-[#161822] hover:bg-[#1a1d2b] text-zinc-200 text-xs px-3 py-2.5 rounded-xl border border-zinc-700/80 focus:outline-none focus:border-pink-500 transition-colors font-medium cursor-pointer appearance-none pr-9"
              >
                {RATIOS.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#12141c] text-zinc-200 py-1">
                    {r.label} — {r.res} ({r.desc})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Option Pills */}
            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {RATIOS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => changeRatio(r.id)}
                  title={`${r.label} (${r.res})`}
                  className={`flex flex-col items-center gap-1 py-1.5 px-0.5 rounded-lg border text-[10px] transition-all ${
                    ratio === r.id
                      ? 'bg-pink-500/20 border-pink-500 text-pink-200 font-bold shadow-sm shadow-pink-500/20'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className={`${r.box} rounded-[2px] border ${ratio === r.id ? 'border-pink-400 bg-pink-500/30' : 'border-zinc-600'}`} />
                  <span className="font-mono text-[9px] truncate max-w-full">{r.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Resolution Option Box */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#12141c] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Photo Resolution
              </label>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-[10px] font-mono text-pink-300 font-semibold">
                <span>{resolutionTier.toUpperCase()}</span>
                <span className="text-pink-500/50">•</span>
                <span>{currentResString}</span>
              </div>
            </div>

            {/* Resolution Option Dropdown */}
            <div className="relative">
              <select
                value={resolutionTier}
                onChange={e => changeResolutionTier(e.target.value as ResolutionTier)}
                className="w-full bg-[#161822] hover:bg-[#1a1d2b] text-zinc-200 text-xs px-3 py-2.5 rounded-xl border border-zinc-700/80 focus:outline-none focus:border-pink-500 transition-colors font-medium cursor-pointer appearance-none pr-9"
              >
                {RESOLUTION_TIERS.map(t => {
                  const dims = (RESOLUTION_MAP[ratio] && RESOLUTION_MAP[ratio][t.id]) || '';
                  const rate = TIER_CREDIT_RATES[t.id] || 5;
                  return (
                    <option key={t.id} value={t.id} className="bg-[#12141c] text-zinc-200 py-1">
                      {t.label} ({rate} cr/photo) — {dims} px ({t.desc})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Resolution Pills */}
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {RESOLUTION_TIERS.map(t => {
                const dims = (RESOLUTION_MAP[ratio] && RESOLUTION_MAP[ratio][t.id]) || '';
                const active = resolutionTier === t.id;
                const rate = TIER_CREDIT_RATES[t.id] || 5;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => changeResolutionTier(t.id)}
                    title={`${t.label}: ${dims} px (${t.desc}) — ${rate} Credits per photo`}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      active
                        ? 'bg-pink-500/20 border-pink-500 text-pink-200 font-bold shadow-sm shadow-pink-500/20'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold flex items-center gap-0.5">
                      <span>{t.id.toUpperCase()}</span>
                      <span className="text-[9px] text-amber-400 font-normal">({rate}c)</span>
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400 leading-none">{dims.split(' ')[0]}p</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count (+, - max 6) + 8K Auto-polish */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-zinc-800/80 bg-[#12141c] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Image Count
                </label>
                <span className="text-[10px] font-mono text-pink-300 font-semibold">Max 6</span>
              </div>
              <div className="flex items-center justify-between bg-[#161822] rounded-xl border border-zinc-700/80 p-1">
                <button
                  type="button"
                  onClick={() => setCount(c => Math.max(1, c - 1))}
                  disabled={count <= 1}
                  title="Decrease image count"
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white flex items-center justify-center transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-baseline gap-1 font-mono font-bold">
                  <span className="text-base text-pink-300">{count}</span>
                  <span className="text-xs text-zinc-500">/ 6</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCount(c => Math.min(6, c + 1))}
                  disabled={count >= 6}
                  title="Increase image count (max 6)"
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-zinc-800 text-white flex items-center justify-center transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-[#12141c] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  8K Auto-polish
                </label>
                <span className="text-[10px] font-mono text-zinc-500">{polish ? 'Active' : 'Off'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPolish(p => !p)}
                className={`w-full h-10 flex items-center justify-between px-3 rounded-xl border text-xs transition-colors ${
                  polish ? 'bg-pink-500/10 border-pink-500/40 text-pink-200' : 'bg-[#161822] border-zinc-700/80 text-zinc-400'
                }`}
              >
                <span className="font-medium">{polish ? 'Enhanced' : 'Raw'}</span>
                <span className={`w-8 h-4 rounded-full p-0.5 transition-colors ${polish ? 'bg-pink-500' : 'bg-zinc-700'}`}>
                  <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${polish ? 'translate-x-4' : ''}`} />
                </span>
              </button>
            </div>
          </div>

          {/* Desktop generate with aspect ratio and resolution inside button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="hidden lg:flex w-full items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-[0.99]"
          >
            {isGenerating ? (
              <div className="w-full flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing {count} Photo{count > 1 ? 's' : ''}…</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-200" />
                  <span>Generate {count} Photo{count > 1 ? 's' : ''}</span>
                  <span className="text-amber-300 font-mono text-xs">({currentCreditCost} Credits)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/35 border border-white/15 text-[11px] font-mono text-pink-100 font-semibold shadow-inner">
                  <span>{activeRatioObj.id}</span>
                  <span className="text-white/40">•</span>
                  <span>{resolutionTier.toUpperCase()}</span>
                  <span className="text-white/40">•</span>
                  <span>{currentResString}</span>
                </div>
              </>
            )}
          </button>
        </section>

        {/* ---------- RIGHT: RESULTS & INTEGRATED LIBRARY ---------- */}
        <section
          id="photo-studio-outputs"
          className={`min-w-0 space-y-4 pt-4 lg:pt-0 ${mobileTab === 'studio' ? 'hidden lg:block' : ''}`}
        >
          {/* Mobile Back to Prompt Studio Navigation */}
          <div className="flex lg:hidden items-center justify-between p-2.5 rounded-2xl bg-[#12141c] border border-zinc-800">
            <button
              type="button"
              onClick={() => setMobileTab('studio')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 text-xs font-bold border border-pink-500/30 transition-colors cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Prompt Studio</span>
            </button>
            <span className="text-[11px] font-semibold text-zinc-400 font-mono">
              {activeMainTab === 'library' ? 'Studio Library' : 'Live Outputs'}
            </span>
          </div>

          {notice && (
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm ${noticeStyles[notice.type]}`}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="flex-1">{notice.text}</span>
              <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Studio Section Tabs (Hidden on mobile version; all buttons & tags moved inside Menu Bar) */}
          <div className="hidden lg:flex items-center justify-between border-b border-zinc-800/80 pb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('current');
                  setMobileTab('outputs');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeMainTab === 'current'
                    ? 'bg-zinc-800 text-pink-300 border border-pink-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-4 h-4 text-pink-400" />
                <span>Live Outputs</span>
                {results.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-[10px] text-pink-300 font-mono">
                    {results.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('library');
                  setMobileTab('library');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeMainTab === 'library'
                    ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>Studio Library</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                  {libraryItems.length}
                </span>
              </button>

              {/* 🎨 Photo to Prompt Session Button (Moved right beside Outputs & Library) */}
              <button
                type="button"
                onClick={() => setP2pOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                title="Photo to Prompt Vision Session"
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Photo to Prompt</span>
              </button>

              {/* 🏠 Back to Menu Quick Button */}
              {onBackToPortal && (
                <button
                  type="button"
                  onClick={onBackToPortal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  title="Back to Menu / 3 Sections Hub"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Back to Menu</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Cloud Sync Status / Button */}
              {SupabaseService.getSession()?.user ? (
                <button
                  type="button"
                  onClick={() => syncWithSupabaseCloud(true)}
                  disabled={isCloudSyncing}
                  title="Supabase Cloud တွင် သိမ်းထားသော ဓာတ်ပုံများနှင့် ပြန်လည်ချိန်ညှိရန်"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-pulse text-amber-400' : 'text-emerald-400'}`} />
                  <span className="hidden sm:inline">{isCloudSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
                  <RefreshCw className={`w-3 h-3 text-emerald-400/80 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                </button>
              ) : (
                <div
                  title="ဓာတ်ပုံများကို အကောင့်ထဲတွင် အမြဲသိမ်းဆည်းထားနိုင်ရန် Login ဝင်ပါ"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 text-xs"
                >
                  <Cloud className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Device Storage</span>
                </div>
              )}

            </div>
          </div>

          {/* TAB 1: LIVE SESSION RESULTS */}
          {activeMainTab === 'current' && (
            <div className="space-y-4">
              {isGenerating && (
                <div className={`grid gap-3 ${count > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {Array.from({ length: count }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-zinc-900/80 border border-zinc-800 animate-pulse flex flex-col items-center justify-center p-6 gap-2"
                      style={{ aspectRatio: ratio.replace(':', ' / ') }}
                    >
                      <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                      <span className="text-xs font-mono text-zinc-400">Rendering high-res photo…</span>
                    </div>
                  ))}
                </div>
              )}

              {results.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span>Generated in this session ({results.length}):</span>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> Auto-saved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearAllResults}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 border border-zinc-700/80 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                        title="ရလဒ် ဓာတ်ပုံများအားလုံး ရှင်းလင်းရန်"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Clear Results</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadAllToDevice(results)}
                        disabled={isDownloadingAll || results.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="လက်ရှိ ဓာတ်ပုံအားလုံးကို မိမိကွန်ပျူတာ/ဖုန်းထဲသို့ ဒေါင်းလုဒ်သိမ်းဆည်းရန်"
                      >
                        {isDownloadingAll ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span>{isDownloadingAll ? 'စက်ထဲသိမ်းဆည်းနေပါသည်…' : 'မိမိစက်ထဲသို့ အားလုံးသိမ်းမည်'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {results.map(img => {
                      const libItem = libraryItems.find(x => x.id === img.id);
                      const isFav = libItem?.favorite;
                      return (
                        <div
                          key={img.id}
                          className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 transition-all flex flex-col shadow-lg"
                        >
                          <div
                            className="relative w-full cursor-pointer bg-black/40 overflow-hidden"
                            style={{ aspectRatio: img.ratio.replace(':', ' / ') }}
                            onClick={() => {
                              const match = libraryItems.find(l => l.id === img.id) || {
                                id: img.id,
                                url: img.url,
                                prompt: img.prompt,
                                provider: img.provider,
                                ratio: img.ratio,
                                folder: targetFolder,
                                createdAt: Date.now()
                              };
                              setLightboxItem(match);
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.prompt}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-none">
                              <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-200 truncate">
                                {img.ratio}
                              </span>
                              <div className="flex items-center gap-1.5 pointer-events-auto">
                                <button
                                  type="button"
                                  onClick={e => handleToggleFavorite(img.id, e)}
                                  title={isFav ? "Favorited" : "Add to favorites"}
                                  className={`p-1.5 rounded-full backdrop-blur-md border transition-colors ${
                                    isFav
                                      ? 'bg-amber-500/30 border-amber-500/60 text-amber-300'
                                      : 'bg-black/60 border-white/10 text-zinc-400 hover:text-amber-300'
                                  }`}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={e => handleRemoveResultPhoto(img.id, e)}
                                  title="Remove photo you don't like / မကြိုက်သော ဓာတ်ပုံဖျက်မည်"
                                  className="p-1.5 rounded-full backdrop-blur-md border border-white/10 bg-black/70 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/70 transition-colors shadow-xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Bottom Action overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-mono text-pink-300 truncate font-semibold">
                                {img.provider}
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  title="Copy Prompt"
                                  onClick={e => { e.stopPropagation(); copyText(img.prompt); }}
                                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-pink-500 text-white flex items-center justify-center transition-colors"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Download Image"
                                  onClick={e => { e.stopPropagation(); downloadImage(img.url, img.id); }}
                                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-pink-500 text-white flex items-center justify-center transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="View Lightbox"
                                  onClick={e => {
                                    e.stopPropagation();
                                    const match = libraryItems.find(l => l.id === img.id) || {
                                      id: img.id,
                                      url: img.url,
                                      prompt: img.prompt,
                                      provider: img.provider,
                                      ratio: img.ratio,
                                      folder: targetFolder,
                                      createdAt: Date.now()
                                    };
                                    setLightboxItem(match);
                                  }}
                                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-pink-500 text-white flex items-center justify-center transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Remove photo / ဓာတ်ပုံဖျက်မည်"
                                  onClick={e => handleRemoveResultPhoto(img.id, e)}
                                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Prompt snippet */}
                          <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800/80 flex flex-col justify-between gap-1.5">
                            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                              {img.prompt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                              <div className="flex items-center gap-2">
                                <span>Ratio: {img.ratio}</span>
                                <button
                                  type="button"
                                  onClick={e => handleRemoveResultPhoto(img.id, e)}
                                  className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Remove this photo"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-400/80" />
                                  <span>Remove</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleUsePrompt(img.prompt, img.ratio, img.provider)}
                                className="text-pink-400 hover:text-pink-300 hover:underline"
                              >
                                Re-use prompt →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Switch to full library view shortcut */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Cloud className="w-4 h-4 text-emerald-400" />
                      <span>All generations are saved directly to your <b>Device & Supabase Cloud</b>.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMainTab('library');
                        setMobileTab('library');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Library ({libraryItems.length})</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ) : !isGenerating && (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#0e1015] min-h-[320px] lg:min-h-[460px] flex flex-col items-center justify-center text-center p-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-pink-400" />
                  </div>
                  <h2 className="font-bold text-base">Your generated photos will appear here</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
                    Write a prompt, select your preferred engine and aspect ratio, then click Generate.
                    Images save directly to your own device storage and Supabase Cloud.
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                    {libraryItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleRestoreRecentPhotos}
                        className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-xs font-semibold text-pink-200 border border-pink-500/40 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                        <span>မကြာသေးမီက ထုတ်ထားသော ဓာတ်ပုံများ ပြန်ပြရန် ({Math.min(libraryItems.length, 12)})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMainTab('library');
                        setMobileTab('library');
                      }}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-cyan-300 border border-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Browse Saved Photos ({libraryItems.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDIO LIBRARY */}
          {activeMainTab === 'library' && (
            <div className="space-y-4">
              {/* Filter Pills Bar: All Photos & Favorites */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveFolderFilter('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeFolderFilter === 'all'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>All Photos</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {libraryItems.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFolderFilter('favorites')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeFolderFilter === 'favorites'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Favorites</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {libraryItems.filter(x => x.favorite).length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-zinc-400 font-mono">Device & Cloud Storage</span>
                </div>
              </div>

              {/* Search & Stats Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#12141c] p-2.5 rounded-2xl border border-zinc-800">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={e => setLibrarySearch(e.target.value)}
                    placeholder="Search prompts, models, tags…"
                    className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-zinc-400 px-1 flex-wrap">
                  <span>Showing: <b>{filteredLibrary.length}</b> of {libraryItems.length}</span>

                  {filteredLibrary.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAllToDevice(filteredLibrary)}
                      disabled={isDownloadingAll}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 ml-1"
                      title="ရွေးချယ်ထားသော ဓာတ်ပုံများကို မိမိကွန်ပျူတာ/ဖုန်းထဲသို့ ဒေါင်းလုဒ်သိမ်းဆည်းရန်"
                    >
                      {isDownloadingAll ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>Save ({filteredLibrary.length}) to Device</span>
                    </button>
                  )}

                  {libraryItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Clear all photos in library?')) {
                          setLibraryItems([]);
                          safeSaveLibrary([]);
                          flash('info', 'Studio library cleared.');
                        }
                      }}
                      className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors ml-2"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Library Photos */}
              {filteredLibrary.length > 0 ? (
                <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredLibrary.map(item => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 transition-all flex flex-col shadow-xl"
                    >
                      {/* Image Canvas */}
                      <div
                        className="relative w-full cursor-pointer bg-black/40 overflow-hidden"
                        style={{ aspectRatio: item.ratio.replace(':', ' / ') }}
                        onClick={() => setLightboxItem(item)}
                      >
                        <img
                          src={item.url}
                          alt={item.prompt}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-200">
                            {item.ratio}
                          </span>

                          <button
                            type="button"
                            onClick={e => handleToggleFavorite(item.id, e)}
                            className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md border transition-colors ${
                              item.favorite
                                ? 'bg-amber-500/30 border-amber-500/60 text-amber-300'
                                : 'bg-black/60 border-white/10 text-zinc-400 hover:text-amber-300'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>

                        {/* Bottom Overlay Actions */}
                        <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-between gap-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-mono text-cyan-300 truncate font-semibold">
                            {item.provider}
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              title="Copy Prompt"
                              onClick={e => { e.stopPropagation(); copyText(item.prompt); }}
                              className="w-7 h-7 rounded-full bg-black/70 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Download Image"
                              onClick={e => { e.stopPropagation(); downloadImage(item.url, item.id); }}
                              className="w-7 h-7 rounded-full bg-black/70 hover:bg-cyan-500 text-white flex items-center justify-center transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete Photo"
                              onClick={e => handleDeleteLibraryItem(item.id, e)}
                              className="w-7 h-7 rounded-full bg-black/70 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content description */}
                      <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 flex flex-col justify-between gap-2">
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>{item.ratio} • {new Date(item.createdAt).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => handleUsePrompt(item.prompt, item.ratio, item.provider)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                          >
                            Use Prompt →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#0e1015] min-h-[300px] flex flex-col items-center justify-center text-center p-8 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm">
                    {librarySearch ? 'No matching creations found' : activeFolderFilter === 'favorites' ? 'No favorites saved yet' : `Folder "${activeFolderFilter}" is empty`}
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    {librarySearch
                      ? 'Try searching with a different keyword or prompt phrase.'
                      : 'Generate photos with this folder selected or move existing photos into this folder.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('current')}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold transition-colors"
                  >
                    Go to Generator
                  </button>
                </div>
              )}
            </div>
          )}

          {onSendToMatrix && (
            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => onSendToMatrix(prompt)}
                className="text-xs text-zinc-500 hover:text-pink-300 underline underline-offset-2"
              >
                Send prompt to Prompt Matrix
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ========== MOBILE STICKY GENERATE / BACK BAR ========== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {mobileTab === 'studio' ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 active:scale-[0.99]"
          >
            {isGenerating ? (
              <div className="w-full flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {count} Photo{count > 1 ? 's' : ''}…</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {count} Photo{count > 1 ? 's' : ''}</span>
                  <span className="text-amber-300 font-mono text-xs">({currentCreditCost}cr)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-[10px] font-mono text-pink-100 font-semibold">
                  <span>{activeRatioObj.id}</span>
                  <span className="text-white/40">•</span>
                  <span>{resolutionTier.toUpperCase()}</span>
                  <span className="text-white/40">•</span>
                  <span>{currentResString}</span>
                </div>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileTab('studio')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-pink-300 font-bold text-sm border border-pink-500/30 shadow-lg active:scale-[0.99] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Prompt Studio (New Photo)</span>
          </button>
        )}
      </div>

      {/* ========== FULLSCREEN LIGHTBOX & PROMPT INSPECTOR MODAL ========== */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#12141c] border border-zinc-800 shadow-2xl flex flex-col lg:flex-row overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Image Preview Canvas */}
            <div className="lg:w-3/5 bg-black/80 flex items-center justify-center p-4 relative min-h-[300px]">
              <img
                src={lightboxItem.url}
                alt={lightboxItem.prompt}
                className="max-h-[60vh] lg:max-h-[80vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-zinc-800 text-white flex items-center justify-center lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details & Action Panel */}
            <div className="lg:w-2/5 p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800/80 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold">
                    {lightboxItem.ratio} • {lightboxItem.provider}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(lightboxItem.id)}
                      className={`p-2 rounded-full border transition-colors ${
                        lightboxItem.favorite
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-amber-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${lightboxItem.favorite ? 'fill-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLightboxItem(null)}
                      className="hidden lg:flex w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prompt display */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-mono tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Generated Prompt</span>
                    <button
                      type="button"
                      onClick={() => copyText(lightboxItem.prompt)}
                      className="text-pink-400 hover:text-pink-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </label>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed max-h-48 overflow-y-auto">
                    {lightboxItem.prompt}
                  </div>
                </div>

                {/* Metadata Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">AI Engine</span>
                    <span className="text-zinc-200 font-semibold truncate block">{lightboxItem.provider}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Aspect Ratio</span>
                    <span className="text-zinc-200 font-semibold block">{lightboxItem.ratio}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 col-span-2">
                    <span className="text-[10px] text-zinc-500 block">Created Timestamp</span>
                    <span className="text-zinc-300 block">{new Date(lightboxItem.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleUsePrompt(lightboxItem.prompt, lightboxItem.ratio, lightboxItem.provider)}
                  className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-pink-500/20"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Load into Prompt Generator</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => downloadImage(lightboxItem.url, lightboxItem.id)}
                    className="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={e => handleDeleteLibraryItem(lightboxItem.id, e)}
                    className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== PHOTO → PROMPT MODAL (UNLIMITED MULTI-PHOTO UPLOAD) ========== */}
      {p2pOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4" onClick={() => setP2pOpen(false)}>
          <div
            className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#101218] border border-zinc-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#101218] z-10 flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Photo to Prompt</span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-[10px] font-mono text-pink-300">
                    Unlimited Photos
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">Vision AI reverse-engineers a master prompt from single or unlimited reference photos</p>
              </div>
              <button type="button" onClick={() => setP2pOpen(false)} className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    analyzeFiles(e.target.files);
                  }
                  e.target.value = '';
                }}
              />

              {/* Multi-Photo Strip inside Modal */}
              {p2pImages.length > 0 && (
                <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-pink-200">
                      Uploaded Photos ({p2pImages.length})
                    </span>
                    <div className="flex items-center gap-1.5">
                      {p2pImages.length > 1 && (
                        <button
                          type="button"
                          disabled={p2pBusy}
                          onClick={() => runP2pAnalysis(p2pImages.map(x => x.url))}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-200 text-[11px] font-semibold transition-colors disabled:opacity-50"
                        >
                          Analyze All ({p2pImages.length})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold transition-colors"
                      >
                        + Add More Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => { setP2pImages([]); setP2pActiveId(null); setP2pPrompt(''); }}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 text-[11px] font-semibold transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {p2pImages.map((img, idx) => {
                      const isAct = activeP2pPhoto?.id === img.id;
                      return (
                        <div
                          key={img.id}
                          onClick={() => {
                            setP2pActiveId(img.id);
                            runP2pAnalysis([img.url]);
                          }}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${
                            isAct ? 'border-pink-400 ring-2 ring-pink-500/30' : 'border-zinc-700 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/75 text-[9px] font-mono text-zinc-200">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setP2pImages(prev => {
                                const next = prev.filter(x => x.id !== img.id);
                                if (p2pActiveId === img.id) setP2pActiveId(next[0]?.id || null);
                                return next;
                              });
                            }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-red-500 text-zinc-200 flex items-center justify-center"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload / Active Preview */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      analyzeFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`relative rounded-2xl border-2 border-dashed cursor-pointer min-h-[220px] sm:min-h-[320px] flex items-center justify-center overflow-hidden transition-colors ${
                    dragOver ? 'border-pink-400 bg-pink-500/10' : 'border-zinc-700 hover:border-pink-500/60 bg-zinc-900/50'
                  }`}
                >
                  {activeP2pPhoto ? (
                    <img src={activeP2pPhoto.url} alt={activeP2pPhoto.name} className="absolute inset-0 w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-6 text-zinc-400">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                      <p className="text-sm font-medium">Drop unlimited photos or tap to upload</p>
                      <p className="text-xs text-zinc-600 mt-1">Select 1 or multiple JPG, PNG, WEBP files</p>
                    </div>
                  )}
                </div>

                {/* Output */}
                <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 flex flex-col min-h-[220px] sm:min-h-[320px]">
                  {p2pBusy ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
                      <Loader2 className="w-7 h-7 text-pink-400 animate-spin" />
                      Analyzing {p2pImages.length > 1 ? `${p2pImages.length} photos…` : 'photo…'}
                    </div>
                  ) : p2pPrompt ? (
                    <>
                      <textarea
                        value={p2pPrompt}
                        onChange={e => setP2pPrompt(e.target.value)}
                        className="flex-1 min-h-[160px] w-full bg-transparent text-xs sm:text-sm leading-relaxed focus:outline-none resize-none"
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => copyText(p2pPrompt)}
                          className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPrompt(p2pPrompt);
                            if (p2pImages.length > 0) {
                              setUploadedRefImages(prev => [...prev, ...p2pImages]);
                              setActiveRefId(p2pImages[p2pImages.length - 1].id);
                            }
                            setP2pOpen(false);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Use prompt & photos
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-sm text-zinc-600 p-4">
                      The generated prompt will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
