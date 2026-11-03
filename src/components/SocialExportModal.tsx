import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Copy, 
  Smartphone, 
  Square, 
  Tv, 
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Maximize
} from 'lucide-react';

interface SocialExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt?: string;
  authorName?: string;
  authorHandle?: string;
}

interface RatioPreset {
  id: string;
  label: string;
  platform: string;
  w: number;
  h: number;
  ratioText: string;
  icon: any;
}

const SOCIAL_PRESETS: RatioPreset[] = [
  { id: 'story', label: 'Story & Reels', platform: 'TikTok / IG Story / Shorts', w: 1080, h: 1920, ratioText: '9:16', icon: Smartphone },
  { id: 'ig-portrait', label: 'IG Portrait Feed', platform: 'Instagram Feed (Top Reach)', w: 1080, h: 1350, ratioText: '4:5', icon: Smartphone },
  { id: 'square', label: 'Square Post', platform: 'Instagram / Facebook / X', w: 1080, h: 1080, ratioText: '1:1', icon: Square },
  { id: 'landscape', label: 'Landscape Banner', platform: 'YouTube / Desktop 16:9', w: 1920, h: 1080, ratioText: '16:9', icon: Tv },
  { id: 'standard', label: 'Standard Portrait', platform: 'Studio Portrait Print', w: 1080, h: 1440, ratioText: '3:4', icon: Smartphone }
];

export const SocialExportModal: React.FC<SocialExportModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  authorName,
  authorHandle
}) => {
  const [selectedPreset, setSelectedPreset] = useState<RatioPreset>(SOCIAL_PRESETS[0]);
  const [fitMode, setFitMode] = useState<'blur-fill' | 'cover-crop' | 'solid-black'>('blur-fill');
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render preview canvas
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const targetW = selectedPreset.w;
      const targetH = selectedPreset.h;
      canvas.width = targetW;
      canvas.height = targetH;

      // 1. Background Fill
      if (fitMode === 'solid-black') {
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, targetW, targetH);
      } else if (fitMode === 'blur-fill') {
        // Draw heavily scaled/blurred copy of image as ambient background
        ctx.save();
        ctx.filter = 'blur(40px) brightness(0.65)';
        ctx.drawImage(img, -targetW * 0.15, -targetH * 0.15, targetW * 1.3, targetH * 1.3);
        ctx.restore();

        // Subtle dark overlay to give contrast
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, targetW, targetH);
      }

      // 2. Foreground Image Drawing
      if (fitMode === 'cover-crop') {
        // Cover logic: scale to fill and crop edges
        const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        ctx.drawImage(img, x, y, w, h);
      } else {
        // Contain logic: scale to fit within canvas bounds
        const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;

        // Soft drop shadow under the contained photo
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;
        ctx.drawImage(img, x, y, w, h);
        ctx.restore();
      }

      // 3. Optional Watermark Badge with Creator Attribution
      if (includeWatermark) {
        ctx.save();
        const cleanHandle = authorHandle ? authorHandle.replace('@', '') : '';
        const badgeText = cleanHandle ? `✨ ShowAI • @${cleanHandle}` : '✨ ShowAI Studio';
        const fontSize = Math.round(targetW * 0.022);
        ctx.font = `bold ${fontSize}px sans-serif`;

        const textMetrics = ctx.measureText(badgeText);
        const padX = fontSize * 1.2;
        const padY = fontSize * 0.6;
        const badgeW = textMetrics.width + padX * 2;
        const badgeH = fontSize + padY * 2;
        const posX = targetW - badgeW - 32;
        const posY = targetH - badgeH - 32;

        // Rounded pill background
        ctx.fillStyle = 'rgba(7, 9, 13, 0.82)';
        ctx.beginPath();
        ctx.roundRect(posX, posY, badgeW, badgeH, 12);
        ctx.fill();

        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pill text
        ctx.fillStyle = '#34d399';
        ctx.fillText(badgeText, posX + padX, posY + badgeH - padY * 0.9);
        ctx.restore();
      }
    };
    img.src = imageUrl;
  }, [isOpen, imageUrl, selectedPreset, fitMode, includeWatermark, authorHandle]);

  // Native Web Share API
  const handleNativeShare = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `showai-${selectedPreset.id}-${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Created with ShowAI Studio',
              text: prompt || 'Check out my AI creation on ShowAI Studio!',
              files: [file]
            });
          } else {
            await navigator.share({
              title: 'Created with ShowAI Studio',
              text: prompt || 'Check out my AI creation on ShowAI Studio!',
              url: window.location.origin
            });
          }
        });
      } catch {
        handleCopyToClipboard();
      }
    } else {
      handleCopyToClipboard();
    }
  };

  // Download high-resolution canvas
  const handleDownload = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    try {
      const link = document.createElement('a');
      link.download = `show-ai-${selectedPreset.id}-${selectedPreset.ratioText.replace(':', 'x')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 0.95);
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.warn('Canvas download error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      });
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Social Media Multi-Ratio Optimizer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Instant Crop
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Export tailored high-resolution graphics for TikTok, Instagram Reels, Feed, or YouTube.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (2 Columns: Presets & Live Canvas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Presets List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Target Aspect Ratio & Platform:
              </label>
              <div className="space-y-1.5">
                {SOCIAL_PRESETS.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPreset(p)}
                      className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-lg shadow-cyan-950/30'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{p.label}</span>
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">{p.ratioText}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate max-w-[190px]">{p.platform}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">{p.w}x{p.h}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Framing & Backdrop Mode */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Framing & Background Fill:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFitMode('blur-fill')}
                  className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                    fitMode === 'blur-fill'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Ambient Blur
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('cover-crop')}
                  className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                    fitMode === 'cover-crop'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Full Bleed
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('solid-black')}
                  className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                    fitMode === 'solid-black'
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  Studio Black
                </button>
              </div>
            </div>

            {/* Watermark Toggle */}
            <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-zinc-300">Brand Watermark Badge</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Live Preview Canvas (Right) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-h-[360px]">
            <div className="relative max-h-[460px] max-w-full flex items-center justify-center overflow-hidden rounded-xl shadow-2xl">
              <canvas
                ref={previewCanvasRef}
                className="max-h-[460px] max-w-full object-contain rounded-xl border border-zinc-700/50"
                style={{
                  aspectRatio: `${selectedPreset.w} / ${selectedPreset.h}`
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="font-mono text-cyan-400">{selectedPreset.w} × {selectedPreset.h} px</span>
              <span>• Output format: 100% Crisp 300DPI PNG</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-zinc-400 hidden sm:block">
            Ready to share to {selectedPreset.platform}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-all cursor-pointer"
              title="Share to Social Apps"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleCopyToClipboard}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                copiedSuccess
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-cyan-500/25'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download High-Res ({selectedPreset.ratioText})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
