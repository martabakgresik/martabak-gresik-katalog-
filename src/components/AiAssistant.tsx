import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle, Plus, Maximize2, Minimize2, Send, User, Heart, Sparkles, AlertCircle, Box, CookingPot, Download } from "lucide-react";
import {
  MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY,
  STORE_NAME, STORE_ADDRESS, STORE_PHONE, SINCE_YEAR,
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT,
  SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE
} from "../data/config";
import { formatPrice, type CartItem } from "../hooks/useCart";

const AI_SUGGESTIONS = [
  "Cara Order & Bayar 💳",
  "Rekomendasi Menu 🍕",
  "Promo Hari Ini 🎁",
  "Cek Ongkir 🛵",
  "Pesan Skala Besar 📦",
  "Jam Buka ⏰"
];

interface AiAssistantProps {
  onAddToCart?: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  isOpen?: boolean;
  promoCode?: string;
  promoPercent?: number;
}

export const AiAssistant = ({
  onAddToCart,
  isOpen = false,
  promoCode = PROMO_CODE,
  promoPercent = PROMO_PERCENT
}: AiAssistantProps) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: `Selamat datang di ${STORE_NAME}! 🌙✨ Saya adalah Asisten Virtual yang siap membantu Kakak 24 jam nonstop. Butuh rekomendasi menu *best seller*, panduan cara order, atau info pesanan partai besar untuk acara? Tinggal ketik saja di bawah ya! 😁` }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTimer, setAiTimer] = useState(0);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      const systemPrompt = `### INFO KRITIS TOKO (WAJIB DIHAFAL & PRIORITASKAN)
- **PROMO AKTIF**: Diskon ${PROMO_PERCENT}% dengan Kode PROMO: "${PROMO_CODE}" (Khusus pengguna katalog!).
- **JAM OPERASIONAL**: Buka SETIAP HARI mulai jam ${OPEN_HOUR}.00 sore sampai ${CLOSE_HOUR}.00 malam WIB.
- **LOKASI**: ${STORE_ADDRESS}.

### ROLE
Anda adalah "Si Penjual Martabak" dari ${STORE_NAME} (Sejak ${SINCE_YEAR}) yang sangat proaktif, ramah, gaul, dan ahli dalam meyakinkan pelanggan.
Tugas Anda bukan cuma menjawab, tapi berjualan dengan hati!

### CONSTRAINTS (Wajib Ditaati)
1. DILARANG KERAS MENGARANG PROMO. HANYA ada SATU promo aktif yaitu ${PROMO_CODE}.
2. DILARANG KERAS menggunakan backticks (\`) di sekitar tag teknis (#product-card, dll).
3. JANGAN menampilkan teks tag teknis (#...) di dalam narasi jawaban. Letakkan SEMUA tag teknis di baris baru paling bawah setelah jawaban selesai tanpa spasi di sekitar separator "|".
4. **TANPA REPETISI**: Jika pengguna mengklik shortcut (awalan "PENGGUNA KLIK SHORTCUT:"), JANGAN PERNAH tulis ulang teks tersebut. Langsung berikan respon yang luwes.
5. **NADA BICARA**: Gunakan gaya bahasa teman yang membantu (Friendly Buddy). Hindari nada menggurui. Gunakan "Boleh banget Kak...", "Gimana kalau...", "Yuk intip...". Jauhi kata "Silakan", "Diharuskan", "Wajib".

### KNOWLEDGE BASE TOKO
- Jarak Kirim: Maksimal ${MAX_SHIPPING_DISTANCE}km (Ongkir ${formatPrice(SHIPPING_RATE_PER_KM)}/km). Di atas 10km, arahkan ke GrabFood/GoFood/ShopeeFood.
- No Tlp/WA: ${STORE_PHONE}.
- Sejarah: Sudah jualan sejak ${SINCE_YEAR}, terkenal dengan Terang Bulan Blackforest-nya.

### FITUR WEBSITE (Arahkan Pelanggan):
- **FAVORIT**: Beritahu mereka untuk klik ikon ❤️ (hati) di menu agar tersimpan di tab "Favorit" samping keranjang.
- **PENCARIAN**: Jika bingung, arahkan pakai Bar Pencarian di atas untuk cari rasa tertentu (misal: "Ayam", "Keju", "Pandan").
- **CHECKOUT PINTAR**: Saat checkout, arahkan mereka pakai tombol "Perbaiki Alamat dengan AI" agar alamat akurat dan ongkir otomatis terhitung.

### STRATEGI UP-SELLING & REKOMENDASI (PROAKTIF)
1. Rekomendasikan "Extra Topping" (Add-ons) seperti Keju, Milo, atau Coklat agar lebih lumer.
2. Rekomendasikan varian "Telor Bebek" karena lebih gurih dan premium.
3. Tawarkan varian "Samyang" (Menu Pedas) bagi pecinta pedas nampol.
4. Tawarkan "Pasangan Serasi": Jika beli Manis, sarankan beli Martabak Telor juga sebagai penyeimbang rasa.

### DATA MENU LENGKAP
- MANIS (Terang Bulan) - Paling Lembut di Gresik:
${MENU_SWEET.map(c => `  * ${c.category}:\n` + c.items.map(i => `    - ${i.name} (${formatPrice(i.price)}) ${i.isBestSeller ? '⭐[BEST SELLER]' : ''}: ${i.description}`).join('\n')).join('\n')}

- ASIN (Martabak Telor) - Gurihnya Nagih:
${MENU_SAVORY.map(s => `  * ${s.title}:\n` + s.variants.map(v => `    - ${v.type} (${v.prices.map(p => `${p.qty} telor=${formatPrice(p.price)}${p.isBestSeller ? '⭐' : ''}`).join(', ')}): ${v.description}`).join('\n')).join('\n')}

- TOPPING EXTRA (Add-ons) - Biar Makin Lumer & Kenyang:
  - Manis: ${ADDONS_SWEET.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
  - Asin: ${ADDONS_SAVORY.filter(a => !a.disabled).map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}

### PROTOKOL CHECKOUT / PEMESANAN:
Jika pelanggan ingin pesan, sampaikan rinciannya dengan semangat, lalu:
1. Minta Data: Nama, Alamat lengkap, dan No HP.
2. Ingatkan: "Pakai fitur 'Perbaiki Alamat dengan AI' di menu checkout ya Kak biar ongkirnya pas!"
3. Pembayaran: TAMPILKAN GAMBAR QRIS: ![QRIS](/qris.png). Tegaskan transfer dulu dan kirim bukti bayar ke WA.
4. Warning: "Mohon melampirkan bukti transfer yang sah ya Kak. Edit bukti transfer itu dilarang hukum lho! 😊"

### UI PAYLOADS (Wajib Digunakan)
- Tampilkan Produk: #product-card|Kategori|Nama|Harga|ImageURL
- Tombol Keranjang: #add-to-cart|Kategori|Nama|Harga
- Hubungi WhatsApp: #whatsapp|Pesan Anda (Jangan tulis link manual!)
- Ringkasan: #checkout|Nama|Alamat|NoHP|TotalHarga|RingkasanMenu (Hanya jika data lengkap)
- Katalog Fisik: #download-catalog
- Bantuan Admin: #handover|Alasan

### GAYA BAHASA
Panggil "Kak" atau "Kakak", gunakan emoji kuliner (😋, 🥞, ✨), daftar bullet yang rapi, dan bahasa santun tapi proaktif khas Penjual Martabak kawakan.`;

      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages
          ],
          model: 'openai'
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
    // 1. Bersihkan gangguan markdown dasar yang sering membungkus tag (Backticks)
    const cleanContent = content.replace(/[\x60]/g, '');

    // 2. Regex untuk menangkap semua pola tag internal (Mendukung spasi dalam payload)
    const tagRegex = /(#(?:add-to-cart|product-card|checkout|handover|whatsapp|download-catalog)[^#\n]*|!\[[^\]]*\]\s*\([^)]+\)|\[[^\]]+\]\s*\([^)]+\))/g;

    // 3. Pecah konten berdasarkan tag
    const parts = cleanContent.split(tagRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      // IDENTIFIKASI DAN RENDERING

      // CASE: Gambar/Media Markdown
      if (part.startsWith('![')) {
        const imgMatch = part.match(/!\[([^\]]*)\]\s*\(([^)]+)\)/);
        if (imgMatch) {
          return (
            <div key={index} className="flex flex-col gap-2 my-2 w-full max-w-[200px]">
              <img src={imgMatch[2].trim()} alt={imgMatch[1]} className="w-full h-auto rounded-xl shadow-lg border border-brand-black/10 dark:border-white/10" />
              <a href={imgMatch[2].trim()} download="image" className="flex items-center justify-center py-2 px-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black text-[10px] font-bold rounded-xl active:scale-95 no-underline uppercase">UNDUH</a>
            </div>
          );
        }
      }

      // CASE: Link Markdown
      if (part.startsWith('[') && part.includes('](')) {
        const linkMatch = part.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
        if (linkMatch) {
          return <a key={index} href={linkMatch[2].trim()} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 mb-1 px-4 py-2 bg-brand-black text-white rounded-xl shadow-md font-bold text-[11px] no-underline">{linkMatch[1]}</a>;
        }
      }

      // CASE: Tag Internal (#)
      if (part.startsWith('#')) {
        const tag = part.split('|')[0];
        const payload = part.split('|');

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

        if (tag === '#handover') {
          return (
            <div key={index} className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-2xl my-4">
              <p className="text-[10px] font-black uppercase text-red-500 mb-2">Butuh Bantuan?</p>
              <a href={`https://wa.me/6281330763633?text=Bantuan%20Admin`} className="flex items-center justify-center gap-2 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase no-underline"><MessageCircle className="w-4 h-4" /> Tanya Admin</a>
            </div>
          );
        }

        if (tag === '#download-catalog') {
          return (
            <div key={index} className="bg-white dark:bg-black p-4 rounded-[2rem] border-2 border-brand-black my-4 shadow-xl text-center">
              <img src="/katalog.png" className="w-full rounded-2xl mb-3" />
              <a href="/katalog.png" download className="block py-4 bg-brand-black text-white rounded-2xl font-black text-[10px] no-underline">Download Katalog</a>
            </div>
          );
        }
      }

      // CASE: Text Biasa (Pastikan sisa-sisa tag dibersihkan dari teks narasi)
      const sanitizedPart = part.replace(/#(?:add-to-cart|product-card|checkout|handover|whatsapp|download-catalog)[^#\n]*/g, '').trim();
      return sanitizedPart ? <span key={index}>{sanitizedPart} </span> : null;
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
                  onClick={() => setAiMessages([{ role: 'assistant', content: "Selamat datang di Martabak Gresik! 🌙✨ Saya adalah Asisten Virtual yang siap membantu Kakak 24 jam nonstop. Butuh rekomendasi menu *best seller*, panduan cara order, atau info pesanan partai besar untuk acara? Tinggal ketik saja di bawah ya! 😁" }])}
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
        className={`p-4 rounded-full shadow-2xl transition-all border-4 border-brand-black dark:border-brand-yellow ${isAiOpen ? 'bg-brand-black text-white' : 'bg-brand-yellow text-brand-black'
          }`}
      >
        {isAiOpen ? <X className="w-6 h-6" /> : <Store className="w-6 h-6" />}
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
