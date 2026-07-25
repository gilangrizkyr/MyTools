# Tools Directory

A collection of web utility tools, optimization modules, and developer scripts built and maintained by Gilang.

## Repository Index

### 1. image-optimizer (`browser-image-optimizer-sdk`)

High-fidelity client-side image optimization library and SDK designed to compress high-resolution images (e.g., 16 MB+ down to under 2 MB) while strictly preserving 1:1 original pixel dimensions (width × height) and pristine visual quality. Available as a live web application, SDK, and official NPM package.

- **Status**: Production Ready & Published to NPM
- **Location**: [`image-optimizer/`](file:///home/Gilang/tools/image-optimizer)
- **Official NPM Package**: [`browser-image-optimizer-sdk`](https://www.npmjs.com/package/browser-image-optimizer-sdk) (`npm i browser-image-optimizer-sdk`)
- **Tech Stack**: Vanilla JavaScript (ES Modules), TypeScript Declarations (`index.d.ts`), HTML5 Canvas, OffscreenCanvas, Vite
- **Live Web App**: [Launch Image Optimizer](https://gilangrizkyr.github.io/MyTools/image-optimizer/index.html)
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/image-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/image-optimizer/integration-demo.html)

#### Key Capabilities & Architecture
- **Zero Resolution Loss**: Preserves 1:1 original pixel dimensions (e.g., 6250 × 2946 px) with 0% cropping or dimension shrinkage.
- **High-Fidelity Visual Engine**: Guarantees pristine visual clarity (32-bit RGBA 16.7M color depth) with quality floor scaling ($\ge 0.72$) and zero color shift or artifacts across WebP, JPEG, AVIF, and PNG.
- **Foolproof Size Protection**: Enforces an absolute size safety rule that prevents file size from expanding above original file sizes.
- **NPM Package Integration**: Installable via `npm install browser-image-optimizer-sdk` for instant use in Vue, React, Next.js, Angular, Svelte, Laravel, and Node.js applications.
- **Auto-Hook Input Interceptor (`FileOptimizerSDK`)**: Automatically intercepts HTML `<input type="file">` elements to compress image uploads in the browser before sending data to backend servers.
- **Batch Processing Engine**: Concurrent multi-file batch processing queue with ZIP archive export capabilities.

---

### 2. pdf-optimizer

Client-side PDF document optimization library and SDK built to compress large PDF documents (10 MB - 50 MB+ down to < 2 MB) while keeping vector text 100% sharp and preserving client data privacy.

- **Status**: Production Ready
- **Location**: [`pdf-optimizer/`](file:///home/Gilang/tools/pdf-optimizer)
- **Tech Stack**: Vanilla JavaScript (ES Modules), pdf-lib, pdfjs-dist, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/pdf-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/pdf-optimizer/integration-demo.html)

#### Key Capabilities
- **Text & Vector Precision**: Keeps PDF vector text layers and fonts crisp and copyable while re-encoding embedded raster image streams.
- **100% Client-Side Privacy**: Document processing executes entirely within the client's browser. Sensitive PDFs (IDs, contracts, invoices) never touch external servers.
- **Website SDK (`PdfOptimizerSDK`)**: Intercepts HTML `<input type="file" accept=".pdf">` elements to automatically compress PDF uploads to < 2 MB prior to backend submission.

---

### 3. media-optimizer

Client-side video and media optimization library and SDK built to compress large video files (50 MB - 300 MB+ down to < 15 MB) without watermark overlays or server data uploads.

- **Status**: Production Ready
- **Location**: [`media-optimizer/`](file:///home/Gilang/tools/media-optimizer)
- **Tech Stack**: Vanilla JavaScript (ES Modules), HTML5 Video Canvas, MediaRecorder API, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/media-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/media-optimizer/integration-demo.html)

#### Key Capabilities
- **Watermark-Free Client Execution**: Compresses video files entirely within the browser via Web APIs, avoiding third-party server uploads and watermark overlays.
- **Adaptive Bitrate Scaling**: Automatically recalculates video bitrate constraints to achieve web target file sizes (< 15 MB).
- **Website SDK (`MediaOptimizerSDK`)**: Intercepts HTML `<input type="file" accept="video/*">` elements to compress video uploads prior to form submission.

---

### 4. doc-excel-optimizer

Client-side Office document and spreadsheet optimization library and SDK built to compress Word (`.docx`), Excel (`.xlsx`), and PowerPoint (`.pptx`) files while keeping 100% of text, formulas, layout formatting, and table definitions completely untouched.

- **Status**: Production Ready
- **Location**: [`doc-excel-optimizer/`](file:///home/Gilang/tools/doc-excel-optimizer)
- **Tech Stack**: Vanilla JavaScript (ES Modules), JSZip, browser-image-optimizer-sdk, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/doc-excel-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/doc-excel-optimizer/integration-demo.html)

#### Key Capabilities
- **0% Data Loss Guarantee**: Unpacks Office document ZIP archives and compresses embedded media assets in `word/media/`, `ppt/media/`, and `xl/media/` while keeping text, formulas, XML tags, and formatting 100% untouched.
- **100% Client-Side Privacy**: Operates entirely within the browser via JSZip without server uploads.
- **Website SDK (`DocOptimizerSDK`)**: Intercepts HTML `<input type="file" accept=".docx,.xlsx,.pptx">` elements to automatically compress Office document uploads.

---

## Directory Overview

```text
tools/
├── LICENSE                        # Copyright License
├── README.md                      # Repository Index & Documentation
├── index.html                     # Central Dashboard Landing Page
├── image-optimizer/               # Tool #1: Image Optimization Tool, SDK & NPM Package
│   ├── LICENSE                    # Tool License
│   ├── README.md                  # Tool Documentation & NPM Guide
│   ├── index.js                   # NPM Package Main Entry Point
│   ├── index.d.ts                 # TypeScript Declaration File
│   ├── index.html                 # Application Interface
│   ├── integration-demo.html      # Integration Demo Page
│   ├── dokumentasi.html           # Technical SDK Documentation
│   ├── package.json               # NPM Package Manifest (`browser-image-optimizer-sdk`)
│   ├── vite.config.js             # Vite Configuration
│   └── src/
│       ├── style.css              # Stylesheet
│       ├── main.js                # UI Logic
│       ├── sdk/
│       │   └── FileOptimizerSDK.js # Auto-compress SDK
│       ├── core/
│       │   ├── ImageCompressor.js # High-Fidelity compression engine
│       │   └── BatchProcessor.js  # Batch queue manager
│       └── utils/
│           └── formatters.js      # Utility functions
├── pdf-optimizer/                 # Tool #2: PDF & Document Smart Optimizer
│   ├── LICENSE                    # Tool License
│   ├── index.html                 # Application Interface
│   ├── integration-demo.html      # Integration Demo Page
│   ├── dokumentasi.html           # Technical SDK Documentation
│   ├── package.json               # Package Manifest
│   ├── vite.config.js             # Vite Configuration
│   ├── README.md                  # Tool Documentation
│   └── src/
│       ├── style.css              # Stylesheet
│       ├── main.js                # UI Logic
│       ├── sdk/
│       │   └── PdfOptimizerSDK.js # Auto-compress PDF SDK
│       ├── core/
│       │   └── PdfCompressor.js  # PDF stream compression engine
│       └── utils/
│           └── formatters.js      # Bytes formatters
├── media-optimizer/               # Tool #3: Client-Side Video & Media Compressor
│   ├── LICENSE                    # Tool License
│   ├── index.html                 # Application Interface
│   ├── integration-demo.html      # Integration Demo Page
│   ├── dokumentasi.html           # Technical SDK Documentation
│   ├── package.json               # Package Manifest
│   ├── vite.config.js             # Vite Configuration
│   ├── README.md                  # Tool Documentation
│   └── src/
│       ├── style.css              # Stylesheet
│       ├── main.js                # UI Logic
│       ├── sdk/
│       │   └── MediaOptimizerSDK.js # Auto-compress Video SDK
│       ├── core/
│       │   └── MediaCompressor.js # Video stream compression engine
│       └── utils/
│           └── formatters.js      # Formatting utilities
└── doc-excel-optimizer/           # Tool #4: Office Document & Spreadsheet Optimizer
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
        │   └── DocOptimizerSDK.js # Auto-compress Office SDK
        ├── core/
        │   └── DocCompressor.js   # Office ZIP media compressor engine
        └── utils/
            └── formatters.js      # Formatting utilities
```

---

## License

Copyright © 2026 Gilang. All rights reserved.

Proprietary software. Unauthorized copying, distribution, or modification of this source code or associated files via any medium is strictly prohibited.