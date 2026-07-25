/**
 * Formatters & CSV Export utilities for OCR Scanner
 */

export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

export function generateCsvData(records) {
  const headers = ['Nama Merchant/Toko', 'Tanggal', 'Total (Rp)', 'Subtotal (Rp)', 'Pajak (Rp)', 'Waktu Proses (ms)'];
  const rows = records.map(r => [
    `"${(r.merchant || '').replace(/"/g, '""')}"`,
    `"${(r.date || '').replace(/"/g, '""')}"`,
    r.totalAmount || 0,
    r.subtotal || 0,
    r.tax || 0,
    r.processingTimeMs || 0
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function downloadCsvFile(csvContent, filename = 'receipt-extraction-data.csv') {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
