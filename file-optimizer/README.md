# 🚀 File & Image Optimizer Pro (`file-optimizer`)

Sebuah tool & SDK profesional untuk mengompresi file gambar berukuran besar (misalnya 16 MB menjadi < 2 MB) **tanpa mengorbankan resolusi asli gambar** dan tetap mempertahankan kualitas visual yang tajam.

---

## ✨ Fitur Utama

- **100% Retensi Resolusi Asli**: Mengurangi ukuran file secara drastis tanpa mengubah lebar x tinggi (*width × height*) gambar asli.
- **Optimasi Cerdas (Smart Target Size)**: Secara otomatis menyesuaikan faktor kualitas untuk mencapai target file < 2 MB yang ideal untuk kebutuhan upload website.
- **🌐 Website Integration SDK (`FileOptimizerSDK`)**: Dapat diintegrasikan ke website eksternal mana pun untuk meng-intercept `<input type="file">` dan otomatis mengompresi gambar < 2 MB sebelum di-upload ke server.
- **Visual Split-Screen Comparison**: Fitur slider *Before/After* interaktif untuk memeriksa ketajaman gambar secara visual sebelum mengunduh.
- **Multi-Format Support**: Mendukung kompresi ke **WEBP**, **AVIF**, **JPEG**, dan **PNG**.
- **Batch Processing & ZIP Download**: Mengolah banyak file sekaligus dalam antrean asinkron dan mengekspor hasilnya langsung ke file ZIP.
- **100% Client-Side Processing**: Berjalan sepenuhnya di dalam browser menggunakan Web API (`OffscreenCanvas` & `HTML5 Canvas`) tanpa mengirim file ke server eksternal, menjamin kecepatan maksimal dan privasi data.

---

## 🌐 Panduan Integrasi ke Website Lain (Auto-Compress < 2MB)

Jika Anda ingin website eksternal mengompresi file gambar secara otomatis menjadi **kurang dari 2 MB (< 2 MB)** saat pengguna memilih file di `<input type="file">`, ikuti langkah berikut:

### Opsi A: Auto-Attach pada `<input type="file">`
Hanya butuh 3 baris kode untuk meng-intercept upload file di website Anda secara transparan:

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

// Hubungkan ke input file website Anda
FileOptimizerSDK.attachToInput('#uploadInput', {
  maxSizeBytes: 2 * 1024 * 1024, // Target otomatis < 2 MB
  onStart: (files) => {
    console.log('Mengompresi gambar otomatis...');
  },
  onSuccess: (compressedFiles) => {
    console.log('File berhasil dikompresi < 2MB:', compressedFiles[0]);
    // File di input element otomatis diganti dengan versi terkompresi < 2MB!
  }
});
```

### Opsi B: Kompresi File Langsung via Function API
Gunakan fungsi `FileOptimizerSDK.compress()` jika Anda mengelola proses upload manual (misal via AJAX/Fetch API):

```javascript
import { FileOptimizerSDK } from './src/sdk/FileOptimizerSDK.js';

const originalFile = document.getElementById('myInput').files[0];

// Kompresi file 16MB menjadi < 2MB dengan resolusi 100% utuh
const compressedFile = await FileOptimizerSDK.compress(originalFile, {
  maxSizeBytes: 2 * 1024 * 1024 // 2 MB target
});

console.log('Original size:', originalFile.size); // e.g. 16.4 MB
console.log('Compressed size:', compressedFile.size); // e.g. 1.8 MB
console.log('Resolution:', compressedFile.optimizerMeta.resolutionString); // e.g. 3840 × 2160 px

// Kirim file terkompresi < 2MB ke server backend
const formData = new FormData();
formData.append('image', compressedFile);
await fetch('/api/upload', { method: 'POST', body: formData });
```

---

## 📁 Struktur Folder Project

```text
file-optimizer/
├── index.html                 # Entry point HTML aplikasi utama (Bright Ocean Blue Theme)
├── integration-demo.html      # Halaman demo simulasi integrasi SDK di website eksternal
├── package.json               # Dependensi proyek (Vite, JSZip, Lucide Icons)
├── vite.config.js             # Konfigurasi bundler Vite & multi-entry build
├── README.md                  # Dokumentasi & panduan integrasi SDK
└── src/
    ├── style.css              # Design system: Cerah Putih & Biru Laut Theme
    ├── main.js                # Integration layer aplikasi web
    ├── sdk/
    │   └── FileOptimizerSDK.js # SDK Integrasi website eksternal untuk auto-compress < 2MB
    ├── core/                  # Core engine kompresi
    │   ├── ImageCompressor.js # Engine kompresi gambar berbasis canvas & resolusi presisi
    │   └── BatchProcessor.js  # Pengelola antrean pemrosesan banyak file sekaligus
    └── utils/
        └── formatters.js      # Utility format ukuran bytes & penamaan file
```

---

## 🛠️ Panduan Pengembangan

```bash
cd /home/Gilang/tools/file-optimizer

# 1. Install Dependensi
npm install

# 2. Jalankan Dev Server
npm run dev

# 3. Build untuk Produksi
npm run build
```
