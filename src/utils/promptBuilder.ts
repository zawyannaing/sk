import { MatrixSelection, AppMode } from '../types';
import { HEIGHT_OPTIONS, WEIGHT_OPTIONS, GARMENT_OPTIONS, CULTURAL_PROP_PRESETS, ETHNICITY_OPTIONS, LOCATION_OPTIONS, LOCATION_REFERENCE_MAP } from '../data/presetData';
import { SCENES_550_COLLECTION, SceneItem } from '../data/scenes550Data';

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

export const LOCATION_TAXONOMY_MAP: Record<string, { en: string; mm: string }> = {
  // 0. Default & Studio Baseline
  skip: {
    en: 'high-end minimalist editorial portrait studio, clean neutral backdrop with subtle softbox gradient falloff, authentic cinematic depth of field',
    mm: 'စတူဒီယို သန့်သန့် မိုနိုခရုန်း နောက်ခံ၊ ချောမွေ့သော အလင်းအရိပ်'
  },

  // 1. Myanmar Heritage & Iconic Sites (1 to 15 + Key Historical Aliases)
  shwedagon_pagoda: {
    en: 'sacred white marble platform of Shwedagon Pagoda in Yangon, monumental 99-meter solid gold-plated Burmese bell-shaped stupa (Khaung-laung-pon) crowned with diamond bud (Sein-bu) and filigree Hti umbrella, surrounded by ornate multi-tiered wooden Pyatthat prayer pavilions (Tazaungs), intricate Mandalay glass mosaic shrines (Hman-zi Shwe-cha), bronze bells, and glowing golden oil lamps reflecting on mirror-polished white jade marble terrace (strictly authentic Burmese architecture, no Thai wat prangs, no Cambodian Angkor towers)',
    mm: 'ရန်ကုန် ရွှေတိဂုံစေတီတော် ရင်ပြင်တော်၊ ရွှေသင်္ကန်းရောင်ပြန် ခေါင်းလောင်းပုံစေတီ၊ တန်ဆောင်းပြာသာဒ်များနှင့် စကျင်ကျောက်သား ရောင်ပြန်နောက်ခံ'
  },
  bagan_temples: {
    en: 'ancient Bagan archaeological sanctuary, weathered 11th-century Pagan Dynasty vaulted terracotta red-brick stupas (gugyi architectural spires) and bell-shaped gilded stupas stretching to the horizon across dry alluvial red plains dotted with acacia trees, warm atmospheric dust motes, and soft morning sun rays piercing through mist (authentic Pagan terracotta brickwork, strictly avoiding Thai prang spires and Angkor Wat ruins)',
    mm: 'ပုဂံ ရှေးဟောင်း စေတီပုထိုးများ၊ ၁၁ ရာစု အနီရောင် ရှေးဟောင်းအုတ်ကျောင်းများနှင့် ရွှေရောင်မြူခိုးဝေသော ရှုခင်း'
  },
  bagan_pagoda: {
    en: 'ancient Bagan archaeological sanctuary, weathered 11th-century Pagan Dynasty vaulted terracotta red-brick stupas (gugyi architectural spires) and bell-shaped gilded stupas stretching to the horizon across dry alluvial red plains dotted with acacia trees, warm atmospheric dust motes, and soft morning sun rays piercing through mist (authentic Pagan terracotta brickwork, strictly avoiding Thai prang spires and Angkor Wat ruins)',
    mm: 'ပုဂံ ရှေးဟောင်းစေတီပုထိုးများနှင့် နံနက်ခင်း ရွှေရောင်မြူခိုးဝေသော ရှုခင်း'
  },
  inle_lake: {
    en: 'serene Inle Lake scenic fresh waters at sunrise, traditional wooden longtail canoe, floating hydroponic vegetation gardens (Ye-chan), stilted teakwood lake pavilions with curved eaves, and distant misty blue Shan mountain ridge reflections (authentic Intha lake architecture, traditional wooden stilt construction)',
    mm: 'အင်းလေးကန် ရေပြင်၊ ရိုးရာသစ်သားလှေ၊ ကြာပန်းခင်းနှင့် ရှမ်းရိုးမ တောင်တန်း နောက်ခံ'
  },
  mandalay_moat: {
    en: 'historic Mandalay Royal Palace moat, tranquil mirror-like waters reflecting the ancient red crenellated masonry fortress walls and tiered golden wooden Pyatthat watchtowers with multi-tiered gabled roofs, flanked by lush tamarind trees with the misty green Mandalay Hill in the distance (authentic Konbaung dynasty fortification and Pyatthat roofs, no Western castle walls)',
    mm: 'မန္တလေး ကျုံးနှင့် နန်းမြို့ရိုး၊ ပြာသာဒ်ဆောင်များနှင့် ရှမ်းရိုးမတောင်တန်း ရောင်ပြန် ရှုခင်း'
  },
  konbaung_palace_interior: {
    en: 'opulent Mandalay Yadanabon Konbaung Royal Palace Lion Throne Hall (Sihasana), soaring vermilion cinnabar-lacquered teakwood pillars intricately carved with gold-leaf filigree and peacock emblems, traditional Mandalay glass mosaic (Hman-zi Shwe-cha), polished teak parquet flooring, gilded lotus cornices, and dramatic warm directional window shafts (authentic Konbaung royal court interiors, no European palace decor)',
    mm: 'ကုန်းဘောင် / ရတနာပုံ နန်းတွင်း ရွှေနန်းတော်ဆောင်၊ ကျွန်းသစ်ပန်းပုတိုင်များနှင့် ဟင်္သာပြဒါးရွှေချည်ထိုး နန်းတွင်းဗိသုကာ'
  },
  mandalay_palace: {
    en: 'historic Mandalay Royal Palace royal pavilion, intricately carved golden teakwood pillars, vermilion cinnabar-lacquered colonnade, multi-tiered Pyatthat spires with floral bargeboards, dramatic shafts of warm golden sunlight (authentic Konbaung dynasty court architecture)',
    mm: 'မန္တလေး နန်းတော် ကျွန်းသစ်ပန်းပုတိုင်များနှင့် ဟင်္သာပြဒါးရောင် နန်းတွင်းဆောင်'
  },
  ubein_bridge: {
    en: 'historic U Bein teakwood bridge in Amarapura, weathered 150-year-old teakwood pilings curving across serene Taungthaman Lake, warm amber water reflections, silhouetted boatmen with conical nets, and glowing sunset horizon (authentic 19th-century Amarapura teakwood engineering)',
    mm: 'အမရပူရ ဦးပိန်တံတား နေဝင်ဆည်းဆာနှင့် တောင်သမန်အင်း ရေပြင်ရောင်ပြန်'
  },
  amarapura_teak_bridge: {
    en: 'historic U Bein teakwood bridge in Amarapura, weathered 150-year-old teakwood pilings curving across serene Taungthaman Lake, warm amber water reflections, silhouetted boatmen with conical nets, and glowing sunset horizon (authentic 19th-century Amarapura teakwood engineering)',
    mm: 'အမရပူရ ဦးပိန်တံတားနှင့် တောင်သမန်အင်း ရေပြင်ရောင်ပြန်'
  },
  sagaing_hill: {
    en: 'majestic Sagaing Hill slopes cascading with hundreds of whitewashed and gilded Burmese bell stupas (U Min Thonze crescent colonnade, Soon U Ponya Shin), lush tamarind and acacia foliage, overlooking the sweeping silver curves of the Ayeyarwady River and Inwa bridge (authentic Burmese bell-shaped stupas, no Thai chedis)',
    mm: 'စစ်ကိုင်းတောင်ရိုး စေတီပုထိုးများ၊ ဧရာဝတီမြစ်ကွေ့နှင့် သဘာဝရှုခင်း'
  },
  kalaw_pindaya: {
    en: 'crisp misty Kalaw highland pine forest trails, undulating green tea plantation terraces, and dramatic limestone entrance to Pindaya natural cave sanctuary housing thousands of centuries-old gilded Buddha statues (authentic Shan highland topography)',
    mm: 'ကလော ထင်းရှူးတော၊ လက်ဖက်ခင်း တောင်ကုန်းများနှင့် ပင်းတယ လိုဏ်ဂူ ရှုခင်း'
  },
  pyinoolwin_garden: {
    en: 'Pyin Oo Lwin National Kandawgyi Botanical Gardens, manicured vibrant flower beds, towering silver pine groves, wooden lake footbridge, classic teak gazebo, and serene reflective lake waters beneath cool mountain air',
    mm: 'ပြင်ဦးလွင် အမျိုးသား ကန်တော်ကြီး ပန်းခြံ၊ ထင်းရှူးတန်းနှင့် ရေကန် ရှုခင်း'
  },
  ngapali_beach: {
    en: 'pristine Ngapali coastline, soft powdery white sand, swaying coconut palms, crystal-clear turquoise Bay of Bengal waves, rustic bamboo thatch beach umbrellas, and warm coastal sea breeze',
    mm: 'ငပလီ ကမ်းခြေ ဖြူဖွေးသော သဲသောင်ပြင်၊ အုန်းပင်ရိပ်နှင့် စိမ်းပြာရောင် ပင်လယ်လှိုင်း'
  },
  myeik_islands: {
    en: 'remote Mergui (Myeik) Archipelago, dramatic jungle-topped limestone karst cliffs rising out of crystalline turquoise Andaman sea waters, secluded pristine white sand cove with coral reefs visible beneath the surface',
    mm: 'မြိတ် ကျွန်းစုများ၏ အပြာရောင် ပင်လယ်၊ ကျွန်းပတ်လည် သဲဖြူသောင်နှင့် သဘာဝ ကျောက်ဆောင်များ'
  },
  taunggyi_balloon_field: {
    en: 'Taunggyi Tazaungdaing highland festival grounds at dusk, illuminated giant handmade Shan paper hot-air balloons bearing intricate firework candle patterns floating into the deep twilight Shan sky, festive bonfire glow and cheering crowds',
    mm: 'တောင်ကြီး မီးပုံးပျံပွဲတော် ကွင်း၊ မီးရှူးမီးပန်းများနှင့် ညနေခင်း ရှမ်းပြည်တောင်တန်း ရှုခင်း'
  },
  chin_mountains: {
    en: 'rugged misty Chin mountain ridges, Mount Victoria (Nat Ma Taung) alpine summit with blooming crimson rhododendron trees, rolling dramatic sea of clouds drifting across pine-clad mountain peaks and terraced tribal villages',
    mm: 'ချင်းတောင်တန်း၊ ဝိတိုရိယတောင်၊ တောင်ဇလပ်ပန်းများနှင့် တောင်ပေါ်မြူခိုး ရှုခင်း'
  },
  kyaiktiyo_golden_rock: {
    en: 'sacred Kyaiktiyo Golden Rock pagoda precariously perched on the edge of a sheer granite cliff, completely gilded in pure leaf gold crowned with a delicate hti umbrella, shrouded in mystical swirling mountain fog overlooking lush Mon state hills (authentic Burmese sacred boulder pagoda)',
    mm: 'ကျိုက်ထီးရိုး ဆံတော်ရှင် စေတီတော်၊ ကျောက်တုံးရွှေစင်နှင့် တောင်ပေါ် မြူခိုးဝေသော ရှုခင်း'
  },
  riverside_sunset: {
    en: 'picturesque Ayeyarwady riverbank jetty at sunset, gentle golden water ripples, moored antique teak passenger boats and wooden sampans, rustic wooden boardwalk, and distant silhouetted river palms',
    mm: 'ရန်ကုန်မြစ်ကမ်း / ဧရာဝတီ မြစ်ကမ်း သင်္ဘောဆိပ်နှင့် နေဝင်ချိန် ရွှေရောင်ရေပြင်'
  },
  monastery_temple_hall: {
    en: 'sacred centuries-old antique Burmese monastery (kyaung) prayer hall, dark hand-hewn golden teak pillars with intricate Jataka relief carvings, ornate gilded Mandalay glass mosaic Buddha altar, and incense smoke filtering through timber louvers (authentic Burmese teakwood monastery architecture, no Thai wat interior)',
    mm: 'ရိုးရာ သစ်သား ကျောင်းတိုက်ကြီး အတွင်း၊ ရွှေပန်းပု ကျွန်းတိုင်များနှင့် ဓမ္မာရုံ နောက်ခံ'
  },
  mrauk_u_temples: {
    en: 'ancient medieval Mrauk-U archaeological sanctuary, colossal medieval sandstone fortress temples (Shitthaung Pagoda) with tiered stone stupas rising through thick morning hill mist in Rakhine State (authentic Rakhine fortress pagoda architecture)',
    mm: 'ရခိုင်ပြည်နယ် မြောက်ဦး ရှေးဟောင်း ကျောက်ဆစ် စေတီပုထိုးများနှင့် နံနက်ခင်း မြူခိုးရှုခင်း'
  },
  hpa_an_caves: {
    en: 'dramatic Hpa-An limestone karst peak landscape, towering sheer karst cliffs surrounded by verdant emerald rice paddies, sacred Sadan Cave lake waters, and golden stupa spires crowning jagged peaks',
    mm: 'ဘားအံ ဇွဲကပင်တောင်ခြေ၊ ထုံးကျောက်တောင်များနှင့် သဘာဝ လိုဏ်ဂူ ရေကန် ရှုခင်း'
  },

  // 2. World-Class Iconic Locations (16 to 25)
  paris_eiffel_tower: {
    en: 'Parisian Seine riverbank promenade overlooking the iconic architectural ironwork of the Eiffel Tower, elegant Haussmannian limestone architecture, and classic cobblestone walkway bathed in golden afternoon light',
    mm: 'ပြင်သစ် ပါရီ အီဖယ်တာဝါနှင့် စိန်းမြစ်ကမ်း ကျောက်ခင်းလမ်း ရှုခင်း'
  },
  santorini_greece: {
    en: 'Santorini cliffside village of Oia, pristine whitewashed Cycladic stone cubic architecture, vibrant cobalt-blue church domes, and sweeping vistas of the sapphire Aegean Sea caldera at sunset',
    mm: 'ဂရိ ဆန်တိုရီနီ အဖြူရောင် ပင်လယ်ကမ်းပါး မြို့ကလေးနှင့် အပြာရောင် အမိုးခုံး ရှုခင်း'
  },
  kyoto_bamboo_torii: {
    en: 'Kyoto Arashiyama soaring green bamboo grove pathway and vibrant vermilion Fushimi Inari wooden torii gates, dappled soft sunlight filtering through towering bamboo shoots with mossy stone lanterns',
    mm: 'ဂျပန် ကျိုတို အာရာရှိယာမ ဝါးတောနှင့် တိုရီးတံခါးအနီ ကျောက်လမ်း ရှုခင်း'
  },
  swiss_alps_snow: {
    en: 'Swiss Alps alpine scenery, towering snow-dusted jagged mountain massifs, crystal-clear turquoise alpine glacial lake, weathered wooden timber chalet, and wildflower meadows',
    mm: 'ဆွစ်ဇာလန် အဲလ်ပ်စ် နှင်းတောင်၊ ရေခဲကန်နှင့် သဘာဝ ရှုခင်း'
  },
  venice_gondola_canal: {
    en: 'historic Venice Grand Canal, weathered Venetian Gothic palazzo stone facades, traditional polished black wooden gondolas moored on striped wooden poles, and emerald reflective canal water',
    mm: 'အီတလီ ဗင်းနစ် ဂွန်ဒိုလာ လှေနှင့် ရှေးဟောင်း ရေမြောင်း ဗိသုကာ ရှုခင်း'
  },
  taj_mahal_palace: {
    en: 'monumental grounds of the Taj Mahal in Agra, luminous ivory-white Mughal marble dome and minarets reflecting in pristine symmetrical lotus reflecting pools bordered by cypress gardens',
    mm: 'အိန္ဒိယ တာဂျ်မဟာရ် စကျင်ကျောက် နန်းတော်နှင့် ရောင်ပြန် ရေကန် ရှုခင်း'
  },
  bali_jungle_swing: {
    en: 'lush tropical Ubud Bali landscape, terraced emerald green rice paddies (Tegallalang), sweeping coconut palm fronds, wooden pavilion, and misty volcanic mountain ridge',
    mm: 'အင်ဒိုနီးရှား ဘာလီ လယ်ကွင်းလှေကားထစ်များနှင့် အပူပိုင်း သစ်တော ရှုခင်း'
  },
  maldives_overwater: {
    en: 'exclusive Maldives luxury overwater timber bungalow villa with private sun deck, perched over crystal-clear aqua-turquoise lagoon waters with pristine white coral sand below',
    mm: 'မော်လဒိုက် ရေပေါ် ဘန်ဂလိုနှင့် ကြည်လင်ပြာလဲ့သော သန္တာကျောက်တန်း လဂွန် ရေပြင်'
  },
  cappadocia_balloons: {
    en: 'whimsical Cappadocia Goreme valley, ancient wind-carved volcanic fairy chimney rock formations, colorful hot air balloons rising in the dawn sky over golden sandstone canyons',
    mm: 'တူရကီ ကက်ပါဒိုစီယာ မီးပုံးပျံများနှင့် ကျောက်တောင် ချိုင့်ဝှမ်း ရှုခင်း'
  },
  ny_central_park: {
    en: 'New York City Central Park Bow Bridge, lush American elm trees framing the tranquil lake waters with the iconic Beaux-Arts Manhattan apartment skyline rising behind',
    mm: 'နယူးယောက် စင်ထရယ်ပါ့ခ်၊ သစ်တောရိပ်နှင့် မြို့ပြ မိုးမျှော်တိုက် ရှုခင်း'
  },

  // 3. Studio & Architectural Interiors (26 to 30)
  plain_studio: {
    en: 'high-end minimalist editorial photo studio, seamless neutral matte cyclorama wall with velvety smooth gradient falloff, clean floor, and zero background clutter',
    mm: 'စတူဒီယို သန့်သန့် မိုနိုခရုန်း နောက်ခံ၊ ချောမွေ့သော အလင်းအရိပ်'
  },
  wood_brick_studio: {
    en: 'contemporary industrial loft photo studio, exposed weathered warm red-brick walls, rustic reclaimed herringbone oak flooring, and expansive steel-mullioned factory casement windows',
    mm: 'စတူဒီယို သစ်သား / ရှေးဟောင်း အုတ်နံရံ ခေတ်မီ စတိုင်လ် နောက်ခံ'
  },
  luxury_hotel_ballroom: {
    en: 'lavish five-star luxury hotel grand ballroom, soaring coffered ceilings, multi-tiered sparkling crystal chandeliers, polished Italian Botticino marble flooring, and gilded crown molding',
    mm: 'ဟိုတယ် လော်ဘီနှင့် ခမ်းနားသော ပွဲမ အခန်းမ၊ စကျင်ကျောက်နှင့် ဖန်မီးဆိုင်းကြီးများ'
  },
  cafe_interior: {
    en: 'aesthetic boutique artisan cafe interior, warm exposed terracotta tiles, warm hanging Edison filament pendant lights, solid walnut furniture, and lush indoor monstera greenery',
    mm: 'ခေတ်မီ မီးရောင်စုံ ကော်ဖီဆိုင် အတွင်း၊ သစ်သားပရိဘောဂနှင့် နွေးထွေးသော အငွေ့အသက်'
  },
  traditional_myanmar_house: {
    en: 'authentic heritage Myanmar teakwood family manor, polished broad teak plank flooring, open-air shaded veranda with woven bamboo blinds, carved wooden balustrades, and lush potted orchids in a tranquil tropical courtyard garden (authentic Burmese teakwood residential architecture)',
    mm: 'ရိုးရာ မြန်မာ့ ကျွန်းသစ်အိမ်ကြီး၊ ဝရံတာနှင့် သဘာဝ ပန်းမန် ဥယျာဉ် နောက်ခံ'
  },

  // 4. Nature & Lifestyle (31 to 36)
  golden_hour_paddy_field: {
    en: 'sprawling golden harvest rice paddy fields in rural Myanmar, swaying ripe amber grain stalks, winding earthen foot trail, and expansive open sunset horizon with warm golden dust and silhouetted toddy palm trees',
    mm: 'နေဝင်ချိန် ရွှေရောင် စပါးခင်းများ၊ လယ်ကွင်း ရှုခင်းနှင့် ဆည်းဆာ အလင်း'
  },
  lush_forest_stream: {
    en: 'enchanting pristine rainforest sanctuary, moss-covered granite boulders, clear cascading mountain brook with frothy water sprays, and dense vibrant green wild ferns beneath a lush canopy',
    mm: 'စိမ်းစိုသော သစ်တော၊ ရေတံခွန်နှင့် စမ်းချောင်း၊ ကျောက်ဆောင် ရှုခင်း'
  },
  cherry_blossom_garden: {
    en: 'ethereal cherry blossom botanical garden in peak springtime bloom, cascading soft pink sakura petals drifting on the gentle breeze, manicured lawn, and wooden garden bench',
    mm: 'ပန်းချယ်ရီခင်းနှင့် သဘာဝပန်းခြံ၊ ပန်းပွင့်ဖတ်လွင့်ဝေသော ရှုခင်း'
  },
  modern_city_street: {
    en: 'sleek cosmopolitan urban boulevard, contemporary glass and steel architectural facades, wide polished granite pedestrian promenade, and refined urban street design',
    mm: 'မြို့ပြ လမ်းမနှင့် ခေတ်မီ ဒေါင်လိုက် အဆောက်အဦများ၊ သန့်ရှင်းသော လမ်းလျှောက်စင်္ကြံ'
  },
  neon_city_night: {
    en: 'atmospheric cyberpunk nighttime city street, rain-slicked asphalt reflecting vivid neon signs in magenta, turquoise, and amber, moody dark futuristic urban alleyway',
    mm: 'နီယွန်မီးရောင်စုံ ညမြို့ပြ၊ မိုးစိုနေသော လမ်းမနှင့် ဆိုက်ဘာပန့်ခ် အလင်းရောင်စုံ'
  },
  other_location: {
    en: 'an authentic bespoke atmospheric architectural setting featuring authentic regional cultural textures, realistic spatial geometry, multi-tiered woodwork, and natural optical depth of field (avoiding Thai prang spires and Cambodian stone towers)',
    mm: 'ကိုယ်ပိုင် စိတ်ကြိုက် နောက်ခံ ဗိသုကာ ရှုခင်း'
  }
};

export const LOCATION_TAXONOMY = LOCATION_TAXONOMY_MAP;

// Helper to resolve location from taxonomy, scenes550 data, or humanized formatting (NEVER raw snake_case)
export function resolveLocationDescription(
  locationKeyOrName?: string,
  selectedSceneId?: string
): { en: string; mm: string; referenceImage?: string; lightingNotes?: string } {
  const raw = (locationKeyOrName || '').trim();
  const normalizedKey = raw.toLowerCase().replace(/[\s-]+/g, '_');

  // 1. Check direct match in SCENES_550_COLLECTION by sceneId or locationKey
  if (selectedSceneId) {
    const scene = SCENES_550_COLLECTION.find(s => s.id === selectedSceneId);
    if (scene) {
      return {
        en: scene.prompt.replace(/\s+/g, ' ').trim(),
        mm: scene.titleMm || scene.titleEn,
        referenceImage: scene.previewImage,
        lightingNotes: scene.lightingNotes
      };
    }
  }

  const sceneByKey = SCENES_550_COLLECTION.find(
    s => s.id === raw || s.id === normalizedKey || s.tags?.includes(raw.toLowerCase()) || s.tags?.includes(normalizedKey)
  );
  if (sceneByKey) {
    return {
      en: sceneByKey.prompt.replace(/\s+/g, ' ').trim(),
      mm: sceneByKey.titleMm || sceneByKey.titleEn,
      referenceImage: sceneByKey.previewImage,
      lightingNotes: sceneByKey.lightingNotes
    };
  }

  // 2. Check direct match in LOCATION_TAXONOMY_MAP
  if (normalizedKey && normalizedKey !== 'skip' && LOCATION_TAXONOMY_MAP[normalizedKey]) {
    const ref = LOCATION_REFERENCE_MAP[normalizedKey]?.url;
    return {
      en: LOCATION_TAXONOMY_MAP[normalizedKey].en,
      mm: LOCATION_TAXONOMY_MAP[normalizedKey].mm,
      referenceImage: ref
    };
  }

  // 3. Check preset options in LOCATION_OPTIONS
  const opt = LOCATION_OPTIONS.find(l => l.id === normalizedKey || l.id === raw);
  if (opt && opt.id !== 'skip') {
    return {
      en: `authentic ${opt.labelEn}, featuring authentic traditional Burmese architecture, regional landscape topography, and atmospheric natural lighting (avoiding Thai prang spires and Cambodian stone towers)`,
      mm: opt.labelMm,
      referenceImage: opt.referenceImage || opt.previewImage
    };
  }

  // 4. Default or Fallback: Humanize string nicely, NEVER output raw snake_case like "mandalay_moat"
  if (raw && raw !== 'skip' && raw !== 'other_location') {
    const humanized = raw
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      en: `an authentic atmospheric setting in ${humanized}, featuring authentic Myanmar architectural details, multi-tiered woodwork, and natural depth of field (strictly avoiding Thai prang spires and Cambodian Angkor stone towers)`,
      mm: `${humanized} ရှုခင်း နောက်ခံ`
    };
  }

  return {
    en: 'an atmospheric Myanmar heritage architectural sanctuary with bell-shaped stupas, multi-tiered Pyatthat roofs, and warm golden depth of field (avoiding Thai prangs and Cambodian ruins)',
    mm: 'မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု အမွေအနှစ် နောက်ခံရှုခင်း'
  };
}

export const resolveLocationTaxonomy = resolveLocationDescription;

export interface MappedSceneContext {
  prompt: string;
  ratio: string;
  referencePhoto: string;
  referencePhotos: {
    id: string;
    url: string;
    name: string;
    role: 'background';
  }[];
  chosenOptions: { label: string; value: string; emoji?: string }[];
  locationKey: string;
  locationDetails: string;
  timeOfDay: string;
  mood: string;
  lightingNotes: string;
  scene: SceneItem;
}

// Maps any scene from 550+ library to rich architectural taxonomy, background reference plate, and environment controls
export function mapSceneToStudioContext(
  scene: SceneItem,
  existingPrompt?: string
): MappedSceneContext {
  const sText = `${scene.id} ${scene.titleEn} ${scene.lightingNotes} ${scene.prompt} ${(scene.tags || []).join(' ')} ${scene.sunDirection} ${scene.atmosphere}`.toLowerCase();

  // 1. Precise architectural location mapping
  let locationKey = 'bagan_temples';
  if (sText.includes('shwedagon') || sText.includes('shwemawdaw')) {
    locationKey = 'shwedagon_pagoda';
  } else if (sText.includes('bagan') || sText.includes('dhammayangyi') || sText.includes('ananda')) {
    locationKey = 'bagan_temples';
  } else if (sText.includes('inle') || sText.includes('nga phe') || sText.includes('jumping cat') || sText.includes('phaung daw oo')) {
    locationKey = 'inle_lake';
  } else if (sText.includes('mandalay moat') || sText.includes('palace moat') || sText.includes('fortress wall')) {
    locationKey = 'mandalay_moat';
  } else if (sText.includes('mandalay palace') || sText.includes('throne hall') || sText.includes('konbaung') || sText.includes('shwenandaw')) {
    locationKey = 'konbaung_palace_interior';
  } else if (sText.includes('mandalay hill') || sText.includes('sutaungpyei') || sText.includes('sagaing') || sText.includes('u min thonze')) {
    locationKey = 'sagaing_hill';
  } else if (sText.includes('kalaw') || sText.includes('pindaya')) {
    locationKey = 'kalaw_pindaya';
  } else if (sText.includes('pyin oo lwin') || sText.includes('pyinoolwin') || sText.includes('kandawgyi')) {
    locationKey = 'pyinoolwin_garden';
  } else if (sText.includes('ngapali') || sText.includes('chaung tha') || sText.includes('ngwesaung')) {
    locationKey = 'ngapali_beach';
  } else if (sText.includes('myeik') || sText.includes('mergui') || sText.includes('archipelago')) {
    locationKey = 'myeik_islands';
  } else if (sText.includes('taunggyi') || sText.includes('balloon') || sText.includes('tazaungdaing')) {
    locationKey = 'taunggyi_balloon_field';
  } else if (sText.includes('chin') || sText.includes('victoria') || sText.includes('nat ma taung')) {
    locationKey = 'chin_mountains';
  } else if (sText.includes('kyaiktiyo') || sText.includes('golden rock')) {
    locationKey = 'kyaiktiyo_golden_rock';
  } else if (sText.includes('riverside') || sText.includes('ayeyarwady') || sText.includes('jetty') || sText.includes('yangon river')) {
    locationKey = 'riverside_sunset';
  } else if (sText.includes('monastery') || sText.includes('dhamma hall') || sText.includes('kyaung')) {
    locationKey = 'monastery_temple_hall';
  } else if (sText.includes('mrauk-u') || sText.includes('mrauk u') || sText.includes('shittaung') || sText.includes('kothaung')) {
    locationKey = 'mrauk_u_temples';
  } else if (sText.includes('u bein') || sText.includes('ubein') || sText.includes('amarapura') || sText.includes('taungthaman')) {
    locationKey = 'ubein_bridge';
  } else if (sText.includes('hpa-an') || sText.includes('hpa an') || sText.includes('sadan') || sText.includes('zwekabin')) {
    locationKey = 'hpa_an_caves';
  } else if (sText.includes('paris') || sText.includes('eiffel')) {
    locationKey = 'paris_eiffel_tower';
  } else if (sText.includes('santorini') || sText.includes('oia')) {
    locationKey = 'santorini_greece';
  } else if (sText.includes('kyoto') || sText.includes('arashiyama') || sText.includes('torii')) {
    locationKey = 'kyoto_bamboo_torii';
  } else if (sText.includes('swiss') || sText.includes('alps')) {
    locationKey = 'swiss_alps_snow';
  } else if (sText.includes('venice') || sText.includes('gondola')) {
    locationKey = 'venice_gondola_canal';
  } else if (sText.includes('taj mahal')) {
    locationKey = 'taj_mahal_palace';
  } else if (sText.includes('bali') || sText.includes('ubud')) {
    locationKey = 'bali_jungle_swing';
  } else if (sText.includes('maldives') || sText.includes('bungalow')) {
    locationKey = 'maldives_overwater';
  } else if (sText.includes('cappadocia')) {
    locationKey = 'cappadocia_balloons';
  } else if (sText.includes('central park')) {
    locationKey = 'ny_central_park';
  } else if (scene.category === 'wedding_prewedding') {
    locationKey = 'luxury_hotel_ballroom';
  } else if (scene.category === 'fashion_commercial') {
    locationKey = 'wood_brick_studio';
  } else if (scene.category === 'baby_family') {
    locationKey = 'traditional_myanmar_house';
  } else if (sText.includes('paddy') || sText.includes('harvest') || sText.includes('field')) {
    locationKey = 'golden_hour_paddy_field';
  } else if (sText.includes('stream') || sText.includes('waterfall') || sText.includes('forest')) {
    locationKey = 'lush_forest_stream';
  } else if (sText.includes('cherry blossom') || sText.includes('sakura')) {
    locationKey = 'cherry_blossom_garden';
  } else if (sText.includes('cyberpunk') || sText.includes('neon')) {
    locationKey = 'neon_city_night';
  }

  // 2. Fetch rich architectural details from taxonomy (Anti-Hallucination)
  const locTax = LOCATION_TAXONOMY_MAP[locationKey] || resolveLocationDescription(scene.id, scene.id);
  const locationDetails = locTax.en;

  // 3. Precise Time-of-Day derivation
  let timeOfDay = 'golden_hour';
  if (sText.includes('night') || sText.includes('moonlit') || sText.includes('candle') || sText.includes('lantern') || sText.includes('oil lamp')) {
    timeOfDay = 'night';
  } else if (sText.includes('twilight') || sText.includes('blue hour') || sText.includes('dusk')) {
    timeOfDay = 'twilight';
  } else if (sText.includes('dawn') || sText.includes('sunrise') || sText.includes('misty dawn') || sText.includes('early morning')) {
    timeOfDay = 'early_morning';
  } else if (sText.includes('high noon') || sText.includes('noon') || sText.includes('midday') || scene.sunDirection === 'overhead') {
    timeOfDay = 'high_noon';
  } else {
    timeOfDay = 'golden_hour';
  }

  // 4. Precise Mood & Atmosphere derivation
  let mood = 'royal_majestic';
  if (sText.includes('rain') || sText.includes('monsoon') || sText.includes('wet') || sText.includes('puddle')) {
    mood = 'monsoon_rain';
  } else if (sText.includes('mist') || sText.includes('fog') || sText.includes('haze') || scene.atmosphere === 'dreamy_mist') {
    mood = 'misty_morning';
  } else if (sText.includes('wind') || sText.includes('breeze') || sText.includes('windswept')) {
    mood = 'breezy_windswept';
  } else if (sText.includes('candle') || sText.includes('oil lamp') || sText.includes('lantern') || timeOfDay === 'night') {
    mood = 'candlelit_intimate';
  } else if (sText.includes('vintage') || sText.includes('sepia') || sText.includes('1940') || sText.includes('retro')) {
    mood = 'vintage_nostalgic';
  } else if (sText.includes('balloon') || sText.includes('festival') || sText.includes('celebration')) {
    mood = 'festive_vibrant';
  } else if (sText.includes('spiritual') || sText.includes('peaceful') || sText.includes('serene') || sText.includes('sacred')) {
    mood = 'serene_spiritual';
  } else if (scene.atmosphere === 'luxury_gilded' || scene.category === 'heritage_myanmar') {
    mood = 'royal_majestic';
  } else {
    mood = 'serene_spiritual';
  }

  // 5. Harmonize or Build Rich Master Generation Prompt
  let prompt = '';
  const cleanScenePrompt = scene.prompt.replace(/\s+/g, ' ').trim();
  const cleanLighting = scene.lightingNotes.replace(/\s+/g, ' ').trim();

  if (existingPrompt && existingPrompt.trim()) {
    const rawExisting = existingPrompt.trim();
    const isFamily = /\b(family|parents|father|mother|children|kids|baby|toddler|grandparents|family\s*portrait|group\s*photo|group\s*portrait|multiple\s*people|three\s*people|four\s*people|five\s*people|six\s*people|မိသားစု|သားသမီး|မိဘ|မိဘသားသမီး|မိသားစုလိုက်)\b/i.test(rawExisting) || scene.category === 'baby_family';
    const isCouple = (/\b(couple|two\s*people|two\s*persons|bride\s*and\s*groom|groom\s*and\s*bride|husband\s*and\s*wife|man\s*and\s*woman|two\s*subjects|စုံတွဲ|ဇနီးမောင်နှံ|မောင်နှံ)\b/i.test(rawExisting) || scene.category === 'wedding_prewedding') && !isFamily;

    const defaultSubj = isFamily
      ? 'Authentic Myanmar family (parents and children) together, natural skin micro-pores, preserved individual facial identities and likeness for all family members'
      : isCouple
      ? 'Authentic Myanmar couple (groom and bride) standing together side-by-side, natural skin micro-pores, preserved identities for both individuals'
      : 'Authentic Myanmar subject, natural skin micro-pores, preserved identity';
    const defaultAction = isFamily
      ? 'Posing warmly together as a cohesive family, smiling naturally, affectionate family bond, all individuals in crisp focus'
      : isCouple
      ? 'Standing close affectionately side-by-side, posing for a romantic portrait, both looking toward camera'
      : 'Preserving natural pose, authentic posture, relaxed expression';
    const cineDirective = isFamily
      ? 'Hasselblad X2D 100C, 45mm lens, f/4 aperture, sharp group focus framing all family members side-by-side with balanced depth of field'
      : isCouple
      ? 'Hasselblad X2D 100C, 50mm f/4 lens, wide medium shot framing both individuals side-by-side in sharp focus, balanced depth of field'
      : 'Hasselblad X2D 100C, 85mm f/1.2 lens, medium-full portrait composition, shallow depth of field';

    if (rawExisting.includes('[Subject]:')) {
      const subjMatch = rawExisting.match(/\[Subject\]:\s*([^.]+)\./i);
      const actionMatch = rawExisting.match(/\[Action\]:\s*([^.]+)\./i);
      const subjPart = subjMatch ? subjMatch[1].trim() : defaultSubj;
      const actionPart = actionMatch ? actionMatch[1].trim() : defaultAction;
      prompt = `[Subject]: ${subjPart}. [Action]: ${actionPart}. [Environment]: Set against ${locationDetails}. Architectural backdrop plate: ${cleanScenePrompt}. [Cinematography]: ${cineDirective}. [Lighting/Style]: ${cleanLighting}, natural cinematic chiaroscuro. [Technical]: 8k uhd photorealistic, professional photography, cinematic color grading, strictly avoiding Thai prang spires and Cambodian Angkor stone towers --ar 16:9`.replace(/\s+/g, ' ').trim();
    } else {
      prompt = `${rawExisting}, set against ${locationDetails}. Architectural backdrop: ${cleanScenePrompt}. Cinematography: ${cineDirective}. Lighting: ${cleanLighting}. 8k uhd photorealistic, cinematic color grading, strictly avoiding Thai prangs and Angkor stone towers --ar 16:9`.replace(/\s+/g, ' ').trim();
    }
  } else {
    const isFamily = scene.category === 'baby_family';
    const isCouple = scene.category === 'wedding_prewedding';
    const subjDirective = isFamily
      ? '[Subject]: Authentic Myanmar family (parents and children from uploaded reference photo), natural skin micro-pores, preserved individual facial likeness for all family members. [Action]: Posing warmly together as a cohesive family, smiling naturally, all individuals in sharp focus.'
      : isCouple
      ? '[Subject]: Authentic Myanmar couple (groom and bride from uploaded reference photo), natural skin micro-pores, preserved identities for both individuals. [Action]: Standing close affectionately side-by-side, posing for a romantic portrait, both looking toward camera.'
      : '[Subject]: Authentic Myanmar subject(s) (individual, couple, or family from uploaded reference photo), natural skin micro-pores, preserved facial likeness. [Action]: Preserving natural pose, authentic posture, relaxed expression.';
    const cineDirective = isFamily
      ? 'Hasselblad X2D 100C, 45mm lens, f/4 aperture, sharp group focus framing all family members side-by-side with balanced depth of field'
      : isCouple
      ? 'Hasselblad X2D 100C, 50mm f/4 lens, wide medium shot framing both individuals side-by-side in sharp focus, balanced depth of field'
      : 'Hasselblad X2D 100C, 85mm f/1.2 lens, medium-full shot composition, shallow depth of field';

    prompt = `${subjDirective} [Environment]: Set against ${locationDetails}. Architectural backdrop plate: ${cleanScenePrompt}. [Cinematography]: ${cineDirective}. [Lighting/Style]: ${cleanLighting}, authentic natural lighting. [Technical]: 8k uhd photorealistic, professional photography, cinematic color grading, strictly avoiding Thai prang spires and Cambodian Angkor stone towers --ar 16:9`.replace(/\s+/g, ' ').trim();
  }

  // 6. Assemble Background Reference Plate with strict role: 'background'
  const plateId = `scene-plate-${scene.id.replace(/[\s_]+/g, '-')}-${Date.now()}`;
  const referencePhotos = [
    {
      id: plateId,
      url: scene.previewImage,
      name: `${scene.titleEn} (Location Reference Plate)`,
      role: 'background' as const
    }
  ];

  const chosenOptions = [
    { label: 'Location', value: locationKey, emoji: '🏛️' },
    { label: 'Time of Day', value: timeOfDay, emoji: '🌅' },
    { label: 'Mood / Atmosphere', value: mood, emoji: '✨' },
    { label: 'Scene Title', value: scene.titleEn, emoji: '🎬' },
    { label: 'Scene ID', value: scene.id, emoji: '🔖' }
  ];

  return {
    prompt,
    ratio: '16:9',
    referencePhoto: scene.previewImage,
    referencePhotos,
    chosenOptions,
    locationKey,
    locationDetails,
    timeOfDay,
    mood,
    lightingNotes: cleanLighting,
    scene
  };
}

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
  scenePreviewImage?: string;
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
    const resolvedLoc = resolveLocationTaxonomy(selection?.location, selection?.selectedSceneId);
    const locMapped = resolvedLoc.en;
    const locMm = resolvedLoc.mm;
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : '';
    const lighting = resolvedLoc.lightingNotes || selection?.timeAndLighting || 'golden hour warm directional sunlight with volumetric mist';
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
      scenePreviewImage: resolvedLoc.referenceImage || selection?.selectedScenePreviewImage || undefined
    };
  }

  // 0.05 Option 3: Reference Image Outfit & Pose Handling
  if (selection?.img2imgOption === 'style_transfer') {
    const sub = selection?.subject === 'man' ? 'handsome Burmese man' : selection?.subject === 'couple' ? 'elegant Myanmar couple' : 'gorgeous Burmese woman';
    const eth = selection?.customEthnicityDetails || 'authentic Burmese / Myanmar heritage';
    const outfit = selection?.garmentStyle || 'intricate traditional Myanmar silk woven attire tailored from Reference Image';
    const pose = selection?.poseExpression || 'natural regal posture replicating Reference Image pose';
    const resolvedLoc = resolveLocationTaxonomy(selection?.location, selection?.selectedSceneId);
    const loc = resolvedLoc.en;
    const light = resolvedLoc.lightingNotes || selection?.timeAndLighting || 'soft directional Rembrandt studio lighting with warm golden rim light';
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
      scenePreviewImage: resolvedLoc.referenceImage || selection?.selectedScenePreviewImage || undefined
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

    const resolvedLoc = resolveLocationTaxonomy(selection?.location, selection?.selectedSceneId);
    const locBase = resolvedLoc.en;
    const locCustom = selection?.customLocationDetails ? `, ${selection.customLocationDetails.trim()}` : '';
    const lightBase = resolvedLoc.lightingNotes || selection?.timeAndLighting || 'warm golden hour directional key lighting with soft fill';
    const camera = selection?.camera || 'Hasselblad X2D 100C with 85mm f/1.2 portrait prime lens';
    const angle = selection?.cameraAngle && selection.cameraAngle !== 'skip' ? selection.cameraAngle : 'Medium-full shot, eye-level angle';
    const style = selection?.photoStyle || 'High-End Editorial Studio Portrait';
    const quality = selection?.qualityProfile || '8k resolution, highly detailed fabric textures, photorealistic, professional photography, cinematic color grading';

    const masterPrompt = `[Subject]: Keep the exact same person, face, facial bone structure, body proportions, and skin tone from Image 1 (100% exact face match, identical eyes nose lips, zero face alteration, preserved identity). Replace ONLY the clothing with the outfit from Image 2: ${garmentChecklist}. [Action]: Preserving the exact body posture, stance, and natural expression from Image 1. [Environment]: Set against ${locBase}${locCustom}. [Cinematography]: ${angle}, shot on ${camera}, f/2.0 aperture for shallow depth of field. [Lighting/Style]: ${lightBase}, ${style}, natural unretouched epidermal skin micro-pores. [Technical]: ${quality} --ar ${targetAr}`.replace(/\s+/g, ' ').trim();
    const negativePrompt = `different face, altered face, changed eyes, changed nose, changed lips, distorted face, facial asymmetry, face swap artifact, mismatched identity, wrong cultural clothing, Indian saree, Chinese hanfu, Thai prang spire, Thai wat architecture, Cambodian Angkor stone towers, Khmer stone ruins, plastic skin, low quality, blurry`;

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
      scenePreviewImage: resolvedLoc.referenceImage || selection?.selectedScenePreviewImage || undefined
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
  const resolvedLoc = resolveLocationTaxonomy(selection?.location, selection?.selectedSceneId);
  let locationText = `, set in ${resolvedLoc.en}`;
  let locationMm = resolvedLoc.mm;
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
  envParts.push(`A breathtaking ${resolvedLoc.en}`);
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
    : (resolvedLoc.lightingNotes || 'Golden hour natural lighting, soft warm sunlight illuminating their faces, gentle rim light on their attire from the setting sun');
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

  const negativePrompt = `different face, altered face, swapped face, distorted facial features, facial asymmetry, Indian saree, bindi, Chinese hanfu, Japanese kimono, Thai prang spire, Thai wat architecture, Cambodian Angkor stone towers, Khmer stone ruins, Western casual clothes, plastic airbrushed skin, doll face, blurry, low resolution, bad eyes, deformed hands, extra fingers, overexposed, watermark, text`;

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
    midjourneyFormat: `/imagine prompt: ${masterPrompt} --v 6.1 --style raw --no Indian saree, Chinese hanfu, Japanese kimono, Thai prang spire, Thai wat architecture, Cambodian Angkor stone towers, Khmer stone ruins, plastic skin, altered face`,
    fluxFormat: `${masterPrompt.replace(/--ar\s+[0-9:]+/gi, '').trim()}`,
    sdxlFormat: `${masterPrompt} | Camera: ${cameraNotes} | Negative: ${negativePrompt}`,
    descriptionMm,
    descriptionEn,
    cameraNotes,
    scenePreviewImage: resolvedLoc.referenceImage || selection?.selectedScenePreviewImage || undefined
  };
}
