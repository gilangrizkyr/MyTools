# 🚀 File & Image Optimizer Pro (`file-optimizer`)

A professional tool & SDK for compressing large image files (such as 16 MB down to **< 2 MB**) **without compromising original image resolution** while preserving crisp visual quality.

---

## ✨ Key Features

- **100% Original Resolution Retention**: Drastically reduces file size without changing the original width × height pixel dimensions.
- **Smart Target Size**: Automatically adjusts quality factors to achieve an ideal web target file size of < 2 MB.
- **🌐 Website Integration SDK (`FileOptimizerSDK`)**: Embeddable in any external website to intercept `<input type="file">` and auto-compress images to < 2 MB prior to uploading to server backend.
- **Visual Split-Screen Comparison**: Interactive *Before/After* slider to inspect visual sharpness before downloading.
- **Multi-Format Support**: Supports compression to **WEBP**, **AVIF**, **JPEG**, and **PNG**.
- **Batch Processing & ZIP Download**: Concurrent asynchronous file processing queue with direct `.zip` archive export.
- **100% Client-Side Processing**: Operates entirely within the browser using Web APIs (`OffscreenCanvas` & `HTML5 Canvas`) without sending files to external servers.

---

## 🌐 External Website Integration Guide (Auto-Compress < 2MB)

To enable external websites to automatically compress images down to **less than 2 MB (< 2 MB)** when users select files in `<input type="file">`, follow these steps:

### Option A: Auto-Attach on `<input type="file">`
Intercept upload file inputs in 3 lines of code:

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

// Connect SDK to your HTML file input element
FileOptimizerSDK.attachToInput('#uploadInput', {
  maxSizeBytes: 2 * 1024 * 1024, // Guarantees < 2 MB output size
  onStart: (files) => {
    console.log('Compressing image automatically...');
  },
  onSuccess: (compressedFiles) => {
    console.log('File compressed successfully < 2MB:', compressedFiles[0]);
    // The input element files property is automatically replaced with the < 2MB file!
  }
});
```

### Option B: Manual Compression via Function API
Use `FileOptimizerSDK.compress()` if managing custom upload logic (e.g. via AJAX/Fetch API):

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

const originalFile = document.getElementById('myInput').files[0];

// Compress 16MB image to < 2MB with 100% resolution retained
const compressedFile = await FileOptimizerSDK.compress(originalFile, {
  maxSizeBytes: 2 * 1024 * 1024 // 2 MB target
});

console.log('Original size:', originalFile.size); // e.g. 16.4 MB
console.log('Compressed size:', compressedFile.size); // e.g. 1.8 MB
console.log('Resolution:', compressedFile.optimizerMeta.resolutionString); // e.g. 3840 × 2160 px

// Send compressed file < 2MB to backend server
const formData = new FormData();
formData.append('image', compressedFile);
await fetch('/api/upload', { method: 'POST', body: formData });
```

---

## 📁 Directory Structure

```text
file-optimizer/
├── index.html                 # Main web application entry point (Bright Ocean Blue Theme)
├── integration-demo.html      # External website SDK integration demo page
├── dokumentasi.html           # Technical integration documentation
├── package.json               # Vite & npm dependency manifest
├── vite.config.js             # Bundler & multi-entry configuration
├── README.md                  # Tool documentation
└── src/
    ├── style.css              # Bright White & Ocean Blue design system
    ├── main.js                # Web application integration layer
    ├── sdk/
    │   └── FileOptimizerSDK.js # Integration SDK for external website auto-compression (< 2MB)
    ├── core/                  # Compression core engine
    │   ├── ImageCompressor.js # Resolution precision compression engine
    │   └── BatchProcessor.js  # Multi-file batch queue manager
    └── utils/
        └── formatters.js      # Bytes formatting & filename utilities
```

---

## 🛠️ Development Setup

```bash
cd /home/Gilang/tools/file-optimizer

# 1. Install Dependencies
npm install

# 2. Start Local Development Server
npm run dev

# 3. Build for Production
npm run build
```
