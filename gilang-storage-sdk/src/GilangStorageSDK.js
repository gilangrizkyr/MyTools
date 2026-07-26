import { SecurityEngine } from './core/SecurityEngine.js';
import { ImageCompressor } from './core/ImageCompressor.js';
import { PdfCompressor } from './core/PdfCompressor.js';
import { DocCompressor } from './core/DocCompressor.js';
import { ThumbnailEngine } from './core/ThumbnailEngine.js';
import { MediaCompressor } from './core/MediaCompressor.js';

/**
 * Master Gilang Storage Client SDK v1.1.0
 * Unified 1-Line Master Integration for Gilang Storage Ecosystem:
 * 
 * FLOW:
 *   Website input file → SDK intercept → Security sanitize → Compress →
 *   Generate thumbnail → Upload to UnaraStorage → Done ✅
 * 
 * USAGE (simplest):
 *   GilangStorageSDK.configure({ apiEndpoint: 'https://api.unarastorage.com/upload', apiKey: 'your-key' });
 *   GilangStorageSDK.attachToInput('#myFileInput');
 * 
 *   // Or manual:
 *   const result = await GilangStorageSDK.compressAndUpload(file);
 */
export class GilangStorageSDK {
  // ─── Global Configuration ─────────────────────────────────────────────────

  static _config = {
    apiEndpoint: null,
    apiKey: null,
    authToken: null,
    maxImageSizeBytes: 2 * 1024 * 1024,     // 2 MB
    maxVideoSizeBytes: 15 * 1024 * 1024,    // 15 MB
    maxPdfSizeBytes: 2 * 1024 * 1024,       // 2 MB
    maxDocSizeBytes: 2 * 1024 * 1024,       // 2 MB
    thumbnailSize: 150,
    generateThumbnail: true,
    skipSecurity: false,
    fieldName: 'file',
    thumbnailFieldName: 'thumbnail',
    onProgress: null,
    onSuccess: null,
    onError: null,
  };

  /**
   * Set global SDK configuration once — applies to all subsequent calls.
   * 
   * @param {Object} config
   * @param {string} config.apiEndpoint - UnaraStorage upload endpoint URL
   * @param {string} [config.apiKey] - API key for UnaraStorage authentication
   * @param {string} [config.authToken] - Bearer token (alternative to apiKey)
   * @param {number} [config.maxImageSizeBytes] - Max image size after compress (default 2 MB)
   * @param {number} [config.maxVideoSizeBytes] - Max video size after compress (default 15 MB)
   * @param {number} [config.maxPdfSizeBytes] - Max PDF size after compress (default 2 MB)
   * @param {number} [config.maxDocSizeBytes] - Max doc size after compress (default 2 MB)
   * @param {number} [config.thumbnailSize] - Thumbnail dimension in px (default 150)
   * @param {boolean} [config.generateThumbnail] - Whether to generate WebP thumbnail (default true)
   * @param {boolean} [config.skipSecurity] - Skip security scan (default false)
   * @param {string} [config.fieldName] - FormData field name for file (default 'file')
   * @param {string} [config.thumbnailFieldName] - FormData field name for thumbnail (default 'thumbnail')
   * @param {function} [config.onProgress] - Global progress callback (percent, statusText)
   * @param {function} [config.onSuccess] - Global success callback (result)
   * @param {function} [config.onError] - Global error callback (error)
   */
  static configure(config = {}) {
    GilangStorageSDK._config = { ...GilangStorageSDK._config, ...config };
    console.info('[GilangStorageSDK] Configured:', {
      apiEndpoint: GilangStorageSDK._config.apiEndpoint,
      hasAuth: !!(GilangStorageSDK._config.apiKey || GilangStorageSDK._config.authToken)
    });
  }

  // ─── Core Pipeline ────────────────────────────────────────────────────────

  /**
   * Run the full Gilang Storage Pipeline on a file:
   * Security → Compress → Thumbnail → Upload (if apiEndpoint configured)
   * 
   * @param {File} file
   * @param {Object} [options] - Override per-call options (same as configure())
   * @returns {Promise<Object>} Full pipeline result
   */
  static async process(file, options = {}) {
    const cfg = { ...GilangStorageSDK._config, ...options };
    const onProgress = options.onProgress || cfg.onProgress || (() => {});
    const startTime = performance.now();

    // ── Step 1: Security & EXIF GPS Sanitize ──────────────────────────────
    onProgress(10, 'Langkah 1/3: Sanitasi keamanan biner & pembersihan GPS EXIF...');
    let cleanFile = file;

    if (!cfg.skipSecurity) {
      try {
        const securityRes = await SecurityEngine.validateAndSanitize(file);
        cleanFile = securityRes.sanitizedFile;
        Object.assign(cfg, { _securityMeta: {
          hexSignature: securityRes.hexSignature,
          detectedMime: securityRes.detectedMime,
          gpsStripped: securityRes.gpsStripped
        }});
      } catch (err) {
        console.warn('[GilangStorageSDK] Security scan skipped:', err.message);
        cfg._securityMeta = { hexSignature: '—', detectedMime: file.type, gpsStripped: false };
      }
    } else {
      cfg._securityMeta = { hexSignature: '—', detectedMime: file.type, gpsStripped: false };
    }

    // ── Step 2: Smart Compression by file type ─────────────────────────────
    onProgress(35, 'Langkah 2/3: Mengompresi file ke ukuran optimal...');
    let compressedFile = cleanFile;
    let compressionMeta = {
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercent: 0,
      skipped: true
    };

    try {
      const type = cleanFile.type;
      const name = cleanFile.name.toLowerCase();

      if (type.startsWith('image/')) {
        // ── Image compression ──
        const res = await ImageCompressor.compress(cleanFile, {
          maxSizeBytes: cfg.maxImageSizeBytes,
          onProgress: (p, t) => onProgress(35 + Math.round(p * 0.25), t)
        });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: res.format ? `image/${res.format}` : cleanFile.type });
        compressionMeta = {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          savingsPercent: res.savingsPercent,
          skipped: false
        };

      } else if (type === 'application/pdf' || name.endsWith('.pdf')) {
        // ── PDF compression ──
        const res = await PdfCompressor.compress(cleanFile, { maxSizeBytes: cfg.maxPdfSizeBytes });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: 'application/pdf' });
        compressionMeta = {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          savingsPercent: res.savingsPercent,
          skipped: false
        };

      } else if (/\.(docx|xlsx|pptx)$/.test(name)) {
        // ── Office document compression ──
        const res = await DocCompressor.compress(cleanFile, {
          maxSizeBytes: cfg.maxDocSizeBytes,
          onProgress: (p, t) => onProgress(35 + Math.round(p * 0.25), t)
        });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: cleanFile.type });
        compressionMeta = {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          savingsPercent: res.savingsPercent,
          skipped: false
        };

      } else if (type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/.test(name)) {
        // ── Video compression ──
        const res = await MediaCompressor.compress(cleanFile, {
          maxSizeBytes: cfg.maxVideoSizeBytes,
          forceCompress: true,
          onProgress: (p, t) => onProgress(35 + Math.round(p * 0.35), t)
        });
        compressedFile = new File([res.compressedBlob], cleanFile.name, { type: res.mimeType || cleanFile.type });
        compressionMeta = {
          originalSize: file.size,
          compressedSize: compressedFile.size,
          savingsPercent: res.savingsPercent,
          skipped: false
        };
      }
    } catch (err) {
      console.warn('[GilangStorageSDK] Compression fallback to original:', err.message);
    }

    // ── Step 3: WebP Thumbnail Generation ─────────────────────────────────
    onProgress(75, 'Langkah 3/3: Membuat foto sampul thumbnail WebP...');
    let thumbnailFile = null;

    if (cfg.generateThumbnail) {
      try {
        const type = cleanFile.type;
        const name = cleanFile.name.toLowerCase();
        const canThumb = type.startsWith('image/') || type.startsWith('video/') ||
                         type === 'application/pdf' || /\.(mp4|webm|mov|pdf|jpg|png|webp)$/.test(name);

        if (canThumb) {
          const thumbRes = await ThumbnailEngine.generate(cleanFile, { size: cfg.thumbnailSize });
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          thumbnailFile = new File([thumbRes.thumbnailBlob], `${baseName}-thumb.webp`, { type: 'image/webp' });
        }
      } catch (err) {
        console.warn('[GilangStorageSDK] Thumbnail generation skipped:', err.message);
      }
    }

    onProgress(90, 'Pipeline selesai, menyiapkan upload...');

    // ── Step 4: Upload to UnaraStorage (if endpoint configured) ───────────
    let uploadResponse = null;
    const apiEndpoint = cfg.apiEndpoint || options.apiEndpoint || null;

    if (apiEndpoint) {
      onProgress(95, 'Mengunggah file & thumbnail ke UnaraStorage...');
      uploadResponse = await GilangStorageSDK._upload(
        compressedFile,
        thumbnailFile,
        apiEndpoint,
        cfg
      );
    }

    const totalTimeMs = Math.round(performance.now() - startTime);
    onProgress(100, 'Proses Gilang Storage Pipeline selesai!');

    const result = {
      fileName: file.name,
      originalFile: file,
      processedFile: compressedFile,
      thumbnailFile,
      securityMeta: cfg._securityMeta,
      compressionMeta,
      uploadResponse,
      totalTimeMs
    };

    if (cfg.onSuccess) cfg.onSuccess(result);
    return result;
  }

  // ─── Shorthand Methods ────────────────────────────────────────────────────

  /**
   * Compress a file and upload to UnaraStorage in one call.
   * Uses global config from configure() or per-call options.
   * 
   * @param {File} file
   * @param {Object} [options] - Override options for this call
   * @returns {Promise<Object>}
   * 
   * @example
   * const result = await GilangStorageSDK.compressAndUpload(file, {
   *   apiEndpoint: 'https://api.unarastorage.com/upload',
   *   onProgress: (percent, status) => console.log(status)
   * });
   * console.log(result.uploadResponse); // UnaraStorage server response
   */
  static async compressAndUpload(file, options = {}) {
    return GilangStorageSDK.process(file, options);
  }

  /**
   * Compress only — no upload, no thumbnail.
   * 
   * @param {File} file
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  static async compressOnly(file, options = {}) {
    return GilangStorageSDK.process(file, {
      ...options,
      apiEndpoint: null,
      generateThumbnail: false
    });
  }

  // ─── Auto-Attach to UI Elements ───────────────────────────────────────────

  /**
   * Auto-attach the full pipeline to an <input type="file"> element.
   * When user picks a file, SDK automatically compresses & uploads.
   * 
   * @param {string|HTMLElement} target - CSS selector or element reference
   * @param {Object} [options]
   * @param {function} [options.onStart] - Called when processing starts
   * @param {function} [options.onSuccess] - Called with results when done
   * @param {function} [options.onError] - Called on error
   * @param {function} [options.onProgress] - Progress callback (percent, statusText)
   * @returns {{ detach: function }} - Call detach() to remove listener
   * 
   * @example
   * GilangStorageSDK.configure({ apiEndpoint: 'https://api.unarastorage.com/upload' });
   * GilangStorageSDK.attachToInput('#uploadInput', {
   *   onStart: (files) => showSpinner(),
   *   onSuccess: (results) => { hideSpinner(); showResult(results[0]); },
   *   onError: (err) => alert(err.message)
   * });
   */
  static attachToInput(target, options = {}) {
    const inputEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[GilangStorageSDK] Target must be an <input type="file">');
      return null;
    }

    const handler = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const onStart = options.onStart || GilangStorageSDK._config.onStart || (() => {});
      const onSuccess = options.onSuccess || GilangStorageSDK._config.onSuccess || (() => {});
      const onError = options.onError || GilangStorageSDK._config.onError || (() => {});

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

    inputEl.addEventListener('change', handler);
    return { detach: () => inputEl.removeEventListener('change', handler) };
  }

  /**
   * Auto-attach pipeline to a drag & drop zone element.
   * Handles dragover, dragleave, drop events automatically.
   * 
   * @param {string|HTMLElement} target - CSS selector or element reference
   * @param {Object} [options] - Same as attachToInput options
   * @returns {{ detach: function }}
   * 
   * @example
   * GilangStorageSDK.attachToDropzone('#dropzone', {
   *   onSuccess: (results) => console.log('Uploaded!', results)
   * });
   */
  static attachToDropzone(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) { console.error('[GilangStorageSDK] Dropzone element not found'); return null; }

    const onStart = options.onStart || GilangStorageSDK._config.onStart || (() => {});
    const onSuccess = options.onSuccess || GilangStorageSDK._config.onSuccess || (() => {});
    const onError = options.onError || GilangStorageSDK._config.onError || (() => {});

    const dragover = (e) => { e.preventDefault(); el.classList.add('gs-dragover'); };
    const dragleave = () => el.classList.remove('gs-dragover');
    const drop = async (e) => {
      e.preventDefault();
      el.classList.remove('gs-dragover');
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      onStart(files);
      try {
        const results = [];
        for (const file of files) {
          const res = await GilangStorageSDK.process(file, options);
          results.push(res);
        }
        onSuccess(results);
      } catch (err) {
        console.error('[GilangStorageSDK] Drop pipeline error:', err);
        onError(err);
      }
    };

    el.addEventListener('dragover', dragover);
    el.addEventListener('dragleave', dragleave);
    el.addEventListener('drop', drop);

    return {
      detach: () => {
        el.removeEventListener('dragover', dragover);
        el.removeEventListener('dragleave', dragleave);
        el.removeEventListener('drop', drop);
      }
    };
  }

  // ─── Internal Upload Helper ───────────────────────────────────────────────

  static async _upload(compressedFile, thumbnailFile, apiEndpoint, cfg) {
    const formData = new FormData();
    formData.append(cfg.fieldName || 'file', compressedFile);
    if (thumbnailFile) formData.append(cfg.thumbnailFieldName || 'thumbnail', thumbnailFile);

    const headers = {};
    if (cfg.apiKey) headers['X-API-Key'] = cfg.apiKey;
    if (cfg.authToken) headers['Authorization'] = `Bearer ${cfg.authToken}`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[GilangStorageSDK] Upload failed (${response.status}): ${errText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? await response.json() : await response.text();
  }
}

// ─── Browser global export ────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.GilangStorageSDK = GilangStorageSDK;
}
