import { ImageCompressor } from '../core/ImageCompressor.js';

/**
 * FileOptimizer SDK
 * Light-weight integration SDK for external websites to auto-compress images
 * down to < 2 MB on file upload while preserving original resolution.
 */
export class FileOptimizerSDK {
  /**
   * Compress a File object automatically to target size (< 2 MB default).
   * 
   * @param {File} file - Original file input
   * @param {Object} [options] - Compression options
   * @param {number} [options.maxSizeBytes=2097152] - Target max file size (2 MB)
   * @param {string} [options.format='image/webp'] - Output format ('image/webp', 'image/jpeg', 'image/png')
   * @param {number} [options.quality=0.82] - Default quality factor
   * @returns {Promise<File>} Compressed File object
   */
  static async compress(file, options = {}) {
    if (!file || !file.type.startsWith('image/')) {
      return file;
    }

    const maxSizeBytes = options.maxSizeBytes || 2 * 1024 * 1024; // 2 MB
    const format = options.format || 'image/webp';

    const result = await ImageCompressor.compress(file, {
      maxSizeBytes,
      format,
      quality: options.quality || 0.82,
      autoTargetSize: true
    });

    // Construct a new File object with original filename and compressed blob
    const compressedFile = new File(
      [result.compressedBlob],
      file.name,
      {
        type: result.format,
        lastModified: Date.now()
      }
    );

    // Attach compression metadata property to File object
    compressedFile.optimizerMeta = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      savingsPercent: result.savingsPercent,
      width: result.width,
      height: result.height,
      resolutionString: result.resolutionString
    };

    return compressedFile;
  }

  /**
   * Auto-attach compression interceptor to an HTML <input type="file"> element.
   * When the user picks a file, it is automatically compressed to < 2 MB before form submit.
   * 
   * @param {string|HTMLInputElement} target - CSS Selector or HTMLInputElement
   * @param {Object} [options] - Configuration options
   * @param {number} [options.maxSizeBytes=2097152] - Target max size (2 MB)
   * @param {function} [options.onStart] - Callback when compression starts
   * @param {function} [options.onSuccess] - Callback when compression finishes
   * @param {function} [options.onError] - Callback when compression fails
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[FileOptimizerSDK] Target element must be an <input type="file">');
      return null;
    }

    const handleFileChange = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const onStart = options.onStart || (() => {});
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});

      onStart(files);
      inputEl.dispatchEvent(new CustomEvent('fileoptimizer:start', { detail: { files } }));

      try {
        const compressedFiles = [];
        const dt = new DataTransfer();

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            const compressed = await FileOptimizerSDK.compress(file, options);
            compressedFiles.push(compressed);
            dt.items.add(compressed);
          } else {
            compressedFiles.push(file);
            dt.items.add(file);
          }
        }

        // Replace input files with auto-compressed files (< 2 MB)
        inputEl.files = dt.files;

        onSuccess(compressedFiles);
        inputEl.dispatchEvent(new CustomEvent('fileoptimizer:success', { detail: { files: compressedFiles } }));
      } catch (err) {
        console.error('[FileOptimizerSDK] Failed to auto-compress files:', err);
        onError(err);
        inputEl.dispatchEvent(new CustomEvent('fileoptimizer:error', { detail: { error: err } }));
      }
    };

    inputEl.addEventListener('change', handleFileChange);

    // Return cleanup handle
    return {
      detach: () => inputEl.removeEventListener('change', handleFileChange)
    };
  }

  /**
   * Helper to automatically compress all image files inside a FormData object.
   * Useful when sending AJAX / fetch() uploads.
   * 
   * @param {FormData} formData - Original FormData object
   * @param {Object} [options] - Compression options
   * @returns {Promise<FormData>} New FormData with compressed files < 2 MB
   */
  static async compressFormData(formData, options = {}) {
    const newFormData = new FormData();

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.type.startsWith('image/')) {
        const compressedFile = await FileOptimizerSDK.compress(value, options);
        newFormData.append(key, compressedFile, compressedFile.name);
      } else {
        newFormData.append(key, value);
      }
    }

    return newFormData;
  }
}

// Global window attachment for UMD / script tag usage
if (typeof window !== 'undefined') {
  window.FileOptimizerSDK = FileOptimizerSDK;
}
