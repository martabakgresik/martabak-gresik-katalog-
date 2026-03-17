import { motion } from "motion/react";
import { Phone, MapPin, ShoppingBag, ChevronRight } from "lucide-react";

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
              src="https://ais-dev-6hzfwmlwe535jcrzimwj24-24233205576.asia-east1.run.app/logo.png" 
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
                      <div key={item.name} className="flex justify-between items-center group">
                        <span className={`font-medium ${item.highlight ? 'text-brand-orange' : 'text-brand-black'}`}>
                          {item.name}
                        </span>
                        <div className="flex-grow border-b border-dotted border-brand-black/20 mx-4 group-hover:border-brand-orange/50 transition-colors" />
                        <span className="font-bold tabular-nums">
                          {formatPrice(item.price)}
                        </span>
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
                        <div className="space-y-2">
                          {variant.prices.map((p) => (
                            <div key={p.qty} className="flex justify-between items-center">
                              <span className="text-sm opacity-80">{p.qty} Telor</span>
                              <span className="font-bold text-brand-yellow">{formatPrice(p.price)}</span>
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
    </div>
  );
}
