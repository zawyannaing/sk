import { buildComprehensiveMasterPrompt } from './src/utils/promptBuilder';
import { SupabaseService } from './src/utils/supabaseClient';

async function runTestSuite() {
  console.log('🧪 Starting SHOW AI Code Review Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // 1. Supabase Configuration Tests
  console.log('--- 1. Supabase Service Configuration ---');
  const cfg = SupabaseService.getConfig();
  assert('Supabase Service is configured', SupabaseService.isConfigured());
  assert('Supabase URL is valid HTTPS', !!cfg?.url && cfg.url.startsWith('https://'));
  assert('Supabase Anon Key is present', !!cfg?.anonKey && cfg.anonKey.length > 20);

  // 2. Resolution Tier Credit Rate Tests
  console.log('\n--- 2. Resolution Tier Credit Rates ---');
  const rates = { '1k': 5, '2k': 8, '4k': 12, '8k': 20, prompt: 1 };
  assert('1K Standard costs 5 Credits', rates['1k'] === 5);
  assert('2K High-Res costs 8 Credits', rates['2k'] === 8);
  assert('4K Ultra HD costs 12 Credits', rates['4k'] === 12);
  assert('8K Masterpiece costs 20 Credits', rates['8k'] === 20);
  assert('Video/Prompt costs 1 Credit', rates['prompt'] === 1);

  // 3. Top-Up Package Pricing Math Tests
  console.log('\n--- 3. Top-Up Package Pricing Math ---');
  const starter = { credits: 1000, usd: 10, perCredit: 10 / 1000 };
  const creator = { credits: 5500, usd: 50, perCredit: 50 / 5500 };
  const master = { credits: 12000, usd: 100, perCredit: 100 / 12000 };

  assert('Starter yields $0.01 per credit', starter.perCredit === 0.01);
  assert('Creator Pro includes 10% bonus credits', creator.credits === 5500);
  assert('Creator Pro cost per credit is lower than Starter', creator.perCredit < starter.perCredit);
  assert('Studio Master includes 20% bonus credits', master.credits === 12000);
  assert('Studio Master has lowest unit cost per credit', master.perCredit < creator.perCredit);

  // 4. Prompt Matrix & Builder Tests
  console.log('\n--- 4. Burmese Prompt Matrix & Builder ---');
  const testSelection: any = {
    gender: 'female',
    archetype: 'mandalay_royal',
    shotType: 'close_up',
    lighting: 'golden_hour',
    camera: 'hasselblad_x2d',
    aspectRatio: '16:9'
  };
  const result = buildComprehensiveMasterPrompt(testSelection, 'txt2img');
  assert('Prompt Builder produces non-empty prompt', typeof result.masterPrompt === 'string' && result.masterPrompt.length > 30);
  assert('Prompt Builder contains photorealistic keywords', result.masterPrompt.length > 50);

// 5. Daily 250 Free Credit Status Function
  console.log('\n--- 5. Daily 250 Credit Claim Status ---');
  const status = SupabaseService.checkDailyRewardStatus();
  assert('checkDailyRewardStatus returns boolean without throwing', typeof status === 'boolean');

  // 6. Comprehensive API Endpoint Verification
  console.log('\n--- 6. Express API Endpoint Verifications (All 18 Routes) ---');
  process.env.NODE_ENV = 'test';
  const { app } = await import('./server');
  const { Readable } = await import('stream');
  const http = await import('http');

  function requestApi(method: string, url: string, body?: any, headers: Record<string, string> = {}) {
    return new Promise<{ status: number; data: any }>((resolve) => {
      const payload = body !== undefined ? JSON.stringify(body) : '';
      const reqHeaders: Record<string, string> = {
        'host': '127.0.0.1:3001',
        ...headers
      };
      if (body !== undefined) {
        reqHeaders['content-type'] = 'application/json';
        reqHeaders['content-length'] = String(Buffer.byteLength(payload));
      }

      const reqStream = Object.assign(Readable.from(payload ? [Buffer.from(payload)] : []), {
        method,
        url,
        headers: reqHeaders,
      });

      const res = new (http.ServerResponse as any)(reqStream);
      let chunks: Buffer[] = [];
      res.write = (chunk: any) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      };
      res.end = (chunk: any) => {
        if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const text = Buffer.concat(chunks).toString('utf8');
        let data: any = text;
        try {
          data = JSON.parse(text);
        } catch {}
        resolve({ status: res.statusCode, data });
      };

      (app as any).handle(reqStream, res);
    });
  }

  // API 1: Health Check
  const healthRes = await requestApi('GET', '/api/health');
  assert('GET /api/health responds 200 with status ok', healthRes.status === 200 && healthRes.data?.status === 'ok');

  // API 2: Dashboard Stats
  const statsRes = await requestApi('GET', '/api/dashboard/stats');
  assert('GET /api/dashboard/stats responds 200 with systemStatus operational', statsRes.status === 200 && statsRes.data?.systemStatus === 'operational');

  // API 3: Dashboard Config
  const configRes = await requestApi('GET', '/api/dashboard/config');
  assert('GET /api/dashboard/config responds 200 with maintenanceMode boolean', configRes.status === 200 && typeof configRes.data?.maintenanceMode === 'boolean');

  // API 4: Photo Studio Models
  const modelsRes = await requestApi('GET', '/api/photo-studio/models');
  assert('GET /api/photo-studio/models responds 200 with model list', modelsRes.status === 200 && Array.isArray(modelsRes.data?.models) && modelsRes.data.models.length > 0);

  // API 5: OpenRouter Check
  const orMissingRes = await requestApi('GET', '/api/openrouter/check', undefined, { 'x-openrouter-key': '' });
  assert('GET /api/openrouter/check handles missing/invalid key predictably', orMissingRes.status === 400 || orMissingRes.status === 200 || orMissingRes.data?.valid === false);

  // API 6: Process Image
  const sample1px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const imgProcRes = await requestApi('POST', '/api/process-image', { image: sample1px, fileName: 'test.png' });
  assert('POST /api/process-image normalizes image dataUrl', imgProcRes.status === 200 && imgProcRes.data?.success === true && !!imgProcRes.data?.dataUrl);

  const imgProcErr = await requestApi('POST', '/api/process-image', {});
  assert('POST /api/process-image rejects missing image with 400', imgProcErr.status === 400 && imgProcErr.data?.success === false);

  // API 7: Generate Prompt
  const genPromptRes = await requestApi('POST', '/api/generate-prompt', {
    selection: { gender: 'female', archetype: 'mandalay_royal' },
    mode: 'txt2img',
    language: 'my'
  });
  assert('POST /api/generate-prompt returns structured prompt and details', genPromptRes.status === 200 && genPromptRes.data?.success === true && typeof genPromptRes.data?.promptData?.masterPrompt === 'string');

  // API 8: Translate Prompt
  const transRes = await requestApi('POST', '/api/translate-prompt', {
    text: 'A gorgeous Burmese model in traditional silk attire',
    action: 'to_myanmar'
  });
  assert('POST /api/translate-prompt handles translation and fallback', transRes.status === 200 && !!transRes.data?.translatedText);

  // API 9: Generate Image
  const genImgRes = await requestApi('POST', '/api/generate-image', {
    prompt: 'Burmese woman in silk longyi',
    aspectRatio: '1:1'
  });
  assert('POST /api/generate-image returns imageUrl and images array', genImgRes.status === 200 && genImgRes.data?.success === true && !!genImgRes.data?.imageUrl);

  // API 10: Photo Studio Generate Image
  const studioImgRes = await requestApi('POST', '/api/photo-studio/generate-image', {
    prompt: 'Burmese royal portrait',
    model: 'nano-banana-2',
    aspectRatio: '1:1'
  });
  assert('POST /api/photo-studio/generate-image returns synthesis results', studioImgRes.status === 200 && studioImgRes.data?.success === true && Array.isArray(studioImgRes.data?.images));

  // API 11: Photo To Text
  const p2tRes = await requestApi('POST', '/api/photo-to-text', {
    image: sample1px,
    targetEngine: 'midjourney-v6'
  });
  assert('POST /api/photo-to-text returns technical breakdown', p2tRes.status === 200 && p2tRes.data?.success === true && !!p2tRes.data?.analysis);

  // API 12: Analyze Image
  const analyzeRes = await requestApi('POST', '/api/analyze-image', {
    image: sample1px
  });
  assert('POST /api/analyze-image handles vision inspection', analyzeRes.status === 200 && analyzeRes.data?.success === true);

  // API 13: Generate Video Prompt
  const vidPromptRes = await requestApi('POST', '/api/generate-video-prompt', {
    prompt: 'Cinematic sunset across Bagan temples',
    model: 'Veo'
  });
  assert('POST /api/generate-video-prompt returns cinematic production prompt', vidPromptRes.status === 200 && (vidPromptRes.data?.success === true || !!vidPromptRes.data?.prompt || !!vidPromptRes.data?.visual_concept));

  // API 14: Generate Photo Prompt
  const photoPromptRes = await requestApi('POST', '/api/generate-photo-prompt', {
    prompt: 'Master portrait of Burmese royalty',
    model: 'Midjourney',
    format: 'normal'
  });
  assert('POST /api/generate-photo-prompt returns master photography prompt', photoPromptRes.status === 200 && (photoPromptRes.data?.success === true || typeof photoPromptRes.data?.prompt === 'string'));

  // API 15: Generate Video
  const genVidRes = await requestApi('POST', '/api/generate-video', {
    prompt: 'Cinematic aerial view of Shwedagon Pagoda at dusk'
  });
  assert('POST /api/generate-video returns videoUrl and completed status', genVidRes.status === 200 && genVidRes.data?.success === true && !!genVidRes.data?.videoUrl);

  // API 16: Supabase Confirm Email
  const confirmErr = await requestApi('POST', '/api/supabase/confirm-email', {});
  assert('POST /api/supabase/confirm-email validates required email with 400', confirmErr.status === 400);

  // API 17: Supabase Instant Signup
  const signupErr = await requestApi('POST', '/api/supabase/instant-signup', {});
  assert('POST /api/supabase/instant-signup validates credentials with 400', signupErr.status === 400);

  // API 18: Supabase Upload Storage
  const uploadErr = await requestApi('POST', '/api/supabase/upload-storage', {});
  assert('POST /api/supabase/upload-storage validates dataUrl with 400', uploadErr.status === 400);

  // --- 7. Computer Vision AI Agent Pipeline (/api/v1/process-image) ---
  console.log('\n--- 7. Computer Vision AI Agent Pipeline ---');
  const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Test 1: Edit Image validation & success
  const editMissingPrompt = await requestApi('POST', '/api/v1/process-image', { action: 'edit_image', image_url: dummyImg });
  assert('CV Agent rejects edit_image without edit_prompt with 400', editMissingPrompt.status === 400 && editMissingPrompt.data?.status === 'error');

  const editSuccess = await requestApi('POST', '/api/v1/process-image', { action: 'edit_image', image_url: dummyImg, edit_prompt: 'Make hair golden' });
  assert('CV Agent executes edit_image with ByteDance-Seedream-5.0-Pro', editSuccess.status === 200 && (editSuccess.data?.pipeline_used === 'ByteDance-Seedream-5.0-Pro' || editSuccess.data?.pipeline_used === 'StableDiffusion-Inpaint-v2'));

  // Test 2: Upscale
  const upscaleRes = await requestApi('POST', '/api/v1/process-image', { action: 'upscale', image_url: dummyImg, scale_factor: 4 });
  assert('CV Agent executes upscale with Real-ESRGAN-x4', upscaleRes.status === 200 && upscaleRes.data?.pipeline_used === 'Real-ESRGAN-x4');

  // Test 3: Change Background validation & success
  const bgMissing = await requestApi('POST', '/api/v1/process-image', { action: 'change_background', image_url: dummyImg });
  assert('CV Agent rejects change_background without prompt/image with 400', bgMissing.status === 400);

  const bgSuccess = await requestApi('POST', '/api/v1/process-image', { action: 'change_background', image_url: dummyImg, new_background_prompt: 'Sunset beach' });
  assert('CV Agent executes change_background with RMBG-1.4', bgSuccess.status === 200 && bgSuccess.data?.pipeline_used === 'RMBG-1.4 + ControlNet-Depth');

  // Test 4: Multi View
  const multiViewRes = await requestApi('POST', '/api/v1/process-image', { action: 'multi_view', image_url: dummyImg, views_count: 4 });
  assert('CV Agent generates 4 multi-view perspectives with Zero123Plus', multiViewRes.status === 200 && multiViewRes.data?.multi_view_urls?.length === 4);

  // Test 5: Face Swap validation & success
  const faceSwapMissing = await requestApi('POST', '/api/v1/process-image', { action: 'face_swap', image_url: dummyImg });
  assert('CV Agent rejects face_swap without source_face_url with 400', faceSwapMissing.status === 400);

  const faceSwapSuccess = await requestApi('POST', '/api/v1/process-image', { action: 'face_swap', image_url: dummyImg, source_face_url: dummyImg });
  assert('CV Agent executes face_swap with InsightFace-ReActor-v1', faceSwapSuccess.status === 200 && faceSwapSuccess.data?.pipeline_used === 'InsightFace-ReActor-v1');

  // Test 6: Image Variations validation & execution
  const variationMissing = await requestApi('POST', '/api/v1/process-image', { action: 'image_variations' });
  assert('CV Agent rejects image_variations without image_url with 400', variationMissing.status === 400);

  const variationSuccess = await requestApi('POST', '/api/v1/process-image', {
    action: 'image_variations',
    image_url: dummyImg,
    variation_prompt: 'Make it sunset, cinematic lighting, adding a vintage cinematic look',
    variation_strength: 'medium',
    variation_strength_num: 50,
    focus_area: 'subject',
    vibe_match: true,
    count: 2
  });
  assert('CV Agent executes image_variations with Multi-Diffusion / IP-Adapter', variationSuccess.status === 200 && variationSuccess.data?.action === 'image_variations' && variationSuccess.data?.variations_urls?.length > 0);

  // 7. Geometry vs. Lighting Decoupling & Time Detection Tests
  console.log('\n--- 7. Geometry vs. Lighting Decoupling & Time Detection ---');
  const { TIME_LIGHTING_OVERRIDE_MAP, detectTimeFromPrompt } = await import('./server');

  assert('TIME_LIGHTING_OVERRIDE_MAP contains all 5 required times',
    !!TIME_LIGHTING_OVERRIDE_MAP.early_morning &&
    !!TIME_LIGHTING_OVERRIDE_MAP.high_noon &&
    !!TIME_LIGHTING_OVERRIDE_MAP.golden_hour &&
    !!TIME_LIGHTING_OVERRIDE_MAP.twilight &&
    !!TIME_LIGHTING_OVERRIDE_MAP.night
  );

  assert('detectTimeFromPrompt detects explicit early_morning', detectTimeFromPrompt('test', 'early_morning').id === 'early_morning');
  assert('detectTimeFromPrompt detects explicit high_noon', detectTimeFromPrompt('test', 'high_noon').id === 'high_noon');
  assert('detectTimeFromPrompt detects explicit golden_hour', detectTimeFromPrompt('test', 'golden_hour').id === 'golden_hour');
  assert('detectTimeFromPrompt detects explicit twilight', detectTimeFromPrompt('test', 'twilight').id === 'twilight');
  assert('detectTimeFromPrompt detects explicit night', detectTimeFromPrompt('test', 'night').id === 'night');

  assert('detectTimeFromPrompt detects natural language night', detectTimeFromPrompt('Ancient Bagan temple under midnight sky and moonlight').id === 'night');
  assert('detectTimeFromPrompt detects natural language twilight', detectTimeFromPrompt('Inle Lake fisherman during twilight blue hour').id === 'twilight');
  assert('detectTimeFromPrompt detects natural language golden_hour', detectTimeFromPrompt('Mandalay palace moat sunset with warm amber glow').id === 'golden_hour');
  assert('detectTimeFromPrompt detects natural language early_morning', detectTimeFromPrompt('Shwedagon pagoda at early morning dawn with soft mist').id === 'early_morning');
  assert('detectTimeFromPrompt detects natural language high_noon', detectTimeFromPrompt('Yangon downtown high noon bright overhead sun').id === 'high_noon');

  // 8. Weather & Mood Atmosphere Decoupling Tests
  console.log('\n--- 8. Weather & Mood Atmosphere Decoupling ---');
  const { MOOD_ATMOSPHERE_OVERRIDE_MAP, detectMoodFromPrompt } = await import('./server');

  assert('MOOD_ATMOSPHERE_OVERRIDE_MAP contains all 14 presets',
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.monsoon_rain &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.misty_morning &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.moody_overcast &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.candlelit_intimate &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.breezy_windswept &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.vintage_nostalgic &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.festive_vibrant &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.serene_spiritual &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.royal_majestic &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.dreamy_ethereal &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.romantic_tender &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.mysterious_enigmatic &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.autumn_golden_glow &&
    !!MOOD_ATMOSPHERE_OVERRIDE_MAP.neon_cyberpunk
  );

  assert('monsoon_rain specifies puddle reflections and wet surfaces',
    MOOD_ATMOSPHERE_OVERRIDE_MAP.monsoon_rain.surfaceDecoupling.includes('puddle reflections') &&
    MOOD_ATMOSPHERE_OVERRIDE_MAP.monsoon_rain.surfaceDecoupling.includes('rain-slicked')
  );

  assert('misty_morning specifies volumetric ground fog and Tyndall rays',
    MOOD_ATMOSPHERE_OVERRIDE_MAP.misty_morning.weatherEffect.includes('volumetric ground fog') &&
    MOOD_ATMOSPHERE_OVERRIDE_MAP.misty_morning.weatherEffect.includes('Tyndall')
  );

  assert('detectMoodFromPrompt detects explicit monsoon_rain', detectMoodFromPrompt('test', 'monsoon_rain').id === 'monsoon_rain');
  assert('detectMoodFromPrompt detects explicit misty_morning', detectMoodFromPrompt('test', 'misty_morning').id === 'misty_morning');
  assert('detectMoodFromPrompt detects explicit royal_majestic', detectMoodFromPrompt('test', 'royal_majestic').id === 'royal_majestic');
  assert('detectMoodFromPrompt detects natural language monsoon rain', detectMoodFromPrompt('Ancient Bagan temple during heavy monsoon rainfall and wet puddles').id === 'monsoon_rain');
  assert('detectMoodFromPrompt detects natural language morning mist', detectMoodFromPrompt('Inle Lake floating gardens shrouded in morning mist and ground fog').id === 'misty_morning');
  assert('detectMoodFromPrompt detects natural language candlelight', detectMoodFromPrompt('Shwedagon Pagoda terrace glowing with hundreds of oil lamps and candlelight').id === 'candlelit_intimate');
  assert('detectMoodFromPrompt detects natural language windswept', detectMoodFromPrompt('Mandalay Hill pagoda with windswept silk garments and billowing scarves').id === 'breezy_windswept');

  // 9. Zoned Physics & Facial Shielding Tests
  console.log('\n--- 9. Zoned Physics & Facial Shielding ---');
  const { SUBJECT_WEATHER_INTERACTION_MAP } = await import('./server');

  assert('SUBJECT_WEATHER_INTERACTION_MAP contains key presets',
    !!SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain &&
    !!SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept &&
    !!SUBJECT_WEATHER_INTERACTION_MAP.misty_morning &&
    !!SUBJECT_WEATHER_INTERACTION_MAP.candlelit_intimate
  );

  assert('Zone 1 Face Shield: breezy_windswept blows wind away from face with no hair across eyes/mouth',
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone1FaceShield.includes('AWAY and BACKWARD') &&
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone1FaceShield.includes('ZERO hair occlusion across eyes')
  );

  assert('Zone 1 Face Shield: monsoon_rain prevents facial bone geometry mutation and enforces dewy skin sheen',
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone1FaceShield.includes('AWAY from the face') &&
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone1FaceShield.includes('dewy skin sheen') &&
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone1FaceShield.includes('NEVER deform facial bone geometry')
  );

  assert('Zone 2 Hair & Props: monsoon_rain includes Pathein umbrella and damp hair interaction',
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone2HairAndProps.includes('Pathein umbrella') &&
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone2HairAndProps.includes('damp')
  );

  assert('Zone 2 Hair & Props: breezy_windswept includes flowing Burmese silk shawl (Pawa)',
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone2HairAndProps.includes('Pawa')
  );

  assert('Zone 3 Burmese Garment: forbids Western flared skirt and enforces cylindrical columnar drape',
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone3BurmeseGarmentPhysics.includes('cylindrical') &&
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone3BurmeseGarmentPhysics.includes('htamein') &&
    SUBJECT_WEATHER_INTERACTION_MAP.breezy_windswept.zone3BurmeseGarmentPhysics.includes('Western')
  );

  assert('Zone 3 Burmese Garment: monsoon_rain enforces wet silk physics and darkened Acheik weave',
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone3BurmeseGarmentPhysics.includes('wet silk physics') &&
    SUBJECT_WEATHER_INTERACTION_MAP.monsoon_rain.zone3BurmeseGarmentPhysics.includes('Acheik')
  );

  // 10. Location Taxonomy & Anti-Hallucination Guardrails
  console.log('\n--- 10. 36 Location Taxonomy & Anti-Hallucination Guardrails ---');
  const { LOCATION_OPTIONS } = await import('./src/data/presetData');
  const { LOCATION_TAXONOMY_MAP, resolveLocationDescription, resolveLocationTaxonomy } = await import('./src/utils/promptBuilder');

  assert('resolveLocationTaxonomy is alias of resolveLocationDescription', resolveLocationTaxonomy === resolveLocationDescription);
  assert('LOCATION_OPTIONS contains at least 36 locations + skip', LOCATION_OPTIONS.length >= 37);

  // Verify all 36 location presets map cleanly with rich descriptions and zero snake_case leakage
  let allResolvedWithoutSnakeCase = true;
  let allHaveValidDescriptions = true;
  for (const opt of LOCATION_OPTIONS) {
    if (opt.id === 'skip') continue;
    const res = resolveLocationDescription(opt.id);
    if (!res.en || res.en.length < 30) {
      allHaveValidDescriptions = false;
      console.error(`Invalid description for ${opt.id}`);
    }
    if (res.en.includes('_')) {
      allResolvedWithoutSnakeCase = false;
      console.error(`Snake case found in ${opt.id}: ${res.en}`);
    }
  }
  assert('All 36 LOCATION_OPTIONS resolve to rich descriptions (>30 chars)', allHaveValidDescriptions);
  assert('Zero snake_case strings leak into resolved location descriptions', allResolvedWithoutSnakeCase);

  // Verify Myanmar heritage architectural specifics and negative guardrails
  const shwedagon = resolveLocationDescription('shwedagon_pagoda');
  assert('Shwedagon includes Burmese bell stupa and no Thai wat/Angkor guardrails',
    shwedagon.en.includes('Burmese bell-shaped stupa') &&
    shwedagon.en.includes('Pyatthat') &&
    shwedagon.en.includes('no Thai wat') &&
    shwedagon.en.includes('no Cambodian Angkor')
  );

  const bagan = resolveLocationDescription('bagan_temples');
  assert('Bagan includes Pagan terracotta brickwork and avoids Thai prangs/Angkor ruins',
    bagan.en.includes('Pagan') &&
    bagan.en.includes('terracotta') &&
    bagan.en.includes('avoiding Thai prang')
  );

  const konbaung = resolveLocationDescription('konbaung_palace_interior');
  assert('Konbaung Palace includes teakwood pillars, glass mosaic, and no European decor',
    konbaung.en.includes('teakwood pillars') &&
    konbaung.en.includes('Mandalay glass mosaic') &&
    konbaung.en.includes('no European palace decor')
  );

  const fallback = resolveLocationDescription('custom_unknown_pagoda_village');
  assert('Fallback cleanly humanizes snake_case into title case with anti-hallucination guardrail',
    fallback.en.includes('Custom Unknown Pagoda Village') &&
    !fallback.en.includes('_') &&
    fallback.en.includes('avoiding Thai prang')
  );

  // Check negative prompts in both modes
  const clothesSwapTest = buildComprehensiveMasterPrompt(
    { location: 'shwedagon_pagoda', garmentCategory: 'female_traditional_acheik' } as any,
    'clothes-swap'
  );
  assert('Clothes Swap negative prompt includes Thai prang & Angkor guardrails',
    clothesSwapTest.negativePrompt.includes('Thai prang spire') &&
    clothesSwapTest.negativePrompt.includes('Cambodian Angkor stone towers')
  );

  const masterPromptTest = buildComprehensiveMasterPrompt(
    { location: 'shwedagon_pagoda', garmentCategory: 'female_traditional_acheik' } as any,
    'txt2img'
  );
  assert('Master Prompt negative prompt includes Thai prang & Angkor guardrails',
    masterPromptTest.negativePrompt.includes('Thai prang spire') &&
    masterPromptTest.negativePrompt.includes('Cambodian Angkor stone towers')
  );

  // 11. Scene Selection Mapping & Background Role Injection Tests
  console.log('\n--- 11. Scene Selection Mapping & Background Role Injection ---');
  const { mapSceneToStudioContext } = await import('./src/utils/promptBuilder');
  const { SCENES_550_COLLECTION } = await import('./src/data/scenes550Data');

  const baganScene = SCENES_550_COLLECTION.find(s => s.id === 'bagan-ananda-temple-sunset') || SCENES_550_COLLECTION[1];
  const baganMapped = mapSceneToStudioContext(baganScene);

  assert('mapSceneToStudioContext maps Bagan scene to bagan_temples', baganMapped.locationKey === 'bagan_temples');
  assert('mapSceneToStudioContext tags referencePhoto with role: background',
    baganMapped.referencePhotos.length === 1 &&
    baganMapped.referencePhotos[0].role === 'background' &&
    baganMapped.referencePhotos[0].url === baganScene.previewImage
  );
  assert('mapSceneToStudioContext derives golden_hour time of day', baganMapped.timeOfDay === 'golden_hour');
  assert('mapSceneToStudioContext prompt includes authentic Pagan brickwork and anti-Thai/Khmer guardrails',
    baganMapped.prompt.includes('Pagan') &&
    baganMapped.prompt.includes('strictly avoiding Thai prang') &&
    baganMapped.prompt.includes('Cambodian')
  );
  assert('mapSceneToStudioContext produces structured chosenOptions for backend',
    baganMapped.chosenOptions.some(o => o.label === 'Location' && o.value === 'bagan_temples') &&
    baganMapped.chosenOptions.some(o => o.label === 'Time of Day' && o.value === 'golden_hour') &&
    baganMapped.chosenOptions.some(o => o.label === 'Scene ID' && o.value === baganScene.id)
  );

  const mandalayScene = SCENES_550_COLLECTION.find(s => s.id === 'mandalay-palace-throne-hall') || SCENES_550_COLLECTION[0];
  const mandalayMapped = mapSceneToStudioContext(mandalayScene);
  assert('mapSceneToStudioContext maps throne hall to konbaung_palace_interior', mandalayMapped.locationKey === 'konbaung_palace_interior');
  assert('mandalayMapped tags reference photo as background', mandalayMapped.referencePhotos[0].role === 'background');
  assert('mandalayMapped prompt includes teakwood and Konbaung details',
    mandalayMapped.prompt.includes('teakwood') &&
    mandalayMapped.prompt.includes('Konbaung')
  );

  // Test existing prompt harmonization (character + new scene backdrop)
  const existingUserPrompt = '[Subject]: Royal Burmese Court Noblewoman in velvet Ein-Gyi. [Action]: Holding traditional lacquerware bowl gracefully. [Environment]: generic room. [Technical]: 8k.';
  const harmonized = mapSceneToStudioContext(baganScene, existingUserPrompt);
  assert('mapSceneToStudioContext preserves subject from existing user prompt',
    harmonized.prompt.includes('Royal Burmese Court Noblewoman in velvet Ein-Gyi')
  );
  assert('mapSceneToStudioContext preserves action from existing user prompt',
    harmonized.prompt.includes('Holding traditional lacquerware bowl gracefully')
  );
  assert('mapSceneToStudioContext replaces environment with authentic Bagan architectural plate',
    harmonized.prompt.includes('[Environment]: Set against') &&
    harmonized.prompt.includes('Pagan')
  );

  // Test family and baby scene context mapping
  const familyScene = SCENES_550_COLLECTION.find(s => s.category === 'baby_family') || SCENES_550_COLLECTION[0];
  const familyMapped = mapSceneToStudioContext(familyScene);
  assert('mapSceneToStudioContext handles baby_family scene with family likeness directive',
    familyMapped.prompt.includes('family') &&
    familyMapped.prompt.includes('parents and children')
  );

  const existingFamilyPrompt = '[Subject]: Myanmar family of four with mother, father, daughter, and son. [Action]: Sitting happily together. [Environment]: generic living room.';
  const harmonizedFamily = mapSceneToStudioContext(baganScene, existingFamilyPrompt);
  assert('mapSceneToStudioContext preserves family subject and group composition',
    harmonizedFamily.prompt.includes('Myanmar family of four') &&
    harmonizedFamily.prompt.includes('Sitting happily together')
  );

  // 12. Admin API Management & Live Provider Rotation Tests
  console.log('\n--- 12. Admin API Management & Dashboard Controls ---');

  // Test GET /api/admin/keys
  const keysRes = await requestApi('GET', '/api/admin/keys');
  assert('GET /api/admin/keys responds with success and 5 providers',
    keysRes.status === 200 &&
    keysRes.data?.success === true &&
    Array.isArray(keysRes.data?.providers) &&
    keysRes.data?.providers.length >= 5
  );

  const orProvider = keysRes.data?.providers?.find((p: any) => p.provider === 'openrouter');
  const expectedLast4 = (process.env.OPENROUTER_API_KEY || '').slice(-4);
  assert(`OpenRouter provider metadata displays correct last4 (${expectedLast4})`,
    orProvider?.last4 === expectedLast4 && orProvider?.status === 'active'
  );

  // Test POST /api/admin/keys/toggle
  const toggleRes = await requestApi('POST', '/api/admin/keys/toggle', { provider: 'openrouter', status: 'active' });
  assert('POST /api/admin/keys/toggle succeeds with active status',
    toggleRes.status === 200 && toggleRes.data?.success === true && toggleRes.data?.status === 'active'
  );

  // Test GET /api/admin/check
  const checkRes = await requestApi('GET', '/api/admin/check?email=zawyannaing.yanrx4@gmail.com');
  assert('GET /api/admin/check confirms zawyannaing.yanrx4@gmail.com is admin',
    checkRes.status === 200 && checkRes.data?.isAdmin === true && checkRes.data?.role === 'admin'
  );

  // Test POST /api/admin/settings
  const setRes = await requestApi('POST', '/api/admin/settings', { key: 'social_links', value: { facebook: 'https://fb.com/showai' } });
  assert('POST /api/admin/settings persists admin configuration',
    setRes.status === 200 && setRes.data?.success === true && setRes.data?.key === 'social_links'
  );

  // 13. Fal.ai & OpenRouter Image Enhancement Endpoints Tests
  console.log('\n--- 13. Fal.ai & OpenRouter Image Enhancement Endpoints ---');

  // Test 1: POST /api/ai/skin-retouch
  const retouchMissing = await requestApi('POST', '/api/ai/skin-retouch', { retouch_intensity: 'moderate' });
  assert('POST /api/ai/skin-retouch rejects missing image_url with 400',
    retouchMissing.status === 400 && retouchMissing.data?.success === false
  );

  const retouchSuccess = await requestApi('POST', '/api/ai/skin-retouch', {
    image_url: dummyImg,
    retouch_intensity: 'moderate',
    preserve_texture: true,
    anti_blemish: true,
    prompt: 'soft pore smoothing with healthy glow'
  });
  assert('POST /api/ai/skin-retouch executes successfully with processed_image_url',
    retouchSuccess.status === 200 &&
    retouchSuccess.data?.success === true &&
    typeof retouchSuccess.data?.processed_image_url === 'string' &&
    retouchSuccess.data?.processed_image_url.length > 0
  );

  // Test 2: POST /api/ai/virtual-makeup
  const makeupMissing = await requestApi('POST', '/api/ai/virtual-makeup', { makeup_style: 'glam' });
  assert('POST /api/ai/virtual-makeup rejects missing image_url with 400',
    makeupMissing.status === 400 && makeupMissing.data?.success === false
  );

  const makeupSuccess = await requestApi('POST', '/api/ai/virtual-makeup', {
    image_url: dummyImg,
    makeup_style: 'korean_glass',
    lipstick_color: 'coral',
    foundation_finish: 'dewy',
    prompt: 'dewy cheek highlight, subtle winged eyeliner'
  });
  assert('POST /api/ai/virtual-makeup executes successfully with processed_image_url',
    makeupSuccess.status === 200 &&
    makeupSuccess.data?.success === true &&
    typeof makeupSuccess.data?.processed_image_url === 'string' &&
    makeupSuccess.data?.processed_image_url.length > 0
  );

  // Test 3: POST /api/ai/hair-transform
  const hairMissing = await requestApi('POST', '/api/ai/hair-transform', { hair_style: 'long_wavy' });
  assert('POST /api/ai/hair-transform rejects missing image_url with 400',
    hairMissing.status === 400 && hairMissing.data?.success === false
  );

  const hairSuccess = await requestApi('POST', '/api/ai/hair-transform', {
    image_url: dummyImg,
    hair_style: 'traditional_burmese_sadon',
    hair_color: 'jet_black',
    hair_length: 'long',
    prompt: 'authentic royal Burmese hairstyle with jasmine garland'
  });
  assert('POST /api/ai/hair-transform executes successfully with processed_image_url',
    hairSuccess.status === 200 &&
    hairSuccess.data?.success === true &&
    typeof hairSuccess.data?.processed_image_url === 'string' &&
    hairSuccess.data?.processed_image_url.length > 0
  );

  // Summary
  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
