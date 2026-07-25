import { createWorker } from 'tesseract.js';

/**
 * Core OCR Engine
 * Browser-based OCR scanner powered by Tesseract.js & Canvas Pre-Processing
 */
export class OcrEngine {
  /**
   * Scan image file and extract structured receipt data.
   * 
   * @param {File|Blob} imageFile - Receipt or document image file
   * @param {Object} [options]
   * @param {function} [options.onProgress] - Progress callback (percentage, statusText)
   * @returns {Promise<Object>} Extracted structured data
   */
  static async scan(imageFile, options = {}) {
    const startTime = performance.now();
    const onProgress = options.onProgress || (() => {});

    onProgress(10, 'Pre-processing image contrast...');

    // Convert file to Image Bitmap & Pre-process contrast for thermal receipts
    const processedCanvas = await this._preprocessImage(imageFile);

    onProgress(25, 'Initializing Tesseract OCR engine...');

    const worker = await createWorker('ind+eng');

    onProgress(45, 'Scanning document text...');

    const { data: { text } } = await worker.recognize(processedCanvas);

    await worker.terminate();

    onProgress(85, 'Extracting structured fields...');

    const merchant = this._extractMerchant(text);
    const date = this._extractDate(text);
    const totalAmount = this._extractTotalAmount(text);
    const subtotal = this._extractSubtotal(text);
    const tax = this._extractTax(text);

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    onProgress(100, 'OCR scan complete!');

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
   * Enhance contrast and grayscale for thermal receipt images
   */
  static _preprocessImage(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Grayscale & contrast enhancement
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          // Increase contrast threshold
          const v = avg > 140 ? 255 : (avg < 80 ? 0 : avg);
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
        reject(new Error('Failed to load image file for OCR.'));
      };

      img.src = url;
    });
  }

  /**
   * Extract Store / Merchant Name
   */
  static _extractMerchant(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    if (lines.length === 0) return 'Toko / Merchant Tidak Terdeteksi';

    // Scan first 4 non-empty lines for prominent merchant headers
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const line = lines[i];
      if (!/total|harga|nota|struk|kasir|tanggal|terima|kasih|selamat|datang/i.test(line)) {
        return line.replace(/[^a-zA-Z0-9\s&.-]/g, '').trim();
      }
    }

    return lines[0].replace(/[^a-zA-Z0-9\s&.-]/g, '').trim();
  }

  /**
   * Extract Transaction Date
   */
  static _extractDate(text) {
    const dateRegexes = [
      /(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{2,4})/i
    ];

    for (const regex of dateRegexes) {
      const match = text.match(regex);
      if (match) return match[1];
    }

    const now = new Date();
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  }

  /**
   * Extract Total Amount
   */
  static _extractTotalAmount(text) {
    const lines = text.split('\n');
    let candidates = [];

    const totalKeywords = /total|grand total|jumlah|bayar|rp|cash|tunai/i;

    for (const line of lines) {
      if (totalKeywords.test(line)) {
        const numbers = line.match(/(?:Rp\.?\s*)?([\d\.,]{3,})/gi);
        if (numbers) {
          for (const rawNum of numbers) {
            const cleanNum = parseInt(rawNum.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(cleanNum) && cleanNum > 100) {
              candidates.push(cleanNum);
            }
          }
        }
      }
    }

    if (candidates.length > 0) {
      return Math.max(...candidates);
    }

    // Fallback: extract all numbers in text and pick largest reasonable amount
    const allNumbers = text.match(/\b\d{4,8}\b/g);
    if (allNumbers) {
      const parsed = allNumbers.map(n => parseInt(n, 10)).filter(n => n > 500 && n < 100000000);
      if (parsed.length > 0) return Math.max(...parsed);
    }

    return 0;
  }

  static _extractSubtotal(text) {
    const match = text.match(/subtotal[\s:]*(?:rp\.?\s*)?([\d\.,]+)/i);
    if (match) {
      return parseInt(match[1].replace(/[^0-9]/g, ''), 10) || 0;
    }
    return 0;
  }

  static _extractTax(text) {
    const match = text.match(/(?:ppn|pajak|tax)[\s:]*(?:rp\.?\s*)?([\d\.,]+)/i);
    if (match) {
      return parseInt(match[1].replace(/[^0-9]/g, ''), 10) || 0;
    }
    return 0;
  }

  static _formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  }
}
