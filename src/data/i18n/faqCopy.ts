import type { UiLang } from "../../hooks/useUiLanguage";

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQS_BY_LANG: Record<UiLang, FAQItem[]> = {
  id: [
    {
      question: "Apa itu Martabak Gresik?",
      answer: "Martabak Gresik adalah spesialis Terang Bulan (Martabak Manis) dan Martabak Telor yang berlokasi di Jl. Usman Sadar No. 10, Gresik. Kami menyajikan menu dengan bahan premium sejak tahun 2020."
    },
    {
      question: "Bagaimana cara melakukan pemesanan?",
      answer: "Kakak bisa memesan langsung melalui katalog digital ini dengan menekan tombol 'Pesan' pada menu yang diinginkan, lalu kirim pesanan melalui WhatsApp. Kami juga tersedia di GrabFood, GoFood, dan ShopeeFood."
    },
    {
      question: "Apakah ada promo untuk pembelian pertama?",
      answer: "Tentu! Gunakan kode promo 'MARTABAKBARU' untuk mendapatkan diskon 10% khusus pembelian pertama melalui katalog ini."
    },
    {
      question: "Berapa ongkos kirim ke lokasi saya?",
      answer: "Ongkos kirim dihitung berdasarkan jarak (per KM) dari outlet kami di Jl. Usman Sadar No 10. Sistem di keranjang akan mendeteksi lokasi Kakak secara otomatis untuk menghitung estimasi ongkir."
    },
    {
      question: "Jam berapa Martabak Gresik buka?",
      answer: "Kami buka setiap hari mulai pukul 16:00 sampai 23:00 WIB. Pantau status 'BUKA/TUTUP' di bagian atas katalog ini untuk info real-time."
    },
    {
      question: "Apakah menerima pesanan partai besar?",
      answer: "Ya, kami menerima pesanan untuk acara selamatan, ulang tahun, atau rapat kantor. Silakan hubungi admin via WhatsApp untuk mendapatkan harga paket spesial."
    }
  ],
  en: [
    {
      question: "What is Martabak Gresik?",
      answer: "Martabak Gresik specializes in Sweet Martabak and Egg Martabak, located at Jl. Usman Sadar No. 10, Gresik. We have served premium ingredients since 2020."
    },
    {
      question: "How do I place an order?",
      answer: "You can order directly from this digital catalog by pressing the order button on your chosen menu, then sending the order via WhatsApp. We are also available on GrabFood, GoFood, and ShopeeFood."
    },
    {
      question: "Is there a first-order promo?",
      answer: "Yes! Use promo code 'MARTABAKBARU' to get a 10% discount for your first purchase through this catalog."
    },
    {
      question: "How much is delivery to my location?",
      answer: "Delivery cost is calculated by distance (per KM) from our outlet at Jl. Usman Sadar No 10. The cart system can detect your location automatically to estimate shipping."
    },
    {
      question: "What are Martabak Gresik opening hours?",
      answer: "We are open daily from 16:00 to 23:00 WIB. Check the real-time OPEN/CLOSED status at the top of this catalog."
    },
    {
      question: "Do you accept bulk orders?",
      answer: "Yes, we accept orders for events, birthdays, and office meetings. Contact admin via WhatsApp for special package pricing."
    }
  ]
};

export const FAQ_UI_TEXT: Record<UiLang, { title: string; subtitle: string; moreQuestions: string; contactAdmin: string }> = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "What our customers usually ask",
    moreQuestions: "Still have more questions?",
    contactAdmin: "Contact Admin",
  },
  id: {
    title: "Tanya Jawab (FAQ)",
    subtitle: "Hal yang sering ditanyakan pelanggan kami",
    moreQuestions: "Masih punya pertanyaan lain?",
    contactAdmin: "Hubungi Admin",
  },
};
