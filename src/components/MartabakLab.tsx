import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { MENU_SWEET, ADDONS_SWEET } from '../data/config';
import { useCart, formatPrice } from '../hooks/useCart';
import { Sparkles, ShoppingBag, ArrowLeft } from 'lucide-react';

export const MartabakLab: React.FC = () => {
  const { setCurrentView } = useAppStore();
  const { addToCart, shippingRate, maxDistance } = useCart(2500, 10); // Sesuai config
  
  const [selectedBase, setSelectedBase] = useState(MENU_SWEET[0].items[0]);
  const [selectedToppings, setSelectedToppings] = useState<any[]>([]);

  const totalPrice = selectedBase.price + selectedToppings.reduce((acc, curr) => acc + curr.price, 0);

  const handleAddCustomToCart = () => {
    addToCart({
      id: `custom-${Date.now()}`,
      name: `Custom: ${selectedBase.name}`,
      price: totalPrice,
      addons: selectedToppings,
      category: "Eksperimen Lab",
      image: selectedBase.image, // Bisa diganti preview AI nantinya
      quantity: 1
    });
    setCurrentView('catalog');
  };

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black p-6">
      {/* Header & Navigasi Kembali */}
      <button onClick={() => setCurrentView('catalog')} className="flex items-center gap-2 mb-8 font-bold">
        <ArrowLeft /> Kembali ke Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Kiri: Visualizer (Area Aman untuk AI) */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center border-4 border-brand-black">
          <div className="relative w-64 h-64 bg-brand-yellow/20 rounded-full flex items-center justify-center overflow-hidden">
            <Sparkles className="absolute text-brand-orange animate-pulse" />
            <img src={selectedBase.image} alt="Base" className="w-48 h-48 object-contain" />
            {/* Overlay Topping Visualizer bisa ditambahkan di sini */}
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-black italic uppercase">Martabak Masa Depan</h2>
            <p className="text-sm opacity-60">Visualisasi pesanan kustom Anda</p>
          </div>
        </div>

        {/* Kanan: Kontrol Pilihan */}
        <div className="space-y-6">
          <section>
            <h3 className="font-black uppercase mb-4">Pilih Base Adonan</h3>
            <div className="flex flex-wrap gap-2">
              {MENU_SWEET[0].items.map(item => (
                <button 
                  key={item.name}
                  onClick={() => setSelectedBase(item)}
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${selectedBase.name === item.name ? 'bg-brand-black text-white border-brand-black' : 'bg-white border-brand-black/10'}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-black uppercase mb-4">Tambahkan Topping</h3>
            <div className="grid grid-cols-2 gap-3">
              {ADDONS_SWEET.map(addon => (
                <button 
                  key={addon.name}
                  onClick={() => {
                    if (selectedToppings.find(t => t.name === addon.name)) {
                      setSelectedToppings(selectedToppings.filter(t => t.name !== addon.name));
                    } else {
                      setSelectedToppings([...selectedToppings, addon]);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${selectedToppings.find(t => t.name === addon.name) ? 'border-brand-orange bg-brand-orange/10' : 'bg-white border-brand-black/5'}`}
                >
                  <p className="text-xs font-bold">{addon.name}</p>
                  <p className="text-[10px] opacity-60">{formatPrice(addon.price)}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="pt-6 border-t-4 border-brand-black">
            <div className="flex justify-between items-center mb-4">
              <span className="font-black uppercase">Total Harga</span>
              <span className="text-2xl font-black text-brand-orange">{formatPrice(totalPrice)}</span>
            </div>
            <button 
              onClick={handleAddCustomToCart}
              className="w-full bg-brand-black text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-xl"
            >
              <ShoppingBag /> Masukkan ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
