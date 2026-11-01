import { WeddingTemplate } from './weddingStudioData';

// =============================================================================
// Wedding Detail Prompt Builder
// Expands a short wedding template into a professional, layered prompt with
// subject, wardrobe, jewelry, hair & makeup, set design, lighting, optics,
// color science, composition and quality control sections.
// =============================================================================

export type WeddingSubject = 'couple' | 'bride_solo' | 'groom_solo';
export type WeddingFraming = 'full_body' | 'three_quarter' | 'half_body' | 'close_up' | 'wide_environmental';
export type WeddingMood = 'romantic' | 'regal' | 'joyful' | 'cinematic' | 'editorial';
export type WeddingTimeOfDay = 'template' | 'golden_hour' | 'blue_hour' | 'night' | 'soft_overcast';
export type WeddingCamera = 'hasselblad_x2d' | 'sony_a1' | 'canon_r5' | 'leica_sl3' | 'fuji_gfx100';
export type WeddingColorGrade = 'kodak_portra' | 'fuji_pro400h' | 'warm_heritage' | 'clean_editorial' | 'moody_cinematic';
export type WeddingAspect = '4:5' | '2:3' | '3:4' | '1:1' | '16:9' | '9:16';
export type WeddingFormat = 'master' | 'flux' | 'midjourney' | 'sdxl' | 'negative';

export interface WeddingDetailOptions {
  subject: WeddingSubject;
  framing: WeddingFraming;
  mood: WeddingMood;
  timeOfDay: WeddingTimeOfDay;
  camera: WeddingCamera;
  colorGrade: WeddingColorGrade;
  aspectRatio: WeddingAspect;
  faceLock: boolean;
  thanaka: boolean;
  extraDetails: string;
}

export const DEFAULT_WEDDING_DETAIL_OPTIONS: WeddingDetailOptions = {
  subject: 'couple',
  framing: 'three_quarter',
  mood: 'romantic',
  timeOfDay: 'template',
  camera: 'hasselblad_x2d',
  colorGrade: 'kodak_portra',
  aspectRatio: '4:5',
  faceLock: true,
  thanaka: false,
  extraDetails: ''
};

// -----------------------------------------------------------------------------
// Option catalogs (EN prompt fragment + Burmese UI label)
// -----------------------------------------------------------------------------
interface OptionDef { labelEn: string; labelMm: string; prompt: string }

export const SUBJECT_OPTIONS: Record<WeddingSubject, OptionDef> = {
  couple: { labelEn: 'Couple', labelMm: 'စုံတွဲ', prompt: 'a Burmese bride and groom wedding couple' },
  bride_solo: { labelEn: 'Bride Solo', labelMm: 'သတို့သမီး တစ်ဦးတည်း', prompt: 'a single Burmese bride, solo bridal portrait' },
  groom_solo: { labelEn: 'Groom Solo', labelMm: 'သတို့သား တစ်ဦးတည်း', prompt: 'a single Burmese groom, solo groom portrait' }
};

export const FRAMING_OPTIONS: Record<WeddingFraming, OptionDef> = {
  full_body: { labelEn: 'Full Body', labelMm: 'တစ်ကိုယ်လုံး', prompt: 'full-length shot head to toe, showing the complete silhouette and the full sweep of the silk train' },
  three_quarter: { labelEn: '3/4 Body', labelMm: 'ဒူးအထက်', prompt: 'three-quarter length shot from knees up, balancing wardrobe detail and environment' },
  half_body: { labelEn: 'Half Body', labelMm: 'ခါးအထက်', prompt: 'waist-up medium shot emphasizing jewelry, embroidery and facial expression' },
  close_up: { labelEn: 'Close-Up', labelMm: 'မျက်နှာအနီးကပ်', prompt: 'intimate close-up portrait framing face and shoulders, jewelry and hair flowers in crisp focus' },
  wide_environmental: { labelEn: 'Wide Scene', labelMm: 'နောက်ခံကျယ်', prompt: 'wide environmental shot, subjects occupying one third of the frame with the grand setting dominating' }
};

export const MOOD_OPTIONS: Record<WeddingMood, OptionDef> = {
  romantic: { labelEn: 'Romantic', labelMm: 'ချစ်ခြင်းမေတ္တာ', prompt: 'tender romantic mood, soft affectionate gazes, gentle touch of hands' },
  regal: { labelEn: 'Regal', labelMm: 'တော်ဝင်ဆန်', prompt: 'regal dignified mood, upright royal posture, calm composed expressions' },
  joyful: { labelEn: 'Joyful', labelMm: 'ပျော်ရွှင်', prompt: 'joyful celebratory mood, genuine natural laughter, candid movement' },
  cinematic: { labelEn: 'Cinematic', labelMm: 'ရုပ်ရှင်ဆန်', prompt: 'cinematic storytelling mood, film-still atmosphere, emotional depth' },
  editorial: { labelEn: 'Editorial', labelMm: 'မဂ္ဂဇင်းကာဗာ', prompt: 'high-fashion bridal editorial mood, confident poised styling, magazine cover presence' }
};

export const TIME_OPTIONS: Record<WeddingTimeOfDay, OptionDef> = {
  template: { labelEn: 'Template Default', labelMm: 'Template အတိုင်း', prompt: '' },
  golden_hour: { labelEn: 'Golden Hour', labelMm: 'ရွှေရောင်ဆည်းဆာ', prompt: 'golden hour sunlight, warm low-angle sun with glowing rim light on hair and silk' },
  blue_hour: { labelEn: 'Blue Hour', labelMm: 'ညနေမှောင်ရီ', prompt: 'blue hour twilight, cool ambient sky balanced with warm practical lights' },
  night: { labelEn: 'Night Gala', labelMm: 'ညအခမ်းအနား', prompt: 'night-time gala ambience, warm candlelight and fairy lights with deep shadows' },
  soft_overcast: { labelEn: 'Soft Overcast', labelMm: 'အလင်းပျော့', prompt: 'soft overcast daylight acting as a giant diffuser, even flattering skin light' }
};

export const CAMERA_OPTIONS: Record<WeddingCamera, OptionDef> = {
  hasselblad_x2d: { labelEn: 'Hasselblad X2D 100C', labelMm: 'Hasselblad (Medium Format)', prompt: 'shot on Hasselblad X2D 100C medium format, XCD 90mm f/2.5 lens at f/2.8, ISO 100' },
  sony_a1: { labelEn: 'Sony A1 · 85mm f/1.4', labelMm: 'Sony A1 · 85mm', prompt: 'shot on Sony A1 with FE 85mm f/1.4 GM lens at f/1.8, creamy bokeh' },
  canon_r5: { labelEn: 'Canon R5 · 50mm f/1.2', labelMm: 'Canon R5 · 50mm', prompt: 'shot on Canon EOS R5 with RF 50mm f/1.2L lens at f/2, natural perspective' },
  leica_sl3: { labelEn: 'Leica SL3 · 75mm', labelMm: 'Leica SL3 · 75mm', prompt: 'shot on Leica SL3 with APO-Summicron 75mm f/2, signature Leica micro-contrast' },
  fuji_gfx100: { labelEn: 'Fujifilm GFX100 II', labelMm: 'Fujifilm GFX (Medium Format)', prompt: 'shot on Fujifilm GFX100 II with GF 110mm f/2 lens, medium format depth rendering' }
};

export const COLOR_GRADE_OPTIONS: Record<WeddingColorGrade, OptionDef> = {
  kodak_portra: { labelEn: 'Kodak Portra 400', labelMm: 'Kodak Portra (နွေးထွေး)', prompt: 'Kodak Portra 400 film color science, warm natural skin tones, gentle highlight roll-off, fine organic grain' },
  fuji_pro400h: { labelEn: 'Fuji Pro 400H', labelMm: 'Fuji 400H (ကြည်လင်ပေါ့ပါး)', prompt: 'Fuji Pro 400H airy pastel palette, soft mint shadows, luminous bright whites' },
  warm_heritage: { labelEn: 'Warm Heritage Gold', labelMm: 'ရွှေရောင် ရိုးရာ', prompt: 'warm heritage gold grade, rich amber midtones, deep teak browns, luxurious gold highlights' },
  clean_editorial: { labelEn: 'Clean Editorial', labelMm: 'သန့်ရှင်း Editorial', prompt: 'clean neutral editorial grade, true-to-life color accuracy, crisp whites, magazine retouching standard' },
  moody_cinematic: { labelEn: 'Moody Cinematic', labelMm: 'ရုပ်ရှင်ဆန် မှိုင်းညို့', prompt: 'moody cinematic teal-and-amber grade, lifted blacks, subtle halation around highlights' }
};

export const ASPECT_OPTIONS: WeddingAspect[] = ['4:5', '2:3', '3:4', '1:1', '16:9', '9:16'];

// -----------------------------------------------------------------------------
// Category-specific professional detail layers
// -----------------------------------------------------------------------------
interface CategoryProfile {
  brideWardrobe: string;
  groomWardrobe: string;
  jewelry: string;
  hairMakeup: string;
  setDesign: string;
  atmosphere: string;
  composition: string;
  mmSummary: string;
}

const CATEGORY_PROFILES: Record<WeddingTemplate['category'], CategoryProfile> = {
  'Royal Heritage': {
    brideWardrobe: 'bride in a hand-woven Mandalay acheik silk htamein with wave-pattern luntaya weave, fitted royal yinzi blouse with gold sequin embroidery, sweeping silk train, sheer gold-trimmed shawl draped over shoulders',
    groomWardrobe: 'groom in a matching acheik silk paso longyi, crisp white collarless shirt, embroidered taikpon jacket with gold buttons, traditional gaung baung silk headwrap',
    jewelry: 'heirloom 22k Burmese gold jewelry set: layered gold necklaces, Mogok ruby and Burmese jade pendants, gold bangles, ornate ear plugs, royal gold hairpins',
    hairMakeup: 'bride hair in a high traditional sadone bun adorned with fresh jasmine strings and gold hair ornaments, refined natural makeup with soft rose lips, luminous skin with visible natural pores',
    setDesign: 'carved teak pillars, gilded lotus motifs, antique lacquerware offering bowls, velvet drapery, ceremonial silver bowls with eugenia leaves',
    atmosphere: 'faint incense haze catching the light, sacred and stately ambience',
    composition: 'symmetrical centered composition framed by palace pillars, leading lines toward the couple',
    mmSummary: 'နန်းတွင်းဆန်သော အချိတ်ပိုးထဘီ၊ တိုက်ပုံ၊ ခေါင်းပေါင်း၊ ရွှေ/ပတ္တမြား လက်ဝတ်ရတနာနှင့် ကျွန်းသစ်ထွင်းထုပ်တန်းနောက်ခံ'
  },
  'Grand Ballroom': {
    brideWardrobe: 'bride in a modern luxury Burmese bridal gown: ivory silk htamein with hand-beaded crystal and pearl embroidery, structured fitted blouse, long cathedral-length tulle veil',
    groomWardrobe: 'groom in an ivory silk taikpon jacket with subtle jacquard pattern, champagne silk paso, polished gaung baung',
    jewelry: 'diamond and pearl bridal set, delicate diamond tiara, drop earrings, slim diamond bracelets',
    hairMakeup: 'sleek low chignon with pearl pins, flawless bridal makeup with soft glam eyes and glowing highlighted skin, natural skin texture preserved',
    setDesign: 'grand hotel ballroom with crystal chandeliers, white orchid and rose floral installations, mirrored aisle runner, candle pillars',
    atmosphere: 'sparkling bokeh from chandeliers and fairy lights, opulent celebration ambience',
    composition: 'centered aisle composition with deep perspective, chandeliers creating bokeh orbs in the upper frame',
    mmSummary: 'ခန်းမကြီး၏ မီးပဒေသာ၊ ပုလဲ/ကျောက်စိမ်း ပန်းထိုးထားသော ခေတ်ပေါ် မင်္ဂလာဝတ်စုံနှင့် စိန်လက်ဝတ်ရတနာ'
  },
  'Bagan Sunset': {
    brideWardrobe: 'bride in a flowing terracotta-gold silk htamein inspired by Bagan murals, light chiffon shawl moving in the breeze',
    groomWardrobe: 'groom in an earth-tone silk paso longyi with a cream taikpon jacket and woven gaung baung',
    jewelry: 'antique Bagan-style gold jewelry with hammered textures, amber and carnelian beads',
    hairMakeup: 'loose romantic side bun with fresh padauk or jasmine flowers, sun-kissed warm makeup, golden glowing skin',
    setDesign: 'ancient brick pagodas and temple spires across the Bagan plain, hot air balloons drifting on the horizon',
    atmosphere: 'warm dust haze and sun flare over the plains, timeless spiritual atmosphere',
    composition: 'subjects on a temple terrace or dirt path, pagoda silhouettes layered behind using rule of thirds',
    mmSummary: 'ပုဂံစေတီပုထိုးများ၊ ပူဖောင်းများနှင့် ဆည်းဆာအလင်းအောက်ရှိ မြေနီရောင်/ရွှေရောင် ပိုးဝတ်စုံ'
  },
  'Inle Lake': {
    brideWardrobe: 'bride in a hand-woven Inle lotus-fiber silk htamein in soft pastel tones, delicate lace blouse',
    groomWardrobe: 'groom in a lotus-silk paso with a light linen taikpon jacket and Shan-style headwrap',
    jewelry: 'fine silver filigree jewelry from Inthein artisans, pearl drop earrings',
    hairMakeup: 'braided crown with tiny white flowers, dewy fresh makeup, natural luminous skin',
    setDesign: 'traditional wooden long-tail boat on calm Inle Lake, stilt houses, floating gardens, Shan hills in the distance',
    atmosphere: 'morning mist over still water, mirror-like reflections, peaceful serene ambience',
    composition: 'couple seated in the boat with reflections filling the lower third, intimate negative space of water and sky',
    mmSummary: 'အင်းလေးကန်ပြင် ရေပေါ်လှေ၊ ကြာချည်ပိုးထည်၊ ငွေထည်လက်ဝတ်ရတနာနှင့် မနက်ခင်း မြူနှင်း'
  },
  'Floral Garden': {
    brideWardrobe: 'bride in a blush-pink silk htamein with hand-embroidered floral vines, airy organza shawl',
    groomWardrobe: 'groom in a soft sage silk paso with an ivory taikpon jacket and matching gaung baung',
    jewelry: 'rose gold and pearl jewelry, floral-motif earrings, delicate pearl bangles',
    hairMakeup: 'soft romantic half-up style with fresh garden roses and baby breath, rosy fresh makeup',
    setDesign: 'lush floral garden arch of roses, orchids and padauk blossoms, petal-covered stone pathway',
    atmosphere: 'floating flower petals, dappled sunlight through foliage, dreamy fairytale ambience',
    composition: 'couple framed by the floral arch with foreground blossoms softly out of focus',
    mmSummary: 'ပန်းခြံပန်းမုခ်ဦး၊ ပိတောက်/နှင်းဆီပန်းများ၊ ပန်းနုရောင် ပိုးဝတ်စုံနှင့် ပုလဲလက်ဝတ်ရတနာ'
  },
  'Beach Sunset': {
    brideWardrobe: 'bride in a lightweight ivory silk htamein with flowing chiffon overlay that moves in the sea breeze',
    groomWardrobe: 'groom in a breathable cream linen-silk paso with an open-collar white shirt',
    jewelry: 'minimal pearl and shell-inspired gold jewelry, fine anklet',
    hairMakeup: 'loose beach waves with a single frangipani flower, sun-glow natural makeup',
    setDesign: 'Ngapali beach with soft white sand, gentle turquoise waves, palm silhouettes',
    atmosphere: 'warm sunset sky in coral and gold, sea spray haze, wind-swept fabric motion',
    composition: 'silhouette-friendly horizon placement at lower third, waves leading into the frame',
    mmSummary: 'ငပလီကမ်းခြေ ဆည်းဆာ၊ လေတိုက်၍ လှုပ်ရှားနေသော ပိုးချည်ဝတ်စုံနှင့် ပုလဲလက်ဝတ်ရတနာ'
  },
  'Studio Editorial': {
    brideWardrobe: 'bride in a couture reinterpretation of the Burmese htamein: sculpted silk with architectural pleats, bold metallic acheik weave panels',
    groomWardrobe: 'groom in a tailored modern taikpon jacket with minimalist lines and a sleek silk paso',
    jewelry: 'statement couture gold jewelry, oversized sculptural earrings, layered collar necklace',
    hairMakeup: 'sleek sculpted bun with a single gold hairpin, high-fashion editorial makeup with defined brows, skin texture preserved',
    setDesign: 'seamless studio backdrop in deep tone, minimal set with one lacquerware prop',
    atmosphere: 'clean controlled studio air, graphic negative space',
    composition: 'magazine-cover composition with headroom for title text, strong graphic posing',
    mmSummary: 'မဂ္ဂဇင်းကာဗာ စတူဒီယို၊ ခေတ်ဆန်ဒီဇိုင်း ထဘီ/တိုက်ပုံနှင့် Couture ရွှေလက်ဝတ်ရတနာ'
  }
};

// -----------------------------------------------------------------------------
// Shared quality & negative directives
// -----------------------------------------------------------------------------
const FACE_LOCK_DIRECTIVE =
  'Identity lock: preserve 100% exact facial identity from the reference photo — bone structure, eye shape, nose, lips, skin tone and natural micro-texture; do not beautify, morph or stylize facial features.';

const QUALITY_DIRECTIVE =
  'ultra-detailed professional wedding photography, true-to-life skin texture with visible pores, accurate silk sheen and weave detail, sharp focus on eyes, natural anatomy and hands, 8k resolution';

const NEGATIVE_BASE =
  'western white wedding dress, Indian saree, Chinese qipao, Japanese kimono, Korean hanbok, bindi, cartoon, anime, 3d render, plastic skin, airbrushed face, over-smoothed skin, distorted face, asymmetrical eyes, extra fingers, deformed hands, extra limbs, blurry, low resolution, oversaturated, watermark, text, logo, cropped head, duplicate people';

// -----------------------------------------------------------------------------
// Builder
// -----------------------------------------------------------------------------
export interface WeddingDetailPromptResult {
  master: string;
  flux: string;
  midjourney: string;
  sdxl: string;
  negative: string;
  breakdownMm: string;
  wordCount: number;
}

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s,/g, ',').trim();

export function buildWeddingDetailPrompt(
  template: WeddingTemplate,
  opts: WeddingDetailOptions = DEFAULT_WEDDING_DETAIL_OPTIONS
): WeddingDetailPromptResult {
  const profile = CATEGORY_PROFILES[template.category];
  const subject = SUBJECT_OPTIONS[opts.subject];
  const framing = FRAMING_OPTIONS[opts.framing];
  const mood = MOOD_OPTIONS[opts.mood];
  const camera = CAMERA_OPTIONS[opts.camera];
  const grade = COLOR_GRADE_OPTIONS[opts.colorGrade];
  const time = TIME_OPTIONS[opts.timeOfDay];

  const isCouple = opts.subject === 'couple';
  const soloNoun = opts.subject === 'bride_solo' ? 'the bride' : 'the groom';
  const neutralize = (s: string) =>
    isCouple ? s : s.replace(/\bthe couple\b/gi, soloNoun).replace(/\bcouple\b/gi, soloNoun);

  // Strip the template's built-in camera clause so the selected camera is authoritative
  const snippet = template.promptSnippet.replace(/,?\s*shot on [^,]*(,[^,]*\blens\b[^,]*)?/gi, '').trim();
  // Couple snippets describe both people; in solo mode we rebuild from structured fields instead
  const sceneCore = isCouple ? snippet : `${template.setting}, ${template.lighting}`;

  // Wardrobe depends on who is in frame
  const wardrobeParts: string[] = isCouple ? [`signature attire: ${template.attire}`] : [];
  if (opts.subject !== 'groom_solo') wardrobeParts.push(profile.brideWardrobe);
  if (opts.subject !== 'bride_solo') wardrobeParts.push(profile.groomWardrobe);
  const wardrobe = wardrobeParts.join('; ');
  const moodPrompt = isCouple
    ? mood.prompt
    : mood.prompt.replace(/,?\s*gentle touch of hands/, '').replace(/affectionate gazes/, 'affectionate gaze toward camera');
  const composition = neutralize(profile.composition);

  const hairMakeup =
    opts.subject === 'groom_solo'
      ? 'groom neatly groomed hair, natural clean skin with real texture, no heavy retouching'
      : profile.hairMakeup;

  const thanaka = opts.thanaka && opts.subject !== 'groom_solo'
    ? 'delicate traditional thanaka paste applied in soft circular patterns on the bride\'s cheeks'
    : '';

  const pose = opts.subject === 'couple'
    ? template.pose
    : template.pose.replace(/couple|together|groom|bride/gi, '').trim() || 'graceful solo pose';

  const lighting = [template.lighting, time.prompt].filter(Boolean).join(', ');
  const extra = opts.extraDetails.trim();

  // ---- MASTER (structured, labeled sections) ----
  const sections: [string, string][] = [
    ['SCENE', `${template.titleEn} — ${subject.prompt}. ${sceneCore}`],
    ['SUBJECT & POSE', `${pose}; ${moodPrompt}`],
    ['WARDROBE', wardrobe],
    ['JEWELRY', profile.jewelry],
    ['HAIR & MAKEUP', [hairMakeup, thanaka].filter(Boolean).join('; ')],
    ['SET DESIGN', `${template.setting}; ${profile.setDesign}`],
    ['LIGHTING', lighting],
    ['ATMOSPHERE', profile.atmosphere],
    ['CAMERA & OPTICS', `${camera.prompt}; ${framing.prompt}`],
    ['COMPOSITION', composition],
    ['COLOR GRADE', grade.prompt],
    ['QUALITY', QUALITY_DIRECTIVE]
  ];
  if (extra) sections.push(['CUSTOM DETAILS', extra]);
  if (opts.faceLock) sections.unshift(['IDENTITY LOCK', FACE_LOCK_DIRECTIVE]);
  const master = sections.map(([k, v]) => `[${k}] ${clean(v)}`).join('\n');

  // ---- FLUX / natural prose ----
  const flux = clean(
    [
      opts.faceLock ? FACE_LOCK_DIRECTIVE : '',
      `A professional ${opts.mood} wedding photograph of ${subject.prompt} — ${template.titleEn}.`,
      `${sceneCore}.`,
      `Pose: ${pose}, ${moodPrompt}.`,
      `Wardrobe: ${wardrobe}.`,
      `Jewelry: ${profile.jewelry}.`,
      `Hair and makeup: ${hairMakeup}${thanaka ? `, ${thanaka}` : ''}.`,
      `The setting is ${template.setting}, with ${profile.setDesign}; ${profile.atmosphere}.`,
      `Lighting: ${lighting}.`,
      `${framing.prompt}, ${composition}.`,
      `${camera.prompt}. ${grade.prompt}.`,
      `${QUALITY_DIRECTIVE}.`,
      extra ? `Additional details: ${extra}.` : ''
    ].filter(Boolean).join(' ')
  );

  // ---- Midjourney ----
  const negativeShort = 'western wedding dress, saree, qipao, kimono, cartoon, plastic skin, distorted face, extra fingers, watermark, text';
  const midjourney = clean(
    `/imagine prompt: ${subject.prompt}, ${sceneCore}, ${pose}, ${moodPrompt}, ${wardrobe}, ${profile.jewelry}, ${hairMakeup}${thanaka ? `, ${thanaka}` : ''}, ${template.setting}, ${profile.setDesign}, ${profile.atmosphere}, ${lighting}, ${framing.prompt}, ${composition}, ${camera.prompt}, ${grade.prompt}, ${QUALITY_DIRECTIVE}${extra ? `, ${extra}` : ''}` +
      `${opts.faceLock ? ' --cref [REFERENCE_PHOTO_URL] --cw 100' : ''} --ar ${opts.aspectRatio} --style raw --v 6.1 --q 2 --s 200 --no ${negativeShort}`
  );

  // ---- SDXL weighted tags ----
  const sdxl = clean(
    [
      '(masterpiece, best quality, ultra-detailed:1.2)',
      '(professional Burmese wedding photography:1.3)',
      `(${subject.prompt}:1.2)`,
      isCouple ? `(${template.attire}:1.25)` : '',
      opts.subject !== 'groom_solo' ? '(acheik silk htamein, intricate luntaya weave:1.2)' : '',
      opts.subject !== 'bride_solo' ? '(taikpon jacket, silk paso, gaung baung:1.15)' : '',
      `(${profile.jewelry}:1.1)`,
      thanaka ? '(thanaka on cheeks:1.15)' : '',
      `(${template.setting}:1.1)`,
      `(${lighting}:1.1)`,
      moodPrompt,
      framing.prompt,
      camera.prompt,
      grade.prompt,
      '(realistic skin texture, visible pores:1.2)',
      '(sharp focus on eyes:1.1)',
      extra
    ].filter(Boolean).join(', ')
  );

  // ---- Negative ----
  const negative = NEGATIVE_BASE + (opts.faceLock ? ', changed identity, different face, face swap artifacts' : '');

  // ---- Burmese director breakdown ----
  const breakdownMm = [
    `၁။ ဇာတ်ကွက်: ${template.titleMm} — ${subject.labelMm}၊ ${mood.labelMm} ခံစားချက်ဖြင့်`,
    `၂။ ဝတ်စုံနှင့် အလှဆင်: ${profile.mmSummary}${thanaka ? '၊ သနပ်ခါး ပါးကွက်' : ''}`,
    `၃။ အလင်းအမှောင်: ${time.labelMm === 'Template အတိုင်း' ? 'Template မူရင်း အလင်းအတိုင်း' : time.labelMm}`,
    `၄။ ကင်မရာ: ${camera.labelMm}၊ ${framing.labelMm} ရိုက်ကွက်၊ ${opts.aspectRatio} အချိုး`,
    `၅။ အရောင်နှင့် အရည်အသွေး: ${grade.labelMm}၊ အသားအရေ သဘာဝအတိုင်း${opts.faceLock ? '၊ မျက်နှာ ၁၀၀% Lock' : ''}`
  ].join('\n');

  const wordCount = flux.split(/\s+/).length;

  return { master, flux, midjourney, sdxl, negative, breakdownMm, wordCount };
}
