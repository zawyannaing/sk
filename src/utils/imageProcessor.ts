/**
 * Ultra-robust, fault-tolerant image processor for mobile (Android/iOS) and desktop browsers.
 * - Server-assisted HEIC/HEIF conversion (handles Samsung Galaxy, iPhone, Xiaomi camera photos)
 * - Hardware-accelerated createImageBitmap with memory release (bitmap.close())
 * - Responsive canvas resizing to crisp 1200px JPEG to avoid memory crashes in mobile Chrome
 * - Fallback to /api/process-image server endpoint if client-side decoding fails
 */

function readFileAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(blob);
  });
}

async function convertImageOnServer(dataUrl: string, fileName: string): Promise<string | null> {
  try {
    const res = await fetch('/api/process-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, fileName }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success && json?.dataUrl) {
      return json.dataUrl;
    }
  } catch (err) {
    console.warn('Server image conversion fetch error:', err);
  }
  return null;
}

export async function processImageFile(file: File): Promise<string> {
  if (!file) return '';

  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();
  const isHeic =
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileType.includes('heic') ||
    fileType.includes('heif');

  // Read file as base64 data URL first
  let rawDataUrl = '';
  try {
    rawDataUrl = await readFileAsDataUrl(file);
  } catch (readErr) {
    console.warn('FileReader failed, attempting createObjectURL:', readErr);
    try {
      return URL.createObjectURL(file);
    } catch {
      return '';
    }
  }

  if (!rawDataUrl) return '';

  // 1. If it's a HEIC/HEIF photo from Samsung/iPhone camera, convert on server via /api/process-image
  if (isHeic || rawDataUrl.startsWith('data:image/heic') || rawDataUrl.startsWith('data:image/heif')) {
    const serverConverted = await convertImageOnServer(rawDataUrl, fileName);
    if (serverConverted) {
      return serverConverted;
    }
  }

  // 2. Hardware-accelerated client-side decoding using createImageBitmap
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      const MAX_DIM = 1200;
      let width = bitmap.width;
      let height = bitmap.height;

      if (width > 0 && height > 0) {
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.86);
          // Free GPU texture memory immediately
          if (typeof (bitmap as any).close === 'function') {
            (bitmap as any).close();
          }
          if (compressed && compressed.startsWith('data:image/jpeg') && compressed.length > 200) {
            return compressed;
          }
        }
      }
      if (typeof (bitmap as any).close === 'function') {
        (bitmap as any).close();
      }
    } catch (bitmapError) {
      console.warn('createImageBitmap failed, trying HTMLImageElement fallback:', bitmapError);
    }
  }

  // 3. Fallback using HTMLImageElement
  try {
    const htmlImgResult = await new Promise<string>((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => {
        resolve('');
      }, 7000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const MAX_DIM = 1200;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > 0 && height > 0) {
            if (width > MAX_DIM || height > MAX_DIM) {
              if (width > height) {
                height = Math.round((height * MAX_DIM) / width);
                width = MAX_DIM;
              } else {
                width = Math.round((width * MAX_DIM) / height);
                height = MAX_DIM;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.86);
              if (compressed && compressed.startsWith('data:image/jpeg') && compressed.length > 200) {
                resolve(compressed);
                return;
              }
            }
          }
        } catch (canvasErr) {
          console.warn('Canvas fallback error:', canvasErr);
        }
        resolve(rawDataUrl);
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve('');
      };

      img.src = rawDataUrl;
    });

    if (htmlImgResult && htmlImgResult.startsWith('data:image/jpeg') && htmlImgResult.length > 200) {
      return htmlImgResult;
    }
  } catch (e) {
    console.warn('HTMLImageElement fallback failed:', e);
  }

  // 4. If client decoding couldn't handle it (e.g. unknown format, large file), send to server
  const serverFallback = await convertImageOnServer(rawDataUrl, fileName);
  if (serverFallback) {
    return serverFallback;
  }

  // 5. Ultimate fallback: return the raw base64 data URL
  return rawDataUrl;
}
