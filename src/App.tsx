import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MapPin, ShoppingBag, Plus, Minus, Trash2, X, MessageCircle, Heart, Share2, Copy, Check, Facebook, Twitter, Instagram, ExternalLink, Download } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  note?: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

const MENU_SWEET = [
  {
    category: "Terang Bulan Standard",
    items: [
      { name: "Kacang", price: 12000 },
      { name: "Coklat", price: 12000 },
      { name: "Kacang + Coklat", price: 14000 },
      { name: "Kacang + Coklat + Keju", price: 19000 },
      { name: "Keju", price: 17000, highlight: true },
      { name: "Keju + Kacang", price: 18000, highlight: true },
      { name: "Keju + Coklat", price: 18000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Pandan",
    items: [
      { name: "Pandan Kacang", price: 13000 },
      { name: "Pandan Coklat", price: 13000 },
      { name: "Pandan Kacang + Coklat", price: 15000 },
      { name: "Pandan Kacang + Coklat + Keju", price: 21000 },
      { name: "Pandan Keju", price: 20000, highlight: true },
      { name: "Pandan Coklat Keju", price: 20000, highlight: true },
      { name: "Pandan Kacang + Keju", price: 20000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Red Velvet",
    items: [
      { name: "Red Velvet Kacang", price: 14000 },
      { name: "Red Velvet Coklat", price: 14000 },
      { name: "Red Velvet Kacang Coklat", price: 16000 },
      { name: "Red Velvet Kacang Coklat Keju", price: 21000 },
      { name: "Red Velvet Keju", price: 20000, highlight: true },
      { name: "Red Velvet Keju + Coklat", price: 21000, highlight: true },
      { name: "Red Velvet Keju + Kacang", price: 21000, highlight: true },
    ],
  },
  {
    category: "Terang Bulan Blackforest",
    items: [
      { name: "Blackforest Kacang", price: 25000 },
      { name: "Blackforest Coklat", price: 25000 },
      { name: "Blackforest Kacang Coklat", price: 26000 },
      { name: "Blackforest Kacang Coklat Keju", price: 29000 },
      { name: "Blackforest Keju", price: 27000, highlight: true },
      { name: "Blackforest Keju Kacang", price: 28000, highlight: true },
      { name: "Blackforest Keju Coklat", price: 28000, highlight: true },
    ],
  },
];

const MENU_SAVORY = [
  {
    title: "Daging Sapi",
    variants: [
      {
        type: "Telor Ayam",
        prices: [
          { qty: 2, price: 25000 },
          { qty: 3, price: 34000 },
          { qty: 4, price: 42000 },
          { qty: 5, price: 45000 },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 26000 },
          { qty: 3, price: 35000 },
          { qty: 4, price: 44000 },
          { qty: 5, price: 50000 },
        ],
      },
    ],
  },
  {
    title: "Daging Ayam",
    variants: [
      {
        type: "Telor Ayam",
        prices: [
          { qty: 2, price: 22000 },
          { qty: 3, price: 30000 },
          { qty: 4, price: 35000 },
          { qty: 5, price: 40000 },
        ],
      },
      {
        type: "Telor Bebek",
        prices: [
          { qty: 2, price: 24000 },
          { qty: 3, price: 32000 },
          { qty: 4, price: 40000 },
          { qty: 5, price: 45000 },
        ],
      },
    ],
  },
  {
    title: "Menu Pedas",
    variants: [
      {
        type: "Samyang Ayam Pedas",
        prices: [
          { qty: 2, price: 30000, desc: "2 Telor Bebek + Daging Ayam" },
        ],
      },
      {
        type: "Samyang Sapi Pedas",
        prices: [
          { qty: 2, price: 32000, desc: "2 Telor Bebek + Daging Sapi" },
        ],
      },
    ],
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('martabak_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('martabak_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cart" | "favorites">("cart");
  const [shareItem, setShareItem] = useState<{ name: string; price: number; category?: string } | null>(null);
  const [isGeneralShareOpen, setIsGeneralShareOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('martabak_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('martabak_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const APP_URL = window.location.origin;

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = (item: { name: string; price: number; category?: string }) => {
    const message = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${item.name}*\n${item.category ? `(${item.category})\n` : ""}Harga: *${formatPrice(item.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6281330763633?text=${encodedMessage}`, "_blank");
  };

  const shareGeneral = (platform: string) => {
    const text = "Cek Martabak Gresik - Terang Bulan dan Martabak Telor Terenak!";
    const url = APP_URL;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "threads":
        shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`;
        break;
      default:
        handleCopyLink(url);
        return;
    }
    window.open(shareUrl, "_blank");
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    const id = `${item.name}-${item.category || ''}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'id'>) => {
    const id = `${item.name}-${item.category || ''}`;
    setFavorites(prev => {
      const existing = prev.find(f => f.id === id);
      if (existing) {
        return prev.filter(f => f.id !== id);
      }
      return [...prev, { ...item, id }];
    });
  };

  const isFavorite = (name: string, category?: string) => {
    const id = `${name}-${category || ''}`;
    return favorites.some(f => f.id === id);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const updateNote = (id: string, note: string) => {
    setCart(prev => prev.map(i =>
      i.id === id ? { ...i, note } : i
    ));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const sendWhatsAppOrder = () => {
    const phoneNumber = "6281330763633";
    let message = "*PESANAN BARU - MARTABAK GRESIK*\n\n";

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.category) message += `   (${item.category})\n`;
      if (item.note) message += `   Catatan: _${item.note}_\n`;
      message += `   ${item.quantity}x ${formatPrice(item.price)} = *${formatPrice(item.price * item.quantity)}*\n\n`;
    });

    message += `--------------------------\n`;
    message += `*TOTAL PEMBAYARAN: ${formatPrice(totalPrice)}*\n\n`;
    message += `Mohon segera diproses ya, terima kasih! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-brand-yellow selection:bg-brand-orange selection:text-white">
      {/* Hero Section */}
      <header className="relative bg-brand-black text-white py-12 px-6 overflow-hidden">
        {/* Wavy Background Element */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-brand-yellow rounded-t-[100%] translate-y-8" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <div className="mb-8 flex flex-row items-center justify-center gap-4 md:gap-10 w-full">
            <img
              src="/logo.webp"
              alt="Martabak Gresik Logo"
              className="w-24 md:w-48 h-auto shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <div className="bg-brand-yellow text-brand-black px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2 inline-block">
                Since 2020
              </div>
              <h1 className="text-3xl md:text-7xl font-display font-black tracking-tighter text-brand-yellow uppercase leading-none">
                Martabak <br className="md:hidden" /> Gresik
              </h1>
              <p className="text-xs md:text-2xl font-medium text-brand-orange italic mt-1 md:mt-2">
                Terang Bulan dan Martabak Telor
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base opacity-80 w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Jl. Usman Sadar No 10, Gresik</span>
            </div>
            <a href="tel:081330763633" className="flex items-center justify-center gap-2 hover:text-brand-orange transition-colors cursor-pointer">
              <Phone className="w-4 h-4 text-brand-orange" />
              <span className="underline decoration-transparent hover:decoration-brand-orange transition-colors">081 330 763 633</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.a
              href="#menu-section"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-orange text-white px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50"
            >
              <ShoppingBag className="w-5 h-5" />
              Pesan Sekarang
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsGeneralShareOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all border border-white/20"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main id="menu-section" className="max-w-7xl mx-auto px-4 py-12 md:py-20 scroll-mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Sweet Martabak Column */}
          <section className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-1 w-12 bg-brand-black rounded-full" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">Terang Bulan</h2>
            </div>
            <div className="mb-8 flex justify-center w-full max-w-xs h-100 md:h-108 mx-auto">
              <img
                src="/terang-bulan.png"
                alt="Ilustrasi Terang Bulan"
                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div className="space-y-10">
              {MENU_SWEET.map((section, idx) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-brand-black/5"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-brand-orange rounded-full" />
                    {section.category}
                  </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex flex-col gap-2 group">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${item.highlight ? 'text-brand-orange' : 'text-brand-black'}`}>
                            {item.name}
                          </span>
                          <div className="flex-grow border-b border-dotted border-brand-black/20 mx-4 group-hover:border-brand-orange/50 transition-colors" />
                          <span className="font-bold tabular-nums mr-4">
                            {formatPrice(item.price)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShareItem({ name: item.name, price: item.price, category: section.category })}
                              className="p-1.5 rounded-full bg-brand-black/5 text-brand-black hover:bg-brand-orange/20 transition-all active:scale-90"
                              title="Bagikan"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFavorite({ name: item.name, price: item.price, category: section.category })}
                              className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(item.name, section.category)
                                ? 'bg-brand-orange text-white'
                                : 'bg-brand-black/5 text-brand-black hover:bg-brand-orange/20'
                                }`}
                            >
                              <Heart className={`w-4 h-4 ${isFavorite(item.name, section.category) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => addToCart({ name: item.name, price: item.price, category: section.category })}
                              className="bg-brand-black text-white p-1.5 rounded-full hover:bg-brand-orange transition-colors active:scale-90"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Savory Martabak Column */}
          <section className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-1 w-12 bg-brand-black rounded-full" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">Martabak Telor</h2>
            </div>
            <div className="mb-8 flex justify-center w-full max-w-xs h-100 md:h-108 mx-auto">
              <img
                src="/martabak.png"
                alt="Ilustrasi Martabak Telor"
                className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div className="space-y-12">
              {MENU_SAVORY.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-brand-black text-white p-8 rounded-[2rem] shadow-2xl shadow-brand-black/20"
                >
                  <h3 className="text-3xl font-display font-black text-brand-yellow uppercase mb-8 italic">
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.variants.map((variant) => (
                      <div key={variant.type} className="space-y-4">
                        <h4 className="text-brand-orange font-bold text-lg italic border-b border-brand-orange/30 pb-2">
                          {variant.type}
                        </h4>
                        <div className="space-y-3">
                          {variant.prices.map((p) => (
                            <div key={p.qty} className="flex justify-between items-center bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors">
                              <span className="text-sm opacity-80">
                                {p.desc ? p.desc : `${p.qty} Telor`}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-brand-yellow">{formatPrice(p.price)}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setShareItem({
                                      name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                      price: p.price
                                    })}
                                    className="p-1.5 rounded-full bg-white/10 text-brand-yellow hover:bg-brand-orange/20 transition-all active:scale-90"
                                    title="Bagikan"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => toggleFavorite({
                                      name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                      price: p.price
                                    })}
                                    className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`)
                                      ? 'bg-brand-orange text-white'
                                      : 'bg-white/10 text-brand-yellow hover:bg-brand-orange/20'
                                      }`}
                                  >
                                    <Heart className={`w-4 h-4 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`) ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => addToCart({
                                      name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                      price: p.price
                                    })}
                                    className="bg-brand-yellow text-brand-black p-1.5 rounded-full hover:bg-brand-orange hover:text-white transition-colors active:scale-90"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ordering Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-16 bg-white p-8 rounded-[2rem] border-4 border-brand-black"
            >
              <h3 className="text-2xl font-black uppercase mb-6 text-center italic">Bisa Pesan Disini:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: "GrabFood",
                    color: "bg-[#00B14F]",
                    url: "https://r.grab.com/o/R7F36f6j"
                  },
                  { name: "GoFood", color: "bg-[#EE2737]", url: "https://gofood.co.id/surabaya/restaurant/martabak-gresik-drojogan-usman-sadar-no-10-84fc235a-673a-4163-a15c-d7ca0b077a4e" },
                  { name: "ShopeeFood", color: "bg-[#EE4D2D]", url: "https://spf.shopee.co.id/qeqAKpT0c" },
                ].map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${app.color} text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg text-center`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {app.name}
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12 px-6 mt-20 relative overflow-hidden">
        {/* Wavy Background Element */}
        <div className="absolute top-0 left-0 w-full h-16 bg-brand-yellow rounded-b-[100%] -translate-y-8" />

        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-display font-black text-brand-yellow uppercase mb-4">Martabak Gresik</h2>
          <p className="opacity-60 text-sm max-w-md mb-8">
            Nikmati kelezatan martabak autentik dengan bahan berkualitas.
            Buka setiap hari untuk menemani waktu santai Anda.
          </p>

          <a
            href="/katalog.png"
            download
            className="bg-brand-orange text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:text-brand-orange transition-all shadow-lg text-sm uppercase tracking-wider mb-8 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download Katalog Lengkap
          </a>

          <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40">
            <p>© {new Date().getFullYear()} Martabak Gresik. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="https://wa.me/6281330763633" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:left-auto md:translate-x-0 md:bg-brand-black md:right-8 z-50 bg-brand-black text-white px-8 py-5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3 hover:bg-brand-orange hover:scale-105 hover:shadow-brand-orange/50 transition-all group animate-[pulse_2s_ease-in-out_infinite]"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 animate-[bounce_2s_infinite]" />
              <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                {totalItems}
              </span>
            </div>
            <span className="font-bold text-lg md:text-base pr-2 tracking-wide uppercase">Lihat Pesanan</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-yellow z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-brand-black text-white">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-brand-yellow" />
                    <h2 className="text-xl font-black uppercase italic tracking-tight">Menu Anda</h2>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex bg-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "cart" ? "bg-brand-yellow text-brand-black" : "text-white/60 hover:text-white"
                      }`}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Keranjang ({totalItems})
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === "favorites" ? "bg-brand-yellow text-brand-black" : "text-white/60 hover:text-white"
                      }`}
                  >
                    <Heart className="w-3 h-3" />
                    Favorit ({favorites.length})
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {activeTab === "cart" ? (
                  cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <ShoppingBag className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase italic">Keranjang masih kosong</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-brand-black shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold leading-tight">{item.name}</h4>
                            {item.category && <p className="text-[10px] uppercase font-bold opacity-40">{item.category}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShareItem({ name: item.name, price: item.price, category: item.category })}
                              className="text-brand-black/40 hover:text-brand-orange p-1 rounded-lg transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-brand-orange hover:bg-brand-orange/10 p-1 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 bg-brand-black/5 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="bg-white p-1 rounded-lg shadow-sm hover:bg-brand-orange hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="bg-white p-1 rounded-lg shadow-sm hover:bg-brand-orange hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-black text-lg">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Catatan (opsional)..."
                          value={item.note || ""}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          className="mt-1 w-full text-xs p-2 bg-brand-black/5 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange transition-shadow"
                        />
                      </div>
                    ))
                  )
                ) : (
                  favorites.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Heart className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase italic">Belum ada favorit</p>
                      <p className="text-xs mt-2">Klik ikon hati pada menu untuk menambahkan</p>
                    </div>
                  ) : (
                    favorites.map((item) => (
                      <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-brand-black shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold leading-tight">{item.name}</h4>
                            {item.category && <p className="text-[10px] uppercase font-bold opacity-40">{item.category}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setShareItem({ name: item.name, price: item.price, category: item.category })}
                              className="text-brand-black/40 hover:text-brand-orange p-1 rounded-lg transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleFavorite({ name: item.name, price: item.price, category: item.category })}
                              className="text-brand-orange hover:bg-brand-orange/10 p-1 rounded-lg transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-black text-lg">{formatPrice(item.price)}</span>
                          <button
                            onClick={() => addToCart({ name: item.name, price: item.price, category: item.category })}
                            className="bg-brand-black text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-orange transition-colors active:scale-95 flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            Tambah
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>

              {activeTab === "cart" && cart.length > 0 && (
                <div className="p-6 bg-white border-t-4 border-brand-black space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase opacity-60">Total Pembayaran</span>
                    <span className="text-2xl font-black text-brand-black">{formatPrice(totalPrice)}</span>
                  </div>
                  <button
                    onClick={() => setIsOrderConfirmationOpen(true)}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Pesan via WhatsApp
                  </button>
                  <p className="text-[10px] text-center opacity-40 font-bold uppercase">
                    Klik tombol di atas untuk mengirim pesanan otomatis ke WhatsApp kami
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Share Modal */}
      <AnimatePresence>
        {shareItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareItem(null)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] border-4 border-brand-black z-[90] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic">Bagikan Menu</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider">Kirim ke teman via WhatsApp</p>
                </div>
                <button
                  onClick={() => setShareItem(null)}
                  className="p-2 hover:bg-brand-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-brand-black/5 p-4 rounded-2xl mb-6">
                <p className="text-sm font-bold">{shareItem.name}</p>
                <p className="text-xs opacity-60">{shareItem.category}</p>
                <p className="text-lg font-black mt-2">{formatPrice(shareItem.price)}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareToWhatsApp(shareItem)}
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Kirim ke WhatsApp
                </button>
                <button
                  onClick={() => {
                    const msg = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${shareItem.name}*\n${shareItem.category ? `(${shareItem.category})\n` : ""}Harga: *${formatPrice(shareItem.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
                    handleCopyLink(msg);
                  }}
                  className="w-full bg-brand-black text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? "Berhasil Disalin!" : "Salin Pesan"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* General Share Modal */}
      <AnimatePresence>
        {isGeneralShareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGeneralShareOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-brand-yellow rounded-[2rem] border-4 border-brand-black z-[90] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic">Bagikan Katalog</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider">Ajak teman jajan Martabak!</p>
                </div>
                <button
                  onClick={() => setIsGeneralShareOpen(false)}
                  className="p-2 hover:bg-brand-black/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => shareGeneral("facebook")}
                  className="bg-[#1877F2] text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Facebook</span>
                </button>
                <button
                  onClick={() => shareGeneral("twitter")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">X (Twitter)</span>
                </button>
                <button
                  onClick={() => shareGeneral("threads")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Threads</span>
                </button>
                <button
                  onClick={() => handleCopyLink(APP_URL)}
                  className="bg-brand-orange text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  <span className="text-[10px] font-bold uppercase">{copied ? "Disalin!" : "Salin Link"}</span>
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold uppercase opacity-40">Atau bagikan via:</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => window.open(`https://www.instagram.com/`, "_blank")} className="p-2 bg-white rounded-full border-2 border-brand-black hover:bg-brand-orange hover:text-white transition-all">
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button onClick={() => window.open(`https://www.tiktok.com/`, "_blank")} className="p-2 bg-white rounded-full border-2 border-brand-black hover:bg-brand-orange hover:text-white transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {isOrderConfirmationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderConfirmationOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white rounded-[2rem] border-4 border-brand-black z-[110] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-brand-black text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase italic">Konfirmasi Pesanan</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider">Periksa kembali pesanan Anda</p>
                </div>
                <button
                  onClick={() => setIsOrderConfirmationOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm border-b-2 border-brand-black pb-2">Ringkasan Menu:</h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                          <p className="font-bold text-sm leading-tight">{item.name}</p>
                          {item.category && <p className="text-[10px] uppercase font-bold opacity-40">{item.category}</p>}
                          {item.note && <p className="text-[10px] italic opacity-60">Catatan: {item.note}</p>}
                          <p className="text-xs opacity-60">{item.quantity}x {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-black text-sm shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-brand-black/20 flex justify-between items-center">
                    <span className="font-black uppercase">Total Bayar</span>
                    <span className="text-xl font-black text-brand-orange">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* QRIS Section */}
                <div className="bg-brand-yellow/20 p-6 rounded-3xl border-2 border-brand-black/10 flex flex-col items-center text-center">
                  <h4 className="font-black uppercase italic text-sm mb-4">Pembayaran QRIS:</h4>
                  <div className="bg-white p-4 rounded-2xl border-2 border-brand-black shadow-inner mb-4">
                    <img
                      src="/qris.png"
                      alt="QRIS Pembayaran"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>

                  <a
                    href="/qris.png"
                    download="QRIS_Martabak_Gresik.png"
                    className="mb-4 bg-brand-black text-white px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 hover:bg-brand-orange transition-colors active:scale-95 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download QRIS
                  </a>

                  <p className="text-[10px] font-bold uppercase opacity-60 leading-tight">
                    Scan kode QR di atas untuk melakukan pembayaran.<br />
                    Simpan bukti bayar untuk dikirim via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border-t-4 border-brand-black shrink-0">
                <button
                  onClick={() => {
                    sendWhatsAppOrder();
                    setIsOrderConfirmationOpen(false);
                  }}
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  Konfirmasi & Kirim WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
