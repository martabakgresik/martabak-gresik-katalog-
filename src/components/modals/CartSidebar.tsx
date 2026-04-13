import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, ArrowUp, ShoppingBag, MapPin, Sparkles, Check, Trash2, Minus, Plus, Heart, MessageCircle
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface CartSidebarProps {
  totalItems: number;
  favorites: any[];
  cart: any[];
  processAddressWithAI: (address: string) => Promise<any>;
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
  setIsOrderConfirmationOpen: (open: boolean) => void;
  formatPrice: (price: number) => string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  totalItems,
  favorites,
  cart,
  processAddressWithAI,
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
  setIsOrderConfirmationOpen,
  formatPrice
}) => {
  const { uiState, checkoutState, storeSettings, setUiState, setCheckoutState, t } = useAppStore();
  
  const {
    isCartOpen,
    isCheckoutPhase,
    activeTab,
    isHoliday
  } = uiState;

  const {
    customerName,
    customerAddress,
    deliveryMethod,
    distance,
    promoCodeInput,
    promoMessage,
    isAiProcessing,
    isDistanceAiVerified
  } = checkoutState;

  const { maxDistance } = storeSettings;

  return (
    <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUiState({ isCartOpen: false })}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              layout
              className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-brand-yellow dark:bg-brand-black shadow-2xl z-[1000] flex flex-col border-l-4 border-brand-black dark:border-brand-yellow overflow-hidden`}
            >
              <div className="p-6 bg-brand-black text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  {isCheckoutPhase && activeTab === 'cart' && (
                    <button 
                      onClick={() => setUiState({ isCheckoutPhase: false })}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2"
                    >
                      <ArrowUp className="w-5 h-5 -rotate-90" />
                    </button>
                  )}
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">
                      {activeTab === "cart" ? (isCheckoutPhase ? t.shippingTitle : t.yourMenuTitle) : t.favoritesTitle}
                    </h3>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                      {activeTab === "cart" ? (isCheckoutPhase ? t.completeOrderData : t.selectedProducts(totalItems)) : t.savedItems(favorites.length)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUiState({ isCartOpen: false })}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Tabs */}
              {!isCheckoutPhase && (
                <div className="flex px-4 pt-4 shrink-0">
                  <button
                    onClick={() => setUiState({ activeTab: "cart" })}
                    className={`flex-1 py-3 text-xs font-black uppercase italic tracking-wider transition-all border-b-4 ${activeTab === "cart" ? "border-brand-black dark:border-brand-yellow opacity-100" : "border-transparent opacity-30"}`}
                  >
                    {t.cartTab(totalItems)}
                  </button>
                  <button
                    onClick={() => setUiState({ activeTab: "favorites" })}
                    className={`flex-1 py-3 text-xs font-black uppercase italic tracking-wider transition-all border-b-4 ${activeTab === "favorites" ? "border-brand-black dark:border-brand-yellow opacity-100" : "border-transparent opacity-30"}`}
                  >
                    {t.favoritesTab(favorites.length)}
                  </button>
                </div>
              )}

              <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-32">
                {activeTab === "cart" ? (
                  cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <ShoppingBag className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase italic">{t.emptyCart}</p>
                      <p className="text-xs mt-2">{t.pickMenu}</p>
                    </div>
                  ) : (
                    isCheckoutPhase ? (
                      <div className="space-y-6 py-2">
                        {/* Customer Details Form */}
                        <div className="space-y-3 bg-brand-black/5 dark:bg-white/10 p-5 rounded-3xl border-2 border-brand-black/5 dark:border-white/5 shadow-inner">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-5 bg-brand-orange rounded-full"></div>
                            <span className="text-xs font-black uppercase tracking-wider dark:text-brand-yellow">{t.shippingData}</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-black uppercase opacity-40 mb-1 block px-1">{t.fullName}</label>
                              <input
                                type="text"
                                placeholder="..."
                                value={customerName}
                                onChange={(e) => setCheckoutState({ customerName: e.target.value })}
                                className="w-full bg-white dark:bg-black/40 border-2 border-brand-black/10 dark:border-brand-yellow/20 rounded-2xl px-5 py-3 text-sm font-bold focus:border-brand-orange outline-none dark:text-white transition-all shadow-sm"
                              />
                            </div>
                            
                            {deliveryMethod === 'delivery' && (
                              <div className="space-y-3">
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase opacity-40 block px-1">{t.fullAddress}</label>
                                    <textarea
                                      placeholder={t.addressPlaceholder}
                                      value={customerAddress}
                                      onChange={(e) => setCheckoutState({ customerAddress: e.target.value })}
                                      rows={4}
                                      className="w-full bg-white dark:bg-black/40 border-2 border-brand-black/10 dark:border-brand-yellow/20 rounded-2xl px-5 py-3 text-sm font-bold focus:border-brand-orange outline-none dark:text-white transition-all resize-none shadow-sm"
                                    />
                                  </div>
                                  
                                  <button
                                    onClick={async () => {
                                      if (customerAddress.length < 5 || isAiProcessing) return;
                                      setCheckoutState({ isAiProcessing: true });
                                      const result = await processAddressWithAI(customerAddress);
                                      setCheckoutState({ isAiProcessing: false });
                                      
                                      if (result?.success && result.googleMapsLink) {
                                        const beautified = result.beautifiedAddress || customerAddress;
                                        setCheckoutState({ 
                                          customerAddress: `${beautified}\n\n📍 Link Lokasi (Auto-AI):\n${result.googleMapsLink}`,
                                          distance: (result.distance !== undefined && result.distance !== null) ? Number(result.distance) : distance,
                                          isDistanceAiVerified: (result.distance !== undefined && result.distance !== null)
                                        });
                                      } else if (result?.error) {
                                        alert(`❌ ${result.error}`);
                                      } else {
                                        alert(t.addressProcessFailed);
                                      }
                                    }}
                                    disabled={customerAddress.length < 5 || isAiProcessing}
                                    className="w-full bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black py-3.5 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-3 transition-all hover:bg-brand-orange hover:text-white disabled:opacity-40 disabled:grayscale shadow-lg active:scale-95"
                                  >
                                    <Sparkles className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : 'animate-pulse'}`} />
                                    {isAiProcessing ? t.aiPleaseWait : t.aiFixAddress}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery Options */}
                        <div className="space-y-4">
                          <div className="flex gap-2 p-1.5 bg-brand-black/5 dark:bg-white/10 rounded-2xl border-2 border-brand-black/5 shadow-inner">
                            <button
                              onClick={() => setCheckoutState({ deliveryMethod: 'delivery', isDistanceAiVerified: false })}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'delivery'
                                ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg scale-[1.02]'
                                : 'opacity-40 hover:opacity-100 dark:text-white'
                                }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {t.deliverToAddress}
                            </button>
                            <button
                              onClick={() => setCheckoutState({ deliveryMethod: 'pickup', isDistanceAiVerified: false })}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'pickup'
                                ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg scale-[1.02]'
                                : 'opacity-40 hover:opacity-100 dark:text-white'
                                }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              {t.pickupSelf}
                            </button>
                          </div>

                          {deliveryMethod === 'delivery' && (
                            <div className="bg-brand-black/5 dark:bg-white/10 p-5 rounded-3xl border-2 border-brand-black/5 shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-brand-yellow">{t.deliveryDistance}</span>
                                <div className="flex items-center gap-2">
                                  {isDistanceAiVerified && (
                                    <span className="text-[10px] font-black bg-brand-white/80 text-brand-black px-2 py-0.5 rounded-lg border border-brand-black/60 animate-pulse">
                                    {t.aiVerified}
                                    </span>
                                  )}
                                  <span className={`text-xs font-black px-3 py-1 rounded-full ${distance > maxDistance ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg'} ${isDistanceAiVerified && ! (distance > maxDistance) ? 'ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-brand-black animate-in zoom-in' : ''}`}>
                                    {distance} KM {distance > maxDistance && ` ${t.maxDistance}`}
                                  </span>
                                </div>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="15"
                                step="1"
                                value={distance}
                                disabled={!isDistanceAiVerified}
                                onChange={(e) => setCheckoutState({ distance: parseInt(e.target.value) })}
                                style={{ backgroundSize: `${(distance / 15) * 100}% 100%` }}
                                className={`w-full h-2.5 bg-brand-black/10 dark:bg-white/20 rounded-full appearance-none cursor-pointer accent-brand-black dark:accent-brand-yellow bg-gradient-to-r from-brand-black to-brand-black dark:from-brand-yellow dark:to-brand-yellow bg-no-repeat transition-all ${isDistanceAiVerified ? 'shadow-[0_0_15px_rgba(0,0,0,0.1)] ring-2 ring-brand-black/20 opacity-100' : 'opacity-40 grayscale cursor-not-allowed'}`}
                              />
                              {!isDistanceAiVerified && (
                                <p className="text-[10px] mt-2 font-black text-brand-black/40 dark:text-brand-yellow/40 uppercase tracking-tighter text-center">
                                  {t.enableSliderHint}
                                </p>
                              )}
                              <div className="flex justify-between mt-2 opacity-50 text-[9px] font-black tracking-widest">
                                <span>0KM</span>
                                <span>5KM</span>
                                <span>10KM</span>
                                <span>15KM</span>
                              </div>
                              {distance > 0 && distance <= maxDistance && (
                                <p className="text-[10px] mt-4 font-black text-brand-black text-center uppercase tracking-widest bg-brand-black/5 py-2 rounded-xl border border-brand-orange/20">
                                  {t.shippingEstimate}: + {formatPrice(shippingCost)}
                                </p>
                              )}
                            </div>
                          )}

                          {deliveryMethod === 'pickup' && (
                            <div className="bg-green-500/10 border-2 border-green-500/20 p-5 rounded-3xl flex items-center gap-4 shadow-sm animate-in fade-in zoom-in duration-300">
                              <div className="bg-green-500 p-3 rounded-2xl shadow-lg ring-4 ring-green-500/20">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-green-600 dark:text-green-500 uppercase tracking-wider">{t.pickupMethod}</p>
                                <p className="text-[10px] font-bold opacity-60 dark:text-white/60 mt-0.5">{t.pickupDesc}</p>
                              </div>
                            </div>
                          )}

                          {/* Promo Code Input */}
                          <div className="bg-brand-black/5 dark:bg-white/10 p-5 rounded-3xl border-2 border-brand-black/5 shadow-sm space-y-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-brand-yellow">{t.havePromoCode}</span>
                              {promoCode && (
                                <span className="text-[10px] font-black text-brand-orange uppercase animate-bounce">{t.promoApplied}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="..."
                                value={promoCodeInput}
                                onChange={(e) => setCheckoutState({ promoCodeInput: e.target.value.toUpperCase() })}
                                className="flex-grow bg-white dark:bg-black/40 border-2 border-brand-black/10 dark:border-brand-yellow/20 rounded-2xl px-5 py-3 text-xs font-bold focus:border-brand-orange outline-none dark:text-white shadow-sm"
                              />
                              <button
                                onClick={() => {
                                  const result = applyPromoCode(promoCodeInput);
                                  setCheckoutState({ promoMessage: { status: result.success ? 'success' : 'error', text: result.message } });
                                  if (!result.success) setTimeout(() => setCheckoutState({ promoMessage: null }), 3000);
                                }}
                                className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-6 py-3 rounded-2xl text-[11px] font-black uppercase hover:bg-brand-orange transition-all active:scale-95 shadow-md"
                              >
                                {t.usePromo}
                              </button>
                            </div>
                            {promoMessage && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-2 p-3 rounded-2xl text-center border-2 transition-all ${
                                  promoMessage.status === 'success' 
                                    ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                                }`}
                              >
                                <p className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                  {promoMessage.status === 'success' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                  {promoMessage.text}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        </div>

                         {/* Detailed Summary */}
                         <div className="bg-white/50 dark:bg-white/5 p-6 rounded-3xl border-t-4 border-brand-black dark:border-brand-yellow space-y-2.5">
                          <div className="flex justify-between items-center opacity-60">
                            <span className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t.subtotalItems(totalItems)}</span>
                            <span className="text-sm font-black dark:text-white">{formatPrice(totalPrice + discountAmount - shippingCost)}</span>
                          </div>
                          {deliveryMethod === 'delivery' && distance > 0 && (
                            <div className="flex justify-between items-center opacity-60">
                              <span className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t.estimatedShippingLabel}</span>
                              <span className="text-sm font-black dark:text-white">+{formatPrice(shippingCost)}</span>
                            </div>
                          )}
                          {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-brand-orange">
                              <span className="text-[11px] font-black uppercase tracking-widest italic animate-pulse">
                                {t.discountLabel} (<span className="text-brand-black dark:text-brand-yellow">{promoCode}</span>)
                              </span>
                              <span className="text-sm font-black">-{formatPrice(discountAmount)}</span>
                            </div>
                          )}
                          <div className="h-0.5 bg-brand-black/10 dark:bg-white/10 my-1"></div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-black uppercase italic tracking-wider dark:text-white">{t.finalTotal}</span>
                            <span className="text-2xl font-black text-brand-black dark:text-brand-yellow">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      cart.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-brand-black dark:border-brand-yellow/20 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-3">
                            {item.image && (
                              <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 cursor-pointer hover:ring-4 hover:ring-brand-orange/30 transition-all ring-transparent shadow-md" onClick={() => setZoomedImage({src: item.image!, alt: item.name})}>
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.style.setProperty('display', 'none'); }} />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold leading-tight dark:text-white">{item.name}</h4>
                              {item.category && <p className="text-[10px] uppercase font-bold opacity-40 dark:text-brand-yellow">{item.category}</p>}
                              {item.addons && item.addons.length > 0 && (
                                <div className="text-[10px] opacity-60 dark:text-brand-yellow/80 space-y-0.5 mt-1">
                                  {item.addons.map((addon: any, idx: number) => (
                                    <p key={idx}>+ {addon.name} ({formatPrice(addon.price)})</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-brand-orange dark:text-brand-yellow hover:bg-brand-orange/10 dark:hover:bg-brand-yellow/10 p-1 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 bg-brand-black/5 dark:bg-white/10 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="bg-white dark:bg-brand-black text-brand-black dark:text-white p-1 rounded-lg shadow-sm hover:bg-brand-orange dark:hover:bg-brand-orange hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black w-4 text-center dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="bg-white dark:bg-brand-black text-brand-black dark:text-white p-1 rounded-lg shadow-sm hover:bg-brand-orange dark:hover:bg-brand-orange hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-black text-lg dark:text-brand-yellow">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        <textarea
                          placeholder={item.category?.toLowerCase().includes('terang bulan') 
                            ? t.notePlaceholderSweet
                            : t.notePlaceholderSavory}
                          value={item.note || ""}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                          className="mt-2 w-full text-[10px] p-3 bg-brand-black/5 dark:bg-white/10 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange transition-all dark:text-white dark:placeholder:text-white/20 resize-none min-h-[60px]"
                        />
                      </div>
                    ))
                  )
                  )
                ) : (
                  favorites.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Heart className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase italic">{t.noFavorites}</p>
                      <p className="text-xs mt-2">{t.addFavoriteHint}</p>
                    </div>
                  ) : (
                    favorites.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-brand-black dark:border-brand-yellow/20 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold leading-tight dark:text-white">{item.name}</h4>
                            {item.category && <p className="text-[10px] uppercase font-bold opacity-40 dark:text-brand-yellow">{item.category}</p>}
                          </div>
                          <div className="flex items-center gap-1">

                            <button
                              onClick={() => toggleFavorite({ name: item.name, price: item.price, category: item.category })}
                              className="text-brand-orange dark:text-brand-yellow hover:bg-brand-orange/10 dark:hover:bg-brand-yellow/10 p-1 rounded-lg transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-black text-lg dark:text-brand-yellow">{formatPrice(item.price)}</span>
                          <button
                            onClick={() => handleOpenAddonModal({ name: item.name, price: item.price, category: item.category }, item.name.toLowerCase().includes('telor') ? 'savory' : 'sweet')}
                            className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-white transition-colors active:scale-95 flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3" />
                            {t.addButton}
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Sticky Bottom Actions */}
              {activeTab === "cart" && cart.length > 0 && (
                <div className="p-6 bg-white dark:bg-brand-black border-t-4 border-brand-black dark:border-brand-yellow shadow-[0_-10px_30px_rgba(0,0,0,0.1)] shrink-0 z-20">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase opacity-40 dark:text-white">{t.estimatedTotal}</span>
                      <span className="text-xl font-black dark:text-brand-yellow">{formatPrice(totalPrice)}</span>
                    </div>
                    {isCheckoutPhase && (
                      <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-center">
                        {t.includesShippingPromo}
                      </p>
                    )}
                  </div>

                  {!isCheckoutPhase ? (
                    <button
                      onClick={() => setUiState({ isCheckoutPhase: true })}
                      className="w-full py-4 rounded-2xl bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black font-black uppercase italic flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-95 group"
                    >
                      <span className="text-sm">{t.continueToPayment}</span>
                      <ArrowUp className="w-5 h-5 rotate-90 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          if (!customerName.trim()) {
                            alert(t.enterNameAlert);
                            return;
                          }
                          if (deliveryMethod === 'delivery' && !customerAddress.trim()) {
                            alert(t.enterAddressAlert);
                            return;
                          }
                          setIsOrderConfirmationOpen(true);
                        }}
                        disabled={distance > maxDistance || isHoliday}
                        className={`w-full py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all shadow-xl ${distance > maxDistance || isHoliday
                          ? 'bg-gray-400 cursor-not-allowed grayscale'
                          : 'bg-[#25D366] text-white hover:scale-[1.02] active:scale-95'
                          }`}
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm">{isHoliday ? t.holidayNow : distance > maxDistance ? t.locationTooFar : t.confirmViaWhatsApp}</span>
                      </button>
                      <p className="text-[9px] text-center opacity-40 font-bold uppercase tracking-widest">
                        {t.autoOrderHint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
  );
};
