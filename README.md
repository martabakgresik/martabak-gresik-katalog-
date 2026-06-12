# Martabak Gresik Katalog & Kasir Mini

Aplikasi web modern untuk **Katalog Digital** dan **Sistem Kasir Mini (POS)** khusus untuk bisnis kuliner Martabak. Dibangun dengan fokus pada kecepatan, desain *mobile-first*, dan pengalaman pengguna yang interaktif.

## 🚀 Fitur Utama

- **Katalog Menu Interaktif:** Tampilan menu yang bersih, dibagi berdasarkan kategori (Manis & Asin).
- **Keranjang Belanja:** Perhitungan harga total otomatis, termasuk diskon (Promo) dan biaya pengiriman berdasarkan kilometer.
- **Admin Dashboard:** Panel rahasia untuk mengelola status toko (Buka/Tutup/Libur), jam operasional (dengan akurasi menit), harga pengiriman, dan promosi.
- **Sinkronisasi Waktu Nyata:** Menggunakan *Cloudflare D1* (SQLite) untuk menyimpan status toko yang langsung memantul ke halaman depan.
- **Pemesanan via WhatsApp:** *Checkout* pesanan langsung diteruskan menjadi pesan WhatsApp yang rapi ke nomor admin/toko.
- **Dark Mode Support:** Antarmuka dengan dukungan Mode Gelap (Dark Mode) modern menggunakan pendekatan *Glassmorphism*.

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan tumpukan teknologi (Tech Stack) modern:

- **Frontend Framework:** [React 19](https://react.dev/) dengan [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) dengan palet warna khusus (`brand-orange`).
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) untuk manajemen state lokal (Keranjang, UI State).
- **Backend & Database:** [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/) & [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQLite).
- **Animasi:** Framer Motion (untuk transisi antar halaman dan notifikasi).
- **Ikonografi:** Lucide React.

## 📦 Panduan Instalasi & Pengembangan Lokal

### 1. Kebutuhan Sistem
Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi 18+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm install -g wrangler`)

### 2. Instalasi Dependensi
Clone repositori ini, kemudian jalankan:
```bash
npm install
```

### 3. Menjalankan Server Pengembangan (Frontend Saja)
Jika Anda hanya ingin merubah UI/Frontend tanpa membutuhkan koneksi ke Database D1:
```bash
npm run dev
```

### 4. Menjalankan Fullstack Lokal (Frontend + Database D1)
Untuk menjalankan aplikasi secara utuh beserta fungsi API dan simulasi database D1 lokal:
```bash
npm run pages:dev
```
Aplikasi akan tersedia di `http://localhost:8788`.

## 🗄️ Panduan Database (Cloudflare D1)

Aplikasi ini menggunakan database relasional *serverless* dari Cloudflare (D1). Skema dan pengaturan awal berada di dalam folder `migrations/`.

### Menjalankan Migrasi di Lokal
Untuk memperbarui/membuat tabel di database lokal (untuk *testing*):
```bash
wrangler d1 execute MARTABAK_D1 --local --file=./migrations/0000_schema.sql
```

### Menjalankan Migrasi ke Production
Setelah Anda yakin dengan perubahan skema, jalankan migrasi ke database yang *live*:
```bash
wrangler d1 execute MARTABAK_D1 --remote --file=./migrations/0000_schema.sql
```

## 🏗️ Struktur Direktori

```text
├── functions/             # Cloudflare Pages Functions (Backend API)
│   └── api/
│       └── config.ts      # Endpoint utama untuk sinkronisasi setting toko (GET/POST)
├── migrations/            # File SQL untuk skema database D1
├── public/                # Aset statis (Gambar produk, Ikon, dll)
├── src/
│   ├── components/        # Komponen React modular (Header, MenuCard, Cart, dll)
│   ├── data/              # Konfigurasi statis, teks i18n, dan rules default
│   ├── hooks/             # Custom React Hooks (useCart, dll)
│   ├── store/             # Zustand store (useAppStore.ts)
│   ├── views/             # Halaman utama (AdminDashboard, CartPage)
│   ├── App.tsx            # Komponen Induk dan Routing sederhana
│   └── main.tsx           # Entry point aplikasi React
└── wrangler.toml          # Konfigurasi Cloudflare (Binding D1, Vars)
```

## 🎨 Panduan UI & Desain (Untuk Developer)

- **Mobile First:** Komponen harus terlihat rapi di layar ponsel sebelum disesuaikan untuk layar *Desktop*.
- **Warna Utama:** Gunakan `text-brand-orange` dan `bg-brand-orange` (atau alias Tailwind yang sepadan) untuk tombol *Call to Action* (CTA).
- **State Kosong/Memuat:** Gunakan skeleton loading (seperti efek *pulse* di `App.tsx`) untuk transisi data.
- **Hindari Ambiguitas Jam:** Selalu gunakan input `type="time"` atau dropdown Jam/Menit terpisah untuk menghindari bug format AM/PM bawaan OS.

---
*Dibuat untuk Martabak Gresik oleh tim Antigravity IDE.*
