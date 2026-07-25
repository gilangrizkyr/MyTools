import { createIcons, icons } from 'lucide';
import { DocCompressor } from './core/DocCompressor.js';
import { formatBytes, getOptimizedDocFilename } from './utils/formatters.js';

let selectedFile = null;
let compressedResult = null;

document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons });
  setupEvents();
});

function setupEvents() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const btnSelect = document.getElementById('btnSelect');
  const downloadBtn = document.getElementById('downloadBtn');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      if (!compressedResult) return;
      const a = document.createElement('a');
      a.href = compressedResult.compressedUrl;
      a.download = getOptimizedDocFilename(compressedResult.fileName);
      a.click();
    });
  }
}

async function processFile(file) {
  if (!/\.(docx|xlsx|pptx)$/i.test(file.name)) {
    alert('Harap pilih dokumen Office valid (.docx, .xlsx, .pptx)');
    return;
  }

  selectedFile = file;
  const progressCard = document.getElementById('progressCard');
  const previewCard = document.getElementById('previewCard');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const spinnerOverlay = document.getElementById('spinnerOverlay');
  const spinnerLabel = document.getElementById('spinnerLabel');
  const spinnerSub = document.getElementById('spinnerSub');
  const emptyState = document.getElementById('emptyState');

  // Tampilkan spinner + progress card
  if (emptyState) emptyState.classList.add('hidden');
  if (spinnerOverlay) {
    spinnerLabel.textContent = `Mengompresi ${file.name}...`;
    spinnerSub.textContent = `Ukuran awal: ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    spinnerOverlay.classList.remove('hidden');
  }
  progressCard.classList.remove('hidden');
  previewCard.classList.add('hidden');

  try {
    compressedResult = await DocCompressor.compress(file, {
      onProgress: (percent, statusText) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${statusText} (${percent}%)`;
      }
    });

    if (spinnerOverlay) spinnerOverlay.classList.add('hidden');
    progressCard.classList.add('hidden');
    previewCard.classList.remove('hidden');

    document.getElementById('fileName').textContent = compressedResult.fileName;
    document.getElementById('origSize').textContent = formatBytes(compressedResult.originalSize);
    document.getElementById('compSize').textContent = formatBytes(compressedResult.compressedSize);
    document.getElementById('savings').textContent = `-${compressedResult.savingsPercent}%`;
    document.getElementById('procTime').textContent = `${compressedResult.processingTimeMs} ms`;
    document.getElementById('imgCount').textContent = `${compressedResult.compressedImageCount} / ${compressedResult.totalImages} foto`;

  } catch (err) {
    if (spinnerOverlay) spinnerOverlay.classList.add('hidden');
    progressCard.classList.add('hidden');
    alert('Gagal mengompresi dokumen Office: ' + err.message);
  }
}
