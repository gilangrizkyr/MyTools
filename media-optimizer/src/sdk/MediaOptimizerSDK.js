import { MediaCompressor } from '../core/MediaCompressor.js';

/**
 * MediaOptimizer SDK
 * Light-weight integration SDK for external websites to auto-compress video & audio
 * down to < 15 MB on file upload while preserving aspect ratio & playback quality.
 */
export class MediaOptimizerSDK {
  /**
   * Compress a Media File (Video/Audio) object automatically to target size (< 15 MB default).
   * 
   * @param {File} file - Original video/audio file input
   * @param {Object} [options] - Compression options
   * @param {number} [options.maxSizeBytes=15728640] - Target max file size (15 MB)
   * @returns {Promise<File>} Compressed File object
   */
  static async compress(file, options = {}) {
    if (!file || (!file.type.startsWith('video/') && !file.type.startsWith('audio/'))) {
      return file;
    }

    const maxSizeBytes = options.maxSizeBytes || 15 * 1024 * 1024; // 15 MB

    const result = await MediaCompressor.compress(file, {
      maxSizeBytes,
      mode: options.mode || 'video'
    });

    const compressedFile = new File(
      [result.compressedBlob],
      file.name,
      {
        type: result.compressedBlob.type || file.type,
        lastModified: Date.now()
      }
    );

    compressedFile.optimizerMeta = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      savingsPercent: result.savingsPercent,
      duration: result.duration
    };

    return compressedFile;
  }

  /**
   * Auto-attach compression interceptor to an HTML <input type="file"> element for video/audio.
   * 
   * @param {string|HTMLInputElement} target - CSS Selector or HTMLInputElement
   * @param {Object} [options] - Configuration options
   * @param {number} [options.maxSizeBytes=15728640] - Target max size (15 MB)
   * @param {function} [options.onStart] - Callback when compression starts
   * @param {function} [options.onSuccess] - Callback when compression finishes
   * @param {function} [options.onError] - Callback when compression fails
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[MediaOptimizerSDK] Target element must be an <input type="file">');
      return null;
    }

    const handleFileChange = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const onStart = options.onStart || (() => {});
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});

      onStart(files);
      inputEl.dispatchEvent(new CustomEvent('mediaoptimizer:start', { detail: { files } }));

      try {
        const compressedFiles = [];
        const dt = new DataTransfer();

        for (const file of files) {
          if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
            const compressed = await MediaOptimizerSDK.compress(file, options);
            compressedFiles.push(compressed);
            dt.items.add(compressed);
          } else {
            compressedFiles.push(file);
            dt.items.add(file);
          }
        }

        inputEl.files = dt.files;

        onSuccess(compressedFiles);
        inputEl.dispatchEvent(new CustomEvent('mediaoptimizer:success', { detail: { files: compressedFiles } }));
      } catch (err) {
        console.error('[MediaOptimizerSDK] Failed to auto-compress media files:', err);
        onError(err);
        inputEl.dispatchEvent(new CustomEvent('mediaoptimizer:error', { detail: { error: err } }));
      }
    };

    inputEl.addEventListener('change', handleFileChange);

    return {
      detach: () => inputEl.removeEventListener('change', handleFileChange)
    };
  }
}

// Global window attachment for UMD / script tag usage
if (typeof window !== 'undefined') {
  window.MediaOptimizerSDK = MediaOptimizerSDK;
}
