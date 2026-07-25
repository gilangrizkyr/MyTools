/**
 * Helper formatters for PDF Optimizer
 */

export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getOptimizedPdfFilename(name) {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot !== -1 ? name.substring(0, lastDot) : name;
  return `${base}-optimized.pdf`;
}
