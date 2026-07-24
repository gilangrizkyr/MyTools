# Tools Directory

A collection of web utility tools, optimization modules, and developer scripts built and maintained by Gilang.

## Repository Index

### file-optimizer

Client-side image optimization library and SDK designed to compress high-resolution images (e.g., 16 MB down to under 2 MB) without altering pixel dimensions or sacrificing visual quality.

- **Status**: Production Ready
- **Location**: [`file-optimizer/`](file:///home/Gilang/tools/file-optimizer)
- **Tech Stack**: Vanilla JavaScript (ES Modules), HTML5 Canvas, OffscreenCanvas, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/file-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/file-optimizer/integration-demo.html)

#### Key Capabilities
- **Zero Resolution Loss**: Maintains 1:1 original pixel dimensions (width × height).
- **Target Size Engine**: Automatically adjusts compression factor to hit target file sizes (< 2 MB) for web upload constraints.
- **Client-Side Processing**: Runs entirely in the browser using Web APIs for speed and privacy.
- **Website SDK (`FileOptimizerSDK`)**: Intercepts HTML file inputs to automatically compress uploads before sending data to backend servers.
- **Batch Processing**: Supports multi-file concurrent compression with ZIP archive generation.

---

### Future Roadmap

#### pdf-optimizer (Planned)
Document compression tool designed to optimize large PDF files by compressing embedded raster images and stream data while keeping vector text sharp.

#### media-optimizer (Planned)
Browser-based video and audio compression utility powered by FFmpeg WebAssembly.

---

## Directory Overview

```text
tools/
├── LICENSE                        # Copyright License
├── README.md                      # Repository Index
└── file-optimizer/                # Image Optimization Tool & SDK
    ├── LICENSE                    # Tool License
    ├── index.html                 # Application Interface
    ├── integration-demo.html      # Integration Demo Page
    ├── dokumentasi.html           # Technical SDK Documentation
    ├── package.json               # Package Manifest
    ├── vite.config.js             # Vite Configuration
    ├── README.md                  # Tool Documentation
    └── src/
        ├── style.css              # Stylesheet
        ├── main.js                # UI Logic
        ├── sdk/
        │   └── FileOptimizerSDK.js # Auto-compress SDK
        ├── core/
        │   ├── ImageCompressor.js # Resolution-preserves compression engine
        │   └── BatchProcessor.js  # Batch queue manager
        └── utils/
            └── formatters.js      # Utility functions
```

---

## License

Copyright © 2026 Gilang. All rights reserved.

Proprietary software. Unauthorized copying, distribution, or modification of this source code or associated files via any medium is strictly prohibited.
