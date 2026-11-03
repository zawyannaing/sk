export interface CommunityCreation {
  id: string;
  title: string;
  titleMm?: string;
  author: string;
  authorHandle?: string;
  authorAvatar: string;
  authorBio?: string;
  imageUrl: string;
  masterPrompt: string;
  negativePrompt?: string;
  model: string;
  aspectRatio: string;
  category: 'Royal Heritage' | 'Wedding Studio' | 'Hairstyle' | 'Modern Editorial' | 'Cinematic Studio' | 'General';
  tags: string[];
  likesCount: number;
  viewsCount: number;
  remixesCount?: number;
  createdAt: string;
  isVerifiedCreator?: boolean;
  allowRemix?: boolean;
}

export const COMMUNITY_CREATIONS: CommunityCreation[] = [
  {
    id: 'comm-bagan-golden-sunset',
    title: 'Bagan Sunlit Princess in Crimson Acheik',
    titleMm: 'ပုဂံနေဝင်ဆည်းဆာနှင့် မဟာလတာ ရွှေချည်ထိုးဝတ်စုံ',
    author: 'Aung Kyaw (Show AI Director)',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'Cinematic master portrait of a graceful Burmese noblewoman standing atop ancient Bagan temple brick terrace, warm golden hour sunbeams streaming across red stupas, wearing authentic handwoven crimson Luntaya Acheik silk wrap skirt with 24k gold bullion Zardosi embroidery, high coiled Sadon hair updo decorated with fragrant white jasmine blossoms, delicate Thanaka powder on cheekbones, shot on Hasselblad X2D 100C with 85mm f/1.4 lens, 100% exact facial identity preserved, Kodak Portra 400 color grading --ar 4:5 --v 6.1 --style raw',
    negativePrompt: 'different face, altered face, modern western clothing, wrist watch, plastic skin, anime smoothing, deformed hands',
    model: 'Nano Banana 2 (OpenRouter Pro)',
    aspectRatio: '4:5',
    category: 'Royal Heritage',
    tags: ['#Bagan', '#AcheikSilk', '#SadonHair', '#Thanaka', '#100PercentFaceLock'],
    likesCount: 342,
    viewsCount: 1850,
    createdAt: '2 hours ago',
    isVerifiedCreator: true
  },
  {
    id: 'comm-royal-sadon-jasmine',
    title: 'Mandalay Royal Sadon Coiffure with Star Jasmine',
    titleMm: 'မန္တလေးနန်းတွင်း စံပယ်တင် ဆံထုံးတော် (100% Face Preserved)',
    author: 'Su Myat Noe',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'CRITICAL 100% BIOLOGICAL FACIAL IDENTITY LOCK: Preserve 100% exact facial likeness, exact same person, identical eyes, identical eyelids, biological iris color, identical nose bridge and nostril geometry, identical lip fullness and cupid\'s bow. RESTYLE ONLY THE HAIRSTYLE TO: Masterfully coiffured traditional Mandalay royal Sadon hair bun, soaring cylindrical architectural crown updo encircled by fresh fragrant white blooming star jasmine garland, natural delicate baby hair tendrils along forehead, glossy deep obsidian black sheen, biological face preserved 100%, Profoto Octabox 45 key light, 8k raw photo --ar 4:5',
    negativePrompt: 'altered face, changed eyes, plastic skin, doll eyes, synthetic face swap, face deformation',
    model: 'Nano Banana 2 (Google Gemini Image)',
    aspectRatio: '4:5',
    category: 'Hairstyle',
    tags: ['#HairstyleSwap', '#SadonHair', '#JasmineGarland', '#HairTransformation'],
    likesCount: 518,
    viewsCount: 2940,
    createdAt: '4 hours ago',
    isVerifiedCreator: true
  },
  {
    id: 'comm-palace-grand-wedding',
    title: 'Konbaung Throne Hall Royal Wedding Regalia',
    titleMm: 'ကုန်းဘောင်နန်းတွင်း ပလ္လင်တော်ရှေ့ တော်ဝင်မင်္ဂလာမောင်နှံ',
    author: 'Studio Maestro MM',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'CRITICAL 100% ZERO-DISTORTION FACE LOCK DIRECTIVE: Preserve 100% exact facial identity, biological bone structure, irises, and natural skin micro-texture of the couple. Grand Burmese Royal Palace wedding portrait in front of golden Kanote carved throne hall, bride wearing ivory and gold embroidered Maha Lata silk court gown with emerald necklace, groom wearing ceremonial gold Taikpon jacket and silk Gaung Baung headwrap, warm golden chandeliers, 85mm f/1.2 lens, masterwork composition --ar 4:5 --v 6.1 --style raw',
    negativePrompt: 'different face, altered face, modern tuxedo, Western veil, cartoon smoothing, deformed anatomy',
    model: 'Nano Banana Pro (Gemini 3 Pro)',
    aspectRatio: '4:5',
    category: 'Wedding Studio',
    tags: ['#RoyalWedding', '#MahaLata', '#Taikpon', '#GoldThrone', '#WeddingStudio'],
    likesCount: 684,
    viewsCount: 4210,
    createdAt: '1 day ago',
    isVerifiedCreator: true
  },
  {
    id: 'comm-korean-soft-waves-modern',
    title: 'Mermaid S-Waves with Honey Caramel Highlights',
    titleMm: 'ခေတ်မီ ကိုရီးယား S-Wave ပျားရည်ရောင် ဆံကေသာ',
    author: 'Elena Vance (Global Creator)',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'CRITICAL 100% FACE PRESERVATION DIRECTIVE: Preserve 100% exact facial features, identical eyes, nose, lips, jawline geometry from original reference portrait. RESTYLE ONLY THE HAIRSTYLE: Voluminous cascading Korean mermaid S-waves, effortless curtain bangs framing cheekbones, warm honey caramel amber highlights woven through hair, high-gloss salon shine, authentic hair strand physics, shot on Sony A7R V with 50mm f/1.2 GM prime lens --ar 9:16',
    negativePrompt: 'changed face, altered bone structure, bad eyes, plastic skin, anime smoothing',
    model: 'GPT Image 2 (OpenAI Flagship)',
    aspectRatio: '9:16',
    category: 'Hairstyle',
    tags: ['#KoreanWaves', '#HoneyCaramel', '#CurtainBangs', '#EditorialHair'],
    likesCount: 429,
    viewsCount: 2310,
    createdAt: '1 day ago'
  },
  {
    id: 'comm-vogue-inle-editorial',
    title: 'Inle Lake Floating Garden Vogue Haute Couture',
    titleMm: 'အင်းလေးရေပြင်နှင့် Vogue စတိုင်လ် ခေတ်မီပိုးထည်ဆင်ယင်မှု',
    author: 'Min Thant Han',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'High-fashion editorial portrait of a modern Burmese model on traditional wooden canoe gliding across mist-covered Inle Lake at sunrise, wearing avant-garde sculptural indigo blue hand-loomed lotus silk cape combined with modern minimalist silhouette, dramatic morning rim lighting, mist drifting over calm blue water, Shan mountain silhouettes in background, Leica SL2 with 50mm Summilux f/1.4, Vogue editorial color grading --ar 16:9 --style raw --v 6.1',
    negativePrompt: 'low quality, oversaturated, plastic skin, distorted hands, commercial text',
    model: 'FLUX.1 Pro Realism',
    aspectRatio: '16:9',
    category: 'Modern Editorial',
    tags: ['#InleLake', '#LotusSilk', '#VogueEditorial', '#HighFashion'],
    likesCount: 388,
    viewsCount: 1990,
    createdAt: '2 days ago',
    isVerifiedCreator: true
  },
  {
    id: 'comm-cinematic-shwedagon-night',
    title: 'Shwedagon Stupa Moonlight Glow Cinematic Frame',
    titleMm: 'ရွှေတိဂုံ ရင်ပြင်တော် လရောင်ဆည်းဆာ ရုပ်ရှင်ဆန်ဆန် ဖရိမ်',
    author: 'Kyaw Zayar (Cinematographer)',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1080&q=80',
    masterPrompt: 'ARRI Alexa 65 cinematic film still of a tranquil night at Shwedagon Pagoda platform, golden stupa gleaming majestically into midnight indigo sky, flickering oil lamps lining marble terrace, gentle rain reflections creating luminous bokeh, atmospheric mist, anamorphic lens flare, warm 3200K lantern glow balanced by 5600K moonlight, 8k resolution, cinematic grain --ar 16:9',
    negativePrompt: 'CGI, video game render, flat lighting, daylight, modern tourists, umbrellas',
    model: 'Bytedance Seedance 2.5 Cinema',
    aspectRatio: '16:9',
    category: 'Cinematic Studio',
    tags: ['#Shwedagon', '#Cinematic', '#NightGlow', '#AnamorphicLens', '#VideoPrompt'],
    likesCount: 612,
    viewsCount: 3500,
    createdAt: '3 days ago',
    isVerifiedCreator: true
  }
];
