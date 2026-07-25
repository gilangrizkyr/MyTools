/**
 * Format bytes to human readable string (e.g. 15.4 KB, 1.2 MB)
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
 * Get sanitized clean filename
 */
export function getSanitizedFilename(name) {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
  const ext = lastDot !== -1 ? name.substring(lastDot + 1) : 'bin';
  return `${base}-secured.${ext}`;
}
