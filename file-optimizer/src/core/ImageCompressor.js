/**
 * Core Image Compressor Engine
 * Handles high-fidelity image compression while strictly maintaining original resolution.
 */
export class ImageCompressor {
  /**
   * Compress an image file to a smaller target file size without losing resolution.
   * 
   * @param {File} file - The original image file to compress
   * @param {Object} options - Compression settings
   * @param {string} [options.format='image/webp'] - Target format ('image/webp', 'image/jpeg', 'image/avif', 'image/png')
   * @param {number} [options.maxSizeBytes=2097152] - Target maximum size in bytes (default: 2 MB)
   * @param {number} [options.quality=0.82] - Initial quality ratio (0.1 to 1.0)
   * @param {boolean} [options.autoTargetSize=true] - Iteratively adjust quality to hit target size (e.g. <= 2MB)
   * @param {function} [options.onProgress] - Callback for progress reporting
   * @returns {Promise<Object>} Compression result object
   */
  static async compress(file, options = {}) {
    const startTime = performance.now();
    const {
      format = 'image/webp',
      maxSizeBytes = 2 * 1024 * 1024, // 2 MB target
      quality = 0.82,
      autoTargetSize = true,
      onProgress = () => {}
    } = options;

    onProgress(10, 'Loading image metadata...');

    // Load original image into bitmap/element to get dimensions
    const { imageSource, width, height } = await this._loadImageSource(file);

    onProgress(30, 'Rendering to high-precision canvas...');

    // Create Canvas preserving exact 1:1 original dimensions
    const canvas = this._createCanvas(width, height);
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    
    // Smooth image rendering setup
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageSource, 0, 0, width, height);

    onProgress(50, 'Applying smart compression algorithms...');

    // Determine compressed blob
    let finalBlob = null;
    let finalQuality = quality;

    if (autoTargetSize && file.size > maxSizeBytes && format !== 'image/png') {
      // Perform adaptive quality estimation to reach <= maxSizeBytes without visual degradation
      finalBlob = await this._adaptiveCompress(canvas, format, file.size, maxSizeBytes, quality, (p) => {
        onProgress(50 + Math.round(p * 0.4), 'Optimizing file buffer...');
      });
    } else {
      finalBlob = await this._canvasToBlob(canvas, format, quality);
    }

    onProgress(95, 'Generating preview buffers...');

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    // Fallback: If compressed blob is somehow larger than original (rare), return original format
    if (finalBlob.size >= file.size && format === file.type) {
      finalBlob = file;
    }

    const originalUrl = URL.createObjectURL(file);
    const compressedUrl = URL.createObjectURL(finalBlob);

    const savingsBytes = Math.max(0, file.size - finalBlob.size);
    const savingsPercent = file.size > 0 ? ((savingsBytes / file.size) * 100).toFixed(1) : 0;

    onProgress(100, 'Optimization complete!');

    return {
      fileName: file.name,
      originalSize: file.size,
      compressedSize: finalBlob.size,
      savingsBytes,
      savingsPercent: Number(savingsPercent),
      width,
      height,
      resolutionString: `${width} × ${height} px`,
      format: finalBlob.type || format,
      originalUrl,
      compressedUrl,
      compressedBlob: finalBlob,
      processingTimeMs,
      timestamp: Date.now()
    };
  }

  /**
   * Adaptive compression loop using binary quality search to target file size <= maxSizeBytes.
   */
  static async _adaptiveCompress(canvas, format, originalSizeBytes, targetSizeBytes, initialQuality, onStep) {
    let minQ = 0.35; // Don't drop below 0.35 quality to prevent visual degradation
    let maxQ = Math.min(1.0, initialQuality);
    let bestBlob = null;
    let iterations = 0;
    const maxIterations = 5;

    let currentQ = maxQ;

    while (iterations < maxIterations) {
      onStep((iterations + 1) / maxIterations);
      const blob = await this._canvasToBlob(canvas, format, currentQ);
      bestBlob = blob;

      // If we reached target size or quality range is tight enough
      if (blob.size <= targetSizeBytes || (maxQ - minQ) < 0.08) {
        break;
      }

      // Adjust quality range
      maxQ = currentQ;
      currentQ = Math.max(minQ, (minQ + maxQ) / 2);
      iterations++;
    }

    return bestBlob;
  }

  /**
   * Helper to load image into Canvas ImageSource and extract original width/height.
   */
  static async _loadImageSource(file) {
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(file);
        return {
          imageSource: bitmap,
          width: bitmap.width,
          height: bitmap.height
        };
      } catch (e) {
        console.warn('createImageBitmap failed, falling back to HTMLImageElement', e);
      }
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          imageSource: img,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file. File may be corrupted or unsupported.'));
      };
      img.src = url;
    });
  }

  /**
   * Create canvas instance (OffscreenCanvas if available for speed, else standard canvas)
   */
  static _createCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Convert canvas to Blob with given format and quality
   */
  static _canvasToBlob(canvas, format, quality) {
    if (canvas.convertToBlob) {
      return canvas.convertToBlob({ type: format, quality });
    }
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        format,
        quality
      );
    });
  }
}
