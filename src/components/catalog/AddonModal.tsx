import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, ShoppingBag, Info, Heart, Share2, Copy, Check } from "lucide-react";
import { formatPrice } from "../../hooks/useCart";

interface AddonModalProps {
  item: any | null;
  isOpen: boolean;
  onClose: () => void;
  selectedAddons: any[];
  setSelectedAddons: React.Dispatch<React.SetStateAction<any[]>>;
  onAddToCart: (item: any, addons: any[]) => void;
  addonsList: any[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}


export const AddonModal: React.FC<AddonModalProps> = ({
  item, isOpen, onClose, selectedAddons, setSelectedAddons, onAddToCart, addonsList,
  isFavorite, onToggleFavorite, onShare
}) => {
  if (!item || !isOpen) return null;

  const handleAddonToggle = (addon: any) => {
    setSelectedAddons(prev => {
      const existing = prev.find(a => a.name === addon.name);
      if (existing) {
        return prev.filter(a => a.name !== addon.name);
      }
      return [...prev, { ...addon, quantity: addon.defaultQty || 1 }];
    });
  };

  const updateAddonQty = (addonName: string, delta: number) => {
    setSelectedAddons(prev => prev.map(a => {
      if (a.name === addonName) {
        const newQty = Math.min(Math.max(a.minQty || 1, (a.quantity || 1) + delta), a.maxQty || 20);
        return { ...a, quantity: newQty };
      }
      return a;
    }));
  };

  const totalPrice = item.price + selectedAddons.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-brand-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-brand-black w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-brand-black dark:border-brand-yellow flex flex-col max-h-[90dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 sm:h-64 overflow-hidden shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all"><X className="w-6 h-6" /></button>
          
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-brand-yellow font-black uppercase text-[10px] tracking-widest mb-1">{item.category}</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-none">{item.name}</h2>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Deskripsi Menu</h3>
            <p className="text-xs sm:text-sm leading-relaxed opacity-70 italic">"{item.description}"</p>
          </div>

          {addonsList.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Pilihan Tambahan (Add-ons)</h3>
              <div className="grid grid-cols-1 gap-2">
                {addonsList.map((addon) => {
                  const isSelected = selectedAddons.some(a => a.name === addon.name);
                  const selectedAddon = selectedAddons.find(a => a.name === addon.name);
                  
                  return (
                    <div 
                      key={addon.name}
                      className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${addon.disabled ? 'opacity-30 cursor-not-allowed' : isSelected ? 'border-brand-orange bg-brand-orange/5' : 'border-brand-black/5 dark:border-white/5 hover:border-brand-orange/20'}`}
                      onClick={() => !addon.disabled && handleAddonToggle(addon)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-orange border-brand-orange' : 'border-brand-black/20 dark:border-white/20'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="font-bold text-xs">{addon.name}</p>
                          <p className="text-[10px] font-black text-brand-orange">+{formatPrice(addon.price)}</p>
                        </div>
                      </div>

                      {isSelected && (addon.maxQty && addon.maxQty > 1) && (
                        <div className="flex items-center gap-2 bg-white dark:bg-black p-1 rounded-xl shadow-inner" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => updateAddonQty(addon.name, -1)} className="p-1 hover:bg-brand-orange/10 rounded-lg text-brand-orange"><Minus className="w-3 h-3" /></button>
                          <span className="w-4 text-center font-bold text-[10px]">{selectedAddon?.quantity || 1}</span>
                          <button onClick={() => updateAddonQty(addon.name, 1)} className="p-1 hover:bg-brand-orange/10 rounded-lg text-brand-orange"><Plus className="w-3 h-3" /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button 
              onClick={onToggleFavorite}
              className={`flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all ${isFavorite ? 'bg-brand-orange text-white' : 'bg-brand-black/5 dark:bg-white/5 opacity-60'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Disukai' : 'Favorit'}
            </button>
            <button 
              onClick={onShare}
              className="flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 bg-brand-black/5 dark:bg-white/5 opacity-60 hover:opacity-100 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Bagikan
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-brand-yellow dark:bg-brand-yellow/10 border-t-4 border-brand-black dark:border-brand-yellow flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase opacity-40">Total Harga</p>
            <p className="text-xl sm:text-2xl font-black">{formatPrice(totalPrice)}</p>
          </div>
          <button 
            onClick={() => onAddToCart(item, selectedAddons)}
            className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Ke Keranjang
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
