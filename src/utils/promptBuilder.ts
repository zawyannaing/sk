import { MatrixSelection, AppMode } from '../types';
import { HEIGHT_OPTIONS, WEIGHT_OPTIONS, GARMENT_OPTIONS, CULTURAL_PROP_PRESETS, ETHNICITY_OPTIONS } from '../data/presetData';

// High-Fidelity Burmese Cultural & Optical Taxonomy Maps for 100% AI Accuracy
const GARMENT_TAXONOMY: Record<string, { en: string; mm: string }> = {
  acheik_silk: {
    en: 'authentic Mandalay Luntaya Acheik (100-shuttle wave-pattern) handwoven royal silk htamein longyi and fitted yinzi silk blouse with shimmering gold Zari metallic thread embroidery',
    mm: 'မန္တလေး လွန်းရာကျော် ပိုးချိတ်ထဘီနှင့် ရင်စေ့ပိုးအင်္ကျီ (ရွှေချည်ထိုး အနားကွပ် အသေးစိတ်)'
  },
  traditional_myanmar: {
    en: 'authentic Mandalay Luntaya Acheik (100-shuttle interlocking wave-pattern) handwoven royal mulberry silk htamein longyi and tailored Burmese yinzi silk blouse with shimmering gold Zari thread embroidery',
    mm: 'မြန်မာ့ရိုးရာ လွန်းရာကျော် ပိုးချိတ်ထဘီနှင့် ရင်ဖုံး/ရင်စေ့ ပိုးအင်္ကျီ'
  },
  konbaung_royal: {
    en: 'regal Konbaung Dynasty royal court ceremonial attire (Maha Lata), structured winged shoulder epaulets (Dahat-kway), heavy crimson velvet embroidered with gold bullion thread, ruby and emerald filigree torque necklace',
    mm: 'ကုန်းဘောင်ခေတ် နန်းတွင်း မဟာလတ္တ ဝတ်စုံတော်၊ ဒဟတ်ကွေး ပခုံးတောင်ပံနှင့် ရွှေချည်ထိုး ကတ္တီပါ နန်းဝတ်တန်ဆာ'
  },
  traditional_myanmar_royal: {
    en: 'opulent Mandalay Yadanabon Konbaung royal dynasty court attire, structured gold-embroidered velvet bodice with winged royal lapels, 100-shuttle wave Acheik silk train, encrusted with Mogok rubies and gold bullion',
    mm: 'မန္တလေး ရတနာပုံ နန်းတွင်း မင်းဝတ်မင်းစားနှင့် ရွှေချည်ထိုး ပိုးချိတ်ဝတ်စုံကြီး'
  },
  myanmar_taingmathea: {
    en: 'formal Myanmar Taingmathea silk jacket (Taikpon) paired with handwoven Amarapura Acheik silk Paso longyi and traditional silk Gaung Baung headwear',
    mm: 'မြန်မာ့ရိုးရာ တိုင်မသီ ပိုးတိုက်ပုံ၊ ပိုးပုဆိုး/ထဘီနှင့် ခေါင်းပေါင်း'
  },
  amarapura_silk: {
    en: 'traditional Amarapura hand-loomed pure mulberry silk longyi and sheer organza lace blouse with delicate pearl buttons and matching silk shawl',
    mm: 'အမရပူရ လက်ရက် ပိုးစစ်စစ် လုံချည်၊ ဇာပိုးအင်္ကျီနှင့် ပုလဲကြယ်သီး ပိုးပဝါ'
  },
  amarapura_luntaya_acheik: {
    en: 'masterpiece Amarapura 100-shuttle Luntaya Acheik handwoven mulberry silk longyi with undulating wave motifs, paired with a sheer organza silk blouse and trailing silk shawl',
    mm: 'အမရပူရ လွန်းရာကျော် ပိုးချိတ်ထဘီစစ်စစ်နှင့် ပိုးဇာအင်္ကျီ'
  },
  bagan_royal_yinzi: {
    en: 'ancient Bagan dynasty royal terracotta and gold handwoven silk Yinzi bodice wrap, pleated lotus-silk Htamein skirt, and trailing gossamer shoulder shawl',
    mm: 'ပုဂံခေတ် ရင်စည်း ပိုးထဘီနှင့် ရွှေချည်ထိုး ပုဝါ'
  },
  myanmar_bridal_gold: {
    en: 'luxurious traditional Myanmar royal bridal ensemble, champagne-gold Zardosi embroidered silk Ein-Gyi blouse with pearl buttons, full-length ruby and gold sequined Luntaya Acheik bridal train',
    mm: 'မြန်မာ့ရိုးရာ သတို့သမီး ရွှေချည်ထိုး ချိတ်ဝတ်စုံကြီး'
  },
  inle_lotus_silk_attire: {
    en: 'rare handcrafted Inle Lake sacred lotus-stem fiber tunic and natural raw silk woven longyi with organic earthy texture and delicate lotus-petal collar',
    mm: 'အင်းလေး ကြာချည် ပိုးဝတ်စုံနှင့် သဘာဝလက်ရက် လုံချည်'
  },
  colonial_rangoon_lace: {
    en: 'heritage Colonial-era Yangon sheer white French lace Yin-Phone blouse fastened with South Sea pearl buttons, paired with an iridescent peacock-motif silk Htamein',
    mm: 'ကိုလိုနီခေတ် ရန်ကုန် ဇာအင်္ကျီ၊ ပုလဲကြယ်သီးနှင့် ပိုးထဘီ'
  },
  modern_silk_yin_phone: {
    en: 'contemporary tailored Burmese sculpted silk Yin-Phone blouse with minimalist pastel Luntaya Acheik silk longyi, modern haute-couture Myanmar silhouette',
    mm: 'ခေတ်မီ ပိုးရင်ဖုံးအင်္ကျီနှင့် ပါစတဲလ် ပိုးချိတ်ထဘီ'
  },
  shan_traditional: {
    en: 'authentic Shan traditional royal brocade jacket and woven striped longyi in pastel rose and gold, intricate silver belt ornament',
    mm: 'ရှမ်းရိုးရာ ပိုးဖဲကော်ဇောအဆင် ဝတ်စုံနှင့် ငွေခါးပတ် အဆင်တန်ဆာ'
  },
  shan_ethnic_attire: {
    en: 'authentic Shan traditional royal brocade cross-collar jacket and handwoven Shan silk longyi/trousers with silver waist belt and embroidered shoulder bag',
    mm: 'ရှမ်းရိုးရာ ပိုးဖဲဝတ်စုံ၊ ငွေခါးပတ်နှင့် ရှမ်းလွယ်အိတ်'
  },
  kachin_traditional: {
    en: 'authentic Kachin Jinghpaw ceremonial attire, black velvet jacket adorned with rows of embossed silver discs (ri-nawn) and vibrant red-and-gold handwoven geometric wool skirt',
    mm: 'ကချင်ရိုးရာ ငွေပြားစီ ကတ္တီပါအင်္ကျီနှင့် ရိုးရာဂျပ်ခုတ် အဆင်ထဘီ'
  },
  kachin_ethnic_attire: {
    en: 'authentic Kachin Jinghpaw ceremonial attire, black velvet jacket adorned with rows of embossed silver coin medallions (ri-nawn) and vibrant red-and-gold handloom geometric wool longyi',
    mm: 'ကချင်ရိုးရာ ငွေမောင်းတန်ဆာဆင် ကတ္တီပါအင်္ကျီနှင့် ဂျပ်ခုတ်ထဘီ'
  },
  kayin_traditional: {
    en: 'authentic Kayin (Karen) traditional handwoven tunic (Hsin-thone) with intricate red, white, and ikat embroidery threads',
    mm: 'ကရင်ရိုးရာ လက်ရက် သင်တိုင်းဝတ်စုံနှင့် ရိုးရာအဆင်ဖော် ချည်ထိုးလက်ရာ'
  },
  karen_ethnic_attire: {
    en: 'authentic Kayin (Karen) traditional handwoven red-and-white striped Hsin-thone tunic with intricate woven ikat sarong and fringed headscarf',
    mm: 'ကရင်ရိုးရာ လက်ရက် သင်တိုင်းဝတ်စုံနှင့် ရိုးရာအဆင် ထဘီ/ပုဆိုး'
  },
  chin_ethnic_attire: {
    en: 'authentic Chin traditional ornate geometric diamond-weave handloom textile wrap and ceremonial tunic with traditional beadwork',
    mm: 'ချင်းရိုးရာ ဂျပ်ခုတ်အဆင် ဝတ်စုံနှင့် ရိုးရာခြုံထည်'
  },
  mon_traditional: {
    en: 'authentic Mon traditional crimson checkered handwoven longyi and pristine white lace bodice with golden hairpin and shawl',
    mm: 'မွန်ရိုးရာ အနီရောင် အကွက်စိပ် လက်ရက်ထဘီနှင့် အဖြူရောင် ဇာအင်္ကျီ'
  },
  mon_ethnic_attire: {
    en: 'authentic Mon traditional crimson-and-gold checkered handwoven silk longyi and fitted white lace blouse with Hinthar golden brooch and shoulder sash',
    mm: 'မွန်ရိုးရာ အနီရောင် လက်ရက်ပိုးထဘီနှင့် အဖြူရောင် ဇာအင်္ကျီ'
  },
  rakhine_traditional: {
    en: 'authentic Rakhine royal silk attire with gold-threaded weave and traditional Mrauk-U era gold filigree jewelry',
    mm: 'ရခိုင်ရိုးရာ ရွှေချည်ထိုး ပိုးဝတ်စုံနှင့် မြောက်ဦးခေတ် ရွှေပန်းထိမ် လက်ဝတ်ရတနာ'
  },
  rakhine_ethnic_attire: {
    en: 'authentic Rakhine Mrauk-U heritage handwoven Acheik silk longyi/pasoe with royal gold-threaded motifs and traditional lace bodice',
    mm: 'ရခိုင်ရိုးရာ မြောက်ဦးဟန် လက်ရက်ပိုးဝတ်စုံ'
  },
  kayah_ethnic_attire: {
    en: 'authentic Kayah traditional crimson-and-black handwoven breast-wrap tunic, draped cape, and traditional lacquered cotton leg rings',
    mm: 'ကယားရိုးရာ လက်ရက်ဝတ်စုံနှင့် ခြေပတ်ကွင်း'
  }
};

const LOCATION_TAXONOMY: Record<string, { en: string; mm: string }> = {
  bagan_pagoda: {
    en: 'ancient Bagan archaeological sanctuary at sunrise, weathered 11th-century terracotta brick stupas receding into golden morning mist, warm atmospheric dust motes',
    mm: 'ပုဂံ ရှေးဟောင်းစေတီပုထိုးများနှင့် နံနက်ခင်း ရွှေရောင်မြူခိုးဝေသော ရှုခင်း'
  },
  shwedagon_pagoda: {
    en: 'sacred marble platform of Shwedagon Pagoda in Yangon, towering gold-leaf stupa shimmering softly in background bokeh, warm oil-lamp reflections on polished white marble',
    mm: 'ရန်ကုန် ရွှေတိဂုံစေတီတော် ရင်ပြင်တော်၊ ရွှေသင်္ကန်းရောင်ပြန်နှင့် စကျင်ကျောက်သား နောက်ခံ'
  },
  mandalay_palace: {
    en: 'historic Mandalay Royal Palace pavilion, intricately carved golden teakwood pillars, vermilion lacquered colonnade, dramatic shafts of warm sunlight',
    mm: 'မန္တလေး နန်းတော် ကျွန်းသစ်ပန်းပုတိုင်များနှင့် ဟင်္သာပြဒါးရောင် နန်းတွင်းဆောင်'
  },
  inle_lake: {
    en: 'serene Inle Lake misty waters at dawn, traditional wooden longtail boat, floating lotus gardens and distant Shan mountain range',
    mm: 'အင်းလေးကန် ရေပြင်၊ ကြာပန်းခင်းနှင့် ရှမ်းရိုးမ တောင်တန်း နောက်ခံ'
  },
  ubein_bridge: {
    en: 'historic U Bein teakwood bridge in Amarapura at golden sunset, warm amber reflections rippling across Taungthaman Lake',
    mm: 'အမရပူရ ဦးပိန်တံတား နေဝင်ဆည်းဆာနှင့် တောင်သမန်အင်း ရေပြင်ရောင်ပြန်'
  }
};

export function buildComprehensiveMasterPrompt(
  selection: MatrixSelection,
  mode: AppMode
): {
  masterPrompt: string;
  negativePrompt: string;
  midjourneyFormat: string;
  fluxFormat: string;
  sdxlFormat: string;
  descriptionMm: string;
  descriptionEn: string;
  cameraNotes: string;
} {
  const targetAr = selection?.aspectRatio || '9:16';

  // Sanitize customInstruction so previously generated full prompts are not recursively appended
  const rawCustom = selection?.customInstruction ? selection.customInstruction.trim() : '';
  const isCleanCustom =
    rawCustom.length > 0 &&
    rawCustom.length < 300 &&
    !rawCustom.includes('--ar ') &&
    !rawCustom.includes('100% exact facial likeness');
  const safeCustomText = isCleanCustom ? `, ${rawCustom}` : '';

  // 0. Standalone Background-Only Mode Handling
  if (mode === 'background-only') {
    const locKey = (selection?.location || '').toLowerCase();
    const locMapped = LOCATION_TAXONOMY[locKey]?.en || selection?.location || 'historic Bagan pagoda sanctuary';
    const locMm = LOCATION_TAXONOMY[locKey]?.mm || selection?.location || 'ပုဂံ ရှေးဟောင်းစေတီပုထိုး နောက်ခံ';
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : '';
    const lighting = selection?.timeAndLighting || 'golden hour warm directional sunlight with volumetric mist';
    const lightCustom = selection?.customLightingDetails ? `, ${selection.customLightingDetails.trim()}` : '';
    const mood = selection?.moodEmotion && selection.moodEmotion !== 'skip' ? `${selection.moodEmotion} atmosphere` : 'serene and timeless aesthetic';
    const event = selection?.event && selection.event !== 'skip' ? `, inspired by ${selection.event}` : '';
    const camera = selection?.camera || 'Hasselblad X2D 100C with 35mm f/2.8 architectural prime lens';
    const angle = selection?.cameraAngle && selection.cameraAngle !== 'skip' ? selection.cameraAngle : 'Wide architectural landscape framing';
    const style = selection?.photoStyle || 'Photorealistic Architectural & Environmental Scenery';
    const quality = selection?.qualityProfile || '8k resolution, highly detailed architectural textures, photorealistic, museum archival quality, cinematic color grading';
    const color = selection?.colorGrade && selection.colorGrade !== 'skip' ? `${selection.colorGrade} color grading` : '16-bit natural film tones';

    const masterPrompt = `[Subject]: Purely environmental scenery, majestic architectural heritage with zero human presence, no persons. [Action]: Atmospheric stillness, serene natural wind and gentle ambient presence. [Environment]: A breathtaking standalone environmental photograph of ${locMapped}${locCustom}${event}. [Cinematography]: ${angle}, captured on ${camera}, f/8.0 deep depth of field. [Lighting/Style]: ${lighting}${lightCustom}, ${mood}, ${style}, ${color}. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, ' ').trim();
    const negativePrompt = `person, human, face, woman, man, girl, boy, model, people, portrait, body, hands, limbs, clothing, crowd, silhouette, blurry, low quality, distorted architecture, watermark`;

    return {
      masterPrompt,
      negativePrompt,
      midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --no person, human, face, people, crowd`,
      fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()}`,
      sdxlFormat: `${masterPrompt} | Negative: ${negativePrompt}`,
      descriptionMm:
        `【နောက်ခံရှုခင်း သီးသန့် မုဒ် (Background-Only Engine)】\n` +
        `၁။ တည်နေရာနှင့် ရှုခင်း: ${locMm}${locCustom}\n` +
        `၂။ အလင်းအမှောင်နှင့် အချိန်: ${lighting}${mood}\n` +
        `၃။ ကင်မရာနှင့် မှန်ဘီလူး: ${camera} (Aspect Ratio: ${targetAr})\n` +
        `၄။ အထူးသတ်မှတ်ချက်: လူပုံ/မော်ဒယ် လုံးဝမပါဝင်ဘဲ နောက်ခံရှုခင်းနှင့် ဗိသုကာအလှကိုသာ ၁၀၀% အသေးစိတ် ပုံဖော်ပေးထားပါသည်။`,
      descriptionEn: `Standalone architectural and environmental background scenery prompt for ${locMapped} without human subjects (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${camera}, ISO 64, f/8.0 deep depth of field, 1/125s tripod exposure`,
    };
  }

  // 0.05 Option 3: Reference Image Outfit & Pose Handling
  if (selection?.img2imgOption === 'style_transfer') {
    const sub = selection?.subject === 'man' ? 'handsome Burmese man' : selection?.subject === 'couple' ? 'elegant Myanmar couple' : 'gorgeous Burmese woman';
    const eth = selection?.customEthnicityDetails || 'authentic Burmese / Myanmar heritage';
    const outfit = selection?.garmentStyle || 'intricate traditional Myanmar silk woven attire tailored from Reference Image';
    const pose = selection?.poseExpression || 'natural regal posture replicating Reference Image pose';
    const loc = selection?.location || 'authentic Myanmar heritage architectural setting';
    const light = selection?.timeAndLighting || 'soft directional Rembrandt studio lighting with warm golden rim light';
    const cam = selection?.camera || 'Sony A7R V with 85mm f/1.2 GM portrait prime lens';
    const quality = selection?.qualityProfile || '8k resolution, highly detailed fabric textures, photorealistic, professional photography, cinematic color grading';

    const masterPrompt = `[Subject]: 100% exact facial likeness, preserving identical eyes, nose, lips, facial bone geometry, hairstyle, and warm honey-olive skin tone of the person from User Image (${eth} ${sub}, zero facial alteration, consistent character). Recreating attire from Reference Image: wearing ${outfit} with authentic silk weft texture and gold embroidery. [Action]: Replicating exact body posture, shoulder angle, hand placement, and graceful stance from Reference Image (${pose}). [Environment]: Set against ${loc} with creamy depth of field separation. [Cinematography]: Balanced medium portrait framing, eye-level perspective, shot on ${cam}, f/1.8 aperture for shallow depth of field. [Lighting/Style]: ${light}, natural subsurface skin scattering, crisp catchlights in irises. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, ' ').trim();
    const negativePrompt = `different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, deformed hands, extra fingers, plastic airbrushed skin, Indian saree, Chinese hanfu, Japanese kimono, blurry, low resolution`;

    return {
      masterPrompt,
      negativePrompt,
      midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --cw 100`,
      fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()}`,
      sdxlFormat: `${masterPrompt} | Negative: ${negativePrompt}`,
      descriptionMm:
        `【Reference Image Outfit & Pose စနစ် (ပုံစံတူ ဝတ်စုံနှင့် ကိုယ်နေဟန်ထား ပေါင်းစပ်မှု)】\n` +
        `၁။ မျက်နှာသွင်ပြင် ထိန်းသိမ်းမှု: User ပုံမှ မူရင်းမျက်နှာ၊ မျက်လုံး၊ နှာတံ၊ နှုတ်ခမ်းနှင့် အသားအရောင်ကို ၁၀၀% အတိအကျ ထိန်းသိမ်းထားပါသည်။\n` +
        `၂။ ဝတ်စုံနှင့် ကိုယ်ဟန်: Reference ပုံမှ ဝတ်စုံဒီဇိုင်း (${outfit}) နှင့် ကိုယ်နေဟန်ထား (${pose}) ကို တိကျစွာ ကူးယူပေါင်းစပ်ထားပါသည်။\n` +
        `၃။ ကင်မရာနှင့် အလင်း: ${cam} နှင့် ${light} (Aspect Ratio: ${targetAr})`,
      descriptionEn: `Reference Image Outfit & Pose: Preserves User Image facial identity with 100% fidelity while replicating Reference Image outfit, body posture, lighting, and background (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${cam}, ISO 100, f/1.2 aperture, 1/250s shutter speed, 85mm portrait prime lens`,
    };
  }

  // 0.1 Strict Sequence Clothes-Swap Mode Handling
  if (mode === 'clothes-swap') {
    const isCustomGarment = selection?.clothesSwapOption === 'custom_garment_upload' || !!selection?.customGarmentImage;
    const gDesc = selection?.customGarmentDescription || selection?.garmentFabric || '';
    const gKey = (selection?.garmentStyle || '').toLowerCase();

    let garmentChecklist = '';
    let garmentMm = '';
    if (isCustomGarment) {
      garmentChecklist = `custom garment from Image 2: ${gDesc || 'authentic handwoven Myanmar Luntaya Acheik silk attire, intricate gold thread filigree embroidery, tailored fitted bodice and full-length longyi, matching silk shawl'}`;
      garmentMm = gDesc || 'Image 2 မှ စိတ်ကြိုက် ရိုးရာပိုးချိတ်ဝတ်စုံနှင့် ရွှေချည်ထိုး အသေးစိတ်';
    } else if (GARMENT_TAXONOMY[gKey]) {
      garmentChecklist = GARMENT_TAXONOMY[gKey].en;
      garmentMm = GARMENT_TAXONOMY[gKey].mm;
    } else {
      const gStyle = selection?.garmentStyle || 'Royal Mandalay Luntaya Acheik Silk Longyi & Fitted Yinzi Blouse';
      const gFab = selection?.garmentFabric ? `, woven from ${selection.garmentFabric}` : ', woven from pure mulberry silk with gold metallic Zari threads';
      garmentChecklist = `${gStyle}${gFab}, intricate traditional Burmese wave motifs, tailored body-hugging fit, full-length traditional drape`;
      garmentMm = `${gStyle} (${selection?.garmentFabric || 'ပိုးစစ်စစ်နှင့် ရွှေချည်ထိုး အထည်'})`;
    }

    const locKey = (selection?.location || '').toLowerCase();
    const locBase = LOCATION_TAXONOMY[locKey]?.en || selection?.location || 'authentic Myanmar royal heritage studio backdrop';
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : '';
    const lightBase = selection?.timeAndLighting || 'warm golden hour directional key lighting with soft fill';
    const camera = selection?.camera || 'Hasselblad X2D 100C with 85mm f/1.2 portrait prime lens';
    const angle = selection?.cameraAngle && selection.cameraAngle !== 'skip' ? selection.cameraAngle : 'Medium-full shot, eye-level angle';
    const style = selection?.photoStyle || 'High-End Editorial Studio Portrait';
    const quality = selection?.qualityProfile || '8k resolution, highly detailed fabric textures, photorealistic, professional photography, cinematic color grading';

    const masterPrompt = `[Subject]: Keep the exact same person, face, facial bone structure, body proportions, and skin tone from Image 1 (100% exact face match, identical eyes nose lips, zero face alteration, preserved identity). Replace ONLY the clothing with the outfit from Image 2: ${garmentChecklist}. [Action]: Preserving the exact body posture, stance, and natural expression from Image 1. [Environment]: Set against ${locBase}${locCustom}. [Cinematography]: ${angle}, shot on ${camera}, f/2.0 aperture for shallow depth of field. [Lighting/Style]: ${lightBase}, ${style}, natural unretouched epidermal skin micro-pores. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, ' ').trim();
    const negativePrompt = `different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, wrong cultural clothing, Indian saree, Chinese hanfu, plastic skin, low quality, blurry`;

    return {
      masterPrompt,
      negativePrompt,
      midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --cw 100`,
      fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()}`,
      sdxlFormat: `${masterPrompt} | Negative: ${negativePrompt}`,
      descriptionMm:
        `【ဝတ်စုံလဲလှယ်ခြင်း အထူးစနစ် (Strict Clothes-Swap Engine)】\n` +
        `၁။ မူရင်းရုပ်သွင် ထိန်းသိမ်းမှု: Image 1 မှ လူ၏ မျက်နှာ၊ ခန္ဓာကိုယ်အချိုးအစား၊ ကိုယ်ဟန် (Pose) နှင့် အသားအရောင်ကို ၁၀၀% မပျက်မစီး အတိအကျ ထိန်းသိမ်းထားပါသည်။\n` +
        `၂။ လဲလှယ်မည့် ဝတ်စုံအသေးစိတ်: ${garmentMm}\n` +
        `၃။ နောက်ခံနှင့် အလင်းအမှောင်: ${locBase} နှင့် ${lightBase}\n` +
        `၄။ ကင်မရာနှင့် အချိုးအစား: ${camera} (Aspect Ratio: --ar ${targetAr})`,
      descriptionEn: `Strict Sequence Clothes Swap Prompt: Keeps Image 1 subject (face, body, pose, skin tone) 100% locked while swapping ONLY the clothing with ${garmentChecklist} (Aspect Ratio: ${targetAr}).`,
      cameraNotes: `${camera}, ISO 100, f/1.2, 1/250s`,
    };
  }

  // 1. Subject & Character Identification (Standard & Heritage Matrix Mode)
  let subjectText = '';
  let subjectMm = '';
  const sub = selection?.subject || 'woman';

  if (sub === 'man') {
    subjectText = 'A handsome Burmese gentleman with noble Southeast Asian bone structure and warm olive complexion';
    subjectMm = 'ခန့်ညားသော မြန်မာအမျိုးသား';
  } else if (sub === 'couple') {
    subjectText = 'A beautiful young Myanmar bridal couple in elegant traditional wedding attire';
    subjectMm = 'ကျက်သရေရှိသော မြန်မာမင်္ဂလာစုံတွဲ (သတို့သားနှင့် သတို့သမီး)';
  } else if (sub === 'monk') {
    subjectText = 'A serene Burmese Buddhist monk in authentic deep terracotta-saffron robes with peaceful mindfulness';
    subjectMm = 'တည်ကြည်အေးချမ်းသော မြန်မာဗုဒ္ဓဘာသာ ရဟန်းတော်';
  } else if (sub === 'elderly') {
    subjectText = 'A dignified elderly Burmese person with a warm, wise smile and authentic natural skin character';
    subjectMm = 'ကျက်သရေရှိသော မြန်မာသက်ကြီးဘိုးဘွား';
  } else if (sub === 'child') {
    subjectText = 'An adorable Burmese child with bright expressive eyes and traditional cultural styling';
    subjectMm = 'ချစ်စဖွယ် မြန်မာကလေးငယ်';
  } else if (sub === 'pet') {
    subjectText = 'A well-groomed companion pet alongside an elegant Burmese owner in traditional attire';
    subjectMm = 'မြန်မာ့ရိုးရာ ဝတ်စုံဝတ်ဆင်ထားသူနှင့် အိမ်မွေးတိရစ္ဆာန်';
  } else if (sub === 'product') {
    subjectText = 'A luxury commercial product showcase gracefully presented by an elegant Burmese model';
    subjectMm = 'မြန်မာမော်ဒယ်နှင့် အဆင့်မြင့် ကုန်ပစ္စည်းကြော်ငြာ';
  } else {
    subjectText = 'A gorgeous Burmese woman with graceful regal poise, authentic Myanmar facial features, and luminous honey-olive skin with natural micro-pores';
    subjectMm = 'ကျက်သရေရှိပြီး လှပသော မြန်မာအမျိုးသမီး';
  }

  if (selection?.customSubjectDetails && selection.customSubjectDetails.trim()) {
    subjectText += `, ${selection.customSubjectDetails.trim()}`;
    subjectMm += ` (${selection.customSubjectDetails.trim()})`;
  }

  // Age Range
  if (selection?.ageRange && selection.ageRange !== 'skip') {
    const ageFormatted = selection.ageRange.replace('_', '-');
    subjectText += `, age ${ageFormatted}`;
    subjectMm += `၊ အသက် (${ageFormatted}) နှစ်ဝန်းကျင်`;
  }

  // Height Range
  if (selection?.heightRange && selection.heightRange !== 'skip') {
    const heightOpt = HEIGHT_OPTIONS.find((h) => h.id === selection.heightRange);
    subjectText += heightOpt ? `, ${heightOpt.promptText}` : `, height ${selection.heightRange}`;
  }

  // Weight / Body Build
  if (selection?.weightRange && selection.weightRange !== 'skip') {
    const weightOpt = WEIGHT_OPTIONS.find((w) => w.id === selection.weightRange);
    subjectText += weightOpt ? `, ${weightOpt.promptText}` : `, weight ${selection.weightRange}`;
  }

  // Ethnicity & Myanmar Cultural Features
  if (selection?.ethnicity && selection.ethnicity !== 'skip') {
    const ethOpt = ETHNICITY_OPTIONS.find((e) => e.id === selection.ethnicity);
    if (ethOpt && ethOpt.promptText) {
      subjectText += `, ${ethOpt.promptText}`;
      subjectMm += ` (${ethOpt.labelMm.replace(/^[၀-၉]+\။\s*/, '')})`;
    } else {
      subjectText += `, authentic ${selection.ethnicity} Myanmar ethnic heritage`;
    }
  }
  if (selection?.customEthnicityDetails && selection.customEthnicityDetails.trim()) {
    subjectText += `, ${selection.customEthnicityDetails.trim()}`;
    subjectMm += `၊ ${selection.customEthnicityDetails.trim()}`;
  }

  // 2. Identity Lock & Facial Likeness Preservation
  let identityText = '';
  const isImg2ImgOrSwap = (mode as string) === 'img2img' || (mode as string) === 'clothes-swap';
  const isLockEnabled = selection?.preserveSubject100Percent !== false || (selection?.identityLock && selection.identityLock !== 'no_lock');

  if (isImg2ImgOrSwap || isLockEnabled) {
    identityText = ', 100% exact facial likeness, identical eyes nose lips, preserved facial identity, zero face alteration, same person, identical facial bone geometry';
  }

  // 3. Pose, Body Stance & Expression
  let poseText = '';
  let poseMm = 'သဘာဝကျပြီး ကျက်သရေရှိသော ကိုယ်နေဟန်ထား';
  if (selection?.poseExpression && selection.poseExpression !== 'skip') {
    poseText = `, posing with ${selection.poseExpression}`;
    poseMm = selection.poseExpression;
  }
  if (selection?.customPoseDetails && selection.customPoseDetails.trim()) {
    poseText += `, ${selection.customPoseDetails.trim()}`;
    poseMm += ` (${selection.customPoseDetails.trim()})`;
  }

  // 4. Couple & Wedding Details (if couple selected)
  let coupleText = '';
  if (sub === 'couple' || selection?.coupleOutfitType) {
    const groomParts: string[] = [];
    if (selection?.groomOutfit) groomParts.push(`groom wearing ${selection.groomOutfit}`);
    if (selection?.groomTop) groomParts.push(selection.groomTop);
    if (selection?.groomBottom) groomParts.push(selection.groomBottom);
    if (selection?.groomHair) groomParts.push(`groom coiffure: ${selection.groomHair}`);
    if (selection?.groomExpression) groomParts.push(`groom expression: ${selection.groomExpression}`);
    if (selection?.groomPoseAccessory) groomParts.push(`groom holding ceremonial ${selection.groomPoseAccessory}`);

    const brideParts: string[] = [];
    if (selection?.brideOutfit) brideParts.push(`bride wearing ${selection.brideOutfit}`);
    if (selection?.brideTop) brideParts.push(selection.brideTop);
    if (selection?.brideBottom) brideParts.push(selection.brideBottom);
    if (selection?.brideHair) brideParts.push(`bride coiffure: ${selection.brideHair}`);
    if (selection?.brideExpression) brideParts.push(`bride expression: ${selection.brideExpression}`);
    if (selection?.bridePoseAccessory) brideParts.push(`bride with ${selection.bridePoseAccessory}`);

    if (groomParts.length > 0) coupleText += `, ${groomParts.join(', ')}`;
    if (brideParts.length > 0) coupleText += `, ${brideParts.join(', ')}`;

    if (selection?.couplePose) coupleText += `, couple interaction: ${selection.couplePose}`;
    if (selection?.weddingEthnicGroup) coupleText += `, authentic ${selection.weddingEthnicGroup} royal wedding regalia`;
    if (selection?.weddingEra) coupleText += `, ${selection.weddingEra} era historical styling`;
    if (selection?.weddingAccessoryProps) coupleText += `, ceremonial wedding props: ${selection.weddingAccessoryProps}`;
  }

  // 5. Outfit / Clothing / Garment with Burmese Cultural Taxonomy
  let outfitText = '';
  let outfitMm = '';
  const isCustomGarment = selection?.clothesSwapOption === 'custom_garment_upload' || !!selection?.customGarmentImage;
  const gKey = (selection?.garmentStyle || '').toLowerCase();
  const fabricMod = selection?.garmentFabric ? selection.garmentFabric.trim() : '';

  if (isCustomGarment) {
    const gDesc = selection?.customGarmentDescription || fabricMod || 'custom uploaded reference attire with intricate traditional Burmese silk embroidery';
    outfitText = `, wearing custom reference attire: ${gDesc}`;
    outfitMm = `စိတ်ကြိုက် တင်သွင်းထားသော ဝတ်စုံ (${gDesc})`;
  } else if (GARMENT_TAXONOMY[gKey]) {
    outfitText = `, wearing ${GARMENT_TAXONOMY[gKey].en}${fabricMod ? `, crafted in ${fabricMod}` : ''}`;
    outfitMm = `${GARMENT_TAXONOMY[gKey].mm}${fabricMod ? ` (${fabricMod})` : ''}`;
  } else if (selection?.garmentStyle && selection.garmentStyle !== 'skip') {
    const foundGarment = GARMENT_OPTIONS.find((g) => g.id === selection.garmentStyle);
    if (foundGarment) {
      outfitText = `, wearing ${foundGarment.fabric}${fabricMod ? `, styled with ${fabricMod}` : ''}`;
      outfitMm = `${foundGarment.labelMm}${fabricMod ? ` (${fabricMod})` : ` (${foundGarment.fabric})`}`;
    } else {
      const fabric = fabricMod ? ` handwoven from ${fabricMod} with fine silk weft` : ' handwoven from pure Myanmar mulberry silk with intricate wave motifs';
      outfitText = `, wearing authentic traditional Burmese ${selection.garmentStyle}${fabric}`;
      outfitMm = `မြန်မာ့ရိုးရာ ${selection.garmentStyle}${fabricMod ? ` (${fabricMod})` : ' (ပိုးချိတ်ထည်)'}`;
    }
  } else {
    outfitText = `, wearing authentic Mandalay Luntaya Acheik handwoven royal silk longyi and fitted silk blouse with delicate gold thread embroidery${fabricMod ? `, crafted in ${fabricMod}` : ''}`;
    outfitMm = `မန္တလေး လွန်းရာကျော် ပိုးချိတ်ထည်နှင့် ရိုးရာ ရင်ဖုံးပိုးအင်္ကျီ${fabricMod ? ` (${fabricMod})` : ''}`;
  }

  // 6. Cultural Props, Royal Jewelry, Thanaka & Coiffure
  let culturalPropsText = '';
  let culturalPropsMm = '';
  if (selection?.culturalPropsDetails && selection.culturalPropsDetails.trim()) {
    const rawProps = selection.culturalPropsDetails.trim();
    const matchedPresets = CULTURAL_PROP_PRESETS.filter(
      (p) =>
        rawProps.toLowerCase().includes(p.id.toLowerCase()) ||
        rawProps.includes(p.labelMm) ||
        rawProps.toLowerCase().includes(p.labelEn.toLowerCase()) ||
        rawProps.toLowerCase().includes(p.promptText.toLowerCase())
    );

    let customRemaining = rawProps;
    matchedPresets.forEach((p) => {
      customRemaining = customRemaining
        .replace(p.labelMm, '')
        .replace(p.labelEn, '')
        .replace(p.promptText, '');
    });
    const cleanCustomParts = customRemaining
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== ',');

    const englishPropParts = [
      ...matchedPresets.map((p) => p.promptText),
      ...cleanCustomParts
    ];
    const burmesePropParts = [
      ...matchedPresets.map((p) => p.labelMm),
      ...cleanCustomParts
    ];

    culturalPropsText = `, adorned with authentic Myanmar cultural jewelry, coiffure, and props: ${englishPropParts.join(', ')}`;
    culturalPropsMm = burmesePropParts.join('၊ ');
  } else if (selection?.includeCulturalProps !== false) {
    culturalPropsText = `, adorned with authentic natural pale yellowish-white Thanaka bark paste delicately brushed on cheeks with fine organic texture, regal Burmese Sadon hair bun encircled by fresh fragrant white jasmine garland, and traditional royal gold filigree jewelry`;
    culturalPropsMm = 'ပါးပြင်ပေါ်ရှိ သဘာဝ သနပ်ခါးပါးကွက်၊ မြန်မာ့ရိုးရာ ဆံထုံး၊ စံပယ်ပန်းကုံးနှင့် ရွှေပန်းထိမ် လက်ဝတ်ရတနာများ';
  } else {
    culturalPropsMm = 'ရိုးရှင်းသန့်စင်သော စတူဒီယို အပြင်အဆင်';
  }

  // 7. Event, Festival & Atmosphere
  let eventText = '';
  if (selection?.customEventDetails && selection.customEventDetails.trim()) {
    eventText = `, during ${selection.customEventDetails.trim()}`;
  } else if (selection?.event && selection.event !== 'skip') {
    eventText = `, celebrating traditional Myanmar ${selection.event}`;
  }

  // 8. Location & Scenery Backdrop
  let locationText = '';
  let locationMm = 'မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု အမွေအနှစ် နောက်ခံရှုခင်း';
  const locKey = (selection?.location || '').toLowerCase();
  if (LOCATION_TAXONOMY[locKey]) {
    locationText = `, set in ${LOCATION_TAXONOMY[locKey].en}`;
    locationMm = LOCATION_TAXONOMY[locKey].mm;
  } else if (selection?.location && selection.location !== 'skip') {
    locationText = `, set against ${selection.location}`;
    locationMm = selection.location;
  } else {
    locationText = `, set in an atmospheric Myanmar heritage architectural sanctuary with warm depth of field`;
  }
  if (selection?.customLocationDetails && selection.customLocationDetails.trim()) {
    locationText += `, ${selection.customLocationDetails.trim()}`;
    locationMm += ` (${selection.customLocationDetails.trim()})`;
  }
  if (selection?.weddingStudioBackdropProps && selection.weddingStudioBackdropProps.trim()) {
    locationText += `, studio set design: ${selection.weddingStudioBackdropProps.trim()}`;
  }

  // 9. Time, Lighting & Emotional Mood
  let lightingText = '';
  let lightingMm = 'နွေးထွေးသော ရွှေရောင်သမ်းသည့် သဘာဝ စတူဒီယို အလင်းအမှောင် (Golden Hour / Rembrandt Lighting)';
  if (selection?.timeAndLighting && selection.timeAndLighting !== 'skip') {
    lightingText = `, illuminated by ${selection.timeAndLighting}, subtle warm amber rim light separating subject from background`;
    lightingMm = selection.timeAndLighting;
  } else {
    lightingText = `, illuminated by golden hour directional key lighting and soft Profoto octagonal fill light with crisp catchlights in irises`;
  }
  if (selection?.customLightingDetails && selection.customLightingDetails.trim()) {
    lightingText += `, ${selection.customLightingDetails.trim()}`;
    lightingMm += ` (${selection.customLightingDetails.trim()})`;
  }
  if (selection?.moodEmotion && selection.moodEmotion !== 'skip') {
    lightingText += `, evoking a ${selection.moodEmotion} cinematic mood`;
    lightingMm += ` — စိတ်ခံစားမှု: ${selection.moodEmotion}`;
  }

  // 10. Makeup & Retouching Style
  let makeupText = '';
  if (selection?.makeup && selection.makeup !== 'skip') {
    makeupText = `, ${selection.makeup} makeup styling`;
  }

  let retouchText = '';
  if (selection?.retouching && selection.retouching !== 'skip') {
    retouchText = `, ${selection.retouching}`;
  } else {
    retouchText = `, natural unretouched epidermal skin micro-pores, authentic subsurface scattering, zero plastic smoothing`;
  }

  // 11. Optics, Camera Gear, Angle & Color Grade
  const cameraBase = (selection?.camera && selection.camera !== 'skip')
    ? selection.camera
    : 'Hasselblad X2D 100C medium-format camera with 85mm f/1.2 portrait prime lens';
  let photoStyleText = `, captured on ${cameraBase}`;

  if (selection?.cameraAngle && selection.cameraAngle !== 'skip') {
    photoStyleText += `, ${selection.cameraAngle} camera framing`;
  }
  if (selection?.photoStyle && selection.photoStyle !== 'skip') {
    photoStyleText += `, ${selection.photoStyle}`;
  }
  if (selection?.colorGrade && selection.colorGrade !== 'skip') {
    photoStyleText += `, ${selection.colorGrade} film color grading`;
  }

  // 12. Quality Profile & Render Specifications
  const qualityText = (selection?.qualityProfile && selection.qualityProfile !== 'skip')
    ? selection.qualityProfile
    : '8k resolution, highly detailed fabric textures, photorealistic, professional wedding photography, cinematic color grading';

  // =========================================================================
  // STRUCTURED TAGGED PROMPT ASSEMBLY ([Subject], [Action], [Environment], [Cinematography], [Lighting/Style], [Technical])
  // =========================================================================
  
  // 1. [Subject] Section
  const subjectParts: string[] = [];
  if (sub === 'couple' || selection?.coupleOutfitType) {
    subjectParts.push(
      selection?.customSubjectDetails
        ? `A beautiful young Myanmar bridal couple (${selection.customSubjectDetails.trim()}) in elegant traditional wedding attire`
        : 'A beautiful young Myanmar bridal couple in elegant traditional wedding attire'
    );
    if (selection?.ethnicity && selection.ethnicity !== 'skip') {
      const ethOpt = ETHNICITY_OPTIONS.find((e) => e.id === selection.ethnicity);
      subjectParts.push(ethOpt?.promptText ? ethOpt.promptText : `authentic ${selection.ethnicity} Myanmar ethnic heritage`);
    }
    if (selection?.ageRange && selection.ageRange !== 'skip') {
      subjectParts.push(`age ${selection.ageRange.replace('_', '-')}`);
    }
    if (identityText) {
      subjectParts.push(identityText.replace(/^,\s*/, ''));
    }

    // Groom Attire
    const groomDetails: string[] = [];
    if (selection?.groomOutfit) groomDetails.push(selection.groomOutfit);
    if (selection?.groomTop) groomDetails.push(`top: ${selection.groomTop}`);
    if (selection?.groomBottom) groomDetails.push(`bottom: ${selection.groomBottom}`);
    if (selection?.groomHair) groomDetails.push(`hair: ${selection.groomHair}`);
    if (selection?.groomPoseAccessory) groomDetails.push(`accessory: ${selection.groomPoseAccessory}`);
    if (groomDetails.length > 0) {
      subjectParts.push(`The groom wears ${groomDetails.join(', ')}`);
    } else {
      subjectParts.push('The groom wears traditional Myanmar formal wedding attire with silk longyi and matching formal jacket');
    }

    // Bride Attire
    const brideDetails: string[] = [];
    if (selection?.brideOutfit) brideDetails.push(selection.brideOutfit);
    if (selection?.brideTop) brideDetails.push(`top: ${selection.brideTop}`);
    if (selection?.brideBottom) brideDetails.push(`bottom: ${selection.brideBottom}`);
    if (selection?.brideHair) brideDetails.push(`hair: ${selection.brideHair}`);
    if (selection?.bridePoseAccessory) brideDetails.push(`accessory: ${selection.bridePoseAccessory}`);
    if (brideDetails.length > 0) {
      subjectParts.push(`The bride wears ${brideDetails.join(', ')}`);
    } else {
      subjectParts.push('The bride wears a stunning traditional Myanmar royal bridal gown with gold embroidery, traditional gold jewelry, and a fragrant jasmine garland');
    }

    // Royal Regalia
    const regaliaParts: string[] = [];
    if (selection?.weddingEthnicGroup) regaliaParts.push(`authentic ${selection.weddingEthnicGroup} royal wedding regalia`);
    if (selection?.weddingEra) regaliaParts.push(`${selection.weddingEra} era historical styling`);
    if (selection?.weddingAccessoryProps) regaliaParts.push(`ceremonial props: ${selection.weddingAccessoryProps}`);
    if (regaliaParts.length > 0) {
      subjectParts.push(`Adorned with ${regaliaParts.join(', ')}`);
    }
  } else {
    subjectParts.push(subjectText);
    if (identityText) {
      subjectParts.push(identityText.replace(/^,\s*/, ''));
    }
    if (outfitText) {
      subjectParts.push(outfitText.replace(/^,\s*/, ''));
    }
    if (culturalPropsText) {
      subjectParts.push(culturalPropsText.replace(/^,\s*/, ''));
    }
  }
  if (safeCustomText) {
    subjectParts.push(safeCustomText.replace(/^,\s*/, ''));
  }
  const subjectSection = subjectParts.join('. ').replace(/\.\./g, '.').trim();

  // 2. [Action] Section
  const actionParts: string[] = [];
  if (sub === 'couple' || selection?.coupleOutfitType) {
    if (selection?.couplePose) {
      actionParts.push(selection.couplePose);
    } else {
      actionParts.push('Standing close together, holding hands affectionately, posing for a romantic wedding portrait, looking directly at the camera with gentle smiles');
    }
    if (selection?.groomExpression) actionParts.push(`The groom has a ${selection.groomExpression}`);
    if (selection?.brideExpression) actionParts.push(`The bride has a ${selection.brideExpression}`);
  } else {
    if (selection?.poseExpression && selection.poseExpression !== 'skip') {
      actionParts.push(`Posing with ${selection.poseExpression}, looking towards the camera with gentle poise`);
    } else {
      actionParts.push('Standing with natural regal grace and poise, looking directly towards the camera with a gentle, serene smile');
    }
    if (selection?.customPoseDetails && selection.customPoseDetails.trim()) {
      actionParts.push(selection.customPoseDetails.trim());
    }
  }
  const actionSection = actionParts.join('. ').replace(/\.\./g, '.').trim();

  // 3. [Environment] Section
  const envParts: string[] = [];
  const locMapped = LOCATION_TAXONOMY[locKey]?.en || selection?.location || 'an atmospheric Myanmar heritage architectural setting';
  envParts.push(`A breathtaking ${locMapped} at golden hour`);
  if (selection?.customLocationDetails && selection.customLocationDetails.trim()) {
    envParts.push(selection.customLocationDetails.trim());
  }
  if (selection?.weddingStudioBackdropProps && selection.weddingStudioBackdropProps.trim()) {
    envParts.push(`studio backdrop featuring ${selection.weddingStudioBackdropProps.trim()}`);
  }
  if (selection?.event && selection.event !== 'skip') {
    envParts.push(`celebrating traditional ${selection.event}`);
  }
  if (selection?.customEventDetails && selection.customEventDetails.trim()) {
    envParts.push(selection.customEventDetails.trim());
  }
  const environmentSection = envParts.join('. ').replace(/\.\./g, '.').trim();

  // 4. [Cinematography] Section
  const cineParts: string[] = [];
  const framing = selection?.cameraAngle && selection.cameraAngle !== 'skip' ? selection.cameraAngle : 'Medium-full shot';
  cineParts.push(`${framing}`);
  const lensAperture = cameraBase.includes('85mm')
    ? '85mm portrait prime lens, f/1.8 aperture for a beautiful shallow depth of field, keeping the couple in sharp focus while softly blurring the background'
    : '50mm prime lens, f/2.8 aperture for a beautiful shallow depth of field, keeping the couple in sharp focus while softly blurring the background';
  cineParts.push(lensAperture);
  cineParts.push(`Eye-level angle, captured on ${cameraBase}`);
  const cinematographySection = cineParts.join(', ').trim();

  // 5. [Lighting/Style] Section
  const lightParts: string[] = [];
  const lighting = selection?.timeAndLighting && selection.timeAndLighting !== 'skip'
    ? selection.timeAndLighting
    : 'Golden hour natural lighting, soft warm sunlight illuminating their faces, gentle rim light on their attire from the setting sun';
  lightParts.push(lighting);
  const mood = selection?.moodEmotion && selection.moodEmotion !== 'skip' ? `${selection.moodEmotion} aesthetic` : 'romantic and elegant aesthetic';
  lightParts.push(mood);
  if (selection?.colorGrade && selection.colorGrade !== 'skip') {
    lightParts.push(`${selection.colorGrade} color grading`);
  } else {
    lightParts.push('cinematic color grading, 16-bit natural warm film tones');
  }
  if (makeupText) lightParts.push(makeupText.replace(/^,\s*/, ''));
  lightParts.push(retouchText.replace(/^,\s*/, ''));
  const lightingStyleSection = lightParts.join(', ').trim();

  // 6. [Technical] Section
  const technicalSection = `${qualityText} --ar ${targetAr}`.trim();

  // Complete Tagged Master Prompt
  const masterPrompt = `[Subject]: ${subjectSection}. [Action]: ${actionSection}. [Environment]: ${environmentSection}. [Cinematography]: ${cinematographySection}. [Lighting/Style]: ${lightingStyleSection}. [Technical]: ${technicalSection}`
    .replace(/\s+/g, ' ')
    .replace(/\.\./g, '.')
    .trim();

  const negativePrompt = `different face, altered face, swapped face, distorted facial features, facial asymmetry, Indian saree, bindi, Chinese hanfu, Japanese kimono, Western casual clothes, plastic airbrushed skin, doll face, blurry, low resolution, bad eyes, deformed hands, extra fingers, overexposed, watermark, text`;

  const angleNote = selection?.cameraAngle && selection.cameraAngle !== 'skip' ? `, Framing: ${selection.cameraAngle}` : ', Framing: Eye-Level Portrait';
  const styleNote = selection?.photoStyle && selection.photoStyle !== 'skip' ? `, Style: ${selection.photoStyle}` : '';
  const colorNote = selection?.colorGrade && selection.colorGrade !== 'skip' ? `, Color Grade: ${selection.colorGrade}` : ', Color: 16-bit Natural Kodak Portra Tone';
  const cameraNotes = `${cameraBase}${angleNote}${styleNote}${colorNote}, ISO 64, f/1.2 aperture, 1/250s shutter speed, 85mm prime optics`;

  // Rich, Accurate Burmese Director's Story (မြန်မာဘာသာ ဒါရိုက်တာ ရှင်းလင်းချက်)
  const descriptionMm =
    `【မြန်မာ့ရိုးရာနှင့် စတူဒီယို အသေးစိတ် ဒါရိုက်တာ လမ်းညွှန်ချက် (Burmese Detail Story)】\n` +
    `၁။ အဓိက ကာရိုက်တာနှင့် မျက်နှာသွင်ပြင်: ${subjectMm} — မူရင်းမျက်နှာအချိုးအစား၊ မျက်လုံး၊ နှာတံ၊ နှုတ်ခမ်းနှင့် သဘာဝ အသားအရေ ချွေးပေါက် (Micro-Pores) များကို ၁၀၀% အတိအကျ ထိန်းသိမ်းထားပါသည်။\n` +
    `၂။ ရိုးရာဝတ်စုံနှင့် အထည်အသား: ${outfitMm} — ပိုးချိတ်အဆင်နှင့် ရွှေချည်ထိုး အသေးစိတ်ကို အပ်ချုပ်ရာနှင့် အထည်သား ပေါ်လွင်သည်အထိ တိကျစွာ သတ်မှတ်ထားပါသည်။\n` +
    `၃။ သနပ်ခါး၊ ဆံထုံးနှင့် ရတနာ အဆင်တန်ဆာ: ${culturalPropsMm} (ကိုယ်နေဟန်ထား - ${poseMm})\n` +
    `၄။ နောက်ခံရှုခင်းနှင့် အလင်းအမှောင်: ${locationMm} နောက်ခံတွင် ${lightingMm} ဖြင့် ရုပ်ကြွပေါ်လွင်အောင် အလင်းပေးထားပါသည်။\n` +
    `၅။ ကင်မရာနှင့် အရည်အသွေး သတ်မှတ်ချက်: ${cameraBase} မှန်ဘီလူး၊ Aspect Ratio (${targetAr}) ဖြင့် အခြားနိုင်ငံ ဝတ်စုံများ ရောနှောခြင်း လုံးဝမရှိစေရန် Anti-Hallucination စနစ်ဖြင့် ကာကွယ်ထားပါသည်။`;

  const descriptionEn =
    `[Burmese Cultural & Studio Director Breakdown]\n` +
    `• Subject & Identity: ${subjectText} (100% facial geometry & micro-pore preservation)\n` +
    `• Traditional Attire: ${outfitText.replace(/^, wearing /, '')}\n` +
    `• Cosmetics & Regalia: ${culturalPropsText.replace(/^, adorned with /, '') || 'Natural studio styling'}\n` +
    `• Environment & Lighting: ${locationText.replace(/^, set (in|against) /, '')} | ${lightingText.replace(/^, illuminated by /, '')}\n` +
    `• Camera & Optics: ${cameraNotes} (--ar ${targetAr})`;

  return {
    masterPrompt,
    negativePrompt,
    midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --no Indian saree, Chinese hanfu, Japanese kimono, plastic skin, altered face`,
    fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()}`,
    sdxlFormat: `${masterPrompt} | Camera: ${cameraNotes} | Negative: ${negativePrompt}`,
    descriptionMm,
    descriptionEn,
    cameraNotes,
  };
}
