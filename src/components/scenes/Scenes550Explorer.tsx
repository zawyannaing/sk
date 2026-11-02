import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Sun,
  Copy,
  Check,
  ArrowRight,
  Maximize2,
  X,
  Palette,
  Camera,
  Layers,
  HeartHandshake,
  Compass,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  SceneItem,
  SCENES_550_COLLECTION,
  SCENE_CATEGORIES
} from '../../data/scenes550Data';
import { SupabaseService } from '../../utils/supabaseClient';
import { Language } from '../../types';
import { ImageStreamHero } from '../ui/image-stream-hero';

interface Scenes550ExplorerProps {
  language: Language;
  onUseSceneAsBackground?: (scene: SceneItem) => void;
  onSendPromptToStudio?: (prompt: string) => void;
}

export const Scenes550Explorer: React.FC<Scenes550ExplorerProps> = ({
  language,
  onUseSceneAsBackground,
  onSendPromptToStudio
}) => {
  const isMm = language === 'my';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSun, setSelectedSun] = useState<string>('all');
  const [selectedAtmo, setSelectedAtmo] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [inspectedScene, setInspectedScene] = useState<SceneItem | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(36);
  const [cloudOverrides, setCloudOverrides] = useState<Record<string, string>>({});
  const [batchStatusMap, setBatchStatusMap] = useState<Record<string, any>>({});

  // Sync real-time scene image updates directly from Supabase website_assets and batch status
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch Supabase website_assets
    SupabaseService
      .fetchWebsiteAssets('preset_template')
      .then((assets) => {
        if (!isMounted || !Array.isArray(assets) || assets.length === 0) return;
        const map: Record<string, string> = {};
        for (const a of assets) {
          if (a.asset_key && a.image_url) {
            map[a.asset_key] = a.image_url;
          }
        }
        setCloudOverrides(map);
      })
      .catch(() => {});

    // 2. Fetch local batch status cache
    fetch('/api/scenes/batch-status')
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted || !data?.success || !data?.status) return;
        setBatchStatusMap(data.status);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort logic: completed batch scenes at the VERY TOP, uncompleted at the bottom!
  const filteredScenes = useMemo(() => {
    let list = SCENES_550_COLLECTION.map((s) => {
      const generatedImg =
        cloudOverrides[s.id] ||
        (batchStatusMap[s.id]?.status === 'completed' && batchStatusMap[s.id]?.imageUrl);

      if (generatedImg) {
        return { ...s, previewImage: generatedImg, isBatchCompleted: true };
      }
      return { ...s, isBatchCompleted: false };
    });

    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === activeCategory);
    }

    if (selectedSun !== 'all') {
      list = list.filter((s) => s.sunDirection === selectedSun);
    }

    if (selectedAtmo !== 'all') {
      list = list.filter((s) => s.atmosphere === selectedAtmo);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.titleEn.toLowerCase().includes(q) ||
          s.titleMm.toLowerCase().includes(q) ||
          s.prompt.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort: Completed Batch Scenes at the VERY TOP, uncompleted ones below!
    list.sort((a: any, b: any) => {
      if (a.isBatchCompleted && !b.isBatchCompleted) return -1;
      if (!a.isBatchCompleted && b.isBatchCompleted) return 1;
      return 0;
    });

    return list;
  }, [activeCategory, selectedSun, selectedAtmo, searchQuery, cloudOverrides, batchStatusMap]);

  const visibleScenes = useMemo(() => {
    return filteredScenes.slice(0, displayCount);
  }, [filteredScenes, displayCount]);

  // Featured top scenes for 3D Floating Showcase in Header
  const topShowcaseScenes = useMemo(() => {
    const completed = filteredScenes.filter((s: any) => s.isBatchCompleted);
    if (completed.length >= 3) {
      return completed.slice(0, 3);
    }
    return filteredScenes.slice(0, 3);
  }, [filteredScenes]);

  // Dynamic 3D Infinite Stream Corridor images from scenes collection
  const streamScenes = useMemo(() => {
    const pool = filteredScenes.length > 0 ? filteredScenes : SCENES_550_COLLECTION;
    const step = Math.max(1, Math.floor(pool.length / 16));
    const picked: { src: string; title: string; badge: string; scene: SceneItem }[] = [];
    for (let i = 0; i < pool.length && picked.length < 16; i += step) {
      const s = pool[i];
      picked.push({
        src: s.previewImage,
        title: s.titleEn,
        badge: s.badge,
        scene: s
      });
    }
    return picked;
  }, [filteredScenes]);

  const inspectedIndex = useMemo(() => {
    if (!inspectedScene) return -1;
    return filteredScenes.findIndex((s) => s.id === inspectedScene.id);
  }, [inspectedScene, filteredScenes]);

  const handlePrevScene = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (inspectedIndex > 0) {
      setInspectedScene(filteredScenes[inspectedIndex - 1]);
    } else if (inspectedIndex === 0) {
      setInspectedScene(filteredScenes[filteredScenes.length - 1]);
    }
  };

  const handleNextScene = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (inspectedIndex >= 0 && inspectedIndex < filteredScenes.length - 1) {
      setInspectedScene(filteredScenes[inspectedIndex + 1]);
    } else if (inspectedIndex === filteredScenes.length - 1) {
      setInspectedScene(filteredScenes[0]);
    }
  };

  // Keyboard navigation for modal lightbox
  useEffect(() => {
    if (!inspectedScene) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (inspectedIndex > 0) setInspectedScene(filteredScenes[inspectedIndex - 1]);
        else if (inspectedIndex === 0) setInspectedScene(filteredScenes[filteredScenes.length - 1]);
      } else if (e.key === 'ArrowRight') {
        if (inspectedIndex >= 0 && inspectedIndex < filteredScenes.length - 1) {
          setInspectedScene(filteredScenes[inspectedIndex + 1]);
        } else if (inspectedIndex === filteredScenes.length - 1) {
          setInspectedScene(filteredScenes[0]);
        }
      } else if (e.key === 'Escape') {
        setInspectedScene(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedScene, inspectedIndex, filteredScenes]);

  const handleCopyPrompt = (scene: SceneItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(scene.prompt);
    setCopiedId(scene.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === scene.id ? null : prev));
    }, 2000);
  };

  const handleDownloadPhoto = async (scene: SceneItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setDownloadingId(scene.id);
      const url = scene.previewImage;
      if (!url) return;

      if (url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `show-ai-${scene.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `show-ai-${scene.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const a = document.createElement('a');
      a.href = scene.previewImage;
      a.download = `show-ai-${scene.id}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const handleDownloadPrompt = (scene: SceneItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const content = `SHOW AI Studio - Burmese Creative Suite 2.0
==================================================
Scene: ${scene.titleEn} (${scene.titleMm || ''})
Category: ${scene.categoryLabelEn || scene.category}
Badge: ${scene.badge}
Sun Direction: ${scene.sunDirectionLabel}
Atmosphere: ${scene.atmosphereLabel}
Lighting TD Notes: ${scene.lightingNotes}

MASTER GENERATION PROMPT:
${scene.prompt}

Tags: ${(scene.tags || []).join(', ')}
==================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `show-ai-${scene.id}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  };

  const handleUseScene = (scene: SceneItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onUseSceneAsBackground) {
      onUseSceneAsBackground(scene);
    } else if (onSendPromptToStudio) {
      onSendPromptToStudio(scene.prompt);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Concept 1: Cinematic Split-Hero with Interactive 3D Floating Scene Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#070b14] border border-emerald-500/35 shadow-2xl">
          {/* Ambient Lighting Orbs */}
          <div
            className="absolute -right-24 -top-24 w-[28rem] h-[28rem] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute right-1/3 top-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Cinematic Typography & Live Counters (7 cols) */}
            <div className="lg:col-span-7">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-5 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>
                  {isMm
                    ? '၇၆၈+ သမိုင်းဝင် ဗိသုကာနှင့် ရုပ်ရှင်အဆင့် ဒစ်ဂျစ်တယ် ရှုခင်းစုံ'
                    : '768+ Archival Heritage & Cinema Digital Plates'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-[1.1]">
                {isMm ? (
                  <>
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                      768+ Master Digital Scenes
                    </span>
                    <br />
                    <span className="text-slate-100">& သမိုင်းဝင် နောက်ခံစုံ</span>
                  </>
                ) : (
                  <>
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                      768+ Master Heritage
                    </span>
                    <br />
                    <span className="text-slate-100">& Cinema Backdrops</span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-2xl">
                {isMm
                  ? 'ပုဂံ၊ မန္တလေးရတနာပုံ၊ မြောက်ဦး ရှေးဟောင်းစေတီများမှ ခေတ်မီ မင်္ဂလာခန်းမနှင့် ဖက်ရှင် စတူဒီယိုများအထိ ၇၆၀ ကျော်သော ရှုခင်းများကို Google Gemini 2.5 Flash 8K Optical Relighting ဖြင့် တိုက်ရိုက် ထုတ်လုပ်ထားပါသည်။'
                  : 'Over 768+ pre-calibrated architectural plates spanning ancient Bagan stupas, Konbaung Royal Palace, Mrauk-U stone corridors, luxury wedding ballrooms, and modern minimalist cycloramas. Calibrated with VLM optical 8K relighting.'}
              </p>

              {/* Live Status Counter Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-2.5 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold shadow flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <strong>{filteredScenes.filter((s: any) => s.isBatchCompleted).length}</strong>
                  <span>{isMm ? 'Gemini 8K အဆင်သင့်' : 'Gemini 8K Ready'}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 font-medium hover:border-slate-600 transition-colors">
                  🏛️ <strong className="text-emerald-400">338+</strong> {isMm ? 'သမိုင်းဝင် နန်းတွင်း' : 'Heritage Sets'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 font-medium hover:border-slate-600 transition-colors">
                  💍 <strong className="text-emerald-400">130+</strong> {isMm ? 'မင်္ဂလာဆောင်' : 'Wedding Sets'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 font-medium hover:border-slate-600 transition-colors">
                  👗 <strong className="text-emerald-400">100+</strong> {isMm ? 'ဖက်ရှင် စတူဒီယို' : 'Fashion Sets'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 font-medium hover:border-slate-600 transition-colors">
                  🌅 <strong className="text-emerald-400">120+</strong> {isMm ? 'ရာသီဥတု လေထု' : 'Atmosphere Sets'}
                </span>
              </div>
            </div>

            {/* Right Column: Dynamic 3D Infinite Stream Corridor */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-emerald-500/20 bg-slate-950/70 p-2 shadow-2xl">
              <div className="absolute top-2 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-emerald-300 border border-emerald-500/40 shadow flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '5s' }} />
                  <span>{isMm ? 'တိုက်ရိုက် စီးဆင်းနေသော 8K Scenes' : 'Live 3D Scene Stream'}</span>
                </span>
              </div>

              <div className="relative w-full h-[260px] sm:h-[300px]">
                <ImageStreamHero
                  images={streamScenes.map((s) => ({
                    src: s.src,
                    title: s.title,
                    badge: s.badge
                  }))}
                  cards={9}
                  speed={20}
                  axis={50}
                  path={{
                    perspective: 26,
                    cardWidth: 20,
                    cardHeight: 28,
                    cardRadius: 0.8,
                    birthHeight: 3,
                    exitHeight: 46,
                    railBirth: -10,
                    railExit: 42,
                    fan: 3.2,
                    turnBirth: 6,
                    turnExit: 28
                  }}
                  className="w-full h-full cursor-pointer"
                  onCardClick={(_, idx) => {
                    const item = streamScenes[idx % streamScenes.length];
                    if (item) setInspectedScene(item.scene);
                  }}
                />
              </div>

              <div className="absolute bottom-2 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] text-zinc-400 bg-black/70 px-2 py-0.5 rounded backdrop-blur font-mono">
                  {isMm ? 'ကတ်ကိုနှိပ်၍ အသေးစိတ်ကြည့်ပါ' : 'Click card to inspect'}
                </span>
                <span className="text-[10px] text-emerald-400 bg-black/70 px-2 py-0.5 rounded backdrop-blur font-bold">
                  768+ Archival Corridor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SCENE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setDisplayCount(36);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{isMm ? cat.labelMm : cat.labelEn}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Advanced Direction Filters */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayCount(36);
            }}
            placeholder={
              isMm
                ? 'ရှုခင်းအမည်၊ ပုဂံ၊ နန်းတော်၊ မင်္ဂလာဆောင်၊ နေဝင်ချိန် ရှာဖွေပါ...'
                : 'Search 550+ scenes by name, Bagan, palace, wedding, sunset, studio...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/60 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Direction & Lighting Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sun Direction */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/60 rounded-xl px-3 py-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={selectedSun}
              onChange={(e) => {
                setSelectedSun(e.target.value);
                setDisplayCount(36);
              }}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                {isMm ? 'အလင်းလမ်းကြောင်း အားလုံး' : 'All Sun Directions'}
              </option>
              <option value="golden_hour" className="bg-slate-900 text-slate-200">
                {isMm ? '🌇 နေဝင်ဆည်းဆာ (Golden Hour)' : '🌇 Golden Hour Sunset'}
              </option>
              <option value="backlight" className="bg-slate-900 text-slate-200">
                {isMm ? '✨ အနောက်အလင်း (Backlight)' : '✨ Backlight Rim'}
              </option>
              <option value="left_rim" className="bg-slate-900 text-slate-200">
                {isMm ? '👈 ဘယ်ဘက် အလင်း (Left 45°)' : '👈 Left 45° Rim'}
              </option>
              <option value="right_rim" className="bg-slate-900 text-slate-200">
                {isMm ? '👉 ညာဘက် အလင်း (Right 45°)' : '👉 Right 45° Rim'}
              </option>
              <option value="overhead" className="bg-slate-900 text-slate-200">
                {isMm ? '☀️ အပေါ်တည့်တည့် (Overhead)' : '☀️ Overhead Studio'}
              </option>
              <option value="ambient" className="bg-slate-900 text-slate-200">
                {isMm ? '🕯️ ပတ်ဝန်းကျင် အလင်း (Ambient)' : '🕯️ 360° Ambient Glow'}
              </option>
            </select>
          </div>

          {/* Atmosphere Mood */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-700/60 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedAtmo}
              onChange={(e) => {
                setSelectedAtmo(e.target.value);
                setDisplayCount(36);
              }}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                {isMm ? 'ခံစားမှု အားလုံး' : 'All Atmospheres'}
              </option>
              <option value="luxury_gilded" className="bg-slate-900 text-slate-200">
                {isMm ? '👑 ရွှေရောင်နန်းတွင်း (Royal Gold)' : '👑 Gilded Royal'}
              </option>
              <option value="warm_golden" className="bg-slate-900 text-slate-200">
                {isMm ? '🌅 နွေးထွေးသော အလင်း (Warm)' : '🌅 Warm Golden'}
              </option>
              <option value="dreamy_mist" className="bg-slate-900 text-slate-200">
                {isMm ? '🌫️ မြူခိုးဆိုင်း အိပ်မက် (Mist)' : '🌫️ Dreamy Mist'}
              </option>
              <option value="dramatic_chiaroscuro" className="bg-slate-900 text-slate-200">
                {isMm ? '🌑 အလင်းအမှောင် ပြင်း (Shadow)' : '🌑 Dramatic Shadow'}
              </option>
              <option value="cool_azure" className="bg-slate-900 text-slate-200">
                {isMm ? '🌊 အပြာရောင် ကြည်လင် (Azure)' : '🌊 Cool Azure'}
              </option>
              <option value="cinematic" className="bg-slate-900 text-slate-200">
                {isMm ? '🎬 ရုပ်ရှင်ဆန်သော (Cinematic)' : '🎬 Cinematic Editorial'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Count Status & Batch Completed Indicator */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span>
            {isMm ? (
              <>
                တွေ့ရှိသော ရှုခင်းပေါင်း <strong className="text-white">{filteredScenes.length}</strong> ခု (ဖော်ပြထားသည်: {visibleScenes.length})
              </>
            ) : (
              <>
                Showing <strong className="text-white">{visibleScenes.length}</strong> of{' '}
                <strong className="text-white">{filteredScenes.length}</strong> scenes found
              </>
            )}
          </span>
        </div>

        {/* Batch Completed Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isMm
                ? `ပြီးစီးပြီးသော ရှုခင်း: ${filteredScenes.filter((s: any) => s.isBatchCompleted).length} ခု (အပေါ်ဆုံးတွင် စီထားပါသည်)`
                : `Batch Ready: ${filteredScenes.filter((s: any) => s.isBatchCompleted).length} scenes (Sorted at Top)`}
            </span>
          </span>
        </div>
      </div>

      {/* Visual Scene Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
        {visibleScenes.map((scene) => {
          const isCopied = copiedId === scene.id;
          const isDownloading = downloadingId === scene.id;
          const isCompleted = (scene as any).isBatchCompleted;

          return (
            <div
              key={scene.id}
              onClick={() => setInspectedScene(scene)}
              className={`group relative aspect-[4/3] rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer bg-slate-950 shadow-lg hover:shadow-2xl hover:shadow-emerald-950/40 ${
                isCompleted
                  ? 'border-emerald-500/50 hover:border-emerald-400'
                  : 'border-slate-800/80 hover:border-slate-600'
              }`}
            >
              {/* Main Full-Bleed Scenery Image */}
              <img
                src={scene.previewImage}
                alt={scene.titleEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                loading="lazy"
              />

              {/* Top-Left Completed Gemini Badge */}
              {isCompleted && (
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/85 backdrop-blur-md text-[10px] font-semibold text-emerald-300 border border-emerald-500/40 shadow flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Gemini 8K</span>
                  </span>
                </div>
              )}

              {/* Clean Bottom Title & Badge Bar (Photo is 100% visible at all times) */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none transition-opacity duration-300">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold text-white truncate drop-shadow-md">
                    {isMm ? scene.titleMm : scene.titleEn}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 shrink-0 font-mono shadow">
                    {scene.badge}
                  </span>
                </div>
              </div>

              {/* Minimal Top-Right Quick Download Icon (Non-intrusive, zero text blocking) */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handleDownloadPhoto(scene, e)}
                  className="p-1.5 rounded-lg bg-black/75 backdrop-blur-md hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700/60 shadow transition-colors cursor-pointer"
                  title={isMm ? 'ဓာတ်ပုံ ဒေါင်းလုဒ်ဆွဲရန်' : 'Download Photo'}
                >
                  <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce text-emerald-400' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleScenes.length < filteredScenes.length && (
        <div className="max-w-7xl mx-auto mt-10 text-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 36)}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all shadow-lg hover:border-emerald-500"
          >
            {isMm
              ? `နောက်ထပ် ရှုခင်း ၃၆ ခု ဖော်ပြရန် (ကျန်ရှိ: ${filteredScenes.length - visibleScenes.length} ခု)`
              : `Load 36 More Scenes (${filteredScenes.length - visibleScenes.length} remaining)`}
          </button>
        </div>
      )}

      {/* Detailed Photo & Prompt Studio Modal (Photo Prompt Studio style) */}
      {inspectedScene && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="relative w-full max-w-5xl bg-[#0c121e] rounded-3xl border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {isMm ? inspectedScene.titleMm : inspectedScene.titleEn}
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono">
                      {inspectedScene.badge}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {inspectedScene.categoryLabelEn} • {inspectedIndex + 1} of {filteredScenes.length} scenes
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Previous & Next scene shortcuts */}
                <button
                  onClick={handlePrevScene}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  title={isMm ? 'ရှေ့ရှုခင်း' : 'Previous Scene'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextScene}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  title={isMm ? 'နောက်ရှုခင်း' : 'Next Scene'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectedScene(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Scrollable Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Full-Resolution Image Display with Quick Overlay */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
                  <img
                    src={inspectedScene.previewImage}
                    alt={inspectedScene.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Corner Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/30 shadow">
                      8K Photoreal UHD
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700/60 shadow">
                      4:3 Architecture Lens
                    </span>
                  </div>

                  {/* Floating Download Photo Button on Image */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={(e) => handleDownloadPhoto(inspectedScene, e)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xl transition-all"
                    >
                      <Download className={`w-3.5 h-3.5 ${downloadingId === inspectedScene.id ? 'animate-bounce' : ''}`} />
                      <span>{isMm ? 'ဓာတ်ပုံ ဒေါင်းလုဒ် (HD)' : 'Download Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* Lighting TD Specs */}
                <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2">
                    <Sun className="w-3.5 h-3.5" />
                    <span>
                      {isMm ? 'VFX အလင်းလမ်းကြောင်းနှင့် အရောင်အပူချိန်' : 'VFX Lighting & Relighting Specifications'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {inspectedScene.lightingNotes}
                  </p>
                </div>
              </div>

              {/* Right Column: Prompt, Specifications & Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  {/* Environment Tags */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 text-slate-200">
                      ☀️ <strong className="text-emerald-400">{inspectedScene.sunDirectionLabel}</strong>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 text-slate-200">
                      ✨ <strong className="text-cyan-400">{inspectedScene.atmosphereLabel}</strong>
                    </div>
                  </div>

                  {/* Master Prompt Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isMm ? 'AI Prompt ဖော်ပြချက်' : 'Master Generation Prompt'}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopyPrompt(inspectedScene, e)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
                          title={isMm ? 'Prompt ကူးယူရန်' : 'Copy Prompt'}
                        >
                          {copiedId === inspectedScene.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{isMm ? 'ကူးယူပြီး' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isMm ? 'Copy' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDownloadPrompt(inspectedScene, e)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                          title={isMm ? 'Prompt စာသား .txt ဒေါင်းလုဒ်' : 'Download Prompt .txt'}
                        >
                          <FileText className="w-3 h-3" />
                          <span>.txt</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed select-all max-h-48 overflow-y-auto border-emerald-500/20 shadow-inner">
                      {inspectedScene.prompt}
                    </div>
                  </div>

                  {/* Architectural Tags */}
                  {inspectedScene.tags && inspectedScene.tags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {isMm ? 'ဗိသုကာနှင့် တည်နေရာ အမှတ်အသားများ' : 'Architectural Tags'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectedScene.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={(e) => handleDownloadPhoto(inspectedScene, e)}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow"
                  >
                    <Download className={`w-4 h-4 text-emerald-400 ${downloadingId === inspectedScene.id ? 'animate-bounce' : ''}`} />
                    <span>{isMm ? 'ဓာတ်ပုံ ဒေါင်းလုဒ်' : 'Download Photo'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleUseScene(inspectedScene, e);
                      setInspectedScene(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <span>{isMm ? 'Photo Studio တွင် သုံးမည်' : 'Use in Photo Studio'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
