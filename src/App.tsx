import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart, type CartItem, type Addon, formatPrice } from "./hooks/useCart";
import { 
  getMenuSweet, 
  getMenuSavory, 
  ADDONS_SWEET, 
  ADDONS_SAVORY,
  OPEN_HOUR, 
  CLOSE_HOUR, 
  PROMO_CODE, 
  PROMO_PERCENT, 
  HOLIDAYS, 
  SCROLL_SPACING,
  SHIPPING_RATE_PER_KM,
  MAX_SHIPPING_DISTANCE,
  STORE_NAME,
  STORE_ADDRESS,
  STORE_PHONE
} from "./data/config";
import { AiAssistant } from "./components/AiAssistant";
import { LegalPages } from "./components/LegalPages";
import { AboutMe } from "./components/AboutMe";
import { CookieConsent } from "./components/CookieConsent";
import { BlogView } from "./components/BlogView";
import { SEO } from "./components/SEO";
import { FAQ } from "./components/FAQ";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FloatingActions } from "./components/layout/FloatingActions";
import { MenuCatalog } from "./components/menu/MenuCatalog";
import { CartPage } from "./views/CartPage";
import { CartNotification } from "./components/cart/CartNotification";
import { AddonModal } from "./components/modals/AddonModal";
import { ModalsContainer } from "./components/modals/ModalsContainer";
import { useAppStore } from "./store/useAppStore";
import { UI_COPY } from "./data/i18n/appCopy";
import { SEO_COPY } from "./data/i18n/seoCopy";

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- ZUSTAND STORE ---
  const { 
    uiState, 
    storeSettings, 
    setUiState, 
    toggleDarkMode, 
    setCurrentView,
    setSearchQuery,
    t 
  } = useAppStore();

  const {
    uiLang,
    currentView,
    isDarkMode,
    activeTab,
    showPromo,
    showBackToTop,
    isOpen,
    isHoliday,
    isCheckoutPhase,
    showCookieConsent,
    searchQuery,
    isSearchOpen,
    copied
  } = uiState;

  const {
    storeName,
    storeAddress,
    storePhone,
    openHour,
    closeHour,
    activePromoCode,
    activePromoPercent,
    shippingRate,
    maxDistance,
    holidays,
    isEmergencyClosed
  } = storeSettings;

  const menuSweet = useMemo(() => getMenuSweet(t), [t]);
  const menuSavory = useMemo(() => getMenuSavory(t), [t]);

  const {
    cart,
    distance,
    setDistance,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNote,
    totalItems,
    shippingCost,
    discountAmount,
    totalPrice,
    promoCode,
    customerName,
    setCustomerName,
    customerAddress,
    setCustomerAddress,
    coordinates,
    deliveryMethod,
    setDeliveryMethod,
    applyPromoCode,
    detectLocation,
    sendWhatsAppOrder,
    updateLocation
  } = useCart(shippingRate, maxDistance);

  // --- LOCAL UI STATE (Specific to App view) ---
  const [locationStatus, setLocationStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ status: 'idle' });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  
  const [promoMessage, setPromoMessage] = useState<{ status: 'success' | 'error', text: string } | null>(null);
  const [lastItemAdded, setLastItemAdded] = useState<string | null>(null);

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setLastItemAdded(item.name);
    // Reset after some time so the next add triggers the notification again if it's the same item
    setTimeout(() => setLastItemAdded(null), 100);
  };

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('martabak_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Legal & Privacy Logic

  // Legal & Privacy Logic
  useEffect(() => {
    const consent = localStorage.getItem('martabak_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setUiState({ showCookieConsent: true }), 2000);
      return () => clearTimeout(timer);
    }
  }, [setUiState]);

  const handleAcceptCookies = () => {
    localStorage.setItem('martabak_cookie_consent', 'accepted');
    setUiState({ showCookieConsent: false });
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const hour = now.getHours();

      const holidayFound = holidays.includes(dateString);
      setUiState({ 
        isHoliday: holidayFound,
        isOpen: !holidayFound && !isEmergencyClosed && (hour >= openHour && hour < closeHour)
      });
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Re-check every minute
    return () => clearInterval(timer);
  }, [holidays, isEmergencyClosed, openHour, closeHour, setUiState]);

  // Add-ons modal state
  const [selectedItemForAddon, setSelectedItemForAddon] = useState<(Omit<CartItem, 'id' | 'quantity' | 'addons'> & { type: 'sweet' | 'savory' }) | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const closeAddonModal = () => {
    const params = new URLSearchParams(location.search);
    params.delete('item');
    const newSearch = params.toString();
    navigate({ search: newSearch ? `?${newSearch}` : '' }, { replace: true });
    setSelectedItemForAddon(null);
  };

  // Deep Linking Effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemName = params.get('item');
    const pathname = window.location.pathname;

    if (pathname.startsWith('/blog')) {
      setCurrentView('blog');
      return;
    }
    if (pathname === '/about') { setCurrentView('about'); return; }
    if (pathname === '/faq') { setCurrentView('faq'); return; }
    if (pathname === '/terms') { setCurrentView('terms'); return; }
    if (pathname === '/privacy') { setCurrentView('privacy'); return; }
    if (pathname === '/deletion') { setCurrentView('deletion'); return; }
    if (pathname === '/app-download') { setCurrentView('app-download'); return; }

    if (itemName && !selectedItemForAddon) {
      // Find item in sweet menu
      if (Array.isArray(menuSweet)) {
        for (const section of menuSweet) {
          if (!section?.items) continue;
          const item = section.items.find(i => (i?.name || "").toLowerCase() === itemName.toLowerCase());
          if (item) {
            setSelectedItemForAddon({ ...item, type: 'sweet', category: section.category });
            return;
          }
        }
      }
      // Find item in savory menu
      if (Array.isArray(menuSavory)) {
        for (const section of menuSavory) {
          if (!section?.variants) continue;
          const variant = section.variants.find(v => (section.title + " " + v.type).toLowerCase() === itemName.toLowerCase() || (v?.type || "").toLowerCase() === itemName.toLowerCase());
          if (variant) {
            // Find first price for default
            const priceObj = variant.prices?.[0];
            if (priceObj) {
              setSelectedItemForAddon({ 
                name: `${section.title} ${variant.type}`, 
                price: priceObj.price, 
                image: priceObj.image || "", 
                description: variant.description || "",
                type: 'savory',
                category: section.title
              });
              return;
            }
          }
        }
      }
    }
  }, [menuSweet, menuSavory, selectedItemForAddon, location.pathname, location.search]);

  // Sync URL with Selected Item
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentItem = params.get('item');
    
    if (selectedItemForAddon && selectedItemForAddon.name !== currentItem) {
      params.set('item', selectedItemForAddon.name);
      navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    } else if (!selectedItemForAddon && currentItem) {
      params.delete('item');
      navigate({ search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
    }
  }, [selectedItemForAddon, location.search, navigate]);
  // Image loading state
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const handleImageLoad = (src: string) => {
    setImagesLoaded(prev => ({ ...prev, [src]: true }));
  };

  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const handleScroll = () => {
      setUiState({ showBackToTop: window.scrollY > 400 });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setUiState]);

  useEffect(() => {
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#000000');
    } else {
      document.documentElement.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#1E1E1E');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (currentView === 'blog') {
      document.body.style.overflow = 'unset';
    }
  }, [currentView]);


  const APP_URL = window.location.origin;

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setUiState({ copied: true });
    setTimeout(() => setUiState({ copied: false }), 2000);
  };

  const shareToWhatsApp = (item: { name: string; price: number; category?: string }) => {
    const message = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${item.name}*\n${item.category ? `(${item.category})\n` : ""}Harga: *${formatPrice(item.price)}*\n\nCek katalog lengkapnya di sini: ${window.location.origin}`;
    const encodedMessage = encodeURIComponent(message);
    const phone = storePhone.replace(/\D/g, '');
    const waPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
    window.open(`https://wa.me/${waPhone}?text=${encodedMessage}`, "_blank");
  };

  const shareGeneral = async (platform: string) => {
    const text = `Cek Martabak Gresik - ${t.heroSubtitle} Terenak!`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Martabak Gresik", text, url });
        return;
      } catch (err) {}
    }

    let shareUrl = "";
    switch (platform) {
      case "facebook": shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case "twitter": shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case "threads": shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`; break;
      default: handleCopyLink(url); return;
    }
    window.open(shareUrl, "_blank");
  };

  const handleOpenAddonModal = (item: Omit<CartItem, 'id' | 'quantity' | 'addons'>, type: 'sweet' | 'savory') => {
    setSelectedItemForAddon({ ...item, type });
    setSelectedAddons([]);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'id'>) => {
    const id = `${item.name}-${item.category || ''}`;
    setFavorites(prev => {
      const existing = prev.find(f => f.id === id);
      if (existing) {
        return prev.filter(f => f.id !== id);
      }
      return [...prev, { ...item, id }];
    });
  };

  const isFavorite = (name: string, category?: string) => {
    const id = `${name}-${category || ''}`;
    return favorites.some(f => f.id === id);
  };

  const totalFavorites = favorites.length;

  const filteredSweet = useMemo(() => (menuSweet || []).map(section => ({
    ...section,
    items: (section?.items || []).filter(item =>
      (item?.name || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (section?.category || "").toLowerCase().includes((searchQuery || "").toLowerCase())
    )
  })).filter(section => (section?.items || []).length > 0), [searchQuery, menuSweet]);

  const filteredSavory = useMemo(() => (menuSavory || []).map(section => ({
    ...section,
    variants: (section?.variants || []).map(variant => ({
      ...variant,
      prices: (variant?.prices || []).filter(p =>
        `${section?.title || ""} ${variant?.type || ""} ${p?.desc || (p?.qty ? `${p.qty} Telor` : "")} ${typeof formatPrice === 'function' && p?.price !== undefined ? formatPrice(p.price) : ""}`.toLowerCase().includes((searchQuery || "").toLowerCase())
      )
    })).filter(v => (v?.prices || []).length > 0)
  })).filter(section => (section?.variants || []).length > 0), [searchQuery, menuSavory]);

  const isPromoScheduledActive = useMemo(() => {
    if (isHoliday || isEmergencyClosed) return false;
    if (!storeSettings.promoStartAt && !storeSettings.promoEndAt) return true;
    const now = new Date();
    const start = storeSettings.promoStartAt ? new Date(storeSettings.promoStartAt) : null;
    const end = storeSettings.promoEndAt ? new Date(storeSettings.promoEndAt) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [storeSettings.promoStartAt, storeSettings.promoEndAt, isHoliday, isEmergencyClosed]);

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow selection:bg-brand-orange selection:text-white transition-colors duration-300">
      <SEO 
        title={selectedItemForAddon?.name ? `${selectedItemForAddon.name} - Martabak Gresik` : t?.heroSubtitle || storeName}
        description={selectedItemForAddon?.description || t?.footerDescription || storeAddress}
        image={selectedItemForAddon?.image || "/metaseo.webp"}
        url={selectedItemForAddon?.name ? `${window.location.origin}/?item=${encodeURIComponent(selectedItemForAddon.name)}` : window.location.origin}
        price={selectedItemForAddon?.price}
        category={selectedItemForAddon?.category}
        phone={storePhone || "6281330763633"}
        noindex={false}
      />
      <Header 
        imagesLoaded={imagesLoaded}
        handleImageLoad={handleImageLoad}
        searchInputRef={searchInputRef}
      />

      {/* Main Content */}
      <div className="relative flex-grow">
        <AnimatePresence mode="wait">
          {(currentView === 'catalog' || !['blog', 'about', 'faq', 'terms', 'privacy', 'deletion', 'cart', 'app-download'].includes(currentView)) && (
            <MenuCatalog 
              key="catalog"
              filteredSweet={filteredSweet}
              filteredSavory={filteredSavory}
              imagesLoaded={imagesLoaded}
              handleImageLoad={handleImageLoad}
              setZoomedImage={(img) => setUiState({ zoomedImage: img })}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              handleOpenAddonModal={handleOpenAddonModal}
              formatPrice={formatPrice}
            />
          )}

          {currentView === 'blog' && (
            <motion.div 
              key="blog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full min-h-screen pt-28 pb-12"
            >
               <BlogView 
                 isMainPage={true} 
                 onClose={() => { 
                   setCurrentView('catalog');
                   navigate('/');
                 }} 
               />
            </motion.div>
          )}

          {/* Legal & Static Views */}
          {['about', 'faq', 'terms', 'privacy', 'deletion'].includes(currentView) && (
            <motion.main
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full min-h-screen pt-20 pb-12"
            >
              <SEO 
                title={SEO_COPY[uiLang][currentView].title}
                description={SEO_COPY[uiLang][currentView].description}
                url={`https://martabakgresik.my.id/${currentView}`}
              />
              {currentView === 'about' && <AboutMe onClose={() => { setCurrentView('catalog'); navigate('/'); }} isPage={true} />}
              {currentView === 'faq' && <FAQ isPage={true} onClose={() => { setCurrentView('catalog'); navigate('/'); }} />}
              {['terms', 'privacy', 'deletion'].includes(currentView) && (
                <LegalPages 
                  type={currentView === 'terms' ? 'tos' : currentView as any} 
                  onClose={() => { setCurrentView('catalog'); navigate('/'); }} 
                  isPage={true} 
                />
              )}
            </motion.main>
          )}

        {currentView === 'app-download' && (
          <motion.main
            key="app-download"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full min-h-screen pt-20 pb-12 px-6 flex flex-col items-center justify-center text-center"
          >
             <div className="max-w-xl w-full bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3rem] border-4 border-brand-black dark:border-brand-yellow/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                
                <div className="w-24 h-24 bg-brand-orange rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-lg transform -rotate-6">
                   <Plus className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-3xl md:text-5xl font-display font-black uppercase text-brand-black dark:text-brand-yellow mb-6">
                   {t.downloadApp}
                </h1>
                
                <p className="text-lg opacity-80 mb-10 leading-relaxed">
                   {t.downloadAppDesc}
                </p>

                <div className="space-y-4 mb-10">
                   <div className="p-4 bg-brand-yellow/20 rounded-2xl border-2 border-brand-black/5 flex items-start gap-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-black shrink-0">1</div>
                      <p className="text-sm font-bold">Kirim pesan WhatsApp untuk meminta file APK official (akan segera tersedia di Play Store).</p>
                   </div>
                   <div className="p-4 bg-brand-yellow/20 rounded-2xl border-2 border-brand-black/5 flex items-start gap-4 text-left">
                      <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-black shrink-0">2</div>
                      <p className="text-sm font-bold">Instal file APK di Android kamu (Izinkan "Install from Unknown Sources").</p>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                  <a 
                    href={`https://wa.me/${(() => { const p = storePhone.replace(/\D/g, ''); return p.startsWith('0') ? '62' + p.slice(1) : p; })()}?text=${encodeURIComponent("Halo Martabak Gresik! Saya mau request link download aplikasi Android-nya dong.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-5 rounded-full font-black uppercase italic text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl"
                  >
                    <Plus className="w-7 h-7" />
                    Request Link via WA
                  </a>
                  
                  <button 
                    onClick={() => { setCurrentView('catalog'); navigate('/'); }}
                    className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest"
                  >
                    {t.backCatalog}
                  </button>
                </div>
             </div>
          </motion.main>
        )}

        {currentView === 'cart' && (
          <CartPage 
            totalItems={totalItems}
            favorites={favorites}
            cart={cart}
            updateLocation={updateLocation}
            shippingCost={shippingCost}
            applyPromoCode={applyPromoCode}
            promoCode={promoCode}
            discountAmount={discountAmount}
            totalPrice={totalPrice}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            updateNote={updateNote}
            toggleFavorite={toggleFavorite}
            setZoomedImage={(img) => setUiState({ zoomedImage: img })}
            handleOpenAddonModal={handleOpenAddonModal}
            setIsOrderConfirmationOpen={(open) => setUiState({ isOrderConfirmationOpen: open })}
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>
      </div>

      <Footer />

      {currentView !== 'blog' && (
        <FloatingActions 
          totalItems={totalItems} 
          onViewCart={() => setCurrentView('cart')}
        />
      )}

      {currentView !== 'cart' && currentView !== 'blog' && (
        <CartNotification 
          lastItemName={lastItemAdded}
          onViewCart={() => setCurrentView('cart')}
        />
      )}

      {/* AI Assistant UI */}
      {currentView !== 'blog' && (
        <AiAssistant 
          onAddToCart={addToCart} 
          onCheckoutRedirect={() => setCurrentView('cart')}
          cart={cart}
          totalPrice={totalPrice}
          menuSweet={menuSweet}
          menuSavory={menuSavory}
        />
      )}




      <AddonModal 
        selectedItemForAddon={selectedItemForAddon}
        closeAddonModal={closeAddonModal}
        copied={copied}
        setCopied={(val) => setUiState({ copied: val })}
        selectedAddons={selectedAddons}
        setSelectedAddons={setSelectedAddons}
        addToCart={handleAddToCart}
        setZoomedImage={(img) => setUiState({ zoomedImage: img })}
        formatPrice={formatPrice}
        t={t}
        addonsSweet={ADDONS_SWEET}
        addonsSavory={ADDONS_SAVORY}
      />

      <ModalsContainer 
        cart={cart}
        totalPrice={totalPrice}
        sendWhatsAppOrder={sendWhatsAppOrder}
        formatPrice={formatPrice}
        storeAddress={storeAddress}
      />



      {/* Cookie Consent Banner */}
      <CookieConsent 
        isVisible={showCookieConsent}
        onAccept={handleAcceptCookies}
        onViewPrivacy={() => {
          setCurrentView('privacy');
          navigate('/privacy');
          handleAcceptCookies();
        }}
      />
    </div>
  );
}
