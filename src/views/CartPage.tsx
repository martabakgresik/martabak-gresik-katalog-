import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, MapPin, Trash2, Minus, Plus, Heart, Map, ArrowLeft, Check, ChevronLeft, ShoppingCart
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
  totalItems,
  favorites,
  cart,
  shippingCost,
  applyPromoCode,
  promoCode,
  discountAmount,
  totalPrice,
  removeFromCart,
  updateQuantity,
  updateNote,
  toggleFavorite,
  setZoomedImage,
  handleOpenAddonModal,
  updateLocation,
  setIsOrderConfirmationOpen,
  formatPrice,
}) => {
  const { uiState, checkoutState, storeSettings, setUiState, setCheckoutState, t } = useAppStore();
  
  const [showInlineMap, setShowInlineMap] = useState(true);
  const { isCheckoutPhase, isHoliday, isOpen } = uiState;
  const { customerName, customerAddress, addressNotes, coordinates, deliveryMethod, distance, promoCodeInput, promoMessage } = checkoutState;
  const { maxDistance, isEmergencyClosed } = storeSettings;

  const isFormValid = customerName.trim() && (deliveryMethod === 'pickup' || (customerAddress.trim() && coordinates));
  const isOrderBlocked = distance > maxDistance || isHoliday || !isOpen || isEmergencyClosed;

  const handleBack = () => {
    if (isCheckoutPhase) {
      setUiState({ isCheckoutPhase: false });
    } else {
      setUiState({ currentView: 'catalog' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full min-h-screen bg-[#fafafa] dark:bg-brand-black pb-32"
    >
      {/* 1. TOP HEADER (Simple & Clean) */}
      <div className="sticky top-0 z-[100] bg-white/80 dark:bg-brand-black/80 backdrop-blur-xl border-b border-brand-black/5 dark:border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-brand-orange transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {isCheckoutPhase ? t.back : t.backToCatalog || "Kembali Belanja"}
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-black uppercase italic dark:text-white leading-none">
              {isCheckoutPhase ? t.completeOrderData : t.yourMenuTitle}
            </h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1 dark:text-brand-yellow">
              {t.orderSteps(isCheckoutPhase ? 2 : 1)}
            </p>
          </div>

          <div className="w-20" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <ShoppingBag className="w-32 h-32 mb-6" />
            <h2 className="text-3xl font-black uppercase italic">{t.emptyCart}</h2>
            <button 
              onClick={() => setUiState({ currentView: 'catalog' })}
              className="mt-8 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-10 py-4 rounded-full font-black uppercase italic shadow-xl"
            >
              {t.backShop}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT COLUMN: LIST / FORM */}
            <div className="lg:col-span-7 space-y-8">
              <AnimatePresence mode="wait">
                {!isCheckoutPhase ? (
                  /* PHASE 1: ITEM REVIEW */
                  <motion.div
                    key="cart-items"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6 md:gap-10"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                         <ShoppingCart className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-black uppercase italic">{t.waOrderList}</h2>
                    </div>

                    {cart.map((item) => (
                      <div key={item.id} className="group relative flex flex-col md:flex-row gap-6 md:gap-10 items-start pb-10 border-b border-brand-black/5 dark:border-white/5 last:border-0 last:pb-0">
                        {/* 1. PRODUCT IMAGE */}
                        <div className="relative w-full md:w-40 aspect-square rounded-[2rem] overflow-hidden bg-white dark:bg-white/5 border border-brand-black/5 shadow-sm shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                              <ShoppingCart className="w-12 h-12" />
                            </div>
                          )}
                        </div>

                        {/* 2. PRODUCT INFO & ACTIONS */}
                        <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 w-full">
                           {/* Content Col */}
                           <div className="flex-1 min-w-0 space-y-4">
                             <div className="space-y-1">
                                <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter dark:text-white leading-[1.1] line-clamp-2">
                                  {item.name}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange/60">
                                  {item.category || "Menu Pilihan"}
                                </p>
                             </div>

                             {/* Addons */}
                             {item.addons && item.addons.length > 0 && (
                               <div className="flex flex-wrap gap-1.5">
                                 {item.addons.map((addon, idx) => (
                                   <div key={idx} className="flex items-center gap-1.5 bg-brand-black/[0.03] dark:bg-white/5 border border-brand-black/5 px-2 py-0.5 rounded-md">
                                     <div className="w-1 h-1 bg-brand-orange rounded-full" />
                                     <span className="text-[8px] font-black uppercase tracking-wider text-brand-black/50 dark:text-white/50">
                                       {addon.name}
                                     </span>
                                   </div>
                                 ))}
                               </div>
                             )}

                             {/* Note */}
                             <div className="flex items-center gap-2 group/note border-b border-transparent focus-within:border-brand-orange transition-all max-w-sm">
                                <Plus className="w-3 h-3 text-brand-black/20" />
                                <input
                                  type="text"
                                  placeholder={item.category?.toLowerCase().includes('asin') || item.category?.toLowerCase().includes('savory') ? t.notePlaceholderSavory : t.notePlaceholderSweet}
                                  value={item.note || ""}
                                  onChange={(e) => updateNote(item.id, e.target.value)}
                                  className="flex-1 bg-transparent py-1 text-[11px] font-bold outline-none placeholder:italic placeholder:opacity-30 dark:text-white"
                                />
                             </div>
                           </div>

                           {/* Actions Col */}
                           <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-6 w-full md:w-auto md:min-w-[160px] pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-brand-black/5 dark:border-white/5 md:pl-10">
                              <div className="flex flex-col items-start md:items-end">
                                 <button 
                                   onClick={() => removeFromCart(item.id)} 
                                   className="hidden md:flex p-2 text-red-500/20 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all mb-4"
                                 >
                                   <Trash2 className="w-5 h-5" />
                                 </button>
                                 <span className="text-2xl md:text-3xl font-black tracking-tighter dark:text-brand-yellow">
                                    {formatPrice((item.price + (item.addons ? item.addons.reduce((a, b) => a + (b.price * (b.quantity || 1)), 0) : 0)) * item.quantity)}
                                 </span>
                              </div>

                              <div className="flex items-center gap-1 bg-brand-black/[0.03] dark:bg-black/40 p-1.5 rounded-2xl border border-brand-black/5">
                                 <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-brand-yellow hover:shadow-sm dark:hover:text-brand-black transition-all active:scale-90">
                                    <Minus className="w-3.5 h-3.5" />
                                 </button>
                                 <span className="w-8 text-center font-black text-sm md:text-lg dark:text-white">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-brand-yellow hover:shadow-sm dark:hover:text-brand-black transition-all active:scale-90">
                                    <Plus className="w-3.5 h-3.5" />
                                 </button>
                              </div>

                              <button 
                                onClick={() => removeFromCart(item.id)} 
                                className="md:hidden p-3 text-red-500 bg-red-500/10 rounded-xl"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  /* PHASE 2: CHECKOUT INFO (Polished & Balanced) */
                  <motion.div
                    key="checkout-info"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-16"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-brand-black dark:bg-brand-yellow rounded-[1.25rem] flex items-center justify-center text-white dark:text-brand-black shadow-xl -rotate-3 shrink-0">
                         <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black uppercase italic leading-none">{t.shippingData}</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mt-2">{t.waCustomerData.replace(/\W/g, '')}</p>
                      </div>
                    </div>

                    <div className="space-y-12">
                      {/* Name SECTION */}
                      <div className="group relative">
                        <label className="absolute -top-3 left-0 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                          {t.fullName}
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          autoFocus={isCheckoutPhase}
                          onChange={(e) => setCheckoutState({ customerName: e.target.value })}
                          placeholder="Siapa nama lengkap kamu?"
                          className="w-full bg-transparent border-b-2 border-brand-black/10 dark:border-white/10 py-5 text-lg md:text-2xl font-black focus:border-brand-orange outline-none dark:text-white transition-all placeholder:opacity-20 uppercase tracking-tighter"
                        />
                      </div>

                      {/* METHOD SELECT */}
                      <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 block text-center">
                          — Pilih Metode —
                        </label>
                        <div className="grid grid-cols-2 gap-6">
                          <button
                            onClick={() => setCheckoutState({ deliveryMethod: 'delivery', isLocationConfirmed: false })}
                            className={`flex flex-col items-center text-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${deliveryMethod === 'delivery' ? 'bg-brand-black border-brand-black text-white dark:bg-brand-yellow dark:text-brand-black shadow-2xl scale-[1.02]' : 'border-brand-black/5 opacity-40 hover:bg-brand-black/5'}`}
                          >
                            <div className="p-3 bg-brand-orange/10 rounded-2xl">
                              <MapPin className="w-6 h-6 text-brand-orange" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{t.deliverToAddress}</span>
                          </button>
                          <button
                            onClick={() => setCheckoutState({ deliveryMethod: 'pickup', isLocationConfirmed: false })}
                            className={`flex flex-col items-center text-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${deliveryMethod === 'pickup' ? 'bg-brand-black border-brand-black text-white dark:bg-brand-yellow dark:text-brand-black shadow-2xl scale-[1.02]' : 'border-brand-black/5 opacity-40 hover:bg-brand-black/5'}`}
                          >
                            <div className="p-3 bg-brand-orange/10 rounded-2xl">
                              <ShoppingBag className="w-6 h-6 text-brand-orange" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">{t.pickupSelf}</span>
                          </button>
                        </div>
                      </div>

                      {deliveryMethod === 'delivery' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
                          <div className="group relative">
                            <label className="absolute -top-3 left-0 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                              {t.fullAddress}
                            </label>
                            <textarea
                              value={customerAddress}
                              onChange={(e) => setCheckoutState({ customerAddress: e.target.value })}
                              placeholder={t.addressPlaceholder}
                              rows={2}
                              className="w-full bg-transparent border-b-2 border-brand-black/10 dark:border-white/10 py-5 text-base md:text-xl font-black focus:border-brand-orange outline-none dark:text-white resize-none transition-all placeholder:opacity-20 uppercase tracking-tight"
                            />
                          </div>

                          {/* LANDMARK / PATOKAN (New Optional Field) */}
                          <div className="group relative">
                            <label className="absolute -top-3 left-0 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange/60">
                              {t.addressNotesLabel}
                            </label>
                            <input
                              type="text"
                              value={addressNotes}
                              onChange={(e) => setCheckoutState({ addressNotes: e.target.value })}
                              placeholder={t.addressNotesPlaceholder}
                              className="w-full bg-transparent border-b-2 border-brand-black/10 dark:border-white/10 py-5 text-sm md:text-lg font-black focus:border-brand-orange outline-none dark:text-white transition-all placeholder:opacity-20 uppercase tracking-tight"
                            />
                          </div>

                          <div className="space-y-4">
                            <button
                              onClick={() => setShowInlineMap(!showInlineMap)}
                              className={`w-full py-6 rounded-[1.5rem] border-2 transition-all flex items-center justify-center gap-4 ${showInlineMap ? 'bg-brand-black/5 dark:bg-white/5 border-transparent text-brand-black dark:text-white' : 'border-brand-black/5 dark:border-white/5 text-brand-black/60 dark:text-white/60 hover:bg-brand-black hover:text-white'}`}
                            >
                              <Map className="w-5 h-5" />
                              <span className="font-black uppercase text-[10px] tracking-[0.3em]">{showInlineMap ? t.closeMapButton : t.openMapButton}</span>
                            </button>

                            <AnimatePresence>
                              {showInlineMap && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }} 
                                  animate={{ height: "auto", opacity: 1 }} 
                                  exit={{ height: 0, opacity: 0 }} 
                                  className="mt-12 mb-12"
                                >
                                  <InlineMap
                                    onConfirm={(data) => { updateLocation(data); setCheckoutState({ isLocationConfirmed: true }); setShowInlineMap(false); }}
                                    initialCoords={checkoutState.coordinates}
                                    initialAddress={customerAddress}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT COLUMN: RINGKASAN (Polished & Balanced) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 py-10 lg:py-0">
              <div className="bg-white dark:bg-black/20 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-brand-black/5 dark:border-white/5 shadow-2xl shadow-brand-black/5 space-y-8 md:space-y-12">
                 <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t.orderSummary}</h2>
                    <div className="h-1 w-12 bg-brand-orange rounded-full" />
                 </div>
                 
                 <div className="space-y-6">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                      <span>{t.menuSubtotal}</span>
                      <span className="dark:text-white tabular-nums">{formatPrice(totalPrice - (deliveryMethod === 'delivery' ? shippingCost : 0) + discountAmount)}</span>
                   </div>
                   {deliveryMethod === 'delivery' && (
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                        <div className="flex items-center gap-2">
                           <span>{t.shippingFee}</span>
                           <span className="bg-brand-black/5 px-2 py-0.5 rounded text-[8px]">{distance.toFixed(1)}km</span>
                        </div>
                        <span className="dark:text-white tabular-nums">{formatPrice(shippingCost)}</span>
                     </div>
                   )}
                   {discountAmount > 0 && (
                     <div className="flex justify-between items-center text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">
                        <span>{t.promoDiscount}</span>
                        <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                     </div>
                   )}

                   <div className="pt-10 flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-20">{t.estimatedTotalLabel}</span>
                      <div className="flex items-end justify-between">
                        <span className="text-5xl md:text-6xl font-black dark:text-brand-yellow tracking-tighter leading-none tabular-nums">
                          {formatPrice(totalPrice).replace("Rp ", "")}
                          <span className="text-lg md:text-xl font-black opacity-20 ml-2">IDR</span>
                        </span>
                      </div>
                   </div>
                 </div>

                 {/* PROMO BOX (Refined) */}
                 <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-1">{t.havePromoCode}</label>
                    <div className="flex items-center gap-2 bg-brand-black/[0.03] dark:bg-white/5 p-1.5 md:p-2 rounded-2xl border border-brand-black/5 focus-within:border-brand-orange transition-all">
                       <input
                         type="text"
                         value={promoCodeInput}
                         onChange={(e) => setCheckoutState({ promoCodeInput: e.target.value.toUpperCase() })}
                         placeholder="KODE?"
                         className="flex-1 bg-transparent border-none outline-none text-[11px] md:text-xs font-black dark:text-white placeholder:opacity-20 uppercase tracking-widest px-3 md:px-4 min-w-0"
                       />
                       <button
                         onClick={() => { const res = applyPromoCode(promoCodeInput); setCheckoutState({ promoMessage: { status: res.success ? 'success' : 'error', text: res.message } }); }}
                         className={`px-5 md:px-8 py-3 md:py-4 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shrink-0 ${promoCode ? 'bg-green-500 text-white' : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg'}`}
                       >
                         {promoCode ? t.promoApplied : t.usePromo}
                       </button>
                    </div>
                    {promoMessage && <p className={`text-[10px] font-black uppercase text-center tracking-widest ${promoMessage.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>{promoMessage.text}</p>}
                 </div>

                 {/* ACTION BUTTON */}
                 <div className="pt-4 space-y-6">
                    {!isCheckoutPhase ? (
                      <button
                        onClick={() => {
                          setUiState({ isCheckoutPhase: true });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-8 rounded-[2rem] bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black font-black uppercase italic flex items-center justify-center gap-6 shadow-2xl shadow-brand-orange/20 hover:bg-brand-orange hover:text-white transition-all group"
                      >
                         <span className="text-xl tracking-tighter font-display">{t.continuePayment}</span>
                         <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!customerName.trim()) { alert(t.enterNameAlert); return; }
                          if (deliveryMethod === 'delivery' && !customerAddress.trim()) { alert(t.enterAddressAlert); return; }
                          if (deliveryMethod === 'delivery' && !coordinates) { alert(t.gpsError); setShowInlineMap(true); return; }
                          setIsOrderConfirmationOpen(true);
                        }}
                        disabled={isOrderBlocked}
                        className={`w-full py-8 rounded-[2rem] text-white dark:text-brand-black font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-2xl shadow-brand-orange/20 transition-all relative overflow-hidden ${isFormValid && !isOrderBlocked ? 'bg-brand-black dark:bg-brand-yellow hover:bg-brand-orange hover:text-white' : 'bg-gray-400 dark:bg-gray-600 grayscale opacity-80'}`}
                      >
                        <div className="flex items-center gap-4">
                          {isEmergencyClosed ? (
                             <span className="text-lg uppercase tracking-tighter">{t.emergencyClosed}</span>
                          ) : isHoliday ? (
                             <span className="text-lg uppercase tracking-tighter">{t.holidayNow}</span>
                          ) : !isOpen ? (
                             <span className="text-lg uppercase tracking-tighter">{t.storeClosed}</span>
                          ) : distance > maxDistance ? (
                             <span className="text-lg uppercase tracking-tighter">{t.locationTooFar}</span>
                          ) : (
                             <>
                               <span className="text-xl tracking-tighter font-display">{t.orderConfirmationButton}</span>
                               <Check className="w-6 h-6" />
                             </>
                          )}
                        </div>
                        {!isFormValid && !isOrderBlocked && (
                          <span className="text-[10px] font-bold opacity-40 leading-none uppercase tracking-[0.2em]">{t.orderDataRequired}</span>
                        )}
                      </button>
                    )}
                    <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest italic">{t.autoOrderHint}</p>
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </motion.div>
  );
};
