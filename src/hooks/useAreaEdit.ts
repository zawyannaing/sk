import { useCallback, useRef, useState } from 'react';

export interface StrokePoint {
  x: number;
  y: number;
  size: number;
  isEraser?: boolean;
}

export type Stroke = StrokePoint[];

export interface UseAreaEditOptions {
  initialBrushSize?: number;
  maskColor?: string; // e.g. '#ec489980' or 'rgba(236, 72, 153, 0.55)'
}

export function useAreaEdit(options: UseAreaEditOptions = {}) {
  const { initialBrushSize = 35, maskColor = 'rgba(236, 72, 153, 0.55)' } = options;

  const [brushSize, setBrushSize] = useState<number>(initialBrushSize);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [maskHasContent, setMaskHasContent] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringCanvas, setIsHoveringCanvas] = useState<boolean>(false);

  // Stroke stacks for multi-level undo / redo
  const strokesRef = useRef<Stroke[]>([]);
  const redoStackRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke>([]);
  const isDrawingRef = useRef<boolean>(false);

  // Check if undo/redo is available
  const canUndo = strokesRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  // Redraw the canvas visual display
  const redraw = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesRef.current) {
      if (!stroke || stroke.length === 0) continue;
      const isErase = stroke[0]?.isEraser;

      ctx.save();
      if (isErase) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = maskColor;
        ctx.strokeStyle = maskColor;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.length === 1) {
        const pt = stroke[0];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1];
          const curr = stroke[i];
          ctx.beginPath();
          ctx.lineWidth = curr.size;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }, [maskColor]);

  // Start stroke
  const startStroke = useCallback((
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    isDrawingRef.current = true;
    currentStrokeRef.current = [{ x, y, size: brushSize, isEraser }];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = maskColor;
      }
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [brushSize, isEraser, maskColor]);

  // Draw stroke
  const drawStroke = useCallback((
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    if (!isDrawingRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const prev = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    currentStrokeRef.current.push({ x, y, size: brushSize, isEraser });

    const ctx = canvas.getContext('2d');
    if (ctx && prev) {
      ctx.save();
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000000';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = maskColor;
      }
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
    }
  }, [brushSize, isEraser, maskColor]);

  // End stroke
  const endStroke = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      redoStackRef.current = [];
      setMaskHasContent(true);
      currentStrokeRef.current = [];
    }
    if (canvas) redraw(canvas);
  }, [redraw]);

  // Undo
  const undo = useCallback((canvas: HTMLCanvasElement | null) => {
    if (strokesRef.current.length === 0) return;
    const popped = strokesRef.current.pop();
    if (popped) {
      redoStackRef.current.push(popped);
      setMaskHasContent(strokesRef.current.length > 0);
      if (canvas) redraw(canvas);
    }
  }, [redraw]);

  // Redo
  const redo = useCallback((canvas: HTMLCanvasElement | null) => {
    if (redoStackRef.current.length === 0) return;
    const popped = redoStackRef.current.pop();
    if (popped) {
      strokesRef.current.push(popped);
      setMaskHasContent(true);
      if (canvas) redraw(canvas);
    }
  }, [redraw]);

  // Clear Mask
  const clearMask = useCallback((canvas: HTMLCanvasElement | null) => {
    strokesRef.current = [];
    redoStackRef.current = [];
    currentStrokeRef.current = [];
    setMaskHasContent(false);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Export exact-dimension Binary Mask PNG strictly matching natural dimensions
  // #FFFFFF = area to edit/inpaint
  // #000000 = area to preserve (original)
  const exportBinaryMask = useCallback((
    canvas: HTMLCanvasElement | null,
    imageEl: HTMLImageElement | null
  ): string | null => {
    if (!canvas || !imageEl || strokesRef.current.length === 0) return null;

    const targetWidth = imageEl.naturalWidth || canvas.width || 1024;
    const targetHeight = imageEl.naturalHeight || canvas.height || 1024;

    const offscreen = document.createElement('canvas');
    offscreen.width = targetWidth;
    offscreen.height = targetHeight;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    // 1. Fill entire background with Solid Black (#000000 = preserve)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // 2. Compute coordinate scale factor from display canvas to natural image dimensions
    const scaleX = targetWidth / canvas.width;
    const scaleY = targetHeight / canvas.height;
    const avgScale = (scaleX + scaleY) / 2;

    // 3. Render strokes in Solid White (#FFFFFF = edit/replace) with destination-out for eraser
    for (const stroke of strokesRef.current) {
      if (!stroke || stroke.length === 0) continue;
      const isErase = stroke[0]?.isEraser;

      ctx.save();
      if (isErase) {
        // Erase back to solid black
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#000000';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.length === 1) {
        const pt = stroke[0];
        ctx.beginPath();
        ctx.arc(pt.x * scaleX, pt.y * scaleY, (pt.size * avgScale) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (let i = 1; i < stroke.length; i++) {
          const prev = stroke[i - 1];
          const curr = stroke[i];
          ctx.beginPath();
          ctx.lineWidth = curr.size * avgScale;
          ctx.moveTo(prev.x * scaleX, prev.y * scaleY);
          ctx.lineTo(curr.x * scaleX, curr.y * scaleY);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    return offscreen.toDataURL('image/png');
  }, []);

  return {
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser,
    maskHasContent,
    cursorPos,
    setCursorPos,
    isHoveringCanvas,
    setIsHoveringCanvas,
    isDrawingRef,
    canUndo,
    canRedo,
    startStroke,
    drawStroke,
    endStroke,
    undo,
    redo,
    clearMask,
    redraw,
    exportBinaryMask
  };
}
