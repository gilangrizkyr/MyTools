# 🛠️ MyTools Repository Index

Repositori pusat untuk pengembangan berbagai macam utilitas web, *developer tools*, dan modul optimasi buatan Gilang.

---

## 🧰 Daftar Tools Repository

### 1. ⚡ File & Image Optimizer Pro (`file-optimizer`)

> **Kategori**: Media & File Optimization | **Status**: `PRODUCTION READY`

Tool dan SDK profesional untuk mengompresi ukuran file gambar berukuran besar (seperti 16 MB menjadi **< 2 MB**) tanpa menurunkan resolusi (*width × height*) dan tetap mempertahankan ketajaman visual.

#### 📊 Spesifikasi & Performa:
- **Ukuran File Target**: Dari 16 MB+ $\rightarrow$ **< 2 MB** (Penghematan hingga 85%–90%).
- **Retensi Resolusi**: **100% Presisi** (Lebar × Tinggi piksel gambar asli dipertahankan utuh).
- **Pemrosesan**: 100% *Client-Side Browser* (Aman, tanpa beban server, tanpa kirim data ke pihak ketiga).
- **Format Didukung**: WebP, AVIF, JPEG, PNG.

#### ✨ Fitur Unggulan:
- **Visual Split-Screen Comparison**: Fitur slider *Before vs After* interaktif untuk memeriksa ketajaman gambar secara visual.
- **Website Integration SDK (`FileOptimizerSDK`)**: Modul yang dapat diintegrasikan ke website eksternal mana pun untuk meng-intercept upload file pengguna dan mengompresinya secara otomatis ke < 2 MB sebelum disimpan ke database.
- **Batch Processing & ZIP Export**: Pemrosesan banyak file sekaligus dalam antrean asinkron dan ekspor langsung ke format `.zip`.

#### 🔗 Akses & Tautan Cepat:
- 📁 **Lokasi Folder**: [`file-optimizer/`](file:///home/Gilang/tools/file-optimizer)
- 📖 **Dokumentasi Integrasi**: [`dokumentasi.html`](file:///home/Gilang/tools/file-optimizer/dokumentasi.html)
- 🧪 **Live Demo Integrasi SDK**: [`integration-demo.html`](file:///home/Gilang/tools/file-optimizer/integration-demo.html)
- 📄 **README Tool**: [`README.md`](file:///home/Gilang/tools/file-optimizer/README.md)

---

### ⏳ 2. [COMING SOON] Tool Ke-2: Document & PDF Optimizer (`pdf-optimizer`)

> **Kategori**: Document Processing | **Status**: `PLANNED`

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        🚧 COMING SOON - TOOL #2                        │
├────────────────────────────────────────────────────────────────────────┤
│ Rencana Tool Ke-2: PDF & Document Optimizer                            │
│ - Fungsi: Mengompresi file dokumen PDF besar (10 MB - 100 MB)          │
│ - Fitur: Kompresi embedded stream & objek gambar di dalam PDF          │
│ - Target: Pengurangan ukuran file dokumen tanpa merusak teks/vektor    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### ⏳ 3. [COMING SOON] Tool Ke-3: Video & Media Compressor (`media-optimizer`)

> **Kategori**: Video & Audio Processing | **Status**: `PLANNED`

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        🚧 COMING SOON - TOOL #3                        │
├────────────────────────────────────────────────────────────────────────┤
│ Rencana Tool Ke-3: Video & Audio Compressor                            │
│ - Fungsi: Mengompresi bitrate & codec video/audio                     │
│ - Fitur: FFmpeg WebAssembly Client-Side Processing                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Repositori Tools

```text
tools/
├── README.md                      # Index utama repositori tools ini
└── file-optimizer/                # Tool #1: File & Image Optimizer Pro
    ├── index.html                 # Antarmuka aplikasi utama (Bright Ocean Blue Theme)
    ├── integration-demo.html      # Halaman demo integrasi website eksternal
    ├── dokumentasi.html           # Dokumentasi teknis integrasi SDK
    ├── package.json               # Konfigurasi dependensi Vite & npm
    ├── vite.config.js             # Konfigurasi bundler & multi-entry build
    ├── README.md                  # Dokumentasi teknis khusus file-optimizer
    └── src/
        ├── style.css              # Design system Cerah Putih & Biru Laut
        ├── main.js                # Logic antarmuka aplikasi web
        ├── sdk/
        │   └── FileOptimizerSDK.js # SDK Integrasi auto-compress < 2MB untuk website lain
        ├── core/
        │   ├── ImageCompressor.js # Engine kompresi presisi resolusi
        │   └── BatchProcessor.js  # Engine antrean batch pemrosesan banyak file
        └── utils/
            └── formatters.js      # Utility penamaan file & format ukuran bytes
```

---

## 📝 Panduan Menambah Tool Baru

Untuk menambahkan tool baru ke repositori ini:
1. Buat direktori baru di dalam folder `tools/` (contoh: `pdf-optimizer/`).
2. Masukkan file konfigurasi dasar (`package.json`, `index.html`, `README.md`).
3. Update seksi `[COMING SOON]` pada file `README.md` utama ini menjadi status `PRODUCTION READY`.
