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

  progressCard.classList.remove('hidden');
  previewCard.classList.add('hidden');

  try {
    compressedResult = await DocCompressor.compress(file, {
      onProgress: (percent, statusText) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${statusText} (${percent}%)`;
      }
    });

    progressCard.classList.add('hidden');
    previewCard.classList.remove('hidden');

    document.getElementById('fileName').textContent = compressedResult.fileName;
    document.getElementById('origSize').textContent = formatBytes(compressedResult.originalSize);
    document.getElementById('compSize').textContent = formatBytes(compressedResult.compressedSize);
    document.getElementById('savings').textContent = `-${compressedResult.savingsPercent}%`;
    document.getElementById('procTime').textContent = `${compressedResult.processingTimeMs} ms`;
    document.getElementById('imgCount').textContent = `${compressedResult.compressedImageCount} / ${compressedResult.totalImages} foto`;

  } catch (err) {
    progressCard.classList.add('hidden');
    alert('Gagal mengompresi dokumen Office: ' + err.message);
  }
}
