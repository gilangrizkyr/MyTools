# browser-image-optimizer-sdk

[![NPM Version](https://img.shields.io/npm/v/browser-image-optimizer-sdk.svg?style=flat-square)](https://www.npmjs.com/package/browser-image-optimizer-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

High-fidelity client-side image compression library and SDK built to compress large image files (16 MB+ down to < 2 MB) while strictly maintaining 1:1 original pixel dimensions and visual quality.

## NPM Installation

Install the package via npm or yarn:

```bash
npm install browser-image-optimizer-sdk
```

or with Yarn:

```bash
yarn add browser-image-optimizer-sdk
```

---

## Features

- **Original Resolution Retention**: Reduces file size while preserving 1:1 pixel dimensions (width × height).
- **Adaptive Quality Engine**: Iteratively adjusts compression factors to meet target size constraints (< 2 MB).
- **100% Client-Side Execution**: Operates entirely within the browser using `HTMLCanvasElement` and `OffscreenCanvas` for zero server overhead and data privacy.
- **Auto-Compress Input Hook**: Embeddable SDK (`FileOptimizerSDK`) that hooks into HTML `<input type="file">` elements to automatically compress files prior to form submission.
- **Multi-Format Support**: Full support for WebP, AVIF, JPEG, and PNG.
- **TypeScript Ready**: Full TypeScript autocomplete type declarations (`index.d.ts`) included out-of-the-box.

---

## SDK Quick Start

### 1. Automatic HTML File Input Intercept

Attach `FileOptimizerSDK` to any HTML `<input type="file">` element:

```javascript
import { FileOptimizerSDK } from 'browser-image-optimizer-sdk';

FileOptimizerSDK.attachToInput('#uploadInput', {
  maxSizeBytes: 2 * 1024 * 1024, // 2 MB target limit
  onSuccess: (files) => {
    console.log('Compressed file ready for form upload:', files[0]);
  }
});
```

### 2. Programmatic Function Call

Compress a JavaScript `File` object programmatically:

```javascript
import { FileOptimizerSDK } from 'browser-image-optimizer-sdk';

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

---

## Setup and Development

### Development Server

```bash
cd image-optimizer
npm install
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

---

## License

Copyright © 2026 Gilang. Released under the [MIT License](LICENSE).
