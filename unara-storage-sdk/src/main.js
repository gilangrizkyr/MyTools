import { createIcons, icons } from 'lucide';
import { UnaraStorageSDK } from './UnaraStorageSDK.js';
import { formatBytes } from './utils/formatters.js';

let selectedFile = null;
let unaraResult = null;

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
      if (!unaraResult) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(unaraResult.processedFile);
      a.download = `unara-${unaraResult.fileName}`;
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
    unaraResult = await UnaraStorageSDK.process(file, {
      onProgress: (percent, statusText) => {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${statusText} (${percent}%)`;
      }
    });

    progressCard.classList.add('hidden');
    previewCard.classList.remove('hidden');

    document.getElementById('fileName').textContent = unaraResult.fileName;
    document.getElementById('origSize').textContent = formatBytes(unaraResult.compressionMeta.originalSize);
    document.getElementById('compSize').textContent = formatBytes(unaraResult.compressionMeta.compressedSize);
    document.getElementById('procTime').textContent = `${unaraResult.totalTimeMs} ms`;
    document.getElementById('hexSig').textContent = unaraResult.securityMeta.hexSignature;

    if (unaraResult.thumbnailFile) {
      document.getElementById('thumbImg').src = URL.createObjectURL(unaraResult.thumbnailFile);
      document.getElementById('thumbCard').classList.remove('hidden');
    }

  } catch (err) {
    progressCard.classList.add('hidden');
    alert('Proses Unara Storage Pipeline Gagal: ' + err.message);
  }
}
