export interface SceneItem {
  id: string;
  titleEn: string;
  titleMm: string;
  category: 'heritage_myanmar' | 'wedding_prewedding' | 'fashion_commercial' | 'baby_family' | 'atmosphere_seasons';
  categoryLabelEn: string;
  categoryLabelMm: string;
  badge: string;
  sunDirection: 'backlight' | 'left_rim' | 'right_rim' | 'overhead' | 'ambient' | 'golden_hour';
  sunDirectionLabel: string;
  atmosphere: 'cinematic' | 'warm_golden' | 'dreamy_mist' | 'dramatic_chiaroscuro' | 'cool_azure' | 'luxury_gilded';
  atmosphereLabel: string;
  previewImage: string;
  prompt: string;
  lightingNotes: string;
  tags: string[];
}

export interface SceneCategoryMeta {
  id: SceneItem['category'] | 'all';
  labelEn: string;
  labelMm: string;
  badge: string;
  count: number;
  icon: string;
}

// ----------------------------------------------------------------------------
// 1. BASE CURATED SCENE PRESETS (HAND-CRAFTED CORE DATASETS)
// ----------------------------------------------------------------------------

const HERITAGE_BASE: Omit<SceneItem, 'category' | 'categoryLabelEn' | 'categoryLabelMm'>[] = [
  {
    id: 'mandalay-palace-throne-hall',
    titleEn: 'Mandalay Royal Palace Gilded Throne Hall',
    titleMm: 'မန္တလေး ရတနာပုံ ရွှေနန်းတော် ညီလာခံ သီဟာသန ပလ္လင်တော်ခန်းမ',
    badge: 'ROYAL HERITAGE',
    sunDirection: 'left_rim',
    sunDirectionLabel: 'Left 45° Warm Window Rays',
    atmosphere: 'luxury_gilded',
    atmosphereLabel: 'Gilded Royal Ambience',
    previewImage: '/scenes/mandalay-palace-throne-hall.jpg',
    prompt: 'Interior of Mandalay Royal Palace grand throne hall, massive vermilion crimson lacquered teakwood columns with 24k gold leaf relief, intricate Pyatthat tiered spire ceilings, traditional royal drapery, warm dramatic candle sconces, atmospheric dust motes dancing in volumetric sunbeams, 8k uhd photorealistic VFX compositing plate.',
    lightingNotes: 'Warm amber 3000K rim lighting from high palace windows with deep chiaroscuro contact shadows on teakwood flooring.',
    tags: ['mandalay', 'palace', 'throne', 'konbaung', 'gold', 'royal', 'teakwood']
  },
  {
    id: 'bagan-ananda-temple-sunset',
    titleEn: 'Bagan Ananda Temple Golden Hour Stupa Terraces',
    titleMm: 'ပုဂံ အာနန္ဒာဘုရား ရင်ပြင်တော်နှင့် နေဝင်ချိန် ရွှေရောင်ဆည်းဆာ',
    badge: 'ARCHIVAL HERITAGE',
    sunDirection: 'golden_hour',
    sunDirectionLabel: 'Low Angle Golden Sunset',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Warm Golden Haze',
    previewImage: '/scenes/bagan-ananda-temple-sunset.jpg',
    prompt: 'Panoramic terracotta brick terrace of ancient Ananda Temple in Bagan at golden hour, weathered red-brick stupas stretching across the misty horizon, hot air balloons silhouetted in warm amber sky, soft dust haze, dramatic golden sun flare wrapping around architecture, 8k uhd architectural plate.',
    lightingNotes: 'Low 2400K golden backlight with soft atmospheric scattering and sharp contact occlusion on terracotta brick floor.',
    tags: ['bagan', 'temple', 'ananda', 'sunset', 'balloons', 'brick', 'golden hour']
  },
  {
    id: 'mrauk-u-shittaung-stone-corridor',
    titleEn: 'Mrauk-U Shittaung Pagoda 80,000 Buddha Stone Corridor',
    titleMm: 'မြောက်ဦး ရှစ်သောင်းဘုရား ကျောက်ဆစ်စင်္ကြံနှင့် ရှေးဟောင်းရုပ်ပွားတော်များ',
    badge: 'ANCIENT MYSTIC',
    sunDirection: 'ambient',
    sunDirectionLabel: 'Soft Diffused Lantern Light',
    atmosphere: 'dramatic_chiaroscuro',
    atmosphereLabel: 'Mystic Stone Shadow',
    previewImage: '/scenes/mrauk-u-shittaung-stone-corridor.jpg',
    prompt: 'Ancient carved sandstone labyrinth corridor inside Shittaung Pagoda in Mrauk-U, thousands of relief-carved stone Buddhas along the mossy masonry walls, oil lamp flickering warmly in carved niches, sacred ancient mist drifting across flagstone floor, cinematic chiaroscuro tone.',
    lightingNotes: 'Flickering warm torchlight contrast with cool natural stone tones; rich dark ambient occlusion.',
    tags: ['mrauk-u', 'stone', 'shittaung', 'ancient', 'sandstone', 'rakhine']
  },
  {
    id: 'inle-lake-phaung-daw-oo-jetty',
    titleEn: 'Inle Lake Water Pavilion & Floating Lotus Sanctuary',
    titleMm: 'အင်းလေးကန် ရေပေါ်ပြာသာဒ်နှင့် ဖောင်တော်ဦး ရွှေဖောင်တော် ရှုခင်း',
    badge: 'CULTURAL WATERWAY',
    sunDirection: 'backlight',
    sunDirectionLabel: 'Morning Sunlight over Water',
    atmosphere: 'cool_azure',
    atmosphereLabel: 'Clear Mountain Waters',
    previewImage: '/scenes/inle-lake-phaung-daw-oo-jetty.jpg',
    prompt: 'Traditional carved Shan teakwood water terrace overlooking tranquil Inle Lake at morning mist, gilded royal Karaweik ceremonial barge docked in the distance, floating hydroponic gardens with blooming lotus flowers, distant blue Shan mountains, crystal clear water reflections, 8k visual plate.',
    lightingNotes: 'Bright 5500K morning water highlights with strong specular water caustics reflecting upwards.',
    tags: ['inle', 'shan', 'lake', 'water', 'floating garden', 'karaweik']
  },
  {
    id: 'shwedagon-marble-terrace-night',
    titleEn: 'Shwedagon Pagoda Marble Terrace at Blue Hour with Oil Lamps',
    titleMm: 'ရွှေတိဂုံ ရင်ပြင်တော် စကျင်ကျောက်တန်းနှင့် ဆီမီးတစ်ထောင် ပူဇော်ပွဲ',
    badge: 'SACRED NIGHT',
    sunDirection: 'ambient',
    sunDirectionLabel: '360° Candle Sconces & Spire Glow',
    atmosphere: 'luxury_gilded',
    atmosphereLabel: 'Luminous Sacred Gold',
    previewImage: '/scenes/shwedagon-marble-terrace-night.jpg',
    prompt: 'Pristine white marble platform of the Shwedagon Pagoda at twilight blue hour, massive golden stupa gleaming with floodlights into the deep indigo sky, thousands of brass clay oil lamps glowing on the floor with soft smoke, intricate teakwood Tazaung prayer pavilions in background, 8k photorealistic.',
    lightingNotes: 'Contrast of deep 7500K indigo sky with 2200K warm flickering oil lamps on reflective polished marble.',
    tags: ['shwedagon', 'pagoda', 'gold', 'marble', 'blue hour', 'candles']
  },
  {
    id: 'sagaing-hills-u-min-thonze',
    titleEn: 'Sagaing Hills U Min Thonze 45 Crescent Buddha Hall',
    titleMm: 'စစ်ကိုင်းတောင်ရိုး ဥမင်သုံးဆယ် လခြမ်းပုံ ဗုဒ္ဓရုပ်ပွားတော်များ စင်္ကြံ',
    badge: 'ROYAL HERITAGE',
    sunDirection: 'right_rim',
    sunDirectionLabel: 'Right Window Morning Slanted Rays',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Serene Spiritual Aura',
    previewImage: '/scenes/sagaing-hills-u-min-thonze.jpg',
    prompt: 'Iconic curved crescent gallery of U Min Thonze Pagoda atop Sagaing Hills, 45 gilded seated Buddhas arrayed in harmonious arc, pastel floral mosaic tiled floors, open arched balconies showing sweeping views of the Irrawaddy river below, soft morning haze.',
    lightingNotes: 'Slanted parallel sunbeams streaming through arched colonnade with soft diffuse bounce.',
    tags: ['sagaing', 'buddha', 'u min thonze', 'irrawaddy', 'colonnade']
  },
  {
    id: 'pindaya-limestone-golden-cave',
    titleEn: 'Pindaya Caves Gilded Limestone Chamber with Thousands of Images',
    titleMm: 'ပင်းတယ ရွှေဥမင် သဘာဝထုံးကျောက်ဂူကြီးအတွင်း ရွှေရုပ်ပွားတော်များ',
    badge: 'ANCIENT MYSTIC',
    sunDirection: 'ambient',
    sunDirectionLabel: 'Ambient Cave Sconces',
    atmosphere: 'dramatic_chiaroscuro',
    atmosphereLabel: 'Subterranean Gold',
    previewImage: '/scenes/pindaya-limestone-golden-cave.jpg',
    prompt: 'Deep cavernous subterranean limestone cave chamber of Pindaya, natural stalactites dripping from the ceiling, thousands of ancient gilded Buddha images covering every rock crevice, warm tungsten spotlights casting dramatic shadows, sacred mountain mist, 8k uhd.',
    lightingNotes: 'Dramatic localized golden pools of light surrounded by natural dark limestone cavern walls.',
    tags: ['pindaya', 'cave', 'limestone', 'shan', 'stalactite', 'gold']
  },
  {
    id: 'amarapura-u-bein-bridge-sunset',
    titleEn: 'U Bein Teak Bridge Over Taungthaman Lake Sunset',
    titleMm: 'အမရပူရ ဦးပိန်တံတားနှင့် တောင်သမန်အင်း နေဝင်ဆည်းဆာ ရှုခင်း',
    badge: 'TIMELESS HERITAGE',
    sunDirection: 'golden_hour',
    sunDirectionLabel: 'Backlit Sunset Silhouettes',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Crimson Amber Sunset',
    previewImage: '/scenes/amarapura-u-bein-bridge-sunset.jpg',
    prompt: 'Long rustic weathered teakwood pillars of U Bein Bridge stretching across Taungthaman Lake, giant orange sun setting on the horizon, fishermen in wooden rowboats with traditional conical nets, warm golden water ripples, soft silhouette aesthetic, 8k composite.',
    lightingNotes: 'Extreme golden backlight with high contrast rim lighting and gentle water reflection.',
    tags: ['u bein', 'teak bridge', 'amarapura', 'mandalay', 'sunset', 'lake']
  }
];

const WEDDING_BASE: Omit<SceneItem, 'category' | 'categoryLabelEn' | 'categoryLabelMm'>[] = [
  {
    id: 'royal-crystal-chandelier-ballroom',
    titleEn: 'Palatial Grand Ballroom with Massive Crystal Chandeliers',
    titleMm: 'ခမ်းနားသော ဖန်မီးဆိုင်းကြီးများနှင့် မင်္ဂလာဧည့်ခံပွဲ အခန်းမကြီး',
    badge: 'LUXURY WEDDING',
    sunDirection: 'overhead',
    sunDirectionLabel: 'Top Crystal Prism Refraction',
    atmosphere: 'luxury_gilded',
    atmosphereLabel: 'Opulent Gilded Elegance',
    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Ultra-luxurious high-ceiling grand hotel ballroom, multi-tiered crystal chandeliers cascading warm prism light, white and champagne silk drapery, polished marble flooring reflecting chandeliers, elaborate floral centerpieces of white roses and orchids, soft atmospheric fog on floor.',
    lightingNotes: 'Soft 3200K overhead chandelier light creating gentle hair highlights and mirror reflections on the marble floor.',
    tags: ['wedding', 'ballroom', 'chandelier', 'luxury', 'crystal', 'marble']
  },
  {
    id: 'royal-burmese-peacock-wedding-arch',
    titleEn: 'Royal Burmese Gilded Peacock Floral Wedding Archway',
    titleMm: 'မြန်မာ့ရိုးရာ ဒေါင်းရုပ် ရွှေပန်းခုံးနှင့် မင်္ဂလာစင်မြင့် မုခ်ဦး',
    badge: 'ROYAL WEDDING',
    sunDirection: 'left_rim',
    sunDirectionLabel: 'Front-Left Softbox Fill & Rim',
    atmosphere: 'luxury_gilded',
    atmosphereLabel: 'Traditional Royal Splendor',
    previewImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Majestic wedding ceremonial stage featuring a pair of hand-carved gilded Burmese peacock sculptures forming a grand floral arch, cascading white jasmine and royal orchids, golden ceremonial cushions on elevated velvet plinth, subtle warm stage spotlights, 8k photographic masterwork.',
    lightingNotes: 'Balanced three-point studio lighting with gold-tinted rim lights matching the royal regalia.',
    tags: ['wedding', 'peacock', 'arch', 'burmese wedding', 'gold', 'stage']
  },
  {
    id: 'european-glass-chapel-forest',
    titleEn: 'Modern Glass Botanical Chapel in Pine Forest',
    titleMm: 'ထင်းရှူးတောအလယ် သဘာဝအလင်းဝင် မှန်နန်းတော် မင်္ဂလာဆောင် ခန်းမ',
    badge: 'MODERN PRE-WEDDING',
    sunDirection: 'backlight',
    sunDirectionLabel: 'Sunlight Filtered through Tall Pines',
    atmosphere: 'dreamy_mist',
    atmosphereLabel: 'Ethereal Forest Romance',
    previewImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Architectural modern glass greenhouse chapel nestled inside a serene misty pine forest, floor-to-ceiling glass walls, soft volumetric sun rays piercing through towering trees, white blossom petal pathway on wooden planks, dreamy romantic atmosphere.',
    lightingNotes: 'Soft diffused backlight with gentle green ambient bounce and crisp sun shafts.',
    tags: ['wedding', 'glass chapel', 'forest', 'pine', 'modern', 'pre-wedding']
  },
  {
    id: 'sunset-coastal-cliff-floral-gazebo',
    titleEn: 'Sunset Coastal Cliff Gazebo with White Rose Curtains',
    titleMm: 'ပင်လယ်ကမ်းပါးယံ နေဝင်ချိန် နှင်းဆီဖြူပန်းခုံးနှင့် ကမ်းခြေမင်္ဂလာမုခ်ဦး',
    badge: 'DESTINATION WEDDING',
    sunDirection: 'golden_hour',
    sunDirectionLabel: 'Ocean Horizon Golden Flare',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Warm Tropical Romance',
    previewImage: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Breathtaking oceanfront cliffside wedding gazebo overlooking turquoise sea at golden hour, billowing sheer white chiffon curtains in coastal breeze, thousands of blush pink and ivory garden roses, soft sun flare on water horizon, warm cinematic editorial photography.',
    lightingNotes: 'Luminous rim light on sheer chiffon fabric and hair edges; gentle warm ocean specular reflection.',
    tags: ['wedding', 'beach', 'sunset', 'cliff', 'gazebo', 'ocean']
  }
];

const FASHION_BASE: Omit<SceneItem, 'category' | 'categoryLabelEn' | 'categoryLabelMm'>[] = [
  {
    id: 'minimalist-cyclorama-editorial',
    titleEn: 'High-Fashion Minimalist Curved Cyclorama Studio',
    titleMm: 'ခေတ်မီ ဖက်ရှင်မဂ္ဂဇင်း စတူဒီယို အဖြူရောင် ကွေးညွတ်စင်မြင့်',
    badge: 'EDITORIAL HIGH-FASHION',
    sunDirection: 'left_rim',
    sunDirectionLabel: 'Large Octabox Key + White Reflector',
    atmosphere: 'cinematic',
    atmosphereLabel: 'Clean High-End Vogue',
    previewImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Seamless infinity curved white cyclorama photo studio, sculpted architectural concrete podium, large commercial diffusion overhead scrim, soft natural contact shadow underneath subject, clean high-fashion editorial styling, zero visual clutter, sharp 8k Hasselblad shot.',
    lightingNotes: 'Ultra-soft wraparound lighting with 5600K balanced daylight and razor-sharp shadow falloff.',
    tags: ['fashion', 'studio', 'cyclorama', 'editorial', 'vogue', 'minimalist']
  },
  {
    id: 'dark-obsidian-marble-pedestal',
    titleEn: 'Dark Obsidian Wet Marble Luxury Commercial Plinth',
    titleMm: 'ဇိမ်ခံ အနက်ရောင် ကျောက်စကျင် ရေပြင်စင်မြင့်နှင့် စတူဒီယိုမီး',
    badge: 'COMMERCIAL LUXURY',
    sunDirection: 'right_rim',
    sunDirectionLabel: 'Sharp 45° Rim Light with Stripbox',
    atmosphere: 'dramatic_chiaroscuro',
    atmosphereLabel: 'Obsidian Velvet Darkness',
    previewImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Luxury product and fashion studio background, dark polished Nero Marquina black marble floor with subtle water ripple reflections, moody slate background with soft vertical rim gradient, fine mist, ray-traced caustics, ultra-premium commercial advertising aesthetic.',
    lightingNotes: 'Edge rim lighting separating subject from deep dark background; high contrast contact reflection.',
    tags: ['commercial', 'marble', 'luxury', 'product', 'dark', 'pedestal']
  },
  {
    id: 'cyberpunk-neon-rooftop-yangon',
    titleEn: 'Neon Cyberpunk Futuristic City Skyline Terrace',
    titleMm: 'ခေတ်လွန် နီယွန်မီးရောင်စုံ မြို့ပြခေါင်မိုးနှင့် မိုးရေစက် အလှ',
    badge: 'URBAN AVANT-GARDE',
    sunDirection: 'ambient',
    sunDirectionLabel: 'Dual Cyan & Magenta Rim Lighting',
    atmosphere: 'cool_azure',
    atmosphereLabel: 'Neon Electric Glow',
    previewImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Wet rooftop terrace of a futuristic modern metropolis at night, glowing neon signs in cyan and hot pink reflecting in puddles on asphalt, sleek metallic railings, distant skyscraper skyline with soft rain bokeh, Blade Runner cinematic fashion shoot, 8k.',
    lightingNotes: 'Complementary colored neon rims (cyan on left, magenta on right) wrapping around subject silhouette.',
    tags: ['neon', 'cyberpunk', 'rooftop', 'night', 'futuristic', 'fashion']
  }
];

const BABY_BASE: Omit<SceneItem, 'category' | 'categoryLabelEn' | 'categoryLabelMm'>[] = [
  {
    id: 'dreamy-pastel-cloud-haven',
    titleEn: 'Pastel Cloud Dreamscape with Crescent Moon & Stars',
    titleMm: 'ကလေးငယ်များအတွက် အိပ်မက်ဆန်သော တိမ်တိုက်၊ လခြမ်းနှင့် ကြယ်စင်များ',
    badge: 'BABY & TODDLER',
    sunDirection: 'overhead',
    sunDirectionLabel: 'Soft Diffused Dreamy Glow',
    atmosphere: 'dreamy_mist',
    atmosphereLabel: 'Pastel Cloud Magic',
    previewImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Enchanting fairytale baby photo studio backdrop, fluffy pastel clouds of ivory and butter-yellow resting on floor, sculpted 3D glowing wooden crescent moon, suspended fairy lights and golden stars, soft warm blanket, cozy magical storybook atmosphere, 8k.',
    lightingNotes: 'Ultra-gentle eye-safe warm diffused illumination; zero harsh shadows, creamy bokeh highlights.',
    tags: ['baby', 'toddler', 'clouds', 'moon', 'stars', 'fairytale', 'pastel']
  },
  {
    id: 'boho-wood-safari-den',
    titleEn: 'Warm Bohemian Wooden Den with Plush Animals',
    titleMm: 'သဘာဝ သစ်သားအိမ်နှင့် ချစ်စရာ တိရစ္ဆာန်ရုပ်လေးများ ကလေးစတူဒီယို',
    badge: 'FAMILY & MILESTONE',
    sunDirection: 'left_rim',
    sunDirectionLabel: 'Warm Window Sunlight with Potted Palms',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Warm Earthy Boho',
    previewImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Charming Scandinavian bohemian nursery studio set, raw oak wooden floor, natural rattan teepee tent, soft woven macrame blankets, hand-knitted giant plush lion and giraffe, pampas grass vases, sunlit window casting lattice shadow patterns, 8k.',
    lightingNotes: 'Natural warm sunlight streaming across floor, creating inviting organic texture and gentle warmth.',
    tags: ['baby', 'boho', 'teepee', 'nursery', 'wood', 'warm', 'plush']
  }
];

const ATMOSPHERE_BASE: Omit<SceneItem, 'category' | 'categoryLabelEn' | 'categoryLabelMm'>[] = [
  {
    id: 'monsoon-rain-steamy-window',
    titleEn: 'Cinematic Monsoon Rain Streaked Window with City Lights',
    titleMm: 'မိုးရာသီ မိုးရေစက်များနှင့် နွေးထွေးသော ကော်ဖီဆိုင် ပြတင်းပေါက်',
    badge: 'ATMOSPHERIC WEATHER',
    sunDirection: 'backlight',
    sunDirectionLabel: 'Evening Streetlamp Glow through Raindrops',
    atmosphere: 'cinematic',
    atmosphereLabel: 'Rainy Nostalgia',
    previewImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Atmospheric indoor perspective looking out through glass window covered in heavy monsoon raindrops, warm amber streetlamps and vehicle headlight bokeh blurring in the twilight rain, soft steamy condensation, emotional Wong Kar-wai cinematic tone, 8k.',
    lightingNotes: 'Soft moody back-bokeh highlights with rim lighting tracing water droplets on the foreground pane.',
    tags: ['rain', 'monsoon', 'window', 'bokeh', 'moody', 'cinematic']
  },
  {
    id: 'floating-candle-lantern-festival',
    titleEn: 'Sacred Floating Water Lanterns on Serene River at Midnight',
    titleMm: 'သီတင်းကျွတ် တန်ဆောင်တိုင် ဆီမီးမျှောပွဲနှင့် ရေပြင်ပေါ် ရွှေရောင်ဆီမီးများ',
    badge: 'FESTIVAL OF LIGHTS',
    sunDirection: 'ambient',
    sunDirectionLabel: 'Glowing Floating Lotus Lanterns',
    atmosphere: 'warm_golden',
    atmosphereLabel: 'Festival Luminescence',
    previewImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    prompt: 'Breathtaking midnight riverbank during Thadingyut festival of lights, thousands of golden floating origami lotus lanterns glowing on dark mirror water, gentle embers rising into starry night sky, distant ancient golden pagoda illuminated on hill, magical cultural glow, 8k visual plate.',
    lightingNotes: 'Warm 2000K candle glow radiating from water level, casting soft upward light wrap on subjects.',
    tags: ['lanterns', 'thadingyut', 'river', 'water', 'candles', 'festival']
  }
];

// ----------------------------------------------------------------------------
// 2. PROCEDURAL GENERATOR FOR THE FULL 550+ SCENES COLLECTION
// ----------------------------------------------------------------------------

function generateExpandedScenes(): SceneItem[] {
  const result: SceneItem[] = [];

  // 1. Add base hand-crafted sets
  HERITAGE_BASE.forEach(s => result.push({
    ...s,
    category: 'heritage_myanmar',
    categoryLabelEn: 'Heritage Myanmar (338+)',
    categoryLabelMm: 'မြန်မာ့သမိုင်းဝင် နန်းတွင်းနှင့် စေတီပုထိုးများ (၃၃၈+)'
  }));

  WEDDING_BASE.forEach(s => result.push({
    ...s,
    category: 'wedding_prewedding',
    categoryLabelEn: 'Wedding & Pre-Wedding (130+)',
    categoryLabelMm: 'မင်္ဂလာဆောင်နှင့် Pre-Wedding ခန်းမများ (၁၃၀+)'
  }));

  FASHION_BASE.forEach(s => result.push({
    ...s,
    category: 'fashion_commercial',
    categoryLabelEn: 'Fashion & Commercial (100+)',
    categoryLabelMm: 'ဖက်ရှင်နှင့် ကြော်ငြာ စတူဒီယိုများ (၁၀၀+)'
  }));

  BABY_BASE.forEach(s => result.push({
    ...s,
    category: 'baby_family',
    categoryLabelEn: 'Baby & Family (80+)',
    categoryLabelMm: 'ကလေးနှင့် မိသားစု အမှတ်တရ (၈၀+)'
  }));

  ATMOSPHERE_BASE.forEach(s => result.push({
    ...s,
    category: 'atmosphere_seasons',
    categoryLabelEn: 'Atmosphere & Seasons (120+)',
    categoryLabelMm: 'ရာသီဥတုနှင့် အလင်းလမ်းကြောင်းများ (၁၂၀+)'
  }));

  // Heritage archetypes to expand to 338+
  const heritageSites = [
    { en: 'Bagan Dhammayangyi Stupa', mm: 'ပုဂံ ဓမ္မရံကြီး ဂူဘုရားကြီး', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Mrauk-U Kothaung 90,000 Buddhas', mm: 'မြောက်ဦး ကိုးသောင်းဘုရား မဟာရင်ပြင်', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Inle Jumping Cat Wooden Monastery', mm: 'အင်းလေး ငါးဖယ်ချောင်း သစ်သားကျောင်းတိုက်', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Mandalay Shwenandaw Teak Monastery', mm: 'မန္တလေး ရွှေနန်းတော် ကျောင်းတော်ကြီး ပန်းပုများ', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Bago Shwemawdaw Giant Golden Spire', mm: 'ပဲခူး ရွှေမော်ဓော စေတီတော် ရင်ပြင်တော်', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Pyin Oo Lwin Colonial Teak Manor', mm: 'ပြင်ဦးလွင် ရှေးဟောင်း သစ်သားအင်္ဂလိပ်အိမ်ကြီး', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Kalaw Mountain Pine Forest Overlook', mm: 'ကလော တောင်ပေါ် ထင်းရှူးတောနှင့် တောင်တန်းရှုခင်း', img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Kyaiktiyo Golden Rock Mountain Cliff', mm: 'ကျိုက်ထီးရိုး ကျောက်တုံးတော်နှင့် မနက်ခင်းမြူခိုး', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Hpa-An Sadan Limestone Cavern Lake', mm: 'ဘားအံ ဆဒ္ဒန်ဂူ သဘာဝ ရေအိုင်နှင့် လှေငယ်များ', img: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=85' },
    { en: 'Mandalay Hill Sutaungpyei Glass Mosaics', mm: 'မန္တလေးတောင် ဆုတောင်းပြည့် မှန်စီရွှေချ ရင်ပြင်တော်', img: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=85' }
  ];

  const times = [
    { id: 'dawn', en: 'Misty Dawn Sunlight', mm: 'မနက်ခင်း မြူခိုးနှင့် ရွှေရောင်အလင်း', sun: 'left_rim' as const, atmo: 'dreamy_mist' as const },
    { id: 'noon', en: 'Clear Azure Daylight', mm: 'ကြည်လင်သော နေ့ခင်း နေရောင်ခြည်', sun: 'overhead' as const, atmo: 'cool_azure' as const },
    { id: 'golden', en: 'Radiant Sunset Golden Hour', mm: 'နေဝင်ဆည်းဆာ ရွှေရောင်အလင်းဝင်း', sun: 'golden_hour' as const, atmo: 'warm_golden' as const },
    { id: 'blue', en: 'Dusk Blue Hour with Oil Lamps', mm: 'ဆည်းဆာချိန်နှင့် ရိုးရာဆီမီးခွက်များ', sun: 'ambient' as const, atmo: 'dramatic_chiaroscuro' as const },
    { id: 'night', en: 'Moonlit Night with Volumetric Stars', mm: 'လရောင်နှင့် ကြယ်ရောင်စုံ ညချမ်း', sun: 'backlight' as const, atmo: 'cinematic' as const }
  ];

  // Procedurally generate Heritage up to 338 entries
  let heritageCount = HERITAGE_BASE.length;
  for (let i = 0; heritageCount < 338; i++) {
    const site = heritageSites[i % heritageSites.length];
    const time = times[Math.floor(i / heritageSites.length) % times.length];
    const variationIndex = Math.floor(i / (heritageSites.length * times.length)) + 1;
    heritageCount++;

    result.push({
      id: `heritage-set-${heritageCount}`,
      titleEn: `${site.en} - ${time.en} (Set #${variationIndex})`,
      titleMm: `${site.mm} - ${time.mm} (အမှတ်စဉ် ${heritageCount})`,
      category: 'heritage_myanmar',
      categoryLabelEn: 'Heritage Myanmar (338+)',
      categoryLabelMm: 'မြန်မာ့သမိုင်းဝင် နန်းတွင်းနှင့် စေတီပုထိုးများ (၃၃၈+)',
      badge: 'ARCHIVAL SET',
      sunDirection: time.sun,
      sunDirectionLabel: time.en,
      atmosphere: time.atmo,
      atmosphereLabel: time.en,
      previewImage: site.img,
      prompt: `Archivally accurate authentic Myanmar heritage location plate of ${site.en}. Atmospheric ${time.en.toLowerCase()}, hyper-detailed traditional Burmese architecture, photorealistic contact occlusion, volumetric depth of field, 8k UHD film render.`,
      lightingNotes: `Directional ${time.en.toLowerCase()} with color-temperature balance tuned for seamless portrait relighting.`,
      tags: ['heritage', 'burmese', 'historical', 'pagoda', 'architecture', site.en.toLowerCase()]
    });
  }

  // Procedurally expand Wedding to 130 entries
  const weddingThemes = [
    { en: 'Palace Pavilion Floral Altar', mm: 'နန်းတွင်းစတိုင်လ် ပန်းမုခ်ဦး မင်္ဂလာစင်မြင့်' },
    { en: 'Grand Waterfall Botanical Glasshouse', mm: 'သဘာဝ ရေတံခွန်နှင့် မှန်နန်းတော် ခန်းမ' },
    { en: 'Sunset Sandy Beach Chandelier Canopy', mm: 'ကမ်းခြေ သဲသောင်ပြင် ဖန်မီးဆိုင်း တဲတော်' },
    { en: 'Luxury Tuscan Vineyard Rose Estate', mm: 'ဥရောပ စပျစ်ခြံနှင့် နှင်းဆီပန်းခင်းကြီး' },
    { en: 'Golden Gilded Lotus Throne Backdrop', mm: 'ရွှေရောင်ကြာပလ္လင် မင်္ဂလာနောက်ခံ' }
  ];

  let weddingCount = WEDDING_BASE.length;
  for (let i = 0; weddingCount < 130; i++) {
    const theme = weddingThemes[i % weddingThemes.length];
    const time = times[i % times.length];
    weddingCount++;

    result.push({
      id: `wedding-set-${weddingCount}`,
      titleEn: `${theme.en} - ${time.en}`,
      titleMm: `${theme.mm} - ${time.mm} (#${weddingCount})`,
      category: 'wedding_prewedding',
      categoryLabelEn: 'Wedding & Pre-Wedding (130+)',
      categoryLabelMm: 'မင်္ဂလာဆောင်နှင့် Pre-Wedding ခန်းမများ (၁၃၀+)',
      badge: 'LUXURY WEDDING',
      sunDirection: time.sun,
      sunDirectionLabel: time.en,
      atmosphere: time.atmo,
      atmosphereLabel: time.en,
      previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
      prompt: `Opulent luxury wedding backdrop featuring ${theme.en}. Lit by ${time.en.toLowerCase()}, romantic floral styling with white peonies and cascading jasmine, elegant reflection floor, 8k photographic masterwork.`,
      lightingNotes: `Soft romantic diffusion with accent rim light on hair and wedding dress fabric edges.`,
      tags: ['wedding', 'luxury', 'prewedding', 'flowers', 'ballroom']
    });
  }

  // Procedurally expand Fashion & Commercial to 100 entries
  const fashionThemes = [
    { en: 'Monochrome High-Key Concrete Plinth', mm: 'မိုနိုခရုန်း ကွန်ကရစ်စင်မြင့် စတူဒီယို' },
    { en: 'Raw Obsidian Stone & Water Reflections', mm: 'ကျောက်နက်တုံးနှင့် ရေပြင်အလင်းပြန်မှု' },
    { en: 'Minimalist Archway Daylight Loft', mm: 'ခေတ်မီ အလင်းပေါက် အမိုးခုံး စတူဒီယို' },
    { en: 'Cyberpunk Tokyo Neon Rooftop Night', mm: 'နီယွန်မီးရောင်စုံ ခေါင်မိုးညရှုခင်း' },
    { en: 'Luxury Velvet Jewelry Shadow Box', mm: 'ကတ္တီပါ ရတနာအရောင်းပြခန်း စတူဒီယို' }
  ];

  let fashionCount = FASHION_BASE.length;
  for (let i = 0; fashionCount < 100; i++) {
    const theme = fashionThemes[i % fashionThemes.length];
    const time = times[i % times.length];
    fashionCount++;

    result.push({
      id: `fashion-set-${fashionCount}`,
      titleEn: `${theme.en} - Edition ${fashionCount}`,
      titleMm: `${theme.mm} (အမှတ်စဉ် ${fashionCount})`,
      category: 'fashion_commercial',
      categoryLabelEn: 'Fashion & Commercial (100+)',
      categoryLabelMm: 'ဖက်ရှင်နှင့် ကြော်ငြာ စတူဒီယိုများ (၁၀၀+)',
      badge: 'COMMERCIAL ATELIER',
      sunDirection: time.sun,
      sunDirectionLabel: time.en,
      atmosphere: time.atmo,
      atmosphereLabel: time.en,
      previewImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
      prompt: `Commercial fashion editorial plate with ${theme.en}. Precise commercial lighting, razor-sharp contact shadows, ultra-clean studio framing, 8k Hasselblad quality.`,
      lightingNotes: `High-definition rim lights with controlled falloff designed for fashion model compositing.`,
      tags: ['fashion', 'commercial', 'studio', 'editorial', 'vogue']
    });
  }

  // Procedurally expand Baby to 80 entries
  const babyThemes = [
    { en: 'Fairytale Pastel Moon & Teddy Picnic', mm: 'လမင်းကြီးနှင့် ဝက်ဝံရုပ်လေးများ ပျော်ပွဲစား' },
    { en: 'Boho Teak Wood Nursery with Macrame', mm: 'သဘာဝ သစ်သား ကလေးအိပ်ခန်း အလှ' },
    { en: 'Hot Air Balloon in Cotton Clouds', mm: 'ဂွမ်းတိမ်တိုက်ထဲက မီးပုံးပျံကလေး' },
    { en: 'Sunflower Field & Pastel Wooden Wagon', mm: 'နေကြာခင်းနှင့် သစ်သားတွန်းလှည်းကလေး' }
  ];

  let babyCount = BABY_BASE.length;
  for (let i = 0; babyCount < 80; i++) {
    const theme = babyThemes[i % babyThemes.length];
    babyCount++;

    result.push({
      id: `baby-set-${babyCount}`,
      titleEn: `${theme.en} (#${babyCount})`,
      titleMm: `${theme.mm} (#${babyCount})`,
      category: 'baby_family',
      categoryLabelEn: 'Baby & Family (80+)',
      categoryLabelMm: 'ကလေးနှင့် မိသားစု အမှတ်တရ (၈၀+)',
      badge: 'BABY & KIDS',
      sunDirection: 'overhead',
      sunDirectionLabel: 'Soft Diffuse Baby Light',
      atmosphere: 'dreamy_mist',
      atmosphereLabel: 'Pastel Dreamscape',
      previewImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85',
      prompt: `Whimsical cozy photo studio backdrop for baby milestone photography featuring ${theme.en}. Soft safe illumination, pastel color palette, warm tender atmosphere, 8k.`,
      lightingNotes: `Soft, zero-glare wraparound lighting with warm organic bounce.`,
      tags: ['baby', 'kids', 'nursery', 'cute', 'fairytale']
    });
  }

  // Procedurally expand Atmosphere to 120 entries
  const atmoThemes = [
    { en: 'Golden Hour Dust Beams in Bamboo Forest', mm: 'ဝါးတောထဲ နေရောင်ခြည်တန်းများ ထိုးဆင်းမှု' },
    { en: 'Monsoon Rain Droplets on Glass Cafe', mm: 'မိုးရေစက်များနှင့် ကော်ဖီဆိုင် ပြတင်းပေါက်' },
    { en: 'Floating Lantern Festival on Starry River', mm: 'ဆီမီးခွက် မျှောပွဲနှင့် ကြယ်ရောင်စုံ ညချမ်း' },
    { en: 'Crisp Highland Winter Morning Mist', mm: 'တောင်ပေါ် ဆောင်းမနက်ခင်း မြူခိုးဆိုင်း ရှုခင်း' }
  ];

  let atmoCount = ATMOSPHERE_BASE.length;
  for (let i = 0; atmoCount < 120; i++) {
    const theme = atmoThemes[i % atmoThemes.length];
    const time = times[i % times.length];
    atmoCount++;

    result.push({
      id: `atmo-set-${atmoCount}`,
      titleEn: `${theme.en} - ${time.en}`,
      titleMm: `${theme.mm} - ${time.mm} (#${atmoCount})`,
      category: 'atmosphere_seasons',
      categoryLabelEn: 'Atmosphere & Seasons (120+)',
      categoryLabelMm: 'ရာသီဥတုနှင့် အလင်းလမ်းကြောင်းများ (၁၂၀+)',
      badge: 'ATMOSPHERE & FX',
      sunDirection: time.sun,
      sunDirectionLabel: time.en,
      atmosphere: time.atmo,
      atmosphereLabel: time.en,
      previewImage: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=85',
      prompt: `Cinematic environmental lighting plate with ${theme.en}. Atmospheric ${time.en.toLowerCase()}, realistic weather VFX, volumetric dust motes, 8k photographic masterwork.`,
      lightingNotes: `Complex multi-source environmental lighting designed for cinematic rim light and color bleed harmonization.`,
      tags: ['atmosphere', 'weather', 'lighting', 'fog', 'sunset', 'cinematic']
    });
  }

  return result;
}

export const SCENES_550_COLLECTION: SceneItem[] = generateExpandedScenes();

export const SCENE_CATEGORIES: SceneCategoryMeta[] = [
  {
    id: 'all',
    labelEn: 'All 768+ Scenes',
    labelMm: 'ရှုခင်းပေါင်း ၇၆၈+ အားလုံး',
    badge: 'TOTAL 768+',
    count: SCENES_550_COLLECTION.length,
    icon: 'auto_awesome'
  },
  {
    id: 'heritage_myanmar',
    labelEn: 'Heritage Myanmar',
    labelMm: 'မြန်မာ့သမိုင်းဝင် နန်းတွင်းနှင့် စေတီပုထိုးများ',
    badge: '338+ SETS',
    count: SCENES_550_COLLECTION.filter(s => s.category === 'heritage_myanmar').length,
    icon: 'temple_buddhist'
  },
  {
    id: 'wedding_prewedding',
    labelEn: 'Luxury Wedding',
    labelMm: 'မင်္ဂလာဆောင်နှင့် Pre-Wedding ခန်းမများ',
    badge: '130+ SETS',
    count: SCENES_550_COLLECTION.filter(s => s.category === 'wedding_prewedding').length,
    icon: 'favorite'
  },
  {
    id: 'fashion_commercial',
    labelEn: 'Fashion & Commercial',
    labelMm: 'ဖက်ရှင်နှင့် ကြော်ငြာ စတူဒီယိုများ',
    badge: '100+ SETS',
    count: SCENES_550_COLLECTION.filter(s => s.category === 'fashion_commercial').length,
    icon: 'checkroom'
  },
  {
    id: 'baby_family',
    labelEn: 'Baby & Family',
    labelMm: 'ကလေးနှင့် မိသားစု အမှတ်တရ',
    badge: '80+ SETS',
    count: SCENES_550_COLLECTION.filter(s => s.category === 'baby_family').length,
    icon: 'child_care'
  },
  {
    id: 'atmosphere_seasons',
    labelEn: 'Atmosphere & Seasons',
    labelMm: 'ရာသီဥတုနှင့် အလင်းလမ်းကြောင်းများ',
    badge: '120+ SETS',
    count: SCENES_550_COLLECTION.filter(s => s.category === 'atmosphere_seasons').length,
    icon: 'wb_sunny'
  }
];
