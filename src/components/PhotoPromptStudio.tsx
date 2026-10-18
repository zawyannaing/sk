import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Sparkles, Wand2, Image as ImageIcon, Download, Copy, Check, X,
  Loader2, Upload, RefreshCw, ChevronDown, ExternalLink, AlertTriangle, Camera,
  Zap, Star, Flame, ShieldCheck, Folder, FolderPlus, FolderOpen, Heart, Trash2,
  Search, Tag, Eye, Edit3, SlidersHorizontal, Clock, Bookmark
} from 'lucide-react';
import type { NavView } from './Sidebar';

interface PhotoPromptStudioProps {
  onNavigateView?: (view: NavView, photoUrl?: string) => void;
  onBackToMatrix?: () => void;
  onSendToMatrix?: (promptText: string) => void;
  onBackToPortal?: () => void;
  language?: any;
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

const safeLoadLibrary = (): LibraryPhotoItem[] => {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
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
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // If quota exceeded, retain all favorites and newest 20 items
    console.warn('Storage quota warning in Photo Library, optimizing storage...');
    const favs = items.filter(x => x.favorite);
    const nonFavs = items.filter(x => !x.favorite).slice(0, 16);
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify([...favs, ...nonFavs]));
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
  { id: 'nano-banana-2', name: 'Nano Banana 2 (Google Gemini)', category: 'Nano Banana', badge: 'TOP', desc: 'Google Gemini 2.5 Flash Image engine, ultra-fast & photorealistic', envKey: 'GEMINI_API_KEY', available: true },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro (Imagen 3)', category: 'Nano Banana', badge: 'PRO', desc: 'Google Imagen 3.0 Ultra studio fidelity with rich micro-textures', envKey: 'GEMINI_API_KEY', available: true },
  
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

const RATIOS: { id: string; label: string; box: string }[] = [
  { id: '1:1', label: 'Square', box: 'w-4 h-4' },
  { id: '4:5', label: 'Portrait', box: 'w-3.5 h-4' },
  { id: '9:16', label: 'Story', box: 'w-2.5 h-4' },
  { id: '16:9', label: 'Wide', box: 'w-5 h-3' },
  { id: '21:9', label: 'Cinema', box: 'w-6 h-2.5' },
];

const IDEAS = [
  { label: 'Cinematic Portrait', prompt: 'Cinematic studio portrait of a confident woman, natural skin texture, Rembrandt lighting, 85mm f/1.4 lens, shallow depth of field' },
  { label: 'Cyberpunk Rain', prompt: 'Futuristic courier on a hoverbike in a neon rain-drenched alley, reflections on wet asphalt, volumetric fog' },
  { label: 'Editorial Fashion', prompt: 'High-fashion editorial photograph, flowing silk drapery, gold jewelry, rim lighting, magazine cover composition' },
  { label: 'Macro Nature', prompt: 'Macro photograph of morning dew droplets on emerald leaf veins, extreme detail, soft bokeh background' },
  { label: 'Vintage Film', prompt: '1970s Kodachrome street photograph, warm analog colors, natural film grain, candid moment' },
  { label: 'Product Shot', prompt: 'Luxury perfume bottle on black marble, dramatic studio lighting, crisp reflections, commercial product photography' },
];

// Remove Midjourney-style flags so other engines get a clean sentence
const cleanForImage = (p: string) =>
  p.replace(/\/imagine prompt:\s*/gi, '').replace(/--[a-z]+(\s+[\w:.]+)?/gi, '').replace(/\s{2,}/g, ' ').trim();

export const PhotoPromptStudio: React.FC<PhotoPromptStudioProps> = ({
  onBackToPortal,
  onSendToMatrix
}) => {
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [modelId, setModelId] = useState('nano-banana-2');
  const [modelOpen, setModelOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [count, setCount] = useState(2);
  const [polish, setPolish] = useState(true);

  // Folder & Library System
  const [folders, setFolders] = useState<string[]>(safeLoadFolders);
  const [targetFolder, setTargetFolder] = useState<string>('General');
  const [libraryItems, setLibraryItems] = useState<LibraryPhotoItem[]>(safeLoadLibrary);
  const [activeMainTab, setActiveMainTab] = useState<'current' | 'library'>('current');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');

  // Modals & Inspection
  const [lightboxItem, setLightboxItem] = useState<LibraryPhotoItem | null>(null);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveFolderModal, setMoveFolderModal] = useState<LibraryPhotoItem | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ResultImage[]>([]);
  const [notice, setNotice] = useState<{ type: 'info' | 'warn' | 'error'; text: string } | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  // Photo → Prompt modal
  const [p2pOpen, setP2pOpen] = useState(false);
  const [p2pImage, setP2pImage] = useState<string | null>(null);
  const [p2pBusy, setP2pBusy] = useState(false);
  const [p2pPrompt, setP2pPrompt] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const selected = models.find(m => m.id === modelId) || models[0];

  // Refresh available models from server
  useEffect(() => {
    fetch('/api/photo-studio/models')
      .then(r => r.json())
      .then(d => { if (d?.models?.length) setModels(d.models); })
      .catch(() => { /* keep defaults */ });
  }, []);

  const flash = (type: 'info' | 'warn' | 'error', text: string, ms = 5000) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), ms);
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t).catch(() => {});
    flash('info', 'Prompt copied to clipboard! 📋', 2000);
  };

  const downloadImage = async (url: string, id: string) => {
    try {
      const blob = await (await fetch(url)).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `photo-studio-${id}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  // ---- Enhance prompt with AI ----
  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/generate-photo-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), model: 'Flux', format: 'normal', aspectRatio: ratio })
      });
      const data = await res.json();
      if (data?.resultText) {
        setPrompt(cleanForImage(data.resultText));
        flash('info', data.isFallback ? 'Enhanced with built-in photography rules.' : 'Prompt enhanced with AI.', 3000);
      }
    } catch {
      flash('error', 'Could not enhance prompt. Check your connection.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // ---- Generate photos with Auto-Save into Section Library ----
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setNotice(null);
    try {
      let finalPrompt = cleanForImage(prompt);
      if (polish && finalPrompt.length < 160) {
        finalPrompt += ', professional photography, highly detailed, sharp focus, natural lighting, 8k';
      }
      const res = await fetch('/api/photo-studio/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, model: modelId, aspectRatio: ratio, count })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error || 'Generation failed');

      const batchTime = Date.now();
      const assignedFolder = targetFolder || 'General';

      const batch: ResultImage[] = (data.images as string[]).map((url, i) => ({
        id: `${batchTime}-${i}`,
        url,
        prompt: finalPrompt,
        provider: data.provider || selected.name,
        ratio,
        folder: assignedFolder,
        createdAt: batchTime,
        favorite: false
      }));

      // 1. Update Live Session
      setResults(prev => [...batch, ...prev].slice(0, 24));

      // 2. Auto-Save to Section Library (localStorage)
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

      flash('info', `✨ Generated & auto-saved ${count} photo(s) to Library folder "${assignedFolder}"!`, 4000);
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
    flash('info', `Folder "📁 ${name}" created successfully!`);
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
    setLibraryItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      );
      safeSaveLibrary(updated);
      return updated;
    });
    if (lightboxItem && lightboxItem.id === id) {
      setLightboxItem(prev => (prev ? { ...prev, favorite: !prev.favorite } : null));
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
    setMoveFolderModal(null);
    flash('info', `Moved photo to "📁 ${newFolder}".`);
  };

  const handleDeleteLibraryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to remove this photo and prompt from your library?')) return;
    setLibraryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      safeSaveLibrary(updated);
      return updated;
    });
    if (lightboxItem && lightboxItem.id === id) {
      setLightboxItem(null);
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
    flash('info', 'Loaded prompt and settings into generator! ✨', 2500);
  };

  // ---- Photo → Prompt (vision) ----
  const analyzeFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      flash('error', 'Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async e => {
      const dataUrl = e.target?.result as string;
      setP2pImage(dataUrl);
      setP2pPrompt('');
      setP2pBusy(true);
      try {
        const res = await fetch('/api/photo-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, targetEngine: 'flux', language: 'en' })
        });
        const data = await res.json();
        const a = data?.analysis;
        setP2pPrompt(cleanForImage(a?.masterPrompt || a?.fluxPrompt || a?.midjourneyPrompt || ''));
        if (data?.warning) flash('warn', 'Vision AI key not set — showing a generic result. Add GEMINI_API_KEY for real analysis.', 7000);
      } catch {
        flash('error', 'Could not analyze the image.');
      } finally {
        setP2pBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const noticeStyles = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
    warn: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
    error: 'bg-red-500/10 border-red-500/30 text-red-200'
  } as const;

  const canGenerate = prompt.trim().length > 0 && !isGenerating;

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onBackToPortal && (
              <button
                type="button"
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Sections</span>
              </button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-fuchsia-600/20 border border-pink-500/30 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-pink-400" />
              </div>
              <h1 className="text-sm sm:text-base font-bold truncate tracking-tight">Photo Prompt Studio</h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] font-mono text-pink-300">
                Studio Hub v2.5
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMainTab('library')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeMainTab === 'library'
                  ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Library</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950/80 text-[10px] text-cyan-300 font-mono">
                {libraryItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setP2pOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Photo to Prompt</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========== BODY ========== */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-8 grid grid-cols-1 lg:grid-cols-[410px_minmax(0,1fr)] xl:grid-cols-[450px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">

        {/* ---------- LEFT: CONTROLS ---------- */}
        <section className="space-y-4 lg:sticky lg:top-20">

          {/* Model picker */}
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>AI Photo Model & Engine</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {models.length} Models
              </span>
            </div>

            {/* Quick-toggle top models pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'nano-banana-2', label: '🍌 Nano Banana 2', badge: 'TOP' },
                { id: 'nano-banana-pro', label: '👑 Nano Banana Pro', badge: 'PRO' },
                { id: 'gpt-image-2', label: '🤖 GPT Image 2', badge: 'TOP' },
                { id: 'flux-realism', label: '📸 FLUX Photoreal', badge: 'TOP' },
                { id: 'sd-3-5', label: '⚡ SD 3.5 Large', badge: 'FREE' },
              ].map(m => {
                const isAct = modelId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelId(m.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isAct
                        ? 'bg-pink-500/20 border-pink-500/60 text-pink-200 shadow-sm shadow-pink-500/20 font-semibold'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className={`text-[9px] font-bold px-1 rounded ${
                      m.badge === 'TOP' ? 'bg-amber-500/25 text-amber-300' :
                      m.badge === 'PRO' ? 'bg-purple-500/25 text-purple-300' : 'bg-emerald-500/25 text-emerald-300'
                    }`}>
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Model Button */}
            <button
              type="button"
              onClick={() => setModelOpen(o => !o)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#14161d] border border-zinc-800 hover:border-pink-500/40 hover:bg-[#181a24] transition-all text-left group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-100 group-hover:text-pink-300 transition-colors truncate">
                    {selected.name}
                  </span>
                  {selected.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      selected.badge === 'TOP' ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' :
                      selected.badge === 'PRO' ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' :
                      selected.badge === 'FREE' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' :
                      'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    }`}>
                      {selected.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {selected.desc || (selected.available ? 'Ready to synthesize high-resolution images' : `Needs ${selected.envKey}`)}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.available ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
                  {selected.available ? (selected.envKey ? 'ACTIVE' : 'FREE') : 'KEY'}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${modelOpen ? 'rotate-180 text-pink-400' : ''}`} />
              </div>
            </button>

            {/* Model Dropdown Menu */}
            {modelOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-[#161822] border border-zinc-700 shadow-2xl p-2 space-y-3 backdrop-blur-xl">
                {['Nano Banana', 'OpenAI', 'Top Open Tier', 'Cloud Pro'].map(cat => {
                  const group = models.filter(m => (m.category || 'Top Open Tier') === cat);
                  if (!group.length) return null;
                  const catTitle =
                    cat === 'Nano Banana' ? '🍌 Nano Banana & Google DeepMind' :
                    cat === 'OpenAI' ? '🤖 OpenAI Flagships' :
                    cat === 'Top Open Tier' ? '✨ Top Open-Source & Photoreal' : '☁️ Cloud Pro APIs';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 pt-1 font-semibold">
                        {catTitle}
                      </div>
                      <div className="space-y-1">
                        {group.map(m => {
                          const isAct = m.id === modelId;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => { setModelId(m.id); setModelOpen(false); }}
                              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                isAct ? 'bg-pink-500/15 border border-pink-500/40 text-pink-200' : 'hover:bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{m.name}</div>
                                <div className="text-[11px] text-zinc-500 truncate">{m.desc || m.category}</div>
                              </div>
                              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                m.badge === 'TOP' ? 'bg-amber-500/20 text-amber-300' :
                                m.badge === 'PRO' ? 'bg-purple-500/20 text-purple-300' :
                                m.badge === 'FREE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {m.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Prompt input */}
          <div className="rounded-2xl border border-zinc-800 bg-[#14161d] focus-within:border-pink-500/50 transition-colors">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
              placeholder="Describe the photo you want to create…"
              rows={4}
              maxLength={1500}
              className="w-full bg-transparent px-4 pt-3.5 text-sm placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!prompt.trim() || isEnhancing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-pink-500/20 hover:text-pink-300 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-inherit text-xs font-medium transition-colors"
                >
                  {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Enhance
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

          {/* Destination Folder Selector */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#12141c] p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Save Destination Folder</div>
                <div className="text-xs font-semibold text-zinc-200 truncate">📁 {targetFolder}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={targetFolder}
                onChange={e => {
                  if (e.target.value === '__NEW__') {
                    setNewFolderModal(true);
                  } else {
                    setTargetFolder(e.target.value);
                  }
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {folders.map(f => (
                  <option key={f} value={f}>📁 {f}</option>
                ))}
                <option value="__NEW__">➕ New Folder…</option>
              </select>

              <button
                type="button"
                title="Create New Folder"
                onClick={() => setNewFolderModal(true)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500/20 text-zinc-400 hover:text-cyan-300 border border-zinc-700 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Idea chips */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400" /> Ideas & Inspiration
            </div>
            <div className="flex flex-wrap gap-1.5">
              {IDEAS.map(i => (
                <button
                  key={i.label}
                  type="button"
                  onClick={() => setPrompt(i.prompt)}
                  className="px-3 py-1.5 rounded-full text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/50 text-zinc-300 transition-colors"
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Aspect ratio</label>
            <div className="grid grid-cols-5 gap-1.5">
              {RATIOS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRatio(r.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[11px] transition-colors ${
                    ratio === r.id ? 'bg-pink-500/10 border-pink-500/50 text-pink-200' : 'bg-[#14161d] border-zinc-800 hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span className={`${r.box} rounded-[3px] border-2 ${ratio === r.id ? 'border-pink-400' : 'border-zinc-500'}`} />
                  <span className="font-semibold">{r.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Count + polish */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">Images count</label>
              <div className="flex rounded-xl overflow-hidden border border-zinc-800 bg-[#14161d]">
                {[1, 2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${count === n ? 'bg-pink-500 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">8K Auto-polish</label>
              <button
                type="button"
                onClick={() => setPolish(p => !p)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm transition-colors ${
                  polish ? 'bg-pink-500/10 border-pink-500/40 text-pink-200' : 'bg-[#14161d] border-zinc-800 text-zinc-400'
                }`}
              >
                <span>{polish ? 'Enhanced' : 'Raw'}</span>
                <span className={`w-8 h-4 rounded-full p-0.5 transition-colors ${polish ? 'bg-pink-500' : 'bg-zinc-700'}`}>
                  <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${polish ? 'translate-x-4' : ''}`} />
                </span>
              </button>
            </div>
          </div>

          {/* Desktop generate */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-[0.99]"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Photos…</> : <><Sparkles className="w-4 h-4" /> Generate {count} photo{count > 1 ? 's' : ''}</>}
          </button>
        </section>

        {/* ---------- RIGHT: RESULTS & INTEGRATED LIBRARY ---------- */}
        <section className="min-w-0 space-y-4">
          {notice && (
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-xs sm:text-sm ${noticeStyles[notice.type]}`}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="flex-1">{notice.text}</span>
              <button type="button" onClick={() => setNotice(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Studio Section Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMainTab('current')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
                onClick={() => setActiveMainTab('library')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeMainTab === 'library'
                    ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>Studio Library & Folders</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
                  {libraryItems.length}
                </span>
              </button>
            </div>

            {activeMainTab === 'library' && (
              <button
                type="button"
                onClick={() => setNewFolderModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Folder</span>
              </button>
            )}
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
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span>Generated in this session ({results.length}):</span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Bookmark className="w-3 h-3" /> Auto-saved to Library
                    </span>
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
                                📁 {img.folder || targetFolder}
                              </span>
                              <button
                                type="button"
                                onClick={e => handleToggleFavorite(img.id, e)}
                                className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md border transition-colors ${
                                  isFav
                                    ? 'bg-amber-500/30 border-amber-500/60 text-amber-300'
                                    : 'bg-black/60 border-white/10 text-zinc-400 hover:text-amber-300'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                              </button>
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
                              </div>
                            </div>
                          </div>

                          {/* Prompt snippet */}
                          <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800/80 flex flex-col justify-between gap-1.5">
                            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                              {img.prompt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                              <span>Ratio: {img.ratio}</span>
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
                      <Folder className="w-4 h-4 text-cyan-400" />
                      <span>All generations are preserved in your <b>Studio Library & Folders</b>.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('library')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
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
                    Write a prompt, select your preferred engine and folder destination, then click Generate.
                    Images are automatically stored in your local Library folders.
                  </p>
                  {libraryItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('library')}
                      className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-cyan-300 border border-zinc-700 flex items-center gap-2 transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Browse Saved Photos ({libraryItems.length})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDIO LIBRARY & FOLDERS */}
          {activeMainTab === 'library' && (
            <div className="space-y-4">
              {/* Folder Pills Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono uppercase tracking-wider text-[11px] text-zinc-500 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Filter by Folder</span>
                  </span>
                  {activeFolderFilter !== 'all' && activeFolderFilter !== 'favorites' && !['General', 'Cinematic'].includes(activeFolderFilter) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(activeFolderFilter)}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete this folder</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {/* All Photos */}
                  <button
                    type="button"
                    onClick={() => setActiveFolderFilter('all')}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      activeFolderFilter === 'all'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span>🌐 All Photos</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {libraryItems.length}
                    </span>
                  </button>

                  {/* Favorites */}
                  <button
                    type="button"
                    onClick={() => setActiveFolderFilter('favorites')}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      activeFolderFilter === 'favorites'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Heart className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Favorites</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {libraryItems.filter(x => x.favorite).length}
                    </span>
                  </button>

                  {/* Individual Folders */}
                  {folders.map(f => {
                    const countInFolder = libraryItems.filter(x => x.folder === f).length;
                    const isAct = activeFolderFilter === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setActiveFolderFilter(f)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isAct
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm font-semibold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <span>📁 {f}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                          {countInFolder}
                        </span>
                      </button>
                    );
                  })}

                  {/* Add Folder button */}
                  <button
                    type="button"
                    onClick={() => setNewFolderModal(true)}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-zinc-700 hover:border-cyan-400/60 text-zinc-400 hover:text-cyan-300 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>New Folder</span>
                  </button>
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

                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-mono text-zinc-400 px-1">
                  <span>Showing: <b>{filteredLibrary.length}</b> of {libraryItems.length}</span>
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
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setMoveFolderModal(item);
                            }}
                            className="pointer-events-auto px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-200 hover:border-cyan-400 flex items-center gap-1 transition-colors"
                          >
                            <Folder className="w-3 h-3 text-cyan-400" />
                            <span>{item.folder}</span>
                          </button>

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

      {/* ========== MOBILE STICKY GENERATE BAR ========== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-[#0a0b0e] via-[#0a0b0e]/95 to-transparent pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-bold text-sm shadow-lg shadow-pink-500/20"
        >
          {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate {count} photo{count > 1 ? 's' : ''}</>}
        </button>
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
                    📁 {lightboxItem.folder}
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

                {/* Move to another folder */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Move to Folder</label>
                  <select
                    value={lightboxItem.folder}
                    onChange={e => handleMoveFolder(lightboxItem.id, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
                  >
                    {folders.map(f => (
                      <option key={f} value={f}>📁 {f}</option>
                    ))}
                  </select>
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
                    onClick={() => handleDeleteLibraryItem(lightboxItem.id)}
                    className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
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

      {/* ========== NEW FOLDER MODAL ========== */}
      {newFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setNewFolderModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#14161f] border border-zinc-700 p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-100">Create New Folder</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewFolderModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Neon Cars, Architecture)"
                maxLength={30}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewFolderModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MOVE FOLDER MODAL ========== */}
      {moveFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setMoveFolderModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#14161f] border border-zinc-700 p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-100">Move to Folder</h3>
              <button
                type="button"
                onClick={() => setMoveFolderModal(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {folders.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleMoveFolder(moveFolderModal.id, f)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium border transition-colors ${
                    moveFolderModal.folder === f
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>📁 {f}</span>
                  {moveFolderModal.folder === f && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== PHOTO → PROMPT MODAL ========== */}
      {p2pOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4" onClick={() => setP2pOpen(false)}>
          <div
            className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#101218] border border-zinc-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[#101218] z-10 flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base">Photo to Prompt</h3>
                <p className="text-xs text-zinc-500">Vision AI reverse-engineers a master prompt from any photo</p>
              </div>
              <button type="button" onClick={() => setP2pOpen(false)} className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) analyzeFile(f); e.target.value = ''; }}
              />

              {/* Upload */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) analyzeFile(f); }}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer min-h-[220px] sm:min-h-[320px] flex items-center justify-center overflow-hidden transition-colors ${
                  dragOver ? 'border-pink-400 bg-pink-500/10' : 'border-zinc-700 hover:border-pink-500/60 bg-zinc-900/50'
                }`}
              >
                {p2pImage ? (
                  <img src={p2pImage} alt="Uploaded" className="absolute inset-0 w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-6 text-zinc-400">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                    <p className="text-sm font-medium">Drop a photo or tap to upload</p>
                    <p className="text-xs text-zinc-600 mt-1">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              {/* Output */}
              <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-3 flex flex-col min-h-[220px] sm:min-h-[320px]">
                {p2pBusy ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
                    <Loader2 className="w-7 h-7 text-pink-400 animate-spin" />
                    Analyzing photo…
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
                        onClick={() => { setPrompt(p2pPrompt); setP2pOpen(false); }}
                        className="flex-1 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white text-xs font-bold flex items-center justify-center gap-1.5"
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
      )}
    </div>
  );
};
