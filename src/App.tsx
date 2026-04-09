import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, MapPin, Search, ShoppingBag, Plus, Minus, Trash2, X, CircleSlash,
  MessageCircle, Heart, Share2, Copy, Check,
  Facebook, Twitter, Instagram, ExternalLink, Download,
  Sun, Moon, ArrowUp, Clock, ChevronDown,
  MessageCircleQuestionIcon, Music2, Sparkles, Trophy, Send, Info, BookOpen, Maximize2, Settings,
  QrCode, Image as ImageIcon, Languages
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart, type CartItem, type Addon, formatPrice } from "./hooks/useCart";
import { 
  MENU_SWEET, 
  MENU_SAVORY, 
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
import { useUiLanguage } from "./hooks/useUiLanguage";
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
  const { uiLang, setUiLang } = useUiLanguage();
  const t = UI_COPY[uiLang];

  // --- STORE STATE (Config-driven) ---
  const [menuSweet, setMenuSweet] = useState(MENU_SWEET);
  const [menuSavory, setMenuSavory] = useState(MENU_SAVORY);
  const [openHour, setOpenHour] = useState(OPEN_HOUR);
  const [closeHour, setCloseHour] = useState(CLOSE_HOUR);
  const [activePromoCode, setActivePromoCode] = useState(PROMO_CODE);
  const [activePromoPercent, setActivePromoPercent] = useState(PROMO_PERCENT);
  const [holidays, setHolidays] = useState(HOLIDAYS);
  const [storeName] = useState(STORE_NAME);
  const [storeAddress] = useState(STORE_ADDRESS);
  const [storePhone] = useState(STORE_PHONE);
  const [shippingRate, setShippingRate] = useState(SHIPPING_RATE_PER_KM);
  const [maxDistance, setMaxDistance] = useState(MAX_SHIPPING_DISTANCE);
  const [isEmergencyClosed, setIsEmergencyClosed] = useState(false);
  const [promoStartAt, setPromoStartAt] = useState<string | null>(null);
  const [promoEndAt, setPromoEndAt] = useState<string | null>(null);

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
    isGoogleMapsLink,
    processAddressWithAI
  } = useCart(shippingRate, maxDistance);

  const [locationStatus, setLocationStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ status: 'idle' });
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isDistanceAiVerified, setIsDistanceAiVerified] = useState(false);
  
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ status: 'success' | 'error', text: string } | null>(null);

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('martabak_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"cart" | "favorites">("cart");
  const [shareItem, setShareItem] = useState<{ name: string; price: number; category?: string } | null>(null);
  const [isGeneralShareOpen, setIsGeneralShareOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<{src: string, alt: string} | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isCheckoutPhase, setIsCheckoutPhase] = useState(false);

  // Legal & Privacy State
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [currentView, setCurrentView] = useState<'catalog' | 'blog' | 'about' | 'faq' | 'terms' | 'privacy' | 'deletion'>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/blog')) return 'blog';
    if (path === '/about') return 'about';
    if (path === '/faq') return 'faq';
    if (path === '/terms') return 'terms';
    if (path === '/privacy') return 'privacy';
    if (path === '/deletion') return 'deletion';
    return 'catalog';
  });
  

  useEffect(() => {
    const consent = localStorage.getItem('martabak_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowCookieConsent(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('martabak_cookie_consent', 'accepted');
    setShowCookieConsent(false);
  };

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      const hour = now.getHours();

      const holidayFound = holidays.includes(dateString);
      setIsHoliday(holidayFound);

      if (holidayFound || isEmergencyClosed) {
        setIsOpen(false);
      } else {
        setIsOpen(hour >= openHour && hour < closeHour);
      }
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Re-check every minute
    return () => clearInterval(timer);
  }, []);

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

    if (itemName && !selectedItemForAddon) {
      // Find item in sweet menu
      for (const section of menuSweet) {
        const item = section.items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (item) {
          setSelectedItemForAddon({ ...item, type: 'sweet', category: section.category });
          return;
        }
      }
      // Find item in savory menu
      for (const section of menuSavory) {
        const variant = section.variants.find(v => (section.title + " " + v.type).toLowerCase() === itemName.toLowerCase() || v.type.toLowerCase() === itemName.toLowerCase());
        if (variant) {
          // Find first price for default
          const priceObj = variant.prices[0];
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

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const APP_URL = window.location.origin;

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = (item: { name: string; price: number; category?: string }) => {
    const message = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${item.name}*\n${item.category ? `(${item.category})\n` : ""}Harga: *${formatPrice(item.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${storePhone.replace(/\s/g, '').replace('+', '')}?text=${encodedMessage}`, "_blank");
  };

  const shareGeneral = async (platform: string) => {
    const title = "Martabak Gresik";
    const text = `Cek Martabak Gresik - ${t.heroSubtitle} Terenak!`;
    const url = APP_URL;

    // Use Web Share API if available (best for mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Fallback for non-supporting browsers or user cancellation
      }
    }

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "threads":
        shareUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct sharer, fallback to copy
        handleCopyLink(url);
        return;
      case "tiktok":
        // TikTok doesn't have a direct sharer, fallback to copy
        handleCopyLink(url);
        return;
      default:
        handleCopyLink(url);
        return;
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

  const filteredSweet = useMemo(() => menuSweet.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0), [searchQuery, menuSweet]);

  const filteredSavory = useMemo(() => menuSavory.map(section => ({
    ...section,
    variants: section.variants.map(variant => ({
      ...variant,
      prices: variant.prices.filter(p =>
        `${section.title} ${variant.type} ${p.desc || `${p.qty} Telor`} ${formatPrice(p.price)}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(v => v.prices.length > 0)
  })).filter(section => section.variants.length > 0), [searchQuery, menuSavory]);

  const isPromoScheduledActive = useMemo(() => {
    if (isHoliday || isEmergencyClosed) return false;
    if (!promoStartAt && !promoEndAt) return true;
    const now = new Date();
    const start = promoStartAt ? new Date(promoStartAt) : null;
    const end = promoEndAt ? new Date(promoEndAt) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  }, [promoStartAt, promoEndAt, isHoliday, isEmergencyClosed]);

  return (
    <div className="min-h-screen bg-brand-yellow dark:bg-brand-black text-brand-black dark:text-brand-yellow selection:bg-brand-orange selection:text-white transition-colors duration-300">
      <SEO 
        title={selectedItemForAddon ? `${selectedItemForAddon.name} - Martabak Gresik` : undefined}
        description={selectedItemForAddon?.description}
        image={selectedItemForAddon?.image}
        url={selectedItemForAddon ? `${window.location.origin}/?item=${encodeURIComponent(selectedItemForAddon.name)}` : undefined}
        price={selectedItemForAddon?.price}
        category={selectedItemForAddon?.category}
        phone={storePhone}
        noindex={false}
      />
      {/* Promo Banner */}
      <AnimatePresence>
        {(showPromo && isPromoScheduledActive) && (
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="bg-brand-orange text-brand-black text-[10px] md:text-xs font-bold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2"
          >
              {t.promoText(activePromoCode, activePromoPercent)}
            <button
              onClick={() => setShowPromo(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {currentView === 'catalog' && (
        <header className="relative bg-brand-black dark:bg-black text-white py-12 px-6 overflow-hidden">
        {/* Share Button (Left) */}
        <div className="absolute top-6 left-6 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsGeneralShareOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
            title={t.share}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Theme Toggle Button */}
        <div className="absolute top-6 right-6 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white backdrop-blur-sm shadow-xl"
            title={isDarkMode ? t.toLight : t.toDark}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Wavy Background Element */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-brand-yellow dark:bg-brand-black rounded-t-[100%] translate-y-8" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
          <div className="mb-8 flex flex-row items-center justify-center gap-4 md:gap-10 w-full">
            <motion.div 
              className="relative cursor-pointer group"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentView('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState({}, '', '/');
              }}
            >
              {!imagesLoaded['/logo.webp'] && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />}
              <img
                src="/logo.webp"
                alt="Martabak Gresik Logo"
                className={`w-24 md:w-48 h-auto shrink-0 transition-opacity duration-500 ${imagesLoaded['/logo.webp'] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad('/logo.webp')}
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="text-left">
              <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-2 mb-2">
                <div className="bg-brand-yellow text-brand-black px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest inline-block whitespace-nowrap">
                  Since 2020
                </div>
                <div className={`px-3 py-0.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 border-2 ${isHoliday ? 'bg-orange-600 border-orange-700' : isOpen ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'} text-white whitespace-nowrap`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isHoliday || isOpen ? 'bg-white' : 'bg-white/50'}`} />
                  {isHoliday ? t.holidayClosed : isOpen ? t.open : t.closedAt(openHour)}
                </div>
              </div>
              <motion.h1
                className="text-3xl md:text-6xl font-display font-black tracking-tighter uppercase leading-[0.85] cursor-pointer hover:text-brand-yellow transition-colors"
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setCurrentView('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/');
                }}
              >
                <span className="sr-only">Martabak Gresik - Terang Bulan Gresik</span>
                <span aria-hidden="true">
                  Martabak<br />
                  <span className="text-brand-yellow font-display">Gresik</span>
                </span>
              </motion.h1>
              <p className="text-xs md:text-2xl font-medium text-brand-orange italic mt-1 md:mt-2">
                {t.heroSubtitle}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base opacity-80 w-full"
          >
            <button 
              onClick={() => setIsMapOpen(true)}
              className="flex items-center justify-center gap-2 hover:text-brand-orange transition-colors cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-brand-orange group-hover:scale-110 transition-transform" />
              <span className="underline decoration-transparent hover:decoration-brand-orange transition-colors">{storeAddress}</span>
            </button>
            <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 hover:text-brand-orange transition-colors cursor-pointer">
              <Phone className="w-4 h-4 text-brand-orange" />
              <span className="underline decoration-transparent hover:decoration-brand-orange transition-colors">{storePhone}</span>
            </a>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-brand-orange" />
              <span>{t.openingHours}: {openHour}.00 - {closeHour}.00 WIB</span>
            </div>
          </motion.div>

          {/* Prominent Shop Status Indicator */}
          <div className="flex justify-center mt-8 mb-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 ${
                isOpen 
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              } font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg backdrop-blur-md`}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {isEmergencyClosed ? t.emergencyClosed : isHoliday ? t.holidayClosed : isOpen ? t.openNowReady : t.closedNowAt(openHour)}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => {
                setCurrentView('catalog');
                setTimeout(() => {
                  document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-orange text-white px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-orange/50"
            >
              <ShoppingBag className="w-5 h-5" />
              {t.orderNow}
            </motion.button>
            <Link to="/gallery">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-yellow text-brand-black px-8 py-3 rounded-full font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-yellow/50 cursor-pointer"
              >
                <ImageIcon className="w-5 h-5" />
                {t.viewGallery}
              </motion.button>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 mb-4 flex justify-center w-full max-w-2xl px-4"
          >
            <motion.div 
              initial={false}
              animate={{ 
                width: isSearchOpen || searchQuery ? "100%" : "64px",
                maxWidth: isSearchOpen || searchQuery ? "42rem" : "64px"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative flex items-center shadow-xl rounded-full bg-white dark:bg-black/50 border-4 ${
                isSearchOpen || searchQuery ? 'border-brand-black/10 dark:border-brand-yellow/20 focus-within:border-brand-orange focus-within:ring-4 focus-within:ring-brand-orange/20' : 'border-brand-orange/50 dark:border-brand-yellow/50'
              } transition-colors overflow-hidden h-16`}
            >
              <button 
                onClick={() => {
                  if (!isSearchOpen && !searchQuery) {
                    setIsSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  } else if (isSearchOpen && !searchQuery) {
                     setIsSearchOpen(false);
                  }
                }}
                className={`w-16 h-full flex items-center justify-center shrink-0 ${!isSearchOpen && !searchQuery ? 'cursor-pointer hover:bg-brand-black/5 dark:hover:bg-white/5' : ''}`}
              >
                <Search className={`h-6 w-6 ${!isSearchOpen && !searchQuery ? 'text-brand-orange dark:text-brand-yellow' : 'text-brand-black/40 dark:text-white/40'}`} />
              </button>
              
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t.searchHint}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'catalog') {
                    setCurrentView('catalog');
                    setTimeout(() => {
                      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
                className="block flex-grow min-w-0 h-full bg-transparent border-none text-brand-black dark:text-white placeholder:text-brand-black/40 dark:placeholder:text-white/40 outline-none font-bold text-base md:text-lg pr-2"
                style={{ display: isSearchOpen || searchQuery ? 'block' : 'none' }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="w-16 h-full flex items-center justify-center text-brand-black/40 hover:text-brand-orange transition-colors shrink-0"
                  aria-label="Bersihkan pencarian"
                >
                  <div className="bg-brand-black/5 p-2 rounded-full hover:bg-brand-orange/10">
                    <X className="h-5 w-5" />
                  </div>
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className={`${SCROLL_SPACING} flex flex-col items-center gap-1 text-brand-orange dark:text-brand-yellow w-full`}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="flex flex-col items-center"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-1">{t.scrollMenu}</span>
              <ChevronDown className="w-5 h-5 animate-pulse" />
            </motion.div>
          </motion.div>
        </div>
      </header>
      )}

      {currentView === 'blog' && (
        <header className="bg-brand-black dark:bg-black text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
           <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div 
               className="flex items-center gap-2 cursor-pointer"
               onClick={() => {
                 setCurrentView('catalog');
                 navigate('/');
               }}
             >
               <img src="/logo.webp" alt="Logo" className="w-10 h-10 object-contain" />
               <span className="font-display font-black uppercase text-brand-yellow">Martabak Gresik</span>
             </div>
             <button 
               onClick={() => {
                 setCurrentView('catalog');
                 navigate('/');
               }}
               className="text-[10px] font-black uppercase tracking-widest text-brand-orange hover:text-white transition-colors"
             >
               {UI_COPY[uiLang].backCatalog}
             </button>
           </div>
         </header>
      )}
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {currentView === 'catalog' && (
          <motion.main 
            key="catalog"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            id="menu-section" 
            className="max-w-7xl mx-auto px-4 py-8 md:py-12 scroll-mt-8"
          >
            <SEO 
              title={SEO_COPY[uiLang].catalog.title}
              description={SEO_COPY[uiLang].catalog.description}
              url="https://martabakgresik.my.id"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Sweet Martabak Column */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
                  <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">{t.sweetTitle}</h2>
                </div>
                <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                  {!imagesLoaded['/terang-bulan.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
                  <img
                    src="/terang-bulan.webp"
                    srcSet="/terang-bulan-320w.webp 320w, /terang-bulan-640w.webp 640w, /terang-bulan-960w.webp 960w"
                    sizes="(max-width: 768px) 90vw, 450px"
                    alt="Ilustrasi Terang Bulan"
                    className={`w-full h-full object-contain transition-opacity duration-500 ${imagesLoaded['/terang-bulan.webp'] ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad('/terang-bulan.webp')}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-6">
                  {filteredSweet.map((section, idx) => (
                    <motion.div
                      key={section.category}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/40 dark:bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-brand-black/5 dark:border-white/5"
                    >
                      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand-orange rounded-full" />
                        {section.category}
                      </h3>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex flex-col gap-2 group relative">
                         <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {('image' in item) && (
                              <div 
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-black/5 dark:bg-white/5 overflow-hidden flex-shrink-0 animate-pulse-once cursor-pointer ring-2 ring-transparent hover:ring-brand-orange transition-all relative"
                                onClick={() => setZoomedImage({src: (item as any).image, alt: item.name})}
                              >
                                <img src={(item as any).image} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.style.setProperty('display', 'none'); }} />
                                {(item as any).isBestSeller && (
                                  <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1 py-0.5 rounded-br shadow-sm uppercase z-10 flex items-center gap-0.5">
                                    <Trophy className="w-1.5 h-1.5" /> 
                                  </div>
                                )}
                              </div>
                            )}
                              <span className={`font-medium ${item.highlight ? 'text-brand-orange' : 'text-brand-black dark:text-white'} flex items-center gap-1.5 min-w-0`}>
                               <span className="whitespace-normal leading-tight">{item.name}</span>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleOpenAddonModal({ name: item.name, price: item.price, category: section.category, image: (item as any).image, description: (item as any).description }, 'sweet');
                                 }}
                                 className="opacity-40 hover:opacity-100 hover:text-brand-orange transition-all p-0.5 flex-shrink-0"
                                 title="Detail Produk"
                               >
                                 <Info className="w-3.5 h-3.5" />
                               </button>
                             </span>
                          </div>
                          <div className="hidden sm:block flex-grow border-b border-dotted border-brand-black/20 dark:border-white/20 mx-2 group-hover:border-brand-orange/50 transition-colors" />
                          <div className="flex flex-col items-end flex-shrink-0 ml-auto mr-1">
                            <div className="flex items-center gap-1.5">
                              {(item as any).original_price && (item as any).original_price > item.price && (
                                <span className="text-[10px] md:text-xs text-zinc-600 dark:text-zinc-400 line-through decoration-red-600 decoration-2">
                                  {formatPrice((item as any).original_price)}
                                </span>
                              )}
                              <span className="font-bold tabular-nums dark:text-brand-yellow text-sm md:text-base">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                onClick={() => toggleFavorite({ name: item.name, price: item.price, category: section.category })}
                                className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(item.name, section.category)
                                  ? 'bg-brand-orange text-white'
                                  : 'bg-brand-black/5 dark:bg-white/10 text-brand-black dark:text-white hover:bg-brand-orange/20'
                                  }`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(item.name, section.category) ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => (item as any).isAvailable !== false && handleOpenAddonModal({ name: item.name, price: item.price, category: section.category, image: (item as any).image, description: (item as any).description }, 'sweet')}
                                disabled={(item as any).isAvailable === false}
                                className={`p-1.5 rounded-full transition-colors active:scale-90 ${(item as any).isAvailable === false 
                                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                                  : 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black hover:bg-brand-orange hover:text-white'}`}
                              >
                                {(item as any).isAvailable === false ? <CircleSlash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        {(item as any).isAvailable === false && (
                          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl pointer-events-none z-[5]">
                             <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest shadow-lg shadow-red-500/20">Stok Habis</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Savory Martabak Column */}
          <section className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-1 w-12 bg-brand-black dark:bg-brand-yellow rounded-full" />
              <h2 className="text-4xl font-display font-black uppercase tracking-tight dark:text-brand-yellow">{t.savoryTitle}</h2>
            </div>
            <div className="relative flex justify-center w-full max-w-md h-48 md:h-64 mx-auto -mt-2 mb-4 drop-shadow-xl hover:scale-105 transition-transform duration-500">
              {!imagesLoaded['/martabak.webp'] && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-pulse rounded-3xl" />}
              <img
                src="/martabak.webp"
                srcSet="/martabak-320w.webp 320w, /martabak-640w.webp 640w, /martabak-960w.webp 960w"
                sizes="(max-width: 768px) 90vw, 450px"
                alt="Ilustrasi Martabak Telor"
                className={`w-full h-full object-contain transition-opacity duration-500 ${imagesLoaded['/martabak.webp'] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad('/martabak.webp')}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>

            <div className="space-y-8">
              {filteredSavory.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-brand-black dark:bg-black text-white p-8 rounded-[2rem] shadow-2xl shadow-brand-black/20 dark:border dark:border-white/10"
                >
                  <h3 className="text-3xl font-display font-black text-brand-yellow uppercase mb-8 italic">
                    {section.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.variants.map((variant) => (
                      <div key={variant.type} className="space-y-4">
                        <h4 className="text-brand-orange font-bold text-lg italic border-b border-brand-orange/30 pb-2">
                          {variant.type}
                        </h4>
                        <div className="space-y-3">
                          {variant.prices.map((p) => (
                             <div key={p.qty} className="flex justify-between items-center gap-2 bg-white/5 p-2 rounded-xl hover:bg-white/10 transition-colors shadow-sm relative">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {('image' in p) && (
                                  <div 
                                    className="w-10 h-10 rounded-lg bg-black/20 overflow-hidden flex-shrink-0 animate-pulse-once cursor-pointer ring-2 ring-transparent hover:ring-brand-orange transition-all relative"
                                    onClick={() => setZoomedImage({src: (p as any).image, alt: `${section.title} ${variant.type}`})}
                                  >
                                    <img src={(p as any).image} alt={`${p.qty} Telor`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.style.setProperty('display', 'none'); }} />
                                    {(p as any).isBestSeller && (
                                      <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[6px] font-black px-1 py-0.5 rounded-br shadow-sm uppercase z-10 flex items-center gap-0.5">
                                        <Trophy className="w-1.5 h-1.5" /> 
                                      </div>
                                    )}
                                  </div>
                                )}
                                <span className="text-sm font-medium opacity-90 flex items-center gap-1.5 min-w-0">
                                  <span className="whitespace-normal leading-tight">{p.desc ? p.desc : `${p.qty} Telor`}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenAddonModal({
                                        name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                        price: p.price,
                                        image: (p as any).image,
                                        description: (variant as any).description
                                      }, 'savory');
                                    }}
                                    className="opacity-40 hover:opacity-100 hover:text-brand-orange transition-all p-0.5 flex-shrink-0"
                                    title="Detail Produk"
                                  >
                                    <Info className="w-3 h-3" />
                                  </button>
                                </span>
                              </div>
                              <div className="flex flex-col items-end flex-shrink-0 ml-auto">
                                <div className="flex items-center gap-1.5">
                                  {(p as any).original_price && (p as any).original_price > p.price && (
                                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 line-through decoration-red-600 decoration-2">
                                      {formatPrice((p as any).original_price)}
                                    </span>
                                  )}
                                  <span className="font-bold text-brand-yellow text-sm">{formatPrice(p.price)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 ml-1">
                                  <button
                                    onClick={() => toggleFavorite({
                                      name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                      price: p.price
                                    })}
                                    className={`p-1.5 rounded-full transition-all active:scale-90 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`)
                                      ? 'bg-brand-orange text-white'
                                      : 'bg-white/10 text-brand-yellow hover:bg-brand-orange/20'
                                      }`}
                                  >
                                    <Heart className={`w-4 h-4 ${isFavorite(`${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`) ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => (p as any).isAvailable !== false && handleOpenAddonModal({
                                      name: `${section.title} (${variant.type} - ${p.desc ? p.desc : `${p.qty} Telor`})`,
                                      price: p.price,
                                      image: (p as any).image,
                                      description: (variant as any).description
                                    }, 'savory')}
                                    disabled={(p as any).isAvailable === false}
                                    className={`p-1.5 rounded-full transition-colors active:scale-90 ${(p as any).isAvailable === false 
                                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                                      : 'bg-brand-yellow text-brand-black hover:bg-brand-orange hover:text-white'}`}
                                  >
                                    {(p as any).isAvailable === false ? <CircleSlash className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                              {(p as any).isAvailable === false && (
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none z-[5]">
                                  <span className="text-[10px] font-black text-red-500 tracking-[0.2em] italic uppercase bg-white/90 dark:bg-zinc-950 px-2 py-0.5 rounded shadow-sm border border-red-500/20 underline decoration-red-500">HABIS</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Ordering Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mt-16 bg-white dark:bg-white/5 p-8 rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow/20"
            >
              <h3 className="text-2xl font-black uppercase mb-6 text-center italic dark:text-brand-yellow">Bisa Pesan Disini:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: "GrabFood",
                    color: "bg-[#00B14F]",
                    url: "https://r.grab.com/o/R7F36f6j",
                    icon: ShoppingBag
                  },
                  { name: "GoFood", color: "bg-[#EE2737]", url: "https://gofood.co.id/surabaya/restaurant/martabak-gresik-drojogan-usman-sadar-no-10-84fc235a-673a-4163-a15c-d7ca0b077a4e", icon: ShoppingBag },
                  { name: "ShopeeFood", color: "bg-[#EE4D2D]", url: "https://spf.shopee.co.id/qeqAKpT0c", icon: ShoppingBag },
                ].map((app) => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${app.color} !text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg text-center`}
                  >
                    <app.icon className="w-5 h-5 shrink-0 text-white" />
                    {app.name}
                  </a>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
          </motion.main>
        )}

        {currentView === 'blog' && (
          <motion.main
            key="blog"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full min-h-screen"
          >
            <BlogView onClose={() => { setCurrentView('catalog'); navigate('/'); }} uiLang={uiLang} />
          </motion.main>
        )}

        {currentView === 'about' && (
          <motion.main
            key="about"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full min-h-screen"
          >
            <SEO 
              title={SEO_COPY[uiLang].about.title}
              description={SEO_COPY[uiLang].about.description}
              url="https://martabakgresik.my.id/about"
            />
            <AboutMe onClose={() => { setCurrentView('catalog'); navigate('/'); }} uiLang={uiLang} isPage={true} />
          </motion.main>
        )}

        {currentView === 'faq' && (
          <motion.main
            key="faq"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full min-h-screen"
          >
            <SEO 
              title={SEO_COPY[uiLang].faq.title}
              description={SEO_COPY[uiLang].faq.description}
              url="https://martabakgresik.my.id/faq"
            />
            <FAQ uiLang={uiLang} isPage={true} onClose={() => { setCurrentView('catalog'); navigate('/'); }} />
          </motion.main>
        )}

        {['terms', 'privacy', 'deletion'].includes(currentView) && (
          <motion.main
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full min-h-screen"
          >
            <SEO 
              title={SEO_COPY[uiLang][currentView].title}
              description={SEO_COPY[uiLang][currentView].description}
              url={`https://martabakgresik.my.id/${currentView}`}
            />
            <LegalPages 
              type={currentView === 'terms' ? 'tos' : currentView as any} 
              onClose={() => { setCurrentView('catalog'); navigate('/'); }} 
              uiLang={uiLang} 
              isPage={true} 
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-brand-black text-white pt-12 pb-44 md:pb-12 px-6 mt-20 relative overflow-hidden">
        {/* Wavy Background Element */}
        <div className="absolute top-0 left-0 w-full h-16 bg-brand-yellow rounded-b-[100%] -translate-y-8" />

        <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h2 className="text-3xl font-display font-black text-brand-yellow uppercase mb-4">Martabak Gresik</h2>
          <p className="opacity-60 text-sm max-w-md mb-8">
            {t.footerDescription}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="/katalog.webp"
              download
              className="bg-brand-orange text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white hover:text-brand-orange transition-all shadow-lg text-sm uppercase tracking-wider active:scale-95"
            >
              <Download className="w-4 h-4" />
              {t.downloadCatalog}
            </a>
          </div>

          <div className="w-full pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs text-white/40">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p>© {new Date().getFullYear()} Martabak Gresik. All rights reserved.</p>
              <p className="italic font-medium">{t.priceNote}</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="font-bold">
                Deliciously Coded by <a href="https://ariftirtana.my.id" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:text-brand-orange transition-colors cursor-pointer">Arif Tirtana</a>
              </p>
              <div className="flex items-center gap-2">
                <Link 
                  to="/gallery" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <ImageIcon className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  Gallery
                </Link>
                <Link 
                  to="/qr" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <QrCode className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  QR Generator
                </Link>
                <Link 
                  to="/converter" 
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group"
                >
                  <ImageIcon className="w-3 h-3 text-brand-white group-hover:text-brand-yellow transition-colors" />
                  {t.converterTitle}
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
              <Link 
                to="/blog"
                onClick={() => { 
                  setCurrentView('blog'); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-brand-white hover:text-brand-yellow hover:underline transition-all flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" /> {t.blogLink}
              </Link>
              <Link 
                to="/terms"
                onClick={() => { setCurrentView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.terms}
              </Link>
              <Link 
                to="/privacy"
                onClick={() => { setCurrentView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.privacy}
              </Link>
              <Link 
                to="/deletion"
                onClick={() => { setCurrentView('deletion'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.deletion}
              </Link>
              <Link 
                to="/about"
                onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                About Me
              </Link>
              <Link 
                to="/faq"
                onClick={() => { setCurrentView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-brand-yellow transition-colors"
              >
                {t.faq}
              </Link>
            </div>
            
            <div className="flex gap-6">
              <a href="https://wa.me/6281330763633" target="_blank" rel="noopener noreferrer" className="hover:text-brand-yellow transition-colors flex items-center gap-1.5 font-bold">
                <MessageCircleQuestionIcon className="w-3.5 h-3.5" />
                {t.feedback}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Buttons: Back to Top & Cart */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 md:gap-4 items-end pointer-events-none">
        <button
          onClick={() => setUiLang((prev) => (prev === "id" ? "en" : "id"))}
          className="px-4 py-2 rounded-full bg-white/95 dark:bg-brand-black border-2 border-brand-black dark:border-brand-yellow text-brand-black dark:text-white shadow-xl font-black text-[10px] uppercase tracking-wide flex items-center gap-2 hover:scale-105 transition-transform pointer-events-auto"
          title={uiLang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
          aria-label={uiLang === "id" ? "Ganti bahasa ke English" : "Switch language to Bahasa Indonesia"}
        >
          <Languages className="w-4 h-4" />
          {uiLang === "id" ? "Bahasa ID" : "English"}
        </button>
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="p-3 md:p-4 bg-brand-orange text-white rounded-full shadow-2xl hover:bg-brand-black dark:hover:bg-brand-yellow dark:hover:text-brand-black transition-all group active:scale-90 pointer-events-auto"
              title={t.backToTop}
            >
              <ArrowUp className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsCartOpen(true)}
              className="w-auto md:bg-brand-black bg-brand-black text-white px-6 py-4 md:px-8 md:py-5 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 md:gap-3 hover:bg-brand-orange hover:scale-105 hover:shadow-brand-orange/50 transition-all group animate-[pulse_2s_ease-in-out_infinite] pointer-events-auto"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 animate-[bounce_2s_infinite]" />
                <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-brand-yellow text-brand-black text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-brand-black">
                  {totalItems}
                </span>
              </div>
              <span className="font-bold text-sm md:text-base pr-1 md:pr-2 tracking-wide uppercase">{t.viewOrder}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* AI Assistant UI */}
      <AiAssistant 
        onAddToCart={addToCart} 
        isOpen={isOpen} 
        promoCode={activePromoCode || PROMO_CODE} 
        promoPercent={activePromoPercent || PROMO_PERCENT}
        menuSweet={menuSweet}
        menuSavory={menuSavory}
        uiLang={uiLang}
      />

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
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
                      onClick={() => setIsCheckoutPhase(false)}
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
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Tabs */}
              {!isCheckoutPhase && (
                <div className="flex px-4 pt-4 shrink-0">
                  <button
                    onClick={() => setActiveTab("cart")}
                    className={`flex-1 py-3 text-xs font-black uppercase italic tracking-wider transition-all border-b-4 ${activeTab === "cart" ? "border-brand-black dark:border-brand-yellow opacity-100" : "border-transparent opacity-30"}`}
                  >
                    {t.cartTab(totalItems)}
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
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
                                onChange={(e) => setCustomerName(e.target.value)}
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
                                      onChange={(e) => setCustomerAddress(e.target.value)}
                                      rows={4}
                                      className="w-full bg-white dark:bg-black/40 border-2 border-brand-black/10 dark:border-brand-yellow/20 rounded-2xl px-5 py-3 text-sm font-bold focus:border-brand-orange outline-none dark:text-white transition-all resize-none shadow-sm"
                                    />
                                  </div>
                                  
                                  <button
                                    onClick={async () => {
                                      if (customerAddress.length < 5 || isAiProcessing) return;
                                      setIsAiProcessing(true);
                                      const result = await processAddressWithAI(customerAddress);
                                      setIsAiProcessing(false);
                                      if (result?.success && result.googleMapsLink) {
                                        const beautified = result.beautifiedAddress || customerAddress;
                                        setCustomerAddress(`${beautified}\n\n📍 Link Lokasi (Auto-AI):\n${result.googleMapsLink}`);
                                        
                                        // Update distance slider automatically if provided by AI
                                        if (result.distance !== undefined && result.distance !== null) {
                                          const dist = Number(result.distance);
                                          setDistance(dist);
                                          setIsDistanceAiVerified(true);
                                        }
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
                              onClick={() => {
                                setDeliveryMethod('delivery');
                                setIsDistanceAiVerified(false);
                              }}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'delivery'
                                ? 'bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black shadow-lg scale-[1.02]'
                                : 'opacity-40 hover:opacity-100 dark:text-white'
                                }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              {t.deliverToAddress}
                            </button>
                            <button
                              onClick={() => {
                                setDeliveryMethod('pickup');
                                setIsDistanceAiVerified(false);
                              }}
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
                                onChange={(e) => {
                                  setDistance(parseInt(e.target.value));
                                }}
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
                                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                                className="flex-grow bg-white dark:bg-black/40 border-2 border-brand-black/10 dark:border-brand-yellow/20 rounded-2xl px-5 py-3 text-xs font-bold focus:border-brand-orange outline-none dark:text-white shadow-sm"
                              />
                              <button
                                onClick={() => {
                                  const result = applyPromoCode(promoCodeInput);
                                  setPromoMessage({ status: result.success ? 'success' : 'error', text: result.message });
                                  if (!result.success) setTimeout(() => setPromoMessage(null), 3000);
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
                                  {item.addons.map((addon, idx) => (
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
                      onClick={() => setIsCheckoutPhase(true)}
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
                        disabled={distance > MAX_SHIPPING_DISTANCE || isHoliday}
                        className={`w-full py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all shadow-xl ${distance > MAX_SHIPPING_DISTANCE || isHoliday
                          ? 'bg-gray-400 cursor-not-allowed grayscale'
                          : 'bg-[#25D366] text-white hover:scale-[1.02] active:scale-95'
                          }`}
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-sm">{isHoliday ? t.holidayNow : distance > MAX_SHIPPING_DISTANCE ? t.locationTooFar : t.confirmViaWhatsApp}</span>
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

      {/* Add-ons Modal */}
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
                {(selectedItemForAddon.type === 'sweet' ? ADDONS_SWEET : ADDONS_SAVORY).map((addon) => {
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

      {/* Item Share Modal */}
      <AnimatePresence>
        {shareItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareItem(null)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1010]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1020] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.shareMenuTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.sendToWhatsApp}</p>
                </div>
                <button
                  onClick={() => setShareItem(null)}
                  className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-brand-black/5 dark:bg-white/10 p-4 rounded-2xl mb-6">
                <p className="text-sm font-bold dark:text-white">{shareItem.name}</p>
                <p className="text-xs opacity-60 dark:text-brand-yellow/60">{shareItem.category}</p>
                <p className="text-lg font-black mt-2 dark:text-brand-yellow">{formatPrice(shareItem.price)}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareToWhatsApp(shareItem)}
                  className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t.sendToWhatsApp}
                </button>
                <button
                  onClick={() => {
                    const msg = `Halo Martabak Gresik! Saya tertarik dengan menu ini:\n\n*${shareItem.name}*\n${shareItem.category ? `(${shareItem.category})\n` : ""}Harga: *${formatPrice(shareItem.price)}*\n\nCek katalog lengkapnya di sini: ${APP_URL}`;
                    handleCopyLink(msg);
                  }}
                  className="w-full bg-brand-black text-white py-4 rounded-xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? t.copiedSuccess : t.copyMessage}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* General Share Modal */}
      <AnimatePresence>
        {isGeneralShareOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGeneralShareOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1010]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-brand-yellow dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1020] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.shareCatalogTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.inviteFriends}</p>
                </div>
                <button
                  onClick={() => setIsGeneralShareOpen(false)}
                  className="p-2 hover:bg-brand-black/5 dark:hover:bg-white/10 rounded-full transition-colors dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => shareGeneral("facebook")}
                  className="bg-[#1877F2] text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Facebook</span>
                </button>
                <button
                  onClick={() => shareGeneral("twitter")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">X (Twitter)</span>
                </button>
                <button
                  onClick={() => shareGeneral("threads")}
                  className="bg-black text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  <ExternalLink className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Threads</span>
                </button>
                <button
                  onClick={() => handleCopyLink(APP_URL)}
                  className="bg-brand-orange text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                >
                  {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  <span className="text-[10px] font-bold uppercase">{copied ? t.copiedShort : t.copyLink}</span>
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold uppercase opacity-40 dark:text-white/40">{t.orShareVia}</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => shareGeneral("instagram")} 
                    title={t.shareInstagram}
                    className="p-2 bg-white dark:bg-brand-black rounded-full border-2 border-brand-black dark:border-brand-yellow hover:bg-brand-orange hover:text-white transition-all dark:text-white"
                  >
                    <Instagram className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => shareGeneral("tiktok")} 
                    title={t.shareTikTok}
                    className="p-2 bg-white dark:bg-brand-black rounded-full border-2 border-brand-black dark:border-brand-yellow hover:bg-brand-orange hover:text-white transition-all dark:text-white"
                  >
                    <Music2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {isOrderConfirmationOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderConfirmationOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-sm z-[1100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg bg-white dark:bg-brand-black rounded-[2rem] border-4 border-brand-black dark:border-brand-yellow z-[1110] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">{t.orderConfirmationTitle}</h3>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-wider dark:text-white/40">{t.reviewOrder}</p>
                </div>
                <button
                  onClick={() => setIsOrderConfirmationOpen(false)}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {/* Order Summary */}
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm border-b-2 border-brand-black dark:border-brand-yellow pb-2 dark:text-brand-yellow">{t.menuSummary}</h4>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                          <p className="font-bold text-sm leading-tight dark:text-white">{item.name}</p>
                          {item.category && <p className="text-[10px] uppercase font-bold opacity-40 dark:text-brand-yellow/60">{item.category}</p>}
                          {item.note && <p className="text-[10px] italic opacity-60 dark:text-white/40">{t.noteLabel}: {item.note}</p>}
                          <p className="text-xs opacity-60 dark:text-white/40">{item.quantity}x {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-black text-sm shrink-0 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-brand-black/20 dark:border-brand-yellow/20 flex justify-between items-center">
                    <span className="font-black uppercase dark:text-brand-yellow/60">{t.totalPayment}</span>
                    <span className="text-xl font-black text-brand-orange">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* QRIS Section */}
                <div className="bg-brand-yellow/20 p-6 rounded-3xl border-2 border-brand-black/10 flex flex-col items-center text-center">
                  <h4 className="font-black uppercase italic text-sm mb-4 dark:text-brand-yellow">{t.qrisPayment}</h4>
                  <div className="bg-white p-4 rounded-2xl border-2 border-brand-black shadow-inner mb-4">
                    <img
                      src="/qris.png"
                      alt="QRIS Pembayaran"
                      className="w-48 h-48 object-contain mx-auto"
                    />
                  </div>

                  <a
                    href="/qris.png"
                    download="QRIS_Martabak_Gresik.png"
                    className="mb-4 bg-brand-black text-white px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 hover:bg-brand-orange transition-colors active:scale-95 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadQris}
                  </a>

                  <p className="text-[10px] font-bold uppercase opacity-60 leading-tight">
                    {t.scanQrisHint}<br />
                    {t.saveProofHint}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white border-t-4 border-brand-black shrink-0">
                <button
                  onClick={() => {
                    sendWhatsAppOrder();
                    setIsOrderConfirmationOpen(false);
                  }}
                  className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform active:scale-95 shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  {t.confirmAndSendWhatsApp}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-brand-orange text-white rounded-full backdrop-blur-md transition-colors z-10 shadow-xl"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={zoomedImage.src} 
                alt={zoomedImage.alt} 
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl shadow-2xl bg-black/50"
              />
              <div className="mt-4 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full text-white font-bold text-center border border-white/10 shadow-lg max-w-full whitespace-normal">
                {zoomedImage.alt}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Map Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapOpen(false)}
              className="fixed inset-0 bg-brand-black/60 backdrop-blur-md z-[1300]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-4xl bg-white dark:bg-brand-black rounded-[2.5rem] border-4 border-brand-black dark:border-brand-yellow z-[1310] overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[70vh]"
            >
              <div className="p-6 bg-brand-black dark:bg-black text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-orange rounded-xl">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic dark:text-brand-yellow">Lokasi Toko</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest dark:text-white/40">{storeAddress}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow bg-zinc-100 dark:bg-zinc-900 relative">
                <iframe
                  title="Martabak Gresik Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(storeAddress + " Martabak Gresik")}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-4 bg-white dark:bg-brand-black border-t-2 border-brand-black/10 dark:border-brand-yellow/10 flex justify-center shrink-0">
                <a
                  href="https://maps.app.goo.gl/hQUez8CW4wTCXYg3A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-black dark:bg-brand-yellow text-white dark:text-brand-black px-8 py-3 rounded-2xl font-black uppercase italic text-sm flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.openInGoogleMaps}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



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
