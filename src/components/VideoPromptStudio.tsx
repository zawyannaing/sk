import React, { useState, useMemo, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight, 
  Clock, 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  Camera, 
  Film, 
  Sliders, 
  Layers, 
  Wand2, 
  Compass, 
  Eye, 
  Zap,
  Repeat,
  Maximize2,
  Minimize2,
  Tag,
  Code,
  FileText,
  Palette,
  Volume2,
  Sun,
  ShieldAlert,
  Video,
  Loader2,
  Cpu,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CHARACTER_REFERENCE_STYLES } from '../data/characterReferenceStyles';

export type VideoModel = 'Veo' | 'Sora' | 'Kling' | 'Hailuo' | 'Wan' | 'Seedance' | 'Runway-Gen3' | 'Luma-Dream';
export type PromptFormat = 'json' | 'normal';
export type PromptCategory = 'Cinematic' | 'Animation' | 'Product' | 'Character' | 'B-roll' | 'Motion graphic' | 'Stylised';

export type AnimationStyleId = 
  | 'makoto-anime'
  | 'ghibli-watercolor'
  | 'cyberpunk-edgerunners'
  | 'pixar-3d'
  | 'claymation-stopmotion'
  | 'retro-90s-cel'
  | 'unreal-engine-5'
  | 'kinetic-typography';

export type CameraMovementType = 
  | 'dolly-in'
  | 'orbit-360'
  | 'fpv-drone'
  | 'vertigo-zoom'
  | 'crane-jib'
  | 'whip-pan'
  | 'static-lock';

interface VideoPromptStudioProps {
  onBackToMatrix?: () => void;
  onBackToPortal?: () => void;
}

interface CategoryInfo {
  name: PromptCategory;
  desc: string;
  badge?: string;
}

const CATEGORIES: CategoryInfo[] = [
  { name: 'Cinematic', desc: 'Film-grade narrative shots with intentional camera and lighting.' },
  { name: 'Animation', desc: 'Anime, 3D Pixar, stop-motion claymation, and artistic cel animation.', badge: 'NEW' },
  { name: 'Product', desc: 'Crisp commercial macro shots with clean specular highlights and sleek motion.' },
  { name: 'Character', desc: 'Expressive personality and facial acting with authentic costume details.' },
  { name: 'B-roll', desc: 'Atmospheric environmental cutaways and ambient scenic footage.' },
  { name: 'Motion graphic', desc: 'Kinetic typography, fluid abstract geometry, and dynamic physics.' },
  { name: 'Stylised', desc: 'Distinct art styles, vintage celluloid, glitch, or surrealist visuals.' }
];

const VIDEO_MODELS: VideoModel[] = ['Veo', 'Sora', 'Kling', 'Hailuo', 'Wan', 'Seedance', 'Runway-Gen3', 'Luma-Dream'];

const ANIMATION_PRESETS: Array<{
  id: AnimationStyleId;
  label: string;
  sub: string;
  promptSnippet: string;
  color: string;
}> = [
  {
    id: 'makoto-anime',
    label: 'Makoto Shinkai Anime',
    sub: 'Lush clouds, golden lens flare, emotional cel art',
    promptSnippet: 'animated in the signature style of Makoto Shinkai, breathtaking volumetric cloudscapes, luminous golden rim lighting, vibrant sky gradients, detailed hand-painted backgrounds, emotional cinematic anime aesthetic',
    color: '#00d2ff'
  },
  {
    id: 'ghibli-watercolor',
    label: 'Studio Ghibli Watercolor',
    sub: 'Nostalgic hand-drawn, soft gouache textures',
    promptSnippet: 'Studio Ghibli hand-drawn watercolor aesthetic, lush countryside greenery, tactile gouache textures, gentle wind ripples, whimsical warm nostalgia, Hayao Miyazaki filmic cadence',
    color: '#10b981'
  },
  {
    id: 'cyberpunk-edgerunners',
    label: 'Cyberpunk 2D Kinetic',
    sub: 'High-octane trigger animation, neon speed trails',
    promptSnippet: 'Studio Trigger Cyberpunk 2088 cel animation, high-contrast dynamic action lines, neon cyan and magenta speed trails, stylized impact frames, aggressive kinetic camera choreography',
    color: '#f43f5e'
  },
  {
    id: 'pixar-3d',
    label: 'Pixar / Disney 3D',
    sub: 'Tactile stylized 3D, subsurface scattering',
    promptSnippet: 'Pixar-quality stylized 3D character animation, warm subsurface scattering, tactile felt and cloth micro-textures, expressive facial squash-and-stretch, Pixar RenderMan illumination',
    color: '#fbbf24'
  },
  {
    id: 'claymation-stopmotion',
    label: 'Claymation Stop-Motion',
    sub: 'Tactile clay, subtle thumbprints, 12fps stepped',
    promptSnippet: 'authentic Aardman stop-motion claymation, tangible plasticine clay textures with visible gentle thumbprints, tactile 12fps stepped motion timing, warm physical miniature studio lighting',
    color: '#fb923c'
  },
  {
    id: 'retro-90s-cel',
    label: 'Retro 90s Cel Anime',
    sub: 'Cowboy Bebop VHS grit, hand-inked acetate',
    promptSnippet: 'classic 1990s retro anime cel animation on physical acetate sheets, subtle analog VHS tape scanlines, warm film grain, hand-inked outlines, Neo-Tokyo jazz noir aesthetic',
    color: '#a855f7'
  },
  {
    id: 'unreal-engine-5',
    label: 'Unreal Engine 5.5',
    sub: 'Lumen real-time GI, Nanite hyper-realism',
    promptSnippet: 'rendered in Unreal Engine 5.5 real-time cinematic, Lumen global illumination, volumetric dust particles, photorealistic physical shading, 4K digital cinema master',
    color: '#38bdf8'
  },
  {
    id: 'kinetic-typography',
    label: 'Kinetic Liquid Motion',
    sub: 'Fluid procedural geometry, morphing loops',
    promptSnippet: 'dynamic kinetic motion graphics, fluid liquid mercury ribbons weaving through volumetric space, seamless physics simulation, clean editorial lighting',
    color: '#ec4899'
  }
];

const CAMERA_MOTIONS: Array<{
  id: CameraMovementType;
  label: string;
  tagline: string;
  icon: string;
  promptSnippet: string;
}> = [
  {
    id: 'dolly-in',
    label: 'Slow Dolly-In',
    tagline: 'Smooth push toward subject',
    icon: 'zoom_in',
    promptSnippet: 'slow deliberate dolly-in pushing forward toward the subject along a stable center axis'
  },
  {
    id: 'orbit-360',
    label: '360° Orbital Pan',
    tagline: 'Continuous smooth rotational wrap',
    icon: '360',
    promptSnippet: 'smooth continuous 360-degree orbital camera rotation circling around the focal point'
  },
  {
    id: 'fpv-drone',
    label: 'FPV Drone Swoop',
    tagline: 'High-speed banking dive and skim',
    icon: 'flight',
    promptSnippet: 'dynamic high-speed FPV drone dive banking sharply through the environment with aggressive kinetic tilt'
  },
  {
    id: 'vertigo-zoom',
    label: 'Vertigo Dolly-Zoom',
    tagline: 'Hitchcock background expansion',
    icon: 'aspect_ratio',
    promptSnippet: 'dramatic Vertigo effect (contra-zoom), camera dollying backward while zooming in to morph background perspective'
  },
  {
    id: 'crane-jib',
    label: 'Crane Jib Rise',
    tagline: 'Vertical elevation revealing scale',
    icon: 'vertical_align_top',
    promptSnippet: 'smooth crane jib rising vertically from ground level to high-angle reveal of the expansive scene'
  },
  {
    id: 'whip-pan',
    label: 'Whip Pan Transition',
    tagline: 'Rapid horizontal motion blur snap',
    icon: 'compare_arrows',
    promptSnippet: 'fast kinetic whip-pan snapping horizontally with motion blur before locking onto target'
  },
  {
    id: 'static-lock',
    label: 'Cinematic Lock-Off',
    tagline: 'Tripod stability letting action move',
    icon: 'videocam',
    promptSnippet: 'rock-solid tripod lock-off frame allowing subject and atmospheric elements to move within the static composition'
  }
];

export const VideoPromptStudio: React.FC<VideoPromptStudioProps> = ({
  onBackToMatrix,
  onBackToPortal
}) => {
  const [inputText, setInputText] = useState('');
  const [format, setFormat] = useState<PromptFormat>('json');
  const [selectedModel, setSelectedModel] = useState<VideoModel>('Veo');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('Cinematic');
  const [selectedAnimationStyle, setSelectedAnimationStyle] = useState<AnimationStyleId | null>(null);
  const [selectedCameraMotion, setSelectedCameraMotion] = useState<CameraMovementType>('dolly-in');
  const [motionSpeed, setMotionSpeed] = useState<'slow' | 'natural' | 'kinetic'>('natural');
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [framerate, setFramerate] = useState<'24fps' | '12fps' | '60fps'>('24fps');

  // Animation simulator state
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(true);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultTab, setResultTab] = useState<'tags' | 'cinematic' | 'json' | 'specs'>('tags');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Processing & Typing animation states
  const [procStep, setProcStep] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [recentPrompts, setRecentPrompts] = useState<string[]>([
    'a Tokyo street in the rain, neon reflections...',
    'cyberpunk courier navigating a foggy night alleyway on a hoverbike'
  ]);

  // Result state
  const [resultPrompt, setResultPrompt] = useState<any>({
    subject: "wet alley cat, sleek black fur, luminous green eyes",
    action: "sits on curb, shakes water from whiskers, watches neon reflections",
    scene: {
      setting: "narrow urban alley with puddles, graffiti walls, flickering neon signs",
      time_of_day: "blue hour",
      atmosphere: "steady rain, light mist rising from warm pavement"
    },
    shot: {
      type: "medium close-up",
      angle: "low angle",
      lens: "85mm short telephoto",
      framing: "cat centered lower-third, reflections filling upper frame"
    },
    camera: {
      movement: "slow dolly-in toward cat over puddles",
      speed: "slow and deliberate",
      framerate: "24fps"
    },
    animation_style: {
      applied: false,
      look: "natural cinematic photorealism"
    },
    lighting: {
      key: "single cool neon above-left, soft rim from street lamp behind",
      mood: "melancholic, intimate",
      color_temperature: "cool blue with warm amber rim highlights"
    },
    color_palette: [
      "neon cyan",
      "rusted brick amber",
      "oil-slick black"
    ],
    style: {
      look: "cinematic nocturnal, shallow depth, naturalistic rain catch",
      references: [
        "Blade Runner 2049"
      ],
      grain: "fine 35mm film grain"
    },
    duration_seconds: 6,
    aspect_ratio: "16:9",
    loop: false,
    negative_prompt: "cartoonish,overexposed,lowres,multiple animals,daylight,glossy plastic,text,faces distorted"
  });

  const [normalTextResult, setNormalTextResult] = useState<string>(
    "Cinematic video capture of the subject moving with intentional physical momentum toward camera. Shot on 85mm prime lens executing a slow deliberate dolly-in. Twilight hour volumetric atmosphere, illuminated by warm key lighting and contrasting cool rim separation. Natural cinematic 24fps motion blur with fine organic 35mm film grain. Optimized for video generation. Duration 6 seconds, 16:9. Avoid: jitter, plastic skin, distorted anatomy, cartoon proportions, flat lighting."
  );

  const activeCategoryObj = CATEGORIES.find(c => c.name === selectedCategory) || CATEGORIES[0];
  const activeMotionObj = CAMERA_MOTIONS.find(m => m.id === selectedCameraMotion) || CAMERA_MOTIONS[0];
  const activeAnimationObj = ANIMATION_PRESETS.find(a => a.id === selectedAnimationStyle);

  // Rotate processing animation steps while isGenerating is true
  useEffect(() => {
    if (!isGenerating) {
      setProcStep(0);
      return;
    }
    const interval = setInterval(() => {
      setProcStep(prev => (prev + 1) % 4);
    }, 750);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Smooth typing effect streamer when normalTextResult changes
  useEffect(() => {
    if (!normalTextResult || isGenerating) {
      setDisplayedText('');
      return;
    }
    setIsTyping(true);
    let idx = 0;
    const full = normalTextResult;
    setDisplayedText('');

    const interval = setInterval(() => {
      idx += Math.floor(Math.random() * 4) + 3;
      if (idx >= full.length) {
        setDisplayedText(full);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedText(full.slice(0, idx));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [normalTextResult, isGenerating]);

  const processingStepText = [
    `Deconstructing "${inputText.slice(0, 26) || 'Brief'}..." & kinetic physics`,
    `Synthesizing 3D ${activeMotionObj.label} path at ${framerate}`,
    `Calibrating ${selectedAnimationStyle ? activeAnimationObj?.label : 'Cinematic Volumetrics'} & color grade`,
    `Finalizing Hollywood negative filters & camera parameters for ${selectedModel}`
  ][procStep];

  const handleCopyTag = (tagName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(tagName);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  const resultTags = useMemo(() => {
    if (typeof resultPrompt === 'object' && resultPrompt !== null) {
      return {
        subject: resultPrompt.subject || inputText || 'Main Subject Character',
        action: resultPrompt.action || 'moves with intentional physical momentum toward camera',
        setting: resultPrompt.scene?.setting || 'atmospheric environmental scene',
        lighting: resultPrompt.lighting?.key || resultPrompt.lighting?.mood || 'directional key with cool rim separation',
        camera: resultPrompt.camera?.movement || activeMotionObj.label,
        lens: resultPrompt.shot?.lens || '35mm anamorphic prime',
        framerate: resultPrompt.camera?.framerate || framerate,
        speed: resultPrompt.camera?.speed || motionSpeed,
        palette: Array.isArray(resultPrompt.color_palette) ? resultPrompt.color_palette : ['teal & amber', 'film noir', 'neon cyan'],
        animation: resultPrompt.animation_style?.name || (activeAnimationObj ? activeAnimationObj.label : 'Cinematic Realism'),
        negative: resultPrompt.negative_prompt || 'handheld jitter, plastic skin, low resolution, warped anatomy',
        sound: resultPrompt.sound || 'distant environmental ambiance, organic foley'
      };
    }
    return {
      subject: inputText || 'Main Subject Character',
      action: 'moves with intentional physical momentum toward camera',
      setting: 'deep volumetric depth and authentic physical textures',
      lighting: 'directional tungsten key and cool rim separation',
      camera: activeMotionObj.label,
      lens: '35mm anamorphic prime',
      framerate: framerate,
      speed: motionSpeed,
      palette: ['teal & amber', 'film noir', 'neon cyan'],
      animation: activeAnimationObj ? activeAnimationObj.label : 'Cinematic Realism',
      negative: 'handheld jitter, plastic skin, low resolution, warped anatomy',
      sound: 'rich atmospheric soundscape, Foley textures'
    };
  }, [resultPrompt, inputText, activeMotionObj, activeAnimationObj, framerate, motionSpeed]);

  // Generate Prompt handler with Animation & Camera awareness
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setShowResult(true);
    setDisplayedText('');

    const animationInstruction = selectedAnimationStyle && activeAnimationObj
      ? activeAnimationObj.promptSnippet
      : '';

    const cameraInstruction = `${activeMotionObj.promptSnippet}, paced at ${motionSpeed} speed, recorded at ${framerate}${isLooping ? ', seamlessly looping seamlessly back to first frame' : ''}`;

    try {
      const res = await fetch('/api/generate-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          model: selectedModel,
          category: selectedCategory,
          format: format,
          sectionOptions: {
            animation_style: animationInstruction || undefined,
            camera_movement: cameraInstruction,
            motion_speed: motionSpeed,
            framerate,
            loop: isLooping
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.format === 'json' && data.resultJson) {
          setResultPrompt(data.resultJson);
          const j = data.resultJson;
          const prose = `${j.subject}, ${j.action}. ${j.scene?.setting ? `${j.scene.setting}, ${j.scene.time_of_day || ''}, ${j.scene.atmosphere || ''}.` : ''} Shot on ${j.shot?.lens || '35mm anamorphic'} lens, ${j.camera?.movement || ''} at ${j.camera?.speed || 'natural'} speed. ${j.lighting?.key || ''}, ${j.lighting?.mood || ''}. ${j.style?.look || ''}. Avoid: ${j.negative_prompt || 'low quality, jitter'}`;
          setNormalTextResult(prose);
        } else if (data.resultText) {
          setNormalTextResult(data.resultText);
          try {
            const parsed = JSON.parse(data.resultText);
            setResultPrompt(parsed);
          } catch {
            generateLocalFallback();
          }
        }
      } else {
        generateLocalFallback();
      }
    } catch {
      generateLocalFallback();
    } finally {
      setIsGenerating(false);
      setShowResult(true);
      setShowResultPopup(true);
      if (!recentPrompts.includes(inputText)) {
        setRecentPrompts(prev => [inputText, ...prev.slice(0, 4)]);
      }
    }
  };

  const generateLocalFallback = () => {
    const raw = inputText.trim() || 'Cinematic Subject';
    const animPart = activeAnimationObj ? `, ${activeAnimationObj.promptSnippet}` : '';
    const camPart = activeMotionObj.promptSnippet;

    const fallbackObj = {
      subject: `${raw}, crafted with high physical presence and authentic material texture`,
      action: `moves with natural cadence and intentional physical momentum toward camera`,
      scene: {
        setting: `environmental setting crafted around ${raw}`,
        time_of_day: "golden hour twilight",
        atmosphere: "volumetric airborne mist, subtle lens flare, deep cinematic depth"
      },
      shot: {
        type: "cinematic medium close-up",
        angle: "eye-level 15-degree low angle",
        lens: "35mm anamorphic prime lens",
        framing: "rule-of-thirds composition with balanced negative space"
      },
      camera: {
        movement: camPart,
        speed: motionSpeed,
        framerate: framerate
      },
      animation_style: selectedAnimationStyle ? {
        style_id: selectedAnimationStyle,
        name: activeAnimationObj?.label,
        details: activeAnimationObj?.promptSnippet
      } : undefined,
      lighting: {
        key: "directional soft key with rich rim highlight",
        mood: "atmospheric, highly aesthetic",
        color_temperature: "warm golden highlights balanced with deep teal shadows"
      },
      color_palette: ["vibrant gold", "midnight teal", "deep obsidian"],
      style: {
        look: `High-end video production optimized for ${selectedModel}${animPart}`,
        references: ["Hollywood Director of Photography Grade"],
        grain: "fine organic 35mm film grain"
      },
      duration_seconds: 6,
      aspect_ratio: "16:9",
      loop: isLooping,
      negative_prompt: "low resolution, jitter, flickering, warped anatomy, plastic gloss, cartoon artifacts"
    };

    setResultPrompt(fallbackObj);

    const lower = raw.toLowerCase();
    if (lower.includes("monkey king") || lower.includes("sun wukong") || lower.includes("wukong")) {
      setNormalTextResult(
        `Sun Wukong, the Monkey King, vaults from a jagged cliff edge toward camera, staff spinning like a bronze comet; close-three-quarter, 85mm dolly-in that tightens as his hair and cloud-silk banner snap rearward. Ancient mountain temple and shifting cloud-sea recede behind him, wet black stone etched with gold calligraphy, distant prayer flags flicking; late-afternoon tungsten key from frame-left slices warm amber across his lacquered iron headband and scarred jade eyes, cool blue rim light from a high north cloud-bank separates him from mist. Costume is layered: worn red battle-robe with embroidered cranes, brass-knuckle gauntlets, and a telescoping gold-banded staff catching specular highlights. Camera eases in while a sub-frame 35mm anamorphic squeeze gives slight horizontal bloom on highlights; add subtle 35mm film grain, muted teal, oxidized gold, and storm-grey palette. Motion: a faint wind-driven motion blur on fingertips, staff trail left a brief phosphor afterglow. Sound: distant thunder, bamboo flute motif, leather-swipe of staff. Duration 6s, 16:9, high dynamic range, modest film grain. Avoid: handheld jitter, plastic skin, over-saturation, busy background clutter, anachronistic tech, flat frontal lighting.`
      );
    } else {
      setNormalTextResult(
        `${raw}, captured in feature-film caliber execution, moving with intentional cadence and physical momentum toward camera; medium close-up, ${camPart} with ${motionSpeed} pacing at ${framerate}. Environmental set design with deep volumetric depth and authentic physical textures; illuminated by directional key and cool rim separation. Sub-frame 35mm anamorphic optics with subtle horizontal bloom on highlights, fine organic 35mm film grain, and rich Hollywood color grading${animPart}. Motion: authentic wind-driven motion blur, fine particle drift, and natural physics. Duration 6s, 16:9, high dynamic range${isLooping ? ', seamlessly looping' : ''}. Avoid: handheld jitter, plastic skin, low resolution, warped anatomy, cartoon proportions, over-saturation, flat frontal lighting.`
      );
    }
  };

  const getCopyableText = () => {
    if (format === 'json') {
      return typeof resultPrompt === 'object' ? JSON.stringify(resultPrompt, null, 2) : resultPrompt;
    }
    return normalTextResult;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCopyableText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 relative overflow-hidden font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* 🌟 ANIMATED BACKGROUND GRID & DRIFTING GLOW PARTICLES */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.09]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #384252 1px, transparent 1px),
            linear-gradient(to bottom, #384252 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Animated Ambient Blobs */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15],
          x: [0, 20, 0],
          y: [0, -15, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-[#ccff00]/15 via-[#00d2ff]/10 to-transparent blur-[130px] pointer-events-none rounded-full" 
      />

      {/* 🌟 TOP NAVBAR HEADER */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-zinc-900/90 bg-[#07080b]/80 backdrop-blur-md">
        
        {/* Left: 3 Sections Back Navigation & Title */}
        <div className="flex items-center gap-3">
          {onBackToPortal && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer mr-1 shadow-2xs"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>3 Sections</span>
            </motion.button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />
              Video Prompt Studio
            </span>
            <span className="text-[10px] bg-zinc-800 text-[#ccff00] font-mono px-2 py-0.5 rounded-full border border-zinc-700/60 hidden sm:inline font-bold">
              ANIMATION &amp; 3D ENGINE
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Try Prompts */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Motion Simulator Quick Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => setShowSimModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-[#ccff00]" />
            <span className="hidden sm:inline">Motion Simulator</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/60 text-[#ccff00]">3D</span>
          </motion.button>

        </div>
      </header>

      {/* 🌟 MAIN HERO & WORKBENCH */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 mb-4 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
          <span className="text-[12px] font-semibold tracking-tight">
            Animated Physics • Sora, Veo &amp; Kling Ready
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-normal text-center tracking-tight text-white mb-2"
        >
          Write video prompts
          <br />
          <span className="font-extrabold bg-gradient-to-r from-white via-zinc-200 to-[#ccff00] bg-clip-text text-transparent">
            that actually animate.
          </span>
        </motion.h1>

        <p className="text-xs sm:text-sm text-zinc-400 text-center max-w-xl mb-7">
          Full cinematic camera physics, anime cel timing, 3D Pixar rendering, and motion dynamics for any AI video model.
        </p>

        {/* 🌟 STUDIO WORKSPACE GRID */}
        <div className={`w-full transition-all duration-300 grid gap-6 ${showResult ? 'lg:grid-cols-2' : 'max-w-2xl'}`}>

          {/* LEFT: Input Brief & Animation Controls Card */}
          <motion.div 
            layout
            className="bg-[#101217] border border-zinc-800/90 rounded-2xl shadow-2xl p-5 flex flex-col justify-between min-h-[420px] relative overflow-hidden"
          >
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-zinc-800/70 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400 font-semibold text-xs">Brief</span>

                {/* Recent Prompts */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono tracking-wider transition cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-zinc-500" />
                    RECENT · {recentPrompts.length}
                  </button>
                  {showRecentDropdown && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#181a22] border border-zinc-700/80 rounded-xl shadow-xl p-2 z-30">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1">Recent Inputs</div>
                      {recentPrompts.map((rp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInputText(rp);
                            setShowRecentDropdown(false);
                          }}
                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 truncate cursor-pointer"
                        >
                          {rp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Model Selector */}
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as VideoModel)}
                    className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono uppercase px-3 py-1 pr-6 rounded-full cursor-pointer hover:border-zinc-700 focus:outline-none"
                  >
                    {VIDEO_MODELS.map(m => (
                      <option key={m} value={m}>FOR · {m.toUpperCase()}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px]">
                    ▼
                  </span>
                </div>

                {/* Format Toggle [ JSON | NORMAL ] */}
                <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-full p-0.5">
                  <button
                    type="button"
                    onClick={() => setFormat('json')}
                    className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-medium transition cursor-pointer ${
                      format === 'json'
                        ? 'bg-zinc-200 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('normal')}
                    className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-medium transition cursor-pointer ${
                      format === 'normal'
                        ? 'bg-zinc-200 text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    NORMAL
                  </button>
                </div>
              </div>

              {/* Character Counter */}
              <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                {inputText.length} / 1200
              </span>
            </div>

            {/* Input Textarea Area */}
            <div className="my-3 flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your video idea (e.g. a rainy neon street with a black cat, an anime sky with soaring birds, or a hypercar drift)..."
                rows={4}
                className="w-full bg-transparent border-0 text-zinc-200 placeholder-zinc-600 focus:ring-0 focus:outline-none text-sm sm:text-base resize-none leading-relaxed font-sans"
              />
            </div>

            {/* 🌟 NEW: ANIMATION & CAMERA MOTION STUDIO ACCORDION / STRIP */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/60 bg-[#0d0e13]/60 -mx-5 px-5 pb-3">
              
              {/* Category Pills */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          active
                            ? 'bg-[#ccff00] text-black font-bold shadow-[0_0_12px_rgba(204,255,0,0.3)] scale-102'
                            : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {cat.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded-full bg-black text-[#ccff00] font-mono">
                            {cat.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Animation Styles Carousel (Visible when category is Animation or Stylised or clicked) */}
              {(selectedCategory === 'Animation' || selectedCategory === 'Stylised') && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1 text-[#ccff00]">
                      <Wand2 className="w-3 h-3" />
                      ANIMATION ENGINE STYLES (Pick to inject aesthetic):
                    </span>
                    {selectedAnimationStyle && (
                      <button
                        type="button"
                        onClick={() => setSelectedAnimationStyle(null)}
                        className="text-zinc-500 hover:text-zinc-300 text-[10px] underline cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ANIMATION_PRESETS.map((anim) => {
                      const isSelected = selectedAnimationStyle === anim.id;
                      return (
                        <button
                          key={anim.id}
                          type="button"
                          onClick={() => setSelectedAnimationStyle(isSelected ? null : anim.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-zinc-900 border-[#ccff00] ring-2 ring-[#ccff00]/30 shadow-xs'
                              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: anim.color }}
                            />
                            {isSelected && <span className="text-[#ccff00] text-[10px]">✓</span>}
                          </div>
                          <span className="text-[11px] font-bold text-zinc-200 block truncate mt-1">
                            {anim.label}
                          </span>
                          <span className="text-[9px] text-zinc-500 truncate block">
                            {anim.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Camera Motion Selector & Controls Strip */}
              <div className="pt-2 border-t border-zinc-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                
                {/* Camera Movement Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#ccff00]" />
                    CAMERA:
                  </span>
                  <select
                    value={selectedCameraMotion}
                    onChange={(e) => setSelectedCameraMotion(e.target.value as CameraMovementType)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg cursor-pointer hover:border-zinc-700 focus:outline-none"
                  >
                    {CAMERA_MOTIONS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Motion Speed & Loop Toggles */}
                <div className="flex items-center gap-2">
                  
                  {/* Speed */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    {(['slow', 'natural', 'kinetic'] as const).map(spd => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setMotionSpeed(spd)}
                        className={`px-2 py-0.5 rounded capitalize transition cursor-pointer ${
                          motionSpeed === spd
                            ? 'bg-zinc-200 text-black font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>

                  {/* Framerate */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    {(['24fps', '12fps', '60fps'] as const).map(fps => (
                      <button
                        key={fps}
                        type="button"
                        onClick={() => setFramerate(fps)}
                        className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                          framerate === fps
                            ? 'bg-[#ccff00] text-black font-bold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title={fps === '12fps' ? '12fps Anime / Stop-motion stepped timing' : `${fps} rate`}
                      >
                        {fps}
                      </button>
                    ))}
                  </div>

                  {/* Seamless Loop Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono cursor-pointer transition ${
                      isLooping
                        ? 'bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/40 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                    title="Generate as seamless looping video"
                  >
                    <Repeat className="w-3 h-3" />
                    <span>Loop</span>
                  </button>

                </div>

              </div>

            </div>

            {/* Bottom Generate Bar */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-zinc-400 font-medium">
                  {activeCategoryObj.desc}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Optics: {activeMotionObj.label} • {motionSpeed} speed • {framerate}
                </span>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`h-11 px-5 rounded-full flex items-center justify-center gap-2 font-bold text-xs shrink-0 transition-all ${
                  isGenerating
                    ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                    : 'bg-[#ccff00] text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] cursor-pointer'
                }`}
                title="Synthesize Animated Video Prompt"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Prompt</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

          </motion.div>

          {/* RIGHT: Detailed Prompt Result Card (Beside Editor) */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.96, x: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#101217] border border-zinc-800/90 rounded-2xl shadow-2xl p-5 flex flex-col justify-between min-h-[520px] relative"
              >
                
                {/* Result Header */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest text-[#ccff00] font-bold font-mono">
                          SYNTHESIZED VIDEO PROMPT
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-base font-bold text-white">
                          Optimized for <span className="text-[#ccff00]">{selectedModel}</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          {format.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Expand to Popup Screen Button */}
                      <button
                        type="button"
                        onClick={() => setShowResultPopup(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#ccff00]/10 hover:bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30 text-xs font-semibold transition cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                        title="Open in Animated Popup Screen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Popup Screen</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-medium transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Regenerate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowResult(false)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-full hover:bg-zinc-800/50 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Beside Tabs / Tags Switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090a0e] border border-zinc-800/80 my-3">
                    {[
                      { id: 'tags', label: '🏷️ Visual Tags' },
                      { id: 'cinematic', label: '🎬 Cinematic Prose' },
                      { id: 'json', label: '📋 JSON Schema' },
                      { id: 'specs', label: '🎥 Camera Specs' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setResultTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                          resultTab === tab.id
                            ? 'bg-zinc-800 text-[#ccff00] font-bold border border-zinc-700/80 shadow-xs'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                        }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Motion Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-[#ccff00] border border-zinc-800 flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      {activeMotionObj.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {framerate}
                    </span>
                    {selectedAnimationStyle && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
                        {activeAnimationObj?.label}
                      </span>
                    )}
                    {isLooping && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Seamless Loop
                      </span>
                    )}
                  </div>

                  {/* Beside Tab Content */}
                  <div className="min-h-[280px]">
                    {isGenerating ? (
                      <div className="py-14 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
                        {/* Futuristic Radar Aperture */}
                        <div className="relative w-22 h-22 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-[#ccff00]/40"
                          />
                          <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 rounded-full border-2 border-t-[#00d2ff] border-r-transparent border-b-[#ccff00] border-l-transparent"
                          />
                          <motion.div
                            animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ccff00]/25 via-[#00d2ff]/20 to-purple-500/25 border border-[#ccff00] flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.35)]"
                          >
                            <Sparkles className="w-5 h-5 text-[#ccff00] animate-spin" />
                          </motion.div>
                        </div>

                        {/* Status Readout */}
                        <div className="space-y-1.5 max-w-sm">
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                            <span className="text-[10px] uppercase font-mono tracking-widest text-[#ccff00] font-bold">
                              SYNTHESIZING PROMPT • {selectedModel.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white tracking-tight">
                            {processingStepText}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            Calibrating {activeMotionObj.label} • {framerate} • Hollywood Color Grading
                          </p>
                        </div>

                        {/* Shimmering Progress Bar */}
                        <div className="w-full max-w-xs h-1.5 rounded-full bg-zinc-800/90 overflow-hidden relative">
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#ccff00] to-transparent"
                          />
                        </div>

                        {/* Step Badges */}
                        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 pt-1">
                          <span className={procStep >= 0 ? "text-[#ccff00] font-bold" : ""}>1. Physics</span>
                          <span>→</span>
                          <span className={procStep >= 1 ? "text-[#ccff00] font-bold" : ""}>2. 3D Path</span>
                          <span>→</span>
                          <span className={procStep >= 2 ? "text-[#ccff00] font-bold" : ""}>3. Lighting</span>
                          <span>→</span>
                          <span className={procStep >= 3 ? "text-[#ccff00] font-bold" : ""}>4. Filters</span>
                        </div>
                      </div>
                    ) : (
                      <div className="max-h-[340px] overflow-y-auto pr-1 text-xs font-mono leading-relaxed text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-800">
                        {/* TAB 1: Visual Tags Breakdown */}
                        {resultTab === 'tags' && (
                          <div className="space-y-2.5">
                            {/* Subject Tag */}
                            <div className="p-3 rounded-xl bg-[#090b10] border border-zinc-800/80 hover:border-zinc-700 transition">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono text-[#ccff00] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>👤</span> Subject &amp; Action
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTag('subject', `${resultTags.subject}. ${resultTags.action}`)}
                                  className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedTag === 'subject' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedTag === 'subject' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="text-zinc-200 text-xs font-sans leading-relaxed">
                                <strong className="text-white">{resultTags.subject}</strong> — {resultTags.action}
                              </p>
                            </div>

                            {/* Camera & Optics Tag */}
                            <div className="p-3 rounded-xl bg-[#090b10] border border-zinc-800/80 hover:border-zinc-700 transition">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>🎥</span> Camera Physics &amp; Lens
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTag('camera', `${resultTags.camera}, ${resultTags.lens}, ${resultTags.speed} speed @ ${resultTags.framerate}`)}
                                  className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedTag === 'camera' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedTag === 'camera' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                                {resultTags.camera} • {resultTags.lens} • {resultTags.speed} motion curve at {resultTags.framerate}
                              </p>
                            </div>

                            {/* Lighting & Atmosphere Tag */}
                            <div className="p-3 rounded-xl bg-[#090b10] border border-zinc-800/80 hover:border-zinc-700 transition">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>💡</span> Lighting &amp; Volumetrics
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyTag('lighting', `${resultTags.lighting}, ${resultTags.setting}`)}
                                  className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedTag === 'lighting' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedTag === 'lighting' ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                                {resultTags.lighting} in {resultTags.setting}
                              </p>
                            </div>

                            {/* Color Palette Tag */}
                            <div className="p-3 rounded-xl bg-[#090b10] border border-zinc-800/80 hover:border-zinc-700 transition">
                              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                                <span>🎨</span> Hollywood Color Grade
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {resultTags.palette.map((color: string, i: number) => (
                                  <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-800/90 text-zinc-200 border border-zinc-700 text-[11px] font-mono flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-amber-400' : 'bg-purple-400'}`} />
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Animation & Style Tag */}
                            <div className="p-3 rounded-xl bg-[#090b10] border border-zinc-800/80 hover:border-zinc-700 transition">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span>✨</span> Animation Style &amp; Texture
                                </span>
                              </div>
                              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                                {resultTags.animation}
                              </p>
                            </div>

                            {/* Negative Filter Tag */}
                            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                              <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-1">
                                <span>🚫</span> Avoid &amp; Negative Constraints
                              </span>
                              <p className="text-red-300/80 text-[11px] font-mono">
                                {resultTags.negative}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* TAB 2: Cinematic Prose with Typing Streamer */}
                        {resultTab === 'cinematic' && (
                          <div className="p-4 rounded-xl bg-[#08090c] border border-zinc-800/70 text-zinc-200 text-xs leading-relaxed font-sans select-all relative group">
                            {isTyping && (
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 font-mono text-[10px] text-[#ccff00]">
                                <span className="flex items-center gap-1.5 animate-pulse font-bold">
                                  <Sparkles className="w-3 h-3" />
                                  <span>AI Typing Streamer in Progress...</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => { setDisplayedText(normalTextResult); setIsTyping(false); }}
                                  className="text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer text-[10px]"
                                >
                                  Skip ⏩
                                </button>
                              </div>
                            )}
                            <div className="whitespace-pre-wrap leading-relaxed font-sans text-zinc-100">
                              {isTyping ? displayedText : normalTextResult}
                              {isTyping && (
                                <span className="inline-block w-1.5 h-3.5 bg-[#ccff00] ml-1 animate-pulse align-middle" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 3: JSON Schema */}
                        {resultTab === 'json' && (
                          <pre className="p-3.5 rounded-xl bg-[#08090c] border border-zinc-800/70 overflow-x-auto text-emerald-400/90 whitespace-pre-wrap">
                            <code>
                              {typeof resultPrompt === 'object'
                                ? JSON.stringify(resultPrompt, null, 2)
                                : resultPrompt}
                            </code>
                          </pre>
                        )}

                        {/* TAB 4: Camera Specs */}
                        {resultTab === 'specs' && (
                          <div className="p-4 rounded-xl bg-[#08090c] border border-zinc-800/70 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-mono block">MOTION TRAJECTORY</span>
                                <span className="text-white font-bold">{activeMotionObj.label}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-mono block">CADENCE &amp; FPS</span>
                                <span className="text-[#ccff00] font-bold">{framerate} Natural Film</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-mono block">LENS SELECTION</span>
                                <span className="text-white font-bold">{resultTags.lens}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                                <span className="text-[10px] text-zinc-500 font-mono block">ASPECT &amp; TIME</span>
                                <span className="text-white font-bold">16:9 • 6 Seconds</span>
                              </div>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                              {activeMotionObj.promptSnippet}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Copy & Simulator Button */}
                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSimModal(true)}
                      className="flex items-center gap-1.5 text-xs text-[#ccff00] font-semibold hover:underline cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch Motion Sim</span>
                    </button>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={() => setShowResultPopup(true)}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer font-mono"
                    >
                      Expand Popup ↗
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#ccff00]" />
                          <span className="text-[#ccff00]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Prompt
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCopy();
                        window.open('https://higgsfield.ai', '_blank');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ccff00] text-black font-semibold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition text-xs cursor-pointer"
                    >
                      Open in Higgsfield
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 🌟 ANIMATED POPUP SCREEN MODAL (Full Cinema View with Tabs & Motion HUD) */}
        <AnimatePresence>
          {showResultPopup && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
              <motion.div 
                initial={{ scale: 0.92, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 30 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="bg-[#0c0e14] border-2 border-[#ccff00]/40 shadow-[0_0_80px_rgba(204,255,0,0.22)] rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col relative z-50"
              >
                {/* Popup Header */}
                <div className="px-5 py-4 border-b border-zinc-800/90 bg-[#07090c] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#ccff00]/15 border border-[#ccff00]/40 flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                      <Sparkles className="w-4 h-4 text-[#ccff00]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                          Synthesized Video Prompt Studio
                        </h2>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/40">
                          {selectedModel.toUpperCase()} READY
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Animation &amp; Camera Physics • {activeMotionObj.label} • {framerate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowResultPopup(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                      title="Dock to Beside View"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Dock Beside</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResultPopup(false)}
                      className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Interactive Viewfinder HUD Banner */}
                <div className="relative h-28 bg-[#050609] border-b border-zinc-800/80 px-6 flex items-center justify-between overflow-hidden">
                  {/* Subtle 3D Grid */}
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #ccff00 1px, transparent 1px),
                        linear-gradient(to bottom, #2b3240 1px, transparent 1px)
                      `,
                      backgroundSize: '28px 28px'
                    }}
                  />

                  {/* Left HUD Details */}
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/80 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      SYNTHESIZED
                    </div>
                    <div className="text-xs font-mono text-zinc-300 hidden sm:block">
                      <span className="text-[#ccff00] font-bold">{activeMotionObj.label}</span>
                      <span className="text-zinc-500"> • </span>
                      <span>{resultTags.lens}</span>
                      <span className="text-zinc-500"> • </span>
                      <span>{motionSpeed} speed</span>
                    </div>
                  </div>

                  {/* Right Viewfinder Controls */}
                  <div className="relative z-10 flex items-center gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => { setShowResultPopup(false); setShowSimModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ccff00] text-black font-bold hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition cursor-pointer text-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Open 3D Simulator</span>
                    </button>
                  </div>
                </div>

                {/* Popup Tabs Bar */}
                <div className="px-5 pt-3 pb-2 bg-[#090b10] border-b border-zinc-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'tags', label: '🏷️ Visual Tags Breakdown', badge: '8 Tags' },
                    { id: 'cinematic', label: '🎬 Cinematic Prose Prompt', badge: 'Prose' },
                    { id: 'json', label: '📋 Structured JSON', badge: 'Code' },
                    { id: 'specs', label: '🎥 Director & Optics Spec', badge: '3D' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setResultTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                        resultTab === tab.id
                          ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.25)] font-bold'
                          : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        resultTab === tab.id ? 'bg-black/20 text-black' : 'bg-black/40 text-zinc-500'
                      }`}>
                        {tab.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Popup Content Body */}
                <div className="p-5 overflow-y-auto max-h-[58vh] text-xs font-mono scrollbar-thin scrollbar-thumb-zinc-800">
                  {isGenerating ? (
                    <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
                      {/* Futuristic Radar Aperture */}
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 rounded-full border-2 border-dashed border-[#ccff00]/40"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-2 rounded-full border-2 border-t-[#00d2ff] border-r-transparent border-b-[#ccff00] border-l-transparent"
                        />
                        <motion.div
                          animate={{ scale: [0.92, 1.15, 0.92], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ccff00]/25 via-[#00d2ff]/20 to-purple-500/25 border border-[#ccff00] flex items-center justify-center shadow-[0_0_35px_rgba(204,255,0,0.4)]"
                        >
                          <Sparkles className="w-5 h-5 text-[#ccff00] animate-spin" />
                        </motion.div>
                      </div>

                      {/* Status Readout */}
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                          <span className="text-[11px] uppercase font-mono tracking-widest text-[#ccff00] font-bold">
                            AI DIRECTOR SYNTHESIZING • {selectedModel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-white tracking-tight">
                          {processingStepText}
                        </p>
                        <p className="text-xs font-mono text-zinc-400">
                          Calibrating {activeMotionObj.label} • {framerate} • Hollywood Color Grading
                        </p>
                      </div>

                      {/* Shimmering Progress Bar */}
                      <div className="w-full max-w-sm h-1.5 rounded-full bg-zinc-800/90 overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#ccff00] to-transparent"
                        />
                      </div>

                      {/* Step Badges */}
                      <div className="flex items-center gap-3 font-mono text-xs text-zinc-500 pt-1">
                        <span className={procStep >= 0 ? "text-[#ccff00] font-bold" : ""}>1. Physics Cadence</span>
                        <span>→</span>
                        <span className={procStep >= 1 ? "text-[#ccff00] font-bold" : ""}>2. 3D Trajectory</span>
                        <span>→</span>
                        <span className={procStep >= 2 ? "text-[#ccff00] font-bold" : ""}>3. Volumetric Light</span>
                        <span>→</span>
                        <span className={procStep >= 3 ? "text-[#ccff00] font-bold" : ""}>4. Negative Guardrails</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* TAB 1: Visual Tags Breakdown */}
                      {resultTab === 'tags' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-sans">
                          {/* Subject & Character Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-[#ccff00] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>👤</span> Subject &amp; Core Action
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTag('subject', `${resultTags.subject}. ${resultTags.action}`)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedTag === 'subject' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedTag === 'subject' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <p className="text-zinc-100 text-xs leading-relaxed">
                              <span className="font-bold text-white">{resultTags.subject}</span> — {resultTags.action}
                            </p>
                          </div>

                          {/* Camera Motion & Lens Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🎥</span> Camera Physics &amp; Optics
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTag('camera', `${resultTags.camera}, ${resultTags.lens}, ${resultTags.speed} speed @ ${resultTags.framerate}`)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedTag === 'camera' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedTag === 'camera' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <p className="text-zinc-200 text-xs leading-relaxed">
                              {resultTags.camera} • {resultTags.lens} • {resultTags.speed} motion curve at {resultTags.framerate}
                            </p>
                          </div>

                          {/* Lighting & Volumetrics Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>💡</span> Lighting &amp; Volumetric Set
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTag('lighting', `${resultTags.lighting}, ${resultTags.setting}`)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedTag === 'lighting' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedTag === 'lighting' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <p className="text-zinc-200 text-xs leading-relaxed">
                              {resultTags.lighting} in {resultTags.setting}
                            </p>
                          </div>

                          {/* Color Palette Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🎨</span> Hollywood Color Grade
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTag('palette', resultTags.palette.join(', '))}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedTag === 'palette' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedTag === 'palette' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {resultTags.palette.map((color: string, i: number) => (
                                <span key={i} className="px-3 py-1 rounded-xl bg-zinc-800/90 text-zinc-200 border border-zinc-700 text-xs font-mono flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-cyan-400' : i === 1 ? 'bg-amber-400' : 'bg-purple-400'}`} />
                                  {color}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Animation Style Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>✨</span> Animation Style &amp; Cel Timing
                              </span>
                            </div>
                            <p className="text-zinc-200 text-xs leading-relaxed">
                              {resultTags.animation}
                            </p>
                          </div>

                          {/* Soundscape & Foley Tag */}
                          <div className="p-4 rounded-2xl bg-[#090b10] border border-zinc-800 hover:border-zinc-700 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <span>🔊</span> Cinematic Soundscape &amp; Foley
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTag('sound', resultTags.sound)}
                                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedTag === 'sound' ? <Check className="w-3 h-3 text-[#ccff00]" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedTag === 'sound' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <p className="text-zinc-200 text-xs leading-relaxed">
                              {resultTags.sound}
                            </p>
                          </div>

                          {/* Negative Constraints Full Width */}
                          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 md:col-span-2">
                            <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                              <span>🚫</span> Negative Prompt Filters (Avoid)
                            </span>
                            <p className="text-red-300/80 text-xs font-mono">
                              {resultTags.negative}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: Cinematic Prose with Typing Streamer */}
                      {resultTab === 'cinematic' && (
                        <div className="p-5 rounded-2xl bg-[#08090c] border border-zinc-800 text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans relative group select-all">
                          {isTyping && (
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60 font-mono text-[11px] text-[#ccff00]">
                              <span className="flex items-center gap-2 animate-pulse font-bold">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Typing Streamer in Progress...</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => { setDisplayedText(normalTextResult); setIsTyping(false); }}
                                className="text-zinc-400 hover:text-white px-2.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer text-xs"
                              >
                                Skip ⏩
                              </button>
                            </div>
                          )}
                          <div className="whitespace-pre-wrap leading-relaxed font-sans text-zinc-100">
                            {isTyping ? displayedText : normalTextResult}
                            {isTyping && (
                              <span className="inline-block w-2 h-4 bg-[#ccff00] ml-1 animate-pulse align-middle" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* TAB 3: Structured JSON */}
                      {resultTab === 'json' && (
                        <pre className="p-4 rounded-2xl bg-[#08090c] border border-zinc-800 overflow-x-auto text-emerald-400/90 whitespace-pre-wrap text-xs font-mono">
                          <code>
                            {typeof resultPrompt === 'object'
                              ? JSON.stringify(resultPrompt, null, 2)
                              : resultPrompt}
                          </code>
                        </pre>
                      )}

                      {/* TAB 4: Camera Specs */}
                      {resultTab === 'specs' && (
                        <div className="p-5 rounded-2xl bg-[#08090c] border border-zinc-800 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 font-mono block">MOTION TRAJECTORY</span>
                              <span className="text-[#ccff00] font-bold text-sm">{activeMotionObj.label}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 font-mono block">CADENCE &amp; FPS</span>
                              <span className="text-white font-bold text-sm">{framerate}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 font-mono block">LENS OPTICS</span>
                              <span className="text-white font-bold text-sm">{resultTags.lens}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                              <span className="text-[10px] text-zinc-500 font-mono block">ASPECT &amp; TIME</span>
                              <span className="text-white font-bold text-sm">16:9 • 6s</span>
                            </div>
                          </div>
                          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 leading-relaxed">
                            <strong className="text-white">Director Motion Formula: </strong>
                            {activeMotionObj.promptSnippet}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Popup Footer */}
                <div className="px-5 py-4 border-t border-zinc-800/90 bg-[#07090c] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowResultPopup(false); setShowSimModal(true); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span>3D Motion Simulator</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResultPopup(false)}
                      className="px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                    >
                      Dock to Beside Card
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 text-xs font-bold transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#ccff00]" />
                          <span className="text-[#ccff00]">Copied Full Prompt</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Full Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCopy();
                        window.open('https://higgsfield.ai', '_blank');
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#ccff00] text-black font-extrabold hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition text-xs cursor-pointer"
                    >
                      Open in Higgsfield / Veo
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Model Compatibility Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-500">
          <span className="text-zinc-600">MODELS SUPPORTED:</span>
          {VIDEO_MODELS.map((model) => (
            <span 
              key={model}
              onClick={() => setSelectedModel(model)}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${
                selectedModel === model 
                  ? 'bg-zinc-800 text-[#ccff00] font-bold border border-zinc-700' 
                  : 'hover:text-zinc-300'
              }`}
            >
              {model}
            </span>
          ))}
        </div>

      </main>

      {/* 🌟 MODAL: INTERACTIVE 3D CAMERA MOTION & ANIMATION SIMULATOR */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#101217] w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#0a0b0e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center">
                    <Play className="w-4 h-4 text-[#ccff00]" />
                  </div>
                  <div>
                    <h3 className="font-sans text-sm sm:text-base font-bold text-white">
                      Camera Motion &amp; Animation Preview
                    </h3>
                    <span className="font-mono text-xs text-zinc-400">
                      Simulating {activeMotionObj.label} • {framerate} • {motionSpeed} speed
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewport Simulation Player */}
              <div className="relative aspect-video bg-[#050608] border-b border-zinc-800 flex items-center justify-center overflow-hidden group">
                
                {/* Simulated 3D Perspective Grid Plane */}
                <div 
                  className={`absolute inset-0 pointer-events-none opacity-30 transition-transform duration-1000 ${
                    isPlayingSim ? (
                      selectedCameraMotion === 'dolly-in' ? 'scale-125' :
                      selectedCameraMotion === 'orbit-360' ? 'rotate-12 scale-110' :
                      selectedCameraMotion === 'fpv-drone' ? '-translate-y-8 rotate-6 scale-120' :
                      selectedCameraMotion === 'vertigo-zoom' ? 'scale-90 skew-y-3' :
                      selectedCameraMotion === 'crane-jib' ? 'translate-y-12' :
                      'scale-100'
                    ) : 'scale-100'
                  }`}
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, #ccff00 1px, transparent 1px),
                      linear-gradient(to right, #2c3340 1px, transparent 1px),
                      linear-gradient(to bottom, #2c3340 1px, transparent 1px)
                    `,
                    backgroundSize: '36px 36px'
                  }}
                />

                {/* Simulated Moving Subject Wireframe Sphere / Cube */}
                <motion.div
                  animate={isPlayingSim ? (
                    selectedCameraMotion === 'dolly-in' ? { scale: [1, 1.4, 1], z: [0, 50, 0] } :
                    selectedCameraMotion === 'orbit-360' ? { rotate: [0, 360], scale: [1, 1.05, 1] } :
                    selectedCameraMotion === 'fpv-drone' ? { x: [-30, 30, -30], y: [-20, 20, -20], rotate: [-10, 10, -10] } :
                    selectedCameraMotion === 'vertigo-zoom' ? { scale: [1, 1.5, 0.9, 1] } :
                    selectedCameraMotion === 'crane-jib' ? { y: [40, -40, 40] } :
                    selectedCameraMotion === 'whip-pan' ? { x: [-120, 120, 0] } :
                    { scale: 1 }
                  ) : { scale: 1 }}
                  transition={{ 
                    duration: motionSpeed === 'kinetic' ? 2 : motionSpeed === 'slow' ? 6 : 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative z-10 w-32 h-32 rounded-2xl bg-gradient-to-tr from-[#ccff00]/20 via-[#00d2ff]/20 to-purple-500/20 border-2 border-[#ccff00] shadow-[0_0_30px_rgba(204,255,0,0.3)] flex flex-col items-center justify-center backdrop-blur-xs"
                >
                  <Camera className="w-8 h-8 text-[#ccff00] mb-1" />
                  <span className="text-[10px] font-mono text-white font-bold uppercase tracking-wider text-center px-1">
                    {activeMotionObj.label}
                  </span>
                  <span className="text-[8px] font-mono text-[#ccff00]/80">
                    {framerate}
                  </span>
                </motion.div>

                {/* Viewfinder Overlays */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 text-red-400 border border-red-500/30 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    REC
                  </span>
                  <span className="text-zinc-400 bg-black/60 px-2 py-0.5 rounded">
                    00:00:04.18
                  </span>
                </div>

                <div className="absolute top-4 right-4 z-20 font-mono text-[10px] bg-black/70 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-800">
                  {selectedModel.toUpperCase()} • 16:9 4K
                </div>

                {/* Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-6 h-6 border-t border-l border-white/60 absolute -top-3 -left-3" />
                  <div className="w-6 h-6 border-t border-r border-white/60 absolute -top-3 -right-3" />
                  <div className="w-6 h-6 border-b border-l border-white/60 absolute -bottom-3 -left-3" />
                  <div className="w-6 h-6 border-b border-r border-white/60 absolute -bottom-3 -right-3" />
                </div>

                {/* Bottom Motion Readout */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800">
                  <span className="text-zinc-300 truncate max-w-sm">
                    {activeMotionObj.promptSnippet}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPlayingSim(!isPlayingSim)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold cursor-pointer"
                  >
                    {isPlayingSim ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingSim ? 'Pause' : 'Play'}</span>
                  </button>
                </div>

              </div>

              {/* Modal Controls Footer */}
              <div className="p-4 bg-[#0a0b0e] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {CAMERA_MOTIONS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedCameraMotion(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                        selectedCameraMotion === m.id
                          ? 'bg-[#ccff00] text-black font-bold'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold cursor-pointer"
                >
                  Close Preview
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
