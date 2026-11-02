#!/usr/bin/env node
/**
 * SHOW AI Studio - Batch Scene Image Regeneration Script
 * 
 * Automatically regenerates high-fidelity scenery images for all scenes in the
 * database/collection using `google/gemini-2.5-flash-image` via OpenRouter.
 * 
 * Features:
 *  - Controlled concurrency limit (default: 2 parallel workers) to avoid rate limits
 *  - Architectural taxonomy enrichment & anti-hallucination negative guardrails
 *  - Background plate reference injection with Geometry vs. Lighting decoupling
 *  - Time-of-day relighting & Weather/Mood atmosphere transformation
 *  - Exponential backoff retry logic (up to 3 retries per scene)
 *  - Automatic persistence to Supabase (if configured) + local atomic JSON cache
 *  - Optional local image file download to public/scenes/
 *  - Real-time terminal progress tracking, rolling ETA, and summary report
 *  - Graceful resume support: skips previously generated scenes unless --force is set
 * 
 * Usage:
 *   node batchRegenerateScenes.js [options]
 * 
 * Options:
 *   --concurrency=<number>    Number of parallel workers (default: 2)
 *   --limit=<number>          Only process first N scenes (useful for testing)
 *   --offset=<number>         Start from index N (default: 0)
 *   --category=<id>           Filter by category (e.g. heritage_myanmar)
 *   --model=<id>              Target model (default: google/gemini-2.5-flash-image)
 *   --delay=<ms>              Delay between requests in ms (default: 1500)
 *   --save-images             Download and save images to public/scenes/<id>.jpg
 *   --force                   Regenerate scenes even if already completed in status file
 *   --dry-run                 Simulate pipeline without calling OpenRouter
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. CLI ARGUMENT PARSING
// ============================================================================
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    concurrency: 2,
    limit: Infinity,
    offset: 0,
    category: null,
    provider: 'openrouter', // 'openrouter' | 'pollinations'
    model: 'google/gemini-2.5-flash-image',
    delay: 1500,
    saveImages: false,
    force: false,
    fallback: false, // strictly Gemini only unless --fallback is specified
    dryRun: false
  };

  for (const arg of args) {
    if (arg.startsWith('--concurrency=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!isNaN(val) && val > 0) options.concurrency = val;
    } else if (arg.startsWith('--limit=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!isNaN(val) && val > 0) options.limit = val;
    } else if (arg.startsWith('--offset=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!isNaN(val) && val >= 0) options.offset = val;
    } else if (arg.startsWith('--category=')) {
      options.category = arg.split('=')[1].trim();
    } else if (arg.startsWith('--provider=')) {
      options.provider = arg.split('=')[1].trim().toLowerCase();
    } else if (arg.startsWith('--model=')) {
      options.model = arg.split('=')[1].trim();
    } else if (arg.startsWith('--delay=')) {
      const val = parseInt(arg.split('=')[1], 10);
      if (!isNaN(val) && val >= 0) options.delay = val;
    } else if (arg === '--save-images') {
      options.saveImages = true;
    } else if (arg === '--fallback') {
      options.fallback = true;
    } else if (arg === '--no-fallback') {
      options.fallback = false;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  return options;
}

// ============================================================================
// 2. CONFIGURATION & CONSTANTS
// ============================================================================
const STATUS_FILE_PATH = path.join(process.cwd(), 'data', 'scenes_batch_status.json');
const PUBLIC_SCENES_DIR = path.join(process.cwd(), 'public', 'scenes');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.SEEDREAM_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Time of Day Override Mapping
const TIME_LIGHTING_OVERRIDE_MAP = {
  early_morning: {
    id: "early_morning",
    label: "Early Morning / Dawn",
    sunAngle: "Low angle morning rays (15°–25° elevation)",
    kelvin: "5500K–6000K fresh morning sunlight",
    relightingInstruction: "Early morning dawn illumination: slanted directional golden sunlight piercing through light morning haze, long soft shadows, dewy highlights, and crisp ambient skylight."
  },
  high_noon: {
    id: "high_noon",
    label: "High Noon / Midday Sun",
    sunAngle: "Direct overhead sun (75°–90° elevation angle)",
    kelvin: "5500K–6500K neutral daylight",
    relightingInstruction: "High noon intense sun: sharp vertical downward shadows, crisp high-contrast specular highlights, vibrant saturated colors, and crystal-clear azure sky."
  },
  golden_hour: {
    id: "golden_hour",
    label: "Golden Hour / Sunset",
    sunAngle: "Ultra-low sun (10°–20° elevation angle)",
    kelvin: "2500K–3000K warm amber-gold",
    relightingInstruction: "Golden hour sunset illumination: rich warm amber-orange directional rim light, long dramatic cast shadows, warm atmospheric haze, and glowing architectural edges."
  },
  twilight: {
    id: "twilight",
    label: "Twilight / Blue Hour",
    sunAngle: "Sun beneath horizon (-4° to -8°)",
    kelvin: "7000K–9000K deep indigo and cobalt",
    relightingInstruction: "Blue hour twilight illumination: diffuse deep indigo/cobalt ambient sky, subtle pink/violet horizon gradient, and warm artificial practical lamps/lanterns glowing against cool dark surroundings."
  },
  night: {
    id: "night",
    label: "Night / Midnight",
    sunAngle: "Pitch dark nocturnal sky with celestial/artificial illumination",
    kelvin: "2200K–2700K warm architectural floodlights and lanterns contrasted against 8500K moonlight",
    relightingInstruction: "Nighttime nocturnal lighting: dark deep midnight sky, architectural floodlights illuminating stupas/buildings, warm hanging lanterns or oil lamps, gentle specular reflections, and moonlit rim highlights."
  }
};

// Weather & Mood Override Mapping
const MOOD_ATMOSPHERE_OVERRIDE_MAP = {
  monsoon_rain: {
    id: "monsoon_rain",
    label: "Monsoon Rain & Wet Reflections",
    weatherEffect: "Heavy tropical monsoon rainfall with visible falling rain streaks, dense overcast gray-slate sky, and atmospheric mist wrap.",
    surfaceDecoupling: "WET SURFACE DECOUPLING: Transform all ground surfaces, stone terraces, flagstones, and teakwood boardwalks into wet, rain-slicked mirrors displaying dark saturated textures and realistic distorted water puddle reflections. Remove any dry dust or flat lighting."
  },
  misty_morning: {
    id: "misty_morning",
    label: "Misty Morning & Volumetric Sunbeams",
    weatherEffect: "Layered volumetric morning mist and ground fog rolling gently across the terrain, with crepuscular light rays (Tyndall effect).",
    surfaceDecoupling: "AERIAL PERSPECTIVE DECOUPLING: Introduce soft atmospheric haze and gradual contrast falloff in distant background architecture, with tiny glistening dew drops on foliage and balustrades."
  },
  candlelit_intimate: {
    id: "candlelit_intimate",
    label: "Candlelit Intimate & Sacred Glow",
    weatherEffect: "Darkened ambient environment illuminated by thousands of flickering natural beeswax candles, clay oil lamps, and warm hanging paper lanterns.",
    surfaceDecoupling: "CHIAROSCURO SURFACE DECOUPLING: High-contrast chiaroscuro shadows with warm 2200K flame bounce on polished marble, gold leaf, and carved teakwood."
  },
  luxury_gilded: {
    id: "luxury_gilded",
    label: "Royal Gilded & Golden Luxury",
    weatherEffect: "Luminous royal ambience with warm amber light shafts penetrating high clerestory windows, microscopic floating gold dust motes.",
    surfaceDecoupling: "METALLIC SPECULAR DECOUPLING: 24k gold leaf reliefs gleaming with anisotropic specular highlights, rich vermilion lacquer reflections on polished teakwood."
  },
  warm_golden: {
    id: "warm_golden",
    label: "Warm Golden Sunset Haze",
    weatherEffect: "Dramatic golden hour sunlight with warm amber dust haze, fiery orange and magenta horizon gradients.",
    surfaceDecoupling: "WARM SPECULAR DECOUPLING: Extreme warm rim illumination on architectural spires, long dramatic cast shadows, and glowing masonry textures."
  },
  serene_spiritual: {
    id: "serene_spiritual",
    label: "Serene Spiritual Stillness",
    weatherEffect: "Crystal clear tranquil air with gentle wafts of fragrant sandalwood incense smoke curling peacefully toward the sky.",
    surfaceDecoupling: "HARMONIC SOFT DIFFUSE: Clean natural stone and marble surfaces under soft balanced illumination, crisp architectural details without harsh glares."
  }
};

// Helper: Detect Time from Prompt & Scene Metadata
function detectTime(prompt, explicitTime) {
  if (explicitTime && typeof explicitTime === 'string') {
    const norm = explicitTime.toLowerCase().trim();
    if (norm in TIME_LIGHTING_OVERRIDE_MAP) return TIME_LIGHTING_OVERRIDE_MAP[norm];
    if (norm.includes("morning") || norm.includes("dawn") || norm.includes("sunrise") || norm.includes("နံနက်")) return TIME_LIGHTING_OVERRIDE_MAP.early_morning;
    if (norm.includes("noon") || norm.includes("midday") || norm.includes("မွန်းတည့်")) return TIME_LIGHTING_OVERRIDE_MAP.high_noon;
    if (norm.includes("golden") || norm.includes("sunset") || norm.includes("sundown") || norm.includes("နေဝင်")) return TIME_LIGHTING_OVERRIDE_MAP.golden_hour;
    if (norm.includes("twilight") || norm.includes("blue hour") || norm.includes("dusk") || norm.includes("ဆည်းဆာ")) return TIME_LIGHTING_OVERRIDE_MAP.twilight;
    if (norm.includes("night") || norm.includes("midnight") || norm.includes("dark") || norm.includes("ည")) return TIME_LIGHTING_OVERRIDE_MAP.night;
  }
  const p = (prompt || "").toLowerCase();
  if (/\b(night|midnight|moonlight|nocturnal|dark sky|lantern light|oil lamps)\b/.test(p) || /ညမီး|ညဘက်|ညဥ့်/.test(p)) {
    return TIME_LIGHTING_OVERRIDE_MAP.night;
  }
  if (/\b(twilight|blue hour|dusk|evening sky|post-sunset)\b/.test(p) || /ဆည်းဆာ|ညနေခင်း/.test(p)) {
    return TIME_LIGHTING_OVERRIDE_MAP.twilight;
  }
  if (/\b(golden hour|sunset|sundown|amber glow|late afternoon|magic hour)\b/.test(p) || /နေဝင်ချိန်|ရွှေရောင်အလင်း/.test(p)) {
    return TIME_LIGHTING_OVERRIDE_MAP.golden_hour;
  }
  if (/\b(early morning|dawn|sunrise|first light|morning mist|morning fog)\b/.test(p) || /နံနက်စောစော|မနက်ခင်း/.test(p)) {
    return TIME_LIGHTING_OVERRIDE_MAP.early_morning;
  }
  if (/\b(high noon|midday|noon|bright sunlight|overhead sun)\b/.test(p) || /မွန်းတည့်/.test(p)) {
    return TIME_LIGHTING_OVERRIDE_MAP.high_noon;
  }
  return TIME_LIGHTING_OVERRIDE_MAP.golden_hour;
}

// Helper: Detect Mood from Prompt & Scene Metadata
function detectMood(prompt, explicitMood) {
  if (explicitMood && typeof explicitMood === 'string') {
    const norm = explicitMood.toLowerCase().trim();
    if (norm in MOOD_ATMOSPHERE_OVERRIDE_MAP) return MOOD_ATMOSPHERE_OVERRIDE_MAP[norm];
    if (norm.includes("rain") || norm.includes("monsoon") || norm.includes("မိုး")) return MOOD_ATMOSPHERE_OVERRIDE_MAP.monsoon_rain;
    if (norm.includes("mist") || norm.includes("fog") || norm.includes("နှင်း")) return MOOD_ATMOSPHERE_OVERRIDE_MAP.misty_morning;
    if (norm.includes("candle") || norm.includes("lamp") || norm.includes("ဆီမီး")) return MOOD_ATMOSPHERE_OVERRIDE_MAP.candlelit_intimate;
    if (norm.includes("gold") || norm.includes("royal") || norm.includes("နန်းတွင်း")) return MOOD_ATMOSPHERE_OVERRIDE_MAP.luxury_gilded;
    if (norm.includes("warm") || norm.includes("sunset") || norm.includes("ဆည်းဆာ")) return MOOD_ATMOSPHERE_OVERRIDE_MAP.warm_golden;
  }
  const p = (prompt || "").toLowerCase();
  if (/\b(rain|monsoon|wet|puddle|rainstorm|downpour)\b/.test(p) || /မိုးရေ|မိုးရွာ/.test(p)) {
    return MOOD_ATMOSPHERE_OVERRIDE_MAP.monsoon_rain;
  }
  if (/\b(mist|misty|fog|foggy|haze|volumetric rays)\b/.test(p) || /မြူ|နှင်းခိုး/.test(p)) {
    return MOOD_ATMOSPHERE_OVERRIDE_MAP.misty_morning;
  }
  if (/\b(candle|candlelight|lantern|oil lamp)\b/.test(p) || /ဆီမီး|မီးတိုင်/.test(p)) {
    return MOOD_ATMOSPHERE_OVERRIDE_MAP.candlelit_intimate;
  }
  if (/\b(royal|palace|throne|gold leaf|gilded)\b/.test(p) || /ရွှေနန်းတော်|ပလ္လင်/.test(p)) {
    return MOOD_ATMOSPHERE_OVERRIDE_MAP.luxury_gilded;
  }
  if (/\b(sunset|golden hour|amber|dusk)\b/.test(p) || /နေဝင်|ရွှေရောင်/.test(p)) {
    return MOOD_ATMOSPHERE_OVERRIDE_MAP.warm_golden;
  }
  return MOOD_ATMOSPHERE_OVERRIDE_MAP.serene_spiritual;
}

// ============================================================================
// 3. ARCHITECTURAL TAXONOMY & PROMPT BUILDER
// ============================================================================
function buildArchitecturalSceneryPrompt(scene) {
  const timeSpec = detectTime(scene.prompt, scene.sunDirection);
  const moodSpec = detectMood(scene.prompt, scene.atmosphere);

  // Anti-hallucination negative guardrails for authentic Myanmar architecture
  const guardrails = 'Strictly authentic Burmese architecture featuring classic bell-shaped stupas, Pyatthat multi-tiered spires, weathered terracotta brickwork, or gilded teakwood columns. Forbid Thai prangs, Khmer/Angkor stone towers, or modern European elements.';

  return `[SYNTHESIS DIRECTIVE - BACKGROUND ARCHITECTURAL GEOMETRY, WEATHER & RELIGHTING]:
Generate a masterclass architectural scenery plate of ${scene.titleEn} (${scene.titleMm || ''}).
- SCENE SPECIFICATION: ${scene.prompt}
- ARCHITECTURAL TAXONOMY & PURITY: ${guardrails}
- TARGET RELIGHTING (${timeSpec.label}): ${timeSpec.relightingInstruction} (Sun angle: ${timeSpec.sunAngle}, Color Temperature: ${timeSpec.kelvin}).
- TARGET ATMOSPHERE & WEATHER (${moodSpec.label}): ${moodSpec.weatherEffect}
- SURFACE STATE TRANSFORMATION: ${moodSpec.surfaceDecoupling}
- LIGHTING NOTES: ${scene.lightingNotes || 'Cinematic environmental lighting with realistic depth of field and contact shadows.'}
- COMPOSITION: 8k UHD resolution, shot on 35mm Hasselblad architectural lens, zero human clutter or tourists, clean plate, strict 4:3 aspect ratio framing.`;
}

// Convert local image or preview URL to data URL if local file exists
function resolveReferencePlate(previewImage) {
  if (!previewImage || typeof previewImage !== 'string') return null;

  // If already a web URL or data URL
  if (previewImage.startsWith('http://') || previewImage.startsWith('https://') || previewImage.startsWith('data:image/')) {
    return previewImage;
  }

  // If local path like /scenes/xyz.jpg
  if (previewImage.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', previewImage.slice(1));
    if (fs.existsSync(localPath)) {
      try {
        const fileBuffer = fs.readFileSync(localPath);
        const ext = path.extname(localPath).toLowerCase().replace('.', '');
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        return `data:${mime};base64,${fileBuffer.toString('base64')}`;
      } catch {
        return null;
      }
    }
  }

  return null;
}

// ============================================================================
// 4. OPENROUTER MULTIMODAL API CLIENT
// ============================================================================
function extractImageUrl(choice) {
  if (!choice) return null;
  const msg = choice.message;

  // 1. Multimodal content array
  if (Array.isArray(msg?.content)) {
    for (const part of msg.content) {
      if (part?.type === "image" && part?.image_url?.url) return part.image_url.url;
      if (part?.image_url?.url) return part.image_url.url;
      if (typeof part?.image_url === "string") return part.image_url;
      if (typeof part === "string" && part.startsWith("data:image")) return part;
    }
  }

  // 2. images array
  if (Array.isArray(msg?.images)) {
    for (const img of msg.images) {
      if (typeof img === "string") return img;
      if (img?.image_url?.url) return img.image_url.url;
      if (typeof img?.url === "string") return img.url;
    }
  }

  // 3. content string
  if (typeof msg?.content === "string") {
    const trimmed = msg.content.trim();
    if (trimmed.startsWith("data:image/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    const mdMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s)]+|data:image\/[^\s)]+)\)/);
    if (mdMatch) return mdMatch[1];
  }

  // 4. Direct choice properties
  if (choice?.image_url?.url) return choice.image_url.url;
  if (typeof choice?.image_url === "string") return choice.image_url;

  return null;
}

async function generateSceneWithOpenRouter(scene, modelName, apiKey) {
  const synthesisPrompt = buildArchitecturalSceneryPrompt(scene);
  const refPlate = resolveReferencePlate(scene.previewImage);
  const timeSpec = detectTime(scene.prompt, scene.sunDirection);
  const moodSpec = detectMood(scene.prompt, scene.atmosphere);

  let userContent;

  if (refPlate) {
    const isolationDirective = `[REFERENCE IMAGE #1 - ROLE: BACKGROUND SCENE & ARCHITECTURAL PLATE - ${scene.titleEn}]:
1. GEOMETRY LOCK (100% Structural Fidelity):
- Lock 100% onto the physical architectural geometry, proportions, spatial perspective, horizon line, and landmark features of this location plate.
- Explicitly IGNORE and REMOVE any random people, silhouettes, tourists, or models present in this photo.
2. LIGHTING, WEATHER & SURFACE DECOUPLING (Unlit 3D Structural CAD Plate):
- DO NOT copy original daylight, sky color, sun exposure, or dry ground surface conditions from this reference photo. Treat this image purely as an unlit 3D structural CAD/VFX plate.
- MANDATORY TARGET RELIGHTING (${timeSpec.label}): ${timeSpec.relightingInstruction}
- Sun Angle: ${timeSpec.sunAngle} | Color Temperature: ${timeSpec.kelvin}.
- MANDATORY WEATHER & SURFACE OVERRIDE (${moodSpec.label}): ${moodSpec.weatherEffect}
- SURFACE STATE TRANSFORMATION: ${moodSpec.surfaceDecoupling}
- Completely transform the architecture surfaces and environment to match this target weather and time of day.`;

    userContent = [
      {
        type: "text",
        text: isolationDirective
      },
      {
        type: "image_url",
        image_url: { url: refPlate }
      },
      {
        type: "text",
        text: synthesisPrompt
      }
    ];
  } else {
    userContent = synthesisPrompt;
  }

  const payload = {
    model: modelName,
    modalities: ["image"],
    image_config: {
      aspect_ratio: "4:3"
    },
    aspect_ratio: "4:3",
    messages: [
      {
        role: "user",
        content: userContent
      }
    ]
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://show-ai.com",
        "X-Title": "SHOW AI Studio - Batch Scene Generator"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const imageUrl = extractImageUrl(data.choices?.[0]);

    if (!imageUrl) {
      const refusal = data.choices?.[0]?.message?.content || "No image in response";
      throw new Error(`Model returned text without image: ${refusal.slice(0, 150)}`);
    }

    return imageUrl;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fallback: Generate via FLUX Photoreal (High-Fidelity Free Provider)
async function generateSceneWithPollinations(scene) {
  const timeSpec = detectTime(scene.prompt, scene.sunDirection);
  const moodSpec = detectMood(scene.prompt, scene.atmosphere);
  const cleanPrompt = `${scene.prompt}, ${timeSpec.label}, ${moodSpec.label}, authentic Burmese architectural geometry, 8k uhd photorealistic, Hasselblad architectural prime lens, zero human clutter`;
  const encoded = encodeURIComponent(cleanPrompt.slice(0, 320));
  const seed = Math.floor(Math.random() * 900000) + 100000;
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&model=flux&nologo=true&seed=${seed}`;
}

async function checkOpenRouterKeyStatus(apiKey) {
  if (!apiKey) return { valid: false, isManagementKey: false };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      return {
        valid: true,
        isManagementKey: Boolean(data?.data?.is_management_key || data?.data?.is_provisioning_key),
        credits: data?.data?.limit_remaining ?? "Unlimited"
      };
    }
  } catch {}
  return { valid: false, isManagementKey: false };
}

// ============================================================================
// 5. DATABASE & PERSISTENCE HELPERS
// ============================================================================
function loadStatusMap() {
  if (fs.existsSync(STATUS_FILE_PATH)) {
    try {
      const raw = fs.readFileSync(STATUS_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function saveStatusMap(statusMap) {
  try {
    const dir = path.dirname(STATUS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(statusMap, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Storage Warning] Failed to persist status file: ${err.message}`);
  }
}

async function updateSupabaseRecord(scene, newImageUrl, sortOrder = 1) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;

  const sceneId = scene.id || scene.asset_key;

  // 1. Primary: Upsert into public.website_assets
  try {
    const payload = {
      section: 'preset_template',
      asset_key: sceneId,
      title_en: scene.titleEn || scene.title_en || scene.title || sceneId,
      title_mm: scene.titleMm || scene.title_mm || '',
      category: scene.category || 'heritage_myanmar',
      image_url: newImageUrl,
      prompt_fragment: scene.prompt || scene.prompt_fragment || '',
      metadata: {
        badge: scene.badge || '',
        sunDirection: scene.sunDirection || '',
        sunDirectionLabel: scene.sunDirectionLabel || '',
        atmosphere: scene.atmosphere || '',
        atmosphereLabel: scene.atmosphereLabel || '',
        lightingNotes: scene.lightingNotes || '',
        tags: scene.tags || []
      },
      is_active: true,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/website_assets?on_conflict=asset_key`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal,resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 201 || res.status === 204) {
      return true;
    }
  } catch (err) {
    console.warn(`[Supabase Upsert Notice] website_assets upsert error for ${sceneId}:`, err.message);
  }

  // 2. Secondary fallback: Try scenes table if it exists
  try {
    const resScenes = await fetch(`${SUPABASE_URL}/rest/v1/scenes?on_conflict=id`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal,resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: sceneId,
        title_en: scene.titleEn || sceneId,
        title_mm: scene.titleMm || '',
        preview_image: newImageUrl,
        category: scene.category || 'heritage_myanmar',
        prompt: scene.prompt || '',
        updated_at: new Date().toISOString()
      })
    });
    if (resScenes.ok || resScenes.status === 201 || resScenes.status === 204) {
      return true;
    }
  } catch {}

  return false;
}

async function saveImageLocally(sceneId, imageUrl) {
  try {
    if (!fs.existsSync(PUBLIC_SCENES_DIR)) {
      fs.mkdirSync(PUBLIC_SCENES_DIR, { recursive: true });
    }
    const targetFile = path.join(PUBLIC_SCENES_DIR, `${sceneId}.jpg`);

    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(',')[1];
      if (base64Data) {
        fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
        return `/scenes/${sceneId}.jpg`;
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        fs.writeFileSync(targetFile, Buffer.from(arrayBuf));
        return `/scenes/${sceneId}.jpg`;
      }
    }
  } catch (err) {
    console.warn(`[Local Save Notice] Could not save ${sceneId} locally: ${err.message}`);
  }
  return imageUrl;
}

// ============================================================================
// 6. SCENE DATA LOADER (SUPABASE OR LOCAL COLLECTION)
// ============================================================================
async function fetchScenes() {
  // 1. Try Supabase scenes table
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scenes?select=*&order=id.asc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          console.log(`[Database] Loaded ${rows.length} scenes from Supabase 'scenes' table.`);
          return rows.map(r => ({
            id: r.id,
            titleEn: r.title_en || r.title || r.name,
            titleMm: r.title_mm || r.title_burmese,
            badge: r.badge || 'HERITAGE',
            sunDirection: r.sun_direction || 'golden_hour',
            sunDirectionLabel: r.sun_direction_label || 'Golden Hour',
            atmosphere: r.atmosphere || 'warm_golden',
            atmosphereLabel: r.atmosphere_label || 'Warm Golden',
            previewImage: r.preview_image || r.image_url,
            prompt: r.prompt || r.description,
            lightingNotes: r.lighting_notes || '',
            category: r.category || 'heritage_myanmar',
            categoryLabelEn: r.category_label_en || 'Heritage Myanmar',
            categoryLabelMm: r.category_label_mm || 'မြန်မာ့သမိုင်းဝင် နေရာများ'
          }));
        }
      }
    } catch {}
  }

  // 2. Load from local TypeScript collection
  try {
    const scenesModule = await import('./src/data/scenes550Data.ts');
    const collection = scenesModule.SCENES_550_COLLECTION;
    if (Array.isArray(collection) && collection.length > 0) {
      console.log(`[Collection] Loaded ${collection.length} scenes from local SCENES_550_COLLECTION.`);
      return collection;
    }
  } catch (err) {
    console.error(`[Error] Failed to load local scenes: ${err.message}`);
  }

  throw new Error("Could not load scenes from either Supabase or local collection.");
}

// ============================================================================
// 7. BATCH WORKER QUEUE WITH RETRY LOGIC & CONCURRENCY
// ============================================================================
async function executeWithRetry(fn, maxRetries = 3, initialDelay = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      // Permanent auth or balance failure: do not retry 401 or 402 errors
      if (err.message && (err.message.includes('401') || err.message.includes('402') || err.message.includes('User not found') || err.message.includes('balance'))) {
        throw err;
      }
      if (attempt >= maxRetries) throw err;
      const backoff = initialDelay * Math.pow(1.5, attempt - 1);
      console.warn(`    ⚠️ Attempt ${attempt} failed: ${err.message}. Retrying in ${(backoff / 1000).toFixed(1)}s...`);
      await new Promise(r => setTimeout(r, backoff));
    }
  }
}

// ============================================================================
// 8. MAIN BATCH RUNNER
// ============================================================================
async function main() {
  const options = parseArgs();

  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║         SHOW AI Studio - Automated Scene Regeneration Pipeline         ║
╚════════════════════════════════════════════════════════════════════════╝
• Provider:     ${options.provider.toUpperCase()}
• Model:        ${options.model}
• Concurrency:  ${options.concurrency} worker(s)
• Pacing Delay: ${options.delay}ms
• Force Mode:   ${options.force ? 'YES (Regenerate all)' : 'NO (Skip completed)'}
• Auto-Fallback:${options.fallback ? 'YES (Pollinations FLUX on 401)' : 'NO'}
• Save Locally: ${options.saveImages ? 'YES (to public/scenes/)' : 'NO'}
• Dry Run:      ${options.dryRun ? 'YES (Simulation only)' : 'NO'}
══════════════════════════════════════════════════════════════════════════
`);

  if (!options.dryRun && options.provider === 'openrouter' && !OPENROUTER_API_KEY) {
    console.error("❌ ERROR: OPENROUTER_API_KEY is not defined in environment variables or .env file.");
    console.error("Please add OPENROUTER_API_KEY to .env or run with --provider=pollinations.");
    process.exit(1);
  }

  // Pre-flight check on OpenRouter key
  if (options.provider === 'openrouter' && !options.dryRun && OPENROUTER_API_KEY) {
    const keyInfo = await checkOpenRouterKeyStatus(OPENROUTER_API_KEY);
    if (keyInfo.isManagementKey) {
      console.log(`⚠️  NOTICE: The OpenRouter key in .env (...${OPENROUTER_API_KEY.slice(-4)}) is an OpenRouter "Management / Provisioning Key".`);
      console.log(`   OpenRouter blocks Management keys from calling generation endpoints (returns HTTP 401: User not found).`);
      if (options.fallback) {
        console.log(`   ⚡ Automatic Fallback to FLUX Photoreal 8K is ACTIVE. Your scenes will generate smoothly!`);
      } else {
        console.log(`   Please create a standard API Key (Keys -> Create Key) at: https://openrouter.ai/settings/keys`);
      }
      console.log(`══════════════════════════════════════════════════════════════════════════\n`);
    }
  }

  const allScenes = await fetchScenes();

  // Filter scenes
  let scenesToProcess = allScenes;
  if (options.category) {
    scenesToProcess = scenesToProcess.filter(s => s.category === options.category);
    console.log(`• Filtered by category '${options.category}': ${scenesToProcess.length} scenes.`);
  }

  if (options.offset > 0) {
    scenesToProcess = scenesToProcess.slice(options.offset);
  }

  if (options.limit < scenesToProcess.length) {
    scenesToProcess = scenesToProcess.slice(0, options.limit);
  }

  console.log(`• Target Scenes to Evaluate: ${scenesToProcess.length} total.\n`);

  const statusMap = loadStatusMap();

  let completedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const startTime = Date.now();
  const durations = [];

  let isInterrupted = false;
  process.on('SIGINT', () => {
    if (!isInterrupted) {
      isInterrupted = true;
      console.log('\n🛑 Interruption signal (Ctrl+C) received! Gracefully finishing active workers and saving progress...');
    }
  });

  // Worker Queue
  let currentIndex = 0;

  async function worker(workerId) {
    while (currentIndex < scenesToProcess.length && !isInterrupted) {
      const idx = currentIndex++;
      const scene = scenesToProcess[idx];
      const sceneNum = idx + 1;
      const totalNum = scenesToProcess.length;
      const progressPct = ((sceneNum / totalNum) * 100).toFixed(1);

      // Check if already completed
      if (!options.force && statusMap[scene.id]?.status === 'completed' && statusMap[scene.id]?.imageUrl) {
        console.log(`[${new Date().toLocaleTimeString()}] [${sceneNum}/${totalNum}] (${progressPct}%) ⏩ SKIPPED (Already completed): "${scene.titleEn}"`);
        skippedCount++;
        continue;
      }

      console.log(`[${new Date().toLocaleTimeString()}] [${sceneNum}/${totalNum}] (${progressPct}%) ⏳ Processing [Worker ${workerId}]: "${scene.titleEn}"`);
      const sceneStart = Date.now();

      try {
        let generatedUrl;
        let usedProvider = options.provider;

        if (options.dryRun) {
          await new Promise(r => setTimeout(r, 600));
          generatedUrl = `https://mock.show-ai.com/scenes/${scene.id}.jpg`;
        } else if (options.provider === 'pollinations') {
          generatedUrl = await executeWithRetry(() =>
            generateSceneWithPollinations(scene)
          );
        } else {
          try {
            generatedUrl = await executeWithRetry(() =>
              generateSceneWithOpenRouter(scene, options.model, OPENROUTER_API_KEY)
            );
          } catch (openRouterErr) {
            if (options.fallback && (openRouterErr.message.includes('401') || openRouterErr.message.includes('402') || openRouterErr.message.includes('User not found') || openRouterErr.message.includes('balance'))) {
              console.warn(`    ⚠️ OpenRouter Key Limit / 402 Balance Exhausted -> Auto-fallback to FLUX Photoreal...`);
              usedProvider = 'pollinations (fallback)';
              generatedUrl = await executeWithRetry(() =>
                generateSceneWithPollinations(scene)
              );
            } else {
              throw openRouterErr;
            }
          }
        }

        // Optional local save
        let finalUrl = generatedUrl;
        if (options.saveImages && !options.dryRun) {
          finalUrl = await saveImageLocally(scene.id, generatedUrl);
        }

        // Update database
        let dbUpdated = false;
        if (!options.dryRun) {
          dbUpdated = await updateSupabaseRecord(scene, finalUrl, sceneNum);
        }

        const elapsedSec = ((Date.now() - sceneStart) / 1000).toFixed(1);
        durations.push(Date.now() - sceneStart);

        statusMap[scene.id] = {
          id: scene.id,
          titleEn: scene.titleEn,
          titleMm: scene.titleMm,
          category: scene.category,
          imageUrl: finalUrl,
          provider: usedProvider,
          dbUpdated,
          status: 'completed',
          updatedAt: new Date().toISOString(),
          durationSec: parseFloat(elapsedSec)
        };
        saveStatusMap(statusMap);

        completedCount++;

        // Compute rolling ETA
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const remainingScenes = (totalNum - sceneNum);
        const etaMinutes = ((avgDuration * remainingScenes) / (options.concurrency * 60000)).toFixed(1);

        console.log(`[${new Date().toLocaleTimeString()}] [${sceneNum}/${totalNum}] ✅ SUCCESS: "${scene.titleEn}" (${elapsedSec}s) [ETA: ~${etaMinutes}m]`);

        // Pacing delay between requests
        if (options.delay > 0) {
          await new Promise(r => setTimeout(r, options.delay));
        }
      } catch (err) {
        failedCount++;
        console.error(`[${new Date().toLocaleTimeString()}] [${sceneNum}/${totalNum}] ❌ FAILED: "${scene.titleEn}": ${err.message}`);

        statusMap[scene.id] = {
          id: scene.id,
          titleEn: scene.titleEn,
          status: 'failed',
          error: err.message,
          failedAt: new Date().toISOString()
        };
        saveStatusMap(statusMap);
      }
    }
  }

  // Launch parallel workers
  const workerPromises = Array.from({ length: options.concurrency }, (_, i) => worker(i + 1));
  await Promise.all(workerPromises);

  const totalElapsedMin = ((Date.now() - startTime) / 60000).toFixed(2);

  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                      Batch Processing Summary                          ║
╚════════════════════════════════════════════════════════════════════════╝
• Total Evaluated: ${scenesToProcess.length}
• Succeeded:       ${completedCount}
• Skipped:         ${skippedCount}
• Failed:          ${failedCount}
• Total Time:      ${totalElapsedMin} minutes
• Audit Status:    Saved to ${STATUS_FILE_PATH}
══════════════════════════════════════════════════════════════════════════
`);
}

main().catch(err => {
  console.error("\n❌ Fatal script error:", err);
  process.exit(1);
});
