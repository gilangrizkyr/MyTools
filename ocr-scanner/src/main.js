import { createIcons, icons } from 'lucide';
import { OcrEngine } from './core/OcrEngine.js';
import { formatCurrency, generateCsvData, downloadCsvFile } from './utils/formatters.js';

let currentFile = null;
let currentResult = null;

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

const ocrProgressWrap = document.getElementById('ocrProgressWrap');
const ocrStatusText = document.getElementById('ocrStatusText');
const ocrPercentText = document.getElementById('ocrPercentText');
const ocrProgressBar = document.getElementById('ocrProgressBar');

const emptyState = document.getElementById('emptyState');
const resultCard = document.getElementById('resultCard');

const currentFileName = document.getElementById('currentFileName');
const receiptImagePreview = document.getElementById('receiptImagePreview');

const fieldMerchant = document.getElementById('fieldMerchant');
const fieldDate = document.getElementById('fieldDate');
const fieldTotal = document.getElementById('fieldTotal');
const fieldSubtotal = document.getElementById('fieldSubtotal');
const fieldTax = document.getElementById('fieldTax');
const fieldTime = document.getElementById('fieldTime');
const rawTextBox = document.getElementById('rawTextBox');

const exportCsvBtn = document.getElementById('exportCsvBtn');
const copyJsonBtn = document.getElementById('copyJsonBtn');

document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons });
  setupEventListeners();
});

function setupEventListeners() {
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processInputImage(files[0]);
    }
  });

  exportCsvBtn.addEventListener('click', handleExportCsv);
  copyJsonBtn.addEventListener('click', handleCopyJson);
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processInputImage(files[0]);
  }
}

async function processInputImage(file) {
  if (!file.type.startsWith('image/')) {
    alert('Harap masukkan foto struk/nota yang valid (PNG, JPG, WEBP).');
    return;
  }

  currentFile = file;
  emptyState.classList.add('hidden');
  resultCard.classList.add('hidden');
  ocrProgressWrap.classList.remove('hidden');

  try {
    receiptImagePreview.src = URL.createObjectURL(file);

    currentResult = await OcrEngine.scan(file, {
      onProgress: (percent, statusText) => {
        ocrProgressBar.style.width = `${percent}%`;
        ocrPercentText.textContent = `${percent}%`;
        ocrStatusText.textContent = statusText;
      }
    });

    ocrProgressWrap.classList.add('hidden');
    resultCard.classList.remove('hidden');

    currentFileName.innerHTML = `<i data-lucide="file-text"></i> ${currentResult.fileName}`;
    fieldMerchant.textContent = currentResult.merchant;
    fieldDate.textContent = currentResult.date;
    fieldTotal.textContent = currentResult.formattedTotal;
    fieldSubtotal.textContent = formatCurrency(currentResult.subtotal);
    fieldTax.textContent = formatCurrency(currentResult.tax);
    fieldTime.textContent = `${(currentResult.processingTimeMs / 1000).toFixed(1)}s`;
    rawTextBox.textContent = currentResult.rawText;

    createIcons({ icons });
  } catch (err) {
    console.error('Failed to run OCR scan', err);
    ocrProgressWrap.classList.add('hidden');
    alert('Gagal mengekstrak teks dari foto struk: ' + err.message);
  }
}

function handleExportCsv() {
  if (!currentResult) return;
  const csvContent = generateCsvData([currentResult]);
  downloadCsvFile(csvContent, `receipt-${Date.now()}.csv`);
}

function handleCopyJson() {
  if (!currentResult) return;
  navigator.clipboard.writeText(JSON.stringify(currentResult, null, 2));
  alert('Data JSON berhasil disalin ke clipboard!');
}
