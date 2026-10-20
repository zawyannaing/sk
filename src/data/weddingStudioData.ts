export interface WeddingTemplate {
  id: string;
  titleEn: string;
  titleMm: string;
  category: 'Royal Heritage' | 'Grand Ballroom' | 'Bagan Sunset' | 'Inle Lake' | 'Floral Garden' | 'Beach Sunset' | 'Studio Editorial';
  previewUrl: string;
  lighting: string;
  setting: string;
  attire: string;
  pose: string;
  promptSnippet: string;
}

export const WEDDING_CATEGORIES = [
  'All',
  'Royal Heritage',
  'Grand Ballroom',
  'Bagan Sunset',
  'Inle Lake',
  'Floral Garden',
  'Beach Sunset',
  'Studio Editorial'
] as const;

export const WEDDING_TEMPLATES: WeddingTemplate[] = [
  // ==========================================
  // CATEGORY 1: ROYAL HERITAGE (10 Templates)
  // ==========================================
  {
    id: 'mandalay-palace-golden-throne',
    titleEn: 'Mandalay Royal Palace Golden Throne Gala',
    titleMm: 'မန္တလေး ရွှေနန်းတော် ပလ္လင်တော်ရှေ့ မင်္ဂလာအခမ်းအနား',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm regal golden chandelier bounce, dramatic directional key light',
    setting: 'Mandalay Palace carved teak hall, velvet gold drapery, antique lacquerware',
    attire: 'Gold-threaded silk acheik longyi, ornate taikpong jacket, royal satin sash',
    pose: 'Formal royal standing pose, dignified posture with affectionate eye contact',
    promptSnippet: 'Burmese royal palace wedding portrait, couple standing majestically before the intricately carved golden Mandalay Palace teak hall, groom in opulent amber silk acheik longyi with gold-embroidered taikpong jacket, bride in shimmering emerald and gold silk hta-mein with sweeping royal train, wearing golden jasmine flower updo, warm volumetric chandelier illumination, shot on Hasselblad X2D 100C with 85mm f/1.4 lens'
  },
  {
    id: 'konbaung-dynasty-court-ceremony',
    titleEn: 'Konbaung Dynasty Royal Court Wedding',
    titleMm: 'ကုန်းဘောင်ခေတ် နန်းတွင်း တော်ဝင်မင်္ဂလာစုံတွဲ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft diffused teak window light, warm candle rim glow',
    setting: 'Antique Burmese palace pavilion with gilded lotus pillars',
    attire: 'Crimson and gold silk brocade with diamond-studded royal collars',
    pose: 'Graceful sitting and standing composition, groom seated on teak bench, bride standing beside',
    promptSnippet: 'Konbaung dynasty court wedding ceremony, Burmese couple in authentic historical royal garments, crimson silk brocade heavy with real gold thread, traditional gilded ear ornaments, ceremonial gold bowl and lotus offerings, dramatic painterly light falling softly on natural skin micro-texture, cinematic 8k fine art portrait'
  },
  {
    id: 'inwa-royal-monastery-teak',
    titleEn: 'Inwa Ancient Bagaya Teakwood Monastery',
    titleMm: 'အင်းဝ ဗားကရာ သစ်သားကျောင်းကြီး မင်္ဂလာအမှတ်တရ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Atmospheric shaft of natural sunlight filtering through antique timber lattices',
    setting: 'Centuries-old dark teak wood carvings of Bagaya Monastery Inwa',
    attire: 'Champagne gold raw silk with minimalist modern royal tailoring',
    pose: 'Intimate walking pose along the grand teak monastery corridor',
    promptSnippet: 'romantic pre-wedding couple walking down the majestic dark teakwood corridor of ancient Inwa Bagaya monastery, sunbeams piercing through lattice screens creating volumetric golden god-rays, elegant champagne raw silk traditional Burmese outfits with delicate metallic shimmer, authentic film color grade'
  },
  {
    id: 'shwedagon-sacred-terrace-blessing',
    titleEn: 'Sacred Shwedagon Pagoda Terrace Blessing',
    titleMm: 'ရွှေတိဂုံ ရင်ပြင်တော် မင်္ဂလာဆုတောင်း အမှတ်တရ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    lighting: 'Golden hour twilight with reflections on marble terrace',
    setting: 'Gleaming golden stupas of Shwedagon Pagoda at dusk',
    attire: 'Pure ivory white silk acheik with subtle mother-of-pearl threading',
    pose: 'Respectful hands folded in prayer facing the golden stupa together',
    promptSnippet: 'sacred Burmese wedding couple on the gleaming marble terrace of Shwedagon Pagoda during magic blue hour, massive golden stupa radiating divine light in background, couple in immaculate ivory white silk acheik attire with fresh fragrant jasmine garlands, serene devotional expressions, ultra-crisp reflections on marble floor'
  },
  {
    id: 'bagan-ananda-temple-archway',
    titleEn: 'Ananda Temple Stone Archway Reverence',
    titleMm: 'အာနန္ဒာ ဘုရား ကျောက်မုခ်ဝ မင်္ဂလာရိုက်ကူးရေး',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Deep chiaroscuro contrast between dark temple arch and bright ancient courtyard',
    setting: 'Monolithic whitewashed stone corridors of 11th century Ananda Temple',
    attire: 'Terracotta and copper gold handwoven silk longyi',
    pose: 'Silhouette-accented side profile embrace inside grand stone arch',
    promptSnippet: 'fine-art wedding portrait framed inside the massive historic arched gateway of Ananda Temple in Bagan, couple silhouetted against glowing sun-drenched ancient stupas, terracotta and copper silk fabrics with micro-woven heritage patterns, Rembrandt lighting on facial profiles, 8k resolution'
  },
  {
    id: 'amarapura-silk-weaving-village',
    titleEn: 'Amarapura Heritage Silk Atelier Romance',
    titleMm: 'အမရပူရ ရိုးရာရက်ကန်း အနုပညာ မင်္ဂလာစုံတွဲ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm window daylight highlighting colorful silk spools and antique wooden loom',
    setting: 'Artisan handloom silk weaving studio in Amarapura',
    attire: 'Multi-layered colorful royal acheik pattern woven on traditional loom',
    pose: 'Bride gently holding hand-spun silk spool while groom smiles lovingly at her',
    promptSnippet: 'intimate heritage couple portrait in a rustic traditional Amarapura silk weaving workshop, surrounded by hanging rainbow silk skeins and vintage wooden looms, bride draped in intricate hundred-shuttle Acheik silk, groom holding her hand tenderly, tactile textural depth, natural candid chemistry'
  },
  {
    id: 'u-bein-bridge-golden-sunset',
    titleEn: 'U Bein Bridge Timeless Teakwood Sunset',
    titleMm: 'ဦးပိန်တံတား နေဝင်ဆည်းဆာ ရင်ခုန်သံ မင်္ဂလာ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80',
    lighting: 'Fiery crimson and orange golden hour sunset with calm water reflections',
    setting: 'Historic U Bein teak bridge spanning across Taungthaman Lake',
    attire: 'Sunset amber and pastel coral modern Burmese traditional attire',
    pose: 'Couple standing hand-in-hand along the wooden bridge railing looking out at the sunset',
    promptSnippet: 'epic pre-wedding photo on the legendary U Bein Bridge over Taungthaman lake, glowing golden sun descending on the horizon, silhouettes of local wooden boats below, couple in flowing sunset-colored silk acheik longyi with silk train fluttering in the breeze, cinematic wide-angle 24mm f/1.4 masterpiece'
  },
  {
    id: 'bago-kanbawzathadi-golden-pavilion',
    titleEn: 'Bago Kanbawzathadi Golden Lion Palace',
    titleMm: 'ပဲခူး ကမ္ဘောဇသာဒီ ရွှေနန်းတော် သီဟာသနပလ္လင် မင်္ဂလာ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    lighting: 'Gilded palace interior illumination, golden reflective ambient glow',
    setting: 'Reconstructed grand golden hall of King Bayinnaung with massive gilded teak columns',
    attire: 'Heavy gold-embroidered velvet overcoats with authentic royal insignia',
    pose: 'Majestic frontal portrait standing centered between twin golden pillars',
    promptSnippet: 'grand imperial Burmese wedding in the Kanbawzathadi Palace golden throne hall, couple surrounded by towering gold-leafed teak columns, royal crimson velvet jackets embroidered with metallic bullion threads, exquisite diamond tiara and hair combs, regal atmosphere, masterclass composition'
  },
  {
    id: 'sagaing-hills-panoramic-pagoda',
    titleEn: 'Sagaing Hills Panoramic Stupa Terrace',
    titleMm: 'စစ်ကိုင်းတောင်ရိုး စေတီတန်း မင်္ဂလာရှုခင်း အလှ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    lighting: 'Crystal morning daylight, misty atmospheric depth over Ayeyarwady River',
    setting: 'Hilltop pagoda terrace overlooking countless white and gold stupas along green hills',
    attire: 'Pale sky-blue and white silk acheik with silver filigree jewellery',
    pose: 'Couple leaning close together looking out over the panoramic river valley',
    promptSnippet: 'breathtaking hilltop wedding portrait on Sagaing Hills overlooking the winding Irrawaddy River and hundreds of white pagodas dotting the landscape, soft morning mist, couple in pale sky-blue silk acheik ensemble with silver floral embroidery, fresh wind softly moving fabrics, high dynamic range'
  },
  {
    id: 'pyay-shwesandaw-antique-terrace',
    titleEn: 'Ancient Pyay Shwesandaw Grand Terrace',
    titleMm: 'ပြည် ရွှေဆံတော် ရင်ပြင် မင်္ဂလာ အမှတ်တရ',
    category: 'Royal Heritage',
    previewUrl: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dusk twilight lanterns casting warm golden glow across stone tiles',
    setting: 'Ancient Mon-Burmese pagoda terrace with brass bells and stone guardian lions',
    attire: 'Deep royal sapphire silk with intricate gold embroidery',
    pose: 'Couple sharing a warm candid smile under the gentle chiming pagoda bells',
    promptSnippet: 'romantic evening wedding portrait on the historic terrace of Pyay Shwesandaw Pagoda, brass wind chimes in background, warm bronze lanterns illuminating stone tiles, couple in deep sapphire blue silk with handcrafted gold floral threadwork, natural intimate gaze, authentic Burmese beauty'
  },

  // ==========================================
  // CATEGORY 2: GRAND BALLROOM (10 Templates)
  // ==========================================
  {
    id: 'grand-crystal-ballroom-first-dance',
    titleEn: 'Grand Palace Ballroom First Dance',
    titleMm: 'ဟိုတယ်ခန်းမကြီး ညစာစားပွဲ ပထမဆုံး အကလှုပ်ရှားမှု',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Extravagant cascading crystal chandeliers, soft pink and amber pin-spot lighting',
    setting: 'Luxury hotel grand ballroom with mirror polished dance floor and floral stage',
    attire: 'Flawless white lace bridal ballgown with sweeping 3-meter train, classic black tuxedo',
    pose: 'Couple slow dancing in the center of the ballroom, groom gently guiding bride in a turn',
    promptSnippet: 'opulent grand ballroom wedding reception, couple dancing gracefully in the center of a glossy reflective marble dance floor, surrounded by towering crystal chandeliers casting golden prisms of light, bride in sweeping royal lace ballgown with sparkling crystals, groom in custom bespoke black tuxedo, indoor fireworks cold sparks in distance'
  },
  {
    id: 'cascading-white-rose-arch-gala',
    titleEn: 'Cascading White Rose Archway Stage',
    titleMm: 'အဖြူရောင် နှင်းဆီပန်းခုံး စင်မြင့် မင်္ဂလာညချမ်း',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft ambient fairy-light backdrop with warm frontal beauty dish illumination',
    setting: 'Magnificent 5-meter tall cascading floral arch filled with white roses and orchids',
    attire: 'Modern embroidered silk wedding gown with sheer cape, sleek matching champagne tuxedo',
    pose: 'Standing under the floral arch holding hands, gazing tenderly at one another',
    promptSnippet: 'luxury floral archway wedding stage, couple standing beneath a lavish arch of thousands of fresh white roses, phalaenopsis orchids and eucalyptus greens, twinkling fairy lights creating creamy bokeh background, bride holding a hand-tied peony bouquet, groom with rose boutonniere, magazine cover quality'
  },
  {
    id: 'champagne-tower-celebration',
    titleEn: 'Champagne Tower Toast Gala',
    titleMm: 'ရှန်ပိန်တာဝါ မင်္ဂလာ ဂုဏ်ပြုဖန်ခွက် လောင်းကြွေးခြင်း',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    lighting: 'Crisp rim light catching bubbling crystal champagne flutes',
    setting: 'Seven-tier crystal champagne fountain on mirrored banquet table',
    attire: 'Sleek modern satin bridal gown, midnight navy velvet tuxedo',
    pose: 'Couple together holding the champagne bottle pouring the top tier, joyful beaming smiles',
    promptSnippet: 'glamorous wedding toast, bride and groom together pouring a bubbling golden champagne tower of seven crystal tiers, effervescent bubbles catching bright highlights, joyful authentic laughter, luxury ballroom background with seated guests applauding in soft focus, high-speed photography capturing sparkling droplets'
  },
  {
    id: 'royal-mirror-corridor-entrance',
    titleEn: 'Palace Hall of Mirrors Grand Walk',
    titleMm: 'မှန်နန်းဆောင် စင်္ကြံကြီး မင်္ဂလာဝင်ပေါက် လမ်းလျှောက်',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    lighting: 'Symmetrical wall sconces and crystal chandeliers reflecting infinitely',
    setting: 'Gilded European style corridor with floor-to-ceiling baroque gilded mirrors',
    attire: 'French lace bridal gown with off-shoulder neckline, tailored charcoal morning suit',
    pose: 'Couple walking arm-in-arm down the grand aisle with confident celebratory smiles',
    promptSnippet: 'grand hallway of mirrors wedding entrance, dramatic perspective down an opulent baroque corridor with towering gilded mirrors reflecting chandelier light, couple walking arm-in-arm toward camera, bride\'s cathedral veil trailing smoothly behind, polished marble floors, editorial wedding fashion'
  },
  {
    id: 'candlelit-long-banquet-romance',
    titleEn: 'Candlelit Imperial Banquet Table Romance',
    titleMm: 'ဖယောင်းတိုင်အလင်း ရင်ခုန်ဖွယ် ဧည့်ခံစားပွဲ အလှ',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Hundreds of tall glowing tapered candles creating warm intimate flickering ambience',
    setting: 'Intimate long wooden banquet table laden with silver candelabras and lush florals',
    attire: 'Vintage lace wedding dress with pearl buttons, tailored tweed waistcoat suit',
    pose: 'Seated close across the candlelit table, whispering and laughing together',
    promptSnippet: 'intimate candlelit wedding dinner table, hundreds of glowing ivory taper candles in tall silver candelabras, couple seated close together bathed in warm amber candlelight, deep romantic shadows, crystal wine glasses and fresh flower garlands along the table, ultra-warm mood'
  },
  {
    id: 'grand-staircase-regal-portrait',
    titleEn: 'Grand Marble Staircase Descent',
    titleMm: 'စကျင်ကျောက် လှေကားကြီးပေါ်မှ မင်္ဂလာစုံတွဲ',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dramatic high-angle spotlight illuminating the staircase and sweeping dress',
    setting: 'Sweeping dual-curving marble staircase with wrought-iron and gold railings',
    attire: 'Royal gown with dramatic 5-meter train fanning across marble steps, classic white-tie tuxedo',
    pose: 'Bride pausing on middle landing looking back at groom holding her hand from above',
    promptSnippet: 'regal architectural wedding portrait on a sweeping curved marble staircase, bride\'s voluminous silk train cascading down multiple marble steps with immaculate symmetry, groom leaning down to kiss her hand gently, dramatic architectural scale, luxury hotel lobby'
  },
  {
    id: 'indoor-cold-spark-grand-finale',
    titleEn: 'Cold Sparks Grand Finale Celebration',
    titleMm: 'မီးပန်းအလင်းတန်း မင်္ဂလာအောင်ပွဲ ညချမ်း',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    lighting: 'Brilliant golden sparkler geysers framing the couple with bright rim light',
    setting: 'Center stage surrounded by four 4-meter indoor cold-firework fountains',
    attire: 'Sparkling glitter-infused bridal ballgown catching light, modern shawl-collar tuxedo',
    pose: 'Groom sweeping bride into a romantic dip kiss amidst the golden sparkler rain',
    promptSnippet: 'dramatic wedding dip kiss on stage surrounded by fountains of safe indoor cold spark fireworks shooting high into the air, golden sparks illuminating the dancing couple in crisp freeze-frame motion, bride\'s gown sparkling like starlight, ecstatic celebratory energy'
  },
  {
    id: 'opulent-cake-cutting-ceremony',
    titleEn: 'Seven-Tier Floral Cake Cutting',
    titleMm: '၇ ထပ် မင်္ဂလာကိတ်မုန့် လှီးဖြတ်ခြင်း အမှတ်တရ',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft warm spotlight on cake and couple with dim ballroom background',
    setting: 'Towering 7-tier fondant wedding cake adorned with edible sugar orchids and pearls',
    attire: 'Contemporary Burmese-Western fusion bridal gown with embroidered lace bodice',
    pose: 'Couple holding the silver ribboned knife together slicing the first piece',
    promptSnippet: 'traditional wedding cake cutting moment, bride and groom together holding a silver ribboned ceremonial knife slicing into a magnificent 7-tier fondant masterpiece covered in sugar blossoms, sweet shared expressions of joy, romantic spotlight illumination'
  },
  {
    id: 'romantic-balcony-dusk-view',
    titleEn: 'Ballroom Private Balcony at Dusk',
    titleMm: 'ဟိုတယ် လသာဆောင် မင်္ဂလာညချမ်း သီးသန့် အမှတ်တရ',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Deep indigo dusk sky outside contrasting with warm ballroom glow from French doors',
    setting: 'Stone balustrade balcony overlooking the illuminated city skyline',
    attire: 'Elegant fitted mermaid wedding gown with low back, sleek black tie tuxedo',
    pose: 'Couple embracing on the private balcony, groom with arms around bride\'s waist from behind',
    promptSnippet: 'quiet intimate wedding escape on a hotel ballroom terrace, couple leaning against stone balustrade overlooking shimmering city lights at blue hour, warm incandescent light spilling from open french doors, groom whispering into bride\'s ear, breeze gently lifting veil'
  },
  {
    id: 'crystal-canopy-chuppah-stage',
    titleEn: 'Crystal & White Wisteria Canopy Stage',
    titleMm: 'ကြည်လင်သော သလင်းကျောက်နှင့် ဝစ္စတီးရီးယား ပန်းခေါင်မိုး',
    category: 'Grand Ballroom',
    previewUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    lighting: 'Hanging glass globes with tea-lights, ethereal soft-focus illumination',
    setting: 'Ceiling covered with thousands of hanging white wisteria blossoms and crystal strands',
    attire: 'Bohemian luxury bridal lace with long flared sleeves, soft cream bespoke suit',
    pose: 'Couple standing beneath the hanging flower canopy looking up together with wonder',
    promptSnippet: 'fairytale indoor wedding altar draped in hanging white wisteria vines and suspended glass tea-light orbs, couple standing enveloped in magical floral rain, soft ethereal dreamscape lighting, high fashion photography, breathtaking depth and romance'
  },

  // ==========================================
  // CATEGORY 3: BAGAN SUNSET (10 Templates)
  // ==========================================
  {
    id: 'bagan-hot-air-balloon-sunrise',
    titleEn: 'Bagan Hot Air Balloon Sunrise Stupas',
    titleMm: 'ပုဂံ မိုးပျံပူဖောင်းနှင့် နေထွက်ချိန် စေတီတန်း မင်္ဂလာ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80',
    lighting: 'First morning golden sunlight piercing morning mist with fiery orange hues',
    setting: 'Rooftop of an ancient brick temple overlooking dozens of hot air balloons in flight',
    attire: 'Flowing white boho wedding dress with sheer flutter train, light linen suit',
    pose: 'Groom lifting bride playfully with ancient stupas and colorful balloons in horizon',
    promptSnippet: 'epic destination wedding pre-wedding portrait in ancient Bagan at sunrise, dozens of hot air balloons floating across the pastel pink and gold morning sky, ancient brick temples rising from the morning mist, couple standing on ancient temple terrace, bride\'s flowing dress caught in the morning breeze'
  },
  {
    id: 'bagan-dhammayangyi-temple-dusk',
    titleEn: 'Colossal Dhammayangyi Temple Dusk',
    titleMm: 'ဓမ္မရံကြီး ဘုရားကြီးရှေ့ နေဝင်ဆည်းဆာ ရင်ခုန်သံ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dramatic red and amber sunset sky with dark silhouettes of massive brickwork',
    setting: 'Wide dusty plain in front of the colossal pyramid-like Dhammayangyi Temple',
    attire: 'Traditional Burmese terracotta and gold silk acheik longyi with royal parasol',
    pose: 'Couple walking slowly across the golden grass plain toward the monumental temple',
    promptSnippet: 'monumental pre-wedding photo on the dusty Bagan plains in front of the massive brick Dhammayangyi Temple, dramatic blood-orange sunset burning on the horizon, couple in traditional Burmese terracotta and gold silk acheik, holding a traditional oiled paper Pathein parasol, National Geographic grade'
  },
  {
    id: 'bagan-horse-drawn-carriage-sunset',
    titleEn: 'Traditional Bagan Horse Carriage Sunset Walk',
    titleMm: 'ပုဂံ မြင်းလှည်းလေးနှင့် ရှေးဟောင်းလမ်းကလေး မင်္ဂလာ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm golden backlighting creating halo outlines on horse and couple',
    setting: 'Dusty dirt path winding between centuries-old red brick pagodas with traditional carriage',
    attire: 'Rustic vintage ivory wedding dress with lace embroidery, light khaki suit',
    pose: 'Couple standing beside a decorated traditional wooden horse carriage',
    promptSnippet: 'romantic rustic wedding photo in Bagan, vintage painted wooden horse cart decorated with fresh bougainvillea flowers, couple standing affectionately beside the horse carriage on a dirt road, warm golden dust motes dancing in the sunset light, dozens of pagodas in the background'
  },
  {
    id: 'bagan-shwesandaw-terrace-vista',
    titleEn: 'Shwesandaw Panoramic Stupa Valley',
    titleMm: 'ရွှေဆံတော် တောင်ကုန်း စေတီပေါင်း ထောင်ချီရှုခင်း',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    lighting: 'Magic golden hour with long shadows stretching across the grassy plains',
    setting: 'Elevated ancient viewing mound with 360-degree views of Bagan archaeological zone',
    attire: 'Bespoke modern royal silk gown with sheer hand-painted organza veil',
    pose: 'Bride seated gracefully on stone block, groom standing protective and loving beside her',
    promptSnippet: 'breathtaking wide panorama of the Bagan archaeological zone at sunset, ancient red brick pagodas scattered across endless savannah, couple standing on an elevated mound, bride\'s translucent silk veil blowing dramatically in the warm wind, warm cinema anamorphic optics'
  },
  {
    id: 'bagan-thatbyinnyu-whitewashed-temple',
    titleEn: 'Thatbyinnyu Towering White Temple',
    titleMm: 'သဗ္ဗညု ဘုရားကြီးရှေ့ တော်ဝင်မင်္ဂလာစုံတွဲ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Crisp midday sun with dramatic shadow geometry along white spires',
    setting: 'Base of the tallest temple in Bagan with gleaming white tiers reaching the sky',
    attire: 'Pure white wedding tuxedo and royal white silk acheik gown with gold necklace',
    pose: 'Formal couple portrait with Thatbyinnyu\'s massive whitewashed tiers rising behind',
    promptSnippet: 'majestic wedding portrait at the foot of Thatbyinnyu Temple in Bagan, towering whitewashed multi-tier pagoda architecture against a deep sapphire sky, couple in matching regal white attire with gold accents, perfectly centered symmetrical composition, architectural grandeur'
  },
  {
    id: 'bagan-ancient-brick-corridor-lantern',
    titleEn: 'Ancient Brick Temple Corridor Candlelight',
    titleMm: 'ရှေးဟောင်းအုတ်ဂူ အတွင်းပိုင်း ဖယောင်းတိုင်အလင်း မင်္ဂလာ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?auto=format&fit=crop&w=800&q=80',
    lighting: 'Flickering oil lamps and warm candlelight illuminating aged red brick vaulted ceilings',
    setting: 'Narrow 900-year-old vaulted brick corridor with ancient Buddhist wall mural fragments',
    attire: 'Dark emerald green and gold silk traditional Burmese wedding ensemble',
    pose: 'Couple holding a brass lantern together, glowing light illuminating their faces',
    promptSnippet: 'mystical fine art wedding portrait inside an ancient Bagan brick temple hallway, vaulted arched brickwork, soft glow of brass oil lamps casting warm flickering shadows on historical murals, couple in rich emerald green silk acheik with gold embroidery, deep atmospheric intimacy'
  },
  {
    id: 'bagan-tamarind-tree-breeze',
    titleEn: 'Centuries-Old Tamarind Tree Romance',
    titleMm: 'ရာစုနှစ်ရှေးဟောင်း မန်ကျည်းပင်ကြီးအောက် မင်္ဂလာချစ်သူ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft dappled sunlight filtering through ancient branches',
    setting: 'Massive sprawling ancient tamarind tree with twisting roots near red stupas',
    attire: 'Casual romantic linen wedding dress, light beige waistcoat',
    pose: 'Couple resting against the massive gnarled tree trunk laughing candidly',
    promptSnippet: 'romantic wedding portrait under a colossal 300-year-old tamarind tree in rural Bagan, sweeping branches framing ancient pagodas in the background, couple sharing a quiet private moment of laughter, natural soft earthy tones, documentary wedding photography'
  },
  {
    id: 'bagan-lacquerware-craft-pathein-umbrella',
    titleEn: 'Pathein Parasol & Ancient Stupa Pathway',
    titleMm: 'ပုသိမ်ထီးရောင်စုံနှင့် ပုဂံစေတီလမ်းကလေး မင်္ဂလာ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    lighting: 'Vibrant golden hour backlight through oiled cotton parasol',
    setting: 'Path of ancient red bricks bordered by blooming yellow flowering trees',
    attire: 'Handwoven yellow and ruby red silk longyi with traditional jewellery',
    pose: 'Couple sharing a single colorful traditional Pathein parasol in walking motion',
    promptSnippet: 'cultural Burmese wedding scene in Bagan, couple walking along an ancient brick path holding a bright hand-painted Pathein oiled umbrella, sunlight glowing through the translucent parasol canopy, yellow Cassia blossoms falling gently, joyful authentic romantic smiles'
  },
  {
    id: 'bagan-sunset-ayeyarwady-sandbar',
    titleEn: 'Ayeyarwady River Sandbar Sunset Walk',
    titleMm: 'ဧရာဝတီမြစ် သဲသောင်ပြင် နေဝင်ဆည်းဆာ မင်္ဂလာ',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    lighting: 'Liquid gold sunset reflections on calm river waters, pastel violet sky',
    setting: 'White sandbar in the middle of the Ayeyarwady River with Bagan hills behind',
    attire: 'Barefoot with flowing minimalist white silk gown and roll-up linen trousers',
    pose: 'Couple walking barefoot along the water\'s edge, hand in hand with reflective puddle',
    promptSnippet: 'ethereal barefoot wedding portrait on a sandbar of the Irrawaddy River in Bagan, setting sun painting the calm water surface in liquid gold and lavender, gentle ripples around their feet, couple walking hand in hand, silhouette of ancient stupas on the distant riverbank'
  },
  {
    id: 'bagan-starlit-milky-way-night',
    titleEn: 'Starlit Bagan Pagodas Under the Milky Way',
    titleMm: 'ကြယ်တာရာနှင့် ပုဂံစေတီတော်များအောက် မင်္ဂလာညချမ်း',
    category: 'Bagan Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    lighting: 'Brilliant Milky Way galaxy stars with subtle lantern backlight on couple',
    setting: 'Silent nocturnal plain of ancient brick temples beneath billions of clear stars',
    attire: 'Deep royal blue silk with silver metallic threadwork, warm shawl',
    pose: 'Couple standing together gazing up at the starry cosmos above ancient monuments',
    promptSnippet: 'astrophotography wedding portrait in Bagan at midnight, vibrant Milky Way galaxy core stretching across the crystal-clear night sky, silhouettes of ancient stupas against the stars, couple illuminated softly by a single warm lantern on the ground, magical unforgettable fine art'
  },

  // ==========================================
  // CATEGORY 4: INLE LAKE (8 Templates)
  // ==========================================
  {
    id: 'inle-traditional-boat-sunset',
    titleEn: 'Inle Lake Traditional Longtail Boat Sunset',
    titleMm: 'အင်းလေးကန် စက်လှေရှည်နှင့် နေဝင်ချိန် မင်္ဂလာ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Liquid silver and golden reflections on glass-calm lake water',
    setting: 'Carved wooden longtail boat floating gently in the center of Inle Lake',
    attire: 'Shan ethnic silk jacket with silver buttons, pastel lotus-fiber handwoven shawl',
    pose: 'Couple sitting in the decorated boat bow, groom holding bride\'s hands as boat glides',
    promptSnippet: 'romantic pre-wedding couple sitting in the wooden bow of an authentic Inle Lake longtail boat, calm mirror-like lake reflecting purple and orange sunset clouds, Shan hills in the background, couple in authentic handwoven lotus-fiber and silk Shan wedding garments, pure serenity'
  },
  {
    id: 'inle-stilted-palace-resort-deck',
    titleEn: 'Luxury Stilted Teakwood Water Villa Deck',
    titleMm: 'အင်းလေး ရေပေါ်စံအိမ်ကြီး လသာဆောင် မင်္ဂလာ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm outdoor lanterns casting golden ribbons across the water surface',
    setting: 'Spacious teakwood deck of luxury stilted water resort surrounded by floating gardens',
    attire: 'Contemporary white wedding gown with Burmese silk scarf, linen cream tuxedo',
    pose: 'Couple leaning against wooden railing with cocktail glasses overlooking the lake at dusk',
    promptSnippet: 'luxury overwater villa wedding portrait at Inle Lake, expansive teak sun deck on stilts, blooming lotus flowers floating in surrounding water, couple dressed in high-end resort wedding attire, warm candlelight on wooden tables, blue hour mountain panorama'
  },
  {
    id: 'inle-floating-garden-lotus-blooms',
    titleEn: 'Floating Tomato & Lotus Garden Serenade',
    titleMm: 'ကျွန်းမျော စိုက်ခင်းနှင့် ကြာပန်းခင်း မင်္ဂလာအလှ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?auto=format&fit=crop&w=800&q=80',
    lighting: 'Bright crisp morning mountain light with morning mist rising from water',
    setting: 'Traditional Inle floating agricultural garden lush with flowers and greenery',
    attire: 'Vibrant indigo and crimson Shan traditional wedding attire with embroidered headwraps',
    pose: 'Standing among the green floating gardens, gently touching pink lotus blossoms',
    promptSnippet: 'vibrant cultural wedding photo in Inle Lake\'s floating gardens, bride in ornate Intha-Shan handwoven traditional garments, pink lotus buds blooming in clear lake water, majestic mist-covered Shan mountains behind, crisp clean high-definition morning lighting'
  },
  {
    id: 'inle-indrein-ancient-stupa-forest',
    titleEn: 'Indein Ancient Stupa Forest Sanctuary',
    titleMm: 'အင်းတိန် ရှေးဟောင်း စေတီတန်းကြီး မင်္ဂလာ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm atmospheric sunbeams filtering through ancient brick stupa spires',
    setting: 'Hundreds of weather-worn ancient stupas of Shwe Indein Pagoda',
    attire: 'Royal amber and golden silk longyi with antique brass hairpins',
    pose: 'Couple walking slowly through the dense forest of ancient stupas arm-in-arm',
    promptSnippet: 'historic wedding walk through the mesmerizing ancient stupa complex of Indein at Inle Lake, hundreds of centuries-old brick and stucco pagodas weathered with moss and vines, warm sunlight streaming through, couple in royal Burmese amber silk, atmospheric Indiana Jones romance'
  },
  {
    id: 'inle-phaung-daw-oo-festive-ceremony',
    titleEn: 'Phaung Daw Oo Gilded Pagoda Terrace',
    titleMm: 'ဖောင်တော်ဦး စေတီတော် ရင်ပြင် မင်္ဂလာစုံတွဲ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm golden interior temple lighting with incense smoke atmosphere',
    setting: 'Gilded shrine of Phaung Daw Oo Pagoda with golden royal barge in distance',
    attire: 'Heavy gold-leaf brocade silk acheik with traditional floral headpieces',
    pose: 'Traditional ceremonial standing pose with hands gently clasped together',
    promptSnippet: 'ceremonial Buddhist wedding blessing at Phaung Daw Oo Pagoda on Inle Lake, glittering golden multi-tier roofs reflected in calm water, bride and groom in radiant traditional silk acheik, respectful joyful demeanors, rich cultural heritage photography'
  },
  {
    id: 'inle-red-mountain-vineyard-terrace',
    titleEn: 'Red Mountain Estate Vineyard Sunset',
    titleMm: 'ရက်ဒ်မောင်းတိန်း စပျစ်ခြံ နေဝင်ဆည်းဆာ မင်္ဂလာ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80',
    lighting: 'Vibrant golden hour sun dipping behind Shan mountain ranges',
    setting: 'Terraced green grape vineyards overlooking the panoramic Inle valley',
    attire: 'Romantic flowing white chiffon wedding gown with wine-red sash, tailored beige suit',
    pose: 'Couple toasting with wine glasses while looking out over the panoramic lake view',
    promptSnippet: 'romantic vineyard wedding portrait at Red Mountain Estate overlooking Inle Lake, lush green grapevines terracing down the hillside, golden sun setting over the distant lake and mountain peaks, couple holding crystal wine glasses, warm Italian-Burmese crossover aesthetic'
  },
  {
    id: 'inle-jumping-cat-teak-monastery',
    titleEn: 'Nga Phe Chaung Teakwood Hall Romance',
    titleMm: 'ငါးဖယ်ချောင်း သစ်သားကျောင်းကြီး မင်္ဂလာအမှတ်တရ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Moody soft chiaroscuro from wooden lake windows',
    setting: 'Centuries-old stilted teak monastery hall with antique Buddha statues',
    attire: 'Traditional Shan raw silk pants and jacket set with gold silk sash',
    pose: 'Couple standing quietly by the open wooden window overlooking the calm lake',
    promptSnippet: 'authentic cultural portrait inside the ancient wooden hall of Nga Phe Chaung monastery over Inle Lake, dark teakwood timber construction, soft diffused window light highlighting facial micro-textures, couple dressed in royal Shan ethnic wedding attire, tranquil peaceful mood'
  },
  {
    id: 'inle-misty-morning-bamboo-bridge',
    titleEn: 'Misty Dawn Bamboo Footbridge Crossing',
    titleMm: 'မြူခိုးဝေသော မနက်ခင်း ဝါးတံတားလေးပေါ် မင်္ဂလာ',
    category: 'Inle Lake',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Pastel blue and lavender dawn mist with soft glow on water',
    setting: 'Rustic bamboo footbridge stretching across a quiet inlet of Inle Lake',
    attire: 'Pastel lilac and cream silk acheik with delicate lace veil',
    pose: 'Groom holding bride\'s hand helping her step carefully along the wooden planks',
    promptSnippet: 'dreamy pre-wedding photo on a rustic bamboo footbridge crossing mist-covered lake water at dawn, soft lavender and powder blue atmosphere, lotus buds rising from water, couple in pastel silk traditional attire, cinematic romantic storytelling'
  },

  // ==========================================
  // CATEGORY 5: FLORAL GARDEN (8 Templates)
  // ==========================================
  {
    id: 'pyin-oo-lwin-kandawgyi-botanical',
    titleEn: 'Pyin Oo Lwin Kandawgyi Botanical Gardens',
    titleMm: 'ပြင်ဦးလွင် ကန်တော်ကြီး ဥယျာဉ် ပန်းခင်း မင်္ဂလာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft highland mountain sunlight with crisp cool-air clarity',
    setting: 'Lush manicured flowerbeds of Pyin Oo Lwin with towering pine trees and tranquil lake',
    attire: 'Romantic British-Burmese colonial vintage wedding gown, English bespoke tweed suit',
    pose: 'Couple strolling across emerald lawn surrounded by blooming hydrangeas and roses',
    promptSnippet: 'fairytale botanical garden wedding in Pyin Oo Lwin, couple walking through vibrant flower beds of blooming English roses and pastel hydrangeas, towering pine trees and colonial lake in background, cool highland mountain breeze gently lifting bride\'s veil, romantic pastel colors'
  },
  {
    id: 'glasshouse-greenhouse-orchid-conservatory',
    titleEn: 'Victorian Glasshouse Orchid Conservatory',
    titleMm: 'ဖန်နန်းတော် သစ်ခွဥယျာဉ် အမှတ်တရ မင်္ဂလာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft greenhouse diffused natural light through glass panes, lush botanical rim light',
    setting: 'Historic glass conservatory packed with exotic orchids, cascading ferns, and palms',
    attire: 'Botanical lace wedding dress with leaf embroidery, olive green tailored linen suit',
    pose: 'Couple standing embraced beneath a canopy of rare flowering tropical orchids',
    promptSnippet: 'breathtaking greenhouse wedding inside a Victorian glass conservatory, tropical orchids and monsteras cascading down glass walls, couple standing embraced in natural diffused glasshouse light, bride\'s dress featuring botanical floral lace motifs, clean modern editorial aesthetic'
  },
  {
    id: 'pastel-rose-garden-gazebo',
    titleEn: 'Pastel Rose Blossom Wedding Gazebo',
    titleMm: 'ပန်းရောင် နှင်းဆီဥယျာဉ် ပန်းမဏ္ဍပ် မင်္ဂလာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    lighting: 'Golden morning sunshine creating lens flare through rose petals',
    setting: 'White wrought-iron Victorian gazebo enveloped in blooming climbing English roses',
    attire: 'Blush pink and ivory tulle wedding gown, classic tailored grey morning suit',
    pose: 'Couple standing inside the gazebo, groom gently brushing a fallen petal from bride\'s hair',
    promptSnippet: 'romantic garden gazebo wedding, ornate white iron gazebo completely entwined with blush pink and cream climbing roses, couple in gentle intimate embrace, warm sunlight creating delicate rim glow around bride\'s hair and veil, soft natural romantic emotion'
  },
  {
    id: 'lavender-field-dusk-romance',
    titleEn: 'Lavender & Wildflower Highland Meadow',
    titleMm: 'လာဗင်ဒါ ပန်းခင်းကြီးနှင့် တောင်ပေါ် မင်္ဂလာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dreamy purple and orange twilight sky, soft sunset backlighting',
    setting: 'Endless rolling rows of purple blooming lavender in the Shan highlands',
    attire: 'Bohemian off-shoulder lace wedding gown, matching cream suspenders and trousers',
    pose: 'Couple running hand-in-hand between lavender rows, looking back laughing joyfully',
    promptSnippet: 'cinematic wedding pre-wedding portrait in a sprawling lavender field in the Shan hills, vibrant purple rows converging toward a fiery golden sunset, bride holding her dress hem laughing joyfully while holding groom\'s hand, warm purple-gold color harmony'
  },
  {
    id: 'colonial-heritage-veranda-tea-garden',
    titleEn: 'Colonial Heritage Mansion Tea Garden',
    titleMm: 'ကိုလိုနီ ရှေးဟောင်းအိမ်ကြီး ဥယျာဉ် မင်္ဂလာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm afternoon shade under broad verandas with bright garden sunshine in distance',
    setting: 'White timber-framed colonial heritage estate in Maymyo with expansive lawn',
    attire: 'Vintage 1920s inspired lace bridal dress, double-breasted navy blazer with brass buttons',
    pose: 'Sitting together on white wicker chairs on the garden veranda sharing a cup of tea',
    promptSnippet: 'vintage colonial heritage wedding in Pyin Oo Lwin, white-painted teak mansion veranda with wicker furniture, green lawn and flowerbeds in background, couple in refined 1920s colonial-Burmese fusion formal wear, timeless nostalgic elegance'
  },
  {
    id: 'frangipani-white-blossom-canopy',
    titleEn: 'Frangipani White Blossom Garden Walk',
    titleMm: 'တရုတ်စကားပန်းခင်း လမ်းကလေး မင်္ဂလာစုံတွဲ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?auto=format&fit=crop&w=800&q=80',
    lighting: 'Gentle tropical daylight with fallen white flower blossoms on green grass',
    setting: 'Avenue of blooming white and yellow frangipani (Plumeria) trees in full blossom',
    attire: 'Traditional Burmese pure white silk acheik with fresh frangipani flower crown',
    pose: 'Couple standing close beneath arching branches with fragrant flowers falling softly',
    promptSnippet: 'tropical Burmese garden wedding under flowering white frangipani trees, delicate yellow and white blossoms carpeting the lush green grass, bride wearing fragrant fresh plumeria in her traditional hair bun, pure white silk attire, soft innocent romance'
  },
  {
    id: 'sunflower-field-joyful-kiss',
    titleEn: 'Golden Sunflower Field Celebration',
    titleMm: 'နေကြာပန်းခင်းကြီးထဲက မင်္ဂလာရင်ခုန်သံ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80',
    lighting: 'Bright radiant blue sky and golden sunshine making yellow petals glow',
    setting: 'Expansive field of towering bright yellow sunflowers in rural Myanmar',
    attire: 'Modern minimalist white slip wedding gown, casual white linen shirt and vest',
    pose: 'Groom kissing bride\'s forehead surrounded by sea of blooming sunflowers',
    promptSnippet: 'joyful bright wedding portrait in a vibrant sunflower field, towering golden sunflowers facing the summer sun, couple standing in the center sharing a tender forehead kiss, rich contrasting blue sky, authentic warmth and boundless happiness'
  },
  {
    id: 'fairy-lit-secret-garden-night',
    titleEn: 'Fairy-Lit Night Garden Sanctuary',
    titleMm: 'မီးရောင်စုံ ညဥယျာဉ် လျှို့ဝှက် မင်္ဂလာဆုံဆည်းရာ',
    category: 'Floral Garden',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Thousands of warm twinkling fairy lights strung throughout old garden trees',
    setting: 'Nighttime botanical garden transformed into a starlit wonderland with paper lanterns',
    attire: 'Shimmering sequin bridal gown, midnight black tuxedo with velvet lapel',
    pose: 'Couple dancing slowly in the enchanted night garden, illuminated solely by warm fairy lights',
    promptSnippet: 'enchanted night garden wedding, giant ancient trees wrapped in thousands of golden twinkling fairy lights, couple slow dancing in the dark garden clearing, magical golden bokeh circles enveloping them, bride\'s gown shimmering like diamond dust'
  },

  // ==========================================
  // CATEGORY 6: BEACH SUNSET (8 Templates)
  // ==========================================
  {
    id: 'ngapali-beach-golden-sunset-surf',
    titleEn: 'Ngapali Beach Romantic Sunset Surf',
    titleMm: 'ငပလီ ကမ်းခြေ ညနေဆည်းဆာ လှိုင်းသံ မင်္ဂလာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dazzling sunset reflecting across wet sand like a mirror, fiery orange horizon',
    setting: 'Pristine white sand beach of Ngapali with coconut palms and gentle rolling waves',
    attire: 'Lightweight flowing chiffon beach wedding dress, cream linen suit with rolled cuffs',
    pose: 'Barefoot couple holding hands walking along the water\'s edge with waves washing past feet',
    promptSnippet: 'stunning beach wedding pre-wedding photo at Ngapali Beach at sunset, calm turquoise waves breaking with soft white foam, fiery orange and pink sunset reflecting on wet sand, couple walking barefoot hand-in-hand, bride\'s lightweight chiffon dress caught in the sea breeze'
  },
  {
    id: 'ngwesaung-lovers-island-rock-vista',
    titleEn: 'Ngwe Saung Lovers\' Island Rocky Vista',
    titleMm: 'ငွေဆောင် ချစ်သူများကျွန်း ကျောက်ဆောင် မင်္ဂလာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=800&q=80',
    lighting: 'Dramatic coastal sunset light with crashing sea spray catching golden rays',
    setting: 'Natural rocky outcrop of Lovers\' Island connected by tidal sandbar at Ngwe Saung',
    attire: 'Dramatic long veil catching coastal winds, tailored navy beach suit',
    pose: 'Couple standing atop the ocean rocks, veil billowing high against the ocean horizon',
    promptSnippet: 'epic coastal wedding portrait on the rocky promontory of Lovers\' Island in Ngwe Saung, ocean waves crashing against dark rocks creating misty sea spray, bride\'s long veil flying dramatically in the sea wind, couple in loving embrace, wide dramatic cinema composition'
  },
  {
    id: 'chaungtha-palm-fringe-coconut-grove',
    titleEn: 'Tropical Coconut Palm Grove Sanctuary',
    titleMm: 'ချောင်းသာ အုန်းတောတန်းလေးထဲက မင်္ဂလာအလှ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    lighting: 'Late afternoon tropical sun filtering through leaning coconut fronds',
    setting: 'Secluded grove of leaning coconut palm trees right beside the sandy beach',
    attire: 'Boho crochet lace beach dress, white linen button-down shirt',
    pose: 'Couple leaning playfully against a curved palm tree trunk sharing a laugh',
    promptSnippet: 'relaxed tropical beach wedding session, curving coconut palm trees forming a natural canopy over golden sand, warm dappled sunlight, couple in casual beach wedding attire sharing a candid joyful moment, authentic tropical island romance'
  },
  {
    id: 'mergui-archipelago-crystal-lagoon',
    titleEn: 'Mergui Archipelago Emerald Lagoon Yacht',
    titleMm: 'မြိတ်ကျွန်းစု ကြည်လင်သော ရေပြာနှင့် ရွက်လှေ မင်္ဂလာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    lighting: 'Crystal clear midday tropical sun illuminating vibrant coral lagoon beneath boat',
    setting: 'Luxury sailing catamaran anchored in an untouched turquoise bay of Mergui',
    attire: 'High-fashion modern bridal swimwear-inspired silk dress, tailored resort jacket',
    pose: 'Couple standing at the yacht bow looking out across virgin emerald islands',
    promptSnippet: 'ultra-luxury yacht wedding in the untouched Mergui Archipelago, pristine turquoise water so clear the coral reefs are visible below, white sailing catamaran anchored near deserted white sand islands, couple standing at the teak deck bow, high fashion editorial travel'
  },
  {
    id: 'beach-bonfire-twilight-toast',
    titleEn: 'Beachside Bonfire & String Lights Twilight',
    titleMm: 'ကမ်းခြေ မီးပုံပွဲနှင့် ညနေခင်း မင်္ဂလာဝိုင်ခွက်',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm flickering orange firelight combined with deep blue twilight ocean tones',
    setting: 'Cozy beach setup with wooden driftwood fire, woven rugs, and bamboo torches',
    attire: 'Cozy beach bridal wrap with bohemian lace gown, unbuttoned collar linen shirt',
    pose: 'Couple seated close on a beach rug by the fire, toasting with wine glasses',
    promptSnippet: 'intimate twilight beach wedding campfire, crackling driftwood fire casting warm golden light on couple seated on cozy woven blankets, bamboo tiki torches along the tide line, calm dark ocean waves lapping gently, romantic rustic evening'
  },
  {
    id: 'driftwood-archway-ocean-breeze',
    titleEn: 'Natural Driftwood Floral Ocean Arch',
    titleMm: 'သဘာဝ သစ်မျောပန်းခုံးနှင့် ပင်လယ်လေပြည် မင်္ဂလာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft golden hour sidelight highlighting textures of weathered wood and petals',
    setting: 'Arched wedding altar crafted from weathered ocean driftwood and wild protea flowers',
    attire: 'Flowing beach gown with thigh-slit and open back, light beige tailored beach suit',
    pose: 'Couple standing under the driftwood arch exchanging vows with ocean behind them',
    promptSnippet: 'bohemian beach wedding altar made of sculptural sun-bleached driftwood, decorated with blush roses, pampas grass, and eucalyptus, couple exchanging vows with the vast open ocean horizon behind them, soft golden hour glow, authentic emotional tears of joy'
  },
  {
    id: 'beach-horseback-sunset-gallop',
    titleEn: 'White Horseback Beach Sunset Ride',
    titleMm: 'မြင်းဖြူလေးနှင့် ကမ်းခြေ နေဝင်ဆည်းဆာ မင်္ဂလာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Bright sun starburst dropping into the ocean, casting long silhouettes',
    setting: 'Expansive wide tidal flat at low tide with majestic white horse',
    attire: 'Long flowing white train draped gracefully over the horse\'s saddle, formal tuxedo',
    pose: 'Bride sitting gracefully on the white horse while groom holds the reins walking beside',
    promptSnippet: 'fairytale equestrian beach wedding, bride riding a magnificent white horse decorated with flowers along the wet surf, groom walking beside leading the horse, dramatic sun setting into the ocean horizon, mirror reflections in the wet sand, timeless majesty'
  },
  {
    id: 'candlelit-sand-dune-dinner',
    titleEn: 'Candlelit Sand Dune Private Dining',
    titleMm: 'သဲသောင်ကုန်းပေါ်က ဖယောင်းတိုင်အလင်း မင်္ဂလာညစာ',
    category: 'Beach Sunset',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Tens of glass storm lanterns buried softly in the sand, twinkling night sky',
    setting: 'Low wooden dining table dug into sand dune surrounded by plush cushions',
    attire: 'Modern satin slip wedding dress, dark navy linen trousers and shirt',
    pose: 'Couple laughing together over private dinner with the sound of the ocean below',
    promptSnippet: 'private luxury beach dining experience on a secluded sand dune, low table surrounded by bohemian pillows, dozens of glass hurricane lanterns glowing in the sand, starry night sky above, couple dining intimately by candlelight, bespoke destination wedding'
  },

  // ==========================================
  // CATEGORY 7: STUDIO EDITORIAL (8 Templates)
  // ==========================================
  {
    id: 'vogue-editorial-rembrandt-lighting',
    titleEn: 'Vogue Editorial Masterpiece (Rembrandt Lighting)',
    titleMm: 'ဗုတ်ဂ် မဂ္ဂဇင်းကာဗာ အဆင့် ရမ်ဘရန့်အလင်း စတူဒီယို',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    lighting: 'Masterclass Rembrandt lighting with single large octabox and subtle silver reflector',
    setting: 'Textured charcoal hand-painted canvas studio backdrop with minimalist stool',
    attire: 'Haute couture structured silk wedding gown, bespoke British tuxedo with silk lapel',
    pose: 'High-fashion editorial pose, subtle confident gaze, micro-expressions of quiet power',
    promptSnippet: 'haute couture Vogue cover editorial wedding portrait, dark textured slate-grey hand-painted canvas backdrop, dramatic Rembrandt key light creating classic light triangle on cheek, bride in architectural structured silk wedding dress, groom in bespoke Savile Row black tuxedo, flawless skin pores and micro-textures'
  },
  {
    id: 'monochrome-fine-art-black-and-white',
    titleEn: 'Timeless Monochrome Fine-Art Silver Gelatin',
    titleMm: 'အနက်နှင့်အဖြူ တန်ဖိုးကြီး အနုပညာ စတူဒီယို ဓာတ်ပုံ',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'High-contrast directional studio Fresnel spotlight with deep sculpted shadows',
    setting: 'Pure minimalist studio setting emphasizing pure form, emotion, and fabric texture',
    attire: 'Sculptural matte white crepe wedding gown, classic black tuxedo',
    pose: 'Intimate close-up profile embrace, faces touching gently, eyes closed in peace',
    promptSnippet: 'masterful black and white fine art wedding portrait, silver gelatin darkroom tonality, deep rich blacks and luminous highlights, intimate close-up of bride and groom with foreheads touching, dramatic sculptural shadows across facial features, Peter Lindbergh photographic style'
  },
  {
    id: 'warm-analog-kodak-portra-vintage-studio',
    titleEn: 'Warm Analog Kodak Portra 400 Studio',
    titleMm: 'ကိုဒတ် ဖလင်စတိုင် နွေးထွေးသော စတူဒီယို အမှတ်တရ',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    lighting: 'Warm continuous tungsten modeling lamps creating soft nostalgic amber tones',
    setting: 'Warm terracotta painted studio wall with antique bentwood Thonet chairs',
    attire: '1970s vintage-inspired silk wedding dress with bishop sleeves, retro tailored suit',
    pose: 'Relaxed seated pose, laughing candidly at an inside joke',
    promptSnippet: 'nostalgic vintage studio wedding photograph, warm Kodak Portra 400 color science with natural film grain, couple laughing candidly on bentwood chairs against a warm terracotta background, bride in retro silk dress with pearl buttons, authentic unposed joyful chemistry'
  },
  {
    id: 'high-key-minimalist-pure-white',
    titleEn: 'High-Key Minimalist Contemporary White',
    titleMm: 'ခေတ်ပေါ် အဖြူရောင် သန့်စင်သော စတူဒီယို မင်္ဂလာ',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    lighting: 'Flawless shadowless high-key white cyclorama wall with large diffused softboxes',
    setting: 'Seamless infinity white cyclorama studio with zero background distractions',
    attire: 'Ultra-modern minimalist silk column dress with clean lines, crisp white tuxedo jacket',
    pose: 'Modern fashion forward standing pose, clean graphic silhouettes',
    promptSnippet: 'modern high-key studio wedding fashion portrait, seamless pure white cyclorama background, shadowless luminous studio softbox lighting, couple in ultra-clean contemporary bridal silhouettes, bride in sleek silk crepe column gown, groom in white dinner jacket with black trousers, crisp sharpness'
  },
  {
    id: 'cinematic-cinestill-neon-night-editorial',
    titleEn: 'CineStill 800T Neon & Halation Night Studio',
    titleMm: 'ရုပ်ရှင်ဆန်သော နီယွန်အလင်းနှင့် ဆိုင်းနီးစတီးလ် စတူဒီယို',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    lighting: 'Cool cyan ambient rim light paired with warm red tungsten halogen halation',
    setting: 'Dark studio with subtle atmospheric haze and artistic neon edge bars',
    attire: 'Modern avant-garde black and white bridal ensemble, tailored charcoal suit',
    pose: 'Cinematic Wong Kar-wai inspired mood, intense connection and lingering glances',
    promptSnippet: 'cinematic moody wedding editorial in the style of Wong Kar-wai, CineStill 800T film look with signature red halation around specular highlights, soft cyan and amber rim lights cutting through delicate atmospheric studio haze, couple in passionate intimate proximity'
  },
  {
    id: 'dramatic-wind-machine-cathedral-veil',
    titleEn: 'Cathedral Veil Wind-Machine Motion Masterpiece',
    titleMm: 'ဇာပဝါရှည်ကြီး လေတိုက်ခတ်မှု စတူဒီယို အနုပညာ ရိုက်ချက်',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?auto=format&fit=crop&w=800&q=80',
    lighting: 'High-speed studio strobes freezing translucent lace veil movement in midair',
    setting: 'Deep midnight blue textured studio background',
    attire: 'Intricate lace wedding gown with 4-meter cathedral veil billowed by gentle wind',
    pose: 'Groom holding bride close while her sheer cathedral veil floats weightlessly around them',
    promptSnippet: 'high-speed studio strobe wedding portrait, 4-meter translucent cathedral lace veil captured in mid-air weightless suspension floating around the couple, bride and groom in romantic embrace, deep midnight blue background, tack-sharp lace embroidery detail frozen in motion'
  },
  {
    id: 'flower-cloud-floating-installation',
    titleEn: 'Sculptural Flower Cloud Floral Installation',
    titleMm: 'ပန်းမိုးတိမ် တွဲလောင်းဆွဲ စတူဒီယို အနုပညာ အလှ',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    lighting: 'Soft directional beauty lighting highlighting individual petals and textures',
    setting: 'Suspended organic sculptural floral cloud of baby\'s breath, roses, and pampas grass',
    attire: 'Contemporary layered tulle bridal dress, matte charcoal tailored suit',
    pose: 'Couple standing partially enveloped within the floating cloud of dried and fresh blossoms',
    promptSnippet: 'contemporary fine art wedding editorial with an immense suspended floral cloud installation of white gypsophila and pale blush roses floating above and around the couple, soft sculptural lighting, bride in romantic layered tulle, museum-quality artistic composition'
  },
  {
    id: 'antique-gilded-mirror-reflection',
    titleEn: 'Antique Gilded Baroque Mirror Reflection',
    titleMm: 'ရှေးဟောင်း ရွှေရောင်မှန်ကြီးထဲက မင်္ဂလာရိပ်',
    category: 'Studio Editorial',
    previewUrl: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=800&q=80',
    lighting: 'Moody candle glow and soft warm spot on mirror surface',
    setting: 'Large ornate French baroque standing floor mirror resting against dark velvet walls',
    attire: 'Vintage bridal gown with low open back and pearl necklace, classic dark tuxedo',
    pose: 'Photograph framed through the gilded mirror reflection showing the groom adjusting bride\'s necklace',
    promptSnippet: 'intimate editorial studio portrait framed entirely through the ornate reflection of a full-length French baroque gilded mirror, groom behind bride tenderly clasping an heirloom pearl necklace around her neck, subtle vintage glass imperfections and patina, storytelling depth'
  }
];
