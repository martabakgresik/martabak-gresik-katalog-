import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  AlertCircle
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
import { MaintenanceCountdown } from "./components/MaintenanceCountdown";
import { FAQ } from "./components/FAQ";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { FloatingActions } from "./components/layout/FloatingActions";
import { MenuCatalog } from "./components/menu/MenuCatalog";
import { CartPage } from "./views/CartPage";
import { CartNotification } from "./components/cart/CartNotification";
import { AddonModal } from "./components/modals/AddonModal";
import { ModalsContainer } from "./components/modals/ModalsContainer";
import { EventModal } from "./components/modals/EventModal";
import { useAppStore } from "./store/useAppStore";
import { createSlug } from "./utils/slug";
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
    menuState,
    setUiState, 
    toggleDarkMode, 
    setCurrentView,
    setSearchQuery,
    fetchConfig,
    t 
  } = useAppStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

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
    copied,
    isEventModalOpen
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

  const menuSweet = useMemo(() => menuState.menuSweet && menuState.menuSweet.length > 0 ? menuState.menuSweet : getMenuSweet(t), [t, menuState.menuSweet]);
  const menuSavory = useMemo(() => menuState.menuSavory && menuState.menuSavory.length > 0 ? menuState.menuSavory : getMenuSavory(t), [t, menuState.menuSavory]);

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

  // Event Modal Logic
  useEffect(() => {
    const checkEventModal = () => {
      if (!storeSettings.eventModalActive) {
        setUiState({ isEventModalOpen: false });
        return;
      }
      
      const now = new Date().toISOString();
      const isStarted = !storeSettings.eventModalStart || now >= storeSettings.eventModalStart;
      const isEnded = storeSettings.eventModalEnd && now > storeSettings.eventModalEnd;
      
      if (isStarted && !isEnded) {
        const dismissedTitle = localStorage.getItem('martabak_event_dismissed');
        if (dismissedTitle !== storeSettings.eventModalTitle) {
          setUiState({ isEventModalOpen: true });
        }
      } else {
        setUiState({ isEventModalOpen: false });
      }
    };

    checkEventModal();
    const timer = setInterval(checkEventModal, 60000); // Re-check every minute
    return () => clearInterval(timer);
  }, [storeSettings.eventModalActive, storeSettings.eventModalStart, storeSettings.eventModalEnd, storeSettings.eventModalTitle, setUiState]);

  const handleDismissEventModal = () => {
    if (storeSettings.eventModalTitle) {
      localStorage.setItem('martabak_event_dismissed', storeSettings.eventModalTitle);
    }
    setUiState({ isEventModalOpen: false });
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      
      const openTimeStr = String(openHour || "15:00");
      const closeTimeStr = String(closeHour || "23:00");
      const [oH, oM] = openTimeStr.split(':').map(Number);
      const [cH, cM] = closeTimeStr.split(':').map(Number);
      
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const openMins = (oH || 0) * 60 + (oM || 0);
      const closeMins = (cH || 0) * 60 + (cM || 0);

      const isHoliday = (holidayItem: any, targetDate: string) => {
        if (typeof holidayItem === 'string') return holidayItem === targetDate;
        if (holidayItem && holidayItem.start && holidayItem.end) {
          return targetDate >= holidayItem.start && targetDate <= holidayItem.end;
        }
        return false;
      };

      const holidayFound = holidays.some((h: any) => isHoliday(h, dateString));
      
      let actuallyEmergencyClosed = isEmergencyClosed;
      if (isEmergencyClosed && storeSettings.maintenanceEndTime) {
        const targetDate = new Date(storeSettings.maintenanceEndTime);
        if (!isNaN(targetDate.getTime()) && now.getTime() >= targetDate.getTime()) {
          actuallyEmergencyClosed = false;
        }
      }

      let isOpenCalc = false;
      if (closeMins < openMins) {
        isOpenCalc = !holidayFound && !actuallyEmergencyClosed && (currentMins >= openMins || currentMins < closeMins);
      } else {
        isOpenCalc = !holidayFound && !actuallyEmergencyClosed && (currentMins >= openMins && currentMins < closeMins);
      }

      setUiState({ 
        isHoliday: holidayFound,
        isOpen: isOpenCalc
      });
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Re-check every minute
    return () => clearInterval(timer);
  }, [holidays, isEmergencyClosed, storeSettings.maintenanceEndTime, openHour, closeHour, setUiState]);

  // Add-ons modal state
  const [selectedItemForAddon, setSelectedItemForAddon] = useState<(Omit<CartItem, 'id' | 'quantity' | 'addons'> & { type: 'sweet' | 'savory' }) | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const closeAddonModal = () => {
    if (location.pathname.startsWith('/menu/')) {
      navigate('/', { replace: true });
    } else {
      const params = new URLSearchParams(location.search);
      params.delete('item');
      const newSearch = params.toString();
      navigate({ search: newSearch ? `?${newSearch}` : '' }, { replace: true });
    }
    setSelectedItemForAddon(null);
  };

  // Deep Linking Effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemName = params.get('item');
    const pathname = window.location.pathname;

    if (pathname.startsWith('/blog')) { if (currentView !== 'blog') setCurrentView('blog'); return; }
    if (pathname === '/about') { if (currentView !== 'about') setCurrentView('about'); return; }
    if (pathname === '/faq') { if (currentView !== 'faq') setCurrentView('faq'); return; }
    if (pathname === '/terms') { if (currentView !== 'terms') setCurrentView('terms'); return; }
    if (pathname === '/privacy') { if (currentView !== 'privacy') setCurrentView('privacy'); return; }
    if (pathname === '/deletion') { if (currentView !== 'deletion') setCurrentView('deletion'); return; }
    if (pathname === '/app-download') { if (currentView !== 'app-download') setCurrentView('app-download'); return; }
    if (pathname === '/cart') { if (currentView !== 'cart') setCurrentView('cart'); return; }
    if (pathname === '/favorites') { if (currentView !== 'favorites') setCurrentView('favorites'); return; }

    if (pathname === '/' || pathname.startsWith('/menu/')) {
       if (currentView !== 'catalog') setCurrentView('catalog');
    }

    let targetSlug: string | null = null;
    if (pathname.startsWith('/menu/')) {
      targetSlug = pathname.replace('/menu/', '');
    } else if (itemName) {
      targetSlug = createSlug(itemName);
    }

    if (targetSlug && !selectedItemForAddon) {
      // Find item in sweet menu
      if (Array.isArray(menuSweet)) {
        for (const section of menuSweet) {
          if (!section?.items) continue;
          const item = section.items.find(i => createSlug(i?.name || "") === targetSlug);
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
          const variant = section.variants.find(v => createSlug(section.title + " " + v.type) === targetSlug || createSlug(v?.type || "") === targetSlug);
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
  }, [menuSweet, menuSavory, selectedItemForAddon, location.pathname, location.search, currentView]);

  // Sync URL with Selected Item
  useEffect(() => {
    const pathname = location.pathname;
    const isMenuRoute = pathname.startsWith('/menu/');
    const currentSlug = isMenuRoute ? pathname.replace('/menu/', '') : null;
    
    if (selectedItemForAddon && createSlug(selectedItemForAddon.name) !== currentSlug) {
      navigate(`/menu/${createSlug(selectedItemForAddon.name)}`, { replace: true });
    } else if (!selectedItemForAddon && isMenuRoute) {
      navigate('/', { replace: true });
    }
  }, [selectedItemForAddon, location.pathname, navigate]);

  // Sync currentView changes to URL
  useEffect(() => {
    const p = location.pathname;
    let targetPath = p;
    const staticPages = ['cart', 'favorites', 'about', 'faq', 'terms', 'privacy', 'deletion', 'app-download'];

    if (staticPages.includes(currentView)) {
      targetPath = `/${currentView}`;
    } else if (currentView === 'blog' && !p.startsWith('/blog')) {
      targetPath = '/blog';
    } else if (currentView === 'catalog' && (staticPages.includes(p.replace('/', '')) || p.startsWith('/blog'))) {
      targetPath = '/';
    }

    if (targetPath !== p) {
      navigate(targetPath);
      if (currentView !== 'catalog') window.scrollTo(0, 0);
    }
  }, [currentView, location.pathname, navigate]);

  // Image loading state
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const handleImageLoad = (src: string) => {
    setImagesLoaded(prev => ({ ...prev, [src]: true }));
  };

  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    let lastState = false;
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      if (shouldShow !== lastState) {
        lastState = shouldShow;
        setUiState({ showBackToTop: shouldShow });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    const message = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${item.name}*\n${item.category ? `(${item.category})\n` : ""}Harga: *${formatPrice(item.price)}*\n\nCek katalog lengkapnya di sini: ${window.location.origin}/menu/${createSlug(item.name)}`;
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

  if (!uiState.isConfigLoaded) {
    return (
      <div className="min-h-screen bg-brand-yellow dark:bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-28 h-28 border-4 border-brand-black/10 dark:border-brand-yellow/10 border-t-brand-black dark:border-t-brand-yellow rounded-full animate-spin"></div>
          <img src="/logo.webp" alt="Martabak Gresik" className="w-20 h-20 object-contain drop-shadow-xl animate-pulse" />
        </div>
        <h2 className="text-brand-black dark:text-brand-yellow font-black uppercase tracking-widest text-xl mb-2">Martabak Gresik</h2>
        <p className="text-brand-black/70 dark:text-brand-yellow/70 text-sm font-medium animate-pulse">Memuat Katalog Menu...</p>
      </div>
    );
  }

  let actuallyEmergencyClosed = isEmergencyClosed;
  if (isEmergencyClosed && storeSettings.maintenanceEndTime) {
    const targetDate = new Date(storeSettings.maintenanceEndTime);
    if (!isNaN(targetDate.getTime()) && new Date().getTime() >= targetDate.getTime()) {
      actuallyEmergencyClosed = false;
    }
  }

  if (actuallyEmergencyClosed) {
    return (
      <div className="min-h-screen bg-brand-yellow dark:bg-brand-black flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        <SEO title={`Maintenance - ${storeName}`} description="Toko sedang dalam perbaikan." />
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/40 dark:bg-brand-orange/20 blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-brand-orange/20 dark:bg-brand-yellow/10 blur-[100px]"
          />
        </div>

        <motion.div 
          initial={{opacity:0, y: 30}} 
          animate={{opacity:1, y: 0}} 
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-brand-black p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-black/10 dark:border-white/10 relative z-10"
        >
          <div className="w-16 h-16 md:w-24 md:h-24 bg-brand-yellow rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-8 shadow-inner shadow-black/20 rotate-3 hover:rotate-0 transition-transform duration-300 relative">
            <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-brand-black relative z-10 drop-shadow-sm" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2 md:mb-4 text-white">
            Toko Sedang Tutup
          </h1>
          <p className="text-sm md:text-lg text-brand-yellow/90 mb-6 md:mb-8 font-medium leading-relaxed whitespace-pre-line">
            {storeSettings.maintenanceReason || "Mohon maaf, layanan kami saat ini sedang tidak tersedia. Kami sedang melakukan pemeliharaan sistem atau persiapan bahan."}
          </p>
          
          {storeSettings.maintenanceEndTime && (
            <MaintenanceCountdown targetDateStr={storeSettings.maintenanceEndTime} />
          )}
          
          <div className="border-t border-white/10 pt-4 md:pt-8 mt-2 md:mt-4">
            <p className="text-[10px] md:text-xs tracking-[0.2em] text-white/50 mb-3 md:mb-4 font-bold uppercase">Butuh Bantuan?</p>
            <a href={`https://wa.me/${(storePhone || "6281330763633").replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-brand-black px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-yellow/20">
              Hubungi via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow selection:bg-brand-orange selection:text-white transition-colors duration-300">
      <SEO 
        title={selectedItemForAddon?.name ? `${selectedItemForAddon.name} - Martabak Gresik` : t?.heroSubtitle || storeName}
        description={selectedItemForAddon?.description || t?.footerDescription || storeAddress}
        image={selectedItemForAddon?.image || "/metaseo.webp"}
        url={selectedItemForAddon?.name ? `${window.location.origin}/menu/${createSlug(selectedItemForAddon.name)}` : window.location.origin}
        price={selectedItemForAddon?.price}
        category={selectedItemForAddon?.category}
        phone={storePhone || "6281330763633"}
        noindex={false}
      />
      {!['cart', 'favorites', 'app-download', 'about', 'faq', 'terms', 'privacy', 'deletion', 'blog'].includes(currentView) && (
        <Header 
          imagesLoaded={imagesLoaded}
          handleImageLoad={handleImageLoad}
          searchInputRef={searchInputRef}
        />
      )}

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
              className="w-full min-h-screen bg-neutral-50 dark:bg-brand-black pb-12"
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

      {currentView !== 'cart' && currentView !== 'favorites' && currentView !== 'app-download' && (
        <Footer />
      )}

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

      <EventModal 
        isOpen={isEventModalOpen}
        onClose={handleDismissEventModal}
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
