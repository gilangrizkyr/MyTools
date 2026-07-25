import { PdfCompressor } from '../core/PdfCompressor.js';

/**
 * PdfOptimizer SDK
 * Light-weight integration SDK for external websites to auto-compress PDF files
 * down to < 2 MB on file upload while preserving text & vector precision.
 */
export class PdfOptimizerSDK {
  /**
   * Compress a PDF File object automatically to target size (< 2 MB default).
   * 
   * @param {File} file - Original PDF file input
   * @param {Object} [options] - Compression options
   * @param {number} [options.maxSizeBytes=2097152] - Target max file size (2 MB)
   * @returns {Promise<File>} Compressed File object
   */
  static async compress(file, options = {}) {
    if (!file || (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf')) {
      return file;
    }

    const maxSizeBytes = options.maxSizeBytes || 2 * 1024 * 1024; // 2 MB

    const result = await PdfCompressor.compress(file, {
      maxSizeBytes,
      imageQuality: options.imageQuality || 0.75
    });

    // Construct a new File object with original filename and compressed blob
    const compressedFile = new File(
      [result.compressedBlob],
      file.name,
      {
        type: 'application/pdf',
        lastModified: Date.now()
      }
    );

    // Attach compression metadata property to File object
    compressedFile.optimizerMeta = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      savingsPercent: result.savingsPercent,
      pageCount: result.pageCount
    };

    return compressedFile;
  }

  /**
   * Auto-attach compression interceptor to an HTML <input type="file"> element for PDFs.
   * When the user picks a PDF file, it is automatically compressed to < 2 MB before form submit.
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
      console.error('[PdfOptimizerSDK] Target element must be an <input type="file">');
      return null;
    }

    const handleFileChange = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const onStart = options.onStart || (() => {});
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});

      onStart(files);
      inputEl.dispatchEvent(new CustomEvent('pdfoptimizer:start', { detail: { files } }));

      try {
        const compressedFiles = [];
        const dt = new DataTransfer();

        for (const file of files) {
          if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
            const compressed = await PdfOptimizerSDK.compress(file, options);
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
        inputEl.dispatchEvent(new CustomEvent('pdfoptimizer:success', { detail: { files: compressedFiles } }));
      } catch (err) {
        console.error('[PdfOptimizerSDK] Failed to auto-compress PDF files:', err);
        onError(err);
        inputEl.dispatchEvent(new CustomEvent('pdfoptimizer:error', { detail: { error: err } }));
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
  window.PdfOptimizerSDK = PdfOptimizerSDK;
}
