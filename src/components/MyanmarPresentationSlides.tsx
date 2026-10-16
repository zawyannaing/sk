import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavView } from './Sidebar';

interface MyanmarPresentationSlidesProps {
  onNavigateToSection: (view: NavView) => void;
  onClose?: () => void;
  initialSlide?: number;
}

interface SlideItem {
  id: string;
  sectionId?: NavView;
  categoryMm: string;
  categoryEn: string;
  titleMm: string;
  titleEn: string;
  subtitleMm: string;
  subtitleEn: string;
  icon: string;
  badge: string;
  badgeColor: string;
  summaryMm: string;
  summaryEn: string;
  stepsMm: { step: string; desc: string; tip?: string }[];
  stepsEn: { step: string; desc: string; tip?: string }[];
  keyFeaturesMm: string[];
  keyFeaturesEn: string[];
  proTipMm: string;
  proTipEn: string;
  speakerNotesMm: string;
  speakerNotesEn: string;
  recommendedNextMm?: string;
  recommendedNextEn?: string;
  illustrationBadge: string;
}

const SLIDES_DATA: SlideItem[] = [
  {
    id: 'intro',
    categoryMm: 'မိတ်ဆက်နှင့် ခြုံငုံသုံးသပ်ချက်',
    categoryEn: 'Introduction & Suite Overview',
    titleMm: 'Show Prompt AI Photo Studio စနစ် ခြုံငုံသုံးသပ်ချက်',
    titleEn: 'Show Prompt AI Photo Studio Architecture Overview',
    subtitleMm: 'မြန်မာ့ရိုးရာ ယဉ်ကျေးမှုနှင့် အဆင့်မြင့် AI Prompt Generator & Photo Suite ပေါင်းစပ်ထားသော စနစ်',
    subtitleEn: 'Comprehensive Myanmar Cultural Prompt Engineering & High-End AI Studio Suite',
    icon: 'auto_awesome',
    badge: 'Overview',
    badgeColor: 'bg-[#ffd02f] text-[#1c1c1e]',
    summaryMm: 'ဤအက်ပ်သည် ရိုးရိုး Prompt Generator တစ်ခုသာ မဟုတ်ဘဲ Midjourney v6.1, Flux.1, SDXL, DALL-E 3 တို့အတွက် မြန်မာ့ရိုးရာ ဝတ်စုံ၊ ရှေးဟောင်းနေရာ၊ အလင်းအမှောင်၊ ကင်မရာ Lens နှင့် ဓာတ်ပုံဟောင်းပြုပြင်ခြင်း စသည့် အဆင့်မြင့် စတူဒီယိုအခန်း ၁၀ ခန်း ပါဝင်သော ပြီးပြည့်စုံသည့် စနစ်ဖြစ်ပါသည်။',
    summaryEn: 'More than a basic prompt generator: this is an enterprise-grade Burmese cultural photo engineering suite with 10 dedicated studio workstations for Midjourney, Flux, and SDXL.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'ဘယ်ဘက် Sidebar မှ မိမိ လိုအပ်သော Studio Room (သို့မဟုတ်) Matrix ကို ရွေးချယ်ပါ။', tip: 'စတင်သူများအတွက် 8-Room Studio Suite မှ စတင်ရန် အကြံပြုပါသည်။' },
      { step: 'အဆင့် ၂', desc: 'အပေါ်ဘက် Navbar တွင် မိမိ အသုံးပြုမည့် AI Engine (Midjourney / Flux / SDXL) ကို ရွေးချယ်ပါ။', tip: 'Midjourney v6.1 သည် အဝတ်အစားနှင့် မျက်နှာ အသေးစိတ်အတွက် အကောင်းဆုံးဖြစ်ပါသည်။' },
      { step: 'အဆင့် ၃', desc: 'Generate Prompt ခလုတ်ကို နှိပ်ပြီး ထွက်ရှိလာသော Master Prompt ကို တိုက်ရိုက် ကူးယူ (Copy) သုံးစွဲနိုင်ပါသည်။', tip: 'Export ခလုတ်ဖြင့် စာသားဖိုင် သို့မဟုတ် Syntax ပုံစံဖြင့် သိမ်းဆည်းနိုင်ပါသည်။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Select your preferred Studio Room or Matrix from the left navigation sidebar.', tip: 'Recommended: Start with the 8-Room Studio Suite.' },
      { step: 'Step 2', desc: 'Choose target AI model (Midjourney v6.1, Flux.1, SDXL) in top bar.', tip: 'Midjourney v6.1 yields highest fidelity for Burmese silks.' },
      { step: 'Step 3', desc: 'Click "Generate Prompt" to synthesize exact syntax and copy to clipboard.', tip: 'Use Export button to save prompt files or json specs.' }
    ],
    keyFeaturesMm: [
      'မြန်မာစာ / English နှစ်ဘာသာ အထောက်အပံ့',
      'Midjourney v6.1, Flux.1 Dev/Pro, SDXL, DALL-E 3 ချိန်ညှိမှု',
      'Database မလိုဘဲ Browser LocalStorage ဖြင့် အမြန်ဆုံး အလုပ်လုပ်ခြင်း',
      '၁၀ ခန်းပါ စတူဒီယို ကိရိယာများနှင့် ဓာတ်ပုံမှ Prompt ပြန်ထုတ်စနစ်'
    ],
    keyFeaturesEn: [
      'Bilingual Burmese & English live interface',
      'Multi-engine optimization (Midjourney, Flux, SDXL, DALL-E 3)',
      'Zero-latency browser storage without compulsory cloud setup',
      '10 specialized studio modules with reverse-engineering'
    ],
    proTipMm: 'Sidebar အား ဘယ်ဘက်အပေါ်ရှိ မြှားကလေးဖြင့် ကျဉ်း/ကျယ် ပြုလုပ်နိုင်ပြီး မျက်နှာပြင်ကျယ် Canvas ပေါ်တွင် အလုပ်လုပ်နိုင်ပါသည်။',
    proTipEn: 'Collapse the sidebar with top-left icon for distraction-free ultra-wide canvas workstation.',
    speakerNotesMm: 'ဖောက်သည်များနှင့် စတူဒီယိုအဖွဲ့သားများအား စတင်မိတ်ဆက်ရာတွင် ဤဆလိုက်ဖြင့် စတင်ပြီး အက်ပ်၏ အဓိက အားသာချက်ဖြစ်သော မြန်မာ့ယဉ်ကျေးမှု အသေးစိတ် (Cultural Accuracy) ကို အလေးပေး ပြောကြားပါ။',
    speakerNotesEn: 'When presenting to studio team, highlight the cultural accuracy and time savings compared to writing prompts manually.',
    illustrationBadge: '🌟 All-in-One Studio'
  },
  {
    id: 'studio-suite',
    sectionId: 'studio-suite',
    categoryMm: 'အဓိက စတူဒီယို အခန်းများ',
    categoryEn: 'Main Generative Rooms',
    titleMm: '၈ ခန်းပါ Studio Master Suite အသုံးပြုနည်း',
    titleEn: '8-Room Studio Master Suite Guide',
    subtitleMm: 'Ajax Click AI စတူဒီယို စံနှုန်းအတိုင်း အသင့်သုံး ပြင်ဆင်ပြီးသား အခန်း ၈ ခန်း',
    subtitleEn: 'Pre-calibrated 8 dedicated photography studio rooms matching Ajax Click AI specs',
    icon: 'grid_view',
    badge: 'Room 1-8',
    badgeColor: 'bg-[#1c1c1e] text-[#ffd02f]',
    summaryMm: 'ရိုးရာ၊ နန်းတွင်း၊ ရဟန်းသံဃာ၊ ခေတ်သစ်၊ ရင်သွေးငယ်၊ သက်ကြီးရွယ်အို စသည့် မြန်မာ့လူမှုဘဝ ကဏ္ဍစုံအတွက် ပညာရှင်အဆင့် Lighting, Camera နှင့် Style ပါပြီးသား စတူဒီယို အခန်း ၈ ခန်း ဖြစ်ပါသည်။',
    summaryEn: 'Ready-to-generate 8 rooms covering Traditional, Royal Court, Monastic, Contemporary, Newborn, and Archival setups with preset cinematic lighting.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Studio Suite စာမျက်နှာတွင် မိမိ လိုအပ်သော အခန်း ကတ်ပြား (ဥပမာ- Traditional Royal Court သို့မဟုတ် Monastic Peace) ကို ရွေးပါ။' },
      { step: 'အဆင့် ၂', desc: 'အခန်းအတွင်းရှိ သီးသန့် Preset ဝတ်စုံ၊ နောက်ခံနှင့် အလင်းအမှောင် ရွေးချယ်မှုများကို လိုသလို ချိန်ညှိပါ။' },
      { step: 'အဆင့် ၃', desc: '"Send to Matrix" ဖြင့် အသေးစိတ် ဆက်လက် ပြင်ဆင်နိုင်သလို "Copy Prompt" ဖြင့် ချက်ချင်း ရယူအသုံးပြုနိုင်ပါသည်။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Browse the 8 curated room cards (e.g., Traditional Royal Court, Monastic Serenity).' },
      { step: 'Step 2', desc: 'Customize preset attire, background environment, and lighting profile.' },
      { step: 'Step 3', desc: 'Click "Send to Matrix" to refine, or "Copy Prompt" for instant production.' }
    ],
    keyFeaturesMm: [
      'Room 1: ရိုးရာပွဲတော်နှင့် နန်းတွင်းဝတ်စုံ စတူဒီယို',
      'Room 2: ရင်သွေးငယ်နှင့် မွေးကင်းစ ကလေး ဓာတ်ပုံခန်း',
      'Room 3: သက်ကြီးရွယ်အို လေးစားဖွယ် ပုံတူခန်း',
      'Room 4: သာသနာ့အလင်းနှင့် ဘုန်းတော်ကြီးကျောင်း တရားရိပ်',
      'Room 5: ခေတ်သစ် မြန်မာ့ဖက်ရှင်နှင့် မဂ္ဂဇင်းကာဗာ',
      'Room 6-8: မင်္ဂလာဆောင်၊ မိသားစုစုံညီနှင့် သဘာဝရှုခင်း'
    ],
    keyFeaturesEn: [
      'Room 1: Royal Court & Traditional Silk Suite',
      'Room 2: Newborn & Milestone Baby Studio',
      'Room 3: Revered Elder Archival Portrait',
      'Room 4: Monastic Peace & Bagan Monastery',
      'Room 5: Modern Burmese High Fashion Editorial',
      'Room 6-8: Wedding, Family, and Landscape Sets'
    ],
    proTipMm: 'အခန်းတစ်ခုစီတွင် Reference Photo တင်သွင်းထားပါက ကာရိုက်တာ မျက်နှာသွင်ပြင် မပြောင်းလဲစေရန် Face Lock စနစ် အလိုအလျောက် ချိန်ညှိပေးပါသည်။',
    proTipEn: 'Uploading a reference photo locks facial likeness into the room prompt seamlessly.',
    speakerNotesMm: 'ဖောက်သည်အား အချိန်မကုန်စေဘဲ အမြန်ဆုံး အထွက်ရလဒ်ပြသလိုပါက ဤ 8-Room Suite ကို အဓိက ညွှန်ပြပါ။',
    speakerNotesEn: 'Point clients to this section for one-click results with minimal configuration.',
    illustrationBadge: '🏛️ 8 Cultured Rooms'
  },
  {
    id: 'pro-workstation',
    sectionId: 'pro-workstation',
    categoryMm: 'ပရော်ဖက်ရှင်နယ် အလုပ်ခွင်',
    categoryEn: 'Professional Workstation',
    titleMm: 'Pro Workstation (Capture One & Lightroom စတိုင်) အသုံးပြုနည်း',
    titleEn: 'Capture One & Lightroom Style Studio Workstation',
    subtitleMm: 'ကင်မရာ Body, Lens Focal Length (35mm/50mm/85mm), 3-Point Studio Lighting နှင့် Color Grading အပြည့်အစုံ',
    subtitleEn: 'Pro photographer workstation with focal lengths, 3-point lighting setups, and film profiles',
    icon: 'wb_iridescent',
    badge: 'Pro Capture',
    badgeColor: 'bg-[#ffd02f] text-[#1c1c1e]',
    summaryMm: 'ပရော်ဖက်ရှင်နယ် ဓာတ်ပုံဆရာများ အကြိုက်တွေ့စေမည့် ကိရိယာဖြစ်ပြီး Hasselblad X2D, Sony A7R V, Leica M11 ကင်မရာများ၊ Rembrandt / Butterfly အလင်းပေးနည်းများနှင့် Kodak Portra ရုပ်ရှင်ကာလာများကို စိတ်ကြိုက် ချိန်ညှိနိုင်ပါသည်။',
    summaryEn: 'Simulates flagship medium format cameras, precision focal lengths (85mm f/1.2, 50mm f/1.4), Rembrandt lighting angles, and Kodak/Fujifilm color grading.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Lens Panel တွင် 35mm (Environment), 50mm (Natural), 85mm/135mm (Portrait Bokeh) ကို ရွေးချယ်ပါ။' },
      { step: 'အဆင့် ၂', desc: 'Lighting Setup တွင် Key Light, Fill Light, Rim Light နှင့် Golden Hour အလင်းထောင့် (Angle) ကို ချိန်ညှိပါ။' },
      { step: 'အဆင့် ၃', desc: 'Film Stock & Color Grade တွင် Kodak Portra 400 သို့မဟုတ် CineStill 800T ကို ရွေးချယ်ပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Select lens focal length: 35mm wide narrative, 50mm human perspective, or 85mm dreamy bokeh.' },
      { step: 'Step 2', desc: 'Configure key/fill/rim ratio and light source angle.' },
      { step: 'Step 3', desc: 'Apply cinematic film stocks like Kodak Portra 400 or CineStill 800T.' }
    ],
    keyFeaturesMm: [
      'ကင်မရာ အလင်းထိန်းချုပ်မှု (Rembrandt, Split, Butterfly, Loop)',
      'Hasselblad, Sony, Leica နှင့် Canon EOS R5 စံနှုန်းများ',
      'Depth of Field (f/1.2 မှ f/8 အထိ) စိတ်ကြိုက် သတ်မှတ်နိုင်ခြင်း',
      'Skin Retouching (သဘာဝအတိုင်း ချွေးပေါက်မပျက် စိုပြေစေခြင်း)'
    ],
    keyFeaturesEn: [
      'Cinematic lighting topologies (Rembrandt, Butterfly, Rim)',
      'Flagship sensor profiles (Hasselblad, Sony, Leica)',
      'Aperture control (f/1.2 creamy bokeh down to f/8 sharp landscape)',
      'Micro-texture skin retouching preserving natural pores'
    ],
    proTipMm: 'မြန်မာ့ပုဆိုး၊ ထဘီ ပိုးထည်အရေးအကြောင်းများ ပေါ်လွင်စေရန် Rim Light (အနားသတ်အလင်း) ကို 45 ဒီဂရီတွင် အသုံးပြုပါ။',
    proTipEn: 'Use 45-degree rim lighting to accentuate hand-woven silk sheen and gold embroidery.',
    speakerNotesMm: 'ဓာတ်ပုံပညာရှင်များအား ရှင်းပြရာတွင် ဤအခန်းသည် ဓာတ်ပုံဆရာများ၏ အလင်းနှင့် ကင်မရာ အခေါ်အဝေါ်အတိုင်း တိကျစွာ ရေးသားထားကြောင်း ပြသပါ။',
    speakerNotesEn: 'Explain to commercial photographers how aperture and light ratios translate directly into Midjourney prompt weights.',
    illustrationBadge: '📷 85mm f/1.2 Bokeh'
  },
  {
    id: 'composite-harmonizer',
    sectionId: 'composite-harmonizer',
    categoryMm: 'သီးသန့် စတူဒီယိုခန်းများ',
    categoryEn: 'Dedicated Studio Rooms',
    titleMm: 'Background Changer & အသင့်သုံး Presets ၂၄+ ခု အသုံးပြုနည်း',
    titleEn: 'Background Changer & 24+ Curated Heritage Presets',
    subtitleMm: 'လူပုံနှင့် နောက်ခံကို အလင်းအမှောင် သဘာဝကျကျ ရောစပ်ပေးသော Composite Harmonizer',
    subtitleEn: 'Seamless environmental background replacement with realistic contact shadows and ambient bounce',
    icon: 'wallpaper',
    badge: '24+ Presets',
    badgeColor: 'bg-[#fff8e0] text-[#746019]',
    summaryMm: 'ပုဂံနေထွက်၊ ရွှေတိဂုံ ရွှေရောင်စူးစူး၊ အင်းလေးရေပြင်၊ အင်းဝတံတား၊ ကိုလိုနီခေတ် ဟိုတယ်နှင့် ခေတ်မီ မိုးမျှော်တိုက် စသည့် မြန်မာပြည် အထင်ကရ နောက်ခံ ၂၄ ခုကျော်ကို ကလစ်တစ်ချက်ဖြင့် ပြောင်းလဲပေးနိုင်ပါသည်။',
    summaryEn: 'Features 24+ curated heritage and modern Burmese backgrounds across 6 categories with contact shadow generators and ambient light harmonization.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Foreground Subject (လူပုံ) ကို Upload တင်သွင်းပါ (သို့မဟုတ် Preset Character ကို သုံးပါ)။' },
      { step: 'အဆင့် ၂', desc: 'Background Categories (Landmarks, Historical, Cultural, Nature, Urban, Minimalist) မှ နှစ်သက်ရာ Preset ကို ရွေးပါ။' },
      { step: 'အဆင့် ၃', desc: 'Lighting Angle နှင့် Contact Shadow ကို ချိန်ညှိပြီး "Generate Harmonized Prompt" ကို နှိပ်ပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Upload the subject photo or keep default model portrait.' },
      { step: 'Step 2', desc: 'Choose from 24+ presets (Bagan Sunrise, Shwedagon Spire, Inle Lake, Colonial Villa).' },
      { step: 'Step 3', desc: 'Adjust light direction, shadow softness, and generate harmonized composite prompt.' }
    ],
    keyFeaturesMm: [
      'အမျိုးအစား ၆ မျိုးခွဲထားသော Presets ၂၄+ ခု (Heritage, Cultural, Nature, Urban, etc.)',
      'Contact Shadow Generator (လူခြေထောက်နှင့် ကြမ်းပြင်ထိစပ်ရာ အရိပ်ကို သဘာဝကျစေခြင်း)',
      'Ambient Light Bounce (နောက်ခံ အလင်းရောင်သည် လူပုံအပေါ် ပြန်ဟပ်စေခြင်း)',
      'စိတ်ကြိုက် ကိုယ်ပိုင် နောက်ခံပုံ (Custom Upload) တင်သွင်းနိုင်ခြင်း'
    ],
    keyFeaturesEn: [
      '24+ presets across 6 curated cultural categories',
      'Contact shadow modeling ensuring feet contact surface realistically',
      'Ambient bounce matching subject skin tones to sunset or pagoda gold',
      'Custom background upload support'
    ],
    proTipMm: 'ပုဂံနေထွက်နောက်ခံ ရွေးချယ်ပါက Golden Hour Preset ကို အတူတွဲသုံးလျှင် ရွှေရောင်အလင်း အပြည့်အဝ ရရှိပါမည်။',
    proTipEn: 'Pair Bagan sunrise with golden hour lighting for an authentic warm temple morning glow.',
    speakerNotesMm: 'ဖောက်သည်များ ဓာတ်ပုံရိုက်ပြီး နောက်ခံမလှ၍ စိတ်ညစ်ရခြင်းကို ဤစနစ်ဖြင့် စက္ကန့်ပိုင်းအတွင်း ဖြေရှင်းပေးနိုင်ကြောင်း ရှင်းပြပါ။',
    speakerNotesEn: 'Demonstrate how portrait studios can rescue flat indoor shots by dropping them into majestic historical backdrops.',
    illustrationBadge: '🌅 24+ Presets'
  },
  {
    id: 'photo-manipulation',
    sectionId: 'photo-manipulation',
    categoryMm: 'အနုပညာ အသွင်ပြောင်းခြင်း',
    categoryEn: 'Artistic Photo FX',
    titleMm: 'Photo Manipulation Studio (စိတ်ကြိုက်ပုံတင်သွင်းခြင်းနှင့် Style Presets)',
    titleEn: 'Photo Manipulation Studio: Custom Upload & Style Presets Guide',
    subtitleMm: 'မိမိဓာတ်ပုံကို တင်သွင်းပြီး စကြဝဠာ ဂလက်ဆီ၊ ပုဂံဆည်းဆာ Double Exposure၊ ၂၄ ကာရက် ရွှေဆိုင်းနှင့် ဆိုင်ဘာနီယွန် အနုပညာ အသွင်ပြောင်းလဲခြင်း',
    subtitleEn: 'Transform custom photos with surreal double exposures, 24K gold leaf, cyberpunk neon, and artistic style presets',
    icon: 'auto_fix_high',
    badge: 'FX & Styles',
    badgeColor: 'bg-[#ede9fe] text-[#5b21b6]',
    summaryMm: 'မည်သည့် ဓာတ်ပုံကိုမဆို တင်သွင်းပြီး စိတ်ကူးယဉ် အနုပညာ စတိုင်များ (Surreal, Sci-Fi Cyberpunk, Burmese Gold Leaf Fusion, Oil & Watercolor) ကို Live GPU/Canvas ဖြင့် စက္ကန့်ပိုင်းအတွင်း ပြောင်းလဲနိုင်ပြီး အခမဲ့ 8K PNG တိုက်ရိုက် ဒေါင်းလုဒ် ရယူနိုင်ပါသည်။',
    summaryEn: 'Empowers users to upload any portrait or scene and apply curated artistic style presets (Cosmic Galaxy, Bagan Sunset Silhouette, 24K Shwe-Cha Gold Leaf, Cyberpunk Neon) with live split-slider comparison and instant 8K PNG export.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: '"Upload Custom Photo" ဖြင့် မိမိ စက်ထဲမှ ဓာတ်ပုံ တင်သွင်းပါ (သို့မဟုတ် အသင့်ပါ နမူနာပုံကို ရွေးပါ)။' },
      { step: 'အဆင့် ၂', desc: 'Style Presets (Celestial Galaxy, Bagan Double Exposure, 24K Gold Leaf, Cyberpunk) ထဲမှ နှစ်သက်ရာ စတိုင်ကို ရွေးပါ။' },
      { step: 'အဆင့် ၃', desc: 'Fine-Tuning Sliders ဖြင့် အလင်း၊ အမှောင်၊ Bloom Glow၊ RGB Split နှင့် Aura Particles များကို လိုသလို ညှိယူပါ။' },
      { step: 'အဆင့် ၄', desc: '"Download Photo (.PNG)" ဖြင့် စက်ထဲသို့ တိုက်ရိုက် သိမ်းဆည်းပါ (သို့မဟုတ် AI Prompt ကို ကူးယူသုံးစွဲပါ)။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Click "Upload Custom Photo" or drag-and-drop your image (or choose a curated sample portrait).' },
      { step: 'Step 2', desc: 'Select a style preset: Celestial Galaxy, Bagan Double Exposure, 24K Gold Foil, Cyberpunk Neon, or Oil Impasto.' },
      { step: 'Step 3', desc: 'Fine-tune style strength, warmth, bloom glow, chromatic aberration, and particle auras.' },
      { step: 'Step 4', desc: 'Click "Download Photo (.PNG)" for instant high-res file export, or copy the synthesized master prompt.' }
    ],
    keyFeaturesMm: [
      'Custom Photo Upload (Drag & Drop နှင့် မည်သည့် ပုံမဆို လက်ခံနိုင်ခြင်း)',
      'Curated Style Presets (စကြဝဠာ၊ ပုဂံရှေးဟောင်း၊ ရွှေဆိုင်း၊ ဆိုင်ဘာနီယွန်၊ ရေဆေး)',
      'Live Split-Slider (မူရင်းပုံနှင့် အနုပညာ အသွင်ပြောင်းပုံကို တိုက်ရိုက် နှိုင်းယှဉ်နိုင်ခြင်း)',
      'FX Layer Controls (Bloom, Chromatic RGB Split, Particles, 35mm Grain)',
      'Instant 8K PNG Export (စက်ထဲသို့ အခမဲ့ တိုက်ရိုက် ဒေါင်းလုဒ် ရယူနိုင်ခြင်း)'
    ],
    keyFeaturesEn: [
      'Custom photo upload with drag-and-drop support',
      'Curated style presets across Surreal, Cinematic, Burmese Fusion, and Painterly',
      'Interactive before/after split slider and side-by-side comparative views',
      'Pixel-level canvas shaders: Bloom, chromatic RGB split, particle auras, 35mm grain',
      'Instant zero-latency 8K PNG download with master AI prompt synthesis'
    ],
    proTipMm: 'ပုဂံရှေးဟောင်းပုံများတွင် "Shwe-Cha 24K Gold Leaf" သို့မဟုတ် "Bagan Double Exposure" Preset ကို သုံးပါက မြန်မာ့ရိုးရာ အနုပညာ တန်ဖိုး အမြင့်ဆုံး ရရှိစေပါသည်။',
    proTipEn: 'Use "Shwe-Cha 24K Gold Leaf" or "Bagan Double Exposure" for cultural portraits to evoke authentic antique royalty aesthetics.',
    speakerNotesMm: 'ဖောက်သည်အား ရိုးရိုးဓာတ်ပုံမှ ရင်သပ်ရှုမောဖွယ် အနုပညာ လက်ရာအဖြစ် ပြောင်းလဲပုံကို Split-Slider ဆွဲပြခြင်းဖြင့် အထင်ကြီးစေနိုင်ပါသည်။',
    speakerNotesEn: 'Demonstrate the split-slider to clients to showcase how ordinary headshots transform into museum-grade fine art.',
    illustrationBadge: '🎨 Custom FX'
  },
  {
    id: 'photo-to-text',
    sectionId: 'photo-to-text',
    categoryMm: 'AI ပြောင်းပြန် စနစ်',
    categoryEn: 'AI Reverse Engineering',
    titleMm: 'Photo to Text Generator (ဓာတ်ပုံမှ စာသား/Prompt ထုတ်ယူနည်း)',
    titleEn: 'Photo to Text AI Reverse Engineering Guide',
    subtitleMm: 'မိမိ ကြိုက်နှစ်သက်သော ဓာတ်ပုံကို တင်သွင်းရုံဖြင့် AI က ကင်မရာ၊ ဝတ်စုံနှင့် အလင်းအမှောင် Prompt ပြန်ထုတ်ပေးခြင်း',
    subtitleEn: 'Reverse engineer any reference photo into professional Midjourney & Flux prompt blueprints',
    icon: 'auto_fix_normal',
    badge: 'AI Reverse',
    badgeColor: 'bg-[#ffd02f] text-[#1c1c1e]',
    summaryMm: 'ဖောက်သည် သို့မဟုတ် မိမိထံတွင် ရှိပြီးသား ဓာတ်ပုံတစ်ပုံကို Upload တင်သွင်းလိုက်ရုံဖြင့် အဆိုပါပုံ၏ ဝတ်စုံဒီဇိုင်း၊ ခေတ်ကာလ၊ အလင်းထောင့်၊ ကင်မရာအမျိုးအစားနှင့် အနုစိတ်အချက်အလက်များကို AI ဖြင့် ခွဲခြမ်းစိတ်ဖြာပြီး Master Prompt အဖြစ် ပြောင်းလဲပေးပါသည်။',
    summaryEn: 'Upload any existing photo to dissect its garment details, era markers, light angles, camera hardware, and color tones into a clean, reusable prompt.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Drag & Drop ဖြင့် ဓာတ်ပုံကို Upload Box ထဲသို့ ဆွဲထည့်ပါ (သို့မဟုတ် နမူနာပုံကို ရွေးပါ)။' },
      { step: 'အဆင့် ၂', desc: 'Analysis Mode တွင် Detail Analysis သို့မဟုတ် Style Extraction ကို ရွေးချယ်ပါ။' },
      { step: 'အဆင့် ၃', desc: 'ခွဲခြမ်းစိတ်ဖြာပြီး ထွက်လာသော Prompt ကို Prompt Matrix ထဲသို့ ပေးပို့ပြင်ဆင်နိုင်ပါသည်။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Drag & drop any reference photo into the reverse analysis dropzone.' },
      { step: 'Step 2', desc: 'Choose between Full Structural Deconstruction or Style Palette Extraction.' },
      { step: 'Step 3', desc: 'Review detected attributes and send directly to Matrix or Studio Desk.' }
    ],
    keyFeaturesMm: [
      'ပုံတစ်ပုံလုံး၏ ပိုးထည်ဒီဇိုင်းနှင့် လက်ဝတ်ရတနာ ခွဲခြမ်းစိတ်ဖြာမှု',
      'အလင်းရောင်နှင့် ကင်မရာ အနေအထား အလိုအလျောက် တွက်ချက်ဖော်ပြခြင်း',
      'Midjourney v6.1 Multi-Weight (::2, ::1) Syntax အလိုအလျောက် ထုတ်ပေးခြင်း',
      'Burmese Cultural Tags ခွဲခြားသတ်မှတ်ခြင်း'
    ],
    keyFeaturesEn: [
      'Automatic silk pattern and jewelry deconstruction',
      'Lighting topology and camera sensor estimation',
      'Multi-prompt weighted syntax creation (::2, ::1.5)',
      'Burmese cultural heritage tagging'
    ],
    proTipMm: 'ထွက်ပေါ်လာသော Prompt ထဲမှ အနုတ်လက္ခဏာ (Negative elements) များကို Prompt Utility ဖြင့် အလွယ်တကူ သန့်စင်နိုင်ပါသည်။',
    proTipEn: 'Clean up unnecessary background clutter from the reversed prompt using the Negative Matrix in Utility suite.',
    speakerNotesMm: 'ဖောက်သည်က "ဒီပုံစံမျိုးလေး လိုချင်တယ်" ဟု ပုံပြလာပါက ဤ Photo to Text ကဏ္ဍဖြင့် ချက်ချင်း Prompt ပြောင်းလဲပြသနိုင်ပါသည်။',
    speakerNotesEn: 'Show users how to reproduce client inspiration images faithfully without guessing parameters.',
    illustrationBadge: '🔍 Smart Deconstruct'
  },
  {
    id: 'prompt-builder',
    sectionId: 'prompt-builder',
    categoryMm: 'အဓိက စနစ်',
    categoryEn: 'Core Engine',
    titleMm: 'Burmese Prompt Matrix အသေးစိတ် အသုံးပြုနည်း',
    titleEn: 'Burmese Prompt Matrix Deep Dive',
    subtitleMm: 'တိုင်းရင်းသား ၁၃၅ မျိုး၊ ခေတ်ကာလ (ပုဂံ၊ အင်းဝ၊ ကုန်းဘောင်) နှင့် ဝတ်စုံ ရွေးချယ်မှု စနစ်',
    subtitleEn: 'Comprehensive ethnic, dynasty (Bagan, Innwa, Konbaung), and traditional costume selector matrix',
    icon: 'auto_fix_high',
    badge: 'Matrix Core',
    badgeColor: 'bg-[#1c1c1e] text-[#ffd02f]',
    summaryMm: 'ဤအက်ပ်၏ နှလုံးသည် Burmese Prompt Matrix ဖြစ်ပါသည်။ ဇာတ်ကောင်၊ အခမ်းအနား (သင်္ကြန်၊ သီတင်းကျွတ်)၊ ရှေးဟောင်းနေရာ၊ ရိုးရာဝတ်စုံ၊ ကင်မရာနှင့် အရည်အသွေးတို့ကို တစ်ဆင့်ချင်း ရွေးချယ်နိုင်သော စနစ်ဖြစ်ပါသည်။',
    summaryEn: 'The powerhouse core of the app: granularly select ethnic identity, festive events, royal court silks, jewelry, and camera settings with live syntax preview.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Subject & Ethnicity တွင် ကာရိုက်တာ (အမျိုးသမီး/အမျိုးသား/စုံတွဲ) နှင့် တိုင်းရင်းသားမျိုးနွယ်ကို ရွေးပါ။' },
      { step: 'အဆင့် ၂', desc: 'Garments & Historical Era တွင် ပုဂံ၊ အင်းဝ သို့မဟုတ် ကုန်းဘောင်ခေတ် ရိုးရာပိုးထည်ဝတ်စုံကို ရွေးပါ။' },
      { step: 'အဆင့် ၃', desc: 'Lighting, Camera & Retouching ကို သတ်မှတ်ပြီး ညာဘက်ရှိ Live Prompt Output တွင် ရလဒ်ကို ကြည့်ရှုပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Configure Subject (Female/Male/Couple) and ethnic identity.' },
      { step: 'Step 2', desc: 'Select Dynasty attire (Bagan, Pinya, Innwa, Toungoo, Konbaung) and textiles.' },
      { step: 'Step 3', desc: 'Tune camera, lighting, and aspect ratio to watch live prompt generation on the right.' }
    ],
    keyFeaturesMm: [
      'တိုင်းရင်းသား ရိုးရာဝတ်စုံ အသေးစိတ် (ကချင်၊ ကယား၊ ကရင်၊ ချင်း၊ မွန်၊ ဗမာ၊ ရခိုင်၊ ရှမ်း)',
      'သနပ်ခါး၊ ပုသိမ်ထီး၊ မိုးကုတ်ပတ္တမြား စသည့် Cultural Props များ',
      'Face Lock / Reference Image ချိတ်ဆက်မှု စနစ်',
      'Midjourney Parameters (--ar 16:9 --v 6.1 --style raw) အလိုအလျောက် ပေါင်းစပ်ခြင်း'
    ],
    keyFeaturesEn: [
      'Ethnic heritage options (Kachin, Kayah, Karen, Chin, Mon, Bamar, Rakhine, Shan)',
      'Cultural props: Thanakha patterns, Pathein parasols, Mogok rubies',
      'Identity lock / Reference face integration',
      'Auto-synthesized Midjourney parameters (--ar 16:9, --style raw, --chaos)'
    ],
    proTipMm: 'ရိုးရာဝတ်စုံတွင် "Woven Silk with Water Droplets" ကို ရွေးပါက ရေစက်ကလေးများဖြင့် သင်္ကြန်ပွဲတော် အငွေ့အသက်ကို ပိုမို ပီပြင်စေပါသည်။',
    proTipEn: 'Combine "Woven Silk" with "Golden Hour" for realistic refractive embroidery sheen.',
    speakerNotesMm: 'Prompt ရေးရာတွင် အချိန်ကုန်သက်သာစေရန် Matrix သည် အချက်အလက် ၃၀ ကျော်ကို တစ်ပြိုင်နက် စီစဉ်ပေးကြောင်း အလေးထား ပြောကြားပါ။',
    speakerNotesEn: 'Highlight that the matrix synthesizes over 30 micro-parameters in standard industry notation automatically.',
    illustrationBadge: '🧩 30+ Dimensions'
  },
  {
    id: 'baby-studio',
    sectionId: 'baby-studio',
    categoryMm: 'သီးသန့် စတူဒီယိုခန်းများ',
    categoryEn: 'Dedicated Studio Rooms',
    titleMm: 'Baby Studio (ရင်သွေးငယ် အမှတ်တရ စတူဒီယို Theme ၁၂ ခု)',
    titleEn: 'Baby Studio: 12 Milestone Myanmar Themes',
    subtitleMm: 'သနပ်ခါးပါးကွက်၊ ဆံရစ်ဝိုင်း၊ ပုခက်လွှဲနှင့် ရှင်ပြု ရင်သွေးငယ် အမှတ်တရ ဓာတ်ပုံများ ဖန်တီးနည်း',
    subtitleEn: 'Milestone baby photography studio with Thanakha cheeks, cradle setups, and royal costumes',
    icon: 'child_care',
    badge: '12 Themes',
    badgeColor: 'bg-[#ffebee] text-[#c62828]',
    summaryMm: 'ကလေးငယ်များ၏ အမှတ်တရ ဓာတ်ပုံများအတွက် ရိုးရာ ပုခက်လွှဲ၊ ဆံရစ်ဝိုင်း၊ ရှင်ပြုမောင်ရှင်လောင်း၊ သနပ်ခါး ဘီးကျဲနှင့် ခေတ်မီ မွေးနေ့ အလှဆင် Theme ၁၂ ခုကို အသင့်ရွေးချယ် အသုံးပြုနိုင်ပါသည်။',
    summaryEn: 'Designed specifically for newborn and toddler milestone photography with 12 handcrafted cultural themes, safety-first lighting presets, and cute accessories.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Baby Age & Milestone (မွေးကင်းစ၊ ၆ လ၊ ၁ နှစ်၊ ၃ နှစ်) ကို ရွေးချယ်ပါ။' },
      { step: 'အဆင့် ၂', desc: 'Theme ၁၂ ခုမှ နှစ်သက်ရာ (ဥပမာ- သနပ်ခါးပါးကွက် ဆံရစ်ဝိုင်း သို့မဟုတ် နန်းတွင်းမင်းသားလေး) ကို ရွေးပါ။' },
      { step: 'အဆင့် ၃', desc: 'အလင်းအမှောင်ကို Soft Window Light (နူးညံ့သော အလင်း) ဖြင့် အသင့်သုံး Prompt ရယူပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Select baby milestone (Newborn, 100-Day, 1-Year, Toddler).' },
      { step: 'Step 2', desc: 'Pick from 12 themes (Thanakha Cheeks, Woven Rattan Cradle, Little Prince).' },
      { step: 'Step 3', desc: 'Apply ultra-soft diffused baby lighting and copy prompt.' }
    ],
    keyFeaturesMm: [
      'Theme ၁၂ ခု (ရိုးရာဆံရစ်ဝိုင်း၊ ပုခက်လွှဲ၊ သနပ်ခါး၊ ရှင်ပြု၊ ပထမမွေးနေ့)',
      'ကလေးငယ် မျက်နှာ အသားအရေ နူးညံ့ချောမွေ့စေသော Retouching Presets',
      'ရိုးရာ ကြိမ်ပုခက်၊ သနပ်ခါးကျောက်ပြင် နှင့် ကစားစရာ Props များ',
      'မိဘနှင့် ကလေး စုံတွဲ Portrait ပေါင်းစပ်မှု'
    ],
    keyFeaturesEn: [
      '12 milestone packages (Rattan cradle, Thanakha cheeks, Little novice, 1st birthday)',
      'Baby-safe diffused lighting presets preventing harsh flash shadows',
      'Burmese handcrafted cultural props (Rattan cradle, Kyauk Pyin, traditional toys)',
      'Parent and child bonding composition presets'
    ],
    proTipMm: 'ကလေးငယ်များအတွက် အလင်းပေးရာတွင် "Soft Diffused Daylight" ကို ရွေးချယ်ပါက မျက်လုံးစူးရှမှု ကင်းဝေးပြီး သဘာဝကျသော ပုံရိပ်ကို ရရှိပါမည်။',
    proTipEn: 'Always pair baby portraits with diffused north-facing window light to keep skin porcelain smooth.',
    speakerNotesMm: 'မိဘများ အထူးနှစ်သက်သော ကလေးဓာတ်ပုံ ဝန်ဆောင်မှုအတွက် စတူဒီယိုများ ငွေကြေးအကျိုးအမြတ် ရရှိစေမည့် အခန်းဖြစ်ကြောင်း အကြံပြုပါ။',
    speakerNotesEn: 'Demonstrate how commercial photo studios can create a lucrative new revenue stream with baby milestone portrait packages.',
    illustrationBadge: '👶 12 Baby Themes'
  },
  {
    id: 'old-to-new',
    sectionId: 'old-to-new',
    categoryMm: 'ဓာတ်ပုံဟောင်း ပြုပြင်ခြင်း',
    categoryEn: 'Restoration Suite',
    titleMm: 'Old Photo to New Photo (ဓာတ်ပုံဟောင်း ပြန်လည်မွမ်းမံခြင်း)',
    titleEn: 'Old to New Photo Studio (AI Restoration & 8K Colorize)',
    subtitleMm: 'အဖြူအမည်း၊ စုတ်ပြဲ၊ ဝါးနေသော ရှေးဟောင်း ဓာတ်ပုံများကို 8K ရောင်စုံ ကာလာသွင်းပြီး အသစ်စက်စက် ဖန်တီးနည်း',
    subtitleEn: 'Restore faded, scratched, sepia, and monochrome vintage photos into 8K realistic full-color portraits',
    icon: 'photo_camera_back',
    badge: 'AI Restore',
    badgeColor: 'bg-[#c3faf5] text-[#187574]',
    summaryMm: 'မိဘဘိုးဘွားများ၏ ရှေးခေတ် အဖြူအမည်း ဓာတ်ပုံများ၊ စုတ်ပြဲနေသော ပုံဟောင်းများကို AI ဖြင့် မျက်နှာကြည်လင်စေခြင်း၊ အရောင်သဘာဝကျကျ ထည့်သွင်းခြင်းနှင့် 8K စတူဒီယို ဓာတ်ပုံအဖြစ် ပြန်လည် မွေးဖွားပေးပါသည်။',
    summaryEn: 'Bring ancestral heritage photos back to life: repair tears, colorize sepia prints according to authentic era dyes, and upscale to medium-format resolution.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'ဓာတ်ပုံဟောင်း (အဖြူအမည်း သို့မဟုတ် အရောင်မှိန်နေသောပုံ) ကို Upload တင်ပါ။' },
      { step: 'အဆင့် ၂', desc: 'ခေတ်ကာလ (ဥပမာ- ၁၉၅၀ လွတ်လပ်ရေးခေတ် သို့မဟုတ် ၁၉၇၀ ရန်ကုန်တက္ကသိုလ်ခေတ်) ကို သတ်မှတ်ပါ။' },
      { step: 'အဆင့် ၃', desc: 'Colorization Profile နှင့် Detail Upscale ကို ရွေးချယ်ပြီး Master Restoration Prompt ကို ထုတ်ယူပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Upload vintage monochrome or damaged ancestral photograph.' },
      { step: 'Step 2', desc: 'Tag estimated era (e.g., 1950s Independence, 1970s Rangoon University).' },
      { step: 'Step 3', desc: 'Select natural skin colorization tone and export restoration prompt.' }
    ],
    keyFeaturesMm: [
      'အစင်းခြစ်ရာ၊ အစက်အပြောက်နှင့် စက္ကူစုတ်ပြဲမှုများ ပြုပြင်ဖယ်ရှားခြင်း',
      'မြန်မာ့အသားအရေနှင့် ကိုက်ညီသော သဘာဝ ကာလာသွင်းစနစ် (Colorize)',
      'ခေတ်ကာလအလိုက် တိကျသော အဝတ်အစား အရောင်ဖော်ထုတ်မှု',
      '8K Ultra-Clarity မျက်လုံး၊ နှုတ်ခမ်းနှင့် ဆံပင် အသေးစိတ် ဖော်ပြချက်'
    ],
    keyFeaturesEn: [
      'Scratch, dust, and crease removal prompts',
      'Authentic Southeast Asian skin undertone restoration',
      'Period-accurate textile dye coloration',
      '8K iris, hair strand, and facial structure reconstruction'
    ],
    proTipMm: 'ခေတ်ဟောင်းဓာတ်ပုံများတွင် "Preserve Original Face Structure 100%" ကို အမှန်ခြစ်ထားပါက မိဘဘိုးဘွားများ၏ မူရင်းမျက်နှာသွင်ပြင် မပျက်ယွင်းစေပါ။',
    proTipEn: 'Always enforce 100% facial geometry preservation so likeness is never altered.',
    speakerNotesMm: 'ဖောက်သည်ဟောင်းများ၏ အမှတ်တရ ဓာတ်ပုံများ ပြန်လည်ပြုပြင်ခြင်းသည် စတူဒီယိုတိုင်းအတွက် အလွန်တန်ဖိုးရှိသော ဝန်ဆောင်မှုတစ်ခု ဖြစ်ပါသည်။',
    speakerNotesEn: 'Share how heirloom photo restoration commands high commercial margins for local photography studios.',
    illustrationBadge: '🕰️ 8K Heritage Restore'
  },
  {
    id: 'photo-edit',
    sectionId: 'photo-edit',
    categoryMm: 'အနုစိတ် ပြင်ဆင်ခြင်း',
    categoryEn: 'Inpainting & Retouching',
    titleMm: 'Photo Edit Studio (အဝတ်အစားလဲခြင်းနှင့် Inpaint စနစ်)',
    titleEn: 'Photo Edit Studio: Clothes Swap & Inpaint Matrix',
    subtitleMm: 'မျက်နှာ မပြောင်းလဲစေဘဲ ရိုးရာဝတ်စုံ အသစ်လဲလှယ်ခြင်း (Clothes Swap) နှင့် မလိုလားအပ်သော အရာများ ဖယ်ရှားခြင်း',
    subtitleEn: 'Inpaint retouching, seamless traditional clothes swap, and identity-locked studio modifications',
    icon: 'brush',
    badge: 'Inpaint',
    badgeColor: 'bg-[#f5f3ff] text-[#4262ff]',
    summaryMm: 'မိမိဓာတ်ပုံမှ မျက်နှာနှင့် ကိုယ်ဟန်ကို အတိအကျ ထိန်းသိမ်းထားပြီး ခေတ်မီ အနောက်တိုင်းဝတ်စုံမှ မြန်မာ့ရိုးရာ မဟာလတာ သို့မဟုတ် ပိုးထည်ဝတ်စုံသို့ အစားထိုးလဲလှယ်ပေးသော စနစ်ဖြစ်ပါသည်။',
    summaryEn: 'Keep the original person and pose 100% intact while surgically replacing their modern clothes with traditional royal silk attires, or inpainting flaws.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'မူရင်းပုံကို တင်သွင်းပြီး "Clothes Swap" သို့မဟုတ် "Inpaint Region" ကို ရွေးပါ။' },
      { step: 'အဆင့် ၂', desc: 'အစားထိုးလိုသော မြန်မာ့ရိုးရာ ဝတ်စုံဒီဇိုင်း (ဥပမာ- ရွှေချည်ထိုး ပုဆိုး သို့မဟုတ် ရင်ဖုံး အင်္ကျီ) ကို ရွေးပါ။' },
      { step: 'အဆင့် ၃', desc: 'Identity Lock ကို 100% ထားပြီး Prompt ထုတ်ယူကာ လဲလှယ်အသုံးပြုပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Upload subject image and activate Clothes Swap or Brush Inpainting.' },
      { step: 'Step 2', desc: 'Select replacement traditional attire (Gold embroidered longyi, silk Yinzi).' },
      { step: 'Step 3', desc: 'Set Identity Lock to 100% and generate surgical replacement prompt.' }
    ],
    keyFeaturesMm: [
      'Clothes Swap (ရိုးရာဝတ်စုံ အစားထိုးလဲလှယ်ခြင်း)',
      'Identity Lock (မျက်နှာနှင့် ဆံပင်ပုံစံ မူရင်းအတိုင်း ထိန်းသိမ်းမှု)',
      'Relighting (ဝတ်စုံအသစ်နှင့် မျက်နှာပေါ်ကျသော အလင်းကို တစ်သားတည်းဖြစ်စေခြင်း)',
      'Professional Headshot Generator (ကုမ္ပဏီနှင့် CV အတွက် ကုတ်အင်္ကျီ/ရိုးရာဝတ်စုံ ဖန်တီးခြင်း)'
    ],
    keyFeaturesEn: [
      'Clothes swap into ceremonial Burmese attire',
      'Strict identity lock preserving subject recognition',
      'Ambient relighting matching new clothes to head angle',
      'Professional corporate and traditional LinkedIn headshots'
    ],
    proTipMm: 'အဝတ်အစားလဲရာတွင် "Neckline Alignment" ကို အထူးသတိပြုရန် Prompt တွင် "Seamless neck transition" ကို အလိုအလျောက် ထည့်သွင်းပေးထားပါသည်။',
    proTipEn: 'The system automatically injects collar and neckline blend constraints for flawless joins.',
    speakerNotesMm: 'ဖောက်သည်များသည် ဈေးကြီးသော ရိုးရာဝတ်စုံ ငှားရမ်းစရာမလိုဘဲ ဤစနစ်ဖြင့် စိတ်ကြိုက် ဓာတ်ပုံရိုက်နိုင်ကြောင်း ရှင်းပြပါ။',
    speakerNotesEn: 'Explain how users can visualize luxury royal costumes without expensive physical rental fees.',
    illustrationBadge: '✨ Clothes Swap Pro'
  },
  {
    id: 'preset-library',
    sectionId: 'preset-library',
    categoryMm: 'သမိုင်းဝင် စတိုင်လ်များ',
    categoryEn: 'Historical Eras',
    titleMm: 'Preset & Eras Library (ခေတ်အလိုက် သမိုင်းဝင် စတိုင်လ်များ)',
    titleEn: 'Preset & Eras Library (Bagan to Modern Era)',
    subtitleMm: 'ပုဂံ၊ ပင်းယ၊ အင်းဝ၊ တောင်ငူ၊ ညောင်ရမ်း၊ ကုန်းဘောင် ခေတ်စတိုင်များကို သုတေသနပြု စီစဉ်ထားသော စာကြည့်တိုက်',
    subtitleEn: 'Academically verified historical dynasties: Bagan, Pinya, Innwa, Toungoo, Nyaungyan, Konbaung',
    icon: 'collections_bookmark',
    badge: '6 Dynasties',
    badgeColor: 'bg-[#fff8e0] text-[#746019]',
    summaryMm: 'မြန်မာ့သမိုင်း ခေတ်ကြီး ၆ ခေတ်၏ တိကျသော မင်းညီမင်းသား၊ မိဖုရားနှင့် သာမန်ပြည်သူတို့၏ ဝတ်စားဆင်ယင်မှု၊ ခေါင်းပေါင်း၊ ပုဝါနှင့် လက်ဝတ်ရတနာ စတိုင်များကို တစ်နေရာတည်းတွင် လေ့လာ ရွေးချယ်နိုင်ပါသည်။',
    summaryEn: 'Explore authentic museum-grade cultural presets from the 11th century Bagan Kingdom to 19th century Konbaung Royal Court, fully translated into AI prompt syntax.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Library ရှိ Dynasty Tabs (ပုဂံ၊ အင်းဝ၊ ကုန်းဘောင် စသည်) ကို နှိပ်ကြည့်ပါ။' },
      { step: 'အဆင့် ၂', desc: 'သမိုင်းဝင် Preset ကတ်ပြားများတွင် ဖော်ပြထားသော ရိုးရာ အချက်အလက်များကို ဖတ်ရှုပါ။' },
      { step: 'အဆင့် ၃', desc: '"Use Preset" ကို နှိပ်လိုက်သည်နှင့် Matrix ထဲသို့ သက်ဆိုင်ရာ ခေတ်ဝတ်စုံ အချက်အလက်များ အလိုအလျောက် ရောက်ရှိသွားပါမည်။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Browse dynasty tabs (Bagan, Innwa, Toungoo, Konbaung).' },
      { step: 'Step 2', desc: 'Review curated historical details and authentic jewelry names.' },
      { step: 'Step 3', desc: 'Click "Use Preset" to load the complete historical template into Matrix.' }
    ],
    keyFeaturesMm: [
      'ပုဂံခေတ် (၁၁-၁၃ ရာစု) ရွှေဆင်းတုတော်နှင့် ကျောက်စာခေတ် ဝတ်စုံများ',
      'အင်းဝခေတ် (၁၄-၁၆ ရာစု) ပိုးချည်ထည်နှင့် သစ်သားဗိသုကာ',
      'ကုန်းဘောင်ခေတ် (၁၈-၁၉ ရာစု) ရတနာပုံ နန်းတွင်း ဝတ်စုံနှင့် မဟူရာ အနားကွပ်',
      'ခေတ်ပေါ် (Contemporary) မြန်မာ့ဒီဇိုင်းနှင့် မော်ဒန် ဖက်ရှင်'
    ],
    keyFeaturesEn: [
      'Bagan Dynasty (11th-13th Century) terracotta and golden stupa aesthetics',
      'Innwa Dynasty (14th-16th Century) teak architecture and woven silk',
      'Konbaung Dynasty (18th-19th Century) Mandalay royal court embroidery',
      'Contemporary Burmese haute couture fusion'
    ],
    proTipMm: 'သမိုင်းဇာတ်ကား သို့မဟုတ် ဝတ္ထုကာဗာ ရေးဆွဲသူများအတွက် ဤ Eras Library သည် အချက်အလက် အတိကျဆုံး အထောက်အကူ ဖြစ်ပါသည်။',
    proTipEn: 'Ideal for period-drama producers and historical novel cover designers needing academic accuracy.',
    speakerNotesMm: 'မြန်မာ့ယဉ်ကျေးမှု မပျောက်ပျက်စေရန်နှင့် နိုင်ငံတကာ AI များတွင် မြန်မာ့စတိုင်လ် မှန်ကန်စွာ ပေါ်ထွက်စေရန် ဤစာကြည့်တိုက်ကို အထူးတည်ဆောက်ထားကြောင်း ရှင်းပြပါ။',
    speakerNotesEn: 'Stress how this library safeguards cultural authenticity against distorted generic Asian tropes in AI.',
    illustrationBadge: '📜 6 Historical Eras'
  },
  {
    id: 'prompt-utility',
    sectionId: 'prompt-utility',
    categoryMm: 'အထောက်အကူပြု ကိရိယာများ',
    categoryEn: 'Utility Suite',
    titleMm: 'Prompt Utility Suite (Negative Matrix & Secret Keywords)',
    titleEn: 'Prompt Utility Suite & Secret Keyword Boosters',
    subtitleMm: 'မလိုလားအပ်သော အရာများ ဖယ်ရှားပေးသည့် Negative Prompt၊ Token Counter နှင့် Secret Keywords များ',
    subtitleEn: 'Pro optimization toolkit with negative prompt matrix, token weight calculator, and secret quality boosters',
    icon: 'build',
    badge: 'Pro Utilities',
    badgeColor: 'bg-[#e8f5e9] text-[#2e7d32]',
    summaryMm: 'လက်ချောင်းမစုံခြင်း၊ မျက်နှာပုံပျက်ခြင်းနှင့် ကာတွန်းဆန်ခြင်းများကို ကာကွယ်ပေးသော Negative Prompt များ၊ Aspect Ratio Calculator နှင့် 8K Ultra-Detail Secret Keywords များကို စီမံပေးသော စနစ်ဖြစ်ပါသည်။',
    summaryEn: 'Ensures pristine image outputs by pruning AI artifacts (mutated hands, distorted pupils) with negative prompt matrices, token metrics, and aspect ratio converters.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'Negative Prompt Matrix တွင် မလိုလားအပ်သော အရာများ (Anatomy deformities, Cartoonish, Blur) ကို On ထားပါ။' },
      { step: 'အဆင့် ၂', desc: 'Secret Keywords Booster မှ Photorealistic, Ray Tracing, Subsurface Scattering စသည်တို့ကို ထည့်သွင်းပါ။' },
      { step: 'အဆင့် ၃', desc: 'Token Counter ဖြင့် Prompt ရှည်လျားမှုကို စစ်ဆေးပြီး အကောင်းဆုံး အနေအထားသို့ ညှိပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Toggle negative filters: anatomical flaws, blurry textures, cartoon stylization.' },
      { step: 'Step 2', desc: 'Enable secret booster keywords: Subsurface Scattering, Octane 8K, Hasselblad clarity.' },
      { step: 'Step 3', desc: 'Check token density gauge to keep syntax within model sweet spots.' }
    ],
    keyFeaturesMm: [
      'Anatomy Shield (လက်ချောင်းနှင့် မျက်ဝန်း ပုံမပျက်စေရန် အထူး Negative စကားလုံးများ)',
      'Burmese Cultural Negative (အခြားနိုင်ငံယဉ်ကျေးမှု ရောနှောမသွားစေရန် တားဆီးမှု)',
      'Aspect Ratio Preset Tool (Instagram 1:1, TikTok/Reels 9:16, Cinematic 16:9)',
      'Prompt Weight Inspector (::1.5, ::2 စသည့် အလေးချိန် ချိန်ညှိမှု)'
    ],
    keyFeaturesEn: [
      'Anatomy Shield preventing extra fingers and asymmetrical pupils',
      'Cultural Negative preventing inadvertent East-Asian clothing bleed',
      'Social Aspect Ratio presets (1:1 Square, 9:16 Vertical, 16:9 Landscape)',
      'Syntax weight inspector for Midjourney ::multi-prompts'
    ],
    proTipMm: 'မြန်မာ့ရိုးရာ ပုံများတွင် တရုတ် သို့မဟုတ် အိန္ဒိယ ဝတ်စုံများ ရောနှောမလာစေရန် Cultural Isolation Filter ကို အမြဲဖွင့်ထားပါ။',
    proTipEn: 'Keep the Cultural Isolation filter enabled to prevent generic Thai or Indian textile contamination.',
    speakerNotesMm: 'AI အသုံးပြုသူတိုင်း ကြုံတွေ့ရလေ့ရှိသော ပုံပျက်ခြင်းပြဿနာကို ဤ Utility ဖြင့် ဖြေရှင်းပေးနိုင်ကြောင်း သရုပ်ပြပါ။',
    speakerNotesEn: 'Showcase how the Anatomy Shield saves countless generation credits by reducing bad renders.',
    illustrationBadge: '🛡️ Anatomy Shield'
  },
  {
    id: 'saved-prompts',
    sectionId: 'saved-prompts',
    categoryMm: 'စုဆောင်းမှုနှင့် စီမံခန့်ခွဲမှု',
    categoryEn: 'Collections & Workflow',
    titleMm: 'Saved Prompts & Profile Management (မှတ်သားထားသော Prompt များ)',
    titleEn: 'Saved Prompts, Cloud Storage & Profile Management',
    subtitleMm: 'မိမိ ဖန်တီးထားသော အောင်မြင်သည့် Prompt များကို အကန့်အသတ်မရှိ သိမ်းဆည်း၊ Tag တပ်ပြီး ပြန်လည် အသုံးပြုနည်း',
    subtitleEn: 'Archive, tag, categorize, and reload your favorite prompt recipes instantly across sessions',
    icon: 'bookmarks',
    badge: 'Archive',
    badgeColor: 'bg-[#ffd02f] text-[#1c1c1e]',
    summaryMm: 'မိမိ စိတ်ကြိုက် ပြင်ဆင်ဖန်တီးထားသော Prompt များကို နာမည်ပေး သိမ်းဆည်းထားနိုင်ပြီး လိုအပ်သည့်အချိန်တွင် Matrix ထဲသို့ ကလစ်တစ်ချက်ဖြင့် ပြန်လည် ခေါ်ယူ အသုံးပြုနိုင်ပါသည်။',
    summaryEn: 'Organize your studio assets: save prompt recipes with thumbnail previews, search by tags, copy single-click, or export your personal prompt library.',
    stepsMm: [
      { step: 'အဆင့် ၁', desc: 'မည်သည့် အခန်းတွင်မဆို Prompt ထွက်လာပါက "Save to Collection" ခလုတ်ကို နှိပ်ပါ။' },
      { step: 'အဆင့် ၂', desc: 'Prompt အတွက် အမည်နှင့် Tag (ဥပမာ- "ပုဂံမင်္ဂလာဆောင်", "နန်းတွင်းကလေး") ကို ရိုက်ထည့်ပြီး သိမ်းပါ။' },
      { step: 'အဆင့် ၃', desc: 'Saved Prompts စာမျက်နှာတွင် အချိန်မရွေး ပြန်လည်ရှာဖွေပြီး "Load to Matrix" ဖြင့် အသုံးပြုပါ။' }
    ],
    stepsEn: [
      { step: 'Step 1', desc: 'Click "Save to Collection" on any generated prompt card.' },
      { step: 'Step 2', desc: 'Give your preset a recognizable title and tags (e.g. "Bagan Wedding", "Royal Baby").' },
      { step: 'Step 3', desc: 'Revisit Saved Prompts anytime to filter, search, or reload into the Matrix.' }
    ],
    keyFeaturesMm: [
      'LocalStorage ဖြင့် Browser အတွင်း အမြန်ဆုံး အလိုအလျောက် သိမ်းဆည်းခြင်း',
      'Tag အလိုက် (Wedding, Royal, Baby, Festival) စစ်ထုတ် ရှာဖွေနိုင်ခြင်း',
      'JSON / Text ဖိုင်ဖြင့် စုစည်း ထုတ်ယူနိုင်ခြင်း (Bulk Export)',
      'Credit နှင့် အသုံးပြုမှု စာရင်းဇယား Dashboard'
    ],
    keyFeaturesEn: [
      'Instant local storage caching across browser reloads',
      'Category tag filtering (Wedding, Heritage, Portrait, Fashion)',
      'Bulk export to JSON or formatted text file',
      'Usage statistics and credit tracker dashboard'
    ],
    proTipMm: 'ဖောက်သည်တစ်ဦးချင်းစီ၏ နာမည်ဖြင့် Tag တပ်ထားပါက နောင်တစ်ချိန်တွင် ထိုဖောက်သည်၏ စတိုင်လ်ကို စက္ကန့်ပိုင်းအတွင်း ပြန်လည် ခေါ်ယူနိုင်ပါသည်။',
    proTipEn: 'Tag prompts with client names for instant reproducibility on return photoshoot orders.',
    speakerNotesMm: 'ဒေတာများ ပျောက်ပျက်မသွားစေရန် LocalStorage တွင် လုံခြုံစွာ သိမ်းထားကြောင်းနှင့် လိုအပ်ပါက Supabase သို့ ချိတ်ဆက်နိုင်ကြောင်း ရှင်းပြပါ။',
    speakerNotesEn: 'Explain data persistence guarantees and how easily this connects to Supabase if multi-user team sync is needed.',
    illustrationBadge: '💾 Instant Recall'
  },
  {
    id: 'next-features',
    categoryMm: 'အနာဂတ် အစီအစဉ်',
    categoryEn: 'Roadmap & Next Recommendations',
    titleMm: 'Next Recommended Features (နောင်ထည့်သွင်းမည့် အကြံပြု Feature များ)',
    titleEn: 'Next Recommended Features & Studio Expansion Roadmap',
    subtitleMm: 'သင့် AI ဓာတ်ပုံစတူဒီယိုကို ပိုမို အဆင့်မြင့်သွားစေမည့် ထိပ်တန်း အကြံပြုချက် ၆ ခု',
    subtitleEn: 'Top 6 high-value features recommended to supercharge your commercial AI photography business',
    icon: 'rocket_launch',
    badge: 'Roadmap',
    badgeColor: 'bg-[#1c1c1e] text-[#ffd02f]',
    summaryMm: 'လက်ရှိ စတူဒီယိုစနစ်သည် အပြည့်အဝ ပြီးပြည့်စုံနေပြီဖြစ်ရာ စီးပွားဖြစ် ဓာတ်ပုံလုပ်ငန်းများ၊ စတူဒီယိုဆိုင်များနှင့် ဖောက်သည်ဝန်ဆောင်မှု ပိုမိုချောမွေ့စေရန် အောက်ပါ အဆင့်မြင့် Feature ၆ ခုကို ဆက်လက် အကောင်အထည်ဖော်ရန် အကြံပြုအပ်ပါသည်။',
    summaryEn: 'Here are the top 6 strategic features recommended next to turn this app into a full-scale commercial production platform for studios and agencies.',
    stepsMm: [
      { step: 'Feature 1', desc: 'AI Instant Face-Swap & Identity LoRA (ဖောက်သည်၏ မျက်နှာကို ဝတ်စုံထဲသို့ 100% တိကျစွာ အစားထိုးခြင်း)', tip: 'အလွန် လူကြိုက်များပြီး စီးပွားဖြစ် ဝင်ငွေ အမြန်ဆုံး ရရှိစေပါမည်။' },
      { step: 'Feature 2', desc: 'Batch Generation & Contact Sheet Grid (တစ်ပြိုင်နက် ကွဲပြားသော ပုံစံ ၄ မျိုးမှ ၈ မျိုးအထိ ထုတ်ယူပြသခြင်း)', tip: 'ဖောက်သည်အား ရွေးချယ်စရာ ချက်ချင်း ပြသနိုင်ပါသည်။' },
      { step: 'Feature 3', desc: 'Supabase Cloud Sync & Client Review Gallery (ဖောက်သည်များ ဖုန်းမှ ကြည့်ရှုအတည်ပြုနိုင်သော Cloud ပြခန်း)', tip: 'အဖွဲ့သားများနှင့် ဆိုင်ခွဲများ အတူတကွ အသုံးပြုနိုင်ပါသည်။' }
    ],
    stepsEn: [
      { step: 'Feature 1', desc: 'Instant AI Face-Swap & Identity LoRA for 100% likeness insertion onto generated bodies.' },
      { step: 'Feature 2', desc: 'Batch Generation & Contact Sheet Grid generating 4-8 style variations in one click.' },
      { step: 'Feature 3', desc: 'Supabase Cloud Sync & Client Review Portal for mobile proofing and approvals.' }
    ],
    keyFeaturesMm: [
      '၁။ AI Instant Face-Swap (မျက်နှာ တိကျစွာ အစားထိုးခြင်း)',
      '၂။ Batch Multi-Variation Generator (တစ်ပြိုင်နက် ၈ ပုံ ထုတ်ယူမှု)',
      '၃။ Supabase Cloud Sync (အွန်လိုင်း Cloud နှင့် အဖွဲ့လိုက် သုံးစွဲမှု)',
      '၄။ 8K Ultra-Upscaler & Vector Print Studio (ဘီလ်ဘုတ်အထိ ရိုက်နှိပ်နိုင်သော စနစ်)',
      '၅။ မြန်မာ့ပြက္ခဒိန်နှင့် ရာသီပွဲတော် အလိုအလျောက် ပွဲတော် Scheduler (Thingyan/Thadingyut)',
      '၆။ စတူဒီယို ကိုယ်ပိုင် Watermark & Brand Logo Stamp ထည့်သွင်းခြင်း'
    ],
    keyFeaturesEn: [
      '1. Instant Face-Swap with InsightFace / ReActor integration',
      '2. Batch multi-prompt runner with 4-up contact sheet previews',
      '3. Supabase Cloud Sync with multi-user permissions & client portals',
      '4. 8K Neural Super-Resolution upscaler for massive canvas printing',
      '5. Traditional Myanmar Lunar Calendar & Festival Auto-Scheduler',
      '6. Studio Watermarking, custom branding stamps & client download packages'
    ],
    proTipMm: 'အကယ်၍ စီးပွားဖြစ် စတင်အသုံးပြုလိုပါက Feature 1 (Face-Swap) နှင့် Feature 3 (Supabase Sync) ကို ဦးစားပေး ထည့်သွင်းရန် အကြံပြုအပ်ပါသည်။',
    proTipEn: 'Prioritizing Face-Swap and Supabase Multi-user sync will create the highest immediate commercial ROI.',
    speakerNotesMm: 'ဤအကြံပြုချက် ၆ ခုအနက် မည်သည့် Feature ကို စတင် အလိုရှိသည်ကို သုံးစွဲသူထံမှ ရွေးချယ်မှု ရယူနိုင်ပါသည်။',
    speakerNotesEn: 'Invite the user to pick which feature from this roadmap they want implemented first.',
    illustrationBadge: '🚀 Future Ready'
  }
];

export const MyanmarPresentationSlides: React.FC<MyanmarPresentationSlidesProps> = ({
  onNavigateToSection,
  onClose,
  initialSlide = 0
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);
  const [showThumbnailDrawer, setShowThumbnailDrawer] = useState<boolean>(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<number | null>(null);
  const [languageMode, setLanguageMode] = useState<'my' | 'en' | 'bilingual'>('my');
  const [copiedSlidePrompt, setCopiedSlidePrompt] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const totalSlides = SLIDES_DATA.length;
  const currentSlide = SLIDES_DATA[currentSlideIndex];

  // Keyboard navigation
  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlayInterval) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlayInterval, handleNext]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleCopySlideSummary = () => {
    const text = `[Show Prompt AI Studio Slide ${currentSlideIndex + 1}/${totalSlides}]
${currentSlide.titleMm} (${currentSlide.titleEn})
${currentSlide.subtitleMm}

အနှစ်ချုပ် / Overview:
${currentSlide.summaryMm}

အသုံးပြုနည်း အဆင့်ဆင့်:
${currentSlide.stepsMm.map((s) => `${s.step}: ${s.desc}`).join('\n')}

အဓိက အချက်များ:
${currentSlide.keyFeaturesMm.join('\n')}

Pro Tip: ${currentSlide.proTipMm}`;

    navigator.clipboard.writeText(text);
    setCopiedSlidePrompt(true);
    setTimeout(() => setCopiedSlidePrompt(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#18181b] text-white transition-all select-none overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : 'min-h-[calc(100vh-4rem)] p-4 sm:p-6'
      }`}
    >
      {/* 🌟 SLIDE WORKSPACE CONTAINER */}
      <div className="max-w-7xl mx-auto flex flex-col h-full gap-4">
        
        {/* Top Header Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#27272a]/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
          
          {/* Brand & Slide indicator */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-black text-xs shadow-xs">
              SK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  Show Prompt Studio Presentation
                </span>
                <span className="bg-[#ffd02f]/20 text-[#ffd02f] border border-[#ffd02f]/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  မြန်မာဘာသာ Slides
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                အခန်းတိုင်း အသုံးပြုနည်း နှင့် အနာဂတ် Roadmap လမ်းညွှန်
              </span>
            </div>
          </div>

          {/* Center Navigation & Slide Counter */}
          <div className="flex items-center gap-2 bg-[#18181b] px-3 py-1.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Slide (Left Arrow)"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <span className="font-mono text-xs font-bold text-[#ffd02f] px-2 min-w-[70px] text-center">
              {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Next Slide (Right Arrow or Space)"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Language Switch */}
            <div className="flex items-center bg-[#18181b] rounded-full p-0.5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setLanguageMode('my')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  languageMode === 'my' ? 'bg-[#ffd02f] text-[#1c1c1e]' : 'text-zinc-400 hover:text-white'
                }`}
                title="မြန်မာစာ အဓိက"
              >
                မြန်မာ
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('bilingual')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  languageMode === 'bilingual' ? 'bg-[#ffd02f] text-[#1c1c1e]' : 'text-zinc-400 hover:text-white'
                }`}
                title="နှစ်ဘာသာ ပြသရန်"
              >
                နှစ်ဘာသာ
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('en')}
                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  languageMode === 'en' ? 'bg-[#ffd02f] text-[#1c1c1e]' : 'text-zinc-400 hover:text-white'
                }`}
                title="English Only"
              >
                EN
              </button>
            </div>

            {/* Auto Play Toggle */}
            <button
              type="button"
              onClick={() => setAutoPlayInterval(autoPlayInterval ? null : 6000)}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                autoPlayInterval
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-[#18181b] border-white/10 text-zinc-400 hover:text-white'
              }`}
              title={autoPlayInterval ? 'Auto-play On (6s interval)' : 'Auto-play Slide Show'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {autoPlayInterval ? 'pause' : 'play_arrow'}
              </span>
            </button>

            {/* Speaker Notes Toggle */}
            <button
              type="button"
              onClick={() => setShowSpeakerNotes((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSpeakerNotes
                  ? 'bg-[#ffd02f] text-[#1c1c1e] border-[#ffd02f]'
                  : 'bg-[#18181b] border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="ဟောပြောသူ မှတ်စုများ (Speaker Notes)"
            >
              <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
              <span className="hidden sm:inline">Speaker Notes</span>
            </button>

            {/* Thumbnails Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowThumbnailDrawer((prev) => !prev)}
              className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                showThumbnailDrawer
                  ? 'bg-[#ffd02f] text-[#1c1c1e] border-[#ffd02f]'
                  : 'bg-[#18181b] border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="All Slide Thumbnails"
            >
              <span className="material-symbols-outlined text-[18px]">view_carousel</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-[#18181b] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen (F)"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
                title="Close Slides"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* 🌟 THUMBNAIL DRAWER / CAROUSEL (IF OPENED) */}
        {showThumbnailDrawer && (
          <div className="bg-[#27272a] p-3 rounded-2xl border border-white/10 overflow-x-auto flex items-center gap-3 custom-scrollbar transition-all animate-fadeIn">
            {SLIDES_DATA.map((slide, idx) => {
              const active = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setCurrentSlideIndex(idx);
                    setShowThumbnailDrawer(false);
                  }}
                  className={`flex flex-col text-left p-2.5 rounded-xl border shrink-0 w-44 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#18181b] border-[#ffd02f] ring-2 ring-[#ffd02f]/40 shadow-md'
                      : 'bg-[#1e1e24] border-white/5 hover:border-white/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#ffd02f]">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-zinc-400">
                      {slide.icon}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {slide.titleMm}
                  </span>
                  <span className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                    {slide.categoryMm}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 🌟 MAIN PRESENTATION SLIDE DISPLAY CARD */}
        <div className="relative flex-1 bg-gradient-to-br from-[#202025] to-[#121215] rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Background Canvas Decorative Motif */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#ffd02f]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top of Slide: Category Badge, Icon & Direct Jump Button */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold shadow-md">
                <span className="material-symbols-outlined text-[22px]">{currentSlide.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentSlide.badgeColor}`}>
                    {currentSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {languageMode === 'en' ? currentSlide.categoryEn : currentSlide.categoryMm}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {languageMode === 'en' ? currentSlide.titleEn : currentSlide.titleMm}
                </h1>
              </div>
            </div>

            {/* Direct Section Jump & Copy Slide Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySlideSummary}
                className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                title="Copy slide summary text"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {copiedSlidePrompt ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSlidePrompt ? 'ကူးယူပြီး' : 'Copy Slide'}</span>
              </button>

              {currentSlide.sectionId && (
                <button
                  type="button"
                  onClick={() => onNavigateToSection(currentSlide.sectionId!)}
                  className="h-8 px-4 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>ဤအခန်းသို့ သွားမည်</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>

          {/* Subtitle / Punchline */}
          <div className="relative z-10 my-3">
            <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
              {languageMode === 'en'
                ? currentSlide.subtitleEn
                : currentSlide.subtitleMm}
            </p>
            {languageMode === 'bilingual' && (
              <p className="text-xs text-zinc-400 italic mt-1">
                {currentSlide.subtitleEn}
              </p>
            )}
          </div>

          {/* Slide Body: 2 Columns (Left: Step-by-Step Guide, Right: Features & Pro Tip) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 my-2 flex-1 items-start">
            
            {/* Column 1: Step-by-Step Action Guide (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#ffd02f] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                  <span>အဆင့်ဆင့် အသုံးပြုနည်း လမ်းညွှန် (Step-by-Step)</span>
                </span>
                <span className="text-[11px] text-zinc-400">
                  {currentSlide.illustrationBadge}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {(languageMode === 'en' ? currentSlide.stepsEn : currentSlide.stepsMm).map((st, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ffd02f]/40 transition-colors flex items-start gap-3.5 group"
                  >
                    <div className="h-7 w-7 rounded-xl bg-[#ffd02f]/20 border border-[#ffd02f]/40 text-[#ffd02f] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#ffd02f] group-hover:text-[#1c1c1e] transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {st.step}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200 leading-normal font-medium">
                        {st.desc}
                      </p>
                      {st.tip && (
                        <span className="text-[11px] text-[#ffd02f]/90 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">lightbulb</span>
                          <span>{st.tip}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary quote card */}
              <div className="p-3.5 rounded-2xl bg-[#ffd02f]/10 border border-[#ffd02f]/25 text-zinc-200 text-xs sm:text-sm leading-relaxed font-medium">
                <span className="font-bold text-[#ffd02f] mr-1">📌 အနှစ်ချုပ်:</span>
                {languageMode === 'en' ? currentSlide.summaryEn : currentSlide.summaryMm}
              </div>
            </div>

            {/* Column 2: Key Capabilities & Pro Tips (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Key Features Block */}
              <div className="p-4 rounded-2xl bg-[#18181b]/70 border border-white/10 flex flex-col gap-2.5">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                  <span>အဓိက ပါဝင်သော လုပ်ဆောင်ချက်များ</span>
                </span>
                <ul className="flex flex-col gap-2">
                  {(languageMode === 'en' ? currentSlide.keyFeaturesEn : currentSlide.keyFeaturesMm).map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <span className="material-symbols-outlined text-[14px] text-[#ffd02f] shrink-0 mt-0.5">
                        check_circle
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tip Callout */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">tips_and_updates</span>
                  <span>Pro Tip (ကျွမ်းကျင်သူ လျှို့ဝှက်ချက်)</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                  {languageMode === 'en' ? currentSlide.proTipEn : currentSlide.proTipMm}
                </p>
              </div>

              {/* Quick Jump Call to action */}
              {currentSlide.sectionId && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ffd02f]/20 to-transparent border border-[#ffd02f]/30 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-white">ချက်ချင်း စမ်းသပ်ကြည့်မည်လား?</span>
                    <span className="text-[11px] text-zinc-300">ဤစတူဒီယိုခန်းသို့ ချက်ချင်း ရောက်ရှိပါမည်။</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToSection(currentSlide.sectionId!)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black shadow transition-all cursor-pointer"
                  >
                    ဖွင့်ရန်
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 🌟 SPEAKER NOTES DRAWER (IF TOGGLED) */}
          {showSpeakerNotes && (
            <div className="relative z-10 mt-3 p-3.5 rounded-2xl bg-black/60 border border-purple-500/40 text-purple-200 text-xs animate-fadeIn flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">record_voice_over</span>
                  <span>Presenter / Speaker Notes (ဟောပြောသူ မှတ်စု):</span>
                </span>
                <span className="text-[10px] text-purple-400">Presentation Mode</span>
              </div>
              <p className="leading-relaxed">
                {languageMode === 'en' ? currentSlide.speakerNotesEn : currentSlide.speakerNotesMm}
              </p>
            </div>
          )}

          {/* Slide Footer: Progress Bar, Slide dots & Shortcuts */}
          <div className="relative z-10 pt-4 mt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            
            {/* Slide Dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
              {SLIDES_DATA.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIndex
                      ? 'w-6 bg-[#ffd02f]'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  title={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-300 text-[10px] font-mono">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-300 text-[10px] font-mono">→</kbd>
                <span>ရွှေ့ရန်</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-300 text-[10px] font-mono">Space</kbd>
                <span>ရှေ့တိုးရန်</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-zinc-300 text-[10px] font-mono">F</kbd>
                <span>Full-screen</span>
              </span>
            </div>

            {/* Next Slide Preview Button */}
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>နောက်ထပ် Slide:</span>
              <span className="text-[#ffd02f] font-bold line-clamp-1 max-w-[120px]">
                {SLIDES_DATA[(currentSlideIndex + 1) % totalSlides].titleMm}
              </span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
