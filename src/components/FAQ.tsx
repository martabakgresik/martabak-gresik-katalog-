import React from "react";
import { motion } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { UiLang } from "../hooks/useUiLanguage";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS_BY_LANG: Record<UiLang, FAQItem[]> = {
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

export const FAQ = ({ uiLang = "id" }: { uiLang?: UiLang }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const faqs = FAQS_BY_LANG[uiLang];
  const text = uiLang === "en"
    ? {
        title: "Frequently Asked Questions",
        subtitle: "What our customers usually ask",
        moreQuestions: "Still have more questions?",
        contactAdmin: "Contact Admin",
      }
    : {
        title: "Tanya Jawab (FAQ)",
        subtitle: "Hal yang sering ditanyakan pelanggan kami",
        moreQuestions: "Masih punya pertanyaan lain?",
        contactAdmin: "Hubungi Admin",
      };

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-orange/20 rounded-xl text-brand-orange">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight dark:text-brand-yellow">{text.title}</h2>
          <p className="text-xs font-bold text-brand-black/40 dark:text-white/40">{text.subtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border-2 border-brand-black/5 dark:border-white/5 rounded-2xl overflow-hidden bg-white/50 dark:bg-white/5 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-sm md:text-base dark:text-white pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ChevronDown className="w-5 h-5 text-brand-orange" />
              </motion.div>
            </button>
            <motion.div
              initial={false}
              animate={{ 
                height: openIndex === index ? "auto" : 0,
                opacity: openIndex === index ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 text-sm leading-relaxed text-brand-black/70 dark:text-white/70 font-medium border-t border-brand-black/5 dark:border-white/5 mt-2">
                {faq.answer}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-[2rem] text-center space-y-3">
        <p className="text-sm font-bold">{text.moreQuestions}</p>
        <a 
          href="https://wa.me/6281330763633?text=Halo%20Admin,%20saya%20ingin%20bertanya..."
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-2 bg-brand-orange text-white rounded-full font-black text-xs uppercase tracking-wider hover:scale-105 transition-transform"
        >
          {text.contactAdmin}
        </a>
      </div>
    </div>
  );
};
