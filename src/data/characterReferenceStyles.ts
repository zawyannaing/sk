export interface CharacterReferenceStyle {
  id: string;
  name: string;
  category: 'animation' | 'ancient' | 'historical' | 'fantasy';
  badge: string;
  badgeColor: string;
  icon: string;
  snippet: string;
  desc: string;
}

export const CHARACTER_REFERENCE_STYLES: CharacterReferenceStyle[] = [
  // ==========================================
  // 1-8: ANCIENT MAN & ANCIENT FIGURES
  // ==========================================
  {
    id: 'ancient-sage',
    name: 'Ancient Wise Sage (Ancient Man)',
    category: 'ancient',
    badge: 'ANCIENT MAN',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-600/50',
    icon: 'elderly',
    snippet: 'venerable ancient elder with long flowing silver beard, weathered contemplative facial wrinkles, coarse hand-woven unbleached linen tunic, holding weathered gnarled olive wood staff, warm golden-hour temple courtyard illumination, photorealistic 8k portrait',
    desc: 'Venerable bearded elder with serene wisdom and coarse linen tunic'
  },
  {
    id: 'ancient-spartan',
    name: 'Ancient Spartan Hoplite',
    category: 'ancient',
    badge: 'ANCIENT WARRIOR',
    badgeColor: 'bg-red-950/60 text-red-300 border-red-600/50',
    icon: 'shield',
    snippet: 'battle-hardened ancient Spartan hoplite warrior, hammered bronze Corinthian helmet with crimson horsehair crest, scarred muscular torso, crimson wool cloak draped over shoulder, dramatic low-key chiaroscuro side lighting',
    desc: 'Hammered bronze Corinthian helmet, battle scars, and crimson mantle'
  },
  {
    id: 'ancient-pharaoh',
    name: 'Ancient Egyptian Pharaoh',
    category: 'ancient',
    badge: 'ANCIENT ROYAL',
    badgeColor: 'bg-yellow-950/60 text-yellow-300 border-yellow-600/50',
    icon: 'crown',
    snippet: 'regal ancient Egyptian pharaoh, striped golden Nemes headdress, ornate broad collar inlaid with lapis lazuli and turquoise, kohl-rimmed commanding gaze, torchlit stone relief temple',
    desc: 'Gold and lapis lazuli royal headdress with ceremonial poise'
  },
  {
    id: 'ancient-centurion',
    name: 'Ancient Roman Centurion',
    category: 'ancient',
    badge: 'ANCIENT ROME',
    badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-600/50',
    icon: 'military_tech',
    snippet: 'commanding ancient Roman centurion, polished lorica segmentata segmented steel plate armor, transverse red horsehair helmet crest, embossed pugio dagger at hip, classical marble forum backdrop',
    desc: 'Disciplined Roman officer in polished segmented armor'
  },
  {
    id: 'ancient-druid',
    name: 'Ancient Celtic Druid (Ancient Mystic)',
    category: 'ancient',
    badge: 'ANCIENT MYSTIC',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50',
    icon: 'forest',
    snippet: 'ancient Celtic druid elder with weathered features, crown of intertwined oak leaves and antlers, moss-green rough woolen hooded robe, ancient spiral runic woad face markings, misty stone circle at dawn',
    desc: 'Misty monolithic priest with oak leaves and woad markings'
  },
  {
    id: 'ancient-viking',
    name: 'Ancient Norse Viking Jarl',
    category: 'ancient',
    badge: 'ANCIENT NORSE',
    badgeColor: 'bg-blue-950/60 text-cyan-300 border-cyan-600/50',
    icon: 'ac_unit',
    snippet: 'weather-beaten ancient Norse jarl, braided frost-dusted beard, heavy wolf-pelt mantle over chainmail hauberk, engraved silver oath-rings, piercing ice-blue eyes, windy fjord atmospheric mist',
    desc: 'Braided silver beard, wolf pelt mantle, and icy gaze'
  },
  {
    id: 'ancient-mesopotamian',
    name: 'Ancient Mesopotamian Scholar',
    category: 'ancient',
    badge: 'ANCIENT SCHOLAR',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-600/50',
    icon: 'history_edu',
    snippet: 'ancient Babylonian astronomer-philosopher, curled oil-scented black beard, fringed woolen kaunakes shawl, holding stylus and inscribed cuneiform clay tablet, brass celestial astrolabe beside clay oil lamp',
    desc: 'Babylonian astronomer with cuneiform clay tablet and astrolabe'
  },
  {
    id: 'ancient-desert-nomad',
    name: 'Ancient Desert Bedouin Elder',
    category: 'ancient',
    badge: 'DESERT ELDER',
    badgeColor: 'bg-stone-900/80 text-stone-300 border-stone-500/50',
    icon: 'terrain',
    snippet: 'ancient desert nomad patriarch, sun-etched leathery face, indigo tagelmust turban veil framing piercing sun-lit eyes, rough camel-wool djellaba, glowing golden desert dunes at crimson twilight',
    desc: 'Sun-weathered desert elder in indigo desert veil'
  },

  // ==========================================
  // 9-14: ANIMATION & CARTOON/ANIME STYLES
  // ==========================================
  {
    id: 'pixar-3d-anim',
    name: 'Pixar 3D CGI Animation',
    category: 'animation',
    badge: '3D ANIMATION',
    badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-600/50',
    icon: 'animation',
    snippet: 'charming Disney-Pixar stylized 3D character design, appealing exaggerated facial silhouette, soft subsurface scattering skin texture, realistic tactile thread weaves on clothing, ray-traced subsurface bounce lighting, award-winning 3D feature animation render',
    desc: 'Expressive Pixar character silhouette with tactile fabric weaves'
  },
  {
    id: 'ghibli-2d-anime',
    name: 'Studio Ghibli Hand-Drawn Anime',
    category: 'animation',
    badge: 'GHIBLI 2D',
    badgeColor: 'bg-teal-950/60 text-teal-300 border-teal-600/50',
    icon: 'brush',
    snippet: 'classic Hayao Miyazaki Studio Ghibli anime cel style, delicate clean pencil contour lines, lush gouache watercolor aesthetic, gentle expressive eyes, fluttering loose clothing in a meadow breeze, nostalgic animated film still',
    desc: 'Nostalgic 2D hand-painted gouache and delicate pencil lines'
  },
  {
    id: 'shinkai-vibrant-anime',
    name: 'Makoto Shinkai Vibrant Anime',
    category: 'animation',
    badge: 'SHINKAI ANIME',
    badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-600/50',
    icon: 'wb_sunny',
    snippet: 'modern high-budget cinematic anime film aesthetic in the style of Makoto Shinkai, luminous chromatic lighting, intense optical lens flares, hyper-detailed glistening rain droplets and cloudscapes, vivid saturated palette',
    desc: 'Luminous sky reflections and chromatic cinematic lighting'
  },
  {
    id: 'retro-90s-anime',
    name: '90s Retro Cyberpunk Anime Cel',
    category: 'animation',
    badge: 'RETRO ANIME',
    badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-600/50',
    icon: 'terminal',
    snippet: 'vintage 1990s retro anime aesthetic, physical celluloid film grain, high-contrast black ink brushwork, glowing neon chromatic abberation shadows, classic mecha cyberware detailing like Akira and Ghost in the Shell',
    desc: '1990s vintage cel animation with dark ink shadows and film grain'
  },
  {
    id: 'spiderverse-comic',
    name: 'Spider-Verse Comic Pop Animation',
    category: 'animation',
    badge: 'COMIC ANIMATION',
    badgeColor: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-600/50',
    icon: 'grain',
    snippet: 'stylized Spider-Verse multiverse comic animation, dynamic halftone screen-tone dot patterns, chromatic offset fringing, hand-drawn ink hatching lines, kinetic stylized lighting and street graffiti palette',
    desc: 'Halftone Ben-Day dots, chromatic glitch, and dynamic ink lines'
  },
  {
    id: 'stop-motion-clay',
    name: 'Stop-Motion Claymation Puppet',
    category: 'animation',
    badge: 'STOP MOTION',
    badgeColor: 'bg-lime-950/60 text-lime-300 border-lime-600/50',
    icon: 'fingerprint',
    snippet: 'authentic stop-motion claymation miniature character, tactile thumbprint indentations on matte plasticine surface, miniature stitched felt garment, shallow macro depth of field, real studio spotlight key light, Aardman and Laika aesthetic',
    desc: 'Tactile plasticine clay with handmade felt clothing'
  },

  // ==========================================
  // 15-20: HISTORICAL, FANTASY & SCI-FI ARCHETYPES
  // ==========================================
  {
    id: 'feudal-samurai',
    name: 'Feudal Japanese Samurai',
    category: 'historical',
    badge: 'FEUDAL SAMURAI',
    badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-600/50',
    icon: 'sports_martial_arts',
    snippet: 'stoic feudal Japanese samurai warrior, weathered indigo silk haori over lacquered sode shoulder armor, tattered straw bamboo kasa hat, hand-forged katana tucked in obi sash, drifting crimson maple leaves',
    desc: 'Lacquered armor, indigo haori, and hand-forged katana'
  },
  {
    id: 'cyberpunk-nomad',
    name: 'Cyberpunk Street Ronin',
    category: 'fantasy',
    badge: 'CYBER RONIN',
    badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50',
    icon: 'memory',
    snippet: 'futuristic cyberpunk street ronin, sleek carbon-fiber half-mask with glowing cyan breath-valves, neon optic ocular mono-lens, weatherproof matte black tactical techwear duster, rain-slicked neon street',
    desc: 'Carbon-fiber face mask, glowing ocular lens, and techwear coat'
  },
  {
    id: 'medieval-knight',
    name: 'Medieval Gothic Armored Knight',
    category: 'historical',
    badge: 'GOTHIC KNIGHT',
    badgeColor: 'bg-slate-900/80 text-slate-200 border-slate-600/50',
    icon: 'shield_with_heart',
    snippet: 'noble medieval knight encased in mirror-polished fluted Gothic plate armor with gold filigree trim, chainmail collar, resting hands on pommel of two-handed longsword, atmospheric cathedral god-rays',
    desc: 'Fluted gothic steel plate armor with gold engravings'
  },
  {
    id: 'victorian-steampunk',
    name: 'Victorian Steampunk Inventor',
    category: 'fantasy',
    badge: 'STEAMPUNK',
    badgeColor: 'bg-amber-950/60 text-amber-200 border-amber-600/50',
    icon: 'settings',
    snippet: 'eccentric Victorian steampunk artisan, multi-lens brass ocular magnifying goggles, distressed leather apron over rolled-up linen shirt, copper vacuum-tube gadget strapped to forearm, warm incandescent workshop',
    desc: 'Brass multi-lens goggles, copper gadgets, and leather apron'
  },
  {
    id: 'celestial-archmage',
    name: 'Celestial High Fantasy Archmage',
    category: 'fantasy',
    badge: 'CELESTIAL MAGE',
    badgeColor: 'bg-violet-950/60 text-violet-300 border-violet-600/50',
    icon: 'flare',
    snippet: 'ethereal high fantasy archmage, luminescent silver arcane glyphs glowing gently across cheekbones, flowing velvet robes embroidered with star constellations, floating orbital levitating crystal orb',
    desc: 'Constellation velvet robes and glowing facial arcane glyphs'
  },
  {
    id: 'gothic-vampire',
    name: 'Dark Gothic Vampire Aristocrat',
    category: 'fantasy',
    badge: 'GOTHIC NOIR',
    badgeColor: 'bg-red-950/80 text-red-200 border-red-500/50',
    icon: 'nights_stay',
    snippet: 'aristocratic dark gothic vampire lord, alabaster porcelain skin, sharp sculpted cheekbones, high-collared crimson damask velvet frock coat, antique silver signet ring, candlelit baroque castle library',
    desc: 'Alabaster skin, crimson velvet frock coat, and baroque aura'
  }
];
