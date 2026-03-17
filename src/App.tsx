import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MapPin, ShoppingBag, Plus, Minus, Trash2, X, MessageCircle } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item: Omit<CartItem, 'quantity' | 'id'>) => {
    const id = `${item.name}-${item.category || ''}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, id, quantity: 1 }];
    });
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const sendWhatsAppOrder = () => {
    const phoneNumber = "6281330763633";
    let message = "*PESANAN BARU - MARTABAK GRESIK*\n\n";
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.category) message += `   (${item.category})\n`;
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
        
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col items-center"
          >
            <img 
              src="/logo.png" 
              alt="Martabak Gresik Logo" 
              className="w-48 md:w-64 h-auto mb-6 drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="bg-brand-yellow text-brand-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Since 2020
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-brand-yellow uppercase">
              Martabak Gresik
            </h1>
            <p className="text-xl md:text-2xl font-medium text-brand-orange italic mt-2">
              Terang Bulan dan Martabak Telor
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm md:text-base opacity-80"
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Jl. Usman Sadar No 10, Gresik</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>081 330 763 633</span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Sweet Martabak Column */}
          <section className="space-y-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-brand-black rounded-full" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">Terang Bulan</h2>
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
                          <button 
                            onClick={() => addToCart({ name: item.name, price: item.price, category: section.category })}
                            className="bg-brand-black text-white p-1.5 rounded-full hover:bg-brand-orange transition-colors active:scale-90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
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
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-brand-black rounded-full" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight">Martabak Telor</h2>
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
                              <span className="text-sm opacity-80">{p.qty} Telor</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-brand-yellow">{formatPrice(p.price)}</span>
                                <button 
                                  onClick={() => addToCart({ 
                                    name: `${section.title} (${variant.type} - ${p.qty} Telor)`, 
                                    price: p.price 
                                  })}
                                  className="bg-brand-yellow text-brand-black p-1.5 rounded-full hover:bg-brand-orange hover:text-white transition-colors active:scale-90"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
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
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-display font-black text-brand-yellow uppercase mb-4">Martabak Gresik</h2>
          <p className="opacity-60 text-sm max-w-md mx-auto">
            Nikmati kelezatan martabak autentik dengan bahan berkualitas. 
            Buka setiap hari untuk menemani waktu santai Anda.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-40">
            <p>© 2026 Martabak Gresik. All rights reserved.</p>
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
            className="fixed bottom-8 right-8 z-50 bg-brand-black text-white p-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-brand-orange transition-colors group"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-brand-yellow text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                {totalItems}
              </span>
            </div>
            <span className="font-bold pr-2 hidden md:block">Lihat Pesanan</span>
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
              <div className="p-6 bg-brand-black text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-brand-yellow" />
                  <h2 className="text-xl font-black uppercase italic tracking-tight">Pesanan Anda</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
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
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-brand-orange hover:bg-brand-orange/10 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white border-t-4 border-brand-black space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase opacity-60">Total Pembayaran</span>
                    <span className="text-2xl font-black text-brand-black">{formatPrice(totalPrice)}</span>
                  </div>
                  <button 
                    onClick={sendWhatsAppOrder}
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
    </div>
  );
}
