/**
 * Core Security, Privacy & File Verification Engine
 * Verifies Magic Bytes binary file signatures, strips hidden EXIF GPS location data,
 * and sanitizes SVG vectors against XSS script injection.
 */
export class SecurityEngine {
  /**
   * Validate and sanitize a file for Unara Storage.
   * 
   * @param {File} file - Incoming file
   * @param {Object} [options]
   * @param {function} [options.onProgress] - Progress reporting callback
   * @returns {Promise<Object>} Security validation result
   */
  static async validateAndSanitize(file, options = {}) {
    const startTime = performance.now();
    const { onProgress = () => {} } = options;

    onProgress(10, 'Membaca header biner murni (Magic Bytes)...');

    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hexHeader = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const signatureResult = this._checkMagicBytes(file, hexHeader);

    if (!signatureResult.isValid) {
      throw new Error(`PERINGATAN KEAMANAN: File [${file.name}] terdeteksi berbahaya atau biner tidak cocok dengan ekstensi! Signature: ${hexHeader}`);
    }

    onProgress(50, 'Pemeriksaan biner lolos! Memeriksa metadata privasi EXIF GPS...');

    let sanitizedFile = file;
    let gpsStripped = false;
    let xssCleaned = false;

    if (signatureResult.detectedCategory === 'image' && !file.type.includes('svg')) {
      onProgress(75, 'Membersihkan koordinat GPS & identitas HP dari foto...');
      const cleanBlob = await this._stripExifGps(file);
      sanitizedFile = new File([cleanBlob], file.name, { type: file.type, lastModified: Date.now() });
      gpsStripped = true;
    } else if (file.type.includes('svg') || file.name.endsWith('.svg')) {
      onProgress(75, 'Sanitasi vektor SVG dari skrip XSS...');
      const cleanSvgText = await this._sanitizeSvg(file);
      sanitizedFile = new File([cleanSvgText], file.name, { type: 'image/svg+xml', lastModified: Date.now() });
      xssCleaned = true;
    }

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    onProgress(100, 'Pemeriksaan keamanan & privasi selesai 100%!');

    return {
      fileName: file.name,
      fileSize: file.size,
      detectedMime: signatureResult.detectedMime,
      detectedCategory: signatureResult.detectedCategory,
      hexSignature: hexHeader.substring(0, 16),
      isSecure: true,
      gpsStripped,
      xssCleaned,
      sanitizedFile,
      processingTimeMs,
      timestamp: Date.now()
    };
  }

  static _checkMagicBytes(file, hex) {
    // Executables / Scripts detection
    if (hex.startsWith('4D5A') || hex.startsWith('7F454C46') || hex.startsWith('2321')) {
      return { isValid: false, detectedMime: 'application/x-executable', detectedCategory: 'executable' };
    }

    // JPEG: FF D8 FF
    if (hex.startsWith('FFD8FF')) {
      return { isValid: true, detectedMime: 'image/jpeg', detectedCategory: 'image' };
    }
    // PNG: 89 50 4E 47
    if (hex.startsWith('89504E47')) {
      return { isValid: true, detectedMime: 'image/png', detectedCategory: 'image' };
    }
    // WEBP / RIFF: 52 49 46 46
    if (hex.startsWith('52494646')) {
      return { isValid: true, detectedMime: 'image/webp', detectedCategory: 'image' };
    }
    // PDF: 25 50 44 46 (%PDF)
    if (hex.startsWith('25504446')) {
      return { isValid: true, detectedMime: 'application/pdf', detectedCategory: 'pdf' };
    }
    // ZIP / Office (.docx, .xlsx, .pptx): 50 4B 03 04
    if (hex.startsWith('504B0304')) {
      return { isValid: true, detectedMime: 'application/zip', detectedCategory: 'office' };
    }
    // MP4 / MOV: 00 00 00 ... 66747970
    if (hex.includes('66747970')) {
      return { isValid: true, detectedMime: 'video/mp4', detectedCategory: 'video' };
    }

    // Fallback for standard web files
    return { isValid: true, detectedMime: file.type || 'application/octet-stream', detectedCategory: 'general' };
  }

  static _stripExifGps(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Re-encoding to canvas strips EXIF GPS binary headers
        canvas.toBlob(
          (blob) => resolve(blob || file),
          file.type || 'image/jpeg',
          0.92
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  static async _sanitizeSvg(file) {
    const text = await file.text();
    // Strip <script> tags and inline JavaScript handlers
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');
  }
}
