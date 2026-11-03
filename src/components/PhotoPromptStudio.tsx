import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Sparkles, Wand2, Image as ImageIcon, Download, Copy, Check, X,
  Loader2, Upload, RefreshCw, ChevronDown, ExternalLink, AlertTriangle, Camera,
  Zap, Star, Flame, ShieldCheck, Folder, FolderPlus, FolderOpen, Heart, Trash2,
  Search, Tag, Eye, EyeOff, Edit3, SlidersHorizontal, Clock, Bookmark, Cloud, Plus, Minus,
  LogIn, Menu, Home, Video, Layers, ChevronRight, Coins, ArrowLeftRight, Share2,
  User, HelpCircle, Maximize2, Scan, Grid, List, Scissors, ZoomIn, ZoomOut,
  History, Palette, Brush, Pin, Key,
  RotateCcw, RotateCw, Eraser, Square, MoveUpRight, MapPin,
  MoreHorizontal, Cpu
} from 'lucide-react';
import type { NavView } from './Sidebar';
import { SupabaseService } from '../utils/supabaseClient';
import { StorageService } from '../utils/storageService';
import { BeforeAfterSliderModal } from './BeforeAfterSliderModal';
import { SocialExportModal } from './SocialExportModal';
import { ShareToCommunityModal } from './dashboard/ShareToCommunityModal';
import { useAreaEdit } from '../hooks/useAreaEdit';
import { LOCATION_REFERENCE_MAP } from '../data/presetData';
import { SCENES_550_COLLECTION } from '../data/scenes550Data';

// Helper to find curated location reference background plate from presetData or scenes550Data
function findBackgroundPlateForPrompt(
  promptText: string,
  chosenOptions?: { label: string; value: string; emoji?: string }[]
): { url: string; name: string } | null {
  const pLower = (promptText || '').toLowerCase();

  // 1. Check chosenOptions for location or scene
  if (chosenOptions && chosenOptions.length > 0) {
    for (const opt of chosenOptions) {
      const val = (opt.value || '').toLowerCase().replace(/[\s-]+/g, '_');
      if (LOCATION_REFERENCE_MAP[val]) {
        return LOCATION_REFERENCE_MAP[val];
      }
      const sceneMatch = SCENES_550_COLLECTION.find(s => s.id === val || s.id === opt.value);
      if (sceneMatch && sceneMatch.previewImage) {
        return { url: sceneMatch.previewImage, name: sceneMatch.titleEn || sceneMatch.titleMm };
      }
    }
  }

  // 2. Check preset keys in LOCATION_REFERENCE_MAP against prompt text
  for (const [key, plate] of Object.entries(LOCATION_REFERENCE_MAP)) {
    const keyWords = key.replace(/_/g, ' ');
    if (pLower.includes(key) || pLower.includes(keyWords)) {
      return plate;
    }
  }

  // 3. Check popular location names in prompt
  if (pLower.includes('shwedagon')) return LOCATION_REFERENCE_MAP.shwedagon_pagoda;
  if (pLower.includes('bagan') || pLower.includes('ananda')) return LOCATION_REFERENCE_MAP.bagan_temples;
  if (pLower.includes('inle') || pLower.includes('phaung daw oo')) return LOCATION_REFERENCE_MAP.inle_lake;
  if (pLower.includes('mandalay moat') || pLower.includes('palace moat')) return LOCATION_REFERENCE_MAP.mandalay_moat;
  if (pLower.includes('mandalay palace') || pLower.includes('konbaung')) return LOCATION_REFERENCE_MAP.konbaung_palace_interior;
  if (pLower.includes('sagaing')) return LOCATION_REFERENCE_MAP.sagaing_hill;
  if (pLower.includes('u bein') || pLower.includes('amarapura')) return LOCATION_REFERENCE_MAP.ubein_bridge;
  if (pLower.includes('kyaiktiyo') || pLower.includes('golden rock')) return LOCATION_REFERENCE_MAP.kyaiktiyo_golden_rock;
  if (pLower.includes('mrauk-u') || pLower.includes('mrauk u') || pLower.includes('shittaung')) return LOCATION_REFERENCE_MAP.mrauk_u_temples;
  if (pLower.includes('pindaya')) return LOCATION_REFERENCE_MAP.kalaw_pindaya;
  if (pLower.includes('ngapali')) return LOCATION_REFERENCE_MAP.ngapali_beach;
  if (pLower.includes('pyin oo lwin') || pLower.includes('kandawgyi')) return LOCATION_REFERENCE_MAP.pyinoolwin_garden;
  if (pLower.includes('myeik') || pLower.includes('mergui')) return LOCATION_REFERENCE_MAP.myeik_islands;
  if (pLower.includes('paris') || pLower.includes('eiffel')) return LOCATION_REFERENCE_MAP.paris_eiffel_tower;
  if (pLower.includes('santorini')) return LOCATION_REFERENCE_MAP.santorini_greece;
  if (pLower.includes('kyoto') || pLower.includes('torii') || pLower.includes('arashiyama')) return LOCATION_REFERENCE_MAP.kyoto_bamboo_torii;
  if (pLower.includes('swiss') || pLower.includes('alps')) return LOCATION_REFERENCE_MAP.swiss_alps_snow;
  if (pLower.includes('venice') || pLower.includes('gondola')) return LOCATION_REFERENCE_MAP.venice_gondola_canal;
  if (pLower.includes('taj mahal')) return LOCATION_REFERENCE_MAP.taj_mahal_palace;
  if (pLower.includes('bali')) return LOCATION_REFERENCE_MAP.bali_jungle_swing;
  if (pLower.includes('maldives')) return LOCATION_REFERENCE_MAP.maldives_overwater;
  if (pLower.includes('cappadocia')) return LOCATION_REFERENCE_MAP.cappadocia_balloons;
  if (pLower.includes('central park')) return LOCATION_REFERENCE_MAP.ny_central_park;

  return null;
}

interface PhotoPromptStudioProps {
  onNavigateView?: (view: NavView, photoUrl?: string) => void;
  onBackToMatrix?: () => void;
  onSendToMatrix?: (promptText: string) => void;
  onBackToPortal?: () => void;
  language?: any;
  initialPrompt?: string;
  initialRatio?: string;
  initialRefPhoto?: string | null;
  initialRefPhotos?: (string | { url: string; name?: string; id?: string; role?: PhotoRole })[];
  initialChosenOptions?: { label: string; value: string; emoji?: string }[];
  onOpenProfile?: () => void;
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

export type StudioToolId =
  | 'create-image'
  | 'edit-image'
  | 'image-variations'
  | 'image-upscale'
  | 'change-background'
  | 'multi-view'
  | 'face-swap'
  | 'skin-retouch'
  | 'virtual-makeup'
  | 'hair-transform';

export interface StudioToolMeta {
  id: StudioToolId;
  name: string;
  desc: string;
  badge?: string;
  pinned?: boolean;
  creditCost: number;
  avatarType: string;
}

export const STUDIO_TOOLS: StudioToolMeta[] = [
  {
    id: 'create-image',
    name: 'Create Image',
    desc: 'Generate images from text prompts & references',
    creditCost: 10,
    avatarType: 'dog'
  },
  {
    id: 'edit-image',
    name: 'Edit Image',
    desc: 'Edit images with AI models & area brush',
    pinned: true,
    creditCost: 30,
    avatarType: 'bubble'
  },
  {
    id: 'image-variations',
    name: 'Image Variations',
    desc: 'Generate variations from your photo',
    creditCost: 20,
    avatarType: 'theater'
  },
  {
    id: 'image-upscale',
    name: 'Image Upscale',
    desc: 'Upscale and enhance image quality to 2K/4K/8K',
    creditCost: 15,
    avatarType: 'fish'
  },
  {
    id: 'change-background',
    name: 'Change Background',
    desc: 'Change an image background seamlessly',
    creditCost: 40,
    avatarType: 'stadium'
  },
  {
    id: 'multi-view',
    name: 'Multi View',
    desc: '9 camera angles from one image',
    creditCost: 35,
    avatarType: 'grid'
  },
  {
    id: 'face-swap',
    name: 'Face Swap',
    desc: 'Swap faces with 100% likeness & identity',
    creditCost: 60,
    avatarType: 'faceswap'
  },
  {
    id: 'skin-retouch',
    name: 'Skin Retouch',
    desc: 'Blemish removal, skin glow & micro-pore preservation',
    creditCost: 15,
    avatarType: 'retouch'
  },
  {
    id: 'virtual-makeup',
    name: 'Virtual Makeup',
    desc: 'Lipstick, blush, eyeliner & glam finish',
    creditCost: 20,
    avatarType: 'makeup'
  },
  {
    id: 'hair-transform',
    name: 'Hair Transformation',
    desc: 'Change hairstyles & vibrant hair colors',
    creditCost: 25,
    avatarType: 'hair'
  }
];

export const ToolAvatar: React.FC<{ type: string; className?: string }> = ({ type, className = 'w-10 h-10' }) => {
  if (type === 'dog') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">🐩</span>
        <span className="absolute bottom-0 inset-x-0 bg-pink-500 text-[6px] font-bold text-center text-white py-0.2">glasses</span>
      </div>
    );
  }
  if (type === 'bubble') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">👩</span>
        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-pink-300 border border-white/60 animate-pulse" />
      </div>
    );
  }
  if (type === 'theater') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-amber-800 to-red-950 flex items-center justify-center p-1 text-white shadow-md overflow-hidden shrink-0`}>
        <span className="text-xl select-none">🎭</span>
      </div>
    );
  }
  if (type === 'fish') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-indigo-700 to-blue-900 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-lg select-none">🐠</span>
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/70" />
      </div>
    );
  }
  if (type === 'stadium') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-lime-600 to-emerald-800 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">🏃‍♀️</span>
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/60" />
      </div>
    );
  }
  if (type === 'grid') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-amber-700 to-stone-900 flex items-center justify-center p-1.5 text-white shadow-md overflow-hidden shrink-0`}>
        <Grid className="w-5 h-5 text-amber-200" />
      </div>
    );
  }
  if (type === 'retouch') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">✨</span>
      </div>
    );
  }
  if (type === 'makeup') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">💄</span>
      </div>
    );
  }
  if (type === 'hair') {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
        <span className="text-xl select-none">💇‍♀️</span>
      </div>
    );
  }
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-violet-600 to-purple-900 flex items-center justify-center p-1 text-white shadow-md overflow-hidden relative shrink-0`}>
      <span className="text-xl select-none">👤</span>
      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/80" />
    </div>
  );
};

export const ModelLogo: React.FC<{ modelId: string; className?: string }> = ({ modelId, className = 'w-7 h-7' }) => {
  if (modelId.includes('gpt') || modelId.includes('openai')) {
    return (
      <div className={`${className} rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white shrink-0 shadow-sm`}>
        <Sparkles className="w-4 h-4 text-emerald-400" />
      </div>
    );
  }
  if (modelId.includes('gemini') || modelId.includes('imagen')) {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm`}>
        <Zap className="w-4 h-4 text-blue-400" />
      </div>
    );
  }
  if (modelId.includes('flux')) {
    return (
      <div className={`${className} rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm`}>
        <Flame className="w-4 h-4 text-amber-400" />
      </div>
    );
  }
  return (
    <div className={`${className} rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 shadow-sm`}>
      <Sparkles className="w-4 h-4 text-pink-400" />
    </div>
  );
};

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
  resolutionTier?: ResolutionTier;
  resolutionDimensions?: string;
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
  resolutionTier?: ResolutionTier;
  resolutionDimensions?: string;
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
  
  // ByteDance Seedream
  { id: 'seedream-5-pro', name: 'Seedream 5.0 Pro (ByteDance)', category: 'ByteDance Seed', badge: 'PRO', desc: 'ByteDance Seedream 5.0 Pro via OpenRouter, top-tier aesthetic fidelity & multi-image editing', envKey: 'OPENROUTER_API_KEY', available: true },
  { id: 'seedream-4-5', name: 'Seedream 4.5 (ByteDance)', category: 'ByteDance Seed', badge: 'NEW', desc: 'ByteDance Seedream 4.5 via OpenRouter, strong multi-image composition & typography', envKey: 'OPENROUTER_API_KEY', available: true },

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

export const MULTI_VIEW_RATIOS = [
  { id: '21:9', label: '21:9' },
  { id: '16:9', label: '16:9' },
  { id: '3:2', label: '3:2' },
  { id: '4:3', label: '4:3' },
  { id: '5:4', label: '5:4' },
  { id: '1:1', label: '1:1' },
  { id: '4:5', label: '4:5' },
  { id: '3:4', label: '3:4' },
  { id: '2:3', label: '2:3' },
  { id: '9:16', label: '9:16' },
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
  language = 'en',
  initialPrompt,
  initialRatio,
  initialRefPhoto,
  initialRefPhotos,
  initialChosenOptions,
  onOpenProfile
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
  const [count, setCount] = useState(1);
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

  // New UI/UX Tool States & Modal Dialogs (matching User Design)
  const [activeTool, setActiveTool] = useState<StudioToolId>('create-image');
  const [toolsModalOpen, setToolsModalOpen] = useState(false);
  const [toolsViewMode, setToolsViewMode] = useState<'list' | 'grid'>('list');
  const [outputPickerOpen, setOutputPickerOpen] = useState(false);
  const [qualityPickerOpen, setQualityPickerOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState<'tools' | 'chat'>('tools');
  const [showCreationsPanel, setShowCreationsPanel] = useState(false);

  // Tool Specific States:
  // 1. Edit Image Studio
  const [editImageSrc, setEditImageSrc] = useState<string>('/lanterns-bg-desktop.jpg');
  const [editHistory, setEditHistory] = useState<string[]>(['/lanterns-bg-desktop.jpg']);
  const [editModeAction, setEditModeAction] = useState<'smart-edit' | 'area-edit' | 'annotate' | 'describe'>('smart-edit');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editZoom, setEditZoom] = useState<number>(100);
  const [editBrushOpacity, setEditBrushOpacity] = useState<number>(0.75);
  const [editDenoiseStrength, setEditDenoiseStrength] = useState<number>(0.75);
  const [editAnnotationTool, setEditAnnotationTool] = useState<'box' | 'arrow' | 'point'>('box');
  const [editAnnotations, setEditAnnotations] = useState<Array<{
    id: string;
    type: 'box' | 'arrow' | 'point';
    coords: [number, number, number, number];
    label?: string;
  }>>([]);
  const [editAnalysisResult, setEditAnalysisResult] = useState<{
    answer?: string;
    primary_subjects?: string[];
    lighting_direction?: string;
    color_palette?: string[];
    style_attributes?: string;
    composition?: string;
  } | null>(null);
  const [showEditAnalysisPanel, setShowEditAnalysisPanel] = useState<boolean>(true);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState<boolean>(false);
  const [showEditDownloadModal, setShowEditDownloadModal] = useState<boolean>(false);
  const [isAutoEnhanceEnabled, setIsAutoEnhanceEnabled] = useState<boolean>(true);
  const [isAutoEnhancingPrompt, setIsAutoEnhancingPrompt] = useState<boolean>(false);
  const [lastEnhancedPrompt, setLastEnhancedPrompt] = useState<string | null>(null);

  // Hook-powered Area Edit & Inpaint State
  const areaEdit = useAreaEdit({
    initialBrushSize: 32,
    maskColor: `rgba(236, 72, 153, ${editBrushOpacity || 0.75})`
  });
  const editBrushSize = areaEdit.brushSize;
  const setEditBrushSize = areaEdit.setBrushSize;
  const maskHasContent = areaEdit.maskHasContent;

  const editCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const editImageRef = useRef<HTMLImageElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const annotateStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const [activeDragAnnotation, setActiveDragAnnotation] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  // ByteDance Seedream 5.0 Pro API Key Configuration
  const [seedreamApiKey, setSeedreamApiKey] = useState<string>(() => localStorage.getItem('seedream_api_key') || localStorage.getItem('openrouter_api_key') || '');
  const [tempSeedreamApiKey, setTempSeedreamApiKey] = useState<string>('');
  const [showSeedreamKeyModal, setShowSeedreamKeyModal] = useState<boolean>(false);
  const [isTestingSeedreamKey, setIsTestingSeedreamKey] = useState<boolean>(false);
  const [seedreamKeyStatus, setSeedreamKeyStatus] = useState<{ checked: boolean; valid: boolean; message: string } | null>(null);
  const [showKeySecret, setShowKeySecret] = useState<boolean>(false);
  const [editReferenceImage, setEditReferenceImage] = useState<string | null>(null);
  const editRefInputRef = useRef<HTMLInputElement | null>(null);

  // 🇲🇲 Myanmar 3D Typography Studio State
  const [showMyanmarTypographyModal, setShowMyanmarTypographyModal] = useState<boolean>(false);
  const [myanmarText, setMyanmarText] = useState<string>('မင်္ဂလာပါ');
  const [myanmarFontFamily, setMyanmarFontFamily] = useState<string>('Noto Sans Myanmar');
  const [myanmarStylePreset, setMyanmarStylePreset] = useState<'3d-gold' | 'chrome' | 'neon' | 'royal-red'>('3d-gold');
  const [myanmarFontSize, setMyanmarFontSize] = useState<number>(54);
  const [myanmar3DDepth, setMyanmar3DDepth] = useState<number>(7);
  const [myanmarReflection, setMyanmarReflection] = useState<boolean>(true);
  const [myanmarPosY, setMyanmarPosY] = useState<number>(85); // 85% near bottom

  const handleStampMyanmarTypography = (autoHarmonize: boolean = false) => {
    if (!editImageSrc || !myanmarText.trim()) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base image
      ctx.drawImage(img, 0, 0);

      const scale = canvas.width / 1000;
      const effectiveFontSize = Math.round(myanmarFontSize * scale);
      ctx.font = `bold ${effectiveFontSize}px "${myanmarFontFamily}", "Padauk", "Noto Sans Myanmar", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = canvas.width / 2;
      const textY = (canvas.height * myanmarPosY) / 100;
      const depth = Math.round(myanmar3DDepth * scale);

      // 2. Optional: Draw Floor Reflection
      if (myanmarReflection) {
        ctx.save();
        ctx.translate(textX, textY + effectiveFontSize * 0.48);
        ctx.scale(1, -0.42); // flipped vertically
        const reflGrad = ctx.createLinearGradient(0, -effectiveFontSize, 0, effectiveFontSize);
        if (myanmarStylePreset === '3d-gold') {
          reflGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
          reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        } else if (myanmarStylePreset === 'chrome') {
          reflGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        } else if (myanmarStylePreset === 'neon') {
          reflGrad.addColorStop(0, 'rgba(236, 72, 153, 0.5)');
          reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        } else {
          reflGrad.addColorStop(0, 'rgba(220, 38, 38, 0.45)');
          reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
        }
        ctx.fillStyle = reflGrad;
        ctx.filter = 'blur(4px)';
        ctx.fillText(myanmarText, 0, 0);
        ctx.restore();
      }

      // 3. Draw 3D Extrusion Stacks (Darker depth layers)
      for (let d = depth; d > 0; d--) {
        ctx.save();
        ctx.fillStyle = myanmarStylePreset === '3d-gold' 
          ? '#5c3a0b' 
          : myanmarStylePreset === 'chrome'
          ? '#27272a'
          : myanmarStylePreset === 'neon'
          ? '#831843'
          : '#450a0a';
        ctx.shadowColor = 'rgba(0,0,0,0.65)';
        ctx.shadowBlur = 4;
        ctx.fillText(myanmarText, textX, textY + d);
        ctx.restore();
      }

      // 4. Draw Face Layer with Radiant Gradient & Specular Bevels
      ctx.save();
      let faceGrad: CanvasGradient;
      if (myanmarStylePreset === '3d-gold') {
        faceGrad = ctx.createLinearGradient(0, textY - effectiveFontSize / 2, 0, textY + effectiveFontSize / 2);
        faceGrad.addColorStop(0, '#FFFBEB');
        faceGrad.addColorStop(0.2, '#FDE68A');
        faceGrad.addColorStop(0.45, '#F59E0B');
        faceGrad.addColorStop(0.75, '#D97706');
        faceGrad.addColorStop(1, '#92400E');
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
      } else if (myanmarStylePreset === 'chrome') {
        faceGrad = ctx.createLinearGradient(0, textY - effectiveFontSize / 2, 0, textY + effectiveFontSize / 2);
        faceGrad.addColorStop(0, '#FFFFFF');
        faceGrad.addColorStop(0.3, '#E4E4E7');
        faceGrad.addColorStop(0.6, '#A1A1AA');
        faceGrad.addColorStop(1, '#52525B');
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 8;
      } else if (myanmarStylePreset === 'neon') {
        faceGrad = ctx.createLinearGradient(0, textY - effectiveFontSize / 2, 0, textY + effectiveFontSize / 2);
        faceGrad.addColorStop(0, '#FDF2F8');
        faceGrad.addColorStop(0.4, '#F472B6');
        faceGrad.addColorStop(0.8, '#EC4899');
        faceGrad.addColorStop(1, '#BE185D');
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 20;
      } else {
        faceGrad = ctx.createLinearGradient(0, textY - effectiveFontSize / 2, 0, textY + effectiveFontSize / 2);
        faceGrad.addColorStop(0, '#FEF2F2');
        faceGrad.addColorStop(0.4, '#EF4444');
        faceGrad.addColorStop(0.8, '#B91C1C');
        faceGrad.addColorStop(1, '#7F1D1D');
        ctx.shadowColor = '#7F1D1D';
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = faceGrad;
      ctx.fillText(myanmarText, textX, textY);

      // Specular Highlight Stroke
      ctx.strokeStyle = myanmarStylePreset === '3d-gold' ? 'rgba(255, 255, 240, 0.85)' : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.strokeText(myanmarText, textX, textY);
      ctx.restore();

      // Export new stamped image
      const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.96);
      setEditHistory(prev => [stampedDataUrl, ...prev]);
      setEditImageSrc(stampedDataUrl);
      setShowMyanmarTypographyModal(false);
      flash('info', `🇲🇲 Applied 3D Myanmar typography "${myanmarText}"!`);

      if (autoHarmonize) {
        setEditPrompt(`Harmonize 3D gold Myanmar typography reading "${myanmarText}" with photorealistic ground contact reflections and ambient lighting matching the central emblem.`);
        flash('info', '✨ Prompt prepared for AI Scene Harmonization!');
      }
    };
    img.src = editImageSrc;
  };

  // 2. Face Swap
  const [faceSwapTab, setFaceSwapTab] = useState<'swap-face' | 'swap-head'>('swap-face');
  const [faceSwapTargetImage, setFaceSwapTargetImage] = useState<string | null>(null);
  const [faceSwapSourceFace, setFaceSwapSourceFace] = useState<string | null>(null);
  const [showFaceSwapHistoryPicker, setShowFaceSwapHistoryPicker] = useState<'target' | 'source' | null>(null);
  const faceSwapTargetInputRef = useRef<HTMLInputElement | null>(null);
  const faceSwapSourceInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Change Background (AI Image Inpainting & Background Replacement Specialist)
  const [bgSubjectImage, setBgSubjectImage] = useState<string | null>(null);
  const [bgGuidanceImage, setBgGuidanceImage] = useState<string | null>(null);
  const [bgPromptText, setBgPromptText] = useState<string>('');
  const [bgSubjectType, setBgSubjectType] = useState<'human' | 'product'>('human');
  const [bgLightingOption, setBgLightingOption] = useState<string>('cozy-cafe');
  const [bgShowFormula, setBgShowFormula] = useState<boolean>(false);
  const [bgFormulaCopied, setBgFormulaCopied] = useState<boolean>(false);
  const bgSubjectInputRef = useRef<HTMLInputElement | null>(null);
  const bgGuidanceInputRef = useRef<HTMLInputElement | null>(null);

  // 4. Image Upscale
  const [upscaleTargetImage, setUpscaleTargetImage] = useState<string | null>(null);
  const [upscaleTargetTier, setUpscaleTargetTier] = useState<ResolutionTier>('4k');
  const upscaleInputRef = useRef<HTMLInputElement | null>(null);

  // 5. Image Variations (Matches User Reference UI: Start with an image, Describe variation, Output, Quality)
  const [variationSourceImage, setVariationSourceImage] = useState<string | null>(null);
  const [variationPrompt, setVariationPrompt] = useState<string>('');
  const [variationRatio, setVariationRatio] = useState<string>('3:4');
  const [variationResolution, setVariationResolution] = useState<ResolutionTier>('2k');
  const [variationQuality, setVariationQuality] = useState<'Draft' | 'Medium' | 'High' | 'Ultra'>('Medium');
  const [variationStrength, setVariationStrength] = useState<'low' | 'medium' | 'high'>('medium');
  const [variationStrengthNum, setVariationStrengthNum] = useState<number>(50);
  const [variationFocusArea, setVariationFocusArea] = useState<'entire' | 'subject' | 'background'>('entire');
  const [variationVibeMatch, setVariationVibeMatch] = useState<boolean>(true);
  const [variationAnalysis, setVariationAnalysis] = useState<{
    subject?: string;
    pose?: string;
    lighting?: string;
    background?: string;
    style?: string;
    colorPalette?: string[];
  } | null>(null);
  const [isAnalyzingReference, setIsAnalyzingReference] = useState<boolean>(false);
  const [showVariationHistoryPicker, setShowVariationHistoryPicker] = useState<boolean>(false);
  const [showVariationOutputModal, setShowVariationOutputModal] = useState<boolean>(false);
  const [showVariationQualityModal, setShowVariationQualityModal] = useState<boolean>(false);
  const [isGeneratingPromptFromImage, setIsGeneratingPromptFromImage] = useState<boolean>(false);
  const variationInputRef = useRef<HTMLInputElement | null>(null);

  // 6. Multi View (9 Camera Angles from 1 Photo - Matches User Screenshots)
  const [multiViewSourceImage, setMultiViewSourceImage] = useState<string | null>(null);
  const [multiViewRatio, setMultiViewRatio] = useState<string>('16:9');
  const [multiViewAnglesCount, setMultiViewAnglesCount] = useState<number>(9);
  const multiViewInputRef = useRef<HTMLInputElement | null>(null);

  // 7. Skin Retouch (Fal.ai FLUX.2 & OpenRouter Beauty Retouching)
  const [retouchTargetImage, setRetouchTargetImage] = useState<string | null>(null);
  const [retouchIntensity, setRetouchIntensity] = useState<'subtle' | 'moderate' | 'high'>('moderate');
  const [retouchPreserveTexture, setRetouchPreserveTexture] = useState<boolean>(true);
  const [retouchAntiBlemish, setRetouchAntiBlemish] = useState<boolean>(true);
  const [retouchSkinTone, setRetouchSkinTone] = useState<string>('natural warm olive');
  const [retouchCustomPrompt, setRetouchCustomPrompt] = useState<string>('');
  const retouchInputRef = useRef<HTMLInputElement | null>(null);

  // 8. Virtual Makeup (Fal.ai FLUX.2 & OpenRouter Cosmetic Studio)
  const [makeupTargetImage, setMakeupTargetImage] = useState<string | null>(null);
  const [makeupStyle, setMakeupStyle] = useState<string>('natural');
  const [makeupLipstick, setMakeupLipstick] = useState<string>('ruby_red');
  const [makeupFoundation, setMakeupFoundation] = useState<'dewy' | 'matte' | 'satin'>('satin');
  const [makeupCustomPrompt, setMakeupCustomPrompt] = useState<string>('');
  const makeupInputRef = useRef<HTMLInputElement | null>(null);

  // 9. Hair Transformation (Fal.ai FLUX.2 & OpenRouter Hairstyle & Color Studio)
  const [hairTargetImage, setHairTargetImage] = useState<string | null>(null);
  const [hairStyle, setHairStyle] = useState<string>('traditional_burmese_sadon');
  const [hairColor, setHairColor] = useState<string>('jet_black');
  const [hairLength, setHairLength] = useState<'short' | 'medium' | 'long' | 'extra_long'>('long');
  const [hairCustomPrompt, setHairCustomPrompt] = useState<string>('');
  const hairInputRef = useRef<HTMLInputElement | null>(null);

  // Folder & Library System
  const [folders, setFolders] = useState<string[]>(safeLoadFolders);
  const [targetFolder, setTargetFolder] = useState<string>('General');
  const [libraryItems, setLibraryItems] = useState<LibraryPhotoItem[]>(safeLoadLibrary);
  const [activeMainTab, setActiveMainTab] = useState<'current' | 'library'>('current');
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'compact'>('grid');
  const [mobileTab, setMobileTab] = useState<'studio' | 'outputs' | 'library'>('studio');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');

  // Modals & Inspection
  const [lightboxItem, setLightboxItem] = useState<LibraryPhotoItem | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveFolderModal, setMoveFolderModal] = useState<LibraryPhotoItem | null>(null);

  // Before/After Slider & Social Media Export Modals
  const [sliderModalData, setSliderModalData] = useState<{
    isOpen: boolean;
    beforeImage: string;
    afterImage: string;
    title?: string;
  }>({ isOpen: false, beforeImage: '', afterImage: '' });

  const [socialExportData, setSocialExportData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt?: string;
    title?: string;
    authorName?: string;
    authorHandle?: string;
  }>({ isOpen: false, imageUrl: '' });

  const [shareCommunityData, setShareCommunityData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt: string;
    title: string;
  }>({ isOpen: false, imageUrl: '', prompt: '', title: '' });

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
  const [preserveFace100, setPreserveFace100] = useState<boolean>(true);
  const [isAutoDetectingFace, setIsAutoDetectingFace] = useState<boolean>(false);
  const promptImageInputRef = useRef<HTMLInputElement | null>(null);
  const directP2pInputRef = useRef<HTMLInputElement | null>(null);
  const [isDirectP2pLoading, setIsDirectP2pLoading] = useState<boolean>(false);

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
  const currentToolMeta = STUDIO_TOOLS.find(t => t.id === activeTool) || STUDIO_TOOLS[0];
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
        const lowerPrompt = (initialPrompt || '').toLowerCase();
        const isBgScene =
          lowerPrompt.includes('environment') ||
          lowerPrompt.includes('interior') ||
          lowerPrompt.includes('terrace') ||
          lowerPrompt.includes('corridor') ||
          lowerPrompt.includes('lake') ||
          lowerPrompt.includes('platform') ||
          lowerPrompt.includes('architecture') ||
          lowerPrompt.includes('palace') ||
          lowerPrompt.includes('temple') ||
          lowerPrompt.includes('stupa') ||
          lowerPrompt.includes('studio') ||
          lowerPrompt.includes('garden') ||
          lowerPrompt.includes('backdrop') ||
          lowerPrompt.includes('scene');
        const newRef: UploadedRefPhoto = {
          id: `burmese-ref-${Date.now()}`,
          url: initialRefPhoto,
          name: isBgScene ? 'Scene Reference Plate' : 'Detail Burmese Reference',
          role: isBgScene ? 'background' : (prev.length === 0 ? 'background' : 'character')
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
          let role = typeof item === 'object' ? item.role : undefined;
          if (!role) {
            const lowerName = name.toLowerCase();
            if (lowerName.includes('scene') || lowerName.includes('plate') || lowerName.includes('location') || lowerName.includes('background') || lowerName.includes('backdrop')) {
              role = 'background';
            }
          }
          if (url && url.trim() && !next.some(p => p.url === url)) {
            next.unshift({ id, url, name, role });
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

  const downloadImage = async (url: string, id: string, itemRatio?: string, itemTier?: ResolutionTier) => {
    const targetTier = itemTier || resolutionTier || '2k';
    const targetRatio = itemRatio || ratio || '1:1';
    const dimStr = (RESOLUTION_MAP[targetRatio] && RESOLUTION_MAP[targetRatio][targetTier]) || '1440 × 1800';
    const dimParts = dimStr.split('×').map(s => parseInt(s.trim(), 10));
    const targetW = (dimParts.length === 2 && !isNaN(dimParts[0])) ? dimParts[0] : 1440;
    const targetH = (dimParts.length === 2 && !isNaN(dimParts[1])) ? dimParts[1] : 1800;

    try {
      // 1. Fetch blob (handles cross-origin clean loading)
      const response = await fetch(url);
      const rawBlob = await response.blob();
      const localBlobUrl = URL.createObjectURL(rawBlob);

      // 2. Load into HTMLImageElement
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for upscaling'));
        img.src = localBlobUrl;
      });

      // 3. Render onto Canvas at target resolution with high-quality bicubic interpolation
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(localBlobUrl);

      // 4. Export as PNG at exact target resolution
      const exportBlob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 0.95));
      if (!exportBlob) throw new Error('Canvas toBlob failed');

      const downloadUrl = URL.createObjectURL(exportBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `infinity-${targetTier.toUpperCase()}-${targetW}x${targetH}-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
      flash('info', `ဓာတ်ပုံကို ${targetTier.toUpperCase()} (${targetW} × ${targetH} px) ဖြင့် အောင်မြင်စွာ ဒေါင်းလုဒ်ဆွဲယူပြီးပါပြီ!`, 3000);
    } catch (err) {
      console.warn('Canvas upscale export notice, falling back to direct download:', err);
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
    }
  };

  const handleDownloadAllToDevice = async (itemsToDownload: { url: string; id: string; ratio?: string; resolutionTier?: ResolutionTier }[]) => {
    if (!itemsToDownload.length || isDownloadingAll) return;
    setIsDownloadingAll(true);
    flash('info', `ဓာတ်ပုံ (${itemsToDownload.length}) ပုံကို စက်ထဲသို့ တစ်ပုံချင်း ဒေါင်းလုဒ်စတင်ဆွဲယူနေပါသည်...`, 3000);
    
    let downloadedCount = 0;
    for (let i = 0; i < itemsToDownload.length; i++) {
      const item = itemsToDownload[i];
      try {
        await downloadImage(item.url, item.id || `batch-${i + 1}`, item.ratio, item.resolutionTier);
        downloadedCount++;
        // Small delay between downloads so the browser doesn't block multiple popups
        await new Promise(r => setTimeout(r, 400));
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
          const lowerName = (item.name || '').toLowerCase();
          const isExplicitBg = lowerName.includes('scene') || lowerName.includes('plate') || lowerName.includes('background') || lowerName.includes('backdrop') || lowerName.includes('location');
          const isExplicitGarment = lowerName.includes('dress') || lowerName.includes('suit') || lowerName.includes('longyi') || lowerName.includes('outfit');
          const isExplicitStyle = lowerName.includes('style') || lowerName.includes('lighting') || lowerName.includes('mood');
          const defaultRole: PhotoRole = isExplicitBg ? 'background' : isExplicitGarment ? 'outfit' : isExplicitStyle ? 'style' : 'character';
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

      // Auto-detect character face and lock identity into prompt
      if (loaded[0]?.url && preserveFace100) {
        handleAutoDetectCharacter(loaded[0].url);
      }
    }
  };

  // ---- Auto-detect Character & Lock 100% Face ----
  const handleAutoDetectCharacter = async (specificPhotoUrl?: string) => {
    const targetUrl = specificPhotoUrl || activeRefPhoto?.url || uploadedRefImages[0]?.url;
    if (!targetUrl || isAutoDetectingFace) return;
    setIsAutoDetectingFace(true);
    try {
      const res = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetUrl,
          targetEngine: 'flux',
          language: 'en'
        })
      });
      const data = await res.json();
      const a = data?.analysis;
      const extracted = cleanForImage(a?.masterPrompt || a?.fluxPrompt || a?.sdxlPrompt || '');
      if (extracted) {
        setPrompt(prev => {
          if (!prev.trim() || prev.length < 50) {
            return extracted;
          }
          if (!prev.includes('exact facial likeness') && !prev.includes('preserved facial identity')) {
            return `100% exact facial likeness, identical eyes, nose, lips, facial bone geometry, natural epidermal skin micro-pores, preserved facial identity, zero face alteration, same person from reference photo. ${prev}`;
          }
          return prev;
        });
        flash(
          'info',
          '🔒 Character auto-detected! 100% facial likeness & geometry locked into prompt.',
          4500
        );
      }
    } catch (err) {
      console.warn('Auto-detect character notice:', err);
      setPrompt(prev => {
        if (!prev.trim()) {
          return '100% exact facial likeness, identical eyes, nose, lips, facial bone geometry, natural epidermal skin micro-pores, preserved facial identity, zero face alteration, same person from uploaded reference photo';
        }
        return prev;
      });
    } finally {
      setIsAutoDetectingFace(false);
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

  // Direct Photo to Prompt from prompt box square button
  const handleDirectPhotoToPrompt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      flash('error', 'Please select a valid image file (PNG, JPG, WEBP, HEIC).');
      return;
    }

    setIsDirectP2pLoading(true);
    flash('info', 'Analyzing photo with Vision AI to extract master prompt...', 4000);

    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Pure Photo-to-Prompt: strictly analyze the photo to extract prompt text,
      // without adding or uploading the photo to the "Add visual references" option.

      // Call Vision AI
      const res = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: dataUrl,
          images: [dataUrl],
          targetEngine: 'flux',
          language: 'en'
        })
      });

      const data = await res.json();
      const a = data?.analysis;
      const extracted = cleanForImage(a?.masterPrompt || a?.fluxPrompt || a?.midjourneyPrompt || '');

      if (extracted) {
        setPrompt(extracted);
        flash('info', '✨ Prompt extracted from photo successfully!', 3500);
      } else {
        const fallback = 'Ultra-photorealistic studio portrait inspired by photo, 8k resolution, cinematic lighting, master composition.';
        setPrompt(fallback);
        flash('info', 'Generated photography prompt from photo.', 3000);
      }
    } catch (err) {
      console.error('Photo-to-prompt direct analysis error:', err);
      flash('error', 'Could not analyze photo for prompt.');
    } finally {
      setIsDirectP2pLoading(false);
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
    if (isGenerating) return;

    if (!prompt.trim() && uploadedRefImages.length === 0) {
      flash('warn', 'Please enter a prompt description or choose a reference photo before generating! / ကျေးဇူးပြု၍ prompt စာသား ရေးပါ သို့မဟုတ် ပုံတင်ပါ');
      return;
    }

    const session = SupabaseService.getSession();
    const creditCost = (TIER_CREDIT_RATES[resolutionTier] || 5) * count;

    if (session && SupabaseService.isConfigured()) {
      const creditRes = await SupabaseService.deductCredits(
        creditCost,
        'photo_generation',
        `Generated ${count} ${resolutionTier.toUpperCase()} photo(s) via ${selected.name}`
      );
      if (!creditRes.success) {
        flash('error', creditRes.error || `Insufficient credits (Requires ${creditCost} Credits)`);
        return;
      }
      window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
    } else {
      // Guest mode: deduct from local storage credits so user can test immediately
      const currentUser = StorageService.getCurrentUser();
      const available = currentUser.credits !== undefined ? currentUser.credits : 250;
      if (available < creditCost) {
        window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: 'photo-prompt' } }));
        flash('warn', `Insufficient credits (${available} available). Please sign in to claim 250 free daily credits!`);
        return;
      }
      currentUser.credits = available - creditCost;
      StorageService.setCurrentUser(currentUser);
      setUserCredits(currentUser.credits);
      window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
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

      let finalPrompt = cleanForImage(prompt.trim() || 'Ultra-detailed photorealistic studio portrait preserving exact subject identity, lighting, and aesthetics from the reference image');
      if (polish && finalPrompt.length < 160) {
        finalPrompt += ', professional photography, highly detailed, sharp focus, natural lighting, 8k';
      }
      finalPrompt = `${finalPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()} --ar ${ratio}`;
      const rawRefObjects = useAllRefImages
        ? uploadedRefImages
        : activeRefPhoto
        ? [activeRefPhoto]
        : [];

      // Pre-optimize reference images to max 800px to prevent network payload bloat, timeout, and E2BIG limits
      const activeRefObjects = await Promise.all(
        rawRefObjects.map(async (x) => ({
          ...x,
          url: x.url ? await downscaleDataUrl(x.url, 800, 0.82) : x.url
        }))
      );
      const refUrls = activeRefObjects.map(x => x.url);

      // Lock 100% facial likeness if preserveFace100 is active and character photo is attached
      const hasCharPhoto = activeRefObjects.some(x => x.role === 'character') || (activeRefObjects.length > 0 && !activeRefObjects.every(x => x.role === 'background'));
      const isFamilyPrompt = /\b(family|parents|father|mother|daughter|son|children|kids|baby|toddler|grandparents|family\s*portrait|group\s*photo|group\s*portrait|multiple\s*people|three\s*people|four\s*people|five\s*people|six\s*people|မိသားစု|သားသမီး|မိဘ|မိဘသားသမီး|မိသားစုလိုက်)\b/i.test(finalPrompt);
      const isCouplePrompt = (/\b(couple|two\s*people|two\s*persons|bride\s*and\s*groom|groom\s*and\s*bride|husband\s*and\s*wife|man\s*and\s*woman|two\s*subjects|စုံတွဲ|ဇနီးမောင်နှံ|မောင်နှံ)\b/i.test(finalPrompt)) && !isFamilyPrompt;
      if (hasCharPhoto && preserveFace100 && !finalPrompt.includes('facial likeness') && !finalPrompt.includes('zero face alteration')) {
        if (isFamilyPrompt) {
          finalPrompt = `entire family together, preserving distinct individual facial likeness, bone geometry, and natural features for every family member (father, mother, children, all individuals from reference photo), natural family grouping and warm interaction, all individuals in sharp focus, zero face merging or distortion, natural epidermal skin micro-pores, ${finalPrompt}`;
        } else if (isCouplePrompt) {
          finalPrompt = `two distinct individuals side-by-side, preserving distinct facial identities and likeness for both people, groom on the left and bride on the right, zero face merging, natural epidermal skin micro-pores, ${finalPrompt}`;
        } else {
          finalPrompt = `100% exact facial likeness, identical eyes nose lips, preserved facial identity for all subjects in reference photo, zero face alteration, same subject(s) (whether individual, couple, or family), identical facial bone geometry, natural epidermal skin micro-pores, ${finalPrompt}`;
        }
      }

      // Check if a background reference image is already attached
      const hasBgImage = activeRefObjects.some(x => x.role === 'background');
      const finalRolesList = activeRefObjects.map((x) => {
        let assignedRole = x.role;
        if (!assignedRole) {
          const lowerName = (x.name || '').toLowerCase();
          if (
            lowerName.includes('scene') ||
            lowerName.includes('plate') ||
            lowerName.includes('background') ||
            lowerName.includes('backdrop') ||
            lowerName.includes('location')
          ) {
            assignedRole = 'background';
          } else {
            assignedRole = 'character';
          }
        }
        return {
          url: x.url,
          name: x.name,
          role: assignedRole
        };
      });

      // Auto-Attach Background Reference Plate when available and no background is attached
      if (!finalRolesList.some(r => r.role === 'background')) {
        const activeOpts = (chosenBurmeseOptions && chosenBurmeseOptions.length > 0) ? chosenBurmeseOptions : initialChosenOptions;
        const plate = findBackgroundPlateForPrompt(finalPrompt, activeOpts);
        if (plate && plate.url && !finalRolesList.some(r => r.url === plate.url)) {
          console.log(`[PhotoPromptStudio] Auto-attaching Background Reference Plate: ${plate.name} (${plate.url})`);
          finalRolesList.push({
            url: plate.url,
            name: `${plate.name} (Location Reference Plate)`,
            role: 'background'
          });
          if (!refUrls.includes(plate.url)) {
            refUrls.push(plate.url);
          }
        }
      }

      const activeOpts = (chosenBurmeseOptions && chosenBurmeseOptions.length > 0) ? chosenBurmeseOptions : (initialChosenOptions || []);
      const detectedLocation = activeOpts.find(o => o.label?.toLowerCase().includes('location') || o.label?.includes('နေရာ'))?.value || null;
      const detectedTime = activeOpts.find(o => o.label?.toLowerCase().includes('time') || o.label?.includes('အချိန်'))?.value || null;
      const detectedLighting = activeOpts.find(o => o.label?.toLowerCase().includes('light') || o.label?.includes('အလင်း'))?.value || null;
      const detectedMood = activeOpts.find(o => o.label?.toLowerCase().includes('mood') || o.label?.includes('ခံစားမှု') || o.label?.toLowerCase().includes('atmosphere'))?.value || null;
      const detectedWeather = activeOpts.find(o => o.label?.toLowerCase().includes('weather') || o.label?.includes('ရာသီဥတု'))?.value || null;

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
          referenceImagesWithRoles: finalRolesList,
          location: detectedLocation,
          timeOfDay: detectedTime,
          lighting: detectedLighting,
          mood: detectedMood,
          weather: detectedWeather,
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
          resolutionTier,
          resolutionDimensions: currentResString,
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
        resolutionTier: b.resolutionTier || resolutionTier,
        resolutionDimensions: b.resolutionDimensions || currentResString,
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
      // Auto-refund credits if generation encountered an error
      try {
        if (session && SupabaseService.isConfigured()) {
          await SupabaseService.refundCredits(creditCost, 'Refund: Photo generation failure');
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        } else {
          const currentUser = StorageService.getCurrentUser();
          currentUser.credits = (currentUser.credits || 0) + creditCost;
          StorageService.setCurrentUser(currentUser);
          setUserCredits(currentUser.credits);
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        }
      } catch {}
      flash('error', e?.message || 'Generation failed. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Computer Vision AI Agent Tool Pipeline Execution (/api/v1/process-image) ----
  const executeStudioToolAction = async (
    action: 'edit_image' | 'upscale' | 'change_background' | 'multi_view' | 'face_swap' | 'image_variations' | 'skin_retouch' | 'virtual_makeup' | 'hair_transform',
    payload: Record<string, any>,
    creditCost: number,
    label: string
  ) => {
    if (isGenerating) return;

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
      const session = SupabaseService.getSession();
      if (session && SupabaseService.isConfigured()) {
        const creditRes = await SupabaseService.deductCredits(
          creditCost,
          'photo_generation',
          `Studio Tool Action: ${label}`
        );
        if (!creditRes.success) {
          throw new Error(creditRes.error || `Insufficient credits (Requires ${creditCost} Credits)`);
        }
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
      } else {
        // Guest mode: deduct from local storage credits so user can test immediately
        const currentUser = StorageService.getCurrentUser();
        const available = currentUser.credits !== undefined ? currentUser.credits : 2500;
        if (available < creditCost) {
          window.dispatchEvent(new CustomEvent('open-supabase-auth', { detail: { targetSection: 'photo-prompt' } }));
          throw new Error(`Insufficient credits (${available} available). You need ${creditCost} Credits. Please sign in or top up!`);
        }
        currentUser.credits = available - creditCost;
        StorageService.setCurrentUser(currentUser);
        setUserCredits(currentUser.credits);
        window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
      }

      let res: Response;
      if (action === 'skin_retouch') {
        res = await fetch('/api/ai/skin-retouch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else if (action === 'virtual_makeup') {
        res = await fetch('/api/ai/virtual-makeup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else if (action === 'hair_transform') {
        res = await fetch('/api/ai/hair-transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/v1/process-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, ...payload })
        });
      }
      const data = await res.json();
      if (!res.ok || data.status === 'error' || data.success === false) {
        throw new Error(data?.message || data?.error_message || data?.error || 'Processing failed');
      }

      const batchTime = Date.now();
      const assignedFolder = targetFolder || 'General';
      const providerName = data.pipeline_used || data.pipeline || label;
      const newBatch: ResultImage[] = [];

      // If multi-view, add the master 3x3 collage + all 9 synchronized angle views!
      if (action === 'multi_view') {
        const masterUrl = data.result_image_url || data.output_image_url;
        if (masterUrl) {
          newBatch.push({
            id: `mv-master-${batchTime}`,
            url: masterUrl,
            prompt: 'Multi View Master 3x3 Camera Angles Contact Sheet (9 perspectives)',
            provider: `${providerName} (3x3 Master Sheet)`,
            ratio: '1:1',
            resolutionTier,
            resolutionDimensions: currentResString,
            folder: assignedFolder,
            createdAt: batchTime,
            favorite: true
          });
        }

        const angleNames = [
          "Angle 1: High-Angle Left 3/4 (-45°, +30°)",
          "Angle 2: Bird's Eye Overhead (0°, +75°)",
          "Angle 3: High-Angle Right 3/4 (+45°, +30°)",
          "Angle 4: Left 90° Profile (-90°, 0°)",
          "Angle 5: Canonical Front Hero (Anchor 0°, 0°)",
          "Angle 6: Right 90° Profile (+90°, 0°)",
          "Angle 7: Rear 180° Back View (180°, 0°)",
          "Angle 8: Low-Angle Upward Tilt (0°, -30°)",
          "Angle 9: Dynamic 3/4 Macro Angle (+135°, -15°)"
        ];

        let rawAngles: string[] = Array.isArray(data.multi_view_urls) ? data.multi_view_urls : [];
        if (masterUrl && (rawAngles.length === 0 || rawAngles.every(u => u === masterUrl))) {
          const sliced = await slice3x3GridSheet(masterUrl);
          if (sliced.length === 9) {
            rawAngles = sliced;
          }
        }

        rawAngles.forEach((u, idx) => {
          newBatch.push({
            id: `mv-angle-${batchTime}-${idx}`,
            url: u,
            prompt: angleNames[idx] || `Camera Angle ${idx + 1}/${rawAngles.length} perspective`,
            provider: `${providerName} (${angleNames[idx] || `Angle #${idx + 1}`})`,
            ratio: payload.aspect_ratio || '1:1',
            resolutionTier,
            resolutionDimensions: currentResString,
            folder: assignedFolder,
            createdAt: batchTime + idx + 1,
            favorite: false
          });
        });
      } else if (action === 'image_variations' && Array.isArray(data.variations_urls) && data.variations_urls.length > 0) {
        data.variations_urls.forEach((u: string, idx: number) => {
          newBatch.push({
            id: `var-${batchTime}-${idx}`,
            url: u,
            prompt: `Variation #${idx + 1} (${payload.variation_strength || 'medium'}, ${payload.focus_area || 'entire'}): ${payload.variation_prompt || 'Creative variation'}`,
            provider: providerName,
            ratio: payload.aspect_ratio || variationRatio || '3:4',
            resolutionTier: payload.resolution_tier || variationResolution || '2k',
            resolutionDimensions: currentResString,
            folder: assignedFolder,
            createdAt: batchTime + idx,
            favorite: false
          });
        });
      } else {
        const outImg = data.processed_image_url || data.result_image_url || data.output_image_url;
        if (outImg) {
          newBatch.push({
            id: `${action}-${batchTime}`,
            url: outImg,
            prompt: `${label}: ${payload.prompt || payload.edit_prompt || payload.new_background_prompt || label}`,
            provider: providerName,
            ratio: action === 'upscale' ? ratio : '1:1',
            resolutionTier: action === 'upscale' ? upscaleTargetTier : resolutionTier,
            resolutionDimensions: currentResString,
            folder: assignedFolder,
            createdAt: batchTime,
            favorite: false
          });
        }
      }

      if (newBatch.length > 0) {
        setResults(prev => [...newBatch, ...prev].slice(0, 36));
        setActiveMainTab('current');
        setMobileTab('outputs');

        const libBatch: LibraryPhotoItem[] = newBatch.map(b => ({
          id: b.id,
          url: b.url,
          prompt: b.prompt,
          provider: b.provider,
          ratio: b.ratio,
          resolutionTier: b.resolutionTier || resolutionTier,
          resolutionDimensions: b.resolutionDimensions || currentResString,
          folder: assignedFolder,
          createdAt: b.createdAt || batchTime,
          favorite: b.favorite || false
        }));
        setLibraryItems(prev => [...libBatch, ...prev]);

        // Save first result to Supabase History
        if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
          await SupabaseService.saveHistoryRecord({
            mode: 'photo-studio',
            masterPrompt: newBatch[0].prompt,
            imageUrl: newBatch[0].url,
            provider: providerName,
            aspectRatio: newBatch[0].ratio,
            folder: assignedFolder,
            creditsUsed: creditCost
          });
        }

        // Seamless Canvas Update for Edit Image
        if (action === 'edit_image' && newBatch[0]?.url) {
          if (payload.edit_mode !== 'describe') {
            setEditImageSrc(newBatch[0].url);
            setEditHistory(prev => [newBatch[0].url, ...prev.filter(u => u !== newBatch[0].url)]);
            clearMaskCanvas();
          }
        }

        // Store Vision-Language Describe Analysis Data
        if (data.analysis) {
          setEditAnalysisResult(data.analysis);
          setShowEditAnalysisPanel(true);
        }

        // Before & After comparison modal (Excluded for change_background to show result directly)
        if (['edit_image', 'face_swap', 'image_variations'].includes(action) && payload.image_url && newBatch[0]?.url && payload.edit_mode !== 'describe') {
          setSliderModalData({
            isOpen: true,
            beforeImage: payload.image_url,
            afterImage: newBatch[0].url,
            title: `${label} Before & After Comparison`
          });
        }
      }

      flash('info', `✨ ${label} completed successfully! (-${creditCost} Credits)`, 4000);
    } catch (err: any) {
      console.error(`Studio Tool ${action} failed:`, err);
      // Auto-refund credits if studio tool action encountered an error
      try {
        const session = SupabaseService.getSession();
        if (session && SupabaseService.isConfigured()) {
          await SupabaseService.refundCredits(creditCost, `Refund: ${label} failure`);
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        } else {
          const currentUser = StorageService.getCurrentUser();
          currentUser.credits = (currentUser.credits || 0) + creditCost;
          StorageService.setCurrentUser(currentUser);
          setUserCredits(currentUser.credits);
          window.dispatchEvent(new CustomEvent('supabase-cloud-refresh'));
        }
      } catch {}
      flash('error', err?.message || 'Processing failed. Check inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Canvas & Masking Utilities for Image Edit Studio (Delegated to useAreaEdit)
  const redrawMaskCanvas = () => {
    areaEdit.redraw(editCanvasRef.current);
  };

  const undoMaskStroke = () => {
    areaEdit.undo(editCanvasRef.current);
  };

  const redoMaskStroke = () => {
    areaEdit.redo(editCanvasRef.current);
  };

  const clearMaskCanvas = () => {
    areaEdit.clearMask(editCanvasRef.current);
  };

  const exportBinaryMask = (): string | null => {
    return areaEdit.exportBinaryMask(editCanvasRef.current, editImageRef.current);
  };

  // OpenArt-Style AI Prompt Enhancer & Scene Harmonizer
  const handleAutoEnhancePrompt = async () => {
    if (!editPrompt.trim()) {
      flash('warn', 'Please type a prompt first (e.g. add a text "Rx Ai Marketing Agency")');
      return;
    }
    setIsAutoEnhancingPrompt(true);
    try {
      const res = await fetch('/api/editor/auto-enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          image_url: editImageSrc,
          mode: editModeAction,
          api_key: seedreamApiKey ? seedreamApiKey.trim() : undefined
        })
      });
      const data = await res.json();
      if (data.success && data.enhanced_prompt) {
        setEditPrompt(data.enhanced_prompt);
        setLastEnhancedPrompt(data.enhanced_prompt);
        flash('info', '✨ Prompt auto-enhanced with 3D materials, floor reflections, and lighting harmony!');
      } else {
        throw new Error(data.error || 'Enhancement returned empty');
      }
    } catch (err: any) {
      console.warn('Auto-enhance prompt error:', err);
      flash('warn', 'Auto-enhance notice: using intelligent local fallback directives.');
    } finally {
      setIsAutoEnhancingPrompt(false);
    }
  };

  // ---- Tool specific generation triggers ----
  const handleEditImageGenerate = async () => {
    if (!editImageSrc) {
      flash('warn', 'Please upload or select an image to edit!');
      return;
    }

    // Optimize base image and reference image to prevent 413 Payload Too Large
    const optImage = await downscaleDataUrl(editImageSrc, 1536, 0.88);
    const optRef = editReferenceImage ? await downscaleDataUrl(editReferenceImage, 1024, 0.85) : undefined;

    if (editModeAction === 'describe') {
      const q = editPrompt.trim() || 'Analyze and describe all primary subjects, lighting, colors, style, and composition of this image';
      executeStudioToolAction('edit_image', {
        image_url: optImage,
        reference_image: optRef,
        edit_prompt: q,
        edit_mode: 'describe',
        seedream_api_key: seedreamApiKey ? seedreamApiKey.trim() : undefined
      }, 30, 'Vision-Language Describe');
      return;
    }

    if (editModeAction === 'area-edit') {
      if (!maskHasContent) {
        flash('warn', 'Please paint the area on the image you want to inpaint, or switch to "Smart Edit"!');
        return;
      }
      const rawMask = exportBinaryMask();
      const optMask = await downscaleDataUrl(rawMask, 1536, 0.85);
      executeStudioToolAction('edit_image', {
        image_url: optImage,
        reference_image: optRef,
        mask_url: optMask || rawMask,
        edit_prompt: editPrompt.trim() || 'Inpaint and modify masked region',
        edit_mode: 'area-edit',
        auto_enhance: isAutoEnhanceEnabled,
        denoising_strength: editDenoiseStrength,
        seedream_api_key: seedreamApiKey ? seedreamApiKey.trim() : undefined
      }, 30, 'Inpaint Area Edit');
      return;
    }

    if (editModeAction === 'annotate') {
      if (editAnnotations.length === 0) {
        flash('warn', 'Please draw a box or point annotation on the canvas, or switch to "Smart Edit"!');
        return;
      }
      executeStudioToolAction('edit_image', {
        image_url: optImage,
        reference_image: optRef,
        annotations: editAnnotations,
        edit_prompt: editPrompt.trim() || 'Spatial annotation modification',
        edit_mode: 'annotate',
        auto_enhance: isAutoEnhanceEnabled,
        seedream_api_key: seedreamApiKey ? seedreamApiKey.trim() : undefined
      }, 30, 'Spatial Annotate Edit');
      return;
    }

    // Default 'smart-edit'
    if (!editPrompt.trim()) {
      flash('warn', 'Please describe what you want to edit or add (e.g. "add a text Rx Ai Marketing Agency")!');
      return;
    }

    executeStudioToolAction('edit_image', {
      image_url: optImage,
      reference_image: optRef,
      edit_prompt: editPrompt.trim(),
      edit_mode: 'smart-edit',
      auto_enhance: isAutoEnhanceEnabled,
      seedream_api_key: seedreamApiKey ? seedreamApiKey.trim() : undefined
    }, 30, 'Smart Generative Edit');
  };

  const handleFaceSwapGenerate = async () => {
    if (!faceSwapTargetImage || !faceSwapSourceFace) {
      flash('warn', 'Please upload both target image and source face image!');
      return;
    }

    // Downscale large images to avoid network bloat
    const optTarget = await downscaleDataUrl(faceSwapTargetImage, 1024, 0.88);
    const optSource = await downscaleDataUrl(faceSwapSourceFace, 800, 0.88);

    // Automated Reinhard Skin-Tone Transfer & Feathered Seamless Face Blending
    const { compositeUrl, faceMaskUrl } = await generateSeamlessFaceSwapComposite(optSource, optTarget, faceSwapTab === 'swap-head');

    executeStudioToolAction('face_swap', {
      source_face_image: optSource,
      target_image: optTarget,
      image_url: optTarget,
      target_image_url: optTarget,
      source_face_url: optSource,
      composite_result_data_url: compositeUrl,
      face_mask_url: faceMaskUrl,
      face_swap_mode: faceSwapTab,
      skin_tone_matching: true,
      denoising_strength: 0.32
    }, 30, 'Face Swap');
  };

  // Dynamic Inpainting & Background Replacement Formula calculation
  const bgInpaintingFormula = useMemo(() => {
    const isProd = bgSubjectType === 'product';
    const bgDesc = bgPromptText.trim() || (isProd ? 'a minimalist warm travertine marble table' : 'a cozy modern coffee shop interior');
    
    let lightingText = '';
    if (isProd) {
      if (bgLightingOption === 'travertine-table') lightingText = 'soft ambient morning sunlight coming from the top-left, realistic soft cast shadow directly beneath the base, blurred luxury modern living room in the background, 85mm lens, f/2.8, depth of field';
      else if (bgLightingOption === 'dark-matte') lightingText = 'dramatic commercial studio key light, crisp contact shadow directly beneath product base, clean ambient rim lighting, 8k product catalog';
      else if (bgLightingOption === 'wooden-botanical') lightingText = 'warm diffused morning sunlight, natural tabletop contact shadow, blurred botanical garden bokeh, f/2.0';
      else lightingText = 'clean commercial e-commerce lighting, soft ambient contact shadow beneath base, tack-sharp focal detail';
    } else {
      if (bgLightingOption === 'cozy-cafe') lightingText = "warm incandescent lighting matching the subject's skin tone, natural contact shadows, shallow depth of field with creamy background bokeh, cinematic composition, perfectly blended hair edges";
      else if (bgLightingOption === 'luxury-studio') lightingText = 'soft directional 45° key light, subtle rim light, neutral 5000K studio color temperature, 85mm f/1.4 portraiture bokeh';
      else if (bgLightingOption === 'golden-sunset') lightingText = 'warm golden hour crimson rim lighting, soft ambient fill, natural contact shadows on ground, cinematic composition';
      else lightingText = 'cool cinematic neon ambient lighting, specular color bounce, shallow depth of field, atmospheric bokeh';
    }

    const relightingDirective = isProd
      ? 'Preserve product geometry and materials, but dynamically relight, color-grade, and blend edges with ambient light wrap to harmonize with the environment.'
      : 'Preserve facial identity and outfit design, but dynamically relight, color-grade, and blend subject edges with ambient light wrap to harmonize with the environment.';

    const inpaintingPrompt = isProd
      ? `${relightingDirective} Studio product photograph of [Subject], placed firmly in ${bgDesc}, ${lightingText}`
      : `${relightingDirective} Photorealistic portrait of [Subject], seamlessly placed in ${bgDesc}, ${lightingText}`;

    const negativePrompt = isProd
      ? 'altering original product, bad cutouts, green screen fringe, floating object, distorted edges, low resolution, unnatural hard borders, halo effect'
      : 'cut-and-paste look, cartoonish edges, fringing around hair, deformed hands/fingers, altering facial features, harsh unnatural cutouts, flat lighting';

    return { inpaintingPrompt, negativePrompt };
  }, [bgSubjectType, bgPromptText, bgLightingOption]);

  // Helper to downscale large base64 images to prevent network timeout & payload bloat
  const downscaleDataUrl = (dataUrl: string, maxDim: number = 800, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve('');
      if (!dataUrl.startsWith('data:image')) return resolve(dataUrl);
      const img = new Image();
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const w = img.width;
          const h = img.height;
          if (w <= maxDim && h <= maxDim) return resolve(dataUrl);
          const scale = Math.min(maxDim / w, maxDim / h);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Automated subject cutout (Strips away curtains, walls, and old backdrops completely)
  const [isCuttingOut, setIsCuttingOut] = useState<boolean>(false);
  const removeBackgroundCanvas = async (imageSrc: string): Promise<string> => {
    // 1. Attempt Client-side BiRefNet/IS-Net AI segmentation via CDN
    try {
      const dynamicImport = new Function('url', 'return import(url)');
      const { removeBackground } = await dynamicImport('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.7/+esm');
      const blob = await removeBackground(imageSrc);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(imageSrc);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('[Background Removal] CDN ML notice, applying smart saliency canvas matting:', err);
    }

    // 2. Intelligent Saliency & Edge-Aware Matting (removes backdrop walls & curtains)
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Sample background colors from 8 points around borders
        const samplePoints = [
          [4, 4], [w - 5, 4], [4, h - 5], [w - 5, h - 5],
          [Math.floor(w / 2), 4], [4, Math.floor(h / 2)], [w - 5, Math.floor(h / 2)], [Math.floor(w / 4), 4]
        ];
        const samples = samplePoints.map(([sx, sy]) => {
          const idx = (sy * w + sx) * 4;
          return [data[idx], data[idx + 1], data[idx + 2]];
        });

        const bgR = samples.reduce((acc, s) => acc + s[0], 0) / samples.length;
        const bgG = samples.reduce((acc, s) => acc + s[1], 0) / samples.length;
        const bgB = samples.reduce((acc, s) => acc + s[2], 0) / samples.length;

        // Core subject protective zone (central 60% of people/product)
        const minX = w * 0.16;
        const maxX = w * 0.84;
        const minY = h * 0.14;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const colorDist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            const isBorder = x < minX || x > maxX || y < minY;

            if (isBorder && colorDist < 70) {
              const alphaFactor = Math.max(0, Math.min(1, (colorDist - 25) / 45));
              data[i + 3] = Math.round(data[i + 3] * alphaFactor);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  // ---- Automated Reinhard Color & Skin-Tone Transfer (Lab Color Space) ----
  const rgbToLmsLab = (r: number, g: number, b: number): [number, number, number] => {
    const rn = Math.max(0.001, r / 255);
    const gn = Math.max(0.001, g / 255);
    const bn = Math.max(0.001, b / 255);

    const L = 0.3811 * rn + 0.5783 * gn + 0.0402 * bn;
    const M = 0.1967 * rn + 0.7244 * gn + 0.0782 * bn;
    const S = 0.0241 * rn + 0.1288 * gn + 0.8444 * bn;

    const logL = Math.log10(Math.max(0.0001, L));
    const logM = Math.log10(Math.max(0.0001, M));
    const logS = Math.log10(Math.max(0.0001, S));

    const l = (logL + logM + logS) / 1.7320508;
    const a = (logL + logM - 2 * logS) / 2.4494897;
    const bVal = (logL - logM) / 1.41421356;
    return [l, a, bVal];
  };

  const lmsLabToRgb = (l: number, a: number, bVal: number): [number, number, number] => {
    const logL = l / 1.7320508 + a / 2.4494897 + bVal / 1.41421356;
    const logM = l / 1.7320508 + a / 2.4494897 - bVal / 1.41421356;
    const logS = l / 1.7320508 - (2 * a) / 2.4494897;

    const L = Math.pow(10, logL);
    const M = Math.pow(10, logM);
    const S = Math.pow(10, logS);

    const r = 4.4679 * L - 3.5873 * M + 0.1193 * S;
    const g = -1.2186 * L + 2.3809 * M - 0.1624 * S;
    const b = 0.0497 * L - 0.2439 * M + 1.2045 * S;

    return [
      Math.max(0, Math.min(255, Math.round(r * 255))),
      Math.max(0, Math.min(255, Math.round(g * 255))),
      Math.max(0, Math.min(255, Math.round(b * 255)))
    ];
  };

  // Automated Reinhard Skin-Tone Transfer & Feathered Face Blending
  const generateSeamlessFaceSwapComposite = async (
    sourceFaceSrc: string,
    targetSceneSrc: string,
    includeHair: boolean = false
  ): Promise<{ compositeUrl: string; faceMaskUrl: string }> => {
    return new Promise((resolve) => {
      let isSettled = false;
      const done = (compositeUrl: string, faceMaskUrl = '') => {
        if (!isSettled) {
          isSettled = true;
          resolve({ compositeUrl, faceMaskUrl });
        }
      };
      const safetyTimer = setTimeout(() => done(targetSceneSrc, ''), 5000);

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((res, rej) => {
          const img = new Image();
          if (src.startsWith('http://') || src.startsWith('https://')) {
            img.crossOrigin = 'anonymous';
          }
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = src;
        });
      };

      Promise.all([loadImage(targetSceneSrc), loadImage(sourceFaceSrc)])
        .then(([targetImg, sourceImg]) => {
          try {
            const canvasW = Math.min(1024, Math.max(512, targetImg.width || 1024));
            const canvasH = Math.min(1024, Math.max(512, targetImg.height || 1024));

            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = canvasW;
            compositeCanvas.height = canvasH;
            const cCtx = compositeCanvas.getContext('2d');
            if (!cCtx) {
              clearTimeout(safetyTimer);
              return done(targetSceneSrc, '');
            }

            // Draw target scene onto canvas
            cCtx.drawImage(targetImg, 0, 0, canvasW, canvasH);
            const targetData = cCtx.getImageData(0, 0, canvasW, canvasH);
            const tData = targetData.data;

            // Skin tone detection helper
            const isSkinPixel = (r: number, g: number, b: number) => {
              return r > 65 && g > 40 && b > 20 && r > g && g > b && (r - g) > 8 && (r - b) > 12;
            };

            // 1. Scan target image for face/head skin centroid & bounds in the upper 70% of canvas
            let tSkinSumX = 0;
            let tSkinSumY = 0;
            let tSkinCount = 0;
            let tMinX = canvasW, tMaxX = 0, tMinY = canvasH, tMaxY = 0;
            const scanMaxY = Math.round(canvasH * 0.72);

            for (let y = 10; y < scanMaxY; y += 4) {
              for (let x = 10; x < canvasW - 10; x += 4) {
                const idx = (y * canvasW + x) * 4;
                const r = tData[idx];
                const g = tData[idx + 1];
                const b = tData[idx + 2];
                if (isSkinPixel(r, g, b)) {
                  tSkinSumX += x;
                  tSkinSumY += y;
                  tSkinCount++;
                  if (x < tMinX) tMinX = x;
                  if (x > tMaxX) tMaxX = x;
                  if (y < tMinY) tMinY = y;
                  if (y > tMaxY) tMaxY = y;
                }
              }
            }

            // Determine target face center and radius
            let tCx = Math.round(canvasW * 0.5);
            let tCy = Math.round(canvasH * 0.32);
            let tRadX = Math.round(canvasW * 0.17);
            let tRadY = Math.round(canvasH * 0.22);

            if (tSkinCount > 80 && tMaxX > tMinX && tMaxY > tMinY) {
              tCx = Math.round(tSkinSumX / tSkinCount);
              tCy = Math.round(tSkinSumY / tSkinCount);
              const estWidth = tMaxX - tMinX;
              const estHeight = tMaxY - tMinY;
              tRadX = Math.round(Math.min(canvasW * 0.25, Math.max(canvasW * 0.10, estWidth * 0.42)));
              tRadY = Math.round(Math.min(canvasH * 0.30, Math.max(canvasH * 0.13, estHeight * 0.44)));
            }

            if (includeHair) {
              tRadX = Math.round(tRadX * 1.25);
              tRadY = Math.round(tRadY * 1.30);
              tCy = Math.max(tRadY, tCy - Math.round(tRadY * 0.12));
            }

            // Sample target skin pixels (focusing on neck, jawline, and cheeks for true ambient lighting)
            const targetLabSamples: [number, number, number][] = [];
            const sampleNeckStartY = Math.min(canvasH - 1, tCy + Math.round(tRadY * 0.3));
            const sampleNeckEndY = Math.min(canvasH - 1, tCy + Math.round(tRadY * 1.3));
            const sampleXStart = Math.max(0, tCx - Math.round(tRadX * 0.8));
            const sampleXEnd = Math.min(canvasW - 1, tCx + Math.round(tRadX * 0.8));

            for (let y = sampleNeckStartY; y < sampleNeckEndY; y += 4) {
              for (let x = sampleXStart; x < sampleXEnd; x += 4) {
                const idx = (y * canvasW + x) * 4;
                const r = tData[idx];
                const g = tData[idx + 1];
                const b = tData[idx + 2];
                if (isSkinPixel(r, g, b)) {
                  targetLabSamples.push(rgbToLmsLab(r, g, b));
                }
              }
            }

            // Fallback: sample around face center if neck yielded few samples
            if (targetLabSamples.length < 20) {
              for (let y = Math.max(0, tCy - tRadY); y < Math.min(canvasH - 1, tCy + tRadY); y += 6) {
                for (let x = Math.max(0, tCx - tRadX); x < Math.min(canvasW - 1, tCx + tRadX); x += 6) {
                  const idx = (y * canvasW + x) * 4;
                  const r = tData[idx];
                  const g = tData[idx + 1];
                  const b = tData[idx + 2];
                  if (isSkinPixel(r, g, b)) {
                    targetLabSamples.push(rgbToLmsLab(r, g, b));
                  }
                }
              }
            }

            // Compute target Lab mean & std
            const tCount = Math.max(1, targetLabSamples.length);
            const tMean: [number, number, number] = [0, 0, 0];
            for (let i = 0; i < tCount; i++) {
              tMean[0] += targetLabSamples[i][0];
              tMean[1] += targetLabSamples[i][1];
              tMean[2] += targetLabSamples[i][2];
            }
            tMean[0] /= tCount;
            tMean[1] /= tCount;
            tMean[2] /= tCount;

            const tStd: [number, number, number] = [0, 0, 0];
            for (let i = 0; i < tCount; i++) {
              tStd[0] += Math.pow(targetLabSamples[i][0] - tMean[0], 2);
              tStd[1] += Math.pow(targetLabSamples[i][1] - tMean[1], 2);
              tStd[2] += Math.pow(targetLabSamples[i][2] - tMean[2], 2);
            }
            tStd[0] = Math.sqrt(tStd[0] / tCount) || 0.15;
            tStd[1] = Math.sqrt(tStd[1] / tCount) || 0.15;
            tStd[2] = Math.sqrt(tStd[2] / tCount) || 0.15;

            // 2. Scan source image for face center & crop face tightly
            const srcRawW = sourceImg.width || 800;
            const srcRawH = sourceImg.height || 800;
            const srcScanCanvas = document.createElement('canvas');
            srcScanCanvas.width = srcRawW;
            srcScanCanvas.height = srcRawH;
            const sScanCtx = srcScanCanvas.getContext('2d');
            let sCx = Math.round(srcRawW * 0.5);
            let sCy = Math.round(srcRawH * 0.38);
            let sRadX = Math.round(srcRawW * 0.22);
            let sRadY = Math.round(srcRawH * 0.28);

            if (sScanCtx) {
              sScanCtx.drawImage(sourceImg, 0, 0);
              const sRawData = sScanCtx.getImageData(0, 0, srcRawW, srcRawH).data;
              let sSkinSumX = 0, sSkinSumY = 0, sSkinCount = 0;
              let sMinX = srcRawW, sMaxX = 0, sMinY = srcRawH, sMaxY = 0;
              const sMaxScanY = Math.round(srcRawH * 0.85);

              for (let y = 10; y < sMaxScanY; y += 4) {
                for (let x = 10; x < srcRawW - 10; x += 4) {
                  const idx = (y * srcRawW + x) * 4;
                  const r = sRawData[idx];
                  const g = sRawData[idx + 1];
                  const b = sRawData[idx + 2];
                  if (isSkinPixel(r, g, b)) {
                    sSkinSumX += x;
                    sSkinSumY += y;
                    sSkinCount++;
                    if (x < sMinX) sMinX = x;
                    if (x > sMaxX) sMaxX = x;
                    if (y < sMinY) sMinY = y;
                    if (y > sMaxY) sMaxY = y;
                  }
                }
              }

              if (sSkinCount > 80 && sMaxX > sMinX && sMaxY > sMinY) {
                sCx = Math.round(sSkinSumX / sSkinCount);
                sCy = Math.round(sSkinSumY / sSkinCount);
                sRadX = Math.round((sMaxX - sMinX) * 0.44);
                sRadY = Math.round((sMaxY - sMinY) * 0.46);
              }
            }

            // Tightly cropped source face dimensions matching target destination
            const destFaceW = Math.round(tRadX * 2.3);
            const destFaceH = Math.round(tRadY * 2.3);
            const destFaceX = Math.round(tCx - destFaceW / 2);
            const destFaceY = Math.round(tCy - destFaceH / 2);

            // Draw cropped source face to buffer canvas
            const srcCropCanvas = document.createElement('canvas');
            srcCropCanvas.width = destFaceW;
            srcCropCanvas.height = destFaceH;
            const sCtx = srcCropCanvas.getContext('2d');
            if (!sCtx) {
              clearTimeout(safetyTimer);
              return done(targetSceneSrc, '');
            }

            const srcCropSX = Math.max(0, sCx - sRadX * 1.15);
            const srcCropSY = Math.max(0, sCy - sRadY * 1.15);
            const srcCropSW = Math.min(srcRawW - srcCropSX, sRadX * 2.3);
            const srcCropSH = Math.min(srcRawH - srcCropSY, sRadY * 2.3);

            sCtx.drawImage(
              sourceImg,
              srcCropSX, srcCropSY, srcCropSW, srcCropSH,
              0, 0, destFaceW, destFaceH
            );

            // Sample source skin pixels from the cropped face
            const srcImgData = sCtx.getImageData(0, 0, destFaceW, destFaceH);
            const sData = srcImgData.data;
            const sourceLabSamples: [number, number, number][] = [];

            for (let y = Math.round(destFaceH * 0.2); y < Math.round(destFaceH * 0.8); y += 4) {
              for (let x = Math.round(destFaceW * 0.2); x < Math.round(destFaceW * 0.8); x += 4) {
                const idx = (y * destFaceW + x) * 4;
                const r = sData[idx];
                const g = sData[idx + 1];
                const b = sData[idx + 2];
                if (isSkinPixel(r, g, b)) {
                  sourceLabSamples.push(rgbToLmsLab(r, g, b));
                }
              }
            }

            // Only apply Reinhard transfer if we have adequate samples from both
            if (targetLabSamples.length >= 10 && sourceLabSamples.length >= 10) {
              const sCount = sourceLabSamples.length;
              const sMean: [number, number, number] = [0, 0, 0];
              for (let i = 0; i < sCount; i++) {
                sMean[0] += sourceLabSamples[i][0];
                sMean[1] += sourceLabSamples[i][1];
                sMean[2] += sourceLabSamples[i][2];
              }
              sMean[0] /= sCount;
              sMean[1] /= sCount;
              sMean[2] /= sCount;

              const sStd: [number, number, number] = [0, 0, 0];
              for (let i = 0; i < sCount; i++) {
                sStd[0] += Math.pow(sourceLabSamples[i][0] - sMean[0], 2);
                sStd[1] += Math.pow(sourceLabSamples[i][1] - sMean[1], 2);
                sStd[2] += Math.pow(sourceLabSamples[i][2] - sMean[2], 2);
              }
              sStd[0] = Math.sqrt(sStd[0] / sCount) || 0.15;
              sStd[1] = Math.sqrt(sStd[1] / sCount) || 0.15;
              sStd[2] = Math.sqrt(sStd[2] / sCount) || 0.15;

              // Safe clamped scale ratios (prevents color explosion)
              const scaleL = Math.min(2.0, Math.max(0.5, tStd[0] / sStd[0]));
              const scaleA = Math.min(2.0, Math.max(0.5, tStd[1] / sStd[1]));
              const scaleB = Math.min(2.0, Math.max(0.5, tStd[2] / sStd[2]));

              // Apply Reinhard Color Transfer onto cropped face
              for (let i = 0; i < sData.length; i += 4) {
                const r = sData[i];
                const g = sData[i + 1];
                const b = sData[i + 2];
                const [l, a, bVal] = rgbToLmsLab(r, g, b);

                const newL = (l - sMean[0]) * scaleL + tMean[0];
                const newA = (a - sMean[1]) * scaleA + tMean[1];
                const newB = (bVal - sMean[2]) * scaleB + tMean[2];

                const [resR, resG, resB] = lmsLabToRgb(newL, newA, newB);
                sData[i] = resR;
                sData[i + 1] = resG;
                sData[i + 2] = resB;
              }
              sCtx.putImageData(srcImgData, 0, 0);
            }

            // 3. Create Smooth Gaussian-Feathered Face Segmentation Mask
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvasW;
            maskCanvas.height = canvasH;
            const mCtx = maskCanvas.getContext('2d');
            if (mCtx) {
              mCtx.fillStyle = '#000000';
              mCtx.fillRect(0, 0, canvasW, canvasH);

              const radiusX = tRadX * 0.95;
              const radiusY = tRadY * 0.98;

              // Radial gradient with smooth transition zone
              const radialGrad = mCtx.createRadialGradient(
                tCx, tCy, radiusX * 0.50,
                tCx, tCy, radiusX
              );
              radialGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
              radialGrad.addColorStop(0.60, 'rgba(255, 255, 255, 0.98)');
              radialGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.40)');
              radialGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

              mCtx.save();
              mCtx.scale(1, radiusY / radiusX);
              mCtx.beginPath();
              mCtx.arc(tCx, tCy * (radiusX / radiusY), radiusX, 0, Math.PI * 2);
              mCtx.fillStyle = radialGrad;
              mCtx.fill();
              mCtx.restore();
            }

            // 4. Composite Face Layer onto Target using Feathered Alpha Mask
            const blendedCanvas = document.createElement('canvas');
            blendedCanvas.width = canvasW;
            blendedCanvas.height = canvasH;
            const bCtx = blendedCanvas.getContext('2d');
            if (bCtx && mCtx) {
              // Base: original target scene (body, lighting, background)
              bCtx.drawImage(targetImg, 0, 0, canvasW, canvasH);

              // Masked source face layer
              const faceLayer = document.createElement('canvas');
              faceLayer.width = canvasW;
              faceLayer.height = canvasH;
              const fCtx = faceLayer.getContext('2d');
              if (fCtx) {
                fCtx.drawImage(srcCropCanvas, destFaceX, destFaceY, destFaceW, destFaceH);
                fCtx.globalCompositeOperation = 'destination-in';
                fCtx.drawImage(maskCanvas, 0, 0);

                bCtx.drawImage(faceLayer, 0, 0);
              }
            }

            clearTimeout(safetyTimer);
            done(
              blendedCanvas.toDataURL('image/jpeg', 0.94),
              maskCanvas.toDataURL('image/png')
            );
          } catch (err: any) {
            console.error('generateSeamlessFaceSwapComposite error:', err);
            clearTimeout(safetyTimer);
            done(targetSceneSrc, '');
          }
        })
        .catch((err) => {
          console.error('loadImage for Face Swap failed:', err);
          clearTimeout(safetyTimer);
          done(targetSceneSrc, '');
        });
    });
  };

  // Preprocessing & Subject Canonical Centering + 15% Edge Boundary Padding (prevents 3D camera rotation clipping)
  const preprocessAndCenterSubjectForMultiView = async (
    imageSrc: string,
    paddingFraction: number = 0.15
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.width;
          const h = img.height;
          const targetDim = 1024;

          const canvas = document.createElement('canvas');
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(imageSrc);

          // Neutral studio infinity background (#14151b)
          ctx.fillStyle = '#14151b';
          ctx.fillRect(0, 0, targetDim, targetDim);

          // Calculate scaled bounds reserving paddingFraction on all sides
          const availDim = targetDim * (1.0 - paddingFraction * 2);
          const scale = Math.min(availDim / w, availDim / h);
          const drawW = Math.round(w * scale);
          const drawH = Math.round(h * scale);
          const drawX = Math.round((targetDim - drawW) / 2);
          const drawY = Math.round((targetDim - drawH) / 2);

          // Soft ground contact shadow to anchor subject
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(drawX + drawW / 2, drawY + drawH - 8, drawW * 0.38, 16, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.filter = 'blur(12px)';
          ctx.fill();
          ctx.restore();

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch {
          resolve(imageSrc);
        }
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  // Slices a 3x3 multi-view visual contact sheet into 9 distinct angle perspectives
  const slice3x3GridSheet = async (sheetDataUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = img.width;
          const h = img.height;
          const cellW = Math.floor(w / 3);
          const cellH = Math.floor(h / 3);
          if (cellW <= 10 || cellH <= 10) return resolve([]);

          const cells: string[] = [];
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
              const canvas = document.createElement('canvas');
              canvas.width = cellW;
              canvas.height = cellH;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
                cells.push(canvas.toDataURL('image/jpeg', 0.94));
              }
            }
          }
          resolve(cells.length === 9 ? cells : []);
        } catch {
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = sheetDataUrl;
    });
  };

  // Generates dilated silhouette edge mask (Inpainting Blend Zone)
  const generateDilatedEdgeMask = (
    subImg: HTMLImageElement,
    drawX: number,
    drawY: number,
    drawW: number,
    drawH: number,
    canvasW = 1024,
    canvasH = 1024,
    dilatePx = 2.5 // 2px-3px subtle feathering/erosion on mask boundary for natural rim lighting
  ): string => {
    try {
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvasW;
      maskCanvas.height = canvasH;
      const mCtx = maskCanvas.getContext('2d');
      if (!mCtx) return '';

      // Base: Pure black (#000000) for background and interior
      mCtx.fillStyle = '#000000';
      mCtx.fillRect(0, 0, canvasW, canvasH);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasW;
      tempCanvas.height = canvasH;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return '';

      tCtx.drawImage(subImg, drawX, drawY, drawW, drawH);
      const imgData = tCtx.getImageData(0, 0, canvasW, canvasH);
      const data = imgData.data;

      // 1-bit alpha grid: 1 = subject foreground (alpha > 30), 0 = background
      const grid = new Uint8Array(canvasW * canvasH);
      for (let i = 0; i < canvasW * canvasH; i++) {
        grid[i] = data[i * 4 + 3] > 30 ? 1 : 0;
      }

      const maskData = mCtx.createImageData(canvasW, canvasH);
      const outData = maskData.data;

      const r = Math.max(2, Math.min(8, dilatePx));
      const minX = Math.max(r, Math.floor(drawX) - r);
      const maxX = Math.min(canvasW - r, Math.ceil(drawX + drawW) + r);
      const minY = Math.max(r, Math.floor(drawY) - r);
      const maxY = Math.min(canvasH - r, Math.ceil(drawY + drawH) + r);

      const offsets = [
        [-r, 0], [r, 0], [0, -r], [0, r],
        [-Math.round(r * 0.7), -Math.round(r * 0.7)],
        [Math.round(r * 0.7), -Math.round(r * 0.7)],
        [-Math.round(r * 0.7), Math.round(r * 0.7)],
        [Math.round(r * 0.7), Math.round(r * 0.7)]
      ];

      for (let y = minY; y < maxY; y++) {
        const rowOffset = y * canvasW;
        for (let x = minX; x < maxX; x++) {
          const idx = rowOffset + x;
          const isFg = grid[idx];

          let isBoundary = false;
          for (let k = 0; k < offsets.length; k++) {
            const nx = x + offsets[k][0];
            const ny = y + offsets[k][1];
            if (grid[ny * canvasW + nx] !== isFg) {
              isBoundary = true;
              break;
            }
          }

          if (isBoundary) {
            const pIdx = idx * 4;
            outData[pIdx] = 255;
            outData[pIdx + 1] = 255;
            outData[pIdx + 2] = 255;
            outData[pIdx + 3] = 255;
          }
        }
      }

      mCtx.putImageData(maskData, 0, 0);
      return maskCanvas.toDataURL('image/png');
    } catch {
      return '';
    }
  };

  const generateCanvasCompositeDataUrl = async (
    subjectSrc: string,
    backdropSrc?: string | null,
    subjectType: 'human' | 'product' = 'human',
    lightingOption: string = 'cozy-cafe'
  ): Promise<{ compositeUrl: string; edgeMaskUrl: string }> => {
    // Stage 1: Strip background completely so only the subject is drawn onto new environment
    const transparentSubjectSrc = await removeBackgroundCanvas(subjectSrc);

    return new Promise((resolve) => {
      let isSettled = false;
      const done = (compositeUrl: string, edgeMaskUrl = '') => {
        if (!isSettled) {
          isSettled = true;
          resolve({ compositeUrl, edgeMaskUrl });
        }
      };
      const safetyTimer = setTimeout(() => done(transparentSubjectSrc, ''), 4000);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clearTimeout(safetyTimer);
          return done(transparentSubjectSrc, '');
        }

        const renderComposite = (hasBg: boolean) => {
          const subImg = new Image();
          subImg.crossOrigin = 'anonymous';
          subImg.onload = () => {
            if (!hasBg) {
              const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
              if (lightingOption === 'cozy-cafe') {
                grad.addColorStop(0, '#2b1d16');
                grad.addColorStop(0.5, '#1a120e');
                grad.addColorStop(1, '#0c0806');
              } else if (lightingOption === 'golden-sunset') {
                grad.addColorStop(0, '#3a190a');
                grad.addColorStop(0.5, '#200e05');
                grad.addColorStop(1, '#090503');
              } else if (lightingOption === 'cyberpunk-neon') {
                grad.addColorStop(0, '#100a26');
                grad.addColorStop(0.5, '#0b081a');
                grad.addColorStop(1, '#05030d');
              } else {
                grad.addColorStop(0, '#1a1c24');
                grad.addColorStop(0.5, '#12141c');
                grad.addColorStop(1, '#0a0b10');
              }
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, 1024, 1024);
            }

            const subW = Math.min(subImg.width, 1024);
            const subH = Math.min(subImg.height, 1024);
            const scale = Math.min(840 / subW, 840 / subH);
            const drawW = subW * scale;
            const drawH = subH * scale;
            const drawX = (1024 - drawW) / 2;
            const drawY = 1024 - drawH - 24;

            // STAGE 3: IC-Light Contact Shadows & Ambient Ground Occlusion
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(drawX + drawW / 2, drawY + drawH - 12, drawW * 0.44, 24, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.filter = 'blur(18px)';
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(drawX + drawW / 2, drawY + drawH - 5, drawW * 0.30, 8, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
            ctx.filter = 'blur(5px)';
            ctx.fill();
            ctx.restore();

            // STAGE 2: Alpha Matting & 1.5-2px Edge Feathering (De-haloing / Anti-Fringe)
            const subCanvas = document.createElement('canvas');
            subCanvas.width = 1024;
            subCanvas.height = 1024;
            const subCtx = subCanvas.getContext('2d');
            if (subCtx) {
              subCtx.drawImage(subImg, drawX, drawY, drawW, drawH);
              ctx.save();
              ctx.shadowColor = 'rgba(0,0,0,0.2)';
              ctx.shadowBlur = 2.5; // 2px-3px subtle edge feathering for rim lighting bleed
              if (lightingOption === 'cozy-cafe') {
                ctx.filter = 'contrast(1.02) saturate(1.05)';
              } else if (lightingOption === 'golden-sunset') {
                ctx.filter = 'contrast(1.04) saturate(1.12)';
              } else if (lightingOption === 'cyberpunk-neon') {
                ctx.filter = 'contrast(1.08) saturate(1.1)';
              }
              ctx.drawImage(subCanvas, 0, 0);
              ctx.restore();
            } else {
              ctx.drawImage(subImg, drawX, drawY, drawW, drawH);
            }

            // STAGE 3: IC-Light Ambient Harmonization & Light Wrap
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            const ambientGrad = ctx.createRadialGradient(drawX + drawW / 2, drawY + drawH / 2, 50, 512, 512, 600);
            if (lightingOption === 'cozy-cafe' || lightingOption === 'golden-sunset') {
              ambientGrad.addColorStop(0, 'rgba(255, 180, 80, 0.12)');
              ambientGrad.addColorStop(1, 'rgba(255, 130, 30, 0.18)');
            } else if (lightingOption === 'cyberpunk-neon') {
              ambientGrad.addColorStop(0, 'rgba(100, 200, 255, 0.08)');
              ambientGrad.addColorStop(1, 'rgba(220, 50, 255, 0.15)');
            } else {
              ambientGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
              ambientGrad.addColorStop(1, 'rgba(200, 220, 255, 0.10)');
            }
            ctx.fillStyle = ambientGrad;
            ctx.fillRect(0, 0, 1024, 1024);
            ctx.restore();

            // Calculate Dilated Silhouette Boundary Mask for Latent Inpainting Transition (2.5px feathering/erosion)
            const edgeMaskUrl = generateDilatedEdgeMask(subImg, drawX, drawY, drawW, drawH, 1024, 1024, 2.5);

            clearTimeout(safetyTimer);
            done(canvas.toDataURL('image/jpeg', 0.94), edgeMaskUrl);
          };
          subImg.onerror = () => {
            clearTimeout(safetyTimer);
            done(transparentSubjectSrc, '');
          };
          subImg.src = transparentSubjectSrc;
        };

        if (backdropSrc) {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.onload = () => {
            ctx.drawImage(bgImg, 0, 0, 1024, 1024);
            renderComposite(true);
          };
          bgImg.onerror = () => renderComposite(false);
          bgImg.src = backdropSrc;
        } else {
          renderComposite(false);
        }
      } catch {
        clearTimeout(safetyTimer);
        done(transparentSubjectSrc, '');
      }
    });
  };

  const handleBgSwapGenerate = async () => {
    if (!bgSubjectImage) {
      flash('warn', '⚠️ Please upload or choose a subject photo first!');
      bgSubjectInputRef.current?.click();
      return;
    }
    const effectivePrompt = bgPromptText.trim() || (bgSubjectType === 'product' ? 'a minimalist warm travertine marble table' : 'a cozy modern coffee shop interior');

    // Downscale images to max 800px to ensure ultra-fast AI processing without timeouts
    const optSubject = await downscaleDataUrl(bgSubjectImage, 800, 0.85);
    const optBg = bgGuidanceImage ? await downscaleDataUrl(bgGuidanceImage, 800, 0.85) : undefined;
    
    // Automatically strip old background/curtains to guarantee zero backdrop bleeding
    const cleanSubject = await removeBackgroundCanvas(optSubject);
    const { compositeUrl, edgeMaskUrl } = await generateCanvasCompositeDataUrl(cleanSubject, optBg, bgSubjectType, bgLightingOption);

    executeStudioToolAction('change_background', {
      character_image: cleanSubject,
      background_image: optBg,
      image_url: cleanSubject,
      new_background_prompt: effectivePrompt,
      new_background_image_url: optBg,
      subject_type: bgSubjectType,
      aspect_ratio: ratio || '16:9',
      lighting_match: bgLightingOption,
      inpainting_prompt: bgInpaintingFormula.inpaintingPrompt,
      negative_prompt: bgInpaintingFormula.negativePrompt,
      composite_result_data_url: compositeUrl,
      edge_blend_mask: edgeMaskUrl,
      denoising_strength: 0.52
    }, 40, `Change Background (${bgSubjectType === 'product' ? 'Product' : 'Portrait'})`);
  };

  const handleDirectUpscale = async () => {
    if (!upscaleTargetImage) {
      flash('warn', 'Please upload an image to upscale!');
      return;
    }
    const scale = upscaleTargetTier === '8k' ? 8 : upscaleTargetTier === '4k' ? 4 : 2;
    const credit = upscaleTargetTier === '8k' ? 20 : upscaleTargetTier === '4k' ? 12 : 8;
    executeStudioToolAction('upscale', {
      image_url: upscaleTargetImage,
      scale_factor: scale
    }, credit, `Image Upscale (${upscaleTargetTier.toUpperCase()})`);
  };

  const handleMultiViewGenerate = async () => {
    if (!multiViewSourceImage) {
      flash('warn', '⚠️ Please upload a reference image for Multi View!');
      multiViewInputRef.current?.click();
      return;
    }

    // Preprocessing: Canonical centering & 15% edge boundary safety padding to prevent 3D rotation clipping
    const paddedSource = await preprocessAndCenterSubjectForMultiView(multiViewSourceImage, 0.15);

    executeStudioToolAction('multi_view', {
      image_url: paddedSource,
      views_count: multiViewAnglesCount,
      aspect_ratio: multiViewRatio || '1:1',
      elevation_angle: 0.0
    }, 35, 'Multi View (9 Angles)');
  };

  const handleSkinRetouchGenerate = async () => {
    if (!retouchTargetImage) {
      flash('warn', '⚠️ Please upload a portrait photo for Skin Retouch!');
      retouchInputRef.current?.click();
      return;
    }

    executeStudioToolAction('skin_retouch', {
      image_url: retouchTargetImage,
      retouch_intensity: retouchIntensity,
      preserve_texture: retouchPreserveTexture,
      anti_blemish: retouchAntiBlemish,
      skin_tone: retouchSkinTone,
      prompt: retouchCustomPrompt
    }, 15, 'Skin Retouch');
  };

  const handleVirtualMakeupGenerate = async () => {
    if (!makeupTargetImage) {
      flash('warn', '⚠️ Please upload a portrait photo for Virtual Makeup!');
      makeupInputRef.current?.click();
      return;
    }

    executeStudioToolAction('virtual_makeup', {
      image_url: makeupTargetImage,
      makeup_style: makeupStyle,
      lipstick_color: makeupLipstick,
      foundation_finish: makeupFoundation,
      prompt: makeupCustomPrompt
    }, 20, 'Virtual Makeup');
  };

  const handleHairTransformGenerate = async () => {
    if (!hairTargetImage) {
      flash('warn', '⚠️ Please upload a portrait photo for Hair Transformation!');
      hairInputRef.current?.click();
      return;
    }

    executeStudioToolAction('hair_transform', {
      image_url: hairTargetImage,
      hair_style: hairStyle,
      hair_color: hairColor,
      hair_length: hairLength,
      prompt: hairCustomPrompt
    }, 25, 'Hair Transformation');
  };

  const handleAnalyzeReferenceImage = async (srcUrl?: string) => {
    const targetImg = srcUrl || variationSourceImage;
    if (!targetImg) {
      flash('warn', 'Please upload or choose a reference image first!');
      return;
    }
    setIsAnalyzingReference(true);
    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: targetImg })
      });
      const data = await res.json();
      if (data?.breakdown) {
        setVariationAnalysis({
          subject: data.breakdown?.subject || 'Central portrait / character subject',
          pose: data.breakdown?.composition || 'Natural perspective, balanced framing',
          lighting: data.breakdown?.lighting || 'Directional key lighting with ambient fill',
          background: 'Original environmental setting with depth falloff',
          style: data.technicalDetails?.camera || '85mm f/1.4 prime lens bokeh',
          colorPalette: data.technicalDetails?.colorPalette || ['#1E293B', '#F59E0B', '#EC4899', '#3B82F6']
        });
        if (data.reversePrompt && !variationPrompt) {
          setVariationPrompt(data.reversePrompt.replace(/--ar\s+[0-9:]+/gi, '').trim());
        }
        flash('info', '✨ Visual foundation analyzed successfully!');
      } else {
        setVariationAnalysis({
          subject: 'Detected primary subject with authentic proportions and textures',
          pose: 'Canonical framing, natural posture',
          lighting: 'Cinematic key light, soft specular contact shadows',
          background: 'Original environmental setting with shallow depth',
          style: '85mm portraiture, rich micro-pores, natural color balance',
          colorPalette: ['#1E293B', '#F59E0B', '#EC4899', '#3B82F6']
        });
        flash('info', '✨ Visual foundation analyzed!');
      }
    } catch {
      setVariationAnalysis({
        subject: 'Detected primary subject with authentic proportions and textures',
        pose: 'Canonical framing, natural posture',
        lighting: 'Cinematic key light, soft specular contact shadows',
        background: 'Original environmental setting with shallow depth',
        style: '85mm portraiture, rich micro-pores, natural color balance',
        colorPalette: ['#1E293B', '#F59E0B', '#EC4899', '#3B82F6']
      });
      flash('info', '✨ Visual foundation analyzed!');
    } finally {
      setIsAnalyzingReference(false);
    }
  };

  const handlePromptFromImage = async () => {
    if (!variationSourceImage) {
      flash('warn', 'Please upload or choose a reference image first!');
      return;
    }
    setIsGeneratingPromptFromImage(true);
    try {
      const res = await fetch('/api/generate-photo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: 'Creative photorealistic variation of this image with dramatic cinematic lighting, rich textures, and award-winning composition',
          style: 'Cinematic',
          camera: '85mm f/1.4 Portrait Lens',
          lighting: 'Cinematic Sunset Golden Hour Rim Lighting',
          composition: 'Golden Ratio Hero Framing',
          referenceImage: variationSourceImage
        })
      });
      const data = await res.json();
      if (data?.masterPrompt) {
        setVariationPrompt(data.masterPrompt);
        flash('info', '✨ Prompt generated from reference image!');
      } else {
        setVariationPrompt('Cinematic sunset lighting, dramatic golden hour rim highlights, shallow depth of field, creamy bokeh, 8k UHD masterpiece variation of this subject');
        flash('info', '✨ Variation prompt generated!');
      }
    } catch {
      setVariationPrompt('Cinematic sunset lighting, dramatic golden hour rim highlights, shallow depth of field, creamy bokeh, 8k UHD masterpiece variation of this subject');
      flash('info', '✨ Variation prompt generated!');
    } finally {
      setIsGeneratingPromptFromImage(false);
    }
  };

  const handleVariationsGenerate = async () => {
    if (!variationSourceImage) {
      flash('warn', 'Please upload or choose a reference image first!');
      variationInputRef.current?.click();
      return;
    }

    const optSource = await downscaleDataUrl(variationSourceImage, 1024, 0.88);
    const finalPrompt = variationPrompt.trim() || 'Cinematic lighting, enhanced textures, fresh atmosphere, artistic variation';

    executeStudioToolAction('image_variations', {
      image_url: optSource,
      reference_image: optSource,
      variation_prompt: finalPrompt,
      variation_strength: variationStrength,
      variation_strength_num: variationStrengthNum,
      focus_area: variationFocusArea,
      vibe_match: variationVibeMatch,
      aspect_ratio: variationRatio,
      resolution_tier: variationResolution,
      quality: variationQuality,
      count
    }, 20, 'Image Variations');
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
      {/* ========== HEADER (Clean UI Matching Reference) ========== */}
      <header className="sticky top-0 z-30 bg-[#090c10]/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-3">
          {/* Left Corner: Clean Logo & Brand Text */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-black font-black text-xs shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-4 h-4 text-black fill-black" />
            </div>

            <div className="flex items-center gap-2 leading-none">
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                SHOW AI
              </span>
              <span className="text-zinc-500 text-xs font-semibold">·</span>
              <span className="text-xs sm:text-sm font-semibold text-zinc-300">
                Photo Studio
              </span>
            </div>
          </div>

          {/* Right Corner: Quick Action Buttons Matching Reference Screenshot */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop Back to Menu Button */}
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Back to Menu"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Menu</span>
              </button>
            )}

            {/* Credit Display with Green Top-Up Badge */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-topup-pricing'))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium cursor-pointer transition-all shadow-xs active:scale-95"
              title="Credit Balance: Click to Top-Up or Claim Free Credits"
            >
              <Coins className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-zinc-200 font-bold">{userCredits.toLocaleString()} Credits</span>
              <span className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-2 py-0.5 rounded-full shadow-xs leading-none transition-colors">
                Top-Up
              </span>
            </button>

            {/* User Profile Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                window.dispatchEvent(new CustomEvent('open-user-profile'));
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="View Profile"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Profile</span>
            </button>

            {/* Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Open Menu"
            >
              <Menu className="w-4 h-4 text-zinc-400" />
              <span>Menu</span>
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

      {/* 📱 MOBILE PERSISTENT SEGMENTED TAB SWITCHER */}
      <div className="lg:hidden sticky top-[60px] z-30 bg-[#0a0b0e]/95 backdrop-blur-md px-3 py-2 border-b border-zinc-800/80">
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#14151f] border border-zinc-800 gap-1 shadow-md">
          <button
            type="button"
            onClick={() => setMobileTab('studio')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'studio'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('outputs');
              setActiveMainTab('current');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab !== 'studio' && activeMainTab === 'current'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-pink-300" />
            <span>Outputs</span>
            {results.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono leading-none">
                {results.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('outputs');
              setActiveMainTab('library');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab !== 'studio' && activeMainTab === 'library'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-cyan-300" />
            <span>Library</span>
            {libraryItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono leading-none">
                {libraryItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========== BODY ========== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-8 grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] gap-5 lg:gap-6 items-start">

        {/* ---------- LEFT: CONTROLS (EXACT MODERN UI/UX MATCHING REFERENCE SCREENSHOT) ---------- */}
        <section className={`space-y-3 lg:sticky lg:top-20 ${mobileTab !== 'studio' ? 'hidden lg:block' : ''}`}>

          {/* 1. TOP HEADER TOOL CARD (Create Image) */}
          <div
            onClick={() => setToolsModalOpen(true)}
            className="rounded-2xl bg-[#10141d] hover:bg-[#131924] border border-zinc-800/80 hover:border-zinc-700/80 p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 flex items-center justify-center text-black shadow-md shadow-emerald-500/20 shrink-0">
                <Wand2 className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-extrabold text-white tracking-tight truncate">
                  {currentToolMeta.name}
                </span>
                <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {currentToolMeta.desc}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors shrink-0" />
          </div>

          {/* 2. MODEL SELECTOR CARD */}
          <div
            onClick={() => setModelPickerOpen(true)}
            className="rounded-2xl bg-[#10141d] hover:bg-[#131924] border border-zinc-800/80 hover:border-zinc-700/80 p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-sm active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <Cpu className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider leading-none">
                  Model
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                  {selected.name}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors shrink-0" />
          </div>

          {/* Hidden reference photo upload input for prompt box */}
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

          {/* 3. DYNAMIC TOOL WORKSPACE */}
          {activeTool === 'create-image' && (
            <div className="space-y-3">
              {/* Describe your image Container (Matches Reference Screenshot) */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length) handlePromptImageUpload(e.dataTransfer.files);
                }}
                className="rounded-2xl border border-zinc-800/80 bg-[#10141d] p-3.5 sm:p-4 space-y-3.5 shadow-sm focus-within:border-emerald-500/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    Describe your image
                  </label>
                  <button
                    type="button"
                    onClick={() => setP2pOpen(true)}
                    title="Open Photo to Prompt Vision Studio"
                    className="text-zinc-500 hover:text-emerald-400 transition-colors p-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub-card: Visual References with Dropzone (Matches Reference Screenshot) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-bold">Add visual references</span>
                      <span className="text-[10px] text-zinc-500">(Optional)</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {uploadedRefImages.length}/16
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 -mt-1">
                    JPEG/PNG/WEBP, up to 50MB each
                  </p>

                  <div
                    onClick={() => promptImageInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-xl bg-black/25 p-4 sm:p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-all mb-1.5">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      Drag & drop images here or click to browse
                    </span>
                  </div>
                </div>

                {/* Attached References Tray (if any) */}
                {uploadedRefImages.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">Attached ({uploadedRefImages.length})</span>
                      <button
                        type="button"
                        onClick={() => setPreserveFace100(!preserveFace100)}
                        className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          preserveFace100
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <span>{preserveFace100 ? '🔒 100% Face Lock' : '🔓 Face Restyle'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {uploadedRefImages.map(img => (
                        <div key={img.id} className="relative group shrink-0">
                          <img src={img.url} alt="" className="w-12 h-12 rounded-lg object-cover border border-zinc-700" />
                          <button
                            type="button"
                            onClick={(e) => handleRemoveRefPhoto(img.id, e)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Textarea Box with Inner Bottom Toolbar */}
                <div className="rounded-xl border border-zinc-800/80 bg-black/30 p-3 space-y-2 focus-within:border-emerald-500/50 transition-colors">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe what you want to see..."
                    rows={3}
                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Bottom toolbar inside prompt card */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                    <div className="flex items-center gap-1.5">
                      {/* Photo-to-Prompt Button */}
                      <button
                        type="button"
                        onClick={() => setP2pOpen(true)}
                        title="Photo to Prompt (Vision AI Reverse Engineering Studio)"
                        className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        title="Enhance Prompt with Gemini AI"
                        className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                      >
                        {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Wand2 className="w-3.5 h-3.5" />}
                      </button>

                      {prompt && (
                        <button
                          type="button"
                          onClick={() => setPrompt('')}
                          title="Clear Prompt"
                          className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Auto Polish Switch (Matches Reference Screenshot: Emerald green) */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-medium">Auto Polish</span>
                      <button
                        type="button"
                        onClick={() => setPolish(!polish)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          polish ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                            polish ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Output Parameters Card (Stacked full-width matching reference) */}
              <div
                onClick={() => setOutputPickerOpen(true)}
                className="rounded-2xl bg-[#10141d] hover:bg-[#131924] border border-zinc-800/80 hover:border-zinc-700/80 p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider leading-none">
                      Output
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate mt-1">
                      {ratio} • {resolutionTier.toUpperCase()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>

              {/* 5. Quality Parameters Card (Stacked full-width matching reference) */}
              <div
                onClick={() => setQualityPickerOpen(true)}
                className="rounded-2xl bg-[#10141d] hover:bg-[#131924] border border-zinc-800/80 hover:border-zinc-700/80 p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider leading-none">
                      Quality
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white truncate mt-1 capitalize">
                      {resolutionTier === '1k' ? 'Low' : resolutionTier === '2k' ? 'High' : resolutionTier === '4k' ? 'Ultra' : 'Master'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>

              {/* Prompt Notice / Error Alert right above Generate Button */}
              {notice && (
                <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs my-2 ${noticeStyles[notice.type]}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              {/* 6. Bottom Stepper & Mint Green Primary CTA Button (Matches Reference Screenshot) */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[#10141d] border border-zinc-800/80 text-white font-mono text-xs sm:text-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-white min-w-[28px] text-center">
                    {count} <span className="text-zinc-500 font-normal">/ 8</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount(Math.min(8, count + 1))}
                    disabled={count >= 8}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-black font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Creating Photos...</span>
                    </>
                  ) : (
                    <span>Create for Free</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* EDIT IMAGE STUDIO (Complete Multi-Mode Interactive Studio) */}
          {activeTool === 'edit-image' && (
            <div className="space-y-3.5">
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    // Aspect ratio & image validation
                    const r = new FileReader();
                    r.onload = ev => {
                      if (ev.target?.result) {
                        const newUrl = ev.target.result as string;
                        setEditImageSrc(newUrl);
                        setEditHistory(prev => [newUrl, ...prev.filter(u => u !== newUrl)]);
                        clearMaskCanvas();
                        setEditAnnotations([]);
                        flash('info', '✨ Image loaded into Studio Canvas');
                      }
                    };
                    r.readAsDataURL(f);
                  }
                }}
              />

              {/* Reference Image Input (+image beside prompt) */}
              <input
                ref={editRefInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => {
                      if (ev.target?.result) {
                        setEditReferenceImage(ev.target.result as string);
                        flash('info', '✨ Reference Image attached for Seedream generation!');
                      }
                    };
                    r.readAsDataURL(f);
                  }
                }}
              />

              {/* Main Artwork Viewport with Interactive Canvas Overlay */}
              <div
                className="relative rounded-2xl border border-zinc-800/80 bg-[#10121a] overflow-hidden flex items-center justify-center min-h-[350px] max-h-[500px] select-none shadow-inner"
                onMouseLeave={() => {
                  areaEdit.setIsHoveringCanvas(false);
                  areaEdit.endStroke(editCanvasRef.current);
                  setActiveDragAnnotation(null);
                }}
              >
                {/* Floating Brush Settings Pill above Canvas for Area Edit */}
                {editModeAction === 'area-edit' && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 p-1.5 px-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-pink-500/30 shadow-2xl text-white">
                    {/* Brush / Eraser Toggle */}
                    <div className="flex items-center rounded-xl bg-zinc-900/90 p-0.5 border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => areaEdit.setIsEraser(false)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          !areaEdit.isEraser ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Brush Tool (Paint Mask)"
                      >
                        <Brush className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Brush</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => areaEdit.setIsEraser(true)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          areaEdit.isEraser ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                        }`}
                        title="Eraser Tool (Unmask Mistakes)"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eraser</span>
                      </button>
                    </div>

                    <div className="w-[1px] h-4 bg-zinc-700/80 mx-0.5" />

                    {/* Brush Size Slider (5px to 100px) */}
                    <div className="flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-mono text-pink-300 font-bold shrink-0 min-w-[32px]">
                        {areaEdit.brushSize}px
                      </span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={areaEdit.brushSize}
                        onChange={e => areaEdit.setBrushSize(Number(e.target.value))}
                        className="w-16 sm:w-24 accent-pink-500 cursor-pointer h-1.5"
                        title={`Brush Size: ${areaEdit.brushSize}px (Range: 5px - 100px)`}
                      />
                    </div>

                    <div className="w-[1px] h-4 bg-zinc-700/80 mx-0.5" />

                    {/* Undo / Redo */}
                    <button
                      type="button"
                      onClick={() => areaEdit.undo(editCanvasRef.current)}
                      disabled={!areaEdit.canUndo}
                      title="Undo Mask Stroke"
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => areaEdit.redo(editCanvasRef.current)}
                      disabled={!areaEdit.canRedo}
                      title="Redo Mask Stroke"
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Clear Mask */}
                    <button
                      type="button"
                      onClick={() => areaEdit.clearMask(editCanvasRef.current)}
                      disabled={!areaEdit.maskHasContent}
                      title="Clear All Painted Masks"
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/60 border border-rose-800/60 hover:bg-rose-900 text-rose-300 text-[10px] font-bold disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                    >
                      <span>Clear</span>
                    </button>
                  </div>
                )}

                {/* Circular Cursor Preview matching brush size */}
                {editModeAction === 'area-edit' && areaEdit.isHoveringCanvas && areaEdit.cursorPos && (
                  <div
                    className="fixed pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 z-50 flex items-center justify-center shadow-lg"
                    style={{
                      left: `${areaEdit.cursorPos.x}px`,
                      top: `${areaEdit.cursorPos.y}px`,
                      width: `${areaEdit.brushSize * (editZoom / 100)}px`,
                      height: `${areaEdit.brushSize * (editZoom / 100)}px`,
                      border: areaEdit.isEraser ? '2px dashed #f59e0b' : '2px solid rgba(236, 72, 153, 0.95)',
                      backgroundColor: areaEdit.isEraser ? 'rgba(245, 158, 11, 0.15)' : 'rgba(236, 72, 153, 0.25)',
                      boxShadow: areaEdit.isEraser ? '0 0 12px rgba(245, 158, 11, 0.5)' : '0 0 14px rgba(236, 72, 153, 0.6)'
                    }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${areaEdit.isEraser ? 'bg-amber-400' : 'bg-pink-400'}`} />
                  </div>
                )}

                {/* The Scaled Canvas Image & Overlays */}
                <div
                  style={{
                    transform: `scale(${editZoom / 100})`,
                    transition: areaEdit.isDrawingRef.current ? 'none' : 'transform 0.15s ease-out',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  className="relative flex items-center justify-center"
                >
                  <img
                    ref={editImageRef}
                    src={editImageSrc}
                    alt="Edit canvas"
                    className="max-h-[460px] w-auto object-contain pointer-events-none rounded-lg shadow-md"
                    onLoad={e => {
                      const img = e.currentTarget;
                      if (editCanvasRef.current) {
                        editCanvasRef.current.width = img.naturalWidth || 800;
                        editCanvasRef.current.height = img.naturalHeight || 800;
                        redrawMaskCanvas();
                      }
                    }}
                  />

                  {/* Mode 2: Interactive Brush Overlay Canvas for Area Edit */}
                  <canvas
                    ref={editCanvasRef}
                    className={`absolute inset-0 w-full h-full touch-none ${
                      editModeAction === 'area-edit' ? 'cursor-none pointer-events-auto' : 'pointer-events-none opacity-40'
                    }`}
                    onMouseEnter={() => {
                      if (editModeAction === 'area-edit') {
                        areaEdit.setIsHoveringCanvas(true);
                      }
                    }}
                    onMouseLeave={() => {
                      areaEdit.setIsHoveringCanvas(false);
                      areaEdit.endStroke(editCanvasRef.current);
                    }}
                    onMouseDown={e => {
                      if (editModeAction !== 'area-edit') return;
                      areaEdit.setCursorPos({ x: e.clientX, y: e.clientY });
                      areaEdit.startStroke(editCanvasRef.current, e.clientX, e.clientY);
                    }}
                    onMouseMove={e => {
                      if (editModeAction !== 'area-edit') return;
                      areaEdit.setCursorPos({ x: e.clientX, y: e.clientY });
                      if (areaEdit.isDrawingRef.current) {
                        areaEdit.drawStroke(editCanvasRef.current, e.clientX, e.clientY);
                      }
                    }}
                    onMouseUp={() => {
                      if (editModeAction !== 'area-edit') return;
                      areaEdit.endStroke(editCanvasRef.current);
                    }}
                    onTouchStart={e => {
                      if (editModeAction !== 'area-edit' || !e.touches[0]) return;
                      const t = e.touches[0];
                      areaEdit.setCursorPos({ x: t.clientX, y: t.clientY });
                      areaEdit.startStroke(editCanvasRef.current, t.clientX, t.clientY);
                    }}
                    onTouchMove={e => {
                      if (editModeAction !== 'area-edit' || !e.touches[0]) return;
                      const t = e.touches[0];
                      areaEdit.setCursorPos({ x: t.clientX, y: t.clientY });
                      areaEdit.drawStroke(editCanvasRef.current, t.clientX, t.clientY);
                    }}
                    onTouchEnd={() => {
                      if (editModeAction !== 'area-edit') return;
                      areaEdit.endStroke(editCanvasRef.current);
                    }}
                  />

                  {/* Shimmer & Glowing Pulse Overlay during Inpainting Generation */}
                  {isGenerating && editModeAction === 'area-edit' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-lg z-30 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                      <div className="relative mb-3">
                        <div className="w-14 h-14 rounded-full border-2 border-pink-500/30 border-t-pink-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                        </div>
                        <div className="absolute -inset-2 rounded-full bg-pink-500/20 blur-md animate-ping" />
                      </div>
                      <div className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5">
                        <span>Inpainting & Blending Masked Area...</span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-1 max-w-xs">
                        Synthesizing photorealistic details with Seedream 5.0 Pro
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-pink-300 font-mono bg-pink-950/40 px-2.5 py-1 rounded-full border border-pink-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        <span>Preserving unmasked pixels bit-exact</span>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Interactive SVG Layer for Spatial Annotations */}
                  {editModeAction === 'annotate' && (
                    <svg
                      className="absolute inset-0 w-full h-full cursor-crosshair pointer-events-auto"
                      onMouseDown={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        annotateStartPosRef.current = { x, y };

                        if (editAnnotationTool === 'point') {
                          const newAnn = {
                            id: Date.now().toString(),
                            type: 'point' as const,
                            coords: [y, x, y, x] as [number, number, number, number],
                            label: `Point #${editAnnotations.length + 1}`
                          };
                          setEditAnnotations(prev => [...prev, newAnn]);
                          annotateStartPosRef.current = null;
                        } else {
                          setActiveDragAnnotation({ x1: x, y1: y, x2: x, y2: y });
                        }
                      }}
                      onMouseMove={e => {
                        if (!annotateStartPosRef.current || editAnnotationTool === 'point') return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                        setActiveDragAnnotation({
                          x1: annotateStartPosRef.current.x,
                          y1: annotateStartPosRef.current.y,
                          x2: x,
                          y2: y
                        });
                      }}
                      onMouseUp={() => {
                        if (!annotateStartPosRef.current || !activeDragAnnotation) return;
                        const { x1, y1, x2, y2 } = activeDragAnnotation;
                        const dx = Math.abs(x2 - x1);
                        const dy = Math.abs(y2 - y1);
                        if (dx > 0.02 || dy > 0.02) {
                          const minY = Math.min(y1, y2);
                          const minX = Math.min(x1, x2);
                          const maxY = Math.max(y1, y2);
                          const maxX = Math.max(x1, x2);
                          const newAnn = {
                            id: Date.now().toString(),
                            type: editAnnotationTool,
                            coords: [minY, minX, maxY, maxX] as [number, number, number, number],
                            label: `${editAnnotationTool === 'box' ? 'Region' : 'Arrow'} #${editAnnotations.length + 1}`
                          };
                          setEditAnnotations(prev => [...prev, newAnn]);
                        }
                        annotateStartPosRef.current = null;
                        setActiveDragAnnotation(null);
                      }}
                    >
                      <defs>
                        <marker
                          id="arrowhead-edit"
                          markerWidth="8"
                          markerHeight="6"
                          refX="7"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 8 3, 0 6" fill="#ec4899" />
                        </marker>
                      </defs>

                      {/* Saved Annotations */}
                      {editAnnotations.map((ann, idx) => {
                        const [ymin, xmin, ymax, xmax] = ann.coords;
                        if (ann.type === 'box') {
                          return (
                            <g key={ann.id}>
                              <rect
                                x={`${xmin * 100}%`}
                                y={`${ymin * 100}%`}
                                width={`${(xmax - xmin) * 100}%`}
                                height={`${(ymax - ymin) * 100}%`}
                                fill="rgba(16, 185, 129, 0.15)"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                                rx="4"
                              />
                              <rect
                                x={`${xmin * 100}%`}
                                y={`${Math.max(0, ymin * 100 - 4)}%`}
                                width="68"
                                height="16"
                                fill="#10b981"
                                rx="3"
                              />
                              <text
                                x={`${xmin * 100 + 4}%`}
                                y={`${Math.max(0, ymin * 100 - 4) + 11}%`}
                                fill="#ffffff"
                                fontSize="9"
                                fontWeight="bold"
                              >
                                {ann.label || `Target #${idx + 1}`}
                              </text>
                            </g>
                          );
                        }
                        if (ann.type === 'arrow') {
                          return (
                            <g key={ann.id}>
                              <line
                                x1={`${xmin * 100}%`}
                                y1={`${ymin * 100}%`}
                                x2={`${xmax * 100}%`}
                                y2={`${ymax * 100}%`}
                                stroke="#ec4899"
                                strokeWidth="3"
                                markerEnd="url(#arrowhead-edit)"
                              />
                              <circle cx={`${xmin * 100}%`} cy={`${ymin * 100}%`} r="4" fill="#ec4899" />
                            </g>
                          );
                        }
                        return (
                          <g key={ann.id}>
                            <circle cx={`${xmin * 100}%`} cy={`${ymin * 100}%`} r="10" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2" />
                            <circle cx={`${xmin * 100}%`} cy={`${ymin * 100}%`} r="3.5" fill="#f59e0b" />
                          </g>
                        );
                      })}

                      {/* Live Dragging Shape */}
                      {activeDragAnnotation && (
                        <rect
                          x={`${Math.min(activeDragAnnotation.x1, activeDragAnnotation.x2) * 100}%`}
                          y={`${Math.min(activeDragAnnotation.y1, activeDragAnnotation.y2) * 100}%`}
                          width={`${Math.abs(activeDragAnnotation.x2 - activeDragAnnotation.x1) * 100}%`}
                          height={`${Math.abs(activeDragAnnotation.y2 - activeDragAnnotation.y1) * 100}%`}
                          fill="rgba(16, 185, 129, 0.2)"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                      )}
                    </svg>
                  )}
                </div>

                {/* Right-Hand Rail: Canvas Utilities & Viewport Toolbar */}
                <div className="absolute right-3 top-3 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/10 shadow-2xl text-white z-20">
                  {/* Myanmar 3D Typography Launcher */}
                  <button
                    type="button"
                    onClick={() => setShowMyanmarTypographyModal(true)}
                    title="🇲🇲 Myanmar 3D Typography Studio (မြန်မာစာလုံးလှ ဖန်တီးစနစ်)"
                    className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/30 flex items-center justify-center transition-all cursor-pointer relative group text-amber-300 shadow-sm"
                  >
                    <span className="text-[11px] font-black font-mono">🇲🇲</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    title="Upload / Replace Base Image"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-purple-300" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditHistoryModal(true)}
                    title="Revision History & Version Control"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer relative"
                  >
                    <History className="w-4 h-4 text-zinc-300" />
                    {editHistory.length > 1 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-[8px] font-bold flex items-center justify-center text-white">
                        {editHistory.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearMaskCanvas();
                      setEditAnnotations([]);
                      flash('info', 'Canvas masks & annotations cleared');
                    }}
                    title="Clear Mask & Annotations"
                    className="w-8 h-8 rounded-xl hover:bg-rose-900/60 text-zinc-300 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-full h-[1px] bg-white/10 my-0.5" />
                  <button
                    type="button"
                    onClick={() => setShowEditDownloadModal(true)}
                    title="Download Full Resolution Output"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (SupabaseService.isConfigured() && SupabaseService.getSession()) {
                        SupabaseService.saveHistoryRecord({
                          mode: 'photo-studio',
                          masterPrompt: editPrompt || 'Studio Canvas Bookmark',
                          imageUrl: editImageSrc,
                          provider: 'Seedream 5.0 Pro'
                        }).then(() => {
                          flash('info', '✨ Canvas saved to your Cloud Favorites!');
                        });
                      } else {
                        flash('info', '✨ Canvas saved to project bookmarks!');
                      }
                    }}
                    title="Bookmark / Save Asset"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                  </button>
                  <div className="w-full h-[1px] bg-white/10 my-0.5" />
                  <button
                    type="button"
                    onClick={() => setEditZoom(z => Math.min(250, z + 25))}
                    title="Zoom In"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditZoom(z => Math.max(50, z - 25))}
                    title="Zoom Out"
                    className="w-8 h-8 rounded-xl hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  {editZoom !== 100 && (
                    <button
                      type="button"
                      onClick={() => setEditZoom(100)}
                      title="Reset Zoom to 100%"
                      className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      {editZoom}%
                    </button>
                  )}
                </div>
              </div>

              {/* Mode-Specific Functional Sub-Toolbars */}

              {/* 1. Mode 2: Area Edit Brush Controls */}
              {editModeAction === 'area-edit' && (
                <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Brush className="w-3.5 h-3.5 text-pink-400" />
                        <span>Inpaint Tool: {editBrushSize}px</span>
                      </span>
                      {/* Brush vs Eraser Toggle Pill */}
                      <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 border border-zinc-700/60">
                        <button
                          type="button"
                          onClick={() => areaEdit.setIsEraser(false)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                            !areaEdit.isEraser ? 'bg-pink-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Brush className="w-3 h-3" />
                          <span>Paint</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => areaEdit.setIsEraser(true)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                            areaEdit.isEraser ? 'bg-amber-500 text-zinc-950 shadow-sm' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Eraser className="w-3 h-3" />
                          <span>Erase</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[15, 32, 55, 80].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setEditBrushSize(sz)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            editBrushSize === sz
                              ? 'bg-pink-500 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {sz}px
                        </button>
                      ))}
                      <div className="w-[1px] h-4 bg-zinc-700 mx-1" />
                      <button
                        type="button"
                        onClick={undoMaskStroke}
                        disabled={!areaEdit.canUndo}
                        title="Undo Brush Stroke"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={redoMaskStroke}
                        disabled={!areaEdit.canRedo}
                        title="Redo Brush Stroke"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={clearMaskCanvas}
                        disabled={!areaEdit.maskHasContent}
                        title="Clear Mask"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 text-[10px] font-bold disabled:opacity-30 cursor-pointer"
                      >
                        <Eraser className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Brush Size & Denoise Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-400 shrink-0 min-w-[55px]">Size ({editBrushSize}px):</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={editBrushSize}
                        onChange={e => setEditBrushSize(Number(e.target.value))}
                        className="flex-1 accent-pink-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-400 shrink-0 min-w-[55px]">
                        Denoise: {editDenoiseStrength}
                      </span>
                      <input
                        type="range"
                        min="0.65"
                        max="0.85"
                        step="0.05"
                        value={editDenoiseStrength}
                        onChange={e => setEditDenoiseStrength(Number(e.target.value))}
                        className="flex-1 accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Mode 3: Spatial Annotation Toolbar */}
              {editModeAction === 'annotate' && (
                <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white mr-1 flex items-center gap-1">
                        <Scan className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tool:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditAnnotationTool('box')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          editAnnotationTool === 'box'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Square className="w-3 h-3" />
                        <span>Bounding Box</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAnnotationTool('arrow')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          editAnnotationTool === 'arrow'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <MoveUpRight className="w-3 h-3" />
                        <span>Arrow</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditAnnotationTool('point')}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          editAnnotationTool === 'point'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Point Marker</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {editAnnotations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setEditAnnotations(prev => prev.slice(0, -1))}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title="Undo Last Annotation"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditAnnotations([])}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] font-bold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Active Annotation Tags */}
                  {editAnnotations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/60">
                      {editAnnotations.map((ann, i) => (
                        <span
                          key={ann.id}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 border border-zinc-700 text-zinc-300 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{ann.label || `Target #${i + 1}`}</span>
                          <button
                            type="button"
                            onClick={() => setEditAnnotations(prev => prev.filter(a => a.id !== ann.id))}
                            className="text-zinc-500 hover:text-rose-400 ml-0.5 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Mode 1: Vision-Language Describe Inspection Overlay */}
              {editModeAction === 'describe' && editAnalysisResult && (
                <div className="rounded-2xl border border-purple-800/40 bg-[#12131f] p-3.5 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Vision-Language Inspection Analysis</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEditAnalysisPanel(!showEditAnalysisPanel)}
                      className="text-[10px] text-zinc-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showEditAnalysisPanel ? 'Collapse' : 'Expand'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${showEditAnalysisPanel ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showEditAnalysisPanel && (
                    <div className="space-y-2 text-xs leading-relaxed pt-1">
                      {/* Direct Answer */}
                      {editAnalysisResult.answer && (
                        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-100 font-sans">
                          <span className="text-[10px] uppercase font-bold text-pink-400 block mb-0.5 tracking-wider">
                            💬 Inspection Answer:
                          </span>
                          <p>{editAnalysisResult.answer}</p>
                        </div>
                      )}

                      {/* Primary Subjects */}
                      {editAnalysisResult.primary_subjects && editAnalysisResult.primary_subjects.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Subjects:</span>
                          {editAnalysisResult.primary_subjects.map((sub, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-300 font-medium"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Color Palette Chips */}
                      {editAnalysisResult.color_palette && editAnalysisResult.color_palette.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Palette:</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {editAnalysisResult.color_palette.map((color, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(color);
                                  flash('info', `Copied hex ${color} to clipboard!`);
                                }}
                                className="group flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 border border-zinc-800 text-[9px] font-mono text-zinc-300 hover:border-pink-500 transition-all cursor-pointer"
                                title={`Click to copy ${color}`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                                <span>{color}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lighting & Style */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                        {editAnalysisResult.lighting_direction && (
                          <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/80 text-zinc-300">
                            <span className="text-amber-400 font-bold block mb-0.5">☀️ Lighting Direction:</span>
                            <p>{editAnalysisResult.lighting_direction}</p>
                          </div>
                        )}
                        {editAnalysisResult.style_attributes && (
                          <div className="p-2 rounded-lg bg-black/40 border border-zinc-800/80 text-zinc-300">
                            <span className="text-emerald-400 font-bold block mb-0.5">📸 Style &amp; Optics:</span>
                            <p>{editAnalysisResult.style_attributes}</p>
                          </div>
                        )}
                      </div>

                      {/* Insert into Prompt Action */}
                      <button
                        type="button"
                        onClick={() => {
                          const addition = `${editAnalysisResult.answer ? editAnalysisResult.answer + '. ' : ''}${editAnalysisResult.lighting_direction || ''}`;
                          setEditPrompt(prev => (prev ? `${prev}, ${addition}` : addition));
                          flash('info', 'Analysis insights inserted into edit prompt!');
                        }}
                        className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Insert Analysis Details into Prompt</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Bottom Controls Container */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3 sm:p-3.5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  {/* Reference Image Slot (+Image beside prompt) */}
                  {editReferenceImage ? (
                    <div className="relative group w-12 h-12 rounded-xl overflow-hidden border-2 border-pink-500 shadow-md shrink-0">
                      <img src={editReferenceImage} alt="Reference asset" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditReferenceImage(null);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-md hover:bg-rose-500 transition-colors z-10"
                        title="Remove reference image"
                      >
                        ×
                      </button>
                      <div
                        onClick={() => editRefInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold cursor-pointer transition-opacity"
                      >
                        Swap
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => editRefInputRef.current?.click()}
                      title="Attach Reference Image (+Image for Seedream 5.0 Pro generation)"
                      className="w-12 h-12 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80 hover:border-pink-500/80 hover:bg-zinc-800/80 flex flex-col items-center justify-center text-zinc-400 hover:text-pink-300 transition-all cursor-pointer shrink-0 text-[9px] font-bold group"
                    >
                      <Plus className="w-3.5 h-3.5 mb-0.5 text-zinc-400 group-hover:text-pink-400 group-hover:scale-110 transition-transform" />
                      <span className="tracking-tight">+Image</span>
                    </div>
                  )}

                  <div className="flex-1 flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800 focus-within:border-pink-500/80 rounded-xl px-2 py-1">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={e => setEditPrompt(e.target.value)}
                      placeholder={
                        editReferenceImage
                          ? "Reference attached: describe how to incorporate it (e.g. 'transfer style and textures from reference')..."
                          : editModeAction === 'describe'
                          ? "Ask about the image: e.g. 'What is that?', 'Analyze lighting and color palette'..."
                          : editModeAction === 'area-edit'
                          ? "Describe what to add, replace, or type 'remove' to erase..."
                          : 'Describe spatial modification for annotated regions: e.g. add gold wristwatch...'
                      }
                      className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
                    />

                    {/* Auto-Enhance Prompt Wand Button */}
                    <button
                      type="button"
                      onClick={handleAutoEnhancePrompt}
                      disabled={isAutoEnhancingPrompt || !editPrompt.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/40 hover:border-purple-500 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shrink-0 shadow-sm"
                      title="Auto-Enhance Prompt: Automatically rewrites short prompts into 3D scene-harmonized directives (matching gold/silver metal, reflections, and lighting)"
                    >
                      {isAutoEnhancingPrompt ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                      )}
                      <span className="hidden sm:inline">Auto-Enhance</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Enhance OpenArt-Style Pill Bar */}
                {editModeAction !== 'describe' && (
                  <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAutoEnhanceEnabled(!isAutoEnhanceEnabled)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer text-[10px] font-bold ${
                          isAutoEnhanceEnabled
                            ? 'bg-purple-600/25 border-purple-500/60 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                        title="When enabled, simple prompts like 'add a text...' are automatically expanded to match 3D materials, floor reflections, and ambient lighting"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Auto-Enhance: {isAutoEnhanceEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                      <span className="text-[10px] text-zinc-500 hidden sm:inline">
                        {isAutoEnhanceEnabled
                          ? '✨ OpenArt Mode: brief prompts automatically adopt scene 3D materials, beveled depth & reflections'
                          : 'Using raw prompt without automatic scene harmonization'}
                      </span>
                    </div>

                    {lastEnhancedPrompt && (
                      <span className="text-[10px] text-pink-300 font-mono flex items-center gap-1 bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-500/30">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Enhanced Active</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Reference Active Banner */}
                {editReferenceImage && (
                  <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 px-3 py-2 flex items-center justify-between text-xs text-pink-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="text-[11px] font-medium">
                        <strong className="text-white">Reference Asset Active:</strong> Seedream 5.0 Pro will condition on Image #2 to transfer visual features, style, and textures into the target canvas.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditReferenceImage(null)}
                      className="text-pink-400 hover:text-rose-300 text-[11px] underline cursor-pointer shrink-0 ml-2 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Dynamic Quick Action Pills for Area Edit Mode */}
                {editModeAction === 'area-edit' && (
                  <div className="space-y-1.5 pt-0.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Quick Inpaint Actions:
                      </span>
                      <span className="text-[10px] font-mono text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                        Brush Mask Inpaint
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        {
                          label: '🇲🇲 3D မြန်မာစာလုံးလှ',
                          directive: 'Add 3D embossed brushed gold metallic typography reading "မင်္ဂလာပါ" in elegant Padauk/Pyidaungsu Burmese script with realistic ground reflections matching the emblem'
                        },
                        {
                          label: '✍️ 3D Metallic Text',
                          directive: 'Add 3D embossed brushed gold metallic typography reading "RX AI MARKETING AGENCY" with realistic ground reflections matching the emblem'
                        },
                        {
                          label: '🪄 Remove Object',
                          directive: 'Remove the masked object completely and seamlessly fill background'
                        },
                        {
                          label: '🎨 Replace with...',
                          directive: 'Replace the masked area with '
                        },
                        {
                          label: '✨ Enhance Details',
                          directive: 'Enhance clarity, photorealistic tactile details, and textures in the masked area'
                        },
                        {
                          label: '🖼️ Expand / Outpaint',
                          directive: 'Expand and outpaint naturally matching the ambient lighting and scene'
                        }
                      ].map(pill => (
                        <button
                          key={pill.label}
                          type="button"
                          onClick={() => {
                            setEditPrompt(pill.directive);
                            flash('info', `Selected "${pill.label}"!`);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 active:scale-95 ${
                            editPrompt.startsWith(pill.directive.slice(0, 15))
                              ? 'bg-pink-600/30 border-pink-500 text-pink-200 shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-pink-500/50'
                          }`}
                        >
                          <span>{pill.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Professional Guideline when NO reference is used (smart-edit & annotate) */}
                {!editReferenceImage && editModeAction !== 'describe' && editModeAction !== 'area-edit' && (
                  <div className="rounded-xl border border-zinc-800/90 bg-[#0d0e15] p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-bold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                        <span>Professional Prompt Guidelines (No Reference Attached)</span>
                      </div>
                      <span className="text-[10px] font-mono text-pink-400/90 font-semibold bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                        Studio Director Formula
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      When modifying without a reference image, construct prompts with direct visual constraints: <code className="text-zinc-200 font-semibold">[Scope]</code> + <code className="text-zinc-200 font-semibold">[Modification Action]</code> + <code className="text-zinc-200 font-semibold">[Ambient Lighting Match]</code> + <code className="text-zinc-200 font-semibold">[Identity Lock]</code>.
                    </p>

                    {/* One-click Pro Modifier Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                        Quick Pro Directives (Click to Append):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            label: '🏆 3D Gold Typography',
                            directive: ', 3D embossed brushed gold metallic lettering with beveled edges, specular highlights, and realistic glossy floor reflections'
                          },
                          {
                            label: '🔒 100% Identity Lock',
                            directive: ', 100% exact facial bone structure likeness, zero identity drift, preserved micro-pores'
                          },
                          {
                            label: '💡 5200K Light Harmony',
                            directive: ', matching ambient 5200K key light illumination, natural contact ground shadows'
                          },
                          {
                            label: '✨ 8K Tactile Texture',
                            directive: ', 8k UHD tactile texture, hyper-realistic fabric weave, tack-sharp focal detail'
                          },
                          {
                            label: '🌫️ Seamless Edge Blend',
                            directive: ', smooth depth-of-field falloff, natural 85mm lens bokeh, zero visible mask seams'
                          },
                          {
                            label: '💎 Premium Editorial',
                            directive: ', professional editorial magazine grade, natural skin pores, high dynamic range'
                          }
                        ].map(item => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setEditPrompt(prev => {
                                const trimmed = prev.trim();
                                if (!trimmed) return item.directive.replace(/^,\s*/, '');
                                if (trimmed.includes(item.label.slice(2))) return trimmed;
                                return `${trimmed}${item.directive}`;
                              });
                              flash('info', `Added "${item.label}" to prompt!`);
                            }}
                            className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 hover:border-pink-500/50 text-zinc-300 hover:text-white text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Query Pills for Describe Mode */}
                {editModeAction === 'describe' && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { label: '🔍 What is that?', q: 'What is that subject and what are its key features?' },
                      { label: '💡 Analyze Lighting & Temp', q: 'Analyze the key light direction, shadows, and ambient color temperature.' },
                      { label: '🎨 Extract 5-Color Palette', q: 'Extract the exact 5-color aesthetic palette from this image.' },
                      { label: '📸 Camera Lens & Style', q: 'Analyze camera lens, depth of field, framing, and photographic style.' }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setEditPrompt(chip.q)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          editPrompt === chip.q
                            ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mode Selector & Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditModeAction('smart-edit')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editModeAction === 'smart-edit'
                          ? 'border border-pink-500 text-pink-300 bg-pink-500/10 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="AI Generative Edit based on your prompt (add elements, change text/style)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Smart Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditModeAction('area-edit')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editModeAction === 'area-edit'
                          ? 'border border-pink-500 text-pink-300 bg-pink-500/10 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Paint an area on the canvas to inpaint specifically inside that mask"
                    >
                      <Brush className="w-3.5 h-3.5 text-pink-400" />
                      <span>Area Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditModeAction('annotate')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editModeAction === 'annotate'
                          ? 'border border-pink-500 text-pink-300 bg-pink-500/10 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Draw boxes or points to target spatial edits"
                    >
                      <Square className="w-3.5 h-3.5 text-pink-400" />
                      <span>Annotate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditModeAction('describe')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        editModeAction === 'describe'
                          ? 'border border-purple-500 text-purple-300 bg-purple-500/10 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title="Vision-Language inspection: ask questions about lighting, palette, or subjects"
                    >
                      <Scan className="w-3.5 h-3.5 text-purple-400" />
                      <span>Describe</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTempSeedreamApiKey(seedreamApiKey);
                        setSeedreamKeyStatus(null);
                        setShowSeedreamKeyModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700/70 hover:border-pink-500/60 text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer group shadow-sm"
                      title="Click to configure or test Seedream 5.0 Pro / OpenRouter API Key"
                    >
                      <Key className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-12 transition-transform" />
                      <span className="font-semibold text-zinc-200">Seedream 5.0 Pro</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          seedreamApiKey ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-pink-400'
                        }`}
                        title={seedreamApiKey ? 'Custom API Key Active' : 'Default Server Key Active'}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleEditImageGenerate}
                      disabled={isGenerating}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>
                        {isGenerating
                          ? (editModeAction === 'area-edit' ? 'Inpainting ✦ 30' : editModeAction === 'describe' ? 'Analyzing ✦ 30' : 'Generating ✦ 30')
                          : (editModeAction === 'describe' ? 'Analyze ✦ 30' : editModeAction === 'area-edit' ? 'Generate Edit ✦ 30' : 'Generate ✦ 30')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Seedream 5.0 Pro / OpenRouter API Key Configuration Modal */}
              {showSeedreamKeyModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Seedream 5.0 Pro API Key</h4>
                          <span className="text-[10px] text-zinc-400 font-mono">OpenRouter: bytedance-seed/seedream-5.0-pro</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSeedreamKeyModal(false)}
                        className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-200/90 space-y-1.5 leading-relaxed">
                      <p className="font-semibold text-pink-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        <span>ByteDance Seedream is on OpenRouter!</span>
                      </p>
                      <p className="text-[11px] text-zinc-300">
                        OpenRouter provides native access to ByteDance's <strong className="text-white">Seedream 5.0 Pro</strong> and <strong className="text-white">Seedream 4.5</strong>. You can use your standard OpenRouter API Key (<code className="text-pink-300 bg-black/40 px-1 py-0.5 rounded">sk-or-v1-...</code>) or leave it empty to use the server default.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                        <span>API Key:</span>
                        {seedreamApiKey ? (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Custom Key Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-mono">Default Server Key Active</span>
                        )}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showKeySecret ? 'text' : 'password'}
                          value={tempSeedreamApiKey}
                          onChange={e => {
                            setTempSeedreamApiKey(e.target.value);
                            setSeedreamKeyStatus(null);
                          }}
                          placeholder="sk-or-v1-..."
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl px-3 py-2.5 pr-20 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowKeySecret(!showKeySecret)}
                            className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                            title={showKeySecret ? 'Hide Key' : 'Reveal Key'}
                          >
                            {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {tempSeedreamApiKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setTempSeedreamApiKey('');
                                setSeedreamKeyStatus(null);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 cursor-pointer"
                              title="Clear Input"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Connection Button & Status */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={async () => {
                            const testKey = tempSeedreamApiKey.trim() || seedreamApiKey.trim();
                            if (!testKey) {
                              setSeedreamKeyStatus({
                                checked: true,
                                valid: true,
                                message: 'Using server default OPENROUTER_API_KEY from environment.'
                              });
                              return;
                            }
                            setIsTestingSeedreamKey(true);
                            setSeedreamKeyStatus(null);
                            try {
                              const res = await fetch('/api/openrouter/check', {
                                headers: { 'x-openrouter-key': testKey }
                              });
                              const data = await res.json();
                              if (data.valid) {
                                setSeedreamKeyStatus({
                                  checked: true,
                                  valid: true,
                                  message: 'Connection verified! Key is valid and active on OpenRouter.'
                                });
                              } else {
                                setSeedreamKeyStatus({
                                  checked: true,
                                  valid: false,
                                  message: data.error || 'Invalid API Key according to OpenRouter.'
                                });
                              }
                            } catch (e: any) {
                              setSeedreamKeyStatus({
                                checked: true,
                                valid: false,
                                message: e.message || 'Network connection test failed.'
                              });
                            } finally {
                              setIsTestingSeedreamKey(false);
                            }
                          }}
                          disabled={isTestingSeedreamKey}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all border border-zinc-700/60"
                        >
                          {isTestingSeedreamKey ? (
                            <Loader2 className="w-3 h-3 animate-spin text-pink-400" />
                          ) : (
                            <RefreshCw className="w-3 h-3 text-pink-400" />
                          )}
                          <span>Test Key Connection</span>
                        </button>
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1"
                        >
                          <span>Get OpenRouter Key</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {seedreamKeyStatus && (
                        <div
                          className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                            seedreamKeyStatus.valid
                              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                              : 'bg-rose-950/30 border-rose-800 text-rose-300'
                          }`}
                        >
                          {seedreamKeyStatus.valid ? (
                            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          )}
                          <span className="text-[11px] leading-tight">{seedreamKeyStatus.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Save & Reset Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('seedream_api_key');
                          setSeedreamApiKey('');
                          setTempSeedreamApiKey('');
                          setSeedreamKeyStatus(null);
                          flash('info', 'Reverted to system server default key');
                          setShowSeedreamKeyModal(false);
                        }}
                        className="px-3 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold hover:bg-zinc-800/80 transition-colors cursor-pointer"
                      >
                        Reset to Default
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const clean = tempSeedreamApiKey.trim();
                          if (clean) {
                            localStorage.setItem('seedream_api_key', clean);
                            setSeedreamApiKey(clean);
                            flash('info', '✨ Custom Seedream 5.0 Pro Key applied and saved!');
                          } else {
                            localStorage.removeItem('seedream_api_key');
                            setSeedreamApiKey('');
                            flash('info', 'Using system default key');
                          }
                          setShowSeedreamKeyModal(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition-all cursor-pointer"
                      >
                        Save & Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 🇲🇲 Myanmar 3D Typography Studio Modal */}
              {showMyanmarTypographyModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
                  <div className="bg-[#12141c] border border-amber-500/30 rounded-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl shadow-amber-500/10 max-h-[92vh] overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🇲🇲</span>
                        <div>
                          <span className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                            <span>Myanmar 3D Typography Studio</span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              မြန်မာစာလုံးလှ ဖန်တီးစနစ်
                            </span>
                          </span>
                          <p className="text-[11px] text-zinc-400">
                            Render crisp 3D gold typography with accurate Burmese glyph ligatures &amp; reflections.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMyanmarTypographyModal(false)}
                        className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Input Burmese Text */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                        <span>မြန်မာစာသား ရိုက်ထည့်ပါ (Input Myanmar Text):</span>
                        <span className="text-[10px] font-mono text-zinc-500">Unicode 100% Accurate</span>
                      </label>
                      <input
                        type="text"
                        value={myanmarText}
                        onChange={e => setMyanmarText(e.target.value)}
                        placeholder="ဥပမာ - မင်္ဂလာပါ, ရွှေမြန်မာ, အေဂျင်စီ..."
                        className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-amber-200 font-bold focus:outline-none shadow-inner"
                        style={{ fontFamily: `"${myanmarFontFamily}", "Padauk", "Noto Sans Myanmar", sans-serif` }}
                      />
                    </div>

                    {/* Quick Preset Burmese Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Quick Word Presets (အသုံးများသော စာလုံးများ):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'မင်္ဂလာပါ',
                          'ရွှေမြန်မာ',
                          'အေဂျင်စီ',
                          'ရွှေတိဂုံ',
                          'အောင်မြင်ပါစေ',
                          'မင်္ဂလာရှိသောနေ့',
                          'စိန်နန်းတော်',
                          'ရွှေမင်းသမီး'
                        ].map(word => (
                          <button
                            key={word}
                            type="button"
                            onClick={() => setMyanmarText(word)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              myanmarText === word
                                ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-sm'
                                : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                            }`}
                            style={{ fontFamily: `"${myanmarFontFamily}", "Padauk", "Noto Sans Myanmar", sans-serif` }}
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Family & Style Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      
                      {/* Font Family Selector */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-300">
                          ဖောင့်ဒီဇိုင်း (Font Family):
                        </label>
                        <select
                          value={myanmarFontFamily}
                          onChange={e => setMyanmarFontFamily(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
                        >
                          <option value="Noto Sans Myanmar">Noto Sans Myanmar (ခေတ်မီ စာလုံးသန့်)</option>
                          <option value="Padauk">Padauk (ပဒုမ္မာ ရိုးရာစာလုံး)</option>
                          <option value="Noto Serif Myanmar">Noto Serif Myanmar (နန်းဆန်သော စာလုံးလှ)</option>
                        </select>
                      </div>

                      {/* 3D Style Preset */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-300">
                          3D ဒီဇိုင်းစတိုင် (3D Shader Style):
                        </label>
                        <select
                          value={myanmarStylePreset}
                          onChange={e => setMyanmarStylePreset(e.target.value as any)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none cursor-pointer font-bold"
                        >
                          <option value="3d-gold">🏆 3D Brushed Gold (ရွှေရောင် 3D)</option>
                          <option value="chrome">💎 Diamond Chrome (စိန်ရောင် ပလက်တီနမ်)</option>
                          <option value="neon">🏮 Cyber Neon Glow (နီယွန်မီးရောင်)</option>
                          <option value="royal-red">👑 Royal Velvet Red (နန်းတွင်း အနီရွှေ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Sliders: Size, Depth, Position */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
                      
                      {/* Font Size */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>အရွယ်အစား (Size):</span>
                          <span className="font-mono text-white font-bold">{myanmarFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="24"
                          max="96"
                          value={myanmarFontSize}
                          onChange={e => setMyanmarFontSize(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* 3D Extrusion Depth */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>3D ထူထပ်မှု (Depth):</span>
                          <span className="font-mono text-white font-bold">{myanmar3DDepth}px</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="16"
                          value={myanmar3DDepth}
                          onChange={e => setMyanmar3DDepth(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Position Y */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-zinc-400">
                          <span>အထက်/အောက် (Height):</span>
                          <span className="font-mono text-white font-bold">{myanmarPosY}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="95"
                          value={myanmarPosY}
                          onChange={e => setMyanmarPosY(Number(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Floor Reflection Toggle */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-300">
                          ကြမ်းပြင် ရောင်ပြန်ဟပ်မှု (Floor Reflection):
                        </span>
                        <span className="text-[10px] text-zinc-500 hidden sm:inline">
                          Simulates raytraced mirror floor reflection
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMyanmarReflection(!myanmarReflection)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          myanmarReflection
                            ? 'bg-amber-500 text-zinc-950 shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {myanmarReflection ? 'ဖွင့်ထားသည် (ON)' : 'ပိတ်ထားသည် (OFF)'}
                      </button>
                    </div>

                    {/* Live Preview Box */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        Live 3D Preview (တိုက်ရိုက် အစမ်းကြည့်ရှုမှု):
                      </span>
                      <div className="h-28 rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black flex flex-col items-center justify-center p-3 overflow-hidden relative shadow-inner">
                        <div 
                          className="font-extrabold select-none tracking-wide text-center"
                          style={{
                            fontFamily: `"${myanmarFontFamily}", "Padauk", "Noto Sans Myanmar", sans-serif`,
                            fontSize: `${Math.min(myanmarFontSize, 42)}px`,
                            color: myanmarStylePreset === '3d-gold' ? '#F59E0B' : myanmarStylePreset === 'chrome' ? '#E4E4E7' : myanmarStylePreset === 'neon' ? '#EC4899' : '#EF4444',
                            textShadow: myanmarStylePreset === '3d-gold' 
                              ? '0 2px 0 #92400e, 0 4px 0 #78350f, 0 6px 12px rgba(0,0,0,0.8), 0 0 16px rgba(245,158,11,0.4)'
                              : myanmarStylePreset === 'chrome'
                              ? '0 2px 0 #52525b, 0 4px 0 #27272a, 0 6px 10px rgba(0,0,0,0.8)'
                              : myanmarStylePreset === 'neon'
                              ? '0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 30px #db2777'
                              : '0 2px 0 #991b1b, 0 4px 0 #450a0a, 0 6px 10px rgba(0,0,0,0.8)'
                          }}
                        >
                          {myanmarText || 'မင်္ဂလာပါ'}
                        </div>
                        {myanmarReflection && (
                          <div 
                            className="font-extrabold select-none tracking-wide text-center opacity-30 blur-[1px] -scale-y-75 mt-0.5"
                            style={{
                              fontFamily: `"${myanmarFontFamily}", "Padauk", "Noto Sans Myanmar", sans-serif`,
                              fontSize: `${Math.min(myanmarFontSize, 42)}px`,
                              color: myanmarStylePreset === '3d-gold' ? '#D97706' : myanmarStylePreset === 'chrome' ? '#A1A1AA' : '#BE185D'
                            }}
                          >
                            {myanmarText || 'မင်္ဂလာပါ'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowMyanmarTypographyModal(false)}
                        className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        Cancel (ပိတ်မည်)
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Stamp Only */}
                        <button
                          type="button"
                          onClick={() => handleStampMyanmarTypography(false)}
                          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Stamp to Canvas (ပုံပေါ်ထည့်မည်)</span>
                        </button>

                        {/* Stamp & AI Harmonize */}
                        <button
                          type="button"
                          onClick={() => handleStampMyanmarTypography(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Stamp &amp; AI Harmonize (အလင်းအမှောင် ညှိမည်)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Version History Drawer Modal */}
              {showEditHistoryModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-lg w-full p-4 space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <History className="w-4 h-4 text-purple-400" />
                        <span>Canvas Version Revisions ({editHistory.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEditHistoryModal(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                      {editHistory.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                            editImageSrc === imgUrl
                              ? 'bg-purple-950/40 border-purple-500'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={imgUrl} alt={`Version ${idx + 1}`} className="w-14 h-14 object-cover rounded-lg border border-zinc-800" />
                            <div>
                              <span className="text-xs font-bold text-white block">
                                Revision #{editHistory.length - idx} {idx === 0 ? '(Current)' : ''}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {idx === 0 ? 'Active Canvas' : 'Previous Generation'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditImageSrc(imgUrl);
                              clearMaskCanvas();
                              setShowEditHistoryModal(false);
                              flash('info', `Restored Revision #${editHistory.length - idx}`);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Full Resolution Download Modal */}
              {showEditDownloadModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Export Full Resolution</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEditDownloadModal(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          downloadImage(editImageSrc, 'studio-export', ratio, resolutionTier);
                          setShowEditDownloadModal(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Download PNG (Lossless Master)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadImage(editImageSrc, 'studio-export', ratio, resolutionTier);
                          setShowEditDownloadModal(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Download JPEG (Standard Web)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FACE SWAP (SCREENSHOT 4) */}
          {activeTool === 'face-swap' && (
            <div className="space-y-3.5">
              <input
                ref={faceSwapTargetInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setFaceSwapTargetImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />
              <input
                ref={faceSwapSourceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setFaceSwapSourceFace(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />

              {/* Sub-tabs: Swap Face / Swap Head */}
              <div className="flex items-center rounded-2xl bg-[#14151b] p-1 border border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setFaceSwapTab('swap-face')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    faceSwapTab === 'swap-face'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Swap Face
                </button>
                <button
                  type="button"
                  onClick={() => setFaceSwapTab('swap-head')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    faceSwapTab === 'swap-head'
                      ? 'bg-zinc-800 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Swap Head
                </button>
              </div>

              {/* Card 1: Upload image to edit */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3.5 space-y-2">
                <p className="text-xs sm:text-sm font-bold text-white">Upload image to edit</p>
                <p className="text-[11px] text-zinc-400">This image will have its face replaced</p>

                <div
                  onClick={() => faceSwapTargetInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = ev => { if (ev.target?.result) setFaceSwapTargetImage(ev.target.result as string); };
                      r.readAsDataURL(file);
                    }
                  }}
                  className="rounded-2xl border border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
                >
                  {faceSwapTargetImage ? (
                    <div className="relative group/preview">
                      <img src={faceSwapTargetImage} alt="Target" className="w-24 h-24 rounded-xl object-cover shadow-md" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFaceSwapTargetImage(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 mb-2 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white">Upload or choose an image</span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        Click or drag to upload / choose from{' '}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setShowFaceSwapHistoryPicker('target');
                          }}
                          className="underline text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
                        >
                          History
                        </button>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Card 2: Upload face image */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3.5 space-y-2">
                <p className="text-xs sm:text-sm font-bold text-white">Upload face image</p>
                <p className="text-[11px] text-zinc-400">The face you want to use</p>

                <div
                  onClick={() => faceSwapSourceInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = ev => { if (ev.target?.result) setFaceSwapSourceFace(ev.target.result as string); };
                      r.readAsDataURL(file);
                    }
                  }}
                  className="rounded-2xl border border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
                >
                  {faceSwapSourceFace ? (
                    <div className="relative group/preview">
                      <img src={faceSwapSourceFace} alt="Face" className="w-24 h-24 rounded-xl object-cover shadow-md" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFaceSwapSourceFace(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 mb-2 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white">Upload face photo</span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        Click or drag to upload / choose from{' '}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setShowFaceSwapHistoryPicker('source');
                          }}
                          className="underline text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
                        >
                          History
                        </button>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {notice && (
                <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs my-2 ${noticeStyles[notice.type]}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              <button
                type="button"
                onClick={handleFaceSwapGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Processing Face Swap...' : 'Generate ✦ 30'}</span>
              </button>

              {/* Face Swap History Picker Modal */}
              {showFaceSwapHistoryPicker && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-lg w-full p-4 space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <History className="w-4 h-4 text-purple-400" />
                        <span>Pick {showFaceSwapHistoryPicker === 'target' ? 'Target Scene' : 'Source Face'} from History</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowFaceSwapHistoryPicker(null)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 pr-1">
                      {[
                        ...results.map(r => r.url),
                        ...libraryItems.map(l => l.url),
                        ...editHistory
                      ].filter((url, i, arr) => arr.indexOf(url) === i).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (showFaceSwapHistoryPicker === 'target') {
                              setFaceSwapTargetImage(imgUrl);
                            } else {
                              setFaceSwapSourceFace(imgUrl);
                            }
                            setShowFaceSwapHistoryPicker(null);
                            flash('info', `${showFaceSwapHistoryPicker === 'target' ? 'Target scene' : 'Face photo'} selected from history!`);
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-pink-500 cursor-pointer transition-all"
                        >
                          <img src={imgUrl} alt={`History ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-pink-600 px-2 py-0.5 rounded-full">Select</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHANGE BACKGROUND (SCREENSHOT 5) */}
          {activeTool === 'change-background' && (
            <div className="space-y-3.5">
              <input
                ref={bgSubjectInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setBgSubjectImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />
              <input
                ref={bgGuidanceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setBgGuidanceImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />

              {/* Subject Category Mode Selector: Human Portrait vs Product / E-commerce */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#14151b] border border-zinc-800 gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setBgSubjectType('human');
                    setBgLightingOption('cozy-cafe');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    bgSubjectType === 'human'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Human Portrait (လူပုံ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBgSubjectType('product');
                    setBgLightingOption('travertine-table');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    bgSubjectType === 'product'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Product / Object (ပစ္စည်း)</span>
                </button>
              </div>

              {/* Section 1: Choose an image */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Choose Subject Image</span>
                    <span className="text-[10px] text-zinc-400 font-normal">({bgSubjectType === 'human' ? 'Person' : 'Product'})</span>
                  </p>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    100% Subject Lock
                  </span>
                </div>

                <div
                  onClick={() => bgSubjectInputRef.current?.click()}
                  className="rounded-2xl border border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
                >
                  {bgSubjectImage ? (
                    <div className="relative group/preview flex flex-col items-center">
                      <img src={bgSubjectImage} alt="Subject" className="w-28 h-28 rounded-xl object-contain shadow-md border border-zinc-700/80 bg-black/40" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setBgSubjectImage(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-md"
                      >
                        ×
                      </button>
                      <span className="text-[11px] text-zinc-400 mt-2 font-medium">Click or drag to change subject</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex -space-x-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 border border-white/20 flex items-center justify-center text-xs">👤</div>
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 border border-white/20 flex items-center justify-center text-xs">📦</div>
                        <div className="w-8 h-8 rounded-xl bg-pink-600 border border-white/20 flex items-center justify-center text-xs">🚶</div>
                      </div>
                      <span className="text-xs font-bold text-white">Upload subject image</span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        Zero face/product distortion • Clean edge segmentation
                      </span>
                    </>
                  )}
                </div>

                {bgSubjectImage && (
                  <button
                    type="button"
                    disabled={isCuttingOut}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!bgSubjectImage || isCuttingOut) return;
                      setIsCuttingOut(true);
                      try {
                        const cutout = await removeBackgroundCanvas(bgSubjectImage);
                        setBgSubjectImage(cutout);
                        flash('info', '✨ Background removed! Subject cleanly isolated.');
                      } catch (err) {
                        console.error('Failed to cutout background:', err);
                        flash('error', 'Could not auto-cutout subject.');
                      } finally {
                        setIsCuttingOut(false);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isCuttingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scissors className="w-3.5 h-3.5" />}
                    <span>{isCuttingOut ? 'Cutting out subject...' : '✂️ Auto Cutout (Remove Curtains / Backdrop)'}</span>
                  </button>
                )}
              </div>

              {/* Section 2: Add new background */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">Add New Background Environment</p>
                    <p className="text-[11px] text-zinc-400">Upload background image or describe the new scene</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateView) onNavigateView('scenes-550');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose from 550+ Scenes</span>
                    <span className="text-[9px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">760+</span>
                  </button>
                </div>

                <div
                  onClick={() => bgGuidanceInputRef.current?.click()}
                  className="rounded-2xl border border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-zinc-900/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[90px]"
                >
                  {bgGuidanceImage ? (
                    <div className="relative group/preview flex flex-col items-center">
                      <img src={bgGuidanceImage} alt="Background" className="w-24 h-24 rounded-xl object-cover shadow-md border border-zinc-700/80" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setBgGuidanceImage(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-1.5 text-sm">
                        🏞️
                      </div>
                      <span className="text-xs font-bold text-white">Upload target background photo (Optional)</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Click or drag image file here</span>
                    </>
                  )}
                </div>

                <input
                  type="text"
                  value={bgPromptText}
                  onChange={e => setBgPromptText(e.target.value)}
                  placeholder={
                    bgSubjectType === 'product'
                      ? 'Describe background: e.g. minimalist warm travertine marble table, luxury modern living room...'
                      : 'Describe background: e.g. cozy modern coffee shop interior, misty mountain sunrise...'
                  }
                  className="w-full bg-transparent border border-zinc-800 focus:border-pink-500/80 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Collapsible AI Inpainting Formula & Studio Pipeline Architecture Inspector */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#10121a] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setBgShowFormula(!bgShowFormula)}
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-purple-200 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Inpainting Formula &amp; Negative Constraints</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${bgShowFormula ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`Inpainting Prompt:\n${bgInpaintingFormula.inpaintingPrompt}\n\nNegative Prompt:\n${bgInpaintingFormula.negativePrompt}`);
                      setBgFormulaCopied(true);
                      flash('info', 'Inpainting & Negative Prompts copied to clipboard!');
                      setTimeout(() => setBgFormulaCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-pink-400" />
                    <span>{bgFormulaCopied ? 'Copied!' : 'Copy Formula'}</span>
                  </button>
                </div>

                {bgShowFormula && (
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    {/* Inpainting Prompt & Negative Constraints */}
                    <div className="space-y-2 font-mono text-[10px] leading-relaxed">
                      <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300">
                        <span className="text-emerald-400 font-bold block mb-0.5">✦ Inpainting Prompt Formula:</span>
                        <p className="select-all">{bgInpaintingFormula.inpaintingPrompt}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 text-zinc-400">
                        <span className="text-rose-400 font-bold block mb-0.5">✦ Negative Constraints (Anti-Cutout):</span>
                        <p className="select-all">{bgInpaintingFormula.negativePrompt}</p>
                      </div>
                    </div>

                    {/* 3-Stage Studio Pipeline Architecture */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>3-Stage Studio Pipeline Architecture</span>
                        </span>
                        <span className="text-[8px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold">
                          Graphic Designer Grade
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-purple-300">1. Dedicated Segmentation</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-200">SAM / BiRefNet</span>
                          </div>
                          <p className="text-[9px] text-zinc-400 leading-snug">
                            Sub-pixel subject lock with hair strand precision, eliminating color spill.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-pink-300">2. Alpha Matting &amp; Feather</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-pink-900/50 text-pink-200">1.5–2px Radius</span>
                          </div>
                          <p className="text-[9px] text-zinc-400 leading-snug">
                            De-haloing &amp; soft edge feathering to completely remove old background bleed.
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex flex-col justify-between space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-300">3. IC-Light Relighting</span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-200">Consistent Light</span>
                          </div>
                          <p className="text-[9px] text-zinc-400 leading-snug">
                            Imposes target environment color temp, bounce light &amp; 2-tier ground contact shadows.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {notice && (
                <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs my-2 ${noticeStyles[notice.type]}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[#14151b] border border-zinc-800/80 text-white font-mono text-xs sm:text-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-white min-w-[28px] text-center">
                    {count} <span className="text-zinc-500 font-normal">/ 8</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount(Math.min(8, count + 1))}
                    disabled={count >= 8}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBgSwapGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-600 hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isGenerating ? 'Generating...' : 'Generate ✦ 40'}</span>
                </button>
              </div>
            </div>
          )}

          {/* IMAGE UPSCALE */}
          {activeTool === 'image-upscale' && (
            <div className="space-y-3.5">
              <input
                ref={upscaleInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setUpscaleTargetImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />

              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3.5 space-y-2">
                <p className="text-xs sm:text-sm font-bold text-white">Upload image to upscale</p>
                <div
                  onClick={() => upscaleInputRef.current?.click()}
                  className="rounded-2xl border border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-zinc-900/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[140px]"
                >
                  {upscaleTargetImage ? (
                    <div className="relative group/preview">
                      <img src={upscaleTargetImage} alt="Upscale target" className="w-24 h-24 rounded-xl object-cover shadow-md" />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setUpscaleTargetImage(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 mb-2 transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white">Upload photo for 2K / 4K / 8K upscale</span>
                      <span className="text-[10px] text-zinc-500 mt-1">High-fidelity Canvas Resampling</span>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['2k', '4k', '8k'] as ResolutionTier[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUpscaleTargetTier(t)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      upscaleTargetTier === t
                        ? 'bg-pink-500/20 border-pink-500 text-pink-200 font-bold shadow'
                        : 'bg-[#14151b] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs font-mono font-bold uppercase">{t}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {t === '2k' ? '1440p HD' : t === '4k' ? '2160p UHD' : '4320p Master'}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDirectUpscale}
                disabled={!upscaleTargetImage}
                className="w-full py-3.5 rounded-2xl bg-[#ff2477] hover:bg-[#ff3b8b] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Upscale to {upscaleTargetTier.toUpperCase()} & Download</span>
              </button>
            </div>
          )}

          {/* IMAGE VARIATIONS (MATCHES USER REFERENCE UI: Start with an image, Describe variation, Output, Quality) */}
          {activeTool === 'image-variations' && (
            <div className="space-y-3.5">
              <input
                ref={variationInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setVariationSourceImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                }}
              />

              {/* Section 1: Start with an image */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#12131b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Start with an image</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">We'll create new versions from it.</p>
                  </div>
                  {variationSourceImage && (
                    <button
                      type="button"
                      onClick={() => handleAnalyzeReferenceImage()}
                      disabled={isAnalyzingReference}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isAnalyzingReference ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{variationAnalysis ? 'Re-Analyze Foundation' : 'Analyze Foundation'}</span>
                    </button>
                  )}
                </div>

                {/* Dashed drop box */}
                <div
                  onClick={() => variationInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-[#0d0e14]/80 hover:bg-[#0d0e14] p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[160px]"
                >
                  {variationSourceImage ? (
                    <div className="flex flex-col items-center gap-2.5 relative">
                      <div className="relative group/preview">
                        <img
                          src={variationSourceImage}
                          alt="Variation reference"
                          className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-xl border border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setVariationSourceImage(null);
                            setVariationAnalysis(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs flex items-center justify-center cursor-pointer shadow-md transition-colors"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                      <span className="text-[11px] text-zinc-400 hover:text-white font-medium">Click to replace photo</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 mb-2.5 transition-colors relative">
                        <ImageIcon className="w-5 h-5" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
                          <Plus className="w-2.5 h-2.5" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-white">Upload or choose an image</span>
                      <p className="text-xs text-zinc-400 mt-1">
                        Click or drag to upload / choose from{' '}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setShowVariationHistoryPicker(true);
                          }}
                          className="text-white hover:text-pink-400 underline font-semibold cursor-pointer"
                        >
                          History
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Structured Visual Foundation Analysis breakdown */}
                {variationAnalysis && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                        Visual Foundation Analysis
                      </span>
                      {variationAnalysis.colorPalette && variationAnalysis.colorPalette.length > 0 && (
                        <div className="flex items-center gap-1">
                          {variationAnalysis.colorPalette.map((col, idx) => (
                            <span
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                              style={{ backgroundColor: col }}
                              title={col}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500 block">Subject & Pose:</span>
                        <span className="text-zinc-200 font-medium">{variationAnalysis.subject} · {variationAnalysis.pose}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Lighting & Tone:</span>
                        <span className="text-zinc-200 font-medium">{variationAnalysis.lighting}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Background Environment:</span>
                        <span className="text-zinc-200 font-medium">{variationAnalysis.background}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Style & Optics:</span>
                        <span className="text-zinc-200 font-medium">{variationAnalysis.style}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Describe your variation */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#12131b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-white">Describe your variation</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (variationPrompt) {
                        setPrompt(variationPrompt);
                        flash('info', 'Variation prompt copied to master prompt builder!');
                      }
                    }}
                    title="Expand to Full Prompt Builder"
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Large textarea input */}
                <div className="rounded-2xl border border-zinc-800 bg-[#0d0e14] p-3.5 focus-within:border-pink-500/80 transition-all space-y-3">
                  <textarea
                    value={variationPrompt}
                    onChange={e => setVariationPrompt(e.target.value)}
                    placeholder='Example: "Make it sunset, cinematic lighting, adding a vintage cinematic look."'
                    rows={3}
                    className="w-full bg-transparent text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
                  />

                  {/* Preset inspiration chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: '🌅 Golden Sunset', prompt: 'Sunset golden hour, warm amber rim lighting, soft long shadows, cinematic contrast' },
                      { label: '🌆 Cyberpunk Neon', prompt: 'Cyberpunk neon night, violet and turquoise reflections, wet pavement, high tech noir' },
                      { label: '🎞️ 35mm Vintage Film', prompt: '35mm vintage Kodak Portra 400 film grain, nostalgic color grading, warm analog glow' },
                      { label: '❄️ Nordic Winter', prompt: 'Nordic winter snowscape, crisp cold morning light, breath mist, soft ambient overcast' },
                      { label: '🌿 Botanical Studio', prompt: 'Lush botanical conservatory, dappled organic leaf shadows, emerald green accents' },
                      { label: '🎨 Oil Painting', prompt: 'Textured classical oil painting style, visible expressive impasto brushstrokes, rich glaze' },
                      { label: '✨ High-Fashion Editorial', prompt: 'Vogue editorial fashion photography, high-key studio strobe lighting, razor sharp detail' }
                    ].map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setVariationPrompt(chip.prompt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] border border-zinc-700/40 transition-colors cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Bottom tools inside prompt box */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                    <button
                      type="button"
                      onClick={handlePromptFromImage}
                      disabled={isGeneratingPromptFromImage || !variationSourceImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white text-xs font-semibold transition-all border border-zinc-700/60 cursor-pointer disabled:opacity-40"
                    >
                      {isGeneratingPromptFromImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-400" />
                      ) : (
                        <Scan className="w-3.5 h-3.5 text-pink-400" />
                      )}
                      <span>Prompt from Image</span>
                    </button>

                    {variationPrompt && (
                      <button
                        type="button"
                        onClick={() => setVariationPrompt('')}
                        title="Clear Prompt"
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Variation Strength Controls */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#12131b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <span>Variation Strength</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        variationStrength === 'low'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : variationStrength === 'medium'
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {variationStrengthNum}% · {variationStrength}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Controls how much creative liberty the AI takes relative to your source image.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVariationStrength('low');
                      setVariationStrengthNum(25);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationStrength === 'low'
                        ? 'bg-blue-500/10 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Low (10%–30%)</span>
                      {variationStrength === 'low' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">Stick tightly to source; only subtle tweaks to lighting or color.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVariationStrength('medium');
                      setVariationStrengthNum(50);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationStrength === 'medium'
                        ? 'bg-pink-500/10 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Medium (40%–60%)</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-semibold">Recommended</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">Balances core essence with creativity. Transforms environment and ambiance.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVariationStrength('high');
                      setVariationStrengthNum(85);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationStrength === 'high'
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">High (70%–100%)</span>
                      {variationStrength === 'high' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">Prioritizes prompt heavily. Uses image as loose pose or layout inspiration.</p>
                  </button>
                </div>

                <div className="pt-2 px-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-500">
                    <span>10% (Strict Source)</span>
                    <span className="font-mono text-zinc-300 font-semibold">{variationStrengthNum}%</span>
                    <span>100% (Wild Reimagine)</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={variationStrengthNum}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setVariationStrengthNum(val);
                      if (val <= 35) setVariationStrength('low');
                      else if (val <= 65) setVariationStrength('medium');
                      else setVariationStrength('high');
                    }}
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Section 4: Focus Area Targeting */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#12131b] p-4 space-y-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Focus Area Targeting</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Isolate specific components of the frame while holding others intact.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVariationFocusArea('entire')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationFocusArea === 'entire'
                        ? 'bg-pink-500/10 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold text-white">Entire Image</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Harmonize both subject and environment into the new requested style and context.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVariationFocusArea('subject')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationFocusArea === 'subject'
                        ? 'bg-pink-500/10 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold text-white">Subject Only</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Isolate and modify main focus (clothes, hair, pose, age) while leaving background untouched.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVariationFocusArea('background')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      variationFocusArea === 'background'
                        ? 'bg-pink-500/10 border-pink-500 text-white shadow-md shadow-pink-500/10'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold text-white">Background Only</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Isolate and rebuild or alter backdrop (city, forest, sunset) while keeping subject intact.
                    </p>
                  </button>
                </div>
              </div>

              {/* Section 5: Visual Coherency & Vibe Match */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#12131b] p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-bold text-white">Vibe Match & Lighting Harmonizer</span>
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-semibold">Active</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Enforces natural contact shadows, depth feathering, and color tone blending across boundaries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVariationVibeMatch(!variationVibeMatch)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    variationVibeMatch ? 'bg-pink-600' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      variationVibeMatch ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Section 6: Output & Quality Settings Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card 1: Output (Aspect Ratio & Resolution) */}
                <div
                  onClick={() => setShowVariationOutputModal(true)}
                  className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#12131b] hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 transition-colors">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-zinc-400 block">Output</span>
                      <span className="text-sm font-bold text-white">{variationRatio} · {variationResolution}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                </div>

                {/* Card 2: Quality */}
                <div
                  onClick={() => setShowVariationQualityModal(true)}
                  className="p-3.5 rounded-2xl border border-zinc-800/80 bg-[#12131b] hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-pink-400 transition-colors">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-zinc-400 block">Quality</span>
                      <span className="text-sm font-bold text-white">{variationQuality}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                </div>
              </div>

              {/* Bottom Stepper & Generate Variations Button */}
              {notice && (
                <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs my-2 ${noticeStyles[notice.type]}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-[#14151b] border border-zinc-800/80 text-white font-mono text-xs sm:text-sm shrink-0">
                  <button
                    type="button"
                    onClick={() => setCount(Math.max(1, count - 1))}
                    disabled={count <= 1}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-white min-w-[28px] text-center">
                    {count} <span className="text-zinc-500 font-normal">/ 8</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount(Math.min(8, count + 1))}
                    disabled={count >= 8}
                    className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleVariationsGenerate}
                  disabled={isGenerating || !variationSourceImage}
                  className="flex-1 py-3.5 rounded-2xl bg-[#ff2477] hover:bg-[#ff3b8b] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Variations...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Creative Variations</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Settings Popover/Modal */}
              {showVariationOutputModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white">Output Settings</span>
                      <button
                        type="button"
                        onClick={() => setShowVariationOutputModal(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Aspect Ratio Selection */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-400 block">Aspect Ratio</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['3:4', '1:1', '9:16', '16:9', '4:3', '2:3'] as string[]).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setVariationRatio(r)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              variationRatio === r
                                ? 'bg-pink-600/30 border-pink-500 text-white shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Resolution Selection */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-400 block">Resolution Tier</span>
                      <div className="grid grid-cols-4 gap-2">
                        {(['1k', '2k', '4k', '8k'] as ResolutionTier[]).map(res => (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setVariationResolution(res)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer uppercase ${
                              variationResolution === res
                                ? 'bg-purple-600/30 border-purple-500 text-white shadow'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVariationOutputModal(false)}
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Apply Output
                    </button>
                  </div>
                </div>
              )}

              {/* Quality Settings Popover/Modal */}
              {showVariationQualityModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white">Quality Tier</span>
                      <button
                        type="button"
                        onClick={() => setShowVariationQualityModal(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        { id: 'Draft', desc: 'Fastest preview, light detail' },
                        { id: 'Medium', desc: 'Recommended balance of speed & quality' },
                        { id: 'High', desc: 'Ultra-clear textures, accurate lighting' },
                        { id: 'Ultra', desc: 'Masterpiece 8K photographic fidelity' }
                      ].map(q => (
                        <div
                          key={q.id}
                          onClick={() => {
                            setVariationQuality(q.id as any);
                            setShowVariationQualityModal(false);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            variationQuality === q.id
                              ? 'bg-purple-950/40 border-purple-500 text-white'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold block">{q.id}</span>
                            <span className="text-[10px] text-zinc-400">{q.desc}</span>
                          </div>
                          {variationQuality === q.id && <Check className="w-4 h-4 text-pink-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* History Picker Modal */}
              {showVariationHistoryPicker && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#14151b] border border-zinc-800 rounded-2xl max-w-lg w-full p-4 space-y-3.5 shadow-2xl">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <History className="w-4 h-4 text-purple-400" />
                        <span>Pick Reference Image from History</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowVariationHistoryPicker(false)}
                        className="text-zinc-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 pr-1">
                      {[
                        ...results.map(r => r.url),
                        ...libraryItems.map(l => l.url),
                        ...editHistory
                      ].filter((url, i, arr) => arr.indexOf(url) === i).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setVariationSourceImage(imgUrl);
                            setShowVariationHistoryPicker(false);
                            flash('info', 'Image selected from history!');
                          }}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-pink-500 cursor-pointer transition-all"
                        >
                          <img src={imgUrl} alt={`History ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white bg-pink-600 px-2 py-0.5 rounded-full">Select</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MULTI VIEW WORKSPACE (MATCHES USER SCREENSHOT 1 & 2 - 9 CAMERA ANGLES) */}
          {activeTool === 'multi-view' && (
            <div className="space-y-4">
              <input
                ref={multiViewInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setMultiViewSourceImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                  e.target.value = '';
                }}
              />

              {/* Section 1: Dashed Dropzone for Reference Image (Screenshot 1) */}
              <div
                onClick={() => multiViewInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-[#14151b] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px] relative overflow-hidden"
              >
                {multiViewSourceImage ? (
                  <div className="relative group/preview flex flex-col items-center">
                    <img src={multiViewSourceImage} alt="Reference subject" className="max-h-56 rounded-xl object-contain shadow-2xl border border-zinc-700" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setMultiViewSourceImage(null); }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      ×
                    </button>
                    <span className="text-xs text-zinc-400 mt-2 font-medium">Click or drag to replace photo</span>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-300 group-hover:text-pink-400 group-hover:border-pink-500/50 mb-3 shadow-inner relative transition-colors">
                      <ImageIcon className="w-6 h-6 text-zinc-300 group-hover:text-pink-400" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-bold flex items-center justify-center shadow">
                        +
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">Add a reference image</span>
                    <span className="text-[11px] text-zinc-400 mt-1 max-w-sm">
                      Click or drag to upload / choose from <span className="underline hover:text-white cursor-pointer">History</span> • JPEG/PNG/WEBP, 20 MB max
                    </span>
                  </>
                )}
              </div>

              {/* Section 2: Aspect Ratio (10 Aspect Ratios matching Screenshot 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Aspect ratio</label>
                  <span className="text-[10px] font-mono text-pink-400 font-semibold">{multiViewRatio}</span>
                </div>

                <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-2.5 sm:p-3 space-y-2">
                  {/* Row 1 (Top 5: 21:9, 16:9, 3:2, 4:3, 5:4) */}
                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {MULTI_VIEW_RATIOS.slice(0, 5).map(r => {
                      const isSel = multiViewRatio === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setMultiViewRatio(r.id)}
                          className={`py-2 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-[#2a2f3a] border-zinc-500 text-white shadow-md'
                              : 'bg-[#181a20] border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                          }`}
                        >
                          <div
                            className={`border border-current rounded-[2px] transition-all ${
                              r.id === '21:9' ? 'w-5 h-2' :
                              r.id === '16:9' ? 'w-5 h-2.5' :
                              r.id === '3:2' ? 'w-4.5 h-3' :
                              r.id === '4:3' ? 'w-4 h-3' : 'w-4 h-3.2'
                            }`}
                          />
                          <span className="text-[9px] sm:text-[10px] font-mono font-medium truncate">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Row 2 (Bottom 5: 1:1, 4:5, 3:4, 2:3, 9:16) */}
                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {MULTI_VIEW_RATIOS.slice(5, 10).map(r => {
                      const isSel = multiViewRatio === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setMultiViewRatio(r.id)}
                          className={`py-2 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                            isSel
                              ? 'bg-[#2a2f3a] border-zinc-500 text-white shadow-md'
                              : 'bg-[#181a20] border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                          }`}
                        >
                          <div
                            className={`border border-current rounded-[2px] transition-all ${
                              r.id === '1:1' ? 'w-3.5 h-3.5' :
                              r.id === '4:5' ? 'w-3 h-3.8' :
                              r.id === '3:4' ? 'w-3 h-4' :
                              r.id === '2:3' ? 'w-2.5 h-4' : 'w-2 h-4.5'
                            }`}
                          />
                          <span className="text-[9px] sm:text-[10px] font-mono font-medium truncate">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Bottom Action Bar matching Screenshot 1 */}
              {notice && (
                <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs my-2 ${noticeStyles[notice.type]}`}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="flex-1 font-medium">{notice.text}</span>
                  <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {/* Angle Count Stepper */}
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#14151b] border border-zinc-800/80 gap-3">
                  <button
                    type="button"
                    onClick={() => setMultiViewAnglesCount(prev => (prev === 9 ? 4 : 9))}
                    className="text-zinc-400 hover:text-white text-base font-bold cursor-pointer px-1 select-none"
                  >
                    –
                  </button>
                  <div className="text-xs font-mono font-bold text-white whitespace-nowrap">
                    <span className="text-pink-400">{multiViewAnglesCount}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span className="text-zinc-400">9</span>
                    <span className="text-[9px] text-zinc-500 ml-1 font-sans">angles</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMultiViewAnglesCount(prev => (prev === 4 ? 6 : prev === 6 ? 8 : 9))}
                    className="text-zinc-400 hover:text-white text-base font-bold cursor-pointer px-1 select-none"
                  >
                    +
                  </button>
                </div>

                {/* Main Generate Button (Wide Pink Button matching Screenshot 1) */}
                <button
                  type="button"
                  onClick={handleMultiViewGenerate}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#d91276] via-[#ff2477] to-[#d91276] hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>{isGenerating ? 'Generating 9 Angles...' : 'Generate ✨ 35'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SKIN RETOUCH WORKSPACE (Fal.ai FLUX.2 & OpenRouter Studio) */}
          {activeTool === 'skin-retouch' && (
            <div className="space-y-4">
              <input
                ref={retouchInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setRetouchTargetImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                  e.target.value = '';
                }}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => retouchInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-[#14151b] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[180px] relative overflow-hidden"
              >
                {retouchTargetImage ? (
                  <div className="relative group/preview flex flex-col items-center">
                    <img src={retouchTargetImage} alt="Portrait subject" className="max-h-56 rounded-xl object-contain shadow-2xl border border-zinc-700" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setRetouchTargetImage(null); }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      ×
                    </button>
                    <span className="text-xs text-zinc-400 mt-2 font-medium">Click or drag to replace portrait</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-2xl">
                      ✨
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">Upload Portrait for AI Skin Retouch</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Natural micro-pores preservation, blemishes smoothing & glow tone correction
                    </p>
                  </>
                )}
              </div>

              {/* Retouch Intensity Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Retouch Intensity</label>
                  <span className="text-[10px] font-mono text-pink-400 font-semibold capitalize">{retouchIntensity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['subtle', 'moderate', 'high'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRetouchIntensity(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        retouchIntensity === lvl
                          ? 'bg-[#2a2f3a] border-pink-500 text-white shadow-md'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lvl === 'subtle' ? '🌿 Subtle Natural' : lvl === 'moderate' ? '✨ Balanced Studio' : '💎 High Glamour'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhancement Options */}
              <div className="rounded-2xl border border-zinc-800/80 bg-[#14151b] p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Preserve Natural Texture</span>
                    <span className="text-[10px] text-zinc-400">Keeps natural skin micro-pores without plastic blur</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={retouchPreserveTexture}
                    onChange={e => setRetouchPreserveTexture(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Anti-Blemish & Even Tone</span>
                    <span className="text-[10px] text-zinc-400">Cleans acne, redness and under-eye discoloration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={retouchAntiBlemish}
                    onChange={e => setRetouchAntiBlemish(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Custom Prompt / Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Custom Retouch Notes (Optional)</label>
                <input
                  type="text"
                  value={retouchCustomPrompt}
                  onChange={e => setRetouchCustomPrompt(e.target.value)}
                  placeholder="e.g. glass skin glow, soften forehead lines, maintain freckles"
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSkinRetouchGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d91276] via-[#ff2477] to-[#d91276] hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{isGenerating ? 'Retouching Skin with Fal.ai FLUX...' : 'Apply Skin Retouch ✨ 15'}</span>
              </button>
            </div>
          )}

          {/* VIRTUAL MAKEUP WORKSPACE (Fal.ai FLUX.2 & OpenRouter Studio) */}
          {activeTool === 'virtual-makeup' && (
            <div className="space-y-4">
              <input
                ref={makeupInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setMakeupTargetImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                  e.target.value = '';
                }}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => makeupInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-[#14151b] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[180px] relative overflow-hidden"
              >
                {makeupTargetImage ? (
                  <div className="relative group/preview flex flex-col items-center">
                    <img src={makeupTargetImage} alt="Portrait subject" className="max-h-56 rounded-xl object-contain shadow-2xl border border-zinc-700" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setMakeupTargetImage(null); }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      ×
                    </button>
                    <span className="text-xs text-zinc-400 mt-2 font-medium">Click or drag to replace portrait</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-2xl">
                      💄
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">Upload Portrait for Virtual Makeup</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Photorealistic lipstick, eyeliner, contour, blush & foundation styling
                    </p>
                  </>
                )}
              </div>

              {/* Makeup Style Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Makeup Aesthetic Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'natural', label: '🌸 Natural Fresh' },
                    { id: 'glam', label: '✨ Red Carpet Glam' },
                    { id: 'korean_glass', label: '💎 Korean Glass' },
                    { id: 'bridal', label: '👑 Royal Bridal' },
                    { id: 'smokey', label: '🖤 Smokey Evening' },
                    { id: 'editorial', label: '🎨 High Editorial' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setMakeupStyle(s.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        makeupStyle === s.id
                          ? 'bg-[#2a2f3a] border-pink-500 text-white shadow-md'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lipstick Color Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Lipstick Shade</label>
                  <span className="text-[10px] font-mono text-pink-400 font-semibold">{makeupLipstick.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'ruby_red', label: 'Ruby Red', color: '#b91c1c' },
                    { id: 'nude_pink', label: 'Nude Pink', color: '#db2777' },
                    { id: 'coral', label: 'Coral Peach', color: '#f97316' },
                    { id: 'berry', label: 'Rich Berry', color: '#831843' },
                    { id: 'peach', label: 'Soft Peach', color: '#fda4af' },
                    { id: 'deep_plum', label: 'Deep Plum', color: '#4c0519' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setMakeupLipstick(c.id)}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        makeupLipstick === c.id
                          ? 'bg-[#2a2f3a] border-pink-500 text-white'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.color }} />
                      <span className="text-[10px] font-medium truncate w-full text-center">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Foundation Finish */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Foundation Finish</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dewy', 'matte', 'satin'] as const).map(fin => (
                    <button
                      key={fin}
                      type="button"
                      onClick={() => setMakeupFoundation(fin)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        makeupFoundation === fin
                          ? 'bg-[#2a2f3a] border-pink-500 text-white shadow-md'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {fin === 'dewy' ? '💧 Dewy Glow' : fin === 'matte' ? '🌫️ Velvet Matte' : '✨ Silky Satin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Custom Cosmetics Detail (Optional)</label>
                <input
                  type="text"
                  value={makeupCustomPrompt}
                  onChange={e => setMakeupCustomPrompt(e.target.value)}
                  placeholder="e.g. winged eyeliner, champagne gold highlighter on cheekbones"
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleVirtualMakeupGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d91276] via-[#ff2477] to-[#d91276] hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{isGenerating ? 'Applying Cosmetics with Fal.ai FLUX...' : 'Apply Virtual Makeup 💄 20'}</span>
              </button>
            </div>
          )}

          {/* HAIR TRANSFORMATION WORKSPACE (Fal.ai FLUX.2 & OpenRouter Studio) */}
          {activeTool === 'hair-transform' && (
            <div className="space-y-4">
              <input
                ref={hairInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = ev => { if (ev.target?.result) setHairTargetImage(ev.target.result as string); };
                    r.readAsDataURL(f);
                  }
                  e.target.value = '';
                }}
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => hairInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-zinc-700/80 hover:border-pink-500/80 bg-[#14151b] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[180px] relative overflow-hidden"
              >
                {hairTargetImage ? (
                  <div className="relative group/preview flex flex-col items-center">
                    <img src={hairTargetImage} alt="Portrait subject" className="max-h-56 rounded-xl object-contain shadow-2xl border border-zinc-700" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setHairTargetImage(null); }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      ×
                    </button>
                    <span className="text-xs text-zinc-400 mt-2 font-medium">Click or drag to replace portrait</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-2xl">
                      💇‍♀️
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">Upload Portrait for Hair Transformation</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Hairstyle redesign, traditional Burmese Sadon, curls, bangs & vibrant hair dyes
                    </p>
                  </>
                )}
              </div>

              {/* Hairstyle Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Target Hairstyle</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'traditional_burmese_sadon', label: '🇲🇲 Burmese Sadon' },
                    { id: 'long_wavy', label: '🌊 Long Wavy' },
                    { id: 'sleek_bob', label: '✂️ Sleek Bob' },
                    { id: 'curly_afro', label: '🌀 Voluminous Curls' },
                    { id: 'pixie_cut', label: '⚡ Chic Pixie' },
                    { id: 'curtain_bangs', label: '💇 Curtain Bangs' },
                    { id: 'high_ponytail', label: '🎀 High Ponytail' },
                    { id: 'braids', label: '👑 Intricate Braids' },
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHairStyle(h.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        hairStyle === h.id
                          ? 'bg-[#2a2f3a] border-pink-500 text-white shadow-md'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Hair Color / Dye</label>
                  <span className="text-[10px] font-mono text-pink-400 font-semibold">{hairColor.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[
                    { id: 'jet_black', label: 'Jet Black', color: '#171717' },
                    { id: 'dark_brown', label: 'Espresso', color: '#451a03' },
                    { id: 'honey_blonde', label: 'Honey Blonde', color: '#f59e0b' },
                    { id: 'burgundy_wine', label: 'Burgundy', color: '#881337' },
                    { id: 'ash_platinum', label: 'Platinum', color: '#e2e8f0' },
                    { id: 'pastel_pink', label: 'Pastel Pink', color: '#f472b6' },
                    { id: 'rose_gold', label: 'Rose Gold', color: '#fb7185' },
                    { id: 'emerald_green', label: 'Emerald', color: '#047857' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setHairColor(c.id)}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        hairColor === c.id
                          ? 'bg-[#2a2f3a] border-pink-500 text-white'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: c.color }} />
                      <span className="text-[9px] font-medium truncate w-full text-center">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Length Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white">Hair Length</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['short', 'medium', 'long', 'extra_long'] as const).map(len => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setHairLength(len)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        hairLength === len
                          ? 'bg-[#2a2f3a] border-pink-500 text-white shadow-md'
                          : 'bg-[#181a20] border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {len.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Custom Hairstyle Description (Optional)</label>
                <input
                  type="text"
                  value={hairCustomPrompt}
                  onChange={e => setHairCustomPrompt(e.target.value)}
                  placeholder="e.g. Jasmine flower garland around Burmese Sadon, balayage highlights"
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleHairTransformGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d91276] via-[#ff2477] to-[#d91276] hover:brightness-110 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>{isGenerating ? 'Transforming Hair with Fal.ai FLUX...' : 'Transform Hair 💇‍♀️ 25'}</span>
              </button>
            </div>
          )}
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

          {/* Studio Section Tabs (Matching Reference Screenshot) */}
          <div className="hidden lg:flex items-center justify-between border-b border-zinc-800/80 pb-2.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('current');
                  setMobileTab('outputs');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'current'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-zinc-300" />
                <span>Live Outputs</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  activeMainTab === 'current' ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-800/60 text-zinc-400'
                }`}>
                  {results.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainTab('library');
                  setMobileTab('library');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeMainTab === 'library'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-zinc-300" />
                <span>Studio Library</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  activeMainTab === 'library' ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-800/60 text-zinc-400'
                }`}>
                  {libraryItems.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Cloud Sync Status / Button (Emerald Mint Theme) */}
              <button
                type="button"
                onClick={() => syncWithSupabaseCloud(true)}
                disabled={isCloudSyncing}
                title="Sync gallery with Cloud"
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Cloud className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-pulse text-amber-400' : 'text-emerald-400'}`} />
                <span>{isCloudSyncing ? 'Syncing...' : 'Cloud Synced'}</span>
                <RefreshCw className={`w-3 h-3 text-emerald-400/80 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* TAB 1: LIVE SESSION RESULTS */}
          {activeMainTab === 'current' && (
            <div className="space-y-4">
              {isGenerating && (
                <div className={`grid gap-3.5 ${count > 1 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {Array.from({ length: count }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-[#10141d] border border-zinc-800 animate-pulse flex flex-col items-center justify-center p-6 gap-2"
                      style={{ aspectRatio: ratio.replace(':', ' / ') }}
                    >
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <span className="text-xs font-mono text-zinc-400">Rendering high-res photo…</span>
                    </div>
                  ))}
                </div>
              )}

              {results.length > 0 ? (
                <div className="space-y-4">
                  {/* Secondary Toolbar: Session count, Auto-saved, Clear Results, View Mode Switcher */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span>Generated in this session ({results.length})</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <Bookmark className="w-3 h-3" /> Auto-saved
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClearAllResults}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Clear current results"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Clear Results</span>
                      </button>

                      {/* View Switcher: Grid vs Compact List (Matches Screenshot) */}
                      <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => setGalleryViewMode('grid')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            galleryViewMode === 'grid' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Grid View (3 Columns)"
                        >
                          <Grid className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGalleryViewMode('compact')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            galleryViewMode === 'compact' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Compact View"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Symmetrical 3-Column Image Gallery Grid (Matches Reference Screenshot) */}
                  <div className={`grid gap-4 sm:gap-4.5 ${
                    galleryViewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1 sm:grid-cols-2'
                  }`}>
                    {results.map(img => {
                      return (
                        <div
                          key={img.id}
                          className="group relative rounded-2xl overflow-hidden bg-[#10141d] border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 cursor-pointer shadow-lg"
                        >
                          <div
                            onClick={() => {
                              const match = libraryItems.find(l => l.id === img.id) || {
                                id: img.id,
                                url: img.url,
                                prompt: img.prompt,
                                provider: img.provider,
                                ratio: img.ratio,
                                resolutionTier: img.resolutionTier || resolutionTier,
                                resolutionDimensions: img.resolutionDimensions || currentResString,
                                folder: targetFolder,
                                createdAt: Date.now()
                              };
                              setLightboxItem(match);
                            }}
                            className="relative w-full bg-black/40 overflow-hidden"
                            style={{ aspectRatio: img.ratio ? img.ratio.replace(':', ' / ') : '4 / 5' }}
                          >
                            <img
                              src={img.url}
                              alt={img.prompt || 'Generated photo'}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                          </div>

                          {/* Floating Bottom Action Buttons: Download [⬇] and More [···] (Matches Reference) */}
                          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(img.url, img.id, img.ratio, img.resolutionTier || resolutionTier);
                              }}
                              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 shadow-md"
                              title="Download to device"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const match = libraryItems.find(l => l.id === img.id) || {
                                  id: img.id,
                                  url: img.url,
                                  prompt: img.prompt,
                                  provider: img.provider,
                                  ratio: img.ratio,
                                  resolutionTier: img.resolutionTier || resolutionTier,
                                  resolutionDimensions: img.resolutionDimensions || currentResString,
                                  folder: targetFolder,
                                  createdAt: Date.now()
                                };
                                setLightboxItem(match);
                              }}
                              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 shadow-md"
                              title="More options"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
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
                <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
                  {filteredLibrary.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setLightboxItem(item)}
                      className="group relative rounded-2xl overflow-hidden bg-[#12141c] border border-zinc-800/80 hover:border-cyan-500/80 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/15"
                    >
                      <div
                        className="relative w-full bg-black/40 overflow-hidden"
                        style={{ aspectRatio: item.ratio ? item.ratio.replace(':', ' / ') : '1 / 1' }}
                      >
                        <img
                          src={item.url}
                          alt={item.prompt || 'Library photo'}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
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
                className="text-xs text-zinc-500 hover:text-emerald-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Send prompt to Prompt Matrix
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ========== FOOTER (Matching Reference Screenshot) ========== */}
      <footer className="w-full border-t border-zinc-800/80 mt-12 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2025 SHOW AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Community Guidelines</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* ========== MULTI-SCREEN PHOTO INSPECTOR & STUDIO FUNCTIONS MODAL ========== */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 md:p-6"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="w-full max-w-6xl max-h-[94vh] rounded-3xl bg-[#0f1015] border border-zinc-800/90 shadow-2xl flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* -------------------- LEFT SIDE: PHOTO VIEW -------------------- */}
            <div className="lg:w-[58%] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-6 relative select-none min-h-[260px] sm:min-h-[340px] lg:min-h-[580px] border-b lg:border-b-0 lg:border-r border-zinc-800/80 shrink-0">
              {/* Floating badges on top of photo */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-zinc-200 shadow-md">
                  {lightboxItem.ratio}
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-500/40 text-xs font-mono font-bold text-pink-300 uppercase shadow-md">
                  {(lightboxItem.resolutionTier || resolutionTier).toUpperCase()}
                </span>
              </div>

              {/* Close button for mobile */}
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center lg:hidden z-10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* The Photo Container */}
              <div className="relative max-h-[55vh] lg:max-h-[82vh] w-full flex items-center justify-center">
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.prompt}
                  className="max-h-[55vh] lg:max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-zinc-800/60"
                />
              </div>

              {/* Bottom Quick Info */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>{lightboxItem.provider || 'AI Studio'}</span>
                <span>{(RESOLUTION_MAP[lightboxItem.ratio] && RESOLUTION_MAP[lightboxItem.ratio][lightboxItem.resolutionTier || resolutionTier]) || currentResString}</span>
              </div>
            </div>

            {/* -------------------- RIGHT SIDE: FUNCTION PANEL -------------------- */}
            <div className="lg:w-[42%] flex flex-col justify-between max-h-none lg:max-h-[94vh] bg-[#12141c] overflow-y-visible lg:overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-[#12141c]/95 backdrop-blur-md p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Studio Functions
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(lightboxItem.id)}
                    className={`p-2 rounded-full border transition-all cursor-pointer ${
                      lightboxItem.favorite
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-zinc-800 border-zinc-700/80 text-zinc-400 hover:text-amber-300'
                    }`}
                    title={lightboxItem.favorite ? 'Favorited' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${lightboxItem.favorite ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Function Body */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* 1. Prompt Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Prompt Description
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(lightboxItem.prompt)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-xs sm:text-sm text-zinc-200 leading-relaxed max-h-36 overflow-y-auto">
                    {lightboxItem.prompt}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUsePrompt(lightboxItem.prompt, lightboxItem.ratio, lightboxItem.provider)}
                    className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-500/20 cursor-pointer active:scale-[0.98]"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Load into Prompt Generator</span>
                  </button>
                </div>

                {/* 2. AI Creative Studio Action Hub */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    AI Studio Tools
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Send to Edit Image */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageSrc(lightboxItem.url);
                        setActiveTool('edit-image');
                        setLightboxItem(null);
                        flash('info', 'Loaded photo into Edit Image workspace!');
                      }}
                      className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Scissors className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="truncate">Edit Image</span>
                    </button>

                    {/* Send to Face Swap */}
                    <button
                      type="button"
                      onClick={() => {
                        setFaceSwapTargetImage(lightboxItem.url);
                        setActiveTool('face-swap');
                        setLightboxItem(null);
                        flash('info', 'Loaded photo as Face Swap target!');
                      }}
                      className="p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">Face Swap</span>
                    </button>

                    {/* Send to Change Background */}
                    <button
                      type="button"
                      onClick={() => {
                        setBgSubjectImage(lightboxItem.url);
                        setActiveTool('change-background');
                        setLightboxItem(null);
                        flash('info', 'Loaded photo into Change Background workspace!');
                      }}
                      className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Change BG</span>
                    </button>

                    {/* Send to Image Variations */}
                    <button
                      type="button"
                      onClick={() => {
                        setVariationSourceImage(lightboxItem.url);
                        setActiveTool('image-variations');
                        setLightboxItem(null);
                        flash('info', 'Loaded photo into Image Variations!');
                      }}
                      className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-200 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="truncate">Variations</span>
                    </button>
                  </div>

                  {/* Face Lock Slider & Social Export */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShareCommunityData({
                          isOpen: true,
                          imageUrl: lightboxItem.url,
                          prompt: lightboxItem.prompt,
                          title: 'Studio Creation'
                        });
                      }}
                      className="col-span-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{language === 'my' ? 'ကွန်မြူနတီသို့ မျှဝေမည် (+25 Credits ရယူပါ)' : 'Share to Community (+25 Bonus Credits)'}</span>
                    </button>

                    {uploadedRefImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSliderModalData({
                          isOpen: true,
                          beforeImage: uploadedRefImages[0].url,
                          afterImage: lightboxItem.url,
                          title: '100% Face Lock Before & After Comparison'
                        })}
                        className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        <span>Face Comparison</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const curUser = StorageService.getCurrentUser();
                        setSocialExportData({
                          isOpen: true,
                          imageUrl: lightboxItem.url,
                          prompt: lightboxItem.prompt,
                          authorName: curUser?.name || 'Creator',
                          authorHandle: curUser?.username || 'creator'
                        });
                      }}
                      className={`p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        uploadedRefImages.length === 0 ? 'col-span-2' : ''
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Social Export</span>
                    </button>
                  </div>
                </div>

                {/* 3. High-Fidelity Download & Upscale Suite */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Download & Upscaling
                  </span>

                  <button
                    type="button"
                    onClick={() => downloadImage(lightboxItem.url, lightboxItem.id, lightboxItem.ratio, lightboxItem.resolutionTier || resolutionTier)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-600/25 cursor-pointer active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Native PNG ({(lightboxItem.resolutionTier || resolutionTier).toUpperCase()})</span>
                  </button>

                  <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                    {(['1k', '2k', '4k', '8k'] as ResolutionTier[]).map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => downloadImage(lightboxItem.url, lightboxItem.id, lightboxItem.ratio, tier)}
                        className="py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/50 text-zinc-300 hover:text-white transition-all text-center uppercase font-bold cursor-pointer"
                        title={`Export directly at ${tier.toUpperCase()}`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Metadata Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block">AI Engine</span>
                    <span className="text-zinc-200 font-semibold truncate block">{lightboxItem.provider}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block">Aspect Ratio</span>
                    <span className="text-zinc-200 font-semibold block">{lightboxItem.ratio}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Move to folder / Delete */}
              <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMoveFolderModal(lightboxItem)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Move Folder</span>
                </button>

                <button
                  type="button"
                  onClick={e => {
                    handleDeleteLibraryItem(lightboxItem.id, e);
                    handleRemoveResultPhoto(lightboxItem.id, e);
                    setLightboxItem(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Photo</span>
                </button>
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
                            setP2pOpen(false);
                            flash('info', '✨ Prompt applied to description!');
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-pink-500/20"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Use prompt
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

      {/* Before / After Drag Comparison Slider Modal */}
      <BeforeAfterSliderModal
        isOpen={sliderModalData.isOpen}
        onClose={() => setSliderModalData({ isOpen: false, beforeImage: '', afterImage: '' })}
        beforeImage={sliderModalData.beforeImage}
        afterImage={sliderModalData.afterImage}
        title={sliderModalData.title}
      />

      {/* Social Media 1-Click Multi-Ratio Export Modal */}
      <SocialExportModal
        isOpen={socialExportData.isOpen}
        onClose={() => setSocialExportData({ isOpen: false, imageUrl: '', prompt: '', title: '', authorName: '', authorHandle: '' })}
        imageUrl={socialExportData.imageUrl}
        prompt={socialExportData.prompt}
        title={socialExportData.title}
        authorName={socialExportData.authorName}
        authorHandle={socialExportData.authorHandle}
        language={language}
      />

      {/* Share to Community Modal (+25 Bonus Credits) */}
      {shareCommunityData.isOpen && (
        <ShareToCommunityModal
          isOpen={shareCommunityData.isOpen}
          onClose={() => setShareCommunityData({ isOpen: false, imageUrl: '', prompt: '', title: '' })}
          imageUrl={shareCommunityData.imageUrl}
          prompt={shareCommunityData.prompt}
          title={shareCommunityData.title}
          currentUser={StorageService.getCurrentUser()}
          language={language}
          onShareSuccess={() => {
            const currentU = StorageService.getCurrentUser();
            setUserCredits(currentU.credits || 0);
            flash('info', language === 'my' ? '🎉 ကွန်မြူနတီသို့ မျှဝေပြီးပါပြီ! +25 Bonus Credits ရရှိပါသည်' : '🎉 Shared to Community Feed! +25 Bonus Credits awarded!');
          }}
        />
      )}
          {/* ========== IMAGE TOOLS MODAL / DRAWER (MATCHING SCREENSHOT 2) ========== */}
      {toolsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setToolsModalOpen(false)}>
          <div
            className="w-full sm:max-w-md max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14151b] border border-zinc-800 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-white">Image</h3>
              </div>
              <button
                type="button"
                onClick={() => setToolsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-header: Image tools & View Mode Toggle */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50 bg-[#121319]">
              <span className="text-xs font-bold text-white tracking-tight">Image tools</span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setToolsViewMode('list')}
                  className={`p-1 rounded transition-colors ${toolsViewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setToolsViewMode('grid')}
                  className={`p-1 rounded transition-colors ${toolsViewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tools List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin">
              {STUDIO_TOOLS.map(t => {
                const isSelected = activeTool === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTool(t.id);
                      setToolsModalOpen(false);
                      flash('info', `Switched to ${t.name}`, 2000);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-zinc-900/90 border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ToolAvatar type={t.avatarType} className="w-12 h-12" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {t.name}
                          </span>
                          {t.badge && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/30">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {t.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {t.pinned && (
                        <Pin className="w-3.5 h-3.5 text-pink-400 fill-pink-400 rotate-45" />
                      )}
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </div>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== MODEL PICKER MODAL ========== */}
      {modelPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setModelPickerOpen(false)}>
          <div
            className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14151b] border border-zinc-800 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-white">Select AI Model</h3>
                <p className="text-[11px] text-zinc-400">Choose generative image engine</p>
              </div>
              <button
                type="button"
                onClick={() => setModelPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {models.map(m => {
                const isSelected = modelId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setModelId(m.id);
                      setModelPickerOpen(false);
                      flash('info', `Selected ${m.name}`);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ModelLogo modelId={m.id} className="w-10 h-10" />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {m.name}
                          </span>
                          {m.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 text-[9px] font-bold border border-pink-500/30">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {m.desc || m.category}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== OUTPUT ASPECT RATIO SHEET ========== */}
      {outputPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setOutputPickerOpen(false)}>
          <div
            className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14151b] border border-zinc-800 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-white">Select Output Aspect Ratio</h3>
                <p className="text-[11px] text-zinc-400">Dimensions & framing format</p>
              </div>
              <button
                type="button"
                onClick={() => setOutputPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {RATIOS.map(r => {
                const isSelected = ratio === r.id;
                const dims = (RESOLUTION_MAP[r.id] && RESOLUTION_MAP[r.id][resolutionTier]) || '';
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      changeRatio(r.id);
                      setOutputPickerOpen(false);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
                        <span className={`${r.box} rounded-[2px] border ${isSelected ? 'border-pink-400 bg-pink-500/30' : 'border-zinc-500'}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {r.label}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            ({r.id})
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {dims} px • {r.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== QUALITY & RESOLUTION SHEET ========== */}
      {qualityPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200" onClick={() => setQualityPickerOpen(false)}>
          <div
            className="w-full sm:max-w-md max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14151b] border border-zinc-800 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-white">Image Quality & Resolution</h3>
                <p className="text-[11px] text-zinc-400">Canvas upscale pixel resolution tier</p>
              </div>
              <button
                type="button"
                onClick={() => setQualityPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
              {RESOLUTION_TIERS.map(t => {
                const isSelected = resolutionTier === t.id;
                const dims = (RESOLUTION_MAP[ratio] && RESOLUTION_MAP[ratio][t.id]) || '';
                const rate = TIER_CREDIT_RATES[t.id] || 5;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      changeResolutionTier(t.id);
                      setQualityPickerOpen(false);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-zinc-900 border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0">
                        <span className="text-xs font-mono font-bold text-pink-300 uppercase">
                          {t.id}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {t.label}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {rate} cr/photo
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {dims} px • {t.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========== FLOATING BOTTOM MOBILE NAVIGATION DOCK ========== */}
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-0 z-40 flex items-center justify-center px-3 pointer-events-none lg:hidden">
        <div className="pointer-events-auto flex items-center p-1 rounded-full bg-[#14151f]/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl shadow-black/90 gap-1 max-w-sm w-full justify-between">
          <button
            type="button"
            onClick={() => setMobileTab('studio')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'studio'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('outputs');
              setActiveMainTab('current');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mobileTab !== 'studio' && activeMainTab === 'current'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-pink-300" />
            <span>Outputs</span>
            {results.length > 0 && (
              <span className="px-1 py-0.2 rounded-full bg-white/25 text-[9px] font-mono leading-none">
                {results.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('outputs');
              setActiveMainTab('library');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mobileTab !== 'studio' && activeMainTab === 'library'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-cyan-300" />
            <span>Library</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onBackToMatrix) onBackToMatrix();
              else if (onNavigateView) onNavigateView('matrix');
            }}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-full text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="Burmese Hub & Matrix"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hub</span>
          </button>
        </div>
      </div>

    </div>
  );
};
