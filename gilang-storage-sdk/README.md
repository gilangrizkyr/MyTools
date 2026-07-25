# gilang-storage-sdk

Unified Master Client SDK for the Gilang Storage Ecosystem: Security Guard, Smart Multi-Format Compression (< 2 MB), and Instant WebP Thumbnail Generation (< 15 KB).

## Features

- **1-Line Master Integration**: Effortlessly process and secure any file prior to backend upload.
- **Security & Privacy Guard**: Validates binary magic bytes and strips EXIF GPS location data.
- **Multi-Format Smart Compressor**: Auto-compresses Images, PDFs, Videos, and Office Documents (DOCX/XLSX/PPTX) to < 2 MB.
- **WebP Thumbnail Engine**: Instantly generates 150x150 px preview snapshots (< 15 KB).

## Installation

```bash
npm install gilang-storage-sdk
```

## Usage

```javascript
import { GilangStorageSDK } from 'gilang-storage-sdk';

// Process any file through the complete Gilang Storage Pipeline
const payload = await GilangStorageSDK.process(userFile);

console.log('Processed File:', payload.processedFile);
console.log('Thumbnail WebP:', payload.thumbnailFile);
```

## License

Copyright © 2026 Gilang. All rights reserved.
Proprietary software.
