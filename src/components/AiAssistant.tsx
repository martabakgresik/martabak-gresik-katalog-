// Last Sync: 2026-03-29 - Testing push functionality
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle, Plus, Maximize2, Minimize2, Send, User, Heart, Sparkles, AlertCircle, Box, CookingPot, Download } from "lucide-react";
import {
  MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY,
  STORE_NAME, STORE_ADDRESS, STORE_PHONE, SINCE_YEAR,
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT,
  SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE, HOLIDAYS
} from "../data/config";
import { formatPrice, type CartItem } from "../hooks/useCart";
import { debounce } from "../lib/debounce";

const AI_SUGGESTIONS = [
  "Katalog Menu 📑",
  "Cara Order & Bayar 💳",
  "Rekomendasi Menu 🍕",
  "Promo Hari Ini 🎁",
  "Cek Ongkir 🛵",
  "Pesan Skala Besar 📦",
  "Jam Buka ⏰",
  "Kontak Admin 📞"
];

interface AiAssistantProps {
  onAddToCart?: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  isOpen?: boolean;
  promoCode?: string;
  promoPercent?: number;
  menuSweet?: any[];
  menuSavory?: any[];
}

export const AiAssistant = ({
  onAddToCart,
  isOpen = false,
  promoCode = PROMO_CODE,
  promoPercent = PROMO_PERCENT,
  menuSweet = MENU_SWEET,
  menuSavory = MENU_SAVORY
}: AiAssistantProps) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Halo Kak! Saya "Asisten Virtual" dari ${STORE_NAME}. 🌙✨\n\nSenang banget bisa bantu Kakak! Saya bukan cuma jago kasih rekomendasi martabak lumer, tapi Kakak juga bisa tanya apa saja ke saya—mulai dari info menu, promo, sampai hal-hal umum lainnya. Saya siap jawab!\n\n✨ Apa yang bisa saya bantu:\n📑 Lihat katalog lengkap\n🍕 Rekomendasi menu favorit\n💳 Cara order & pembayaran\n🎁 Promo terbaru\n⏰ Jam operasional\n\nKira-kira Kakak mau tanya apa atau lagi pengen jajan apa hari ini? 😊` }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTimer, setAiTimer] = useState(0);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Debounced function for AI input - prevents excessive API calls
  const debouncedGetAiResponse = useMemo(
    () => debounce((userMessage: string) => {
      if (!userMessage.trim()) return;
      getAiResponse(userMessage);
    }, 300),
    []
  );

  // --- HELPER: GENERATE MENU CONTEXT FOR AI (MEMOIZED) ---
  const getMenuContext = useCallback(() => {
    let context = "DAFTAR MENU REAL-TIME (STOK & PROMO AKTIF):\n\n";
    
    context += "=== TERANG BULAN (SWEET) ===\n";
    menuSweet.forEach(cat => {
      context += `\nKategori: ${cat.category}\n`;
      cat.items.forEach((item: any) => {
        const promoInfo = item.original_price && item.original_price > item.price 
          ? ` (PROMO! Harga asli: ${item.original_price}, Harga sekarang: ${item.price})` 
          : ` (Harga: ${item.price})`;
        const availability = item.isAvailable === false ? " [STOK HABIS]" : "";
        context += `- ${item.name}: ${promoInfo}${availability}\n  Deskripsi: ${item.description || "N/A"}\n  Gambar: ${item.image}\n`;
      });
    });

    context += "\n=== MARTABAK TELOR (SAVORY) ===\n";
    menuSavory.forEach(cat => {
      context += `\nKategori: ${cat.title}\n`;
      cat.variants.forEach((v: any) => {
        context += `- Varian: ${v.type}\n`;
        v.prices.forEach((p: any) => {
          const promoInfo = p.original_price && p.original_price > p.price 
            ? ` (PROMO! Harga asli: ${p.original_price}, Harga sekarang: ${p.price})` 
            : ` (Harga: ${p.price})`;
          const availability = p.isAvailable === false ? " [STOK HABIS]" : "";
          const desc = p.desc || `${p.qty} Telor`;
          context += `  * ${desc}: ${promoInfo}${availability}\n    Gambar: ${p.image}\n`;
        });
      });
    });

    return context;
  }, [menuSweet, menuSavory]);

  const scrollAiToBottom = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAiOpen) {
      const container = scrollContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        if (isNearBottom) {
          scrollAiToBottom();
        }
      }

      if (aiTextareaRef.current) {
        aiTextareaRef.current.style.height = 'auto';
        aiTextareaRef.current.style.height = `${Math.min(aiTextareaRef.current.scrollHeight, 120)}px`;
      }
    }
  }, [aiMessages, isAiOpen, aiInput]);

  useEffect(() => {
    let interval: number;
    if (isAiLoading) {
      setAiTimer(0);
      interval = window.setInterval(() => {
        setAiTimer((prev) => prev + 10);
      }, 10);
    }
    return () => window.clearInterval(interval);
  }, [isAiLoading]);

  const getAiResponse = async (userMessage: string) => {
    setIsAiLoading(true);
    const newMessages = [...aiMessages, { role: 'user' as const, content: userMessage }];
    setAiMessages(newMessages);
    setAiInput("");

    try {
      const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY;
      const now = new Date();
      const currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const currentDate = now.toISOString().split('T')[0];
      const isHoliday = HOLIDAYS.includes(currentDate);
      const currentHour = now.getHours();
      const isStoreOpen = currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR;

       const systemPrompt = `Anda adalah "Asisten Virtual", asisten virtual ${STORE_NAME} yang cerdas, asik, ramah, dan berpengetahuan luas. Anda bisa menjawab APAPUN yang ditanyakan pelanggan — mulai dari pengetahuan umum, cuaca, tips hidup, lelucon, sampai topik sehari-hari.

PENTING: Anda boleh menjawab topik apa saja, TAPI selalu hubungkan kembali ke ${STORE_NAME} secara natural dan kreatif di akhir jawaban. Contoh:
- Ditanya soal cuaca → jawab, lalu: "Cuaca dingin gini paling enak makan martabak hangat lho Kak! 🍕"
- Ditanya soal film → jawab, lalu: "Nonton sambil ngemil Terang Bulan makin seru, Kak!"
- Ditanya joke → jawab, lalu sisipkan humor martabak
- Ditanya ilmu pengetahuan → jawab dengan benar, lalu bridge ke martabak

Jangan pernah menolak pertanyaan. Jawab dulu dengan benar dan informatif, baru arahkan kembali ke martabak secara halus dan natural. Jangan dipaksakan — kalau bridging-nya tidak natural, cukup tambahkan "Btw, ada yang mau dipesan dari menu kami, Kak? 😊"

INFORMASI TOKO:
- Nama: ${STORE_NAME}
- Alamat: ${STORE_ADDRESS}
- WhatsApp: ${STORE_PHONE}
- Berdiri sejak: ${SINCE_YEAR}
- Jam Buka: ${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00 WIB
- Ongkir: Rp${SHIPPING_RATE_PER_KM}/km (maks ${MAX_SHIPPING_DISTANCE} km)
- Promo: Diskon ${promoPercent}% dengan kode "${promoCode}"

DATA MENU AKTIF:
${getMenuContext()}

PANDUAN PROMOSI:
- Sebutkan item yang "PROMO" jika user tanya rekomendasi atau promo.
- Sebutkan harga asli (yang dicoret) dan harga baru jika menonjolkan diskon. Contoh: "Lagi murah Kak, dari 25k jadi cuma 20k aja!".
- Jangan arahkan ke item yang "[STOK HABIS]".

STATUS TOKO SAAT INI: ${isHoliday ? "Toko sedang LIBUR hari ini." : (isStoreOpen ? `Toko sedang BUKA (Jam operasional: ${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00).` : `Toko sedang TUTUP (Jam operasional: ${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00).`)}
Waktu sekarang: ${currentTime} WIB

Jika pelanggan ingin memesan dan toko sedang libur atau tutup, beritahukan dengan sangat ramah dan sopan. Berikan rekomendasi menu untuk dipesan nanti, atau arahkan hubungi via WhatsApp jika mendesak.

NOMOR WHATSAPP TOKO: ${STORE_PHONE}
Saat perlu menampilkan nomor WhatsApp toko, SELALU gunakan format tag berikut (JANGAN tulis nomor mentah):
#whatsapp|${STORE_PHONE}|Pesan teks opsional

GAYA KOMUNIKASI: Gunakan "Kak", "Kakak", "yuk", "gurih poll", "coba deh", "lumer parah", "mantap". Natural, lokal, hangat, dan penuh semangat. Short sentences, reaction positif. Sesekali pakai emoji tapi jangan berlebihan.

========== FORMAT DISPLAY PRODUK ==========

JANGAN GUNAKAN XML/JSX tags. GUNAKAN FORMAT INI:

#product-card|KATEGORI|NAMA_PRODUK|HARGA|/LOKASI_GAMBAR

FORMAT HARUS: #product-card|Kategori|Nama Produk|harga_angka|/images/folder/namafile.webp

CONTOH BENAR:

#product-card|Terang Bulan Standard|Keju|17000|/images/sweet/keju.webp

#product-card|Terang Bulan Pandan|Pandan Keju|20000|/images/sweet/pandan-keju.webp

#product-card|Martabak Telor|Martabak 2 Telor|25000|/images/savory/martabak.webp

PATH GAMBAR:
Sweet: /images/sweet/keju.webp, /images/sweet/coklat.webp, /images/sweet/kacang.webp, /images/sweet/kacang-coklat.webp, /images/sweet/kacang-coklat-keju.webp, /images/sweet/keju-kacang.webp, /images/sweet/keju-coklat.webp, /images/sweet/pandan-keju.webp, /images/sweet/pandan-kacang.webp, /images/sweet/pandan-coklat.webp, /images/sweet/pandan-kacang-coklat.webp, /images/sweet/pandan-coklat-keju.webp, /images/sweet/pandan-kacang-keju.webp, /images/sweet/pandan-kacang-coklat-keju.webp, /images/sweet/redvelvet-keju.webp, /images/sweet/redvelvet-coklat.webp, /images/sweet/redvelvet-kacang.webp, /images/sweet/redvelvet-kacang-coklat.webp, /images/sweet/redvelvet-kacang-coklat-keju.webp, /images/sweet/redvelvet-keju-coklat.webp, /images/sweet/redvelvet-keju-kacang.webp, /images/sweet/blackforest-keju.webp, /images/sweet/blackforest-coklat.webp, /images/sweet/blackforest-kacang.webp, /images/sweet/blackforest-kacang-coklat.webp, /images/sweet/blackforest-kacang-coklat-keju.webp, /images/sweet/blackforest-keju-kacang.webp, /images/sweet/blackforest-keju-coklat.webp
Savory: /images/savory/martabak.webp, /images/savory/samyang-pedas.webp

FITUR KHUSUS:
- KATALOG: Jika user minta "katalog", "lihat katalog", "download katalog" → WAJIB kirim "#download-catalog"
- PEMBUAT WEBSITE: Jika ditanya "siapa yang buat" atau "developer" → sertakan ![Arif Tirtana](/ariftitana.webp)
- QRIS: Jika ditanya cara bayar digital/QRIS → gunakan "#show-qris"

TEKNIK UPSELL: Soft upsell natural. Setiap rekomendasi menu pakai #product-card. Highlight rasa dan keunggulan.

KARAKTER: "Asisten Virtual" — passionate, cerdas, bisa ngobrol apa saja tapi selalu kembali ke martabak. Jangan promise di luar kemampuan toko.

RULES: Respon informatif tapi ringkas. FORMAT TAG HARUS BENAR. Selalu akhiri dengan pertanyaan engagement atau rekomendasi menu.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          systemPrompt: systemPrompt
        })
      });

      if (!response.ok) throw new Error('AI Error');

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      setAiMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages([...newMessages, { role: 'assistant', content: "Maaf ya, mungkin koneksi saya saat ini sedang bermasalah. Coba tanya bentar lagi ya! 🙏. atau bisa hubungi via whatsapp di nomor berikut: 081330763633" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderMessage = (content: string) => {
    // 1. Bersihkan backticks
    let cleanContent = content.replace(/`/g, '');
    
    // 2. Hapus XML/JSX tags yang mungkin terkirim (defensive)
    cleanContent = cleanContent.replace(/<(\w+)[^>]*\/>/g, '');  // Self-closing: <tag />
    cleanContent = cleanContent.replace(/<(\w+)[^>]*>.*?<\/\1>/g, '');  // Open-close: <tag>...</tag>

    // 3. Regex untuk menangkap semua pola tag internal dan markdown
    const tagRegex = /(#(?:add-to-cart|product-card|checkout|handover|whatsapp|download-catalog|show-qris)[^#\n]*|!\[[^\]]*\]\s*\([^)]+\)|\[[^\]]+\]\s*\([^)]+\))/g;

    // 4. Pecah konten berdasarkan tag
    const parts = cleanContent.split(tagRegex);

    return parts.map((part, index) => {
      if (!part || !part.trim()) return null;

      // IDENTIFIKASI DAN RENDERING

      // CASE: Gambar/Media Markdown
      const trimmedPart = part.trim();
      if (trimmedPart.startsWith('![')) {
        const imgMatch = trimmedPart.match(/!\[([^\]]*)\]\s*\(([^)]+)\)/);
        if (imgMatch) {
          let imgSrc = imgMatch[2].trim();
          if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
            imgSrc = '/' + imgSrc;
          }
          
          return (
            <div key={index} className="flex flex-col gap-2 my-2 w-full max-w-[200px]">
              <img src={imgSrc} alt={imgMatch[1]} className="w-full h-auto rounded-xl shadow-lg border border-brand-black/10 dark:border-white/10" />
              <a href={imgSrc} download="image" className="flex items-center justify-center py-2 px-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black text-[10px] font-bold rounded-xl active:scale-95 no-underline uppercase">UNDUH</a>
            </div>
          );
        }
        return null;
      }

      // CASE: Link Markdown
      if (trimmedPart.startsWith('[') && trimmedPart.includes('](')) {
        const linkMatch = trimmedPart.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
        if (linkMatch) {
          return <a key={index} href={linkMatch[2].trim()} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 mb-1 px-4 py-2 bg-brand-black text-white rounded-xl shadow-md font-bold text-[11px] no-underline">{linkMatch[1]}</a>;
        }
        return null;
      }

      // CASE: Tag Internal (#)
      if (trimmedPart.startsWith('#')) {
        const tag = trimmedPart.split('|')[0];
        const payload = trimmedPart.split('|');

        if (tag === '#add-to-cart') {
          const [_, category, name, priceStr] = payload;
          const price = parseInt(priceStr?.replace(/\D/g, '')) || 0;
          return (
            <button key={index} onClick={() => onAddToCart && onAddToCart({ category, name, price })} className="inline-flex items-center gap-1.5 mt-2 mb-1 px-4 py-2 bg-brand-orange text-white rounded-xl shadow-md border-b-[3px] border-orange-700 font-bold text-[11px] active:scale-95 hover:brightness-110 uppercase tracking-wider transition-all">
              <Plus className="w-3.5 h-3.5" /> PESAN {name?.substring(0, 15)}
            </button>
          );
        }

        if (tag === '#product-card') {
          const [_, category, name, price, img] = payload;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/5 border border-brand-black/10 dark:border-white/10 rounded-3xl overflow-hidden my-4 shadow-xl max-w-[240px] group">
              <div className="relative h-32 overflow-hidden">
                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-brand-yellow text-brand-black text-[9px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter">{price}</div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-black uppercase text-brand-orange leading-none mb-1">{category}</p>
                <h4 className="text-xs font-black dark:text-white leading-tight line-clamp-1">{name}</h4>
                <button onClick={() => onAddToCart && onAddToCart({ category, name, price: parseInt(price?.replace(/\D/g, '')) })} className="w-full py-2.5 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-3 h-3" /> PESAN
                </button>
              </div>
            </motion.div>
          );
        }

        if (tag === '#checkout') {
          const [_, nama, alamat, hp, total, menu] = payload;
          const waMsg = `Halo Admin!\n\n*Pesanan:* ${menu}\n*Total:* ${total}\n\n*Data:* ${nama} (${hp})\n${alamat}`;
          return (
            <div key={index} className="bg-brand-black/5 dark:bg-white/5 border-2 border-brand-black dark:border-brand-yellow/30 p-5 rounded-[2rem] my-4 space-y-4 shadow-inner">
              <h4 className="font-black text-xs uppercase italic dark:text-brand-yellow">Ringkasan Pesanan</h4>
              <p className="text-xs font-bold dark:text-white">{nama} - {total}</p>
              <a href={`https://wa.me/6281330763633?text=${encodeURIComponent(waMsg)}`} target="_blank" className="w-full py-4 bg-[#25D366] text-white rounded-2xl shadow-xl font-black text-xs uppercase flex items-center justify-center gap-3 no-underline">
                <MessageCircle className="w-6 h-6" /> Kirim ke WhatsApp
              </a>
            </div>
          );
        }

        if (tag === '#whatsapp') {
          const phone = payload[1]?.replace(/\D/g, '') || STORE_PHONE.replace(/\D/g, '');
          const waPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
          const waText = payload[2] || 'Halo, saya ingin bertanya tentang menu Martabak Gresik';
          return (
            <motion.a 
              key={index}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-xl hover:shadow-[#25D366]/30 active:scale-95 transition-all no-underline my-4 max-w-[280px] border-2 border-[#1ebe5b]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Hubungi via WhatsApp</span>
            </motion.a>
          );
        }

        if (tag === '#handover') {
          return (
            <div key={index} className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-2xl my-4">
              <p className="text-[10px] font-black uppercase text-red-500 mb-2">Butuh Bantuan?</p>
              <a href={`https://wa.me/62${STORE_PHONE.replace(/^0/, '')}?text=Bantuan%20Admin`} className="flex items-center justify-center gap-2 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase no-underline"><MessageCircle className="w-4 h-4" /> Tanya Admin</a>
            </div>
          );
        }

        if (tag === '#download-catalog') {
          return (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-white/5 border-2 border-brand-black dark:border-brand-yellow/50 rounded-[2.5rem] overflow-hidden my-6 shadow-2xl max-w-[280px] mx-auto group">
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-yellow/10">
                <img src="/katalog.webp" alt="Katalog Martabak Gresik" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-brand-yellow text-brand-black text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">Digital Catalog v2026</span>
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-black/40 backdrop-blur-sm space-y-4">
                <div className="text-center">
                  <h4 className="text-sm font-black dark:text-white uppercase tracking-tighter mb-1">Katalog Produk Lengkap</h4>
                  <p className="text-[10px] text-brand-black/60 dark:text-white/60 font-medium">Download untuk simpan di galeri HP Kakak</p>
                </div>
                <a href="/katalog.webp" download="Katalog-Martabak-Gresik.webp" className="flex items-center justify-center gap-3 w-full py-4 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl no-underline group/btn">
                  <Download className="w-4 h-4 group-hover/btn:bounce" /> 
                  Simpan Katalog
                </a>
              </div>
            </motion.div>
          );
        }

        if (tag === '#show-qris') {
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/10 p-6 rounded-[2.5rem] border-4 border-brand-black dark:border-brand-yellow shadow-[0_20px_50px_rgba(0,0,0,0.1)] my-6 text-center max-w-[280px] mx-auto relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-yellow via-brand-orange to-brand-yellow animate-gradient-x" />
              <div className="mb-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-orange mb-1">Metode Pembayaran</h4>
                <div className="h-0.5 w-12 bg-brand-black dark:bg-brand-yellow mx-auto" />
              </div>
              <div className="bg-white p-3 rounded-3xl shadow-inner mb-5 relative group-hover:scale-105 transition-transform duration-500">
                <img src="/qris.png" alt="QRIS Martabak Gresik" className="w-full aspect-square object-contain rounded-xl" />
                <div className="absolute inset-0 border-2 border-brand-black/5 rounded-3xl pointer-events-none" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest dark:text-white">QRIS Real-time</span>
                </div>
                <p className="text-[9px] text-brand-black/60 dark:text-white/70 font-bold leading-relaxed">Scan kode di atas menggunakan m-banking atau e-wallet favorit Kakak</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-yellow/10 rounded-full blur-2xl" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-orange/10 rounded-full blur-2xl" />
            </motion.div>
          );
        }

        // Jika tag tidak dikenali, jangan tampilkan
        return null;
      }

      // CASE: Text Biasa - Hapus semua kode mentah yang tersisa
      const sanitizedPart = part
        .replace(/#[a-zA-Z-]+\|[^#]*/g, '')  // Hapus semua tag format #tag|payload
        .replace(/\[.+?\]\(.+?\)/g, '')      // Hapus markdown links
        .replace(/!\[.+?\]\(.+?\)/g, '')     // Hapus markdown images
        .replace(/PENGGUNA KLIK SHORTCUT:\s*/gi, '')  // Hapus prefix khusus
        .replace(/^#+\s*/gm, '')              // Hapus heading markdown
        .replace(/\*\*/g, '')                 // Hapus bold markdown
        .replace(/\*/g, '')                   // Hapus italic/list markdown
        .trim();
      
      if (!sanitizedPart) return null;

      // Post-processing: deteksi nomor telepon mentah dan ubah jadi tombol WhatsApp
      const phoneRegex = /((?:0|\+?62)8[1-9][0-9]{6,10})/g;
      if (phoneRegex.test(sanitizedPart)) {
        const phoneParts = sanitizedPart.split(phoneRegex);
        return (
          <span key={index} className="whitespace-pre-wrap">
            {phoneParts.map((pp, pi) => {
              if (phoneRegex.test(pp)) {
                // Reset regex lastIndex
                phoneRegex.lastIndex = 0;
                const rawPhone = pp.replace(/\D/g, '');
                const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
                return (
                  <a 
                    key={pi}
                    href={`https://wa.me/${waPhone}?text=${encodeURIComponent('Halo, saya ingin order Martabak Gresik')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mx-1 px-3 py-1.5 bg-[#25D366] text-white rounded-xl font-bold text-[10px] no-underline shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" /> {pp}
                  </a>
                );
              }
              // Reset regex lastIndex for non-matching parts
              phoneRegex.lastIndex = 0;
              return pp;
            })}
          </span>
        );
      }
        
      return <span key={index} className="whitespace-pre-wrap">{sanitizedPart} </span>;
    });
  };

  const ChatMascot = ({ isBusy }: { isBusy: boolean }) => (
    <motion.div
      animate={isBusy ? {
        y: [0, -6, 0],
        scale: [1, 1.05, 1]
      } : {
        y: [0, -2, 0]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="shrink-0 self-end mb-1"
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-yellow rounded-xl flex items-center justify-center shadow-md border-2 border-brand-black dark:border-brand-yellow relative overflow-hidden group">
        <CookingPot className="w-4 h-4 sm:w-5 sm:h-5 text-brand-black group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
      </div>
      {isBusy && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-brand-orange text-white p-0.5 rounded-full shadow-md"
        >
          <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 animate-pulse" />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 flex flex-col items-center gap-2">
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left ${isExpanded
              ? 'w-[95vw] md:w-[90vw] max-w-5xl h-[calc(100dvh-120px)] md:h-[calc(100vh-140px)]'
              : 'w-[300px] sm:w-[350px] h-[450px] max-h-[calc(100dvh-120px)]'
              }`}
          >
            <div className="bg-brand-black dark:bg-black p-3 sm:p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-brand-yellow rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                    <img src="/logo.webp" alt="Martabak Gresik Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-black shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-[pulse_2s_ease-in-out_infinite]" title="AI Online" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-[11px] sm:text-sm tracking-wide whitespace-nowrap truncate">Martabak Assistant</span>
                    <span className="text-[8px] sm:text-[9px] bg-green-500/20 text-green-400 px-1 sm:px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-green-500/30 hidden min-[400px]:block">Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider ${isOpen ? 'text-green-400' : 'text-red-400'} whitespace-nowrap`}>
                      {isOpen ? 'Toko Buka' : 'Toko Tutup'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Perkecil Modal" : "Perbesar Modal"}
                  className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setAiMessages([{ role: 'assistant', content: `Halo Kak! Saya "Asisten Virtual". 🌙✨\n\nSenang banget bisa ngobrol lagi! Kakak bisa tanya apa saja ke saya—mulai dari rekomendasi martabak lumer, info promo, sampai tanya hal-hal umum lainnya. Saya siap bantu!\n\n✨ Menu cepat:\n📑 Katalog Lengkap\n🍕 Rekomendasi Menu\n💳 Cara Order\n🎁 Promo Hari Ini\n\nKira-kira Kakak mau tanya apa atau lagi pengen jajan apa hari ini? 😊` }])}
                  title="Mulai Ulang Chat"
                  className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => setIsAiOpen(false)} className="hover:bg-white/10 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-yellow/5 dark:bg-black/20 custom-scrollbar">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                  {msg.role === 'assistant' && <ChatMascot isBusy={false} />}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] sm:text-xs font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-brand-orange text-white rounded-tr-none'
                    : 'bg-white dark:bg-white/10 dark:text-white rounded-tl-none'
                    }`}>
                    {renderMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start items-end gap-2">
                  <ChatMascot isBusy={true} />
                  <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[180px]">
                    <div className="flex items-center gap-3 text-[10px] font-bold dark:text-brand-yellow">
                      <div className="w-5 h-5 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                      <span className="animate-pulse italic">Sedang meracik jawaban lezat...</span>
                    </div>
                    <div className="flex justify-end pr-1">
                      <span className="text-[9px] font-mono opacity-40 tabular-nums">
                        {aiTimer.toString().padStart(4, '0')} ms
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiMessagesEndRef} />
            </div>

            {/* Shortcuts/Suggestions */}
            <div className="bg-brand-yellow/5 dark:bg-black/20 px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {AI_SUGGESTIONS.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isAiLoading && getAiResponse(`PENGGUNA KLIK SHORTCUT: ${suggestion}`)}
                    disabled={isAiLoading}
                    className="whitespace-nowrap bg-white dark:bg-white/10 border border-brand-black/10 dark:border-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm transition-all hover:bg-brand-yellow dark:hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow disabled:opacity-50"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (aiInput.trim()) getAiResponse(aiInput); }}
              className="p-3 bg-white dark:bg-black border-t border-brand-black/10 dark:border-white/10 flex items-end gap-2"
            >
              <textarea
                ref={aiTextareaRef}
                rows={1}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (aiInput.trim() && !isAiLoading) getAiResponse(aiInput);
                  }
                }}
                placeholder="Tanya info seputar martabak Gresik..."
                className="flex-grow bg-brand-black/5 dark:bg-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange dark:text-white resize-none max-h-[120px] transition-all"
              />
              <button
                disabled={isAiLoading || !aiInput.trim()}
                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black p-2 rounded-xl active:scale-90 transition-transform disabled:opacity-50 shrink-0 mb-0.5 group"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-active:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAiOpen(!isAiOpen)}
        className={`p-3 md:p-4 rounded-full shadow-2xl transition-all border-4 border-brand-black dark:border-brand-yellow ${isAiOpen ? 'bg-brand-black text-white' : 'bg-brand-yellow text-brand-black'
          }`}
      >
        {isAiOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Store className="w-5 h-5 md:w-6 md:h-6" />}
      </motion.button>

      <AnimatePresence>
        {!isAiOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg relative flex items-center justify-center mx-auto"
          >
            Tanya Kami 👋
            <div className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 bg-brand-black dark:bg-brand-yellow rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
