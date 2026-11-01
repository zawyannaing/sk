export interface HairTemplate {
  id: string;
  titleEn: string;
  titleMm: string;
  category: 'Royal & Traditional' | 'Korean Soft Waves' | 'Sleek & Straight' | 'Short Bobs & Pixies' | 'Elegant Updos' | 'Men Hairstyles';
  gender: 'female' | 'male' | 'unisex';
  length: 'Short' | 'Medium' | 'Long' | 'Updo';
  texture: 'Straight' | 'Wavy' | 'Curly' | 'Coiffured';
  previewUrl?: string;
  hairDescriptionEn: string;
  hairDescriptionMm: string;
  hairPromptSnippet: string;
  colorTints: string[];
}

export const HAIR_CATEGORIES = [
  'All',
  'Royal & Traditional',
  'Korean Soft Waves',
  'Sleek & Straight',
  'Short Bobs & Pixies',
  'Elegant Updos',
  'Men Hairstyles'
] as const;

export const HAIR_TEMPLATES: HairTemplate[] = [
  // ==========================================
  // 1. ROYAL & TRADITIONAL BURMESE (6 TEMPLATES)
  // ==========================================
  {
    id: 'mandalay-royal-sadon-jasmine',
    titleEn: 'Mandalay Royal Sadon with Fresh Jasmine',
    titleMm: 'မန္တလေးနန်းတွင်း စံပယ်တင် ဆံထုံးတော်',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Updo',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Traditional high architectural cylindrical Sadon hair bun encircled by fresh blooming white jasmine garland',
    hairDescriptionMm: 'မန္တလေးနန်းတွင်း ရိုးရာ အမြင့် ဆံထုံးတော် ပတ်လည်တွင် မွှေးကြိုင်သော စံပယ်ဖြူ ပန်းကုံးရစ်ပတ်ဆင်ယင်မှု',
    hairPromptSnippet: 'masterfully coiffured traditional Mandalay royal Sadon hair bun, soaring cylindrical architectural crown updo, enveloped by fresh fragrant white blooming jasmine floral garland (စံပယ်ပန်းကုံး), natural delicate baby hair tendrils along the forehead and sideburns, glossy deep obsidian black sheen, authentic Burmese royal court coiffure aesthetics, zero alteration to original facial bone structure',
    colorTints: ['Natural Obsidian Black', 'Deep Jet Black', 'Subtle Dark Charcoal']
  },
  {
    id: 'konbaung-court-sadon-gold-pins',
    titleEn: 'Konbaung Court Sadon with Gold Floral Hairpins',
    titleMm: 'ကုန်းဘောင်ခေတ် ရွှေဆံထိုးဆင် နန်းတွင်းဆံထုံး',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Updo',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Konbaung era ornate royal court Sadon coiffure decorated with 24k gold filigree floral hairpins and ruby studs',
    hairDescriptionMm: 'ကုန်းဘောင်ခေတ် တော်ဝင်နန်းတွင်း ဆံထုံးပေါ်တွင် ၂၄ ကာရက် ရွှေပန်းထိမ် ဆံထိုးနှင့် ပတ္တမြား စီခြယ်ထားသော ဆံကေသာ',
    hairPromptSnippet: 'Late Konbaung dynasty authentic royal court Sadon updo, tightly wrapped high hair cylinder accented with handcrafted 24k gold filigree floral hairpin ornaments, delicate gold hair comb, fragrant star jasmine garland, natural soft vellus hairline integration, rich natural black hair texture, biological face preserved 100%',
    colorTints: ['Natural Obsidian Black', 'Deep Espresso Black']
  },
  {
    id: 'burmese-side-plait-thanaka',
    titleEn: 'Traditional Long Side-Swept Plait with Thanaka',
    titleMm: 'ရိုးရာ ပါးကွက်ကြား ကျစ်ဆံမြီးရှည် လျှောချစတိုင်',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Long',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Graceful thick single plait draped over the shoulder, tied with silk ribbon and fresh jasmine bud',
    hairDescriptionMm: 'ပခုံးထက်သို့ ကျက်သရေရှိစွာ လျှောကျနေသော ကျစ်ဆံမြီးရှည်ကြီး အဖျားတွင် ပိုးကြိုးနှင့် စံပယ်ငုံ ချည်နှောင်ထားမှု',
    hairPromptSnippet: 'long lustrous Burmese traditional thick single plait braid draped gently over the left shoulder, intricately hand-woven four-strand braid with organic texture, tied with a thin silk ribbon and single fresh white jasmine bud at the tip, soft natural flyaways framing the temples, silky natural black hair, exact facial likeness preserved 100%',
    colorTints: ['Natural Black', 'Soft Dark Brown']
  },
  {
    id: 'inwa-braided-halo-updo',
    titleEn: 'Inwa Era Braided Halo Crown Coiffure',
    titleMm: 'အင်းဝခေတ် ကျစ်ဆံမြီး သရဖူရစ်ပတ် ဆံထုံး',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Updo',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Antique Inwa dynasty braided halo encircling a smooth polished center bun with antique gold combs',
    hairDescriptionMm: 'အင်းဝခေတ် ရှေးဟောင်း သရဖူသဏ္ဌာန် ကျစ်ဆံမြီး ရစ်ခွေထားသော ဆံထုံးတော်',
    hairPromptSnippet: 'historical Inwa royal era braided halo crown hair updo, interlocking thick braided braids wrapped seamlessly around the perimeter of a polished smooth crown bun, accented with miniature antique golden comb and fresh jasmine blooms, immaculate natural scalp transition, rich black silky hair, identical facial features maintained',
    colorTints: ['Natural Obsidian Black', 'Dark Chestnut']
  },
  {
    id: 'bagan-period-topknot-chignon',
    titleEn: 'Bagan Dynasty High Chignon with Pearl Strings',
    titleMm: 'ပုဂံခေတ် ပုလဲကြိုးစီ ထိပ်သီးဆံထုံးတော်',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Updo',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: '11th century Bagan temple fresco-inspired high topknot chignon draped with delicate natural freshwater pearl strands',
    hairDescriptionMm: '၁၁ ရာစု ပုဂံခေတ် နံရံဆေးရေးပန်းချီစတိုင် ထိပ်သီးဆံထုံး ပတ်လည်တွင် သဘာဝပုလဲကြိုးများ သီကုံးထားမှု',
    hairPromptSnippet: '11th-century Bagan classical temple fresco inspired high topknot chignon hair coiffure, structured vertical teardrop bun adorned with cascading miniature genuine freshwater pearl strands and fine gold wire, natural delicate baby hairs at the hairline, deep midnight black glossy hair, strictly unchanged biological face',
    colorTints: ['Midnight Black', 'Jet Black']
  },
  {
    id: 'colonial-rangoon-finger-wave-bun',
    titleEn: '1920s Colonial Rangoon Vintage Finger Wave Bun',
    titleMm: 'ကိုလိုနီခေတ် ရန်ကုန် လှိုင်းတွန့်ကပ် ဆံထုံးဆန်း',
    category: 'Royal & Traditional',
    gender: 'female',
    length: 'Updo',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Vintage 1920s Yangon high-society S-shaped sculpted finger waves leading into an elegant low nape chignon',
    hairDescriptionMm: '၁၉၂၀ ပြည့်လွန်နှစ်များ ကိုလိုနီခေတ် ရန်ကုန်သူဌေးတန်းစား စတိုင် မျက်နှာကပ် လှိုင်းတွန့်နှင့် လည်ဂုတ်ဆံထုံး',
    hairPromptSnippet: '1920s vintage colonial Yangon high-society hairstyle, sculpted high-gloss S-curve finger waves plastered softly against the temples and hairline, sweeping backward into a refined low rolled nape chignon, glossy retro pomade sheen, vintage luxury Burmese socialite aesthetic, exact facial identity 100% untouched',
    colorTints: ['Glossy Jet Black', 'Dark Mocha']
  },

  // ==========================================
  // 2. KOREAN SOFT WAVES & MODERN ASIAN (6 TEMPLATES)
  // ==========================================
  {
    id: 'korean-soft-curtain-bangs-s-waves',
    titleEn: 'Korean Airy Curtain Bangs & Soft S-Waves',
    titleMm: 'ကိုရီးယား ကန့်လန့်ကာဘန်းနှင့် အိစက်လှိုင်းတွန့် ကေ',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Long',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Feather-light face-framing curtain bangs with cascading soft loose S-shaped barrel curls',
    hairDescriptionMm: 'ပါးပြင်ဘေးသို့ နူးညံ့စွာ ဝဲကျနေသော ဘန်းစတိုင်နှင့် ပခုံးထက်သို့ အိစက်စွာ ကျဆင်းနေသော S-Curve လှိုင်းတွန့်များ',
    hairPromptSnippet: 'modern Korean salon soft aesthetic hairstyle, airy translucent curtain bangs softly contouring the cheekbones, flowing long cascading soft S-curve barrel waves with natural bouncy movement, silky smooth individual hair strand separation, luminous healthy glossy sheen, seamless scalp hairline transition, preserving 100% biological face and eyes',
    colorTints: ['Natural Dark Brown', 'Espresso Black', 'Warm Chestnut', 'Ash Brown']
  },
  {
    id: 'hollywood-glam-cascading-waves',
    titleEn: 'Red Carpet Hollywood Cascading Gloss Waves',
    titleMm: 'ရုပ်ရှင်ပွဲတော် စတိုင် ဟောလိဝုဒ် လှိုင်းကြီးကောက်',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Long',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Sculpted deep glamorous studio waves with extreme glass-hair mirror finish swept over one side',
    hairDescriptionMm: 'တစ်ဖက်သို့ လျှောချထားသော ဖန်သားကဲ့သို့ တောက်ပသည့် ဟောလိဝုဒ် စတူဒီယို လှိုင်းကြီးကောက်စတိုင်',
    hairPromptSnippet: 'high-end commercial studio red carpet cascading Hollywood waves hairstyle, deeply defined uniform sculptural rippling waves swept dramatically over the right shoulder, extreme glass-like reflective mirror shine, voluminous root lift at crown, perfectly detailed individual strands, biological face, eyes, and bone structure 100% unchanged',
    colorTints: ['Dark Chocolate', 'Jet Black', 'Caramel Balayage']
  },
  {
    id: 'mermaid-water-ripple-curls',
    titleEn: 'Effortless Mermaid Water Ripple Waves',
    titleMm: 'ရေလှိုင်းသဏ္ဌာန် သဘာဝ လှိုင်းတွန့်ရှည်',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Long',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Relaxed beachy water ripple texture with soft blunt ends and natural separation',
    hairDescriptionMm: 'သဘာဝကျကျ အလွှာလိုက် လှိုင်းတွန့်နုလေးများဖြင့် ပေါ့ပေါ့ပါးပါး စတိုင်',
    hairPromptSnippet: 'long effortless mermaid water ripple waves hairstyle, textured relaxed crimp-style water waves falling past chest level, matte-satin finish with natural tactile strand definition, subtle center part with soft face-framing pieces, 100% authentic facial features and skin micro-pores preserved',
    colorTints: ['Natural Black', 'Mochaccino', 'Honey Amber']
  },
  {
    id: 'korean-c-curl-medium-length',
    titleEn: 'Korean C-Curl Bouncy Medium Length',
    titleMm: 'ကိုရီးယား C-Curl ပခုံးဝဲ လှိုင်းကောက်စတိုင်',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Medium',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Collarbone-grazing medium layers with inwards C-curl volume and see-through bangs',
    hairDescriptionMm: 'ညှပ်ရိုးဝန်းကျင် အရှည်ဖြင့် အတွင်းဘက်သို့ ကွေးဝင်နေသော C-Curl စတိုင်နှင့် နဖူးဖုံးဆံစနု',
    hairPromptSnippet: 'Korean salon signature collarbone-length medium layered haircut with voluminous bouncy inward C-curls hugging the jawline, delicate translucent wispy see-through bangs, light and airy weightless texture, glossy healthy cuticle shine, original facial anatomy preserved 100%',
    colorTints: ['Dark Ash Brown', 'Natural Black', 'Milk Tea Brown']
  },
  {
    id: 'butterfly-layered-blowout',
    titleEn: 'Voluminous Butterfly Layered 90s Blowout',
    titleMm: 'အလွှာလိုက် လိပ်ပြာပုံစံ ၉၀ ခုနှစ်များ လေဝင်ဆံကေသာ',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Long',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Dynamic multi-tier butterfly layers blown out with dramatic airy volume and flipped ends',
    hairDescriptionMm: 'အထပ်ထပ် အလွှာလိုက် ညှပ်ထားပြီး အပြင်ဘက်သို့ လှန်ကောက်ထားသော လိပ်ပြာစတိုင် လေဝင်ဆံကေသာ',
    hairPromptSnippet: 'ultra-voluminous 90s supermodel butterfly layered blowout hairstyle, multi-tiered face-framing wings flicking outward with dramatic movement, bouncy round-brush blow-dry styling, airy root lift, radiant satin sheen, identical face, nose, and lips preserved 100%',
    colorTints: ['Espresso Black', 'Cinnamon Brown', 'Rich Hazelnut']
  },
  {
    id: 'textured-beachy-shag-waves',
    titleEn: 'Modern Textured Wolf Cut Shag Waves',
    titleMm: 'ခေတ်ဆန် ဝံပုလွေပုံစံ အလွှာလိုက် ရှက်ဂ် လှိုင်းတွန့်',
    category: 'Korean Soft Waves',
    gender: 'female',
    length: 'Medium',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Edgy modern wolf cut with disconnected choppy layers and soft tousled waves',
    hairDescriptionMm: 'အဆင့်ဆင့် အပြတ်ညှပ်ထားသော ခေတ်ဆန် ဝံပုလွေကေ အလွှာလိုက် လှိုင်းတွန့်ပုံစံ',
    hairPromptSnippet: 'edgy contemporary wolf cut shag hairstyle, choppy layered crown volume tapering into soft feathered textured waves around the neck and shoulders, piecey curtain bangs, effortless rock-and-roll texture, realistic individual hair strands, subject true facial identity preserved',
    colorTints: ['Midnight Black', 'Dark Charcoal Brown', 'Cool Ash']
  },

  // ==========================================
  // 3. SLEEK & STRAIGHT (5 TEMPLATES)
  // ==========================================
  {
    id: 'glass-hair-ultra-sleek-straight',
    titleEn: 'Liquid Glass Mirror-Finish Long Straight',
    titleMm: 'မှန်သားပမာ တောက်ပဖြောင့်စင်းသော ပိုးသားဆံရှည်',
    category: 'Sleek & Straight',
    gender: 'female',
    length: 'Long',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Pin-straight waist-length silk hair with ultra-reflective liquid glass shine and crisp blunt hemline',
    hairDescriptionMm: 'ခါးဆစ်အထိ ရှည်လျားပြီး မှန်သားကဲ့သို့ ပြောင်လက်တောက်ပသော ဖြောင့်စင်း ပိုးသားဆံရှည်ကြီး',
    hairPromptSnippet: 'ultra-sleek liquid glass mirror-finish long straight hair, cascading down past waist level in a perfectly uniform curtain of silk, razor-sharp clean blunt hemline, mirror-grade specular reflective sheen, clean middle part, zero frizz or flyaways, individual silky strands, biological facial likeness preserved 100%',
    colorTints: ['Obsidian Jet Black', 'Deep Blue Black', 'Dark Espresso']
  },
  {
    id: 'center-part-layered-face-framing',
    titleEn: 'Classic Center-Part with Feathered Face Layers',
    titleMm: 'အလယ်ခွဲ မျက်နှာဘေး အလွှာလိုက် ဖြောင့်စင်းကေ',
    category: 'Sleek & Straight',
    gender: 'female',
    length: 'Long',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Long straight hair with subtle graduated face-framing angles curving gently around jawline',
    hairDescriptionMm: 'မေးရိုးအလှကို ပေါ်လွင်စေသော အလွှာလိုက် ဖြောင့်စင်း ပိုးသားဆံပင်ရှည်',
    hairPromptSnippet: 'long natural straight silk hair with precise center part, subtle graduated face-framing layers beginning at chin level, silky smooth natural flow over shoulders, organic scalp parting line, natural hair shine, 100% facial structure, eyes, and lips maintained without alteration',
    colorTints: ['Natural Black', 'Dark Chestnut Brown']
  },
  {
    id: 'sleek-high-ponytail-snatched',
    titleEn: 'High Fashion Snatched Sleek Ponytail',
    titleMm: 'ဖက်ရှင်စတိုင် မြင့်မြင့်စီးထားသော မြင်းမြီးဆံပင်စတိုင်',
    category: 'Sleek & Straight',
    gender: 'female',
    length: 'Long',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Ultra-tight scraped-back high crown ponytail wrapped with hair strand, long straight swinging tail',
    hairDescriptionMm: 'ခေါင်းထိပ်တွင် တင်းတင်းစီးထားပြီး ပခုံးထက်သို့ ဖြောင့်စင်းစွာ ကျဆင်းနေသော မြင်းမြီးဆံကေသာ',
    hairPromptSnippet: 'high-fashion snatched sleek high ponytail hairstyle, scraped back tight and smooth to the high crown with clean aerodynamic polish, wrapped hair band covering the elastic, pin-straight long tail falling straight down the back with razor-cut tip, pristine scalp hairline, 100% identical facial features',
    colorTints: ['Jet Black', 'Espresso Dark Brown']
  },
  {
    id: 'half-up-half-down-sleek-barrette',
    titleEn: 'Sleek Half-Up Half-Down with Gold Barrette',
    titleMm: 'ထက်ခြမ်းတင် စတိုင် ရွှေညှပ်ကလစ် ဆင်ယင်မှု',
    category: 'Sleek & Straight',
    gender: 'female',
    length: 'Long',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Polished top half pinned neatly at crown with minimalist gold barrette, bottom half flowing straight',
    hairDescriptionMm: 'ထိပ်ပိုင်းဆံပင်ကို ရွှေရောင်ကလစ်ဖြင့် သေသပ်စွာ ညှပ်တင်ထားပြီး အောက်ပိုင်း ဖြောင့်စင်းစွာ ဖြန့်ချထားသော စတိုင်',
    hairPromptSnippet: 'elegant minimalist half-up half-down sleek hairstyle, top section pulled back smoothly and secured with an understated polished gold geometric barrette, bottom length draping straight and silky over back, clean temples with subtle soft baby hairs, zero alteration to facial geometry',
    colorTints: ['Natural Black', 'Dark Mocha Brown']
  },
  {
    id: 'straight-blunt-bangs-hime-cut',
    titleEn: 'Modern Asian Hime Cut with Blunt Bangs',
    titleMm: 'ခေတ်မီ အာရှ ဟီမဲ စတိုင် ပါးဘေးအလွှာနှင့် နဖူးဖုံးဆံပင်',
    category: 'Sleek & Straight',
    gender: 'female',
    length: 'Long',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Striking straight hime cut with thick eyebrow-grazing blunt bangs and distinct cheek-length sidelocks',
    hairDescriptionMm: 'မျက်ခုံးထိ ညီညာသော နဖူးဖုံးနှင့် ပါးပြင်တစ်လျှောက် ညီညာဖြတ်ထားသော ပါးဘေးဆံစတိုင်',
    hairPromptSnippet: 'contemporary Asian high-fashion Hime cut straight hairstyle, thick crisp eyebrow-grazing blunt fringe bangs, sharp cheekbone-level architectural sidelocks, juxtaposed against long pin-straight hair falling to chest, jet black high-shine finish, biological facial structure strictly preserved 100%',
    colorTints: ['Obsidian Jet Black', 'Deep Indigo Black']
  },

  // ==========================================
  // 4. SHORT BOBS & PIXIES (5 TEMPLATES)
  // ==========================================
  {
    id: 'chic-french-textured-bob',
    titleEn: 'Chic Parisian Textured French Bob',
    titleMm: 'ခေတ်ဆန် ပြင်သစ် စတိုင် ဘော့ဆံပင်တို',
    category: 'Short Bobs & Pixies',
    gender: 'female',
    length: 'Short',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Mouth-level short textured French bob with micro bangs and subtle tousled wave movement',
    hairDescriptionMm: 'ပါးစပ်အထိ တိုပြီး နူးညံ့စွာ ကောက်ထားသော ပြင်သစ်ဘော့ကေနှင့် နဖူးဖုံးဆံစတို',
    hairPromptSnippet: 'effortless Parisian chic French bob haircut, jawline-grazing blunt bottom with texturized ends and subtle airy wave movement, wispy cropped fringe bangs, natural bedhead volume, lightweight strands catching soft rim light, 100% exact facial likeness and skin micro-pores preserved',
    colorTints: ['Natural Black', 'Dark Chocolate', 'Warm Chestnut']
  },
  {
    id: 'blunt-chin-length-glass-bob',
    titleEn: 'Sharp Chin-Length Razor Glass Bob',
    titleMm: 'မေးစေ့အထိ ညီညာဖြောင့်စင်းသော မှန်သားဘော့ကေ',
    category: 'Short Bobs & Pixies',
    gender: 'female',
    length: 'Short',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Sharp geometric chin-length bob cut with pin-straight texture and centered part',
    hairDescriptionMm: 'မေးစေ့အထိ ဓားဖြင့် ညီညာစွာ လှီးထားသကဲ့သို့ တိကျဖြောင့်စင်းသော ဘော့ကေ',
    hairPromptSnippet: 'architectural chin-length blunt razor bob haircut, impeccably level perimeter hugging the jawline contour, center part with ultra-smooth flat-ironed glass shine, precision geometric styling, zero flyaways, biological face, eyes, and lips 100% unchanged',
    colorTints: ['Obsidian Black', 'Jet Black', 'Dark Plum Tint']
  },
  {
    id: 'modern-edgy-textured-pixie',
    titleEn: 'Edgy Modern Textured Pixie Cut',
    titleMm: 'ခေတ်မီ ဆန်းပြား ပစ်ဆီဆံပင်တို စတိုင်',
    category: 'Short Bobs & Pixies',
    gender: 'female',
    length: 'Short',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Cropped tapered nape pixie with longer textured crown pieces swept softly to the side',
    hairDescriptionMm: 'လည်ဂုတ်တွင် တိုတိုတိတိ ညှပ်ထားပြီး ထိပ်တွင် အလွှာလိုက် ဘေးဘက်သို့ သပ်တင်ထားသော ပစ်ဆီကေ',
    hairPromptSnippet: 'high-fashion textured cropped pixie haircut, neatly tapered close-cut nape and contoured sideburns, longer pieced-out textured crown layers swept gracefully across the forehead, natural matte paste definition, highlights on strand tips, original face identity preserved 100%',
    colorTints: ['Natural Black', 'Smoky Dark Ash', 'Espresso']
  },
  {
    id: 'airy-asymmetrical-lob',
    titleEn: 'Airy Asymmetrical Long Bob (Lob)',
    titleMm: 'ရှေ့ရှည်နောက်တို ခေတ်ဆန် အလတ်စား ဘော့ကေ',
    category: 'Short Bobs & Pixies',
    gender: 'female',
    length: 'Medium',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Graduated A-line long bob with front pieces reaching collarbone and shorter stacked back',
    hairDescriptionMm: 'နောက်ဘက်တွင် အတန်ငယ် တိုပြီး ရှေ့ဘက်တွင် ညှပ်ရိုးအထိ ရှည်ဆင်းလာသော A-Line ဘော့ကေ',
    hairPromptSnippet: 'sleek A-line graduated long bob (lob) haircut, back resting neatly off the neck while front strands sweep forward elegantly to graze the collarbone, deep side part with gentle face-hugging curve, radiant silky sheen, facial bone structure 100% preserved',
    colorTints: ['Dark Chocolate Brown', 'Natural Black', 'Rich Mocha']
  },
  {
    id: 'korean-tassel-cut-bob',
    titleEn: 'Korean Minimalist Tassel Cut Bob',
    titleMm: 'ကိုရီးယား တက်ဆယ်ကတ် မေးရိုးဘော့စတိုင်',
    category: 'Short Bobs & Pixies',
    gender: 'female',
    length: 'Short',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Trending Seoul tassel bob with lightweight straight blunt ends flaring outwards slightly',
    hairDescriptionMm: 'ဆိုးလ်မြို့ ခေတ်စားစတိုင် အောက်ဖျား အနည်းငယ် လှန်ထွက်နေသော တက်ဆယ်ဘော့ကေ',
    hairPromptSnippet: 'trending Korean minimalist Tassel Cut bob hairstyle, chin-length straight silhouette with lightweight sharp blunt ends that flick out with subtle natural movement, airy see-through fringe bangs, modern Seoul youth aesthetic, silky healthy hair shine, biological face preserved 100%',
    colorTints: ['Jet Black', 'Dark Ash Brown', 'Chestnut Brown']
  },

  // ==========================================
  // 5. ELEGANT UPDOS & BUNS (5 TEMPLATES)
  // ==========================================
  {
    id: 'relaxed-low-textured-chignon',
    titleEn: 'Effortless Romantic Low Textured Chignon',
    titleMm: 'နူးညံ့သော မျက်နှာဘေးဆံစနုနှင့် ချီဂွန်ဆံထုံး',
    category: 'Elegant Updos',
    gender: 'female',
    length: 'Updo',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Soft gathered low chignon at the nape of neck with wavy tendrils framing the cheeks',
    hairDescriptionMm: 'လည်ဂုတ်တွင် နူးညံ့စွာ သိမ်းဆည်းထားသော ဆံထုံးနိမ့်နှင့် ပါးပြင်တစ်လျှောက် ဝဲကျနေသော လှိုင်းတွန့်ဆံစနုများ',
    hairPromptSnippet: 'effortless romantic low textured chignon updo hairstyle, gathered softly at the nape of the neck with twisted interlocking loops, delicate wavy tendrils escaping naturally to frame the jawline and temples, organic volume at crown, soft studio rim lighting catching loose strands, exact facial identity maintained 100%',
    colorTints: ['Dark Chestnut', 'Natural Black', 'Caramel Tint']
  },
  {
    id: 'sleek-high-architectural-top-knot',
    titleEn: 'Sleek High Architectural Ballerina Top Knot',
    titleMm: 'ဘဲလေးအကမယ် စတိုင် ထိပ်သီး ဆံထုံးမြင့်ပြောင်',
    category: 'Elegant Updos',
    gender: 'female',
    length: 'Updo',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Immaculately smoothed high ballerina bun perched high on the crown with clean glossy perimeter',
    hairDescriptionMm: 'ဦးခေါင်းထိပ်တွင် သေသပ်ပြောင်လက်စွာ ထုံးထားသော ဘဲလေး စတိုင် ဆံထုံးမြင့်',
    hairPromptSnippet: 'sculptural ballerina high top knot bun hairstyle, hair brushed back immaculately into a sleek polished cylinder positioned at the apex of the head, clean clean hairline with fine natural micro-baby hairs, high-gloss gel sheen, minimalist runway elegance, original facial likeness 100% intact',
    colorTints: ['Obsidian Black', 'Deep Espresso']
  },
  {
    id: 'french-twist-classic-pleat',
    titleEn: 'Timeless French Twist Pleat Updo',
    titleMm: 'ပြင်သစ် ရိုးရာ ကျောဘက်ခေါက် ဆံထုံးဆန်း',
    category: 'Elegant Updos',
    gender: 'female',
    length: 'Updo',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Vertical French roll seam tucked cleanly along the back of head with gentle volume on top',
    hairDescriptionMm: 'ခေါင်းနောက်ဘက်တွင် ဒေါင်လိုက် လှပစွာ ခေါက်ထုံးထားသော ပြင်သစ် စတိုင် ဆံထုံး',
    hairPromptSnippet: 'timeless classic French twist updo hairstyle, vertical sleek pleat rolling smoothly up the back of the head, soft elegant bouffant lift at the front crown, subtle soft tendril touching the earlobe, black satin sheen, formal red-carpet sophistication, biological facial likeness preserved',
    colorTints: ['Natural Black', 'Dark Walnut Brown']
  },
  {
    id: 'crown-dutch-braid-updo',
    titleEn: 'Bohemian Crown Dutch Braid Updo with Florals',
    titleMm: 'သရဖူသဏ္ဌာန် ဒတ်ချ် ကျစ်ဆံမြီး ရစ်ပတ်ဆံထုံး',
    category: 'Elegant Updos',
    gender: 'female',
    length: 'Updo',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Thick raised Dutch braid encircling the head like a crown, interwoven with baby breath flowers',
    hairDescriptionMm: 'ဦးခေါင်းထက်တွင် သရဖူပမာ ရစ်ပတ်ထားသော ကျစ်ဆံမြီးကြီးနှင့် ပန်းပွင့်ဖတ်လေးများ ထိုးဆင်ထားမှု',
    hairPromptSnippet: 'elaborate Dutch crown braid updo hairstyle, raised three-dimensional thick braid encircling the crown like a living tiara, interspersed with miniature delicate white baby breath flowers, softly textured romantic loops, soft wisps at temples, 100% exact facial bone structure and eyes preserved',
    colorTints: ['Natural Dark Brown', 'Jet Black']
  },
  {
    id: 'retro-glam-victory-rolls',
    titleEn: 'Vintage 1940s Retro Glam Victory Rolls',
    titleMm: '၁၉၄၀ ပြည့်လွန်နှစ်များ ဗစ်ထရီ ရိုးလ် ခေတ်ဟောင်းစတိုင်',
    category: 'Elegant Updos',
    gender: 'female',
    length: 'Updo',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Twin sculpted vintage victory rolls positioned symmetrically above temples with smooth curled back',
    hairDescriptionMm: 'နဖူးထက် ဘယ်ညာတွင် လိပ်ခွေထားသော ၁၉၄၀ ခေတ်ဟောင်း ဗစ်ထရီ ရိုးလ် ဆံကေသာ',
    hairPromptSnippet: 'authentic 1940s vintage Victory Rolls updo hairstyle, twin sculpted architectural cylindrical rolls sweeping symmetrically up and back from the temples, rear hair rolled into a clean snood chignon, glossy vintage pomade sheen, crisp historic styling, biological facial likeness 100% untouched',
    colorTints: ['Jet Black', 'Deep Auburn Black']
  },

  // ==========================================
  // 6. MEN'S HAIRSTYLES (5 TEMPLATES)
  // ==========================================
  {
    id: 'men-textured-quiff-taper-fade',
    titleEn: 'Modern Textured Quiff with High Taper Fade',
    titleMm: 'အမျိုးသား ခေတ်မီ ဖေ့ဒ် ကွစ်ဖ်ကေ',
    category: 'Men Hairstyles',
    gender: 'male',
    length: 'Short',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Clean high taper fade on sides with piecey textured quiff brushed up and backward',
    hairDescriptionMm: 'ဘေးနှစ်ဖက်တွင် အောက်ချေ သေသပ်စွာ ဖေ့ဒ်ညှပ်ထားပြီး ထိပ်တွင် အထက်သို့ သပ်တင်ထားသော စတိုင်',
    hairPromptSnippet: 'contemporary men modern textured quiff hairstyle, clean skin-tapered fade on the sides and back blending seamlessly into a textured voluminous quiff on top, brushed upward and back with natural separation, matte clay finish, natural hairline integration, 100% exact male facial bone structure, jawline, and eyes preserved',
    colorTints: ['Natural Black', 'Dark Charcoal', 'Dark Brown']
  },
  {
    id: 'men-classic-side-part-pompadour',
    titleEn: 'Classic Executive Side Part Pompadour',
    titleMm: 'အမျိုးသား ကလပ်စစ် ဘေးခွဲ ပွန်ပါဒိုး စတိုင်',
    category: 'Men Hairstyles',
    gender: 'male',
    length: 'Short',
    texture: 'Straight',
    previewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Razor hard part with combed-back low shine executive pompadour and tapered neckline',
    hairDescriptionMm: 'တိကျသော ဘေးခွဲကြောင်းနှင့် သေသပ်စွာ နောက်သို့ ဖြီးတင်ထားသော လူကြီးလူကောင်း ပွန်ပါဒိုးစတိုင်',
    hairPromptSnippet: 'classic executive side-part pompadour hairstyle, crisp clean razor-cut side parting line, voluminous sculpted front pompadour swept smoothly back with low-shine styling cream, neatly groomed scissor-tapered sides and temples, 100% identical male facial likeness and features',
    colorTints: ['Jet Black', 'Natural Espresso']
  },
  {
    id: 'men-korean-two-block-comma-hair',
    titleEn: 'Korean Two-Block Comma Hair (쉼표머리)',
    titleMm: 'ကိုရီးယား ကော်မာဆံပင်စတိုင် (ဆန်းသစ် အမောက်ကေ)',
    category: 'Men Hairstyles',
    gender: 'male',
    length: 'Medium',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Iconic Korean Two-block haircut with front fringe curved gracefully into a comma punctuation shape',
    hairDescriptionMm: 'နဖူးပေါ်တွင် ကော်မာသဏ္ဌာန် ကွေးဆင်းနေသော ကိုရီးယား နာမည်ကျော် ဆံပင်ပုံစံ',
    hairPromptSnippet: 'trending Korean male Two-Block Comma hair (쉼표머리), clipped undercut sides with longer layered top, front fringe curved inwards over one eyebrow in the signature sculptural comma punctuation mark, soft natural movement and airy separation, glossy black hair, preserving 100% of subject facial anatomy',
    colorTints: ['Natural Black', 'Dark Ash Brown']
  },
  {
    id: 'men-traditional-burmese-gaungbaung-topknot',
    titleEn: 'Traditional Burmese Royal Gaung Baung with Topknot',
    titleMm: 'မြန်မာ့ရိုးရာ တော်ဝင် ခေါင်းပေါင်းနှင့် ဆံတောက်',
    category: 'Men Hairstyles',
    gender: 'male',
    length: 'Short',
    texture: 'Coiffured',
    previewUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Traditional Burmese silk Gaung Baung headwrap with traditional styled hair sideburns and temple locks',
    hairDescriptionMm: 'မြန်မာ့ရိုးရာ ပိုးခေါင်းပေါင်းတော် ဆင်ယင်ထားပြီး ဘေးဆံသေသပ်စွာ ညှပ်ထားသော နန်းတွင်းစတိုင်',
    hairPromptSnippet: 'traditional authentic Burmese nobleman ceremonial head attire, golden cream hand-folded silk Gaung Baung (ခေါင်းပေါင်း) with folded ear wing resting above temple, clean neat traditional sideburns and natural male hairline visible under the headwrap, dignified Myanmar heritage styling, 100% exact facial bone structure preserved',
    colorTints: ['Obsidian Black', 'Natural Jet Black']
  },
  {
    id: 'men-wavy-curtains-undercut',
    titleEn: 'Middle-Part Wavy Curtains with Undercut',
    titleMm: 'အလယ်ခွဲ အိစက်လှိုင်းတွန့်နှင့် အန်ဒါကတ် စတိုင်',
    category: 'Men Hairstyles',
    gender: 'male',
    length: 'Medium',
    texture: 'Wavy',
    previewUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    hairDescriptionEn: 'Romantic 90s-inspired relaxed middle-part curtain waves falling effortlessly over ears with subtle undercut',
    hairDescriptionMm: 'အလယ်ခွဲ လှိုင်းတွန့်နုလေးများဖြင့် ပေါ့ပေါ့ပါးပါး နားရွက်ဘေး ဝဲကျနေသော ယောက်ျားလေး ဆံပင်စတိုင်',
    hairPromptSnippet: 'romantic men middle-parted wavy curtain hairstyle, soft flowing S-waves falling effortlessly around cheekbones, subtle clean undercut beneath the long crown layers, natural texture with matte separation, masculine model aesthetic, biological face, jaw, and eyes strictly unchanged 100%',
    colorTints: ['Natural Black', 'Dark Mocha', 'Chestnut Brown']
  }
];
