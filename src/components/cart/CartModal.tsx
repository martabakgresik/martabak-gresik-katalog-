import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Trash2, Plus, Minus, X, Info, MapPin, 
  Map as MapIcon, Send, Sparkles, Check, ChevronDown, CircleSlash,
  MessageCircle, QrCode
} from "lucide-react";
import { formatPrice } from "../../hooks/useCart";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateNote: (id: string, note: string) => void;
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  discountAmount: number;
  deliveryMethod: 'delivery' | 'pickup';
  setDeliveryMethod: (method: 'delivery' | 'pickup') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  distance: number;
  setDistance: (dist: number) => void;
  promoCodeInput: string;
  setPromoCodeInput: (code: string) => void;
  applyPromoCode: (code: string) => { success: boolean, message: string };
  promoMessage: { status: 'success' | 'error', text: string } | null;
  setPromoMessage: (msg: { status: 'success' | 'error', text: string } | null) => void;
  detectLocation: () => Promise<any> | { success: boolean, message: string };
  locationStatus: { status: 'idle' | 'loading' | 'success' | 'error', message?: string };
  setLocationStatus: (status: any) => void;
  processAddressWithAI: (address: string) => Promise<any>;
  isAiProcessing: boolean;
  setIsAiProcessing: (processing: boolean) => void;
  setIsOrderConfirmationOpen: (open: boolean) => void;
}


export const CartModal: React.FC<CartModalProps> = ({
  isOpen, onClose, cart, removeFromCart, updateQuantity, updateNote,
  totalItems, totalPrice, shippingCost, discountAmount, deliveryMethod, setDeliveryMethod,
  customerName, setCustomerName, customerAddress, setCustomerAddress, distance, setDistance,
  promoCodeInput, setPromoCodeInput, applyPromoCode, promoMessage, setPromoMessage,
  detectLocation, locationStatus, setLocationStatus, processAddressWithAI, 
  isAiProcessing, setIsAiProcessing, setIsOrderConfirmationOpen
}) => {
  if (!isOpen) return null;

  const handleApplyPromo = () => {
    const res = applyPromoCode(promoCodeInput);
    setPromoMessage({ status: res.success ? 'success' : 'error', text: res.message });
  };

  const handleProcessAddress = async () => {
    setIsAiProcessing(true);
    const result = await processAddressWithAI(customerAddress);
    setIsAiProcessing(false);
    
    if (result.success) {
      if (result.beautifiedAddress) setCustomerAddress(result.beautifiedAddress);
      if (result.distance) setDistance(result.distance);
    } else {
      alert(result.error || "Gagal memproses alamat");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-brand-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-brand-black w-full max-w-xl max-h-[90dvh] rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-brand-black dark:border-brand-yellow flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-yellow p-2 rounded-2xl">
              <ShoppingBag className="w-5 h-5 text-brand-black" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Keranjang Anda</h2>
              <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{totalItems} Item terpilih</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 bg-brand-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <CircleSlash className="w-12 h-12 opacity-20" />
              </div>
              <p className="text-lg font-bold opacity-40 uppercase tracking-widest">Keranjang masih kosong</p>
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-full font-black uppercase text-xs"
              >
                Cari Menu Lezat
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="group bg-brand-black/5 dark:bg-white/5 p-4 rounded-3xl border border-transparent hover:border-brand-orange/20 transition-all">
                    <div className="flex gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm dark:text-white leading-tight">{item.name}</h4>
                            {item.category && <p className="text-[9px] font-black uppercase text-brand-orange mt-0.5">{item.category}</p>}
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500 opacity-20 group-hover:opacity-100 hover:bg-red-500/10 p-1.5 rounded-full transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {item.addons && item.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                             {item.addons.map((a: any) => (
                               <span key={a.name} className="bg-brand-orange/10 text-brand-orange text-[8px] font-black px-2 py-0.5 rounded-md uppercase border border-brand-orange/20">
                                 +{a.name} {a.quantity > 1 ? `(${a.quantity}x)` : ''}
                               </span>
                             ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center gap-1 bg-white dark:bg-brand-black rounded-xl p-1 shadow-inner border border-brand-black/5">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-brand-orange/10 rounded-lg text-brand-orange"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-brand-orange/10 rounded-lg text-brand-orange"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <p className="font-black dark:text-brand-yellow text-sm">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Settings */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-brand-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-black uppercase text-[10px] tracking-widest opacity-60">Metode Pengiriman</h3>
                  <div className="flex bg-brand-black/5 dark:bg-white/5 p-1 rounded-2xl border border-brand-black/10">
                    <button 
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${deliveryMethod === 'delivery' ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-md' : 'opacity-40'}`}
                    >
                      Kirim (Delivery)
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${deliveryMethod === 'pickup' ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-md' : 'opacity-40'}`}
                    >
                      Ambil Sendiri
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1.5 block">Alamat Pengiriman (Pastikan ada No. Rumah)</label>
                      <div className="flex gap-2">
                        <textarea 
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Contoh: Jl. Usman Sadar No. 10, Gresik..."
                          className="flex-grow bg-brand-black/5 dark:bg-white/5 p-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-brand-orange border border-brand-black/5 h-16 resize-none"
                        />
                        <button 
                          onClick={handleProcessAddress}
                          disabled={isAiProcessing || !customerAddress}
                          className="flex flex-col items-center justify-center gap-1 px-4 bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white rounded-2xl transition-all disabled:opacity-30 border border-brand-orange/20"
                        >
                          {isAiProcessing ? <Sparkles className="w-5 h-5 animate-spin" /> : <MapIcon className="w-5 h-5" />}
                          <span className="text-[7px] font-black uppercase">Verifikasi AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-6 md:p-8 bg-brand-yellow dark:bg-brand-yellow/10 border-t-4 border-brand-black dark:border-brand-yellow shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[10px] font-bold opacity-60">
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice - shippingCost + discountAmount)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-brand-orange">
                  <span>Ongkir ({distance}km)</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-green-600">
                  <span>Diskon Promo</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-black uppercase border-t border-brand-black/10 pt-2">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOrderConfirmationOpen(true)}
              className="w-full bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black py-4 rounded-3xl font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Pesan via WhatsApp
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
