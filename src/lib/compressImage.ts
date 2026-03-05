/**
 * Compress an image file client-side using Canvas API.
 * Returns a base64 data URI (WebP if supported, else JPEG).
 * Target: max 800x1200px, quality 0.75 → typically 50-150 KB.
 */
export function compressImageClient(file: File, maxW = 800, maxH = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      // Prefer WebP, fallback to JPEG
      const webp = canvas.toDataURL("image/webp", quality);
      if (webp.startsWith("data:image/webp")) {
        resolve(webp);
      } else {
        resolve(canvas.toDataURL("image/jpeg", quality));
      }
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
