// Last Sync: 2026-03-29 - Testing push functionality
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle, Plus, Maximize2, Minimize2, Send, Sparkles, CookingPot, Download, ShoppingBag } from "lucide-react";
import {
  MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY,
  STORE_NAME, STORE_ADDRESS, STORE_PHONE, SINCE_YEAR,
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT,
  SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE, HOLIDAYS
} from "../data/config";
import { useAppStore } from "../store/useAppStore";
import { AI_TEXTS } from "../data/i18n/aiAssistantCopy";
import { type CartItem } from "../hooks/useCart";

// Helper utilities
const debounce = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

interface AiAssistantProps {
  onAddToCart?: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  onCheckoutRedirect?: () => void;
  cart?: CartItem[];
  totalPrice?: number;
  menuSweet?: any[];
  menuSavory?: any[];
}

interface TextModelOption {
  id: string;
  name?: string;
  paid?: boolean;
}

const normalizeModelList = (data: any) => {
  const asArray =
    (Array.isArray(data) && data) ||
    (Array.isArray(data?.models) && data.models) ||
    (Array.isArray(data?.data) && data.data) ||
    (Array.isArray(data?.items) && data.items) ||
    (data?.models && typeof data.models === "object" && !Array.isArray(data.models)
      ? Object.entries(data.models).map(([id, value]: [string, any]) => ({
          id,
          ...(typeof value === "object" ? value : { name: String(value) })
        }))
      : []);

  return asArray
    .map((item: any) => {
      // Jika item adalah string langsung (Pollinations kadang return ["model1", "model2"])
      if (typeof item === 'string') {
        return { id: item, name: item, paid: false };
      }
      // Jika item adalah objek
      return {
        id: item.id || item.model || item.name,
        name: item.name || item.label || item.id || item.model,
        paid: Boolean(item.paid || item.pricing)
      };
    })
    .filter((item: any) => item?.id);
};



export const AiAssistant = ({
  onAddToCart,
  onCheckoutRedirect,
  cart = [],
  totalPrice = 0,
  menuSweet = MENU_SWEET,
  menuSavory = MENU_SAVORY,
}: AiAssistantProps) => {
  const { uiState, storeSettings, t } = useAppStore();
  const { uiLang, isOpen, isHoliday } = uiState;
  const { activePromoCode, activePromoPercent, isEmergencyClosed } = storeSettings;

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const aiText = AI_TEXTS[uiLang];
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: aiText.greeting(STORE_NAME) }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTextModelsLoading, setIsTextModelsLoading] = useState(false);
  const [textModelsSource, setTextModelsSource] = useState<"api" | "direct" | "fallback">("api");
  const [selectedTextModel, setSelectedTextModel] = useState("openai");
  const [textModelOptions, setTextModelOptions] = useState<TextModelOption[]>([
    { id: "openai", name: "OpenAI GPT-5 Mini", paid: false }
  ]);
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

  const getCartContext = useCallback(() => {
    if (cart.length === 0) return "KERANJANG SAAT INI: Kosong.";
    let context = "KERANJANG BELANJA USER SAAT INI:\n";
    cart.forEach((item, index) => {
      context += `${index + 1}. ${item.name} (${item.quantity}x) - Rp${item.price * item.quantity}\n`;
      if (item.addons && item.addons.length > 0) {
        context += `   Addons: ${item.addons.map(a => a.name).join(', ')}\n`;
      }
    });
    context += `TOTAL HARGA: Rp${totalPrice}\n`;
    return context;
  }, [cart, totalPrice]);

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

  useEffect(() => {
    const fetchTextModels = async () => {
      setIsTextModelsLoading(true);
      try {
        let data: any = null;
        let source: "api" | "direct" | "fallback" = "api";
        
        const apiPath = "/api/text-models";
        const directPath = "https://gen.pollinations.ai/text/models";

        try {
          const apiResponse = await fetch(apiPath);
          if (apiResponse.ok) {
            data = await apiResponse.json();
          } else {
            const directResponse = await fetch(directPath);
            if (directResponse.ok) {
              data = await directResponse.json();
              source = "direct";
            }
          }
        } catch (innerError) {
          const directResponse = await fetch(directPath);
          if (directResponse.ok) {
            data = await directResponse.json();
            source = "direct";
          }
        }

        if (!data) throw new Error("No text model data received");

        const normalized = normalizeModelList(data);

        if (normalized.length > 0) {

          setTextModelOptions(normalized);
          setTextModelsSource(source);
          
          const hasCurrent = normalized.some((m: TextModelOption) => m.id === selectedTextModel);
          if (!hasCurrent) {
            const firstFree = normalized.find((m: TextModelOption) => !m.paid)?.id;
            const fallbackModel = normalized.find(m => m.id === "openai")?.id || normalized[0].id;
            setSelectedTextModel(firstFree || fallbackModel);
          }
        }
      } catch (error) {
        console.error("[AI Debug] Gagal load model chat:", error);
        setTextModelsSource("fallback");
      } finally {
        setIsTextModelsLoading(false);
      }
    };

    fetchTextModels();
  }, []);



  const getAiResponse = async (userMessage: string) => {
    setIsAiLoading(true);
    const newMessages = [...aiMessages, { role: 'user' as const, content: userMessage }];
    setAiMessages(newMessages);
    setAiInput("");

    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString(uiLang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' });
      
      // Menggunakan status terpusat dari store agar konsisten dengan UI lainnya
      const storeStatusText = isEmergencyClosed 
        ? (uiLang === 'en' ? "Emergency Closed" : "Tutup Darurat")
        : isHoliday 
          ? (uiLang === 'en' ? "Holiday" : "Libur")
          : isOpen 
            ? (uiLang === 'en' ? `Open (${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00)` : `Buka (${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00)`)
            : (uiLang === 'en' ? `Closed (${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00)` : `Tutup (${OPEN_HOUR}:00 - ${CLOSE_HOUR}:00)`);

       const systemPrompt = `Anda adalah "Asisten Virtual", asisten virtual ${STORE_NAME} yang cerdas, asik, ramah, dan berpengetahuan luas.
       
PENTING: Gunakan bahasa ${uiLang === 'en' ? 'English' : 'Bahasa Indonesia'} sepenuhnya kecuali user mengganti bahasa.
Jika user bertanya dalam Bahasa Indonesia, balas Bahasa Indonesia natural. Jika English, balas English.

PENTING: Anda boleh menjawab topik apa saja, TAPI selalu hubungkan kembali ke ${STORE_NAME} secara natural dan kreatif di akhir jawaban. Contoh:
- Ditanya soal cuaca -> jawab, lalu hubungkan ke enaknya makan martabak.
- Ditanya soal film -> hubungkan ke asiknya ngemil terang bulan.

Jangan pernah menolak pertanyaan. Jawab dulu dengan benar, baru arahkan kembali ke martabak secara halus.

INFORMASI TOKO:
- Nama: ${STORE_NAME}
- Alamat: ${STORE_ADDRESS}
- WhatsApp: ${STORE_PHONE}
- Ongkir: Rp${SHIPPING_RATE_PER_KM}/km (maks ${MAX_SHIPPING_DISTANCE} km)
- Promo: Diskon ${activePromoPercent}% dengan kode "${activePromoCode}"

DATA MENU AKTIF:
${getMenuContext()}

${getCartContext()}

STATUS TOKO SAAT INI: ${storeStatusText}
Waktu sekarang: ${currentTime} WIB

NOMOR WHATSAPP TOKO: ${STORE_PHONE}
Jika perlu menyertakan link WhatsApp, gunakan format: #whatsapp|${STORE_PHONE}|Pesan opsional

GAYA KOMUNIKASI: ${uiLang === 'en' ? 'Friendly, helpful, foodie expert, excited.' : 'Ramah, asik, pakai "Kak", hangat, lokal Gresik.'}

========== FORMAT DISPLAY PRODUK ==========
Format ini wajib untuk menampilkan produk agar user bisa klik beli:
#product-card|KATEGORI|NAMA_PRODUK|HARGA|/LOKASI_GAMBAR
#checkout (Gunakan ini jika user ingin mengakhiri pesanan)

CONTOH: #product-card|Terang Bulan|Keju|17000|/sweet/keju.webp

PATH GAMBAR (Gunakan path relatif dari dataset di atas):
Contoh: /sweet/keju.webp, /savory/martabak.webp

FITUR KHUSUS:
- KATALOG: Jika minta katalog -> kirim "#download-catalog"
- QRIS: Jika tanya cara bayar -> kirim "#show-qris"`;

      // Construct payload with full message history including system prompt
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...newMessages
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedTextModel
        })
      });

      if (!response.ok) throw new Error('AI Error');

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      setAiMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessages([...newMessages, { role: 'assistant', content: aiText.error }]);
    } finally {
      setIsAiLoading(false);
    }
  };


  const generateImageResponse = async (userMessage: string) => {
    await getAiResponse(userMessage);
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
          return (
            <div key={index} className="bg-brand-black/5 dark:bg-white/5 border-2 border-brand-black dark:border-brand-yellow/30 p-6 rounded-[2.5rem] my-4 space-y-4 shadow-inner text-center">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                <ShoppingBag className="w-8 h-8 text-brand-black" />
              </div>
              <h4 className="font-black text-sm uppercase italic dark:text-brand-yellow">{aiText.checkoutReady}</h4>
              <p className="text-[10px] font-bold dark:text-white/70">{aiText.checkoutDesc}</p>
              <button 
                onClick={() => {
                  setIsAiOpen(false);
                  onCheckoutRedirect && onCheckoutRedirect();
                }}
                className="w-full py-4 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-2xl shadow-xl font-black text-xs uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {aiText.continueToCart}
              </button>
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
              <span>{aiText.contactWa}</span>
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
                  <h4 className="text-sm font-black dark:text-white uppercase tracking-tighter mb-1">{t.downloadMenuLabel}</h4>
                  <p className="text-[10px] text-brand-black/60 dark:text-white/60 font-medium">{aiText.catalogSubtitle}</p>
                </div>
                <a href="/katalog.webp" download="Katalog-Martabak-Gresik.webp" className="flex items-center justify-center gap-3 w-full py-4 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl no-underline group/btn">
                  <Download className="w-4 h-4 group-hover/btn:bounce" /> 
                  {aiText.saveCatalog}
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
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-orange mb-1">{aiText.qrisTitle}</h4>
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
                <p className="text-[9px] text-brand-black/60 dark:text-white/70 font-bold leading-relaxed">{aiText.qrisSubtitle}</p>
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
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-[999] flex flex-col items-center gap-2">
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`bg-white dark:bg-brand-black border-4 border-brand-black dark:border-brand-yellow shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${isExpanded
              ? 'fixed inset-[5px] w-auto h-auto max-w-none max-h-none rounded-[1.75rem] origin-center'
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
                    <span className="text-[8px] sm:text-[9px] bg-green-500/20 text-green-400 px-1 sm:px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-green-500/30 hidden min-[400px]:block">{aiText.onlineStatus}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex h-2 w-2 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider ${isOpen ? 'text-green-400' : 'text-red-400'} whitespace-nowrap`}>
                      {isOpen ? aiText.storeOpen : aiText.storeClosed}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Minimize" : "Maximize"}
                  className="hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setAiMessages([{ role: 'assistant', content: aiText.greeting(STORE_NAME) }])}
                  title={aiText.resetChat}
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
                      <span className="animate-pulse italic">
                        {aiText.loadingStep}
                      </span>
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
                {aiText.suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isAiLoading && generateImageResponse(`PENGGUNA KLIK SHORTCUT: ${suggestion}`)}
                    disabled={isAiLoading}
                    className="whitespace-nowrap bg-white dark:bg-white/10 border border-brand-black/10 dark:border-white/10 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm transition-all hover:bg-brand-yellow dark:hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow disabled:opacity-50"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (aiInput.trim()) generateImageResponse(aiInput); }}
              className="p-3 sm:p-4 bg-white dark:bg-black border-t border-brand-black/10 dark:border-white/10 flex items-end gap-2 pr-4 sm:pr-5"
            >
              <div className="flex-grow flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-brand-black/5 dark:bg-white/10">
                  <span className="text-[9px] font-bold uppercase tracking-wide dark:text-white/80">Chat</span>
                  <select
                    value={selectedTextModel}
                    onChange={(e) => setSelectedTextModel(e.target.value)}
                    className="flex-1 bg-transparent text-[10px] font-bold outline-none dark:text-white"
                    disabled={isTextModelsLoading}
                    title="Model chat default"
                  >
                    {textModelOptions.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name || model.id}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  ref={aiTextareaRef}
                  rows={1}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (aiInput.trim() && !isAiLoading) generateImageResponse(aiInput);
                    }
                  }}
                  placeholder={aiText.inputPlaceholder}
                  className="flex-grow bg-brand-black/5 dark:bg-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-brand-orange dark:text-white resize-none max-h-[120px] transition-all"
                />
              </div>
              <button
                disabled={isAiLoading || !aiInput.trim()}
                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black p-2 rounded-xl active:scale-90 transition-transform disabled:opacity-50 shrink-0 mb-0.5 mr-0.5 group"
                title={aiText.sendMessage}
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
            {aiText.askUs}
            <div className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 bg-brand-black dark:bg-brand-yellow rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
