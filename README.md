# Tools Directory

A collection of web utility tools, optimization modules, and developer scripts built and maintained by Gilang.

## Repository Index

### 1. image-optimizer

Client-side image optimization library and SDK designed to compress high-resolution images (e.g., 16 MB down to under 2 MB) without altering pixel dimensions or sacrificing visual quality.

- **Status**: Production Ready
- **Location**: [`image-optimizer/`](file:///home/Gilang/tools/image-optimizer)
- **Tech Stack**: Vanilla JavaScript (ES Modules), HTML5 Canvas, OffscreenCanvas, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/image-optimizer/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/image-optimizer/integration-demo.html)

#### Key Capabilities
- **Zero Resolution Loss**: Maintains 1:1 original pixel dimensions (width × height).
- **Target Size Engine**: Automatically adjusts compression factor to hit target file sizes (< 2 MB) for web upload constraints.
- **Client-Side Processing**: Runs entirely in the browser using Web APIs for speed and privacy.
- **Website SDK (`FileOptimizerSDK`)**: Intercepts HTML file inputs to automatically compress uploads before sending data to backend servers.
- **Batch Processing**: Supports multi-file concurrent compression with ZIP archive generation.

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

### 4. ocr-scanner

Client-side Optical Character Recognition (OCR) scanner and integration SDK designed to extract structured metadata (Merchant Name, Date, Total Amount, Tax) from receipt and document images 100% locally in the browser, with instant export to Excel (CSV).

- **Status**: Production Ready
- **Location**: [`ocr-scanner/`](file:///home/Gilang/tools/ocr-scanner)
- **Tech Stack**: Vanilla JavaScript (ES Modules), Tesseract.js, HTML5 Canvas, Vite
- **Documentation**: [SDK Integration Guide](file:///home/Gilang/tools/ocr-scanner/dokumentasi.html) | [Live Integration Demo](file:///home/Gilang/tools/ocr-scanner/integration-demo.html)

#### Key Capabilities
- **100% Browser OCR Engine**: Runs Tesseract OCR locally in the browser, guaranteeing 100% data privacy and zero server API costs.
- **Structured Metadata Extractor**: Parses raw text output to auto-detect Merchant Name, Date, Total Amount, and Tax.
- **Website SDK (`ReceiptOcrSDK`)**: Intercepts receipt file uploads on external forms to automatically auto-fill form input fields.
- **Excel Export**: Exports parsed receipt records into Excel-compatible CSV files.

---

## Directory Overview

```text
tools/
├── LICENSE                        # Copyright License
├── README.md                      # Repository Index
├── index.html                     # Central Dashboard Landing Page
├── image-optimizer/               # Tool #1: Image Optimization Tool & SDK
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
│       │   └── FileOptimizerSDK.js # Auto-compress SDK
│       ├── core/
│       │   ├── ImageCompressor.js # Precision compression engine
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
└── ocr-scanner/                   # Tool #4: Client-Side Receipt & Document OCR Extractor
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
        │   └── ReceiptOcrSDK.js   # Auto-fill Receipt OCR SDK
        ├── core/
        │   └── OcrEngine.js       # Tesseract OCR & regex parser
        └── utils/
            └── formatters.js      # Formatting & CSV export utilities
```

---

## License

Copyright © 2026 Gilang. All rights reserved.

Proprietary software. Unauthorized copying, distribution, or modification of this source code or associated files via any medium is strictly prohibited.