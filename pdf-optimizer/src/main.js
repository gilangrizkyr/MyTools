import { createIcons, icons } from 'lucide';
import { PdfCompressor } from './core/PdfCompressor.js';
import { formatBytes, getOptimizedPdfFilename } from './utils/formatters.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

let currentFile = null;
let currentResult = null;

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const presetBtns = document.querySelectorAll('.preset-btn');

const emptyState = document.getElementById('emptyState');
const spinnerOverlay = document.getElementById('spinnerOverlay');
const spinnerLabel = document.getElementById('spinnerLabel');
const spinnerSub = document.getElementById('spinnerSub');
const previewCard = document.getElementById('previewCard');

const currentFileName = document.getElementById('currentFileName');
const pageBadge = document.getElementById('pageBadge');
const pdfCanvas = document.getElementById('pdfCanvas');

const metricOriginal = document.getElementById('metricOriginal');
const metricCompressed = document.getElementById('metricCompressed');
const metricSavings = document.getElementById('metricSavings');
const metricTime = document.getElementById('metricTime');
const downloadSingleBtn = document.getElementById('downloadSingleBtn');

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
      processInputPdf(files[0]);
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      recompressCurrentPdf();
    });
  });
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processInputPdf(files[0]);
  }
}

async function processInputPdf(file) {
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    alert('Harap masukkan file PDF valid (.pdf).');
    return;
  }

  currentFile = file;
  emptyState.classList.add('hidden');
  await recompressCurrentPdf();
}

function showSpinner(label, sub) {
  emptyState.classList.add('hidden');
  previewCard.classList.add('hidden');
  spinnerOverlay.classList.remove('hidden');
  if (label) spinnerLabel.textContent = label;
  if (sub) spinnerSub.textContent = sub;
}

function hideSpinner() {
  spinnerOverlay.classList.add('hidden');
}

async function recompressCurrentPdf() {
  if (!currentFile) return;

  showSpinner(`Mengompresi ${currentFile.name}...`, `Ukuran awal: ${formatBytes(currentFile.size)}`);

  try {
    previewCard.classList.add('hidden');

    const activePresetBtn = document.querySelector('.preset-btn.active');
    const preset = activePresetBtn ? activePresetBtn.dataset.preset : 'balanced';

    let maxSizeBytes = 2 * 1024 * 1024; // Default 2 MB
    let imageQuality = 0.72;

    if (preset === 'ultra') {
      maxSizeBytes = 1 * 1024 * 1024; // 1 MB
      imageQuality = 0.50;
    } else if (preset === 'balanced') {
      maxSizeBytes = 2 * 1024 * 1024; // 2 MB
      imageQuality = 0.72;
    } else if (preset === 'high') {
      maxSizeBytes = 5 * 1024 * 1024; // 5 MB
      imageQuality = 0.90;
    }

    currentResult = await PdfCompressor.compress(currentFile, { maxSizeBytes, imageQuality });

    currentFileName.innerHTML = `<i data-lucide="file-text"></i> ${currentResult.fileName}`;
    pageBadge.textContent = `${currentResult.pageCount} Halaman`;

    metricOriginal.textContent = formatBytes(currentResult.originalSize);
    metricCompressed.textContent = formatBytes(currentResult.compressedSize);
    metricSavings.textContent = `-${currentResult.savingsPercent}%`;
    metricTime.textContent = `${currentResult.processingTimeMs} ms`;

    downloadSingleBtn.href = currentResult.compressedUrl;
    downloadSingleBtn.download = getOptimizedPdfFilename(currentResult.fileName);

    hideSpinner();
    previewCard.classList.remove('hidden');

    renderPdfPagePreview(currentResult.compressedBlob);
    createIcons({ icons });
  } catch (err) {
    hideSpinner();
    emptyState.classList.remove('hidden');
    console.error('Failed to compress PDF', err);
    alert('Gagal mengompresi PDF: ' + err.message);
  }
}

/**
 * Render first page preview of PDF onto canvas
 */
async function renderPdfPagePreview(pdfBlob) {
  try {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.2 });
    const ctx = pdfCanvas.getContext('2d');
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
  } catch (e) {
    console.warn('PDF preview render error', e);
  }
}
