import { ThumbnailEngine } from '../core/ThumbnailEngine.js';

/**
 * ThumbnailSDK
 * Integration SDK for external websites and Unara Storage
 * to generate ultra-lightweight WebP previews (< 15 KB) for file list views.
 */
export class ThumbnailSDK {
  /**
   * Generate a WebP thumbnail File/Blob for any Image, Video, or PDF file.
   * 
   * @param {File} file - Original file
   * @param {Object} [options]
   * @param {number} [options.size=150] - Square width/height in px
   * @returns {Promise<File>} Thumbnail File object
   */
  static async generate(file, options = {}) {
    const result = await ThumbnailEngine.generate(file, options);

    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const thumbFile = new File(
      [result.thumbnailBlob],
      `${baseName}-thumb.webp`,
      { type: 'image/webp', lastModified: Date.now() }
    );

    thumbFile.thumbnailMeta = {
      originalSize: result.originalSize,
      thumbnailSize: result.thumbnailSize,
      fileType: result.fileType,
      processingTimeMs: result.processingTimeMs
    };

    return thumbFile;
  }

  /**
   * Auto-attach thumbnail preview generator to an HTML <input type="file"> element.
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[ThumbnailSDK] Target element must be an <input type="file">');
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
        const thumbnails = [];
        for (const file of files) {
          const thumb = await ThumbnailSDK.generate(file, options);
          thumbnails.push(thumb);
        }
        onSuccess(thumbnails);
      } catch (err) {
        console.error('[ThumbnailSDK] Failed to generate thumbnail:', err);
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
  window.ThumbnailSDK = ThumbnailSDK;
}
