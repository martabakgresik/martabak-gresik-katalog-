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
      const systemPrompt = `Anda adalah "Si Penjual Martabak" (Chef Mascot) dari ${STORE_NAME} (Sejak ${SINCE_YEAR}) yang proaktif, ramah, dan jago jualan. 
        Tugas Anda: Berjualan dengan hati! Jika pelanggan tanya menu, REKOMENDASIKAN dengan format #product-card.
  
        DATA TOKO:
        - Nama: ${STORE_NAME}
        - Alamat: ${STORE_ADDRESS}
        - WhatsApp: ${STORE_PHONE}
        - Jam Operasional: ${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00 WIB
        - Status Sekarang: ${isOpen ? 'BUKA' : 'TUTUP (Namun tetap bisa tanya-tanya)'}

        PROMO AKTIF:
        - Kode Promo: ${PROMO_CODE}
        - Diskon: ${PROMO_PERCENT}%
        - Cara Pakai: Masukkan kode di keranjang sebelum checkout.

        ONGKIR & PENGIRIMAN:
        - Tarif: ${formatPrice(SHIPPING_RATE_PER_KM)} per kilometer.
        - Jarak Maksimal: ${MAX_SHIPPING_DISTANCE} KM dari toko.
        - Lokasi Toko: ${STORE_ADDRESS}

        DATA MENU DENGAN GAMBAR:
        - TERANG BULAN (Manis):
        ${MENU_SWEET.map(c => c.items.map(i => `- ${i.name} (${formatPrice(i.price)}) | Kategori: ${c.category} | Gambar: ${i.image}`).join('\n')).join('\n')}
        
        - MARTABAK TELOR (Asin):
        ${MENU_SAVORY.map(s => s.variants.map(v => `- ${v.type} (${s.title}) | Gambar: ${v.prices[0].image} | Harga: ${v.prices.map(p => `${p.qty} telor=${formatPrice(p.price)}`).join(', ')}`).join('\n')).join('\n')}

        ADD-ONS:
        - Manis: ${ADDONS_SWEET.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}
        - Asin: ${ADDONS_SAVORY.map(a => `${a.name} (${formatPrice(a.price)})`).join(', ')}

        DATA PEMBAYARAN:
        - Martabak Gresik HANYA menerima pembayaran via QRIS (OVO, GoPay, Dana, LinkAja, atau Mobile Banking).
        - JANGAN PERNAH menyarankan Transfer Bank manual atau COD di awal.
        - Jika pelanggan tanya cara bayar, instruksikan untuk: 
           1. Klik tombol "Cara Order & Bayar".
           2. Scan kode QRIS yang muncul di layar (atau gunakan ![QRIS](/qris.png)).
           3. Kirim bukti bayar ke WhatsApp Admin.

        PROTOKOL:
        1. UPSELLING: Tiap pelanggan pilih menu, wajib tawarkan Add-on yang relevan.
        2. VISUAL CARD: Gunakan #product-card|Kategori|Nama|Harga|ImageURL.
        3. KATALOG GAMBAR: Jika minta katalog fisik/buku menu, gunakan #download-catalog.
        4. SENTIMEN: Jika ada keluhan/error, gunakan #handover|Alasan.
        5. ADD TO CART: Gunakan #add-to-cart|Kategori|Nama|Harga.
        6. CHECKOUT: Gunakan #checkout|Nama|Alamat|NoHP|TotalHarga|RingkasanMenu.

        MEKANISME WEBSITE:
        - Pencarian: Pelanggan bisa mengetik di kolom pencarian di bagian atas katalog.
        - Filter: Ada tombol kategori (Manis, Asin, Best Seller, Promo) untuk mempermudah.
        - Keranjang: Klik tombol "Tambah ke Keranjang" atau ikon "+" pada menu.
        - Checkout: Klik ikon Keranjang di kanan bawah untuk melihat total and kirim pesanan via WhatsApp.

        GAYA BAHASA: Gaul Gresik, ramah, gunakan emoji (🍕, ✨, 🌙). Panggil pelanggan "Kak" atau "Kakak".`;

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

    // 3. Regex gabungan untuk Gambar, Link, Payload Add to Cart, WhatsApp, Checkout, Product Card, Handover, dan Download Catalog
    const combinedRegex = /!\[([^\]]*)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|\[([^\]]+)\]\s*\(((?:[^()]+|\([^()]*\))+)\)|(#add-to-cart\|(?:[^\n|]+\|)+[^\n\s]+)|(#whatsapp\|[^\n|]+)|(#checkout\|(?:[^\n|]+\|)+[^\n\s]+)|(#product-card\|(?:[^\n|]+\|)+[^\n\s]+)|(#handover\|[^\n|]+)|(#download-catalog)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(cleanContent)) !== null) {
      if (match.index > lastIndex) {
        const textPart = cleanContent.substring(lastIndex, match.index);
        // Hapus semua sisa kode mentah jika ada yang bocor ke teks
        const sanitizedText = textPart.replace(/#(add-to-cart|whatsapp|checkout|product-card|handover|download-catalog)\|[^\s\n]*/g, '').replace(/#download-catalog/g, '');
        if (sanitizedText) parts.push(sanitizedText);
      }
      
      if (match[1] !== undefined) { // Gambar QRIS atau Gambar lain
        parts.push(
          <div key={match.index} className="flex flex-col gap-2 my-2 w-full max-w-[200px]">
            <img 
              src={match[2].trim()} 
              alt={match[1]} 
              className="w-full h-auto rounded-xl shadow-lg border border-brand-black/10 dark:border-white/10" 
            />
            <a 
              href={match[2].trim()} 
              download={`${match[1] || 'image'}.png`}
              className="flex items-center justify-center py-2 px-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black text-[10px] font-bold rounded-xl active:scale-95 no-underline uppercase"
            >
               UNDUH {match[1] || 'GAMBAR'}
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
      } else if (match[8] !== undefined) { // Payload PRODUCT-CARD
        const p = match[8].split('|');
        const [_, category, name, price, img] = p;
        parts.push(
          <motion.div 
            key={match.index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 border border-brand-black/10 dark:border-white/10 rounded-3xl overflow-hidden my-4 shadow-xl max-w-[240px] group"
          >
            <div className="relative h-32 overflow-hidden">
              <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-brand-yellow text-brand-black text-[9px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter">
                {price}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase text-brand-orange leading-none mb-1">{category}</p>
                <h4 className="text-xs font-black dark:text-white leading-tight line-clamp-1">{name}</h4>
              </div>
              <button
                onClick={() => onAddToCart && onAddToCart({ category, name, price: parseInt(price.replace(/\D/g, '')) })}
                className="w-full py-2.5 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-3 h-3" /> Pesan Sekarang
              </button>
            </div>
          </motion.div>
        );
      } else if (match[9] !== undefined) { // Payload HANDOVER
        const reason = match[9].split('|')[1];
        parts.push(
          <div key={match.index} className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-2xl my-4 space-y-3">
            <div className="flex items-center gap-2 text-red-500">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-wider">Butuh Bantuan Manusia?</span>
            </div>
            <p className="text-[11px] font-medium dark:text-white/80 leading-relaxed italic">
              "{reason}"
            </p>
            <a
              href={`https://wa.me/6281330763633?text=Halo%20Admin%20Martabak%20Gresik%2C%20saya%20mengalami%20kendala%3A%20${encodeURIComponent(reason)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all no-underline"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi Admin (WhatsApp)
            </a>
          </div>
        );
      } else if (match[10] !== undefined) { // Payload DOWNLOAD-CATALOG
        parts.push(
          <div key={match.index} className="bg-white dark:bg-brand-black border-2 border-brand-black dark:border-brand-yellow p-4 rounded-[2rem] my-4 space-y-4 shadow-xl text-center overflow-hidden">
            <div className="relative group rounded-2xl overflow-hidden shadow-inner border border-brand-black/5">
               <img src="/katalog.png" alt="Katalog Martabak Gresik" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-6 h-6 text-white" />
               </div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
               <h4 className="font-black text-xs uppercase italic tracking-tighter dark:text-brand-yellow">Katalog Harga & Menu</h4>
               <p className="text-[10px] opacity-60 dark:text-white/60">Satu gambar untuk semua harga, praktis disimpan!</p>
            </div>
            <a
              href="/katalog.png"
              download="Katalog_Martabak_Gresik.png"
              className="flex flex-col items-center justify-center gap-1 w-full py-4 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] active:scale-95 transition-all no-underline shadow-lg group/dl"
            >
              <Download className="w-4 h-4 group-hover/dl:translate-y-0.5 transition-transform" />
              <span className="leading-none">Download Katalog</span>
            </a>
          </div>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanContent.length) {
      const leftover = cleanContent.substring(lastIndex);
      const sanitizedLeftover = leftover.replace(/#(add-to-cart|whatsapp|checkout|product-card|handover|download-catalog)\|[^\s\n]*/g, '').replace(/#download-catalog/g, '');
      if (sanitizedLeftover) parts.push(sanitizedLeftover);
    }

    return parts.length > 0 ? parts : cleanContent;
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
