import { createWorker } from 'tesseract.js';

/**
 * Core OCR Engine Pro
 * High-precision browser-based OCR scanner powered by Tesseract.js & Smart Pattern Intelligence
 */
export class OcrEngine {
  /**
   * Scan image file and extract structured receipt data with smart pattern matching.
   * 
   * @param {File|Blob} imageFile - Receipt or document image file
   * @param {Object} [options]
   * @param {function} [options.onProgress] - Progress callback (percentage, statusText)
   * @returns {Promise<Object>} Extracted structured data
   */
  static async scan(imageFile, options = {}) {
    const startTime = performance.now();
    const onProgress = options.onProgress || (() => {});

    onProgress(10, 'Melakukan pre-processing & peningkatan kontras foto struk...');

    // Convert file to Image Bitmap & Pre-process contrast for thermal receipts
    const processedCanvas = await this._preprocessImage(imageFile);

    onProgress(25, 'Memuat engine OCR cerdas Tesseract...');

    const worker = await createWorker('ind+eng');

    onProgress(45, 'Membaca teks dari dokumen/struk...');

    const { data: { text } } = await worker.recognize(processedCanvas);

    await worker.terminate();

    onProgress(85, 'Menganalisis & mengekstraksi data terstruktur (Nama Toko, Tanggal, Total)...');

    const merchant = this._extractMerchant(text);
    const date = this._extractDate(text);
    const totalAmount = this._extractTotalAmount(text);
    const subtotal = this._extractSubtotal(text);
    const tax = this._extractTax(text);

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    onProgress(100, 'Ekstraksi data OCR selesai 100%!');

    return {
      fileName: imageFile.name || 'scanned-receipt.png',
      merchant,
      date,
      totalAmount,
      formattedTotal: this._formatCurrency(totalAmount),
      subtotal,
      tax,
      rawText: text.trim(),
      processingTimeMs,
      timestamp: Date.now()
    };
  }

  /**
   * Adaptive Contrast Enhancement & Binarization for thermal receipts
   */
  static _preprocessImage(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale up small images for better OCR resolution
        const scale = img.width < 1000 ? 2 : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Grayscale conversion & dynamic adaptive thresholding
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Sharpen text vs background contrast
          const v = gray > 150 ? 255 : (gray < 90 ? 0 : gray);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
        }

        ctx.putImageData(imgData, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Gagal memuat gambar untuk proses OCR.'));
      };

      img.src = url;
    });
  }

  /**
   * Smart Merchant Recognition
   */
  static _extractMerchant(text) {
    const knownBrands = [
      'Indomaret', 'Alfamart', 'Starbucks', 'Lawson', 'Circle K', 'Superindo',
      'Hypermart', 'Shell', 'Pertamina', 'Solaria', 'KFC', 'McDonald', 'McD',
      'Kopi Kenangan', 'Mixue', 'Janji Jiwa', 'Gramedia', 'Guardian', 'Watsons',
      'Century', 'Transmart', 'HokBen', 'Subway', 'Point Coffee', 'Excelso',
      'J.CO', 'BreadTalk', 'Roti O', 'Roti\'O', 'Yogya', 'Hero', 'FamilyMart'
    ];

    // Check for known brand names first
    for (const brand of knownBrands) {
      const regex = new RegExp(`\\b${brand}\\b`, 'i');
      if (regex.test(text)) {
        return brand;
      }
    }

    // Inspect first 5 lines of receipt for merchant header
    const lines = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2 && !/jl\.|jalan|telp|phone|npwp|receipt|nota|struk|kasir|tanggal|selamat|terima/i.test(l));

    if (lines.length > 0) {
      const cleanLine = lines[0].replace(/[^a-zA-Z0-9\s&.-]/g, '').trim();
      if (cleanLine.length > 2) return cleanLine;
    }

    return 'Merchant / Toko';
  }

  /**
   * Smart Date Extraction
   */
  static _extractDate(text) {
    const datePatterns = [
      /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/,
      /(\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${now.getFullYear()}`;
  }

  /**
   * Smart Total Amount Extraction Engine
   */
  static _extractTotalAmount(text) {
    const lines = text.split('\n');
    let candidates = [];

    // Keywords that indicate total amount line
    const grandTotalKeywords = /grand total|total bayar|total akhir|must pay|jumlah total|total netto/i;
    const generalTotalKeywords = /total|jumlah|bayar|rp|debet|cash|tunai/i;
    const excludeKeywords = /kembali|change|kembalian|subtotal|sub-total|pajak|tax|ppn|cashback/i;

    // Pass 1: Check high-priority Grand Total lines
    for (const line of lines) {
      if (grandTotalKeywords.test(line) && !excludeKeywords.test(line)) {
        const val = this._parseCurrencyFromLine(line);
        if (val > 0) return val;
      }
    }

    // Pass 2: Check general Total lines
    for (const line of lines) {
      if (generalTotalKeywords.test(line) && !excludeKeywords.test(line)) {
        const val = this._parseCurrencyFromLine(line);
        if (val > 0) candidates.push(val);
      }
    }

    if (candidates.length > 0) {
      return Math.max(...candidates);
    }

    // Pass 3: Fallback - Extract all numbers and pick largest valid currency figure
    const allNumbers = text.match(/(?:rp\.?\s*)?([\d\.,]{4,})/gi);
    if (allNumbers) {
      for (const raw of allNumbers) {
        const num = this._cleanNumber(raw);
        if (num >= 1000 && num <= 100000000) {
          candidates.push(num);
        }
      }
    }

    return candidates.length > 0 ? Math.max(...candidates) : 0;
  }

  static _extractSubtotal(text) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (/subtotal|sub-total/i.test(line)) {
        const val = this._parseCurrencyFromLine(line);
        if (val > 0) return val;
      }
    }
    return 0;
  }

  static _extractTax(text) {
    const lines = text.split('\n');
    for (const line of lines) {
      if (/ppn|pajak|tax/i.test(line)) {
        const val = this._parseCurrencyFromLine(line);
        if (val > 0) return val;
      }
    }
    return 0;
  }

  static _parseCurrencyFromLine(line) {
    const numbers = line.match(/([\d\.,]{3,})/g);
    if (!numbers) return 0;

    for (let i = numbers.length - 1; i >= 0; i--) {
      const clean = this._cleanNumber(numbers[i]);
      if (clean >= 100 && clean <= 100000000) {
        return clean;
      }
    }

    return 0;
  }

  static _cleanNumber(rawStr) {
    if (!rawStr) return 0;
    // Remove Rp prefix, spaces, and non-numeric chars except dot/comma
    let clean = rawStr.replace(/[^0-9\.,]/g, '');

    // Handle Indonesian currency formats (e.g. 145.000,00 or 145.000)
    if (clean.includes(',') && clean.indexOf(',') === clean.length - 3) {
      clean = clean.substring(0, clean.indexOf(',')); // remove decimals
    }

    clean = clean.replace(/[\.,]/g, '');
    const result = parseInt(clean, 10);
    return isNaN(result) ? 0 : result;
  }

  static _formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }
}
