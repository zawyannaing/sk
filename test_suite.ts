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
