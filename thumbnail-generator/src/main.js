import { createIcons, icons } from 'lucide';
import { ThumbnailEngine } from './core/ThumbnailEngine.js';
import { formatBytes, getThumbnailFilename } from './utils/formatters.js';

let selectedFile = null;
let thumbnailResult = null;

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
      if (!thumbnailResult) return;
      const a = document.createElement('a');
      a.href = thumbnailResult.thumbnailUrl;
      a.download = getThumbnailFilename(thumbnailResult.fileName);
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

  progressCard.classList.remove('hidden');
  previewCard.classList.add('hidden');

  try {
    thumbnailResult = await ThumbnailEngine.generate(file, {
      size: 200,
      onProgress: (percent, statusText) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${statusText} (${percent}%)`;
      }
    });

    progressCard.classList.add('hidden');
    previewCard.classList.remove('hidden');

    document.getElementById('fileName').textContent = thumbnailResult.fileName;
    document.getElementById('thumbImg').src = thumbnailResult.thumbnailUrl;
    document.getElementById('origSize').textContent = formatBytes(thumbnailResult.originalSize);
    document.getElementById('thumbSize').textContent = formatBytes(thumbnailResult.thumbnailSize);
    document.getElementById('procTime').textContent = `${thumbnailResult.processingTimeMs} ms`;
    document.getElementById('fileType').textContent = thumbnailResult.fileType.toUpperCase();

  } catch (err) {
    progressCard.classList.add('hidden');
    alert('Gagal membuat thumbnail: ' + err.message);
  }
}
