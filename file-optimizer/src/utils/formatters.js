/**
 * Utility functions for formatting values in UI
 */

/**
 * Format bytes to readable human string (e.g. 16.4 MB, 820 KB)
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get readable format label
 * @param {string} mimeType 
 * @returns {string}
 */
export function getFormatBadgeLabel(mimeType) {
  switch (mimeType) {
    case 'image/webp':
      return 'WEBP';
    case 'image/avif':
      return 'AVIF';
    case 'image/jpeg':
    case 'image/jpg':
      return 'JPEG';
    case 'image/png':
      return 'PNG';
    default:
      return (mimeType || 'UNKNOWN').split('/')[1]?.toUpperCase() || 'FILE';
  }
}

/**
 * Sanitize filename for output download
 * @param {string} name 
 * @param {string} format 
 * @returns {string}
 */
export function getOptimizedFilename(name, format) {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
  let ext = 'webp';

  if (format === 'image/jpeg' || format === 'image/jpg') ext = 'jpg';
  else if (format === 'image/png') ext = 'png';
  else if (format === 'image/avif') ext = 'avif';
  else if (format === 'image/webp') ext = 'webp';

  return `${base}-optimized.${ext}`;
}
