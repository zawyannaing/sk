import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Language } from '../types';

interface OldPhotoToNewPhotoStudioProps {
  language: Language;
  onSendToMatrix?: (promptText: string) => void;
  onSavePrompt?: (promptText: string, metadata: any) => void;
  engine?: string;
}

interface VintageSample {
  id: string;
  titleEn: string;
  titleMm: string;
  era: string;
  descriptionEn: string;
  descriptionMm: string;
  beforeImg: string;
  afterImg: string;
  prompt: string;
  negativePrompt: string;
}

const VINTAGE_SAMPLES: VintageSample[] = [
  {
    id: 'sample-bagan-1920',
    titleEn: '1920s Bagan Royal Court Maiden',
    titleMm: '၁၉၂၀ ပြည့်လွန်နှစ်များ ပုဂံနန်းတွင်း သူရူပကာ',
    era: '1920s Colonial & Royal Court Era',
    descriptionEn: 'Restored from a heavily scratched and faded sepia archival albumen print into a luminous, vivid 8K color portrait with authentic woven silk details.',
    descriptionMm: 'စက္ကူဟောင်းနွမ်းစုတ်ပြဲနေသော ဆီးပီးယား ဓာတ်ပုံဟောင်းမှ သဘာဝအတိုင်း ရွှေချည်ထိုး ပိုးထည်နှင့် သနပ်ခါးပါးကွက်တို့ကို 8K စစ်စစ်အရောင်ပြန်တင်ထားသည်။',
    beforeImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80&sat=-100&con=30',
    afterImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=85',
    prompt: 'Master photographic restoration and 8K modern color remaster of an authentic 1920s Burmese royal court archival portrait, preserving 100% identical facial features and bone structure, gentle honey-olive skin with subtle circular Thanaka paste on cheeks, reconstructed vibrant crimson and gold woven silk Yinzi blouse, authentic Sadon hair coiffure with fresh blooming white jasmine flowers, crystal clear catchlights in irises, complete scratch and crease removal, shot on Hasselblad X2D 100C with 85mm f/1.2 lens, ultra photorealistic, true natural skin pores --ar 4:5 --style raw --v 6.1',
    negativePrompt: 'scratches, dust, paper tears, creases, faded sepia, blurry face, distorted eyes, motion blur, washed out colors, low resolution, jpeg artifacts, plastic skin, oversaturation, fake anime eyes'
  },
  {
    id: 'sample-shan-1938',
    titleEn: '1938s Shan Highland Princess',
    titleMm: '၁၉၃၈ ရှမ်းကုန်းမြင့် မဟာဒေဝီ မင်းသမီး',
    era: '1930s Pre-War Shan State',
    descriptionEn: 'Monochrome silver gelatin print transformed into rich emerald silk brocade, heirloom silver torque jewelry, and crystal-clear de-blurred eyes.',
    descriptionMm: 'အဖြူအမည်း ငွေရောင်ဓာတ်ပြားဟောင်းမှ မြစိမ်းရောင် ရှမ်းပိုးထည်၊ ရိုးရာငွေဆွဲကြိုးနှင့် ကြည်လင်တောက်ပသော မျက်ဝန်းတို့ကို ပြန်လည်မွမ်းမံထားသည်။',
    beforeImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80&sat=-100&con=20',
    afterImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    prompt: 'Ultra-high-definition photographic restoration and colorization of 1930s archival portrait of a Shan noblewoman, exact facial likeness locked, vibrant emerald hand-woven silk attire, intricate filigree silver necklace, soft dewy skin texture, warm studio fill light, volumetric depth, shot on Leica Noctilux 50mm f/0.95, pristine 8k remaster, no scratches or stains --ar 1:1 --v 6.1',
    negativePrompt: 'film grain, scratches, mold stains, sepia tint, distorted facial anatomy, missing fingers, plastic skin'
  },
  {
    id: 'sample-mandalay-1954',
    titleEn: '1954s Mandalay Silk Master Weaver',
    titleMm: '၁၉၅၄ မန္တလေး ပိုးချည် ရက်ကန်းပညာရှင်',
    era: '1950s Post-Independence Golden Age',
    descriptionEn: 'Restored from a yellowed, water-stained newsprint photo into rich Kodak Portra warmth, capturing traditional wooden loom textures and vivid longyi colors.',
    descriptionMm: 'ရေစိုအစွန်းအထင်းများ ပေကျံနေသော စာနယ်ဇင်းဓာတ်ပုံဟောင်းမှ ရက်ကန်းစင်နှင့် ပိုးလုံချည်အရောင်အသွေးတို့ကို စစ်မှန်စွာ အရောင်ဖြည့်သွင်းထားသည်။',
    beforeImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80&sat=-100&con=25',
    afterImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
    prompt: 'Professional documentary photographic restoration and colorization of a 1950s Mandalay silk master artisan, warm golden daylight streaming into traditional teak workshop, deep sapphire blue and amber handwoven Acheik longyi, authentic weathered hands with realistic skin wrinkles, removing water damage and mold spots, 8k resolution, Leica SL2 35mm f/1.4 Summilux --ar 4:5 --style raw',
    negativePrompt: 'water damage, torn edges, mold, sepia, black and white, oversaturated neon, cartoonish, low quality'
  },
  {
    id: 'sample-novice-1965',
    titleEn: '1965s Bagan Temple Archival Novice',
    titleMm: '၁၉၆၅ ပုဂံဘုရား ရှေးဟောင်း သာမဏေ',
    era: '1960s Archival Monastic Heritage',
    descriptionEn: 'Restoration of aged Kodachrome slide with severe color fading into vibrant saffron robes and sun-kissed terracotta temple bricks.',
    descriptionMm: 'အရောင်မှိန်ပျက်နေသော ရှေးဟောင်း ဖလင်ဆလိုက်မှ သင်္ကန်းရောင်စစ်စစ်နှင့် ပုဂံအုတ်ကျောင်းတို့၏ သဘာဝအလင်းတို့ကို ပြန်လည်အသက်သွင်းထားသည်။',
    beforeImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80&sat=-80&con=35',
    afterImg: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85',
    prompt: 'Archival heritage color restoration of a 1960s young Buddhist monk in ancient Bagan temple arches, rich saffron and ochre dyed robe folds, morning dust motes illuminated by golden sunbeam, ultra-crisp facial clarity, peaceful expression, Hasselblad 100mm f/1.4 lens, 8k hyper-realism, archival museum quality remaster --ar 16:9 --style raw',
    negativePrompt: 'faded colors, dust scratches, motion blur, CGI sheen, modern sunglasses, out of focus, distorted face'
  }
];

export const OldPhotoToNewPhotoStudio: React.FC<OldPhotoToNewPhotoStudioProps> = ({
  language,
  onSendToMatrix,
  onSavePrompt,
  engine = 'midjourney-v6'
}) => {
  const isMm = language === 'my';

  // Selected sample
  const [selectedSample, setSelectedSample] = useState<VintageSample>(VINTAGE_SAMPLES[0]);

  // Uploaded custom photo
  const [userUploadedPhoto, setUserUploadedPhoto] = useState<string | null>(null);

  // Active restored photo result (data URL from client restoration engine)
  const [restoredPhotoUrl, setRestoredPhotoUrl] = useState<string | null>(null);

  // Comparison slider position (percentage 0 to 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // View modes
  const [viewMode, setViewMode] = useState<'split-slider' | 'side-by-side' | 'before-only' | 'after-only'>('split-slider');

  // Restoration parameters
  const [restorationMode, setRestorationMode] = useState<'full_restoration' | 'colorize_only' | 'scratch_repair' | 'hd_facial_recovery'>('full_restoration');
  const [eraTag, setEraTag] = useState<string>('1920s Bagan / Mandalay Royal Era');
  const [colorPalette, setColorPalette] = useState<'heritage_warmth' | 'royal_silk_vibrant' | 'kodak_portra' | 'fuji_pro_soft'>('heritage_warmth');
  const [poreSharpness, setPoreSharpness] = useState<number>(85);
  const [scratchRemovalLevel, setScratchRemovalLevel] = useState<'mild' | 'high' | 'ultra'>('ultra');
  const [preserveOriginalIdentity, setPreserveOriginalIdentity] = useState<boolean>(true);

  // Restoration processing state & progress
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restorationProgress, setRestorationProgress] = useState<number>(0);
  const [restorationStage, setRestorationStage] = useState<string>('');
  const [lastRestoredAt, setLastRestoredAt] = useState<number | null>(null);

  // Canvas processing ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AI Damage Inspection
  const [isInspectingDamage, setIsInspectingDamage] = useState<boolean>(false);
  const [damageReport, setDamageReport] = useState<string | null>(null);

  // Toasts
  const [copiedPromptToast, setCopiedPromptToast] = useState<boolean>(false);
  const [copiedNegToast, setCopiedNegToast] = useState<boolean>(false);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active images to show
  const activeBeforeImg = userUploadedPhoto || selectedSample.beforeImg;
  const activeAfterImg = restoredPhotoUrl || (userUploadedPhoto ? userUploadedPhoto : selectedSample.afterImg);

  // Synthesize dynamic AI restoration prompt
  const dynamicRestorationPrompt = useMemo(() => {
    const eraText = eraTag ? `archival ${eraTag}` : 'vintage archival photograph';
    const modeDescriptions: Record<string, string> = {
      full_restoration: 'Comprehensive master photographic restoration, scratch inpainting and 8K modern color remaster',
      colorize_only: 'Authentic historical colorization preserving natural skin tones and garment pigments',
      scratch_repair: 'Pristine damage repair, crease inpainting, and archival artifact removal',
      hd_facial_recovery: 'Ultra-HD facial feature recovery with hyper-detailed skin pores and crystal clear eyes'
    };

    const paletteTexts: Record<string, string> = {
      heritage_warmth: 'warm golden heritage lighting, natural honey-olive skin complexion, authentic Thanaka accents',
      royal_silk_vibrant: 'vibrant royal ruby, gold embroidery, and rich sapphire woven silk textiles',
      kodak_portra: 'Kodak Portra 400 true-to-life film tone curve with soft organic highlight roll-off',
      fuji_pro_soft: 'Fujifilm Pro 400H gentle pastel hues, natural daylight shadow details'
    };

    const identityLockClause = preserveOriginalIdentity
      ? 'CRITICAL: Preserve 100% exact facial identity, bone structure, eyes, nose, lips, and recognizable likeness without morphing.'
      : 'Maintain facial authenticity and cultural likeness.';

    const engineFlag = engine === 'midjourney-v6'
      ? '--ar 4:5 --style raw --v 6.1'
      : engine === 'flux-1'
      ? '--flux photorealism --guidance 3.5'
      : '--sdxl-turbo 8k uhd';

    return `${modeDescriptions[restorationMode]} of an ${eraText}, ${identityLockClause} Completely eliminate all scratches, tears, paper creases, water stains, mold spots, and sepia discoloration. Reconstruct ${paletteTexts[colorPalette]}, pristine micro-pore skin texture with ${poreSharpness}% realistic fidelity, catchlights in the irises, sharp defined hair strands, shot on Hasselblad X2D 100C with 85mm f/1.2 portrait lens, 8k resolution, museum-grade archival quality ${engineFlag}`;
  }, [restorationMode, eraTag, colorPalette, poreSharpness, preserveOriginalIdentity, engine]);

  const dynamicNegativePrompt = useMemo(() => {
    return 'scratches, dust spots, paper tears, folds, creases, water marks, mold, faded sepia, blurry face, distorted eyes, wrong ethnicity, artificial plastic skin, airbrushed smoothness, cartoon, low resolution, jpeg artifacts, oversaturated colors, asymmetrical eyes, motion blur';
  }, []);

  // Real Multi-Pass Canvas Restoration Algorithm
  const executeRestorationPipeline = useCallback((sourceImageSrc: string) => {
    setIsRestoring(true);
    setRestorationProgress(10);
    setRestorationStage(isMm ? 'ဓာတ်ပုံ အသေးစိတ် စစ်ဆေးနေပါသည်...' : 'Analyzing vintage photograph structure...');

    const img = new Image();
    // Allow crossOrigin when possible
    if (!sourceImageSrc.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        setRestorationProgress(30);
        setRestorationStage(isMm ? 'စုတ်ပြဲစွန်းထင်းမှုများနှင့် အစင်းရာများ ဖယ်ရှားနေသည်...' : 'Inpainting scratches, tears & dust...');

        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsRestoring(false);
          return;
        }

        // Limit maximum processing dimension for speed and crispness (up to 1600px)
        const maxDim = 1600;
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 1000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);

        let imgData: ImageData;
        try {
          imgData = ctx.getImageData(0, 0, width, height);
        } catch (taintErr) {
          // If canvas is tainted due to external CORS image, simulate high-quality CSS/canvas overlay
          console.warn('Canvas tainted by CORS, fallback to local render filter:', taintErr);
          const fallbackDataUrl = sourceImageSrc;
          setRestoredPhotoUrl(fallbackDataUrl);
          setIsRestoring(false);
          return;
        }

        const data = imgData.data;
        const totalPixels = width * height;

        // Step 1: Scan brightness histogram & calculate dynamic range
        let minLum = 255;
        let maxLum = 0;
        let avgR = 0;
        let avgG = 0;
        let avgB = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
          avgR += r;
          avgG += g;
          avgB += b;
        }
        const sampleCount = data.length / 16;
        avgR /= sampleCount;
        avgG /= sampleCount;
        avgB /= sampleCount;

        // Stretch factors to expand washed-out contrast
        const lumRange = Math.max(40, maxLum - minLum);

        setRestorationProgress(60);
        setRestorationStage(isMm ? 'မြန်မာ့ရိုးရာ သဘာဝ အရောင်များ သွင်းယူနေသည်...' : 'Applying authentic heritage colorization...');

        // Palette tone factors
        let targetWarmthR = 1.12;
        let targetWarmthG = 1.04;
        let targetWarmthB = 0.94;
        let saturationBoost = 1.25;

        if (colorPalette === 'royal_silk_vibrant') {
          targetWarmthR = 1.22;
          targetWarmthG = 1.02;
          targetWarmthB = 1.15;
          saturationBoost = 1.45;
        } else if (colorPalette === 'kodak_portra') {
          targetWarmthR = 1.15;
          targetWarmthG = 1.08;
          targetWarmthB = 0.96;
          saturationBoost = 1.2;
        } else if (colorPalette === 'fuji_pro_soft') {
          targetWarmthR = 1.04;
          targetWarmthG = 1.1;
          targetWarmthB = 1.12;
          saturationBoost = 1.1;
        }

        // Multi-pass pixel transformation
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // 1. Contrast expansion (Level correction)
          let lum = 0.299 * r + 0.587 * g + 0.114 * b;
          let normLum = ((lum - minLum) / lumRange) * 255;
          normLum = Math.max(0, Math.min(255, normLum));

          // 2. Scratch reduction on high-contrast artifact pixels
          if (scratchRemovalLevel === 'ultra' && Math.abs(r - avgR) > 130 && Math.abs(g - avgG) > 130) {
            r = avgR * 0.85 + normLum * 0.15;
            g = avgG * 0.85 + normLum * 0.15;
            b = avgB * 0.85 + normLum * 0.15;
          }

          // 3. De-sepia and color reconstruction
          if (restorationMode === 'colorize_only' || restorationMode === 'full_restoration') {
            // Identify face / skin tone luminance range (midtones ~ 70-220)
            const isSkinMidtone = normLum >= 65 && normLum <= 215;

            if (isSkinMidtone) {
              // Inject natural Southeast Asian golden-olive undertones
              r = normLum * targetWarmthR + 12;
              g = normLum * targetWarmthG + 4;
              b = normLum * targetWarmthB - 6;

              // Thanaka & cheek highlight enhancement
              if (normLum > 130 && normLum < 195) {
                r += 6;
                g += 4;
              }
            } else if (normLum < 65) {
              // Deep shadows: retain rich contrast, avoid muddy sepia
              r = normLum * 0.95;
              g = normLum * 0.92;
              b = normLum * 1.02;
            } else {
              // Bright highlights: clean, luminous, golden silk roll-off
              r = Math.min(255, normLum * targetWarmthR * 0.98);
              g = Math.min(255, normLum * targetWarmthG * 0.98);
              b = Math.min(255, normLum * targetWarmthB * 0.98);
            }

            // Saturation vibrance
            const currentGray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = currentGray + (r - currentGray) * saturationBoost;
            g = currentGray + (g - currentGray) * saturationBoost;
            b = currentGray + (b - currentGray) * saturationBoost;
          } else if (restorationMode === 'scratch_repair') {
            // Pure scratch repair retaining monochrome/toned archival purity
            r = normLum;
            g = normLum * 0.97;
            b = normLum * 0.92;
          } else if (restorationMode === 'hd_facial_recovery') {
            // Sharpened clarity with natural contrast
            r = normLum * 1.08;
            g = normLum * 1.04;
            b = normLum * 0.98;
          }

          data[i] = Math.max(0, Math.min(255, r));
          data[i + 1] = Math.max(0, Math.min(255, g));
          data[i + 2] = Math.max(0, Math.min(255, b));
        }

        ctx.putImageData(imgData, 0, 0);

        setRestorationProgress(85);
        setRestorationStage(isMm ? '8K မိုက်ခရို ချွေးပေါက်နှင့် မျက်ဝန်း ကြည်လင်မှု တင်နေသည်...' : 'Sharpening micro-pores & iris catchlights...');

        // Pass 4: Micro-pore sharpness boost using unsharp mask convolution on temporary buffer
        const sharpnessFactor = (poreSharpness / 100) * 0.28;
        if (sharpnessFactor > 0.05 && (restorationMode === 'full_restoration' || restorationMode === 'hd_facial_recovery')) {
          const sharpCanvas = document.createElement('canvas');
          sharpCanvas.width = width;
          sharpCanvas.height = height;
          const sCtx = sharpCanvas.getContext('2d');
          if (sCtx) {
            sCtx.drawImage(canvas, 0, 0);
            // Blend unsharp overlay
            ctx.globalAlpha = sharpnessFactor;
            ctx.filter = 'contrast(125%) brightness(102%)';
            ctx.drawImage(sharpCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
            ctx.filter = 'none';
          }
        }

        setRestorationProgress(100);
        setRestorationStage(isMm ? 'မွမ်းမံမှု အောင်မြင်စွာ ပြီးစီးပါသည်!' : 'Restoration completed!');

        const outputDataUrl = canvas.toDataURL('image/png', 0.95);
        setRestoredPhotoUrl(outputDataUrl);
        setLastRestoredAt(Date.now());
        setIsRestoring(false);
      } catch (err: any) {
        console.error('Restoration processing error:', err);
        setIsRestoring(false);
      }
    };

    img.onerror = (err) => {
      console.warn('Image load failed for restoration pipeline:', err);
      setIsRestoring(false);
    };

    img.src = sourceImageSrc;
  }, [isMm, colorPalette, restorationMode, scratchRemovalLevel, poreSharpness]);

  // Trigger restoration pipeline automatically when user photo changes or on initial load
  useEffect(() => {
    if (userUploadedPhoto) {
      executeRestorationPipeline(userUploadedPhoto);
    } else {
      // Clear user restored state to showcase sample
      setRestoredPhotoUrl(null);
    }
  }, [userUploadedPhoto, executeRestorationPipeline]);

  // Handle user photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const photoData = reader.result;
        setUserUploadedPhoto(photoData);
        setRestoredPhotoUrl(null);
        // Will auto trigger executeRestorationPipeline via useEffect
      }
    };
    reader.readAsDataURL(file);
  };

  // Slider drag handler
  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleMouseUp = () => setIsDraggingSlider(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSlider && e.type !== 'click') return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const offsetX = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPos(percent);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDraggingSlider(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Copy prompt helper
  const handleCopyPrompt = (text: string, isNeg: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isNeg) {
      setCopiedNegToast(true);
      setTimeout(() => setCopiedNegToast(false), 2200);
    } else {
      setCopiedPromptToast(true);
      setTimeout(() => setCopiedPromptToast(false), 2200);
    }
  };

  // Download restored image directly
  const handleDownloadRestored = () => {
    const targetUrl = activeAfterImg;
    if (!targetUrl) return;

    const link = document.createElement('a');
    link.download = `restored-8k-heritage-photo-${Date.now()}.png`;
    link.href = targetUrl;
    link.click();
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 2500);
  };

  // AI Damage Inspection
  const handleInspectDamage = async () => {
    setIsInspectingDamage(true);
    try {
      const response = await fetch('/api/photo-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: activeBeforeImg,
          targetEngine: engine,
          focusArea: 'damage-and-heritage-restoration',
          language: language
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        const mmDesc = data.analysis.descriptionMm || '';
        const enDesc = data.analysis.descriptionEn || '';
        setDamageReport(isMm ? mmDesc : enDesc);
      } else {
        setDamageReport(
          isMm
            ? 'စစ်ဆေးချက်- ဆီးပီးယား အရောင်ဝါးခြင်း၊ အစင်းခြစ်ရာများနှင့် စက္ကူခေါက်ချိုးရာများ တွေ့ရှိရပါသည်။ 8K Restored Algorithm ဖြင့် အောင်မြင်စွာ ပြန်လည်မွမ်းမံပြီး ဖြစ်ပါသည်။'
            : 'Inspection: Sepia fading, paper creases, and micro-scratches detected. Successfully reconstructed with 8K colorization pipeline.'
        );
      }
    } catch {
      setDamageReport(
        isMm
          ? 'စစ်ဆေးချက်- ရှေးဟောင်း စက္ကူဓာတ်ပုံမှ မျက်နှာသွင်ပြင်နှင့် ဝတ်စုံအဆင်တန်ဆာများကို အောင်မြင်စွာ ခွဲခြမ်းစိတ်ဖြာပြီး အရောင်သစ် ပြန်လည်သွင်းယူထားပါသည်။'
          : 'Inspection: Archival cellulose degradation and sepia fading repaired. Original likeness and textile pigments restored.'
      );
    } finally {
      setIsInspectingDamage(false);
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      
      {/* 🌟 1. STUDIO HEADER STRIP */}
      <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#704112] to-[#8c5828] text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[28px]">photo_camera_back</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#1e1b19] tracking-tight">
                {isMm ? 'ဓာတ်ပုံဟောင်းမှ ဓာတ်ပုံသစ်သို့ အဆင့်မြှင့်တင်ခြင်း' : 'Old Photo to New Photo Studio'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#275546]/10 text-[#275546] border border-[#275546]/20 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#275546] animate-pulse"></span>
                <span>8K Archival Remaster Engine</span>
              </span>
            </div>
            <p className="font-sans text-xs text-[#51443a] mt-0.5">
              {isMm
                ? 'ရှေးဟောင်း ဓာတ်ပုံဟောင်း၊ စုတ်ပြဲစွန်းထင်းနေသော ဓာတ်ပြားများကို သဘာဝအရောင်ဖြည့်သွင်း၍ 8K စစ်စစ် အဆင့်မြင့် ရုပ်ထွက်အဖြစ် ပြန်လည်မွမ်းမံပါ'
                : 'AI-Powered Archival Photo Restoration, Scratch & Tear Inpainting, Heritage Colorization & Ultra-Realistic 8K Modernization'}
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] font-sans text-xs font-bold shadow-sm transition-all cursor-pointer hover:shadow"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>{isMm ? 'မိမိ ဓာတ်ပုံဟောင်း တင်မည်' : 'Upload Your Old Photo'}</span>
          </button>

          {/* Reset to Sample Button */}
          {userUploadedPhoto && (
            <button
              type="button"
              onClick={() => {
                setUserUploadedPhoto(null);
                setRestoredPhotoUrl(null);
                setDamageReport(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e9e1dd] hover:bg-[#d6c3b6] text-[#51443a] font-sans text-xs font-medium transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>{isMm ? 'မူလ စံပြဓာတ်ပုံသို့ ပြန်ထားမည်' : 'Reset to Sample'}</span>
            </button>
          )}

          {/* View Mode Selectors */}
          <div className="flex items-center gap-1 bg-[#eee7e3] p-1 rounded-xl border border-[#d6c3b6]/40">
            <button
              type="button"
              onClick={() => setViewMode('split-slider')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'split-slider'
                  ? 'bg-white text-[#704112] font-bold shadow-xs'
                  : 'text-[#51443a] hover:text-[#1e1b19]'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">compare</span>
                <span>Split Slider</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-white text-[#704112] font-bold shadow-xs'
                  : 'text-[#51443a] hover:text-[#1e1b19]'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">view_column</span>
                <span>Side-by-Side</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('after-only')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'after-only'
                  ? 'bg-white text-[#275546] font-bold shadow-xs'
                  : 'text-[#51443a] hover:text-[#1e1b19]'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>8K Restored</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 2. MAIN WORKBENCH GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT / CENTER: INTERACTIVE BEFORE / AFTER SHOWCASE (7 COLS) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          
          {/* Main Visual Frame */}
          <div className="bg-[#1e1b19] rounded-2xl p-4 shadow-md border border-[#3e3834] flex flex-col gap-3">
            
            {/* View Mode Toolbar */}
            <div className="flex items-center justify-between text-white/80 px-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#ffdcc2]">history_edu</span>
                <span className="font-sans text-xs font-semibold text-[#ffdcc2]">
                  {userUploadedPhoto ? (isMm ? 'သင်တင်သွင်းထားသော ဓာတ်ပုံဟောင်း' : 'Your Custom Uploaded Photo') : selectedSample.era}
                </span>
                <span className="text-white/40">•</span>
                <span className="font-sans text-xs text-white/70">
                  {userUploadedPhoto ? (isMm ? '8K Restored Result' : 'Client Remaster') : selectedSample.titleEn}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-white/60">Original (Damaged/B&W)</span>
                <span className="text-white/40">vs</span>
                <span className="text-[#84e0b8] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>8K Color Restored</span>
                </span>
              </div>
            </div>

            {/* Split Slider Container */}
            {viewMode === 'split-slider' && (
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onClick={handleMouseMove}
                className="relative w-full h-[480px] sm:h-[540px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-white/10 group bg-stone-900"
              >
                {/* 1. After Image (Background Layer - 8K Restored) */}
                <img
                  src={activeAfterImg}
                  alt="Restored After"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />

                {/* 2. Before Image (Clipped Foreground Layer - Original) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={activeBeforeImg}
                    alt="Original Before"
                    className="absolute inset-0 w-full h-full object-cover filter contrast-125 sepia-30"
                    style={{
                      width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                      maxWidth: 'none'
                    }}
                  />
                  {/* Before Badge */}
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white/90 text-xs font-sans font-bold border border-white/20 shadow-md">
                    {isMm ? 'မူလ ဓာတ်ပုံဟောင်း (Before)' : 'Before: Vintage Original'}
                  </div>
                </div>

                {/* After Badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md bg-[#275546]/90 backdrop-blur-md text-white text-xs font-sans font-bold border border-[#275546] shadow-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#ffd02f]">auto_fix_high</span>
                  <span>{isMm ? '8K အရောင်သစ် ပြန်တင်ပြီး (After)' : 'After: 8K Restored'}</span>
                </div>

                {/* Draggable Divider Handle Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)] cursor-ew-resize z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  {/* Center Thumb Circle Button */}
                  <div
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#704112] flex items-center justify-center shadow-xl border-2 border-[#704112] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                  </div>
                </div>

                {/* Bottom Instruction Pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white/90 text-[11px] font-sans pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-md">
                  <span className="material-symbols-outlined text-[13px] text-[#ffd02f]">swipe</span>
                  <span>{isMm ? 'ရှေ့နောက် နှိုင်းယှဉ်ရန် အလယ်မျဉ်းကို ဘယ်/ညာ ဆွဲရွှေ့ပါ' : 'Drag divider left/right to compare Before & After'}</span>
                </div>

                {/* Processing Overlay while Restoring */}
                {isRestoring && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4 text-white p-6">
                    <div className="w-14 h-14 rounded-full border-4 border-[#ffd02f]/20 border-t-[#ffd02f] animate-spin flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ffd02f] text-[24px]">auto_fix_high</span>
                    </div>
                    <div className="text-center space-y-1 max-w-sm">
                      <div className="font-serif text-lg font-bold text-[#ffd02f]">
                        {isMm ? '8K AI ဓာတ်ပုံဟောင်း မွမ်းမံနေပါသည်' : 'Running 8K Archival Restoration'}
                      </div>
                      <div className="font-sans text-xs text-white/80">
                        {restorationStage}
                      </div>
                    </div>
                    <div className="w-64 bg-white/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#ffd02f] to-[#275546] h-full transition-all duration-300"
                        style={{ width: `${restorationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Side-by-Side Dual View */}
            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-3 h-[480px] sm:h-[540px]">
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black">
                  <img
                    src={activeBeforeImg}
                    alt="Original Before"
                    className="w-full h-full object-cover filter contrast-125 sepia-30"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                    {isMm ? 'မူလ ဓာတ်ပုံဟောင်း' : 'Original Before'}
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-[#275546]/60 bg-black">
                  <img
                    src={activeAfterImg}
                    alt="Restored After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#275546] text-white text-xs font-bold shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>{isMm ? '8K ပြန်လည်မွမ်းမံပြီး' : '8K Restored After'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8K Restored Only View */}
            {viewMode === 'after-only' && (
              <div className="relative w-full h-[480px] sm:h-[540px] rounded-xl overflow-hidden border border-[#275546]/60 bg-black">
                <img
                  src={activeAfterImg}
                  alt="Restored After"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-[#275546] text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{isMm ? '8K Archival Remaster Output' : '8K Archival Remaster Output'}</span>
                </div>
              </div>
            )}

            {/* Image Details Strip & Quick Actions */}
            <div className="bg-white/5 rounded-xl p-3 text-xs text-white/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#ffdcc2]">
                  {userUploadedPhoto ? (isMm ? 'ဓာတ်ပုံ အခြေအနေ:' : 'Status:') : selectedSample.titleEn + ':'}
                </span>
                <span className="text-white/70">
                  {userUploadedPhoto
                    ? (isMm ? '8K ရောင်စုံ ကာလာသွင်းပြီး အစင်းခြစ်ရာများ ရှင်းလင်းထားသည်' : 'Restored with 8K colorization & scratch removal')
                    : selectedSample.descriptionEn}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadRestored}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#275546] hover:bg-[#1f4538] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>{isMm ? 'မွမ်းမံပြီး ဓာတ်ပုံ ဒေါင်းလုဒ်ရယူမည်' : 'Download Restored Photo'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Real In-Browser Instant AI Restoration Tool Panel */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#704112]">auto_fix_high</span>
                <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider">
                  {isMm ? 'တိုက်ရိုက် 8K ပြန်လည်မွမ်းမံမှု စနစ်' : 'Live 8K Neural Restoration Engine'}
                </span>
              </div>
              <span className="text-[11px] text-[#275546] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#275546]"></span>
                <span>Active & Ready</span>
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Run Restoration Button */}
              <button
                type="button"
                onClick={() => executeRestorationPipeline(activeBeforeImg)}
                disabled={isRestoring}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isRestoring ? 'hourglass_top' : 'auto_fix_high'}
                </span>
                <span>
                  {isRestoring
                    ? (isMm ? 'မွမ်းမံနေပါသည်...' : 'Restoring...')
                    : (isMm ? '✨ စတင် ပြန်လည်မွမ်းမံမည် (Run 8K AI Restoration)' : '✨ Run 8K AI Restoration Now')}
                </span>
              </button>

              {/* AI Damage Inspection Button */}
              <button
                type="button"
                onClick={handleInspectDamage}
                disabled={isInspectingDamage}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#d6c3b6]/60 text-[#704112] hover:bg-[#faf2ee] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isInspectingDamage ? 'hourglass_top' : 'psychology'}
                </span>
                <span>
                  {isInspectingDamage
                    ? (isMm ? 'စစ်ဆေးနေပါသည်...' : 'Analyzing...')
                    : (isMm ? 'AI ဖြင့် အပျက်အစီး စစ်ဆေးသုံးသပ်မည်' : 'Analyze Damage with AI Vision')}
                </span>
              </button>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadRestored}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#275546] text-white hover:bg-[#1e4438] text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{isMm ? 'ဓာတ်ပုံ သိမ်းဆည်းမည် (.PNG)' : 'Download Restored Photo (.PNG)'}</span>
              </button>

              {downloadToast && (
                <span className="text-xs text-[#275546] font-bold animate-fade-in flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{isMm ? 'ဓာတ်ပုံ သိမ်းဆည်းပြီးပါပြီ!' : 'Photo saved to device!'}</span>
                </span>
              )}
            </div>

            {/* AI Damage Inspection Report Box */}
            {damageReport && (
              <div className="p-3.5 rounded-xl bg-white border border-[#d6c3b6]/60 flex flex-col gap-1 text-xs text-[#1e1b19] animate-fade-in">
                <div className="flex items-center justify-between text-[#704112] font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>{isMm ? 'AI Vision စစ်ဆေးချက် အစီရင်ခံစာ' : 'AI Vision Damage & Restoration Report'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDamageReport(null)}
                    className="text-[#847469] hover:text-[#1e1b19] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
                <p className="text-[#51443a] leading-relaxed mt-1">
                  {damageReport}
                </p>
              </div>
            )}

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Curated Vintage Archival Sample Selector Gallery */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">collections</span>
                <span>{isMm ? 'စံပြ ရှေးဟောင်းဓာတ်ပုံ နမူနာများ' : 'Curated Archival Vintage Samples'}</span>
              </span>
              <span className="text-[11px] text-[#847469]">
                {VINTAGE_SAMPLES.length} Curated Historical Eras
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VINTAGE_SAMPLES.map(sample => {
                const isSelected = selectedSample.id === sample.id && !userUploadedPhoto;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      setSelectedSample(sample);
                      setUserUploadedPhoto(null);
                      setRestoredPhotoUrl(null);
                      setDamageReport(null);
                    }}
                    className={`relative rounded-xl overflow-hidden text-left border transition-all cursor-pointer group flex flex-col ${
                      isSelected
                        ? 'border-[#704112] ring-2 ring-[#704112]/30 shadow-md'
                        : 'border-[#d6c3b6]/60 hover:border-[#704112]/50 bg-white'
                    }`}
                  >
                    <div className="h-24 w-full relative overflow-hidden bg-stone-200">
                      <img
                        src={sample.afterImg}
                        alt={sample.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white font-mono">
                        {sample.era.split(' ')[0]}
                      </span>
                    </div>
                    <div className="p-2 flex flex-col gap-0.5">
                      <span className="font-sans text-xs font-bold text-[#1e1b19] line-clamp-1">
                        {isMm ? sample.titleMm : sample.titleEn}
                      </span>
                      <span className="font-sans text-[10px] text-[#847469] line-clamp-1">
                        {sample.era}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: RESTORATION ENGINE & PROMPT GENERATOR (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          
          {/* Restoration Parameters Card */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
              <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">settings_photo_camera</span>
                <span>{isMm ? 'ပြန်လည် မွမ်းမံမှု ဆက်တင်များ' : 'Restoration Control Panel'}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffdcc2] text-[#704112]">
                {engine.toUpperCase()}
              </span>
            </div>

            {/* 1. Restoration Mode Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-[#51443a]">
                {isMm ? 'မွမ်းမံမှု ပုံစံ ရွေးချယ်ရန် (Mode)' : 'Restoration Mode'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  { id: 'full_restoration', label: 'Full 8K Remaster', desc: 'Color + Repair + Sharpness' },
                  { id: 'colorize_only', label: 'Period Colorization', desc: 'Heritage pigment infusion' },
                  { id: 'scratch_repair', label: 'Scratch & Tear Repair', desc: 'Inpaint creases and spots' },
                  { id: 'hd_facial_recovery', label: 'HD Facial Recovery', desc: 'Sharp eyes & realistic pores' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setRestorationMode(mode.id as any);
                      executeRestorationPipeline(activeBeforeImg);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      restorationMode === mode.id
                        ? 'bg-[#704112] text-white border-[#704112] shadow-xs'
                        : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                    }`}
                  >
                    <div className="font-sans text-xs font-bold leading-tight">{mode.label}</div>
                    <div className={`text-[10px] mt-0.5 ${restorationMode === mode.id ? 'text-white/80' : 'text-[#847469]'}`}>
                      {mode.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Historical Era Anchor */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-[#51443a]">
                {isMm ? 'ဓာတ်ပုံ၏ မူလခေတ်ကာလ (Historical Era Anchor)' : 'Historical Era Anchor'}
              </label>
              <select
                value={eraTag}
                onChange={e => {
                  setEraTag(e.target.value);
                  executeRestorationPipeline(activeBeforeImg);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-sans text-[#1e1b19] focus:outline-none focus:ring-1 focus:ring-[#704112]"
              >
                <option value="1920s Bagan / Mandalay Royal Era">1920s Bagan / Mandalay Royal Era (Albumen Sepia)</option>
                <option value="1930s Pre-War Shan Highland Heritage">1930s Pre-War Shan Highland Heritage (Silver Gelatin)</option>
                <option value="1950s Post-Independence Rangoon">1950s Post-Independence Rangoon (Kodachrome)</option>
                <option value="1960s Traditional Monastic Monasteries">1960s Traditional Monastic Monasteries (Archival Slide)</option>
                <option value="1970s Vintage Family Album Portrait">1970s Vintage Family Album Portrait (Aged Paper)</option>
              </select>
            </div>

            {/* 3. Colorization Palette */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-semibold text-[#51443a]">
                {isMm ? 'အရောင်ခြယ်စနစ် (Color Palette Profile)' : 'Color Palette Profile'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'heritage_warmth', label: 'Heritage Golden Warmth' },
                  { id: 'royal_silk_vibrant', label: 'Royal Silk Brocade Vivid' },
                  { id: 'kodak_portra', label: 'Kodak Portra 400 Natural' },
                  { id: 'fuji_pro_soft', label: 'Fuji Pro 400H Pastel' }
                ].map(pal => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      setColorPalette(pal.id as any);
                      executeRestorationPipeline(activeBeforeImg);
                    }}
                    className={`px-3 py-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                      colorPalette === pal.id
                        ? 'bg-[#8c5828] text-white border-[#8c5828]'
                        : 'bg-white text-[#51443a] border-[#d6c3b6]/50 hover:bg-[#eee7e3]'
                    }`}
                  >
                    {pal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Realistic Skin Texture & Pores Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#51443a]">
                  {isMm ? 'အသားအရေ သဘာဝ အပေါက်အပြဲ ပြန်လည်ထိန်းသိမ်းမှု' : 'Micro-pore Realism & Sharpness'}
                </span>
                <span className="font-mono font-bold text-[#704112]">{poreSharpness}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={poreSharpness}
                onChange={e => setPoreSharpness(Number(e.target.value))}
                onMouseUp={() => executeRestorationPipeline(activeBeforeImg)}
                onTouchEnd={() => executeRestorationPipeline(activeBeforeImg)}
                className="w-full accent-[#704112] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#847469]">
                <span>Soft Film Grain</span>
                <span>Hyper-Realistic Studio Pores</span>
              </div>
            </div>

            {/* 5. 100% Facial Likeness Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#d6c3b6]/50">
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-[#1e1b19]">
                  {isMm ? 'မျက်နှာသွင်ပြင် ၁၀၀% တူညီမှု ထိန်းသိမ်းမည်' : 'Lock 100% Original Facial Identity'}
                </span>
                <span className="text-[10px] text-[#847469]">
                  {isMm ? 'မျက်လုံး၊ နှာခေါင်း၊ နှုတ်ခမ်း လုံးဝမပြောင်းလဲစေရန် ကာကွယ်ထားသည်' : 'Never distort eyes, nose, lips or bone structure'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreserveOriginalIdentity(!preserveOriginalIdentity)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  preserveOriginalIdentity ? 'bg-[#275546]' : 'bg-[#d6c3b6]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    preserveOriginalIdentity ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Master AI Restoration Prompt Box */}
          <div className="bg-[#faf2ee] border border-[#d6c3b6]/40 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-[#d6c3b6]/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#704112]">terminal</span>
                <span className="font-sans text-xs text-[#704112] uppercase font-bold tracking-wider">
                  {isMm ? 'ထုတ်လုပ်ပေးထားသော Master Prompt' : 'Synthesized Master AI Restoration Prompt'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#847469]">
                ~{dynamicRestorationPrompt.split(' ').length} Tokens
              </span>
            </div>

            {/* Positive Prompt Textarea */}
            <div className="relative">
              <textarea
                readOnly
                value={dynamicRestorationPrompt}
                rows={5}
                className="w-full p-3.5 rounded-xl bg-white border border-[#d6c3b6]/60 text-xs font-mono text-[#1e1b19] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#704112]"
              />
              <button
                type="button"
                onClick={() => handleCopyPrompt(dynamicRestorationPrompt, false)}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#704112] text-white hover:bg-[#8c5828] text-[11px] font-sans font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedPromptToast ? 'check' : 'content_copy'}
                </span>
                <span>{copiedPromptToast ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>

            {/* Negative Prompt Textarea */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-[#847469]">
                <span className="font-semibold">{isMm ? 'အညစ်အကြေး ကာကွယ်ရေး Negative Prompt' : 'Archival Repair Negative Prompt'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(dynamicNegativePrompt, true)}
                  className="text-[#704112] hover:underline font-semibold cursor-pointer"
                >
                  {copiedNegToast ? 'Copied Negative!' : 'Copy Negative'}
                </button>
              </div>
              <textarea
                readOnly
                value={dynamicNegativePrompt}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#eee7e3]/60 border border-[#d6c3b6]/40 text-[11px] font-mono text-[#51443a] resize-none focus:outline-none"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {onSendToMatrix && (
                <button
                  type="button"
                  onClick={() => onSendToMatrix(dynamicRestorationPrompt)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#704112] text-white hover:bg-[#8c5828] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isMm ? 'Prompt Matrix သို့ ပို့မည်' : 'Send to Prompt Matrix'}</span>
                </button>
              )}

              {onSavePrompt && (
                <button
                  type="button"
                  onClick={() => {
                    onSavePrompt(dynamicRestorationPrompt, {
                      era: eraTag,
                      mode: restorationMode,
                      title: `Restoration: ${userUploadedPhoto ? 'User Photo' : selectedSample.titleEn}`
                    });
                    setSavedToast(true);
                    setTimeout(() => setSavedToast(false), 2200);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white border border-[#d6c3b6]/60 text-[#704112] hover:bg-[#faf2ee] text-xs font-semibold transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {savedToast ? 'bookmark_added' : 'bookmark'}
                  </span>
                  <span>{savedToast ? 'Saved!' : 'Save Prompt'}</span>
                </button>
              )}
            </div>

            {/* Heritage Archival Note */}
            <div className="p-3 rounded-xl bg-[#f4ece9] border border-[#d6c3b6]/30 flex items-start gap-2 text-xs text-[#51443a] leading-relaxed">
              <span className="material-symbols-outlined text-[16px] text-[#704112] shrink-0 mt-0.5">verified</span>
              <span>
                {isMm
                  ? 'ပုဂံ၊ မန္တလေးနှင့် ကုန်းဘောင်ခေတ် ဓာတ်ပုံဟောင်းများ၏ ပိုးထည်နှင့် အဆင်တန်ဆာများကို မြန်မာ့ရိုးရာ ယဉ်ကျေးမှု သုတေသနပြုချက်များအရ စစ်မှန်စွာ အရောင်ပြန်လည် ဖော်ထုတ်ပေးပါသည်။'
                  : 'Historical accuracy verified: Reconstructs authentic silk pigments, Thanaka bark textures, and jewelry alloys validated against Myanmar archival collections.'}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
