import { createIcons, icons } from 'lucide';
import { ImageCompressor } from './core/ImageCompressor.js';
import { BatchProcessor } from './core/BatchProcessor.js';
import { formatBytes, getFormatBadgeLabel, getOptimizedFilename } from './utils/formatters.js';
import JSZip from 'jszip';

// Initialize state & elements
let currentFile = null;
let currentResult = null;
let batchProcessor = null;

// DOM Selectors
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const formatSelect = document.getElementById('formatSelect');
const qualityRange = document.getElementById('qualityRange');
const qualityVal = document.getElementById('qualityVal');
const autoTargetToggle = document.getElementById('autoTargetToggle');
const presetBtns = document.querySelectorAll('.preset-btn');

// Viewer DOM
const emptyState = document.getElementById('emptyState');
const previewCard = document.getElementById('previewCard');
const batchCard = document.getElementById('batchCard');

const currentFileName = document.getElementById('currentFileName');
const resolutionBadge = document.getElementById('resolutionBadge');
const imgOriginal = document.getElementById('imgOriginal');
const imgCompressed = document.getElementById('imgCompressed');
const imgCompressedWrapper = document.getElementById('imgCompressedWrapper');
const sliderHandle = document.getElementById('sliderHandle');

const lblOriginalSize = document.getElementById('lblOriginalSize');
const lblCompressedSize = document.getElementById('lblCompressedSize');

const metricOriginal = document.getElementById('metricOriginal');
const metricCompressed = document.getElementById('metricCompressed');
const metricSavings = document.getElementById('metricSavings');
const metricResolution = document.getElementById('metricResolution');
const metricTime = document.getElementById('metricTime');
const downloadSingleBtn = document.getElementById('downloadSingleBtn');

const batchList = document.getElementById('batchList');
const batchCount = document.getElementById('batchCount');
const downloadZipBtn = document.getElementById('downloadZipBtn');
const clearBatchBtn = document.getElementById('clearBatchBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons });

  // Init Batch Processor
  batchProcessor = new BatchProcessor({
    onItemStart: (item) => renderBatchList(),
    onItemProgress: (item) => renderBatchList(),
    onItemComplete: (item) => renderBatchList(),
    onBatchComplete: () => renderBatchList()
  });

  setupEventListeners();
  setupSliderComparison();
});

function setupEventListeners() {
  // File upload events
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);

  // Drag & drop events
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
      processInputFiles(Array.from(files));
    }
  });

  // Settings change events
  qualityRange.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
    markPresetCustom();
    recompressCurrentFile();
  });

  formatSelect.addEventListener('change', () => {
    recompressCurrentFile();
  });

  autoTargetToggle.addEventListener('change', () => {
    recompressCurrentFile();
  });

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const preset = btn.dataset.preset;
      applyPreset(preset);
      recompressCurrentFile();
    });
  });

  // Batch action buttons
  clearBatchBtn.addEventListener('click', () => {
    batchProcessor.clear();
    batchCard.classList.add('hidden');
    renderBatchList();
  });

  downloadZipBtn.addEventListener('click', handleDownloadZip);
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processInputFiles(Array.from(files));
  }
}

function applyPreset(preset) {
  if (preset === 'ultra') {
    qualityRange.value = 65;
    qualityVal.textContent = '65%';
    autoTargetToggle.checked = true;
  } else if (preset === 'balanced') {
    qualityRange.value = 82;
    qualityVal.textContent = '82%';
    autoTargetToggle.checked = true;
  } else if (preset === 'high') {
    qualityRange.value = 92;
    qualityVal.textContent = '92%';
    autoTargetToggle.checked = false;
  }
}

function markPresetCustom() {
  presetBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.preset === 'custom');
  });
}

async function processInputFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    alert('Harap masukkan file gambar valid (JPG, PNG, WEBP, AVIF).');
    return;
  }

  emptyState.classList.add('hidden');

  if (imageFiles.length === 1) {
    // Single File Mode
    currentFile = imageFiles[0];
    await recompressCurrentFile();
  } else {
    // Multi File Batch Mode
    currentFile = imageFiles[0];
    await recompressCurrentFile();

    batchProcessor.clear();
    batchProcessor.addFiles(imageFiles, getCompressionOptions());
    batchCard.classList.remove('hidden');
    batchProcessor.process();
  }
}

function getCompressionOptions() {
  const activePresetBtn = document.querySelector('.preset-btn.active');
  const preset = activePresetBtn ? activePresetBtn.dataset.preset : 'balanced';

  let maxSizeBytes = 2 * 1024 * 1024; // Default 2 MB
  if (preset === 'ultra') maxSizeBytes = 1 * 1024 * 1024; // 1 MB

  return {
    format: formatSelect.value,
    quality: Number(qualityRange.value) / 100,
    autoTargetSize: autoTargetToggle.checked,
    maxSizeBytes
  };
}

async function recompressCurrentFile() {
  if (!currentFile) return;

  try {
    previewCard.classList.remove('hidden');

    const options = getCompressionOptions();
    currentResult = await ImageCompressor.compress(currentFile, options);

    // Update UI elements
    currentFileName.innerHTML = `<i data-lucide="file-image"></i> ${currentResult.fileName}`;
    resolutionBadge.textContent = `${currentResult.resolutionString} (Resolusi Asli 100%)`;

    imgOriginal.src = currentResult.originalUrl;
    imgCompressed.src = currentResult.compressedUrl;

    lblOriginalSize.textContent = formatBytes(currentResult.originalSize);
    lblCompressedSize.textContent = formatBytes(currentResult.compressedSize);

    metricOriginal.textContent = formatBytes(currentResult.originalSize);
    metricCompressed.textContent = formatBytes(currentResult.compressedSize);
    metricSavings.textContent = `-${currentResult.savingsPercent}%`;
    metricResolution.textContent = `Retained (${currentResult.width}×${currentResult.height})`;
    metricTime.textContent = `${currentResult.processingTimeMs} ms`;

    // Download Single Setup
    downloadSingleBtn.href = currentResult.compressedUrl;
    downloadSingleBtn.download = getOptimizedFilename(currentResult.fileName, currentResult.format);

    createIcons({ icons });
  } catch (err) {
    console.error('Failed to compress current file', err);
    alert('Gagal mengompresi gambar: ' + err.message);
  }
}

/**
 * Setup Split-Screen Slider Comparison dragging
 */
function setupSliderComparison() {
  const container = document.getElementById('comparisonSlider');
  let isDragging = false;

  const moveSlider = (clientX) => {
    const rect = container.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;

    const percentage = (x / rect.width) * 100;
    imgCompressedWrapper.style.width = `${100 - percentage}%`;
    sliderHandle.style.left = `${percentage}%`;
  };

  sliderHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) moveSlider(e.clientX);
  });

  // Touch Support
  sliderHandle.addEventListener('touchstart', () => { isDragging = true; });
  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches[0]) moveSlider(e.touches[0].clientX);
  });
}

/**
 * Render Batch Items list in UI
 */
function renderBatchList() {
  const queue = batchProcessor.queue;
  batchCount.textContent = queue.length;

  batchList.innerHTML = queue.map(item => {
    const isDone = item.status === 'completed';
    const isError = item.status === 'error';
    const isProcessing = item.status === 'processing';

    return `
      <div class="batch-item">
        <div class="batch-info">
          <i data-lucide="${isDone ? 'check-circle' : isError ? 'alert-circle' : 'loader'}" class="${isDone ? 'green-text' : ''}"></i>
          <span class="batch-file-name" title="${item.file.name}">${item.file.name}</span>
        </div>
        <div class="batch-metrics">
          <span>${formatBytes(item.file.size)}</span>
          ${isDone ? `<i data-lucide="arrow-right"></i> <strong>${formatBytes(item.result.compressedSize)}</strong> <span class="batch-savings">(-${item.result.savingsPercent}%)</span>` : ''}
          ${isProcessing ? `<span class="sub-text">${item.statusText} (${item.progress}%)</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  createIcons({ icons });
}

/**
 * Zip batch downloads
 */
async function handleDownloadZip() {
  const completed = batchProcessor.queue.filter(i => i.status === 'completed');
  if (completed.length === 0) {
    alert('Belum ada file terkompresi yang siap diunduh.');
    return;
  }

  const zip = new JSZip();
  completed.forEach(item => {
    const name = getOptimizedFilename(item.file.name, item.result.format);
    zip.file(name, item.result.compressedBlob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `optimized-files-batch-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
