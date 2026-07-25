# thumbnail-generator

Client-side thumbnail and preview generator engine and SDK (`ThumbnailSDK`) designed to instantly generate ultra-lightweight WebP previews (< 15 KB) for Images, Videos, and PDF Documents.

## Features

- **Multi-Type Support**: Generates thumbnails for Images (JPG, PNG, WEBP, AVIF), Videos (MP4, WEBM, MOV frame capture), and PDF Documents (Page 1 rendering).
- **Ultra-Lightweight**: Produces 150x150 px WebP preview blobs (< 15 KB) for 100x faster file list views.
- **100% Client-Side Privacy**: Runs in the browser using Web APIs and PDF.js.
- **Integration SDK (`ThumbnailSDK`)**: Intercepts HTML `<input type="file">` elements to automatically generate thumbnails prior to server submission.

## Usage

```javascript
import { ThumbnailSDK } from './src/sdk/ThumbnailSDK.js';

const originalFile = event.target.files[0];
const thumbnailFile = await ThumbnailSDK.generate(originalFile, { size: 150 });
```

## License

Copyright © 2026 Gilang. All rights reserved.
Proprietary software.
