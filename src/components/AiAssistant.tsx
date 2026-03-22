import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, RotateCcw, X, MessageCircle } from "lucide-react";
import { MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY } from "../data/menu";
import { formatPrice } from "../hooks/useCart";

const AI_SUGGESTIONS = [
  "Rekomendasi Menu 🍕",
  "Promo Hari Ini 🎁",
  "Cek Ongkir 🛵",
  "Pesan Skala Besar 📦",
  "Jam Buka ⏰"
];

export const AiAssistant = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Halo! Saya Asisten Pintar Martabak Gresik. Ada yang bisa saya bantu? Mau rekomendasi menu? atau pesan skala besar?😁\n\nAtau tanya apa saja juga boleh!" }
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
              6. Gunakan UNGKAPAN YANG JELAS dan BARIS BARU (ENTER) untuk memisahkan poin-poin agar mudah dibaca.` },
            ...newMessages
          ],
          model: 'openai-fast'
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

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col items-start gap-4">
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white dark:bg-brand-black w-[300px] md:w-[350px] h-[450px] rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-brand-black dark:bg-black p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-brand-black" />
                </div>
                <span className="font-bold text-sm">Martabak Assistant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAiMessages([{ role: 'assistant', content: "Halo! Saya Asisten Pintar Martabak Gresik. Ada yang bisa saya bantu? Mau rekomendasi menu? atau pesan skala besar?😁\n\nAtau tanya apa saja juga boleh!" }])}
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
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2 min-w-[180px]">
                    <div className="flex items-center gap-3 text-[10px] font-bold dark:text-brand-yellow">
                      <div className="w-5 h-5 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
                      <span className="animate-pulse">Mohon tunggu AI meracik jawaban...</span>
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
