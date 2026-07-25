# media-optimizer

Client-side video and media optimization library and SDK designed to compress large video files (50 MB - 300 MB+ down to < 15 MB) while maintaining aspect ratios, audio clarity, and client data privacy without watermarks.

## Features

- **Watermark-Free Client Execution**: Compresses video files entirely within the browser via Web APIs, avoiding third-party server uploads and watermark overlays.
- **Adaptive Bitrate Scaling**: Automatically recalculates video bitrate constraints to achieve web target file sizes (< 15 MB).
- **Auto-Compress SDK**: Embeddable JavaScript SDK (`MediaOptimizerSDK`) that hooks into HTML `<input type="file" accept="video/*">` elements to compress video uploads prior to form submission.
- **Aspect Ratio & Audio Retention**: Maintains original playback aspect ratios and audio track clarity.

## Website SDK Integration

### Option A: Automatic Input Intercept

Attach `MediaOptimizerSDK` to an HTML `<input type="file">` element:

```javascript
import { MediaOptimizerSDK } from './src/sdk/MediaOptimizerSDK.js';

MediaOptimizerSDK.attachToInput('#videoInput', {
  maxSizeBytes: 15 * 1024 * 1024, // 15 MB target limit
  onSuccess: (files) => {
    console.log('Compressed video file ready for upload:', files[0]);
  }
});
```

### Option B: Programmatic Function Call

Use the `compress()` method for custom upload handlers:

```javascript
import { MediaOptimizerSDK } from './src/sdk/MediaOptimizerSDK.js';

const videoFile = document.getElementById('myVideoInput').files[0];

const compressedVideo = await MediaOptimizerSDK.compress(videoFile, {
  maxSizeBytes: 15 * 1024 * 1024
});

const formData = new FormData();
formData.append('video', compressedVideo);

await fetch('/api/upload-video', {
  method: 'POST',
  body: formData
});
```

## Setup and Development

### Installation

```bash
cd media-optimizer
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
