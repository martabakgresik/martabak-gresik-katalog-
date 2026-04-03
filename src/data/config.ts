import type { Addon } from "../hooks/useCart";

/**
 * PUSAT KONTROL MARTABAK GRESIK ⚙️
 * Edit file ini untuk merubah pengaturan toko tanpa menyentuh kode aplikasi.
 */

// ⏰ JAM OPERASIONAL
export const OPEN_HOUR = 16;  // Jam Buka (16:00)
export const CLOSE_HOUR = 23; // Jam Tutup (23:00)

// 🎟️ PROMO & DISKON
export const PROMO_CODE = "MARTABAKBARU"; // Kode yang harus dimasukkan pelanggan
export const PROMO_PERCENT = 10;          // Persentase diskon (Misal: 10 untuk 10%)

// 🗓️ DAFTAR HARI LIBUR / TUTUP (Format: YYYY-MM-DD)
export const HOLIDAYS = [
  "2026-03-19", 
  "2026-03-20",
  "2026-03-21",
  "2026-03-23"
];

// 📱 INFORMASI TOKO (Untuk AI Assistant)
export const STORE_NAME = "Martabak Gresik";
export const STORE_ADDRESS = "Jl. Usman Sadar No 10, Gresik, Jawa Timur, Indonesia";
export const STORE_PHONE = "081330763633";
export const SINCE_YEAR = "2020";

// 🛵 PENGIRIMAN (Shipping)
export const SHIPPING_RATE_PER_KM = 2500;
export const MAX_SHIPPING_DISTANCE = 10;

// ⬇️ UI SPACING
// Jarak antara Pencarian dan Scroll Indicator (Gunakan class Tailwind: mt-2, mt-4, mt-8, dsb.)
export const SCROLL_SPACING = "mt-2"; 

// 🔑 KEAMANAN (Security)
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACwdrus7K-Tn9Gd-";

// 🖼️ ASSETS
const ASSET_BASE_URL = "/images";

/**
 * 💡 PANDUAN EDIT MENU:
 * - isBestSeller: true  => Memunculkan badge "Best Seller" (Piala Kuning)
 * - highlight: true     => Tulisan nama menu menjadi Kuning & Border menyala
 * - price: 15000        => Ubah angka untuk ganti harga
 * - description: "..."  => Ubah teks untuk ganti penjelasan menu
 */

// 🍕 DATA MENU MANIS (Terang Bulan)
export const MENU_SWEET = [
  {
    category: "Terang Bulan Standard",
    items: [
      { name: "Kacang", price: 12000, description: "Perpaduan klasik kacang tanah sangrai yang gurih and manis.", image: `${ASSET_BASE_URL}/sweet/kacang.webp` },
      { name: "Coklat", price: 12000, description: "Coklat butiran premium yang meleleh sempurna di setiap gigitan.", image: `${ASSET_BASE_URL}/sweet/coklat.webp` },
      { name: "Kacang + Coklat", price: 14000, description: "Kombinasi legendaris kacang gurih and coklat manis yang melimpah.", image: `${ASSET_BASE_URL}/sweet/kacang-coklat.webp` },
      { name: "Kacang + Coklat + Keju", price: 19000, isBestSeller: true, description: "Trio maut! Kacang, coklat, and keju dalam satu balutan adonan lembut.", image: `${ASSET_BASE_URL}/sweet/kacang-coklat-keju.webp` },
      { name: "Keju", price: 17000, isBestSeller: true, highlight: true, description: "Keju cheddar pilihan yang melimpah, lumer, and super gurih.", image: `${ASSET_BASE_URL}/sweet/keju.webp` },
      { name: "Keju + Kacang", price: 18000, highlight: true, description: "Gurihnya keju berpadu dengan renyahnya kacang tanah pilihan.", image: `${ASSET_BASE_URL}/sweet/keju-kacang.webp` },
      { name: "Keju + Coklat", price: 18000, highlight: true, description: "Harmoni sempurna antara manisnya coklat and gurihnya keju premium.", image: `${ASSET_BASE_URL}/sweet/keju-coklat.webp` },
    ],
  },
  {
    category: "Terang Bulan Pandan",
    items: [
      { name: "Pandan Kacang", price: 13000, description: "Adonan aroma pandan asli yang wangi dengan topping kacang gurih.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang.webp` },
      { name: "Pandan Coklat", price: 13000, description: "Aroma pandan yang khas berpadu dengan coklat butiran yang manis.", image: `${ASSET_BASE_URL}/sweet/pandan-coklat.webp` },
      { name: "Pandan Kacang + Coklat", price: 15000, description: "Wangi pandan, renyah kacang, and manis coklat dalam satu gigitan.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat.webp` },
      { name: "Pandan Kacang + Coklat + Keju", price: 21000, description: "Paket lengkap pandan dengan perpaduan topping premium favorit.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat-keju.webp` },
      { name: "Pandan Keju", price: 20000, highlight: true, isBestSeller: true, description: "Favorit pelanggan! Wangi pandan alami dengan keju melimpah.", image: `${ASSET_BASE_URL}/sweet/pandan-keju.webp` },
      { name: "Pandan Coklat Keju", price: 20000, highlight: true, description: "Coklat and keju melimpah di atas adonan pandan hijau yang lembut.", image: `${ASSET_BASE_URL}/sweet/pandan-coklat-keju.webp` },
      { name: "Pandan Kacang + Keju", price: 20000, highlight: true, description: "Kacang renyah and keju gurih dengan aroma pandan yang menggoda.", image: `${ASSET_BASE_URL}/sweet/pandan-kacang-keju.webp` },
    ],
  },
  {
    category: "Terang Bulan Red Velvet",
    items: [
      { name: "Red Velvet Kacang", price: 14000, description: "Adonan coklat merah yang mewah dengan taburan kacang sangrai.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang.webp` },
      { name: "Red Velvet Coklat", price: 14000, description: "Manisnya coklat berpadu dengan adonan Red Velvet yang lembut.", image: `${ASSET_BASE_URL}/sweet/redvelvet-coklat.webp` },
      { name: "Red Velvet Kacang Coklat", price: 16000, description: "Klasik kacang coklat kini hadir dengan gaya Red Velvet yang elegan.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat.webp` },
      { name: "Red Velvet Kacang Coklat Keju", price: 21000, description: "Kombinasi topping paling lengkap khusus untuk pecinta Red Velvet.", image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat-keju.webp` },
      { name: "Red Velvet Keju", price: 20000, highlight: true, description: "Kontras warna merah yang cantik dengan gurihnya keju melimpah.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju.webp` },
      { name: "Red Velvet Keju + Coklat", price: 21000, highlight: true, description: "Adonan mewah Red Velvet dengan topping favorit keju and coklat.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-coklat.webp` },
      { name: "Red Velvet Keju + Kacang", price: 21000, highlight: true, description: "Perpaduan tekstur kacang renyah and lembutnya keju Red Velvet.", image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-kacang.webp` },
    ],
  },
  {
    category: "Terang Bulan Blackforest",
    items: [
      { name: "Blackforest Kacang", price: 25000, description: "Adonan coklat pekat yang rich dengan taburan kacang renyah.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang.webp` },
      { name: "Blackforest Coklat", price: 25000, description: "Double chocolate! Adonan coklat dengan limpahan coklat butiran.", image: `${ASSET_BASE_URL}/sweet/blackforest-coklat.webp` },
      { name: "Blackforest Kacang Coklat", price: 26000, description: "Sensasi coklat hitam yang mewah dengan duo kacang and coklat.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat.webp` },
      { name: "Blackforest Kacang Coklat Keju", price: 29000, description: "Varian premium terlengkap dengan adonan coklat Blackforest.", image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat-keju.webp` },
      { name: "Blackforest Keju", price: 27000, highlight: true, isBestSeller: true, description: "Hitam manis berpadu dengan putih gurihnya keju cheddar pilihan.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju.webp` },
      { name: "Blackforest Keju Kacang", price: 28000, highlight: true, description: "Coklat rich, keju gurih, and kacang renyah dalam satu perpaduan.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju-kacang.webp` },
      { name: "Blackforest Keju Coklat", price: 28000, highlight: true, description: "Kenikmatan maksimal bagi pecinta coklat tingkat tinggi.", image: `${ASSET_BASE_URL}/sweet/blackforest-keju-coklat.webp` },
    ],
  },
];

// 🍗 DATA MENU ASIN (Martabak Telor)
export const MENU_SAVORY = [
  {
    title: "Daging Sapi",
    variants: [
      {
        type: "Telor Ayam",
        description: "Martabak telor klasik dengan isian daging sapi bumbu rempah and telor ayam segar.",
        prices: [
          { qty: 2, price: 25000, isBestSeller: true, highlight: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 34000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 42000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
      {
        type: "Telor Bebek",
        description: "Rasa lebih gurih and mantap dengan isian daging sapi and telor bebek pilihan.",
        prices: [
          { qty: 2, price: 26000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 44000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 50000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
    ],
  },
  {
    title: "Daging Ayam",
    variants: [
      {
        type: "Telor Ayam",
        description: "Martabak isian daging ayam cincang yang empuk, dibalut telor ayam berkualitas.",
        prices: [
          { qty: 2, price: 22000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 30000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
      {
        type: "Telor Bebek",
        description: "Martabak telor bebek dengan isian daging ayam istimewa yang gurih maksimal.",
        prices: [
          { qty: 2, price: 24000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 32000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
    ],
  },
  {
    title: "Menu Pedas",
    variants: [
      {
        type: "Samyang Ayam Pedas",
        description: "Paduan unik Martabak Telor dengan Samyang pedas dan daging ayam pilihan.",
        prices: [
          { qty: 2, price: 30000, desc: "2 Telor Bebek + Daging Ayam", image: `${ASSET_BASE_URL}/savory/samyang-pedas.webp` },
        ],
      },
      {
        type: "Samyang Sapi Pedas",
        description: "Sensasi pedas Samyang berpadu dengan daging sapi gurih dalam satu kulit martabak renyah.",
        prices: [
          { qty: 2, price: 32000, desc: "2 Telor Bebek + Daging Sapi", isBestSeller: true, image: `${ASSET_BASE_URL}/savory/samyang-pedas.webp` },
        ],
      },
    ],
  },
];

// ➕ ADD-ONS (Tambahan)
export const ADDONS_SWEET: Addon[] = [
  { name: 'Tambah Coklat', price: 3000 },
  { name: 'Tambah Kacang', price: 2000 },
  { name: 'Tambah Keju', price: 7000 },
  { name: 'Tambah Milo', price: 5000 },
];

export const ADDONS_SAVORY: Addon[] = [
  { name: 'Tambah Sosis', price: 2000, minQty: 1, maxQty: 20, defaultQty: 3 },
  { name: 'Tambah Kornet', price: 13000, disabled: true },
  { name: 'Tambah Jamur', price: 10000, disabled: true },
  { name: 'Tambah Acar', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Irisan Cabe', price: 400, minQty: 1, maxQty: 20, defaultQty: 5 },
  { name: 'Tambah Saus', price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: 'Tambah Sambal Pedas', price: 5000, minQty: 1, maxQty: 20, defaultQty: 1 },
];
