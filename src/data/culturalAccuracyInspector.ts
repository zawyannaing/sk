// =============================================================================
// AI Cultural Accuracy & Era Inspector Engine (သမိုင်းခေတ် ညီညွတ်မှု စစ်ဆေးသည့် AI)
// Rule-based heuristic analyzer and auto-fixer for Myanmar cultural visual prompts
// =============================================================================

export interface AccuracyIssue {
  id: string;
  category: 'anachronism' | 'era-mismatch' | 'foreign-attire' | 'textile-error' | 'anatomy-misrepresentation' | 'quality-token';
  severity: 'critical' | 'warning' | 'tip';
  titleMm: string;
  titleEn: string;
  descriptionMm: string;
  descriptionEn: string;
  detectedWord?: string;
  suggestionMm: string;
  suggestionEn: string;
}

export interface EraRule {
  eraId: 'bagan' | 'innwa' | 'toungoo' | 'konbaung' | 'yadanabon' | 'modern-traditional';
  nameMm: string;
  nameEn: string;
  century: string;
  keywords: string[];
  mandatoryElements: string[];
  forbiddenElements: string[];
  authenticTextiles: string[];
  authenticJewelry: string[];
}

export interface InspectionResult {
  score: number; // 0 to 100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeTitleMm: string;
  gradeTitleEn: string;
  detectedEra: string;
  detectedEraMm: string;
  issues: AccuracyIssue[];
  strengths: { titleMm: string; titleEn: string; detail: string }[];
  sanitizedPrompt: string;
}

// 1. Era definitions with positive and conflicting tokens
export const ERA_RULES: EraRule[] = [
  {
    eraId: 'bagan',
    nameMm: 'ပုဂံခေတ် (Bagan Era)',
    nameEn: 'Bagan Dynasty (9th - 13th Century)',
    century: '9th - 13th Century',
    keywords: ['bagan', 'pagan', 'ancient bagan', '11th century', 'anawrahta', 'kyansittha', 'ပုဂံခေတ်'],
    mandatoryElements: ['terracotta temple backdrops', 'earthy ochre and brick-red pigments', 'handwoven coarse cotton', 'antique unglazed gold beads'],
    forbiddenElements: ['acheik', 'luntaya', 'mandalay palace', 'victorian lace', 'nylon', 'sunglasses', 'modern umbrella'],
    authenticTextiles: ['Earthy unbleached cotton (pin-ni)', 'Hand-loomed plain silk with natural madder dyes', 'Indigo-dyed linen wraps'],
    authenticJewelry: ['Heavy terracotta and unpolished raw gold beads', 'Double-spiral earplugs (Nardwin)', 'Bagan floral tiara']
  },
  {
    eraId: 'innwa',
    nameMm: 'အင်းဝခေတ် (Innwa/Ava Era)',
    nameEn: 'Innwa / Ava Dynasty (14th - 16th Century)',
    century: '14th - 16th Century',
    keywords: ['innwa', 'ava', 'sagaing', 'အင်းဝခေတ်'],
    mandatoryElements: ['teak timber monastery aesthetics', 'classical Burmese hair buns', 'traditional cotton and silk mixes'],
    forbiddenElements: ['victorian collar', 'plastic', 'high modern acheik 100 shuttle', 'western makeup'],
    authenticTextiles: ['Simple warp-stripe silks', 'Sagaing raw silk', 'Handspun cotton sarongs'],
    authenticJewelry: ['Cast bronze bangles', 'Simple gold necklaces', 'Carnelian bead strands']
  },
  {
    eraId: 'toungoo',
    nameMm: 'တောင်ငူခေတ် (Toungoo Era)',
    nameEn: 'Toungoo Dynasty (16th - 18th Century)',
    century: '16th - 18th Century',
    keywords: ['toungoo', 'taungoo', 'bayinnaung', 'bago hanthawaddy', 'တောင်ငူခေတ်'],
    mandatoryElements: ['military armor elements', 'martial headdresses', 'rich gold embroidery', 'Hanthawaddy royal flair'],
    forbiddenElements: ['colonial lace', 'modern western suits', 'sunglasses'],
    authenticTextiles: ['Heavy crimson silk brocades', 'Embossed leather cuirass', 'Gold-leaf stenciled sash (Shwe-chi)'],
    authenticJewelry: ['Nine-strand military Salwe order', 'Ruby-inlaid signet rings', 'Gilded temple crests']
  },
  {
    eraId: 'konbaung',
    nameMm: 'ကုန်းဘောင်ခေတ် (Konbaung Era)',
    nameEn: 'Konbaung Golden Era (1752 - 1885)',
    century: '18th - 19th Century',
    keywords: ['konbaung', 'mindon', 'thibaw', 'amarapura', 'mandalay royal', 'maha-latta', 'ကုန်းဘောင်ခေတ်'],
    mandatoryElements: ['Luntaya Acheik waves', 'Maharlatta winged court dress', 'Royal Salwe sashes', 'Thazin orchid blooms', 'Mogok rubies and 24k repousse gold'],
    forbiddenElements: ['bagan terracotta frescoes', 't-shirt', 'sneakers', 'plastic sunglasses', 'wristwatches'],
    authenticTextiles: ['Amarapura 100-shuttle Luntaya Acheik wave silk', 'Kalaga Shwe-chi-htoe gold thread embroidery', 'Crimson velvet court mantles'],
    authenticJewelry: ['Royal 9 to 24-strand Salwe', 'Mogok pigeon-blood ruby chokers', 'Imperial green jadeite earplugs', 'Gold filigree lotus combs']
  },
  {
    eraId: 'yadanabon',
    nameMm: 'ရတနာပုံ / ကိုလိုနီခေတ်ဦး (Yadanabon / Late 19th C.)',
    nameEn: 'Yadanabon Late Royal & Early 20th C.',
    century: 'Late 19th - Early 20th Century',
    keywords: ['yadanabon', 'colonial burma', 'british burma', 'victorian burmese', 'ရတနာပုံခေတ်'],
    mandatoryElements: ['lace eingyi (sheer organdy/voile)', 'silk taikpon', 'high rolled chignon', 'velvet slippers'],
    forbiddenElements: ['bagan ancient warrior armor', 'modern smartphones', 't-shirts', 'jeans'],
    authenticTextiles: ['Imported Manchester sheer lace combined with Mandalay Acheik', 'Fine silk taikpon jackets', 'Pleated silk pasoe'],
    authenticJewelry: ['Gold fob watch chains', 'Diamond hairpins (Hsan-hto)', 'Pearl necklace clusters']
  }
];

// 2. Anachronistic and foreign keywords dictionary
const ANACHRONISM_PATTERNS = [
  { word: 'sunglasses', labelMm: 'မျက်မှန်အနက် (Modern Sunglasses)', adviceMm: 'သမိုင်းခေတ်/ရိုးရာတွင် နေကာမျက်မှန် မပါဝင်သင့်ပါ။ ဖယ်ရှားပေးပါမည်။' },
  { word: 'shades', labelMm: 'ခေတ်မီ နေကာမျက်မှန်', adviceMm: 'သမိုင်းခေတ်/ရိုးရာတွင် မပါဝင်သင့်ပါ။' },
  { word: 'wristwatch', labelMm: 'လက်ပတ်နာရီ (Wristwatch)', adviceMm: 'ခေတ်ဟောင်းပုံရိပ်တွင် လက်ပတ်နာရီအစား ရိုးရာရွှေလက်ကောက် ထည့်သွင်းသင့်ပါသည်။' },
  { word: 'smartwatch', labelMm: 'စမတ်နာရီ', adviceMm: 'ရှေးခေတ်ရိုးရာနှင့် လုံးဝ မအပ်စပ်ပါ။' },
  { word: 'sneakers', labelMm: 'ခေတ်မီ စနီကာဖိနပ် (Sneakers)', adviceMm: 'ရိုးရာကတ္တီပါဖိနပ် (Traditional velvet slippers) သို့ ပြောင်းသင့်ပါသည်။' },
  { word: 'high heels', labelMm: 'ဒေါက်မြင့်ဖိနပ် (High Heels)', adviceMm: 'မြန်မာ့ရိုးရာ ကတ္တီပါညှပ်ဖိနပ် (Velvet thong slippers) သို့ ပြောင်းသင့်ပါသည်။' },
  { word: 'jeans', labelMm: 'ဂျင်းဘောင်းဘီ (Jeans)', adviceMm: 'ရိုးရာပိုးပုဆိုး သို့မဟုတ် လုံချည်အစားထိုးသင့်ပါသည်။' },
  { word: 'denim', labelMm: 'ဂျင်းအထည် (Denim)', adviceMm: 'ပိုးချိတ် သို့မဟုတ် ချည်ချော အစားထိုးသင့်ပါသည်။' },
  { word: 't-shirt', labelMm: 'တီရှပ် (T-shirt)', adviceMm: 'ရိုးရာရင်ဖုံး သို့မဟုတ် ပိုးတိုက်ပုံ အင်္ကျီ အစားထိုးသင့်ပါသည်။' },
  { word: 'hoodie', labelMm: 'ခေါင်းစွပ်အင်္ကျီ', adviceMm: 'မြန်မာ့ရိုးရာနှင့် မအပ်စပ်ပါ။' },
  { word: 'tuxedo', labelMm: 'အနောက်တိုင်း တပ်ဆီဒို ဝတ်စုံ', adviceMm: 'မြန်မာ့ရိုးရာ မင်္ဂလာအခမ်းအနားတွင် ပိုးတိုက်ပုံနှင့် တောင်ရှည်ပုဆိုး ဝတ်ဆင်ရပါမည်။' },
  { word: 'kimono', labelMm: 'ဂျပန် ကီမိုနို (Kimono)', adviceMm: 'မြန်မာ့ရိုးရာ မဟာလတ်တာ သို့မဟုတ် ရင်ဖုံးအင်္ကျီ အစားထိုးသင့်ပါသည်။' },
  { word: 'hanbok', labelMm: 'ကိုရီးယား ဟန်ဘုတ် (Hanbok)', adviceMm: 'မြန်မာ့ရိုးရာ ချိတ်ထမီ နှင့် ရင်ဖုံး အစားထိုးသင့်ပါသည်။' },
  { word: 'sari', labelMm: 'အိန္ဒိယ ဆာရီ (Sari)', adviceMm: 'မြန်မာ့ရိုးရာ ထမီ/လုံချည် အစားထိုးသင့်ပါသည်။' },
  { word: 'qipao', labelMm: 'တရုတ် ချီပေါင်း (Qipao)', adviceMm: 'မြန်မာ့ရိုးရာ ရင်စေ့/ရင်ဖုံး အင်္ကျီ အစားထိုးသင့်ပါသည်။' },
  { word: 'cheongsam', labelMm: 'တရုတ် ချောင်ဆန် (Cheongsam)', adviceMm: 'မြန်မာ့ရိုးရာ အင်္ကျီ အစားထိုးသင့်ပါသည်။' },
  { word: 'anime', labelMm: 'အန်နီမေး ကာတွန်းဟန် (Anime Style)', adviceMm: 'ရုပ်ရှင်အဆင့် မှန်ကန်သော အလင်းအမှောင်ဓာတ်ပုံဆန်မှု ပျက်စီးစေပါသည်။' },
  { word: 'cartoon', labelMm: 'ကာတွန်းဆန်မှု (Cartoonish)', adviceMm: 'Photorealistic စစ်စစ် ဖြစ်စေရန် မပါသင့်ပါ။' },
  { word: 'plastic', labelMm: 'ပလတ်စတစ် (Plastic)', adviceMm: 'ကြေး၊ ရွှေ၊ ငွေ၊ သစ်သား သို့မဟုတ် ယွန်းထည်များသာ သုံးသင့်ပါသည်။' },
  { word: 'polyester', labelMm: 'နိုင်လွန်/ပိုလီယက်စတာ', adviceMm: 'သဘာဝ မြန်မာ့ပိုးစစ်စစ် (Raw mulberry silk) သို့ ပြောင်းသင့်ပါသည်။' }
];

// 3. Cultural positive anchor keywords that increase fidelity
const AUTHENTIC_ANCHORS = [
  { pattern: /acheik|luntaya/i, titleMm: 'လွန်းရာကျော် ချိတ်ထည်', titleEn: 'Luntaya Acheik Weave', detail: 'Authentic Burmese multi-shuttle undulating wave patterns correctly specified.' },
  { pattern: /thazin/i, titleMm: 'သဇင်ပန်းခွေ', titleEn: 'Royal Thazin Orchid', detail: 'Culturally revered Bulbophyllum auricomum orchid crown correctly integrated.' },
  { pattern: /salwe|sal-we/i, titleMm: 'ရွှေစလွယ် ရာထူးတံဆိပ်', titleEn: 'Golden Salwe Orders', detail: 'Authentic royal insignia cross-sash appropriately positioned.' },
  { pattern: /taikpon|taik-pon/i, titleMm: 'မြန်မာ့ရိုးရာ ပိုးတိုက်ပုံ', titleEn: 'Burmese Silk Taikpon', detail: 'Collarless Burmese formal jacket with traditional cloth frog buttons.' },
  { pattern: /htamein|htamei/i, titleMm: 'မြန်မာ့ရင်ဖုံး ချိတ်ထမီ', titleEn: 'Burmese Htamein Longyi', detail: 'Graceful traditional wrap skirt with authentic folds.' },
  { pattern: /mogok|ruby|jadeite/i, titleMm: 'မိုးကုတ် ပတ္တမြားနှင့် ကျောက်စိမ်း', titleEn: 'Mogok Rubies & Jadeite', detail: 'World-famous authentic Myanmar unheated pigeon-blood rubies and jadeite.' },
  { pattern: /padauk/i, titleMm: 'ရွှေဝါရောင် ပိတောက်ပန်း', titleEn: 'Golden Padauk Blossoms', detail: 'National floral symbol of April Thingyan renewal.' },
  { pattern: /shwedagon|bagan|inle/i, titleMm: 'သမိုင်းဝင် ယဉ်ကျေးမှု နောက်ခံ', titleEn: 'Heritage Geographical Setting', detail: 'Grounds the visual firmly in authentic Myanmar sacred architecture.' }
];

/**
 * Main Inspector Function
 */
export function inspectCulturalAccuracy(prompt: string): InspectionResult {
  const issues: AccuracyIssue[] = [];
  const strengths: { titleMm: string; titleEn: string; detail: string }[] = [];
  const lowerPrompt = prompt.toLowerCase();

  // 1. Detect Era
  let detectedEra = 'Contemporary Traditional (ခေတ်သစ် မြန်မာ့ရိုးရာ)';
  let detectedEraMm = 'ခေတ်သစ် မြန်မာ့ရိုးရာ မင်္ဂလာ';
  let matchedRule: EraRule | null = null;

  for (const rule of ERA_RULES) {
    const hits = rule.keywords.some(kw => lowerPrompt.includes(kw));
    if (hits) {
      matchedRule = rule;
      detectedEra = rule.nameEn;
      detectedEraMm = rule.nameMm;
      break;
    }
  }

  // 2. Check for Anachronisms and Foreign Clashes
  for (const ana of ANACHRONISM_PATTERNS) {
    if (lowerPrompt.includes(ana.word)) {
      issues.push({
        id: `ana-${ana.word}`,
        category: 'anachronism',
        severity: 'critical',
        titleMm: `မသင့်လျော်သော ခေတ်လွန်ပစ္စည်း: "${ana.word}"`,
        titleEn: `Anachronistic or Foreign Element: "${ana.word}"`,
        descriptionMm: ana.adviceMm,
        descriptionEn: `Found modern or conflicting non-Burmese token "${ana.word}". This breaks authenticity in AI visual rendering.`,
        detectedWord: ana.word,
        suggestionMm: `"${ana.word}" ကို ဖယ်ရှားပြီး သင့်လျော်သော မြန်မာ့ရိုးရာ အသုံးအနှုန်းဖြင့် အစားထိုးပါ`,
        suggestionEn: `Remove "${ana.word}" and substitute with an authentic historical counterpart.`
      });
    }
  }

  // 3. Era-Specific Cross-Check
  if (matchedRule) {
    // Check forbidden elements for this era
    for (const forbidden of matchedRule.forbiddenElements) {
      if (lowerPrompt.includes(forbidden.toLowerCase())) {
        issues.push({
          id: `era-conflict-${forbidden}`,
          category: 'era-mismatch',
          severity: 'warning',
          titleMm: `ခေတ်ကာလ မကိုက်ညီမှု: "${forbidden}" သည် ${matchedRule.nameMm} တွင် မရှိနိုင်ပါ`,
          titleEn: `Era Inconsistency: "${forbidden}" did not exist in ${matchedRule.nameEn}`,
          descriptionMm: `${matchedRule.nameMm} ၏ သမိုင်းကြောင်းအရ "${forbidden}" သည် အခြားခေတ်သို့မဟုတ် ခေတ်သစ်ပစ္စည်း ဖြစ်နေပါသည်။`,
          descriptionEn: `Historical records for ${matchedRule.nameEn} indicate "${forbidden}" is historically inaccurate for this specific dynasty.`,
          detectedWord: forbidden,
          suggestionMm: `${matchedRule.authenticTextiles[0]} သို့မဟုတ် ${matchedRule.authenticJewelry[0]} ကိုသာ အသုံးပြုသင့်ပါသည်။`,
          suggestionEn: `Replace with authentic ${matchedRule.nameEn} period elements like ${matchedRule.authenticTextiles[0]}.`
        });
      }
    }
  }

  // 4. Check Authentic Strengths
  for (const anchor of AUTHENTIC_ANCHORS) {
    if (anchor.pattern.test(lowerPrompt)) {
      strengths.push({
        titleMm: anchor.titleMm,
        titleEn: anchor.titleEn,
        detail: anchor.detail
      });
    }
  }

  // 5. Check Facial / Ethnic Integrity Directive
  const hasFacialToken = /burmese facial|southeast asian|golden skin|myanmar face|burmese beauty/i.test(lowerPrompt);
  if (!hasFacialToken) {
    issues.push({
      id: 'missing-burmese-facial-directive',
      category: 'anatomy-misrepresentation',
      severity: 'warning',
      titleMm: 'မြန်မာ့မျက်နှာသွင်ပြင် မူရင်း Token လိုအပ်နေခြင်း',
      titleEn: 'Missing Explicit Burmese Facial Proportion Directives',
      descriptionMm: 'AI မော်ဒယ်များသည် တိကျသော သတ်မှတ်ချက် မပါပါက အခြားအာရှ သို့မဟုတ် အနောက်တိုင်း မျက်နှာပေါက်များ ရောထွေးဆွဲတတ်ပါသည်။',
      descriptionEn: 'Without explicit directives, image models often hallucinate pan-Asian anime or Westernized facial structures instead of authentic Burmese bone structure.',
      suggestionMm: '"authentic Burmese facial bone structure, gentle Burmese smile, warm honey-golden skin tone" ထည့်သွင်းပါ',
      suggestionEn: 'Inject "authentic Burmese facial bone structure, gentle Burmese smile, warm honey-golden skin tone".'
    });
  }

  // 6. Calculate Final Score (0 - 100)
  let baseScore = 95;
  for (const issue of issues) {
    if (issue.severity === 'critical') baseScore -= 22;
    else if (issue.severity === 'warning') baseScore -= 10;
    else if (issue.severity === 'tip') baseScore -= 4;
  }
  // Bonus for authentic strengths
  baseScore += Math.min(strengths.length * 4, 15);
  const score = Math.max(10, Math.min(100, baseScore));

  // Determine Grade
  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'A';
  let gradeTitleMm = 'ထူးချွန်အဆင့် (High Cultural Fidelity)';
  let gradeTitleEn = 'Tier A - High Cultural Fidelity';

  if (score >= 94) {
    grade = 'S';
    gradeTitleMm = 'တော်ဝင်အဆင့် စံပြတိကျမှု (Royal Burmese Perfection)';
    gradeTitleEn = 'Tier S - Royal Imperial Authenticity';
  } else if (score >= 82) {
    grade = 'A';
    gradeTitleMm = 'အထူးတိကျမှု (High Cultural Fidelity)';
    gradeTitleEn = 'Tier A - High Cultural Fidelity';
  } else if (score >= 68) {
    grade = 'B';
    gradeTitleMm = 'အလယ်အလတ် (Minor Cultural Anachronisms)';
    gradeTitleEn = 'Tier B - Moderate Compliance (Minor Inconsistencies)';
  } else if (score >= 50) {
    grade = 'C';
    gradeTitleMm = 'ပြုပြင်ရန်လိုအပ် (Significant Inaccuracies)';
    gradeTitleEn = 'Tier C - Needs Calibration';
  } else {
    grade = 'D';
    gradeTitleMm = 'သမိုင်းနှင့် ရိုးရာလွဲချော်မှု များပြားနေခြင်း (Severe Hallucinations)';
    gradeTitleEn = 'Tier D - Critical Anachronisms Detected';
  }

  // 7. Generate Sanitized Auto-Fixed Prompt
  let sanitized = prompt;
  // Remove bad words
  for (const ana of ANACHRONISM_PATTERNS) {
    const reg = new RegExp(`\\b${ana.word}\\b`, 'gi');
    sanitized = sanitized.replace(reg, '');
  }

  // Clean double spaces or stray commas
  sanitized = sanitized.replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ').trim();

  // If missing facial directive, inject it
  if (!hasFacialToken) {
    sanitized += ', authentic Burmese facial features with elegant high cheekbones, gentle serene gaze, warm honey-golden skin tone, 100% natural Myanmar ethnicity';
  }

  // Add historical quality badge
  sanitized += ', 100% historically verified Burmese cultural accuracy, authentic textile weave texture, museum archive preservation quality';

  return {
    score,
    grade,
    gradeTitleMm,
    gradeTitleEn,
    detectedEra,
    detectedEraMm,
    issues,
    strengths,
    sanitizedPrompt: sanitized
  };
}
