# 🚀 File & Image Optimizer Pro (`file-optimizer`)

Sebuah tool profesional untuk mengompresi dan mengoptimalkan ukuran file gambar berukuran besar (misalnya 16 MB menjadi <= 2 MB atau media hingga 100 MB) **tanpa mengorbankan resolusi asli gambar** dan tetap mempertahankan kualitas visual yang tajam.

---

## ✨ Fitur Utama

- **100% Retensi Resolusi Asli**: Mengurangi ukuran file secara drastis tanpa mengubah lebar x tinggi (*width × height*) gambar asli.
- **Optimasi Cerdas (Smart Target Size)**: Secara otomatis menyesuaikan faktor kualitas untuk mencapai target file <= 2 MB yang ideal untuk kebutuhan upload website.
- **Visual Split-Screen Comparison**: Fitur slider *Before/After* interaktif untuk memeriksa ketajaman gambar secara visual sebelum mengunduh.
- **Multi-Format Support**: Mendukung kompresi ke **WEBP**, **AVIF**, **JPEG**, dan **PNG**.
- **Batch Processing & ZIP Download**: Mengolah banyak file sekaligus dalam antrean asinkron dan mengekspor hasilnya langsung ke file ZIP.
- **100% Client-Side Processing**: Berjalan sepenuhnya di dalam browser menggunakan Web API (`OffscreenCanvas` & `HTML5 Canvas`) tanpa mengirim file ke server eksternal, menjamin kecepatan maksimal dan privasi data.

---

## 📁 Struktur Folder Project

Struktur folder dibuat sangat modular dan profesional agar mudah dipahami serta siap dikembangkan untuk modul optimasi file lainnya di masa depan:

```text
file-optimizer/
├── index.html                 # Entry point HTML aplikasi dengan layout responsif & UI modern
├── package.json               # Dependensi proyek (Vite, JSZip, Lucide Icons)
├── vite.config.js             # Konfigurasi bundler Vite & dev server
├── README.md                  # Dokumentasi & panduan pengembangan tool
└── src/
    ├── style.css              # Design system: Dark mode sleek theme, glassmorphism & animasi
    ├── main.js                # Integration layer (Dropzone, slider event handlers & state)
    ├── core/                  # Core engine kompresi
    │   ├── ImageCompressor.js # Engine kompresi gambar berbasis canvas & resolusi presisi
    │   └── BatchProcessor.js  # Pengelola antrean pemrosesan banyak file sekaligus
    └── utils/
        └── formatters.js      # Utility format ukuran bytes, persen penghematan, & penamaan file
```

---

## 🛠️ Panduan Pengembangan & Penggunaan

### 1. Install Dependensi
Jalankan perintah berikut di dalam direktori `file-optimizer`:

```bash
cd /home/Gilang/tools/file-optimizer
npm install
```

### 2. Jalankan Dev Server
Untuk memulai server pengembangan lokal:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`.

### 3. Build untuk Produksi
Untuk mem-build bundle produksi:

```bash
npm run build
```

---

## 🧩 Panduan Ekstensi Modul Baru di Masa Depan

Tool ini dirancang ekstensibel. Jika ingin menambahkan dukungan optimasi jenis file lain (seperti PDF atau Media/Video), Anda cukup membuat modul baru di dalam direktori `src/core/`:

1. **Optimasi PDF**:
   Buat file `src/core/PdfOptimizer.js` untuk mengompresi struktur dokumen PDF (mengompresi embedded stream & objek bitmap PDF).
2. **Optimasi Video / Audio**:
   Buat file `src/core/MediaOptimizer.js` menggunakan FFmpeg WebAssembly (`@ffmpeg/ffmpeg`) untuk mengompresi bitrate video/audio di browser.
3. Registrasikan optimizer baru tersebut di `src/main.js` pada saat pendeteksian MIME Type file yang diunggah pengguna.
