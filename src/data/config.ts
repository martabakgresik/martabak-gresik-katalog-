import type { Addon } from "../hooks/useCart";
import {
  OPEN_HOUR,
  CLOSE_HOUR,
  PROMO_CODE,
  PROMO_PERCENT,
  HOLIDAYS,
  STORE_NAME,
  STORE_ADDRESS,
  STORE_PHONE,
  SINCE_YEAR,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE,
  SCROLL_SPACING,
  STORE_RULES,
} from "./storeRules";

/**
 * PUSAT KONTROL MARTABAK GRESIK ⚙️
 * Edit file ini untuk merubah pengaturan toko tanpa menyentuh kode aplikasi.
 */

// ⏰ JAM OPERASIONAL, PROMO, LIBUR, PROFIL TOKO, PENGIRIMAN, DAN UI
// Dipindahkan ke file khusus aturan: src/data/storeRules.ts
export {
  OPEN_HOUR,
  CLOSE_HOUR,
  PROMO_CODE,
  PROMO_PERCENT,
  HOLIDAYS,
  STORE_NAME,
  STORE_ADDRESS,
  STORE_PHONE,
  SINCE_YEAR,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE,
  SCROLL_SPACING,
  STORE_RULES,
};

// 🔑 KEAMANAN (Security)
const env: any = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
export const TURNSTILE_SITE_KEY = (env.VITE_TURNSTILE_SITE_KEY as string) || "0x4AAAAAACwdrus7K-Tn9Gd-";

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
export const getMenuSweet = (t: any) => [
  {
    category: t.catSweetStandard,
    items: [
      { name: t.itemKacang, price: 12000, description: t.descKacang, image: `${ASSET_BASE_URL}/sweet/kacang.webp` },
      { name: t.itemCoklat, price: 12000, description: t.descCoklat, image: `${ASSET_BASE_URL}/sweet/coklat.webp` },
      { name: `${t.itemKacang} + ${t.itemCoklat}`, price: 14000, description: t.descKacangCoklat, image: `${ASSET_BASE_URL}/sweet/kacang-coklat.webp` },
      { name: `${t.itemKacang} + ${t.itemCoklat} + ${t.itemKeju}`, price: 19000, isBestSeller: true, description: t.descKacangCoklatKeju, image: `${ASSET_BASE_URL}/sweet/kacang-coklat-keju.webp` },
      { name: t.itemKeju, price: 17000, isBestSeller: true, highlight: true, description: t.descKeju, image: `${ASSET_BASE_URL}/sweet/keju.webp` },
      { name: `${t.itemKeju} + ${t.itemKacang}`, price: 18000, highlight: true, description: t.descKejuKacang, image: `${ASSET_BASE_URL}/sweet/keju-kacang.webp` },
      { name: `${t.itemKeju} + ${t.itemCoklat}`, price: 18000, highlight: true, description: t.descKejuCoklat, image: `${ASSET_BASE_URL}/sweet/keju-coklat.webp` },
    ],
  },
  {
    category: t.catSweetPandan,
    items: [
      { name: `${t.itemPandan} ${t.itemKacang}`, price: 13000, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-kacang.webp` },
      { name: `${t.itemPandan} ${t.itemCoklat}`, price: 13000, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-coklat.webp` },
      { name: `${t.itemPandan} ${t.itemKacang} + ${t.itemCoklat}`, price: 15000, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat.webp` },
      { name: `${t.itemPandan} ${t.itemKacang} + ${t.itemCoklat} + ${t.itemKeju}`, price: 21000, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-coklat-keju.webp` },
      { name: `${t.itemPandan} ${t.itemKeju}`, price: 20000, highlight: true, isBestSeller: true, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-keju.webp` },
      { name: `${t.itemPandan} ${t.itemCoklat} ${t.itemKeju}`, price: 20000, highlight: true, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-coklat-keju.webp` },
      { name: `${t.itemPandan} ${t.itemKacang} + ${t.itemKeju}`, price: 20000, highlight: true, description: t.descPandan, image: `${ASSET_BASE_URL}/sweet/pandan-kacang-keju.webp` },
    ],
  },
  {
    category: t.catSweetRedVelvet,
    items: [
      { name: `${t.itemRedVelvet} ${t.itemKacang}`, price: 14000, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang.webp` },
      { name: `${t.itemRedVelvet} ${t.itemCoklat}`, price: 14000, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-coklat.webp` },
      { name: `${t.itemRedVelvet} ${t.itemKacang} ${t.itemCoklat}`, price: 16000, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat.webp` },
      { name: `${t.itemRedVelvet} ${t.itemKacang} ${t.itemCoklat} ${t.itemKeju}`, price: 21000, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-kacang-coklat-keju.webp` },
      { name: `${t.itemRedVelvet} ${t.itemKeju}`, price: 20000, highlight: true, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju.webp` },
      { name: `${t.itemRedVelvet} ${t.itemKeju} + ${t.itemCoklat}`, price: 21000, highlight: true, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-coklat.webp` },
      { name: `${t.itemRedVelvet} ${t.itemKeju} + ${t.itemKacang}`, price: 21000, highlight: true, description: t.descRedVelvet, image: `${ASSET_BASE_URL}/sweet/redvelvet-keju-kacang.webp` },
    ],
  },
  {
    category: t.catSweetBlackforest,
    items: [
      { name: `${t.itemBlackforest} ${t.itemKacang}`, price: 25000, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang.webp` },
      { name: `${t.itemBlackforest} ${t.itemCoklat}`, price: 25000, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-coklat.webp` },
      { name: `${t.itemBlackforest} ${t.itemKacang} ${t.itemCoklat}`, price: 26000, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat.webp` },
      { name: `${t.itemBlackforest} ${t.itemKacang} ${t.itemCoklat} ${t.itemKeju}`, price: 29000, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-kacang-coklat-keju.webp` },
      { name: `${t.itemBlackforest} ${t.itemKeju}`, price: 27000, highlight: true, isBestSeller: true, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-keju.webp` },
      { name: `${t.itemBlackforest} ${t.itemKeju} ${t.itemKacang}`, price: 28000, highlight: true, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-keju-kacang.webp` },
      { name: `${t.itemBlackforest} ${t.itemKeju} ${t.itemCoklat}`, price: 28000, highlight: true, description: t.descBlackforest, image: `${ASSET_BASE_URL}/sweet/blackforest-keju-coklat.webp` },
    ],
  },
];

export const getMenuSavory = (t: any) => [
  {
    title: t.catSavoryBeef,
    variants: [
      {
        type: t.itemTelorAyam,
        description: t.descSavoryStandard,
        prices: [
          { qty: 2, price: 25000, isBestSeller: true, highlight: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 34000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 42000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 45000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
      {
        type: t.itemTelorBebek,
        description: t.descSavoryBebek,
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
    title: t.catSavoryChicken,
    variants: [
      {
        type: t.itemTelorAyam,
        description: t.descSavoryStandard,
        prices: [
          { qty: 2, price: 22000, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 3, price: 30000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 4, price: 35000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
          { qty: 5, price: 40000, image: `${ASSET_BASE_URL}/savory/martabak.webp` },
        ],
      },
      {
        type: t.itemTelorBebek,
        description: t.descSavoryBebek,
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
    title: t.catSavorySpicy,
    variants: [
      {
        type: t.itemSamyangAyam,
        description: t.descSamyang,
        prices: [
          { qty: 2, price: 30000, desc: `2 ${t.itemTelorBebek} + ${t.catSavoryChicken}`, image: `${ASSET_BASE_URL}/savory/samyang-pedas.webp` },
        ],
      },
      {
        type: t.itemSamyangSapi,
        description: t.descSamyang,
        prices: [
          { qty: 2, price: 32000, desc: `2 ${t.itemTelorBebek} + ${t.catSavoryBeef}`, isBestSeller: true, image: `${ASSET_BASE_URL}/savory/samyang-pedas.webp` },
        ],
      },
    ],
  },
];

// ➕ ADD-ONS (Tambahan)
export const getAddonsSweet = (t: any): Addon[] => [
  { name: t.addonCoklat, price: 3000 },
  { name: t.addonKacang, price: 2000 },
  { name: t.addonKeju, price: 7000 },
  { name: t.addonMilo, price: 5000 },
];

export const getAddonsSavory = (t: any): Addon[] => [
  { name: t.addonSosis, price: 2000, minQty: 1, maxQty: 20, defaultQty: 3 },
  { name: t.addonKornet, price: 13000, disabled: true },
  { name: t.addonJamur, price: 10000, disabled: true },
  { name: t.addonAcar, price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: t.addonCabe, price: 400, minQty: 1, maxQty: 20, defaultQty: 5 },
  { name: t.addonSaus, price: 2000, minQty: 1, maxQty: 20, defaultQty: 1 },
  { name: t.addonSambal, price: 5000, minQty: 1, maxQty: 20, defaultQty: 1 },
];

// LEGACY EXPORTS (Optional: provide fallback for direct imports if needed, but better to update call sites)
export const MENU_SWEET = getMenuSweet({ catSweetStandard: "Terang Bulan Standard", itemKacang: "Kacang", itemCoklat: "Coklat", itemKeju: "Keju", itemPandan: "Pandan", itemRedVelvet: "Red Velvet", itemBlackforest: "Blackforest" });
export const MENU_SAVORY = getMenuSavory({ catSavoryBeef: "Daging Sapi", itemTelorAyam: "Telor Ayam", itemTelorBebek: "Telor Bebek", catSavoryChicken: "Daging Ayam", catSavorySpicy: "Menu Pedas", itemSamyangAyam: "Samyang Ayam Pedas", itemSamyangSapi: "Samyang Sapi Pedas" });
export const ADDONS_SWEET = getAddonsSweet({ addonCoklat: "Tambah Coklat", addonKacang: "Tambah Kacang", addonKeju: "Tambah Keju", addonMilo: "Tambah Milo" });
export const ADDONS_SAVORY = getAddonsSavory({ addonSosis: "Tambah Sosis", addonKornet: "Tambah Kornet", addonJamur: "Tambah Jamur", addonAcar: "Tambah Acar", addonCabe: "Tambah Irisan Cabe", addonSaus: "Tambah Saus", addonSambal: "Tambah Sambal Pedas" });
