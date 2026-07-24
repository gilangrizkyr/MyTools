# 🛠️ MyTools Repository Index

Central repository index for developing web utilities, developer tools, and optimization modules.

---

## 🧰 Tools Directory

### 1. ⚡ File & Image Optimizer Pro (`file-optimizer`)

> **Category**: Media & File Optimization | **Status**: `PRODUCTION READY`

Professional tool and integration SDK designed to compress large image files (such as 16 MB down to **< 2 MB**) without altering original dimensions (*width × height*) while preserving crisp visual quality.

#### 📊 Specifications & Performance:
- **Target File Size**: From 16 MB+ $\rightarrow$ **< 2 MB** (85%–90% file size reduction).
- **Resolution Retention**: **100% Precision** (Original pixel width × height preserved intact).
- **Processing Engine**: 100% *Client-Side Browser* (Secure, zero server load, zero third-party data transfer).
- **Supported Formats**: WebP, AVIF, JPEG, PNG.

#### ✨ Key Features:
- **Visual Split-Screen Comparison**: Interactive *Before vs After* slider to visually inspect image sharpness prior to downloading.
- **Website Integration SDK (`FileOptimizerSDK`)**: Embeddable module that enables external websites to intercept user file uploads and automatically compress them to < 2 MB before sending to backend database.
- **Batch Processing & ZIP Export**: Concurrent multi-file processing queue with instant `.zip` archive export.

#### 🔗 Quick Access & Links:
- 📁 **Folder Location**: [`file-optimizer/`](file:///home/Gilang/tools/file-optimizer)
- 📖 **Integration Documentation**: [`dokumentasi.html`](file:///home/Gilang/tools/file-optimizer/dokumentasi.html)
- 🧪 **Live SDK Integration Demo**: [`integration-demo.html`](file:///home/Gilang/tools/file-optimizer/integration-demo.html)
- 📄 **Tool README**: [`file-optimizer/README.md`](file:///home/Gilang/tools/file-optimizer/README.md)

---

### ⏳ 2. [COMING SOON] Tool #2: Document & PDF Optimizer (`pdf-optimizer`)

> **Category**: Document Processing | **Status**: `PLANNED`

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        🚧 COMING SOON - TOOL #2                        │
├────────────────────────────────────────────────────────────────────────┤
│ Planned Tool #2: PDF & Document Optimizer                              │
│ - Purpose: Compress large PDF files (10 MB - 100 MB+)                  │
│ - Key Features: Embedded stream compression & raster image optimization│
│ - Target: Significant file size reduction without corrupting vector/txt│
└────────────────────────────────────────────────────────────────────────┘
```

---

### ⏳ 3. [COMING SOON] Tool #3: Video & Media Compressor (`media-optimizer`)

> **Category**: Video & Audio Processing | **Status**: `PLANNED`

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        🚧 COMING SOON - TOOL #3                        │
├────────────────────────────────────────────────────────────────────────┤
│ Planned Tool #3: Video & Audio Compressor                              │
│ - Purpose: Compress video bitrate & audio codecs in-browser            │
│ - Key Features: FFmpeg WebAssembly Client-Side Processing              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```text
tools/
├── README.md                      # Main tools repository index (English)
└── file-optimizer/                # Tool #1: File & Image Optimizer Pro
    ├── index.html                 # Main web application UI (Bright Ocean Blue Theme)
    ├── integration-demo.html      # External website SDK integration demo
    ├── dokumentasi.html           # Technical integration documentation
    ├── package.json               # Vite & npm dependency manifest
    ├── vite.config.js             # Bundler & multi-entry configuration
    ├── README.md                  # Detailed file-optimizer technical documentation
    └── src/
        ├── style.css              # Bright White & Ocean Blue design system
        ├── main.js                # Web application integration layer
        ├── sdk/
        │   └── FileOptimizerSDK.js # SDK for external website auto-compression (< 2MB)
        ├── core/
        │   ├── ImageCompressor.js # High-precision resolution retention engine
        │   └── BatchProcessor.js  # Concurrent multi-file batch queue manager
        └── utils/
            └── formatters.js      # Bytes formatting & filename utilities
```

---

## 📝 Guidelines for Adding New Tools

To add a new tool to this repository:
1. Create a new directory under `tools/` using kebab-case naming (e.g., `pdf-optimizer/`).
2. Add standard configuration files (`package.json`, `index.html`, `README.md`).
3. Update the `[COMING SOON]` section in this main `README.md` to `PRODUCTION READY`.
