import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Layers,
  Sparkles,
  Play,
  Pause,
  Copy,
  Check,
  Plus,
  Trash2,
  Sliders,
  Camera,
  Maximize2,
  Clock,
  ArrowRight,
  RefreshCw,
  Wand2,
  Video,
  Volume2,
  Share2,
  ChevronRight,
  Compass,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface StoryboardShot {
  id: string;
  shotNumber: number;
  duration: number; // in seconds
  shotType: 'Wide Establishing' | 'Medium Tracking' | 'Close-Up' | 'Macro Detail' | 'FPV Drone' | 'Crane Outro';
  cameraMovement: 'Dolly In' | 'Orbit 360' | 'Tracking Shot' | 'FPV Drone Dive' | 'Crane Tilt-Up' | 'Tripod Lock' | 'Whip Pan';
  actionPrompt: string;
  lightingMood: string;
  audioCue?: string;
  transition: 'Cut' | 'Match Cut' | 'Whip Pan' | 'Fade to Black';
}

export interface StoryboardTemplate {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  color: string;
  aspectRatio: string;
  fps: string;
  globalAnchor: {
    character: string;
    environment: string;
    cinematography: string;
  };
  shots: StoryboardShot[];
}

export const STORYBOARD_TEMPLATES: StoryboardTemplate[] = [
  {
    id: 'cyberpunk-run',
    name: 'Cyberpunk Neo-Noir Narrative',
    tagline: '4-shot rainy night courier mission with holographic reveal',
    badge: 'CINEMATIC',
    color: '#00d2ff',
    aspectRatio: '2.39:1',
    fps: '24fps',
    globalAnchor: {
      character: 'Male courier in black matte techwear coat, iridescent shoulder patches, glowing cyan cybernetic visor, zero identity drift',
      environment: 'Rain-soaked Tokyo neo-noir alley, wet asphalt with neon reflections, vibrant magenta & cyan signage, misty atmospheric steam',
      cinematography: '35mm Anamorphic 2.39:1, shallow depth of field, warm golden key light with cool rim separation, organic film grain'
    },
    shots: [
      {
        id: 'cp-shot-1',
        shotNumber: 1,
        duration: 3,
        shotType: 'Wide Establishing',
        cameraMovement: 'Crane Tilt-Up',
        actionPrompt: 'High-angle crane shot descending through neon signs as the courier glides into the narrow alleyway on a matte-black hoverbike, headlights cutting through rain.',
        lightingMood: 'Teal & magenta neon backlights, glistening wet ground reflections',
        audioCue: 'Distant siren, rain patter on asphalt, low hoverbike turbine hum',
        transition: 'Cut'
      },
      {
        id: 'cp-shot-2',
        shotNumber: 2,
        duration: 3,
        shotType: 'Medium Tracking',
        cameraMovement: 'Tracking Shot',
        actionPrompt: 'Low-angle medium tracking shot moving backwards as the courier dismounts into puddles, boots splashing water, reaching inside his armored coat.',
        lightingMood: 'Warm amber rim light from storefront, neon sign reflections in puddles',
        audioCue: 'Heavy combat boots splash, leather coat rustle',
        transition: 'Match Cut'
      },
      {
        id: 'cp-shot-3',
        shotNumber: 3,
        duration: 3,
        shotType: 'Macro Detail',
        cameraMovement: 'Tripod Lock',
        actionPrompt: 'Extreme macro close-up of a glowing encrypted titanium data drive. Glowing blue holographic glyphs project into the air, reflecting across the courier\'s visor.',
        lightingMood: 'Cyan holographic glow illuminating facial features in darkness',
        audioCue: 'High-tech digital chirp, sub-bass pulse',
        transition: 'Whip Pan'
      },
      {
        id: 'cp-shot-4',
        shotNumber: 4,
        duration: 3,
        shotType: 'Crane Outro',
        cameraMovement: 'Dolly In',
        actionPrompt: 'Dynamic camera pull-back elevating towards the rainy sky as surveillance drones descend from the fog, the courier glancing upward before disappearing into shadows.',
        lightingMood: 'Searchlight beams piercing dense fog, high contrast rim silhouette',
        audioCue: 'Surveillance drone rotor flutter, dramatic musical crescendo',
        transition: 'Fade to Black'
      }
    ]
  },
  {
    id: 'luxury-brand',
    name: 'Luxury 3D Brand Emblem Reveal',
    tagline: '3-shot brushed gold & silver commercial with raytraced floor reflections',
    badge: 'COMMERCIAL',
    color: '#f59e0b',
    aspectRatio: '16:9',
    fps: '24fps',
    globalAnchor: {
      character: 'Sculpted 3D metallic brushed gold and silver eagle emblem, precision beveled edges, micro-tactile surface texture',
      environment: 'Dark glossy reflective mirror studio floor, pitch-black infinity backdrop, atmospheric golden dust particles floating',
      cinematography: '8k UHD commercial studio lighting, directional 5200K tungsten key spotlight, sharp raytraced floor reflections'
    },
    shots: [
      {
        id: 'lx-shot-1',
        shotNumber: 1,
        duration: 3,
        shotType: 'Wide Establishing',
        cameraMovement: 'Dolly In',
        actionPrompt: 'Dark empty mirror stage. A sharp golden directional key light sweeps in from top-left, casting long liquid-gold reflections across the dark floor as the eagle emblem emerges.',
        lightingMood: 'High-contrast low-key illumination, single 45-degree golden spotlight',
        audioCue: 'Deep sub-bass cinematic riser with metallic chime resonance',
        transition: 'Cut'
      },
      {
        id: 'lx-shot-2',
        shotNumber: 2,
        duration: 3,
        shotType: 'Macro Detail',
        cameraMovement: 'Orbit 360',
        actionPrompt: 'Macro probe lens slowly gliding around the beveled golden feathers and brushed silver X cross-bar, specular light glinting off the sharp metallic edges with subtle anamorphic lens flare.',
        lightingMood: 'Moving rim highlight accentuating tactile metallic brushing',
        audioCue: 'Subtle mechanical click, crystalline harmonic sheen',
        transition: 'Match Cut'
      },
      {
        id: 'lx-shot-3',
        shotNumber: 3,
        duration: 3,
        shotType: 'Medium Tracking',
        cameraMovement: 'Tripod Lock',
        actionPrompt: 'Full canonical hero frontal view. On the dark reflective floor directly below the eagle emblem, 3D embossed brushed gold letters reading "RX AI MARKETING AGENCY" ignite with specular rim lights and glossy ground reflections.',
        lightingMood: 'Full studio lighting balance, warm golden rim lights, balanced reflections',
        audioCue: 'Deep brand impact boom with gentle atmospheric decay',
        transition: 'Cut'
      }
    ]
  },
  {
    id: 'anime-emotional',
    name: 'Makoto Shinkai Summer Emotion',
    tagline: '3-shot anime sequence with lush sky gradients and cherry blossom wind',
    badge: 'ANIME',
    color: '#ec4899',
    aspectRatio: '16:9',
    fps: '24fps',
    globalAnchor: {
      character: 'High school girl with fluttering dark brown ponytail, traditional navy and white sailor uniform with crimson ribbon',
      environment: 'Green grassy hillside overlooking shimmering ocean, towering volumetric cumulonimbus clouds, blooming cherry blossoms',
      cinematography: 'Makoto Shinkai signature anime aesthetic, vibrant turquoise and golden sky gradients, soft volumetric lens flares'
    },
    shots: [
      {
        id: 'an-shot-1',
        shotNumber: 1,
        duration: 3,
        shotType: 'Wide Establishing',
        cameraMovement: 'Dolly In',
        actionPrompt: 'Breathtaking wide landscape pan over emerald grass waving in the summer ocean breeze. Enormous cloudscapes reach toward a brilliant blue sky, glistening sunlight reflecting on the sea.',
        lightingMood: 'Golden hour midday sun with luminous atmospheric haze',
        audioCue: 'Gentle summer wind, distant ocean surf, soft piano chords',
        transition: 'Cut'
      },
      {
        id: 'an-shot-2',
        shotNumber: 2,
        duration: 3,
        shotType: 'Medium Tracking',
        cameraMovement: 'Tracking Shot',
        actionPrompt: 'Medium shot from behind as the girl stands at the cliff edge, gazing out at the horizon. A sudden gust of wind flutters her skirt and sends a shower of pink blossom petals swirling around her.',
        lightingMood: 'Backlit golden rim illumination through hair and translucent petals',
        audioCue: 'Wind swell, rustling leaves, gentle chime flutter',
        transition: 'Match Cut'
      },
      {
        id: 'an-shot-3',
        shotNumber: 3,
        duration: 3,
        shotType: 'Close-Up',
        cameraMovement: 'Tripod Lock',
        actionPrompt: 'Intimate close-up on her face as she turns toward camera with a nostalgic, hopeful smile. Sunlight reflects like stars in her detailed expressive anime eyes, hair dancing softly.',
        lightingMood: 'Soft warm fill light with sparkling specular catchlights in eyes',
        audioCue: 'Emotional strings swell into melodic resolution',
        transition: 'Fade to Black'
      }
    ]
  },
  {
    id: 'hypercar-chase',
    name: 'High-Speed Mountain Drift',
    tagline: '4-shot adrenaline car chase with FPV drone dives and sparks',
    badge: 'ACTION',
    color: '#10b981',
    aspectRatio: '16:9',
    fps: '60fps',
    globalAnchor: {
      character: 'Matte carbon-fiber hypercar with glowing crimson aerodynamic fins and active rear wing',
      environment: 'Winding mountain pass at twilight, damp asphalt, amber guardrails, dramatic cliff drops',
      cinematography: 'High-octane action film cinematography, 60fps kinetic motion blur, anamorphic streaks'
    },
    shots: [
      {
        id: 'hc-shot-1',
        shotNumber: 1,
        duration: 3,
        shotType: 'FPV Drone',
        cameraMovement: 'FPV Drone Dive',
        actionPrompt: 'FPV drone diving down a steep mountain gorge, spiraling down alongside the hypercar as it drifts sideways around a sharp hairpin curve at extreme speed.',
        lightingMood: 'Twilight blue ambient with warm orange halogen guardrail illumination',
        audioCue: 'Screeching tires, roaring twin-turbo V8 engine, whoosh of air',
        transition: 'Whip Pan'
      },
      {
        id: 'hc-shot-2',
        shotNumber: 2,
        duration: 3,
        shotType: 'Macro Detail',
        cameraMovement: 'Tracking Shot',
        actionPrompt: 'Low-angle wheel-level tracking shot inches above the asphalt. Glowing orange ceramic brake rotor throws fiery sparks as the tire smokes against the tarmac.',
        lightingMood: 'Incandescent orange brake glow lighting the wheel well',
        audioCue: 'Violent tire scrub, ceramic brake friction whine',
        transition: 'Match Cut'
      },
      {
        id: 'hc-shot-3',
        shotNumber: 3,
        duration: 3,
        shotType: 'Close-Up',
        cameraMovement: 'Tripod Lock',
        actionPrompt: 'Interior cockpit shot through the windshield. Driver in racing helmet grips the Alcantara steering wheel, shifting paddle gears as neon dashboard telemetry blurs in reflection.',
        lightingMood: 'Cool blue dashboard backlighting casting reflections on visor',
        audioCue: 'Rapid dual-clutch gear shift snap, turbo blow-off valve hiss',
        transition: 'Cut'
      },
      {
        id: 'hc-shot-4',
        shotNumber: 4,
        duration: 3,
        shotType: 'Wide Establishing',
        cameraMovement: 'Crane Tilt-Up',
        actionPrompt: 'Rear tracking shot following twin blue exhaust flames firing into the night as the hypercar accelerates down the mountain straightaway toward the glowing city below.',
        lightingMood: 'Deep twilight sky, vivid blue exhaust flame flash illuminating road',
        audioCue: 'Full throttle acceleration fade into distance with tire echo',
        transition: 'Fade to Black'
      }
    ]
  }
];

export const StoryboardSequenceStudio: React.FC = () => {
  const [activeTemplateId, setActiveTemplateId] = useState<string>('cyberpunk-run');
  const [targetModel, setTargetModel] = useState<string>('Kling');
  const [exportFormat, setExportFormat] = useState<'kling' | 'runway' | 'sora' | 'json'>('kling');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Active Storyboard Data
  const [projectTitle, setProjectTitle] = useState('Cyberpunk Tokyo Courier Run');
  const [aspectRatio, setAspectRatio] = useState('2.39:1');
  const [fps, setFps] = useState('24fps');
  const [globalAnchor, setGlobalAnchor] = useState(STORYBOARD_TEMPLATES[0].globalAnchor);
  const [shots, setShots] = useState<StoryboardShot[]>(STORYBOARD_TEMPLATES[0].shots);

  // Playback / Timeline Simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePlayheadShotIndex, setActivePlayheadShotIndex] = useState<number>(0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  // Total Sequence Duration
  const totalDuration = useMemo(() => {
    return shots.reduce((acc, s) => acc + (Number(s.duration) || 3), 0);
  }, [shots]);

  // Load Template
  const handleSelectTemplate = (tmpl: StoryboardTemplate) => {
    setActiveTemplateId(tmpl.id);
    setProjectTitle(tmpl.name);
    setAspectRatio(tmpl.aspectRatio);
    setFps(tmpl.fps);
    setGlobalAnchor({ ...tmpl.globalAnchor });
    setShots(tmpl.shots.map(s => ({ ...s })));
    setIsPlaying(false);
    setActivePlayheadShotIndex(0);
    setPlaybackProgress(0);
  };

  // Add Shot
  const handleAddShot = () => {
    const nextNum = shots.length + 1;
    const newShot: StoryboardShot = {
      id: `shot-${Date.now()}`,
      shotNumber: nextNum,
      duration: 3,
      shotType: 'Medium Tracking',
      cameraMovement: 'Dolly In',
      actionPrompt: `Cinematic action continuation for Shot #${nextNum}, preserving subject likeness and environment.`,
      lightingMood: 'Matching key lighting and ambient contrast from global scene anchor',
      audioCue: 'Atmospheric audio texture',
      transition: 'Cut'
    };
    setShots(prev => [...prev, newShot]);
  };

  // Delete Shot
  const handleDeleteShot = (id: string) => {
    if (shots.length <= 1) return;
    setShots(prev => prev.filter(s => s.id !== id).map((s, idx) => ({ ...s, shotNumber: idx + 1 })));
  };

  // Duplicate Shot
  const handleDuplicateShot = (shot: StoryboardShot) => {
    const newShot: StoryboardShot = {
      ...shot,
      id: `shot-${Date.now()}`,
      shotNumber: shot.shotNumber + 1
    };
    const targetIdx = shots.findIndex(s => s.id === shot.id);
    const updated = [...shots];
    updated.splice(targetIdx + 1, 0, newShot);
    setShots(updated.map((s, idx) => ({ ...s, shotNumber: idx + 1 })));
  };

  // Update Shot Field
  const handleUpdateShot = (id: string, updates: Partial<StoryboardShot>) => {
    setShots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Timeline Playback Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 100;
    const step = (intervalTime / 1000) / totalDuration;

    const timer = setInterval(() => {
      setPlaybackProgress(prev => {
        const next = prev + step;
        if (next >= 1) {
          setIsPlaying(false);
          setActivePlayheadShotIndex(0);
          return 0;
        }

        // Determine active shot based on cumulative seconds
        const currentSec = next * totalDuration;
        let cumulative = 0;
        for (let i = 0; i < shots.length; i++) {
          cumulative += shots[i].duration;
          if (currentSec <= cumulative) {
            setActivePlayheadShotIndex(i);
            break;
          }
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, totalDuration, shots]);

  // Compute Timecode for shot index
  const getShotTimecode = (index: number) => {
    let start = 0;
    for (let i = 0; i < index; i++) {
      start += shots[i].duration;
    }
    const end = start + shots[index].duration;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `00:${pad(start)} - 00:${pad(end)}`;
  };

  // --- MODEL SYNTAX EXPORTERS ---

  // 1. Kling 1.5 Multi-Prompt Format
  const klingFormattedPrompt = useMemo(() => {
    const globalContext = `[GLOBAL STYLE & CONTINUITY: ${globalAnchor.character}. ${globalAnchor.environment}. ${globalAnchor.cinematography}]`;
    const lines = shots.map((s, idx) => {
      const tc = getShotTimecode(idx);
      return `[${tc}] ${globalAnchor.character}. ${s.actionPrompt} Camera movement: ${s.cameraMovement.toLowerCase()}, ${s.lightingMood}. --transition ${s.transition.toLowerCase()}`;
    });
    return `${globalContext}\n\n${lines.join('\n\n')}\n\n--aspect ${aspectRatio} --fps ${fps} --duration ${totalDuration}s`;
  }, [shots, globalAnchor, aspectRatio, fps, totalDuration]);

  // 2. Runway Gen-3 Director Mode Format
  const runwayFormattedPrompt = useMemo(() => {
    const lines = shots.map((s, idx) => {
      const tc = getShotTimecode(idx);
      return `// SHOT ${idx + 1} (${tc}) - ${s.shotType.toUpperCase()}\nCamera: [${s.cameraMovement}, Pace: Dynamic, Transition: ${s.transition}]\nPrompt: ${globalAnchor.character}. ${s.actionPrompt}. Lighting: ${s.lightingMood}. Style: ${globalAnchor.cinematography}`;
    });
    return `PROJECT: ${projectTitle}\nRATIO: ${aspectRatio} | FPS: ${fps}\n\n${lines.join('\n\n')}`;
  }, [shots, globalAnchor, projectTitle, aspectRatio, fps]);

  // 3. OpenAI Sora & Google Veo 2 Narrative Screenplay Format
  const soraFormattedPrompt = useMemo(() => {
    const intro = `A continuous cinematic ${totalDuration}-second sequence in ${aspectRatio} widescreen (${fps}).\nGLOBAL CONTINUITY ANCHOR:\n- Protagonist/Subject: ${globalAnchor.character}\n- Setting & World: ${globalAnchor.environment}\n- Visual Tone: ${globalAnchor.cinematography}`;

    const shotBlocks = shots.map((s, idx) => {
      const tc = getShotTimecode(idx);
      return `CUT ${idx + 1} (${tc} | ${s.shotType.toUpperCase()}):\n${s.actionPrompt}\nFilmed with an intentional ${s.cameraMovement.toLowerCase()}. Atmosphere: ${s.lightingMood}. Sound design: ${s.audioCue || 'Natural ambient Foley'}. Transitions into next shot via ${s.transition}.`;
    });

    return `${intro}\n\n${shotBlocks.join('\n\n')}`;
  }, [shots, globalAnchor, aspectRatio, fps, totalDuration]);

  // 4. Production JSON Format
  const jsonFormattedPrompt = useMemo(() => {
    const data = {
      project_title: projectTitle,
      total_duration_seconds: totalDuration,
      aspect_ratio: aspectRatio,
      framerate: fps,
      global_anchor: globalAnchor,
      storyboard_shots: shots.map((s, idx) => ({
        shot_number: s.shotNumber,
        timecode: getShotTimecode(idx),
        duration_seconds: s.duration,
        shot_type: s.shotType,
        camera_movement: s.cameraMovement,
        action: s.actionPrompt,
        lighting: s.lightingMood,
        audio_cue: s.audioCue || null,
        transition: s.transition
      }))
    };
    return JSON.stringify(data, null, 2);
  }, [projectTitle, totalDuration, aspectRatio, fps, globalAnchor, shots]);

  // Get current export text based on active tab
  const activeExportText = useMemo(() => {
    switch (exportFormat) {
      case 'kling': return klingFormattedPrompt;
      case 'runway': return runwayFormattedPrompt;
      case 'sora': return soraFormattedPrompt;
      case 'json': return jsonFormattedPrompt;
      default: return klingFormattedPrompt;
    }
  }, [exportFormat, klingFormattedPrompt, runwayFormattedPrompt, soraFormattedPrompt, jsonFormattedPrompt]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP TEMPLATE PICKER BAR */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#101217] p-3.5 sm:p-5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Pre-Engineered Storyboard Sequences
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
              1-Click Director Formulations
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Duration:</span>
            <span className="text-[#05b187] font-bold bg-[#05b187]/10 px-2 py-0.5 rounded-full border border-[#05b187]/20">
              {totalDuration}s Total ({shots.length} Shots)
            </span>
          </div>
        </div>

        {/* Template Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STORYBOARD_TEMPLATES.map(tmpl => {
            const isSel = activeTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSel
                    ? 'bg-zinc-900 border-pink-500 shadow-lg shadow-pink-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate mr-1">{tmpl.name}</span>
                    <span 
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase"
                      style={{ backgroundColor: `${tmpl.color}20`, color: tmpl.color }}
                    >
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {tmpl.tagline}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                  <span>{tmpl.shots.length} SHOTS</span>
                  <span>{tmpl.aspectRatio}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GLOBAL SCENE ANCHOR (CHARACTER & ENVIRONMENT LOCK) */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#101217] p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Global Continuity Anchor (Visual Drift Lock)
            </span>
            <span className="text-[10px] bg-emerald-950/50 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold hidden sm:inline">
              Locked Across All Cuts
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Aspect Ratio Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
              <span className="text-zinc-500 text-[10px]">Ratio:</span>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                className="bg-transparent text-zinc-200 text-xs font-mono focus:outline-none cursor-pointer"
              >
                {['16:9', '9:16', '2.39:1', '1:1', '4:3'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Target Model Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
              <span className="text-zinc-500 text-[10px]">Model:</span>
              <select
                value={targetModel}
                onChange={e => setTargetModel(e.target.value)}
                className="bg-transparent text-zinc-200 text-xs font-mono focus:outline-none cursor-pointer"
              >
                {['Kling', 'Runway Gen-3', 'OpenAI Sora', 'Google Veo 2', 'Luma Ray 2', 'Hailuo'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Global Anchor Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <span>👤 Subject / Character Lock:</span>
            </span>
            <textarea
              rows={2}
              value={globalAnchor.character}
              onChange={e => setGlobalAnchor(prev => ({ ...prev, character: e.target.value }))}
              placeholder="Facial likeness, hair, costume, physical traits (locked across all shots)..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-pink-500/80 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <span>🏛️ Environment & Setting Lock:</span>
            </span>
            <textarea
              rows={2}
              value={globalAnchor.environment}
              onChange={e => setGlobalAnchor(prev => ({ ...prev, environment: e.target.value }))}
              placeholder="Atmosphere, architecture, ground reflections, time of day..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-pink-500/80 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
              <span>🎥 Cinematography & Lighting:</span>
            </span>
            <textarea
              rows={2}
              value={globalAnchor.cinematography}
              onChange={e => setGlobalAnchor(prev => ({ ...prev, cinematography: e.target.value }))}
              placeholder="Lens type, color grade, Kelvin lighting, film stock grain..."
              className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-pink-500/80 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE TIMELINE & PLAYBACK SIMULATOR */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#101217] p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-pink-600/30 flex items-center gap-1.5 text-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Timeline'}</span>
            </button>
            <span className="text-xs font-semibold text-zinc-300">
              Shot #{shots[activePlayheadShotIndex]?.shotNumber || 1}:{' '}
              <strong className="text-white">{shots[activePlayheadShotIndex]?.shotType || ''}</strong>
            </span>
          </div>

          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span>Pacing:</span>
            <span className="text-pink-300 font-bold bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-500/30">
              {shots[activePlayheadShotIndex]?.cameraMovement || ''}
            </span>
            <span>·</span>
            <span>{getShotTimecode(activePlayheadShotIndex)}</span>
          </div>
        </div>

        {/* Visual Multi-Segment Timeline Scrub Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="relative h-6 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex">
            {shots.map((shot, idx) => {
              const widthPct = (shot.duration / totalDuration) * 100;
              const isActive = activePlayheadShotIndex === idx;
              return (
                <div
                  key={shot.id}
                  onClick={() => {
                    setActivePlayheadShotIndex(idx);
                    setIsPlaying(false);
                  }}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-zinc-900 flex items-center justify-between px-2 text-[10px] font-mono cursor-pointer transition-colors relative ${
                    isActive ? 'bg-pink-600/30 text-white' : 'hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <span className="truncate font-bold">Cut {shot.shotNumber}</span>
                  <span className="text-[9px] text-zinc-400">{shot.duration}s</span>
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-500 animate-pulse" />
                  )}
                </div>
              );
            })}

            {/* Live Playhead Indicator */}
            {isPlaying && (
              <div
                style={{ left: `${playbackProgress * 100}%` }}
                className="absolute inset-y-0 w-0.5 bg-yellow-400 shadow-[0_0_8px_#facc15] pointer-events-none transition-all duration-75 z-10"
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. SHOT-BY-SHOT CARDS (THE DIRECTOR WORKBENCH) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Sequential Shot Directives ({shots.length} Cuts)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddShot}
            className="px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Shot Cut</span>
          </button>
        </div>

        {/* Shot Cards Grid */}
        <div className="space-y-3">
          {shots.map((shot, idx) => {
            const isActive = activePlayheadShotIndex === idx;
            return (
              <div
                key={shot.id}
                className={`rounded-2xl border transition-all p-4 space-y-3 relative ${
                  isActive
                    ? 'border-pink-500/80 bg-[#161722] shadow-xl shadow-pink-500/10'
                    : 'border-zinc-800/90 bg-[#101217]'
                }`}
              >
                {/* Shot Header */}
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800/70 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {shot.shotNumber}
                    </span>
                    <span className="text-xs font-mono text-zinc-300 font-bold">
                      {getShotTimecode(idx)}
                    </span>

                    {/* Shot Type Selector */}
                    <select
                      value={shot.shotType}
                      onChange={e => handleUpdateShot(shot.id, { shotType: e.target.value as any })}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer font-medium"
                    >
                      {[
                        'Wide Establishing',
                        'Medium Tracking',
                        'Close-Up',
                        'Macro Detail',
                        'FPV Drone',
                        'Crane Outro'
                      ].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    {/* Camera Movement Selector */}
                    <select
                      value={shot.cameraMovement}
                      onChange={e => handleUpdateShot(shot.id, { cameraMovement: e.target.value as any })}
                      className="bg-zinc-900 border border-zinc-800 text-pink-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer font-mono font-bold"
                    >
                      {[
                        'Dolly In',
                        'Orbit 360',
                        'Tracking Shot',
                        'FPV Drone Dive',
                        'Crane Tilt-Up',
                        'Tripod Lock',
                        'Whip Pan'
                      ].map(cm => (
                        <option key={cm} value={cm}>🎥 {cm}</option>
                      ))}
                    </select>

                    {/* Duration Picker */}
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5 text-xs font-mono text-zinc-400">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <select
                        value={shot.duration}
                        onChange={e => handleUpdateShot(shot.id, { duration: Number(e.target.value) })}
                        className="bg-transparent text-white text-xs font-mono focus:outline-none cursor-pointer"
                      >
                        {[2, 3, 4, 5, 6].map(d => (
                          <option key={d} value={d}>{d}s</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shot Utility Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicateShot(shot)}
                      title="Duplicate this shot"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span className="hidden sm:inline text-[10px]">Duplicate</span>
                    </button>
                    {shots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteShot(shot.id)}
                        title="Delete this shot"
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Shot Prompt & Action Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                    <span>Physical Action & Camera Choreography:</span>
                    <span className="text-zinc-500 font-mono">Continuous Physics</span>
                  </div>
                  <textarea
                    rows={2}
                    value={shot.actionPrompt}
                    onChange={e => handleUpdateShot(shot.id, { actionPrompt: e.target.value })}
                    placeholder="Describe specific movements, subject actions, and environmental interactions occurring in this cut..."
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-pink-500/80 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Sub-Directives: Lighting & Transition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] text-zinc-400 shrink-0 font-medium">💡 Lighting:</span>
                    <input
                      type="text"
                      value={shot.lightingMood}
                      onChange={e => handleUpdateShot(shot.id, { lightingMood: e.target.value })}
                      placeholder="e.g. sharp golden rim highlights, dark moody shadows"
                      className="flex-1 bg-transparent text-xs text-zinc-300 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] text-zinc-400 shrink-0 font-medium">✂️ Transition:</span>
                    <select
                      value={shot.transition}
                      onChange={e => handleUpdateShot(shot.id, { transition: e.target.value as any })}
                      className="flex-1 bg-transparent text-xs text-pink-300 font-semibold focus:outline-none cursor-pointer"
                    >
                      {['Cut', 'Match Cut', 'Whip Pan', 'Fade to Black'].map(tr => (
                        <option key={tr} value={tr}>{tr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MULTI-FORMAT DIRECTOR EXPORTER & TIMELINE SCRIPT */}
      <div className="rounded-2xl border border-zinc-800/90 bg-[#101217] p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#05b187]" />
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Multi-Model Storyboard Exporter
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
              Formatted for Target Pipeline
            </span>
          </div>

          {/* Copy Full Storyboard Button */}
          <button
            type="button"
            onClick={() => handleCopyText(activeExportText, exportFormat)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#05b187] to-emerald-500 hover:brightness-110 text-zinc-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            {copiedFormat === exportFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormat === exportFormat ? 'Copied Storyboard!' : 'Copy Full Storyboard'}</span>
          </button>
        </div>

        {/* Format Sub-Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'kling', label: 'Kling 1.5 Multi-Prompt', badge: 'Timestamped' },
            { id: 'runway', label: 'Runway Gen-3 Director', badge: 'Camera Vectors' },
            { id: 'sora', label: 'OpenAI Sora / Veo 2', badge: 'Screenplay' },
            { id: 'json', label: 'Production JSON', badge: 'API Ready' }
          ].map(fmt => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => setExportFormat(fmt.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                exportFormat === fmt.id
                  ? 'bg-zinc-800 text-white border border-pink-500/60 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <span>{fmt.label}</span>
              <span className="text-[9px] font-mono text-zinc-400 bg-black/40 px-1.5 py-0.2 rounded">
                {fmt.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Formatted Output Box */}
        <div className="relative rounded-xl border border-zinc-800 bg-black/70 p-3 sm:p-4 overflow-hidden">
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap break-words max-h-72 overflow-y-auto leading-relaxed selection:bg-pink-500 selection:text-white">
            {activeExportText}
          </pre>
        </div>
      </div>
    </div>
  );
};
