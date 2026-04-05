import type { UiLang } from "../../hooks/useUiLanguage";

export const AI_TEXTS: Record<UiLang, { suggestions: string[]; greeting: (storeName: string) => string; error: string; askUs: string; sendMessage: string }> = {
  id: {
    suggestions: [
      "Katalog Menu 📑",
      "Cara Order & Bayar 💳",
      "Rekomendasi Menu 🍕",
      "Promo Hari Ini 🎁",
      "Cek Ongkir 🛵",
      "Pesan Skala Besar 📦",
      "Jam Buka ⏰",
      "Kontak Admin 📞"
    ],
    greeting: (storeName: string) => `Halo Kak! Saya "Asisten Virtual" dari ${storeName}. 🌙✨\n\nSenang banget bisa bantu Kakak! Saya bukan cuma jago kasih rekomendasi martabak lumer, tapi Kakak juga bisa tanya apa saja ke saya—mulai dari info menu, promo, sampai hal-hal umum lainnya. Saya siap jawab!\n\n✨ Apa yang bisa saya bantu:\n📑 Lihat katalog lengkap\n🍕 Rekomendasi menu favorit\n💳 Cara order & pembayaran\n🎁 Promo terbaru\n⏰ Jam operasional\n\nKira-kira Kakak mau tanya apa atau lagi pengen jajan apa hari ini? 😊`,
    error: "Maaf ya, mungkin koneksi saya saat ini sedang bermasalah. Coba tanya bentar lagi ya! 🙏 Atau bisa hubungi via WhatsApp di nomor berikut: 081330763633",
    askUs: "Tanya Kami 👋",
    sendMessage: "Kirim Pesan",
  },
  en: {
    suggestions: [
      "Menu Catalog 📑",
      "How to Order & Pay 💳",
      "Menu Recommendation 🍕",
      "Today's Promo 🎁",
      "Check Delivery Fee 🛵",
      "Bulk Order 📦",
      "Opening Hours ⏰",
      "Contact Admin 📞"
    ],
    greeting: (storeName: string) => `Hi there! I'm the "Virtual Assistant" from ${storeName}. 🌙✨\n\nI'm here to help! You can ask me anything—from menu details and promos to general everyday questions.\n\n✨ I can help with:\n📑 Full menu catalog\n🍕 Best menu recommendations\n💳 Ordering & payment\n🎁 Latest promos\n⏰ Opening hours\n\nWhat would you like to ask first? 😊`,
    error: "Sorry, I'm having a connection issue right now. Please try again in a moment 🙏 Or contact us via WhatsApp: 081330763633",
    askUs: "Ask Us 👋",
    sendMessage: "Send Message",
  },
};
