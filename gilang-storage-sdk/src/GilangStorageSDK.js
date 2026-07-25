import { SecurityEngine } from '../../file-security-guard/src/core/SecurityEngine.js';
import { ImageCompressor } from '../../image-optimizer/src/core/ImageCompressor.js';
import { PdfCompressor } from '../../pdf-optimizer/src/core/PdfCompressor.js';
import { DocCompressor } from '../../doc-excel-optimizer/src/core/DocCompressor.js';
import { ThumbnailEngine } from '../../thumbnail-generator/src/core/ThumbnailEngine.js';

/**
 * Master Gilang Storage Client SDK
 * Unified 1-Line Master Integration for Gilang Storage Ecosystem:
 * 1. Security & EXIF GPS Sanitizer
 * 2. High-Fidelity Smart File Compressor (< 2 MB)
 * 3. Instant WebP Thumbnail Generator (< 15 KB)
 */
export class GilangStorageSDK {
  /**
   * Process any incoming file through the full Gilang Storage Pipeline.
   * 
   * @param {File} file - Original file from user input
   * @param {Object} [options]
   * @param {string} [options.apiEndpoint] - Optional Storage API URL (e.g. http://localhost:5000/api/upload)
   * @param {function} [options.onProgress] - Progress reporting callback
   * @returns {Promise<Object>} Unified Gilang Storage payload result
   */
  static async process(file, options = {}) {
    const startTime = performance.now();
    const {
      apiEndpoint = null,
      onProgress = () => {}
    } = options;

    onProgress(10, 'Langkah 1/3: Sanitasi keamanan biner & pembersihan GPS EXIF...');

    // 1. Security & EXIF GPS Check
    const securityRes = await SecurityEngine.validateAndSanitize(file);
    const cleanFile = securityRes.sanitizedFile;

    onProgress(40, 'Langkah 2/3: Mengompresi file ke target web (< 2 MB)...');

    // 2. Smart File Compressor Pipeline
    let compressedFile = cleanFile;
    let compressionMeta = { originalSize: file.size, compressedSize: file.size, savingsPercent: 0 };

    try {
      if (cleanFile.type.startsWith('image/')) {
        const res = await ImageCompressor.compress(cleanFile, { maxSizeBytes: 2 * 1024 * 1024 });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: cleanFile.type });
        compressionMeta = { originalSize: file.size, compressedSize: compressedFile.size, savingsPercent: res.savingsPercent };
      } else if (cleanFile.type === 'application/pdf' || /\.pdf$/i.test(cleanFile.name)) {
        const res = await PdfCompressor.compress(cleanFile, { maxSizeBytes: 2 * 1024 * 1024 });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: 'application/pdf' });
        compressionMeta = { originalSize: file.size, compressedSize: compressedFile.size, savingsPercent: res.savingsPercent };
      } else if (/\.(docx|xlsx|pptx)$/i.test(cleanFile.name)) {
        const res = await DocCompressor.compress(cleanFile, { maxSizeBytes: 2 * 1024 * 1024 });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: cleanFile.type });
        compressionMeta = { originalSize: file.size, compressedSize: compressedFile.size, savingsPercent: res.savingsPercent };
      }
    } catch (err) {
      console.warn('[GilangStorageSDK] Compression fallback to original file:', err);
    }

    onProgress(75, 'Langkah 3/3: Membuat foto sampul thumbnail WebP (< 15 KB)...');

    // 3. WebP Thumbnail Generator
    let thumbnailFile = null;
    try {
      if (cleanFile.type.startsWith('image/') || cleanFile.type.startsWith('video/') || cleanFile.type === 'application/pdf') {
        const thumbRes = await ThumbnailEngine.generate(cleanFile, { size: 150 });
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        thumbnailFile = new File([thumbRes.thumbnailBlob], `${baseName}-thumb.webp`, { type: 'image/webp' });
      }
    } catch (err) {
      console.warn('[GilangStorageSDK] Thumbnail generation skipped:', err);
    }

    onProgress(95, 'Menyiapkan payload Gilang Storage...');

    let uploadResponse = null;

    // 4. Optional Automatic Backend Upload
    if (apiEndpoint) {
      onProgress(98, 'Mengunggah file & thumbnail ke server Storage...');
      const formData = new FormData();
      formData.append('file', compressedFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const res = await fetch(apiEndpoint, { method: 'POST', body: formData });
      uploadResponse = await res.json();
    }

    const endTime = performance.now();
    onProgress(100, 'Proses Gilang Storage Pipeline selesai sempurna!');

    return {
      fileName: file.name,
      originalFile: file,
      processedFile: compressedFile,
      thumbnailFile,
      securityMeta: {
        hexSignature: securityRes.hexSignature,
        detectedMime: securityRes.detectedMime,
        gpsStripped: securityRes.gpsStripped
      },
      compressionMeta,
      uploadResponse,
      totalTimeMs: Math.round(endTime - startTime)
    };
  }

  /**
   * Auto-attach Gilang Storage pipeline to an HTML <input type="file"> element.
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[GilangStorageSDK] Target element must be an <input type="file">');
      return null;
    }

    const handleFileChange = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const onStart = options.onStart || (() => {});
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});

      onStart(files);

      try {
        const results = [];
        for (const file of files) {
          const res = await GilangStorageSDK.process(file, options);
          results.push(res);
        }
        onSuccess(results);
      } catch (err) {
        console.error('[GilangStorageSDK] Pipeline error:', err);
        onError(err);
      }
    };

    inputEl.addEventListener('change', handleFileChange);

    return {
      detach: () => inputEl.removeEventListener('change', handleFileChange)
    };
  }
}

if (typeof window !== 'undefined') {
  window.GilangStorageSDK = GilangStorageSDK;
}
