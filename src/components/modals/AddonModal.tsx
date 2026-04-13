import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Maximize2, Share2, Check, Minus, Plus, ShoppingBag
} from "lucide-react";

interface AddonModalProps {
  selectedItemForAddon: any;
  closeAddonModal: () => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  selectedAddons: any[];
  setSelectedAddons: (addons: any[]) => void;
  addToCart: (item: any) => void;
  setZoomedImage: (img: { src: string; alt: string } | null) => void;
  formatPrice: (price: number) => string;
  t: any;
  addonsSweet: any[];
  addonsSavory: any[];
}

export const AddonModal: React.FC<AddonModalProps> = ({
  selectedItemForAddon,
  closeAddonModal,
  copied,
  setCopied,
  selectedAddons,
  setSelectedAddons,
  addToCart,
  setZoomedImage,
  formatPrice,
  t,
  addonsSweet,
  addonsSavory
}) => {
  return (
    <AnimatePresence>
        {selectedItemForAddon && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddonModal}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[90] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex flex-col gap-4 mb-6">
                {selectedItemForAddon.image && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-brand-black/5 dark:bg-white/5 border-2 border-brand-black/10 dark:border-white/10 shadow-lg relative cursor-pointer"
                    onClick={() => setZoomedImage({src: selectedItemForAddon.image!, alt: selectedItemForAddon.name})}
                  >
                    <img 
                      src={selectedItemForAddon.image} 
                      alt={selectedItemForAddon.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-brand-black/20 backdrop-blur-md p-2 rounded-full text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow leading-tight">
                      {t.extraOptions} <span className="text-sm font-bold text-brand-orange lowercase not-italic">{t.optional}</span>
                    </h3>
                    <p className="text-[10px] font-bold opacity-60 dark:text-brand-yellow/80 mt-1 mb-1">{t.extraToppingHint}</p>
                    <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">{selectedItemForAddon.name}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/?item=${encodeURIComponent(selectedItemForAddon.name)}`;
                        navigator.clipboard.writeText(url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                      title={t.copyMenuLink}
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={closeAddonModal}
                      className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {(selectedItemForAddon.type === 'sweet' ? addonsSweet : addonsSavory).map((addon: any) => {
                  const isSelected = selectedAddons.some(a => a.name === addon.name);
                  const baseClasses = addon.disabled
                    ? 'border-brand-black/5 dark:border-white/5 bg-brand-black/5 dark:bg-white/5 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-brand-orange bg-brand-orange/5 dark:bg-brand-orange/10 cursor-pointer'
                      : 'border-brand-black/10 dark:border-white/10 hover:bg-brand-black/5 dark:hover:bg-white/5 cursor-pointer';

                  return (
                    <div key={addon.name} className={`p-3 rounded-xl border-2 transition-all ${baseClasses}`}>
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          if (addon.disabled) return;
                          if (isSelected) {
                            setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
                          } else {
                            setSelectedAddons([...selectedAddons, { ...addon, quantity: addon.defaultQty || 1 }]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${addon.disabled ? 'border-brand-black/20 dark:border-white/20 bg-brand-black/10 dark:bg-white/10' : isSelected ? 'bg-brand-orange border-brand-orange' : 'border-brand-black/30 dark:border-white/30'}`}>
                            {isSelected && !addon.disabled && <Check className="w-3 h-3 text-white" />}
                            {addon.disabled && <X className="w-3 h-3 text-brand-black/40 dark:text-white/40" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${addon.disabled ? 'text-brand-black/60 dark:text-white/60 line-through decoration-2' : 'dark:text-white'}`}>{addon.name}</span>
                            {addon.disabled && <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Stok Habis</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-bold ${addon.disabled ? 'text-brand-black/40 dark:text-white/40 line-through' : 'opacity-60 dark:text-brand-yellow'}`}>
                            {isSelected
                              ? formatPrice(addon.price * (selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1))
                              : addon.defaultQty && addon.defaultQty > 1
                                ? `${formatPrice(addon.price * addon.defaultQty)} (Standar ${addon.defaultQty}x)`
                                : formatPrice(addon.price)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Selector UI */}
                      {isSelected && !addon.disabled && (
                        <div className="mt-3 pt-3 border-t border-brand-black/10 dark:border-white/10 flex items-center justify-between">
                          <span className="text-xs font-bold dark:text-white">Jumlah:</span>
                          <div className="flex items-center gap-3 bg-brand-black/5 dark:bg-white/10 rounded-xl p-1">
                            <button
                              disabled={(selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1) <= (addon.minQty || 1)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentQty = selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1;
                                if (currentQty > (addon.minQty || 1)) {
                                  setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: currentQty - 1 } : a));
                                }
                              }}
                              className="bg-white dark:bg-brand-black text-brand-black dark:text-white p-1 rounded-lg shadow-sm hover:bg-brand-orange dark:hover:bg-brand-orange hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black w-6 text-center dark:text-white text-sm">{selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1}</span>
                            <button
                              disabled={(selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1) >= (addon.maxQty || 20)}
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentQty = selectedAddons.find(a => a.name === addon.name)?.quantity || addon.defaultQty || 1;
                                if (currentQty < (addon.maxQty || 20)) {
                                  setSelectedAddons(selectedAddons.map(a => a.name === addon.name ? { ...a, quantity: currentQty + 1 } : a));
                                }
                              }}
                              className="bg-white dark:bg-brand-black text-brand-black dark:text-white p-1 rounded-lg shadow-sm hover:bg-brand-orange dark:hover:bg-brand-orange hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  addToCart({ ...selectedItemForAddon, addons: selectedAddons });
                  closeAddonModal();
                }}
                className="w-full bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black py-4 px-6 rounded-xl font-black uppercase italic flex items-center justify-between hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  {t.addToCart}
                </div>
                <div className="text-brand-orange dark:text-brand-black/70">
                  {formatPrice(selectedItemForAddon.price + selectedAddons.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))}
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
};
