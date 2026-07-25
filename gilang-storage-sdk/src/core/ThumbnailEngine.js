import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Core Thumbnail & Preview Generator Engine
 * Instantly generates ultra-lightweight WebP thumbnails (< 15 KB)
 * for Images, Videos, and PDF Documents.
 */
export class ThumbnailEngine {
  /**
   * Generate a WebP thumbnail blob for any supported file.
   * 
   * @param {File} file - Original Image, Video, or PDF file
   * @param {Object} [options]
   * @param {number} [options.size=150] - Target square width/height in px (e.g. 150px)
   * @param {number} [options.quality=0.80] - WebP quality factor (0.1 to 1.0)
   * @param {function} [options.onProgress] - Progress reporting callback
   * @returns {Promise<Object>} Thumbnail result object
   */
  static async generate(file, options = {}) {
    const startTime = performance.now();
    const {
      size = 150,
      quality = 0.80,
      onProgress = () => {}
    } = options;

    onProgress(10, `Menganalisis jenis file (${file.type || file.name})...`);

    let thumbnailCanvas = null;
    let fileType = 'unknown';

    if (file.type.startsWith('image/')) {
      fileType = 'image';
      onProgress(40, 'Memproses foto & melakukan scaling Canvas WebP...');
      thumbnailCanvas = await this._generateImageThumbnail(file, size);
    } else if (file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
      fileType = 'video';
      onProgress(40, 'Mengambil cuplikan video frame (snapshot)...');
      thumbnailCanvas = await this._generateVideoThumbnail(file, size);
    } else if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      fileType = 'pdf';
      onProgress(40, 'Mendokumentasikan snapshot Halaman 1 PDF...');
      thumbnailCanvas = await this._generatePdfThumbnail(file, size);
    } else {
      throw new Error('Jenis file tidak didukung untuk pembuatan thumbnail preview.');
    }

    onProgress(85, 'Mengenkode thumbnail ke format WebP ringan (< 15 KB)...');

    const thumbnailBlob = await this._canvasToWebp(thumbnailCanvas, quality);

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    const originalUrl = URL.createObjectURL(file);
    const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

    onProgress(100, 'Thumbnail preview berhasil dibuat!');

    return {
      fileName: file.name,
      fileType,
      originalSize: file.size,
      thumbnailSize: thumbnailBlob.size,
      width: size,
      height: size,
      originalUrl,
      thumbnailUrl,
      thumbnailBlob,
      processingTimeMs,
      timestamp: Date.now()
    };
  }

  static async _generateImageThumbnail(file, targetSize) {
    const img = new Image();
    const url = URL.createObjectURL(file);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        // Draw cover-crop scale
        const scale = Math.max(targetSize / img.width, targetSize / img.height);
        const x = (targetSize - img.width * scale) / 2;
        const y = (targetSize - img.height * scale) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Gagal membaca gambar untuk thumbnail.'));
      };
      img.src = url;
    });
  }

  static async _generateVideoThumbnail(file, targetSize) {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    return new Promise((resolve, reject) => {
      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        const scale = Math.max(targetSize / video.videoWidth, targetSize / video.videoHeight);
        const x = (targetSize - video.videoWidth * scale) / 2;
        const y = (targetSize - video.videoHeight * scale) / 2;

        ctx.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Gagal mengambil frame snapshot video.'));
      };
    });
  }

  static async _generatePdfThumbnail(file, targetSize) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.0 });
    const scale = Math.max(targetSize / viewport.width, targetSize / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport
    }).promise;

    return canvas;
  }

  static _canvasToWebp(canvas, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/webp',
        quality
      );
    });
  }
}
