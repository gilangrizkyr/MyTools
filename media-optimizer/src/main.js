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
      recompressCurrentMedia();
    });
  });
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files && files.length > 0) {
    processInputMedia(files[0]);
  }
}

async function processInputMedia(file) {
  if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
    alert('Harap masukkan file video/media valid (MP4, WebM, MOV, MP3).');
    return;
  }

  currentFile = file;
  emptyState.classList.add('hidden');
  await recompressCurrentMedia();
}

async function recompressCurrentMedia() {
  if (!currentFile) return;

  try {
    previewCard.classList.remove('hidden');

    const activePresetBtn = document.querySelector('.preset-btn.active');
    const preset = activePresetBtn ? activePresetBtn.dataset.preset : 'messaging';

    let maxSizeBytes = 15 * 1024 * 1024; // Default 15 MB
    if (preset === 'web') maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    else if (preset === 'email') maxSizeBytes = 25 * 1024 * 1024; // 25 MB

    currentResult = await MediaCompressor.compress(currentFile, { maxSizeBytes });

    currentFileName.innerHTML = `<i data-lucide="film"></i> ${currentResult.fileName}`;
    durationBadge.textContent = formatDuration(currentResult.duration);

    metricOriginal.textContent = formatBytes(currentResult.originalSize);
    metricCompressed.textContent = formatBytes(currentResult.compressedSize);
    metricSavings.textContent = `-${currentResult.savingsPercent}%`;
    metricTime.textContent = `${currentResult.processingTimeMs} ms`;

    videoPreview.src = currentResult.compressedUrl;

    downloadSingleBtn.href = currentResult.compressedUrl;
    downloadSingleBtn.download = getOptimizedMediaFilename(currentResult.fileName);

    createIcons({ icons });
  } catch (err) {
    console.error('Failed to compress media', err);
    alert('Gagal mengompresi media: ' + err.message);
  }
}
