# Ringkasan Fitur MD-to-PDF Converter

> Dokumentasi lengkap fitur aplikasi konverter Markdown ke PDF dengan styling premium.

---

## 🎯 Fitur Utama

### 1. Konversi Markdown ke PDF
Aplikasi web berbasis **Express.js** yang mengkonversi file `.md` menjadi PDF berkualitas tinggi menggunakan **Puppeteer** dan **marked**.

---

## 📤 Fitur Upload & Interface

### Drag & Drop Upload
- Mendukung **drag & drop** file `.md`
- Klik untuk memilih file secara manual
- Validasi ekstensi file (hanya `.md` yang diizinkan)
- Preview nama file yang dipilih
- Tombol hapus file untuk mengganti pilihan

### Ukuran Kertas (Paper Size)
| Opsi | Deskripsi |
|------|-----------|
| **Single Page** | Halaman tunggal dengan tinggi otomatis (default) |
| **A4** | Multi-halaman dengan ukuran 210×297mm |
| **Letter** | Multi-halaman dengan ukuran 8.5×11 inch |

### Pengaturan Lebar Flowchart
- Slider untuk mengatur lebar **Mermaid Flowchart** (30%-100%)
- Default: 70%

### Preview PDF Real-time
- Preview PDF langsung di browser setelah konversi
- Tombol download terpisah
- Progress indicator 3 langkah:
  1. Memproses Markdown
  2. Merender diagram
  3. Membuat PDF

---

## 🎨 Fitur Styling & Rendering

### GitHub Flavored Markdown (GFM)
Didukung melalui library **marked** dengan extensions:
- `marked-gfm-heading-id` - Auto ID untuk heading
- `marked-mangle` - Obfuscate email
- `marked-alert` - GitHub-style alerts

### Syntax Highlighting (Monokai Pro Theme)
Menggunakan **highlight.js** dengan warna kustom:

| Elemen | Warna |
|--------|-------|
| Keywords | Pink (`#FF6188`) |
| Strings | Yellow (`#FFD866`) |
| Built-in | Blue (`#78DCE8`) |
| Literals | Purple (`#AB9DF2`) |
| Functions | Green (`#A9DC76`) |
| Comments | Gray (`#727072`) |

### Fitur Code Block
- **Nomor baris** di setiap baris kode
- Border pemisah antara nomor dan konten
- Font **JetBrains Mono**
- Background gelap (#2D2A2E)
- **PHP-template support** untuk highlight PHP dengan HTML embedded

### Inline Code
- Background **oranye** (`#ffdcb5`)
- Teks coklat gelap untuk kontras
- Rounded border

---

## 📊 Diagram Mermaid

### Dukungan Diagram
- Terintegrasi dengan **Mermaid.js** via CDN
- Toggle enable/disable (`ENABLE_MERMAID = true/false`)
- Fallback ke code block jika CDN gagal

### Tipe Diagram & Lebar
| Tipe Diagram | Default Width |
|--------------|---------------|
| **Flowchart TB/TD/LR** | Dinamis (slider 30-100%) |
| **ER Diagram** | 30% (centered) |
| **Lainnya** | 100% |

### Keamanan Mermaid
- Escape HTML entities (`<` dan `>`)
- Security level: loose
- ID unik per diagram

---

## 📢 GitHub-Style Alerts

Mendukung 5 tipe alert dengan styling khusus:

| Alert | Warna Border | Background |
|-------|--------------|------------|
| **NOTE** | Biru (#0969da) | Light blue (#ddf4ff) |
| **TIP** | Hijau (#1a7f37) | Light green (#dafbe1) |
| **IMPORTANT** | Ungu (#8250df) | Light purple (#f5f0ff) |
| **WARNING** | Kuning (#bf8700) | Light yellow (#fff8c5) |
| **CAUTION** | Merah (#d1242f) | Light red (#ffebe9) |

**Syntax:**
```markdown
> [!NOTE]
> Ini adalah catatan penting

> [!WARNING]
> Ini adalah peringatan
```

---

## 📄 Fitur PDF Generation

### Single Page Mode
- Class `single-page-mode` untuk mencegah page break
- Kalkulasi tinggi otomatis berdasarkan konten
- Menghitung semua child elements untuk mendapatkan tinggi maksimal
- Buffer tambahan 100px di akhir

### Multi-Page Mode (A4/Letter)
- Margin yang sudah dikonfigurasi
- Print background enabled
- Format standar A4 dan US Letter

### Engine
- **Puppeteer** dengan Chrome headless
- Timeout 180 detik untuk diagram kompleks
- No-sandbox mode untuk Linux

---

## 🔧 Elemen Markdown Lainnya

### Typography
- Font: System fonts (Apple, Segoe UI, Helvetica, Arial)
- Line height: 2 (paragraf), 2.5 (code)

### Heading (H1-H6)
- H1 & H2 dengan border bawah
- Font weight 600

### Tabel
- Border collapse
- Alternating row colors (striped)
- Max-width 100%

### Blockquote
- Border kiri 0.25em
- Warna teks abu-abu (#57606a)

### Lists (ul/ol)
- Padding kiri 2em

### Images
- Max-width 100%
- Box-sizing: border-box

### Horizontal Rule
- Height 0.25em
- Background color abu-abu

### Links
- Warna biru (#0969da)
- Tanpa underline

---

## 🏗️ Arsitektur Teknis

### Dependencies
```json
{
  "express": "^4.18.2",
  "highlight.js": "^11.8.0",
  "marked": "^17.0.1",
  "marked-alert": "^2.1.2",
  "marked-gfm-heading-id": "^4.1.3",
  "marked-highlight": "^2.2.3",
  "marked-mangle": "^1.1.12",
  "multer": "^1.4.5-lts.1",
  "puppeteer": "^21.0.0"
}
```

### File Structure
```
md-to-pdf/
├── server.js              # Express server & API endpoint
├── lib/
│   ├── converter.js       # Core konversi MD → PDF
│   └── pdf-styles.css     # Styling untuk output PDF
├── public/
│   ├── index.html         # UI Frontend
│   └── style.css          # Styling UI
├── uploads/               # Temporary upload folder
└── package.json
```

### API Endpoint
```
POST /convert
├── Body (multipart/form-data):
│   ├── markdown: File (.md)
│   ├── paperSize: string (single|a4|letter)
│   └── flowchartWidth: number (30-100)
└── Response: application/pdf
```

---

## 🎨 UI Interface

### Desain Modern
- Gradient background
- Glassmorphism effect
- Font **Inter** dari Google Fonts
- Icons dari **Font Awesome 6**
- Responsive layout (dua kolom)

### Panel Kiri (Upload)
- Drop zone dengan animasi
- Paper size selector
- Flowchart width slider
- Tombol convert
- Message area (error/success)

### Panel Kanan (Preview)
- Progress header dengan 3 steps
- Iframe untuk preview PDF
- Tombol download

---

*Dokumentasi ini dibuat berdasarkan analisis kode sumber pada 21 Desember 2025*
