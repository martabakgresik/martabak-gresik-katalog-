import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Facebook, Twitter, Instagram, ExternalLink, Download, 
  MessageCircle, Copy, Check, Music2, ShoppingBag, MapPin, 
  ChevronDown 
} from "lucide-react";
import { Link } from "react-router-dom";

// Components
import { Header } from "./components/ui/Header";
import { MenuSection } from "./components/catalog/MenuSection";
import { CartModal } from "./components/cart/CartModal";
import { AddonModal } from "./components/catalog/AddonModal";
import { AiAssistant } from "./components/AiAssistant";
import { LegalPages } from "./components/LegalPages";
import { AboutMe } from "./components/AboutMe";
import { CookieConsent } from "./components/CookieConsent";
import { SEO } from "./components/SEO";
import { FAQ } from "./components/FAQ";

// Hooks & Libs
import { useCart, formatPrice, type CartItem, type Addon } from "./hooks/useCart";
import { getSearchScore } from "./lib/search";
import { 
  MENU_SWEET, MENU_SAVORY, ADDONS_SWEET, ADDONS_SAVORY,
  OPEN_HOUR, CLOSE_HOUR, PROMO_CODE, PROMO_PERCENT, 
  HOLIDAYS, SCROLL_SPACING, SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE, STORE_NAME, STORE_ADDRESS, STORE_PHONE, SINCE_YEAR
} from "./data/config";

const PROMO_TEXT = (code: string, pct: number) => `🔥 Diskon ${pct}% untuk Pembelian Pertama via Katalog! (Gunakan kode: ${code})`;

export default function App() {
  // --- STORE STATE ---
  const [menuSweet] = useState(MENU_SWEET);
  const [menuSavory] = useState(MENU_SAVORY);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [favorites, setFavorites] = useState<any[]>(() => {
    const saved = localStorage.getItem('martabak_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('martabak_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const {
    cart, distance, setDistance, addToCart, removeFromCart, updateQuantity, updateNote,
    totalItems, shippingCost, discountAmount, totalPrice, customerName, setCustomerName,
    customerAddress, setCustomerAddress, coordinates, deliveryMethod, setDeliveryMethod,
    applyPromoCode, detectLocation, sendWhatsAppOrder, processAddressWithAI
  } = useCart(SHIPPING_RATE_PER_KM, MAX_SHIPPING_DISTANCE);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGeneralShareOpen, setIsGeneralShareOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [selectedItemForAddon, setSelectedItemForAddon] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [zoomedImage, setZoomedImage] = useState<{src: string, alt: string} | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState<'tos' | 'privacy' | 'deletion' | 'about' | 'faq' | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ status: 'success' | 'error', text: string } | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ status: 'idle' });

  // Sync Theme

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Shop Status
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      setIsHoliday(HOLIDAYS.includes(dateString));
      setIsOpen(now.getHours() >= OPEN_HOUR && now.getHours() < CLOSE_HOUR && !HOLIDAYS.includes(dateString));
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // Fuzzy Search Logic
  const filteredSweet = useMemo(() => menuSweet.map(section => ({
    ...section,
    items: section.items
      .map(item => ({ item, score: getSearchScore(`${section.category} ${item.name}`, searchQuery) }))
      .filter(res => res.score >= (searchQuery ? 15 : 0))
      .sort((a, b) => b.score - a.score)
      .map(res => res.item)
  })).filter(section => section.items.length > 0), [searchQuery, menuSweet]);

  const filteredSavory = useMemo(() => menuSavory.map(section => ({
    ...section,
    variants: section.variants.map(variant => ({
      ...variant,
      prices: variant.prices
        .map(p => ({ p, score: getSearchScore(`${section.title} ${variant.type} ${p.desc || ''}`, searchQuery) }))
        .filter(res => res.score >= (searchQuery ? 15 : 0))
        .sort((a, b) => b.score - a.score)
        .map(res => res.p)
    })).filter(v => v.prices.length > 0)
  })).filter(section => section.variants.length > 0), [searchQuery, menuSavory]);

  const handleOpenAddonModal = (item: any, type: 'sweet' | 'savory') => {
    setSelectedItemForAddon({ ...item, type });
    setSelectedAddons([]);
  };

  const APP_URL = window.location.origin;
  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFavorite = (name: string, category?: string) => {
    const id = `${name}-${category || ''}`;
    return favorites.some(f => f.id === id);
  };

  const toggleFavorite = (item: any) => {
    const id = `${item.name}-${item.category || ''}`;
    setFavorites(prev => {
      if (prev.find(f => f.id === id)) return prev.filter(f => f.id !== id);
      return [...prev, { ...item, id }];
    });
  };

  // --- RENDERING ---
  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow selection:bg-brand-orange selection:text-white transition-colors duration-300">
      <SEO 
        title={selectedItemForAddon ? `${selectedItemForAddon.name} - ${STORE_NAME}` : undefined}
        description={selectedItemForAddon?.description}
        image={selectedItemForAddon?.image}
        phone={STORE_PHONE}
      />
      
      {/* Promo Banner */}
      <AnimatePresence>
        {showPromo && (
          <motion.div exit={{ y: -50 }} className="bg-brand-orange text-brand-black text-[10px] md:text-xs font-bold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
            {PROMO_TEXT(PROMO_CODE, PROMO_PERCENT)}
            <button onClick={() => setShowPromo(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        storeName={STORE_NAME} storeAddress={STORE_ADDRESS} storePhone={STORE_PHONE}
        openHour={OPEN_HOUR} closeHour={CLOSE_HOUR} isOpen={isOpen} isHoliday={isHoliday}
        isEmergencyClosed={false} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode} setIsGeneralShareOpen={setIsGeneralShareOpen}
        setCurrentView={() => {}} PROMO_TEXT={PROMO_TEXT(PROMO_CODE, PROMO_PERCENT)}
        showPromo={showPromo} setShowPromo={setShowPromo} imagesLoaded={imagesLoaded}
        handleImageLoad={(src) => setImagesLoaded(p => ({...p, [src]: true}))}
        SCROLL_SPACING={SCROLL_SPACING}
      />

      <MenuSection 
        filteredSweet={filteredSweet} filteredSavory={filteredSavory}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        onOpenAddonModal={handleOpenAddonModal} setZoomedImage={setZoomedImage}
        imagesLoaded={imagesLoaded} handleImageLoad={(src) => setImagesLoaded(p => ({...p, [src]: true}))}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className="relative p-4 bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black rounded-full shadow-2xl flex items-center justify-center border-4 border-white dark:border-brand-black"
        >
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-brand-black animate-bounce">
              {totalItems}
            </span>
          )}
        </motion.button>
      </div>

      {/* Modals & AI */}
      <CartModal 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}
        cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} updateNote={updateNote}
        totalItems={totalItems} totalPrice={totalPrice} shippingCost={shippingCost} discountAmount={discountAmount}
        deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod} customerName={customerName}
        setCustomerName={setCustomerName} customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
        distance={distance} setDistance={setDistance} promoCodeInput={promoCodeInput} setPromoCodeInput={setPromoCodeInput}
        applyPromoCode={applyPromoCode} promoMessage={promoMessage} setPromoMessage={setPromoMessage}
        detectLocation={detectLocation} locationStatus={locationStatus} setLocationStatus={setLocationStatus}
        processAddressWithAI={processAddressWithAI} isAiProcessing={isAiProcessing} setIsAiProcessing={setIsAiProcessing}
        setIsOrderConfirmationOpen={setIsOrderConfirmationOpen}
      />

      <AddonModal 
        item={selectedItemForAddon} isOpen={!!selectedItemForAddon} onClose={() => setSelectedItemForAddon(null)}
        selectedAddons={selectedAddons} setSelectedAddons={setSelectedAddons}
        onAddToCart={(item, addons) => { addToCart({...item, addons}); setSelectedItemForAddon(null); }}
        addonsList={selectedItemForAddon?.type === 'sweet' ? ADDONS_SWEET : ADDONS_SAVORY}
        isFavorite={selectedItemForAddon ? isFavorite(selectedItemForAddon.name, selectedItemForAddon.category) : false} 
        onToggleFavorite={() => selectedItemForAddon && toggleFavorite(selectedItemForAddon)} 
        onShare={() => selectedItemForAddon && handleCopyLink(`${APP_URL}/?item=${encodeURIComponent(selectedItemForAddon.name)}`)}
      />

      <AiAssistant 
        onAddToCart={addToCart} promoCode={PROMO_CODE} promoPercent={PROMO_PERCENT}
        menuSweet={menuSweet} menuSavory={menuSavory}
        storeInfo={{
          name: STORE_NAME, address: STORE_ADDRESS, phone: STORE_PHONE, since: SINCE_YEAR,
          openHour: OPEN_HOUR, closeHour: CLOSE_HOUR, shippingRate: SHIPPING_RATE_PER_KM, maxDistance: MAX_SHIPPING_DISTANCE
        }}
      />

      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMapOpen(false)} className="fixed inset-0 bg-brand-black/60 backdrop-blur-md z-[1300]" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl bg-white dark:bg-brand-black rounded-[2.5rem] border-4 border-brand-black dark:border-brand-yellow z-[1310] overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[70vh]">
              <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange rounded-xl"><MapPin className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">Lokasi Toko</h3><p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{STORE_ADDRESS}</p></div>
                </div>
                <button onClick={() => setIsMapOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <iframe title="Map" width="100%" height="100%" frameBorder="0" src={`https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS + " Martabak Gresik")}&output=embed`} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CookieConsent isVisible={showCookieConsent} onAccept={() => setShowCookieConsent(false)} onViewPrivacy={() => {}} />

      {/* Other modals (Share, Confirmation, etc) would go here or be extracted further */}
    </div>
  );
}
