import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle, Plus, Maximize2, Minimize2 } from "lucide-react";
import { MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY } from "../data/menu";
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
}

export const AiAssistant = ({ onAddToCart, isOpen = false }: AiAssistantProps) => {
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

  const scrollAiToBottom = () => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAiOpen) {
      scrollAiToBottom();
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
            { role: 'system', content: `Anda adalah Asisten Pintar Martabak Gresik yang ramah, gaul, dan ahli kuliner.
              Tugas Anda adalah membantu pelanggan memilih menu. Gunakan data menu berikut:
        
              TERANG BULAN (Manis):
              ${MENU_SWEET.map(c => `- ${c.category}: ${c.items.map(i => `${i.name} (${formatPrice(i.price)})`).join(', ')}`).join('\n')}
              
              MARTABAK TELOR (Asin):
              ${MENU_SAVORY.map(s => `- ${s.title}: ${s.variants.map(v => `${v.type} (${v.prices.map(p => `${p.qty} telor=${formatPrice(p.price)}`).join(', ')})`).join(', ')}`).join('\n')}
              
              TAMBAHAN (Add-ons):
              Manis: ${ADDONS_SWEET.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
              Asin: ${ADDONS_SAVORY.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
        
              INFORMASI TOKO:
              - Alamat: Jl. Usman Sadar No 10, Gresik
              - Jam Buka: 16.00 - 23.00 WIB
              - Jarak Kirim: Maksimal 10km (Ongkir Rp 2.500/km)
              - No Tlp: 081330763633
        
              ATURAN:
              1. Jawab dengan gaya santai tapi sopan.
              2. Jika ditanya menu, berikan rekomendasi dalam bentuk DAFTAR BULLET yang jelas dan rapi.
              3. Jangan sarankan menu yang tidak ada di daftar.
              4. Gunakan emoji agar menarik.
              5. Jawab dalam Bahasa Indonesia atau bahasa yang di input oleh pengguna.
              6. Gunakan UNGKAPAN YANG JELAS dan BARIS BARU (ENTER) untuk memisahkan poin-poin agar mudah dibaca.
              
              PROTOKOL CHECKOUT / PEMESANAN:
              Jika pelanggan ingin checkout / memesan, sampaikan total harga dengan kalimat yang ramah dan sopan agar pelanggan tidak merasa tersinggung, lalu:
              1. Minta kelengkapan data pengiriman: Nama, Alamat lengkap (beserta Nomor Rumah / Share Lokasi), dan Nomor HP aktif.
              2. Untuk pengiriman > 10km, mohon maaf & informasikan pengiriman ditolak, lalu sarankan aplikasi online (GrabFood / ShopeeFood / GoFood).
              3. TAMPILKAN GAMBAR QRIS dengan mengetikkan Murni Markdown Kode gambar seperti ini (SANGAT PENTING: Wajib pakai tanda seru '!' di awal): ![QRIS](/qris.png)
                 DILARANG KERAS mengarang kode/nomor fiktif. PASTIKAN TIDAK ADA SPASI antara kurung siku dan kurung biasa.
              4. TEGASKAN pelanggan harus membayar terlebih dahulu dan melampirkan bukti yang sah. Berikan peringatan yang tegas namun tetap menjaga kesopanan: "Mohon pastikan melampirkan bukti transfer yang sah ya Kak. Mohon maaf, tindakan memalsukan/mengedit bukti transfer adalah tindak pidana penipuan dan akan kami proses secara hukum."
              5. Jika pelanggan SUDAH melengkapi data dan menyatakan sudah siap transfer / mengonfirmasi transfer, berikan RANGKUMAN PESANAN dan tombol Link WhatsApp persis format ini:
                 [KIRIM BUKTI BAYAR & PESANAN KE WHATSAPP](https://wa.me/6281330763633?text=Halo%20Admin,%20saya%20sudah%20bayar%20via%20QRIS.%20Berikut%20pesanan%20saya:...)
                 (PENTING: Ganti ... dengan detail pesanan secara URL-encoded. JANGAN MENULISKAN ISI PESAN TEKS WHATSAPP ("Halo Admin...") DI LUAR TOMBOL. Teks PESANAN HANYA Boleh ditulis di dalam link URL "?text=". ATURAN KETAT: DILARANG MENGGUNAKAN SIMBOL KURUNG "()" DI DALAM URL/LINK KARENA BISA MERUSAK TOMBOL! Selalu gunakan %20 untuk spasi dan %0A untuk enter).
              6. REKOMENDASI MENU & KLIK PESAN: Jika kamu merekomendasikan menu apa pun, kamu WAJIB menyertakan link pesan di bawah nama menu dengan format:
                 #add-to-cart|Kategori_Sesuai_Daftar|Nama_Sesuai_Daftar|Harga_Hanya_Angka
                 Contoh Sempurna (WAJIB DITIRU): #add-to-cart|Terang Bulan Standard|Keju|17000
                 SANGAT PENTING: JANGAN PERNAH BUNGKUS KODE ADD-TO-CART DENGAN MARKDOWN LINK [](). Tulis Polos Saja! Jangan gunakan backtick \` atau apapun.` },
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
    // 1. Bersihkan string dari format aneh AI
    let cleanContent = content.replace(/[\x60*]/g, ''); // Hapus backtick dan asterisk bold
    cleanContent = cleanContent.replace(/\\\\/g, ''); // Hapus escape slash
    
    // 2. Buka paksa markdown add-to-cart (jika AI kebandel masih membungkus pakai format link)
    cleanContent = cleanContent.replace(/\[[^\]]*\]\s*\(\s*(#add-to-cart\|[^)]+)\s*\)/g, ' $1 ');

    // PENTING: Regex ini menargetkan: 
    // 1. Gambar ![alt](url)
    // 2. Link text [text](url)
    // 3. Payload add-to-cart mentah #add-to-cart|Ktg|Nama|...|Harga
    const combinedRegex = /!\[([^\]]*)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|\[([^\]]+)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|(#add-to-cart\|(?:[^\n|]+\|)+\d+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(cleanContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push(cleanContent.substring(lastIndex, match.index));
      }
      
      if (match[1] !== undefined) { // Gambar QRIS
        parts.push(
          <div key={match.index} className="flex flex-col gap-2 my-2 w-full max-w-[200px]">
            <img 
              src={match[2].trim()} 
              alt={match[1]} 
              className="w-full h-auto rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-brand-black/10 dark:border-white/10" 
            />
            <a 
              href={match[2].trim()} 
              download="QRIS-Martabak-Gresik.png"
              className="flex items-center justify-center py-2 px-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black text-[10px] font-bold rounded-xl active:scale-95 hover:opacity-80 transition-all w-full shadow-md no-underline"
            >
               UNDUH QRIS
            </a>
          </div>
        );
      } else if (match[3] !== undefined) { // WA Link standard
        parts.push(
          <a
            key={match.index}
            href={match[4].trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 mb-1 px-4 py-2 bg-[#25D366] text-white rounded-xl shadow-md border-b-[3px] border-[#1DA851] font-bold text-[11px] active:scale-95 hover:brightness-110 transition-all no-underline"
          >
            {match[3]}
          </a>
        );
      } else if (match[5] !== undefined) { // Payload ADD TO CART
        const safeDecode = (str: string) => { try { return decodeURIComponent(str.trim()) } catch { return str.trim() } };
        const payloadParts = match[5].split('|').map(safeDecode);
        const price = parseInt(payloadParts[payloadParts.length - 1], 10) || 0;
        const category = payloadParts[1];
        // Jika AI menambahkan ekstra pipe untuk varian produk, gabungkan seluruhnya menjadi nama lengkap
        const name = payloadParts.slice(2, payloadParts.length - 1).join(' - ');
        
        parts.push(
          <button
            key={match.index}
            onClick={() => onAddToCart && onAddToCart({ category, name, price })}
            className="inline-flex items-center gap-1.5 mt-2 mb-1 px-4 py-2 bg-brand-orange text-white rounded-xl shadow-md border-b-[3px] border-orange-700 font-bold text-[11px] active:scale-95 hover:brightness-110 transition-all uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" /> PESAN {name.substring(0, 20)}{name.length > 20 ? '...' : ''}
          </button>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanContent.length) {
      parts.push(cleanContent.substring(lastIndex));
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
            <div className="bg-brand-black dark:bg-black p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-brand-yellow rounded-full overflow-hidden flex items-center justify-center shadow-inner">
                    <img src="/logo.webp" alt="Martabak Gresik Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-black shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-[pulse_2s_ease-in-out_infinite]" title="AI Online" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide whitespace-nowrap">Martabak Assistant</span>
                    <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-green-500/30">Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className={`text-[10px] font-bold tracking-wider ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
                      {isOpen ? 'Toko Buka' : 'Toko Tutup (Buka 16:00)'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-brand-yellow/5 dark:bg-black/20">
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
                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black p-2 rounded-xl active:scale-90 transition-transform disabled:opacity-50 shrink-0 mb-0.5"
              >
                <MessageCircle className="w-4 h-4" />
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
