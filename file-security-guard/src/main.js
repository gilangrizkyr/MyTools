import { createIcons, icons } from 'lucide';
import { SecurityEngine } from './core/SecurityEngine.js';
import { formatBytes, getSanitizedFilename } from './utils/formatters.js';

let selectedFile = null;
let securityResult = null;

document.addEventListener('DOMContentLoaded', () => {
  createIcons({ icons });
  setupEvents();
});

function setupEvents() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
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
    downloadBtn.addEventListener('click', () => {
      if (!securityResult) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(securityResult.sanitizedFile);
      a.download = getSanitizedFilename(securityResult.fileName);
      a.click();
    });
  }
}

async function processFile(file) {
  selectedFile = file;
  const progressCard = document.getElementById('progressCard');
  const previewCard = document.getElementById('previewCard');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const spinnerOverlay = document.getElementById('spinnerOverlay');
  const spinnerLabel = document.getElementById('spinnerLabel');
  const spinnerSub = document.getElementById('spinnerSub');
  const emptyState = document.getElementById('emptyState');

  if (emptyState) emptyState.classList.add('hidden');
  if (spinnerOverlay) {
    spinnerLabel.textContent = `Memeriksa keamanan ${file.name}...`;
    spinnerSub.textContent = `Ukuran: ${(file.size / 1024).toFixed(1)} KB`;
    spinnerOverlay.classList.remove('hidden');
  }
  progressCard.classList.remove('hidden');
  previewCard.classList.add('hidden');

  try {
    securityResult = await SecurityEngine.validateAndSanitize(file, {
      onProgress: (percent, statusText) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${statusText} (${percent}%)`;
      }
    });

    if (spinnerOverlay) spinnerOverlay.classList.add('hidden');
    progressCard.classList.add('hidden');
    previewCard.classList.remove('hidden');

    document.getElementById('fileName').textContent = securityResult.fileName;
    document.getElementById('fileSize').textContent = formatBytes(securityResult.fileSize);
    document.getElementById('hexSig').textContent = securityResult.hexSignature;
    document.getElementById('mimeType').textContent = securityResult.detectedMime;
    document.getElementById('procTime').textContent = `${securityResult.processingTimeMs} ms`;
    document.getElementById('gpsStatus').textContent = securityResult.gpsStripped ? 'DIBERSIHKAN 100%' : 'TIDAK ADA DATA GPS';

  } catch (err) {
    if (spinnerOverlay) spinnerOverlay.classList.add('hidden');
    progressCard.classList.add('hidden');
    alert('Pemeriksaan Keamanan Gagal: ' + err.message);
  }
}
