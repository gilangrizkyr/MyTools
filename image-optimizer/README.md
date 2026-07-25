# image-optimizer

Client-side image optimization library and SDK built to compress large image files (16 MB+ down to < 2 MB) while maintaining original pixel dimensions and visual fidelity.

## Features

- **Original Resolution Retention**: Reduces file size while preserving 1:1 pixel dimensions (width × height).
- **Adaptive Quality Control**: Iteratively adjusts compression factors to meet target size constraints (< 2 MB).
- **Client-Side Execution**: Operates entirely within the browser using `HTMLCanvasElement` and `OffscreenCanvas` for data privacy and zero server overhead.
- **Auto-Compress SDK**: Embeddable JavaScript SDK (`FileOptimizerSDK`) that hooks into HTML `<input type="file">` elements to automatically compress files prior to form submission.
- **Multi-Format Support**: Supports WebP, AVIF, JPEG, and PNG input/output.
- **Batch Processing**: Supports multi-file processing with automated ZIP archive exports.

## Website SDK Integration

### Option A: Automatic Input Intercept

Attach `FileOptimizerSDK` to an HTML `<input type="file">` element:

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

FileOptimizerSDK.attachToInput('#uploadInput', {
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB target limit
  onSuccess: (files) => {
    console.log('Compressed file ready for upload:', files[0]);
  }
});
```

### Option B: Programmatic Function Call

Use the `compress()` method for custom upload handlers:

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

const inputFile = document.getElementById('myInput').files[0];

const compressedFile = await FileOptimizerSDK.compress(inputFile, {
  maxSizeBytes: 2 * 1024 * 1024
});

const formData = new FormData();
formData.append('image', compressedFile);

await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

## Setup and Development

### Installation

```bash
cd image-optimizer
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
