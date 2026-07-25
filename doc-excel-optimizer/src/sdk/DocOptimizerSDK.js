import { DocCompressor } from '../core/DocCompressor.js';

/**
 * DocOptimizer SDK
 * Light-weight integration SDK for external websites and Unara Storage
 * to auto-compress Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) documents.
 */
export class DocOptimizerSDK {
  /**
   * Auto-compress an Office document File object.
   * 
   * @param {File} file - Original Office File
   * @param {Object} [options]
   * @returns {Promise<File>} Compressed File object
   */
  static async compress(file, options = {}) {
    if (!file || !/\.(docx|xlsx|pptx)$/i.test(file.name)) {
      return file;
    }

    const result = await DocCompressor.compress(file, options);

    const compressedFile = new File(
      [result.compressedBlob],
      file.name,
      {
        type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        lastModified: Date.now()
      }
    );

    compressedFile.optimizerMeta = {
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      savingsPercent: result.savingsPercent,
      compressedImageCount: result.compressedImageCount
    };

    return compressedFile;
  }

  /**
   * Auto-attach compression interceptor to an HTML <input type="file"> element.
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[DocOptimizerSDK] Target must be an <input type="file">');
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
        const compressedFiles = [];
        const dt = new DataTransfer();

        for (const file of files) {
          if (/\.(docx|xlsx|pptx)$/i.test(file.name)) {
            const compressed = await DocOptimizerSDK.compress(file, options);
            compressedFiles.push(compressed);
            dt.items.add(compressed);
          } else {
            compressedFiles.push(file);
            dt.items.add(file);
          }
        }

        inputEl.files = dt.files;
        onSuccess(compressedFiles);
      } catch (err) {
        console.error('[DocOptimizerSDK] Failed to auto-compress document:', err);
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
  window.DocOptimizerSDK = DocOptimizerSDK;
}
