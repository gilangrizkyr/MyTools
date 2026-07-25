import { createIcons, icons } from 'lucide';
import { MediaCompressor } from './core/MediaCompressor.js';
import { formatBytes, formatDuration, getOptimizedMediaFilename } from './utils/formatters.js';

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
const durationBadge = document.getElementById('durationBadge');
const videoPreview = document.getElementById('videoPreview');

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
      processInputMedia(files[0]);
    }
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (currentFile) recompressCurrentMedia();
    });
  });
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processInputMedia(files[0]);
  }
}

function showSpinner(label = 'Mengompresi video...', sub = 'Mohon tunggu, proses berjalan di browser Anda') {
  emptyState.classList.add('hidden');
  previewCard.classList.add('hidden');
  spinnerOverlay.classList.remove('hidden');
  spinnerLabel.textContent = label;
  spinnerSub.textContent = sub;
}

function hideSpinner() {
  spinnerOverlay.classList.add('hidden');
}

async function processInputMedia(file) {
  if (!file.type.startsWith('video/') && !file.type.startsWith('audio/') && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
    alert('Harap masukkan file video/media valid (MP4, WebM, MOV, MP3).');
    return;
  }

  currentFile = file;
  await recompressCurrentMedia();
}

async function recompressCurrentMedia() {
  if (!currentFile) return;

  const activePresetBtn = document.querySelector('.preset-btn.active');
  const preset = activePresetBtn ? activePresetBtn.dataset.preset : 'messaging';

  let maxSizeBytes = 15 * 1024 * 1024;
  if (preset === 'web') maxSizeBytes = 5 * 1024 * 1024;
  else if (preset === 'email') maxSizeBytes = 25 * 1024 * 1024;

  showSpinner(
    `Mengompresi ${currentFile.name}...`,
    `Ukuran awal: ${formatBytes(currentFile.size)} → Target: ≤ ${formatBytes(maxSizeBytes)}`
  );

  try {
    currentResult = await MediaCompressor.compress(currentFile, {
      maxSizeBytes,
      forceCompress: true,
      onProgress: (percent, statusText) => {
        spinnerLabel.textContent = `${statusText}`;
        spinnerSub.textContent = `Progress: ${percent}%`;
      }
    });

    hideSpinner();

    previewCard.classList.remove('hidden');

    currentFileName.innerHTML = `<i data-lucide="film"></i> ${currentResult.fileName}`;
    durationBadge.textContent = currentResult.duration > 0 ? formatDuration(currentResult.duration) : '—';

    metricOriginal.textContent = formatBytes(currentResult.originalSize);
    metricCompressed.textContent = formatBytes(currentResult.compressedSize);
    metricSavings.textContent = currentResult.savingsPercent > 0 ? `-${currentResult.savingsPercent}%` : '0%';
    metricTime.textContent = `${currentResult.processingTimeMs} ms`;

    videoPreview.src = currentResult.compressedUrl;

    downloadSingleBtn.href = currentResult.compressedUrl;
    downloadSingleBtn.download = getOptimizedMediaFilename(currentResult.fileName);

    createIcons({ icons });
  } catch (err) {
    console.error('Failed to compress media', err);
    hideSpinner();
    emptyState.classList.remove('hidden');
    alert('Gagal mengompresi media: ' + err.message);
  }
}
