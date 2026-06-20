import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, MapPin, Trash2, Minus, Plus, Map, Check, ChevronLeft, ShoppingCart, User, Info, Receipt
 } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { InlineMap } from "../components/cart/InlineMap";

interface CartPageProps {
  totalItems: number;
  favorites: any[];
  cart: any[];
  shippingCost: number;
  applyPromoCode: (code: string) => any;
  promoCode: string;
  discountAmount: number;
  totalPrice: number;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateNote: (id: string, note: string) => void;
  toggleFavorite: (item: any) => void;
  setZoomedImage: (img: { src: string; alt: string } | null) => void;
  handleOpenAddonModal: (item: any, type: 'sweet' | 'savory') => void;
  updateLocation: (data: { address: string; lat: number; lng: number; distance: number }) => void;
  setIsOrderConfirmationOpen: (open: boolean) => void;
  formatPrice: (price: number) => string;
}

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  shippingCost,
  applyPromoCode,
  promoCode,
  discountAmount,
  totalPrice,
  removeFromCart,
  updateQuantity,
  updateNote,
  updateLocation,
  setIsOrderConfirmationOpen,
  formatPrice,
}) => {
  const { uiState, checkoutState, storeSettings, setUiState, setCheckoutState, t } = useAppStore();
  
  const [showInlineMap, setShowInlineMap] = useState(true);
  const { isHoliday, isOpen } = uiState;
  const { customerName, customerAddress, addressNotes, coordinates, deliveryMethod, distance, promoCodeInput, promoMessage, availableCouriers, selectedCourier, isLoadingShipping } = checkoutState;
  const { maxDistance, isEmergencyClosed } = storeSettings;

  const isFormValid = customerName.trim() && (deliveryMethod === 'pickup' || (customerAddress.trim() && coordinates && (storeSettings.useShippingAPI ? selectedCourier : true)));
  const isOrderBlocked = distance > maxDistance || isHoliday || !isOpen || isEmergencyClosed;

  useEffect(() => {
    if (deliveryMethod === 'delivery' && coordinates && checkoutState.isLocationConfirmed) {
      if (storeSettings.useShippingAPI) {
        setCheckoutState({ isLoadingShipping: true });
        fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination_lat: coordinates.lat,
            destination_lng: coordinates.lng
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.couriers && data.couriers.length > 0) {
            setCheckoutState({ availableCouriers: data.couriers, selectedCourier: data.couriers[0], isLoadingShipping: false });
          } else {
            setCheckoutState({ availableCouriers: [], selectedCourier: null, isLoadingShipping: false });
          }
        })
        .catch(err => {
          console.error("Error fetching rates:", err);
          setCheckoutState({ availableCouriers: [], selectedCourier: null, isLoadingShipping: false });
        });
      } else {
        setCheckoutState({ availableCouriers: [], selectedCourier: null, isLoadingShipping: false });
      }
    }
  }, [coordinates?.lat, coordinates?.lng, deliveryMethod, checkoutState.isLocationConfirmed, storeSettings.useShippingAPI, setCheckoutState]);

  const handleBack = () => {
    setUiState({ currentView: 'catalog' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-screen bg-[#fafafa] dark:bg-brand-black pb-32 font-sans"
    >
      {/* 1. TOP HEADER */}
      <div className="sticky top-0 z-[100] bg-white/80 dark:bg-brand-black/80 backdrop-blur-xl border-b border-brand-black/5 dark:border-white/10 px-4 md:px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-brand-orange transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden md:inline">{t.backToCatalog || "Kembali Belanja"}</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-2xl font-black uppercase italic dark:text-white leading-none">
              Checkout
            </h1>
          </div>

          <div className="w-10 md:w-32" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <ShoppingBag className="w-32 h-32 mb-6" />
            <h2 className="text-3xl font-black uppercase italic text-center">Keranjang Masih Kosong</h2>
            <button 
              onClick={() => setUiState({ currentView: 'catalog' })}
              className="mt-8 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-10 py-4 rounded-full font-black uppercase italic shadow-xl hover:scale-105 transition-transform"
            >
              Kembali Belanja
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM & ITEMS */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* DELIVERY SECTION */}
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-black/5 dark:border-white/5">
                <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 border-b-2 border-brand-black/5 dark:border-white/5 pb-4">
                  <MapPin className="w-6 h-6 text-brand-orange" />
                  Informasi Pesanan
                </h2>
                
                <div className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Nama Pemesan
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCheckoutState({ customerName: e.target.value })}
                      placeholder="Masukkan nama lengkap kamu..."
                      className="w-full bg-brand-black/5 dark:bg-black/50 border border-transparent focus:border-brand-orange rounded-xl py-4 px-5 text-lg font-bold outline-none transition-all dark:text-white"
                    />
                  </div>

                  {/* Method Selection */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2 mt-6">Metode Penerimaan</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setCheckoutState({ deliveryMethod: 'delivery', isLocationConfirmed: false })}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'delivery' ? 'bg-brand-orange/10 border-brand-orange text-brand-orange shadow-sm' : 'border-brand-black/10 dark:border-white/10 opacity-60 hover:opacity-100'}`}
                      >
                        <MapPin className="w-6 h-6" />
                        <span className="font-bold text-sm">Kirim ke Alamat</span>
                      </button>
                      <button
                        onClick={() => setCheckoutState({ deliveryMethod: 'pickup', isLocationConfirmed: false })}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'pickup' ? 'bg-brand-orange/10 border-brand-orange text-brand-orange shadow-sm' : 'border-brand-black/10 dark:border-white/10 opacity-60 hover:opacity-100'}`}
                      >
                        <ShoppingBag className="w-6 h-6" />
                        <span className="font-bold text-sm">Ambil Sendiri</span>
                      </button>
                    </div>
                  </div>

                  {/* Address Section */}
                  {deliveryMethod === 'delivery' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 pt-4 border-t-2 border-brand-black/5 dark:border-white/5 overflow-hidden"
                    >
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
                          <Map className="w-4 h-4" /> Alamat Lengkap
                        </label>
                        <textarea
                          value={customerAddress}
                          onChange={(e) => setCheckoutState({ customerAddress: e.target.value })}
                          placeholder="Masukkan alamat pengiriman selengkapnya..."
                          rows={3}
                          className="w-full bg-brand-black/5 dark:bg-black/50 border border-transparent focus:border-brand-orange rounded-xl py-4 px-5 text-base font-bold outline-none transition-all dark:text-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Patokan / Catatan Alamat (Opsional)
                        </label>
                        <input
                          type="text"
                          value={addressNotes}
                          onChange={(e) => setCheckoutState({ addressNotes: e.target.value })}
                          placeholder="Cth: Rumah cat biru pagar hitam"
                          className="w-full bg-brand-black/5 dark:bg-black/50 border border-transparent focus:border-brand-orange rounded-xl py-4 px-5 text-base font-bold outline-none transition-all dark:text-white"
                        />
                      </div>

                      <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setShowInlineMap(!showInlineMap)}
                          className="w-full p-4 flex items-center justify-between font-bold text-brand-orange hover:bg-brand-orange/10 transition-colors"
                        >
                          <span className="flex items-center gap-2"><MapPin className="w-5 h-5"/> Tentukan Titik Lokasi (Wajib)</span>
                          <span className="text-xs uppercase bg-brand-orange text-white px-2 py-1 rounded-md">{showInlineMap ? 'Tutup Peta' : 'Buka Peta'}</span>
                        </button>
                        <AnimatePresence>
                          {showInlineMap && (
                            <motion.div 
                              initial={{ height: 0 }} 
                              animate={{ height: "auto" }} 
                              exit={{ height: 0 }} 
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0">
                                <InlineMap
                                  onConfirm={(data) => { updateLocation(data); setCheckoutState({ isLocationConfirmed: true }); setShowInlineMap(false); }}
                                  initialCoords={checkoutState.coordinates}
                                  initialAddress={customerAddress}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ITEMS SECTION */}
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-black/5 dark:border-white/5">
                <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3 border-b-2 border-brand-black/5 dark:border-white/5 pb-4">
                  <ShoppingCart className="w-6 h-6 text-brand-orange" />
                  Daftar Pesanan
                </h2>
                
                <div className="flex flex-col gap-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center pb-6 border-b border-brand-black/5 dark:border-white/5 last:border-0 last:pb-0">
                      
                      {/* Product Image */}
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-black/5 dark:bg-white/10 rounded-xl overflow-hidden shrink-0 hidden md:block">
                         {item.image ? (
                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag className="w-8 h-8" /></div>
                         )}
                      </div>

                      <div className="flex-1 w-full min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{item.name}</h3>
                          <span className="font-bold text-brand-orange whitespace-nowrap">
                            {formatPrice((item.price + (item.addons ? item.addons.reduce((a: any, b: any) => a + (b.price * (b.quantity || 1)), 0) : 0)) * item.quantity)}
                          </span>
                        </div>
                        
                        {/* Addons */}
                        {item.addons && item.addons.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.addons.map((addon: any, idx: number) => (
                              <div key={idx} className="bg-brand-black/5 dark:bg-white/10 px-2 py-1 rounded text-[10px] font-bold opacity-80 uppercase">
                                + {addon.name}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Note Input */}
                        <input
                          type="text"
                          placeholder="Catatan pesanan (opsional)..."
                          value={item.note || ""}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          className="w-full bg-transparent border-b border-brand-black/10 dark:border-white/10 py-1 text-sm outline-none focus:border-brand-orange transition-colors mb-4 md:mb-0 placeholder:italic"
                        />
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 bg-brand-black/5 dark:bg-white/5 p-1 rounded-xl">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-black/50 shadow-sm hover:text-brand-orange transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-black/50 shadow-sm hover:text-brand-orange transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: SUMMARY */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-brand-black/5 border border-brand-black/5 dark:border-white/5 space-y-6">
                 <h2 className="text-2xl font-black uppercase italic flex items-center gap-3 border-b-2 border-brand-black/5 dark:border-white/5 pb-4">
                   <Receipt className="w-6 h-6 text-brand-orange" />
                   Ringkasan Pembayaran
                 </h2>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm font-bold opacity-60">
                      <span>Total Harga Menu</span>
                      <span>{formatPrice(totalPrice - (deliveryMethod === 'delivery' ? shippingCost : 0) + discountAmount)}</span>
                   </div>
                   {deliveryMethod === 'delivery' && (
                     <>
                       {storeSettings.useShippingAPI ? (
                         isLoadingShipping ? (
                            <div className="flex justify-center py-2">
                               <span className="text-xs font-bold animate-pulse text-brand-orange">Menghitung ongkos kirim...</span>
                            </div>
                         ) : availableCouriers && availableCouriers.length > 0 ? (
                            <div className="space-y-2 pt-2 border-t border-brand-black/5 dark:border-white/5">
                              <label className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2">Pilih Layanan Pengiriman</label>
                              <div className="space-y-2">
                                {availableCouriers.map((c: any, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCheckoutState({ selectedCourier: c })}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedCourier?.courier_service_name === c.courier_service_name ? 'border-brand-orange bg-brand-orange/5' : 'border-transparent bg-brand-black/5 dark:bg-white/5 hover:border-brand-black/10 dark:hover:border-white/10'}`}
                                  >
                                    <div className="flex flex-col items-start text-left">
                                      <span className="font-bold text-sm">{c.courier_name}</span>
                                      <span className="text-xs opacity-60">{c.courier_service_name} • {c.duration}</span>
                                    </div>
                                    <span className="font-black text-brand-orange">{formatPrice(c.price)}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                         ) : coordinates && checkoutState.isLocationConfirmed ? (
                            <div className="text-xs text-red-500 font-bold p-3 bg-red-500/10 rounded-xl text-center">
                              Kurir tidak tersedia untuk rute ini.
                            </div>
                         ) : (
                            <div className="text-xs opacity-60 p-3 bg-brand-black/5 dark:bg-white/5 rounded-xl text-center">
                              Silakan tentukan titik lokasi pada peta terlebih dahulu untuk melihat opsi pengiriman.
                            </div>
                         )
                       ) : (
                         <div className="flex justify-between items-center text-sm font-bold opacity-60">
                           <span>Ongkos Kirim ({distance} km)</span>
                           <span>{formatPrice(shippingCost)}</span>
                         </div>
                       )}
                       <div className="mt-4 p-4 bg-brand-orange/10 dark:bg-brand-orange/20 rounded-xl flex items-start gap-3">
                         <svg className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         <div className="text-xs opacity-80 leading-relaxed space-y-2">
                           <p>
                             <strong>Transparansi Pengiriman:</strong> Biaya yang tertera merupakan estimasi tarif resmi ojek online. Pesanan Anda akan diantarkan menggunakan layanan pihak ketiga (GoSend/GrabExpress).
                           </p>
                           <p>
                             <strong>Alur Pemesanan:</strong> Setelah menekan tombol <em>"Pesan via WhatsApp"</em>, Anda akan menerima detail tagihan beserta QRIS. Segera setelah pembayaran Anda kami verifikasi, kami akan langsung memesankan kurir untuk mengirimkan hidangan selagi hangat.
                           </p>
                         </div>
                       </div>
                     </>
                   )}
                   {discountAmount > 0 && (
                     <div className="flex justify-between items-center text-sm font-bold text-green-500">
                        <span>Diskon Promo</span>
                        <span>-{formatPrice(discountAmount)}</span>
                     </div>
                   )}

                   <div className="pt-4 border-t-2 border-dashed border-brand-black/10 dark:border-white/10">
                      <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest opacity-60 text-sm">Total Bayar</span>
                        <span className="text-3xl font-black text-brand-orange">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                   </div>
                 </div>

                 {/* PROMO BOX */}
                 <div className="pt-4 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-60">Punya Kode Promo?</label>
                    <div className="flex items-center gap-2">
                       <input
                         type="text"
                         value={promoCodeInput}
                         onChange={(e) => setCheckoutState({ promoCodeInput: e.target.value.toUpperCase() })}
                         placeholder="Masukkan kode..."
                         className="flex-1 bg-brand-black/5 dark:bg-black/50 border border-transparent focus:border-brand-orange rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all dark:text-white uppercase"
                       />
                       <button
                         onClick={() => { const res = applyPromoCode(promoCodeInput); setCheckoutState({ promoMessage: { status: res.success ? 'success' : 'error', text: res.message } }); }}
                         className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all shrink-0 ${promoCode ? 'bg-green-500 text-white' : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black hover:scale-105'}`}
                       >
                         {promoCode ? 'Terpakai' : 'Pakai'}
                       </button>
                    </div>
                    {promoMessage && <p className={`text-[10px] font-bold mt-1 ${promoMessage.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>{promoMessage.text}</p>}
                 </div>

                 {/* ACTION BUTTON */}
                 <div className="pt-6">
                    <button
                      onClick={() => {
                        if (!customerName.trim()) { alert("Nama pemesan wajib diisi!"); return; }
                        if (deliveryMethod === 'delivery' && !customerAddress.trim()) { alert("Alamat pengiriman wajib diisi!"); return; }
                        if (deliveryMethod === 'delivery' && !coordinates) { alert("Tolong tentukan titik lokasi pada peta."); setShowInlineMap(true); return; }
                        if (deliveryMethod === 'delivery' && storeSettings.useShippingAPI && !selectedCourier) { alert("Pilih kurir pengiriman terlebih dahulu!"); return; }
                        setIsOrderConfirmationOpen(true);
                      }}
                      disabled={isOrderBlocked}
                      className={`w-full py-5 rounded-2xl text-white dark:text-brand-black font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-xl transition-all relative overflow-hidden ${isFormValid && !isOrderBlocked ? 'bg-brand-orange hover:bg-brand-orange/90 hover:scale-[1.02]' : 'bg-gray-400 dark:bg-gray-600 grayscale opacity-80'}`}
                    >
                      <div className="flex items-center gap-3">
                        {isEmergencyClosed ? (
                           <span>{t.emergencyClosed}</span>
                        ) : isHoliday ? (
                           <span>{t.holidayNow}</span>
                        ) : !isOpen ? (
                           <span>{t.storeClosed}</span>
                        ) : distance > maxDistance ? (
                           <span>Lokasi Terlalu Jauh</span>
                        ) : (
                           <>
                             <span className="text-xl tracking-wide">Pesan via WhatsApp</span>
                             <Check className="w-6 h-6" />
                           </>
                        )}
                      </div>
                    </button>
                    {!isFormValid && !isOrderBlocked && (
                      <p className="text-xs text-center text-red-500 font-bold mt-3">Lengkapi Nama & Alamat terlebih dahulu!</p>
                    )}
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </motion.div>
  );
};
