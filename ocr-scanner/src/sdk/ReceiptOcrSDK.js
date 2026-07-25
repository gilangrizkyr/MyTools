import { OcrEngine } from '../core/OcrEngine.js';

/**
 * ReceiptOCR SDK
 * Integration SDK for external websites to auto-extract receipt data & auto-fill forms
 */
export class ReceiptOcrSDK {
  /**
   * Scan and extract structured metadata from a receipt image.
   * 
   * @param {File|Blob} imageFile - Receipt image file
   * @param {Object} [options]
   * @returns {Promise<Object>} Extracted metadata (merchant, date, totalAmount, rawText)
   */
  static async extract(imageFile, options = {}) {
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      throw new Error('[ReceiptOcrSDK] Input file must be a valid image (PNG/JPG/WEBP).');
    }

    return await OcrEngine.scan(imageFile, options);
  }

  /**
   * Auto-attach SDK to an HTML <input type="file"> element and populate target form inputs automatically.
   * 
   * @param {string|HTMLInputElement} targetInput - CSS Selector or HTMLInputElement
   * @param {Object} fieldMappings - Mapping of field names to input selectors { merchantInput: '#merchant', dateInput: '#date', amountInput: '#total' }
   * @param {Object} [options]
   */
  static attachToForm(targetInput, fieldMappings = {}, options = {}) {
    const inputEl = typeof targetInput === 'string' ? document.querySelector(targetInput) : targetInput;

    if (!inputEl || inputEl.tagName !== 'INPUT' || inputEl.type !== 'file') {
      console.error('[ReceiptOcrSDK] Target element must be an <input type="file">');
      return null;
    }

    const handleFileChange = async (event) => {
      const files = Array.from(inputEl.files || []);
      if (files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      const onStart = options.onStart || (() => {});
      const onSuccess = options.onSuccess || (() => {});
      const onError = options.onError || (() => {});

      onStart(file);
      inputEl.dispatchEvent(new CustomEvent('receiptocr:start', { detail: { file } }));

      try {
        const result = await ReceiptOcrSDK.extract(file, options);

        // Auto-fill target form fields
        if (fieldMappings.merchantInput) {
          const el = document.querySelector(fieldMappings.merchantInput);
          if (el) el.value = result.merchant || '';
        }

        if (fieldMappings.dateInput) {
          const el = document.querySelector(fieldMappings.dateInput);
          if (el) el.value = result.date || '';
        }

        if (fieldMappings.amountInput) {
          const el = document.querySelector(fieldMappings.amountInput);
          if (el) el.value = result.totalAmount || 0;
        }

        onSuccess(result);
        inputEl.dispatchEvent(new CustomEvent('receiptocr:success', { detail: { result } }));
      } catch (err) {
        console.error('[ReceiptOcrSDK] Failed to extract receipt metadata:', err);
        onError(err);
        inputEl.dispatchEvent(new CustomEvent('receiptocr:error', { detail: { error: err } }));
      }
    };

    inputEl.addEventListener('change', handleFileChange);

    return {
      detach: () => inputEl.removeEventListener('change', handleFileChange)
    };
  }
}

// Global window attachment for UMD / script tag usage
if (typeof window !== 'undefined') {
  window.ReceiptOcrSDK = ReceiptOcrSDK;
}
