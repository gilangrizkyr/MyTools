import JSZip from 'jszip';
import { ImageCompressor } from '../../../image-optimizer/src/core/ImageCompressor.js';

/**
 * Core Office Document & Spreadsheet Optimizer Engine
 * Optimizes .docx, .xlsx, and .pptx files by compressing internal embedded media assets
 * while keeping 100% of text, formulas, layout XML, and formatting completely untouched.
 */
export class DocCompressor {
  /**
   * Compress an Office document file (.docx, .xlsx, .pptx).
   * 
   * @param {File} file - Original Office document file
   * @param {Object} [options]
   * @param {number} [options.maxSizeBytes=5242880] - Target max size (default 5MB)
   * @param {function} [options.onProgress] - Progress reporting callback
   * @returns {Promise<Object>} Compression result object
   */
  static async compress(file, options = {}) {
    const startTime = performance.now();
    const {
      maxSizeBytes = 5 * 1024 * 1024,
      onProgress = () => {}
    } = options;

    onProgress(10, 'Membaca struktur wadah dokumen Office (.docx/.xlsx/.pptx)...');

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    onProgress(30, 'Menganalisis file media internal (gambar, slide, grafik)...');

    const mediaFiles = [];
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && /\.(png|jpe?g|webp|bmp)$/i.test(relativePath)) {
        mediaFiles.push({ relativePath, zipEntry });
      }
    });

    let compressedImageCount = 0;
    let totalImages = mediaFiles.length;

    if (totalImages > 0) {
      for (let i = 0; i < mediaFiles.length; i++) {
        const { relativePath, zipEntry } = mediaFiles[i];
        const percent = 30 + Math.round(((i + 1) / totalImages) * 50);
        onProgress(percent, `Mengompresi gambar slide/dokumen (${i + 1}/${totalImages})...`);

        try {
          const imgBlob = await zipEntry.async('blob');
          const ext = relativePath.substring(relativePath.lastIndexOf('.')).toLowerCase();
          const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

          const imgFile = new File([imgBlob], `internal${ext}`, { type: mimeType });

          // Compress internal image while preserving 1:1 original resolution & pristine colors
          const compressedRes = await ImageCompressor.compress(imgFile, {
            maxSizeBytes: 1 * 1024 * 1024, // 1 MB limit per image
            autoTargetSize: true
          });

          if (compressedRes.compressedBlob.size < imgBlob.size) {
            zip.file(relativePath, compressedRes.compressedBlob);
            compressedImageCount++;
          }
        } catch (e) {
          console.warn(`Gagal mengompresi media internal ${relativePath}:`, e);
        }
      }
    }

    onProgress(85, 'Membungkus ulang arsip dokumen Office dengan DEFLATE presisi...');

    const finalBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    // Fallback: If compressed blob is somehow larger, return original file
    const outputBlob = finalBlob.size < file.size ? finalBlob : file;

    const originalUrl = URL.createObjectURL(file);
    const compressedUrl = URL.createObjectURL(outputBlob);

    const savingsBytes = Math.max(0, file.size - outputBlob.size);
    const savingsPercent = file.size > 0 ? ((savingsBytes / file.size) * 100).toFixed(1) : 0;

    onProgress(100, 'Pengoptimalan dokumen Office selesai!');

    return {
      fileName: file.name,
      originalSize: file.size,
      compressedSize: outputBlob.size,
      savingsBytes,
      savingsPercent: Number(savingsPercent),
      compressedImageCount,
      totalImages,
      originalUrl,
      compressedUrl,
      compressedBlob: outputBlob,
      processingTimeMs,
      timestamp: Date.now()
    };
  }
}
