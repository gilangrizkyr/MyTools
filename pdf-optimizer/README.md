# pdf-optimizer

Client-side PDF document optimization library and integration SDK designed to compress large PDF files (10 MB - 50 MB+ down to < 2 MB) while preserving text precision, vector sharpness, and document privacy.

## Features

- **Text & Vector Precision Retention**: Compresses embedded raster images without rasterizing text layers, preserving copyable text and crisp vector layout.
- **100% Client-Side Privacy**: Document processing executes entirely within the browser via Web APIs and WebAssembly. Sensitive documents (IDs, contracts, invoices) never leave the client's device.
- **Adaptive Quality Control**: Iteratively optimizes object streams and embedded images to hit web target constraints (< 2 MB).
- **Auto-Compress SDK**: Embeddable JavaScript SDK (`PdfOptimizerSDK`) that hooks into HTML `<input type="file" accept=".pdf">` elements to automatically compress files prior to form submission.
- **Interactive Document Preview**: Renders PDF first-page viewports using `pdfjs-dist`.

## Website SDK Integration

### Option A: Automatic Input Intercept

Attach `PdfOptimizerSDK` to an HTML `<input type="file">` element:

```javascript
import { PdfOptimizerSDK } from './src/sdk/PdfOptimizerSDK.js';

PdfOptimizerSDK.attachToInput('#pdfInput', {
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB target limit
  onSuccess: (files) => {
    console.log('Compressed PDF file ready for upload:', files[0]);
  }
});
```

### Option B: Programmatic Function Call

Use the `compress()` method for custom upload handlers:

```javascript
import { PdfOptimizerSDK } from './src/sdk/PdfOptimizerSDK.js';

const pdfFile = document.getElementById('myPdfInput').files[0];

const compressedPdf = await PdfOptimizerSDK.compress(pdfFile, {
  maxSizeBytes: 2 * 1024 * 1024
});

const formData = new FormData();
formData.append('document', compressedPdf);

await fetch('/api/upload-pdf', {
  method: 'POST',
  body: formData
});
```

## Setup and Development

### Installation

```bash
cd pdf-optimizer
npm install
```

### Development Server

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

## License

Copyright © 2026 Gilang. All rights reserved.

Proprietary software. Unauthorized copying, modification, or distribution is strictly prohibited.
