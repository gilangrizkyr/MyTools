import { SecurityEngine } from '../core/SecurityEngine.js';

/**
 * SecurityGuardSDK
 * Integration SDK for external websites and Unara Storage
 * to validate Magic Bytes signatures & strip EXIF GPS location data.
 */
export class SecurityGuardSDK {
  /**
   * Validate and sanitize a file.
   * 
   * @param {File} file - Original file
   * @param {Object} [options]
   * @returns {Promise<File>} Clean & secure File object
   */
  static async validate(file, options = {}) {
    const result = await SecurityEngine.validateAndSanitize(file, options);
    const cleanFile = result.sanitizedFile;

    cleanFile.securityMeta = {
      detectedMime: result.detectedMime,
      hexSignature: result.hexSignature,
      gpsStripped: result.gpsStripped,
      xssCleaned: result.xssCleaned,
      isSecure: true
    };

    return cleanFile;
  }

  /**
   * Auto-attach security validation interceptor to an HTML <input type="file"> element.
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[SecurityGuardSDK] Target element must be an <input type="file">');
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
        const cleanFiles = [];
        const dt = new DataTransfer();

        for (const file of files) {
          const clean = await SecurityGuardSDK.validate(file, options);
          cleanFiles.push(clean);
          dt.items.add(clean);
        }

        inputEl.files = dt.files;
        onSuccess(cleanFiles);
      } catch (err) {
        console.error('[SecurityGuardSDK] Security validation failed:', err);
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
  window.SecurityGuardSDK = SecurityGuardSDK;
}
