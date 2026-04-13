/**
 * ATURAN TOKO TANPA DATABASE
 *
 * Semua konfigurasi operasional yang biasanya disimpan di database
 * dipusatkan di file ini agar mudah diubah.
 */
export const STORE_RULES = {
  // ⏰ Jam Operasional
  operationalHours: {
    open: 16,
    close: 23,
  },

  // 🎟️ Promo & Diskon
  promo: {
    code: "MARTABAKBARU",
    percent: 10,
  },

  // 🗓️ Hari Libur / Tutup
  holidays: [
    "2026-03-19",
    "2026-03-20",
    "2026-03-21",
    "2026-03-23",
    "2026-04-13"
  ],

  // 📱 Informasi Toko
  profile: {
    name: "Martabak Gresik",
    address: "Jl. Usman Sadar No 10, Gresik, Jawa Timur, Indonesia",
    phone: "081330763633",
    sinceYear: "2020",
  },

  // 🛵 Pengiriman
  shipping: {
    ratePerKm: 2500,
    maxDistanceKm: 10,
  },

  // ⬇️ UI
  ui: {
    scrollSpacing: "mt-2",
  },
} as const;

export const OPEN_HOUR = STORE_RULES.operationalHours.open;
export const CLOSE_HOUR = STORE_RULES.operationalHours.close;

export const PROMO_CODE = STORE_RULES.promo.code;
export const PROMO_PERCENT = STORE_RULES.promo.percent;

export const HOLIDAYS: string[] = [...STORE_RULES.holidays];

export const STORE_NAME = STORE_RULES.profile.name;
export const STORE_ADDRESS = STORE_RULES.profile.address;
export const STORE_PHONE = STORE_RULES.profile.phone;
export const SINCE_YEAR = STORE_RULES.profile.sinceYear;

export const SHIPPING_RATE_PER_KM = STORE_RULES.shipping.ratePerKm;
export const MAX_SHIPPING_DISTANCE = STORE_RULES.shipping.maxDistanceKm;

export const SCROLL_SPACING = STORE_RULES.ui.scrollSpacing;
