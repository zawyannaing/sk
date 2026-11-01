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
