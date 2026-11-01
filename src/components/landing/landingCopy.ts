export const landingCopy = {
  en: {
    navbar: {
      brandTitle: 'SHOW AI',
      brandSubtitle: 'Burmese Creative Suite 2.0',
      links: [
        { id: 'features', label: 'Features' },
        { id: 'suite-8step', label: '8-Step Suite' },
        { id: 'photo-studio', label: 'Photo Studio' },
        { id: 'photo-tools', label: 'AI Tools' },
        { id: 'video-studio', label: 'Video Studio' },
        { id: 'pricing', label: 'Pricing & Credits' }
      ],
      signIn: 'Sign In',
      launchApp: '🚀 Launch App'
    },
    hero: {
      badge: '⚡ SHOW AI 2.0 • BURMESE CULTURAL & COMMERCIAL AI CREATIVE SUITE',
      h1: "The World's First Archivally Accurate Burmese AI Studio",
      subheadline:
        '8-step Burmese prompt crafting → 8K photoreal images → commercial product ad posters → cinema-grade video prompts.',
      ctaPrimary: '🚀 Start Creating (Free 250 Daily Credits)',
      ctaSecondary: '▶ Watch 60s Demo',
      stats: [
        { label: 'Ethnic Tribes', value: '135' },
        { label: 'Wedding Archetypes', value: '42' },
        { label: 'Step Guided Wizard', value: '8' },
        { label: 'Optical Resolution', value: '8K' },
        { label: 'Daily Free Credits', value: '250' }
      ]
    },
    storytelling: {
      sectionBadge: 'FOUR POWERHOUSE CREATIVE ENGINES',
      sectionTitle: 'Everything You Need to Create World-Class Visuals',
      sectionSubtitle:
        'Seamlessly transition from deep ethnographic research to high-fashion commercial production and cinema-grade motion synthesis.',
      chapters: [
        {
          id: 'suite-8step',
          number: '01',
          navAnchorId: 'suite-8step' as const,
          badge: 'CULTURAL IDENTITY & COMMERCIAL POSTERS',
          title: 'Prompt Creator Suite',
          tagline: '8-Step Guided Archival & Product Wizard',
          description:
            'Craft culturally authentic prompts across 4 dedicated domains: Product Ad Posters, Characters, 42 Wedding Archetypes, and Freeform Custom Concepts. Deeply mapped with 135 Myanmar nationalities, royal dynasties, and traditional craft specifications.',
          features: [
            'Product Ad Posters with 3D typography, promotional ribbons & podiums',
            '135 Myanmar national races with heirloom silver regalia & headgear',
            'Amarapura Luntaya Acheik wave-pattern silk & Inle sacred lotus textiles',
            'Mogok untreated pigeon blood ruby torques & Imperial jadeite'
          ],
          metrics: [
            { label: 'Ethnic Groups', value: '135' },
            { label: 'Wedding Templates', value: '42' },
            { label: 'Dynasty Timelines', value: '3' }
          ]
        },
        {
          id: 'photo-studio',
          number: '02',
          navAnchorId: 'photo-studio' as const,
          badge: 'PHOTOREAL GENERATION & COMPUTER VISION',
          title: 'Photo Prompt Studio',
          tagline: 'Seedream 5.0, FLUX Photoreal & 8K CV Workstation',
          description:
            'Generate hyper-detailed 8K commercial masterpieces powered by flagship models. Refine and manipulate images with professional computer vision tools built directly into the studio workspace.',
          features: [
            'Multi-View 4 Perspectives: Instant 3x3 rotational viewing angles via Zero123Plus',
            'InsightFace-ReActor Identity Swap: Seamless high-fidelity face preservation',
            'AI Inpainting & Brush: Natural local touchups and selective element synthesis',
            'Background Replacement (RMBG-1.4) & 8K Ultra-Sharp Detail Upscaler'
          ],
          metrics: [
            { label: 'Max Resolution', value: '8K UHD' },
            { label: 'Integrated Models', value: '10+' },
            { label: 'Precision Rating', value: '99.4%' }
          ]
        },
        {
          id: 'video-studio',
          number: '03',
          navAnchorId: 'video-studio' as const,
          badge: 'CINEMATOGRAPHIC MOTION ENGINE',
          title: 'Video Prompt Studio',
          tagline: 'Precision Camera Directives for Next-Gen Video Generators',
          description:
            'Synthesize director-grade video prompts formatted specifically for OpenAI Sora, Runway Gen-3 Alpha, Luma Dream Machine, Kling 1.5, and Hailuo MiniMax with multi-axis camera motion physics.',
          features: [
            'Dynamic Camera Motions: Pan, Orbit, Drone Zoom, FPV Flythrough, Dolly, Static Master',
            'Lighting Transitions: Golden hour to twilight oil lamp candlelight continuity',
            'Atmospheric FX: Monsoon rain reflections, swirling gold dust & temple incense',
            '1-Click Export formatted for Sora, Runway, Kling, and Luma syntax'
          ],
          metrics: [
            { label: 'Motion Presets', value: '24' },
            { label: 'Video Models', value: '6' },
            { label: 'Temporal Stability', value: 'High' }
          ]
        },
        {
          id: 'cultural-inspector',
          number: '04',
          navAnchorId: 'features' as const,
          badge: 'REAL-TIME HERITAGE GUARD & SYNTHESIZER',
          title: 'Cultural Accuracy Inspector',
          tagline: 'Automated Anachronism Detection & Cross-Model Formatting',
          description:
            'Safeguard your prompts against cultural inaccuracies. The automated archival inspector continuously audits your prompt for historical conflicts (e.g., modern wristwatch detected on Konbaung court dress) and optimizes formatting.',
          features: [
            'Real-Time Anachronism Guard: Prevents modern artifacts on ancient royal attire',
            'Cross-Model Synthesizer: 1-click format for Midjourney v6.1, FLUX.1, and SDXL',
            'Negative Prompt Auto-Tuning: Strips distorted anatomy, incorrect costumes, and glare',
            'Archival Burmese terminology enrichment with instant local fallback heuristic'
          ],
          metrics: [
            { label: 'Accuracy Check', value: 'Real-Time' },
            { label: 'Syntax Formats', value: 'Midjourney/FLUX/SDXL' },
            { label: 'Verified Dynasties', value: 'Feudal to Modern' }
          ]
        }
      ]
    },
    beforeAfter: {
      badge: 'INTERACTIVE COMMERCIAL SHOWCASE',
      title: 'From Raw Asset to Award-Winning Ad Poster',
      subtitle:
        'Drag the interactive slider to see how SHOW AI transforms a plain product photo into an opulent commercial advertising campaign.',
      labelBefore: 'Raw Product Photo (Plain Backdrop)',
      labelAfter: 'AI Commercial Ad Poster (3D Gold Typography & Marble Plinth)',
      dragHint: 'Drag slider or use Arrow Keys to compare'
    },
    pricing: {
      badge: 'TRANSPARENT REWARD ECONOMY',
      title: 'Free 250 Credits Every Day. Simple Costs.',
      subtitle:
        'Every registered user automatically receives 250 free credits daily upon login. No hidden fees, instant GPU rendering.',
      costTableTitle: 'Generation Cost Breakdown',
      calculatorTitle: 'What Can I Make With My Daily 250 Credits?',
      calculatorHint: 'Drag the slider to calculate how many visual assets you can generate today:',
      tiers: [
        { resolution: '1K Standard', credits: 5, useCase: 'Rapid prompt drafting & conceptual exploration', badge: '50 Generations / Day' },
        { resolution: '2K High-Res', credits: 8, useCase: 'Social media posts, Instagram & Facebook feed', badge: '31 Generations / Day' },
        { resolution: '4K Ultra HD', credits: 12, useCase: 'Print media, lookbooks, high-fashion editorial', badge: '20 Generations / Day' },
        { resolution: '8K Masterpiece', credits: 20, useCase: 'Commercial billboard, museum print, archival detail', badge: '12 Generations / Day' },
        { resolution: 'Video Prompt', credits: 1, useCase: 'Cinema-grade Sora & Runway prompt synthesis', badge: '250 Prompts / Day' }
      ]
    },
    finalCta: {
      headline: 'Start Creating Masterpiece Prompts & Visuals Today',
      subheadline:
        'Join thousands of designers, prompt artists, and brands crafting archivally accurate Burmese cultural art and commercial graphics.',
      ctaButton: '🚀 Launch Studio Now (Free 250 Credits)',
      stickyBarText: 'Start Creating Masterpiece Prompts & Visuals Today'
    },
    footer: {
      culturalCredit:
        'SHOW AI is dedicated to the archival preservation and contemporary celebration of Myanmar’s 135 national ethnic cultures, traditional royal craftsmanship, and commercial arts.',
      copyright: `© ${new Date().getFullYear()} SHOW AI Studio. All rights reserved.`,
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      community: 'Community Hub'
    }
  },
  my: {
    navbar: {
      brandTitle: 'SHOW AI',
      brandSubtitle: 'မြန်မာ့ရိုးရာ & စီးပွားရေး AI Creative Suite 2.0', // TODO: native review
      links: [
        { id: 'features', label: 'စွမ်းဆောင်ချက်များ' }, // TODO: native review
        { id: 'suite-8step', label: 'အဆင့် ၈ ဆင့် စနစ်' }, // TODO: native review
        { id: 'photo-studio', label: 'Photo စတူဒီယို' }, // TODO: native review
        { id: 'photo-tools', label: 'AI Tools များ' },
        { id: 'video-studio', label: 'Video စတူဒီယို' }, // TODO: native review
        { id: 'pricing', label: 'Credit နှုန်းထား' } // TODO: native review
      ],
      signIn: 'အကောင့်ဝင်ရန်', // TODO: native review
      launchApp: '🚀 စတင်အသုံးပြုမည်' // TODO: native review
    },
    hero: {
      badge: '⚡ SHOW AI 2.0 • BURMESE CULTURAL & COMMERCIAL AI CREATIVE SUITE',
      h1: 'ခေတ်မီ AI နည်းပညာနှင့် မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု/စီးပွားရေး ကြော်ငြာ Poster ဖန်တီးမှု စနစ်',
      subheadline:
        'အဆင့် ၈ ဆင့် မြန်မာ့ရိုးရာ prompt ဖန်တီးမှုမှ 8K သဘာဝကျသော ပုံရိပ်များ၊ စီးပွားရေး ကုန်ပစ္စည်း ကြော်ငြာ poster များနှင့် ရုပ်ရှင်အဆင့်မီ video prompt များအထိ တစ်နေရာတည်းတွင် ဖန်တီးနိုင်ပါသည်။', // TODO: native review
      ctaPrimary: '🚀 Start Creating (Free 250 Daily Credits)',
      ctaSecondary: '▶ Watch 60s Demo',
      stats: [
        { label: 'တိုင်းရင်းသားမျိုးနွယ်', value: '135' }, // TODO: native review
        { label: 'မင်္ဂလာဝတ်စုံပုံစံ', value: '42' }, // TODO: native review
        { label: 'အဆင့်ဆင့်လမ်းညွှန်', value: '8' }, // TODO: native review
        { label: 'အကြည်လင်ဆုံးကြည်လင်မှု', value: '8K' }, // TODO: native review
        { label: 'နေ့စဉ်အခမဲ့ Credit', value: '250' } // TODO: native review
      ]
    },
    storytelling: {
      sectionBadge: 'အဓိက အဆင့်မြင့် AI စတူဒီယို ၄ မျိုး', // TODO: native review
      sectionTitle: 'ကမ္ဘာ့အဆင့်မီ Visual များ ဖန်တီးရန် လိုအပ်သမျှ အားလုံး', // TODO: native review
      sectionSubtitle:
        'မြန်မာ့သမိုင်းဝင် ရိုးရာယဉ်ကျေးမှု သုတေသနမှသည် အဆင့်မြင့် စီးပွားရေး ကြော်ငြာဒီဇိုင်းနှင့် ရုပ်ရှင်ဇာတ်ကားထုတ်လုပ်မှုအထိ ချောမွေ့စွာ ဖန်တီးနိုင်ပါသည်။', // TODO: native review
      chapters: [
        {
          id: 'suite-8step',
          number: '01',
          navAnchorId: 'suite-8step' as const,
          badge: 'CULTURAL IDENTITY & COMMERCIAL POSTERS',
          title: 'Prompt Creator Suite',
          tagline: '၈ ဆင့် လမ်းညွှန် မြန်မာ့ရိုးရာ & ကြော်ငြာ Wizard', // TODO: native review
          description:
            'Product Ad Poster များ၊ ဇာတ်ကောင်များ၊ မင်္ဂလာစုံတွဲ (၄၂ မျိုး) နှင့် စိတ်ကြိုက် visual များအတွက် သမိုင်းဝင် တိကျမှုရှိသော prompt များကို စနစ်တကျ ရေးဖွဲ့နိုင်ပါသည်။ မြန်မာတိုင်းရင်းသား ၁၃၅ မျိုး၊ နန်းတွင်းခေတ်များနှင့် ရိုးရာလက်မှုပစ္စည်းများကို အပြည့်အစုံ ထည့်သွင်းထားပါသည်။', // TODO: native review
          features: [
            '3D စာလုံး၊ လျှော့ဈေး ribbon နှင့် စင်တင်ပြကွက်ပါဝင်သော Product ကြော်ငြာ Poster များ', // TODO: native review
            'ငွေမောင်း၊ ရိုးရာခေါင်းပေါင်း အဆင်တန်ဆာစုံလင်သော တိုင်းရင်းသား ၁၃၅ မျိုး စတူဒီယို', // TODO: native review
            'အမရပူရ လွန်းရာကျော် ချိတ်ထည်များနှင့် အင်းလေးကြာချည်ထည် ရိုးရာအဆင်များ', // TODO: native review
            'မိုးကုတ် ပတ္တမြား၊ ကျောက်စိမ်း ရတနာများနှင့် သနပ်ခါး အသွေးအရောင်စစ်စစ်များ' // TODO: native review
          ],
          metrics: [
            { label: 'တိုင်းရင်းသား', value: '135' }, // TODO: native review
            { label: 'မင်္ဂလာဝတ်စုံ', value: '42' }, // TODO: native review
            { label: 'ခေတ်ကာလ', value: '3' } // TODO: native review
          ]
        },
        {
          id: 'photo-studio',
          number: '02',
          navAnchorId: 'photo-studio' as const,
          badge: 'PHOTOREAL GENERATION & COMPUTER VISION',
          title: 'Photo Prompt Studio',
          tagline: 'Seedream 5.0, FLUX Photoreal & 8K CV Workstation',
          description:
            'ထိပ်တန်း AI မော်ဒယ်များဖြင့် 8K commercial အဆင့် ပုံရိပ်များကို တိုက်ရိုက်ထုတ်လုပ်နိုင်ပါသည်။ စတူဒီယိုထဲတွင် တိုက်ရိုက်ပါဝင်သော ကွန်ပျူတာမြင်ကွင်း (CV) ကိရိယာများဖြင့် ပုံရိပ်များကို အသေးစိတ် ပြင်ဆင်နိုင်ပါသည်။', // TODO: native review
          features: [
            'Multi-View ၄ ရှုထောင့်: Zero123Plus ဖြင့် ပတ်လည် ၃၆၀ ဒီဂရီ ရှုထောင့်များကို ချက်ချင်းထုတ်လုပ်ခြင်း', // TODO: native review
            'InsightFace-ReActor Identity Swap: မျက်နှာသွင်ပြင် မူလအတိုင်း ထိန်းသိမ်းလဲလှယ်ခြင်း', // TODO: native review
            'AI Inpainting & Brush: လိုအပ်သော နေရာကိုသာ ရွေးချယ်ပြီး အသေးစိတ် ပြင်ဆင်ခြင်း', // TODO: native review
            'RMBG-1.4 နောက်ခံဖယ်ရှားလဲလှယ်ခြင်းနှင့် 8K AI အထူးကြည်လင်စေသည့် Upscaler' // TODO: native review
          ],
          metrics: [
            { label: 'အမြင့်ဆုံးကြည်လင်မှု', value: '8K UHD' }, // TODO: native review
            { label: 'ပါဝင်သော AI မော်ဒယ်', value: '10+' }, // TODO: native review
            { label: 'တိကျမှုနှုန်းထား', value: '99.4%' } // TODO: native review
          ]
        },
        {
          id: 'video-studio',
          number: '03',
          navAnchorId: 'video-studio' as const,
          badge: 'CINEMATOGRAPHIC MOTION ENGINE',
          title: 'Video Prompt Studio',
          tagline: 'ရုပ်ရှင်အဆင့်မီ Camera Directives & Video Generator', // TODO: native review
          description:
            'OpenAI Sora၊ Runway Gen-3 Alpha၊ Luma Dream Machine၊ Kling 1.5 နှင့် Hailuo MiniMax တို့အတွက် ကင်မရာ ရွေ့လျားမှုနှင့် ရုပ်ရှင်အလင်းအမှောင် prompt များကို တိကျစွာ ရေးဖွဲ့ပေးပါသည်။', // TODO: native review
          features: [
            'ကင်မရာ ရွေ့လျားမှုများ: Pan, Orbit, Drone Zoom, FPV Flythrough, Dolly, Static Master',
            'အလင်းအကူးအပြောင်း: ညနေဆည်းဆာမှ ရိုးရာဆီမီးခွက် candlelight အထိ သဘာဝကျစွာ ထိန်းသိမ်းခြင်း', // TODO: native review
            'ပတ်ဝန်းကျင် အထူးပြုချက်များ: မိုးရာသီ ရေပြင်ရောင်ပြန်ဟပ်မှု၊ ရွှေမှုန်လွင့်ပျံမှုနှင့် အမွှေးနံ့သာငွေ့', // TODO: native review
            'Sora, Runway, Kling, Luma အတွက် ၁ ချက်နှိပ် syntax export ပြုလုပ်နိုင်ခြင်း' // TODO: native review
          ],
          metrics: [
            { label: 'ကင်မရာရွေ့လျားမှု', value: '24' }, // TODO: native review
            { label: 'ဗီဒီယိုမော်ဒယ်', value: '6' }, // TODO: native review
            { label: 'တည်ငြိမ်မှု', value: 'High' } // TODO: native review
          ]
        },
        {
          id: 'cultural-inspector',
          number: '04',
          navAnchorId: 'features' as const,
          badge: 'REAL-TIME HERITAGE GUARD & SYNTHESIZER',
          title: 'Cultural Accuracy Inspector',
          tagline: 'ခေတ်ကာလ သမိုင်းဝင် တိကျမှု စစ်ဆေးရေးနှင့် Syntax Synthesizer', // TODO: native review
          description:
            'Prompt များတွင် သမိုင်းနှင့် မကိုက်ညီသော အမှားများ (ဥပမာ- ကုန်းဘောင်ခေတ် ဝတ်စုံတွင် ခေတ်သစ် လက်ပတ်နာရီ ပါဝင်နေခြင်း) ကို အလိုအလျောက် စစ်ဆေးတားဆီးပေးပြီး Midjourney v6.1၊ FLUX.1၊ SDXL ဖော်မတ်များသို့ ပြောင်းလဲပေးပါသည်။', // TODO: native review
          features: [
            'Real-Time Anachronism Guard: ရှေးဟောင်းရိုးရာ ဝတ်စုံတွင် ခေတ်သစ် အသုံးအဆောင်များ မပါအောင် ကာကွယ်ခြင်း', // TODO: native review
            'Cross-Model Synthesizer: Midjourney v6.1, FLUX.1, SDXL syntax သို့ ၁ ချက်နှိပ် ပြောင်းလဲခြင်း', // TODO: native review
            'Negative Prompt Auto-Tuning: ပုံပျက်မျက်နှာ၊ လက်ချောင်းအပိုနှင့် မသက်ဆိုင်သော အဝတ်အစားများ အလိုအလျောက် ပယ်ဖျက်ခြင်း', // TODO: native review
            'မြန်မာ့ရိုးရာ အသုံးအနှုန်းများကို ကွန်ရက်မရှိသည့်တိုင် တိကျစွာ ထည့်သွင်းပေးနိုင်သော စနစ်' // TODO: native review
          ],
          metrics: [
            { label: 'စစ်ဆေးမှုအမြန်နှုန်း', value: 'Real-Time' }, // TODO: native review
            { label: 'ထောက်ပံ့သောဖော်မတ်', value: 'Midjourney/FLUX/SDXL' }, // TODO: native review
            { label: 'စိစစ်ပြီးခေတ်များ', value: 'ရှေးခေတ်မှ ယခုခေတ်အထိ' } // TODO: native review
          ]
        }
      ]
    },
    beforeAfter: {
      badge: 'INTERACTIVE COMMERCIAL SHOWCASE',
      title: 'ရိုးရိုး ကုန်ပစ္စည်းပုံမှ အဆင့်မြင့် ကြော်ငြာ Poster သို့', // TODO: native review
      subtitle:
        'Slider ကို ဆွဲရွှေ့ကြည့်ရှုပြီး SHOW AI က ရိုးရိုး ကုန်ပစ္စည်း ဓာတ်ပုံကို ရွှေရောင် 3D စာလုံးနှင့် စကျင်ကျောက်ခုံပါဝင်သော ပရော်ဖက်ရှင်နယ် ကြော်ငြာအဖြစ် ပြောင်းလဲပေးပုံကို လက်တွေ့ကြည့်ရှုနိုင်ပါသည်။', // TODO: native review
      labelBefore: 'မူရင်း ကုန်ပစ္စည်း ဓာတ်ပုံ (Raw Asset)', // TODO: native review
      labelAfter: 'AI ကြော်ငြာ Poster (3D Gold Typography & Marble Plinth)', // TODO: native review
      dragHint: 'ဆလိုက်ဒါကို ဆွဲရွှေ့ပါ သို့မဟုတ် ကီးဘုတ် Arrow Keys များဖြင့် နှိုင်းယှဉ်ပါ' // TODO: native review
    },
    pricing: {
      badge: 'TRANSPARENT REWARD ECONOMY',
      title: 'နေ့စဉ် အခမဲ့ ၂၅၀ Credit။ ပွင့်လင်းမြင်သာသော နှုန်းထားများ။', // TODO: native review
      subtitle:
        'အကောင့်ဖွင့်ထားသော creator တိုင်း နေ့စဉ် login ဝင်တိုင်း အခမဲ့ ၂၅၀ credit အလိုအလျောက် ရရှိပါသည်။ လျှို့ဝှက်ကုန်ကျစရိတ် မရှိပါ။', // TODO: native review
      costTableTitle: 'ပုံထုတ်လုပ်မှု ကုန်ကျစရိတ် ဇယား', // TODO: native review
      calculatorTitle: 'နေ့စဉ် ၂၅၀ Credit ဖြင့် ဘာတွေ ထုတ်လုပ်နိုင်သလဲ?', // TODO: native review
      calculatorHint: 'ဆလိုက်ဒါကို ရွှေ့ပြီး ယနေ့ ထုတ်လုပ်နိုင်သော ပုံအရေအတွက်ကို တွက်ချက်ကြည့်ပါ-', // TODO: native review
      tiers: [
        { resolution: '1K Standard', credits: 5, useCase: 'အကြမ်းဖော်စပ်မှုနှင့် အမြန်ပုံထုတ်ခြင်း', badge: 'တစ်နေ့ ပုံ ၅၀ အထိ' }, // TODO: native review
        { resolution: '2K High-Res', credits: 8, useCase: 'လူမှုကွန်ရက် Instagram, Facebook post များအတွက်', badge: 'တစ်နေ့ ပုံ ၃၁ ပုံ အထိ' }, // TODO: native review
        { resolution: '4K Ultra HD', credits: 12, useCase: 'ပုံနှိပ်မီဒီယာ၊ ဖက်ရှင် Lookbook များနှင့် အထူးထုတ်ကုန်များ', badge: 'တစ်နေ့ ပုံ ၂၀ အထိ' }, // TODO: native review
        { resolution: '8K Masterpiece', credits: 20, useCase: 'ကြော်ငြာ billboard ကြီးများနှင့် ပြတိုက်အဆင့် အသေးစိတ် လက်ရာများ', badge: 'တစ်နေ့ ပုံ ၁၂ ပုံ အထိ' }, // TODO: native review
        { resolution: 'Video Prompt', credits: 1, useCase: 'ရုပ်ရှင်အဆင့်မီ Sora & Runway ဗီဒီယို prompt များ', badge: 'တစ်နေ့ ၂၅၀ ကြိမ် အထိ' } // TODO: native review
      ]
    },
    finalCta: {
      headline: 'ကမ္ဘာ့အဆင့်မီ Visual များကို ယနေ့ပင် စတင်ဖန်တီးလိုက်ပါ', // TODO: native review
      subheadline:
        'မြန်မာ့ရိုးရာ ယဉ်ကျေးမှုလက်ရာများနှင့် ခေတ်မီ စီးပွားရေး ကြော်ငြာဒီဇိုင်းများကို ဖန်တီးနေကြသော ထောင်ပေါင်းများစွာသော ဖန်တီးရှင်များနှင့် ပူးပေါင်းလိုက်ပါ။', // TODO: native review
      ctaButton: '🚀 Launch Studio Now (Free 250 Credits)',
      stickyBarText: 'Start Creating Masterpiece Prompts & Visuals Today'
    },
    footer: {
      culturalCredit:
        'SHOW AI သည် မြန်မာနိုင်ငံ၏ တိုင်းရင်းသားလူမျိုး ၁၃၅ မျိုးတို့၏ ရိုးရာယဉ်ကျေးမှု၊ နန်းတွင်းလက်မှုပညာနှင့် ခေတ်မီအနုပညာများကို သမိုင်းဝင် တိကျစွာ ထိန်းသိမ်းမြှင့်တင်ရန် ရည်ရွယ်ပါသည်။', // TODO: native review
      copyright: `© ${new Date().getFullYear()} SHOW AI Studio. မူပိုင်ခွင့်များ ရယူပြီး။`, // TODO: native review
      privacy: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ', // TODO: native review
      terms: 'အသုံးပြုမှု စည်းမျဉ်းများ', // TODO: native review
      community: 'ဖန်တီးရှင် ကွန်မြူနတီ' // TODO: native review
    }
  }
};

export const LANDING_COPY = landingCopy;
