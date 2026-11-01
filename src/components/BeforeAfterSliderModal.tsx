import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  ArrowLeftRight, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Sparkles,
  Layers,
  Check,
  ShieldCheck
} from 'lucide-react';

interface BeforeAfterSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  subtitle?: string;
}

export const BeforeAfterSliderModal: React.FC<BeforeAfterSliderModalProps> = ({
  isOpen,
  onClose,
  beforeImage,
  afterImage,
  beforeLabel = 'Original Face / Reference',
  afterLabel = 'AI Studio Restyled (100% Face Preserved)',
  title = 'Interactive Before & After Comparison',
  subtitle = 'Drag the slider left and right to inspect facial preservation and styling changes.'
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSwapped, setIsSwapped] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle drag calculation
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(clampedPos);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Export combined side-by-side snapshot to canvas
  const handleExportComparison = async () => {
    try {
      const imgA = new Image();
      const imgB = new Image();
      imgA.crossOrigin = 'anonymous';
      imgB.crossOrigin = 'anonymous';

      await Promise.all([
        new Promise((resolve) => { imgA.onload = resolve; imgA.src = beforeImage; }),
        new Promise((resolve) => { imgB.onload = resolve; imgB.src = afterImage; })
      ]);

      const canvas = document.createElement('canvas');
      const targetHeight = Math.max(imgA.naturalHeight, imgB.naturalHeight, 1080);
      const aspectA = imgA.naturalWidth / imgA.naturalHeight;
      const aspectB = imgB.naturalWidth / imgB.naturalHeight;

      const widthA = Math.round(targetHeight * aspectA);
      const widthB = Math.round(targetHeight * aspectB);
      canvas.width = widthA + widthB;
      canvas.height = targetHeight + 120; // 120px footer banner

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Left Image
      ctx.drawImage(imgA, 0, 0, widthA, targetHeight);

      // Draw Right Image
      ctx.drawImage(imgB, widthA, 0, widthB, targetHeight);

      // Vertical Divider
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(widthA, 0);
      ctx.lineTo(widthA, targetHeight);
      ctx.stroke();

      // Top Badges
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(24, 24, 220, 48);
      ctx.fillRect(widthA + 24, 24, 260, 48);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(beforeLabel, 36, 56);
      ctx.fillText(afterLabel, widthA + 36, 56);

      // Bottom Branding Footer
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('SHOW AI STUDIO • 100% FACE PRESERVATION COMPARISON', 36, targetHeight + 70);

      const link = document.createElement('a');
      link.download = `show-ai-comparison-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.warn('Canvas comparison export failed, falling back to direct download:', err);
      const link = document.createElement('a');
      link.download = 'ai-after-photo.png';
      link.href = afterImage;
      link.click();
    }
  };

  if (!isOpen) return null;

  const currentBefore = isSwapped ? afterImage : beforeImage;
  const currentAfter = isSwapped ? beforeImage : afterImage;
  const currentBeforeLabel = isSwapped ? afterLabel : beforeLabel;
  const currentAfterLabel = isSwapped ? beforeLabel : afterLabel;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className={`bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen ? 'fixed inset-3 max-w-none h-[calc(100vh-24px)]' : 'max-w-5xl max-h-[92vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> 100% Face Lock
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSwapped(!isSwapped)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Swap Left/Right Sides"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(50)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
              title="Reset slider to 50%"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interactive Comparison Canvas Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 sm:p-4 min-h-[380px] select-none overflow-hidden">
          <div
            ref={containerRef}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            className="relative w-full max-w-4xl aspect-[4/5] sm:aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl cursor-ew-resize"
          >
            {/* 1. Underlying Right Image (After Image) */}
            <img
              src={currentAfter}
              alt="After Image"
              className="absolute inset-0 w-full h-full object-contain bg-zinc-950 pointer-events-none"
            />
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg pointer-events-none flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentAfterLabel}</span>
            </div>

            {/* 2. Clipped Left Image (Before Image) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={currentBefore}
                alt="Before Image"
                className="absolute inset-0 w-full h-full object-contain bg-zinc-950 pointer-events-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                  maxWidth: 'none'
                }}
              />
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg pointer-events-none">
                <span>{currentBeforeLabel}</span>
              </div>
            </div>

            {/* 3. Draggable Divider Line & Knob */}
            <div
              className="absolute inset-y-0 pointer-events-none z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
              {/* Divider Line */}
              <div className="w-1 h-full bg-gradient-to-b from-emerald-400 via-white to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              {/* Center Handle Knob */}
              <div className="absolute w-10 h-10 rounded-full bg-zinc-950 border-2 border-emerald-400 shadow-2xl flex items-center justify-center text-white cursor-ew-resize active:scale-95 transition-transform pointer-events-auto">
                <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="font-mono text-emerald-400 font-bold">{Math.round(sliderPos)}%</span>
            <span>Split Ratio • Click or drag anywhere across the photo</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportComparison}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/25'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Comparison Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Side-by-Side Snapshot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
