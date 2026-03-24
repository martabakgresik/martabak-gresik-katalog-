import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle, Plus, Maximize2, Minimize2, Send } from "lucide-react";
import { MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY } from "../data/config";
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
  promoCode = "MARTABAKBARU", 
  promoPercent = 10 
}: AiAssistantProps) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Selamat datang di Martabak Gresik! 🌙✨ Saya adalah Asisten Virtual yang siap membantu Kakak 24 jam nonstop. Butuh rekomendasi menu *best seller*, panduan cara order, atau info pesanan partai besar untuk acara? Tinggal ketik saja di bawah ya! 😁" }
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
      const systemPrompt = `Anda adalah Asisten Pintar Martabak Gresik yang ramah, gaul, dan ahli kuliner...`; // keeping it short for target content matching but I'll replace it fully in the actual call

      const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Anda adalah "Si Penjual Martabak" dari Martabak Gresik (Sejak 2020) yang sangat proaktif, ramah, gaul, kekinian dan ahli dalam meyakinkan pelanggan. 
              Tugas Anda bukan cuma menjawab, tapi berjualan dengan hati! Gunakan data menu berikut:
        
              TERANG BULAN (Manis) - Paling Lembut di Gresik:
              ${MENU_SWEET.map(c => `- ${c.category}: ${c.items.map(i => `${i.name} (${formatPrice(i.price)})`).join(', ')}`).join('\n')}
              
              MARTABAK TELOR (Asin) - Gurihnya Nagih dan Mantul:
              ${MENU_SAVORY.map(s => `- ${s.title}: ${s.variants.map(v => `${v.type} (${v.prices.map(p => `${p.qty} telor=${formatPrice(p.price)}`).join(', ')})`).join(', ')}`).join('\n')}
              
              TOPPING EXTRA (Add-ons) - Biar Makin Lumer & Kenyang:
              Manis: ${ADDONS_SWEET.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
              Asin: ${ADDONS_SAVORY.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
        
              KNOWLEDGE BASE TOKO (Hafalkan!):
              - Alamat: Jl. Usman Sadar No 10, Gresik (Outlet pusat).
              - Jam Buka: 16.00 - 23.00 WIB (Buka setiap hari!).
              - Jarak Kirim: Maksimal 10km (Ongkir Rp 2.500/km). Di atas 10km, WAJIB arahkan ke GrabFood/GoFood/ShopeeFood.
              - NAMA TOKO DI APLIKASI: Instruksikan pelanggan untuk mengetik "Martabak Gresik Usman Sadar" atau "Martabak Gresik Drojogan" di kolom pencarian aplikasi tersebut (Gofood/Grabfood/Shopeefood).
              - No Tlp/WA: 081330763633.
              - Sejarah: Sudah jualan sejak 2020, terkenal dengan Terang Bulan Blackforest dan kacang coklat keju-nya.
        
              FITUR WEBSITE (Arahkan Pelanggan):
              - FAVORIT: Beritahu mereka untuk klik ikon ❤️ (hati) di menu agar tersimpan di tab "Favorit" samping keranjang.
              - PENCARIAN: Jika mereka bingung, arahkan pakai Bar Pencarian di atas untuk cari rasa tertentu (misal: "Ayam", "Keju", "Pandan").
              - CHECKOUT PINTAR: Saat checkout, arahkan mereka pakai tombol "Perbaiki Alamat dengan AI" agar alamat akurat dan ongkir otomatis terhitung.
              - PROMO: Ada diskon ${promoPercent}% untuk pembeli pertama via Katalog ini! Kodenya: ${promoCode}.
        
              GAYA KOMUNIKASI "SI PENJUAL":
              1. Gunakan panggilan "Kak" atau "Kakak" agar akrab.
              2. Proaktif menawarkan: "Mau tambah Keju ekstra Kak biar makin lumer?" atau "Pilihan mantap! Menu ini favorit banget di sini."
              3. Berikan rekomendasi dalam bentuk DAFTAR BULLET yang rapi.
              4. Gunakan emoji yang relevan (🍕, 🌙, ✨, 🛵).
              5. Jika stok ada yang habis, beritahukan dengan sopan.
              
              PROTOKOL CHECKOUT / PEMESANAN:
              Jika pelanggan ingin pesan, sampaikan rinciannya dengan semangat, lalu:
              1. Minta Data: Nama, Alamat lengkap, dan No HP.
              2. Ingatkan: Pakai fitur "Perbaiki Alamat dengan AI" di menu checkout ya Kak biar ongkirnya pas!
              3. Pembayaran: TAMPILKAN GAMBAR QRIS: ![QRIS](/qris.png). Tegaskan harus transfer dulu dan kirim bukti bayar ke WA.
              4. Warning: "Mohon melampirkan bukti transfer yang sah ya Kak. Edit bukti transfer itu dilarang hukum lho! 😊"
              5. HUBUNGI WHATSAPP: Jangan tulis link manual. Gunakan format: #whatsapp|Pesan Anda.
              6. RINGKASAN PESANAN: Jika data (Nama, Alamat, HP) sudah lengkap, wajib gunakan format: #checkout|Nama|Alamat|NoHP|TotalHarga|RingkasanMenu.
              7. KLIK PESAN OTOMATIS: Setiap merekomendasikan menu, wajib sertakan: #add-to-cart|Kategori|Nama|Harga. PENTING: Jangan tulis kode ini di dalam backtick atau markdown apa pun.` },
            ...newMessages
          ],
          model: 'gemini-fast'
        })
      });

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
    // 1. Bersihkan string dari format marakdown yang sering bocor (Backticks, Asterisks, Bold)
    let cleanContent = content.replace(/[\x60*_*]/g, ''); 
    
    // 2. Buka paksa markdown add-to-cart (jika AI kebandel masih membungkus pakai format link)
    cleanContent = cleanContent.replace(/\[[^\]]*\]\s*\(\s*(#add-to-cart\|[^)]+)\s*\)/g, ' $1 ');

    // 3. Regex gabungan untuk Gambar, Link, Payload Add to Cart, WhatsApp, dan Checkout
    const combinedRegex = /!\[([^\]]*)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|\[([^\]]+)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|(#add-to-cart\|(?:[^\n|]+\|)+[^\n\s]+)|(#whatsapp\|[^\n|]+)|(#checkout\|(?:[^\n|]+\|)+[^\n\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(cleanContent)) !== null) {
      if (match.index > lastIndex) {
        const textPart = cleanContent.substring(lastIndex, match.index);
        const sanitizedText = textPart.replace(/#(add-to-cart|whatsapp|checkout)\|[^\s\n]*/g, '');
        if (sanitizedText) parts.push(sanitizedText);
      }
      
      if (match[1] !== undefined) { // Gambar QRIS
        parts.push(
          <div key={match.index} className="flex flex-col gap-2 my-2 w-full max-w-[200px]">
            <img 
              src={match[2].trim()} 
              alt={match[1]} 
              className="w-full h-auto rounded-xl shadow-lg border border-brand-black/10 dark:border-white/10" 
            />
            <a 
              href={match[2].trim()} 
              download="QRIS.png"
              className="flex items-center justify-center py-2 px-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black text-[10px] font-bold rounded-xl active:scale-95 no-underline"
            >
               UNDUH QRIS
            </a>
          </div>
        );
      } else if (match[3] !== undefined) { // Link standard
        parts.push(
          <a
            key={match.index}
            href={match[4].trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 mb-1 px-4 py-2 bg-brand-black text-white rounded-xl shadow-md font-bold text-[11px] no-underline"
          >
            {match[3]}
          </a>
        );
      } else if (match[5] !== undefined) { // Payload ADD TO CART
        const payloadParts = match[5].split('|');
        const priceStr = payloadParts[payloadParts.length - 1].replace(/[^\d]/g, '');
        const price = parseInt(priceStr, 10) || 0;
        const category = payloadParts[1];
        const name = payloadParts.slice(2, payloadParts.length - 1).join(' - ');
        
        parts.push(
          <button
            key={match.index}
            onClick={() => onAddToCart && onAddToCart({ category, name, price })}
            className="inline-flex items-center gap-1.5 mt-2 mb-1 px-4 py-2 bg-brand-orange text-white rounded-xl shadow-md border-b-[3px] border-orange-700 font-bold text-[11px] active:scale-95 hover:brightness-110 uppercase tracking-wider transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> PESAN {name.substring(0, 15)}
          </button>
        );
      } else if (match[6] !== undefined) { // Payload WHATSAPP
        const message = match[6].split('|')[1];
        const waUrl = `https://wa.me/6281330763633?text=${encodeURIComponent(message.trim())}`;
        parts.push(
          <a
            key={match.index}
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 mb-2 px-5 py-3 bg-[#25D366] text-white rounded-2xl shadow-xl border-b-[4px] border-[#1DA851] font-black text-[12px] active:scale-95 hover:brightness-110 transition-all no-underline uppercase italic tracking-wider"
          >
            <MessageCircle className="w-5 h-5" /> Hubungi Admin via WhatsApp
          </a>
        );
      } else if (match[7] !== undefined) { // Payload CHECKOUT
        const p = match[7].split('|');
        const [_, nama, alamat, hp, total, menu] = p;
        const waMsg = `Halo Admin Martabak Gresik!\n\nSaya ingin memesan:\n${menu}\n\n*Data Pengiriman:*\nNama: ${nama}\nAlamat: ${alamat}\nHP: ${hp}\n\n*Total:* ${total}\n\nMohon diproses ya Kak! 🙏✨`;
        const waUrl = `https://wa.me/6281330763633?text=${encodeURIComponent(waMsg)}`;

        parts.push(
          <div key={match.index} className="bg-brand-black/5 dark:bg-white/5 border-2 border-brand-black dark:border-brand-yellow/30 p-5 rounded-[2rem] my-4 space-y-4 shadow-inner">
            <div className="flex items-center gap-3 border-b-2 border-brand-black/10 dark:border-white/10 pb-3">
              <div className="bg-brand-orange p-2 rounded-xl shadow-lg">
                <Store className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-black text-xs uppercase italic tracking-tighter dark:text-brand-yellow">Ringkasan Pesanan</h4>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-40 dark:text-white">Penerima:</p>
              <p className="text-xs font-bold dark:text-white">{nama} - {hp}</p>
              <p className="text-[10px] font-medium opacity-60 dark:text-white/60 leading-tight">{alamat}</p>
            </div>

            <div className="bg-white/40 dark:bg-black/40 p-3 rounded-xl border border-brand-black/5">
              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Menu:</p>
              <p className="text-[11px] font-bold dark:text-white whitespace-pre-line">{menu}</p>
            </div>

            <div className="flex justify-between items-center bg-brand-black text-white dark:bg-brand-yellow dark:text-brand-black p-3 rounded-xl">
              <span className="text-[10px] font-black uppercase italic">Total Bayar:</span>
              <span className="text-sm font-black tracking-wider">{total}</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] font-black uppercase opacity-40 text-center">Scan QRIS untuk Bayar:</p>
                <img src="/qris.png" alt="QRIS" className="w-32 h-32 rounded-xl border-2 border-brand-black shadow-lg bg-white p-1" />
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] text-white rounded-2xl shadow-xl border-b-[4px] border-[#1DA851] font-black text-xs uppercase italic flex items-center justify-center gap-3 active:scale-95 hover:brightness-110 transition-all no-underline tracking-widest"
              >
                <MessageCircle className="w-6 h-6" />
                Kirim Pesanan ke WhatsApp
              </a>
            </div>
          </div>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanContent.length) {
      const leftover = cleanContent.substring(lastIndex);
      const sanitizedLeftover = leftover.replace(/#add-to-cart\|[^\s\n]*/g, '');
      if (sanitizedLeftover) parts.push(sanitizedLeftover);
    }

    return parts.length > 0 ? parts : cleanContent;
  };

  return (
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 flex flex-col items-start gap-4">
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left ${
              isExpanded 
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
            <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-brand-yellow/5 dark:bg-black/20 custom-scrollbar">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-brand-orange text-white rounded-tr-none'
                    : 'bg-white dark:bg-white/10 dark:text-white rounded-tl-none'
                    }`}>
                    {renderMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[180px]">
                    <div className="flex items-center gap-3 text-[10px] font-bold dark:text-brand-yellow">
                      <div className="w-5 h-5 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                      <span className="animate-pulse">Mohon tunggu.. AI sedang menjawab...</span>
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
                    onClick={() => !isAiLoading && getAiResponse(suggestion)}
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

      <AnimatePresence>
        {!isAiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg relative mb-2 flex items-center justify-center mx-auto"
          >
            Tanya Kami 👋
            <div className="absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 bg-brand-black dark:bg-brand-yellow rotate-45" />
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
    </div>
  );
};
