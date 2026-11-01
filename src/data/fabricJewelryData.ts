// =============================================================================
// Interactive Fabric & Jewelry Visual Swatches Data (ပိုးချိတ် & မိုးကုတ်ကျောက်မျက် Swatches)
// Curated Myanmar royal textiles, indigenous weaves, and Mogok gemological treasures
// =============================================================================

export interface VisualSwatch {
  id: string;
  category: 'fabric' | 'gemstone' | 'precious-metal';
  nameMm: string;
  nameEn: string;
  originMm: string;
  originEn: string;
  rarityMm: string;
  rarityEn: string;
  colorHex: string;
  gradientPreview: string; // CSS background gradient or pattern simulation
  tactileDescriptionMm: string;
  tactileDescriptionEn: string;
  promptToken: string;
}

export const FABRIC_SWATCHES: VisualSwatch[] = [
  {
    id: 'luntaya-acheik-emerald',
    category: 'fabric',
    nameMm: 'အမရပူရ လွန်းတစ်ရာ မြစိမ်းရောင် ရွှေချိတ်',
    nameEn: 'Amarapura 100-Shuttle Emerald & Gold Luntaya Acheik',
    originMm: 'အမရပူရ ရွှေဂူကြီး ရက်ကန်းရွာ',
    originEn: 'Amarapura Royal Weaving Guilds',
    rarityMm: 'နန်းတွင်း အထွတ်အထိပ် ရာဇဝင်ထည်',
    rarityEn: 'Imperial Court Masterpiece (Takes 3-6 months to weave)',
    colorHex: '#059669',
    gradientPreview: 'repeating-linear-gradient(45deg, #065f46, #059669 12px, #f59e0b 14px, #047857 26px)',
    tactileDescriptionMm: 'လွန်းပေါင်း တစ်ရာကျော်ဖြင့် တစ်ချောင်းချင်း အကွေ့အကောက် လှိုင်းပုံ ရိုးရာထိုးယက်ထားသော ပိုးသားချော စစ်စစ်',
    tactileDescriptionEn: 'Intricately interlocking undulating waves woven with over 100 hand-carved tamarind-wood shuttles in raw pure silk with real gold filament thread.',
    promptToken: 'wearing an authentic Amarapura 100-shuttle Luntaya Acheik silk with hypnotic emerald-green and antique-gold undulating chevron wave motifs, lustrous handwoven raw mulberry silk sheen'
  },
  {
    id: 'luntaya-acheik-crimson',
    category: 'fabric',
    nameMm: 'ကုန်းဘောင် မင်းခမ်းသုံး ပတ္တမြားရောင် လွန်းရာချိတ်',
    nameEn: 'Konbaung Royal Crimson & Ruby Gold Acheik',
    originMm: 'မန္တလေး တော်ဝင်နန်းတွင်း',
    originEn: 'Mandalay Royal Palace Chambers',
    rarityMm: 'မိဖုရားကြီးများသာ ဝတ်ဆင်ခွင့်ရှိသော ထည်',
    rarityEn: 'Chief Queen Consort Ceremonial Silk',
    colorHex: '#9f1239',
    gradientPreview: 'repeating-linear-gradient(135deg, #881337, #be123c 14px, #fbbf24 16px, #9f1239 28px)',
    tactileDescriptionMm: 'နီရဲတောက်ပြောင်သော ပတ္တမြားရောင် နောက်ခံတွင် ရွှေဝါရောင်လှိုင်းများ သီကုံးထားသော တော်ဝင်ပိုးထည်',
    tactileDescriptionEn: 'Deep crimson and ruby undertones interwoven with 24k gold thread zig-zag waves, producing a luminous regal refraction under temple lamplight.',
    promptToken: 'draped in Konbaung dynasty royal crimson and ruby 100-shuttle silk Acheik, glowing with woven 24k gold micro-waves and geometric zigzags'
  },
  {
    id: 'shwe-chi-htoe-velvet',
    category: 'fabric',
    nameMm: 'မန္တလေး ရွှေချည်ထိုး ကတ္တီပါအနက် (Kalaga)',
    nameEn: 'Mandalay Shwe-Chi-Htoe Gold Bullion Velvet Tapestry',
    originMm: 'မန္တလေး အမရပူရ ရွှေချည်ထိုး ပန်းထိမ်',
    originEn: 'Mandalay Gold Embroidery Masters',
    rarityMm: 'မြန်မာ့ အနုသုခုမ ရွှေစင်လက်ရာ',
    rarityEn: 'High-relief 3D Metallic Bullion Hand-Stitched',
    colorHex: '#18181b',
    gradientPreview: 'radial-gradient(circle at 50% 50%, #d97706 10%, #27272a 40%, #09090b 90%)',
    tactileDescriptionMm: 'ကတ္တီပါအနက်သားပေါ်တွင် ရွှေချည်ကြိုး၊ ငွေချည်ကြိုးနှင့် ပုလဲများကို ဖောင်းကြွ 3D လက်မှုပညာဖြင့် ထိုးချုပ်ထားမှု',
    tactileDescriptionEn: 'Stiff midnight-black royal velvet encrusted with raised high-relief coils of genuine gilded gold-bullion wire, glass seed pearls, and brass spangles.',
    promptToken: 'decked in a ceremonial jacket featuring Mandalay Shwe-Chi-Htoe gold-bullion coil embroidery on plush black velvet, three-dimensional kanote floral relief shimmering in golden light'
  },
  {
    id: 'inle-lotus-silk',
    category: 'fabric',
    nameMm: 'အင်းလေး ပဒုမ္မာ ကြာသင်္ကန်းပိုး စစ်စစ်',
    nameEn: 'Inle Lake Sacred Lotus-Root Fiber Silk (Kya-Thingan)',
    originMm: 'အင်းလေးကန်၊ ရှမ်းပြည်နယ် (ညောင်ရွှေ)',
    originEn: 'Inle Lake (Kyaingkhan Village)',
    rarityMm: 'ကမ္ဘာ့ အရှားပါးဆုံး သဘာဝ အမျှင်',
    rarityEn: 'Sacred World Heritage (120,000 lotus stems per robe)',
    colorHex: '#78716c',
    gradientPreview: 'linear-gradient(120deg, #57534e, #a8a29e 45%, #78716c 65%, #44403c 100%)',
    tactileDescriptionMm: 'ကြာရိုးမှ ထုတ်ယူရရှိသော လေဝင်လေထွက်ကောင်းပြီး အလွန်အေးမြ သင်းပျံ့သော သဘာဝ ကြာမျှင် ရက်ကန်းသား',
    tactileDescriptionEn: 'Earthy golden-taupe raw organic fiber extracted by snapping and twisting lotus stems, yielding a breathable, aromatic, self-cooling monastic texture.',
    promptToken: 'wearing an exceptionally rare sacred Inle Lake lotus fiber garment, organic raw golden-fawn textured weave with subtle earthy plant luster, naturally uneven handspun artisanal drape'
  },
  {
    id: 'chin-geometric-wool',
    category: 'fabric',
    nameMm: 'ချင်းရိုးရာ ဂျီဩမေတြီ သိုးမွေးရက်ကန်း',
    nameEn: 'Chin Geometric Back-Strap Loom Tribal Wool',
    originMm: 'ချင်းတောင်တန်း (ဟားခါး / ဖလမ်း)',
    originEn: 'Chin Mountain Highlands',
    rarityMm: 'တောင်တန်းသားတို့၏ ဇာတိသွေး ရိုးရာထည်',
    rarityEn: 'Authentic Back-Strap Loom Heritage',
    colorHex: '#b91c1c',
    gradientPreview: 'repeating-linear-gradient(90deg, #991b1b, #991b1b 15px, #1c1917 15px, #1c1917 30px, #059669 30px, #059669 40px)',
    tactileDescriptionMm: 'ဂျီဩမေတြီ စိန်ကွက်များ၊ သဘာဝ သစ်ခေါက်ဆိုးဆေး အနီနှင့် အနက် သိုးမွေးထည် ထူထူနွေးနွေး',
    tactileDescriptionEn: 'Thick, dense handspun highland wool woven on back-strap looms with rhythmic diamond rhonbus motifs dyed in indigenous madder and indigo roots.',
    promptToken: 'accented with an authentic Chin highland back-strap handwoven wrap, dense red, black and emerald diamond geometric tribal lozenges, rugged ancestral mountain texture'
  },
  {
    id: 'sagaing-pinni-cotton',
    category: 'fabric',
    nameMm: 'စစ်ကိုင်း ပင်နီ ချည်သားစစ်စစ် (Pin-Ni)',
    nameEn: 'Sagaing Natural Khaki Pin-Ni Raw Cotton',
    originMm: 'စစ်ကိုင်းတောင်ရိုး ရိုးရာချည်ငင်',
    originEn: 'Sagaing Hills Artisan Cotton Guilds',
    rarityMm: 'မြန်မာ့လွတ်လပ်ရေးနှင့် သစ္စာရှိမှု သင်္ကေတ',
    rarityEn: 'Historical Symbol of Purity & Patriotism',
    colorHex: '#d97706',
    gradientPreview: 'linear-gradient(45deg, #b45309, #d97706 40%, #fef3c7 70%, #92400e 100%)',
    tactileDescriptionMm: 'ဝါညိုရောင် သဘာဝချည်မျှင် စစ်စစ်၊ ရိုးသားတည်ကြည်ပြီး ကျက်သရေရှိသော ပင်နီအင်္ကျီသား',
    tactileDescriptionEn: 'Naturally tinted fawn-brown unbleached Myanmar cotton, crisp texture that breathes comfortably, embodying dignified noble simplicity.',
    promptToken: 'wearing a crisp, dignified natural fawn-khaki Sagaing Pin-Ni handspun cotton taikpon jacket, subtle slub yarn texture, natural plant-fiber honesty'
  }
];

export const JEWELRY_SWATCHES: VisualSwatch[] = [
  {
    id: 'mogok-pigeon-blood-ruby',
    category: 'gemstone',
    nameMm: 'မိုးကုတ် ခိုသွေး ပတ္တမြားစစ် (Pigeon’s Blood Ruby)',
    nameEn: 'Mogok "Pigeon\'s Blood" Unheated Crimson Ruby',
    originMm: 'မိုးကုတ်မြို့ ကျပ်ပြင် / ဒေါ်နန်းကြည်တောင်',
    originEn: 'Mogok Stone Tract (Kyatpyin Valley)',
    rarityMm: 'ကမ္ဘာ့ အဖိုးအတန်ဆုံး ရတနာ',
    rarityEn: 'The King of Gemstones (World benchmark red fluorescence)',
    colorHex: '#dc2626',
    gradientPreview: 'radial-gradient(circle at 35% 35%, #f87171, #dc2626 50%, #450a0a 100%)',
    tactileDescriptionMm: 'ခရမ်းရောင်မသမ်းဘဲ သွေးနီရောင်စစ်စစ် တောက်ပသော သဘာဝ မိုးကုတ်ပတ္တမြား၊ ခရမ်းလွန်ရောင်ခြည်အောက် တောက်လောင်ထွန်းတောက်မှု',
    tactileDescriptionEn: 'Unheated corundum with fiery vivid red chromium saturation and strong natural red UV fluorescence that glows even in shadow; cushion-cut with silk rutile needles.',
    promptToken: 'adorned with museum-grade unheated Mogok pigeon-blood rubies glowing with vivid saturated crimson fluorescence, set in antique repoussé 24k yellow gold'
  },
  {
    id: 'kachin-imperial-jadeite',
    category: 'gemstone',
    nameMm: 'ဖားကန့် မြစိမ်းရောင် ကျောက်စိမ်းအစစ် (Imperial Jadeite)',
    nameEn: 'Kachin Phakant Imperial Translucent Green Jadeite',
    originMm: 'ကချင်ပြည်နယ် ဖားကန့်ကျောက်စိမ်းမြေ',
    originEn: 'Phakant Jade Mines, Kachin State',
    rarityMm: 'အဆင့် A (Type-A) အကြည်ပေါက် သဘာဝကျောက်',
    rarityEn: 'Type A Imperial Emerald Feicui (Oily glass translucency)',
    colorHex: '#10b981',
    gradientPreview: 'radial-gradient(circle at 40% 40%, #6ee7b7, #10b981 60%, #064e3b 100%)',
    tactileDescriptionMm: 'ဆီကျောက်ပန်းကဲ့သို့ အေးမြကြည်လင်ပြီး အတွင်းမှ အလင်းပြန်သော မြစိမ်းရောင် သဘာဝ ဖားကန့်ကျောက်စိမ်းစစ်စစ်',
    tactileDescriptionEn: 'Vivid emerald-green chromium jadeite with oily vitreous luster and high light transmission; smooth imperial cabochon cuts with zero chemical treatment.',
    promptToken: 'wearing luminous Type-A Phakant Imperial jadeite jewelry, high translucency with oily deep emerald glow, smooth domed cabochons set in hand-chiseled gold'
  },
  {
    id: 'mogok-royal-blue-sapphire',
    category: 'gemstone',
    nameMm: 'မိုးကုတ် တော်ဝင် နီလာပြာ (Royal Velvet Blue Sapphire)',
    nameEn: 'Mogok Royal Blue Velvet Sapphire',
    originMm: 'မိုးကုတ် ကသည်း / ဗျူဟာကုန်း',
    originEn: 'Kathey & Bernardmyo, Mogok Valley',
    rarityMm: 'နန်းတွင်း အမြတ်တနိုး သုံးစွဲသော ကျောက်မျက်',
    rarityEn: 'Velvety Deep Cornflower to Royal Blue',
    colorHex: '#2563eb',
    gradientPreview: 'radial-gradient(circle at 35% 35%, #93c5fd, #2563eb 55%, #172554 100%)',
    tactileDescriptionMm: 'မိုးကုတ်မြေထွက် အပြာနက်ရောင် ကတ္တီပါသားကဲ့သို့ နူးညံ့တောက်ပသော နီလာစစ်စစ်',
    tactileDescriptionEn: 'Intense velvety cobalt blue corundum devoid of greyish extinction, reflecting rich indigo flashes through precision oval faceted cut.',
    promptToken: 'embellished with deep royal blue Mogok sapphires, intense cornflower-blue clarity with velvety depth, sparkling under ceremonial chandeliers'
  },
  {
    id: 'myeik-south-sea-golden-pearl',
    category: 'gemstone',
    nameMm: 'မြိတ် ကျွန်းစု ပုလဲရွှေဝါ (Myeik South Sea Pearl)',
    nameEn: 'Myeik Archipelago 14mm Golden South Sea Pearl',
    originMm: 'တနင်္သာရီတိုင်း မြိတ်ကျွန်းစု (ပုလဲကျွန်း)',
    originEn: 'Myeik Archipelago (Pearl Island)',
    rarityMm: 'ပင်လယ်ရေနက်မှ သဘာဝရွှေရောင် ရတနာ',
    rarityEn: 'Deep Gold Pinctada Maxima Oyster Pearl',
    colorHex: '#f59e0b',
    gradientPreview: 'radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b 60%, #78350f 100%)',
    tactileDescriptionMm: '၁၄ မီလီမီတာ အရွယ်အစားရှိ မျက်နှာပြင်ချောမွတ်ပြီး သဘာဝရွှေရောင် တောက်ပသော ပင်လယ်ရေနက်ပုလဲကြီးများ',
    tactileDescriptionEn: '14mm perfectly spherical pearls with thick golden nacre, producing a warm satin luster with subtle champagne iridescence.',
    promptToken: 'adorned with radiant 14mm Myeik Archipelago golden South Sea pearls, thick satin luster with champagne orient, strung on hand-knotted gold silk cord'
  },
  {
    id: 'burmese-24k-repousse-gold',
    category: 'precious-metal',
    nameMm: 'မြန်မာ့ ရှေးရိုး ရွှေပန်းထိမ် ထုဆစ်လက်ရာ (၂၄ ပဲရည်)',
    nameEn: 'Traditional Burmese 24K Repoussé & Filigree Yellow Gold',
    originMm: 'မန္တလေး ရွှေပန်းထိမ် ရပ်ကွက်',
    originEn: 'Mandalay Master Goldsmith Quarters',
    rarityMm: 'မြန်မာ့ရိုးရာ ကနုတ်ပန်း ထွင်းထုလက်ရာ',
    rarityEn: 'Pure 99.9% Butter-Yellow Gold Repoussé',
    colorHex: '#eab308',
    gradientPreview: 'linear-gradient(135deg, #fef08a, #eab308 35%, #ca8a04 70%, #854d0e 100%)',
    tactileDescriptionMm: 'မီးခတ်သန့်စင်ထားသော ရွှေစင်ရွှေသားပေါ်တွင် သိမ်မွေ့လှပသော ကနုတ်ပန်း၊ ခြင်္သေ့နှင့် ဒေါင်းရုပ်များကို လက်ဖြင့် ထုဆစ်ထားမှု',
    tactileDescriptionEn: 'Unalloyed warm buttery-yellow 24k gold, chiseled with intricate micro-kanote flame scrollwork, repoussé bas-relief royal crests and openwork filigree lace.',
    promptToken: 'elaborate traditional Burmese 24k yellow gold repoussé jewelry, micro-chiseled floral kanote motifs, rich antique buttery-gold patina with delicate filigree dangling bells'
  }
];
